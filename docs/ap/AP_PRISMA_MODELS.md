# Phase 21A.1 — Accounts Payable Prisma Model Specification

> **Status**: Complete
> **Type**: Documentation-only — authoritative Prisma schema specification for AP persistence
> **Date**: July 21, 2026
> **Scope**: 25 Prisma models, 33 enum types, complete field/index/relation specification
> **Predecessor**: AP_DOMAIN_MODEL.md, AP_AGGREGATES.md, AP_STATE_MACHINES.md
> **Prerequisites**: `src/lib/financial-precision.ts`, existing `prisma/schema.prisma` patterns
> **Implements**: AP_COMMAND_QUERY_MODEL.md, AP_DOMAIN_INVARIANTS.md, AP_INTEGRATION_ARCHITECTURE.md

---

## Table of Contents

1. [Entity Classification](#1-entity-classification)
2. [Enum Definitions](#2-enum-definitions)
3. [Prisma Schema Specification](#3-prisma-schema-specification)
4. [Relationship Summary](#4-relationship-summary)
5. [Index Strategy](#5-index-strategy)
6. [Money Representation Pattern](#6-money-representation-pattern)
7. [Soft Delete Policy](#7-soft-delete-policy)
8. [Optimistic Concurrency](#8-optimistic-concurrency)
9. [Audit Trail Pattern](#9-audit-trail-pattern)
10. [Tenant Isolation](#10-tenant-isolation)
11. [Derived Fields Policy](#11-derived-fields-policy)

---

## 1. Entity Classification

The AP domain model defines 25 entities that become Prisma tables and 18 value objects that are stored as embedded fields.

### Prisma Models (25 tables)

| # | Domain Entity | Prisma Model | Classification | Parent Aggregate | Persistence Reason |
|---|---|---|---|---|---|
| 1 | Vendor | `ProcurementVendor` | Aggregate Root | — | Master data for all AP interactions; lifecycle management |
| 2 | VendorBankDetail | `ProcurementVendorBankDetail` | Child Entity | Vendor | PCI-DSS scope isolation; encrypted bank credentials |
| 3 | VendorPerformance | `ProcurementVendorPerformance` | Child Entity (immutable) | Vendor | Periodic scoring snapshots; append-only history |
| 4 | VendorDocument | `ProcurementVendorDocument` | Child Entity | Vendor | Compliance documents (W-9, insurance); status tracking |
| 5 | VendorCredit | `ProcurementVendorCredit` | Aggregate Root | — | Independent lifecycle; credit application tracking |
| 6 | PurchaseOrderReference | `ProcurementPOReference` | Reference Entity (read-only) | — | 3-way match baseline; sync snapshot from Procurement |
| 7 | POReferenceLineItem | `ProcurementPOReferenceLineItem` | Child Entity | POReference | Line-level match data for 3-way matching |
| 8 | GoodsReceiptReference | `ProcurementGRNReference` | Reference Entity (read-only) | — | Goods received leg of 3-way match; sync from Warehouse |
| 9 | GRNReferenceLineItem | `ProcurementGRNReferenceLineItem` | Child Entity | GRNReference | Line-level receipt data for 3-way matching |
| 10 | VendorInvoice | `ProcurementVendorInvoice` | Aggregate Root (CORE) | — | Central AP entity; entire lifecycle from capture to payment |
| 11 | InvoiceLineItem | `ProcurementInvoiceLineItem` | Child Entity | VendorInvoice | Individual invoice lines with GL coding, tax, match results |
| 12 | InvoiceAttachment | `ProcurementInvoiceAttachment` | Child Entity (immutable) | VendorInvoice | Supporting documents; append-only after creation |
| 13 | ThreeWayMatch | `ProcurementThreeWayMatch` | Aggregate Root | — | Independent match result; re-runnable, auditable |
| 14 | MatchLineItem | `ProcurementMatchLineItem` | Child Entity | ThreeWayMatch | Per-line match result with variance details |
| 15 | InvoiceException | `ProcurementInvoiceException` | Aggregate Root | — | Independent exception lifecycle with SLA and escalation |
| 16 | ApprovalRecord | `ProcurementApprovalRecord` | Aggregate Root (per invoice) | — | Per-level approval decisions; delegation and escalation |
| 17 | ApprovalLevel | `ProcurementApprovalLevel` | Configuration Entity | — | Approval matrix configuration; reusable across invoices |
| 18 | PaymentProposal | `ProcurementPaymentProposal` | Aggregate Root | — | Batch payment planning; optimization before execution |
| 19 | PaymentProposalItem | `ProcurementPaymentProposalItem` | Child Entity | PaymentProposal | Per-invoice payment entry with discount and credit |
| 20 | PaymentBatch | `ProcurementPaymentBatch` | Aggregate Root | — | Payment execution; bank file generation; idempotency |
| 21 | PaymentRecord | `ProcurementPaymentRecord` | Aggregate Root (immutable after creation) | — | Immutable payment evidence; GL posting reference |
| 22 | VendorStatement | `ProcurementVendorStatement` | Aggregate Root | — | Vendor's periodic account statement; reconciliation input |
| 23 | VendorStatementLine | `ProcurementVendorStatementLine` | Child Entity | VendorStatement | Individual transactions on vendor statement |
| 24 | ReconciliationResult | `ProcurementReconciliationResult` | Aggregate Root | — | Outcome of statement vs. ledger reconciliation |
| 25 | APAuditRecord | `ProcurementAPAuditRecord` | Append-only Audit Log | — | Immutable audit trail for every AP state transition |

### Value Objects (NOT Prisma Models)

| Domain Concept | Stored As | Location |
|---|---|---|
| Money | `Decimal(38,12)` + `String` currency field pair | All monetary entity fields |
| Currency | `String` ISO 4217 code | `currency` fields |
| TaxRate | `Decimal(5,4)` rate + `String` jurisdiction + `String` taxType | Invoice line item fields |
| PaymentTerms | `String` code (e.g., "NET30") | `paymentTerms` fields |
| VendorReference | `String` FK + denormalized fields | FK + denormalized name/code |
| InvoiceNumber | `String` invoiceNumber field | `invoiceNumber` fields |
| InvoiceStatus | `String` status + `String?` previousStatus + `DateTime?` statusChangedAt | VendorInvoice fields |
| MatchStatus | Fields on VendorInvoice | `matchResult` + `varianceAmount` + `varianceThreshold` |
| ToleranceThreshold | `Decimal(5,2)` threshold fields on VendorInvoice | `varianceThreshold` field |
| DuplicateConfidence | Fields on VendorInvoice | `isDuplicateSuspicion` + `duplicateConfidence` + `duplicateOfInvoiceId` |
| ApprovalAuthority | Fields on ApprovalLevel | `minAmount` + `maxAmount` + `requiredRole` |
| Address | `String` text fields | `billingAddress` + `shippingAddress` |
| BankAccount | Encrypted string fields | ProcurementVendorBankDetail fields |
| GLAccountReference | `String?` FK fields | `glAccountId` fields |
| CostCenterReference | `String?` FK fields | `costCenterId` fields |
| ApprovalDecision | Fields on ApprovalRecord | `status` + `decision` + `decisionAt` + `decisionBy` + `decisionComment` |
| PaymentMethod | `String` enum field | `paymentMethod` fields |
| ExchangeRate | `Decimal(20,8)` rate + `String` currency fields | `exchangeRate` + `baseCurrency` fields |

---

## 2. Enum Definitions

```prisma
// ── Vendor ──────────────────────────────────────────────────────────────────

enum VendorStatus {
  PENDING_REVIEW
  ACTIVE
  SUSPENDED
  DEACTIVATED
}

enum VendorRiskLevel {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum VendorCategory {
  SUPPLIER
  CONTRACTOR
  CONSULTANT
  SERVICE_PROVIDER
  DISTRIBUTOR
  MANUFACTURER
}

enum VendorPreferredPaymentMethod {
  ACH
  WIRE
  CHECK
  EFT
  VIRTUAL_CARD
}

enum VendorBankAccountType {
  CHECKING
  SAVINGS
}

enum VendorDocumentStatus {
  VALID
  EXPIRED
  PENDING
}

// ── Purchase Order Reference ────────────────────────────────────────────────

enum POReferenceStatus {
  DRAFT
  SUBMITTED
  APPROVED
  PARTIALLY_RECEIVED
  FULLY_RECEIVED
  CANCELLED
}

enum POReferenceLineItemStatus {
  PENDING
  PARTIALLY_RECEIVED
  FULLY_RECEIVED
  CLOSED
}

// ── Goods Receipt Reference ─────────────────────────────────────────────────

enum GRNReferenceStatus {
  RECEIVED
  INSPECTED
  ACCEPTED
  REJECTED
  PARTIAL
}

enum GRNReferenceLineItemCondition {
  GOOD
  DAMAGED
  DEFECTIVE
  MIXED
}

// ── Invoice ─────────────────────────────────────────────────────────────────

enum VendorInvoiceStatus {
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

enum VendorInvoiceSource {
  EMAIL
  SCAN
  EDI
  PORTAL
  MANUAL
  API
}

enum InvoiceLineItemTaxType {
  VAT
  GST
  SALES_TAX
  WITHHOLDING
  EXEMPT
}

enum InvoiceLineItemMatchStatus {
  MATCHED
  VARIANCE
  UNMATCHED
}

enum InvoiceAttachmentCategory {
  INVOICE_COPY
  SUPPORTING_DOC
  CONTRACT
  EMAIL_THREAD
  RECEIPT
  DELIVERY_NOTE
}

// ── Three-Way Match ─────────────────────────────────────────────────────────

enum ThreeWayMatchResult {
  FULL_MATCH
  PARTIAL_MATCH
  PRICE_VARIANCE
  QTY_VARIANCE
  NO_MATCH
}

enum MatchLineItemStatus {
  EXACT_MATCH
  PRICE_VARIANCE
  QTY_VARIANCE
  NO_MATCH
}

// ── Invoice Exception ───────────────────────────────────────────────────────

enum InvoiceExceptionType {
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

enum InvoiceExceptionSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum InvoiceExceptionStatus {
  OPEN
  IN_REVIEW
  RESOLVED
  WAIVED
  ESCALATED
}

// ── Approval ────────────────────────────────────────────────────────────────

enum ApprovalRecordStatus {
  PENDING
  APPROVED
  REJECTED
  DELEGATED
  SKIPPED
}

enum ApprovalRecordDecision {
  APPROVE
  REJECT
  REQUEST_INFO
  DELEGATE
}

// ── Payment ─────────────────────────────────────────────────────────────────

enum PaymentProposalStatus {
  DRAFT
  SUBMITTED
  REVIEWED
  APPROVED
  REJECTED
  EXECUTED
  CANCELLED
}

enum PaymentProposalItemSelection {
  AUTO
  MANUAL
  DISCOUNT_OPTIMIZED
}

enum PaymentBatchStatus {
  PENDING
  GENERATING
  READY
  SUBMITTED
  COMPLETED
  FAILED
  CANCELLED
}

enum PaymentRecordStatus {
  PROCESSED
  CLEARED
  VOIDED
  FAILED
  REVERSED
}

// ── Vendor Statement & Reconciliation ───────────────────────────────────────

enum VendorStatementStatus {
  RECEIVED
  PARSING
  PARSED
  RECONCILING
  RECONCILED
  EXCEPTION
}

enum VendorStatementLineTransactionType {
  INVOICE
  PAYMENT
  CREDIT
  ADJUSTMENT
  FEE
}

enum VendorStatementLineMatchStatus {
  UNMATCHED
  MATCHED
  PARTIAL
  EXCEPTION
}

enum ReconciliationResultStatus {
  IN_PROGRESS
  COMPLETED
  EXCEPTION
  ADJUSTED
}

// ── Vendor Credit ───────────────────────────────────────────────────────────

enum VendorCreditStatus {
  ISSUED
  PARTIALLY_APPLIED
  FULLY_APPLIED
  EXPIRED
}

// ── Audit ───────────────────────────────────────────────────────────────────

enum APAuditAction {
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

**Total: 33 enum types.**

---

## 3. Prisma Schema Specification

Each model is specified with exact field types, `@db` annotations, `@map()` where needed, foreign key relations, unique constraints, and index annotations. Derived/computed fields are marked with comments indicating they are computed at the service layer.

---

### 3.1 ProcurementVendor

Aggregate Root. Master data for all AP interactions.

```prisma
model ProcurementVendor {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)

  /// Identity & Classification
  vendorCode String // UNIQUE per (companyId). Human-readable code e.g. "VEN-00001"
  name       String // Display name, 1–255 chars
  legalName  String // Registered legal entity name
  status     VendorStatus @default(PENDING_REVIEW)
  riskLevel  VendorRiskLevel @default(LOW)
  riskScore  Decimal @default(0) @db.Decimal(5, 2) // 0.00–100.00
  category   VendorCategory

  /// Tax & Compliance
  taxId      String // Tax identification number — UNIQUE per (companyId)
  taxCountry String // ISO 3166-1 alpha-2

  /// Financial Defaults
  currency              String @default("USD") // ISO 4217
  billingAddress        String?
  shippingAddress       String?
  paymentTerms          String @default("NET30") // Payment terms code
  preferredPaymentMethod VendorPreferredPaymentMethod @default(ACH)
  creditLimit           Decimal @default(0) @db.Decimal(38, 12)

  /// Banking
  bankAccountId String? // Reference to Banking context

  /// Vendor Ranking
  preferred      Boolean @default(false)
  preferredRank  Int? // ≥ 1 among preferred vendors

  /// Blocking
  isBlocked   Boolean @default(false)
  blockReason String?

  /// Aggregated Metrics (computed by service layer from invoice/payment history)
  rating         Decimal @default(0) @db.Decimal(3, 1) // 0.0–5.0
  totalSpend     Decimal @default(0) @db.Decimal(38, 12)
  totalOrders    Int     @default(0)
  avgPaymentDays Int     @default(0)

  /// Contact
  contactName  String?
  contactEmail String?
  contactPhone String?

  /// Tags
  tags String @default("[]") // JSON array of strings

  /// Lifecycle
  onboardingDate DateTime @default(now()) // Immutable
  lastOrderDate  DateTime?

  /// Audit
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  createdBy String
  updatedBy String

  /// Optimistic concurrency (aggregate root)
  version Int @default(0)

  /// Child entities (relation fields)
  bankDetails    ProcurementVendorBankDetail[]
  performances   ProcurementVendorPerformance[]
  documents      ProcurementVendorDocument[]
  credits        ProcurementVendorCredit[]
  invoices       ProcurementVendorInvoice[]
  poReferences   ProcurementPOReference[]
  grnReferences  ProcurementGRNReference[]
  approvalRecords     ProcurementApprovalRecord[]
  paymentProposalItems ProcurementPaymentProposalItem[]
  paymentRecords      ProcurementPaymentRecord[]
  reconciliationResults ProcurementReconciliationResult[]
  vendorStatements     ProcurementVendorStatement[]

  /// Constraints
  @@unique([companyId, vendorCode])
  @@unique([companyId, taxId])
  @@index([companyId])
  @@index([companyId, status])
  @@index([companyId, category])
  @@index([companyId, currency])
  @@index([companyId, preferred])
  @@index([companyId, isBlocked])
}
```

---

### 3.2 ProcurementVendorBankDetail

Child Entity. Encrypted bank account details for PCI-DSS scope isolation.

```prisma
model ProcurementVendorBankDetail {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  /// Parent vendor
  vendorId  String
  vendor    ProcurementVendor @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  /// Bank Information
  bankName        String
  bankCountry     String // ISO 3166-1 alpha-2
  routingNumber   String // AES-256-GCM encrypted at application layer
  accountNumber   String // AES-256-GCM encrypted at application layer
  accountHolderName String
  accountType     VendorBankAccountType

  /// Status & Verification
  isPrimary Boolean @default(false)
  isActive  Boolean @default(true)
  verifiedAt DateTime?
  verifiedBy String?

  /// Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  updatedBy String

  /// Constraints
  @@index([companyId])
  @@index([vendorId])
}
```

---

### 3.3 ProcurementVendorPerformance

Child Entity (immutable). Periodic performance scores — append-only historical snapshots.

```prisma
model ProcurementVendorPerformance {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  /// Parent vendor
  vendorId  String
  vendor    ProcurementVendor @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  /// Period
  period String // "YYYY-Q[N]" or "YYYY-MM"

  /// Scores (0.00–100.00)
  onTimeDelivery  Decimal @default(0) @db.Decimal(5, 2)
  qualityScore    Decimal @default(0) @db.Decimal(5, 2)
  responseTime    Decimal @default(0) @db.Decimal(5, 2)
  invoiceAccuracy Decimal @default(0) @db.Decimal(5, 2)
  returnRate      Decimal @default(0) @db.Decimal(5, 2)
  overallScore    Decimal @default(0) @db.Decimal(5, 2) // Weighted composite

  /// Aggregated Metrics
  totalOrders Int     @default(0)
  totalAmount Decimal @default(0) @db.Decimal(38, 12)

  /// Audit — immutable (no updatedAt)
  createdAt DateTime @default(now())

  /// Constraints
  @@unique([companyId, vendorId, period])
  @@index([companyId])
  @@index([vendorId])
  @@index([companyId, vendorId])
}
```

---

### 3.4 ProcurementVendorDocument

Child Entity. Compliance documents — W-9, insurance, contracts, licenses.

```prisma
model ProcurementVendorDocument {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  /// Parent vendor
  vendorId  String
  vendor    ProcurementVendor @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  /// Document Details
  type      String // "W9", "INSURANCE", "CONTRACT", "LICENSE"
  name      String // Display name
  reference String? // External reference number
  expiryDate DateTime?
  status    VendorDocumentStatus @default(VALID)
  fileUrl   String?

  /// Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  updatedBy String

  /// Constraints
  @@index([companyId])
  @@index([vendorId])
  @@index([vendorId, status])
}
```

---

### 3.5 ProcurementVendorCredit

Aggregate Root. Credit notes issued by vendors — reduces amount owed.

```prisma
model ProcurementVendorCredit {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  /// Issuing vendor
  vendorId  String
  vendor    ProcurementVendor @relation(fields: [vendorId], references: [id], onDelete: Restrict)

  /// Credit Details
  creditNumber String // UNIQUE per (companyId, vendorId)
  creditDate   DateTime // Date of credit note
  creditAmount Decimal @db.Decimal(38, 12) // Total credit value, > 0
  appliedAmount Decimal @default(0) @db.Decimal(38, 12) // Running total, ≥ 0, ≤ creditAmount
  currency     String // ISO 4217

  /// Status
  status VendorCreditStatus @default(ISSUED)

  /// Application
  appliedToInvoiceId String? // FK → VendorInvoice (which invoice credit is applied to)
  appliedToInvoice   ProcurementVendorInvoice? @relation(fields: [appliedToInvoiceId], references: [id], onDelete: SetNull)

  /// Lifecycle
  expiryDate DateTime? // Expiration date

  /// Details
  reason String? // Reason for credit

  /// Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  updatedBy String

  /// Optimistic concurrency (aggregate root)
  version Int @default(0)

  /// Constraints
  @@unique([companyId, vendorId, creditNumber])
  @@index([companyId])
  @@index([vendorId])
  @@index([vendorId, status])
  @@index([appliedToInvoiceId])
}
```

---

### 3.6 ProcurementPOReference

Reference Entity (read-only from AP). Synced snapshot of Purchase Orders from Procurement module.

```prisma
model ProcurementPOReference {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)

  /// PO Identity
  poNumber String // UNIQUE per (companyId). PO number from Procurement
  poId     String // Source PO id in Procurement module

  /// PO Reference
  vendorId String
  vendor   ProcurementVendor @relation(fields: [vendorId], references: [id], onDelete: Restrict)

  /// PO Details
  status               POReferenceStatus
  orderDate            DateTime
  expectedDeliveryDate DateTime?
  currency             String @default("USD") // ISO 4217

  /// Financial (snapshots from Procurement)
  totalAmount    Decimal @db.Decimal(38, 12) // Total PO amount
  receivedAmount Decimal @default(0) @db.Decimal(38, 12) // Accumulated GRN value (mutated by AP on GRN sync)
  taxAmount      Decimal @default(0) @db.Decimal(38, 12)
  shippingAmount Decimal @default(0) @db.Decimal(38, 12)
  paymentTerms   String? // Snapshot of terms at PO time

  /// References
  requestedBy  String? // Requester userId
  approvedBy   String? // Approver userId
  approvalDate DateTime?

  /// Sync
  syncedAt DateTime // When AP last synced from Procurement

  /// Child entities
  lineItems     ProcurementPOReferenceLineItem[]
  grnReferences ProcurementGRNReference[]
  invoices      ProcurementVendorInvoice[]
  threeWayMatches ProcurementThreeWayMatch[]

  /// Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  updatedBy String

  /// Constraints
  @@unique([companyId, poNumber])
  @@index([companyId])
  @@index([vendorId])
  @@index([companyId, status])
  @@index([companyId, orderDate])
}
```

---

### 3.7 ProcurementPOReferenceLineItem

Child Entity. Line-level detail of a PO reference for line-level 3-way matching.

```prisma
model ProcurementPOReferenceLineItem {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  /// Parent PO reference
  poReferenceId String
  poReference   ProcurementPOReference @relation(fields: [poReferenceId], references: [id], onDelete: Cascade)

  /// Line Details
  lineNumber      Int // ≥ 1
  description     String
  quantity        Decimal @db.Decimal(20, 4) // Ordered quantity, > 0
  unitOfMeasure   String
  unitPrice       Decimal @db.Decimal(38, 12)
  lineTotal       Decimal @db.Decimal(38, 12) // Derived: quantity × unitPrice
  taxRate         Decimal @default(0) @db.Decimal(5, 4) // 0.0000–1.0000
  taxAmount       Decimal @default(0) @db.Decimal(38, 12)
  glAccountId     String? // FK → GL Account
  costCenterId    String? // FK → Cost Center

  /// Accumulated Receipts & Invoicing (mutated by AP on GRN/invoice sync)
  receivedQuantity  Decimal @default(0) @db.Decimal(20, 4)
  invoicedQuantity  Decimal @default(0) @db.Decimal(20, 4)
  status            POReferenceLineItemStatus @default(PENDING)

  /// Child references
  grnLineItems ProcurementGRNReferenceLineItem[]

  /// Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  updatedBy String

  /// Constraints
  @@unique([companyId, poReferenceId, lineNumber])
  @@index([companyId])
  @@index([poReferenceId])
}
```

---

### 3.8 ProcurementGRNReference

Reference Entity (read-only from AP). Synced snapshot of Goods Receipt Notes from Warehouse.

```prisma
model ProcurementGRNReference {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)

  /// GRN Identity
  grnNumber String // UNIQUE per (companyId). GRN number
  grnId     String // Source GRN id in Warehouse module

  /// GRN Reference
  poReferenceId String
  poReference   ProcurementPOReference @relation(fields: [poReferenceId], references: [id], onDelete: Restrict)
  vendorId      String
  vendor        ProcurementVendor @relation(fields: [vendorId], references: [id], onDelete: Restrict)

  /// GRN Details
  receiptDate    DateTime
  status         GRNReferenceStatus @default(RECEIVED)
  receivedBy     String // userId of receiver
  warehouseLocation String?

  /// Financial (snapshots from Warehouse)
  totalValue Decimal @db.Decimal(38, 12)
  totalTax   Decimal @default(0) @db.Decimal(38, 12)

  /// Inspection
  inspectionNotes String?

  /// Sync
  syncedAt DateTime // When AP last synced from Warehouse

  /// Child entities
  lineItems ProcurementGRNReferenceLineItem[]

  /// Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  updatedBy String

  /// Constraints
  @@unique([companyId, grnNumber])
  @@index([companyId])
  @@index([poReferenceId])
  @@index([vendorId])
  @@index([companyId, status])
}
```

---

### 3.9 ProcurementGRNReferenceLineItem

Child Entity. Line-level detail of a GRN reference for line-level 3-way matching.

```prisma
model ProcurementGRNReferenceLineItem {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  /// Parent GRN reference
  grnReferenceId String
  grnReference   ProcurementGRNReference @relation(fields: [grnReferenceId], references: [id], onDelete: Cascade)
  /// Matching PO line
  poReferenceLineItemId String
  poReferenceLineItem   ProcurementPOReferenceLineItem @relation(fields: [poReferenceLineItemId], references: [id], onDelete: Restrict)

  /// Line Details
  lineNumber       Int // ≥ 1
  description      String
  quantityReceived Decimal @db.Decimal(20, 4) // > 0
  quantityAccepted Decimal @db.Decimal(20, 4) // ≥ 0
  quantityRejected Decimal @default(0) @db.Decimal(20, 4)
  unitOfMeasure    String
  unitPrice        Decimal @db.Decimal(38, 12)
  lineTotal        Decimal @db.Decimal(38, 12) // Derived: quantityAccepted × unitPrice
  condition        GRNReferenceLineItemCondition @default(GOOD)

  /// Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  updatedBy String

  /// Constraints
  @@unique([companyId, grnReferenceId, lineNumber])
  @@index([companyId])
  @@index([grnReferenceId])
  @@index([poReferenceLineItemId])
}
```

---

### 3.10 ProcurementVendorInvoice

Aggregate Root (CORE). Central AP entity — the entire AP lifecycle revolves around this model.

```prisma
model ProcurementVendorInvoice {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  /// Invoice vendor
  vendorId  String
  vendor    ProcurementVendor @relation(fields: [vendorId], references: [id], onDelete: Restrict)

  /// Invoice Identity
  invoiceNumber String // UNIQUE per (companyId, vendorId)
  invoiceDate   DateTime
  dueDate       DateTime // Computed from invoiceDate + paymentTerms
  receivedDate  DateTime @default(now())

  /// Status (value object: status + previousStatus + statusChangedAt)
  status          VendorInvoiceStatus @default(DRAFT)
  previousStatus  VendorInvoiceStatus?
  statusChangedAt DateTime?

  /// PO & GRN References (nullable for non-PO invoices)
  poReferenceId  String?
  poReference    ProcurementPOReference? @relation(fields: [poReferenceId], references: [id], onDelete: SetNull)
  grnReferenceId String?
  grnReference   ProcurementGRNReference? @relation(fields: [grnReferenceId], references: [id], onDelete: SetNull)

  /// Currency & Exchange (value object: ExchangeRate)
  currency     String @default("USD") // ISO 4217
  exchangeRate Decimal @default(1) @db.Decimal(20, 8) // > 0
  baseCurrency String @default("USD") // ISO 4217

  /// Financial — Monetary fields use Decimal(38,12)
  subtotal       Decimal @db.Decimal(38, 12) // Sum of line totals before tax
  taxAmount      Decimal @default(0) @db.Decimal(38, 12)
  discountAmount Decimal @default(0) @db.Decimal(38, 12) // Early payment discount
  shippingAmount Decimal @default(0) @db.Decimal(38, 12)
  totalAmount    Decimal @db.Decimal(38, 12) // Derived: subtotal + taxAmount + shippingAmount - discountAmount
  totalWithTax   Decimal @db.Decimal(38, 12) // Derived: subtotal + taxAmount
  amountPaid     Decimal @default(0) @db.Decimal(38, 12) // Running total paid
  balanceDue     Decimal @db.Decimal(38, 12) // Derived: totalAmount - amountPaid
  creditApplied  Decimal @default(0) @db.Decimal(38, 12) // Vendor credits applied
  netBalance     Decimal @db.Decimal(38, 12) // Derived: balanceDue - creditApplied

  /// Payment Configuration
  paymentTerms String?
  paymentMethod VendorPreferredPaymentMethod?

  /// GL Coding
  glAccountId  String?
  costCenterId String?
  departmentId String?
  projectId    String?

  /// Description & Notes
  description   String?
  vendorMemo    String?
  internalMemo  String?

  /// OCR & AI (value objects: OCR result, DuplicateConfidence)
  ocrConfidence Decimal @default(0) @db.Decimal(5, 2) // 0.00–100.00
  ocrRawText    String? // Raw OCR output for audit (immutable after capture)

  /// Duplicate Detection (value object: DuplicateConfidence)
  isDuplicateSuspicion  Boolean @default(false)
  duplicateConfidence   Decimal @default(0) @db.Decimal(5, 2) // 0.00–100.00
  duplicateOfInvoiceId  String? // FK → VendorInvoice (self-reference)
  duplicateOfInvoice    ProcurementVendorInvoice? @relation("DuplicateInvoice", fields: [duplicateOfInvoiceId], references: [id], onDelete: SetNull)

  /// Three-Way Match (value object: MatchStatus)
  matchResult       ThreeWayMatchResult?
  varianceAmount    Decimal @default(0) @db.Decimal(38, 12)
  varianceThreshold Decimal @default(5) @db.Decimal(5, 2) // Auto-approve threshold %

  /// Approval
  approvalRequired Boolean @default(false)
  approvedAt       DateTime?
  approvedBy       String?
  rejectedAt       DateTime?
  rejectedBy       String?
  rejectionReason  String?

  /// Payment Assignment
  paymentBatchId    String?
  paymentBatch      ProcurementPaymentBatch? @relation(fields: [paymentBatchId], references: [id], onDelete: SetNull)
  paymentProposalId String?
  paymentProposal   ProcurementPaymentProposal? @relation(fields: [paymentProposalId], references: [id], onDelete: SetNull)
  paymentDate       DateTime?
  paymentReference  String?
  checkNumber       String?

  /// GL Posting
  accrualPosted  Boolean @default(false)
  accrualReversed Boolean @default(false)
  glPosted       Boolean @default(false)
  glPostedAt     DateTime?
  periodId       String? // Accounting period

  /// Idempotency
  idempotencyKey String? @unique // Unique constraint for payment operations

  /// Source (immutable after creation)
  source VendorInvoiceSource @default(MANUAL)

  /// Child entities
  lineItems      ProcurementInvoiceLineItem[]
  attachments    ProcurementInvoiceAttachment[]
  threeWayMatch  ProcurementThreeWayMatch?
  exceptions     ProcurementInvoiceException[]
  approvalRecords ProcurementApprovalRecord[]
  paymentProposalItems ProcurementPaymentProposalItem[]
  paymentRecords       ProcurementPaymentRecord[]
  vendorCredits        ProcurementVendorCredit[]
  statementLines       ProcurementVendorStatementLine[]

  /// Duplicate detection (reverse relation)
  suspectedDuplicates ProcurementVendorInvoice[] @relation("DuplicateInvoice")

  /// Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  updatedBy String

  /// Optimistic concurrency (aggregate root)
  version Int @default(0)

  /// Constraints
  @@unique([companyId, vendorId, invoiceNumber])
  @@index([companyId])
  @@index([vendorId])
  @@index([companyId, status])
  @@index([companyId, invoiceDate])
  @@index([companyId, dueDate])
  @@index([companyId, status, dueDate]) // Aging report query
  @@index([companyId, vendorId, status]) // Per-vendor outstanding balance
  @@index([poReferenceId])
  @@index([grnReferenceId])
  @@index([paymentBatchId])
  @@index([paymentProposalId])
  @@index([duplicateOfInvoiceId])
  @@index([companyId, currency])
  @@index([companyId, receivedDate])
}
```

---

### 3.11 ProcurementInvoiceLineItem

Child Entity. Individual invoice lines with GL coding, tax, and match results.

```prisma
model ProcurementInvoiceLineItem {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  /// Parent invoice
  vendorInvoiceId String
  vendorInvoice   ProcurementVendorInvoice @relation(fields: [vendorInvoiceId], references: [id], onDelete: Cascade)

  /// Line Details
  lineNumber    Int // ≥ 1
  description   String
  quantity      Decimal @db.Decimal(20, 4) // > 0
  unitOfMeasure String?
  unitPrice     Decimal @db.Decimal(38, 12)
  lineTotal     Decimal @db.Decimal(38, 12) // Derived: quantity × unitPrice

  /// Line-Level Discount
  discountPercent Decimal @default(0) @db.Decimal(5, 2) // 0.00–100.00
  discountAmount  Decimal @default(0) @db.Decimal(38, 12)
  netLineTotal    Decimal @db.Decimal(38, 12) // Derived: lineTotal - discountAmount

  /// Tax (value object: TaxRate)
  taxRate       Decimal @default(0) @db.Decimal(5, 4) // 0.0000–1.0000
  taxAmount     Decimal @db.Decimal(38, 12) // Derived: netLineTotal × taxRate
  taxJurisdiction String?
  taxType       InvoiceLineItemTaxType?

  /// GL Coding
  glAccountId  String?
  costCenterId String?
  departmentId String?
  projectId    String?

  /// Three-Way Match References
  poReferenceLineItemId   String?
  poReferenceLineItem     ProcurementPOReferenceLineItem? @relation(fields: [poReferenceLineItemId], references: [id], onDelete: SetNull)
  grnReferenceLineItemId  String?
  grnReferenceLineItem    ProcurementGRNReferenceLineItem? @relation(fields: [grnReferenceLineItemId], references: [id], onDelete: SetNull)

  /// Match Results
  matchStatus  InvoiceLineItemMatchStatus?
  matchVariance Decimal @default(0) @db.Decimal(38, 12) // Price/qty variance from PO

  /// Match Line Item (1:1 reverse relation)
  matchLineItem ProcurementMatchLineItem?

  /// Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  updatedBy String

  /// Constraints
  @@unique([companyId, vendorInvoiceId, lineNumber])
  @@index([companyId])
  @@index([vendorInvoiceId])
  @@index([poReferenceLineItemId])
  @@index([grnReferenceLineItemId])
}
```

---

### 3.12 ProcurementInvoiceAttachment

Child Entity (immutable). Supporting documents attached to an invoice.

```prisma
model ProcurementInvoiceAttachment {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  /// Parent invoice
  vendorInvoiceId String
  vendorInvoice   ProcurementVendorInvoice @relation(fields: [vendorInvoiceId], references: [id], onDelete: Cascade)

  /// File Details
  fileName   String
  fileType   String // MIME type
  fileSize   Int // Size in bytes, ≥ 0
  storageUrl String

  /// Category
  category InvoiceAttachmentCategory @default(INVOICE_COPY)

  /// OCR
  ocrExtracted Boolean @default(false)

  /// Audit — immutable (no updatedAt, no updatedBy)
  createdAt DateTime @default(now())
  createdBy String

  /// Constraints
  @@index([companyId])
  @@index([vendorInvoiceId])
  @@index([vendorInvoiceId, category])
}
```

---

### 3.13 ProcurementThreeWayMatch

Aggregate Root. Records the result of a 3-way match between PO, GRN, and Invoice.

```prisma
model ProcurementThreeWayMatch {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  /// Invoice being matched (one match per invoice)
  vendorInvoiceId String @unique
  vendorInvoice   ProcurementVendorInvoice @relation(fields: [vendorInvoiceId], references: [id], onDelete: Restrict)
  /// PO being matched against
  poReferenceId String
  poReference   ProcurementPOReference @relation(fields: [poReferenceId], references: [id], onDelete: Restrict)
  /// GRN being matched against
  grnReferenceId String
  grnReference   ProcurementGRNReference @relation(fields: [grnReferenceId], references: [id], onDelete: Restrict)

  /// Match Result
  matchResult       ThreeWayMatchResult
  overallConfidence Decimal @db.Decimal(5, 2) // 0.00–100.00

  /// Variance Summary
  priceVarianceTotal  Decimal @default(0) @db.Decimal(38, 12)
  quantityVarianceTotal Decimal @default(0) @db.Decimal(38, 12)
  totalVariance       Decimal @db.Decimal(38, 12) // Derived: priceVarianceTotal + quantityVarianceTotal
  variancePercent     Decimal @default(0) @db.Decimal(5, 2) // Variance as % of PO total

  /// Auto-Approval
  autoApproved      Boolean @default(false)
  approvalThreshold Decimal @default(5) @db.Decimal(5, 2) // Variance % threshold

  /// Match Metadata
  matchedAt  DateTime @default(now())
  matchedBy  String // "SYSTEM" or userId

  /// Child entities
  lineItems ProcurementMatchLineItem[]

  /// Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  updatedBy String

  /// Optimistic concurrency (aggregate root)
  version Int @default(0)

  /// Constraints
  @@index([companyId])
  @@index([vendorInvoiceId])
  @@index([poReferenceId])
  @@index([grnReferenceId])
  @@index([companyId, matchResult])
}
```

---

### 3.14 ProcurementMatchLineItem

Child Entity. Per-line match result within a 3-way match.

```prisma
model ProcurementMatchLineItem {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  /// Parent match
  threeWayMatchId String
  threeWayMatch   ProcurementThreeWayMatch @relation(fields: [threeWayMatchId], references: [id], onDelete: Cascade)
  /// Invoice line being matched (1:1)
  invoiceLineItemId String @unique
  invoiceLineItem   ProcurementInvoiceLineItem @relation(fields: [invoiceLineItemId], references: [id], onDelete: Restrict)
  /// Matched PO line (nullable if NO_MATCH)
  poReferenceLineItemId String?
  poReferenceLineItem   ProcurementPOReferenceLineItem? @relation(fields: [poReferenceLineItemId], references: [id], onDelete: SetNull)
  /// Matched GRN line (nullable for 2-way match)
  grnReferenceLineItemId String?
  grnReferenceLineItem   ProcurementGRNReferenceLineItem? @relation(fields: [grnReferenceLineItemId], references: [id], onDelete: SetNull)

  /// Match Status
  matchStatus MatchLineItemStatus

  /// Invoice Values (snapshot at match time)
  invoiceQuantity  Decimal @db.Decimal(20, 4)
  invoiceUnitPrice Decimal @db.Decimal(38, 12)

  /// PO Values (nullable if no PO line matched)
  poQuantity  Decimal? @db.Decimal(20, 4)
  poUnitPrice Decimal? @db.Decimal(38, 12)

  /// GRN Values (nullable if no GRN line matched)
  grnQuantity Decimal? @db.Decimal(20, 4)

  /// Variances
  priceVariance   Decimal @default(0) @db.Decimal(38, 12)
  quantityVariance Decimal @default(0) @db.Decimal(20, 4)

  /// Confidence
  confidence Decimal @db.Decimal(5, 2) // 0.00–100.00

  /// Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  updatedBy String

  /// Constraints
  @@index([companyId])
  @@index([threeWayMatchId])
  @@index([invoiceLineItemId])
  @@index([poReferenceLineItemId])
}
```

---

### 3.15 ProcurementInvoiceException

Aggregate Root. Exception management with independent lifecycle, SLA, and escalation.

```prisma
model ProcurementInvoiceException {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  /// Invoice with exception
  vendorInvoiceId String
  vendorInvoice   ProcurementVendorInvoice @relation(fields: [vendorInvoiceId], references: [id], onDelete: Restrict)

  /// Exception Details
  exceptionType InvoiceExceptionType
  severity      InvoiceExceptionSeverity @default(MEDIUM)
  description   String

  /// Financial Impact
  varianceAmount Decimal @default(0) @db.Decimal(38, 12)
  relatedEntityId String? // Related entity (PO, GRN, Invoice)

  /// Resolution Lifecycle
  status     InvoiceExceptionStatus @default(OPEN)
  assignedTo String?
  resolution String?
  resolvedAt DateTime?
  resolvedBy String?

  /// Escalation
  escalatedTo String?
  escalatedAt DateTime?

  /// Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  updatedBy String

  /// Optimistic concurrency (aggregate root)
  version Int @default(0)

  /// Constraints
  @@index([companyId])
  @@index([vendorInvoiceId])
  @@index([vendorInvoiceId, status]) // Active exceptions per invoice
  @@index([companyId, status]) // Exception queue queries
  @@index([companyId, severity]) // Severity-based prioritization
  @@index([assignedTo])
  @@index([exceptionType])
}
```

---

### 3.16 ProcurementApprovalRecord

Aggregate Root (per invoice). Per-level approval decisions for invoices.

```prisma
model ProcurementApprovalRecord {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  /// Invoice being approved
  vendorInvoiceId String
  vendorInvoice   ProcurementVendorInvoice @relation(fields: [vendorInvoiceId], references: [id], onDelete: Restrict)

  /// Approval Level Configuration
  approvalLevel     Int // ≥ 1, level in hierarchy
  approvalLevelName String // Human-readable: "AP Clerk", "Controller", etc.
  requiredRole      String
  requiredThreshold Decimal @db.Decimal(38, 12) // Amount threshold for this level

  /// Decision
  status          ApprovalRecordStatus @default(PENDING)
  decision        ApprovalRecordDecision?
  decisionAt      DateTime?
  decisionBy      String?
  decisionComment String?

  /// Delegation
  delegatedTo     String?
  delegatedAt     DateTime?
  delegationReason String?

  /// Escalation
  escalated       Boolean @default(false)
  escalatedAt     DateTime?
  escalationReason String?

  /// SLA
  timeLimit DateTime? // Deadline for decision — triggers auto-escalation

  /// Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  updatedBy String

  /// Optimistic concurrency (aggregate root)
  version Int @default(0)

  /// Constraints
  @@index([companyId])
  @@index([vendorInvoiceId])
  @@index([vendorInvoiceId, status]) // Active approvals per invoice
  @@index([approvalLevel])
  @@index([decisionBy])
  @@index([status, timeLimit]) // SLA monitoring query
}
```

---

### 3.17 ProcurementApprovalLevel

Configuration Entity. Approval authority level definitions — reusable across all invoices.

```prisma
model ProcurementApprovalLevel {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)

  /// Level Configuration
  levelNumber Int // ≥ 1, UNIQUE per (companyId)
  levelName   String // e.g., "AP Clerk", "AP Manager", "Controller", "CFO"
  minAmount   Decimal @db.Decimal(38, 12) // Lower bound (inclusive), ≥ 0
  maxAmount   Decimal? @db.Decimal(38, 12) // Upper bound (inclusive), NULL for unlimited
  requiredRoles String @default("[]") // JSON array of role strings

  /// Optional Constraints
  requiredDepartment String?

  /// Capabilities
  canDelegate Boolean @default(true)
  canEscalate Boolean @default(true)

  /// SLA
  timeLimitHours Int @default(48) // Hours before auto-escalation

  /// Status
  isActive Boolean @default(true)

  /// Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  updatedBy String

  /// Optimistic concurrency (configuration entity)
  version Int @default(0)

  /// Constraints
  @@unique([companyId, levelNumber])
  @@index([companyId])
  @@index([companyId, isActive])
}
```

---

### 3.18 ProcurementPaymentProposal

Aggregate Root. Batch payment planning — groups approved invoices for payment.

```prisma
model ProcurementPaymentProposal {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)

  /// Proposal Identity
  proposalNumber String // UNIQUE per (companyId), sequential
  proposalDate   DateTime @default(now())
  paymentDate    DateTime // Target payment date

  /// Financial
  currency      String @default("USD") // ISO 4217
  totalAmount   Decimal @db.Decimal(38, 12) // Derived: sum of all items
  totalInvoices Int @default(0) // Derived: count of invoices
  totalVendors  Int @default(0) // Derived: count of unique vendors

  /// Payment Configuration
  paymentMethod          VendorPreferredPaymentMethod @default(ACH)
  prioritizeDiscounts    Boolean @default(false)
  includePartialPayments Boolean @default(false)

  /// Status
  status PaymentProposalStatus @default(DRAFT)

  /// Workflow
  submittedBy  String?
  submittedAt  DateTime?
  reviewedBy   String?
  reviewedAt   DateTime?
  approvedBy   String?
  approvedAt   DateTime?
  rejectedBy   String?
  rejectionReason String?

  /// Generated Batch
  paymentBatchId String?
  paymentBatch   ProcurementPaymentBatch? @relation(fields: [paymentBatchId], references: [id], onDelete: SetNull)

  /// Child entities
  items ProcurementPaymentProposalItem[]

  /// Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  updatedBy String

  /// Optimistic concurrency (aggregate root)
  version Int @default(0)

  /// Constraints
  @@unique([companyId, proposalNumber])
  @@index([companyId])
  @@index([companyId, status])
  @@index([companyId, paymentDate])
  @@index([paymentBatchId])
}
```

---

### 3.19 ProcurementPaymentProposalItem

Child Entity. Individual invoice entry in a payment proposal.

```prisma
model ProcurementPaymentProposalItem {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  /// Parent proposal
  paymentProposalId String
  paymentProposal   ProcurementPaymentProposal @relation(fields: [paymentProposalId], references: [id], onDelete: Cascade)
  /// Invoice to pay
  vendorInvoiceId String
  vendorInvoice   ProcurementVendorInvoice @relation(fields: [vendorInvoiceId], references: [id], onDelete: Restrict)
  /// Invoice vendor (denormalized)
  vendorId String
  vendor   ProcurementVendor @relation(fields: [vendorId], references: [id], onDelete: Restrict)

  /// Payment Amount
  amount         Decimal @db.Decimal(38, 12) // > 0, amount to pay
  discountTaken  Decimal @default(0) @db.Decimal(38, 12) // Early payment discount
  creditApplied  Decimal @default(0) @db.Decimal(38, 12) // Vendor credit applied
  netPayment     Decimal @db.Decimal(38, 12) // Derived: amount - discountTaken - creditApplied

  /// Selection
  paymentPriority Int     @default(100) // Lower = higher priority
  selectedBy      PaymentProposalItemSelection @default(AUTO)

  /// Notes
  notes String?

  /// Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  updatedBy String

  /// Constraints
  @@index([companyId])
  @@index([paymentProposalId])
  @@index([vendorInvoiceId])
  @@index([vendorId])
}
```

---

### 3.20 ProcurementPaymentBatch

Aggregate Root. Payment execution — bank file generation, idempotency, confirmation tracking.

```prisma
model ProcurementPaymentBatch {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)

  /// Batch Identity
  batchNumber String // UNIQUE per (companyId), sequential

  /// Source Proposal
  paymentProposalId String
  paymentProposal   ProcurementPaymentProposal @relation(fields: [paymentProposalId], references: [id], onDelete: Restrict)

  /// Payment Configuration
  paymentMethod VendorPreferredPaymentMethod
  bankAccountId String

  /// Financial
  totalPayments    Int @default(0) // Derived: count of payments
  totalAmount      Decimal @db.Decimal(38, 12) // Derived: sum of all payment amounts
  totalFees        Decimal @default(0) @db.Decimal(38, 12) // Bank fees
  netDisbursement  Decimal @db.Decimal(38, 12) // Derived: totalAmount + totalFees

  /// Bank File
  fileUrl  String?
  fileName String?

  /// Status
  status PaymentBatchStatus @default(PENDING)

  /// Workflow
  submittedAt  DateTime?
  completedAt  DateTime?
  confirmedBy  String?

  /// Child entities
  paymentRecords ProcurementPaymentRecord[]

  /// Invoices (reverse relation)
  invoices ProcurementVendorInvoice[]

  /// Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  updatedBy String

  /// Optimistic concurrency (aggregate root)
  version Int @default(0)

  /// Constraints
  @@unique([companyId, batchNumber])
  @@index([companyId])
  @@index([companyId, status])
  @@index([paymentProposalId])
}
```

---

### 3.21 ProcurementPaymentRecord

Aggregate Root (immutable after creation). Immutable record of each payment made.

```prisma
model ProcurementPaymentRecord {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)

  /// Payment Identity
  paymentNumber String // UNIQUE per (companyId), sequential

  /// References
  paymentBatchId  String
  paymentBatch    ProcurementPaymentBatch @relation(fields: [paymentBatchId], references: [id], onDelete: Restrict)
  vendorInvoiceId String
  vendorInvoice   ProcurementVendorInvoice @relation(fields: [vendorInvoiceId], references: [id], onDelete: Restrict)
  vendorId        String
  vendor          ProcurementVendor @relation(fields: [vendorId], references: [id], onDelete: Restrict)

  /// Payment Details
  paymentDate DateTime
  amount      Decimal @db.Decimal(38, 12) // > 0, gross payment
  discountTaken Decimal @default(0) @db.Decimal(38, 12)
  creditApplied Decimal @default(0) @db.Decimal(38, 12)
  netPayment    Decimal @db.Decimal(38, 12) // Derived: amount - discountTaken - creditApplied

  /// Currency & Exchange
  currency           String @default("USD") // ISO 4217
  exchangeRate       Decimal @default(1) @db.Decimal(20, 8)
  baseCurrencyAmount Decimal @db.Decimal(38, 12) // Derived: netPayment × exchangeRate

  /// Payment Method & Banking
  paymentMethod       VendorPreferredPaymentMethod
  bankAccountId       String
  transactionReference String?
  checkNumber         String?

  /// Status
  status PaymentRecordStatus @default(PROCESSED)

  /// GL Posting
  glPosted        Boolean @default(false)
  glPostedAt      DateTime?
  glReversalPosted Boolean @default(false)

  /// Idempotency
  idempotencyKey String? @unique

  /// Void Information (set only when status = VOIDED)
  voidedAt   DateTime?
  voidedBy   String?
  voidReason String?

  /// Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  updatedBy String

  /// Optimistic concurrency (aggregate root)
  version Int @default(0)

  /// Constraints
  @@unique([companyId, paymentNumber])
  @@index([companyId])
  @@index([paymentBatchId])
  @@index([vendorInvoiceId])
  @@index([vendorId])
  @@index([companyId, status])
  @@index([companyId, paymentDate])
  @@index([companyId, vendorId]) // Per-vendor payment history
  @@index([vendorInvoiceId, status]) // Payment status per invoice
}
```

---

### 3.22 ProcurementVendorStatement

Aggregate Root. Vendor's periodic statement of account for reconciliation.

```prisma
model ProcurementVendorStatement {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  /// Statement vendor
  vendorId String
  vendor   ProcurementVendor @relation(fields: [vendorId], references: [id], onDelete: Restrict)

  /// Statement Identity
  statementNumber String
  statementDate   DateTime // Period end date
  periodStart     DateTime
  periodEnd       DateTime

  /// Financial
  openingBalance Decimal @default(0) @db.Decimal(38, 12)
  totalInvoices  Decimal @default(0) @db.Decimal(38, 12)
  totalPayments  Decimal @default(0) @db.Decimal(38, 12)
  totalCredits   Decimal @default(0) @db.Decimal(38, 12)
  closingBalance Decimal @db.Decimal(38, 12) // Derived: opening + invoices - payments - credits
  currency       String @default("USD") // ISO 4217

  /// Status
  status VendorStatementStatus @default(RECEIVED)
  fileUrl String?

  /// Child entities
  lines              ProcurementVendorStatementLine[]
  reconciliationResult ProcurementReconciliationResult?

  /// Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  updatedBy String

  /// Optimistic concurrency (aggregate root)
  version Int @default(0)

  /// Constraints
  @@unique([companyId, vendorId, statementDate])
  @@index([companyId])
  @@index([vendorId])
  @@index([companyId, status])
  @@index([vendorId, statementDate])
}
```

---

### 3.23 ProcurementVendorStatementLine

Child Entity. Individual transaction on a vendor statement.

```prisma
model ProcurementVendorStatementLine {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  /// Parent statement
  vendorStatementId String
  vendorStatement   ProcurementVendorStatement @relation(fields: [vendorStatementId], references: [id], onDelete: Cascade)

  /// Line Details
  lineNumber      Int // ≥ 1
  transactionDate DateTime
  reference       String // Vendor reference (invoice #, payment ref)
  description     String

  /// Financial
  debitAmount  Decimal @default(0) @db.Decimal(38, 12) // Increases balance
  creditAmount Decimal @default(0) @db.Decimal(38, 12) // Decreases balance
  balance      Decimal @db.Decimal(38, 12) // Running balance

  /// Classification
  transactionType VendorStatementLineTransactionType

  /// Matching
  matchStatus     VendorStatementLineMatchStatus @default(UNMATCHED)
  matchedInvoiceId String?
  matchedInvoice   ProcurementVendorInvoice? @relation(fields: [matchedInvoiceId], references: [id], onDelete: SetNull)
  matchedPaymentId String?
  matchedPayment   ProcurementPaymentRecord? @relation(fields: [matchedPaymentId], references: [id], onDelete: SetNull)

  /// Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  updatedBy String

  /// Constraints
  @@index([companyId])
  @@index([vendorStatementId])
  @@index([matchedInvoiceId])
  @@index([matchedPaymentId])
  @@index([matchStatus])
  @@index([vendorStatementId, matchStatus]) // Unmatched lines per statement
}
```

---

### 3.24 ProcurementReconciliationResult

Aggregate Root. Outcome of reconciling a vendor statement against AP records.

```prisma
model ProcurementReconciliationResult {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
  /// Statement reconciled (one result per statement)
  vendorStatementId String @unique
  vendorStatement   ProcurementVendorStatement @relation(fields: [vendorStatementId], references: [id], onDelete: Restrict)
  /// Vendor (denormalized)
  vendorId String
  vendor   ProcurementVendor @relation(fields: [vendorId], references: [id], onDelete: Restrict)

  /// Reconciliation Details
  reconciliationDate DateTime @default(now())

  /// Balances
  apBalance      Decimal @db.Decimal(38, 12) // AP's recorded balance
  vendorBalance  Decimal @db.Decimal(38, 12) // Vendor's stated balance
  balanceVariance Decimal @db.Decimal(38, 12) // Derived: apBalance - vendorBalance

  /// Match Statistics
  totalLines    Int @default(0)
  matchedLines  Int @default(0)
  unmatchedLines Int @default(0) // Derived: totalLines - matchedLines
  matchRate     Decimal @default(0) @db.Decimal(5, 2) // Derived: matchedLines / totalLines × 100

  /// Status
  status ReconciliationResultStatus @default(IN_PROGRESS)

  /// Adjustment
  adjustmentAmount  Decimal @default(0) @db.Decimal(38, 12)
  adjustmentReason  String?
  adjustedBy        String?

  /// Resolution
  resolvedBy String?
  resolvedAt DateTime?

  /// Audit
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String
  updatedBy String

  /// Optimistic concurrency (aggregate root)
  version Int @default(0)

  /// Constraints
  @@index([companyId])
  @@index([vendorId])
  @@index([companyId, status])
}
```

---

### 3.25 ProcurementAPAuditRecord

Append-only Audit Log. Immutable record of every AP state transition and financial decision.

```prisma
model ProcurementAPAuditRecord {
  /// Primary identifier (CUID)
  id        String  @id @default(cuid())
  /// Multi-tenant owner
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)

  /// Entity Reference
  entityType String // e.g., "VendorInvoice", "PaymentRecord", "ApprovalRecord"
  entityId   String // ID of affected entity

  /// Action
  action APAuditAction

  /// Change Detail
  field    String? // Changed field (for UPDATED actions)
  oldValue String? // Previous value (JSON stringified)
  newValue String? // New value (JSON stringified)

  /// Financial Amount
  amount Decimal? @db.Decimal(38, 12) // Financial amount if applicable

  /// Description
  description String
  reason      String?

  /// Actor
  userId   String
  userRole String

  /// Request Context
  ipAddress     String?
  userAgent     String?
  correlationId String? // Links related records across a single request

  /// Structured Data
  metadata Json? // Additional structured data

  /// Audit — append-only (no updatedAt, no updatedBy)
  createdAt DateTime @default(now())

  /// Constraints
  @@index([companyId])
  @@index([entityType, entityId]) // All audit records for a specific entity
  @@index([companyId, action]) // Audit by action type
  @@index([userId]) // Audit by actor
  @@index([createdAt]) // Chronological queries
  @@index([correlationId]) // Request-level correlation
  @@index([companyId, createdAt]) // Time-range audit queries per tenant
}
```

---

## 4. Relationship Summary

### Foreign Key Relationships

| Source Model | Target Model | FK Field(s) | OnDelete | Cardinality |
|---|---|---|---|---|
| ProcurementVendor | Company | `companyId` | Restrict | N:1 |
| ProcurementVendorBankDetail | ProcurementVendor | `vendorId` | Cascade | N:1 |
| ProcurementVendorPerformance | ProcurementVendor | `vendorId` | Cascade | N:1 |
| ProcurementVendorDocument | ProcurementVendor | `vendorId` | Cascade | N:1 |
| ProcurementVendorCredit | ProcurementVendor | `vendorId` | Restrict | N:1 |
| ProcurementVendorCredit | ProcurementVendorInvoice | `appliedToInvoiceId` | SetNull | N:1 |
| ProcurementPOReference | ProcurementVendor | `vendorId` | Restrict | N:1 |
| ProcurementPOReferenceLineItem | ProcurementPOReference | `poReferenceId` | Cascade | N:1 |
| ProcurementGRNReference | ProcurementPOReference | `poReferenceId` | Restrict | N:1 |
| ProcurementGRNReference | ProcurementVendor | `vendorId` | Restrict | N:1 |
| ProcurementGRNReferenceLineItem | ProcurementGRNReference | `grnReferenceId` | Cascade | N:1 |
| ProcurementGRNReferenceLineItem | ProcurementPOReferenceLineItem | `poReferenceLineItemId` | Restrict | N:1 |
| ProcurementVendorInvoice | ProcurementVendor | `vendorId` | Restrict | N:1 |
| ProcurementVendorInvoice | ProcurementPOReference | `poReferenceId` | SetNull | N:1 |
| ProcurementVendorInvoice | ProcurementGRNReference | `grnReferenceId` | SetNull | N:1 |
| ProcurementVendorInvoice | ProcurementVendorInvoice | `duplicateOfInvoiceId` | SetNull | N:1 (self) |
| ProcurementVendorInvoice | ProcurementPaymentBatch | `paymentBatchId` | SetNull | N:1 |
| ProcurementVendorInvoice | ProcurementPaymentProposal | `paymentProposalId` | SetNull | N:1 |
| ProcurementInvoiceLineItem | ProcurementVendorInvoice | `vendorInvoiceId` | Cascade | N:1 |
| ProcurementInvoiceLineItem | ProcurementPOReferenceLineItem | `poReferenceLineItemId` | SetNull | N:1 |
| ProcurementInvoiceLineItem | ProcurementGRNReferenceLineItem | `grnReferenceLineItemId` | SetNull | N:1 |
| ProcurementInvoiceAttachment | ProcurementVendorInvoice | `vendorInvoiceId` | Cascade | N:1 |
| ProcurementThreeWayMatch | ProcurementVendorInvoice | `vendorInvoiceId` | Restrict | 1:1 |
| ProcurementThreeWayMatch | ProcurementPOReference | `poReferenceId` | Restrict | N:1 |
| ProcurementThreeWayMatch | ProcurementGRNReference | `grnReferenceId` | Restrict | N:1 |
| ProcurementMatchLineItem | ProcurementThreeWayMatch | `threeWayMatchId` | Cascade | N:1 |
| ProcurementMatchLineItem | ProcurementInvoiceLineItem | `invoiceLineItemId` | Restrict | 1:1 |
| ProcurementMatchLineItem | ProcurementPOReferenceLineItem | `poReferenceLineItemId` | SetNull | N:1 |
| ProcurementMatchLineItem | ProcurementGRNReferenceLineItem | `grnReferenceLineItemId` | SetNull | N:1 |
| ProcurementInvoiceException | ProcurementVendorInvoice | `vendorInvoiceId` | Restrict | N:1 |
| ProcurementApprovalRecord | ProcurementVendorInvoice | `vendorInvoiceId` | Restrict | N:1 |
| ProcurementPaymentProposal | ProcurementPaymentBatch | `paymentBatchId` | SetNull | 1:1 |
| ProcurementPaymentProposalItem | ProcurementPaymentProposal | `paymentProposalId` | Cascade | N:1 |
| ProcurementPaymentProposalItem | ProcurementVendorInvoice | `vendorInvoiceId` | Restrict | N:1 |
| ProcurementPaymentProposalItem | ProcurementVendor | `vendorId` | Restrict | N:1 |
| ProcurementPaymentBatch | ProcurementPaymentProposal | `paymentProposalId` | Restrict | 1:1 |
| ProcurementPaymentRecord | ProcurementPaymentBatch | `paymentBatchId` | Restrict | N:1 |
| ProcurementPaymentRecord | ProcurementVendorInvoice | `vendorInvoiceId` | Restrict | N:1 |
| ProcurementPaymentRecord | ProcurementVendor | `vendorId` | Restrict | N:1 |
| ProcurementVendorStatement | ProcurementVendor | `vendorId` | Restrict | N:1 |
| ProcurementVendorStatementLine | ProcurementVendorStatement | `vendorStatementId` | Cascade | N:1 |
| ProcurementVendorStatementLine | ProcurementVendorInvoice | `matchedInvoiceId` | SetNull | N:1 |
| ProcurementVendorStatementLine | ProcurementPaymentRecord | `matchedPaymentId` | SetNull | N:1 |
| ProcurementReconciliationResult | ProcurementVendorStatement | `vendorStatementId` | Restrict | 1:1 |
| ProcurementReconciliationResult | ProcurementVendor | `vendorId` | Restrict | N:1 |
| ProcurementAPAuditRecord | Company | `companyId` | Restrict | N:1 |

### OnDelete Strategy Rationale

| Strategy | When Used | Reason |
|---|---|---|
| `Restrict` | All `companyId` FKs, all cross-aggregate references, core aggregate parent references | Prevents deletion of referenced data; forces explicit lifecycle management |
| `Cascade` | Child entities within the same aggregate (line items, attachments, statement lines) | When aggregate root is deleted, children must be deleted with it |
| `SetNull` | Optional references to other aggregates (PO, GRN, payment batch, self-reference) | Preserves the entity when the referenced entity is no longer needed |

---

## 5. Index Strategy

### Tenant Isolation Indexes

Every table has `@@index([companyId])` as the minimum isolation index. This is non-negotiable.

| Table | Index | Purpose |
|---|---|---|
| All 25 tables | `@@index([companyId])` | Tenant isolation — every query includes this filter |

### Unique Constraints (Business Keys)

| Table | Unique Constraint | Business Rule |
|---|---|---|
| ProcurementVendor | `@@unique([companyId, vendorCode])` | V-1: Vendor code unique per company |
| ProcurementVendor | `@@unique([companyId, taxId])` | V-8: Duplicate vendor detection |
| ProcurementVendorPerformance | `@@unique([companyId, vendorId, period])` | VP-1: One performance record per vendor per period |
| ProcurementVendorCredit | `@@unique([companyId, vendorId, creditNumber])` | VC-1: Credit number unique per vendor |
| ProcurementPOReference | `@@unique([companyId, poNumber])` | POR-3: PO number unique per company |
| ProcurementPOReferenceLineItem | `@@unique([companyId, poReferenceId, lineNumber])` | POLI-1: Line number unique within PO |
| ProcurementGRNReference | `@@unique([companyId, grnNumber])` | GR-2: GRN number unique per company |
| ProcurementGRNReferenceLineItem | `@@unique([companyId, grnReferenceId, lineNumber])` | GRNL-1: Line number unique within GRN |
| ProcurementVendorInvoice | `@@unique([companyId, vendorId, invoiceNumber])` | VI-1: Invoice number unique per vendor |
| ProcurementInvoiceLineItem | `@@unique([companyId, vendorInvoiceId, lineNumber])` | ILI-1: Line number unique within invoice |
| ProcurementThreeWayMatch | `@@unique([vendorInvoiceId])` | TW-1: One match per invoice |
| ProcurementMatchLineItem | `@@unique([invoiceLineItemId])` | MLI-1: One match line per invoice line |
| ProcurementApprovalLevel | `@@unique([companyId, levelNumber])` | AL-1: Level number unique per company |
| ProcurementPaymentProposal | `@@unique([companyId, proposalNumber])` | PP-1: Proposal number unique per company |
| ProcurementPaymentBatch | `@@unique([companyId, batchNumber])` | PAY-7: Batch number unique per company |
| ProcurementPaymentRecord | `@@unique([companyId, paymentNumber])` | PR-1: Payment number unique per company |
| ProcurementPaymentRecord | `@unique([idempotencyKey])` | PR-2: Idempotency key uniqueness |
| ProcurementVendorStatement | `@@unique([companyId, vendorId, statementDate])` | VS-2: One statement per vendor per date |
| ProcurementReconciliationResult | `@@unique([vendorStatementId])` | RR-2: One result per statement |
| ProcurementVendorInvoice | `@unique([idempotencyKey])` | VI-12: Idempotency key for payment ops |

### Query Performance Indexes

| Table | Index | Query Pattern |
|---|---|---|
| ProcurementVendor | `@@index([companyId, status])` | Active/pending/suspended vendor lists |
| ProcurementVendor | `@@index([companyId, category])` | Vendor filtering by category |
| ProcurementVendor | `@@index([companyId, currency])` | Currency-based vendor queries |
| ProcurementVendor | `@@index([companyId, preferred])` | Preferred vendor lists |
| ProcurementVendor | `@@index([companyId, isBlocked])` | Blocked vendor check at invoice/PO creation |
| ProcurementVendorBankDetail | `@@index([vendorId])` | All bank details for a vendor |
| ProcurementVendorDocument | `@@index([vendorId])` | All documents for a vendor |
| ProcurementVendorDocument | `@@index([vendorId, status])` | Expired document check at activation |
| ProcurementPOReference | `@@index([vendorId])` | PO list by vendor |
| ProcurementPOReference | `@@index([companyId, status])` | Approved POs for matching |
| ProcurementPOReference | `@@index([companyId, orderDate])` | Date-range PO queries |
| ProcurementGRNReference | `@@index([poReferenceId])` | GRNs for a specific PO |
| ProcurementGRNReference | `@@index([vendorId])` | GRN list by vendor |
| ProcurementGRNReference | `@@index([companyId, status])` | Accepted GRNs for matching |
| ProcurementGRNReferenceLineItem | `@@index([poReferenceLineItemId])` | GRN lines for a PO line |
| ProcurementVendorInvoice | `@@index([vendorId])` | Invoice list by vendor |
| ProcurementVendorInvoice | `@@index([companyId, status])` | Invoice queue by status |
| ProcurementVendorInvoice | `@@index([companyId, invoiceDate])` | Date-range invoice queries |
| ProcurementVendorInvoice | `@@index([companyId, dueDate])` | Aging report — invoices by due date |
| ProcurementVendorInvoice | `@@index([companyId, status, dueDate])` | Aging report — open invoices by due date |
| ProcurementVendorInvoice | `@@index([companyId, vendorId, status])` | Per-vendor outstanding balance |
| ProcurementVendorInvoice | `@@index([poReferenceId])` | Invoices linked to a PO |
| ProcurementVendorInvoice | `@@index([grnReferenceId])` | Invoices linked to a GRN |
| ProcurementVendorInvoice | `@@index([paymentBatchId])` | Invoices in a payment batch |
| ProcurementVendorInvoice | `@@index([paymentProposalId])` | Invoices in a proposal |
| ProcurementVendorInvoice | `@@index([companyId, currency])` | Multi-currency invoice queries |
| ProcurementVendorInvoice | `@@index([companyId, receivedDate])` | Date-range received invoices |
| ProcurementInvoiceLineItem | `@@index([poReferenceLineItemId])` | Invoice lines matching a PO line |
| ProcurementInvoiceLineItem | `@@index([grnReferenceLineItemId])` | Invoice lines matching a GRN line |
| ProcurementInvoiceAttachment | `@@index([vendorInvoiceId])` | Attachments for an invoice |
| ProcurementInvoiceAttachment | `@@index([vendorInvoiceId, category])` | Filter by attachment type |
| ProcurementThreeWayMatch | `@@index([companyId, matchResult])` | Match result filtering |
| ProcurementMatchLineItem | `@@index([threeWayMatchId])` | Line items for a match |
| ProcurementInvoiceException | `@@index([vendorInvoiceId])` | Exceptions for an invoice |
| ProcurementInvoiceException | `@@index([vendorInvoiceId, status])` | Active exceptions per invoice |
| ProcurementInvoiceException | `@@index([companyId, status])` | Exception queue queries |
| ProcurementInvoiceException | `@@index([companyId, severity])` | Severity-based prioritization |
| ProcurementInvoiceException | `@@index([assignedTo])` | Exception list by assignee |
| ProcurementInvoiceException | `@@index([exceptionType])` | Exception type filtering |
| ProcurementApprovalRecord | `@@index([vendorInvoiceId])` | Approval chain for an invoice |
| ProcurementApprovalRecord | `@@index([vendorInvoiceId, status])` | Pending approvals per invoice |
| ProcurementApprovalRecord | `@@index([decisionBy])` | Approval history by user |
| ProcurementApprovalRecord | `@@index([status, timeLimit])` | SLA monitoring — pending approvals past deadline |
| ProcurementApprovalLevel | `@@index([companyId, isActive])` | Active approval levels |
| ProcurementPaymentProposal | `@@index([companyId, status])` | Proposal queue by status |
| ProcurementPaymentProposal | `@@index([companyId, paymentDate])` | Proposals by payment date |
| ProcurementPaymentProposalItem | `@@index([vendorInvoiceId])` | Proposal items for an invoice |
| ProcurementPaymentBatch | `@@index([companyId, status])` | Batch status filtering |
| ProcurementPaymentRecord | `@@index([companyId, status])` | Payment status filtering |
| ProcurementPaymentRecord | `@@index([companyId, paymentDate])` | Payment date-range queries |
| ProcurementPaymentRecord | `@@index([companyId, vendorId])` | Per-vendor payment history |
| ProcurementPaymentRecord | `@@index([vendorInvoiceId, status])` | Payment status per invoice |
| ProcurementVendorStatement | `@@index([companyId, status])` | Statement queue by status |
| ProcurementVendorStatement | `@@index([vendorId, statementDate])` | Statement history by vendor |
| ProcurementVendorStatementLine | `@@index([matchedInvoiceId])` | Statement lines matched to an invoice |
| ProcurementVendorStatementLine | `@@index([matchedPaymentId])` | Statement lines matched to a payment |
| ProcurementVendorStatementLine | `@@index([matchStatus])` | Unmatched line queries |
| ProcurementVendorStatementLine | `@@index([vendorStatementId, matchStatus])` | Unmatched lines per statement |
| ProcurementReconciliationResult | `@@index([companyId, status])` | Reconciliation queue by status |

### Audit Query Indexes

| Table | Index | Query Pattern |
|---|---|---|
| ProcurementAPAuditRecord | `@@index([entityType, entityId])` | All audit records for a specific entity |
| ProcurementAPAuditRecord | `@@index([companyId, action])` | Audit by action type per tenant |
| ProcurementAPAuditRecord | `@@index([userId])` | Audit by actor |
| ProcurementAPAuditRecord | `@@index([createdAt])` | Chronological queries |
| ProcurementAPAuditRecord | `@@index([correlationId])` | Request-level correlation |
| ProcurementAPAuditRecord | `@@index([companyId, createdAt])` | Time-range audit queries per tenant |

---

## 6. Money Representation Pattern

### Decimal Precision Standards

| Field Pattern | Prisma Type | Precision | Example |
|---|---|---|---|
| Monetary amounts | `Decimal @db.Decimal(38, 12)` | 38 digits, 12 decimal | `$15,000.000000000000` |
| Quantities | `Decimal @db.Decimal(20, 4)` | 20 digits, 4 decimal | `100.0000` |
| Percentages/scores | `Decimal @db.Decimal(5, 2)` | 5 digits, 2 decimal | `95.50` (95.50%) |
| Tax rates | `Decimal @db.Decimal(5, 4)` | 5 digits, 4 decimal | `0.0500` (5.00%) |
| Exchange rates | `Decimal @db.Decimal(20, 8)` | 20 digits, 8 decimal | `1.23456789` |

### Currency Code Pattern

All currency codes use `String` fields storing ISO 4217 three-letter codes. No enum — the system supports arbitrary currencies.

```prisma
currency String @default("USD") // ISO 4217
```

### Value Object Embedding

| Value Object | Embedded Fields | Storage |
|---|---|---|
| Money | `amount: Decimal(38,12)` + `currency: String` | Separate `amount` and `currency` fields |
| TaxRate | `taxRate: Decimal(5,4)` + `taxJurisdiction: String?` + `taxType: InvoiceLineItemTaxType?` | Three separate fields |
| PaymentTerms | `paymentTerms: String` | Single string code (e.g., "NET30") |
| ExchangeRate | `exchangeRate: Decimal(20,8)` + `baseCurrency: String` | Two separate fields |
| VendorReference | `vendorId: String` + denormalized fields | FK + read-through to Vendor |

### Financial Precision Enforcement

All monetary calculations must use helpers from `src/lib/financial-precision.ts`. The Prisma schema stores the result; the service layer computes it:

| Operation | Service Helper | Stored In |
|---|---|---|
| Sum line items | `sumDecimals(values)` | `subtotal`, `totalAmount` |
| Line total | `multiplyDecimals(quantity, unitPrice)` | `lineTotal` |
| Tax calculation | `multiplyDecimals(netLineTotal, taxRate)` | `taxAmount` |
| Invoice total | `subtotal + taxAmount + shippingAmount - discountAmount` | `totalAmount` |
| Payment net | `amount - discountTaken - creditApplied` | `netPayment` |
| FX conversion | `multiplyDecimals(netPayment, exchangeRate)` | `baseCurrencyAmount` |
| Balance | `totalAmount - amountPaid` | `balanceDue` |
| Net balance | `balanceDue - creditApplied` | `netBalance` |
| Credit remaining | `creditAmount - appliedAmount` | computed in service |
| Variance | `priceVarianceTotal + quantityVarianceTotal` | `totalVariance` |

---

## 7. Soft Delete Policy

The existing schema does NOT use soft deletes. AP follows the same pattern:

| Entity Type | Delete Policy | Reason |
|---|---|---|
| Aggregate roots | Hard delete with audit record | No orphaned data; audit trail via `ProcurementAPAuditRecord` |
| Child entities | Cascade delete with parent | Children have no independent lifecycle without parent |
| Audit records | NEVER deleted (append-only) | Regulatory requirement; tamper-evident trail |
| Reference entities (PO, GRN) | NEVER deleted | Synced from other modules; AP doesn't own them |
| Configuration entities | Hard delete with audit record | Replaced by new configuration version |

### Immutability Rules

| Entity | Mutable After Creation? | Enforcement |
|---|---|---|
| VendorPerformance | **No** | No `updatedAt` field; service rejects UPDATE |
| InvoiceAttachment | **No** | No `updatedAt` field; service rejects UPDATE |
| ProcurementAPAuditRecord | **No** | No `updatedAt` field; no UPDATE/DELETE in repository |
| ThreeWayMatch | **Yes** (limited) | Only `matchResult` and auto-approval fields |
| MatchLineItem | **Yes** (limited) | Only `matchStatus` and variance fields |
| PaymentRecord | **Yes** (limited) | Only `status`, `glPosted`, void fields |
| All other aggregates | **Yes** | Standard CRUD with state machine guards |

---

## 8. Optimistic Concurrency

### Models with Version Field

All aggregate roots and the approval configuration entity have a `version Int @default(0)` field:

| Model | Has `version` | Reason |
|---|---|---|
| ProcurementVendor | Yes | Aggregate root |
| ProcurementVendorCredit | Yes | Aggregate root |
| ProcurementVendorInvoice | Yes | Aggregate root (CORE) |
| ProcurementThreeWayMatch | Yes | Aggregate root |
| ProcurementInvoiceException | Yes | Aggregate root |
| ProcurementApprovalRecord | Yes | Aggregate root (per invoice) |
| ProcurementApprovalLevel | Yes | Configuration entity — concurrent edits possible |
| ProcurementPaymentProposal | Yes | Aggregate root |
| ProcurementPaymentBatch | Yes | Aggregate root |
| ProcurementPaymentRecord | Yes | Aggregate root |
| ProcurementVendorStatement | Yes | Aggregate root |
| ProcurementReconciliationResult | Yes | Aggregate root |

### Models WITHOUT Version Field

| Model | No `version` | Reason |
|---|---|---|
| ProcurementVendorBankDetail | No | Child entity — protected by parent's version |
| ProcurementVendorPerformance | No | Immutable — no updates allowed |
| ProcurementVendorDocument | No | Child entity — protected by parent's version |
| ProcurementPOReference | No | Reference entity — owned by Procurement module |
| ProcurementPOReferenceLineItem | No | Child of reference entity |
| ProcurementGRNReference | No | Reference entity — owned by Warehouse module |
| ProcurementGRNReferenceLineItem | No | Child of reference entity |
| ProcurementInvoiceLineItem | No | Child entity — protected by parent's version |
| ProcurementInvoiceAttachment | No | Immutable — no updates allowed |
| ProcurementMatchLineItem | No | Child entity — protected by parent's version |
| ProcurementPaymentProposalItem | No | Child entity — protected by parent's version |
| ProcurementVendorStatementLine | No | Child entity — protected by parent's version |
| ProcurementAPAuditRecord | No | Append-only — no updates ever |

### Concurrency Protocol

```typescript
// Service layer pattern:
const invoice = await prisma.procurementVendorInvoice.findUnique({ where: { id } });
const expectedVersion = invoice.version;

await prisma.procurementVendorInvoice.update({
  where: { id, version: expectedVersion }, // Fails if version mismatch
  data: { status: newStatus, version: { increment: 1 }, ... },
});

// If update returns 0 rows → StaleDataError → retry or notify user
```

---

## 9. Audit Trail Pattern

### Immutable Audit Model

`ProcurementAPAuditRecord` is the authoritative audit trail. It is append-only — no updates, no deletes.

| Field | Type | Purpose |
|---|---|---|
| `id` | String (CUID) | Unique audit record identifier |
| `companyId` | String | Tenant isolation |
| `entityType` | String | Target entity type (e.g., "VendorInvoice") |
| `entityId` | String | Target entity ID |
| `action` | APAuditAction | Action performed (CREATED, UPDATED, STATUS_CHANGED, etc.) |
| `field` | String? | Changed field name (for UPDATED actions) |
| `oldValue` | String? | Previous value (JSON stringified) |
| `newValue` | String? | New value (JSON stringified) |
| `amount` | Decimal? | Financial amount if applicable |
| `description` | String | Human-readable description |
| `reason` | String? | Business reason for the change |
| `userId` | String | Actor who performed the action |
| `userRole` | String | Actor's role at time of action |
| `ipAddress` | String? | Request IP address |
| `userAgent` | String? | Request user agent |
| `correlationId` | String? | Request correlation ID (links related records) |
| `metadata` | Json? | Additional structured data |
| `createdAt` | DateTime | When the action occurred (auto-set) |

### Audit Write Pattern

```
1. Service receives mutation request
2. Validate business rules
3. Write ProcurementAPAuditRecord (BEFORE commit)
4. Update entity state
5. Commit transaction (atomic)
6. Return result
```

### Audit Completeness Matrix

| Aggregate | Minimum Audit Events | Actions |
|---|---|---|
| Vendor | 7 | CREATED, UPDATED, STATUS_CHANGED, APPROVED, REJECTED, DELEGATED, ESCALATED |
| VendorInvoice | 13 | CREATED, UPDATED, STATUS_CHANGED, APPROVED, REJECTED, VOIDED, PAID, EXCEPTION, RESOLVED, DELEGATED, ESCALATED, CONFIG_CHANGED |
| ThreeWayMatch | 4 | CREATED, UPDATED, STATUS_CHANGED, APPROVED |
| InvoiceException | 7 | CREATED, UPDATED, STATUS_CHANGED, ASSIGNED, RESOLVED, ESCALATED, DELEGATED |
| ApprovalRecord | 7 | CREATED, UPDATED, STATUS_CHANGED, APPROVED, REJECTED, DELEGATED, ESCALATED |
| PaymentProposal | 6 | CREATED, UPDATED, STATUS_CHANGED, APPROVED, REJECTED, CONFIG_CHANGED |
| PaymentBatch | 8 | CREATED, UPDATED, STATUS_CHANGED, FAILED, ESCALATED, CONFIG_CHANGED |
| PaymentRecord | 6 | CREATED, UPDATED, STATUS_CHANGED, VOIDED, PAID |
| VendorCredit | 5 | CREATED, UPDATED, STATUS_CHANGED, APPLIED, CONFIG_CHANGED |
| VendorStatement | 5 | CREATED, UPDATED, STATUS_CHANGED, EXCEPTION, RESOLVED |
| ReconciliationResult | 5 | CREATED, UPDATED, STATUS_CHANGED, EXCEPTION, RESOLVED |
| ApprovalLevel | 4 | CREATED, UPDATED, CONFIG_CHANGED, DELEGATED |
| **Total minimum** | **77** | |

### Retention

Audit records must be retained for **7 years minimum** (regulatory requirement). No batch deletion. Archive policy managed outside Prisma.

---

## 10. Tenant Isolation

### Enforcement Layers

| Layer | Mechanism |
|---|---|
| API Route | `requireTenantContext()` extracts `companyId` from JWT/session |
| Service Layer | Every query includes `WHERE companyId = :companyId` |
| Repository Layer | Base repository injects `companyId` filter |
| Aggregate Root | Root validates `companyId` matches all child entities on mutation |
| Audit Events | Every audit record includes `companyId` |
| Saga | Each saga step re-validates `companyId` matches across all referenced entities |

### Schema Enforcement

Every model includes:

```prisma
companyId String
company   Company @relation(fields: [companyId], references: [id], onDelete: Restrict)
```

Every model includes `@@index([companyId])` at minimum.

### Query Pattern

```typescript
// CORRECT — always scoped to company
const invoices = await prisma.procurementVendorInvoice.findMany({
  where: {
    companyId: tenantContext.companyId, // ALWAYS
    status: 'PENDING_APPROVAL',
  },
});

// FORBIDDEN — never allow unscoped queries
const invoices = await prisma.procurementVendorInvoice.findMany({
  where: { status: 'PENDING_APPROVAL' }, // MISSING companyId = SECURITY VIOLATION
});
```

### Cross-Entity Validation

When creating entities that reference other aggregates, the service layer must verify that all referenced entities belong to the same `companyId`:

```typescript
// Before creating InvoiceException:
const invoice = await prisma.procurementVendorInvoice.findUnique({ where: { id: invoiceId } });
if (invoice.companyId !== tenantContext.companyId) throw new ForbiddenError();
```

---

## 11. Derived Fields Policy

Several fields are derived (computed) and must NOT be set directly via API input. They are computed at the service layer using `financial-precision.ts` helpers and persisted for query performance.

### Derived Fields Matrix

| Model | Derived Field | Computation | Computed When |
|---|---|---|---|
| ProcurementVendorInvoice | `totalAmount` | `subtotal + taxAmount + shippingAmount - discountAmount` | Every mutation |
| ProcurementVendorInvoice | `totalWithTax` | `subtotal + taxAmount` | Every mutation |
| ProcurementVendorInvoice | `balanceDue` | `totalAmount - amountPaid` | On payment update |
| ProcurementVendorInvoice | `netBalance` | `balanceDue - creditApplied` | On credit/payment update |
| ProcurementInvoiceLineItem | `lineTotal` | `quantity × unitPrice` | Every mutation |
| ProcurementInvoiceLineItem | `netLineTotal` | `lineTotal - discountAmount` | Every mutation |
| ProcurementInvoiceLineItem | `taxAmount` | `netLineTotal × taxRate` | Every mutation |
| ProcurementThreeWayMatch | `totalVariance` | `priceVarianceTotal + quantityVarianceTotal` | On match execution |
| ProcurementPaymentProposalItem | `netPayment` | `amount - discountTaken - creditApplied` | Every mutation |
| ProcurementPaymentRecord | `netPayment` | `amount - discountTaken - creditApplied` | On creation |
| ProcurementPaymentRecord | `baseCurrencyAmount` | `netPayment × exchangeRate` | On creation |
| ProcurementVendorStatement | `closingBalance` | `openingBalance + totalInvoices - totalPayments - totalCredits` | On line import |
| ProcurementReconciliationResult | `balanceVariance` | `apBalance - vendorBalance` | On reconciliation |
| ProcurementReconciliationResult | `unmatchedLines` | `totalLines - matchedLines` | On match update |
| ProcurementReconciliationResult | `matchRate` | `matchedLines / totalLines × 100` | On match update |
| ProcurementGRNReferenceLineItem | `lineTotal` | `quantityAccepted × unitPrice` | On acceptance update |

### Prisma Default Values

Derived fields are stored with sensible defaults to prevent null-related errors:

```prisma
totalAmount    Decimal @db.Decimal(38, 12) // Set by service, Prisma has no default
balanceDue     Decimal @db.Decimal(38, 12) // Set by service
netBalance     Decimal @db.Decimal(38, 12) // Set by service
```

### Derived Field Invariants

| Invariant | Enforcement |
|---|---|
| Sum of line item `netLineTotal` = invoice `subtotal` | Service recalculates on every mutation |
| `totalAmount` = `subtotal + taxAmount + shippingAmount - discountAmount` | Service recalculates |
| `balanceDue` = `totalAmount - amountPaid` | Service recalculates on payment |
| `netBalance` = `balanceDue - creditApplied` | Service recalculates on credit |
| `netPayment` = `amount - discountTaken - creditApplied` | Service recalculates on proposal/batch |
| `closingBalance` = opening + invoices - payments - credits | Service recalculates on import |

---

*End of Phase 21A.1 — Accounts Payable Prisma Model Specification*
