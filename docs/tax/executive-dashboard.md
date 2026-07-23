# Tax Executive Dashboard

## Overview

The Tax Executive Dashboard provides CFOs, Tax Directors, and Controllers with a consolidated view of global tax operations. It surfaces the organization's total tax liability, effective tax rate trends, jurisdiction exposure, compliance health, filing calendar, and AI-powered insights — all in a single interface designed for speed and clarity.

## Dashboard Layout

```
+----------------------------------------------------------------------+
|  Tax Executive Dashboard                  [Period Selector] [Q]      |
+----------------------------------------------------------------------+
| +--------------+ +--------------+ +--------------+ +--------------+ |
| | Global ETR   | | Total Tax    | | Compliance   | | Tax Cash     | |
| | 27.4%        | | Liability    | | Score        | | Flow YTD     | |
| | v 0.3pp vs Q3| | $142.3M      | | 86 / 100     | | $118.5M      | |
| | Target: 25%  | | v 2.1% vs Q3 | | ^ +3 vs Q3  | | v vs budget  | |
| +--------------+ +--------------+ +--------------+ +--------------+ |
+----------------------------------------------------------------------+
| +-------------------------------------------+ +--------------------+ |
| |  Effective Tax Rate Trend                  | | Top Jurisdictions  | |
| |                                           | | by Exposure        | |
| |  30% -                                    | |                    | |
| |  28% -   .-.-.-.-.-.-.                    | | US:    $48.2M     | |
| |  26% -             .-.-.-.                | | UK:    $22.1M     | |
| |  24% -                                    | | DE:    $18.7M     | |
| |       +---+---+---+---+---+---+---+---+   | | IN:    $12.4M     | |
| |      Q1 Q2 Q3 Q4 Q1 Q2 Q3 Q4             | | AE:    $8.9M      | |
| |      . Actual  . Statutory                | | Other: $32.0M     | |
| +-------------------------------------------+ +--------------------+ |
+----------------------------------------------------------------------+
| +------------------------------------------------------------------+ |
| |  Compliance Heat Map                                             | |
| |                                                                  | |
| |  Jurisdiction    Filing   Payment  Doc        Overall           | |
| |  US (Federal)    G 98     G 100    G 95       G 97              | |
| |  US (California) F 82     G 95     F 78       F 85              | |
| |  UK              G 100    G 100    G 98       G 99              | |
| |  Germany         F 75     F 80     P 55       F 70              | |
| |  India           P 45     F 65     P 40       P 50              | |
| |  UAE             G 100    G 100    G 95       G 98              | |
| |  Singapore       G 95     G 100    G 90       G 95              | |
| |                                                                  | |
| |  G = Good (80-100) | F = Fair (60-79) | P = Poor (0-59)         | |
| +------------------------------------------------------------------+ |
+----------------------------------------------------------------------+
| +----------------------------+ +----------------------------------+ |
| |  Filing Calendar           | |  AI Insights                    | |
| |                            | |                                  | |
| |  Jan 15: UK VAT Q4 due    | |  > Tax liability forecast for   | |
| |  Jan 31: US 941 Q4 due    | |    Q4 is +8.2% above budget.    | |
| |  Feb 15: DE VAT Jan due   | |    Key drivers: Germany CIT     | |
| |  Mar 15: US 1120 due      | |    (+12%) and India GST (+15%).  | |
| |  Mar 31: AE VAT Q1 due    | |                                  | |
| |                            | |  > Compliance risk detected:    | |
| |  ! 3 deadlines this week  | |    Germany documentation        | |
| |                            | |    completeness at 55%.         | |
| +----------------------------+ |  > Refund opportunity: India    | |
|                                |    GST input credit backlog     | |
|                                |    of $2.1M identified.         | |
|                                +----------------------------------+ |
+----------------------------------------------------------------------+
```

## KPI Cards

### Primary KPI Row

The top section displays 4 primary KPIs:

| KPI | Description | Source | Refresh |
|-----|-------------|--------|---------|
| Global ETR | Blended effective tax rate across all entities | TaxAnalyticsService | Quarterly |
| Total Tax Liability | Sum of current + deferred tax liabilities | TaxService | Monthly |
| Compliance Score | Weighted compliance score across all jurisdictions | TaxComplianceService | Monthly |
| Tax Cash Flow YTD | Total tax payments made year-to-date | TaxPaymentService | Daily |

