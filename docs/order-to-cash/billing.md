# Billing

## Invoice Lifecycle

Invoices follow a lifecycle managed by `BillingService`:

```
Draft → Submitted → Approved → Paid
                         ↓
                    Disputed → [Resolution] → Paid / Written Off
                         ↓
                    Cancelled / Written Off
```

| Status | Description |
|--------|-------------|
| `draft` | Invoice being prepared; not yet sent |
| `submitted` | Invoice sent to customer |
| `approved` | Invoice approved for payment |
| `paid` | Invoice fully paid |
| `disputed` | Customer has disputed the invoice |
| `cancelled` | Invoice cancelled |
| `written-off` | Invoice written off as uncollectible |

## Billing Types

The system supports multiple billing types (`BillingType`):

| Type | Description |
|------|-------------|
| `one-time` | Single invoice for a one-time charge |
| `recurring` | Regularly recurring invoices (monthly, quarterly, annual) |
| `subscription` | Subscription-based billing with recurring periods |
| `milestone` | Invoicing triggered by project milestones |
| `progress` | Progress-based billing (% completion) |
| `manual` | Manually created invoices |
| `automatic` | System-generated invoices from orders/contracts |

## Invoice Types

| Type | Description |
|------|-------------|
| `standard` | Standard customer invoice |
| `credit` | Credit note — reduces customer balance |
| `debit` | Debit note — increases customer balance |
| `recurring` | Recurring invoice (template-based) |
| `milestone` | Milestone-based invoice |

## AR Status Tracking

Every invoice tracks its accounts receivable status independently:
- `arStatus`: `open` / `overdue` / `paid` / `disputed` / `written-off` / `partially-paid`
- `agingBucket`: `current` / `1-30` / `31-60` / `61-90` / `91-plus`
- `daysOverdue`: Calculated days past due date
- `amountDue`, `amountPaid`, `amountOutstanding`: Payment tracking

## Credit & Debit Notes

Credit notes reduce the customer's outstanding balance and are used for:
- Returns and refunds
- Billing errors (overcharges)
- Customer goodwill adjustments
- Contractual discounts or rebates

Debit notes increase the customer's outstanding balance and are used for:
- Undercharges
- Additional charges after invoicing
- Late payment fees
- Interest charges

Both credit and debit notes follow the same invoice lifecycle and carry an `accountCode` for GL integration.

## Invoice Items

Each invoice contains line items (`InvoiceItem`) with:
- Line number, description, product code
- Quantity, unit, unit price
- Total price, tax rate, tax amount
- Reference to sales order item
- Account code, cost center, project

## Key Metrics

| Metric | Calculation |
|--------|-------------|
| Total Invoices | `count()` |
| Total Billed | Sum of all invoice `totalAmount` |
| Outstanding | Sum of `amountOutstanding` |
| Overdue Count | `getByARStatus("overdue").length` |
| Overdue Amount | Sum of `amountOutstanding` for overdue invoices |
