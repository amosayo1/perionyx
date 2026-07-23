// ─────────────────────────────────────────────────────────────
// Enterprise Treasury Specialist — Investment Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { InvestmentOverviewSummary, MaturityEntry } from "./types";

export class InvestmentService {
  /**
   * Get all investment holdings for a company.
   */
  static async getInvestmentHoldings(
    ctx: TenantContext,
    filters?: {
      instrumentType?: string;
      liquidityClassification?: string;
      counterparty?: string;
      maturingBefore?: Date;
    },
  ) {
    const where: Prisma.InvestmentHoldingWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.instrumentType) {
      where.instrumentType = filters.instrumentType;
    }

    if (filters?.liquidityClassification) {
      where.liquidityClassification = filters.liquidityClassification;
    }

    if (filters?.counterparty) {
      where.counterparty = filters.counterparty;
    }

    if (filters?.maturingBefore) {
      where.maturityDate = { lte: filters.maturingBefore };
    }

    return prisma.investmentHolding.findMany({
      where,
      include: {
        recommendations: {
          where: { status: "pending" },
          orderBy: { confidence: "desc" },
        },
      },
      orderBy: { currentValue: "desc" },
    });
  }

  /**
   * Get portfolio allocation grouped by instrument type.
   */
  static async getPortfolioAllocation(
    ctx: TenantContext,
  ): Promise<Record<string, Prisma.Decimal>> {
    const holdings = await prisma.investmentHolding.findMany({
      where: { companyId: ctx.companyId },
    });

    const allocation: Record<string, Prisma.Decimal> = {};

    for (const h of holdings) {
      allocation[h.instrumentType] = (
        allocation[h.instrumentType] ?? new Prisma.Decimal(0)
      ).add(h.currentValue);
    }

    return allocation;
  }

  /**
   * Get investment holdings grouped by liquidity classification.
   */
  static async getLiquidityClassification(
    ctx: TenantContext,
  ): Promise<Record<string, Prisma.Decimal>> {
    const holdings = await prisma.investmentHolding.findMany({
      where: { companyId: ctx.companyId },
    });

    const classification: Record<string, Prisma.Decimal> = {};

    for (const h of holdings) {
      classification[h.liquidityClassification] = (
        classification[h.liquidityClassification] ?? new Prisma.Decimal(0)
      ).add(h.currentValue);
    }

    return classification;
  }

  /**
   * Get counterparty exposure breakdown.
   */
  static async getCounterpartyExposure(
    ctx: TenantContext,
  ): Promise<Record<string, Prisma.Decimal>> {
    const holdings = await prisma.investmentHolding.findMany({
      where: { companyId: ctx.companyId },
    });

    const exposure: Record<string, Prisma.Decimal> = {};

    for (const h of holdings) {
      exposure[h.counterparty] = (
        exposure[h.counterparty] ?? new Prisma.Decimal(0)
      ).add(h.counterpartyExposure);
    }

    return exposure;
  }

  /**
   * Get the investment maturity schedule for upcoming maturities.
   */
  static async getMaturitySchedule(
    ctx: TenantContext,
    daysAhead: number = 365,
  ): Promise<MaturityEntry[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + daysAhead);

    const holdings = await prisma.investmentHolding.findMany({
      where: {
        companyId: ctx.companyId,
        maturityDate: { gte: new Date(), lte: cutoff },
      },
      orderBy: { maturityDate: "asc" },
    });

    const now = new Date();

    return holdings.map((h) => {
      const daysToMaturity = Math.ceil(
        (h.maturityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        id: h.id,
        instrumentType: h.instrumentType,
        issuer: h.issuer,
        outstandingBalance: h.currentValue,
        maturityDate: h.maturityDate,
        daysToMaturity,
      };
    });
  }

  /**
   * Get investment recommendations for a company.
   */
  static async getInvestmentRecommendations(
    ctx: TenantContext,
    limit: number = 20,
  ) {
    return prisma.investmentRecommendation.findMany({
      where: { companyId: ctx.companyId },
      include: {
        holding: {
          select: {
            id: true,
            holdingName: true,
            instrumentType: true,
            issuer: true,
            currentValue: true,
            maturityDate: true,
          },
        },
      },
      orderBy: { confidence: "desc" },
      take: limit,
    });
  }

  /**
   * Get the full investment portfolio summary.
   */
  static async getPortfolioSummary(
    ctx: TenantContext,
  ): Promise<InvestmentOverviewSummary> {
    const holdings = await prisma.investmentHolding.findMany({
      where: { companyId: ctx.companyId },
    });

    const totalCurrentValue = holdings.reduce(
      (sum, h) => sum.add(h.currentValue),
      new Prisma.Decimal(0),
    );

    const totalAllocated = holdings.reduce(
      (sum, h) => sum.add(h.faceValue),
      new Prisma.Decimal(0),
    );

    const availableForInvestment = totalAllocated.sub(totalCurrentValue);

    const portfolioAllocation = this.groupByField(
      holdings,
      "instrumentType",
      "currentValue",
    );

    const liquidityClassification = this.groupByField(
      holdings,
      "liquidityClassification",
      "currentValue",
    );

    const averageHealthScore =
      holdings.length > 0
        ? holdings
            .reduce(
              (sum, h) => sum.add(h.healthScore),
              new Prisma.Decimal(0),
            )
            .div(holdings.length)
            .toDecimalPlaces(4)
        : new Prisma.Decimal(0);

    return {
      totalCurrentValue,
      totalAllocated,
      availableForInvestment,
      portfolioAllocation,
      liquidityClassification,
      averageHealthScore,
    };
  }

  // ─── Internal Helpers ──────────────────────────────────────

  private static groupByField<T extends Record<string, unknown>>(
    items: T[],
    field: string,
    valueField: string,
  ): Record<string, Prisma.Decimal> {
    const result: Record<string, Prisma.Decimal> = {};

    for (const item of items) {
      const key = (item[field] as string) ?? "unknown";
      const value = new Prisma.Decimal(
        String((item[valueField] as Prisma.Decimal) ?? 0),
      );

      result[key] = (result[key] ?? new Prisma.Decimal(0)).add(value);
    }

    return result;
  }
}
