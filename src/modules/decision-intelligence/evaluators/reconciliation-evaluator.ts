import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { DecisionEvaluator } from "../engine";
import type { DecisionCategory, DecisionEvaluatorResult, Decision } from "../types";
import { makeDecision } from "../types";

export class ReconciliationDecisionEvaluator extends DecisionEvaluator {
  readonly category: DecisionCategory = "reconciliation";
  readonly label = "Reconciliation Decisions";

  async evaluate(ctx: TenantContext): Promise<DecisionEvaluatorResult> {
    const startedAt = Date.now();
    const decisions: Decision[] = [];

    const [reconRuns, reconExceptions, failedRuns] = await Promise.all([
      prisma.reconciliationRun.findMany({
        where: { companyId: ctx.companyId },
        orderBy: { createdAt: "desc" }, take: 20,
      }),
      prisma.reconciliationException.findMany({
        where: { run: { companyId: ctx.companyId } },
        orderBy: { createdAt: "desc" }, take: 50,
      }),
      prisma.reconciliationRun.count({
        where: { companyId: ctx.companyId, status: "FAILED" },
      }),
    ]);

    // ── Prioritize Exceptions ───────────────────────────────────────────
    if (reconExceptions.length > 0) {
      decisions.push(makeDecision({
        type: "reconciliation",
        title: "Prioritize reconciliation exceptions",
        description: `${reconExceptions.length} unmatched exceptions require investigation`,
        affectedAccounts: [],
        affectedEntities: ["operations", "finance"],
        suggestedActions: [
          "Review highest-value exceptions first",
          "Categorize by type (missing, duplicate, mismatch)",
          "Assign to team members by category",
        ],
        supportingEvidence: [
          `${reconExceptions.length} total exceptions`,
          `${failedRuns} failed reconciliation runs`,
        ],
        score: {
          businessValue: 3, urgency: 3, financialImpact: 3,
          operationalImpact: 3, confidence: 4, effort: 3, riskReduction: 4,
        },
        sourceService: "decision-intelligence:reconciliation-evaluator",
        explainability: {
          why: `${reconExceptions.length} exceptions indicate discrepancies between internal and external records`,
          evidenceUsed: ["reconciliation_exceptions", "reconciliation_runs"],
          forecastsConsidered: [],
          policiesInvolved: [],
          assumptions: ["Unresolved exceptions accumulate financial risk"],
          confidenceCalculation: "Confidence 4/5 — direct exception count analysis",
          expectedOutcome: "Exceptions investigated and resolved, improving financial accuracy",
          alternativesConsidered: ["Auto-match below thresholds", "Batch resolution by type"],
        },
      }));
    }

    // ── Investigate Duplicates ──────────────────────────────────────────
    const duplicateExceptions = reconExceptions.filter((e) => {
      const meta = e.details as { reason?: string } | null;
      return meta?.reason?.toLowerCase().includes("duplicate");
    });
    if (duplicateExceptions.length > 0) {
      decisions.push(makeDecision({
        type: "reconciliation",
        title: "Investigate duplicate transactions",
        description: `${duplicateExceptions.length} reconciliation exceptions flagged as duplicates`,
        affectedAccounts: [],
        affectedEntities: ["operations", "finance"],
        suggestedActions: [
          "Identify and merge duplicate records",
          "Check for duplicate external entries",
          "Update matching rules to catch duplicates",
        ],
        supportingEvidence: [
          `${duplicateExceptions.length} duplicate-flagged exceptions`,
          "Duplicates inflate exception counts and distort match rates",
        ],
        score: {
          businessValue: 3, urgency: 3, financialImpact: 4,
          operationalImpact: 3, confidence: 3, effort: 3, riskReduction: 4,
        },
        sourceService: "decision-intelligence:reconciliation-evaluator",
        explainability: {
          why: `${duplicateExceptions.length} exceptions are flagged as duplicates, potentially inflating counts and hiding real exceptions`,
          evidenceUsed: ["reconciliation_exceptions"],
          forecastsConsidered: [],
          policiesInvolved: [],
          assumptions: ["Duplicate detection metadata is accurate"],
          confidenceCalculation: "Confidence 3/5 — depends on metadata quality",
          expectedOutcome: "Duplicate records resolved, exception count normalized",
          alternativesConsidered: ["Auto-merge duplicates", "Ignore below threshold"],
        },
      }));
    }

    // ── Missing Entries ────────────────────────────────────────────────
    const missingExceptions = reconExceptions.filter((e) => {
      const meta = e.details as { reason?: string } | null;
      return meta?.reason?.toLowerCase().includes("missing");
    });
    if (missingExceptions.length > 0) {
      decisions.push(makeDecision({
        type: "reconciliation",
        title: "Investigate missing entries",
        description: `${missingExceptions.length} exceptions indicate missing records`,
        affectedAccounts: [],
        affectedEntities: ["operations", "finance"],
        suggestedActions: [
          "Check external provider for missing data",
          "Verify sync completeness",
          "Re-sync affected accounts",
        ],
        supportingEvidence: [
          `${missingExceptions.length} missing-entry exceptions`,
          "Missing entries may indicate sync failures or data loss",
        ],
        score: {
          businessValue: 3, urgency: 4, financialImpact: 3,
          operationalImpact: 4, confidence: 3, effort: 3, riskReduction: 4,
        },
        sourceService: "decision-intelligence:reconciliation-evaluator",
        explainability: {
          why: `${missingExceptions.length} exceptions where records exist in one system but not the other`,
          evidenceUsed: ["reconciliation_exceptions"],
          forecastsConsidered: [],
          policiesInvolved: [],
          assumptions: ["Missing entries indicate data completeness issues"],
          confidenceCalculation: "Confidence 3/5 — depends on exception metadata accuracy",
          expectedOutcome: "Missing entries identified and resolved, data integrity restored",
          alternativesConsidered: ["Trigger auto-resync", "Manual investigation per case"],
        },
      }));
    }

    return { decisions, evaluatedAt: new Date().toISOString(), durationMs: Date.now() - startedAt };
  }
}
