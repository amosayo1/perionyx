// ─────────────────────────────────────────────────────────────
// Executive Command Center — Main Facade Service
// Composes ALL specialist outputs into a unified executive view.
// NEVER generates data — only calls specialist facades and aggregates.
// ─────────────────────────────────────────────────────────────

import type { TenantContext } from "@/server/context/tenant-context";
import { CFOAdvisorService } from "@/modules/cfo-advisor/cfo-advisor.service";
import { ControllerSpecialistService } from "@/modules/controller-specialist/controller-specialist";
import { TreasurySpecialistService } from "@/modules/treasury-specialist/treasury-specialist";
import { ComplianceSpecialistService } from "@/modules/compliance-specialist/compliance-specialist";
import { AuditSpecialistService } from "@/modules/audit-specialist/audit-specialist";
import { FPASpecialistService } from "@/modules/fpa-specialist/fpa-specialist";
import { TaxSpecialistService } from "@/modules/tax-specialist/tax-specialist";
import { BoardGovernanceFacade } from "@/modules/board-governance/board-governance-facade";
import type {
  EnterpriseHealthScore,
  HealthBreakdownItem,
  ExecutiveKPI,
  ExecutiveAlert,
  ExecutiveRecommendation,
  ExecutiveBriefing,
  BriefingSection,
  EnterpriseRiskSummary,
  RiskCategory,
  RiskItem,
  ExecutiveCalendarEvent,
  DrillDownContext,
  DrillDownEvidence,
  RelatedEntity,
  AuditTrailEntry,
  ExecutiveCommandCenterData,
  SpecialistStatus,
} from "./types";

type SettledResult<T> = { status: "fulfilled"; value: T } | { status: "rejected"; reason: unknown };

const SPECIALIST_WEIGHTS: Record<string, number> = {
  cfo: 0.18,
  controller: 0.15,
  treasury: 0.15,
  compliance: 0.12,
  audit: 0.12,
  fpa: 0.10,
  tax: 0.08,
  governance: 0.10,
};

export class ExecutiveCommandCenter {
  // ─── Unified Dashboard ─────────────────────────────────────

  static async getExecutiveDashboard(
    ctx: TenantContext,
  ): Promise<ExecutiveCommandCenterData> {
    const startTime = Date.now();

    const [cfoResult, controllerResult, treasuryResult, complianceResult, auditResult, fpaResult, taxResult, governanceResult] =
      await Promise.allSettled([
        CFOAdvisorService.getDashboardData(ctx),
        ControllerSpecialistService.getDashboard(ctx),
        TreasurySpecialistService.getDashboard(ctx),
        ComplianceSpecialistService.getDashboard(ctx),
        AuditSpecialistService.getDashboard(ctx),
        FPASpecialistService.getDashboard(ctx),
        TaxSpecialistService.getDashboard(ctx),
        BoardGovernanceFacade.getDashboard(ctx),
      ]);

    const specialistStatus: SpecialistStatus[] = [
      this._mapSpecialistStatus("cfo-advisor", "Financial Advisory", cfoResult),
      this._mapSpecialistStatus("controller", "Accounting & Close", controllerResult),
      this._mapSpecialistStatus("treasury", "Treasury & Cash", treasuryResult),
      this._mapSpecialistStatus("compliance", "Compliance & Policy", complianceResult),
      this._mapSpecialistStatus("audit", "Audit & Controls", auditResult),
      this._mapSpecialistStatus("fpa", "FP&A & Planning", fpaResult),
      this._mapSpecialistStatus("tax", "Tax & Provision", taxResult),
      this._mapSpecialistStatus("governance", "Board Governance", governanceResult),
    ];

    const healthScore = await this.getEnterpriseHealthScore(ctx, [
      cfoResult, controllerResult, treasuryResult, complianceResult,
      auditResult, fpaResult, taxResult, governanceResult,
    ]);

    const kpis = this._composeKPIs(ctx, [
      cfoResult, controllerResult, treasuryResult, complianceResult,
      auditResult, fpaResult, taxResult, governanceResult,
    ]);

    const alerts = this._composeAlerts(ctx, [
      cfoResult, treasuryResult, complianceResult, auditResult, taxResult,
    ]);

    const recommendations = this._composeRecommendations(ctx, [
      cfoResult, complianceResult, auditResult, fpaResult, taxResult,
    ]);

    const riskSummary = this._composeRiskSummary(ctx, [
      auditResult, complianceResult, treasuryResult,
    ]);

    const calendar = this._composeCalendar(ctx, [
      governanceResult, complianceResult, taxResult, auditResult, controllerResult,
    ]);

    return {
      healthScore,
      kpis,
      alerts,
      recommendations,
      calendar,
      riskSummary,
      specialistStatus,
      generatedAt: new Date(),
      companyId: ctx.companyId,
    };
  }

  // ─── Enterprise Health Score ───────────────────────────────

