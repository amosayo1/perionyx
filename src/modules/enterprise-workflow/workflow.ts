/**
 * Phase 23 — Enterprise Workflow Engine: Workflow Service
 *
 * The orchestrator. Owns instances, applies the state machine, resolves
 * assignment/delegation/escalation/SLA, validates every transition,
 * advances through routing, and records an append-only audit trail.
 * Deterministic: wall-clock is injected via `now()`, all ordering is
 * explicit, and no randomness is used.
 */

import type {
  AssignmentContext,
  AuditEntry,
  AuditEntryType,
  FactValue,
  StepDefinition,
  StepKind,
  StepState,
  WorkflowDecisionContext,
  WorkflowDefinition,
  WorkflowInstance,
  WorkflowInstanceSummary,
  WorkflowPriority,
  WorkflowState,
  WorkQueue,
  WorkQueueItem,
} from "./types";
import { RISK_ORDER, WORKFLOW_STATE_LABELS } from "./types";
import { assertLegalTransition, STATE_RANK } from "./state-machine";
import { buildConditionContext, evaluateCondition } from "./condition";
import { DelegationEngine } from "./delegation";
import { validateTransition } from "./transition";
import { OwnershipEngine } from "./ownership";
import { AuditTrail } from "./audit";
import { QueueEngine } from "./queue";
import { initStepSla, refreshStepSla, resumeStepSla, pauseStepSla, stepDueAt } from "./sla";
import { WorkflowRegistry } from "./registry";

export interface WorkflowServiceOptions {
  registry?: WorkflowRegistry;
  now?: () => string;
  roleResolver?: (tenantId: string, role: string) => string[];
  skillResolver?: (tenantId: string, userId: string) => string[];
  workloadResolver?: (tenantId: string, userId: string) => number;
  permissionCheck?: (actor: string, action: string) => boolean;
  delegation?: DelegationEngine;
  queue?: QueueEngine;
  ownership?: OwnershipEngine;
}

export interface CreateInstanceInput {
  workflowId: string;
  tenantId: string;
  initiatorId: string;
  variables?: Record<string, FactValue>;
  entityRef?: { type: string; id: string } | null;
  ownerId?: string | null;
  priority?: WorkflowPriority;
}

export interface CompleteStepInput {
  outcome: string;
  reason?: string;
}

export class WorkflowService {
  private readonly registry: WorkflowRegistry;
  private readonly now: () => string;
  private readonly roleResolver: WorkflowServiceOptions["roleResolver"];
  private readonly skillResolver: WorkflowServiceOptions["skillResolver"];
  private readonly workloadResolver: WorkflowServiceOptions["workloadResolver"];
  private readonly permissionCheck: WorkflowServiceOptions["permissionCheck"];
  readonly delegation: DelegationEngine;
  readonly queue: QueueEngine;
  readonly ownership: OwnershipEngine;
  readonly audit: AuditTrail;

  private readonly instances = new Map<string, WorkflowInstance>();
  private readonly nested = new Map<string, string[]>();
  private seq = 0;

  constructor(options: WorkflowServiceOptions) {
    this.registry = options.registry ?? new WorkflowRegistry();
    this.now = options.now ?? (() => new Date().toISOString());
    this.roleResolver = options.roleResolver;
    this.skillResolver = options.skillResolver;
    this.workloadResolver = options.workloadResolver;
    this.permissionCheck = options.permissionCheck;
    this.delegation = options.delegation ?? new DelegationEngine();
    this.queue = options.queue ?? new QueueEngine();
    this.ownership = options.ownership ?? new OwnershipEngine();
    this.audit = new AuditTrail();
  }

  private nextId(): string {
    this.seq += 1;
    return `wf-${this.seq}`;
  }

