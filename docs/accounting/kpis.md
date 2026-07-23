# Accounting KPIs

## Overview

The Accounting KPI module provides real-time financial performance metrics for executive decision-making. KPIs are computed from general ledger balances and categorized by financial domain.

## Profitability KPIs

| KPI | Formula | Interpretation |
|-----|---------|----------------|
| Net Income | Revenue - Total Expenses | Absolute profitability |
| Gross Margin | (Revenue - COGS) / Revenue × 100 | Profitability of core operations |
| Operating Margin | (Revenue - Operating Expenses) / Revenue × 100 | Operational efficiency |
| EBITDA | Net Income + Interest + Taxes + D&A | Cash operating earnings |

## Liquidity KPIs

| KPI | Formula | Interpretation |
|-----|---------|----------------|
| Working Capital | Current Assets - Current Liabilities | Short-term financial health |
| Current Ratio | Current Assets / Current Liabilities | Ability to pay short-term obligations |
| Quick Ratio | (Current Assets - Inventory) / Current Liabilities | Immediate liquidity |
| Cash Ratio | Cash / Current Liabilities | Pure cash liquidity |

## Leverage KPIs

| KPI | Formula | Interpretation |
|-----|---------|----------------|
| Debt Ratio | Total Liabilities / Total Assets | Financial leverage |
| Debt-to-Equity | Total Liabilities / Total Equity | Capital structure |

## Efficiency KPIs

| KPI | Formula | Interpretation |
|-----|---------|----------------|
| Return on Assets (ROA) | Net Income / Total Assets | Asset efficiency |
| Return on Equity (ROE) | Net Income / Shareholder's Equity | Shareholder value creation |

## Growth KPIs

| KPI | Formula | Interpretation |
|-----|---------|----------------|
| Revenue Growth | (Current Revenue - Prior Revenue) / Prior Revenue × 100 | Top-line growth |
| Expense Growth | (Current Expenses - Prior Expenses) / Prior Expenses × 100 | Cost growth |

## KPI Tracking

Each KPI is tracked with:
- Current value and target
- Previous value for trend comparison
- Trend direction (up, down, stable)
- Status indicator (good, warning, critical)
- Company and period association
- Timestamp

## AnalyticsService

| Method | Description |
|--------|-------------|
| `addKPI()` | Record a KPI value |
| `getKPI()` | Get KPI by ID |
| `getAllKPIs()` | List all KPIs |
| `computeNetIncome()` | Calculate net income from balances |
| `computeGrossMargin()` | Calculate gross margin percentage |
| `computeOperatingMargin()` | Calculate operating margin |
| `computeWorkingCapital()` | Calculate working capital |
| `computeCurrentRatio()` | Calculate current ratio |
