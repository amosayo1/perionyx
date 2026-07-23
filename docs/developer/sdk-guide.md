# SDK Guide

## Overview

Perionyx provides official SDKs for the most popular programming languages. Each SDK provides a type-safe client with built-in retry, pagination, error handling, and webhook verification.

## Available SDKs

| Language | Package | Install |
|----------|---------|---------|
| TypeScript | `@perionyx/sdk` | `npm install @perionyx/sdk` |
| JavaScript | `@perionyx/sdk-js` | `npm install @perionyx/sdk-js` |
| Python | `perionyx-sdk` | `pip install perionyx-sdk` |
| Go | `github.com/perionyx/sdk-go` | `go get github.com/perionyx/sdk-go` |
| Java | `com.perionyx:perionyx-sdk` | Maven/Gradle |
| .NET | `Perionyx.Sdk` | `dotnet add package Perionyx.Sdk` |

## Architecture

All SDKs follow the same architecture:

### Base Client

```
PerionyxClient
├── Config (baseUrl, auth, timeout, retry)
├── request<T>(method, path, options)  →  T
├── get<T>(path, params)               →  T
├── post<T>(path, body)                →  T
├── put<T>(path, body)                 →  T
├── patch<T>(path, body)               →  T
├── delete<T>(path)                    →  T
└── paginate<T>(fetcher)               →  T[]
```

### Authentication

- API Key: `new PerionyxClient({ apiKey: 'va_...' })`
- Bearer Token: `new PerionyxClient({ accessToken: 'pat_...' })`
- OAuth2: `new PerionyxClient({ oauth2: { ... } })`

### Retry

Automatic exponential backoff (3 retries by default):

```
Attempt 1: 1s delay
Attempt 2: 2s delay
Attempt 3: 4s delay
```

### Pagination

```typescript
// Auto-paginate through all results
const allWallets = await client.paginate((page) =>
  client.get('/wallets', { page: String(page) })
);
```

### Webhook Verification

```typescript
import { verifyWebhookSignature } from '@perionyx/sdk';

function handleWebhook(req, res) {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);

  if (!verifyWebhookSignature(payload, signature, process.env.WH_SECRET)) {
    return res.status(401).end();
  }

  // Process event
  res.status(200).end();
}
```

## Error Handling

```typescript
try {
  const wallets = await client.wallets.list();
} catch (error) {
  if (error.code === 'RATE_LIMIT_EXCEEDED') {
    await delay(error.retryAfter);
    return retry();
  }
  if (error.code === 'UNAUTHORIZED') {
    // Refresh token or re-authenticate
  }
}
```

## Typed Models

All SDKs include TypeScript types / type definitions for all API entities:

- Transaction
- Wallet
- Approval
- WebhookSubscription
- ApiKey
- (and more as the API grows)

## SDK Development Status

Currently, the SDK architecture is defined and ready for implementation. The actual SDK packages will be built as the API surface stabilizes.
