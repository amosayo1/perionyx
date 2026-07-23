# Phase 21A.0 — Accounts Payable State Machine Definitions

> **Status**: Complete
> **Type**: Documentation-only — architecture specification
> **Date**: July 21, 2026
> **Scope**: Complete state machine definitions for all 12 AP domain entities
> **Depends on**: Phase 21.0 workflow definition, gap analysis, implementation plan

---

## Overview

This document defines the formal state machines governing every entity in the Accounts Payable procure-to-pay lifecycle. Each state machine specifies all valid states, permitted transitions, authorization requirements, audit evidence, error handling, and SLA constraints.

### Design Principles

1. **Explicit state graphs** — every transition is defined; undefined transitions are rejected
2. **Authority-bound** — every transition requires a specific role or system action
3. **Evidence-producing** — every transition writes an immutable audit record
4. **Failure-aware** — every transition has a defined failure mode and recovery path
5. **SLA-enforced** — time-critical transitions have deadlines and escalation paths
6. **Idempotent where possible** — duplicate transition attempts produce the same result

### Conventions

| Symbol | Meaning |
|---|---|
| `→` | Valid transition |
| `[A]` | Authority/role required |
| `(N hours)` | SLA deadline |
| `*` | Terminal state — no outgoing transitions |
| `⟳` | System/auto-triggered |
| `⛔` | Blocking condition |

### Color Coding (for state diagrams)

| State Type | Convention |
|---|---|
| Initial state | `(entry point)` |
| Active states | Normal processing |
| Terminal states | End of lifecycle |
| Error states | Requires intervention |

---

## 1. Vendor Lifecycle

The vendor lifecycle governs the relationship from initial vetting through deactivation. Every vendor must be approved before any PO or invoice can reference it.

### States

| State | Description | Data Visible | Actions Available |
|---|---|---|---|
| `PendingReview` | Newly submitted, awaiting initial review | Vendor details, submitted documents | Edit, Approve, Reject |
| `UnderReview` | Review in progress (due diligence, sanctions, risk) | Vendor details, risk assessment, review notes | Approve, Reject, RequestInfo |
| `Active` | Approved, eligible for POs and invoices | Full vendor record, risk score, rating | Suspend, Deactivate, Edit |
| `Suspended` | Temporarily blocked — existing POs may complete, no new POs | Vendor record, suspension reason, since date | Reactivate, Deactivate |
| `Deactivated` | Permanently removed from active use | Full history (read-only) | *None* |
| `Rejected` | Failed review — not approved | Rejection reason, documents | Reapply (creates new PendingReview) |

### Transition Table

| From | To | Trigger | Authority | Evidence | Recovery | SLA |
|---|---|---|---|---|---|---|
| — | `PendingReview` | `VendorService.create()` | AP Clerk | `vendor.created` | N/A | — |
| `PendingReview` | `UnderReview` | `VendorService.startReview()` | AP Manager | `vendor.review_started` | N/A | — |
| `PendingReview` | `Active` | `VendorService.approve()` (auto-approve: risk <20%, spend <10K) | System [AP Manager for manual] | `vendor.approved` | N/A | 48h |
| `PendingReview` | `Rejected` | `VendorService.reject()` | AP Manager | `vendor.rejected` | Can reapply | 48h |
| `UnderReview` | `Active` | `VendorService.approve()` | AP Manager [Controller if risk >50%] | `vendor.approved` | N/A | 72h |
| `UnderReview` | `Rejected` | `VendorService.reject()` | AP Manager [Controller if risk >50%] | `vendor.rejected` | Can reapply | 72h |
| `UnderReview` | `PendingReview` | `VendorService.requestInfo()` | AP Clerk | `vendor.info_requested` | Provide additional docs | — |
| `Active` | `Suspended` | `VendorService.suspend()` | AP Manager | `vendor.suspended` | Reactivate | — |
| `Active` | `Deactivated` | `VendorService.deactivate()` | Controller | `vendor.deactivated` | — | — |
| `Suspended` | `Active` | `VendorService.reactivate()` | AP Manager | `vendor.reactivated` | N/A | — |
| `Suspended` | `Deactivated` | `VendorService.deactivate()` | Controller | `vendor.deactivated` | — | — |

### Terminal States

| State | Condition |
|---|---|
| `Deactivated` | No outgoing transitions. Existing POs complete. Invoices settled. |

### Error Handling

| Failure | Response |
|---|---|
| Duplicate vendor (same tax ID + name) | Block creation, surface existing vendor |
| Bank details fail validation | Block approval, require corrected details |
| Sanctions screening hit | Force `UnderReview` → `Rejected` |
| Suspended vendor referenced by new PO | Block PO creation with error |

### SLA Summary

| Transition | SLA | Escalation | Auto-action |
|---|---|---|---|
| `PendingReview` → decision | 48 hours | Controller | — |
| `UnderReview` → decision | 72 hours | Controller | — |
| Inactive review > 7 days | — | CFO alert | — |

### Prisma Model Alignment

```
ProcurementVendor.status:  PENDING_REVIEW | ACTIVE | SUSPENDED | DEACTIVATED
```

---

## 2. Purchase Request

The purchase request is the initiating document of the procure-to-pay lifecycle. From AP's perspective, PRs matter because approved PRs become POs that generate invoices.

### States

| State | Description | Data Visible | Actions Available |
|---|---|---|---|
| `Draft` | Being composed by requester | PR line items, budget info | Edit, Submit, Delete |
| `Submitted` | Awaiting approval routing | Full PR, approval chain, budget check | Approve, Reject, Withdraw |
| `Approved` | All approvals received | Approval chain, linked budget | ConvertToPO |
| `Rejected` | Denied at some approval level | Rejection reason, rejecting level | Edit, Resubmit (→ Submitted) |
| `Withdrawn` | Requester pulled back before decision | Withdrawal reason | Edit, Resubmit (→ Submitted) |
| `ConvertedToPO` | Successfully converted to purchase order | Linked PO number | *View only* |

### Transition Table

