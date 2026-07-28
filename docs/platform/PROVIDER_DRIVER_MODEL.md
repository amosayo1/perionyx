# Provider Driver Model

**Platform**: Universal Pattern
**Contract**: ProviderDriverInterface
**Mission**: Define how external providers integrate through thin, replaceable adapters that translate between provider SDKs and platform capability contracts — containing zero business logic.
**Status**: Partially Built (Plaid, QuickBooks, SAP, NetSuite, Dynamics, Slack, Teams adapters exist; formal driver model not codified)
**Constitutional Authority**: PLATFORM_CONSTITUTION.md — Law 4 ("Provider Drivers Are Replaceable")

---

## Responsibilities

1. **Authenticate** with external provider APIs (OAuth2, API keys, mTLS, bearer tokens)
2. **Translate** provider-specific errors to canonical Perionyx error codes
3. **Paginate** provider API responses into unified result sets
4. **Rate limit** requests per-provider and per-endpoint using token buckets
5. **Retry** failed requests with exponential backoff and circuit breaker integration
6. **Verify** webhook signatures and protect against replay attacks
7. **Discover** provider capabilities (what can this provider do?)
8. **Negotiate** API versions (translate between provider API versions)
9. **Wrap** provider SDKs with thin wrappers that enforce the driver contract
10. **Emit** telemetry (metrics, traces, logs) for every provider call
11. **Refresh** expired credentials (OAuth token rotation)
12. **Map** provider data models to Perionyx canonical models (at the boundary only)

---

## Public API (Capability Contract)

### What IS a Provider Driver

A Provider Driver is a **thin adapter** that sits between a Provider SDK and a Platform capability contract. It handles all the mechanical concerns of external integration — auth, retries, pagination, rate limiting, error translation, telemetry — while containing zero business logic.

### What a Provider Driver IS NOT

A Provider Driver is NOT:
- **Business logic**: It does not validate business rules, enforce invariants, or make domain decisions
- **State management**: It does not manage entity lifecycle, aggregate roots, or domain events
- **Domain translation**: It does not convert provider terminology to domain terminology (that happens at the Platform contract level)
- **Persistence**: It does not write to databases or manage transactions
- **Orchestration**: It does not coordinate multi-step workflows

### Driver Anatomy

Every driver contains these layers:

```
┌─────────────────────────────────────────────────┐
│                  Provider Driver                │
├─────────────────────────────────────────────────┤
│  1. Authentication Layer                        │
│     - OAuth2 token management                   │
│     - API key injection                         │
│     - mTLS certificate handling                 │
│     - Token refresh scheduling                  │
├─────────────────────────────────────────────────┤
│  2. Request Pipeline                            │
│     - Rate limiting (token bucket)              │
│     - Request signing                           │
│     - Header normalization                      │
│     - Timeout management                        │
├─────────────────────────────────────────────────┤
│  3. Response Pipeline                           │
│     - Error translation (provider → canonical)  │
│     - Pagination handling (cursor/offset)       │
│     - Rate limit header extraction              │
│     - Response validation                       │
├─────────────────────────────────────────────────┤
│  4. Retry & Resilience                          │
│     - Exponential backoff                       │
│     - Circuit breaker integration               │
│     - Idempotency key injection                 │
│     - Dead letter handling                      │
├─────────────────────────────────────────────────┤
│  5. Webhook Handler                             │
│     - Signature verification                    │
│     - Replay protection (nonce + timestamp)     │
│     - Event normalization                       │
│     - Acknowledgment                            │
├─────────────────────────────────────────────────┤
│  6. Capability Discovery                        │
│     - Feature detection                         │
│     - API version negotiation                   │
│     - Sandbox/production routing                │
├─────────────────────────────────────────────────┤
│  7. Telemetry                                   │
│     - Metrics (latency, errors, rate limits)    │
│     - Distributed tracing spans                 │
│     - Structured logging                        │
│     - Health check endpoint                     │
└─────────────────────────────────────────────────┘
```

---

## Internal API

### Driver Interface

Every driver MUST implement this interface:

```typescript
interface IProviderDriver {
  readonly kind: string;               // e.g., "plaid", "sap-s4hana"
  readonly label: string;              // e.g., "Plaid", "SAP S/4HANA"
  readonly version: string;            // driver version: "1.2.0"
  readonly providerApiVersion: string; // provider API version: "2024-01-01"
  
  // Lifecycle
  initialize(config: DriverConfig): Promise<void>;
  healthCheck(): Promise<DriverHealth>;
  destroy(): Promise<void>;
  
  // Capability discovery
  getCapabilities(): DriverCapability[];
  
  // Authentication
  authenticate(credentials: DriverCredentials): Promise<AuthResult>;
  refreshToken(refreshToken: string): Promise<AuthResult>;
  
  // Request execution
  request<T>(method: string, path: string, options: RequestOptions): Promise<T>;
  
  // Webhook handling
  verifyWebhook(payload: string, signature: string): boolean;
  parseWebhook(payload: unknown): NormalizedEvent[];
}
```