  static async getEnterpriseHealthScore(
    ctx: TenantContext,
    preloadedResults?: SettledResult<unknown>[],
  ): Promise<EnterpriseHealthScore> {
    let results = preloadedResults;

    if (!results) {
      results = await Promise.allSettled([
        CFOAdvisorService.getDashboardData(ctx),
        ControllerSpecialistService.getDashboard(ctx),
        TreasurySpecialistService.getDashboard(ctx),
        ComplianceSpecialistService.getDashboard(ctx),
        AuditSpecialistService.getDashboard(ctx),
        FPASpecialistService.getDashboard(ctx),
        TaxSpecialistService.getDashboard(ctx),
        BoardGovernanceFacade.getDashboard(ctx),
      ]);
    }

    const domains = [
      { key: "cfo", label: "Financial", idx: 0 },
      { key: "controller", label: "Operational", idx: 1 },
      { key: "treasury", label: "Treasury", idx: 2 },
      { key: "compliance", label: "Compliance", idx: 3 },
      { key: "audit", label: "Risk", idx: 4 },
      { key: "fpa", label: "FP&A", idx: 5 },
      { key: "tax", label: "Tax", idx: 6 },
      { key: "governance", label: "Governance", idx: 7 },
    ];

    const breakdown: HealthBreakdownItem[] = [];
    const scores: Record<string, number> = {};

    for (const domain of domains) {
      const result = results[domain.idx];
      const score = this._extractHealthScore(domain.key, result);
      scores[domain.key] = score;

      breakdown.push({
        domain: domain.label,
        score,
        weight: SPECIALIST_WEIGHTS[domain.key] ?? 0.1,
        source: domain.key,
        status: this._scoreToStatus(score),
        trend: "stable",
      });
    }

    const financial = scores["cfo"] ?? 50;
    const treasury = scores["treasury"] ?? 50;
    const operational = scores["controller"] ?? 50;
    const compliance = scores["compliance"] ?? 50;
    const risk = scores["audit"] ?? 50;
    const governance = scores["governance"] ?? 50;

    let overall = 0;
    for (const [key, weight] of Object.entries(SPECIALIST_WEIGHTS)) {
      overall += (scores[key] ?? 50) * weight;
    }

    return {
      overall: Math.round(overall),
      financial,
      treasury,
      operational,
      compliance,
      risk,
      governance,
      breakdown,
      calculatedAt: new Date(),
      companyId: ctx.companyId,
    };
  }

  // ─── Executive KPIs ───────────────────────────────────────

  static async getExecutiveKPIs(ctx: TenantContext): Promise<ExecutiveKPI[]> {
    const results = await Promise.allSettled([
      CFOAdvisorService.getDashboardData(ctx),
      ControllerSpecialistService.getDashboard(ctx),
      TreasurySpecialistService.getDashboard(ctx),
      ComplianceSpecialistService.getDashboard(ctx),
      AuditSpecialistService.getDashboard(ctx),
      FPASpecialistService.getDashboard(ctx),
      TaxSpecialistService.getDashboard(ctx),
      BoardGovernanceFacade.getDashboard(ctx),
    ]);

    return this._composeKPIs(ctx, results);
  }

  // ─── Executive Alerts ─────────────────────────────────────

  static async getExecutiveAlerts(ctx: TenantContext): Promise<ExecutiveAlert[]> {
    const results = await Promise.allSettled([
      CFOAdvisorService.getDashboardData(ctx),
      TreasurySpecialistService.getDashboard(ctx),
      ComplianceSpecialistService.getDashboard(ctx),
      AuditSpecialistService.getDashboard(ctx),
      TaxSpecialistService.getDashboard(ctx),
    ]);

    return this._composeAlerts(ctx, results);
  }

  // ─── Executive Recommendations ────────────────────────────

  static async getExecutiveRecommendations(
    ctx: TenantContext,
  ): Promise<ExecutiveRecommendation[]> {
    const results = await Promise.allSettled([
      CFOAdvisorService.getDashboardData(ctx),
      ComplianceSpecialistService.getDashboard(ctx),
      AuditSpecialistService.getDashboard(ctx),
      FPASpecialistService.getDashboard(ctx),
      TaxSpecialistService.getDashboard(ctx),
    ]);

    return this._composeRecommendations(ctx, results);
  }

  // ─── Executive Briefing ───────────────────────────────────

