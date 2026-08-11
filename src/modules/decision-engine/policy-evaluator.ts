/**
 * Phase 22.5 — Decision Intelligence: Policy Evaluator
 *
 * Declarative policy evaluation: each policy declares when it APPLIES
 * (`appliesWhen`) and what would SATISFY it (`satisfiedWhen`). Both are
 * condition sets over the same normalized DecisionEvidence the rules use.
 *
 * A policy that does not apply is reported as such — it is never a pass.
 * A policy that applies and is satisfied becomes a positive policy reference;
 * a policy that applies and is unsatisfied flags a gap (PP-201, DI-P7).
 */

import type { DecisionEvidence, DecisionPolicy, PolicyEvaluation } from "./types";
import { matchCondition, uniqueIds } from "./rule-engine";

export function evaluatePolicy(policy: DecisionPolicy, ev: DecisionEvidence): PolicyEvaluation {
  const applies: string[] = [];
  let appliesAll = true;
  for (const cond of policy.appliesWhen) {
    const r = matchCondition(cond, ev);
    if (!r.matched) {
      appliesAll = false;
      break;
    }
    applies.push(...r.ids);
  }

  if (!appliesAll) {
    return {
      policyId: policy.id,
      name: policy.name,
      category: policy.category,
      applies: false,
      satisfied: null,
      reason: "Policy does not apply to this entity.",
      evidenceIds: [],
    };
  }

  const satisfiedIds: string[] = [];
  let satisfiedAll = true;
  for (const cond of policy.satisfiedWhen) {
    const r = matchCondition(cond, ev);
    if (!r.matched) {
      satisfiedAll = false;
      break;
    }
    satisfiedIds.push(...r.ids);
  }

  return {
    policyId: policy.id,
    name: policy.name,
    category: policy.category,
    applies: true,
    satisfied: satisfiedAll,
    reason: satisfiedAll ? "Policy satisfied." : "Policy applies but is not satisfied.",
    evidenceIds: uniqueIds([...applies, ...satisfiedIds]),
  };
}

export function evaluatePolicies(policies: DecisionPolicy[], ev: DecisionEvidence): PolicyEvaluation[] {
  return policies.map((p) => evaluatePolicy(p, ev));
}

export function applicablePolicies(policies: DecisionPolicy[], ev: DecisionEvidence): PolicyEvaluation[] {
  return evaluatePolicies(policies, ev).filter((p) => p.applies);
}

export function unsatisfiedPolicies(policies: DecisionPolicy[], ev: DecisionEvidence): PolicyEvaluation[] {
  return applicablePolicies(policies, ev).filter((p) => p.satisfied === false);
}
