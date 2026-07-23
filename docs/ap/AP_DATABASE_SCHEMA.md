# Phase 21A.1 — Accounts Payable Database Schema

> **Status**: Complete
> **Type**: Documentation — Prisma schema design for AP bounded context
> **Date**: July 21, 2026
> **Scope**: 25 Prisma models, ~30 enums, ~50 indexes, ~19 unique constraints, ~40 foreign keys
> **Predecessor**: AP_DOMAIN_MODEL.md, AP_AGGREGATES.md, AP_COMMAND_QUERY_MODEL.md
> **Migration**: `20260721120000_ap_procurement_models`

---

## Table of Contents

1. [Schema Overview](#1-schema-overview)
2. [Model Inventory](#2-model-inventory)
3. [Enum Types](#3-enum-types)
4. [Data Types Reference](#4-data-types-reference)
5. [Complete Prisma Schema](#5-complete-prisma-schema)
6. [Tenant Isolation Pattern](#6-tenant-isolation-pattern)
7. [Cascade Delete Rules](#7-cascade-delete-rules)
8. [Unique Constraints](#8-unique-constraints)
9. [Index Strategy](#9-index-strategy)
10. [Financial Precision Rules](#10-financial-precision-rules)
11. [Concurrency Control](#11-concurrency-control)
12. [Migration Strategy](#12-migration-strategy)
13. [Service Layer Query Patterns](#13-service-layer-query-patterns)

---

## 1. Schema Overview

| Property | Value |
|---|---|
| **Total AP models** | 25 |
| **Naming convention** | `Procurement` prefix (avoids collision with 349 existing models) |
| **Database** | PostgreSQL (same instance as all other modules) |
| **Schema location** | `prisma/schema.prisma` — appended to existing 9,764-line schema |
| **ORM** | Prisma with `@prisma/client` |
| **Primary key pattern** | `String @id @default(cuid())` — CUID2 for URL-safe, sortable IDs |
| **Multi-tenancy** | `companyId String` + Company relation on every model |
| **Timestamps** | `createdAt DateTime @default(now())` + `updatedAt DateTime @updatedAt` |
| **Monetary precision** | `Decimal @db.Decimal(38,12)` for all money fields — zero exceptions |
| **Soft deletes** | None — hard deletes with append-only `APAuditRecord` trail |
| **Concurrency** | Optimistic via `version Int @default(0)` on aggregate roots |

### Module Location

```
prisma/schema.prisma                    ← 25 models appended
src/server/procurement/                 ← service layer (Phase 21A.2)
src/app/api/procurement/                ← API routes (Phase 21A.3)
docs/ap/AP_DATABASE_SCHEMA.md           ← this document
```

### Relationship to Existing Schema

The AP models reference two existing models:
- **`Company`** — multi-tenant owner (every AP model has `companyId` FK)
- **`User`** — audit actor (`createdBy`, `updatedBy`, `approvedBy`, etc.)

All other references (GL Account, Cost Center, Department, Project) use `String?` fields — these are ID-only references to entities owned by other bounded contexts. AP never joins to or mutates those entities directly.

---

## 2. Model Inventory

| # | Model Name | Purpose | Est. Records | Mutable | Version |
|---|---|---|---|---|---|
| 1 | `ProcurementVendor` | Vendor master data — lifecycle, risk, credit limit | 100–10K | Yes | Yes |
| 2 | `ProcurementVendorBankDetail` | Encrypted bank account details (PCI-DSS scope) | 100–20K | Yes | No |
| 3 | `ProcurementVendorPerformance` | Periodic vendor performance scores (immutable) | 500–50K | No | No |
| 4 | `ProcurementVendorDocument` | Compliance docs — W-9, insurance, contracts | 500–30K | Yes | No |
| 5 | `ProcurementVendorCredit` | Vendor credit notes — applied to invoices | 200–10K | Yes | Yes |
| 6 | `ProcurementPOReference` | Read-only PO snapshot for 3-way matching | 1K–100K | Partial | No |
| 7 | `ProcurementPOReferenceLineItem` | PO line-level detail for matching | 5K–500K | Partial | No |
| 8 | `ProcurementGRNReference` | Read-only GRN snapshot for 3-way matching | 1K–100K | Partial | No |
| 9 | `ProcurementGRNReferenceLineItem` | GRN line-level detail for matching | 5K–500K | Partial | No |
| 10 | `ProcurementVendorInvoice` | **Core entity** — invoice lifecycle, amounts, status | 5K–500K | Yes | Yes |
| 11 | `ProcurementInvoiceLineItem` | Invoice line items with GL coding and tax | 25K–2.5M | Yes | No |
| 12 | `ProcurementInvoiceAttachment` | Scanned PDFs, emails, supporting docs | 10K–500K | No | No |
| 13 | `ProcurementThreeWayMatch` | 3-way match result (PO↔GRN↔Invoice) | 5K–500K | Yes | Yes |
| 14 | `ProcurementMatchLineItem` | Per-line match result with variances | 25K–2.5M | Yes | No |
| 15 | `ProcurementInvoiceException` | Exceptions requiring manual resolution | 1K–100K | Yes | Yes |
| 16 | `ProcurementApprovalRecord` | AP-specific approval chain decisions | 10K–1M | Yes | Yes |
| 17 | `ProcurementApprovalLevel` | Approval authority level configuration | 20–100 | Yes | No |
| 18 | `ProcurementPaymentProposal` | Batch payment planning — grouping approved invoices | 500–50K | Yes | Yes |
| 19 | `ProcurementPaymentProposalItem` | Individual invoice entries in a proposal | 5K–500K | Yes | No |
| 20 | `ProcurementPaymentBatch` | Payment execution — bank file generation | 500–50K | Yes | Yes |
| 21 | `ProcurementPaymentRecord` | Immutable payment records — one per invoice per batch | 5K–500K | Yes | Yes |
| 22 | `ProcurementVendorStatement` | Vendor periodic statement for reconciliation | 1K–50K | Yes | Yes |
| 23 | `ProcurementVendorStatementLine` | Parsed statement line items | 10K–500K | Yes | No |
| 24 | `ProcurementReconciliationResult` | Reconciliation outcome per vendor statement | 1K–50K | Yes | Yes |
| 25 | `ProcurementAPAuditRecord` | Append-only audit trail for all AP actions | 50K–5M | No | No |

**Aggregate roots** (have `version` field for optimistic concurrency): 12
**Child entities** (owned by aggregate root, cascade delete): 9
**Reference entities** (read-only snapshots from other contexts): 4
**Immutable entities** (append-only, no UPDATE): 2

---

## 3. Enum Types

### 3.1 Vendor Enums

```prisma
enum ProcurementVendorStatus {
  PENDING_REVIEW
  ACTIVE
  SUSPENDED
  DEACTIVATED
}

enum ProcurementVendorRiskLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum ProcurementVendorCategory {
  SUPPLIER
  CONTRACTOR
  CONSULTANT
  SERVICE_PROVIDER
  DISTRIBUTOR
  MANUFACTURER
}

enum ProcurementPaymentMethod {
  ACH
  WIRE
  CHECK
  EFT
  VIRTUAL_CARD
}
```

### 3.2 Invoice Enums

```prisma
enum ProcurementInvoiceStatus {
  DRAFT
  CAPTURED
  VALIDATING
  VALIDATED
  THREE_WAY_MATCHING
  MATCHED
  MATCH_FAILED
  EXCEPTION
  PENDING_APPROVAL
  APPROVED
  REJECTED
  PARTIALLY_PAID
  PAID
  VOIDED
}

enum ProcurementInvoiceSource {
  EMAIL
  SCAN
  EDI
  PORTAL
  MANUAL
  API
}

enum ProcurementMatchResult {
  MATCHED
  VARIANCE
  NO_PO
  PARTIAL_MATCH
}

enum ProcurementAccountType {
  CHECKING
  SAVINGS
}
```

### 3.3 Line Item Enums

```prisma
enum ProcurementTaxType {
  VAT
  GST
  SALES_TAX
  WITHHOLDING
  EXEMPT
}

enum ProcurementLineMatchStatus {
  MATCHED
  VARIANCE
  UNMATCHED
}
```

### 3.4 Matching Enums

```prisma
enum ProcurementThreeWayMatchResult {
  FULL_MATCH
  PARTIAL_MATCH
  PRICE_VARIANCE
  QTY_VARIANCE
  NO_MATCH
}

enum ProcurementMatchLineStatus {
  EXACT_MATCH
  PRICE_VARIANCE
  QTY_VARIANCE
  NO_MATCH
}
```

### 3.5 Exception Enums

```prisma
enum ProcurementExceptionType {
  PRICE_VARIANCE
  QTY_VARIANCE
  NO_PO
  DUPLICATE
  MISSING_GRN
  GL_CODING_REQUIRED
  APPROVAL_REQUIRED
  TAX_MISMATCH
  CREDIT_NOTE_REQUIRED
}

enum ProcurementExceptionSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum ProcurementExceptionStatus {
  OPEN
  IN_REVIEW
  RESOLVED
  WAIVED
  ESCALATED
}
```

### 3.6 Approval Enums

```prisma
enum ProcurementApprovalStatus {
  PENDING
  APPROVED
  REJECTED
  DELEGATED
  SKIPPED
}

enum ProcurementApprovalDecision {
  APPROVE
  REJECT
  REQUEST_INFO
  DELEGATE
}
```

### 3.7 Payment Enums

```prisma
enum ProcurementProposalStatus {
  DRAFT
  SUBMITTED
  REVIEWED
  APPROVED
  REJECTED
  EXECUTED
  CANCELLED
}

enum ProcurementProposalItemSelection {
  AUTO
  MANUAL
  DISCOUNT_OPTIMIZED
}

enum ProcurementBatchStatus {
  PENDING
  GENERATING
  READY
  SUBMITTED
  COMPLETED
  FAILED
  CANCELLED
}

enum ProcurementPaymentStatus {
  PROCESSED
  CLEARED
  VOIDED
  FAILED
  REVERSED
}
```

### 3.8 Reference Enums

```prisma
enum ProcurementPOStatus {
  DRAFT
  SUBMITTED
  APPROVED
  PARTIALLY_RECEIVED
  FULLY_RECEIVED
  CANCELLED
}

enum ProcurementPOLineStatus {
  PENDING
  PARTIALLY_RECEIVED
  FULLY_RECEIVED
  CLOSED
}

enum ProcurementGRNStatus {
  RECEIVED
  INSPECTED
  ACCEPTED
  REJECTED
  PARTIAL
}

enum ProcurementGRNLineCondition {
  GOOD
  DAMAGED
  DEFECTIVE
  MIXED
}
```

### 3.9 Statement & Reconciliation Enums

```prisma
enum ProcurementStatementStatus {
  RECEIVED
  PARSING
  PARSED
  RECONCILING
  RECONCILED
  EXCEPTION
}

enum ProcurementStatementLineType {
  INVOICE
  PAYMENT
  CREDIT
  ADJUSTMENT
  FEE
}

enum ProcurementStatementMatchStatus {
  UNMATCHED
  MATCHED
  PARTIAL
  EXCEPTION
}

enum ProcurementReconciliationStatus {
  IN_PROGRESS
  COMPLETED
  EXCEPTION
  ADJUSTED
}
```

### 3.10 Document & Audit Enums

```prisma
enum ProcurementDocumentStatus {
  VALID
  EXPIRED
  PENDING
}

enum ProcurementAttachmentCategory {
  INVOICE_COPY
  SUPPORTING_DOC
  CONTRACT
  EMAIL_THREAD
  RECEIPT
  DELIVERY_NOTE
}

enum ProcurementAuditAction {
  CREATED
  UPDATED
  STATUS_CHANGED
  APPROVED
  REJECTED
  VOIDED
  PAID
  EXCEPTION
  RESOLVED
  DELEGATED
  ESCALATED
  CONFIG_CHANGED
}
```

---

## 4. Data Types Reference

### 4.1 Domain → Prisma Type Mapping

| Domain Type | Prisma Type | Example | Precision | Notes |
|---|---|---|---|---|
| `id: string` | `String @id @default(cuid())` | `"clx1a2b3c..."` | — | CUID2 |
| `companyId: string` | `String` | `"comp_abc"` | — | FK to Company |
| `amount` | `Decimal @db.Decimal(38,12)` | `1234567.890123456789` | 38 digits, 12 decimal | Money — all monetary values |
| `quantity` | `Decimal @db.Decimal(20,4)` | `100.5000` | 20 digits, 4 decimal | Item quantities |
| `percentage` | `Decimal @db.Decimal(5,2)` | `85.50` | 5 digits, 2 decimal | Scores, discount % |
| `taxRate` | `Decimal @db.Decimal(5,4)` | `0.0750` | 5 digits, 4 decimal | 7.5% expressed as decimal |
| `exchangeRate` | `Decimal @db.Decimal(20,8)` | `1.23456789` | 20 digits, 8 decimal | FX conversion rate |
| `rating` | `Decimal @db.Decimal(3,1)` | `4.5` | 3 digits, 1 decimal | Vendor rating 0–5 |
| `confidence` | `Decimal @db.Decimal(5,2)` | `95.00` | 5 digits, 2 decimal | Match/OCR confidence |
| `status: enum` | Prisma enum (backed by String) | `"ACTIVE"` | — | Enum type defined in schema |
| `date` | `DateTime` | `2026-07-21T00:00:00Z` | — | UTC midnight |
| `timestamp` | `DateTime @default(now())` | `2026-07-21T14:30:00Z` | — | Server timestamp |
| `boolean` | `Boolean @default(false)` | `true` | — | Flags |
| `metadata` | `Json?` | `{"key": "value"}` | — | Flexible JSON payload |
| `tags` | `String[] @default([])` | `["urgent", "review"]` | — | String array |
| `version` | `Int @default(0)` | `0` | — | Optimistic concurrency |
| `lineNumber` | `Int` | `1` | — | Sequence number |
| `retryCount` | `Int @default(0)` | `0` | — | Retry counter |

### 4.2 Decimal Precision Summary

| Precision | Scale | Used For | Field Examples |
|---|---|---|---|
| `Decimal(38,12)` | 12 | Monetary amounts | `totalAmount`, `subtotal`, `taxAmount`, `balanceDue`, `creditLimit`, `priceVariance` |
| `Decimal(20,4)` | 4 | Quantities | `quantity`, `quantityReceived`, `quantityAccepted`, `quantityVariance` |
| `Decimal(20,8)` | 8 | Exchange rates | `exchangeRate` |
| `Decimal(5,4)` | 4 | Tax rates (as decimal) | `taxRate` |
| `Decimal(5,2)` | 2 | Percentages/scores | `overallScore`, `variancePercent`, `confidence`, `discountPercent` |
| `Decimal(3,1)` | 1 | Ratings | `rating` |

---

## 5. Complete Prisma Schema

> **Note**: This is the complete AP schema block to be appended to `prisma/schema.prisma`.
> Each model includes comments for auditability. The migration will create all tables in a single transaction.

```prisma
// ---------------------------------------------------------------------------
// Accounts Payable — Procurement Models (Phase 21A.1)
// 25 models · ~30 enums · ~50 indexes · ~19 unique constraints
// Migration: 20260721120000_ap_procurement_models
// ---------------------------------------------------------------------------

// ─── Enums ──────────────────────────────────────────────────────────────────

enum ProcurementVendorStatus {
  PENDING_REVIEW
  ACTIVE
  SUSPENDED
  DEACTIVATED
}

enum ProcurementVendorRiskLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum ProcurementVendorCategory {
  SUPPLIER
  CONTRACTOR
  CONSULTANT
  SERVICE_PROVIDER
  DISTRIBUTOR
  MANUFACTURER
}

enum ProcurementPaymentMethod {
  ACH
  WIRE
  CHECK
  EFT
  VIRTUAL_CARD
}

enum ProcurementAccountType {
  CHECKING
  SAVINGS
}

enum ProcurementInvoiceStatus {
  DRAFT
  CAPTURED
  VALIDATING
  VALIDATED
  THREE_WAY_MATCHING
  MATCHED
  MATCH_FAILED
  EXCEPTION
  PENDING_APPROVAL
  APPROVED
  REJECTED
  PARTIALLY_PAID
  PAID
  VOIDED
}

enum ProcurementInvoiceSource {
  EMAIL
  SCAN
  EDI
  PORTAL
  MANUAL
  API
}

enum ProcurementMatchResult {
  MATCHED
  VARIANCE
  NO_PO
  PARTIAL_MATCH
}

enum ProcurementTaxType {
  VAT
  GST
  SALES_TAX
  WITHHOLDING
  EXEMPT
}

enum ProcurementLineMatchStatus {
  MATCHED
  VARIANCE
  UNMATCHED
}

enum ProcurementThreeWayMatchResult {
  FULL_MATCH
  PARTIAL_MATCH
  PRICE_VARIANCE
  QTY_VARIANCE
  NO_MATCH
}

enum ProcurementMatchLineStatus {
  EXACT_MATCH
  PRICE_VARIANCE
  QTY_VARIANCE
  NO_MATCH
}

enum ProcurementExceptionType {
  PRICE_VARIANCE
  QTY_VARIANCE
  NO_PO
  DUPLICATE
  MISSING_GRN
  GL_CODING_REQUIRED
  APPROVAL_REQUIRED
  TAX_MISMATCH
  CREDIT_NOTE_REQUIRED
}

enum ProcurementExceptionSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum ProcurementExceptionStatus {
  OPEN
  IN_REVIEW
  RESOLVED
  WAIVED
  ESCALATED
}

enum ProcurementApprovalStatus {
  PENDING
  APPROVED
  REJECTED
  DELEGATED
  SKIPPED
}

enum ProcurementApprovalDecision {
  APPROVE
  REJECT
  REQUEST_INFO
  DELEGATE
}

enum ProcurementProposalStatus {
  DRAFT
  SUBMITTED
  REVIEWED
  APPROVED
  REJECTED
  EXECUTED
  CANCELLED
}

enum ProcurementProposalItemSelection {
  AUTO
  MANUAL
  DISCOUNT_OPTIMIZED
}

enum ProcurementBatchStatus {
  PENDING
  GENERATING
  READY
  SUBMITTED
  COMPLETED
  FAILED
  CANCELLED
}

enum ProcurementPaymentStatus {
  PROCESSED
  CLEARED
  VOIDED
  FAILED
  REVERSED
}

enum ProcurementPOStatus {
  DRAFT
  SUBMITTED
  APPROVED
  PARTIALLY_RECEIVED
  FULLY_RECEIVED
  CANCELLED
}

enum ProcurementPOLineStatus {
  PENDING
  PARTIALLY_RECEIVED
  FULLY_RECEIVED
  CLOSED
}

enum ProcurementGRNStatus {
  RECEIVED
  INSPECTED
  ACCEPTED
  REJECTED
  PARTIAL
}

enum ProcurementGRNLineCondition {
  GOOD
  DAMAGED
  DEFECTIVE
  MIXED
}

enum ProcurementDocumentStatus {
  VALID
  EXPIRED
  PENDING
}

enum ProcurementAttachmentCategory {
  INVOICE_COPY
  SUPPORTING_DOC
  CONTRACT
  EMAIL_THREAD
  RECEIPT
  DELIVERY_NOTE
}

enum ProcurementStatementStatus {
  RECEIVED
  PARSING
  PARSED
  RECONCILING
  RECONCILED
  EXCEPTION
}

enum ProcurementStatementLineType {
  INVOICE
  PAYMENT
  CREDIT
  ADJUSTMENT
  FEE
}

enum ProcurementStatementMatchStatus {
  UNMATCHED
  MATCHED
  PARTIAL
  EXCEPTION
}

enum ProcurementReconciliationStatus {
  IN_PROGRESS
  COMPLETED
  EXCEPTION
  ADJUSTED
}

enum ProcurementCreditStatus {
  ISSUED
  PARTIALLY_APPLIED
  FULLY_APPLIED
  EXPIRED
}

enum ProcurementAuditAction {
  CREATED
  UPDATED
  STATUS_CHANGED
  APPROVED
  REJECTED
  VOIDED
  PAID
  EXCEPTION
  RESOLVED
  DELEGATED
  ESCALATED
  CONFIG_CHANGED
}

// ─── Models ─────────────────────────────────────────────────────────────────

// ── 1. Vendor ───────────────────────────────────────────────────────────────

model ProcurementVendor {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)

  // Identity
  vendorCode            String
  name                  String
  legalName             String
  status                ProcurementVendorStatus @default(PENDING_REVIEW)
  riskLevel             ProcurementVendorRiskLevel @default(LOW)
  riskScore             Decimal @db.Decimal(5,2) @default(0)
  category              ProcurementVendorCategory

  // Tax
  taxId                 String
  taxCountry            String

  // Financial
  currency              String                      @default("USD")
  creditLimit           Decimal @db.Decimal(38,12)  @default(0)
  totalSpend            Decimal @db.Decimal(38,12)  @default(0)
  totalOrders           Int                         @default(0)
  avgPaymentDays        Int                         @default(0)

  // Contact
  contactName           String?
  contactEmail          String?
  contactPhone          String?

  // Address
  billingAddress        String?
  shippingAddress       String?

  // Configuration
  paymentTerms          String                      @default("NET30")
  preferredPaymentMethod ProcurementPaymentMethod   @default(ACH)
  bankAccountId         String?

  // Preference
  preferred             Boolean                     @default(false)
  preferredRank         Int?
  isBlocked             Boolean                     @default(false)
  blockReason           String?
  rating                Decimal @db.Decimal(3,1)    @default(0)

  // Concurrency
  version               Int                         @default(0)

  // Metadata
  tags                  String[]
  onboardingDate        DateTime
  lastOrderDate         DateTime?

  // Audit
  createdBy             String
  updatedBy             String
  createdAt             DateTime                    @default(now())
  updatedAt             DateTime                    @updatedAt

  // Relations — children (cascade delete)
  bankDetails           ProcurementVendorBankDetail[]
  performanceRecords    ProcurementVendorPerformance[]
  documents             ProcurementVendorDocument[]

  // Relations — referenced by (restrict delete)
  credits               ProcurementVendorCredit[]
  invoices              ProcurementVendorInvoice[]
  poReferences          ProcurementPOReference[]
  grnReferences         ProcurementGRNReference[]
  statements            ProcurementVendorStatement[]
  reconciliationResults ProcurementReconciliationResult[]
  matchLineItems        ProcurementMatchLineItem[]
  approvalRecords       ProcurementApprovalRecord[]
  proposalItems         ProcurementPaymentProposalItem[]
  paymentRecords        ProcurementPaymentRecord[]

  @@unique([companyId, vendorCode])
  @@unique([companyId, taxId])
  @@index([companyId])
  @@index([companyId, status])
  @@index([companyId, category])
  @@index([companyId, riskLevel])
}

// ── 2. VendorBankDetail ─────────────────────────────────────────────────────

model ProcurementVendorBankDetail {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  vendorId  String
  vendor    ProcurementVendor @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  // Bank info (routingNumber and accountNumber encrypted at rest via application layer)
  bankName        String
  bankCountry     String
  routingNumber   String
  accountNumber   String
  accountHolderName String
  accountType     ProcurementAccountType
  isPrimary       Boolean  @default(false)
  isActive        Boolean  @default(true)

  // Verification
  verifiedAt      DateTime?
  verifiedBy      String?

  // Audit
  createdBy       String
  updatedBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([companyId])
  @@index([vendorId])
}

// ── 3. VendorPerformance ────────────────────────────────────────────────────

model ProcurementVendorPerformance {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  vendorId  String
  vendor    ProcurementVendor @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  // Period (YYYY-Q[N] or YYYY-MM)
  period            String

  // Scores (0–100)
  onTimeDelivery    Decimal @db.Decimal(5,2) @default(0)
  qualityScore      Decimal @db.Decimal(5,2) @default(0)
  responseTime      Decimal @db.Decimal(5,2) @default(0)
  invoiceAccuracy   Decimal @db.Decimal(5,2) @default(0)
  returnRate        Decimal @db.Decimal(5,2) @default(0)
  overallScore      Decimal @db.Decimal(5,2) @default(0)

  // Aggregates
  totalOrders       Int                      @default(0)
  totalAmount       Decimal @db.Decimal(38,12) @default(0)

  // Immutable — no updatedAt
  createdAt         DateTime @default(now())

  @@unique([companyId, vendorId, period])
  @@index([companyId])
  @@index([vendorId])
}

// ── 4. VendorDocument ───────────────────────────────────────────────────────

model ProcurementVendorDocument {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  vendorId  String
  vendor    ProcurementVendor @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  type          String
  name          String
  reference     String?
  expiryDate    DateTime?
  status        ProcurementDocumentStatus @default(VALID)
  fileUrl       String?

  // Audit
  createdBy     String
  updatedBy     String
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([companyId])
  @@index([vendorId])
}

// ── 5. VendorCredit ─────────────────────────────────────────────────────────

model ProcurementVendorCredit {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  vendorId  String
  vendor    ProcurementVendor @relation(fields: [vendorId], references: [id], onDelete: Restrict)

  creditNumber    String
  creditDate      DateTime
  creditAmount    Decimal @db.Decimal(38,12)
  appliedAmount   Decimal @db.Decimal(38,12) @default(0)
  remainingAmount Decimal @db.Decimal(38,12) // derived: creditAmount - appliedAmount
  currency        String
  status          ProcurementCreditStatus @default(ISSUED)
  appliedToInvoiceId String?
  vendorInvoice   ProcurementVendorInvoice? @relation(fields: [appliedToInvoiceId], references: [id], onDelete: Restrict)
  expiryDate      DateTime?
  reason          String?

  // Concurrency
  version         Int @default(0)

  // Audit
  createdBy       String
  updatedBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([companyId, vendorId, creditNumber])
  @@index([companyId])
  @@index([vendorId])
  @@index([companyId, vendorId])
  @@index([companyId, status])
}

// ── 6. POReference ──────────────────────────────────────────────────────────

model ProcurementPOReference {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  vendorId  String
  vendor    ProcurementVendor @relation(fields: [vendorId], references: [id], onDelete: Restrict)

  poNumber              String
  poId                  String
  status                ProcurementPOStatus
  orderDate             DateTime
  expectedDeliveryDate  DateTime?
  currency              String                      @default("USD")
  totalAmount           Decimal @db.Decimal(38,12)
  receivedAmount        Decimal @db.Decimal(38,12)  @default(0)
  taxAmount             Decimal @db.Decimal(38,12)  @default(0)
  shippingAmount        Decimal @db.Decimal(38,12)  @default(0)
  paymentTerms          String?
  requestedBy           String
  approvedBy            String?
  approvalDate          DateTime?
  syncedAt              DateTime

  // Audit
  createdBy       String
  updatedBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations — children
  lineItems             ProcurementPOReferenceLineItem[]
  grnReferences         ProcurementGRNReference[]
  threeWayMatches       ProcurementThreeWayMatch[]

  @@unique([companyId, poNumber])
  @@index([companyId])
  @@index([vendorId])
  @@index([companyId, status])
}

// ── 7. POReferenceLineItem ──────────────────────────────────────────────────

model ProcurementPOReferenceLineItem {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  poReferenceId String
  poReference   ProcurementPOReference @relation(fields: [poReferenceId], references: [id], onDelete: Cascade)

  lineNumber        Int
  description       String
  quantity          Decimal @db.Decimal(20,4)
  unitOfMeasure     String
  unitPrice         Decimal @db.Decimal(38,12)
  lineTotal         Decimal @db.Decimal(38,12) // derived: quantity × unitPrice
  taxRate           Decimal @db.Decimal(5,4)   @default(0)
  taxAmount         Decimal @db.Decimal(38,12) @default(0)
  glAccountId       String?
  costCenterId      String?
  receivedQuantity  Decimal @db.Decimal(20,4)  @default(0)
  invoicedQuantity  Decimal @db.Decimal(20,4)  @default(0)
  status            ProcurementPOLineStatus    @default(PENDING)

  // Audit
  createdBy       String
  updatedBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations — referenced by
  grnLineItems    ProcurementGRNReferenceLineItem[]
  matchLineItems  ProcurementMatchLineItem[]
  invoiceLineItems ProcurementInvoiceLineItem[]

  @@unique([companyId, poReferenceId, lineNumber])
  @@index([companyId])
  @@index([poReferenceId])
}

// ── 8. GRNReference ─────────────────────────────────────────────────────────

model ProcurementGRNReference {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  poReferenceId String
  poReference   ProcurementPOReference @relation(fields: [poReferenceId], references: [id], onDelete: Restrict)
  vendorId  String
  vendor    ProcurementVendor @relation(fields: [vendorId], references: [id], onDelete: Restrict)

  grnNumber           String
  grnId               String
  receiptDate         DateTime
  status              ProcurementGRNStatus @default(RECEIVED)
  receivedBy          String
  warehouseLocation   String?
  totalValue          Decimal @db.Decimal(38,12)
  totalTax            Decimal @db.Decimal(38,12) @default(0)
  inspectionNotes     String?
  syncedAt            DateTime

  // Audit
  createdBy       String
  updatedBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations — children
  lineItems           ProcurementGRNReferenceLineItem[]
  threeWayMatches     ProcurementThreeWayMatch[]

  @@unique([companyId, grnNumber])
  @@index([companyId])
  @@index([poReferenceId])
  @@index([vendorId])
}

// ── 9. GRNReferenceLineItem ─────────────────────────────────────────────────

model ProcurementGRNReferenceLineItem {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  grnReferenceId  String
  grnReference    ProcurementGRNReference @relation(fields: [grnReferenceId], references: [id], onDelete: Cascade)
  poReferenceLineItemId String?
  poReferenceLineItem   ProcurementPOReferenceLineItem? @relation(fields: [poReferenceLineItemId], references: [id], onDelete: Restrict)

  lineNumber        Int
  description       String
  quantityReceived  Decimal @db.Decimal(20,4)
  quantityAccepted  Decimal @db.Decimal(20,4)
  quantityRejected  Decimal @db.Decimal(20,4) @default(0)
  unitOfMeasure     String
  unitPrice         Decimal @db.Decimal(38,12)
  lineTotal         Decimal @db.Decimal(38,12) // derived: quantityAccepted × unitPrice
  condition         ProcurementGRNLineCondition @default(GOOD)

  // Audit
  createdBy       String
  updatedBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations — referenced by
  matchLineItems  ProcurementMatchLineItem[]

  @@unique([companyId, grnReferenceId, lineNumber])
  @@index([companyId])
  @@index([grnReferenceId])
}

// ── 10. VendorInvoice (CORE ENTITY) ─────────────────────────────────────────

model ProcurementVendorInvoice {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  vendorId  String
  vendor    ProcurementVendor @relation(fields: [vendorId], references: [id], onDelete: Restrict)

  // Invoice identity
  invoiceNumber   String
  invoiceDate     DateTime
  dueDate         DateTime
  receivedDate    DateTime @default(now())

  // Status
  status              ProcurementInvoiceStatus @default(DRAFT)
  previousStatus      ProcurementInvoiceStatus?
  statusChangedAt     DateTime?

  // PO / GRN references (for 3-way match)
  poReferenceId       String?
  poReference         ProcurementPOReference? @relation(fields: [poReferenceId], references: [id], onDelete: Restrict)
  grnReferenceId      String?
  grnReference        ProcurementGRNReference? @relation(fields: [grnReferenceId], references: [id], onDelete: Restrict)

  // Currency
  currency            String                      @default("USD")
  exchangeRate        Decimal @db.Decimal(20,8)   @default(1.00000000)
  baseCurrency        String                      @default("USD")

  // Financials
  subtotal            Decimal @db.Decimal(38,12)
  taxAmount           Decimal @db.Decimal(38,12)  @default(0)
  discountAmount      Decimal @db.Decimal(38,12)  @default(0)
  shippingAmount      Decimal @db.Decimal(38,12)  @default(0)
  totalAmount         Decimal @db.Decimal(38,12)  // derived
  totalWithTax        Decimal @db.Decimal(38,12)  // derived
  amountPaid          Decimal @db.Decimal(38,12)  @default(0)
  balanceDue          Decimal @db.Decimal(38,12)  // derived
  creditApplied      Decimal @db.Decimal(38,12)  @default(0)
  netBalance          Decimal @db.Decimal(38,12)  // derived

  // Payment terms
  paymentTerms        String?
  paymentMethod       ProcurementPaymentMethod?

  // GL coding
  glAccountId         String?
  costCenterId        String?
  departmentId        String?
  projectId           String?

  // Notes
  description         String?
  vendorMemo          String?
  internalMemo        String?

  // OCR
  ocrConfidence       Decimal @db.Decimal(5,2)?
  ocrRawText          String?

  // Duplicate detection
  isDuplicateSuspicion  Boolean                   @default(false)
  duplicateConfidence   Decimal @db.Decimal(5,2)?
  duplicateOfInvoiceId  String?

  // Match
  matchResult         ProcurementMatchResult?
  varianceAmount      Decimal @db.Decimal(38,12)  @default(0)
  varianceThreshold   Decimal @db.Decimal(5,2)    @default(5.00)

  // Approval
  approvalRequired    Boolean                     @default(false)
  approvedAt          DateTime?
  approvedBy          String?
  rejectedAt          DateTime?
  rejectedBy          String?
  rejectionReason     String?

  // Payment tracking
  paymentBatchId      String?
  paymentProposalId   String?
  paymentDate         DateTime?
  paymentReference    String?
  checkNumber         String?

  // GL posting
  accrualPosted       Boolean                     @default(false)
  accrualReversed     Boolean                     @default(false)
  glPosted            Boolean                     @default(false)
  glPostedAt          DateTime?
  periodId            String?

  // Idempotency
  idempotencyKey      String?                     @unique

  // Source
  source              ProcurementInvoiceSource    @default(MANUAL)

  // Concurrency
  version             Int                         @default(0)

  // Audit
  createdBy           String
  updatedBy           String
  createdAt           DateTime                    @default(now())
  updatedAt           DateTime                    @updatedAt

  // Relations — children (cascade delete)
  lineItems           ProcurementInvoiceLineItem[]
  attachments         ProcurementInvoiceAttachment[]

  // Relations — referenced by (restrict delete)
  threeWayMatch       ProcurementThreeWayMatch?
  exceptions          ProcurementInvoiceException[]
  approvalRecords     ProcurementApprovalRecord[]
  proposalItems       ProcurementPaymentProposalItem[]
  paymentRecords      ProcurementPaymentRecord[]
  statementLines      ProcurementVendorStatementLine[]
  duplicateInvoices   ProcurementVendorInvoice[]  @relation("DuplicateOf")
  appliedCredits      ProcurementVendorCredit[]

  @@unique([companyId, vendorId, invoiceNumber])
  @@index([companyId])
  @@index([companyId, status])
  @@index([companyId, vendorId])
  @@index([companyId, invoiceDate])
  @@index([companyId, dueDate])
  @@index([companyId, status, dueDate])
}

// ── 11. InvoiceLineItem ─────────────────────────────────────────────────────

model ProcurementInvoiceLineItem {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  vendorInvoiceId String
  vendorInvoice   ProcurementVendorInvoice @relation(fields: [vendorInvoiceId], references: [id], onDelete: Cascade)

  lineNumber          Int
  description         String
  quantity            Decimal @db.Decimal(20,4)
  unitOfMeasure       String?
  unitPrice           Decimal @db.Decimal(38,12)
  lineTotal           Decimal @db.Decimal(38,12)  // derived
  discountPercent     Decimal @db.Decimal(5,2)    @default(0)
  discountAmount      Decimal @db.Decimal(38,12)  @default(0)
  netLineTotal        Decimal @db.Decimal(38,12)  // derived
  taxRate             Decimal @db.Decimal(5,4)    @default(0)
  taxAmount           Decimal @db.Decimal(38,12)  // derived
  taxJurisdiction     String?
  taxType             ProcurementTaxType?
  glAccountId         String?
  costCenterId        String?
  departmentId        String?
  projectId           String?
  poReferenceLineItemId String?
  poReferenceLineItem   ProcurementPOReferenceLineItem? @relation(fields: [poReferenceLineItemId], references: [id], onDelete: Restrict)
  grnReferenceLineItemId String?
  grnReferenceLineItem   ProcurementGRNReferenceLineItem? @relation(fields: [grnReferenceLineItemId], references: [id], onDelete: Restrict)
  matchStatus         ProcurementLineMatchStatus?
  matchVariance       Decimal @db.Decimal(38,12)  @default(0)

  // Audit
  createdBy       String
  updatedBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations — referenced by
  matchLineItems  ProcurementMatchLineItem[]

  @@unique([companyId, vendorInvoiceId, lineNumber])
  @@index([companyId])
  @@index([vendorInvoiceId])
}

// ── 12. InvoiceAttachment ───────────────────────────────────────────────────

model ProcurementInvoiceAttachment {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  vendorInvoiceId String
  vendorInvoice   ProcurementVendorInvoice @relation(fields: [vendorInvoiceId], references: [id], onDelete: Cascade)

  fileName      String
  fileType      String
  fileSize      Int
  storageUrl    String
  category      ProcurementAttachmentCategory @default(INVOICE_COPY)
  ocrExtracted  Boolean                       @default(false)

  // Immutable — no updatedAt
  createdBy     String
  createdAt     DateTime @default(now())

  @@index([companyId])
  @@index([vendorInvoiceId])
}

// ── 13. ThreeWayMatch ───────────────────────────────────────────────────────

model ProcurementThreeWayMatch {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  vendorInvoiceId String  @unique
  vendorInvoice   ProcurementVendorInvoice @relation(fields: [vendorInvoiceId], references: [id], onDelete: Restrict)
  poReferenceId String
  poReference   ProcurementPOReference @relation(fields: [poReferenceId], references: [id], onDelete: Restrict)
  grnReferenceId String
  grnReference  ProcurementGRNReference @relation(fields: [grnReferenceId], references: [id], onDelete: Restrict)

  // Match result
  matchResult             ProcurementThreeWayMatchResult
  overallConfidence       Decimal @db.Decimal(5,2)
  priceVarianceTotal      Decimal @db.Decimal(38,12)  @default(0)
  quantityVarianceTotal   Decimal @db.Decimal(38,12)  @default(0)
  totalVariance           Decimal @db.Decimal(38,12)  // derived
  variancePercent         Decimal @db.Decimal(5,2)    @default(0)
  autoApproved            Boolean                     @default(false)
  approvalThreshold       Decimal @db.Decimal(5,2)    @default(5.00)

  // Timestamps
  matchedAt       DateTime @default(now())
  matchedBy       String

  // Concurrency
  version         Int @default(0)

  // Audit
  createdBy       String
  updatedBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations — children (cascade delete)
  lineItems       ProcurementMatchLineItem[]

  @@index([companyId])
  @@index([companyId, vendorInvoiceId])
}

// ── 14. MatchLineItem ───────────────────────────────────────────────────────

model ProcurementMatchLineItem {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  threeWayMatchId String
  threeWayMatch   ProcurementThreeWayMatch @relation(fields: [threeWayMatchId], references: [id], onDelete: Cascade)
  invoiceLineItemId String
  invoiceLineItem   ProcurementInvoiceLineItem @relation(fields: [invoiceLineItemId], references: [id], onDelete: Restrict)
  poReferenceLineItemId String?
  poReferenceLineItem   ProcurementPOReferenceLineItem? @relation(fields: [poReferenceLineItemId], references: [id], onDelete: Restrict)
  grnReferenceLineItemId String?
  grnReferenceLineItem   ProcurementGRNReferenceLineItem? @relation(fields: [grnReferenceLineItemId], references: [id], onDelete: Restrict)

  // Match result
  matchStatus       ProcurementMatchLineStatus
  invoiceQuantity   Decimal @db.Decimal(20,4)
  invoiceUnitPrice  Decimal @db.Decimal(38,12)
  poQuantity        Decimal @db.Decimal(20,4)?
  poUnitPrice       Decimal @db.Decimal(38,12)?
  grnQuantity       Decimal @db.Decimal(20,4)?
  priceVariance     Decimal @db.Decimal(38,12)  @default(0)
  quantityVariance  Decimal @db.Decimal(20,4)   @default(0)
  confidence        Decimal @db.Decimal(5,2)

  // Audit
  createdBy       String
  updatedBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([companyId])
  @@index([threeWayMatchId])
}

// ── 15. InvoiceException ────────────────────────────────────────────────────

model ProcurementInvoiceException {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  vendorInvoiceId String
  vendorInvoice   ProcurementVendorInvoice @relation(fields: [vendorInvoiceId], references: [id], onDelete: Restrict)

  exceptionType   ProcurementExceptionType
  severity        ProcurementExceptionSeverity  @default(MEDIUM)
  description     String
  varianceAmount  Decimal @db.Decimal(38,12)    @default(0)
  relatedEntityId String?

  // Status
  status          ProcurementExceptionStatus    @default(OPEN)

  // Resolution
  assignedTo      String?
  resolution      String?
  resolvedAt      DateTime?
  resolvedBy      String?

  // Escalation
  escalatedTo     String?
  escalatedAt     DateTime?

  // Concurrency
  version         Int @default(0)

  // Audit
  createdBy       String
  updatedBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([companyId])
  @@index([companyId, vendorInvoiceId])
  @@index([companyId, status])
}

// ── 16. ApprovalRecord ──────────────────────────────────────────────────────

model ProcurementApprovalRecord {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  vendorInvoiceId String
  vendorInvoice   ProcurementVendorInvoice @relation(fields: [vendorInvoiceId], references: [id], onDelete: Restrict)

  // Level
  approvalLevel       Int
  approvalLevelName   String
  requiredRole        String
  requiredThreshold   Decimal @db.Decimal(38,12)

  // Decision
  status              ProcurementApprovalStatus  @default(PENDING)
  decision            ProcurementApprovalDecision?
  decisionAt          DateTime?
  decisionBy          String?
  decisionComment     String?

  // Delegation
  delegatedTo         String?
  delegatedAt         DateTime?
  delegationReason    String?

  // Escalation
  escalated           Boolean                     @default(false)
  escalatedAt         DateTime?
  escalationReason    String?

  // SLA
  timeLimit           DateTime?

  // Concurrency
  version             Int @default(0)

  // Audit
  createdBy           String
  updatedBy           String
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([companyId])
  @@index([companyId, vendorInvoiceId])
  @@index([companyId, status])
}

// ── 17. ApprovalLevel ───────────────────────────────────────────────────────

model ProcurementApprovalLevel {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)

  levelNumber         Int
  levelName           String
  minAmount           Decimal @db.Decimal(38,12)
  maxAmount           Decimal @db.Decimal(38,12)?
  requiredRole        String[]
  requiredDepartment  String?
  canDelegate         Boolean @default(true)
  canEscalate         Boolean @default(true)
  timeLimitHours      Int     @default(48)
  isActive            Boolean @default(true)

  // Audit
  createdBy       String
  updatedBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([companyId, levelNumber])
  @@index([companyId])
}

// ── 18. PaymentProposal ─────────────────────────────────────────────────────

model ProcurementPaymentProposal {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)

  proposalNumber      String
  status              ProcurementProposalStatus @default(DRAFT)
  proposalDate        DateTime                  @default(now())
  paymentDate         DateTime
  currency            String                    @default("USD")
  totalAmount         Decimal @db.Decimal(38,12) // derived
  totalInvoices       Int                       // derived
  totalVendors        Int                       // derived
  paymentMethod       ProcurementPaymentMethod  @default(ACH)
  prioritizeDiscounts Boolean                   @default(false)
  includePartialPayments Boolean                @default(false)

  // Approval
  submittedBy         String?
  submittedAt         DateTime?
  reviewedBy          String?
  reviewedAt          DateTime?
  approvedBy          String?
  approvedAt          DateTime?
  rejectedBy          String?
  rejectionReason     String?

  // Link to batch
  paymentBatchId      String?
  paymentBatch        ProcurementPaymentBatch? @relation(fields: [paymentBatchId], references: [id], onDelete: Restrict)

  // Concurrency
  version             Int @default(0)

  // Audit
  createdBy           String
  updatedBy           String
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  // Relations — children (cascade delete)
  items               ProcurementPaymentProposalItem[]

  @@unique([companyId, proposalNumber])
  @@index([companyId])
  @@index([companyId, status])
}

// ── 19. PaymentProposalItem ─────────────────────────────────────────────────

model ProcurementPaymentProposalItem {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  paymentProposalId String
  paymentProposal   ProcurementPaymentProposal @relation(fields: [paymentProposalId], references: [id], onDelete: Cascade)
  vendorInvoiceId String
  vendorInvoice   ProcurementVendorInvoice @relation(fields: [vendorInvoiceId], references: [id], onDelete: Restrict)
  vendorId  String
  vendor    ProcurementVendor @relation(fields: [vendorId], references: [id], onDelete: Restrict)

  // Financials
  amount              Decimal @db.Decimal(38,12)
  discountTaken       Decimal @db.Decimal(38,12) @default(0)
  creditApplied       Decimal @db.Decimal(38,12) @default(0)
  netPayment          Decimal @db.Decimal(38,12) // derived

  // Selection
  paymentPriority     Int                         @default(100)
  selectedBy          ProcurementProposalItemSelection @default(AUTO)
  notes               String?

  // Audit
  createdBy       String
  updatedBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([companyId])
  @@index([paymentProposalId])
  @@index([vendorInvoiceId])
}

// ── 20. PaymentBatch ────────────────────────────────────────────────────────

model ProcurementPaymentBatch {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)

  batchNumber         String
  paymentProposalId   String
  paymentProposal     ProcurementPaymentProposal @relation(fields: [paymentProposalId], references: [id], onDelete: Restrict)
  status              ProcurementBatchStatus     @default(PENDING)
  paymentMethod       ProcurementPaymentMethod
  bankAccountId       String

  // Financials
  totalPayments       Int
  totalAmount         Decimal @db.Decimal(38,12) // derived
  totalFees           Decimal @db.Decimal(38,12) @default(0)
  netDisbursement     Decimal @db.Decimal(38,12) // derived

  // Bank file
  fileUrl             String?
  fileName            String?

  // Execution
  submittedAt         DateTime?
  completedAt         DateTime?
  confirmedBy         String?

  // Concurrency
  version             Int @default(0)

  // Audit
  createdBy           String
  updatedBy           String
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  // Relations — children (restrict delete)
  paymentRecords      ProcurementPaymentRecord[]

  @@unique([companyId, batchNumber])
  @@index([companyId])
  @@index([companyId, status])
}

// ── 21. PaymentRecord ───────────────────────────────────────────────────────

model ProcurementPaymentRecord {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  paymentBatchId String
  paymentBatch   ProcurementPaymentBatch @relation(fields: [paymentBatchId], references: [id], onDelete: Restrict)
  vendorInvoiceId String
  vendorInvoice   ProcurementVendorInvoice @relation(fields: [vendorInvoiceId], references: [id], onDelete: Restrict)
  vendorId  String
  vendor    ProcurementVendor @relation(fields: [vendorId], references: [id], onDelete: Restrict)

  paymentNumber       String
  paymentDate         DateTime
  amount              Decimal @db.Decimal(38,12)
  discountTaken       Decimal @db.Decimal(38,12) @default(0)
  creditApplied       Decimal @db.Decimal(38,12) @default(0)
  netPayment          Decimal @db.Decimal(38,12) // derived
  currency            String                    @default("USD")
  exchangeRate        Decimal @db.Decimal(20,8) @default(1.00000000)
  baseCurrencyAmount  Decimal @db.Decimal(38,12) // derived
  paymentMethod       ProcurementPaymentMethod
  bankAccountId       String
  transactionReference String?
  checkNumber         String?

  // Status
  status              ProcurementPaymentStatus  @default(PROCESSED)

  // GL
  glPosted            Boolean                   @default(false)
  glPostedAt          DateTime?
  glReversalPosted    Boolean                   @default(false)

  // Idempotency
  idempotencyKey      String?                   @unique

  // Void
  voidedAt            DateTime?
  voidedBy            String?
  voidReason          String?

  // Concurrency
  version             Int @default(0)

  // Audit
  createdBy           String
  updatedBy           String
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@unique([companyId, paymentNumber])
  @@index([companyId])
  @@index([companyId, vendorInvoiceId])
  @@index([companyId, vendorId])
  @@index([companyId, paymentDate])
  @@index([companyId, status])
}

// ── 22. VendorStatement ─────────────────────────────────────────────────────

model ProcurementVendorStatement {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  vendorId  String
  vendor    ProcurementVendor @relation(fields: [vendorId], references: [id], onDelete: Restrict)

  statementNumber     String
  statementDate       DateTime
  periodStart         DateTime
  periodEnd           DateTime
  openingBalance      Decimal @db.Decimal(38,12)  @default(0)
  totalInvoices       Decimal @db.Decimal(38,12)  @default(0)
  totalPayments       Decimal @db.Decimal(38,12)  @default(0)
  totalCredits        Decimal @db.Decimal(38,12)  @default(0)
  closingBalance      Decimal @db.Decimal(38,12)  // derived
  currency            String                      @default("USD")
  status              ProcurementStatementStatus  @default(RECEIVED)
  fileUrl             String?

  // Concurrency
  version             Int @default(0)

  // Audit
  createdBy           String
  updatedBy           String
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  // Relations — children (cascade delete)
  lines               ProcurementVendorStatementLine[]
  reconciliationResult ProcurementReconciliationResult?

  @@unique([companyId, vendorId, statementDate])
  @@index([companyId])
  @@index([companyId, vendorId])
}

// ── 23. VendorStatementLine ─────────────────────────────────────────────────

model ProcurementVendorStatementLine {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  vendorStatementId String
  vendorStatement   ProcurementVendorStatement @relation(fields: [vendorStatementId], references: [id], onDelete: Cascade)

  lineNumber          Int
  transactionDate     DateTime
  reference           String
  description         String
  debitAmount         Decimal @db.Decimal(38,12)  @default(0)
  creditAmount        Decimal @db.Decimal(38,12)  @default(0)
  balance             Decimal @db.Decimal(38,12)
  transactionType     ProcurementStatementLineType

  // Matching
  matchedInvoiceId    String?
  matchedInvoice      ProcurementVendorInvoice? @relation(fields: [matchedInvoiceId], references: [id], onDelete: Restrict)
  matchedPaymentId    String?
  matchedPayment      ProcurementPaymentRecord? @relation(fields: [matchedPaymentId], references: [id], onDelete: Restrict)
  matchStatus         ProcurementStatementMatchStatus @default(UNMATCHED)

  // Audit
  createdBy       String
  updatedBy       String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([companyId])
  @@index([vendorStatementId])
}

// ── 24. ReconciliationResult ────────────────────────────────────────────────

model ProcurementReconciliationResult {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  vendorStatementId String  @unique
  vendorStatement   ProcurementVendorStatement @relation(fields: [vendorStatementId], references: [id], onDelete: Restrict)
  vendorId  String
  vendor    ProcurementVendor @relation(fields: [vendorId], references: [id], onDelete: Restrict)

  reconciliationDate  DateTime                  @default(now())

  // Balances
  apBalance           Decimal @db.Decimal(38,12)
  vendorBalance       Decimal @db.Decimal(38,12)
  balanceVariance     Decimal @db.Decimal(38,12) // derived

  // Line matching
  totalLines          Int
  matchedLines        Int
  unmatchedLines      Int                       // derived
  matchRate           Decimal @db.Decimal(5,2)  // derived

  // Status
  status              ProcurementReconciliationStatus @default(IN_PROGRESS)

  // Adjustment
  adjustmentAmount    Decimal @db.Decimal(38,12) @default(0)
  adjustmentReason    String?
  adjustedBy          String?

  // Resolution
  resolvedBy          String?
  resolvedAt          DateTime?

  // Concurrency
  version             Int @default(0)

  // Audit
  createdBy           String
  updatedBy           String
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([companyId])
  @@index([companyId, vendorId])
}

// ── 25. APAuditRecord ───────────────────────────────────────────────────────

model ProcurementAPAuditRecord {
  id        String  @id @default(cuid())
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)

  // Entity reference
  entityType  String
  entityId    String
  action      ProcurementAuditAction

  // Change detail
  field       String?
  oldValue    String?
  newValue    String?
  amount      Decimal @db.Decimal(38,12)?
  description String
  reason      String?

  // Actor
  userId      String
  userRole    String

  // Request context
  ipAddress   String?
  userAgent   String?
  correlationId String?
  metadata    Json?

  // Immutable — no updatedAt
  createdAt   DateTime @default(now())

  @@index([companyId])
  @@index([companyId, entityType, entityId])
  @@index([companyId, createdAt])
  @@index([companyId, action])
}
```

---

## 6. Tenant Isolation Pattern

### Mandatory on Every Model

Every AP model includes this exact pattern:

```prisma
companyId String
company    Company @relation(fields: [companyId], references: [id], onDelete: Restrict)

@@index([companyId])
```

There are **zero exceptions**. Even immutable models (`ProcurementAPAuditRecord`, `ProcurementInvoiceAttachment`, `ProcurementVendorPerformance`) have `companyId`.

### Service Layer Enforcement

Every query and mutation includes the `companyId` filter:

```typescript
// READ — tenant-scoped query
const invoices = await prisma.procurementVendorInvoice.findMany({
  where: { companyId: session.companyId, status: 'APPROVED' },
  include: { lineItems: true, vendor: true },
});

// CREATE — tenant injection
const invoice = await prisma.procurementVendorInvoice.create({
  data: {
    companyId: session.companyId, // injected, never from user input
    vendorId: input.vendorId,
    invoiceNumber: input.invoiceNumber,
    // ...
  },
});

// UPDATE — tenant-scoped update
await prisma.procurementVendorInvoice.update({
  where: {
    id: invoiceId,
    companyId: session.companyId, // scoping in WHERE, not just data
  },
  data: { status: 'APPROVED' },
});

// DELETE — tenant-scoped delete (hard delete with audit first)
await prisma.$transaction(async (tx) => {
  await tx.procurementAPAuditRecord.create({
    data: {
      companyId: session.companyId,
      entityType: 'VendorInvoice',
      entityId: invoiceId,
      action: 'STATUS_CHANGED',
      description: 'Invoice voided',
      userId: session.userId,
      userRole: session.role,
    },
  });
  await tx.procurementVendorInvoice.delete({
    where: { id: invoiceId, companyId: session.companyId },
  });
});
```

### Query Pattern Summary

| Operation | Pattern |
|---|---|
| List | `findMany({ where: { companyId, ...filters } })` |
| Detail | `findFirst({ where: { id, companyId } })` |
| Create | `create({ data: { companyId: session.companyId, ... } })` |
| Update | `update({ where: { id, companyId }, data: { ... } })` |
| Delete | `delete({ where: { id, companyId } })` (after audit record) |
| Aggregate | `aggregate({ where: { companyId, ... }, _sum: { amount: true } })` |
| Count | `count({ where: { companyId, status: ... } })` |

---

## 7. Cascade Delete Rules

### Rule Summary

| Relationship | OnDelete | Rationale |
|---|---|---|
| **Any model → Company** | `Restrict` | Never delete a company that has AP data |
| **Vendor → BankDetail** | `Cascade` | Delete vendor = delete bank details |
| **Vendor → Performance** | `Cascade` | Delete vendor = delete performance records |
| **Vendor → Document** | `Cascade` | Delete vendor = delete documents |
| **VendorInvoice → LineItem** | `Cascade` | Delete invoice = delete line items |
| **VendorInvoice → Attachment** | `Cascade` | Delete invoice = delete attachments |
| **ThreeWayMatch → MatchLineItem** | `Cascade` | Delete match = delete line results |
| **VendorStatement → StatementLine** | `Cascade` | Delete statement = delete lines |
| **PaymentProposal → ProposalItem** | `Cascade` | Delete proposal = delete items |
| **PaymentBatch → PaymentRecord** | `Restrict` | **Cannot delete batch with payments** |
| **VendorInvoice → ApprovalRecord** | `Restrict` | **Cannot delete invoice with approvals** |
| **VendorInvoice → InvoiceException** | `Restrict` | **Cannot delete invoice with exceptions** |
| **VendorInvoice → ThreeWayMatch** | `Restrict` | **Cannot delete invoice with match** |
| **VendorInvoice → PaymentRecord** | `Restrict` | **Cannot delete invoice with payments** |
| **Vendor → VendorInvoice** | `Restrict` | **Cannot delete vendor with invoices** |
| **Vendor → POReference** | `Restrict` | **Cannot delete vendor with POs** |
| **Vendor → GRNReference** | `Restrict` | **Cannot delete vendor with GRNs** |
| **Vendor → VendorCredit** | `Restrict` | **Cannot delete vendor with credits** |
| **Vendor → VendorStatement** | `Restrict` | **Cannot delete vendor with statements** |
| **POReference → POReferenceLineItem** | `Cascade` | Delete PO = delete line items |
| **POReference → GRNReference** | `Restrict` | **Cannot delete PO with GRNs** |
| **GRNReference → GRNReferenceLineItem** | `Cascade` | Delete GRN = delete line items |
| **VendorStatement → ReconciliationResult** | `Restrict` (via `@unique`) | **Cannot delete statement with reconciliation** |
| **PaymentProposal → PaymentBatch** | `Restrict` | **Cannot delete proposal with batch** |
| **VendorInvoice (self-referential)** | `Restrict` | **Cannot delete original invoice that has duplicates** |

### Design Principle

**`Restrict` is the default.** `Cascade` is only used for true child entities where the child has no independent existence:
- Line items (always belong to a parent document)
- Attachments (always belong to an invoice)
- Match line items (always belong to a match)
- Statement lines (always belong to a statement)
- Proposal items (always belong to a proposal)

Everything else uses `Restrict` to prevent accidental data loss. Deletes require explicit handling in the service layer: audit first, then soft-status change, or verified hard delete.

---

## 8. Unique Constraints

Complete list of all `@@unique` constraints:

| # | Model | Fields | Business Rule |
|---|---|---|---|
| 1 | `ProcurementVendor` | `[companyId, vendorCode]` | Vendor code unique per company |
| 2 | `ProcurementVendor` | `[companyId, taxId]` | Tax ID unique per company |
| 3 | `ProcurementVendorCredit` | `[companyId, vendorId, creditNumber]` | Credit number unique per vendor per company |
| 4 | `ProcurementPOReference` | `[companyId, poNumber]` | PO number unique per company |
| 5 | `ProcurementPOReferenceLineItem` | `[companyId, poReferenceId, lineNumber]` | Line number unique per PO |
| 6 | `ProcurementGRNReference` | `[companyId, grnNumber]` | GRN number unique per company |
| 7 | `ProcurementGRNReferenceLineItem` | `[companyId, grnReferenceId, lineNumber]` | Line number unique per GRN |
| 8 | `ProcurementVendorInvoice` | `[companyId, vendorId, invoiceNumber]` | Invoice number unique per vendor per company |
| 9 | `ProcurementInvoiceLineItem` | `[companyId, vendorInvoiceId, lineNumber]` | Line number unique per invoice |
| 10 | `ProcurementThreeWayMatch` | `[vendorInvoiceId]` | One match per invoice (global unique) |
| 11 | `ProcurementApprovalLevel` | `[companyId, levelNumber]` | Level number unique per company |
| 12 | `ProcurementPaymentProposal` | `[companyId, proposalNumber]` | Proposal number unique per company |
| 13 | `ProcurementPaymentBatch` | `[companyId, batchNumber]` | Batch number unique per company |
| 14 | `ProcurementPaymentRecord` | `[companyId, paymentNumber]` | Payment number unique per company |
| 15 | `ProcurementPaymentRecord` | `[idempotencyKey]` | Idempotency key global unique |
| 16 | `ProcurementVendorStatement` | `[companyId, vendorId, statementDate]` | One statement per vendor per date |
| 17 | `ProcurementReconciliationResult` | `[vendorStatementId]` | One result per statement (global unique) |

**Total**: 17 unique constraints (15 composite + 2 field-level)

---

## 9. Index Strategy

### 9.1 Tenant Isolation Indexes (Every Model)

```prisma
@@index([companyId])
```

Applied to all 25 models. This is the primary partition pruning index — every query includes `companyId` in the WHERE clause.

### 9.2 Query Performance Indexes

| Model | Index Fields | Justification | Query Pattern |
|---|---|---|---|
| `ProcurementVendor` | `[companyId, status]` | Filter by vendor status | Dashboard: "show active vendors" |
| `ProcurementVendor` | `[companyId, category]` | Filter by vendor category | Reports: "vendors by category" |
| `ProcurementVendor` | `[companyId, riskLevel]` | Filter by risk | Risk dashboard |
| `ProcurementVendorBankDetail` | `[vendorId]` | Lookup bank details for vendor | Vendor detail page |
| `ProcurementVendorPerformance` | `[vendorId]` | Performance history for vendor | Vendor scorecard |
| `ProcurementVendorCredit` | `[companyId, vendorId]` | Credits by vendor | Credit list per vendor |
| `ProcurementVendorCredit` | `[companyId, status]` | Active credits | Credit balance report |
| `ProcurementPOReference` | `[vendorId]` | POs by vendor | Vendor PO history |
| `ProcurementPOReference` | `[companyId, status]` | PO status filter | PO dashboard |
| `ProcurementPOReferenceLineItem` | `[poReferenceId]` | Line items by PO | PO detail page |
| `ProcurementGRNReference` | `[poReferenceId]` | GRNs by PO | PO receipt history |
| `ProcurementGRNReferenceLineItem` | `[grnReferenceId]` | Lines by GRN | GRN detail page |
| `ProcurementVendorInvoice` | `[companyId, status]` | **Most common filter** | Invoice dashboard, queues |
| `ProcurementVendorInvoice` | `[companyId, vendorId]` | Invoices by vendor | Vendor invoice history |
| `ProcurementVendorInvoice` | `[companyId, invoiceDate]` | Date range queries | Period reports |
| `ProcurementVendorInvoice` | `[companyId, dueDate]` | Aging reports | Aging bucket dashboard |
| `ProcurementVendorInvoice` | `[companyId, status, dueDate]` | Overdue invoice queue | AP aging / collections |
| `ProcurementInvoiceLineItem` | `[vendorInvoiceId]` | Line items by invoice | Invoice detail page |
| `ProcurementThreeWayMatch` | `[companyId, vendorInvoiceId]` | Match by invoice | Match lookup |
| `ProcurementInvoiceException` | `[companyId, vendorInvoiceId]` | Exceptions by invoice | Invoice exceptions panel |
| `ProcurementInvoiceException` | `[companyId, status]` | **Exception queue** | "Open exceptions" dashboard |
| `ProcurementApprovalRecord` | `[companyId, vendorInvoiceId]` | Approvals by invoice | Invoice approval history |
| `ProcurementApprovalRecord` | `[companyId, status]` | **Pending approvals queue** | "My approvals" dashboard |
| `ProcurementPaymentProposal` | `[companyId, status]` | Active proposals | Proposal dashboard |
| `ProcurementPaymentProposalItem` | `[paymentProposalId]` | Items by proposal | Proposal detail page |
| `ProcurementPaymentBatch` | `[companyId, status]` | Batch status filter | Batch monitoring |
| `ProcurementPaymentRecord` | `[companyId, vendorInvoiceId]` | Payments by invoice | Invoice payment history |
| `ProcurementPaymentRecord` | `[companyId, vendorId]` | Payments by vendor | Vendor payment history |
| `ProcurementPaymentRecord` | `[companyId, paymentDate]` | Date range queries | Payment period reports |
| `ProcurementPaymentRecord` | `[companyId, status]` | Payment status filter | Payment monitoring |
| `ProcurementVendorStatement` | `[companyId, vendorId]` | Statements by vendor | Vendor reconciliation |
| `ProcurementVendorStatementLine` | `[vendorStatementId]` | Lines by statement | Statement detail page |
| `ProcurementReconciliationResult` | `[companyId, vendorId]` | Reconciliation by vendor | Vendor reconciliation history |
| `ProcurementAPAuditRecord` | `[companyId, entityType, entityId]` | **Audit trail by entity** | Entity audit history |
| `ProcurementAPAuditRecord` | `[companyId, createdAt]` | Chronological audit | Audit log page, compliance |
| `ProcurementAPAuditRecord` | `[companyId, action]` | Filter by action type | "All approvals" report |
| `ProcurementVendorDocument` | `[vendorId]` | Documents by vendor | Vendor detail page |

**Total performance indexes**: 37 (excluding the 25 tenant isolation indexes)

### 9.3 Index Count Summary

| Category | Count |
|---|---|
| Tenant isolation (`[companyId]`) | 25 |
| Query performance (composite) | 37 |
| Unique constraints (also serve as indexes) | 17 |
| **Total indexes** | **79** |

---

## 10. Financial Precision Rules

### 10.1 The Non-Negotiable Rule

**All monetary fields MUST use `@db.Decimal(38,12)`. No exceptions.**

This is enforced at three levels:
1. **Prisma schema** — `Decimal @db.Decimal(38,12)` type
2. **Service layer** — all calculations use `financial-precision.ts` helpers
3. **Code review** — any `Float` field for money is a P0 blocking issue

### 10.2 Precision by Field Pattern

| Field Pattern | Prisma Type | Scale | Example | Usage |
|---|---|---|---|---|
| `*Amount`, `*Total`, `*Balance`, `*Price` | `Decimal @db.Decimal(38,12)` | 12 | `1234567.890123456789` | Money |
| `*Quantity`, `*Qty` | `Decimal @db.Decimal(20,4)` | 4 | `100.5000` | Items |
| `*Percent`, `*Score`, `*Rate` (scores) | `Decimal @db.Decimal(5,2)` | 2 | `85.50` | Scores |
| `TaxRate` | `Decimal @db.Decimal(5,4)` | 4 | `0.0750` | 7.5% as decimal |
| `ExchangeRate` | `Decimal @db.Decimal(20,8)` | 8 | `1.23456789` | FX |
| `Rating` | `Decimal @db.Decimal(3,1)` | 1 | `4.5` | Vendor rating |

### 10.3 Calculation Helpers

All financial calculations MUST use helpers from `src/lib/financial-precision.ts`:

```typescript
import {
  financialRound,
  sumDecimals,
  multiplyDecimals,
  divideDecimals,
  toDecimal,
} from '@/lib/financial-precision';

// Line total
const lineTotal = multiplyDecimals(quantity, unitPrice);

// Invoice total
const subtotal = sumDecimals(lineItems.map(l => l.netLineTotal));
const taxAmount = sumDecimals(lineItems.map(l => l.taxAmount));
const totalAmount = financialRound(
  subtotal.add(taxAmount).add(shippingAmount).sub(discountAmount),
  12
);

// Variance
const variance = decimalEquals(priceVariance, zero, tolerance)
  ? 'MATCHED'
  : 'VARIANCE';
```

### 10.4 Fields That Are Never Trusted from Input

| Field | Calculation | Rule |
|---|---|---|
| `lineTotal` | `multiplyDecimals(quantity, unitPrice)` | Recalculated on every save |
| `netLineTotal` | `lineTotal - discountAmount` | Recalculated on every save |
| `taxAmount` (line) | `multiplyDecimals(netLineTotal, taxRate)` | Recalculated on every save |
| `totalAmount` (invoice) | `subtotal + tax + shipping - discount` | Derived, never set directly |
| `totalWithTax` | `subtotal + taxAmount` | Derived, never set directly |
| `balanceDue` | `totalAmount - amountPaid` | Derived, never set directly |
| `netBalance` | `balanceDue - creditApplied` | Derived, never set directly |
| `remainingAmount` (credit) | `creditAmount - appliedAmount` | Derived, never set directly |
| `closingBalance` (statement) | `opening + invoices - payments - credits` | Derived, never set directly |
| `balanceVariance` (reconciliation) | `apBalance - vendorBalance` | Derived, never set directly |
| `totalVariance` (match) | `priceVariance + quantityVariance` | Derived, never set directly |
| `netPayment` | `amount - discount - credit` | Derived, never set directly |
| `baseCurrencyAmount` | `netPayment × exchangeRate` | Derived, never set directly |
| `lineTotal` (PO/GRN) | `quantity × unitPrice` | Derived, never set directly |
| `lineTotal` (GRN) | `quantityAccepted × unitPrice` | Derived, never set directly |

---

## 11. Concurrency Control

### 11.1 Aggregate Roots with Version Field

| Model | Field | Default |
|---|---|---|
| `ProcurementVendor` | `version Int @default(0)` | 0 |
| `ProcurementVendorInvoice` | `version Int @default(0)` | 0 |
| `ProcurementVendorCredit` | `version Int @default(0)` | 0 |
| `ProcurementThreeWayMatch` | `version Int @default(0)` | 0 |
| `ProcurementInvoiceException` | `version Int @default(0)` | 0 |
| `ProcurementApprovalRecord` | `version Int @default(0)` | 0 |
| `ProcurementPaymentProposal` | `version Int @default(0)` | 0 |
| `ProcurementPaymentBatch` | `version Int @default(0)` | 0 |
| `ProcurementPaymentRecord` | `version Int @default(0)` | 0 |
| `ProcurementVendorStatement` | `version Int @default(0)` | 0 |
| `ProcurementReconciliationResult` | `version Int @default(0)` | 0 |

**12 models** have optimistic concurrency. Child entities (line items, attachments, statement lines, etc.) do not — they are always mutated within a parent aggregate transaction.

### 11.2 Update Pattern

```typescript
import { Prisma } from '@prisma/client';

async function approveInvoice(
  invoiceId: string,
  companyId: string,
  currentVersion: number,
  approverId: string
) {
  const result = await prisma.procurementVendorInvoice.updateMany({
    where: {
      id: invoiceId,
      companyId,
      version: currentVersion, // Optimistic lock
    },
    data: {
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedBy: approverId,
      version: { increment: 1 },
    },
  });

  if (result.count === 0) {
    throw new ConflictError(
      'Invoice was modified by another user. Please refresh and try again.'
    );
  }
}
```

### 11.3 Why `updateMany` Instead of `update`

Using `updateMany` with `version` in the WHERE clause avoids Prisma's `Record not found` error on version mismatch. The `count` check provides a clean conflict detection path.

### 11.4 Child Entity Concurrency

Child entities (line items, attachments, etc.) do NOT have version fields. They are always modified within a transaction that holds the parent's optimistic lock:

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Lock parent (version check)
  const invoice = await tx.procurementVendorInvoice.update({
    where: { id: invoiceId, companyId, version: currentVersion },
    data: { version: { increment: 1 }, status: 'CAPTURED' },
  });

  // 2. Mutate children (no version check needed — parent is locked)
  await tx.procurementInvoiceLineItem.createMany({
    data: lineItems.map(l => ({
      companyId,
      vendorInvoiceId: invoiceId,
      ...l,
    })),
  });
});
```

---

## 12. Migration Strategy

### 12.1 Migration File

**Name**: `20260721120000_ap_procurement_models`

### 12.2 Migration Contents

| Step | Count | Description |
|---|---|---|
| Enum types | ~30 | All `Procurement*` enums listed in Section 3 |
| Tables | 25 | All models listed in Section 2 |
| Unique constraints | 17 | Listed in Section 8 |
| Indexes | ~79 | Listed in Section 9 |
| Foreign keys | ~40 | Per cascade rules in Section 7 |

### 12.3 Migration Properties

| Property | Value |
|---|---|
| **Creates new tables** | 25 |
| **Modifies existing tables** | 0 |
| **Drops existing tables** | 0 |
| **Data migration** | None (new tables only) |
| **Reversible** | Yes (`DROP TABLE` for all 25 tables) |
| **Downtime required** | None (additive only) |
| **Estimated migration time** | < 5 seconds (25 tables, no data) |

### 12.4 Pre-Migration Checklist

- [ ] `Company` model exists (FK target for all 25 models)
- [ ] `User` model exists (referenced by `createdBy`/`updatedBy` fields — stored as String, no FK constraint)
- [ ] No existing `Procurement*` models in schema (verify no naming collision)
- [ ] `pnpm prisma migrate dev` passes locally
- [ ] `pnpm prisma db push` passes against shadow database
- [ ] `pnpm typecheck` passes after migration
- [ ] `pnpm build` passes after migration

### 12.5 Post-Migration Seed

The migration is followed by `seed-treasury.ts` additions or a dedicated `seed-ap.ts` that populates:
- 5 default approval levels per company
- Sample vendors with bank details
- Sample invoices with line items
- Sample PO/GRN references for matching demos

---

## 13. Service Layer Query Patterns

### 13.1 Common Query Patterns

#### Invoice Dashboard

```typescript
// Count by status for dashboard tiles
const statusCounts = await prisma.procurementVendorInvoice.groupBy({
  by: ['status'],
  where: { companyId },
  _count: { id: true },
});

// Aging buckets
const agingBuckets = await prisma.$queryRaw`
  SELECT
    CASE
      WHEN "dueDate" >= CURRENT_DATE THEN 'current'
      WHEN "dueDate" >= CURRENT_DATE - INTERVAL '30 days' THEN '1-30'
      WHEN "dueDate" >= CURRENT_DATE - INTERVAL '60 days' THEN '31-60'
      WHEN "dueDate" >= CURRENT_DATE - INTERVAL '90 days' THEN '61-90'
      ELSE '90+'
    END as bucket,
    COUNT(*) as count,
    SUM("balanceDue") as total
  FROM "ProcurementVendorInvoice"
  WHERE "companyId" = ${companyId}
    AND "status" NOT IN ('VOIDED', 'PAID')
  GROUP BY bucket
  ORDER BY bucket
`;
```

#### Overdue Invoices

```typescript
const overdueInvoices = await prisma.procurementVendorInvoice.findMany({
  where: {
    companyId,
    status: { notIn: ['VOIDED', 'PAID'] },
    dueDate: { lt: new Date() },
  },
  include: {
    vendor: { select: { name: true, vendorCode: true } },
    lineItems: { select: { netLineTotal: true } },
  },
  orderBy: { dueDate: 'asc' },
});
```

#### Payment Proposal Generation

```typescript
const eligibleInvoices = await prisma.procurementVendorInvoice.findMany({
  where: {
    companyId,
    status: 'APPROVED',
    paymentProposalId: null, // Not already in a proposal
  },
  include: { vendor: { select: { preferredPaymentMethod: true } } },
  orderBy: [
    { dueDate: 'asc' }, // Earliest due first
  ],
});
```

#### 3-Way Match with Line Items

```typescript
const matchWithDetails = await prisma.procurementThreeWayMatch.findUnique({
  where: { id: matchId },
  include: {
    vendorInvoice: {
      include: {
        lineItems: true,
        vendor: { select: { name: true, vendorCode: true } },
      },
    },
    poReference: { include: { lineItems: true } },
    grnReference: { include: { lineItems: true } },
    lineItems: true,
  },
});
```

#### Audit Trail

```typescript
const auditTrail = await prisma.procurementAPAuditRecord.findMany({
  where: {
    companyId,
    entityType: 'VendorInvoice',
    entityId: invoiceId,
  },
  orderBy: { createdAt: 'desc' },
  take: 100,
});
```

#### Vendor Statement Reconciliation

```typescript
const reconciliation = await prisma.procurementReconciliationResult.findUnique({
  where: { vendorStatementId: statementId },
  include: {
    vendorStatement: {
      include: { lines: { orderBy: { lineNumber: 'asc' } } },
    },
    vendor: { select: { name: true, vendorCode: true } },
  },
});
```

### 13.2 Aggregate Queries

```typescript
// Total outstanding AP by vendor
const vendorBalances = await prisma.procurementVendorInvoice.groupBy({
  by: ['vendorId'],
  where: {
    companyId,
    status: { in: ['APPROVED', 'PARTIALLY_PAID', 'PAID'] },
  },
  _sum: { balanceDue: true },
  _count: { id: true },
});

// Monthly payment totals
const monthlyPayments = await prisma.procurementPaymentRecord.groupBy({
  by: ['paymentDate'],
  where: {
    companyId,
    paymentDate: {
      gte: startOfMonth,
      lte: endOfMonth,
    },
  },
  _sum: { netPayment: true },
  _count: { id: true },
});

// Exception resolution time
const exceptionMetrics = await prisma.procurementInvoiceException.aggregate({
  where: {
    companyId,
    status: 'RESOLVED',
    resolvedAt: { gte: last30Days },
  },
  _avg: {
    // Computed in service layer from resolvedAt - createdAt
  },
  _count: { id: true },
});
```

---

*End of Phase 21A.1 — Accounts Payable Database Schema*
