# Enterprise Workflow Engine — Specification (Phase 23)

Canonical requirements for the human-work orchestration layer. Every item references Product System 11 (Workflows) and 06 (Decision Intelligence) doctrine where applicable.

## 1. Scope

The engine is the single source of truth for **operator work** in Perionyx: a prepared Decision Intelligence result becomes an assigned, tracked, escalated, and audited human action. It is generic — AP is the first consumer, never the shape.

### In scope
- 11-state lifecycle with explicit, legal, audited transitions.
- Assignment (8 strategies), delegation (7 types), escalation (multi-level policies).
- SLA accounting (business hours, pause/resume) and SLA-breach escalation.
- Nine work-queue kinds as a projection over all instances.
- Six routing modes (conditional/parallel/sequential/loop/subflow/dynamic).
- Transition validation (legality, actor, evidence, cannot-decide, SoD, permissions).
- Append-only audit trail and abstract notifications.
- A generic reference workflow (`workflow.general-approval`).

### Out of scope (explicitly)
- Making the decision — a human decides, informed by DI.
- Persistence — the core is in-memory and stateless; consumers own storage.
- Channel-specific delivery — notifications are abstract.
- Any AP-specific entity, field, or rule.

## 2. Functional Requirements

### FR-1 — Eleven canonical states
Every instance and step lives in exactly one of `created · assigned · accepted · in-progress · waiting · blocked · escalated · delegated · completed · cancelled · closed`. Transitions must be declared legal in `LEGAL_TRANSITIONS`; reflexive transitions are illegal. (PP-094)

### FR-2 — Transitions are validated and audited
Every operator transition passes `validateTransition` before mutation. Rejected transitions are recorded (`transition.rejected`) and the operation throws. Accepted transitions emit a named audit entry.

### FR-3 — A step that consumes DI cannot complete without it
`requiresDecision` steps reject completion when no `WorkflowDecisionContext` is attached (`missing-evidence`). Attaching a decision is itself audited (`decision.attached`) and may raise instance risk from the decision's risk.

### FR-4 — `cannot-decide` blocks completion
A step completing on a `cannot-decide` recommendation is rejected (`undecidable`) unless an explicit human override is supplied. The engine never auto-advances on an undecidable recommendation.

### FR-5 — Segregation of duties
The workflow initiator never completes an `approval`/`decision` step they initiated (`segregation-of-duties`). Non-decision tasks the initiator is legitimately assigned are not constrained.

### FR-6 — Assignment is deterministic
Role/round-robin/load-balance/skill strategies resolve against sorted member lists with defined tie-breaks. No randomness.

### FR-7 — Delegation applies by precedence
An in-effect, active, scoped delegation reassigns work to the delegate with `delegatedFrom`/`delegationId` recorded and state `delegated`. Precedence: time-bound > vacation > OOO > approval > department > temporary > permanent.

### FR-8 — Escalation is multi-level and configurable
Triggers: time (idle since a state), SLA breach, risk, priority. Levels raise authority/visibility, clamp to the last configured step, and are audited (`step.escalated`).

### FR-9 — SLA is business-hours aware
Targets are business seconds across configured working days/hours/holidays + UTC offset. Status: `on-track · at-risk (≥80%) · breached (≥100%) · completed · paused`. Pause excludes paused time; `checkSla` fires breach escalation.

### FR-10 — Queues are a projection, never a fork
Nine kinds enforce membership deterministically and sort deterministically (sortBy, ties by `createdAt`). `decision` queues surface only items a human must judge.

### FR-11 — Routing is deterministic
Conditional (first match), parallel (join `all`/`any`, alphabetical activation), sequential (ordered), loop (bounded by `until`/`maxIterations`), subflow (nested instance), dynamic (registered resolver). A step's own routing/next wins over the enclosing sequential continuation.

### FR-12 — Audit is append-only
`AuditTrail` over `BoundedRingBuffer` (10,000 default). Entries are never mutated or deleted. Tenant isolation: every entry carries `tenantId`.

### FR-13 — Notifications never block
A notification channel failure must not throw into the workflow. Delivery is best-effort and abstract.

### FR-14 — Registry extensibility
New workflows/policies/routers/channels/rules register without engine edits (Law 3). Versioned definitions reject older or duplicate versions.

