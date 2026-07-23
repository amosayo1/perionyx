# Chart of Accounts

## Overview

The Chart of Accounts (CoA) is the foundational structure for all financial recording. It provides a hierarchical account tree with 10 primary account types, control accounts, and support for custom accounts. The CoA supports multi-company, multi-currency deployments with account-level permissions and status management.

## Account Types

| Type | Normal Balance | Account Class |
|------|---------------|---------------|
| Asset | Debit | Current, Non-current, Contra |
| Liability | Credit | Current, Non-current, Contra |
| Equity | Credit | Equity, Contra-equity |
| Revenue | Credit | Revenue, Contra-revenue |
| Cost of Sales | Debit | Expense |
| Operating Expense | Debit | Expense |
| Other Income | Credit | Revenue |
| Other Expense | Debit | Expense |
| Tax | Debit | Expense |
| Memo | Debit/Credit | Memo |
| Custom | Debit/Credit | Custom |

## Account Statuses

- **Active** — Available for journal entry and posting
- **Inactive** — Not available for new entries, existing balances preserved
- **Frozen** — No activity allowed, requires admin override
- **Closed** — Period-end closed, no further activity

## Hierarchical Structure

Accounts are organized in a parent-child tree with up to 5 levels:

```
Level 0: 1000 Assets (Control Account)
Level 1: 1100 Cash and Cash Equivalents
Level 2: 1110 Cash - Operating
Level 2: 1120 Cash - Payroll
Level 1: 1200 Accounts Receivable
Level 2: 1210 Trade Receivables
Level 2: 1220 Allowance for Doubtful Accounts (Contra)
```

The tree structure is managed through:
- `parentId` references
- `level` depth tracking
- `path` for materialized path queries
- `isControlAccount` flag for control/total accounts

## Services

### ChartOfAccountsService

| Method | Description |
|--------|-------------|
| `addAccount()` | Create a new account |
| `getAccount()` | Get account by ID |
| `getAllAccounts()` | List all accounts |
| `getAccountsByType()` | Filter by account type |
| `getAccountsByStatus()` | Filter by status |
| `getAccountsByCompany()` | Filter by company |
| `getActiveAccounts()` | Get all active accounts |
| `getByCode()` | Find account by code |
| `getChildren()` | Get direct children |
| `getTree()` | Build hierarchical tree |
| `search()` | Search by code, name, or description |

## Hierarchical Account Codes

The standard account code scheme follows a 4-digit minimum convention:

- **Major categories**: 1000, 2000, 3000, 4000, 5000, 6000, 7000
- **Sub-categories**: 1100, 1200, 1300 (second-level groupings)
- **Detail accounts**: Individual accounts within sub-categories
- **Custom extension**: Sub-accounts for additional granularity
