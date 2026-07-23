import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ReportConfig, ReportSection, ReportRow } from "../types";

export class CostCenterBuilder {
  static async build(ctx: TenantContext, config: ReportConfig): Promise<ReportSection[]> {
    const { companyId } = ctx;
    const { dateRange, rounding } = config;

    const costCenters = config.costCenterIds.length > 0
      ? await prisma.gLCostCenter.findMany({
          where: { id: { in: config.costCenterIds }, companyId, isActive: true },
        })
      : await prisma.gLCostCenter.findMany({
          where: { companyId, isActive: true },
        });

    const ccMap = new Map(costCenters.map((cc) => [cc.id, cc]));
    const ccIds = costCenters.map((cc) => cc.id);

    const expenseAccounts = await prisma.gLAccount.findMany({
      where: { companyId, category: "EXPENSE", isActive: true },
    });

    const expenseAccountIds = expenseAccounts.map((a) => a.id);

    const entries = await prisma.gLJournalEntry.findMany({
      where: {
        companyId,
        accountId: { in: expenseAccountIds },
        costCenterId: { in: ccIds },
        journal: {
          postingDate: {
            gte: new Date(dateRange.start),
            lte: new Date(dateRange.end),
          },
        },
      },
      include: {
        account: true,
        journal: true,
      },
    });

    const budgetSnapshots = await prisma.intelligenceSnapshot.findMany({
      where: {
        companyId,
        metric: { contains: "budget" },
        takenAt: {
          gte: new Date(dateRange.start),
          lte: new Date(dateRange.end),
        },
      },
    });

    const categoryGroups = new Map<string, Array<{ id: string; name: string }>>();
    for (const cc of costCenters) {
      const cat = cc.department ?? "Uncategorized";
      if (!categoryGroups.has(cat)) categoryGroups.set(cat, []);
      categoryGroups.get(cat)!.push({ id: cc.id, name: cc.name });
    }

    const round = (v: number) => (rounding > 0 ? Math.round(v / rounding) * rounding : Math.round(v * 100) / 100);

    const sections: ReportSection[] = [];

    if (config.includeAiCommentary) {
      sections.push({
        id: `${companyId}-cost-center-header`,
        title: "Cost Center Expense Report",
        subtitle: `${dateRange.start} to ${dateRange.end}`,
        type: "header",
        rows: [],
      });
    }

    for (const [category, centers] of categoryGroups) {
      const rows: ReportRow[] = [];

      let categoryTotal = 0;

      for (const center of centers) {
        const centerEntries = entries.filter((e) => e.costCenterId === center.id);

        if (centerEntries.length === 0 && !config.showZeroBalances) continue;

        const accountTotals = new Map<string, number>();
        let ccTotal = 0;

        for (const entry of centerEntries) {
          const amount = Math.abs(Number(entry.debit) - Number(entry.credit));
          ccTotal += amount;
          accountTotals.set(entry.accountId, (accountTotals.get(entry.accountId) ?? 0) + amount);
        }

        if (ccTotal === 0 && !config.showZeroBalances) continue;

        const budgetEntry = budgetSnapshots.find(
          (s) => s.label?.toLowerCase().includes(center.name.toLowerCase()),
        );
        const budgetVal = budgetEntry ? Number(budgetEntry.value) : 0;

        rows.push({
          id: `${companyId}-cc-${center.id}-header`,
          label: center.name,
          depth: 0,
          type: "section-header",
          values: { current: 0 },
        });

        for (const [acctId, val] of accountTotals) {
          const acct = expenseAccounts.find((a) => a.id === acctId);
          rows.push({
            id: `${companyId}-cc-${center.id}-acct-${acctId}`,
            label: acct ? `${acct.accountNumber} - ${acct.name}` : acctId,
            depth: 1,
            type: "account",
            values: { current: round(val) },
          });
        }

        rows.push({
          id: `${companyId}-cc-${center.id}-total`,
          label: `Total — ${center.name}`,
          depth: 0,
          type: "subtotal",
          values: { current: round(ccTotal), budget: round(budgetVal) },
          variance: budgetVal !== 0 ? { current: round(ccTotal - budgetVal) } : undefined,
          variancePercent:
            budgetVal !== 0 ? { current: round(((ccTotal - budgetVal) / budgetVal) * 100) } : undefined,
        });

        categoryTotal += ccTotal;
      }

      if (rows.length === 0) continue;

      rows.push({
        id: `${companyId}-cc-cat-${category}-total`,
        label: `Total — ${category}`,
        depth: 0,
        type: "total",
        values: { current: round(categoryTotal) },
      });

      sections.push({
        id: `${companyId}-cc-cat-${category}`,
        title: category,
        type: "table",
        columns: ["current"],
        rows,
        totals: { current: round(categoryTotal) },
      });
    }

    return sections;
  }
}
