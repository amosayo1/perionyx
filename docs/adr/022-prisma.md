# ADR-022: Prisma ORM

**Status**: Ratified
**Date**: July 2026
**Author**: Architecture Team

## Context

The platform needs an ORM that provides compile-time type safety across 100+ database models, automated migration management, and efficient query generation. The ORM must work with PostgreSQL (ADR-021), support JSONB fields, handle complex relations (double-entry ledger, multi-tenant scoping), and integrate with Next.js server components.

## Decision

Use **Prisma** as the data access layer.

### Version

- **Prisma**: 7.8 (current)
- **Prisma Client**: Generated client with full TypeScript types

### Usage Pattern

```typescript
// Schema-driven type safety — all models are generated types
import { prisma } from "@/lib/prisma";

// Tenant-scoped query
const transactions = await prisma.transaction.findMany({
  where: { companyId: tenantId, status: "PENDING" },
  include: { approvals: true, entries: true },
});
```

### Key Features Used

| Feature | Usage |
|---------|-------|
| **Generated Client** | Full TypeScript types for all 100+ models |
| **Migrations** | `prisma migrate dev` / `prisma migrate deploy` for schema evolution |
| **JSONB Support** | `Json` field type for connector configs, report templates, policy rules |
| **Relation Queries** | `include` and `select` for efficient join loading |
| **Connection Pool** | Prisma's internal pool management with PgBouncer compatibility |
| **Middleware** | Soft-delete, audit logging hooks |
| **Raw Queries** | `$queryRaw` for complex financial aggregations |

### Repository Abstraction

Prisma is abstracted behind a repository layer in `src/server/persistence/`:

```typescript
interface IRepository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(filter?: Filter<T>): Promise<T[]>;
  create(data: CreateInput<T>): Promise<T>;
  update(id: ID, data: UpdateInput<T>): Promise<T>;
  delete(id: ID): Promise<void>;
}
```

This allows swapping Prisma for in-memory stores during testing and supports the unit-of-work pattern for multi-repository transactions.

## Alternatives Considered

1. **Drizzle ORM**: Rejected — smaller ecosystem, less mature migration system, fewer JSONB utilities at time of evaluation
2. **TypeORM**: Rejected — slower TypeScript type generation, decorator-based syntax adds boilerplate, migration system less reliable
3. **Kysely**: Rejected — type-safe query builder but no migration system, no relation loading
4. **Raw SQL**: Rejected — unsustainable for 100+ models, no migration management, no type generation

## Consequences

- **Positive**: Compile-time type safety eliminates a class of runtime errors
- **Positive**: Automated migrations with rollback support
- **Positive**: Strong relation loading reduces N+1 query risk
- **Positive**: Repository abstraction allows test isolation
- **Negative**: Prisma query generation can be verbose for complex joins
- **Negative**: Generated client adds build step (`prisma generate`)
- **Negative**: Some PostgreSQL-specific features require raw queries

## Future Considerations

- Investigate Prisma Optimizations for connection pooling at scale
- Prisma Pulse for real-time database change streaming
- Evaluate Drizzle again as Prisma alternatives mature
