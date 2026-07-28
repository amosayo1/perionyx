# EDP-26.0A — Runtime Convergence & Canonical Execution Path

| Field | Value |
|---|---|
| **Phase** | 26.0A |
| **Status** | Accepted |
| **Date** | 2026-07-27 |
| **Author** | Perionyx Engineering |
| **Scope** | Runtime context convergence, legacy auth deletion, infrastructure rewrite |

---

## Decision Summary

Establish `withRuntimeContext` as the **single, canonical execution path** for every authenticated request in the Perionyx platform. Eliminate the dual `auth()` + `requireTenantContext()` pattern that existed in parallel.

---

## Context

Phase 24.0B introduced `RuntimeContext` via AsyncLocalStorage (`src/runtime/context/runtime-context.ts:30`). Phase 26.0 wired 5 proof-of-concept routes. The codebase had **448 files** still using the legacy pattern:

```
const session = await auth();
const ctx = requireTenantContext(session);
```

This dual execution path meant:
- Two auth strategies to maintain and audit
- `requireTenantContext` duplicated validation logic already in `withRuntimeContext`
- Security surface area doubled — both paths needed identical guard enforcement
- No single point to add cross-cutting concerns (tracing, locale, permissions)

---

## Decisions

### D1: `withRuntimeContext` Is the Only Production Runtime

**Decision**: Every API route and Server Component must establish context via `withRuntimeContext()`.

**Rationale**: AsyncLocalStorage provides automatic propagation through async call chains without threading parameters. One entry point means one place to enforce auth, tenant isolation, license checks, and correlation IDs.

**Alternatives considered**:
- *Thread context via parameters*: Rejected — requires changing every service method signature (1,000+ call sites).
- *Global singleton*: Rejected — not concurrency-safe, breaks tenant isolation.
- *Middleware-only*: Rejected — Next.js middleware runs at the edge (not in Node.js), cannot use AsyncLocalStorage.

### D2: Codemod for Mass Migration

**Decision**: Build an automated codemod (`scripts/migrate-routes.mjs`) to migrate 446 files.

**Rationale**: Manual migration of 446 files would take ~2 weeks and introduce human error. The codemod handles:
- Multi-line imports and `requireTenantContext()` calls
- No-parameter functions (`GET()` → `new Headers()`)
- Bare `ctx` on own lines as function arguments
- `session?.user?.id` → `ctx.tenant.userId` property rewriting

**Trade-off**: Codemod handles 95% of patterns. 5 files required manual fixes (edge cases in import ordering, session property chains).

### D3: `apAuth()` Wraps `withRuntimeContext()` Internally

**Decision**: AP routes continue calling `apAuth(req)` — the middleware wraps `withRuntimeContext()` internally.

**Rationale**: 67 AP routes use `apAuth()`. Changing all of them would be high-risk with no functional benefit. The middleware at `src/server/procurement/api/middleware.ts:37` calls `withRuntimeContext(request, async (ctx) => { ... })` and extracts the AP-specific context.

**Impact**: Zero changes to 67 AP route files. RuntimeContext is established transparently.

### D4: Preserve API Key Fallback in Security Infrastructure

**Decision**: `require-permission.ts` and `authenticate-request.ts` fall back to `ApiKeyService.validate()` when RuntimeContext has no tenant.

**Rationale**: API key requests bypass the proxy (no JWT → no proxy headers). The proxy doesn't set `x-user-id`/`x-company-id`/`x-company-role` headers for Bearer token requests. These routes need a fallback path.

**Files**: `src/server/security/require-permission.ts:32-40`, `src/server/security/authenticate-request.ts:27-37`

### D5: Delete `requireTenantContext` Function

**Decision**: Delete the validation function from `src/server/context/tenant-context.ts`. Keep the `TenantContext` type (242 module consumers).

**Rationale**: After 448 files migrated, zero consumers remain for the function. The type is used by 242+ files and is the canonical shape for tenant identity.

### D6: Delete 13 Dead Runtime Getters

**Decision**: Reduce `src/runtime/context/runtime-context.ts` from 16 exports to 3: `withRuntimeContext`, `getRuntimeContext`, `requireRuntimeContext`.

**Rationale**: The 13 deleted functions were convenience wrappers that duplicated what `requireRuntimeContext()` already provides. Zero consumers in the codebase.

---

## Risks and Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Codemod produces incorrect transforms | Medium | Dry-run mode, manual review of 5 edge cases, TypeScript compilation as gate |
| AsyncLocalStorage overhead | Low | Measured <0.1ms per context propagation; Node.js native API |
| API key routes break | High | Preserved fallback in `require-permission.ts` and `authenticate-request.ts` |
| 67 AP routes break | High | `apAuth()` wraps `withRuntimeContext()` — zero AP route changes |
| Server Components break | Medium | Codemod adds `headers()` import from `next/headers` automatically |

---

## Verification

| Gate | Result |
|---|---|
| `pnpm typecheck` | PASS — 0 errors |
| `pnpm build` | PASS — production build |
| AP API tests | 52/52 PASS |
| Runtime tests | 60/60 PASS |
| Legacy `requireTenantContext` consumers | 0 (function deleted) |
| Dual execution paths | 2 → 1 |

---

## Metrics

| Metric | Before | After | Delta |
|---|---|---|---|
| Files using `requireTenantContext` | 448 | 0 | -448 |
| Files using `withRuntimeContext` | 5 | 446 | +441 |
| Dead runtime exports | 13 | 0 | -13 |
| RuntimeContext module lines | 120 | 73 | -47 |
| Tenant context module lines | 43 | 14 | -29 |
| Total lines removed (legacy) | — | — | ~2,000 |
| Total lines added (new pattern) | — | — | ~500 |
| Net code reduction | — | — | ~1,500 |
