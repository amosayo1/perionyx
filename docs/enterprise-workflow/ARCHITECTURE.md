# Enterprise Workflow Engine — Architecture (Phase 23)

## 1. Purpose

The Enterprise Workflow Engine is the canonical **human-work orchestration layer** of Perionyx (Product System 11 — Workflows, consuming 06 — Decision Intelligence). It is the generic, domain-neutral "state machine with an operator" (PP-094) that any financial workflow (AP, Treasury, Procurement, Reconciliation, Audit, Compliance) is built on.

The engine consumes **Decision Intelligence outputs** (deterministic, audited, never fabricated) and drives them through an **11-state lifecycle** with explicit, legal, named transitions — assignment, delegation, escalation, SLAs, queues, routing, and approvals. It answers *"who must act, when must they act, what do they need to know, and what happens next?"*

> First principle: *AI explains the past and prepares decisions; humans make decisions.* The workflow engine turns a prepared decision into auditable, deterministic operator work.

## 2. Canonical Module

```
src/modules/enterprise-workflow/          # Phase 23 — canonical, generic
├── index.ts                              # Barrel + facade (lazy engine singleton)
├── types.ts                              # Canonical types (601 lines, single source of truth)
├── state-machine.ts                      # 11-state lifecycle + legal transition pairs
├── condition.ts                          # Generic condition DSL over workflow facts
├── sla.ts                                # Business-hours SLA accounting + pause/resume
├── assignment.ts                         # 8 assignment strategies (direct…custom)
├── delegation.ts                         # 7 delegation types with precedence
├── escalation.ts                         # Multi-level escalation policies
├── queue.ts                              # 9 work-queue kinds (projection, never a fork)
├── routing.ts                            # conditional/parallel/sequential/loop/subflow/dynamic
├── transition.ts                         # Transition validation (legality, actor, SoD, evidence)
├── ownership.ts                          # Ownership history + transfer
├── notification.ts                       # Abstract notification dispatcher
├── audit.ts                              # Append-only audit trail (BoundedRingBuffer)
├── registry.ts                           # WorkflowDefinition / policy / router / channel registry
├── workflow.ts                           # WorkflowService — the orchestrator
├── engine.ts                             # EnterpriseWorkflowEngine lazy singleton facade
├── adapters/
│   ├── decision.ts                       # DI Decision → WorkflowDecisionContext projection
│   └── index.ts
└── providers/
    ├── general-approval.ts               # Reference workflow: request → decide → notify → complete
    └── index.ts
```

The legacy Phase 7 `src/modules/workflow/` (Automation Studio step executor) and `src/modules/orchestration/` (workflow-builder/engine) are **separate, older capabilities** and are untouched by this phase — the same pattern as `decision-engine` vs `decision-intelligence`.

## 3. Canonical 11-State Lifecycle

```
created → assigned → accepted → in-progress → completed → closed
                    │   │   │         │
                    │   │   └─────────┼──────── waiting ────────┐
                    │   └─────────────┼──────── blocked ─────────┤
                    └─────────────────┼──────── escalated ───────┤
                                      └──────── delegated ───────┤
                                                                 ▼
                                                       cancelled ──┘
```

| State | Meaning |
|---|---|
| `created` | Instance or step exists, not yet worked |
| `assigned` | An operator or queue owns the step |
| `accepted` | Operator acknowledged ownership |
| `in-progress` | Active work is being performed |
| `waiting` | Paused awaiting an external condition / resume date |
| `blocked` | Cannot proceed; requires unblocking |
| `escalated` | Authority or visibility raised |
| `delegated` | Work reassigned to a delegate |
| `completed` | Work finished successfully |
| `cancelled` | Work terminated without completion |
| `closed` | Terminal; no further transitions |

Every transition must be **legal** (`LEGAL_TRANSITIONS` in `state-machine.ts`), **explicitly named**, and **audited**. The state machine is a pure function — the same `(from, to, actor, context)` always yields the same verdict.

## 4. Pipeline

