import { conditionEvaluator, OPERATOR_MAP } from "@/modules/workflow/condition-evaluator";
import { GovernanceService } from "@/modules/governance/governance.service";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  ApprovalMatrixRule,
  ApprovalConfig,
  ApprovalHistoryEntry,
  ApprovalCondition,
  ApprovalMode,
  ConditionOperator,
} from "./types";

function conditionToExpression(field: string, operator: ConditionOperator, value: unknown): string {
  const op = OPERATOR_MAP[operator] ?? "===";
  const val = typeof value === "string" ? `"${value}"` : String(value);
  return `\${${field}} ${op} ${val}`;
}

function evaluateCondition(
  condition: ApprovalCondition,
  context: Record<string, unknown>,
): boolean {
  return conditionEvaluator.evaluateCondition(
    conditionToExpression(condition.field, condition.operator, condition.value),
    context,
  );
}

export class ApprovalMatrixEvaluator {
  private rules: Map<string, ApprovalMatrixRule>;
  private history: ApprovalHistoryEntry[];

  constructor() {
    this.rules = new Map();
    this.history = [];
  }

  // ── Rule Management ───────────────────────────────────────────────────

  registerRule(rule: ApprovalMatrixRule): void {
    this.rules.set(rule.id, rule);
  }

  getRule(id: string): ApprovalMatrixRule | undefined {
    return this.rules.get(id);
  }

  listRules(companyId: string): ApprovalMatrixRule[] {
    return Array.from(this.rules.values()).filter(
      (r) => r.companyId === companyId,
    );
  }

  unregisterRule(id: string): boolean {
    return this.rules.delete(id);
  }

  clearRules(): void {
    this.rules.clear();
  }

  // ── Matching ──────────────────────────────────────────────────────────

  findMatchingRules(
    context: Record<string, unknown>,
    companyId: string,
    amount?: number,
    department?: string,
  ): ApprovalMatrixRule[] {
    const sorted = Array.from(this.rules.values())
      .filter((r) => r.companyId === companyId && r.isActive)
      .sort((a, b) => a.priority - b.priority);

    return sorted.filter((rule) => {
      if (rule.conditions.length === 0) return true;

      const allConditionsMatch = rule.conditions.every((c) =>
        evaluateCondition(c, context),
      );

      if (!allConditionsMatch) return false;

      if (rule.departmentScope && department && department !== rule.departmentScope) {
        return false;
      }

      if (
        amount !== undefined &&
        rule.thresholdField &&
        rule.thresholdValue !== null &&
        rule.thresholdOperator
      ) {
        const thresholdNum = typeof rule.thresholdValue === "number"
          ? rule.thresholdValue
          : Number(String(rule.thresholdValue));
        const expr = conditionToExpression(
          rule.thresholdField,
          rule.thresholdOperator,
          thresholdNum,
        );
        if (!conditionEvaluator.evaluateCondition(expr, { [rule.thresholdField]: amount })) {
          return false;
        }
      }

      return true;
    });
  }

  // ── Approval Config Resolution ────────────────────────────────────────

  resolveApprovalConfig(
    context: Record<string, unknown>,
    companyId: string,
    options?: { amount?: number; department?: string },
  ): ApprovalConfig | null {
    const matched = this.findMatchingRules(context, companyId, options?.amount, options?.department);
    if (matched.length === 0) return null;

    const effective = matched[0];

    return {
      ruleId: effective.id,
      ruleName: effective.name,
      requiredApprovers: effective.requiredApprovers,
      approverRoles: effective.approverRoles,
      approvalMode: effective.approvalMode,
      timeoutMinutes: effective.timeoutMinutes,
      escalationEnabled: effective.escalationEnabled,
      escalationDelayMinutes: effective.escalationDelayMinutes,
      escalationRoles: effective.escalationRoles,
      delegationEnabled: effective.delegationEnabled,
      delegationRoles: effective.delegationRoles,
    };
  }

  // ── Escalation ────────────────────────────────────────────────────────

  getEscalationTargets(
    rule: ApprovalMatrixRule,
    elapsedMinutes: number,
  ): string[] {
    if (!rule.escalationEnabled || !rule.escalationDelayMinutes) return [];
    if (elapsedMinutes < rule.escalationDelayMinutes) return [];
    return rule.escalationRoles ?? [];
  }

  shouldEscalate(rule: ApprovalMatrixRule, elapsedMinutes: number): boolean {
    if (!rule.escalationEnabled || !rule.escalationDelayMinutes) return false;
    return elapsedMinutes >= rule.escalationDelayMinutes;
  }

  // ── Delegation ────────────────────────────────────────────────────────

  getDelegationTargets(rule: ApprovalMatrixRule): string[] {
    if (!rule.delegationEnabled) return [];
    return rule.delegationRoles ?? [];
  }

  // ── History ───────────────────────────────────────────────────────────

  recordHistory(entry: ApprovalHistoryEntry): void {
    this.history.push(entry);
  }

  getHistory(instanceId: string, stepId: string): ApprovalHistoryEntry[] {
    return this.history.filter(
      (h) => h.instanceId === instanceId && h.stepId === stepId,
    );
  }

  getAllHistory(instanceId: string): ApprovalHistoryEntry[] {
    return this.history.filter((h) => h.instanceId === instanceId);
  }

  getHistoryByRule(ruleId: string): ApprovalHistoryEntry[] {
    return this.history.filter((h) => h.ruleId === ruleId);
  }

  clearHistory(): void {
    this.history = [];
  }

  // ── Governance Integration ────────────────────────────────────────────

  async recordGovernanceViolation(
    ctx: TenantContext,
    rule: ApprovalMatrixRule,
    reason: string,
  ): Promise<void> {
    await GovernanceService.recordViolation(ctx, {
      severity: "HIGH",
      sourceModule: "approval_rule",
      title: `Approval Matrix: ${rule.name}`,
      description: reason,
      details: { ruleId: rule.id, ruleName: rule.name },
    });
  }

  // ── Step Config Generation ────────────────────────────────────────────

  toStepConfig(config: ApprovalConfig): Record<string, unknown> {
    return {
      requiredApprovers: config.approverRoles,
      requiredApproverCount: config.requiredApprovers,
      timeoutMinutes: config.timeoutMinutes,
      approvalMode: config.approvalMode,
      escalationEnabled: config.escalationEnabled,
      escalationDelayMinutes: config.escalationDelayMinutes,
      escalationRoles: config.escalationRoles,
      delegationEnabled: config.delegationEnabled,
      delegationRoles: config.delegationRoles,
    };
  }
}

export const approvalMatrixEvaluator = new ApprovalMatrixEvaluator();
