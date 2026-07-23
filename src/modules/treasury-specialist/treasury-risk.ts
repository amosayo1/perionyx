// ─────────────────────────────────────────────────────────────
// Enterprise Treasury Specialist — Risk Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { RiskSummary, TreasuryRiskType, RiskTrend } from "./types";

export class TreasuryRiskService {
  /**
   * Get all treasury risks for a company, optionally filtered.
   */
  static async getTreasuryRisks(
    ctx: TenantContext,
    filters?: {
      riskType?: string;
      riskLevel?: string;
      status?: string;
      trend?: string;
    },
  ) {
    const where: Prisma.TreasuryRiskWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.riskType) {
      where.riskType = filters.riskType;
    }

    if (filters?.riskLevel) {
      where.riskLevel = filters.riskLevel;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.trend) {
      where.trend = filters.trend;
    }

    return prisma.treasuryRisk.findMany({
      where,
      orderBy: [{ riskLevel: "desc" }, { riskScore: "desc" }],
    });
  }

  /**
   * Get risks grouped by risk type.
   */
  static async getRisksByType(
    ctx: TenantContext,
  ): Promise<Record<TreasuryRiskType, number>> {
    const risks = await prisma.treasuryRisk.findMany({
      where: { companyId: ctx.companyId },
      select: { riskType: true },
    });

    const counts: Record<string, number> = {};

    for (const r of risks) {
      counts[r.riskType] = (counts[r.riskType] ?? 0) + 1;
    }

    return counts as Record<TreasuryRiskType, number>;
  }

  /**
   * Get a risk heatmap: riskType × riskLevel matrix.
   */
  static async getRiskHeatmap(
    ctx: TenantContext,
  ): Promise<Record<TreasuryRiskType, Record<string, number>>> {
    const risks = await prisma.treasuryRisk.findMany({
      where: { companyId: ctx.companyId },
      select: { riskType: true, riskLevel: true },
    });

    const heatmap: Record<string, Record<string, number>> = {};

    for (const r of risks) {
      if (!heatmap[r.riskType]) {
        heatmap[r.riskType] = {};
      }
      heatmap[r.riskType][r.riskLevel] =
        (heatmap[r.riskType][r.riskLevel] ?? 0) + 1;
    }

    return heatmap as Record<TreasuryRiskType, Record<string, number>>;
  }

  /**
   * Get risk trends over time — time series of risk scores.
   */
  static async getRiskTrends(
    ctx: TenantContext,
    days: number = 30,
  ): Promise<Array<{ date: string; riskScore: Prisma.Decimal; riskCount: number }>> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const risks = await prisma.treasuryRisk.findMany({
      where: {
        companyId: ctx.companyId,
        riskDate: { gte: since },
      },
      orderBy: { riskDate: "asc" },
    });

    // Group by date
    const byDate: Record<string, { scores: Prisma.Decimal[]; count: number }> = {};

    for (const r of risks) {
      const dateKey = r.riskDate.toISOString().split("T")[0];
      if (!byDate[dateKey]) {
        byDate[dateKey] = { scores: [], count: 0 };
      }
      byDate[dateKey].scores.push(r.riskScore);
      byDate[dateKey].count++;
    }

    return Object.entries(byDate).map(([date, data]) => {
      const avgScore = data.scores.reduce(
        (sum, s) => sum.add(s),
        new Prisma.Decimal(0),
      ).div(data.scores.length);

      return {
        date,
        riskScore: avgScore.toDecimalPlaces(4),
        riskCount: data.count,
      };
    });
  }

  /**
   * Compute an aggregate risk score across all active risks.
   */
  static async getRiskScore(
    ctx: TenantContext,
  ): Promise<Prisma.Decimal> {
    const risks = await prisma.treasuryRisk.findMany({
      where: {
        companyId: ctx.companyId,
        status: { in: ["open", "mitigating"] },
      },
      select: { riskScore: true, riskLevel: true },
    });

    if (risks.length === 0) return new Prisma.Decimal(0);

    // Weighted average: higher severity risks get more weight
    let totalWeight = 0;
    let weightedSum = new Prisma.Decimal(0);

    for (const r of risks) {
      const weight = this.getRiskWeight(r.riskLevel);
      totalWeight += weight;
      weightedSum = weightedSum.add(r.riskScore.mul(weight));
    }

    return totalWeight > 0
      ? weightedSum.div(totalWeight).toDecimalPlaces(4)
      : new Prisma.Decimal(0);
  }

  /**
   * Get recommended mitigation actions for a specific risk.
   */
  static async getMitigationActions(
    ctx: TenantContext,
    riskId: string,
  ) {
    const risk = await prisma.treasuryRisk.findFirst({
      where: {
        id: riskId,
        companyId: ctx.companyId,
      },
    });

    if (!risk) {
      throw new Error(`Treasury risk ${riskId} not found`);
    }

    // Return the stored mitigation actions
    return {
      riskId: risk.id,
      riskType: risk.riskType,
      riskLevel: risk.riskLevel,
      mitigationActions: (risk.mitigationActions as Array<{
        action: string;
        priority: string;
        owner?: string;
        estimatedImpact?: string;
      }>) ?? [],
      owner: risk.owner,
      status: risk.status,
      trend: risk.trend,
    };
  }

  /**
   * Get the full risk summary for dashboard display.
   */
  static async getRiskSummary(
    ctx: TenantContext,
  ): Promise<RiskSummary> {
    const [risks, overallRiskScore] = await Promise.all([
      prisma.treasuryRisk.findMany({
        where: { companyId: ctx.companyId },
        select: { riskType: true, riskLevel: true, trend: true },
      }),
      this.getRiskScore(ctx),
    ]);

    const risksByType: Record<string, number> = {};
    const risksByLevel: Record<string, number> = {};

    let improving = 0;
    let stable = 0;
    let deteriorating = 0;

    for (const r of risks) {
      risksByType[r.riskType] = (risksByType[r.riskType] ?? 0) + 1;
      risksByLevel[r.riskLevel] = (risksByLevel[r.riskLevel] ?? 0) + 1;

      if (r.trend === "improving") improving++;
      else if (r.trend === "stable") stable++;
      else if (r.trend === "deteriorating") deteriorating++;
    }

    const riskTrend: RiskTrend =
      deteriorating > improving
        ? "deteriorating"
        : improving > deteriorating
          ? "improving"
          : "stable";

    return {
      totalRisks: risks.length,
      risksByType: risksByType as Record<TreasuryRiskType, number>,
      risksByLevel,
      overallRiskScore,
      riskTrend,
    };
  }

  // ─── Internal Helpers ──────────────────────────────────────

  private static getRiskWeight(riskLevel: string): number {
    switch (riskLevel) {
      case "CRITICAL":
        return 4;
      case "HIGH":
        return 3;
      case "MEDIUM":
        return 2;
      case "LOW":
        return 1;
      default:
        return 1;
    }
  }
}
