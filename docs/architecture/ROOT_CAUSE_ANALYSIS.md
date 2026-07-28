# Root Cause Analysis — Phase 26.3

**Phase**: 26.3 — Enterprise Foundation Hardening
**Date**: 2026-07-28
**Scope**: 6 certification conditions from Phase 26.2

---

## C-01: Singleton Lifecycle — Overwrite Without Shutdown

### Root Cause
Singletons were created with a simple check-then-assign pattern. No lifecycle management existed because the original design assumed `create()` would only be called once (at boot). The possibility of re-initialization (e.g., hot reload, test isolation, configuration change) was not designed for.

### Contributing Factors
- Phase 24.0B built singletons quickly under time pressure
- No integration tests exercised re-initialization
- TypeScript didn't enforce async lifecycle

### Why Previous Reviews Missed It
- Code review focused on "does `getInstance()` work?" (yes) not "does `create()` handle re-calls?" (no)
- Hot reload is rare in production but common in development
- No test triggered the bug path

### Architecture Implications
- Every singleton with resources (EventEmitter, timers, connections) must have a `shutdown()` method
- `create()` must be the only way to set the instance

### Engineering Implications
- Singleton lifecycle testing must include: create → use → create again → verify old resources cleaned up

### Permanent Prevention
- CI script checks `shutdown()` called before overwrite
- Pattern documented in `ENGINEERING_PREVENTION_RULES.md`
- `getInstance()` throws if `create()` never called

### Lesson Learned
**Lesson 52a**: "Singletons are state machines. State machines need lifecycle transitions. Design for re-initialization from day one."

---

## C-02: Cross-Tenant Audit Leak — Missing Tenant Filter

### Root Cause
`getAuditLog()` and `listSecrets()` were designed as convenience methods with optional parameters. The optional `tenantId` meant callers could (and did) omit it, getting cross-tenant data.

### Contributing Factors
- Foundation was built as a global singleton, not per-tenant
- No compile-time enforcement of tenant scoping
- API consumers trusted the method to return scoped data

### Why Previous Reviews Missed It
- Tenant isolation is checked at the API layer (`requireTenantContext`), not at the foundation layer
- Foundation methods are "internal" — assumed safe
- Cross-tenant leak was silent (no error, just too much data)

### Architecture Implications
- Foundation methods that query tenant-scoped data must require `tenantId` as a non-optional parameter
- Audit data is tenant-scoped even if the singleton is global

### Engineering Implications
- TypeScript parameter optionality is a security contract — optional means "caller must remember"

### Permanent Prevention
- `tenantId` is now required in all audit query methods
- CI scans for unfiltered tenant queries in foundation layer

### Lesson Learned
**Lesson 52b**: "Optional parameters in security-sensitive methods are a bug waiting to happen. Make the safe path the only path."

---

## C-03: Memory Bounds — Unbounded Arrays

### Root Cause
Audit logs and event buffers were implemented as plain `Array<T>` with `push()`. No capacity limit was considered because the original design assumed short-lived processes (Next.js serverless).

### Contributing Factors
- Foundation was designed for serverless, then deployed as a long-running process
- In-memory stores were marked "ephemeral" in Phase 1 (ADR-003) but never revisited
- No memory profiling in CI

### Why Previous Reviews Missed It
- Memory growth is invisible in short-running tests
- 10K entries is a "reasonable" number that sounds bounded but has no enforcement
- No production memory monitoring existed

### Architecture Implications
- Every in-memory collection must have a capacity contract
- Capacity must be enforced, not just documented

### Engineering Implications
- `BoundedRingBuffer` is the standard for in-memory collections
- Capacity should be a constructor parameter, not a comment

### Permanent Prevention
- `BoundedRingBuffer<T>` replaces all unbounded arrays
- CI checks no `Array<T>` in foundation singletons
- Memory impact documented in `MEMORY_HARDENING_REPORT.md`

### Lesson Learned
**Lesson 52c**: "In-memory stores in long-running processes are not caches — they are databases. Databases need capacity limits."

---

## C-04: Exception Discipline — Silent Error Swallowing

### Root Cause
Empty `catch {}` blocks were used as a quick way to handle "optional" operations (metrics, analytics, UI updates). The convention was "ignore if it fails" but the implementation was "ignore that it failed."