### Current Drivers in the Codebase

| Driver | Location | Category | Auth Method | Status |
|---|---|---|---|---|
| **Plaid** | `src/modules/connector-platform/adapters/plaid-adapter.ts` | Banking | OAuth2 | Built |
| **QuickBooks** | `src/modules/connector-platform/adapters/quickbooks-connector.ts` | ERP/Accounting | OAuth2 | Built |
| **SAP S/4HANA** | `src/modules/connector-platform/adapters/sap-connector.ts` | ERP | OAuth2/mTLS | Scaffolded |
| **NetSuite** | `src/modules/connector-platform/adapters/netsuite-connector.ts` | ERP | OAuth2 | Scaffolded |
| **Dynamics 365** | `src/modules/connector-platform/adapters/dynamics-connector.ts` | ERP | OAuth2 | Scaffolded |
| **Slack** | `src/modules/connector-platform/adapters/slack-connector.ts` | Communication | OAuth2 | Built |
| **Teams** | `src/modules/connector-platform/adapters/teams-connector.ts` | Communication | OAuth2 | Scaffolded |
| **ERP Base** | `src/modules/connector-platform/adapters/erp-base.ts` | ERP | Abstract | Built |

---

## Events

### Driver Lifecycle Events

| Event | Description | Payload |
|---|---|---|
| `driver:registered` | Driver registered in registry | kind, version |
| `driver:initialized` | Driver config loaded | kind, environment |
| `driver:authenticated` | Provider auth succeeded | kind, authMethod |
| `driver:auth-failed` | Provider auth failed | kind, error |
| `driver:token-refreshed` | OAuth token refreshed | kind, expiresAt |
| `driver:token-expired` | OAuth token expired | kind |
| `driver:degraded` | Driver degraded (circuit open) | kind, reason |
| `driver:recovered` | Driver recovered from degraded | kind |
| `driver:destroyed` | Driver torn down | kind |

### Webhook Events

| Event | Description | Source |
|---|---|---|
| `webhook:received` | Raw webhook received | Provider |
| `webhook:verified` | Signature verified | Driver |
| `webhook:rejected` | Signature invalid | Driver |
| `webhook:replay-detected` | Replay attack detected | Driver |
| `webhook:normalized` | Event normalized to canonical format | Driver |

---

## Commands

### Driver Management

| Command | Description | Permission |
|---|---|---|
| `registerDriver` | Register a new driver | `connector.admin` |
| `unregisterDriver` | Remove a driver | `connector.admin` |
| `initializeDriver` | Load driver config | `connector.configure` |
| `authenticateDriver` | Provider auth | `connector.authenticate` |
| `destroyDriver` | Tear down driver | `connector.admin` |
| `refreshDriverToken` | Refresh OAuth token | `connector.authenticate` |

---

## Queries

| Query | Description | Cacheable |
|---|---|---|
| `getDriver(kind)` | Get driver by kind | Yes (5min) |
| `listDrivers()` | List all registered drivers | Yes (1min) |
| `getDriverHealth(kind)` | Driver health status | No (30s TTL) |
| `getDriverCapabilities(kind)` | What can this driver do | Yes (1hr) |
| `getDriverRateLimits(kind)` | Current rate limit state | No |

---

## Errors

### Driver Error Translation Table

| Provider Error | Provider | Canonical Error | Retryable |
|---|---|---|---|
| `INVALID_LOGIN_CREDENTIALS` | Plaid | `AUTHENTICATION_FAILED` | No |
| `ITEM_NOT_FOUND` | Plaid | `NOT_FOUND` | No |
| `RATE_LIMIT_EXCEEDED` | Plaid | `RATE_LIMITED` | Yes |
| `TOKEN_EXPIRED` | QuickBooks | `AUTHENTICATION_FAILED` | Yes (refresh) |
| `QUICKBOOKS_ERROR` | QuickBooks | `PROVIDER_ERROR` | Yes |
| `HTTP_500` | SAP | `PROVIDER_ERROR` | Yes |
| `HTTP_401` | SAP | `AUTHENTICATION_FAILED` | Yes (refresh) |
| `HTTP_429` | NetSuite | `RATE_LIMITED` | Yes |
| `TOKEN_EXPIRED` | NetSuite | `AUTHENTICATION_FAILED` | Yes (refresh) |
| `INVALID_TOKEN` | Slack | `AUTHENTICATION_FAILED` | No |
| `METHOD_NOT_ALLOWED` | Dynamics | `PROVIDER_ERROR` | No |

