# AP Application Services

> **Phase 21A.2** — Application Layer  
> 7 services, 51 commands, 7 aggregate roots  
> All monetary arithmetic via `financial-precision.ts` helpers

---

## Summary

| Service | Commands | Aggregate Root | File |
|---|---|---|---|
| VendorApplicationService | 8 | Vendor | `src/server/procurement/application/vendor-service.ts` |
| InvoiceApplicationService | 15 | VendorInvoice | `src/server/procurement/application/invoice-service.ts` |
| ExceptionApplicationService | 6 | InvoiceException | `src/server/procurement/application/exception-service.ts` |
| ApprovalApplicationService | 6 | ApprovalRecord | `src/server/procurement/application/approval-service.ts` |
| PaymentApplicationService | 9 | PaymentProposal / PaymentBatch / PaymentRecord | `src/server/procurement/application/payment-service.ts` |
| ReconciliationApplicationService | 4 | ReconciliationResult / VendorStatement | `src/server/procurement/application/reconciliation-service.ts` |
| CreditApplicationService | 3 | VendorCredit | `src/server/procurement/application/credit-service.ts` |
| **Total** | **51** | | |

---

## Shared Conventions

Every service method follows this pattern:

```
Command → validate context → load from repo → business rules →
  save → collect events → collect audit → return CommandResult<T>
```

**Constructor dependency**: All 7 services accept `APRepositoryRegistry` as their sole constructor argument, enabling dependency injection for both production (Prisma) and test (InMemory) implementations.

**Financial precision**: All monetary inputs are `Prisma.Decimal(38,12)`. Conversion to `number` happens only at the repository boundary. Zero native `number` arithmetic on money within service methods.

**Optimistic locking**: Every aggregate has a `version` field incremented on each save. Concurrent modification is detected by Prisma's `version` check.

**Tenant isolation**: Every repository call receives `ctx.companyId`. No cross-tenant data access is possible.

---

## 1. VendorApplicationService

**File**: `src/server/procurement/application/vendor-service.ts` (525 lines)  
**Aggregate Root**: `Vendor`  
**State Machine**: `PENDING_REVIEW → ACTIVE → SUSPENDED → DEACTIVATED`

### State Transition Table

| From | To | Commands |
|---|---|---|
| PENDING_REVIEW | ACTIVE | approveVendor |
| PENDING_REVIEW | DEACTIVATED | rejectVendor |
| ACTIVE | SUSPENDED | suspendVendor |
| ACTIVE | DEACTIVATED | deactivateVendor |
| SUSPENDED | ACTIVE | reactivateVendor |
| SUSPENDED | DEACTIVATED | deactivateVendor |
| DEACTIVATED | * (terminal) | — |

### Commands

| # | Method | Input Type | Return Type | State Transition | Key Business Rules |
|---|---|---|---|---|---|
| 1 | `createVendor` | `CreateVendorCommand` | `CommandResult<Vendor>` | — → PENDING_REVIEW | Name 2–200 chars; credit limit ≥ 0; unique tax ID per company |
| 2 | `updateVendor` | `UpdateVendorCommand` | `CommandResult<Vendor>` | — | Cannot update DEACTIVATED; at least one field required |
| 3 | `approveVendor` | `VendorStateTransitionCommand` | `CommandResult<Vendor>` | PENDING_REVIEW → ACTIVE | SoD: creator ≠ approver; must be PENDING_REVIEW |
| 4 | `rejectVendor` | `VendorStateTransitionCommand & { reason }` | `CommandResult<Vendor>` | PENDING_REVIEW → DEACTIVATED | Reason ≥ 10 chars; must be PENDING_REVIEW |
| 5 | `suspendVendor` | `VendorStateTransitionCommand & { reason }` | `CommandResult<Vendor>` | ACTIVE → SUSPENDED | Reason ≥ 10 chars; must be ACTIVE |
| 6 | `reactivateVendor` | `VendorStateTransitionCommand` | `CommandResult<Vendor>` | SUSPENDED → ACTIVE | Must be SUSPENDED |
| 7 | `deactivateVendor` | `VendorStateTransitionCommand & { reason }` | `CommandResult<Vendor>` | ACTIVE/SUSPENDED → DEACTIVATED | Reason ≥ 10 chars; terminal state |
| 8 | `updateBankDetails` | `UpdateVendorBankDetailsCommand` | `CommandResult<Vendor>` | — | Routing 9 digits; account 4–17 digits; not DEACTIVATED |

### Events Emitted

