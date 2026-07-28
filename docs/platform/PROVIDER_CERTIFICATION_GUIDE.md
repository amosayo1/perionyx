# Provider Certification Guide

**Document**: 4 of 5 — Governance Series
**Authority**: Platform Constitution v1.0 — Law 4 ("Provider Drivers Are Replaceable"), Law 5 ("Every External Dependency Is Observable")
**Version**: 1.0
**Ratified**: July 2026

---

## Purpose

This document defines the certification requirements for new provider drivers joining the Perionyx platform. Certification ensures that every provider driver meets minimum standards for reliability, security, observability, and contract compliance before it can serve production traffic.

**An uncertified driver is a risk. No uncertified driver may handle production requests.**

---

## Certification Overview

### What Is Provider Certification?

Provider certification is a formal verification process that a provider driver:
1. Correctly implements the platform capability contract
2. Handles all error conditions gracefully
3. Meets observability, security, and performance standards
4. Has been tested under realistic conditions
5. Has been reviewed and approved by the Architecture Review Board

### When Is Certification Required?

| Scenario | Certification Required |
|---|---|
| New provider driver (e.g., adding Stripe) | Yes |
| Major driver version bump (1.x → 2.0) | Yes |
| Provider API version migration (v1 → v2) | Yes |
| Minor driver update (1.0 → 1.1) | No (but regression tests required) |
| Bug fix (1.0.0 → 1.0.1) | No |
| Driver deprecation/replacement | No (new driver needs certification) |

### Certification Levels

| Level | Name | Traffic Allowed |
|---|---|---|
| **0** | Not Certified | No traffic. Development only. |
| **1** | Sandbox Certified | Sandbox/staging traffic only. |
| **2** | Production Certified | Production traffic with monitoring. |
| **3** | Enterprise Certified | Production traffic, SLA-backed, enterprise customers. |

---

## Certification Requirements

### 1. Contract Compliance

**Requirement**: The driver must implement all required methods of the platform capability contract.

**Verification**:
```typescript
// Automated check: interface completeness
const requiredMethods = ['initialize', 'healthCheck', 'destroy', 'getCapabilities', 
                         'authenticate', 'refreshToken', 'request', 'verifyWebhook', 'parseWebhook'];

for (const method of requiredMethods) {
  expect(typeof driver[method]).toBe('function');
}
```

**Acceptance Criteria**:
- [ ] All required `IProviderDriver` methods implemented
- [ ] All contract methods return correct types
- [ ] No `any` types in public interface
- [ ] TypeScript compilation passes with strict mode
- [ ] Contract tests pass against mock provider

---

### 2. Error Translation

**Requirement**: All provider-specific errors must be translated to canonical Perionyx error codes.

**Verification**:
```typescript
// Test: every provider error maps to a canonical code
describe('error translation', () => {
  it.each(Object.entries(PROVIDER_ERROR_MAP))(
    'translates %s to canonical code',
    (providerError, expectedCanonical) => {
      const result = driver.translateError(providerError);
      expect(result.code).toBe(expectedCanonical.code);
    }
  );
});
```

**Acceptance Criteria**:
- [ ] Error translation table defined for all known provider errors
- [ ] Unknown errors map to `PROVIDER_ERROR` or `INTERNAL_ERROR`
- [ ] No provider-specific error messages leak to consumers
- [ ] Error translation tests pass
- [ ] Unknown error codes are logged with full provider error details

---

### 3. Rate Limiting

**Requirement**: The driver must respect provider rate limits and not exceed them.

**Verification**:
- Token bucket configuration matches provider documentation
- Rate limit headers are extracted from responses
- `RATE_LIMITED` error includes `retryAfterMs`
- Rate limit state survives driver restart (if applicable)

**Acceptance Criteria**:
- [ ] Token bucket configured with correct provider limits
- [ ] Per-endpoint limits configured where applicable
- [ ] Rate limit headers parsed (`X-RateLimit-Remaining`, `Retry-After`)
- [ ] `RATE_LIMITED` error includes `retryAfterMs`
- [ ] Rate limit state tracked in metrics
- [ ] No more than 1 rate limit violation per 1000 requests in testing

---

### 4. Retry Policy

**Requirement**: The driver must implement exponential backoff with jitter for retryable errors.

**Verification**:
```typescript
// Test: retry behavior
it('retries on RATE_LIMITED with exponential backoff', async () => {
  const mockProvider = vi.fn()
    .mockRejectedValueOnce({ status: 429, retryAfter: 1 })
    .mockRejectedValueOnce({ status: 429, retryAfter: 2 })
    .mockResolvedValueOnce({ data: 'success' });

  const result = await driver.requestWithRetry(mockProvider);
  expect(mockProvider).toHaveBeenCalledTimes(3);
  expect(result).toEqual({ data: 'success' });
});
```

