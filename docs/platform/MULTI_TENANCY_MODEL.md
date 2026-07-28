# Multi-Tenancy Model

**Document Type**: Cross-Cutting Architecture
**Mission**: Define the multi-tenancy architecture for Perionyx — tenant isolation, context propagation, configuration, provisioning, limits, billing, and cross-tenant access prevention — ensuring every tenant's data is architecturally isolated and protected.
**Status**: Partially Built (`requireTenantContext()` enforced; row-level isolation in most queries)
**Constitutional Authority**: PLATFORM_CONSTITUTION.md — Law 11 ("Tenant Isolation Is Absolute"), Law 13 ("Data Classification Governs Handling")

---

## Responsibilities

1. **Tenant Isolation** — Every data access, API call, and background job is scoped to a tenant. Cross-tenant access is never permitted.
2. **Context Propagation** — `TenantContext` flows through every layer: API → Service → Repository → Database.
3. **Tenant Configuration** — Per-tenant settings, features, and limits.
4. **Tenant Provisioning** — Automated tenant creation with schema setup, admin user, and default configuration.
5. **Tenant Limits** — Per-tenant resource limits (users, storage, API calls, features).
6. **Tenant Billing** — Per-tenant usage tracking and billing integration.
7. **Cross-Tenant Prevention** — Architectural guarantees against data leakage.
8. **Tenant-Aware Caching** — Cache keys namespaced by tenant.
9. **Tenant-Aware Queues** — Background jobs scoped to tenant.
10. **Tenant-Aware Search** — Search results filtered by tenant.
11. **Tenant-Aware Audit** — Audit records tagged with tenant.

---

## Tenant Model

### Isolation Strategy

| Strategy | Isolation Level | Cost | Complexity | Status |
|---|---|---|---|---|
| **Shared Database, Row-Level** | Per-row `companyId` | Lowest | Lowest | Current |
| **Schema-per-Tenant** | Per-schema isolation | Medium | Medium | Planned |
| **Database-per-Tenant** | Per-database isolation | High | High | Planned (Dedicated SaaS) |

### Current Implementation: Row-Level Isolation

Every Prisma model includes a `companyId` field. All queries are scoped by `companyId` via `requireTenantContext()`.

```typescript
// Source: src/server/context/tenant-context.ts
export type TenantContext = {
  userId: string;
  companyId: string;
  role: CompanyRole;
};

export function requireTenantContext(
  userId: string | undefined,
  companyId: string | null | undefined,
  role: CompanyRole | string | null | undefined,
): TenantContext {
  if (!userId) throw new UnauthorizedError("Authentication required.");
  if (!companyId || !role) throw new ForbiddenError("No active company on the session.");

  // License enforcement
  const licensedCompanyId = process.env.LICENSE_COMPANY_ID;
  if (licensedCompanyId && companyId !== licensedCompanyId) {
    throw new ForbiddenError("This instance is licensed for a different company. Access denied.");
  }

  return { userId, companyId, role: role as CompanyRole };
}
```

---

## Tenant Context Propagation

### Flow Diagram

```
HTTP Request
  → Proxy (extract session, tenant)
    → Route Handler
      → requireTenantContext(userId, companyId, role)
        → TenantContext { userId, companyId, role }
          → Service Method(ctx, ...)
            → Repository Method(companyId, ...)
              → Prisma Query({ where: { companyId } })
```

### Every Layer Must Enforce

| Layer | Enforcement | Source |
|---|---|---|
| **Proxy** | Extract tenant from session | `src/proxy.ts` |
| **Route Handler** | Call `requireTenantContext()` | `src/server/context/tenant-context.ts` |
| **Service** | Accept `TenantContext` as first parameter | All service methods |
| **Repository** | Filter by `companyId` in every query | All repository methods |
| **Cache** | Namespace cache keys by `companyId` | Cache key builder |
| **Queue** | Include `companyId` in job payload | Job payload types |
| **Audit** | Tag audit records with `companyId` | Audit logger |
| **WebSocket** | Emit events only to tenant channel | Real-time event bus |

### TenantContext Interface