### Error Translation Process

```
Provider Error → Driver translates → Canonical Error → Contract consumer handles
     ↓                                        ↓
  Raw message logged              User-friendly message returned
  (structured log)                (no provider details leaked)
```

---

## Security Model

### Credential Handling

1. **Encryption at rest**: All provider credentials encrypted with AES-256-GCM
   - Source: `src/server/security/encryption.ts`
2. **No plaintext export**: Credentials are never returned in API responses
3. **Token refresh**: OAuth tokens refreshed before expiry (5-minute buffer)
4. **Secret rotation**: Supported via `rotateDriverCredential` command
5. **Audit logging**: Every credential access logged to audit trail

### Webhook Security

1. **Signature verification**: HMAC-SHA256 with per-provider secret
2. **Replay protection**: Nonce + timestamp (5-minute window)
3. **IP allowlisting**: Provider webhook IPs validated (where available)
4. **TLS required**: Webhook endpoints require HTTPS in production

### Credential Vault

```typescript
// Located at: src/server/banking/security/credential-vault.ts
// Also: src/modules/connector-platform/secrets.ts
interface CredentialVault {
  encrypt(plaintext: string): Promise<string>;
  decrypt(ciphertext: string): Promise<string>;
  rotate(keyId: string): Promise<void>;
}
```

---

## Permission Model

| Action | Permission | MFA Required |
|---|---|---|
| Install connector | `connector.install` | No |
| Configure connector | `connector.configure` | No |
| Authenticate connector | `connector.authenticate` | No |
| Connect/disconnect | `connector.connect` | No |
| View health | `connector.health` | No |
| Sync data | `connector.sync` | No |
| Delete connector | `connector.delete` | Yes |
| Manage driver registry | `connector.admin` | Yes |

---

## Observability

### Per-Driver Metrics

| Metric | Type | Labels |
|---|---|---|
| `driver_request_duration_ms` | Histogram | driver, method, status |
| `driver_request_total` | Counter | driver, method, status |
| `driver_error_total` | Counter | driver, method, error_code |
| `driver_rate_limit_remaining` | Gauge | driver |
| `driver_rate_limit_resets_total` | Counter | driver |
| `driver_circuit_state` | Gauge | driver (0=closed, 1=half-open, 2=open) |
| `driver_token_refresh_total` | Counter | driver, status |
| `driver_webhook_received_total` | Counter | driver, event_type |
| `driver_webhook_rejected_total` | Counter | driver, reason |
| `driver_health_status` | Gauge | driver (0=unknown, 1=good, 2=warning, 3=critical) |
| `driver_latency_ms` | Histogram | driver, operation |

### Tracing

Every provider call creates a span:

```
Span: driver.{driver}.{method}
  Parent: contract.{contract}.{method}
  Attributes:
    driver.kind = "plaid"
    driver.version = "1.2.0"
    driver.api_version = "2024-01-01"
    provider.request.method = "POST"
    provider.request.path = "/item/get"
    provider.response.status = 200
    provider.response.duration_ms = 145
  Events:
    driver.auth.applied
    driver.rate_limit.checked
    driver.request.sent
    driver.response.received
    driver.error.translated
```

### Structured Logging

```json
{
  "level": "info",
  "message": "driver.plaid.syncTransactions",
  "driver": "plaid",
  "method": "syncTransactions",
  "institutionId": "ins_123",
  "accountId": "acc_456",
  "recordsProcessed": 150,
  "durationMs": 342,
  "rateLimitRemaining": 850,
  "correlationId": "req_xyz"
}
```

---

## Metrics

### Driver Health Dashboard

| Metric | Description | Alert |
|---|---|---|
| Driver success rate | % successful provider calls | < 99% |
| Driver latency p95 | 95th percentile response time | > 10s |
| Token refresh success rate | % successful token refreshes | < 99% |
| Circuit breaker trip rate | Circuit open events per hour | > 0 |
| Webhook processing latency | Time from receipt to normalization | > 5s |
| Rate limit hit frequency | Rate limit rejections per minute | > 5 |

---

## Rate Limiting

### Per-Provider Token Bucket

