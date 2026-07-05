import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { ValidationError, ConflictError } from "@/lib/errors/app-error";
import { GovernanceService } from "@/modules/governance/governance.service";

export type PolicySummary = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  enabled: boolean;
  priority: number;
  actionType: string;
  ruleCount: number;
  lastEvaluatedAt: string | null;
  createdAt: string;
};

export type PolicyTestInput = {
  amount: number;
  transactionType: string;
  currency: string;
  walletId?: string;
  metadata?: Record<string, any>;
};

export class PolicyEngineService {
  static async listPolicies(ctx: TenantContext, includeDisabled: boolean = false) {
    const where: any = { companyId: ctx.companyId };
    if (!includeDisabled) where.enabled = true;

    const policies = await prisma.policy.findMany({
      where,
      orderBy: [{ priority: "asc" }, { name: "asc" }],
      include: { _count: { select: { rules: true } } },
    });

    return policies.map((p) => ({
      id: p.id, name: p.name, description: p.description, type: p.type,
      enabled: p.enabled, priority: p.priority, actionType: p.actionType,
      ruleCount: p._count.rules, lastEvaluatedAt: p.lastEvaluatedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    }));
  }

  static async getPolicy(ctx: TenantContext, policyId: string) {
    const policy = await prisma.policy.findFirst({
      where: { id: policyId, companyId: ctx.companyId },
      include: { rules: true },
    });
    if (!policy) return null;
    return {
      ...policy,
      minAmount: policy.minAmount?.toString() ?? null,
      maxAmount: policy.maxAmount?.toString() ?? null,
      actionConfig: policy.actionConfig as Record<string, any> | null,
      rules: policy.rules.map((r) => ({ id: r.id, field: r.field, operator: r.operator, value: r.value, negate: r.negate })),
      createdAt: policy.createdAt.toISOString(), updatedAt: policy.updatedAt.toISOString(),
    };
  }

  static async createPolicy(ctx: TenantContext, data: {
    name: string; description?: string; type?: string; priority?: number;
    actionType?: string; actionConfig?: Record<string, any>;
    appliesToTransactionTypes?: string[]; appliesToConnectorTypes?: string[];
    appliesToCurrencies?: string[]; minAmount?: number; maxAmount?: number;
    rules?: Array<{ field: string; operator: string; value: string; negate?: boolean }>;
  }) {
    const existing = await prisma.policy.findFirst({
      where: { companyId: ctx.companyId, name: data.name },
    });
    if (existing) throw new ValidationError(`Policy "${data.name}" already exists`);

    const policy = await prisma.policy.create({
      data: {
        companyId: ctx.companyId, name: data.name, description: data.description,
        type: (data.type as any) ?? "APPROVAL", priority: data.priority ?? 100,
        actionType: data.actionType ?? "BLOCK", actionConfig: (data.actionConfig ?? null) as any,
        appliesToTransactionTypes: data.appliesToTransactionTypes ?? [],
        appliesToConnectorTypes: data.appliesToConnectorTypes ?? [],
        appliesToCurrencies: data.appliesToCurrencies ?? [],
        minAmount: data.minAmount ?? null, maxAmount: data.maxAmount ?? null,
        rules: data.rules ? {
          create: data.rules.map((r) => ({
            field: r.field, operator: r.operator as any, value: r.value, negate: r.negate ?? false,
          })),
        } : undefined,
      },
      include: { rules: true },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "POLICY_CREATED", resourceType: "Policy", resourceId: policy.id,
      metadata: { name: policy.name, type: policy.type, ruleCount: data.rules?.length ?? 0 },
    });

    return policy;
  }

