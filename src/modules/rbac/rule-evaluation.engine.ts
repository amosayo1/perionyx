/** Determines which approval rules apply to a given transaction. */

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { ValidationError } from "@/lib/errors/app-error";

export interface TransactionContext {
  companyId: string;
  amount: Prisma.Decimal;
  transactionType: string;
  walletId?: string;
  connectorType?: string;
  metadata?: Record<string, any>;
}

export interface MatchedRule {
  ruleId: string;
  name: string;
  priority: number;
  requiredApprovalsCount: number;
  sequentialApproval: boolean;
  dualApprovalRequired: boolean;
  escalationTimeoutHours?: number;
  requiresComplianceReview: boolean;
  approvalSteps: Array<{
    stepNumber: number;
    roleRequired: string;
    approvalCount: number;
    timeoutHours?: number;
  }>;
}

export class RuleEvaluationEngine {
  /**
   * Evaluate transaction and return all matching rules in priority order.
   */
  static async evaluateTransaction(
    context: TransactionContext
  ): Promise<MatchedRule[]> {
    const rules = await prisma.approvalRule.findMany({
      where: {
        companyId: context.companyId,
        enabled: true,
        // Only include non-expired rules
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        conditions: true,
        approvalSteps: {
          orderBy: { stepNumber: "asc" },
        },
      },
      orderBy: { priority: "asc" }, // Lower priority number = higher priority
    });

    const matchedRules: MatchedRule[] = [];

    for (const rule of rules) {
      if (this.ruleMatches(rule, context)) {
        matchedRules.push({
          ruleId: rule.id,
          name: rule.name,
          priority: rule.priority,
          requiredApprovalsCount: rule.requiredApprovalsCount,
          sequentialApproval: rule.sequentialApproval,
          dualApprovalRequired: rule.dualApprovalRequired,
          escalationTimeoutHours: rule.escalationTimeoutHours ?? undefined,
          requiresComplianceReview: rule.requiresComplianceReview,
          approvalSteps: rule.approvalSteps.map((step) => ({
            stepNumber: step.stepNumber,
            roleRequired: step.roleRequired,
            approvalCount: step.approvalCount,
            timeoutHours: step.timeoutHours ?? undefined,
          })),
        });
      }
    }

    return matchedRules;
  }

  /**
   * Check if a rule matches the given transaction context.
   */
  private static ruleMatches(
    rule: any & {
      conditions: any[];
      scope: string;
      scopeId?: string;
      minAmount: Prisma.Decimal;
      maxAmount?: Prisma.Decimal;
      applicableTransactionTypes: string[];
      applicableConnectorTypes: string[];
    },
    context: TransactionContext
  ): boolean {
    if (!this.amountInRange(context.amount, rule.minAmount, rule.maxAmount)) {
      return false;
    }

    // Check transaction type
    if (
      rule.applicableTransactionTypes.length > 0 &&
      !rule.applicableTransactionTypes.includes(context.transactionType)
    ) {
      return false;
    }

    // Check connector type (if rule specifies)
    if (
      context.connectorType &&
      rule.applicableConnectorTypes.length > 0 &&
      !rule.applicableConnectorTypes.includes(context.connectorType)
    ) {
      return false;
    }

    // Check scope
    if (!this.scopeMatches(rule.scope, rule.scopeId, context)) {
      return false;
    }

    // Check all conditions
    if (rule.conditions.length > 0) {
      for (const condition of rule.conditions) {
        if (!this.evaluateCondition(condition, context)) {
          return false; // All conditions must match (AND logic)
        }
      }
    }

    return true;
  }

  /**
   * Check if amount is within rule thresholds.
   */
  private static amountInRange(
    amount: Prisma.Decimal,
    minAmount: Prisma.Decimal,
    maxAmount?: Prisma.Decimal
  ): boolean {
    const numAmount = parseFloat(amount.toString());
    const numMin = parseFloat(minAmount.toString());

    if (numAmount < numMin) {
      return false;
    }

    if (maxAmount) {
      const numMax = parseFloat(maxAmount.toString());
      if (numAmount > numMax) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if transaction scope matches rule scope.
   */
  private static scopeMatches(
    ruleScope: string,
    ruleScopeId: string | undefined,
    context: TransactionContext
  ): boolean {
    if (ruleScope === "GLOBAL") {
      return true; // Global rules apply to all transactions
    }

    if (ruleScope === "WALLET" && ruleScopeId === context.walletId) {
      return true;
    }

    if (ruleScope === "WALLET_TYPE" && context.metadata?.walletType === ruleScopeId) {
      return true;
    }

    if (ruleScope === "TRANSACTION_TYPE" && context.transactionType === ruleScopeId) {
      return true;
    }

    if (ruleScope === "CONNECTOR_TYPE" && context.connectorType === ruleScopeId) {
      return true;
    }

    return false;
  }

  /**
   * Evaluate a single condition against transaction context.
   */
  private static evaluateCondition(condition: any, context: TransactionContext): boolean {
    const fieldName = condition.fieldName;
    const operator = condition.operator;
    let contextValue: any;

    // Map field names to context values
    switch (fieldName) {
      case "amount":
        contextValue = parseFloat(context.amount.toString());
        break;
      case "transactionType":
        contextValue = context.transactionType;
        break;
      case "walletId":
        contextValue = context.walletId;
        break;
      case "connectorType":
        contextValue = context.connectorType;
        break;
      default:
        contextValue = context.metadata?.[fieldName];
    }

    if (contextValue === undefined || contextValue === null) {
      return false; // Missing required field
    }

    const conditionValue = this.parseConditionValue(condition.value);

    // Evaluate based on operator
    switch (operator) {
      case "EQUALS":
        return contextValue === conditionValue;

      case "GREATER_THAN":
        return contextValue > conditionValue;

      case "LESS_THAN":
        return contextValue < conditionValue;

      case "BETWEEN": {
        if (!Array.isArray(conditionValue) || conditionValue.length !== 2) {
          return false;
        }
        return contextValue >= conditionValue[0] && contextValue <= conditionValue[1];
      }

      case "IN":
        return Array.isArray(conditionValue) && conditionValue.includes(contextValue);

      case "CONTAINS":
        return (
          typeof contextValue === "string" &&
          contextValue.includes(String(conditionValue))
        );

      default:
        return false;
    }
  }

  /**
   * Parse condition value from JSON string.
   */
  private static parseConditionValue(value: string): any {
    try {
      return JSON.parse(value);
    } catch {
      return value; // Return as string if not valid JSON
    }
  }

  /**
   * Get the most restrictive rule (highest priority, most approvals).
   */
  static getMostRestrictiveRule(rules: MatchedRule[]): MatchedRule | null {
    if (rules.length === 0) return null;

    return rules.reduce((mostRestrictive, current) => {
      // Higher approval count is more restrictive
      if (current.requiredApprovalsCount > mostRestrictive.requiredApprovalsCount) {
        return current;
      }
      // Tie-break by priority
      if (current.requiredApprovalsCount === mostRestrictive.requiredApprovalsCount) {
        if (current.priority < mostRestrictive.priority) {
          return current;
        }
      }
      return mostRestrictive;
    });
  }
}