| From | To | Trigger | Authority | Evidence | Recovery | SLA |
|---|---|---|---|---|---|---|
| — | `Draft` | `PurchaseRequestService.create()` | Any employee | `pr.created` | N/A | — |
| `Draft` | `Submitted` | `PurchaseRequestService.submit()` | Requester | `pr.submitted` | N/A | — |
| `Draft` | — | `PurchaseRequestService.delete()` | Requester (owner only) | `pr.deleted` | N/A | — |
| `Submitted` | `Approved` | `PurchaseRequestService.approve()` | Threshold-based (auto <500, dept head, AP manager, Controller, CFO) | `pr.approved` | N/A | Per approval level SLA |
| `Submitted` | `Rejected` | `PurchaseRequestService.reject()` | Same authority chain | `pr.rejected` | Edit + resubmit | Per approval level SLA |
| `Submitted` | `Withdrawn` | `PurchaseRequestService.withdraw()` | Requester (owner only) | `pr.withdrawn` | Resubmit | — |
| `Rejected` | `Submitted` | `PurchaseRequestService.resubmit()` | Requester (owner only) | `pr.resubmitted` | N/A | — |
| `Withdrawn` | `Submitted` | `PurchaseRequestService.resubmit()` | Requester (owner only) | `pr.resubmitted` | N/A | — |
| `Approved` | `ConvertedToPO` | `PurchaseRequestService.convertToPO()` | AP Manager [auto if trusted requester] | `pr.converted_to_po` | N/A | 24h |

### Terminal States

| State | Condition |
|---|---|
| `ConvertedToPO` | Linked PO exists. PR is now a reference document. |

### Error Handling

| Failure | Response |
|---|---|
| Budget exceeded on submit | Block submission, notify requester |
| Invalid cost center | Block submission |
| Missing justification | Block submission |
| All approvers unavailable | Escalate to CFO |
| SLA breach at any level | Auto-escalate to next level |

### SLA Summary

| Transition | SLA | Escalation | Auto-action |
|---|---|---|---|
| `Submitted` → approval (auto) | Immediate | — | Auto-approve <$500 |
| `Submitted` → dept head | 24 hours | AP Manager | — |
| `Submitted` → Controller | 48 hours | CFO | — |
| `Submitted` → CFO | 72 hours | — | — |
| `Approved` → `ConvertedToPO` | 24 hours | AP Manager | Auto-convert |

---

## 3. Purchase Order (Reference Machine)

PO lifecycle is owned by the procurement context. AP references PO states for matching and payment. This state machine is **read-only from AP's perspective** — AP does not transition PO states.

### States

| State | Description | AP Relevance |
|---|---|---|
| `Draft` | PO being composed | None — no invoice can reference |
| `Sent` | PO transmitted to vendor | None — awaiting acknowledgment |
| `Acknowledged` | Vendor confirmed PO | None — awaiting delivery |
| `PartiallyReceived` | Some line items received (GRN exists) | Triggers partial 3-way match |
| `Received` | All line items received | Triggers 3-way match |
| `Closed` | PO fully settled (all invoices paid) | Archive reference |
| `Cancelled` | PO voided before fulfillment | Block new invoices against PO |

### AP-Side Observations

| PO State | AP Impact |
|---|---|
| `Draft` / `Sent` | AP cannot receive invoices against this PO |
| `Acknowledged` | AP can receive invoices but cannot match (no GRN) |
| `PartiallyReceived` | AP can match received quantities only; over-invoice blocked |
| `Received` | AP can perform full 3-way match |
| `Closed` | AP cannot create new invoices against PO |
| `Cancelled` | AP must reject any invoice referencing this PO |

---

## 4. Goods Receipt Note (Reference Machine)

GRN lifecycle is owned by procurement/warehouse. AP references GRN states for matching quantities.

### States

| State | Description | AP Relevance |
|---|---|---|
| `Received` | Goods physically received, not yet inspected | Quantity available for matching |
| `Inspected` | Inspection in progress | Quantity may change (rejections) |
| `Accepted` | All/most items pass inspection | Final quantity for 3-way match |
| `Rejected` | Items fail inspection — return to vendor | Quantity removed from matching pool |

### AP-Side Observations

| GRN State | AP Impact |
|---|---|
| `Received` | AP can begin 3-way match with received quantities |
| `Inspected` | Quantities may change — AP should wait for final inspection |
| `Accepted` | Confirmed quantities lock for 3-way match |
| `Rejected` | Quantities removed. If partially accepted, only accepted quantities match |

---

## 5. Invoice (CORE STATE MACHINE)

The invoice is the central entity of the AP domain. It orchestrates validation, matching, approval, payment, and GL posting. Every other AP entity exists to serve the invoice lifecycle.

### States

| State | Description | Data Visible | Actions Available |
|---|---|---|---|
| `Draft` | Created but not yet submitted by vendor | Basic invoice data (number, vendor, amount) | Edit, Submit, Delete |
| `Received` | Invoice received and captured in system | Full invoice data, line items, PO reference | Validate, Reject, Block |
| `Validated` | All validation rules passed (format, tax, dates, duplicates) | Validation results, field-level scores | Match, Flag |
| `Matched` | Successfully matched to PO and/or GRN within tolerance | Match results, variance details | Approve, Dispute |
| `Exception` | Failed matching, validation, or duplicate detection | Exception details, type, severity | Resolve, Escalate, Override |
| `Approved` | Approved for payment by authority chain | Approval chain, authority level | Schedule, Void |
| `Scheduled` | Added to a payment proposal batch | Payment proposal reference | Execute, Cancel |
| `Paid` | Payment executed and confirmed | Payment confirmation, bank reference | Close, Reverse |
| `Closed` | Fully settled, archived | Complete audit history | *View only (immutable)* |
| `Disputed` | Vendor disputes invoice amount or items | Dispute details, vendor communication | Investigate, Resolve, Void |
| `Blocked` | Blocked pending investigation or compliance hold | Block reason, blocking authority | Unblock, Void |
| `Voided` | Cancelled or voided — never to be paid | Void reason, voiding authority | *View only (immutable)* |

### State Diagram

