# Procurement KPIs

## Overview

The Procurement KPI module provides 16 real-time metrics covering spend, vendor performance, operational efficiency, savings, and compliance. KPIs are computed from transactional data and categorized for executive dashboards.

## Spend KPIs

| KPI | Unit | Description |
|-----|------|-------------|
| Total Spend | USD | Aggregate procurement spend across all categories |
| Spend per Department | USD | Spend broken down by organizational unit |
| Spend per Category | USD | Spend by procurement category |

## Vendor KPIs

| KPI | Unit | Description |
|-----|------|-------------|
| Active Vendors | count | Number of active vendor relationships |
| Vendor On-Time Rate | percent | Percentage of orders delivered on schedule |
| Vendor Quality Score | percent | Average quality rating across all vendors |
| Vendor Risk Score | score | Composite vendor risk assessment |

## Efficiency KPIs

| KPI | Unit | Description |
|-----|------|-------------|
| PO Cycle Time | days | Average time from PO creation to approval |
| Invoice Processing Time | days | Average time from invoice receipt to approval |
| Receipt-to-Invoice Match Rate | percent | Percentage of invoices successfully matched |
| Purchase Request Approval Time | hours | Average PR approval turnaround |

## Savings KPIs

| KPI | Unit | Description |
|-----|------|-------------|
| Cost Savings | USD | Total procurement savings achieved |
| Savings as % of Spend | percent | Savings relative to total spend |

## Compliance KPIs

| KPI | Unit | Description |
|-----|------|-------------|
| Contract Compliance Rate | percent | Percentage of spend under active contracts |
| Policy Compliance Rate | percent | Adherence to procurement policies |
| Budget Adherence | percent | Spend within approved budget limits |

## KPI Tracking

Each KPI is tracked with:

| Attribute | Description |
|-----------|-------------|
| `name` | KPI identifier |
| `value` | Current period value |
| `previousValue` | Prior period for comparison |
| `target` | Target value |
| `unit` | Measurement unit (USD, count, percent, days, score) |
| `category` | KPI domain (spend, vendor, efficiency, savings, compliance) |
| `trend` | Direction (up, down, stable) |
| `status` | Health indicator (good, warning, critical) |
| `companyId` | Company association |
| `period` | Time period identifier |
| `date` | Measurement timestamp |

## KPI Computation

KPIs are computed by the `ExpenseService` based on transactional data:

| KPI | Source Data |
|-----|-------------|
| Total Spend | Sum of all PO totals |
| Active Vendors | Count of vendors with status = active |
| Vendor On-Time Rate | Average of vendor performance onTimeDelivery scores |
| Vendor Quality Score | Average of vendor performance qualityScore values |
| PO Cycle Time | Average time between PO creation and approval |
| Invoice Processing Time | Average time between invoice receipt and approval |
| Match Rate | (Matched invoices / Total invoices) × 100 |
| Cost Savings | Sum of savingsAmount across all analytics |
| Budget Adherence | Average of budgetPercent across departments |

## KPI Display

KPIs can be rendered using the `FPAKPICard` component which supports:
- Title and value display
- Optional trend indicator (up/down/stable)
- Status color coding (good/warning/critical)
- Subtitle for context
- Icon slot for visual cues
