# Phase 21A.3 — Accounts Payable API Architecture

> **Status**: Complete
> **Type**: Documentation-only — REST API architecture specification
> **Date**: July 22, 2026
> **Scope**: 65 REST endpoints under `/api/v1/ap/`, covering 7 aggregates, 18 query endpoints
> **Depends on**: AP_COMMAND_QUERY_MODEL.md, AP_PERMISSION_MATRIX.md, AP_APPLICATION_SERVICES.md
> **Predecessor**: Phase 21A.2 (Application Layer)

---

## 1. Overview

The Accounts Payable API layer exposes 65 RESTful endpoints under the `/api/v1/ap/` namespace, providing full CRUD and workflow operations across 7 domain aggregates plus a dashboard and 8 report endpoints. Every endpoint maps to one or more commands/queries defined in AP_COMMAND_QUERY_MODEL.md and enforces permissions from AP_PERMISSION_MATRIX.md.

### Endpoint Summary

| Aggregate | Endpoints | Commands | Queries |
|---|---|---|---|
| Vendor | 10 | 8 | 2 |
| Invoice | 15 | 15 | 0 |
| Approval | 6 | 5 | 1 |
| Payment | 10 | 9 | 1 |
| Exception | 5 | 4 | 1 |
| Reconciliation | 5 | 4 | 1 |
| Credit | 4 | 3 | 1 |
| Reports | 8 | 0 | 8 |
| Dashboard | 1 | 0 | 1 |
| **Total** | **65** | **48** | **16** |

### Design Principles

1. **CQRS at the wire** — Commands (POST/PUT) go through application services; queries (GET) go through repository layer directly.
2. **Uniform resource naming** — nouns for resources, verbs only for workflow actions (`/approve`, `/reject`, `/escalate`).
3. **Idempotency by default** — all financial mutations accept `Idempotency-Key` header for safe replay.
4. **Tenant-scoped** — every request carries `companyId` from JWT; no cross-tenant access possible.
5. **Audit-trail first** — every mutation writes an audit record atomically within the same transaction.

---

## 2. Versioning Strategy

### URI-Based Versioning

All AP endpoints are prefixed with `/api/v1/ap/`. The version is embedded in the URL path, not in headers or query parameters.

```
/api/v1/ap/vendors
/api/v1/ap/invoices/{invoiceId}
/api/v1/ap/payments/proposals/{proposalId}/approve
```

### Version Lifecycle

| Version | Status | Deprecation Policy |
|---|---|---|
| `/api/v1/` | Active | Supported until 2 major versions after v3 ships |
| `/api/v2/` | Future | Breaking changes only (field renames, response structure) |

### What Constitutes a Breaking Change

- Removing or renaming a response field
- Changing the type of a response field (e.g., `string` → `number`)
- Removing an endpoint
- Changing the authentication scheme
- Changing error contract structure

### Non-Breaking Changes (No Version Bump)

- Adding new optional request fields
- Adding new response fields
- Adding new endpoints
- Adding new enum values
- Tightening validation (fewer accepted inputs)

---

## 3. Request Lifecycle

Every API request passes through a deterministic pipeline. The order is mandatory and non-negotiable.

