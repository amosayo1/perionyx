import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { IntelligenceEngine } from "../engine";
import type { IntelligenceCategory, IntelligenceEngineResult } from "../types";
import { makeInsight, makeRecommendation } from "../types";

export class OperationalIntelligenceEngine extends IntelligenceEngine {
  readonly category: IntelligenceCategory = "operational";
  readonly label = "Operational Intelligence";

  async evaluate(ctx: TenantContext): Promise<IntelligenceEngineResult> {
    const startedAt = Date.now();
    const insights = [];
    const recommendations = [];

    const connectors = await prisma.connectorConfig.findMany({ where: { companyId: ctx.companyId } });
    const syncLogs = await prisma.syncLog.findMany({ where: { companyId: ctx.companyId }, orderBy: { startedAt: "desc" }, take: 100 });
    const pendingApprovals = await prisma.transactionApproval.count({ where: { companyId: ctx.companyId, status: "PENDING" } });

    const disconnected = connectors.filter((c) => !c.active);
    if (disconnected.length > 0) {
      insights.push(makeInsight({
        id: `ops-disconnected-${ctx.companyId}`, category: "operational",
        title: "Disconnected connectors",
        description: `${disconnected.length} connector(s) are inactive: ${disconnected.map((c) => c.type).join(", ")}`,
        severity: "critical", confidence: 100, sourceData: ["connector_configs"], timestamp: new Date().toISOString(),
        affectedEntities: disconnected.map((c) => c.id),
        explainability: {
          why: `${disconnected.length} connector(s) are marked inactive, preventing data synchronization`,
          evidence: disconnected.map((c) => `${c.type} (${c.id}) is inactive`),
          confidenceCalculation: "100% — direct connector status query",
          whatToDo: "Re-establish connections to restore data flow",
        },
      }));
      recommendations.push(makeRecommendation({
        id: `rec-ops-connect-${ctx.companyId}`, title: "Reconnect disconnected connectors",
        description: `${disconnected.length} connector(s) inactive — re-establish connections`,
        severity: "critical", confidence: 100, category: "operational",
        affectedEntities: ["engineering", "operations"], affectedAccounts: [],
        supportingEvidence: [`${disconnected.length} connectors inactive`, ...disconnected.map((c) => `${c.type} (${c.id})`)],
        suggestedActions: ["Check OAuth token expiry", "Verify provider API status", "Re-initiate OAuth flow"],
        relatedInsightIds: [`ops-disconnected-${ctx.companyId}`], relatedEventIds: [], timestamp: new Date().toISOString(),
      }));
    }

    const failedSyncs = syncLogs.filter((l) => l.status === "failed");
    if (failedSyncs.length > 5) {
      insights.push(makeInsight({
        id: `ops-failed-syncs-${ctx.companyId}`, category: "operational",
        title: "Elevated sync failure rate",
        description: `${failedSyncs.length} of last ${syncLogs.length} syncs failed`,
        severity: failedSyncs.length > syncLogs.length * 0.3 ? "critical" : "high", confidence: 90, direction: "up",
        sourceData: ["sync_logs"], timestamp: new Date().toISOString(),
        metadata: { failedCount: failedSyncs.length, totalCount: syncLogs.length },
        explainability: {
          why: `${failedSyncs.length} of ${syncLogs.length} recent syncs failed (${Math.round((failedSyncs.length / syncLogs.length) * 100)}%)`,
          evidence: [`${Math.round((failedSyncs.length / syncLogs.length) * 100)}% failure rate`, "Threshold: >5 failures triggers analysis"],
          confidenceCalculation: "90% — statistical failure rate analysis",
          whatToDo: "Investigate failed syncs and check provider API connectivity",
        },
      }));
      recommendations.push(makeRecommendation({
        id: `rec-ops-sync-${ctx.companyId}`, title: "Investigate sync failures",
        description: `${failedSyncs.length} of ${syncLogs.length} recent syncs failed (${Math.round((failedSyncs.length / syncLogs.length) * 100)}%)`,
        severity: "high", confidence: 85, category: "operational",
        affectedEntities: ["engineering"], affectedAccounts: [],
        supportingEvidence: [`${Math.round((failedSyncs.length / syncLogs.length) * 100)}% failure rate`, "Threshold: >5 failures triggers investigation"],
        suggestedActions: ["Review sync error logs", "Check provider API rate limits", "Verify webhook endpoints"],
        relatedInsightIds: [`ops-failed-syncs-${ctx.companyId}`], relatedEventIds: [], timestamp: new Date().toISOString(),
      }));
    }

    if (pendingApprovals > 10) {
      insights.push(makeInsight({
        id: `ops-pending-approvals-${ctx.companyId}`, category: "operational",
        title: "Approval queue backlog",
        description: `${pendingApprovals} pending transaction approvals`,
        severity: pendingApprovals > 25 ? "high" : "medium", confidence: 100, direction: "up",
        sourceData: ["transaction_approvals"], timestamp: new Date().toISOString(),
        metadata: { pendingCount: pendingApprovals },
        explainability: {
          why: `${pendingApprovals} pending approvals exceeds the recommended maximum of 10`,
          evidence: [`${pendingApprovals} pending approvals`, "Threshold: >10 triggers analysis"],
          confidenceCalculation: "100% — direct approval count",
          whatToDo: "Assign or escalate pending approvals to clear the backlog",
        },
      }));
      recommendations.push(makeRecommendation({
        id: `rec-ops-approvals-${ctx.companyId}`, title: "Clear approval backlog",
        description: `${pendingApprovals} pending approvals — assign or expedite`,
        severity: "medium", confidence: 90, category: "operational",
        affectedEntities: ["operations", "finance"], affectedAccounts: [],
        supportingEvidence: [`${pendingApprovals} pending approvals`, "Recommended max: 10 pending"],
        suggestedActions: ["Send approval reminder notifications", "Re-assign unassigned approvals", "Escalate aging approvals"],
        relatedInsightIds: [`ops-pending-approvals-${ctx.companyId}`], relatedEventIds: [], timestamp: new Date().toISOString(),
      }));
    }

    return { insights, recommendations, evaluatedAt: new Date().toISOString(), durationMs: Date.now() - startedAt };
  }
}
