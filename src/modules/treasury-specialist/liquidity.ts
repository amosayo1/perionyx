// ─────────────────────────────────────────────────────────────
// Enterprise Treasury Specialist — Liquidity Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { LiquiditySummary, LiquidityHorizon, ScenarioType } from "./types";

export class LiquidityService {
  /**
   * Get the current liquidity position from TreasuryLiquidityPosition and TreasuryWorkingCapital.
   */
  static async getLiquidityPosition(
    ctx: TenantContext,
  ): Promise<LiquiditySummary> {
    const [liquidityPositions, workingCapital, latestForecast] =
      await Promise.all([
        prisma.treasuryLiquidityPosition.findMany({
          where: { companyId: ctx.companyId },
        }),
        prisma.treasuryWorkingCapital.findMany({
          where: { companyId: ctx.companyId },
          orderBy: { calculatedAt: "desc" },
          take: 1,
        }),
        prisma.liquidityForecast.findFirst({
          where: { companyId: ctx.companyId },
          orderBy: { createdAt: "desc" },
        }),
      ]);

    const currentLiquidity = liquidityPositions.reduce(
      (sum, p) => sum.add(p.amount),
      new Prisma.Decimal(0),
    );

    const latestWorkingCapital = workingCapital[0];

    const workingCapitalAmount = latestWorkingCapital
      ? latestWorkingCapital.netWorkingCapital
      : new Prisma.Decimal(0);

    const burnRate = latestForecast
      ? latestForecast.burnRate
      : new Prisma.Decimal(0);

    const daysOfRunway =
      burnRate.isZero() || currentLiquidity.isZero()
        ? 0
        : currentLiquidity.div(burnRate).toNumber();

    const liquidityScore = latestForecast
      ? latestForecast.liquidityScore
      : new Prisma.Decimal(0);

    const riskScore = latestForecast
      ? latestForecast.riskScore
      : new Prisma.Decimal(0);

    return {
      currentLiquidity,
      forecastLiquidity: latestForecast
        ? latestForecast.forecastLiquidity
        : new Prisma.Decimal(0),
      burnRate,
      daysOfRunway,
      workingCapital: workingCapitalAmount,
      liquidityScore,
      riskScore,
    };
  }

