---
id: company-model
title: Company Model
sidebar_label: Company Model
---

# Company Model

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

## Scalability

Current multi-tenant scalability strategy:
- **Indexed**: `companyId` indexed on every tenant-scoped table for query performance
- **Schema-based sharding** (future): potential for per-tenant schemas for extreme isolation
- **Database-based sharding** (future): potential for tenant-to-database mapping for large enterprises

The `companyId` on every table makes all three models (shared table, schema-per-tenant, database-per-tenant) deployable without schema changes since the application already filters by `companyId` universally.