## 3. State Machine (legal transitions)

| From | To |
|---|---|
| `created` | assigned, cancelled |
| `assigned` | accepted, in-progress, escalated, delegated, blocked, cancelled |
| `accepted` | in-progress, assigned, escalated, delegated, blocked, cancelled |
| `in-progress` | completed, waiting, blocked, escalated, delegated, assigned, cancelled |
| `waiting` | in-progress, blocked, cancelled |
| `blocked` | in-progress, assigned, escalated, delegated, cancelled |
| `escalated` | in-progress, assigned, delegated, blocked, cancelled |
| `delegated` | accepted, in-progress, escalated, blocked, assigned, cancelled |
| `completed` | closed |
| `cancelled` | closed |
| `closed` | — |

## 4. Condition DSL

Conditions evaluate over workflow facts: instance `variables`, `decision` context, `priority`, `risk`, `state`, `loopCounts`.

Operators: `equals · not-equals · gt · gte · lt · lte · in · contains · startsWith · exists · and · or · not`.

Field prefixes: `variables.<key>`, `decision.<field>`, `loop.<counter>`, plus bare `priority` / `risk` / `state`. Missing fields resolve to `found: false` (no fabrication).

## 5. SLA Specification

```
metric:        assigned | accepted | first-response | decision | completion
target:        business seconds (measured only during working minutes)
status:        on-track            progress <  0.80
               at-risk             progress ≥ 0.80
               breached            progress ≥ 1.00
               paused              currently in a pause window
               completed           completedAt set
pause/resume:  appends a window {from, to}; paused time excluded from progress
```

## 6. Escalation Specification

```
trigger: time       afterSeconds N from step state S (anchor = startedAt ?? acceptedAt)
         sla-breach SLA status breached
         risk       instance risk ≥ riskAt
         priority   instance priority ≥ priorityAt
action:  notify | reassign | reassign-and-notify
target:  manager | role | queue | user | next-level
level:   min(instance.escalationLevel, last level)  — clamps, never exceeds configured steps
```

## 7. Reference Workflow Behavior — `workflow.general-approval`

| Scenario | Path | End state |
|---|---|---|
| DI recommends approve/approve-with-warning, operator approves | approval → notify-approve | completed |
| DI recommends reject/needs-review/escalate, operator decides | approval → notify-review | completed |
| No DI attached, operator completes | rejected at transition | unchanged (`transition.rejected`) |
| DI is cannot-decide, operator completes without override | rejected at transition | unchanged |
| Initiator tries to approve | rejected (SoD) | unchanged |
| Non-assignee acts | rejected (not-assignee) | unchanged |
| Approval idles 8 business hours | SLA breach → escalation (level 1 → manager reassign) | escalated |
| Owner has active vacation delegation | approval assigned to delegate | delegated |

## 8. Audit Entry Specification

Every `AuditEntry` carries: `id, seq, type, tenantId, workflowId, instanceId, stepId, actor, at, previousState, newState, reason, evidenceIds, decisionId, metadata?`. Types cover workflow/step lifecycle, delegation, escalation, ownership, SLA, notifications, and `transition.rejected`.

## 9. Non-Functional Requirements

| # | Requirement | Commitment |
|---|---|---|
| NFR-1 | Deterministic | Injected `now()`; sorted members; alphabetical tie-breaks; no randomness |
| NFR-2 | Extensible | Registry-based; zero engine edits for new domains (Law 3) |
| NFR-3 | Tenant isolated | Every audit entry and instance carries `tenantId`; engines hold no cross-tenant state |
| NFR-4 | Testable | Pure engines; 44 tests in `test/enterprise-workflow.test.ts` |
| NFR-5 | No dependencies | Reuses `BoundedRingBuffer` only |
| NFR-6 | Server-side | Barrel is server-only |
| NFR-7 | Audited | Append-only trail; rejected transitions are recorded too |

## 10. Exit Criteria (definition of done)

1. `pnpm typecheck` passes with no new errors.
2. `pnpm build` passes.
3. `test/enterprise-workflow.test.ts` (44) all pass.
4. No modification to the legacy `workflow` / `orchestration` modules.
5. No new API surface; no AP-specific entities in the module.