### Contributing Factors
- Many catches were for metrics/tracing (best-effort), not critical logic
- ESLint had no rule against empty catches
- Code reviews treated `catch {}` as acceptable for non-critical paths

### Why Previous Reviews Missed It
- 83 empty catches were found in Phase 26.2 audit but only 25 were in critical paths
- Some catches were legitimate (localStorage in browser, JSON.parse fallback)
- No ESLint rule to catch them automatically

### Architecture Implications
- Every catch block must have an explicit strategy: log, recover, rethrow, or document why it's intentionally empty
- Foundation layer must have zero empty catches

### Engineering Implications
- ESLint `no-empty-catch` rule enforces this at the compiler level
- CI blocks merges with empty catches

### Permanent Prevention
- ESLint rule `no-empty-catch` (error severity)
- CI validation script checks foundation layer
- Pattern: `catch (err) { log.warn({ err }, "context"); }`

### Lesson Learned
**Lesson 52d**: "Silent errors are worse than loud failures. A catch block that does nothing is a bug that hides other bugs."

---

## C-05: API Validation — Missing Input Sanitization

### Root Cause
19 API routes were created during rapid development phases (agent framework, admin tools, AI proxy) without Zod validation schemas. The convention existed (`handleRouteError` + `zodErrorResponse`) but was not consistently applied.

### Contributing Factors
- Agent framework was built quickly (Phase 13.0) with 8 endpoint groups
- Admin tools were scaffolding (Phase 11B) that became production
- AI proxy was a quick integration (Phase 18.1B)

### Why Previous Reviews Missed It
- Validation was checked at the UI layer (forms) but not at the API layer
- Routes worked correctly with well-formed input
- No security test attempted malformed input

### Architecture Implications
- Every API route that accepts a body must have a Zod schema
- `safeParse` is the standard pattern, not `parse` (which throws)

### Engineering Implications
- CI could count routes with/without schemas to detect gaps
- Schema-first development: write schema before handler

### Permanent Prevention
- 19 routes now validated
- CI validation counts Zod-validated routes
- Pattern documented in `API_VALIDATION_REPORT.md`

### Lesson Learned
**Lesson 52e**: "Validation is not optional even when the UI validates. The API is a trust boundary — defend it independently."

---

## C-06: Sandbox Secret — Placeholder in Production Path

### Root Cause
`deriveSandboxPassword()` used `"sandbox-fallback"` as a default when `AUTH_SECRET` was missing. This was designed for development convenience but remained in production code.

### Contributing Factors
- Sandbox was built for demos (Phase 1) with quick development shortcuts
- No environment check differentiated dev from production
- The fallback was "safe enough" for development but dangerous in production

### Why Previous Reviews Missed It
- Sandbox code is not a common code path
- The fallback was documented as "development only" but not enforced
- No production test exercised the sandbox path without `AUTH_SECRET`

### Architecture Implications
- Placeholder secrets must never exist in production code paths
- Environment checks should be explicit (throw) not implicit (fallback)

### Engineering Implications
- Secret safety is a compile-time + runtime concern
- `AUTH_SECRET` validation should happen at boot, not at use

### Permanent Prevention
- Fallback removed, throws on missing
- CI scans for hardcoded fallback strings
- Full details in `SECRET_HARDENING_REPORT.md`

### Lesson Learned
**Lesson 52f**: "Convenience shortcuts in security paths become vulnerabilities in production. Never fall back to placeholder secrets."

---

## Cross-Cutting Analysis

### Why All 6 Conditions Existed Simultaneously

| Factor | Impact |
|--------|--------|
| Speed over safety | All 6 conditions prioritized convenience over correctness |
| Missing CI checks | No automated detection of empty catches, missing validation, or unbounded arrays |
| Audit gap | Phase 26.2 identified conditions but had no enforcement mechanism |
| Foundation age | Foundation was 3 months old (Phase 24.0) — old enough to have accumulated debt |

### Permanent Prevention Architecture
```
ESLint (no-empty-catch)        → Prevents new empty catches
CI validation (7 checks)       → Detects regressions automatically
BoundedRingBuffer              → Enforces memory limits by design
Required tenantId              → Prevents cross-tenant data access
safeParse pattern              → Validates all API input
Throws on missing secrets      → Fails loudly on misconfiguration
```

Each condition has a **code-level** fix (the change) and a **process-level** prevention (the tooling). Neither alone is sufficient.
