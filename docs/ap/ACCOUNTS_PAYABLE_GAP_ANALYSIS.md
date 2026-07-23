# Phase 21.0 — Accounts Payable Gap Analysis

> **Status**: Complete
> **Type**: Documentation-only — inventory and analysis
> **Date**: July 21, 2026
> **Scope**: Complete AP capability inventory against target enterprise workflow
> **Baseline**: Phase 20.0/20.2 validation findings, current codebase state

---

## Executive Summary

The Accounts Payable domain in Perionyx has **extensive UI and type scaffolding** but **critical backend gaps** that prevent it from functioning as a production enterprise workflow. The platform has 11 procurement pages, 20 components, 12 domain services, and a comprehensive type system — but zero API routes, zero Prisma models, zero mutation methods, and zero end-to-end orchestration.

**Current State**: AP Manager persona scores 5/10 — the joint-lowest of all 10 personas. Workflow coverage is 5/10. Zero of the 14 target workflow stages are fully production-ready.

**Root Cause**: Procurement was built as a **read-only dashboard layer** over in-memory seed data, not as a **transactional system of record**. The UI displays data beautifully but cannot create, update, approve, or execute anything.

---

## 1. Existing Capabilities

### 1.1 UI Layer (11 Pages, 20 Components)

| Route | Page | Component | Lines | Status |
|---|---|---|---|---|
| `/procurement` | Overview dashboard | `ProcurementOverview` (14 metrics) | 62 | Display-only |
| `/procurement/overview` | Executive summary | `ExecutiveProcurementHeader` (5 KPIs) | 56 | Display-only |
| `/procurement/executive` | C-suite view | `ExecutiveInsights` (6 alert types) | 55 | Display-only |
| `/procurement/approvals` | Approval queue | `ApprovalQueue` (multi-level, delegated) | 31 | Display-only — no approve/reject actions |
| `/procurement/spend-analytics` | Spend analytics | 4 charts (trend, vendor, dept, budget) | 32 | Display-only |
| `/procurement/receiving` | Goods receipt | `ReceivingDashboard` (6 KPIs) | 32 | Display-only — no GRN creation |
| `/procurement/contracts` | Contract management | `ContractCenter` (5 statuses, expiry) | 34 | Display-only |
| `/procurement/purchase-requests` | PR management | `PurchaseRequestBoard` (6 statuses) | 30 | Display-only — no PR creation |
| `/procurement/invoices` | Invoice matching | `InvoiceMatchingCenter` (match score bar) | 31 | Display-only — no invoice creation or match trigger |
| `/procurement/purchase-orders` | PO management | `PurchaseOrderGrid` (8 statuses, received %) | 30 | Display-only — no PO creation |
| `/procurement/vendors` | Vendor registry | `VendorRegistry` (risk, category, rating) | 37 | Display-only — no vendor creation |

### 1.2 Server Domain Model (12 Services)

| Service | File | Lines | Key Methods | Storage |
|---|---|---|---|---|
| `VendorService` | `domain/vendors/vendors-service.ts` | 83 | addVendor, getVendor, getAllVendors, search, count | In-memory Map |
| `PurchaseRequestService` | `domain/purchase-requests/purchase-requests-service.ts` | 57 | addPR, getPR, getAllPRs, convertToPO, count | In-memory Map |
| `PurchaseOrderService` | `domain/purchase-orders/purchase-orders-service.ts` | 54 | addPO, getPO, getAllPOs, count | In-memory Map |
| `ContractService` | `domain/contracts/contracts-service.ts` | 51 | addContract, getContract, getExpiring, count | In-memory Map |
| `CatalogService` | `domain/catalog/catalog-service.ts` | 44 | addItem, getItem, getAllItems, search, count | In-memory Map |
| `ReceivingService` | `domain/receiving/receiving-service.ts` | 48 | addReceipt, getReceipt, getAllReceipts, count | In-memory Map |
| `InvoiceMatchingService` | `domain/invoice-matching/invoice-matching-service.ts` | 126 | addInvoice, perform2WayMatch, perform3WayMatch, getExceptions, count | In-memory Map |
| `ApprovalsService` | `domain/approvals/approvals-service.ts` | 45 | addApproval, getApproval, getAllApprovals, count | In-memory Map |
| `PaymentService` | `domain/payments/payments-service.ts` | 54 | addPayment, getPayment, getAllPayments, count | In-memory Map |
| `ExpenseService` | `domain/expenses/expenses-service.ts` | 61 | addAnalytic, addKPI, addForecast, count | In-memory Map |
| `ProcurementAnalyticsService` | `domain/analytics/analytics-service.ts` | 60 | addAlert, addRecommendation, count | In-memory Map |
| `ProcurementForecastService` | `domain/forecast/forecast-service.ts` | 29 | addForecast, getForecast, count | In-memory Map |
| `GLIntegrationService` | `domain/gl-integration/gl-integration-service.ts` | 126 | generateInvoiceEntry, generatePaymentEntry, generateReceiptEntry | In-memory Map |
| `ProcurementService` | `services/procurement-service.ts` | 68 | Facade aggregating all 12 services | In-memory Map |

