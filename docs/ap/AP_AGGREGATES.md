# Phase 21A.0 — Accounts Payable Aggregate Root Design

> **Status**: Complete
> **Type**: Documentation-only — aggregate architecture specification
> **Date**: July 21, 2026
> **Scope**: Domain-driven aggregate root definitions for the AP procure-to-pay lifecycle
> **Predecessor**: Phase 21.0 (Gap Analysis, Workflow, Implementation Plan)
> **Prerequisites**: `src/lib/financial-precision.ts` (Decimal helpers), `src/server/procurement/types/index.ts` (existing type system)

---

## 1. Design Philosophy

The AP domain is **the financial backbone of the procure-to-pay lifecycle**. Every aggregate root is designed around four non-negotiable principles:

1. **Financial precision is sacred** — every monetary field uses `Prisma.Decimal(38, 12)`. All calculations use `financial-precision.ts` helpers. Zero native `number` arithmetic on money.
2. **Every transition produces evidence** — state changes are immutable audit records. The audit chain is append-only.
3. **AI may recommend, never decide** — AI provides suggestions, risk scores, and auto-classification. Human approval is required for all financial commitments.
4. **Aggregates are transaction boundaries** — one aggregate per transaction. Cross-aggregate coordination uses the saga pattern.

---

## 2. Aggregate Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AP AGGREGATE BOUNDARY MAP                            │
│                                                                             │
│  ┌──────────┐      ┌──────────────────┐      ┌──────────────────────┐      │
│  │ Vendor   │◄─────│  VendorInvoice   │─────►│ ThreeWayMatch        │      │
│  │ (root)   │ ref  │  (ROOT — center) │ ref  │ (root)               │      │
│  └──────────┘      │                  │      │                      │      │
│                     │  invoiceNumber   │      │  matchType           │      │
│                     │  totalAmount     │      │  status              │      │
│                     │  status          │      │  variances           │      │
│                     └────────┬─────────┘      └──────────────────────┘      │
│                              │                                              │
│           ┌──────────┬───────┴────────┬───────────────┐                     │
│           │          │                │               │                     │
│           ▼          ▼                ▼               ▼                     │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │POReference   │ │GRNReference  │ │ApprovalChain │ │InvoiceExcep- │       │
│  │(value obj)   │ │(value obj)   │ │(root)        │ │tion (root)   │       │
│  │              │ │              │ │              │ │              │       │
│  │ poId         │ │ grnId        │ │ approvalId   │ │ exceptionId  │       │
│  │ poNumber     │ │ grnNumber    │ │ levels[]     │ │ type         │       │
│  │ matchedAmount│ │ receivedAmt  │ │ decision     │ │ severity     │       │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘       │
│                                                                             │
│  ┌──────────────────┐      ┌──────────────────┐                            │
│  │ PaymentProposal  │─────►│ PaymentBatch     │                            │
│  │ (root)           │ ref  │ (root)           │                            │
│  │                  │      │                  │                            │
│  │ proposalNumber   │      │ batchNumber      │                            │
│  │ totalAmount      │      │ executedAmount   │                            │
│  │ invoices[]       │      │ bankReference    │                            │
│  └──────────────────┘      └──────────────────┘                            │
│                                                                             │
│  ┌──────────────────┐      ┌──────────────────┐                            │
│  │ VendorCredit     │      │ RecurringInvoice │                            │
│  │ (root)           │      │ (root) [future]  │                            │
│  │                  │      │                  │                            │
│  │ creditNumber     │      │ templateName     │                            │
│  │ creditAmount     │      │ scheduleRule     │                            │
│  │ appliedAmount    │      │ nextRunDate      │                            │
│  └──────────────────┘      └──────────────────┘                            │
│                                                                             │
│  LEGEND:  ──ref──►  = references by ID (never embeds)                      │
│           (root)    = aggregate root entity                                 │
│           (value obj) = value object within invoice aggregate               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Aggregate Boundary Rules

| Rule | Description |
|---|---|
| **One root per aggregate** | Each aggregate has exactly one root entity that owns all invariants |
| **ID-only references** | External references are always by ID string — never embed objects from other aggregates |
| **Invariant enforcement** | All business rules enforced at the aggregate root level before persistence |
| **Single-aggregate transactions** | Each transaction modifies ONE aggregate maximum; cross-aggregate coordination uses saga pattern |
| **Decimal everywhere** | All monetary fields use `Prisma.Decimal(38, 12)` — no exceptions |
| **companyId on every entity** | Multi-tenant isolation — every query and mutation scoped to `companyId` |
| **Immutable audit** | Every state transition writes an immutable audit record — append-only, no updates, no deletes |
| **Idempotency on payments** | Payment operations require idempotency keys — duplicate execution returns the same result |

---

## 4. Aggregate Specifications

---

### 4.1 Vendor

#### Purpose

Vendor lifecycle management — onboarding, due diligence, risk assessment, performance tracking, and vendor master data. The Vendor aggregate is the **reference entity** for all AP interactions.

#### Aggregate Root

`Vendor` (Prisma model: `ProcurementVendor`)

#### Lifecycle

```
pending_review ──approve──► active
active ────────suspend────► suspended
suspended ─────reactivate─► active
active ────────deactivate─► deactivated
pending_review ──reject───► deactivated
suspended ──────deactivate► deactivated
```

#### Owner

| Phase | Role |
|---|---|
| Creation | AP Clerk |
| Approval | Procurement Manager (risk <20%), Controller (risk ≥20%) |
| Suspension | AP Manager |
| Reactivation | Procurement Manager |
| Deactivation | Controller |

#### Invariants

| # | Invariant | Enforcement |
|---|---|---|
| V-1 | `vendorId` must be unique within `companyId` | DB unique constraint on `(companyId, vendorCode)` |
| V-2 | Vendor cannot be active if any required document is expired | Check `VendorDocument.expiryDate` at transition time |
| V-3 | Suspended vendors cannot be referenced in new POs | Service-layer check before PO creation |
| V-4 | Deactivated vendors cannot receive new invoices | Service-layer check at invoice capture |
| V-5 | Vendor bank details must pass format validation (routing number, account number) | Validation at creation/update |
| V-6 | `creditLimit` must be ≥ 0 | Decimal validation at save |
| V-7 | Risk score ≥80 requires Controller approval for activation | Approval routing at activation |
| V-8 | Duplicate detection: same `taxId` + `companyId` blocks new vendor | DB unique constraint + service check |

#### State Transitions

| From | To | Trigger | Guard |
|---|---|---|---|
| `pending_review` | `active` | Approval granted | All required documents valid, risk score checked |
| `pending_review` | `deactivated` | Rejection | Rejection reason required |
| `active` | `suspended` | Suspension action | Suspension reason required, blocks new POs |
| `active` | `deactivated` | Deactivation | No open invoices or POs (or confirm force) |
| `suspended` | `active` | Reactivation | Re-validation of documents |
| `suspended` | `deactivated` | Deactivation | Same as active deactivation |

#### Relationships

| Target | Type | Field |
|---|---|---|
| `VendorPerformance` | Child entities | `vendorId` — one per performance period |
| `VendorDocument` | Child entities | `vendorId` — W-9, insurance, contracts |
| `VendorInvoice` | Reference only | Vendor references invoice by `vendorId`; invoice references vendor by `vendorId` |
| `PurchaseOrder` | Reference only | PO references vendor by `vendorId` |

#### Financial Impact

| Field | Type | Description |
|---|---|---|
| `creditLimit` | `Decimal(38, 12)` | Maximum outstanding AP balance |
| `totalSpend` | `Decimal(38, 12)` | Running total of all PO amounts (aggregated, not in aggregate) |
| `avgPaymentDays` | `number` | Average days from invoice date to payment (calculated from payment history) |

**Credit limit enforcement**: When a new invoice is captured, `sumDecimals(outstandingInvoices)` must not exceed `creditLimit`. This is checked at the VendorInvoice aggregate level, not the Vendor aggregate.

