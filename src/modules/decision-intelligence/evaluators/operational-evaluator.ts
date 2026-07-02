import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { DecisionEvaluator } from "../engine";
import type { DecisionCategory, DecisionEvaluatorResult, Decision } from "../types";
import { makeDecision } from "../types";

export class OperationalDecisionEvaluator extends DecisionEvaluator {
  readonly category: DecisionCategory = "operational";
  readonly label = "Operational Decisions";

  async evaluate(ctx: TenantContext): Promise<DecisionEvaluatorResult> {
    const startedAt = Date.now();
    const decisions: Decision[] = [];

    const [connectors, syncLogs, queueStats] = await Promise.all([
      prisma.connectorConfig.findMany({ where: { companyId: ctx.companyId } }),
      prisma.syncLog.findMany({
        where: { companyId: ctx.companyId },
        orderBy: { startedAt: "desc" }, take: 100,
      }),
      prisma.connectorRun.findMany({
        where: { companyId: ctx.companyId, status: "FAILED" },
        orderBy: { createdAt: "desc" }, take: 50,
      }),
    ]);

    const inactiveConnectors = connectors.filter((c) => !c.active);
    const failedSyncs = syncLogs.filter((l) => l.status === "failed");

    // ── Investigate Connector Failures ──────────────────────────────────
    if (inactiveConnectors.length > 0) {
      decisions.push(makeDecision({
        type: "operational",
        title: "Investigate inactive connectors",
        description: `${inactiveConnectors.length} connector(s) are inactive: ${inactiveConnectors.map((c) => c.type).join(", ")}`,
        affectedAccounts: [],
        affectedEntities: ["engineering", "operations"],
        suggestedActions: [
          "Check OAuth token expiry for each",
          "Verify provider API status",
          "Re-initiate OAuth flow or repair credentials",
        ],
        supportingEvidence: inactiveConnectors.map((c) => `${c.type} (${c.id}) is inactive`),
        score: {
          businessValue: 4, urgency: 5, financialImpact: 3,
          operationalImpact: 5, confidence: 5, effort: 3, riskReduction: 4,
        },
        sourceService: "decision-intelligence:operational-evaluator",
        explainability: {
          why: `${inactiveConnectors.length} connectors are inactive, preventing data synchronization and potentially causing data gaps`,
          evidenceUsed: ["connector_configs"],
          forecastsConsidered: [],
          policiesInvolved: [],
          assumptions: ["Inactive connectors = lost data flow"],
          confidenceCalculation: "Confidence 5/5 — direct connector status query",
          expectedOutcome: "Connectors re-activated, data flow restored",
          alternativesConsidered: ["Replace with new connectors", "Decommission unused connectors"],
        },
      }));
    }

    // ── Increase Sync Frequency ─────────────────────────────────────────
    if (failedSyncs.length > 0 && syncLogs.length > 10) {
      const failureRate = failedSyncs.length / syncLogs.length;
      if (failureRate > 0.3) {
        decisions.push(makeDecision({
          type: "operational",
          title: "Reduce sync failure rate",
          description: `${Math.round(failureRate * 100)}% sync failure rate (${failedSyncs.length}/${syncLogs.length})`,
          affectedAccounts: [],
          affectedEntities: ["engineering"],
          suggestedActions: [
            "Review sync error logs per connector",
            "Check provider API rate limits",
            "Verify webhook endpoint availability",
          ],
          supportingEvidence: [
            `${failedSyncs.length} failed of ${syncLogs.length} recent syncs`,
            `${Math.round(failureRate * 100)}% failure rate`,
          ],
          score: {
            businessValue: 3, urgency: 4, financialImpact: 2,
            operationalImpact: 5, confidence: 4, effort: 3, riskReduction: 4,
          },
          sourceService: "decision-intelligence:operational-evaluator",
          explainability: {
            why: `${Math.round(failureRate * 100)}% sync failure rate indicates systemic connectivity or data issues`,
            evidenceUsed: ["sync_logs"],
            forecastsConsidered: [],
            policiesInvolved: [],
            assumptions: ["Failure rate > 30% requires investigation"],
            confidenceCalculation: "Confidence 4/5 — statistical failure rate analysis",
            expectedOutcome: "Sync reliability improved, data gaps minimized",
            alternativesConsidered: ["Reduce sync frequency", "Switch to manual sync"],
          },
        }));
      }
    }

    // ── Review Queue Congestion ─────────────────────────────────────────
    if (queueStats.length > 20) {
      decisions.push(makeDecision({
        type: "operational",
        title: "Review queue congestion",
        description: `${queueStats.length} failed connector runs — verify queue health`,
        affectedAccounts: [],
        affectedEntities: ["engineering", "operations"],
        suggestedActions: [
          "Clear failed job queue",
          "Review recurring failure patterns",
          "Increase worker capacity if needed",
        ],
        supportingEvidence: [
          `${queueStats.length} failed connector runs`,
          "High queue congestion impacts processing SLAs",
        ],
        score: {
          businessValue: 3, urgency: 3, financialImpact: 2,
          operationalImpact: 4, confidence: 4, effort: 2, riskReduction: 3,
        },
        sourceService: "decision-intelligence:operational-evaluator",
        explainability: {
          why: `${queueStats.length} failed connector runs indicate potential queue congestion or processing issues`,
          evidenceUsed: ["connector_runs"],
          forecastsConsidered: [],
          policiesInvolved: [],
          assumptions: ["Failed runs indicate systemic issues"],
          confidenceCalculation: "Confidence 4/5 — direct queue analysis",
          expectedOutcome: "Queue congestion resolved, processing normalized",
          alternativesConsidered: ["Increase retry limits", "Reduce job concurrency"],
        },
      }));
    }

    return { decisions, evaluatedAt: new Date().toISOString(), durationMs: Date.now() - startedAt };
  }
}
