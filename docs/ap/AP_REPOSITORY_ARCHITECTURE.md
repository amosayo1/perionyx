# AP Repository Architecture

> **Phase 21A.2** — Persistence Layer  
> 22 files, 10 repository interfaces, 10 InMemory implementations, 10 Prisma implementations  
> Registry pattern with interface segregation

---

## Architecture Overview

```
Application Service
  → APRepositoryRegistry (facade)
    → IVendorRepository / IInvoiceRepository / ...  (interface)
      → PrismaVendorRepository / PrismaInvoiceRepository / ...  (production)
      → InMemoryVendorRepository / InMemoryInvoiceRepository / ...  (testing)
```

### File Inventory

| Category | Files | Location |
|---|---|---|
| Domain Types | 1 | `src/server/procurement/ap-repositories/types.ts` (875 lines) |
| Repository Interfaces | 10 | `src/server/procurement/ap-repositories/{vendor,invoice,match,exception,approval,payment,credit,reconciliation,audit}-repository.ts` |
| InMemory Implementations | 10 | Same files (co-located with interface) |
| Prisma Implementations | 10 | `src/server/procurement/ap-repositories/prisma-{vendor,invoice,match,exception,approval,payment,credit,reconciliation,audit}-repository.ts` |
| Prisma Helpers | 1 | `src/server/procurement/ap-repositories/prisma-ap-helpers.ts` |
| Registry | 1 | `src/server/procurement/ap-repositories/registry.ts` |
| Barrel Export | 1 | `src/server/procurement/ap-repositories/index.ts` |
| **Total** | **22** | |

---

## Domain Types (`types.ts`)

The types file (875 lines) defines all domain types used across the repository and application layers.

### Aggregate Types (11)

| Type | Description | Key Fields |
|---|---|---|
| `Vendor` | Vendor master | id, companyId, vendorCode, name, status, riskLevel, taxId, currency, paymentTerms, creditLimit, version |
| `VendorBankDetail` | Bank account for vendor | id, vendorId, routingNumber, accountNumber, isPrimary, verifiedAt |
| `VendorInvoice` | Core AP invoice | id, vendorId, invoiceNumber, status, totalAmount, balanceDue, matchResult, approvalRequired, version |
| `InvoiceLineItem` | Invoice line detail | id, vendorInvoiceId, lineNumber, quantity, unitPrice, lineTotal, taxRate, glAccountId |
| `ThreeWayMatch` | Match result | id, vendorInvoiceId, matchResult, totalVariance, lineItems[] |
| `MatchLineItem` | Per-line match detail | id, threeWayMatchId, matchStatus, priceVariance, quantityVariance |
| `InvoiceException` | Blocking exception | id, vendorInvoiceId, exceptionType, severity, status, assignedTo, resolution |
| `ApprovalRecord` | Approval level | id, vendorInvoiceId, approvalLevel, status, decision, delegatedTo, escalated |
| `PaymentProposal` | Payment run proposal | id, proposalNumber, status, totalAmount, items[] |
| `PaymentBatch` | Executed payment group | id, batchNumber, status, totalAmount, paymentRecords[] |
| `PaymentRecord` | Individual payment | id, paymentBatchId, vendorInvoiceId, amount, status, transactionReference |
| `VendorCredit` | Credit note | id, vendorId, creditNumber, creditAmount, appliedAmount, status |
| `VendorStatement` | Vendor's statement | id, vendorId, periodStart, periodEnd, openingBalance, closingBalance |
| `ReconciliationResult` | Reconciliation outcome | id, vendorStatementId, apBalance, vendorBalance, balanceVariance, status |
| `APAuditRecord` | Append-only audit log | id, entityType, entityId, action, oldValue, newValue, userId |

### Query Filters (10)