```typescript
interface TenantContext {
  userId: string;       // Authenticated user ID
  companyId: string;    // Tenant identifier (maps to Company.id)
  role: CompanyRole;    // User's role in this company
}
```

---

## Tenant Data Isolation

### Database Isolation

Every Prisma model with sensitive data includes `companyId`:

```prisma
model Transaction {
  id        String   @id @default(cuid())
  companyId String   // Tenant isolation
  amount    Decimal  @db.Decimal(38, 12)
  // ...

  @@index([companyId])
  @@index([companyId, createdAt])
}
```

### Query Isolation

Every query must include `companyId` in the `where` clause:

```typescript
// CORRECT
const transactions = await prisma.transaction.findMany({
  where: { companyId: ctx.companyId }
});

// FORBIDDEN — cross-tenant access
const transactions = await prisma.transaction.findMany({});
```

### Cross-Tenant Prevention

| Control | Implementation |
|---|---|
| **requireTenantContext** | Throws if `companyId` missing |
| **Prisma middleware** | (Planned) Auto-inject `companyId` filter |
| **Row-Level Security** | PostgreSQL RLS policies (planned) |
| **Code review** | CI lint rule for missing `companyId` |
| **Audit logging** | Cross-tenant access attempts logged |

---

## Tenant Configuration

### Per-Tenant Settings

```typescript
interface TenantConfiguration {
  companyId: string;
  settings: {
    // Feature flags
    features: {
      ap_enabled: boolean;
      ar_enabled: boolean;
      treasury_enabled: boolean;
      workflow_enabled: boolean;
      ai_enabled: boolean;
      crm_enabled: boolean;
    };
    // Limits
    limits: {
      maxUsers: number;
      maxStorageGB: number;
      maxApiCallsPerDay: number;
      maxWorkflows: number;
      maxAgents: number;
    };
    // Branding
    branding: {
      logoUrl?: string;
      primaryColor?: string;
      companyName: string;
    };
    // Compliance
    compliance: {
      dataResidency: string;    // "us-east-1", "eu-west-1"
      retentionDays: number;
      mfaRequired: boolean;
    };
  };
}
```

### Configuration Sources (Priority Order)

1. **Tenant-specific** — Stored in `Company` table, per-tenant overrides
2. **Plan-based** — Default limits by subscription plan
3. **Platform defaults** — Global defaults for all tenants

---

## Tenant Provisioning

### Provisioning Flow

```
1. Create Company record
2. Create Admin user
3. Assign ADMIN role to admin user
4. Set tenant configuration defaults
5. Initialize feature flags
6. Create default workflows (optional)
7. Seed demo data (optional)
8. Send welcome notification
```

### Provisioning Commands

| Command | Description |
|---|---|
| `ProvisionTenant` | Create new tenant with admin user |
| `DeprovisionTenant` | Soft-delete tenant (retain data for audit) |
| `SuspendTenant` | Suspend all tenant operations |
| `ReactivateTenant` | Resume suspended tenant |
| `MigrateTenant` | Run tenant-specific migrations |

---

## Tenant Limits

### Default Limits by Plan

| Resource | Free | Pro | Enterprise |
|---|---|---|---|
| Users | 5 | 50 | Unlimited |
| Storage | 1 GB | 10 GB | 100 GB |
| API calls/day | 10,000 | 100,000 | 1,000,000 |
| Workflows | 3 | 50 | Unlimited |
| Agents | 0 | 5 | Unlimited |
| Webhooks | 0 | 10 | Unlimited |
| Retention | 30 days | 1 year | 10 years |

### Limit Enforcement

```typescript
interface TenantLimits {
  checkUserLimit(companyId: string): Promise<LimitResult>;
  checkStorageLimit(companyId: string, additionalBytes: number): Promise<LimitResult>;
  checkAPILimit(companyId: string): Promise<LimitResult>;
  checkFeatureAccess(companyId: string, feature: string): Promise<boolean>;
}
```

---

## Tenant Billing

### Usage Tracking

