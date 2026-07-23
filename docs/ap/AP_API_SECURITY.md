# Phase 21A.3 — Accounts Payable API Security

> **Status**: Complete
> **Type**: Documentation-only — API security architecture and controls
> **Date**: July 22, 2026
> **Scope**: Security controls for all 65 AP endpoints
> **Depends on**: AP_API_ARCHITECTURE.md, SECURITY_REMEDIATION_PLAN.md, MFA_ARCHITECTURE.md
> **Governs**: Authentication, authorization, CSRF, rate limiting, input validation, tenant isolation

---

## 1. Security Overview

The AP API layer inherits the platform-wide security architecture and adds domain-specific controls for financial operations. Every request is authenticated, authorized, tenant-scoped, and audited. No endpoint is publicly accessible.

### Security Principles

1. **Secure by Default** — all access requires explicit permission; denied by default.
2. **Defense in Depth** — multiple independent security layers; no single point of failure.
3. **Least Privilege** — each role receives only the permissions required for its function.
4. **Audit Everything** — every security-relevant decision is logged with correlation ID.
5. **Fail Closed** — authentication and authorization failures deny access, never grant.

---

## 2. Authentication

### 2.1 Session JWT (Browser)

```http
Cookie: next-auth.session-token=eyJhbGciOiJIUzI1NiIs...
```

| Property | Value |
|---|---|
| Algorithm | HS256 (HMAC-SHA256) |
| Secret | `AUTH_SECRET` env variable |
| Expiry | 30 days (sliding) |
| HttpOnly | Yes |
| Secure | Yes (HTTPS only) |
| SameSite | Lax |
| Claims | `companyId`, `userId`, `roles[]`, `email`, `iat`, `exp` |

### 2.2 API Key (Integrations)

```http
Authorization: Bearer va_a1b2c3d4e5f6... (64 hex characters)
```

| Property | Value |
|---|---|
| Format | `va_` prefix + 64 hex characters |
| Regex | `/^va_[0-9a-f]{64}$/` |
| Storage | Hashed in database (SHA-256) |
| Scoping | Company-scoped; each key belongs to one company |
| Rotation | Manual via admin UI; no auto-expiry |
| Revocation | Immediate via database flag |

### 2.3 Token Resolution

Both methods resolve to the same `AuthContext`:

```typescript
interface AuthContext {
  companyId: string;
  userId: string;
  roles: string[];
  email: string;
  authMethod: "session" | "api_key";
}
```

### 2.4 Authentication Failure Modes

| Failure | Response | Logged |
|---|---|---|
| No token provided | 401 `UNAUTHORIZED` | Yes |
| Expired JWT | 401 `TOKEN_EXPIRED` | Yes |
| Invalid signature | 401 `UNAUTHORIZED` | Yes (warn) |
| API key not found | 401 `INVALID_API_KEY` | Yes |
| API key revoked | 401 `INVALID_API_KEY` | Yes |

### 2.5 MFA Requirements

MFA is required for high-risk financial mutations. The `mfaVerified` claim in the JWT must be present and not expired (15-minute window).

| Endpoint | MFA Required | Reason |
|---|---|---|
| POST `/vendors/{id}/bank-details` | ✓ | Bank detail changes enable payment diversion |
| POST `/invoices/{id}/approve` | ✓ | Financial commitment authorization |
| POST `/invoices/{id}/override` | ✓ | Match override bypasses controls |
| POST `/payments/proposals/{id}/approve` | ✓ | Payment authorization |
| POST `/payments/batches/{id}/execute` | ✓ | Irreversible payment execution |
| POST `/payments/batches/{id}/confirm` | ✓ | Confirms bank transfer completion |
| POST `/payments/batches/{id}/reverse` | ✓ | Reversal creates new financial entries |
| POST `/approvals/{id}/approve` | ✓ | Approval chain authorization |

---

## 3. Authorization

### 3.1 RBAC Permission Model

37 AP-specific permissions are registered in the IAM PermissionRegistry. Each endpoint requires exactly one permission.

```
Permission format: {domain}.{action}
Example: ap.vendors.create, ap.invoices.approve, ap.payments.execute_batch
```

### 3.2 Permission Enforcement

