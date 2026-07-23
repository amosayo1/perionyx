# Phase 21A.0 — Accounts Payable Command & Query Model

> **Status**: Complete
> **Type**: Documentation-only — CQRS architecture specification
> **Date**: July 21, 2026
> **Scope**: Every command and query in the Accounts Payable domain
> **Depends on**: AP_AGGREGATES.md, AP_STATE_MACHINES.md, ACCOUNTS_PAYABLE_WORKFLOW.md
> **Predecessor**: Phase 21.0 (Gap Analysis, Workflow, Implementation Plan)

---

## Overview

This document defines the **Command Query Responsibility Segregation (CQRS)** model for the Accounts Payable domain. Every state-changing operation is a **Command**. Every read operation is a **Query**. Commands and queries are structurally separated, independently optimized, and governed by different access patterns.

### Design Principles

1. **Commands are intent** — they express what the user wants to happen, validated against business rules before persistence.
2. **Queries are projections** — they return pre-shaped data optimized for the consumer (UI, report, API).
3. **Every command produces a domain event** — immutable evidence of what happened, when, and who initiated it.
4. **Every command is authorized** — role-based access checked before execution, not after.
5. **Every command is auditable** — the audit trail is a first-class output, not an afterthought.
6. **Idempotency is mandatory for financial mutations** — duplicate execution must return the same result.
7. **Financial precision is sacred** — all monetary values use `Prisma.Decimal(38, 12)` and `financial-precision.ts` helpers.

### Terminology Alignment

| Term in this document | Prisma Model | Aggregate Root |
|---|---|---|
| Vendor | `ProcurementVendor` | Vendor |
| VendorInvoice | `ProcurementInvoice` | VendorInvoice |
| ThreeWayMatch | `ProcurementMatch` | ThreeWayMatch |
| InvoiceException | `ProcurementException` | InvoiceException |
| ApprovalChain | `ProcurementApprovalChain` | ApprovalChain |
| PaymentProposal | `ProcurementPaymentProposal` | PaymentProposal |
| PaymentBatch | `ProcurementPaymentBatch` | PaymentBatch |
| Payment | `ProcurementPayment` | PaymentBatch (child) |
| VendorCredit | `ProcurementCreditNote` | VendorCredit |
| Reconciliation | `ProcurementReconciliation` | Reconciliation |

### Role Definitions

| Role | Scope | Authority |
|---|---|---|
| AP Clerk | Daily operations | Enter invoices, run matches, resolve exceptions within tolerance |
| AP Manager | Oversight | Approve invoices <$10K, manage proposals, vendor relationships |
| Controller | Compliance | Approve invoices $10K–$100K, audit trails, SoD enforcement |
| Treasury Manager | Payment execution | Approve payment batches, execute payments >$100K |
| Procurement Manager | Vendor/PO lifecycle | Vendor onboarding, PO management |
| Auditor | Read-only | Review audit trails, test controls |
| Budget Owner | Read + limited approve | PR approval within budget |
| System | Automated operations | Auto-match, auto-escalate, auto-post |

---

## Part 1: Command Catalog — Specification Format

Every command in this document follows this specification structure:

| Field | Description |
|---|---|
| **Command Name** | PascalCase identifier. Single atomic operation. |
| **Purpose** | What this command achieves in business terms. |
| **Aggregate Root** | Which aggregate this command mutates. |
| **Input Parameters** | Required and optional parameters with TypeScript types. |
| **Pre-conditions** | State and data conditions that must hold before execution. |
| **Business Rules** | Validation logic, invariant checks, cross-entity rules. |
| **Side Effects** | State changes, domain events emitted, audit records written, notifications sent. |
| **Post-conditions** | Guarantees about system state after successful execution. |
| **Idempotency** | Whether the command is idempotent and the deduplication mechanism. |
| **Authorized Roles** | Which roles may execute this command, with threshold variations. |
| **Error Cases** | Failure modes, error types returned, recovery paths. |

### Command Classification

| Category | Count | Idempotency | Audit Level |
|---|---|---|---|
| Vendor | 8 | Partial (creates are not; updates are) | Full |
| Invoice | 15 | Yes (financial mutation) | Full |
| Exception | 6 | Partial (creates are not; resolves are) | Full |
| Approval | 6 | Yes (decision is final) | Full |
| Payment | 9 | Yes (financial — mandatory) | Full |
| Reconciliation | 4 | Partial (imports are not; completes are) | Full |
| Credit | 3 | Yes (financial mutation) | Full |
| **Total** | **51** | | |

### Command Execution Pipeline

Every command follows this execution path:

```
API Route (Zod validation)
  → Command Handler (authorization check)
    → Service Layer (business rules, aggregate invariants)
      → Repository (persistence, DB constraints)
        → Domain Events (post-commit)
          → Audit Record (same transaction)
            → Notifications (async)
```

| Step | Responsibility | Failure Mode |
|---|---|---|
| API Route | Input parsing, Zod schema validation | 400 Bad Request — malformed input |
| Command Handler | Role authorization, tenant context | 403 Forbidden — unauthorized |
| Service Layer | Business rules, state machine transitions, invariant checks | 422 Unprocessable — business rule violation |
| Repository | Persistence, DB constraints, unique constraints | 409 Conflict — constraint violation |
| Domain Events | Read model updates, cross-aggregate coordination | Logged, retried — eventual consistency |
| Audit Record | Immutable evidence of the command | Rolled back with command — atomic |
| Notifications | Async delivery (email, in-app, Slack) | Best effort — logged on failure |

---

## Part 2: Vendor Commands

### 2.1 CreateVendor

| Field | Content |
|---|---|
| **Purpose** | Register a new vendor in the system with all required due diligence data. |
| **Aggregate Root** | Vendor (`ProcurementVendor`) |
| **Input Parameters** | `companyId: string` (from tenant context), `name: string`, `taxId: string`, `email: string`, `phone?: string`, `address: Address`, `bankAccountNumber: string`, `bankRoutingNumber: string`, `bankName: string`, `category: VendorCategory`, `paymentTerms: string`, `creditLimit: Decimal`, `documents: VendorDocument[]`, `requestedBy: string` |
| **Pre-conditions** | 1. User has `vendors.create` permission. 2. No vendor with same `(companyId, taxId)` exists. |
| **Business Rules** | 1. `name` length 2–200 chars. 2. `taxId` format validated per jurisdiction. 3. `bankRoutingNumber` passes ABA format check. 4. `bankAccountNumber` length 4–17 chars. 5. `creditLimit` ≥ 0. 6. `email` valid format. 7. At least one document in `documents` array. 8. Duplicate detection: same `(companyId, taxId)` or `(companyId, name)` with >0.8 similarity score blocks creation. |
| **Side Effects** | 1. `ProcurementVendor` created (status: `pending_review`). 2. Domain event: `vendor.created`. 3. Audit record: `recordAudit('vendor.created', { vendorId, requestedBy, category, taxCountry })`. 4. Notification to AP Manager for review. |
| **Post-conditions** | Vendor exists in `pending_review` state. No POs or invoices can reference it until approved. |
| **Idempotency** | Not idempotent for creation. Duplicate `(companyId, taxId)` returns existing vendor. |
| **Authorized Roles** | AP Clerk, Procurement Manager |
| **Error Cases** | `DUPLICATE_VENDOR` — same tax ID exists (409). `INVALID_BANK_DETAILS` — routing/account format (422). `INVALID_TAX_ID` — format validation (422). `MISSING_DOCUMENTS` — required documents absent (422). |

### 2.2 UpdateVendor

| Field | Content |
|---|---|
| **Purpose** | Modify vendor master data (name, contact, address, category, payment terms). Bank details require a separate command. |
| **Aggregate Root** | Vendor (`ProcurementVendor`) |
| **Input Parameters** | `vendorId: string`, `companyId: string` (from tenant context), `name?: string`, `email?: string`, `phone?: string`, `address?: Address`, `category?: VendorCategory`, `paymentTerms?: string`, `updatedBy: string` |
| **Pre-conditions** | 1. User has `vendors.update` permission. 2. Vendor exists and belongs to `companyId`. 3. Vendor is not `deactivated`. |
| **Business Rules** | 1. At least one field must be provided. 2. `name` change triggers duplicate detection. 3. `paymentTerms` validated against allowed values (Net15, Net30, Net60, Net90, DueOnReceipt). 4. Cannot change `taxId` after approval (requires deactivate + recreate). |
| **Side Effects** | 1. `ProcurementVendor` updated. 2. Domain event: `vendor.updated` with changed fields. 3. Audit record: `recordAudit('vendor.updated', { vendorId, updatedBy, changedFields })`. |
| **Post-conditions** | Vendor data reflects updates. Audit trail captures before/after values. |
| **Idempotency** | Idempotent — same input produces same state. |
| **Authorized Roles** | AP Clerk (basic fields), AP Manager (payment terms, category) |
| **Error Cases** | `VENDOR_NOT_FOUND` (404). `VENDOR_DEACTIVATED` — cannot update (422). `DUPLICATE_NAME` — name collision (409). |

### 2.3 ApproveVendor

| Field | Content |
|---|---|
| **Purpose** | Approve a pending vendor for active use, enabling PO and invoice creation. |
| **Aggregate Root** | Vendor (`ProcurementVendor`) |
| **Input Parameters** | `vendorId: string`, `companyId: string` (from tenant context), `approvedBy: string`, `riskScore?: number`, `notes?: string` |
| **Pre-conditions** | 1. User has `vendors.approve` permission. 2. Vendor is in `pending_review` or `under_review` state. 3. All required documents are valid (not expired). |
| **Business Rules** | 1. Risk score ≥ 50 requires Controller approval (not just AP Manager). 2. Risk score ≥ 80 requires CFO approval. 3. Auto-approve if risk score < 20 AND credit limit < $10K (System role). 4. Same user who created vendor cannot approve it (SoD). |
| **Side Effects** | 1. `ProcurementVendor.status` → `active`. 2. Domain event: `vendor.approved`. 3. Audit record: `recordAudit('vendor.approved', { vendorId, approvedBy, riskLevel, riskScore })`. 4. Notification to vendor (if contact email available). |
| **Post-conditions** | Vendor is `active`. POs and invoices can now reference this vendor. |
| **Idempotency** | Idempotent — approving an already-active vendor returns success. |
| **Authorized Roles** | AP Manager (risk <50), Controller (risk 50–79), CFO (risk ≥80), System (auto-approve) |
| **Error Cases** | `VENDOR_NOT_IN_REVIEWABLE_STATE` (422). `DOCUMENTS_EXPIRED` — re-upload required (422). `INSUFFICIENT_AUTHORITY` — risk score requires higher role (403). `SOD_VIOLATION` — creator cannot approve (403). |

### 2.4 RejectVendor

| Field | Content |
|---|---|
| **Purpose** | Reject a vendor application, preventing future POs and invoices. |
| **Aggregate Root** | Vendor (`ProcurementVendor`) |
| **Input Parameters** | `vendorId: string`, `companyId: string` (from tenant context), `rejectedBy: string`, `reason: string`, `notes?: string` |
| **Pre-conditions** | 1. User has `vendors.approve` permission. 2. Vendor is in `pending_review` or `under_review` state. |
| **Business Rules** | 1. `reason` is mandatory (minimum 10 chars). 2. Same user who created vendor can reject (SoD only blocks approval, not rejection). 3. Rejection is final for this application — vendor must reapply. |
| **Side Effects** | 1. `ProcurementVendor.status` → `deactivated`. 2. Domain event: `vendor.rejected`. 3. Audit record: `recordAudit('vendor.rejected', { vendorId, rejectedBy, reason })`. 4. Notification to vendor with rejection reason. |
| **Post-conditions** | Vendor is `deactivated`. Cannot be referenced by any new PO or invoice. |
| **Idempotency** | Idempotent — rejecting an already-rejected vendor returns success. |
| **Authorized Roles** | AP Manager, Controller |
| **Error Cases** | `VENDOR_NOT_IN_REVIEWABLE_STATE` (422). `REASON_TOO_SHORT` (422). |

### 2.5 SuspendVendor

| Field | Content |
|---|---|
| **Purpose** | Temporarily block a vendor from new POs and invoices while allowing existing obligations to complete. |
| **Aggregate Root** | Vendor (`ProcurementVendor`) |
| **Input Parameters** | `vendorId: string`, `companyId: string` (from tenant context), `suspendedBy: string`, `reason: string`, `notes?: string` |
| **Pre-conditions** | 1. User has `vendors.suspend` permission. 2. Vendor is in `active` state. |
| **Business Rules** | 1. `reason` is mandatory (minimum 10 chars). 2. Existing open POs and invoices are unaffected — they continue processing. 3. No new POs or invoices can be created against this vendor. |
| **Side Effects** | 1. `ProcurementVendor.status` → `suspended`. 2. Domain event: `vendor.suspended`. 3. Audit record: `recordAudit('vendor.suspended', { vendorId, suspendedBy, reason })`. 4. Notification to Procurement Manager. |
| **Post-conditions** | Vendor is `suspended`. Existing obligations continue. New references blocked. |
| **Idempotency** | Idempotent — suspending an already-suspended vendor returns success. |
| **Authorized Roles** | AP Manager |
| **Error Cases** | `VENDOR_NOT_ACTIVE` (422). `REASON_TOO_SHORT` (422). |

### 2.6 ReactivateVendor

| Field | Content |
|---|---|
| **Purpose** | Restore a suspended vendor to active status. |
| **Aggregate Root** | Vendor (`ProcurementVendor`) |
| **Input Parameters** | `vendorId: string`, `companyId: string` (from tenant context), `reactivatedBy: string`, `notes?: string` |
| **Pre-conditions** | 1. User has `vendors.suspend` permission. 2. Vendor is in `suspended` state. 3. All required documents are still valid. |
| **Business Rules** | 1. Documents re-validated at reactivation. 2. If any document expired during suspension, block reactivation until renewed. |
| **Side Effects** | 1. `ProcurementVendor.status` → `active`. 2. Domain event: `vendor.reactivated`. 3. Audit record: `recordAudit('vendor.reactivated', { vendorId, reactivatedBy })`. |
| **Post-conditions** | Vendor is `active`. Full PO and invoice capabilities restored. |
| **Idempotency** | Idempotent — reactivating an already-active vendor returns success. |
| **Authorized Roles** | AP Manager |
| **Error Cases** | `VENDOR_NOT_SUSPENDED` (422). `DOCUMENTS_EXPIRED` — renew first (422). |

### 2.7 DeactivateVendor

| Field | Content |
|---|---|
| **Purpose** | Permanently deactivate a vendor. This is irreversible — vendors cannot be reactivated after deactivation. |
| **Aggregate Root** | Vendor (`ProcurementVendor`) |
| **Input Parameters** | `vendorId: string`, `companyId: string` (from tenant context), `deactivatedBy: string`, `reason: string`, `forceDeactivate: boolean` (default: false) |
| **Pre-conditions** | 1. User has `vendors.deactivate` permission. 2. Vendor is in `active` or `suspended` state. 3. If `forceDeactivate = false`: no open invoices (status not in `voided`, `closed`) and no open POs. |
| **Business Rules** | 1. `reason` is mandatory (minimum 10 chars). 2. `forceDeactivate = true` requires Controller approval and logs a warning. 3. Deactivated vendors retain all historical data (immutable). 4. Cannot be undone — no reactivation path. |
| **Side Effects** | 1. `ProcurementVendor.status` → `deactivated`. 2. Domain event: `vendor.deactivated`. 3. Audit record: `recordAudit('vendor.deactivated', { vendorId, deactivatedBy, reason, openInvoiceCount, openPOCount })`. 4. Notification to AP Manager and Procurement Manager. |
| **Post-conditions** | Vendor is `deactivated` (terminal state). All historical records preserved. No new references possible. |
| **Idempotency** | Idempotent — deactivating an already-deactivated vendor returns success. |
| **Authorized Roles** | Controller |
| **Error Cases** | `VENDOR_NOT_DEACTIVATABLE` — wrong state (422). `OPEN_INVOICES_EXIST` — set `forceDeactivate` or settle first (422). `OPEN_POS_EXIST` — set `forceDeactivate` or cancel first (422). |

### 2.8 UpdateVendorBankDetails

