# Engineering Decision Packet — Phase 23 — Enterprise Workflow Engine

## 1. Overview

### Phase Purpose
Deliver the canonical **Enterprise Workflow Engine** — the generic, registry-based human-work orchestration layer that consumes Decision Intelligence outputs (Phase 22.5) and drives deterministic, audited operator work. Every future financial workflow (AP, Treasury, Procurement, Reconciliation, Audit, Compliance) is built on this module. It is the "state machine with an operator" (PP-094): explicit named states, legal transitions, a visible current position, and an append-only audit trail.

### First Principle
> Workflow is a state machine with an operator — AI prepares decisions; humans make them.

### Scope
- `src/modules/enterprise-workflow/` — 21 source files (~3,900 lines): canonical types, 11-state machine, condition DSL, SLA engine, assignment (8 strategies), delegation (7 types), escalation (multi-level policies), queues (9 kinds), routing (6 modes), transition validation, ownership, audit, notifications, registry, service orchestrator, facade, DI adapter, and the generic `workflow.general-approval` reference provider.
- `test/enterprise-workflow.test.ts` — 44 tests.
- 4 docs: `docs/enterprise-workflow/{ARCHITECTURE,SPEC,VALIDATION,EDP_23}.md`.
- No new API surface, no new dependencies, no UI changes, no AP-specific entities.

### Companion Documents
`ARCHITECTURE.md` · `SPEC.md` · `VALIDATION.md` · Phase 22.5 `docs/decision-engine/EDP_22_5.md` · Product System 11 (Workflows) and 06 (Decision Intelligence).

---

## 2. Key Decisions

### D-01: New canonical module `enterprise-workflow` — legacy `workflow` untouched
The Phase 7 `src/modules/workflow/` (Automation Studio step executor) and `src/modules/orchestration/` (workflow-builder/engine) are live, older capabilities. Phase 23 ships a **new** generic module instead of overwriting them.

**Rationale:** The legacy module is a domain-specific step-execution engine with its own consumers (automation-studio). Overwriting would break them. The same pattern was established for `decision-engine` vs `decision-intelligence` (D-03 of 22.5). Legacy modules remain documented migration candidates.

### D-02: Generic, never AP-specific
The module contains zero AP entities, fields, or rules. It consumes `WorkflowDecisionContext` — **duck-typed** to the DI canonical types (`RecommendationCategory`, `DecisionConfidence`, `RiskLevel` from `decision-engine/types.ts`) — so AP, Treasury, etc. can adopt it without the engine changing.

**Rationale:** AP is the first consumer, not the shape (Phase 21A domain architecture). A generic engine is the prerequisite for every workflow — this is the Phase 23 generalization of the Phase 22.x decision-workspace pattern.

### D-03: 11-state lifecycle — explicit, legal, audited
`created → assigned → accepted → in-progress → waiting/blocked/escalated/delegated → completed/cancelled → closed`. Every transition is declared legal in `LEGAL_TRANSITIONS`, validated by `validateTransition`, and audited. Rejected transitions are recorded too.

**Rationale:** PP-094 — operators must always see exactly where work is and what the legal next step is. A loose "todo/doing/done" model cannot express blocked, escalated, delegated, or waiting states that finance workflows require.

### D-04: Transition validation is the single gate
Six checks run on every operator transition: state legality, actor authority, required evidence, cannot-decide block, segregation of duties, and a pluggable permission gate.

**Rationale:** Financial integrity demands that "who may approve" and "what must be true to approve" are enforced in one deterministic place, not scattered across UI code. Rejections are audited before the throw — a rejected attempt is itself part of the record.

### D-05: SoD scoped to decision steps
The initiator-never-approves check fires only on `approval`/`decision` steps. Completing a plain `task` the initiator is legitimately assigned is not constrained.

**Rationale:** Validation found the initial version rejected a workflow initiator completing their own task (false positive). SoD is a *decision-integrity* control, not a task-ban.

### D-06: Queues are a projection, never a fork
The nine queue kinds are computed deterministically over instance snapshots (`WorkInstanceRef`), consuming DI fields (`recommendation`, `confidence`, `risk`) so operators see what needs a human judgment. No queue ever owns or mutates an instance.

**Rationale:** Forking work into queues creates the dual-write divergence problem the Phase 22.x work-queue domain work eliminated. A projection stays consistent by construction.

### D-07: SLA measured in business seconds, deterministic
Targets are business seconds across configured working days/hours/holidays + UTC offset; `computeTargetAt` and `businessSecondsBetween` iterate deterministically. Wall-clock is always injected via `now()`.

**Rationale:** A "8h decision SLA" must mean 8 working hours, not 8 calendar hours across a weekend. Deterministic iteration avoids rounding drift and is trivially testable (Friday 16:00 + 2h = Monday 10:00).

### D-08: Assignment/delegation/escalation are deterministic
Role/round-robin/load-balance/skill resolve against **sorted** member lists with defined tie-breaks; delegation applies by a fixed type precedence; escalation levels clamp to the last configured step.

