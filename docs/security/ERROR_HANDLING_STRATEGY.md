# Error Handling Strategy

## Principle

**Never expose internal state to external callers.** Every error response must be safe for a public status page. Detailed diagnostics belong in audit logs, not HTTP responses.

## What Was Fixed (Phase 17.1 + 17.2)

### Health Endpoint

**Before**: Exposed database error details, memory usage, uptime, Node.js version, and heap statistics.

**After**: Returns `{ status: "ok" }` with 200 or `{ status: "degraded" }` with 503. All diagnostic data removed from the response body. Internal health checks still run but results are only written to structured logs.

### RBAC / Permission Errors

**Before**: Error messages like "User lacks role ADMIN for resource /api/agents" revealed role names and resource paths.

**After**: Returns generic `"You do not have permission to perform this action"` with error code `FORBIDDEN`. Role names, resource paths, and required permissions are never included in the response. Permission checks and role names are logged server-side.

### Approval Workflow Errors

**Before**: Error responses disclosed transaction type, amount, role names, and approval chain details.

**After**: Returns generic `"Approval request could not be processed"`. Transaction details, amounts, roles, and chain information are written to audit logs only. The approver can see these details in the authenticated UI — never in error responses.

### Workflow Engine Errors

**Before**: Step status, role names, and execution details leaked in error messages.

**After**: Returns generic `"Workflow execution failed"`. Step status, role requirements, and execution metadata are logged with the workflow instance ID for debugging.

### Ledger Errors

**Before**: Wallet IDs and company IDs disclosed in error messages.

**After**: Returns generic `"Transaction could not be processed"`. Wallet and company identifiers are logged with correlation IDs for support tracing.

### User Change Password Errors

**Before**: Specific error like "Current password is incorrect" confirmed password validity.

**After**: Returns generic `"Password change failed"`. The `changePassword` method returns a boolean — the controller maps it to a generic error. Password validity is never confirmed or denied to the caller.

## Error Format

### AppError (Structured)

```typescript
class AppError extends Error {
  constructor(
    public code: string,    // Machine-readable: "FORBIDDEN", "NOT_FOUND", "VALIDATION_ERROR"
    message: string,        // Human-readable, safe for external display
    public statusCode: number = 400,
    public details?: Record<string, unknown> // Only safe metadata (e.g., field names for validation)
  )
}
```

### External Response

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action"
  }
}
```

### Internal Audit Log (not sent to client)

```json
{
  "correlationId": "abc-123",
  "userId": "user-456",
  "action": "APPROVAL_CREATE",
  "reason": "User lacks role TREASURER for approval threshold $50,000",
  "resource": "/api/v1/approvals",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "timestamp": "2026-07-20T10:30:00Z"
}
```

## Cache Headers

**Before**: `Cache-Control: public, max-age=...` — allowed CDN caching of authenticated API responses.

**After**: `Cache-Control: private, no-store, max-age=0` for all authenticated endpoints. Read-only endpoints may use `private, max-age=30, stale-while-revalidate=10` for browser-level caching. CDN caching is never permitted for responses containing user data.

The `cacheHeaders()` helper in `src/server/http/handle-route.ts` always sets `private`:

```typescript
export function cacheHeaders(ttl: number) {
  return {
    'Cache-Control': `private, max-age=${ttl}, stale-while-revalidate=${Math.min(ttl, 10)}`,
    'Vary': 'Authorization',
  };
}
```

## Body Size Limits

- **Default**: 1 MB for all API endpoints
- **Hard cap**: 10 MB maximum (enforced before body parsing)
- **Implementation**: Content-Length header checked before `req.json()` is called; oversized requests rejected with `413 Payload Too Large`
- **Rationale**: Prevents memory exhaustion from oversized payloads. File upload endpoints have separate limits defined per route.

| Limit | Value | Enforcement |
|---|---|---|
| Default body | 1 MB | Content-Length check |
| Hard cap | 10 MB | Absolute maximum, cannot be overridden |
| File uploads | Route-specific | Per-endpoint configuration |
| AI proxy | 1 MB | Prompt + context payload |

## Architecture

### handleRouteError()

The centralized error handler in `src/server/http/handle-route.ts`:

1. **AppError**: Returns structured response with `code`, `message`, and `statusCode`. Details logged at `warn` level.
2. **ZodError**: Returns validation error with field-level messages. No internal schema details.
3. **Unknown error**: Returns generic `"Internal server error"` with 500 status. Full error logged at `error` level with correlation ID.
4. **Never**: Re-throws, exposes stack traces, or includes internal error details in the response body.

```
Request → Route Handler → try/catch
  ├── AppError      → { error: { code, message } } + audit log
  ├── ZodError      → { error: { code: "VALIDATION_ERROR", details: [...] } }
  ├── PrismaError   → { error: { code: "INTERNAL", message: "Internal server error" } } + error log
  └── Unknown       → { error: { code: "INTERNAL", message: "Internal server error" } } + error log
```

### Correlation IDs

Every request receives a correlation ID via the proxy layer. This ID is:
- Included in all error responses as `X-Correlation-Id` header
- Written to structured logs for tracing
- Never contains internal state (random UUID v4)
