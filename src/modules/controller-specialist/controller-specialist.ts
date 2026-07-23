// ─────────────────────────────────────────────────────────────
// Enterprise Controller Specialist — Main Facade
// ─────────────────────────────────────────────────────────────

import { Prisma, AuditSeverity } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { CloseManagementService } from "./close-management";
import { JournalReviewService } from "./journal-review";
import { StatementReadinessService } from "./statement-readiness";
import { AccountingHealthService } from "./accounting-health";
import { RecommendationsService } from "./recommendations";
import type {
  DashboardData,
  StatementReadinessSummary,
  AccountingHealthSummary,
  StatementType,
} from "./types";

export class ControllerSpecialistService {
  // ─── Dashboard ─────────────────────────────────────────────

  static async getDashboard(ctx: TenantContext): Promise<DashboardData> {
    const currentPeriod = this.currentPeriod();

    const [
      closePeriods,
      journalSummary,
      readinessSummary,
      latestHealth,
      topRecommendations,
      recentBriefings,
      pendingApprovals,
      outstandingExceptions,
      lateJournals,
    ] = await Promise.all([
      CloseManagementService.getClosePeriods(ctx, {
        status: "IN_PROGRESS",
        limit: 10,
      }),
      JournalReviewService.getJournalRiskSummary(ctx),
      StatementReadinessService.getReadinessSummary(ctx, currentPeriod),
      AccountingHealthService.getLatestSnapshot(ctx),
      RecommendationsService.getTopRecommendations(ctx, 5),
      prisma.controllerBriefing.findMany({
        where: {
          companyId: ctx.companyId,
        },
        orderBy: { briefingDate: "desc" },
        take: 5,
        select: {
          id: true,
          period: true,
          briefingType: true,
          briefingDate: true,
        },
      }),
      prisma.journalReview.count({
        where: {
          companyId: ctx.companyId,
          status: "PENDING",
        },
      }),
      prisma.accountingException.count({
        where: {
          companyId: ctx.companyId,
          status: { notIn: ["RESOLVED", "DISMISSED"] },
        },
      }),
      prisma.journalReview.count({
        where: {
          companyId: ctx.companyId,
          riskFlags: { array_contains: "late" },
        },
      }),
    ]);

    const totalTasks = closePeriods.periods.reduce(
      (sum, p) => sum + (p.totalTasks as unknown as number),
      0,
    );
    const completedTasks = closePeriods.periods.reduce(
      (sum, p) => sum + (p.completedTasks as unknown as number),
      0,
    );
    const blockedTasks = closePeriods.periods.reduce(
      (sum, p) => sum + (p.blockedTasks as unknown as number),
      0,
    );
    const overdueTasks = closePeriods.periods.reduce(
      (sum, p) => sum + (p.overdueTasks as unknown as number),
      0,
    );

    const closeProgress = {
      totalTasks,
      completedTasks,
      blockedTasks,
      overdueTasks,
      percentComplete:
        totalTasks > 0
          ? Math.round((completedTasks / totalTasks) * 10000) / 100
          : 0,
    };

    const openRecCount = topRecommendations.length;

    const topRisks = topRecommendations.map((r) => ({
      category: r.category,
      severity: r.riskLevel as DashboardData["topRisks"][number]["severity"],
      description: r.title,
      affectedEntities: r.affectedModules,
    }));

    return {
      activeClosePeriods: closePeriods.total,
      overallHealthScore:
        latestHealth?.healthScore ?? new Prisma.Decimal(0),
      pendingApprovals,
      outstandingExceptions,
      lateJournals,
      openRecommendations: openRecCount,
      closeProgress,
      recentBriefings: recentBriefings.map((b) => ({
        id: b.id,
        period: b.period,
        type: b.briefingType,
        generatedAt: b.briefingDate.toISOString(),
      })),
      topRisks,
      statementReadiness: readinessSummary,
    };
  }

  // ─── Daily Briefing ────────────────────────────────────────

