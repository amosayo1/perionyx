# Phase 21.0 — Accounts Payable Workflow Definition

> **Status**: Complete
> **Type**: Documentation-only — workflow blueprint
> **Date**: July 21, 2026
> **Scope**: Full 14-stage procure-to-pay workflow with every stage documented

---

## Overview

This document defines the target Accounts Payable workflow — a 14-stage procure-to-pay pipeline. Each stage specifies inputs, outputs, owner, evidence, approvals, recovery path, audit trail, and integration points.

**Design Principles**:
1. Every stage produces audit evidence (immutable record)
2. Every approval is threshold-routed and delegation-aware
3. Every exception is recoverable (no dead-end states)
4. Every number is financial-precision-safe (Decimal, never native number)
5. Every transition is recorded with who/when/why

---

## Stage 1: Vendor Onboarding

**Purpose**: Register a new vendor with full due diligence before any purchasing activity.

| Field | Value |
|---|---|
| **Owner** | AP Clerk / Procurement Manager |
| **Inputs** | Vendor name, tax ID, bank details, contact info, W-9/W-8BEN, insurance certificates |
| **Outputs** | Vendor record (status: pending_review → active), risk score |
| **Approvals** | New vendor requires Procurement Manager approval. High-risk vendors (>50% risk score) require Controller approval. |
| **Evidence** | `VendorAudit`: vendorId, action (created/approved/rejected/suspended), performedBy, timestamp, reason, documents[] |
| **Recovery** | Rejected vendors can be re-submitted with additional documentation. Suspended vendors block new POs but allow existing obligations. |
| **Audit Trail** | `recordAudit('vendor.created', { vendorId, requestedBy })`, `recordAudit('vendor.approved', { vendorId, approvedBy, riskScore })` |
| **Integrations** | `recordAudit()`, `VendorService.create()`, `NotificationService` (notify on approval/rejection), `BudgetService` (reserve capacity check) |
| **Failure Modes** | Duplicate vendor detection (match by tax ID + name), bank detail validation (routing number format), sanctions screening (future) |
| **Automation** | Auto-approve vendors with risk score <20% and spend <10K. Auto-suspend vendors with expired insurance. |

### Prisma Model: `ProcurementVendor`

```
id, companyId, name, taxId, email, phone, address, bankAccountNumber,
bankRoutingNumber, bankName, riskScore, status (pending_review/active/suspended/deactivated),
category, paymentTerms, creditLimit, insuranceExpiry, documentsJson,
createdBy, updatedBy, createdAt, updatedAt
```

---

## Stage 2: Purchase Request

**Purpose**: Internal requester submits a need for goods/services with budget justification.

| Field | Value |
|---|---|
| **Owner** | Requester (any employee) |
| **Inputs** | Items (description, quantity, unit, estimated price), cost center, project code, business justification, required-by date |
| **Outputs** | PurchaseRequest (status: submitted), linked to budget line |
| **Approvals** | Auto-route based on total: <$500 = department head, $500-$5K = department head + AP manager, $5K-$25K = + Controller, >$25K = + CFO. Thresholds from automation-studio approval matrix. |
| **Evidence** | `PRAudit`: prId, action, performedBy, timestamp, budgetAvailable, totalAmount |
| **Recovery** | Rejected PRs return to requester with reason. Can be revised and re-submitted. Withdrawn PRs release budget reservation. |
| **Audit Trail** | `recordAudit('pr.created', { prId, requesterId, totalAmount })`, `recordAudit('pr.approved', { prId, approverId, level })` |
| **Integrations** | `PurchaseRequestService.create()`, `ApprovalMatrixEvaluator.evaluate()` (from automation-studio), `BudgetService.checkAvailable()` |
| **Failure Modes** | Budget exceeded (block + notify), invalid cost center (block), missing justification (block) |
| **Automation** | Auto-approve PRs <$500 for trusted requesters (10+ previous PRs, 0 rejections). Auto-convert approved PRs to POs. |

