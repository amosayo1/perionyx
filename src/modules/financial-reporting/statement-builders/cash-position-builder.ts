import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ReportConfig, ReportSection, ReportRow } from "../types";

export class CashPositionBuilder {
  static async build(ctx: TenantContext, config: ReportConfig): Promise<ReportSection[]> {
    const { companyId } = ctx;
    const { dateRange, currency: reportCurrency, entityIds, rounding } = config;

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
      orderBy: { currency: "asc" },
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

    const forecasts = await prisma.treasuryCashForecast.findMany({
      where: {
        companyId,
        ...entityFilter,
        generatedAt: {
          gte: new Date(dateRange.start),
          lte: new Date(dateRange.end),
        },
      },
      orderBy: { validTo: "asc" },
    });

    const walletBalances = await prisma.ledgerEntry.groupBy({
      by: ["walletId", "currency"],
      where: {
        companyId,
        createdAt: {
          gte: new Date(dateRange.start),
          lte: new Date(dateRange.end),
        },
      },
      _sum: { amount: true },
    });

    const cashMovements = await prisma.treasuryCashMovement.findMany({
      where: {
        companyId,
        ...entityFilter,
        requestedAt: {
          gte: new Date(dateRange.start),
          lte: new Date(dateRange.end),
        },
      },
    });

    const currencyTotals = new Map<
      string,
      { total: number; available: number; ledger: number; bank: number; float: number; restricted: number }
    >();

    for (const cp of cashPositions) {
      const existing = currencyTotals.get(cp.currency) ?? {
        total: 0,
        available: 0,
        ledger: 0,
        bank: 0,
        float: 0,
        restricted: 0,
      };
      existing.total += Number(cp.totalBalance);
      existing.available += Number(cp.availableBalance);
      existing.ledger += Number(cp.ledgerBalance);
      existing.bank += Number(cp.bankBalance);
      existing.float += Number(cp.floatBalance);
      if (cp.classification === "RESTRICTED") {
        existing.restricted += Number(cp.totalBalance);
      }
      currencyTotals.set(cp.currency, existing);
    }

    for (const wb of walletBalances) {
      const existing = currencyTotals.get(wb.currency) ?? {
        total: 0,
        available: 0,
        ledger: 0,
        bank: 0,
        float: 0,
        restricted: 0,
      };
      const walletVal = Number(wb._sum.amount ?? 0);
      existing.total += Math.abs(walletVal);
      existing.ledger += Math.abs(walletVal);
      currencyTotals.set(wb.currency, existing);
    }

    const entityTotals = new Map<string, { total: number; available: number }>();
    for (const cp of cashPositions) {
      const existing = entityTotals.get(cp.legalEntityId) ?? { total: 0, available: 0 };
      existing.total += Number(cp.totalBalance);
      existing.available += Number(cp.availableBalance);
      entityTotals.set(cp.legalEntityId, existing);
    }

    const byCurrencySection: ReportSection = {
      id: `${companyId}-cp-by-currency`,
      title: "Cash by Currency",
      type: "table",
      columns: ["total", "available", "ledger", "bank", "float"],
      rows:
        currencyTotals.size > 0
          ? [...currencyTotals].map(([ccy, vals]) => ({
              id: `${companyId}-cp-ccy-${ccy}`,
              label: ccy,
              depth: 0,
              type: "account" as const,
              values: {
                total: round(vals.total),
                available: round(vals.available),
                ledger: round(vals.ledger),
                bank: round(vals.bank),
                float: round(vals.float),
              },
            }))
          : [
              {
                id: `${companyId}-cp-ccy-empty`,
                label: "No cash position data",
                depth: 0,
                type: "note" as const,
                values: {},
              },
            ],
      totals: {
        total: round([...currencyTotals.values()].reduce((s, v) => s + v.total, 0)),
        available: round([...currencyTotals.values()].reduce((s, v) => s + v.available, 0)),
      },
    };

    const byEntitySection: ReportSection = {
      id: `${companyId}-cp-by-entity`,
      title: "Cash by Entity",
      type: "table",
      columns: ["total", "available"],
      rows:
        entityTotals.size > 0
          ? [...entityTotals].map(([entityId, vals]) => ({
              id: `${companyId}-cp-ent-${entityId}`,
              label: entityId,
              depth: 0,
              type: "account" as const,
              values: {
                total: round(vals.total),
                available: round(vals.available),
              },
            }))
          : [
              {
                id: `${companyId}-cp-ent-empty`,
                label: "No entity data",
                depth: 0,
                type: "note" as const,
                values: {},
              },
            ],
    };

    let operatingTotal = 0;
    let reservedTotal = 0;

    for (const cp of cashPositions) {
      if (cp.classification === "OPERATING" || cp.classification === "UNRESTRICTED") {
        operatingTotal += Number(cp.totalBalance);
      } else {
        reservedTotal += Number(cp.totalBalance);
      }
    }

    const operatingVsReservedSection: ReportSection = {
      id: `${companyId}-cp-op-vs-reserved`,
      title: "Operating vs Reserved Cash",
      type: "table",
      columns: ["amount", "percentage"],
      rows: [
        {
          id: `${companyId}-cp-operating`,
          label: "Operating / Unrestricted",
          depth: 0,
          type: "account",
          values: { amount: round(operatingTotal) },
        },
        {
          id: `${companyId}-cp-reserved`,
          label: "Reserved / Restricted",
          depth: 0,
          type: "account",
          values: { amount: round(reservedTotal) },
        },
        {
          id: `${companyId}-cp-total-cash`,
          label: "Total Cash",
          depth: 0,
          type: "total",
          values: { amount: round(operatingTotal + reservedTotal) },
        },
      ],
      totals: { amount: round(operatingTotal + reservedTotal) },
      notes:
        reservedTotal > 0
          ? [`${round((reservedTotal / (operatingTotal + reservedTotal)) * 100)}% of cash is restricted`]
          : undefined,
    };

    const forecastSection: ReportSection = {
      id: `${companyId}-cp-forecast`,
      title: "Cash Forecast",
      type: "table",
      columns: ["currency", "netPrediction", "opening", "closing", "minProjected", "maxProjected", "confidence"],
      rows:
        forecasts.length > 0
          ? forecasts.map((fc) => ({
              id: `${companyId}-cp-fc-${fc.id}`,
              label: fc.legalEntityId,
              depth: 0,
              type: "account" as const,
              values: {
                currency: fc.currency,
                netPrediction: round(Number(fc.netPrediction)),
                opening: round(Number(fc.openingBalance)),
                closing: round(Number(fc.closingBalance)),
                minProjected: round(Number(fc.minimumProjectedBalance)),
                maxProjected: round(Number(fc.maximumProjectedBalance)),
                confidence: fc.confidence,
              },
              sourceReferences: fc.keyRisks.length > 0 || fc.keyAssumptions.length > 0
                ? [
                    ...(fc.keyRisks.length > 0
                      ? [
                          {
                            id: `${fc.id}-risk`,
                            type: "journal-entry" as const,
                            number: "",
                            date: fc.generatedAt.toISOString(),
                            amount: Number(fc.netPrediction),
                            description: `Key risks: ${fc.keyRisks.join("; ")}`,
                          },
                        ]
                      : []),
                  ]
                : undefined,
            }))
          : [
              {
                id: `${companyId}-cp-fc-empty`,
                label: "No forecast data available",
                depth: 0,
                type: "note" as const,
                values: {},
              },
            ],
      totals: {
        netPrediction: round(forecasts.reduce((s, f) => s + Number(f.netPrediction), 0)),
        closing: round(forecasts.reduce((s, f) => s + Number(f.closingBalance), 0)),
      },
      notes: forecasts
        .filter((f) => Number(f.minimumProjectedBalance) < 0)
        .map((f) => `⚠ ${f.legalEntityId}: projected balance falls below zero (${round(Number(f.minimumProjectedBalance))})`),
    };

    const sections: ReportSection[] = [
      byCurrencySection,
      byEntitySection,
      operatingVsReservedSection,
      forecastSection,
    ];

    if (config.includeAiCommentary) {
      const totalCash = [...currencyTotals.values()].reduce((s, v) => s + v.total, 0);
      const totalInflow = cashMovements
        .filter((m) => m.fundingType === "INFLOW")
        .reduce((s, m) => s + Number(m.amount), 0);
      const totalOutflow = cashMovements
        .filter((m) => m.fundingType === "OUTFLOW")
        .reduce((s, m) => s + Number(m.amount), 0);

      sections.unshift({
        id: `${companyId}-cp-header`,
        title: "Cash Position Report",
        subtitle: `${dateRange.start} to ${dateRange.end} | ${reportCurrency || "All Currencies"}`,
        type: "header",
        rows: [],
        notes: [
          `Total cash: ${round(totalCash)}`,
          `Operating: ${round(operatingTotal)} | Reserved: ${round(reservedTotal)}`,
          ...(totalInflow > 0 || totalOutflow > 0
            ? [`Inflows: ${round(totalInflow)} | Outflows: ${round(totalOutflow)}`]
            : []),
        ],
      });
    }

    return sections;
  }
}