```
                         ┌──────────┐
                         │  (entry) │
                         └────┬─────┘
                              │ create
                              ▼
                      ┌───────────┐
                 ┌───►│   Draft   │◄───┐
                 │    └─────┬─────┘    │
                 │          │ submit   │
                 │          ▼          │
                 │    ┌───────────┐    │
                 │    │  Received │    │
                 │    └─────┬─────┘    │
                 │          │ validate  │
                 │     ┌────┴────┐     │
                 │     ▼         ▼     │
                 │ ┌────────┐ ┌─────────┐
                 │ │Blocked │ │Validated│
                 │ └───┬────┘ └────┬────┘
                 │     │           │ match
                 │     │     ┌─────┴──────┐
                 │     │     ▼            ▼
                 │     │ ┌────────┐ ┌──────────┐
                 │     │ │Matched │ │ Exception│
                 │     │ └───┬────┘ └────┬─────┘
                 │     │     │           │ resolve/override
                 │     │     │     ┌─────┘
                 │     │     ▼     │
                 │     │ ┌─────────┐
                 │     ├─┤Disputed │
                 │     │ └────┬────┘
                 │     │      │
                 │     │      ▼
                 │     │ ┌──────────┐
                 │     └►│ Approved │
                 │       └────┬─────┘
                 │            │ schedule
                 │            ▼
                 │      ┌──────────┐
                 │      │Scheduled │
                 │      └────┬─────┘
                 │           │ execute
                 │           ▼
                 │     ┌──────────┐
                 │     │   Paid   │
                 │     └────┬─────┘
                 │          │ close
                 │          ▼
                 │    ┌──────────┐
                 │    │  Closed* │
                 │    └──────────┘
                 │
                 │ void (from Approved, Scheduled, Disputed, Blocked)
                 │
                 │    ┌──────────┐
                 └────┤ Voided*  │
                      └──────────┘
```

### Transition Table

| From | To | Trigger | Authority | Evidence | Recovery | SLA |
|---|---|---|---|---|---|---|
| — | `Draft` | `InvoiceService.create()` | AP Clerk | `invoice.created` | Edit freely | — |
| `Draft` | `Received` | `InvoiceService.submit()` | AP Clerk | `invoice.submitted` | — | — |
| `Draft` | — | `InvoiceService.delete()` | AP Clerk (owner only) | `invoice.deleted` | N/A | — |
| `Received` | `Validated` | `InvoiceService.validate()` ⟳ auto | System [AP Clerk for manual] | `invoice.validated` | Return to Received for correction | 4h |
| `Received` | `Blocked` | `InvoiceService.block()` | AP Manager [Controller if >50K] | `invoice.blocked` | Unblock or void | — |
| `Received` | `Voided` | `InvoiceService.void()` | Controller | `invoice.voided` | — | — |
| `Validated` | `Matched` | `InvoiceService.match()` ⟳ auto | System | `invoice.matched` | — | 2h |
| `Validated` | `Exception` | `InvoiceService.flagException()` ⟳ auto | System | `invoice.exception` | Resolve via exception queue | Immediate |
| `Matched` | `Approved` | `InvoiceService.approve()` | Threshold-based (auto <$1K, AP Manager, Controller, CFO, CFO+Treasury) | `invoice.approved` | — | Per approval SLA |
| `Matched` | `Disputed` | `InvoiceService.dispute()` | AP Clerk | `invoice.disputed` | Investigate | — |
| `Matched` | `Exception` | `InvoiceService.flagException()` | AP Clerk | `invoice.exception` | Resolve | — |
| `Exception` | `Matched` | `InvoiceService.resolveMatch()` | AP Clerk [AP Manager if override] | `invoice.match_resolved` | N/A | 24h |
| `Exception` | `Validated` | `InvoiceService.resolveValidation()` | AP Clerk | `invoice.validation_resolved` | Re-validate | 24h |
| `Exception` | `Voided` | `InvoiceService.void()` | Controller | `invoice.voided` | — | — |
| `Approved` | `Scheduled` | `InvoiceService.schedule()` | AP Manager (batch proposal) | `invoice.scheduled` | Cancel proposal | Same day |
| `Approved` | `Voided` | `InvoiceService.void()` | Controller | `invoice.voided` | — | — |
| `Scheduled` | `Paid` | `InvoiceService.markPaid()` | System ⟳ (on payment confirmation) | `invoice.paid` | Reverse payment | Per payment terms |
| `Scheduled` | `Exception` | `InvoiceService.paymentException()` ⟳ | System | `invoice.payment_exception` | Retry or cancel | 48h |
| `Scheduled` | `Voided` | `InvoiceService.void()` | Controller | `invoice.voided` | Cancel payment batch | — |
| `Paid` | `Closed` | `InvoiceService.close()` | System ⟳ (after GL posting confirmed) | `invoice.closed` | N/A | 30 days |
| `Paid` | — | `InvoiceService.reverse()` | Controller (creates reversing entry) | `invoice.reversed` | N/A | — |
| `Disputed` | `Matched` | `InvoiceService.resolveDispute()` | AP Manager | `invoice.dispute_resolved` | N/A | 30 days |
| `Disputed` | `Voided` | `InvoiceService.void()` | Controller | `invoice.voided` | — | — |
| `Blocked` | `Received` | `InvoiceService.unblock()` | AP Manager | `invoice.unblocked` | Re-validate | — |
| `Blocked` | `Voided` | `InvoiceService.void()` | Controller | `invoice.voided` | — | — |

### Terminal States

| State | Characteristics |
|---|---|
| `Closed` | Fully settled. Immutable. Complete audit history. No outgoing transitions. |
| `Voided` | Cancelled/voided. Immutable. Void reason recorded. No outgoing transitions. |

### Error States

| Error | Current State | System Response | Recovery |
|---|---|---|---|
| Validation failure | `Received` | Create `ProcurementException` (severity: LOW-MEDIUM) | AP Clerk corrects and re-submits |
| Match failure | `Validated` | Transition to `Exception`, create exception record | AP Clerk investigates mismatch |
| Duplicate detected | `Received` | Block transition, create `ProcurementException` (severity: HIGH) | AP Manager investigates or overrides |
| Approval timeout | `Matched` | Auto-escalate to next level | — |
| Payment failure | `Scheduled` | Create `ProcurementException` (severity: HIGH), auto-retry 3x | AP Manager investigates |
| GL posting failure | `Paid` | Hold at `Paid`, retry posting, alert Controller | Manual GL posting |

### SLA Constraints

| Transition | SLA | Escalation Path | Auto-action |
|---|---|---|---|
| `Received` → `Validated` | 4 hours | AP Clerk → AP Manager | Auto-validate on capture |
| `Validated` → `Matched` | 2 hours (auto-trigger) | System | Auto-match |
| `Matched` → `Approved` (auto) | Immediate (for <$1K, matched, single-PO) | — | Auto-approve |
| `Matched` → `Approved` (manual) | 24 hours | AP Manager → Controller → CFO | Auto-escalate |
| `Exception` → resolution | 24 hours | AP Clerk → AP Manager → Controller | Auto-escalate |
| `Approved` → `Scheduled` | Same business day | AP Manager | — |
| `Scheduled` → `Paid` | Per payment terms (Net 30 default) | Treasury | Auto-include in next run |
| `Disputed` → resolution | 30 days | AP Manager → Controller | — |
| `Paid` → `Closed` | 30 days (after GL confirmation) | System | Auto-close |

