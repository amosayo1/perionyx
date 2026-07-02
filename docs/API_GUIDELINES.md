# Perionyx — API Guidelines

**Version 1.0**  
**Last Updated: July 2026**

---

## 1. Design Philosophy

The Perionyx API follows REST conventions with pragmatic deviations where the financial domain requires. APIs are designed for:

- **Consistency** — Every endpoint follows the same patterns for pagination, filtering, errors, and response formats
- **Discoverability** — Endpoint structure mirrors the resource hierarchy
- **Safety** — Idempotency, validation, and authorization on every request
- **Performance** — Pagination, selective field returns, and efficient query patterns

---

## 2. Base URL

All production API endpoints are under:

```
/api/v1/
```

Versioning is part of the URL path. The current version is `v1`. Breaking changes will result in a new version (`/api/v2/`).

---

## 3. Endpoint Naming

### 3.1 Conventions

| Pattern | Example |
|---------|---------|
| `GET /api/v1/resources` | List collection |
| `POST /api/v1/resources` | Create resource |
| `GET /api/v1/resources/:id` | Get resource |
| `PUT /api/v1/resources/:id` | Replace resource |
| `PATCH /api/v1/resources/:id` | Partial update |
| `DELETE /api/v1/resources/:id` | Delete resource |
| `POST /api/v1/resources/:id/action` | Action on resource |

### 3.2 Action Endpoints

Actions that don't map to CRUD use verb-prefixed sub-resources:

```
POST /api/v1/transactions/credit
POST /api/v1/transactions/transfer
POST /api/v1/reconciliation/runs
POST /api/v1/copilot/investigate
```

### 3.3 Naming Rules

- Plural resource names: `wallets`, `transactions`, `treasury/accounts`
- kebab-case for multi-word resources: `audit-logs`, `api-keys`, `approval-rules`
- Lowercase throughout
- No trailing slashes

---

## 4. Authentication

### 4.1 Session Authentication

Browser-based requests are authenticated via NextAuth JWT session cookies:

```
Cookie: next-auth.session-token=<token>
```

### 4.2 API Key Authentication

Programmatic requests use API keys in the Authorization header:

```
Authorization: Bearer va_xxxxx...xxxxx
```

API keys are scoped to specific permissions (e.g., `read:transactions`, `write:transfers`).

### 4.3 Authentication Errors

```
401 Unauthorized
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required."
  }
}
```

---

## 5. Request Format

### 5.1 Content-Type

All requests with bodies must use:

```
Content-Type: application/json
```

### 5.2 Request Body

JSON request bodies are validated with Zod schemas. Validation errors return 400:

```
400 Bad Request
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "path": "amount", "message": "Required", "code": "invalid_type" }
    ]
  }
}
```

---

## 6. Response Format

### 6.1 Success Responses

```json
{
  "id": "wallet_abc123",
  "name": "Primary USD",
  "currency": "USD",
  "balance": "1500000.00",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 6.2 Collection Responses

```json
{
  "items": [ ... ],
  "total": 157,
  "page": 1,
  "pageSize": 20,
  "totalPages": 8
}
```

### 6.3 Error Responses

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description.",
    "details": {}
  }
}
```

### 6.4 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate) |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `IDEMPOTENCY_REPLAY` | 422 | Idempotency key replayed with different request |
| `DEPENDENCY_FAILURE` | 503 | Downstream service unavailable |

---

## 7. Pagination

### 7.1 Cursor-Based (Default)

```
GET /api/v1/transactions?cursor=abc123&limit=20
```

Response includes `nextCursor` when more results exist:

```json
{
  "items": [ ... ],
  "nextCursor": "def456",
  "hasMore": true
}
```

### 7.2 Offset-Based (Alternative)

```
GET /api/v1/transactions?page=1&pageSize=20
```

Response:

```json
{
  "items": [ ... ],
  "total": 157,
  "page": 1,
  "pageSize": 20,
  "totalPages": 8
}
```

### 7.3 Defaults and Limits

- Default page size: 20
- Maximum page size: 100 (enforced server-side)
- Maximum offset: 10000 (for offset-based; use cursor beyond this)

---

## 8. Filtering

### 8.1 Query Parameter Filtering

```
GET /api/v1/transactions?status=COMPLETED&currency=USD
GET /api/v1/risk/alerts?severity=HIGH&status=OPEN&category=BALANCE_ANOMALY
```

