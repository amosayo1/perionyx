# Seed Strategy

## Overview

The seed strategy provides deterministic enterprise mock data for development, testing, and demo environments. All seed data is idempotent — running the seed multiple times produces the same result.

## Seed Files

| File | Purpose | Scope |
|---|---|---|
| `prisma/seed.ts` | Core seed (users, company, roles, connectors) | Required |
| `prisma/seed-treasury.ts` | Treasury domain seed (Phase 7E.2) | Supplementary |

## Core Seed (`prisma/seed.ts`)

Creates:
- Demo user (founder@demo.perionyx.local)
- Demo company (Demo Company)
- Roles: OWNER, ADMIN, TREASURER
- Permissions for transactions, approvals, webhooks, RBAC
- Webhook configuration (if WEBHOOK_URL set)
- Demo connector config

## Treasury Seed (`prisma/seed-treasury.ts`)

Creates representative data across all 16 treasury models:

| Model | Seed ID | Key Values |
|---|---|---|
| TreasuryCashPosition | seed-cash-pos-001 | OPERATING, USD, $125M total |
| TreasuryLiquidityPosition | seed-liq-001 | IMMEDIATE, $85M |
| TreasuryCashPool | seed-pool-001 | Global USD Pool, PHYSICAL |
| TreasuryCashForecast | seed-fc-001 | MONTH, HIGH confidence |
| TreasuryFXExposure | seed-fx-001 | EUR/USD, $25M, PARTIALLY_HEDGED |
| TreasuryCounterpartyRisk | cp-jpm-001 | JP Morgan, AA-, score 15 |
| TreasuryCashPolicy | seed-cpol-001 | MINIMUM_CASH, $10M floor |
| TreasuryAlert | seed-alert-001 | FORECAST_DEVIATION, INFO |
| TreasuryWorkingCapital | seed-wc-001 | $115M net, 2.21 ratio |
| TreasuryFundingRequest | seed-fr-001 | $5M, INTERCOMPANY_LOAN, PENDING |
| TreasuryInvestmentBucket | seed-inv-001 | CONSERVATIVE, $30M |
| TreasuryPolicy | seed-tpol-001 | Global Treasury Policy 2026 |
| TreasurySnapshot | seed-ss-001 | Point-in-time enterprise view |

## Running Seeds

```bash
# Standard seed
pnpm db:seed

# Treasury seed (after standard seed)
npx tsx prisma/seed-treasury.ts

# Both
pnpm db:seed && npx tsx prisma/seed-treasury.ts
```

## Idempotency

All seed operations use Prisma `upsert` to ensure idempotency:
- If the record exists (matched by specific ID or unique constraint), it is updated
- If the record doesn't exist, it is created
- Running the seed multiple times produces identical data

## Data Consistency

Seed data references:
- Fixed UUIDs for all entities
- Fixed company slug (`demo-company`)
- Fixed user email (`founder@demo.perionyx.local`)
- Cross-references between treasury entities (alert ID referenced in snapshot)
