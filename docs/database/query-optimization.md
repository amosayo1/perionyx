# Query Optimization

## Index Strategy

Every treasury model includes targeted indexes for common query patterns:

### Single-Field Indexes

| Table | Indexed Field | Purpose |
|---|---|---|
| All treasury tables | `companyId` | Tenant isolation — every query filters by company |
| `treasury_cash_positions` | `legalEntityId` | Entity-level drill-down |
| `treasury_cash_positions` | `region` | Regional aggregation |
| `treasury_cash_positions` | `currency` | Currency-based queries |
| `treasury_liquidity_positions` | `category` | Liquidity category filtering |
| `treasury_cash_movements` | `status` | Pending/completed filtering |
| `treasury_cash_movements` | `fundingType` | Funding type analysis |
| `treasury_cash_movements` | `requestedAt` | Time-based queries |
| `treasury_cash_forecasts` | `horizon` | Forecast horizon filtering |
| `treasury_cash_forecasts` | `generatedAt` | Time-series queries |
| `treasury_funding_requests` | `status` | Pending approval queries |
| `treasury_funding_requests` | `requiredByDate` | Urgency filtering |
| `treasury_restricted_cash` | `isReleased` | Active restriction queries |
| `treasury_fx_exposures` | `hedgeStatus` | Hedged/unhedged filtering |
| `treasury_counterparty_risks` | `status` | Active/watch/suspended |
| `treasury_counterparty_risks` | `riskScore` | Risk-based filtering |
| `treasury_cash_policies` | `policyType` | Policy category queries |
| `treasury_alerts` | `severity` | Priority filtering |
| `treasury_alerts` | `resolved` | Open vs resolved alerts |
| `treasury_alerts` | `createdAt` | Alert timeline |
| `treasury_snapshots` | `recordedAt` | Snapshot timeline |

### Composite Indexes

| Table | Index | Purpose |
|---|---|---|
| `treasury_fx_exposures` | `(companyId, sourceCurrency, targetCurrency)` | Currency pair lookup |
| `treasury_working_capitals` | `(companyId, legalEntityId)` | Entity-level working capital |
| `treasury_investment_buckets` | `(companyId, legalEntityId)` | Entity portfolio |

### Unique Constraints

| Table | Constraint | Purpose |
|---|---|---|
| `treasury_cash_pools` | `(companyId, name)` | Prevent duplicate pool names |
| `treasury_investment_buckets` | `(companyId, name)` | Prevent duplicate bucket names |
| `treasury_cash_policies` | `(companyId, name)` | Prevent duplicate policy names |
| `treasury_policies` | `(companyId, name)` | Prevent duplicate policy names |
| `treasury_counterparty_risks` | `counterpartyId` | One risk record per counterparty |

## Query Patterns

### Select Only Required Fields

```typescript
const positions = await prisma.treasuryCashPosition.findMany({
  where: { companyId },
  select: { id: true, currency: true, totalBalance: true, availableBalance: true },
});
```

### Cursor Pagination (for large datasets)

```typescript
const page = await prisma.treasuryAlert.findMany({
  where: { companyId },
  take: 20,
  cursor: { id: lastId },
  skip: 1,
  orderBy: { createdAt: "desc" },
});
```

### Batch Operations

```typescript
const [positions, forecasts, alerts] = await Promise.all([
  prisma.treasuryCashPosition.findMany({ where: { companyId } }),
  prisma.treasuryCashForecast.findMany({ where: { companyId } }),
  prisma.treasuryAlert.findMany({ where: { companyId, resolved: false } }),
]);
```

### Connection Pooling

The Prisma client uses `@prisma/adapter-pg` with connection pooling. Configure pool size in `DATABASE_URL`:

```
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10"
```