### 1.3 Type System

**File**: `src/server/procurement/types/index.ts` (166 lines)

**15 Interfaces**: Vendor, VendorPerformance, VendorDocument, PurchaseRequest, PRItem, PurchaseOrder, POItem, Contract, CatalogItem, Receipt, ReceiptItem, Invoice, InvoiceItem, MatchResult, ApprovalRequest, Payment, SpendAnalytic, ProcurementKPI, ProcurementForecast, ProcurementAlert, ProcurementRecommendation

**16 Type Aliases**: VendorStatus, VendorRiskLevel, VendorCategory, PRStatus, POStatus, POType, ReceiptStatus, ReceiptType, InvoiceStatus, MatchStatus, MatchType, ApprovalStatus, ContractStatus, PaymentStatus, PaymentMethod

### 1.4 Matching Engine

**File**: `src/server/procurement/domain/invoice-matching/invoice-matching-service.ts` (126 lines)

| Method | Comparison | Tolerance | Output |
|---|---|---|---|
| `perform2WayMatch()` | Invoice qty/price vs PO qty/price | 0.01 absolute | MatchResult with matched/exception status |
| `perform3WayMatch()` | Invoice qty vs Receipt qtyAccepted + Invoice price vs PO price | 0.01 absolute | MatchResult with matched/exception status |

**MatchResult type**: matchType, status (pending/matched/exception/resolved), quantityMatch, priceMatch, quantityTolerance, priceTolerance, quantityVariance, priceVariance, discrepancyNotes

### 1.5 GL Integration

**File**: `src/server/procurement/domain/gl-integration/gl-integration-service.ts` (126 lines)

| Entry Type | Debit | Credit | Trigger |
|---|---|---|---|
| Invoice | 5000 (Purchases) | 2000 (Accounts Payable) | Invoice received |
| Payment | 2000 (Accounts Payable) | 1000 (Cash) | Payment sent |
| Receipt | 1300 (Inventory) | 2100 (GR/NI Clearing) | Goods received |

### 1.6 Seed Data

**File**: `src/server/procurement/procurement-seed.ts` (888 lines)

| Entity | Count | Notes |
|---|---|---|
| Vendors | 800 | With performance scores and documents |
| Purchase Requests | 1,500 | With line items |
| Purchase Orders | 1,200 | With line items, 5 types |
| Invoices | 900 | With line items, match status |
| Receipts | 700 | With line items |
| Contracts | 350 | With expiry dates |
| Approvals | 200 | Multi-level, delegated |
| Payments | 500 | 6 methods, status lifecycle |
| Catalog Items | 400 | With categories |
| Spend Analytics | 300 | By dimension |
| KPIs | 16 | Procurement metrics |
| Forecasts | 300 | Spend/savings/orders |
| Alerts | 200 | 7 severity levels |
| Recommendations | 300 | 6 types |

**Total: 5,716+ seeded records**

---

## 2. Missing Capabilities

### 2.1 Infrastructure Gaps (Block Everything)

| # | Gap | Impact | Priority |
|---|---|---|---|
| **IG-1** | **Zero Prisma models** for AP entities | All data lost on restart. No persistence. No audit trail. No multi-tenant isolation. | P0 |
| **IG-2** | **Zero API routes** for procurement | No REST/Next.js endpoints. UI cannot create/update/approve anything. | P0 |
| **IG-3** | **Zero mutation methods** on services | All services are read-only stores. No create/update/delete/approve/reject actions. | P0 |

### 2.2 Workflow Stage Gaps

