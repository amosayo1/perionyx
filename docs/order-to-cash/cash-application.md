# Cash Application

## Overview

Cash application is the process of matching incoming payments (cash receipts) to outstanding invoices. The `CashApplicationService` manages this matching process, supporting both automatic and manual application methods.

## Receipt Lifecycle

Each cash receipt progresses through:

```
Received → Unapplied → [Matching] → Applied
                              ↓
                         Partially Applied
```

| Status | Description |
|--------|-------------|
| `applied` | Receipt fully matched to invoices |
| `partial` | Partially matched; remaining amount unapplied |
| `unapplied` | No matching yet performed |
| `disputed` | Receipt or application disputed by customer |

## Application Methods

| Method | Description |
|--------|-------------|
| `automatic` | System auto-matches receipts to invoices based on customer, amount, and reference |
| `manual` | User manually assigns receipt to invoices |

## Matching Types

### Full Payment
Receipt amount exactly matches invoice amount. Auto-matched when reference numbers or amounts match.

### Partial Payment
Customer pays less than the full invoice amount. May indicate:
- Short payment (customer disputing part of invoice)
- Cash discount (early payment discount)
- Installment payment

### Overpayment
Customer pays more than the invoice amount. Excess becomes:
- Credit on account (applied to future invoices)
- Refund to customer

### Short Payment
Customer pays less with no explanation. Triggers:
- Collection case creation
- Dispute investigation

## Unapplied Cash

Cash that cannot be matched to any invoice remains as `unapplied`. This may be due to:
- Missing or incorrect remittance information
- Advance payments / deposits
- Overpayments pending resolution

Unapplied cash is tracked with:
- `unappliedAmount`: Amount not yet matched
- Aging from receipt date

## Cash Application Matching

The `CashApplication` record ties a receipt to an invoice:

| Field | Description |
|-------|-------------|
| `receiptId` | Source cash receipt |
| `invoiceId` | Target invoice |
| `appliedAmount` | Amount applied to this invoice |
| `appliedDate` | Date of application |
| `currency` | Currency of application |
| `exchangeRate` | Exchange rate if different from receipt currency |

## Key Metrics

| Metric | Calculation |
|--------|-------------|
| Total Receipts | `count()` |
| Total Cash Received | Sum of all receipt amounts |
| Applied Amount | Sum of `appliedAmount` for applied receipts |
| Unapplied Amount | Sum of `unappliedAmount` |
| Application Rate | `applied / total * 100` |
| Unapplied Count | Receipts with `unappliedAmount > 0` |