### Invoice SLA Timeline

```
Day 0          Day 0        Day 0        Day 0        Day 1       Day 1-30     Day 30+
│              │            │            │            │           │            │
│  Capture     │  Validate  │  Match     │  Approve   │  Schedule │  Pay       │  Close
│  ───4h───►   │  ──2h──►   │  immediate │  ──24h──►  │ same day  │ per terms  │ auto
│              │            │            │            │           │            │
│◄────── Exception? ───────►│            │            │           │            │
│              │◄── 24h SLA ─►│           │            │           │            │
│              │            │            │◄── Exception ──24h SLA──►│          │
```

---

## 6. Three-Way Match

The three-way match validates that Invoice ↔ PO ↔ GRN are consistent in quantity, price, and terms. This is an **embedded sub-state** of the Invoice lifecycle but has its own internal state machine.

### States

| State | Description | Data Visible | Actions Available |
|---|---|---|---|
| `Pending` | Match not yet initiated | PO and GRN data available | Initiate |
| `Matching` | Comparison in progress | Line-by-line comparison data | Wait |
| `Matched` | All dimensions within tolerance | Variance report (all pass) | Confirm (→ Invoice.Matched) |
| `Mismatched` | One or more dimensions exceed tolerance | Variance report with details | Override, CreateException |
| `Exception` | Match exception created for manual resolution | Exception type, severity, SLA | Resolve, Escalate |
| `Resolved` | Exception manually resolved | Resolution notes, authority | Re-match |
| `Overridden` | Match forced by authority despite variance | Override reason, authority level | (→ Invoice.Matched) |
| `Voided` | Match cancelled (invoice voided or PO cancelled) | Void reason | *None* |

### Transition Table

| From | To | Trigger | Authority | Evidence | Recovery | SLA |
|---|---|---|---|---|---|---|
| — | `Pending` | GRN or Invoice created with PO link | System ⟳ | `match.initiated` | N/A | — |
| `Pending` | `Matching` | `InvoiceMatchingService.performMatch()` ⟳ | System | `match.comparing` | N/A | — |
| `Matching` | `Matched` | Match result: all within tolerance | System ⟳ | `match.matched` | N/A | 2h |
| `Matching` | `Mismatched` | Match result: one+ dimension exceeds tolerance | System ⟳ | `match.mismatched` | Create exception | Immediate |
| `Mismatched` | `Overridden` | `InvoiceMatchingService.overrideMatch()` | AP Manager [Controller if variance >$500] | `match.overridden` | N/A | — |
| `Mismatched` | `Exception` | `InvoiceMatchingService.createException()` ⟳ | System | `match.exception_created` | Resolve in exception queue | — |
| `Exception` | `Resolved` | `ExceptionService.resolve()` | AP Clerk [within tolerance] | `match.exception_resolved` | Re-match | 24h |
| `Exception` | `Exception` | `ExceptionService.escalate()` | AP Manager | `match.exception_escalated` | — | — |
| `Overridden` | — | (transitions to Invoice.Matched) | — | — | — | — |
| `Resolved` | `Pending` | `InvoiceMatchingService.rematch()` | AP Clerk | `match.rematch_initiated` | — | — |
| `Matched` | — | (transitions to Invoice.Matched) | — | — | — | — |
| `*` | `Voided` | Invoice voided or PO cancelled | System ⟳ | `match.voided` | N/A | — |

### Tolerance Configuration

| Dimension | Default Tolerance | Configurable Per | Override Authority |
|---|---|---|---|
| Price variance | $0.01 absolute OR 0.5% | Vendor, category, amount tier | AP Manager |
| Quantity variance | 0 units | Vendor, category | Procurement Manager |
| Tax variance | $0.00 | Vendor | AP Manager |
| Freight variance | $5.00 | Vendor | AP Manager |
| Total variance | $10.00 OR 1% | Company-wide | Controller |
| Payment terms | Exact match | Vendor, contract | AP Manager |

---

## 7. Invoice Exception

Exceptions are created automatically when invoices fail matching, validation, or duplicate detection. The exception queue is the central workbench for AP Clerk resolution.

### States

| State | Description | Data Visible | Actions Available |
|---|---|---|---|
| `Open` | Newly created, awaiting assignment | Exception type, linked invoice, severity, SLA deadline | Assign, Resolve, Escalate |
| `InProgress` | Assigned and being investigated | Investigation notes, communications | Resolve, Escalate, Reassign |
| `AutoResolved` | Resolved by system pattern matching | Resolution details, pattern reference | View |
| `Resolved` | Manually resolved by AP Clerk or Manager | Resolution notes, authority, corrective action | View |
| `Rejected` | Resolution rejected — invoice remains problematic | Rejection reason | Re-escalate, Void |
| `Escalated` | Moved to higher authority | Escalation chain, new SLA | Resolve, Escalate (further) |
| `Voided` | Exception closed by voiding the invoice | Void reason | *None* |

### Transition Table

| From | To | Trigger | Authority | Evidence | Recovery | SLA |
|---|---|---|---|---|---|---|
| — | `Open` | `ExceptionService.create()` ⟳ (from match/validation failure) | System | `exception.created` | N/A | — |
| `Open` | `InProgress` | `ExceptionService.assign()` | AP Manager (auto by type/expertise) | `exception.assigned` | Reassign | 4h |
| `Open` | `AutoResolved` | `ExceptionService.autoResolve()` ⟳ | System (pattern match from history) | `exception.auto_resolved` | N/A | Immediate |
| `Open` | `Escalated` | `ExceptionService.escalate()` ⟳ (SLA breach) | System [Controller if >$5K] | `exception.escalated` | N/A | 24h |
| `InProgress` | `Resolved` | `ExceptionService.resolve()` | AP Clerk [within tolerance] | `exception.resolved` | N/A | 24h |
| `InProgress` | `Escalated` | `ExceptionService.escalate()` | AP Manager [Controller if >$5K] | `exception.escalated` | N/A | — |
| `InProgress` | `Rejected` | `ExceptionService.reject()` | AP Manager | `exception.rejected` | Void or re-escalate | — |
| `Escalated` | `Resolved` | `ExceptionService.resolve()` | Controller [or AP Manager if >tolerance] | `exception.resolved` | N/A | 48h |
| `Escalated` | `Escalated` | `ExceptionService.escalate()` (further) | Controller → CFO | `exception.escalated` | — | — |
| `Resolved` | — | (Invoice proceeds to Matched) | — | — | — | — |
| `Rejected` | `Escalated` | `ExceptionService.reEscalate()` | AP Clerk | `exception.re_escalated` | — | — |
| `Rejected` | `Voided` | `InvoiceService.void()` | Controller | `exception.voided` | — | — |
| `AutoResolved` | — | (Invoice proceeds to Matched) | — | — | — | — |