### Prisma Model: `ProcurementPR`

```
id, companyId, requesterId, title, description, costCenter, projectCode,
totalAmount, currency, status (draft/submitted/approved/rejected/withdrawn/converted),
businessJustification, requiredByDate, budgetLineId, approvalLevel,
createdBy, updatedBy, createdAt, updatedAt

relation: ProcurementPRItem[]
```

---

## Stage 3: PR Approval

**Purpose**: Multi-level approval chain validates the purchase request against budget, policy, and authority.

| Field | Value |
|---|---|
| **Owner** | Approvers (role-based routing) |
| **Inputs** | PR details, approver list from approval matrix, delegation rules |
| **Outputs** | Approval decision (approved/rejected/escalated/delegated), approval chain record |
| **Approvals** | Sequential chain with parallel escalation. Each level approves independently. Delegation to alternate approver if primary unavailable for >24h. |
| **Evidence** | `ApprovalChain`: prId, level, approverId, decision, timestamp, reason, delegatedFrom, slaDeadline |
| **Recovery** | Rejected at any level → PR returns to requester. Escalated → next level or Controller. Timed out (48h) → auto-escalate. |
| **Audit Trail** | `recordAudit('pr.approval.submitted', { prId, level, approverId })`, `recordAudit('pr.approval.decided', { prId, level, decision, reason })` |
| **Integrations** | `automation-studio/approval-matrix/` (threshold routing), `NotificationService` (approval needed), `HumanInteraction` (from agent framework for escalation) |
| **Failure Modes** | All approvers unavailable (escalate to CFO), approval chain circular delegation (detect + block), SLA breach (auto-escalate) |
| **Automation** | Auto-route via approval matrix rules. Auto-escalate on SLA breach. Auto-approve if same item approved in last 30 days. |

---

## Stage 4: Purchase Order

**Purpose**: Generate a binding purchase order from the approved PR and send to the vendor.

| Field | Value |
|---|---|
| **Owner** | AP Manager / Procurement Manager |
| **Inputs** | Approved PR, vendor selection (preferred vendor, contract, spot-buy), delivery terms, payment terms |
| **Outputs** | PurchaseOrder (status: draft → sent → acknowledged), PO number (auto-generated) |
| **Approvals** | PO creation from approved PR is auto-approved. PO modification requires AP Manager. PO >$25K requires Controller. |
| **Evidence** | `POAudit`: poId, action, performedBy, timestamp, prId, vendorId, totalAmount, terms |
| **Recovery** | Draft POs can be edited/cancelled. Sent POs can be cancelled (with vendor notification). Acknowledged POs require change order. |
| **Audit Trail** | `recordAudit('po.created', { poId, prId, vendorId, totalAmount })`, `recordAudit('po.sent', { poId, sentTo })` |
| **Integrations** | `PurchaseOrderService.create()`, `ContractService` (check contract pricing), `CatalogService` (item lookup), `NotificationService` (send PO to vendor) |
| **Failure Modes** | Vendor not active (block), contract expired (warn), duplicate PO to same vendor (detect), budget reservation failure (block) |
| **Automation** | Auto-select preferred vendor by category + rating. Auto-calculate delivery date from vendor lead time. Auto-generate PO number. |

### Prisma Model: `ProcurementPO`

```
id, companyId, poNumber (unique per company), prId, vendorId,
totalAmount, currency, status (draft/sent/acknowledged/partially_received/received/closed/cancelled),
paymentTerms, deliveryTerms, expectedDeliveryDate, actualDeliveryDate,
shippingAddress, billingAddress, notes, approvalLevel,
createdBy, updatedBy, createdAt, updatedAt

relation: ProcurementPOItem[]
```

---

## Stage 5: Goods Receipt

**Purpose**: Record physical receipt of goods against a PO, triggering three-way match.