| Command | Event |
|---|---|
| createVendor | `vendor.created` |
| updateVendor | `vendor.updated` |
| approveVendor | `vendor.approved` |
| rejectVendor | `vendor.rejected` |
| suspendVendor | `vendor.suspended` |
| reactivateVendor | `vendor.reactivated` |
| deactivateVendor | `vendor.deactivated` |
| updateBankDetails | `vendor.bank_updated` |

---

## 2. InvoiceApplicationService

**File**: `src/server/procurement/application/invoice-service.ts` (1336 lines)  
**Aggregate Roots**: `VendorInvoice`, `ThreeWayMatch`, `InvoiceException`  
**State Machine**: `CAPTURED → VALIDATED → THREE_WAY_MATCHING → MATCHED → PENDING_APPROVAL → APPROVED → PARTIALLY_PAID → PAID` (with EXCEPTION, VOIDED, BLOCKED, DISPUTED branches)

### Status Constraints

| Constant | Allowed Statuses |
|---|---|
| `RECEIVABLE_STATUSES` | CAPTURED |
| `VOIDABLE_STATUSES` | CAPTURED, VALIDATED |
| `VALIDATABLE_STATUSES` | CAPTURED |
| `MATCHABLE_STATUSES` | VALIDATED |
| `APPROVAL_PASS_THROUGH_STATUSES` | MATCHED |
| `SCHEDULABLE_STATUSES` | APPROVED |
| `BLOCKABLE_STATUSES` | CAPTURED, VALIDATED |
| `DISPUTABLE_STATUSES` | CAPTURED, VALIDATED, MATCHED |

### Commands

| # | Method | Input Type | Return Type | State Transition | Key Business Rules |
|---|---|---|---|---|---|
| 1 | `receiveInvoice` | `ReceiveInvoiceCommand` | `CommandResult<VendorInvoice>` | — → CAPTURED | Vendor must be ACTIVE; unique invoice # per vendor; line items computed via `financial-precision.ts` |
| 2 | `updateInvoice` | `UpdateInvoiceCommand` | `CommandResult<VendorInvoice>` | CAPTURED → CAPTURED | Only CAPTURED; at least one field; line items fully replaced if provided |
| 3 | `voidInvoice` | `VoidInvoiceCommand` | `CommandResult<VendorInvoice>` | CAPTURED/VALIDATED → VOIDED | Reason ≥ 10 chars; records previousStatus |
| 4 | `validateInvoice` | `{ invoiceId }` | `CommandResult<VendorInvoice>` | CAPTURED → VALIDATED or EXCEPTION | Checks: line items exist, unit price > 0, quantity > 0, line total > 0, due date ≥ invoice date, total > 0. On failure: creates `InvoiceException` |
| 5 | `runThreeWayMatch` | `RunThreeWayMatchCommand` | `CommandResult<VendorInvoice>` | VALIDATED → MATCHED or EXCEPTION | Requires PO reference; computes price/quantity variance; on exception: creates `InvoiceException` with `PRICE_VARIANCE` type |
| 6 | `overrideMatchResult` | `OverrideMatchCommand` | `CommandResult<VendorInvoice>` | EXCEPTION → MATCHED | Reason ≥ 20 chars; match must be exception status; confidence set to 0.5 |
| 7 | `approveInvoice` | `{ invoiceId }` | `CommandResult<VendorInvoice>` | MATCHED/PENDING_APPROVAL → APPROVED | Pass-through from approval service; sets approvedAt/approvedBy |
| 8 | `rejectInvoice` | `{ invoiceId; reason }` | `CommandResult<VendorInvoice>` | MATCHED/PENDING_APPROVAL/APPROVED → REJECTED | Reason ≥ 10 chars; sets rejectedAt/rejectedBy/rejectionReason |
| 9 | `escalateInvoice` | `{ invoiceId; reason }` | `CommandResult<VendorInvoice>` | MATCHED/PENDING_APPROVAL → MATCHED/PENDING_APPROVAL | Reason ≥ 10 chars; no state change (escalation marker) |
| 10 | `scheduleForPayment` | `{ invoiceId }` | `CommandResult<VendorInvoice>` | APPROVED → PENDING_APPROVAL | Vendor must not be SUSPENDED; sets approvalRequired = true |
| 11 | `blockInvoice` | `{ invoiceId; reason; blockType }` | `CommandResult<VendorInvoice>` | CAPTURED/VALIDATED → EXCEPTION | Reason ≥ 10 chars; sets internalMemo with block tag; records previousStatus |
| 12 | `unblockInvoice` | `{ invoiceId; reason }` | `CommandResult<VendorInvoice>` | EXCEPTION → (restored previousStatus) | Reason ≥ 10 chars; restores previousStatus from CAPTURED/VALIDATED |
| 13 | `disputeInvoice` | `{ invoiceId; disputeReason }` | `CommandResult<VendorInvoice>` | CAPTURED/VALIDATED/MATCHED → EXCEPTION | Reason ≥ 10 chars; sets internalMemo with DISPUTED tag |
| 14 | `resolveDispute` | `{ invoiceId; resolution; resolutionNotes }` | `CommandResult<VendorInvoice>` | EXCEPTION → voided/restored status | Notes ≥ 20 chars; resolution "voided" → VOIDED; otherwise restores previousStatus |
| 15 | `deleteInvoice` | `{ invoiceId; reason }` | `CommandResult<VendorInvoice>` | CAPTURED → VOIDED | Soft void only; reason ≥ 10 chars; sets internalMemo |

