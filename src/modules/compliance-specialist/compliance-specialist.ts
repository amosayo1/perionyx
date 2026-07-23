// ─────────────────────────────────────────────────────────────
// Enterprise Compliance Specialist — Main Facade
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { FrameworkManagementService } from "./framework-management";
import { PolicyEngineService } from "./policy-engine";
import { ObligationTrackerService } from "./obligation-tracker";
import { FilingManagementService } from "./filing-management";
import { RegulatoryIntelligenceService } from "./regulatory-intelligence";
import { ComplianceMonitoringService } from "./compliance-monitoring";
import { ComplianceRemediationService } from "./compliance-remediation";
import type {
  ComplianceDashboardData,
  ComplianceExecutiveSummary,
  ComplianceBriefing,
  ComplianceAnalytics,
  GetPoliciesInput,
  GetObligationsInput,
  GetViolationsInput,
  GetFilingsInput,
  GetRegulatoryUpdatesInput,
  GetRemediationsInput,
  BriefingType,
  TrendDataPoint,
} from "./types";

export class ComplianceSpecialistService {
  // ─── Dashboard ─────────────────────────────────────────────

  static async getDashboard(
    ctx: TenantContext,
  ): Promise<ComplianceDashboardData> {
    const [
      frameworksCount,
      obligationsByStatus,
      violationsBySeverity,
      openViolations,
      overdueObligations,
      upcomingFilings,
      recentViolations,
      upcomingObligations,
      latestHealth,
      policyCount,
      activePolicies,
    ] = await Promise.all([
      prisma.complianceFramework.count({
        where: { companyId: ctx.companyId, status: "active" },
      }),
      prisma.complianceObligation.groupBy({
        by: ["status"],
        where: { companyId: ctx.companyId },
        _count: { id: true },
      }),
      prisma.complianceViolation.groupBy({
        by: ["severity"],
        where: { companyId: ctx.companyId },
        _count: { id: true },
      }),
      prisma.complianceViolation.count({
        where: {
          companyId: ctx.companyId,
          status: { in: ["open", "under_review"] },
        },
      }),
      prisma.complianceObligation.count({
        where: { companyId: ctx.companyId, status: "overdue" },
      }),
      FilingManagementService.getUpcomingFilings(ctx, 30),
      prisma.complianceViolation.findMany({
        where: { companyId: ctx.companyId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      ObligationTrackerService.getUpcomingDeadlines(ctx, 30),
      ComplianceMonitoringService.getLatestHealth(ctx),
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

    const totalObligations = await prisma.complianceObligation.count({
      where: { companyId: ctx.companyId },
    });

    const criticalViolations = await prisma.complianceViolation.count({
      where: {
        companyId: ctx.companyId,
        severity: { in: ["critical"] },
        status: { notIn: ["remediated", "accepted", "waived"] },
      },
    });

    const policyComplianceRate =
      policyCount > 0
        ? new Prisma.Decimal(activePolicies)
            .div(policyCount)
            .toDecimalPlaces(4)
        : new Prisma.Decimal(1);

    const obStatusMap: Record<string, number> = {};
    for (const o of obligationsByStatus) {
      obStatusMap[o.status] = o._count.id;
    }

    const vSevMap: Record<string, number> = {};
    for (const v of violationsBySeverity) {
      vSevMap[v.severity] = v._count.id;
    }

    const overallScore = latestHealth
      ? latestHealth.overallScore
      : policyComplianceRate;

    const deadlineRecords = upcomingObligations.map((o) => ({
      id: o.id,
      deadlineType: "filing" as const,
      title: o.obligationTitle,
      dueDate: o.dueDate ?? new Date(),
      status: "upcoming" as const,
      daysUntilDue: o.dueDate
        ? Math.max(0, Math.ceil((o.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0,
      assignee: o.owner,
    }));

    return {
      overallScore,
      activeFrameworks: frameworksCount,
      totalObligations,
      overdueObligations,
      openViolations,
      criticalViolations,
      upcomingFilings: upcomingFilings.map((f) => ({
        id: f.id,
        filingType: f.filingType as any,
        title: f.filingTitle,
        dueDate: f.dueDate,
        status: f.status as any,
        jurisdiction: f.jurisdiction ?? undefined,
      })),
      recentViolations: recentViolations.map((v) => ({
        id: v.id,
        violationType: v.violationType as any,
        severity: v.severity as any,
        title: v.violationTitle,
        description: v.description ?? "",
        status: v.status as any,
        policyId: v.policyId ?? undefined,
        frameworkId: undefined,
      })),
      obligationsByStatus: obStatusMap as Record<string, number>,
      violationsBySeverity: vSevMap as Record<string, number>,
      policyComplianceRate,
      upcomingDeadlines: deadlineRecords,
    };
  }

  // ─── Policy Center ────────────────────────────────────────

  static async getPolicyCenter(
    ctx: TenantContext,
    filters?: GetPoliciesInput,
  ) {
    const [policies, violationsByPolicy, recentPolicies] = await Promise.all([
      PolicyEngineService.getPolicies(ctx, filters),
      prisma.complianceViolation.groupBy({
        by: ["policyId"],
        where: { companyId: ctx.companyId, policyId: { not: null } },
        _count: { id: true },
      }),
      prisma.compliancePolicy.findMany({
        where: { companyId: ctx.companyId },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
    ]);

    return { policies, violationsByPolicy, recentPolicies };
  }

  // ─── Obligation Center ────────────────────────────────────

  static async getObligationCenter(
    ctx: TenantContext,
    filters?: GetObligationsInput,
  ) {
    const [obligations, overdue, upcoming, byStatus] = await Promise.all([
      ObligationTrackerService.getObligations(ctx, filters),
      ObligationTrackerService.getOverdueObligations(ctx),
      ObligationTrackerService.getUpcomingDeadlines(ctx, 14),
      prisma.complianceObligation.groupBy({
        by: ["status"],
        where: { companyId: ctx.companyId },
        _count: { id: true },
      }),
    ]);

    const statusMap: Record<string, number> = {};
    for (const s of byStatus) {
      statusMap[s.status] = s._count.id;
    }

    return { obligations, overdue, upcoming, byStatus: statusMap };
  }

  // ─── Violation Center ─────────────────────────────────────

  static async getViolationCenter(
    ctx: TenantContext,
    filters?: GetViolationsInput,
  ) {
    const [violations, bySeverity, byStatus, repeated] = await Promise.all([
      PolicyEngineService.getViolations(ctx, filters),
      PolicyEngineService.getViolationsBySeverity(ctx),
      prisma.complianceViolation.groupBy({
        by: ["status"],
        where: { companyId: ctx.companyId },
        _count: { id: true },
      }),
      PolicyEngineService.getRepeatedViolations(ctx),
    ]);

    const statusMap: Record<string, number> = {};
    for (const s of byStatus) {
      statusMap[s.status] = s._count.id;
    }

    return { violations, bySeverity, byStatus: statusMap, repeated };
  }

  // ─── Filing Center ────────────────────────────────────────

  static async getFilingCenter(
    ctx: TenantContext,
    filters?: GetFilingsInput,
  ) {
    const [filings, late, upcoming, byStatus] = await Promise.all([
      FilingManagementService.getFilings(ctx, filters),
      FilingManagementService.getLateFilings(ctx),
      FilingManagementService.getUpcomingFilings(ctx, 30),
      prisma.complianceFiling.groupBy({
        by: ["status"],
        where: { companyId: ctx.companyId },
        _count: { id: true },
      }),
    ]);

    const statusMap: Record<string, number> = {};
    for (const s of byStatus) {
      statusMap[s.status] = s._count.id;
    }

    return { filings, late, upcoming, byStatus: statusMap };
  }

  // ─── Regulatory Intelligence ──────────────────────────────

  static async getRegulatoryIntelligence(
    ctx: TenantContext,
    filters?: GetRegulatoryUpdatesInput,
  ) {
    const [updates, pending, byJurisdiction] = await Promise.all([
      RegulatoryIntelligenceService.getRegulatoryUpdates(ctx, filters),
      RegulatoryIntelligenceService.getPendingAssessments(ctx),
      prisma.regulatoryUpdate.groupBy({
        by: ["jurisdiction"],
        where: { companyId: ctx.companyId },
        _count: { id: true },
      }),
    ]);

    return { updates, pending, byJurisdiction };
  }

  // ─── Remediation Center ───────────────────────────────────

  static async getRemediationCenter(
    ctx: TenantContext,
    filters?: GetRemediationsInput,
  ) {
    const [remediations, overdue, byStatus] = await Promise.all([
      ComplianceRemediationService.getRemediations(ctx, filters),
      prisma.complianceRemediation.findMany({
        where: {
          companyId: ctx.companyId,
          status: { in: ["proposed", "overdue"] },
          targetDate: { lt: new Date() },
        },
        orderBy: { targetDate: "asc" },
      }),
      prisma.complianceRemediation.groupBy({
        by: ["status"],
        where: { companyId: ctx.companyId },
        _count: { id: true },
      }),
    ]);

    const statusMap: Record<string, number> = {};
    for (const s of byStatus) {
      statusMap[s.status] = s._count.id;
    }

    return { remediations, overdue, byStatus: statusMap };
  }

  // ─── Analytics ────────────────────────────────────────────

  static async getAnalytics(
    ctx: TenantContext,
  ): Promise<ComplianceAnalytics> {
    const [violations, filings, policies, health, riskAssessments, regulatoryUpdates] =
      await Promise.all([
        prisma.complianceViolation.findMany({
          where: { companyId: ctx.companyId },
          orderBy: { createdAt: "asc" },
        }),
        prisma.complianceFiling.findMany({
          where: { companyId: ctx.companyId },
        }),
        prisma.compliancePolicy.findMany({
          where: { companyId: ctx.companyId },
        }),
        ComplianceMonitoringService.getLatestHealth(ctx),
        ComplianceMonitoringService.getRiskAssessments(ctx, { limit: 10 }),
        RegulatoryIntelligenceService.getRegulatoryUpdates(ctx, { limit: 20 }),
      ]);

    const complianceScore = health?.overallScore ?? new Prisma.Decimal(0);

    const violationsByMonth: Record<string, number> = {};
    for (const v of violations) {
      const key = v.createdAt.toISOString().slice(0, 7);
      violationsByMonth[key] = (violationsByMonth[key] ?? 0) + 1;
    }

    const violationsTrend: TrendDataPoint[] = Object.entries(violationsByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({
        date,
        value: new Prisma.Decimal(value),
      }));

    const totalFilings = filings.length;
    const onTimeFilings = filings.filter(
      (f) => f.status === "submitted" || f.status === "approved",
    ).length;
    const filingTimelinessRate =
      totalFilings > 0
        ? new Prisma.Decimal(onTimeFilings).div(totalFilings).toDecimalPlaces(4)
        : new Prisma.Decimal(1);

    const activePolicies = policies.filter(
      (p) => p.status === "active" || p.status === "approved",
    ).length;
    const policyAdherenceRate =
      policies.length > 0
        ? new Prisma.Decimal(activePolicies).div(policies.length).toDecimalPlaces(4)
        : new Prisma.Decimal(1);

    const overdueRemediations = await prisma.complianceRemediation.count({
      where: { companyId: ctx.companyId, status: "overdue" },
    });
    const completedRemediations = await prisma.complianceRemediation.count({
      where: { companyId: ctx.companyId, status: "completed" },
    });
    const totalRemediations = await prisma.complianceRemediation.count({
      where: { companyId: ctx.companyId },
    });

    const pendingUpdates = regulatoryUpdates.updates.filter(
      (u) => u.assessmentStatus === "pending",
    );
    const highImpactUpdates = regulatoryUpdates.updates.filter(
      (u) => u.frameworkCode === "high" || u.frameworkCode === "critical",
    );

    return {
      complianceScore,
      violationsTrend,
      filingTimelinessRate,
      policyAdherenceRate,
      riskHeatmap: riskAssessments.assessments.map((a) => ({
        domain: a.assessmentDate.toISOString().slice(0, 7),
        likelihood: 0.5,
        impact: Number(a.overallRiskScore),
        score: a.overallRiskScore,
        violationCount: 0,
      })),
      remediationVelocity: {
        totalRemediations,
        onTrack: completedRemediations,
        behindSchedule: overdueRemediations,
        overdue: overdueRemediations,
        averageDaysToRemediate: 0,
      },
      regulatoryChangeImpact: {
        totalUpdates: regulatoryUpdates.total,
        pendingAssessment: pendingUpdates.length,
        highImpact: highImpactUpdates.length,
        mediumImpact: 0,
        lowImpact: 0,
        recentChanges: regulatoryUpdates.updates.slice(0, 5).map((u) => ({
          id: u.id,
          updateType: u.updateType as any,
          title: u.updateTitle,
          jurisdiction: u.jurisdiction ?? "",
          summary: u.description ?? "",
          impactLevel: u.frameworkCode ?? undefined,
          publishedDate: u.effectiveDate,
        })),
      },
    };
  }

  // ─── Briefings ────────────────────────────────────────────

  static async getBriefing(
    ctx: TenantContext,
    type: BriefingType = "weekly",
  ): Promise<ComplianceBriefing> {
    const [violations, overdueObligations, upcomingDeadlines, latestFilings, regulatoryUpdates, health] =
      await Promise.all([
        PolicyEngineService.getViolations(ctx, { limit: 10 }),
        ObligationTrackerService.getOverdueObligations(ctx),
        ObligationTrackerService.getUpcomingDeadlines(ctx, 14),
        FilingManagementService.getUpcomingFilings(ctx, 14),
        RegulatoryIntelligenceService.getRegulatoryUpdates(ctx, { limit: 5 }),
        ComplianceMonitoringService.getLatestHealth(ctx),
      ]);

    const criticalItems = violations.violations
      .filter((v) => v.severity === "critical")
      .map((v) => ({
        id: v.id,
        type: "violation" as const,
        title: v.violationTitle,
        description: v.description ?? "",
        severity: v.severity as any,
        actionRequired: true,
      }));

    const overdueItems = overdueObligations.map((o) => ({
      id: o.id,
      type: "deadline" as const,
      title: o.obligationTitle,
      description: o.description ?? "",
      severity: "high" as const,
      actionRequired: true,
    }));

    const recommendations: string[] = [];
    if (overdueObligations.length > 0) {
      recommendations.push(`${overdueObligations.length} obligations are overdue and require immediate attention.`);
    }
    if (criticalItems.length > 0) {
      recommendations.push(`${criticalItems.length} critical violations need escalation.`);
    }
    if (regulatoryUpdates.updates.length > 0) {
      recommendations.push(`${regulatoryUpdates.updates.length} new regulatory updates require assessment.`);
    }

    const periodLabel =
      type === "daily"
        ? new Date().toISOString().split("T")[0]
        : type === "weekly"
          ? `Week of ${new Date().toISOString().split("T")[0]}`
          : type === "monthly"
            ? new Date().toISOString().slice(0, 7)
            : `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`;

    return {
      briefingType: type,
      generatedAt: new Date(),
      period: periodLabel,
      summary: `Compliance score: ${health?.overallScore?.toString() ?? "N/A"}. ${violations.total} open violations, ${overdueObligations.length} overdue obligations, ${latestFilings.length} upcoming filings.`,
      keyMetrics: [
        { label: "Compliance Score", value: health?.overallScore ?? new Prisma.Decimal(0) },
        { label: "Open Violations", value: new Prisma.Decimal(violations.total) },
        { label: "Overdue Obligations", value: new Prisma.Decimal(overdueObligations.length) },
        { label: "Upcoming Filings", value: new Prisma.Decimal(latestFilings.length) },
      ],
      criticalItems: [...criticalItems, ...overdueItems].slice(0, 10),
      upcomingDeadlines: upcomingDeadlines.map((o) => ({
        id: o.id,
        deadlineType: "filing" as const,
        title: o.obligationTitle,
        dueDate: o.dueDate ?? new Date(),
        status: "upcoming" as const,
        daysUntilDue: o.dueDate
          ? Math.max(0, Math.ceil((o.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
          : 0,
        assignee: o.owner,
      })),
      recentViolations: violations.violations.slice(0, 5).map((v) => ({
        id: v.id,
        violationType: v.violationType as any,
        severity: v.severity as any,
        title: v.violationTitle,
        description: v.description ?? "",
        status: v.status as any,
        policyId: v.policyId ?? undefined,
        frameworkId: undefined,
      })),
      regulatoryChanges: regulatoryUpdates.updates.slice(0, 5).map((u) => ({
        id: u.id,
        updateType: u.updateType as any,
        title: u.updateTitle,
        jurisdiction: u.jurisdiction ?? "",
        summary: u.description ?? "",
        impactLevel: u.frameworkCode ?? undefined,
        publishedDate: u.effectiveDate,
      })),
      recommendations,
    };
  }

  // ─── Executive Summary ────────────────────────────────────

  static async getExecutiveSummary(
    ctx: TenantContext,
  ): Promise<ComplianceExecutiveSummary> {
    const [
      totalFrameworks,
      activePolicies,
      totalObligations,
      overdueObligations,
      openViolations,
      criticalViolations,
      upcomingFilings,
      lateFilings,
      totalRemediations,
      completedRemediations,
      health,
    ] = await Promise.all([
      prisma.complianceFramework.count({ where: { companyId: ctx.companyId } }),
      prisma.compliancePolicy.count({
        where: { companyId: ctx.companyId, status: { in: ["active", "approved"] } },
      }),
      prisma.complianceObligation.count({ where: { companyId: ctx.companyId } }),
      prisma.complianceObligation.count({
        where: { companyId: ctx.companyId, status: "overdue" },
      }),
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
      FilingManagementService.getUpcomingFilings(ctx, 30),
      FilingManagementService.getLateFilings(ctx),
      prisma.complianceRemediation.count({ where: { companyId: ctx.companyId } }),
      prisma.complianceRemediation.count({
        where: { companyId: ctx.companyId, status: "completed" },
      }),
      ComplianceMonitoringService.getLatestHealth(ctx),
    ]);

    const remediationProgress =
      totalRemediations > 0
        ? new Prisma.Decimal(completedRemediations)
            .div(totalRemediations)
            .toDecimalPlaces(4)
        : new Prisma.Decimal(0);

    const recentViolations = await prisma.complianceViolation.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const criticalRecent = recentViolations.filter((v) => v.severity === "critical");

    const riskTrend =
      criticalRecent.length > 3
        ? "deteriorating"
        : criticalRecent.length > 0
          ? "stable"
          : "improving";

    return {
      period: new Date().toISOString().slice(0, 7),
      overallComplianceScore: health?.overallScore ?? new Prisma.Decimal(0),
      totalFrameworks,
      activePolicies,
      totalObligations,
      overdueObligations,
      openViolations,
      criticalViolations,
      upcomingFilings: upcomingFilings.length,
      lateFilings: lateFilings.length,
      remediationProgress,
      riskTrend,
    };
  }
}