| # | Target Stage | Current State | Missing |
|---|---|---|---|
| **WS-1** | Vendor | `VendorService` with CRUD methods + `VendorRegistry` UI | Prisma model, API routes, create/edit forms, vendor onboarding wizard, vendor portal |
| **WS-2** | Purchase Order | `PurchaseOrderService` + `PurchaseOrderGrid` UI | Prisma model, API routes, PO creation form, PO approval workflow, PO send-to-vendor |
| **WS-3** | Goods Receipt | `ReceivingService` + `ReceivingDashboard` UI | Prisma model, API routes, GRN creation form, 3-way match trigger, partial receipt support |
| **WS-4** | Invoice Capture | `InvoiceMatchingService` stores invoices | Prisma model, API routes, invoice entry form, **OCR intake** (future), email capture (future) |
| **WS-5** | Invoice Validation | `perform2WayMatch`/`perform3WayMatch` exist | **Wired to UI** (no "Run Match" button), tolerance configuration, validation rules engine |
| **WS-6** | Three-Way Matching | Logic exists in `InvoiceMatchingService` | **Not wired to receipt/invoice/PO creation flow**, no automated match trigger |
| **WS-7** | Exception Queue | `getExceptions()` returns mismatched invoices | **No exception management UI**, no resolve/reassign/override actions |
| **WS-8** | Approval Workflow | `ApprovalsService` tracks approvals | **No approve/reject actions**, no integration with automation-studio approval matrix, no threshold-based routing |
| **WS-9** | Payment Proposal | `PaymentService` stores payments | **No payment proposal generation**, no batch payment runs, no payment date optimization |
| **WS-10** | Treasury Approval | No integration with treasury | No payment approval workflow, no segregation of duties, no dual-signature |
| **WS-11** | Payment Execution | `PaymentService` has status lifecycle | **No execution integration**, no bank API, no idempotency, no confirmation polling |
| **WS-12** | General Ledger Posting | `GLIntegrationService` generates entries | **Not wired** to any service or page, no Prisma persistence, no batch posting |
| **WS-13** | Vendor Statement Reconciliation | No reconciliation for AP | No vendor statement import, no matching to AP ledger, no reconciliation workflow |
| **WS-14** | Audit Evidence | `recordAudit()` exists in infrastructure | **No AP-specific audit events**, no invoice→PO→receipt→payment audit chain |

### 2.3 Feature Gaps

| # | Feature | Current State | Impact |
|---|---|---|---|
| **FG-1** | **Duplicate invoice detection** | No algorithm exists. Only a seed alert label. | Duplicate payment risk — #1 AP fraud vector |
| **FG-2** | **Payment scheduling / early-pay discount** | `PaymentService.getScheduled()` exists but no scheduling engine | Cannot optimize payment timing for discounts |
| **FG-3** | **Invoice OCR / capture** | Not implemented | Manual data entry for all invoices |
| **FG-4** | **GRN automation** | `ReceivingDashboard` is display-only | No barcode/PO integration, no automated GRN creation |
| **FG-5** | **Vendor self-service portal** | Not implemented | Vendors call to check payment status |
| **FG-6** | **Tolerance rules** | Hardcoded 0.01 in matching | No configurable tolerance per vendor/category/amount |
| **FG-7** | **Exception management** | `getExceptions()` returns data but no management UI | Exceptions pile up with no resolution workflow |
| **FG-8** | **Multi-currency invoices** | `Invoice` type has `currency` field but no FX conversion | Cannot handle foreign vendor invoices |
| **FG-9** | **Withholding tax** | Not implemented | Cannot withhold tax on vendor payments |
| **FG-10** | **Partial payments** | `Payment` type exists but no partial payment logic | Cannot pay portion of an invoice |
| **FG-11** | **Split allocations** | Not implemented | Cannot split invoice across multiple cost centers |
| **FG-12** | **Recurring invoices** | Not implemented | Cannot handle subscription/recurring vendor bills |
| **FG-13** | **Blocked invoices** | Not implemented | Cannot block invoices pending investigation |
| **FG-14** | **Budget check** | `BudgetConsumptionChart` exists but not wired to invoice approval | Invoices approved without budget validation |
| **FG-15** | **Vendor credit notes** | Not implemented | Cannot apply vendor credits against invoices |
| **FG-16** | **Audit timeline** | No AP-specific audit chain | Cannot reconstruct invoice→payment lifecycle |
| **FG-17** | **Explainability** | No recommendation reasoning on AP actions | AP manager cannot explain why an invoice was flagged |

### 2.4 Integration Gaps

| # | Integration | Current State | Impact |
|---|---|---|---|
| **INT-1** | **GL → AP subledger** | `GLIntegrationService` creates entries but not persisted | No GL→AP reconciliation |
| **INT-2** | **Approval matrix** | `ApprovalsService` is separate from `automation-studio/approval-matrix/` | No threshold-based approval routing |
| **INT-3** | **Treasury payments** | `PaymentService` is separate from treasury module | Payment execution disconnected from cash position |
| **INT-4** | **Budget system** | `Budget` Prisma model exists but not checked during invoice approval | Invoices approved without budget coverage |
| **INT-5** | **Workflow engine** | `WorkflowEngine` exists but not wired to P2P | No orchestrated P2P workflow |
| **INT-6** | **Notification service** | `NotificationService` exists but not wired to AP events | No invoice arrival, approval needed, payment sent notifications |
| **INT-7** | **Audit service** | `recordAudit()` exists but not called in AP services | No AP audit trail |
| **INT-8** | **AI provider** | `aiProviderRegistry` exists but not used for AP | No duplicate detection, no coding suggestions, no anomaly detection |

