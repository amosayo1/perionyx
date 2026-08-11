import { describe, it, expect, beforeEach } from "vitest";
import {
  WorkflowRegistry,
  WorkflowService,
  assertLegalTransition,
  canTransition,
  legalTransitionPairs,
  LEGAL_TRANSITIONS,
  AssignmentEngine,
  DirectStrategy,
  RoleStrategy,
  QueueStrategy,
  RoundRobinStrategy,
  LoadBalanceStrategy,
  SkillStrategy,
  RuleStrategy,
  DelegationEngine,
  EscalationEngine,
  QueueEngine,
  evaluateSla,
  computeTargetAt,
  businessSecondsBetween,
  buildBusinessHours,
  initStepSla,
  pauseStepSla,
  resumeStepSla,
  stepDueAt,
  validateTransition,
  GENERAL_APPROVAL_WORKFLOW_ID,
  generalApprovalDefinition,
  registerGeneralApprovalWorkflow,
  toWorkflowDecisionContext,
} from "@/modules/enterprise-workflow";
import type {
  DecisionConfidence,
  EscalationPolicy,
  RiskLevel,
  SlaStatus,
  StepKind,
  WorkflowDecisionContext,
  WorkflowDefinition,
  WorkflowInstance,
  WorkflowPriority,
  WorkflowState,
  WorkQueue,
} from "@/modules/enterprise-workflow";
import type { Decision } from "@/modules/decision-engine";

const T0 = "2026-01-05T08:00:00.000Z"; // Monday

function makeService(overrides: {
  roleResolver?: (tenantId: string, role: string) => string[];
  permissionCheck?: (actor: string, action: string) => boolean;
  now?: () => string;
  register?: (registry: WorkflowRegistry) => void;
} = {}) {
  const registry = new WorkflowRegistry();
  registerGeneralApprovalWorkflow(registry);
  if (overrides.register) overrides.register(registry);
  const service = new WorkflowService({
    registry,
    now: overrides.now ?? (() => T0),
    roleResolver:
      overrides.roleResolver ??
      ((_t, role) =>
        role === "approver" ? ["alice", "bob", "carol"] : role === "manager" ? ["mgr"] : []),
    permissionCheck: overrides.permissionCheck,
  });
  return { registry, service };
}

function decisionContext(overrides: Partial<WorkflowDecisionContext> = {}): WorkflowDecisionContext {
  return {
    decisionId: "d-1",
    recommendation: "approve",
    recommendationLabel: "Approve",
    confidence: "high",
    risk: "low",
    requiredHumanActions: [],
    supportingEvidence: ["inv-1"],
    missingEvidence: [],
    decidedAt: T0,
    ...overrides,
  };
}

// ── State machine ────────────────────────────────────────────────────────────

describe("state machine", () => {
  it("declares the canonical 11-state lifecycle", () => {
    const states = Object.keys(LEGAL_TRANSITIONS).sort();
    expect(states).toEqual(
      [
        "accepted",
        "assigned",
        "blocked",
        "cancelled",
        "closed",
        "completed",
        "created",
        "delegated",
        "escalated",
        "in-progress",
        "waiting",
      ].sort(),
    );
  });

  it("exposes every legal pair exhaustively", () => {
    const pairs = legalTransitionPairs();
    for (const p of pairs) {
      expect(canTransition(p.from, p.to)).toBe(true);
      expect(() => assertLegalTransition(p.from, p.to)).not.toThrow();
    }
  });

  it("rejects illegal and reflexive transitions deterministically", () => {
    expect(canTransition("created", "completed")).toBe(false);
    expect(() => assertLegalTransition("created", "completed")).toThrow();
    expect(() => assertLegalTransition("in-progress", "in-progress")).toThrow();
    expect(canTransition("completed", "closed")).toBe(true);
    expect(() => assertLegalTransition("cancelled", "closed")).not.toThrow();
  });
});

// ── SLA engine ───────────────────────────────────────────────────────────────

const BUSINESS = buildBusinessHours(0, [1, 2, 3, 4, 5], "09:00", "17:00");