```
Decision (DI) ──toWorkflowDecisionContext()──▶ WorkflowDecisionContext
                                                 │  (recommendation, confidence, risk, evidence)
registry.registerDefinition(...)                ▼
registry.registerEscalationPolicy(...)      WorkflowService.createInstance()
                                              └─▶ autoStart → activate entry step
                                                    │ assignment (strategy + delegation)
                                                    ▼
                                         operator: accept / startStep / complete / wait /
                                         block / unblock / delegate / escalate
                                                    │
                                         advance(): parallel-join · loop · sequence ·
                                                    conditional · subflow · dynamic
                                                    │
                                         completeWorkflow → close (terminal)
                                                    │
                                         append-only AuditTrail + notifications
```

The `WorkflowService` orchestrates; every sub-engine is pure and injectable (wall-clock always injected via `now()`).

## 5. Decision Intelligence Consumption

`WorkflowDecisionContext` is **duck-typed** to the DI canonical types (`RecommendationCategory`, `DecisionConfidence`, `RiskLevel` — see `src/modules/decision-engine/types.ts`). The workflow never re-derives a recommendation; it consumes one.

- **`requiresDecision`** steps cannot complete without an attached decision (`missing-evidence` rejection).
- **`cannot-decide`** recommendations block completion without a human override (`undecidable` rejection).
- **`recommendation.risk`** raises instance risk on attach (`decision.attached`).
- Conditional routing may branch on `decision.recommendation` (e.g. approve → notify-approve, else → notify-review).
- Decision/priority/risk/exception queues surface exactly the items a human must judge.

The adapter (`adapters/decision.ts`) also exposes `requiresHumanJudgment()` and `blocksAutoAdvance()` helpers so auto-complete is never applied to a decision that needs a human.

## 6. Assignment

`AssignmentEngine` + 8 strategies:

| Strategy | Behavior | Determinism |
|---|---|---|
| `direct` | specific user | — |
| `role` | alphabetically-first member of the role | sorted members |
| `queue` | unassigned queue target | — |
| `round-robin` | cycles members in order | sorted members |
| `load-balance` | least-busy member | tie → alphabetical |
| `skill` | first member with the skill | sorted members |
| `rule` | configured rule → result | keyed by ruleId |
| `custom` | registry strategy by id | strategy-defined |

Assignment results feed delegation resolution: if the assigned owner has an in-effect, scoped, active delegation, the step is assigned to the **delegate** with `delegatedFrom` + `delegationId` recorded and state set to `delegated`.

## 7. Delegation

`DelegationEngine` — 7 canonical types resolved by deterministic precedence:

```
time-bound (0) > vacation (1) > out-of-office (2) > approval (3) >
department (4) > temporary (5) > permanent (6)
```

A delegation applies only when it is **active**, **in effect** (`effectiveFrom`/`effectiveUntil`), and its **scope** (workflowId/stepKind/role/queueId/priority/risk) matches the work. Self-delegation is rejected; cancellations are audited.

## 8. SLA Engine

`SlaSpec` supports 5 metrics (`assigned · accepted · first-response · decision · completion`) with targets in **business seconds**, measured only across configured working hours, UTC offset, and holidays.

- `businessSecondsBetween` / `computeTargetAt` iterate deterministically (second-precision, timezone-correct via `utcOffsetMinutes`).
- Status is one of five deterministic values: `on-track · at-risk (≥80%) · breached (≥100%) · completed · paused`.
- **Pause/resume** (`wait()`) excludes paused time from progress; paused windows are appended, never overwritten.
- `checkSla(instanceId, now)` refreshes the active step and fires **SLA-breach escalation** when breached.

## 9. Escalation

`EscalationEngine` — configurable, multi-level policies:

- Triggers: **time** (idle since a step state anchor), **sla-breach**, **risk** (at-or-above), **priority** (at-or-above).
- Levels clamp to the last configured `EscalationStep`; actions: `notify · reassign · reassign-and-notify`.
- Targets: `manager · role · queue · user · next-level`.
- The service `escalate()` raises `instance.escalationLevel` (cap 3), resolves the policy step, reassigns to the level's target, and audits `step.escalated`.

## 10. Queues