| Field | Content |
|---|---|
| **Purpose** | Update vendor bank account information. Isolated from general vendor update because bank details have additional security and audit requirements. |
| **Aggregate Root** | Vendor (`ProcurementVendor`) |
| **Input Parameters** | `vendorId: string`, `companyId: string` (from tenant context), `bankAccountNumber: string`, `bankRoutingNumber: string`, `bankName: string`, `updatedBy: string`, `reason: string` |
| **Pre-conditions** | 1. User has `vendors.update` permission. 2. Vendor exists and belongs to `companyId`. 3. Vendor is not `deactivated`. |
| **Business Rules** | 1. `bankRoutingNumber` must pass ABA format validation. 2. `bankAccountNumber` length 4–17 chars. 3. Bank details change triggers a 24-hour hold on any scheduled payments to this vendor (safety control). 4. `reason` is mandatory. 5. Previous bank details archived (last 4 digits preserved in audit). |
| **Side Effects** | 1. `ProcurementVendor` bank fields updated. 2. Domain event: `vendor.bank_updated`. 3. Audit record: `recordAudit('vendor.bank_updated', { vendorId, updatedBy, previousBankLast4, newBankLast4, reason })`. 4. 24-hour payment hold applied. 5. Notification to AP Manager. |
| **Post-conditions** | Vendor bank details updated. Scheduled payments within 24h are held. |
| **Idempotency** | Idempotent — same bank details produce same state. |
| **Authorized Roles** | AP Manager |
| **Error Cases** | `INVALID_BANK_DETAILS` — format validation (422). `VENDOR_DEACTIVATED` (422). `PAYMENT_HOLD_ACTIVE` — cannot change during hold (422). |

---

## Part 3: Invoice Commands (CORE)

The VendorInvoice is the central aggregate of the AP domain. These 15 commands govern the full lifecycle from capture through payment and closure.

### 3.1 ReceiveInvoice

| Field | Content |
|---|---|
| **Purpose** | Capture a new vendor invoice into the system, creating the invoice record with all line items, PO references, and metadata. |
| **Aggregate Root** | VendorInvoice (`ProcurementInvoice`) |
| **Input Parameters** | `companyId: string` (from tenant context), `vendorId: string`, `invoiceNumber: string`, `invoiceDate: Date`, `dueDate: Date`, `currency: string`, `lineItems: InvoiceLineItemInput[]`, `poReferences?: POReferenceInput[]`, `grnReferences?: GRNReferenceInput[]`, `discountPercent?: Decimal`, `discountDate?: Date`, `source: InvoiceSource` (manual/ocr/email/api), `capturedBy: string` |
| **Pre-conditions** | 1. User has `invoices.create` permission. 2. Vendor exists, is `active`, and belongs to `companyId`. 3. PO references (if any) reference valid POs in `sent`/`acknowledged`/`partially_received`/`received` state. |
| **Business Rules** | 1. `invoiceNumber` unique within `(companyId, vendorId)`. 2. `dueDate` ≥ `invoiceDate`. 3. `discountDate` ≤ `dueDate` if present. 4. `lineItems` array length ≥ 1. 5. Each line item: `quantity` > 0, `unitPrice` ≥ 0, `taxRate` ≥ 0. 6. `lineItem[].totalPrice` = `multiplyDecimals(quantity, unitPrice)` — recalculated, never trusted from input. 7. `lineItem[].taxAmount` = `multiplyDecimals(totalPrice, taxRate / 100)`. 8. Duplicate detection: same `(companyId, vendorId, invoiceNumber)` within 90 days blocks creation. 9. Credit limit check: `sumDecimals(outstandingInvoices for vendor) + totalWithTax > vendor.creditLimit` raises warning (not block). 10. If `poReferences` provided, line items must map to PO line items. |
| **Side Effects** | 1. `ProcurementInvoice` created (status: `received`). 2. `ProcurementInvoiceItem[]` created (one per line item). 3. Domain event: `invoice.captured`. 4. Audit record: `recordAudit('invoice.captured', { invoiceId, vendorId, amount, currency, source, capturedBy })`. 5. Auto-trigger: `ValidateInvoice` command (async). |
| **Post-conditions** | Invoice exists in `received` state. Validation is queued. No payment possible until approval. |
| **Idempotency** | Not idempotent for creation. Duplicate `(companyId, vendorId, invoiceNumber)` returns 409. |
| **Authorized Roles** | AP Clerk |
| **Error Cases** | `DUPLICATE_INVOICE` — same number exists (409). `VENDOR_NOT_ACTIVE` (422). `INVALID_PO_REFERENCE` — PO doesn't exist or wrong state (422). `MISSING_LINE_ITEMS` — empty array (422). `AMOUNT_MISMATCH` — line totals don't sum to header (422). `INVALID_DATES` — dueDate < invoiceDate (422). `CREDIT_LIMIT_WARNING` — logged but not blocked (info). |

### 3.2 UpdateInvoice

| Field | Content |
|---|---|
| **Purpose** | Correct invoice data before validation or matching. Only allowed in `received` state. |
| **Aggregate Root** | VendorInvoice (`ProcurementInvoice`) |
| **Input Parameters** | `invoiceId: string`, `companyId: string` (from tenant context), `invoiceDate?: Date`, `dueDate?: Date`, `lineItems?: InvoiceLineItemInput[]`, `poReferences?: POReferenceInput[]`, `discountPercent?: Decimal`, `discountDate?: Date`, `updatedBy: string` |
| **Pre-conditions** | 1. User has `invoices.update` permission. 2. Invoice is in `received` state. 3. Invoice belongs to `companyId`. |
| **Business Rules** | 1. Cannot update invoices in `validated` or later states. 2. Same financial invariants as `ReceiveInvoice`. 3. `lineItems` replacement is atomic — all items replaced, not patched. 4. `totalAmount` and `taxAmount` recalculated on every save. |
| **Side Effects** | 1. `ProcurementInvoice` updated. 2. `ProcurementInvoiceItem[]` replaced if provided. 3. Domain event: `invoice.updated`. 4. Audit record: `recordAudit('invoice.updated', { invoiceId, updatedBy, changedFields })`. |
| **Post-conditions** | Invoice data reflects corrections. Validation may need to re-run. |
| **Idempotency** | Idempotent — same input produces same state. |
| **Authorized Roles** | AP Clerk (who captured it), AP Manager |
| **Error Cases** | `INVOICE_NOT_FOUND` (404). `INVOICE_NOT_EDITABLE` — wrong state (422). `INVALID_LINE_ITEMS` — validation fails (422). |

### 3.3 DeleteInvoice (Soft — Void)

| Field | Content |
|---|---|
| **Purpose** | Soft-delete (void) an invoice before it has been paid. This is an irreversible action. |
| **Aggregate Root** | VendorInvoice (`ProcurementInvoice`) |
| **Input Parameters** | `invoiceId: string`, `companyId: string` (from tenant context), `voidedBy: string`, `reason: string` |
| **Pre-conditions** | 1. User has `invoices.delete` permission. 2. Invoice is in `received` or `validated` state (pre-payment only). 3. Invoice belongs to `companyId`. |
| **Business Rules** | 1. `reason` is mandatory (minimum 10 chars). 2. Cannot void invoices in `paid`, `posted`, `closed` states. 3. Voided invoices are immutable — no further mutations. 4. Related exceptions are voided. 5. Related approval chains are cancelled. |
| **Side Effects** | 1. `ProcurementInvoice.status` → `voided`. 2. Related `ProcurementException` records voided. 3. Related `ProcurementApprovalChain` cancelled. 4. Domain event: `invoice.voided`. 5. Audit record: `recordAudit('invoice.voided', { invoiceId, voidedBy, reason })`. |
| **Post-conditions** | Invoice is `voided` (terminal state). Immutable. All related records archived. |
| **Idempotency** | Idempotent — voiding an already-voided invoice returns success. |
| **Authorized Roles** | AP Clerk (received state only), AP Manager, Controller |
| **Error Cases** | `INVOICE_NOT_VOIDABLE` — wrong state (422). `REASON_TOO_SHORT` (422). |

### 3.4 ValidateInvoice

| Field | Content |
|---|---|
| **Purpose** | Run automated validation on a captured invoice — format checks, tax calculations, date logic, duplicate detection, PO reference integrity. |
| **Aggregate Root** | VendorInvoice (`ProcurementInvoice`) |
| **Input Parameters** | `invoiceId: string`, `companyId: string` (from tenant context) |
| **Pre-conditions** | 1. Invoice is in `received` state. 2. Invoice belongs to `companyId`. |
| **Business Rules** | 1. Validation runs all rules from the validation rules engine (see AP_WORKFLOW Stage 7). 2. If ALL rules pass → transition to `validated`. 3. If ANY rule fails → create `ProcurementException` and stay in `received` (or transition to `exception`). 4. Validation is typically auto-triggered by `ReceiveInvoice` but can be manually re-run. |
| **Side Effects** | 1. `ProcurementInvoice.status` → `validated` (on pass) or `exception` (on fail). 2. `ProcurementInvoiceItem[].validationResult` populated per item. 3. Domain event: `invoice.validated` or `invoice.validation_failed`. 4. Audit record: `recordAudit('invoice.validated', { invoiceId, result, exceptionCount, validationErrors[] })`. 5. If passed: auto-trigger `RunThreeWayMatch` (async). |
| **Post-conditions** | Invoice is `validated` with clean validation results. Or invoice has exception(s) for Clerk review. |
| **Idempotency** | Idempotent — re-validating produces same result. |
| **Authorized Roles** | System (auto), AP Clerk (manual re-run) |
| **Error Cases** | `INVOICE_NOT_VALIDATABLE` — wrong state (422). Validation failures are business outcomes, not errors — they produce exceptions. |

### 3.5 RunThreeWayMatch

| Field | Content |
|---|---|
| **Purpose** | Execute three-way matching (Invoice ↔ PO ↔ GRN) or two-way matching (Invoice ↔ PO) for service invoices without physical receipt. |
| **Aggregate Root** | ThreeWayMatch (`ProcurementMatch`) |
| **Input Parameters** | `invoiceId: string`, `companyId: string` (from tenant context) |
| **Pre-conditions** | 1. Invoice is in `validated` state. 2. Invoice has at least one PO reference. 3. For 3-way match: GRN exists for the referenced PO. |
| **Business Rules** | 1. Match type determined automatically: 3-way if GRN present, 2-way if service invoice. 2. Load tolerance configuration (per vendor, per category, company-wide defaults). 3. For each line item: compare quantity, price, and tax against PO (and GRN for 3-way). 4. `totalVariance` = `sumDecimals(lineItemVariances)`. 5. If ALL variances within tolerance → `matched`. 6. If ANY variance exceeds tolerance → `exception` with detailed variance report. 7. Match result decoupled from invoice state — match can be re-run. |
| **Side Effects** | 1. `ProcurementMatch` created with status `matched` or `exception`. 2. `ProcurementMatchLineItem[]` created (one per invoice line item). 3. If `matched`: `ProcurementInvoice.status` → `matched`. 4. If `exception`: `ProcurementException` created, `ProcurementInvoice.status` → `exception`. 5. Domain event: `invoice.matched` or `invoice.match.exception`. 6. Audit record: `recordAudit('invoice.matched', { invoiceId, matchType, matchId, result, matchedCount, exceptionCount, totalVariance })`. 7. If matched: auto-trigger `RequestApproval` (async). |
| **Post-conditions** | Match result exists. Invoice is `matched` (proceeds to approval) or `exception` (queued for resolution). |
| **Idempotency** | Idempotent — re-running match on same invoice produces same result (unless GRN arrived since last run). |
| **Authorized Roles** | System (auto), AP Clerk (manual re-run) |
| **Error Cases** | `INVOICE_NOT_MATCHABLE` — wrong state (422). `NO_PO_LINKED` — cannot match without PO (422). `GRN_NOT_FOUND` — 3-way match requires GRN (422). Match failures are business outcomes — they produce exceptions, not errors. |

### 3.6 OverrideMatchResult

| Field | Content |
|---|---|
| **Purpose** | Force an invoice past a match exception by overriding the variance with an authorized decision. This creates an audit trail but bypasses the standard resolution flow. |
| **Aggregate Root** | ThreeWayMatch (`ProcurementMatch`) |
| **Input Parameters** | `matchId: string`, `companyId: string` (from tenant context), `overrideBy: string`, `reason: string`, `overrideType: OverrideType` (full_override/partial_override), `overrides?: MatchLineItemOverride[]` |
| **Pre-conditions** | 1. User has `invoices.match_override` permission. 2. Match is in `exception` state. 3. Match belongs to `companyId`. |
| **Business Rules** | 1. `reason` is mandatory (minimum 20 chars — must explain business justification). 2. Price variance > $0.01 or > 1% requires AP Manager. 3. Total variance > $10 or > 1% requires Controller. 4. Override reason cannot be generic — must describe the specific business reason. 5. Override creates a `ProcurementException` with type `match_override` for audit. |
| **Side Effects** | 1. `ProcurementMatch.status` → `overridden`. 2. `ProcurementInvoice.status` → `matched` (proceeds to approval). 3. `ProcurementException` created for audit trail. 4. Domain event: `invoice.match.override`. 5. Audit record: `recordAudit('invoice.match.override', { matchId, invoiceId, overrideBy, reason, originalVariance, overrideVariance })`. |
| **Post-conditions** | Match is overridden. Invoice proceeds to approval. Override is fully documented. |
| **Idempotency** | Idempotent — overriding an already-overridden match returns success. |
| **Authorized Roles** | AP Manager (price variance ≤ $500), Controller (price variance > $500) |
| **Error Cases** | `MATCH_NOT_OVERRIDABLE` — wrong state (422). `REASON_TOO_SHORT` (422). `INSUFFICIENT_AUTHORITY` — variance requires higher role (403). `SOD_VIOLATION` — same user who captured invoice cannot override (403). |

### 3.7 ApproveInvoice

| Field | Content |
|---|---|
| **Purpose** | Grant approval at a specific level in the approval chain. When all levels are approved, the invoice transitions to `approved` state. |
| **Aggregate Root** | ApprovalChain (`ProcurementApprovalChain`) |
| **Input Parameters** | `approvalChainId: string`, `companyId: string` (from tenant context), `level: number`, `approverId: string`, `decision: 'approved'`, `comments?: string` |
| **Pre-conditions** | 1. User has `invoices.approve` permission. 2. Approval chain is in `in_progress` state. 3. User is the assigned approver for this level (or delegated). 4. All previous levels are already approved. |
| **Business Rules** | 1. Approver must have sufficient authority limit for the invoice amount. 2. SoD: same user who captured the invoice cannot approve it. 3. SoD: same user who created the PO cannot approve the invoice. 4. If this is the final level → `ProcurementInvoice.status` → `approved`. 5. If not final level → next level becomes `pending`. 6. Auto-approve rule: invoices < $1K, matched to single PO, trusted vendor (risk <20%) → System auto-approves at Level 1. |
| **Side Effects** | 1. `ProcurementApprovalLevel.decision` → `approved`. 2. If final level: `ProcurementApprovalChain.status` → `approved`, `ProcurementInvoice.status` → `approved`. 3. Domain event: `approval.level.decided` (and `approval.chain.approved` if final). 4. Audit record: `recordAudit('approval.level.decided', { chainId, level, decision: 'approved', approverId, comments })`. 5. Notification to AP Manager (invoice approved). |
| **Post-conditions** | Level approved. If all levels complete, invoice is `approved` and eligible for payment scheduling. |
| **Idempotency** | Idempotent — approving an already-approved level returns success. |
| **Authorized Roles** | AP Manager (Level 1–2), Controller (Level 2–3), CFO (Level 3–4), Treasury Manager (Level 4–5), System (auto-approve) |
| **Error Cases** | `APPROVAL_CHAIN_NOT_FOUND` (404). `NOT_ASSIGNED_APPROVER` — wrong user for this level (403). `LEVEL_NOT_PENDING` — already decided (422). `INSUFFICIENT_AUTHORITY` — amount exceeds approver limit (403). `SOD_VIOLATION` — creator cannot approve (403). `PREVIOUS_LEVEL_NOT_APPROVED` — levels must be sequential (422). |

### 3.8 RejectInvoice

| Field | Content |
|---|---|
| **Purpose** | Deny approval at a specific level in the approval chain. This terminates the approval workflow and returns the invoice to the exception queue. |
| **Aggregate Root** | ApprovalChain (`ProcurementApprovalChain`) |
| **Input Parameters** | `approvalChainId: string`, `companyId: string` (from tenant context), `level: number`, `approverId: string`, `reason: string` |
| **Pre-conditions** | 1. User has `invoices.approve` permission. 2. Approval chain is in `in_progress` state. 3. User is the assigned approver for this level (or delegated). |
| **Business Rules** | 1. `reason` is mandatory (minimum 10 chars). 2. Rejection at any level terminates the entire chain. 3. Invoice returns to `exception` state for re-review. |
| **Side Effects** | 1. `ProcurementApprovalLevel.decision` → `rejected`. 2. `ProcurementApprovalChain.status` → `rejected`. 3. `ProcurementInvoice.status` → `exception`. 4. `ProcurementException` created for the rejection. 5. Domain event: `approval.level.decided` (rejected), `approval.chain.rejected`. 6. Audit record: `recordAudit('approval.level.decided', { chainId, level, decision: 'rejected', approverId, reason })`. 7. Notification to AP Clerk. |
| **Post-conditions** | Approval chain rejected. Invoice in exception queue. AP Clerk can re-submit for approval after addressing the rejection reason. |
| **Idempotency** | Idempotent — rejecting an already-rejected level returns success. |
| **Authorized Roles** | AP Manager, Controller, CFO, Treasury Manager (role must match level) |
| **Error Cases** | `APPROVAL_CHAIN_NOT_FOUND` (404). `NOT_ASSIGNED_APPROVER` (403). `LEVEL_NOT_PENDING` (422). `REASON_TOO_SHORT` (422). |

