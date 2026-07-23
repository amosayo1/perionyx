import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ReportConfig, ReportSection, ReportRow } from "../types";

export class CashFlowBuilder {
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

    const cashFlowStatements = await prisma.gLCashFlowStatement.findMany({
      where: { companyId: { in: companyIds }, periodId: { in: periodIds } },
    });

    if (cashFlowStatements.length > 0) {
      return this.buildFromModel(cashFlowStatements, round);
    }

    return this.buildIndirect(companyIds, periods, config, round);
  }

  private static async buildFromModel(
    statements: Array<{
      id: string; companyId: string;
      operatingCashFlow: { toNumber?: () => number } | number;
      investingCashFlow: { toNumber?: () => number } | number;
      financingCashFlow: { toNumber?: () => number } | number;
      netCashFlow: { toNumber?: () => number } | number;
      beginningCash: { toNumber?: () => number } | number;
      endingCash: { toNumber?: () => number } | number;
      freeCashFlow: { toNumber?: () => number } | number;
    }>,
    round: (n: number) => number,
  ): Promise<ReportSection[]> {
    const toNum = (v: { toNumber?: () => number } | number): number =>
      typeof v === "number" ? v : v.toNumber ? v.toNumber() : Number(v);

    const operating = statements.reduce((s, st) => s + toNum(st.operatingCashFlow), 0);
    const investing = statements.reduce((s, st) => s + toNum(st.investingCashFlow), 0);
    const financing = statements.reduce((s, st) => s + toNum(st.financingCashFlow), 0);
    const netChange = statements.reduce((s, st) => s + toNum(st.netCashFlow), 0);
    const beginning = statements.reduce((s, st) => s + toNum(st.beginningCash), 0);
    const ending = statements.reduce((s, st) => s + toNum(st.endingCash), 0);
    const fcf = statements.reduce((s, st) => s + toNum(st.freeCashFlow), 0);

    return await this.buildSections(round, operating, investing, financing, netChange, beginning, ending, fcf);
  }

  private static async buildIndirect(
    companyIds: string[],
    periods: Array<{ id: string; startDate: Date; endDate: Date; companyId: string }>,
    config: ReportConfig,
    round: (n: number) => number,
  ): Promise<ReportSection[]> {
    const periodIds = periods.map((p) => p.id);

    const revenueAccounts = await prisma.gLAccount.findMany({
      where: { companyId: { in: companyIds }, type: "revenue", isActive: true },
      include: { balances: { where: { periodId: { in: periodIds } } } },
    });

    const expenseAccounts = await prisma.gLAccount.findMany({
      where: { companyId: { in: companyIds }, type: "expense", isActive: true },
      include: { balances: { where: { periodId: { in: periodIds } } } },
    });

    const calcBalance = (accs: typeof revenueAccounts): number =>
      accs.reduce((sum, acc) => {
        const bal = acc.balances.reduce((s, b) => s + Number(b.endingBalance), 0);
        return sum + (acc.naturalBalance === "credit" ? bal : -bal);
      }, 0);

    const totalRevenue = calcBalance(revenueAccounts);
    const totalExpense = calcBalance(expenseAccounts);
    const netIncome = totalRevenue - Math.abs(totalExpense);

    const currentAssetAccounts = await prisma.gLAccount.findMany({
      where: { companyId: { in: companyIds }, category: "current-asset", isActive: true },
      include: {
        balances: { where: { periodId: { in: periodIds } } },
      },
    });

    const currentLiabilityAccounts = await prisma.gLAccount.findMany({
      where: { companyId: { in: companyIds }, category: "current-liability", isActive: true },
      include: {
        balances: { where: { periodId: { in: periodIds } } },
      },
    });

    const nonCashAccounts = currentAssetAccounts.filter(
      (a) => !a.name.toLowerCase().includes("cash") && !a.accountNumber.startsWith("101"),
    );
    const changeInReceivables = nonCashAccounts.reduce((s, a) => {
      const bal = a.balances.reduce((b, p) => b + Number(p.endingBalance), 0);
      return s + bal;
    }, 0);

    const changeInPayables = currentLiabilityAccounts.reduce((s, a) => {
      const bal = a.balances.reduce((b, p) => b + Number(p.endingBalance), 0);
      return s + bal;
    }, 0);

    const depreciationAmortization = expenseAccounts
      .filter((a) =>
        a.name.toLowerCase().includes("depreciation") || a.name.toLowerCase().includes("amortization"),
      )
      .reduce((s, a) => s + Math.abs(calcBalance([a])), 0);

    const assetAccounts = await prisma.gLAccount.findMany({
      where: { companyId: { in: companyIds }, type: "asset", isActive: true, category: "non-current-asset" },
    });
    const investingOutflows = assetAccounts.length;

    const equityAccounts = await prisma.gLAccount.findMany({
      where: { companyId: { in: companyIds }, type: "equity", isActive: true },
      include: { balances: { where: { periodId: { in: periodIds } } } },
    });
    const financingFlows = equityAccounts.reduce((s, a) => {
      const bal = a.balances.reduce((b, p) => b + Number(p.endingBalance), 0);
      return s + (a.naturalBalance === "credit" ? bal : -bal);
    }, 0);

    const operatingCashFlow = netIncome + depreciationAmortization - changeInReceivables + changeInPayables;
    const investingCashFlow = -investingOutflows;
    const financingCashFlow = financingFlows;
    const netChange = operatingCashFlow + investingCashFlow + financingCashFlow;
    const beginning = 0;
    const ending = netChange;
    const fcf = operatingCashFlow - investingOutflows;

    return await this.buildSections(round, operatingCashFlow, investingCashFlow, financingCashFlow, netChange, beginning, ending, fcf);
  }

  private static buildSections(
    round: (n: number) => number,
    operating: number,
    investing: number,
    financing: number,
    netChange: number,
    beginning: number,
    ending: number,
    fcf: number,
  ): ReportSection[] {
    const mkRow = (id: string, label: string, amount: number, depth = 0, type: ReportRow["type"] = "account"): ReportRow => ({
      id, label, depth, type, values: { amount: round(amount) },
    });

    return [
      {
        id: "cf-operating",
        title: "Operating Activities",
        subtitle: "Cash flows from operating activities (indirect method)",
        type: "table",
        columns: ["Item", "Amount"],
        rows: [
          mkRow("cf-net-income", "Net Income", operating, 0, "total"),
          { ...mkRow("cf-operating-total", "Net Cash from Operating Activities", operating, 0, "total"), children: [] },
        ],
        totals: { amount: round(operating) },
      },
      {
        id: "cf-investing",
        title: "Investing Activities",
        subtitle: "Cash flows from investing activities",
        type: "table",
        columns: ["Item", "Amount"],
        rows: [
          mkRow("cf-investing-total", "Net Cash from Investing Activities", investing, 0, "total"),
        ],
        totals: { amount: round(investing) },
      },
      {
        id: "cf-financing",
        title: "Financing Activities",
        subtitle: "Cash flows from financing activities",
        type: "table",
        columns: ["Item", "Amount"],
        rows: [
          mkRow("cf-financing-total", "Net Cash from Financing Activities", financing, 0, "total"),
        ],
        totals: { amount: round(financing) },
      },
      {
        id: "cf-summary",
        title: "Cash Flow Summary",
        type: "summary",
        rows: [
          mkRow("cf-operating-sum", "Operating Activities", operating, 0, "subtotal"),
          mkRow("cf-investing-sum", "Investing Activities", investing, 0, "subtotal"),
          mkRow("cf-financing-sum", "Financing Activities", financing, 0, "subtotal"),
          mkRow("cf-net-change", "Net Change in Cash", netChange, 0, "total"),
          mkRow("cf-beginning", "Cash at Beginning of Period", beginning, 0, "account"),
          mkRow("cf-ending", "Cash at End of Period", ending, 0, "total"),
          mkRow("cf-fcf", "Free Cash Flow", fcf, 0, "subtotal"),
        ],
        notes: [
          `Free Cash Flow: ${round(fcf)} (Operating CF − CAPEX)`,
        ],
      },
    ];
  }
}
