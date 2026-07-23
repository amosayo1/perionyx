# Phase 21A.0 — Accounts Payable Domain Model

> **Status**: Complete
> **Type**: Documentation-only — entity, value object, and relationship specification
> **Date**: July 21, 2026
> **Scope**: Comprehensive domain model for the 14-stage AP procure-to-pay lifecycle
> **Predecessor**: AP_AGGREGATES.md, AP_DOMAIN_ARCHITECTURE.md, AP_STATE_MACHINES.md
> **Prerequisites**: `src/lib/financial-precision.ts`, `src/server/procurement/types/index.ts`

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Part 1 — Entities](#2-part-1--entities)
3. [Part 2 — Value Objects](#3-part-2--value-objects)
4. [Part 3 — Entity Relationship Diagram](#4-part-3--entity-relationship-diagram)
5. [Part 4 — Data Flow](#5-part-4--data-flow)

---

## 1. Design Principles

| Principle | Rule | Enforcement |
|---|---|---|
| **Decimal everywhere** | Every monetary field: `Prisma.Decimal(38, 12)` | Prisma schema, service layer, repository layer |
| **companyId on every entity** | Multi-tenant isolation — zero exceptions | Composite index + service-layer WHERE clause |
| **Immutable audit trail** | Every state transition → append-only `APAuditRecord` | Service layer writes audit before committing |
| **Reference, never embed** | Cross-aggregate data = ID + denormalized display fields | Aggregate boundary rules |
| **AI recommends, human decides** | AI scoring/suggestion is advisory only | No autonomous state transitions |
| **Financial precision** | All calculations via `financial-precision.ts` helpers | No `Number()` in business logic |
| **Idempotency on payments** | `idempotencyKey` unique constraint on payment operations | DB constraint + service guard |
| **Single-aggregate transactions** | One aggregate per DB transaction | Saga pattern for cross-aggregate coordination |

### Existing Type System Alignment

| Existing Type (`src/server/procurement/types/index.ts`) | Domain Model Entity | Relationship |
|---|---|---|
| `Vendor` | `Vendor` (entity) | Expanded with bank details, credit, performance as child entities |
| `VendorPerformance` | `VendorPerformance` (child entity) | Direct mapping |
| `VendorDocument` | `VendorDocument` (child entity) | Direct mapping |
| `PurchaseRequest`, `PurchaseOrder` | `PurchaseOrderReference` (reference entity) | AP stores reference, not ownership |
| `Receipt` | `GoodsReceiptReference` (reference entity) | AP reads GRN for matching |
| `Invoice` | `VendorInvoice` (core entity) | Expanded significantly — central AP aggregate |
| `InvoiceItem` | `InvoiceLineItem` (child entity) | Expanded with tax, GL coding, tolerance |
| `MatchResult` | `ThreeWayMatch` (entity) | Promoted to independent aggregate |
| `ApprovalRequest` | `ApprovalRecord` (entity) | AP-specific approval chain |
| `Payment` | `PaymentRecord` (entity) | Expanded with idempotency, batch tracking |

---

## 2. Part 1 — Entities

### 2.1 Vendor

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). Composite unique on `(companyId, vendorCode)`. |
| **Prisma Model** | `ProcurementVendor` |
| **Purpose** | Master data for all vendor interactions. Reference entity for the AP domain. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `vendorCode` | `string` | UNIQUE per `(companyId)`, NOT NULL | — | No | Human-readable code (e.g., `VEN-00001`) |
| `name` | `string` | NOT NULL, 1–255 chars | — | Yes | Display name |
| `legalName` | `string` | NOT NULL, 1–255 chars | — | Yes | Registered legal entity name |
| `status` | `enum` | NOT NULL | `PENDING_REVIEW` | Yes | Lifecycle state |
| `riskLevel` | `enum` | NOT NULL | `LOW` | Yes | Risk classification |
| `riskScore` | `Decimal(5,2)` | 0.00–100.00 | `0.00` | Yes | Numeric risk score |
| `category` | `enum` | NOT NULL | — | Yes | `SUPPLIER`, `CONTRACTOR`, `CONSULTANT`, `SERVICE_PROVIDER`, `DISTRIBUTOR`, `MANUFACTURER` |
| `taxId` | `string` | NOT NULL, UNIQUE per `(companyId)` | — | Yes | Tax identification number |
| `taxCountry` | `string` | NOT NULL, ISO 3166-1 alpha-2 | — | Yes | Country of tax registration |
| `currency` | `string` | NOT NULL, ISO 4217 | `USD` | Yes | Default transaction currency |
| `billingAddress` | `string` | — | — | Yes | Billing address (text) |
| `shippingAddress` | `string` | — | — | Yes | Shipping address (text) |
| `paymentTerms` | `string` | — | `NET30` | Yes | Payment terms code |
| `preferredPaymentMethod` | `enum` | NOT NULL | `ACH` | Yes | Default payment method |
| `creditLimit` | `Decimal(38,12)` | ≥ 0 | `0` | Yes | Max outstanding AP balance |
| `bankAccountId` | `string` | — | — | Yes | Reference to Banking context |
| `preferred` | `boolean` | NOT NULL | `false` | Yes | Preferred vendor flag |
| `preferredRank` | `int?` | ≥ 1 | — | Yes | Ranking among preferred vendors |
| `isBlocked` | `boolean` | NOT NULL | `false` | Yes | Block flag |
| `blockReason` | `string?` | — | — | Yes | Reason for block |
| `rating` | `Decimal(3,1)` | 0.0–5.0 | `0.0` | Yes | Vendor rating (0–5) |
| `totalSpend` | `Decimal(38,12)` | ≥ 0 | `0` | Yes | Aggregated spend |
| `totalOrders` | `int` | ≥ 0 | `0` | Yes | Aggregated order count |
| `avgPaymentDays` | `int` | ≥ 0 | `0` | Yes | Avg days invoice→payment |
| `contactName` | `string` | — | — | Yes | Primary contact |
| `contactEmail` | `string` | — | — | Yes | Contact email |
| `contactPhone` | `string` | — | — | Yes | Contact phone |
| `tags` | `string[]` | — | `[]` | Yes | User-defined tags |
| `onboardingDate` | `Date` | NOT NULL | `now()` | No | Onboarding date |
| `lastOrderDate` | `Date?` | — | — | Yes | Most recent PO date |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL | auto | No | Last update timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |
| `updatedBy` | `string` | NOT NULL | — | No | Last modifier userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| V-1 | `vendorCode` unique within `companyId` | DB unique constraint `(companyId, vendorCode)` |
| V-2 | `taxId` unique within `companyId` | DB unique constraint `(companyId, taxId)` |
| V-3 | Cannot be `ACTIVE` if any required document is expired | Check `VendorDocument.expiryDate` at activation |
| V-4 | `SUSPENDED` vendors blocked from new POs | Service check at PO creation |
| V-5 | `DEACTIVATED` vendors blocked from new invoices | Service check at invoice capture |
| V-6 | Risk score ≥ 80 requires Controller approval for activation | Approval routing |
| V-7 | `creditLimit` must be ≥ 0 | Decimal validation |

#### Lifecycle

```
PENDING_REVIEW ──approve──► ACTIVE
PENDING_REVIEW ──reject───► DEACTIVATED
ACTIVE ────────suspend────► SUSPENDED
ACTIVE ────────deactivate─► DEACTIVATED
SUSPENDED ─────reactivate─► ACTIVE
SUSPENDED ─────deactivate─► DEACTIVATED
```

#### Financial Implications

| Field | Type | Description |
|---|---|---|
| `creditLimit` | `Decimal(38, 12)` | Max outstanding AP balance. Checked at invoice capture. |
| `totalSpend` | `Decimal(38, 12)` | Running aggregation of all PO amounts |

---

### 2.2 VendorBankDetail

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). FK → Vendor. |
| **Prisma Model** | `ProcurementVendorBankDetail` |
| **Purpose** | Encrypted bank account details. Separated from Vendor for PCI-DSS scope isolation. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `vendorId` | `string` | FK → Vendor, NOT NULL | — | No | Parent vendor |
| `bankName` | `string` | NOT NULL | — | Yes | Bank institution name |
| `bankCountry` | `string` | NOT NULL, ISO 3166-1 alpha-2 | — | Yes | Country of bank |
| `routingNumber` | `string` | NOT NULL, encrypted | — | Yes | Routing number (AES-256-GCM) |
| `accountNumber` | `string` | NOT NULL, encrypted | — | Yes | Account number (AES-256-GCM) |
| `accountHolderName` | `string` | NOT NULL | — | Yes | Name on account |
| `accountType` | `enum` | NOT NULL | — | Yes | `CHECKING`, `SAVINGS` |
| `isPrimary` | `boolean` | NOT NULL | `false` | Yes | Primary bank account |
| `isActive` | `boolean` | NOT NULL | `true` | Yes | Active flag |
| `verifiedAt` | `Date?` | — | — | Yes | When verified |
| `verifiedBy` | `string?` | — | — | Yes | Verifier userId |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL | auto | No | Last update timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |
| `updatedBy` | `string` | NOT NULL | — | No | Last modifier userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| VBD-1 | Exactly one bank account must be `isPrimary` per vendor | Application logic |
| VBD-2 | `routingNumber` and `accountNumber` encrypted at rest | Storage encryption |
| VBD-3 | Bank detail changes require verification before payment use | `verifiedAt` non-null check |
| VBD-4 | Only `ACTIVE` vendors can add/update bank details | Status check |

---

### 2.3 VendorPerformance

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). Composite unique on `(companyId, vendorId, period)`. |
| **Prisma Model** | `ProcurementVendorPerformance` |
| **Purpose** | Periodic performance scores. One record per vendor per evaluation period. Immutable after creation. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `vendorId` | `string` | FK → Vendor, NOT NULL | — | No | Parent vendor |
| `period` | `string` | NOT NULL, `YYYY-Q[N]` or `YYYY-MM` | — | No | Evaluation period |
| `onTimeDelivery` | `Decimal(5,2)` | 0.00–100.00 | `0.00` | No | % on-time delivery |
| `qualityScore` | `Decimal(5,2)` | 0.00–100.00 | `0.00` | No | Quality score |
| `responseTime` | `Decimal(5,2)` | 0.00–100.00 | `0.00` | No | Response time score |
| `invoiceAccuracy` | `Decimal(5,2)` | 0.00–100.00 | `0.00` | No | Invoice accuracy % |
| `returnRate` | `Decimal(5,2)` | 0.00–100.00 | `0.00` | No | Return/reject rate |
| `overallScore` | `Decimal(5,2)` | 0.00–100.00 | `0.00` | No | Weighted composite |
| `totalOrders` | `int` | ≥ 0 | `0` | No | Orders in period |
| `totalAmount` | `Decimal(38,12)` | ≥ 0 | `0` | No | Total spend in period |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| VP-1 | Performance records are immutable after creation | No UPDATE allowed |
| VP-2 | `overallScore` = weighted average of component scores | Computed at creation |
| VP-3 | Period must be valid `YYYY-Q[N]` or `YYYY-MM` | Validation at creation |

---

### 2.4 VendorDocument

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). FK → Vendor. |
| **Prisma Model** | `ProcurementVendorDocument` |
| **Purpose** | Compliance documents — W-9, insurance, contracts, licenses. Checked during vendor activation. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `vendorId` | `string` | FK → Vendor, NOT NULL | — | No | Parent vendor |
| `type` | `string` | NOT NULL | — | Yes | `W9`, `INSURANCE`, `CONTRACT`, `LICENSE` |
| `name` | `string` | NOT NULL | — | Yes | Display name |
| `reference` | `string` | — | — | Yes | External reference number |
| `expiryDate` | `Date?` | — | — | Yes | Expiration date |
| `status` | `enum` | NOT NULL | `VALID` | Yes | `VALID`, `EXPIRED`, `PENDING` |
| `fileUrl` | `string?` | — | — | Yes | Storage URL |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL | auto | No | Last update timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |
| `updatedBy` | `string` | NOT NULL | — | No | Last modifier userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| VDOC-1 | Expired documents block vendor activation | Checked at `Vendor.approve()` |
| VDOC-2 | Required types per category: W9 for all, Insurance for contractors, Contract for service-providers | Validation at activation |
| VDOC-3 | `status` auto-updates based on `expiryDate` | Daily batch or on-access |

---

### 2.5 VendorCredit

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). Unique on `(companyId, vendorId, creditNumber)`. |
| **Prisma Model** | `ProcurementVendorCredit` |
| **Purpose** | Credit notes issued by vendors. Reduces amount owed. Applied to specific invoices or held as open credit. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `vendorId` | `string` | FK → Vendor, NOT NULL | — | No | Issuing vendor |
| `creditNumber` | `string` | UNIQUE per `(companyId, vendorId)` | — | No | Vendor's credit note number |
| `creditDate` | `Date` | NOT NULL | — | No | Date of credit note |
| `creditAmount` | `Decimal(38,12)` | > 0 | — | No | Total credit value |
| `appliedAmount` | `Decimal(38,12)` | ≥ 0, ≤ `creditAmount` | `0` | Yes | Running total of applications |
| `remainingAmount` | `Decimal(38,12)` | derived | — | No | `creditAmount - appliedAmount` |
| `currency` | `string` | NOT NULL, ISO 4217 | — | No | Credit note currency |
| `status` | `enum` | NOT NULL | `ISSUED` | Yes | `ISSUED`, `PARTIALLY_APPLIED`, `FULLY_APPLIED`, `EXPIRED` |
| `appliedToInvoiceId` | `string?` | FK → VendorInvoice | — | Yes | Invoice credit is applied to |
| `expiryDate` | `Date?` | — | — | No | Expiration date |
| `reason` | `string` | — | — | Yes | Reason for credit |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL | auto | No | Last update timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |
| `updatedBy` | `string` | NOT NULL | — | No | Last modifier userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| VC-1 | `creditNumber` unique per `(companyId, vendorId)` | DB unique constraint |
| VC-2 | `appliedAmount` never exceeds `creditAmount` | Guard on application |
| VC-3 | Credit applies only to invoices from same `vendorId` | Vendor match check |
| VC-4 | Expired credits cannot be applied | Status guard |
| VC-5 | Applied credit reduces invoice `totalWithTax` | Side effect on invoice |

#### Lifecycle

```
ISSUED ──apply──► PARTIALLY_APPLIED ──apply──► FULLY_APPLIED
ISSUED ──expire──► EXPIRED
PARTIALLY_APPLIED ──expire──► EXPIRED (remaining forfeited)
```

---