### Events Emitted

| Command | Event |
|---|---|
| receiveInvoice | `invoice.captured` |
| updateInvoice | `invoice.updated` |
| voidInvoice | `invoice.voided` |
| validateInvoice | `invoice.validated` or `invoice.validation_failed` + `exception.created` |
| runThreeWayMatch | `invoice.matched` or `invoice.match.exception` + `exception.created` |
| overrideMatchResult | `invoice.match.override` |
| approveInvoice | `invoice.captured` (reuse) |
| rejectInvoice | *(audit only, no event)* |
| escalateInvoice | *(audit only, no event)* |
| scheduleForPayment | `invoice.payment.scheduled` |
| blockInvoice | `invoice.blocked` |
| unblockInvoice | `invoice.unblocked` |
| disputeInvoice | `invoice.disputed` |
| resolveDispute | `invoice.dispute_resolved` |
| deleteInvoice | `invoice.voided` |

---

## 3. ExceptionApplicationService

**File**: `src/server/procurement/application/exception-service.ts` (578 lines)  
**Aggregate Root**: `InvoiceException`  
**State Machine**: `OPEN → IN_REVIEW → RESOLVED | ESCALATED`

### SLA Deadlines

| Severity | SLA Hours |
|---|---|
| CRITICAL | 0 (immediate) |
| HIGH | 4 |
| MEDIUM | 24 |
| LOW | 48 |

### Commands

| # | Method | Input Type | Return Type | State Transition | Key Business Rules |
|---|---|---|---|---|---|
| 1 | `createException` | `CreateExceptionCommand` | `CommandResult<InvoiceException>` | — → OPEN | Dedup: re-opens existing OPEN exception of same type; calculates SLA deadline; validates severity |
| 2 | `assignException` | `AssignExceptionCommand` | `CommandResult<InvoiceException>` | OPEN → IN_REVIEW | Must be OPEN; assignedTo required |
| 3 | `resolveException` | `ResolveExceptionCommand` | `CommandResult<InvoiceException>` | IN_REVIEW/ESCALATED → RESOLVED | Notes ≥ 20 chars; also updates parent invoice EXCEPTION → MATCHED |
| 4 | `escalateException` | `EscalateExceptionCommand` | `CommandResult<InvoiceException>` | OPEN/IN_REVIEW → ESCALATED | Reason required; records escalatedTo/escalatedAt |
| 5 | `autoResolveException` | `{ exceptionId; patternId; confidence }` | `CommandResult<InvoiceException>` | OPEN → RESOLVED | Confidence ≥ 0.85; type must be PRICE_VARIANCE or QTY_VARIANCE; resolvedBy = `system:{patternId}` |
| 6 | `bulkResolveExceptions` | `{ exceptionIds[]; resolution; resolutionNotes }` | `CommandResult<InvoiceException[]>` | IN_REVIEW/ESCALATED → RESOLVED | Max 50 exceptions; all same type; all must be resolvable status; atomic resolution |

---

## 4. ApprovalApplicationService

**File**: `src/server/procurement/application/approval-service.ts` (831 lines)  
**Aggregate Root**: `ApprovalRecord`  
**State Machine**: `PENDING → APPROVED | REJECTED | DELEGATED | SKIPPED`

### Approval Threshold Tiers

| Amount Range | Level Name | Required Role |
|---|---|---|
| < $1,000 | Auto-Approve | SYSTEM |
| $1,000 – $10,000 | AP Manager | AP_MANAGER |
| $10,000 – $50,000 | Controller | CONTROLLER |
| $50,000 – $100,000 | CFO | CFO |
| > $100,000 | Treasury Manager | TREASURY_MANAGER |

