import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ReportConfig, ReportSection, ReportRow } from "../types";

export class BudgetVsActualBuilder {
  static async build(ctx: TenantContext, config: ReportConfig): Promise<ReportSection[]> {
    const { companyId } = ctx;
    const { dateRange, rounding } = config;

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

    const accounts = await prisma.gLAccount.findMany({
      where: { companyId, isActive: true },
    });

    const accountMap = new Map(accounts.map((a) => [a.id, a]));

    const balances = period
      ? await prisma.gLAccountBalance.findMany({
          where: { companyId, periodId: period.id },
        })
      : [];

    const revenueAccounts = accounts.filter(
      (a) => a.category === "INCOME" || a.type === "REVENUE",
    );
    const expenseAccounts = accounts.filter(
      (a) => a.category === "EXPENSE" || a.type === "EXPENSE",
    );

    const revenueBalances = balances.filter((b) =>
      revenueAccounts.some((a) => a.id === b.accountId),
    );
    const expenseBalances = balances.filter((b) =>
      expenseAccounts.some((a) => a.id === b.accountId),
    );

    const calcActual = (accs: typeof accounts, bals: typeof balances) =>
      accs.reduce((sum, a) => {
        const b = bals.find((bl) => bl.accountId === a.id);
        return sum + (b ? Number(b.endingBalance) - Number(b.beginningBalance) : 0);
      }, 0);

    const actualRevenue = calcActual(revenueAccounts, revenueBalances);
    const actualExpense = calcActual(expenseAccounts, expenseBalances);

    const allocationRuns = await prisma.gLAllocationRun.findMany({
      where: { companyId, ...(period ? { periodId: period.id } : {}) },
      include: { rule: true },
    });

    let budgetRevenue = 0;
    let budgetExpense = 0;

    for (const run of allocationRuns) {
      const entries = run.entries as Array<{ accountId: string; amount: number }>;
      for (const entry of entries) {
        const acct = accountMap.get(entry.accountId);
        if (acct?.category === "INCOME" || acct?.type === "REVENUE") {
          budgetRevenue += entry.amount;
        } else if (acct?.category === "EXPENSE" || acct?.type === "EXPENSE") {
          budgetExpense += entry.amount;
        }
      }
    }

    if (allocationRuns.length === 0) {
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

      for (const snap of budgetSnapshots) {
        if (snap.label?.toLowerCase().includes("revenue")) {
          budgetRevenue += Number(snap.value);
        } else if (snap.label?.toLowerCase().includes("expense")) {
          budgetExpense += Number(snap.value);
        }
      }
    }

    const round = (v: number) => (rounding > 0 ? Math.round(v / rounding) * rounding : Math.round(v * 100) / 100);

    const detailRow = (
      id: string,
      label: string,
      depth: number,
      type: ReportRow["type"],
      actual: number,
      budget: number,
    ): ReportRow => ({
      id: `${companyId}-bva-${id}`,
      label,
      depth,
      type,
      values: { actual: round(actual), budget: round(budget) },
      variance: { actual: round(actual - budget) },
      variancePercent: budget !== 0 ? { actual: round(((actual - budget) / budget) * 100) } : { actual: 0 },
      sourceReferences: [],
    });

    const revenueSection: ReportSection = {
      id: `${companyId}-bva-revenue`,
      title: "Revenue — Budget vs Actual",
      type: "table",
      columns: ["actual", "budget", "variance", "variancePercent"],
      rows: [
        detailRow("total-revenue", "Total Revenue", 0, "total", actualRevenue, budgetRevenue),
        ...revenueAccounts.map((a, i) => {
          const b = revenueBalances.find((bl) => bl.accountId === a.id);
          const act = b ? Number(b.endingBalance) - Number(b.beginningBalance) : 0;
          return detailRow(`revenue-${a.id}`, `${a.accountNumber} - ${a.name}`, 1, "account", act, 0);
        }),
      ],
      totals: { actual: round(actualRevenue), budget: round(budgetRevenue) },
    };

    const expenseSection: ReportSection = {
      id: `${companyId}-bva-expense`,
      title: "Expenses — Budget vs Actual",
      type: "table",
      columns: ["actual", "budget", "variance", "variancePercent"],
      rows: [
        detailRow("total-expense", "Total Expenses", 0, "total", actualExpense, budgetExpense),
        ...expenseAccounts.map((a, i) => {
          const b = expenseBalances.find((bl) => bl.accountId === a.id);
          const act = b ? Number(b.endingBalance) - Number(b.beginningBalance) : 0;
          return detailRow(`expense-${a.id}`, `${a.accountNumber} - ${a.name}`, 1, "account", act, 0);
        }),
      ],
      totals: { actual: round(actualExpense), budget: round(budgetExpense) },
    };

    const netIncome = actualRevenue - actualExpense;
    const netBudget = budgetRevenue - budgetExpense;

    const varianceSection: ReportSection = {
      id: `${companyId}-bva-variance`,
      title: "Variance Analysis",
      type: "table",
      columns: ["actual", "budget", "variance", "variancePercent"],
      rows: [
        detailRow("net-income", "Net Income", 0, "subtotal", netIncome, netBudget),
        {
          id: `${companyId}-bva-variance-pct`,
          label: "Variance Percentage",
          depth: 0,
          type: "note",
          values: {
            revenue:
              budgetRevenue !== 0
                ? round(((actualRevenue - budgetRevenue) / budgetRevenue) * 100)
                : 0,
            expense:
              budgetExpense !== 0
                ? round(((actualExpense - budgetExpense) / budgetExpense) * 100)
                : 0,
          },
        },
      ],
      notes: [
        `Revenue variance: ${budgetRevenue !== 0 ? round(((actualRevenue - budgetRevenue) / budgetRevenue) * 100) : 0}%`,
        `Expense variance: ${budgetExpense !== 0 ? round(((actualExpense - budgetExpense) / budgetExpense) * 100) : 0}%`,
        `Net income variance: ${netBudget !== 0 ? round(((netIncome - netBudget) / netBudget) * 100) : 0}%`,
      ],
    };

    const sections: ReportSection[] = [revenueSection, expenseSection, varianceSection];

    if (config.includeAiCommentary) {
      sections.unshift({
        id: `${companyId}-bva-header`,
        title: "Budget vs Actual",
        subtitle: `Period: ${dateRange.start} to ${dateRange.end}`,
        type: "header",
        rows: [],
        notes: [
          `Revenue: Actual ${round(actualRevenue)} vs Budget ${round(budgetRevenue)}`,
          `Expenses: Actual ${round(actualExpense)} vs Budget ${round(budgetExpense)}`,
        ],
      });
    }

    return sections;
  }
}
