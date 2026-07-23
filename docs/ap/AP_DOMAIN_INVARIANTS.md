# Phase 21A.0 — Accounts Payable Domain Invariants

> **Status**: Complete
> **Type**: Documentation-only — architecture specification
> **Date**: July 21, 2026
> **Scope**: Every enforceable business rule in the AP procure-to-pay domain
> **Depends on**: AP_STATE_MACHINES.md, AP_AGGREGATES.md, AP_DOMAIN_MODEL.md, FINANCIAL_PRECISION_POLICY.md

---

## Overview

Domain invariants are propositions that **must always be true** in the Accounts Payable domain. Every operation — creation, mutation, transition, query — must not produce a state that violates any invariant listed here. When an invariant is violated, the operation is **rejected**, the violation is **logged**, and the user is **notified** with a clear explanation. Invariants are never silently bypassed.

### Design Principles

1. **Invariants are permanent** — they represent business truths that outlive any implementation. Code changes, UI changes, and infrastructure changes do not alter invariants.
2. **Invariants are absolute** — there is no "good enough." A match variance of $0.01 over tolerance violates INV-F011 just as much as a variance of $1,000,000.
3. **Every invariant has an enforcement point** — an invariant without enforcement is a suggestion, not a rule. Each invariant identifies exactly where it is checked.
4. **Violations are never silent** — every violation produces a user-visible error, an audit record, and a rejection of the operation.

### Conventions

| Symbol | Meaning |
|---|---|
| `INV-F001` | Financial invariant (F = Financial) |
| `INV-S001` | State transition invariant (S = State) |
| `INV-A001` | Authorization invariant (A = Authorization) |
| `INV-T001` | Temporal invariant (T = Temporal) |
| `INV-D001` | Data integrity invariant (D = Data) |
| `INV-AU001` | Audit invariant (AU = Audit) |
| `INV-M001` | Multi-tenancy invariant (M = Multi-tenant) |
| `INV-P001` | Process invariant (P = Process) |

### Severity Levels

| Severity | Definition | Response |
|---|---|---|
| **Critical** | Violation causes financial loss, data corruption, or security breach | Reject operation, alert Controller/CFO, incident report |
| **High** | Violation produces incorrect financial state or audit gap | Reject operation, alert AP Manager, incident logged |
| **Medium** | Violation produces incorrect data or workflow blockage | Reject operation, notify user, error logged |
| **Low** | Violation produces inconsistency that is correctable | Reject operation, suggest correction |
| **Info** | Violation produces cosmetic or advisory issue | Warn user, allow operation with notation |

---

## Part 1 — Financial Invariants

Financial invariants govern monetary values, calculations, and financial correctness. They are enforced using `Prisma.Decimal(38, 12)` arithmetic exclusively — native `number` is prohibited for any monetary calculation.

| ID | Rule | Severity | Enforcement |
|---|---|---|---|
| INV-F001 | All monetary amounts must be stored as `Decimal(38, 12)` in the database | Critical | Prisma schema `@db.Decimal(38, 12)` constraint |
| INV-F002 | All monetary calculations must use `Prisma.Decimal` arithmetic or `financial-precision.ts` helpers — native `number` arithmetic is prohibited | Critical | ESLint rule, code review, service layer guard |
| INV-F003 | `Invoice.totalAmount` must equal `sumDecimals(lineItems[].totalPrice)` — the total is never trusted from input | Critical | Aggregate root recalculation on every mutation |
| INV-F004 | `Invoice.taxAmount` must equal `sumDecimals(taxDetails[].amount)` — tax header must match tax line items | Critical | Aggregate root recalculation on every mutation |
| INV-F005 | `Invoice.totalWithTax` must equal `totalAmount + taxAmount` — this is a derived field, never set directly | Critical | Computed field, no setter |
| INV-F006 | Every `lineItem[].totalPrice` must equal `multiplyDecimals(quantity, unitPrice)` — line totals are recalculated, never trusted | Critical | Aggregate root recalculation on every mutation |
| INV-F007 | Every `lineItem[].taxAmount` must equal `multiplyDecimals(totalPrice, taxRate / 100)` — tax per line is recalculated | Critical | Aggregate root recalculation on every mutation |
| INV-F008 | `Payment.amount` must not exceed the invoice outstanding balance (`totalWithTax - sumDecimals(payments[].amount) - sumCredits`) | Critical | Payment creation guard |
| INV-F009 | `Payment.amount` must be greater than zero — zero or negative payments are prohibited | High | Payment creation guard |
| INV-F010 | `PaymentProposal.totalAmount` must equal `sumDecimals(proposalItems[].amount)` | High | Aggregate root recalculation |
| INV-F011 | `PaymentBatch.executedAmount` must equal `sumDecimals(confirmed paymentItems[].amount)` | High | Aggregate root recalculation |
| INV-F012 | GL journal entries must balance: `sumDecimals(debits[]) == sumDecimals(credits[])` for every posting — tolerance = 0.00 | Critical | GL posting guard |
| INV-F013 | The sum of allocated amounts must equal the source amount — residual is absorbed by the last allocation target | High | `allocateAmount()` residual handling |
| INV-F014 | `VendorCredit.appliedAmount` must never exceed `VendorCredit.creditAmount` — credit application guard | High | Application guard, Decimal comparison |
| INV-F015 | `VendorCredit.remainingAmount` must equal `creditAmount - appliedAmount` — derived field | Medium | Computed field |
| INV-F016 | `DiscountAmount` must not exceed `Invoice.totalWithTax` — discounts cannot exceed the invoice | High | Discount calculation guard |
| INV-F017 | If `discountPercent` is set, `discountAmount` must equal `totalWithTax * discountPercent / 100` | Medium | Calculation guard |
| INV-F018 | Exchange rates must be positive — zero or negative exchange rates are prohibited | Critical | Input validation at API boundary |
| INV-F019 | When converting currency, the converted amount must be `amount * exchangeRate` — no hardcoded rates | High | Service layer calculation |
| INV-F020 | Display rounding must use banker's rounding (`half-even`) via `Intl.NumberFormat` — `Math.round()` and `toFixed()` are prohibited for financial display | Medium | `financialRound()` helper enforcement |
| INV-F021 | No intermediate rounding during calculations — rounding occurs only at the final display boundary | Medium | Calculation pipeline review |
| INV-F022 | `Vendor.totalSpend` must equal `sumDecimals(all related POs amounts)` | Medium | Periodic aggregation check |
| INV-F023 | `Vendor.creditLimit` must be ≥ 0 — negative credit limits are prohibited | High | Input validation |
| INV-F024 | Invoice line item `unitPrice` must be ≥ 0 — negative prices are prohibited (credits use credit notes, not negative invoices) | High | Line item creation guard |
| INV-F025 | `ProposalItem.netAmount` must equal `amount - discountAmount` | Medium | Derived field |
| INV-F026 | `ProposalItem.amount` must be > 0 — zero-amount line items are prohibited | Medium | Proposal item guard |
| INV-F027 | Payment reversal must create an offsetting GL entry with equal and opposite amounts — the reversal entry must balance to 0.00 | Critical | GL posting guard |

