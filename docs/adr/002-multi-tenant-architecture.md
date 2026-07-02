# ADR-002: Multi-Tenant Architecture

**Status**: Ratified  
**Date**: January 2024  
**Author**: Architecture Team  

## Context

Perionyx serves multiple companies from a single deployment. Each company's data must be completely isolated — no company should be able to access another company's financial data.

## Decision

Use **application-level tenant isolation** via a `companyId` field on every database entity. All queries include `companyId` in WHERE clauses, enforced by the `requireTenantContext()` middleware.

### Implementation
- Every Prisma model includes `companyId String`
- `requireTenantContext()` extracts companyId from the authenticated session
- All service functions accept `TenantContext` and scope queries to `ctx.companyId`
- No shared schemas or row-level security — isolation is at the application layer

## Consequences

- **Positive**: Simple, straightforward implementation
- **Positive**: No database vendor lock-in for tenant isolation features
- **Positive**: Easy to test — just change companyId in the context
- **Negative**: Every developer must remember to filter by companyId (enforced by middleware pattern)
- **Negative**: Query performance could degrade as tenant count grows (mitigated by indexes)
- **Negative**: Schema changes affect all tenants simultaneously

## Alternatives Considered

1. **Database-per-tenant**: Rejected — operational complexity, connection management overhead, cross-tenant analytics impossible
2. **Schema-per-tenant**: Rejected — migration complexity, connection pool management overhead
3. **Row-level security (PostgreSQL RLS)**: Considered but rejected for portability — works on Postgres only and adds complexity