```typescript
interface ProviderRateLimit {
  maxRequests: number;      // token bucket capacity
  refillRate: number;       // tokens per second
  perEndpoint?: {           // per-endpoint overrides
    [endpoint: string]: {
      maxRequests: number;
      refillRate: number;
    };
  };
}
```

### Current Provider Limits

| Provider | Global Limit | Per-Endpoint | Window |
|---|---|---|---|
| Plaid | 1000/min | /transactions/get: 500/min | Rolling |
| QuickBooks | 500/min | /query: 200/min | Rolling |
| SAP S/4HANA | 200/min | Configurable | Rolling |
| NetSuite | 100/min | /restlets: 50/min | Rolling |
| Dynamics 365 | 60K/min | API calls: varies | Per 5min |
| Slack | 1/min (webhook) | N/A | Per method |

### Rate Limit Response

When rate limited, driver returns:
```
{
  code: "RATE_LIMITED",
  message: "Provider rate limit exceeded",
  retryAfterMs: 12000,
  rateLimitRemaining: 0,
  rateLimitReset: "2024-01-01T00:01:00Z"
}
```

---

## Retry Policy

### Exponential Backoff Configuration

```typescript
interface RetryConfig {
  maxRetries: number;          // default: 3
  initialDelayMs: number;      // default: 1000
  maxDelayMs: number;          // default: 30000
  backoffMultiplier: number;   // default: 2
  jitterMs: number;            // default: 500
  retryableErrors: string[];   // error codes that trigger retry
}
```

### Per-Error Retry Behavior

| Error | Max Retries | Initial Delay | Backoff |
|---|---|---|---|
| `RATE_LIMITED` | 3 | 1s | 2x + jitter |
| `PROVIDER_ERROR` | 2 | 2s | 2x + jitter |
| `TIMEOUT` | 2 | 1s | 2x + jitter |
| `AUTHENTICATION_FAILED` | 0 (refresh token instead) | N/A | N/A |
| `CIRCUIT_OPEN` | 0 (wait for circuit) | N/A | N/A |

---

## Circuit Breakers

### Per-Driver Circuit Breaker

```typescript
interface CircuitBreakerConfig {
  failureThreshold: number;     // failures to trip: 5
  recoveryTimeoutMs: number;    // time in open state: 30000
  halfOpenMaxCalls: number;     // probe calls in half-open: 1
  successThreshold: number;     // successes to close: 2
}
```

### Circuit State Machine

```
Closed → (5 failures) → Open → (30s) → Half-Open → (1 success) → Closed
                          ↑                        ↓
                          └─── (1 failure) ────────┘
```

---

## Caching

| Data | TTL | Location | Invalidation |
|---|---|---|---|
| Driver capabilities | 1 hour | Memory | Driver re-init |
| Health status | 30 seconds | Memory | Health check |
| Rate limit state | Rolling window | Memory | Window expiry |
| Provider API version | 24 hours | Memory | Driver update |

---

## Versioning

### Driver Versioning

| Component | Version | Policy |
|---|---|---|
| Driver code | semver (1.2.0) | Major: breaking driver interface changes |
| Provider API version | Provider's version | Negotiated at initialization |
| Driver interface | Major version | Breaking changes require major bump |

### API Version Negotiation

```typescript
interface VersionNegotiation {
  supportedVersions: string[];  // what the driver supports
  preferredVersion: string;     // what the driver prefers
  minimumVersion: string;       // minimum acceptable
}
```

---

## Lifecycle

### Driver Lifecycle States

```
Discovered → Registered → Initialized → Authenticated → Active → Degraded → Retired
                                     ↘ Error ↗         ↘ Failed ↗
```

| State | Description | Transitions |
|---|---|---|
| **Discovered** | Driver available in marketplace | → Registered |
| **Registered** | Factory registered in registry | → Initialized |
| **Initialized** | Config loaded, SDK created | → Authenticated, Error |
| **Authenticated** | Provider credentials verified | → Active, Error |
| **Active** | Normal operation | → Degraded, Retired |
| **Degraded** | Circuit breaker open | → Active (recovered), Failed |
| **Error** | Authentication or init failure | → Initialized (retry) |
| **Failed** | Unrecoverable failure | Terminal |
| **Retired** | Removed from active use | Terminal |

### Lifecycle Management