  static async generateDailyBriefing(
    ctx: TenantContext,
    date?: Date,
  ) {
    const briefingDate = date ?? new Date();
    const period = this.periodFromDate(briefingDate);

    const [
      openPeriods,
      journalSummary,
      healthSnapshot,
      recommendations,
      exceptionCounts,
      readinessSummary,
      policyCompliance,
      pendingApprovals,
    ] = await Promise.all([
      prisma.closePeriod.findMany({
        where: {
          companyId: ctx.companyId,
          status: { in: ["OPEN", "IN_PROGRESS", "REVIEW"] },
        },
        include: {
          tasks: {
            select: { id: true, status: true },
          },
        },
        orderBy: { period: "desc" },
        take: 10,
      }),
      JournalReviewService.getJournalRiskSummary(ctx, {
        from: this.periodStart(period).toISOString(),
        to: this.periodEnd(period).toISOString(),
      }),
      AccountingHealthService.getLatestSnapshot(ctx, period),
      RecommendationsService.getTopRecommendations(ctx, 5),
      this.countExceptionsBySeverity(ctx),
      StatementReadinessService.getReadinessSummary(ctx, period),
      AccountingHealthService.evaluatePolicyCompliance(ctx),
      prisma.journalReview.count({
        where: {
          companyId: ctx.companyId,
          status: "PENDING",
        },
      }),
    ]);

    const totalCloseTasks = openPeriods.reduce(
      (sum, p) => sum + (p.totalTasks as unknown as number),
      0,
    );
    const completedCloseTasks = openPeriods.reduce(
      (sum, p) => sum + (p.completedTasks as unknown as number),
      0,
    );
    const blockedCloseTasks = openPeriods.reduce(
      (sum, p) => sum + (p.blockedTasks as unknown as number),
      0,
    );
    const overdueCloseTasks = openPeriods.reduce(
      (sum, p) => sum + (p.overdueTasks as unknown as number),
      0,
    );

    const closeProgress = {
      totalTasks: totalCloseTasks,
      completed: completedCloseTasks,
      blocked: blockedCloseTasks,
      overdue: overdueCloseTasks,
      percentComplete:
        totalCloseTasks > 0
          ? Math.round((completedCloseTasks / totalCloseTasks) * 100)
          : 0,
    };

    const healthScore =
      healthSnapshot?.healthScore ?? new Prisma.Decimal(0);

    const risks: Array<{
      category: string;
      severity: string;
      description: string;
    }> = [];

    if (blockedCloseTasks > 0) {
      risks.push({
        category: "close_progress",
        severity: "HIGH",
        description: `${blockedCloseTasks} close task(s) are blocked`,
      });
    }

    if (overdueCloseTasks > 0) {
      risks.push({
        category: "close_progress",
        severity: "CRITICAL",
        description: `${overdueCloseTasks} close task(s) are overdue`,
      });
    }

    if (journalSummary.flaggedReviews > 0) {
      risks.push({
        category: "journal_risk",
        severity: "MEDIUM",
        description: `${journalSummary.flaggedReviews} journal(s) flagged for review`,
      });
    }

    if (policyCompliance.policyViolations > 0) {
      risks.push({
        category: "policy",
        severity: "HIGH",
        description: `${policyCompliance.policyViolations} policy violation(s) detected`,
      });
    }

    const recs = recommendations.map((r) => ({
      id: r.id,
      category: r.category,
      title: r.title,
      riskLevel: r.riskLevel,
    }));

    const exceptions = exceptionCounts;

    const lateJournals = journalSummary.totalReviews - journalSummary.pendingReviews;

    const sections = [
      {
        id: "close_progress",
        title: "Close Progress",
        content: `Close is ${closeProgress.percentComplete}% complete. ${closeProgress.completed} of ${closeProgress.totalTasks} tasks done. ${closeProgress.blocked} blocked, ${closeProgress.overdue} overdue.`,
      },
      {
        id: "health_score",
        title: "Accounting Health",
        content: `Overall health score: ${(healthScore as unknown as Prisma.Decimal).toNumber().toFixed(1)}%. ${
          healthScore.gte(0.9)
            ? "Healthy."
            : healthScore.gte(0.7)
              ? "Needs attention."
              : "Critical — immediate action required."
        }`,
      },
      {
        id: "risks",
        title: "Top Risks",
        content:
          risks.length > 0
            ? risks.map((r) => `- [${r.severity}] ${r.description}`).join("\n")
            : "No active risks.",
      },
      {
        id: "recommendations",
        title: "Recommendations",
        content:
          recs.length > 0
            ? recs.map((r) => `- [${r.riskLevel}] ${r.title}`).join("\n")
            : "No pending recommendations.",
      },
      {
        id: "pending_approvals",
        title: "Pending Approvals",
        content: `${pendingApprovals} journal(s) pending approval.`,
      },
      {
        id: "exceptions",
        title: "Exceptions",
        content: `${exceptions.total} open exception(s). ${exceptions.high} high severity, ${exceptions.critical} critical.`,
      },
      {
        id: "late_journals",
        title: "Late Journals",
        content: `${lateJournals} journal(s) posted late this period.`,
      },
      {
        id: "policy_violations",
        title: "Policy Violations",
        content: `${policyCompliance.policyViolations} policy violation(s). ${policyCompliance.lateJournals} late, ${policyCompliance.largeJournals} large.`,
      },
    ];

    const summary = [
      `Period: ${period}`,
      `Health: ${(healthScore as unknown as Prisma.Decimal).toNumber().toFixed(1)}%`,
      `Close: ${closeProgress.percentComplete}% complete`,
      `Risks: ${risks.length}`,
      `Pending approvals: ${pendingApprovals}`,
      `Open exceptions: ${exceptions.total}`,
    ].join(" | ");

    const briefing = await prisma.controllerBriefing.create({
      data: {
        companyId: ctx.companyId,
        briefingDate,
        period,
        title: `Daily Controller Briefing — ${period}`,
        briefingType: "daily",
        status: "DRAFT",
        closeProgress: closeProgress as unknown as Prisma.InputJsonValue,
        healthScore,
        risks: risks as unknown as Prisma.InputJsonValue,
        recommendations: recs as unknown as Prisma.InputJsonValue,
        pendingApprovals,
        outstandingExceptions: exceptions.total,
        lateJournals,
        policyViolations: policyCompliance.policyViolations,
        summary,
        sections: sections as unknown as Prisma.InputJsonValue,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "controller.briefing.created",
      resourceType: "ControllerBriefing",
      resourceId: briefing.id,
      severity: AuditSeverity.INFO,
      metadata: { type: "daily", period },
    });

    return briefing;
  }

  // ─── Briefing Detail ───────────────────────────────────────

  static async getBriefing(ctx: TenantContext, briefingId: string) {
    const briefing = await prisma.controllerBriefing.findFirst({
      where: {
        id: briefingId,
        companyId: ctx.companyId,
      },
    });

    if (!briefing) {
      throw new Error(`Briefing ${briefingId} not found`);
    }

    return briefing;
  }

  // ─── List Briefings ────────────────────────────────────────

  static async listBriefings(
    ctx: TenantContext,
    params?: {
      briefingType?: string;
      status?: string;
      period?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const where: Prisma.ControllerBriefingWhereInput = {
      companyId: ctx.companyId,
    };

    if (params?.briefingType) {
      where.briefingType = params.briefingType;
    }
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.period) {
      where.period = params.period;
    }

    const [briefings, total] = await Promise.all([
      prisma.controllerBriefing.findMany({
        where,
        orderBy: { briefingDate: "desc" },
        take: params?.limit ?? 50,
        skip: params?.offset ?? 0,
      }),
      prisma.controllerBriefing.count({ where }),
    ]);

    return { briefings, total };
  }

  // ─── Close Command Center ──────────────────────────────────

  static async getCloseCommandCenter(ctx: TenantContext, period: string) {
    const periods = await CloseManagementService.getClosePeriods(ctx, {
      period,
      limit: 10,
    });

    const forecasts = await Promise.all(
      periods.periods.map((p) =>
        CloseManagementService.generateCloseForecast(ctx, p.id),
      ),
    );

    const readiness = await Promise.all(
      ([
        "balance_sheet",
        "income_statement",
        "cash_flow",
        "trial_balance",
        "general_ledger",
      ] as StatementType[]).map((type) =>
        StatementReadinessService.evaluateReadiness(ctx, period, type),
      ),
    );

    const journals = await JournalReviewService.getJournalRiskSummary(ctx, {
      from: this.periodStart(period).toISOString(),
      to: this.periodEnd(period).toISOString(),
    });

    return {
      period,
      closePeriods: periods.periods,
      forecasts,
      statementReadiness: readiness,
      journalSummary: journals,
    };
  }

  // ─── Statement Readiness Dashboard ─────────────────────────

  static async getStatementReadinessDashboard(
    ctx: TenantContext,
    period: string,
  ) {
    const statementTypes: StatementType[] = [
      "balance_sheet",
      "income_statement",
      "cash_flow",
      "trial_balance",
      "general_ledger",
      "aged_receivables",
      "aged_payables",
      "equity_statement",
      "budget_vs_actual",
      "department_reports",
    ];

    const [readinessRecords, blockingIssues, summary] = await Promise.all([
      Promise.all(
        statementTypes.map((type) =>
          StatementReadinessService.evaluateReadiness(ctx, period, type),
        ),
      ),
      StatementReadinessService.getBlockingIssues(ctx, period),
      StatementReadinessService.getReadinessSummary(ctx, period),
    ]);

    return {
      period,
      readiness: readinessRecords,
      blockingIssues,
      summary,
    };
  }

  // ─── Accounting Health Dashboard ───────────────────────────

  static async getAccountingHealthDashboard(
    ctx: TenantContext,
    period?: string,
  ) {
    const targetPeriod = period ?? this.currentPeriod();

    const [snapshot, trend, integrity, journalQuality, policyCompliance] =
      await Promise.all([
        AccountingHealthService.getLatestSnapshot(ctx, targetPeriod),
        AccountingHealthService.getHealthTrend(ctx, 6),
        AccountingHealthService.evaluateIntegrity(ctx),
        AccountingHealthService.evaluateJournalQuality(ctx),
        AccountingHealthService.evaluatePolicyCompliance(ctx),
      ]);

    const exceptions = await AccountingHealthService.getAccountingExceptions(
      ctx,
      { status: "OPEN", limit: 10 },
    );

    return {
      period: targetPeriod,
      currentSnapshot: snapshot,
      trend,
      integrity,
      journalQuality,
      policyCompliance,
      openExceptions: exceptions,
    };
  }

  // ─── Recommendation Center ─────────────────────────────────

  static async getRecommendationCenter(ctx: TenantContext) {
    const [summary, topRecommendations, allRecommendations] = await Promise.all(
      [
        RecommendationsService.getRecommendationSummary(ctx),
        RecommendationsService.getTopRecommendations(ctx, 10),
        RecommendationsService.getRecommendations(ctx, {
          status: "OPEN",
          limit: 50,
        }),
      ],
    );

    return {
      summary,
      topRecommendations,
      allRecommendations: allRecommendations.recommendations,
    };
  }

  // ─── Analytics ─────────────────────────────────────────────

  static async getAnalytics(ctx: TenantContext) {
    const currentPeriod = this.currentPeriod();

    const [
      journalSummary,
      healthTrend,
      readinessTrend,
      recommendationSummary,
      exceptionStats,
    ] = await Promise.all([
      JournalReviewService.getJournalRiskSummary(ctx),
      AccountingHealthService.getHealthTrend(ctx, 12),
      StatementReadinessService.getReadinessTrend(ctx, 6),
      RecommendationsService.getRecommendationSummary(ctx),
      this.getExceptionStats(ctx),
    ]);

    return {
      period: currentPeriod,
      journalSummary,
      healthTrend,
      readinessTrend,
      recommendationSummary,
      exceptionStats,
    };
  }

  // ─── Internal Helpers ──────────────────────────────────────

  private static currentPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  private static periodFromDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  private static periodStart(period: string): Date {
    const [year, month] = period.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }

  private static periodEnd(period: string): Date {
    const [year, month] = period.split("-").map(Number);
    return new Date(year, month, 1);
  }

  private static async countExceptionsBySeverity(ctx: TenantContext) {
    const exceptions = await prisma.accountingException.findMany({
      where: {
        companyId: ctx.companyId,
        status: { notIn: ["RESOLVED", "DISMISSED"] },
      },
      select: { severity: true },
    });

    const counts = {
      total: exceptions.length,
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    for (const e of exceptions) {
      switch (e.severity) {
        case "LOW":
          counts.low++;
          break;
        case "MEDIUM":
          counts.medium++;
          break;
        case "HIGH":
          counts.high++;
          break;
        case "CRITICAL":
          counts.critical++;
          break;
      }
    }

    return counts;
  }

  private static async getExceptionStats(ctx: TenantContext) {
    const exceptions = await prisma.accountingException.findMany({
      where: {
        companyId: ctx.companyId,
      },
      select: {
        exceptionType: true,
        severity: true,
        status: true,
      },
    });

    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    for (const e of exceptions) {
      byType[e.exceptionType] = (byType[e.exceptionType] ?? 0) + 1;
      bySeverity[e.severity] = (bySeverity[e.severity] ?? 0) + 1;
      byStatus[e.status] = (byStatus[e.status] ?? 0) + 1;
    }

    return {
      total: exceptions.length,
      byType,
      bySeverity,
      byStatus,
    };
  }
}
