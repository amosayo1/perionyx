# Accounts Payable — Bounded Context Architecture

> **Phase**: 21A.0 — Architecture Specification (Documentation Only)
> **Date**: July 21, 2026
> **Status**: Authoritative — governs all Phase 21A–21D implementation
> **Supersedes**: In-memory procurement scaffolding at `src/server/procurement/`

---

## Table of Contents

1. [Bounded Context Definition](#1-bounded-context-definition)
2. [Context Map](#2-context-map)
3. [Module Structure](#3-module-structure)
4. [Dependency Rules](#4-dependency-rules)
5. [Data Ownership](#5-data-ownership)
6. [Technology Decisions](#6-technology-decisions)
7. [Future Evolution](#7-future-evolution)

---

## 1. Bounded Context Definition

### 1.1 Mission Statement

The Accounts Payable (AP) bounded context is the **single system of record** for all vendor-related financial obligations, from purchase request through payment execution and GL posting. It transforms Perionyx from a read-only procurement dashboard into a transactional procure-to-pay engine that CFOs, Controllers, and AP Managers can trust for daily operations.

### 1.2 Responsibilities — What Belongs Inside AP

| Capability | Scope | Entities Owned |
|---|---|---|
| Vendor lifecycle | Onboarding, due diligence, risk scoring, suspension, reactivation | `Vendor`, `VendorDocument`, `VendorPerformance` |
| Purchase requisition | Request creation, budget validation, multi-level approval routing | `PurchaseRequest`, `PurchaseRequestItem` |
| Purchase ordering | PO creation, vendor acknowledgment, delivery tracking | `PurchaseOrder`, `PurchaseOrderItem` |
| Goods receiving | GRN creation, quantity inspection, acceptance/rejection | `GoodsReceipt`, `GoodsReceiptItem` |
| Invoice processing | Capture, validation, duplicate detection, coding | `Invoice`, `InvoiceItem` |
| Match engine | 2-way (Invoice↔PO) and 3-way (Invoice↔PO↔GRN) matching with configurable tolerances | `MatchResult`, `MatchException` |
| Exception management | Queue triage, SLA tracking, pattern detection, resolution workflows | `Exception`, `ExceptionActivity` |
| Approval workflow | Threshold-routed, delegation-aware, escalation-enabled approval chains | `ApprovalRecord`, `ApprovalChain` |
| Payment processing | Proposal generation, batch scheduling, dual-signature, idempotent execution | `Payment`, `PaymentProposal`, `PaymentBatch` |
| GL integration | Journal entry generation, sub-ledger posting, reversal entries | `APJournalEntry` (references GL context) |
| Vendor reconciliation | Statement matching, balance verification, discrepancy resolution | `VendorStatement`, `ReconciliationResult` |
| AP analytics | Aging, DPO, spend analysis, early payment discount optimization | `APAging`, `APMetric` |

### 1.3 Explicit Exclusions — What Does NOT Belong Inside AP

| Capability | Owner | Why It's Outside AP |
|---|---|---|
| Chart of Accounts / Journal posting | GL Bounded Context | AP generates draft entries; GL owns the ledger |
| Budget reservation / enforcement | Budget / FPA Context | AP validates budget availability but doesn't own budget lines |
| Treasury payment execution | Treasury Bounded Context | AP creates payment proposals; Treasury executes bank transfers |
| Employee / User management | Identity / IAM Context | AP references userId, never stores employee records |
| Bank account details | Banking Context | AP references bankAccountId, never stores account numbers |
| Tax calculation engine | Tax Context | AP applies tax amounts; Tax engine computes rates |
| Currency exchange rates | FX / Treasury Context | AP applies rates; FX service provides them |
| Approval matrix definition | Automation Studio Context | AP consumes rules; Automation Studio owns the matrix |
| Workflow orchestration | Workflow Engine Context | AP triggers workflows; Workflow Engine executes them |
| Notification delivery | Notification Context | AP emits events; Notification Context delivers them |
| AI duplicate detection | Intelligence Context | AP provides data; AI Context runs detection models |
| OCR / document extraction | Intelligence Context | AP stores results; AI Context performs extraction |

### 1.4 Dependencies on Other Bounded Contexts

| Bounded Context | What AP Needs | Interface Type | Stability |
|---|---|---|---|
| **GL / Accounting** | Account lookup, journal posting, period status check | Typed function calls | Frozen (v1.0) |
| **Treasury** | Payment execution, bank account status, cash position | Typed function calls | Frozen (v1.0) |
| **Approval Workflow** | Matrix evaluation, delegation rules, escalation | Typed function calls | Frozen (v1.0) |
| **Budget / FPA** | Budget line availability, spend tracking | Typed function calls | Stable |
| **Identity / IAM** | User lookup, role verification, permission checks | Typed function calls | Frozen (v1.0) |
| **Notification** | Approval requests, exception alerts, payment confirmations | Typed function calls | Stable |
| **Audit** | Audit trail recording, compliance evidence | Typed function calls | Frozen (v1.0) |
| **Intelligence** | Duplicate detection, spend pattern analysis | Typed function calls | Experimental |
| **Banking** | Bank account validation, statement import | Typed function calls | Stable |

### 1.5 Integration Boundaries

```
┌──────────────────────────────────────────────────────────────────┐
│                     AP BOUNDED CONTEXT                           │
│                                                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │ Vendor  │→ │   PR    │→ │   PO    │→ │  GRN    │           │
│  │ Onboard │  │ Create  │  │ Create  │  │ Receive │           │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘           │
│       │            │             │             │                  │
│       ▼            ▼             ▼             ▼                  │
│  ┌─────────────────────────────────────────────────┐            │
│  │              Invoice Processing                  │            │
│  │  Capture → Validate → Match → Exception → Approve│            │
│  └─────────────────────────────────────────────────┘            │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐                       │
│  │ Payment │→ │ GL Entry │→ │ Vendor   │                       │
│  │ Execute │  │ Post     │  │ Reconcile│                       │
│  └─────────┘  └──────────┘  └──────────┘                       │
│                                                                  │
│  ─ ─ ─ ─ ─ ─ ─ BOUNDARY (typed function calls only) ─ ─ ─ ─ ─│
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │    GL    │ │ Treasury │ │ Approval │ │ Budget   │          │
│  │ Context  │ │ Context  │ │ Workflow │ │ Context  │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└──────────────────────────────────────────────────────────────────┘
```

### 1.6 Published Domain Events

AP publishes the following events for consumption by other bounded contexts:

| Event | Payload | Consumers | Trigger |
|---|---|---|---|
| `VendorCreated` | vendorId, companyId, vendorName, riskScore | Intelligence (duplicate scan) | Vendor onboarded |
| `VendorStatusChanged` | vendorId, previousStatus, newStatus, reason | Notification, Procurement | Suspension/reactivation |
| `PurchaseRequestSubmitted` | prId, requesterId, totalAmount, department | Approval Workflow, Budget | PR submitted |
| `PurchaseRequestApproved` | prId, approvedBy, level, totalAmount | Procurement (convert to PO) | PR approved |
| `PurchaseOrderCreated` | poId, vendorId, totalAmount, department | Notification (vendor), Budget | PO created |
| `PurchaseOrderSent` | poId, vendorId | Notification (vendor) | PO sent to vendor |
| `GoodsReceiptRecorded` | grnId, poId, vendorId, receivedItems | Invoice Matching (trigger match) | GRN posted |
| `InvoiceSubmitted` | invoiceId, vendorId, poId, totalAmount | Duplicate Detection, Exception | Invoice entered |
| `InvoiceMatched` | invoiceId, matchType, matchScore, matchResultId | Exception (if exception), Approval | Match completed |
| `InvoiceApproved` | invoiceId, approvedBy, totalAmount | Payment (proposal eligible) | Invoice approved |
| `InvoiceRejected` | invoiceId, rejectedBy, reason | Notification, Exception | Invoice rejected |
| `MatchExceptionCreated` | exceptionId, invoiceId, matchType, varianceAmount | Notification, Intelligence | Match failed |
| `ExceptionResolved` | exceptionId, resolution, resolvedBy | Notification | Exception resolved |
| `PaymentProposalCreated` | proposalId, paymentCount, totalAmount, scheduledDate | Treasury, Notification | Proposal generated |
| `PaymentExecuted` | paymentId, invoiceId, amount, method, executedAt | GL (post entry), Notification | Payment confirmed |
| `PaymentFailed` | paymentId, invoiceId, failureReason | Notification, Exception | Payment failed |
| `APJournalEntryGenerated` | entryId, type, referenceId, debitAccount, creditAmount | GL (receive for posting) | Entry generated |
| `VendorStatementReceived` | statementId, vendorId, statementDate | Reconciliation | Statement uploaded |
| `ReconciliationCompleted` | reconciliationId, vendorId, discrepancies, resolution | Notification, Audit | Reconciliation done |

### 1.7 Consumed Domain Events

| Event | Source Context | AP Action |
|---|---|---|
| `BudgetLineReserved` | Budget Context | Link PR to reserved budget line |
| `BudgetLineReleased` | Budget Context | Release budget reservation on PR cancellation |
| `ApprovalMatrixUpdated` | Automation Studio | Refresh cached approval rules |
| `PaymentExecuted` | Treasury Context | Update payment status to COMPLETED |
| `PaymentFailed` | Treasury Context | Update payment status, create exception |
| `BankStatementImported` | Banking Context | Trigger vendor reconciliation |
| `PeriodClosed` | GL Context | Block AP entries for closed periods |
| `UserRoleChanged` | Identity / IAM | Re-evaluate approval delegation rules |
| `ExchangeRateUpdated` | FX / Treasury | Update multi-currency invoice valuations |
| `EmployeeTerminated` | Identity / IAM | Reassign pending approvals |

---

## 2. Context Map

### 2.1 Relationship Definitions

```
                    ┌───────────────────────┐
                    │   Automation Studio   │
                    │ (Approval Matrix)     │
                    └───────────┬───────────┘
                                │ Partnership
                                │ (defines rules AP consumes)
                                ▼
┌────────────┐    Customer-Supplier    ┌────────────┐    Customer-Supplier    ┌──────────┐
│   Budget   │ ──────────────────────→ │            │ ──────────────────────→ │ Treasury │
│  Context   │    (availability check) │            │   (payment execution)   │ Context  │
└────────────┘                         │            │                         └──────────┘
                                       │     AP     │
┌────────────┐    Customer-Supplier    │  Bounded   │    Customer-Supplier    ┌──────────┐
│  Identity  │ ──────────────────────→ │  Context   │ ──────────────────────→ │    GL    │
│  / IAM     │    (user lookup)        │            │   (journal posting)     │ Context  │
└────────────┘                         │            │                         └──────────┘
                                       │            │
┌────────────┐    Customer-Supplier    │            │    Customer-Supplier    ┌──────────┐
│Notification│ ←────────────────────── │            │ ──────────────────────→ │   Audit  │
│  Context   │    (alerts, approvals)  │            │   (trail recording)     │ Context  │
└────────────┘                         └────────────┘                         └──────────┘
                                            │
                                            │ Partnership / Open Host Service
                                            ▼
                                       ┌──────────┐
                                       │   Bank   │
                                       │ Context  │
                                       └──────────┘
```

### 2.2 Relationship Types

| Bounded Context | Relationship | Pattern | Rationale |
|---|---|---|---|
| **GL / Accounting** | Customer-Supplier | Anti-Corruption Layer | AP submits journal entries in GL's format; GL never reaches into AP data. AP translates its domain events into GL's `JournalEntry` format. |
| **Treasury** | Customer-Supplier | Anti-Corruption Layer | AP creates `PaymentProposal` with amounts/dates/bank refs; Treasury translates into bank-specific formats. AP never calls bank APIs directly. |
| **Approval Workflow** | Partnership | Open Host Service | AP and Approval Workflow co-evolve. AP sends entity metadata; Approval Workflow returns routing decisions. Shared `ApprovalRecord` type at boundary. |
| **Budget / FPA** | Customer-Supplier | Conformist | AP conforms to Budget's interface for availability checks and reservations. AP does not own budget logic. |
| **Identity / IAM** | Customer-Supplier | Conformist | AP calls IAM for user lookup and role verification. AP never stores employee data — only `userId` references. |
| **Notification** | Customer-Supplier | Open Host Service | AP publishes events; Notification Context subscribes and delivers. Loose coupling via typed event interfaces. |
| **Audit** | Customer-Supplier | Conformist | AP calls `recordAudit()` with standardized payloads. AP does not own audit storage or retention. |
| **Intelligence** | Partnership | Anti-Corruption Layer | AP provides structured data; Intelligence returns predictions/classifications. AI never acts autonomously — recommendations only. |
| **Banking** | Customer-Supplier | Anti-Corruption Layer | AP references `bankAccountId`; Banking owns account details. AP never stores account numbers or routing codes. |

### 2.3 Integration Patterns

| Pattern | Where Used | Mechanism |
|---|---|---|
| **Synchronous call** | GL account lookup, user lookup, budget check, approval matrix evaluation | Direct typed function call within same process (modular monolith) |
| **Event emission** | Invoice submitted, payment executed, exception created | In-process typed event bus (not message queue) |
| **Shared types** | `CompanyId`, `UserId`, `ApprovalDecision` | Published in each context's `types/index.ts`, consumed via import |
| **ACL translation** | GL entry generation, payment proposal formatting | AP-specific adapter that translates AP domain types into target context's format |
| **Idempotency** | Payment execution | `idempotencyKey` unique constraint — duplicate submission returns existing result |

**Note**: Per the Governance Constitution's Modular Monolith constraint, all inter-context communication happens within a single Node.js process via typed function calls. There are no HTTP calls, no message queues, and no event brokers between contexts. Events are in-process signals, not durable messages.

---

## 3. Module Structure

### 3.1 Directory Layout

```
src/server/ap/                              # AP bounded context — server side
├── types/
│   ├── index.ts                            # All AP domain types, status enums, interfaces
│   └── events.ts                           # Published and consumed event type definitions
│
├── domain/
│   ├── vendor/
│   │   ├── vendor.service.ts               # Vendor CRUD, onboarding, risk scoring
│   │   └── vendor.types.ts                 # Vendor-specific value objects (VendorRisk, VendorStatus)
│   │
│   ├── purchase-request/
│   │   ├── purchase-request.service.ts     # PR lifecycle (create, submit, cancel)
│   │   └── purchase-request.types.ts       # PR-specific value objects
│   │
│   ├── purchase-order/
│   │   ├── purchase-order.service.ts       # PO lifecycle (create, approve, send, close)
│   │   └── purchase-order.types.ts         # PO-specific value objects
│   │
│   ├── goods-receipt/
│   │   ├── goods-receipt.service.ts        # GRN lifecycle (receive, inspect, accept/reject)
│   │   └── goods-receipt.types.ts          # GRN-specific value objects
│   │
│   ├── invoice/
│   │   ├── invoice.service.ts              # Invoice CRUD, validation, duplicate detection
│   │   ├── invoice-matching.service.ts     # 2-way and 3-way match engine (rewritten from procurement)
│   │   ├── invoice-types.ts                # Invoice, MatchResult, MatchException types
│   │   └── match-tolerance.config.ts       # Configurable tolerance rules per vendor/category
│   │
│   ├── exception/
│   │   ├── exception.service.ts            # Exception queue, triage, SLA, resolution
│   │   ├── exception-types.ts              # Exception, ExceptionActivity types
│   │   └── exception-patterns.ts           # Pattern detection (recurring variances, vendor trends)
│   │
│   ├── approval/
│   │   ├── approval.service.ts             # AP-specific approval orchestration
│   │   └── approval-types.ts               # ApprovalRecord, ApprovalChain types
│   │
│   ├── payment/
│   │   ├── payment.service.ts              # Payment lifecycle (propose, approve, execute, confirm)
│   │   ├── payment-proposal.service.ts     # Batch proposal generation, scheduling
│   │   └── payment-types.ts                # Payment, PaymentProposal, PaymentBatch types
│   │
│   ├── reconciliation/
│   │   ├── reconciliation.service.ts       # Vendor statement matching, balance verification
│   │   └── reconciliation-types.ts         # VendorStatement, ReconciliationResult types
│   │
│   └── gl-integration/
│       ├── ap-gl-adapter.ts                # Translates AP events into GL journal entries
│       └── gl-integration-types.ts         # APJournalEntry, PostingRequest types
│
├── repositories/
│   ├── ap-vendor.repository.ts             # Prisma CRUD for ProcurementVendor
│   ├── ap-purchase-request.repository.ts   # Prisma CRUD for ProcurementPR + PRItem
│   ├── ap-purchase-order.repository.ts     # Prisma CRUD for ProcurementPO + POItem
│   ├── ap-goods-receipt.repository.ts      # Prisma CRUD for ProcurementGRN + GRNItem
│   ├── ap-invoice.repository.ts            # Prisma CRUD for ProcurementInvoice + InvoiceItem
│   ├── ap-match-result.repository.ts       # Prisma CRUD for ProcurementMatchResult
│   ├── ap-exception.repository.ts          # Prisma CRUD for ProcurementException
│   ├── ap-approval-record.repository.ts    # Prisma CRUD for ProcurementApprovalRecord
│   ├── ap-payment.repository.ts            # Prisma CRUD for ProcurementPayment
│   ├── ap-payment-proposal.repository.ts   # Prisma CRUD for ProcurementPaymentProposal
│   ├── ap-vendor-statement.repository.ts   # Prisma CRUD for ProcurementVendorStatement
│   └── ap-journal-entry.repository.ts      # Prisma CRUD for ProcurementAPJournalEntry
│
├── services/
│   └── ap.service.ts                       # Facade — orchestrates domain services for API routes
│
├── migrations/
│   └── README.md                           # Migration naming convention and ordering
│
└── index.ts                                # Barrel export — public API of the AP context

src/app/api/v1/ap/                          # API routes — REST endpoints
├── vendors/
│   ├── route.ts                            # GET (list), POST (create)
│   └── [vendorId]/
│       ├── route.ts                        # GET (detail), PUT (update), DELETE (deactivate)
│       └── documents/
│           └── route.ts                    # GET (list), POST (upload)
│
├── purchase-requests/
│   ├── route.ts                            # GET (list), POST (create)
│   └── [prId]/
│       ├── route.ts                        # GET (detail), PUT (update), DELETE (cancel)
│       └── submit/
│           └── route.ts                    # POST (submit for approval)
│
├── purchase-orders/
│   ├── route.ts                            # GET (list), POST (create from PR)
│   └── [poId]/
│       ├── route.ts                        # GET (detail), PUT (update), DELETE (cancel)
│       ├── approve/
│       │   └── route.ts                    # POST (approve PO)
│       └── send/
│           └── route.ts                    # POST (send to vendor)
│
├── goods-receipts/
│   ├── route.ts                            # GET (list), POST (create)
│   └── [grnId]/
│       └── route.ts                        # GET (detail), PUT (inspect/accept/reject)
│
├── invoices/
│   ├── route.ts                            # GET (list), POST (create/submit)
│   ├── [invoiceId]/
│   │   ├── route.ts                        # GET (detail), PUT (update), DELETE (void)
│   │   ├── match/
│   │   │   └── route.ts                    # POST (trigger 2-way or 3-way match)
│   │   └── approve/
│   │       └── route.ts                    # POST (approve for payment)
│   └── duplicate-check/
│       └── route.ts                        # POST (check for duplicates before create)
│
├── match/
│   └── tolerance/
│       └── route.ts                        # GET (config), PUT (update tolerances)
│
├── exceptions/
│   ├── route.ts                            # GET (list with filters), POST (manual create)
│   └── [exceptionId]/
│       ├── route.ts                        # GET (detail), PUT (resolve/reassign)
│       └── activities/
│           └── route.ts                    # GET (history), POST (add note/action)
│
├── payments/
│   ├── route.ts                            # GET (list), POST (create individual)
│   ├── proposals/
│   │   ├── route.ts                        # GET (list), POST (generate proposal)
│   │   └── [proposalId]/
│   │       ├── route.ts                    # GET (detail), DELETE (cancel)
│   │       └── execute/
│   │           └── route.ts                # POST (execute proposal → Treasury)
│   └── [paymentId]/
│       └── route.ts                        # GET (detail), POST (confirm/fail)
│
├── reconciliation/
│   ├── route.ts                            # GET (list), POST (upload statement)
│   └── [reconciliationId]/
│       └── route.ts                        # GET (detail), POST (resolve discrepancies)
│
├── aging/
│   └── route.ts                            # GET (AP aging report)
│
└── analytics/
    ├── route.ts                            # GET (AP KPIs, DPO, spend trends)
    └── export/
        └── route.ts                        # GET (CSV/Excel export)

src/components/ap/                          # UI components — client-side
├── vendor/
│   ├── vendor-list.tsx                     # Vendor registry table with search/filter
│   ├── vendor-detail.tsx                   # Vendor profile with performance metrics
│   ├── vendor-form.tsx                     # Create/edit vendor (EnterpriseForm)
│   └── vendor-risk-badge.tsx               # Risk score visualization
│
├── purchase-request/
│   ├── pr-list.tsx                         # PR table with status filters
│   ├── pr-detail.tsx                       # PR detail with line items and approval chain
│   ├── pr-form.tsx                         # Create/edit PR (EnterpriseForm)
│   └── pr-approval-card.tsx                # Approval action card (approve/reject/escalate)
│
├── purchase-order/
│   ├── po-list.tsx                         # PO table with received % indicators
│   ├── po-detail.tsx                       # PO detail with GRN progress
│   ├── po-form.tsx                         # Create/edit PO (EnterpriseForm)
│   └── po-send-dialog.tsx                  # Confirm send to vendor
│
├── goods-receipt/
│   ├── grn-list.tsx                        # GRN table with inspection status
│   ├── grn-form.tsx                        # Create GRN (quantity entry per PO line)
│   └── grn-inspection.tsx                  # Inspection form (accept/reject per item)
│
├── invoice/
│   ├── invoice-list.tsx                    # Invoice table with match status badges
│   ├── invoice-detail.tsx                  # Invoice detail with match results
│   ├── invoice-form.tsx                    # Create/edit invoice (EnterpriseForm)
│   ├── invoice-match-panel.tsx             # Match results display (2-way/3-way)
│   └── invoice-duplicate-alert.tsx         # Duplicate detection warning
│
├── exception/
│   ├── exception-queue.tsx                 # Exception list with SLA indicators
│   ├── exception-detail.tsx                # Exception detail with activity timeline
│   ├── exception-resolution-form.tsx       # Resolution form (resolve/reassign/escalate)
│   └── exception-pattern-card.tsx          # Pattern detection visualization
│
├── payment/
│   ├── payment-list.tsx                    # Payment table with status timeline
│   ├── payment-detail.tsx                  # Payment detail with approval chain
│   ├── payment-proposal-form.tsx           # Generate batch proposal
│   └── payment-execute-dialog.tsx          # Confirm execution (dual-signature)
│
├── reconciliation/
│   ├── reconciliation-list.tsx             # Reconciliation status table
│   ├── reconciliation-detail.tsx           # Statement vs. book balance comparison
│   └── reconciliation-resolve-form.tsx     # Discrepancy resolution
│
├── analytics/
│   ├── ap-aging-report.tsx                 # Aging buckets with drill-down
│   ├── ap-dpo-metric.tsx                   # Days Payable Outstanding trend
│   ├── ap-spend-analytics.tsx              # Spend by vendor/category/period
│   └── ap-executive-summary.tsx            # AP dashboard KPIs
│
└── shared/
    ├── ap-status-badge.tsx                 # Unified status badge (entity + status)
    ├── ap-currency-display.tsx             # Financial-precision currency renderer
    ├── ap-approval-chain.tsx               # Shared approval chain visualization
    └── ap-audit-trail.tsx                  # Shared audit trail timeline

src/app/(shell)/ap/                         # Pages — server components
├── page.tsx                                # AP Dashboard (overview + KPIs)
├── vendors/
│   ├── page.tsx                            # Vendor registry
│   └── [vendorId]/
│       └── page.tsx                        # Vendor detail
├── purchase-requests/
│   ├── page.tsx                            # PR list
│   └── [prId]/
│       └── page.tsx                        # PR detail
├── purchase-orders/
│   ├── page.tsx                            # PO list
│   └── [poId]/
│       └── page.tsx                        # PO detail
├── goods-receipts/
│   ├── page.tsx                            # GRN list
│   └── [grnId]/
│       └── page.tsx                        # GRN detail
├── invoices/
│   ├── page.tsx                            # Invoice list
│   └── [invoiceId]/
│       └── page.tsx                        # Invoice detail
├── exceptions/
│   ├── page.tsx                            # Exception queue
│   └── [exceptionId]/
│       └── page.tsx                        # Exception detail
├── payments/
│   ├── page.tsx                            # Payment list
│   ├── proposals/
│   │   ├── page.tsx                        # Payment proposals
│   │   └── [proposalId]/
│   │       └── page.tsx                    # Proposal detail
│   └── [paymentId]/
│       └── page.tsx                        # Payment detail
├── reconciliation/
│   ├── page.tsx                            # Reconciliation list
│   └── [reconciliationId]/
│       └── page.tsx                        # Reconciliation detail
├── aging/
│   └── page.tsx                            # AP aging report
└── analytics/
    └── page.tsx                            # AP analytics
```

### 3.2 Module Organization Principles

| Principle | Implementation |
|---|---|
| **Domain services own business rules** | `domain/*/` services contain all match logic, approval routing, payment scheduling. No business rules in repositories or API routes. |
| **Repositories own persistence** | `repositories/` files contain Prisma queries, type mapping (domain↔Prisma), and pagination. No business logic. |
| **API routes own HTTP concerns** | `src/app/api/v1/ap/` routes handle request parsing, Zod validation, response formatting, auth/authz. No business logic — delegates to `ap.service.ts` facade. |
| **Facade owns orchestration** | `services/ap.service.ts` coordinates multiple domain services for complex operations (e.g., "submit invoice" calls validation + duplicate check + match + exception creation). |
| **Pages own server-side data fetching** | `src/app/(shell)/ap/` pages are Server Components that call the facade or repositories directly for initial data. |
| **Components own rendering** | `src/components/ap/` are Client Components for interactive UI. No data fetching — receive props from pages. |
| **Types are shared** | `types/index.ts` defines all public types. Domain services may have private value objects in their own `types.ts` files. |

### 3.3 Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Prisma model | `Procurement` prefix, PascalCase | `ProcurementVendor`, `ProcurementInvoice` |
| Repository class | `Ap` prefix + entity + `Repository` | `ApVendorRepository`, `ApInvoiceRepository` |
| Domain service | Entity name + `Service` | `VendorService`, `InvoiceMatchingService` |
| API route group | Lowercase, plural | `/api/v1/ap/vendors`, `/api/v1/ap/invoices` |
| UI component | Entity name + role + `.tsx` | `vendor-list.tsx`, `invoice-match-panel.tsx` |
| Status enum | SCREAMING_SNAKE_CASE | `PENDING_APPROVAL`, `MATCHED`, `EXECUTING` |
| Domain event | PascalCase past tense | `InvoiceSubmitted`, `PaymentExecuted` |
| Zod schema | Entity + action | `CreateVendorSchema`, `ApproveInvoiceSchema` |

---

## 4. Dependency Rules

### 4.1 What AP Can Depend On

| Dependency | Interface | Source |
|---|---|---|
| `GLService.createJournalEntry(entry)` | Synchronous, returns `JournalEntry` | `src/server/gl/services/` |
| `GLService.getAccountByNumber(number)` | Synchronous, returns `Account` | `src/server/gl/services/` |
| `GLService.isPeriodOpen(periodId)` | Synchronous, returns `boolean` | `src/server/gl/services/` |
| `TreasuryService.executePayment(proposal)` | Synchronous, returns `PaymentResult` | `src/server/treasury/services/` |
| `TreasuryService.getBankAccountStatus(accountId)` | Synchronous, returns `BankAccountStatus` | `src/server/treasury/services/` |
| `ApprovalMatrixEvaluator.evaluate(entity)` | Synchronous, returns `ApprovalRoute` | `src/modules/automation-studio/approval-matrix-evaluator.ts` |
| `BudgetService.checkAvailability(lineId, amount)` | Synchronous, returns `BudgetCheckResult` | Budget context |
| `BudgetService.reserve(lineId, amount)` | Synchronous, returns `Reservation` | Budget context |
| `BudgetService.release(reservationId)` | Synchronous, returns `void` | Budget context |
| `UserService.getById(userId)` | Synchronous, returns `User` | `src/modules/users/` |
| `recordAudit(event, payload)` | Synchronous, returns `void` | `src/modules/audit/` |
| `NotificationService.send(template, recipients)` | Synchronous, returns `void` | `src/modules/notifications/` |
| `financialRound(amount, precision)` | Synchronous, returns `number` | `src/lib/financial-precision.ts` |
| `sumDecimals(values)` | Synchronous, returns `Decimal` | `src/lib/financial-precision.ts` |
| `multiplyDecimals(a, b)` | Synchronous, returns `Decimal` | `src/lib/financial-precision.ts` |

### 4.2 What AP Cannot Depend On

| Forbidden Dependency | Why |
|---|---|
| Internal implementation of GL (e.g., Prisma models, raw queries) | AP must use GL's published service interface only |
| Internal implementation of Treasury (e.g., bank API clients, PgBoss queue) | AP must use Treasury's published service interface only |
| Approval matrix internal storage (in-memory Map) | AP must use the evaluator's public `evaluate()` method |
| Other contexts' Prisma client calls | All data access goes through repositories; cross-context queries go through service interfaces |
| `Number()` conversion in business logic | All monetary operations use `Prisma.Decimal` arithmetic |
| `any` type | TypeScript strict mode — zero tolerance |
| `console.log` / `console.error` | Use Pino logger from `src/server/` infrastructure |

### 4.3 Communication Patterns

| Pattern | Direction | Example |
|---|---|---|
| **Direct function call** | AP → GL | `glAdapter.createJournalEntry(apEntry)` |
| **Direct function call** | AP → Treasury | `treasuryService.executePayment(proposal)` |
| **Direct function call** | AP ← Automation Studio | `approvalEvaluator.evaluate(prEntity)` |
| **Event publication** | AP → Notification | `eventBus.emit('InvoiceSubmitted', payload)` |
| **Event consumption** | AP ← GL | `eventBus.on('PeriodClosed', handler)` |
| **Shared type import** | AP → IAM | `import { UserId } from '@/modules/users/types'` |
| **ACL adapter** | AP → GL | `ApGlAdapter.toJournalEntry(invoice)` translates AP types to GL format |

### 4.4 Anti-Corruption Layer Specification

The AP→GL adapter (`ap-gl-adapter.ts`) is the primary ACL:

```
AP Domain Types                    GL Domain Types
─────────────                      ────────────────
Invoice → GLAdapter.toJournalEntry() → JournalEntry
Payment → GLAdapter.toJournalEntry() → JournalEntry
GRN     → GLAdapter.toJournalEntry() → JournalEntry
```

The adapter:
- Maps AP account codes (e.g., `"2000"` for AP Control) to GL account IDs
- Applies exchange rates and computes base amounts using `Decimal` arithmetic
- Sets `JournalSource` to `"system"` (not `"manual"`)
- Sets `referenceType` to `"ProcurementInvoice"` / `"ProcurementPayment"` / `"ProcurementReceipt"`
- Never passes AP domain objects directly to GL — only GL-format DTOs

---

## 5. Data Ownership

### 5.1 Data AP Owns (Full CRUD + Lifecycle)

| Entity | Prisma Model | Key Fields | Relationships |
|---|---|---|---|
| **Vendor** | `ProcurementVendor` | id, companyId, name, code, status, riskScore, paymentTerms, creditLimit, currency, taxId, bankAccount (encrypted) | hasMany PO, Invoice, Payment |
| **Purchase Request** | `ProcurementPR` | id, companyId, prNumber, status, requestedBy, totalAmount, currency, department, costCenter | hasMany PRItem, hasOne PO |
| **PR Line Item** | `ProcurementPRItem` | id, companyId, prId, description, quantity, unitPrice, totalPrice, glAccountCode | belongsTo PR |
| **Purchase Order** | `ProcurementPO` | id, companyId, poNumber, status, vendorId, prId?, totalAmount, taxAmount, currency, paymentTerms | belongsTo Vendor, hasMany POItem, GRN, Invoice |
| **PO Line Item** | `ProcurementPOItem` | id, companyId, poId, description, quantity, unitPrice, totalPrice, receivedQuantity, invoicedQuantity | belongsTo PO |
| **Goods Receipt** | `ProcurementGRN` | id, companyId, grnNumber, poId, status, receivedBy, receivedAt | belongsTo PO, hasMany GRNItem |
| **GRN Line Item** | `ProcurementGRNItem` | id, companyId, grnId, poItemId, quantityReceived, quantityAccepted, quantityRejected | belongsTo GRN, references POItem |
| **Invoice** | `ProcurementInvoice` | id, companyId, invoiceNumber, vendorId, poId?, status, matchStatus, totalAmount, taxAmount, currency, exchangeRate | belongsTo Vendor, hasMany InvoiceItem, MatchResult, Payment |
| **Invoice Line Item** | `ProcurementInvoiceItem` | id, companyId, invoiceId, poItemId?, description, quantity, unitPrice, totalPrice, glAccountCode | belongsTo Invoice, references POItem |
| **Match Result** | `ProcurementMatchResult` | id, companyId, invoiceId, matchType, status, quantityMatch, priceMatch, varianceAmount | belongsTo Invoice |
| **Exception** | `ProcurementException` | id, companyId, invoiceId, matchResultId, type, severity, status, assignedTo, slaDeadline | belongsTo Invoice, hasMany ExceptionActivity |
| **Exception Activity** | `ProcurementExceptionActivity` | id, exceptionId, action, description, performedBy | belongsTo Exception |
| **Approval Record** | `ProcurementApprovalRecord` | id, companyId, entityType, entityId, level, approverId, decision, reason, delegatedFrom? | references any AP entity |
| **Payment Proposal** | `ProcurementPaymentProposal` | id, companyId, proposalNumber, status, totalAmount, currency, scheduledDate, paymentCount | hasMany Payment |
| **Payment** | `ProcurementPayment` | id, companyId, paymentNumber, invoiceId, vendorId, proposalId?, amount, currency, method, status, idempotencyKey | belongsTo Invoice, Vendor, Proposal |
| **Vendor Statement** | `ProcurementVendorStatement` | id, companyId, vendorId, statementDate, totalAmount, currency, status | belongsTo Vendor, hasOne ReconciliationResult |
| **Reconciliation Result** | `ProcurementReconciliationResult` | id, companyId, statementId, status, bookBalance, statementBalance, discrepancyAmount | belongsTo VendorStatement |
| **AP Journal Entry** | `ProcurementAPJournalEntry` | id, companyId, type, referenceId, referenceType, debitAccount, creditAccount, debitAmount, creditAmount, currency, posted | Generated by AP, posted to GL |

### 5.2 Data AP References But Does Not Own

| Entity | Owner | Reference Strategy | AP Stores |
|---|---|---|---|
| **GL Account** | GL Context | `glAccountCode` (string) on InvoiceItem, POItem, PRItem | Account code only — never account details |
| **GL Journal** | GL Context | `journalId` (string) on APJournalEntry after posting | Journal ID only — never journal entries |
| **Budget Line** | Budget Context | `budgetLineId` (string) on PR | Budget line ID only — never budget amounts |
| **User / Employee** | Identity / IAM | `userId` (string) on Vendor, PR, PO, Invoice, Payment | User ID only — never user profile |
| **Bank Account** | Banking Context | `bankAccountId` (string) on Vendor | Bank account ID only — never account numbers |
| **Approval Matrix Rule** | Automation Studio | `ruleId` (string) — evaluated at runtime | Rule ID only — rules are fetched via evaluator |
| **Notification Template** | Notification Context | Template name string | Template name only |

### 5.3 Reference Integrity Rules

| Rule | Implementation | Consequence of Violation |
|---|---|---|
| **AP entities carry `companyId`** | Every Prisma model has `companyId String` field + composite index | Security incident — cross-tenant data leak |
| **Foreign keys between AP entities** | PO→Vendor, Invoice→PO, GRN→PO, Payment→Invoice | Cascade soft-delete only — never hard delete financial records |
| **Cross-context references are IDs only** | `glAccountCode`, `userId`, `bankAccountId` are strings | Stale references handled by "not found" error responses |
| **No embedded cross-context data** | AP never stores GL account name, user email, bank account number | AP always fetches via service interface when display is needed |
| **Monetary fields are Decimal** | `Decimal @db.Decimal(20,4)` on every amount field | Type safety prevents precision loss |

### 5.4 Immutability Rules

| Record | Mutable Fields | Immutable After |
|---|---|---|
| Invoice | status, matchStatus, approvedBy, paidAt | Posting to GL (status = PAID) — only reversal allowed |
| Payment | status, executedAt, confirmedAt | Execution (status = COMPLETED) — only refund allowed |
| Match Result | status, resolvedBy, resolvedAt | Resolution (status = RESOLVED) — new match record for re-evaluation |
| GL Journal Entry | posted, postedAt | Posting — never modify; corrections via reversal entries |
| Approval Record | decision, reason, decidedAt | Decision — never modify; new record for re-approval |
| Exception | status, assignedTo, resolvedBy, resolvedAt | Closure — activity log appended, never overwritten |

---

## 6. Technology Decisions

### 6.1 Persistence

| Decision | Choice | Rationale |
|---|---|---|
| ORM | Prisma | Frozen architecture (v1.0). All 100+ existing models use Prisma. |
| Monetary storage | `Decimal @db.Decimal(20,4)` | Financial Precision Policy: no Float for money. |
| Exchange rate storage | `Decimal @db.Decimal(10,6)` | 6 decimal places for FX precision. |
| Risk score storage | `Decimal @db.Decimal(5,2)` | 0–100 range with 2 decimal precision. |
| ID generation | `cuid()` | Collision-resistant, URL-safe, monotonically increasing. |
| Timestamps | `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt` | Standard Prisma pattern across all models. |
| Audit fields | `createdBy String`, `updatedBy String` | Every record tracks who created/modified it. |
| Soft delete | Not implemented in Phase 21A | Financial records are never deleted. Hard delete blocked at service layer. Status = CANCELLED/VOIDED for lifecycle termination. |

### 6.2 Validation

| Layer | Tool | Scope |
|---|---|---|
| API boundary | Zod schemas | Request body, query params, path params — every endpoint |
| Service boundary | Zod schemas | Domain input validation — reject invalid data before business logic |
| Prisma schema | Native constraints | Unique, not-null, default, foreign key — database-level safety |
| UI forms | EnterpriseForm system | Progressive validation, human-readable errors, accessibility |

**Zod schema location**: `src/lib/validations/ap.ts` — single file for all AP validation schemas, following the pattern established by `src/lib/validations/agent-framework.ts`.

### 6.3 Financial Precision

| Operation | Implementation | Example |
|---|---|---|
| Addition | `sumDecimals(values)` | Summing invoice line totals |
| Multiplication | `multiplyDecimals(a, b)` | quantity × unitPrice |
| Division | `divideDecimals(a, b)` | Computing unit prices from totals |
| Rounding | `financialRound(amount, precision)` | Banker's rounding (half-even) for display |
| Allocation | `allocateAmount(total, portions, precision)` | Splitting payments across invoices |
| Tax calculation | `calculateTax(amount, rate)` | Invoice tax computation |
| Comparison | `decimalEquals(a, b, tolerance)` | Match tolerance checking |

**Rule**: `Number()` conversion happens only at the UI rendering boundary. All business logic operates on `Prisma.Decimal`.

### 6.4 Domain Events

| Decision | Choice | Rationale |
|---|---|---|
| Event mechanism | Typed function calls (in-process) | Governance Constitution: Modular Monolith. No message queue between contexts. |
| Event bus | Existing `EventBus` from `src/modules/` | Reuse established pattern. Not a new infrastructure component. |
| Event types | TypeScript interfaces in `types/events.ts` | Type-safe payloads, compile-time checking |
| Event naming | Past tense, PascalCase | `InvoiceSubmitted`, `PaymentExecuted` — describes what happened |
| Event consumers | Synchronous handlers within same request | No eventual consistency — AP operations are transactional |
| Event audit | Every event also calls `recordAudit()` | Dual emission: event for integration + audit record for compliance |

### 6.5 Idempotency

| Operation | Idempotency Strategy | Key |
|---|---|---|
| Payment execution | `idempotencyKey` unique constraint on `ProcurementPayment` | Client-generated UUID, sent with every payment request |
| Invoice creation | `invoiceNumber` unique per `(companyId, vendorId)` | Natural business key prevents duplicate entry |
| PO creation | `poNumber` unique per `companyId` | Auto-generated sequential number |
| GRN creation | `grnNumber` unique per `companyId` | Auto-generated sequential number |
| Match execution | `invoiceId` unique active match per invoice | One active match at a time; re-matching creates new record |
| Approval decision | `approvalRecordId` unique + `decision` enum | Double-approve returns existing decision (idempotent) |

### 6.6 Audit Trail

| Event | Audit Record | Data Captured |
|---|---|---|
| Entity created | `recordAudit('ap.{entity}.created', { entityId, companyId })` | Who, when, what |
| Entity updated | `recordAudit('ap.{entity}.updated', { entityId, fields })` | Who, when, what changed |
| Status transition | `recordAudit('ap.{entity}.status_changed', { from, to, reason })` | Who, when, why |
| Approval decision | `recordAudit('ap.approval.decided', { entityId, decision, level, reason })` | Who, when, what decision, why |
| Payment executed | `recordAudit('ap.payment.executed', { paymentId, amount, method })` | Who, when, how much, how |
| Match result | `recordAudit('ap.match.completed', { invoiceId, matchType, score })` | What matched, confidence |
| Exception created | `recordAudit('ap.exception.created', { invoiceId, type, severity })` | What failed, why |
| GL entry generated | `recordAudit('ap.gl_entry.generated', { entryId, accounts })` | Debit/credit mapping |

### 6.7 Error Handling

| Error Category | HTTP Status | Response Format | Example |
|---|---|---|---|
| Validation error | 400 | `{ error: 'Validation failed', details: ZodError }` | Missing required field |
| Not found | 404 | `{ error: 'Invoice not found' }` | Invalid invoiceId |
| Business rule violation | 422 | `{ error: 'Cannot approve', reason: 'Match exception unresolved' }` | Precondition not met |
| Duplicate detected | 409 | `{ error: 'Duplicate invoice', existingId: '...' }` | Same vendor + number |
| Period closed | 422 | `{ error: 'Cannot post to closed period' }` | GL period constraint |
| Insufficient authority | 403 | `{ error: 'Insufficient approval authority' }` | Amount exceeds approver limit |
| Idempotency conflict | 409 | `{ error: 'Payment already exists', paymentId: '...' }` | Duplicate idempotencyKey |
| Tenant mismatch | 403 | `{ error: 'Access denied' }` | Cross-tenant access attempt |
| Rate limited | 429 | `{ error: 'Too many requests' }` | API rate limit |

---

## 7. Future Evolution

### 7.1 What May Change

| Area | Current (Phase 21) | Future Evolution | Extension Point |
|---|---|---|---|
| **Tolerance configuration** | Hardcoded 0.01 absolute | Per-vendor, per-category, percentage-based tolerance rules | `match-tolerance.config.ts` — already designed for config-driven tolerances |
| **Approval thresholds** | Fixed dollar thresholds | Dynamic thresholds based on spend history, vendor risk, department | Approval matrix already supports rule-based routing |
| **Payment methods** | Wire, ACH, Check | Virtual cards, blockchain, international wire, SEPA | `PaymentMethod` enum is extensible |
| **Invoice capture** | Manual entry | OCR extraction, email parsing, EDI ingestion | `InvoiceService.create()` accepts structured data — OCR service can call same interface |
| **Duplicate detection** | Exact match (vendor + number + amount) | Fuzzy matching, ML-based similarity scoring | Intelligence Context already has AI provider registry |
| **Vendor risk scoring** | Manual risk level | Automated scoring from payment history, financial data, news feeds | `Vendor.riskScore` field already supports Decimal precision |
| **Multi-currency** | Single currency per invoice | Multi-currency with hedging, gain/loss tracking | `exchangeRate` field and `currency` field already present |
| **Early payment discounts** | Not implemented | Dynamic discount calculation, discount optimization | Payment proposal service designed for scheduling logic |
| **Vendor portal** | Not implemented | Self-service vendor portal for statement upload, payment status | API routes are RESTful — portal is a separate frontend |
| **Workflow orchestration** | Sequential stages | Parallel approvals, conditional branching, SLA-driven routing | Approval module designed for integration with Workflow Engine |
| **Reporting** | Aging + DPO | AP automation rate, touchless processing rate, cycle time analytics | Analytics module designed for extension |

### 7.2 What May Not Change (Constitutional Constraints)

| Constraint | Source | Enforcement |
|---|---|---|
| **Audit immutability** | Governance Constitution, Financial Precision Policy | Audit records are append-only. GL entries are never modified — only reversed. |
| **Tenant isolation** | Governance Constitution | Every entity carries `companyId`. Cross-tenant access is a security incident. |
| **Financial precision** | Financial Precision Policy | `Decimal(20,4)` for storage. `Prisma.Decimal` arithmetic for calculation. `Number()` only at display boundary. |
| **Human authority** | Enterprise Workflow Constitution | AI may recommend. Humans decide, approve, commit financial actions. No autonomous payment execution. |
| **Idempotency** | Product Constitution | All state-modifying operations are idempotent where domain allows. Payment execution has `idempotencyKey`. |
| **Banker's rounding** | Financial Precision Policy | Half-even rounding for display. `financialRound()` is the single implementation. |
| **Modular monolith** | Governance Constitution | No HTTP calls between contexts. No message queues. Typed function calls within single process. |
| **TypeScript strict mode** | Product Constitution | Zero `any`. Zero `@ts-ignore`. Zero `as` type assertions without justification. |

### 7.3 Extension Points

| Extension | Integration Pattern | Phase |
|---|---|---|
| **AI duplicate detection** | Intelligence Context calls `InvoiceService.findDuplicates()` → returns candidates → AI scores similarity → AP displays alerts | 21C |
| **OCR invoice extraction** | External service extracts → calls `InvoiceService.create()` with structured data → AP validates and processes | Post-21D |
| **Vendor self-service portal** | Separate Next.js app, calls AP API routes via service account with vendor-scoped permissions | Post-21D |
| **Payment hub integration** | Treasury Context wraps bank API calls → AP creates proposals → Treasury translates and executes | 21B |
| **Automated 3-way match** | GRN recording triggers `InvoiceMatchingService.match(invoiceId)` → if all items matched → auto-approve | 21B |
| **Smart approval routing** | AI Context analyzes approval patterns → suggests optimal routing → Automation Studio updates matrix rules | Post-21D |
| **AP automation metrics** | Analytics module tracks touchless rate, cycle time, exception rate → feeds executive dashboard | 21C |
| **Vendor statement auto-import** | Banking Context imports statements → emits `BankStatementImported` → AP triggers reconciliation | 21D |
| **Withholding tax** | Tax Context computes withholding → AP applies to payment → reduces payment amount | Post-21D |
| **Multi-entity consolidation** | GL Context provides consolidation rules → AP aggregates across entities → intercompany elimination entries | Post-21D |

### 7.4 Migration Path from Current State

| Current Artifact | Migration Strategy |
|---|---|
| `src/server/procurement/domain/` (13 service directories) | **Replace** — new `src/server/ap/domain/` with Prisma-backed services. Old in-memory services deprecated. |
| `src/server/procurement/types/index.ts` (166 lines) | **Replace** — new `src/server/ap/types/index.ts` with Decimal types, stricter interfaces, event types. |
| `src/server/procurement/procurement-seed.ts` (888 lines) | **Replace** — new `src/server/ap/migrations/` seed script using Prisma create operations. |
| `src/server/procurement/services/procurement-service.ts` (68-line facade) | **Replace** — new `src/server/ap/services/ap.service.ts` with full orchestration. |
| `src/server/procurement/domain/invoice-matching/` (126 lines) | **Rewrite** — configurable tolerances, Decimal arithmetic, persistence, exception creation. |
| `src/server/procurement/domain/gl-integration/` (126 lines) | **Rewrite** — ACL adapter pattern, Decimal arithmetic, proper GL account resolution. |
| `src/app/(shell)/procurement/` (11 pages) | **Replace** — new `src/app/(shell)/ap/` pages with interactive actions, not display-only. |
| `src/components/procurement/` (20 components) | **Replace** — new `src/components/ap/` with EnterpriseForm integration, action buttons, validation. |

**Deprecation strategy**: Old procurement pages and services remain functional until Phase 21B completes. A banner on old pages reads: "This page is deprecated. Redirecting to AP workspace..." with automatic redirect to the new `/ap/` routes.

---

## Appendix A: Entity Relationship Diagram

```
ProcurementVendor (1) ──── (*) ProcurementPO
        │                         │
        │                         ├── (*) ProcurementPOItem
        │                         │
        │                         ├── (*) ProcurementGRN
        │                         │         └── (*) ProcurementGRNItem
        │                         │
        │                         └── (*) ProcurementInvoice
        │                                   │
        ├── (*) ProcurementInvoice          ├── (*) ProcurementInvoiceItem
        │                                   │
        ├── (*) ProcurementPayment          ├── (*) ProcurementMatchResult
        │                                   │
        └── (*) ProcurementVendorStatement  └── (*) ProcurementException
                                                        └── (*) ProcurementExceptionActivity

ProcurementPR (1) ──── (*) ProcurementPRItem
        │
        └── (0..1) ProcurementPO

ProcurementPaymentProposal (1) ──── (*) ProcurementPayment

ProcurementReconciliationResult (1) ──── (1) ProcurementVendorStatement

ProcurementApprovalRecord ──── (*) any AP entity (polymorphic via entityType + entityId)

ProcurementAPJournalEntry ──── references GL context (debitAccount, creditAccount are codes)
```

## Appendix B: Status State Machines

### Vendor Status
```
PENDING_APPROVAL → ACTIVE → SUSPENDED → ACTIVE (reactivation)
                       ↓
                  DEACTIVATED (terminal)
```

### Purchase Request Status
```
DRAFT → SUBMITTED → APPROVED → CONVERTED_TO_PO
                 ↘
               REJECTED → SUBMITTED (re-submission)
```

### Purchase Order Status
```
DRAFT → SUBMITTED → APPROVED → SENT → ACKNOWLEDGED → PARTIALLY_RECEIVED → FULLY_RECEIVED → CLOSED
                                    ↘                                                    ↗
                                    CANCELLED (terminal)                         CANCELLED
```

### Invoice Status
```
DRAFT → SUBMITTED → MATCHED → APPROVED → PAID
                  ↘         ↘
                EXCEPTION   REJECTED → DRAFT (re-submit)
                  ↓
               RESOLVED → MATCHED (re-match)
```

### Payment Status
```
PENDING → APPROVED → EXECUTING → COMPLETED
                           ↓
                        FAILED (retry or cancel)
PENDING → CANCELLED (terminal)
```

### Match Status
```
UNMATCHED → MATCHED (auto or manual)
          → EXCEPTION (variance exceeds tolerance)
          → OVERRIDDEN (manual override with reason)
```

### Exception Status
```
OPEN → IN_PROGRESS → RESOLVED
   ↘               ↘
  ESCALATED       REJECTED (terminal — re-open if new evidence)
   ↓
  RESOLVED
```

## Appendix C: API Route Summary

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/ap/vendors` | List vendors (paginated, filterable) | AP_VIEW |
| POST | `/api/v1/ap/vendors` | Create vendor | AP_MANAGE |
| GET | `/api/v1/ap/vendors/:id` | Get vendor detail | AP_VIEW |
| PUT | `/api/v1/ap/vendors/:id` | Update vendor | AP_MANAGE |
| DELETE | `/api/v1/ap/vendors/:id` | Deactivate vendor | AP_ADMIN |
| GET | `/api/v1/ap/purchase-requests` | List PRs | AP_VIEW |
| POST | `/api/v1/ap/purchase-requests` | Create PR | AP_MANAGE |
| GET | `/api/v1/ap/purchase-requests/:id` | Get PR detail | AP_VIEW |
| PUT | `/api/v1/ap/purchase-requests/:id` | Update PR (draft only) | AP_MANAGE |
| POST | `/api/v1/ap/purchase-requests/:id/submit` | Submit for approval | AP_MANAGE |
| GET | `/api/v1/ap/purchase-orders` | List POs | AP_VIEW |
| POST | `/api/v1/ap/purchase-orders` | Create PO from PR | AP_MANAGE |
| GET | `/api/v1/ap/purchase-orders/:id` | Get PO detail | AP_VIEW |
| PUT | `/api/v1/ap/purchase-orders/:id` | Update PO (draft only) | AP_MANAGE |
| POST | `/api/v1/ap/purchase-orders/:id/approve` | Approve PO | APPROVE_PO |
| POST | `/api/v1/ap/purchase-orders/:id/send` | Send to vendor | AP_MANAGE |
| GET | `/api/v1/ap/goods-receipts` | List GRNs | AP_VIEW |
| POST | `/api/v1/ap/goods-receipts` | Record GRN | AP_MANAGE |
| GET | `/api/v1/ap/goods-receipts/:id` | Get GRN detail | AP_VIEW |
| PUT | `/api/v1/ap/goods-receipts/:id` | Update inspection | AP_MANAGE |
| GET | `/api/v1/ap/invoices` | List invoices | AP_VIEW |
| POST | `/api/v1/ap/invoices` | Create invoice | AP_MANAGE |
| GET | `/api/v1/ap/invoices/:id` | Get invoice detail | AP_VIEW |
| PUT | `/api/v1/ap/invoices/:id` | Update invoice (draft only) | AP_MANAGE |
| POST | `/api/v1/ap/invoices/:id/match` | Trigger match | AP_MANAGE |
| POST | `/api/v1/ap/invoices/:id/approve` | Approve for payment | APPROVE_INVOICE |
| POST | `/api/v1/ap/invoices/duplicate-check` | Check for duplicates | AP_VIEW |
| GET | `/api/v1/ap/match/tolerance` | Get tolerance config | AP_VIEW |
| PUT | `/api/v1/ap/match/tolerance` | Update tolerances | AP_ADMIN |
| GET | `/api/v1/ap/exceptions` | List exceptions | AP_VIEW |
| POST | `/api/v1/ap/exceptions` | Create manual exception | AP_MANAGE |
| GET | `/api/v1/ap/exceptions/:id` | Get exception detail | AP_VIEW |
| PUT | `/api/v1/ap/exceptions/:id` | Resolve/reassign exception | AP_MANAGE |
| GET | `/api/v1/ap/exceptions/:id/activities` | Get activity log | AP_VIEW |
| POST | `/api/v1/ap/exceptions/:id/activities` | Add activity | AP_MANAGE |
| GET | `/api/v1/ap/payments` | List payments | AP_VIEW |
| POST | `/api/v1/ap/payments` | Create individual payment | AP_MANAGE |
| GET | `/api/v1/ap/payments/:id` | Get payment detail | AP_VIEW |
| POST | `/api/v1/ap/payments/:id/confirm` | Confirm payment | AP_MANAGE |
| GET | `/api/v1/ap/payments/proposals` | List proposals | AP_VIEW |
| POST | `/api/v1/ap/payments/proposals` | Generate proposal | AP_MANAGE |
| GET | `/api/v1/ap/payments/proposals/:id` | Get proposal detail | AP_VIEW |
| DELETE | `/api/v1/ap/payments/proposals/:id` | Cancel proposal | AP_MANAGE |
| POST | `/api/v1/ap/payments/proposals/:id/execute` | Execute proposal | APPROVE_PAYMENT |
| GET | `/api/v1/ap/reconciliation` | List reconciliations | AP_VIEW |
| POST | `/api/v1/ap/reconciliation` | Upload vendor statement | AP_MANAGE |
| GET | `/api/v1/ap/reconciliation/:id` | Get reconciliation detail | AP_VIEW |
| POST | `/api/v1/ap/reconciliation/:id/resolve` | Resolve discrepancies | AP_MANAGE |
| GET | `/api/v1/ap/aging` | AP aging report | AP_VIEW |
| GET | `/api/v1/ap/analytics` | AP analytics & KPIs | AP_VIEW |
| GET | `/api/v1/ap/analytics/export` | Export AP data (CSV/Excel) | AP_VIEW |

**Total**: 42 API endpoints across 13 resource groups.

## Appendix D: Permission Model

| Permission | Scope | Description |
|---|---|---|
| `ap.view` | Read-only | View vendors, PRs, POs, invoices, payments, reports |
| `ap.manage` | Create + Update | Create/edit vendors, PRs, POs, invoices, GRNs, payments |
| `ap.admin` | Configuration | Update tolerance rules, deactivate vendors, manage settings |
| `approve.pr` | Approval | Approve/reject purchase requests |
| `approve.po` | Approval | Approve/reject purchase orders |
| `approve.invoice` | Approval | Approve/reject invoices for payment |
| `approve.payment` | Approval | Authorize payment execution |
| `ap.export` | Data export | Export AP data to CSV/Excel |

All permissions require `companyId` scoping. Permissions are enforced at the API route level via `requirePermission()` middleware, following the IAM permission model established in Phase 11C.

---

> **Document End**
> This architecture document governs all AP implementation from Phase 21A through 21D and beyond. Any deviation requires architecture review and documented justification.
