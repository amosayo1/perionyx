import type { BriefingMetric, BriefingSectionType } from "./types";

export class BusinessNarrativeGenerator {
  generateSectionNarrative(type: BriefingSectionType, metrics: BriefingMetric[]): string {
    switch (type) {
      case "EXECUTIVE_OVERVIEW": return this.executiveOverview(metrics);
      case "CASH_POSITION": return this.cashPosition(metrics);
      case "TREASURY_STATUS": return this.treasuryStatus(metrics);
      case "LIQUIDITY": return this.liquidity(metrics);
      case "WORKFLOW_HEALTH": return this.workflowHealth(metrics);
      case "APPROVALS_AWAITING_ACTION": return this.approvalsAwaiting(metrics);
      case "COMPLIANCE_ALERTS": return this.complianceAlerts(metrics);
      case "RISK_SUMMARY": return this.riskSummary(metrics);
      case "OPERATIONAL_HEALTH": return this.operationalHealth(metrics);
      case "RECENT_SIGNIFICANT_EVENTS": return this.recentEvents(metrics);
      case "BUSINESS_TRENDS": return this.businessTrends(metrics);
      case "FORECAST_HIGHLIGHTS": return this.forecastHighlights(metrics);
      case "RECOMMENDED_ACTIONS": return this.recommendedActions(metrics);
    }
  }

  private findMetric(metrics: BriefingMetric[], label: string): BriefingMetric | undefined {
    return metrics.find((m) => m.label.toLowerCase().includes(label.toLowerCase()));
  }