#### Audit Requirements

| Transition | Audit Event |
|---|---|
| Vendor created | `recordAudit('vendor.created', { vendorId, requestedBy, category, taxCountry })` |
| Vendor approved | `recordAudit('vendor.approved', { vendorId, approvedBy, riskLevel, riskScore })` |
| Vendor rejected | `recordAudit('vendor.rejected', { vendorId, rejectedBy, reason })` |
| Vendor suspended | `recordAudit('vendor.suspended', { vendorId, suspendedBy, reason })` |
| Vendor reactivated | `recordAudit('vendor.reactivated', { vendorId, reactivatedBy })` |
| Vendor deactivated | `recordAudit('vendor.deactivated', { vendorId, deactivatedBy, reason, openInvoiceCount })` |
| Bank details changed | `recordAudit('vendor.bank_updated', { vendorId, updatedBy, previousBankLast4, newBankLast4 })` |

---

### 4.2 VendorInvoice (Core Aggregate)

#### Purpose

The **central aggregate** of the AP domain. The VendorInvoice manages the full lifecycle of a vendor invoice from capture through validation, matching, approval, payment, GL posting, and reconciliation. Everything in AP revolves around this aggregate.

#### Aggregate Root

`VendorInvoice` (Prisma model: `ProcurementInvoice`)

#### Lifecycle

```
draft ──capture──► captured ──validate──► validated ──match──► matched
                                                          │
                                                          ├──► exception ──resolve──► matched
                                                          │
                                                          └──► disputed
matched ──submit approval──► approving ──approve──► approved
                                                     │
                                                     └──► rejected ──► exception
approved ──schedule payment──► scheduled ──pay──► paid ──post──► posted
paid ──reconcile──► reconciled

Any state ──cancel──► cancelled (before payment only)
```

#### Aggregate Root Entity

The `VendorInvoice` root contains these child entities:

| Child Entity | Description | Cardinality |
|---|---|---|
| `InvoiceLineItem` | Individual line items with quantity, price, tax, account coding | 1..* |
| `POReference` | Value object — reference to PO for matching | 0..* |
| `GRNReference` | Value object — reference to GRN for matching | 0..* |
| `InvoiceValidationResult` | Validation results per field | 0..* |
| `InvoiceTaxDetail` | Tax breakdown (VAT, withholding, etc.) | 0..* |

#### Owner

| Phase | Role |
|---|---|
| Capture | AP Clerk |
| Validation | Automated |
| Matching | Automated |
| Exception resolution | AP Clerk / AP Manager |
| Approval | Role-based (threshold routing) |
| Payment scheduling | AP Manager |
| Payment execution | Treasury |
| GL posting | Automated |
| Reconciliation | AP Manager / Controller |

#### Invariants

| # | Invariant | Enforcement |
|---|---|---|
| INV-1 | `invoiceNumber` must be unique within `(companyId, vendorId)` | DB unique constraint |
| INV-2 | `totalAmount` = `sumDecimals(lineItems[].totalPrice)` + `sumDecimals(taxDetails[].amount)` | Recalculated on every mutation |
| INV-3 | `totalWithTax` = `totalAmount` + `taxAmount` — must never be manually set | Derived field, computed at save |
| INV-4 | Invoice cannot proceed to `matched` if any line item is missing `accountCode` | Validation gate |
| INV-5 | Invoice in `paid` or `posted` state cannot be cancelled | State guard |
| INV-6 | `dueDate` must be ≥ `invoiceDate` | Cross-field validation at creation |
| INV-7 | `discountDate` must be ≤ `dueDate` if present | Cross-field validation |
| INV-8 | Duplicate detection: same `(companyId, vendorId, invoiceNumber)` blocks creation | DB constraint + service check |
| INV-9 | Invoice amount > vendor `creditLimit` + current outstanding raises exception | Checked at capture time |
| INV-10 | Invoice in `cancelled` state is immutable | All mutations blocked |
| INV-11 | All line item `totalPrice` = `multiplyDecimals(quantity, unitPrice)` | Recalculated on save, never trusted from input |
| INV-12 | `taxAmount` = `sumDecimals(lineItems[].taxAmount)` — must match header | Recalculated on save |
| INV-13 | Approval is required before payment for any invoice > $0 | Payment scheduling guard |

#### State Transitions

| From | To | Trigger | Guard |
|---|---|---|---|
| `draft` | `captured` | AP Clerk submits | All required fields present, line items ≥ 1 |
| `captured` | `validated` | Validation engine completes | All required fields pass, no blocking errors |
| `captured` | `exception` | Validation fails | Validation errors documented |
| `validated` | `matched` | Three-way match succeeds (or two-way for service invoices) | All variances within tolerance |
| `validated` | `exception` | Three-way match fails | Variance exceeds tolerance, exception created |
| `matched` | `approving` | Submitted for approval | Segregation of duties check passes |
| `matched` | `exception` | Match override creates exception | Override reason required |
| `approving` | `approved` | All required approval levels approved | Approval chain complete |
| `approving` | `rejected` | Any approval level rejects | Rejection reason required |
| `rejected` | `exception` | Returns to exception queue | Exception record created |
| `approved` | `scheduled` | Payment proposal includes invoice | Invoice not already scheduled |
| `scheduled` | `paid` | Payment confirmed | Bank reference received, idempotency key |
| `paid` | `posted` | GL entries created | Journal entries balanced, period open |
| `posted` | `reconciled` | Vendor statement reconciliation matched | Vendor statement matches ledger |
| `captured`/`validated` | `disputed` | Vendor disputes | Dispute reason required |
| `captured`/`validated` | `cancelled` | AP Clerk cancels | Before approval only, reason required |
| Any pre-payment | `cancelled` | Void | Before payment execution only |

#### Relationships

| Target | Type | Field | Description |
|---|---|---|---|
| `Vendor` | Reference | `vendorId` | Which vendor issued this invoice |
| `POReference` | Value object (embedded) | `poId`, `poNumber` | PO(s) this invoice is matched against |
| `GRNReference` | Value object (embedded) | `grnId`, `grnNumber` | GRN(s) this invoice is matched against |
| `ThreeWayMatch` | Reference | `matchId` | The match result for this invoice |
| `InvoiceException` | Reference | `exceptionId` | Exception(s) raised for this invoice |
| `ApprovalChain` | Reference | `approvalChainId` | Approval workflow for this invoice |
| `PaymentProposal` | Reference (reverse) | Proposals reference invoice by `invoiceId` | Invoice included in a proposal |
| `PaymentBatch` | Reference (reverse) | Batches reference invoice by `invoiceId` | Invoice paid in a batch |
| `VendorCredit` | Reference (reverse) | Credits may reference invoice by `appliedToInvoiceId` | Credit note applied to this invoice |

#### Financial Impact

| Field | Type | Calculation |
|---|---|---|
| `totalAmount` | `Decimal(38, 12)` | `sumDecimals(lineItems[].totalPrice)` |
| `taxAmount` | `Decimal(38, 12)` | `sumDecimals(taxDetails[].amount)` |
| `totalWithTax` | `Decimal(38, 12)` | `totalAmount + taxAmount` (derived, never set directly) |
| `exchangeRate` | `Decimal(38, 12)` | Rate at invoice date: 1 baseCurrency = this many invoiceCurrency |
| `discountAmount` | `Decimal(38, 12)` | `totalWithTax * discountPercent / 100` (if within discount window) |
| `lineItem[].unitPrice` | `Decimal(38, 12)` | Per-unit price from vendor |
| `lineItem[].totalPrice` | `Decimal(38, 12)` | `multiplyDecimals(quantity, unitPrice)` |
| `lineItem[].taxAmount` | `Decimal(38, 12)` | `multiplyDecimals(totalPrice, taxRate / 100)` |

All calculations use `financial-precision.ts` helpers. No native `number` arithmetic.

#### Audit Requirements