### 2.6 PurchaseOrderReference

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). Composite unique on `(companyId, poNumber)`. |
| **Prisma Model** | `ProcurementPOReference` |
| **Purpose** | AP's read-only reference to a Purchase Order owned by the Procurement module. AP never writes to this entity — it is a synchronization snapshot used for 3-way matching and accruals. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `poNumber` | `string` | UNIQUE per `(companyId)`, NOT NULL | — | No | PO number from Procurement |
| `poId` | `string` | NOT NULL | — | No | Source PO id in Procurement module |
| `vendorId` | `string` | FK → Vendor, NOT NULL | — | No | Ordering vendor |
| `status` | `enum` | NOT NULL | — | No | `DRAFT`, `SUBMITTED`, `APPROVED`, `PARTIALLY_RECEIVED`, `FULLY_RECEIVED`, `CANCELLED` |
| `orderDate` | `Date` | NOT NULL | — | No | Date PO was placed |
| `expectedDeliveryDate` | `Date?` | — | — | No | Expected delivery |
| `currency` | `string` | NOT NULL, ISO 4217 | `USD` | No | PO currency |
| `totalAmount` | `Decimal(38,12)` | ≥ 0 | — | No | Total PO amount (snapshot) |
| `receivedAmount` | `Decimal(38,12)` | ≥ 0 | `0` | Yes | Running total of received value |
| `taxAmount` | `Decimal(38,12)` | ≥ 0 | `0` | No | Tax amount |
| `shippingAmount` | `Decimal(38,12)` | ≥ 0 | `0` | No | Shipping/freight |
| `paymentTerms` | `string` | — | — | No | Snapshot of terms at PO time |
| `requestedBy` | `string` | — | — | No | Requester userId |
| `approvedBy` | `string?` | — | — | No | Approver userId |
| `approvalDate` | `Date?` | — | — | No | Approval timestamp |
| `syncedAt` | `DateTime` | NOT NULL | — | No | When AP last synced from Procurement |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL | auto | No | Last update timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |
| `updatedBy` | `string` | NOT NULL | — | No | Last modifier userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| POR-1 | AP never creates, updates, or deletes POs — this is a reference-only entity | Repository is read-only; writes sync only via `syncFromProcurement()` |
| POR-2 | `receivedAmount` is the only field AP mutates (updated on GRN sync) | Service guard |
| POR-3 | `poNumber` unique within `companyId` | DB unique constraint |
| POR-4 | `syncedAt` must be refreshed when Procurement pushes updates | Sync handler |
| POR-5 | PO must be `APPROVED` status before invoices can reference it | Guard at invoice capture |

#### Lifecycle

```
DRAFT ──(Procurement)──► SUBMITTED ──► APPROVED ──► PARTIALLY_RECEIVED ──► FULLY_RECEIVED
                                                           │
                                                           ▼
                                                      CANCELLED
```

#### Financial Implications

| Field | Type | Description |
|---|---|---|
| `totalAmount` | `Decimal(38,12)` | Snapshot of PO value — used as match baseline |
| `receivedAmount` | `Decimal(38,12)` | Accumulated GRN value — partial receipt tracking |
| `taxAmount` | `Decimal(38,12)` | Tax component of PO — included in 3-way match |

---

### 2.7 POReferenceLineItem

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). Composite unique on `(companyId, poReferenceId, lineNumber)`. |
| **Prisma Model** | `ProcurementPOReferenceLineItem` |
| **Purpose** | Line-level detail of a PO reference. One record per PO line. Used for line-level 3-way matching. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `poReferenceId` | `string` | FK → PurchaseOrderReference, NOT NULL | — | No | Parent PO reference |
| `lineNumber` | `int` | ≥ 1, NOT NULL | — | No | PO line number |
| `description` | `string` | NOT NULL | — | No | Line description |
| `quantity` | `Decimal(20,4)` | > 0 | — | No | Ordered quantity |
| `unitOfMeasure` | `string` | NOT NULL | — | No | UOM code |
| `unitPrice` | `Decimal(38,12)` | ≥ 0 | — | No | Unit price |
| `lineTotal` | `Decimal(38,12)` | derived | — | No | `quantity × unitPrice` |
| `taxRate` | `Decimal(5,4)` | 0.0000–1.0000 | `0` | No | Tax rate snapshot |
| `taxAmount` | `Decimal(38,12)` | ≥ 0 | `0` | No | Tax on this line |
| `glAccountId` | `string?` | FK → GL Account | — | No | GL account code |
| `costCenterId` | `string?` | FK → Cost Center | — | No | Cost center code |
| `receivedQuantity` | `Decimal(20,4)` | ≥ 0 | `0` | Yes | Accumulated receipt qty |
| `invoicedQuantity` | `Decimal(20,4)` | ≥ 0 | `0` | Yes | Accumulated invoice qty |
| `status` | `enum` | NOT NULL | `PENDING` | Yes | `PENDING`, `PARTIALLY_RECEIVED`, `FULLY_RECEIVED`, `CLOSED` |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL | auto | No | Last update timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |
| `updatedBy` | `string` | NOT NULL | — | No | Last modifier userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| POLI-1 | `lineNumber` unique within PO reference | DB constraint `(poReferenceId, lineNumber)` |
| POLI-2 | `lineTotal` derived — never set directly | Computed: `quantity × unitPrice`, rounded via `financialRound` |
| POLI-3 | `receivedQuantity` cannot exceed `quantity` | Guard on GRN processing |
| POLI-4 | `invoicedQuantity` cannot exceed `quantity` | Guard on invoice matching |
| POLI-5 | `status` auto-transitions based on `receivedQuantity` vs `quantity` | Computed property |

#### Financial Implications

| Field | Type | Description |
|---|---|---|
| `unitPrice` | `Decimal(38,12)` | Matched against invoice line unit price |
| `lineTotal` | `Decimal(38,12)` | Matched against invoice line total |
| `taxAmount` | `Decimal(38,12)` | Tax component for 3-way match |

---

### 2.8 GoodsReceiptReference

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). Composite unique on `(companyId, grnNumber)`. |
| **Prisma Model** | `ProcurementGRNReference` |
| **Purpose** | AP's read-only reference to a Goods Receipt Note owned by the Procurement/Warehouse module. Used for 3-way matching — the "goods received" leg. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `grnNumber` | `string` | UNIQUE per `(companyId)`, NOT NULL | — | No | GRN number |
| `grnId` | `string` | NOT NULL | — | No | Source GRN id in Warehouse module |
| `poReferenceId` | `string` | FK → PurchaseOrderReference, NOT NULL | — | No | Related PO |
| `vendorId` | `string` | FK → Vendor, NOT NULL | — | No | Receiving vendor |
| `receiptDate` | `Date` | NOT NULL | — | No | Date goods received |
| `status` | `enum` | NOT NULL | `RECEIVED` | Yes | `RECEIVED`, `INSPECTED`, `ACCEPTED`, `REJECTED`, `PARTIAL` |
| `receivedBy` | `string` | NOT NULL | — | No | userId of receiver |
| `warehouseLocation` | `string` | — | — | No | Warehouse/stockroom |
| `totalValue` | `Decimal(38,12)` | ≥ 0 | — | No | Total value received |
| `totalTax` | `Decimal(38,12)` | ≥ 0 | `0` | No | Tax on receipt |
| `inspectionNotes` | `string?` | — | — | Yes | Quality inspection notes |
| `syncedAt` | `DateTime` | NOT NULL | — | No | When AP last synced from Warehouse |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL | auto | No | Last update timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |
| `updatedBy` | `string` | NOT NULL | — | No | Last modifier userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| GR-1 | AP never creates GRNs — reference-only sync from Warehouse | Read-only repository |
| GR-2 | `grnNumber` unique within `companyId` | DB unique constraint |
| GR-3 | GRN must reference a valid `APPROVED` PO | FK + status check |
| GR-4 | `totalValue` computed from line items at sync time | Computed at sync |
| GR-5 | Rejected GRNs do not count toward PO `receivedAmount` | Match exclusion |

#### Lifecycle

```
RECEIVED ──inspect──► INSPECTED ──accept──► ACCEPTED
INSPECTED ──reject───► REJECTED
PARTIAL (partial acceptance)
```

#### Financial Implications

| Field | Type | Description |
|---|---|---|
| `totalValue` | `Decimal(38,12)` | Value used for 3-way match comparison |
| `totalTax` | `Decimal(38,12)` | Tax on receipt |

---

### 2.9 GRNReferenceLineItem

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). Composite unique on `(companyId, grnReferenceId, lineNumber)`. |
| **Prisma Model** | `ProcurementGRNReferenceLineItem` |
| **Purpose** | Line-level detail of a GRN reference. One record per received line item. Used for line-level 3-way matching. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `grnReferenceId` | `string` | FK → GoodsReceiptReference, NOT NULL | — | No | Parent GRN reference |
| `poReferenceLineItemId` | `string` | FK → POReferenceLineItem, NOT NULL | — | No | Matching PO line |
| `lineNumber` | `int` | ≥ 1, NOT NULL | — | No | GRN line number |
| `description` | `string` | NOT NULL | — | No | Line description |
| `quantityReceived` | `Decimal(20,4)` | > 0 | — | No | Quantity received |
| `quantityAccepted` | `Decimal(20,4)` | ≥ 0 | — | No | Quantity accepted after inspection |
| `quantityRejected` | `Decimal(20,4)` | ≥ 0 | `0` | No | Quantity rejected |
| `unitOfMeasure` | `string` | NOT NULL | — | No | UOM code |
| `unitPrice` | `Decimal(38,12)` | ≥ 0 | — | No | Unit price (from PO) |
| `lineTotal` | `Decimal(38,12)` | derived | — | No | `quantityAccepted × unitPrice` |
| `condition` | `enum` | NOT NULL | `GOOD` | Yes | `GOOD`, `DAMAGED`, `DEFECTIVE`, `MIXED` |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL | auto | No | Last update timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |
| `updatedBy` | `string` | NOT NULL | — | No | Last modifier userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| GRNL-1 | `lineNumber` unique within GRN reference | DB constraint |
| GRNL-2 | `quantityReceived` = `quantityAccepted` + `quantityRejected` | Arithmetic invariant |
| GRNL-3 | `lineTotal` = `quantityAccepted × unitPrice` — only accepted qty counts | Computed at acceptance |
| GRNL-4 | `DAMAGED`/`DEFECTIVE` items excluded from invoice match | Match filter |

#### Financial Implications

| Field | Type | Description |
|---|---|---|
| `unitPrice` | `Decimal(38,12)` | PO price — used as match baseline |
| `lineTotal` | `Decimal(38,12)` | Value accepted — basis for accrual and match |

---

### 2.10 VendorInvoice

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). Composite unique on `(companyId, vendorId, invoiceNumber)`. |
| **Prisma Model** | `ProcurementVendorInvoice` |
| **Purpose** | **Core AP entity.** Represents an invoice received from a vendor. Central to the entire AP lifecycle — drives matching, approval, payment, GL posting, and reconciliation. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `vendorId` | `string` | FK → Vendor, NOT NULL | — | No | Invoice vendor |
| `invoiceNumber` | `string` | UNIQUE per `(companyId, vendorId)`, NOT NULL | — | No | Vendor's invoice number |
| `invoiceDate` | `Date` | NOT NULL | — | Yes | Invoice date |
| `dueDate` | `Date` | NOT NULL, computed | — | Yes | Payment due date (from terms) |
| `receivedDate` | `Date` | NOT NULL | `now()` | Yes | Date AP received invoice |
| `status` | `enum` | NOT NULL | `DRAFT` | Yes | `DRAFT`, `CAPTURED`, `VALIDATING`, `VALIDATED`, `THREE_WAY_MATCHING`, `MATCHED`, `MATCH_FAILED`, `EXCEPTION`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `PARTIALLY_PAID`, `PAID`, `VOIDED` |
| `previousStatus` | `enum?` | — | — | Yes | Previous status for audit |
| `statusChangedAt` | `DateTime?` | — | — | Yes | Status transition timestamp |
| `poReferenceId` | `string?` | FK → PurchaseOrderReference | — | Yes | Linked PO (for 3-way match) |
| `grnReferenceId` | `string?` | FK → GoodsReceiptReference | — | Yes | Linked GRN (for 3-way match) |
| `currency` | `string` | NOT NULL, ISO 4217 | `USD` | Yes | Invoice currency |
| `exchangeRate` | `Decimal(20,8)` | > 0 | `1.00000000` | Yes | Exchange rate to base currency |
| `baseCurrency` | `string` | NOT NULL, ISO 4217 | `USD` | Yes | Company base currency |
| `subtotal` | `Decimal(38,12)` | ≥ 0 | — | Yes | Sum of line totals before tax |
| `taxAmount` | `Decimal(38,12)` | ≥ 0 | `0` | Yes | Total tax |
| `discountAmount` | `Decimal(38,12)` | ≥ 0 | `0` | Yes | Early payment discount |
| `shippingAmount` | `Decimal(38,12)` | ≥ 0 | `0` | Yes | Shipping/freight charges |
| `totalAmount` | `Decimal(38,12)` | derived | — | Yes | `subtotal + taxAmount + shippingAmount - discountAmount` |
| `totalWithTax` | `Decimal(38,12)` | derived | — | Yes | `subtotal + taxAmount` |
| `amountPaid` | `Decimal(38,12)` | ≥ 0 | `0` | Yes | Running total paid |
| `balanceDue` | `Decimal(38,12)` | derived | — | Yes | `totalAmount - amountPaid` |
| `creditApplied` | `Decimal(38,12)` | ≥ 0 | `0` | Yes | Vendor credits applied |
| `netBalance` | `Decimal(38,12)` | derived | — | Yes | `balanceDue - creditApplied` |
| `paymentTerms` | `string` | — | — | Yes | Payment terms (from vendor or PO) |
| `paymentMethod` | `enum?` | — | — | Yes | `ACH`, `WIRE`, `CHECK`, `EFT`, `VIRTUAL_CARD` |
| `glAccountId` | `string?` | FK → GL Account | — | Yes | Default GL account |
| `costCenterId` | `string?` | FK → Cost Center | — | Yes | Default cost center |
| `departmentId` | `string?` | FK → Department | — | Yes | Owning department |
| `projectId` | `string?` | FK → Project | — | Yes | Related project |
| `description` | `string?` | — | — | Yes | Invoice description/notes |
| `vendorMemo` | `string?` | — | — | Yes | Vendor's memo/reference |
| `internalMemo` | `string?` | — | — | Yes | Internal notes |
| `ocrConfidence` | `Decimal(5,2)` | 0.00–100.00 | — | Yes | OCR extraction confidence |
| `ocrRawText` | `string?` | — | — | No | Raw OCR output (for audit) |
| `isDuplicateSuspicion` | `boolean` | NOT NULL | `false` | Yes | Duplicate invoice flag |
| `duplicateConfidence` | `Decimal(5,2)` | 0.00–100.00 | — | Yes | Duplicate detection score |
| `duplicateOfInvoiceId` | `string?` | FK → VendorInvoice | — | Yes | Suspected duplicate |
| `matchResult` | `enum?` | — | — | Yes | `MATCHED`, `VARIANCE`, `NO_PO`, `PARTIAL_MATCH` |
| `varianceAmount` | `Decimal(38,12)` | — | `0` | Yes | Total variance from PO/GRN |
| `varianceThreshold` | `Decimal(5,2)` | — | `5.00` | Yes | Auto-approve threshold % |
| `approvalRequired` | `boolean` | NOT NULL | `false` | Yes | Manual approval flag |
| `approvedAt` | `Date?` | — | — | Yes | Approval timestamp |
| `approvedBy` | `string?` | — | — | Yes | Approver userId |
| `rejectedAt` | `Date?` | — | — | Yes | Rejection timestamp |
| `rejectedBy` | `string?` | — | — | Yes | Rejector userId |
| `rejectionReason` | `string?` | — | — | Yes | Rejection reason |
| `paymentBatchId` | `string?` | FK → PaymentBatch | — | Yes | Assigned payment batch |
| `paymentProposalId` | `string?` | FK → PaymentProposal | — | Yes | Assigned payment proposal |
| `paymentDate` | `Date?` | — | — | Yes | Actual payment date |
| `paymentReference` | `string?` | — | — | Yes | Payment transaction reference |
| `checkNumber` | `string?` | — | — | Yes | Check number if paying by check |
| `accrualPosted` | `boolean` | NOT NULL | `false` | Yes | AP accrual GL entry posted |
| `accrualReversed` | `boolean` | NOT NULL | `false` | Yes | Accrual reversal posted |
| `glPosted` | `boolean` | NOT NULL | `false` | Yes | Final AP GL entry posted |
| `glPostedAt` | `Date?` | — | — | Yes | GL posting timestamp |
| `periodId` | `string?` | — | — | Yes | Accounting period |
| `idempotencyKey` | `string?` | UNIQUE | — | No | Idempotency key for payment ops |
| `source` | `enum` | NOT NULL | `MANUAL` | No | `EMAIL`, `SCAN`, `EDI`, `PORTAL`, `MANUAL`, `API` |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL | auto | No | Last update timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |
| `updatedBy` | `string` | NOT NULL | — | No | Last modifier userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| VI-1 | `invoiceNumber` unique per `(companyId, vendorId)` | DB unique constraint |
| VI-2 | `dueDate` computed from `invoiceDate` + `paymentTerms` | Service calculation |
| VI-3 | `totalAmount` = `subtotal + taxAmount + shippingAmount - discountAmount` | Computed field via `financialRound` |
| VI-4 | `balanceDue` = `totalAmount - amountPaid` | Computed field |
| VI-5 | `netBalance` = `balanceDue - creditApplied` | Computed field |
| VI-6 | Status transitions follow strict state machine (see below) | Service-layer guard |
| VI-7 | Duplicate detection runs on every `CAPTURED` invoice | Background job |
| VI-8 | 3-way match requires PO + GRN + Invoice | Match engine pre-condition |
| VI-9 | Variance > threshold blocks auto-approval | Approval routing rule |
| VI-10 | Payment requires `APPROVED` status | Guard at payment proposal |
| VI-11 | Voided invoices cannot be un-voided | Immutable terminal state |
| VI-12 | `idempotencyKey` must be unique for payment operations | DB unique constraint |
| VI-13 | GL posting only after `APPROVED` status | Sequence guard |
| VI-14 | Vendor credit application cannot make `netBalance` negative | Guard on credit apply |