  static async updatePolicy(ctx: TenantContext, policyId: string, data: Partial<{
    name: string; description: string; enabled: boolean; priority: number;
    actionType: string; actionConfig: Record<string, any>;
    appliesToTransactionTypes: string[]; minAmount: number; maxAmount: number;
  }>) {
    const policy = await prisma.policy.findFirst({
      where: { id: policyId, companyId: ctx.companyId },
    });
    if (!policy) throw new ValidationError("Policy not found");

    const result = await prisma.policy.updateMany({
      where: { id: policyId, version: policy.version },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.enabled !== undefined ? { enabled: data.enabled } : {}),
        ...(data.priority !== undefined ? { priority: data.priority } : {}),
        ...(data.actionType !== undefined ? { actionType: data.actionType } : {}),
        ...(data.actionConfig !== undefined ? { actionConfig: data.actionConfig } : {}),
        ...(data.appliesToTransactionTypes !== undefined ? { appliesToTransactionTypes: data.appliesToTransactionTypes } : {}),
        ...(data.minAmount !== undefined ? { minAmount: data.minAmount } : {}),
        ...(data.maxAmount !== undefined ? { maxAmount: data.maxAmount } : {}),
        version: { increment: 1 },
      },
    });
    if (result.count === 0) {
      throw new ConflictError("Concurrent modification detected — policy was updated by another request.");
    }

    const updated = (await prisma.policy.findUnique({ where: { id: policyId } }))!;

    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "POLICY_UPDATED", resourceType: "Policy", resourceId: policyId,
      metadata: { changes: Object.keys(data) },
    });

    return updated;
  }

  static async deletePolicy(ctx: TenantContext, policyId: string) {
    const policy = await prisma.policy.findFirst({
      where: { id: policyId, companyId: ctx.companyId },
    });
    if (!policy) throw new ValidationError("Policy not found");

    await prisma.policy.delete({ where: { id: policyId } });

    await recordAudit(prisma, {
      companyId: ctx.companyId, actorUserId: ctx.userId,
      action: "POLICY_DELETED", resourceType: "Policy", resourceId: policyId,
      metadata: { name: policy.name },
    });
  }

  static async testPolicy(ctx: TenantContext, policyId: string, input: PolicyTestInput) {
    const policy = await prisma.policy.findFirst({
      where: { id: policyId, companyId: ctx.companyId },
      include: { rules: true },
    });
    if (!policy) throw new ValidationError("Policy not found");

    const matched = PolicyEngineService.evaluateRules(policy, input);
    const action = matched ? policy.actionType : null;

    const result = await prisma.policyTestResult.create({
      data: {
        policyId: policy.id, companyId: ctx.companyId,
        input: input as any, matched, action,
        details: { rulesEvaluated: policy.rules.length, matched },
      },
    });

    const evalResult = await prisma.policy.updateMany({
      where: { id: policyId, version: policy.version },
      data: { lastEvaluatedAt: new Date(), version: { increment: 1 } },
    });
    if (evalResult.count === 0) {
      throw new ConflictError("Concurrent modification detected — policy was updated by another request.");
    }

    return {
      id: result.id, policyId: result.policyId, matched, action,
      details: { policyName: policy.name, policyType: policy.type, rules: policy.rules },
      createdAt: result.createdAt.toISOString(),
    };
  }

  static async testAllPolicies(ctx: TenantContext, input: PolicyTestInput) {
    const policies = await prisma.policy.findMany({
      where: { companyId: ctx.companyId, enabled: true },
      orderBy: { priority: "asc" },
      include: { rules: true },
    });

    const results = policies.map((p) => ({
      policyId: p.id, policyName: p.name, type: p.type, priority: p.priority,
      matched: PolicyEngineService.evaluateRules(p, input),
      action: p.actionType,
    }));

    const matchedPolicy = results.find((r) => r.matched);

    return {
      matchedPolicy: matchedPolicy ?? null,
      allResults: results,
      input,
      totalPoliciesEvaluated: policies.length,
    };
  }

  static async listTestResults(ctx: TenantContext, limit: number = 20) {
    const results = await prisma.policyTestResult.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { policy: { select: { name: true } } },
    });

    return results.map((r) => ({
      id: r.id, policyName: r.policy.name,
      input: r.input as Record<string, any>, matched: r.matched, action: r.action,
      details: r.details as Record<string, any> | null,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  /**
   * Evaluate a transaction against all enabled policies.
   * Returns the first matching policy's actionType and policy, or null if no policy matches.
   */
  static async evaluateTransaction(
    companyId: string,
    input: PolicyTestInput,
    ctx?: TenantContext,
  ): Promise<{ action: string; policy: { id: string; name: string; actionConfig: Record<string, any> | null } } | null> {
    const policies = await prisma.policy.findMany({
      where: { companyId, enabled: true },
      orderBy: { priority: "asc" },
      include: { rules: true },
    });

    for (const policy of policies) {
      const matched = PolicyEngineService.evaluateRules(policy, input);
      if (matched) {
        if (ctx) {
          await GovernanceService.recordViolation(ctx, {
            policyId: policy.id,
            sourceModule: "policy_engine",
            sourceId: policy.id,
            severity: policy.actionType === "BLOCK" ? "HIGH" : "MEDIUM",
            title: `Policy triggered: ${policy.name}`,
            description: `Transaction of ${input.amount} ${input.currency} (${input.transactionType}) matched policy "${policy.name}" with action ${policy.actionType}`,
            entityType: "transaction",
            action: policy.actionType,
            details: { input, policyName: policy.name, actionType: policy.actionType },
          });
        }
        return {
          action: policy.actionType,
          policy: {
            id: policy.id,
            name: policy.name,
            actionConfig: policy.actionConfig as Record<string, any> | null,
          },
        };
      }
    }

    return null;
  }

  private static evaluateRules(policy: any, input: PolicyTestInput): boolean {
    if (!policy.rules || policy.rules.length === 0) return false;

    for (const rule of policy.rules) {
      const fieldValue = PolicyEngineService.getFieldValue(input, rule.field);
      const matches = PolicyEngineService.evaluateRule(rule.operator, fieldValue, rule.value);
      const result = rule.negate ? !matches : matches;
      if (!result) return false;
    }

    return true;
  }

  private static getFieldValue(input: PolicyTestInput, field: string): any {
    switch (field) {
      case "amount": return input.amount;
      case "transactionType": return input.transactionType;
      case "currency": return input.currency;
      case "walletId": return input.walletId;
      default: return (input as any)[field] ?? (input.metadata as any)?.[field] ?? null;
    }
  }

  private static evaluateRule(operator: string, fieldValue: any, ruleValue: string): boolean {
    const val = ruleValue;
    switch (operator) {
      case "EQUALS": return String(fieldValue) === val;
      case "NOT_EQUALS": return String(fieldValue) !== val;
      case "GREATER_THAN": return Number(fieldValue) > Number(val);
      case "LESS_THAN": return Number(fieldValue) < Number(val);
      case "BETWEEN": {
        const [min, max] = val.split(",").map(Number);
        return Number(fieldValue) >= min && Number(fieldValue) <= max;
      }
      case "IN": return val.split(",").map((s) => s.trim()).includes(String(fieldValue));
      case "NOT_IN": return !val.split(",").map((s) => s.trim()).includes(String(fieldValue));
      case "CONTAINS": return String(fieldValue).toLowerCase().includes(val.toLowerCase());
      case "MATCHES": {
        try { return new RegExp(val).test(String(fieldValue)); }
        catch { return false; }
      }
      default: return false;
    }
  }
}
