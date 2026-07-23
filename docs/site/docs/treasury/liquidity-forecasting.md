---
id: liquidity-forecasting
title: Liquidity Forecasting
sidebar_label: Liquidity Forecasting
---

# Liquidity Forecasting

Liquidity positions classify cash into tiers and provide forward-looking visibility into the organization's ability to meet its obligations.

## Liquidity Tiers

| Tier | Description | Examples |
|---|---|---|
| Operational | Cash needed for daily operations | Payroll, vendor payments |
| Reserve | Cash held for contingencies | Regulatory buffer, emergency fund |
| Surplus | Excess cash available for investment | Short-term instruments, intercompany loans |

The `TreasuryLiquidityPosition` model tracks the classification and distribution of cash across these tiers.

## Forecasting Model

The `TreasuryCashForecast` model projects future cash positions using:

- **Historical cash flow patterns** — Derived from Ledger transaction data
- **Known upcoming payments and receipts** — Scheduled payments, receivables, and commitments
- **AI-powered trend analysis** — Intelligence Platform models that identify seasonal patterns, growth trajectories, and anomalies
- **Configurable forecast horizons** — Daily, weekly, monthly, and quarterly projections

## Forecast Sources

Forecast data flows from multiple sources:

- **Ledger** — Historical cash flow patterns provide baseline projections
- **Treasury movements** — Known upcoming payments and receipts anchor short-term forecasts
- **Intelligence Platform** — AI models augment projections with trend analysis and anomaly detection
- **Bank integrations** — Real-time balance updates from Plaid and external banking service provide current-state accuracy

## Forecast Output

Forecasts are stored as time-series projections and feed into:

- **Reporting Platform** — Board pack visualization with forecast boundary markers
- **Executive dashboards** — Real-time liquidity position displays
- **Treasury operations** — Decision support for investment and funding decisions

## Cache Strategy

Forecasts are cached with tiered TTL:

- **Critical metrics** — 5-second TTL for real-time position data
- **Standard reports** — 60-second TTL for aggregated liquidity views
- **Historical data** — 600-second TTL for trend analysis and comparisons

## Interaction with Other Domains

| Domain | Interaction |
|---|---|
| Ledger | Historical cash flow patterns provide baseline data |
| Reporting | Liquidity data feeds board packs and executive dashboards |
| Intelligence Platform | AI models augment forecast accuracy |
| Integrations | Real-time bank balances improve forecast precision |
| Risk | Liquidity positions inform risk assessments |
