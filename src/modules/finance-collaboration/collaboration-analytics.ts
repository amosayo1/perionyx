// ─────────────────────────────────────────────────────────────
// Enterprise Finance Collaboration — Collaboration Analytics
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  AnalyticsData,
  CrossSpecialistMetric,
  CaseMetric,
  TaskMetric,
  RecommendationMetric,
  EscalationMetric,
  WorkloadMetric,
  CaseType,
  TaskType,
  RecommendationCategory,
} from "./types";

export class CollaborationAnalytics {
  // ─── Overall Analytics ───────────────────────────────────

  static async getAnalytics(
    ctx: TenantContext,
  ): Promise<AnalyticsData> {
    const [caseCount, assignmentCount, recommendationCount, decisionCount] =
      await Promise.all([
        prisma.financeCase.count({ where: { companyId: ctx.companyId } }),
        prisma.caseAssignment.count({
          where: { companyId: ctx.companyId },
        }),
        prisma.sharedRecommendation.count({
          where: { companyId: ctx.companyId },
        }),
        prisma.decisionRegistry.count({
          where: { companyId: ctx.companyId },
        }),
      ]);

    const completedCases = await prisma.financeCase.findMany({
      where: {
        companyId: ctx.companyId,
        status: { in: ["resolved", "closed"] },
      },
      select: { createdAt: true, updatedAt: true },
    });

    let totalResolutionHours = 0;
    for (const c of completedCases) {
      totalResolutionHours +=
        (c.updatedAt.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60);
    }

    const averageResolutionTimeHours =
      completedCases.length > 0
        ? new Prisma.Decimal(totalResolutionHours / completedCases.length)
        : new Prisma.Decimal(0);

    const totalAssignments = await prisma.caseAssignment.count({
      where: { companyId: ctx.companyId },
    });

    const completedAssignments = await prisma.caseAssignment.count({
      where: {
        companyId: ctx.companyId,
        status: "completed",
      },
    });

    const onTimeCompletionRate =
      totalAssignments > 0
        ? new Prisma.Decimal(completedAssignments)
            .div(totalAssignments)
            .toDecimalPlaces(4)
        : new Prisma.Decimal(0);

    const escalatedCases = await prisma.financeCase.count({
      where: {
        companyId: ctx.companyId,
        status: "escalated",
      },
    });

    const escalationRate =
      caseCount > 0
        ? new Prisma.Decimal(escalatedCases)
            .div(caseCount)
            .toDecimalPlaces(4)
        : new Prisma.Decimal(0);

    const collaborationScore = this.computeCollaborationScore(
      onTimeCompletionRate,
      escalationRate,
      averageResolutionTimeHours,
    );

    return {
      totalCases: caseCount,
      totalAssignments: assignmentCount,
      totalRecommendations: recommendationCount,
      totalDecisions: decisionCount,
      averageResolutionTimeHours,
      onTimeCompletionRate,
      escalationRate,
      collaborationScore,
    };
  }

  // ─── Cross-Specialist Metrics ────────────────────────────

  static async getCrossSpecialistMetrics(
    ctx: TenantContext,
  ): Promise<CrossSpecialistMetric[]> {
    const cases = await prisma.financeCase.findMany({
      where: { companyId: ctx.companyId },
      include: {
        participants: {
          select: { participantId: true },
        },
        evidence: {
          select: { addedBy: true },
        },
      },
    });

    const pairMap = new Map<
      string,
      {
        specialistA: string;
        specialistB: string;
        collaborationCount: number;
        sharedCases: Set<string>;
        sharedEvidence: number;
      }
    >();

    for (const c of cases) {
      const specialists = [
        ...new Set(
          c.participants.map((p) => p.participantId),
        ),
      ];

      for (let i = 0; i < specialists.length; i++) {
        for (let j = i + 1; j < specialists.length; j++) {
          const key = [specialists[i], specialists[j]].sort().join(":");
          if (!pairMap.has(key)) {
            const [a, b] = key.split(":");
            pairMap.set(key, {
              specialistA: a,
              specialistB: b,
              collaborationCount: 0,
              sharedCases: new Set(),
              sharedEvidence: 0,
            });
          }
          pairMap.get(key)!.collaborationCount++;
          pairMap.get(key)!.sharedCases.add(c.id);
        }
      }

      const evidenceSpecialists = c.evidence
        .map((e) => e.addedBy)
        .filter((s): s is string => !!s);

      for (let i = 0; i < evidenceSpecialists.length; i++) {
        for (let j = i + 1; j < evidenceSpecialists.length; j++) {
          const key = [evidenceSpecialists[i], evidenceSpecialists[j]]
            .sort()
            .join(":");
          if (pairMap.has(key)) {
            pairMap.get(key)!.sharedEvidence++;
          }
        }
      }
    }

    return Array.from(pairMap.values()).map((v) => ({
      specialistA: v.specialistA,
      specialistB: v.specialistB,
      collaborationCount: v.collaborationCount,
      sharedCases: v.sharedCases.size,
      sharedEvidence: v.sharedEvidence,
    }));
  }