  private record(
    instance: WorkflowInstance,
    type: AuditEntryType,
    actor: string,
    previous: string | null,
    next: string | null,
    reason: string,
    extra?: { stepId?: string; evidenceIds?: string[]; decisionId?: string | null; metadata?: Record<string, unknown> },
  ): AuditEntry {
    return this.audit.record({
      type,
      tenantId: instance.tenantId,
      workflowId: instance.workflowId,
      instanceId: instance.id,
      stepId: extra?.stepId ?? null,
      actor,
      at: this.now(),
      previousState: previous,
      newState: next,
      reason,
      evidenceIds: extra?.evidenceIds ?? [],
      decisionId: extra?.decisionId ?? instance.decision?.decisionId ?? null,
      metadata: extra?.metadata,
    });
  }

  private def(workflowId: string, version?: number): WorkflowDefinition {
    const definition = this.registry.getDefinition(workflowId);
    if (!definition) throw new Error(`Workflow not registered: ${workflowId}`);
    if (version !== undefined && definition.version !== version) {
      throw new Error(
        `Workflow ${workflowId} version mismatch: expected ${version}, got ${definition.version}`,
      );
    }
    return definition;
  }

  // ── Lifecycle: create / start ─────────────────────────────────────────────

  createInstance(input: CreateInstanceInput): WorkflowInstance {
    const definition = this.def(input.workflowId);
    const at = this.now();
    const instance: WorkflowInstance = {
      id: this.nextId(),
      tenantId: input.tenantId,
      workflowId: input.workflowId,
      workflowVersion: definition.version,
      state: "created",
      currentStepId: null,
      steps: {},
      parallelSets: {},
      pendingSequence: [],
      activeLoop: null,
      ownerId: input.ownerId ?? input.initiatorId,
      initiatorId: input.initiatorId,
      priority: input.priority ?? definition.defaultPriority ?? this.registry.defaultPriority(),
      risk: "low",
      variables: input.variables ?? {},
      decision: null,
      entityRef: input.entityRef ?? null,
      loopCounts: {},
      escalationLevel: 0,
      createdAt: at,
      startedAt: null,
      completedAt: null,
      cancelledAt: null,
      closedAt: null,
    };
    this.instances.set(instance.id, instance);
    this.record(instance, "workflow.created", input.initiatorId, null, "created", "Instance created");
    if (definition.autoStart) {
      this.start(instance.id, input.initiatorId);
    }
    return instance;
  }

  attachDecision(instanceId: string, decision: WorkflowDecisionContext, actor: string): WorkflowInstance {
    const instance = this.requireInstance(instanceId);
    instance.decision = decision;
    if (RISK_ORDER[decision.risk] > RISK_ORDER[instance.risk]) {
      instance.risk = decision.risk;
    }
    this.record(instance, "decision.attached", actor, instance.state, instance.state, "Decision attached", {
      decisionId: decision.decisionId,
      evidenceIds: [...decision.supportingEvidence, ...decision.missingEvidence],
    });
    return instance;
  }

  start(instanceId: string, actor: string): WorkflowInstance {
    const instance = this.requireInstance(instanceId);
    assertLegalTransition(instance.state, "assigned");
    const previous = instance.state;
    instance.startedAt = this.now();
    this.record(instance, "workflow.started", actor, previous, "assigned", "Workflow started");
    const definition = this.def(instance.workflowId, instance.workflowVersion);
    this.activateStep(instance, definition.entryStepId, actor);
    this.recomputeState(instance);
    return instance;
  }

  // ── Step activation ───────────────────────────────────────────────────────

  private buildAssignmentContext(instance: WorkflowInstance): AssignmentContext {
    const service = this;
    return {
      tenantId: instance.tenantId,
      resolveRoleMembers: (role) =>
        service.roleResolver ? service.roleResolver(instance.tenantId, role) : [],
      memberSkills: (userId) =>
        service.skillResolver ? service.skillResolver(instance.tenantId, userId) : [],
      activeWorkload: (userId) =>
        service.workloadResolver ? service.workloadResolver(instance.tenantId, userId) : 0,
      now: service.now,
    };
  }

