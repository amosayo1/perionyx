# API Standards — Phase 18.0

## Current State
- 402 route files under `src/app/api/`
- Pattern: `src/app/api/{domain}/{resource}/route.ts`

## Standard Auth Pattern
```typescript
import { auth } from "@/lib/auth";
import { requireTenantContext } from "@/lib/auth-helpers";
import { rbacService } from "@/modules/rbac";
import { handleRouteError } from "@/server/http/handle-route";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(
      session?.user?.id,
      session?.user?.activeCompanyId,
      session?.user?.companyRole
    );
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'resource.read');
    // ... business logic
    return NextResponse.json(data);
  } catch (error) {
    return handleRouteError(error);
  }
}
```

## Standard Error Handling
- `handleRouteError(error)` — catches AppError, returns structured JSON with request-id
- `zodErrorResponse(zodError)` — catches ZodError, returns 400 with issues
- AppError types: UnauthorizedError (401), ForbiddenError (403), NotFoundError (404), ConflictError (409), ValidationError (422)

## Standard Cache Headers
- `cacheHeaders(ttl)` — Cache-Control with tiered TTLs
- `noCacheHeaders()` — private, no-store for sensitive data

## Standard Body Parsing
- `parseJsonBody(req, options)` — Content-Length check (1MB default, 10MB hard cap), then request.json()

## Standard Pagination
- Query params: `page`, `limit`, `sortBy`, `sortOrder`
- Response: `{ data: T[], total: number, page: number, limit: number }`

## Standard Filtering
- Query params: `search`, `status`, `type`, `from`, `to`
- Date ranges: ISO 8601 strings

## Naming Conventions
- Routes: `/api/{domain}/{resource}` (plural nouns)
- Nested: `/api/{domain}/{resource}/{id}/{action}`
- Versioned: `/api/v1/{domain}/{resource}`

## Response Format
```json
{
  "data": {},
  "meta": { "total": 100, "page": 1, "limit": 25 }
}
```

## Health Endpoints
- `/api/health` — minimal: `{ status, ready, live }`
- `/api/health/readiness` — readiness probe
- `/api/health/liveness` — liveness probe

## Deprecated Patterns
- `validationError()`, `notFoundError()`, `serverError()` in automation-studio.ts — use handleRouteError instead
- 422 status for validation errors — standardize on 400 (zodErrorResponse)

## Inconsistencies Found
1. Some routes use 422 for validation (automation-studio), others use 400
2. Some routes missing request-id in error responses
3. Inconsistent pagination (some use offset/limit, others use cursor)
4. Some routes don't use cacheHeaders where appropriate
5. Versioning is inconsistent (/api/v1/ for some, /api/ for others)