describe("SLA engine", () => {
  it("counts only business seconds (weekends excluded)", () => {
    const from = "2026-01-05T08:00:00.000Z"; // Monday 08:00
    const to = "2026-01-05T18:00:00.000Z"; // Monday 18:00
    // Working window is 09:00–17:00 → 8 hours = 28800s.
    expect(businessSecondsBetween(from, to, BUSINESS)).toBe(28800);
  });

  it("computes due timestamps deterministically across a weekend", () => {
    const due = computeTargetAt("2026-01-09T16:00:00.000Z", 7200, BUSINESS); // Friday 16:00 +2h
    expect(due).toBe("2026-01-12T10:00:00.000Z"); // Monday 09:00 + 2h
  });

  it("reports on-track, at-risk, breached, completed, paused", () => {
    const t = 8 * 60 * 60;
    expect(evaluateSla({ startsAt: "2026-01-05T08:00:00.000Z", metric: "decision", targetBusinessSeconds: t, businessHours: BUSINESS, pausedWindows: [], completedAt: null, nowIso: "2026-01-05T09:00:00.000Z" }).status).toBe("on-track");
    expect(evaluateSla({ startsAt: "2026-01-05T08:00:00.000Z", metric: "decision", targetBusinessSeconds: t, businessHours: BUSINESS, pausedWindows: [], completedAt: null, nowIso: "2026-01-05T15:24:00.000Z" }).status).toBe("at-risk");
    expect(evaluateSla({ startsAt: "2026-01-05T08:00:00.000Z", metric: "decision", targetBusinessSeconds: t, businessHours: BUSINESS, pausedWindows: [], completedAt: null, nowIso: "2026-01-05T17:00:00.000Z" }).status).toBe("breached");
    expect(evaluateSla({ startsAt: "2026-01-05T08:00:00.000Z", metric: "decision", targetBusinessSeconds: t, businessHours: BUSINESS, pausedWindows: [], completedAt: "2026-01-05T10:00:00.000Z", nowIso: "2026-01-05T10:00:00.000Z" }).status).toBe("completed");
    expect(evaluateSla({ startsAt: "2026-01-05T08:00:00.000Z", metric: "decision", targetBusinessSeconds: t, businessHours: BUSINESS, pausedWindows: [{ from: "2026-01-05T10:00:00.000Z", to: "" }], completedAt: null, nowIso: "2026-01-05T12:00:00.000Z" }).status).toBe("paused");
  });

  it("pause/resume excludes paused time from progress", () => {
    let sla = initStepSla({ metric: "completion", target: 8 * 60 * 60, useBusinessHours: true, businessHours: BUSINESS }, T0, T0);
    sla = pauseStepSla(sla, "2026-01-05T11:00:00.000Z");
    sla = resumeStepSla(sla, "2026-01-05T13:00:00.000Z");
    // Working time 09:00–11:00 (2h) + 13:00–14:00 (1h) = 3h; the 2h pause is excluded.
    expect(stepDueAt(sla, "2026-01-05T14:00:00.000Z")).not.toBeNull();
    const after = evaluateSla({
      startsAt: sla.startsAt,
      metric: sla.metric,
      targetBusinessSeconds: sla.targetBusinessSeconds,
      businessHours: sla.businessHours,
      pausedWindows: sla.pausedWindows,
      completedAt: null,
      nowIso: "2026-01-05T14:00:00.000Z",
    });
    expect(after.progress).toBeCloseTo(3 / 8, 5);
  });

  it("is deterministic for identical inputs", () => {
    const a = evaluateSla({ startsAt: T0, metric: "completion", targetBusinessSeconds: 7200, businessHours: BUSINESS, pausedWindows: [], completedAt: null, nowIso: "2026-01-05T10:00:00.000Z" });
    const b = evaluateSla({ startsAt: T0, metric: "completion", targetBusinessSeconds: 7200, businessHours: BUSINESS, pausedWindows: [], completedAt: null, nowIso: "2026-01-05T10:00:00.000Z" });
    expect(a).toEqual(b);
  });
});

// ── Assignment strategies ────────────────────────────────────────────────────

