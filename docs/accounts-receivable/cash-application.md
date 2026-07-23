# Cash Application

## Process
1. **Receipt Capture** — Payment received via bank transfer, check, ACH, wire, card
2. **Identification** — System identifies customer and open invoices
3. **Matching** — Receipt allocated to one or more invoices
4. **Application** — Payment applied, invoice status updated
5. **Exception Handling** — Unmatched receipts queued for manual review

## Matching Methods
- **Automatic** — Rule-based matching by invoice number, PO number, amount
- **Manual** — Collector selects invoices for application
- **Rule-Based** — Configurable matching rules (customer + amount range)

## Key Metrics
- Matching Rate: Percentage of receipts automatically applied
- Unapplied Amount: Total receipts pending allocation
- Application Time: Average time from receipt to application
