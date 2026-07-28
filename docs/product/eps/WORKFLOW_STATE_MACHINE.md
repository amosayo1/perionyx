---
title: "Workflow State Machines — AP Reference Workflow v1.0"
created: 2026-07-28
updated: 2026-07-28
version: 1.0
phase: 27.1
tags:
  - type/reference
  - domain/product
  - domain/ap
  - status/draft
owner: Product Architecture Board
authority: Phase 27.1
---

# Workflow State Machines — AP Reference Workflow v1.0

> **Classification**: Internal — Engineering & Product
> **Phase**: 27.1 — EPS Companion Documents
> **Design Language**: EDL v1.1
> **Status**: Draft for engineering review
> **Supersedes**: AP_STATE_MACHINES.md (Phase 21A.0, for state machine scope only)

---

## 1. State Machine Design Principles

Every state machine in the AP Reference Workflow is governed by these principles:

| # | Principle | Definition | Rationale | Violation Example |
|---|-----------|------------|-----------|-------------------|
| 1 | **Deterministic Transitions** | Given a current state and a trigger, the next state is always uniquely determined. No branching logic outside the transition table. | A state machine that behaves differently based on implicit context is untestable and unreliable. | The same "approve" click sometimes sends to APPROVED, sometimes to ESCALATED, depending on a hidden flag. |
| 2 | **Validation Before Transition** | Every transition executes guard conditions **before** changing state. If guards fail, the transition does not occur and an explicit error is returned. | Financial integrity requires preventing invalid transitions, not just detecting them after the fact. | An invoice moving to PAID without approval chain completion. |
| 3 | **Immutable History** | Once a state transition is recorded, it cannot be changed, deleted, or reordered. Only new transitions can be appended. | Audit trail integrity requires append-only history. Platform Constitution Law 4. | Editing an audit record to change a past approval decision. |
| 4 | **No Silent State Changes** | Every state transition produces a visible, logged event. Background processes (cron, system) that change state must produce audit events with `actorType: 'system'`. | Users and auditors must be able to explain every state change. | A midnight cron job that archives old invoices without notice. |
| 5 | **Every Transition Audited** | All state transitions produce an `APAuditRecord` with SHA-256 checksum linking to the previous record. | Platform Constitution Law 4 + 6. Requirement M-08 (100% audit completeness). | A state transition that completes but the audit write fails silently. |
| 6 | **Idempotent Transitions** | Applying the same trigger twice in the same state produces the same result (a no-op). No double-approval, no double-payment. | Idempotency prevents payment doubling due to network retries, UI double-clicks, or replay attacks. | Clicking "Approve" twice creates two approval records. |
| 7 | **Tenant-Isolated** | Every state machine instance is scoped to exactly one tenant (`companyId`). Cross-tenant state influence is impossible. | Platform Constitution Law 11: "Tenant isolation is absolute." | An invoice in Tenant A being visible in Tenant B's workflow. |
| 8 | **Concurrency-Safe** | Optimistic locking (`version` field) prevents two actors from simultaneously transitioning the same entity. | Race conditions between an approver and a system auto-approval could cause conflicting state. | Manager approves while system auto-rejects for SLA breach — both succeed. |

### Transition Format

Every transition in this document follows this structure:

| Field | Definition |
|-------|-----------|
| **ID** | Unique transition identifier (e.g., `INV-01`) |
| **From** | Starting state |
| **To** | Destination state |
| **Trigger** | The action that initiates the transition |
| **Actor** | Who can perform this transition (role or 'system') |
| **Guard** | Conditions that must be true for the transition to proceed |
| **Side Effects** | Actions that execute atomically with the transition |
| **Audit Event** | The `action` value written to `APAuditRecord` |
| **Error Handling** | What happens if guard conditions fail or side effects error |

---

## 2. Invoice State Machine

The **Invoice State Machine** is the central workflow controller. Every other state machine (Approval, Payment, Exception, Vendor) is a sub-process referenced by the invoice.