describe("assignment engine", () => {
  const members = (r: string) => (r === "approver" ? ["carol", "alice", "bob"] : []);
  const ctx = {
    tenantId: "t1",
    resolveRoleMembers: members,
    memberSkills: (u: string) => (u === "bob" ? ["fx"] : []),
    activeWorkload: (u: string) => (u === "alice" ? 5 : u === "bob" ? 1 : 3),
    now: () => T0,
  };

  it("direct assigns a specific user", () => {
    const engine = new AssignmentEngine();
    expect(engine.assign({ strategy: "direct", userId: "zelda" }, ctx).assigneeId).toBe("zelda");
  });

  it("role picks the alphabetically-first member deterministically", () => {
    const engine = new AssignmentEngine();
    const result = engine.assign({ strategy: "role", role: "approver" }, ctx);
    expect(result.assigneeId).toBe("alice");
    expect(result.role).toBe("approver");
  });

  it("queue returns an unassigned queue target", () => {
    const engine = new AssignmentEngine();
    const result = engine.assign({ strategy: "queue", queueId: "q.approvals" }, ctx);
    expect(result.assigneeId).toBeNull();
    expect(result.queueId).toBe("q.approvals");
  });

  it("round-robin cycles through members in order", () => {
    const engine = new AssignmentEngine();
    const a = engine.assign({ strategy: "round-robin", scope: { role: "approver" } }, ctx);
    const b = engine.assign({ strategy: "round-robin", scope: { role: "approver" } }, ctx);
    const c = engine.assign({ strategy: "round-robin", scope: { role: "approver" } }, ctx);
    const d = engine.assign({ strategy: "round-robin", scope: { role: "approver" } }, ctx);
    expect([a.assigneeId, b.assigneeId, c.assigneeId, d.assigneeId]).toEqual(["alice", "bob", "carol", "alice"]);
  });

  it("load-balance picks the least-busy member, ties alphabetically", () => {
    const engine = new AssignmentEngine();
    const result = engine.assign({ strategy: "load-balance", scope: { role: "approver" } }, ctx);
    expect(result.assigneeId).toBe("bob"); // workload 1
  });

  it("skill selects a qualified member", () => {
    const engine = new AssignmentEngine();
    const result = engine.assign({ strategy: "skill", skills: ["fx"], role: "approver" }, ctx);
    expect(result.assigneeId).toBe("bob");
  });

  it("rule returns the configured result", () => {
    const engine = new AssignmentEngine();
    const rule = engine.getStrategy("rule") as RuleStrategy;
    rule.defineRule("rule.ceo", { assigneeId: "ceo", queueId: null, role: null, strategyId: "rule" });
    const result = engine.assign({ strategy: "rule", ruleId: "rule.ceo" }, ctx);
    expect(result.assigneeId).toBe("ceo");
  });

  it("rejects unknown strategies", () => {
    const engine = new AssignmentEngine();
    expect(() => engine.assign({ strategy: "custom", strategyId: "nope" }, ctx)).toThrow();
  });
});

// ── Delegation ───────────────────────────────────────────────────────────────

describe("delegation engine", () => {
  it("resolves an in-effect scoped delegation", () => {
    const d = new DelegationEngine();
    d.createDelegation({
      tenantId: "t1",
      ownerId: "alice",
      delegateId: "bob",
      type: "vacation",
      scope: { role: "approver" },
      effectiveFrom: "2026-01-01T00:00:00.000Z",
      effectiveUntil: "2026-01-31T00:00:00.000Z",
    });
    const r = d.resolve("alice", { tenantId: "t1", workflowId: "wf", stepKind: "approval", role: "approver", queueId: null, priority: "high", risk: "low", now: "2026-01-10T00:00:00.000Z" });
    expect(r.delegateId).toBe("bob");
  });

  it("does not apply outside the effective window or scope", () => {
    const d = new DelegationEngine();
    d.createDelegation({
      tenantId: "t1",
      ownerId: "alice",
      delegateId: "bob",
      type: "temporary",
      scope: { role: "approver" },
      effectiveFrom: "2026-02-01T00:00:00.000Z",
      effectiveUntil: "2026-02-28T00:00:00.000Z",
    });
    expect(d.resolve("alice", { tenantId: "t1", workflowId: "wf", stepKind: "approval", role: "approver", queueId: null, priority: "high", risk: "low", now: "2026-01-10T00:00:00.000Z" }).delegateId).toBeNull();
    expect(d.resolve("alice", { tenantId: "t1", workflowId: "wf", stepKind: "task", role: "other", queueId: null, priority: "high", risk: "low", now: "2026-02-10T00:00:00.000Z" }).delegateId).toBeNull();
  });

  it("cancelled delegations do not apply and self-delegation is rejected", () => {
    const d = new DelegationEngine();
    expect(() =>
      d.createDelegation({ tenantId: "t1", ownerId: "alice", delegateId: "alice", type: "permanent", effectiveFrom: T0 }),
    ).toThrow();
    const rule = d.createDelegation({ tenantId: "t1", ownerId: "alice", delegateId: "bob", type: "permanent", effectiveFrom: T0 });
    d.cancelDelegation(rule.id);
    expect(d.resolve("alice", { tenantId: "t1", workflowId: "wf", role: null, queueId: null, priority: "medium", risk: "low", now: T0 }).delegateId).toBeNull();
  });

  it("prefers the most specific type by precedence", () => {
    const d = new DelegationEngine();
    d.createDelegation({ tenantId: "t1", ownerId: "alice", delegateId: "bob", type: "permanent", effectiveFrom: T0 });
    d.createDelegation({ tenantId: "t1", ownerId: "alice", delegateId: "carol", type: "out-of-office", effectiveFrom: T0, effectiveUntil: "2026-02-01T00:00:00.000Z" });
    const r = d.resolve("alice", { tenantId: "t1", workflowId: "wf", role: "approver", queueId: null, priority: "high", risk: "low", now: "2026-01-10T00:00:00.000Z" });
    expect(r.delegateId).toBe("carol"); // OOO has higher precedence than permanent
  });
});

