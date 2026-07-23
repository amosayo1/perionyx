---
id: rate-limiting
title: Rate Limiting
sidebar_label: Rate Limiting
description: Redis-backed rate limiting with in-memory fallback, tiered limits per endpoint type, and response headers.
---

# Rate Limiting

`src/server/security/rate-limit.ts`:
- Uses `rate-limiter-flexible` with Redis when available
- Falls back to in-memory store when `REDIS_URL` is not set
- Tiered limits per endpoint type (mutation vs. read)
- Returns remaining count and reset timestamp in response headers
- Keyed by IP address for mutation endpoints in proxy
