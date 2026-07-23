// ─────────────────────────────────────────────────────────────
// Enterprise Treasury Specialist — Debt Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { DebtOverviewSummary, MaturityEntry } from "./types";

export class DebtService {
  /**
   * Get all debt instruments for a company.
   */
  static async getDebtInstruments(
    ctx: TenantContext,
    filters?: {
      instrumentType?: string;
      rateType?: string;
      maturingBefore?: Date;
      healthScoreBelow?: number;
    },
  ) {
    const where: Prisma.DebtInstrumentWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.instrumentType) {
      where.instrumentType = filters.instrumentType;
    }

    if (filters?.rateType) {
      where.rateType = filters.rateType;
    }

    if (filters?.maturingBefore) {
      where.maturityDate = { lte: filters.maturingBefore };
    }

    if (filters?.healthScoreBelow !== undefined) {
      where.healthScore = { lt: new Prisma.Decimal(filters.healthScoreBelow) };
    }

    return prisma.debtInstrument.findMany({
      where,
      include: {
        covenants_: true,
        debtAlerts: {
          where: { status: "active" },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { maturityDate: "asc" },
    });
  }

  /**
   * Get debt covenants for a company, optionally filtered by status.
   */
  static async getDebtCovenants(
    ctx: TenantContext,
    status?: string,
  ) {
    const where: Prisma.DebtCovenantWhereInput = {
      companyId: ctx.companyId,
    };

    if (status) {
      where.status = status;
    }

    return prisma.debtCovenant.findMany({
      where,
      include: {
        debtInstrument: {
          select: {
            id: true,
            instrumentType: true,
            lenderName: true,
          },
        },
      },
      orderBy: { nextTestDate: "asc" },
    });
  }

  /**
   * Get debt alerts for a company.
   */
  static async getDebtAlerts(
    ctx: TenantContext,
    filters?: {
      alertType?: string;
      severity?: string;
      status?: string;
      limit?: number;
    },
  ) {
    const where: Prisma.DebtAlertWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.alertType) {
      where.alertType = filters.alertType;
    }

    if (filters?.severity) {
      where.severity = filters.severity;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    return prisma.debtAlert.findMany({
      where,
      include: {
        debtInstrument: {
          select: {
            id: true,
            instrumentType: true,
            lenderName: true,
            outstandingBalance: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: filters?.limit ?? 50,
    });
  }

  /**
   * Compute an aggregate debt health score from instruments and covenants.
   */
  static async getDebtHealthScore(
    ctx: TenantContext,
  ): Promise<Prisma.Decimal> {
    const [instruments, covenants] = await Promise.all([
      prisma.debtInstrument.findMany({
        where: { companyId: ctx.companyId },
        select: { healthScore: true },
      }),
      prisma.debtCovenant.findMany({
        where: { companyId: ctx.companyId },
        select: { status: true },
      }),
    ]);

    if (instruments.length === 0) return new Prisma.Decimal(0);

    // Average instrument health score
    const instrumentScore =
      instruments.reduce(
        (sum, i) => sum.add(i.healthScore),
        new Prisma.Decimal(0),
      ).div(instruments.length);

    // Covenant penalty
    const covenantViolations = covenants.filter(
      (c) => c.status === "breach",
    ).length;
    const covenantWarnings = covenants.filter(
      (c) => c.status === "warning",
    ).length;

    const covenantPenalty = new Prisma.Decimal(
      covenantViolations * 0.15 + covenantWarnings * 0.05,
    );

    const clamped = instrumentScore.sub(covenantPenalty).toDecimalPlaces(4);
    return clamped.lt(0) ? new Prisma.Decimal(0) : clamped.gt(1) ? new Prisma.Decimal(1) : clamped;
  }

  /**
   * Get the maturity schedule of upcoming debt maturities.
   */
  static async getMaturitySchedule(
    ctx: TenantContext,
    daysAhead: number = 365,
  ): Promise<MaturityEntry[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + daysAhead);

    const instruments = await prisma.debtInstrument.findMany({
      where: {
        companyId: ctx.companyId,
        maturityDate: { gte: new Date(), lte: cutoff },
      },
      orderBy: { maturityDate: "asc" },
    });

    const now = new Date();

    return instruments.map((i) => {
      const daysToMaturity = Math.ceil(
        (i.maturityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        id: i.id,
        instrumentType: i.instrumentType,
        lenderName: i.lenderName,
        outstandingBalance: i.outstandingBalance,
        maturityDate: i.maturityDate,
        daysToMaturity,
      };
    });
  }

  /**
   * Identify refinancing opportunities based on interest rates and maturities.
   */
  static async getRefinancingOpportunities(
    ctx: TenantContext,
  ) {
    const instruments = await prisma.debtInstrument.findMany({
      where: {
        companyId: ctx.companyId,
        maturityDate: { gte: new Date() },
      },
      orderBy: { interestRate: "desc" },
    });

    // Identify instruments with above-average rates maturing soon
    if (instruments.length === 0) return [];

    const avgRate = instruments.reduce(
      (sum, i) => sum.add(i.interestRate),
      new Prisma.Decimal(0),
    ).div(instruments.length);

    const now = new Date();
    const sixMonths = new Date();
    sixMonths.setMonth(sixMonths.getMonth() + 6);

    return instruments.filter(
      (i) =>
        i.interestRate.gt(avgRate) &&
        i.maturityDate <= sixMonths &&
        i.maturityDate >= now,
    );
  }

  // ─── Internal Helpers ──────────────────────────────────────
}
