// ─────────────────────────────────────────────────────────────
// Enterprise Finance Collaboration — Main Facade
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { CaseManagementService } from "./case-management";
import { AssignmentEngine } from "./assignment-engine";
import { TimelineService } from "./timeline";
import { EvidenceCenter } from "./evidence-center";
import { EnterpriseMemory } from "./enterprise-memory";
import { DecisionRegistry } from "./decision-registry";
import { WorkloadManager } from "./workload-manager";
import { CollaborationAnalytics } from "./collaboration-analytics";
import type {
  CollaborationDashboardData,
  CasesSummary,
  TasksSummary,
  CollaborationRecommendationSummary,
  CollaborationAlertSummary,
  CaseType,
  CasePriority,
  TaskType,
  RecommendationCategory,
  RiskLevel,
  GetCasesInput,
  GetTimelineInput,
  GetWorkQueueInput,
  GetAnalyticsInput,
  GetMemoryInput,
  GetDecisionsInput,
  GetWorkloadsInput,
} from "./types";

export class FinanceCollaborationService {
  // ─── Command Center ──────────────────────────────────────

  static async getCommandCenter(
    ctx: TenantContext,
  ): Promise<CollaborationDashboardData> {
    const [casesSummary, tasksSummary, recommendations, alerts, timelineResult] =
      await Promise.all([
        this.getCasesSummary(ctx),
        this.getTasksSummary(ctx),
        this.getRecommendationSummary(ctx),
        this.getAlertsSummary(ctx),
        TimelineService.getTimeline(ctx, { limit: 20 }),
      ]);

    const analytics = await CollaborationAnalytics.getAnalytics(ctx);

    return {
      cases: casesSummary,
      tasks: tasksSummary,
      recommendations,
      alerts,
      timeline: timelineResult.events.map((e) => ({
        ...e,
        timestamp: e.createdAt,
      })),
      healthScore: analytics.collaborationScore,
    };
  }

  // ─── Case Management ─────────────────────────────────────

  static async getCaseManagement(
    ctx: TenantContext,
    filters?: GetCasesInput,
  ) {
    return CaseManagementService.getCases(ctx, filters);
  }

  // ─── Timeline ────────────────────────────────────────────

  static async getTimeline(
    ctx: TenantContext,
    filters?: GetTimelineInput,
  ) {
    return TimelineService.getTimeline(ctx, filters);
  }

  // ─── Assignment Board ────────────────────────────────────

  static async getAssignmentBoard(ctx: TenantContext) {
    const [assignments, overdue, workloads] = await Promise.all([
      AssignmentEngine.getAssignments(ctx),
      AssignmentEngine.getOverdueAssignments(ctx),
      WorkloadManager.getWorkloads(ctx),
    ]);

    return {
      assignments: assignments.assignments,
      total: assignments.total,
      overdue,
      workloads,
    };
  }

  // ─── Work Queue ──────────────────────────────────────────

  static async getWorkQueue(
    ctx: TenantContext,
    filters?: GetWorkQueueInput,
  ) {
    return WorkloadManager.getWorkQueue(ctx, filters);
  }

  // ─── Evidence Center ─────────────────────────────────────

