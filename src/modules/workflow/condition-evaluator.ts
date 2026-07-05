import type { ConditionOperator } from "@/modules/automation-studio/types";

export const OPERATOR_MAP: Record<ConditionOperator, string> = {
  eq: "===",
  neq: "!==",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
  in: "in",
  contains: "===",
  matches: "===",
};

export class ConditionEvaluator {
  evaluateCondition(expression: string, variables: Record<string, unknown>): boolean {
    const match = expression.match(/^\$\{([^}]+)\}\s*(===|!==|>|<|>=|<=|in)\s*(.+)$/);
    if (!match) return false;

    const varPath = match[1].trim();
    const operator = match[2].trim();
    const value = match[3].trim().replace(/^["']|["']$/g, "");

    const actualValue = this.resolveVariable(varPath, variables);
    if (actualValue === undefined) return false;

    switch (operator) {
      case "===": return String(actualValue) === value;
      case "!==": return String(actualValue) !== value;
      case ">": return Number(actualValue) > Number(value);
      case "<": return Number(actualValue) < Number(value);
      case ">=": return Number(actualValue) >= Number(value);
      case "<=": return Number(actualValue) <= Number(value);
      case "in": return String(actualValue).split(",").map((s) => s.trim()).includes(value);
      default: return false;
    }
  }

  resolveVariable(path: string, variables: Record<string, unknown>): unknown {
    const parts = path.split(".");
    let current: unknown = variables;
    for (const part of parts) {
      if (current === null || current === undefined || typeof current !== "object") return undefined;
      current = (current as Record<string, unknown>)[part];
    }
    return current;
  }

  evaluateAll(
    conditions: Record<string, string>,
    variables: Record<string, unknown>,
  ): string | null {
    for (const [branchId, expression] of Object.entries(conditions)) {
      if (this.evaluateCondition(expression, variables)) {
        return branchId;
      }
    }
    return null;
  }
}

export const conditionEvaluator = new ConditionEvaluator();
