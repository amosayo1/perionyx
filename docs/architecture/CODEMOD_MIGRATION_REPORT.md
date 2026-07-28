# Codemod Migration Report — Phase 26.0A

| Field | Value |
|---|---|
| **Phase** | 26.0A |
| **Date** | 2026-07-27 |
| **Script** | `scripts/migrate-routes.mjs` |
| **Version** | v2 |
| **Lines** | 478 |

---

## Overview

An automated codemod script migrated 446 files from the legacy `auth()` + `requireTenantContext()` pattern to `withRuntimeContext()`. The script handled 95% of files automatically; 5 edge cases required manual fixes.

---

## Script Location

```
scripts/migrate-routes.mjs
```

### Usage
```bash
# Dry run — see what would change
node scripts/migrate-routes.mjs --dry-run --scope=api

# Migrate API routes
node scripts/migrate-routes.mjs --scope=api

# Migrate Server Components
node scripts/migrate-routes.mjs --scope=pages

# Migrate everything
node scripts/migrate-routes.mjs --scope=all
```

### Flags
- `--dry-run` — Preview changes without writing files
- `--scope=api|pages|all` — Target API routes, Server Components, or both

---

## Patterns Handled

### Pattern 1: Import Replacement
**Before**:
```typescript
import { auth } from "@/server/auth/auth";
import { requireTenantContext, type TenantContext } from "@/server/context/tenant-context";
```

**After**:
```typescript
import { withRuntimeContext } from "@/server/http/init-runtime-context";
```

**Mechanism** (lines 201-224):
- Pass 1 scans for `auth` and `requireTenantContext` imports
- Removes both import lines
- Finds the last import block end via `findLastImportEnd()` (handles multi-line imports)
- Inserts `withRuntimeContext` import after the last import

### Pattern 2: Function Wrapping
**Before**:
```typescript
export async function GET(request: NextRequest) {
  const session = await auth();
  const ctx = requireTenantContext(session);
  // ... handler body
}
```

**After**:
```typescript
export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    // ... handler body (indented +2)
  });
}
```

**Mechanism** (lines 226-303):
- Matches `export async function NAME(` with or without parameters
- Tracks paren depth to find the body opening `{`
- Detects request parameter name (first param before colon)
- No-param functions (`GET()`) get `new Headers()` as fallback

### Pattern 3: Auth Line Removal
**Removed patterns**:
- `const session = await auth();`
- `const ctx = requireTenantContext(session);` (single-line)
- Multi-line `requireTenantContext()` calls (up to 10 continuation lines)

**Mechanism** (lines 103-137):
- `removeAuthLines()` filters out auth-related lines
- Handles multi-line `requireTenantContext(` ... `);` spanning multiple lines

### Pattern 4: Property Rewriting
**Transforms applied**:
| Before | After |
|---|---|
| `ctx.property` | `ctx.tenant.property` |
| `(ctx)` | `(ctx.tenant)` |
| `(ctx,` | `(ctx.tenant,` |
| `, ctx)` | `, ctx.tenant)` |
| `session?.user?.id` | `ctx.tenant.userId` |
| `session!.user!.id` | `ctx.tenant.userId` |
| `session.user.id` | `ctx.tenant.userId` |
| `session?.user?.activeCompanyId` | `ctx.tenant.companyId` |
| `session?.user?.companyRole` | `ctx.tenant.role` |

**Mechanism** (lines 142-185):
- `transformCtx()` applies regex replacements per line
- Handles optional chaining (`?.`), non-null assertion (`!.`), and direct access

### Pattern 5: Server Component Adaptation
**Additional transforms for `page.tsx` files**:
- Adds `import { headers } from "next/headers";` if not present
- Wraps body in `withRuntimeContext(await headers(), async (ctx) => { ... })`
- Removes `if (!ctx) redirect("/sign-in");` guards (RuntimeContext throws on missing auth)

**Mechanism** (lines 317-429):
- `migratePage()` handles Server Component specifics
- Detects existing `headers` import to avoid duplicates

---

## Migration Statistics

| Metric | Count |
|---|---|
| API route files scanned | ~430 |
| Server Component files scanned | ~90 |
| **Files migrated (codemod)** | **446** |
| Files skipped (no pattern match) | ~60 |
| Files skipped (already migrated) | 5 |
| Files requiring manual fix | 5 |
| **Total files using `withRuntimeContext`** | **451** (446 + 5 Phase 26.0) |

### By Scope
| Scope | Migrated | Skipped |
|---|---|---|
| API routes (`src/app/api/`) | 369 | ~55 |
| Server Components (`src/app/(shell)/`) | 77 | ~13 |
| **Total** | **446** | **~68** |

---

## Edge Cases Fixed Manually

### 1. Multi-line `requireTenantContext` with spread args
Some routes passed complex objects to `requireTenantContext` spanning 5+ lines. The codemod's 10-line lookahead caught most, but 2 files had unusual indentation.

### 2. `ctx` used as standalone argument
```typescript
// Before
await service.process(ctx);
// After (codemod correctly handles)
await service.process(ctx.tenant);
```
3 files had `ctx` on its own line as the last argument in a multi-line function call. The codemod's regex (`/^(\s+)ctx(\s*)$/`) handles this.

### 3. Import ordering after removal
2 files had the `auth` import in the middle of a grouped import block. Removing it left a dangling comma. Fixed by hand.

### 4. Session property chains
1 file used `session?.user?.profile?.name` which the codemod didn't transform (not in the standard 6 patterns). Fixed manually.

### 5. Re-export of `auth`
1 file re-exported `auth` for testing. Required manual removal of the re-export.

---

## Skip Criteria

Files were skipped when:
1. **No pattern match**: File doesn't import both `auth` and `requireTenantContext`
2. **Already migrated**: File already imports from `init-runtime-context`
3. **Special auth functions**: File uses `requireSession`, `requireAuth`, or `requirePermission` (different pattern)

---

## Safety Measures

1. **Dry-run mode**: `--dry-run` previews all changes without writing
2. **TypeScript gate**: `pnpm typecheck` after migration catches transform errors
3. **Build gate**: `pnpm build` catches runtime import issues
4. **Test gate**: 52 AP tests + 60 runtime tests verify no regressions
5. **Idempotent**: Running twice on same file produces same result (skip-already check)