| Field | Value |
|---|---|
| **Owner** | Warehouse / Receiving Clerk |
| **Inputs** | PO number, items received (quantity, condition), delivery note, packing slip, photos (optional) |
| **Outputs** | GoodsReceipt (status: received/inspected/accepted/rejected), triggers 3-way match |
| **Approvals** | Acceptance of goods is warehouse clerk. Rejection requires procurement manager. Partial receipt auto-approved. |
| **Evidence** | `GRAudit`: grnId, action, performedBy, timestamp, poId, items[], condition, photos |
| **Recovery** | Rejected goods → return to vendor (RMA). Partial receipt → remaining items stay open on PO. Damaged goods → partial acceptance with damage report. |
| **Audit Trail** | `recordAudit('grn.created', { grnId, poId, receivedBy })`, `recordAudit('grn.inspected', { grnId, accepted, rejected })` |
| **Integrations** | `ReceivingService.create()`, `InvoiceMatchingService.perform3WayMatch()` (auto-trigger), `NotificationService` (notify AP of receipt) |
| **Failure Modes** | Quantity exceeds PO (block over-receipt or allow within tolerance), wrong items (reject + RMA), damaged goods (partial accept) |
| **Automation** | Auto-trigger 3-way match on receipt acceptance. Auto-notify AP of receipt. Auto-close PO when all items received. |

### Prisma Model: `ProcurementGRN`

```
id, companyId, grnNumber (unique per company), poId, receivedBy,
status (received/inspected/accepted/rejected), condition,
deliveryNoteNumber, packingSlipNumber, photosJson,
totalAcceptedAmount, totalRejectedAmount,
createdBy, updatedBy, createdAt, updatedAt

relation: ProcurementGRNItem[]
```

---

## Stage 6: Invoice Capture

**Purpose**: Receive and digitize a vendor invoice, linking it to the PO and recording all line items.

| Field | Value |
|---|---|
| **Owner** | AP Clerk |
| **Inputs** | Invoice PDF/image, invoice number, vendor, line items (description, qty, unit price, tax), payment terms, due date |
| **Outputs** | Invoice (status: captured), linked to PO, awaiting validation |
| **Approvals** | Invoice capture is AP Clerk (no approval needed for data entry). |
| **Evidence** | `InvoiceAudit`: invoiceId, action, performedBy, timestamp, source (manual/ocr/email), originalDocument |
| **Recovery** | Incorrectly captured invoices can be corrected before validation. Duplicate detection blocks re-entry. |
| **Audit Trail** | `recordAudit('invoice.captured', { invoiceId, vendorId, amount, capturedBy })` |
| **Integrations** | `InvoiceMatchingService.create()`, `DuplicateDetectionService` (future), `OCRService` (future) |
| **Failure Modes** | Duplicate invoice number (block + flag), invoice already matched (block), vendor not found (block), amount mismatch with PO (flag for review) |
| **Automation** | Auto-populate vendor details from PO. Auto-calculate line totals and tax. Auto-detect duplicates by vendor+invoice# within 90 days. |

### Prisma Model: `ProcurementInvoice`

```
id, companyId, invoiceNumber, vendorId, poId (optional),
totalAmount, taxAmount, currency, exchangeRate,
status (captured/validated/matched/exception/approved/paid/disputed/blocked),
dueDate, discountDate, discountPercent, discountAmount,
source (manual/ocr/email/api), ocrConfidence,
duplicateCheckPassed, duplicateOfInvoiceId,
createdBy, updatedBy, createdAt, updatedAt

relation: ProcurementInvoiceItem[]
```

---

## Stage 7: Invoice Validation

**Purpose**: Automated validation of invoice data completeness, accuracy, and compliance before matching.

