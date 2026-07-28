# Error Architecture

**Document Type**: Cross-Cutting Architecture
**Mission**: Define unified error handling standards for Perionyx — error taxonomy, contracts, propagation, translation, logging, metrics, recovery, and boundaries — ensuring every error is typed, correlated, logged, and actionable.
**Status**: Partially Built (unified error handling in `handle-route.ts`, domain errors, persistence errors, lock errors, rate limit errors)
**Constitutional Authority**: PLATFORM_CONSTITUTION.md — Law 5 ("Every External Dependency Is Observable"), Law 6 ("Financial Integrity Is Never Compromised")

---

## Responsibilities

1. **Error Taxonomy** — Categorize errors as Domain, Infrastructure, Integration, Security, or Validation.
2. **Error Contract** — Standardized error response shape across all APIs.
3. **Error Propagation** — Domain errors flow upward through platform, API, to client.
4. **Error Translation** — External provider errors translated to canonical Perionyx errors.
5. **Error Logging** — Structured, correlated logging for every error.
6. **Error Metrics** — Track error rates, types, and severity.
7. **Error Recovery** — Retry, fallback, and circuit breaker strategies per error type.
8. **Error Boundaries** — React error boundaries for UI resilience.
9. **Error Contracts** — Consistent API response format.
10. **Error Documentation** — Every error code documented with description and recovery.

---

## Error Taxonomy

### Error Categories

| Category | Description | Examples | Severity |
|---|---|---|---|
| **Domain** | Business rule violation | `INVOICE_NOT_FOUND`, `PAYMENT_ALREADY_PROCESSED` | Low-Medium |
| **Infrastructure** | System component failure | `DATABASE_TIMEOUT`, `CACHE_UNAVAILABLE` | Medium-High |
| **Integration** | External provider failure | `PLAID_SYNC_FAILED`, `QBO_API_ERROR` | Medium |
| **Security** | Auth/authz failure | `UNAUTHORIZED`, `FORBIDDEN`, `CSRF_REJECTED` | High |
| **Validation** | Input validation failure | `VALIDATION_ERROR`, `PAYLOAD_TOO_LARGE` | Low |

### Error Severity Levels

| Level | Description | Action Required |
|---|---|---|
| **info** | Expected business condition | Log only |
| **warning** | Unexpected but recoverable | Log + monitor |
| **error** | Failure requiring investigation | Log + alert |
| **critical** | System-threatening failure | Log + page + immediate action |

---

## Error Contract

### Standard API Error Response

```typescript
interface APIErrorResponse {
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable description
    details?: unknown;      // Additional context (validation issues, etc.)
    correlationId?: string; // Request tracing ID
    timestamp: string;      // ISO 8601 timestamp
  };
}
```

### HTTP Status Codes

| Status | Usage |
|---|---|
| 400 | Validation error, malformed request |
| 401 | Authentication required or failed |
| 403 | Authorization failed (insufficient permissions) |
| 404 | Resource not found |
| 409 | Conflict (duplicate, version mismatch) |
| 413 | Request body too large |
| 415 | Unsupported content type |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
| 502 | Upstream provider error |
| 503 | Service temporarily unavailable |
| 504 | Upstream timeout |

### Error Response Examples

```json
{
  "error": {
    "code": "VALIDATION",
    "message": "Amount must be positive; Currency is required",
    "issues": [
      { "path": ["amount"], "message": "Amount must be positive" },
      { "path": ["currency"], "message": "Currency is required" }
    ],
    "correlationId": "req_abc123",
    "timestamp": "2026-07-24T12:00:00Z"
  }
}
```

---

## Error Classes

### Application Errors

```typescript
// Source: src/lib/errors/app-error.ts (referenced by handle-route.ts)
class AppError extends Error {
  code: string;
  statusCode: number;
  constructor(message: string, code: string, statusCode: number);
}
```

### Persistence Errors

```typescript
// Source: src/server/persistence/domain/persistence-errors.ts
class PersistenceError extends Error {
  code: string;
  detail?: string;
}
class RepositoryError extends PersistenceError {
  repositoryName: string;
}
class TransactionError extends PersistenceError {
  transactionId?: string;
}
class ConcurrencyError extends TransactionError {
  entityId: string;
  expectedVersion: number;
  actualVersion: number;
}
class MigrationError extends PersistenceError {
  migrationName?: string;
}
class ValidationError extends PersistenceError {
  field?: string;
}
class VersionMismatchError extends PersistenceError {
  currentVersion: string;
  requiredVersion: string;
}
```

### Lock Errors

