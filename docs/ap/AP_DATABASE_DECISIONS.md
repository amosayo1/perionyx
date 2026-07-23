# Phase 21A.1 — AP Database Design Decisions

> **Status**: Complete
> **Type**: Documentation — database schema design decisions for AP persistence
> **Date**: July 21, 2026
> **Scope**: 25 Prisma models, 25 enums, 18 embedded value objects, index strategy, precision policy
> **Predecessor**: AP_DOMAIN_MODEL.md, AP_AGGREGATES.md, EDP_21A_0.md
> **Successor**: Phase 21A.2 — AP Repository Layer

---

## Table of Contents

1. [Schema Snapshot](#1-schema-snapshot)
2. [Design Decisions](#2-design-decisions)
   - [D-1: Procurement Prefix for All AP Models](#d-1-procurement-prefix-for-all-ap-models)
   - [D-2: No Soft Deletes](#d-2-no-soft-deletes)
   - [D-3: Value Objects as Embedded Fields](#d-3-value-objects-as-embedded-fields)
   - [D-4: Optimistic Concurrency on Aggregate Roots Only](#d-4-optimistic-concurrency-on-aggregate-roots-only)
   - [D-5: Append-Only Audit Trail](#d-5-append-only-audit-trail)
   - [D-6: Reference Entities for PO and GRN](#d-6-reference-entities-for-po-and-grn)
   - [D-7: Decimal(38,12) for All Monetary Values](#d-7-decimal3812-for-all-monetary-values)
   - [D-8: No Separate ToleranceThreshold Table](#d-8-no-separate-tolerancethreshold-table)
   - [D-9: No Separate ApprovalChain Table](#d-9-no-separate-approvalchain-table)
   - [D-10: Enum as Prisma Enums, Not Strings](#d-10-enum-as-prisma-enums-not-strings)
   - [D-11: PaymentRecord Immutability](#d-11-paymentrecord-immutability)
   - [D-12: VendorInvoice as Central Aggregate](#d-12-vendorinvoice-as-central-aggregate)
   - [D-13: Composite Index Strategy for Multi-Tenant Queries](#d-13-composite-index-strategy-for-multi-tenant-queries)
   - [D-14: Derived Fields Stored, Not Computed at Read](#d-14-derived-fields-stored-not-computed-at-read)
   - [D-15: JSON Columns for Semi-Structured Data](#d-15-json-columns-for-semi-structured-data)
3. [Enum Inventory](#3-enum-inventory)
4. [Model-to-Entity Mapping](#4-model-to-entity-mapping)
5. [Decimal Precision Matrix](#5-decimal-precision-matrix)
6. [Index Strategy](#6-index-strategy)
7. [Migration Safety](#7-migration-safety)
8. [Schema Size Impact](#8-schema-size-impact)

---

## 1. Schema Snapshot

The existing Prisma schema contains **349 models** across 15+ domains (Auth, Tenancy, Transactions, Ledger, Treasury, GL, CRM, Agent Framework, etc.). The AP domain adds **25 new models** and **25 new enums**, bringing the total to **374 models**.

| Metric | Before AP | After AP | Delta |
|---|---|---|---|
| Prisma models | 349 | 374 | +25 |
| Enum types | 43 | 68 | +25 |
| Monetary Decimal fields | ~120 | ~230 | +110 |
| Company-scoped unique constraints | ~45 | ~59 | +14 |
| Estimated migration SQL | — | ~2,800 lines | — |

---

## 2. Design Decisions

---

### D-1: Procurement Prefix for All AP Models

**Decision**: All AP Prisma models use the `Procurement` prefix (e.g., `ProcurementVendor`, `ProcurementVendorInvoice`).

**Context**: The existing schema has 349 models spanning 15+ domains. Names like `Vendor`, `Invoice`, `Payment` are generic enough to collide with future modules or existing models in other domains (e.g., `AccountingInvoice` already exists at line 213 of the schema).

**Alternatives**:

| Option | Prefix | Pros | Cons |
|---|---|---|---|
| A | None (`Vendor`, `Invoice`) | Simple, short names | Collides with existing `AccountingInvoice`; future modules may need `Vendor` for HR or CRM |
| B | `AP` (`APVendor`, `APInvoice`) | Short, unambiguous | Less descriptive; `AP` as prefix is cryptic when reading raw SQL |
| C | `Procurement` (`ProcurementVendor`, `ProcurementInvoice`) | Matches `src/server/procurement/` namespace; descriptive; unlikely to collide | Longer names |
| D | Separate schema file | Module isolation | Prisma does not support schema-per-module |

**Rationale**: Option C is chosen. The existing procurement module (`src/server/procurement/`) already uses this namespace. The prefix is descriptive without being verbose. `ProcurementVendor` clearly communicates "vendor in the procurement/AP context" without ambiguity. The 25 models add ~500 characters total to query lengths — negligible.

**Trade-offs**:
- Pro: Zero naming collisions as the platform grows to 500+ models
- Pro: Natural grouping in Prisma Client — `prisma.procurementVendor.findMany()` is self-documenting
- Con: Slightly longer model names in Prisma Client output
- Con: Migration rename if the module is restructured (low probability — bounded context is stable)

**Evidence**: The existing schema already uses prefixed naming for domain isolation: `TreasuryCashPosition`, `GLAccount`, `RiskAlert`, `ReconciliationCase`. The `AccountingInvoice` model at schema line 213 demonstrates that unprefixed names in financial domains lead to confusion. No `Procurement*` models exist in the current schema — zero collision risk.

---

### D-2: No Soft Deletes

**Decision**: AP uses hard deletes with audit trail, not soft deletes (`deletedAt` pattern).

**Context**: The existing schema has no soft delete pattern across 349 models. No model has a `deletedAt` field. The AP audit record captures the full historical trail.

**Alternatives**:

| Option | Pattern | Pros | Cons |
|---|---|---|---|
| A | Soft deletes (`deletedAt DateTime?`) | Data preserved; reversible; query via `WHERE deletedAt IS NULL` | Every query needs null filter; bloats indexes; ambiguous "is this real?" state; violates append-only audit |
| B | Hard deletes + audit trail | Simpler queries; audit preserves history; matches existing patterns | Data physically removed; recovery requires restore from backup |
| C | Soft deletes on aggregate roots only | Preserves critical data | Inconsistent; child entities deleted without parent marker |

**Rationale**: Option B matches the existing 349-model pattern. `ProcurementAPAuditRecord` captures every deletion with full context (who, when, why, what data). The audit record is the historical trail — not the deleted row itself. Queries never need `WHERE deletedAt IS NULL`. Regulatory retention (7 years) is handled by audit records and backup policy, not by keeping deleted rows indefinitely.

**Trade-offs**:
- Pro: Zero `deletedAt IS NULL` filters across 25 models and all repository queries
- Pro: Indexes stay lean — no deleted rows consuming B-tree space
- Pro: Matches existing schema convention (349/349 models use hard deletes)
- Con: Recovery requires backup restore, not `SET deletedAt = NULL`
- Con: Audit record must capture full entity snapshot before deletion for forensics

**Evidence**: The existing schema at 349 models has zero `deletedAt` fields. The `AuditLog` model (line 1985+) provides tamper-evident history. Phase 16.0 security audit confirmed that append-only audit is the primary forensic mechanism — soft deletes are not relied upon for compliance.

---

### D-3: Value Objects as Embedded Fields

**Decision**: All 18 value objects from AP_DOMAIN_MODEL.md Part 2 are stored as embedded fields on their parent entity, not as separate tables.

**Context**: Value objects (Money, Currency, TaxRate, PaymentTerms, etc.) have no independent identity. They exist only as attributes of their parent entity.

**Alternatives**:

| Option | Pattern | Pros | Cons |
|---|---|---|---|
| A | Separate tables per value object | Fully normalized; reusable | Over-normalized; 18 extra tables; JOINs for every query; Prisma has no native value object support |
| B | Embedded fields on parent | Simple queries; no JOINs; matches DDD value object semantics | Denormalized; value object fields spread across parent table |
| C | JSON columns | Flexible; one column per value object | Loses query ability; no DB-level type validation; no index support |

**Rationale**: Option B is correct DDD practice. Value objects have no identity — they are defined by their attributes. Money becomes `Decimal(38,12)` amount + `String` currency. TaxRate becomes `Decimal(5,4)` rate + `String` jurisdiction + `String` type. This preserves query ability (can filter by `taxRate > 0.05`) while avoiding unnecessary JOINs.

**Value Object → Field Mapping**:

| Value Object | Embedded Fields | Parent Entity |
|---|---|---|
| Money | `amount: Decimal(38,12)`, `currency: String` | VendorInvoice, VendorCredit, PaymentRecord, etc. |
| Currency | `currency: String` (code only; symbol/name handled at application layer) | VendorInvoice, VendorCredit |
| TaxRate | `taxRate: Decimal(5,4)`, `taxJurisdiction: String?`, `taxType: ProcurementTaxType?` | InvoiceLineItem, POReferenceLineItem |
| PaymentTerms | `paymentTerms: String` (code only; netDays/discountDays/discountPercent from config) | Vendor, VendorInvoice |
| VendorReference | `vendorId: String` (FK; name/code stored on Vendor entity) | VendorInvoice, PaymentProposalItem, PaymentRecord |
| InvoiceNumber | `invoiceNumber: String` (on VendorInvoice; vendorCode from Vendor FK) | VendorInvoice |
| InvoiceStatus | `status: ProcurementInvoiceStatus`, `previousStatus: ProcurementInvoiceStatus?`, `statusChangedAt: DateTime?` | VendorInvoice |
| MatchStatus | `matchResult: ProcurementMatchResult?`, `varianceAmount: Decimal(38,12)` | VendorInvoice, ThreeWayMatch |
| ToleranceThreshold | `varianceThreshold: Decimal(5,2)` (single threshold; see D-8) | VendorInvoice, ThreeWayMatch |
| DuplicateConfidence | `isDuplicateSuspicion: Boolean`, `duplicateConfidence: Decimal(5,2)`, `duplicateOfInvoiceId: String?` | VendorInvoice |
| ApprovalAuthority | `requiredThreshold: Decimal(38,12)` (on ApprovalRecord) | ProcurementApprovalRecord |
| Address | `billingAddress: String?`, `shippingAddress: String?` (text; structured Address fields future) | Vendor |
| BankAccount | `bankAccountId: String?` (FK to Banking context) | Vendor |
| GLAccountReference | `glAccountId: String?`, `glAccountCode: String?` (denormalized) | InvoiceLineItem, POReferenceLineItem |
| CostCenterReference | `costCenterId: String?` (FK) | InvoiceLineItem, POReferenceLineItem |
| ApprovalDecision | `decision: ProcurementApprovalDecision?`, `decisionAt: DateTime?`, `decisionBy: String?`, `decisionComment: String?` | ProcurementApprovalRecord |
| PaymentMethod | `paymentMethod: ProcurementPaymentMethod?` (enum; detailed fields on Vendor) | Vendor, VendorInvoice |
| ExchangeRate | `exchangeRate: Decimal(20,8)`, `baseCurrency: String` | VendorInvoice, PaymentRecord |

**Trade-offs**:
- Pro: Single-table queries for all invoice display (no JOINs)
- Pro: Correct DDD semantics — value objects are defined by equality of attributes
- Pro: Prisma can generate types for each field automatically
- Con: Wide tables (VendorInvoice has 60+ fields) — acceptable for PostgreSQL
- Con: Structured Address value object degraded to text fields — acceptable for Phase 21A.1; structured address can be added later

**Evidence**: The existing schema uses embedded fields for value objects throughout: `Wallet` embeds `currency` as a string, not a FK to a Currency table. `Transaction` embeds `type` and `status` as enums, not FKs to status tables. `GLJournalEntry` embeds `debit`/`credit` as Decimal fields. No model in the schema references a separate "Currency" or "Address" table.

---

### D-4: Optimistic Concurrency on Aggregate Roots Only

**Decision**: Only aggregate root entities get the `version Int @default(0)` field for optimistic concurrency.

**Context**: Child entities are protected by their parent's transaction boundary. A single aggregate per transaction means the root's version is sufficient.

**Aggregate Roots Receiving `version`**:

| Model | Root? | `version`? | Rationale |
|---|---|---|---|
| `ProcurementVendor` | Yes | Yes | Concurrent vendor edits (bank details + status) |
| `ProcurementVendorInvoice` | Yes | Yes | Concurrent status transitions + field updates |
| `ProcurementThreeWayMatch` | Yes | Yes | Concurrent override + re-match |
| `ProcurementInvoiceException` | Yes | Yes | Concurrent assignment + resolution |
| `ProcurementApprovalRecord` | Yes (per-invoice chain) | Yes | Concurrent level decisions |
| `ProcurementApprovalLevel` | Yes | Yes | Configuration changes during active approvals |
| `ProcurementPaymentProposal` | Yes | Yes | Concurrent item additions + approval |
| `ProcurementPaymentBatch` | Yes | Yes | Concurrent status updates during bank submission |
| `ProcurementPaymentRecord` | Yes | Yes | Concurrent void + GL posting |
| `ProcurementVendorStatement` | Yes | Yes | Concurrent parsing + reconciliation |
| `ProcurementReconciliationResult` | Yes | Yes | Concurrent adjustment + resolution |
| `ProcurementAPAuditRecord` | No (append-only) | No | Never updated — concurrency N/A |

**Alternatives**:

| Option | Pattern | Pros | Cons |
|---|---|---|---|
| A | `version` on all 25 entities | Maximum safety | Overkill; adds complexity; child entities cannot be modified independently |
| B | `version` on aggregate roots only (12 models) | Correct DDD pattern; sufficient safety | Child entities rely on parent's transaction boundary |
| C | Pessimistic locking (`SELECT FOR UPDATE`) | Strongest guarantee | Blocking; reduces throughput; deadlocks; overkill for AP volume |

**Rationale**: Option B follows DDD aggregate consistency rules. A single aggregate per transaction means the root's version is sufficient. If two users edit the same invoice, the second write detects `version` mismatch and throws a conflict error. Child entities (InvoiceLineItem, MatchLineItem) cannot be modified independently — they are always modified through the root's transaction. Pessimistic locking is avoided because it reduces throughput in high-concurrency payment scenarios and introduces deadlock risk.

**Trade-offs**:
- Pro: Clean DDD pattern — concurrency at the boundary, not inside the aggregate
- Pro: Matches existing `Wallet.version` pattern (schema line 627)
- Pro: 12 version checks instead of 25 — simpler service layer
- Con: Two users editing different child entities of the same root will conflict (acceptable — rare, and correctness matters)

**Evidence**: The existing `Wallet` model (schema line 619) uses `version Int @default(0)` on the aggregate root only — the same pattern. No child entity in the schema has a `version` field. The existing `ApprovalMatrixRule` model has `version` for optimistic concurrency on the aggregate root.

---

### D-5: Append-Only Audit Trail

**Decision**: `ProcurementAPAuditRecord` is append-only — no UPDATE, no DELETE operations.

**Context**: SOX compliance and financial audit requirements mandate immutable audit records. The audit table is the forensic backbone of the AP domain.

**Alternatives**:

| Option | Pattern | Pros | Cons |
|---|---|---|---|
| A | Mutable audit records | Can correct errors | Fails compliance; tamper-evident audit chain broken |
| B | Append-only audit (no updatedAt, no UPDATE/DELETE) | Immutable; compliant; fast writes (no conflict detection) | Higher storage cost; cannot correct erroneous entries |
| C | Event sourcing with audit projection | Complete history; temporal queries | Complex; premature; violates Governance Constitution state-based persistence |

**Rationale**: Option B is the minimum for SOX compliance. The audit table has no `updatedAt` field — only `createdAt`. Service layer enforces no-update/no-delete. The existing `AuditLog` model follows the same pattern (schema line 1985+). Erroneous audit entries are corrected by writing a correction audit entry — the correction itself is audited.

**Schema Design**:

```prisma
model ProcurementAPAuditRecord {
  id            String    @id @default(cuid())
  companyId     String
  entityType    String                       // e.g., "VendorInvoice", "PaymentRecord"
  entityId      String                       // ID of affected entity
  action        ProcurementAuditAction       // CREATED, UPDATED, STATUS_CHANGED, etc.
  field         String?                      // Changed field (for UPDATE actions)
  oldValue      String? @db.Text             // Previous value (JSON stringified)
  newValue      String? @db.Text             // New value (JSON stringified)
  amount        Decimal?  @db.Decimal(38,12) // Financial amount (if applicable)
  description   String    @db.Text           // Human-readable description
  reason        String?  @db.Text            // Business reason
  userId        String                       // Actor userId
  userRole      String                       // Actor role at time of action
  ipAddress     String?                      // Request IP address
  userAgent     String?                      // Request user agent
  correlationId String?                      // Request correlation ID
  metadata      Json?                        // Additional structured data
  createdAt     DateTime  @default(now())    // Only timestamp — no updatedAt

  company       Company   @relation(fields: [companyId], references: [id], onDelete: Restrict)

  @@index([companyId])
  @@index([companyId, entityType, entityId])
  @@index([companyId, action])
  @@index([createdAt])
  @@map("ProcurementAPAuditRecord")
}
```

**Trade-offs**:
- Pro: Zero risk of audit tampering — physically impossible at the DB level
- Pro: Fast writes (no version conflict detection needed)
- Pro: Matches existing `AuditLog` pattern
- Con: Higher storage cost (append-only grows faster than mutable)
- Con: Erroneous entries corrected by writing correction entries (audit-of-audit)

**Evidence**: The existing `AuditLog` model (schema line 1985+) is append-only with `createdAt` only — no `updatedAt`. Phase 16.0 security audit flagged audit immutability as mandatory. Phase 17.0 validation confirmed 295 findings rely on immutable audit for forensic analysis.

---

### D-6: Reference Entities for PO and GRN

**Decision**: `ProcurementPOReference` and `ProcurementGRNReference` are AP-owned snapshots of procurement/warehouse data. AP syncs them but never creates them.

**Context**: PO lifecycle is owned by the procurement module. GRN lifecycle is owned by the warehouse module. AP needs read-only snapshots for 3-way matching.

**Alternatives**:

| Option | Pattern | Pros | Cons |
|---|---|---|---|
| A | Direct FK to procurement tables | Single source of truth; no sync needed | Cross-module dependency; violates bounded context; AP queries hit procurement tables |
| B | AP-owned snapshots with sync | Independent; queryable; bounded context isolation | Sync lag; data duplication |
| C | Shared value objects | No duplication | Too complex for line-level detail; breaks bounded context |

**Rationale**: Option B maintains bounded context isolation. AP owns its view of PO/GRN data. Sync happens via typed function calls or scheduled jobs. AP can query its snapshots without touching procurement tables. The `syncedAt` field tracks freshness. This matches the existing bounded context architecture defined in AP_DOMAIN_ARCHITECTURE.md.

**Models**:

| Model | Purpose | Key Fields |
|---|---|---|
| `ProcurementPOReference` | AP-owned PO snapshot | `poNumber`, `poId` (source ID), `vendorId`, `status`, `totalAmount`, `receivedAmount`, `syncedAt` |
| `ProcurementPOReferenceLineItem` | AP-owned PO line snapshot | `poReferenceId`, `lineNumber`, `quantity`, `unitPrice`, `lineTotal`, `receivedQuantity`, `invoicedQuantity` |
| `ProcurementGRNReference` | AP-owned GRN snapshot | `grnNumber`, `grnId` (source ID), `poReferenceId`, `vendorId`, `totalValue`, `syncedAt` |
| `ProcurementGRNReferenceLineItem` | AP-owned GRN line snapshot | `grnReferenceId`, `poReferenceLineItemId`, `quantityReceived`, `quantityAccepted`, `unitPrice`, `lineTotal` |

**Trade-offs**:
- Pro: Zero cross-module FK dependencies — AP is fully self-contained
- Pro: AP queries never touch procurement/warehouse tables
- Pro: Sync lag is acceptable — AP matching uses snapshot data, not real-time
- Con: Data duplication — PO/GRN data exists in both procurement and AP
- Con: Sync mechanism required (events or scheduled job)

**Evidence**: The existing bounded context architecture (AP_DOMAIN_ARCHITECTURE.md) explicitly states "AP stores reference snapshots only" for PO/GRN. The `InvoiceMatchingService` already reads PO data as reference objects, never writes to procurement tables. The `syncedAt` field pattern is used in the existing `SyncHistory` model (schema line 289).

---

### D-7: Decimal(38,12) for All Monetary Values

**Decision**: Every monetary field uses `Decimal(38,12)` regardless of typical magnitude.

**Context**: Phase 19.1 established the financial precision mandate. `financial-precision.ts` helpers operate on `Prisma.Decimal`. The existing schema has migrated from Float to Decimal for all monetary fields.

**Alternatives**:

| Option | Precision | Pros | Cons |
|---|---|---|---|
| A | Variable precision based on magnitude | Smaller storage | Inconsistent; requires per-field documentation; error-prone |
| B | Fixed `Decimal(38,12)` for all money | Consistent; matches `financial-precision.ts`; sufficient for any currency | 16 bytes per value (negligible overhead) |
| C | Float | Simple | NEVER for money — rounding errors, NaN, comparison issues |

**Rationale**: Option B is non-negotiable per Phase 19.1. The 12 decimal places handle compound interest, FX calculations, and tax computations without rounding errors. Storage overhead is negligible (16 bytes per Decimal in PostgreSQL vs 8 bytes for Float). Consistency eliminates the need to remember which fields are "high precision" vs "low precision."

**Precision Matrix** (from AP_DOMAIN_MODEL.md Appendix A):

| Field Pattern | Decimal Type | Scale | Example |
|---|---|---|---|
| Monetary amounts | `Decimal(38,12)` | 12 | `$15,000.000000000000` |
| Quantities | `Decimal(20,4)` | 4 | `100.0000` units |
| Tax rates | `Decimal(5,4)` | 4 | `0.0500` (5%) |
| Percentage scores | `Decimal(5,2)` | 2 | `95.50` (95.5%) |
| Exchange rates | `Decimal(20,8)` | 8 | `1.23456789` |

**Trade-offs**:
- Pro: Zero ambiguity — every monetary field is `Decimal(38,12)`
- Pro: `financial-precision.ts` helpers work uniformly across all fields
- Pro: Matches existing migrated fields (Phase 19.1)
- Con: 16 bytes per Decimal vs 8 bytes for Float — negligible for AP volume
- Con: More verbose Prisma schema — `@db.Decimal(38,12)` on every monetary field

**Evidence**: Phase 19.1 identified 84 unsafe `Number()` conversions and 4 Float fields storing monetary values. All were migrated to Decimal. The existing `Wallet.balance` (schema line 625) uses `Decimal @db.Decimal(38, 12)`. The `ApprovalMatrixRule.thresholdValue` was migrated from Float to `Decimal @db.Decimal(20,4)` in the same phase.

---

### D-8: No Separate ToleranceThreshold Table

**Decision**: Tolerance thresholds are stored as fields on `ProcurementVendorInvoice` and `ProcurementThreeWayMatch`, not as a separate configuration table.

**Context**: The domain model defines ToleranceThreshold as a value object with per-vendor overrides. For Phase 21A.1, we implement the simplest correct solution.

**Alternatives**:

| Option | Pattern | Pros | Cons |
|---|---|---|---|
| A | Separate `ProcurementToleranceConfig` table | Per-vendor overrides; configurable per company | Extra table; extra JOIN; over-engineered for initial implementation |
| B | Fields on invoice/match | Simpler; fewer JOINs; matches current usage | No per-vendor override at DB level; overrides handled at application layer |
| C | JSON column for overrides | Flexible | Not queryable; no DB-level validation |

**Rationale**: Option B is chosen for Phase 21A.1 because: (1) default thresholds are application-level config, not per-row data; (2) per-vendor overrides are rare in practice and can be implemented as a JSON field on `ProcurementVendor` in a future phase; (3) keeping the schema simple for initial implementation reduces migration complexity.

**Fields**:

| Model | Field | Type | Default | Description |
|---|---|---|---|---|
| `ProcurementVendorInvoice` | `varianceThreshold` | `Decimal(5,2)` | `5.00` | Variance % threshold for auto-approval |
| `ProcurementThreeWayMatch` | `approvalThreshold` | `Decimal(5,2)` | `5.00` | Variance % threshold for auto-approve |

**Trade-offs**:
- Pro: Simpler schema; fewer tables; fewer JOINs
- Pro: Thresholds are visible on the invoice/match record directly
- Con: Per-vendor overrides require application-level logic, not DB query
- Con: Changing default threshold requires application deploy, not config change

**Evidence**: The existing `ApprovalMatrixRule` (schema line 845+) stores threshold values directly on the rule entity, not in a separate config table. The `InvoiceMatchingService` (126 lines) uses a hardcoded 5% threshold — the value object approach was never persisted.

---

### D-9: No Separate ApprovalChain Table

**Decision**: `ProcurementApprovalRecord` tracks per-invoice approval decisions. The approval chain configuration lives in `ProcurementApprovalLevel`.

**Context**: The domain model defines ApprovalChain as a reusable aggregate. For the database schema, we flatten the chain into per-invoice approval records.

**Alternatives**:

| Option | Pattern | Pros | Cons |
|---|---|---|---|
| A | Separate `ProcurementApprovalChain` table | More normalized; chain lifecycle independent | Extra table; chain-to-record 1:N adds complexity |
| B | Approval records linked directly to invoice | Simpler queries; one query gets all approvals | Chain state computed at application layer |
| C | Reuse existing `ApprovalRule`/`ApprovalStep` models | No new tables | Different semantics; AP has specific fields (threshold, delegation, escalation) |

**Rationale**: Option B is chosen because: (1) the existing `ApprovalRule`/`ApprovalStep` models serve automation-studio approval matrix, not AP-specific approval — different fields, different semantics; (2) AP approval has specific fields (requiredThreshold, delegation, escalation) that don't map to the generic model; (3) linking records directly to invoice simplifies the most common query ("show me approvals for this invoice").

**Models**:

| Model | Purpose | Key Fields |
|---|---|---|
| `ProcurementApprovalLevel` | Configuration — authority levels per company | `levelNumber`, `levelName`, `minAmount`, `maxAmount`, `requiredRole[]`, `timeLimitHours` |
| `ProcurementApprovalRecord` | Per-invoice approval decision | `vendorInvoiceId`, `approvalLevel`, `status`, `decision`, `decisionBy`, `delegatedTo`, `escalated`, `timeLimit` |

**Trade-offs**:
- Pro: Single query for all approvals on an invoice (no chain table JOIN)
- Pro: Chain state is computed from records (no separate chain state to keep in sync)
- Pro: Each record is independently auditable
- Con: Chain state (routing, in_progress, decided) computed at application layer
- Con: No physical "chain" entity to query for chain-level analytics

**Evidence**: The existing `ApprovalParticipant` (schema line 2087+) and `ApprovalComment` (schema line 2067+) models link directly to approval threads, not through a chain abstraction. The AP permission matrix (AP_PERMISSION_MATRIX.md) defines threshold routing per role, which maps to `ProcurementApprovalLevel` configuration.

---

### D-10: Enum as Prisma Enums, Not Strings

**Decision**: Status fields and type fields use Prisma enum types, not free-form strings.

**Context**: Type safety at the database level prevents invalid status values. Prisma generates TypeScript types from enums.

**Alternatives**:

| Option | Pattern | Pros | Cons |
|---|---|---|---|
| A | String fields with app validation | Flexible; no migration needed for new values | No DB-level validation; typos create invalid states; no IDE autocomplete |
| B | Prisma enums | Type-safe at DB + app level; IDE autocomplete; PostgreSQL native enum types | Migration required for new values; verbose schema |
| C | Check constraints | DB-level validation without enum types | Prisma doesn't generate check constraints; manual SQL required |

**Rationale**: Option B provides type safety at both application and database levels. Invalid values are rejected at the DB level, not just application level. Prisma generates TypeScript union types from enums. PostgreSQL creates native enum types with implicit CHECK constraints.

**Enum Inventory** (25 new enums):

| Enum | Values | Used By |
|---|---|---|
| `ProcurementVendorStatus` | `PENDING_REVIEW`, `ACTIVE`, `SUSPENDED`, `DEACTIVATED` | Vendor |
| `ProcurementVendorRiskLevel` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | Vendor |
| `ProcurementVendorCategory` | `SUPPLIER`, `CONTRACTOR`, `CONSULTANT`, `SERVICE_PROVIDER`, `DISTRIBUTOR`, `MANUFACTURER` | Vendor |
| `ProcurementPaymentMethod` | `ACH`, `WIRE`, `CHECK`, `EFT`, `VIRTUAL_CARD` | Vendor, VendorInvoice, PaymentBatch, PaymentRecord |
| `ProcurementAccountType` | `CHECKING`, `SAVINGS` | VendorBankDetail |
| `ProcurementDocumentStatus` | `VALID`, `EXPIRED`, `PENDING` | VendorDocument |
| `ProcurementCreditStatus` | `ISSUED`, `PARTIALLY_APPLIED`, `FULLY_APPLIED`, `EXPIRED` | VendorCredit |
| `ProcurementPOStatus` | `DRAFT`, `SUBMITTED`, `APPROVED`, `PARTIALLY_RECEIVED`, `FULLY_RECEIVED`, `CANCELLED` | POReference |
| `ProcurementPOLineStatus` | `PENDING`, `PARTIALLY_RECEIVED`, `FULLY_RECEIVED`, `CLOSED` | POReferenceLineItem |
| `ProcurementGRNStatus` | `RECEIVED`, `INSPECTED`, `ACCEPTED`, `REJECTED`, `PARTIAL` | GRNReference |
| `ProcurementGRNCondition` | `GOOD`, `DAMAGED`, `DEFECTIVE`, `MIXED` | GRNReferenceLineItem |
| `ProcurementInvoiceStatus` | `DRAFT`, `CAPTURED`, `VALIDATING`, `VALIDATED`, `THREE_WAY_MATCHING`, `MATCHED`, `MATCH_FAILED`, `EXCEPTION`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `PARTIALLY_PAID`, `PAID`, `VOIDED` | VendorInvoice |
| `ProcurementInvoiceSource` | `EMAIL`, `SCAN`, `EDI`, `PORTAL`, `MANUAL`, `API` | VendorInvoice |
| `ProcurementTaxType` | `VAT`, `GST`, `SALES_TAX`, `WITHHOLDING`, `EXEMPT` | InvoiceLineItem |
| `ProcurementMatchStatus` | `MATCHED`, `VARIANCE`, `UNMATCHED` | InvoiceLineItem |
| `ProcurementThreeWayMatchResult` | `FULL_MATCH`, `PARTIAL_MATCH`, `PRICE_VARIANCE`, `QTY_VARIANCE`, `NO_MATCH` | ThreeWayMatch |
| `ProcurementMatchLineStatus` | `EXACT_MATCH`, `PRICE_VARIANCE`, `QTY_VARIANCE`, `NO_MATCH` | MatchLineItem |
| `ProcurementExceptionType` | `PRICE_VARIANCE`, `QTY_VARIANCE`, `NO_PO`, `DUPLICATE`, `MISSING_GRN`, `GL_CODING_REQUIRED`, `APPROVAL_REQUIRED`, `TAX_MISMATCH`, `CREDIT_NOTE_REQUIRED` | InvoiceException |
| `ProcurementExceptionSeverity` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | InvoiceException |
| `ProcurementExceptionStatus` | `OPEN`, `IN_REVIEW`, `RESOLVED`, `WAIVED`, `ESCALATED` | InvoiceException |
| `ProcurementApprovalStatus` | `PENDING`, `APPROVED`, `REJECTED`, `DELEGATED`, `SKIPPED` | ApprovalRecord |
| `ProcurementApprovalDecision` | `APPROVE`, `REJECT`, `REQUEST_INFO`, `DELEGATE` | ApprovalRecord |
| `ProcurementProposalStatus` | `DRAFT`, `SUBMITTED`, `REVIEWED`, `APPROVED`, `REJECTED`, `EXECUTED`, `CANCELLED` | PaymentProposal |
| `ProcurementProposalItemSelection` | `AUTO`, `MANUAL`, `DISCOUNT_OPTIMIZED` | PaymentProposalItem |
| `ProcurementBatchStatus` | `PENDING`, `GENERATING`, `READY`, `SUBMITTED`, `COMPLETED`, `FAILED`, `CANCELLED` | PaymentBatch |
| `ProcurementPaymentStatus` | `PROCESSED`, `CLEARED`, `VOIDED`, `FAILED`, `REVERSED` | PaymentRecord |
| `ProcurementStatementStatus` | `RECEIVED`, `PARSING`, `PARSED`, `RECONCILING`, `RECONCILED`, `EXCEPTION` | VendorStatement |
| `ProcurementStatementLineType` | `INVOICE`, `PAYMENT`, `CREDIT`, `ADJUSTMENT`, `FEE` | VendorStatementLine |
| `ProcurementStatementMatchStatus` | `UNMATCHED`, `MATCHED`, `PARTIAL`, `EXCEPTION` | VendorStatementLine |
| `ProcurementReconciliationStatus` | `IN_PROGRESS`, `COMPLETED`, `EXCEPTION`, `ADJUSTED` | ReconciliationResult |
| `ProcurementAuditAction` | `CREATED`, `UPDATED`, `STATUS_CHANGED`, `APPROVED`, `REJECTED`, `VOIDED`, `PAID`, `EXCEPTION`, `RESOLVED`, `DELEGATED`, `ESCALATED`, `CONFIG_CHANGED` | APAuditRecord |

**Trade-offs**:
- Pro: Invalid values rejected at DB level (not just application)
- Pro: Prisma generates TypeScript types — full IDE autocomplete
- Pro: PostgreSQL native enum types are efficient (4 bytes per value)
- Con: Adding a new enum value requires a migration (ALTER TYPE ADD VALUE)
- Con: Renaming an enum value requires migration (CREATE new, UPDATE, DROP old)

**Evidence**: The existing schema uses Prisma enums throughout: `TransactionType`, `TransactionStatus`, `WalletKind`, `CompanyRole`, `LedgerSide`, etc. (43 enum types currently). No string-based status fields exist in financial models. Phase 16.0 security audit confirmed that type-safe enums prevent injection of invalid status values.

---

### D-11: PaymentRecord Immutability

**Decision**: `ProcurementPaymentRecord` fields are immutable after creation except for `status`, `glPosted`, `glPostedAt`, and void-related fields.

**Context**: Payment records are financial evidence. Amounts, dates, and references must not change after creation.

**Immutable Fields** (after creation):

| Field | Reason |
|---|---|
| `paymentNumber` | Unique identifier — cannot change |
| `paymentBatchId` | Batch association — cannot change |
| `vendorInvoiceId` | Invoice association — cannot change |
| `vendorId` | Vendor association — cannot change |
| `paymentDate` | Financial evidence — cannot change |
| `amount` | Financial evidence — cannot change |
| `discountTaken` | Financial evidence — cannot change |
| `creditApplied` | Financial evidence — cannot change |
| `netPayment` | Derived from immutable fields — cannot change |
| `currency` | Financial evidence — cannot change |
| `exchangeRate` | Financial evidence — cannot change |
| `baseCurrencyAmount` | Derived from immutable fields — cannot change |
| `paymentMethod` | Financial evidence — cannot change |
| `bankAccountId` | Financial evidence — cannot change |
| `transactionReference` | Bank reference — cannot change |
| `checkNumber` | Check number — cannot change |
| `idempotencyKey` | Deduplication key — cannot change |

**Mutable Fields** (after creation):

| Field | Reason |
|---|---|
| `status` | Lifecycle transitions: `PROCESSED` → `CLEARED` → `VOIDED` |
| `glPosted` | GL posting flag — set after journal entry creation |
| `glPostedAt` | GL posting timestamp |
| `glReversalPosted` | GL reversal flag — set after void reversal |
| `voidedAt` | Void timestamp — set when voided |
| `voidedBy` | Void actor — set when voided |
| `voidReason` | Void reason — set when voided |

**Alternatives**:

| Option | Pattern | Pros | Cons |
|---|---|---|---|
| A | Fully mutable | Simple CRUD | Risk of financial data tampering; no audit trail |
| B | Immutable with status updates | Correct for financial records | Service layer must enforce field-level immutability |
| C | Event sourced | Complete history | Complex; premature; violates Governance Constitution |

**Rationale**: Option B matches financial audit requirements. Once a payment is created, the amount, date, vendor, and references are fixed. Only status transitions (`PROCESSED` → `CLEARED` → `VOIDED`) and GL posting flags are mutable. Void creates a new audit record explaining the reversal.

**Trade-offs**:
- Pro: Financial integrity — payment amounts cannot be tampered with
- Pro: Audit trail is clean — immutable fields + audit record = complete history
- Pro: Service layer enforces immutability explicitly (no accidental mutations)
- Con: Correcting a payment amount requires voiding and creating a new payment
- Con: Service layer must check which fields are mutable based on current status

**Evidence**: The existing `Transaction` model (schema line 663+) has immutable `amount`, `currency`, and `type` fields. The `Wallet.balance` is the only mutable financial field, and it uses optimistic concurrency (`version`). The AP permission matrix requires `Treasurer` role for payment void — confirming that payment mutations are restricted.

---

### D-12: VendorInvoice as Central Aggregate

**Decision**: `ProcurementVendorInvoice` is the central table with the most fields (60+) and relationships.

**Context**: Invoice is the core entity of AP — everything revolves around it. Matching, approval, payment, GL posting, and reconciliation all reference the invoice.

**Alternatives**:

| Option | Pattern | Pros | Cons |
|---|---|---|---|
| A | Split into header + detail tables | More normalized; smaller rows | More JOINs for every invoice display; complex queries |
| B | Single table with all fields | Simpler queries; single-table access for "get invoice by ID" | Wide rows; some sparse columns |
| C | Header + computed fields in view | Normalized writes; denormalized reads | Complex view management; Prisma doesn't support views well |

**Rationale**: Option B is chosen because: (1) PostgreSQL handles wide tables efficiently — 60 columns is well within PostgreSQL's 1600-column limit; (2) the most common query is "get invoice by ID" which benefits from single-table access; (3) derived fields (`totalAmount`, `balanceDue`) are computed at write time and stored for read performance; (4) splitting would require JOINs for every invoice display.

**Field Count by Model**:

| Model | Fields | Relationships | Role |
|---|---|---|---|
| `ProcurementVendorInvoice` | 60+ | 8 FKs (vendor, PO, GRN, batch, proposal, etc.) | **Central aggregate** |
| `ProcurementVendor` | 30+ | 5 children (bankDetail, performance, document, credit, invoice) | Reference entity |
| `ProcurementPaymentRecord` | 25+ | 3 FKs (batch, invoice, vendor) | Financial evidence |
| `ProcurementThreeWayMatch` | 20+ | 4 FKs (invoice, PO, GRN, match) | Match result |
| Other models | 10–20 | 2–4 FKs | Supporting entities |

**Trade-offs**:
- Pro: Single-table queries for invoice display (no JOINs)
- Pro: Derived fields (`totalAmount`, `balanceDue`) are pre-computed for read performance
- Pro: PostgreSQL handles 60-column tables efficiently
- Con: Sparse columns (OCR fields, payment fields) waste some storage
- Con: Wide rows may reduce cache efficiency for narrow queries (e.g., "list invoice numbers")

**Evidence**: The existing `GLJournalEntry` model (schema line 1049+) has 25+ fields in a single table. The `MorningBriefing` model (schema line 3043+) has 30+ fields including embedded value objects. PostgreSQL documentation confirms that row width up to ~8KB (the TOAST threshold) has no performance impact. 60 Decimal(38,12) fields = 60 × 16 bytes = 960 bytes — well under the TOAST threshold.

---

### D-13: Composite Index Strategy for Multi-Tenant Queries

**Decision**: Every query includes `companyId` as the first component of composite indexes. All company-scoped unique constraints use `(companyId, field)` composition.

**Context**: Multi-tenant isolation requires `companyId` on every query. Composite indexes ensure the database can satisfy both tenant isolation and business queries in a single index scan.

**Index Patterns**:

| Pattern | Example | Purpose |
|---|---|---|
| `[companyId]` | Every model | Tenant isolation — base filter |
| `[companyId, uniqueField]` | `[companyId, vendorCode]` | Unique constraint + tenant-scoped lookup |
| `[companyId, foreignKey]` | `[companyId, vendorId]` | Tenant-scoped relationship traversal |
| `[companyId, status]` | `[companyId, status]` | Tenant-scoped status filter (dashboard) |
| `[companyId, createdAt]` | `[companyId, createdAt]` | Tenant-scoped chronological queries |
| `[companyId, field1, field2]` | `[companyId, vendorId, status]` | Multi-column tenant-scoped queries |

**Company-Scoped Unique Constraints**:

| Model | Unique Constraint | Purpose |
|---|---|---|
| `ProcurementVendor` | `(companyId, vendorCode)` | Vendor code per company |
| `ProcurementVendor` | `(companyId, taxId)` | Tax ID per company |
| `ProcurementVendorCredit` | `(companyId, vendorId, creditNumber)` | Credit number per vendor |
| `ProcurementPOReference` | `(companyId, poNumber)` | PO number per company |
| `ProcurementGRNReference` | `(companyId, grnNumber)` | GRN number per company |
| `ProcurementVendorInvoice` | `(companyId, vendorId, invoiceNumber)` | Invoice number per vendor |
| `ProcurementInvoiceLineItem` | `(companyId, vendorInvoiceId, lineNumber)` | Line number per invoice |
| `ProcurementPaymentProposal` | `(companyId, proposalNumber)` | Proposal number per company |
| `ProcurementPaymentBatch` | `(companyId, batchNumber)` | Batch number per company |
| `ProcurementPaymentRecord` | `(companyId, paymentNumber)` | Payment number per company |
| `ProcurementVendorStatement` | `(companyId, vendorId, statementDate)` | Statement per vendor per date |
| `ProcurementReconciliationResult` | `(companyId, vendorStatementId)` | One result per statement |
| `ProcurementApprovalLevel` | `(companyId, levelNumber)` | Level number per company |
| `ProcurementThreeWayMatch` | `(companyId, vendorInvoiceId)` | One match per invoice |

**Trade-offs**:
- Pro: Every query satisfies tenant isolation via index — no full table scans
- Pro: Composite indexes serve both uniqueness and query optimization
- Pro: Matches existing schema pattern (all 349 models use `[companyId]` as base index)
- Con: More indexes = slower writes (B-tree maintenance)
- Con: Composite indexes are wider (more storage) than single-column indexes

**Evidence**: The existing schema uses `[companyId]` as the base index on every model (100+ `companyId` fields found). The `Wallet` model has `@@index([companyId, kind, currency])` — a three-column composite index for tenant-scoped wallet lookup. The `Transaction` model has `@@index([companyId, createdAt])` — tenant-scoped chronological queries.

---

### D-14: Derived Fields Stored, Not Computed at Read

**Decision**: Derived financial fields (`totalAmount`, `balanceDue`, `netPayment`, etc.) are computed at write time and stored, not computed at read time.

**Context**: The most common AP query is "show me invoice totals" or "show me outstanding balance." Computing these at read time would require aggregating child entities (line items, payments, credits) on every query.

**Derived Fields**:

| Model | Field | Derivation | Stored Because |
|---|---|---|---|
| `ProcurementVendorInvoice` | `totalAmount` | `subtotal + taxAmount + shippingAmount - discountAmount` | Dashboard queries; aging reports |
| `ProcurementVendorInvoice` | `totalWithTax` | `subtotal + taxAmount` | Tax reporting |
| `ProcurementVendorInvoice` | `balanceDue` | `totalAmount - amountPaid` | Aging reports; payment proposals |
| `ProcurementVendorInvoice` | `netBalance` | `balanceDue - creditApplied` | Payment amount calculation |
| `ProcurementPaymentProposalItem` | `netPayment` | `amount - discountTaken - creditApplied` | Cash requirement projections |
| `ProcurementPaymentRecord` | `netPayment` | `amount - discountTaken - creditApplied` | Payment reporting |
| `ProcurementPaymentRecord` | `baseCurrencyAmount` | `netPayment × exchangeRate` | GL posting |
| `ProcurementVendorCredit` | `remainingAmount` | `creditAmount - appliedAmount` | Credit availability |
| `ProcurementReconciliationResult` | `balanceVariance` | `apBalance - vendorBalance` | Reconciliation dashboard |
| `ProcurementReconciliationResult` | `matchRate` | `matchedLines / totalLines × 100` | Reconciliation dashboard |
| `ProcurementGRNReferenceLineItem` | `lineTotal` | `quantityAccepted × unitPrice` | 3-way match comparison |

**Alternatives**:

| Option | Pattern | Pros | Cons |
|---|---|---|---|
| A | Compute at read time | No stale data; single source of truth | Expensive aggregation on every query; N+1 risk |
| B | Store derived fields; compute at write time | Fast reads; simple queries | Potential staleness; write complexity |
| C | Database views + materialized views | Fast reads; no app code | Prisma doesn't support views; refresh complexity |

**Rationale**: Option B is chosen because: (1) AP dashboards and aging reports are read-heavy — they query thousands of invoices; (2) derived fields are computed from immutable or controlled fields (amounts only change during specific status transitions); (3) staleness is bounded — derived fields are recalculated on every mutation; (4) the `financial-precision.ts` helpers ensure consistent computation.

**Trade-offs**:
- Pro: Dashboard queries are simple `SELECT` without aggregation
- Pro: Aging reports can sort by `balanceDue` using an index
- Con: Derived fields must be recalculated on every mutation (service layer responsibility)
- Con: Potential staleness between write and read (bounded by transaction duration)

**Evidence**: The existing `Wallet.balance` (schema line 625) is a derived field — it's updated in the same transaction as ledger entries. The `GLAccountBalance` model stores computed balances, not computed on read. The `MorningBriefing` model stores pre-computed cash position values.

---

### D-15: JSON Columns for Semi-Structured Data

**Decision**: Use `Json?` columns for metadata, tags, and template data that don't need DB-level querying.

**Context**: Some data is semi-structured and doesn't fit the relational model cleanly.

**JSON Columns**:

| Model | Field | Content | Why JSON |
|---|---|---|---|
| `ProcurementAPAuditRecord` | `metadata` | Action-specific structured data (varies per action type) | Every action has different metadata shape |
| `ProcurementVendor` | `tags` | User-defined tags (`string[]`) | Variable-length array; no query semantics |
| `ProcurementInvoiceAttachment` | `ocrExtracted` (future) | OCR extraction results (key-value pairs) | Variable schema per document type |
| `ProcurementRecurringInvoice` (future) | `lineItems` | Template line items | Variable count; template-level data |

**Non-JSON Alternatives Rejected**:

| Field | Why Not JSON | Storage |
|---|---|---|
| `tags` on Vendor | Could be a separate `VendorTag` table | Chosen as JSON — tags have no query semantics, no relationships, no indexing need |
| `metadata` on AuditRecord | Could be individual fields per action type | Chosen as JSON — every action type has different metadata; 12 action types × 5 fields = 60 nullable columns |

**Trade-offs**:
- Pro: Flexible schema for heterogeneous data
- Pro: No extra tables for metadata
- Con: Not queryable with SQL WHERE clauses (application-level filtering)
- Con: No DB-level type validation

**Evidence**: The existing schema uses `Json?` for metadata fields: `AuditLog.metadata` (schema line 2029), `CopilotConversation.messages`, `WorkflowStepExecution.output`. The pattern is established for semi-structured data that varies per entity type.

---

## 3. Enum Inventory

All 25 new enums follow the naming convention `Procurement{Domain}{Type}`:

```
ProcurementVendorStatus         ProcurementInvoiceStatus
ProcurementVendorRiskLevel      ProcurementInvoiceSource
ProcurementVendorCategory       ProcurementTaxType
ProcurementPaymentMethod        ProcurementMatchStatus
ProcurementAccountType          ProcurementThreeWayMatchResult
ProcurementDocumentStatus       ProcurementMatchLineStatus
ProcurementCreditStatus         ProcurementExceptionType
ProcurementPOStatus             ProcurementExceptionSeverity
ProcurementPOLineStatus         ProcurementExceptionStatus
ProcurementGRNStatus            ProcurementApprovalStatus
ProcurementGRNCondition         ProcurementApprovalDecision
ProcurementProposalStatus       ProcurementReconciliationStatus
ProcurementProposalItemSelection
ProcurementBatchStatus
ProcurementPaymentStatus
ProcurementStatementStatus
ProcurementStatementLineType
ProcurementStatementMatchStatus
ProcurementAuditAction
```

---

## 4. Model-to-Entity Mapping

| # | Domain Model Entity | Prisma Model | Table Name | Aggregate Root |
|---|---|---|---|---|
| 1 | Vendor | `ProcurementVendor` | ProcurementVendor | Yes |
| 2 | VendorBankDetail | `ProcurementVendorBankDetail` | ProcurementVendorBankDetail | No (child of Vendor) |
| 3 | VendorPerformance | `ProcurementVendorPerformance` | ProcurementVendorPerformance | No (child of Vendor) |
| 4 | VendorDocument | `ProcurementVendorDocument` | ProcurementVendorDocument | No (child of Vendor) |
| 5 | VendorCredit | `ProcurementVendorCredit` | ProcurementVendorCredit | Yes |
| 6 | PurchaseOrderReference | `ProcurementPOReference` | ProcurementPOReference | No (reference entity) |
| 7 | POReferenceLineItem | `ProcurementPOReferenceLineItem` | ProcurementPOReferenceLineItem | No (child of POReference) |
| 8 | GoodsReceiptReference | `ProcurementGRNReference` | ProcurementGRNReference | No (reference entity) |
| 9 | GRNReferenceLineItem | `ProcurementGRNReferenceLineItem` | ProcurementGRNReferenceLineItem | No (child of GRNReference) |
| 10 | VendorInvoice | `ProcurementVendorInvoice` | ProcurementVendorInvoice | **Yes (central)** |
| 11 | InvoiceLineItem | `ProcurementInvoiceLineItem` | ProcurementInvoiceLineItem | No (child of VendorInvoice) |
| 12 | InvoiceAttachment | `ProcurementInvoiceAttachment` | ProcurementInvoiceAttachment | No (child of VendorInvoice) |
| 13 | ThreeWayMatch | `ProcurementThreeWayMatch` | ProcurementThreeWayMatch | Yes |
| 14 | MatchLineItem | `ProcurementMatchLineItem` | ProcurementMatchLineItem | No (child of ThreeWayMatch) |
| 15 | InvoiceException | `ProcurementInvoiceException` | ProcurementInvoiceException | Yes |
| 16 | ApprovalRecord | `ProcurementApprovalRecord` | ProcurementApprovalRecord | Yes (per-invoice chain) |
| 17 | ApprovalLevel | `ProcurementApprovalLevel` | ProcurementApprovalLevel | Yes (configuration) |
| 18 | PaymentProposal | `ProcurementPaymentProposal` | ProcurementPaymentProposal | Yes |
| 19 | PaymentProposalItem | `ProcurementPaymentProposalItem` | ProcurementPaymentProposalItem | No (child of PaymentProposal) |
| 20 | PaymentBatch | `ProcurementPaymentBatch` | ProcurementPaymentBatch | Yes |
| 21 | PaymentRecord | `ProcurementPaymentRecord` | ProcurementPaymentRecord | Yes |
| 22 | VendorStatement | `ProcurementVendorStatement` | ProcurementVendorStatement | Yes |
| 23 | VendorStatementLine | `ProcurementVendorStatementLine` | ProcurementVendorStatementLine | No (child of VendorStatement) |
| 24 | ReconciliationResult | `ProcurementReconciliationResult` | ProcurementReconciliationResult | Yes |
| 25 | APAuditRecord | `ProcurementAPAuditRecord` | ProcurementAPAuditRecord | No (append-only log) |

**Aggregate Root Count**: 12 aggregate roots, 13 child/reference entities, 1 append-only log.

---

## 5. Decimal Precision Matrix

| Precision | Prisma Type | PostgreSQL Type | Bytes | Used For | Count |
|---|---|---|---|---|---|
| `Decimal(38,12)` | `Decimal @db.Decimal(38,12)` | `numeric(38,12)` | 16 | Monetary amounts | ~110 |
| `Decimal(20,4)` | `Decimal @db.Decimal(20,4)` | `numeric(20,4)` | 12 | Quantities | ~15 |
| `Decimal(5,4)` | `Decimal @db.Decimal(5,4)` | `numeric(5,4)` | 6 | Tax rates (0.0000–1.0000) | ~5 |
| `Decimal(5,2)` | `Decimal @db.Decimal(5,2)` | `numeric(5,2)` | 6 | Percentage scores (0.00–100.00) | ~20 |
| `Decimal(20,8)` | `Decimal @db.Decimal(20,8)` | `numeric(20,8)` | 12 | Exchange rates | ~5 |
| `Decimal(3,1)` | `Decimal @db.Decimal(3,1)` | `numeric(3,1)` | 6 | Vendor rating (0.0–5.0) | 1 |

**Total Decimal fields**: ~156 across 25 models.

---

## 6. Index Strategy

**Index Count by Model** (estimated):

| Model | Indexes | Unique Constraints |
|---|---|---|
| `ProcurementVendor` | 4 | 2 (`vendorCode`, `taxId`) |
| `ProcurementVendorBankDetail` | 2 | 0 |
| `ProcurementVendorPerformance` | 2 | 1 (`vendorId + period`) |
| `ProcurementVendorDocument` | 2 | 0 |
| `ProcurementVendorCredit` | 2 | 1 (`vendorId + creditNumber`) |
| `ProcurementPOReference` | 3 | 1 (`poNumber`) |
| `ProcurementPOReferenceLineItem` | 2 | 1 (`poReferenceId + lineNumber`) |
| `ProcurementGRNReference` | 3 | 1 (`grnNumber`) |
| `ProcurementGRNReferenceLineItem` | 2 | 1 (`grnReferenceId + lineNumber`) |
| `ProcurementVendorInvoice` | 6 | 1 (`vendorId + invoiceNumber`) |
| `ProcurementInvoiceLineItem` | 2 | 1 (`vendorInvoiceId + lineNumber`) |
| `ProcurementInvoiceAttachment` | 2 | 0 |
| `ProcurementThreeWayMatch` | 3 | 1 (`vendorInvoiceId`) |
| `ProcurementMatchLineItem` | 2 | 0 |
| `ProcurementInvoiceException` | 3 | 0 |
| `ProcurementApprovalRecord` | 3 | 0 |
| `ProcurementApprovalLevel` | 2 | 1 (`levelNumber`) |
| `ProcurementPaymentProposal` | 3 | 1 (`proposalNumber`) |
| `ProcurementPaymentProposalItem` | 2 | 0 |
| `ProcurementPaymentBatch` | 3 | 1 (`batchNumber`) |
| `ProcurementPaymentRecord` | 3 | 2 (`paymentNumber`, `idempotencyKey`) |
| `ProcurementVendorStatement` | 3 | 1 (`vendorId + statementDate`) |
| `ProcurementVendorStatementLine` | 2 | 0 |
| `ProcurementReconciliationResult` | 2 | 1 (`vendorStatementId`) |
| `ProcurementAPAuditRecord` | 4 | 0 |
| **Total** | **~70** | **~14** |

**Additional Global Indexes**:

```prisma
// High-value query patterns
@@index([companyId, status, createdAt])     // Dashboard: recent invoices by status
@@index([companyId, vendorId, status])       // Vendor detail: invoices by vendor + status
@@index([companyId, dueDate])                // Aging report: invoices by due date
@@index([companyId, paymentMethod])          // Payment analysis
@@index([entityType, entityId])              // Audit trail: all events for an entity
```

---

## 7. Migration Safety

**Principles**:

1. **Additive only** — all 25 models are new; no existing models modified
2. **No FK to existing tables** — all FKs point to `Company` (existing) or other AP models (new)
3. **No column changes** — zero ALTER TABLE on existing models
4. **Separate migration file** — `20260721210000_accounts_payable_domain` (single migration)
5. **Idempotent** — migration can be rolled back cleanly

**FK Graph**:

```
Company (existing)
  └── ProcurementVendor
       ├── ProcurementVendorBankDetail
       ├── ProcurementVendorPerformance
       ├── ProcurementVendorDocument
       ├── ProcurementVendorCredit
       ├── ProcurementVendorInvoice (central)
       │    ├── ProcurementInvoiceLineItem
       │    ├── ProcurementInvoiceAttachment
       │    ├── ProcurementApprovalRecord
       │    ├── ProcurementPaymentProposalItem
       │    ├── ProcurementPaymentRecord
       │    ├── ProcurementVendorStatementLine (via matchedInvoiceId)
       │    └── ProcurementInvoiceException
       ├── ProcurementPOReference
       │    ├── ProcurementPOReferenceLineItem
       │    └── ProcurementGRNReference
       │         └── ProcurementGRNReferenceLineItem
       ├── ProcurementThreeWayMatch
       │    └── ProcurementMatchLineItem
       ├── ProcurementPaymentProposal
       │    └── ProcurementPaymentProposalItem
       ├── ProcurementPaymentBatch
       │    └── ProcurementPaymentRecord
       ├── ProcurementVendorStatement
       │    ├── ProcurementVendorStatementLine
       │    └── ProcurementReconciliationResult
       └── ProcurementAPAuditRecord
```

**Rollback Safety**: Dropping all 25 `Procurement*` models and 25 `Procurement*` enums has zero impact on existing models. No existing FK references AP models.

---

## 8. Schema Size Impact

| Metric | Before | After | Delta |
|---|---|---|---|
| Prisma models | 349 | 374 | +25 |
| Enum types | 43 | 68 | +25 |
| Decimal fields | ~120 | ~276 | +156 |
| String fields | ~400 | ~470 | +70 |
| Boolean fields | ~80 | ~100 | +20 |
| DateTime fields | ~150 | ~195 | +45 |
| Json fields | ~30 | ~34 | +4 |
| Int fields | ~60 | ~70 | +10 |
| Estimated schema lines | ~9,764 | ~11,200 | +1,436 |
| Estimated migration SQL | — | ~2,800 lines | — |

**Prisma Client Impact**: 25 new model classes, 25 new enum types, ~70 new index definitions. `prisma generate` output increases by ~15%.

---

*End of Phase 21A.1 — AP Database Design Decisions*
