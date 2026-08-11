# 11 — Workflows

**Product System · Document 11 of 20**
**Authority: Workflows is the process, state-machine, and orchestration specification for Perionyx. It derives from the Vision (00), Philosophy (01), Product Principles (02, especially the Workflows & Lifecycle domain), Finance Principles (04), and Procurement Principles (05), and is binding on all workflow, approval, exception, and process surfaces.**
**Sources: The four-product research program — Stripe S6 (automation and lifecycle), Linear S8 (workflows and state persistence), Ramp S11 (approval flows and routing), Coupa S9 (lifecycle dominance); the AP reference workflow (docs/product/eps/REFERENCE_WORKFLOW_AP.md); the WorkflowEngine and Automation Studio.**

---

## 1. The Workflow Doctrine

**A Perionyx workflow is a state machine with an operator** (PP-094). Every workflow is modeled as explicit states and transitions — never as ad hoc statuses — and every state transition is visible, auditable, and reversible where the domain allows (PP-094, PP-095, F-07).

The research synthesis:
- **Stripe** proves lifecycle automation: routine work automates, exceptions route to humans (Stripe S6).
- **Linear** proves state persistence: filters, views, and workflow position survive reloads (PP-030).
- **Ramp** proves approval routing: role-, threshold-, and policy-driven paths with clear status (PP-100).
- **Coupa** proves lifecycle dominance: the workflow spans requisition-to-reconciliation, and the tool owns the handoff (PR-01, PR-02).

## 2. The State Machine Contract

Every workflow surface renders state via the canonical contract (PP-094):

- **Explicit states** — modeled, named, enumerated.
- **Legal transitions** — each transition has preconditions, actor, and audit.
- **Current position** — always visible: "Pending approval · Level 2 of 3" (PP-096).
- **Next action** — the operator always sees what happens next and who is responsible (PP-097, PP-049).
- **History** — append-only, tamper-evident, chronological (F-08, PP-165).

**SKIPPED is not APPROVED** (PR-25): approval cascades treat skipped levels correctly; a skip is an audit event, never a silent pass.

## 3. The Work Queue

**Work Queues are the operator surface** (PP-097, PR-39). Every workflow's pending work aggregates into a Work Queue that answers: "What requires me?" (PP-049):

- **Requires-me triage** — items needing my action float; delegated or done items sink (PP-049).
- **Priority and SLA** — derived, labeled, and time-boxed (PP-098); SLA labels are canonical (H-01, `toWorkQueueSlaLabel`).
- **Exceptions are work, not noise** — each exception is a queue item with a resolution action (PR-35).
- **Previews teach** — "6 of 25 failed" routes to fix (PP-018).

The Work Queue is a projection over all workflows (PP-030) — never a fork.

## 4. Approval Design

**Approvals follow the approval chain** (PP-100, F-14, F-15):

- **Role / department / threshold routing** — resolved by the Approval Matrix, applied at the endpoint (PP-162).
- **Sequential and parallel modes** — parallel for independent reviewers; sequential for stacked authority.
- **Visual approval preview** — the chain renders before submission: who approves at which threshold (PP-101, PP-093).
- **Segregation of duty** — no one approves their own request; conflict is detected and routed (F-13, PR-33).
- **Dual signature** — above the mandate, two independent authorizers (F-17).
- **Never grant without authorization** — approval actions check role and status at the endpoint (PP-162, Phase 17.1).

## 5. Exceptions and Escalation

**Exceptions are a first-class state, not an error** (PP-099, PR-35):

- Each exception type has a canonical resolution path and an explainer (PP-099).
- Escalation is automatic on SLA breach; the escalator sees the trail (PP-098).
- Exceptions surface in the queue, the dashboard, and the decision surface (PP-053).

## 6. Automation with a Human Boundary

**Automation proceeds until the decision boundary** (PP-094, PP-160):

- Routine steps automate silently and auditably (data capture, matching, validation).
- Money moves and approvals are never silent (PP-160, F-18).
- The human is always at the decision surface with evidence (PP-101).
- Idempotency protects retries (F-05); the workflow never double-executes.

## 7. Workflow Rules (Condensed)

1. Workflows are explicit state machines with legal transitions (PP-094).
2. Current position and next action are always visible (PP-096, PP-097).
3. History is append-only and tamper-evident (F-08, PP-165).
4. SKIPPED is not APPROVED (PR-25).
5. Work Queues answer "what requires me?" (PP-049, PP-097).
6. Approvals route by matrix, preview before submit, enforce SoD and dual signature (PP-100, PP-101, F-13, F-17).
7. Exceptions are work with resolution paths, not noise (PP-099, PR-35).
8. Automation stops at the decision boundary; humans act with evidence (PP-160).
9. Escalation is automatic on SLA breach with full trail (PP-098).
10. The lifecycle spans end-to-end; handoffs are owned (PR-02).

## 8. Workflow Anti-Patterns

- **The status string** — workflow position as a free-text field (rejected: PP-094).
- **The silent automation** — a workflow that pays or approves without visible state (rejected: PP-160).
- **The approval-free work** — SoD and matrix checks bypassed (rejected: PP-162, F-13).
- **The disconnected stage** — a workflow stage with no queue, no dashboard, no evidence (rejected: Phase 20.0 findings).
- **The lost escalation** — SLA breach with no escalation path (rejected: PP-098).
- **The one-person workflow** — a state machine with no assigned owner (rejected: PP-049).

---

*Next: `12 AI.md` — the AI, intelligence, and evidence specification.*