### States

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  DRAFT ──→ VALIDATED ──→ MATCHED ──→ AWAITING_APPROVAL ──→ APPROVED
│   │                      │            │                             │
│   │                      ↓            ↓                             │
│   │                  PARTIALLY_   EXCEPTION_                        │
│   │                  MATCHED      RAISED                            │
│   │                      │            │                             │
│   │                      └─────┬──────┘                             │
│   │                            ↓                                    │
│   │                       EXCEPTION_                                │
│   │                       RAISED                                    │
│   │                                                                 │
│   └─────────────────────────────────────────────────────────────────┘
│
│  APPROVED ──→ SCHEDULED_FOR_PAYMENT ──→ PAID ──→ RECONCILED ──→ ARCHIVED
│                                                    │
│                                                    ↓
│                                               (partial recon)
│                                                    │
│                                                    ↓
│                                               REJECTED ──→ ARCHIVED
│
└─────────────────────────────────────────────────────────────────────┘
```

| # | State | Definition | Entry Conditions | Exit Conditions | SLA |
|---|-------|------------|------------------|-----------------|-----|
| S-INV-01 | **DRAFT** | Invoice captured but not yet validated. Temporary state — immediately promoted. | OCR/extraction complete. Required fields present (BR-001 through BR-004). | All validation checks pass. | 1 minute max |
| S-INV-02 | **VALIDATED** | All evidence assembled: PO linked, GRN found, contract terms extracted, vendor status verified. | Evidence package complete. No blocking exceptions (vendor inactive, contract expired). | Three-way match initiated. | 5 minutes max |
| S-INV-03 | **MATCHED** | Three-way match passed within tolerance. Invoice qty ± tolerance AND price ± tolerance AND total ± tolerance. | Match variance within configured thresholds. | Entered into approval routing. | — |
| S-INV-04 | **PARTIALLY_MATCHED** | Three-way match passed with partial receipt (qty received < qty ordered). Remaining quantity expected. | Partial GRN exists. Remaining quantity expected within delivery window. | Remaining GRN received (auto-transition). Approval override. | Delivery window (configurable) |
| S-INV-05 | **EXCEPTION_RAISED** | Match failure or validation failure. Invoice sent to exception queue for manual resolution. | Any guard condition fails (price, qty, PO, GRN, tax, policy, vendor). | Exception resolved (any resolution type). | SLA timer starts (configurable, default 48h) |
| S-INV-06 | **AWAITING_APPROVAL** | Invoice routed to approver(s) based on approval matrix. Multi-level chain may be active. | Match complete or exception resolved. Approval matrix evaluated. | All required approvals granted or any rejection. | SLA per approval level (configurable, default 24h per level) |
| S-INV-07 | **APPROVED** | Final approval granted. Invoice ready for payment scheduling. | All approval levels approved. SoD enforcement passed. | Scheduled for payment. | — |
| S-INV-08 | **REJECTED** | Invoice rejected at any point (match, exception, approval). Final state unless reopened. | Explicit rejection by authorised approver. Optional: auto-rejection after max SLA breaches. | Reopen (with elevated permission). | — |
| S-INV-09 | **SCHEDULED_FOR_PAYMENT** | Invoice included in a payment batch or scheduled for payment. | Payment proposal includes this invoice. Cash position verified. | Payment executed. | Scheduled date |
| S-INV-10 | **PAID** | Payment confirmed by bank or payment provider. | Payment confirmation received. | Reconciled. | — |
| S-INV-11 | **RECONCILED** | Payment matched to bank statement line. GL posting confirmed. | Bank statement line reconciled. GL journal verified. | Archived (optional, configurable). | Month-end close deadline |
| S-INV-12 | **ARCHIVED** | Final immutable state. Invoice retained for audit but no longer active in any workflow. | Time-based (configured period after reconciled). Or manual archive. | None (terminal state). | — |

### Transitions

| ID | From | To | Trigger | Actor | Guard | Side Effects | Audit Event | Error Handling |
|----|------|----|---------|-------|-------|-------------|-------------|---------------|
| INV-01 | DRAFT | VALIDATED | Evidence collection complete | System | All required fields present (BR-001-BR-007). Vendor active. PO exists (or manual override flagged). | Evidence package attached to invoice record. Workflow clock starts. | `invoice.validated` | Evidence assembly failure → EXCEPTION_RAISED. Retry 3x. |
| INV-02 | VALIDATED | MATCHED | Three-way match success | System | Qty variance ≤ tolerance. Price variance ≤ tolerance. Total variance ≤ tolerance. | Match result recorded. Tolerance breakdown logged. | `invoice.matched` | Match failure → EXCEPTION_RAISED with match evidence attached. |
| INV-03 | VALIDATED | PARTIALLY_MATCHED | Partial GRN exists | System | GRN.qtyReceived < PO.qtyOrdered. Remaining within delivery window. | Partial match recorded. Expected delivery date logged. | `invoice.partially_matched` | Remaining qty outside delivery window → EXCEPTION_RAISED. |
| INV-04 | VALIDATED | EXCEPTION_RAISED | Match failure | System | ANY guard fails (INV-02 or INV-03). | Exception record created with type, evidence, priority, SLA. | `invoice.exception_raised` | N/A (exception is the error handler). |
| INV-05 | PARTIALLY_MATCHED | MATCHED | Remaining GRN received | System | Remaining quantity GRN received. Match now within tolerance. | Remaining GRN linked. Full match recorded. | `invoice.matched` | No action — remains PARTIALLY_MATCHED. |
| INV-06 | PARTIALLY_MATCHED | EXCEPTION_RAISED | Delivery window expired | System | Delivery SLA breached. Full GRN not received. | Exception created with type `GRN_MISSING`. Escalation flagged. | `invoice.exception_raised` | N/A. |
| INV-07 | EXCEPTION_RAISED | MATCHED | Exception resolved: MatchOverride | AP Clerk / AP Manager | Matched override authorised. Override reason provided. | Override reason recorded. Match recalculated. | `exception.resolved.match_override` | Override not authorised → keep EXCEPTION_RAISED. |
| INV-08 | EXCEPTION_RAISED | APPROVED | Exception resolved: ApproveWithException | AP Manager / Controller | Exception does not affect payment accuracy. Reason documented. | Exception record marked resolved_approved. | `exception.resolved.approve` | Controller notification if amount > threshold. |
| INV-09 | EXCEPTION_RAISED | REJECTED | Exception resolved: RejectInvoice | AP Manager | Rejection reason provided. | Vendor notified. Credit memo process initiated if vendor invoiced. | `exception.resolved.reject` | N/A. |
| INV-10 | MATCHED | AWAITING_APPROVAL | Approval matrix evaluated | System | Approval matrix rule matched. Approver chain determined. | Approval chain created. First approver notified. SLA timer starts. | `invoice.awaiting_approval` | No approver found → EXCEPTION_RAISED (type: NO_APPROVER). |
| INV-11 | PARTIALLY_MATCHED | AWAITING_APPROVAL | Approval matrix evaluated | System | Same as INV-10. Partial match approval rules apply. | Same as INV-10. | `invoice.awaiting_approval` | Same as INV-10. |
| INV-12 | AWAITING_APPROVAL | APPROVED | All approvals granted | System | All required approvals granted. SoD enforced. No rejections in chain. | Final approval timestamp set. Next workflow step triggered. | `invoice.approved` | Any rejection → REJECTED. Any escalation → kept AWAITING with escalated flag. |
| INV-13 | AWAITING_APPROVAL | REJECTED | Any approver rejects | Approver | Rejection reason provided (min 10 chars, business-justified). | Vendor notification queued. Approval chain terminated. | `invoice.rejected` | N/A. |
| INV-14 | AWAITING_APPROVAL | EXCEPTION_RAISED | Approval SLA breached | System | Max escalation level reached without decision. | Exception created type APPROVAL_STALLED. Escalated to next level. | `invoice.exception_raised_approval` | Escalation chain exhausted → auto-escalated to CFO. |
| INV-15 | APPROVED | SCHEDULED_FOR_PAYMENT | Payment batch includes invoice | System (batch) or Treasury Manager | Cash position sufficient. Payment terms verified. Payment method valid. | Payment schedule record created. Discount capture calculated. | `invoice.scheduled_for_payment` | Cash insufficient → EXCEPTION_RAISED (CASH_INSUFFICIENT). |
| INV-16 | APPROVED | REJECTED | Pre-payment review rejection | Controller / CFO | Explicit reason provided. Elevated permission (Controller/CFO only). | Vendor notified. Review reason recorded. | `invoice.pre_payment_rejected` | N/A. |
| INV-17 | SCHEDULED_FOR_PAYMENT | PAID | Payment confirmed | System | Bank confirmation received (or manual confirmation by Treasury). | Payment confirmation details recorded. Vendor notification sent. | `invoice.paid` | Payment failed → EXCEPTION_RAISED (PAYMENT_FAILED). Retry 3x before raising. |
| INV-18 | SCHEDULED_FOR_PAYMENT | APPROVED | Payment cancelled | Treasury Manager | Cancel reason provided. Invoice returned to payment queue. | Payment schedule record cancelled. | `invoice.payment_cancelled` | N/A. |
| INV-19 | PAID | RECONCILED | Bank statement match | System (auto) or AP Accountant (manual) | Bank statement line matched. GL posting confirmed. Amounts match. | Reconciliation record created. GL journal verified. | `invoice.reconciled` | Bank statement mismatch → EXCEPTION_RAISED (RECONCILIATION_FAILED). |
| INV-20 | PAID | ARCHIVED | Time-based archive | System | Archive period elapsed (configurable, default 90 days post-payment). | Archived flag set. Data retained but removed from active queries. | `invoice.archived` | N/A. |
| INV-21 | RECONCILED | ARCHIVED | Time-based archive | System | Same as INV-20. | Same as INV-20. | `invoice.archived` | N/A. |
| INV-22 | REJECTED | ARCHIVED | Time-based archive | System | Archive period elapsed from rejection date. | Same as INV-20. | `invoice.archived` | N/A. |
| INV-23 | REJECTED | AWAITING_APPROVAL | Reopen | Controller / CFO | Elevated permission. Reopen reason provided. Invoice data still valid. | New approval chain created. Previous rejection recorded. | `invoice.reopened` | Invoice data invalid → new DRAFT required. |

### Special Rules

| Rule | Condition | Action |
|------|-----------|--------|
| Auto-approval (low value) | Amount < $500 AND vendor trusted (no disputes in 12 months) AND match passed 100% | System transitions AWAITING_APPROVAL → APPROVED after 24h without human action |
| Stop payment (after PAID) | Payment confirmed but error detected | Creates separate `StopPaymentRequest`, does not change invoice state. PAID remains. |
| Credit memo offset | Credit memo received for paid invoice | Creates `ProcurementCreditNote` linked to invoice. Invoice remains PAID/RECONCILED. |

---

## 3. Approval State Machine

The **Approval State Machine** governs each individual approval level within the multi-level approval chain. An invoice in `AWAITING_APPROVAL` has one or more active approval instances.

### States

```
PENDING ──→ AWAITING_EVIDENCE ──→ APPROVED
  │                                  │
  │                                  │
  └─────────────────→ REJECTED       │
                                     │
                     ESCALATED ──────┘
                     DELEGATED
                     EXPIRED