### Terminal States

| State | Characteristics |
|---|---|
| `Resolved` | Exception closed. Invoice continues in lifecycle. Immutable record. |
| `AutoResolved` | System resolved. Immutable record. |
| `Voided` | Invoice voided. Exception archived. |

### SLA Summary

| Transition | SLA | Escalation | Auto-action |
|---|---|---| --- |
| `Open` → `InProgress` | 4 hours | AP Manager auto-assign | Auto-assign by type |
| `Open` → `AutoResolved` | Immediate | — | Pattern match |
| `InProgress` → resolution | 24 hours | AP Manager → Controller | Auto-escalate |
| `Escalated` → resolution | 48 hours | Controller → CFO | Auto-escalate |
| All exceptions > 30 days | — | CFO alert | Flag for review |

---

## 8. Approval Chain

Multi-level approval governs invoice authorization. Each level has independent state, forming a chain where all levels must approve before the invoice transitions to `Approved`.

### States (Per Level)

| State | Description | Data Visible | Actions Available |
|---|---|---|---|
| `Pending` | Awaiting this level's decision | Invoice details, level info, authority | Approve, Reject, Delegate, Escalate |
| `InProgress` | Decision in progress (delegated or being reviewed) | Delegation details, review notes | Approve, Reject |
| `Approved` | This level approved | Approval timestamp, authority | *None* |
| `Rejected` | This level rejected | Rejection reason, authority | *None* |
| `Escalated` | Moved to higher authority | Escalation reason, new authority | Approve, Reject |
| `Delegated` | Delegated to alternate approver | Delegation details, alternate authority | Approve, Reject |
| `TimedOut` | SLA deadline breached without decision | Timeout details | Auto-escalate |

### Transition Table (Per Level)

| From | To | Trigger | Authority | Evidence | Recovery | SLA |
|---|---|---|---|---|---|---|
| — | `Pending` | Approval chain initiated (by match/completion) | System ⟳ | `approval.pending` | N/A | — |
| `Pending` | `InProgress` | `ApprovalService.delegate()` | System ⟳ (on delegation rule) | `approval.delegated` | — | 24h |
| `Pending` | `Approved` | `ApprovalService.approve()` | Level-specific authority | `approval.approved` | — | Per level |
| `Pending` | `Rejected` | `ApprovalService.reject()` | Level-specific authority | `approval.rejected` | Return to exception queue | Per level |
| `Pending` | `Escalated` | `ApprovalService.escalate()` ⟳ (SLA breach) | System | `approval.escalated` | — | Per level SLA |
| `Pending` | `TimedOut` | `ApprovalService.timeout()` ⟳ | System | `approval.timed_out` | Auto-escalate | Per level SLA |
| `InProgress` | `Approved` | `ApprovalService.approve()` | Delegated authority | `approval.approved` | — | — |
| `InProgress` | `Rejected` | `ApprovalService.reject()` | Delegated authority | `approval.rejected` | — | — |
| `Escalated` | `Approved` | `ApprovalService.approve()` | Higher authority | `approval.approved` | — | Extended SLA |
| `Escalated` | `Rejected` | `ApprovalService.reject()` | Higher authority | `approval.rejected` | — | Extended SLA |
| `TimedOut` | `Escalated` | Auto-escalate ⟳ | System | `approval.auto_escalated` | — | Immediate |
| `Delegated` | `Approved` | `ApprovalService.approve()` | Delegate authority | `approval.approved` | — | — |
| `Delegated` | `Rejected` | `ApprovalService.reject()` | Delegate authority | `approval.rejected` | — | — |

### Authority Matrix

| Amount Range | Level 1 | Level 2 | Level 3 | Level 4 |
|---|---|---|---|---|
| < $1,000 | Auto-approve (system) | — | — | — |
| $1,000 – $10,000 | AP Manager | — | — | — |
| $10,000 – $50,000 | AP Manager | Controller | — | — |
| $50,000 – $100,000 | AP Manager | Controller | CFO | — |
| > $100,000 | AP Manager | Controller | CFO | Treasury Manager (dual) |

### Segregation of Duties Rules

| Rule | Violation | Response |
|---|---|---|
| PO creator ≠ Invoice approver | Same user | Block approval, escalate |
| Invoice capturer ≠ Invoice approver | Same user | Block approval, escalate |
| Payment creator ≠ Payment executor | Same user | Block execution, escalate |
| Approver ≠ Vendor contact | Same email/person | Block approval, escalate |

### SLA Summary

| Level | SLA | Escalation | Auto-action |
|---|---|---|---|
| Level 1 (AP Manager) | 24 hours | Controller | Auto-escalate |
| Level 2 (Controller) | 24 hours | CFO | Auto-escalate |
| Level 3 (CFO) | 48 hours | Board (for >$250K) | — |
| Level 4 (Treasury) | 24 hours | CFO | — |
| Delegation timeout | 24 hours | Auto-delegate to alternate | — |

---

## 9. Payment Proposal

Payment proposals batch approved invoices into optimized payment runs, considering cash flow, early-pay discounts, and vendor payment terms.

### States

| State | Description | Data Visible | Actions Available |
|---|---|---|---|
| `Draft` | Proposal generated, not yet reviewed | Invoice list, total amount, discount savings, payment date | Edit, Submit, Delete |
| `Generated` | Auto-generated by system (daily run) | Batch details, optimization rationale | Review, Modify |
| `Reviewed` | AP Manager has reviewed contents | Review notes, adjustments | Approve, Reject |
| `Approved` | Approved for execution | Approval record, authorized amount | Process |
| `Rejected` | Rejected — must be modified and resubmitted | Rejection reason | Edit, Resubmit |
| `Processed` | Payment execution initiated | Execution records per invoice | Confirm (per payment) |
| `PartiallyProcessed` | Some payments completed, others pending | Per-payment status | Confirm remaining |
| `Completed` | All payments in proposal confirmed | Payment confirmations, bank references | *View only* |

