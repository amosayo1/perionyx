import { conditionEvaluator, OPERATOR_MAP } from "@/modules/workflow/condition-evaluator";
import type {
  BusinessRuleDefinition,
  CreateBusinessRuleDefinitionInput,
  RuleCondition,
  ConditionGroup,
  RuleAction,
  VariableSource,
} from "./types";

function conditionToExpression(condition: RuleCondition): string {
  const base = condition.variable.startsWith("${") ? condition.variable : `\${${condition.variable}}`;
  const op = OPERATOR_MAP[condition.operator] ?? "===";
  const val = typeof condition.value === "string" ? `"${condition.value}"` : String(condition.value);
  return `${base} ${op} ${val}`;
}

function evaluateConditionGroup(
  group: ConditionGroup,
  variables: Record<string, unknown>,
): boolean {
  const results = group.conditions.map((node) => {
    if ("logic" in node && "conditions" in node) {
      return evaluateConditionGroup(node as ConditionGroup, variables);
    }
    const cond = node as RuleCondition;
    return conditionEvaluator.evaluateCondition(conditionToExpression(cond), variables);
  });

  return group.logic === "AND"
    ? results.every(Boolean)
    : results.some(Boolean);
}

function extractVariableSourcesFromPath(path: string): VariableSource[] {
  const sources: VariableSource[] = [];
  if (path.startsWith("workflow.") || path.startsWith("input.")) sources.push("workflow");
  if (path.startsWith("connector.")) sources.push("connector");
  if (path.startsWith("decision.")) sources.push("decision");
  if (path.startsWith("policy.")) sources.push("policy");
  if (path.startsWith("governance.")) sources.push("governance");
  return sources;
}

function collectConditionVariables(group: ConditionGroup): Set<string> {
  const vars = new Set<string>();
  for (const node of group.conditions) {
    if ("logic" in node && "conditions" in node) {
      const nested = collectConditionVariables(node as ConditionGroup);
      nested.forEach((v) => vars.add(v));
    } else {
      const cond = node as RuleCondition;
      vars.add(cond.variable);
    }
  }
  return vars;
}

export class BusinessRulesBuilder {
  private rules = new Map<string, BusinessRuleDefinition>();

  registerRule(companyId: string, data: CreateBusinessRuleDefinitionInput): BusinessRuleDefinition {
    const now = new Date().toISOString();
    const rule: BusinessRuleDefinition = {
      id: crypto.randomUUID(),
      companyId,
      name: data.name,
      description: data.description ?? "",
      category: data.category,
      priority: data.priority,
      when: data.when,
      then: data.then,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    this.rules.set(rule.id, rule);
    return rule;
  }

  getRule(id: string): BusinessRuleDefinition | undefined {
    return this.rules.get(id);
  }

  listRules(companyId: string, category?: string): BusinessRuleDefinition[] {
    return Array.from(this.rules.values()).filter(
      (r) => r.companyId === companyId && (!category || r.category === category),
    );
  }

  updateRule(
    id: string,
    data: Partial<Omit<BusinessRuleDefinition, "id" | "companyId" | "createdAt">>,
  ): BusinessRuleDefinition | null {
    const existing = this.rules.get(id);
    if (!existing) return null;
    const updated: BusinessRuleDefinition = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.rules.set(id, updated);
    return updated;
  }

  unregisterRule(id: string): boolean {
    return this.rules.delete(id);
  }

  evaluate(
    rule: BusinessRuleDefinition,
    variables: Record<string, unknown>,
  ): { matched: boolean; actions: RuleAction[] } {
    const matched = evaluateConditionGroup(rule.when, variables);
    return { matched, actions: matched ? rule.then : [] };
  }

  evaluateAll(
    rules: BusinessRuleDefinition[],
    variables: Record<string, unknown>,
  ): Array<{ rule: BusinessRuleDefinition; actions: RuleAction[] }> {
    return [...rules]
      .filter((r) => r.isActive)
      .sort((a, b) => a.priority - b.priority)
      .reduce<Array<{ rule: BusinessRuleDefinition; actions: RuleAction[] }>>((acc, rule) => {
        const { matched, actions } = this.evaluate(rule, variables);
        if (matched) acc.push({ rule, actions });
        return acc;
      }, []);
  }

  getRequiredVariables(rule: BusinessRuleDefinition): string[] {
    return Array.from(collectConditionVariables(rule.when));
  }

  getRequiredSources(rule: BusinessRuleDefinition): VariableSource[] {
    const sources = new Set<VariableSource>();
    for (const v of this.getRequiredVariables(rule)) {
      for (const source of extractVariableSourcesFromPath(v)) {
        sources.add(source);
      }
    }
    return Array.from(sources);
  }
}

export const businessRulesBuilder = new BusinessRulesBuilder();