// ── Escalation ───────────────────────────────────────────────────────────────

describe("escalation engine", () => {
  const policy: EscalationPolicy = {
    id: "esc.p",
    name: "P",
    triggers: [{ kind: "time", afterSeconds: 3600, fromStepState: "assigned" }],
    steps: [
      { level: 0, action: "notify", target: { kind: "manager" } },
      { level: 1, action: "reassign-and-notify", target: { kind: "role", value: "manager" } },
    ],
  };

  it("fires a time trigger once idle seconds elapse", () => {
    const engine = new EscalationEngine();
    const step = {
      stepId: "approval",
      state: "assigned" as const,
      startedAt: null,
      acceptedAt: T0,
      escalationLevel: 0,
    };
    const instance = { escalationLevel: 0, risk: "low" as const, priority: "medium" as const };
    const fresh = engine.check(policy, { instance: instance as never, step: step as never, slaStatus: "on-track", now: "2026-01-05T08:30:00.000Z" });
    expect(fresh.triggered).toBe(false);
    const fired = engine.check(policy, { instance: instance as never, step: step as never, slaStatus: "on-track", now: "2026-01-05T09:00:30.000Z" });
    expect(fired.triggered).toBe(true);
  });

  it("fires on SLA breach", () => {
    const engine = new EscalationEngine();
    const slaPolicy: EscalationPolicy = {
      id: "esc.sla",
      name: "SLA",
      triggers: [{ kind: "sla-breach" }],
      steps: [
        { level: 0, action: "notify", target: { kind: "manager" } },
        { level: 1, action: "reassign-and-notify", target: { kind: "role", value: "manager" } },
      ],
    };
    const instance = { escalationLevel: 0, risk: "low" as const, priority: "medium" as const };
    const step = { stepId: "approval", state: "in-progress" as const, startedAt: T0, acceptedAt: null, escalationLevel: 0 };
    const result = engine.check(slaPolicy, { instance: instance as never, step: step as never, slaStatus: "breached", now: T0 });
    expect(result.triggered).toBe(true);
    expect(engine.resolveStep(slaPolicy, 0)?.target.kind).toBe("manager");
    expect(engine.resolveStep(slaPolicy, 5)?.target.kind).toBe("role");
  });
});

// ── Queues consume Decision Intelligence ─────────────────────────────────────