| Field | Value |
|---|---|
| **Owner** | Automated (AP Clerk for exceptions) |
| **Inputs** | Captured invoice, PO data, contract terms, tolerance rules |
| **Outputs** | Validation result (passed/failed/exception), field-level validation details |
| **Approvals** | Automated validation requires no approval. Manual override requires AP Manager. |
| **Evidence** | `ValidationResult`: invoiceId, field, expected, actual, status (pass/fail/warning), rule, timestamp |
| **Recovery** | Failed validation → return to AP Clerk for correction. Warning → proceed with flag. Exception → route to exception queue. |
| **Audit Trail** | `recordAudit('invoice.validated', { invoiceId, result, exceptionCount })` |
| **Integrations** | `InvoiceMatchingService` (validation rules), `ContractService` (contract price check), `CatalogService` (item price check) |
| **Failure Modes** | Missing required fields (block), tax calculation error (flag), PO reference invalid (block), vendor inactive (block) |
| **Automation** | Auto-validate all fields against rules engine. Auto-calculate tax. Auto-apply tolerance rules. Auto-flag anomalies. |

### Validation Rules Engine

| Rule | Type | Severity | Action |
|---|---|---|---|
| Invoice number format | Format | Error | Block |
| Invoice date not future | Range | Error | Block |
| Due date > invoice date | Cross-field | Error | Block |
| Tax rate within jurisdiction limits | Business | Error | Block |
| Amount matches PO within tolerance | Cross-entity | Warning | Flag |
| Quantity matches GRN within tolerance | Cross-entity | Warning | Flag |
| Payment terms match contract | Business | Warning | Flag |
| Vendor bank details changed | Business | Error | Block + review |
| Duplicate invoice number detected | Duplicate | Error | Block |
| Amount > $50K requires additional approval | Threshold | Info | Escalate |

---

## Stage 8: Three-Way Match

**Purpose**: Automated matching of Invoice ↔ PO ↔ Goods Receipt to verify quantity, price, and receipt.

| Field | Value |
|---|---|
| **Owner** | Automated |
| **Inputs** | Validated invoice, linked PO, linked GRN, tolerance configuration |
| **Outputs** | MatchResult (matched/exception/partial), variance details |
| **Approvals** | Matched invoices proceed automatically. Exceptions require AP Clerk resolution. Price variance >$0.01 OR >1% requires AP Manager override. |
| **Evidence** | `MatchAudit`: invoiceId, matchType (2-way/3-way), quantityMatch, priceMatch, quantityVariance, priceVariance, tolerance, resolvedBy, resolution |
| **Recovery** | Price exception → AP Clerk contacts vendor, creates debit/credit note or adjusts invoice. Quantity exception → check GRN, resolve discrepancy. Total mismatch → block payment. |
| **Audit Trail** | `recordAudit('invoice.matched', { invoiceId, matchType, result, variance })`, `recordAudit('invoice.match.override', { invoiceId, overrideBy, reason })` |
| **Integrations** | `InvoiceMatchingService.perform2WayMatch()` / `perform3WayMatch()` (existing), `ReceivingService` (GRN data), `PurchaseOrderService` (PO data) |
| **Failure Modes** | No PO linked (2-way match only), GRN not yet received (hold match until receipt), tolerance exceeded (exception queue) |
| **Automation** | Auto-trigger on invoice validation. Auto-retry match if GRN arrives late. Auto-escalate on SLA breach (match pending >48h). |

### Tolerance Configuration

| Dimension | Default Tolerance | Override Level |
|---|---|---|
| Price variance | $0.01 absolute OR 0.5% | AP Manager |
| Quantity variance | 0 units | Procurement Manager |
| Tax variance | $0.00 | AP Manager |
| Freight variance | $5.00 | AP Manager |
| Total variance | $10.00 OR 1% | Controller |
| Per-vendor override | Configurable per vendor | Controller |

---

## Stage 9: Exception Queue

**Purpose**: Centralized management of all invoices that failed matching, validation, or require manual intervention.