---

## Part 2 — State Transition Invariants

State transition invariants govern valid state changes for every entity. Each entity has a defined state machine (see `AP_STATE_MACHINES.md`). Any transition not defined in the state machine is rejected.

| ID | Rule | Severity | Enforcement |
|---|---|---|---|
| INV-S001 | An invoice cannot proceed to `matched` if any line item is missing an `accountCode` — GL coding is required before matching | High | Validation gate before match initiation |
| INV-S002 | An invoice cannot transition to `approved` without a complete approval chain — all required levels must have decided `approved` | Critical | Approval chain completeness check |
| INV-S003 | An invoice cannot transition to `scheduled` (payment) without being in `approved` state — unapproved invoices cannot be paid | Critical | Payment scheduling guard |
| INV-S004 | An invoice in `paid` or `closed` state cannot be edited — the invoice is financially committed | Critical | State guard on all mutations |
| INV-S005 | An invoice in `closed` or `voided` state is immutable — no state transition is possible | Critical | Terminal state guard |
| INV-S006 | A match cannot be performed on an invoice that is not in `validated` or `exception` state — matching requires validated data | High | Match initiation guard |
| INV-S007 | An exception must be resolved (status = `resolved`) before the invoice can proceed to `matched` or `approved` — open exceptions block progression | High | Invoice state evaluation |
| INV-S008 | A payment cannot be scheduled for an invoice that has open (unresolved) exceptions | High | Payment scheduling guard |
| INV-S009 | An invoice cannot transition to `paid` without a confirmed bank reference — bank confirmation is required before marking paid | Critical | Payment confirmation guard |
| INV-S010 | An invoice in `voided` state cannot be un-voided — voiding is permanent | Critical | State machine definition (no outgoing transitions from `voided`) |
| INV-S011 | A vendor in `deactivated` state cannot receive new invoices — deactivated vendors are financially inert | High | Invoice creation guard |
| INV-S012 | A vendor in `suspended` state cannot be referenced in new purchase orders — suspended vendors are blocked from new commitments | High | PO creation guard |
| INV-S013 | A payment cannot transition to `confirmed` without a successful GL posting — payment and GL posting are coupled | Critical | Payment confirmation guard |
| INV-S014 | An invoice can only transition to `voided` from `approved`, `scheduled`, `disputed`, or `blocked` states — invoices already paid cannot be voided (use reversal instead) | Critical | Void transition guard |
| INV-S015 | A vendor credit in `expired` or `fully_applied` state cannot be applied to any invoice | High | Credit application guard |
| INV-S016 | An approval chain can only be `cancelled` if the linked invoice is in `cancelled` or `voided` state — approval cancellation follows invoice cancellation | High | Approval cancellation guard |
| INV-S017 | A payment proposal cannot transition from `approved` to `rejected` — approved proposals are committed | Medium | Proposal state guard |
| INV-S018 | A payment batch cannot transition to `cancelled` after any payment item has `confirmed` status — confirmed payments cannot be undone via cancellation | Critical | Batch cancellation guard |
| INV-S019 | An invoice dispute can only be created from `validated`, `matched`, or `exception` states — disputes apply to invoices in active processing | Medium | Dispute creation guard |
| INV-S020 | A vendor can only be deactivated by a Controller — AP Manager can suspend but not deactivate | High | Authorization check on deactivation |
| INV-S021 | A vendor in `pending_review` state cannot be suspended — vendors must be approved or rejected first | Medium | Suspension guard |
| INV-S022 | An invoice can only move from `received` to `blocked` if explicitly blocked by AP Manager or Controller — automatic blocking requires a blocking reason | Medium | Block action guard |
| INV-S023 | A reconciliation statement can only be finalized if all discrepancies have been resolved — no open discrepancies permitted at finalization | High | Reconciliation finalization guard |
| INV-S024 | A vendor performance record is immutable after creation — no updates permitted | Medium | No update methods on performance repository |
| INV-S025 | A purchase request in `converted_to_po` state cannot be re-submitted — the PR's lifecycle is complete | Medium | PR state guard |

---

## Part 3 — Authorization Invariants

Authorization invariants govern who can perform which actions, segregation of duties (SoD), and threshold-based approval routing.