```
Client Request
  │
  ▼
┌─────────────────────────────┐
│ 1. Proxy (src/proxy.ts)    │  ← Edge middleware (Next.js 16)
│    ├─ Correlation ID        │  ← x-correlation-id (generate if missing)
│    ├─ Request Timing        │  ← X-Request-Start header
│    ├─ Locale Detection      │  ← NEXT_LOCALE cookie / Accept-Language
│    ├─ Rate Limiting         │  ← per-IP, tiered (120/60/10 rps)
│    ├─ CSRF Validation       │  ← Origin header check for session auth
│    └─ Auth Token Extract    │  ← JWT session token or API key (va_ prefix)
└─────────────────────────────┘
  │
  ▼
┌─────────────────────────────┐
│ 2. Route Handler            │  ← Next.js route.ts
│    ├─ Parse Request Body    │  ← request.json() with 1MB limit
│    ├─ Zod Schema Validation │  ← Reject 400 on parse failure
│    └─ apAuth()              │  ← Resolve companyId + userId from JWT
└─────────────────────────────┘
  │
  ▼
┌─────────────────────────────┐
│ 3. Permission Check         │  ← requirePermission(permission, roles)
│    ├─ RBAC Check            │  ← User role in allowed roles?
│    ├─ SoD Check             │  ← Segregation of duties (12 rules)
│    └─ Threshold Check       │  ← Authority level for amount?
└─────────────────────────────┘
  │
  ▼
┌─────────────────────────────┐
│ 4. Idempotency Check        │  ← For mutations only
│    ├─ Key: companyId +      │
│    │   Idempotency-Key hdr  │
│    ├─ TTL: 24 hours         │
│    └─ Hit → return cached   │
└─────────────────────────────┘
  │
  ▼
┌─────────────────────────────┐
│ 5. Application Service      │  ← Command execution
│    ├─ Build CommandContext   │  ← companyId, userId, roles, timestamp
│    ├─ Execute Command       │  ← Business rules, state machine
│    ├─ Prisma Transaction    │  ← Atomic persistence
│    ├─ Domain Events         │  ← Post-commit dispatch
│    └─ Audit Record          │  ← Same transaction
└─────────────────────────────┘
  │
  ▼
┌─────────────────────────────┐
│ 6. Response                 │  ← Uniform response envelope
│    ├─ { data: T }           │  ← Single entity
│    ├─ { data: T[],          │  ← List with pagination
│    │     pagination: {} }   │
│    ├─ x-correlation-id      │  ← Propagated from step 1
│    ├─ Cache-Control         │  ← GET: private, max-age=30
│    └─ x-idempotent-replay   │  ← true if idempotency hit
└─────────────────────────────┘
```

---

## 4. Middleware Stack

### 4.1 Correlation ID

Every request receives a correlation ID, used for distributed tracing and audit trail linkage.

```
Generation: crypto.randomUUID() (if client doesn't provide x-correlation-id)
Header:     x-correlation-id (request + response)
Propagated: Through all service calls, Prisma query context, domain events
Storage:    Included in every audit record and error response
```

### 4.2 Request Timing

```
Header:     X-Request-Start (client → server)
Computed:   Date.now() - X-Request-Start at response time
Output:     X-Request-Duration header on response
Logged:     request.duration in structured logger
Threshold:  >5000ms triggers slow-request warning
```

### 4.3 CSRF Protection

Applies to session-authenticated requests only. API key requests bypass CSRF.

```
Check:      validateOrigin(req, !!sessionToken)
Reject:     403 Forbidden if Origin header missing or not in allowlist
Exempt:     GET, HEAD, OPTIONS (safe methods)
Exempt:     API key authentication (va_ prefix)
```

### 4.4 Rate Limiting

Per-IP, in-memory sliding window with periodic cleanup.

| Tier | Limit | Applies To |
|---|---|---|
| General | 120 requests/min | GET endpoints, dashboard |
| Financial | 60 requests/min | POST/PUT on invoices, payments, vendors |
| Auth | 10 requests/min | Login, MFA, token refresh |

```
Headers:    X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
Response:   429 Too Many Requests with Retry-After header
Cleanup:    60s periodic sweep, 100K max entries, 10% eviction on capacity
```

### 4.5 Session Validation

```
Token:      JWT session cookie (HttpOnly, Secure, SameSite=Lax)
Validation: next-auth jwt decode + signature verify
Store:      sessionValidationStore (30s cache on DB failure)
Attach:     { companyId, userId, roles, email } → request context
```

---

## 5. Error Model

All AP endpoints return a consistent enterprise error contract. No endpoint returns raw error messages, stack traces, or database details.

### Error Response Structure

```typescript
interface ApiError {
  code: string;           // Machine-readable: "DUPLICATE_INVOICE", "VENDOR_NOT_FOUND"
  message: string;        // Internal description (logged, not user-facing)
  category: ErrorCategory;
  correlationId: string;  // x-correlation-id from request
  recoverable: boolean;   // Can the user retry?
  userMessage: string;    // Human-readable, shown in UI toast
}

type ErrorCategory =
  | "validation"      // 400 — malformed input, Zod failures
  | "authentication"  // 401 — missing/invalid credentials
  | "authorization"   // 403 — insufficient permissions, SoD violation
  | "not_found"       // 404 — entity doesn't exist
  | "conflict"        // 409 — duplicate, constraint violation
  | "business_rule"   // 422 — state machine violation, invariant failure
  | "rate_limit"      // 429 — too many requests
  | "internal"        // 500 — unexpected server error (sanitized)
```

### HTTP Status Code Mapping

