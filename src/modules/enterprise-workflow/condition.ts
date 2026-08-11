/**
 * Phase 23 — Enterprise Workflow Engine: Condition Evaluator
 *
 * Generic, deterministic condition evaluation over workflow facts:
 * instance variables, decision context, priority, risk, state.
 */

import type { Condition, FactValue, WorkflowDecisionContext, WorkflowInstance } from "./types";

export interface ConditionContext {
  variables: Record<string, FactValue>;
  decision: WorkflowDecisionContext | null;
  priority: WorkflowInstance["priority"];
  risk: WorkflowInstance["risk"];
  state: WorkflowInstance["state"];
  loopCounts: Record<string, number>;
}

export function buildConditionContext(instance: WorkflowInstance): ConditionContext {
  return {
    variables: instance.variables,
    decision: instance.decision,
    priority: instance.priority,
    risk: instance.risk,
    state: instance.state,
    loopCounts: instance.loopCounts,
  };
}

function asString(v: FactValue | undefined): string | null {
  if (v === null || v === undefined) return null;
  return typeof v === "object" ? JSON.stringify(v) : String(v);
}

export function resolveField(
  field: string,
  ctx: ConditionContext,
): { found: boolean; value: FactValue } {
  if (field === "priority") return { found: true, value: ctx.priority };
  if (field === "risk") return { found: true, value: ctx.risk };
  if (field === "state") return { found: true, value: ctx.state };
  if (field.startsWith("decision.")) {
    if (!ctx.decision) return { found: false, value: null };
    const key = field.slice("decision.".length);
    const value = (ctx.decision as unknown as Record<string, unknown>)[key];
    return { found: value !== undefined, value: (value as FactValue) ?? null };
  }
  if (field.startsWith("loop.")) {
    const key = field.slice("loop.".length);
    return { found: true, value: ctx.loopCounts[key] ?? 0 };
  }
  if (field.startsWith("variables.")) {
    const key = field.slice("variables.".length);
    return { found: key in ctx.variables, value: ctx.variables[key] ?? null };
  }
  if (field.startsWith("variables[") && field.endsWith("]")) {
    const key = field.slice("variables[".length, -1);
    return { found: key in ctx.variables, value: ctx.variables[key] ?? null };
  }
  return { found: keyInRoot(field, ctx), value: null };
}

function keyInRoot(field: string, ctx: ConditionContext): boolean {
  return field in ctx.variables;
}

function deepEqual(a: FactValue, b: FactValue): boolean {
  if (typeof a === "object" && a !== null && typeof b === "object" && b !== null) {
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return a === b;
}

export function evaluateCondition(condition: Condition, ctx: ConditionContext): boolean {
  switch (condition.op) {
    case "and":
      return condition.conditions.every((c) => evaluateCondition(c, ctx));
    case "or":
      return condition.conditions.some((c) => evaluateCondition(c, ctx));
    case "not":
      return !evaluateCondition(condition.condition, ctx);
    case "exists": {
      const { found } = resolveField(condition.field, ctx);
      return found;
    }
    case "equals": {
      const { found, value } = resolveField(condition.field, ctx);
      return found && deepEqual(value, condition.value);
    }
    case "not-equals": {
      const { found, value } = resolveField(condition.field, ctx);
      return !found || !deepEqual(value, condition.value);
    }
    case "gt":
    case "gte":
    case "lt":
    case "lte": {
      const { found, value } = resolveField(condition.field, ctx);
      if (!found || typeof value !== "number") return false;
      switch (condition.op) {
        case "gt":
          return value > condition.value;
        case "gte":
          return value >= condition.value;
        case "lt":
          return value < condition.value;
        case "lte":
          return value <= condition.value;
      }
    }
    case "in": {
      const { found, value } = resolveField(condition.field, ctx);
      if (!found) return false;
      return condition.values.some((v) => deepEqual(v, value));
    }
    case "contains": {
      const { found, value } = resolveField(condition.field, ctx);
      if (!found) return false;
      if (Array.isArray(value)) {
        return value.some((item) => asString(item)?.includes(condition.value) ?? false);
      }
      return asString(value)?.includes(condition.value) ?? false;
    }
    case "startsWith": {
      const { found, value } = resolveField(condition.field, ctx);
      if (!found) return false;
      return asString(value)?.startsWith(condition.value) ?? false;
    }
  }
}
