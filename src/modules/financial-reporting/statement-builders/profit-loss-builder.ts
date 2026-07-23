import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ReportConfig, ReportSection, ReportRow } from "../types";

export class ProfitLossBuilder {
  static async build(ctx: TenantContext, config: ReportConfig): Promise<ReportSection[]> {
    const startDate = new Date(config.dateRange.start);
    const endDate = new Date(config.dateRange.end);
    const companyIds = config.companyIds.length ? config.companyIds : [ctx.companyId];
    const round = (n: number) => Math.round(n * 10 ** config.rounding) / 10 ** config.rounding;

    const periods = await prisma.gLAccountingPeriod.findMany({
      where: {
        companyId: { in: companyIds },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      orderBy: { startDate: "asc" },
    });
    const periodIds = periods.map((p) => p.id);

    const incomeStatements = await prisma.gLIncomeStatement.findMany({
      where: { companyId: { in: companyIds }, periodId: { in: periodIds } },
    });

    if (incomeStatements.length > 0) {
      return this.buildFromModel(incomeStatements, companyIds, config, round);
    }

    return this.buildFromAccounts(companyIds, periodIds, config, round);
  }

  private static async buildFromModel(
    statements: Array<{
      id: string; companyId: string; totalRevenue: { toNumber?: () => number } | number;
      totalExpense: { toNumber?: () => number } | number;
      grossProfit: { toNumber?: () => number } | number;
      operatingIncome: { toNumber?: () => number } | number;
      netIncome: { toNumber?: () => number } | number;
      ebitda: { toNumber?: () => number } | number;
      ebit: { toNumber?: () => number } | number;
      costOfGoodsSold: { toNumber?: () => number } | number;
      operatingExpenses: { toNumber?: () => number } | number;
    }>,
    _companyIds: string[],
    config: ReportConfig,
    round: (n: number) => number,
  ): Promise<ReportSection[]> {
    const toNum = (v: { toNumber?: () => number } | number): number =>
      typeof v === "number" ? v : v.toNumber ? v.toNumber() : Number(v);

    const revenue = statements.reduce((s, st) => s + toNum(st.totalRevenue), 0);
    const expense = statements.reduce((s, st) => s + toNum(st.totalExpense), 0);
    const grossProfit = statements.reduce((s, st) => s + toNum(st.grossProfit), 0);
    const operatingIncome = statements.reduce((s, st) => s + toNum(st.operatingIncome), 0);
    const netIncome = statements.reduce((s, st) => s + toNum(st.netIncome), 0);
    const ebitda = statements.reduce((s, st) => s + toNum(st.ebitda), 0);
    const ebit = statements.reduce((s, st) => s + toNum(st.ebit), 0);
    const cogs = statements.reduce((s, st) => s + toNum(st.costOfGoodsSold), 0);
    const opExpenses = statements.reduce((s, st) => s + toNum(st.operatingExpenses), 0);

    const sections: ReportSection[] = [
      {
        id: "pl-revenue",
        title: "Revenue",
        type: "table",
        rows: [
          { id: "pl-total-revenue", label: "Total Revenue", depth: 0, type: "total", values: { amount: round(revenue) } },
        ],
        columns: ["Account", "Amount"],
        totals: { amount: round(revenue) },
      },
      {
        id: "pl-cogs",
        title: "Cost of Goods Sold",
        type: "table",
        rows: [
          { id: "pl-total-cogs", label: "Total Cost of Goods Sold", depth: 0, type: "total", values: { amount: round(cogs) } },
        ],
        columns: ["Account", "Amount"],
        totals: { amount: round(cogs) },
      },
      {
        id: "pl-gross-profit",
        title: "Gross Profit",
        type: "summary",
        rows: [
          { id: "pl-total-gross-profit", label: "Gross Profit", depth: 0, type: "total", values: { amount: round(grossProfit) } },
        ],
      },
      {
        id: "pl-operating-expenses",
        title: "Operating Expenses",
        type: "table",
        rows: [
          { id: "pl-total-op-expenses", label: "Total Operating Expenses", depth: 0, type: "total", values: { amount: round(opExpenses) } },
        ],
        totals: { amount: round(opExpenses) },
      },
      {
        id: "pl-operating-income",
        title: "Operating Income",
        type: "summary",
        rows: [
          { id: "pl-total-ebit", label: "EBIT", depth: 0, type: "subtotal", values: { amount: round(ebit) } },
          { id: "pl-total-ebitda", label: "EBITDA", depth: 0, type: "subtotal", values: { amount: round(ebitda) } },
        ],
      },
      {
        id: "pl-net-income",
        title: "Net Income",
        type: "summary",
        rows: [
          { id: "pl-total-net-income", label: "Net Income", depth: 0, type: "total", values: { amount: round(netIncome) } },
        ],
      },
    ];

    return sections;
  }

  private static async buildFromAccounts(
    companyIds: string[],
    periodIds: string[],
    config: ReportConfig,
    round: (n: number) => number,
  ): Promise<ReportSection[]> {
    const accounts = await prisma.gLAccount.findMany({
      where: { companyId: { in: companyIds }, type: { in: ["revenue", "expense"] }, isActive: true },
      include: { balances: { where: { periodId: { in: periodIds } } } },
      orderBy: [{ type: "asc" }, { accountNumber: "asc" }],
    });

    const revenueAccounts = accounts.filter((a) => a.type === "revenue");
    const expenseAccounts = accounts.filter((a) => a.type === "expense");

    const totalForAccounts = (accs: typeof accounts): number =>
      accs.reduce((sum, acc) => {
        const bal = acc.balances.reduce((s, b) => {
          const amt = Number(b.endingBalance);
          return acc.naturalBalance === "credit" ? s + amt : s - amt;
        }, 0);
        return sum + (acc.naturalBalance === "credit" ? bal : -bal);
      }, 0);

    const totalRevenue = totalForAccounts(revenueAccounts);
    const totalExpense = totalForAccounts(expenseAccounts);

    const revenueRow: ReportRow = {
      id: "pl-revenue-total",
      label: "Total Revenue",
      depth: 0,
      type: "total",
      values: { amount: round(totalRevenue) },
      children: revenueAccounts.map((a) => ({
        id: `pl-revenue-${a.id}`,
        label: a.name,
        depth: 1,
        type: "account" as const,
        values: { amount: round(totalForAccounts([a])) },
      })),
    };

    const expenseRow: ReportRow = {
      id: "pl-expense-total",
      label: "Total Expenses",
      depth: 0,
      type: "total",
      values: { amount: round(totalExpense) },
      children: expenseAccounts.map((a) => ({
        id: `pl-expense-${a.id}`,
        label: a.name,
        depth: 1,
        type: "account" as const,
        values: { amount: round(totalForAccounts([a])) },
      })),
    };

    const grossProfit = totalRevenue;
    const operatingExpenses = expenseAccounts
      .filter((a) => !a.category?.toLowerCase().includes("cogs") && !a.category?.toLowerCase().includes("cost of goods"))
      .reduce((s, a) => s + Math.abs(totalForAccounts([a])), 0);
    const cogs = Math.abs(totalExpense) - operatingExpenses;
    const operatingIncome = grossProfit - operatingExpenses;
    const netIncome = grossProfit - Math.abs(totalExpense);

    const sections: ReportSection[] = [
      {
        id: "pl-revenue",
        title: "Revenue",
        type: "table",
        rows: [revenueRow],
        columns: ["Account", "Amount"],
        totals: { amount: round(totalRevenue) },
      },
      {
        id: "pl-cogs",
        title: "Cost of Goods Sold",
        type: "table",
        rows: [
          { id: "pl-cogs-total", label: "Cost of Goods Sold", depth: 0, type: "total", values: { amount: round(cogs) } },
        ],
        totals: { amount: round(cogs) },
      },
      {
        id: "pl-gross-profit",
        title: "Gross Profit",
        type: "summary",
        rows: [
          { id: "pl-gp-total", label: "Gross Profit", depth: 0, type: "total", values: { amount: round(grossProfit) } },
        ],
      },
      {
        id: "pl-operating-expenses",
        title: "Operating Expenses",
        type: "table",
        rows: [{
          id: "pl-op-ex-total", label: "Total Operating Expenses", depth: 0, type: "total",
          values: { amount: round(operatingExpenses) },
        }],
        totals: { amount: round(operatingExpenses) },
      },
      {
        id: "pl-operating-income",
        title: "Operating Income",
        type: "summary",
        rows: [
          { id: "pl-oi-total", label: "Operating Income", depth: 0, type: "subtotal", values: { amount: round(operatingIncome) } },
        ],
      },
      {
        id: "pl-net-income",
        title: "Net Income",
        type: "summary",
        rows: [
          { id: "pl-ni-total", label: "Net Income", depth: 0, type: "total", values: { amount: round(netIncome) } },
        ],
        notes: [`EBIT: ${round(operatingIncome)} | EBITDA: ${round(operatingIncome)} (depreciation/amortization data not available from GLAccount balances)`],
      },
    ];

    return sections;
  }
}
