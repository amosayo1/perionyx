/**
 * Phase 22.5 — Decision Intelligence: Risk Engine
 *
 * Deterministic risk assessment. Each risk factor declares trigger
 * conditions over DecisionEvidence; a triggered factor contributes its
 * severity. The aggregate rating is the highest triggered severity, with an
 * explanation naming the contributing factors (DI-R2, PP-109).
 *
 * Risk factors are structural — they exist whether or not they trigger, so
 * the graph can show that a risk was checked and cleared.
 */

import type { DecisionEvidence, RiskAssessment, RiskFactorDef, RiskFactorResult, RiskLevel } from "./types";
import { matchAnyConditions, matchCondition, uniqueIds } from "./rule-engine";

export const RISK_ORDER: Record<RiskLevel, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function evaluateRiskFactor(factor: RiskFactorDef, ev: DecisionEvidence): RiskFactorResult {
  const ids: string[] = [];
  let allMatched = true;
  for (const cond of factor.conditions) {
    const r = matchCondition(cond, ev);
    if (!r.matched) {
      allMatched = false;
      break;
    }
    ids.push(...r.ids);
  }
  if (!allMatched && factor.anyConditions) {
    const alt = matchAnyConditions(factor.anyConditions, ev);
    if (alt.matched) {
      allMatched = true;
      ids.push(...alt.ids);
    }
  }
  return {
    id: factor.id,
    label: factor.label,
    category: factor.category,
    severity: factor.severity,
    triggered: allMatched,
    evidenceIds: uniqueIds([...factor.evidenceIds ?? [], ...ids]),
    reason: allMatched ? factor.label : null,
  };
}

export function assessRisk(factors: RiskFactorDef[], ev: DecisionEvidence): RiskAssessment {
  const results = factors.map((f) => evaluateRiskFactor(f, ev));
  const triggered = results.filter((r) => r.triggered);
  const worst = triggered.reduce<RiskLevel | null>((acc, r) => {
    if (acc === null) return r.severity;
    return RISK_ORDER[r.severity] < RISK_ORDER[acc] ? r.severity : acc;
  }, null);

  const explanation =
    triggered.length === 0
      ? "No risk factors triggered."
      : `Risk level ${worst} driven by ${triggered.length} factor(s).`;

  return {
    level: worst ?? "low",
    factors: results,
    explanation,
  };
}
