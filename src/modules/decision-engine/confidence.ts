/**
 * Phase 22.5 — Decision Intelligence: Confidence Engine
 *
 * Derives a DECISION confidence band from measured factors — never a
 * fabricated scalar (DI-R2, PP-109, Measured-Confidence Doctrine).
 *
 * Each factor declares a direction and a relative weight. A triggered
 * positive factor adds its weight to the numerator; a triggered negative
 * factor subtracts. The ratio is mapped to one of four categorical bands.
 *
 * Confidence is never used to make the recommendation — it qualifies the
 * recommendation's trustworthiness. The engine reports exactly which factors
 * drove the band via `basis`.
 */

import type {
  ConfidenceFactorDef,
  ConfidenceFactorResult,
  DecisionConfidence,
  DecisionConfidenceResult,
  DecisionEvidence,
} from "./types";
import { matchCondition } from "./rule-engine";

export function evaluateConfidenceFactor(factor: ConfidenceFactorDef, ev: DecisionEvidence): ConfidenceFactorResult {
  let triggered = true;
  for (const cond of factor.conditions) {
    if (!matchCondition(cond, ev).matched) {
      triggered = false;
      break;
    }
  }
  return {
    id: factor.id,
    label: factor.label,
    direction: factor.direction,
    triggered,
    reason: triggered ? factor.label : null,
  };
}

/**
 * score ∈ [0, 1]. Weights are normalized over ALL factors (whether triggered
 * or not) so missing positives genuinely lower confidence rather than only
 * raising it.
 */
export function confidenceScore(factors: ConfidenceFactorDef[], ev: DecisionEvidence): number {
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  if (totalWeight <= 0) return 0;
  const results = factors.map((f) => evaluateConfidenceFactor(f, ev));
  let score = 0;
  for (const r of results) {
    const factor = factors.find((f) => f.id === r.id)!;
    if (!r.triggered) continue;
    score += factor.direction === "positive" ? factor.weight : -factor.weight;
  }
  return Math.max(0, Math.min(1, score / totalWeight));
}

export function bandFromScore(score: number, insufficient: boolean): DecisionConfidence {
  if (insufficient) return "insufficient-evidence";
  if (score >= 0.7) return "high";
  if (score >= 0.4) return "moderate";
  return "low";
}

export function deriveConfidence(
  factors: ConfidenceFactorDef[],
  ev: DecisionEvidence,
): DecisionConfidenceResult {
  const score = confidenceScore(factors, ev);
  const results = factors.map((f) => evaluateConfidenceFactor(f, ev));
  const triggeredPos = results.filter((r) => r.triggered && r.direction === "positive").map((r) => r.label);
  const triggeredNeg = results.filter((r) => r.triggered && r.direction === "negative").map((r) => r.label);

  const insufficient = ev.missing.some((m) => m.impact === "blocking");
  const band = bandFromScore(score, insufficient);

  const basisParts: string[] = [];
  if (insufficient) basisParts.push("blocking evidence gaps present");
  if (triggeredPos.length) basisParts.push(`positive: ${triggeredPos.join(", ")}`);
  if (triggeredNeg.length) basisParts.push(`negative: ${triggeredNeg.join(", ")}`);
  const basis = basisParts.length ? basisParts.join("; ") : "no confidence factors available";

  return { band, factors: results, basis };
}