  /**
   * Get liquidity forecast for a given horizon.
   */
  static async getLiquidityForecast(
    ctx: TenantContext,
    horizon: LiquidityHorizon = "daily",
  ) {
    const forecasts = await prisma.liquidityForecast.findMany({
      where: {
        companyId: ctx.companyId,
        horizon,
      },
      include: {
        scenarios: {
          orderBy: { probability: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return forecasts;
  }

  /**
   * Get scenarios for a specific liquidity forecast.
   */
  static async getScenarios(
    ctx: TenantContext,
    forecastId: string,
  ) {
    return prisma.liquidityScenario.findMany({
      where: {
        companyId: ctx.companyId,
        forecastId,
      },
      orderBy: { probability: "desc" },
    });
  }

  /**
   * Create a new liquidity forecast based on existing TreasuryCashForecast data.
   */
  static async createForecast(
    ctx: TenantContext,
    horizon: LiquidityHorizon = "daily",
    scenario: ScenarioType = "expected",
  ) {
    const cashForecasts = await prisma.treasuryCashForecast.findMany({
      where: {
        companyId: ctx.companyId,
        horizon,
      },
      orderBy: { generatedAt: "desc" },
      take: 5,
    });

    const currentLiquidity = await this.getLiquidityPosition(ctx);

    const avgClosingBalance =
      cashForecasts.length > 0
        ? cashForecasts.reduce(
            (sum, f) => sum.add(f.closingBalance),
            new Prisma.Decimal(0),
          ).div(cashForecasts.length)
        : currentLiquidity.currentLiquidity;

    const avgBurnRate =
      cashForecasts.length > 0
        ? cashForecasts.reduce(
            (sum, f) => sum.add(f.minimumProjectedBalance),
            new Prisma.Decimal(0),
          ).div(cashForecasts.length)
        : currentLiquidity.burnRate;

    const forecastLiquidity =
      scenario === "best"
        ? avgClosingBalance.mul(1.15)
        : scenario === "worst"
          ? avgClosingBalance.mul(0.85)
          : avgClosingBalance;

    const liquidityScore = this.computeLiquidityScore(
      forecastLiquidity,
      avgBurnRate,
    );

    const riskScore = this.computeRiskScore(
      liquidityScore,
      currentLiquidity.riskScore,
    );

    return prisma.liquidityForecast.create({
      data: {
        companyId: ctx.companyId,
        forecastDate: new Date(),
        horizon,
        currentLiquidity: currentLiquidity.currentLiquidity,
        forecastLiquidity,
        minCashThreshold: forecastLiquidity.mul(0.2),
        burnRate: avgBurnRate,
        workingCapital: currentLiquidity.workingCapital,
        shortTermFundingNeeds: forecastLiquidity.isNegative()
          ? forecastLiquidity.abs()
          : new Prisma.Decimal(0),
        longTermLiquidity: forecastLiquidity.mul(3),
        liquidityScore,
        riskScore,
        confidence: new Prisma.Decimal(
          cashForecasts.length > 0 ? 0.7 + cashForecasts.length * 0.05 : 0.5,
        ).toDecimalPlaces(4),
        scenario,
        historicalComparison: {} as unknown as Prisma.InputJsonValue,
        metadata: {} as unknown as Prisma.InputJsonValue,
      },
      include: {
        scenarios: true,
      },
    });
  }

  /**
   * Compute the burn rate from recent TreasuryCashMovement records.
   */
  static async getBurnRate(
    ctx: TenantContext,
    days: number = 30,
  ): Promise<Prisma.Decimal> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const movements = await prisma.treasuryCashMovement.findMany({
      where: {
        companyId: ctx.companyId,
        status: "completed",
        completedAt: { gte: since },
      },
    });

    const totalOutflows = movements
      .filter((m) => m.fundingType === "outflow" || m.fundingType === "payment")
      .reduce(
        (sum, m) => sum.add(m.amount),
        new Prisma.Decimal(0),
      );

    return days > 0
      ? totalOutflows.div(days).toDecimalPlaces(2)
      : new Prisma.Decimal(0);
  }

  /**
   * Compute an aggregate liquidity score from multiple signals.
   */
  static async getLiquidityScore(
    ctx: TenantContext,
  ): Promise<Prisma.Decimal> {
    const [liquidityPosition, latestForecast, burnRate] = await Promise.all([
      this.getLiquidityPosition(ctx),
      prisma.liquidityForecast.findFirst({
        where: { companyId: ctx.companyId },
        orderBy: { createdAt: "desc" },
      }),
      this.getBurnRate(ctx),
    ]);

    const scores: Prisma.Decimal[] = [];

    // Signal 1: Working capital ratio
    if (liquidityPosition.workingCapital.gt(0)) {
      scores.push(new Prisma.Decimal(0.8));
    } else if (liquidityPosition.workingCapital.isZero()) {
      scores.push(new Prisma.Decimal(0.5));
    } else {
      scores.push(new Prisma.Decimal(0.2));
    }

    // Signal 2: Days of runway
    if (liquidityPosition.daysOfRunway > 90) {
      scores.push(new Prisma.Decimal(0.9));
    } else if (liquidityPosition.daysOfRunway > 30) {
      scores.push(new Prisma.Decimal(0.7));
    } else if (liquidityPosition.daysOfRunway > 7) {
      scores.push(new Prisma.Decimal(0.4));
    } else {
      scores.push(new Prisma.Decimal(0.1));
    }

    // Signal 3: Burn rate vs liquidity
    if (!burnRate.isZero() && liquidityPosition.currentLiquidity.gt(0)) {
      const ratio = liquidityPosition.currentLiquidity.div(burnRate);
      scores.push(
        ratio.gt(60)
          ? new Prisma.Decimal(0.9)
          : ratio.gt(30)
            ? new Prisma.Decimal(0.7)
            : ratio.gt(7)
              ? new Prisma.Decimal(0.4)
              : new Prisma.Decimal(0.1),
      );
    }

    // Signal 4: Forecast score
    if (latestForecast) {
      scores.push(latestForecast.liquidityScore);
    }

    if (scores.length === 0) {
      return new Prisma.Decimal(0);
    }

    const total = scores.reduce(
      (sum, s) => sum.add(s),
      new Prisma.Decimal(0),
    );

    return total.div(scores.length).toDecimalPlaces(4);
  }

  // ─── Internal Helpers ──────────────────────────────────────

  private static computeLiquidityScore(
    forecastLiquidity: Prisma.Decimal,
    burnRate: Prisma.Decimal,
  ): Prisma.Decimal {
    if (burnRate.isZero() || forecastLiquidity.isNegative()) {
      return forecastLiquidity.isNegative()
        ? new Prisma.Decimal(0.1)
        : new Prisma.Decimal(0.5);
    }

    const runway = forecastLiquidity.div(burnRate);

    if (runway.gt(90)) return new Prisma.Decimal(0.95);
    if (runway.gt(60)) return new Prisma.Decimal(0.85);
    if (runway.gt(30)) return new Prisma.Decimal(0.7);
    if (runway.gt(14)) return new Prisma.Decimal(0.5);
    if (runway.gt(7)) return new Prisma.Decimal(0.3);
    return new Prisma.Decimal(0.15);
  }

  private static computeRiskScore(
    liquidityScore: Prisma.Decimal,
    existingRisk: Prisma.Decimal,
  ): Prisma.Decimal {
    // Risk is inverse of liquidity health, blended with existing risk signal
    const baseRisk = new Prisma.Decimal(1).sub(liquidityScore);
    return baseRisk.mul(0.6).add(existingRisk.mul(0.4)).toDecimalPlaces(4);
  }
}