### Commands

| # | Method | Input Type | Return Type | State Transition | Key Business Rules |
|---|---|---|---|---|---|
| 1 | `requestApproval` | `RequestApprovalCommand` | `CommandResult<ApprovalRecord[]>` | MATCHED → PENDING_APPROVAL | < $1K auto-approves; creates multi-level chain; SoD: no duplicate active chains |
| 2 | `approveLevel` | `DecideApprovalCommand` | `CommandResult<ApprovalRecord>` | PENDING → APPROVED | SoD: invoice creator ≠ approver; delegates check; auto-unlocks next SKIPPED level; chain complete → invoice APPROVED |
| 3 | `rejectLevel` | `DecideApprovalCommand` | `CommandResult<ApprovalRecord>` | PENDING → REJECTED | Subsequent levels → SKIPPED; invoice → EXCEPTION; creates APPROVAL_REQUIRED exception |
| 4 | `delegateApproval` | `DelegateApprovalCommand` | `CommandResult<ApprovalRecord>` | PENDING → DELEGATED | Reason required; delegatedTo user will see approval in their queue |
| 5 | `escalateApprovalLevel` | `EscalateApprovalCommand` | `CommandResult<ApprovalRecord>` | PENDING → APPROVED (auto) | Current level auto-approved via escalation; next level activated; if all levels done → invoice APPROVED |
| 6 | `recallApproval` | `{ approvalRecordId; reason }` | `CommandResult<ApprovalRecord>` | APPROVED → PENDING | Reason ≥ 20 chars; invoice must not be PAID; reverts all levels ≥ this level to PENDING; invoice → MATCHED |

---

## 5. PaymentApplicationService

**File**: `src/server/procurement/application/payment-service.ts` (953 lines)  
**Aggregate Roots**: `PaymentProposal`, `PaymentBatch`, `PaymentRecord`

### Payment Lifecycle

```
generatePaymentProposal → reviewPaymentProposal → approvePaymentProposal
  → createPaymentBatch → executePayment → confirmPayment

Safety valves: reversePayment, cancelPayment
```

### Payment Proposal Authority

| Total Amount | Required Role |
|---|---|
| < $100,000 | AP_MANAGER |
| $100,000 – $500,000 | CONTROLLER |
| > $500,000 | CFO |

### Commands

| # | Method | Input Type | Return Type | State Transition | Key Business Rules |
|---|---|---|---|---|---|
| 1 | `generatePaymentProposal` | `GeneratePaymentProposalCommand` | `CommandResult<PaymentProposal>` | — → DRAFT | Filters APPROVED unscheduled invoices with dueDate ≤ paymentDate; prioritizes early-pay discounts; respects maxAmount cap |
| 2 | `reviewPaymentProposal` | `{ proposalId; notes? }` | `CommandResult<PaymentProposal>` | DRAFT → REVIEWED | Must be DRAFT |
| 3 | `approvePaymentProposal` | `ApprovePaymentProposalCommand` | `CommandResult<PaymentProposal>` | REVIEWED → APPROVED | SoD: creator ≠ approver; amount authority check |
| 4 | `rejectPaymentProposal` | `RejectPaymentProposalCommand` | `CommandResult<PaymentProposal>` | REVIEWED → REJECTED | Reason ≥ 10 chars |
| 5 | `createPaymentBatch` | `CreatePaymentBatchCommand` | `CommandResult<PaymentBatch>` | APPROVED → EXECUTED | Creates batch + individual PaymentRecords; idempotent (one batch per proposal) |
| 6 | `executePayment` | `ExecutePaymentCommand` | `CommandResult<PaymentRecord>` | PROCESSED → CLEARED | Idempotency check via key; double-payment check per invoice |
| 7 | `confirmPayment` | `ConfirmPaymentCommand` | `CommandResult<PaymentRecord>` | PROCESSED/CLEARED → CLEARED | Updates invoice amountPaid/balanceDue; invoice → PAID/PARTIALLY_PAID; batch → COMPLETED if all confirmed |
| 8 | `reversePayment` | `ReversePaymentCommand` | `CommandResult<PaymentRecord>` | CLEARED/PROCESSED → REVERSED | Reason ≥ 20 chars; restores invoice amountPaid/balanceDue; invoice → APPROVED |
| 9 | `cancelPayment` | `CancelPaymentCommand` | `CommandResult<PaymentRecord>` | PROCESSED → VOIDED | Reason required; restores invoice → APPROVED |

### Events Emitted