| Field | Value |
|---|---|
| **Owner** | AP Clerk (resolution) / AP Manager (escalation) |
| **Inputs** | Exception invoices (from matching, validation, duplicate detection), exception type, severity, SLA |
| **Outputs** | Exception resolution (resolved/rejected/escalated/voided), root cause, corrective action |
| **Approvals** | Clerk can resolve within tolerance. Beyond tolerance → AP Manager. Voided invoice → Controller. |
| **Evidence** | `ExceptionAudit`: exceptionId, invoiceId, type (price/quantity/duplicate/missing_grn/missing_po), action, performedBy, timestamp, resolution |
| **Recovery** | Price mismatch → vendor debit note. Quantity mismatch → GRN correction. Duplicate → void one. Missing PO → retroactive PO. Missing GRN → urgent receipt. |
| **Audit Trail** | `recordAudit('exception.created', { exceptionId, invoiceId, type })`, `recordAudit('exception.resolved', { exceptionId, resolution, resolvedBy })` |
| **Integrations** | `InvoiceMatchingService.getExceptions()`, `NotificationService` (escalation alerts), `AgentFramework` (auto-resolution suggestions) |
| **Failure Modes** | SLA breach (auto-escalate), unresolved exceptions >30 days (Controller alert), pattern detection (same exception recurring) |
| **Automation** | Auto-assign exceptions by type and clerk expertise. Auto-suggest resolution based on historical patterns. Auto-escalate on SLA breach. Auto-detect patterns (same vendor, same item, recurring exception). |

### Prisma Model: `ProcurementException`

```
id, companyId, invoiceId, type (price_mismatch/quantity_mismatch/duplicate/missing_grn/missing_po/validation_failed/other),
severity (low/medium/high/critical), status (open/in_progress/resolved/rejected/escalated/voided),
slaDeadline, resolution, resolvedBy, rootCause, correctiveAction,
createdAt, resolvedAt, updatedAt
```

---

## Stage 10: Approval Workflow

**Purpose**: Multi-level invoice approval with threshold routing, delegation, and segregation of duties.

| Field | Value |
|---|---|
| **Owner** | Approvers (role-based) |
| **Inputs** | Matched invoice, approval rules (from approval matrix), delegation rules, authority limits |
| **Outputs** | Approval decision (approved/rejected/escalated/delegated), approval chain record |
| **Approvals** | Threshold-based: <$1K = AP Clerk, $1K-$10K = AP Manager, $10K-$50K = Controller, >$50K = CFO + Treasurer. Segregation: same person cannot create PO and approve invoice. |
| **Evidence** | `ApprovalRecord`: invoiceId, level, approverId, decision, timestamp, reason, delegatedFrom, slaDeadline |
| **Recovery** | Rejected → return to exception queue. Escalated → next level. Timed out (24h) → auto-escalate. |
| **Audit Trail** | `recordAudit('invoice.approval.submitted', { invoiceId, level, approverId })`, `recordAudit('invoice.approval.decided', { invoiceId, level, decision, reason })` |
| **Integrations** | `automation-studio/approval-matrix/` (routing), `NotificationService` (approval needed), `AgentFramework` (auto-approval for low-risk) |
| **Failure Modes** | All approvers unavailable (escalate to CFO), circular delegation (detect + block), segregation of duties violation (block), SLA breach (auto-escalate) |
| **Automation** | Auto-route via approval matrix. Auto-approve low-risk invoices (<$1K, matched, single-PO, trusted vendor). Auto-escalate on SLA breach. Delegation auto-assign based on holiday/absence calendar. |

---

## Stage 11: Payment Proposal

**Purpose**: Generate optimized payment proposals considering cash flow, early-pay discounts, and payment terms.

