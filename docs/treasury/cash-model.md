# Cash Model

## Cash Classification

Cash is classified into 10 categories reflecting the organization's operational and financial structure:

| Classification | Purpose | Availability | Typical Uses |
|---|---|---|---|
| **Operating** | Day-to-day business operations | Immediate | Payroll, supplier payments, receivables |
| **Treasury** | Central treasury management | Immediate | Intercompany funding, investments |
| **Payroll** | Employee compensation | T+1 | Salary disbursement |
| **Tax** | Tax obligations | Scheduled | VAT, corporate tax, withholding |
| **Investment** | Short/medium-term investments | Varies | Money market, bonds, deposits |
| **Reserve** | Regulatory/buffer requirements | Restricted | Capital adequacy, liquidity coverage |
| **Restricted** | Legally or contractually restricted | None | Regulatory deposits, guarantees |
| **Escrow** | Held by third party pending conditions | Conditional | M&A, real estate, trade finance |
| **Collateral** | Pledged against obligations | None | Credit lines, derivatives |
| **Petty Cash** | Minor incidental expenses | Immediate | Office supplies, minor expenses |

## Cash Position

A `CashPosition` is a point-in-time record of cash in a specific account under a specific classification.

```
CashPosition {
  id, companyId, legalEntityId, region, currency
  classification: CashClassification
  totalBalance, availableBalance
  ledgerBalance, floatBalance, bankBalance
  bankAccountId, bankConnectionId
  providerKind, institutionName
  lastSyncedAt, recordedAt
}
```

Key distinction: **availableBalance** = totalBalance - minimumBalance - restrictedAmount.

## Cash Summary

The `CashEngine.summarizePositions()` computes:

- **Total Cash** — sum of all position balances
- **Available Cash** — sum of available balances
- **Restricted Cash** — sum of restricted-classification balances
- **Idle Cash** — totalCash - restrictedCash - operatingCash (cash not actively deployed)
- **Classification Breakdown** — by classification
- **Currency Breakdown** — by currency
- **Entity Breakdown** — by legal entity

## Working Capital

`CashEngine.computeWorkingCapital()`:

- **Net Working Capital** = Current Assets - Current Liabilities
- **Current Ratio** = Current Assets / Current Liabilities
- **Quick Ratio** = (Current Assets - Inventory) / Current Liabilities

## Policy Compliance

`CashEngine.checkPolicyViolations()` enforces per-account minimum/maximum balance policies and returns human-readable violation messages.

## Restricted Cash

Restricted cash is tracked separately via `RestrictedCash` entity with:

- **Restriction Type**: Regulatory, Contractual, Legal, Collateral, Escrow, Tax
- **Counterparty**: entity holding the restriction
- **Release Date**: expected release
- **Regulatory Reference**: compliance identifier
