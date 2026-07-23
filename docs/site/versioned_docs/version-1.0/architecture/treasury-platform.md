---
id: treasury-platform
title: Treasury Platform
sidebar_label: Treasury Platform
description: Cash management, liquidity, FX exposure, counterparty risk, bank integrations, and working capital for the Perionyx treasury domain.
---

# Treasury Platform

## Domain Overview

The Treasury Platform manages an organization's cash, liquidity, foreign exchange exposure, and financial risk. It is located in `src/modules/treasury/` and consists of three primary service files plus 12 Prisma models.

## Core Models

The treasury domain introduces the following models in the Prisma schema:

| Model | Purpose |
|---|---|
| `TreasuryCashPosition` | Current cash holdings by account and currency |
| `TreasuryLiquidityPosition` | Liquidity classification (operational, reserve, surplus) |
| `TreasuryCashPool` | Grouped cash accounts for pooling visibility |
| `TreasuryCashMovement` | Individual cash inflows and outflows |
| `TreasuryCashForecast` | Projected cash positions over time horizons |
| `TreasuryFundingRequest` | Requests for internal or external funding |
| `TreasuryInvestmentBucket` | Short-term investment allocations |
| `TreasuryRestrictedCash` | Cash with usage restrictions (regulatory, collateral) |
| `TreasuryWorkingCapital` | Working capital metrics and trends |
| `TreasuryFXExposure` | Foreign currency exposure by currency pair |
| `TreasuryCounterpartyRisk` | Counterparty credit risk assessments |
| `TreasuryCashPolicy` | Cash management policy rules and limits |

## Cash Management

Cash management tracks real-time and near-real-time cash positions across all accounts:

- **Position aggregation:** Cash positions are aggregated by currency, account type, and entity
- **Pool visibility:** Cash pools group related accounts for consolidated viewing
- **Movement tracking:** Every cash movement (wire, ACH, internal transfer) is recorded with source, destination, amount, and timestamp
- **Restricted cash:** Cash subject to regulatory or contractual restrictions is tagged and excluded from available balance calculations

### Cash Forecasting (`TreasuryCashForecast`)

The forecasting engine projects future cash positions using:

- Historical cash flow patterns (from Ledger)
- Known upcoming payments and receipts
- AI-powered trend analysis from the Intelligence Platform
- Configurable forecast horizons (daily, weekly, monthly, quarterly)

Forecasts are stored as time-series projections and feed into the Reporting Platform for board pack visualization.

## Liquidity Management

Liquidity positions classify cash into tiers:

| Tier | Description | Examples |
|---|---|---|
| Operational | Cash needed for daily operations | Payroll, vendor payments |
| Reserve | Cash held for contingencies | Regulatory buffer, emergency fund |
| Surplus | Excess cash available for investment | Short-term instruments, intercompany loans |

## FX Exposure (`TreasuryFXExposure`)

The FX exposure module tracks:

- Net exposure by currency pair
- Unrealized gains/losses on open positions
- Hedge effectiveness tracking
- Exposure limits and breach alerts

Data feeds from external-banking service and Plaid integration for real-time FX rates.

## Counterparty Risk (`TreasuryCounterpartyRisk`)

Counterparty risk is assessed across:

- Bank counterparties (deposit concentration)
- Investment counterparties (money market funds, commercial paper)
- Trading counterparties (FX forwards, derivatives)

Risk scores are computed from credit ratings, exposure amounts, and tenure. Alerts are triggered when concentration limits or credit thresholds are breached.

## Bank Integrations

Bank connectivity is provided through two channels:

### External Banking Service (`external-banking.service.ts`)

A service layer that abstracts bank-specific protocol differences. Supports:

- Balance inquiry
- Transaction history retrieval
- Wire initiation
- Statement reconciliation data

### Plaid Integration

Plaid provides bank account connectivity for:

- Account verification (ownership, balance)
- Transaction categorization
- Real-time balance updates
- Identity verification

Plaid data flows through the Integrations connector framework, where `input-validator.ts` validates incoming data and `lineageRecords` track data provenance.

## Working Capital

Working capital management (`TreasuryWorkingCapital`) tracks:

- Days Sales Outstanding (DSO)
- Days Payable Outstanding (DPO)
- Cash Conversion Cycle (CCC)
- Working capital ratio trends

These metrics are computed from Ledger data and projected forward using Intelligence Platform forecasts.

## Service Architecture

```
src/modules/treasury/
├── treasury.service.ts          # Primary treasury operations facade
├── external-banking.service.ts  # Bank protocol abstraction
└── index.ts                     # Barrel exports
```

The `treasury.service.ts` facade coordinates all treasury operations:

- Cash position queries aggregate across pools and currencies
- Cash movements are recorded with full audit trail
- Forecasts are generated and cached with tiered TTL (5s critical → 600s historical)
- Risk assessments are computed on demand and cached per session

## Interaction with Other Domains

| Domain | Interaction |
|---|---|
| Ledger | Treasury cash movements post as journal entries |
| Reporting | Cash position, liquidity, and forecast data feed board packs |
| Intelligence Platform | Cash flow patterns feed AI forecasting |
| Integrations | Bank data flows through connector framework and Plaid |
| Risk | Counterparty exposure feeds risk scoring |
| Notifications | Breach alerts and position thresholds trigger notifications |
