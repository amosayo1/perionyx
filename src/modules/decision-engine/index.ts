/**
 * Phase 22.5 — Decision Intelligence Engine (canonical)
 *
 * The deterministic enterprise reasoning layer (Product System 06 — Decision
 * Intelligence). Evidence → evaluation → reasoning → recommendation → human
 * decision → audit. The engine never decides; it explains (PP-102).
 *
 * NOTE: `decision-engine` is the Phase 22.5 canonical module. The legacy
 * Phase 7 `decision-intelligence` module (evaluator/scoring engine) is a
 * separate, older capability and is untouched by this phase.
 */

export * from "./types";
export {
  matchCondition,
  matchesCondition,
  matchAnyConditions,
  evaluateRule,
  evaluateRules,
  triggeredRules,
  uniqueIds,
  RULE_LEVEL_ORDER,
} from "./rule-engine";
export {
  evaluatePolicy,
  evaluatePolicies,
  applicablePolicies,
  unsatisfiedPolicies,
} from "./policy-evaluator";
export {
  evaluateRiskFactor,
  assessRisk,
  RISK_ORDER,
} from "./risk-engine";
export {
  evaluateConfidenceFactor,
  confidenceScore,
  bandFromScore,
  deriveConfidence,
} from "./confidence";
export { buildReasoningGraph } from "./reasoning";
export { buildExplanation, buildAlternatives } from "./explanations";
export {
  synthesizeRecommendation,
  type RecommendationResult,
} from "./recommendation";
export {
  LEGAL_TRANSITIONS,
  transitionTo,
} from "./lifecycle";
export {
  DecisionTypeRegistry,
  getDecisionTypeRegistry,
  resetDecisionTypeRegistry,
} from "./registry";
export {
  DecisionIntelligenceEngine,
  DECISION_ENGINE_VERSION,
  labelFor,
  type DecisionEvaluation,
} from "./engine";
export {
  fromEvidencePackage,
  snapshotsFrom,
  type FromEvidenceOptions,
} from "./adapters/from-evidence";
export {
  AP_INVOICE_DECISION_TYPE,
  AP_DECISION_FACT_KEYS,
  registerAPDecisionProviders,
} from "./providers/ap-invoice";

// ──────────────────────────────────────────────────────────────────────────────
// Facade — the canonical entry points (22.5 API surface)
// ──────────────────────────────────────────────────────────────────────────────

import type { Decision, DecisionEvidence, DecisionExplanation } from "./types";
import type { DecisionEvaluation } from "./engine";
import { DecisionIntelligenceEngine } from "./engine";
import { registerAPDecisionProviders } from "./providers/ap-invoice";

let engine: DecisionIntelligenceEngine | null = null;

function getEngine(): DecisionIntelligenceEngine {
  if (!engine) {
    registerAPDecisionProviders();
    engine = new DecisionIntelligenceEngine();
  }
  return engine;
}

export function resetDecisionIntelligenceEngine(): void {
  engine = null;
}

export function evaluateEvidence(evidence: DecisionEvidence): DecisionEvaluation {
  return getEngine().evaluateEvidence(evidence);
}

export function buildRecommendation(evidence: DecisionEvidence): DecisionEvaluation["recommendation"] {
  return getEngine().buildRecommendation(evidence);
}

export function evaluateDecision(evidence: DecisionEvidence): Decision {
  return getEngine().evaluateDecision(evidence);
}

export function explainDecision(evidence: DecisionEvidence): DecisionExplanation {
  return getEngine().explainDecision(evidence);
}