  static async getExecutiveBriefing(
    ctx: TenantContext,
    briefingType: ExecutiveBriefing["briefingType"] = "morning",
  ): Promise<ExecutiveBriefing> {
    const sections: BriefingSection[] = [];
    const keyDecisions: string[] = [];
    const urgentActions: string[] = [];

    const [cfoResult, controllerResult, complianceResult, taxResult, fpaResult, governanceResult] =
      await Promise.allSettled([
        CFOAdvisorService.getLatestBriefing(ctx),
        ControllerSpecialistService.getDashboard(ctx),
        ComplianceSpecialistService.getDashboard(ctx),
        TaxSpecialistService.getDashboard(ctx),
        FPASpecialistService.getDashboard(ctx),
        BoardGovernanceFacade.getDashboard(ctx),
      ]);

    if (cfoResult.status === "fulfilled" && cfoResult.value) {
      const b = cfoResult.value;
      sections.push({
        title: "Financial Overview",
        source: "cfo-advisor",
        highlights: [b.executiveSummary],
        metrics: {
          cashPosition: (b.cashPosition as Record<string, unknown>)?.totalCash as number ?? 0,
        },
        status: "good",
      });
      if (b.criticalAlerts?.length) {
        urgentActions.push(...(b.criticalAlerts as string[]));
      }
      if (b.openApprovals?.length) {
        urgentActions.push(`${(b.openApprovals as unknown[]).length} approval(s) pending`);
      }
    }

    if (controllerResult.status === "fulfilled") {
      const d = controllerResult.value as unknown as Record<string, unknown>;
      const lateJournals = (d.lateJournals as number) ?? 0;
      const pendingApprovals = (d.pendingApprovals as number) ?? 0;
      sections.push({
        title: "Close & Accounting",
        source: "controller",
        highlights: [
          `${lateJournals} late journals`,
          `${pendingApprovals} pending approvals`,
        ],
        metrics: {
          lateJournals,
          pendingApprovals,
        },
        status: lateJournals > 10 ? "warning" : "good",
      });
    }

    if (complianceResult.status === "fulfilled") {
      const d = complianceResult.value;
      sections.push({
        title: "Compliance Status",
        source: "compliance",
        highlights: [
          `${d.openViolations ?? 0} open violations`,
          `${d.overdueObligations ?? 0} overdue obligations`,
        ],
        metrics: {
          openViolations: d.openViolations ?? 0,
          overdueObligations: d.overdueObligations ?? 0,
        },
        status: (d.openViolations ?? 0) > 0 ? "warning" : "good",
      });
    }

    if (taxResult.status === "fulfilled") {
      const d = taxResult.value;
      sections.push({
        title: "Tax Position",
        source: "tax",
        highlights: [
          `${d.activeReturns ?? 0} active returns`,
          `${d.openDeadlines ?? 0} open deadlines`,
        ],
        metrics: {
          activeReturns: d.activeReturns ?? 0,
          openDeadlines: d.openDeadlines ?? 0,
        },
        status: (d.overdueDeadlines ?? 0) > 0 ? "critical" : "good",
      });
      if (d.overdueDeadlines) {
        urgentActions.push(`${d.overdueDeadlines} overdue tax deadline(s)`);
      }
    }

    if (fpaResult.status === "fulfilled") {
      const d = fpaResult.value;
      sections.push({
        title: "Planning & Forecast",
        source: "fpa",
        highlights: [
          `${d.activePlans ?? 0} active plans`,
          `${d.activeForecasts ?? 0} active forecasts`,
        ],
        metrics: {
          activePlans: d.activePlans ?? 0,
          activeForecasts: d.activeForecasts ?? 0,
        },
        status: "good",
      });
    }

    if (governanceResult.status === "fulfilled") {
      const d = governanceResult.value;
      sections.push({
        title: "Governance",
        source: "governance",
        highlights: [
          `${d.upcomingMeetings ?? 0} upcoming meetings`,
          `${d.pendingResolutions ?? 0} pending resolutions`,
        ],
        metrics: {
          upcomingMeetings: d.upcomingMeetings ?? 0,
          overdueActions: d.overdueActions ?? 0,
        },
        status: (d.overdueActions ?? 0) > 0 ? "warning" : "good",
      });
    }

    const criticalCount = sections.filter((s) => s.status === "critical").length;
    const warningCount = sections.filter((s) => s.status === "warning").length;

    const executiveSummary = [
      `${sections.length} specialist domains reported.`,
      criticalCount > 0 ? `${criticalCount} critical.` : "No critical issues.",
      warningCount > 0 ? `${warningCount} warnings.` : "",
      `${urgentActions.length} urgent action(s).`,
    ]
      .filter(Boolean)
      .join(" ");

    return {
      id: `briefing-${ctx.companyId}-${Date.now()}`,
      briefingType,
      executiveSummary,
      sections,
      keyDecisions,
      urgentActions,
      generatedAt: new Date(),
      companyId: ctx.companyId,
    };
  }

  // ─── Enterprise Risk Summary ──────────────────────────────

  static async getEnterpriseRiskSummary(
    ctx: TenantContext,
  ): Promise<EnterpriseRiskSummary> {
    const [auditResult, complianceResult, treasuryResult] =
      await Promise.allSettled([
        AuditSpecialistService.getDashboard(ctx),
        ComplianceSpecialistService.getDashboard(ctx),
        TreasurySpecialistService.getDashboard(ctx),
      ]);

    return this._composeRiskSummary(ctx, [auditResult, complianceResult, treasuryResult]);
  }

  // ─── Executive Calendar ───────────────────────────────────

  static async getExecutiveCalendar(
    ctx: TenantContext,
  ): Promise<ExecutiveCalendarEvent[]> {
    const [governanceResult, complianceResult, taxResult, auditResult, controllerResult] =
      await Promise.allSettled([
        BoardGovernanceFacade.getDashboard(ctx),
        ComplianceSpecialistService.getDashboard(ctx),
        TaxSpecialistService.getDashboard(ctx),
        AuditSpecialistService.getDashboard(ctx),
        ControllerSpecialistService.getDashboard(ctx),
      ]);

    return this._composeCalendar(ctx, [governanceResult, complianceResult, taxResult, auditResult, controllerResult]);
  }

  // ─── Drill-Down ───────────────────────────────────────────