#### Lifecycle

```
DRAFT ──capture──► CAPTURED ──validate──► VALIDATING ──► VALIDATED ──match──► THREE_WAY_MATCHING
    │                                                                 │
    │                                                                 ├──match──► MATCHED ──► PENDING_APPROVAL ──approve──► APPROVED ──► PARTIALLY_PAID ──► PAID
    │                                                                 │                    │
    │                                                                 │                    └──reject──► REJECTED
    │                                                                 │
    │                                                                 ├──variance──► MATCH_FAILED ──► EXCEPTION ──► PENDING_APPROVAL
    │                                                                 │
    │                                                                 └──no_po──► EXCEPTION (manual resolution)
    │
    └──void──► VOIDED (terminal)
```

#### Financial Implications

| Field | Type | Description |
|---|---|---|
| `subtotal` | `Decimal(38,12)` | Sum of line items before tax |
| `taxAmount` | `Decimal(38,12)` | Total tax — drives GL tax liability |
| `discountAmount` | `Decimal(38,12)` | Early payment discount — reduces payment |
| `shippingAmount` | `Decimal(38,12)` | Freight — GL allocated |
| `totalAmount` | `Decimal(38,12)` | **Primary financial field** — amount owed |
| `amountPaid` | `Decimal(38,12)` | Running payment total |
| `balanceDue` | `Decimal(38,12)` | Outstanding amount |
| `creditApplied` | `Decimal(38,12)` | Vendor credit offset |
| `netBalance` | `Decimal(38,12)` | **Net payable** — what gets paid |
| `exchangeRate` | `Decimal(20,8)` | FX conversion for multi-currency |
| `varianceAmount` | `Decimal(38,12)` | Match variance — affects approval routing |

#### Mutability Rules

| Status | Mutable Fields |
|---|---|
| `DRAFT` | All fields |
| `CAPTURED` | OCR fields, source fields |
| `VALIDATED` | Match fields, variance fields |
| `MATCHED` | Approval fields, payment fields |
| `APPROVED` | Payment fields only |
| `PAID` | `paymentReference`, `checkNumber` |
| `VOIDED` | **No fields mutable** |

---

### 2.11 InvoiceLineItem

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). Composite unique on `(companyId, vendorInvoiceId, lineNumber)`. |
| **Prisma Model** | `ProcurementInvoiceLineItem` |
| **Purpose** | Individual line items on an invoice. Each line has its own GL coding, tax, and match results. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `vendorInvoiceId` | `string` | FK → VendorInvoice, NOT NULL | — | No | Parent invoice |
| `lineNumber` | `int` | ≥ 1, NOT NULL | — | No | Line number |
| `description` | `string` | NOT NULL | — | Yes | Line description |
| `quantity` | `Decimal(20,4)` | > 0 | — | Yes | Quantity |
| `unitOfMeasure` | `string` | — | — | Yes | UOM |
| `unitPrice` | `Decimal(38,12)` | ≥ 0 | — | Yes | Unit price |
| `lineTotal` | `Decimal(38,12)` | derived | — | No | `quantity × unitPrice` |
| `discountPercent` | `Decimal(5,2)` | 0.00–100.00 | `0` | Yes | Line-level discount % |
| `discountAmount` | `Decimal(38,12)` | ≥ 0 | `0` | Yes | Line discount amount |
| `netLineTotal` | `Decimal(38,12)` | derived | — | No | `lineTotal - discountAmount` |
| `taxRate` | `Decimal(5,4)` | 0.0000–1.0000 | `0` | Yes | Tax rate |
| `taxAmount` | `Decimal(38,12)` | derived | — | No | `netLineTotal × taxRate` |
| `taxJurisdiction` | `string?` | — | — | Yes | Tax jurisdiction code |
| `taxType` | `enum?` | — | — | Yes | `VAT`, `GST`, `SALES_TAX`, `WITHHOLDING`, `EXEMPT` |
| `glAccountId` | `string?` | FK → GL Account | — | Yes | GL account code |
| `costCenterId` | `string?` | FK → Cost Center | — | Yes | Cost center |
| `departmentId` | `string?` | FK → Department | — | Yes | Department |
| `projectId` | `string?` | FK → Project | — | Yes | Project |
| `poReferenceLineItemId` | `string?` | FK → POReferenceLineItem | — | Yes | Matched PO line |
| `grnReferenceLineItemId` | `string?` | FK → GRNReferenceLineItem | — | Yes | Matched GRN line |
| `matchStatus` | `enum?` | — | — | Yes | `MATCHED`, `VARIANCE`, `UNMATCHED` |
| `matchVariance` | `Decimal(38,12)` | — | `0` | Yes | Price/qty variance from PO |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL | auto | No | Last update timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |
| `updatedBy` | `string` | NOT NULL | — | No | Last modifier userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| ILI-1 | `lineNumber` unique within invoice | DB constraint |
| ILI-2 | `lineTotal` = `quantity × unitPrice` — derived | Computed via `multiplyDecimals` |
| ILI-3 | `netLineTotal` = `lineTotal - discountAmount` | Computed via `financialRound` |
| ILI-4 | `taxAmount` = `netLineTotal × taxRate` | Computed via `multiplyDecimals` |
| ILI-5 | Sum of all line `netLineTotal` = invoice `subtotal` | Aggregate invariant |
| ILI-6 | GL coding required before invoice can be `VALIDATED` | Validation check |
| ILI-7 | Matched lines must have both `poReferenceLineItemId` and `grnReferenceLineItemId` for 3-way match | Match engine rule |

#### Financial Implications

| Field | Type | Description |
|---|---|---|
| `unitPrice` | `Decimal(38,12)` | Per-unit cost — matched against PO |
| `lineTotal` | `Decimal(38,12)` | Raw line total |
| `discountAmount` | `Decimal(38,12)` | Line-level discount |
| `netLineTotal` | `Decimal(38,12)` | **Net amount for GL posting** |
| `taxAmount` | `Decimal(38,12)` | Tax per line — aggregated to invoice |

---

### 2.12 InvoiceAttachment

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). |
| **Prisma Model** | `ProcurementInvoiceAttachment` |
| **Purpose** | Supporting documents attached to an invoice — scanned PDF, email body, supporting receipts, contracts. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `vendorInvoiceId` | `string` | FK → VendorInvoice, NOT NULL | — | No | Parent invoice |
| `fileName` | `string` | NOT NULL | — | No | Original filename |
| `fileType` | `string` | NOT NULL | — | No | MIME type |
| `fileSize` | `int` | ≥ 0 | — | No | Size in bytes |
| `storageUrl` | `string` | NOT NULL | — | No | Object storage URL |
| `category` | `enum` | NOT NULL | `INVOICE_COPY` | Yes | `INVOICE_COPY`, `SUPPORTING_DOC`, `CONTRACT`, `EMAIL_THREAD`, `RECEIPT`, `DELIVERY_NOTE` |
| `ocrExtracted` | `boolean` | NOT NULL | `false` | Yes | Whether OCR has been run |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| IA-1 | At least one `INVOICE_COPY` attachment required for `CAPTURED` status | Validation |
| IA-2 | Attachments are append-only — no updates, no deletes | Immutable after creation |
| IA-3 | `fileSize` max 50MB | Upload guard |
| IA-4 | `ocrExtracted` set to true after OCR processing completes | OCR pipeline |

---

### 2.13 ThreeWayMatch

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). Composite unique on `(companyId, vendorInvoiceId)`. |
| **Prisma Model** | `ProcurementThreeWayMatch` |
| **Purpose** | Promoted to independent aggregate. Records the result of a 3-way match between PO, GRN, and Invoice. Drives approval routing and exception handling. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `vendorInvoiceId` | `string` | FK → VendorInvoice, NOT NULL, UNIQUE | — | No | Invoice being matched |
| `poReferenceId` | `string` | FK → PurchaseOrderReference, NOT NULL | — | No | PO being matched against |
| `grnReferenceId` | `string` | FK → GoodsReceiptReference, NOT NULL | — | No | GRN being matched against |
| `matchResult` | `enum` | NOT NULL | — | Yes | `FULL_MATCH`, `PARTIAL_MATCH`, `PRICE_VARIANCE`, `QTY_VARIANCE`, `NO_MATCH` |
| `overallConfidence` | `Decimal(5,2)` | 0.00–100.00 | — | Yes | Match confidence score |
| `priceVarianceTotal` | `Decimal(38,12)` | ≥ 0 | `0` | Yes | Total price variance |
| `quantityVarianceTotal` | `Decimal(38,12)` | ≥ 0 | `0` | Yes | Total quantity variance |
| `totalVariance` | `Decimal(38,12)` | derived | — | Yes | `priceVarianceTotal + quantityVarianceTotal` |
| `variancePercent` | `Decimal(5,2)` | 0.00–100.00 | `0` | Yes | Variance as % of PO total |
| `autoApproved` | `boolean` | NOT NULL | `false` | Yes | Auto-approved within threshold |
| `approvalThreshold` | `Decimal(5,2)` | — | `5.00` | Yes | Variance % threshold for auto-approve |
| `matchedAt` | `DateTime` | NOT NULL | `now()` | No | When match was performed |
| `matchedBy` | `string` | NOT NULL | — | No | `SYSTEM` or userId |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL | auto | No | Last update timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |
| `updatedBy` | `string` | NOT NULL | — | No | Last modifier userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| TW-1 | One match per invoice | Unique constraint on `vendorInvoiceId` |
| TW-2 | `totalVariance` derived from price + quantity variances | Computed field |
| TW-3 | `autoApproved = true` when `variancePercent ≤ approvalThreshold` | Auto-approval rule |
| TW-4 | Price variance = Σ(invoice line unit price − PO line unit price) × quantity | Computation |
| TW-5 | Quantity variance = Σ(invoice qty − GRN accepted qty) × unit price | Computation |
| TW-6 | `PARTIAL_MATCH` when some lines match, others don't | Match engine logic |
| TW-7 | Match results are append-only — no modifications | Immutable after creation |

#### Lifecycle

```
CREATED ──match──► FULL_MATCH ──auto_approve──► AUTO_APPROVED
CREATED ──match──► PARTIAL_MATCH ──review──► RESOLVED / EXCEPTION
CREATED ──match──► PRICE_VARIANCE ──review──► RESOLVED / EXCEPTION
CREATED ──match──► QTY_VARIANCE ──review──► RESOLVED / EXCEPTION
CREATED ──match──► NO_MATCH ──► EXCEPTION
```

#### Financial Implications

| Field | Type | Description |
|---|---|---|
| `priceVarianceTotal` | `Decimal(38,12)` | Price difference — affects approval |
| `quantityVarianceTotal` | `Decimal(38,12)` | Quantity difference — affects approval |
| `totalVariance` | `Decimal(38,12)` | Combined variance |
| `variancePercent` | `Decimal(5,2)` | Percentage of PO — drives auto-approve logic |

---

### 2.14 MatchLineItem

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). |
| **Prisma Model** | `ProcurementMatchLineItem` |
| **Purpose** | Per-line match result within a 3-way match. Shows exactly which lines matched, which didn't, and why. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `threeWayMatchId` | `string` | FK → ThreeWayMatch, NOT NULL | — | No | Parent match |
| `invoiceLineItemId` | `string` | FK → InvoiceLineItem, NOT NULL | — | No | Invoice line |
| `poReferenceLineItemId` | `string?` | FK → POReferenceLineItem | — | Yes | Matched PO line |
| `grnReferenceLineItemId` | `string?` | FK → GRNReferenceLineItem | — | Yes | Matched GRN line |
| `matchStatus` | `enum` | NOT NULL | — | Yes | `EXACT_MATCH`, `PRICE_VARIANCE`, `QTY_VARIANCE`, `NO_MATCH` |
| `invoiceQuantity` | `Decimal(20,4)` | > 0 | — | No | Invoice qty |
| `invoiceUnitPrice` | `Decimal(38,12)` | ≥ 0 | — | No | Invoice unit price |
| `poQuantity` | `Decimal(20,4)?` | > 0 | — | No | PO qty |
| `poUnitPrice` | `Decimal(38,12)?` | ≥ 0 | — | No | PO unit price |
| `grnQuantity` | `Decimal(20,4)?` | ≥ 0 | — | No | GRN accepted qty |
| `priceVariance` | `Decimal(38,12)` | — | `0` | Yes | Per-line price variance |
| `quantityVariance` | `Decimal(20,4)` | — | `0` | Yes | Per-line qty variance |
| `confidence` | `Decimal(5,2)` | 0.00–100.00 | — | Yes | Line-level match confidence |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL | auto | No | Last update timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |
| `updatedBy` | `string` | NOT NULL | — | No | Last modifier userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| MLI-1 | One match line per invoice line | 1:1 relationship |
| MLI-2 | `priceVariance` = `(invoiceUnitPrice - poUnitPrice) × invoiceQuantity` | Computation |
| MLI-3 | `quantityVariance` = `invoiceQuantity - grnQuantity` | Computation |
| MLI-4 | `EXACT_MATCH` when both variances are zero (within tolerance) | Match engine |
| MLI-5 | `NO_MATCH` when `poReferenceLineItemId` is null | Match engine |