describe("queue engine", () => {
  const base = (o: {
    tenantId?: string;
    workflowId?: string;
    instanceId?: string;
    stepId?: string;
    stepKind?: StepKind;
    state?: WorkflowState;
    assigneeId?: string | null;
    queueId?: string | null;
    role?: string | null;
    priority?: WorkflowPriority;
    risk?: RiskLevel;
    recommendation?: "approve" | "needs-review" | "escalate" | null;
    confidence?: DecisionConfidence | null;
    createdAt?: string;
    slaStatus?: SlaStatus | null;
  }) => ({
    tenantId: o.tenantId ?? "t1",
    instanceId: o.instanceId ?? "i-1",
    workflowId: o.workflowId ?? "wf.general-approval",
    stepId: o.stepId ?? "approval",
    stepKind: o.stepKind ?? "approval",
    state: o.state ?? "assigned",
    assigneeId: o.assigneeId === undefined ? "alice" : o.assigneeId,
    queueId: o.queueId === undefined ? null : o.queueId,
    role: o.role === undefined ? "approver" : o.role,
    priority: o.priority ?? "medium",
    risk: o.risk ?? "low",
    recommendation: o.recommendation ?? null,
    confidence: o.confidence ?? "high",
    entityRef: { type: "invoice", id: "inv-1" },
    createdAt: o.createdAt ?? T0,
    slaStatus: o.slaStatus ?? "on-track",
  });
  const ref = (overrides: Partial<Parameters<typeof base>[0]> & { recommendation?: "approve" | "needs-review" | "escalate" | null }) =>
    base({ recommendation: "needs-review", ...overrides });

  it("decision queue surfaces only items a human must judge", () => {
    const engine = new QueueEngine();
    const queue = QueueEngine.decisionQueue("t1");
    const items = engine.query({
      tenantId: "t1",
      instances: [ref({ recommendation: "needs-review" }), ref({ recommendation: "approve" }), ref({ recommendation: "escalate", priority: "critical" })],
      queue,
      slaStatusOf: () => "on-track",
      dueAtOf: () => null,
    });
    // approve is filtered out by the decision queue; escalate (critical) sorts ahead of needs-review (medium)
    expect(items.map((i) => i.recommendation)).toEqual(["escalate", "needs-review"]);
  });

  it("personal queue shows only my assignments", () => {
    const engine = new QueueEngine();
    const queue: WorkQueue = { id: "q.me", tenantId: "t1", kind: "personal", name: "Mine", ownerId: "alice", filter: {}, sortBy: "createdAt" };
    const items = engine.query({
      tenantId: "t1",
      instances: [ref({ assigneeId: "alice" }), ref({ assigneeId: "bob" }), ref({ assigneeId: null })],
      queue,
      slaStatusOf: () => "on-track",
      dueAtOf: () => null,
    });
    expect(items.map((i) => i.assigneeId)).toEqual(["alice"]);
  });

  it("exception queue surfaces blocked, escalated and breached items", () => {
    const engine = new QueueEngine();
    const queue: WorkQueue = { id: "q.ex", tenantId: "t1", kind: "exception", name: "Exceptions", filter: {} };
    const items = engine.query({
      tenantId: "t1",
      instances: [ref({ instanceId: "b1", state: "blocked" }), ref({ instanceId: "b2", state: "assigned", slaStatus: "breached" }), ref({ instanceId: "b3", state: "in-progress", slaStatus: "on-track" })],
      queue,
      slaStatusOf: (instanceId) => (instanceId === "b2" ? "breached" : "on-track"),
      dueAtOf: () => null,
    });
    // blocked + breached (in-progress/on-track is a healthy item)
    expect(items.map((i) => i.instanceId).sort()).toEqual(["b1", "b2"]);
  });
});

// ── Transition validation ────────────────────────────────────────────────────

describe("transition validation", () => {
  function instance(decision: WorkflowDecisionContext | null): WorkflowInstance {
    return {
      id: "i-1",
      tenantId: "t1",
      workflowId: "wf",
      workflowVersion: 1,
      state: "assigned",
      currentStepId: "approval",
      steps: {
        approval: {
          stepId: "approval",
          state: "in-progress",
          assigneeId: "alice",
          queueId: null,
          role: "approver",
          delegatedFrom: null,
          delegationId: null,
          escalationLevel: 0,
          result: null,
          startedAt: null,
          acceptedAt: null,
          completedAt: null,
          sla: null,
        },
      },
      parallelSets: {},
      pendingSequence: [],
      activeLoop: null,
      ownerId: "alice",
      initiatorId: "requester",
      priority: "medium",
      risk: "low",
      variables: {},
      decision,
      entityRef: null,
      loopCounts: {},
      escalationLevel: 0,
      createdAt: T0,
      startedAt: T0,
      completedAt: null,
      cancelledAt: null,
      closedAt: null,
    };
  }

  it("rejects completion without required decision evidence", () => {
    const r = validateTransition({ instance: instance(null), stepId: "approval", from: "in-progress", to: "completed", actor: "alice", requireAssignee: true, requiresDecision: true, stepKind: "approval" });
    expect(r.valid).toBe(false);
    expect(r.errors.join()).toContain("missing");
  });

  it("rejects cannot-decide recommendations without an override", () => {
    const r = validateTransition({ instance: instance(decisionContext({ recommendation: "cannot-decide" })), stepId: "approval", from: "in-progress", to: "completed", actor: "alice", requireAssignee: true, requiresDecision: true, stepKind: "approval" });
    expect(r.valid).toBe(false);
    expect(r.errors.join()).toContain("undecidable");
  });

  it("rejects the workflow initiator approving their own work (SoD)", () => {
    const r = validateTransition({ instance: instance(decisionContext()), stepId: "approval", from: "in-progress", to: "completed", actor: "requester", requireAssignee: false, stepKind: "approval" });
    expect(r.valid).toBe(false);
    expect(r.errors.join()).toContain("segregation");
  });

  it("allows an initiator to complete a non-decision task (SoD scoped)", () => {
    const r = validateTransition({ instance: instance(decisionContext()), stepId: "approval", from: "in-progress", to: "completed", actor: "requester", requireAssignee: false, stepKind: "task" });
    expect(r.valid).toBe(true);
  });

  it("rejects a non-assignee completing the step", () => {
    const r = validateTransition({ instance: instance(decisionContext()), stepId: "approval", from: "in-progress", to: "completed", actor: "mallory", requireAssignee: true, stepKind: "approval" });
    expect(r.valid).toBe(false);
    expect(r.errors.join()).toContain("not the assignee");
  });

  it("rejects when the permission gate denies", () => {
    const r = validateTransition({ instance: instance(decisionContext()), stepId: "approval", from: "in-progress", to: "completed", actor: "alice", requireAssignee: true, permissionCheck: () => false, stepKind: "approval" });
    expect(r.valid).toBe(false);
    expect(r.errors.join()).toContain("permission");
  });

  it("accepts a fully valid transition", () => {
    const r = validateTransition({ instance: instance(decisionContext()), stepId: "approval", from: "in-progress", to: "completed", actor: "alice", requireAssignee: true, requiresDecision: true, stepKind: "approval" });
    expect(r.valid).toBe(true);
  });
});

