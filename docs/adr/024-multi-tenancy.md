# ADR-024: Application-Level Multi-Tenancy

**Status**: Ratified
**Date**: July 2026
**Author**: Architecture Team

## Context

The platform serves multiple enterprises (tenants) from a single deployment. Each tenant's data must be strictly isolated. No tenant should ever be able to access another tenant's financial data, transactions, users, or configuration. The multi-tenancy model must support tenant-specific configurations, branding, and feature flags.

## Decision

Implement **application-level multi-tenancy** with `companyId` on every database table.

### Architecture

```
┌─────────────────────────────────────────────┐
│                  Platform                    │
│  ┌─────────────┐  ┌─────────────┐           │
│  │   Tenant A  │  │   Tenant B  │           │
│  │  company: 1 │  │  company: 2 │           │
│  │             │  │             │           │
│  │  Users      │  │  Users      │           │
│  │  Wallets    │  │  Wallets    │           │
│  │  Ledger     │  │  Ledger     │           │
│  │  Approvals  │  │  Approvals  │           │
│  └─────────────┘  └─────────────┘           │
│         │                │                  │
│         └────────────────┴── Same Database ─┤
└─────────────────────────────────────────────┘
```

### Enforcement Points

| Layer | Mechanism | Location |
|-------|-----------|----------|
| **Edge** | JWT token contains `companyId` | `src/proxy.ts` |
| **Application** | `requireTenantContext()` guard | Shared middleware |
| **Database** | `companyId` column on every table | Prisma schema |
| **Query** | All repository queries include tenant filter | `src/server/persistence/` |
| **API** | Tenant context injected from session | Route handlers |

### Implementation Pattern

```typescript
// Every service method receives tenant context
async function getTransactions(tenantId: string, filter?: TransactionFilter) {
  return prisma.transaction.findMany({
    where: {
      companyId: tenantId,  // Always scoped
      ...filter,
    },
  });
}
```

### Company Model

```prisma
model Company {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  settings  Json?    // Tenant-specific configuration
  features  String[] // Feature flags
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations to all tenant-scoped tables
  users         User[]
  wallets       Wallet[]
  transactions  Transaction[]
  // ... every other model
}
```

## Alternatives Considered

1. **Database-per-tenant**: Rejected — operational overhead of managing N databases; impossible to do cross-tenant analytics; migration burden scales linearly with tenant count
2. **Schema-per-tenant**: Rejected — Prisma does not support dynamic schema switching; migration management becomes complex
3. **Row-level security (RLS)**: Rejected — PostgreSQL RLS adds query overhead; harder to debug; not all Prisma queries respect RLS policies

## Consequences

- **Positive**: Single database simplifies operations, backups, migrations
- **Positive**: `companyId` filter is explicit and auditable — no hidden RLS policies
- **Positive**: Cross-tenant analytics possible with explicit companyId selection
- **Positive**: Feature flags per tenant via Company.settings JSON
- **Negative**: Every query must include `companyId` — forgetting it is a security vulnerability (mitigated by repository pattern enforcement)
- **Negative**: Database size grows with all tenants in one table — requires partitioning strategy at scale
- **Negative**: Table scans cannot be limited to a single tenant without correct index design

## Future Considerations

- Schema-based sharding for multi-region deployments (companyId hash range)
- Database partitioning by tenant group for very large tenants
- Read replica assignment by tenant tier