  static async getEvidenceCenter(
    ctx: TenantContext,
    filters?: {
      evidenceType?: string;
      caseId?: string;
      verificationStatus?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    return EvidenceCenter.getSharedEvidence(ctx, filters as any);
  }

  // ─── Recommendation Center ────────────────────────────────

  static async getRecommendationCenter(ctx: TenantContext) {
    const recommendations = await prisma.sharedRecommendation.findMany({
      where: { companyId: ctx.companyId },
      orderBy: [{ createdAt: "desc" }],
      take: 50,
    });

    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    for (const r of recommendations) {
      byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    }

    return {
      recommendations,
      total: recommendations.length,
      byCategory: byCategory as Record<RecommendationCategory, number>,
      byStatus,
    };
  }

  // ─── Decision Center ─────────────────────────────────────

  static async getDecisionCenter(
    ctx: TenantContext,
    filters?: GetDecisionsInput,
  ) {
    return DecisionRegistry.getDecisions(ctx, filters);
  }

  // ─── Analytics ───────────────────────────────────────────

  static async getAnalytics(
    ctx: TenantContext,
    filters?: GetAnalyticsInput,
  ) {
    const [overall, crossSpecialist, caseMetrics, taskMetrics, recommendationMetrics, escalationMetrics, workloadMetrics] =
      await Promise.all([
        CollaborationAnalytics.getAnalytics(ctx),
        CollaborationAnalytics.getCrossSpecialistMetrics(ctx),
        CollaborationAnalytics.getCaseMetrics(ctx),
        CollaborationAnalytics.getTaskMetrics(ctx),
        CollaborationAnalytics.getRecommendationMetrics(ctx),
        CollaborationAnalytics.getEscalationMetrics(ctx),
        CollaborationAnalytics.getWorkloadMetrics(ctx),
      ]);

    return {
      overall,
      crossSpecialist,
      caseMetrics,
      taskMetrics,
      recommendationMetrics,
      escalationMetrics,
      workloadMetrics,
    };
  }

  // ─── Enterprise Memory ───────────────────────────────────

  static async getEnterpriseMemory(
    ctx: TenantContext,
    filters?: GetMemoryInput,
  ) {
    const [memory, decisionHistory, riskContext] = await Promise.all([
      EnterpriseMemory.getMemory(ctx, filters),
      EnterpriseMemory.getDecisionHistory(ctx),
      EnterpriseMemory.getRiskContext(ctx),
    ]);

    return {
      entries: memory.entries,
      total: memory.total,
      decisionHistory,
      riskContext,
    };
  }

  // ─── Internal Helpers ────────────────────────────────────

  private static async getCasesSummary(
    ctx: TenantContext,
  ): Promise<CasesSummary> {
    const cases = await prisma.financeCase.findMany({
      where: { companyId: ctx.companyId },
      select: {
        id: true,
        caseNumber: true,
        title: true,
        caseType: true,
        status: true,
        priority: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    let totalOpen = 0;
    let totalInProgress = 0;
    let totalEscalated = 0;
    let totalResolved = 0;
    let totalClosed = 0;

    for (const c of cases) {
      byType[c.caseType] = (byType[c.caseType] ?? 0) + 1;
      byPriority[c.priority] = (byPriority[c.priority] ?? 0) + 1;

      if (c.status === "open") totalOpen++;
      else if (c.status === "in_progress") totalInProgress++;
      else if (c.status === "escalated") totalEscalated++;
      else if (c.status === "resolved") totalResolved++;
      else if (c.status === "closed") totalClosed++;
    }

    return {
      totalOpen,
      totalInProgress,
      totalEscalated,
      totalResolved,
      totalClosed,
      byType: byType as Record<CaseType, number>,
      byPriority: byPriority as Record<CasePriority, number>,
      recentCases: cases.slice(0, 10).map((c) => ({
        id: c.id,
        caseNumber: c.caseNumber,
        title: c.title,
        caseType: c.caseType as CaseType,
        status: c.status as any,
        priority: c.priority as CasePriority,
        createdAt: c.createdAt,
      })),
    };
  }

  private static async getTasksSummary(
    ctx: TenantContext,
  ): Promise<TasksSummary> {
    const assignments = await prisma.caseAssignment.findMany({
      where: { companyId: ctx.companyId },
      select: {
        id: true,
        taskTitle: true,
        assignmentType: true,
        status: true,
        toSpecialist: true,
        dueDate: true,
        caseId: true,
      },
    });

    const now = new Date();
    const byType: Record<string, number> = {};

    let totalPending = 0;
    let totalInProgress = 0;
    let totalCompleted = 0;
    let totalOverdue = 0;
    let totalBlocked = 0;

    const overdueTasks: typeof assignments = [];

    for (const a of assignments) {
      byType[a.assignmentType] = (byType[a.assignmentType] ?? 0) + 1;

      if (a.status === "pending") totalPending++;
      else if (a.status === "in_progress") totalInProgress++;
      else if (a.status === "completed") totalCompleted++;
      else if (a.status === "blocked") totalBlocked++;

      if (
        a.dueDate &&
        a.dueDate < now &&
        a.status !== "completed" &&
        a.status !== "cancelled"
      ) {
        totalOverdue++;
        overdueTasks.push(a);
      }
    }

    return {
      totalPending,
      totalInProgress,
      totalCompleted,
      totalOverdue,
      totalBlocked,
      byType: byType as Record<TaskType, number>,
      overdueTasks: overdueTasks.slice(0, 10).map((a) => ({
        id: a.id,
        title: a.taskTitle,
        taskType: a.assignmentType as TaskType,
        status: a.status as any,
        assignedTo: a.toSpecialist,
        dueDate: a.dueDate,
        caseId: a.caseId,
      })),
    };
  }

  private static async getRecommendationSummary(
    ctx: TenantContext,
  ): Promise<CollaborationRecommendationSummary> {
    const recommendations = await prisma.sharedRecommendation.findMany({
      where: { companyId: ctx.companyId },
      select: { category: true, status: true },
    });

    const byCategory: Record<string, number> = {};

    let totalProposed = 0;
    let totalApproved = 0;
    let totalImplementing = 0;
    let totalCompleted = 0;

    for (const r of recommendations) {
      byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;

      if (r.status === "proposed") totalProposed++;
      else if (r.status === "approved") totalApproved++;
      else if (r.status === "implementing") totalImplementing++;
      else if (r.status === "completed") totalCompleted++;
    }

    return {
      totalProposed,
      totalApproved,
      totalImplementing,
      totalCompleted,
      byCategory: byCategory as Record<RecommendationCategory, number>,
    };
  }

  private static async getAlertsSummary(
    ctx: TenantContext,
  ): Promise<CollaborationAlertSummary> {
    const escalatedCases = await prisma.financeCase.findMany({
      where: {
        companyId: ctx.companyId,
        status: "escalated",
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        caseType: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const bySeverity: Record<string, number> = {};

    for (const c of escalatedCases) {
      bySeverity[c.priority] = (bySeverity[c.priority] ?? 0) + 1;
    }

    return {
      totalActive: escalatedCases.length,
      bySeverity: bySeverity as Record<RiskLevel, number>,
      criticalAlerts: escalatedCases.slice(0, 5).map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        severity: c.priority as RiskLevel,
        caseType: c.caseType as CaseType,
      })),
    };
  }
}