### Secondary KPI Row (below charts)

Secondary metrics shown on demand via expandable panels:

| KPI | Description |
|-----|-------------|
| Filing Timeliness | % of returns filed by due date |
| Payment Timeliness | % of payments made by due date |
| Open Violations | Count by severity |
| Penalty YTD | Total penalties incurred |
| Refund Cycle Time | Average days from claim to receipt |
| DTA/DTL Position | Net deferred tax position |
| Forecast Accuracy | Variance between forecast and actual |
| Total Tax Cost | Tax as % of revenue |

## Charts

### Effective Tax Rate Trend

- **Type**: Multi-line chart
- **Lines**: Actual ETR, Statutory rate, Forecast ETR
- **Period**: Rolling 8 quarters
- **Interaction**: Hover for detail, click for drill-down per jurisdiction
- **Annotation**: Key events (rate changes, acquisitions, audit settlements)

### Jurisdiction Exposure

- **Type**: Horizontal bar chart
- **Bars**: Top 10 jurisdictions by tax liability
- **Color**: By risk level (green/amber/red)
- **Interaction**: Click to navigate to jurisdiction detail

### Compliance Heat Map

- **Type**: Color-coded grid matrix
- **Rows**: Jurisdictions
- **Columns**: Filing, Payment, Documentation, Overall
- **Color**: Green (80-100), Amber (60-79), Red (0-59)
- **Interaction**: Click cell for detail

### Filing Calendar

- **Type**: Timeline/list view
- **Items**: Upcoming 30 deadlines
- **Status**: On track, approaching, overdue
- **Interaction**: Click to view return detail
- **Integration**: TaxCalendarService

### Tax Liability Breakdown

- **Type**: Donut or stacked bar
- **Segments**: By tax type (CIT, VAT, WHT, Other)
- **Period**: Current period
- **Interaction**: Click for breakdown

### Penalty Trend

- **Type**: Line/bar combo
- **Bars**: Total penalties by month
- **Line**: Rolling 12-month average
- **Annotation**: Key events causing penalties

## AI Insights Panel

The AI Insights panel (bottom-right) surfaces automated findings:

| Insight Type | Example | Source |
|-------------|---------|--------|
| Forecast variance | Q4 liability +8.2% above budget | TaxForecastService + AI |
| Compliance risk | Germany documentation at 55% | TaxComplianceService + AI anomaly detection |
| Opportunity | India GST $2.1M credit backlog | Anomaly detection |
| Penalty risk | US Q4 estimated payment may be short | Estimated payment calculation + AI |
| Narrative | Natural language summary of dashboard state | Executive narrative generation |

## Data Sources

### Module Data

| Data | Source Service |
|------|---------------|
| KPI values | TaxAnalyticsService |
| Liability data | DirectTaxService, IndirectTaxService, WithholdingTaxService |
| Compliance scores | TaxComplianceService |
| Filing calendar | TaxCalendarService, TaxReturnService |
| Payment data | TaxPaymentService |
| Forecast data | TaxForecastService |
| Audit events | TaxAuditService |
| Jurisdiction data | JurisdictionService |

### Cross-Module Data

| Data | Source Module |
|------|---------------|
| Revenue and profit | Accounting, O2C |
| Cash position | Treasury |
| FX rates | Treasury |
| Entity structure | Organization |

## Dashboard State Management

```typescript
interface ExecutiveDashboardState {
  selectedPeriod: string;
  selectedJurisdiction: string | null;  // null = all
  viewMode: "summary" | "detail";
  timeRange: "1Q" | "2Q" | "4Q" | "8Q" | "YTD";
  expandedSections: string[];           // Collapsed/expanded state
  filters: {
    entityId: string | null;
    taxType: TaxType | null;
    region: string | null;
  };
}
```

## Page Configuration

```typescript
interface ExecutiveDashboardConfig {
  showCharts: boolean;
  showHeatMap: boolean;
  showCalendar: boolean;
  showAIInsights: boolean;
  primaryKPIs: string[];                // Which 4 KPIs to show in header
  secondaryKPIs: string[];              // Which KPIs available in expandable section
  defaultTimeRange: string;
  autoRefreshInterval: number;          // Seconds (0 = no auto-refresh)
}
```

Config is persisted per-user and can be customized by Tax Directors for their specific workflows.
