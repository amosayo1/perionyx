import type { WidgetRecommendation } from "./types";
import { ROLE_DEFAULT_WIDGETS } from "./types";
import { userBehaviorAnalyzer } from "./user-behavior-analyzer";

export class WidgetRecommendationEngine {
  recommend(
    userId: string,
    companyId: string,
    roles: string[],
    limit = 8,
  ): WidgetRecommendation[] {
    const recommendations: WidgetRecommendation[] = [];
    const seen = new Set<string>();

    for (const role of roles) {
      const roleWidgets = this.getRoleWidgets(role);
      for (const widget of roleWidgets) {
        if (!seen.has(widget.widgetId)) {
          recommendations.push(widget);
          seen.add(widget.widgetId);
        }
      }
    }

    const behaviorWidgets = this.getBehaviorWidgets(userId, companyId);
    for (const widget of behaviorWidgets) {
      if (!seen.has(widget.widgetId)) {
        recommendations.push(widget);
        seen.add(widget.widgetId);
      }
    }

    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  private getRoleWidgets(role: string): WidgetRecommendation[] {
    const upperRole = role.toUpperCase().replace(/\s+/g, "_");
    const widgetIds = ROLE_DEFAULT_WIDGETS[upperRole];
    if (!widgetIds) return [];

    const scoreMap: Record<string, number> = {
      cash_position: 1.0, forecast_summary: 0.95, executive_briefing: 0.9,
      board_kpis: 0.9, strategic_risks: 0.85, approval_summary: 0.8,
      liquidity_overview: 1.0, bank_positions: 0.95, cash_forecast: 0.9,
      payment_queue: 0.85, fx_exposure: 0.8,
      reconciliation_status: 1.0, month_end_progress: 0.95, journal_review: 0.85,
      financial_statements: 0.9, compliance_status: 0.8,
      team_activity: 0.9, approval_queue: 1.0, workflow_status: 0.85,
      report_list: 0.7, invoice_summary: 0.8,
      audit_trail: 1.0, policy_changes: 0.9, risk_events: 0.9,
      compliance_reports: 0.85, exception_tracker: 0.8,
      system_health: 0.9, user_activity: 0.85, connector_status: 0.8,
      security_alerts: 0.9, config_summary: 0.7,
      workflow_health: 1.0, automation_status: 0.9, connector_health: 0.85,
      queue_metrics: 0.8, incident_log: 0.85,
    };

    return widgetIds.map((id) => ({
      widgetId: id,
      title: id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      reason: `Recommended for your role (${upperRole})`,
      score: scoreMap[id] ?? 0.7,
      source: "role_default",
      module: this.widgetModule(id),
    }));
  }

  private getBehaviorWidgets(userId: string, companyId: string): WidgetRecommendation[] {
    const frequentModules = userBehaviorAnalyzer.getFrequentModuleNames(userId, companyId);
    return frequentModules.slice(0, 3).map((mod) => ({
      widgetId: `${mod}-activity`,
      title: `${mod.charAt(0).toUpperCase() + mod.slice(1)} Activity`,
      reason: `Based on your frequent use of ${mod}`,
      score: 0.6,
      source: "behavior",
      module: mod,
    }));
  }

  private widgetModule(widgetId: string): string {
    const map: Record<string, string> = {
      cash_position: "treasury", liquidity_overview: "treasury",
      bank_positions: "treasury", cash_forecast: "treasury",
      reconciliation_status: "treasury", month_end_progress: "analytics",
      approval_summary: "approvals", approval_queue: "approvals",
      workflow_status: "workflows", workflow_health: "workflows",
      audit_trail: "audit", risk_events: "risk", strategic_risks: "risk",
      compliance_status: "compliance", compliance_reports: "compliance",
    };
    return map[widgetId] ?? "analytics";
  }
}

export const widgetRecommendationEngine = new WidgetRecommendationEngine();