```

| # | State | Definition | SLA |
|---|-------|------------|-----|
| S-APR-01 | **PENDING** | Approver notified. Waiting for decision. | Configurable (default 24h) |
| S-APR-02 | **AWAITING_EVIDENCE** | Approver requested more information. Evidence being collected. | 48h pause on SLA |
| S-APR-03 | **APPROVED** | This level approved. Moving to next level or final. | — |
| S-APR-04 | **REJECTED** | This level rejected. Entire invoice rejected. | — |
| S-APR-05 | **ESCALATED** | SLA breached. Escalated to next-level approver. | 12h for response |
| S-APR-06 | **DELEGATED** | Assigned to delegate by primary approver. | Resets SLA timer |
| S-APR-07 | **EXPIRED** | Max escalation level reached without decision. Auto-escalated to CFO. | — |

### Transitions

| ID | From | To | Trigger | Actor | Guard | Side Effects | Audit Event | Error Handling |
|----|------|----|---------|-------|-------|-------------|-------------|---------------|
| APR-01 | PENDING | AWAITING_EVIDENCE | Approver requests information | Approver | Request reason provided. Evidence type specified. | Evidence request sent to AP Clerk. SLA timer paused. | `approval.evidence_requested` | Evidence not provided within 48h → auto-approve evidence request as satisfied (or escalate). |
| APR-02 | AWAITING_EVIDENCE | PENDING | Evidence provided | AP Clerk | Evidence attached. Matches requested type. | SLA timer resumes. Approver re-notified. | `approval.evidence_provided` | Evidence insufficient → return to AWAITING_EVIDENCE. |
| APR-03 | PENDING | APPROVED | Approver approves | Approver | Approver has authority for this amount (BR-012). No conflict of interest (BR-013). SoD check passed (BR-014). | Next approval level notified (or invoice moves to APPROVED). | `approval.granted` | Authority check fails → error returned to approver. |
| APR-04 | PENDING | REJECTED | Approver rejects | Approver | Rejection reason provided (≥10 chars, business-justified). | Invoice status set to REJECTED. All pending approvals cancelled. | `approval.rejected` | Insufficient reason → force input. |
| APR-05 | PENDING | ESCALATED | SLA breached | System | Escalation threshold exceeded. Next-level approver exists. | Next-level approver notified. Original approver notified of escalation. | `approval.escalated` | No next-level approver → EXPIRED. |
| APR-06 | PENDING | DELEGATED | Primary approver delegates | Approver or AP Manager | Delegate has same or higher authority level. Delegate accepts (implicit or explicit). | Delegate notified. Original approver removed from chain. | `approval.delegated` | Delegate rejects → return to original approver. |
| APR-07 | PENDING | APPROVED | Auto-approve (low value) | System | Amount < $500. Vendor trusted. No exceptions in workflow. | System approval recorded. Identity logged as "system (auto-approve)". | `approval.auto_granted` | N/A. |
| APR-08 | PENDING | APPROVED | Counter-signature received | Counter-signing approver | Counter-signature required by policy. Second approver confirms. | Both approvers recorded. | `approval.counter_signed` | Counter-signer rejects → REJECTED. |
| APR-09 | PENDING | APPROVED | CFO override | CFO | CFO override authority confirmed. Reason documented. | CFO override flag set. All intermediate approvals bypassed. | `approval.cfo_override` | N/A (CFO is final authority). |
| APR-10 | ESCALATED | APPROVED | Escalated approver approves | Higher-level approver | Same guards as APR-03. | Original approver notified of override. | `approval.escalated_granted` | Rejection → REJECTED. |
| APR-11 | ESCALATED | EXPIRED | Max escalation reached | System | No higher approver exists. Escalation chain exhausted. | CFO auto-assigned. CFO dashboard alert created. | `approval.expired` | N/A. |
| APR-12 | EXPIRED | APPROVED | CFO resolves expired approval | CFO | CFO review completed. | CFO recorded as final approver. | `approval.expired_resolved` | CFO rejects → REJECTED. |

### Multi-Level Chain Rules

| Chain Type | Behaviour | Use Case |
|------------|-----------|----------|
| **Sequential** | Level 2 cannot approve until Level 1 approves | Standard approval path |
| **Parallel** | All approvers at same level can approve independently | Department-level approvals |
| **Counter-Signature** | Two approvers must both approve | High-value or sensitive payments |
| **Escalation** | SLA breach promotes to next authority level | Preventing approval bottlenecks |
| **Delegation** | Approver reassigns to peer | Absence management |

### Threshold Mapping (from Approval Matrix)

| Amount Range | Approval Chain | Counter-Signature | Escalation Path |
|-------------|----------------|-------------------|-----------------|
| $0 – $10,000 | AP Manager | No | Financial Controller |
| $10,000.01 – $50,000 | AP Manager → Financial Controller | No | CFO |
| $50,000.01 – $250,000 | AP Manager → Financial Controller → CFO | Yes (Controller + CFO) | CFO + Board Audit Committee |
| $250,000.01+ | AP Manager → Financial Controller → CFO → Board | Yes (Controller + CFO + Board) | Board Chair |

---

## 4. Payment State Machine

The **Payment State Machine** governs the lifecycle of an individual payment from proposal through confirmation. Payments can be single (one invoice) or batched (multiple invoices in one payment run).

### States

```
PENDING ──→ PROPOSED ──→ TREASURY_REVIEW ──→ APPROVED ──→ BATCHED ──→ EXECUTED ──→ CONFIRMED
                              │                              │
                              ↓                              ↓
                          CANCELLED                       CANCELLED