  private formatCurrency(value: string | number): string {
    const n = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(n)) return String(value);
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    return `$${n.toLocaleString()}`;
  }

  private formatPercent(value: string | number): string {
    const n = typeof value === "string" ? parseFloat(value) : value;
    return `${n.toFixed(1)}%`;
  }

  private executiveOverview(metrics: BriefingMetric[]): string {
    const health = this.findMetric(metrics, "health");
    const changes = metrics.filter((m) => m.label.toLowerCase().includes("change") || m.direction);
    const changeText = changes.length > 0
      ? changes.map((c) => `${c.label.toLowerCase()} ${c.direction === "up" ? "increased" : "decreased"} by ${this.formatPercent(c.change ?? 0)}`).join(", ")
      : "Key metrics remain within expected ranges";

    return `Business health is ${health ? `${this.formatPercent(health.value)}` : "stable"}. ${changeText}.`;
  }

  private cashPosition(metrics: BriefingMetric[]): string {
    const total = this.findMetric(metrics, "total");
    const operating = this.findMetric(metrics, "operating");
    const threshold = this.findMetric(metrics, "threshold");
    const change = this.findMetric(metrics, "change");

    const parts: string[] = [];

    if (total) {
      parts.push(`Total cash position is ${this.formatCurrency(total.value)}`);
    }

    if (operating && threshold) {
      const opVal = typeof operating.value === "string" ? parseFloat(operating.value) : operating.value;
      const thVal = typeof threshold.value === "string" ? parseFloat(threshold.value) : threshold.value;
      const ratio = thVal > 0 ? ((opVal - thVal) / thVal) * 100 : 0;

      if (ratio > 10) {
        parts.push(`exceeding the operating threshold by ${ratio.toFixed(0)}%`);
      } else if (ratio > 0) {
        parts.push(`above the operating threshold by ${ratio.toFixed(0)}%`);
      } else {
        parts.push(`below the operating threshold by ${Math.abs(ratio).toFixed(0)}%`);
      }
    }

    if (change && change.direction) {
      parts.push(`${change.direction === "up" ? "up" : "down"} ${this.formatCurrency(Math.abs(change.change ?? 0))} from previous period`);
    }

    return parts.length > 0 ? parts.join(", ") + "." : "Cash position data is being updated.";
  }

  private treasuryStatus(metrics: BriefingMetric[]): string {
    const pending = this.findMetric(metrics, "pending");
    const reconciled = this.findMetric(metrics, "reconciled");
    const recentTransfers = this.findMetric(metrics, "transfers");

    const parts: string[] = [];
    if (pending) parts.push(`${pending.value} pending transaction${pending.value !== 1 ? "s" : ""}`);
    if (reconciled) parts.push(`${this.formatPercent(reconciled.value)} reconciled`);
    if (recentTransfers) parts.push(`${recentTransfers.value} recent transfer${recentTransfers.value !== 1 ? "s" : ""}`);

    return parts.length > 0 ? parts.join("; ") + "." : "No significant treasury activity.";
  }

  private liquidity(metrics: BriefingMetric[]): string {
    const cashRunway = this.findMetric(metrics, "runway");
    const ratio = this.findMetric(metrics, "ratio");
    const totalLiq = this.findMetric(metrics, "liquid");

    const parts: string[] = [];
    if (totalLiq) parts.push(`Liquid assets total ${this.formatCurrency(totalLiq.value)}`);
    if (ratio) parts.push(`current ratio of ${ratio.value}`);
    if (cashRunway) parts.push(`cash runway of ${cashRunway.value}`);

    return parts.length > 0 ? parts.join(" with ") + "." : "Liquidity data is being updated.";
  }

  private workflowHealth(metrics: BriefingMetric[]): string {
    const running = this.findMetric(metrics, "running");
    const completed = this.findMetric(metrics, "completed");
    const failed = this.findMetric(metrics, "failed");
    const successRate = this.findMetric(metrics, "success");
    const change = this.findMetric(metrics, "change");

    const parts: string[] = [];
    if (running) parts.push(`${running.value} workflow${running.value !== 1 ? "s" : ""} running`);
    if (completed) parts.push(`${completed.value} completed`);
    if (failed && failed.value !== 0) parts.push(`${failed.value} failed`);
    if (successRate) parts.push(`${this.formatPercent(successRate.value)} success rate`);
    if (change) parts.push(`${change.direction === "up" ? "improved" : "declined"} by ${this.formatPercent(Math.abs(change.change ?? 0))}`);

    return parts.length > 0 ? parts.join(", ") + "." : "No workflow activity to report.";
  }

  private approvalsAwaiting(metrics: BriefingMetric[]): string {
    const pending = this.findMetric(metrics, "pending");
    const overdue = this.findMetric(metrics, "overdue");
    const sla = this.findMetric(metrics, "sla");
    const highValue = this.findMetric(metrics, "high");

    const parts: string[] = [];
    if (pending) parts.push(`${pending.value} approval${pending.value !== 1 ? "s" : ""} pending`);
    if (overdue && overdue.value !== 0) parts.push(`${overdue.value} exceed${overdue.value !== 1 ? "" : "s"} 24-hour SLA`);
    if (highValue) parts.push(`${highValue.value} above policy limit${highValue.value !== 1 ? "s" : ""}`);
    if (sla) parts.push(`${this.formatPercent(sla.value)} SLA compliance`);

    return parts.length > 0 ? parts.join(", ") + "." : "No pending approvals.";
  }

  private complianceAlerts(metrics: BriefingMetric[]): string {
    const violations = this.findMetric(metrics, "violations");
    const alerts = this.findMetric(metrics, "alerts");
    const compliance = this.findMetric(metrics, "compliance");
    const critical = this.findMetric(metrics, "critical");

    const parts: string[] = [];
    if (compliance) parts.push(`Compliance score at ${this.formatPercent(compliance.value)}`);
    if (violations && violations.value !== 0) parts.push(`${violations.value} open violation${violations.value !== 1 ? "s" : ""}`);
    if (alerts && alerts.value !== 0) parts.push(`${alerts.value} active alert${alerts.value !== 1 ? "s" : ""}`);
    if (critical && critical.value !== 0) parts.push(`${critical.value} critical`);

    return parts.length > 0 ? parts.join(", ") + "." : "No compliance issues detected.";
  }

  private riskSummary(metrics: BriefingMetric[]): string {
    const score = this.findMetric(metrics, "score");
    const factors = this.findMetric(metrics, "factors");
    const level = this.findMetric(metrics, "level");

    const parts: string[] = [];
    if (score) parts.push(`Risk score ${score.value}`);
    if (level) parts.push(`${level.value} level`);
    if (factors && factors.value !== 0) parts.push(`${factors.value} contributing factor${factors.value !== 1 ? "s" : ""}`);

    return parts.length > 0 ? parts.join(", ") + "." : "Risk assessment is current with no significant changes.";
  }

  private operationalHealth(metrics: BriefingMetric[]): string {
    const connectors = this.findMetric(metrics, "connector");
    const failedSyncs = this.findMetric(metrics, "failed");
    const queue = this.findMetric(metrics, "queue");

    const parts: string[] = [];
    if (connectors) parts.push(`Connector health at ${this.formatPercent(connectors.value)}`);
    if (failedSyncs && failedSyncs.value !== 0) parts.push(`${failedSyncs.value} failed sync${failedSyncs.value !== 1 ? "s" : ""}`);
    if (queue && queue.value !== 0) parts.push(`${queue.value} queued job${queue.value !== 1 ? "s" : ""}`);

    return parts.length > 0 ? parts.join(", ") + "." : "All operational systems normal.";
  }

  private recentEvents(metrics: BriefingMetric[]): string {
    if (metrics.length === 0) return "No significant events in the reporting period.";
    return metrics.map((m) => `${m.label}: ${m.value}`).join(". ") + ".";
  }

  private businessTrends(metrics: BriefingMetric[]): string {
    if (metrics.length === 0) return "Trend data is being calculated.";
    return metrics.map((m) => {
      const dir = m.direction === "up" ? "increased" : m.direction === "down" ? "decreased" : "remained stable";
      return `${m.label} ${dir} by ${this.formatPercent(Math.abs(m.change ?? 0))}`;
    }).join(", ") + ".";
  }

  private forecastHighlights(metrics: BriefingMetric[]): string {
    const projected = this.findMetric(metrics, "projected");
    const confidence = this.findMetric(metrics, "confidence");
    const upcoming = this.findMetric(metrics, "upcoming");

    const parts: string[] = [];
    if (projected) parts.push(`Projected balance ${this.formatCurrency(projected.value)}`);
    if (confidence) parts.push(`${this.formatPercent(confidence.value)} confidence`);
    if (upcoming && upcoming.value !== 0) parts.push(`${upcoming.value} upcoming obligation${upcoming.value !== 1 ? "s" : ""}`);

    return parts.length > 0 ? parts.join(", ") + "." : "Forecast data is being generated.";
  }

  private recommendedActions(metrics: BriefingMetric[]): string {
    if (metrics.length === 0) return "No recommended actions at this time.";
    return metrics.map((m, i) => `${i + 1}. ${m.label}: ${m.value}`).join(" ");
  }
}

export const businessNarrativeGenerator = new BusinessNarrativeGenerator();
