/**
 * Phase 22.5 — Decision Intelligence: Rule Engine
 *
 * Deterministic condition evaluation over the normalized DecisionEvidence.
 * Conditions are declarative and refer ONLY to evidence items and measured
 * facts — there are no free-text or LLM-generated rules (PP-105, DI-P7).
 *
 * `matchCondition` is the single evaluator shared by the rule engine, the
 * policy evaluator, the risk engine, and the confidence engine.
 */

import type {
  DecisionEvidence,
  EvidenceStatus,
  EvidenceConfidence,
  EvidenceCondition,
  FactCondition,
  FactValue,
  MetadataCondition,
  MissingCondition,
  MissingSnapshot,
  RuleCondition,
  RuleEvaluation,
  RuleLevel,
  DecisionRule,
} from "./types";

// ──────────────────────────────────────────────────────────────────────────────
// Condition matching
// ──────────────────────────────────────────────────────────────────────────────

function itemGroupId(itemId: string, ev: DecisionEvidence): string | null {
  const item = ev.items.find((it) => it.id === itemId);
  return item ? item.groupId : null;
}

function findItems(cond: EvidenceCondition, ev: DecisionEvidence): string[] {
  const exact = cond.itemId ? (Array.isArray(cond.itemId) ? cond.itemId : [cond.itemId]) : null;
  const inGroup = cond.groupId ? (Array.isArray(cond.groupId) ? cond.groupId : [cond.groupId]) : null;
  if (!exact && !inGroup && !cond.sectionId) return [];
  return ev.items
    .filter((it) => {
      if (exact && !exact.some((want) => want === it.id || want.endsWith("*") && it.id.startsWith(want.slice(0, -1)))) return false;
      if (inGroup && !inGroup.includes(it.groupId)) return false;
      if (cond.sectionId && it.sectionId !== cond.sectionId) return false;
      if (cond.status && !cond.status.includes(it.status)) return false;
      if (cond.confidence && !cond.confidence.includes(it.confidence)) return false;
      return true;
    })
    .map((it) => it.id);
}

function matchEvidence(cond: EvidenceCondition, ev: DecisionEvidence): { matched: boolean; ids: string[] } {
  const ids = findItems(cond, ev);
  return { matched: ids.length > 0, ids };
}

function matchMissing(cond: MissingCondition, ev: DecisionEvidence): { matched: boolean; ids: string[] } {
  const scope: MissingSnapshot[] =
    cond.impact === "blocking"
      ? ev.missing.filter((m) => m.impact === "blocking")
      : cond.impact === "advisory"
        ? ev.missing.filter((m) => m.impact === "advisory")
        : ev.missing;
  const matches = scope.filter((m) => {
    if (cond.id && !(m.id === cond.id || cond.id.endsWith("*") && m.id.startsWith(cond.id.slice(0, -1)))) return false;
    return true;
  });
  return { matched: matches.length > 0, ids: matches.map((m) => `missing:${m.id}`) };
}

function matchMetadata(cond: MetadataCondition, ev: DecisionEvidence): { matched: boolean; ids: string[] } {
  if (cond.decisionReady !== undefined && ev.missing.some((m) => m.impact === "blocking") !== cond.decisionReady) {
    return { matched: false, ids: [] };
  }
  if (cond.stale !== undefined && ev.stale !== cond.stale) {
    return { matched: false, ids: [] };
  }
  return { matched: true, ids: [] };
}

