# Tax KPIs — Key Performance Indicators

## Overview

The Tax module tracks 20+ KPIs across 10 categories covering tax performance, compliance, efficiency, risk, and cost. All KPIs are computed by `TaxAnalyticsService` and displayed across tax pages via `FPKpiCard` components.

## KPI Reference

### Tax Rate KPIs

| KPI | Formula | Unit | Target | Good | Warning | Bad |
|-----|---------|------|--------|------|---------|-----|
| Effective Tax Rate (ETR) | `Tax Expense / Pre-Tax Profit` | % | Jurisdiction statutory rate | ±1% of statutory | ±3% of statutory | >±3% |
| Cash Effective Tax Rate | `Cash Tax Paid / Pre-Tax Profit` | % | Close to ETR | ±2% of ETR | ±5% of ETR | >±5% |
| VAT/GST Effective Rate | `Output VAT / Taxable Sales` | % | Standard rate | ±0.5% of std rate | ±1% of std rate | >±1% |
| Tax Rate Volatility | `StdDev(ETR over 4 quarters)` | pp | < 1 pp | 1–2 pp | 2–5 pp | > 5 pp |

### Efficiency KPIs

| KPI | Formula | Unit | Target | Good | Warning | Bad |
|-----|---------|------|--------|------|---------|-----|
| VAT Recovery Rate | `Input VAT Recovered / Total Input VAT` | % | > 95% | 90–95% | 80–90% | < 80% |
| WHT Recovery Rate | `WHT Recovered / Total WHT Deducted` | % | > 80% | 70–80% | 50–70% | < 50% |
| DTA Utilization Rate | `DTA Utilized / DTA Available` | % | > 80% | 60–80% | 40–60% | < 40% |
| Return Filing Time | `Days from period end to filing` | Days | < 30 | 30–45 | 45–60 | > 60 |
| Amendment Rate | `Amended Returns / Total Returns` | % | < 5% | 5–10% | 10–20% | > 20% |

### Compliance KPIs

| KPI | Formula | Unit | Target | Good | Warning | Bad |
|-----|---------|------|--------|------|---------|-----|
| Compliance Score | `Weighted multi-dimension score` | 0–100 | > 90 | 80–90 | 70–80 | < 70 |
| Filing Timeliness | `Returns Filed On Time / Total Returns` | % | > 99% | 95–99% | 90–95% | < 90% |
| Payment Timeliness | `Payments Made On Time / Total Payments` | % | > 99% | 95–99% | 90–95% | < 90% |
| Open Violations | `Count of unresolved violations` | Count | 0 | 1–3 | 4–10 | > 10 |
| Audit Readiness Score | `Readiness checklist score` | % | > 90% | 80–90% | 70–80% | < 70% |
| Deadline Compliance | `Deadlines Met / Total Deadlines` | % | > 99% | 95–99% | 90–95% | < 90% |

### Cost KPIs

| KPI | Formula | Unit | Target | Good | Warning | Bad |
|-----|---------|------|--------|------|---------|-----|
| Total Tax Cost | `Sum of all tax payments + penalties` | Currency | Budget | ≤ budget | ≤ 110% budget | > 110% |
| Tax as % of Revenue | `Total Tax Cost / Total Revenue` | % | Industry benchmark | ±0.5% of benchmark | ±1% | >±1% |
| Penalty Rate | `Total Penalties / Total Tax Paid` | bps | < 10 bps | 10–25 bps | 25–50 bps | > 50 bps |
| Tax Compliance Cost | `Internal + External compliance cost` | Currency | Budget | ≤ budget | ≤ 110% budget | > 110% |

### Deferred Tax KPIs

| KPI | Formula | Unit | Target | Good | Warning | Bad |
|-----|---------|------|--------|------|---------|-----|
| DTA / Total Assets | `DTA / Total Assets` | % | Varies by industry | — | — | — |
| DTL / Total Liabilities | `DTL / Total Liabilities` | % | Varies by industry | — | — | — |
| Valuation Allowance Ratio | `Valuation Allowance / Gross DTA` | % | < 20% | 20–40% | 40–60% | > 60% |
| Deferred Tax Volatility | `Quarter-over-quarter change in net DTA` | % | < 10% | 10–20% | 20–30% | > 30% |

### Withholding Tax KPIs

| KPI | Formula | Unit | Target | Good | Warning | Bad |
|-----|---------|------|--------|------|---------|-----|
| Treaty Utilization | `Treaty Rate Transactions / Eligible Transactions` | % | > 85% | 75–85% | 60–75% | < 60% |
| Certificate Issuance | `Certificates Issued / WHT Transactions` | % | > 95% | 90–95% | 80–90% | < 80% |
| WHT Remittance Timeliness | `WHT Remitted On Time / Total WHT` | % | > 99% | 95–99% | 90–95% | < 90% |