// ── End-to-end: general approval with DI ────────────────────────────────────

describe("workflow service — general approval", () => {
  beforeEach(() => {
    // fresh service per test
  });

  it("runs the canonical request→decide→notify→complete lifecycle", () => {
    const { service } = makeService();
    const instance = service.createInstance({
      workflowId: GENERAL_APPROVAL_WORKFLOW_ID,
      tenantId: "t1",
      initiatorId: "requester",
      entityRef: { type: "invoice", id: "inv-1" },
      variables: { amount: 1500 },
    });

    expect(instance.state).toBe("assigned");
    expect(instance.currentStepId).toBe("approval");
    const step = instance.steps.approval;
    expect(step.assigneeId).toBe("alice");

    service.attachDecision(instance.id, decisionContext(), "system");
    service.accept(instance.id, "approval", "alice");
    expect(instance.steps.approval.state).toBe("accepted");

    service.startStep(instance.id, "approval", "alice");
    expect(instance.steps.approval.state).toBe("in-progress");

    service.complete(instance.id, "approval", "alice", { outcome: "approved", reason: "matches PO" });
    expect(instance.state).toBe("completed");
    expect(instance.completedAt).toBe(T0);

    service.close(instance.id, "requester");
    expect(instance.state).toBe("closed");

    const trail = service.getInstanceTrail(instance.id);
    expect(trail.map((e) => e.type)).toContain("workflow.completed");
    expect(trail.map((e) => e.type)).toContain("decision.attached");
    expect(trail.map((e) => e.type)).toContain("step.assigned");
    expect(trail.every((e) => e.tenantId === "t1")).toBe(true);
  });

  it("attaches a rejected decision and routes to notify-review", () => {
    const { service } = makeService();
    const instance = service.createInstance({ workflowId: GENERAL_APPROVAL_WORKFLOW_ID, tenantId: "t1", initiatorId: "requester" });
    service.attachDecision(instance.id, decisionContext({ recommendation: "reject" }), "system");
    service.startStep(instance.id, "approval", "alice");
    service.complete(instance.id, "approval", "alice", { outcome: "rejected", reason: "no PO" });
    expect(instance.state).toBe("completed");
    expect(instance.steps["notify-review"].state).toBe("completed");
  });

  it("refuses to complete the approval step without an attached decision", () => {
    const { service } = makeService();
    const instance = service.createInstance({ workflowId: GENERAL_APPROVAL_WORKFLOW_ID, tenantId: "t1", initiatorId: "requester" });
    expect(() => service.complete(instance.id, "approval", "alice", { outcome: "approved" })).toThrow(/missing/i);
    const trail = service.getInstanceTrail(instance.id);
    expect(trail.some((e) => e.type === "transition.rejected")).toBe(true);
  });

  it("enforces segregation of duties at the service boundary", () => {
    const { service } = makeService();
    const instance = service.createInstance({ workflowId: GENERAL_APPROVAL_WORKFLOW_ID, tenantId: "t1", initiatorId: "requester" });
    service.attachDecision(instance.id, decisionContext(), "system");
    // requester is not the assignee (alice is), and is the initiator.
    expect(() => service.complete(instance.id, "approval", "requester", { outcome: "approved" })).toThrow();
  });

  it("enforces the assignee boundary at the service boundary", () => {
    const { service } = makeService();
    const instance = service.createInstance({ workflowId: GENERAL_APPROVAL_WORKFLOW_ID, tenantId: "t1", initiatorId: "requester" });
    expect(() => service.accept(instance.id, "approval", "mallory")).toThrow(/assignee/i);
  });

  it("is deterministic across two identical runs", () => {
    const run = () => {
      const { service } = makeService();
      const instance = service.createInstance({ workflowId: GENERAL_APPROVAL_WORKFLOW_ID, tenantId: "t1", initiatorId: "requester" });
      service.attachDecision(instance.id, decisionContext(), "system");
      service.accept(instance.id, "approval", "alice");
      service.startStep(instance.id, "approval", "alice");
      service.complete(instance.id, "approval", "alice", { outcome: "approved" });
      return service.getInstanceTrail(instance.id).map((e) => `${e.type}:${e.stepId ?? "-"}`);
    };
    expect(run()).toEqual(run());
  });
});

