# Budget Engine

## Overview

The budget engine manages the full budget lifecycle: creation, versioning, approval, revision, and lock-down. It supports top-down (target-driven), bottom-up (line-item), and hybrid approaches within a single fiscal-year structure.

## Data Model

```
Budget
├── id: string (ULID)
├── fiscalYear: number
├── name: string
├── status: Draft | Submitted | Approved | Locked | Revision
├── type: TopDown | BottomUp | Hybrid
├── version: number
├── currency: string (ISO 4217)
├── periods: BudgetPeriod[]        # 12 monthly periods
├── lineItems: BudgetLineItem[]    # GL account-level detail
├── targets: Map<string, number>   # Top-down targets by account
├── approvals: ApprovalChain[]
├── attachments: string[]          # Supporting document refs
├── notes: string
├── createdBy: string
├── createdAt: Date
└── updatedAt: Date

BudgetLineItem
├── accountCode: string
├── accountName: string
├── departmentId: string
├── costCenterId: string
├── projectId?: string
├── periodAmounts: number[12]      # Monthly distribution
├── totalAmount: number
├── driverId?: string              # Linked driver definition
├── notes: string
└── metadata: Record<string, unknown>
```

## Budget Lifecycle

```
Draft → Submitted → Approved → Locked
                    ↓              ↑
              Revision → Re-submitted
```

1. **Draft** — Initial creation, line items editable, targets mutable
2. **Submitted** — Ready for review, locked against edits, approval chain triggered
3. **Approved** — Final version, used as baseline for variance analysis
4. **Locked** — Immutable, no further revisions permitted
5. **Revision** — Special state after lock; creates version bump, retains original as baseline

## Key Operations

### Create Budget
`budgetService.create(dto)` validates fiscal year uniqueness, generates ULID, initializes 12 zero-filled periods, sets status to Draft.

### Submit for Approval
`budgetService.submit(id)` transitions Draft → Submitted, triggers `ApprovalService` chain evaluation. Rejection returns to Draft with reviewer notes.

### Approve
`budgetService.approve(id)` transitions Submitted → Approved, freezes all line item amounts, stamps approval chain.

### Revise
`budgetService.revise(id)` creates a new version (N+1) from the Locked baseline, sets status to Revision, preserves original as `v{N}`.

### Get Variance
`budgetService.getVariance(id, actuals)` delegates to `VarianceService.compute()` with budget as baseline period.

## Top-Down Allocation

When budget type is TopDown, targets are distributed across departments and periods using:

- **Proportional** — spread by prior-year percentage
- **Equal** — uniform distribution across periods
- **Driver-Weighted** — weighted by linked driver projection
- **Manual** — custom percentage per department/period

## Bottom-Up Aggregation

Line items flow upward through the cost-center hierarchy:

```
Line Item → Cost Center → Department → Division → Entity Total
```

Each level can apply caps, overrides, or rollup rules defined in the budget template.

## Seed Data

The seed budget includes:
- Fiscal year 2026, BottomUp type, Approved status
- 12 department budgets with 8-15 line items each
- GL account mapping to standard chart of accounts
- Prior-year actuals for variance comparison
- Two revision versions demonstrating the lifecycle