  private resolveDelegation(
    instance: WorkflowInstance,
    ownerId: string,
    step: StepDefinition,
    role: string | null,
    queueId: string | null,
  ) {
    return this.delegation.resolve(ownerId, {
      tenantId: instance.tenantId,
      workflowId: instance.workflowId,
      stepKind: step.kind,
      role,
      queueId,
      priority: instance.priority,
      risk: instance.risk,
      now: this.now(),
    });
  }

  /** Activate a step: materialize state, assign via strategy + delegation,
   *  then auto-complete routing/notification/gate/autoComplete steps. */
  private activateStep(instance: WorkflowInstance, stepId: string, actor: string): void {
    const definition = this.def(instance.workflowId, instance.workflowVersion);
    const step = definition.steps[stepId];
    if (!step) throw new Error(`Step ${stepId} not found in ${instance.workflowId}`);

    const state: StepState = {
      stepId,
      state: "assigned",
      assigneeId: null,
      queueId: null,
      role: null,
      delegatedFrom: null,
      delegationId: null,
      escalationLevel: 0,
      result: null,
      startedAt: null,
      acceptedAt: null,
      completedAt: null,
      sla: null,
    };
    instance.steps[stepId] = state;
    instance.currentStepId = stepId;

    if (step.assignment) {
      const result = this.registry.assignment.assign(step.assignment, this.buildAssignmentContext(instance));
      state.assigneeId = result.assigneeId;
      state.queueId = result.queueId;
      state.role = result.role;
      if (result.assigneeId) {
        const del = this.resolveDelegation(instance, result.assigneeId, step, result.role, result.queueId);
        if (del.rule) {
          state.delegatedFrom = result.assigneeId;
          state.delegationId = del.rule.id;
          state.assigneeId = del.delegateId;
          state.state = "delegated";
          this.record(instance, "step.delegated", actor, "assigned", "delegated", `Delegated to ${del.delegateId}`, {
            stepId,
            metadata: { delegationId: del.rule.id },
          });
        }
      }
    }

    if (step.sla && state.state !== "delegated") {
      const at = this.now();
      state.sla = initStepSla(step.sla, at, at);
    }

    if (state.state === "assigned") {
      this.record(instance, "step.assigned", actor, "created", "assigned", `Step ${stepId} assigned`, { stepId });
      this.notifyStep("assigned", instance, stepId, state, "Work assigned");
    }

    this.recomputeState(instance);

    if (step.kind === "routing" || step.kind === "notification" || step.kind === "gate" || step.autoComplete) {
      this.completeStepInternal(instance, stepId, actor, { outcome: "auto" });
    }
  }

  // ── Operator actions ──────────────────────────────────────────────────────

  accept(instanceId: string, stepId: string, actor: string): WorkflowInstance {
    const instance = this.requireInstance(instanceId);
    const step = this.requireStep(instance, stepId);
    this.applyTransition(instance, step, "accepted", actor, "Operator accepted", { requireAssignee: true });
    step.acceptedAt = this.now();
    if (step.sla) step.sla = refreshStepSla(step.sla, null, this.now());
    this.record(instance, "step.accepted", actor, step.state, "accepted", "Step accepted", { stepId });
    this.recomputeState(instance);
    return instance;
  }

  startStep(instanceId: string, stepId: string, actor: string): WorkflowInstance {
    const instance = this.requireInstance(instanceId);
    const step = this.requireStep(instance, stepId);
    this.applyTransition(instance, step, "in-progress", actor, "Operator started work", { requireAssignee: true });
    step.startedAt = this.now();
    this.record(instance, "step.started", actor, step.state, "in-progress", "Step started", { stepId });
    this.recomputeState(instance);
    return instance;
  }

