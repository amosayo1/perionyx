# 44 — Context Propagation Is the Invisible Architecture

**Status**: Active
**Phase**: 24.0B
**Domain**: Architecture
**Impact**: Foundation

## Lesson

The most impactful architectural decisions are often invisible to consumers. The Runtime Context (`AsyncLocalStorage`-based) propagates tenant, request, trace, permission, financial, and locale context through every async call chain — no parameter threading required. Services that adopt it become automatically context-aware without any API changes.

## Context

Before Phase 24.0B, every service method required explicit `companyId` or `tenantContext` parameters. This led to:
- Inconsistent context passing (some services received it, some didn't)
- Manual context threading through 3-5 layers of async calls
- Forgotten context propagation in new code paths
- No standard for trace/request/permission propagation

The AsyncLocalStorage approach eliminates all of these by making context ambient — available anywhere in the call chain without explicit passing.

## Evidence

- **16 context getters** — `getTenantId()`, `getCorrelationId()`, `getPermissionContext()`, etc. — all zero-argument
- **Zero breaking changes** — existing services with explicit `companyId` parameters continue to work; new code reads from context
- **Concurrency-safe** — each async operation gets its own context snapshot, no cross-contamination
- **Nested override** — inner scopes can override specific context fields while inheriting others

## Application

When building enterprise platforms:
1. Use `AsyncLocalStorage` for cross-cutting context (tenant, auth, trace) — not DI, not globals
2. Provide both `withContext()` (explicit) and `getContext()` (ambient) patterns
3. Design context types as flat interfaces — no nesting beyond 2 levels
4. Bridge existing patterns with compatibility helpers (`fromTenantContext()`, `withTenantContext()`)

## Related

- Principle #20: Every Shared Capability Implemented Once, Centrally
- Phase 24.0B: Runtime Platform
- Phase 24.0: Enterprise Foundation Implementation
