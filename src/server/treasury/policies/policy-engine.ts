import type { CashPolicy, CashPolicyRule, TreasuryPolicy, TreasuryAlert } from "../domain/types";
import { TreasuryAlertSeverity, TreasuryAlertCategory } from "../domain/types";

export interface PolicyEvaluationResult {
  passed: boolean;
  violations: PolicyViolation[];
  score: number;
}

export interface PolicyViolation {
  policyId: string;
  policyName: string;
  rule: CashPolicyRule;
  actualValue: number;
  severity: TreasuryAlertSeverity;
  message: string;
}

export class PolicyEngine {
  private policies = new Map<string, CashPolicy>();
  private treasuryPolicies = new Map<string, TreasuryPolicy>();

  registerPolicy(policy: CashPolicy): void {
    this.policies.set(policy.id, policy);
  }

  registerTreasuryPolicy(policy: TreasuryPolicy): void {
    this.treasuryPolicies.set(policy.id, policy);
    for (const p of policy.policies) {
      this.registerPolicy(p);
    }
  }

  evaluate(policyId: string, value: number, context: Record<string, unknown>): PolicyEvaluationResult {
    const policy = this.policies.get(policyId);
    if (!policy || !policy.enabled) {
      return { passed: true, violations: [], score: 100 };
    }

    const violations: PolicyViolation[] = [];

    for (const rule of policy.rules) {
      const message = this.evaluateRule(rule, value);
      if (message) {
        violations.push({
          policyId: policy.id,
          policyName: policy.name,
          rule,
          actualValue: value,
          severity: rule.severity,
          message,
        });
      }
    }

    return {
      passed: violations.length === 0,
      violations,
      score: violations.length > 0
        ? Math.max(0, 100 - violations.reduce((s, v) => {
          const severityWeight = v.severity === TreasuryAlertSeverity.CRITICAL ? 30
            : v.severity === TreasuryAlertSeverity.WARNING ? 15
            : 5;
          return s + severityWeight;
        }, 0))
        : 100,
    };
  }

  evaluateAll(values: Record<string, number>, context: Record<string, unknown>): PolicyEvaluationResult[] {
    return Array.from(this.policies.values()).map((policy) =>
      this.evaluate(policy.id, values[policy.id] ?? 0, context),
    );
  }

  getPoliciesByType(type: string): CashPolicy[] {
    return Array.from(this.policies.values()).filter((p) => p.policyType === type);
  }

  getPoliciesByCompany(companyId: string): CashPolicy[] {
    return Array.from(this.policies.values()).filter((p) => p.companyId === companyId);
  }

  getTreasuryPolicy(policyId: string): TreasuryPolicy | null {
    return this.treasuryPolicies.get(policyId) ?? null;
  }

  evaluateMinimumCash(actualBalance: number, minimumBalance: number, policyId: string): PolicyEvaluationResult {
    return this.evaluateWithOverride(policyId, "minimumBalance", actualBalance, [
      {
        field: "balance",
        operator: "GTE",
        value: minimumBalance,
        severity: TreasuryAlertSeverity.CRITICAL,
        message: `Cash balance ${actualBalance} is below minimum ${minimumBalance}`,
      },
    ]);
  }

  evaluateLiquidityBuffer(actualLiquidity: number, totalCash: number, bufferPercent: number, policyId: string): PolicyEvaluationResult {
    const requiredLiquidity = totalCash * (bufferPercent / 100);
    return this.evaluateWithOverride(policyId, "liquidityBuffer", actualLiquidity, [
      {
        field: "liquidity",
        operator: "GTE",
        value: requiredLiquidity,
        severity: TreasuryAlertSeverity.WARNING,
        message: `Liquidity ${actualLiquidity} is below buffer requirement ${requiredLiquidity} (${bufferPercent}%)`,
      },
    ]);
  }

  private evaluateWithOverride(
    policyId: string,
    field: string,
    value: number,
    defaultRules: CashPolicyRule[],
  ): PolicyEvaluationResult {
    const policy = this.policies.get(policyId);
    const rules = (policy?.rules.length ?? 0) > 0 ? policy!.rules : defaultRules;

    const violations: PolicyViolation[] = [];
    for (const rule of rules) {
      const message = this.evaluateRule(rule, value);
      if (message) {
        violations.push({
          policyId: policyId,
          policyName: policy?.name ?? field,
          rule,
          actualValue: value,
          severity: rule.severity,
          message,
        });
      }
    }

    return {
      passed: violations.length === 0,
      violations,
      score: violations.length > 0 ? 0 : 100,
    };
  }

  private evaluateRule(rule: CashPolicyRule, value: number): string | null {
    switch (rule.operator) {
      case "EQ":
        return value === rule.value ? null : rule.message;
      case "GT":
        return value > (rule.value as number) ? null : rule.message;
      case "GTE":
        return value >= (rule.value as number) ? null : rule.message;
      case "LT":
        return value < (rule.value as number) ? null : rule.message;
      case "LTE":
        return value <= (rule.value as number) ? null : rule.message;
      case "BETWEEN": {
        const [lo, hi] = rule.value as [number, number];
        return value >= lo && value <= hi ? null : rule.message;
      }
      default:
        return null;
    }
  }

  clear(): void {
    this.policies.clear();
    this.treasuryPolicies.clear();
  }
}

export const policyEngine = new PolicyEngine();
