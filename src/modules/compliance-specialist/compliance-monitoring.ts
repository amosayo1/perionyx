// ─────────────────────────────────────────────────────────────
// Enterprise Compliance Specialist — Compliance Monitoring
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  GetAssessmentsInput,
  CreateAssessmentInput,
  GetHealthSnapshotsInput,
  CreateHealthSnapshotInput,
  GetRiskAssessmentsInput,
  CreateRiskAssessmentInput,
  ViolationSeverity,
} from "./types";

export class ComplianceMonitoringService {
  static async getAssessments(
    ctx: TenantContext,
    filters?: GetAssessmentsInput,
  ) {
    const where: Prisma.ComplianceAssessmentWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.assessmentType) {
      where.assessmentType = filters.assessmentType;
    }

    if (filters?.search) {
      where.OR = [
        { assessmentTitle: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [assessments, total] = await Promise.all([
      prisma.complianceAssessment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.complianceAssessment.count({ where }),
    ]);

    return { assessments, total };
  }

  static async createAssessment(
    ctx: TenantContext,
    input: CreateAssessmentInput,
  ) {
    return prisma.complianceAssessment.create({
      data: {
        companyId: ctx.companyId,
        assessmentType: input.assessmentType,
        assessmentTitle: input.title,
        scope: (input.scope ?? input.description) as unknown as Prisma.InputJsonValue,
        startDate: new Date(),
        overallScore: input.overallRiskScore ?? 0,
        findings: (input.risksByCategory ?? {}) as unknown as Prisma.InputJsonValue,
        assessor: input.assessedBy ?? ctx.userId,
        metadata: (input.metadata ?? {}) as unknown as Prisma.InputJsonValue,
      },
    });
  }

  static async getHealthSnapshots(
    ctx: TenantContext,
    filters?: GetHealthSnapshotsInput,
  ) {
    const where: Prisma.ComplianceHealthSnapshotWhereInput = {
      companyId: ctx.companyId,
    };

    const [snapshots, total] = await Promise.all([
      prisma.complianceHealthSnapshot.findMany({
        where,
        orderBy: { snapshotDate: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.complianceHealthSnapshot.count({ where }),
    ]);

    return { snapshots, total };
  }

  static async createHealthSnapshot(
    ctx: TenantContext,
    input: CreateHealthSnapshotInput,
  ) {
    const [
      openViolations,
      criticalViolations,
      overdueObligations,
      upcomingDeadlines,
      policyCount,
      activePolicies,
    ] = await Promise.all([
      prisma.complianceViolation.count({
        where: {
          companyId: ctx.companyId,
          status: { in: ["open", "under_review"] },
        },
      }),
      prisma.complianceViolation.count({
        where: {
          companyId: ctx.companyId,
          severity: { in: ["critical"] },
          status: { notIn: ["remediated", "accepted", "waived"] },
        },
      }),
      prisma.complianceObligation.count({
        where: {
          companyId: ctx.companyId,
          status: "overdue",
        },
      }),
      prisma.complianceFiling.count({
        where: {
          companyId: ctx.companyId,
          status: { notIn: ["submitted", "approved", "cancelled"] },
          dueDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.compliancePolicy.count({
        where: { companyId: ctx.companyId },
      }),
      prisma.compliancePolicy.count({
        where: {
          companyId: ctx.companyId,
          status: { in: ["active", "approved"] },
        },
      }),
    ]);

    const policyAdherenceScore =
      policyCount > 0
        ? new Prisma.Decimal(activePolicies)
            .div(policyCount)
            .toDecimalPlaces(4)
        : new Prisma.Decimal(1);

    const domainScores = input.domainScores ?? {};
    const scoreValues = Object.values(domainScores);
    const overallScore =
      scoreValues.length > 0
        ? new Prisma.Decimal(
            scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length,
          ).toDecimalPlaces(4)
        : policyAdherenceScore;

    return prisma.complianceHealthSnapshot.create({
      data: {
        companyId: ctx.companyId,
        snapshotDate: new Date(),
        overallScore,
        policyAdherenceScore,
        regulatoryReadinessScore: overallScore,
        controlComplianceScore: overallScore,
        openViolations,
        criticalViolations,
        overdueObligations,
        upcomingDeadlines,
        trendData: domainScores as unknown as Prisma.InputJsonValue,
        alerts: [] as unknown as Prisma.InputJsonValue,
        metadata: (input.notes ? { notes: input.notes } : {}) as unknown as Prisma.InputJsonValue,
      },
    });
  }

  static async getLatestHealth(
    ctx: TenantContext,
  ) {
    const snapshot = await prisma.complianceHealthSnapshot.findFirst({
      where: { companyId: ctx.companyId },
      orderBy: { snapshotDate: "desc" },
    });

    return snapshot;
  }

  static async getRiskAssessments(
    ctx: TenantContext,
    filters?: GetRiskAssessmentsInput,
  ) {
    const where: Prisma.ComplianceRiskAssessmentWhereInput = {
      companyId: ctx.companyId,
    };

    const [assessments, total] = await Promise.all([
      prisma.complianceRiskAssessment.findMany({
        where,
        orderBy: { assessmentDate: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.complianceRiskAssessment.count({ where }),
    ]);

    return { assessments, total };
  }

  static async createRiskAssessment(
    ctx: TenantContext,
    input: CreateRiskAssessmentInput,
  ) {
    return prisma.complianceRiskAssessment.create({
      data: {
        companyId: ctx.companyId,
        assessmentDate: new Date(),
        overallRiskScore: input.overallRiskScore ?? 0,
        riskByCategory: (input.risksByCategory ?? {}) as unknown as Prisma.InputJsonValue,
        riskByJurisdiction: {} as unknown as Prisma.InputJsonValue,
        riskByFramework: {} as unknown as Prisma.InputJsonValue,
        highRiskAreas: (input.highRiskAreas ?? []) as unknown as Prisma.InputJsonValue,
        mitigatingControls: {} as unknown as Prisma.InputJsonValue,
        recommendations: {} as unknown as Prisma.InputJsonValue,
        assessedBy: input.assessedBy ?? ctx.userId,
        metadata: (input.notes ? { notes: input.notes } : {}) as unknown as Prisma.InputJsonValue,
      },
    });
  }

  static async getComplianceScore(
    ctx: TenantContext,
  ) {
    const latestSnapshot = await prisma.complianceHealthSnapshot.findFirst({
      where: { companyId: ctx.companyId },
      orderBy: { snapshotDate: "desc" },
    });

    if (latestSnapshot) {
      return { score: latestSnapshot.overallScore, date: latestSnapshot.snapshotDate };
    }

    const [violationCount, policyCount, activePolicies] = await Promise.all([
      prisma.complianceViolation.count({
        where: {
          companyId: ctx.companyId,
          status: { notIn: ["remediated", "accepted", "waived"] },
        },
      }),
      prisma.compliancePolicy.count({
        where: { companyId: ctx.companyId },
      }),
      prisma.compliancePolicy.count({
        where: {
          companyId: ctx.companyId,
          status: { in: ["active", "approved"] },
        },
      }),
    ]);

    const violationPenalty = Math.min(violationCount * 0.05, 0.5);
    const policyRate = policyCount > 0 ? activePolicies / policyCount : 1;

    const score = Math.max(0, Math.min(1, policyRate - violationPenalty));

    return {
      score: new Prisma.Decimal(score).toDecimalPlaces(4),
      date: new Date(),
    };
  }
}