#### Financial Implications

| Field | Type | Description |
|---|---|---|
| `priceVariance` | `Decimal(38,12)` | Per-line price difference |
| `quantityVariance` | `Decimal(20,4)` | Per-line quantity difference |

---

### 2.15 InvoiceException

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). |
| **Prisma Model** | `ProcurementInvoiceException` |
| **Purpose** | Records a specific exception on an invoice that requires manual resolution. Exceptions block the invoice from progressing until resolved. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `vendorInvoiceId` | `string` | FK → VendorInvoice, NOT NULL | — | No | Invoice with exception |
| `exceptionType` | `enum` | NOT NULL | — | No | `PRICE_VARIANCE`, `QTY_VARIANCE`, `NO_PO`, `DUPLICATE`, `MISSING_GRN`, `GL_CODING_REQUIRED`, `APPROVAL_REQUIRED`, `TAX_MISMATCH`, `CREDIT_NOTE_REQUIRED` |
| `severity` | `enum` | NOT NULL | `MEDIUM` | No | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `description` | `string` | NOT NULL | — | No | Human-readable description |
| `varianceAmount` | `Decimal(38,12)` | — | `0` | No | Financial impact |
| `relatedEntityId` | `string?` | — | — | No | Related entity (PO, GRN, Invoice) |
| `status` | `enum` | NOT NULL | `OPEN` | Yes | `OPEN`, `IN_REVIEW`, `RESOLVED`, `WAIVED`, `ESCALATED` |
| `assignedTo` | `string?` | — | — | Yes | Resolver userId |
| `resolution` | `string?` | — | — | Yes | Resolution description |
| `resolvedAt` | `Date?` | — | — | Yes | Resolution timestamp |
| `resolvedBy` | `string?` | — | — | Yes | Resolver userId |
| `escalatedTo` | `string?` | — | — | Yes | Escalation target userId |
| `escalatedAt` | `Date?` | — | — | Yes | Escalation timestamp |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL | auto | No | Last update timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |
| `updatedBy` | `string` | NOT NULL | — | No | Last modifier userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| IE-1 | Open exceptions block invoice approval | Status gate |
| IE-2 | `CRITICAL` exceptions require Controller-level resolution | Escalation rule |
| IE-3 | `WAIVED` exceptions must have documented justification | Resolution validation |
| IE-4 | `RESOLVED` exceptions update invoice status accordingly | Side effect on invoice |
| IE-5 | Exception count visible on invoice detail page | UI query |

#### Lifecycle

```
OPEN ──assign──► IN_REVIEW ──resolve──► RESOLVED
OPEN ──assign──► IN_REVIEW ──escalate──► ESCALATED ──resolve──► RESOLVED
OPEN ──assign──► IN_REVIEW ──waive──► WAIVED
```

#### Financial Implications

| Field | Type | Description |
|---|---|---|
| `varianceAmount` | `Decimal(38,12)` | Financial impact of the exception |

---

### 2.16 ApprovalRecord

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). |
| **Prisma Model** | `ProcurementApprovalRecord` |
| **Purpose** | AP-specific approval chain record. Tracks every approval decision for invoices, capturing who approved, when, at what authority level, and any delegation. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `vendorInvoiceId` | `string` | FK → VendorInvoice, NOT NULL | — | No | Invoice being approved |
| `approvalLevel` | `int` | ≥ 1, NOT NULL | — | No | Level in approval hierarchy |
| `approvalLevelName` | `string` | NOT NULL | — | No | Human-readable level name |
| `requiredRole` | `string` | NOT NULL | — | No | Required role for this level |
| `requiredThreshold` | `Decimal(38,12)` | — | — | No | Amount threshold for this level |
| `status` | `enum` | NOT NULL | `PENDING` | Yes | `PENDING`, `APPROVED`, `REJECTED`, `DELEGATED`, `SKIPPED` |
| `decision` | `enum?` | — | — | Yes | `APPROVE`, `REJECT`, `REQUEST_INFO`, `DELEGATE` |
| `decisionAt` | `Date?` | — | — | Yes | Decision timestamp |
| `decisionBy` | `string?` | — | — | Yes | Decision maker userId |
| `decisionComment` | `string?` | — | — | Yes | Decision reason |
| `delegatedTo` | `string?` | — | — | Yes | Delegation target userId |
| `delegatedAt` | `Date?` | — | — | Yes | Delegation timestamp |
| `delegationReason` | `string?` | — | — | Yes | Why delegated |
| `escalated` | `boolean` | NOT NULL | `false` | Yes | Escalation flag |
| `escalatedAt` | `Date?` | — | — | Yes | Escalation timestamp |
| `escalationReason` | `string?` | — | — | Yes | Why escalated |
| `timeLimit` | `DateTime?` | — | — | No | Deadline for decision |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL | auto | No | Last update timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |
| `updatedBy` | `string` | NOT NULL | — | No | Last modifier userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| AR-1 | All previous levels must be `APPROVED` before next level can act | Sequential approval gate |
| AR-2 | `timeLimit` triggers auto-escalation if not decided | Scheduler job |
| AR-3 | Delegation requires `delegatedTo` and `delegationReason` | Validation |
| AR-4 | Same person cannot approve at multiple levels | Duplicate guard |
| AR-5 | `decisionBy` must have `requiredRole` | Role check |

#### Lifecycle

```
PENDING ──approve──► APPROVED
PENDING ──reject───► REJECTED
PENDING ──delegate──► DELEGATED
PENDING ──skip───► SKIPPED (auto-level below threshold)
PENDING ──escalate──► PENDING (escalated=true)
```

#### Financial Implications

| Field | Type | Description |
|---|---|---|
| `requiredThreshold` | `Decimal(38,12)` | Amount threshold that determines which approval level is required |

---

### 2.17 ApprovalLevel

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). Composite unique on `(companyId, levelNumber)`. |
| **Prisma Model** | `ProcurementApprovalLevel` |
| **Purpose** | Configuration entity defining approval authority levels. Not per-invoice — this is the approval matrix configuration. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `levelNumber` | `int` | ≥ 1, UNIQUE per `(companyId)`, NOT NULL | — | No | Level in hierarchy |
| `levelName` | `string` | NOT NULL | — | Yes | e.g., "AP Clerk", "AP Manager", "Controller", "CFO" |
| `minAmount` | `Decimal(38,12)` | ≥ 0 | — | Yes | Lower bound (inclusive) |
| `maxAmount` | `Decimal(38,12)?` | ≥ `minAmount` or NULL for unlimited | — | Yes | Upper bound (inclusive) |
| `requiredRole` | `string[]` | NOT NULL | — | Yes | Roles that can approve at this level |
| `requiredDepartment` | `string?` | — | — | Yes | Optional department constraint |
| `canDelegate` | `boolean` | NOT NULL | `true` | Yes | Allow delegation |
| `canEscalate` | `boolean` | NOT NULL | `true` | Yes | Allow escalation |
| `timeLimitHours` | `int` | ≥ 1 | `48` | Yes | Hours before auto-escalation |
| `isActive` | `boolean` | NOT NULL | `true` | Yes | Enabled/disabled |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL | auto | No | Last update timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |
| `updatedBy` | `string` | NOT NULL | — | No | Last modifier userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| AL-1 | `levelNumber` unique within company | DB constraint |
| AL-2 | Amount ranges must not overlap | Gap check at creation/update |
| AL-3 | At least one active level must cover 0 → ∞ | Completeness check |
| AL-4 | `maxAmount` can be NULL for highest level (unlimited) | Validation |
| AL-5 | Deactivating a level that has pending approvals triggers re-routing | Migration logic |

---

### 2.18 PaymentProposal

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). Composite unique on `(companyId, proposalNumber)`. |
| **Prisma Model** | `ProcurementPaymentProposal` |
| **Purpose** | A batch of approved invoices selected for payment. Created by AP Clerk or system scheduler, reviewed by AP Manager, then executed as a PaymentBatch. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `proposalNumber` | `string` | UNIQUE per `(companyId)`, NOT NULL | — | No | Sequential proposal number |
| `status` | `enum` | NOT NULL | `DRAFT` | Yes | `DRAFT`, `SUBMITTED`, `REVIEWED`, `APPROVED`, `REJECTED`, `EXECUTED`, `CANCELLED` |
| `proposalDate` | `Date` | NOT NULL | `now()` | No | Creation date |
| `paymentDate` | `Date` | NOT NULL | — | Yes | Target payment date |
| `currency` | `string` | NOT NULL, ISO 4217 | `USD` | No | Proposal currency |
| `totalAmount` | `Decimal(38,12)` | derived | — | No | Sum of all items |
| `totalInvoices` | `int` | derived | — | No | Count of invoices |
| `totalVendors` | `int` | derived | — | No | Count of unique vendors |
| `paymentMethod` | `enum` | NOT NULL | `ACH` | Yes | `ACH`, `WIRE`, `CHECK`, `EFT`, `VIRTUAL_CARD` |
| `prioritizeDiscounts` | `boolean` | NOT NULL | `false` | Yes | Sort by discount deadline |
| `includePartialPayments` | `boolean` | NOT NULL | `false` | Yes | Allow paying partial balances |
| `submittedBy` | `string?` | — | — | Yes | Submitter userId |
| `submittedAt` | `Date?` | — | — | Yes | Submission timestamp |
| `reviewedBy` | `string?` | — | — | Yes | Reviewer userId |
| `reviewedAt` | `Date?` | — | — | Yes | Review timestamp |
| `approvedBy` | `string?` | — | — | Yes | Approver userId |
| `approvedAt` | `Date?` | — | — | Yes | Approval timestamp |
| `rejectedBy` | `string?` | — | — | Yes | Rejector userId |
| `rejectionReason` | `string?` | — | — | Yes | Rejection reason |
| `paymentBatchId` | `string?` | FK → PaymentBatch | — | Yes | Generated batch |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL | auto | No | Last update timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |
| `updatedBy` | `string` | NOT NULL | — | No | Last modifier userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| PP-1 | Only `APPROVED` invoices can be added to a proposal | Inclusion guard |
| PP-2 | `totalAmount` = Σ of all `PaymentProposalItem.amount` | Aggregate |
| PP-3 | `paymentDate` must be ≥ today | Date validation |
| PP-4 | `DRAFT` proposals can be freely modified | Mutable state |
| PP-5 | `EXECUTED` proposals cannot be cancelled | Terminal state |
| PP-6 | One active proposal per payment method at a time | Active proposal guard |

#### Lifecycle

```
DRAFT ──submit──► SUBMITTED ──review──► REVIEWED ──approve──► APPROVED ──execute──► EXECUTED
DRAFT ──submit──► SUBMITTED ──review──► REVIEWED ──reject──► REJECTED
DRAFT ──submit──► SUBMITTED ──cancel──► CANCELLED
```

#### Financial Implications

| Field | Type | Description |
|---|---|---|
| `totalAmount` | `Decimal(38,12)` | Total cash outflow for this proposal |

---

### 2.19 PaymentProposalItem

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). |
| **Prisma Model** | `ProcurementPaymentProposalItem` |
| **Purpose** | Individual invoice entry in a payment proposal. One record per invoice per proposal. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `paymentProposalId` | `string` | FK → PaymentProposal, NOT NULL | — | No | Parent proposal |
| `vendorInvoiceId` | `string` | FK → VendorInvoice, NOT NULL | — | No | Invoice to pay |
| `vendorId` | `string` | FK → Vendor, NOT NULL | — | No | Invoice vendor (denormalized) |
| `amount` | `Decimal(38,12)` | > 0 | — | Yes | Amount to pay |
| `discountTaken` | `Decimal(38,12)` | ≥ 0 | `0` | Yes | Early payment discount applied |
| `creditApplied` | `Decimal(38,12)` | ≥ 0 | `0` | Yes | Vendor credit applied |
| `netPayment` | `Decimal(38,12)` | derived | — | No | `amount - discountTaken - creditApplied` |
| `paymentPriority` | `int` | ≥ 1 | `100` | Yes | Sort order (lower = higher priority) |
| `selectedBy` | `enum` | NOT NULL | `AUTO` | Yes | `AUTO`, `MANUAL`, `DISCOUNT_OPTIMIZED` |
| `notes` | `string?` | — | — | Yes | Payment notes |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL | auto | No | Last update timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |
| `updatedBy` | `string` | NOT NULL | — | No | Last modifier userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| PPI-1 | `amount` ≤ `vendorInvoice.netBalance` | Guard on inclusion |
| PPI-2 | `netPayment` = `amount - discountTaken - creditApplied` | Computed |
| PPI-3 | `discountTaken` only if payment within discount window | Discount eligibility check |
| PPI-4 | `creditApplied` ≤ vendor credit `remainingAmount` | Credit availability check |
| PPI-5 | Same invoice cannot appear in two active proposals | Duplicate guard |

#### Financial Implications

| Field | Type | Description |
|---|---|---|
| `amount` | `Decimal(38,12)` | Amount being paid |
| `discountTaken` | `Decimal(38,12)` | Cash discount captured |
| `creditApplied` | `Decimal(38,12)` | Credit offset |
| `netPayment` | `Decimal(38,12)` | **Actual cash outflow per line** |

---

### 2.20 PaymentBatch

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). Composite unique on `(companyId, batchNumber)`. |
| **Prisma Model** | `ProcurementPaymentBatch` |
| **Purpose** | Groups payments for bank file generation. One batch = one bank transfer file (ACH file, wire batch, check run). |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `batchNumber` | `string` | UNIQUE per `(companyId)`, NOT NULL | — | No | Sequential batch number |
| `paymentProposalId` | `string` | FK → PaymentProposal, NOT NULL | — | No | Source proposal |
| `status` | `enum` | NOT NULL | `PENDING` | Yes | `PENDING`, `GENERATING`, `READY`, `SUBMITTED`, `COMPLETED`, `FAILED`, `CANCELLED` |
| `paymentMethod` | `enum` | NOT NULL | — | No | `ACH`, `WIRE`, `CHECK`, `EFT`, `VIRTUAL_CARD` |
| `bankAccountId` | `string` | NOT NULL | — | No | Source bank account |
| `totalPayments` | `int` | derived | — | No | Count of payments |
| `totalAmount` | `Decimal(38,12)` | derived | — | No | Sum of all payment amounts |
| `totalFees` | `Decimal(38,12)` | ≥ 0 | `0` | Yes | Bank fees for batch |
| `netDisbursement` | `Decimal(38,12)` | derived | — | No | `totalAmount + totalFees` |
| `fileUrl` | `string?` | — | — | Yes | Generated bank file URL |
| `fileName` | `string?` | — | — | No | Generated filename |
| `submittedAt` | `Date?` | — | — | Yes | When submitted to bank |
| `completedAt` | `Date?` | — | — | Yes | When bank confirmed |
| `confirmedBy` | `string?` | — | — | Yes | Confirmer userId |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL | auto | No | Last update timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |
| `updatedBy` | `string` | NOT NULL | — | No | Last modifier userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| PB-1 | `batchNumber` unique within company | DB constraint |
| PB-2 | One batch per proposal | Unique constraint on `paymentProposalId` |
| PB-3 | `totalAmount` = Σ of all `PaymentRecord.amount` in batch | Aggregate |
| PB-4 | `COMPLETED` batches cannot be modified | Terminal state |
| PB-5 | `FAILED` batches trigger automatic reversal of all payments | Reversal logic |
| PB-6 | Bank file generated only when status = `GENERATING` | File gen guard |

