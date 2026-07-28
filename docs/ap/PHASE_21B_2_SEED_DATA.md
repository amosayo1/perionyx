# Phase 21B.2 — Enterprise AP Seed Data System

## Overview

Comprehensive deterministic seed data generator for the Accounts Payable module, creating realistic Fortune 500-style financial data across all 10 AP aggregate types.

## Data Volumes

| Entity | Count | Key Characteristics |
|--------|-------|---------------------|
| Vendors | 158 | 40 strategic, 60 standard, 30 one-time, 20 international (multi-currency) |
| Invoices | 3,527 | 14 statuses, 6 currencies, line items, duplicate detection scenarios |
| Approvals | 612 | 5 levels (AP Clerk → CFO), delegation, escalation history |
| Exceptions | 358 | 9 types, 5 severity levels, SLA assignments, resolution history |
| Proposals | 250 | Full lifecycle (DRAFT → EXECUTED), 7 statuses |
| Batches | 120 | 6 payment methods, fees, net disbursement |
| Payment Records | 649 | Transaction references, GL posting status, idempotency keys |
| Credits | 130 | Applied, partially applied, expired, and open statuses |
| Statements | 40 | With 496 statement lines, matching status |
| Reconciliation Results | 40 | Match rates, balance variances, adjustment history |
| Audit Records | 21,800 | Complete chronological trail, all 12 action types |

**Total: ~28,000 records across 10 aggregate types**

## Architecture

```
src/server/procurement/seeds/
├── seed-utils.ts              # Deterministic PRNG (mulberry32), UUID generation, date/string/number helpers
├── vendor-generator.ts        # ~150 vendors with bank details, performance history
├── invoice-generator.ts       # 3,500 invoices, 14 statuses, line items, duplicate scenarios
├── approval-generator.ts      # 600+ approvals with 5 levels, delegation/escalation
├── exception-generator.ts     # 350+ exceptions across 9 types with SLA tracking
├── payment-generator.ts       # 250 proposals + 120 batches + 650 payment records
├── credit-generator.ts        # 130 vendor credits (overpayment, return, rebate, etc.)
├── reconciliation-generator.ts # 40 statements with lines and reconciliation results
├── audit-generator.ts         # 22K+ audit records covering all entity types
└── ap-seed.ts                 # Orchestrator — runs all generators in dependency order
```

## Key Design Decisions

### 1. Deterministic PRNG (mulberry32)
- Every run produces identical data given the same seed
- Enables reproducible demo environments
- Seed per generator: vendor=42_100, invoice=42_200, approval=42_300, payment=42_400, audit=42_500, credit=42_600, reconciliation=42_700

### 2. Dependency-Ordered Generation
```
Vendors → Invoices → Approvals → Exceptions → Payments → Credits → Reconciliation → Audit
```
Each generator depends on IDs from previous generators. The orchestrator queries DB after each step to collect generated IDs.

### 3. Idempotent Re-Run
- Skips when sufficient data already exists (e.g., ≥100 vendors, ≥2000 invoices)
- Individual record creation uses `P2002` error catch for unique constraint violations
- Safe to run `npx tsx src/server/procurement/seeds/ap-seed.ts` multiple times

### 4. Fortune 500 Realism
- Vendors span 40 industries (manufacturing, cloud, consulting, logistics, etc.)
- International vendors use EUR/GBP/JPY with cross-border tax rules
- Invoice amounts follow power-law distribution (many small, few large)
- Month-end and quarter-end spikes in invoice volume
- Realistic approval chains based on amount thresholds
- Weekend/holiday payment scheduling

## Running

```bash
# Full seed (idempotent)
npx tsx src/server/procurement/seeds/ap-seed.ts

# Via prisma seed (runs main seed + AP seed)
pnpm prisma db seed
```

## Data Relationships

```
Vendor (158) ──< VendorInvoice (3,527) ──< ApprovalRecord (612)
                    │                           │
                    ├──< InvoiceException (358)  │
                    │                           │
                    ├──< PaymentRecord (649) ──> PaymentBatch (120) ──< PaymentProposal (250)
                    │
                    ├──< VendorCredit (130)
                    │
                    └──< VendorStatementLine (496) ──< VendorStatement (40) ──< ReconciliationResult (40)

All entities ──< APAuditRecord (21,800)
```

## Financial Scenarios Covered

| Scenario | Coverage |
|----------|----------|
| Duplicate invoices | 10-15 with `isDuplicateSuspicion=true`, confidence scores |
| Price variances | 20+ invoices with `varianceAmount > 0` |
| Three-way match | FULL_MATCH, PRICE_VARIANCE, QTY_VARIANCE, NO_MATCH |
| Approval thresholds | $5K/$25K/$100K/$500K levels |
| Overdue invoices | Due dates in past, past-due aging buckets |
| Multi-currency | USD, EUR, GBP, JPY, CAD, CHF |
| Payment methods | ACH, Wire, Check, EFT, Virtual Card |
| Vendor blocking | 3+ vendors with `isBlocked=true` |
| SLA breaches | Exceptions with escalation history |
| Credit lifecycle | Applied, partially applied, expired credits |
| Reconciliation | Matched, exception, adjusted states |
