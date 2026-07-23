# General Ledger

## Overview

The General Ledger (GL) is the central repository of all financial transactions. It maintains account balances across accounting periods, supports trial balance generation, and provides the foundation for financial statements.

## Account Balances

Each account has a balance record per period with:

| Field | Description |
|-------|-------------|
| `beginningDebit` | Opening debit balance |
| `beginningCredit` | Opening credit balance |
| `periodDebit` | Total debits for the period |
| `periodCredit` | Total credits for the period |
| `endingDebit` | Closing debit balance |
| `endingCredit` | Closing credit balance |
| `netChange` | Period change (debits - credits) |
| `endingBalance` | Net ending balance |

### Balance Calculation

```
endingBalance = (beginningDebit - beginningCredit) + (periodDebit - periodCredit)
```

For asset accounts (normal debit): positive = healthy
For liability/equity/revenue accounts (normal credit): negative = healthy

## Trial Balance

The trial balance is generated from period-level account balances and includes:

- Account code, name, type
- Beginning balance
- Period debits and credits
- Ending balance

Total debits should equal total credits for a balanced ledger.

## LedgerService

| Method | Description |
|--------|-------------|
| `addBalance()` | Record account balance |
| `getBalance()` | Get balance by ID |
| `getAllBalances()` | List all balances |
| `getBalancesByPeriod()` | Filter by period |
| `getBalancesByAccount()` | Filter by account |
| `getBalancesByCompany()` | Filter by company |
| `getBalanceForAccountPeriod()` | Get specific account-period balance |
| `generateTrialBalance()` | Generate trial balance for a period |

## Account Activity

The GL tracks activity by period, enabling drill-down from summary to transaction-level detail. Each balance record includes `lastActivity` timestamp for activity tracking.
