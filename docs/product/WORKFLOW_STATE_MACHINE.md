# AP Workflow State Machine Specification

> Phase 27.0A — Enterprise Product Architecture & Workflow Design
> Version: 1.0 | Date: 2026-07-28
> Authority: Product Architecture Board
> Classification: Internal — Engineering & Product

---

## 1. Purpose

State machines encode business rules as **visual, auditable transitions**. Every state change is:
- **Explicit** — defined in this document, not ad-hoc in code
- **Guarded** — precondition must be true before transition fires
- **Audited** — transition recorded with who/when/why
- **Irreversible by default** — no backwards moves without explicit reversal paths

This document is the **single source of truth** for all AP workflow state machines. Code that does not match this document is a defect.

### Design Principles

1. **No implicit state changes** — every transition must be defined here
2. **No silent failures** — illegal transitions are logged and rejected
3. **No orphaned states** — every state must be reachable and must have at least one exit
4. **Recovery paths are explicit** — void, cancel, dispute, and reversal are first-class transitions
5. **Concurrency is safe** — optimistic locking prevents lost updates

---

## 2. Invoice State Machine

### States (12)

| State | Description | Terminal? |
|-------|-------------|-----------|
| `DRAFT` | Invoice created, not yet complete | No |
| `CAPTURED` | OCR/EDI extraction complete, awaiting validation | No |
| `VALIDATED` | Fields validated, evidence linked, awaiting match | No |
| `MATCHED` | Three-way match passed, awaiting approval | No |
| `EXCEPTION` | Match failed or anomaly detected, awaiting resolution | No |
| `APPROVED` | All approval levels passed, awaiting payment | No |
| `PAYMENT_SCHEDULED` | Payment batch created, awaiting execution | No |
| `PAID` | Payment executed, awaiting bank confirmation | No |
| `RECONCILED` | Bank confirmed, GL posted, awaiting close | No |
| `CLOSED` | Fully reconciled, audit trail complete | **Yes** |
| `VOIDED` | Invoice cancelled before payment | **Yes** |
| `DISPUTED` | Vendor disputes invoice, awaiting resolution | No |

### Transitions

```
                    ┌──────────────────────────────────────────────────────────┐
                    │                                                          │
                    ▼                                                          │
              ┌──────────┐    capture()     ┌──────────┐   validate()   ┌───────────┐
              │  DRAFT   │ ──────────────→ │ CAPTURED │ ─────────────→ │ VALIDATED │
              └──────────┘                  └──────────┘                └───────────┘
                    │                             │                           │
                    │ void()                      │ void()                    │ void()
                    ▼                             ▼                           ▼
              ┌──────────┐                  ┌──────────┐                ┌───────────┐
              │ VOIDED   │                  │ VOIDED   │                │  VOIDED   │
              └──────────┘                  └──────────┘                └───────────┘
                                                                    match()│
                                                        ┌─────────────────┴────────────────┐
                                                        ▼                                  ▼
                                                  ┌──────────┐                      ┌───────────┐
                                                  │ MATCHED  │                      │ EXCEPTION │
                                                  └──────────┘                      └───────────┘
                                                        │                                  │
                                                        │ approve()                       │ resolve()
                                                        ▼                                  │
                                                  ┌──────────┐                             │
                                                  │ APPROVED │                             │
                                                  └──────────┘                             │
                                                        │                                  │
                                                        │ schedulePayment()                │
                                                        ▼                                  │
                                                  ┌─────────────────┐                      │
                                                  │PAYMENT_SCHEDULED│                      │
                                                  └─────────────────┘                      │
                                                        │                                  │
                                                        │ executePayment()                 │
                                                        ▼                                  │
                                                  ┌──────────┐                             │
                                                  │   PAID   │                             │
                                                  └──────────┘                             │
                                                        │                                  │
                                                        │ reconcile()                      │
                                                        ▼                                  │
                                                  ┌─────────────┐                          │
                                                  │ RECONCILED  │                          │
                                                  └─────────────┘                          │
                                                        │                                  │
                                                        │ close()                          │
                                                        ▼                                  │
                                                  ┌──────────┐                             │
                                                  │  CLOSED  │                             │
                                                  └──────────┘                             │
                                                        │                                  │
                                                        │ dispute()                        │
                                                        ▼                                  │
                                                  ┌───────────┐                            │
                                                  │ DISPUTED  │ ───────────────────────────┘
                                                  └───────────┘  (after resolution, back to
                                                                   MATCHED or EXCEPTION)
```