  complete(instanceId: string, stepId: string, actor: string, input: CompleteStepInput): WorkflowInstance {
    const instance = this.requireInstance(instanceId);
    const step = this.requireStep(instance, stepId);
    const definition = this.def(instance.workflowId, instance.workflowVersion);
    const stepDef = definition.steps[stepId];
    const requiresDecision =
      stepDef.requiresDecision === true ||
      (definition.requiresDecision && (stepDef.kind === "approval" || stepDef.kind === "decision"));

    this.applyTransition(instance, step, "completed", actor, input.reason ?? "Step completed", {
      requireAssignee: true,
      requiresDecision,
    });
    step.result = { outcome: input.outcome, by: actor, at: this.now(), reason: input.reason };
    step.completedAt = this.now();
    step.state = "completed";
    if (step.sla) step.sla = refreshStepSla(step.sla, step.completedAt, this.now());
    this.record(instance, "step.completed", actor, step.state, "completed", `Completed with outcome "${input.outcome}"`, {
      stepId,
    });
    this.advance(instance, stepId, actor);
    this.recomputeState(instance);
    return instance;
  }

  wait(instanceId: string, stepId: string, actor: string, until: string): WorkflowInstance {
    const instance = this.requireInstance(instanceId);
    const step = this.requireStep(instance, stepId);
    this.applyTransition(instance, step, "waiting", actor, "Step waiting", { requireAssignee: true });
    if (step.sla) step.sla = pauseStepSla(step.sla, this.now());
    this.record(instance, "step.waiting", actor, step.state, "waiting", `Waiting until ${until}`, { stepId });
    this.recomputeState(instance);
    return instance;
  }

  resume(instanceId: string, stepId: string, actor: string): WorkflowInstance {
    const instance = this.requireInstance(instanceId);
    const step = this.requireStep(instance, stepId);
    this.applyTransition(instance, step, "in-progress", actor, "Step resumed");
    if (step.sla) step.sla = resumeStepSla(step.sla, this.now());
    this.record(instance, "step.started", actor, step.state, "in-progress", "Step resumed", { stepId });
    this.recomputeState(instance);
    return instance;
  }

  block(instanceId: string, stepId: string, actor: string, reason: string): WorkflowInstance {
    const instance = this.requireInstance(instanceId);
    const step = this.requireStep(instance, stepId);
    this.applyTransition(instance, step, "blocked", actor, reason, { requireAssignee: true });
    this.record(instance, "step.blocked", actor, step.state, "blocked", reason, { stepId });
    this.recomputeState(instance);
    return instance;
  }

  unblock(instanceId: string, stepId: string, actor: string, reason: string): WorkflowInstance {
    const instance = this.requireInstance(instanceId);
    const step = this.requireStep(instance, stepId);
    this.applyTransition(instance, step, "in-progress", actor, reason);
    this.record(instance, "step.unblocked", actor, step.state, "in-progress", reason, { stepId });
    this.recomputeState(instance);
    return instance;
  }

  delegate(instanceId: string, stepId: string, actor: string, delegateId: string, reason: string): WorkflowInstance {
    const instance = this.requireInstance(instanceId);
    const step = this.requireStep(instance, stepId);
    if (actor !== step.assigneeId && actor !== instance.ownerId && actor !== instance.initiatorId) {
      throw new Error(`Actor ${actor} lacks authority to delegate ${stepId}`);
    }
    this.applyTransition(instance, step, "delegated", actor, reason, { requireAssignee: true });
    step.delegatedFrom = step.assigneeId ?? instance.ownerId ?? null;
    step.assigneeId = delegateId;
    step.delegationId = null;
    this.record(instance, "step.delegated", actor, step.state, "delegated", reason, { stepId });
    this.notifyStep("delegation", instance, stepId, step, `Delegated to ${delegateId}`);
    this.recomputeState(instance);
    return instance;
  }

