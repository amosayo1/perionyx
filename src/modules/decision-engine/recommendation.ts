/**
 * Phase 22.5 — Decision Intelligence: Recommendation
 *
 * Deterministic recommendation synthesis. The recommendation is derived from
 * triggered rules, applicable policies, risk, and evidence completeness —
 * nothing else. No LLM, no probabilities, no free-text recommendations.
 *
 * Priority (highest first):
 *   1. terminal state         → cannot-decide (no decision pending)
 *   2. blocking evidence gap  → cannot-decide (never recommend on blocked info)
 *   3. block rule             → reject
 *   4. escalate rule / risk ≥ high → escalate
 *   5. review rule / risk medium / unsatisfied applicable policy → needs-review
 *   6. warning rule           → approve-with-warning
 *   7. otherwise              → approve
 *
 * The engine explains the decision but never makes it (PP-102, DI-R1).
 */

import type {
  DecisionConfidenceResult,
  DecisionEvidence,
  PolicyEvaluation,
  RiskAssessment,
  RuleEvaluation,
  RecommendationCategory,
} from "./types";
import { RULE_LEVEL_ORDER } from "./rule-engine";
import { RISK_ORDER } from "./risk-engine";

export interface RecommendationResult {
  category: RecommendationCategory;
  reason: string;
  driver: "terminal" | "evidence-gap" | "block" | "escalate" | "review" | "warning" | "clean";
  triggeredRules: RuleEvaluation[];
  requiredHumanActions: string[];
  nextAction: string | null;
}

export function synthesizeRecommendation(input: {
  evidence: DecisionEvidence;
  ruleResults: RuleEvaluation[];
  policyResults: PolicyEvaluation[];
  risk: RiskAssessment;
  confidence: DecisionConfidenceResult;
}): RecommendationResult {
  const { evidence, ruleResults, policyResults, risk } = input;
  const triggered = ruleResults.filter((r) => r.triggered);
  const worstTriggered = triggered.reduce<RuleEvaluation | null>((acc, r) => {
    if (acc === null) return r;
    return RULE_LEVEL_ORDER[r.level!] < RULE_LEVEL_ORDER[acc.level!] ? r : acc;
  }, null);

  // 1. Terminal state — no decision pending on this entity.
  if (evidence.state === "terminal") {
    return terminalResult(evidence);
  }

  // 2. Blocking evidence gaps — never recommend on blocked information.
  const blocking = evidence.missing.filter((m) => m.impact === "blocking");
  if (blocking.length > 0) {
    const labels = blocking.map((b) => b.label).join("; ");
    return {
      category: "cannot-decide",
      reason: `Blocking evidence is missing: ${labels}. The decision is deferred until the gaps are resolved.`,
      driver: "evidence-gap",
      triggeredRules: triggered,
      requiredHumanActions: [
        `Resolve the blocking evidence gaps before any decision is made: ${labels}.`,
        "Do not approve or pay while blocked evidence is unresolved.",
      ],
      nextAction: `Resolve missing evidence: ${labels}`,
    };
  }

  // 3. Block rule → reject.
  if (worstTriggered && worstTriggered.level === "block") {
    return {
      category: "reject",
      reason: `Blocking rule "${worstTriggered.label}" (${worstTriggered.ruleId}) fired: ${worstTriggered.reason}`,
      driver: "block",
      triggeredRules: triggered,
      requiredHumanActions: [
        "Rejection is irreversible — confirm before acting.",
        "Rejection requires elevated permission.",
        "Record the reason and notify the requester.",
      ],
      nextAction: "Confirm rejection with an approver",
    };
  }

  // 4. Escalate rule or high/critical risk → escalate.
  const escalateRule = triggered.find((r) => r.level === "escalate");
  if (escalateRule || RISK_ORDER[risk.level] <= RISK_ORDER.high) {
    const reason =
      escalateRule && risk.level === "high"
        ? `Escalation rule "${escalateRule.label}" fired and risk is ${risk.level}.`
        : escalateRule
          ? `Escalation rule "${escalateRule.label}" fired: ${escalateRule.reason}`
          : `Risk is ${risk.level} — a higher authority should review this decision.`;
    return {
      category: "escalate",
      reason,
      driver: "escalate",
      triggeredRules: triggered,
      requiredHumanActions: [
        "Assign this decision to the next approval authority.",
        "Attach the reasoning graph so the authority can verify the analysis.",
      ],
      nextAction: "Escalate to the next authority",
    };
  }

  // 5. Review rule, medium risk, or unsatisfied applicable policy → needs-review.
  const reviewRule = triggered.find((r) => r.level === "review");
  const unsatisfied = policyResults.filter((p) => p.applies && p.satisfied === false);
  if (reviewRule || RISK_ORDER[risk.level] <= RISK_ORDER.medium || unsatisfied.length > 0) {
    const parts: string[] = [];
    if (reviewRule) parts.push(`review rule "${reviewRule.label}" fired`);
    if (RISK_ORDER[risk.level] <= RISK_ORDER.medium) parts.push(`risk is ${risk.level}`);
    if (unsatisfied.length) parts.push(`${unsatisfied.length} control gap(s): ${unsatisfied.map((p) => p.name).join("; ")}`);
    return {
      category: "needs-review",
      reason: `Requires review: ${parts.join("; ")}.`,
      driver: "review",
      triggeredRules: triggered,
      requiredHumanActions: [
        "Review the flagged rules, risk factors, and control gaps before deciding.",
        "Resolve any unsatisfied policies before approval.",
      ],
      nextAction: "Review the flagged items",
    };
  }

  // 6. Warning rule → approve-with-warning.
  const warningRule = triggered.find((r) => r.level === "warning");
  if (warningRule) {
    return {
      category: "approve-with-warning",
      reason: `Approval is possible but "${warningRule.label}" fires: ${warningRule.reason}`,
      driver: "warning",
      triggeredRules: triggered,
      requiredHumanActions: ["Acknowledge the warnings before approving.", "Record the acknowledged warnings in the audit trail."],
      nextAction: "Acknowledge warnings and approve",
    };
  }

  // 7. Clean → approve.
  return {
    category: "approve",
    reason: "No blocking rules, control gaps, or material risks fired. The recommendation is approval.",
    driver: "clean",
    triggeredRules: triggered,
    requiredHumanActions: ["Confirm approval with the required authority.", "Attach the reasoning graph to the approval record."],
    nextAction: "Confirm approval",
  };
}

function terminalResult(evidence: DecisionEvidence): RecommendationResult {
  return {
    category: "cannot-decide",
    reason: `This entity is in a terminal state (${evidence.statusLabel ?? "finalized"}) — no decision is pending.`,
    driver: "terminal",
    triggeredRules: [],
    requiredHumanActions: ["No action required — the entity is already finalized."],
    nextAction: null,
  };
}