| Metric | Tracking | Billing Event |
|---|---|---|
| Active users | Daily snapshot | Monthly invoice |
| API calls | Per-request counter | Monthly invoice |
| Storage used | Daily snapshot | Monthly invoice |
| Data transfer | Per-request bytes | Monthly invoice |
| Feature usage | Per-use counter | Monthly invoice |

### Billing Integration

```typescript
interface TenantBilling {
  getUsage(companyId: string, period: DateRange): Promise<TenantUsage>;
  getInvoice(companyId: string, month: string): Promise<Invoice>;
  recordUsage(companyId: string, metric: string, quantity: number): Promise<void>;
}
```

---

## Tenant-Aware Caching

### Cache Key Structure

```
{namespace}:{companyId}:{entity}:{id}
```

Examples:
- `cache:company_abc:transaction:txn_123`
- `cache:company_abc:user_permissions:user_456`
- `cache:company_abc:workflow_metrics:latest`

### Cache Isolation Rules

| Rule | Description |
|---|---|
| **Key prefix** | All cache keys include `companyId` |
| **Eviction** | Tenant-specific eviction on tenant deletion |
| **Size limits** | Per-tenant cache quota enforcement |
| **TTL** | Tenant-configurable TTL for sensitive data |

---

## Tenant-Aware Queues

### Job Payload Structure

```typescript
interface TenantJobPayload {
  companyId: string;    // Tenant scope
  userId: string;       // Initiating user
  jobId: string;        // Unique job ID
  correlationId: string; // Tracing
  data: Record<string, unknown>; // Job-specific data
}
```

### Queue Isolation

| Queue | Isolation |
|---|---|
| Notification delivery | Job scoped to `companyId` |
| Connector sync | Sync scoped to tenant's connectors |
| Workflow execution | Instance scoped to tenant |
| Report generation | Report scoped to tenant's data |
| AI processing | Request scoped to tenant's AI config |

---

## Tenant-Aware Search

### Search Isolation

```typescript
interface TenantSearchQuery {
  companyId: string;  // Required filter
  query: string;
  filters?: Record<string, unknown>;
  pagination?: PaginationParams;
}
```

### Search Index Structure

```
Index: {entity}_{companyId}
  → All documents scoped to tenant
  → Tenant deletion = index deletion
  → No cross-tenant search possible
```

---

## Tenant-Aware Audit

### Audit Record Structure

```typescript
interface TenantAuditRecord {
  id: string;
  companyId: string;      // Tenant scope
  userId: string;         // Actor
  action: string;         // What was done
  resource: string;       // What was affected
  resourceId: string;     // Specific resource ID
  details: Record<string, unknown>;
  timestamp: Date;
  correlationId: string;  // Request tracing
}
```

### Audit Isolation

| Rule | Description |
|---|---|
| **Query filter** | Audit queries always filtered by `companyId` |
| **Export** | Audit export scoped to tenant |
| **Retention** | Per-tenant retention policy |
| **Tamper evidence** | Append-only; no update/delete allowed |

---

## Observability

### Metrics

| Metric | Type | Labels |
|---|---|---|
| `tenant_provisioned_total` | Counter | plan, region |
| `tenant_suspended_total` | Counter | reason |
| `tenant_active_total` | Gauge | plan |
| `tenant_api_calls_total` | Counter | company_id, endpoint |
| `tenant_storage_bytes` | Gauge | company_id |
| `tenant_users_active` | Gauge | company_id |
| `tenant_limit_exceeded_total` | Counter | company_id, resource |
| `tenant_cross_tenant_attempt_total` | Counter | user_id, target_company |

### Tenant Health Dashboard

| Metric | Description | Alert |
|---|---|---|
| Active tenants | Total active tenant count | — |
| API usage per tenant | Top 10 API consumers | > 80% of limit |
| Storage per tenant | Top 10 storage consumers | > 80% of limit |
| Error rate per tenant | Tenant-specific error rates | > 5% |
| Cross-tenant attempts | Security event count | Any occurrence |

---

## Rate Limiting

### Per-Tenant Rate Limits

| Tier | Requests/Hour | Concurrent | Burst |
|---|---|---|---|
| Free | 1,000 | 5 | 10 |
| Pro | 10,000 | 25 | 50 |
| Enterprise | 100,000 | 100 | 200 |