| Command | Event |
|---|---|
| generatePaymentProposal | `proposal.generated` |
| reviewPaymentProposal | `proposal.reviewed` |
| approvePaymentProposal | `proposal.approved` |
| rejectPaymentProposal | `proposal.rejected` |
| createPaymentBatch | `batch.created` |
| executePayment | `payment.submitted` |
| confirmPayment | `payment.confirmed` |
| reversePayment | `payment.reversed` |
| cancelPayment | `payment.cancelled` |

---

## 6. ReconciliationApplicationService

**File**: `src/server/procurement/application/reconciliation-service.ts` (595 lines)  
**Aggregate Roots**: `ReconciliationResult`, `VendorStatement`, `VendorStatementLine`  
**State Machine**: `IN_PROGRESS → COMPLETED | EXCEPTION → ADJUSTED → COMPLETED`

### Commands

| # | Method | Input Type | Return Type | State Transition | Key Business Rules |
|---|---|---|---|---|---|
| 1 | `importVendorStatement` | `ImportVendorStatementCommand` | `CommandResult<ReconciliationResult>` | — → IN_PROGRESS | Vendor exists; no active reconciliation for same vendor+period; computes balanceVariance from opening/closing/lines |
| 2 | `runReconciliation` | `RunReconciliationCommand` | `CommandResult<ReconciliationResult>` | IN_PROGRESS → COMPLETED or EXCEPTION | Two-pass matching: (1) reference match, (2) amount match; computes matchRate; discrepancyCount > 0 → EXCEPTION |
| 3 | `adjustReconciliation` | `AdjustReconciliationCommand` | `CommandResult<ReconciliationResult>` | EXCEPTION → ADJUSTED | Total adjustments must equal absolute variance; validates each statement line exists |
| 4 | `completeReconciliation` | `CompleteReconciliationCommand` | `CommandResult<ReconciliationResult>` | COMPLETED/ADJUSTED → COMPLETED | Final variance must be 0; sets resolvedBy/resolvedAt |

---

## 7. CreditApplicationService

**File**: `src/server/procurement/application/credit-service.ts` (360 lines)  
**Aggregate Root**: `VendorCredit`  
**State Machine**: `ISSUED → PARTIALLY_APPLIED → FULLY_APPLIED | EXPIRED`

### Commands

| # | Method | Input Type | Return Type | State Transition | Key Business Rules |
|---|---|---|---|---|---|
| 1 | `receiveCreditNote` | `ReceiveCreditNoteCommand` | `CommandResult<VendorCredit>` | — → ISSUED | Vendor exists; unique credit number per vendor; amount > 0; reason ≥ 10 chars; related invoice must belong to same vendor |
| 2 | `applyCreditNote` | `ApplyCreditNoteCommand` | `CommandResult<VendorCredit>` | ISSUED/PARTIALLY_APPLIED → PARTIALLY_APPLIED or FULLY_APPLIED | Total applications ≤ remaining balance; each invoice same vendor + currency; application ≤ invoice balanceDue |
| 3 | `voidCreditNote` | `VoidCreditNoteCommand` | `CommandResult<VendorCredit>` | ISSUED/PARTIALLY_APPLIED → EXPIRED | Reason ≥ 20 chars; reverses all applied amounts on invoices; terminal state |

---

## Cross-Cutting Concerns

### Audit Trail

Every command produces at least one `AuditEntry` with:
- `action`: `domain.entity.action` pattern (e.g., `vendor.created`, `invoice.matched`)
- `resourceType` + `resourceId`: immutable reference
- `actorId` + `companyId`: who and where
- `metadata`: command-specific context (changed fields, reasons, amounts)
- `severity`: INFO, WARNING, or CRITICAL

### Event Sourcing Readiness

Events are structured for future event store adoption:
- `eventType`: hierarchical string (`vendor.created`)
- `aggregateType` + `aggregateId`: aggregate reference
- `correlationId`: distributed tracing
- `timestamp`: event creation time
- `payload`: JSON-serializable data

### Separation of Duties (SoD)

| Rule | Enforcement Point |
|---|---|
| Vendor creator ≠ vendor approver | `VendorApplicationService.approveVendor` |
| Invoice creator ≠ invoice approver | `ApprovalApplicationService.approveLevel` |
| Proposal creator ≠ proposal approver | `PaymentApplicationService.approvePaymentProposal` |
| Payment proposal amount authority | `PaymentApplicationService.approvePaymentProposal` |
| Approval threshold tiers | `ApprovalApplicationService.requestApproval` |