`QueueEngine` — nine kinds: **personal · role · shared · priority · risk · decision · exception · saved · dynamic**. Queues are a **projection over all workflow instances — never a fork**. Each kind enforces its own membership rule:

| Kind | Membership |
|---|---|
| `personal` | assignee = owner |
| `role` | step role = queue role |
| `priority` | priority high/critical |
| `risk` | risk high/critical |
| `decision` | recommendation present and not `approve` |
| `exception` | blocked / escalated / SLA breached |
| `shared · saved · dynamic` | filter-defined |

Ordering is deterministic: sortBy ascending/descending, ties broken by `createdAt`. `QueueEngine.decisionQueue(tenantId)` is the canonical "what needs a human judgment" view.

## 11. Routing

`RoutingEngine` — six modes:

| Mode | Behavior |
|---|---|
| `conditional` | first matching case → target; `defaultTarget` fallback |
| `parallel` | activates all branches; join barrier (`all`/`any`) → next |
| `sequential` | ordered queue of step ids, one at a time |
| `loop` | bounded re-run of a target until `until` condition or `maxIterations` |
| `subflow` | spawns a nested workflow instance (tracked via `getNestedInstances`) |
| `dynamic` | resolver registered by id |

Parallel branch activation is **alphabetical** (deterministic). The completed step's own routing/next always takes precedence over the enclosing sequential router's continuation.

## 12. Transition Validation

`validateTransition()` is the single gate every operator transition passes:

1. **State legality** — the 11-state machine (`illegal-state`)
2. **Actor authority** — assignee / owner / initiator (`not-assignee`)
3. **Required evidence** — `requiresDecision` steps need an attached DI decision (`missing-evidence`)
4. **Decision state** — `cannot-decide` blocks completion without an override (`undecidable`)
5. **Segregation of duties** — initiator never decides an approval/decision step (`segregation-of-duties`)
6. **Permissions** — pluggable `permissionCheck` (`permission-denied`)

Rejected transitions are **still audited** (`transition.rejected`) before the throw.

## 13. Audit & Notifications

- **Audit** (`audit.ts`): append-only `AuditTrail` over `BoundedRingBuffer` (default 10,000, evicts oldest). Every event carries `tenantId`, `workflowId`, `actor`, `previousState`, `newState`, `reason`, `evidenceIds`, `decisionId`. Persistence is owned by consumers — the core is stateless.
- **Notifications** (`notification.ts`): abstract `WorkflowNotification` (kind, recipient, title, body, severity) dispatched to registered channels. A channel failure **never blocks** the workflow.

## 14. Registry-Based Extensibility (Law 3)

New domains register — the engine is never modified:

```ts
registry.registerDefinition(definition);          // versioned; duplicate rejects
registry.registerEscalationPolicy(policy);
registry.registerRouter(id, resolve);             // dynamic routing
registry.registerNotificationChannel(id, deliver);
registry.defineAssignmentRule(ruleId, result);    // rule strategy
```

The facade (`EnterpriseWorkflowEngine.getInstance()`) lazily registers the reference general-approval workflow and exposes `registry` + `service`; `EnterpriseWorkflowEngine.reset()` is a test hook.

## 15. The Reference Workflow — `workflow.general-approval`

A generic, domain-neutral workflow any module can adopt:

```
start (sequential) → approval (role approver, 8h business-hours decision SLA,
      requiresDecision, escalation policy) ──conditional──▶ notify-approve → complete
                        └─ default ─▶ notify-review → complete
```

Approve/reject/needs-review is decided by the human, informed by the attached DI result; the requester is notified; the instance completes and closes. No AP-specific assumptions.

## 16. Design Constraints Honored

- **Generic, never AP-specific** — no entity, field, or rule from the AP bounded context.
- **Deterministic** — injected `now()`, sorted member lists, alphabetical tie-breaks, no randomness.
- **Audited** — every transition and event leaves an append-only trail.
- **Server-side only** — the barrel is server-only; no client import surface.
- **No new dependencies** — reuses `BoundedRingBuffer` and `node:crypto`.
- **Humans decide** — the engine orchestrates; it never decides (PP-094, DI-R1).
