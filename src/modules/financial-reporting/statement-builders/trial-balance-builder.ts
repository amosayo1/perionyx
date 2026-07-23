import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ReportConfig, ReportSection, ReportRow } from "../types";

export class TrialBalanceBuilder {
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

    const accounts = await prisma.gLAccount.findMany({
      where: { companyId: { in: companyIds }, isActive: true },
      include: { balances: { where: { periodId: { in: periodIds } } } },
      orderBy: [{ type: "asc" }, { accountNumber: "asc" }],
    });

    let totalDebits = 0;
    let totalCredits = 0;

    const rows: ReportRow[] = accounts.map((acc) => {
      const debitTotal = acc.balances.reduce((s, b) => s + Number(b.periodDebit), 0);
      const creditTotal = acc.balances.reduce((s, b) => s + Number(b.periodCredit), 0);
      const endingBalance = acc.balances.reduce((s, b) => s + Number(b.endingBalance), 0);

      const isDebitBalance = acc.naturalBalance === "debit";
      const balance = isDebitBalance ? endingBalance : -endingBalance;
      const drSide = balance > 0 ? Math.abs(balance) : 0;
      const crSide = balance < 0 ? Math.abs(balance) : 0;

      totalDebits += drSide;
      totalCredits += crSide;

      return {
        id: `tb-${acc.id}`,
        label: `${acc.accountNumber} — ${acc.name}`,
        depth: 0,
        type: "account" as const,
        values: {
          accountCode: acc.accountNumber,
          accountName: acc.name,
          type: acc.type,
          category: acc.category,
          debits: round(drSide || debitTotal),
          credits: round(crSide || creditTotal),
          balance: round(Math.abs(balance)),
          balanceSide: balance >= 0 ? "DR" : "CR",
          naturalBalance: acc.naturalBalance,
        },
      };
    });

    const sections: ReportSection[] = [
      {
        id: "trial-balance",
        title: "Trial Balance",
        subtitle: `For the period ${config.dateRange.start} to ${config.dateRange.end}`,
        type: "table",
        columns: [
          "Account Code",
          "Account Name",
          "Type",
          "Category",
          "Debits",
          "Credits",
          "Balance",
          "DR/CR",
        ],
        rows,
        totals: {
          debits: round(totalDebits),
          credits: round(totalCredits),
        },
        notes: [
          totalDebits === totalCredits
            ? "Trial balance is in balance — total debits equal total credits."
            : `Trial balance is out of balance by ${round(Math.abs(totalDebits - totalCredits))}.`,
        ],
      },
    ];

    return sections;
  }
}