| Status | Category | Examples |
|---|---|---|
| 400 | validation | `INVALID_INPUT`, `MISSING_REQUIRED_FIELD`, `INVALID_DATE_RANGE` |
| 401 | authentication | `UNAUTHORIZED`, `TOKEN_EXPIRED`, `INVALID_API_KEY` |
| 403 | authorization | `FORBIDDEN`, `SOD_VIOLATION`, `INSUFFICIENT_AUTHORITY` |
| 404 | not_found | `VENDOR_NOT_FOUND`, `INVOICE_NOT_FOUND`, `PAYMENT_NOT_FOUND` |
| 409 | conflict | `DUPLICATE_INVOICE`, `DUPLICATE_VENDOR`, `VERSION_CONFLICT` |
| 413 | validation | `PAYLOAD_TOO_LARGE` (body > 1MB) |
| 422 | business_rule | `VENDOR_NOT_ACTIVE`, `INVOICE_NOT_EDITABLE`, `STATE_MACHINE_VIOLATION` |
| 429 | rate_limit | `TOO_MANY_REQUESTS` |
| 500 | internal | `INTERNAL_ERROR` (message sanitized, no stack) |

### Error Sanitization Rules

1. **Database errors** → generic `INTERNAL_ERROR` with correlation ID
2. **Prisma unique constraint** → `CONFLICT` with entity-specific code
3. **Type errors** → generic `INTERNAL_ERROR` (never expose TypeScript internals)
4. **Unhandled exceptions** → `INTERNAL_ERROR` with sanitized message, full stack logged
5. **Validation errors** → Zod error tree reformatted to human-readable `userMessage`

---

## 6. Idempotency

Financial mutations must be safe to retry. The idempotency layer prevents duplicate state changes.

### Mechanism

```
Header:     Idempotency-Key: <uuid> (client-generated)
Key:        SHA-256(companyId + Idempotency-Key)
Store:      In-memory Map with 24h TTL
Scope:      Per-company, per-key
```

### Behavior

| Scenario | Response |
|---|---|
| First request with key | Execute command, store result, return 200/201 |
| Replay within 24h (same key, same company) | Return cached result, `x-idempotent-replay: true` |
| Replay after 24h | Execute as new request (key expired) |
| Different company, same key | Execute as new request (key is company-scoped) |
| No key header | Execute normally (no deduplication) |

### Idempotent Commands (Mandatory)

| Command | Why |
|---|---|
| All payment commands | Prevent duplicate payments |
| ApproveInvoice / RejectInvoice | Prevent duplicate approval decisions |
| VoidInvoice | Prevent duplicate voiding |
| ResolveException | Prevent duplicate resolution |
| ApplyCredit | Prevent duplicate credit application |

### Non-Idempotent Commands

| Command | Why |
|---|---|
| CreateVendor / ReceiveInvoice | Creation commands — duplicate detection via unique constraint instead |
| ImportReconciliation | Import is inherently non-idempotent (file upload) |

### Limitations

- **Single-process only**: In-memory store doesn't survive restarts. After restart, the worst case is a duplicate execution (mitigated by database unique constraints).
- **Redis upgrade path**: The `IdempotencyStore` interface is swappable. A Redis-backed implementation would provide distributed idempotency for multi-process deployments.

---

## 7. Authorization Model

### 7.1 RBAC Permission System

37 AP-specific permissions are registered in the IAM PermissionRegistry, following the `{domain}.{action}` naming convention.

| Domain | Permissions | Count |
|---|---|---|
| `ap.vendors.*` | create, update, approve, reject, suspend, reactivate, deactivate, update_bank | 8 |
| `ap.invoices.*` | create, update, delete, validate, approve, reject, escalate, schedule_payment, block, unblock, dispute, dispute_resolve, void | 13 |
| `ap.match.*` | execute, override | 2 |
| `ap.exceptions.*` | create, assign, resolve, escalate, auto_resolve, bulk_resolve | 6 |
| `ap.approvals.*` | view, approve, reject, delegate, escalate, recall | 6 |
| `ap.payments.*` | create_proposal, approve_proposal, reject_proposal, review_proposal, create_batch, execute_batch, confirm_batch, reverse_batch, cancel_batch | 9 |
| `ap.reconciliation.*` | import, run, adjust, complete | 4 |
| `ap.credits.*` | create, apply, void | 3 |
| `ap.reports.*` | aging, payment_calendar, duplicates, audit_trail, outstanding, cash_requirements, analytics, discount_available | 8 |
| `ap.dashboard.*` | view | 1 |