### 3.9 EscalateInvoice

| Field | Content |
|---|---|
| **Purpose** | Move an invoice approval to a higher authority level, bypassing the current level due to SLA breach, unavailability, or complexity. |
| **Aggregate Root** | ApprovalChain (`ProcurementApprovalChain`) |
| **Input Parameters** | `approvalChainId: string`, `companyId: string` (from tenant context), `level: number`, `escalatedBy: string`, `reason: string` |
| **Pre-conditions** | 1. User has `invoices.escalate` permission OR the SLA for this level has been breached. 2. Approval chain is in `in_progress` state. 3. A higher authority level exists. |
| **Business Rules** | 1. `reason` is mandatory. 2. SLA breach auto-escalation (system-triggered) requires no user authorization. 3. Manual escalation requires AP Manager or higher. 4. Escalated level is skipped — if approved at the escalated-to level, all lower levels are auto-approved. |
| **Side Effects** | 1. `ProcurementApprovalLevel.status` → `escalated`. 2. Next higher level becomes `pending`. 3. Domain event: `approval.level.escalated`. 4. Audit record: `recordAudit('approval.escalated', { chainId, level, escalatedTo, reason, slaBreached })`. 5. Notification to escalation target. |
| **Post-conditions** | Approval escalated to next level. Previous level is marked escalated (not rejected). |
| **Idempotency** | Idempotent — escalating an already-escalated level returns success. |
| **Authorized Roles** | AP Manager (manual), Controller (manual for Level 3+), System (auto on SLA breach) |
| **Error Cases** | `NO_HIGHER_LEVEL_EXISTS` — already at max level (422). `LEVEL_NOT_PENDING` (422). `SLA_NOT_BREACHED` — manual escalation requires reason (422). |

### 3.10 ScheduleInvoiceForPayment

| Field | Content |
|---|---|
| **Purpose** | Add an approved invoice to a payment proposal for scheduling. This is the bridge between approval and payment. |
| **Aggregate Root** | VendorInvoice (`ProcurementInvoice`) |
| **Input Parameters** | `invoiceId: string`, `companyId: string` (from tenant context), `proposalId?: string` (if adding to existing proposal), `scheduledBy: string` |
| **Pre-conditions** | 1. User has `invoices.schedule_payment` permission. 2. Invoice is in `approved` state. 3. Invoice is not already scheduled in an active proposal. 4. Vendor is not `suspended`. |
| **Business Rules** | 1. Invoice must be fully approved (all chain levels). 2. If `proposalId` provided, proposal must be in `draft` or `generated` state. 3. If no `proposalId`, a new proposal draft is created. 4. Discount-eligible invoices prioritized if discount window is within 5 days. 5. Payment hold check: vendor bank details changed within 24h → block scheduling. |
| **Side Effects** | 1. `ProcurementInvoice.status` → `scheduled`. 2. `ProcurementPaymentItem` created linking invoice to proposal. 3. Domain event: `invoice.payment.scheduled`. 4. Audit record: `recordAudit('invoice.payment.scheduled', { invoiceId, proposalId, scheduledDate, scheduledBy })`. |
| **Post-conditions** | Invoice is `scheduled`. Included in a payment proposal. Cannot be scheduled in another proposal. |
| **Idempotency** | Idempotent — scheduling an already-scheduled invoice returns success. |
| **Authorized Roles** | AP Manager |
| **Error Cases** | `INVOICE_NOT_APPROVED` — must be approved first (422). `INVOICE_ALREADY_SCHEDULED` — already in a proposal (422). `VENDOR_SUSPENDED` — cannot pay suspended vendor (422). `PAYMENT_HOLD` — bank details recently changed (422). `PROPOSAL_NOT_MODIFIABLE` — proposal already approved (422). |

### 3.11 BlockInvoice

| Field | Content |
|---|---|
| **Purpose** | Place a compliance or investigation hold on an invoice, preventing it from progressing in the lifecycle. |
| **Aggregate Root** | VendorInvoice (`ProcurementInvoice`) |
| **Input Parameters** | `invoiceId: string`, `companyId: string` (from tenant context), `blockedBy: string`, `reason: string`, `blockType: BlockType` (compliance/investigation/legal/audit) |
| **Pre-conditions** | 1. User has `invoices.block` permission. 2. Invoice is in `received` or `validated` state (pre-approval). 3. Invoice belongs to `companyId`. |
| **Business Rules** | 1. `reason` is mandatory (minimum 10 chars). 2. Blocked invoices cannot proceed to matching, approval, or payment. 3. Block is indefinite — must be explicitly unblocked. 4. Controller can block at any stage (including post-approval). |
| **Side Effects** | 1. `ProcurementInvoice.status` → `blocked`. 2. Domain event: `invoice.blocked`. 3. Audit record: `recordAudit('invoice.blocked', { invoiceId, blockedBy, reason, blockType })`. 4. Notification to AP Manager. |
| **Post-conditions** | Invoice is `blocked`. No lifecycle transitions possible until unblocked. |
| **Idempotency** | Idempotent — blocking an already-blocked invoice returns success. |
| **Authorized Roles** | AP Manager (pre-approval), Controller (any stage) |
| **Error Cases** | `INVOICE_NOT_BLOCKABLE` — wrong state (422). `REASON_TOO_SHORT` (422). |

### 3.12 UnblockInvoice

| Field | Content |
|---|---|
| **Purpose** | Remove a compliance hold from an invoice, restoring it to its pre-block state. |
| **Aggregate Root** | VendorInvoice (`ProcurementInvoice`) |
| **Input Parameters** | `invoiceId: string`, `companyId: string` (from tenant context), `unblockedBy: string`, `reason: string` |
| **Pre-conditions** | 1. User has `invoices.block` permission. 2. Invoice is in `blocked` state. 3. Invoice belongs to `companyId`. |
| **Business Rules** | 1. `reason` is mandatory. 2. Invoice returns to the state it was in before blocking. 3. Unblocking re-enters the normal lifecycle (validation, matching, etc. may need re-run). |
| **Side Effects** | 1. `ProcurementInvoice.status` → previous state (e.g., `received`, `validated`). 2. Domain event: `invoice.unblocked`. 3. Audit record: `recordAudit('invoice.unblocked', { invoiceId, unblockedBy, reason, previousState })`. |
| **Post-conditions** | Invoice unblocked. Normal lifecycle resumes. |
| **Idempotency** | Idempotent — unblocking an unblocked invoice returns success. |
| **Authorized Roles** | AP Manager, Controller (whoever blocked it, or higher authority) |
| **Error Cases** | `INVOICE_NOT_BLOCKED` (422). `REASON_TOO_SHORT` (422). |

### 3.13 DisputeInvoice

| Field | Content |
|---|---|
| **Purpose** | Record that a vendor has disputed an invoice amount, items, or terms, pausing the payment workflow. |
| **Aggregate Root** | VendorInvoice (`ProcurementInvoice`) |
| **Input Parameters** | `invoiceId: string`, `companyId: string` (from tenant context), `disputedBy: string`, `disputeReason: string`, `disputeAmount?: Decimal`, `vendorCommunication?: string` |
| **Pre-conditions** | 1. User has `invoices.dispute` permission. 2. Invoice is in `received`, `validated`, or `matched` state. 3. Invoice belongs to `companyId`. |
| **Business Rules** | 1. `disputeReason` is mandatory (minimum 10 chars). 2. `disputeAmount` if provided must be ≤ `totalAmount`. 3. Disputed invoices cannot be approved or paid. 4. Dispute resolution required within 30 days (SLA). |
| **Side Effects** | 1. `ProcurementInvoice.status` → `disputed`. 2. Domain event: `invoice.disputed`. 3. Audit record: `recordAudit('invoice.disputed', { invoiceId, disputeReason, disputeAmount, disputedBy })`. 4. Notification to AP Manager. 5. SLA timer starts (30 days). |
| **Post-conditions** | Invoice is `disputed`. Payment workflow paused. 30-day SLA for resolution. |
| **Idempotency** | Idempotent — disputing an already-disputed invoice updates the dispute details. |
| **Authorized Roles** | AP Clerk, AP Manager |
| **Error Cases** | `INVOICE_NOT_DISPUTABLE` — wrong state (422). `DISPUTE_AMOUNT_EXCEEDS_INVOICE` (422). `REASON_TOO_SHORT` (422). |

### 3.14 ResolveDispute

| Field | Content |
|---|---|
| **Purpose** | Resolve a vendor dispute, returning the invoice to the normal workflow with documented resolution. |
| **Aggregate Root** | VendorInvoice (`ProcurementInvoice`) |
| **Input Parameters** | `invoiceId: string`, `companyId: string` (from tenant context), `resolvedBy: string`, `resolution: DisputeResolution` (accepted_as_is/adjusted/credit_note_issued/voided), `adjustmentAmount?: Decimal`, `resolutionNotes: string` |
| **Pre-conditions** | 1. User has `invoices.dispute` permission. 2. Invoice is in `disputed` state. 3. Invoice belongs to `companyId`. |
| **Business Rules** | 1. `resolutionNotes` is mandatory (minimum 20 chars). 2. If `adjusted`: `adjustmentAmount` is mandatory, must create credit note or debit note. 3. If `voided`: invoice transitions to `voided` (terminal). 4. If `accepted_as_is`: invoice returns to pre-dispute state. 5. Resolution documented with full audit trail. |
| **Side Effects** | 1. `ProcurementInvoice.status` → appropriate state (e.g., `received`, `matched`, `voided`). 2. If adjusted: credit note or debit note created. 3. Domain event: `invoice.dispute_resolved`. 4. Audit record: `recordAudit('invoice.dispute_resolved', { invoiceId, resolution, resolvedBy, adjustmentAmount, resolutionNotes })`. |
| **Post-conditions** | Dispute resolved. Invoice returns to normal lifecycle (or voided). SLA met (or violation recorded). |
| **Idempotency** | Idempotent — resolving an already-resolved dispute returns success. |
| **Authorized Roles** | AP Manager |
| **Error Cases** | `INVOICE_NOT_DISPUTED` (422). `ADJUSTMENT_AMOUNT_REQUIRED` — resolution is adjusted but no amount (422). `RESOLUTION_NOTES_TOO_SHORT` (422). |

### 3.15 VoidInvoice

| Field | Content |
|---|---|
| **Purpose** | Permanently void an invoice at any stage before final GL posting. This is the nuclear option — used for compliance holds, fraud detection, or irrecoverable errors. |
| **Aggregate Root** | VendorInvoice (`ProcurementInvoice`) |
| **Input Parameters** | `invoiceId: string`, `companyId: string` (from tenant context), `voidedBy: string`, `reason: string`, `refundRequired: boolean` |
| **Pre-conditions** | 1. User has `invoices.void` permission. 2. Invoice is NOT in `closed` or `posted` state (post-GL requires reversal, not void). 3. Invoice belongs to `companyId`. |
| **Business Rules** | 1. `reason` is mandatory (minimum 20 chars — this is a serious action). 2. If invoice is in `scheduled` state, corresponding payment proposal item is removed. 3. If invoice is `paid`, `refundRequired` is set to true and Treasury is notified. 4. Voided invoices are terminal — immutable, no outgoing transitions. 5. Related exceptions, approval chains are voided/cancelled. |
| **Side Effects** | 1. `ProcurementInvoice.status` → `voided`. 2. Related records voided (exceptions, approvals). 3. If scheduled: payment proposal item removed. 4. Domain event: `invoice.voided`. 5. Audit record: `recordAudit('invoice.voided', { invoiceId, voidedBy, reason, refundRequired, previousState })`. 6. Notification to Controller, Treasury (if refund required). |
| **Post-conditions** | Invoice is `voided` (terminal state). Immutable. All related records archived. |
| **Idempotency** | Idempotent — voiding an already-voided invoice returns success. |
| **Authorized Roles** | Controller |
| **Error Cases** | `INVOICE_NOT_VOIDABLE` — already `closed` or `posted` (422). `REASON_TOO_SHORT` (422). `REVERSAL_REQUIRED` — post-GL invoice needs reversal, not void (422). |

---

## Part 4: Exception Commands

### 4.1 CreateException

| Field | Content |
|---|---|
| **Purpose** | Create a new exception record when an invoice fails matching, validation, or duplicate detection. |
| **Aggregate Root** | InvoiceException (`ProcurementException`) |
| **Input Parameters** | `companyId: string` (from tenant context), `invoiceId: string`, `type: ExceptionType`, `severity: ExceptionSeverity`, `varianceAmount: Decimal`, `description: string` |
| **Pre-conditions** | 1. Invoice exists in `companyId`. 2. No existing open exception of the same type on this invoice (deduplication). |
| **Business Rules** | 1. `type` determines available resolution actions (see AP_AGGREGATES §4.6). 2. `severity` determines auto-escalation timing: `critical` → immediate escalation to AP Manager; `high` → 4h SLA; `medium` → 24h SLA; `low` → 48h SLA. 3. SLA deadline calculated from severity. 4. Same exception type on same invoice re-opens existing exception (no duplicate). |
| **Side Effects** | 1. `ProcurementException` created (status: `open`). 2. Domain event: `exception.created`. 3. Audit record: `recordAudit('exception.created', { exceptionId, invoiceId, type, severity, varianceAmount, slaDeadline })`. 4. If severity = `critical`: immediate escalation. |
| **Post-conditions** | Exception exists in `open` state. SLA timer running. Invoice is in `exception` state. |
| **Idempotency** | Not idempotent for creation. Duplicate (same invoice + type) re-opens existing. |
| **Authorized Roles** | System (auto from match/validation), AP Clerk |
| **Error Cases** | `INVOICE_NOT_FOUND` (404). `DUPLICATE_EXCEPTION` — re-opens existing (informational, not error). |

### 4.2 AssignException

| Field | Content |
|---|---|
| **Purpose** | Assign an open exception to a specific AP Clerk for resolution, matching expertise to exception type. |
| **Aggregate Root** | InvoiceException (`ProcurementException`) |
| **Input Parameters** | `exceptionId: string`, `companyId: string` (from tenant context), `assignedTo: string`, `assignedBy: string` |
| **Pre-conditions** | 1. User has `exceptions.assign` permission. 2. Exception is in `open` state. 3. Exception belongs to `companyId`. |
| **Business Rules** | 1. Auto-assignment by type: `price_mismatch` → pricing clerk; `quantity_mismatch` → receiving clerk; `duplicate` → senior clerk. 2. SLA timer continues — assignment does not extend deadline. 3. Reassignment allowed if original assignee is unavailable. |
| **Side Effects** | 1. `ProcurementException.status` → `in_progress`. 2. `ProcurementException.assignedTo` set. 3. Domain event: `exception.assigned`. 4. Audit record: `recordAudit('exception.assigned', { exceptionId, assignedTo, assignedBy })`. 5. Notification to assignee. |
| **Post-conditions** | Exception assigned. SLA continues. Assignee notified. |
| **Idempotency** | Idempotent — re-assigning to same person returns success. |
| **Authorized Roles** | AP Manager, System (auto-assign) |
| **Error Cases** | `EXCEPTION_NOT_FOUND` (404). `EXCEPTION_NOT_ASSIGNABLE` — wrong state (422). `USER_NOT_FOUND` — assignee doesn't exist (404). |

### 4.3 ResolveException

