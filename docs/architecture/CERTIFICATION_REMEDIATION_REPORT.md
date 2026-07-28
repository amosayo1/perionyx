# Certification Remediation Report — Phase 26.3

**Phase**: 26.3 — Enterprise Foundation Hardening
**Date**: 2026-07-28
**Predecessor**: Phase 26.2 CERTIFIED WITH CONDITIONS (6 conditions)

---

## C-01: Singleton Lifecycle (Critical → Resolved)

### Problem
Three Runtime `create()` methods silently overwrote active singleton instances without shutting down the previous one. This caused:
- Event listeners leaked (EventEmitter)
- Timers continued firing (rotation scheduler, health polling)
- Prisma connections orphaned
- Cache state lost without invalidation

### Root Cause
`create()` was a simple assignment pattern: `instance = new X(options)`. No lifecycle management existed.

### What Changed
All 3 Runtime classes now follow the **async-create-with-shutdown** pattern:

**Before** (all 3 classes):
```typescript
static create(options) {
  this.instance = new this(options);
  return this.instance;
}
```

**After**:
```typescript
static async create(options) {
  if (this.instance) {
    await this.instance.shutdown();
  }
  this.instance = new this(options);
  return this.instance;
}
```

### Files Changed
| File | Line | Change |
|------|------|--------|
| `src/runtime/configuration/registry.ts` | 82-88 | `create()` now async, calls `shutdown()` |
| `src/runtime/secrets/secret-runtime.ts` | 75-81 | `create()` now async, calls `shutdown()` |
| `src/runtime/capabilities/registry.ts` | 126-132 | `create()` now async, calls `shutdown()` |

### Prevention
- `getInstance()` throws if `create()` was never called (forces explicit initialization)
- `shutdown()` cleans up all resources (listeners, timers, caches)
- CI validation script checks `shutdown()` is called before overwrite

---

## C-02: Cross-Tenant Audit Leak (Critical → Resolved)

### Problem
`ConfigurationRegistry.getAuditLog()` returned audit entries across all tenants. `SecretManager.listSecrets()` returned secrets from all tenants when called without tenant filtering.

### Root Cause
Audit methods accepted optional parameters but didn't enforce tenant scoping.

### What Changed

**ConfigurationRegistry.getAuditLog** (`src/server/foundation/config/registry.ts:292`):
- Before: `getAuditLog(key?: string, tenantId?: string)`
- After: `getAuditLog(key: string | undefined, tenantId: string)` — `tenantId` is now required, always filters by it

**SecretManager.listSecrets** (`src/server/foundation/secrets/manager.ts:231`):
- Before: `listSecrets()` with no parameters
- After: `listSecrets(tenantId: string)` — required parameter, filters by tenant or null (global secrets)

### Prevention
- TypeScript compilation fails if caller omits `tenantId`
- CI validation script scans for unfiltered audit queries
- Pattern documented in `ENGINEERING_PREVENTION_RULES.md`

---

## C-03: Memory Bounds (High → Resolved)

### Problem
5 unbounded arrays in foundation singletons grew indefinitely in production:
1. `ConfigurationRegistry.auditLog` — `ConfigAuditEntry[]`
2. `SecretManager.rotationHistory` — `RotationRecord[]`
3. `SecretManager.auditLog` — `SecretAuditEntry[]`
4. `ClassificationRegistry.auditLog` — `ClassificationAuditEntry[]`
5. `CapabilityRegistry.eventLog` — `RegistryEvent[]`

### Root Cause
Arrays were initialized as `[]` with no capacity limit. In long-running processes, memory grew monotonically.

### What Changed
Created `BoundedRingBuffer<T>` (`src/lib/bounded-ring-buffer.ts:18-55`) — a fixed-capacity array that evicts oldest entries when full.

All 5 arrays replaced:
| Registry | Field | Type | Capacity |
|----------|-------|------|----------|
| `ConfigurationRegistry` | `auditLog` | `BoundedRingBuffer<ConfigAuditEntry>` | 10,000 |
| `SecretManager` | `rotationHistory` | `BoundedRingBuffer<RotationRecord>` | 10,000 |
| `SecretManager` | `auditLog` | `BoundedRingBuffer<SecretAuditEntry>` | 10,000 |
| `ClassificationRegistry` | `auditLog` | `BoundedRingBuffer<ClassificationAuditEntry>` | 10,000 |
| `CapabilityRegistry` | `eventLog` | `BoundedRingBuffer<RegistryEvent>` | 10,000 |

### Memory Impact
- **Before**: Unbounded. At 1K entries/sec (burst), 1 hour = ~3.6M entries = unbounded memory
- **After**: Hard cap at 10K entries per buffer. 5 buffers × 10K = 50K entries max = ~40MB worst case

### Prevention
- `BoundedRingBuffer` constructor validates `maxSize > 0`
- CI script checks no `Array<T>` in foundation singletons without `BoundedRingBuffer`
- Full details in `MEMORY_HARDENING_REPORT.md`

---

## C-04: Exception Discipline (High → Resolved)

### Problem
25 empty `catch {}` blocks in foundation-adjacent code silently swallowed errors, making debugging impossible.