```
Route Handler
  │
  ▼
apAuth() → { companyId, userId, roles }
  │
  ▼
requirePermission("ap.invoices.approve", roles)
  │
  ├── Has permission → proceed
  └── Missing permission → 403 FORBIDDEN
```

### 3.3 OWNER Bypass

The `OWNER` role bypasses all permission checks. This is the emergency escape hatch for system administrators. Every OWNER bypass is logged as a security event.

### 3.4 Role Hierarchy

| Role | Inherits From | Authority |
|---|---|---|
| `system` | — | Unlimited |
| `treasury_manager` | — | $1,000,000 |
| `controller` | — | $500,000 |
| `ap_manager` | — | $100,000 |
| `procurement_manager` | — | $100,000 |
| `budget_owner` | — | $50,000 |
| `ap_clerk` | — | $1,000 |
| `auditor` | — | Read-only |

### 3.5 Segregation of Duties (12 Rules)

SoD rules are enforced in the application service layer, not in the route handler. This ensures they apply to both API calls and internal service invocations.

| # | Rule | Blocking Pattern |
|---|---|---|
| 1 | Invoice creator ≠ invoice approver | `createdBy !== userId` |
| 2 | Vendor creator ≠ vendor approver | `createdBy !== userId` |
| 3 | Proposal creator ≠ batch executor | `createdBy !== userId` |
| 4 | Delegator ≠ approvee | `delegatedBy !== userId` |
| 5 | Amount > $1K ≠ AP Clerk | authority check |
| 6 | Amount > $100K ≠ AP Manager | authority check |
| 7 | Amount > $500K ≠ Controller | dual signature required |
| 8 | Budget owner ≠ own PR approver | `budgetOwnerId !== userId` |
| 9 | Bank changer ≠ payment executor | `bankChangedBy !== batchExecutor` |
| 10 | Exception assignee ≠ resolver | `assignedTo !== resolvedBy` |
| 11 | Reconciliation importer ≠ adjuster | `importedBy !== adjustedBy` |
| 12 | Credit creator ≠ credit applier | `createdBy !== appliedBy` |

---

## 4. CSRF Protection

### Mechanism

```
Proxy:
  if (sessionAuth && !safeMethod) {
    validateOrigin(req);
    if (!origin) → 403 FORBIDDEN
    if (!allowlist.has(origin)) → 403 FORBIDDEN
  }
```

### Exemptions

| Condition | Reason |
|---|---|
| GET, HEAD, OPTIONS methods | Safe methods, no state change |
| API key authentication | External integrations don't have browser context |
| No session token present | CSRF only applies to session-based auth |

### Origin Validation

The `Origin` header must match the application's domain. Missing `Origin` header on session-authenticated mutations is rejected (prevents requests from non-browser HTTP clients without CORS).

---

## 5. Rate Limiting

### Tiered Limits

| Tier | Limit | Window | Applies To |
|---|---|---|---|
| General | 120 req/min | Sliding 60s | GET endpoints, dashboard, reports |
| Financial | 60 req/min | Sliding 60s | POST/PUT on invoices, payments, vendors, credits, approvals |
| Auth | 10 req/min | Sliding 60s | Login, MFA verification, token refresh |

### Implementation

- **Storage**: In-memory sliding window per IP address
- **Cleanup**: 60s periodic sweep, 100K max entries, 10% eviction on capacity
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Response**: 429 with `Retry-After` header

### Per-Endpoint Overrides

Some high-frequency endpoints may need adjusted limits. These are configured at the route level:

```
GET /api/v1/ap/dashboard     → General tier (120/min)
GET /api/v1/ap/reports/*     → General tier (120/min)
POST /api/v1/ap/vendors      → Financial tier (60/min)
POST /api/v1/ap/invoices     → Financial tier (60/min)
POST /api/v1/ap/payments/*   → Financial tier (60/min)
```

---

## 6. Body Size Limits

### Enforcement Points

| Layer | Limit | Action |
|---|---|---|
| Proxy (`Content-Length` check) | 1 MB default | 413 `PAYLOAD_TOO_LARGE` |
| Proxy (hard cap) | 10 MB | 413 `PAYLOAD_TOO_LARGE` before parsing |
| Route handler (`request.json()`) | 1 MB | Caught by try/catch |

