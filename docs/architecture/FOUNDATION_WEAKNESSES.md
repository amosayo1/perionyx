# Foundation Weaknesses

**Phase**: 26.2 — Enterprise Foundation Certification  
**Date**: 2026-07-27

---

## Weakness #1: Singleton Overwrite Without Shutdown

**Severity**: CRITICAL  
**Domains Affected**: Runtime Architecture, Scalability, Reliability

### Evidence

Three Runtime layer classes use `static create()` that unconditionally overwrites the singleton:

```typescript
// runtime/capabilities/registry.ts:126-138
static create(options: CapabilityRuntimeOptions): CapabilityRuntime {
  CapabilityRuntime.instance = new CapabilityRuntime(options);  // overwrites
  return CapabilityRuntime.instance;
}
```

```typescript
// runtime/secrets/secret-runtime.ts:65-73
static create(options: SecretRuntimeOptions): SecretRuntime {
  SecretRuntime.instance = new SecretRuntime(options);  // overwrites
  return SecretRuntime.instance;
}
```

```typescript
// runtime/configuration/registry.ts:54-69
static create(options: ConfigurationRuntimeOptions): ConfigurationRuntime {
  ConfigurationRuntime.instance = new ConfigurationRuntime(options);  // overwrites
  return ConfigurationRuntime.instance;
}
```

### Impact

1. **Orphaned timers**: `CapabilityRuntime` has `healthPollingTimer` (line 366). `SecretRuntime` has `rotationTimer` (line 86). Neither is cleared before overwrite.
2. **Orphaned caches**: Previous instance's `cache` Map is garbage collected but not explicitly cleared.
3. **Event listener leaks**: `ConfigurationRuntime` and `CapabilityRuntime` use `EventEmitter`. Previous instance's listeners are not removed.
4. **Test isolation**: If tests call `create()` without `shutdown()`, timers leak between test suites.

### Root Cause

No destructor/cleanup pattern in the singleton lifecycle. `create()` assumes single-call initialization.

### Fix

```typescript
static async create(options: CapabilityRuntimeOptions): Promise<CapabilityRuntime> {
  if (CapabilityRuntime.instance) {
    await CapabilityRuntime.instance.shutdown();  // cleanup before overwrite
  }
  CapabilityRuntime.instance = new CapabilityRuntime(options);
  return CapabilityRuntime.instance;
}
```

---

## Weakness #2: Cross-Tenant Audit Data Leak

**Severity**: CRITICAL  
**Domains Affected**: Multi-tenancy, Security, Constitution Compliance (Law 11)

### Evidence

Foundation audit logs accept optional `tenantId` filter:

```typescript
// foundation/config/registry.ts:290-296
getAuditLog(key?: string, tenantId?: string): ConfigAuditEntry[] {
  return this.auditLog.filter(entry => {
    if (key && entry.key !== key) return false;
    if (tenantId && entry.tenantId !== tenantId) return false;  // optional!
    return true;
  });
}
```

```typescript
// foundation/secrets/manager.ts:230-234
listSecrets(tenantId?: string): SecretMetadata[] {
  const all = Array.from(this.metadata.values());
  if (!tenantId) return all;  // returns ALL secrets when omitted
  return all.filter(s => s.tenantId === tenantId);
}
```

### Impact

Any internal service calling `getAuditLog()` or `listSecrets()` without `tenantId` receives cross-tenant data. In a multi-tenant SaaS, this is a compliance violation (SOC 2 CC6.1, GDPR Art. 5(1)(f)).

### Root Cause

Optional tenantId was designed for admin/debug use cases. But it creates a footgun for production code paths.

### Fix

Make `tenantId` required. Add a separate `getAuditLogAdmin()` method for legitimate cross-tenant queries (requires ADMIN permission).

---

## Weakness #3: Unbounded Memory Arrays

**Severity**: HIGH  
**Domains Affected**: Scalability, Reliability

### Evidence

5 arrays grow without bounds:

| File | Array | Growth Rate |
|---|---|---|
| `foundation/secrets/manager.ts:33` | `rotationHistory[]` | 1 per rotation |
| `foundation/secrets/manager.ts:34` | `auditLog[]` | 1 per secret op |
| `foundation/config/registry.ts:32` | `auditLog[]` | 1 per config change |
| `foundation/capability-registry/registry.ts:33` | `eventLog[]` | 1 per registry event |
| `foundation/classification/registry.ts:167` | `auditLog[]` | 1 per classification op |

### Impact

In a 24h production run:
- Config changes: ~100/day → 3,650/year
- Secret operations: ~50/day → 1,825/year
- Capability events: ~200/day → 73,000/year
- Classification ops: ~50/day → 1,825/year

After 1 year: ~80,000 entries in memory. After 5 years: ~400,000 entries. This is a slow OOM.

### Root Cause

No max-size enforcement, no TTL eviction, no periodic cleanup. The foundation layer was designed for correctness, not longevity.

### Fix

Replace plain arrays with bounded ring buffers:

```typescript
class BoundedArray<T> {
  private items: T[] = [];
  constructor(private maxSize: number = 10_000) {}
  push(item: T) {
    this.items.push(item);
    if (this.items.length > this.maxSize) {
      this.items = this.items.slice(-this.maxSize);  // keep newest
    }
  }
}
```

