/**
 * Phase 23 — Enterprise Workflow Engine: Assignment
 *
 * Pluggable, deterministic assignment. Built-in strategies cover the
 * canonical set (direct, role, queue, round-robin, load-balance, skill,
 * rule, custom). Modules register additional strategies through the
 * registry without touching the engine.
 */

import type {
  AssignmentContext,
  AssignmentResult,
  AssignmentSpec,
  AssignmentStrategy,
} from "./types";

function sortedMembers(members: string[]): string[] {
  return [...members].sort();
}

function firstMember(role: string, ctx: AssignmentContext): string | null {
  const members = sortedMembers(ctx.resolveRoleMembers(role));
  return members[0] ?? null;
}

export class AssignmentEngine {
  private readonly strategies = new Map<string, AssignmentStrategy>();

  constructor() {
    this.register(new DirectStrategy());
    this.register(new RoleStrategy());
    this.register(new QueueStrategy());
    this.register(new RoundRobinStrategy());
    this.register(new LoadBalanceStrategy());
    this.register(new SkillStrategy());
    this.register(new RuleStrategy(this));
  }

  register(strategy: AssignmentStrategy): void {
    this.strategies.set(strategy.id, strategy);
  }

  getStrategy(id: string): AssignmentStrategy | undefined {
    return this.strategies.get(id);
  }

  listStrategies(): string[] {
    return [...this.strategies.keys()].sort();
  }

  /**
   * Resolve an assignment spec to a concrete assignee/queue/role.
   * Deterministic: given the same spec, members, workload and prior
   * round-robin state, the result is identical.
   */
  assign(spec: AssignmentSpec, ctx: AssignmentContext): AssignmentResult {
    const strategy = this.strategies.get(strategyIdOf(spec));
    if (!strategy) {
      throw new Error(`No assignment strategy registered for: ${strategyIdOf(spec)}`);
    }
    const result = strategy.assign(spec, ctx);
    return result;
  }
}

export function strategyIdOf(spec: AssignmentSpec): string {
  return spec.strategy === "custom" ? spec.strategyId : spec.strategy;
}

// ── Built-in strategies ───────────────────────────────────────────────────────

export class DirectStrategy implements AssignmentStrategy {
  readonly id = "direct";
  assign(spec: AssignmentSpec, _ctx: AssignmentContext): AssignmentResult {
    if (spec.strategy !== "direct") {
      throw new Error(`DirectStrategy received ${spec.strategy} spec`);
    }
    return { assigneeId: spec.userId, queueId: null, role: null, strategyId: this.id };
  }
}

export class RoleStrategy implements AssignmentStrategy {
  readonly id = "role";
  assign(spec: AssignmentSpec, ctx: AssignmentContext): AssignmentResult {
    if (spec.strategy !== "role") {
      throw new Error(`RoleStrategy received ${spec.strategy} spec`);
    }
    return {
      assigneeId: firstMember(spec.role, ctx),
      queueId: null,
      role: spec.role,
      strategyId: this.id,
    };
  }
}

export class QueueStrategy implements AssignmentStrategy {
  readonly id = "queue";
  assign(spec: AssignmentSpec, ctx: AssignmentContext): AssignmentResult {
    if (spec.strategy !== "queue") {
      throw new Error(`QueueStrategy received ${spec.strategy} spec`);
    }
    return {
      assigneeId: null,
      queueId: spec.queueId,
      role: null,
      strategyId: this.id,
    };
  }
}

/** Cycling assignment. The offset is derived deterministically from the
 *  scope key plus the number of prior assignments in that scope. */
export class RoundRobinStrategy implements AssignmentStrategy {
  readonly id = "round-robin";
  private readonly counters = new Map<string, number>();

  assign(spec: AssignmentSpec, ctx: AssignmentContext): AssignmentResult {
    if (spec.strategy !== "round-robin") {
      throw new Error(`RoundRobinStrategy received ${spec.strategy} spec`);
    }
    const { role, queueId } = spec.scope;
    const members = role ? sortedMembers(ctx.resolveRoleMembers(role)) : [];
    if (role && members.length === 0) {
      return { assigneeId: null, queueId: queueId ?? null, role: role ?? null, strategyId: this.id };
    }
    const key = `${ctx.tenantId}:${role ?? queueId ?? "scope"}`;
    const index = this.counters.get(key) ?? 0;
    this.counters.set(key, index + 1);
    if (members.length === 0) {
      return { assigneeId: null, queueId: queueId ?? null, role: role ?? null, strategyId: this.id };
    }
    return {
      assigneeId: members[index % members.length],
      queueId: queueId ?? null,
      role: role ?? null,
      strategyId: this.id,
    };
  }
}

/** Assigns to the member with the lowest active workload; ties break
 *  alphabetically for determinism. */
export class LoadBalanceStrategy implements AssignmentStrategy {
  readonly id = "load-balance";

  assign(spec: AssignmentSpec, ctx: AssignmentContext): AssignmentResult {
    if (spec.strategy !== "load-balance") {
      throw new Error(`LoadBalanceStrategy received ${spec.strategy} spec`);
    }
    const { role, queueId } = spec.scope;
    const members = role ? sortedMembers(ctx.resolveRoleMembers(role)) : [];
    if (members.length === 0) {
      return { assigneeId: null, queueId: queueId ?? null, role: role ?? null, strategyId: this.id };
    }
    let best = members[0];
    let bestLoad = Number.POSITIVE_INFINITY;
    for (const member of members) {
      const load = ctx.activeWorkload(member);
      if (load < bestLoad) {
        best = member;
        bestLoad = load;
      }
    }
    return { assigneeId: best, queueId: queueId ?? null, role: role ?? null, strategyId: this.id };
  }
}

export class SkillStrategy implements AssignmentStrategy {
  readonly id = "skill";

  assign(spec: AssignmentSpec, ctx: AssignmentContext): AssignmentResult {
    if (spec.strategy !== "skill") {
      throw new Error(`SkillStrategy received ${spec.strategy} spec`);
    }
    const pool = spec.role ? ctx.resolveRoleMembers(spec.role) : allKnown(ctx);
    const qualified = sortedMembers(pool).filter((member) =>
      spec.skills.every((skill) => ctx.memberSkills(member).includes(skill)),
    );
    return {
      assigneeId: qualified[0] ?? null,
      queueId: null,
      role: spec.role ?? null,
      strategyId: this.id,
    };
  }
}

function allKnown(_ctx: AssignmentContext): string[] {
  return [];
}

/** Delegates to a registered strategy that returns a concrete result. */
export class RuleStrategy implements AssignmentStrategy {
  readonly id = "rule";
  private readonly ruleResults = new Map<string, AssignmentResult>();

  constructor(private readonly engine: AssignmentEngine) {}

  defineRule(ruleId: string, result: AssignmentResult): void {
    this.ruleResults.set(ruleId, result);
  }

  assign(spec: AssignmentSpec, _ctx: AssignmentContext): AssignmentResult {
    if (spec.strategy !== "rule") {
      throw new Error(`RuleStrategy received ${spec.strategy} spec`);
    }
    const rule = this.ruleResults.get(spec.ruleId);
    if (!rule) {
      throw new Error(`No assignment rule defined for: ${spec.ruleId}`);
    }
    return rule;
  }
}

export function assignWith(
  engine: AssignmentEngine,
  spec: AssignmentSpec,
  ctx: AssignmentContext,
): AssignmentResult {
  return engine.assign(spec, ctx);
}
