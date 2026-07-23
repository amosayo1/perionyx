// ─────────────────────────────────────────────────────────────
// Enterprise Treasury Specialist — Cash Position Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  CashPositionSummary,
  CashClassification,
  CashRegion,
} from "./types";

export class CashPositionService {
  /**
   * Get the global cash position for a company by aggregating cash positions,
   * restricted cash, and in-transit funds.
   */
  static async getGlobalCashPosition(
    ctx: TenantContext,
  ): Promise<CashPositionSummary> {
    const [cashPositions, restrictedCash, inTransitMovements] = await Promise.all([
      prisma.treasuryCashPosition.findMany({
        where: { companyId: ctx.companyId },
      }),
      prisma.treasuryRestrictedCash.findMany({
        where: { companyId: ctx.companyId, isReleased: false },
      }),
      prisma.treasuryCashMovement.findMany({
        where: {
          companyId: ctx.companyId,
          status: "in_transit",
        },
      }),
    ]);

    const totalGlobalCash = cashPositions.reduce(
      (sum, p) => sum.add(p.totalBalance),
      new Prisma.Decimal(0),
    );

    const availableCash = cashPositions.reduce(
      (sum, p) => sum.add(p.availableBalance),
      new Prisma.Decimal(0),
    );

    const totalRestricted = restrictedCash.reduce(
      (sum, r) => sum.add(r.totalAmount),
      new Prisma.Decimal(0),
    );

    const inTransitFunds = inTransitMovements.reduce(
      (sum, m) => sum.add(m.amount),
      new Prisma.Decimal(0),
    );

    const cashByCompany = this.groupByField(
      cashPositions,
      "legalEntityId",
      "totalBalance",
    );

    const cashByBank = this.groupByField(
      cashPositions,
      "institutionName",
      "totalBalance",
    );

    const cashByCurrency = this.groupByField(
      cashPositions,
      "currency",
      "totalBalance",
    );

    const cashByRegion = this.groupByField(
      cashPositions,
      "region",
      "totalBalance",
    );

    const concentrationScore = this.computeHHI(cashByRegion);
    const healthScore = this.computeCashHealthScore(
      totalGlobalCash,
      availableCash,
      totalRestricted,
      inTransitFunds,
    );

    return {
      totalGlobalCash,
      availableCash,
      restrictedCash: totalRestricted,
      inTransitFunds,
      cashByCompany,
      cashByBank,
      cashByCurrency,
      cashByRegion,
      concentrationScore,
      healthScore,
    };
  }

  /**
   * Get cash positions grouped by legal entity.
   */
  static async getCashByCompany(
    ctx: TenantContext,
  ): Promise<Record<string, Prisma.Decimal>> {
    const positions = await prisma.treasuryCashPosition.findMany({
      where: { companyId: ctx.companyId },
    });

    return this.groupByField(positions, "legalEntityId", "totalBalance");
  }

  /**
   * Get cash positions grouped by bank/institution.
   */
  static async getCashByBank(
    ctx: TenantContext,
  ): Promise<Record<string, Prisma.Decimal>> {
    const positions = await prisma.treasuryCashPosition.findMany({
      where: { companyId: ctx.companyId },
    });

    return this.groupByField(positions, "institutionName", "totalBalance");
  }

  /**
   * Get cash positions grouped by currency.
   */
  static async getCashByCurrency(
    ctx: TenantContext,
  ): Promise<Record<string, Prisma.Decimal>> {
    const positions = await prisma.treasuryCashPosition.findMany({
      where: { companyId: ctx.companyId },
    });

    return this.groupByField(positions, "currency", "totalBalance");
  }

  /**
   * Get cash positions grouped by region.
   */
  static async getCashByRegion(
    ctx: TenantContext,
  ): Promise<Record<string, Prisma.Decimal>> {
    const positions = await prisma.treasuryCashPosition.findMany({
      where: { companyId: ctx.companyId },
    });

    return this.groupByField(positions, "region", "totalBalance");
  }