**Acceptance Criteria**:
- [ ] Exponential backoff: 1s → 2s → 4s → 8s → 16s → 30s (max)
- [ ] Jitter: ±500ms randomization
- [ ] Max retries configurable (default: 3)
- [ ] Retryable errors: `RATE_LIMITED`, `PROVIDER_ERROR`, `TIMEOUT`
- [ ] Non-retryable errors: `AUTHENTICATION_FAILED`, `VALIDATION_ERROR`, `FORBIDDEN`
- [ ] Retry attempts logged with attempt number and delay
- [ ] No retry storms (max 10 retries per minute per driver)

---

### 5. Circuit Breaker

**Requirement**: The driver must stop calling the provider after repeated failures.

**Verification**:
```typescript
// Test: circuit breaker state machine
it('opens circuit after 5 consecutive failures', async () => {
  // Mock 5 failures
  for (let i = 0; i < 5; i++) {
    await driver.request('GET', '/test').catch(() => {});
  }
  
  // Circuit should be open
  const health = await driver.healthCheck();
  expect(health.status).toBe('critical');
  
  // Next request should fail fast
  const result = await driver.request('GET', '/test');
  expect(result.error.code).toBe('CIRCUIT_OPEN');
});
```

**Acceptance Criteria**:
- [ ] Failure threshold: 5 consecutive failures
- [ ] Recovery timeout: 30 seconds
- [ ] Half-open: 1 probe call
- [ ] Success threshold: 2 consecutive successes to close
- [ ] Circuit state tracked in metrics (`driver_circuit_state`)
- [ ] Circuit state changes logged
- [ ] No requests made when circuit is open (except probe)

---

### 6. Health Check

**Requirement**: The driver must report its health status accurately.

**Verification**:
```typescript
// Test: health check
it('reports healthy when provider is accessible', async () => {
  const health = await driver.healthCheck();
  expect(health.status).toBe('healthy');
  expect(health.latencyMs).toBeGreaterThan(0);
});

it('reports critical when circuit is open', async () => {
  // Open circuit
  for (let i = 0; i < 5; i++) {
    await driver.request('GET', '/test').catch(() => {});
  }
  
  const health = await driver.healthCheck();
  expect(health.status).toBe('critical');
});
```

**Acceptance Criteria**:
- [ ] Health check completes in <1s
- [ ] Reports `healthy`, `degraded`, or `critical`
- [ ] Includes latency measurement
- [ ] Includes circuit breaker state
- [ ] Health check endpoint registered with ObservabilityPlatform
- [ ] Health status available via `/api/health/ready`

---

### 7. Capability Discovery

**Requirement**: The driver must report what it can and cannot do.

**Verification**:
```typescript
it('reports capabilities accurately', async () => {
  const caps = await driver.getCapabilities();
  
  expect(caps).toContainEqual({ name: 'import-data', supported: true });
  expect(caps).toContainEqual({ name: 'export-data', supported: false });
});
```

**Acceptance Criteria**:
- [ ] All capabilities from provider documentation listed
- [ ] `supported` flag reflects actual driver support
- [ ] Capabilities match provider's actual API features
- [ ] Capabilities cached (TTL: 1 hour)
- [ ] Capability changes logged

---

### 8. Authentication

**Requirement**: The driver must handle authentication securely, including token refresh.

**Verification**:
- OAuth2 flow implemented correctly
- Token refresh attempted 5 minutes before expiry
- Refresh failure triggers re-authentication flow
- No plaintext credentials in memory or logs
- Credentials encrypted at rest via SecurityPlatform

**Acceptance Criteria**:
- [ ] OAuth2 flow tested with mock provider
- [ ] Token refresh tested (valid token → refresh → new token)
- [ ] Token expiry detection tested (expired token → refresh → new token)
- [ ] Refresh failure tested (expired refresh token → AUTHENTICATION_FAILED)
- [ ] No `console.log` of credentials
- [ ] Credentials encrypted with AES-256-GCM
- [ ] Token refresh logged (success and failure)

---

### 9. Webhook Verification

**Requirement**: If the provider sends webhooks, the driver must verify signatures and prevent replay attacks.

**Verification**:
```typescript
// Test: webhook signature verification
it('accepts valid webhook signature', () => {
  const payload = '{"event":"payment.completed"}';
  const signature = hmacSha256(payload, WEBHOOK_SECRET);
  
  expect(driver.verifyWebhook(payload, signature)).toBe(true);
});

it('rejects invalid webhook signature', () => {
  const payload = '{"event":"payment.completed"}';
  
  expect(driver.verifyWebhook(payload, 'invalid-signature')).toBe(false);
});

it('rejects replayed webhooks', () => {
  const payload = '{"event":"payment.completed","nonce":"abc123","timestamp":"2024-01-01T00:00:00Z"}';
  const signature = hmacSha256(payload, WEBHOOK_SECRET);
  
  // First call succeeds
  expect(driver.verifyWebhook(payload, signature)).toBe(true);
  
  // Replay rejected (nonce already seen)
  expect(driver.verifyWebhook(payload, signature)).toBe(false);
});
```

