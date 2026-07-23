# Phase 21.0 — Accounts Payable Implementation Plan

> **Status**: Ready for execution
> **Type**: Implementation roadmap — 4 phases with effort estimates
> **Date**: July 21, 2026

---

## Executive Summary

Phase 21.0 delivers a complete, production-grade Accounts Payable workflow for the Perionyx enterprise financial platform. It transforms the existing in-memory procurement scaffolding into a fully persistent, auditable, and intelligent AP system.

**Scope**: 4 independently shippable phases across 8–11 weeks.

**Key outcomes:**
- 12 Prisma models replacing all in-memory `Map` stores
- 20+ REST API routes with Zod validation, tenant isolation, and audit trails
- Automated 3-way match (PO ↔ GRN ↔ Invoice) with configurable tolerances
- Approval routing via the existing automation-studio approval-matrix
- Batch payment proposals with idempotency and dual-signature controls
- Exception management with SLA tracking, pattern detection, and resolution workflows
- Duplicate invoice detection (exact + fuzzy matching)
- Complete, immutable audit chain for every entity and action
- Vendor statement reconciliation with adjustment workflows
- All monetary operations using `financial-precision.ts` helpers
- All Prisma monetary fields using `Decimal(20,4)`, never native `number`

---

## Current State Assessment

| Component | Location | State | Gap |
|---|---|---|---|
| Procurement services | `src/modules/procurement/services/*.ts` | In-memory `Map` | No persistence, no audit trail |
| InvoiceMatchingService | `src/modules/procurement/services/invoice-matching.service.ts` | 126 lines, hardcoded tolerance | Disconnected from workflow, no persistence |
| GLIntegrationService | `src/modules/procurement/services/gl-integration.service.ts` | Generates GL entries | Not wired to Prisma, not called |
| ApprovalsService | `src/modules/procurement/services/approvals.service.ts` | In-memory `Map` | No approve/reject actions, no delegation |
| ApprovalMatrixEvaluator | `src/modules/automation-studio/approval-matrix-evaluator.ts` | Working | Not wired to AP invoices |
| financial-precision.ts | `src/lib/financial-precision.ts` | 13 helpers | Not used by procurement services |
| Prisma models | — | Zero | No AP persistence layer |
| API routes | — | Zero | No HTTP interface for AP |
| Mutation methods | — | Zero | No approve/reject/execute actions |

**Critical gaps**: Zero Prisma models, zero API routes, zero mutation methods. The existing `InvoiceMatchingService` has 2-way/3-way matching logic (126 lines) but it is disconnected from the workflow. The `GLIntegrationService` generates GL entries but is not wired. The `ApprovalsService` tracks approvals but has no approve/reject actions.

---

## Execution Strategy

4 phases, each independently shippable, each building on the previous.

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 21A (3-4 weeks)                                      │
│  ├─ 21A.1  Prisma Models (1 week)                           │
│  ├─ 21A.2  Prisma Repository Layer (1 week)                 │
│  └─ 21A.3  API Routes (1-2 weeks)                           │
│                                                             │
│  Phase 21B (2-3 weeks)  ← depends on 21A                    │
│  ├─ 21B.1  Service Layer Rewrite (1 week)                   │
│  ├─ 21B.2  Three-Way Match Engine (3-5 days)                │
│  ├─ 21B.3  Approval Workflow (3-5 days)                     │
│  ├─ 21B.4  Payment Processing (3-5 days)                    │
│  └─ 21B.5  GL Integration Wiring (2-3 days)                 │
│                                                             │
│  Phase 21C (2 weeks)  ← depends on 21A (parallel w/ 21B)    │
│  ├─ 21C.1  Exception Queue UI (1 week)                      │
│  ├─ 21C.2  Duplicate Invoice Detection (3-5 days)           │
│  └─ 21C.3  AP Analytics Dashboard (3-5 days)                │
│                                                             │
│  Phase 21D (1-2 weeks)  ← depends on 21A + 21B.5            │
│  ├─ 21D.1  Vendor Statement Reconciliation (3-5 days)       │
│  ├─ 21D.2  AP Audit Chain (2-3 days)                        │
│  ├─ 21D.3  Payment Safety (2-3 days)                        │
│  └─ 21D.4  Multi-Currency Support (2-3 days)                │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 21A — Foundation

> **Duration**: 3–4 weeks | **Depends on**: Nothing | **Deliverable**: Prisma schema, repositories, API routes

### 21A.1 — Prisma Models (1 week)

Create Prisma models for 12 AP entities.

