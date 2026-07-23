# Authorization

## How It Works

Request authentication flows through `authenticateRequest()` (`src/server/security/authenticate-request.ts`):

```
Incoming Request
│
├── Has "Authorization: Bearer <token>"?
│   ├── Yes → ApiKeyService.validate(token)
│   │   ├── Valid   → return TenantContext { userId, companyId, role }
│   │   └── Invalid → throw UnauthorizedError
│   │
│   └── No  → auth() (NextAuth session)
│       ├── Authenticated → requireTenantContext(session)
│       │   → return TenantContext { userId, companyId, role }
│       └── Not authenticated → throw UnauthorizedError
```

## Permission Patterns

### API Key Scopes

Defined in `SCOPE_MAP` at `src/server/security/authenticate-request.ts:6`:

```typescript
const SCOPE_MAP: Record<string, string[]> = {
  "read:accounts": ["GET"],
  "write:transfers": ["POST", "PUT", "PATCH"],
  "admin:all": ["GET", "POST", "PUT", "PATCH", "DELETE"],
};
```

API keys are validated against their assigned scopes. Scopes map to HTTP methods for REST resources.

### Tenant Isolation

Every authenticated request returns a `TenantContext` containing `companyId`. All downstream database queries MUST filter by `companyId` to prevent cross-tenant data access. The `requireTenantContext()` function throws `ForbiddenError` if tenant context cannot be established.

### Route Protection Guide

```typescript
import { authenticateRequest } from "@/server/security/authenticate-request";

// In an API route handler:
export async function GET(request: Request) {
  // Authenticate (throws UnauthorizedError or ForbiddenError on failure)
  const ctx = await authenticateRequest(request, "read:transfers");

  // ctx.userId, ctx.companyId, ctx.role — available for downstream use
  const data = await prisma.transfer.findMany({
    where: { companyId: ctx.companyId },
  });

  return Response.json(data);
}

// For protection-only without data:
export async function POST(request: Request) {
  await authenticateRequest(request, "write:transfers");
  // Continue with handler logic...
}
```

### Using the optional scope parameter

- Pass `undefined` (or omit) when the route needs authentication but no specific scope.
- Pass a scope string (e.g. `"admin:all"`) to enforce fine-grained permission.

### CSRF Protection

Applied via `CSRFProtection.middleware()` in `src/server/security/csrf.ts`. Validates `x-csrf-token` header against `x-csrf-stored` for state-changing requests. Tokens are 64 hex characters (32 random bytes). Origin validation (`validateOrigin()`) blocks requests from non-allowed origins.

## Adding New Permissions

1. **Add to SCOPE_MAP** in `src/server/security/authenticate-request.ts`:
   ```typescript
   const SCOPE_MAP: Record<string, string[]> = {
     // ...existing scopes
     "read:compliance-reports": ["GET"],
   };
   ```

2. **Document the scope** in this file under the scopes table.

3. **Assign to API keys** via the API key management UI or API:
   - Add the new scope string to the key's `scopes` array

4. **Use in route handlers**:
   ```typescript
   await authenticateRequest(request, "read:compliance-reports");
   ```

## Rate Limiting

Applied via `rateLimit()` (`src/server/security/rate-limit.ts`). Default: 20 requests per 5-minute window. Falls back to in-memory store when Redis is unavailable. Returns `Retry-After` and `X-RateLimit-*` headers.

```typescript
import { rateLimit, rateLimitKey } from "@/server/security/rate-limit";

const key = rateLimitKey("api", clientIp);
const result = await rateLimit(key);
if (!result.ok) {
  return new Response("Rate limit exceeded", { status: 429, headers: { "Retry-After": "..." } });
}
```