  // ─── Case Metrics ───────────────────────────────────────

  static async getCaseMetrics(
    ctx: TenantContext,
  ): Promise<CaseMetric[]> {
    const cases = await prisma.financeCase.findMany({
      where: { companyId: ctx.companyId },
      select: {
        caseType: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const byType = new Map<string, typeof cases>();
    for (const c of cases) {
      if (!byType.has(c.caseType)) {
        byType.set(c.caseType, []);
      }
      byType.get(c.caseType)!.push(c);
    }

    const metrics: CaseMetric[] = [];

    for (const [caseType, typeCases] of byType) {
      const total = typeCases.length;
      const resolved = typeCases.filter(
        (c) => c.status === "resolved" || c.status === "closed",
      ).length;
      const escalated = typeCases.filter(
        (c) => c.status === "escalated",
      ).length;

      let totalHours = 0;
      let countWithDuration = 0;
      for (const c of typeCases) {
        if (c.status === "resolved" || c.status === "closed") {
          totalHours +=
            (c.updatedAt.getTime() - c.createdAt.getTime()) / (1000 * 60 * 60);
          countWithDuration++;
        }
      }

      metrics.push({
        caseType: caseType as CaseType,
        totalCount: total,
        averageDurationHours:
          countWithDuration > 0
            ? new Prisma.Decimal(totalHours / countWithDuration)
            : new Prisma.Decimal(0),
        resolutionRate:
          total > 0
            ? new Prisma.Decimal(resolved).div(total).toDecimalPlaces(4)
            : new Prisma.Decimal(0),
        escalationRate:
          total > 0
            ? new Prisma.Decimal(escalated).div(total).toDecimalPlaces(4)
            : new Prisma.Decimal(0),
      });
    }

    return metrics;
  }

  // ─── Task Metrics ───────────────────────────────────────

  static async getTaskMetrics(
    ctx: TenantContext,
  ): Promise<TaskMetric[]> {
    const assignments = await prisma.caseAssignment.findMany({
      where: { companyId: ctx.companyId },
      select: {
        assignmentType: true,
        status: true,
        dueDate: true,
        createdAt: true,
        completedAt: true,
      },
    });

    const byType = new Map<string, typeof assignments>();
    for (const a of assignments) {
      if (!byType.has(a.assignmentType)) {
        byType.set(a.assignmentType, []);
      }
      byType.get(a.assignmentType)!.push(a);
    }

    const now = new Date();
    const metrics: TaskMetric[] = [];

    for (const [taskType, typeTasks] of byType) {
      const total = typeTasks.length;
      const completed = typeTasks.filter(
        (t) => t.status === "completed",
      ).length;
      const overdue = typeTasks.filter(
        (t) =>
          t.dueDate &&
          t.dueDate < now &&
          t.status !== "completed" &&
          t.status !== "cancelled",
      ).length;

      let totalHours = 0;
      let countWithDuration = 0;
      for (const t of typeTasks) {
        if (t.completedAt && t.createdAt) {
          totalHours +=
            (t.completedAt.getTime() - t.createdAt.getTime()) / (1000 * 60 * 60);
          countWithDuration++;
        }
      }

      metrics.push({
        taskType: taskType as TaskType,
        totalCount: total,
        completionRate:
          total > 0
            ? new Prisma.Decimal(completed).div(total).toDecimalPlaces(4)
            : new Prisma.Decimal(0),
        overdueRate:
          total > 0
            ? new Prisma.Decimal(overdue).div(total).toDecimalPlaces(4)
            : new Prisma.Decimal(0),
        averageDurationHours:
          countWithDuration > 0
            ? new Prisma.Decimal(totalHours / countWithDuration)
            : new Prisma.Decimal(0),
      });
    }

    return metrics;
  }

  // ─── Recommendation Metrics ──────────────────────────────

  static async getRecommendationMetrics(
    ctx: TenantContext,
  ): Promise<RecommendationMetric[]> {
    const recommendations = await prisma.sharedRecommendation.findMany({
      where: { companyId: ctx.companyId },
      select: {
        category: true,
        status: true,
        createdAt: true,
      },
    });

    const byCategory = new Map<string, typeof recommendations>();
    for (const r of recommendations) {
      if (!byCategory.has(r.category)) {
        byCategory.set(r.category, []);
      }
      byCategory.get(r.category)!.push(r);
    }

    const metrics: RecommendationMetric[] = [];

    for (const [category, catRecs] of byCategory) {
      const total = catRecs.length;
      const adopted = catRecs.filter(
        (r) =>
          r.status === "approved" ||
          r.status === "implementing" ||
          r.status === "completed",
      ).length;

      metrics.push({
        category: category as RecommendationCategory,
        totalCount: total,
        adoptionRate:
          total > 0
            ? new Prisma.Decimal(adopted).div(total).toDecimalPlaces(4)
            : new Prisma.Decimal(0),
        averageTimeToDecisionHours: new Prisma.Decimal(0),
      });
    }

    return metrics;
  }

  // ─── Escalation Metrics ──────────────────────────────────

  static async getEscalationMetrics(
    ctx: TenantContext,
  ): Promise<EscalationMetric> {
    const allCases = await prisma.financeCase.count({
      where: { companyId: ctx.companyId },
    });

    const escalatedCases = await prisma.financeCase.findMany({
      where: {
        companyId: ctx.companyId,
        status: "escalated",
      },
      select: { caseType: true },
    });

    const byCaseType: Record<string, number> = {};
    for (const c of escalatedCases) {
      byCaseType[c.caseType] = (byCaseType[c.caseType] ?? 0) + 1;
    }

    const escalationRate =
      allCases > 0
        ? new Prisma.Decimal(escalatedCases.length)
            .div(allCases)
            .toDecimalPlaces(4)
        : new Prisma.Decimal(0);

    return {
      totalEscalations: escalatedCases.length,
      escalationRate,
      averageResolutionHours: new Prisma.Decimal(0),
      byCaseType: byCaseType as Record<CaseType, number>,
    };
  }

  // ─── Workload Metrics ───────────────────────────────────

  static async getWorkloadMetrics(
    ctx: TenantContext,
  ): Promise<WorkloadMetric[]> {
    const workloads = await prisma.specialistWorkload.findMany({
      where: { companyId: ctx.companyId },
    });

    const metrics: WorkloadMetric[] = workloads.map((w) => {
      const utilizationRate =
        w.capacity > 0
          ? new Prisma.Decimal(w.totalTasks)
              .div(w.capacity)
              .toDecimalPlaces(4)
          : new Prisma.Decimal(0);

      return {
        specialist: w.specialistName,
        currentLoad: w.totalTasks,
        maxCapacity: w.capacity,
        utilizationRate,
        overdueCount: w.overdueTasks,
        averageTaskDurationHours: w.averageCompletionHours,
      };
    });

    return metrics;
  }

  // ─── Internal Helpers ────────────────────────────────────

  private static computeCollaborationScore(
    onTimeRate: Prisma.Decimal,
    escalationRate: Prisma.Decimal,
    avgResolutionHours: Prisma.Decimal,
  ): Prisma.Decimal {
    const onTimeScore = onTimeRate.mul(40);
    const escalationScore = new Prisma.Decimal(1).sub(escalationRate).mul(30);
    const resolutionScore = avgResolutionHours.gt(0)
      ? new Prisma.Decimal(1)
          .div(avgResolutionHours.add(1))
          .mul(100)
          .mul(30)
          .toDecimalPlaces(4)
      : new Prisma.Decimal(15);

    return onTimeScore.add(escalationScore).add(resolutionScore).toDecimalPlaces(4);
  }
}
