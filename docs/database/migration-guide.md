# Migration Guide

## Applying the Treasury Domain Migration

### Migration File

The migration `20260709152916_treasury_domain_repositories` creates 16 new tables for the treasury domain.

### Tables Created

| Table | Description |
|---|---|
| `treasury_cash_positions` | Cash position snapshots by entity/currency |
| `treasury_liquidity_positions` | Liquidity category breakdowns |
| `treasury_cash_pools` | Physical/notional cash pool configurations |
| `treasury_cash_movements` | Cash movement and transfer records |
| `treasury_cash_forecasts` | Forecast data with predicted inflows/outflows |
| `treasury_funding_requests` | Inter-entity funding requests |
| `treasury_investment_buckets` | Investment portfolio allocations |
| `treasury_restricted_cash` | Restricted cash tracking with release dates |
| `treasury_working_capitals` | Working capital snapshots |
| `treasury_fx_exposures` | FX exposure by currency pair |
| `treasury_counterparty_risks` | Counterparty risk assessments |
| `treasury_cash_policies` | Cash policy definitions with rules |
| `treasury_policies` | Treasury policy framework with approval matrix |
| `treasury_alerts` | Treasury-specific alert records |
| `treasury_snapshots` | Point-in-time full treasury snapshots |

### Applying

```bash
# Apply all pending migrations
pnpm db:migrate

# Or apply this specific migration
npx prisma migrate deploy
```

### Rollback

```bash
# Rollback the last migration
npx prisma migrate reset
```

## Seed Data

```bash
# Run standard seed (users, roles, connectors)
pnpm db:seed

# Run treasury-specific seed
npx tsx prisma/seed-treasury.ts
```

The treasury seed creates:

| Entity | Count |
|---|---|
| Cash Positions | 1 |
| Liquidity Positions | 1 |
| Cash Pools | 1 |
| Cash Forecasts | 1 |
| FX Exposures | 1 |
| Counterparty Risks | 1 |
| Cash Policies | 1 |
| Treasury Alerts | 1 |
| Working Capitals | 1 |
| Funding Requests | 1 |
| Investment Buckets | 1 |
| Treasury Policies | 1 |
| Treasury Snapshots | 1 |

## Backward Compatibility

- All existing in-memory repositories remain operational
- No existing API changes
- No existing UI changes
- The `InMemoryTreasuryRepository` can be used alongside `PrismaTreasuryRepository`
- Switching between implementations requires only changing the barrel export
