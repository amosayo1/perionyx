---
title: "Residual Handling Prevents Allocation Drift"
created: 2026-07-21
tags: [type/lesson, domain/engineering, domain/finance]
phase: Phase 19.1
---

# Residual Handling Prevents Allocation Drift

When splitting a monetary amount across N targets using percentage-based allocation, the last target must receive the residual (total - sum of previous allocations) rather than computing its share independently. Independent computation produces rounding errors where sum(entries) ≠ total. The residual pattern guarantees sum(entries) === total exactly.

## Example

Allocate $100.00 across 3 accounts at 33.33% each:

| Approach | Account 1 | Account 2 | Account 3 | Sum | Matches Total? |
|----------|-----------|-----------|-----------|-----|----------------|
| Independent | $33.33 | $33.33 | $33.33 | $99.99 | **NO** — $0.01 lost |
| Residual | $33.33 | $33.33 | $33.34 | $100.00 | **YES** — exact |

The last account gets the residual: `100.00 - 33.33 - 33.33 = 33.34`.

## Why It Matters

- **Financial integrity**: CFOs expect `sum(allocation entries) === total`. Always. No exceptions.
- **Audit trail**: Auditors check that debits equal credits. A $0.01 discrepancy is a finding.
- **Reconciliation**: Downstream systems (GL, treasury) reject entries that don't balance.

## Implementation

```typescript
function allocateAmount(total: number, percentages: number[]): number[] {
  const amounts: number[] = [];
  let remaining = toDecimal(total);

  for (let i = 0; i < percentages.length; i++) {
    if (i === amounts.length - 1) {
      // Last target gets the residual
      amounts.push(remaining.toNumber());
    } else {
      const allocated = financialRound(total * percentages[i] / 100, 2);
      remaining = remaining.sub(allocated);
      amounts.push(allocated);
    }
  }

  return amounts;
}
```

## When This Applies

- GL account allocation (percentage-based journal entries)
- Cash application (allocating payments across invoices)
- Tax distribution (allocating tax across line items)
- Cost allocation (allocating overhead across departments)
- Any scenario where a total must be split into N parts that sum exactly to the total

## Related

- [[05-Engineering/Lessons/26-financial-precision-is-non-negotiable|Financial Precision Is Non-Negotiable]] — broader principle this lesson implements
- [[11-ADR/decision-network|Decision Network]] — Principle #4 codifies this pattern