---

## 3. Current Workflow (As-Is)

The current AP workflow is **manual and disconnected**:

```
[Manual] Vendor created in seed data
    ↓
[Manual] Purchase requisition created in seed data
    ↓
[Manual] PR converted to PO in seed data
    ↓
[Manual] PO "sent" in seed data
    ↓
[Manual] Receipt created in seed data
    ↓
[Manual] Invoice created in seed data
    ↓
[Manual] Match result computed at seed time (not on-demand)
    ↓
[Manual] Approval record created in seed data
    ↓
[Manual] Payment created in seed data
    ↓
[No trigger] GL integration service exists but never called
    ↓
[Nonexistent] Vendor statement reconciliation
    ↓
[Nonexistent] Audit evidence chain
```

**Every step is seeded data.** No user action triggers any state change. The workflow is a **static display**, not a **dynamic process**.

---

## 4. Target Workflow (To-Be)

```
Vendor (onboarded, vetted, active)
    ↓ [VendorService.create + recordAudit]
Purchase Request (submitted by requester)
    ↓ [PurchaseRequestService.create + budget check]
PR Approval (threshold-based routing)
    ↓ [ApprovalWorkflowEngine.route + recordAudit]
Purchase Order (generated from approved PR)
    ↓ [PurchaseOrderService.create + send to vendor]
Goods Receipt (received against PO)
    ↓ [ReceivingService.create + triggers 3-way match]
Invoice Capture (entered or OCR'd)
    ↓ [InvoiceService.create + duplicate detection]
Invoice Validation (automated 3-way match)
    ↓ [InvoiceMatchingService.match + tolerance rules]
Exception Queue (mismatched invoices flagged)
    ↓ [ExceptionService.create + assign to AP clerk]
Approval Workflow (multi-level, delegated, escalated)
    ↓ [ApprovalWorkflowEngine.route + threshold routing]
Payment Proposal (batch run with discount optimization)
    ↓ [PaymentService.propose + early-pay analysis]
Treasury Approval (segregation of duties)
    ↓ [TreasuryService.approve + dual-signature if >threshold]
Payment Execution (bank API or manual)
    ↓ [PaymentService.execute + idempotency + confirmation]
General Ledger Posting (automated journal entries)
    ↓ [GLIntegrationService.post + Prisma persistence]
Vendor Statement Reconciliation (periodic matching)
    ↓ [ReconciliationService.match + exception handling]
Audit Evidence (complete chain from PO to payment)
    ↓ [recordAudit at every transition]
```

---

## 5. Gap Summary

### By Category

| Category | Existing | Missing | Gap % |
|---|---|---|---|
| Prisma Models | 0 | 12+ | 100% |
| API Routes | 0 | 14+ | 100% |
| Mutation Methods | 0 | 30+ | 100% |
| UI Pages | 11 (display-only) | 11 (action-capable) | 0% action |
| Components | 20 (display-only) | 15+ (forms, wizards) | 0% interactive |
| Domain Services | 12 (read-only) | 12 (read-write) | 0% mutable |
| Workflow Stages | 0 complete | 14 | 100% incomplete |
| Integrations | 0 wired | 8 | 100% disconnected |

### By Priority

| Priority | Count | Items |
|---|---|---|
| **P0 (Block production)** | 6 | Prisma models, API routes, mutation methods, 3-way match wiring, approval actions, GL posting wiring |
| **P1 (Enterprise grade)** | 6 | Duplicate detection, payment scheduling, exception management, tolerance rules, budget check, audit chain |
| **P2 (Competitive parity)** | 5 | OCR, GRN automation, vendor portal, multi-currency, withholding tax |
| **P3 (Differentiation)** | 4 | Partial payments, split allocations, recurring invoices, vendor credit notes |

---

## 6. Financial Precision Risk

**WF-022 finding**: PO totals stored as native `number` in procurement types. This creates precision risk for financial values.

**Required fix**: All monetary fields in procurement types must use `Prisma.Decimal` or the `financial-precision.ts` helpers (`financialRound`, `sumDecimals`, `multiplyDecimals`).

**Affected types**: POItem.unitPrice, POItem.totalAmount, InvoiceItem.unitPrice, InvoiceItem.totalAmount, Payment.amount, MatchResult.priceVariance, all KPI/forecast values.

---

*End of Phase 21.0 — Accounts Payable Gap Analysis*