  escalate(instanceId: string, stepId: string, actor: string, reason?: string): WorkflowInstance {
    const instance = this.requireInstance(instanceId);
    const step = this.requireStep(instance, stepId);
    this.applyTransition(instance, step, "escalated", actor, reason ?? "Escalated");
    instance.escalationLevel = Math.min(instance.escalationLevel + 1, 3);
    step.escalationLevel = instance.escalationLevel;
    const definition = this.def(instance.workflowId, instance.workflowVersion);
    const policyId = definition.steps[stepId].escalationPolicyId;
    if (policyId) {
      const policy = this.registry.getEscalationPolicy(policyId);
      if (policy) {
        const escalationStep = this.registry.escalation.resolveStep(policy, step.escalationLevel);
        if (escalationStep && escalationStep.action !== "notify" && escalationStep.target.kind === "user") {
          step.delegatedFrom = step.assigneeId;
          step.assigneeId = escalationStep.target.value ?? null;
        } else if (escalationStep && escalationStep.target.kind === "role" && this.roleResolver) {
          const members = [...this.roleResolver(instance.tenantId, escalationStep.target.value ?? "")].sort();
          if (members[0]) {
            step.delegatedFrom = step.assigneeId;
            step.assigneeId = members[0];
          }
        }
      }
    }
    this.record(instance, "step.escalated", actor, step.state, "escalated", reason ?? "Escalated", { stepId });
    this.notifyStep("escalation", instance, stepId, step, `Escalated (level ${step.escalationLevel})`);
    this.recomputeState(instance);
    return instance;
  }

  cancel(instanceId: string, actor: string, reason: string): WorkflowInstance {
    const instance = this.requireInstance(instanceId);
    assertLegalTransition(instance.state, "cancelled");
    const previous = instance.state;
    instance.state = "cancelled";
    instance.cancelledAt = this.now();
    this.record(instance, "workflow.cancelled", actor, previous, "cancelled", reason);
    return instance;
  }

  close(instanceId: string, actor: string): WorkflowInstance {
    const instance = this.requireInstance(instanceId);
    assertLegalTransition(instance.state, "closed");
    const previous = instance.state;
    instance.state = "closed";
    instance.closedAt = this.now();
    this.record(instance, "workflow.closed", actor, previous, "closed", "Workflow closed");
    return instance;
  }

  // ── Internal transitions ──────────────────────────────────────────────────

  private applyTransition(
    instance: WorkflowInstance,
    step: StepState,
    to: WorkflowState,
    actor: string,
    reason: string,
    opts: { requireAssignee?: boolean; requiresDecision?: boolean } = {},
  ): void {
    const validation = validateTransition({
      instance,
      stepId: step.stepId,
      from: step.state,
      to,
      actor,
      requireAssignee: opts.requireAssignee,
      requiresDecision: opts.requiresDecision,
      permissionCheck: this.permissionCheck,
      stepKind: this.def(instance.workflowId, instance.workflowVersion).steps[step.stepId]?.kind,
    });
    if (!validation.valid) {
      this.record(instance, "transition.rejected", actor, step.state, to, `Rejected: ${validation.errors.join("; ")}`, {
        stepId: step.stepId,
      });
      throw new Error(`Transition rejected: ${validation.errors.join("; ")}`);
    }
    step.state = to;
  }

  private completeStepInternal(
    instance: WorkflowInstance,
    stepId: string,
    actor: string,
    input: CompleteStepInput,
  ): void {
    const step = this.requireStep(instance, stepId);
    const previous = step.state;
    step.result = { outcome: input.outcome, by: actor, at: this.now(), reason: input.reason };
    step.completedAt = this.now();
    step.state = "completed";
    if (step.sla) step.sla = refreshStepSla(step.sla, step.completedAt, this.now());
    this.record(instance, "step.completed", actor, previous, "completed", `Completed with outcome "${input.outcome}"`, {
      stepId,
    });
    this.advance(instance, stepId, actor);
  }

  // ── Routing / advance ─────────────────────────────────────────────────────