| Field | Content |
|---|---|
| **Purpose** | Resolve an exception by documenting the resolution action and outcome. This unblocks the invoice to proceed in its lifecycle. |
| **Aggregate Root** | InvoiceException (`ProcurementException`) |
| **Input Parameters** | `exceptionId: string`, `companyId: string` (from tenant context), `resolvedBy: string`, `resolutionAction: ResolutionAction`, `resolutionNotes: string`, `resolutionAmount?: Decimal` |
| **Pre-conditions** | 1. User has `exceptions.resolve` permission. 2. Exception is in `in_progress` or `escalated` state. 3. Exception belongs to `companyId`. |
| **Business Rules** | 1. `resolutionNotes` is mandatory (minimum 20 chars). 2. `resolutionAction` must be valid for the exception type (see AP_AGGREGATES §4.6 type-action mapping). 3. If `override`: requires AP Manager approval for price variance > $0.01. 4. If `credit_note`: credit note must be created via `ReceiveCreditNote` command. 5. Resolution within tolerance (price variance < $0.01) → AP Clerk can resolve directly. 6. Resolution beyond tolerance → requires AP Manager. |
| **Side Effects** | 1. `ProcurementException.status` → `resolved`. 2. `ProcurementException.resolution` set. 3. If resolution matches invoice to PO/GRN: `ProcurementInvoice.status` → `matched`. 4. Domain event: `exception.resolved`. 5. Audit record: `recordAudit('exception.resolved', { exceptionId, resolution, resolutionAction, resolvedBy, resolutionAmount, resolutionNotes })`. 6. If invoice returns to `matched`: auto-trigger `RequestApproval` (async). |
| **Post-conditions** | Exception resolved. Invoice proceeds in lifecycle. Resolution fully documented. |
| **Idempotency** | Idempotent — resolving an already-resolved exception returns success. |
| **Authorized Roles** | AP Clerk (within tolerance), AP Manager (beyond tolerance), Controller (void-related) |
| **Error Cases** | `EXCEPTION_NOT_RESOLVABLE` — wrong state (422). `INVALID_RESOLUTION_ACTION` — not valid for exception type (422). `INSUFFICIENT_AUTHORITY` — variance requires AP Manager (403). `RESOLUTION_NOTES_TOO_SHORT` (422). |

### 4.4 EscalateException

| Field | Content |
|---|---|
| **Purpose** | Escalate an exception to a higher authority when it cannot be resolved at the current level, or when the SLA is breached. |
| **Aggregate Root** | InvoiceException (`ProcurementException`) |
| **Input Parameters** | `exceptionId: string`, `companyId: string` (from tenant context), `escalatedBy: string`, `reason: string` |
| **Pre-conditions** | 1. User has `exceptions.escalate` permission. 2. Exception is in `in_progress` state. 3. Exception belongs to `companyId`. |
| **Business Rules** | 1. `reason` is mandatory. 2. Escalation path: AP Clerk → AP Manager → Controller → CFO. 3. Auto-escalation on SLA breach (system-triggered). 4. Critical severity auto-escalates immediately. 5. Each escalation resets the SLA (extended deadline). |
| **Side Effects** | 1. `ProcurementException.status` → `escalated`. 2. `ProcurementException.slaDeadline` extended. 3. Domain event: `exception.escalated`. 4. Audit record: `recordAudit('exception.escalated', { exceptionId, escalatedTo, reason, slaBreached })`. 5. Notification to escalation target. |
| **Post-conditions** | Exception escalated. New authority notified. Extended SLA. |
| **Idempotency** | Idempotent — escalating an already-escalated exception returns success. |
| **Authorized Roles** | AP Clerk, AP Manager, System (auto on SLA breach) |
| **Error Cases** | `EXCEPTION_NOT_ESCALATABLE` — wrong state (422). `NO_HIGHER_AUTHORITY` — already at max level (422). `REASON_TOO_SHORT` (422). |

### 4.5 AutoResolveException

| Field | Content |
|---|---|
| **Purpose** | System-driven resolution of an exception by pattern matching against historical resolutions. Used for low-risk, recurring exceptions with established resolution patterns. |
| **Aggregate Root** | InvoiceException (`ProcurementException`) |
| **Input Parameters** | `exceptionId: string`, `companyId: string` (from tenant context), `patternId: string`, `confidence: number` |
| **Pre-conditions** | 1. Exception is in `open` state. 2. A matching historical pattern exists with confidence > 0.85. 3. Exception variance is below auto-resolve threshold ($10 for price, 1 unit for quantity). |
| **Business Rules** | 1. Auto-resolution only for `price_mismatch` and `quantity_mismatch` types. 2. Confidence threshold: ≥ 0.85 required. 3. Variance must be below threshold: price < $10, quantity < 1 unit. 4. Auto-resolved exceptions are flagged for AP Manager review (batch review, not per-exception). 5. If AP Manager rejects auto-resolution → exception re-opens to `in_progress`. |
| **Side Effects** | 1. `ProcurementException.status` → `auto_resolved`. 2. Invoice proceeds to `matched`. 3. Domain event: `exception.auto_resolved`. 4. Audit record: `recordAudit('exception.auto_resolved', { exceptionId, patternId, confidence, resolution })`. |
| **Post-conditions** | Exception auto-resolved. Invoice proceeds. Pending AP Manager review. |
| **Idempotency** | Idempotent — auto-resolving an already-resolved exception returns success. |
| **Authorized Roles** | System |
| **Error Cases** | `INSUFFICIENT_CONFIDENCE` — pattern confidence < 0.85 (no action, exception stays open). `VARIANCE_EXCEEDS_THRESHOLD` — too large for auto-resolve (no action). `INVALID_EXCEPTION_TYPE` — not auto-resolvable (no action). |

### 4.6 BulkResolveExceptions

| Field | Content |
|---|---|
| **Purpose** | Resolve multiple exceptions in a single operation. Used for batch review of auto-resolved exceptions or mass resolution of known patterns. |
| **Aggregate Root** | InvoiceException (`ProcurementException`) — multiple |
| **Input Parameters** | `companyId: string` (from tenant context), `exceptionIds: string[]`, `resolutionAction: ResolutionAction`, `resolutionNotes: string`, `resolvedBy: string` |
| **Pre-conditions** | 1. User has `exceptions.resolve` permission. 2. All exceptions are in `in_progress`, `escalated`, or `auto_resolved` state. 3. All exceptions belong to `companyId`. |
| **Business Rules** | 1. Maximum 50 exceptions per bulk operation. 2. All exceptions must be of the same type (cannot mix price_mismatch with duplicate). 3. Same authority rules as `ResolveException` apply per exception. 4. If any exception fails validation, the entire batch is rejected (atomic). 5. Each exception produces its own audit record. |
| **Side Effects** | 1. Each `ProcurementException` → `resolved`. 2. Each invoice proceeds in lifecycle. 3. Domain event: `exception.bulk_resolved` (with count). 4. Individual audit records for each exception. |
| **Post-conditions** | All exceptions resolved (or none if batch rejected). |
| **Idempotency** | Idempotent per exception — already-resolved exceptions are skipped. |
| **Authorized Roles** | AP Manager |
| **Error Cases** | `BATCH_TOO_LARGE` — > 50 exceptions (422). `MIXED_EXCEPTION_TYPES` — must be same type (422). `INSUFFICIENT_AUTHORITY` — variance requires Controller (403). `PARTIAL_FAILURE` — any validation failure rejects entire batch (422). |

---

## Part 5: Approval Commands

### 5.1 RequestApproval

| Field | Content |
|---|---|
| **Purpose** | Initiate the approval workflow for an invoice, creating the approval chain and routing to the first approver. |
| **Aggregate Root** | ApprovalChain (`ProcurementApprovalChain`) |
| **Input Parameters** | `invoiceId: string`, `companyId: string` (from tenant context), `requestedBy: string` |
| **Pre-conditions** | 1. Invoice is in `matched` state. 2. No active approval chain exists for this invoice. 3. Invoice belongs to `companyId`. |
| **Business Rules** | 1. Approval chain levels determined by `ApprovalMatrixEvaluator.evaluate()` from automation-studio. 2. Threshold routing: < $1K → auto-approve; $1K–$10K → AP Manager; $10K–$50K → AP Manager + Controller; $50K–$100K → + CFO; > $100K → + Treasury Manager. 3. SoD checks applied at routing: PO creator ≠ invoice approver, invoice capturer ≠ invoice approver. 4. SLA deadlines calculated per level from approval matrix configuration. |
| **Side Effects** | 1. `ProcurementApprovalChain` created (status: `routing` → `in_progress`). 2. `ProcurementApprovalLevel[]` created (one per required level). 3. Domain event: `approval.created`, `approval.level.routed`. 4. Audit record: `recordAudit('approval.created', { chainId, invoiceId, levels, totalAmount })`. 5. Notification to first approver. 6. If auto-approve: `ApproveInvoice` triggered immediately. |
| **Post-conditions** | Approval chain active. First approver notified. SLA timers running. |
| **Idempotency** | Idempotent — requesting approval for an invoice with existing active chain returns the existing chain. |
| **Authorized Roles** | System (auto after match), AP Clerk (manual) |
| **Error Cases** | `INVOICE_NOT_MATCHED` — must be matched first (422). `ACTIVE_APPROVAL_EXISTS` — chain already active (returns existing chain). `SOD_VIOLATION` — creator cannot be in approval chain (422). |

### 5.2 GrantApproval

Alias for `ApproveInvoice` (§3.7). See invoice commands for full specification. The `GrantApproval` name is used when the approval is for a non-invoice entity (e.g., payment proposal, credit note).

| Field | Content |
|---|---|
| **Purpose** | Grant approval at a specific level. Equivalent to `ApproveInvoice` for invoice approval chains. |
| **Aggregate Root** | ApprovalChain (`ProcurementApprovalChain`) |
| **Input Parameters** | Same as `ApproveInvoice` (§3.7). |
| **Pre-conditions** | Same as `ApproveInvoice` (§3.7). |
| **Business Rules** | Same as `ApproveInvoice` (§3.7). |
| **Side Effects** | Same as `ApproveInvoice` (§3.7). |
| **Post-conditions** | Same as `ApproveInvoice` (§3.7). |
| **Idempotency** | Same as `ApproveInvoice` (§3.7). |
| **Authorized Roles** | Same as `ApproveInvoice` (§3.7). |
| **Error Cases** | Same as `ApproveInvoice` (§3.7). |

### 5.3 DenyApproval

Alias for `RejectInvoice` (§3.8). See invoice commands for full specification.

| Field | Content |
|---|---|
| **Purpose** | Deny approval at a specific level. Equivalent to `RejectInvoice` for invoice approval chains. |
| **Aggregate Root** | ApprovalChain (`ProcurementApprovalChain`) |
| **Input Parameters** | Same as `RejectInvoice` (§3.8). |
| **Pre-conditions** | Same as `RejectInvoice` (§3.8). |
| **Business Rules** | Same as `RejectInvoice` (§3.8). |
| **Side Effects** | Same as `RejectInvoice` (§3.8). |
| **Post-conditions** | Same as `RejectInvoice` (§3.8). |
| **Idempotency** | Same as `RejectInvoice` (§3.8). |
| **Authorized Roles** | Same as `RejectInvoice` (§3.8). |
| **Error Cases** | Same as `RejectInvoice` (§3.8). |

### 5.4 DelegateApproval

| Field | Content |
|---|---|
| **Purpose** | Transfer an approval responsibility from the original approver to a delegate, maintaining the approval chain's integrity. |
| **Aggregate Root** | ApprovalChain (`ProcurementApprovalChain`) |
| **Input Parameters** | `approvalChainId: string`, `companyId: string` (from tenant context), `level: number`, `delegatedFrom: string`, `delegatedTo: string`, `reason: string` |
| **Pre-conditions** | 1. User has `approvals.delegate` permission (or delegation rule triggered). 2. Approval chain is in `in_progress` state. 3. Target level is `pending` or `in_progress`. 4. Delegate has sufficient authority for the invoice amount. |
| **Business Rules** | 1. `reason` is mandatory. 2. Delegation must not create circular chains (A→B→C→A). 3. Delegate must have authority ≥ invoice amount. 4. Original approver is recorded for audit trail. 5. Delegation timeout: if delegate doesn't act within 24h, auto-escalate. 6. SoD: delegate cannot be the invoice capturer or PO creator. |
| **Side Effects** | 1. `ProcurementApprovalLevel.delegatedFrom` set. 2. `ProcurementApprovalLevel.approverId` changed to delegate. 3. `ProcurementApprovalLevel.isDelegated` = true. 4. Domain event: `approval.delegated`. 5. Audit record: `recordAudit('approval.delegated', { chainId, level, from, to, reason })`. 6. Notification to delegate. |
| **Post-conditions** | Approval delegated. Delegate has authority to approve at this level. Original approver recorded. |
| **Idempotency** | Idempotent — delegating to the same person returns success. |
| **Authorized Roles** | AP Manager (for Level 1–2), Controller (for Level 3+), System (auto-delegation on absence) |
| **Error Cases** | `APPROVAL_CHAIN_NOT_FOUND` (404). `LEVEL_NOT_DELEGATABLE` — already decided (422). `DELEGATION_CYCLE_DETECTED` — circular reference (422). `INSUFFICIENT_DELEGATE_AUTHORITY` — delegate authority too low (403). `SOD_VIOLATION` — delegate is invoice creator (403). `REASON_TOO_SHORT` (422). |

### 5.5 EscalateApproval

Alias for `EscalateInvoice` (§3.9). See invoice commands for full specification.

| Field | Content |
|---|---|
| **Purpose** | Escalate an approval level to a higher authority. Equivalent to `EscalateInvoice` for invoice approval chains. |
| **Aggregate Root** | ApprovalChain (`ProcurementApprovalChain`) |
| **Input Parameters** | Same as `EscalateInvoice` (§3.9). |
| **Pre-conditions** | Same as `EscalateInvoice` (§3.9). |
| **Business Rules** | Same as `EscalateInvoice` (§3.9). |
| **Side Effects** | Same as `EscalateInvoice` (§3.9). |
| **Post-conditions** | Same as `EscalateInvoice` (§3.9). |
| **Idempotency** | Same as `EscalateInvoice` (§3.9). |
| **Authorized Roles** | Same as `EscalateInvoice` (§3.9). |
| **Error Cases** | Same as `EscalateInvoice` (§3.9). |

### 5.6 RecallApproval

| Field | Content |
|---|---|
| **Purpose** | Withdraw a previously granted approval before the invoice proceeds to payment scheduling. Used when new information comes to light after approval. |
| **Aggregate Root** | ApprovalChain (`ProcurementApprovalChain`) |
| **Input Parameters** | `approvalChainId: string`, `companyId: string` (from tenant context), `level: number`, `recalledBy: string`, `reason: string` |
| **Pre-conditions** | 1. User has `invoices.void` permission (same authority as void). 2. Approval level is `approved`. 3. Invoice has NOT yet been paid (status not `paid`, `posted`, `closed`). 4. Invoice belongs to `companyId`. |
| **Business Rules** | 1. `reason` is mandatory (minimum 20 chars). 2. Recall reverts the approval chain to `in_progress` from the recalled level onward. 3. All subsequent level approvals are also reverted. 4. Invoice returns to `matched` state (eligible for re-approval). 5. Recall is rare — requires Controller authority. |
| **Side Effects** | 1. `ProcurementApprovalLevel.decision` → `pending` (from recalled level onward). 2. `ProcurementApprovalChain.status` → `in_progress`. 3. `ProcurementInvoice.status` → `matched`. 4. Domain event: `approval.recalled`. 5. Audit record: `recordAudit('approval.recalled', { chainId, level, recalledBy, reason })`. 6. Notification to AP Manager. |
| **Post-conditions** | Approval recalled. Invoice eligible for re-approval. Previous approvals invalidated. |
| **Idempotency** | Idempotent — recalling an already-recalled level returns success. |
| **Authorized Roles** | Controller |
| **Error Cases** | `APPROVAL_CHAIN_NOT_FOUND` (404). `LEVEL_NOT_APPROVED` — nothing to recall (422). `INVOICE_ALREADY_PAID` — cannot recall post-payment (422). `REASON_TOO_SHORT` (422). |

---

## Part 6: Payment Commands

### 6.1 GeneratePaymentProposal

| Field | Content |
|---|---|
| **Purpose** | Generate a payment proposal by selecting approved invoices based on payment terms, discount opportunities, and cash flow optimization. |
| **Aggregate Root** | PaymentProposal (`ProcurementPaymentProposal`) |
| **Input Parameters** | `companyId: string` (from tenant context), `proposedPaymentDate: Date`, `generatedBy: string`, `vendorIds?: string[]` (optional filter), `maxAmount?: Decimal` |
| **Pre-conditions** | 1. User has `payments.create` permission. 2. At least one approved invoice exists for the company. |
| **Business Rules** | 1. Select all invoices in `approved` state with `dueDate` ≤ `proposedPaymentDate`. 2. Prioritize invoices with early-pay discount window within 5 days. 3. Group by vendor. 4. Select vendor's preferred payment method. 5. `totalAmount` = `sumDecimals(proposalItems[].amount)`. 6. Discount savings calculated and displayed. 7. Treasury cash position checked (warning if insufficient, not block). 8. Maximum 500 invoices per proposal. |
| **Side Effects** | 1. `ProcurementPaymentProposal` created (status: `draft`). 2. `ProcurementPaymentItem[]` created (one per invoice). 3. Domain event: `proposal.generated`. 4. Audit record: `recordAudit('proposal.generated', { proposalId, invoiceCount, totalAmount, totalDiscountSavings, generatedBy })`. |
| **Post-conditions** | Proposal exists in `draft` state. Ready for AP Manager review. |
| **Idempotency** | Not idempotent — each generation creates a new proposal. |
| **Authorized Roles** | AP Manager, System (daily auto-generate at 6:00 AM) |
| **Error Cases** | `NO_ELIGIBLE_INVOICES` — nothing to pay (422). `MAX_INVOICES_EXCEEDED` — > 500 invoices (422). `PROPOSED_DATE_IN_PAST` (422). |

