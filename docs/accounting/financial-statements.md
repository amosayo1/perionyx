# Financial Statements

## Overview

The Financial Statements module generates standard financial reports from the general ledger. It supports Trial Balance, Balance Sheet, Income Statement, Cash Flow Statement, and Statement of Changes in Equity.

## Statement Types

| Type | Description |
|------|-------------|
| Trial Balance | All accounts with beginning balances, period activity, and ending balances |
| Balance Sheet | Assets, Liabilities, and Equity at a point in time |
| Income Statement | Revenue, Expenses, and Net Income over a period |
| Cash Flow | Operating, Investing, and Financing cash flows |
| Statement of Changes in Equity | Equity movements over a period |
| General Ledger Report | Account detail with transaction history |
| Account Activity | Activity for a specific account over a period |

## Statement Structure

Each statement is composed of rows with:

| Field | Description |
|-------|-------------|
| Account ID/Code/Name | Account identification |
| Level | Indentation level for hierarchy |
| Type | header, account, total, subtotal |
| Amount | Current period amount |
| Previous Amount | Prior period for comparison |
| Variance | Absolute difference |
| Variance Percent | Percentage change |
| Indent | Visual indentation level |
| Bold/Italic | Formatting hints |

## Trial Balance

The Trial Balance is the foundation for all other statements:
- Lists every account with its ending balance
- Total debits must equal total credits
- Used to verify ledger accuracy before closing

## Balance Sheet

Structure:

```
ASSETS
  Current Assets
    Cash and Cash Equivalents
    Accounts Receivable
    Inventory
    Prepaid Expenses
  Non-Current Assets
    Property, Plant & Equipment
    Intangible Assets
    Investments
TOTAL ASSETS

LIABILITIES
  Current Liabilities
    Accounts Payable
    Short-term Debt
    Accrued Liabilities
  Non-Current Liabilities
    Long-term Debt
    Deferred Tax Liabilities
TOTAL LIABILITIES

EQUITY
  Common Stock
  Retained Earnings
  Accumulated Other Comprehensive Income
TOTAL EQUITY

TOTAL LIABILITIES & EQUITY
```

## Income Statement

Structure:

```
REVENUE
  Product Revenue
  Service Revenue
  Other Revenue
GROSS REVENUE
Cost of Sales
GROSS PROFIT

Operating Expenses
  Salaries & Wages
  Professional Fees
  Technology
  Office & Administrative
  Marketing & Sales
  Depreciation & Amortization
  Research & Development
TOTAL OPERATING EXPENSES

OPERATING INCOME
Other Income/Expenses
  Interest Income
  Interest Expense
  Foreign Exchange Gains/Losses
  Tax Expense

NET INCOME
```

## Cash Flow Statement

Structure:

```
CASH FLOW FROM OPERATING ACTIVITIES
  Net Income
  Adjustments for:
    Depreciation & Amortization
    Changes in Working Capital
  Net Cash from Operations

CASH FLOW FROM INVESTING ACTIVITIES
  Purchase of Property & Equipment
  Purchase of Investments
  Net Cash from Investing

CASH FLOW FROM FINANCING ACTIVITIES
  Debt Proceeds
  Debt Repayment
  Equity Issuance
  Dividends Paid
  Net Cash from Financing

NET CHANGE IN CASH
Beginning Cash Balance
ENDING CASH BALANCE
```