### 8.2 Comparison Filters

```
GET /api/v1/transactions?amount[gte]=10000&amount[lte]=50000
GET /api/v1/audit-logs?createdAt[gte]=2024-01-01&createdAt[lte]=2024-06-30
```

Supported operators: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `contains`

### 8.3 Search

```
GET /api/v1/transactions?search=reference-123
```

Search performs case-insensitive `contains` matching on searchable fields.

---

## 9. Sorting

```
GET /api/v1/transactions?sort=createdAt&order=desc
GET /api/v1/transactions?sort=amount&order=asc
```

- Default sort: `createdAt` descending
- Supported sort fields vary by endpoint
- Multi-field sort: `sort=status,createdAt&order=asc,desc`

---

## 10. Field Selection

```
GET /api/v1/wallets?fields=id,name,balance,currency
```

Reduces response payload by returning only requested fields.

---

## 11. Idempotency

### 11.1 Idempotency Key Header

State-modifying requests can include an idempotency key:

```
POST /api/v1/transactions/credit
Idempotency-Key: unique-key-123
```

### 11.2 Behavior

- Same key + same request → returns cached response (201 or 409 if different)
- Same key + different request → 422 Idempotency Replay
- Keys expire after 24 hours

### 11.3 Response

```json
{
  "idempotent": true,
  "data": { ... }
}
```

---

## 12. Rate Limiting

### 12.1 Headers

Every response includes rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1625097600
```

### 12.2 Limits

| Tier | Rate Limit |
|------|-----------|
| Authenticated (session) | 100 requests/minute |
| API Key (standard) | 1000 requests/minute |
| API Key (enterprise) | 10000 requests/minute |
| Sandbox | 200 requests/minute |

---

## 13. Versioning

### 13.1 URL Versioning

```
/api/v1/wallets
/api/v2/wallets  (future)
```

### 13.2 Deprecation

Deprecated endpoints return a `Sunset` header:

```
Sunset: Sat, 01 Jan 2027 00:00:00 GMT
Deprecation: true
```

---

## 14. CORS

CORS is configured for the application origin in production. In development, all origins are accepted.

---

## 15. Security Headers

All API responses include:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: <configured per environment>
```

---

## 16. Specific Endpoint Patterns

### 16.1 Enterprise Search

```
GET /api/v1/enterprise/search?q=manufacturing&limit=10
```

```json
{
  "items": [
    { "id": "txn_123", "label": "Transaction TXN-001", "subtitle": "$50,000 USD", "href": "/transactions/txn_123", "module": "Transactions", "matchedField": "reference", "confidence": 0.95 }
  ],
  "total": 1,
  "query": "manufacturing"
}
```

### 16.2 System Health

```
GET /api/v1/enterprise/health
```

```json
{
  "platform": { "status": "healthy", "uptime": "99.97%", "lastChecked": "2026-07-01T12:00:00Z" },
  "services": [ ... ],
  "webhooks": { "total": 12, "failed": 0, "pending": 1, "healthy": true },
  "connectors": { "total": 5, "failed": 0, "healthy": true },
  "database": { "status": "connected", "latency": "2ms" },
  "search": { "status": "indexed", "indexedModules": 15 }
}
```

### 16.3 Version History

```
GET /api/v1/enterprise/versions?entityType=Transaction&entityId=txn_123
```

```json
{
  "items": [ ... ],
  "total": 5,
  "entityType": "Transaction",
  "entityId": "txn_123"
}
```

```
GET /api/v1/enterprise/versions/diff?v1=ver_1&v2=ver_2
```

```json
{
  "version1": { ... },
  "version2": { ... },
  "diffs": [
    { "field": "status", "oldValue": "PENDING", "newValue": "COMPLETED", "changed": true }
  ],
  "changesCount": 3
}
```

### 16.4 Copilot

```
POST /api/v1/copilot/conversations
```
```json
{ "title": "Q2 Treasury Analysis", "persona": "cfo" }
```

```
POST /api/v1/copilot/conversations/:id/messages
```
```json
{ "content": "What is our current cash position?", "persona": "cfo" }
```

```
POST /api/v1/copilot/investigate
```
```json
{ "transactionId": "txn_123" }
```

---

## 17. SDK and Client Libraries

(Planned) Official client libraries will provide typed interfaces for all API endpoints in TypeScript, Python, and Go.
