# Spend Analytics

## Overview

The Spend Analytics module provides comprehensive procurement spend intelligence across multiple dimensions. It tracks 300 spend analytics records, 16 KPIs, and 300 forecasts to give procurement leaders visibility into spending patterns, savings opportunities, and budget adherence.

## Spend Dimensions

Spend data is analyzed across 5 dimensions:

| Dimension | Description | Examples |
|-----------|-------------|----------|
| `department` | Spend by organizational unit | Engineering, Sales, Marketing |
| `category` | Spend by procurement category | IT Hardware, Software, Consulting |
| `vendor` | Spend by vendor | Individual vendor spend totals |
| `project` | Spend by project | PROJ-A, PROJ-B, PROJ-C |
| `cost-center` | Spend by cost center | CC-001, CC-002, CC-003 |

## Spend Analytics Structure

Each `SpendAnalytic` record contains:

| Field | Description |
|-------|-------------|
| `dimension` | Analysis dimension |
| `dimensionValue` | Specific value within dimension |
| `period` | Time period (e.g., "2025-Q1") |
| `totalSpend` | Total spend for this segment |
| `totalOrders` | Number of purchase orders |
| `totalInvoices` | Number of invoices |
| `avgOrderValue` | Average order value |
| `savingsAmount` | Savings achieved |
| `savingsPercent` | Savings as percentage of spend |
| `budgetConsumed` | Budget amount consumed |
| `budgetRemaining` | Remaining budget |
| `budgetPercent` | Budget utilization percentage |

## Vendor Analytics

Vendor-level spend analysis provides:
- Total spend per vendor
- Order volume and frequency
- Average order value
- Spend trend over time
- Savings achieved through negotiations
- Concentration risk (percentage of total spend)

## Department Analytics

Department-level spend analysis enables:
- Budget vs actual comparison
- Category mix within departments
- Year-over-year trend analysis
- Per-employee spend metrics
- Cross-department benchmarking

## Category Analytics

Category-level analysis supports:
- Strategic sourcing decisions
- Category consolidation opportunities
- Price trend monitoring
- Supplier concentration assessment
- Compliance with preferred vendor programs

## Savings Tracking

Savings are tracked at multiple levels:

| Savings Type | Measurement |
|--------------|-------------|
| Negotiated savings | Savings amount and percentage |
| Early payment discounts | Discount capture rate |
| Bulk purchase savings | Volume discount effectiveness |
| Vendor consolidation | Rate improvement from consolidation |
| Category optimization | Savings from strategic sourcing |

## Budget Consumption

Budget tracking provides:
- Budget vs actual per dimension
- Consumption rate over time
- Forecast vs budget comparison
- Over-budget alerts
- Remaining budget projections

## ProcurementKPI Metrics

See [KPIs](kpis.md) for complete list of 16 procurement metrics including Total Spend, Spend by Vendor, Spend by Department, Avg Order Value, Savings %, Budget Utilization, On-Time Delivery, Invoice Accuracy, and more.

## ProcurementForecast

Forecasts are generated for 4 metrics across multiple time horizons:

| Horizon | Period |
|---------|--------|
| 1 month | Short-term operational |
| 3 months | Quarterly planning |
| 6 months | Bi-annual outlook |
| 1 year | Annual budgeting |

Each forecast includes:
- Current value and forecast value
- Lower and upper confidence bounds
- Confidence score (60-95%)
- Trend direction indicator

## Integration with Budgeting

Spend analytics integrates with the FP&A Planning module for:
- Budget consumption tracking
- Procurement forecast alignment
- Variance analysis against budget
- Capital vs operating spend classification
- Fiscal period comparisons
