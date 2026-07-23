# REST API Guide

## Base URL

```
Production: https://api.perionyx.com/api/v1
Sandbox:    https://sandbox.perionyx.com/api/v1
```

## Authentication

All API requests require authentication. See the Authentication guide for details.

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | API key or Bearer token |
| `Content-Type` | Yes | `application/json` for requests with body |
| `Accept-Version` | No | API version negotiation (`v1`) |
| `X-Correlation-Id` | No | Client-generated correlation ID |

## Standard Responses

### Success (200 OK)
```json
{
  "data": { ... }
}
```

### Created (201 Created)
```json
{
  "data": { ... }
}
```
Includes `Location` header pointing to the new resource.

### No Content (204 No Content)
For DELETE operations. No response body.

### Paginated (200 OK)
```json
{
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "total": 100,
    "totalPages": 4,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error (4xx/5xx)
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description",
    "details": {},
    "requestId": "req_abc123"
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| RATE_LIMIT_EXCEEDED | 429 | Rate limit exceeded |
| INTERNAL_ERROR | 500 | Internal server error |

## Pagination

List endpoints support cursor-based and page-based pagination.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-indexed) |
| `pageSize` | integer | 25 | Items per page (max 200) |
| `cursor` | string | — | Cursor for cursor-based pagination |

### Response Headers

| Header | Description |
|--------|-------------|
| `X-Total-Count` | Total number of items |
| `X-Page` | Current page number |
| `X-Page-Size` | Items per page |

## Filtering

Use the `filter[field][operator]=value` syntax:

```
GET /api/v1/transactions?filter[status][eq]=completed&filter[amount][gt]=1000
```

### Operators

| Operator | Description |
|----------|-------------|
| `eq` | Equals |
| `neq` | Not equals |
| `gt` | Greater than |
| `gte` | Greater than or equal |
| `lt` | Less than |
| `lte` | Less than or equal |
| `contains` | Contains substring |
| `in` | In comma-separated list |
| `nin` | Not in comma-separated list |
| `between` | Between two values (comma-separated) |

## Sorting

Use the `sort` parameter with optional `+` (asc) or `-` (desc) prefix:

```
GET /api/v1/transactions?sort=-createdAt,+amount
```

## Field Selection

Select specific fields to reduce response size:

```
GET /api/v1/wallets?fields=id,name,balance
```
