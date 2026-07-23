// ─────────────────────────────────────────────────────────────
// Enterprise Treasury Specialist — FX Exposure Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { FXExposureSummary } from "./types";

export class FXExposureService {
  /**
   * Get the FX exposure summary from TreasuryFXExposure records and
   * the latest FXExposureAnalysis.
   */
  static async getFXExposure(
    ctx: TenantContext,
  ): Promise<FXExposureSummary> {
    const [exposures, latestAnalysis] = await Promise.all([
      prisma.treasuryFXExposure.findMany({
        where: { companyId: ctx.companyId },
      }),
      prisma.fXExposureAnalysis.findFirst({
        where: { companyId: ctx.companyId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    if (latestAnalysis) {
      return {
        totalExposure: latestAnalysis.totalExposure,
        netOpenPosition: latestAnalysis.netOpenPosition,
        hedgedExposure: latestAnalysis.hedgedExposure,
        unhedgedExposure: latestAnalysis.unhedgedExposure,
        exposureByCurrency: (latestAnalysis.exposureByCurrency as unknown as Record<string, Prisma.Decimal>) ?? {},
        exposureByRegion: (latestAnalysis.exposureByRegion as unknown as Record<string, Prisma.Decimal>) ?? {},
        concentrationScore: latestAnalysis.concentrationScore,
        riskScore: latestAnalysis.riskScore,
      };
    }

    // Fallback: compute from raw exposures
    const totalExposure = exposures.reduce(
      (sum, e) => sum.add(e.exposureAmount),
      new Prisma.Decimal(0),
    );

    const hedgedExposure = exposures
      .filter((e) => e.hedgeStatus === "hedged")
      .reduce(
        (sum, e) => sum.add(e.exposureAmount),
        new Prisma.Decimal(0),
      );

    const unhedgedExposure = totalExposure.sub(hedgedExposure);

    const netOpenPosition = exposures.reduce(
      (sum, e) =>
        e.exposureDirection === "long"
          ? sum.add(e.exposureAmount)
          : sum.sub(e.exposureAmount),
      new Prisma.Decimal(0),
    );

    const exposureByCurrency = this.groupByCurrency(exposures);
    const exposureByRegion = this.groupByLegalEntity(exposures);

    return {
      totalExposure,
      netOpenPosition,
      hedgedExposure,
      unhedgedExposure,
      exposureByCurrency,
      exposureByRegion,
      concentrationScore: this.computeConcentrationScore(exposureByCurrency),
      riskScore: this.computeFXRiskScore(
        totalExposure,
        unhedgedExposure,
        netOpenPosition,
      ),
    };
  }

  /**
   * Get FX exposures grouped by source currency.
   */
  static async getExposureByCurrency(
    ctx: TenantContext,
  ): Promise<Record<string, Prisma.Decimal>> {
    const exposures = await prisma.treasuryFXExposure.findMany({
      where: { companyId: ctx.companyId },
    });

    return this.groupByCurrency(exposures);
  }

  /**
   * Get FX exposures grouped by legal entity (as region proxy).
   */
  static async getExposureByRegion(
    ctx: TenantContext,
  ): Promise<Record<string, Prisma.Decimal>> {
    const exposures = await prisma.treasuryFXExposure.findMany({
      where: { companyId: ctx.companyId },
    });

    return this.groupByLegalEntity(exposures);
  }

  /**
   * Compute the net open FX position across all exposures.
   */
  static async getNetOpenPosition(
    ctx: TenantContext,
  ): Promise<Prisma.Decimal> {
    const exposures = await prisma.treasuryFXExposure.findMany({
      where: { companyId: ctx.companyId },
    });

    return exposures.reduce(
      (sum, e) =>
        e.exposureDirection === "long"
          ? sum.add(e.exposureAmount)
          : sum.sub(e.exposureAmount),
      new Prisma.Decimal(0),
    );
  }

  /**
   * Identify unhedged exposures that represent hedging opportunities.
   */
  static async getHedgingOpportunities(
    ctx: TenantContext,
  ) {
    return prisma.treasuryFXExposure.findMany({
      where: {
        companyId: ctx.companyId,
        hedgeStatus: { in: ["unhedged", "partially_hedged"] },
      },
      orderBy: { exposureAmount: "desc" },
    });
  }

  /**
   * Get FX recommendations from the latest FXExposureAnalysis.
   */
  static async getFXRecommendations(
    ctx: TenantContext,
    limit: number = 20,
  ) {
    const latestAnalysis = await prisma.fXExposureAnalysis.findFirst({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
    });

    if (!latestAnalysis) {
      return [];
    }

    return prisma.fXRecommendation.findMany({
      where: {
        companyId: ctx.companyId,
        exposureId: latestAnalysis.id,
      },
      orderBy: { confidence: "desc" },
      take: limit,
    });
  }

  /**
   * Create a new FX exposure analysis snapshot.
   */
  static async createExposureAnalysis(
    ctx: TenantContext,
  ) {
    const summary = await this.getFXExposure(ctx);
    const hedgingOpps = await this.getHedgingOpportunities(ctx);

    const volatilityScore = this.computeVolatilityScore(
      summary.totalExposure,
      summary.unhedgedExposure,
    );

    return prisma.fXExposureAnalysis.create({
      data: {
        companyId: ctx.companyId,
        analysisDate: new Date(),
        totalExposure: summary.totalExposure,
        netOpenPosition: summary.netOpenPosition,
        hedgedExposure: summary.hedgedExposure,
        unhedgedExposure: summary.unhedgedExposure,
        exposureByCurrency: summary.exposureByCurrency as unknown as Prisma.InputJsonValue,
        exposureByRegion: summary.exposureByRegion as unknown as Prisma.InputJsonValue,
        concentrationScore: summary.concentrationScore,
        riskScore: summary.riskScore,
        volatilityScore,
        hedgingOpportunities: hedgingOpps.map((h) => ({
          id: h.id,
          currency: h.sourceCurrency,
          amount: h.exposureAmount.toString(),
          direction: h.exposureDirection,
        })) as unknown as Prisma.InputJsonValue,
        recommendations: [] as unknown as Prisma.InputJsonValue,
        metadata: {} as unknown as Prisma.InputJsonValue,
      },
    });
  }

  // ─── Internal Helpers ──────────────────────────────────────

  private static groupByCurrency(
    exposures: Array<{
      sourceCurrency: string;
      exposureAmount: Prisma.Decimal;
    }>,
  ): Record<string, Prisma.Decimal> {
    const result: Record<string, Prisma.Decimal> = {};

    for (const e of exposures) {
      result[e.sourceCurrency] = (result[e.sourceCurrency] ?? new Prisma.Decimal(0)).add(
        e.exposureAmount,
      );
    }

    return result;
  }

  private static groupByLegalEntity(
    exposures: Array<{
      legalEntityId: string;
      exposureAmount: Prisma.Decimal;
    }>,
  ): Record<string, Prisma.Decimal> {
    const result: Record<string, Prisma.Decimal> = {};

    for (const e of exposures) {
      const key = e.legalEntityId ?? "unknown";
      result[key] = (result[key] ?? new Prisma.Decimal(0)).add(
        e.exposureAmount,
      );
    }

    return result;
  }

  private static computeConcentrationScore(
    distribution: Record<string, Prisma.Decimal>,
  ): Prisma.Decimal {
    const values = Object.values(distribution);
    const total = values.reduce(
      (sum, v) => sum.add(v),
      new Prisma.Decimal(0),
    );

    if (total.isZero()) return new Prisma.Decimal(0);

    let hhi = new Prisma.Decimal(0);

    for (const value of values) {
      const share = value.div(total);
      hhi = hhi.add(share.mul(share));
    }

    return hhi.toDecimalPlaces(4);
  }

  private static computeFXRiskScore(
    totalExposure: Prisma.Decimal,
    unhedgedExposure: Prisma.Decimal,
    netOpenPosition: Prisma.Decimal,
  ): Prisma.Decimal {
    if (totalExposure.isZero()) return new Prisma.Decimal(0);

    const unhedgedRatio = unhedgedExposure.div(totalExposure);
    const netPositionRatio = netOpenPosition.abs().div(totalExposure);

    // Risk = 60% unhedged ratio + 40% net position concentration
    const score = unhedgedRatio.mul(0.6).add(netPositionRatio.mul(0.4));

    const clamped = score.toDecimalPlaces(4);
    return clamped.lt(0) ? new Prisma.Decimal(0) : clamped.gt(1) ? new Prisma.Decimal(1) : clamped;
  }

  private static computeVolatilityScore(
    totalExposure: Prisma.Decimal,
    unhedgedExposure: Prisma.Decimal,
  ): Prisma.Decimal {
    if (totalExposure.isZero()) return new Prisma.Decimal(0);

    // Volatility proxy: higher unhedged exposure = higher volatility risk
    const ratio = unhedgedExposure.div(totalExposure);
    const clamped = ratio.mul(0.8).toDecimalPlaces(4);
    return clamped.lt(0) ? new Prisma.Decimal(0) : clamped.gt(1) ? new Prisma.Decimal(1) : clamped;
  }
}