### 6.2 ReviewPaymentProposal

| Field | Content |
|---|---|
| **Purpose** | AP Manager reviews the generated proposal, adjusting payment priorities, removing invoices, or modifying payment dates before submission for approval. |
| **Aggregate Root** | PaymentProposal (`ProcurementPaymentProposal`) |
| **Input Parameters** | `proposalId: string`, `companyId: string` (from tenant context), `reviewedBy: string`, `changes?: ProposalChange[]` (add/remove/modify items), `notes?: string` |
| **Pre-conditions** | 1. User has `payments.review` permission. 2. Proposal is in `draft` or `generated` state. 3. Proposal belongs to `companyId`. |
| **Business Rules** | 1. Can add invoices (must be in `approved` state, not in another proposal). 2. Can remove invoices (returns them to `approved` state). 3. Can modify payment dates and priorities. 4. `totalAmount` recalculated after changes. 5. Minimum 1 invoice must remain after review. |
| **Side Effects** | 1. `ProcurementPaymentProposal.status` → `reviewed`. 2. Proposal items updated per changes. 3. Domain event: `proposal.reviewed`. 4. Audit record: `recordAudit('proposal.reviewed', { proposalId, reviewedBy, changes, notes })`. |
| **Post-conditions** | Proposal reviewed. Ready for approval. |
| **Idempotency** | Idempotent — reviewing with same changes produces same state. |
| **Authorized Roles** | AP Manager |
| **Error Cases** | `PROPOSAL_NOT_FOUND` (404). `PROPOSAL_NOT_REVIEWABLE` — wrong state (422). `NO_INVOICES_REMAINING` — cannot empty proposal (422). `INVOICE_NOT_ELIGIBLE` — invoice not approved or already scheduled (422). |

### 6.3 ApprovePaymentProposal

| Field | Content |
|---|---|
| **Purpose** | Approve a payment proposal, authorizing payment execution. This is the final authorization before money moves. |
| **Aggregate Root** | PaymentProposal (`ProcurementPaymentProposal`) |
| **Input Parameters** | `proposalId: string`, `companyId: string` (from tenant context), `approvedBy: string`, `comments?: string` |
| **Pre-conditions** | 1. User has `payments.approve` permission. 2. Proposal is in `reviewed` state. 3. Proposal belongs to `companyId`. 4. Approval authority ≥ proposal total amount. |
| **Business Rules** | 1. Amount < $100K → AP Manager can approve. 2. Amount $100K–$500K → Controller required. 3. Amount > $500K → CFO + Treasury Manager dual approval. 4. Same user who created the proposal cannot approve it (SoD). 5. Treasury cash position re-checked at approval time. |
| **Side Effects** | 1. `ProcurementPaymentProposal.status` → `approved`. 2. Domain event: `proposal.approved`. 3. Audit record: `recordAudit('proposal.approved', { proposalId, approvedBy, totalAmount, approvalLevel })`. 4. Notification to Treasury Manager. 5. Auto-trigger: `CreatePaymentBatch` (async). |
| **Post-conditions** | Proposal approved. Payment batch creation triggered. |
| **Idempotency** | Idempotent — approving an already-approved proposal returns success. |
| **Authorized Roles** | AP Manager (< $100K), Controller ($100K–$500K), CFO + Treasury Manager (> $500K) |
| **Error Cases** | `PROPOSAL_NOT_FOUND` (404). `PROPOSAL_NOT_APPROVABLE` — wrong state (422). `INSUFFICIENT_AUTHORITY` — amount exceeds approver limit (403). `SOD_VIOLATION` — creator cannot approve (403). `INSUFFICIENT_CASH` — treasury warning (logged, not blocked). |

### 6.4 RejectPaymentProposal

| Field | Content |
|---|---|
| **Purpose** | Reject a payment proposal, returning it to draft for modification. |
| **Aggregate Root** | PaymentProposal (`ProcurementPaymentProposal`) |
| **Input Parameters** | `proposalId: string`, `companyId: string` (from tenant context), `rejectedBy: string`, `reason: string` |
| **Pre-conditions** | 1. User has `payments.approve` permission. 2. Proposal is in `reviewed` state. 3. Proposal belongs to `companyId`. |
| **Business Rules** | 1. `reason` is mandatory (minimum 10 chars). 2. Rejected proposal returns to `draft` state for modification. 3. Invoices remain in `approved` state (not unscheduled). |
| **Side Effects** | 1. `ProcurementPaymentProposal.status` → `rejected`. 2. Domain event: `proposal.rejected`. 3. Audit record: `recordAudit('proposal.rejected', { proposalId, rejectedBy, reason })`. 4. Notification to AP Manager. |
| **Post-conditions** | Proposal rejected. AP Manager can modify and resubmit. |
| **Idempotency** | Idempotent — rejecting an already-rejected proposal returns success. |
| **Authorized Roles** | AP Manager, Controller |
| **Error Cases** | `PROPOSAL_NOT_FOUND` (404). `PROPOSAL_NOT_REJECTABLE` — wrong state (422). `REASON_TOO_SHORT` (422). |

### 6.5 CreatePaymentBatch

| Field | Content |
|---|---|
| **Purpose** | Convert an approved payment proposal into an executable payment batch, generating individual payment records for each invoice. |
| **Aggregate Root** | PaymentBatch (`ProcurementPaymentBatch`) |
| **Input Parameters** | `proposalId: string`, `companyId: string` (from tenant context) |
| **Pre-conditions** | 1. Proposal is in `approved` state. 2. No batch already created for this proposal. 3. All invoices in proposal are still in `approved` or `scheduled` state. |
| **Business Rules** | 1. One batch per proposal (1:1 relationship). 2. Each proposal item becomes a payment item. 3. Idempotency key generated per payment item. 4. `batchNumber` auto-generated (unique within company). 5. Vendor bank details re-validated. 6. Payment method confirmed (vendor preference). |
| **Side Effects** | 1. `ProcurementPaymentBatch` created (status: `created`). 2. `ProcurementPayment[]` created (one per invoice, status: `pending`). 3. `ProcurementPaymentProposal.status` → `processed`. 4. Domain event: `batch.created`. 5. Audit record: `recordAudit('batch.created', { batchId, proposalId, paymentCount, totalAmount })`. |
| **Post-conditions** | Batch created. Payments pending. Ready for Treasury validation. |
| **Idempotency** | Idempotent — batch already exists for this proposal → return existing. |
| **Authorized Roles** | System (auto from approved proposal) |
| **Error Cases** | `PROPOSAL_NOT_FOUND` (404). `PROPOSAL_NOT_PROCESSED` — wrong state (422). `BATCH_ALREADY_EXISTS` — returns existing (informational). `INVALID_BANK_DETAILS` — vendor bank details invalid (422). |

### 6.6 ExecutePayment

| Field | Content |
|---|---|
| **Purpose** | Submit a payment to the bank/payment processor for execution. This is where money actually moves. |
| **Aggregate Root** | PaymentBatch (`ProcurementPaymentBatch`) — child Payment |
| **Input Parameters** | `batchId: string`, `paymentId: string`, `companyId: string` (from tenant context), `executedBy: string` |
| **Pre-conditions** | 1. User has `payments.execute` permission. 2. Batch is in `validated` state. 3. Payment is in `pending` state. 4. Batch belongs to `companyId`. 5. Dual-signature check for $10K–$100K payments. 6. Treasurer approval for > $100K payments. |
| **Business Rules** | 1. Idempotency: `idempotencyKey` checked — duplicate execution returns existing result. 2. Double-payment check: no other pending/completed payment for same invoice. 3. Velocity check: > 5 payments to same vendor in 1 day → alert + hold. 4. Bank API submission with 10s timeout. 5. On failure: auto-retry up to 3 times with exponential backoff (1m, 5m, 30m). |
| **Side Effects** | 1. `ProcurementPayment.status` → `processing`. 2. Bank API submission initiated. 3. Domain event: `payment.submitted`. 4. Audit record: `recordAudit('payment.submitted', { paymentId, batchId, vendorId, amount, method, executedBy })`. |
| **Post-conditions** | Payment submitted to bank. Awaiting confirmation. |
| **Idempotency** | Idempotent via `idempotencyKey`. Duplicate execution returns existing result. |
| **Authorized Roles** | Treasury Analyst, Treasury Manager (> $100K) |
| **Error Cases** | `PAYMENT_NOT_EXECUTABLE` — wrong state (422). `DUPLICATE_PAYMENT` — same invoice already paid (409). `VELOCITY_LIMIT_EXCEEDED` — too many payments to same vendor (422). `INSUFFICIENT_DUAL_SIGNATURE` — $10K+ requires dual (403). `BANK_API_FAILURE` — retry logic triggered, exception created after 3 failures. |

### 6.7 ConfirmPayment

| Field | Content |
|---|---|
| **Purpose** | Record bank confirmation that a payment was successfully received by the vendor. This completes the payment lifecycle. |
| **Aggregate Root** | PaymentBatch (`ProcurementPaymentBatch`) — child Payment |
| **Input Parameters** | `batchId: string`, `paymentId: string`, `companyId: string` (from tenant context), `bankReference: string`, `confirmationNumber?: string`, `confirmedBy: string` |
| **Pre-conditions** | 1. Payment is in `completed` state (bank confirmed). 2. Payment belongs to `companyId`. |
| **Business Rules** | 1. `bankReference` is mandatory. 2. Confirmation triggers GL posting (auto). 3. `ProcurementInvoice.status` → `paid`. 4. If all payments in batch confirmed → `ProcurementPaymentBatch.status` → `confirmed`. |
| **Side Effects** | 1. `ProcurementPayment.status` → `confirmed`. 2. `ProcurementPayment.bankReference` set. 3. `ProcurementPayment.confirmedAt` set. 4. `ProcurementInvoice.status` → `paid`. 5. If batch complete: `ProcurementPaymentBatch.status` → `confirmed`. 6. Domain event: `payment.confirmed`. 7. Audit record: `recordAudit('payment.confirmed', { paymentId, bankReference, confirmedBy, amount })`. 8. Auto-trigger: GL posting (via `GLIntegrationService.generatePaymentEntry()`). |
| **Post-conditions** | Payment confirmed. Invoice is `paid`. GL posting triggered. |
| **Idempotency** | Idempotent — confirming an already-confirmed payment returns success. |
| **Authorized Roles** | System (auto from bank webhook), Treasury Analyst (manual) |
| **Error Cases** | `PAYMENT_NOT_CONFIRMABLE` — wrong state (422). `BANK_REFERENCE_MISSING` (422). |

### 6.8 ReversePayment

| Field | Content |
|---|---|
| **Purpose** | Reverse a confirmed payment, creating a reversing GL entry and restoring the invoice to `approved` state for re-payment. |
| **Aggregate Root** | PaymentBatch (`ProcurementPaymentBatch`) — child Payment |
| **Input Parameters** | `batchId: string`, `paymentId: string`, `companyId: string` (from tenant context), `reversedBy: string`, `reason: string` |
| **Pre-conditions** | 1. User has `payments.reverse` permission. 2. Payment is in `confirmed` or `completed` state. 3. Payment belongs to `companyId`. |
| **Business Rules** | 1. `reason` is mandatory (minimum 20 chars). 2. Reversal creates a reversing journal entry (debit ↔ credit). 3. If payment > $50K, CFO approval required for reversal. 4. Reversed payments are terminal — immutable. 5. `ProcurementInvoice.status` → `approved` (eligible for re-payment). 6. Reversal is logged with full audit trail. |
| **Side Effects** | 1. `ProcurementPayment.status` → `reversed`. 2. `ProcurementInvoice.status` → `approved`. 3. Reversing journal entry created. 4. Domain event: `payment.reversed`. 5. Audit record: `recordAudit('payment.reversed', { paymentId, reversedBy, reason, amount, reversingEntryId })`. 6. Notification to Controller, Treasury. |
| **Post-conditions** | Payment reversed. Invoice re-approved. GL reversal posted. |
| **Idempotency** | Idempotent — reversing an already-reversed payment returns success. |
| **Authorized Roles** | Controller, CFO (if > $50K) |
| **Error Cases** | `PAYMENT_NOT_REVERSIBLE` — wrong state (422). `REASON_TOO_SHORT` (422). `INSUFFICIENT_AUTHORITY` — > $50K requires CFO (403). `GL_PERIOD_CLOSED` — cannot post reversal to closed period (422). |

### 6.9 CancelPayment

| Field | Content |
|---|---|
| **Purpose** | Cancel a payment before it has been executed at the bank. Used when the proposal is rejected, the invoice is voided, or a payment hold is placed. |
| **Aggregate Root** | PaymentBatch (`ProcurementPaymentBatch`) — child Payment |
| **Input Parameters** | `batchId: string`, `paymentId: string`, `companyId: string` (from tenant context), `cancelledBy: string`, `reason: string` |
| **Pre-conditions** | 1. User has `payments.cancel` permission. 2. Payment is in `pending` state (not yet submitted to bank). 3. Payment belongs to `companyId`. |
| **Business Rules** | 1. `reason` is mandatory. 2. Cannot cancel payments in `processing`, `completed`, or `confirmed` state. 3. Cancelled payments are terminal — immutable. 4. `ProcurementInvoice.status` → `approved` (eligible for re-scheduling). |
| **Side Effects** | 1. `ProcurementPayment.status` → `cancelled`. 2. `ProcurementInvoice.status` → `approved`. 3. Domain event: `payment.cancelled`. 4. Audit record: `recordAudit('payment.cancelled', { paymentId, cancelledBy, reason })`. |
| **Post-conditions** | Payment cancelled. Invoice re-approved. |
| **Idempotency** | Idempotent — cancelling an already-cancelled payment returns success. |
| **Authorized Roles** | AP Manager, Treasury Manager, Controller |
| **Error Cases** | `PAYMENT_NOT_CANCELLABLE` — wrong state (422). `REASON_TOO_SHORT` (422). |

---

## Part 7: Reconciliation Commands

### 7.1 ImportVendorStatement