| Field | Value |
|---|---|
| **Owner** | AP Manager |
| **Inputs** | Approved invoices, payment terms, discount windows, cash position, payment methods |
| **Outputs** | Payment proposal (batch of invoices to pay), payment run record, discount savings analysis |
| **Approvals** | Payment proposal requires AP Manager approval. Batch >$100K requires Controller. |
| **Evidence** | `PaymentProposalAudit`: proposalId, invoiceCount, totalAmount, discountSavings, proposedPaymentDate, approvedBy |
| **Recovery** | Rejected proposal → modify and resubmit. Partial approval → split proposal. |
| **Audit Trail** | `recordAudit('payment.proposal.created', { proposalId, invoiceCount, totalAmount })`, `recordAudit('payment.proposal.approved', { proposalId, approvedBy })` |
| **Integrations** | `PaymentService.propose()` (new), `InvoiceMatchingService` (approved invoices), `TreasuryService` (cash position), `automation-studio/` (payment scheduling) |
| **Failure Modes** | Insufficient cash (defer to treasury), discount window missed (flag), payment method unavailable (fallback) |
| **Automation** | Auto-generate daily payment proposals. Auto-prioritize invoices with approaching discount dates. Auto-select payment method by vendor preference. Auto-optimize payment timing for cash flow. |

### Prisma Model: `ProcurementPaymentProposal`

```
id, companyId, proposalNumber, proposedPaymentDate, totalAmount,
currency, invoiceCount, discountSavings, status (draft/submitted/approved/rejected/processed),
approvedBy, rejectedReason,
createdAt, approvedAt, processedAt, updatedAt

relation: ProcurementPaymentItem[]
```

---

## Stage 12: Treasury Approval & Payment Execution

**Purpose**: Treasury validates funding availability, executes payment, and confirms completion.

| Field | Value |
|---|---|
| **Owner** | Treasury Manager / Treasury Analyst |
| **Inputs** | Approved payment proposal, bank accounts, cash position, payment methods |
| **Outputs** | Payment execution (status: pending/processing/completed/failed/confirmed), bank reference |
| **Approvals** | Single-signature for <$10K. Dual-signature for $10K-$100K. Treasurer approval for >$100K. Wire >$500K requires CFO + Treasurer. |
| **Evidence** | `PaymentExecutionAudit`: paymentId, proposalId, executedBy, bankReference, confirmationTimestamp, amount, method |
| **Recovery** | Failed payment → retry up to 3 times with exponential backoff. Rejected by treasury → return to AP Manager. Bank confirmation pending → hold. |
| **Audit Trail** | `recordAudit('payment.submitted', { paymentId, proposalId, bankAccount, amount })`, `recordAudit('payment.completed', { paymentId, bankReference, confirmedBy })` |
| **Integrations** | `PaymentService.execute()` (new), `TreasuryService` (cash position), `NotificationService` (payment confirmation), `GLIntegrationService.generatePaymentEntry()` |
| **Failure Modes** | Insufficient funds (defer + notify), bank API failure (retry + alert), duplicate payment (idempotency check), payment confirmation timeout (hold) |
| **Automation** | Auto-batch payments by bank account. Auto-generate payment file (ACH/wire/check). Auto-confirm when bank acknowledgment received. Auto-retry failed payments. |

### Prisma Model: `ProcurementPayment`

```
id, companyId, paymentNumber (unique per company), proposalId, invoiceId,
vendorId, amount, currency, exchangeRate,
method (ach/wire/check/card), status (pending/processing/completed/failed/confirmed),
bankAccount, bankReference, confirmationNumber,
approvedBy, executedBy, confirmedBy,
scheduledDate, executedAt, confirmedAt,
idempotencyKey (unique),
createdAt, updatedAt
```

---

## Stage 13: General Ledger Posting

**Purpose**: Automatically post all financial impacts to the general ledger with proper account coding.

| Field | Value |
|---|---|
| **Owner** | Automated |
| **Inputs** | Payment confirmation, invoice data, GL account mapping |
| **Outputs** | Journal entries (debit/credit), GL posting record, subledger reconciliation |
| **Approvals** | Automated posting requires no approval. Manual journal adjustment requires Controller. |
| **Evidence** | `GLPostingAudit`: paymentId, journalEntryId, debitAccount, creditAccount, amount, postingDate, batchId |
| **Recovery** | Failed posting → retry. Incorrect posting → reversing entry. Partial posting → complete batch. |
| **Audit Trail** | `recordAudit('gl.posted', { journalEntryId, paymentId, amount })`, `recordAudit('gl.reversal', { journalEntryId, reason })` |
| **Integrations** | `GLIntegrationService.generatePaymentEntry()` (existing, needs wiring), `GLService.postJournalEntry()` (existing), `GLService.validateJournalEntry()` (existing) |
| **Failure Modes** | Account not found (block), unbalanced entry (block), period closed (hold until next period), duplicate posting (idempotency check) |
| **Automation** | Auto-post on payment confirmation. Auto-batch by period. Auto-reconcile AP subledger to GL. Auto-generate period-end accruals. |