```

| # | State | Definition | Actor |
|---|-------|------------|-------|
| S-PMT-01 | **PENDING** | Payment identified but not yet included in a proposal. | System |
| S-PMT-02 | **PROPOSED** | Included in a payment proposal. Ready for Treasury review. | AP Manager / System (proposal generation) |
| S-PMT-03 | **TREASURY_REVIEW** | Treasury Manager reviewing proposal for cash position. | Treasury Manager |
| S-PMT-04 | **APPROVED** | Treasury approved. Ready for execution. | Treasury Manager |
| S-PMT-05 | **BATCHED** | Included in payment batch. Bank file generated. | System |
| S-PMT-06 | **EXECUTED** | Payment sent to bank. Awaiting confirmation. | System (integration) |
| S-PMT-07 | **CONFIRMED** | Bank confirmed payment settlement. | System (bank webhook/reconciliation) |
| S-PMT-08 | **CANCELLED** | Payment cancelled before execution. Reason recorded. | AP Manager / Treasury Manager |

### Transitions

| ID | From | To | Trigger | Actor | Guard | Side Effects | Audit Event | Error Handling |
|----|------|----|---------|-------|-------|-------------|-------------|---------------|
| PMT-01 | PENDING | PROPOSED | Payment proposal generation | System (batch) | Invoice is APPROVED. Payment method valid. Vendor banking details confirmed. | Proposal record created. Invoice status → SCHEDULED_FOR_PAYMENT. | `payment.proposed` | Invalid payment method → exception. Missing banking details → flag for vendor update. |
| PMT-02 | PROPOSED | TREASURY_REVIEW | Proposal submitted for review | AP Manager | Proposal complete. Dual-signature flag checked. | Treasury Manager notified. SLA timer starts (default 4h). | `payment.submitted_for_review` | All invoices in proposal must be in PROPOSED state. |
| PMT-03 | TREASURY_REVIEW | APPROVED | Treasury approves | Treasury Manager | Cash position sufficient (real-time balance check). Payment within cash forecast. | Payment scheduled for next available payment run. | `payment.treasury_approved` | Insufficient cash → hold for funding or partial batch. |
| PMT-04 | TREASURY_REVIEW | CANCELLED | Treasury rejects | Treasury Manager | Rejection reason provided. | Proposal rejected. All invoices return to APPROVED status. | `payment.cancelled_treasury` | N/A. |
| PMT-05 | TREASURY_REVIEW | APPROVED | Dual-signature received | Treasury Manager (second) | Dual-signature required (amount > $50K or flagged). Two separate Treasury Manager approvals. | Both approvers recorded. | `payment.dual_approved` | Second signer rejects → CANCELLED. |
| PMT-06 | APPROVED | BATCHED | Batch execution | System | Payment run started. Batch file generated. | Payment file generated (ACH/SEPA/wire format). Bank upload prepared. | `payment.batched` | File generation failure → EXCEPTION_RAISED. Retry 3x. |
| PMT-07 | BATCHED | EXECUTED | Payment submitted to bank | System (integration) | Bank API accepted payment instruction. Transaction reference received. | Transaction reference recorded. Expected settlement date logged. | `payment.executed` | Bank rejection → EXCEPTION_RAISED with bank error details. |
| PMT-08 | EXECUTED | CONFIRMED | Bank confirmation received | System (webhook/recon) | Bank settlement confirmed. Amount matches executed amount. | Settlement details recorded. Invoice status → PAID. | `payment.confirmed` | Amount mismatch → exception. No confirmation within SLA → manual investigation. |
| PMT-09 | EXECUTED | CANCELLED | Stop payment | Controller / CFO | Payment not yet settled. Stop payment reason provided. Elevated permission required (Controller+ above threshold). | Stop payment request submitted to bank. Invoice returned to APPROVED. | `payment.stopped` | Bank rejects stop payment → manual escalation. |
| PMT-10 | APPROVED | CANCELLED | Proposal modified | AP Manager / Treasury Manager | Invoice removed from proposal before batch execution. | Invoice returned to APPROVED. Proposal recalculated. | `payment.cancelled_pre_batch` | N/A. |
| PMT-11 | PROPOSED | CANCELLED | Proposal withdrawn | AP Manager | Proposal not yet in Treasury Review. | All invoices returned to APPROVED. | `payment.proposal_withdrawn` | N/A. |

### Payment Rules

| Rule | Condition | Behaviour |
|------|-----------|-----------|
| Early payment discount capture | Payment terms include discount (e.g., 2/10 Net 30) | Auto-schedule within discount window. Flag if cash insufficient. |
| Payment bundling | Same vendor, same payment method | Group into single payment. |
| Split payment | Invoice covers multiple cost centres | Generate one bank payment, multiple GL allocations. |
| Multi-currency payment | Invoice currency ≠ payment account currency | FX conversion step added. Conversion rate locked at proposal approval. [HYPOTHESIS: deferred to 12-month target] |
| Dual-signature payment | Amount > $50K (configurable) | Requires two Treasury Manager approvals before execution. |

---

## 5. Exception State Machine

The **Exception State Machine** governs individual exceptions raised during the invoice lifecycle. Exceptions are first-class domain entities — they have their own lifecycle, SLA, escalation path, and resolution tracking.

### States

```
OPEN ──→ INVESTIGATING ──→ RESOLVED
  │          │                │
  │          └──→ ESCALATED ──┘
  │
  └──→ AUTO_RESOLVED
  │
  └──→ CLOSED
