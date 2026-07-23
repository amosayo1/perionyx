# Risk Reporting

## Overview

The risk reporting system generates structured reports across multiple formats for different audiences: executive dashboards, detailed analysis, and regulatory filings.

## Report Types

| Type | Description | Audience |
|---|---|---|
| dashboard | Visual summary with metrics and charts | Executives, Risk Committee |
| summary | Condensed narrative with key findings | Board of Directors |
| detailed | Comprehensive analysis with full data | Risk Management, Internal Audit |
| regulatory | Compliance-focused reports | Regulators, Compliance |

## RiskReport Entity

| Field | Type | Description |
|---|---|---|
| id | string | Unique identifier |
| title | string | Report title |
| type | ReportType | Dashboard, summary, detailed, regulatory |
| period | string | Reporting period (e.g., "Q1 2026") |
| generatedAt | Date | When report was generated |
| section | string | JSON string with report sections |
| companyId | string | Tenant ID |

## Service API

```typescript
class RiskReportService {
  add(item: RiskReport): RiskReport
  get(id: string): RiskReport | undefined
  getAll(): RiskReport[]
  update(id: string, update: Partial<RiskReport>): RiskReport | undefined
  delete(id: string): boolean
  getByPeriod(period: string): RiskReport[]
  getByType(type: ReportType): RiskReport[]
  count(): number
}
```

## Supporting Components

- **RiskHeatmap**: Generates 5×5 heatmaps from register data, mapping likelihood vs impact by category
- **RiskScenario**: Stress testing scenarios with likelihood/impact estimates
- **RiskAnalytics**: KPI tracking, alert management, and AI-generated recommendations
- **RiskAggregateMetrics**: Rollup metrics for dashboard consumption