**Acceptance Criteria**:
- [ ] HMAC-SHA256 signature verification
- [ ] Nonce + timestamp replay protection (5-minute window)
- [ ] Webhook secret stored in SecurityPlatform (not hardcoded)
- [ ] Invalid signatures logged and rejected
- [ ] Replay attempts logged and rejected
- [ ] Webhook processing latency <5s

---

### 10. Observability

**Requirement**: Every provider call must emit metrics, structured logs, and distributed traces.

**Verification**:
```typescript
// Test: observability instrumentation
it('emits metrics on every request', async () => {
  const spy = vi.spyOn(observability, 'recordMetric');
  
  await driver.request('GET', '/test');
  
  expect(spy).toHaveBeenCalledWith('driver_request_total', expect.objectContaining({
    driver: 'my-provider',
    method: 'GET',
  }));
});

it('creates tracing span', async () => {
  const spy = vi.spyOn(observability, 'startSpan');
  
  await driver.request('GET', '/test');
  
  expect(spy).toHaveBeenCalledWith('driver.my-provider.request');
});
```

**Acceptance Criteria**:
- [ ] `driver_request_total` counter emitted per request
- [ ] `driver_request_duration_ms` histogram emitted per request
- [ ] `driver_error_total` counter emitted per error
- [ ] `driver_rate_limit_remaining` gauge updated
- [ ] `driver_circuit_state` gauge updated on state change
- [ ] Structured log entry per request (level: info for success, warn for retry, error for failure)
- [ ] Distributed tracing span per request with provider attributes
- [ ] Correlation ID propagated through all logs and traces

---

### 11. Testing

**Requirement**: The driver must have comprehensive test coverage.

**Verification**:
- Unit tests for all public methods
- Integration tests with mock/sandbox provider
- Contract tests verifying interface compliance
- Failure mode tests for all error paths
- Load test for rate limiting and circuit breaker

**Acceptance Criteria**:
- [ ] Unit test coverage >90%
- [ ] Integration tests pass against sandbox
- [ ] Contract tests pass
- [ ] All error paths tested
- [ ] Circuit breaker tested (open, half-open, closed)
- [ ] Rate limiting tested (within limit, at limit, over limit)
- [ ] Token refresh tested (valid, expired, invalid)
- [ ] Webhook verification tested (valid, invalid, replay)
- [ ] Load test: 100 requests/minute without errors

---

### 12. Documentation

**Requirement**: Provider-specific documentation must be complete.

**Acceptance Criteria**:
- [ ] Provider setup guide (credentials, OAuth configuration)
- [ ] Provider API version documented
- [ ] Provider rate limits documented
- [ ] Provider quirks and limitations documented
- [ ] Provider error codes mapped
- [ ] Troubleshooting guide
- [ ] Example configuration

---

### 13. Security Review

**Requirement**: The driver must pass security review.

**Checklist**:

| # | Check | Status |
|---|---|---|
| 1 | No hardcoded secrets | [ ] |
| 2 | Credentials encrypted at rest | [ ] |
| 3 | No credentials in logs | [ ] |
| 4 | No credentials in error messages | [ ] |
| 5 | Webhook signatures verified | [ ] |
| 6 | Replay protection enabled | [ ] |
| 7 | TLS required for provider communication | [ ] |
| 8 | Input validation on all provider responses | [ ] |
| 9 | No `eval()` or dynamic code execution | [ ] |
| 10 | No `dangerouslySetInnerHTML` | [ ] |
| 11 | Dependency scan clean (`pnpm audit`) | [ ] |
| 12 | Rate limiting prevents abuse | [ ] |
| 13 | Circuit breaker prevents cascade failure | [ ] |
| 14 | Audit logging for credential access | [ ] |

---

### 14. Performance

**Requirement**: The driver must meet latency and throughput targets.

**Targets**:

| Metric | Target | Measurement |
|---|---|---|
| Request latency (p50) | <200ms | Driver request duration |
| Request latency (p95) | <1s | Driver request duration |
| Request latency (p99) | <5s | Driver request duration |
| Throughput | >100 req/s | Under load test |
| Memory usage | <50MB | Under sustained load |
| CPU usage | <5% | Under normal load |

**Acceptance Criteria**:
- [ ] Latency benchmarks documented
- [ ] Load test results documented
- [ ] Memory profiling shows no leaks
- [ ] No blocking operations in hot path

---

## Certification Checklist