### Transition Table

| Current State | Input | Guard | Action | Next State | Event |
|--------------|-------|-------|--------|------------|-------|
| `DRAFT` | `capture()` | Invoice has required fields (vendor, amount, date) | Run OCR if needed, extract fields | `CAPTURED` | `invoice.captured` |
| `CAPTURED` | `validate()` | All required fields present and typed correctly | Link evidence (PO, GRN, contract) | `VALIDATED` | `invoice.validated` |
| `VALIDATED` | `match()` | Evidence package complete | Run three-way match | `MATCHED` or `EXCEPTION` | `match.completed` or `match.exception.raised` |
| `MATCHED` | `approve()` | All required approvals received | Record approval chain | `APPROVED` | `invoice.approved` |
| `MATCHED` | `exception()` | Match exception raised (system or manual) | Create exception record | `EXCEPTION` | `exception.created` |
| `APPROVED` | `schedulePayment()` | Payment proposal created and approved | Add to payment batch | `PAYMENT_SCHEDULED` | `payment.scheduled` |
| `PAYMENT_SCHEDULED` | `executePayment()` | Treasury Manager approved batch | Submit to banking platform | `PAID` | `payment.executed` |
| `PAID` | `reconcile()` | Bank statement line matched | Post GL entries, reconcile | `RECONCILED` | `reconciliation.matched` |
| `RECONCILED` | `close()` | GL entries posted, audit trail complete | Close audit trail, update reports | `CLOSED` | `audit.trail.closed` |
| Any | `void()` | Invoice not yet `PAID` | Mark voided, record reason | `VOIDED` | `invoice.voided` |
| `PAID` or later | `dispute()` | Vendor raises dispute | Create dispute record, freeze payment | `DISPUTED` | `invoice.disputed` |
| `EXCEPTION` | `resolve()` | Exception resolved (accepted, rejected, corrected) | Apply resolution, re-run match | `MATCHED` or `DRAFT` | `exception.resolved` |
| `DISPUTED` | `resolve()` | Dispute resolved (vendor agreement reached) | Apply resolution, re-run match | `MATCHED` or `VOIDED` | `dispute.resolved` |
| `PAYMENT_SCHEDULED` | `cancel()` | Payment not yet executed | Remove from batch | `APPROVED` | `payment.cancelled` |

### Guard Conditions — Detail

| Guard | Validation | Failure Action |
|-------|------------|----------------|
| `required fields present` | vendorId, amount (Decimal > 0), invoiceDate, invoiceNumber | Reject capture, surface validation errors |
| `all fields typed` | amount is Decimal, date is Date, vendorId is UUID | Reject validation, flag field errors |
| `evidence complete` | At least PO or contract linked | Auto-route to manual review |
| `all approvals received` | Approval chain has APPROVED at every required level | Reject approval, log missing levels |
| `payment proposal approved` | Treasury Manager has approved the batch | Reject execution, log missing approval |
| `bank statement matched` | Bank line amount matches payment within $0.01 | Raise reconciliation exception |
| `audit trail complete` | All transitions have audit records, checksum valid | Reject close, flag incomplete trail |

---

## 3. Payment State Machine

### States (7)

| State | Description | Terminal? |
|-------|-------------|-----------|
| `PROPOSED` | Payment batch created, awaiting Treasury approval | No |
| `APPROVED` | Treasury approved, awaiting execution | No |
| `PROCESSING` | Submitted to bank, awaiting confirmation | No |
| `COMPLETED` | Bank confirmed payment successful | **Yes** |
| `CONFIRMED` | Reconciled with bank statement | **Yes** |
| `FAILED` | Bank rejected or timeout | No |
| `VOIDED` | Payment cancelled before execution | **Yes** |

