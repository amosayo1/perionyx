/**
 * Phase 22.5 — Decision Intelligence: Explanations
 *
 * Deterministic, evidence-grounded human explanations (AI clause 1: "AI
 * explains; it never decides"). Every sentence is assembled from fixed rule
 * text, policy names, risk factor labels, and evidence identifiers — the
 * engine never writes free-form prose about the entity.
 */

import type {
  DecisionExplanation,
  DecisionEvidence,
  PolicyEvaluation,
  RuleEvaluation,
  RiskAssessment,
  MissingSnapshot,
} from "./types";
import { RISK_LEVEL_LABELS } from "./types";

export function buildExplanation(input: {
  evidence: DecisionEvidence;
  ruleResults: RuleEvaluation[];
  policyResults: PolicyEvaluation[];
  risk: RiskAssessment;
  recommendationLabel: string;
  recommendationReason: string;
  nextAction: string | null;
}): DecisionExplanation {
  const triggered = input.ruleResults.filter((r) => r.triggered);
  const applied = input.policyResults.filter((p) => p.applies);
  const gaps = input.evidence.missing.filter((m) => m.impact === "blocking");
  const advisoryGaps = input.evidence.missing.filter((m) => m.impact !== "blocking");

  const reasoning: string[] = [];
  if (triggered.length === 0) {
    reasoning.push(`No decision rules triggered — recommendation is ${input.recommendationLabel}.`);
  } else {
    for (const r of triggered) {
      reasoning.push(`Rule "${r.label}" (${r.ruleId}) triggered: ${r.reason}`);
    }
  }
  for (const p of applied) {
    reasoning.push(
      `Policy "${p.name}" (${p.policyId}) ${p.satisfied ? "satisfied" : "NOT satisfied — a control gap applies."}`,
    );
  }
  for (const g of gaps) {
    reasoning.push(`Blocking evidence gap: ${g.label} (${g.reason}).`);
  }
  if (input.evidence.stale) {
    reasoning.push("Evidence is stale — it predates the staleness threshold.");
  }
  reasoning.push(input.recommendationReason);

  const evidenceIds: string[] = [];
  for (const r of triggered) evidenceIds.push(...r.evidenceIds);
  for (const p of applied) evidenceIds.push(...p.evidenceIds);

  const policyReferences = applied.map((p) => ({
    policyId: p.policyId,
    name: p.name,
    satisfied: p.satisfied,
  }));

  const riskSummary = `Risk level ${RISK_LEVEL_LABELS[input.risk.level]} — ${input.risk.explanation}`;

  const supportingEvidence = dedupe(evidenceIds);
  const evidenceGaps: MissingSnapshot[] = [...gaps, ...advisoryGaps];

  return {
    summary: `Recommendation: ${input.recommendationLabel}. ${riskSummary}.`,
    reasoning,
    supportingEvidence,
    evidenceGaps,
    policyReferences,
    riskSummary,
    nextAction: input.nextAction,
    alternativeOutcomes: buildAlternatives(input.recommendationLabel, input.risk.level),
  };
}

function dedupe(ids: string[]): string[] {
  return Array.from(new Set(ids));
}

export function buildAlternatives(recommendation: string, risk: RiskAssessment["level"]): string[] {
  const alternatives: string[] = [];
  if (recommendation !== "Reject") alternatives.push("Reject — only valid when a blocking rule or unsatisfied control applies.");
  if (recommendation !== "Approve") alternatives.push("Approve — only valid when no blocking rule fires and controls are satisfied.");
  if (recommendation !== "Approve with warning") {
    alternatives.push("Approve with warning — applicable when non-blocking warnings fire but controls pass.");
  }
  if (recommendation !== "Escalate") alternatives.push("Escalate — applicable when risk is high or authority is exceeded.");
  if (risk !== "low") alternatives.push("Defer — hold the decision until blocking gaps resolve or risk is re-measured.");
  return alternatives;
}