```

| # | State | Definition | SLA |
|---|-------|------------|-----|
| S-EXC-01 | **OPEN** | Exception created. Not yet assigned. | 2h |
| S-EXC-02 | **INVESTIGATING** | AP Clerk assigned and working on resolution. | 24h |
| S-EXC-03 | **RESOLVED** | Resolution action completed. Awaiting closure confirmation. | — |
| S-EXC-04 | **ESCALATED** | Assigned to higher authority (AP Manager or Controller). | 12h |
| S-EXC-05 | **AUTO_RESOLVED** | System automatically resolved (e.g., GRN received resolving a GRN_MISSING exception). | — |
| S-EXC-06 | **CLOSED** | Exception fully closed. Resolution verified. | — |

### Transitions

| ID | From | To | Trigger | Actor | Guard | Side Effects | Audit Event | Error Handling |
|----|------|----|---------|-------|-------|-------------|-------------|---------------|
| EXC-01 | OPEN | INVESTIGATING | AP Clerk accepts | AP Clerk | Exception not assigned to another clerk. | Assignment timestamp. SLA timer starts. | `exception.assigned` | Auto-assign if nobody picks up within 2h. |
| EXC-02 | OPEN | AUTO_RESOLVED | System detects resolution condition | System | Guard condition resolves (e.g., GRN received, PO found, duplicate dismissed as false positive). | Resolution evidence attached. Invoice state transitions if applicable. | `exception.auto_resolved` | Resolution not confirmed → return to OPEN. |
| EXC-03 | INVESTIGATING | RESOLVED | AP Clerk completes resolution | AP Clerk | Resolution type selected. Resolution evidence provided (≥20 chars). Invoice route decided (match/approve/reject). | Invoice state transition executed (INV-07, INV-08, or INV-09). | `exception.resolved` | Resolution evidence insufficient → force completion. |
| EXC-04 | INVESTIGATING | ESCALATED | SLA breached OR Clerk requests escalation | System or AP Clerk | 24h investigating SLA exceeded. Or clerk explicitly escalates with reason. | Escalated to AP Manager (or Controller for policy/tax exceptions). | `exception.escalated` | No higher authority → auto-resolve by default action. |
| EXC-05 | ESCALATED | RESOLVED | Higher authority resolves | AP Manager / Controller | Resolution evidence provided. Final decision recorded. | Invoice state transition executed. | `exception.resolved_escalated` | Higher authority cannot resolve → auto-resolve as approve-with-exception after max escalation. |
| EXC-06 | RESOLVED | CLOSED | Quality check | System (auto) or AP Manager | Resolution verification checks pass. Invoice state consistent with resolution. | Exception closed timestamp. Metrics updated. | `exception.closed` | Verification fails → reopen to INVESTIGATING. |
| EXC-07 | RESOLVED | INVESTIGATING | Resolution overturned | AP Manager / Controller | New evidence invalidates resolution. Overturn reason provided. | Invoice state reverted (if applicable). | `exception.reopened` | N/A. |
| EXC-08 | OPEN | CLOSED | Auto-close (false positive) | System | Exception investigation determines it was a false positive. | Exception closed with type FALSE_POSITIVE. No invoice state change. | `exception.closed_false_positive` | N/A. |

### Exception Types and SLA

| Exception Type | Default Priority | SLA (OPEN) | SLA (INVESTIGATING) | Escalation To |
|----------------|-----------------|------------|---------------------|---------------|
| PRICE_MISMATCH | Medium | 4h | 24h | AP Manager |
| QUANTITY_MISMATCH | Medium | 4h | 24h | AP Manager |
| PO_NOT_FOUND | High | 2h | 12h | Procurement Manager |
| GRN_MISSING | High | 2h | 12h | Procurement Manager |
| TAX_VALIDATION_FAILED | High | 1h | 8h | Financial Controller |
| POLICY_VIOLATION | Critical | 30min | 4h | Financial Controller |
| VENDOR_INACTIVE | Medium | 4h | 24h | AP Manager |
| DUPLICATE_DETECTED | High | 2h | 12h | AP Manager |
| APPROVAL_STALLED | Critical | 30min | 4h | Financial Controller |
| CASH_INSUFFICIENT | Medium | 4h | 24h | Treasury Manager |
| PAYMENT_FAILED | Critical | 30min | 4h | Treasury Manager |
| RECONCILIATION_FAILED | High | 2h | 12h | Financial Controller |
| OCR_LOW_CONFIDENCE | Low | 8h | 48h | AP Manager |

---

## 6. Vendor State Machine

The **Vendor State Machine** governs the vendor lifecycle. Vendor status affects invoice processing — invoices from non-ACTIVE vendors are blocked or flagged.

### States

```
PROSPECTIVE ──→ ACTIVE ──→ ON_HOLD ──→ INACTIVE
                    │         │
                    └─────────┘