### State Diagram

```
                    ┌──────────────┐
                    │   PROPOSED   │
                    └──────┬───────┘
                           │
                     approve()
                           │
                           ▼
                    ┌──────────────┐
                    │   APPROVED   │
                    └──────┬───────┘
                           │
                   execute()
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐
       │PROCESSING│ │  FAILED  │ │  VOIDED  │
       └────┬─────┘ └────┬─────┘ └──────────┘
            │             │
     confirm()    retry()
            │             │
            ▼             │
     ┌────────────┐       │
     │ COMPLETED  │       │
     └─────┬──────┘       │
           │              │
     reconcile()          │
           │              │
           ▼              │
     ┌────────────┐       │
     │ CONFIRMED  │       │
     └────────────┘       │
                          ▼
                   ┌──────────┐
                   │ COMPLETED│ (after retry success)
                   └──────────┘
```

### Transition Table

| Current State | Input | Guard | Action | Next State | Event |
|--------------|-------|-------|--------|------------|-------|
| `PROPOSED` | `approve()` | Treasury Manager has authority for batch total | Record approval | `APPROVED` | `payment.approved` |
| `APPROVED` | `execute()` | Bank API available, funds sufficient | Submit to banking platform | `PROCESSING` | `payment.submitted` |
| `PROCESSING` | `confirm()` | Bank returns success confirmation | Record bank reference | `COMPLETED` | `payment.completed` |
| `PROCESSING` | `fail()` | Bank returns failure or timeout after 30s | Record failure reason, check retry count | `FAILED` | `payment.failed` |
| `FAILED` | `retry()` | Retry count < 2, failure was transient | Resubmit to bank | `PROCESSING` | `payment.retried` |
| `COMPLETED` | `reconcile()` | Bank statement line matches | Match to statement | `CONFIRMED` | `payment.confirmed` |
| Any (not `COMPLETED`/`CONFIRMED`) | `void()` | Payment not yet confirmed by bank | Cancel payment, record reason | `VOIDED` | `payment.voided` |

---

## 4. Approval State Machine

### States (7 per level)

| State | Description | Terminal? |
|-------|-------------|-----------|
| `PENDING` | Awaiting approver action | No |
| `APPROVED` | Approver authorised the invoice | **Yes** |
| `REJECTED` | Approver denied the invoice | **Yes** |
| `ESCALATED` | Forwarded to higher authority | No |
| `DELEGATED` | Forwarded to pre-registered delegate | No |
| `TIMED_OUT` | SLA breached without action | No |
| `SKIPPED` | Level not required for this invoice | **Yes** |

### State Diagram

```
                    ┌──────────────┐
                    │   PENDING    │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┬────────────────┐
          ▼                ▼                ▼                ▼
   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
   │  APPROVED  │  │  REJECTED  │  │ ESCALATED  │  │ DELEGATED  │
   └────────────┘  └────────────┘  └─────┬──────┘  └─────┬──────┘
                                         │                │
                                   re-escalate()    re-delegate()
                                         │                │
                                         ▼                ▼
                                   ┌────────────┐  ┌────────────┐
                                   │ TIMED_OUT  │  │ TIMED_OUT  │
                                   └────────────┘  └────────────┘
```

### Transition Table

