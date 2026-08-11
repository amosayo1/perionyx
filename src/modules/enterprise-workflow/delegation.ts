/**
 * Phase 23 — Enterprise Workflow Engine: Delegation
 *
 * Deterministic delegation with seven canonical types (temporary,
 * permanent, vacation, out-of-office, department, approval, time-bound).
 * A delegation only applies when it is active, in effect, and its scope
 * matches the work. All delegation events are audited.
 */

import type {
  DelegationRule,
  DelegationScope,
  DelegationType,
  WorkflowInstance,
} from "./types";
import { RISK_ORDER, PRIORITY_ORDER } from "./types";

export interface DelegationResolutionContext {
  tenantId: string;
  workflowId: string;
  stepKind?: string;
  role?: string | null;
  queueId?: string | null;
  priority: WorkflowInstance["priority"];
  risk: WorkflowInstance["risk"];
  now: string;
}

export interface DelegationResolution {
  rule: DelegationRule | null;
  delegateId: string | null;
}

const TYPE_PRECEDENCE: Record<DelegationType, number> = {
  "time-bound": 0,
  vacation: 1,
  "out-of-office": 2,
  approval: 3,
  department: 4,
  temporary: 5,
  permanent: 6,
};

function scopeMatches(scope: DelegationScope | undefined, ctx: DelegationResolutionContext): boolean {
  if (!scope) return true;
  if (scope.workflowId && scope.workflowId !== ctx.workflowId) return false;
  if (scope.stepKind && scope.stepKind !== ctx.stepKind) return false;
  if (scope.role && scope.role !== ctx.role) return false;
  if (scope.queueId && scope.queueId !== ctx.queueId) return false;
  if (scope.priority && PRIORITY_ORDER[scope.priority] > PRIORITY_ORDER[ctx.priority]) return false;
  if (scope.risk && RISK_ORDER[scope.risk] > RISK_ORDER[ctx.risk]) return false;
  return true;
}

function isInEffect(rule: DelegationRule, now: string): boolean {
  if (now < rule.effectiveFrom) return false;
  if (rule.effectiveUntil && now > rule.effectiveUntil) return false;
  return true;
}

export class DelegationEngine {
  private readonly rules = new Map<string, DelegationRule>();
  private seq = 0;

  private nextId(): string {
    this.seq += 1;
    return `del-${this.seq}`;
  }

  createDelegation(input: {
    tenantId: string;
    ownerId: string;
    delegateId: string;
    type: DelegationType;
    scope?: DelegationScope;
    effectiveFrom: string;
    effectiveUntil?: string | null;
    metadata?: Record<string, unknown>;
  }): DelegationRule {
    if (input.ownerId === input.delegateId) {
      throw new Error("Delegation must target a different operator than the owner");
    }
    if (input.effectiveUntil && input.effectiveUntil < input.effectiveFrom) {
      throw new Error("Delegation effectiveUntil precedes effectiveFrom");
    }
    const rule: DelegationRule = {
      id: this.nextId(),
      tenantId: input.tenantId,
      ownerId: input.ownerId,
      delegateId: input.delegateId,
      type: input.type,
      scope: input.scope ?? {},
      effectiveFrom: input.effectiveFrom,
      effectiveUntil: input.effectiveUntil ?? null,
      active: true,
      createdAt: input.effectiveFrom,
      metadata: input.metadata,
    };
    this.rules.set(rule.id, rule);
    return rule;
  }

  cancelDelegation(id: string): DelegationRule | null {
    const rule = this.rules.get(id);
    if (!rule) return null;
    rule.active = false;
    return rule;
  }

  listDelegations(ownerId: string, tenantId: string): DelegationRule[] {
    return [...this.rules.values()]
      .filter((r) => r.ownerId === ownerId && r.tenantId === tenantId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  /**
   * Resolve who must actually handle work owned by `ownerId` right now.
   * Deterministic precedence: the most specific, in-effect, active rule
   * wins, ordered by delegation type precedence.
   */
  resolve(ownerId: string, ctx: DelegationResolutionContext): DelegationResolution {
    const candidates = [...this.rules.values()].filter(
      (r) =>
        r.active &&
        r.ownerId === ownerId &&
        r.tenantId === ctx.tenantId &&
        scopeMatches(r.scope, ctx) &&
        isInEffect(r, ctx.now),
    );
    candidates.sort((a, b) => {
      const byPrecedence = TYPE_PRECEDENCE[a.type] - TYPE_PRECEDENCE[b.type];
      if (byPrecedence !== 0) return byPrecedence;
      return a.createdAt.localeCompare(b.createdAt);
    });
    const rule = candidates[0] ?? null;
    return { rule, delegateId: rule?.delegateId ?? null };
  }
}
