---
id: cash-management
title: Cash Management
sidebar_label: Cash Management
---

# Cash Management

Cash management tracks real-time and near-real-time cash positions across all accounts.

## Position Aggregation

Cash positions are aggregated by currency, account type, and entity. The `TreasuryCashPosition` model tracks current cash holdings by account and currency, providing a unified view of the organization's cash state.

## Pool Visibility

Cash pools group related accounts for consolidated viewing. The `TreasuryCashPool` model provides grouped cash accounts that give treasury teams visibility into how cash is distributed across entities, currencies, and account types.

## Movement Tracking

Every cash movement (wire, ACH, internal transfer) is recorded with source, destination, amount, and timestamp. The `TreasuryCashMovement` model captures individual cash inflows and outflows with full provenance.

## Restricted Cash

Cash subject to regulatory or contractual restrictions is tagged and excluded from available balance calculations. The `TreasuryRestrictedCash` model manages:

- Regulatory reserves
- Collateral requirements
- Contractual escrow amounts
- Usage restrictions with expiry tracking

## Cash Forecasting

The `TreasuryCashForecast` model projects future cash positions using:

- **Historical patterns** — Cash flow patterns derived from Ledger data
- **Known commitments** — Upcoming payments and receipts already scheduled
- **AI-powered trend analysis** — Intelligence Platform models that identify seasonal patterns and growth trajectories
- **Configurable horizons** — Daily, weekly, monthly, and quarterly projections

Forecasts are stored as time-series projections and feed into the Reporting Platform for board pack visualization.

## Funding Requests

The `TreasuryFundingRequest` model manages internal and external funding requests, tracking approval status, amounts, and disbursement timelines.

## Working Capital

Working capital management via `TreasuryWorkingCapital` tracks:

| Metric | Description |
|---|---|
| Days Sales Outstanding (DSO) | Average time to collect payment after a sale |
| Days Payable Outstanding (DPO) | Average time to pay suppliers |
| Cash Conversion Cycle (CCC) | Total time from cash outlay to cash collection |
| Working capital ratio | Current assets divided by current liabilities |

These metrics are computed from Ledger data and projected forward using Intelligence Platform forecasts.

## Core Model

| Model | Purpose |
|---|---|
| `TreasuryCashPosition` | Current cash holdings by account and currency |
| `TreasuryCashPool` | Grouped cash accounts for pooling visibility |
| `TreasuryCashMovement` | Individual cash inflows and outflows |
| `TreasuryCashForecast` | Projected cash positions over time horizons |
| `TreasuryFundingRequest` | Requests for internal or external funding |
| `TreasuryRestrictedCash` | Cash with usage restrictions (regulatory, collateral) |
| `TreasuryWorkingCapital` | Working capital metrics and trends |

## Interaction with Other Domains

| Domain | Interaction |
|---|---|
| Ledger | Treasury cash movements post as journal entries |
| Reporting | Cash position data feeds board packs and dashboards |
| Intelligence Platform | Cash flow patterns feed AI forecasting |
| Integrations | Bank data flows through connector framework and Plaid |
| Notifications | Position threshold alerts trigger notifications |
