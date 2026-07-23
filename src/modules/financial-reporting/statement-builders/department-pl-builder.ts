import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ReportConfig, ReportSection, ReportRow } from "../types";

export class DepartmentPLBuilder {
  static async build(ctx: TenantContext, config: ReportConfig): Promise<ReportSection[]> {
    const { companyId } = ctx;
    const { dateRange, rounding, groupBy } = config;

    const revenueAccounts = await prisma.gLAccount.findMany({
      where: { companyId, category: "INCOME", isActive: true },
    });

    const expenseAccounts = await prisma.gLAccount.findMany({
      where: { companyId, category: "EXPENSE", isActive: true },
    });

    const allAccountIds = [...revenueAccounts, ...expenseAccounts].map((a) => a.id);

    const entries = await prisma.gLJournalEntry.findMany({
      where: {
        companyId,
        accountId: { in: allAccountIds },
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

    const groupField = groupBy.includes("businessUnit") ? "businessUnitId" : "profitCenterId";

    const activeDeptIds = [...new Set(entries.map((e) => e[groupField as keyof typeof e] as string).filter(Boolean))];

    let profitCenters: Array<{ id: string; name: string; code: string }> = [];
    let businessUnits: Array<{ id: string; name: string; code: string }> = [];

    if (groupField === "profitCenterId" && activeDeptIds.length > 0) {
      profitCenters = await prisma.gLProfitCenter.findMany({
        where: { id: { in: activeDeptIds }, companyId },
      });
    } else if (activeDeptIds.length > 0) {
      businessUnits = await prisma.gLBusinessUnit.findMany({
        where: { id: { in: activeDeptIds }, companyId },
      });
    }

    const entityMap = new Map<string, string>();
    for (const pc of profitCenters) entityMap.set(pc.id, `${pc.code} - ${pc.name}`);
    for (const bu of businessUnits) entityMap.set(bu.id, `${bu.code} - ${bu.name}`);

    const deptEntries = new Map<string, typeof entries>();
    for (const entry of entries) {
      const deptId = (entry[groupField as keyof typeof entry] as string) ?? "unassigned";
      if (!deptEntries.has(deptId)) deptEntries.set(deptId, []);
      deptEntries.get(deptId)!.push(entry);
    }

    const round = (v: number) => (rounding > 0 ? Math.round(v / rounding) * rounding : Math.round(v * 100) / 100);

    const sections: ReportSection[] = [];

    if (config.includeAiCommentary) {
      sections.push({
        id: `${companyId}-dept-pl-header`,
        title: "Department Profit & Loss",
        subtitle: `${dateRange.start} to ${dateRange.end}`,
        type: "header",
        rows: [],
      });
    }

    for (const [deptId, deptEntriesList] of deptEntries) {
      const deptLabel = entityMap.get(deptId) ?? deptId;

      let deptRevenue = 0;
      let deptExpense = 0;
      const revAccountTotals = new Map<string, number>();
      const expAccountTotals = new Map<string, number>();

      for (const entry of deptEntriesList) {
        const amount = Number(entry.debit) - Number(entry.credit);
        const absAmount = Math.abs(amount);
        if (entry.account.category === "INCOME") {
          deptRevenue += absAmount;
          revAccountTotals.set(
            entry.accountId,
            (revAccountTotals.get(entry.accountId) ?? 0) + absAmount,
          );
        } else {
          deptExpense += absAmount;
          expAccountTotals.set(
            entry.accountId,
            (expAccountTotals.get(entry.accountId) ?? 0) + absAmount,
          );
        }
      }

      const rows: ReportRow[] = [
        {
          id: `${companyId}-dept-${deptId}-revenue-hdr`,
          label: "Revenue",
          depth: 0,
          type: "section-header",
          values: { current: 0 },
        },
        ...[...revAccountTotals].map(([acctId, val]) => {
          const acct = revenueAccounts.find((a) => a.id === acctId);
          return {
            id: `${companyId}-dept-${deptId}-rev-${acctId}`,
            label: acct ? `${acct.accountNumber} - ${acct.name}` : acctId,
            depth: 1,
            type: "account" as const,
            values: { current: round(val) },
          };
        }),
        {
          id: `${companyId}-dept-${deptId}-total-rev`,
          label: "Total Revenue",
          depth: 0,
          type: "subtotal",
          values: { current: round(deptRevenue) },
        },
        {
          id: `${companyId}-dept-${deptId}-exp-hdr`,
          label: "Expenses",
          depth: 0,
          type: "section-header",
          values: { current: 0 },
        },
        ...[...expAccountTotals].map(([acctId, val]) => {
          const acct = expenseAccounts.find((a) => a.id === acctId);
          return {
            id: `${companyId}-dept-${deptId}-exp-${acctId}`,
            label: acct ? `${acct.accountNumber} - ${acct.name}` : acctId,
            depth: 1,
            type: "account" as const,
            values: { current: round(val) },
          };
        }),
        {
          id: `${companyId}-dept-${deptId}-total-exp`,
          label: "Total Expenses",
          depth: 0,
          type: "subtotal",
          values: { current: round(deptExpense) },
        },
        {
          id: `${companyId}-dept-${deptId}-net`,
          label: "Net Income / Loss",
          depth: 0,
          type: "total",
          values: { current: round(deptRevenue - deptExpense) },
        },
      ];

      sections.push({
        id: `${companyId}-dept-${deptId}`,
        title: deptLabel,
        type: "table",
        columns: ["current"],
        rows,
        totals: { current: round(deptRevenue - deptExpense) },
      });
    }

    return sections;
  }
}