### Pre-Certification

- [ ] Driver implements `IProviderDriver` interface
- [ ] Driver registered in platform registry
- [ ] Error translation table defined
- [ ] Rate limits configured
- [ ] Retry policy configured
- [ ] Circuit breaker configured
- [ ] Health check implemented
- [ ] Capability discovery implemented
- [ ] Authentication flow implemented
- [ ] Webhook verification implemented (if applicable)
- [ ] Observability instrumentation complete
- [ ] Unit tests >90% coverage
- [ ] Integration tests passing
- [ ] Contract tests passing
- [ ] Failure mode tests passing
- [ ] Documentation complete
- [ ] Security checklist passed
- [ ] Performance benchmarks met

### Certification Review

- [ ] ARB review completed
- [ ] Security review completed
- [ ] Contract compliance verified
- [ ] Error translation verified
- [ ] Rate limiting verified
- [ ] Retry policy verified
- [ ] Circuit breaker verified
- [ ] Health check verified
- [ ] Observability verified
- [ ] Documentation reviewed
- [ ] Performance benchmarks reviewed

### Post-Certification

- [ ] Driver registered as certified in Platform Registry
- [ ] Certification level assigned (1, 2, or 3)
- [ ] Certification expiry date set (12 months from certification)
- [ ] Monitoring dashboard created
- [ ] Alert rules configured
- [ ] On-call team notified

---

## Test Scenarios

### Scenario 1: Happy Path

```
1. Driver initializes with valid config
2. Driver authenticates with provider
3. Driver makes successful request
4. Response translated to canonical format
5. Metrics emitted
6. Trace span created
7. Log entry created
```

### Scenario 2: Authentication Failure

```
1. Driver initializes with invalid credentials
2. Driver attempts authentication
3. Provider returns 401
4. Driver translates to AUTHENTICATION_FAILED
5. Error returned to caller
6. Error metrics emitted
7. Error logged (no credentials in log)
```

### Scenario 3: Rate Limiting

```
1. Driver makes 100 requests in rapid succession
2. Provider returns 429 on request 50
3. Driver extracts Retry-After header
4. Driver waits for retry-after duration
5. Driver retries successfully
6. Rate limit metrics emitted
7. No more than 50 requests made before rate limit
```

### Scenario 4: Circuit Breaker

```
1. Driver makes 5 consecutive failing requests
2. Circuit breaker opens
3. Next request fails fast with CIRCUIT_OPEN
4. No provider calls made while circuit is open
5. After 30 seconds, circuit enters half-open
6. One probe request made
7. On success, circuit closes
8. Normal operation resumes
```

### Scenario 5: Token Refresh

```
1. Driver has valid access token
2. Token expires in 4 minutes
3. Driver attempts refresh before expiry
4. New access token obtained
5. Old token discarded
6. No service interruption
7. Token refresh logged
```

### Scenario 6: Webhook Processing

```
1. Webhook received with valid signature
2. Signature verified
3. Nonce checked (not replayed)
4. Timestamp checked (within 5 minutes)
5. Event normalized to canonical format
6. Event emitted to platform event bus
7. Webhook acknowledged (200 OK)
```

### Scenario 7: Provider Outage

```
1. Provider API becomes unavailable
2. First 5 requests fail
3. Circuit breaker opens
4. Subsequent requests fail fast
5. Cached data served (if available)
6. Health check reports critical
7. Alert fired to on-call
8. After provider recovery, circuit closes
9. Normal operation resumes
```

---

## Approval Process

### Step 1: Self-Certification

Driver author completes the certification checklist and submits for review.

### Step 2: Automated Verification

CI pipeline runs:
- Contract compliance tests
- Error translation tests
- Rate limiting tests
- Retry tests
- Circuit breaker tests
- Health check tests
- Observability tests
- Security scan

### Step 3: Peer Review

Two engineers review:
- Code quality
- Error handling
- Observability
- Documentation

### Step 4: ARB Review

Architecture Review Board reviews:
- Contract compliance
- Constitutional alignment
- Cross-platform impact
- Security implications

### Step 5: Certification

ARB assigns certification level:
- **Level 1 (Sandbox)**: Automated tests pass + peer review
- **Level 2 (Production)**: Level 1 + ARB review + security review + load test
- **Level 3 (Enterprise)**: Level 2 + enterprise customer validation + SLA documentation

### Certification Expiry

Certification expires after 12 months. Renewal requires:
- Re-running certification checklist
- Verifying provider API compatibility
- Reviewing security findings
- Updating documentation

---

## Amendment History

| Version | Date | Change | Authority |
|---|---|---|---|
| 1.0 | July 2026 | Initial definition | Phase 23.0 |

---

*This document is part of the Perionyx Platform Constitution governance series.*
*Authority: Platform Constitution v1.0*