  static async getDrillDown(
    ctx: TenantContext,
    domain: string,
    entityId?: string,
  ): Promise<DrillDownContext> {
    const evidence: DrillDownEvidence[] = [];
    const relatedEntities: RelatedEntity[] = [];
    const auditTrail: AuditTrailEntry[] = [];
    const recommendations: string[] = [];

    switch (domain) {
      case "treasury": {
        const result = await Promise.allSettled([
          TreasurySpecialistService.getDashboard(ctx),
        ]);
        if (result[0].status === "fulfilled") {
          const d = result[0].value;
          evidence.push({
            id: `cash-${ctx.companyId}`,
            type: "report",
            title: "Cash Position Report",
            source: "treasury",
            date: new Date(),
          });
          if (d.risks) {
            recommendations.push("Review treasury risk exposure");
          }
        }
        break;
      }
      case "compliance": {
        const result = await Promise.allSettled([
          ComplianceSpecialistService.getDashboard(ctx),
        ]);
        if (result[0].status === "fulfilled") {
          const d = result[0].value as unknown as Record<string, unknown>;
          const violations = d.recentViolations as unknown[] | undefined;
          if (violations?.length) {
            for (const v of violations.slice(0, 5)) {
              const violation = v as Record<string, unknown>;
              evidence.push({
                id: String(violation.id ?? ""),
                type: "document",
                title: `Violation: ${String(violation.title ?? violation.id ?? "")}`,
                source: "compliance",
                date: new Date(),
              });
            }
          }
          recommendations.push("Review open compliance violations");
        }
        break;
      }
      case "audit": {
        const result = await Promise.allSettled([
          AuditSpecialistService.getDashboard(ctx),
        ]);
        if (result[0].status === "fulfilled") {
          const d = result[0].value as unknown as Record<string, unknown>;
          const findings = d.recentFindings as unknown[] | undefined;
          if (findings?.length) {
            for (const f of findings.slice(0, 5)) {
              const finding = f as Record<string, unknown>;
              evidence.push({
                id: String(finding.id ?? ""),
                type: "report",
                title: `Finding: ${String(finding.title ?? finding.id ?? "")}`,
                source: "audit",
                date: new Date(),
              });
            }
          }
          recommendations.push("Review open audit findings and remediation progress");
        }
        break;
      }
      case "controller": {
        const result = await Promise.allSettled([
          ControllerSpecialistService.getDashboard(ctx),
        ]);
        if (result[0].status === "fulfilled") {
          const d = result[0].value;
          evidence.push({
            id: `close-${ctx.companyId}`,
            type: "report",
            title: "Close Status Report",
            source: "controller",
            date: new Date(),
          });
          if (d.recentBriefings?.length) {
            recommendations.push("Review controller recommendations");
          }
        }
        break;
      }
      default: {
        evidence.push({
          id: `domain-${domain}`,
          type: "report",
          title: `${domain} domain overview`,
          source: domain,
          date: new Date(),
        });
        break;
      }
    }

    return {
      domain,
      specialist: domain,
      entityId,
      evidence,
      relatedEntities,
      auditTrail,
      recommendations,
    };
  }

  // ─── Performance Metrics ──────────────────────────────────

  static async getPerformanceMetrics(
    ctx: TenantContext,
  ): Promise<{ specialistTimings: Record<string, number>; totalMs: number }> {
    const totalStart = Date.now();

    const timings: Record<string, number> = {};
    const measure = async (name: string, fn: () => Promise<unknown>) => {
      const start = Date.now();
      await fn().catch(() => {});
      timings[name] = Date.now() - start;
    };

    await Promise.all([
      measure("cfo", () => CFOAdvisorService.getDashboardData(ctx)),
      measure("controller", () => ControllerSpecialistService.getDashboard(ctx)),
      measure("treasury", () => TreasurySpecialistService.getDashboard(ctx)),
      measure("compliance", () => ComplianceSpecialistService.getDashboard(ctx)),
      measure("audit", () => AuditSpecialistService.getDashboard(ctx)),
      measure("fpa", () => FPASpecialistService.getDashboard(ctx)),
      measure("tax", () => TaxSpecialistService.getDashboard(ctx)),
      measure("governance", () => BoardGovernanceFacade.getDashboard(ctx)),
    ]);

    return {
      specialistTimings: timings,
      totalMs: Date.now() - totalStart,
    };
  }

  // ─── Private Helpers ──────────────────────────────────────

  private static _mapSpecialistStatus(
    name: string,
    domain: string,
    result: SettledResult<unknown>,
  ): SpecialistStatus {
    return {
      name,
      domain,
      available: true,
      dashboardLoaded: result.status === "fulfilled",
      lastError: result.status === "rejected" ? String(result.reason) : undefined,
      loadTimeMs: 0,
    };
  }

  private static _extractHealthScore(specialist: string, result: SettledResult<unknown>): number {
    if (result.status === "rejected") return 0;
    const d = result.value as Record<string, unknown>;

    const overallScore = d?.overallScore;
    if (typeof overallScore === "number") return overallScore;
    if (typeof overallScore === "object" && overallScore !== null && "toNumber" in overallScore) {
      return (overallScore as { toNumber: () => number }).toNumber();
    }

    const healthScore = d?.healthScore;
    if (typeof healthScore === "number") return healthScore;

    if (specialist === "cfo") {
      const briefing = (d as Record<string, unknown>)?.briefing as Record<string, unknown> | undefined;
      if (briefing) return 70;
    }

    return 50;
  }