### 7.2 Role-Permission Mapping

| Role | Max Authority | Permissions |
|---|---|---|
| `ap_clerk` | $1,000 | invoices.create, invoices.update, match.execute, exceptions.create, credits.create |
| `ap_manager` | $100,000 | All clerk + vendors.*, invoices.approve/reject, approvals.*, payments.create_proposal, reports.* |
| `controller` | $500,000 | All manager + invoices.void, invoices.delete, exceptions.resolve, payments.execute_batch |
| `treasury_manager` | $1,000,000 | payments.*, reconciliation.*, invoices.approve (>$100K) |
| `procurement_manager` | $100,000 | vendors.*, reports.* |
| `auditor` | Read-only | reports.*, dashboard.view (read-only on all entities) |
| `budget_owner` | $50,000 | invoices.create (within budget), reports.view |
| `system` | Unlimited | All commands (automated: auto-match, auto-escalate, auto-resolve) |

### 7.3 Segregation of Duties (12 Rules)

| # | Rule | Enforcement Point |
|---|---|---|
| 1 | Invoice creator cannot approve same invoice | ApproveInvoice |
| 2 | Vendor creator cannot approve same vendor | ApproveVendor |
| 3 | Payment proposal creator cannot execute same batch | ExecutePaymentBatch |
| 4 | Approval delegator cannot approve the delegated chain | ApproveApprovalChain |
| 5 | AP Clerk cannot approve invoices > $1,000 | ApproveInvoice (threshold) |
| 6 | AP Manager cannot approve invoices > $100,000 | ApproveInvoice (threshold) |
| 7 | Controller cannot approve payments > $500,000 | ExecutePaymentBatch (threshold) |
| 8 | Budget owner cannot approve own purchase requests | ApprovePurchaseRequest |
| 9 | Vendor bank detail changer cannot approve payment to same vendor | ExecutePaymentBatch |
| 10 | Exception resolver cannot be same as exception assignee | ResolveException |
| 11 | Reconciliation adjuster cannot be same as importer | AdjustReconciliation |
| 12 | Credit applicant cannot be same as credit creator | ApplyCredit |

### 7.4 Threshold Authority

| Amount Range | Minimum Approval Level |
|---|---|
| ≤ $1,000 | AP Clerk |
| $1,001 – $10,000 | AP Manager |
| $10,001 – $100,000 | Controller |
| $100,001 – $500,000 | Treasury Manager |
| > $500,000 | Controller + Treasury Manager (dual signature) |

---

## 8. Tenant Isolation

### Mechanism

Every API request carries a `companyId` derived from the authenticated user's JWT token. This `companyId` is injected into every service call, repository query, and audit record.

```
JWT payload: { companyId: "cmp_abc123", userId: "usr_xyz789", roles: ["ap_manager"] }
                    │
                    ▼
apAuth(req): { companyId: "cmp_abc123", userId: "usr_xyz789" }
                    │
                    ▼
Service call: invoiceService.create({ ...input, companyId: "cmp_abc123" })
                    │
                    ▼
Repository: WHERE companyId = 'cmp_abc123' AND ...
```

### Enforcement Points

| Layer | How |
|---|---|
| Route handler | `companyId` extracted via `apAuth()`, never from request body |
| Application service | `companyId` required in every `CommandContext` |
| Repository query | `companyId` in every `WHERE` clause (Prisma `companyId` field) |
| Audit record | `companyId` in every `ProcurementAPAuditRecord` |

### Cross-Tenant Attacks Blocked

1. **URL manipulation** — `/api/v1/ap/invoices/other-company-invoice-id` → 404 (not found in tenant scope)
2. **Body injection** — `companyId` in request body is ignored; JWT value is authoritative
3. **Query parameter** — no `companyId` query parameter accepted; always from JWT
4. **Repository bypass** — all repositories are company-scoped; no raw `$queryRawUnsafe` with unscoped queries

---

## 9. Audit Trail

Every mutation generates an audit record atomically within the same database transaction as the state change. If the transaction rolls back, the audit record rolls back with it.

### Audit Record Structure

