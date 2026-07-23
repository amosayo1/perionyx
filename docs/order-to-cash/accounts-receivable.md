# Accounts Receivable

## AR Management

Accounts Receivable (AR) tracks outstanding customer invoices and their payment status. The `ARService` manages AR records that provide a real-time view of what customers owe.

Each `ARRecord` tracks:
- Total invoice amount, amount due, amount paid, amount outstanding
- Invoice date, due date, days overdue
- Current status and aging bucket
- Dispute tracking

## Aging Buckets

AR records are categorized into aging buckets based on days past due:

| Bucket | Days Past Due | Risk Level |
|--------|---------------|------------|
| `current` | 0 days (not yet due) | Low |
| `1-30` | 1–30 days overdue | Low–Medium |
| `31-60` | 31–60 days overdue | Medium |
| `61-90` | 61–90 days overdue | High |
| `91+` | 91+ days overdue | Critical |

The aging analysis chart visualizes the distribution of outstanding amounts across buckets, enabling quick identification of concentration risk in older buckets.

## Customer Statements

Customer statements can be generated from AR records grouped by customer. Each statement shows:
- All open invoices with due dates and amounts
- Total outstanding balance
- Aging breakdown by bucket
- Payment history (from cash application)

## Dispute Management

Disputed invoices are tracked with:
- `dispute`: Boolean flag indicating active dispute
- `disputeReason`: Free-text reason provided by customer
- Resolution requires either payment (dispute resolved) or write-off

## Write-Offs & Bad Debt

When an invoice is deemed uncollectible:
1. Status changes to `written-off`
2. Amount is removed from outstanding AR
3. Bad debt is tracked for reporting

Write-offs may occur after failed collections, legal action, or customer insolvency.

## AR Statuses

| Status | Description |
|--------|-------------|
| `open` | Invoice is due but not yet overdue |
| `overdue` | Past due date |
| `paid` | Fully paid |
| `disputed` | Customer has raised a dispute |
| `written-off` | Written off as bad debt |
| `partially-paid` | Partial payment received |

## Key Metrics

| Metric | Calculation |
|--------|-------------|
| Total AR | Sum of `totalAmount` for all records |
| Outstanding AR | Sum of `amountOutstanding` |
| Overdue AR | Sum of `amountDue` for overdue records |
| Overdue % | `overdueAR / totalAR * 100` |
| Disputed Count | `getDisputed().length` |
| Aging Distribution | Per-bucket count and amount |
| DSO | `(totalAR / avgDailyRevenue)` |