  private advance(instance: WorkflowInstance, completedStepId: string, actor: string): void {
    let joinKey: string | null = null;
    for (const [key, set] of Object.entries(instance.parallelSets)) {
      const idx = set.remaining.indexOf(completedStepId);
      if (idx < 0) continue;
      set.remaining.splice(idx, 1);
      if (set.join === "any" || set.remaining.length === 0) {
        joinKey = key;
      } else {
        const next = [...set.remaining].sort()[0];
        this.activateStep(instance, next, actor);
        return;
      }
      break;
    }
    if (joinKey) {
      const set = instance.parallelSets[joinKey];
      delete instance.parallelSets[joinKey];
      if (set.next) {
        this.activateStep(instance, set.next, actor);
      } else {
        this.completeWorkflow(instance, actor);
      }
      return;
    }

    if (instance.activeLoop && instance.activeLoop.targetStepId === completedStepId) {
      this.handleLoop(instance, actor);
      return;
    }

    const definition = this.def(instance.workflowId, instance.workflowVersion);
    const stepDef = definition.steps[completedStepId];
    if (!stepDef) throw new Error(`Step ${completedStepId} missing from definition`);

    // The completed step's own routing/next always takes precedence over the
    // enclosing sequential router's continuation — a step that routes itself
    // (e.g. conditional approval outcome) must not be overridden by stale
    // pendingSequence entries.
    if (stepDef.routing) {
      this.handleRouting(instance, stepDef, actor);
      return;
    }
    if (stepDef.next) {
      this.activateStep(instance, stepDef.next, actor);
      return;
    }
    if (stepDef.completesInstance) {
      this.completeWorkflow(instance, actor);
      return;
    }

    if (instance.pendingSequence.length > 0) {
      const next = instance.pendingSequence.shift();
      if (next) {
        this.activateStep(instance, next, actor);
        return;
      }
    }

    this.completeWorkflow(instance, actor);
  }

  private handleLoop(instance: WorkflowInstance, actor: string): void {
    const loop = instance.activeLoop;
    if (!loop) {
      this.completeWorkflow(instance, actor);
      return;
    }
    const definition = this.def(instance.workflowId, instance.workflowVersion);
    const router = definition.steps[loop.routerStepId];
    const spec = router?.routing;
    if (!spec || spec.mode !== "loop") {
      instance.activeLoop = null;
      this.completeWorkflow(instance, actor);
      return;
    }
    const iterations = instance.loopCounts[loop.targetStepId] ?? 0;
    const done = evaluateCondition(spec.until, buildConditionContext(instance));
    if (done || iterations >= loop.maxIterations) {
      instance.activeLoop = null;
      if (router?.next) {
        this.activateStep(instance, router.next, actor);
      } else {
        this.completeWorkflow(instance, actor);
      }
      return;
    }
    instance.loopCounts[loop.targetStepId] = iterations + 1;
    this.activateStep(instance, loop.targetStepId, actor);
  }

  private handleRouting(instance: WorkflowInstance, stepDef: StepDefinition, actor: string): void {
    const spec = stepDef.routing!;
    const resolution = this.registry.routing.resolve(spec, {
      instance,
      resolvers: this.registryRouterResolvers(),
    });

    if (resolution.kind === "subflow") {
      const nested = this.createInstance({
        workflowId: resolution.workflowId,
        tenantId: instance.tenantId,
        initiatorId: actor,
        entityRef: instance.entityRef,
        priority: instance.priority,
      });
      const list = this.nested.get(instance.id) ?? [];
      list.push(nested.id);
      this.nested.set(instance.id, list);
      if (stepDef.next) {
        this.activateStep(instance, stepDef.next, actor);
      } else {
        this.completeWorkflow(instance, actor);
      }
      return;
    }

    if (resolution.kind === "end") {
      this.completeWorkflow(instance, actor);
      return;
    }

    if (spec.mode === "loop") {
      const target = resolution.stepIds[0];
      instance.loopCounts[target] = (instance.loopCounts[target] ?? 0) + 1;
      instance.activeLoop = {
        routerStepId: stepDef.id,
        targetStepId: target,
        maxIterations: spec.maxIterations ?? Number.POSITIVE_INFINITY,
      };
      this.activateStep(instance, target, actor);
      return;
    }

    if (spec.mode === "parallel") {
      const targets = [...spec.targetStepIds].sort();
      this.seq += 1;
      const setKey = `join-${stepDef.id}-${this.seq}`;
      instance.parallelSets[setKey] = {
        targets,
        remaining: [...targets],
        next: stepDef.next ?? null,
        join: spec.join,
      };
      this.activateStep(instance, targets[0], actor);
      return;
    }

    if (spec.mode === "sequential") {
      instance.pendingSequence = [...spec.targetStepIds];
      const first = instance.pendingSequence.shift();
      if (first) {
        this.activateStep(instance, first, actor);
      } else {
        this.completeWorkflow(instance, actor);
      }
      return;
    }

    const target = resolution.stepIds[0];
    if (target) {
      this.activateStep(instance, target, actor);
    } else {
      this.completeWorkflow(instance, actor);
    }
  }