**Requirements for every model:**
- `companyId` field (multi-tenant isolation)
- Every monetary field: `Decimal @db.Decimal(20,4)` — never `Float`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`
- `createdBy String`
- `updatedBy String`
- Proper composite indexes on `(companyId, status)`, `(companyId, vendorId)`, etc.
- Foreign keys between PO→PR, GRN→PO, Invoice→PO, Invoice→GRN, Payment→Invoice
- Unique constraints: `poNumber` per company, `invoiceNumber` per vendor

**Migration**: `20260721010000_procurement_domain_models`

#### ProcurementVendor

| Field | Type | Notes |
|---|---|---|
| id | `String @id @default(cuid())` | |
| companyId | `String` | Indexed |
| name | `String` | |
| code | `String` | Vendor code, unique per company |
| status | `VendorStatus @default(ACTIVE)` | ACTIVE, INACTIVE, SUSPENDED, PENDING_APPROVAL |
| riskScore | `Decimal @db.Decimal(5,2) @default(0)` | 0–100 |
| paymentTerms | `Int @default(30)` | Net days |
| creditLimit | `Decimal @db.Decimal(20,4) @default(0)` | |
| currency | `String @default("USD")` | |
| taxId | `String?` | |
| contactName | `String?` | |
| contactEmail | `String?` | |
| contactPhone | `String?` | |
| address | `String? @db.Text` | |
| bankAccount | `String?` | Encrypted in transit |
| createdAt | `DateTime @default(now())` | |
| updatedAt | `DateTime @updatedAt` | |
| createdBy | `String` | |
| updatedBy | `String` | |

**Relations**: `purchaseOrders`, `invoices`, `payments`

#### ProcurementPR

| Field | Type | Notes |
|---|---|---|
| id | `String @id @default(cuid())` | |
| companyId | `String` | Indexed |
| prNumber | `String` | Auto-generated, unique per company |
| title | `String` | |
| description | `String? @db.Text` | |
| status | `PRStatus @default(DRAFT)` | DRAFT, SUBMITTED, APPROVED, REJECTED, CONVERTED_TO_PO |
| requestedBy | `String` | User ID |
| department | `String?` | |
| costCenter | `String?` | |
| totalAmount | `Decimal @db.Decimal(20,4)` | Sum of item totals |
| currency | `String @default("USD")` | |
| justification | `String? @db.Text` | |
| priority | `PRPriority @default(NORMAL)` | LOW, NORMAL, HIGH, URGENT |
| neededBy | `DateTime?` | |
| createdAt / updatedAt / createdBy / updatedBy | Standard | |

**Relations**: `items` (ProcurementPRItem[]), `purchaseOrders` (ProcurementPO[])

#### ProcurementPRItem

| Field | Type | Notes |
|---|---|---|
| id | `String @id @default(cuid())` | |
| companyId | `String` | |
| prId | `String` | FK → ProcurementPR |
| description | `String` | |
| quantity | `Decimal @db.Decimal(20,4)` | |
| unitPrice | `Decimal @db.Decimal(20,4)` | |
| totalPrice | `Decimal @db.Decimal(20,4)` | quantity × unitPrice |
| category | `String?` | |
| glAccountCode | `String?` | For GL posting |

#### ProcurementPO

| Field | Type | Notes |
|---|---|---|
| id | `String @id @default(cuid())` | |
| companyId | `String` | Indexed |
| poNumber | `String` | Auto-generated, unique per company |
| vendorId | `String` | FK → ProcurementVendor |
| prId | `String?` | FK → ProcurementPR (nullable) |
| status | `POStatus @default(DRAFT)` | DRAFT, SUBMITTED, APPROVED, SENT, RECEIVED, CLOSED, CANCELLED |
| totalAmount | `Decimal @db.Decimal(20,4)` | |
| taxAmount | `Decimal @db.Decimal(20,4) @default(0)` | |
| currency | `String @default("USD")` | |
| paymentTerms | `Int @default(30)` | |
| deliveryDate | `DateTime?` | |
| shippingAddress | `String? @db.Text` | |
| notes | `String? @db.Text` | |
| approvedBy | `String?` | |
| approvedAt | `DateTime?` | |
| sentAt | `DateTime?` | When sent to vendor |
| createdAt / updatedAt / createdBy / updatedBy | Standard | |

**Relations**: `vendor`, `purchaseRequest`, `items`, `goodsReceipts`, `invoices`

#### ProcurementPOItem

| Field | Type | Notes |
|---|---|---|
| id | `String @id @default(cuid())` | |
| companyId | `String` | |
| poId | `String` | FK → ProcurementPO |
| description | `String` | |
| quantity | `Decimal @db.Decimal(20,4)` | |
| unitPrice | `Decimal @db.Decimal(20,4)` | |
| totalPrice | `Decimal @db.Decimal(20,4)` | |
| receivedQuantity | `Decimal @db.Decimal(20,4) @default(0)` | Accumulated from GRNs |
| invoicedQuantity | `Decimal @db.Decimal(20,4) @default(0)` | Accumulated from invoices |
| category | `String?` | |
| glAccountCode | `String?` | |

#### ProcurementGRN

| Field | Type | Notes |
|---|---|---|
| id | `String @id @default(cuid())` | |
| companyId | `String` | |
| grnNumber | `String` | Auto-generated, unique per company |
| poId | `String` | FK → ProcurementPO |
| status | `GRNStatus @default(RECEIVED)` | RECEIVED, INSPECTED, ACCEPTED, REJECTED |
| receivedBy | `String` | User ID |
| receivedAt | `DateTime @default(now())` | |
| inspectedBy | `String?` | |
| inspectedAt | `DateTime?` | |
| notes | `String? @db.Text` | |
| createdAt / updatedAt / createdBy / updatedBy | Standard | |

**Relations**: `purchaseOrder`, `items`

#### ProcurementGRNItem

| Field | Type | Notes |
|---|---|---|
| id | `String @id @default(cuid())` | |
| companyId | `String` | |
| grnId | `String` | FK → ProcurementGRN |
| poItemId | `String` | FK → ProcurementPOItem |
| quantityReceived | `Decimal @db.Decimal(20,4)` | |
| quantityAccepted | `Decimal @db.Decimal(20,4)` | |
| quantityRejected | `Decimal @db.Decimal(20,4) @default(0)` | |
| rejectionReason | `String? @db.Text` | |

#### ProcurementInvoice

| Field | Type | Notes |
|---|---|---|
| id | `String @id @default(cuid())` | |
| companyId | `String` | Indexed |
| invoiceNumber | `String` | Unique per (companyId, vendorId) |
| vendorId | `String` | FK → ProcurementVendor |
| poId | `String?` | FK → ProcurementPO (nullable for non-PO invoices) |
| status | `InvoiceStatus @default(DRAFT)` | DRAFT, SUBMITTED, APPROVED, REJECTED, PAID, VOIDED |
| matchStatus | `MatchStatus @default(UNMATCHED)` | UNMATCHED, MATCHED, PARTIALLY_MATCHED, EXCEPTION, OVERRIDE |
| invoiceDate | `DateTime` | |
| dueDate | `DateTime` | |
| totalAmount | `Decimal @db.Decimal(20,4)` | |
| taxAmount | `Decimal @db.Decimal(20,4) @default(0)` | |
| discountAmount | `Decimal @db.Decimal(20,4) @default(0)` | |
| currency | `String @default("USD")` | |
| exchangeRate | `Decimal @db.Decimal(10,6) @default(1)` | For multi-currency |
| matchScore | `Decimal @db.Decimal(5,2)?` | 0–100 confidence |
| approvedBy | `String?` | |
| approvedAt | `DateTime?` | |
| paidAt | `DateTime?` | |
| createdAt / updatedAt / createdBy / updatedBy | Standard | |

**Relations**: `vendor`, `purchaseOrder`, `items`, `payments`

#### ProcurementInvoiceItem

| Field | Type | Notes |
|---|---|---|
| id | `String @id @default(cuid())` | |
| companyId | `String` | |
| invoiceId | `String` | FK → ProcurementInvoice |
| poItemId | `String?` | FK → ProcurementPOItem (nullable) |
| description | `String` | |
| quantity | `Decimal @db.Decimal(20,4)` | |
| unitPrice | `Decimal @db.Decimal(20,4)` | |
| totalPrice | `Decimal @db.Decimal(20,4)` | |
| glAccountCode | `String?` | |

#### ProcurementPayment

| Field | Type | Notes |
|---|---|---|
| id | `String @id @default(cuid())` | |
| companyId | `String` | |
| paymentNumber | `String` | Auto-generated, unique per company |
| invoiceId | `String` | FK → ProcurementInvoice |
| vendorId | `String` | FK → ProcurementVendor |
| proposalId | `String?` | FK → ProcurementPaymentProposal |
| amount | `Decimal @db.Decimal(20,4)` | |
| currency | `String @default("USD")` | |
| paymentMethod | `PaymentMethod @default(BANK_TRANSFER)` | BANK_TRANSFER, CHECK, WIRE, ACH |
| status | `PaymentStatus @default(PENDING)` | PENDING, APPROVED, EXECUTING, COMPLETED, FAILED, CANCELLED |
| idempotencyKey | `String @unique` | Prevents double-payment |
| executedAt | `DateTime?` | |
| confirmedAt | `DateTime?` | |
| executedBy | `String?` | |
| confirmedBy | `String?` | |
| reference | `String?` | Bank reference |
| notes | `String? @db.Text` | |
| createdAt / updatedAt / createdBy / updatedBy | Standard | |

**Relations**: `invoice`, `vendor`, `proposal`

#### ProcurementPaymentProposal

| Field | Type | Notes |
|---|---|---|
| id | `String @id @default(cuid())` | |
| companyId | `String` | |
| proposalNumber | `String` | Auto-generated, unique per company |
| status | `ProposalStatus @default(DRAFT)` | DRAFT, SUBMITTED, APPROVED, REJECTED, EXECUTED |
| totalAmount | `Decimal @db.Decimal(20,4)` | |
| paymentDate | `DateTime?` | Planned payment date |
| approvedBy | `String?` | |
| approvedAt | `DateTime?` | |
| notes | `String? @db.Text` | |
| createdAt / updatedAt / createdBy / updatedBy | Standard | |

**Relations**: `items` (ProcurementPaymentItem[])

#### ProcurementPaymentItem

| Field | Type | Notes |
|---|---|---|
| id | `String @id @default(cuid())` | |
| companyId | `String` | |
| proposalId | `String` | FK → ProcurementPaymentProposal |
| invoiceId | `String` | FK → ProcurementInvoice |
| amount | `Decimal @db.Decimal(20,4)` | |

#### ProcurementException

| Field | Type | Notes |
|---|---|---|
| id | `String @id @default(cuid())` | |
| companyId | `String` | |
| type | `ExceptionType` | PRICE_VARIANCE, QUANTITY_VARIANCE, DUPLICATE_INVOICE, MISSING_RECEIPT, MATCH_FAILURE, APPROVAL_TIMEOUT, PAYMENT_FAILED, BUDGET_EXCEEDED |
| severity | `ExceptionSeverity @default(MEDIUM)` | LOW, MEDIUM, HIGH, CRITICAL |
| entityType | `String` | "invoice", "po", "grn", "payment" |
| entityId | `String` | ID of the related entity |
| vendorId | `String?` | FK → ProcurementVendor |
| description | `String @db.Text` | |
| status | `ExceptionStatus @default(OPEN)` | OPEN, IN_PROGRESS, RESOLVED, ESCALATED, VOIDED |
| assignedTo | `String?` | User ID |
| resolvedBy | `String?` | |
| resolvedAt | `DateTime?` | |
| resolutionNotes | `String? @db.Text` | |
| slaDeadline | `DateTime?` | |
| createdAt / updatedAt / createdBy / updatedBy | Standard | |

**Relations**: `vendor`

#### ProcurementAudit

| Field | Type | Notes |
|---|---|---|
| id | `String @id @default(cuid())` | |
| companyId | `String` | |
| entityType | `String` | "vendor", "pr", "po", "grn", "invoice", "payment", "exception" |
| entityId | `String` | |
| action | `String` | "created", "updated", "approved", "rejected", "paid", etc. |
| actorId | `String` | User ID |
| actorName | `String?` | Denormalized for display |
| changes | `String? @db.Text` | JSON diff of before/after |
| metadata | `String? @db.Text` | JSON extra context |
| ipAddress | `String?` | |
| createdAt | `DateTime @default(now())` | |

**Note**: Append-only — no `updatedAt`, no update methods. Immutable.

---

### 21A.2 — Prisma Repository Layer (1 week)

Create `src/server/procurement/repositories/` with 8 repository classes.

Each repository:
- Implements an interface from `src/server/persistence/repository.interface.ts`
- Uses PrismaClient with mandatory `companyId` filter on every query
- Returns domain types (not Prisma types directly)
- Maps domain ↔ Prisma types bidirectionally

#### Repository Classes

| Repository | Key Methods |
|---|---|
| `PrismaVendorRepository` | CRUD, search by name/code, filter by risk score, filter by status |
| `PrismaPRRepository` | CRUD, status transitions (draft→submitted→approved→converted), list by requester |
| `PrismaPORepository` | CRUD, status transitions (draft→approved→sent→received→closed), list by vendor |
| `PrismaGRNRepository` | CRUD, link to PO, list by PO, inspection status update |
| `PrismaInvoiceRepository` | CRUD, match status queries, due date queries, duplicate detection (by vendor+invoiceNumber) |
| `PrismaPaymentRepository` | CRUD, batch queries, idempotency key lookup, status transitions |
| `PrismaExceptionRepository` | CRUD, SLA tracking, assignment queries, pattern detection aggregation |
| `PrismaAuditRepository` | Append-only create, query by entity, query by date range, query by actor |

#### File Structure

```
src/server/procurement/repositories/
├── vendor.repository.ts
├── pr.repository.ts
├── po.repository.ts
├── grn.repository.ts
├── invoice.repository.ts
├── payment.repository.ts
├── exception.repository.ts
├── audit.repository.ts
├── index.ts
└── types.ts              // Domain types + mapper functions
```

#### Domain Types

`src/server/procurement/repositories/types.ts` exports:
- Domain interfaces for all 12 entities
- `toDomain()` mapper for each entity (Prisma → domain)
- `toPrisma()` mapper for each entity (input → Prisma create/update)
- Filter interfaces for each entity

---

### 21A.3 — API Routes (1–2 weeks)

Create REST API routes under `src/app/api/v1/procurement/`.

#### Routes

| Route | Methods | Purpose |
|---|---|---|
| `/vendors` | GET, POST | List/filter/create vendors |
| `/vendors/[id]` | GET, PUT, DELETE | Detail, update, soft deactivate |
| `/purchase-requests` | GET, POST | List/create PRs (triggers approval routing) |
| `/purchase-requests/[id]` | GET, PUT, POST `/approve`, POST `/reject` | Detail, update, approve, reject |
| `/purchase-orders` | GET, POST | List/create POs (from approved PR) |
| `/purchase-orders/[id]` | GET, PUT, POST `/send`, POST `/cancel` | Detail, update, send, cancel |
| `/grn` | GET, POST | List/create GRNs (triggers 3-way match) |
| `/grn/[id]` | GET, PUT | Detail, update |
| `/invoices` | GET, POST | List/capture invoices (duplicate detection) |
| `/invoices/[id]` | GET, PUT, POST `/validate`, POST `/match`, POST `/approve`, POST `/reject` | Full invoice lifecycle |
| `/payments` | GET, POST | List/create payments |
| `/payments/[id]` | GET, POST `/execute`, POST `/confirm` | Detail, execute, confirm |
| `/proposals` | GET, POST | List/generate batch payment proposals |
| `/proposals/[id]` | GET, POST `/approve`, POST `/reject` | Detail, approve, reject |
| `/exceptions` | GET, POST `/resolve`, POST `/escalate` | List, resolve, escalate |
| `/reconciliation` | GET, POST | Vendor statements, run reconciliation |
| `/audit` | GET | Immutable audit trail (filtered by entity/date/action) |

#### Every Route Must

1. Call `requireTenantContext()` — extract `companyId` and `userId`
2. Validate input with Zod schemas (`src/lib/validations/procurement.ts`)
3. Return typed responses: `{ data: T }` for single, `{ data: T[], total: number }` for lists
4. Write audit events via `recordAudit()` after every mutation
5. Use `rateLimit()` from proxy for mutation endpoints

---

## Phase 21B — Core Workflow

> **Duration**: 2–3 weeks | **Depends on**: 21A | **Deliverable**: Service rewrites, match engine, approval, payment, GL

### 21B.1 — Service Layer Rewrite (1 week)

Rewrite all existing in-memory procurement services to use Prisma repositories.

#### Services to Rewrite

| Service | Current | Target |
|---|---|---|
| VendorService | In-memory `Map` | PrismaVendorRepository + duplicate detection + risk scoring |
| PurchaseRequestService | In-memory `Map` | PrismaPRRepository + budget check + approval routing |
| PurchaseOrderService | In-memory `Map` | PrismaPORepository + contract pricing + delivery tracking |
| ReceivingService | In-memory `Map` | PrismaGRNRepository + partial receipt + 3-way match trigger |
| InvoiceMatchingService | 126 lines, hardcoded 0.01 tolerance | PrismaInvoiceRepository + configurable tolerances + automated match |
| ApprovalsService | In-memory `Map` | Prisma + approval-matrix integration + delegation + SLA |
| PaymentService | In-memory `Map` | PrismaPaymentRepository + batch operations + idempotency |
| GLIntegrationService | Generates entries, not wired | Prisma + automated posting + period close |

#### Architectural Decisions

1. Services become **facades** over repositories + business logic
2. Business logic extracted from services into **domain-specific validators/matchers**
3. All mutations go through the **service layer** (never direct repository access from routes)
4. All monetary operations use **`financial-precision.ts`** helpers (`financialRound`, `sumDecimals`, `multiplyDecimals`, `allocateAmount`)
5. Every state transition calls `recordAudit()`

---

### 21B.2 — Three-Way Match Engine (3–5 days)

Wire the existing matching logic into the full workflow.

#### Trigger Points

1. **When GRN is created** → auto-trigger 3-way match against all open invoices for that PO
2. **When Invoice is captured** → auto-trigger 3-way match against all received GRNs for that PO

#### Match Logic

```
Invoice ──→ Compare line items to PO items
GRN    ────→ Compare received quantities to invoiced quantities
PO     ────→ Reference prices and terms