### File Upload Endpoints

| Endpoint | Limit | Content-Type |
|---|---|---|
| POST `/reconciliations` | 10 MB | `multipart/form-data` |

---

## 7. Input Validation

### Zod Schema Validation

Every endpoint validates request input against a Zod schema before processing.

```
Request → request.json() → Zod.parse() → Service Layer
                      ↓
              400 INVALID_INPUT (Zod error tree)
```

### Validation Scope

| Input Type | Validated |
|---|---|
| Request body | Required fields, types, formats, ranges |
| Path parameters | UUID format, existence |
| Query parameters | Pagination bounds, sort field whitelist, filter enum values |
| Headers | `Idempotency-Key` UUID format, `Content-Type` |

### Common Validation Rules

| Rule | Pattern | Applies To |
|---|---|---|
| UUID format | `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i` | All IDs |
| Date format | ISO 8601 string | All date fields |
| Currency code | ISO 4217 (3 uppercase letters) | `currency` fields |
| Email format | Standard email regex | `email` fields |
| Amount range | `≥ 0` for amounts, `> 0` for quantities | Financial fields |
| String length | Min/max per field | Names, reasons, notes |

### Error Response Format

Zod errors are reformatted into the enterprise error contract:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request body validation failed",
    "category": "validation",
    "correlationId": "...",
    "recoverable": true,
    "userMessage": "Please fix the following: Invoice number is required, Due date must be after invoice date.",
    "details": [
      { "field": "invoiceNumber", "message": "Required" },
      { "field": "dueDate", "message": "Must be after invoiceDate" }
    ]
  }
}
```

---

## 8. Tenant Isolation

### JWT-Based scoping

The `companyId` claim in the JWT is the authoritative tenant identifier. It is extracted by `apAuth()` and injected into every service call.

```
JWT: { companyId: "cmp_abc123", ... }
        │
        ▼
apAuth(): { companyId: "cmp_abc123" }
        │
        ▼
Service: { ...input, companyId: "cmp_abc123" }
        │
        ▼
Repository: WHERE companyId = 'cmp_abc123'
```

### Attack Vectors Blocked

| Vector | Defense |
|---|---|
| `companyId` in request body | Ignored; JWT value is authoritative |
| ID of another tenant's entity | Repository `WHERE companyId = ?` returns empty → 404 |
| Cross-tenant query manipulation | No raw SQL; Prisma parameterized queries only |
| IDOR via UUID guess | UUIDs are cryptographically random (v4) |

### Repository-Level Enforcement

Every repository method includes `companyId` in its query:

```typescript
async findById(companyId: string, id: string): Promise<Vendor | null> {
  return this.prisma.procurementVendor.findFirst({
    where: { id, companyId },
  });
}
```

---

## 9. Error Sanitization

### Internal Error Handling

| Error Type | User Response | Logged |
|---|---|---|
| Database connection failure | `INTERNAL_ERROR` with correlation ID | Full error + stack |
| Prisma unique constraint | `DUPLICATE_*` with entity code | Constraint details |
| Unhandled exception | `INTERNAL_ERROR` with correlation ID | Full error + stack |
| Type error / undefined | `INTERNAL_ERROR` with correlation ID | Full error + stack |
| Zod parse failure | `VALIDATION_ERROR` with field details | Zod error tree |

### Sanitization Rules

1. **No database details** — error messages never contain table names, column names, or SQL
2. **No stack traces** — stack traces are logged server-side only, never in responses
3. **No internal paths** — file system paths are never exposed
4. **No dependency versions** — package versions are not included in error responses
5. **Generic fallback** — any unexpected error returns `INTERNAL_ERROR` with correlation ID

### Structured Error Logging

Internal errors are logged with full context:

```json
{
  "level": "error",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "error": {
    "name": "PrismaClientKnownRequestError",
    "code": "P2002",
    "message": "Unique constraint failed on the fields: (`companyId`, `invoiceNumber`)",
    "stack": "..."
  },
  "companyId": "cmp_abc123",
  "userId": "usr_xyz789",
  "path": "/api/v1/ap/invoices"
}
```

---

## 10. Correlation IDs

### Propagation Chain

```
Client (optional) → Proxy (generated) → Route Handler → Service → Repository
                                                      → Domain Events
                                                      → Audit Record
                                                      → Error Response
                                                      → Structured Log