| ID | Rule | Severity | Enforcement |
|---|---|---|---|
| INV-A001 | The user who created a purchase order cannot approve an invoice against that same PO — segregation of duties between requester and approver | Critical | SoD check at approval chain routing |
| INV-A002 | The user who captured an invoice cannot approve that same invoice — segregation of duties between capturer and approver | Critical | SoD check at approval chain routing |
| INV-A003 | The user who created a payment proposal cannot execute the payment batch — segregation of duties between proposal creator and payment executor | Critical | SoD check at batch execution |
| INV-A004 | An invoice exceeding $50,000 requires at minimum Controller-level approval — threshold-based routing | Critical | Approval matrix evaluation |
| INV-A005 | An invoice exceeding $100,000 requires at minimum CFO-level approval + Treasury Manager dual signature | Critical | Approval matrix evaluation |
| INV-A006 | A payment reversal requires Controller approval — financial reversals are high-severity | Critical | Reversal authorization check |
| INV-A007 | A payment reversal exceeding $50,000 requires Controller + CFO approval | Critical | Reversal authorization check |
| INV-A008 | Each approval level requires a different individual than the previous level — no single person can approve at multiple levels of the same chain | High | Approval chain routing validation |
| INV-A009 | Vendor deactivation requires Controller approval — permanent vendor changes require elevated authority | High | Vendor state transition guard |
| INV-A010 | Vendor bank detail changes require re-verification before use in payment — unverified bank details cannot be used | Critical | Payment execution guard |
| INV-A011 | A match override exceeding $500 variance requires Controller approval | High | Override authorization check |
| INV-A012 | An exception with `critical` severity auto-escalates to AP Manager immediately — AP Clerk cannot resolve critical exceptions without escalation | High | Exception creation escalation rule |
| INV-A013 | An exception exceeding $5,000 variance requires Controller-level resolution — AP Manager authority is insufficient | High | Exception resolution guard |
| INV-A014 | Voiding an invoice requires Controller approval — voiding is an irrevocable action | Critical | Void action guard |
| INV-A015 | Auto-approved invoices (below threshold, trusted vendor, matched) still produce an immutable approval record with `isAutomated = true` — audit trail for all approvals | High | Auto-approval audit rule |
| INV-A016 | Delegation must not create circular chains (A delegates to B, B to C, C to A) — delegation cycle detection | High | Delegation guard with graph cycle detection |
| INV-A017 | Delegation authority must not exceed the original approver's `authorityLimit` — delegated approvals respect the original limit | High | Delegation guard |
| INV-A018 | No role can modify, update, or delete audit records — audit records are read-only for all roles | Critical | Repository enforces no UPDATE/DELETE |
| INV-A019 | Voided invoices cannot be un-voided by any role — voiding is a permanent, irreversible state change | Critical | State machine (no outgoing transitions) |
| INV-A020 | Treasury Analyst can execute payments up to $10K; Treasury Manager up to $100K; CFO for >$100K | Critical | Payment execution authorization |
| INV-A021 | Reconciliation adjustments exceeding $500 require Controller approval with documented root cause | High | Reconciliation adjustment guard |

---

## Part 4 — Temporal Invariants

Temporal invariants govern date relationships, timing constraints, and SLA deadlines.

| ID | Rule | Severity | Enforcement |
|---|---|---|---|
| INV-T001 | `Invoice.dueDate` must be ≥ `Invoice.invoiceDate` — the due date cannot precede the invoice date | High | Cross-field validation at creation |
| INV-T002 | If `Invoice.discountDate` is set, it must be ≤ `Invoice.dueDate` — discount windows end before payment is due | High | Cross-field validation |
| INV-T003 | `Invoice.invoiceDate` must not be more than 90 days in the past — invoices older than 90 days require Controller override | Medium | Date validation at capture |
| INV-T004 | `Invoice.invoiceDate` must not be in the future — backdating invoices is prohibited | High | Date validation at capture |
| INV-T005 | Payment cannot be scheduled before the invoice approval date — payments require prior approval | Critical | Scheduling guard |
| INV-T006 | Every exception must have an `slaDeadline` set at creation — exceptions without deadlines are lost | High | Exception creation validation |
| INV-T007 | Audit timestamps are immutable after creation — the `createdAt` field on audit records is never updated | Critical | Prisma model (no updatedAt on audit) |
| INV-T008 | `VendorCredit.expiryDate`, if set, must be ≥ `VendorCredit.creditDate` — expiration cannot precede issuance | Medium | Cross-field validation |
| INV-T009 | `PaymentProposal.proposedPaymentDate` must be ≥ today — proposals cannot schedule payments in the past | High | Proposal creation validation |
| INV-T010 | Reconciliation must be initiated within 90 days of the vendor statement date — stale statements are flagged | Medium | Reconciliation creation validation |
| INV-T011 | `Vendor.onboardingDate` must be ≤ the date any PO or invoice is created against that vendor — vendors cannot be backdated | Medium | PO/invoice creation guard |
| INV-T012 | SLA escalation deadlines must be set on every approval level at the time the level is routed — no approval level may lack a deadline | High | Approval chain routing guard |

---

## Part 5 — Data Integrity Invariants

Data integrity invariants govern entity uniqueness, referential integrity, and cross-entity consistency.