### Transition Table

| From | To | Trigger | Authority | Evidence | Recovery | SLA |
|---|---|---|---|---|---|---|
| — | `Draft` | `PaymentProposalService.create()` | AP Manager | `proposal.created` | Edit freely | — |
| — | `Generated` | `PaymentProposalService.autoGenerate()` ⟳ | System (daily) | `proposal.generated` | — | Daily |
| `Draft` / `Generated` | `Reviewed` | `PaymentProposalService.review()` | AP Manager | `proposal.reviewed` | — | — |
| `Reviewed` | `Approved` | `PaymentProposalService.approve()` | AP Manager [Controller if >$100K] | `proposal.approved` | Reject | 24h |
| `Reviewed` | `Rejected` | `PaymentProposalService.reject()` | AP Manager [Controller if >$100K] | `proposal.rejected` | Modify + resubmit | — |
| `Approved` | `Processed` | `PaymentProposalService.process()` | System ⟳ (on execution) | `proposal.processed` | Retry failed | — |
| `Approved` | `PartiallyProcessed` | Some payments succeed, some fail | System ⟳ | `proposal.partially_processed` | Process remaining | — |
| `Processed` | `Completed` | All payments confirmed | System ⟳ | `proposal.completed` | N/A | — |
| `PartiallyProcessed` | `Completed` | Remaining payments confirmed | System ⟳ | `proposal.completed` | N/A | — |
| `Rejected` | `Reviewed` | `PaymentProposalService.resubmit()` | AP Manager | `proposal.resubmitted` | — | — |

### Terminal States

| State | Characteristics |
|---|---|
| `Completed` | All payments confirmed. GL entries posted. Immutable record. |

### SLA Summary

| Transition | SLA | Escalation | Auto-action |
|---|---|---|---|
| Auto-generate | Daily at 6:00 AM | — | System |
| `Reviewed` → decision | 24 hours | Controller | — |
| `Approved` → `Processed` | Same business day | Treasury | Auto-batch |

---

## 10. Payment Execution

Each individual payment within a proposal has its own lifecycle. Payments may succeed, fail, and require confirmation.

### States

| State | Description | Data Visible | Actions Available |
|---|---|---|---|
| `Pending` | Payment authorized, awaiting execution | Payment details, bank account, method | Execute, Cancel |
| `Processing` | Submitted to bank/payment processor | Submission timestamp, reference | Wait, Retry |
| `Completed` | Bank confirmed receipt | Bank reference, confirmation number | Confirm |
| `Failed` | Bank rejected or timeout | Failure reason, retry count | Retry, Cancel |
| `Confirmed` | GL posting verified, fully settled | GL entry reference, final status | *View only* |
| `Reversed` | Payment reversed (requires Controller approval) | Reversal reason, reversing GL entry | *View only* |
| `Cancelled` | Cancelled before execution | Cancellation reason | *View only* |

### Transition Table

| From | To | Trigger | Authority | Evidence | Recovery | SLA |
|---|---|---|---|---|---|---|
| — | `Pending` | `PaymentService.create()` (from proposal) | System ⟳ | `payment.created` | N/A | — |
| `Pending` | `Processing` | `PaymentService.execute()` | Treasury Analyst | `payment.submitted` | N/A | — |
| `Pending` | `Cancelled` | `PaymentService.cancel()` | AP Manager | `payment.cancelled` | — | — |
| `Processing` | `Completed` | `PaymentService.bankConfirmation()` ⟳ | System (bank callback/poll) | `payment.completed` | — | 48h |
| `Processing` | `Failed` | `PaymentService.bankRejection()` ⟳ | System | `payment.failed` | Retry up to 3x | 48h |
| `Failed` | `Processing` | `PaymentService.retry()` ⟳ (exponential backoff) | System | `payment.retried` | — | 1h/4h/24h |
| `Failed` | `Cancelled` | `PaymentService.cancel()` | Controller | `payment.cancelled` | — | After 3 failures |
| `Completed` | `Confirmed` | `PaymentService.confirm()` ⟳ (GL posting verified) | System | `payment.confirmed` | — | 30 days |
| `Completed` | `Reversed` | `PaymentService.reverse()` | Controller (creates reversing entry) | `payment.reversed` | N/A | — |
| `Confirmed` | `Reversed` | `PaymentService.reverse()` | Controller + CFO (if >$50K) | `payment.reversed` | N/A | — |

### Terminal States

| State | Characteristics |
|---|---|
| `Confirmed` | Payment fully settled with GL posting. Immutable. |
| `Reversed` | Payment reversed with offsetting GL entry. Immutable. |
| `Cancelled` | Never executed. Immutable. |

### Payment Safety Controls

| Control | Mechanism | Failure Mode |
|---|---|---|
| Idempotency | `idempotencyKey` unique constraint | Reject duplicate execution |
| Double-payment | Check `invoiceId` + `status` before create | Block if invoice already has pending/completed payment |
| Velocity | >5 payments to same vendor in 1 day | Alert Controller, hold batch |
| Threshold | Single payment >$100K | Require CFO + Treasury dual approval |
| Confirmation timeout | No bank confirmation within 48h | Auto-retry, then alert Treasury |

### SLA Summary

| Transition | SLA | Escalation | Auto-action |
|---|---|---|---|
| `Pending` → `Processing` | Same business day | Treasury Manager | — |
| `Processing` → `Completed` | 48 hours (bank) | Treasury | Auto-retry |
| `Failed` → retry | 1h / 4h / 24h (exponential) | Treasury | Auto-retry 3x |
| `Completed` → `Confirmed` | 30 days (GL cycle) | Controller | Auto-confirm |

---

## 11. Vendor Credit

Vendor credits (debit notes, credit notes) reduce amounts owed to vendors. They can be applied against outstanding invoices.

### States

| State | Description | Data Visible | Actions Available |
|---|---|---|---|
| `Received` | Credit note received from vendor | Credit amount, vendor, reason, reference | Apply, Void |
| `Applied` | Fully applied against one or more invoices | Application details, invoice references | *View only* |
| `PartiallyApplied` | Partially applied — remaining balance available | Applied amount, remaining balance | Apply remaining, Void |
| `Expired` | Credit note past expiration date | Expiration date, reason | *View only* |
| `Voided` | Credit note voided | Void reason, voiding authority | *View only* |

### Transition Table

