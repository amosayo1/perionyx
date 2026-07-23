import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ReportConfig, ReportSection, ReportRow } from "../types";

export class TreasuryReportBuilder {
  static async build(ctx: TenantContext, config: ReportConfig): Promise<ReportSection[]> {
    const { companyId } = ctx;
    const { dateRange, entityIds, rounding } = config;

    const entityFilter = entityIds.length > 0 ? { legalEntityId: { in: entityIds } } : {};

    const round = (v: number) => (rounding > 0 ? Math.round(v / rounding) * rounding : Math.round(v * 100) / 100);

    const cashPositions = await prisma.treasuryCashPosition.findMany({
      where: {
        companyId,
        ...entityFilter,
        recordedAt: {
          gte: new Date(dateRange.start),
          lte: new Date(dateRange.end),
        },
      },
      orderBy: { recordedAt: "desc" },
    });

    const liquidityPositions = await prisma.treasuryLiquidityPosition.findMany({
      where: {
        companyId,
        ...entityFilter,
        lastCalculatedAt: {
          gte: new Date(dateRange.start),
          lte: new Date(dateRange.end),
        },
      },
    });

    const cashPools = await prisma.treasuryCashPool.findMany({
      where: { companyId },
    });

    const workingCapital = await prisma.treasuryWorkingCapital.findMany({
      where: {
        companyId,
        ...entityFilter,
      },
      orderBy: { calculatedAt: "desc" },
      take: 1,
    });

    const fundingRequests = await prisma.treasuryFundingRequest.findMany({
      where: {
        companyId,
        ...entityFilter,
        requiredByDate: {
          gte: new Date(dateRange.start),
          lte: new Date(dateRange.end),
        },
      },
      orderBy: { requiredByDate: "asc" },
    });

    const currencyTotals = new Map<string, { total: number; available: number; ledger: number }>();
    for (const cp of cashPositions) {
      const existing = currencyTotals.get(cp.currency) ?? { total: 0, available: 0, ledger: 0 };
      existing.total += Number(cp.totalBalance);
      existing.available += Number(cp.availableBalance);
      existing.ledger += Number(cp.ledgerBalance);
      currencyTotals.set(cp.currency, existing);
    }

    const cashPosRows: ReportRow[] = [];
    for (const [currency, vals] of currencyTotals) {
      cashPosRows.push({
        id: `${companyId}-tr-cash-${currency}`,
        label: currency,
        depth: 0,
        type: "account",
        values: {
          total: round(vals.total),
          available: round(vals.available),
          ledger: round(vals.ledger),
        },
      });
    }

    const cashSection: ReportSection = {
      id: `${companyId}-tr-cash-position`,
      title: "Cash Position Summary",
      type: "table",
      columns: ["total", "available", "ledger"],
      rows: cashPosRows.length > 0 ? cashPosRows : [
        {
          id: `${companyId}-tr-cash-empty`,
          label: "No cash position data",
          depth: 0,
          type: "note",
          values: {},
        },
      ],
      totals: {
        total: round([...currencyTotals.values()].reduce((s, v) => s + v.total, 0)),
        available: round([...currencyTotals.values()].reduce((s, v) => s + v.available, 0)),
      },
    };

    const liquidityRows: ReportRow[] = [];
    const catTotals = new Map<string, number>();

    for (const lp of liquidityPositions) {
      const amt = Number(lp.amount);
      catTotals.set(lp.category, (catTotals.get(lp.category) ?? 0) + amt);
    }

    for (const [cat, amt] of catTotals) {
      liquidityRows.push({
        id: `${companyId}-tr-liq-${cat}`,
        label: cat,
        depth: 0,
        type: "account",
        values: { amount: round(amt) },
      });
    }

    const liquiditySection: ReportSection = {
      id: `${companyId}-tr-liquidity`,
      title: "Liquidity Overview",
      type: "table",
      columns: ["amount"],
      rows: liquidityRows.length > 0 ? liquidityRows : [
        {
          id: `${companyId}-tr-liq-empty`,
          label: "No liquidity data",
          depth: 0,
          type: "note",
          values: {},
        },
      ],
      totals: {
        amount: round([...catTotals.values()].reduce((s, v) => s + v, 0)),
      },
    };

    const poolRows: ReportRow[] = [];
    let poolTotalBal = 0;

    for (const pool of cashPools) {
      const bal = Number(pool.totalBalance);
      poolTotalBal += bal;
      poolRows.push({
        id: `${companyId}-tr-pool-${pool.id}`,
        label: `${pool.name} (${pool.currency})`,
        depth: 0,
        type: "account",
        values: {
          total: round(Number(pool.totalBalance)),
          available: round(Number(pool.availableBalance)),
          utilization: pool.currentUtilization,
        },
      });
    }

    const poolSection: ReportSection = {
      id: `${companyId}-tr-pools`,
      title: "Cash Pool Summary",
      type: "table",
      columns: ["total", "available", "utilization"],
      rows: poolRows.length > 0 ? poolRows : [
        {
          id: `${companyId}-tr-pool-empty`,
          label: "No pools configured",
          depth: 0,
          type: "note",
          values: {},
        },
      ],
      totals: { total: round(poolTotalBal) },
    };

    const wcRow: ReportRow | null = workingCapital.length > 0
      ? {
          id: `${companyId}-tr-wc`,
          label: "Working Capital",
          depth: 0,
          type: "account",
          values: {
            currentAssets: round(Number(workingCapital[0].currentAssets)),
            currentLiabilities: round(Number(workingCapital[0].currentLiabilities)),
            netWorkingCapital: round(Number(workingCapital[0].netWorkingCapital)),
            currentRatio: workingCapital[0].currentRatio,
            quickRatio: workingCapital[0].quickRatio,
          },
        }
      : null;

    const wcSection: ReportSection = {
      id: `${companyId}-tr-working-capital`,
      title: "Working Capital",
      type: "table",
      columns: ["currentAssets", "currentLiabilities", "netWorkingCapital", "currentRatio", "quickRatio"],
      rows: wcRow ? [wcRow] : [
        {
          id: `${companyId}-tr-wc-empty`,
          label: "No working capital data",
          depth: 0,
          type: "note",
          values: {},
        },
      ],
    };

    const frRows: ReportRow[] = [];
    let totalRequested = 0;
    let totalApproved = 0;

    for (const fr of fundingRequests) {
      const reqAmt = Number(fr.requestedAmount);
      const appAmt = fr.approvedAmount ? Number(fr.approvedAmount) : 0;
      totalRequested += reqAmt;
      totalApproved += appAmt;

      frRows.push({
        id: `${companyId}-tr-fr-${fr.id}`,
        label: `Funding: ${fr.fundingType} — ${fr.reason}`,
        depth: 0,
        type: "account",
        values: {
          requested: round(reqAmt),
          approved: round(appAmt),
          currency: fr.currency,
          status: fr.status,
        },
        sourceReferences: [
          {
            id: fr.id,
            type: "payment",
            number: "",
            date: fr.requiredByDate.toISOString(),
            amount: reqAmt,
            description: fr.reason,
          },
        ],
      });
    }

    const frSection: ReportSection = {
      id: `${companyId}-tr-funding`,
      title: "Funding Requirements",
      columns: ["requested", "approved", "status"],
      type: "table",
      rows: frRows.length > 0 ? frRows : [
        {
          id: `${companyId}-tr-fr-empty`,
          label: "No funding requests",
          depth: 0,
          type: "note",
          values: {},
        },
      ],
      totals: { requested: round(totalRequested), approved: round(totalApproved) },
      notes: totalRequested > 0 ? [`Total outstanding: ${round(totalRequested)}`] : [],
    };

    const sections: ReportSection[] = [
      cashSection,
      liquiditySection,
      poolSection,
      wcSection,
      frSection,
    ];

    if (config.includeAiCommentary) {
      const totalCash = [...currencyTotals.values()].reduce((s, v) => s + v.total, 0);
      sections.unshift({
        id: `${companyId}-tr-header`,
        title: "Treasury Report",
        subtitle: `${dateRange.start} to ${dateRange.end}`,
        type: "header",
        rows: [],
        notes: [
          `Total Cash Position: ${round(totalCash)}`,
          `Active Pools: ${cashPools.length}`,
          `Pending Funding Requests: ${fundingRequests.length}`,
        ],
      });
    }

    return sections;
  }
}