**Rationale:** Finance teams must be able to predict who receives work. Random or insertion-order assignment is a trust killer and a reproducibility hazard.

### D-09: Notifications are abstract; failures never block
`WorkflowNotification` carries kind/recipient/title/body/severity; registered channels deliver best-effort. A channel failure is caught, logged, and never thrown into the workflow.

**Rationale:** A down Slack webhook must not freeze an approval. Channel specifics belong to consumers (the Notification Platform), not the workflow engine (Law 3).

### D-10: Audit is append-only over a bounded buffer
`AuditTrail` over `BoundedRingBuffer` (10,000 default). Entries are never mutated or deleted; every entry is tenant-scoped.

**Rationale:** Controllers/auditors need chronological integrity. The core stays in-memory and stateless — persistence is owned by consumers, so the engine remains replaceable and testable.

---

## 3. Alternatives Considered

| Alternative | Decision | Why rejected |
|---|---|---|
| Extend the Phase 7 `workflow` executor into the generic engine | Rejected (D-01) | Automation Studio's step executor is domain-coupled and consumed; overwriting breaks it |
| Build per-domain workflow engines (AP engine, Treasury engine…) | Rejected (D-02) | Duplicates the "4th currency service" anti-pattern; the shared engine is the whole point of Phase 23 |
| Four-state lifecycle (todo/doing/done/blocked) | Rejected (D-03) | Cannot express escalated, delegated, waiting, accepted — states finance operators rely on |
| SoD enforced on all completions | Rejected (D-05) | Blocks legitimate initiator tasks; validation surfaced the false positive |
| Queues as first-class forks that own instances | Rejected (D-06) | Divergence between queue and instance state |
| SLA in calendar seconds | Rejected (D-07) | Misrepresents weekend/holiday targets |
| Notifications awaited before advancing | Rejected (D-09) | Delivery failure would deadlock the workflow |
| Audit over an unbounded array | Rejected (D-10) | Unbounded memory growth (certification finding pattern from 26.2) |

---

## 4. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Legacy `workflow`/`orchestration` drift vs new engine | Medium | Module boundary documented; consumers unchanged; migration tracked as future work |
| DI type drift (`WorkflowDecisionContext` vs `decision-engine`) | Medium | Duck-typed contract is a structural subset; adapter (`toWorkflowDecisionContext`) is the single mapping point and is unit-tested |
| In-memory instances lost on restart | High | By design for this phase — persistence is a consumer concern (Phase 21B/27.0B wiring); the service API is storage-agnostic |
| Permission gate absent by default | Low | `permissionCheck` is optional but the reference provider relies on role assignment + SoD; wiring to IAM is a consumer step |
| Escalation loops at max level | Low | `checkSla` swallows the throw at the max escalation level and records state; bounded by cap |

---

## 5. Verification

```bash
NODE_OPTIONS="--max-old-space-size=8192" pnpm typecheck                 # 0 new errors (pre-existing docs/site + seed-fresh only)
pnpm vitest run test/enterprise-workflow.test.ts                        # 44/44 PASS
```

---

## 6. Security Checklist (AGENTS.md 10 questions)

| # | Question | Answer |
|---|---|---|
| 1 | Exposes sensitive financial data? | **No** — the engine orchestrates in-memory state; it never reads or writes persistence or emits financial values |
| 2 | New permission required? | **No** — no new API surface; consumers wire IAM `permissionCheck` at adoption |
| 3 | Cross-tenant access? | **No** — every instance and audit entry carries `tenantId`; engines hold no cross-tenant state |
| 4 | Audit logging needed? | **Yes** — the engine's own append-only `AuditTrail` records every transition, including rejections; this is the module's audit surface |
| 5 | Encryption required? | **No** — no new PII/financial data at rest |
| 6 | Reversible? | **N/A** — mutations are lifecycle transitions with legal reverse paths (e.g. `assigned`↔`accepted`, `blocked`→`in-progress`); `completed`/`cancelled`→`closed` are terminal by design |
| 7 | Privilege escalation? | **No** — assignee/owner/initiator authority and SoD enforced at the transition boundary |
| 8 | New secrets? | **No** |
| 9 | Rate limiting? | **No** — no public endpoint added; operators act through consumer routes |
| 10 | Security architecture compliance? | **Yes** — tenant isolation, deterministic audited transitions, no untrusted code executed (conditions are declarative) |

---

## 7. Sign-off

| Role | Status |
|---|---|
| Engineering (typecheck) | ✅ Pass |
| Test (44 new) | ✅ Pass |
| Security checklist | ✅ Pass |
| Product System compliance | ✅ PP-094, PP-102, DI-R1, Law 3 (registry extensibility) |
| Legacy compatibility | ✅ `workflow` / `orchestration` untouched |

*No architecture decision record introduced — this EDP documents the phase; the module conforms to the established Phase 22.x EDP conventions.*