| From | To | Trigger | Authority | Evidence | Recovery | SLA |
|---|---|---|---|---|---|---|
| — | `Received` | `VendorCreditService.create()` | AP Clerk | `credit.received` | N/A | — |
| `Received` | `Applied` | `VendorCreditService.apply()` (full amount to invoice) | AP Clerk | `credit.applied` | Void if error | 30 days |
| `Received` | `PartiallyApplied` | `VendorCreditService.applyPartial()` | AP Clerk | `credit.partially_applied` | Apply remaining | 30 days |
| `PartiallyApplied` | `Applied` | `VendorCreditService.applyRemaining()` | AP Clerk | `credit.applied` | N/A | — |
| `Received` | `Expired` | ⟳ (system check on credit expiration date) | System | `credit.expired` | — | — |
| `PartiallyApplied` | `Expired` | ⟳ (remaining balance expires) | System | `credit.expired` | — | — |
| `Received` | `Voided` | `VendorCreditService.void()` | Controller | `credit.voided` | — | — |
| `PartiallyApplied` | `Voided` | `VendorCreditService.void()` (applied portion reverses) | Controller | `credit.voided` | Reverse applied invoices | — |

### Terminal States

| State | Characteristics |
|---|---|
| `Applied` | Fully consumed. Immutable. Reduces AP balance. |
| `Expired` | Past expiration. No longer usable. |
| `Voided` | Cancelled. Any applied amounts reversed. |

---

## 12. Vendor Statement Reconciliation

Periodic reconciliation compares vendor statements against the AP ledger to identify and resolve discrepancies.

### States

| State | Description | Data Visible | Actions Available |
|---|---|---|---|
| `Imported` | Vendor statement uploaded/parsed | Statement lines, vendor, period | Match |
| `Matching` | Auto-matching against AP ledger | Match progress, line-by-line status | Wait |
| `Matched` | All statement lines matched to ledger entries | Match report, zero variance | Reconcile |
| `Discrepancies` | One or more lines unmatched or with variance | Discrepancy details, variance amounts | Adjust, Investigate |
| `Adjusted` | Adjustments posted for discrepancies | Adjustment entries, authority | Reconcile |
| `Reconciled` | Statement fully reconciled with ledger | Reconciliation report, variance = $0 | *View only* |

### Transition Table

| From | To | Trigger | Authority | Evidence | Recovery | SLA |
|---|---|---|---|---|---|---|
| — | `Imported` | `ReconciliationService.import()` | AP Manager | `reconciliation.imported` | Re-import | — |
| `Imported` | `Matching` | `ReconciliationService.match()` ⟳ | System | `reconciliation.matching` | N/A | — |
| `Matching` | `Matched` | Match result: zero variance | System ⟳ | `reconciliation.matched` | N/A | — |
| `Matching` | `Discrepancies` | Match result: variance > $0 | System ⟳ | `reconciliation.discrepancies` | Adjust | Immediate |
| `Discrepancies` | `Adjusted` | `ReconciliationService.adjust()` | AP Clerk (<$50) / AP Manager ($50-$500) / Controller (>$500) | `reconciliation.adjusted` | Re-adjust | 7 days |
| `Discrepancies` | `Matched` | `ReconciliationService.resolveWithoutAdjust()` | AP Manager (if rounding/immaterial) | `reconciliation.resolved` | N/A | — |
| `Adjusted` | `Reconciled` | `ReconciliationService.finalize()` | AP Manager | `reconciliation.reconciled` | N/A | — |
| `Matched` | `Reconciled` | `ReconciliationService.finalize()` | AP Manager | `reconciliation.reconciled` | N/A | — |

### Terminal States

| State | Characteristics |
|---|---|
| `Reconciled` | Statement fully reconciled. Adjustment entries posted to GL. |

### Discrepancy Thresholds

| Variance | Authority | Action |
|---|---|---|
| < $50 | AP Clerk | Auto-resolve with documentation |
| $50 – $500 | AP Manager | Review + approve adjustment |
| > $500 | Controller | Review + approve adjustment + root cause |
| > 10% of vendor balance | CFO alert | Manual investigation required |

### SLA Summary

| Transition | SLA | Escalation | Auto-action |
|---|---|---|---|
| Statement imported → matched | 4 hours (auto) | System | Auto-match |
| Discrepancy → adjustment | 7 days | Controller | — |
| Reconciliation completion | 14 days from import | Controller | Auto-escalate |

---

## Cross-Cutting: Audit Evidence

Every state machine transition produces an immutable audit record:

```typescript
ProcurementAudit {
  id:           String (cuid)
  companyId:    String           // Tenant isolation
  entityType:   String           // "vendor", "pr", "po", "grn", "invoice", "payment", "exception", etc.
  entityId:     String           // ID of the entity that transitioned
  action:       String           // e.g., "invoice.matched", "payment.completed"
  actorId:      String           // User ID or "system" for auto-actions
  actorName:    String?          // Denormalized for display
  changes:      String? @db.Text // JSON { before: {...}, after: {...} }
  metadata:     String? @db.Text // JSON { reason, slaBreached, escalationPath, ... }
  ipAddress:    String?
  createdAt:    DateTime @default(now())  // Append-only
}
```

### Audit Event Categories

| Category | Events | Volume |
|---|---|---|
| Entity lifecycle | `created`, `updated`, `deleted` | Every CRUD |
| State transitions | `submitted`, `validated`, `matched`, `approved`, `scheduled`, `paid`, `closed` | Every state change |
| Authority actions | `approved`, `rejected`, `escalated`, `delegated`, `overridden`, `voided` | Every approval/authority action |
| Exception handling | `exception_created`, `exception_resolved`, `exception_escalated` | Every exception |
| Financial actions | `payment.submitted`, `payment.completed`, `payment.confirmed`, `payment.reversed` | Every payment |
| System actions | `auto_validated`, `auto_matched`, `auto_escalated`, `auto_resolved` | Every automated action |

### Immutability Rules

| Rule | Enforcement |
|---|---|
| No UPDATE on `ProcurementAudit` | Prisma model has no `updatedAt` field |
| No DELETE on `ProcurementAudit` | No delete methods on audit repository |
| No bulk operations | Audit records created one at a time |
| Transactional | Audit record written in same DB transaction as state change |

---

## Cross-Cutting: SLA Enforcement

All SLA deadlines are tracked as `slaDeadline` timestamps on the relevant entity.

### SLA Monitoring Pattern

