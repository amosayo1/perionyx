# FP&A KPIs

## Overview

Complete list of financial KPIs with formulas used throughout the FP&A module.

## Revenue KPIs

| KPI | Formula | Unit |
|-----|---------|------|
| Revenue Growth Rate | ((Current Period Revenue - Prior Period Revenue) / Prior Period Revenue) × 100 | % |
| Net Revenue | Total Revenue - Returns - Discounts - Allowances | USD |
| Recurring Revenue % | (Recurring Revenue / Total Revenue) × 100 | % |
| Revenue per Customer | Total Revenue / Number of Customers | USD |

## Profitability KPIs

| KPI | Formula | Unit |
|-----|---------|------|
| Gross Margin | ((Revenue - COGS) / Revenue) × 100 | % |
| Operating Margin | (Operating Income / Revenue) × 100 | % |
| EBITDA Margin | (EBITDA / Revenue) × 100 | % |
| Net Profit Margin | (Net Income / Revenue) × 100 | % |
| Return on Equity | (Net Income / Shareholder's Equity) × 100 | % |
| Return on Assets | (Net Income / Total Assets) × 100 | % |
| ROI | (Gain from Investment - Cost of Investment) / Cost of Investment × 100 | % |

## Liquidity KPIs

| KPI | Formula | Unit |
|-----|---------|------|
| Current Ratio | Current Assets / Current Liabilities | ratio |
| Quick Ratio | (Current Assets - Inventory) / Current Liabilities | ratio |
| Working Capital | Current Assets - Current Liabilities | USD |

## Efficiency KPIs

| KPI | Formula | Unit |
|-----|---------|------|
| Days Sales Outstanding | (Accounts Receivable / Total Credit Sales) × Number of Days | days |
| Days Payable Outstanding | (Accounts Payable / Cost of Goods Sold) × Number of Days | days |
| Asset Turnover | Revenue / Total Assets | ratio |
| Inventory Turnover | COGS / Average Inventory | ratio |

## Growth KPIs

| KPI | Formula | Unit |
|-----|---------|------|
| Revenue Growth YoY | ((Current Year Revenue - Prior Year Revenue) / Prior Year Revenue) × 100 | % |
| Customer Growth Rate | ((Current Customers - Prior Customers) / Prior Customers) × 100 | % |
| Market Share | (Company Revenue / Total Market Revenue) × 100 | % |

## Budget KPIs

| KPI | Formula | Unit |
|-----|---------|------|
| Budget Variance % | ((Actual - Budget) / Budget) × 100 | % |
| Budget Utilization | (Actual Spend / Budget) × 100 | % |

## Forecast KPIs

| KPI | Formula | Unit |
|-----|---------|------|
| Forecast Accuracy | 100 - (|Actual - Forecast| / Forecast) × 100 | % |
| Forecast Bias | (Actual - Forecast) / Forecast × 100 | % |

## Cash Flow KPIs

| KPI | Formula | Unit |
|-----|---------|------|
| Free Cash Flow | Operating Cash Flow - Capital Expenditures | USD |
| Cash Flow Margin | (Operating Cash Flow / Revenue) × 100 | % |
| Operating Cash Flow | Net Income + Non-Cash Expenses - Changes in Working Capital | USD |

## ExecutiveService Computations

The `ExecutiveService` provides programmatic KPI computation:

```typescript
import { fpaService } from "@/server/fpa";

// Revenue growth
const revenueGrowth = fpaService.executive.computeRevenueGrowth(
  currentRevenue, previousRevenue
);

// Budget utilization
const utilization = fpaService.executive.computeBudgetUtilization(
  totalBudget, totalActual
);

// Forecast accuracy
const accuracy = fpaService.executive.computeForecastAccuracy(
  forecastValue, actualValue
);

// Expense ratio
const expenseRatio = fpaService.executive.computeExpenseRatio(
  totalExpenses, totalRevenue
);

// Scorecard score
const { score, maxScore, percentage } = fpaService.executive.generateScorecardScore(kpis);
```