```typescript
// Located at: src/modules/connector-platform/lifecycle.ts
class ConnectorLifecycle {
  static async install(ctx, config): Promise<InstallResult>;
  static async validate(ctx, configId): Promise<ValidationResult>;
  static async authenticate(ctx, configId, credentials): Promise<AuthResult>;
  static async connect(ctx, configId): Promise<HealthStatus>;
  static async disconnect(ctx, configId): Promise<void>;
  static async healthCheck(ctx, configId): Promise<Health>;
}
```

---

## Extension Model

### Adding a New Provider Driver

1. **Implement** `IProviderDriver` interface
2. **Define** error translation table
3. **Configure** rate limits and retry policy
4. **Implement** webhook handler (if applicable)
5. **Register** factory in `ConnectorPlatformRegistry`
6. **Add** to provider definitions (`src/server/banking/providers/definitions/`)
7. **Write** contract compliance tests
8. **Document** provider-specific quirks in driver README

### Driver Registration

```typescript
// Located at: src/modules/connector-platform/registry.ts
class ConnectorPlatformRegistry {
  registerKind(kind: ConnectorKind, factory: ConnectorFactory): void;
  registerInstance(id: string, connector: IConnector): void;
  createInstance(kind: ConnectorKind): IConnector;
  getInstance(id: string): IConnector | undefined;
}
```

---

## Provider Model

### Provider Capability Discovery

```typescript
// Located at: src/modules/connector-platform/discovery.ts
class ConnectorDiscovery {
  findProviders(query: DiscoveryQuery): ConnectorMetadata[];
  getProvider(kind: ConnectorKind): ConnectorMetadata | undefined;
  listCategories(): { category: ConnectorCategory; count: number }[];
}
```

### Capability Matrix

| Capability | Plaid | QuickBooks | SAP | NetSuite | Dynamics | Slack | Teams |
|---|---|---|---|---|---|---|---|
| import-data | Y | Y | Y | Y | Y | N | N |
| export-data | N | Y | Y | Y | Y | N | N |
| webhooks | Y | Y | Y | Y | Y | Y | Y |
| scheduled-sync | Y | Y | Y | Y | Y | N | N |
| manual-sync | Y | Y | Y | Y | Y | N | N |
| health-check | Y | Y | Y | Y | Y | Y | Y |
| gl-sync | N | Y | Y | Y | Y | N | N |
| payment-export | N | Y | Y | Y | Y | N | N |

---

## Testing Strategy

### Contract Compliance Tests

| Test Category | Scope | Pass Criteria |
|---|---|---|
| Interface completeness | All required methods exist | 100% |
| Error translation | All provider errors mapped | 100% |
| Rate limit compliance | Limits respected | No overages |
| Retry behavior | Correct retry for each error | 100% |
| Webhook verification | Signatures validated | 100% |
| Token refresh | Expired tokens refreshed | 100% |
| Circuit breaker | States transition correctly | 100% |
| Telemetry | All metrics emitted | 100% |

### Integration Tests

| Test | Environment | Frequency |
|---|---|---|
| Plaid sandbox sync | Plaid Sandbox | Every PR |
| QuickBooks sandbox | QBO Sandbox | Nightly |
| SAP mock server | Mock server | Nightly |
| Webhook processing | Test webhook server | Every PR |
| Token refresh flow | Mock OAuth server | Every PR |

---

## Failure Modes

| Failure | Driver Behavior | Recovery |
|---|---|---|
| Provider API down | Circuit opens after 5 failures | Auto-recover after 30s |
| OAuth token expired | Refresh token used | Automatic refresh |
| Rate limit exceeded | Wait for retry-after | Automatic retry |
| Webhook signature invalid | Reject, log, alert | No action (security) |
| Provider API version deprecated | Return error, log warning | Driver update required |
| Credential rotation needed | Return error, log warning | Admin rotates |
| Network timeout | Retry with backoff | Automatic retry |
| Provider returns malformed data | Parse error, log, alert | Manual investigation |

---

## Recovery Strategy

1. **Provider Outage**: Circuit breaker isolates — other providers unaffected; cached data served
2. **Token Expiry**: Automatic refresh with 5-minute buffer; failure triggers re-authentication flow
3. **Rate Limit Hit**: Exponential backoff + jitter; rate limit state persisted to survive restarts
4. **Credential Leak**: Immediate rotation via `rotateDriverCredential`; audit log records access
5. **Provider API Breaking Change**: Driver fails gracefully; alert triggers driver update
6. **Webhook Replay Attack**: Nonce + timestamp validation rejects; event logged for forensics
7. **Driver Memory Leak**: Health check monitors memory; driver restarts if threshold exceeded
8. **Registry Corruption**: Restart rebuilds from configuration; no data loss (credentials encrypted at rest)