| ID | Rule | Severity | Enforcement |
|---|---|---|---|
| INV-D001 | Every entity must have a `companyId` field — multi-tenant isolation is mandatory on every record | Critical | Prisma schema, service layer, repository |
| INV-D002 | `Invoice.invoiceNumber` must be unique within `(companyId, vendorId)` — the same vendor cannot have two invoices with the same number | Critical | DB unique constraint `(companyId, vendorId, invoiceNumber)` |
| INV-D003 | `Payment.idempotencyKey` must be unique globally — duplicate payment execution is prevented | Critical | DB unique constraint + service guard |
| INV-D004 | `Vendor.vendorCode` must be unique within `companyId` | Critical | DB unique constraint `(companyId, vendorCode)` |
| INV-D005 | `Vendor.taxId` must be unique within `companyId` — duplicate vendor detection | Critical | DB unique constraint `(companyId, taxId)` |
| INV-D006 | A vendor must be in `ACTIVE` state to receive new invoices or POs — inactive vendors are financially inert | High | Service layer guard at creation |
| INV-D007 | A PO referenced by an invoice must exist in the same `companyId` — cross-tenant PO references are prohibited | Critical | FK constraint + tenant check |
| INV-D008 | A GRN referenced by an invoice must exist in the same `companyId` — cross-tenant GRN references are prohibited | Critical | FK constraint + tenant check |
| INV-D009 | A GL account referenced in line items must exist in the chart of accounts for the same `companyId` | Critical | FK constraint + tenant check |
| INV-D010 | `PaymentBatch.batchNumber` must be unique within `companyId` | High | DB unique constraint `(companyId, batchNumber)` |
| INV-D011 | `VendorCredit.creditNumber` must be unique within `(companyId, vendorId)` | High | DB unique constraint `(companyId, vendorId, creditNumber)` |
| INV-D012 | An invoice must reference an existing `Vendor` in the same `companyId` | Critical | FK constraint |
| INV-D013 | A `PaymentProposal` must contain ≥ 1 invoice — empty proposals are prohibited | Medium | Generation guard |
| INV-D014 | No invoice may appear in more than one `approved` proposal simultaneously — double-payment prevention | Critical | Deduplication check at proposal approval |
| INV-D015 | `PaymentProposal.proposalNumber` must be unique within `companyId` | High | DB unique constraint `(companyId, proposalNumber)` |
| INV-D016 | A `VendorBankDetail` must reference an existing `Vendor` in the same `companyId` | Critical | FK constraint |
| INV-D017 | Exactly one `VendorBankDetail` per vendor must have `isPrimary = true` | Medium | Application logic guard |
| INV-D018 | `VendorPerformance` records are unique within `(companyId, vendorId, period)` — one evaluation per vendor per period | Medium | DB unique constraint |
| INV-D019 | A `ProcurementGRN` referenced for matching must be linked to the same PO as the invoice — GRN/PO cross-reference validation | High | Three-way match validation |
| INV-D020 | `Payment.idempotencyKey` must be generated before payment execution and stored persistently — keys are never regenerated | Critical | Payment creation guard |

---

## Part 6 — Audit Invariants

Audit invariants ensure the integrity, completeness, and immutability of the audit trail. The audit trail is the forensic backbone of the AP domain.

| ID | Rule | Severity | Enforcement |
|---|---|---|---|
| INV-AU001 | Every state transition on every entity must produce an audit record — no transition is permitted without an audit entry | Critical | Service layer writes audit in the same DB transaction as state change |
| INV-AU002 | Audit records are append-only — no UPDATE or DELETE operation is permitted on audit records | Critical | Repository exposes no update/delete methods; Prisma model has no `updatedAt` |
| INV-AU003 | Every audit record must include: `actorId` (who), `action` (what), `createdAt` (when), `ipAddress` (where), and `details` (why) | High | Audit creation function enforces required fields |
| INV-AU004 | Financial amounts in audit records must match the entity amounts at the time of the event — audit snapshots capture the financial state | High | Audit creation captures entity values at event time |
| INV-AU005 | Approval decisions must include the reason for rejection in the audit `details` — rejected approvals without a reason are blocked | High | Approval rejection guard |
| INV-AU006 | Audit records must include `companyId` — audit records are scoped to the tenant | Critical | Audit creation function enforces tenant context |
| INV-AU007 | System-triggered actions (auto-validation, auto-matching, auto-escalation) must set `actorId = "system"` and include the triggering context | Medium | System audit helper function |
| INV-AU008 | Audit records must not contain sensitive data (passwords, full bank account numbers, API keys, tokens) — sensitive fields are redacted | Critical | Audit creation function with redaction list |
| INV-AU009 | Each audit record must have a unique `id` (UUID/CUID) | Critical | Prisma `@id @default(cuid())` |
| INV-AU010 | Audit records must be created in the same DB transaction as the state change they document — audit and state must be atomically consistent | Critical | Transaction boundary enforcement |
| INV-AU011 | The complete audit chain for any entity must be reconstructable by querying all audit records for that `entityId`, ordered by `createdAt` — no gaps allowed | High | Audit completeness verification |

---

## Part 7 — Multi-Tenancy Invariants

Multi-tenancy invariants ensure complete data isolation between companies. A cross-tenant data leak is a security incident.

| ID | Rule | Severity | Enforcement |
|---|---|---|---|
| INV-M001 | Every query and mutation must include a `companyId` filter — no entity is accessible without tenant scoping | Critical | Repository base class, service layer, API boundary |
| INV-M002 | Cross-tenant data access is a security incident — any attempt to read or modify another tenant's data must be blocked and alerted | Critical | Repository tenant guard, audit alert |
| INV-M003 | Vendor data (including bank details, performance records, documents) is fully isolated per `companyId` — no vendor data is shared across tenants | Critical | Composite unique constraints include `companyId` |
| INV-M004 | Invoice numbers are unique per `(companyId, vendorId)`, not globally — different companies may use the same invoice number for different vendors | High | DB unique constraint design |
| INV-M005 | GL account references must resolve to accounts in the same tenant's chart of accounts — cross-tenant GL access is prohibited | Critical | FK constraint + tenant check |
| INV-M006 | Payment batches and proposals are scoped to a single tenant — cross-tenant payment execution is prohibited | Critical | Tenant guard on batch/proposal creation |
| INV-M007 | Approval chains, exception records, and audit records are all scoped to `companyId` — no entity escapes tenant isolation | Critical | Prisma schema `companyId` on all models |
| INV-M008 | Saga steps (invoice-to-payment, credit application, reconciliation) must re-validate `companyId` matches across all referenced entities at each step | Critical | Saga step tenant validation |

---

## Part 8 — Process Invariants

Process invariants govern the completion requirements of the end-to-end AP workflow and ensure no stage is skipped.