```typescript
// Source: src/server/locks/lock-errors.ts
class LockError extends Error {
  lockName: string;
  owner: string;
}
class DeadlockError extends LockError {
  conflictingLocks: string[];
}
class LeaseExpiredError extends LockError {
  leaseDuration: number;
}
class OwnershipError extends LockError {
  expectedOwner: string;
  actualOwner: string;
}
```

### Security Errors

```typescript
// Source: src/server/security/rate-limit.ts
class RateLimitError extends Error {
  retryAfter: number;
  limit: number;
  remaining: number;
}
```

---

## Error Propagation

### Propagation Flow

```
Domain Layer
  -> PersistenceError / DomainError
    -> Platform Service (wraps in AppError)
      -> API Route Handler (handleRouteError)
        -> HTTP Response (APIErrorResponse)
          -> Client (typed error object)
```

### Translation Rules

| Source Error | Translated To | HTTP Status |
|---|---|---|
| `PersistenceError` | `AppError("Database error", "DATABASE_ERROR", 500)` | 500 |
| `ConcurrencyError` | `AppError("Version mismatch", "CONFLICT", 409)` | 409 |
| `RepositoryError` | `AppError("Resource not found", "NOT_FOUND", 404)` | 404 |
| `LockError` | `AppError("Resource locked", "LOCKED", 409)` | 409 |
| `RateLimitError` | `AppError("Rate limited", "RATE_LIMITED", 429)` | 429 |
| `ZodError` | `AppError("Validation failed", "VALIDATION", 400)` | 400 |

### Provider Error Translation

External provider errors are always translated to canonical Perionyx errors:

```typescript
// Source: src/server/http/handle-route.ts
function handleRouteError(error: unknown, request?: Request): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.statusCode }
    );
  }
  // Unknown errors: log and return generic 500
  logger.error(error);
  return NextResponse.json(
    { error: { code: "INTERNAL", message: "Internal server error" } },
    { status: 500 }
  );
}
```

### Information Disclosure Prevention

| Original Error | Sanitized Response |
|---|---|
| `Database timeout on company_abc` | `Internal server error` |
| `Plaid API key invalid for tenant xyz` | `Integration unavailable` |
| `RBAC check failed: owner bypass denied` | `Forbidden` |
| `Approval workflow type=payment amount=5000` | `Approval required` |

---

## Error Logging

### Structured Logging

Every error is logged with:

```typescript
{
  level: "error" | "warn",
  error: {
    name: string;
    message: string;
    stack: string;
    code: string;
  },
  context: {
    companyId?: string;
    userId?: string;
    correlationId: string;
    requestId?: string;
    endpoint?: string;
    method?: string;
  },
  timestamp: string;
}
```

### Logging Rules

| Rule | Description |
|---|---|
| **Correlation ID** | Every error log includes the request correlation ID |
| **Tenant context** | Include `companyId` in all logs |
| **Stack trace** | Full stack for errors, truncated for warnings |
| **Sensitive data** | Never log passwords, tokens, MFA secrets, encryption keys |
| **Pino redaction** | `auth`, `cookie`, `password`, `secret` fields auto-redacted |
| **Error classification** | Log level determined by error severity |

---

## Error Metrics

### Metric Definitions

| Metric | Type | Labels | Description |
|---|---|---|---|
| `errors_total` | Counter | category, code, severity | Total errors by type |
| `errors_by_endpoint` | Counter | endpoint, method, code | Errors per endpoint |
| `errors_by_tenant` | Counter | company_id, code | Errors per tenant |
| `errors_rate` | Gauge | window | Error rate (errors/minute) |
| `errors_p95_latency` | Histogram | category | Error processing latency |
| `validation_errors_total` | Counter | field, rule | Validation failures |
| `security_errors_total` | Counter | type | Security-related errors |
| `integration_errors_total` | Counter | provider, code | Provider errors |
| `retry_total` | Counter | operation, attempt | Retry attempts |
| `circuit_breaker_trips_total` | Counter | circuit | Circuit breaker activations |

### Error Rate Alerting

| Alert | Threshold | Action |
|---|---|---|
| Error rate spike | > 5% for 5 min | Investigate |
| Security errors | Any occurrence | Immediate review |
| Integration errors | > 10% for 10 min | Check provider status |
| Validation errors spike | > 2x baseline | Check for attacks |
| Circuit breaker trip | Any occurrence | Check downstream health |

---

## Error Recovery

### Recovery Strategies