### Rate Limit Key Structure

```
ratelimit:{companyId}:{operation}:{window}
```

---

## Retry Policy

Tenant operations follow standard retry policies:

| Operation | Retries | Backoff | Rationale |
|---|---|---|---|
| Provisioning | 2 | 1s, 2s | Transient DB errors |
| Deprovisioning | 0 | — | Destructive; manual retry |
| Limit check | 1 | 500ms | Cache miss recovery |
| Billing sync | 3 | 1s, 2s, 4s | External service dependency |

---

## Circuit Breakers

| Circuit | Threshold | Recovery | Fallback |
|---|---|---|---|
| Tenant config | 3 failures / 60s | 30s | Use cached defaults |
| Billing service | 3 failures / 60s | 60s | Queue usage events |
| Search index | 3 failures / 60s | 30s | Fallback to DB query |

---

## Versioning

| Aspect | Strategy |
|---|---|
| TenantContext | Stable interface; additive changes only |
| TenantConfiguration | Schema versioned; migrations for changes |
| Provisioning flow | Versioned; backward compatible |
| Limit definitions | Append-only; never remove limits |

---

## Lifecycle

### Tenant Lifecycle

```
Provision → Active → Suspended (optional) → Deprovisioned
              ↘ Migrated (schema changes)
              ↘ Scaled (limits adjusted)
```

### Tenant States

| State | Description |
|---|---|
| `provisioning` | Being set up |
| `active` | Fully operational |
| `suspended` | Temporarily disabled |
| `deprovisioned` | Soft-deleted (data retained) |
| `migrating` | Schema migration in progress |

---

## Extension Model

### Adding a New Tenant-Scoped Resource

1. **Add `companyId`** field to Prisma model
2. **Add index** on `companyId`
3. **Update repository** to filter by `companyId` in all queries
4. **Update service** to accept `TenantContext`
5. **Update API route** to call `requireTenantContext()`
6. **Add audit logging** for all mutations
7. **Add to tenant limits** if applicable
8. **Test** with multiple tenants to verify isolation

---

## Testing Strategy

| Test Type | Scope |
|---|---|
| Unit | `requireTenantContext()` validation, limit checks |
| Integration | Cross-tenant query prevention, cache isolation |
| Security | IDOR attempts, privilege escalation |
| Load | Multi-tenant concurrent access |
| Chaos | Tenant config failure, billing service outage |

---

## Failure Modes

| Failure | Impact | Mitigation |
|---|---|---|
| Missing `companyId` in query | Cross-tenant data leak | `requireTenantContext()` throws |
| Tenant config corruption | Wrong limits applied | Cached defaults fallback |
| Billing service outage | Usage not tracked | Queue for retry |
| Provisioning failure | Tenant unusable | Manual intervention |
| Cache namespace collision | Data leakage | Structured key format |
| Search index corruption | Wrong results | Rebuild from source |

---

## Recovery Strategy

| Scenario | Recovery |
|---|---|
| Cross-tenant access attempt | Block + audit + alert |
| Tenant config corruption | Restore from backup + cached defaults |
| Provisioning failure | Manual provisioning + retry |
| Deprovisioning partial failure | Complete cleanup manually |
| Cache namespace issue | Flush affected tenant cache |

---

## Key Source Files

| File | Purpose |
|---|---|
| `src/server/context/tenant-context.ts` | TenantContext type and requireTenantContext() |
| `src/proxy.ts` | Tenant extraction from session |
| `src/server/security/require-permission.ts` | Permission check (includes tenant) |
| `src/server/iam/permissions.ts` | Permission definitions with tenant scope |
| `src/server/cache/` | Tenant-aware cache key builder |
| `src/modules/queue/job-types.ts` | Tenant-scoped job payloads |
| `src/server/identity/session-manager.ts` | Session with tenant binding |
| `src/server/recovery/backup-manager.ts` | Tenant-aware backup |

---

*The Multi-Tenancy Model is the trust boundary of Perionyx. Every query, every cache, every queue, every audit record is scoped to a tenant. No exceptions.*