  private static _scoreToStatus(score: number): HealthBreakdownItem["status"] {
    if (score >= 85) return "excellent";
    if (score >= 70) return "good";
    if (score >= 50) return "warning";
    return "critical";
  }

  private static _composeKPIs(
    ctx: TenantContext,
    results: SettledResult<unknown>[],
  ): ExecutiveKPI[] {
    const kpis: ExecutiveKPI[] = [];
    const now = new Date();

    // CFO KPIs
    if (results[0]?.status === "fulfilled") {
      const d = results[0].value as Record<string, unknown>;
      const briefing = d?.briefing as Record<string, unknown> | undefined;
      if (briefing?.cashPosition) {
        const cp = briefing.cashPosition as Record<string, unknown>;
        kpis.push({
          id: "kpi-cash-position",
          name: "Cash Position",
          value: (cp.totalCash as number) ?? 0,
          unit: "USD",
          trend: "stable",
          status: "on-track",
          source: "cfo-advisor",
          lastUpdated: now,
          companyId: ctx.companyId,
        });
      }
      const priorities = d?.priorities as unknown[] | undefined;
      if (priorities) {
        kpis.push({
          id: "kpi-open-priorities",
          name: "Open Priorities",
          value: priorities.length,
          unit: "count",
          trend: "stable",
          status: priorities.length > 5 ? "warning" : "on-track",
          source: "cfo-advisor",
          lastUpdated: now,
          companyId: ctx.companyId,
        });
      }
    }

    // Controller KPIs
    if (results[1]?.status === "fulfilled") {
      const d = results[1].value as Record<string, unknown>;
      kpis.push({
        id: "kpi-open-journals",
        name: "Open Journals",
        value: (d.openJournals as number) ?? 0,
        unit: "count",
        trend: "stable",
        status: ((d.openJournals as number) ?? 0) > 10 ? "warning" : "on-track",
        source: "controller",
        lastUpdated: now,
        companyId: ctx.companyId,
      });
    }

    // Treasury KPIs
    if (results[2]?.status === "fulfilled") {
      const d = results[2].value as Record<string, unknown>;
      const cashPosition = d?.cashPosition as Record<string, unknown> | undefined;
      if (cashPosition?.totalBalance) {
        kpis.push({
          id: "kpi-treasury-balance",
          name: "Treasury Balance",
          value: Number(cashPosition.totalBalance),
          unit: "USD",
          trend: "stable",
          status: "on-track",
          source: "treasury",
          lastUpdated: now,
          companyId: ctx.companyId,
        });
      }
    }

    // Compliance KPIs
    if (results[3]?.status === "fulfilled") {
      const d = results[3].value as Record<string, unknown>;
      kpis.push({
        id: "kpi-open-violations",
        name: "Open Violations",
        value: (d.openViolations as number) ?? 0,
        unit: "count",
        trend: "stable",
        status: ((d.openViolations as number) ?? 0) > 0 ? "warning" : "on-track",
        source: "compliance",
        lastUpdated: now,
        companyId: ctx.companyId,
      });
    }

    // Audit KPIs
    if (results[4]?.status === "fulfilled") {
      const d = results[4].value as Record<string, unknown>;
      kpis.push({
        id: "kpi-open-findings",
        name: "Open Audit Findings",
        value: (d.openFindings as number) ?? 0,
        unit: "count",
        trend: "stable",
        status: ((d.openFindings as number) ?? 0) > 5 ? "warning" : "on-track",
        source: "audit",
        lastUpdated: now,
        companyId: ctx.companyId,
      });
    }

    // FPA KPIs
    if (results[5]?.status === "fulfilled") {
      const d = results[5].value as Record<string, unknown>;
      kpis.push({
        id: "kpi-active-forecasts",
        name: "Active Forecasts",
        value: (d.activeForecasts as number) ?? 0,
        unit: "count",
        trend: "stable",
        status: "on-track",
        source: "fpa",
        lastUpdated: now,
        companyId: ctx.companyId,
      });
    }

    // Tax KPIs
    if (results[6]?.status === "fulfilled") {
      const d = results[6].value as Record<string, unknown>;
      kpis.push({
        id: "kpi-tax-deadlines",
        name: "Open Tax Deadlines",
        value: (d.openDeadlines as number) ?? 0,
        unit: "count",
        trend: "stable",
        status: ((d.overdueDeadlines as number) ?? 0) > 0 ? "critical" : "on-track",
        source: "tax",
        lastUpdated: now,
        companyId: ctx.companyId,
      });
    }

    // Governance KPIs
    if (results[7]?.status === "fulfilled") {
      const d = results[7].value as Record<string, unknown>;
      kpis.push({
        id: "kpi-overdue-actions",
        name: "Overdue Board Actions",
        value: (d.overdueActions as number) ?? 0,
        unit: "count",
        trend: "stable",
        status: ((d.overdueActions as number) ?? 0) > 0 ? "warning" : "on-track",
        source: "governance",
        lastUpdated: now,
        companyId: ctx.companyId,
      });
    }

    return kpis;
  }

