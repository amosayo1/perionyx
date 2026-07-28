# Infrastructure Rewrite Report — Phase 26.0A

| Field | Value |
|---|---|
| **Phase** | 26.0A |
| **Date** | 2026-07-27 |
| **Files rewritten** | 4 |
| **Reason** | These files were the foundation of the dual execution path |

---

## Overview

Four infrastructure files formed the backbone of the legacy `auth()` + `requireTenantContext()` pattern. Each was rewritten to read from `RuntimeContext` instead, with API key fallback preserved where needed.

---

## 1. `src/server/security/require-permission.ts`

**Lines**: 69

### Before
```typescript
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";

export async function requirePermission(request: Request, permission: string) {
  const session = await auth();
  const ctx = requireTenantContext(session);
  await rbacService.ensurePermission(ctx.userId, ctx.companyId, permission);
  return ctx;
}
```

### After
```typescript
import { requireRuntimeContext } from "@/runtime/context";

export async function requirePermission(request: Request, permission: string) {
  const runtimeCtx = requireRuntimeContext();          // line 21
  if (runtimeCtx.tenant) {                            // line 23
    await rbacService.ensurePermission(...);          // line 24-28
    return runtimeCtx.tenant;                         // line 29
  }
  // API key fallback                                 // line 32-40
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const apiKeyResult = await ApiKeyService.validate(authHeader);
    ...
  }
}
```

### Why
`requirePermission` is called by ~50 routes that need fine-grained RBAC checks beyond the basic tenant validation. It must read from the same context that `withRuntimeContext` established.

### Impact
- **Consumers**: ~50 routes
- **Behavior change**: None — same permission checks, same error shapes
- **API key path**: Preserved (line 32-40)

---

## 2. `src/server/security/authenticate-request.ts`

**Lines**: 40

### Before
```typescript
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";

export async function authenticateRequest(request: Request, requiredScope?: string) {
  const session = await auth();
  const ctx = requireTenantContext(session);
  // scope check...
  return ctx;
}
```

### After
```typescript
import { requireRuntimeContext } from "@/runtime/context";

export async function authenticateRequest(request: Request, requiredScope?: string) {
  const runtimeCtx = requireRuntimeContext();          // line 21
  if (runtimeCtx.tenant) {                            // line 23
    return runtimeCtx.tenant;                         // line 24
  }
  // API key fallback with scope check                // line 27-37
  ...
}
```

### Why
`authenticateRequest` is used by 2 transaction routes (`transfer`, `credit`) that were migrated from `authenticateRequest()` to `withRuntimeContext()`. The function now reads from RuntimeContext first.

### Impact
- **Consumers**: 2 routes (direct), plus any future routes using this function
- **Behavior change**: None
- **API key path**: Preserved with scope validation (line 32-34)

---

## 3. `src/server/procurement/api/middleware.ts`

**Lines**: 99

### Before
```typescript
export async function apAuth(request: Request) {
  const session = await auth();
  const ctx = requireTenantContext(session);
  return { ctx: { tenant: ctx, correlationId: generateCorrelationId() } };
}
```

### After
```typescript
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function apAuth(request: Request) {
  const correlationId = request.headers.get("x-correlation-id") ?? ...;
  try {
    const result = await withRuntimeContext(request, async (ctx) => {  // line 37
      logger.info({ correlationId, userId: ctx.tenant.userId, ... });
      return { ctx: { tenant: ctx.tenant, correlationId } };
    });
    return result;
  } catch (error) {
    return apErrorResponse(error, correlationId);    // line 48
  }
}
```

### Why
This is the critical convergence point for 67 AP routes. By having `apAuth` wrap `withRuntimeContext` internally, zero AP route files needed changes.

### Impact
- **Consumers**: 67 AP route files
- **Behavior change**: None — same `APRequestContext` shape returned
- **Error handling**: Errors now caught and returned as `NextResponse` (line 47-49), which was already the existing pattern
- **Key insight**: AP routes call `apAuth(req)` → `apAuth` calls `withRuntimeContext` → RuntimeContext is established → AP routes get `ctx.tenant`

---

## 4. `src/components/automation-studio/actions.ts`

**Lines**: 146

### Before
```typescript
"use server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";

async function getContext() {
  const session = await auth();
  return requireTenantContext(session);
}
```

### After
```typescript
"use server";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

async function getContext() {
  return withRuntimeContext(await headers(), async (ctx) => {  // line 12
    return ctx.tenant;
  });
}
```

### Why
Server Actions don't receive a `Request` object. They use `headers()` from `next/headers` to access the incoming request headers set by the proxy.

### Impact
- **Consumers**: 16 Server Actions (create/update/delete workflow definitions, instances, versions)
- **Behavior change**: None — same `TenantContext` returned
- **Pattern**: Server Components and Server Actions use the same `await headers()` pattern

---

## Convergence Summary

| File | Before Pattern | After Pattern | Consumers |
|---|---|---|---|
| `require-permission.ts` | `auth()` + `requireTenantContext` | `requireRuntimeContext()` + API key fallback | ~50 |
| `authenticate-request.ts` | `auth()` + `requireTenantContext` | `requireRuntimeContext()` + API key fallback | 2+ |
| `procurement/api/middleware.ts` | `auth()` + `requireTenantContext` | `withRuntimeContext()` wrapper | 67 |
| `automation-studio/actions.ts` | `auth()` + `requireTenantContext` | `withRuntimeContext(await headers())` | 16 |
| **Total** | **4 files** | **Unified** | **~135** |