#### Lifecycle

```
PENDING ──generate──► GENERATING ──ready──► READY ──submit──► SUBMITTED ──complete──► COMPLETED
GENERATING ──fail──► FAILED (reversal triggered)
SUBMITTED ──fail──► FAILED (reversal triggered)
```

#### Financial Implications

| Field | Type | Description |
|---|---|---|
| `totalAmount` | `Decimal(38,12)` | Total disbursement amount |
| `totalFees` | `Decimal(38,12)` | Bank processing fees |
| `netDisbursement` | `Decimal(38,12)` | **Total debited from company bank account** |

---

### 2.21 PaymentRecord

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). Composite unique on `(companyId, paymentNumber)`. |
| **Prisma Model** | `ProcurementPaymentRecord` |
| **Purpose** | Immutable record of a payment made to a vendor. One record per invoice per payment. Created when a batch is executed. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `paymentNumber` | `string` | UNIQUE per `(companyId)`, NOT NULL | — | No | Sequential payment number |
| `paymentBatchId` | `string` | FK → PaymentBatch, NOT NULL | — | No | Parent batch |
| `vendorInvoiceId` | `string` | FK → VendorInvoice, NOT NULL | — | No | Invoice paid |
| `vendorId` | `string` | FK → Vendor, NOT NULL | — | No | Vendor paid (denormalized) |
| `paymentDate` | `Date` | NOT NULL | — | No | Payment date |
| `amount` | `Decimal(38,12)` | > 0 | — | No | Payment amount |
| `discountTaken` | `Decimal(38,12)` | ≥ 0 | `0` | No | Early payment discount |
| `creditApplied` | `Decimal(38,12)` | ≥ 0 | `0` | No | Vendor credit applied |
| `netPayment` | `Decimal(38,12)` | derived | — | No | `amount - discountTaken - creditApplied` |
| `currency` | `string` | NOT NULL, ISO 4217 | `USD` | No | Payment currency |
| `exchangeRate` | `Decimal(20,8)` | > 0 | `1.00000000` | No | FX rate at payment time |
| `baseCurrencyAmount` | `Decimal(38,12)` | derived | — | No | `netPayment × exchangeRate` |
| `paymentMethod` | `enum` | NOT NULL | — | No | `ACH`, `WIRE`, `CHECK`, `EFT`, `VIRTUAL_CARD` |
| `bankAccountId` | `string` | NOT NULL | — | No | Source bank account |
| `transactionReference` | `string?` | — | — | No | Bank transaction reference |
| `checkNumber` | `string?` | — | — | No | Check number |
| `status` | `enum` | NOT NULL | `PROCESSED` | Yes | `PROCESSED`, `CLEARED`, `VOIDED`, `FAILED`, `REVERSED` |
| `glPosted` | `boolean` | NOT NULL | `false` | Yes | AP GL entry posted |
| `glPostedAt` | `Date?` | — | — | Yes | GL posting timestamp |
| `glReversalPosted` | `boolean` | NOT NULL | `false` | Yes | Reversal GL entry posted |
| `idempotencyKey` | `string?` | UNIQUE | — | No | Idempotency key |
| `voidedAt` | `Date?` | — | — | Yes | Void timestamp |
| `voidedBy` | `string?` | — | — | Yes | Void userId |
| `voidReason` | `string?` | — | — | Yes | Void reason |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL | auto | No | Last update timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |
| `updatedBy` | `string` | NOT NULL | — | No | Last modifier userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| PR-1 | `paymentNumber` unique within company | DB constraint |
| PR-2 | `idempotencyKey` must be unique | DB constraint |
| PR-3 | `netPayment` = `amount - discountTaken - creditApplied` | Computed |
| PR-4 | `baseCurrencyAmount` = `netPayment × exchangeRate` | Computed |
| PR-5 | Voided payments cannot be un-voided | Terminal state |
| PR-6 | `VOIDED` payments trigger GL reversal | Side effect |
| PR-7 | `PROCESSED` → `CLEARED` only via bank confirmation | Bank reconciliation |
| PR-8 | `FAILED` payments trigger reversal of all related invoice `amountPaid` | Reversal logic |

#### Lifecycle

```
PROCESSED ──confirm──► CLEARED
PROCESSED ──void──► VOIDED
PROCESSED ──fail──► FAILED
```

#### Financial Implications

| Field | Type | Description |
|---|---|---|
| `amount` | `Decimal(38,12)` | Gross payment amount |
| `discountTaken` | `Decimal(38,12)` | Cash discount captured |
| `creditApplied` | `Decimal(38,12)` | Vendor credit offset |
| `netPayment` | `Decimal(38,12)` | **Actual cash outflow** |
| `baseCurrencyAmount` | `Decimal(38,12)` | Base currency equivalent for GL |

---

### 2.22 VendorStatement

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). Composite unique on `(companyId, vendorId, statementDate)`. |
| **Prisma Model** | `ProcurementVendorStatement` |
| **Purpose** | Vendor's periodic statement of account. Used for reconciliation against AP's own records. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `vendorId` | `string` | FK → Vendor, NOT NULL | — | No | Statement vendor |
| `statementNumber` | `string` | NOT NULL | — | No | Vendor's statement number |
| `statementDate` | `Date` | NOT NULL | — | No | Statement period end date |
| `periodStart` | `Date` | NOT NULL | — | No | Period start |
| `periodEnd` | `Date` | NOT NULL | — | No | Period end |
| `openingBalance` | `Decimal(38,12)` | — | `0` | No | Balance at period start |
| `totalInvoices` | `Decimal(38,12)` | ≥ 0 | `0` | No | New invoices in period |
| `totalPayments` | `Decimal(38,12)` | ≥ 0 | `0` | No | Payments applied in period |
| `totalCredits` | `Decimal(38,12)` | ≥ 0 | `0` | No | Credits in period |
| `closingBalance` | `Decimal(38,12)` | derived | — | No | `openingBalance + totalInvoices - totalPayments - totalCredits` |
| `currency` | `string` | NOT NULL, ISO 4217 | `USD` | No | Statement currency |
| `status` | `enum` | NOT NULL | `RECEIVED` | Yes | `RECEIVED`, `PARSING`, `PARSED`, `RECONCILING`, `RECONCILED`, `EXCEPTION` |
| `fileUrl` | `string?` | — | — | Yes | Statement file URL |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL | auto | No | Last update timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |
| `updatedBy` | `string` | NOT NULL | — | No | Last modifier userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| VS-1 | `closingBalance` derived from period activity + opening balance | Computed |
| VS-2 | One statement per vendor per date | DB constraint |
| VS-3 | Reconciliation requires all invoices in the period to be processed | Prerequisite check |

#### Lifecycle

```
RECEIVED ──parse──► PARSING ──► PARSED ──reconcile──► RECONCILING ──► RECONCILED / EXCEPTION
```

#### Financial Implications

| Field | Type | Description |
|---|---|---|
| `openingBalance` | `Decimal(38,12)` | Starting balance for reconciliation |
| `closingBalance` | `Decimal(38,12)` | **Target balance for reconciliation** |

---

### 2.23 VendorStatementLine

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). |
| **Prisma Model** | `ProcurementVendorStatementLine` |
| **Purpose** | Individual transaction on a vendor statement. Parsed from vendor statement file and matched against AP's records. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `vendorStatementId` | `string` | FK → VendorStatement, NOT NULL | — | No | Parent statement |
| `lineNumber` | `int` | ≥ 1, NOT NULL | — | No | Line sequence |
| `transactionDate` | `Date` | NOT NULL | — | No | Transaction date |
| `reference` | `string` | NOT NULL | — | No | Vendor reference (invoice #, payment ref) |
| `description` | `string` | NOT NULL | — | No | Transaction description |
| `debitAmount` | `Decimal(38,12)` | ≥ 0 | `0` | No | Debit (increases balance) |
| `creditAmount` | `Decimal(38,12)` | ≥ 0 | `0` | No | Credit (decreases balance) |
| `balance` | `Decimal(38,12)` | — | — | No | Running balance |
| `transactionType` | `enum` | NOT NULL | — | No | `INVOICE`, `PAYMENT`, `CREDIT`, `ADJUSTMENT`, `FEE` |
| `matchedInvoiceId` | `string?` | FK → VendorInvoice | — | Yes | Matched AP invoice |
| `matchedPaymentId` | `string?` | FK → PaymentRecord | — | Yes | Matched AP payment |
| `matchStatus` | `enum` | NOT NULL | `UNMATCHED` | Yes | `UNMATCHED`, `MATCHED`, `PARTIAL`, `EXCEPTION` |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL | auto | No | Last update timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |
| `updatedBy` | `string` | NOT NULL | — | No | Last modifier userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| VSL-1 | `debitAmount` and `creditAmount` are mutually exclusive (one is 0) | Validation |
| VSL-2 | `balance` is running sum of debits minus credits | Computed during parse |
| VSL-3 | `MATCHED` lines must have either `matchedInvoiceId` or `matchedPaymentId` | Match integrity |
| VSL-4 | `EXCEPTION` lines require manual resolution | Resolution workflow |

#### Financial Implications

| Field | Type | Description |
|---|---|---|
| `debitAmount` | `Decimal(38,12)` | Vendor-charged amount |
| `creditAmount` | `Decimal(38,12)` | Vendor-credited amount |
| `balance` | `Decimal(38,12)` | Running balance |

---

### 2.24 ReconciliationResult

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). Composite unique on `(companyId, vendorStatementId)`. |
| **Prisma Model** | `ProcurementReconciliationResult` |
| **Purpose** | Outcome of reconciling a vendor statement against AP records. Records match rate, variances, and resolution status. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `vendorStatementId` | `string` | FK → VendorStatement, NOT NULL, UNIQUE | — | No | Statement reconciled |
| `vendorId` | `string` | FK → Vendor, NOT NULL | — | No | Vendor (denormalized) |
| `reconciliationDate` | `Date` | NOT NULL | `now()` | No | When reconciliation ran |
| `apBalance` | `Decimal(38,12)` | — | — | No | AP's recorded balance |
| `vendorBalance` | `Decimal(38,12)` | — | — | No | Vendor's stated balance |
| `balanceVariance` | `Decimal(38,12)` | derived | — | No | `apBalance - vendorBalance` |
| `totalLines` | `int` | ≥ 0 | — | No | Total statement lines |
| `matchedLines` | `int` | ≥ 0 | — | No | Successfully matched |
| `unmatchedLines` | `int` | derived | — | No | `totalLines - matchedLines` |
| `matchRate` | `Decimal(5,2)` | 0.00–100.00 | derived | No | `matchedLines / totalLines × 100` |
| `status` | `enum` | NOT NULL | `IN_PROGRESS` | Yes | `IN_PROGRESS`, `COMPLETED`, `EXCEPTION`, `ADJUSTED` |
| `adjustmentAmount` | `Decimal(38,12)` | ≥ 0 | `0` | Yes | Manual adjustment |
| `adjustmentReason` | `string?` | — | — | Yes | Reason for adjustment |
| `adjustedBy` | `string?` | — | — | Yes | Adjuster userId |
| `resolvedBy` | `string?` | — | — | Yes | Resolver userId |
| `resolvedAt` | `Date?` | — | — | Yes | Resolution timestamp |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |
| `updatedAt` | `DateTime` | NOT NULL | auto | No | Last update timestamp |
| `createdBy` | `string` | NOT NULL | — | No | Creator userId |
| `updatedBy` | `string` | NOT NULL | — | No | Last modifier userId |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| RR-1 | `balanceVariance` = `apBalance - vendorBalance` | Computed |
| RR-2 | One result per statement | Unique constraint |
| RR-3 | `matchRate` auto-calculated from line matches | Computed |
| RR-4 | `adjustmentAmount` > 0 requires `adjustmentReason` and Controller approval | Validation + approval |
| RR-5 | `COMPLETED` results cannot be modified | Terminal state |

#### Lifecycle

```
IN_PROGRESS ──complete──► COMPLETED
IN_PROGRESS ──exception──► EXCEPTION ──adjust──► ADJUSTED
```

#### Financial Implications

| Field | Type | Description |
|---|---|---|
| `apBalance` | `Decimal(38,12)` | AP's book balance |
| `vendorBalance` | `Decimal(38,12)` | Vendor's stated balance |
| `balanceVariance` | `Decimal(38,12)` | **Reconciliation variance — must be explained** |
| `adjustmentAmount` | `Decimal(38,12)` | Manual adjustment posted to GL |

---

### 2.25 APAuditRecord

| Aspect | Specification |
|---|---|
| **Identity** | `id: string` — UUID (CUID). |
| **Prisma Model** | `ProcurementAPAuditRecord` |
| **Purpose** | Append-only audit log for every AP state transition, financial decision, and configuration change. Immutable by design. |

#### Attributes

| Field | Type | Constraints | Default | Mutable | Description |
|---|---|---|---|---|---|
| `id` | `string` | PK, CUID | auto | No | Primary identifier |
| `companyId` | `string` | FK → Company, NOT NULL | — | No | Multi-tenant owner |
| `entityType` | `string` | NOT NULL | — | No | e.g., `VendorInvoice`, `PaymentRecord`, `ApprovalRecord` |
| `entityId` | `string` | NOT NULL | — | No | ID of affected entity |
| `action` | `enum` | NOT NULL | — | No | `CREATED`, `UPDATED`, `STATUS_CHANGED`, `APPROVED`, `REJECTED`, `VOIDED`, `PAID`, `EXCEPTION`, `RESOLVED`, `DELEGATED`, `ESCALATED`, `CONFIG_CHANGED` |
| `field` | `string?` | — | — | No | Changed field (for UPDATE actions) |
| `oldValue` | `string?` | — | — | No | Previous value (JSON stringified) |
| `newValue` | `string?` | — | — | No | New value (JSON stringified) |
| `amount` | `Decimal(38,12)?` | — | — | No | Financial amount (if applicable) |
| `description` | `string` | NOT NULL | — | No | Human-readable description |
| `reason` | `string?` | — | — | No | Business reason |
| `userId` | `string` | NOT NULL | — | No | Actor userId |
| `userRole` | `string` | NOT NULL | — | No | Actor role at time of action |
| `ipAddress` | `string?` | — | — | No | Request IP address |
| `userAgent` | `string?` | — | — | No | Request user agent |
| `correlationId` | `string?` | — | — | No | Request correlation ID |
| `metadata` | `JSON?` | — | — | No | Additional structured data |
| `createdAt` | `DateTime` | NOT NULL | `now()` | No | Creation timestamp |

#### Business Rules

