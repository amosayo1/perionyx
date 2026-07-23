import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ReportConfig, ReportSection, ReportRow } from "../types";

export class EquityStatementBuilder {
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

    const priorPeriod = period
      ? await prisma.gLAccountingPeriod.findFirst({
          where: {
            companyId,
            endDate: { lt: period.startDate },
            fiscalYear: period.fiscalYear,
          },
          orderBy: { endDate: "desc" },
        })
      : null;

    const retainedEarnings = await prisma.gLRetainedEarnings.findFirst({
      where: {
        companyId,
        ...(period ? { periodId: period.id } : {}),
        ...(dateRange.fiscalYear ? { fiscalYear: dateRange.fiscalYear } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    const priorRetainedEarnings = priorPeriod
      ? await prisma.gLRetainedEarnings.findFirst({
          where: { companyId, periodId: priorPeriod.id },
          orderBy: { createdAt: "desc" },
        })
      : null;

    const netIncomeAccounts = await prisma.gLAccount.findMany({
      where: { companyId, category: "INCOME", isActive: true },
    });

    const incomeAccountIds = netIncomeAccounts.map((a) => a.id);
    const balances = incomeAccountIds.length > 0 && period
      ? await prisma.gLAccountBalance.findMany({
          where: { accountId: { in: incomeAccountIds }, periodId: period.id, companyId },
        })
      : [];

    const netIncome = balances.reduce(
      (sum, b) => sum + Number(b.endingBalance) - Number(b.beginningBalance),
      0,
    );

    const priorBalances = incomeAccountIds.length > 0 && priorPeriod
      ? await prisma.gLAccountBalance.findMany({
          where: { accountId: { in: incomeAccountIds }, periodId: priorPeriod.id, companyId },
        })
      : [];

    const priorNetIncome = priorBalances.reduce(
      (sum, b) => sum + Number(b.endingBalance) - Number(b.beginningBalance),
      0,
    );

    const round = (v: number) => (rounding > 0 ? Math.round(v / rounding) * rounding : Math.round(v * 100) / 100);

    const be = retainedEarnings ? Number(retainedEarnings.beginningRetainedEarnings) : 0;
    const ni = netIncome;
    const div = retainedEarnings ? Number(retainedEarnings.dividends) : 0;
    const oci = 0;
    const capContrib = 0;
    const ee = retainedEarnings ? Number(retainedEarnings.endingRetainedEarnings) : be + ni - div + oci + capContrib;

    const priorBe = priorRetainedEarnings ? Number(priorRetainedEarnings.beginningRetainedEarnings) : 0;
    const priorNi = priorNetIncome;
    const priorDiv = priorRetainedEarnings ? Number(priorRetainedEarnings.dividends) : 0;
    const priorOci = 0;
    const priorCapContrib = 0;
    const priorEe = priorRetainedEarnings
      ? Number(priorRetainedEarnings.endingRetainedEarnings)
      : priorBe + priorNi - priorDiv + priorOci + priorCapContrib;

    const row = (
      id: string,
      label: string,
      depth: number,
      type: ReportRow["type"],
      current: number,
      prior: number,
    ): ReportRow => ({
      id: `${companyId}-equity-${id}`,
      label,
      depth,
      type,
      values: { current: round(current) },
      priorValues: { current: round(prior) },
      variance: { current: round(current - prior) },
      variancePercent: prior !== 0 ? { current: round(((current - prior) / prior) * 100) } : { current: 0 },
    });

    const retainedSection: ReportSection = {
      id: `${companyId}-equity-retained`,
      title: "Retained Earnings Roll-forward",
      type: "table",
      columns: ["current", "prior", "variance", "variancePercent"],
      rows: [
        row("beginning-re", "Beginning Retained Earnings", 0, "account", be, priorBe),
        row("net-income", "Net Income", 1, "account", ni, priorNi),
        row("dividends", "Dividends", 1, "account", -div, -priorDiv),
        row("oci", "Other Comprehensive Income", 1, "account", oci, priorOci),
        row("capital-contributions", "Capital Contributions", 1, "account", capContrib, priorCapContrib),
        row("ending-re", "Ending Retained Earnings", 0, "total", ee, priorEe),
      ],
      totals: { current: round(ee) },
    };

    const otherSection: ReportSection = {
      id: `${companyId}-equity-other`,
      title: "Other Equity Components",
      type: "table",
      columns: ["current", "prior"],
      rows: [
        {
          id: `${companyId}-equity-common-stock`,
          label: "Common Stock",
          depth: 0,
          type: "account",
          values: { current: 0 },
          priorValues: { current: 0 },
        },
        {
          id: `${companyId}-equity-additional-paid-in`,
          label: "Additional Paid-in Capital",
          depth: 0,
          type: "account",
          values: { current: 0 },
          priorValues: { current: 0 },
        },
        {
          id: `${companyId}-equity-treasury-shares`,
          label: "Treasury Shares",
          depth: 0,
          type: "account",
          values: { current: 0 },
          priorValues: { current: 0 },
        },
        {
          id: `${companyId}-equity-total-equity`,
          label: "Total Equity",
          depth: 0,
          type: "total",
          values: { current: round(ee) },
          priorValues: { current: round(priorEe) },
        },
      ],
    };

    const sections: ReportSection[] = [retainedSection, otherSection];

    if (config.includeAiCommentary) {
      sections.unshift({
        id: `${companyId}-equity-summary`,
        title: "Equity Statement Summary",
        type: "header",
        rows: [],
        notes: [
          `Equity ${be >= 0 ? "increased" : "decreased"} from ${round(be)} to ${round(ee)}.`,
          ...(div > 0 ? [`Dividends of ${round(div)} paid during the period.`] : []),
        ],
      });
    }

    return sections;
  }
}