```typescript
interface APAuditRecord {
  id: string;                // Generated UUID
  companyId: string;         // Tenant scope
  entityType: string;        // "ProcurementVendor" | "ProcurementInvoice" | ...
  entityId: string;          // ID of the affected entity
  action: string;            // "vendor.created" | "invoice.approved" | ...
  performedBy: string;       // userId from JWT
  timestamp: Date;           // Transaction timestamp
  changes?: Record<string, { before: unknown; after: unknown }>;
  metadata?: Record<string, unknown>; // Contextual data (amount, reason, etc.)
  correlationId: string;     // x-correlation-id from request
}
```

### Mutation Coverage

| Aggregate | Mutations | Audit |
|---|---|---|
| Vendor | 8 | 8/8 |
| Invoice | 15 | 15/15 |
| Approval | 5 | 5/5 |
| Payment | 9 | 9/9 |
| Exception | 4 | 4/4 |
| Reconciliation | 4 | 4/4 |
| Credit | 3 | 3/3 |
| **Total** | **48** | **48/48** |

### Audit Immutability

- Records are append-only — no UPDATE or DELETE is permitted on `ProcurementAPAuditRecord`
- The application layer does not expose any endpoint to modify audit records
- Database constraints enforce immutability (no Prisma update/delete methods exposed)
- The `Auditor` role has read-only access to the full audit trail

---

## 10. Correlation & Observability

### Correlation ID Propagation

```
Client: x-correlation-id: <optional-uuid>
  │
  ▼
Proxy: x-correlation-id: <generated-if-missing>
  │
  ├──► Response header: x-correlation-id
  ├──► Structured log: { correlationId: "..." }
  ├──► Application service: CommandContext.correlationId
  ├──► Domain events: event.metadata.correlationId
  ├──► Audit record: auditRecord.correlationId
  └──► Error responses: error.correlationId
```

### Structured Logging

Every request generates a structured log entry:

```json
{
  "level": "info",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "POST",
  "path": "/api/v1/ap/invoices",
  "companyId": "cmp_abc123",
  "userId": "usr_xyz789",
  "statusCode": 201,
  "duration": 142,
  "idempotentReplay": false
}
```

### Slow Request Alerting

| Threshold | Action |
|---|---|
| > 1s | Warning in structured log |
| > 5s | Error in structured log, metric increment |
| > 30s | Alert to operations, metric increment |

---

## 11. Concurrency Control

### Optimistic Locking

Aggregate roots use a `version` field for optimistic concurrency control:

```
ProcurementVendor:           version Int @default(0)
ProcurementInvoice:          version Int @default(0)
ProcurementMatch:            version Int @default(0)
ProcurementException:        version Int @default(0)
ProcurementApprovalChain:    version Int @default(0)
ProcurementPaymentProposal:  version Int @default(0)
ProcurementPaymentBatch:     version Int @default(0)
ProcurementPayment:          version Int @default(0)
ProcurementCreditNote:       version Int @default(0)
ProcurementReconciliation:   version Int @default(0)
```

### Mechanism

```
1. Read entity → note version (e.g., version=5)
2. Execute command → WHERE id = ? AND version = 5
3. If affected rows = 0 → 409 VERSION_CONFLICT
4. If affected rows = 1 → increment version to 6
```

### Client Handling

The client must handle `409 VERSION_CONFLICT` by re-fetching the entity and re-applying the change on the fresh version. This prevents lost updates in concurrent editing scenarios.

---

## 12. Pagination

### Offset-Based Pagination

All list endpoints use consistent offset-based pagination:

```
GET /api/v1/ap/vendors?page=1&limit=25&sort=name&order=asc
GET /api/v1/ap/invoices?status=received&page=2&limit=50
```

### Query Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | 1 | Page number (1-indexed) |
| `limit` | integer | 25 | Items per page (max: 200) |
| `sort` | string | created_at | Sort field |
| `order` | string | desc | Sort direction: `asc` or `desc` |

### Response Pagination Object

```json
{
  "data": [...],
  "pagination": {
    "total": 342,
    "page": 1,
    "limit": 25,
    "totalPages": 14
  }
}
```

### Consistency Rules

- All list endpoints return the same pagination structure
- `total` reflects filtered count (after WHERE clause, before LIMIT)
- Sorting is deterministic (secondary sort by `id` to break ties)
- Max `limit` is 200; values above 200 are capped to 200
- `page` below 1 is treated as 1

### Future: Cursor-Based Pagination

Cursor-based pagination is not implemented in Phase 21A.3 but the pagination interface is designed to support it:

