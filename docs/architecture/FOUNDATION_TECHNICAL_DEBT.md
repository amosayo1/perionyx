# Foundation Technical Debt Register

**Phase**: 26.2 — Enterprise Foundation Certification  
**Date**: 2026-07-27

---

## Debt Summary

| Priority | Count | Estimated Effort |
|---|---|---|
| P0 (Certificate-Blocking) | 6 | 3-4 weeks |
| P1 (Must Fix Before Production) | 8 | 4-6 weeks |
| P2 (Should Fix) | 5 | 2-3 weeks |
| P3 (Nice to Have) | 4 | 1-2 weeks |
| **Total** | **23** | **10-15 weeks** |

---

## P0 — Certificate-Blocking (6 items, 3-4 weeks)

### TD-001: Singleton create() Overwrites Without Shutdown

| Field | Value |
|---|---|
| **ID** | TD-001 |
| **Priority** | P0 |
| **Files** | `runtime/capabilities/registry.ts:126`, `runtime/secrets/secret-runtime.ts:65`, `runtime/configuration/registry.ts:54` |
| **Effort** | 1 day |
| **Impact** | Orphaned timers, memory leak, test isolation failure |
| **Fix** | Add `if (instance) await instance.shutdown()` before overwrite in all 3 `create()` methods |

### TD-002: Foundation Audit Logs Cross-Tenant Leak

| Field | Value |
|---|---|
| **ID** | TD-002 |
| **Priority** | P0 |
| **Files** | `foundation/config/registry.ts:290-296`, `foundation/secrets/manager.ts:230-234`, `foundation/classification/registry.ts` audit methods |
| **Effort** | 1 day |
| **Impact** | Tenant data isolation violation, SOC 2 non-compliance |
| **Fix** | Make `tenantId` required in all audit log query methods. Add `getAuditLogAdmin()` for cross-tenant queries. |

### TD-003: Unbounded Memory Arrays

| Field | Value |
|---|---|
| **ID** | TD-003 |
| **Priority** | P0 |
| **Files** | `foundation/secrets/manager.ts:33-34`, `foundation/config/registry.ts:32`, `foundation/capability-registry/registry.ts:33`, `foundation/classification/registry.ts:167` |
| **Effort** | 2 days |
| **Impact** | OOM crash in long-running process |
| **Fix** | Create `BoundedRingBuffer<T>` class. Replace 5 plain arrays. Max-size: 10,000 entries. |

### TD-004: Critical Empty Catch Blocks

| Field | Value |
|---|---|
| **ID** | TD-004 |
| **Priority** | P0 |
| **Files** | 30+ files across `runtime/`, `modules/`, `lib/` |
| **Effort** | 3 days |
| **Impact** | Invisible failures in financial paths |
| **Fix** | Replace empty catches with `logger.error(err, "context")`. Prioritize: secret rotation, health polling, CFO data, approval notifications. |

### TD-005: Missing Zod Validation on 19 API Routes

| Field | Value |
|---|---|
| **ID** | TD-005 |
| **Priority** | P0 |
| **Files** | 19 routes in `app/api/` |
| **Effort** | 2 days |
| **Impact** | Injection, type confusion, privilege escalation |
| **Fix** | Add Zod schemas. Prioritize: `assign-role`, `mfa`, admin routes. |

### TD-006: Sandbox Fallback Secret

| Field | Value |
|---|---|
| **ID** | TD-006 |
| **Priority** | P0 |
| **Files** | `modules/sandbox/sandbox-context.ts:31` |
| **Effort** | 0.5 day |
| **Impact** | Predictable HMAC input |
| **Fix** | Throw on missing `AUTH_SECRET` in production. Keep fallback only in development/test. |

---

## P1 — Must Fix Before Production (8 items, 4-6 weeks)

### TD-007: ConfigurationRuntime 13 `as any` Casts

| Field | Value |
|---|---|
| **ID** | TD-007 |
| **Priority** | P1 |
| **Files** | `runtime/configuration/registry.ts` (13 instances) |
| **Effort** | 2 days |
| **Fix** | Refactor to discriminated union `ConfigValue` type. Remove all `as any`. |

### TD-008: Identity Module Dead Code (13 Files)

| Field | Value |
|---|---|
| **ID** | TD-008 |
| **Priority** | P1 |
| **Files** | `src/server/identity/` (13 files, 9 page consumers) |
| **Effort** | 2 days |
| **Fix** | Migrate 9 admin pages to use IAM module directly. Delete identity module. |

### TD-009: Duplicate Workflow Engines

| Field | Value |
|---|---|
| **ID** | TD-009 |
| **Priority** | P1 |
| **Files** | `workflow/engine.ts` vs `orchestration/workflow-engine.ts` |
| **Effort** | 1 week |
| **Fix** | Deprecate orchestration engine. Migrate consumers to primary engine. |

### TD-010: Permission Registry Conflict