| ID | Rule | Enforcement |
|---|---|---|
| AAR-1 | Records are append-only — **no UPDATE, no DELETE** | DB: no UPDATE/DELETE permissions; service enforces |
| AAR-2 | Every state transition must write an audit record **before** the commit | Service-layer pattern: audit first, then commit |
| AAR-3 | `oldValue`/`newValue` must be JSON-stringified for reconstructability | Serialization standard |
| AAR-4 | `amount` captured for all financial state changes | Service pattern |
| AAR-5 | `correlationId` links related records across a single request | Request-scoped context |
| AAR-6 | Retention: 7 years minimum (regulatory requirement) | Archive policy |

---

## 3. Part 2 — Value Objects

### 3.1 Money

| Aspect | Specification |
|---|---|
| **Purpose** | Represents a monetary amount in a specific currency. Enforces precision and prevents mixing currencies without explicit conversion. |

#### Attributes

| Field | Type | Constraints | Description |
|---|---|---|---|
| `amount` | `Decimal(38, 12)` | NOT NULL, finite | The monetary value |
| `currency` | `string` | NOT NULL, ISO 4217 | Currency code |

#### Immutability

This is a value object — it is **immutable**. Operations return a new `Money` instance.

#### Validation Rules

- `amount` must be finite (not `NaN`, not `Infinity`)
- `currency` must be valid ISO 4217 code
- `amount` precision: 12 decimal places

#### Factory Methods

| Method | Signature | Description |
|---|---|---|
| `create` | `Money.create(amount: Decimal, currency: string): Money` | Primary constructor with validation |
| `zero` | `Money.zero(currency: string): Money` | Zero amount in given currency |
| `add` | `m1.add(m2: Money): Money` | Same-currency addition |
| `subtract` | `m1.subtract(m2: Money): Money` | Same-currency subtraction |
| `multiply` | `m.multiply(factor: Decimal): Money` | Scalar multiplication |
| `negate` | `m.negate(): Money` | Negate amount |
| `isPositive` | `m.isPositive(): boolean` | `amount > 0` |
| `isNegative` | `m.isNegative(): boolean` | `amount < 0` |
| `isZero` | `m.isZero(): boolean` | `amount = 0` |
| `isSameCurrency` | `m1.isSameCurrency(m2: Money): boolean` | Currency match check |

---

### 3.2 Currency

| Aspect | Specification |
|---|---|
| **Purpose** | Represents a currency with its ISO code, decimal precision, and display symbol. |

#### Attributes

| Field | Type | Constraints | Description |
|---|---|---|---|
| `code` | `string` | NOT NULL, ISO 4217 | e.g., `USD`, `EUR`, `GBP` |
| `decimalPlaces` | `int` | 0–12 | Number of decimal places (USD=2, JPY=0, KWD=3) |
| `symbol` | `string` | NOT NULL | Display symbol (`$`, `€`, `£`) |
| `name` | `string` | NOT NULL | Full name (`United States Dollar`) |

#### Immutability

**Immutable.** Currencies are configuration — they do not change at runtime.

#### Validation Rules

- `code` must match ISO 4217 3-letter code
- `decimalPlaces` must be 0–12
- `symbol` must be non-empty

#### Factory Methods

| Method | Signature | Description |
|---|---|---|
| `fromCode` | `Currency.fromCode(code: string): Currency` | Lookup by ISO code |
| `supported` | `Currency.supported(): Currency[]` | All supported currencies |

#### Supported Currencies

| Code | Decimal Places | Symbol |
|---|---|---|
| USD | 2 | $ |
| EUR | 2 | € |
| GBP | 2 | £ |
| JPY | 0 | ¥ |
| KWD | 3 | د.ك |
| BHD | 3 | .ب.د |
| OMR | 3 | ﷼ |
| SGD | 2 | S$ |
| AED | 2 | د.إ |
| SAR | 2 | ﷼ |

---

### 3.3 TaxRate

| Aspect | Specification |
|---|---|
| **Purpose** | Encapsulates a tax rate with its jurisdiction and type. Prevents raw rate manipulation. |

#### Attributes

| Field | Type | Constraints | Description |
|---|---|---|---|
| `rate` | `Decimal(5, 4)` | NOT NULL, 0.0000–1.0000 | Tax rate as decimal (0.05 = 5%) |
| `jurisdiction` | `string` | NOT NULL | Tax jurisdiction code |
| `type` | `enum` | NOT NULL | `VAT`, `GST`, `SALES_TAX`, `WITHHOLDING`, `EXEMPT` |
| `name` | `string?` | — | Human-readable name |

#### Immutability

**Immutable.** Tax rates are configuration — changes create new instances.

#### Validation Rules

- `rate` must be ≥ 0 and ≤ 1.0000
- `jurisdiction` must be non-empty
- `type` must be valid enum value

#### Factory Methods

| Method | Signature | Description |
|---|---|---|
| `create` | `TaxRate.create(rate, jurisdiction, type): TaxRate` | Primary constructor |
| `exempt` | `TaxRate.exempt(jurisdiction): TaxRate` | Creates a 0% exempt rate |
| `calculateTax` | `TaxRate.calculateTax(amount: Money): Money` | Computes tax amount |

---

### 3.4 PaymentTerms

| Aspect | Specification |
|---|---|
| **Purpose** | Encapsulates payment terms including net days, early payment discount, and discount percentage. |

#### Attributes

| Field | Type | Constraints | Description |
|---|---|---|---|
| `netDays` | `int` | > 0 | Days until full payment due |
| `discountDays` | `int?` | ≥ 0, ≤ `netDays` | Days to qualify for discount |
| `discountPercent` | `Decimal(5, 2)` | ≥ 0, ≤ 100 | Discount percentage |
| `description` | `string?` | — | Human-readable (e.g., "2/10 Net 30") |

#### Immutability

**Immutable.**

#### Validation Rules

- `netDays` > 0
- `discountDays` ≤ `netDays` when provided
- `discountPercent` ≥ 0 and ≤ 100

#### Factory Methods

| Method | Signature | Description |
|---|---|---|
| `create` | `PaymentTerms.create(netDays, discountDays?, discountPercent?): PaymentTerms` | Primary constructor |
| `net30` | `PaymentTerms.net30(): PaymentTerms` | Standard NET 30 |
| `net60` | `PaymentTerms.net60(): PaymentTerms` | Standard NET 60 |
| `isDiscountEligible` | `terms.isDiscountEligible(invoiceDate: Date, paymentDate: Date): boolean` | Checks if payment is within discount window |
| `calculateDueDate` | `terms.calculateDueDate(invoiceDate: Date): Date` | Computes due date |
| `calculateDiscountDeadline` | `terms.calculateDiscountDeadline(invoiceDate: Date): Date?` | Computes discount deadline |

---

### 3.5 VendorReference

| Aspect | Specification |
|---|---|
| **Purpose** | Lightweight reference to a vendor — ID + denormalized display fields. Used across aggregates without coupling to Vendor entity. |

#### Attributes

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `string` | NOT NULL | Vendor ID |
| `name` | `string` | NOT NULL | Display name |
| `code` | `string` | NOT NULL | Vendor code |
| `category` | `string` | NOT NULL | Vendor category |
| `currency` | `string` | NOT NULL | Default currency |

#### Immutability

**Immutable.** Snapshot at time of reference creation.

#### Validation Rules

- All fields must be non-empty
- `id` must be a valid UUID

#### Factory Methods

| Method | Signature | Description |
|---|---|---|
| `fromVendor` | `VendorReference.fromVendor(vendor: Vendor): VendorReference` | Creates from full vendor |
| `display` | `ref.display(): string` | `"VEN-00001 — Acme Corp"` |

---

### 3.6 InvoiceNumber

| Aspect | Specification |
|---|---|
| **Purpose** | Domain value object for invoice numbers — encapsulates vendor + number + uniqueness enforcement. |

#### Attributes

| Field | Type | Constraints | Description |
|---|---|---|---|
| `vendorId` | `string` | NOT NULL | Issuing vendor ID |
| `vendorCode` | `string` | NOT NULL | Vendor code (denormalized) |
| `number` | `string` | NOT NULL | Invoice number as provided by vendor |
| `normalizedNumber` | `string` | derived | Uppercase, trimmed, special chars removed |

#### Immutability

**Immutable.**

#### Validation Rules

- `number` must be non-empty, max 100 chars
- `normalizedNumber` used for duplicate detection (case-insensitive)

#### Factory Methods

| Method | Signature | Description |
|---|---|---|
| `create` | `InvoiceNumber.create(vendorId, vendorCode, number): InvoiceNumber` | Primary constructor |
| `normalize` | `InvoiceNumber.normalize(raw: string): string` | Strips whitespace, uppercases, removes special chars |
| `isDuplicateOf` | `n1.isDuplicateOf(n2: InvoiceNumber): boolean` | Normalized comparison |

---

### 3.7 InvoiceStatus

| Aspect | Specification |
|---|---|
| **Purpose** | Represents an invoice's current lifecycle state with history of transitions. |

#### Attributes

| Field | Type | Constraints | Description |
|---|---|---|---|
| `state` | `enum` | NOT NULL | Current status |
| `previousState` | `enum?` | — | Previous status |
| `changedAt` | `DateTime` | NOT NULL | Transition timestamp |
| `changedBy` | `string` | NOT NULL | Actor userId |
| `reason` | `string?` | — | Transition reason |

#### Immutability

**Immutable.** Each transition creates a new `InvoiceStatus` instance (historical record).

#### Validation Rules

- `state` must be valid status from state machine
- `previousState` must be a valid predecessor per transition rules

#### Factory Methods

| Method | Signature | Description |
|---|---|---|
| `initial` | `InvoiceStatus.initial(): InvoiceStatus` | Creates `DRAFT` initial status |
| `transition` | `InvoiceStatus.transition(current, newState, userId, reason?): InvoiceStatus` | Creates new status with validation |
| `canTransition` | `InvoiceStatus.canTransition(from, to): boolean` | Checks if transition is allowed |
| `isTerminal` | `status.isTerminal(): boolean` | `VOIDED` = terminal |

---

### 3.8 MatchStatus

| Aspect | Specification |
|---|---|
| **Purpose** | Result of a 3-way match with confidence scoring and timestamp. |

#### Attributes

| Field | Type | Constraints | Description |
|---|---|---|---|
| `result` | `enum` | NOT NULL | `FULL_MATCH`, `PARTIAL_MATCH`, `PRICE_VARIANCE`, `QTY_VARIANCE`, `NO_MATCH` |
| `confidence` | `Decimal(5, 2)` | 0.00–100.00 | Match confidence score |
| `matchedAt` | `DateTime` | NOT NULL | When match was performed |
| `matchedBy` | `string` | NOT NULL | `SYSTEM` or userId |
| `lineResults` | `MatchLineItem[]` | — | Per-line match results |

#### Immutability

**Immutable.** Match results are append-only.

#### Validation Rules

- `confidence` ≥ 0 and ≤ 100
- `FULL_MATCH` requires 100% confidence (all lines exact)
- `NO_MATCH` = 0% confidence

#### Factory Methods

| Method | Signature | Description |
|---|---|---|
| `fullMatch` | `MatchStatus.fullMatch(confidence): MatchStatus` | Creates full match |
| `noMatch` | `MatchStatus.noMatch(confidence): MatchStatus` | Creates no match |
| `variance` | `MatchStatus.variance(result, confidence): MatchStatus` | Creates variance match |
| `requiresApproval` | `status.requiresApproval(): boolean` | `confidence < threshold` |

---

### 3.9 ToleranceThreshold

| Aspect | Specification |
|---|---|
| **Purpose** | Configurable thresholds for price, quantity, and total variances. Supports per-vendor overrides. |

#### Attributes

| Field | Type | Constraints | Description |
|---|---|---|---|
| `priceThreshold` | `Decimal(5, 2)` | ≥ 0, ≤ 100 | Max price variance % for auto-approve |
| `quantityThreshold` | `Decimal(5, 2)` | ≥ 0, ≤ 100 | Max quantity variance % for auto-approve |
| `totalThreshold` | `Decimal(5, 2)` | ≥ 0, ≤ 100 | Max total variance % for auto-approve |
| `vendorOverrides` | `Map<string, Partial<ToleranceThreshold>>` | — | Per-vendor overrides |

#### Immutability

**Immutable.** Changes create new instances.

#### Validation Rules

- All thresholds ≥ 0 and ≤ 100
- Vendor overrides must specify at least one threshold

#### Factory Methods

| Method | Signature | Description |
|---|---|---|
| `default` | `ToleranceThreshold.default(): ToleranceThreshold` | 5% across all dimensions |
| `strict` | `ToleranceThreshold.strict(): ToleranceThreshold` | 1% across all dimensions |
| `withVendorOverride` | `t.withVendorOverride(vendorId, override): ToleranceThreshold` | Creates with vendor-specific threshold |
| `isWithinTolerance` | `t.isWithinTolerance(priceVar, qtyVar, totalVar): boolean` | Checks if variances are within tolerance |

---

### 3.10 DuplicateConfidence

| Aspect | Specification |
|---|---|
| **Purpose** | Duplicate invoice detection result with scoring methodology and supporting evidence. |

#### Attributes

| Field | Type | Constraints | Description |
|---|---|---|---|
| `score` | `Decimal(5, 2)` | 0.00–100.00 | Confidence that invoice is a duplicate |
| `method` | `enum` | NOT NULL | `EXACT_NUMBER`, `FUZZY_NUMBER`, `AMOUNT_MATCH`, `VENDOR_DATE_AMOUNT`, `ML_SCORE` |
| `evidence` | `string[]` | NOT NULL | List of evidence items |
| `suspectedDuplicateOf` | `string?` | FK → VendorInvoice | ID of suspected original |
| `evaluatedAt` | `DateTime` | NOT NULL | When detection ran |

#### Immutability

**Immutable.** Each detection run produces a new result.

#### Validation Rules

- `score` ≥ 0 and ≤ 100
- `evidence` must be non-empty
- `HIGH` confidence (>80) blocks automatic processing

#### Factory Methods

| Method | Signature | Description |
|---|---|---|
| `exactMatch` | `DuplicateConfidence.exactMatch(invoiceId, evidence): DuplicateConfidence` | 100% score |
| `highConfidence` | `DuplicateConfidence.highConfidence(score, method, evidence): DuplicateConfidence` | >80% |
| `lowConfidence` | `DuplicateConfidence.lowConfidence(score, method, evidence): DuplicateConfidence` | <50% |
| `requiresReview` | `d.requiresReview(): boolean` | `score > 50` |

---

### 3.11 ApprovalAuthority

| Aspect | Specification |
|---|---|
| **Purpose** | Defines who can approve what — role, amount threshold, and delegation rules. |

#### Attributes

| Field | Type | Constraints | Description |
|---|---|---|---|
| `role` | `string` | NOT NULL | Required role |
| `threshold` | `Decimal(38, 12)` | ≥ 0 | Max amount this authority covers |
| `canDelegate` | `boolean` | NOT NULL | Whether delegation is allowed |
| `delegatesTo` | `string[]` | — | User IDs this person can delegate to |
| `departmentScope` | `string?` | — | Optional department constraint |

#### Immutability

**Immutable.** Configuration — changes create new instances.

#### Validation Rules

- `role` must be non-empty
- `threshold` ≥ 0
- `delegatesTo` must contain valid user IDs

#### Factory Methods

| Method | Signature | Description |
|---|---|---|
| `create` | `ApprovalAuthority.create(role, threshold, canDelegate): ApprovalAuthority` | Primary constructor |
| `canApprove` | `auth.canApprove(amount, userRole): boolean` | Checks authority for given amount |
| `withDelegation` | `auth.withDelegation(delegatesTo): ApprovalAuthority` | Adds delegation targets |

