import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ReportConfig, ReportSection, ReportRow } from "../types";

export class ChartOfAccountsBuilder {
  static async build(ctx: TenantContext, config: ReportConfig): Promise<ReportSection[]> {
    const companyIds = config.companyIds.length ? config.companyIds : [ctx.companyId];
    const round = (n: number) => Math.round(n * 10 ** config.rounding) / 10 ** config.rounding;

    const startDate = new Date(config.dateRange.start);
    const endDate = new Date(config.dateRange.end);

    const periods = await prisma.gLAccountingPeriod.findMany({
      where: {
        companyId: { in: companyIds },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      orderBy: { endDate: "desc" },
      take: 1,
    });
    const latestPeriodId = periods[0]?.id;

    const accounts = await prisma.gLAccount.findMany({
      where: { companyId: { in: companyIds } },
      include: {
        balances: latestPeriodId ? { where: { periodId: latestPeriodId } } : false,
        children: { select: { id: true, accountNumber: true, name: true, type: true, category: true, naturalBalance: true, isActive: true } },
      },
      orderBy: [{ type: "asc" }, { accountNumber: "asc" }],
    });

    const topLevel = accounts.filter((a) => !a.parentId);
    const children = accounts.filter((a) => a.parentId);

    const balanceForAccount = (accId: string): number => {
      const acc = accounts.find((a) => a.id === accId);
      if (!acc || !("balances" in acc) || !acc.balances) return 0;
      const bals = acc.balances as Array<{ endingBalance: { toNumber?: () => number } | number }>;
      return bals.reduce((s, b) => {
        const v = typeof b.endingBalance === "number" ? b.endingBalance : (b.endingBalance as { toNumber: () => number }).toNumber?.() ?? Number(b.endingBalance);
        return s + v;
      }, 0);
    };

    const buildAccountRow = (acc: typeof accounts[number], depth: number): ReportRow => {
      const childRows = children
        .filter((c) => c.parentId === acc.id)
        .map((c) => {
          const bal = balanceForAccount(c.id);
          return {
            id: `coa-${c.id}`,
            label: `${c.accountNumber} — ${c.name}`,
            depth: depth + 1,
            type: "account" as const,
            values: {
              accountCode: c.accountNumber,
              accountName: c.name,
              type: c.type,
              category: c.category,
              naturalBalance: c.naturalBalance,
              isActive: c.isActive ? "Yes" : "No",
              currentBalance: round(bal),
            },
          };
        });

      const ownBal = balanceForAccount(acc.id);
      const childBal = childRows.reduce((s, r) => s + (Number(r.values.currentBalance) || 0), 0);
      const totalBal = ownBal + childBal;

      return {
        id: `coa-${acc.id}`,
        label: `${acc.accountNumber} — ${acc.name}`,
        depth,
        type: childRows.length ? "section-header" : "account",
        values: {
          accountCode: acc.accountNumber,
          accountName: acc.name,
          type: acc.type,
          category: acc.category,
          naturalBalance: acc.naturalBalance,
          isActive: acc.isActive ? "Yes" : "No",
          currentBalance: round(totalBal),
        },
        children: childRows.length ? childRows : undefined,
      };
    };

    const rows: ReportRow[] = topLevel.map((acc) => buildAccountRow(acc, 0));

    const sections: ReportSection[] = [
      {
        id: "chart-of-accounts",
        title: "Chart of Accounts",
        subtitle: `Complete account hierarchy — ${accounts.length} accounts`,
        type: "table",
        columns: [
          "Account Code",
          "Account Name",
          "Type",
          "Category",
          "Natural Balance",
          "Active",
          "Current Balance",
        ],
        rows,
        notes: [
          `${topLevel.length} parent accounts, ${children.length} sub-accounts`,
        ],
      },
    ];

    return sections;
  }
}
