# REST API Design Patterns for Perionyx

**Date**: July 22, 2026
**Phase**: 21A.3 — AP Enterprise API Layer
**Status**: Established pattern

## Versioning

```
/api/v1/{domain}/{resource}
```

All endpoints use URL-based versioning. Version is a path segment, not a header. Current version: `v1`.

## Authentication

Two mechanisms:
- **JWT session token** — Extracted from `Authorization: Bearer <token>` or session cookie. Primary for browser-based access.
- **API key** — Extracts from `x-api-key` header. For machine-to-machine integration. Bypasses CSRF checks.

Both are validated in `src/proxy.ts` before reaching any route handler.

## Authorization

**RBAC with granular permissions** — 37 AP permissions (e.g., `ap.invoices.view`, `ap.payments.execute`, `ap.vendors.create`).

Permission checks happen in route handlers via `requirePermission()`, not in middleware. This allows resource-level authorization (e.g., "can this user approve THIS invoice?").

Separation of Duties (SoD) enforced at application layer — creator cannot approve own vendor, same user cannot both match and approve.

## Validation

**Zod schemas at the API boundary** — Structural validation only. Three schema types per endpoint:

| Schema | Purpose | Example |
|--------|---------|---------|
| `ParamsSchema` | Path parameters | `{ id: z.string().uuid() }` |
| `QuerySchema` | Query parameters (filtering, pagination) | `{ page: z.coerce.number(), status: z.enum([...]) }` |
| `BodySchema` | Request body | `{ vendorId: z.string(), amount: z.number() }` |

Domain validation (state machine, invariants, SoD) happens in application services, not in Zod schemas.

## Error Model

Enterprise error contract on every error response:

```json
{
  "error": {
    "code": "INVOICE_NOT_FOUND",
    "message": "Invoice with id abc-123 does not exist",
    "category": "NOT_FOUND",
    "correlationId": "req_7f3a2b1c",
    "recoverability": "RETRY_NOT_POSSIBLE",
    "userMessage": "This invoice may have been deleted or you may not have access."
  }
}
```

| Field | Purpose | Audience |
|-------|---------|----------|
| `code` | Machine-readable error code | Programmatic handling |
| `message` | Human-readable description | Developers / support |
| `category` | HTTP-level classification | Client routing logic |
| `correlationId` | Request trace ID | Support / debugging |
| `recoverability` | Whether retry is safe | Client retry logic |
| `userMessage` | End-user friendly text | UI display |

## Idempotency

**Header-based, 24h TTL.**

- Client sends `x-idempotency-key: <uuid>` on POST requests
- Server stores key + response in in-memory Map for 24 hours
- Duplicate request with same key returns cached response (no re-execution)
- Protects against network retries, not business-level duplicates

Applies to: invoice creation, payment submission, approval actions, credit note creation.

## Pagination

**Offset-based** with `page` and `limit` query parameters.

```
GET /api/v1/ap/invoices?page=2&limit=25&status=RECEIVED
```

Default: `page=1`, `limit=25`. Maximum: `limit=200`.

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 25,
    "total": 147,
    "totalPages": 6
  }
}
```

## Tenant Isolation

**`companyId` extracted from JWT** — injected into every query context by tenant middleware. All Prisma queries include `companyId` filter. No endpoint can access cross-tenant data.

## Correlation

**`x-correlation-id` propagation** — Generated at proxy level (or propagated from client header), returned in all responses, logged in all structured logs.

Thread: `proxy → middleware → route handler → application service → repository → response`

Enables end-to-end request tracing across distributed log entries.

## REST Conventions

| Convention | Pattern | Example |
|------------|---------|---------|
| Plural nouns | `/vendors`, `/invoices` | Never `/vendor` or `/invoice` |
| Nested resources | `/{parent}/{id}/{child}` | `/vendors/:id/invoices` |
| HTTP verbs | GET (read), POST (create), PUT (full update), PATCH (partial), DELETE (remove) | Consistent semantics |
| Status codes | 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable, 429 Too Many Requests | Standard HTTP semantics |
| No verbs in URLs | `/invoices/:id/approve` not `/approveInvoice` | Resource-centric design |