| ID | Rule | Severity | Enforcement |
|---|---|---|---|
| INV-P001 | Every invoice must complete the full lifecycle in order: capture → validate → match → approve → pay → post → reconcile — stages cannot be skipped | Critical | State machine progression enforcement |
| INV-P002 | Every exception must be resolved before the invoice can be approved — open exceptions block progression | High | Invoice state evaluation at approval gate |
| INV-P003 | Every payment must originate from an approved payment proposal — ad hoc payments outside the proposal workflow are prohibited | Critical | Payment creation guard |
| INV-P004 | GL posting must occur for every confirmed payment — every payment must produce a journal entry | Critical | GL integration guard on payment confirmation |
| INV-P005 | Vendor statement reconciliation must be initiated within 90 days of the statement date — stale statements are flagged for Controller attention | Medium | Reconciliation scheduling guard |
| INV-P006 | Every invoice must have at least one line item — zero-line invoices are prohibited | High | Invoice creation guard |
| INV-P007 | Every invoice line item must have a `quantity` > 0 and `unitPrice` ≥ 0 — zero-quantity or negative-price line items are prohibited | High | Line item validation guard |
| INV-P008 | Three-way matching requires both PO and GRN references — two-way match is only permitted for service-type invoices without physical goods | High | Match type evaluation |
| INV-P009 | Payment proposals must prioritize discount-eligible invoices within 5 days of the discount window closing — early-pay savings are not ignored | Medium | Proposal generation algorithm |
| INV-P010 | A vendor statement reconciliation cannot be finalized if there is any variance between the vendor statement and the AP ledger — zero variance is required | High | Reconciliation finalization guard |
| INV-P011 | Every payment reversal must produce an offsetting GL entry — reversals are recorded, not erased | Critical | Reversal posting guard |
| INV-P012 | An invoice cannot be closed (terminal state) until GL posting is confirmed — payment alone is insufficient | Critical | Invoice close guard |
| INV-P013 | Vendor credits are applied to invoices only from the same vendor — cross-vendor credit application is prohibited | High | Credit application guard |

---

## Part 9 — Invariant Enforcement Architecture

Every invariant is enforced at one or more layers of the system. The enforcement architecture follows a defense-in-depth model: if one layer fails, the next layer catches the violation.

### Enforcement Layers

| Layer | Role | What It Enforces | Examples |
|---|---|---|---|
| **API Boundary** | First line of defense — rejects invalid input before it reaches business logic | Input format, required fields, type constraints, range validation | Zod schemas validate invoice number format, amount > 0, date format |
| **Service Layer** | Business rule enforcement — evaluates invariants against the full entity context | State transitions, SoD checks, threshold routing, duplicate detection | `InvoiceService.approve()` checks approval chain completeness |
| **Aggregate Root** | Invariant recalculation — ensures derived values are correct regardless of input | Financial totals, derived fields, line item consistency | `VendorInvoice.save()` recalculates `totalAmount`, `taxAmount`, `totalWithTax` |
| **Repository Layer** | Persistence guard — enforces unique constraints, foreign keys, tenant isolation | DB constraints, `companyId` injection, uniqueness | Base repository injects `WHERE companyId = :companyId` on all queries |
| **Database** | Last resort — physical constraints that prevent data corruption | Unique indexes, foreign key constraints, NOT NULL, Decimal precision | `UNIQUE (companyId, vendorId, invoiceNumber)` prevents duplicate invoices |

### Per-Category Enforcement Map

| Category | API Boundary | Service Layer | Aggregate Root | Repository | Database |
|---|---|---|---|---|---|
| Financial | Amount > 0, format | Totals validation, SoD | Recalculation on save | — | Decimal(38,12) |
| State Transition | — | State machine guard | — | — | — |
| Authorization | Role check | SoD, threshold routing | — | — | — |
| Temporal | Date format | Cross-field date checks | — | — | — |
| Data Integrity | Required fields, format | Uniqueness, reference checks | — | `companyId` injection | Unique constraints, FK |
| Audit | — | Audit creation in transaction | — | No UPDATE/DELETE | append-only model |
| Multi-Tenant | JWT/session extraction | `companyId` filter | Root validates child `companyId` | Base filter | Composite indexes |
| Process | Required fields | Lifecycle order, completion | — | — | — |

---

## Part 10 — Invariant Violation Handling

When an invariant is violated, the system responds according to the violation severity.

### Response Protocol

| Step | Action | Critical/High | Medium/Low |
|---|---|---|---|
| 1 | **Reject** | Operation is rejected — no partial state change | Operation is rejected |
| 2 | **Error Message** | Human-readable explanation of which invariant was violated and why | Human-readable explanation |
| 3 | **Audit Record** | Violation logged as an audit event with full context (user, entity, attempted operation, invariant ID) | Violation logged |
| 4 | **Notification** | Controller/CFO notified for Critical; AP Manager notified for High | User notified |
| 5 | **Incident Report** | Security incident created for Critical violations (tenant breach, financial loss attempt) | — |

### Violation Error Format

```json
{
  "error": {
    "code": "INVARIANT_VIOLATION",
    "invariant": "INV-F008",
    "severity": "Critical",
    "message": "Payment amount ($125,000.00) exceeds invoice outstanding balance ($100,000.00). INV-F008: Payment amount must not exceed invoice outstanding balance.",
    "entity": {
      "type": "VendorInvoice",
      "id": "clx9abc..."
    },
    "context": {
      "paymentAmount": 125000.00,
      "outstandingBalance": 100000.00,
      "currency": "USD"
    }
  }
}
```

### Auto-Fixable Violations

Some violations are auto-correctable — the system suggests or applies a correction:

| Invariant | Auto-Fix | Applied When |
|---|---|---|
| INV-F003 | Recalculate `totalAmount` from line items | Line items are added/removed/modified |
| INV-F004 | Recalculate `taxAmount` from tax details | Tax details are added/removed/modified |
| INV-F005 | Recalculate `totalWithTax` | Any financial field changes |
| INV-F006 | Recalculate `lineItem.totalPrice` | Quantity or unit price changes |
| INV-F013 | Absorb residual in last allocation target | Allocation is computed |
| INV-T006 | Auto-set `slaDeadline` on exception creation | Exception is created |
| INV-T012 | Auto-set `slaDeadline` on approval level routing | Level is routed |

---

## Part 11 — Complete Invariant Table

Master table of all 113 invariants across all categories.

### Financial Invariants