```

| # | State | Definition | Impact on Invoices |
|---|-------|------------|-------------------|
| S-VEN-01 | **PROSPECTIVE** | Vendor identified but not yet onboarded. May have submitted an invoice. | Invoices allowed but require AP Manager approval for each. |
| S-VEN-02 | **ACTIVE** | Vendor fully onboarded. Banking details verified. | Normal processing. |
| S-VEN-03 | **ON_HOLD** | Vendor temporarily blocked (dispute, risk alert, compliance hold). | Invoices not processed. Exception raised. |
| S-VEN-04 | **INACTIVE** | Vendor permanently deactivated. | Invoices not accepted. |

### Transitions

| ID | From | To | Trigger | Actor | Guard | Side Effects | Audit Event |
|----|------|----|---------|-------|-------|-------------|-------------|
| VEN-01 | PROSPECTIVE | ACTIVE | Onboarding complete | AP Manager | Banking details verified. Tax ID validated. Credit check passed (optional). | Vendor added to active vendor list. | `vendor.activated` |
| VEN-02 | ACTIVE | ON_HOLD | Compliance alert | System or Compliance | Risk score threshold breached. Compliance flag raised. Dispute filed. | All pending invoices flagged. Exception created for each open invoice. | `vendor.hold_placed` |
| VEN-03 | ON_HOLD | ACTIVE | Hold resolved | AP Manager / Compliance | Hold reason resolved. Risk score recalculated. | Blocked invoices released for processing. | `vendor.hold_removed` |
| VEN-04 | ACTIVE | INACTIVE | Deactivation | AP Manager | No outstanding payments. Deactivation reason provided. | Future invoices blocked. Pending invoices handled per policy. | `vendor.deactivated` |
| VEN-05 | ON_HOLD | INACTIVE | Permanent deactivation | AP Manager | Same as VEN-04. | Same as VEN-04. | `vendor.deactivated` |
| VEN-06 | PROSPECTIVE | INACTIVE | Rejected during onboarding | AP Manager | Rejection reason provided. No outstanding obligations. | Vendor record preserved for audit. | `vendor.rejected` |

### Auto-Transition Rules

| Rule | Condition | Action |
|------|-----------|--------|
| Risk-triggered hold | Vendor risk score > threshold (calculated daily) | Automatic ON_HOLD. Notification to AP Manager. |
| Inactivity deactivation | No invoice activity for 24 months | System suggests deactivation. AP Manager confirms. |
| Payment history flag | 3+ failed payment attempts in 6 months | Suggest ON_HOLD for banking details review. |

---

## 7. Cross-State Machine Rules

These rules govern interactions between state machines. They are the source of the "controls" that finance professionals trust.

| Rule ID | Description | Affected Machines | Enforcement Point |
|---------|-------------|-------------------|-------------------|
| X-01 | **Invoice cannot be PAID without APPROVED** | Invoice + Approval | INV-15 guard: transition to SCHEDULED_FOR_PAYMENT requires invoice state APPROVED |
| X-02 | **Exception blocks approval** | Exception + Approval | While invoice state is EXCEPTION_RAISED, cannot transition to AWAITING_APPROVAL |
| X-03 | **Vendor ON_HOLD blocks new invoices** | Vendor + Invoice | Stage 1 guard: vendor status must be ACTIVE or PROSPECTIVE |
| X-04 | **Vendor ON_HOLD freezes open invoices** | Vendor + Invoice + Exception | All open invoices for ON_HOLD vendor get exception raised. Existing approved invoices proceed. |
| X-05 | **Payment confirmation triggers invoice PAID** | Payment + Invoice | PMT-08 side effect: Payment CONFIRMED → Invoice PAID |
| X-06 | **Exception resolution decides invoice next state** | Exception + Invoice | EXC-03 side effect: resolved exception triggers INV-07/08/09 |
| X-07 | **Approval rejection cascades to cancel all pending approvals** | Approval (multi-level) | APR-04 side effect: all pending approval instances for this invoice cancelled |
| X-08 | **Payment proposal cannot include non-APPROVED invoices** | Payment + Invoice + Approval | PMT-01 guard: all invoices in proposal must be in APPROVED state |
| X-09 | **Credit memo offsets only against PAID invoices** | Credit + Invoice | Credit service guard: target invoice must be PAID |
| X-10 | **Audit record created for every transition** | All machines | Every transition implementation writes to `APAuditRecord` |
| X-11 | **Concurrent transitions on same entity blocked** | All machines | Optimistic locking: `version` field checked on every write |
| X-12 | **Delegation preserves authority chain** | Approval + Vendor | Delegated approver must have ≥ same authority level as primary |

---

## 8. Concurrency & Optimistic Locking

### Locking Strategy

Every aggregate root in the AP workflow carries a `version` field:

```typescript
interface AggregateRoot {
  id: string;
  companyId: string;
  version: number; // Starts at 1, incremented on every state transition
  // ...
}
```

| Property | Value |
|----------|-------|
| **Applies To** | All 12 aggregate roots (Invoice, Payment, Proposal, Approval, Exception, Vendor, Credit, Batch, Statement, Reconciliation, Audit, Configuration) |
| **Pattern** | Optimistic locking — no exclusive row locks |
| **Conflict Detection** | `UPDATE ... WHERE version = :expectedVersion` — if `affectedRows === 0`, conflict detected |
| **Retry Strategy** | Read current state, re-evaluate guard conditions, retry transition (max 3 retries) |

### Conflict Scenarios

| Scenario | Actors | Consequence | Resolution |
|----------|--------|-------------|------------|
| **Double approval** | Two approvers click "Approve" simultaneously | First succeeds. Second gets version conflict. | Re-read state. Second sees APPROVED. Notify second approver "already approved." |
| **Approve + Escalate** | Approver approves same moment SLA breaches | Either order: one succeeds, other gets conflict. | System retries escalate after approve completes. Escalate sees APPROVED → no-op. |
| **Approve + Reject** | One approver approves, another rejects same level | First succeeds. Second gets version conflict. | Re-read state. Inform second approver of first decision. |
| **Batch + Modify** | Payment batch starts while Treasury modifies proposal | Batch wins or loses based on timing. | Batch retries with fresh state. Modified proposal gets correct invoice list. |
| **System + Human** | System auto-resolves exception as human resolves | System or human wins based on timing. | Retry logic ensures only one resolution succeeds. |

### Deadlock Prevention

| Strategy | Implementation |
|----------|---------------|
| **Consistent lock order** | All transitions lock aggregates in ID-alphabetical order |
| **Timeout** | All transactions have 5-second timeout |
| **Retry with backoff** | 100ms, 200ms, 400ms exponential backoff between retries |
| **Max retries** | 3 attempts before failing to caller |

---

## Appendix A: State Machine Coverage Matrix

| Machine | States | Transitions | Aggregates | Lines of Invariants |
|---------|--------|-------------|------------|---------------------|
| Invoice | 12 | 23 | VendorInvoice, Match, EvidencePackage | 67 of 137 total |
| Approval | 7 | 12 | ApprovalChain, ApprovalLevel | 21 |
| Payment | 8 | 11 | Payment, PaymentBatch, PaymentSchedule | 24 |
| Exception | 6 | 8 | ExceptionRecord, Resolution | 15 |
| Vendor | 4 | 6 | Vendor, VendorStatus | 10 |
| **Total** | **37** | **60** | **12 aggregates** | **137 invariants** |

## Appendix B: Transition Count by Actor

| Actor | Transitions | Percentage |
|-------|-------------|------------|
| System (automated) | 21 | 35% |
| AP Clerk | 5 | 8% |
| AP Manager | 12 | 20% |
| Approver | 5 | 8% |
| Treasury Manager | 7 | 12% |
| Financial Controller | 5 | 8% |
| CFO | 3 | 5% |
| Procurement Manager | 2 | 3% |
| **Total** | **60** | **100%** |

## Appendix C: Evidence Traceability

| Design Decision | Evidence | Source |
|----------------|----------|--------|
| 12 invoice states (granular control) | T1 Manual Approvals Delay Payments — manual oversight requires clear state visibility | 4 sources, Working |
| Exception as separate state machine | Adeel Aslam: "manual oversight to ensure accuracy" — exceptions are the oversight point | E1, High confidence |
| Approval SLA + escalation | Mohamed Gamal: "approval bottlenecks" — SLA enforces timeliness | E5, Medium |
| Auto-approve low-value invoices | Mohamed Gamal: "automated approvals" desired | E5 |
| Payment state machine with Treasury gate | P6 (Separation of Duties) — Treasury approval prevents payment without authorisation | Validated |
| Vendor ON_HOLD blocks invoices | P10 (Vendor Lifecycle Management) | Hypothesis (customer evidence for AP vendor management is limited) |
| Optimistic locking on all aggregates | Phase 21A.1 invariant design — concurrency safety for financial transactions | Architectural decision |
| 60 transitions, 60 audit events | M-08 (Audit Trail Completeness) — 100% audit coverage | Platform Constitution Law 4 |

---

*End of Workflow State Machines — AP Reference Workflow v1.0*