function evalFactOperator(op: FactCondition["op"], actual: unknown, want: FactCondition["value"]): boolean {
  if (op === "truthy") {
    if (typeof actual === "number") return actual !== 0;
    if (typeof actual === "boolean") return actual;
    return Boolean(actual);
  }
  if (op === "in" || op === "not-in") {
    const list = Array.isArray(want) ? want : want === null || want === undefined ? [] : [want];
    const ok = list.includes(actual as FactValue);
    return op === "in" ? ok : !ok;
  }
  if (actual === null || actual === undefined) return false;
  if (typeof actual === "boolean") return op === "eq" ? actual === want : op === "neq" ? actual !== want : false;
  if (typeof actual === "number" && typeof want === "number") {
    switch (op) {
      case "eq":
        return actual === want;
      case "neq":
        return actual !== want;
      case "gt":
        return actual > want;
      case "gte":
        return actual >= want;
      case "lt":
        return actual < want;
      case "lte":
        return actual <= want;
      default:
        return false;
    }
  }
  if (typeof actual === "string") {
    switch (op) {
      case "eq":
        return actual === String(want);
      case "neq":
        return actual !== String(want);
      case "gt":
        return actual > String(want);
      case "gte":
        return actual >= String(want);
      case "lt":
        return actual < String(want);
      case "lte":
        return actual <= String(want);
      default:
        return false;
    }
  }
  return false;
}

function matchFact(cond: FactCondition, ev: DecisionEvidence): { matched: boolean; ids: string[] } {
  const actual = ev.facts[cond.key];
  return { matched: evalFactOperator(cond.op, actual, cond.value), ids: [] };
}

export function matchCondition(cond: RuleCondition, ev: DecisionEvidence): { matched: boolean; ids: string[] } {
  switch (cond.kind) {
    case "evidence":
      return matchEvidence(cond, ev);
    case "missing":
      return matchMissing(cond, ev);
    case "metadata":
      return matchMetadata(cond, ev);
    case "fact":
      return matchFact(cond, ev);
  }
}

export function matchesCondition(cond: RuleCondition, ev: DecisionEvidence): boolean {
  return matchCondition(cond, ev).matched;
}

/** Any group fully matches → whole anyCondition matched. */
export function matchAnyConditions(groups: RuleCondition[][], ev: DecisionEvidence): { matched: boolean; ids: string[] } {
  const collected: string[] = [];
  for (const group of groups) {
    let groupMatched = true;
    for (const cond of group) {
      const r = matchCondition(cond, ev);
      if (!r.matched) {
        groupMatched = false;
        break;
      }
      collected.push(...r.ids);
    }
    if (groupMatched) return { matched: true, ids: collected };
  }
  return { matched: false, ids: [] };
}

/** A rule is triggered when all conditions match (or one alternative group matches). */
export function evaluateRule(rule: DecisionRule, ev: DecisionEvidence): RuleEvaluation {
  const ids: string[] = [];
  let allMatched = true;
  for (const cond of rule.conditions) {
    const r = matchCondition(cond, ev);
    if (!r.matched) {
      allMatched = false;
      break;
    }
    ids.push(...r.ids);
  }
  if (!allMatched && rule.anyConditions) {
    const alt = matchAnyConditions(rule.anyConditions, ev);
    if (alt.matched) {
      allMatched = true;
      ids.push(...alt.ids);
    }
  }
  const evidenceIds = uniqueIds([...rule.evidenceIds ?? [], ...ids]);
  return {
    ruleId: rule.id,
    label: rule.label,
    triggered: allMatched,
    level: allMatched ? rule.level : null,
    evidenceIds,
    reason: allMatched ? rule.explanation : null,
  };
}

export function evaluateRules(rules: DecisionRule[], ev: DecisionEvidence): RuleEvaluation[] {
  return rules.map((rule) => evaluateRule(rule, ev));
}

export function triggeredRules(rules: DecisionRule[], ev: DecisionEvidence): RuleEvaluation[] {
  return evaluateRules(rules, ev).filter((r) => r.triggered);
}

export function uniqueIds(ids: string[]): string[] {
  return Array.from(new Set(ids));
}

export const RULE_LEVEL_ORDER: Record<RuleLevel, number> = {
  block: 0,
  escalate: 1,
  review: 2,
  warning: 3,
  pass: 4,
};

export { type EvidenceStatus, type EvidenceConfidence, type MissingSnapshot };