| Field | Value |
|---|---|
| **ID** | TD-010 |
| **Priority** | P1 |
| **Files** | `permission-registry.ts` (24 perms) vs `iam/permissions.ts` (64 perms) |
| **Effort** | 1 day |
| **Fix** | Delete `permission-registry.ts`. Update 100+ API routes to use IAM registry. |

### TD-011: Logger Consolidation

| Field | Value |
|---|---|
| **ID** | TD-011 |
| **Priority** | P1 |
| **Files** | ~10 StructuredLogger consumers still exist |
| **Effort** | 1 day |
| **Fix** | Migrate remaining consumers to Pino. Delete StructuredLogger class. |

### TD-012: Event Bus Consolidation

| Field | Value |
|---|---|
| **ID** | TD-012 |
| **Priority** | P1 |
| **Files** | 6 independent event bus implementations (Phase 18.0) |
| **Effort** | 3 days |
| **Fix** | Consolidate to 3: enterprise, connector, cache. |

### TD-013: Queue Health Check No-Op

| Field | Value |
|---|---|
| **ID** | TD-013 |
| **Priority** | P1 |
| **Files** | `modules/queue/queue.service.ts` health check returns "managed externally" |
| **Effort** | 1 day |
| **Fix** | Wire PgBoss health check into Runtime health. |

### TD-014: Currency Service Duplicate

| Field | Value |
|---|---|
| **ID** | TD-014 |
| **Priority** | P1 |
| **Files** | `CurrencyService` vs `FxService` — identical FALLBACK_RATES |
| **Effort** | 2 days |
| **Fix** | Merge into single currency service. |

---

## P2 — Should Fix (5 items, 2-3 weeks)

### TD-015: formatCurrency Proliferation

| Field | Value |
|---|---|
| **ID** | TD-015 |
| **Priority** | P2 |
| **Files** | 100+ implementations across codebase |
| **Effort** | 1 week |
| **Fix** | Create single `formatCurrency()` in `lib/financial-formatting.ts`. Migrate consumers. |

### TD-016: SUPPORTED_CURRENCIES Conflicts

| Field | Value |
|---|---|
| **ID** | TD-016 |
| **Priority** | P2 |
| **Files** | 3 definitions (3, 12, 34 currencies) |
| **Effort** | 1 day |
| **Fix** | Single source of truth in `lib/currencies.ts`. |

### TD-017: No Read Replicas

| Field | Value |
|---|---|
| **ID** | TD-017 |
| **Priority** | P2 |
| **Files** | `server/db/database-operations.ts` |
| **Effort** | 3 days |
| **Fix** | Add read replica support for GET endpoints. |

### TD-018: No Response Compression

| Field | Value |
|---|---|
| **ID** | TD-018 |
| **Priority** | P2 |
| **Files** | `proxy.ts` |
| **Effort** | 1 day |
| **Fix** | Add `Accept-Encoding: gzip` support. |

### TD-019: ClassificationRegistry Zero Adoption

| Field | Value |
|---|---|
| **ID** | TD-019 |
| **Priority** | P2 |
| **Files** | `foundation/classification/` (functional but unused) |
| **Effort** | 1 week |
| **Fix** | Wire into Prisma middleware for automatic data classification. |

---

## P3 — Nice to Have (4 items, 1-2 weeks)

### TD-020: No ETag Support

| Field | Value |
|---|---|
| **ID** | TD-020 |
| **Priority** | P3 |
| **Files** | `proxy.ts` |
| **Effort** | 2 days |
| **Fix** | Add ETag generation and `If-None-Match` support. |

### TD-021: Missing JSDoc on Public Methods

| Field | Value |
|---|---|
| **ID** | TD-021 |
| **Priority** | P3 |
| **Files** | All foundation files |
| **Effort** | 2 days |
| **Fix** | Add JSDoc to all public methods. |

### TD-022: No Runbooks for Foundation Services

| Field | Value |
|---|---|
| **ID** | TD-022 |
| **Priority** | P3 |
| **Files** | `docs/operations/` |
| **Effort** | 1 day |
| **Fix** | Add runbooks for Runtime, Configuration, Secrets, Capabilities. |

### TD-023: K8s Secrets Still Placeholder

| Field | Value |
|---|---|
| **ID** | TD-023 |
| **Priority** | P3 |
| **Files** | `k8s/secrets.yaml` |
| **Effort** | 1 day |
| **Fix** | Document production secret management (Vault, AWS Secrets Manager). |

---

## Debt Velocity

| Phase | Items Resolved | Remaining |
|---|---|---|
| 26.1 (Complete) | 5 (logging, dead code, event bus, graceful shutdown, test mock) | 18 |
| 26.2A (Planned) | 2 (TD-001, TD-002) | 16 |
| 26.2B (Planned) | 4 (TD-003, TD-004, TD-007, TD-008) | 12 |
| 26.2C (Planned) | 2 (TD-005, TD-006) | 10 |
| 26.2D (Planned) | 6 (TD-009 through TD-014) | 4 |
| Post-26.2 | 4 (TD-015 through TD-018) | 0 |