  private registryRouterResolvers(): Record<string, (ctx: import("./routing").RoutingContext) => string[]> {
    const result: Record<string, (ctx: import("./routing").RoutingContext) => string[]> = {};
    for (const id of this.registry.listRouterIds()) {
      const router = this.registry.getRouter(id);
      if (router) result[id] = router;
    }
    return result;
  }

  private completeWorkflow(instance: WorkflowInstance, actor: string): void {
    if (["completed", "cancelled", "closed"].includes(instance.state)) return;
    const previous = instance.state;
    instance.state = "completed";
    instance.completedAt = this.now();
    instance.currentStepId = null;
    this.record(instance, "workflow.completed", actor, previous, "completed", "Workflow completed");
    this.notifyWorkflow("completion", instance, "Workflow completed");
  }

  private recomputeState(instance: WorkflowInstance): void {
    if (["completed", "cancelled", "closed"].includes(instance.state)) return;
    const active = Object.values(instance.steps).filter((s) => !["completed", "cancelled"].includes(s.state));
    if (active.length === 0) return;
    const dominant = active.sort((a, b) => STATE_RANK[a.state] - STATE_RANK[b.state])[0];
    instance.state = dominant.state;
  }

  // ── SLA / escalation sweep ────────────────────────────────────────────────

  checkSla(instanceId: string, nowIso?: string): WorkflowInstance {
    const instance = this.requireInstance(instanceId);
    const at = nowIso ?? this.now();
    const step = instance.currentStepId ? instance.steps[instance.currentStepId] : null;
    if (!step || !step.sla) return instance;
    const before = step.sla.status;
    step.sla = refreshStepSla(step.sla, step.completedAt, at);
    if (step.sla.status !== before) {
      this.record(instance, "sla.status-changed", "system", before, step.sla.status, `SLA ${before} → ${step.sla.status}`, {
        stepId: step.stepId,
      });
    }
    if (step.sla.status === "breached") {
      const definition = this.def(instance.workflowId, instance.workflowVersion);
      const policyId = definition.steps[step.stepId].escalationPolicyId;
      if (policyId) {
        const policy = this.registry.getEscalationPolicy(policyId);
        if (policy) {
          const decision = this.registry.escalation.check(policy, {
            instance,
            step,
            slaStatus: step.sla.status,
            now: at,
          });
          if (decision.triggered) {
            try {
              this.escalate(instance.id, step.stepId, "system", `SLA breach escalation (${policy.name})`);
            } catch {
              // Already escalated at the maximum level.
            }
          }
        }
      }
    }
    return instance;
  }

  // ── Query ─────────────────────────────────────────────────────────────────

  getInstance(instanceId: string): WorkflowInstance | undefined {
    return this.instances.get(instanceId);
  }

  getNestedInstances(instanceId: string): string[] {
    return this.nested.get(instanceId) ?? [];
  }

  listInstances(tenantId?: string): WorkflowInstance[] {
    const all = [...this.instances.values()];
    return tenantId ? all.filter((i) => i.tenantId === tenantId) : all;
  }