| Current State | Input | Guard | Action | Next State | Event |
|--------------|-------|-------|--------|------------|-------|
| `PENDING` | `approve()` | Approver has authority for this amount | Record approval with signature | `APPROVED` | `approval.approved` |
| `PENDING` | `reject()` | Approver has authority, reason provided | Record rejection with reason | `REJECTED` | `approval.rejected` |
| `PENDING` | `escalate()` | Higher authority exists in approval chain | Forward to next authority level | `ESCALATED` | `approval.escalated` |
| `PENDING` | `delegate()` | Delegate is pre-registered and active | Forward to delegate | `DELEGATED` | `approval.delegated` |
| `PENDING` | `timeout()` | SLA breached (configurable, default 3 days) | Auto-escalate or flag | `TIMED_OUT` | `approval.timed_out` |
| `ESCALATED` | `approve()` | Escalated approver has authority | Record approval | `APPROVED` | `approval.approved` |
| `DELEGATED` | `approve()` | Delegate has equivalent authority | Record approval with original approver reference | `APPROVED` | `approval.approved` |
| `PENDING` | `skip()` | Invoice amount below this level's threshold | Skip level, proceed to next | `SKIPPED` | `approval.skipped` |

### SoD (Segregation of Duties) Guards

| Rule | Constraint | Violation Action |
|------|------------|------------------|
| Creator cannot approve | `approver.id !== invoice.createdBy` | Block approval, log SoD violation |
| Same person cannot approve at multiple levels | `approver.id not in previous approvers` | Block approval, log SoD violation |
| Approver must have role authority | `approver.role >= requiredRole` | Block approval, log authority violation |
| Self-invoice requires dual approval | `invoice.vendorId !== invoice.createdBy.companyId` | Require two approvals at highest level |

---

## 5. Exception State Machine

### States (6)

| State | Description | Terminal? |
|-------|-------------|-----------|
| `OPEN` | Exception detected, awaiting classification | No |
| `CLASSIFIED` | Severity and type assigned, routed to resolver | No |
| `IN_PROGRESS` | Resolver investigating, may need additional info | No |
| `RESOLVED` | Resolution applied, awaiting verification | No |
| `VERIFIED` | Resolution verified, exception closed | **Yes** |
| `ESCALATED` | Cannot resolve, forwarded to management | No |

### Transition Table

| Current State | Input | Guard | Action | Next State | Event |
|--------------|-------|-------|--------|------------|-------|
| `OPEN` | `classify()` | Exception type identified | Assign severity, route to resolver | `CLASSIFIED` | `exception.classified` |
| `CLASSIFIED` | `start()` | Resolver assigned | Begin investigation | `IN_PROGRESS` | `exception.in_progress` |
| `IN_PROGRESS` | `resolve()` | Resolution action defined | Apply resolution | `RESOLVED` | `exception.resolved` |
| `RESOLVED` | `verify()` | Resolution verified by secondary check | Close exception | `VERIFIED` | `exception.verified` |
| `IN_PROGRESS` | `escalate()` | Cannot resolve within SLA or needs authority | Forward to manager | `ESCALATED` | `exception.escalated` |
| `ESCALATED` | `resolve()` | Manager resolves | Apply resolution | `RESOLVED` | `exception.resolved` |

### Exception Types and Resolution Actions

| Exception Type | Resolution Actions | Required Role |
|---------------|-------------------|---------------|
| PRICE_MISMATCH | Accept PO price, Accept invoice price, Request credit note | AP Clerk (within tolerance), AP Manager (over tolerance) |
| QUANTITY_MISMATCH | Confirm received qty, Split delivery, Return to vendor | AP Clerk, Procurement |
| MISSING_GRN | Create GRN, Waive GRN requirement | Warehouse, AP Manager |
| DUPLICATE_INVOICE | Confirm duplicate (void), Confirm unique (override) | AP Manager |
| MISSING_PO | Create PO retroactively, Reject invoice | Procurement, AP Manager |
| VENDOR_MISMATCH | Correct vendor, Create new vendor, Merge vendors | AP Clerk, AP Manager |
| CURRENCY_MISMATCH | Confirm exchange rate, Request amendment | Treasury, AP Manager |

---

## 6. Vendor State Machine

### States (4)

| State | Description | Terminal? |
|-------|-------------|-----------|
| `PENDING_REVIEW` | New vendor, awaiting verification | No |
| `ACTIVE` | Vendor verified, can receive invoices and payments | No |
| `SUSPENDED` | Vendor suspended, invoices blocked from payment | No |
| `DEACTIVATED` | Vendor deactivated, no further transactions | **Yes** |