Match result:
  - MATCHED: price, quantity, and tax within tolerance → auto-proceed
  - PARTIALLY_MATCHED: some items match, some don't → flag for review
  - EXCEPTION: variance exceeds tolerance → create ProcurementException
  - OVERRIDE: manual override by AP Manager with reason
```

#### Configurable Tolerances

| Parameter | Default | Configurable Per |
|---|---|---|
| Price variance | 2% | Vendor, category, amount tier |
| Quantity variance | 5% | Vendor, category |
| Tax variance | 1% | Vendor |
| Total invoice tolerance | $50 or 1% | Company-wide |

#### Enhancements Over Current

| Aspect | Current | Target |
|---|---|---|
| Tolerance | Hardcoded 0.01 | Configurable per vendor/category/amount |
| Persistence | None (in-memory) | Prisma — full match history |
| Exceptions | Not created | Auto-create `ProcurementException` records |
| SLA | None | 24h per level, auto-escalate on breach |
| Notifications | None | Auto-notify AP Clerk of exceptions |

---

### 21B.3 — Approval Workflow (3–5 days)

Wire the approval-matrix from automation-studio to AP invoices.

#### Threshold Routing

| Amount Range | Approver | SLA |
|---|---|---|
| < $1,000 | Auto-approve (system) | Immediate |
| $1,000 – $10,000 | AP Manager | 24 hours |
| $10,000 – $50,000 | Controller | 24 hours |
| > $50,000 | CFO | 48 hours |
| > $100,000 | CFO + Treasury Manager (dual signature) | 72 hours |

#### Integration

Call `ApprovalMatrixEvaluator.getInstance().evaluate()` with context:
```typescript
{
  entityType: 'invoice',
  amount: invoice.totalAmount,
  vendorId: invoice.vendorId,
  companyId,
  requestedBy: invoice.createdBy,
}
```

#### Segregation of Duties

- PO creator cannot approve same PO's invoice
- Invoice capturer cannot approve same invoice
- Payment creator cannot execute same payment

#### Delegation

- If primary approver unavailable >24h → delegate to alternate
- Delegation rules stored in `ProcurementVendor` or a separate delegation table
- Delegation has `maxAmount` limit and date range

#### SLA Enforcement

- 24h per approval level
- Auto-escalate on breach
- Full approval chain recorded in audit trail (`ProcurementAudit`)

---

### 21B.4 — Payment Processing (3–5 days)

Build the payment proposal and execution pipeline.

#### Flow

```
Approved Invoices → PaymentProposalService.generate() → Batch by vendor/terms
    → PaymentProposalService.approve() → AP Manager (>$100K → Controller)
        → PaymentService.execute() → Submit to bank (manual for now, API future)
            → PaymentService.confirm() → Bank confirmed
                → GL Integration → Generate GL entries
