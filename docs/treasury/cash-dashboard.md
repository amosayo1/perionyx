# Cash Dashboard

## Component Inventory

### Shell & Navigation

| Component | File | Description |
|---|---|---|
| `ExecutiveTreasuryHeader` | `executive-treasury-header.tsx` | Title, timestamp, summary stats (entities, banks, regions, accounts, currencies, alerts), export/print/refresh buttons |
| `TreasuryFilters` | `treasury-filters.tsx` | Multi-select filters: region, currency, entity, institution, cash type. Responsive (collapsible on mobile). Active filter badge count. |

### Overview Section

| Component | File | Description |
|---|---|---|
| `CashPositionOverview` | `cash-position-overview.tsx` | 6 KPI cards with icon, value, daily change %, and trend indicator |
| `CashCompositionCard` | `cash-composition-card.tsx` | 10-category composition breakdown with progress bars and percentages |
| `AvailableCashWidget` | `available-cash-widget.tsx` | Available cash total with % of total, daily change |
| `RestrictedCashWidget` | `restricted-cash-widget.tsx` | Restricted cash total with % of total, daily change |
| `IdleCashWidget` | `idle-cash-widget.tsx` | Idle cash total with potential yield calculation |
| `WorkingCapitalWidget` | `working-capital-widget.tsx` | Working capital with current/quick ratios |
| `CashMovementTimeline` | `cash-movement-timeline.tsx` | Waterfall timeline: opening → collections → payments → funding → transfers → FX → closing |
| `DailyCashVariance` | `daily-cash-variance.tsx` | 7-day collections vs payments bar chart with net change |

### Regions Section

| Component | File | Description |
|---|---|---|
| `GlobalCashMap` | `global-cash-map.tsx` | Stacked horizontal bar chart of all 5 regions with daily change |
| `RegionalCashCard` | `regional-cash-card.tsx` | Per-region card with total, available, restricted, availability %, entity/bank/currency counts, trend |

### Entities Section

| Component | File | Description |
|---|---|---|
| `LegalEntityCashGrid` | `legal-entity-cash-grid.tsx` | Full data table: entity, region, currency, available, restricted, idle, working capital, liquidity score, daily change |

### Currencies Section

| Component | File | Description |
|---|---|---|
| `CurrencyPositionTable` | `currency-position-table.tsx` | Currency table: balance, functional amount, reporting amount, FX exposure, FX risk badge, % of total, trend |

### Institutions Section

| Component | File | Description |
|---|---|---|
| `InstitutionCashGrid` | `institution-cash-grid.tsx` | Card grid per institution: total, available, restricted, availability bar, account count, provider, relationship health |

### Analytics Section

| Component | File | Description |
|---|---|---|
| `CashTrendChart` | `cash-trend-chart.tsx` | Monthly cash trend (YTD) bar chart |
| `RegionalLiquidityChart` | `regional-liquidity-chart.tsx` | Per-region liquidity score with availability marker |
| `CurrencyDistributionChart` | `currency-distribution-chart.tsx` | Top 6 currencies by balance |
| `EntityExposureChart` | `entity-exposure-chart.tsx` | Entity available cash comparison |

### Alerts Section

| Component | File | Description |
|---|---|---|
| `CashAlertsPanel` | `cash-alerts-panel.tsx` | Alert list with severity icons, category, timestamp, unacknowledged count, border highlight |

## Data Types

All shared types are in `types.ts`:
- `CashPositionFilters`
- `RegionalCashData`
- `EntityCashData`
- `CurrencyPositionData`
- `InstitutionCashData`
- `CashCompositionItem`
- `CashMovementEvent`
- `DailyVariance`
- `TreasuryAlertData`
- `ExecutiveInsight`
- `KPIChange`
- `TreasuryKPIs`
- `TrendDataPoint`
- `ChartDataPoint`
