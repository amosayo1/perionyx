/**
 * Phase 23 — Enterprise Workflow Engine: Decision Intelligence Adapter
 *
 * Thin, typed bridge from the canonical Decision Intelligence engine
 * (Phase 22.5) into the Workflow Engine's decision consumption contract.
 * The workflow never reasons — it attaches the DI result and lets humans
 * judge. Only this adapter touches decision-engine types.
 */

import type {
  Decision,
  RecommendationCategory,
  DecisionConfidence,
  RiskLevel,
} from "@/modules/decision-engine";
import type { WorkflowDecisionContext } from "../types";

export function toWorkflowDecisionContext(decision: Decision): WorkflowDecisionContext {
  return {
    decisionId: decision.id,
    recommendation: decision.recommendation as RecommendationCategory,
    recommendationLabel: decision.recommendationLabel,
    confidence: decision.confidence as DecisionConfidence,
    risk: decision.riskAssessment.level as RiskLevel,
    requiredHumanActions: decision.requiredHumanActions,
    supportingEvidence: decision.supportingEvidence,
    missingEvidence: decision.missingEvidence.map((m) => m.label),
    decidedAt: decision.createdAt,
  };
}

/** True when the recommendation still requires a human operator. */
export function requiresHumanJudgment(
  recommendation: RecommendationCategory,
): boolean {
  return recommendation !== "approve";
}

/** True when the workflow must NOT auto-advance past this decision. */
export function blocksAutoAdvance(
  recommendation: RecommendationCategory,
): boolean {
  return recommendation === "reject" || recommendation === "escalate" || recommendation === "cannot-decide";
}
