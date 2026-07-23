# Rate Limiting

## Overview

Rate limiting protects the API from abuse and ensures fair usage across all customers.

## Rate Limit Tiers

| Tier | Requests/Minute | Suitable For |
|------|----------------|--------------|
| Free | 60 | Development & testing |
| Basic | 300 | Small-scale integrations |
| Enterprise | 3,000 | Production deployments |
| Internal | 10,000 | Perionyx internal services |

## Rate Limit Headers

Every response includes rate limit status:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests per window |
| `X-RateLimit-Remaining` | Remaining requests in current window |
| `X-RateLimit-Reset` | Timestamp when the window resets (Unix epoch) |

## Rate Limit Error

When the rate limit is exceeded, the API returns:

```
HTTP 429 Too Many Requests
Retry-After: 30
```

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Retry after 30000ms",
    "requestId": "req_abc123"
  }
}
```

## Best Practices

1. **Implement exponential backoff** on 429 responses
2. **Cache responses** when possible to reduce API calls
3. **Use bulk endpoints** instead of individual requests
4. **Monitor rate limit headers** to stay within limits
5. **Request a tier upgrade** if you consistently hit limits

## Tier Upgrades

Contact developer relations to upgrade your rate limit tier:

- Email: developers@perionyx.com
- Developer Portal: /developer/settings