  private static _composeAlerts(
    ctx: TenantContext,
    results: SettledResult<unknown>[],
  ): ExecutiveAlert[] {
    const alerts: ExecutiveAlert[] = [];
    const now = new Date();

    // CFO alerts from critical alerts
    if (results[0]?.status === "fulfilled") {
      const d = results[0].value as Record<string, unknown>;
      const briefing = d?.briefing as Record<string, unknown> | undefined;
      const criticalAlerts = briefing?.criticalAlerts as unknown[] | undefined;
      if (criticalAlerts) {
        for (const a of criticalAlerts) {
          const alert = a as Record<string, unknown>;
          alerts.push({
            id: `alert-cfo-${alerts.length}`,
            severity: "high",
            category: "financial",
            title: String(alert.title ?? "CFO Alert"),
            message: String(alert.message ?? alert.description ?? ""),
            source: "cfo-advisor",
            actionRequired: true,
            createdAt: now,
            companyId: ctx.companyId,
          });
        }
      }
    }

    // Treasury alerts
    if (results[1]?.status === "fulfilled") {
      const d = results[1].value as Record<string, unknown>;
      // TreasurySpecialist returns alerts as an object { totalActive, bySeverity,
      // byType, criticalAlerts }. The item-level feed is criticalAlerts — mirror
      // the CFO block above, which reads briefing.criticalAlerts.
      const alertFeed = (d?.alerts as { criticalAlerts?: unknown[] } | undefined)?.criticalAlerts;
      if (alertFeed) {
        for (const a of alertFeed.slice(0, 10)) {
          const alert = a as Record<string, unknown>;
          alerts.push({
            id: `alert-treasury-${alerts.length}`,
            severity: (alert.severity as ExecutiveAlert["severity"]) ?? "medium",
            category: "treasury",
            title: String(alert.title ?? "Treasury Alert"),
            message: String(alert.message ?? alert.description ?? ""),
            source: "treasury",
            actionRequired: true,
            createdAt: now,
            companyId: ctx.companyId,
          });
        }
      }
    }

    // Compliance alerts from violations
    if (results[2]?.status === "fulfilled") {
      const d = results[2].value as Record<string, unknown>;
      const recentViolations = d?.recentViolations as unknown[] | undefined;
      if (recentViolations) {
        for (const v of recentViolations.slice(0, 10)) {
          const violation = v as Record<string, unknown>;
          alerts.push({
            id: `alert-compliance-${alerts.length}`,
            severity: (violation.severity as ExecutiveAlert["severity"]) ?? "medium",
            category: "compliance",
            title: String(violation.title ?? "Compliance Violation"),
            message: String(violation.description ?? ""),
            source: "compliance",
            actionRequired: true,
            createdAt: now,
            companyId: ctx.companyId,
          });
        }
      }
    }

    // Audit alerts from findings
    if (results[3]?.status === "fulfilled") {
      const d = results[3].value as Record<string, unknown>;
      const recentFindings = d?.recentFindings as unknown[] | undefined;
      if (recentFindings) {
        for (const f of recentFindings.slice(0, 10)) {
          const finding = f as Record<string, unknown>;
          alerts.push({
            id: `alert-audit-${alerts.length}`,
            severity: (finding.severity as ExecutiveAlert["severity"]) ?? "medium",
            category: "audit",
            title: String(finding.title ?? "Audit Finding"),
            message: String(finding.description ?? ""),
            source: "audit",
            actionRequired: true,
            createdAt: now,
            companyId: ctx.companyId,
          });
        }
      }
    }

    // Tax alerts from overdue deadlines
    if (results[4]?.status === "fulfilled") {
      const d = results[4].value as Record<string, unknown>;
      if ((d.overdueDeadlines as number) ?? 0 > 0) {
        alerts.push({
          id: `alert-tax-overdue`,
          severity: "critical",
          category: "tax",
          title: "Overdue Tax Deadlines",
          message: `${d.overdueDeadlines} tax deadline(s) are overdue`,
          source: "tax",
          actionRequired: true,
          createdAt: now,
          companyId: ctx.companyId,
        });
      }
    }

    const severityOrder: Record<string, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
      info: 4,
    };
    alerts.sort((a, b) => (severityOrder[a.severity] ?? 5) - (severityOrder[b.severity] ?? 5));

