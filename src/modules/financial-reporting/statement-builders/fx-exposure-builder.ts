import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { ReportConfig, ReportSection, ReportRow } from "../types";

export class FxExposureBuilder {
  static async build(ctx: TenantContext, config: ReportConfig): Promise<ReportSection[]> {
    const { companyId } = ctx;
    const { dateRange, currency, entityIds, rounding } = config;

    const entityFilter = entityIds.length > 0 ? { legalEntityId: { in: entityIds } } : {};

    const exposures = await prisma.treasuryFXExposure.findMany({
      where: { companyId, ...entityFilter },
    });

    const round = (v: number) => (rounding > 0 ? Math.round(v / rounding) * rounding : Math.round(v * 100) / 100);

    const exchangeRates = await prisma.gLExchangeRate.findMany({
      where: {
        companyId,
        ...(currency ? { toCurrency: currency } : {}),
        date: {
          gte: new Date(dateRange.start),
          lte: new Date(dateRange.end),
        },
      },
      orderBy: { date: "desc" },
    });

    const spotRates = await prisma.gLExchangeRate.findMany({
      where: {
        companyId,
        ...(currency ? { toCurrency: currency } : {}),
        rateType: "spot",
      },
      orderBy: { date: "desc" },
      take: exposures.length || 1,
    });

    const rateMap = new Map<string, { currentRate: number; previousRate: number }>();
    for (const er of exchangeRates) {
      const key = `${er.fromCurrency}-${er.toCurrency}`;
      if (!rateMap.has(key)) {
        rateMap.set(key, {
          currentRate: Number(er.rate),
          previousRate: Number(er.rate),
        });
      }
    }

    for (const sr of spotRates) {
      const key = `${sr.fromCurrency}-${sr.toCurrency}`;
      if (!rateMap.has(key)) {
        rateMap.set(key, {
          currentRate: Number(sr.rate),
          previousRate: Number(sr.rate),
        });
      }
    }

    const rows: ReportRow[] = [];
    let totalLong = 0;
    let totalShort = 0;
    let totalNetExposure = 0;
    let totalUnrealizedPnl = 0;

    const sourceCurrencySet = new Set(exposures.map((e) => e.sourceCurrency));

    for (const srcCurrency of sourceCurrencySet) {
      const currencyExposures = exposures.filter((e) => e.sourceCurrency === srcCurrency);

      let longPos = 0;
      let shortPos = 0;
      let netExposureLocal = 0;

      for (const exp of currencyExposures) {
        const amt = Number(exp.exposureAmount);
        if (exp.exposureDirection === "LONG") {
          longPos += amt;
        } else {
          shortPos += amt;
        }
        netExposureLocal += exp.exposureDirection === "LONG" ? amt : -amt;
      }

      const netExposure = netExposureLocal;

      const rateKey = `${srcCurrency}-${currency || "USD"}`;
      const rateInfo = rateMap.get(rateKey);
      const currentRate = rateInfo?.currentRate ?? 1;
      const previousRate = rateInfo?.previousRate ?? 1;
      const rateChange = currentRate !== 0 ? ((currentRate - previousRate) / previousRate) * 100 : 0;

      const previousRateValue = rateInfo?.previousRate ?? 1;
      const unrealizedPnl = netExposure * (currentRate - previousRateValue);

      const exposureInReportingCurrency = netExposure * currentRate;

      totalLong += longPos;
      totalShort += shortPos;
      totalNetExposure += netExposure;
      totalUnrealizedPnl += unrealizedPnl;

      const firstExp = currencyExposures[0];

      rows.push({
        id: `${companyId}-fx-${srcCurrency}`,
        label: srcCurrency,
        depth: 0,
        type: "account",
        values: {
          longPosition: round(longPos),
          shortPosition: round(shortPos),
          netExposure: round(netExposure),
          currentRate: round(currentRate),
          rateChange: round(rateChange),
          exposureInReportingCurrency: round(exposureInReportingCurrency),
        },
        variance: { unrealizedPnl: round(unrealizedPnl) },
        sourceReferences: firstExp
          ? [
              {
                id: firstExp.id,
                type: "journal-entry",
                number: "",
                date: firstExp.createdAt.toISOString(),
                amount: netExposure,
                description: `${srcCurrency} FX exposure`,
              },
            ]
          : undefined,
      });
    }

    rows.push({
      id: `${companyId}-fx-total`,
      label: "Total Exposure",
      depth: 0,
      type: "total",
      values: {
        longPosition: round(totalLong),
        shortPosition: round(totalShort),
        netExposure: round(totalNetExposure),
        exposureInReportingCurrency: round(totalNetExposure * 1),
      },
      variance: { unrealizedPnl: round(totalUnrealizedPnl) },
    });

    const sections: ReportSection[] = [];

    if (config.includeAiCommentary) {
      sections.push({
        id: `${companyId}-fx-header`,
        title: "Foreign Exchange Exposure Report",
        subtitle: `Reporting currency: ${currency || "USD"} | ${dateRange.start} to ${dateRange.end}`,
        type: "header",
        rows: [],
        notes: [
          `Total long positions: ${round(totalLong)}`,
          `Total short positions: ${round(totalShort)}`,
          `Net exposure: ${round(totalNetExposure)}`,
          `Unrealized P&L: ${round(totalUnrealizedPnl)}`,
        ],
      });
    }

    sections.push({
      id: `${companyId}-fx-exposures`,
      title: "FX Exposures",
      type: "table",
      columns: [
        "longPosition",
        "shortPosition",
        "netExposure",
        "currentRate",
        "rateChange",
        "exposureInReportingCurrency",
      ],
      rows,
      totals: {
        netExposure: round(totalNetExposure),
        unrealizedPnl: round(totalUnrealizedPnl),
      },
      notes: exposures.some((e) => e.breachLimit)
        ? [`⚠ ${exposures.filter((e) => e.breachLimit).length} exposure(s) exceed policy limits`]
        : undefined,
    });

    return sections;
  }
}