```typescript
interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  // Future: cursor?: string; hasMore?: boolean;
}
```

---

## 13. Response Format

### Single Entity

```json
{
  "data": {
    "id": "ven_abc123",
    "name": "Acme Corp",
    "status": "active",
    "taxId": "12-3456789",
    "createdAt": "2026-07-22T10:30:00.000Z"
  }
}
```

### List of Entities

```json
{
  "data": [
    { "id": "ven_abc123", "name": "Acme Corp", "status": "active" },
    { "id": "ven_def456", "name": "Beta Inc", "status": "pending_review" }
  ],
  "pagination": {
    "total": 47,
    "page": 1,
    "limit": 25,
    "totalPages": 2
  }
}
```

### Command Result (Action Endpoint)

```json
{
  "data": {
    "id": "inv_xyz789",
    "status": "validated",
    "matchedAt": "2026-07-22T11:00:00.000Z"
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "DUPLICATE_INVOICE",
    "message": "Invoice number INV-2026-001 already exists for this vendor",
    "category": "conflict",
    "correlationId": "550e8400-e29b-41d4-a716-446655440000",
    "recoverable": false,
    "userMessage": "An invoice with number INV-2026-001 already exists for this vendor. Please check the invoice number and try again."
  }
}
```

### Header Standards

| Header | Direction | Description |
|---|---|---|
| `x-correlation-id` | Request → Response | Traced through entire pipeline |
| `x-idempotent-replay` | Response only | `true` if idempotency cache hit |
| `X-RateLimit-Limit` | Response | Max requests in window |
| `X-RateLimit-Remaining` | Response | Requests remaining |
| `X-RateLimit-Reset` | Response | Unix timestamp when window resets |
| `Retry-After` | Response (429) | Seconds until rate limit resets |
| `Cache-Control` | Response (GET) | `private, max-age=30` |

---

## 14. Authentication

### Dual Authentication

| Method | Header | Use Case |
|---|---|---|
| Session JWT | `Cookie: next-auth.session-token=...` | Web UI (browser) |
| API Key | `Authorization: Bearer va_...` | External integrations, CI/CD, scripts |

### API Key Format

```
va_ + 64 hexadecimal characters
Example: va_a1b2c3d4e5f6... (64 hex chars total)
```

### Token Resolution

Both methods resolve to the same `AuthContext`:

```typescript
interface AuthContext {
  companyId: string;   // Tenant scope
  userId: string;       // User identifier
  roles: string[];      // Role IDs (e.g., ["ap_manager", "controller"])
  email: string;        // User email
  authMethod: "session" | "api_key";
}
```

---

## 15. Request Body Constraints

### Size Limits

| Limit | Value | Enforcement |
|---|---|---|
| Default body size | 1 MB | Proxy checks `Content-Length` header |
| Hard cap | 10 MB | Proxy rejects with 413 before parsing |
| File uploads (reconciliation import) | 10 MB | Separate limit for multipart |

### Content-Type

All AP endpoints require `Content-Type: application/json` for request bodies. GET endpoints have no body.

---

## 16. Caching Strategy

### GET Endpoints

| Endpoint Family | Cache-Control | Rationale |
|---|---|---|
| `/reports/*` | `private, max-age=60` | Reports can be slightly stale |
| `/dashboard` | `private, max-age=15` | Dashboard needs freshness |
| `/vendors/*` (read) | `private, max-age=30` | Vendor data changes infrequently |
| `/invoices/*` (read) | `private, max-age=30` | Invoice data moderate change rate |

### Mutation Endpoints

No caching headers on POST/PUT responses.

### CDN Compatibility

All cache directives use `private` (never `public`) because AP data is company-scoped. CDN caching is not applicable for tenant-scoped data.

---

## 17. API Surface Summary

