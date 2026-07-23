---
id: fx-management
title: FX Management
sidebar_label: FX Management
---

# FX Management

The FX exposure module tracks and manages foreign currency exposure across the organization.

## Core Capabilities

The `TreasuryFXExposure` model provides:

- **Net exposure by currency pair** — Aggregated positions across all entities and accounts
- **Unrealized gains/losses** — Mark-to-market valuation of open FX positions
- **Hedge effectiveness tracking** — Measurement of how well hedges offset underlying exposure
- **Exposure limits and breach alerts** — Threshold monitoring with automated notifications

## Data Feeds

FX data flows from external sources through the Integrations platform:

- **External Banking Service** (`external-banking.service.ts`) — Real-time FX rates and position data from banking partners
- **Plaid Integration** — Account balance data in foreign currencies with conversion rates
- **Connector Framework** — Standardized data ingestion with `input-validator.ts` validation and `lineageRecords` provenance tracking

## Exposure Tracking

FX exposure is tracked at multiple levels:

| Level | Description |
|---|---|
| Currency pair | Net exposure for each traded currency pair |
| Entity | Exposure by legal entity for consolidation |
| Account | Individual account positions in foreign currencies |
| Instrument | Exposure from specific hedging instruments (forwards, options, swaps) |

## Limit Management

Exposure limits are configurable and monitored continuously:

- **Position limits** — Maximum net exposure per currency pair
- **Loss limits** — Threshold for unrealized losses requiring action
- **Concentration limits** — Maximum exposure to a single currency or region
- **Breach alerts** — Automated notifications when limits are exceeded

## Interaction with Other Domains

| Domain | Interaction |
|---|---|
| Ledger | FX gains/losses post as journal entries |
| Integrations | Real-time FX rates from banking and Plaid feeds |
| Risk | FX exposure feeds into overall risk scoring |
| Reporting | FX data feeds currency-denominated financial statements |
| Notifications | Breach alerts and threshold notifications |
