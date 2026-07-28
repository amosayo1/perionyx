# Canonical Execution Path

| Field | Value |
|---|---|
| **Phase** | 26.0A |
| **Status** | Active |
| **Established** | 2026-07-27 |

---

## Overview

Every authenticated request in the Perionyx platform flows through **one canonical execution path**. There are no alternatives, no legacy fallbacks, no parallel strategies. The path is:

```
Proxy → Headers → withRuntimeContext → Handler → ctx.tenant
```

---

## Primary Path: API Routes

```
┌─────────────────────────────────────────────────────────────────┐
│  Client Request                                                 │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Proxy (src/proxy.ts)                                          │
│  • Generates x-request-id                                       │
│  • Validates JWT via next-auth                                  │
│  • Extracts userId, companyId, companyRole from JWT             │
│  • Sets x-user-id, x-company-id, x-company-role headers        │
│  • Detects locale → x-next-intl-locale                          │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Route Handler                                                  │
│  export async function GET(request: Request) {                  │
│    return withRuntimeContext(request, async (ctx) => {           │
│      // ctx.tenant is guaranteed non-null                       │
│    });                                                          │
│  }                                                              │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│  withRuntimeContext (src/server/http/init-runtime-context.ts)    │
│  1. toHeaders(input) — normalize Request → Headers              │
│  2. extractContextFromHeaders(headers) — read proxy headers     │
│  3. validateTenantContext(raw) — auth + company + license check │
│  4. _withRuntimeContext(context, handler) — AsyncLocalStorage    │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│  AsyncLocalStorage (src/runtime/context/runtime-context.ts:30)  │
│  • Context stored in Node.js async_hooks AsyncLocalStorage      │
│  • Automatically propagated to all async calls within scope     │
│  • requireRuntimeContext() reads from anywhere in the chain     │
└─────────────────────────────────────────────────────────────────┘
```

### Key Implementation Details

**Proxy** (`src/proxy.ts:65-80`):
- Runs at the edge (Next.js middleware layer)
- JWT decoded via `getToken()` from `next-auth/jwt`
- 4 headers set: `x-user-id`, `x-company-id`, `x-company-role`, `x-request-id`

**`withRuntimeContext`** (`src/server/http/init-runtime-context.ts:125-151`):
- Accepts `Request | Headers` (Server Components use `headers()`)
- `extractContextFromHeaders` reads 4 proxy headers (line 54-81)
- `validateTenantContext` replicates the old `requireTenantContext` guards (line 91-111)
- Falls back to `auth()` when proxy headers are missing (API key path, line 136-143)
- Wraps handler in `AsyncLocalStorage.run()` via `_withRuntimeContext`

**Handler** receives `RuntimeContext & { tenant: TenantContext }`:
- `ctx.tenant.userId` — authenticated user ID
- `ctx.tenant.companyId` — active company ID
- `ctx.tenant.role` — company role (CompanyRole enum)
- `ctx.request?.requestId` — correlation ID
- `ctx.locale?.locale` — detected locale

---

## API Key Fallback Path

Used when requests carry a Bearer token instead of a session cookie. The proxy does not set headers for API key requests.

```
┌─────────────────────────────────────────────────────────────────┐
│  Client Request with Authorization: Bearer va_...               │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Proxy — no JWT found, headers not set                          │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│  withRuntimeContext                                             │
│  • extractContextFromHeaders → tenant = undefined               │
│  • Falls back to auth() for session check                       │
│  • If no session → UnauthorizedError                            │
└──────────────┬──────────────────────────────────────────────────┘
               │
               ▼ (for require-permission / authenticate-request)
┌─────────────────────────────────────────────────────────────────┐
│  API Key Validation                                             │
│  • require-permission.ts:32-40                                  │
│  • authenticate-request.ts:27-37                                │
│  • Checks Bearer token → ApiKeyService.validate()               │
│  • Returns { userId: keyId, companyId, role: "ADMIN" }          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Server Component Path

Server Components use `headers()` from `next/headers` instead of a `Request` object.

```
┌─────────────────────────────────────────────────────────────────┐
│  export default async function Page() {                         │
│    return withRuntimeContext(await headers(), async (ctx) => {   │
│      // ctx.tenant.companyId available for data fetching        │
│    });                                                          │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

**Key difference**: `await headers()` returns a `Headers` object (not a `Request`). The `toHeaders()` helper in `init-runtime-context.ts:39-42` handles both types.

**77 Server Components** use this path.

---

## Server Action Path

Server Actions use `headers()` from `next/headers` (same as Server Components).

```
┌─────────────────────────────────────────────────────────────────┐
│  "use server";                                                  │
│                                                                  │
│  import { withRuntimeContext } from "@/server/http/init-runtime-context";
│  import { headers } from "next/headers";                        │
│                                                                  │
│  async function getContext() {                                   │
│    return withRuntimeContext(await headers(), async (ctx) => {   │
│      return ctx.tenant;                                         │
│    });                                                          │
│  }                                                              │
│                                                                  │
│  export async function createWorkflowDefinition(data) {          │
│    const ctx = await getContext();                               │
│    // ...                                                       │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

**File**: `src/components/automation-studio/actions.ts:11-15`

---

## AP Route Path

67 AP routes use `apAuth()` which wraps `withRuntimeContext()` internally.

```
┌─────────────────────────────────────────────────────────────────┐
│  export async function POST(request: Request) {                 │
│    const authResult = await apAuth(request);                    │
│    if (authResult instanceof NextResponse) return authResult;   │
│    const { ctx } = authResult;                                  │
│    // ctx.tenant available + ctx.correlationId                   │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

**Implementation** (`src/server/procurement/api/middleware.ts:30-50`):
```
apAuth(request)
  → withRuntimeContext(request, async (ctx) => {
      // Log request
      return { ctx: { tenant: ctx.tenant, correlationId } }
    })
```

**Key benefit**: Zero changes needed in 67 AP route files.

---

## Context Propagation

Once `withRuntimeContext` establishes context via `AsyncLocalStorage.run()`, it propagates automatically:

```
withRuntimeContext(request, async (ctx) => {
  // AsyncLocalStorage context is now active
  
  await someService.doWork();          // ← can call requireRuntimeContext()
  await Promise.all([                  // ← concurrent calls each get context
    serviceA.process(),
    serviceB.process(),
  ]);
  await nestedAsync();                 // ← deep async chains work
});
```

**Implementation** (`src/runtime/context/runtime-context.ts:38-52`):
- Uses Node.js `AsyncLocalStorage` from `node:async_hooks`
- Merges with parent context on nested calls (line 42-50)
- Thread-safe — concurrent requests get isolated contexts (tested in `test/runtime.test.ts:149-165`)

---

## File Reference

| Component | File | Lines |
|---|---|---|
| Proxy (edge) | `src/proxy.ts` | 65-80 |
| Canonical entry point | `src/server/http/init-runtime-context.ts` | 125-151 |
| Header extraction | `src/server/http/init-runtime-context.ts` | 54-81 |
| Tenant validation | `src/server/http/init-runtime-context.ts` | 91-111 |
| AsyncLocalStorage core | `src/runtime/context/runtime-context.ts` | 38-65 |
| Type definitions | `src/runtime/context/types.ts` | 1-83 |
| Permission fallback | `src/server/security/require-permission.ts` | 21-43 |
| Auth fallback | `src/server/security/authenticate-request.ts` | 21-39 |
| AP middleware wrapper | `src/server/procurement/api/middleware.ts` | 30-50 |
| Server Action pattern | `src/components/automation-studio/actions.ts` | 11-15 |