| Transition | Audit Event |
|---|---|
| Invoice captured | `recordAudit('invoice.captured', { invoiceId, vendorId, amount, currency, source, capturedBy })` |
| Invoice validated | `recordAudit('invoice.validated', { invoiceId, result, validationErrors[], warnings[] })` |
| Invoice matched | `recordAudit('invoice.matched', { invoiceId, matchType, matchId, result, variances })` |
| Match exception | `recordAudit('invoice.match.exception', { invoiceId, exceptionId, type, variance })` |
| Match override | `recordAudit('invoice.match.override', { invoiceId, overrideBy, reason, originalVariance })` |
| Approval submitted | `recordAudit('invoice.approval.submitted', { invoiceId, approvalChainId, level, approverId })` |
| Approval decided | `recordAudit('invoice.approval.decided', { invoiceId, level, decision, reason, delegatedFrom? })` |
| Payment scheduled | `recordAudit('invoice.payment.scheduled', { invoiceId, proposalId, scheduledDate })` |
| Payment confirmed | `recordAudit('invoice.payment.confirmed', { invoiceId, paymentId, bankReference, amount })` |
| GL posted | `recordAudit('invoice.gl.posted', { invoiceId, journalEntryId[], totalDebit, totalCredit })` |
| Reconciled | `recordAudit('invoice.reconciled', { invoiceId, reconciliationId, variance })` |
| Disputed | `recordAudit('invoice.disputed', { invoiceId, disputeReason, disputedBy })` |
| Cancelled | `recordAudit('invoice.cancelled', { invoiceId, reason, cancelledBy, refundRequired })` |

---

### 4.3 POReference (Value Object)

#### Purpose

A lightweight value object embedded in the VendorInvoice aggregate that references a Purchase Order from the procurement context. This is NOT a separate aggregate — the PO aggregate belongs to the procurement bounded context and is referenced by ID.

#### Entity Type

Value object (embedded in VendorInvoice)

#### Fields

| Field | Type | Description |
|---|---|---|
| `poId` | `string` | Reference to PO in procurement context |
| `poNumber` | `string` | Denormalized PO number for display |
| `poTotalAmount` | `Decimal(38, 12)` | PO total at time of matching (snapshot) |
| `poCurrency` | `string` | PO currency code |
| `billedAmount` | `Decimal(38, 12)` | Amount of PO already billed (including this invoice) |
| `billedPercent` | `number` | Percentage of PO billed |
| `linkedAt` | `Date` | When this PO was linked to the invoice |

#### Invariants

| # | Invariant | Enforcement |
|---|---|---|
| POR-1 | `poId` must reference an existing PO in the same `companyId` | Service check at link time |
| POR-2 | `billedAmount` must not exceed `poTotalAmount` | Checked during matching |
| POR-3 | A single invoice may reference multiple POs (for split invoices) | Array of POReference on the invoice |
| POR-4 | PO must be in `sent`, `acknowledged`, `partially-received`, or `fully-received` status | Status check at link time |

#### Financial Impact

| Field | Type | Usage |
|---|---|---|
| `poTotalAmount` | `Decimal(38, 12)` | Snapshot for variance calculation |
| `billedAmount` | `Decimal(38, 12)` | Accumulated billing across all invoices for this PO |

---

### 4.4 GRNReference (Value Object)

#### Purpose

A lightweight value object embedded in the VendorInvoice aggregate that references a Goods Receipt Note. Used for three-way matching to verify that goods were physically received before payment.

#### Entity Type

Value object (embedded in VendorInvoice)

#### Fields

| Field | Type | Description |
|---|---|---|
| `grnId` | `string` | Reference to GRN in receiving context |
| `grnNumber` | `string` | Denormalized GRN number for display |
| `receivedDate` | `Date` | When goods were received |
| `totalAcceptedAmount` | `Decimal(38, 12)` | Value of accepted goods |
| `totalRejectedAmount` | `Decimal(38, 12)` | Value of rejected goods |
| `receivedBy` | `string` | Who received the goods |
| `linkedAt` | `Date` | When this GRN was linked to the invoice |

#### Invariants

| # | Invariant | Enforcement |
|---|---|---|
| GR-1 | `grnId` must reference an existing GRN in the same `companyId` | Service check at link time |
| GR-2 | GRN must be in `accepted` or `complete` status | Status check at link time |
| GR-3 | GRN must be linked to the same PO as the invoice | Cross-reference validation |
| GR-4 | For two-way match invoices (service type), GRN reference is optional | Match type check |

#### Financial Impact

| Field | Type | Usage |
|---|---|---|
| `totalAcceptedAmount` | `Decimal(38, 12)` | Compared against invoice line item quantities |
| `totalRejectedAmount` | `Decimal(38, 12)` | Reduces the billable quantity |

---

### 4.5 ThreeWayMatch

#### Purpose

The matching result aggregate — an independent entity that captures the outcome of matching an Invoice against PO and GRN. The match result is **decoupled from invoice state** because: (a) matches can be re-run when GRN arrives late, (b) match overrides need their own audit trail, and (c) match exceptions are managed independently.

#### Aggregate Root

`ThreeWayMatch` (Prisma model: `ProcurementMatch`)

#### Lifecycle

```
pending ──execute──► matched ──override──► overridden ──approve──► approved
    │                                                       │
    └──► exception ──resolve──► resolved ──approve──► approved
                                    │
                                    └──► rejected ──► exception (re-open)
```

#### Owner

| Phase | Role |
|---|---|
| Execution | Automated |
| Exception resolution | AP Clerk |
| Override approval | AP Manager (price variance >$0.01 or >1%) |
| Final approval | Controller (total variance >$10 or >1%) |

#### Invariants

| # | Invariant | Enforcement |
|---|---|---|
| M-1 | A match must reference exactly one invoice | FK constraint |
| M-2 | Each invoice line item produces one `MatchLineItem` | Created during match execution |
| M-3 | Match `status` = `matched` only if ALL line items are `matched` | Evaluated after all line items compared |
| M-4 | Match `status` = `exception` if ANY line item exceeds tolerance | Tolerance config per dimension |
| M-5 | Match variances must be within system-wide max tolerance or require Controller override | Guard on override |
| M-6 | A match can be re-executed (status resets to `pending`) only if invoice is in `validated` or `exception` state | State check |
| M-7 | Override reason is mandatory when converting `exception` to `matched` | Field validation |
| M-8 | `quantityVariance` = `invoiceQty - receivedQty` (not PO qty for 3-way) | Calculation rule |

#### Match Line Items (child entities)

| Field | Type | Description |
|---|---|---|
| `invoiceItemId` | `string` | Reference to invoice line item |
| `poItemId` | `string` | Reference to PO line item |
| `receiptItemId` | `string?` | Reference to GRN line item (3-way only) |
| `quantityMatch` | `boolean` | Whether quantities are within tolerance |
| `priceMatch` | `boolean` | Whether prices are within tolerance |
| `quantityVariance` | `Decimal(38, 12)` | Difference in quantities |
| `priceVariance` | `Decimal(38, 12)` | Difference in unit prices |
| `totalVariance` | `Decimal(38, 12)` | `quantityVariance * unitPrice + priceVariance * quantity` |
| `status` | enum | `matched`, `exception`, `resolved`, `overridden` |
| `discrepancyNotes` | `string?` | Explanation of variance |

#### State Transitions

| From | To | Trigger | Guard |
|---|---|---|---|
| `pending` | `matched` | Match execution completes, all items within tolerance | Tolerance config loaded |
| `pending` | `exception` | Match execution completes, any item exceeds tolerance | Exception details documented |
| `exception` | `resolved` | AP Clerk resolves variance | Resolution action + reason |
| `exception` | `overridden` | AP Manager overrides | Override reason + approval |
| `resolved` | `matched` | Re-match confirms resolution | Re-execution validates |
| `overridden` | `approved` | Controller approves override | Total variance within max tolerance |
| `matched` | `approved` | Auto-approved (low variance) | Variance < auto-approve threshold |