| ID | Category | Rule | Severity | Enforcement | Auto-fixable |
|---|---|---|---|---|---|
| INV-F001 | Financial | All monetary amounts stored as `Decimal(38, 12)` | Critical | Prisma schema | No |
| INV-F002 | Financial | All monetary calculations use Decimal arithmetic, never native `number` | Critical | ESLint, service guard | No |
| INV-F003 | Financial | Invoice total = sum of line item totals | Critical | Aggregate root recalc | Yes |
| INV-F004 | Financial | Invoice tax = sum of tax detail amounts | Critical | Aggregate root recalc | Yes |
| INV-F005 | Financial | Invoice totalWithTax = totalAmount + taxAmount | Critical | Derived field | Yes |
| INV-F006 | Financial | Line item total = quantity × unitPrice | Critical | Aggregate root recalc | Yes |
| INV-F007 | Financial | Line item tax = totalPrice × taxRate / 100 | Critical | Aggregate root recalc | Yes |
| INV-F008 | Financial | Payment amount ≤ invoice outstanding balance | Critical | Payment creation guard | No |
| INV-F009 | Financial | Payment amount > 0 | High | Payment creation guard | No |
| INV-F010 | Financial | Proposal total = sum of proposal item amounts | High | Aggregate root recalc | Yes |
| INV-F011 | Financial | Batch executedAmount = sum of confirmed item amounts | High | Aggregate root recalc | Yes |
| INV-F012 | Financial | GL debits = GL credits for every posting (tolerance = 0.00) | Critical | GL posting guard | No |
| INV-F013 | Financial | Sum of allocations = source amount (residual to last target) | High | Allocation helper | Yes |
| INV-F014 | Financial | Credit appliedAmount ≤ creditAmount | High | Application guard | No |
| INV-F015 | Financial | Credit remaining = creditAmount - appliedAmount | Medium | Derived field | Yes |
| INV-F016 | Financial | Discount ≤ invoice totalWithTax | High | Discount guard | No |
| INV-F017 | Financial | DiscountAmount = totalWithTax × discountPercent / 100 | Medium | Calculation guard | Yes |
| INV-F018 | Financial | Exchange rate > 0 | Critical | Input validation | No |
| INV-F019 | Financial | Converted amount = amount × exchangeRate | High | Service calculation | No |
| INV-F020 | Financial | Display rounding uses banker's rounding via Intl.NumberFormat | Medium | financialRound() | No |
| INV-F021 | Financial | No intermediate rounding — rounding at display boundary only | Medium | Calculation review | No |
| INV-F022 | Financial | Vendor totalSpend = sum of all PO amounts | Medium | Periodic check | No |
| INV-F023 | Financial | Vendor creditLimit ≥ 0 | High | Input validation | No |
| INV-F024 | Financial | Line item unitPrice ≥ 0 | High | Line item guard | No |
| INV-F025 | Financial | Proposal item netAmount = amount - discountAmount | Medium | Derived field | Yes |
| INV-F026 | Financial | Proposal item amount > 0 | Medium | Proposal guard | No |
| INV-F027 | Financial | Payment reversal produces offsetting GL entry | Critical | GL posting guard | No |

### State Transition Invariants

| ID | Category | Rule | Severity | Enforcement | Auto-fixable |
|---|---|---|---|---|---|
| INV-S001 | State | Invoice requires accountCode on all line items before matching | High | Validation gate | No |
| INV-S002 | State | Invoice requires complete approval chain before approved | Critical | Approval completeness check | No |
| INV-S003 | State | Invoice must be approved before payment scheduling | Critical | Scheduling guard | No |
| INV-S004 | State | Paid/posted invoices cannot be edited | Critical | State guard | No |
| INV-S005 | State | Closed/voided invoices are immutable | Critical | Terminal state guard | No |
| INV-S006 | State | Match requires invoice in validated/exception state | High | Match guard | No |
| INV-S007 | State | All exceptions resolved before invoice proceeds | High | State evaluation | No |
| INV-S008 | State | No open exceptions for payment scheduling | High | Scheduling guard | No |
| INV-S009 | State | Payment requires bank reference before marking paid | Critical | Confirmation guard | No |
| INV-S010 | State | Voided invoices cannot be un-voided | Critical | State machine | No |
| INV-S011 | State | Deactivated vendors cannot receive new invoices | High | Creation guard | No |
| INV-S012 | State | Suspended vendors cannot be in new POs | High | PO guard | No |
| INV-S013 | State | Payment confirmed only with GL posting | Critical | Confirmation guard | No |
| INV-S014 | State | Void only from approved/scheduled/disputed/blocked | Critical | Void guard | No |
| INV-S015 | State | Expired/full credits cannot be applied | High | Application guard | No |
| INV-S016 | State | Approval chain cancelled only with invoice cancellation | High | Cancellation guard | No |
| INV-S017 | State | Approved proposals cannot become rejected | Medium | State guard | No |
| INV-S018 | State | Batch cannot cancel after confirmed payment | Critical | Batch guard | No |
| INV-S019 | State | Dispute only from validated/matched/exception | Medium | Dispute guard | No |
| INV-S020 | State | Only Controller can deactivate vendor | High | Authorization check | No |
| INV-S021 | State | Pending review vendors cannot be suspended | Medium | Suspension guard | No |
| INV-S022 | State | Blocking requires explicit action with reason | Medium | Block guard | No |
| INV-S023 | State | Reconciliation finalized only with zero discrepancies | High | Finalization guard | No |
| INV-S024 | State | Vendor performance records immutable after creation | Medium | No update methods | No |
| INV-S025 | State | Converted PRs cannot be re-submitted | Medium | PR state guard | No |

### Authorization Invariants

