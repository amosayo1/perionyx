# Phase 21.0 — AP Persona Review

> **Status**: Complete
> **Type**: Documentation-only — persona analysis
> **Date**: July 21, 2026
> **Scope**: All personas that interact with the AP workflow

## Executive Summary

The AP Manager is the weakest persona in Perionyx (5/10) because the entire AP workflow is a static display layer over seeded data. The persona cannot perform any core task: create an invoice, run a match, approve a payment, or trace an audit event. Seven personas interact with AP, and all are underserved.

## Persona Profiles

### 1. AP Clerk (Daily Operations) — Current: 3/10, Target: 8/10

**Role**: Processes invoices daily, runs three-way matches, resolves exceptions, prepares payment batches.

**Core Tasks**:
- Enter vendor invoices (currently: display-only)
- Run 3-way matching (currently: match logic exists but not wired to UI)
- Resolve match exceptions (currently: no exception management)
- Prepare payment proposals (currently: no proposal generation)
- Respond to vendor payment inquiries (currently: no vendor portal)

**Current Pain Points**:
1. Cannot create invoices — must edit seed data (destroying data integrity)
2. Cannot trigger matching — must wait for seed-time matching (static)
3. No exception queue — exceptions are buried in a KPI card (51 count, no action)
4. No payment preparation — cannot batch invoices for payment
5. No vendor inquiry response — no payment status visibility

**Phase 21.0 Impact**:
- Stages 6-9 (Invoice Capture → Exception Queue) directly serve this persona
- Estimated improvement: 3/10 → 7/10 (with invoice entry, matching, exception management)
- Full 8/10 requires Phase 21B service rewrites

**Evidence of Improvement**:
- Can create, validate, and match invoices via API
- Can manage exception queue with resolution actions
- Can generate payment proposals from approved invoices
- Audit trail for every action

### 2. AP Manager (Oversight & Strategy) — Current: 5/10, Target: 8/10

**Role**: Oversees AP operations, manages approvals, optimizes payment timing, reports to Controller/CFO.

**Core Tasks**:
- Monitor AP aging and cash flow impact
- Approve invoices above threshold
- Optimize payment timing for early-pay discounts
- Report AP metrics to Controller/CFO
- Manage vendor relationships

**Current Pain Points**:
1. Dashboard shows 12 metrics but none are actionable (display-only)
2. Cannot approve invoices (no approval actions)
3. No payment optimization (no early-pay discount analysis)
4. No aging drill-down (click chart → see invoices)
5. Spend analytics are read-only (4 charts, 0 filters)
6. 6 unread alerts with no action buttons

**Phase 21.0 Impact**:
- Stages 8-11 (Match → Approval → Payment Proposal) directly serve this persona
- Estimated improvement: 5/10 → 8/10

**Key Metrics the AP Manager Needs**:
| Metric | Current | Phase 21.0 |
|---|---|---|
| AP Aging (current/30/60/90/120+) | Not computed | Real-time from Prisma |
| Days Payable Outstanding (DPO) | Not computed | Rolling 30/60/90 |
| Early-pay discount capture rate | Not computed | % of available discounts taken |
| Exception rate | Static KPI (51) | Live % with trend |
| Approval cycle time | Not measured | Average hours from capture to approval |
| Payment cycle time | Not measured | Average hours from approval to payment |
| On-time payment rate | Not computed | % paid before due date |
| Vendor spend concentration | Static KPI ($1.37M top vendor) | Top 10 with Gini coefficient |

### 3. Controller (Compliance & Audit) — Current: 6/10, Target: 8/10

**Role**: Ensures AP compliance with internal controls, SOX requirements, and audit readiness.

**Core Tasks**:
- Review approval chains for segregation of duties
- Audit AP transactions for policy compliance
- Verify GL postings match AP subledger
- Respond to internal/external audit queries
- Review and approve large payments (>$50K)

**Current Pain Points**:
1. No audit trail for AP actions (cannot reconstruct invoice lifecycle)
2. No segregation of duties enforcement (PO creator vs invoice approver)
3. No GL ↔ AP subledger reconciliation
4. Cannot trace any financial figure to its source
5. No approval chain documentation

**Phase 21.0 Impact**:
- Stages 10, 12-14 (Approval → GL Posting → Reconciliation → Audit) serve this persona
- Estimated improvement: 6/10 → 8/10

### 4. Treasury Manager (Cash & Payments) — Current: 7/10, Target: 8/10

**Role**: Executes payments, manages cash flow, ensures payment safety.

**Core Tasks**:
- Review and approve payment batches
- Execute payments via bank
- Monitor cash position vs AP obligations
- Ensure payment safety (no duplicates, no fraud)
- Report payment metrics to CFO