---

### 3.12 Address

| Aspect | Specification |
|---|---|
| **Purpose** | Physical address value object — used for vendor billing, shipping, and remittance addresses. |

#### Attributes

| Field | Type | Constraints | Description |
|---|---|---|---|
| `line1` | `string` | NOT NULL | Street address line 1 |
| `line2` | `string?` | — | Street address line 2 |
| `city` | `string` | NOT NULL | City |
| `state` | `string?` | — | State/province |
| `postalCode` | `string` | NOT NULL | Postal/ZIP code |
| `country` | `string` | NOT NULL, ISO 3166-1 alpha-2 | Country code |

#### Immutability

**Immutable.**

#### Validation Rules

- `line1`, `city`, `postalCode`, `country` must be non-empty
- `country` must be valid ISO 3166-1 alpha-2

#### Factory Methods

| Method | Signature | Description |
|---|---|---|
| `create` | `Address.create(line1, city, postalCode, country, line2?, state?): Address` | Primary constructor |
| `format` | `addr.format(): string` | Full formatted address string |
| `sameCountry` | `a1.sameCountry(a2: Address): boolean` | Country match check |

---

### 3.13 BankAccount

| Aspect | Specification |
|---|---|
| **Purpose** | Bank account details for payments. Encapsulates routing and account numbers with type classification. |

#### Attributes

| Field | Type | Constraints | Description |
|---|---|---|---|
| `routingNumber` | `string` | NOT NULL, encrypted | Bank routing number |
| `accountNumber` | `string` | NOT NULL, encrypted | Account number |
| `accountHolderName` | `string` | NOT NULL | Name on account |
| `accountType` | `enum` | NOT NULL | `CHECKING`, `SAVINGS` |
| `bankName` | `string` | NOT NULL | Bank institution name |
| `bankCountry` | `string` | NOT NULL, ISO 3166-1 alpha-2 | Country of bank |

#### Immutability

**Immutable.** Changes require re-verification (creates new instance).

#### Validation Rules

- `routingNumber` must be valid format (9 digits for US)
- `accountNumber` must be non-empty, max 20 chars
- `accountHolderName` must be non-empty
- `bankCountry` must be valid ISO 3166-1 alpha-2

#### Factory Methods

| Method | Signature | Description |
|---|---|---|
| `create` | `BankAccount.create(routing, account, name, type, bank, country): BankAccount` | Primary constructor with validation |
| `masked` | `bank.masked(): string` | `"****1234"` |
| `isDomestic` | `bank.isDomestic(companyCountry: string): boolean` | Same-country check |

---

### 3.14 GLAccountReference

| Aspect | Specification |
|---|---|
| **Purpose** | Lightweight reference to a GL account — ID + code + name. Used across entities without coupling to Chart of Accounts. |

#### Attributes

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `string` | NOT NULL | GL account ID |
| `code` | `string` | NOT NULL | Account code (e.g., "2100") |
| `name` | `string` | NOT NULL | Account name |
| `type` | `enum` | NOT NULL | `ASSET`, `LIABILITY`, `EQUITY`, `REVENUE`, `EXPENSE` |
| `isActive` | `boolean` | NOT NULL | Account active flag |

#### Immutability

**Immutable.** Snapshot at time of reference creation.

#### Validation Rules

- All fields must be non-empty
- `code` must be valid account code format
- `isActive` must be `true` for new transactions

#### Factory Methods

| Method | Signature | Description |
|---|---|---|
| `fromAccount` | `GLAccountReference.fromAccount(account: GLAccount): GLAccountReference` | Creates from full account |
| `display` | `ref.display(): string` | `"2100 — Accounts Payable"` |

---

### 3.15 CostCenterReference

| Aspect | Specification |
|---|---|
| **Purpose** | Lightweight reference to a cost center for departmental allocation of expenses. |

#### Attributes

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `string` | NOT NULL | Cost center ID |
| `code` | `string` | NOT NULL | Cost center code |
| `name` | `string` | NOT NULL | Cost center name |
| `departmentId` | `string?` | — | Owning department |

#### Immutability

**Immutable.** Snapshot at reference creation.

#### Validation Rules

- `id`, `code`, `name` must be non-empty

#### Factory Methods

| Method | Signature | Description |
|---|---|---|
| `fromCostCenter` | `CostCenterReference.fromCostCenter(cc): CostCenterReference` | Creates from full cost center |
| `display` | `ref.display(): string` | `"CC-001 — Operations"` |

---

### 3.16 ApprovalDecision

| Aspect | Specification |
|---|---|
| **Purpose** | Captures a complete approval decision — the decision itself, the rationale, timestamp, and the authority under which it was made. |

#### Attributes

| Field | Type | Constraints | Description |
|---|---|---|---|
| `decision` | `enum` | NOT NULL | `APPROVE`, `REJECT`, `REQUEST_INFO`, `DELEGATE` |
| `reason` | `string` | NOT NULL | Decision rationale |
| `timestamp` | `DateTime` | NOT NULL | When decision was made |
| `authority` | `ApprovalAuthority` | NOT NULL | Authority under which decision was made |
| `userId` | `string` | NOT NULL | Decision maker |
| `delegatedFrom` | `string?` | — | Original approver (if delegated) |

#### Immutability

**Immutable.** Decisions are final once recorded.

#### Validation Rules

- `reason` must be non-empty
- `timestamp` must be ≤ now
- `authority` must be valid for the decision amount

#### Factory Methods

| Method | Signature | Description |
|---|---|---|
| `approve` | `ApprovalDecision.approve(userId, reason, authority): ApprovalDecision` | Creates approve decision |
| `reject` | `ApprovalDecision.reject(userId, reason, authority): ApprovalDecision` | Creates reject decision |
| `delegate` | `ApprovalDecision.delegate(userId, reason, authority, to): ApprovalDecision` | Creates delegate decision |
| `requestInfo` | `ApprovalDecision.requestInfo(userId, reason, authority): ApprovalDecision` | Creates info request |

---

### 3.17 PaymentMethod

| Aspect | Specification |
|---|---|
| **Purpose** | Encapsulates payment method type and associated details (account, limits, fees). |

#### Attributes

| Field | Type | Constraints | Description |
|---|---|---|---|
| `type` | `enum` | NOT NULL | `ACH`, `WIRE`, `CHECK`, `EFT`, `VIRTUAL_CARD` |
| `bankAccountId` | `string?` | — | Source bank account |
| `routingNumber` | `string?` | — | Bank routing (encrypted) |
| `accountNumber` | `string?` | — | Bank account (encrypted) |
| `estimatedFee` | `Decimal(38, 12)` | ≥ 0 | Estimated transaction fee |
| `processingDays` | `int` | ≥ 0 | Days to process |
| `minAmount` | `Decimal(38, 12)?` | ≥ 0 | Minimum payment amount |
| `maxAmount` | `Decimal(38, 12)?` | ≥ `minAmount` | Maximum payment amount |

#### Immutability

**Immutable.**

#### Validation Rules

- `type` must be valid enum value
- `estimatedFee` ≥ 0
- `processingDays` ≥ 0
- `maxAmount` ≥ `minAmount` when both provided

#### Factory Methods

| Method | Signature | Description |
|---|---|---|
| `ach` | `PaymentMethod.ach(bankAccountId, routing, account): PaymentMethod` | Standard ACH |
| `wire` | `PaymentMethod.wire(bankAccountId, routing, account): PaymentMethod` | Wire transfer |
| `check` | `PaymentMethod.check(): PaymentMethod` | Check payment |
| `eft` | `PaymentMethod.eft(bankAccountId, routing, account): PaymentMethod` | EFT |
| `virtualCard` | `PaymentMethod.virtualCard(): PaymentMethod` | Virtual card |
| `estimateFee` | `method.estimateFee(amount: Money): Money` | Estimates fee for given amount |

---

### 3.18 ExchangeRate

| Aspect | Specification |
|---|---|
| **Purpose** | Captures an exchange rate between two currencies with source attribution and effective date. |

#### Attributes

| Field | Type | Constraints | Description |
|---|---|---|---|
| `fromCurrency` | `string` | NOT NULL, ISO 4217 | Source currency |
| `toCurrency` | `string` | NOT NULL, ISO 4217 | Target currency |
| `rate` | `Decimal(20, 8)` | > 0 | Exchange rate |
| `source` | `enum` | NOT NULL | `ECB`, `BLOOMBERG`, `MANUAL`, `BANK_API`, `FIXED` |
| `effectiveDate` | `Date` | NOT NULL | Date rate is effective |
| `inverseRate` | `Decimal(20, 8)` | derived | `1 / rate` |

#### Immutability

**Immutable.** Historical rates are never modified.

#### Validation Rules

- `fromCurrency` ≠ `toCurrency`
- `rate` > 0
- `effectiveDate` must be valid date

#### Factory Methods

| Method | Signature | Description |
|---|---|---|
| `create` | `ExchangeRate.create(from, to, rate, source, date): ExchangeRate` | Primary constructor |
| `identity` | `ExchangeRate.identity(currency): ExchangeRate` | Same-currency (rate=1) |
| `convert` | `rate.convert(amount: Money): Money` | Converts amount |
| `inverse` | `rate.inverse(): ExchangeRate` | Swapped currencies |
| `isStale` | `rate.isStale(maxAgeDays: number): boolean` | Checks if rate is too old |

---

## 4. Part 3 — Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                           ACCOUNTS PAYABLE DOMAIN MODEL                              │
└──────────────────────────────────────────────────────────────────────────────────────┘

                                 ┌─────────────────┐
                                 │   Company (FK)   │
                                 └────────┬────────┘
                                          │ 1:N
                    ┌─────────────────────┼──────────────────────┐
                    │                     │                      │
              ┌─────▼──────┐      ┌──────▼───────┐     ┌───────▼────────┐
              │   Vendor    │      │VendorInvoice │     │ApprovalLevel   │
              │─────────────│      │──────────────│     │────────────────│
              │ id (PK)     │      │ id (PK)      │     │ id (PK)        │
              │ companyId   │◄─────│ vendorId(FK) │     │ companyId      │
              │ vendorCode  │      │ companyId    │     │ levelNumber    │
              │ name        │      │ invoiceNumber│     │ minAmount      │
              │ status      │      │ status       │     │ maxAmount      │
              │ currency    │      │ totalAmount  │     │ requiredRole   │
              │ creditLimit │      │ balanceDue   │     │ timeLimitHours │
              └──┬──┬──┬────┘      └──┬──┬──┬──┬──┘     └────────────────┘
                 │  │  │              │  │  │  │
    ┌────────────┘  │  │    ┌─────────┘  │  │  └──────────────┐
    │               │  │    │            │  │                 │
    ▼               ▼  │    ▼            ▼  ▼                 ▼
┌──────────┐ ┌────────┐│ ┌───────────┐ ┌──────────────┐ ┌─────────────┐
│VendorBank│ │Vendor  ││ │Invoice    │ │ThreeWayMatch │ │ApprovalRecord│
│  Detail  │ │Perform.││ │LineItem   │ │──────────────│ │─────────────│
│──────────│ │────────││ │───────────│ │ id (PK)      │ │ id (PK)     │
│ id (PK)  │ │ id(PK) ││ │ id (PK)   │ │ companyId    │ │ companyId   │
│ vendorId │ │vendorId││ │ vendorInv │ │ vendorInvId  │ │ vendorInvId │
│ bankName │ │ period ││ │ lineNumber│ │ poReferenceId│ │ approvalLvl │
│ routing# │ │overall ││ │ quantity  │ │ grnReference │ │ status      │
│ account# │ │ score  ││ │ unitPrice │ │ matchResult  │ │ decisionBy  │
└──────────┘ └────────┘│ │ taxAmount │ │ totalVariance│ │ decision    │
                        │ │ glAccount │ └───────┬──────┘ └─────────────┘
    ┌───────────────────┘ │ costCenter │         │ 1:N
    │                     └───────────┘         ▼
    ▼                                       ┌──────────────┐
┌───────────┐                               │MatchLineItem │
│VendorDocu-│                               │──────────────│
│   ment    │                               │ id (PK)      │
│───────────│                               │ threeWayMatch│
│ id (PK)   │                               │ invoiceLine  │
│ vendorId  │                               │ poRefLine    │
│ type      │                               │ matchStatus  │
│ expiryDate│                               │ priceVariance│
└───────────┘                               └──────────────┘

    ┌─────────────────────────────────────────────────────────┐
    │                PROCUREMENT REFERENCES                    │
    │           (AP stores reference snapshots only)           │
    └─────────────────────────────────────────────────────────┘

    ┌─────────────────────┐           ┌─────────────────────┐
    │PurchaseOrderReference│           │GoodsReceiptReference │
    │─────────────────────│           │─────────────────────│
    │ id (PK)             │           │ id (PK)             │
    │ companyId           │           │ companyId           │
    │ poNumber            │           │ grnNumber           │
    │ vendorId (FK)       │◄──────────│ poReferenceId (FK)  │
    │ status              │           │ vendorId (FK)       │
    │ totalAmount         │           │ receiptDate         │
    │ receivedAmount      │           │ totalValue          │
    └────────┬────────────┘           └────────┬────────────┘
             │ 1:N                             │ 1:N
             ▼                                 ▼
    ┌─────────────────────┐           ┌─────────────────────┐
    │POReferenceLineItem  │           │GRNReferenceLineItem  │
    │─────────────────────│           │─────────────────────│
    │ poReferenceId (FK)  │           │ grnReferenceId (FK) │
    │ lineNumber          │           │ poRefLineItemId (FK)│
    │ quantity            │           │ quantityReceived    │
    │ unitPrice           │           │ quantityAccepted    │
    │ receivedQuantity    │           │ unitPrice           │
    │ invoicedQuantity    │           └─────────────────────┘
    └─────────────────────┘

    ┌─────────────────────────────────────────────────────────┐
    │                   PAYMENT FLOW                          │
    └─────────────────────────────────────────────────────────┘

    ┌───────────────────┐       ┌──────────────────────┐
    │ PaymentProposal   │       │ PaymentProposalItem   │
    │───────────────────│ 1:N   │──────────────────────│
    │ id (PK)           │◄──────│ paymentProposalId(FK)│
    │ proposalNumber    │       │ vendorInvoiceId (FK) │
    │ status            │       │ amount               │
    │ totalAmount       │       │ discountTaken        │
    │ paymentDate       │       │ netPayment           │
    │ paymentMethod     │       └──────────────────────┘
    └────────┬──────────┘
             │ 1:1
             ▼
    ┌───────────────────┐       ┌──────────────────────┐
    │  PaymentBatch     │       │   PaymentRecord       │
    │───────────────────│ 1:N   │──────────────────────│
    │ id (PK)           │◄──────│ paymentBatchId (FK)  │
    │ batchNumber       │       │ vendorInvoiceId (FK) │
    │ status            │       │ vendorId (FK)        │
    │ totalAmount       │       │ amount               │
    │ totalFees         │       │ netPayment           │
    │ fileUrl           │       │ status               │
    └───────────────────┘       └──────────────────────┘

    ┌─────────────────────────────────────────────────────────┐
    │               VENDOR RECONCILIATION                      │
    └─────────────────────────────────────────────────────────┘

    ┌───────────────────┐       ┌──────────────────────┐
    │  VendorStatement  │ 1:N   │VendorStatementLine   │
    │───────────────────│◄──────│──────────────────────│
    │ id (PK)           │       │ vendorStatementId(FK)│
    │ vendorId (FK)     │       │ transactionDate      │
    │ closingBalance    │       │ debitAmount          │
    │ status            │       │ creditAmount         │
    └────────┬──────────┘       │ matchStatus          │
             │ 1:1              └──────────────────────┘
             ▼
    ┌───────────────────┐       ┌──────────────────────┐
    │ReconciliationResult│       │   InvoiceException   │
    │───────────────────│       │──────────────────────│
    │ id (PK)           │       │ id (PK)              │
    │ vendorStatementId │       │ vendorInvoiceId (FK) │
    │ apBalance         │       │ exceptionType        │
    │ vendorBalance     │       │ severity             │
    │ balanceVariance   │       │ status               │
    │ matchRate         │       │ varianceAmount       │
    └───────────────────┘       └──────────────────────┘

    ┌─────────────────────────────────────────────────────────┐
    │                    AUDIT (APPEND-ONLY)                    │
    └─────────────────────────────────────────────────────────┘

    ┌───────────────────┐
    │  APAuditRecord    │
    │───────────────────│
    │ id (PK)           │
    │ companyId         │
    │ entityType        │   ← ANY entity above
    │ entityId          │
    │ action            │
    │ oldValue/newValue │
    │ amount            │
    │ userId            │
    │ correlationId     │
    └───────────────────┘