| Filter Type | Key Parameters |
|---|---|
| `VendorQueryFilter` | companyId, status?, category?, currency?, preferred?, isBlocked?, search? |
| `InvoiceQueryFilter` | companyId, vendorId?, status?, invoiceDateFrom/To?, dueDateFrom/To?, currency?, search? |
| `MatchQueryFilter` | companyId, vendorInvoiceId?, matchResult? |
| `ExceptionQueryFilter` | companyId, vendorInvoiceId?, status?, severity?, exceptionType?, assignedTo? |
| `ApprovalQueryFilter` | companyId, vendorInvoiceId?, status?, decisionBy? |
| `PaymentProposalQueryFilter` | companyId, status?, paymentDateFrom/To? |
| `PaymentBatchQueryFilter` | companyId, status?, paymentMethod? |
| `CreditQueryFilter` | companyId, vendorId?, status?, invoiceId? |
| `ReconciliationQueryFilter` | companyId, vendorId?, status?, vendorStatementId? |
| `AuditQueryFilter` | companyId, entityType?, entityId?, action?, userId?, correlationId?, createdAtFrom/To? |

### Pagination & Sorting

```typescript
interface PaginationParams { page: number; limit: number; }
interface PaginatedResult<T> { items: T[]; total: number; page: number; limit: number; totalPages: number; }
interface SortParams { field: string; direction: "asc" | "desc"; }
```

---

## Repository Interfaces

Each interface defines a focused API for a single aggregate root. No interface exceeds 15 methods.

### IVendorRepository

```typescript
interface IVendorRepository {
  findById(id: string, companyId: string): Promise<Vendor | null>;
  findByFilter(filter: VendorQueryFilter, pagination?: PaginationParams, sort?: SortParams): Promise<PaginatedResult<Vendor>>;
  existsByTaxId(taxId: string, companyId: string): Promise<boolean>;
  save(vendor: Vendor): Promise<void>;
  saveBankDetail(detail: VendorBankDetail): Promise<void>;
  getBankDetails(vendorId: string, companyId: string): Promise<VendorBankDetail[]>;
  delete(id: string, companyId: string): Promise<void>;
}
```

### IInvoiceRepository

```typescript
interface IInvoiceRepository {
  findById(id: string, companyId: string): Promise<VendorInvoice | null>;
  findByFilter(filter: InvoiceQueryFilter, pagination?: PaginationParams, sort?: SortParams): Promise<PaginatedResult<VendorInvoice>>;
  findByVendorId(vendorId: string, companyId: string): Promise<VendorInvoice[]>;
  findApprovedUnscheduled(companyId: string): Promise<VendorInvoice[]>;
  existsByInvoiceNumber(invoiceNumber: string, vendorId: string, companyId: string): Promise<boolean>;
  save(invoice: VendorInvoice): Promise<void>;
  saveLineItems(lineItems: InvoiceLineItem[]): Promise<void>;
  getLineItems(invoiceId: string, companyId: string): Promise<InvoiceLineItem[]>;
  deleteLineItemsByInvoice(invoiceId: string): Promise<void>;
  delete(id: string, companyId: string): Promise<void>;
}
```

### IMatchRepository

```typescript
interface IMatchRepository {
  findById(id: string, companyId: string): Promise<ThreeWayMatch | null>;
  findByFilter(filter: MatchQueryFilter, pagination?: PaginationParams): Promise<PaginatedResult<ThreeWayMatch>>;
  save(match: ThreeWayMatch): Promise<void>;
  saveLineItems(lineItems: MatchLineItem[]): Promise<void>;
  getLineItems(matchId: string, companyId: string): Promise<MatchLineItem[]>;
  delete(id: string, companyId: string): Promise<void>;
}
```

### IExceptionRepository

```typescript
interface IExceptionRepository {
  findById(id: string, companyId: string): Promise<InvoiceException | null>;
  findByFilter(filter: ExceptionQueryFilter, pagination?: PaginationParams): Promise<PaginatedResult<InvoiceException>>;
  findOpenByInvoiceId(invoiceId: string, companyId: string): Promise<InvoiceException | null>;
  save(exception: InvoiceException): Promise<void>;
  delete(id: string, companyId: string): Promise<void>;
}
```