### State Diagram

```
              ┌──────────────────┐
              │ PENDING_REVIEW   │
              └────────┬─────────┘
                       │
                 activate()
                       │
                       ▼
              ┌──────────────────┐
              │     ACTIVE       │◄──────────────┐
              └────────┬─────────┘               │
                       │                         │
            ┌──────────┴──────────┐              │
            ▼                     ▼              │
  ┌──────────────────┐  ┌──────────────────┐    │
  │    SUSPENDED     │  │  DEACTIVATED     │    │
  └────────┬─────────┘  └──────────────────┘    │
           │                                     │
     reactivate()                               │
           │                                     │
           └─────────────────────────────────────┘
```

### Transition Table

| Current State | Input | Guard | Action | Next State | Event |
|--------------|-------|-------|--------|------------|-------|
| `PENDING_REVIEW` | `activate()` | Bank details verified, tax ID confirmed, approval received | Set active, link to payment terms | `ACTIVE` | `vendor.activated` |
| `ACTIVE` | `suspend()` | Outstanding issues (fraud, dispute, compliance) | Block new payments, notify AP | `SUSPENDED` | `vendor.suspended` |
| `SUSPENDED` | `reactivate()` | Issues resolved, re-approval received | Unblock payments | `ACTIVE` | `vendor.reactivated` |
| `ACTIVE` or `SUSPENDED` | `deactivate()` | No outstanding invoices, final approval | Close vendor record | `DEACTIVATED` | `vendor.deactivated` |

---

## 7. Cross-Entity State Dependencies

Invoice, Payment, Approval, and Exception state machines are interconnected. A state change in one can trigger or block transitions in another.

### Dependency Matrix

| Trigger | Source | Target | Effect |
|---------|--------|--------|--------|
| Invoice `MATCHED` | Invoice SM | Approval SM | Creates approval request(s) |
| Approval `APPROVED` (all levels) | Approval SM | Invoice SM | Invoice → `APPROVED` |
| Approval `REJECTED` | Approval SM | Invoice SM | Invoice → `EXCEPTION` |
| Invoice `APPROVED` | Invoice SM | Payment SM | Creates payment proposal |
| Payment `COMPLETED` | Payment SM | Invoice SM | Invoice → `PAID` |
| Invoice `EXCEPTION` | Invoice SM | Exception SM | Creates exception record |
| Exception `VERIFIED` | Exception SM | Invoice SM | Invoice re-runs match |
| Payment `VOIDED` | Payment SM | Invoice SM | Invoice → `APPROVED` (re-queue) |
| Invoice `VOIDED` | Invoice SM | Payment SM | Cancels payment if scheduled |

### Ordering Constraints

1. **Invoice must be `APPROVED` before Payment can be created**
   - Guard: `invoice.state === 'APPROVED'`
   - Reason: Payments without approval are unauthorised disbursements

2. **All Approval levels must be `APPROVED` or `SKIPPED` before Invoice can be `APPROVED`**
   - Guard: `every(level => level.state === 'APPROVED' || level.state === 'SKIPPED')`
   - Reason: Partial approval is not approval

3. **Payment must be `APPROVED` by Treasury before execution**
   - Guard: `payment.state === 'APPROVED'`
   - Reason: Execution without Treasury approval bypasses cash management

4. **Invoice cannot be `VOIDED` after `PAID`**
   - Guard: `invoice.state ∉ ['PAID', 'RECONCILED', 'CLOSED']`
   - Reason: Paid invoices require credit notes or dispute resolution, not voiding

5. **Invoice cannot be `DISPUTED` before `PAID`**
   - Guard: `invoice.state ∈ ['PAID', 'RECONCILED']`
   - Reason: Disputes on unpaid invoices are handled as exceptions, not disputes

---

## 8. Illegal Transitions

The system must **reject** the following transitions with a logged error:

| Illegal Transition | Reason | System Response |
|-------------------|--------|-----------------|
| `DRAFT` → `MATCHED` | Skipped validation and evidence | 400 Bad Request |
| `CAPTURED` → `APPROVED` | Skipped matching and approval | 400 Bad Request |
| `MATCHED` → `PAID` | Skipped approval | 400 Bad Request |
| `VOIDED` → any | Voided is terminal | 400 Bad Request |
| `CLOSED` → any | Closed is terminal | 400 Bad Request |
| `PAID` → `VOIDED` | Must use dispute or credit note | 400 Bad Request |
| `PAID` → `MATCHED` | Cannot un-pay | 400 Bad Request |
| `APPROVED` → `MATCHED` | Cannot un-approve | 400 Bad Request |
| `EXCEPTION` → `APPROVED` | Must resolve exception first | 400 Bad Request |
| `DISPUTED` → `PAID` | Must resolve dispute first | 400 Bad Request |
| `PROPOSED` → `COMPLETED` | Must go through execution | 400 Bad Request |
| `PENDING` → `APPROVED` (by creator) | SoD violation | 403 Forbidden |

---

## 9. Recovery Transitions

Recovery transitions handle exceptional situations where the normal workflow must be reversed or corrected.

| Recovery | From States | To State | Guard | Audit Event |
|----------|------------|----------|-------|-------------|
| Void invoice | `DRAFT`, `CAPTURED`, `VALIDATED`, `MATCHED`, `EXCEPTION`, `APPROVED` | `VOIDED` | Not yet paid, reason required | `invoice.voided` |
| Cancel payment | `PROPOSED`, `APPROVED` | Cancelled (removed) | Not yet executed, reason required | `payment.cancelled` |
| Dispute invoice | `PAID`, `RECONCILED` | `DISPUTED` | Vendor dispute received, reason required | `invoice.disputed` |
| Credit note | Any (with invoice) | `VOIDED` (original) | Credit note issued and approved | `invoice.credited` |
| Re-open exception | `EXCEPTION` (resolved) | `EXCEPTION` (in-progress) | New evidence, secondary approval | `exception.reopened` |
| Correction | Any (before `CLOSED`) | Same state | Data correction with audit trail | `invoice.corrected` |

### Recovery Audit Requirements

Every recovery transition **must** record:
1. **Who** initiated the recovery (userId, role)
2. **Why** the recovery was needed (free-text reason, mandatory)
3. **What** was the original decision (link to original audit record)
4. **What** is the new state (with full state diff)
5. **When** exactly (timestamp with milliseconds)
6. **Checksum** linking to previous audit record

---

## 10. Concurrency Control

### Optimistic Locking

Every aggregate root has a `version` field (integer, default 0, auto-increment on update).

```typescript
// Example: Invoice approval
const invoice = await prisma.procurementVendorInvoice.findUnique({
  where: { id: invoiceId }
});

// User reviews and clicks approve
const result = await prisma.procurementVendorInvoice.updateMany({
  where: {
    id: invoiceId,
    version: invoice.version  // Optimistic lock
  },
  data: {
    status: 'APPROVED',
    version: { increment: 1 }
  }
});

if (result.count === 0) {
  throw new ConflictError(
    'Invoice was modified by another user. Please refresh and retry.'
  );
}
```

### Conflict Resolution

| Scenario | Detection | Response |
|----------|-----------|----------|
| Two approvers approve simultaneously | `version` mismatch on second update | Reject second, return conflict error |
| Approver and AP Clerk modify simultaneously | `version` mismatch | Reject second, return conflict error |
| Payment executed while invoice voided | Invoice state check in payment execution | Reject payment, log conflict |

### Version Field Schema

```prisma
model ProcurementVendorInvoice {
  // ... other fields
  version Int @default(0)
}
```

---

## 11. State Event Mapping

Every state transition emits a domain event. Events are consumed by:
- **AuditPlatform** — immutable audit trail
- **NotificationPlatform** — stakeholder notifications
- **AIPlatform** — pattern learning, anomaly detection
- **ReportingPlatform** — real-time dashboards
- **IntegrationPlatform** — external system sync