```

#### Key Controls

1. **Idempotency**: `idempotencyKey` field (unique constraint) prevents double-payment
2. **Dual-signature**: >$10K requires Treasury Manager approval
3. **Batch optimization**: Group by vendor, maximize early-pay discounts
4. **Bank confirmation timeout**: Auto-retry at 24h, manual intervention at 72h

---

### 21B.5 — GL Integration Wiring (2–3 days)

Wire existing `GLIntegrationService` to Prisma.

#### Entry Points

| Trigger | GL Entry |
|---|---|
| Invoice approved | Debit: Expense / Credit: AP Liability |
| GRN accepted | Debit: Inventory/Expense / Credit: GRN Liability |
| Payment confirmed | Debit: AP Liability / Credit: Bank/Cash |
| Discount taken | Debit: Purchase Discount / Credit: AP Liability |
| Variance exception | Debit: Price Variance / Credit: AP Liability |

#### Implementation

1. `generateInvoiceEntry()` → post to GL on invoice approval
2. `generatePaymentEntry()` → post to GL on payment confirmation
3. `generateReceiptEntry()` → post to GL on GRN acceptance
4. All entries persisted via Prisma `JournalEntry` (existing model)
5. AP subledger reconciliation check at period end
6. Period-end accrual generation (future enhancement)

---

## Phase 21C — Exception Management + Intelligence

> **Duration**: 2 weeks | **Depends on**: 21A (can parallel with 21B) | **Deliverable**: Exception UI, duplicate detection, analytics

### 21C.1 — Exception Queue UI (1 week)

Build the exception management interface.

#### Features

1. Exception list with filters (type, severity, vendor, age, SLA status)
2. Exception detail panel with invoice + PO + GRN context
3. Resolution actions: resolve (with reason), escalate, void, reassign
4. Batch resolution for same-type exceptions
5. SLA countdown timer with color coding (green → yellow → red)
6. Pattern detection: recurring exceptions by vendor/item flagged
7. Integration with `NotificationCenter` for SLA breach alerts

#### Page Structure

```
/procurement/exceptions          → Exception list with filters
/procurement/exceptions/[id]     → Exception detail + resolution actions
```

---

### 21C.2 — Duplicate Invoice Detection (3–5 days)

Build automated duplicate detection running on invoice capture.

#### Detection Layers

| Layer | Logic | Action |
|---|---|---|
| Exact match | Same `vendorId` + same `invoiceNumber` | **Block** — create exception |
| Fuzzy match | Same `vendorId` + amount ±1% + date ±7 days | **Flag** — create exception, allow override |
| Line-item match | Same vendor + same items + same amount within 30 days | **Flag** — create exception, allow override |

#### Override

- AP Manager can override flagged duplicates with a documented reason
- Blocked duplicates (exact match) cannot be overridden without Controller approval
- All overrides logged in `ProcurementAudit`

---

### 21C.3 — AP Analytics Dashboard (3–5 days)

Enhance existing analytics with actionable AP metrics.

#### Metrics

| Metric | Definition |
|---|---|
| DSO (Days Payable Outstanding) | Average days from invoice receipt to payment |
| Early-Pay Discount Capture Rate | % of available discounts actually taken |
| Exception Rate | % of invoices requiring manual intervention |
| Approval Cycle Time | Average time from invoice submission to approval |
| Payment Cycle Time | Average time from approval to payment execution |
| Vendor Payment Compliance | On-time payment rate |
| Top 10 Vendors by Spend | Trend over last 6 months |
| Aging Report | Current, 30, 60, 90, 120+ days buckets |

#### Persistence

All metrics computed from Prisma queries (not in-memory) so historical trending is possible.

---

## Phase 21D — Enterprise Hardening

> **Duration**: 1–2 weeks | **Depends on**: 21A + 21B.5 | **Deliverable**: Reconciliation, audit chain, payment safety, multi-currency

### 21D.1 — Vendor Statement Reconciliation (3-5 days)

Build periodic reconciliation workflow.

1. Vendor statement upload (CSV/PDF)
2. Auto-match statement lines to AP ledger (invoice#, amount, date)
3. Reconciliation report:
   - Matched lines
   - Unmatched on statement (not in ledger)
   - Unmatched in ledger (not on statement)
4. Adjustment entries for discrepancies
5. Reconciliation history per vendor
6. Controller approval required for adjustments >$500

---

### 21D.2 — AP Audit Chain (2-3 days)

Build complete audit trail UI.

1. Audit timeline for any invoice: capture → validate → match → approve → pay → post
2. Audit timeline for any vendor: onboard → approve → PO → invoice → payment
3. Audit timeline for any payment: proposal → approve → execute → confirm → post
4. Exportable audit reports (CSV)
5. Immutable: no edit/delete of audit records

---

### 21D.3 — Payment Safety (2-3 days)

Build payment safety controls.

1. Idempotency enforcement (duplicate payment block via `idempotencyKey` unique constraint)
2. Duplicate proposal detection (same batch proposed twice)
3. Amount threshold alerts (single payment >$100K)
4. Payment velocity alerts (>5 payments to same vendor in 1 day)
5. Bank confirmation timeout handling (auto-retry, manual intervention)
6. Payment reversal workflow (Controller only, creates offsetting entry)

---

### 21D.4 — Multi-Currency Support (2-3 days)

Handle foreign currency invoices.

1. Invoice currency field (default: company currency)
2. Exchange rate at invoice date (auto-fetch or manual entry)
3. Gain/loss calculation on payment (rate changed between invoice and payment)
4. Multi-currency reporting
5. Currency conversion uses `financial-precision.ts` (`multiplyDecimals`, `divideDecimals`)

---

## Effort Summary

| Phase | Duration | Deliverables | Dependencies |
|---|---|---|---|
| **21A — Foundation** | 3–4 weeks | Prisma models, repositories, API routes | None |
| **21B — Core Workflow** | 2–3 weeks | Service rewrites, 3-way match, approval, payment, GL | Phase 21A |
| **21C — Intelligence** | 2 weeks | Exception UI, duplicate detection, analytics | Phase 21A |
| **21D — Hardening** | 1–2 weeks | Reconciliation, audit chain, payment safety, multi-currency | Phase 21A + 21B.5 |
| **Total** | **8–11 weeks** | **Complete AP workflow** | |

**Parallelization**: 21C can start after 21A (doesn't need service rewrites). 21D can start after 21A + 21B.5 (needs GL wiring).

---

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| Prisma migration conflicts | Use additive-only migrations, never rename columns |
| Service rewrite regressions | Write integration tests before rewrite, run in parallel |
| In-memory seed data dependency | Create Prisma seed that replaces in-memory seed |
| UI form complexity | Use EnterpriseForm system (Phase 8B.6) for all new forms |
| Financial precision bugs | Use `financial-precision.ts` exclusively, add lint rule |
| Audit trail performance | Append-only Prisma model, no updates, proper indexing |
| Approval bypass | Segregation of duties enforced in service layer, not just UI |
| Double-payment | Idempotency key with unique constraint at DB level |
| Cross-tenant data leakage | `companyId` filter enforced in repository layer, tested |
| GL imbalance | Every entry validated: debits = credits before persist |

---

## Success Criteria

1. Every AP workflow stage has Prisma persistence
2. Every API route has Zod validation + tenant isolation + audit trail
3. Three-way match runs automatically on GRN/Invoice creation
4. Approval routing uses automation-studio approval matrix
5. Payment proposals are batch-optimized
6. Exception queue has resolution workflow
7. Duplicate detection blocks fraudulent invoices
8. GL posting is automated on payment confirmation
9. Audit trail is complete and immutable
10. All monetary values use Decimal, never native number
11. `pnpm typecheck` passes
12. `pnpm build` passes

---

## Integration Points

| Existing Component | Integration | Phase |
|---|---|---|
| `InvoiceMatchingService` (126 lines) | Rewrite to use PrismaInvoiceRepository, configurable tolerances | 21B.2 |
| `GLIntegrationService` | Wire to Prisma `JournalEntry`, call on payment confirmation | 21B.5 |
| `ApprovalsService` | Rewrite with `ApprovalMatrixEvaluator` integration, delegation, SLA | 21B.3 |
| `ApprovalMatrixEvaluator` (automation-studio) | Call `evaluate()` for threshold routing | 21B.3 |
| `ConditionEvaluator` (automation-studio) | Available for complex approval conditions | 21B.3 |
| `financial-precision.ts` | Use `financialRound`, `sumDecimals`, `multiplyDecimals`, `allocateAmount` | All phases |
| `recordAudit()` (audit system) | Call on every mutation | All phases |
| `requireTenantContext()` | Call in every route handler | 21A.3 |
| `rateLimit()` (proxy) | Apply to mutation endpoints | 21A.3 |
| `NotificationService` | Send SLA breach and exception alerts | 21B.2, 21C.1 |
| `EnterpriseForm` (8B.6) | Use for all new AP forms | 21C.1 |

---

## Prisma Schema

See [21A.1](#21a1--prisma-models-1-week) for complete field definitions.

**Enums**:
```
VendorStatus:     ACTIVE | INACTIVE | SUSPENDED | PENDING_APPROVAL
PRStatus:         DRAFT | SUBMITTED | APPROVED | REJECTED | CONVERTED_TO_PO
PRPriority:       LOW | NORMAL | HIGH | URGENT
POStatus:         DRAFT | SUBMITTED | APPROVED | SENT | RECEIVED | CLOSED | CANCELLED
GRNStatus:        RECEIVED | INSPECTED | ACCEPTED | REJECTED
InvoiceStatus:    DRAFT | SUBMITTED | APPROVED | REJECTED | PAID | VOIDED
MatchStatus:      UNMATCHED | MATCHED | PARTIALLY_MATCHED | EXCEPTION | OVERRIDE
PaymentMethod:    BANK_TRANSFER | CHECK | WIRE | ACH
PaymentStatus:    PENDING | APPROVED | EXECUTING | COMPLETED | FAILED | CANCELLED
ProposalStatus:   DRAFT | SUBMITTED | APPROVED | REJECTED | EXECUTED
ExceptionType:    PRICE_VARIANCE | QUANTITY_VARIANCE | DUPLICATE_INVOICE | MISSING_RECEIPT | MATCH_FAILURE | APPROVAL_TIMEOUT | PAYMENT_FAILED | BUDGET_EXCEEDED
ExceptionSeverity: LOW | MEDIUM | HIGH | CRITICAL
ExceptionStatus:  OPEN | IN_PROGRESS | RESOLVED | ESCALATED | VOIDED
```

**Indexes** (per model):
- `ProcurementVendor`: `(companyId, status)`, `(companyId, code)`
- `ProcurementPR`: `(companyId, status)`, `(companyId, requestedBy)`
- `ProcurementPO`: `(companyId, status)`, `(companyId, vendorId)`, `(companyId, poNumber)`
- `ProcurementGRN`: `(companyId, poId)`
- `ProcurementInvoice`: `(companyId, vendorId, invoiceNumber)` unique, `(companyId, status)`, `(companyId, dueDate)`
- `ProcurementPayment`: `(companyId, invoiceId)`, `(companyId, status)`, `(idempotencyKey)` unique
- `ProcurementException`: `(companyId, status)`, `(companyId, type)`, `(companyId, assignedTo)`
- `ProcurementAudit`: `(companyId, entityType, entityId)`, `(companyId, createdAt)`

---

*End of Phase 21.0 — Accounts Payable Implementation Plan*
