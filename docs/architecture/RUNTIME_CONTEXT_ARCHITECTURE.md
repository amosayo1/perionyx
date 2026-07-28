# Runtime Context Architecture

| Field | Value |
|---|---|
| **Phase** | 24.0B (foundation) / 26.0A (convergence) |
| **Status** | Active — canonical execution path |
| **Implementation** | Node.js `AsyncLocalStorage` |

---

## Overview

The Runtime Context is the **single source of truth** for request-scoped data in the Perionyx platform. It propagates automatically through async call chains via Node.js `AsyncLocalStorage`, eliminating the need to thread context through function parameters.

---

## Core API (3 functions)

**File**: `src/runtime/context/runtime-context.ts` (73 lines)

### `withRuntimeContext(options, fn)`
```typescript
async function withRuntimeContext<T>(
  options: WithContextOptions,
  fn: () => Promise<T>,
): Promise<T>
```
- **Purpose**: Establish a context scope for an async function
- **Behavior**: Merges options with parent context (if nested), stores in `AsyncLocalStorage`
- **Usage**: Called once per request at the route handler level

### `requireRuntimeContext()`
```typescript
function requireRuntimeContext(): RuntimeContext
```
- **Purpose**: Read the current context (throws if not in scope)
- **Behavior**: Reads from `AsyncLocalStorage.getStore()`
- **Usage**: Called by any service/function that needs request context

### `getRuntimeContext()`
```typescript
function getRuntimeContext(): RuntimeContext | undefined
```
- **Purpose**: Read the current context (returns undefined if not in scope)
- **Usage**: Optional context access where absence is acceptable

---

## Type Hierarchy

**File**: `src/runtime/context/types.ts` (83 lines)

```typescript
interface RuntimeContext {
  tenant?: TenantContext;      // Company identity
  request?: RequestContext;    // Request metadata
  trace?: TraceContext;        // Distributed tracing
  permission?: PermissionContext; // RBAC state
  financial?: FinancialContext; // Financial settings
  locale?: LocaleContext;      // Locale/formatting
}
```

### Sub-Contexts

| Context | Fields | Set By |
|---|---|---|
| `TenantContext` | `userId`, `companyId`, `role` | `withRuntimeContext` (via proxy headers) |
| `RequestContext` | `requestId`, `correlationId`, `causationId?`, `clientIp?`, `userAgent?`, `method?`, `path?` | Proxy + `withRuntimeContext` |
| `TraceContext` | `traceId`, `spanId?`, `parentSpanId?`, `baggage?` | Distributed tracing middleware |
| `PermissionContext` | `permissions`, `mfaVerified`, `sessionStartedAt?` | Auth middleware |
| `FinancialContext` | `defaultCurrency`, `fiscalYearStart`, `accountingMethod`, `decimalPrecision` | Company configuration |
| `LocaleContext` | `locale`, `timezone`, `dateFormat`, `numberFormat` | Proxy (locale detection) |

---

## Integration Points

### 1. Proxy → RuntimeContext

**File**: `src/proxy.ts:65-80`

The proxy runs at the edge and extracts JWT claims:
```
x-user-id: {userId}
x-company-id: {companyId}
x-company-role: {role}
x-request-id: {uuid}
x-next-intl-locale: {locale}
```

These headers are read by `extractContextFromHeaders()` in `init-runtime-context.ts:54-81`.

### 2. Route Handler → RuntimeContext

**File**: `src/server/http/init-runtime-context.ts:125-151`

```typescript
export async function withRuntimeContext<T>(
  input: Request | Headers,
  handler: (ctx: RuntimeContext & { tenant: TenantContext }) => Promise<T>,
): Promise<T>
```

- Reads proxy headers via `extractContextFromHeaders()`
- Validates tenant via `validateTenantContext()` (auth + company + license)
- Falls back to `auth()` when proxy headers are missing (API key path)
- Wraps handler in `AsyncLocalStorage.run()` via `_withRuntimeContext`