| Strategy | When to Use | Implementation |
|---|---|---|
| **Retry** | Transient infrastructure failure | Exponential backoff |
| **Fallback** | Degraded functionality acceptable | Cached/default response |
| **Circuit Breaker** | Persistent downstream failure | Stop calls, fail fast |
| **Graceful Degradation** | Non-critical feature failure | Continue without feature |
| **User Retry** | Invalid input or auth failure | Display error, let user retry |
| **Manual Intervention** | Critical system failure | Alert, page on-call |

### Retry Configuration

| Operation | Max Retries | Base Delay | Max Delay | Backoff |
|---|---|---|---|---|
| Database query | 2 | 1s | 4s | Exponential |
| External API call | 3 | 1s | 10s | Exponential |
| Queue job | 6 | 30s | 4hr | Exponential |
| Cache read | 1 | 500ms | 500ms | Linear |

### Circuit Breaker Configuration

| Circuit | Threshold | Recovery | Fallback |
|---|---|---|---|
| Database | 5 failures / 60s | 30s | Fail fast |
| External API | 3 failures / 60s | 60s | Cached response |
| Cache | 3 failures / 60s | 30s | Direct query |

---

## Error Boundaries (React)

### Error Boundary Strategy

| Level | Scope | Recovery |
|---|---|---|
| **Page boundary** | Full page crash | Show error page with retry |
| **Section boundary** | Section/component crash | Show section error, rest of page works |
| **Component boundary** | Individual component | Show fallback UI |

### Error Boundary Pattern

```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <PageContent />
</ErrorBoundary>
```

### Client Error Handling

| Error Type | Handling |
|---|---|
| Network error | Show offline banner, retry |
| 401 | Redirect to login |
| 403 | Show forbidden message |
| 404 | Show not found page |
| 500 | Show error page with retry |
| Timeout | Show timeout message with retry |

---

## Error Versioning

### Error Code Stability

| Rule | Description |
|---|---|
| **Error codes are stable** | Never change meaning of existing codes |
| **New codes are additive** | New error codes added without removing old |
| **Deprecated codes** | Marked with `deprecated: true` in docs |
| **Code format** | `CATEGORY_SPECIFIC_DETAIL` (e.g., `INVOICE_NOT_FOUND`) |

### Error Code Namespace

| Namespace | Domain |
|---|---|
| `AUTH_*` | Authentication |
| `AUTHZ_*` | Authorization |
| `VALIDATION_*` | Input validation |
| `PAYLOAD_*` | Request body |
| `INVOICE_*` | AP invoices |
| `PAYMENT_*` | Payments |
| `WORKFLOW_*` | Workflow engine |
| `CONNECTOR_*` | Integration connectors |
| `DATABASE_*` | Persistence |
| `CACHE_*` | Caching |
| `RATE_LIMITED` | Rate limiting |
| `INTERNAL` | Generic server error |

---

## Observability

### Error Dashboard

| Panel | Metrics |
|---|---|
| Error rate (real-time) | `errors_rate` per 5 min |
| Errors by category | `errors_total` grouped by category |
| Errors by endpoint | `errors_by_endpoint` top 20 |
| Security errors | `security_errors_total` |
| Integration errors | `errors_by_provider` |
| Error trend (24h) | `errors_total` per hour |

---

## Testing Strategy

| Test Type | Scope |
|---|---|
| Unit | Error class construction, code mapping |
| Integration | Error propagation through layers |
| Contract | API error response format |
| Chaos | Database failure, provider timeout |
| Security | Information disclosure prevention |
| Load | Error handling under high load |

---

## Failure Modes

| Failure | Impact | Mitigation |
|---|---|---|
| Unhandled error | 500 response, no context | `handleRouteError()` catch-all |
| Error logging failure | Lost diagnostics | Fallback to console.error |
| Circuit breaker stuck open | Permanent fallback | Auto-recovery after timeout |
| Error rate spike | User degradation | Alert + investigation |
| Sensitive data in error | Security breach | Sanitization + redaction |
| Infinite retry loop | Resource exhaustion | Max retry + backoff |

---

## Key Source Files

| File | Purpose |
|---|---|
| `src/server/http/handle-route.ts` | Unified API error handling |
| `src/lib/errors/app-error.ts` | Application error base class |
| `src/server/persistence/domain/persistence-errors.ts` | Persistence error hierarchy |
| `src/server/locks/lock-errors.ts` | Lock error hierarchy |
| `src/server/security/rate-limit.ts` | Rate limit error |
| `src/server/security/encryption.ts` | Encryption key error |
| `src/lib/logger.ts` | Structured logging |
| `src/server/ha/circuit-breaker.ts` | Circuit breaker implementation |

---

*The Error Architecture ensures that every failure in Perionyx is typed, correlated, logged, and recoverable. Silent failures are forbidden. Unexplained errors are bugs.*