```
1. On transition TO a timed state:
   - Set entity.slaDeadline = now() + SLA_DURATION
   - Register SLA check in scheduler

2. On SLA check (scheduler tick):
   - If now() > entity.slaDeadline AND entity still in timed state:
     - Auto-escalate to next authority level
     - Write audit event: { action: "auto_escalated", slaBreached: true }
     - Send notification to escalation target

3. On transition OUT of timed state:
   - Cancel SLA check
   - Record actual duration in audit metadata
```

### SLA Defaults

| Entity | Transition | SLA | Escalation Path |
|---|---|---|---|
| Vendor | PendingReview → decision | 48h | Controller |
| Vendor | UnderReview → decision | 72h | Controller |
| PR | Submitted → approval | Per level (24h/48h/72h) | Next level |
| Invoice | Received → Validated | 4h | AP Manager |
| Invoice | Validated → Matched | 2h | System auto-match |
| Invoice | Matched → Approved | 24h | Auto-escalate |
| Invoice | Exception → resolution | 24h | AP Manager → Controller |
| Invoice | Approved → Scheduled | Same day | — |
| Invoice | Disputed → resolution | 30 days | Controller |
| Payment Proposal | Reviewed → decision | 24h | Controller |
| Payment | Processing → Completed | 48h | Treasury |
| Payment | Failed → retry | 1h/4h/24h | Treasury |
| Exception | Open → assigned | 4h | AP Manager |
| Exception | InProgress → resolved | 24h | Controller |
| Reconciliation | Discrepancy → adjusted | 7 days | Controller |

---

## Cross-Cutting: Failure Mode Summary

| Failure Category | Response Pattern | Examples |
|---|---|---|
| **Validation failure** | Block transition, create exception, notify | Bad invoice data, missing fields |
| **Match failure** | Transition to Exception, create exception record | Price/quantity mismatch |
| **Duplicate detected** | Block creation, create HIGH severity exception | Same vendor+invoice# |
| **SLA breach** | Auto-escalate, write audit event, notify | Approval pending too long |
| **Payment failure** | Auto-retry 3x with backoff, then hold + alert | Bank rejection, timeout |
| **GL posting failure** | Hold at current state, retry, alert Controller | Account not found, period closed |
| **Authority unavailable** | Delegate or escalate per delegation rules | Approver on leave |
| **Tenant isolation breach** | Block at repository layer, audit alert | Cross-company access attempt |

---

## Cross-Cutting: Idempotency

| Entity | Idempotency Mechanism | Scope |
|---|---|---|
| Invoice | Unique `(companyId, vendorId, invoiceNumber)` | Prevents duplicate invoice capture |
| Payment | Unique `idempotencyKey` per payment | Prevents double-payment |
| Payment Proposal | Unique `(companyId, proposalNumber)` | Prevents duplicate batch runs |
| Vendor | Unique `(companyId, taxId)` + name similarity check | Prevents duplicate vendor creation |
| GRN | Unique `(companyId, grnNumber)` | Prevents duplicate receipt recording |
| PR | Unique `(companyId, prNumber)` | Prevents duplicate PR creation |
| PO | Unique `(companyId, poNumber)` | Prevents duplicate PO creation |

---

## Cross-Cutting: Entity Relationship Map

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Vendor  │◄────│    PR    │────►│    PO    │────►│   GRN    │
└────┬─────┘     └──────────┘     └────┬─────┘     └────┬─────┘
     │                                  │                 │
     │         ┌──────────┐            │                 │
     └────────►│ Invoice  │◄───────────┘─────────────────┘
               └────┬─────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
  ┌──────────┐ ┌──────────┐ ┌──────────┐
  │ Payment  │ │ Exception│ │  Credit  │
  └────┬─────┘ └──────────┘ └──────────┘
       │
       ▼
  ┌──────────┐     ┌──────────┐
  │ Proposal │     │  Audit   │
  └──────────┘     └──────────┘
       │
       ▼
  ┌────────────────┐
  │  GL Posting    │
  └────────────────┘
```

### Foreign Key Dependencies

| Child | Parent | Required |
|---|---|---|
| `ProcurementPO` | `ProcurementVendor` | Yes |
| `ProcurementPO` | `ProcurementPR` | No (nullable) |
| `ProcurementPOItem` | `ProcurementPO` | Yes |
| `ProcurementGRN` | `ProcurementPO` | Yes |
| `ProcurementGRNItem` | `ProcurementGRN` | Yes |
| `ProcurementGRNItem` | `ProcurementPOItem` | Yes |
| `ProcurementInvoice` | `ProcurementVendor` | Yes |
| `ProcurementInvoice` | `ProcurementPO` | No (nullable for non-PO invoices) |
| `ProcurementInvoiceItem` | `ProcurementInvoice` | Yes |
| `ProcurementInvoiceItem` | `ProcurementPOItem` | No (nullable) |
| `ProcurementPayment` | `ProcurementInvoice` | Yes |
| `ProcurementPayment` | `ProcurementVendor` | Yes |
| `ProcurementPayment` | `ProcurementPaymentProposal` | No (nullable) |
| `ProcurementPaymentItem` | `ProcurementPaymentProposal` | Yes |
| `ProcurementPaymentItem` | `ProcurementInvoice` | Yes |
| `ProcurementException` | `ProcurementVendor` | No (nullable) |

---

## Cross-Cutting: State Machine Implementation Pattern

Based on the existing `OnboardingStateMachine` pattern in `src/modules/onboarding/onboarding-state-machine.ts`, each AP state machine should follow this structure:

```
1. Transition table: Record<State, State[]> (which states can transition to which)
2. canTransition(from, to): boolean
3. transition(entity, toState, metadata): Entity
4. Service layer calls state machine before Prisma update
5. State machine throws on invalid transitions
6. Audit record written in same transaction as state update
```

### Enforceable Invariants

| Invariant | Enforcement Point |
|---|---|
| Invoice must be Matched before Approved | State machine transition table |
| Payment cannot be executed without Approved proposal | State machine transition table |
| Voided/Closed entities are immutable | No outgoing transitions from terminal states |
| Only Controller+ can void | Authority check in transition handler |
| Every transition produces audit record | Transaction wraps state change + audit write |
| Financial amounts use Decimal | Prisma schema (Decimal type) + service layer (financial-precision.ts) |
| companyId required on every query | Repository layer enforces filter |

---

*End of Phase 21A.0 — Accounts Payable State Machine Definitions*