**Current Pain Points**:
1. No payment proposal to review (PaymentService stores but doesn't generate)
2. No cash position integration (Treasury is separate module)
3. No payment safety controls (no idempotency, no velocity checks)
4. No payment confirmation tracking

**Phase 21.0 Impact**:
- Stages 11-12 (Payment Proposal → Treasury Approval) serve this persona
- Estimated improvement: 7/10 → 8/10

### 5. Procurement Manager (Vendor & PO) — Current: 5/10, Target: 7/10

**Role**: Manages vendor relationships, PO lifecycle, contract compliance.

**Core Tasks**:
- Onboard and vet vendors
- Create and manage POs
- Track contract compliance
- Monitor vendor performance
- Approve PR requests

**Current Pain Points**:
1. No vendor creation form (display-only)
2. No PO creation from approved PR (manual seed)
3. No contract expiry alerts with action (KPI card only)
4. No vendor performance drill-down

**Phase 21.0 Impact**:
- Stages 1-5 (Vendor → PO → GRN) serve this persona
- Estimated improvement: 5/10 → 7/10 (vendor management + PO lifecycle)

### 6. Vendor (External) — Current: 0/10, Target: 5/10

**Role**: Submits invoices, checks payment status, manages their account.

**Current Pain Points**:
1. No vendor portal (completely absent)
2. No invoice submission channel
3. No payment status visibility
4. No account management

**Phase 21.0 Impact**:
- Vendor portal is P2 priority (not in Phase 21A-21B)
- Estimated improvement: 0/10 → 3/10 (basic self-service in Phase 21D)
- Full 5/10 requires dedicated vendor portal phase

### 7. Budget Owner (Spend Tracking) — Current: 5/10, Target: 7/10

**Role**: Tracks departmental spend against budget, approves purchases.

**Core Tasks**:
- Monitor budget consumption
- Approve PRs within budget
- Investigate overages
- Forecast end-of-period spend

**Current Pain Points**:
1. Budget check not wired to invoice approval
2. No spend-by-category drill-down
3. No forecast vs actual comparison at department level
4. Cannot see which invoices consumed their budget

**Phase 21.0 Impact**:
- Stages 2-3 (PR + Approval with budget check) serve this persona
- Estimated improvement: 5/10 → 7/10

## Persona Coverage Summary

| Persona | Current | Phase 21.0 Target | Delta | Primary Stages |
|---|---|---|---|---|
| AP Clerk | 3/10 | 8/10 | +5 | 6-9 (Invoice → Exception) |
| AP Manager | 5/10 | 8/10 | +3 | 8-11 (Match → Payment) |
| Controller | 6/10 | 8/10 | +2 | 10, 12-14 (Approval → Audit) |
| Treasury Manager | 7/10 | 8/10 | +1 | 11-12 (Proposal → Execution) |
| Procurement Manager | 5/10 | 7/10 | +2 | 1-5 (Vendor → GRN) |
| Vendor | 0/10 | 3/10 | +3 | (Future vendor portal) |
| Budget Owner | 5/10 | 7/10 | +2 | 2-3 (PR + Budget Check) |
| **Weighted Average** | **4.4/10** | **7.0/10** | **+2.6** | |

## Critical Workflow Paths by Persona

### AP Clerk Daily Workflow
```
Morning: Check exception queue → Sort by SLA → Prioritize
  ↓
Process invoices: Enter new invoices → Run match → Review results
  ↓
Resolve exceptions: Price mismatch → Contact vendor → Debit note
  ↓
Prepare payments: Select approved invoices → Generate proposal
  ↓
End of day: Review audit trail → Check SLA compliance
```

### AP Manager Weekly Workflow
```
Monday: Review aging report → Identify overdue → Prioritize payments
  ↓
Approve invoices: Review threshold-based queue → Approve/reject
  ↓
Mid-week: Analyze exception patterns → Vendor negotiations
  ↓
Payment optimization: Early-pay discount analysis → Batch selection
  ↓
Friday: Report to Controller → KPI summary → Next week forecast
```

## Phase 21.0 Deliverable Impact Matrix

| Deliverable | AP Clerk | AP Manager | Controller | Treasury | Procurement | Vendor | Budget Owner |
|---|---|---|---|---|---|---|---|
| Gap Analysis | - | - | - | - | - | - | - |
| Workflow Definition | ++ | ++ | ++ | + | + | - | + |
| Implementation Plan | - | - | - | - | - | - | - |
| Enterprise Scorecard | - | - | ++ | - | - | - | - |
| Decision Packet | - | - | - | - | - | - | - |

++ = Primary impact, + = Secondary impact, - = No direct impact

---

*End of Phase 21.0 — AP Persona Review*
