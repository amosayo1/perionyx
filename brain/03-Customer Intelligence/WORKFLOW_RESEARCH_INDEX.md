---
title: "Workflow Research Index"
created: 2026-07-27
updated: 2026-07-27
tags:
  - type/reference
  - domain/customer-intelligence
  - status/active
owner: Product Team
authority: Strategy
---

# Workflow Research Index

## Purpose

Index of the 8 core finance workflows that Perionyx must master. Each workflow maps to a specific module and has a research status.

## Summary

Enterprise finance operates through 8 interconnected workflows. Researching and validating these workflows with real customers is critical for product-market fit. Current status: all workflows have scaffolding in code but none have been validated through customer interviews.

## The 8 Core Workflows

### W1: Procure-to-Pay (P2P)

| Field | Value |
|-------|-------|
| Module | Procurement / AP |
| Stage | Scaffolding only — no runtime |
| Interview Validation | **Pending** |
| Code Location | `src/server/procurement/` (25 Prisma models, 51 commands) |
| UI Location | `src/app/(shell)/procurement/` (11 pages) |

**Workflow Steps**: Vendor Onboard → PO Created → Goods Received → Invoice Received → 3-Way Match → Approval → Payment Proposal → Treasury Review → Payment Execution → GL Posting → Bank Reconciliation

**Known Gaps** (from Phase 21.0): No Prisma persistence for runtime, no API routes wired, matching engine not connected to UI.

**Interview Status**: Adeel Aslam and Ahmed Shatla both mentioned vendor invoice reconciliation. Full P2P workflow validation pending.

---

### W2: Order-to-Cash (O2C)

| Field | Value |
|-------|-------|
| Module | AR / Billing |
| Stage | Scaffolding only |
| Interview Validation | **Pending** |
| Code Location | `src/server/billing/` |
| UI Location | `src/app/(shell)/billing/` |

**Workflow Steps**: Customer Onboard → Order Created → Service Delivered → Invoice Generated → Payment Received → Cash Application → GL Posting → Reconciliation

**Known Gaps**: AR has partial scaffolding but no end-to-end workflow.

**Interview Status**: Pending — Aman Raza (AR Business Hub) may provide AR workflow insights.

---

### W3: Treasury Management

| Field | Value |
|-------|-------|
| Module | Treasury |
| Stage | Partial — cash position computation works |
| Interview Validation | **Pending** |
| Code Location | `src/modules/treasury/` |
| UI Location | `src/app/(shell)/treasury/` |

**Workflow Steps**: Balance Aggregation → Cash Position → Liquidity Forecast → Investment Decision → FX Management → Bank Communication → Reconciliation

**Known Gaps**: Treasury has Level 2 maturity (Phase 25.5). Real-time updates missing. Forecast lacks confidence scoring.

**Interview Status**: Ayman Shawky (CRM) provided feedback on cash visibility needs. Full validation pending.

---

### W4: Financial Close

| Field | Value |
|-------|-------|
| Module | Financial Close |
| Stage | Level 1 maturity |
| Interview Validation | **Pending** |
| Code Location | `src/modules/financial-close/` |
| UI Location | `src/app/(shell)/financial-close/` |

**Workflow Steps**: Pre-Close Checklist → Journal Entry Review → Intercompany Elimination → Revaluation → Accruals → Trial Balance → Financial Statements → Board Package

**Known Gaps**: Level 1 maturity (Phase 25.5). No automation, no checklist, no variance analysis.

**Interview Status**: Pending — Month-end close is expected to be a major pain point.

---

### W5: Budget & Planning

| Field | Value |
|-------|-------|
| Module | FP&A |
| Stage | Partial — basic budget tracking |
| Interview Validation | **Pending** |
| Code Location | `src/modules/fp-a/` |
| UI Location | `src/app/(shell)/fp-a/` |

**Workflow Steps**: Budget Template → Department Input → Consolidation → Approval → Version Control → Variance Analysis → Forecast Update → Re-Forecast

**Known Gaps**: No budget workflow, no approval chain, no version control.

**Interview Status**: Pending — Mahmoud Shaker (CRM) has FP&A expertise.

---

### W6: Accounts Receivable Collections

| Field | Value |
|-------|-------|
| Module | AR |
| Stage | Scaffolding only |
| Interview Validation | **Pending** |
| Code Location | `src/server/billing/` |
| UI Location | `src/app/(shell)/billing/` |

**Workflow Steps**: Invoice Sent → Payment Due → Reminder Sent → Overdue → Dunning → Collection Agency → Bad Debt Write-Off

**Known Gaps**: No dunning workflow, no aging analysis, no collection automation.

**Interview Status**: Pending — Aman Raza (AR Business Hub) may provide insights.

---

### W7: Expense Management

| Field | Value |
|-------|-------|
| Module | Expenses |
| Stage | Not started |
| Interview Validation | **Pending** |
| Code Location | _None_ |
| UI Location | _None_ |

**Workflow Steps**: Expense Incurred → Receipt Captured → Report Submitted → Manager Approval → Policy Check → Reimbursement → GL Posting

**Known Gaps**: No expense module exists.

**Interview Status**: Pending — expected to emerge from interviews.

---

### W8: Vendor Statement Reconciliation

| Field | Value |
|-------|-------|
| Module | AP / Reconciliation |
| Stage | Partial — GL reconciliation exists |
| Interview Validation | **Pending** |
| Code Location | `src/server/procurement/reconciliation/` |
| UI Location | `src/app/(shell)/procurement/` |

**Workflow Steps**: Statement Received → Transactions Matched → Discrepancies Identified → Resolution → Adjustment → Close

**Known Gaps**: GL reconciliation exists but vendor statement reconciliation is missing.

**Interview Status**: Pending — expected to emerge from interviews.

---

## Research Status Summary

| Workflow | Code Stage | Interview Stage | Gap |
|----------|-----------|-----------------|-----|
| W1: Procure-to-Pay | Scaffolding | Pending | Largest gap — most interview attention expected |
| W2: Order-to-Cash | Scaffolding | Pending | AR Business Hub contact may help |
| W3: Treasury | Partial | Pending | Level 2 maturity — closest to production |
| W4: Financial Close | Level 1 | Pending | Month-end close universally painful |
| W5: Budget & Planning | Partial | Pending | FP&A contact available |
| W6: AR Collections | Scaffolding | Pending | Expected pain point |
| W7: Expense Management | None | Pending | May not emerge from finance interviews |
| W8: Vendor Reconciliation | Partial | Pending | Overlaps with W1 |

## Relationships

| Type | Page | Description |
|------|------|-------------|
| Parent | [[INDEX\|Customer Intelligence Index]] | Folder index |
| Related | [[VALIDATED_MARKET_THEMES]] | Market themes |
| Related | [[ERP_OBSERVATIONS]] | ERP workflow observations |
| Related | [[CRM_INDEX]] | CRM contacts by workflow expertise |

## Open Questions

1. Which workflows should be prioritized for interview research?
2. Should we create dedicated workflow research templates?
3. How do workflow findings feed into the product roadmap?

## Next Actions

1. Import interviews and tag each with relevant workflows
2. After 3+ interviews, create workflow-specific evidence pages
3. Feed workflow findings into product roadmap prioritization
