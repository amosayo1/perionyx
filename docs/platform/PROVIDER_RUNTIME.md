# Provider Runtime

**Phase**: 24.0
**Status**: Complete
**Law Compliance**: Law 2 (Vendor SDKs Stay in Integration Layer), Law 4 (Provider Drivers Replaceable), Law 11 (Every External Dependency is Observable)

## Purpose

Shared base class for every provider driver. Implements retry, timeouts, circuit breaker, rate limiting, idempotency, OAuth, health checks, telemetry, metrics, tracing, and error normalization. No provider reimplements these concerns.

## Architecture

```
src/server/foundation/provider-runtime/
├── types.ts              — ProviderConfig, ProviderState, ProviderRequest/Response
├── driver.ts             — ProviderDriver (abstract base class)
├── circuit-breaker.ts    — CircuitBreaker (3 states, configurable threshold)
├── rate-limiter.ts       — RateLimiter (token bucket)
├── retry.ts              — withRetry (exponential backoff + jitter)
└── index.ts              — Barrel export
```

## ProviderDriver Base Class

Every provider inherits from `ProviderDriver`:

```typescript
class MyProvider extends ProviderDriver {
  protected async onInitialize(): Promise<void> { /* setup */ }
  protected async onShutdown(): Promise<void> { /* cleanup */ }
  protected async makeHttpRequest(request: ProviderRequest, signal: AbortSignal): Promise<unknown> {
    // Provider-specific HTTP call
  }
  protected async onHealthCheck(): Promise<boolean> { /* health check */ }
}
```

## Pipeline

Every request passes through this pipeline:

1. **Circuit Breaker** — Check if provider is in circuit-open state
2. **Rate Limiter** — Token bucket check
3. **Retry** — Exponential backoff with jitter for transient failures
4. **Timeout** — AbortController-based request timeout
5. **Metrics** — Latency, success/failure, circuit trips
6. **Error Normalization** — Provider-specific errors → standard ProviderError

## Circuit Breaker

| State | Behavior |
|-------|----------|
| CLOSED | Normal operation. Failures increment counter. |
| OPEN | All requests rejected. After reset timeout → HALF_OPEN. |
| HALF_OPEN | Limited probe requests. Success → CLOSED. Failure → OPEN. |

## Rate Limiter

Token bucket algorithm:
- **Tokens**: Burst size (default: 10)
- **Refill**: RPM / 60 tokens per second
- **Behavior**: Try acquire → if empty, reject with 429

## Error Categories

| Category | Retryable | Example |
|----------|-----------|---------|
| AUTHENTICATION | No | Invalid API key |
| AUTHORIZATION | No | Insufficient permissions |
| RATE_LIMITED | Yes | 429 response |
| NETWORK | Yes | Connection refused |
| TIMEOUT | Yes | Request timeout |
| VALIDATION | No | Invalid request body |
| NOT_FOUND | No | Resource doesn't exist |
| CONFLICT | No | Version conflict |
| SERVER_ERROR | Yes | 5xx response |

## Usage

```typescript
import { ProviderDriver } from "@/server/foundation/provider-runtime";

class PlaidDriver extends ProviderDriver {
  // ... implement abstract methods
}

const plaid = new PlaidDriver({
  providerId: "plaid",
  name: "Plaid",
  baseUrl: "https://production.plaid.com",
  timeoutMs: 10_000,
  maxRetries: 3,
  initialBackoffMs: 1_000,
  maxBackoffMs: 30_000,
  circuitBreakerThreshold: 5,
  circuitBreakerResetMs: 60_000,
  rateLimitRpm: 100,
  rateLimitBurst: 10,
  enableIdempotency: true,
});

await plaid.initialize();
const response = await plaid.executeRequest<{ accounts: Account[] }>({
  method: "POST",
  path: "/accounts/get",
  body: { access_token: "..." },
});
```