| ID | Category | Rule | Severity | Enforcement | Auto-fixable |
|---|---|---|---|---|---|
| INV-A001 | Authorization | PO creator cannot approve same PO's invoice (SoD) | Critical | SoD check | No |
| INV-A002 | Authorization | Invoice capturer cannot approve same invoice (SoD) | Critical | SoD check | No |
| INV-A003 | Authorization | Proposal creator cannot execute payment batch (SoD) | Critical | SoD check | No |
| INV-A004 | Authorization | Invoice >$50K requires Controller approval | Critical | Approval matrix | No |
| INV-A005 | Authorization | Invoice >$100K requires CFO + Treasury dual | Critical | Approval matrix | No |
| INV-A006 | Authorization | Payment reversal requires Controller approval | Critical | Authorization check | No |
| INV-A007 | Authorization | Reversal >$50K requires Controller + CFO | Critical | Authorization check | No |
| INV-A008 | Authorization | Each approval level requires different person | High | Routing validation | No |
| INV-A009 | Authorization | Vendor deactivation requires Controller | High | Transition guard | No |
| INV-A010 | Authorization | Bank detail changes require re-verification | Critical | Payment guard | No |
| INV-A011 | Authorization | Match override >$500 requires Controller | High | Override guard | No |
| INV-A012 | Authorization | Critical exceptions auto-escalate to AP Manager | High | Exception creation | Yes |
| INV-A013 | Authorization | Exception >$5K requires Controller resolution | High | Resolution guard | No |
| INV-A014 | Authorization | Invoice void requires Controller | Critical | Void guard | No |
| INV-A015 | Authorization | Auto-approvals produce audit record | High | Auto-approval logic | Yes |
| INV-A016 | Authorization | No circular delegation chains | High | Cycle detection | No |
| INV-A017 | Authorization | Delegation ≤ original authorityLimit | High | Delegation guard | No |
| INV-A018 | Authorization | Audit records are read-only for all roles | Critical | Repository guard | No |
| INV-A019 | Authorization | Voided invoices cannot be un-voided | Critical | State machine | No |
| INV-A020 | Authorization | Treasury execution authority limits per role | Critical | Execution guard | No |
| INV-A021 | Authorization | Reconciliation >$500 requires Controller + root cause | High | Adjustment guard | No |

### Temporal Invariants

| ID | Category | Rule | Severity | Enforcement | Auto-fixable |
|---|---|---|---|---|---|
| INV-T001 | Temporal | Due date ≥ invoice date | High | Date validation | No |
| INV-T002 | Temporal | Discount date ≤ due date | High | Date validation | No |
| INV-T003 | Temporal | Invoice date ≤ 90 days in past | Medium | Date validation | No |
| INV-T004 | Temporal | Invoice date not in future | High | Date validation | No |
| INV-T005 | Temporal | Payment after approval date | Critical | Scheduling guard | No |
| INV-T006 | Temporal | SLA deadline mandatory on exceptions | High | Exception creation | Yes |
| INV-T007 | Temporal | Audit timestamps immutable | Critical | Prisma model | No |
| INV-T008 | Temporal | Credit expiry ≥ credit date | Medium | Date validation | No |
| INV-T009 | Temporal | Proposal payment date ≥ today | High | Proposal guard | No |
| INV-T010 | Temporal | Reconciliation within 90 days of statement | Medium | Reconciliation guard | No |
| INV-T011 | Temporal | Vendor onboarding ≤ PO/invoice creation | Medium | Creation guard | No |
| INV-T012 | Temporal | SLA deadline mandatory on every approval level | High | Routing guard | Yes |

### Data Integrity Invariants

| ID | Category | Rule | Severity | Enforcement | Auto-fixable |
|---|---|---|---|---|---|
| INV-D001 | Data | Every entity has companyId | Critical | Schema, service, repository | No |
| INV-D002 | Data | Invoice number unique per (company, vendor) | Critical | DB unique constraint | No |
| INV-D003 | Data | Payment idempotencyKey globally unique | Critical | DB unique constraint | No |
| INV-D004 | Data | Vendor code unique per company | Critical | DB unique constraint | No |
| INV-D005 | Data | Vendor taxId unique per company | Critical | DB unique constraint | No |
| INV-D006 | Data | Active vendor required for new invoices/POs | High | Service guard | No |
| INV-D007 | Data | PO reference exists in same company | Critical | FK + tenant check | No |
| INV-D008 | Data | GRN reference exists in same company | Critical | FK + tenant check | No |
| INV-D009 | Data | GL account exists in chart of accounts | Critical | FK + tenant check | No |
| INV-D010 | Data | Batch number unique per company | High | DB unique constraint | No |
| INV-D011 | Data | Credit number unique per (company, vendor) | High | DB unique constraint | No |
| INV-D012 | Data | Invoice references existing vendor in same company | Critical | FK constraint | No |
| INV-D013 | Data | Proposal has ≥ 1 invoice | Medium | Generation guard | No |
| INV-D014 | Data | Invoice in only one approved proposal | Critical | Deduplication check | No |
| INV-D015 | Data | Proposal number unique per company | High | DB unique constraint | No |
| INV-D016 | Data | Bank detail references existing vendor | Critical | FK constraint | No |
| INV-D017 | Data | Exactly one primary bank detail per vendor | Medium | Application logic | No |
| INV-D018 | Data | Performance record unique per (company, vendor, period) | Medium | DB unique constraint | No |
| INV-D019 | Data | GRN linked to same PO as invoice | High | Match validation | No |
| INV-D020 | Data | Payment idempotencyKey generated before execution | Critical | Creation guard | No |

### Audit Invariants

| ID | Category | Rule | Severity | Enforcement | Auto-fixable |
|---|---|---|---|---|---|
| INV-AU001 | Audit | Every state transition produces audit record | Critical | Service layer transaction | Yes |
| INV-AU002 | Audit | Audit records are append-only (no update, no delete) | Critical | Repository guard | No |
| INV-AU003 | Audit | Audit includes who, what, when, where, why | High | Audit creation function | No |
| INV-AU004 | Audit | Financial amounts in audit match entity amounts | High | Audit snapshot capture | Yes |
| INV-AU005 | Audit | Rejection decisions include reason | High | Rejection guard | No |
| INV-AU006 | Audit | Audit records include companyId | Critical | Tenant context enforcement | Yes |
| INV-AU007 | Audit | System actions set actorId = "system" | Medium | System audit helper | Yes |
| INV-AU008 | Audit | No sensitive data in audit records | Critical | Audit redaction function | Yes |
| INV-AU009 | Audit | Each audit record has unique ID | Critical | Prisma @id @default(cuid()) | Yes |
| INV-AU010 | Audit | Audit and state change in same transaction | Critical | Transaction boundary | No |
| INV-AU011 | Audit | Audit chain reconstructable per entity | High | Query completeness | No |

