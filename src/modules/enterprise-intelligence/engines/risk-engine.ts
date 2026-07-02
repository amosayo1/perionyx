import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { IntelligenceEngine } from "../engine";
import type { IntelligenceCategory, IntelligenceEngineResult } from "../types";
import { makeInsight, makeRecommendation } from "../types";

export class RiskIntelligenceEngine extends IntelligenceEngine {
  readonly category: IntelligenceCategory = "risk";
  readonly label = "Risk Intelligence";

  async evaluate(ctx: TenantContext): Promise<IntelligenceEngineResult> {
    const startedAt = Date.now();
    const insights = [];
    const recommendations = [];

    const alerts = await prisma.riskAlert.findMany({
      where: { companyId: ctx.companyId, status: "OPEN" }, orderBy: { createdAt: "desc" }, take: 50,
    });

    if (alerts.length > 0) {
      const criticalAlerts = alerts.filter((a) => a.severity === "CRITICAL");

      if (criticalAlerts.length > 0) {
        insights.push(makeInsight({
          id: `risk-critical-alerts-${ctx.companyId}`, category: "risk",
          title: "Critical alerts require attention",
          description: `${criticalAlerts.length} critical risk alerts are open`,
          severity: "critical", confidence: 100, sourceData: ["risk_alerts"], timestamp: new Date().toISOString(),
          metadata: { criticalCount: criticalAlerts.length },
          explainability: {
            why: `${criticalAlerts.length} risk alerts are at CRITICAL severity`,
            evidence: criticalAlerts.map((a) => `[${a.category}] ${a.title}`),
            confidenceCalculation: "100% — direct alert severity query",
            whatToDo: "Investigate and resolve each critical alert immediately",
          },
        }));
        recommendations.push(makeRecommendation({
          id: `rec-risk-critical-${ctx.companyId}`, title: "Escalate critical alerts",
          description: `${criticalAlerts.length} critical alerts require immediate attention`,
          severity: "critical", confidence: 100, category: "risk",
          affectedEntities: ["risk", "compliance"], affectedAccounts: [],
          supportingEvidence: [`${criticalAlerts.length} critical alerts`, ...criticalAlerts.map((a) => `${a.category}: ${a.title}`)],
          suggestedActions: ["Assign critical alerts immediately", "Notify risk team", "Begin investigation"],
          relatedInsightIds: [`risk-critical-alerts-${ctx.companyId}`], relatedEventIds: [], timestamp: new Date().toISOString(),
        }));
      }

      if (alerts.length > 10) {
        insights.push(makeInsight({
          id: `risk-alert-pressure-${ctx.companyId}`, category: "risk",
          title: "Alert pressure", description: `${alerts.length} open risk alerts active`,
          severity: alerts.length > 25 ? "critical" : "high", confidence: 90,
          sourceData: ["risk_alerts"], timestamp: new Date().toISOString(),
          metadata: { openAlertCount: alerts.length },
          explainability: {
            why: `${alerts.length} open alerts exceeds the recommended threshold of 10`,
            evidence: [`${alerts.length} open alerts`, "Threshold: >10 alerts triggers analysis"],
            confidenceCalculation: "90% — threshold-based volume analysis",
            whatToDo: "Review and classify open alerts to reduce backlog",
          },
        }));
        recommendations.push(makeRecommendation({
          id: `rec-risk-alert-${ctx.companyId}`, title: "Reduce open alert backlog",
          description: `${alerts.length} open risk alerts — review and close`,
          severity: "high", confidence: 90, category: "risk",
          affectedEntities: ["risk"], affectedAccounts: [],
          supportingEvidence: [`${alerts.length} open alerts`, "Recommended max: 10 open alerts"],
          suggestedActions: ["Assign alerts to team members", "Batch-close false positives", "Prioritize by severity"],
          relatedInsightIds: [`risk-alert-pressure-${ctx.companyId}`], relatedEventIds: [], timestamp: new Date().toISOString(),
        }));
      }
    }

    return { insights, recommendations, evaluatedAt: new Date().toISOString(), durationMs: Date.now() - startedAt };
  }
}
