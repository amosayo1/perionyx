import type { Insight, Signal, ScoredSignal } from "./types";
import { insightRegistry } from "./insight-registry";
import { priorityScorer } from "./priority-scorer";
import { businessSignalCollector } from "./business-signal-collector";

export class InsightAggregator {
  async aggregate(companyId: string): Promise<Insight[]> {
    const signals = await businessSignalCollector.collectAll(companyId);
    const scoredSignals = this.scoreSignals(signals);
    const newInsights = this.signalsToInsights(scoredSignals, companyId);

    for (const insight of newInsights) {
      insightRegistry.registerInsight(insight);
    }

    insightRegistry.removeExpired();
    return insightRegistry.getActiveInsights(companyId);
  }

  getInsightsByPriority(companyId: string, minPriority?: Insight["severity"]): Insight[] {
    const insights = insightRegistry.getActiveInsights(companyId);
    if (!minPriority) return insights;
    const priorityRank = ["informational", "low", "medium", "high", "critical"];
    const minRank = priorityRank.indexOf(minPriority);
    return insights.filter((i) => priorityRank.indexOf(i.severity) >= minRank);
  }

  acknowledgeInsight(insightId: string): void {
    insightRegistry.updateInsightStatus(insightId, "acknowledged");
  }

  dismissInsight(insightId: string): void {
    insightRegistry.updateInsightStatus(insightId, "dismissed");
  }

  resolveInsight(insightId: string): void {
    insightRegistry.updateInsightStatus(insightId, "resolved");
  }

  private scoreSignals(signals: Signal[]): ScoredSignal[] {
    return signals.map((signal) => {
      const { score, reason } = priorityScorer.scoreSignal(signal);
      return { ...signal, score, reason };
    });
  }

  private signalsToInsights(scoredSignals: ScoredSignal[], companyId: string): Insight[] {
    const insights: Insight[] = [];
    const threshold = 0.3;

    for (const signal of scoredSignals) {
      if (signal.score < threshold) continue;

      const severity = signal.score >= 0.8 ? "critical" : signal.score >= 0.6 ? "high" : signal.score >= 0.4 ? "medium" : "low";

      insights.push(this.buildInsight(signal, severity, companyId));
    }

    return insights;
  }

  private buildInsight(signal: ScoredSignal, severity: Insight["severity"], companyId: string): Insight {
    return {
      id: `insight-${signal.id}-${Date.now()}`,
      title: this.generateTitle(signal),
      description: `${signal.label} detected with score ${(signal.score * 100).toFixed(0)}%. ${signal.reason}.`,
      businessImpact: this.generateBusinessImpact(signal, severity),
      severity,
      category: this.mapSourceToCategory(signal.source),
      affectedModule: signal.source,
      recommendedAction: this.generateAction(signal),
      confidenceScore: signal.score,
      source: signal.source,
      evidenceRefs: [signal.id],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 900_000).toISOString(),
      status: "active",
      auditRef: `intel-${signal.id}-${Date.now()}`,
      companyId,
      metadata: signal.metadata,
    };
  }

  private generateTitle(signal: ScoredSignal): string {
    const titles: Record<string, string> = {
      pending_transactions: "Pending Transaction Backlog",
      pending_approvals: "Approval Queue Growing",
      overdue_approvals: "Approvals Exceeding SLA",
      active_alerts: "Active Risk Alerts Require Attention",
      critical_alerts: "Critical Risk Alerts Detected",
      open_violations: "Open Policy Violations",
      failed_instances: "Failed Workflow Instances",
      failed_syncs: "Connector Sync Failures",
    };
    return titles[signal.type] ?? `${signal.label} Signal Detected`;
  }

  private generateBusinessImpact(signal: ScoredSignal, severity: Insight["severity"]): string {
    const impacts: Record<string, string> = {
      high_pending_backlog: "Delayed transactions may impact cash flow visibility and counterparty trust.",
      overdue_approvals: "Approval delays can cascade into missed payment windows and compliance deadlines.",
      critical_alerts: "Unresolved critical alerts expose the organization to financial and regulatory risk.",
      open_violations: "Open policy violations may trigger audit findings and regulatory penalties.",
    };
    return impacts[signal.type] ?? `${severity.toUpperCase()} priority — impacts ${signal.source} operations.`;
  }

  private generateAction(signal: ScoredSignal): string {
    const actions: Record<string, string> = {
      pending_transactions: "Review pending transaction queue and process high-value items first.",
      pending_approvals: "Route pending approvals to delegated approvers or escalate urgent items.",
      overdue_approvals: "Escalate overdue approvals to secondary approvers. Review approval routing rules.",
      high_pending_backlog: "Increase approval capacity or adjust auto-approval thresholds for low-risk transactions.",
      active_alerts: "Review and resolve open alerts. Prioritize by severity and financial exposure.",
      critical_alerts: "Immediate investigation required. Assign incident owner per escalation policy.",
      open_violations: "Assign violation owners and set remediation deadlines. Escalate if past SLA.",
      failed_instances: "Review workflow error logs and retry failed instances. Update workflow definitions if needed.",
      failed_syncs: "Verify connector credentials and network connectivity. Re-run failed sync jobs.",
    };
    return actions[signal.type] ?? "Investigate signal source and take corrective action.";
  }

  private mapSourceToCategory(source: Signal["source"]): Insight["category"] {
    const map: Partial<Record<Signal["source"], Insight["category"]>> = {
      treasury: "treasury",
      payments: "financial",
      approvals: "approvals",
      workflow_engine: "workflow",
      automation_studio: "workflow",
      compliance: "compliance",
      risk: "risk",
      analytics: "financial",
      audit: "governance",
      policies: "compliance",
      notifications: "operational",
      users: "productivity",
      governance: "governance",
      reconciliation: "financial",
      connectors: "operational",
    };
    return map[source] ?? "operational";
  }
}

export const insightAggregator = new InsightAggregator();