    return alerts;
  }

  private static _composeRecommendations(
    ctx: TenantContext,
    results: SettledResult<unknown>[],
  ): ExecutiveRecommendation[] {
    const recs: ExecutiveRecommendation[] = [];
    const now = new Date();

    // CFO recommendations
    if (results[0]?.status === "fulfilled") {
      const d = results[0].value as Record<string, unknown>;
      const recommendations = d?.recommendations as unknown[] | undefined;
      if (recommendations) {
        for (const r of recommendations.slice(0, 5)) {
          const rec = r as Record<string, unknown>;
          recs.push({
            id: `rec-cfo-${recs.length}`,
            title: String(rec.title ?? "CFO Recommendation"),
            category: "financial",
            priority: "medium",
            summary: String(rec.executiveSummary ?? rec.description ?? ""),
            businessReason: String(rec.businessReason ?? ""),
            confidence: typeof rec.confidence === "number" ? rec.confidence : 0.5,
            riskLevel: "medium",
            source: "cfo-advisor",
            requiredApprovals: [],
            status: (rec.status as ExecutiveRecommendation["status"]) ?? "pending",
            createdAt: now,
            companyId: ctx.companyId,
          });
        }
      }
    }

    // Compliance recommendations
    if (results[1]?.status === "fulfilled") {
      const d = results[1].value as Record<string, unknown>;
      const recs_ = d?.recommendations as unknown[] | undefined;
      if (recs_) {
        for (const r of recs_.slice(0, 5)) {
          const rec = r as Record<string, unknown>;
          recs.push({
            id: `rec-compliance-${recs.length}`,
            title: String(rec.title ?? "Compliance Recommendation"),
            category: "compliance",
            priority: "high",
            summary: String(rec.description ?? ""),
            businessReason: String(rec.businessReason ?? ""),
            confidence: 0.7,
            riskLevel: "medium",
            source: "compliance",
            requiredApprovals: [],
            status: "pending",
            createdAt: now,
            companyId: ctx.companyId,
          });
        }
      }
    }

    // Audit recommendations
    if (results[2]?.status === "fulfilled") {
      const d = results[2].value as Record<string, unknown>;
      const recs_ = d?.recommendations as unknown[] | undefined;
      if (recs_) {
        for (const r of recs_.slice(0, 5)) {
          const rec = r as Record<string, unknown>;
          recs.push({
            id: `rec-audit-${recs.length}`,
            title: String(rec.title ?? "Audit Recommendation"),
            category: "audit",
            priority: "high",
            summary: String(rec.description ?? ""),
            businessReason: String(rec.businessReason ?? ""),
            confidence: 0.8,
            riskLevel: "medium",
            source: "audit",
            requiredApprovals: [],
            status: "pending",
            createdAt: now,
            companyId: ctx.companyId,
          });
        }
      }
    }

    // FPA recommendations
    if (results[3]?.status === "fulfilled") {
      const d = results[3].value as Record<string, unknown>;
      const recs_ = d?.recentRecommendations as unknown[] | undefined;
      if (recs_) {
        for (const r of recs_.slice(0, 5)) {
          const rec = r as Record<string, unknown>;
          recs.push({
            id: `rec-fpa-${recs.length}`,
            title: String(rec.title ?? "FP&A Recommendation"),
            category: "planning",
            priority: "medium",
            summary: String(rec.description ?? ""),
            businessReason: String(rec.businessReason ?? ""),
            confidence: 0.6,
            riskLevel: "low",
            source: "fpa",
            requiredApprovals: [],
            status: "pending",
            createdAt: now,
            companyId: ctx.companyId,
          });
        }
      }
    }

    // Tax recommendations
    if (results[4]?.status === "fulfilled") {
      const d = results[4].value as Record<string, unknown>;
      const recs_ = d?.recommendations as unknown[] | undefined;
      if (recs_) {
        for (const r of recs_.slice(0, 5)) {
          const rec = r as Record<string, unknown>;
          recs.push({
            id: `rec-tax-${recs.length}`,
            title: String(rec.title ?? "Tax Recommendation"),
            category: "tax",
            priority: "medium",
            summary: String(rec.description ?? ""),
            businessReason: String(rec.businessReason ?? ""),
            confidence: 0.7,
            riskLevel: "medium",
            source: "tax",
            requiredApprovals: [],
            status: "pending",
            createdAt: now,
            companyId: ctx.companyId,
          });
        }
      }
    }

    return recs;
  }

  private static _composeRiskSummary(
    ctx: TenantContext,
    results: SettledResult<unknown>[],
  ): EnterpriseRiskSummary {
    const categories: RiskCategory[] = [];
    const topRisks: RiskItem[] = [];
    let mitigationProgress = 0;
    let riskCount = 0;
    let totalMitigation = 0;

    // Audit risk
    if (results[0]?.status === "fulfilled") {
      const d = results[0].value as Record<string, unknown>;
      const score = (d.overallScore as number) ?? 50;
      const riskScore = 100 - score;
      categories.push({
        name: "Audit & Controls",
        score: riskScore,
        trend: "stable",
        source: "audit",
      });

      const recentFindings = d.recentFindings as unknown[] | undefined;
      if (recentFindings) {
        for (const f of recentFindings.slice(0, 5)) {
          const finding = f as Record<string, unknown>;
          topRisks.push({
            id: `risk-audit-${topRisks.length}`,
            title: String(finding.title ?? "Audit Finding"),
            category: "audit",
            severity: (finding.severity as RiskItem["severity"]) ?? "medium",
            likelihood: 0.7,
            impact: 0.7,
            mitigation: String(finding.remediationStatus ?? "Pending review"),
            source: "audit",
            companyId: ctx.companyId,
          });
        }
      }
    }

    // Compliance risk
    if (results[1]?.status === "fulfilled") {
      const d = results[1].value as Record<string, unknown>;
      const health = d?.latestHealth as Record<string, unknown> | undefined;
      const healthScore = (health?.score as number) ?? 50;
      const riskScore = 100 - healthScore;
      categories.push({
        name: "Compliance",
        score: riskScore,
        trend: "stable",
        source: "compliance",
      });

      const recentViolations = d.recentViolations as unknown[] | undefined;
      if (recentViolations) {
        for (const v of recentViolations.slice(0, 5)) {
          const violation = v as Record<string, unknown>;
          topRisks.push({
            id: `risk-compliance-${topRisks.length}`,
            title: String(violation.title ?? "Compliance Violation"),
            category: "compliance",
            severity: (violation.severity as RiskItem["severity"]) ?? "medium",
            likelihood: 0.6,
            impact: 0.8,
            mitigation: String(violation.status ?? "Under review"),
            source: "compliance",
            companyId: ctx.companyId,
          });
        }
      }
    }

    // Treasury risk
    if (results[2]?.status === "fulfilled") {
      const d = results[2].value as Record<string, unknown>;
      const riskSummary = d?.riskSummary as Record<string, unknown> | undefined;
      if (riskSummary) {
        const score = (riskSummary.overallScore as number) ?? 50;
        categories.push({
          name: "Treasury",
          score,
          trend: "stable",
          source: "treasury",
        });
      }

      const alertFeed = (d?.alerts as { criticalAlerts?: unknown[] } | undefined)?.criticalAlerts;
      if (alertFeed) {
        for (const a of alertFeed.slice(0, 3)) {
          const alert = a as Record<string, unknown>;
          topRisks.push({
            id: `risk-treasury-${topRisks.length}`,
            title: String(alert.title ?? "Treasury Risk"),
            category: "treasury",
            severity: "medium",
            likelihood: 0.5,
            impact: 0.9,
            mitigation: String(alert.recommendation ?? "Monitor"),
            source: "treasury",
            companyId: ctx.companyId,
          });
        }
      }
    }

    for (const cat of categories) {
      riskCount++;
      totalMitigation += cat.score;
    }
    mitigationProgress = riskCount > 0 ? Math.round(totalMitigation / riskCount) : 0;

    return {
      overallScore: mitigationProgress,
      categories,
      topRisks,
      mitigationProgress,
      companyId: ctx.companyId,
    };
  }

  private static _composeCalendar(
    ctx: TenantContext,
    results: SettledResult<unknown>[],
  ): ExecutiveCalendarEvent[] {
    const events: ExecutiveCalendarEvent[] = [];

    // Governance — upcoming meetings
    if (results[0]?.status === "fulfilled") {
      const d = results[0].value as Record<string, unknown>;
      const upcomingMeetings = d?.upcomingMeetingsList as unknown[] | undefined;
      if (upcomingMeetings) {
        for (const m of upcomingMeetings) {
          const meeting = m as Record<string, unknown>;
          events.push({
            id: `cal-gov-${events.length}`,
            title: String(meeting.title ?? "Board Meeting"),
            type: "board-meeting",
            date: new Date(String(meeting.scheduledDate ?? Date.now())),
            source: "governance",
            status: "upcoming",
            companyId: ctx.companyId,
          });
        }
      }
    }

    // Compliance — upcoming filings
    if (results[1]?.status === "fulfilled") {
      const d = results[1].value as Record<string, unknown>;
      const upcomingFilings = d?.upcomingFilings as unknown[] | undefined;
      if (upcomingFilings) {
        for (const f of upcomingFilings) {
          const filing = f as Record<string, unknown>;
          events.push({
            id: `cal-comp-${events.length}`,
            title: String(filing.title ?? "Compliance Filing"),
            type: "filing-deadline",
            date: new Date(String(filing.dueDate ?? Date.now())),
            source: "compliance",
            status: "upcoming",
            companyId: ctx.companyId,
          });
        }
      }
    }

    // Tax — deadlines
    if (results[2]?.status === "fulfilled") {
      const d = results[2].value as Record<string, unknown>;
      const deadlines = d?.upcomingDeadlines as unknown[] | undefined;
      if (deadlines) {
        for (const dl of deadlines) {
          const deadline = dl as Record<string, unknown>;
          events.push({
            id: `cal-tax-${events.length}`,
            title: String(deadline.name ?? "Tax Deadline"),
            type: "filing-deadline",
            date: new Date(String(deadline.dueDate ?? Date.now())),
            source: "tax",
            status: "upcoming",
            companyId: ctx.companyId,
          });
        }
      }
    }

    // Audit — upcoming audits
    if (results[3]?.status === "fulfilled") {
      const d = results[3].value as Record<string, unknown>;
      const upcomingDeadlines = d?.upcomingDeadlines as unknown[] | undefined;
      if (upcomingDeadlines) {
        for (const dl of upcomingDeadlines) {
          const deadline = dl as Record<string, unknown>;
          events.push({
            id: `cal-audit-${events.length}`,
            title: String(deadline.title ?? "Audit Activity"),
            type: "audit",
            date: new Date(String(deadline.dueDate ?? deadline.scheduledDate ?? Date.now())),
            source: "audit",
            status: "upcoming",
            companyId: ctx.companyId,
          });
        }
      }
    }

    // Controller — close periods
    if (results[4]?.status === "fulfilled") {
      const d = results[4].value as Record<string, unknown>;
      const closePeriods = d?.closePeriods as unknown[] | undefined;
      if (closePeriods) {
        for (const cp of closePeriods) {
          const period = cp as Record<string, unknown>;
          events.push({
            id: `cal-ctrl-${events.length}`,
            title: String(period.name ?? "Close Period"),
            type: "close-period",
            date: new Date(String(period.dueDate ?? Date.now())),
            source: "controller",
            status: "upcoming",
            companyId: ctx.companyId,
          });
        }
      }
    }

    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    return events;
  }
}