### 3. Server Components → RuntimeContext

Server Components use `headers()` from `next/headers`:
```typescript
return withRuntimeContext(await headers(), async (ctx) => {
  // ctx.tenant available
});
```

**77 Server Components** use this pattern.

### 4. Server Actions → RuntimeContext

Server Actions also use `headers()`:
```typescript
async function getContext() {
  return withRuntimeContext(await headers(), async (ctx) => {
    return ctx.tenant;
  });
}
```

**File**: `src/components/automation-studio/actions.ts:11-15`

### 5. AP Routes → RuntimeContext

AP routes use `apAuth()` which wraps `withRuntimeContext()`:
```typescript
export async function apAuth(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    return { ctx: { tenant: ctx.tenant, correlationId } };
  });
}
```

**File**: `src/server/procurement/api/middleware.ts:30-50`

**67 AP routes** use this path transparently.

### 6. Security Infrastructure → RuntimeContext

**File**: `src/server/security/require-permission.ts:21`
**File**: `src/server/security/authenticate-request.ts:21`

Both read from `requireRuntimeContext()` first, with API key fallback when `tenant` is undefined.

---

## AsyncLocalStorage Behavior

### Scope Isolation
```typescript
await withRuntimeContext({ tenant: t1 }, async () => {
  // Context has t1
  await withRuntimeContext({ tenant: t2 }, async () => {
    // Context has t2 (inner override)
  });
  // Context has t1 (outer restored)
});
```

### Concurrency Safety
```typescript
await Promise.all([
  withRuntimeContext({ tenant: t1 }, async () => {
    // Always sees t1, even with async delays
  }),
  withRuntimeContext({ tenant: t2 }, async () => {
    // Always sees t2
  }),
]);
```

Each `withRuntimeContext` call creates an isolated context. Concurrent requests in the same Node.js process are safe.

### Nesting Behavior
Inner contexts inherit parent values for fields not explicitly provided:
```typescript
await withRuntimeContext({ tenant, request }, async () => {
  await withRuntimeContext({ trace }, async () => {
    // tenant from parent, request from parent, trace from inner
  });
});
```

---

## Barrel Exports

### `src/runtime/context/index.ts`
```typescript
export type { RuntimeContext, WithContextOptions, TenantContext, ... } from './types';
export { withRuntimeContext, getRuntimeContext, requireRuntimeContext } from './runtime-context';
```

### `src/runtime/index.ts`
```typescript
export { withRuntimeContext, getRuntimeContext, requireRuntimeContext } from './context';
export type { RuntimeContext, WithContextOptions, TenantContext, ... } from './context';
```

### Import Paths
| Import | Path |
|---|---|
| Functions | `@/runtime/context` or `@/runtime` |
| Types | `@/runtime/context` or `@/runtime` |
| Canonical entry | `@/server/http/init-runtime-context` (adds proxy header extraction) |

---

## File Reference

| File | Purpose | Lines |
|---|---|---|
| `src/runtime/context/runtime-context.ts` | AsyncLocalStorage core (3 functions) | 73 |
| `src/runtime/context/types.ts` | Type definitions (6 sub-contexts) | 83 |
| `src/runtime/context/index.ts` | Barrel export | 22 |
| `src/runtime/index.ts` | Top-level barrel | 56 |
| `src/server/http/init-runtime-context.ts` | Proxy header extraction + validation | 151 |
| `src/server/security/require-permission.ts` | Permission checks via RuntimeContext | 69 |
| `src/server/security/authenticate-request.ts` | Auth resolution via RuntimeContext | 40 |
| `src/server/procurement/api/middleware.ts` | AP route wrapper | 99 |
| `src/server/context/tenant-context.ts` | TenantContext type (242 consumers) | 14 |
| `test/runtime.test.ts` | 60 tests covering context, runtime, errors, secrets | 622 |
