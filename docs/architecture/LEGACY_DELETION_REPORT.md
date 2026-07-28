# Legacy Deletion Report — Phase 26.0A

| Field | Value |
|---|---|
| **Phase** | 26.0A |
| **Date** | 2026-07-27 |
| **Total lines removed** | ~230 (dead code) + ~2,000 (legacy auth pattern) |

---

## 1. `requireTenantContext` Function

**File**: `src/server/context/tenant-context.ts`

### Before (43 lines)
```typescript
import type { CompanyRole } from "@prisma/client";

export type TenantContext = {
  userId: string;
  companyId: string;
  role: CompanyRole;
};

export function requireTenantContext(session: { user?: { id?: string; activeCompanyId?: string; companyRole?: string } } | null): TenantContext {
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (!session.user.activeCompanyId || !session.user.companyRole) {
    throw new Error("No active company");
  }
  const licensedCompanyId = process.env.LICENSE_COMPANY_ID;
  if (licensedCompanyId && session.user.activeCompanyId !== licensedCompanyId) {
    throw new Error("Instance licensed for different company");
  }
  return {
    userId: session.user.id,
    companyId: session.user.activeCompanyId,
    role: session.user.companyRole as CompanyRole,
  };
}
```

### After (14 lines)
```typescript
import type { CompanyRole } from "@prisma/client";

/**
 * Tenant context — the canonical shape for tenant identity in all code.
 * Used by 242+ module files. Do not delete or restructure.
 * The validation function that was here (requireTenantContext) has been
 * replaced by withRuntimeContext (src/server/http/init-runtime-context.ts).
 */
export type TenantContext = {
  userId: string;
  companyId: string;
  role: CompanyRole;
};
```

**Lines removed**: 29
**Validation logic**: Now in `src/server/http/init-runtime-context.ts:91-111` (`validateTenantContext`)

---

## 2. Dead Runtime Getters (13 functions)

**File**: `src/runtime/context/runtime-context.ts`

### Before (~120 lines, 16 exports)
The module exported 16 functions/types including convenience wrappers:
- `withRuntimeContext`
- `getRuntimeContext`
- `requireRuntimeContext`
- `getTenantId` — `requireRuntimeContext().tenant?.companyId`
- `getUserId` — `requireRuntimeContext().tenant?.userId`
- `getUserRole` — `requireRuntimeContext().tenant?.role`
- `getRequestId` — `requireRuntimeContext().request?.requestId`
- `getCorrelationId` — `requireRuntimeContext().request?.correlationId`
- `getLocale` — `requireRuntimeContext().locale?.locale`
- `getTimezone` — `requireRuntimeContext().locale?.timezone`
- `getDefaultCurrency` — `requireRuntimeContext().financial?.defaultCurrency`
- `getDecimalPrecision` — `requireRuntimeContext().financial?.decimalPrecision`
- `getPermissions` — `requireRuntimeContext().permission?.permissions`
- `isMfaVerified` — `requireRuntimeContext().permission?.mfaVerified`
- `getClientIp` — `requireRuntimeContext().request?.clientIp`
- `getUserAgent` — `requireRuntimeContext().request?.userAgent`

### After (73 lines, 3 exports)
```typescript
export async function withRuntimeContext<T>(...) { ... }  // line 38
export function requireRuntimeContext(): RuntimeContext { ... }  // line 57
export function getRuntimeContext(): RuntimeContext | undefined { ... }  // line 71
```

**Lines removed**: ~47
**Reason**: All 13 getters were one-liner wrappers around `requireRuntimeContext()`. Any consumer can access properties directly from the returned context object.

---

## 3. Barrel Export Cleanup

### `src/runtime/context/index.ts`

**Before**: 16 re-exports from `./runtime-context`
**After**: 3 re-exports

### `src/runtime/index.ts`

**Before**: 16 re-exports from `./context`
**After**: 3 re-exports

**Lines removed**: ~30 (13 type exports + 13 value exports replaced by 3 each)

---

## 4. Test Cleanup

**File**: `test/runtime.test.ts`

### Tests Removed (3)
1. `getTenantId returns companyId outside nested context` — tested deleted function
2. `getRequestId returns requestId` — tested deleted function
3. `getCorrelationId returns correlationId` — tested deleted function

### Tests Updated
- All tests now use `requireRuntimeContext()` or `getRuntimeContext()` exclusively

**Lines removed**: ~50
**Tests remaining**: 60 (all passing)

---

## 5. Import Updates

### `src/server/context/tenant-context.ts`
- No import changes needed — only export of type

### `src/runtime/context/runtime-context.ts`
- Removed imports for deleted function return types (now accessed via `RuntimeContext` directly)

### `src/runtime/context/index.ts`
- 16 type exports → 8 type exports (removed redundant re-exports of deleted functions)
- 13 value exports → 3 value exports

---

## 6. Summary

| Category | Items | Lines Removed |
|---|---|---|
| `requireTenantContext` function | 1 | 29 |
| Dead runtime getters | 13 | ~47 |
| Barrel export cleanup | 2 files | ~30 |
| Test cleanup | 3 tests | ~50 |
| **Subtotal: Dead code** | **17 items** | **~156** |
| Legacy auth pattern (446 files) | 446 | ~2,000 |
| **Total** | **463 items** | **~2,156** |
