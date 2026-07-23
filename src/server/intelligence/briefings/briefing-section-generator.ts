import { prisma } from "@/server/db/prisma";
import { insightRegistry } from "@/server/intelligence/insight-registry";
import { riskSignalAnalyzer } from "@/server/intelligence/risk-signal-analyzer";
import { recommendationEngine } from "@/server/intelligence/recommendation-engine";
import { businessHealthCalculator } from "@/server/intelligence/business-health-calculator";
import { businessNarrativeGenerator } from "./business-narrative-generator";
import type { BriefingSection, BriefingMetric, BriefingSectionType, ExecutiveRole } from "./types";

export class BriefingSectionGenerator {
  async generateAll(companyId: string, role: ExecutiveRole, config: { operatingThreshold: number }): Promise<BriefingSection[]> {
    const results = await Promise.allSettled([
      this.executiveOverview(companyId),
      this.cashPosition(companyId, config),
      this.treasuryStatus(companyId),
      this.liquidity(companyId, config),
      this.workflowHealth(companyId),
      this.approvalsAwaitingAction(companyId),
      this.complianceAlerts(companyId),
      this.riskSummary(companyId),
      this.operationalHealth(companyId),
      this.recentSignificantEvents(companyId),
      this.businessTrends(companyId),
      this.forecastHighlights(companyId),
      this.recommendedActions(companyId),
    ]);

    const types: BriefingSectionType[] = [
      "EXECUTIVE_OVERVIEW", "CASH_POSITION", "TREASURY_STATUS", "LIQUIDITY",
      "WORKFLOW_HEALTH", "APPROVALS_AWAITING_ACTION", "COMPLIANCE_ALERTS",
      "RISK_SUMMARY", "OPERATIONAL_HEALTH", "RECENT_SIGNIFICANT_EVENTS",
      "BUSINESS_TRENDS", "FORECAST_HIGHLIGHTS", "RECOMMENDED_ACTIONS",
    ];

    const sections: BriefingSection[] = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "fulfilled" && result.value) {
        sections.push(result.value);
      } else {
        sections.push(this.fallbackSection(types[i]));
      }
    }
    return sections;
  }

  private fallbackSection(type: BriefingSectionType): BriefingSection {
    return {
      type,
      title: this.sectionTitle(type),
      tone: "analytical",
      narrative: "Data is being updated for this section.",
      metrics: [],
      recommendations: [],
      dataFreshness: "unavailable",
      auditRef: `briefing-section-${type}-fallback-${Date.now()}`,
    };
  }

  private sectionTitle(type: BriefingSectionType): string {
    const titles: Record<BriefingSectionType, string> = {
      EXECUTIVE_OVERVIEW: "Executive Overview",
      CASH_POSITION: "Cash Position",
      TREASURY_STATUS: "Treasury Status",
      LIQUIDITY: "Liquidity",
      WORKFLOW_HEALTH: "Workflow Health",
      APPROVALS_AWAITING_ACTION: "Approvals Awaiting Action",
      COMPLIANCE_ALERTS: "Compliance Alerts",
      RISK_SUMMARY: "Risk Summary",
      OPERATIONAL_HEALTH: "Operational Health",
      RECENT_SIGNIFICANT_EVENTS: "Recent Significant Events",
      BUSINESS_TRENDS: "Business Trends",
      FORECAST_HIGHLIGHTS: "Forecast Highlights",
      RECOMMENDED_ACTIONS: "Recommended Actions",
    };
    return titles[type];
  }

  private async executiveOverview(companyId: string): Promise<BriefingSection> {
    const healths = await businessHealthCalculator.calculateHealth(companyId);
    const overall = await businessHealthCalculator.calculateOverallHealth(companyId);

    const metrics: BriefingMetric[] = [
      { label: "Business Health", value: `${(overall.score * 100).toFixed(0)}%`, changePercent: overall.score * 100, direction: overall.trend === "improving" ? "up" : overall.trend === "declining" ? "down" : "neutral", status: overall.score >= 0.7 ? "positive" : overall.score >= 0.4 ? "attention" : "negative", format: "percent" },
      ...healths.map((h) => ({
        label: `${h.category.charAt(0).toUpperCase() + h.category.slice(1)} Health`,
        value: `${(h.score * 100).toFixed(0)}%`,
        direction: h.trend === "improving" ? "up" as const : h.trend === "declining" ? "down" as const : "neutral" as const,
        status: h.score >= 0.7 ? "positive" as const : h.score >= 0.4 ? "attention" as const : "negative" as const,
      })),
    ];

    return {
      type: "EXECUTIVE_OVERVIEW",
      title: "Executive Overview",
      tone: "executive",
      narrative: businessNarrativeGenerator.generateSectionNarrative("EXECUTIVE_OVERVIEW", metrics),
      metrics,
      recommendations: [],
      dataFreshness: new Date().toISOString(),
      auditRef: `briefing-overview-${companyId}-${Date.now()}`,
    };
  }

  private async cashPosition(companyId: string, config: { operatingThreshold: number }): Promise<BriefingSection> {
    const wallets = await prisma.wallet.findMany({ where: { companyId } });
    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);

    const yesterday = new Date(Date.now() - 86_400_000);
    const recentTx = await prisma.transaction.count({
      where: { companyId, createdAt: { gte: yesterday } },
    });

    const metrics: BriefingMetric[] = [
      { label: "Total Cash", value: totalBalance, format: "currency", status: totalBalance >= config.operatingThreshold ? "positive" : "attention" },
      { label: "Operating Threshold", value: config.operatingThreshold, format: "currency" },
      { label: "Active Wallets", value: wallets.length, format: "number" },
      { label: "24h Transactions", value: recentTx, format: "number" },
    ];

    return {
      type: "CASH_POSITION",
      title: "Cash Position",
      tone: "analytical",
      narrative: businessNarrativeGenerator.generateSectionNarrative("CASH_POSITION", metrics),
      metrics,
      recommendations: [],
      dataFreshness: new Date().toISOString(),
      auditRef: `briefing-cash-${companyId}-${Date.now()}`,
    };
  }

  private async treasuryStatus(companyId: string): Promise<BriefingSection> {
    const [pendingTx, recentTransfers] = await Promise.all([
      prisma.transaction.count({ where: { companyId, status: "PENDING" } }),
      prisma.transaction.count({
        where: { companyId, createdAt: { gte: new Date(Date.now() - 86_400_000) } },
      }),
    ]);

    const metrics: BriefingMetric[] = [
      { label: "Pending Transactions", value: pendingTx, format: "number", status: pendingTx > 10 ? "attention" : "positive" },
      { label: "Recent Transfers (24h)", value: recentTransfers, format: "number" },
    ];

    return {
      type: "TREASURY_STATUS",
      title: "Treasury Status",
      tone: "analytical",
      narrative: businessNarrativeGenerator.generateSectionNarrative("TREASURY_STATUS", metrics),
      metrics,
      recommendations: [],
      dataFreshness: new Date().toISOString(),
      auditRef: `briefing-treasury-${companyId}-${Date.now()}`,
    };
  }

  private async liquidity(companyId: string, config: { operatingThreshold: number }): Promise<BriefingSection> {
    const wallets = await prisma.wallet.findMany({ where: { companyId } });
    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    const liquidWallets = wallets.filter((w) => w.kind === "STANDARD");
    const liquidBalance = liquidWallets.reduce((sum, w) => sum + Number(w.balance), 0);
    const ratio = config.operatingThreshold > 0 ? totalBalance / config.operatingThreshold : 0;

    const metrics: BriefingMetric[] = [
      { label: "Liquid Assets", value: liquidBalance, format: "currency" },
      { label: "Current Ratio", value: ratio.toFixed(2), format: "number", status: ratio >= 1.5 ? "positive" : ratio >= 1 ? "attention" : "negative" },
      { label: "Operating Threshold", value: config.operatingThreshold, format: "currency" },
    ];

    return {
      type: "LIQUIDITY",
      title: "Liquidity",
      tone: "analytical",
      narrative: businessNarrativeGenerator.generateSectionNarrative("LIQUIDITY", metrics),
      metrics,
      recommendations: [],
      dataFreshness: new Date().toISOString(),
      auditRef: `briefing-liquidity-${companyId}-${Date.now()}`,
    };
  }

  private async workflowHealth(companyId: string): Promise<BriefingSection> {
    const [running, completed, failed] = await Promise.all([
      prisma.workflowInstance.count({ where: { companyId, status: "RUNNING" } }),
      prisma.workflowInstance.count({ where: { companyId, status: "COMPLETED", createdAt: { gte: new Date(Date.now() - 86_400_000) } } }),
      prisma.workflowInstance.count({ where: { companyId, status: "FAILED", createdAt: { gte: new Date(Date.now() - 86_400_000) } } }),
    ]);

    const total = completed + failed;
    const successRate = total > 0 ? (completed / total) * 100 : 100;

    const metrics: BriefingMetric[] = [
      { label: "Running", value: running, format: "number" },
      { label: "Completed (24h)", value: completed, format: "number", status: "positive" },
      { label: "Failed (24h)", value: failed, format: "number", status: failed > 0 ? "negative" : "positive" },
      { label: "Success Rate", value: `${successRate.toFixed(0)}%`, format: "percent", status: successRate >= 95 ? "positive" : successRate >= 80 ? "attention" : "negative" },
    ];

    return {
      type: "WORKFLOW_HEALTH",
      title: "Workflow Health",
      tone: "analytical",
      narrative: businessNarrativeGenerator.generateSectionNarrative("WORKFLOW_HEALTH", metrics),
      metrics,
      recommendations: [],
      dataFreshness: new Date().toISOString(),
      auditRef: `briefing-workflow-${companyId}-${Date.now()}`,
    };
  }

  private async approvalsAwaitingAction(companyId: string): Promise<BriefingSection> {
    const [pending, overdue, highValueCount] = await Promise.all([
      prisma.transactionApproval.count({
        where: { transaction: { companyId }, status: "PENDING" },
      }),
      prisma.transactionApproval.count({
        where: { transaction: { companyId }, status: "PENDING", createdAt: { lt: new Date(Date.now() - 86_400_000) } },
      }),
      prisma.transactionApproval.count({
        where: { transaction: { companyId, primaryAmount: { gte: 50000 } }, status: "PENDING" },
      }),
    ]);

    const sla = pending > 0 ? ((pending - overdue) / pending) * 100 : 100;

    const metrics: BriefingMetric[] = [
      { label: "Pending Approvals", value: pending, format: "number", status: pending > 10 ? "attention" : pending > 0 ? "neutral" : "positive" },
      { label: "Overdue (>24h)", value: overdue, format: "number", status: overdue > 0 ? "negative" : "positive" },
      { label: "High Value (>$50K)", value: highValueCount, format: "number", status: highValueCount > 0 ? "attention" : "positive" },
      { label: "SLA Compliance", value: `${sla.toFixed(0)}%`, format: "percent", status: sla >= 95 ? "positive" : sla >= 80 ? "attention" : "negative" },
    ];

    return {
      type: "APPROVALS_AWAITING_ACTION",
      title: "Approvals Awaiting Action",
      tone: metrics.some((m) => m.status === "negative" || m.status === "attention") ? "alert" : "analytical",
      narrative: businessNarrativeGenerator.generateSectionNarrative("APPROVALS_AWAITING_ACTION", metrics),
      metrics,
      recommendations: this.generateApprovalRecommendations(pending, overdue, highValueCount),
      dataFreshness: new Date().toISOString(),
      auditRef: `briefing-approvals-${companyId}-${Date.now()}`,
    };
  }

  private async complianceAlerts(companyId: string): Promise<BriefingSection> {
    const [violations, alerts] = await Promise.all([
      prisma.policyViolation.count({ where: { companyId, status: "OPEN" } }),
      prisma.riskAlert.count({ where: { companyId, status: "OPEN" } }),
    ]);

    const totalPolicies = await prisma.policy.count({ where: { companyId, enabled: true } });
    const compliance = totalPolicies > 0 ? ((totalPolicies - violations) / totalPolicies) * 100 : 100;

    const metrics: BriefingMetric[] = [
      { label: "Policy Compliance", value: `${compliance.toFixed(0)}%`, format: "percent", status: compliance >= 95 ? "positive" : compliance >= 80 ? "attention" : "negative" },
      { label: "Open Violations", value: violations, format: "number", status: violations > 0 ? "negative" : "positive" },
      { label: "Active Alerts", value: alerts, format: "number", status: alerts > 0 ? "attention" : "positive" },
    ];

    return {
      type: "COMPLIANCE_ALERTS",
      title: "Compliance Alerts",
      tone: violations > 0 || alerts > 0 ? "alert" : "analytical",
      narrative: businessNarrativeGenerator.generateSectionNarrative("COMPLIANCE_ALERTS", metrics),
      metrics,
      recommendations: [],
      dataFreshness: new Date().toISOString(),
      auditRef: `briefing-compliance-${companyId}-${Date.now()}`,
    };
  }

  private async riskSummary(companyId: string): Promise<BriefingSection> {
    const assessment = await riskSignalAnalyzer.analyze(companyId);

    const metrics: BriefingMetric[] = [
      { label: "Risk Score", value: assessment.score, format: "number", status: assessment.score >= 30 ? "negative" : assessment.score >= 15 ? "attention" : "positive", direction: assessment.score > 0 ? "down" : "neutral" },
      { label: "Risk Level", value: assessment.level.charAt(0).toUpperCase() + assessment.level.slice(1) },
      { label: "Contributing Factors", value: assessment.contributingFactors.length, format: "number", status: assessment.contributingFactors.length > 0 ? "attention" : "positive" },
    ];

    return {
      type: "RISK_SUMMARY",
      title: "Risk Summary",
      tone: assessment.score >= 30 ? "alert" : assessment.score >= 15 ? "analytical" : "analytical",
      narrative: businessNarrativeGenerator.generateSectionNarrative("RISK_SUMMARY", metrics),
      metrics,
      recommendations: [],
      dataFreshness: new Date().toISOString(),
      auditRef: `briefing-risk-${companyId}-${Date.now()}`,
    };
  }

  private async operationalHealth(companyId: string): Promise<BriefingSection> {
    const [failedSyncs, activeConnectors, queueCount] = await Promise.all([
      prisma.connectorRun.count({ where: { companyId, status: "FAILED" } }),
      prisma.connectorConfig.count({ where: { companyId, active: true } }),
      prisma.workflowInstance.count({ where: { companyId, status: "PENDING" } }),
    ]);

    const connectorHealth = activeConnectors > 0 ? Math.max(0, 100 - failedSyncs * 10) : 100;

    const metrics: BriefingMetric[] = [
      { label: "Connector Health", value: `${connectorHealth.toFixed(0)}%`, format: "percent", status: connectorHealth >= 90 ? "positive" : connectorHealth >= 70 ? "attention" : "negative" },
      { label: "Active Connectors", value: activeConnectors, format: "number" },
      { label: "Failed Syncs", value: failedSyncs, format: "number", status: failedSyncs > 0 ? "negative" : "positive" },
      { label: "Queued Jobs", value: queueCount, format: "number" },
    ];

    return {
      type: "OPERATIONAL_HEALTH",
      title: "Operational Health",
      tone: "analytical",
      narrative: businessNarrativeGenerator.generateSectionNarrative("OPERATIONAL_HEALTH", metrics),
      metrics,
      recommendations: [],
      dataFreshness: new Date().toISOString(),
      auditRef: `briefing-operations-${companyId}-${Date.now()}`,
    };
  }

  private async recentSignificantEvents(companyId: string): Promise<BriefingSection> {
    const sixHoursAgo = new Date(Date.now() - 21_600_000);
    const events: BriefingMetric[] = [];

    const [failedWorkflows, criticalAlerts, largeTx, completedApprovals] = await Promise.all([
      prisma.workflowInstance.findMany({
        where: { companyId, status: "FAILED", createdAt: { gte: sixHoursAgo } },
        take: 3,
        orderBy: { createdAt: "desc" },
      }),
      prisma.riskAlert.findMany({
        where: { companyId, status: "OPEN", severity: "CRITICAL", createdAt: { gte: sixHoursAgo } },
        take: 3,
        orderBy: { createdAt: "desc" },
      }),
      prisma.transaction.findMany({
        where: { companyId, primaryAmount: { gte: 100000 }, createdAt: { gte: sixHoursAgo } },
        take: 3,
        orderBy: { createdAt: "desc" },
      }),
      prisma.transactionApproval.findMany({
        where: { transaction: { companyId }, status: "APPROVED", approvedAt: { gte: sixHoursAgo } },
        take: 3,
        orderBy: { approvedAt: "desc" },
      }),
    ]);

    for (const wf of failedWorkflows) {
      events.push({
        label: `Workflow Failed: ${wf.currentStepType ?? "unknown"}`,
        value: wf.lastError ?? "No error details",
        status: "negative",
      });
    }
    for (const alert of criticalAlerts) {
      events.push({
        label: `Critical Alert: ${alert.title}`,
        value: alert.description ?? "No description",
        status: "negative",
      });
    }
    for (const tx of largeTx) {
      events.push({
        label: "Large Transaction",
        value: `$${Number(tx.primaryAmount).toLocaleString()} ${tx.type}`,
        status: "neutral",
      });
    }
    for (const approval of completedApprovals) {
      events.push({
        label: "Approval Completed",
        value: `${approval.approvingUserRole ?? "Unknown role"} approved`,
        status: "positive",
      });
    }

    return {
      type: "RECENT_SIGNIFICANT_EVENTS",
      title: "Recent Significant Events",
      tone: events.some((e) => e.status === "negative") ? "alert" : "analytical",
      narrative: events.length > 0
        ? events.map((e) => `${e.label}: ${e.value}`).join(". ")
        : "No significant events in the last 6 hours.",
      metrics: events,
      recommendations: [],
      dataFreshness: new Date().toISOString(),
      auditRef: `briefing-events-${companyId}-${Date.now()}`,
    };
  }

  private async businessTrends(companyId: string): Promise<BriefingSection> {
    const now = Date.now();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today.getTime() - 86_400_000);
    const dayBefore = new Date(yesterday.getTime() - 86_400_000);

    const [todayTx, yesterdayTx, todayWf, yesterdayWf, todayApprovals, yesterdayApprovals] = await Promise.all([
      prisma.transaction.count({ where: { companyId, createdAt: { gte: today } } }),
      prisma.transaction.count({ where: { companyId, createdAt: { gte: yesterday, lt: today } } }),
      prisma.workflowInstance.count({ where: { companyId, status: "COMPLETED", completedAt: { gte: today } } }),
      prisma.workflowInstance.count({ where: { companyId, status: "COMPLETED", completedAt: { gte: yesterday, lt: today } } }),
      prisma.transactionApproval.count({ where: { transaction: { companyId }, status: "APPROVED", approvedAt: { gte: today } } }),
      prisma.transactionApproval.count({ where: { transaction: { companyId }, status: "APPROVED", approvedAt: { gte: yesterday, lt: today } } }),
    ]);

    const metrics: BriefingMetric[] = [];
    if (yesterdayTx > 0) {
      const txChange = ((todayTx - yesterdayTx) / yesterdayTx) * 100;
      metrics.push({
        label: "Transaction Volume", value: todayTx, previousValue: yesterdayTx, change: txChange,
        direction: txChange >= 0 ? "up" : "down", status: txChange >= 0 ? "positive" : "negative", format: "number",
      });
    }
    if (yesterdayWf > 0) {
      const wfChange = ((todayWf - yesterdayWf) / yesterdayWf) * 100;
      metrics.push({
        label: "Workflow Completions", value: todayWf, previousValue: yesterdayWf, change: wfChange,
        direction: wfChange >= 0 ? "up" : "down", status: wfChange >= 0 ? "positive" : "negative", format: "number",
      });
    }
    if (yesterdayApprovals > 0) {
      const apChange = ((todayApprovals - yesterdayApprovals) / yesterdayApprovals) * 100;
      metrics.push({
        label: "Approvals Granted", value: todayApprovals, previousValue: yesterdayApprovals, change: apChange,
        direction: apChange >= 0 ? "up" : "down", status: "positive", format: "number",
      });
    }

    return {
      type: "BUSINESS_TRENDS",
      title: "Business Trends",
      tone: "analytical",
      narrative: businessNarrativeGenerator.generateSectionNarrative("BUSINESS_TRENDS", metrics),
      metrics,
      recommendations: [],
      dataFreshness: new Date().toISOString(),
      auditRef: `briefing-trends-${companyId}-${Date.now()}`,
    };
  }

  private async forecastHighlights(companyId: string): Promise<BriefingSection> {
    const wallets = await prisma.wallet.findMany({ where: { companyId } });
    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);

    const pendingTx = await prisma.transaction.findMany({
      where: { companyId, status: "PENDING" },
      select: { primaryAmount: true, type: true },
    });

    const pendingOutflows = pendingTx
      .filter((t) => t.type === "WALLET_DEBIT" || t.type === "INTERNAL_TRANSFER")
      .reduce((sum, t) => sum + Number(t.primaryAmount), 0);
    const pendingInflows = pendingTx
      .filter((t) => t.type === "WALLET_CREDIT" || t.type === "ADJUSTMENT")
      .reduce((sum, t) => sum + Number(t.primaryAmount), 0);

    const projectedBalance = totalBalance - pendingOutflows + pendingInflows;

    const metrics: BriefingMetric[] = [
      { label: "Projected Balance", value: projectedBalance, format: "currency", status: projectedBalance >= 0 ? "positive" : "negative" },
      { label: "Pending Outflows", value: pendingOutflows, format: "currency", status: "attention" },
      { label: "Pending Inflows", value: pendingInflows, format: "currency", status: "positive" },
    ];

    return {
      type: "FORECAST_HIGHLIGHTS",
      title: "Forecast Highlights",
      tone: "analytical",
      narrative: businessNarrativeGenerator.generateSectionNarrative("FORECAST_HIGHLIGHTS", metrics),
      metrics,
      recommendations: [],
      dataFreshness: new Date().toISOString(),
      auditRef: `briefing-forecast-${companyId}-${Date.now()}`,
    };
  }

  private async recommendedActions(companyId: string): Promise<BriefingSection> {
    const recommendations = await recommendationEngine.generateRecommendations(companyId);

    const metrics: BriefingMetric[] = recommendations.slice(0, 5).map((r) => ({
      label: r.title,
      value: r.description,
      status: r.priority === "critical" ? "negative" : r.priority === "high" ? "attention" : "neutral",
    }));

    return {
      type: "RECOMMENDED_ACTIONS",
      title: "Recommended Actions",
      tone: metrics.some((m) => m.status === "negative") ? "alert" : "analytical",
      narrative: businessNarrativeGenerator.generateSectionNarrative("RECOMMENDED_ACTIONS", metrics),
      metrics,
      recommendations: [],
      dataFreshness: new Date().toISOString(),
      auditRef: `briefing-actions-${companyId}-${Date.now()}`,
    };
  }

  private generateApprovalRecommendations(pending: number, overdue: number, highValue: number) {
    if (pending === 0) return [];
    const recommendations = [];

    if (overdue > 0) {
      recommendations.push({
        type: "IMMEDIATE_ACTION" as const,
        title: "Escalate Overdue Approvals",
        description: `${overdue} approval${overdue !== 1 ? "s" : ""} exceed${overdue !== 1 ? "" : "s"} the 24-hour SLA`,
        rationale: "Overdue approvals create operational bottlenecks and may delay vendor payments",
        confidenceScore: 0.95,
        evidenceRef: `overdue-approvals-${overdue}`,
        relatedModule: "approvals",
        priority: "critical" as const,
      });
    }

    if (highValue > 0) {
      recommendations.push({
        type: "RECOMMENDED_REVIEW" as const,
        title: "Review High-Value Pending Approvals",
        description: `${highValue} transaction${highValue !== 1 ? "s" : ""} above policy limit${highValue !== 1 ? "s" : ""} require${highValue !== 1 ? "" : "s"} review`,
        rationale: "High-value transactions above policy limits carry increased financial risk",
        confidenceScore: 0.85,
        evidenceRef: `high-value-pending-${highValue}`,
        relatedModule: "approvals",
        priority: "high" as const,
      });
    }

    if (pending > overdue && overdue <= 0) {
      recommendations.push({
        type: "RECOMMENDED_REVIEW" as const,
        title: "Process Pending Approvals",
        description: `${pending} approval${pending !== 1 ? "s" : ""} awaiting action`,
        rationale: "Timely approval processing maintains operational velocity",
        confidenceScore: 0.8,
        evidenceRef: `pending-approvals-${pending}`,
        relatedModule: "approvals",
        priority: "medium" as const,
      });
    }

    return recommendations;
  }
}

export const briefingSectionGenerator = new BriefingSectionGenerator();