---

## Stage 14: Vendor Statement Reconciliation

**Purpose**: Periodic reconciliation of vendor statements against the AP ledger to identify discrepancies.

| Field | Value |
|---|---|
| **Owner** | AP Manager / Controller |
| **Inputs** | Vendor statement (uploaded/imported), AP ledger, open invoices, credit notes |
| **Outputs** | Reconciliation report (matched/unmatched/discrepancies), adjustment entries |
| **Approvals** | Discrepancies <$50 = AP Clerk. $50-$500 = AP Manager. >$500 = Controller. |
| **Evidence** | `ReconciliationAudit`: vendorId, period, statementTotal, ledgerTotal, variance, matchedInvoices, unmatchedInvoices, adjustedBy |
| **Recovery** | Missing invoice → investigate + rebook. Wrong amount → debit/credit note. Missing payment → trace bank reference. |
| **Audit Trail** | `recordAudit('reconciliation.completed', { vendorId, period, variance })`, `recordAudit('reconciliation.adjustment', { vendorId, amount, reason })` |
| **Integrations** | `ReconciliationService` (new), `InvoiceMatchingService` (invoice data), `PaymentService` (payment data), `GLIntegrationService` (GL entries) |
| **Failure Modes** | Statement format unknown (manual entry), large variance (>10% of balance → Controller alert), repeated discrepancies (pattern detection) |
| **Automation** | Auto-match vendor statement lines to AP ledger. Auto-flag unmatched items. Auto-generate reconciliation report. Auto-suggest adjustments for small variances. |

---

## Cross-Cutting Concerns

### Audit Trail (All Stages)

Every stage transition writes to a unified audit chain:

```
AuditEvent {
  id, companyId, entityType, entityId, action,
  performedBy, timestamp, details (JSON),
  ipAddress, userAgent, correlationId
}
```

Audit events are **immutable** — append-only, no updates, no deletes. The audit chain provides:
- Complete invoice-to-payment lifecycle traceability
- Proof of segregation of duties compliance
- SLA adherence evidence
- Exception resolution evidence
- Financial posting evidence

### Notification Events (All Stages)

| Event | Recipient | Channel |
|---|---|---|
| PR submitted | Department head | Email + in-app |
| PR approved/rejected | Requester | Email + in-app |
| PO sent | AP Manager | In-app |
| GRN received | AP Clerk | In-app |
| Invoice captured | AP Queue | In-app |
| Match exception | AP Clerk | Email + in-app |
| Invoice approval needed | Approver | Email + in-app |
| Payment proposed | AP Manager | In-app |
| Payment executed | Requester + AP Manager | Email + in-app |
| Reconciliation discrepancy | AP Manager | Email + in-app |

### Financial Precision (All Stages)

All monetary values use `Prisma.Decimal(20,4)` or `financial-precision.ts` helpers:
- `financialRound(amount, 2)` for display
- `sumDecimals(amounts)` for aggregation
- `multiplyDecimals(price, quantity)` for line totals
- `allocateAmount(total, parts)` for split allocations
- Zero native `number` arithmetic on monetary values

### Multi-Tenancy (All Stages)

Every query, mutation, and audit event is scoped to `companyId`:
- `requireTenantContext()` at API route level
- `companyId` filter on every Prisma query
- Cross-tenant access blocked at service layer

---

*End of Phase 21.0 — Accounts Payable Workflow Definition*