### IApprovalRepository

```typescript
interface IApprovalRepository {
  findRecordById(id: string, companyId: string): Promise<ApprovalRecord | null>;
  findRecordsByInvoiceId(invoiceId: string, companyId: string): Promise<ApprovalRecord[]>;
  findByFilter(filter: ApprovalQueryFilter, pagination?: PaginationParams): Promise<PaginatedResult<ApprovalRecord>>;
  saveRecord(record: ApprovalRecord): Promise<void>;
  deleteRecord(id: string, companyId: string): Promise<void>;
}
```

### IPaymentProposalRepository

```typescript
interface IPaymentProposalRepository {
  findById(id: string, companyId: string): Promise<PaymentProposal | null>;
  findByFilter(filter: PaymentProposalQueryFilter, pagination?: PaginationParams): Promise<PaginatedResult<PaymentProposal>>;
  save(proposal: PaymentProposal): Promise<void>;
  saveItems(items: PaymentProposalItem[]): Promise<void>;
  getItems(proposalId: string, companyId: string): Promise<PaymentProposalItem[]>;
  delete(id: string, companyId: string): Promise<void>;
}
```

### IPaymentBatchRepository

```typescript
interface IPaymentBatchRepository {
  findById(id: string, companyId: string): Promise<PaymentBatch | null>;
  findByProposalId(proposalId: string, companyId: string): Promise<PaymentBatch | null>;
  findByIdempotencyKey(key: string, companyId: string): Promise<PaymentRecord | null>;
  findByInvoiceId(invoiceId: string, companyId: string): Promise<PaymentRecord | null>;
  findByFilter(filter: PaymentBatchQueryFilter, pagination?: PaginationParams): Promise<PaginatedResult<PaymentBatch>>;
  save(batch: PaymentBatch): Promise<void>;
  savePaymentRecord(record: PaymentRecord): Promise<void>;
  getPaymentRecords(batchId: string, companyId: string): Promise<PaymentRecord[]>;
  findPaymentRecordById(id: string, companyId: string): Promise<PaymentRecord | null>;
  delete(id: string, companyId: string): Promise<void>;
}
```

### ICreditRepository

```typescript
interface ICreditRepository {
  findById(id: string, companyId: string): Promise<VendorCredit | null>;
  findByCreditNumber(creditNumber: string, vendorId: string, companyId: string): Promise<VendorCredit | null>;
  findByFilter(filter: CreditQueryFilter, pagination?: PaginationParams): Promise<PaginatedResult<VendorCredit>>;
  save(credit: VendorCredit): Promise<void>;
  delete(id: string, companyId: string): Promise<void>;
}
```

### IReconciliationRepository

```typescript
interface IReconciliationRepository {
  findReconciliationResultById(id: string, companyId: string): Promise<ReconciliationResult | null>;
  findStatementById(id: string, companyId: string): Promise<VendorStatement | null>;
  findStatementsByVendor(vendorId: string, companyId: string): Promise<VendorStatement[]>;
  getStatementLines(statementId: string, companyId: string): Promise<VendorStatementLine[]>;
  findByFilter(filter: ReconciliationQueryFilter, pagination?: PaginationParams): Promise<PaginatedResult<ReconciliationResult>>;
  saveStatement(statement: VendorStatement): Promise<void>;
  saveStatementLines(lines: VendorStatementLine[]): Promise<void>;
  saveReconciliationResult(result: ReconciliationResult): Promise<void>;
  delete(id: string, companyId: string): Promise<void>;
}
```

### IAuditRepository