---

## Weakness #4: Silent Error Swallowing

**Severity**: HIGH  
**Domains Affected**: Failure Recovery, Maintainability, Operational Excellence

### Evidence

83 empty catch blocks found outside test files. 30+ in financial/business-critical paths:

| File | Line | What Fails Silently |
|---|---|---|
| `runtime/secrets/secret-runtime.ts` | 287 | Secret rotation failure |
| `runtime/capabilities/registry.ts` | 374 | Health polling failure |
| `modules/cfo-advisor/cfo-advisor.service.ts` | 1332,1361,1401,1439,1481 | CFO financial data fetches (5 instances) |
| `modules/onboarding/enterprise-readiness.service.ts` | 89,119,156,198,249,287,317,345,367,402 | Readiness checks (10 instances) |
| `modules/ledger/approval-workflow.ts` | 311,402,524 | Approval notification dispatch |
| `modules/copilot/ai.service.ts` | 151 | AI generation failure |
| `modules/queue/queue.service.ts` | 181 | Queue service failure |
| `lib/financial-precision.ts` | 186 | Financial precision helper |

### Impact

1. **Invisible failures**: Engineers have no visibility into what's failing. Debugging requires adding logging after the fact.
2. **Data inconsistency**: Secret rotation failures mean secrets expire without warning. Health polling failures mean unhealthy providers appear healthy.
3. **Financial risk**: CFO data fetches returning empty data could lead to incorrect financial decisions.

### Root Cause

Empty catch blocks were added as quick fixes during development. No policy enforced error logging in catch blocks.

### Fix

1. Add ESLint rule: `no-empty-catch` (warn, not error — some empty catches are intentional)
2. Replace critical-path empty catches with `logger.error(err, "context")`
3. Add Pino to all catch blocks in foundation layer

---

## Weakness #5: Missing Input Validation

**Severity**: HIGH  
**Domains Affected**: Security, Maintainability

### Evidence

19 API routes accept request bodies without Zod or any validation:

| Route | Risk |
|---|---|
| `app/api/v1/admin/users/[userId]/assign-role/route.ts` | Privilege escalation — roleId not validated |
| `app/api/auth/mfa/route.ts` | `request.json().catch(() => ({}))` — malformed JSON returns empty object |
| `app/api/v1/admin/ai-providers/route.ts` | Admin mutation without validation |
| `app/api/v1/admin/approval-authorities/route.ts` | No body validation |
| `app/api/v1/admin/approval-rules/route.ts` | No body validation |
| 14 others | Various missing validation |

### Impact

1. **Injection**: Unvalidated input could contain unexpected fields that affect business logic.
2. **Type confusion**: `request.json()` returns `any` — downstream code may assume wrong types.
3. **Debugging**: No clear contract for what the API expects.

### Root Cause

Routes were added incrementally without enforcing a validation policy. Some use Zod, some don't.

### Fix

1. Add ESLint rule: `require-zod-validation` for API route handlers
2. Add Zod schemas to all 19 routes
3. Add middleware that validates `Content-Type: application/json` and rejects oversized bodies

---

## Weakness #6: ConfigurationRuntime Type Safety

**Severity**: HIGH  
**Domains Affected**: Maintainability, Reliability

### Evidence

13 `as any` casts in `runtime/configuration/registry.ts`:

| Lines | What |
|---|---|
| 126, 217 | Object literals cast to `any` |
| 131, 143, 155 | Config values cast to `any` |
| 253, 259 | Schema definitions cast to `any` |
| 454 | Scope map cast to `any` |
| 509-514 | Entire `ConfigScope` enum bypassed with 5 `as any` |

### Impact

1. **Type safety bypass**: TypeScript cannot catch type errors in these code paths.
2. **Refactoring risk**: Changing types in one place may silently break consumers.
3. **Code review burden**: `as any` hides intent — reviewers cannot verify correctness.

### Root Cause

Configuration values are polymorphic (string, number, boolean, JSON). The type system struggles with this without proper generics.

### Fix

Use discriminated union for `ConfigValue`:

```typescript
type ConfigValue = 
  | { type: 'string'; value: string }
  | { type: 'number'; value: number }
  | { type: 'boolean'; value: boolean }
  | { type: 'json'; value: Record<string, unknown> };
```

---

## Weakness Summary

| # | Weakness | Severity | Fix Effort | Fix Phase |
|---|---|---|---|---|
| 1 | Singleton overwrite | CRITICAL | Small (add shutdown before overwrite) | 26.2A |
| 2 | Cross-tenant audit leak | CRITICAL | Small (make tenantId required) | 26.2A |
| 3 | Unbounded memory arrays | HIGH | Medium (ring buffer class) | 26.2B |
| 4 | Silent error swallowing | HIGH | Large (83 files) | 26.2B |
| 5 | Missing input validation | HIGH | Medium (19 routes) | 26.2C |
| 6 | Type safety bypass | HIGH | Medium (refactor types) | 26.2B |

**Total Fix Effort**: ~3-4 weeks across 3 phases.
