# 13 — Multi-Tenancy

---

## Tenant Model

The `Company` model is the fundamental tenant boundary. Every data table carrying customer data has a `companyId` foreign key that links back to `Company`. The `companyId` value is used in every query to enforce tenant isolation.

```prisma
model Company {
  id     String  @id @default(cuid())
  name   String
  slug   String  @unique
  sandbox Boolean @default(false)
  // ... entity profile fields, feature flags, relations
}
```

## Tenant Context

Every API handler and service method receives a `TenantContext`:

```typescript
type TenantContext = {
  userId: string;
  companyId: string;
  role: CompanyRole;
};
```

The `requireTenantContext()` guard (`src/server/context/tenant-context.ts`) enforces:

1. **Authentication**: throws `UnauthorizedError` if no userId present
2. **Active Company**: throws `ForbiddenError` if no companyId or role present
3. **License Enforcement**: if `LICENSE_COMPANY_ID` env var is set, only that company ID is allowed access — blocks all other tenants

## JWT Carrier

The JWT token (NextAuth v5) carries:
- `activeCompanyId` — the user's currently selected company context
- `companyRole` — the user's role within that company (`OWNER`, `ADMIN`, `TREASURER`, `MEMBER`, `VIEWER`)

Session lookup in the proxy extracts these values and attaches them to request headers.

## Data Isolation

**Every data model** that belongs to a tenant includes:

```prisma
companyId  String
company    Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
@@index([companyId])
```

All queries are filtered by `companyId` at the application level. Cross-tenant data access is structurally impossible because `companyId` is required in `where` clauses and model creation.

### Cross-Tenant Blocking

The following patterns prevent cross-tenant access:
1. **Service-level**: every query includes `where: { companyId: ctx.companyId }`
2. **Update/Delete guards**: resources are fetched first and checked for `companyId` match before mutation
3. **API route enforcement**: `requireTenantContext()` is called before any handler logic
4. **Workflow execution**: engine checks `def.companyId !== ctx.companyId` and throws

```typescript
// Example: scheduler update guard
const existing = await prisma.workflowSchedule.findUnique({ where: { id } });
if (!existing || existing.companyId !== ctx.companyId) throw new Error("Not found");
```

## Company Membership

Users belong to companies through `CompanyMembership`:

```prisma
model CompanyMembership {
  id        String      @id @default(cuid())
  userId    String
  companyId String
  role      CompanyRole
  @@unique([userId, companyId])
}
```

A user can belong to multiple companies and switches between them via `activeCompanyId`. There is no cross-company data sharing — each session operates in exactly one company context.

## Sandbox

Companies have a `sandbox: Boolean` flag that:
- Enables sandbox-restricted permission enforcement (10 permission types blocked)
- Sandbox companies cannot manage users, roles, API keys, webhooks, integrations, billing, auth, security, or export data
- Sandbox restrictions are enforced in `RBACService.ensurePermission()`

## Scalability

Current multi-tenant scalability strategy:
- **Indexed**: `companyId` indexed on every tenant-scoped table for query performance
- **Schema-based sharding** (future): potential for per-tenant schemas for extreme isolation
- **Database-based sharding** (future): potential for tenant-to-database mapping for large enterprises

The `companyId` on every table makes all three models (shared table, schema-per-tenant, database-per-tenant) deployable without schema changes since the application already filters by `companyId` universally.

## API Key Tenancy

API keys are scoped to a `companyId`:
```prisma
model ApiKey {
  id        String
  companyId String
  // ...
}
```

When authenticating via API key, the key's `companyId` becomes the tenant context, ensuring programmatic access is also tenant-isolated.
