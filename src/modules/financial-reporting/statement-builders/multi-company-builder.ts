import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { Prisma } from "@prisma/client";
import type { ReportConfig, ReportSection, ReportRow } from "../types";

type GLBalanceRow = Prisma.GLAccountBalanceGetPayload<{ include: { account: true } }>;

export class MultiCompanyBuilder {
  static async build(ctx: TenantContext, config: ReportConfig): Promise<ReportSection[]> {
    const { companyId } = ctx;
    const { dateRange, rounding } = config;

    const targetIds = config.companyIds.length > 0 ? config.companyIds : [companyId];

    const companies = await prisma.company.findMany({
      where: { id: { in: targetIds } },
    });

    const companyLabels = new Map(companies.map((c) => [c.id, `${c.name} (${c.slug})`]));
    const targetCurrencies = new Map(companies.map((c) => [c.id, c.baseCurrency ?? config.currency]));

    const period = await prisma.gLAccountingPeriod.findFirst({
      where: {
        companyId,
        startDate: { lte: new Date(dateRange.end) },
        endDate: { gte: new Date(dateRange.start) },
        ...(dateRange.period ? { period: dateRange.period } : {}),
        ...(dateRange.fiscalYear ? { fiscalYear: dateRange.fiscalYear } : {}),
      },
      orderBy: { endDate: "desc" },
    });

    const columns = targetIds.map((id) => companyLabels.get(id) ?? id);

    const catAccounts = await Promise.all(
      ["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"].map((cat) =>
        prisma.gLAccount.findMany({
          where: { companyId, category: cat, isActive: true },
          select: { id: true, accountNumber: true, name: true, category: true, type: true },
        }),
      ),
    );

    const [assetAccounts, liabilityAccounts, equityAccounts, incomeAccounts, expenseAccounts] = catAccounts;

    // Batch: single query for all target companies (Phase 28.1 F-10)
    const balancesByCompany = new Map<string, GLBalanceRow[]>();
    if (period) {
      const allBalances = await prisma.gLAccountBalance.findMany({
        where: { companyId: { in: targetIds }, periodId: period.id },
        include: { account: true },
      });
      for (const b of allBalances) {
        const list = balancesByCompany.get(b.companyId) ?? [];
        list.push(b);
        balancesByCompany.set(b.companyId, list);
      }
    }

    const accountById = new Map(
      [...assetAccounts, ...liabilityAccounts, ...equityAccounts, ...incomeAccounts, ...expenseAccounts].map((a) => [a.id, a]),
    );

    const companyAccounts = new Map<string, Map<string, number>>();

    for (const cid of targetIds) {
      const balances = balancesByCompany.get(cid) ?? [];

      const totalByCategory = new Map<string, number>();

      for (const b of balances) {
        const acct = accountById.get(b.accountId);
        if (acct) {
          const cat = acct.category;
          const endingVal = Number(b.endingBalance);
          totalByCategory.set(cat, (totalByCategory.get(cat) ?? 0) + endingVal);
        }
      }

      companyAccounts.set(cid, totalByCategory);
    }

    const round = (v: number) => (rounding > 0 ? Math.round(v / rounding) * rounding : Math.round(v * 100) / 100);

    const buildRow = (
      id: string,
      label: string,
      depth: number,
      type: ReportRow["type"],
      byCategory: (cc: Map<string, number>) => number,
    ): ReportRow => {
      const values: Record<string, number | string> = {};
      for (const cid of targetIds) {
        const cc = companyAccounts.get(cid) ?? new Map();
        values[cid] = round(byCategory(cc));
      }
      return { id: `${companyId}-mc-${id}`, label, depth, type, values };
    };

    const summaryRows: ReportRow[] = [
      buildRow("assets", "Total Assets", 0, "account", (cc) => cc.get("ASSET") ?? 0),
      buildRow("liabilities", "Total Liabilities", 0, "account", (cc) => cc.get("LIABILITY") ?? 0),
      buildRow("equity", "Total Equity", 0, "account", (cc) => cc.get("EQUITY") ?? 0),
      buildRow("revenue", "Total Revenue", 0, "account", (cc) => {
        const income = cc.get("INCOME") ?? 0;
        const revenue = cc.get("REVENUE") ?? 0;
        return income + revenue;
      }),
      buildRow("expenses", "Total Expenses", 0, "account", (cc) => cc.get("EXPENSE") ?? 0),
      buildRow("net-income", "Net Income", 0, "total", (cc) => {
        const income = cc.get("INCOME") ?? 0;
        const revenue = cc.get("REVENUE") ?? 0;
        const expense = cc.get("EXPENSE") ?? 0;
        return income + revenue - expense;
      }),
    ];

    const statement: ReportSection = {
      id: `${companyId}-mc-summary`,
      title: "Multi-Company Financial Comparison",
      subtitle: `Period: ${dateRange.start} to ${dateRange.end}`,
      type: "table",
      columns,
      rows: summaryRows,
    };

    const detailStatements: ReportSection[] = [];

    for (const cid of targetIds) {
      const label = companyLabels.get(cid) ?? cid;
      const currency = targetCurrencies.get(cid) ?? config.currency;

      const balances = balancesByCompany.get(cid) ?? [];

      const balanceRows: ReportRow[] = [];

      for (const cat of ["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"] as const) {
        const catBalances = balances.filter((b) => b.account.category === cat);
        if (catBalances.length === 0) continue;

        balanceRows.push({
          id: `${companyId}-mc-${cid}-${cat.toLowerCase()}-hdr`,
          label: cat.charAt(0) + cat.slice(1).toLowerCase(),
          depth: 0,
          type: "section-header",
          values: { amount: 0 },
        });

        let catTotal = 0;
        for (const b of catBalances) {
          const val = Number(b.endingBalance);
          catTotal += val;
          balanceRows.push({
            id: `${companyId}-mc-${cid}-${b.accountId}`,
            label: `${b.account.accountNumber} - ${b.account.name}`,
            depth: 1,
            type: "account",
            values: { amount: round(val) },
          });
        }

        balanceRows.push({
          id: `${companyId}-mc-${cid}-${cat.toLowerCase()}-total`,
          label: `Total ${cat.charAt(0) + cat.slice(1).toLowerCase()}`,
          depth: 0,
          type: "subtotal",
          values: { amount: round(catTotal) },
        });
      }

      detailStatements.push({
        id: `${companyId}-mc-detail-${cid}`,
        title: `${label} (${currency})`,
        type: "table",
        columns: ["amount"],
        rows: balanceRows,
      });
    }

    return [statement, ...detailStatements];
  }
}
