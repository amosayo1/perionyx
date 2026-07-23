# Phase 21A.0 — Accounts Payable Domain Events

> **Status**: Authoritative — governs all Phase 21A–21D implementation
> **Date**: July 21, 2026
> **Type**: Documentation-only — architecture specification
> **Depends on**: AP_DOMAIN_ARCHITECTURE.md, AP_AGGREGATES.md, AP_STATE_MACHINES.md, ACCOUNTS_PAYABLE_WORKFLOW.md

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Event Mechanism](#2-event-mechanism)
3. [Event Catalog](#3-event-catalog)
4. [Vendor Events](#4-vendor-events)
5. [Invoice Events](#5-invoice-events)
6. [Matching Events](#6-matching-events)
7. [Exception Events](#7-exception-events)
8. [Approval Events](#8-approval-events)
9. [Payment Events](#9-payment-events)
10. [Reconciliation Events](#10-reconciliation-events)
11. [Credit Events](#11-credit-events)
12. [GL Events](#12-gl-events-cross-module)
13. [Notification Events](#13-notification-events-cross-module)
14. [Event Flow Diagrams](#14-event-flow-diagrams)
15. [Event Ordering Rules](#15-event-ordering-rules)
16. [Event Idempotency](#16-event-idempotency)

---

## 1. Design Principles

| # | Principle | Rationale |
|---|---|---|
| 1 | **Domain events are typed function calls** | Governance Constitution: Modular Monolith. No message queue between contexts. Events are synchronous in-process signals, not durable messages. |
| 2 | **Every event produces audit evidence** | Auditability by Default — every state change recorded in immutable audit trail. Events and audit records are dual-emitted. |
| 3 | **Events carry complete context** | Subscribers never need to query the publisher for data. Every event payload is self-contained. |
| 4 | **Past-tense PascalCase naming** | `InvoiceMatched`, `PaymentExecuted` — describes what happened, not what should happen. |
| 5 | **Cross-module events are async** | Intra-AP events fire synchronously. AP → GL, AP → Treasury, AP → Notification events fire asynchronously after the originating transaction commits. |
| 6 | **Events are never the source of truth** | The aggregate entity is the source of truth. Events are notifications of state changes. Any subscriber that needs durable state must persist it. |
| 7 | **Events are idempotent where possible** | Subscribers must tolerate replay. Events carry enough context to detect and handle duplicates. |

---

## 2. Event Mechanism

### 2.1 Architecture

```
Publisher (Domain Service)
    │
    ├──[1] State transition on aggregate (Prisma transaction)
    ├──[2] Emit domain event (typed function call via EventBus)
    ├──[3] Record audit (recordAudit in same transaction)
    │
    ▼
EventBus (in-process, synchronous for intra-AP)
    │
    ├──► Subscriber A (same bounded context)
    ├──► Subscriber B (same bounded context)
    │
    └──► Async wrapper ──► Subscriber X (cross-module: GL, Treasury, Notification)
```

### 2.2 Event Bus

| Property | Value |
|---|---|
| **Type** | In-process typed event bus (not a message queue) |
| **Pattern** | Publish-subscribe with synchronous dispatch |
| **Storage** | None — events are transient signals |
| **Guarantee** | At-most-once delivery within a single request |
| **Persistence** | Events themselves are not persisted. Audit records are persisted. |
| **Cross-module** | Async wrappers delay cross-module handlers until after transaction commit |

### 2.3 Event vs. Audit Record

| Property | Domain Event | Audit Record |
|---|---|---|
| **Purpose** | Notify subscribers of state change | Immutable evidence trail for compliance |
| **Mechanism** | EventBus.emit() | recordAudit() — Prisma write |
| **Storage** | Transient (in-memory) | Persistent (ProcurementAudit table) |
| **Consumers** | Domain services, cross-module handlers | Auditors, compliance officers, UI audit trails |
| **Timing** | During request processing | In same DB transaction as state change |
| **Idempotency** | Best-effort | Guaranteed (append-only) |

### 2.4 Event Payload Contract

Every event payload includes these mandatory fields:

| Field | Type | Description |
|---|---|---|
| `eventId` | `string` (cuid) | Unique event identifier |
| `eventType` | `string` | PascalCase event name |
| `companyId` | `string` | Tenant isolation — every event is company-scoped |
| `timestamp` | `Date` | When the event was emitted |
| `actorId` | `string` | User ID or `"system"` for automated actions |
| `aggregateType` | `string` | Entity type (e.g., `"Invoice"`, `"Vendor"`) |
| `aggregateId` | `string` | Entity ID that triggered the event |

Domain-specific fields follow these mandatory fields.

---

## 3. Event Catalog

### 3.1 Complete Event Index

| # | Event Name | Category | Cross-Module | Async | Audit |
|---|---|---|---|---|---|
| 1 | `VendorCreated` | Vendor | Yes | Yes | Yes |
| 2 | `VendorApproved` | Vendor | Yes | Yes | Yes |
| 3 | `VendorRejected` | Vendor | Yes | Yes | Yes |
| 4 | `VendorSuspended` | Vendor | Yes | Yes | Yes |
| 5 | `VendorDeactivated` | Vendor | Yes | Yes | Yes |
| 6 | `VendorRiskScoreUpdated` | Vendor | Yes | Yes | Yes |
| 7 | `VendorBankDetailChanged` | Vendor | No | No | Yes |
| 8 | `InvoiceReceived` | Invoice | Yes | Yes | Yes |
| 9 | `InvoiceValidated` | Invoice | No | No | Yes |
| 10 | `InvoiceValidationFailed` | Invoice | Yes | Yes | Yes |
| 11 | `InvoiceMatched` | Invoice | No | No | Yes |
| 12 | `InvoiceMismatchDetected` | Invoice | Yes | Yes | Yes |
| 13 | `InvoiceApproved` | Invoice | Yes | Yes | Yes |
| 14 | `InvoiceRejected` | Invoice | Yes | Yes | Yes |
| 15 | `InvoiceEscalated` | Invoice | Yes | Yes | Yes |
| 16 | `InvoiceScheduled` | Invoice | Yes | Yes | Yes |
| 17 | `InvoicePaid` | Invoice | Yes | Yes | Yes |
| 18 | `InvoiceClosed` | Invoice | No | No | Yes |
| 19 | `InvoiceDisputed` | Invoice | Yes | Yes | Yes |
| 20 | `InvoiceBlocked` | Invoice | Yes | Yes | Yes |
| 21 | `InvoiceVoided` | Invoice | Yes | Yes | Yes |
| 22 | `DuplicateInvoiceDetected` | Invoice | Yes | Yes | Yes |
| 23 | `ThreeWayMatchInitiated` | Matching | No | No | Yes |
| 24 | `ThreeWayMatchCompleted` | Matching | No | No | Yes |
| 25 | `ThreeWayMatchFailed` | Matching | Yes | Yes | Yes |
| 26 | `MatchOverrideRecorded` | Matching | No | No | Yes |
| 27 | `MatchExceptionCreated` | Matching | Yes | Yes | Yes |
| 28 | `ExceptionCreated` | Exception | Yes | Yes | Yes |
| 29 | `ExceptionAssigned` | Exception | Yes | Yes | Yes |
| 30 | `ExceptionResolved` | Exception | Yes | Yes | Yes |
| 31 | `ExceptionEscalated` | Exception | Yes | Yes | Yes |
| 32 | `ExceptionAutoResolved` | Exception | No | No | Yes |
| 33 | `ExceptionPatternDetected` | Exception | Yes | Yes | Yes |
| 34 | `ApprovalRequested` | Approval | Yes | Yes | Yes |
| 35 | `ApprovalGranted` | Approval | Yes | Yes | Yes |
| 36 | `ApprovalDenied` | Approval | Yes | Yes | Yes |
| 37 | `ApprovalDelegated` | Approval | No | No | Yes |
| 38 | `ApprovalEscalated` | Approval | Yes | Yes | Yes |
| 39 | `ApprovalTimedOut` | Approval | Yes | Yes | Yes |
| 40 | `ApprovalChainCompleted` | Approval | Yes | Yes | Yes |
| 41 | `PaymentProposalGenerated` | Payment | Yes | Yes | Yes |
| 42 | `PaymentProposalApproved` | Payment | Yes | Yes | Yes |
| 43 | `PaymentProposalRejected` | Payment | No | No | Yes |
| 44 | `PaymentBatchCreated` | Payment | Yes | Yes | Yes |
| 45 | `PaymentExecuted` | Payment | Yes | Yes | Yes |
| 46 | `PaymentConfirmed` | Payment | Yes | Yes | Yes |
| 47 | `PaymentFailed` | Payment | Yes | Yes | Yes |
| 48 | `PaymentReversed` | Payment | Yes | Yes | Yes |
| 49 | `DuplicatePaymentBlocked` | Payment | Yes | Yes | Yes |
| 50 | `VendorStatementImported` | Reconciliation | No | No | Yes |
| 51 | `ReconciliationMatched` | Reconciliation | No | No | Yes |
| 52 | `ReconciliationDiscrepancyFound` | Reconciliation | Yes | Yes | Yes |
| 53 | `ReconciliationAdjusted` | Reconciliation | No | No | Yes |
| 54 | `ReconciliationCompleted` | Reconciliation | Yes | Yes | Yes |
| 55 | `CreditNoteReceived` | Credit | Yes | Yes | Yes |
| 56 | `CreditNoteApplied` | Credit | No | No | Yes |
| 57 | `CreditNotePartiallyApplied` | Credit | No | No | Yes |
| 58 | `CreditNoteExpired` | Credit | No | No | Yes |
| 59 | `GLJournalEntryRequested` | GL | Yes | Yes | Yes |
| 60 | `GLJournalEntryPosted` | GL | Yes | Yes | Yes |
| 61 | `GLJournalEntryFailed` | GL | Yes | Yes | Yes |
| 62 | `APNotificationRequested` | Notification | Yes | Yes | No |
| 63 | `APAutoEscalationTriggered` | Notification | Yes | Yes | Yes |

**Total: 63 domain events**

### 3.2 Event Counts by Category

| Category | Count | Cross-Module | Intra-Module |
|---|---|---|---|
| Vendor | 7 | 6 | 1 |
| Invoice | 15 | 12 | 3 |
| Matching | 5 | 2 | 3 |
| Exception | 6 | 4 | 2 |
| Approval | 7 | 5 | 2 |
| Payment | 9 | 8 | 1 |
| Reconciliation | 5 | 2 | 3 |
| Credit | 4 | 1 | 3 |
| GL | 3 | 3 | 0 |
| Notification | 2 | 2 | 0 |
| **Total** | **63** | **45** | **18** |

---

## 4. Vendor Events

### 4.1 VendorCreated

| Field | Value |
|---|---|
| **Event Name** | `VendorCreated` |
| **Trigger** | `VendorService.create()` — AP Clerk submits new vendor for review |
| **Publisher** | `VendorService` (domain aggregate: `Vendor`) |
| **Subscribers** | Intelligence Context (duplicate scan), Notification Context (AP Manager alert) |
| **Payload** | `vendorId: string`, `vendorCode: string`, `companyId: string`, `vendorName: string`, `taxId: string`, `category: VendorCategory`, `requestedBy: string`, `requestedAt: Date` |
| **Audit** | Yes — `recordAudit('vendor.created', { vendorId, requestedBy, category, taxCountry })` |
| **Cross-Module** | Yes — Intelligence (duplicate scan), Notification (AP Manager alert) |
| **Async** | Yes — fired after vendor creation transaction commits |

### 4.2 VendorApproved

| Field | Value |
|---|---|
| **Event Name** | `VendorApproved` |
| **Trigger** | `VendorService.approve()` — Procurement Manager or Controller approves vendor |
| **Publisher** | `VendorService` |
| **Subscribers** | Notification Context (requester notification), Intelligence Context (risk model update) |
| **Payload** | `vendorId: string`, `companyId: string`, `vendorName: string`, `approvedBy: string`, `riskScore: Decimal`, `riskLevel: RiskLevel`, `paymentTerms: string`, `creditLimit: Decimal` |
| **Audit** | Yes — `recordAudit('vendor.approved', { vendorId, approvedBy, riskLevel, riskScore })` |
| **Cross-Module** | Yes — Notification (requester notification) |
| **Async** | Yes |

### 4.3 VendorRejected

| Field | Value |
|---|---|
| **Event Name** | `VendorRejected` |
| **Trigger** | `VendorService.reject()` — Reviewer rejects vendor application |
| **Publisher** | `VendorService` |
| **Subscribers** | Notification Context (requester notification with reason) |
| **Payload** | `vendorId: string`, `companyId: string`, `vendorName: string`, `rejectedBy: string`, `reason: string`, `rejectionCategory: RejectionCategory` |
| **Audit** | Yes — `recordAudit('vendor.rejected', { vendorId, rejectedBy, reason })` |
| **Cross-Module** | Yes — Notification |
| **Async** | Yes |

### 4.4 VendorSuspended

| Field | Value |
|---|---|
| **Event Name** | `VendorSuspended` |
| **Trigger** | `VendorService.suspend()` — AP Manager suspends vendor (expired docs, compliance, risk) |
| **Publisher** | `VendorService` |
| **Subscribers** | Notification Context (AP Manager, Procurement), Procurement Context (block new POs) |
| **Payload** | `vendorId: string`, `companyId: string`, `vendorName: string`, `suspendedBy: string`, `reason: string`, `suspensionType: SuspensionType`, `existingPoCount: number`, `openInvoiceCount: number` |
| **Audit** | Yes — `recordAudit('vendor.suspended', { vendorId, suspendedBy, reason })` |
| **Cross-Module** | Yes — Notification, Procurement |
| **Async** | Yes |

### 4.5 VendorDeactivated

| Field | Value |
|---|---|
| **Event Name** | `VendorDeactivated` |
| **Trigger** | `VendorService.deactivate()` — Controller permanently deactivates vendor |
| **Publisher** | `VendorService` |
| **Subscribers** | Notification Context, Procurement Context (block all references) |
| **Payload** | `vendorId: string`, `companyId: string`, `vendorName: string`, `deactivatedBy: string`, `reason: string`, `openInvoiceCount: number`, `outstandingBalance: Decimal` |
| **Audit** | Yes — `recordAudit('vendor.deactivated', { vendorId, deactivatedBy, reason, openInvoiceCount })` |
| **Cross-Module** | Yes — Notification, Procurement |
| **Async** | Yes |

### 4.6 VendorRiskScoreUpdated

| Field | Value |
|---|---|
| **Event Name** | `VendorRiskScoreUpdated` |
| **Trigger** | `VendorService.updateRiskScore()` — Intelligence Context or manual reassessment updates risk |
| **Publisher** | `VendorService` |
| **Subscribers** | Intelligence Context (model feedback), Notification Context (if risk crosses threshold) |
| **Payload** | `vendorId: string`, `companyId: string`, `previousScore: Decimal`, `newScore: Decimal`, `previousLevel: RiskLevel`, `newLevel: RiskLevel`, `triggerSource: RiskUpdateSource`, `factors: RiskFactor[]` |
| **Audit** | Yes — `recordAudit('vendor.risk_updated', { vendorId, previousScore, newScore, triggerSource })` |
| **Cross-Module** | Yes — Intelligence, Notification (if risk crosses ≥80 threshold) |
| **Async** | Yes |

### 4.7 VendorBankDetailChanged

| Field | Value |
|---|---|
| **Event Name** | `VendorBankDetailChanged` |
| **Trigger** | `VendorService.updateBankDetails()` — Vendor or AP Clerk updates bank account |
| **Publisher** | `VendorService` |
| **Subscribers** | Audit Context (sensitive data change), Notification Context (Controller alert for high-risk vendors) |
| **Payload** | `vendorId: string`, `companyId: string`, `updatedBy: string`, `previousBankLast4: string`, `newBankLast4: string`, `previousBankName: string`, `newBankName: string`, `requiresVerification: boolean` |
| **Audit** | Yes — `recordAudit('vendor.bank_updated', { vendorId, updatedBy, previousBankLast4, newBankLast4 })` |
| **Cross-Module** | No — intra-AP audit and notification only |
| **Async** | No — synchronous to ensure audit record is in same transaction |

---

## 5. Invoice Events

### 5.1 InvoiceReceived

| Field | Value |
|---|---|
| **Event Name** | `InvoiceReceived` |
| **Trigger** | `InvoiceService.create()` — AP Clerk captures invoice (manual, OCR, or EDI) |
| **Publisher** | `InvoiceService` (domain aggregate: `VendorInvoice`) |
| **Subscribers** | Intelligence Context (duplicate detection), Exception Service (credit limit check) |
| **Payload** | `invoiceId: string`, `companyId: string`, `vendorId: string`, `vendorName: string`, `invoiceNumber: string`, `totalAmount: Decimal`, `taxAmount: Decimal`, `currency: string`, `invoiceDate: Date`, `dueDate: Date`, `lineItemCount: number`, `source: InvoiceSource`, `capturedBy: string` |
| **Audit** | Yes — `recordAudit('invoice.captured', { invoiceId, vendorId, amount, currency, source, capturedBy })` |
| **Cross-Module** | Yes — Intelligence (duplicate scan), Exception (credit limit check) |
| **Async** | Yes — fired after invoice creation transaction commits |

### 5.2 InvoiceValidated

| Field | Value |
|---|---|
| **Event Name** | `InvoiceValidated` |
| **Trigger** | `InvoiceService.validate()` — automated validation passes all checks |
| **Publisher** | `InvoiceService` |
| **Subscribers** | InvoiceMatchingService (trigger match) |
| **Payload** | `invoiceId: string`, `companyId: string`, `vendorId: string`, `totalAmount: Decimal`, `validationResult: ValidationResult`, `warnings: ValidationWarning[]`, `validatedAt: Date` |
| **Audit** | Yes — `recordAudit('invoice.validated', { invoiceId, result, validationErrors: [], warnings })` |
| **Cross-Module** | No — intra-AP; triggers matching within same context |
| **Async** | No — synchronous so matching can execute in same request |

### 5.3 InvoiceValidationFailed

| Field | Value |
|---|---|
| **Event Name** | `InvoiceValidationFailed` |
| **Trigger** | `InvoiceService.validate()` — validation finds blocking errors |
| **Publisher** | `InvoiceService` |
| **Subscribers** | Exception Service (create validation exception), Notification Context (AP Clerk alert) |
| **Payload** | `invoiceId: string`, `companyId: string`, `vendorId: string`, `totalAmount: Decimal`, `errors: ValidationError[]`, `warnings: ValidationWarning[]`, `failedAt: Date` |
| **Audit** | Yes — `recordAudit('invoice.validation_failed', { invoiceId, errors })` |
| **Cross-Module** | Yes — Notification (AP Clerk alert) |
| **Async** | Yes |

### 5.4 InvoiceMatched

| Field | Value |
|---|---|
| **Event Name** | `InvoiceMatched` |
| **Trigger** | `InvoiceMatchingService.performMatch()` — 2-way or 3-way match passes all tolerance checks |
| **Publisher** | `InvoiceMatchingService` |
| **Subscribers** | Approval Service (initiate approval chain) |
| **Payload** | `invoiceId: string`, `companyId: string`, `matchResultId: string`, `matchType: MatchType` (`two_way` / `three_way`), `matchScore: Decimal`, `matchedAmount: Decimal`, `poIds: string[]`, `grnIds: string[]`, `allWithinTolerance: boolean`, `lineItemResults: MatchLineItemResult[]` |
| **Audit** | Yes — `recordAudit('invoice.matched', { invoiceId, matchType, matchId, result, variances })` |
| **Cross-Module** | No — triggers approval within AP |
| **Async** | No — synchronous so approval chain can be created in same request |

### 5.5 InvoiceMismatchDetected

| Field | Value |
|---|---|
| **Event Name** | `InvoiceMismatchDetected` |
| **Trigger** | `InvoiceMatchingService.performMatch()` — one or more dimensions exceed tolerance |
| **Publisher** | `InvoiceMatchingService` |
| **Subscribers** | Exception Service (create match exception), Notification Context (AP Clerk alert) |
| **Payload** | `invoiceId: string`, `companyId: string`, `matchResultId: string`, `matchType: MatchType`, `variances: MatchVariance[]`, `totalVarianceAmount: Decimal`, `highestSeverity: ExceptionSeverity`, `poIds: string[]`, `grnIds: string[]` |
| **Audit** | Yes — `recordAudit('invoice.match.exception', { invoiceId, exceptionId, type, variance })` |
| **Cross-Module** | Yes — Notification (AP Clerk alert on HIGH/CRITICAL severity) |
| **Async** | Yes |

### 5.6 InvoiceApproved

| Field | Value |
|---|---|
| **Event Name** | `InvoiceApproved` |
| **Trigger** | `ApprovalService.decide()` — final approval level grants approval |
| **Publisher** | `ApprovalService` |
| **Subscribers** | Payment Service (eligible for proposal), Notification Context (AP Clerk, requester) |
| **Payload** | `invoiceId: string`, `companyId: string`, `vendorId: string`, `totalAmount: Decimal`, `currency: string`, `approvedBy: string`, `approvalLevel: number`, `approvalChainId: string`, `totalLevels: number`, `approvalDuration: number` (ms), `autoApproved: boolean` |
| **Audit** | Yes — `recordAudit('invoice.approval.decided', { invoiceId, level, decision: 'approved', reason, delegatedFrom? })` |
| **Cross-Module** | Yes — Notification (AP Clerk, requester), Payment (proposal eligible) |
| **Async** | Yes |

### 5.7 InvoiceRejected

| Field | Value |
|---|---|
| **Event Name** | `InvoiceRejected` |
| **Trigger** | `ApprovalService.decide()` — any approval level rejects |
| **Publisher** | `ApprovalService` |
| **Subscribers** | Exception Service (create rejection exception), Notification Context (AP Clerk) |
| **Payload** | `invoiceId: string`, `companyId: string`, `vendorId: string`, `totalAmount: Decimal`, `rejectedBy: string`, `rejectedAtLevel: number`, `reason: string`, `approvalChainId: string` |
| **Audit** | Yes — `recordAudit('invoice.approval.decided', { invoiceId, level: rejectedAtLevel, decision: 'rejected', reason })` |
| **Cross-Module** | Yes — Notification (AP Clerk), Exception (create resolution task) |
| **Async** | Yes |

### 5.8 InvoiceEscalated

| Field | Value |
|---|---|
| **Event Name** | `InvoiceEscalated` |
| **Trigger** | SLA breach on approval level, or manual escalation by approver |
| **Publisher** | `ApprovalService` |
| **Subscribers** | Notification Context (escalation target), Exception Service (track escalation) |
| **Payload** | `invoiceId: string`, `companyId: string`, `escalatedFrom: string` (previous approver userId), `escalatedTo: string` (next approver userId), `escalatedAtLevel: number`, `reason: string`, `slaBreached: boolean`, `previousSlaDeadline: Date` |
| **Audit** | Yes — `recordAudit('approval.escalated', { chainId, level, reason, escalatedTo })` |
| **Cross-Module** | Yes — Notification (escalation target) |
| **Async** | Yes |

### 5.9 InvoiceScheduled

| Field | Value |
|---|---|
| **Event Name** | `InvoiceScheduled` |
| **Trigger** | `PaymentProposalService.addInvoice()` — invoice included in approved payment proposal |
| **Publisher** | `PaymentProposalService` |
| **Subscribers** | Notification Context (AP Manager, Treasury), AP Aging Service (update aging) |
| **Payload** | `invoiceId: string`, `companyId: string`, `vendorId: string`, `totalAmount: Decimal`, `proposalId: string`, `proposalNumber: string`, `scheduledPaymentDate: Date`, `paymentMethod: PaymentMethod`, `discountAmount: Decimal`, `netAmount: Decimal` |
| **Audit** | Yes — `recordAudit('invoice.payment.scheduled', { invoiceId, proposalId, scheduledDate })` |
| **Cross-Module** | Yes — Notification (Treasury for cash planning) |
| **Async** | Yes |

### 5.10 InvoicePaid

| Field | Value |
|---|---|
| **Event Name** | `InvoicePaid` |
| **Trigger** | `PaymentService.confirm()` — bank confirms payment received |
| **Publisher** | `PaymentService` |
| **Subscribers** | GL Integration (post journal entry), Notification Context (AP Clerk, requester), Reconciliation Service |
| **Payload** | `invoiceId: string`, `companyId: string`, `vendorId: string`, `paymentId: string`, `paymentNumber: string`, `amount: Decimal`, `currency: string`, `method: PaymentMethod`, `bankReference: string`, `paidAt: Date`, `discountApplied: Decimal`, `netAmountPaid: Decimal` |
| **Audit** | Yes — `recordAudit('invoice.payment.confirmed', { invoiceId, paymentId, bankReference, amount })` |
| **Cross-Module** | Yes — GL (post entry), Notification (AP Clerk, requester) |
| **Async** | Yes |

### 5.11 InvoiceClosed

| Field | Value |
|---|---|
| **Event Name** | `InvoiceClosed` |
| **Trigger** | `InvoiceService.close()` — GL posting confirmed, invoice fully settled |
| **Publisher** | `InvoiceService` |
| **Subscribers** | AP Analytics Service (update metrics), AP Aging Service (remove from aging) |
| **Payload** | `invoiceId: string`, `companyId: string`, `vendorId: string`, `totalAmount: Decimal`, `totalPaid: Decimal`, `glEntryIds: string[]`, `closedAt: Date`, `lifecycleDuration: number` (days from capture to close) |
| **Audit** | Yes — `recordAudit('invoice.closed', { invoiceId, glEntryIds, lifecycleDuration })` |
| **Cross-Module** | No — intra-AP analytics update |
| **Async** | No — synchronous finalization |

### 5.12 InvoiceDisputed

| Field | Value |
|---|---|
| **Event Name** | `InvoiceDisputed` |
| **Trigger** | `InvoiceService.dispute()` — AP Clerk or vendor raises dispute |
| **Publisher** | `InvoiceService` |
| **Subscribers** | Exception Service (create dispute exception), Notification Context (AP Manager, vendor contact) |
| **Payload** | `invoiceId: string`, `companyId: string`, `vendorId: string`, `totalAmount: Decimal`, `disputedBy: string`, `disputeType: DisputeType`, `disputeReason: string`, `disputedAmount: Decimal`, `disputedAt: Date` |
| **Audit** | Yes — `recordAudit('invoice.disputed', { invoiceId, disputeReason, disputedBy })` |
| **Cross-Module** | Yes — Notification (AP Manager, vendor) |
| **Async** | Yes |

### 5.13 InvoiceBlocked

| Field | Value |
|---|---|
| **Event Name** | `InvoiceBlocked` |
| **Trigger** | `InvoiceService.block()` — compliance hold, fraud flag, or investigation |
| **Publisher** | `InvoiceService` |
| **Subscribers** | Notification Context (Controller, compliance), Exception Service (investigation task) |
| **Payload** | `invoiceId: string`, `companyId: string`, `vendorId: string`, `totalAmount: Decimal`, `blockedBy: string`, `blockReason: string`, `blockCategory: BlockCategory`, `requiresUnblockApproval: boolean` |
| **Audit** | Yes — `recordAudit('invoice.blocked', { invoiceId, blockedBy, blockReason })` |
| **Cross-Module** | Yes — Notification (Controller, compliance) |
| **Async** | Yes |

### 5.14 InvoiceVoided

| Field | Value |
|---|---|
| **Event Name** | `InvoiceVoided` |
| **Trigger** | `InvoiceService.void()` — Controller voids invoice before payment or after investigation |
| **Publisher** | `InvoiceService` |
| **Subscribers** | GL Integration (reverse any posted entries), Notification Context (AP Clerk, vendor), Exception Service (close related exceptions) |
| **Payload** | `invoiceId: string`, `companyId: string`, `vendorId: string`, `totalAmount: Decimal`, `voidedBy: string`, `reason: string`, `voidCategory: VoidCategory`, `paymentReversalRequired: boolean`, `glReversalRequired: boolean` |
| **Audit** | Yes — `recordAudit('invoice.voided', { invoiceId, reason, cancelledBy, refundRequired })` |
| **Cross-Module** | Yes — GL (reverse entries), Notification, Exception (close) |
| **Async** | Yes |

### 5.15 DuplicateInvoiceDetected

| Field | Value |
|---|---|
| **Event Name** | `DuplicateInvoiceDetected` |
| **Trigger** | Intelligence Context or `InvoiceService.duplicateCheck()` finds matching invoice |
| **Publisher** | `InvoiceService` |
| **Subscribers** | Exception Service (create HIGH severity duplicate exception), Notification Context (AP Manager) |
| **Payload** | `invoiceId: string` (new), `companyId: string`, `existingInvoiceId: string` (existing duplicate), `vendorId: string`, `vendorName: string`, `invoiceNumber: string`, `matchConfidence: Decimal`, `matchType: DuplicateMatchType` (`exact` / `fuzzy` / `amount_only`), `newAmount: Decimal`, `existingAmount: Decimal`, `duplicateFactors: string[]` |
| **Audit** | Yes — `recordAudit('invoice.duplicate_detected', { invoiceId, existingInvoiceId, matchConfidence, matchType })` |
| **Cross-Module** | Yes — Exception (HIGH severity), Notification (AP Manager) |
| **Async** | Yes |

---

## 6. Matching Events

### 6.1 ThreeWayMatchInitiated

| Field | Value |
|---|---|
| **Event Name** | `ThreeWayMatchInitiated` |
| **Trigger** | `InvoiceMatchingService.performMatch()` — match engine starts comparing Invoice ↔ PO ↔ GRN |
| **Publisher** | `InvoiceMatchingService` |
| **Subscribers** | Audit Context (match audit trail) |
| **Payload** | `matchResultId: string`, `invoiceId: string`, `companyId: string`, `matchType: MatchType`, `poIds: string[]`, `grnIds: string[]`, `lineItemCount: number`, `initiatedBy: string` (or `"system"`) |
| **Audit** | Yes — `recordAudit('match.initiated', { matchId, invoiceId, matchType, lineItemCount })` |
| **Cross-Module** | No — intra-AP audit trail |
| **Async** | No — synchronous, fires at start of match execution |

### 6.2 ThreeWayMatchCompleted

| Field | Value |
|---|---|
| **Event Name** | `ThreeWayMatchCompleted` |
| **Trigger** | `InvoiceMatchingService.performMatch()` — all line items compared, result is PASS |
| **Publisher** | `InvoiceMatchingService` |
| **Subscribers** | InvoiceService (transition to Matched state), Approval Service (initiate approval chain) |
| **Payload** | `matchResultId: string`, `invoiceId: string`, `companyId: string`, `matchType: MatchType`, `totalMatchAmount: Decimal`, `matchedLineItems: number`, `exceptionLineItems: number`, `overallVariance: Decimal`, `withinTolerance: boolean`, `completedAt: Date` |
| **Audit** | Yes — `recordAudit('match.executed', { matchId, invoiceId, matchType, result: 'matched', lineItemCount, matchedCount, exceptionCount })` |
| **Cross-Module** | No — triggers invoice state transition and approval within AP |
| **Async** | No — synchronous |

### 6.3 ThreeWayMatchFailed

| Field | Value |
|---|---|
| **Event Name** | `ThreeWayMatchFailed` |
| **Trigger** | `InvoiceMatchingService.performMatch()` — one or more dimensions exceed tolerance |
| **Publisher** | `InvoiceMatchingService` |
| **Subscribers** | Exception Service (create match exception), Notification Context (AP Clerk) |
| **Payload** | `matchResultId: string`, `invoiceId: string`, `companyId: string`, `matchType: MatchType`, `variances: MatchVariance[]`, `totalVarianceAmount: Decimal`, `failedLineItems: number`, `highestSeverity: ExceptionSeverity`, `completedAt: Date` |
| **Audit** | Yes — `recordAudit('match.executed', { matchId, invoiceId, matchType, result: 'exception', matchedCount, exceptionCount })` |
| **Cross-Module** | Yes — Notification (AP Clerk on CRITICAL severity) |
| **Async** | Yes |

### 6.4 MatchOverrideRecorded

| Field | Value |
|---|---|
| **Event Name** | `MatchOverrideRecorded` |
| **Trigger** | `InvoiceMatchingService.overrideMatch()` — AP Manager forces match despite variance |
| **Publisher** | `InvoiceMatchingService` |
| **Subscribers** | InvoiceService (transition to Matched state), Approval Service (initiate approval chain) |
| **Payload** | `matchResultId: string`, `invoiceId: string`, `companyId: string`, `overrideBy: string`, `reason: string`, `originalVariance: Decimal`, `overriddenVariance: Decimal`, `approvalRequired: boolean`, `overrideAuthority: string` |
| **Audit** | Yes — `recordAudit('match.override', { matchId, overrideBy, reason, originalVariance, overrideVariance })` |
| **Cross-Module** | No — intra-AP |
| **Async** | No — synchronous |

### 6.5 MatchExceptionCreated

| Field | Value |
|---|---|
| **Event Name** | `MatchExceptionCreated` |
| **Trigger** | `ExceptionService.create()` — match failure creates exception record |
| **Publisher** | `ExceptionService` |
| **Subscribers** | Notification Context (AP Clerk assignment), SLA Monitor (start SLA timer) |
| **Payload** | `exceptionId: string`, `invoiceId: string`, `companyId: string`, `matchResultId: string`, `exceptionType: ExceptionType`, `severity: ExceptionSeverity`, `varianceAmount: Decimal`, `slaDeadline: Date`, `assignedTo: string` |
| **Audit** | Yes — `recordAudit('exception.created', { exceptionId, invoiceId, type, severity, varianceAmount, slaDeadline })` |
| **Cross-Module** | Yes — Notification (AP Clerk), SLA Monitor |
| **Async** | Yes |

---

## 7. Exception Events

### 7.1 ExceptionCreated

| Field | Value |
|---|---|
| **Event Name** | `ExceptionCreated` |
| **Trigger** | `ExceptionService.create()` — any failure creates an exception (match, validation, duplicate, credit limit, tax mismatch) |
| **Publisher** | `ExceptionService` (domain aggregate: `InvoiceException`) |
| **Subscribers** | Notification Context (AP Clerk), SLA Monitor (start timer), Analytics Service (update exception metrics) |
| **Payload** | `exceptionId: string`, `invoiceId: string`, `companyId: string`, `vendorId: string`, `exceptionType: ExceptionType`, `severity: ExceptionSeverity`, `varianceAmount: Decimal`, `description: string`, `slaDeadline: Date`, `autoAssignedTo: string`, `createdAt: Date` |
| **Audit** | Yes — `recordAudit('exception.created', { exceptionId, invoiceId, type, severity, varianceAmount, slaDeadline })` |
| **Cross-Module** | Yes — Notification (AP Clerk), SLA Monitor |
| **Async** | Yes |

### 7.2 ExceptionAssigned

| Field | Value |
|---|---|
| **Event Name** | `ExceptionAssigned` |
| **Trigger** | `ExceptionService.assign()` — AP Manager assigns to AP Clerk by expertise/type |
| **Publisher** | `ExceptionService` |
| **Subscribers** | Notification Context (assigned AP Clerk), SLA Monitor (reset SLA for new assignee) |
| **Payload** | `exceptionId: string`, `invoiceId: string`, `companyId: string`, `assignedTo: string`, `assignedToName: string`, `assignedBy: string`, `exceptionType: ExceptionType`, `severity: ExceptionSeverity` |
| **Audit** | Yes — `recordAudit('exception.assigned', { exceptionId, assignedTo, assignedBy })` |
| **Cross-Module** | Yes — Notification (AP Clerk) |
| **Async** | Yes |

### 7.3 ExceptionResolved

| Field | Value |
|---|---|
| **Event Name** | `ExceptionResolved` |
| **Trigger** | `ExceptionService.resolve()` — AP Clerk or Manager resolves exception with corrective action |
| **Publisher** | `ExceptionService` |
| **Subscribers** | InvoiceService (proceed in lifecycle), Notification Context (AP Manager for verification), Analytics Service (update resolution metrics) |
| **Payload** | `exceptionId: string`, `invoiceId: string`, `companyId: string`, `resolution: string`, `resolutionAction: ResolutionAction`, `resolutionAmount: Decimal`, `resolvedBy: string`, `resolvedAt: Date`, `resolutionDuration: number` (ms from creation), `slaMet: boolean` |
| **Audit** | Yes — `recordAudit('exception.resolved', { exceptionId, resolution, resolutionAction, resolvedBy, resolutionAmount })` |
| **Cross-Module** | Yes — Notification (AP Manager for verification) |
| **Async** | Yes |

### 7.4 ExceptionEscalated

| Field | Value |
|---|---|
| **Event Name** | `ExceptionEscalated` |
| **Trigger** | `ExceptionService.escalate()` — SLA breach or manual escalation to higher authority |
| **Publisher** | `ExceptionService` |
| **Subscribers** | Notification Context (escalation target), SLA Monitor (new SLA timer for escalation level) |
| **Payload** | `exceptionId: string`, `invoiceId: string`, `companyId: string`, `escalatedTo: string`, `escalatedToName: string`, `escalatedBy: string` (or `"system"` for auto), `reason: string`, `slaBreached: boolean`, `previousSlaDeadline: Date`, `newSlaDeadline: Date`, `escalationLevel: number` |
| **Audit** | Yes — `recordAudit('exception.escalated', { exceptionId, escalatedTo, reason, slaBreached })` |
| **Cross-Module** | Yes — Notification (escalation target) |
| **Async** | Yes |

### 7.5 ExceptionAutoResolved

| Field | Value |
|---|---|
| **Event Name** | `ExceptionAutoResolved` |
| **Trigger** | `ExceptionService.autoResolve()` — system pattern-matching resolves from historical data |
| **Publisher** | `ExceptionService` |
| **Subscribers** | InvoiceService (proceed in lifecycle), Analytics Service (track auto-resolution rate) |
| **Payload** | `exceptionId: string`, `invoiceId: string`, `companyId: string`, `patternId: string`, `patternDescription: string`, `confidence: Decimal`, `resolutionAction: ResolutionAction`, `resolvedAt: Date`, `similarExceptionIds: string[]` |
| **Audit** | Yes — `recordAudit('exception.auto_resolved', { exceptionId, patternId, confidence, resolutionAction })` |
| **Cross-Module** | No — intra-AP |
| **Async** | No — synchronous auto-resolution |

### 7.6 ExceptionPatternDetected

| Field | Value |
|---|---|
| **Event Name** | `ExceptionPatternDetected` |
| **Trigger** | `ExceptionPatterns.detectRecurringPattern()` — system detects recurring exception pattern across multiple invoices |
| **Publisher** | `ExceptionPatterns` |
| **Subscribers** | Intelligence Context (model training), Notification Context (AP Manager, Controller), Analytics Service (pattern metrics) |
| **Payload** | `patternId: string`, `companyId: string`, `patternType: PatternType`, `description: string`, `affectedVendorIds: string[]`, `affectedInvoiceCount: number`, `totalVarianceAmount: Decimal`, `dateRange: { from: Date, to: Date }`, `recommendedAction: string`, `confidence: Decimal` |
| **Audit** | Yes — `recordAudit('exception.pattern_detected', { patternId, patternType, affectedInvoiceCount, totalVarianceAmount })` |
| **Cross-Module** | Yes — Intelligence (model feedback), Notification (AP Manager, Controller) |
| **Async** | Yes |

---

## 8. Approval Events

### 8.1 ApprovalRequested

| Field | Value |
|---|---|
| **Event Name** | `ApprovalRequested` |
| **Trigger** | `ApprovalService.create()` — invoice submitted for approval after matching |
| **Publisher** | `ApprovalService` (domain aggregate: `ApprovalChain`) |
| **Subscribers** | Notification Context (first-level approver), SLA Monitor (start SLA timer) |
| **Payload** | `approvalChainId: string`, `invoiceId: string`, `companyId: string`, `vendorId: string`, `totalAmount: Decimal`, `currency: string`, `requiredLevels: number`, `firstApproverId: string`, `firstApproverName: string`, `slaDeadline: Date`, `submittedBy: string` |
| **Audit** | Yes — `recordAudit('approval.created', { chainId, invoiceId, levels, totalAmount })` |
| **Cross-Module** | Yes — Notification (first approver), SLA Monitor |
| **Async** | Yes |

### 8.2 ApprovalGranted

| Field | Value |
|---|---|
| **Event Name** | `ApprovalGranted` |
| **Trigger** | `ApprovalService.decide()` — individual approval level grants approval |
| **Publisher** | `ApprovalService` |
| **Subscribers** | Notification Context (next approver or AP Clerk if final), Approval Chain (advance chain) |
| **Payload** | `approvalChainId: string`, `invoiceId: string`, `companyId: string`, `level: number`, `approverId: string`, `approverName: string`, `decision: 'approved'`, `comments: string`, `isDelegated: boolean`, `delegatedFrom: string`, `isAutomated: boolean`, `decidedAt: Date`, `authorityLimit: Decimal` |
| **Audit** | Yes — `recordAudit('approval.level.decided', { chainId, level, decision: 'approved', reason: comments, delegatedFrom?, isAutomated? })` |
| **Cross-Module** | No — intra-AP (next approver is within AP) |
| **Async** | No — synchronous to advance chain |

### 8.3 ApprovalDenied

| Field | Value |
|---|---|
| **Event Name** | `ApprovalDenied` |
| **Trigger** | `ApprovalService.decide()` — any approval level rejects |
| **Publisher** | `ApprovalService` |
| **Subscribers** | Notification Context (AP Clerk, previous approvers), InvoiceService (transition to Rejected) |
| **Payload** | `approvalChainId: string`, `invoiceId: string`, `companyId: string`, `level: number`, `approverId: string`, `approverName: string`, `decision: 'rejected'`, `reason: string`, `totalAmount: Decimal`, `decidedAt: Date` |
| **Audit** | Yes — `recordAudit('approval.level.decided', { chainId, level, decision: 'rejected', reason })` |
| **Cross-Module** | Yes — Notification (AP Clerk, requester) |
| **Async** | Yes |

### 8.4 ApprovalDelegated

| Field | Value |
|---|---|
| **Event Name** | `ApprovalDelegated` |
| **Trigger** | `ApprovalService.delegate()` — approver delegates to alternate (on leave, workload, expertise) |
| **Publisher** | `ApprovalService` |
| **Subscribers** | Notification Context (delegate alternate), SLA Monitor (reset SLA for delegate) |
| **Payload** | `approvalChainId: string`, `invoiceId: string`, `companyId: string`, `level: number`, `originalApproverId: string`, `originalApproverName: string`, `delegateApproverId: string`, `delegateApproverName: string`, `reason: string`, `delegationType: DelegationType` (`manual` / `auto_on_leave` / `auto_workload`), `newSlaDeadline: Date` |
| **Audit** | Yes — `recordAudit('approval.delegated', { chainId, level, from: originalApproverId, to: delegateApproverId, reason })` |
| **Cross-Module** | No — intra-AP |
| **Async** | No — synchronous delegation |

### 8.5 ApprovalEscalated

| Field | Value |
|---|---|
| **Event Name** | `ApprovalEscalated` |
| **Trigger** | `ApprovalService.escalate()` — SLA breach on approval level, auto-escalate to next authority |
| **Publisher** | `ApprovalService` |
| **Subscribers** | Notification Context (escalation target), SLA Monitor (new SLA timer) |
| **Payload** | `approvalChainId: string`, `invoiceId: string`, `companyId: string`, `level: number`, `escalatedFrom: string`, `escalatedTo: string`, `escalatedToName: string`, `reason: string`, `slaBreached: boolean`, `previousSlaDeadline: Date`, `newSlaDeadline: Date` |
| **Audit** | Yes — `recordAudit('approval.escalated', { chainId, level, reason, escalatedTo })` |
| **Cross-Module** | Yes — Notification (escalation target) |
| **Async** | Yes |

### 8.6 ApprovalTimedOut

| Field | Value |
|---|---|
| **Event Name** | `ApprovalTimedOut` |
| **Trigger** | SLA timer expires without decision at any approval level |
| **Publisher** | `ApprovalService` (SLA Monitor callback) |
| **Subscribers** | ApprovalService (trigger auto-escalation), Notification Context (Controller alert) |
| **Payload** | `approvalChainId: string`, `invoiceId: string`, `companyId: string`, `level: number`, `timedOutApproverId: string`, `timedOutApproverName: string`, `slaDeadline: Date`, `overdueDuration: number` (ms past deadline), `totalAmount: Decimal` |
| **Audit** | Yes — `recordAudit('approval.timed_out', { chainId, level, approverId, slaDeadline })` |
| **Cross-Module** | Yes — Notification (Controller) |
| **Async** | Yes |

### 8.7 ApprovalChainCompleted

| Field | Value |
|---|---|
| **Event Name** | `ApprovalChainCompleted` |
| **Trigger** | Final approval level grants approval — full chain approved |
| **Publisher** | `ApprovalService` |
| **Subscribers** | InvoiceService (transition to Approved), Notification Context (AP Clerk, requester), Payment Service (mark invoice as payment-eligible) |
| **Payload** | `approvalChainId: string`, `invoiceId: string`, `companyId: string`, `vendorId: string`, `totalAmount: Decimal`, `currency: string`, `totalLevels: number`, `approvedLevels: number`, `chainDuration: number` (ms from first submission), `autoApproved: boolean`, `completedAt: Date` |
| **Audit** | Yes — `recordAudit('approval.chain.approved', { chainId, invoiceId, totalLevels, duration })` |
| **Cross-Module** | Yes — Notification (AP Clerk, requester), Payment (eligible) |
| **Async** | Yes |

---

## 9. Payment Events

### 9.1 PaymentProposalGenerated

| Field | Value |
|---|---|
| **Event Name** | `PaymentProposalGenerated` |
| **Trigger** | `PaymentProposalService.generate()` — daily auto-generation or manual proposal creation |
| **Publisher** | `PaymentProposalService` (domain aggregate: `PaymentProposal`) |
| **Subscribers** | Notification Context (AP Manager for review), Treasury Context (cash planning) |
| **Payload** | `proposalId: string`, `proposalNumber: string`, `companyId: string`, `invoiceCount: number`, `totalAmount: Decimal`, `totalDiscountSavings: Decimal`, `totalNetAmount: Decimal`, `currency: string`, `scheduledPaymentDate: Date`, `vendorCount: number`, `generatedBy: string` (`"system"` or userId), `generatedAt: Date` |
| **Audit** | Yes — `recordAudit('proposal.generated', { proposalId, invoiceCount, totalAmount, totalDiscountSavings, generatedBy })` |
| **Cross-Module** | Yes — Notification (AP Manager), Treasury (cash planning) |
| **Async** | Yes |

### 9.2 PaymentProposalApproved

| Field | Value |
|---|---|
| **Event Name** | `PaymentProposalApproved` |
| **Trigger** | `PaymentProposalService.approve()` — AP Manager or Controller approves proposal |
| **Publisher** | `PaymentProposalService` |
| **Subscribers** | Payment Service (create batch), Notification Context (Treasury), AP Analytics (update metrics) |
| **Payload** | `proposalId: string`, `proposalNumber: string`, `companyId: string`, `approvedBy: string`, `totalAmount: Decimal`, `currency: string`, `invoiceCount: number`, `approvalLevel: string`, `scheduledPaymentDate: Date`, `approvedAt: Date` |
| **Audit** | Yes — `recordAudit('proposal.approved', { proposalId, approvedBy, totalAmount, approvalLevel })` |
| **Cross-Module** | Yes — Payment (create batch), Notification (Treasury) |
| **Async** | Yes |

### 9.3 PaymentProposalRejected

| Field | Value |
|---|---|
| **Event Name** | `PaymentProposalRejected` |
| **Trigger** | `PaymentProposalService.reject()` — approver rejects proposal |
| **Publisher** | `PaymentProposalService` |
| **Subscribers** | Notification Context (AP Manager who generated) |
| **Payload** | `proposalId: string`, `proposalNumber: string`, `companyId: string`, `rejectedBy: string`, `reason: string`, `totalAmount: Decimal`, `rejectedAt: Date` |
| **Audit** | Yes — `recordAudit('proposal.rejected', { proposalId, rejectedBy, reason })` |
| **Cross-Module** | No — intra-AP notification |
| **Async** | No — synchronous |

### 9.4 PaymentBatchCreated

| Field | Value |
|---|---|
| **Event Name** | `PaymentBatchCreated` |
| **Trigger** | `PaymentService.createBatch()` — approved proposal converted to executable batch |
| **Publisher** | `PaymentService` (domain aggregate: `PaymentBatch`) |
| **Subscribers** | Treasury Context (prepare bank submission), Notification Context (Treasury Analyst) |
| **Payload** | `batchId: string`, `batchNumber: string`, `proposalId: string`, `companyId: string`, `paymentCount: number`, `totalAmount: Decimal`, `currency: string`, `vendorPaymentMethods: PaymentMethodSummary[]`, `createdAt: Date` |
| **Audit** | Yes — `recordAudit('payment.batch.created', { batchId, proposalId, paymentCount, totalAmount })` |
| **Cross-Module** | Yes — Treasury (prepare submission), Notification (Treasury Analyst) |
| **Async** | Yes |

### 9.5 PaymentExecuted

| Field | Value |
|---|---|
| **Event Name** | `PaymentExecuted` |
| **Trigger** | `PaymentService.execute()` — bank API submission confirmed |
| **Publisher** | `PaymentService` |
| **Subscribers** | Treasury Context (track execution), Notification Context (AP Clerk), AP Aging Service |
| **Payload** | `paymentId: string`, `paymentNumber: string`, `batchId: string`, `invoiceId: string`, `companyId: string`, `vendorId: string`, `amount: Decimal`, `currency: string`, `method: PaymentMethod`, `bankReference: string`, `executedAt: Date`, `idempotencyKey: string` |
| **Audit** | Yes — `recordAudit('payment.batch.submitted', { batchId, submittedAt, bankApi, itemCount })` |
| **Cross-Module** | Yes — Treasury (track), Notification (AP Clerk) |
| **Async** | Yes |

### 9.6 PaymentConfirmed

| Field | Value |
|---|---|
| **Event Name** | `PaymentConfirmed` |
| **Trigger** | `PaymentService.confirm()` — bank webhook/poll confirms payment received by vendor |
| **Publisher** | `PaymentService` |
| **Subscribers** | InvoiceService (transition to Paid), GL Integration (post journal entry), Notification Context (AP Clerk, requester), Reconciliation Service |
| **Payload** | `paymentId: string`, `paymentNumber: string`, `batchId: string`, `invoiceId: string`, `companyId: string`, `vendorId: string`, `amount: Decimal`, `currency: string`, `bankReference: string`, `confirmedAt: Date`, `confirmationSource: ConfirmationSource` (`webhook` / `poll` / `manual`) |
| **Audit** | Yes — `recordAudit('payment.confirmed', { paymentId, batchId, invoiceId, bankReference, amount })` |
| **Cross-Module** | Yes — GL (post entry), Notification (AP Clerk, requester) |
| **Async** | Yes |

### 9.7 PaymentFailed

| Field | Value |
|---|---|
| **Event Name** | `PaymentFailed` |
| **Trigger** | `PaymentService.bankRejection()` — bank rejects payment or timeout |
| **Publisher** | `PaymentService` |
| **Subscribers** | Notification Context (Treasury Analyst, AP Manager), Exception Service (create payment exception), InvoiceService (payment exception state) |
| **Payload** | `paymentId: string`, `paymentNumber: string`, `batchId: string`, `invoiceId: string`, `companyId: string`, `vendorId: string`, `amount: Decimal`, `failureReason: string`, `failureCode: string`, `retryCount: number`, `maxRetries: number`, `nextRetryAt: Date`, `failedAt: Date` |
| **Audit** | Yes — `recordAudit('payment.failed', { paymentId, batchId, invoiceId, error, retryCount })` |
| **Cross-Module** | Yes — Notification (Treasury, AP Manager), Exception |
| **Async** | Yes |

### 9.8 PaymentReversed

| Field | Value |
|---|---|
| **Event Name** | `PaymentReversed` |
| **Trigger** | `PaymentService.reverse()` — Controller reverses confirmed payment |
| **Publisher** | `PaymentService` |
| **Subscribers** | GL Integration (post reversing entry), Notification Context (AP Clerk, vendor), InvoiceService (re-open or void) |
| **Payload** | `paymentId: string`, `paymentNumber: string`, `batchId: string`, `invoiceId: string`, `companyId: string`, `vendorId: string`, `originalAmount: Decimal`, `reversedBy: string`, `reason: string`, `reversalType: ReversalType` (`full` / `partial`), `reversedAmount: Decimal`, `reversedAt: Date` |
| **Audit** | Yes — `recordAudit('payment.reversed', { paymentId, reversedBy, reason, reversedAmount })` |
| **Cross-Module** | Yes — GL (reversing entry), Notification (AP Clerk, vendor) |
| **Async** | Yes |

### 9.9 DuplicatePaymentBlocked

| Field | Value |
|---|---|
| **Event Name** | `DuplicatePaymentBlocked` |
| **Trigger** | `PaymentService.create()` — idempotency check or duplicate detection blocks payment |
| **Publisher** | `PaymentService` |
| **Subscribers** | Notification Context (AP Manager), Exception Service (create duplicate payment exception) |
| **Payload** | `blockedPaymentAttempt: BlockedPaymentAttempt`, `existingPaymentId: string`, `existingPaymentNumber: string`, `existingAmount: Decimal`, `existingPaidAt: Date`, `invoiceId: string`, `companyId: string`, `vendorId: string`, `matchType: DuplicatePaymentMatchType` (`idempotency_key` / `same_invoice` / `same_amount_vendor_date`), `blockedAt: Date` |
| **Audit** | Yes — `recordAudit('payment.duplicate_blocked', { existingPaymentId, blockedAttempt, matchType })` |
| **Cross-Module** | Yes — Notification (AP Manager), Exception |
| **Async** | Yes |

---

## 10. Reconciliation Events

### 10.1 VendorStatementImported

| Field | Value |
|---|---|
| **Event Name** | `VendorStatementImported` |
| **Trigger** | `ReconciliationService.import()` — vendor statement uploaded and parsed |
| **Publisher** | `ReconciliationService` (domain aggregate: `VendorStatement`) |
| **Subscribers** | Reconciliation Matching Service (begin auto-match), Notification Context (AP Manager) |
| **Payload** | `statementId: string`, `companyId: string`, `vendorId: string`, `vendorName: string`, `statementDate: Date`, `totalAmount: Decimal`, `currency: string`, `lineItemCount: number`, `importedBy: string`, `importSource: ImportSource` (`upload` / `email` / `edi`), `importedAt: Date` |
| **Audit** | Yes — `recordAudit('reconciliation.imported', { statementId, vendorId, totalAmount, lineItemCount })` |
| **Cross-Module** | No — intra-AP |
| **Async** | No — synchronous to trigger matching |

### 10.2 ReconciliationMatched

| Field | Value |
|---|---|
| **Event Name** | `ReconciliationMatched` |
| **Trigger** | `ReconciliationService.autoMatch()` — all statement lines match AP ledger |
| **Publisher** | `ReconciliationService` |
| **Subscribers** | Notification Context (AP Manager for finalization), Analytics Service (update reconciliation metrics) |
| **Payload** | `reconciliationId: string`, `statementId: string`, `companyId: string`, `vendorId: string`, `matchedLineItems: number`, `totalMatchedAmount: Decimal`, `variance: Decimal`, `bookBalance: Decimal`, `statementBalance: Decimal`, `matchedAt: Date` |
| **Audit** | Yes — `recordAudit('reconciliation.matched', { reconciliationId, matchedLineItems, variance })` |
| **Cross-Module** | No — intra-AP |
| **Async** | No — synchronous |

### 10.3 ReconciliationDiscrepancyFound

| Field | Value |
|---|---|
| **Event Name** | `ReconciliationDiscrepancyFound` |
| **Trigger** | `ReconciliationService.autoMatch()` — variance detected between statement and ledger |
| **Publisher** | `ReconciliationService` |
| **Subscribers** | Notification Context (AP Clerk for investigation), Exception Service (create reconciliation exception) |
| **Payload** | `reconciliationId: string`, `statementId: string`, `companyId: string`, `vendorId: string`, `discrepancies: ReconciliationDiscrepancy[]`, `totalDiscrepancyAmount: Decimal`, `bookBalance: Decimal`, `statementBalance: Decimal`, `discrepancyCount: number`, `foundAt: Date` |
| **Audit** | Yes — `recordAudit('reconciliation.discrepancies', { reconciliationId, discrepancyCount, totalDiscrepancyAmount })` |
| **Cross-Module** | Yes — Notification (AP Clerk) |
| **Async** | Yes |

### 10.4 ReconciliationAdjusted

| Field | Value |
|---|---|
| **Event Name** | `ReconciliationAdjusted` |
| **Trigger** | `ReconciliationService.adjust()` — AP Clerk/Manager/Controller posts adjustment entries |
| **Publisher** | `ReconciliationService` |
| **Subscribers** | GL Integration (post adjustment entries), Notification Context (Controller for high-value adjustments) |
| **Payload** | `reconciliationId: string`, `statementId: string`, `companyId: string`, `vendorId: string`, `adjustments: ReconciliationAdjustment[]`, `totalAdjustmentAmount: Decimal`, `adjustedBy: string`, `adjustmentAuthority: string`, `adjustedAt: Date` |
| **Audit** | Yes — `recordAudit('reconciliation.adjusted', { reconciliationId, adjustedBy, totalAdjustmentAmount })` |
| **Cross-Module** | Yes — GL (post adjustment entries), Notification (Controller for >$500) |
| **Async** | Yes |

### 10.5 ReconciliationCompleted

| Field | Value |
|---|---|
| **Event Name** | `ReconciliationCompleted` |
| **Trigger** | `ReconciliationService.finalize()` — vendor statement fully reconciled |
| **Publisher** | `ReconciliationService` |
| **Subscribers** | Analytics Service (update DPO metrics), Notification Context (AP Manager, Controller), Audit Context |
| **Payload** | `reconciliationId: string`, `statementId: string`, `companyId: string`, `vendorId: string`, `vendorName: string`, `bookBalance: Decimal`, `statementBalance: Decimal`, `finalVariance: Decimal`, `adjustmentCount: number`, `totalAdjustmentAmount: Decimal`, `completedBy: string`, `completedAt: Date`, `reconciliationDuration: number` (ms from import) |
| **Audit** | Yes — `recordAudit('reconciliation.reconciled', { reconciliationId, finalVariance, adjustmentCount })` |
| **Cross-Module** | Yes — Notification (AP Manager, Controller), Analytics |
| **Async** | Yes |

---

## 11. Credit Events

### 11.1 CreditNoteReceived

| Field | Value |
|---|---|
| **Event Name** | `CreditNoteReceived` |
| **Trigger** | `VendorCreditService.create()` — AP Clerk records vendor credit/debit note |
| **Publisher** | `VendorCreditService` (domain aggregate: `VendorCredit`) |
| **Subscribers** | Notification Context (AP Manager for review), Analytics Service |
| **Payload** | `creditId: string`, `creditNumber: string`, `companyId: string`, `vendorId: string`, `vendorName: string`, `creditAmount: Decimal`, `currency: string`, `reason: string`, `referenceInvoiceId: string` (if credit references specific invoice), `expiryDate: Date`, `receivedBy: string`, `receivedAt: Date` |
| **Audit** | Yes — `recordAudit('credit.received', { creditId, vendorId, creditAmount, reason })` |
| **Cross-Module** | Yes — Notification (AP Manager) |
| **Async** | Yes |

### 11.2 CreditNoteApplied

| Field | Value |
|---|---|
| **Event Name** | `CreditNoteApplied` |
| **Trigger** | `VendorCreditService.apply()` — full credit amount applied to one or more invoices |
| **Publisher** | `VendorCreditService` |
| **Subscribers** | InvoiceService (update invoice total), GL Integration (post credit entry), Notification Context (AP Clerk) |
| **Payload** | `creditId: string`, `creditNumber: string`, `companyId: string`, `vendorId: string`, `creditAmount: Decimal`, `appliedAmount: Decimal`, `applications: CreditApplication[]` (`{ invoiceId, amount }[]`), `appliedBy: string`, `appliedAt: Date` |
| **Audit** | Yes — `recordAudit('credit.applied', { creditId, appliedAmount, invoiceApplications })` |
| **Cross-Module** | Yes — GL (post credit entry) |
| **Async** | Yes |

### 11.3 CreditNotePartiallyApplied

| Field | Value |
|---|---|
| **Event Name** | `CreditNotePartiallyApplied` |
| **Trigger** | `VendorCreditService.applyPartial()` — partial credit amount applied, remainder available |
| **Publisher** | `VendorCreditService` |
| **Subscribers** | InvoiceService (update invoice total), Notification Context (AP Clerk — remaining balance alert) |
| **Payload** | `creditId: string`, `creditNumber: string`, `companyId: string`, `vendorId: string`, `creditAmount: Decimal`, `appliedAmount: Decimal`, `remainingAmount: Decimal`, `applications: CreditApplication[]`, `appliedBy: string`, `appliedAt: Date` |
| **Audit** | Yes — `recordAudit('credit.partially_applied', { creditId, appliedAmount, remainingAmount })` |
| **Cross-Module** | No — intra-AP |
| **Async** | No — synchronous |

### 11.4 CreditNoteExpired

| Field | Value |
|---|---|
| **Event Name** | `CreditNoteExpired` |
| **Trigger** | Daily system check — credit note past expiration date with remaining balance |
| **Publisher** | `VendorCreditService` (scheduled check) |
| **Subscribers** | Notification Context (AP Manager — expired credit alert), Analytics Service (track credit expiry rate) |
| **Payload** | `creditId: string`, `creditNumber: string`, `companyId: string`, `vendorId: string`, `vendorName: string`, `creditAmount: Decimal`, `appliedAmount: Decimal`, `forfeitedAmount: Decimal`, `expiryDate: Date`, `expiredAt: Date` |
| **Audit** | Yes — `recordAudit('credit.expired', { creditId, forfeitedAmount, expiryDate })` |
| **Cross-Module** | No — intra-AP |
| **Async** | No — synchronous system check |

---

## 12. GL Events (Cross-Module)

All GL events are **cross-module** — AP generates draft journal entries and submits them to the GL Context for posting. AP never posts directly to the ledger.

### 12.1 GLJournalEntryRequested

| Field | Value |
|---|---|
| **Event Name** | `GLJournalEntryRequested` |
| **Trigger** | `ApGlAdapter.createJournalEntry()` — AP generates draft journal entry for invoice payment, GRN receipt, or credit note |
| **Publisher** | `ApGlAdapter` (ACL translation layer) |
| **Subscribers** | GL Context (receive draft entry for validation and posting) |
| **Payload** | `apEntryId: string`, `companyId: string`, `entryType: APJournalEntryType` (`invoice_payment` / `grn_receipt` / `credit_note` / `reversal`), `referenceType: string` (`ProcurementInvoice`, `ProcurementPayment`, `ProcurementGRN`), `referenceId: string`, `debitAccountCode: string`, `creditAccountCode: string`, `debitAmount: Decimal`, `creditAmount: Decimal`, `currency: string`, `exchangeRate: Decimal`, `description: string`, `periodId: string`, `requestedBy: string` |
| **Audit** | Yes — `recordAudit('ap.gl_entry.generated', { entryId, accounts: [debit, credit] })` |
| **Cross-Module** | Yes — GL Context (submit for posting) |
| **Async** | Yes — async so GL can validate and post independently |

### 12.2 GLJournalEntryPosted

| Field | Value |
|---|---|
| **Event Name** | `GLJournalEntryPosted` |
| **Trigger** | GL Context confirms journal entry posted to ledger |
| **Publisher** | GL Context (response event consumed by AP) |
| **Subscribers** | InvoiceService (transition to Posted/Closed), PaymentService (confirm GL posting), Reconciliation Service |
| **Payload** | `apEntryId: string`, `glJournalEntryId: string`, `companyId: string`, `entryType: APJournalEntryType`, `referenceId: string`, `debitAmount: Decimal`, `creditAmount: Decimal`, `postedAt: Date`, `periodId: string` |
| **Audit** | Yes — `recordAudit('invoice.gl.posted', { invoiceId, journalEntryId: glJournalEntryId, totalDebit, totalCredit })` |
| **Cross-Module** | Yes — AP receives confirmation from GL |
| **Async** | Yes |

### 12.3 GLJournalEntryFailed

| Field | Value |
|---|---|
| **Event Name** | `GLJournalEntryFailed` |
| **Trigger** | GL Context rejects journal entry (period closed, invalid account, balance mismatch) |
| **Publisher** | GL Context |
| **Subscribers** | Notification Context (Controller alert), InvoiceService (hold at current state), PaymentService (retry or alert) |
| **Payload** | `apEntryId: string`, `companyId: string`, `entryType: APJournalEntryType`, `referenceId: string`, `failureReason: string`, `failureCode: string`, `retryable: boolean`, `failedAt: Date` |
| **Audit** | Yes — `recordAudit('ap.gl_entry.failed', { entryId, failureReason, failureCode })` |
| **Cross-Module** | Yes — Notification (Controller), AP holds processing |
| **Async** | Yes |

---

## 13. Notification Events (Cross-Module)

These events are consumed by the Notification Context for delivery via email, Slack, or in-app. AP never sends notifications directly.

### 13.1 APNotificationRequested

| Field | Value |
|---|---|
| **Event Name** | `APNotificationRequested` |
| **Trigger** | Any AP state change requiring human attention |
| **Publisher** | Various AP services (emitted alongside domain events) |
| **Subscribers** | Notification Context (template selection, delivery routing) |
| **Payload** | `notificationId: string`, `companyId: string`, `templateName: string`, `recipients: NotificationRecipient[]` (`{ userId, channel: 'email' | 'slack' | 'in_app' }[]`), `templateData: Record<string, unknown>` (entity-specific data for template rendering), `priority: NotificationPriority` (`low` / `normal` / `high` / `urgent`), `sourceEvent: string` (domain event name that triggered this), `sourceEntityId: string` |
| **Audit** | No — notifications are delivery artifacts, not audit records |
| **Cross-Module** | Yes — Notification Context |
| **Async** | Yes |

### 13.2 APAutoEscalationTriggered

| Field | Value |
|---|---|
| **Event Name** | `APAutoEscalationTriggered` |
| **Trigger** | SLA breach on any AP entity triggers automatic escalation |
| **Publisher** | SLA Monitor (system callback) |
| **Subscribers** | Notification Context (escalation target), Exception/Approval Service (advance escalation chain) |
| **Payload** | `escalationId: string`, `companyId: string`, `entityType: string` (`invoice` / `exception` / `approval` / `payment`), `entityId: string`, `escalatedFrom: string`, `escalatedTo: string`, `escalatedToName: string`, `slaDeadline: Date`, `overdueDuration: number` (ms), `escalationReason: string`, `escalationPath: string[]` (history of escalation targets) |
| **Audit** | Yes — `recordAudit('ap.auto_escalation', { entityId, escalatedFrom, escalatedTo, overdueDuration })` |
| **Cross-Module** | Yes — Notification Context |
| **Async** | Yes |

---

## 14. Event Flow Diagrams

### 14.1 Invoice Lifecycle Flow

The complete event chain from invoice receipt through payment and GL posting:

```
AP Clerk captures invoice
    │
    ├──[1] InvoiceReceived ──► Intelligence (duplicate scan)
    │                          ──► Exception (credit limit check)
    │
    ├──[2] DuplicateInvoiceDetected? ──► if duplicate: Exception (HIGH severity)
    │                          ──► Notification (AP Manager)
    │
    ▼
Automated validation
    │
    ├──[3a] InvoiceValidated ──► InvoiceMatchingService (trigger match)
    │
    ├──[3b] InvoiceValidationFailed ──► Exception (create validation exception)
    │                          ──► Notification (AP Clerk)
    │
    ▼
Three-way match engine
    │
    ├──[4] ThreeWayMatchInitiated ──► Audit trail
    │
    ├──[5a] ThreeWayMatchCompleted ──► InvoiceService (→ Matched)
    │                          ──► ApprovalService (create chain)
    │
    ├──[5b] ThreeWayMatchFailed ──► Exception (match exception)
    │                          ──► Notification (AP Clerk)
    │
    ▼
Approval workflow
    │
    ├──[6] ApprovalRequested ──► Notification (first approver)
    │                          ──► SLA Monitor (start timer)
    │
    ├──[7] ApprovalGranted (per level) ──► Notification (next approver)
    │
    ├──[8] ApprovalTimedOut? ──► if SLA breached: ApprovalEscalated
    │                          ──► Notification (escalation target)
    │
    ├──[9] ApprovalChainCompleted ──► InvoiceService (→ Approved)
    │                          ──► Notification (AP Clerk, requester)
    │                          ──► Payment Service (eligible)
    │
    ▼
Payment processing
    │
    ├──[10] InvoiceScheduled ──► Notification (Treasury)
    │
    ├──[11] PaymentBatchCreated ──► Treasury (prepare submission)
    │
    ├──[12] PaymentExecuted ──► Treasury (track)
    │                          ──► Notification (AP Clerk)
    │
    ├──[13] PaymentConfirmed ──► InvoiceService (→ Paid)
    │                          ──► GL Integration (post entry)
    │                          ──► Notification (AP Clerk, requester)
    │
    ├──[14] PaymentFailed? ──► Exception (payment exception)
    │                          ──► Notification (Treasury, AP Manager)
    │
    ▼
GL posting
    │
    ├──[15] GLJournalEntryRequested ──► GL Context (validate + post)
    │
    ├──[16] GLJournalEntryPosted ──► InvoiceService (→ Closed)
    │                          ──► AP Analytics (update metrics)
    │
    ├──[17] GLJournalEntryFailed? ──► Notification (Controller)
    │                          ──► Hold at Paid state, retry
    ▼
    Invoice lifecycle complete
```

### 14.2 Exception Lifecycle Flow

```
Any AP failure (match, validation, duplicate, payment)
    │
    ├──[1] ExceptionCreated ──► Notification (AP Clerk)
    │                     ──► SLA Monitor (start timer)
    │                     ──► Analytics (update metrics)
    │
    ├──[2] ExceptionAutoResolved? ──► if pattern match: InvoiceService (→ Matched)
    │                          ──► Analytics (track auto-resolution rate)
    │
    ▼
Manual resolution path
    │
    ├──[3] ExceptionAssigned ──► Notification (AP Clerk)
    │                     ──► SLA Monitor (reset timer)
    │
    ├──[4] SLA breach? ──► ExceptionEscalated ──► Notification (AP Manager)
    │                     ──► SLA Monitor (new timer)
    │
    ├──[5] ExceptionResolved ──► InvoiceService (→ Matched or re-validate)
    │                     ──► Notification (AP Manager for verification)
    │                     ──► Analytics (resolution metrics)
    │
    ├──[6] ExceptionPatternDetected? ──► Intelligence (model feedback)
    │                          ──► Notification (AP Manager, Controller)
    │                          ──► Analytics (pattern metrics)
    ▼
    Exception lifecycle complete
```

### 14.3 Payment Lifecycle Flow

```
Payment Proposal
    │
    ├──[1] PaymentProposalGenerated ──► Notification (AP Manager for review)
    │                              ──► Treasury (cash planning)
    │
    ├──[2] PaymentProposalApproved ──► Payment Service (create batch)
    │                              ──► Notification (Treasury)
    │
    ├──[3] PaymentProposalRejected? ──► Notification (AP Manager)
    │
    ▼
Payment Batch Execution
    │
    ├──[4] PaymentBatchCreated ──► Treasury (prepare bank submission)
    │                          ──► Notification (Treasury Analyst)
    │
    ├──[5] DuplicatePaymentBlocked? ──► if duplicate: Exception + Notification
    │
    ├──[6] PaymentExecuted ──► Treasury (track)
    │                      ──► Notification (AP Clerk)
    │
    ├──[7a] PaymentConfirmed ──► InvoiceService (→ Paid)
    │                          ──► GL Integration (post entry)
    │                          ──► Notification (AP Clerk, requester)
    │
    ├──[7b] PaymentFailed ──► Exception (payment exception)
    │                      ──► Notification (Treasury, AP Manager)
    │                      ──► auto-retry (3x exponential backoff)
    │
    ▼
GL Posting
    │
    ├──[8] GLJournalEntryRequested ──► GL Context
    │
    ├──[9] GLJournalEntryPosted ──► InvoiceService (→ Closed)
    │
    ├──[10] GLJournalEntryFailed? ──► Notification (Controller)
    │                           ──► Hold, retry, alert
    ▼
    Payment lifecycle complete

Reversal path (from any confirmed state):
    │
    ├──[R1] PaymentReversed ──► GL Integration (reversing entry)
    │                        ──► Notification (AP Clerk, vendor)
    │                        ──► InvoiceService (re-open or void)
    ▼
    Reversal complete
```

---

## 15. Event Ordering Rules

### 15.1 Strict Sequential Events

These events MUST occur in the specified order. A later event cannot fire before its predecessors:

| # | Predecessor | Successor | Constraint |
|---|---|---|---|
| 1 | `InvoiceReceived` | `InvoiceValidated` | Validation cannot start before receipt |
| 2 | `InvoiceValidated` | `ThreeWayMatchInitiated` | Matching cannot start before validation |
| 3 | `ThreeWayMatchInitiated` | `ThreeWayMatchCompleted` | Match completion follows initiation |
| 4 | `ThreeWayMatchCompleted` | `ApprovalRequested` | Approval cannot start before match passes |
| 5 | `ApprovalChainCompleted` | `InvoiceScheduled` | Scheduling requires full approval |
| 6 | `PaymentProposalApproved` | `PaymentBatchCreated` | Batch requires approved proposal |
| 7 | `PaymentBatchCreated` | `PaymentExecuted` | Execution follows batch creation |
| 8 | `PaymentExecuted` | `PaymentConfirmed` | Confirmation follows execution |
| 9 | `PaymentConfirmed` | `GLJournalEntryRequested` | GL entry follows payment confirmation |
| 10 | `GLJournalEntryRequested` | `GLJournalEntryPosted` | Posting follows request |
| 11 | `GLJournalEntryPosted` | `InvoiceClosed` | Closure follows GL posting |

### 15.2 Parallel Events

These events can fire simultaneously (no ordering constraint between them):

| Group | Events | Rationale |
|---|---|---|
| **Multi-subscriber fan-out** | `InvoiceReceived` + `APNotificationRequested` | Notification can fire alongside domain event |
| **Match + Exception** | `ThreeWayMatchFailed` + `ExceptionCreated` + `APNotificationRequested` | Match failure, exception creation, and notification happen in parallel |
| **Approval chain** | `ApprovalGranted` (level N) + `ApprovalRequested` (level N+1) | Granting one level immediately requests the next |
| **Payment batch items** | `PaymentExecuted` (item A) + `PaymentExecuted` (item B) | Batch items execute independently |
| **Exception + Notification** | `ExceptionCreated` + `APNotificationRequested` | Exception creation and notification fire simultaneously |
| **Pattern detection** | `ExceptionResolved` + `ExceptionPatternDetected` | Pattern detection runs alongside resolution |

### 15.3 Conditional Events

These events fire only when specific conditions are met:

| Event | Condition | Rationale |
|---|---|---|
| `DuplicateInvoiceDetected` | Duplicate check finds match (vendor + number, or fuzzy match) | Only fires if duplicate exists |
| `InvoiceValidationFailed` | Validation finds blocking errors | Only fires on failure |
| `InvoiceMismatchDetected` | Match variances exceed tolerance | Only fires on mismatch |
| `ExceptionAutoResolved` | Pattern matching finds historical resolution with ≥80% confidence | Only fires if pattern exists |
| `ExceptionPatternDetected` | ≥3 similar exceptions within 30-day window | Only fires when pattern threshold met |
| `ApprovalDelegated` | Approver has active delegation rule or is marked on-leave | Only fires if delegation applicable |
| `ApprovalTimedOut` | SLA deadline passed without decision | Only fires if deadline breached |
| `DuplicatePaymentBlocked` | Same idempotency key or same invoice + amount within 24h | Only fires if duplicate detected |
| `CreditNoteExpired` | Credit note past expiration date with remaining balance | Only fires on scheduled check |
| `APAutoEscalationTriggered` | SLA breach on any entity | Only fires when deadline breached |
| `PaymentFailed` | Bank rejects or times out | Only fires on failure |
| `GLJournalEntryFailed` | GL rejects entry (period closed, invalid account) | Only fires on rejection |
| `ReconciliationDiscrepancyFound` | Variance between statement and ledger > $0 | Only fires if discrepancy exists |

### 15.4 Conditional + Sequential Combined

```
InvoiceReceived ──[sequential]──► InvoiceValidated ──[sequential]──► ThreeWayMatchInitiated
         │                              │                                    │
         │ (conditional)                │ (conditional)                      │ (conditional)
         ▼                              ▼                                    ▼
  DuplicateInvoiceDetected    InvoiceValidationFailed              ThreeWayMatchCompleted
  (only if duplicate)         (only if validation fails)           OR ThreeWayMatchFailed
                                                                    (only one fires)
```

---

## 16. Event Idempotency

### 16.1 Idempotent Events (Safe to Replay)

These events can be delivered multiple times without side effects. Subscribers can safely reprocess them:

| Event | Idempotency Mechanism | Rationale |
|---|---|---|
| `VendorCreated` | `vendorCode` unique per `(companyId)` | Duplicate create returns existing vendor |
| `InvoiceReceived` | `invoiceNumber` unique per `(companyId, vendorId)` | Duplicate create returns existing invoice |
| `InvoiceValidated` | Invoice state check: only validates from `Received` | Re-validation from `Validated` state is no-op |
| `InvoiceMatched` | Invoice state check: only matches from `Validated` | Re-matching from `Matched` state is no-op |
| `InvoiceClosed` | Invoice state check: only closes from `Paid` | Re-closing from `Closed` state is no-op |
| `PaymentConfirmed` | `paymentId` unique + status check | Re-confirming `Confirmed` payment is no-op |
| `GLJournalEntryPosted` | `apEntryId` unique + `posted` flag | Re-posting is no-op |
| `ReconciliationCompleted` | `reconciliationId` unique + status check | Re-completing is no-op |
| `CreditNoteReceived` | `creditNumber` unique per `(companyId, vendorId)` | Duplicate create returns existing credit |

### 16.2 Events Requiring Deduplication

These events carry financial consequences and MUST be deduplicated before processing:

| Event | Deduplication Key | Consequence of Duplication | Enforcement |
|---|---|---|---|
| `PaymentExecuted` | `idempotencyKey` on Payment entity | Double payment — money leaves bank twice | Unique constraint on `ProcurementPayment.idempotencyKey` |
| `DuplicatePaymentBlocked` | `paymentId` of blocked attempt | N/A (blocking IS the correct behavior) | Entity state check |
| `GLJournalEntryRequested` | `apEntryId` + `entryType` | Double posting — ledger shows incorrect balance | Unique constraint on `ProcurementAPJournalEntry(apEntryId, entryType)` |
| `InvoiceApproved` | `approvalChainId` + `decision` | Double approval record — audit trail confusion | Unique constraint on `ProcurementApprovalRecord(approvalChainId, level)` |
| `InvoicePaid` | `paymentId` | Double invoice status change — audit trail confusion | Invoice state check: only transitions from `Scheduled` |

### 16.3 Idempotency Enforcement Patterns

| Pattern | Implementation | Used By |
|---|---|---|
| **Entity state guard** | Check current state before transition. If already in target state, return success without side effects. | `InvoiceValidated`, `InvoiceMatched`, `InvoiceClosed`, `PaymentConfirmed` |
| **Unique constraint** | Database unique constraint on business key. Duplicate insert throws, caller catches and returns existing entity. | `PaymentExecuted` (idempotencyKey), `InvoiceReceived` (invoiceNumber), `VendorCreated` (vendorCode) |
| **Idempotency key** | Client-generated UUID sent with request. Server checks for existing record with same key before processing. | `PaymentExecuted`, `GLJournalEntryRequested` |
| **Natural key matching** | Business key (invoice number + vendor + company) used to detect duplicates before create. | `InvoiceReceived`, `VendorCreated`, `CreditNoteReceived` |
| **Optimistic version check** | Entity version field checked before update. Concurrent update detected and rejected. | `ApprovalGranted` (level decision), `ExceptionResolved` (resolution) |

### 16.4 Subscriber Idempotency Requirements

Every subscriber MUST implement at least one idempotency mechanism:

| Subscriber | Required Pattern | Rationale |
|---|---|---|
| `InvoiceService` | Entity state guard | Prevent invalid state transitions on replay |
| `ExceptionService` | Entity state guard + dedup check | Prevent duplicate exceptions for same issue |
| `ApprovalService` | Unique constraint + version check | Prevent double approvals, maintain audit integrity |
| `PaymentService` | Idempotency key + entity state guard | Prevent double payment — financial safety critical |
| `GL Integration` | Unique constraint + entity state guard | Prevent double posting to ledger |
| `Notification Context` | Natural dedup (suppress if same event + entity in last 60s) | Prevent duplicate notifications (cosmetic, not financial) |
| `Analytics Service` | Entity state guard | Prevent double-counting metrics |

---

## Appendix A: Event → Audit Record Mapping

Every domain event produces a corresponding audit record. The mapping:

| Event | Audit Action | Key Data in Audit Record |
|---|---|---|
| `VendorCreated` | `vendor.created` | vendorId, requestedBy, category |
| `VendorApproved` | `vendor.approved` | vendorId, approvedBy, riskScore |
| `VendorRejected` | `vendor.rejected` | vendorId, rejectedBy, reason |
| `VendorSuspended` | `vendor.suspended` | vendorId, suspendedBy, reason |
| `VendorDeactivated` | `vendor.deactivated` | vendorId, deactivatedBy, openInvoiceCount |
| `VendorRiskScoreUpdated` | `vendor.risk_updated` | vendorId, previousScore, newScore |
| `VendorBankDetailChanged` | `vendor.bank_updated` | vendorId, updatedBy, bankLast4 |
| `InvoiceReceived` | `invoice.captured` | invoiceId, vendorId, amount, source |
| `InvoiceValidated` | `invoice.validated` | invoiceId, result, warnings |
| `InvoiceValidationFailed` | `invoice.validation_failed` | invoiceId, errors |
| `InvoiceMatched` | `invoice.matched` | invoiceId, matchType, matchId |
| `InvoiceMismatchDetected` | `invoice.match.exception` | invoiceId, exceptionId, variance |
| `InvoiceApproved` | `invoice.approval.decided` | invoiceId, level, decision |
| `InvoiceRejected` | `invoice.approval.decided` | invoiceId, level, reason |
| `InvoiceEscalated` | `approval.escalated` | chainId, level, escalatedTo |
| `InvoiceScheduled` | `invoice.payment.scheduled` | invoiceId, proposalId |
| `InvoicePaid` | `invoice.payment.confirmed` | invoiceId, paymentId, bankReference |
| `InvoiceClosed` | `invoice.closed` | invoiceId, glEntryIds |
| `InvoiceDisputed` | `invoice.disputed` | invoiceId, disputeReason |
| `InvoiceBlocked` | `invoice.blocked` | invoiceId, blockReason |
| `InvoiceVoided` | `invoice.voided` | invoiceId, reason |
| `DuplicateInvoiceDetected` | `invoice.duplicate_detected` | invoiceId, existingInvoiceId |
| `ThreeWayMatchInitiated` | `match.initiated` | matchId, invoiceId, matchType |
| `ThreeWayMatchCompleted` | `match.executed` | matchId, result: 'matched' |
| `ThreeWayMatchFailed` | `match.executed` | matchId, result: 'exception' |
| `MatchOverrideRecorded` | `match.override` | matchId, overrideBy, reason |
| `MatchExceptionCreated` | `exception.created` | exceptionId, type, severity |
| `ExceptionCreated` | `exception.created` | exceptionId, type, severity |
| `ExceptionAssigned` | `exception.assigned` | exceptionId, assignedTo |
| `ExceptionResolved` | `exception.resolved` | exceptionId, resolution |
| `ExceptionEscalated` | `exception.escalated` | exceptionId, escalatedTo |
| `ExceptionAutoResolved` | `exception.auto_resolved` | exceptionId, patternId, confidence |
| `ExceptionPatternDetected` | `exception.pattern_detected` | patternId, affectedCount |
| `ApprovalRequested` | `approval.created` | chainId, invoiceId, levels |
| `ApprovalGranted` | `approval.level.decided` | chainId, level, approved |
| `ApprovalDenied` | `approval.level.decided` | chainId, level, rejected |
| `ApprovalDelegated` | `approval.delegated` | chainId, level, from, to |
| `ApprovalEscalated` | `approval.escalated` | chainId, level, escalatedTo |
| `ApprovalTimedOut` | `approval.timed_out` | chainId, approverId |
| `ApprovalChainCompleted` | `approval.chain.approved` | chainId, totalLevels, duration |
| `PaymentProposalGenerated` | `proposal.generated` | proposalId, invoiceCount, totalAmount |
| `PaymentProposalApproved` | `proposal.approved` | proposalId, approvedBy |
| `PaymentProposalRejected` | `proposal.rejected` | proposalId, rejectedBy, reason |
| `PaymentBatchCreated` | `payment.batch.created` | batchId, proposalId, totalAmount |
| `PaymentExecuted` | `payment.batch.submitted` | batchId, bankApi |
| `PaymentConfirmed` | `payment.confirmed` | paymentId, bankReference |
| `PaymentFailed` | `payment.failed` | paymentId, error, retryCount |
| `PaymentReversed` | `payment.reversed` | paymentId, reversedBy, reason |
| `DuplicatePaymentBlocked` | `payment.duplicate_blocked` | existingPaymentId, matchType |
| `VendorStatementImported` | `reconciliation.imported` | statementId, totalAmount |
| `ReconciliationMatched` | `reconciliation.matched` | reconciliationId, variance |
| `ReconciliationDiscrepancyFound` | `reconciliation.discrepancies` | reconciliationId, discrepancyCount |
| `ReconciliationAdjusted` | `reconciliation.adjusted` | reconciliationId, totalAdjustmentAmount |
| `ReconciliationCompleted` | `reconciliation.reconciled` | reconciliationId, finalVariance |
| `CreditNoteReceived` | `credit.received` | creditId, creditAmount |
| `CreditNoteApplied` | `credit.applied` | creditId, appliedAmount |
| `CreditNotePartiallyApplied` | `credit.partially_applied` | creditId, remainingAmount |
| `CreditNoteExpired` | `credit.expired` | creditId, forfeitedAmount |
| `GLJournalEntryRequested` | `ap.gl_entry.generated` | entryId, accounts |
| `GLJournalEntryPosted` | `invoice.gl.posted` | journalEntryId, totalDebit/Credit |
| `GLJournalEntryFailed` | `ap.gl_entry.failed` | entryId, failureReason |
| `APAutoEscalationTriggered` | `ap.auto_escalation` | entityId, escalatedTo, overdueDuration |

---

## Appendix B: Cross-Module Event Dependencies

| Source Context | Event | Target Context | Handler |
|---|---|---|---|
| AP | `InvoiceReceived` | Intelligence | Duplicate detection scan |
| AP | `DuplicateInvoiceDetected` | Exception | Create HIGH severity exception |
| AP | `InvoiceValidationFailed` | Notification | AP Clerk alert |
| AP | `ThreeWayMatchFailed` | Notification | AP Clerk alert |
| AP | `InvoiceMismatchDetected` | Notification | AP Clerk alert |
| AP | `InvoiceApproved` | Notification | AP Clerk, requester |
| AP | `InvoiceRejected` | Exception | Create resolution task |
| AP | `InvoicePaid` | GL | Post journal entry |
| AP | `InvoiceVoided` | GL | Reverse posted entries |
| AP | `PaymentExecuted` | Treasury | Track execution |
| AP | `PaymentConfirmed` | GL | Post journal entry |
| AP | `PaymentFailed` | Notification | Treasury, AP Manager |
| AP | `PaymentReversed` | GL | Post reversing entry |
| AP | `GLJournalEntryRequested` | GL | Validate and post |
| AP | `CreditNoteApplied` | GL | Post credit entry |
| AP | `ReconciliationAdjusted` | GL | Post adjustment entries |
| AP | `ReconciliationCompleted` | Notification | AP Manager, Controller |
| AP | `APNotificationRequested` | Notification | Template selection, delivery |
| AP | `APAutoEscalationTriggered` | Notification | Escalation target delivery |
| GL | `GLJournalEntryPosted` | AP | Confirm posting, close invoice |
| GL | `GLJournalEntryFailed` | AP | Hold processing, alert |
| Treasury | `PaymentConfirmed` | AP | Update payment status |
| Treasury | `PaymentFailed` | AP | Update status, create exception |
| Intelligence | `DuplicateInvoiceDetected` | AP | Block or alert |

---

## Appendix C: Implementation Roadmap

### Phase 21A — Foundation (This Document's Scope)

| Deliverable | Events | Priority |
|---|---|---|
| Event type definitions | All 63 events in `types/events.ts` | P0 |
| Vendor events | 7 vendor events | P0 |
| Invoice events (core path) | InvoiceReceived → Validated → Matched → Approved → Paid → Closed | P0 |
| Matching events | 5 matching events | P0 |
| Exception events (basic) | ExceptionCreated, ExceptionAssigned, ExceptionResolved | P0 |
| Approval events (basic) | ApprovalRequested, ApprovalGranted, ApprovalDenied, ApprovalChainCompleted | P0 |

### Phase 21B — Core Workflow

| Deliverable | Events | Priority |
|---|---|---|
| Payment events | All 9 payment events | P0 |
| GL events | All 3 GL events | P0 |
| Full exception lifecycle | ExceptionEscalated, ExceptionAutoResolved, ExceptionPatternDetected | P1 |
| Full approval lifecycle | ApprovalDelegated, ApprovalEscalated, ApprovalTimedOut | P1 |
| Notification events | APNotificationRequested, APAutoEscalationTriggered | P1 |

### Phase 21C — Intelligence

| Deliverable | Events | Priority |
|---|---|---|
| Reconciliation events | All 5 reconciliation events | P1 |
| Credit events | All 4 credit events | P1 |
| DuplicatePaymentBlocked | Duplicate payment detection | P1 |
| DuplicateInvoiceDetected | AI-powered duplicate detection | P1 |

### Phase 21D — Hardening

| Deliverable | Events | Priority |
|---|---|---|
| Idempotency enforcement | All P0 events have idempotency mechanisms | P0 |
| Cross-module async wrappers | All cross-module events use async dispatch | P1 |
| Event ordering validation | Runtime checks for sequential event constraints | P2 |
| Event monitoring dashboard | Event volume, latency, failure metrics | P2 |