```typescript
interface IAuditRepository {
  findByFilter(filter: AuditQueryFilter, pagination?: PaginationParams): Promise<PaginatedResult<APAuditRecord>>;
  save(record: APAuditRecord): Promise<void>;
  saveBatch(records: APAuditRecord[]): Promise<void>;
}
```

---

## Registry Pattern

### APRepositoryRegistry

```typescript
interface APRepositoryRegistry {
  vendor: IVendorRepository;
  invoice: IInvoiceRepository;
  match: IMatchRepository;
  exception: IExceptionRepository;
  approval: IApprovalRepository;
  paymentProposal: IPaymentProposalRepository;
  paymentBatch: IPaymentBatchRepository;
  credit: ICreditRepository;
  reconciliation: IReconciliationRepository;
  audit: IAuditRepository;
}
```

### Lifecycle Functions

| Function | Description |
|---|---|
| `initializeAPRepositories()` | Creates singleton with Prisma implementations. Safe to call multiple times. |
| `getAPRepositories()` | Returns initialized registry (auto-initializes if needed). |
| `resetAPRepositories()` | Clears singleton. **Testing only.** |

### Test Injection

```typescript
// Tests can inject InMemory implementations directly
const repos: APRepositoryRegistry = {
  vendor: new InMemoryVendorRepository(),
  invoice: new InMemoryInvoiceRepository(),
  // ...
};
const service = new VendorApplicationService(repos);
```

---

## Prisma Adapter Pattern

### Save (Upsert)

All Prisma repositories use `prisma.model.upsert()` for save operations:

```typescript
async save(vendor: Vendor): Promise<void> {
  await this.prisma.procurementVendor.upsert({
    where: { id: vendor.id },
    create: unmmapVendor(vendor),      // domain → Prisma
    update: unmapVendor(vendor),       // domain → Prisma (excludes id)
  });
}
```

### Queries (findMany)

All list queries use `prisma.model.findMany()` with `where` clauses built from filters:

```typescript
async findByFilter(filter: VendorQueryFilter): Promise<PaginatedResult<Vendor>> {
  const where = { companyId: filter.companyId };
  if (filter.status) where.status = filter.status;
  // ...
  const [items, total] = await Promise.all([
    this.prisma.procurementVendor.findMany({ where, skip, take, orderBy }),
    this.prisma.procurementVendor.count({ where }),
  ]);
  return { items: items.map(mapVendor), total, page, limit, totalPages };
}
```

### Type Mapping Helpers

Every Prisma repository has `mapXxx()` (Prisma → domain) and `unmapXxx()` (domain → Prisma) helpers:

```typescript
function mapVendor(row: ProcurementVendor): Vendor { ... }
function unmapVendor(vendor: Vendor): Prisma.ProcurementVendorCreateInput { ... }
```

---

## Financial Precision at Repository Boundary

The repository boundary is the conversion point between `Prisma.Decimal(38,12)` and JavaScript `number`:

| Direction | Conversion |
|---|---|
| **Domain → Prisma** (save) | `number` fields in domain type map directly to Prisma `Decimal` fields |
| **Prisma → Domain** (read) | Prisma returns `Decimal` objects; `unmapXxx()` calls `.toNumber()` |

All arithmetic within application services uses `financial-precision.ts` helpers (`toDecimal`, `sumDecimals`, `multiplyDecimals`). The repository layer never performs arithmetic — it only converts types.

---

## Multi-Tenancy

Every repository method receives `companyId` as a parameter. The Prisma `where` clause always includes `companyId` as the first filter:

```typescript
where: { id, companyId }  // Never just { id }
```

This ensures no cross-tenant data access is possible, even if a repository method is called directly (bypassing the application service).

---

## Optimistic Locking

All aggregate roots have a `version` field (integer, default 0). The Prisma schema enforces this:

```prisma
version Int @default(0)
```

When saving, the application service increments `version` before calling `repo.save()`. Prisma's `update` operation includes `version` in the `where` clause, failing if another transaction has modified the record since it was loaded.