### Multi-Tenancy Invariants

| ID | Category | Rule | Severity | Enforcement | Auto-fixable |
|---|---|---|---|---|---|
| INV-M001 | Multi-Tenant | Every query includes companyId filter | Critical | Repository base filter | No |
| INV-M002 | Multi-Tenant | Cross-tenant access = security incident | Critical | Tenant guard + alert | No |
| INV-M003 | Multi-Tenant | Vendor data isolated per company | Critical | Composite constraints | No |
| INV-M004 | Multi-Tenant | Invoice numbers unique per (company, vendor) | High | DB constraint design | No |
| INV-M005 | Multi-Tenant | GL accounts scoped to tenant | Critical | FK + tenant check | No |
| INV-M006 | Multi-Tenant | Payment batches scoped to tenant | Critical | Tenant guard | No |
| INV-M007 | Multi-Tenant | All entities include companyId | Critical | Prisma schema | No |
| INV-M008 | Multi-Tenant | Saga steps re-validate companyId across entities | Critical | Saga validation | No |

### Process Invariants

| ID | Category | Rule | Severity | Enforcement | Auto-fixable |
|---|---|---|---|---|---|
| INV-P001 | Process | Full lifecycle in order — no stage skipping | Critical | State machine | No |
| INV-P002 | Process | All exceptions resolved before approval | High | State evaluation | No |
| INV-P003 | Process | Every payment from approved proposal | Critical | Payment guard | No |
| INV-P004 | Process | Every payment produces GL posting | Critical | GL integration guard | No |
| INV-P005 | Process | Reconciliation within 90 days of statement | Medium | Scheduling guard | No |
| INV-P006 | Process | Invoice has ≥ 1 line item | High | Creation guard | No |
| INV-P007 | Process | Line item quantity > 0, unitPrice ≥ 0 | High | Validation guard | No |
| INV-P008 | Process | 3-way match requires PO + GRN (2-way for services only) | High | Match type evaluation | No |
| INV-P009 | Process | Discount invoices prioritized within 5 days of window close | Medium | Proposal algorithm | Yes |
| INV-P010 | Process | Reconciliation finalized only at zero variance | High | Finalization guard | No |
| INV-P011 | Process | Payment reversal produces offsetting GL entry | Critical | Reversal posting guard | No |
| INV-P012 | Process | Invoice closed only after GL posting confirmed | Critical | Close guard | No |
| INV-P013 | Process | Credits applied to same-vendor invoices only | High | Application guard | No |

---

## Part 12 — Invariant Summary Statistics

| Category | Count | Critical | High | Medium |
|---|---|---|---|---|
| Financial (INV-F) | 27 | 12 | 10 | 5 |
| State Transition (INV-S) | 25 | 8 | 12 | 5 |
| Authorization (INV-A) | 21 | 11 | 9 | 1 |
| Temporal (INV-T) | 12 | 3 | 6 | 3 |
| Data Integrity (INV-D) | 20 | 12 | 5 | 3 |
| Audit (INV-AU) | 11 | 7 | 3 | 1 |
| Multi-Tenancy (INV-M) | 8 | 8 | 0 | 0 |
| Process (INV-P) | 13 | 6 | 6 | 1 |
| **Total** | **137** | **67** | **51** | **19** |

### Critical Invariants by Entity

| Entity | Critical Invariants |
|---|---|
| VendorInvoice | INV-F003, F004, F005, F006, F007, F008, F012, F018, S002, S003, S005, S009, S010, S014, D002, D012, D014, AU001, M001, P001, P003, P004, P011, P012 (24) |
| PaymentBatch | INV-F011, F027, S009, S013, S018, D003, D010, D020, M001, P003 (10) |
| Vendor | INV-S011, S012, D001, D004, D005, D006, D012, M001, M003 (9) |
| ThreeWayMatch | INV-F012, S006 (2) |
| InvoiceException | INV-S007, S008, D001, T006, T012 (5) |
| ApprovalChain | INV-A001, A002, A003, A004, A005, S002 (6) |
| PaymentProposal | INV-F010, D014, D015, T009, P003 (5) |
| VendorCredit | INV-F014, S015, D011, D016, P013 (5) |
| Audit | INV-AU001, AU002, AU006, AU008, AU009, AU010, A018 (7) |

### Auto-Fixable Invariants

| Count | Invariants |
|---|---|
| 14 | INV-F003, F004, F005, F006, F010, F011, F013, F015, F017, F025, S012, T006, T012, A012, A015, AU001, AU004, AU006, AU007, AU008, AU009, P009 |

---

## Part 13 — Invariant Evolution Policy

Invariants may only be added or strengthened, never weakened or removed.

| Rule | Process |
|---|---|
| **Adding an invariant** | Document the invariant, identify enforcement points, add to this document, implement guard, add tests. Requires Architecture Review. |
| **Strengthening an invariant** | Tightening a tolerance, adding a new check, or increasing severity. Requires Architecture Review + Financial Precision Policy review. |
| **Weakening an invariant** | **Prohibited.** No invariant may be weakened or removed. If an invariant proves incorrect, it was never truly an invariant — it should be reclassified as a business rule with different enforcement. |
| **Temporary exception** | In rare cases, a temporary bypass may be approved by Controller + CFO with full audit trail. The bypass is time-limited, documented, and produces a HIGH severity audit event. |

---

*End of Phase 21A.0 — Accounts Payable Domain Invariants*