| Field | Content |
|---|---|
| **Purpose** | Import a vendor statement (CSV, PDF, or API) for reconciliation against the AP ledger. |
| **Aggregate Root** | Reconciliation (`ProcurementReconciliation`) |
| **Input Parameters** | `companyId: string` (from tenant context), `vendorId: string`, `statementDate: Date`, `period: string` (e.g., \"2026-06\"), `statementLines: StatementLineInput[]`, `importedBy: string`, `source: StatementSource` (csv/pdf/api/manual) |
| **Pre-conditions** | 1. User has `reconciliation.import` permission. 2. Vendor exists and belongs to `companyId`. 3. No active reconciliation exists for same vendor + period. |
| **Business Rules** | 1. `statementLines` array length ≥ 1. 2. Each line: `description`, `amount` (Decimal), `reference` (invoice number or payment reference). 3. Period must not be already reconciled. 4. Statement total calculated and compared to ledger total (variance noted). |
| **Side Effects** | 1. `ProcurementReconciliation` created (status: `imported`). 2. `ProcurementReconciliationLine[]` created. 3. Domain event: `reconciliation.imported`. 4. Audit record: `recordAudit('reconciliation.imported', { reconciliationId, vendorId, period, lineCount, statementTotal })`. 5. Auto-trigger: `RunReconciliation` (async). |
| **Post-conditions** | Statement imported. Ready for matching. |
| **Idempotency** | Not idempotent for creation. Duplicate (same vendor + period) returns 409. |
| **Authorized Roles** | AP Manager |
| **Error Cases** | `VENDOR_NOT_FOUND` (404). `DUPLICATE_RECONCILIATION` — same vendor + period (409). `INVALID_STATEMENT_LINES` — empty or malformed (422). |

### 7.2 RunReconciliation

| Field | Content |
|---|---|
| **Purpose** | Execute automated matching of vendor statement lines against AP ledger entries (invoices and payments). |
| **Aggregate Root** | Reconciliation (`ProcurementReconciliation`) |
| **Input Parameters** | `reconciliationId: string`, `companyId: string` (from tenant context) |
| **Pre-conditions** | 1. Reconciliation is in `imported` state. 2. Reconciliation belongs to `companyId`. |
| **Business Rules** | 1. Match by invoice number, payment reference, or amount + date proximity. 2. For each statement line: find matching ledger entry (invoice or payment). 3. If matched → mark line as matched. 4. If unmatched → mark line as discrepancy. 5. Zero variance → `matched` status. Positive variance → `discrepancies` status. 6. Auto-match tolerance: $0.01 for exact reference match, $0.00 for amount-only match. |
| **Side Effects** | 1. `ProcurementReconciliation.status` → `matched` (zero variance) or `discrepancies` (variance > 0). 2. `ProcurementReconciliationLine.matchStatus` set per line. 3. Domain event: `reconciliation.matched` or `reconciliation.discrepancies`. 4. Audit record: `recordAudit('reconciliation.matched', { reconciliationId, matchedCount, discrepancyCount, variance })`. |
| **Post-conditions** | Matching complete. Discrepancies identified. Ready for adjustment or finalization. |
| **Idempotency** | Idempotent — re-running match produces same result. |
| **Authorized Roles** | System (auto), AP Manager (manual) |
| **Error Cases** | `RECONCILIATION_NOT_MATCHABLE` — wrong state (422). Matching failures are business outcomes (discrepancies), not errors. |

### 7.3 AdjustReconciliation

| Field | Content |
|---|---|
| **Purpose** | Post adjustments for discrepancies found during reconciliation. Adjustments may create debit notes, credit notes, or journal entries. |
| **Aggregate Root** | Reconciliation (`ProcurementReconciliation`) |
| **Input Parameters** | `reconciliationId: string`, `companyId: string` (from tenant context), `adjustments: ReconciliationAdjustment[]`, `adjustedBy: string` |
| **Pre-conditions** | 1. User has `reconciliation.adjust` permission. 2. Reconciliation is in `discrepancies` state. 3. Reconciliation belongs to `companyId`. |
| **Business Rules** | 1. Each adjustment: `lineId`, `adjustmentType` (debit_note/credit_note/journal_entry/write_off), `amount` (Decimal), `reason`. 2. Variance thresholds: < $50 → AP Clerk; $50–$500 → AP Manager; > $500 → Controller. 3. Write-offs > $500 require Controller approval. 4. All adjustments produce GL entries. 5. Total adjustments must equal total variance. |
| **Side Effects** | 1. `ProcurementReconciliation.status` → `adjusted`. 2. Adjustment records created. 3. GL entries posted for each adjustment. 4. Domain event: `reconciliation.adjusted`. 5. Audit record: `recordAudit('reconciliation.adjusted', { reconciliationId, adjustedBy, adjustmentCount, totalAdjustment, adjustments[] })`. |
| **Post-conditions** | Adjustments posted. Variance eliminated. Ready for finalization. |
| **Idempotency** | Idempotent — same adjustments produce same state. |
| **Authorized Roles** | AP Clerk (< $50), AP Manager ($50–$500), Controller (> $500) |
| **Error Cases** | `RECONCILIATION_NOT_ADJUSTABLE` — wrong state (422). `ADJUSTMENTS_DONT_BALANCE` — total ≠ variance (422). `INSUFFICIENT_AUTHORITY` — amount exceeds role limit (403). `GL_PERIOD_CLOSED` — cannot post to closed period (422). |

### 7.4 CompleteReconciliation

| Field | Content |
|---|---|
| **Purpose** | Finalize a reconciliation, marking it as complete and generating the reconciliation report. |
| **Aggregate Root** | Reconciliation (`ProcurementReconciliation`) |
| **Input Parameters** | `reconciliationId: string`, `companyId: string` (from tenant context), `completedBy: string` |
| **Pre-conditions** | 1. User has `reconciliation.complete` permission. 2. Reconciliation is in `matched` (zero variance) or `adjusted` state. 3. Reconciliation belongs to `companyId`. |
| **Business Rules** | 1. Final variance check: must be $0 after adjustments. 2. Reconciliation report generated. 3. All adjustments have been posted to GL. 4. `completed` state is terminal — no further changes. |
| **Side Effects** | 1. `ProcurementReconciliation.status` → `reconciled`. 2. Reconciliation report generated. 3. Domain event: `reconciliation.completed`. 4. Audit record: `recordAudit('reconciliation.completed', { reconciliationId, vendorId, period, finalVariance, completedBy })`. 5. Notification to Controller (reconciliation complete). |
| **Post-conditions** | Reconciliation complete (terminal state). Report available. |
| **Idempotency** | Idempotent — completing an already-completed reconciliation returns success. |
| **Authorized Roles** | AP Manager |
| **Error Cases** | `RECONCILIATION_NOT_COMPLETABLE` — wrong state (422). `VARIANCE_NOT_ZERO` — outstanding discrepancies (422). |

---

## Part 8: Credit Commands

### 8.1 ReceiveCreditNote

| Field | Content |
|---|---|
| **Purpose** | Record a vendor credit note (debit note) that reduces the amount owed to the vendor. |
| **Aggregate Root** | VendorCredit (`ProcurementCreditNote`) |
| **Input Parameters** | `companyId: string` (from tenant context), `vendorId: string`, `creditNumber: string`, `creditDate: Date`, `creditAmount: Decimal`, `currency: string`, `reason: string`, `relatedInvoiceId?: string`, `receivedBy: string` |
| **Pre-conditions** | 1. User has `credits.create` permission. 2. Vendor exists and belongs to `companyId`. 3. No duplicate `creditNumber` for same vendor. |
| **Business Rules** | 1. `creditNumber` unique within `(companyId, vendorId)`. 2. `creditAmount` > 0. 3. `reason` is mandatory (minimum 10 chars). 4. If `relatedInvoiceId` provided, invoice must exist and belong to same vendor. 5. Credit note does not auto-apply — must be explicitly applied via `ApplyCreditNote`. |
| **Side Effects** | 1. `ProcurementCreditNote` created (status: `received`). 2. Domain event: `credit.received`. 3. Audit record: `recordAudit('credit.received', { creditId, vendorId, creditAmount, creditNumber, receivedBy })`. 4. Notification to AP Manager. |
| **Post-conditions** | Credit note received. Available for application against invoices. |
| **Idempotency** | Not idempotent for creation. Duplicate `creditNumber` returns 409. |
| **Authorized Roles** | AP Clerk |
| **Error Cases** | `DUPLICATE_CREDIT_NOTE` — same number (409). `VENDOR_NOT_FOUND` (404). `INVALID_CREDIT_AMOUNT` — must be > 0 (422). `REASON_TOO_SHORT` (422). |

### 8.2 ApplyCreditNote

| Field | Content |
|---|---|
| **Purpose** | Apply a credit note (fully or partially) against one or more outstanding invoices, reducing the amount owed. |
| **Aggregate Root** | VendorCredit (`ProcurementCreditNote`) |
| **Input Parameters** | `creditId: string`, `companyId: string` (from tenant context), `applications: CreditApplication[]` (each: `invoiceId: string`, `amount: Decimal`), `appliedBy: string` |
| **Pre-conditions** | 1. User has `credits.apply` permission. 2. Credit note is in `received` or `partially_applied` state. 3. Credit note belongs to `companyId`. 4. All target invoices exist, belong to same vendor, and are not `voided`/`closed`. |
| **Business Rules** | 1. Total applied amount ≤ remaining credit balance. 2. Each application amount ≤ invoice outstanding balance. 3. Credit note and invoices must be same currency (or FX conversion applied). 4. If total applied = credit amount → status `applied`. 5. If partial → status `partially_applied`. 6. Application reduces invoice outstanding balance. 7. Credit note cannot be applied to already-fully-paid invoices. |
| **Side Effects** | 1. `ProcurementCreditNote.status` → `applied` or `partially_applied`. 2. `ProcurementCreditNote.appliedAmount` updated. 3. `ProcurementInvoice` outstanding balance reduced per application. 4. If invoice fully covered: `ProcurementInvoice.status` transitions appropriately. 5. Domain event: `credit.applied` or `credit.partially_applied`. 6. Audit record: `recordAudit('credit.applied', { creditId, applications[], totalApplied, appliedBy })`. |
| **Post-conditions** | Credit note applied. Invoice balances reduced. Remaining credit available (if partial). |
| **Idempotency** | Idempotent — same applications produce same state. |
| **Authorized Roles** | AP Clerk |
| **Error Cases** | `CREDIT_NOTE_NOT_APPLICABLE` — wrong state (422). `APPLICATION_EXCEEDS_BALANCE` — more than remaining credit (422). `INVOICE_NOT_FOUND` (404). `CURRENCY_MISMATCH` — different currencies without FX (422). `INVOICE_ALREADY_PAID` — cannot apply to fully paid invoice (422). |

### 8.3 VoidCreditNote

| Field | Content |
|---|---|
| **Purpose** | Void a credit note, reversing any applied amounts and restoring invoice balances. |
| **Aggregate Root** | VendorCredit (`ProcurementCreditNote`) |
| **Input Parameters** | `creditId: string`, `companyId: string` (from tenant context), `voidedBy: string`, `reason: string` |
| **Pre-conditions** | 1. User has `credits.void` permission. 2. Credit note is in `received` or `partially_applied` state. 3. Credit note belongs to `companyId`. |
| **Business Rules** | 1. `reason` is mandatory (minimum 20 chars). 2. If `partially_applied`: applied amounts are reversed (invoice balances restored). 3. `applied` credit notes: full reversal of applied amounts. 4. Voided credit notes are terminal — immutable. |
| **Side Effects** | 1. `ProcurementCreditNote.status` → `voided`. 2. If applied: invoice balances restored. 3. Domain event: `credit.voided`. 4. Audit record: `recordAudit('credit.voided', { creditId, voidedBy, reason, reversedAmount })`. 5. Notification to AP Manager. |
| **Post-conditions** | Credit note voided (terminal state). Applied amounts reversed. |
| **Idempotency** | Idempotent — voiding an already-voided credit note returns success. |
| **Authorized Roles** | Controller |
| **Error Cases** | `CREDIT_NOTE_NOT_VOIDABLE` — wrong state (422). `REASON_TOO_SHORT` (422). |

---

## Part 9: Query Catalog — Specification Format

Every query in this document follows this specification structure:

| Field | Description |
|---|---|
| **Query Name** | PascalCase identifier. |
| **Purpose** | What data this query returns and why. |
| **Input Parameters** | Filters, pagination, sorting, search criteria. |
| **Output Shape** | Response structure and key fields. |
| **Authorization** | Who can execute this query. |
| **Caching** | Cache strategy, TTL, invalidation pattern. |

### Query Classification

| Category | Count | Cache Strategy | Refresh Rate |
|---|---|---|---|
| Invoice | 3 | Stale-while-revalidate | 15s–60s |
| Vendor | 3 | Stale-while-revalidate | 30s–120s |
| Aging & Cash | 3 | Time-bucketed | 5min–1hr |
| Approval | 2 | No cache (real-time) | On-demand |
| Exception | 1 | No cache (real-time) | On-demand |
| Payment | 3 | Stale-while-revalidate | 15s–60s |
| Audit & Analytics | 3 | Time-bucketed | 5min–1hr |
| **Total** | **18** | | |

### Query Execution Pipeline

```
API Route (Zod validation)
  → Query Handler (authorization check)
    → Read Model / Prisma Query (optimized read)
      → Response Shape (map to DTO)
        → Cache Headers (Cache-Control, ETag)
```

| Step | Responsibility | Performance Target |
|---|---|---|
| API Route | Input parsing, Zod schema validation | < 1ms |
| Query Handler | Role authorization, tenant context | < 2ms |
| Read Model | Optimized query with indexes | < 50ms (p95) |
| Response Shape | DTO mapping, field selection | < 5ms |
| Cache Headers | TTL, ETag, stale-while-revalidate | < 1ms |

---

## Part 10: Read Models (Queries)

### 10.1 GetInvoiceDetails

| Field | Content |
|---|---|
| **Purpose** | Retrieve complete details of a single invoice including line items, PO references, match results, approval chain, payment history, and audit trail. |
| **Input Parameters** | `invoiceId: string`, `companyId: string` (from tenant context) |
| **Output Shape** | `{ invoice: VendorInvoiceDTO, lineItems: InvoiceLineItemDTO[], poReferences: POReferenceDTO[], grnReferences: GRNReferenceDTO[], match: ThreeWayMatchDTO?, approvalChain: ApprovalChainDTO?, payments: PaymentDTO[], credits: CreditApplicationDTO[], exceptions: ExceptionDTO[], auditTrail: AuditEventDTO[] }` |
| **Authorization** | AP Clerk, AP Manager, Controller, Treasury Manager, Auditor |
| **Caching** | `Cache-Control: private, max-age=15, stale-while-revalidate=30` |

### 10.2 GetInvoiceList

| Field | Content |
|---|---|
| **Purpose** | Retrieve a paginated, filterable list of invoices with summary information. Primary workbench view for AP operations. |
| **Input Parameters** | `companyId: string` (from tenant context), `status?: InvoiceStatus`, `vendorId?: string`, `dateFrom?: Date`, `dateTo?: Date`, `amountMin?: Decimal`, `amountMax?: Decimal`, `hasException?: boolean`, `search?: string` (invoice number, vendor name), `sortBy?: string` (default: `createdAt`), `sortOrder?: 'asc' | 'desc'` (default: `desc`), `page?: number` (default: 1), `pageSize?: number` (default: 25, max: 200) |
| **Output Shape** | `{ invoices: InvoiceSummaryDTO[], pagination: { total: number, page: number, pageSize: number, totalPages: number }, filters: AppliedFilters }` |
| **Authorization** | AP Clerk, AP Manager, Controller, Treasury Manager, Auditor |
| **Caching** | `Cache-Control: private, max-age=15, stale-while-revalidate=30` |

### 10.3 GetVendorAging

| Field | Content |
|---|---|
| **Purpose** | Return AP aging report grouped by vendor with current, 30, 60, 90, and 120+ day buckets. Primary tool for cash flow management. |
| **Input Parameters** | `companyId: string` (from tenant context), `asOfDate?: Date` (default: today), `vendorId?: string` (single vendor detail), `groupBy?: 'vendor' | 'department' | 'costCenter'` (default: `vendor`) |
| **Output Shape** | `{ aging: AgingBucketDTO[], summary: { totalCurrent: Decimal, total30: Decimal, total60: Decimal, total90: Decimal, total120Plus: Decimal, totalOutstanding: Decimal }, asOfDate: Date }` where `AgingBucketDTO = { vendorId, vendorName, current: Decimal, days30: Decimal, days60: Decimal, days90: Decimal, days120Plus: Decimal, total: Decimal, invoiceCount: number }` |
| **Authorization** | AP Clerk, AP Manager, Controller, Treasury Manager, Auditor |
| **Caching** | `Cache-Control: private, max-age=300, stale-while-revalidate=600` |

### 10.4 GetPaymentCalendar

| Field | Content |
|---|---|
| **Purpose** | Show upcoming scheduled payments organized by date, providing a forward-looking view of cash requirements. |
| **Input Parameters** | `companyId: string` (from tenant context), `dateFrom?: Date` (default: today), `dateTo?: Date` (default: today + 90 days), `vendorId?: string`, `groupBy?: 'day' | 'week' | 'month'` (default: `day`) |
| **Output Shape** | `{ calendar: CalendarDayDTO[], summary: { totalScheduled: Decimal, totalDiscountAvailable: Decimal, invoiceCount: number, nextPaymentDate: Date } }` where `CalendarDayDTO = { date: Date, payments: PaymentCalendarItemDTO[], dayTotal: Decimal }` |
| **Authorization** | AP Clerk, AP Manager, Controller, Treasury Manager |
| **Caching** | `Cache-Control: private, max-age=60, stale-while-revalidate=120` |

### 10.5 GetExceptionQueue

| Field | Content |
|---|---|
| **Purpose** | Retrieve the exception queue — all open and in-progress exceptions requiring manual intervention. Primary workbench for AP Clerk. |
| **Input Parameters** | `companyId: string` (from tenant context), `type?: ExceptionType`, `severity?: ExceptionSeverity`, `vendorId?: string`, `assignedTo?: string`, `slaStatus?: 'on_track' | 'at_risk' | 'breached'`, `sortBy?: string` (default: `slaDeadline`), `sortOrder?: 'asc' | 'desc'` (default: `asc` — most urgent first), `page?: number`, `pageSize?: number` |
| **Output Shape** | `{ exceptions: ExceptionDTO[], pagination: PaginationDTO, summary: { total: number, open: number, inProgress: number, escalated: number, breached: number } }` |
| **Authorization** | AP Clerk, AP Manager, Controller |
| **Caching** | No cache — real-time (exception queue changes frequently) |

### 10.6 GetApprovalQueue

| Field | Content |
|---|---|
| **Purpose** | Retrieve all invoices pending approval for the current user, showing their approval responsibilities. |
| **Input Parameters** | `companyId: string` (from tenant context), `userId: string` (current user), `status?: 'pending' | 'all'` (default: `pending`), `sortBy?: string` (default: `slaDeadline`), `sortOrder?: 'asc' | 'desc'` (default: `asc`), `page?: number`, `pageSize?: number` |
| **Output Shape** | `{ approvals: ApprovalQueueItemDTO[], pagination: PaginationDTO, summary: { pendingCount: number, overdueCount: number, totalAmount: Decimal } }` where `ApprovalQueueItemDTO = { approvalChainId, invoiceId, invoiceNumber, vendorName, totalAmount, currency, level, slaDeadline, slaStatus, canApprove: boolean, canReject: boolean, canDelegate: boolean }` |
| **Authorization** | AP Clerk (Level 1), AP Manager (Level 1–2), Controller (Level 2–3), CFO (Level 3–4), Treasury Manager (Level 4–5) |
| **Caching** | No cache — real-time |

### 10.7 GetOutstandingLiabilities

| Field | Content |
|---|---|
| **Purpose** | Return total AP liability broken down by vendor and aging bucket. Used for financial reporting and treasury planning. |
| **Input Parameters** | `companyId: string` (from tenant context), `asOfDate?: Date` (default: today), `vendorId?: string` (optional single-vendor drill-down), `includeCreditNotes?: boolean` (default: true) |
| **Output Shape** | `{ totalLiability: Decimal, byVendor: VendorLiabilityDTO[], byAgingBucket: AgingSummaryDTO, currency: string }` where `VendorLiabilityDTO = { vendorId, vendorName, totalOwed: Decimal, currentPct: number, oldestInvoiceDate: Date, invoiceCount: number }` |
| **Authorization** | AP Manager, Controller, Treasury Manager, Auditor |
| **Caching** | `Cache-Control: private, max-age=300, stale-while-revalidate=600` |

### 10.8 GetDiscountAvailable

| Field | Content |
|---|---|
| **Purpose** | Identify early-pay discount opportunities — invoices where paying before the discount date would yield a financial saving. |
| **Input Parameters** | `companyId: string` (from tenant context), `windowDays?: number` (default: 14 — look ahead 14 days), `minDiscountPercent?: Decimal` (default: 0) |
| **Output Shape** | `{ discounts: DiscountOpportunityDTO[], summary: { totalEligible: Decimal, totalPotentialSavings: Decimal, optimalPaymentDate: Date } }` where `DiscountOpportunityDTO = { invoiceId, invoiceNumber, vendorName, totalAmount, discountPercent, discountAmount, discountDate, netAmount, daysUntilDiscount, roi: number }` sorted by ROI descending |
| **Authorization** | AP Manager, Controller, Treasury Manager |
| **Caching** | `Cache-Control: private, max-age=60, stale-while-revalidate=120` |

### 10.9 GetCashRequirements

| Field | Content |
|---|---|
| **Purpose** | Forecast AP cash requirements by week or month, helping treasury plan funding. |
| **Input Parameters** | `companyId: string` (from tenant context), `horizon?: number` (days, default: 90), `groupBy?: 'day' | 'week' | 'month'` (default: `week`), `includeDiscounts?: boolean` (default: true) |
| **Output Shape** | `{ forecast: ForecastPeriodDTO[], summary: { totalRequired: Decimal, peakPeriod: string, averageWeekly: Decimal, discountSavingsAvailable: Decimal } }` where `ForecastPeriodDTO = { period: string, startDate: Date, endDate: Date, scheduledPayments: Decimal, estimatedNewInvoices: Decimal, totalRequirement: Decimal, invoiceCount: number }` |
| **Authorization** | AP Manager, Controller, Treasury Manager |
| **Caching** | `Cache-Control: private, max-age=300, stale-while-revalidate=600` |

### 10.10 GetVendorDetail

| Field | Content |
|---|---|
| **Purpose** | Retrieve complete vendor master data including contact information, bank details, risk score, performance metrics, and transaction history. |
| **Input Parameters** | `vendorId: string`, `companyId: string` (from tenant context) |
| **Output Shape** | `{ vendor: VendorDTO, bankDetails: VendorBankDTO, documents: VendorDocumentDTO[], performance: VendorPerformanceDTO, recentInvoices: InvoiceSummaryDTO[], recentPayments: PaymentSummaryDTO[], openInvoices: InvoiceSummaryDTO[] }` |
| **Authorization** | AP Clerk, AP Manager, Controller, Procurement Manager, Auditor |
| **Caching** | `Cache-Control: private, max-age=30, stale-while-revalidate=60` |

### 10.11 GetVendorList

| Field | Content |
|---|---|
| **Purpose** | Retrieve a paginated, filterable list of vendors with summary information. |
| **Input Parameters** | `companyId: string` (from tenant context), `status?: VendorStatus`, `category?: VendorCategory`, `riskLevel?: 'low' | 'medium' | 'high' | 'critical'`, `search?: string` (name, tax ID), `sortBy?: string` (default: `name`), `sortOrder?: 'asc' | 'desc'`, `page?: number`, `pageSize?: number` |
| **Output Shape** | `{ vendors: VendorSummaryDTO[], pagination: PaginationDTO, summary: { total: number, active: number, suspended: number, pendingReview: number } }` |
| **Authorization** | AP Clerk, AP Manager, Controller, Procurement Manager, Auditor |
| **Caching** | `Cache-Control: private, max-age=30, stale-while-revalidate=60` |

### 10.12 GetMatchDetails

| Field | Content |
|---|---|
| **Purpose** | Retrieve the complete three-way match result for an invoice, including line-by-line comparison data and variance details. |
| **Input Parameters** | `invoiceId: string`, `companyId: string` (from tenant context) |
| **Output Shape** | `{ match: ThreeWayMatchDTO, lineItems: MatchLineItemDTO[], varianceSummary: { totalQuantityVariance: Decimal, totalPriceVariance: Decimal, totalVariance: Decimal, withinTolerance: boolean } }` |
| **Authorization** | AP Clerk, AP Manager, Controller, Auditor |
| **Caching** | `Cache-Control: private, max-age=15, stale-while-revalidate=30` |

### 10.13 GetApprovalChain

| Field | Content |
|---|---|
| **Purpose** | Retrieve the complete approval chain for an invoice, showing each level's status, approver, delegation, and timing. |
| **Input Parameters** | `invoiceId: string`, `companyId: string` (from tenant context) |
| **Output Shape** | `{ chain: ApprovalChainDTO, levels: ApprovalLevelDTO[], summary: { totalLevels: number, approvedLevels: number, currentLevel: number, overallStatus: string, timeElapsed: string, slaRemaining: string } }` where `ApprovalLevelDTO = { level, approverName, originalApproverName?, decision, decisionDate?, comments?, slaDeadline, slaStatus, isDelegated, isAutomated }` |
| **Authorization** | AP Clerk, AP Manager, Controller, Auditor |
| **Caching** | `Cache-Control: private, max-age=15, stale-while-revalidate=30` |

### 10.14 GetPaymentProposalDetails

| Field | Content |
|---|---|
| **Purpose** | Retrieve complete details of a payment proposal including all included invoices, amounts, discount savings, and approval status. |
| **Input Parameters** | `proposalId: string`, `companyId: string` (from tenant context) |
| **Output Shape** | `{ proposal: PaymentProposalDTO, items: PaymentProposalItemDTO[], summary: { invoiceCount: number, totalAmount: Decimal, totalDiscountSavings: Decimal, totalNetAmount: Decimal, proposedPaymentDate: Date }, batch?: PaymentBatchSummaryDTO }` |
| **Authorization** | AP Manager, Controller, Treasury Manager, Auditor |
| **Caching** | `Cache-Control: private, max-age=15, stale-while-revalidate=30` |

### 10.15 GetPaymentBatchDetails

| Field | Content |
|---|---|
| **Purpose** | Retrieve complete details of a payment batch including individual payment statuses, bank references, and confirmation tracking. |
| **Input Parameters** | `batchId: string`, `companyId: string` (from tenant context) |
| **Output Shape** | `{ batch: PaymentBatchDTO, payments: PaymentDTO[], summary: { totalCount: number, confirmedCount: number, pendingCount: number, failedCount: number, totalAmount: Decimal, executedAmount: Decimal, confirmedAmount: Decimal } }` |
| **Authorization** | AP Manager, Treasury Manager, Controller, Auditor |
| **Caching** | `Cache-Control: private, max-age=15, stale-while-revalidate=30` |

### 10.16 GetAPAuditTrail

| Field | Content |
|---|---|
| **Purpose** | Retrieve the immutable audit trail filtered by entity, date range, or action type. Primary tool for auditors and compliance. |
| **Input Parameters** | `companyId: string` (from tenant context), `entityType?: string` (vendor/invoice/payment/exception/approval/reconciliation), `entityId?: string`, `action?: string`, `dateFrom?: Date`, `dateTo?: Date`, `actorId?: string`, `sortBy?: 'createdAt'` (default: `createdAt`), `sortOrder?: 'asc' | 'desc'` (default: `desc`), `page?: number`, `pageSize?: number` |
| **Output Shape** | `{ auditEvents: AuditEventDTO[], pagination: PaginationDTO, summary: { totalEvents: number, dateRange: { from: Date, to: Date }, uniqueActors: number, uniqueEntityTypes: number } }` where `AuditEventDTO = { id, entityType, entityId, action, actorId, actorName, changes, metadata, ipAddress, createdAt }` |
| **Authorization** | AP Manager, Controller, Auditor (full access), AP Clerk (own actions only) |
| **Caching** | No cache — append-only, but queries are on-demand |

### 10.17 GetAPDashboard

| Field | Content |
|---|---|
| **Purpose** | Summary dashboard metrics for the AP department — key operational indicators at a glance. |
| **Input Parameters** | `companyId: string` (from tenant context), `period?: 'today' | 'week' | 'month' | 'quarter'` (default: `month`) |
| **Output Shape** | `{ metrics: APDashboardMetricsDTO }` where `APDashboardMetricsDTO = { totalOutstanding: Decimal, invoicesPendingApproval: number, invoicesPendingPayment: number, exceptionsOpen: number, exceptionsBreached: number, averageCycleTime: number, discountCaptureRate: number, totalPaidThisPeriod: Decimal, totalInvoicedThisPeriod: Decimal, topVendorsByAmount: VendorAmountDTO[], recentActivity: AuditEventDTO[], cashRequirementsNext30Days: Decimal }` |
| **Authorization** | AP Clerk, AP Manager, Controller, Treasury Manager, Auditor |
| **Caching** | `Cache-Control: private, max-age=60, stale-while-revalidate=120` |

### 10.18 GetAPAnalytics

| Field | Content |
|---|---|
| **Purpose** | Advanced analytics for the AP department — aging trends, cycle time distributions, exception rate analysis, discount capture performance. |
| **Input Parameters** | `companyId: string` (from tenant context), `dateFrom: Date`, `dateTo: Date`, `dimensions?: AnalyticsDimension[]` (aging/cycle_time/exception_rate/discount_capture/vendor_performance), `groupBy?: 'day' | 'week' | 'month'` |
| **Output Shape** | `{ analytics: AnalyticsResultDTO }` where `AnalyticsResultDTO = { aging: AgingTrendDTO[], cycleTimes: CycleTimeDistributionDTO, exceptionRates: ExceptionRateDTO[], discountCapture: DiscountCaptureDTO[], vendorPerformance: VendorPerformanceDTO[] }` |
| **Authorization** | AP Manager, Controller, Treasury Manager, Auditor |
| **Caching** | `Cache-Control: private, max-age=300, stale-while-revalidate=600` |

---

## Part 11: CQRS Pattern

### Architecture Overview

The AP domain follows CQRS (Command Query Responsibility Segregation) — commands and queries are structurally separated, independently optimized, and governed by different access patterns.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          API LAYER                                        │
│                                                                          │
│  ┌─────────────────────┐     ┌─────────────────────┐                   │
│  │   Command Routes    │     │    Query Routes      │                   │
│  │   POST /invoices    │     │    GET /invoices     │                   │
│  │   PUT /invoices/:id │     │    GET /invoices/:id │                   │
│  │   POST /payments    │     │    GET /dashboard    │                   │
│  └──────────┬──────────┘     └──────────┬──────────┘                   │
│             │                            │                               │
│  ┌──────────▼──────────┐     ┌──────────▼──────────┐                   │
│  │  Command Handlers   │     │   Query Handlers     │                   │
│  │  (authorization)    │     │   (authorization)    │                   │
│  └──────────┬──────────┘     └──────────┬──────────┘                   │
│             │                            │                               │
└─────────────┼────────────────────────────┼───────────────────────────────┘
              │                            │
┌─────────────▼────────────────────────────▼───────────────────────────────┐
│                        SERVICE LAYER                                      │
│                                                                          │
│  ┌─────────────────────┐     ┌─────────────────────┐                   │
│  │  Command Services   │     │   Query Services     │                   │
│  │  (business rules)   │     │   (read optimization)│                   │
│  │                     │     │                      │                   │
│  │  - VendorService    │     │  - InvoiceQueryService│                  │
│  │  - InvoiceService   │     │  - VendorQueryService │                  │
│  │  - ExceptionService │     │  - PaymentQueryService│                  │
│  │  - ApprovalService  │     │  - APAnalyticsService │                  │
│  │  - PaymentService   │     │                      │                   │
│  │  - ReconciliationSvc│     │                      │                   │
│  │  - CreditService    │     │                      │                   │
│  └──────────┬──────────┘     └──────────┬──────────┘                   │
│             │                            │                               │
└─────────────┼────────────────────────────┼───────────────────────────────┘
              │                            │
┌─────────────▼────────────────────────────▼───────────────────────────────┐
│                        DATA LAYER                                         │
│                                                                          │
│  ┌─────────────────────┐     ┌─────────────────────┐                   │
│  │   Prisma ORM        │     │   Prisma ORM         │                   │
│  │   (write models)    │     │   (read models)      │                   │
│  │                     │     │                      │                   │
│  │  ProcurementVendor  │     │  Same tables,        │                   │
│  │  ProcurementInvoice │     │  optimized queries   │                   │
│  │  ProcurementMatch   │     │  with select/include │                   │
│  │  ProcurementException│    │  and aggregation     │                   │
│  │  ProcurementApproval│     │                      │                   │
│  │  ProcurementPayment │     │                      │                   │
│  │  ProcurementCredit  │     │                      │                   │
│  │  ProcurementRecon   │     │                      │                   │
│  │  ProcurementAudit   │     │                      │                   │
│  └─────────────────────┘     └─────────────────────┘                   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Command Side (Write)

| Aspect | Specification |
|---|---|
| **Input** | Command object (validated by Zod at API boundary) |
| **Processing** | Service layer enforces business rules, state machine transitions, aggregate invariants |
| **Persistence** | Prisma create/update/delete within a transaction |
| **Events** | Domain events emitted post-commit for read model updates |
| **Audit** | Audit record written in same transaction as state change |
| **Consistency** | Strong — within the same Prisma transaction |

### Query Side (Read)

| Aspect | Specification |
|---|---|
| **Input** | Query parameters (validated by Zod at API boundary) |
| **Processing** | Minimal — authorization, then direct Prisma query |
| **Optimization** | Select only needed fields, include relations, aggregate in DB |
| **Consistency** | Eventually consistent — reads from same DB, but may lag by one transaction |
| **Caching** | HTTP Cache-Control headers, ETag for conditional requests |
| **Pagination** | Cursor-based or offset-based, with total count |

### Event Flow

```
1. Command arrives → API validates input (Zod)
2. Command handler checks authorization (role + tenant)
3. Service layer enforces business rules
4. Prisma transaction: write state change + audit record
5. Transaction commits
6. Domain events emitted (post-commit)
7. Event handlers update read models (if separate tables)
8. Cache invalidation triggered
9. Notifications sent (async)
```

### Read Model Refresh Strategy

| Strategy | Use Case | Latency |
|---|---|---|
| **Same transaction** | Audit records, state changes | 0ms (strongly consistent) |
| **Post-commit sync** | Dashboard metrics, aging reports | < 100ms (eventually consistent) |
| **Periodic refresh** | Analytics, trend data | 5min–1hr (time-bucketed) |
| **On-demand** | Exception queue, approval queue | Real-time (no cache) |

### When to Use Commands vs Queries

| Operation Type | Use Command | Use Query |
|---|---|---|
| Create new entity | `ReceiveInvoice` | — |
| Update existing entity | `UpdateInvoice` | — |
| Change entity state | `ApproveInvoice` | — |
| View entity details | — | `GetInvoiceDetails` |
| List entities | — | `GetInvoiceList` |
| Run analytics | — | `GetAPAnalytics` |
| Generate reports | — | `GetAPDashboard` |
| Export data | — | `GetAPAuditTrail` |

---

## Part 12: Validation Strategy

Every command passes through four validation layers before persistence. Each layer catches a different class of error.

### Layer 1: API Boundary (Zod Schema)

**Where**: API route handler, before command handler invocation.

**Purpose**: Reject malformed input before it reaches business logic. Catches typos, missing fields, wrong types, format violations.

| Command Category | Zod Schema Location | Key Validations |
|---|---|---|
| Vendor | `src/lib/validations/procurement/vendor.ts` | `name` min/max, `taxId` format, `email` format, `bankRoutingNumber` regex, `creditLimit` ≥ 0 |
| Invoice | `src/lib/validations/procurement/invoice.ts` | `lineItems` min 1, `unitPrice` ≥ 0, `dueDate` ≥ `invoiceDate`, `currency` ISO 4217 |
| Exception | `src/lib/validations/procurement/exception.ts` | `type` enum, `severity` enum, `varianceAmount` ≥ 0 |
| Approval | `src/lib/validations/procurement/approval.ts` | `decision` enum, `level` ≥ 1, `reason` min length |
| Payment | `src/lib/validations/procurement/payment.ts` | `amount` > 0, `method` enum, `idempotencyKey` uuid |
| Reconciliation | `src/lib/validations/procurement/reconciliation.ts` | `statementLines` min 1, `period` format, `adjustments` balance check |
| Credit | `src/lib/validations/procurement/credit.ts` | `creditAmount` > 0, `applications` balance check |

**Error Response**: `400 Bad Request` with structured Zod error details.

### Layer 2: Domain Rules (Service Layer)

**Where**: Service methods, after authorization but before repository calls.

**Purpose**: Enforce business invariants that Zod cannot validate — cross-field rules, state-dependent rules, threshold checks.

| Rule Type | Example | Enforcement |
|---|---|---|
| State machine | Invoice must be `matched` before `approved` | `StateMachine.canTransition(from, to)` |
| SoD | PO creator ≠ invoice approver | `SoDChecker.check(invoiceCapturer, approverId)` |
| Threshold routing | > $50K requires Controller | `ApprovalMatrixEvaluator.evaluate(amount)` |
| Credit limit | Outstanding + new > limit → warning | `VendorCreditChecker.check(vendorId, newAmount)` |
| Duplicate detection | Same vendor + invoice# within 90 days | `DuplicateDetector.check(companyId, vendorId, invoiceNumber)` |
| Financial precision | `totalAmount` = `sumDecimals(lineItems)` | `financialRound()`, `sumDecimals()` |
| SLA deadline | Must be set on timed transitions | `SLACalculator.calculate(transitionType)` |

**Error Response**: `422 Unprocessable Entity` with structured business rule violation details.

### Layer 3: Aggregate Invariants (Aggregate Root)

**Where**: Aggregate root methods, just before persistence.

**Purpose**: Ensure aggregate consistency — all child entities, value objects, and references are internally consistent.

| Aggregate | Invariant | Enforcement |
|---|---|---|
| VendorInvoice | `totalAmount` = `sumDecimals(lineItems[].totalPrice) + sumDecimals(taxDetails[].amount)` | Recalculated at save |
| VendorInvoice | `lineItem[].totalPrice` = `multiplyDecimals(quantity, unitPrice)` | Recalculated at save |
| ThreeWayMatch | `status` = `matched` only if ALL line items are `matched` | Evaluated after comparison |
| PaymentBatch | `executedAmount` = `sumDecimals(confirmedPayments[].amount)` | Recalculated at confirmation |
| PaymentProposal | `totalAmount` = `sumDecimals(proposalItems[].amount)` | Recalculated at save |

**Error Response**: `422 Unprocessable Entity` with aggregate invariant violation details.

### Layer 4: Repository Constraints (Database)

**Where**: Prisma schema constraints, unique indexes, foreign keys.

**Purpose**: Last line of defense — prevent data corruption even if business logic has a bug.

| Constraint | Type | Table | Columns |
|---|---|---|---|
| Unique vendor per company | `@@unique` | `ProcurementVendor` | `(companyId, vendorCode)` |
| Unique tax ID per company | `@@unique` | `ProcurementVendor` | `(companyId, taxId)` |
| Unique invoice per vendor | `@@unique` | `ProcurementInvoice` | `(companyId, vendorId, invoiceNumber)` |
| Unique batch number | `@@unique` | `ProcurementPaymentBatch` | `(companyId, batchNumber)` |
| Unique credit number | `@@unique` | `ProcurementCreditNote` | `(companyId, vendorId, creditNumber)` |
| Idempotency key | `@@unique` | `ProcurementPayment` | `(idempotencyKey)` |
| FK: Invoice → Vendor | `references` | `ProcurementInvoice` | `vendorId → ProcurementVendor.id` |
| FK: Match → Invoice | `references` | `ProcurementMatch` | `invoiceId → ProcurementInvoice.id` |
| FK: Exception → Invoice | `references` | `ProcurementException` | `invoiceId → ProcurementInvoice.id` |
| FK: Payment → Invoice | `references` | `ProcurementPayment` | `invoiceId → ProcurementInvoice.id` |
| Decimal precision | `@db.Decimal(38,12)` | All monetary fields | — |
| NotNull on companyId | `@notNull` | All tables | `companyId` |

**Error Response**: `409 Conflict` for unique constraint violations. `500 Internal Server Error` for unexpected constraint violations (logged as bugs).

### Validation Layer Summary

| Layer | Catches | Speed | Example |
|---|---|---|---|
| 1. Zod (API) | Malformed input | < 1ms | Missing `invoiceNumber`, wrong type for `amount` |
| 2. Domain (Service) | Business rule violations | < 5ms | Invoice not matched, SoD violation, threshold exceeded |
| 3. Aggregate (Root) | Invariant violations | < 2ms | Line totals don't sum, state machine invalid transition |
| 4. Repository (DB) | Data integrity violations | < 1ms | Duplicate invoice number, FK violation |

### Error Response Format

All API errors follow a consistent structure:

```json
{
  "error": {
    "code": "INSUFFICIENT_AUTHORITY",
    "message": "Invoice amount ($75,000) exceeds your approval limit ($50,000). Controller approval required.",
    "details": {
      "invoiceAmount": 75000,
      "approvalLimit": 50000,
      "requiredRole": "Controller",
      "currentRole": "AP Manager"
    },
    "statusCode": 403,
    "timestamp": "2026-07-21T14:30:00Z",
    "correlationId": "req_abc123"
  }
}
```

### Validation Responsibility Matrix

| Layer | Responsible For | Not Responsible For |
|---|---|---|
| Zod (API) | Type safety, format, presence | Business logic, state transitions |
| Domain (Service) | Business rules, SoD, thresholds | Data integrity, unique constraints |
| Aggregate (Root) | Internal consistency, calculations | Cross-aggregate rules |
| Repository (DB) | Unique constraints, FKs, NOT NULL | Business logic, state machines |

---

## Appendix A: Command-Query Mapping to API Routes

| Command | HTTP Method | Route |
|---|---|---|
| CreateVendor | POST | `/api/v1/vendors` |
| UpdateVendor | PUT | `/api/v1/vendors/:id` |
| ApproveVendor | POST | `/api/v1/vendors/:id/approve` |
| RejectVendor | POST | `/api/v1/vendors/:id/reject` |
| SuspendVendor | POST | `/api/v1/vendors/:id/suspend` |
| ReactivateVendor | POST | `/api/v1/vendors/:id/reactivate` |
| DeactivateVendor | POST | `/api/v1/vendors/:id/deactivate` |
| UpdateVendorBankDetails | PUT | `/api/v1/vendors/:id/bank-details` |
| ReceiveInvoice | POST | `/api/v1/invoices` |
| UpdateInvoice | PUT | `/api/v1/invoices/:id` |
| DeleteInvoice | DELETE | `/api/v1/invoices/:id` |
| ValidateInvoice | POST | `/api/v1/invoices/:id/validate` |
| RunThreeWayMatch | POST | `/api/v1/invoices/:id/match` |
| OverrideMatchResult | POST | `/api/v1/invoices/:id/match/override` |
| ApproveInvoice | POST | `/api/v1/invoices/:id/approve` |
| RejectInvoice | POST | `/api/v1/invoices/:id/reject` |
| EscalateInvoice | POST | `/api/v1/invoices/:id/escalate` |
| ScheduleInvoiceForPayment | POST | `/api/v1/invoices/:id/schedule` |
| BlockInvoice | POST | `/api/v1/invoices/:id/block` |
| UnblockInvoice | POST | `/api/v1/invoices/:id/unblock` |
| DisputeInvoice | POST | `/api/v1/invoices/:id/dispute` |
| ResolveDispute | POST | `/api/v1/invoices/:id/dispute/resolve` |
| VoidInvoice | POST | `/api/v1/invoices/:id/void` |
| CreateException | POST | `/api/v1/exceptions` |
| AssignException | POST | `/api/v1/exceptions/:id/assign` |
| ResolveException | POST | `/api/v1/exceptions/:id/resolve` |
| EscalateException | POST | `/api/v1/exceptions/:id/escalate` |
| AutoResolveException | POST | `/api/v1/exceptions/:id/auto-resolve` |
| BulkResolveExceptions | POST | `/api/v1/exceptions/bulk-resolve` |
| RequestApproval | POST | `/api/v1/approvals` |
| GrantApproval | POST | `/api/v1/approvals/:id/grant` |
| DenyApproval | POST | `/api/v1/approvals/:id/deny` |
| DelegateApproval | POST | `/api/v1/approvals/:id/delegate` |
| EscalateApproval | POST | `/api/v1/approvals/:id/escalate` |
| RecallApproval | POST | `/api/v1/approvals/:id/recall` |
| GeneratePaymentProposal | POST | `/api/v1/payment-proposals` |
| ReviewPaymentProposal | POST | `/api/v1/payment-proposals/:id/review` |
| ApprovePaymentProposal | POST | `/api/v1/payment-proposals/:id/approve` |
| RejectPaymentProposal | POST | `/api/v1/payment-proposals/:id/reject` |
| CreatePaymentBatch | POST | `/api/v1/payment-batches` |
| ExecutePayment | POST | `/api/v1/payment-batches/:batchId/payments/:paymentId/execute` |
| ConfirmPayment | POST | `/api/v1/payment-batches/:batchId/payments/:paymentId/confirm` |
| ReversePayment | POST | `/api/v1/payment-batches/:batchId/payments/:paymentId/reverse` |
| CancelPayment | POST | `/api/v1/payment-batches/:batchId/payments/:paymentId/cancel` |
| ImportVendorStatement | POST | `/api/v1/reconciliation/import` |
| RunReconciliation | POST | `/api/v1/reconciliation/:id/match` |
| AdjustReconciliation | POST | `/api/v1/reconciliation/:id/adjust` |
| CompleteReconciliation | POST | `/api/v1/reconciliation/:id/complete` |
| ReceiveCreditNote | POST | `/api/v1/credits` |
| ApplyCreditNote | POST | `/api/v1/credits/:id/apply` |
| VoidCreditNote | POST | `/api/v1/credits/:id/void` |

| Query | HTTP Method | Route |
|---|---|---|
| GetInvoiceDetails | GET | `/api/v1/invoices/:id` |
| GetInvoiceList | GET | `/api/v1/invoices` |
| GetVendorAging | GET | `/api/v1/reports/aging` |
| GetPaymentCalendar | GET | `/api/v1/reports/payment-calendar` |
| GetExceptionQueue | GET | `/api/v1/exceptions` |
| GetApprovalQueue | GET | `/api/v1/approvals/queue` |
| GetOutstandingLiabilities | GET | `/api/v1/reports/outstanding-liabilities` |
| GetDiscountAvailable | GET | `/api/v1/reports/discount-opportunities` |
| GetCashRequirements | GET | `/api/v1/reports/cash-requirements` |
| GetVendorDetail | GET | `/api/v1/vendors/:id` |
| GetVendorList | GET | `/api/v1/vendors` |
| GetMatchDetails | GET | `/api/v1/invoices/:id/match` |
| GetApprovalChain | GET | `/api/v1/invoices/:id/approval` |
| GetPaymentProposalDetails | GET | `/api/v1/payment-proposals/:id` |
| GetPaymentBatchDetails | GET | `/api/v1/payment-batches/:id` |
| GetAPAuditTrail | GET | `/api/v1/reports/audit-trail` |
| GetAPDashboard | GET | `/api/v1/reports/dashboard` |
| GetAPAnalytics | GET | `/api/v1/reports/analytics` |

---

## Appendix B: Domain Events Reference

| Event | Aggregate | Trigger | Consumers |
|---|---|---|---|
| `vendor.created` | Vendor | CreateVendor | NotificationService |
| `vendor.approved` | Vendor | ApproveVendor | NotificationService |
| `vendor.rejected` | Vendor | RejectVendor | NotificationService |
| `vendor.suspended` | Vendor | SuspendVendor | NotificationService |
| `vendor.reactivated` | Vendor | ReactivateVendor | NotificationService |
| `vendor.deactivated` | Vendor | DeactivateVendor | NotificationService |
| `vendor.updated` | Vendor | UpdateVendor | ReadModelRefresh |
| `vendor.bank_updated` | Vendor | UpdateVendorBankDetails | PaymentHoldService |
| `invoice.captured` | VendorInvoice | ReceiveInvoice | ValidationEngine |
| `invoice.updated` | VendorInvoice | UpdateInvoice | ReadModelRefresh |
| `invoice.validated` | VendorInvoice | ValidateInvoice | MatchingEngine |
| `invoice.validation_failed` | VendorInvoice | ValidateInvoice | ExceptionService |
| `invoice.matched` | VendorInvoice | RunThreeWayMatch | ApprovalService |
| `invoice.match.exception` | VendorInvoice | RunThreeWayMatch | ExceptionService |
| `invoice.match.override` | VendorInvoice | OverrideMatchResult | ApprovalService |
| `invoice.approved` | VendorInvoice | ApproveInvoice | PaymentService |
| `invoice.rejected` | VendorInvoice | RejectInvoice | ExceptionService |
| `invoice.payment.scheduled` | VendorInvoice | ScheduleInvoiceForPayment | ReadModelRefresh |
| `invoice.blocked` | VendorInvoice | BlockInvoice | NotificationService |
| `invoice.unblocked` | VendorInvoice | UnblockInvoice | ReadModelRefresh |
| `invoice.disputed` | VendorInvoice | DisputeInvoice | NotificationService |
| `invoice.dispute_resolved` | VendorInvoice | ResolveDispute | ReadModelRefresh |
| `invoice.voided` | VendorInvoice | VoidInvoice | NotificationService |
| `exception.created` | InvoiceException | CreateException | ExceptionService |
| `exception.assigned` | InvoiceException | AssignException | NotificationService |
| `exception.resolved` | InvoiceException | ResolveException | ApprovalService |
| `exception.escalated` | InvoiceException | EscalateException | NotificationService |
| `exception.auto_resolved` | InvoiceException | AutoResolveException | ReadModelRefresh |
| `exception.bulk_resolved` | InvoiceException | BulkResolveExceptions | ReadModelRefresh |
| `approval.created` | ApprovalChain | RequestApproval | NotificationService |
| `approval.level.decided` | ApprovalChain | ApproveInvoice / RejectInvoice | ReadModelRefresh |
| `approval.level.escalated` | ApprovalChain | EscalateInvoice | NotificationService |
| `approval.delegated` | ApprovalChain | DelegateApproval | NotificationService |
| `approval.chain.approved` | ApprovalChain | ApproveInvoice (final) | PaymentService |
| `approval.chain.rejected` | ApprovalChain | RejectInvoice | ExceptionService |
| `approval.recalled` | ApprovalChain | RecallApproval | NotificationService |
| `proposal.generated` | PaymentProposal | GeneratePaymentProposal | ReadModelRefresh |
| `proposal.approved` | PaymentProposal | ApprovePaymentProposal | PaymentBatchService |
| `proposal.rejected` | PaymentProposal | RejectPaymentProposal | NotificationService |
| `batch.created` | PaymentBatch | CreatePaymentBatch | TreasuryService |
| `payment.submitted` | PaymentBatch | ExecutePayment | ReadModelRefresh |
| `payment.confirmed` | PaymentBatch | ConfirmPayment | GLIntegrationService |
| `payment.reversed` | PaymentBatch | ReversePayment | GLIntegrationService |
| `payment.cancelled` | PaymentBatch | CancelPayment | ReadModelRefresh |
| `reconciliation.imported` | Reconciliation | ImportVendorStatement | MatchingEngine |
| `reconciliation.matched` | Reconciliation | RunReconciliation | ReadModelRefresh |
| `reconciliation.adjusted` | Reconciliation | AdjustReconciliation | GLIntegrationService |
| `reconciliation.completed` | Reconciliation | CompleteReconciliation | NotificationService |
| `credit.received` | VendorCredit | ReceiveCreditNote | ReadModelRefresh |
| `credit.applied` | VendorCredit | ApplyCreditNote | ReadModelRefresh |
| `credit.voided` | VendorCredit | VoidCreditNote | ReadModelRefresh |

---

*End of Phase 21A.0 — Accounts Payable Command & Query Model*