  listSummaries(tenantId?: string): WorkflowInstanceSummary[] {
    return this.listInstances(tenantId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((i) => ({
        id: i.id,
        workflowId: i.workflowId,
        workflowName: this.def(i.workflowId, i.workflowVersion).name,
        state: i.state,
        currentStepId: i.currentStepId,
        ownerId: i.ownerId,
        priority: i.priority,
        risk: i.risk,
        recommendation: i.decision?.recommendation ?? null,
        createdAt: i.createdAt,
      }));
  }

  getWorkflowTrail(workflowId: string): AuditEntry[] {
    return this.audit.getWorkflowTrail(workflowId);
  }

  getInstanceTrail(instanceId: string): AuditEntry[] {
    return this.audit.getInstanceTrail(instanceId);
  }

  /** Evaluate a queue as a projection over current instances. */
  getQueue(queue: WorkQueue, tenantId: string): WorkQueueItem[] {
    return this.queue.query({
      tenantId,
      instances: this.listInstances(tenantId)
        .filter((i) => i.currentStepId)
        .map((i) => {
          const step = i.currentStepId ? i.steps[i.currentStepId] : null;
          const stepDef = step ? this.def(i.workflowId, i.workflowVersion).steps[step.stepId] : null;
          return {
            tenantId: i.tenantId,
            instanceId: i.id,
            workflowId: i.workflowId,
            stepId: step?.stepId ?? "",
            stepKind: (stepDef?.kind ?? "task") as StepKind,
            state: step?.state ?? i.state,
            assigneeId: step?.assigneeId ?? null,
            queueId: step?.queueId ?? null,
            role: step?.role ?? null,
            priority: i.priority,
            risk: i.risk,
            recommendation: i.decision?.recommendation ?? null,
            confidence: i.decision?.confidence ?? null,
            entityRef: i.entityRef,
            createdAt: i.createdAt,
            slaStatus: step?.sla?.status ?? null,
          };
        }),
      queue,
      slaStatusOf: (instanceId, stepId) =>
        this.instances.get(instanceId)?.steps[stepId]?.sla?.status ?? null,
      dueAtOf: (instanceId, stepId) => {
        const step = this.instances.get(instanceId)?.steps[stepId];
        if (!step?.sla) return null;
        return stepDueAt(step.sla, this.now());
      },
    });
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  private notifyStep(
    kind: "assigned" | "delegation" | "escalation",
    instance: WorkflowInstance,
    stepId: string,
    step: StepState,
    body: string,
  ): void {
    const recipient = step.assigneeId
      ? { kind: "user" as const, id: step.assigneeId }
      : step.queueId
        ? { kind: "queue" as const, id: step.queueId }
        : { kind: "role" as const, id: step.role ?? instance.ownerId ?? "system" };
    const notification = this.registry.notifierDispatcher.notify({
      kind,
      workflowId: instance.workflowId,
      instanceId: instance.id,
      stepId,
      recipient,
      title: `${WORKFLOW_STATE_LABELS[step.state]}: ${stepId}`,
      body,
      severity: kind === "escalation" ? "critical" : kind === "delegation" ? "warning" : "info",
      at: this.now(),
    });
    this.record(instance, "notification.sent", "system", step.state, step.state, `Notification ${kind}`, {
      stepId,
      metadata: { notificationId: notification.id, recipient },
    });
  }

  private notifyWorkflow(kind: "completion", instance: WorkflowInstance, body: string): void {
    const recipient = { kind: "user" as const, id: instance.ownerId ?? instance.initiatorId ?? "system" };
    const notification = this.registry.notifierDispatcher.notify({
      kind,
      workflowId: instance.workflowId,
      instanceId: instance.id,
      stepId: null,
      recipient,
      title: "Workflow completed",
      body,
      severity: "info",
      at: this.now(),
    });
    this.record(instance, "notification.sent", "system", instance.state, instance.state, "Completion notification", {
      metadata: { notificationId: notification.id, recipient },
    });
  }

  private requireInstance(instanceId: string): WorkflowInstance {
    const instance = this.instances.get(instanceId);
    if (!instance) throw new Error(`Workflow instance not found: ${instanceId}`);
    return instance;
  }

  private requireStep(instance: WorkflowInstance, stepId: string): StepState {
    const step = instance.steps[stepId];
    if (!step) throw new Error(`Step ${stepId} not active on instance ${instance.id}`);
    return step;
  }
}