```

### Purpose

1. **Distributed tracing** — follow a request through all layers
2. **Audit trail linkage** — connect API request to audit record to domain event
3. **Error diagnosis** — support team can trace errors by correlation ID
4. **Security forensics** — reconstruct attack sequence from correlated logs

### Format

UUID v4: `550e8400-e29b-41d4-a716-446655440000`

---

## 11. Idempotency (Security Perspective)

### Duplicate Prevention

Financial mutations are vulnerable to accidental duplication (network retry, double-click, client bug). The idempotency layer prevents duplicate state changes.

```
POST /api/v1/ap/invoices/{id}/approve
  Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

### Security Properties

| Property | Value |
|---|---|
| Key scope | Per-company (different companies can use same key) |
| TTL | 24 hours |
| Storage | In-memory (process-scoped) |
| Replay detection | `x-idempotent-replay: true` header |
| Failure mode | After restart, worst case is duplicate (mitigated by DB constraints) |

### Threat Model

| Threat | Mitigation |
|---|---|
| Accidental double-submit | Idempotency-Key deduplication |
| Malicious replay attack | 24h TTL limits window; SoD rules prevent self-approval |
| Idempotency store poisoning | In-memory only; no persistence; TTL expiry |

---

## 12. Security Headers

### Proxy-Level Headers

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-XSS-Protection` | `0` | Disable XSS auditor (use CSP instead) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disable unused APIs |

### Content Security Policy

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self';
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

---

## 13. Dependency Security

### Automated Scanning

| Tool | Scope | CI Integration |
|---|---|---|
| `pnpm audit` | Direct + transitive dependencies | CI `security` job |
| `pnpm audit --audit-level=high` | High/critical vulnerabilities | CI fails on high severity |
| GitHub Dependabot | Dependency version updates | Automated PRs |

### Policy

- **High/Critical**: CI fails; must resolve before merge
- **Moderate**: CI warns; must resolve within 2 weeks
- **Low/Info**: Tracked; resolved in next maintenance window

---

## 14. Security Audit Trail

### What Is Logged

| Event | Logged | Correlation ID |
|---|---|---|
| Successful authentication | ✓ | ✓ |
| Failed authentication | ✓ | ✓ |
| Permission denied | ✓ | ✓ |
| SoD violation | ✓ | ✓ |
| MFA challenge | ✓ | ✓ |
| Rate limit exceeded | ✓ | ✓ |
| CSRF rejection | ✓ | ✓ |
| Input validation failure | ✓ | ✓ |
| Entity access (read) | Optional | ✓ |
| Entity mutation (write) | ✓ | ✓ |
| Idempotency replay | ✓ | ✓ |
| OWNER bypass used | ✓ | ✓ |

### Log Retention

| Log Type | Retention |
|---|---|
| Access logs (structured) | 90 days |
| Security events | 1 year |
| Audit records (DB) | Permanent (append-only) |

---

## 15. Security Control Matrix

| Control | Layer | Enforced | Audit |
|---|---|---|---|
| JWT validation | Proxy | ✓ | ✓ |
| API key validation | Proxy | ✓ | ✓ |
| CSRF origin check | Proxy | ✓ | ✓ |
| Rate limiting | Proxy | ✓ | ✓ |
| Body size limits | Proxy | ✓ | — |
| Zod input validation | Route handler | ✓ | ✓ |
| RBAC permission check | Route handler | ✓ | ✓ |
| SoD enforcement | Application service | ✓ | ✓ |
| MFA verification | Route handler | ✓ | ✓ |
| Tenant isolation | Repository | ✓ | ✓ |
| Optimistic locking | Repository | ✓ | ✓ |
| Idempotency | Idempotency store | ✓ | ✓ |
| Error sanitization | Error handler | ✓ | ✓ |
| Audit trail | Application service | ✓ | ✓ |
| Security headers | Proxy | ✓ | — |

---

*Document generated as part of Phase 21A.3 — AP Enterprise API Layer.*
