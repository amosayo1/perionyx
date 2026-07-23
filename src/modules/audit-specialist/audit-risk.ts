// ─────────────────────────────────────────────────────────────
// Enterprise Audit Specialist — Audit Risk Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  AuditRiskSummary,
  HighRiskArea,
  RiskAssessmentType,
  GetRiskAssessmentsInput,
  CreateRiskAssessmentInput,
} from "./types";

export class AuditRiskService {
  /**
   * Get all risk assessments, optionally filtered.
   */
  static async getRiskAssessments(
    ctx: TenantContext,
    filters?: GetRiskAssessmentsInput,
  ) {
    const where: Prisma.AuditRiskAssessmentWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.riskType) {
      where.assessmentType = filters.riskType;
    }

    const [assessments, total] = await Promise.all([
      prisma.auditRiskAssessment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.auditRiskAssessment.count({ where }),
    ]);

    return { assessments, total };
  }

  /**
   * Create a new risk assessment.
   */
  static async createAssessment(
    ctx: TenantContext,
    input: CreateRiskAssessmentInput,
  ) {
    const factors = input.riskFactors ?? [];
    const overallRiskScore =
      factors.length > 0
        ? new Prisma.Decimal(
            factors.reduce((sum, f) => sum + f.score, 0) / factors.length,
          ).toDecimalPlaces(4)
        : new Prisma.Decimal(0);

    return prisma.auditRiskAssessment.create({
      data: {
        companyId: ctx.companyId,
        assessmentDate: new Date(),
        assessmentType: input.assessmentType,
        overallRiskScore,
        riskByCategory: {} as unknown as Prisma.InputJsonValue,
        highRiskAreas: [] as unknown as Prisma.InputJsonValue,
        riskTrends: {} as unknown as Prisma.InputJsonValue,
        mitigatingControls: {} as unknown as Prisma.InputJsonValue,
        recommendations: [] as unknown as Prisma.InputJsonValue,
        assessedBy: input.assessedBy ?? ctx.userId,
        metadata: {} as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Get risks grouped by assessment category.
   */
  static async getRiskByCategory(
    ctx: TenantContext,
  ): Promise<Record<string, number>> {
    const assessments = await prisma.auditRiskAssessment.findMany({
      where: { companyId: ctx.companyId },
      select: { assessmentType: true },
    });

    const counts: Record<string, number> = {};

    for (const a of assessments) {
      counts[a.assessmentType] = (counts[a.assessmentType] ?? 0) + 1;
    }

    return counts;
  }

  /**
   * Get high-risk areas — areas with elevated risk scores.
   */
  static async getHighRiskAreas(
    ctx: TenantContext,
  ): Promise<HighRiskArea[]> {
    const findingsByControl = await prisma.auditFinding.groupBy({
      by: ["controlId"],
      where: {
        companyId: ctx.companyId,
        status: { in: ["open", "in_remediation", "overridden"] },
        severity: { in: ["high", "critical"] },
      },
      _count: { id: true },
    });

    const controlGaps = await prisma.auditControl.groupBy({
      by: ["category"],
      where: {
        companyId: ctx.companyId,
        status: { in: ["inactive", "under_review"] },
      },
      _count: { id: true },
    });

    const areaMap: Record<string, HighRiskArea> = {};

    for (const fc of findingsByControl) {
      const control = fc.controlId
        ? await prisma.auditControl.findUnique({
            where: { id: fc.controlId },
            select: { category: true },
          })
        : null;

      const areaName = control?.category ?? "unmapped";

      if (!areaMap[areaName]) {
        areaMap[areaName] = {
          area: areaName,
          score: new Prisma.Decimal(0),
          findingCount: 0,
          controlGapCount: 0,
        };
      }

      areaMap[areaName].findingCount += fc._count.id;
    }

    for (const cg of controlGaps) {
      const areaName = cg.category;

      if (!areaMap[areaName]) {
        areaMap[areaName] = {
          area: areaName,
          score: new Prisma.Decimal(0),
          findingCount: 0,
          controlGapCount: 0,
        };
      }

      areaMap[areaName].controlGapCount += cg._count.id;
    }

    for (const area of Object.values(areaMap)) {
      const score = area.findingCount * 2 + area.controlGapCount * 1.5;
      area.score = new Prisma.Decimal(score).toDecimalPlaces(4);
    }

    return Object.values(areaMap)
      .sort((a, b) => b.score.minus(a.score).toNumber())
      .slice(0, 10);
  }

  /**
   * Get risk trends over time.
   */
  static async getRiskTrends(
    ctx: TenantContext,
    days: number = 30,
  ): Promise<Array<{ date: string; riskScore: Prisma.Decimal; assessmentCount: number }>> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const assessments = await prisma.auditRiskAssessment.findMany({
      where: {
        companyId: ctx.companyId,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "asc" },
      select: {
        createdAt: true,
        overallRiskScore: true,
      },
    });

    const byDate: Record<string, { scores: Prisma.Decimal[]; count: number }> = {};

    for (const a of assessments) {
      const dateKey = a.createdAt.toISOString().split("T")[0];
      if (!byDate[dateKey]) {
        byDate[dateKey] = { scores: [], count: 0 };
      }
      byDate[dateKey].scores.push(a.overallRiskScore);
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
        assessmentCount: data.count,
      };
    });
  }

  /**
   * Compute overall risk score from all active risk assessments and findings.
   */
  static async getOverallRiskScore(
    ctx: TenantContext,
  ): Promise<Prisma.Decimal> {
    const [latestAssessment, openFindings, controlGaps] = await Promise.all([
      prisma.auditRiskAssessment.findFirst({
        where: { companyId: ctx.companyId },
        orderBy: { createdAt: "desc" },
        select: { overallRiskScore: true },
      }),
      prisma.auditFinding.count({
        where: {
          companyId: ctx.companyId,
          status: { in: ["open", "in_remediation", "overridden"] },
          severity: { in: ["high", "critical"] },
        },
      }),
      prisma.auditControl.count({
        where: {
          companyId: ctx.companyId,
          status: { in: ["inactive", "under_review"] },
        },
      }),
    ]);

    const baseScore = latestAssessment?.overallRiskScore ?? new Prisma.Decimal(0);
    const findingPenalty = new Prisma.Decimal(openFindings * 0.05);
    const controlPenalty = new Prisma.Decimal(controlGaps * 0.03);

    const score = baseScore.add(findingPenalty).add(controlPenalty);

    return score.toDecimalPlaces(4).lt(0)
      ? new Prisma.Decimal(0)
      : score.toDecimalPlaces(4).gt(1)
        ? new Prisma.Decimal(1)
        : score.toDecimalPlaces(4);
  }

  /**
   * Get full risk summary for dashboard display.
   */
  static async getAuditRiskSummary(
    ctx: TenantContext,
  ): Promise<AuditRiskSummary> {
    const [overallRiskScore, risksByCategory, highRiskAreas, trends] =
      await Promise.all([
        this.getOverallRiskScore(ctx),
        this.getRiskByCategory(ctx),
        this.getHighRiskAreas(ctx),
        this.getRiskTrends(ctx, 30),
      ]);

    let riskTrend: "improving" | "stable" | "deteriorating" = "stable";
    if (trends.length >= 2) {
      const recent = trends[trends.length - 1].riskScore;
      const prior = trends[trends.length - 2].riskScore;
      if (recent.gt(prior)) riskTrend = "deteriorating";
      else if (recent.lt(prior)) riskTrend = "improving";
    }

    return {
      overallRiskScore,
      risksByCategory,
      highRiskAreas,
      riskTrend,
    };
  }
}
