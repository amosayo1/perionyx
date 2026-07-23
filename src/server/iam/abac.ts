import type { ABACAttribute, ABACCondition, ABACPolicy, GranularPermission } from "./types";

export class ABACEvaluator {
  evaluate(
    _permission: GranularPermission,
    _userAttributes: ABACAttribute,
    _resourceAttributes: ABACAttribute,
  ): { allowed: boolean; reason?: string } {
    return { allowed: true };
  }
}

export class ABACPolicyEngine {
  private policies: ABACPolicy[] = [];

  addPolicy(policy: ABACPolicy): void {
    this.policies.push(policy);
    this.policies.sort((a, b) => b.priority - a.priority);
  }

  removePolicy(policyId: string): void {
    this.policies = this.policies.filter((p) => p.id !== policyId);
  }

  getPolicies(): ABACPolicy[] {
    return [...this.policies];
  }

  evaluate(
    permission: GranularPermission,
    userAttributes: ABACAttribute,
    resourceAttributes: ABACAttribute,
  ): { allowed: boolean; matchedPolicy?: string } {
    for (const policy of this.policies) {
      if (!policy.permissions.includes(permission)) continue;

      const allConditionsMet = policy.conditions.every((condition) =>
        this.evaluateCondition(condition, { ...userAttributes, ...resourceAttributes }),
      );

      if (allConditionsMet) {
        return {
          allowed: policy.effect === "allow",
          matchedPolicy: policy.name,
        };
      }
    }

    return { allowed: true };
  }

  private evaluateCondition(
    condition: ABACCondition,
    attributes: Record<string, unknown>,
  ): boolean {
    const attrValue = attributes[condition.attribute];
    if (attrValue === undefined) return false;

    switch (condition.operator) {
      case "eq":
        return attrValue === condition.value;
      case "neq":
        return attrValue !== condition.value;
      case "in":
        return Array.isArray(condition.value) && condition.value.includes(attrValue);
      case "nin":
        return Array.isArray(condition.value) && !condition.value.includes(attrValue);
      case "lt":
        return typeof attrValue === "number" && typeof condition.value === "number" && attrValue < condition.value;
      case "lte":
        return typeof attrValue === "number" && typeof condition.value === "number" && attrValue <= condition.value;
      case "gt":
        return typeof attrValue === "number" && typeof condition.value === "number" && attrValue > condition.value;
      case "gte":
        return typeof attrValue === "number" && typeof condition.value === "number" && attrValue >= condition.value;
      case "contains":
        return typeof attrValue === "string" && typeof condition.value === "string" && attrValue.includes(condition.value);
      default:
        return false;
    }
  }
}

export const ABAC_ATTRIBUTE_DEFINITIONS: Array<{
  key: keyof ABACAttribute;
  label: string;
  type: "string" | "number" | "enum";
  values?: string[];
}> = [
  { key: "department", label: "Department", type: "enum", values: ["finance", "engineering", "operations", "compliance", "executive", "hr", "legal"] },
  { key: "region", label: "Region", type: "enum", values: ["us", "eu", "apac", "latam", "mea"] },
  { key: "legalEntity", label: "Legal Entity", type: "string" },
  { key: "costCenter", label: "Cost Center", type: "string" },
  { key: "approvalLimit", label: "Approval Limit", type: "number" },
  { key: "riskLevel", label: "Risk Level", type: "enum", values: ["low", "medium", "high", "critical"] },
  { key: "walletId", label: "Wallet", type: "string" },
  { key: "workflowId", label: "Workflow", type: "string" },
  { key: "connectorType", label: "Connector Type", type: "string" },
];

export const abacEvaluator = new ABACEvaluator();
export const abacPolicyEngine = new ABACPolicyEngine();