```
/api/v1/ap/
├── vendors/                           (10 endpoints)
│   ├── GET /                              List vendors
│   ├── POST /                             Create vendor
│   └── [vendorId]/
│       ├── GET /                          Get vendor
│       ├── PUT /                          Update vendor
│       ├── POST /approve                  Approve vendor
│       ├── POST /reject                   Reject vendor
│       ├── POST /suspend                  Suspend vendor
│       ├── POST /reactivate               Reactivate vendor
│       ├── POST /deactivate               Deactivate vendor
│       └── PUT /bank-details              Update bank details
│
├── invoices/                          (15 endpoints)
│   ├── GET /                              List invoices
│   ├── POST /                             Receive invoice
│   └── [invoiceId]/
│       ├── GET /                          Get invoice
│       ├── PUT /                          Update invoice
│       ├── POST /validate                 Validate
│       ├── POST /match                    Run 3-way match
│       ├── POST /approve                  Approve
│       ├── POST /reject                   Reject
│       ├── POST /escalate                 Escalate
│       ├── POST /schedule-payment         Schedule payment
│       ├── POST /block                    Block
│       ├── POST /unblock                  Unblock
│       ├── POST /dispute                  Dispute
│       ├── POST /resolve-dispute          Resolve dispute
│       ├── POST /override                 Override match
│       └── POST /void                     Void
│
├── approvals/                         (6 endpoints)
│   ├── GET /                              List pending approvals
│   └── [approvalChainId]/
│       ├── GET /                          Get approval detail
│       ├── POST /approve                  Approve chain
│       ├── POST /reject                   Reject chain
│       ├── POST /delegate                 Delegate
│       ├── POST /escalate                 Escalate
│       └── POST /recall                   Recall delegation
│
├── payments/                          (10 endpoints)
│   ├── proposals/
│   │   ├── GET /                          List proposals
│   │   └── [proposalId]/
│   │       ├── GET /                      Get proposal
│   │       ├── POST /review               Review
│   │       ├── POST /approve              Approve
│   │       └── POST /reject               Reject
│   └── batches/
│       ├── GET /                          List batches
│       └── [batchId]/
│           ├── GET /                      Get batch
│           ├── POST /execute              Execute
│           ├── POST /confirm              Confirm
│           ├── POST /reverse              Reverse
│           └── POST /cancel               Cancel
│
├── exceptions/                        (5 endpoints)
│   ├── GET /                              List exceptions
│   └── [exceptionId]/
│       ├── GET /                          Get exception
│       ├── PUT /                          Assign
│       ├── POST /escalate                 Escalate
│       └── POST /resolve                  Resolve
│
├── reconciliations/                   (5 endpoints)
│   ├── GET /                              List reconciliations
│   ├── POST /                             Import statement
│   └── [reconciliationId]/
│       ├── GET /                          Get reconciliation
│       ├── POST /run                      Run matching
│       ├── POST /adjust                   Adjust
│       └── POST /complete                 Complete
│
├── credits/                           (4 endpoints)
│   ├── GET /                              List credit notes
│   ├── POST /                             Create credit
│   └── [creditId]/
│       ├── GET /                          Get credit
│       ├── POST /apply                    Apply to invoice
│       └── POST /void                     Void credit
│
├── reports/                           (8 endpoints)
│   ├── GET /aging                         AP aging report
│   ├── GET /payment-calendar              Payment calendar
│   ├── GET /duplicates                    Duplicate detection
│   ├── GET /audit-trail                   Audit trail export
│   ├── GET /outstanding-liabilities       Outstanding liabilities
│   ├── GET /cash-requirements             Cash requirements
│   ├── GET /analytics                     AP analytics
│   └── GET /discount-available            Early payment discounts
│
└── dashboard/                         (1 endpoint)
    └── GET /                              AP dashboard summary
```

---

## 18. Phase 21A.3 Deliverables

| Deliverable | Description |
|---|---|
| AP_API_ARCHITECTURE.md | This document — full API architecture specification |
| AP_ENDPOINT_CATALOG.md | Complete catalog of all 65 endpoints with permissions |
| AP_API_SECURITY.md | API security architecture and controls |
| EDP_21A_3.md | 10 engineering decisions with rationale |
| AP_API_TEST_REPORT.md | Test plan, categories, and verification status |

### Route Files

65 route files created at `src/app/api/v1/ap/`:

| Aggregate | Route Directory | Files |
|---|---|---|
| Vendor | `vendors/` | 10 |
| Invoice | `invoices/` | 15 |
| Approval | `approvals/` | 6 |
| Payment | `payments/` | 10 |
| Exception | `exceptions/` | 5 |
| Reconciliation | `reconciliations/` | 5 |
| Credit | `credits/` | 4 |
| Reports | `reports/` | 8 |
| Dashboard | `dashboard/` | 1 |
| **Total** | | **65** |

---

*Document generated as part of Phase 21A.3 — AP Enterprise API Layer.*
