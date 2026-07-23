# Error Handling

## Error Response Format

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description of the error",
    "details": {},
    "requestId": "req_abc123",
    "documentationUrl": "https://docs.perionyx.com/developer/errors"
  }
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request — check request parameters |
| 401 | Unauthorized — authentication required |
| 403 | Forbidden — insufficient permissions |
| 404 | Not Found — resource doesn't exist |
| 409 | Conflict — resource state conflict |
| 410 | Gone — resource or version no longer available |
| 422 | Unprocessable Entity — semantic error |
| 429 | Too Many Requests — rate limit exceeded |
| 500 | Internal Server Error — contact support |

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| VALIDATION_ERROR | 400 | Request body or parameters failed validation |
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| FORBIDDEN | 403 | Authenticated but not authorized |
| NOT_FOUND | 404 | Requested resource not found |
| CONFLICT | 409 | Resource state conflict |
| RATE_LIMIT_EXCEEDED | 429 | Rate limit exceeded |
| INTERNAL_ERROR | 500 | Unexpected server error |
| SERVICE_UNAVAILABLE | 503 | Temporary service disruption |

## Validation Errors

Validation errors include details about which fields failed:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "amount",
        "message": "Amount must be a positive number"
      },
      {
        "field": "currency",
        "message": "Currency must be a valid ISO 4217 code"
      }
    ],
    "requestId": "req_abc123"
  }
}
```

## Retry Strategy

| Status Code | Retry? | Strategy |
|-------------|--------|----------|
| 400 | No | Fix request |
| 401 | No | Re-authenticate |
| 403 | No | Request higher permissions |
| 404 | No | Check resource ID |
| 409 | Yes, with fresh data | Retry with updated state |
| 429 | Yes | Exponential backoff |
| 500 | Yes | Exponential backoff |
| 503 | Yes | Exponential backoff |

## Request ID

Every error response includes a `requestId`. Include this when contacting support:
