/**
 * Phase 23 — Enterprise Workflow Engine: Escalation
 *
 * Deterministic escalation driven by configured policies. Triggers:
 * time-based (idle since a step state), SLA breach, risk-based,
 * priority-based. Escalations are multi-level — each level raises
 * authority and/or visibility, and always leaves an audit trail.
 */

import type {
  EscalationPolicy,
  EscalationStep,
  EscalationTrigger,
  StepState,
  WorkflowInstance,
} from "./types";
import { RISK_ORDER, PRIORITY_ORDER } from "./types";

export interface EscalationCheckContext {
  instance: WorkflowInstance;
  step: StepState;
  slaStatus: "on-track" | "at-risk" | "breached" | "completed" | "paused";
  now: string;
}

export interface EscalationDecision {
  triggered: boolean;
  trigger: EscalationTrigger | null;
  policy: EscalationPolicy | null;
  level: number;
}

function triggerFires(
  trigger: EscalationTrigger,
  ctx: EscalationCheckContext,
): boolean {
  switch (trigger.kind) {
    case "sla-breach":
      return ctx.slaStatus === "breached";
    case "risk":
      return (
        trigger.riskAt !== undefined &&
        RISK_ORDER[ctx.instance.risk] >= RISK_ORDER[trigger.riskAt]
      );
    case "priority":
      return (
        trigger.priorityAt !== undefined &&
        PRIORITY_ORDER[ctx.instance.priority] >= PRIORITY_ORDER[trigger.priorityAt]
      );
    case "time": {
      if (trigger.afterSeconds === undefined) return false;
      const fromState = trigger.fromStepState;
      if (fromState && ctx.step.state !== fromState) return false;
      const anchor = ctx.step.startedAt ?? ctx.step.acceptedAt;
      if (!anchor) return false;
      const elapsed = (new Date(ctx.now).getTime() - new Date(anchor).getTime()) / 1000;
      return elapsed >= trigger.afterSeconds;
    }
  }
}

export class EscalationEngine {
  private readonly policies = new Map<string, EscalationPolicy>();

  register(policy: EscalationPolicy): void {
    this.policies.set(policy.id, policy);
  }

  getPolicy(id: string): EscalationPolicy | undefined {
    return this.policies.get(id);
  }

  listPolicies(): EscalationPolicy[] {
    return [...this.policies.values()].sort((a, b) => a.id.localeCompare(b.id));
  }

  /** Deterministic: given the same instance, step, SLA and clock, the same
   *  decision returns. Multi-level: next level = instance.escalationLevel. */
  check(
    policy: EscalationPolicy,
    ctx: EscalationCheckContext,
  ): EscalationDecision {
    const trigger = policy.triggers.find((t) => triggerFires(t, ctx)) ?? null;
    if (!trigger) {
      return { triggered: false, trigger: null, policy, level: ctx.instance.escalationLevel };
    }
    const level = Math.min(ctx.instance.escalationLevel, Math.max(0, policy.steps.length - 1));
    return { triggered: true, trigger, policy, level };
  }

  /** Resolve the escalation step at the given level (clamps to last). */
  resolveStep(policy: EscalationPolicy, level: number): EscalationStep | null {
    if (policy.steps.length === 0) return null;
    const index = Math.min(level, policy.steps.length - 1);
    return policy.steps[index];
  }
}