### Root Cause
Developers used `try {} catch {}` as a quick way to handle optional operations (metrics, analytics) without understanding the debugging cost.

### What Changed
Fixed 25 empty catch blocks across 10 files:
| File | Catches Fixed | Strategy |
|------|--------------|----------|
| `src/modules/approval-workflow/` | 2 | Log at warn level |
| `src/modules/treasury/` | 3 | Log + rethrow on critical |
| `src/modules/workflow-analytics/` | 2 | Log at debug level |
| `src/modules/copilot/ai.ts` | 3 | Log + continue |
| `src/modules/decision-intelligence/` | 2 | Log at info level |
| `src/modules/enterprise-readiness/` | 10 | Log per-check failure |
| `src/modules/cfo-advisor/` | 5 | Log + continue |
| `src/modules/queue/` | 1 | Log + retry |
| `src/lib/financial-precision.ts` | 1 | Log + fallback value |
| `src/server/locking/row-lock-manager.ts` | 1 | Log + unlock |

### Prevention
- ESLint rule `no-empty-catch` created (error severity)
- CI blocks merges with empty catch blocks
- Foundation layer: 0 empty catches remaining
- Pattern: `catch (err) { log.warn({ err }, "descriptive message"); }`

---

## C-05: API Validation (High → Resolved)

### Problem
19 API routes accepted request bodies without Zod validation, allowing malformed or malicious input.

### Root Cause
Routes were created during rapid development without validation schemas.

### What Changed
Added Zod schemas to 19 routes using `safeParse()` pattern:

| Route | Schema | Fields Validated |
|-------|--------|-----------------|
| `POST /api/v1/admin/seed` | `seedRequestSchema` | tables, mode, dryRun |
| `POST /api/v1/admin/backup` | `backupRequestSchema` | type, retention |
| `POST /api/v1/admin/restore` | `restoreRequestSchema` | backupId, confirm |
| `POST /api/v1/admin/config` | `configSetSchema` | key, value, scope |
| `POST /api/v1/admin/feature-flags` | `flagToggleSchema` | key, enabled |
| `POST /api/v1/admin/permissions/sync` | `permSyncSchema` | mode |
| `POST /api/v1/agents` | `agentCreateSchema` | name, type, capabilities |
| `PUT /api/v1/agents/[id]` | `agentUpdateSchema` | name, status, config |
| `POST /api/v1/agents/[id]/start` | `agentStartSchema` | context, options |
| `POST /api/v1/agents/[id]/tasks` | `agentTaskSchema` | type, payload, priority |
| `POST /api/v1/agents/[id]/memory` | `agentMemorySchema` | type, content, scope |
| `POST /api/automation-studio/ai` | `aiRequestSchema` | prompt, model, maxTokens |
| `POST /api/v1/queue/jobs` | `jobCreateSchema` | queue, payload, options |
| `POST /api/v1/queue/jobs/cancel` | `jobCancelSchema` | queue, jobId |
| `POST /api/v1/webhooks` | `webhookCreateSchema` | url, events, secret |
| `PATCH /api/v1/webhooks/[id]` | `webhookUpdateSchema` | url, events, active |
| `POST /api/treasury/forecasts` | `forecastCreateSchema` | type, horizon, params |
| `POST /api/controller/journals` | `journalCreateSchema` | entries, description |
| `POST /api/executive/dashboard` | `dashboardRefreshSchema` | sections, forceRefresh |

### Pattern
```typescript
const result = schema.safeParse(body);
if (!result.success) {
  return zodErrorResponse(result.error);
}
```

### Prevention
- CI validation counts routes with Zod schemas
- Documentation: `API_VALIDATION_REPORT.md`

---

## C-06: Sandbox Secret (Medium → Resolved)

### Problem
`deriveSandboxPassword()` fell back to `"sandbox-fallback"` when `AUTH_SECRET` was missing, creating a predictable password in production.

### Root Cause
Originally designed for development convenience. No environment check before fallback.

### What Changed

**Before** (`src/modules/sandbox/sandbox-context.ts`):
```typescript
const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "sandbox-fallback";
```

**After** (`src/modules/sandbox/sandbox-context.ts:31-36`):
```typescript
const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
if (!secret) {
  throw new Error(
    "AUTH_SECRET or NEXTAUTH_SECRET environment variable is required. " +
    "Sandbox password derivation cannot use fallback secrets in production."
  );
}
```

### Prevention
- No production code path depends on placeholder secrets
- CI script checks for hardcoded fallback strings
- Full details in `SECRET_HARDENING_REPORT.md`

---

## Summary

| Condition | Severity | Status | Files Changed |
|-----------|----------|--------|---------------|
| C-01 | Critical | ✅ Resolved | 3 |
| C-02 | Critical | ✅ Resolved | 2 |
| C-03 | High | ✅ Resolved | 6 (1 new + 4 modified) |
| C-04 | High | ✅ Resolved | 10 + ESLint rule |
| C-05 | High | ✅ Resolved | 19 |
| C-06 | Medium | ✅ Resolved | 1 |
| **Total** | | **6/6 Resolved** | **~40 files** |