#### Relationships

| Target | Type | Field |
|---|---|---|
| `VendorInvoice` | Reference | `invoiceId` |
| `POReference` | Reference | `poId` (from invoice's PO references) |
| `GRNReference` | Reference | `grnId` (from invoice's GRN references, 3-way only) |
| `InvoiceException` | Reference | `exceptionId` (created when status = exception) |

#### Financial Impact

| Field | Type | Calculation |
|---|---|---|
| `quantityVariance` | `Decimal(38, 12)` | `invoiceQty - matchedQty` (received for 3-way, PO for 2-way) |
| `priceVariance` | `Decimal(38, 12)` | `invoiceUnitPrice - poUnitPrice` |
| `totalVariance` | `Decimal(38, 12)` | Per-line variance × quantity for line |
| `totalMatchAmount` | `Decimal(38, 12)` | Sum of all line items that matched |
| `totalExceptionAmount` | `Decimal(38, 12)` | Sum of all line items in exception |

#### Audit Requirements

| Transition | Audit Event |
|---|---|
| Match executed | `recordAudit('match.executed', { matchId, invoiceId, matchType, result, lineItemCount, matchedCount, exceptionCount })` |
| Match overridden | `recordAudit('match.override', { matchId, overrideBy, reason, originalVariance, overrideVariance })` |
| Match resolved | `recordAudit('match.resolved', { matchId, resolution, resolvedBy, resolutionAction })` |
| Match approved | `recordAudit('match.approved', { matchId, approvedBy, totalVariance })` |

---

### 4.6 InvoiceException

#### Purpose

Exception management for invoices that fail matching, validation, or require manual intervention. Each exception is an independent entity with its own lifecycle, SLA, and resolution trail. Exceptions are **recoverable by design** — no dead-end states.

#### Aggregate Root

`InvoiceException` (Prisma model: `ProcurementException`)

#### Lifecycle

```
open ──assign──► in_progress ──resolve──► resolved
    │                                      │
    ├──► escalated ──resolve──► resolved    │
    │         │                            │
    │         └──► resolved (by escalator) │
    │                                      │
    └──► rejected (invalid exception)      │
                                           │
    resolved ──verify──► verified          │
                           │               │
                           └──► re-opened ─┘ (if resolution was incorrect)
    
    open/in_progress ──void──► voided (invoice cancelled)
```

#### Owner

| Phase | Role |
|---|---|
| Creation | Automated (match/validation engine) |
| Assignment | AP Clerk (by exception type + expertise) |
| Resolution | AP Clerk (within tolerance) / AP Manager (beyond tolerance) |
| Escalation | Automatic on SLA breach (24h) |
| Verification | AP Manager |
| Void | Controller |

#### Invariants

| # | Invariant | Enforcement |
|---|---|---|
| EX-1 | Exception must reference an existing `VendorInvoice` in the same `companyId` | FK constraint |
| EX-2 | SLA deadline is mandatory at creation | Field validation |
| EX-3 | Resolution action is mandatory when status = `resolved` | State guard |
| EX-4 | Voided exceptions cannot be re-opened | State guard |
| EX-5 | Exception type determines which resolution actions are valid | Type-action mapping |
| EX-6 | Same exception type on same invoice re-opens existing exception (no duplicate) | Deduplication at creation |
| EX-7 | Critical severity exceptions auto-escalate to AP Manager immediately | Escalation rule |

#### Exception Types

| Type | Description | Resolution Actions |
|---|---|---|
| `price_mismatch` | Invoice price differs from PO price beyond tolerance | Vendor debit note, PO price adjustment, override |
| `quantity_mismatch` | Invoice quantity differs from GRN quantity beyond tolerance | GRN correction, vendor credit note, override |
| `duplicate` | Potential duplicate invoice detected | Void duplicate, confirm unique, merge |
| `missing_grn` | Three-way match cannot find matching GRN | Create GRN, switch to 2-way match, void |
| `missing_po` | Invoice references PO that doesn't exist | Create retroactive PO, remove PO link, void |
| `validation_failed` | Invoice failed automated validation | Correct data, override validation rule |
| `tax_mismatch` | Tax calculation differs from expected | Recalculate tax, override, vendor adjustment |
| `credit_limit_exceeded` | Invoice + outstanding > vendor credit limit | Request credit increase, partial payment, defer |
| `duplicate_payment_risk` | Similar payment already exists within 90 days | Confirm unique, cancel duplicate, override |

#### State Transitions

| From | To | Trigger | Guard |
|---|---|---|---|
| `open` | `in_progress` | AP Clerk begins resolution | Exception assigned |
| `open` | `escalated` | SLA breach (24h) or critical severity | Auto-escalation |
| `open` | `voided` | Invoice cancelled | Controller approval |
| `in_progress` | `resolved` | Resolution action completed | Resolution action + reason documented |
| `in_progress` | `escalated` | Cannot resolve within tolerance or SLA breach | Escalation reason |
| `escalated` | `resolved` | Escalated approver resolves | Same as in_progress resolution |
| `resolved` | `verified` | AP Manager verifies resolution | Verification check |
| `resolved` | `re-opened` | Resolution was incorrect | Re-open reason required |
| `re-opened` | `in_progress` | Re-assignment | New resolution attempt |

#### Relationships

| Target | Type | Field |
|---|---|---|
| `VendorInvoice` | Reference | `invoiceId` |
| `ThreeWayMatch` | Reference | `matchId` (if created from match failure) |
| `VendorCredit` | Reference | `creditNoteId` (if resolution involves credit note) |

#### Financial Impact

| Field | Type | Description |
|---|---|---|
| `varianceAmount` | `Decimal(38, 12)` | The monetary variance that caused the exception |
| `resolutionAmount` | `Decimal(38, 12)` | The monetary amount of the resolution (if applicable) |

#### Audit Requirements

| Transition | Audit Event |
|---|---|
| Exception created | `recordAudit('exception.created', { exceptionId, invoiceId, type, severity, varianceAmount, slaDeadline })` |
| Exception assigned | `recordAudit('exception.assigned', { exceptionId, assignedTo, assignedBy })` |
| Exception escalated | `recordAudit('exception.escalated', { exceptionId, escalatedTo, reason, slaBreached })` |
| Exception resolved | `recordAudit('exception.resolved', { exceptionId, resolution, resolutionAction, resolvedBy, resolutionAmount })` |
| Exception verified | `recordAudit('exception.verified', { exceptionId, verifiedBy, verificationResult })` |
| Exception voided | `recordAudit('exception.voided', { exceptionId, voidedBy, reason })` |
| Exception re-opened | `recordAudit('exception.reopened', { exceptionId, reopenedBy, reason, previousResolution })` |

---

### 4.7 ApprovalChain

#### Purpose

Multi-level approval workflow for invoices. Separated from VendorInvoice because: (a) approval workflows are reusable across invoice types (standard, credit note, debit note), (b) approval state transitions have different actors than invoice state transitions, and (c) delegation and escalation have their own complex lifecycle.

#### Aggregate Root

`ApprovalChain` (Prisma model: `ProcurementApprovalChain`)

#### Lifecycle

```
created ──route──► routing ──start──► in_progress ──decide──► decided
    │                                              │
    │                                              ├──► approved (all levels approved)
    │                                              │
    │                                              ├──► rejected (any level rejected)
    │                                              │
    │                                              └──► escalated (SLA breach)
    │
    └──► cancelled (invoice cancelled before approval)
```

#### Owner

| Phase | Role |
|---|---|
| Creation | Automated (on invoice submission for approval) |
| Routing | Automated (approval matrix rules) |
| Decision | Role-based approvers (threshold routing) |
| Escalation | Automatic on SLA breach (24h) |
| Cancellation | AP Clerk (if invoice cancelled) |

#### Invariants

| # | Invariant | Enforcement |
|---|---|---|
| AC-1 | Approval chain must reference exactly one `VendorInvoice` | FK constraint |
| AC-2 | Each level must be decided before the next level can be approved | Level sequencing |
| AC-3 | Same person who captured the invoice cannot approve it (segregation of duties) | SoD check at routing |
| AC-4 | Delegation must not create circular chains (A→B→C→A) | Delegation cycle detection |
| AC-5 | Total required levels determined by `max(invoiceAmount, threshold levels)` from approval matrix | Matrix evaluation |
| AC-6 | Auto-approved invoices (low-risk, trusted vendor, matched) still produce an approval record with `automatedApproval = true` | Audit trail for all approvals |
| AC-7 | Approval SLA deadline is mandatory | Calculated from approval matrix `escalationMinutes` |

#### Approval Levels (child entities)

| Field | Type | Description |
|---|---|---|
| `level` | `number` | Level number (1 = first approver) |
| `approverId` | `string` | Who should approve at this level |
| `originalApproverId` | `string` | Original assignee (if delegated) |
| `delegatedFrom` | `string?` | Original approver if delegation occurred |
| `decision` | `enum` | `pending`, `approved`, `rejected`, `escalated` |
| `decisionDate` | `Date?` | When decision was made |
| `comments` | `string?` | Approval/rejection reason |
| `slaDeadline` | `Date` | When auto-escalation triggers |
| `isDelegated` | `boolean` | Whether this level was delegated |
| `isAutomated` | `boolean` | Whether approval was auto-approved by system |
| `authorityLimit` | `Decimal(38, 12)` | Maximum amount this approver can approve |

#### Threshold Routing Rules

| Invoice Amount | Required Levels | Roles |
|---|---|---|
| < $1,000 | 1 | AP Clerk |
| $1,000 – $10,000 | 2 | AP Clerk → AP Manager |
| $10,000 – $50,000 | 3 | AP Clerk → AP Manager → Controller |
| $50,000 – $100,000 | 4 | AP Clerk → AP Manager → Controller → CFO |
| > $100,000 | 5 | AP Clerk → AP Manager → Controller → CFO → Treasurer |

**Note**: These are default thresholds. Actual routing comes from the `ApprovalMatrixEvaluator` in `automation-studio`.

#### State Transitions

| From | To | Trigger | Guard |
|---|---|---|---|
| `created` | `routing` | Approval matrix evaluation begins | Invoice linked |
| `routing` | `in_progress` | First approver notified | Levels determined |
| `in_progress` | `approved` | All levels approved | Final level decision = approved |
| `in_progress` | `rejected` | Any level rejects | Rejection reason mandatory |
| `in_progress` | `escalated` | SLA breach on any level | Auto-escalation |
| `in_progress` | `cancelled` | Invoice cancelled | Invoice state = cancelled |

#### Relationships

| Target | Type | Field |
|---|---|---|
| `VendorInvoice` | Reference | `invoiceId` |
| `ApprovalChain` | Self-reference | `escalatedFrom` (chain ID that triggered this chain) |

#### Financial Impact

| Field | Type | Description |
|---|---|---|
| `totalAmount` | `Decimal(38, 12)` | Invoice amount at time of approval submission (snapshot) |
| `currency` | `string` | Invoice currency at time of approval submission |

#### Audit Requirements

| Transition | Audit Event |
|---|---|
| Approval created | `recordAudit('approval.created', { chainId, invoiceId, levels, totalAmount })` |
| Level routed | `recordAudit('approval.level.routed', { chainId, level, approverId, slaDeadline })` |
| Level decided | `recordAudit('approval.level.decided', { chainId, level, decision, reason, delegatedFrom?, isAutomated? })` |
| Delegation | `recordAudit('approval.delegated', { chainId, level, from, to, reason })` |
| Escalation | `recordAudit('approval.escalated', { chainId, level, reason, escalatedTo })` |
| Chain approved | `recordAudit('approval.chain.approved', { chainId, invoiceId, totalLevels, duration })` |
| Chain rejected | `recordAudit('approval.chain.rejected', { chainId, invoiceId, rejectedAtLevel, reason })` |

---

### 4.8 PaymentProposal

#### Purpose

Batch payment planning — groups approved invoices into optimized payment proposals considering cash flow, early-pay discounts, vendor payment terms, and treasury constraints. A proposal is **planning only** — it does not move money. The PaymentBatch aggregate handles execution.

#### Aggregate Root

`PaymentProposal` (Prisma model: `ProcurementPaymentProposal`)

#### Lifecycle

```
draft ──generate──► generated ──submit──► submitted ──approve──► approved
    │                                                       │
    │                                                       ├──► rejected ──► draft (modify & resubmit)
    │                                                       │
    │                                                       └──► processed (payment batch created)
    │
    └──► cancelled (before approval)
```

#### Owner

| Phase | Role |
|---|---|
| Generation | Automated (daily batch) or AP Manager (manual) |
| Review | AP Manager |
| Approval | AP Manager (<$100K), Controller (≥$100K) |
| Cancellation | AP Manager |

#### Invariants

| # | Invariant | Enforcement |
|---|---|---|
| PP-1 | Proposal must contain ≥ 1 invoice | Generation rule |
| PP-2 | All invoices in proposal must be in `approved` or `scheduled` state | Filter at generation |
| PP-3 | `totalAmount` = `sumDecimals(proposalItems[].amount)` | Recalculated on every mutation |
| PP-4 | No invoice may appear in more than one `approved` proposal simultaneously | Deduplication check |
| PP-5 | `proposedPaymentDate` must be ≥ today | Date validation |
| PP-6 | Discount-eligible invoices must be prioritized if discount window is within 5 days | Sorting rule |
| PP-7 | Proposal cannot be approved if total > available treasury cash balance (warning, not block) | Treasury check |

#### Proposal Items (child entities)

| Field | Type | Description |
|---|---|---|
| `invoiceId` | `string` | Reference to VendorInvoice |
| `vendorId` | `string` | Denormalized for grouping |
| `amount` | `Decimal(38, 12)` | Invoice amount to be paid |
| `discountAmount` | `Decimal(38, 12)` | Early-pay discount available (0 if none) |
| `netAmount` | `Decimal(38, 12)` | `amount - discountAmount` |
| `paymentMethod` | `PaymentMethod` | Wire, ACH, check, etc. |
| `paymentPriority` | `number` | 1 = highest (discount-driven), 5 = lowest |
| `scheduledDate` | `Date` | When this payment should execute |

#### State Transitions

| From | To | Trigger | Guard |
|---|---|---|---|
| `draft` | `generated` | Generation algorithm completes | ≥ 1 invoice, all approved |
| `generated` | `submitted` | AP Manager submits for approval | Review complete |
| `submitted` | `approved` | Approver approves | Amount within authority |
| `submitted` | `rejected` | Approver rejects | Rejection reason required |
| `rejected` | `draft` | AP Manager modifies | Same proposal, new items |
| `approved` | `processed` | PaymentBatch created from proposal | Batch creation confirmed |
| `draft`/`generated` | `cancelled` | AP Manager cancels | Reason required |

#### Relationships

| Target | Type | Field |
|---|---|---|
| `VendorInvoice` | Reference (multiple) | `proposalItems[].invoiceId` |
| `PaymentBatch` | Reference (reverse) | Batch references proposal by `proposalId` |

#### Financial Impact

| Field | Type | Calculation |
|---|---|---|
| `totalAmount` | `Decimal(38, 12)` | `sumDecimals(proposalItems[].amount)` |
| `totalDiscountSavings` | `Decimal(38, 12)` | `sumDecimals(proposalItems[].discountAmount)` |
| `totalNetAmount` | `Decimal(38, 12)` | `totalAmount - totalDiscountSavings` |
| `invoiceCount` | `number` | Count of proposal items |

#### Audit Requirements

| Transition | Audit Event |
|---|---|
| Proposal generated | `recordAudit('proposal.generated', { proposalId, invoiceCount, totalAmount, totalDiscountSavings, generatedBy })` |
| Proposal submitted | `recordAudit('proposal.submitted', { proposalId, submittedBy })` |
| Proposal approved | `recordAudit('proposal.approved', { proposalId, approvedBy, totalAmount, approvalLevel })` |
| Proposal rejected | `recordAudit('proposal.rejected', { proposalId, rejectedBy, reason })` |
| Proposal processed | `recordAudit('proposal.processed', { proposalId, batchId, processedAt })` |
| Proposal cancelled | `recordAudit('proposal.cancelled', { proposalId, cancelledBy, reason })` |

---

### 4.9 PaymentBatch

#### Purpose

Payment execution — takes an approved PaymentProposal and executes the actual bank payments. This aggregate handles idempotency, bank API interaction, confirmation tracking, failure recovery, and GL posting triggers. **This is where money moves.**

#### Aggregate Root

`PaymentBatch` (Prisma model: `ProcurementPaymentBatch`)

#### Lifecycle

```
created ──validate──► validated ──submit──► submitting ──confirm──► confirmed
    │                                                       │
    │                                                       ├──► failed ──retry──► submitting
    │                                                       │              │
    │                                                       │              └──► failed (max retries)
    │                                                       │
    │                                                       └──► partial (some payments confirmed)
    │
    └──► cancelled (before bank submission)
```

#### Owner

| Phase | Role |
|---|---|
| Creation | Automated (from approved proposal) |
| Treasury validation | Treasury Analyst |
| Bank submission | Automated (bank API) |
| Confirmation | Automated (bank webhook) or Treasury Analyst (manual) |
| Failure recovery | Treasury Analyst |
| Cancellation | Treasury Manager |

#### Invariants

| # | Invariant | Enforcement |
|---|---|---|
| PAY-1 | Batch must reference a valid, `approved` PaymentProposal | FK + status check |
| PAY-2 | `executedAmount` = `sumDecimals(paymentItems[].amount)` for confirmed payments | Recalculated |
| PAY-3 | **Idempotency**: Same `idempotencyKey` → return existing result, do not re-execute | Unique constraint + service check |
| PAY-4 | Maximum 3 retry attempts per payment item with exponential backoff (1m, 5m, 30m) | Retry counter |
| PAY-5 | Batch cannot be cancelled after any payment is `confirmed` | State guard |
| PAY-6 | Failed payment items block the batch from `confirmed` status | Status evaluation |
| PAY-7 | `batchNumber` must be unique within `companyId` | DB unique constraint |
| PAY-8 | Payment must use the vendor's preferred payment method unless overridden | Method validation |
| PAY-9 | Dual-signature required for payments $10K-$100K; Treasurer for >$100K | Approval at treasury stage |

#### Payment Items (child entities)

| Field | Type | Description |
|---|---|---|
| `paymentId` | `string` | Unique payment identifier |
| `invoiceId` | `string` | Reference to VendorInvoice |
| `vendorId` | `string` | Denormalized for bank routing |
| `amount` | `Decimal(38, 12)` | Amount to pay |
| `currency` | `string` | Payment currency |
| `method` | `PaymentMethod` | Wire, ACH, check, etc. |
| `bankAccount` | `string` | Vendor bank account (last 4 for display) |
| `bankReference` | `string?` | Bank confirmation reference |
| `status` | enum | `pending`, `processing`, `confirmed`, `failed` |
| `retryCount` | `number` | Number of retry attempts |
| `lastError` | `string?` | Last failure reason |
| `idempotencyKey` | `string` | Unique key for deduplication |

#### State Transitions

| From | To | Trigger | Guard |
|---|---|---|---|
| `created` | `validated` | Treasury validation passes | Cash available, bank details valid |
| `validated` | `submitting` | Bank API submission initiated | All items validated |
| `submitting` | `confirmed` | All bank confirmations received | All items confirmed |
| `submitting` | `partial` | Some but not all confirmations received | At least 1 confirmed |
| `submitting` | `failed` | Bank API rejection | Error logged |
| `failed` | `submitting` | Retry initiated | `retryCount < 3` |
| `partial` | `confirmed` | Remaining confirmations received | All items now confirmed |
| `created` | `cancelled` | Treasury Manager cancels | Before any submission |

#### Relationships

| Target | Type | Field |
|---|---|---|
| `PaymentProposal` | Reference | `proposalId` |
| `VendorInvoice` | Reference (multiple) | `paymentItems[].invoiceId` |
| `Vendor` | Reference (multiple) | `paymentItems[].vendorId` |
| GL Journal Entry | Reference (reverse) | GL posting references batch by `batchId` |

#### Financial Impact

| Field | Type | Calculation |
|---|---|---|
| `totalAmount` | `Decimal(38, 12)` | `sumDecimals(paymentItems[].amount)` |
| `executedAmount` | `Decimal(38, 12)` | `sumDecimals(confirmed paymentItems[].amount)` |
| `failedAmount` | `Decimal(38, 12)` | `sumDecimals(failed paymentItems[].amount)` |
| `paymentItems[].amount` | `Decimal(38, 12)` | Invoice net amount after discounts |

#### Audit Requirements

| Transition | Audit Event |
|---|---|
| Batch created | `recordAudit('payment.batch.created', { batchId, proposalId, paymentCount, totalAmount })` |
| Treasury validated | `recordAudit('payment.batch.validated', { batchId, validatedBy, cashAvailable, bankAccount })` |
| Bank submitted | `recordAudit('payment.batch.submitted', { batchId, submittedAt, bankApi, itemCount })` |
| Payment confirmed | `recordAudit('payment.confirmed', { paymentId, batchId, invoiceId, bankReference, amount })` |
| Payment failed | `recordAudit('payment.failed', { paymentId, batchId, invoiceId, error, retryCount })` |
| Payment retried | `recordAudit('payment.retried', { paymentId, batchId, attempt, nextRetryAt })` |
| Batch confirmed | `recordAudit('payment.batch.confirmed', { batchId, confirmedAt, totalExecuted, confirmationTime })` |
| Batch cancelled | `recordAudit('payment.batch.cancelled', { batchId, cancelledBy, reason })` |

---

### 4.10 VendorCredit

#### Purpose

Credit notes issued by vendors — reduces the amount owed. Credits can be applied to specific invoices or held as open credit for future invoices. This is a **small aggregate** with its own lifecycle because credits have independent creation, application, and expiration events.

#### Aggregate Root

`VendorCredit` (Prisma model: `ProcurementVendorCredit`)

#### Lifecycle

```
issued ──apply──► partially_applied ──apply──► fully_applied
    │                                              │
    └──► expired (credit window passed)             │
                                                   │
    issued ──expire──► expired                     │
    partially_applied ──expire──► expired (remaining amount forfeited)
```

#### Owner

| Phase | Role |
|---|---|
| Creation | AP Clerk (upon receipt of credit note from vendor) |
| Application | AP Manager (applies to specific invoices) |
| Expiration | Automated (daily check) |

#### Invariants

| # | Invariant | Enforcement |
|---|---|---|
| VC-1 | `creditNumber` must be unique within `(companyId, vendorId)` | DB unique constraint |
| VC-2 | `appliedAmount` must never exceed `creditAmount` | Guard on application |
| VC-3 | Credit can only be applied to invoices from the same `vendorId` | Vendor match check |
| VC-4 | Credit application amount must be > 0 | Positive amount validation |
| VC-5 | Applied credit reduces the invoice `totalWithTax` by the credit amount | Application effect |
| VC-6 | Expired credits cannot be applied | State guard |
| VC-7 | `remainingAmount` = `creditAmount - appliedAmount` (derived) | Computed field |

#### State Transitions

| From | To | Trigger | Guard |
|---|---|---|---|
| `issued` | `partially_applied` | Credit applied to invoice (amount < creditAmount) | Credit active, invoice from same vendor |
| `partially_applied` | `fully_applied` | Remaining credit applied (amount = creditAmount) | Same as above |
| `issued` | `expired` | Expiry date passed | No application within window |
| `partially_applied` | `expired` | Expiry date passed | Remaining amount forfeited |

#### Relationships

| Target | Type | Field |
|---|---|---|
| `Vendor` | Reference | `vendorId` |
| `VendorInvoice` | Reference | `appliedToInvoiceId` (which invoice the credit is applied to) |

#### Financial Impact

| Field | Type | Calculation |
|---|---|---|
| `creditAmount` | `Decimal(38, 12)` | Total credit note value (set at creation) |
| `appliedAmount` | `Decimal(38, 12)` | Running total of applications |
| `remainingAmount` | `Decimal(38, 12)` | `creditAmount - appliedAmount` (derived) |
| `currency` | `string` | Credit note currency |

#### Audit Requirements

| Transition | Audit Event |
|---|---|
| Credit created | `recordAudit('credit.created', { creditId, vendorId, creditNumber, amount, currency })` |
| Credit applied | `recordAudit('credit.applied', { creditId, invoiceId, appliedAmount, remainingAmount, appliedBy })` |
| Credit expired | `recordAudit('credit.expired', { creditId, remainingAmount, expiredAt })` |

---

### 4.11 RecurringInvoice (Future)

#### Purpose

Template for automatically generating invoices on a schedule — for subscription vendors, retainer agreements, and regular service charges. This aggregate is **planned for future implementation** and defined here for architectural completeness.

#### Aggregate Root

`RecurringInvoice` (Prisma model: `ProcurementRecurringInvoice`)

#### Lifecycle

```
draft ──activate──► active ──pause──► paused ──resume──► active
    │                                        │
    └──► cancelled                            │
                                              │
active ──generate──► active (invoice created) │
paused ──cancel──► cancelled                  │
active ──expire──► expired                    │
```

#### Invariants

| # | Invariant | Enforcement |
|---|---|---|
| RI-1 | Template must have a valid `vendorId` referencing an active vendor | FK + status check |
| RI-2 | `nextRunDate` must be recalculated after each generation | Date computation |
| RI-3 | Generated invoices inherit template's `vendorId`, `lineItems`, `paymentTerms` | Copy at generation |
| RI-4 | Maximum 12 periods into the future for `endDate` | Schedule validation |
| RI-5 | Template amount changes apply to future invoices only, not past | Effective-date logic |

#### Fields

| Field | Type | Description |
|---|---|---|
| `templateName` | `string` | Human-readable name |
| `vendorId` | `string` | Reference to Vendor |
| `frequency` | `enum` | `weekly`, `biweekly`, `monthly`, `quarterly`, `annual` |
| `dayOfMonth` | `number?` | Day of month for monthly/quarterly |
| `startDate` | `Date` | First generation date |
| `endDate` | `Date?` | Last generation date (null = indefinite) |
| `nextRunDate` | `Date` | Next invoice generation date |
| `totalAmount` | `Decimal(38, 12)` | Amount per generation |
| `lineItems` | `json` | Template line items |
| `status` | `enum` | `draft`, `active`, `paused`, `cancelled`, `expired` |

#### Relationships

| Target | Type | Field |
|---|---|---|
| `Vendor` | Reference | `vendorId` |
| `VendorInvoice` | Reference (reverse) | Generated invoices reference template by `recurringInvoiceId` |

---

## 5. Cross-Aggregate Coordination (Saga Patterns)

Cross-aggregate operations use the **saga pattern** — a sequence of local transactions where each step publishes a domain event that triggers the next step. Compensation actions reverse completed steps on failure.

### 5.1 Invoice-to-Payment Saga

```
Step 1: VendorInvoice.capture()          → invoice.captured event
Step 2: ThreeWayMatch.execute()          → match.executed event
Step 3: InvoiceException.create()        → exception.created event (if match failed)
Step 4: ApprovalChain.create()           → approval.created event (if no exception)
Step 5: ApprovalChain.decide()           → approval.approved event (all levels)
Step 6: PaymentProposal.addInvoice()     → invoice.scheduled event
Step 7: PaymentBatch.execute()           → payment.confirmed event
Step 8: VendorInvoice.post()             → invoice.posted event
Step 9: GLIntegration.postEntries()      → gl.posted event
```

**Compensation chain** (on failure at any step):
```
GL posting failed → reverse journal entries
Payment failed → retry (3x) → notify treasury
Approval rejected → return invoice to exception queue
Match failed → create exception, hold invoice
```

### 5.2 Credit Application Saga

```
Step 1: VendorCredit.create()            → credit.created event
Step 2: VendorCredit.apply(invoiceId)    → credit.applied event
Step 3: VendorInvoice.adjustAmount()     → invoice.adjusted event
Step 4: GLIntegration.postCreditEntry()  → gl.posted event
```

**Compensation**: Reverse credit application, restore invoice amount, reverse GL entry.

### 5.3 Reconciliation Saga

```
Step 1: VendorStatement.upload()         → statement.uploaded event
Step 2: Reconciliation.autoMatch()       → reconciliation.matched event
Step 3: VendorCredit.create()            → credit.created event (for discrepancies)
Step 4: VendorInvoice.dispute()          → invoice.disputed event (for unmatched)
Step 5: Reconciliation.finalize()        → reconciliation.completed event
```

---

## 6. Financial Precision Policy

All monetary values across all AP aggregates follow these rules:

### 6.1 Storage

| Rule | Detail |
|---|---|
| Prisma type | `Decimal @db.Decimal(38, 12)` for all monetary fields |
| Scale | 12 decimal places for calculation, 2 for display |
| Null safety | `@default(0)` on required monetary fields |
| Never native `number` | All financial calculations use `financial-precision.ts` helpers |

### 6.2 Calculation Helpers

| Helper | When to Use |
|---|---|
| `toDecimal(value)` | Converting input to Decimal (API params, form values) |
| `sumDecimals(values)` | Aggregating line items, totals, balances |
| `multiplyDecimals(price, qty)` | Line item total calculation |
| `divideDecimals(a, b)` | Allocation, average, rate calculations |
| `allocateAmount(total, targets)` | Splitting invoice across cost centers |
| `calculateTax(gross, rate)` | Tax calculation with proper rounding |
| `calculateWithholding(gross, rate)` | Withholding tax |
| `financialRound(value, 2)` | Display-only rounding (banker's rounding) |
| `roundDecimal(decimal, 2)` | Rounding Decimal values for storage |
| `decimalEquals(a, b, tolerance)` | Comparison with tolerance |

### 6.3 Aggregation Rules

| Scenario | Rule |
|---|---|
| Invoice total | `sumDecimals(lineItems[].totalPrice)` — never input directly |
| Invoice with tax | `totalAmount + taxAmount` — always computed |
| Payment batch total | `sumDecimals(paymentItems[].confirmedAmounts)` |
| Vendor outstanding | `sumDecimals(invoices WHERE status IN ('approved','scheduled','paid'))` |
| Credit remaining | `creditAmount - appliedAmount` — always computed |

---

## 7. Multi-Tenancy Enforcement

Every entity in every aggregate has a `companyId` field. The enforcement layers are:

| Layer | Mechanism |
|---|---|
| API Route | `requireTenantContext()` extracts `companyId` from JWT/session |
| Service Layer | Every query includes `WHERE companyId = :companyId` |
| Repository Layer | Base repository injects `companyId` filter |
| Aggregate Root | Root validates `companyId` matches all child entities on mutation |
| Audit Events | Every audit event includes `companyId` |
| Saga | Each saga step re-validates `companyId` matches across all referenced entities |

**Cross-tenant access is blocked at every layer.** There is no path for one tenant to read, modify, or reference another tenant's data.

---

## 8. Audit Trail Requirements

### 8.1 Unified Audit Format

Every state transition across all aggregates produces an immutable audit record:

```
AuditEvent {
  id              string (UUID)
  companyId       string
  entityType      string ("VendorInvoice", "ThreeWayMatch", etc.)
  entityId        string (aggregate root ID)
  action          string ("invoice.captured", "match.executed", etc.)
  performedBy     string (user ID or "system")
  timestamp       Date
  details         JSON (action-specific payload)
  ipAddress       string
  userAgent       string
  correlationId   string (ties to originating request)
}
```

### 8.2 Audit Completeness Matrix

| Aggregate | Minimum Audit Events |
|---|---|
| Vendor | 7 (created, approved, rejected, suspended, reactivated, deactivated, bank_updated) |
| VendorInvoice | 13 (captured, validated, matched, exception, override, approval submitted/decided, payment scheduled/confirmed, GL posted, reconciled, disputed, cancelled) |
| ThreeWayMatch | 4 (executed, override, resolved, approved) |
| InvoiceException | 7 (created, assigned, escalated, resolved, verified, voided, reopened) |
| ApprovalChain | 7 (created, level routed, level decided, delegated, escalated, chain approved, chain rejected) |
| PaymentProposal | 6 (generated, submitted, approved, rejected, processed, cancelled) |
| PaymentBatch | 8 (created, validated, submitted, confirmed, failed, retried, batch confirmed, cancelled) |
| VendorCredit | 3 (created, applied, expired) |
| **Total minimum** | **55 audit events across the full AP lifecycle** |

---

## 9. Invariant Summary

| ID | Invariant | Aggregate |
|---|---|---|
| V-1 | Vendor code unique per company | Vendor |
| V-2 | No active vendor with expired documents | Vendor |
| V-3 | Suspended vendors block new POs | Vendor |
| V-4 | Deactivated vendors block new invoices | Vendor |
| V-5 | Bank detail format validation | Vendor |
| V-6 | Credit limit ≥ 0 | Vendor |
| V-7 | High-risk vendors require Controller approval | Vendor |
| V-8 | Duplicate vendor detection (taxId + company) | Vendor |
| INV-1 | Invoice number unique per (company, vendor) | VendorInvoice |
| INV-2 | Total = sum of line items | VendorInvoice |
| INV-3 | TotalWithTax is derived, never set directly | VendorInvoice |
| INV-4 | All line items need account code for matching | VendorInvoice |
| INV-5 | Paid/posted invoices cannot be cancelled | VendorInvoice |
| INV-6 | Due date ≥ invoice date | VendorInvoice |
| INV-7 | Discount date ≤ due date | VendorInvoice |
| INV-8 | Duplicate invoice detection | VendorInvoice |
| INV-9 | Credit limit enforcement | VendorInvoice |
| INV-10 | Cancelled invoices are immutable | VendorInvoice |
| INV-11 | Line total = qty × unitPrice | VendorInvoice |
| INV-12 | Tax header = sum of line tax | VendorInvoice |
| INV-13 | Approval required before payment | VendorInvoice |
| M-1 | Match references one invoice | ThreeWayMatch |
| M-2 | Each line item produces one match line | ThreeWayMatch |
| M-3 | All lines matched → status = matched | ThreeWayMatch |
| M-4 | Any line exception → status = exception | ThreeWayMatch |
| M-5 | Override within max tolerance or Controller | ThreeWayMatch |
| M-6 | Re-match only from validated/exception state | ThreeWayMatch |
| M-7 | Override reason mandatory | ThreeWayMatch |
| M-8 | Quantity variance = invoice - received (3-way) | ThreeWayMatch |
| EX-1 | Exception references valid invoice | InvoiceException |
| EX-2 | SLA deadline mandatory | InvoiceException |
| EX-3 | Resolution action mandatory | InvoiceException |
| EX-4 | Voided exceptions immutable | InvoiceException |
| EX-5 | Type determines valid resolution actions | InvoiceException |
| EX-6 | Deduplication on same type + invoice | InvoiceException |
| EX-7 | Critical auto-escalates | InvoiceException |
| AC-1 | Chain references one invoice | ApprovalChain |
| AC-2 | Levels decided sequentially | ApprovalChain |
| AC-3 | SoD: creator ≠ approver | ApprovalChain |
| AC-4 | No circular delegation | ApprovalChain |
| AC-5 | Levels from approval matrix | ApprovalChain |
| AC-6 | Auto-approvals produce audit record | ApprovalChain |
| AC-7 | SLA deadline mandatory | ApprovalChain |
| PP-1 | ≥ 1 invoice per proposal | PaymentProposal |
| PP-2 | All invoices approved or scheduled | PaymentProposal |
| PP-3 | Total = sum of items | PaymentProposal |
| PP-4 | No invoice in two approved proposals | PaymentProposal |
| PP-5 | Payment date ≥ today | PaymentProposal |
| PP-6 | Discount invoices prioritized | PaymentProposal |
| PP-7 | Treasury cash balance warning | PaymentProposal |
| PAY-1 | References approved proposal | PaymentBatch |
| PAY-2 | Executed = sum of confirmed items | PaymentBatch |
| PAY-3 | Idempotency key enforced | PaymentBatch |
| PAY-4 | Max 3 retries | PaymentBatch |
| PAY-5 | Cannot cancel after confirmation | PaymentBatch |
| PAY-6 | Failed items block batch confirmation | PaymentBatch |
| PAY-7 | Batch number unique per company | PaymentBatch |
| PAY-8 | Vendor payment method preference | PaymentBatch |
| PAY-9 | Dual-signature thresholds | PaymentBatch |
| VC-1 | Credit number unique per (company, vendor) | VendorCredit |
| VC-2 | Applied ≤ credit amount | VendorCredit |
| VC-3 | Same vendor for credit and invoice | VendorCredit |
| VC-4 | Application amount > 0 | VendorCredit |
| VC-5 | Applied credit reduces invoice total | VendorCredit |
| VC-6 | Expired credits cannot apply | VendorCredit |
| VC-7 | Remaining = credit - applied | VendorCredit |

---

## 10. Design Decisions

| # | Decision | Rationale |
|---|---|---|
| D-1 | **VendorInvoice is the central aggregate** | Every AP operation originates from or terminates at an invoice. Matching, approval, payment, GL posting — all revolve around the invoice lifecycle. Making it the center simplifies the mental model. |
| D-2 | **PO and GRN are references, not aggregates** | The PO aggregate belongs to the procurement bounded context. AP only needs to read PO data for matching. Embedding PO as a value object reference (not a full aggregate) maintains bounded context boundaries. |
| D-3 | **ThreeWayMatch is a separate aggregate** | Match results are independently auditable, re-runnable, and overrideable. Coupling match state to invoice state would create complex bi-directional dependencies. Separation allows: (a) late GRN arrival triggers re-match without touching invoice, (b) override has its own approval trail, (c) match exceptions are independently managed. |
| D-4 | **ApprovalChain is a separate aggregate** | Approval workflows are reusable across invoice types (standard, credit note, debit note). Separation allows: (a) different approval chains for different invoice types, (b) delegation/escalation lifecycle independent of invoice, (c) SoD validation at the chain level, (d) future reuse for PO approval without code changes. |
| D-5 | **PaymentProposal vs PaymentBatch** | Proposal is **planning** (what to pay, when, optimizing discounts). Batch is **execution** (bank API calls, confirmations, retries). Separation allows: (a) proposals can be reviewed/modified before execution, (b) execution has idempotency and retry logic, (c) treasury validation happens between proposal approval and batch execution, (d) multiple batches can be created from one proposal (split payments). |
| D-6 | **VendorCredit is a small aggregate** | Credits have their own creation, application, and expiration lifecycle. Making it a full aggregate (not a value object on Vendor) allows: (a) credits to be applied across multiple invoices, (b) credit application to produce its own audit trail, (c) expired credit handling to be independently managed, (d) future credit note import from vendor portals. |
| D-7 | **RecurringInvoice is future** | Defined for architectural completeness but not implemented in Phase 21. Allows future subscription/retainer automation without restructuring existing aggregates. |

---

*End of Phase 21A.0 — Accounts Payable Aggregate Root Design*