// ── Routing: parallel join, loops, subflow ──────────────────────────────────

describe("workflow routing", () => {
  it("joins parallel branches before advancing", () => {
    const def: WorkflowDefinition = {
      id: "wf.parallel",
      name: "Parallel",
      description: "",
      category: "test",
      version: 1,
      autoStart: true,
      requiresDecision: false,
      defaultPriority: "medium",
      entryStepId: "start",
      steps: {
        start: { id: "start", kind: "routing", name: "Start", routing: { mode: "parallel", targetStepIds: ["b", "a"], join: "all" }, next: "after" },
        a: { id: "a", kind: "task", name: "A", assignment: { strategy: "direct", userId: "u1" } },
        b: { id: "b", kind: "task", name: "B", assignment: { strategy: "direct", userId: "u2" } },
        after: { id: "after", kind: "gate", name: "After", completesInstance: true },
      },
    };
    const { service } = makeService({ register: (r) => r.registerDefinition(def) });
    const instance = service.createInstance({ workflowId: "wf.parallel", tenantId: "t1", initiatorId: "u1" });
    expect(instance.currentStepId).toBe("a"); // alphabetical activation

    service.startStep(instance.id, "a", "u1");
    service.complete(instance.id, "a", "u1", { outcome: "done" });
    expect(instance.currentStepId).toBe("b");

    service.startStep(instance.id, "b", "u2");
    service.complete(instance.id, "b", "u2", { outcome: "done" });
    expect(instance.state).toBe("completed");
  });

  it("bounded loop executes until the condition or maxIterations", () => {
    const def: WorkflowDefinition = {
      id: "wf.loop",
      name: "Loop",
      description: "",
      category: "test",
      version: 1,
      autoStart: true,
      requiresDecision: false,
      defaultPriority: "medium",
      entryStepId: "loop",
      steps: {
        loop: {
          id: "loop",
          kind: "routing",
          name: "Loop",
          routing: {
            mode: "loop",
            targetStepId: "work",
            until: { op: "gte", field: "loop.work", value: 3 },
            maxIterations: 5,
          },
          next: "done",
        },
        work: { id: "work", kind: "task", name: "Work", assignment: { strategy: "direct", userId: "u1" }, autoComplete: true },
        done: { id: "done", kind: "gate", name: "Done", completesInstance: true },
      },
    };
    const { service } = makeService({ register: (r) => r.registerDefinition(def) });
    const instance = service.createInstance({ workflowId: "wf.loop", tenantId: "t1", initiatorId: "u1" });
    expect(instance.loopCounts.work).toBeGreaterThanOrEqual(3);
    expect(instance.state).toBe("completed");
  });

  it("spawns a subflow and continues the parent", () => {
    const child: WorkflowDefinition = {
      id: "wf.child",
      name: "Child",
      description: "",
      category: "test",
      version: 1,
      autoStart: true,
      requiresDecision: false,
      defaultPriority: "medium",
      entryStepId: "work",
      steps: {
        work: { id: "work", kind: "task", name: "Work", assignment: { strategy: "direct", userId: "u1" }, autoComplete: true, completesInstance: true },
      },
    };
    const parent: WorkflowDefinition = {
      id: "wf.parent",
      name: "Parent",
      description: "",
      category: "test",
      version: 1,
      autoStart: true,
      requiresDecision: false,
      defaultPriority: "medium",
      entryStepId: "start",
      steps: {
        start: { id: "start", kind: "routing", name: "Start", routing: { mode: "subflow", workflowId: "wf.child" }, next: "finish" },
        finish: { id: "finish", kind: "gate", name: "Finish", completesInstance: true },
      },
    };
    const { service } = makeService({ register: (r) => { r.registerDefinition(child); r.registerDefinition(parent); } });
    const instance = service.createInstance({ workflowId: "wf.parent", tenantId: "t1", initiatorId: "u1" });
    expect(service.getNestedInstances(instance.id).length).toBe(1);
    expect(instance.state).toBe("completed");
  });
});

