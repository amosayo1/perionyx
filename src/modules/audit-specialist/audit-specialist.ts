// ─────────────────────────────────────────────────────────────
// Enterprise Audit Specialist — Main Facade
// ─────────────────────────────────────────────────────────────

import { Prisma, AuditSeverity } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { ControlMonitoringService } from "./control-monitoring";
import { FindingsService } from "./findings";
import { EvidenceManagementService } from "./evidence-management";
import { RemediationService } from "./remediation";
import { AuditReadinessService } from "./audit-readiness";
import { AuditRiskService } from "./audit-risk";
import { ContinuousAuditService } from "./continuous-audit";
import { AuditPlanningService } from "./audit-planning";
import type {
  AuditDashboardData,
  AuditExecutiveSummary,
  GetAuditReportsInput,
  CreateAuditReportInput,
} from "./types";

export class AuditSpecialistService {
  // ─── Dashboard ─────────────────────────────────────────────

  /**
   * Aggregate dashboard data across all audit domains.
   */
  static async getDashboard(
    ctx: TenantContext,
  ): Promise<AuditDashboardData> {
    const [
      controlEffectiveness,
      findingsBySeverity,
      findingsByStatus,
      remediationVelocity,
      readinessSummary,
      upcomingDeadlines,
      recentFindings,
    ] = await Promise.all([
      ControlMonitoringService.getControlEffectivenessScore(ctx),
      FindingsService.getFindingsBySeverity(ctx),
      FindingsService.getFindingsByStatus(ctx),
      RemediationService.getRemediationVelocity(ctx),
      AuditReadinessService.getReadinessSummary(ctx),
      AuditPlanningService.getAuditCalendar(ctx, {
        from: new Date(),
        to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }),
      prisma.auditFinding.findMany({
        where: { companyId: ctx.companyId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const openFindings =
      (findingsByStatus["open"] ?? 0) +
      (findingsByStatus["in_remediation"] ?? 0) +
      (findingsByStatus["overridden"] ?? 0);

    const criticalFindings = findingsBySeverity["critical"] ?? 0;

    const overdueRemediations = await prisma.remediationPlan.count({
      where: {
        companyId: ctx.companyId,
        status: "overdue",
      },
    });

    const overallScore = controlEffectiveness.effectivenessRate
      .add(readinessSummary.overallScore)
      .div(2)
      .toDecimalPlaces(4);

    const controlsByStatus = await prisma.auditControl.groupBy({
      by: ["status"],
      where: { companyId: ctx.companyId },
      _count: { id: true },
    });

    const controlsStatusMap: Record<string, number> = {};
    for (const c of controlsByStatus) {
      controlsStatusMap[c.status] = c._count.id;
    }

    return {
      overallScore,
      controlEffectiveness: controlEffectiveness.effectivenessRate,
      openFindings,
      criticalFindings,
      overdueRemediations,
      upcomingDeadlines: upcomingDeadlines.slice(0, 5),
      recentFindings: recentFindings.map((f) => ({
        id: f.id,
        findingType: f.findingType as any,
        severity: f.severity as any,
        title: f.title,
        description: f.description,
        status: f.status as any,
        controlId: f.controlId ?? undefined,
      })),
      controlsByStatus: controlsStatusMap as Record<string, number>,
      findingsBySeverity,
      remediationVelocity,
      readinessScore: readinessSummary.overallScore,
    };
  }

  // ─── Continuous Audit Center ───────────────────────────────

  /**
   * Full continuous audit view — runs scan and returns results.
   */
  static async getContinuousAuditCenter(ctx: TenantContext) {
    const [results, historicalRuns] = await Promise.all([
      ContinuousAuditService.runContinuousAudit(ctx),
      ContinuousAuditService.getAuditResults(ctx),
    ]);

    return {
      currentRun: results,
      historicalRuns,
      summary: {
        controlFailures: results.controlFailures.length,
        missingApprovals: results.missingApprovals.length,
        lateReconciliations: results.lateReconciliations.length,
        highRiskEvents: results.highRiskEvents.length,
        unusualBehavior: results.unusualBehavior.length,
        overallScore: results.overallScore,
      },
    };
  }

  // ─── Control Monitoring ────────────────────────────────────

  /**
   * Full control monitoring view.
   */
  static async getControlMonitoring(ctx: TenantContext) {
    const [controls, effectiveness, heatmap, sodConflicts, tests] =
      await Promise.all([
        ControlMonitoringService.getControls(ctx),
        ControlMonitoringService.getControlEffectivenessScore(ctx),
        ControlMonitoringService.getControlFailureHeatmap(ctx),
        ControlMonitoringService.getSegregationOfDutiesConflicts(ctx),
        ControlMonitoringService.getControlTests(ctx),
      ]);

    return {
      controls,
      effectiveness,
      failureHeatmap: heatmap,
      segregationOfDutiesConflicts: sodConflicts,
      recentTests: tests,
    };
  }

  // ─── Findings Center ──────────────────────────────────────

  /**
   * Full findings view.
   */
  static async getFindingsCenter(ctx: TenantContext) {
    const [findings, bySeverity, byStatus, summary, repeatFindings] =
      await Promise.all([
        FindingsService.getFindings(ctx),
        FindingsService.getFindingsBySeverity(ctx),
        FindingsService.getFindingsByStatus(ctx),
        FindingsService.getFindingSummary(ctx),
        FindingsService.getRepeatFindings(ctx),
      ]);

    return {
      findings,
      bySeverity,
      byStatus,
      summary,
      repeatFindings,
    };
  }

  // ─── Evidence Center ───────────────────────────────────────

  /**
   * Full evidence management view.
   */
  static async getEvidenceCenter(ctx: TenantContext) {
    const [packages, summary] = await Promise.all([
      EvidenceManagementService.getEvidencePackages(ctx),
      EvidenceManagementService.getEvidencePackageSummary(ctx),
    ]);

    return {
      packages,
      summary,
    };
  }

  // ─── Remediation Center ────────────────────────────────────

  /**
   * Full remediation view.
   */
  static async getRemediationCenter(ctx: TenantContext) {
    const [plans, velocity, planSummary, tasks] = await Promise.all([
      RemediationService.getRemediationPlans(ctx),
      RemediationService.getRemediationVelocity(ctx),
      RemediationService.getRemediationPlanSummary(ctx),
      RemediationService.getRemediationTasks(ctx),
    ]);

    return {
      plans,
      velocity,
      summary: planSummary,
      tasks,
    };
  }

  // ─── Audit Readiness ──────────────────────────────────────

  /**
   * Full audit readiness view.
   */
  static async getAuditReadiness(ctx: TenantContext) {
    const [summary, gaps, latestSnapshot, trend] = await Promise.all([
      AuditReadinessService.getReadinessSummary(ctx),
      AuditReadinessService.identifyGaps(ctx),
      AuditReadinessService.getLatestReadiness(ctx),
      AuditReadinessService.getReadinessTrend(ctx, 90),
    ]);

    return {
      summary,
      gaps,
      latestSnapshot,
      trend,
    };
  }

  // ─── Risk Analytics ────────────────────────────────────────

  /**
   * Full risk analytics view.
   */
  static async getRiskAnalytics(ctx: TenantContext) {
    const [summary, riskByCategory, highRiskAreas, trends, overallScore] =
      await Promise.all([
        AuditRiskService.getAuditRiskSummary(ctx),
        AuditRiskService.getRiskByCategory(ctx),
        AuditRiskService.getHighRiskAreas(ctx),
        AuditRiskService.getRiskTrends(ctx, 30),
        AuditRiskService.getOverallRiskScore(ctx),
      ]);

    return {
      summary,
      riskByCategory,
      highRiskAreas,
      trends,
      overallScore,
    };
  }

  // ─── Audit Calendar ────────────────────────────────────────

  /**
   * Full audit calendar view.
   */
  static async getAuditCalendar(ctx: TenantContext) {
    const now = new Date();
    const threeMonthsLater = new Date(now);
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

    const [upcomingEvents, allEvents] = await Promise.all([
      AuditPlanningService.getAuditCalendar(ctx, {
        from: now,
        to: threeMonthsLater,
      }),
      AuditPlanningService.getAuditCalendar(ctx),
    ]);

    return {
      upcomingEvents,
      allEvents,
      summary: {
        totalEvents: allEvents.length,
        scheduled: allEvents.filter((e) => e.status === "scheduled").length,
        inProgress: allEvents.filter((e) => e.status === "in_progress").length,
        overdue: allEvents.filter((e) => e.status === "overdue").length,
      },
    };
  }

  // ─── Executive Summary ────────────────────────────────────

  /**
   * Executive-level summary for audit committee / board reporting.
   */
  static async getExecutiveSummary(
    ctx: TenantContext,
  ): Promise<AuditExecutiveSummary> {
    const [
      controlEffectiveness,
      findingSummary,
      remediationVelocity,
      readinessSummary,
      riskSummary,
      upcomingDeadlines,
    ] = await Promise.all([
      ControlMonitoringService.getControlEffectivenessScore(ctx),
      FindingsService.getFindingSummary(ctx),
      RemediationService.getRemediationVelocity(ctx),
      AuditReadinessService.getReadinessSummary(ctx),
      AuditRiskService.getAuditRiskSummary(ctx),
      AuditPlanningService.getAuditCalendar(ctx, {
        from: new Date(),
        to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      }),
    ]);

    const openFindings =
      (findingSummary.byStatus["open"] ?? 0) +
      (findingSummary.byStatus["in_remediation"] ?? 0) +
      (findingSummary.byStatus["overridden"] ?? 0);

    const criticalFindings = findingSummary.bySeverity["critical"] ?? 0;

    const totalRemediations = remediationVelocity.totalPlans;
    const remediationProgress =
      totalRemediations > 0
        ? new Prisma.Decimal(remediationVelocity.completed)
            .div(totalRemediations)
            .toDecimalPlaces(4)
        : new Prisma.Decimal(0);

    const overallAuditScore = controlEffectiveness.effectivenessRate
      .add(readinessSummary.overallScore)
      .div(2)
      .toDecimalPlaces(4);

    return {
      period: new Date().toISOString().split("T")[0],
      overallAuditScore,
      totalControls: controlEffectiveness.total,
      effectiveControls: controlEffectiveness.effective,
      totalFindings: findingSummary.total,
      openFindings,
      criticalFindings,
      remediationProgress,
      upcomingDeadlines: upcomingDeadlines.slice(0, 5),
      riskAssessment: riskSummary,
      readinessStatus: readinessSummary,
    };
  }

  // ─── Reports ──────────────────────────────────────────────

  /**
   * Get audit reports, optionally filtered.
   */
  static async getReports(
    ctx: TenantContext,
    filters?: GetAuditReportsInput,
  ) {
    const where: Prisma.AuditReportWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.reportType) {
      where.reportType = filters.reportType;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const [reports, total] = await Promise.all([
      prisma.auditReport.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.auditReport.count({ where }),
    ]);

    return { reports, total };
  }

  /**
   * Create a new audit report.
   */
  static async createReport(
    ctx: TenantContext,
    input: CreateAuditReportInput,
  ) {
    const reportCount = await prisma.auditReport.count({
      where: { companyId: ctx.companyId },
    });

    const report = await prisma.auditReport.create({
      data: {
        companyId: ctx.companyId,
        reportNumber: `RPT-${String(reportCount + 1).padStart(4, "0")}`,
        title: input.title,
        reportType: input.reportType,
        engagementId: input.engagementId ?? null,
        issuedBy: input.preparedBy ?? ctx.userId,
        status: "draft",
        content: {} as unknown as Prisma.InputJsonValue,
        findings: [] as unknown as Prisma.InputJsonValue,
        recommendations: [] as unknown as Prisma.InputJsonValue,
        metadata: {} as unknown as Prisma.InputJsonValue,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "audit.report.created",
      resourceType: "AuditReport",
      resourceId: report.id,
      severity: AuditSeverity.INFO,
      metadata: { reportType: input.reportType, reportNumber: report.reportNumber },
    });

    return report;
  }
}