### Transfer Pricing KPIs

| KPI | Formula | Unit | Target | Good | Warning | Bad |
|-----|---------|------|--------|------|---------|-----|
| Arm's Length Compliance | `Transactions Within Range / Total Transactions` | % | > 95% | 90–95% | 85–90% | < 85% |
| Documentation Currency | `Documents Current / Total Required Documents` | % | 100% | — | 80–99% | < 80% |
| TP Adjustment Rate | `Transactions Adjusted / Total Transactions` | % | < 5% | 5–10% | 10–15% | > 15% |
| Audit Exposure Score | `Risk-weighted transaction value` | Score | 0–100 scale | < 30 | 30–60 | > 60 |

### Forecast KPIs

| KPI | Formula | Unit | Target | Good | Warning | Bad |
|-----|---------|------|--------|------|---------|-----|
| Forecast Accuracy | `1 - (Actual - Forecast) / Actual` | % | > 95% | 90–95% | 80–90% | < 80% |
| Forecast Confidence | `Average confidence interval width` | ±% of forecast | < 10% | 10–15% | 15–25% | > 25% |

### Refund KPIs

| KPI | Formula | Unit | Target | Good | Warning | Bad |
|-----|---------|------|--------|------|---------|-----|
| Refund Cycle Time | `Days from claim to receipt` | Days | < 60 | 60–90 | 90–180 | > 180 |
| Refund Claim Rate | `Refunds Claimed / Total Overpayments` | % | > 90% | 80–90% | 70–80% | < 70% |
| Refund Success Rate | `Refunds Received / Refunds Claimed` | % | > 95% | 90–95% | 80–90% | < 80% |

### Penalty KPIs

| KPI | Formula | Unit | Target | Good | Warning | Bad |
|-----|---------|------|--------|------|---------|-----|
| Total Penalties Incurred | `Sum of all tax penalties` | Currency | $0 | — | — | — |
| Penalty Frequency | `Penalty Events / Period` | Count | 0 | 1 | 2–5 | > 5 |
| Average Penalty Amount | `Total Penalties / Penalty Count` | Currency | Varies | — | — | — |
| Penalty Waiver Rate | `Penalties Waived / Total Penalties Assessed` | % | > 50% | 30–50% | 15–30% | < 15% |

## Aggregated KPIs

### Cross-Domain KPIs

| KPI | Description | Computation |
|-----|-------------|-------------|
| Total Tax Liability | Sum of all current tax liabilities across jurisdictions | `Σ(currentTaxPayable)` |
| Total Deferred Tax Position | Net DTA/DTL across all jurisdictions | `Σ(DTA) - Σ(DTL)` |
| Global ETR | Weighted average ETR across all entities | `Σ(taxExpense) / Σ(profitBeforeTax)` |
| Tax Cash Flow | Total tax payments made in period | `Σ(taxPayments)` |
| Compliance Health Index | Weighted composite of all compliance KPIs | Normalized 0–100 score |
| Tax Risk Score | Weighted composite of risk indicators | Normalized 0–100 score |
| Forecast vs Actual | Variance analysis for key tax line items | `(Actual - Forecast) / Forecast` |

### Executive Dashboard KPIs

The executive dashboard highlights 8 primary KPIs:

| # | KPI | Context | Refresh |
|---|-----|---------|---------|
| 1 | Global Effective Tax Rate | vs statutory, vs prior period | Quarterly |
| 2 | Total Tax Liability | Current + deferred | Monthly |
| 3 | Compliance Score | Jurisdiction-weighted | Monthly |
| 4 | Filing Timeliness | Weighted by tax amount | Monthly |
| 5 | Total Tax Paid YTD | vs budget, vs prior year | Daily |
| 6 | Open Violations | Count by severity | Real-time |
| 7 | Penalty YTD | vs budget, vs prior year | Monthly |
| 8 | Refund Cycle Time | Average days | Monthly |

## KPI Data Model

```typescript
interface TaxKPI {
  id: string;
  category: KpiCategory;
  code: string;                       // Machine-readable code
  name: string;                       // Human-readable name
  description: string;
  value: number;
  unit: string;
  status: "good" | "warning" | "bad" | "neutral";
  trend: "up" | "down" | "stable";
  changePercentage: number | null;    // Period-over-period change
  target: number | null;
  benchmark: number | null;
  period: string;
  entityId: string | null;
  jurisdictionId: string | null;
  sourceService: string;
  lastUpdated: string;
}

type KpiCategory =
  | "tax-rate" | "efficiency" | "compliance" | "cost"
  | "deferred-tax" | "withholding" | "transfer-pricing"
  | "forecast" | "refund" | "penalty" | "cross-domain";
```