```

### Cardinality Summary

| Relationship | Cardinality | Description |
|---|---|---|
| Company → Vendor | 1:N | One company has many vendors |
| Vendor → VendorBankDetail | 1:N | One vendor has multiple bank accounts |
| Vendor → VendorPerformance | 1:N | One vendor has periodic performance records |
| Vendor → VendorDocument | 1:N | One vendor has multiple compliance docs |
| Vendor → VendorCredit | 1:N | One vendor issues multiple credits |
| Vendor → VendorInvoice | 1:N | One vendor sends many invoices |
| Vendor → PurchaseOrderReference | 1:N | One vendor has many POs |
| Vendor → GoodsReceiptReference | 1:N | One vendor has many GRNs |
| PurchaseOrderReference → POReferenceLineItem | 1:N | PO has many lines |
| PurchaseOrderReference → GoodsReceiptReference | 1:N | PO has many receipts |
| GoodsReceiptReference → GRNReferenceLineItem | 1:N | GRN has many lines |
| POReferenceLineItem → GRNReferenceLineItem | 1:N | PO line matched to receipt lines |
| VendorInvoice → InvoiceLineItem | 1:N | Invoice has many lines |
| VendorInvoice → InvoiceAttachment | 1:N | Invoice has many attachments |
| VendorInvoice → ThreeWayMatch | 1:1 | One match per invoice |
| ThreeWayMatch → MatchLineItem | 1:N | Match has many line results |
| VendorInvoice → InvoiceException | 1:N | Invoice can have multiple exceptions |
| VendorInvoice → ApprovalRecord | 1:N | Invoice goes through approval chain |
| VendorInvoice → PaymentProposalItem | 1:N | Invoice appears in proposals |
| VendorInvoice → PaymentRecord | 1:N | Invoice can be partially paid |
| ApprovalLevel → ApprovalRecord | 1:N | Level used by many approvals |
| PaymentProposal → PaymentProposalItem | 1:N | Proposal has many items |
| PaymentProposal → PaymentBatch | 1:1 | One batch per proposal |
| PaymentBatch → PaymentRecord | 1:N | Batch has many payments |
| VendorStatement → VendorStatementLine | 1:N | Statement has many lines |
| VendorStatement → ReconciliationResult | 1:1 | One result per statement |

---

## 5. Part 4 — Data Flow

### 5.1 Invoice Lifecycle — End-to-End

```
                    ┌─────────────┐
                    │  INCOMING   │
                    │  INVOICE    │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐     ┌──────────────────┐
                    │  CAPTURE    │────►│  OCR EXTRACTION   │
                    │  (Source:   │     │  (if scan/email)  │
                    │  email/scan)│     └──────────────────┘
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  VALIDATE   │──── Checks: vendor exists,
                    │             │      terms valid, amounts
                    │             │      non-negative, required
                    │             │      fields present
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐     ┌──────────────────┐
                    │  DUPLICATE  │────►│  IF DUPLICATE     │
                    │  CHECK      │     │  → BLOCK + ALERT  │
                    └──────┬──────┘     └──────────────────┘
                           │ (not duplicate)
                           ▼
              ┌────────────┴────────────┐
              │                         │
         Has PO Reference?        No PO Reference?
              │                         │
              ▼                         ▼
     ┌────────────────┐        ┌────────────────┐
     │  3-WAY MATCH   │        │  EXCEPTION     │
     │  PO + GRN +    │        │  MANUAL        │
     │  Invoice       │        │  RESOLUTION    │
     └───────┬────────┘        └───────┬────────┘
             │                         │
    ┌────────┴────────┐                │
    │                 │                │
 Matched        Variance              │
    │                 │                │
    ▼                 ▼                │
┌────────┐    ┌────────────┐          │
│AUTO-   │    │  APPROVAL  │◄─────────┘
│APPROVE │    │  ROUTING   │
│(≤5%)   │    └─────┬──────┘
└────┬───┘          │
     │              ▼
     │       ┌────────────┐
     │       │  APPROVED  │
     │       └─────┬──────┘
     │             │
     ▼             ▼
┌────────────────────────┐
│     READY TO PAY       │
│  (GL accrual posted)   │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  PAYMENT PROPOSAL      │
│  (AP Clerk selects     │
│   invoices for payment)│
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  PAYMENT BATCH         │
│  (Bank file generated) │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  PAYMENT RECORD        │
│  (Immutable record)    │
│  GL posting:           │
│  DR Accounts Payable   │
│  CR Bank Account       │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  RECONCILIATION        │
│  (Vendor statement     │
│   vs AP records)       │
└────────────────────────┘
```

### 5.2 3-Way Match Detail

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ POReference       │    │ GRNReference      │    │ VendorInvoice    │
│                   │    │                   │    │                  │
│ PO Line Items:    │    │ GRN Line Items:   │    │ Invoice Lines:   │
│  - qty: 100      │    │  - qty received:95│    │  - qty: 100      │
│  - price: $10.00 │    │  - qty accepted:95│    │  - price: $10.00 │
│                   │    │  - condition: GOOD│    │                  │
└────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │    MATCH ENGINE         │
                    │                         │
                    │  Line-by-line comparison:│
                    │  ✓ Qty: 95 received =   │
                    │    95 invoiced (MATCH)   │
                    │  ✓ Price: $10 = $10     │
                    │    (MATCH)               │
                    │                         │
                    │  Result: FULL_MATCH      │
                    │  Confidence: 100%        │
                    └────────────────────────┘
```

### 5.3 Payment Flow

```
┌────────────┐     ┌──────────────┐     ┌───────────────┐
│ APPROVED   │────►│   PAYMENT    │────►│   PAYMENT     │
│ INVOICES   │     │   PROPOSAL   │     │   BATCH       │
│            │     │              │     │               │
│ 5 invoices │     │ AP Clerk     │     │ Bank file     │
│ $50K total │     │ selects &    │     │ generated     │
│            │     │ prioritizes  │     │               │
└────────────┘     └──────────────┘     └───────┬───────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────┐
│                   PAYMENT RECORDS (N)                    │
│                                                         │
│  INV-001  →  $10,000  →  ACH  →  REF-ACH-001          │
│  INV-002  →  $15,000  →  ACH  →  REF-ACH-002          │
│  INV-003  →  $8,000   →  WIRE →  REF-WIRE-001         │
│  INV-004  →  $12,000  →  ACH  →  REF-ACH-003          │
│  INV-005  →  $5,000   →  CHECK → CHECK-12345          │
│                                                         │
│  Total: $50,000 + $250 fees = $50,250 disbursement     │
└─────────────────────────────────────────────────────────┘
```

### 5.4 Audit Trail Flow

```
┌──────────────────────────────────────────────────────────┐
│                   AUDIT RECORD GENERATION                  │
│                                                          │
│  Every state transition:                                 │
│                                                          │
│  1. Service receives request                             │
│  2. Validate business rules                              │
│  3. Write APAuditRecord (BEFORE commit)                  │
│  4. Update entity state                                  │
│  5. Commit transaction                                   │
│  6. Return result                                        │
│                                                          │
│  Audit record contains:                                  │
│  - entityType: "VendorInvoice"                           │
│  - entityId: "inv_abc123"                                │
│  - action: "STATUS_CHANGED"                              │
│  - oldValue: "MATCHED"                                   │
│  - newValue: "APPROVED"                                  │
│  - amount: "15000.00"                                    │
│  - userId: "user_456"                                    │
│  - userRole: "AP_MANAGER"                                │
│  - correlationId: "req_xyz789"                           │
│  - ipAddress: "10.0.1.42"                                │
│                                                          │
│  APPEND-ONLY: No UPDATE, No DELETE ever.                 │
│  RETENTION: 7 years minimum.                             │
└──────────────────────────────────────────────────────────┘
```

### 5.5 Cross-Aggregate Coordination (Saga Pattern)

```
┌──────────────────────────────────────────────────────────────────┐
│                    SAGA: Invoice-to-Payment                       │
│                                                                  │
│  Step 1: Invoice Capture                                          │
│    → Write VendorInvoice (DRAFT)                                  │
│    → Write APAuditRecord                                          │
│                                                                  │
│  Step 2: Validation & Match                                       │
│    → Read POReference (from Procurement sync)                     │
│    → Read GRNReference (from Warehouse sync)                      │
│    → Write ThreeWayMatch + MatchLineItems                         │
│    → Update VendorInvoice status                                   │
│    → Write APAuditRecord                                          │
│                                                                  │
│  Step 3: Exception Handling (if needed)                           │
│    → Write InvoiceException                                       │
│    → Route to approver                                            │
│    → Write APAuditRecord                                          │
│                                                                  │
│  Step 4: Approval                                                 │
│    → Write ApprovalRecord per level                               │
│    → Update VendorInvoice status                                   │
│    → Write APAuditRecord                                          │
│                                                                  │
│  Step 5: GL Accrual                                               │
│    → DR Expense/Accrual                                           │
│    → CR Accounts Payable                                          │
│    → Write APAuditRecord                                          │
│                                                                  │
│  Step 6: Payment Proposal                                         │
│    → Write PaymentProposal + PaymentProposalItems                 │
│    → Write APAuditRecord                                          │
│                                                                  │
│  Step 7: Payment Execution                                        │
│    → Write PaymentBatch                                           │
│    → Write PaymentRecords (per invoice)                           │
│    → Update VendorInvoice (amountPaid, status)                    │
│    → Write APAuditRecord                                          │
│                                                                  │
│  Step 8: GL Settlement                                            │
│    → DR Accounts Payable                                          │
│    → CR Bank Account                                              │
│    → Write APAuditRecord                                          │
│                                                                  │
│  Step 9: Reconciliation (periodic)                                │
│    → Read VendorStatement                                         │
│    → Write ReconciliationResult                                   │
│    → Write APAuditRecord                                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## Appendix A: Decimal Field Inventory

Every monetary field in this domain model uses `Decimal(38, 12)` unless otherwise noted.

| Field Pattern | Decimal Type | Purpose |
|---|---|---|
| Amounts (total, subtotal, balance, etc.) | `Decimal(38, 12)` | Monetary values |
| Quantities | `Decimal(20, 4)` | Non-monetary quantities |
| Tax rates | `Decimal(5, 4)` | 0.0000–1.0000 decimal rate |
| Percentage scores | `Decimal(5, 2)` | 0.00–100.00 percentage |
| Exchange rates | `Decimal(20, 8)` | High-precision FX rates |
| Confidence scores | `Decimal(5, 2)` | 0.00–100.00 |

## Appendix B: Company-Scoped Unique Constraints

| Entity | Unique Constraint | Description |
|---|---|---|
| Vendor | `(companyId, vendorCode)` | Vendor code per company |
| Vendor | `(companyId, taxId)` | Tax ID per company |
| VendorCredit | `(companyId, vendorId, creditNumber)` | Credit number per vendor |
| PurchaseOrderReference | `(companyId, poNumber)` | PO number per company |
| GoodsReceiptReference | `(companyId, grnNumber)` | GRN number per company |
| VendorInvoice | `(companyId, vendorId, invoiceNumber)` | Invoice number per vendor |
| InvoiceLineItem | `(companyId, vendorInvoiceId, lineNumber)` | Line number per invoice |
| PaymentProposal | `(companyId, proposalNumber)` | Proposal number per company |
| PaymentBatch | `(companyId, batchNumber)` | Batch number per company |
| PaymentRecord | `(companyId, paymentNumber)` | Payment number per company |
| VendorStatement | `(companyId, vendorId, statementDate)` | Statement per vendor per date |
| ReconciliationResult | `(companyId, vendorStatementId)` | One result per statement |
| ApprovalLevel | `(companyId, levelNumber)` | Level number per company |
| ThreeWayMatch | `(companyId, vendorInvoiceId)` | One match per invoice |

## Appendix C: Immutable vs Mutable Entities

| Entity | Mutable After Creation | Reason |
|---|---|---|
| VendorPerformance | **No** | Historical snapshot |
| VendorDocument | Yes (limited) | Status updates, expiry checks |
| VendorInvoice | **Yes** (status-gated) | Lifecycle transitions |
| InvoiceLineItem | **Yes** (before validation) | Quantity/price corrections |
| InvoiceAttachment | **No** | Supporting documents |
| ThreeWayMatch | **No** | Match results immutable |
| MatchLineItem | **No** | Match results immutable |
| InvoiceException | **Yes** (resolution flow) | Exception handling |
| ApprovalRecord | **Yes** (decision flow) | Approval chain progression |
| ApprovalLevel | **Yes** | Configuration changes |
| PaymentRecord | **Limited** | Only `status` and `glPosted` |
| PaymentBatch | **Limited** | Only `status` and file URL |
| VendorStatement | **Yes** (before reconciliation) | Statement processing |
| VendorStatementLine | **Yes** (match status) | Reconciliation matching |
| ReconciliationResult | **Limited** | Only adjustment fields |
| APAuditRecord | **No** | Append-only audit trail |

## Appendix D: Financial Precision Standards

All monetary calculations must use helpers from `src/lib/financial-precision.ts`:

| Operation | Helper | Rounding |
|---|---|---|
| Summing amounts | `sumDecimals(values)` | No intermediate rounding |
| Multiplying (qty × price) | `multiplyDecimals(a, b)` | Banker's rounding to 12 places |
| Division | `divideDecimals(a, b, scale)` | Configurable scale |
| Tax calculation | `calculateTax(amount, rate)` | `financialRound(amount × rate, 12)` |
| Allocation | `allocateAmount(total, weights)` | Largest remainder method |
| Comparison | `decimalEquals(a, b, tolerance)` | Epsilon comparison |
| Display formatting | `formatDecimalCurrency(amount, currency)` | Locale-aware |