  /**
   * Compute the cash concentration score using the Herfindahl-Hirschman Index (HHI)
   * based on regional distribution. Returns a value between 0 and 1 (1 = fully concentrated).
   */
  static async getCashConcentration(
    ctx: TenantContext,
  ): Promise<Prisma.Decimal> {
    const byRegion = await this.getCashByRegion(ctx);

    return this.computeHHI(byRegion);
  }

  /**
   * Get restricted cash details from TreasuryRestrictedCash.
   */
  static async getRestrictedCash(
    ctx: TenantContext,
    legalEntityId?: string,
  ) {
    const where: Prisma.TreasuryRestrictedCashWhereInput = {
      companyId: ctx.companyId,
      isReleased: false,
    };

    if (legalEntityId) {
      where.legalEntityId = legalEntityId;
    }

    return prisma.treasuryRestrictedCash.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get in-transit funds from TreasuryCashMovement where status is in_transit.
   */
  static async getInTransitFunds(
    ctx: TenantContext,
    legalEntityId?: string,
  ) {
    const where: Prisma.TreasuryCashMovementWhereInput = {
      companyId: ctx.companyId,
      status: "in_transit",
    };

    if (legalEntityId) {
      where.sourceLegalEntityId = legalEntityId;
    }

    return prisma.treasuryCashMovement.findMany({
      where,
      orderBy: { requestedAt: "desc" },
    });
  }

  /**
   * Create a point-in-time cash position snapshot for historical tracking.
   */
  static async createSnapshot(
    ctx: TenantContext,
    legalEntityId: string,
    region: string,
  ) {
    const cashSummary = await this.getGlobalCashPosition(ctx);

    return prisma.cashPositionSnapshot.create({
      data: {
        companyId: ctx.companyId,
        snapshotDate: new Date(),
        totalGlobalCash: cashSummary.totalGlobalCash,
        availableCash: cashSummary.availableCash,
        restrictedCash: cashSummary.restrictedCash,
        inTransitFunds: cashSummary.inTransitFunds,
        cashByCompany: cashSummary.cashByCompany as unknown as Prisma.InputJsonValue,
        cashByBank: cashSummary.cashByBank as unknown as Prisma.InputJsonValue,
        cashByCurrency: cashSummary.cashByCurrency as unknown as Prisma.InputJsonValue,
        cashByRegion: cashSummary.cashByRegion as unknown as Prisma.InputJsonValue,
        concentrationScore: cashSummary.concentrationScore,
        healthScore: cashSummary.healthScore,
        alerts: [] as unknown as Prisma.InputJsonValue,
      },
    });
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

  /**
   * Compute the Herfindahl-Hirschman Index for concentration measurement.
   * HHI = sum of squared market shares. Normalized to 0-1 range.
   */
  private static computeHHI(
    distribution: Record<string, Prisma.Decimal>,
  ): Prisma.Decimal {
    const values = Object.values(distribution);
    const total = values.reduce(
      (sum, v) => sum.add(v),
      new Prisma.Decimal(0),
    );

    if (total.isZero()) {
      return new Prisma.Decimal(0);
    }

    let hhi = new Prisma.Decimal(0);

    for (const value of values) {
      const share = value.div(total);
      hhi = hhi.add(share.mul(share));
    }

    // Normalize: divide by max possible HHI (1.0 when fully concentrated in one bucket)
    return hhi.toDecimalPlaces(4);
  }

  private static computeCashHealthScore(
    totalCash: Prisma.Decimal,
    availableCash: Prisma.Decimal,
    restrictedCash: Prisma.Decimal,
    inTransitFunds: Prisma.Decimal,
  ): Prisma.Decimal {
    if (totalCash.isZero()) {
      return new Prisma.Decimal(0);
    }

    // Health is based on available ratio, penalty for high restriction and in-transit
    const availableRatio = availableCash.div(totalCash);
    const restrictionPenalty = restrictedCash.div(totalCash).mul(0.3);
    const transitPenalty = inTransitFunds.div(totalCash).mul(0.1);

    const score = availableRatio.sub(restrictionPenalty).sub(transitPenalty);

    const clamped = score.toDecimalPlaces(4);
    return clamped.lt(0) ? new Prisma.Decimal(0) : clamped.gt(1) ? new Prisma.Decimal(1) : clamped;
  }
}
