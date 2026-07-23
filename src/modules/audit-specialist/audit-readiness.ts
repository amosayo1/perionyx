// ─────────────────────────────────────────────────────────────
// Enterprise Audit Specialist — Audit Readiness Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  AuditReadinessSummary,
  ReadinessGap,
  ReadinessAssessmentType,
  GetReadinessSnapshotsInput,
  CreateReadinessSnapshotInput,
} from "./types";

export class AuditReadinessService {
  /**
   * Get all readiness snapshots, optionally filtered.
   */
  static async getReadinessSnapshots(
    ctx: TenantContext,
    filters?: GetReadinessSnapshotsInput,
  ) {
    const where: Prisma.AuditReadinessSnapshotWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.assessmentType) {
      where.assessmentType = filters.assessmentType;
    }

    const [snapshots, total] = await Promise.all([
      prisma.auditReadinessSnapshot.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.auditReadinessSnapshot.count({ where }),
    ]);

    return { snapshots, total };
  }

  /**
   * Create a new readiness snapshot.
   */
  static async createSnapshot(
    ctx: TenantContext,
    input: CreateReadinessSnapshotInput,
  ) {
    const domainScores = input.domainScores ?? {};

    return prisma.auditReadinessSnapshot.create({
      data: {
        companyId: ctx.companyId,
        snapshotDate: new Date(),
        assessmentType: input.assessmentType,
        overallScore: new Prisma.Decimal(0),
        financialStatementsScore: new Prisma.Decimal(domainScores["financial_statements"] ?? 0),
        documentsScore: new Prisma.Decimal(domainScores["documents"] ?? 0),
        evidenceCompletenessScore: new Prisma.Decimal(domainScores["evidence"] ?? 0),
        policyComplianceScore: new Prisma.Decimal(domainScores["policy"] ?? 0),
        workflowCompletionScore: new Prisma.Decimal(domainScores["workflow"] ?? 0),
        summary: (input.notes ?? {}) as unknown as Prisma.InputJsonValue,
        recommendations: [] as unknown as Prisma.InputJsonValue,
        metadata: {} as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Get the latest readiness snapshot, optionally by assessment type.
   */
  static async getLatestReadiness(
    ctx: TenantContext,
    assessmentType?: ReadinessAssessmentType,
  ) {
    const where: Prisma.AuditReadinessSnapshotWhereInput = {
      companyId: ctx.companyId,
    };

    if (assessmentType) {
      where.assessmentType = assessmentType;
    }

    return prisma.auditReadinessSnapshot.findFirst({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get a comprehensive readiness summary.
   */
  static async getReadinessSummary(
    ctx: TenantContext,
  ): Promise<AuditReadinessSummary> {
    const latestSnapshot = await prisma.auditReadinessSnapshot.findFirst({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
    });

    if (!latestSnapshot) {
      return {
        overallScore: new Prisma.Decimal(0),
        domainScores: {},
        gaps: [],
        lastAssessmentDate: undefined,
      };
    }

    const domainScores: Record<string, Prisma.Decimal> = {
      financial_statements: latestSnapshot.financialStatementsScore,
      documents: latestSnapshot.documentsScore,
      evidence: latestSnapshot.evidenceCompletenessScore,
      policy: latestSnapshot.policyComplianceScore,
      workflow: latestSnapshot.workflowCompletionScore,
    };

    const gaps: ReadinessGap[] = [];

    return {
      overallScore: latestSnapshot.overallScore,
      domainScores,
      gaps,
      lastAssessmentDate: latestSnapshot.createdAt,
    };
  }

  /**
   * Identify gaps between current state and audit readiness requirements.
   */
  static async identifyGaps(
    ctx: TenantContext,
  ): Promise<ReadinessGap[]> {
    const gaps: ReadinessGap[] = [];

    const controls = await prisma.auditControl.findMany({
      where: { companyId: ctx.companyId },
      select: { status: true, category: true },
    });

    const activeControls = controls.filter((c) => c.status === "active").length;
    const totalControls = controls.length;

    if (totalControls === 0) {
      gaps.push({
        domain: "Controls",
        description: "No controls have been defined for the organization.",
        severity: "critical",
        recommendation: "Establish a control framework covering key business processes.",
      });
    } else if (activeControls / totalControls < 0.8) {
      gaps.push({
        domain: "Controls",
        description: `Only ${activeControls} of ${totalControls} controls are active (${Math.round((activeControls / totalControls) * 100)}%).`,
        severity: "high",
        recommendation: "Review and remediate inactive controls before the audit.",
      });
    }

    const openFindings = await prisma.auditFinding.count({
      where: {
        companyId: ctx.companyId,
        status: { in: ["open", "in_remediation", "overridden"] },
      },
    });

    const criticalFindings = await prisma.auditFinding.count({
      where: {
        companyId: ctx.companyId,
        status: { in: ["open", "in_remediation", "overridden"] },
        severity: "critical",
      },
    });

    if (criticalFindings > 0) {
      gaps.push({
        domain: "Findings",
        description: `${criticalFindings} critical findings are still open.`,
        severity: "critical",
        recommendation: "Prioritize remediation of critical findings before the audit.",
      });
    } else if (openFindings > 5) {
      gaps.push({
        domain: "Findings",
        description: `${openFindings} findings are still open.`,
        severity: "high",
        recommendation: "Accelerate remediation efforts to reduce open findings.",
      });
    }

    const draftPackages = await prisma.auditEvidencePackage.count({
      where: {
        companyId: ctx.companyId,
        status: "assembling",
      },
    });

    if (draftPackages > 0) {
      gaps.push({
        domain: "Evidence",
        description: `${draftPackages} evidence packages are still being assembled.`,
        severity: "medium",
        recommendation: "Complete evidence package assembly and obtain approvals.",
      });
    }

    const overdueRemediations = await prisma.remediationPlan.count({
      where: {
        companyId: ctx.companyId,
        status: "overdue",
      },
    });

    if (overdueRemediations > 0) {
      gaps.push({
        domain: "Remediation",
        description: `${overdueRemediations} remediation plans are overdue.`,
        severity: "high",
        recommendation: "Escalate overdue remediations and update target dates.",
      });
    }

    return gaps;
  }

  /**
   * Get readiness trend over time.
   */
  static async getReadinessTrend(
    ctx: TenantContext,
    days: number = 90,
  ): Promise<Array<{ date: string; score: Prisma.Decimal; assessmentType: string }>> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const snapshots = await prisma.auditReadinessSnapshot.findMany({
      where: {
        companyId: ctx.companyId,
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "asc" },
      select: {
        createdAt: true,
        overallScore: true,
        assessmentType: true,
      },
    });

    return snapshots.map((s) => ({
      date: s.createdAt.toISOString().split("T")[0],
      score: s.overallScore,
      assessmentType: s.assessmentType,
    }));
  }
}
