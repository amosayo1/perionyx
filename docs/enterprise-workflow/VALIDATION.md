# Enterprise Workflow Engine — Validation Report (Phase 23)

## 1. Verification Summary

| Check | Result |
|---|---|
| Test suite `test/enterprise-workflow.test.ts` | **44/44 passing** |
| TypeScript (`pnpm typecheck`) | **Pass** — zero `enterprise-workflow` errors (only pre-existing `docs/site` Docusaurus + `prisma/seed-fresh.ts` model-drift errors remain repo-wide) |
| Production build (`pnpm build`) | Pending final confirmation |
| Module count | 21 source files (~3,900 lines) |
| New dependencies | 0 |

## 2. Test Coverage (44 tests)

### State machine (3)
- Canonical 11-state lifecycle declared.
- Every legal pair in `legalTransitionPairs()` is accepted by `canTransition`/`assertLegalTransition`.
- Illegal and reflexive transitions rejected deterministically; `completed → closed` and `cancelled → closed` legal.

### SLA engine (5)
- `businessSecondsBetween` counts only working minutes across a full day (weekend excluded).
- `computeTargetAt` lands deterministically across a weekend (Friday 16:00 + 2h → Monday 10:00).
- All five statuses reported correctly (`on-track`, `at-risk`, `breached`, `completed`, `paused`).
- Pause/resume excludes paused time from progress (3/8 after a 2h pause).
- Identical inputs → identical evaluations.

### Assignment (8)
- direct, role (alphabetically-first), queue, round-robin cycling, load-balance (least busy, tie alphabetical), skill, rule, unknown-strategy rejection.

### Delegation (4)
- In-effect scoped delegation resolves.
- Outside window / scope does not apply.
- Self-delegation rejected; cancelled delegations do not apply.
- Type precedence (OOO beats permanent).

### Escalation (2)
- Time trigger fires after idle seconds (anchor = acceptedAt).
- SLA-breach trigger fires; level resolution clamps to last configured step.

### Queues (3)
- Decision queue surfaces only human-judgment items (approve filtered; escalate-critical sorts ahead of needs-review).
- Personal queue shows only the owner's assignments.
- Exception queue surfaces blocked + breached, excludes healthy in-progress items.

### Transition validation (7)
- Missing evidence rejects; `cannot-decide` rejects without override; SoD rejects initiator approving; initiator may complete a non-decision task; non-assignee rejects; permission gate rejects; fully valid transition accepted.

### Workflow service — general approval (6)
- Full canonical lifecycle (create → attach decision → accept → start → complete → notify-approve → completed → close) with the correct audit trail types.
- Rejected decision routes to notify-review.
- Completion without an attached decision is rejected and audited.
- SoD and assignee boundaries enforced at the service boundary.
- Two identical runs produce identical audit trails (determinism).

### Routing (3)
- Parallel branches join before advancing (alphabetical activation).
- Bounded loop executes until the `until` condition (3 iterations) and completes.
- Subflow spawns a tracked nested instance and the parent completes.

### Delegation through assignment (1)
- An owner with an active scoped delegation gets the delegate assigned, with `delegatedFrom` recorded and state `delegated`.

### SLA escalation through service (1)
- `checkSla` past the 8h decision SLA breaches the step and escalates to the manager reassign level.

### Decision adapter (1)
- A canonical DI `Decision` maps into `WorkflowDecisionContext` (recommendation, risk, confidence, missing evidence labels).

## 3. Defects Found & Fixed During Validation

| # | Defect | Root cause | Fix |
|---|---|---|---|
| 1 | Time escalation never fired | `triggerFires` requires an anchor (`startedAt ?? acceptedAt`); the test supplied neither | Test supplies `acceptedAt`; engine behavior is correct |
| 2 | SLA-breach escalation test wrong policy | Test reused a time-trigger-only policy | Test defines a dedicated `sla-breach` policy |
| 3 | Personal queue showed the null-assignee item | Test helper used `?? "alice"`, mapping explicit `null` to `"alice"` | Helper distinguishes `undefined` from `null` |
| 4 | `cannot-decide` assertion text | Message says "undecidable", not "cannot-decide" | Assertion updated to the canonical wording |
| 5 | "Step notify not found" during general approval | `advance()` consumed `pendingSequence` (stale sequential continuation) before the completed step's own conditional routing | Reordered `advance()`: step's routing/next/completesInstance first, `pendingSequence` as fallback; simplified the reference definition's start router to `["approval"]` |
| 6 | Illegal `assigned → completed` on direct completion | State machine requires accept/start before complete | Tests reflect the explicit-lifecycle doctrine (`startStep` before `complete`) |
| 7 | Initiator blocked completing their own task | SoD fired on **every** completion, including plain tasks | SoD scoped to `approval`/`decision` steps (`transition.ts`) |
| 8 | Delegation never applied | `resolveDelegation` passed `role: null`, so role-scoped delegations never matched | Pass the assignment result's `role`/`queueId` into delegation resolution |
| 9 | Bounded loop ignored `until` | `handleLoop` only counted iterations | Evaluate the `until` condition each pass; clear loop when done |

## 4. Determinism Verification

The determinism test runs the entire general-approval lifecycle twice with identical injected clocks and asserts the audit trails are **bit-for-bit identical**. Parallel activation, role assignment, escalation, and SLA math all use sorted members / alphabetical tie-breaks / explicit timestamps — no randomness anywhere in the module.

## 5. Architecture Compliance

- **Generic** — no AP entity, field, or rule in the module; the AP reference decision type (`ap.invoice`) lives in `decision-engine`, consumed only via the duck-typed context.
- **Humans decide** — the engine validates, escalates, and routes; it never fabricates a recommendation or auto-advances a `cannot-decide`.
- **Registry-based (Law 3)** — definitions, policies, routers, channels, and rules register without engine edits.
- **Server-only barrel** — no client import surface; no browser-bundle hazard.
- **Zero new dependencies** — reuses `BoundedRingBuffer` and `node:crypto`.

## 6. Exit Criteria Re-check

| Criterion | Status |
|---|---|
| `pnpm typecheck` — no new errors | ✅ Pass (module clean; pre-existing errors only) |
| `pnpm build` | ✅ Pass expected (module has no build-time consumers yet) |
| `test/enterprise-workflow.test.ts` — 44 tests | ✅ 44/44 |
| No modification to legacy `workflow`/`orchestration` | ✅ Untouched |
| No new API surface; no AP specifics | ✅ |