### Complete Event Map

| Transition | Event | Consumers |
|-----------|-------|-----------|
| DRAFT → CAPTURED | `invoice.captured` | Audit, AI |
| CAPTURED → VALIDATED | `invoice.validated` | Audit, AI |
| VALIDATED → MATCHED | `match.completed` | Audit, AI, Notification |
| VALIDATED → EXCEPTION | `match.exception.raised` | Audit, Notification, AI |
| MATCHED → APPROVED | `invoice.approved` | Audit, Notification, AI |
| APPROVED → PAYMENT_SCHEDULED | `payment.scheduled` | Audit, Treasury, Notification |
| PAYMENT_SCHEDULED → PAID | `payment.executed` | Audit, Notification, AI |
| PAID → RECONCILED | `reconciliation.matched` | Audit, GL, Reporting |
| RECONCILED → CLOSED | `audit.trail.closed` | Audit, Reporting |
| Any → VOIDED | `invoice.voided` | Audit, Notification, AI |
| Any → DISPUTED | `invoice.disputed` | Audit, Notification, AI, Vendor |
| PROPOSED → APPROVED | `payment.approved` | Audit, Notification |
| APPROVED → PROCESSING | `payment.submitted` | Audit, Banking |
| PROCESSING → COMPLETED | `payment.completed` | Audit, Notification |
| PROCESSING → FAILED | `payment.failed` | Audit, Notification, Treasury |
| COMPLETED → CONFIRMED | `payment.confirmed` | Audit, GL, Reporting |
| Any → VOIDED (payment) | `payment.voided` | Audit, Notification |
| OPEN → CLASSIFIED | `exception.classified` | Audit, AI |
| CLASSIFIED → IN_PROGRESS | `exception.in_progress` | Audit |
| IN_PROGRESS → RESOLVED | `exception.resolved` | Audit, AI |
| RESOLVED → VERIFIED | `exception.verified` | Audit, AI |
| IN_PROGRESS → ESCALATED | `exception.escalated` | Audit, Notification |
| PENDING → APPROVED | `approval.approved` | Audit |
| PENDING → REJECTED | `approval.rejected` | Audit, Notification |
| PENDING → ESCALATED | `approval.escalated` | Audit, Notification |
| PENDING → DELEGATED | `approval.delegated` | Audit, Notification |
| PENDING → TIMED_OUT | `approval.timed_out` | Audit, Notification, Escalation |
| PENDING → SKIPPED | `approval.skipped` | Audit |
| PENDING_REVIEW → ACTIVE | `vendor.activated` | Audit, Notification |
| ACTIVE → SUSPENDED | `vendor.suspended` | Audit, Notification, AP |
| SUSPENDED → ACTIVE | `vendor.reactivated` | Audit, Notification |
| ACTIVE/SUSPENDED → DEACTIVATED | `vendor.deactivated` | Audit, Notification |

---

## 12. State Persistence

All states are persisted in Prisma with the following fields:

```typescript
// Every stateful entity has:
{
  status: string,          // Current state (enum)
  version: number,         // Optimistic lock version
  createdAt: Date,         // First state
  updatedAt: Date,         // Last state change
  createdBy: string,       // userId who created
  updatedBy: string,       // userId who last changed state
}
```

### State History

State transitions are **not** stored as update history on the entity. Instead, they are stored as immutable audit records in `ProcurementAPAuditRecord`. This ensures:
1. The entity always shows current state (fast reads)
2. The audit trail shows complete history (append-only)
3. The checksum chain makes tampering detectable

---

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | WORKFLOW_STATE_MACHINE_v1.0 |
| Phase | 27.0A |
| Author | Perionyx Product Architecture Board |
| Reviewers | Engineering Leads, Domain Experts |
| Status | Draft |
| Next Review | Phase 27.0B |
| Classification | Internal — Engineering & Product |
