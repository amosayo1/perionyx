# Invoice Matching

## Overview

The Invoice Matching module provides automated 2-way and 3-way matching to validate invoices against purchase orders and receipts. It supports 900 invoices with configurable tolerance rules, exception tracking, and resolution workflows.

## Matching Types

### 2-Way Matching

Compares invoice line items against the corresponding purchase order line items:

```
Invoice → PO
  quantity     quantity
  unitPrice    unitPrice
```

**Validation**: Quantity and unit price must match within tolerance.

**Use case**: Services and intangible goods where receipt verification is not required.

### 3-Way Matching

Compares invoice line items against both the purchase order and the goods receipt:

```
Invoice → PO → Receipt
  quantity    quantity
  unitPrice   unitPrice
              quantityAccepted
```

**Validation**: Invoice quantity must match accepted receipt quantity; unit price must match PO price.

**Use case**: Physical goods where receipt verification is required for payment.

## Invoice Lifecycle

```
Draft → Submitted → Matched → Approved → Paid
                      ↓
                  Disputed
```

### Invoice Statuses

| Status | Description |
|--------|-------------|
| `draft` | Initial entry, not yet submitted |
| `submitted` | Submitted for matching process |
| `matched` | Successfully matched against PO/receipt |
| `approved` | Approved for payment |
| `paid` | Payment completed |
| `disputed` | Matching exception requiring resolution |
| `cancelled` | Voided before or during processing |

### Match Statuses

| Status | Description |
|--------|-------------|
| `pending` | Awaiting matching process |
| `matched` | All checks passed within tolerance |
| `exception` | Discrepancy detected |
| `resolved` | Exception investigated and resolved |

## Tolerance Rules

Default tolerance thresholds:

| Parameter | Default Tolerance | Configurable |
|-----------|------------------|--------------|
| Quantity | ±0.01 units | Yes |
| Unit price | ±0.01 currency | Yes |
| Total | ±0.50 currency | Yes |
| Tax | ±1.00 currency | Yes |

Tolerance rules are applied per-line-item. Line items exceeding tolerance trigger an "exception" match status for that item, which may escalate the entire invoice to exception status depending on configuration.

## Exception Management

### Exception Types

| Type | Description |
|------|-------------|
| Quantity Variance | Invoice quantity differs from PO/receipt |
| Price Variance | Invoice unit price differs from PO |
| Missing PO | Invoice references non-existent PO |
| Missing Receipt | Invoice references unreceived goods |
| Duplicate Invoice | Potential duplicate invoice detection |
| Tax Discrepancy | Tax amount or rate mismatch |

### Resolution Workflow

1. **Detection**: System flags exception during matching
2. **Notification**: Approver/AP team notified
3. **Investigation**: Manual review of discrepancy
4. **Resolution**: Adjust invoice, adjust PO, or request credit memo
5. **Status Update**: Match status set to "resolved" or invoice set to "disputed"

## Auto-Approval Rules

Invoices meeting all criteria may be auto-approved:

- Match status is `matched` for all line items
- Total amount below configurable threshold
- Vendor is not blocked
- Vendor risk level is low or medium
- No active disputes or holds
- Valid tax calculation

## InvoiceMatchingService API

| Method | Description |
|--------|-------------|
| `addInvoice()` | Create a new invoice |
| `getInvoice()` | Get invoice by ID |
| `getAllInvoices()` | List all invoices |
| `getByStatus()` | Filter invoices by status |
| `getByVendor()` | Filter invoices by vendor |
| `getByPO()` | Filter invoices by PO |
| `getByCompany()` | Filter invoices by company |
| `getByMatchStatus()` | Filter by match status |
| `getExceptions()` | Get all exception invoices |
| `perform2WayMatch()` | Execute 2-way matching for an item |
| `perform3WayMatch()` | Execute 3-way matching for an item |
| `addMatchResult()` | Record a match result |
| `getMatchResults()` | Get match results for an invoice |
| `generateInvoiceNumber()` | Generate unique invoice identifier |
| `count()` | Total invoice count |