// ── Delegation wired through assignment ──────────────────────────────────────

describe("delegation through assignment", () => {
  it("assigns the delegate when the owner has an active delegation", () => {
    const registry = new WorkflowRegistry();
    registerGeneralApprovalWorkflow(registry);
    const service = new WorkflowService({
      registry,
      now: () => T0,
      roleResolver: (_t, role) => (role === "approver" ? ["alice"] : []),
    });
    service.delegation.createDelegation({
      tenantId: "t1",
      ownerId: "alice",
      delegateId: "bob",
      type: "vacation",
      scope: { role: "approver" },
      effectiveFrom: "2026-01-01T00:00:00.000Z",
      effectiveUntil: "2026-02-01T00:00:00.000Z",
    });
    const instance = service.createInstance({ workflowId: GENERAL_APPROVAL_WORKFLOW_ID, tenantId: "t1", initiatorId: "requester" });
    const step = instance.steps.approval;
    expect(step.assigneeId).toBe("bob");
    expect(step.delegatedFrom).toBe("alice");
    expect(step.state).toBe("delegated");
  });
});

// ── SLA breach escalation wired through service ─────────────────────────────

describe("SLA escalation through service", () => {
  it("escalates the current step on SLA breach", () => {
    const registry = new WorkflowRegistry();
    registerGeneralApprovalWorkflow(registry);
    const service = new WorkflowService({
      registry,
      now: () => T0,
      roleResolver: (_t, role) => (role === "approver" ? ["alice"] : role === "manager" ? ["mgr"] : []),
    });
    const instance = service.createInstance({ workflowId: GENERAL_APPROVAL_WORKFLOW_ID, tenantId: "t1", initiatorId: "requester" });
    // 8 business hours later (past the 8h decision SLA) on the same working day.
    service.checkSla(instance.id, "2026-01-05T17:30:00.000Z");
    expect(instance.steps.approval.state).toBe("escalated");
    expect(instance.steps.approval.escalationLevel).toBeGreaterThan(0);
  });
});

// ── Decision Intelligence adapter ───────────────────────────────────────────

describe("decision adapter", () => {
  it("maps a canonical DI Decision into the workflow contract", () => {
    const decision = {
      id: "dec-1",
      type: "invoice.approval",
      entity: { type: "invoice", id: "inv-1" },
      statusLabel: "pending",
      recommendation: "needs-review",
      recommendationLabel: "Needs review",
      confidence: "moderate",
      confidenceBasis: "rules",
      reasoningGraph: { nodes: [], edges: [] },
      triggeredRules: [],
      triggeredPolicies: [],
      supportingEvidence: ["ev-1"],
      missingEvidence: [{ id: "m-1", label: "PO match", reason: "missing", impact: "advisory", sourceSystem: "erp" }],
      riskAssessment: { level: "medium", factors: [], explanation: "" },
      requiredHumanActions: ["review"],
      alternativeOutcomes: [],
      audit: { decidedBy: "system", decidedAt: T0, method: "deterministic" },
      version: "1",
      createdAt: T0,
    } as unknown as Decision;
    const wctx = toWorkflowDecisionContext(decision);
    expect(wctx.decisionId).toBe("dec-1");
    expect(wctx.recommendation).toBe("needs-review");
    expect(wctx.risk).toBe("medium");
    expect(wctx.confidence).toBe("moderate");
    expect(wctx.missingEvidence).toEqual(["PO match"]);
  });
});
