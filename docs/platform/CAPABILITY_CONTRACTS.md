# Capability Contracts

**Platform**: Universal Pattern
**Contract**: CapabilityContractDefinition
**Mission**: Define the stable, versioned interface that every Platform publishes and every business domain consumes — ensuring provider-agnosticism, independent evolution, and replaceability.
**Status**: Partially Built (ConnectorPlatform has `IConnector` interface; Banking has `IBankProvider`; other platforms need formalization)
**Constitutional Authority**: PLATFORM_CONSTITUTION.md — Law 3 ("Every Platform Exposes Capability Contracts")

---

## Responsibilities

1. **Define** the universal structure every Platform contract must follow
2. **Enforce** that business domains depend ONLY on contracts, never on internal implementation details
3. **Version** contracts using semantic versioning with backward-compatibility guarantees
4. **Test** contracts via consumer-driven contract testing (Pact-style)
5. **Document** every method signature, event type, error type, and permission requirement
6. **Deprecate** contract methods with a minimum 2-version notice before removal
7. **Discover** available contracts at runtime via a contract registry
8. **Validate** that provider drivers implement all required contract methods
9. **Evolve** contracts additively (new methods, new optional parameters) without breaking consumers
10. **Audit** contract compliance during code review and CI

---

## Public API (Capability Contract)

### What IS a Capability Contract

A Capability Contract is a **stable, versioned, provider-agnostic interface** that a Platform publishes. Business domains (ledger, treasury, AP, AR, compliance, workflow) consume ONLY these contracts — never provider SDKs, never internal service classes, never database models.

A contract is:
- **Stable**: methods and types do not change within a major version
- **Versioned**: semver (major.minor.patch) with explicit deprecation policy
- **Provider-agnostic**: identical interface regardless of whether the backend is Plaid, SAP, or a mock
- **Self-documenting**: every method has a return type, error contract, and permission requirement
- **Testable**: consumer-driven tests verify the contract is honored

A contract is NOT:
- An implementation (drivers implement contracts)
- An SDK wrapper (drivers wrap SDKs)
- A database schema (repositories implement persistence behind contracts)
- A REST API (HTTP routes may expose contracts, but contracts are language-level interfaces)

### Contract Structure

Every Platform contract MUST define:

```typescript
// 1. Interface definition — the stable public surface
interface [PlatformName]Contract {
  readonly version: string;          // semver: "1.0.0"
  readonly provider: string;         // canonical name: "banking", "erp", "identity"
  
  // 2. Capability methods — what this platform CAN DO
  capabilityName(params: ContractParams): Promise<ContractResult>;
  
  // 3. Health — liveness and readiness
  health(): Promise<ContractHealth>;
  
  // 4. Capabilities — what this provider supports
  capabilities(): Promise<ContractCapability[]>;
}

// 4. Event types — what this platform EMITS
type [PlatformName]Event = 
  | { type: "entity.created"; payload: EntityCreatedPayload }
  | { type: "entity.updated"; payload: EntityUpdatedPayload }
  | { type: "entity.deleted"; payload: EntityDeletedPayload };

// 5. Error types — what this platform can FAIL WITH
type [PlatformName]Error = 
  | { code: "VALIDATION_ERROR"; message: string; details?: unknown }
  | { code: "NOT_FOUND"; message: string }
  | { code: "CONFLICT"; message: string }
  | { code: "PROVIDER_ERROR"; message: string; providerError?: unknown }
  | { code: "RATE_LIMITED"; message: string; retryAfterMs?: number }
  | { code: "AUTHENTICATION_FAILED"; message: string }
  | { code: "AUTHORIZATION_FAILED"; message: string };
```

### Contract Method Signatures

Every contract method follows the Command-Result pattern:

```typescript
type ContractParams = {
  companyId: string;       // tenant isolation — always required
  userId: string;          // audit trail — always required
  correlationId?: string;  // distributed tracing
  [key: string]: unknown;  // domain-specific parameters
};

type ContractResult<T> = {
  success: boolean;
  data?: T;
  error?: ContractError;
  metadata?: {
    durationMs: number;
    providerLatencyMs?: number;
    cacheHit?: boolean;
    rateLimitRemaining?: number;
  };
};
```

### Current Contracts in the Codebase

| Platform | Contract Interface | Location | Status |
|---|---|---|---|
| **Connector** | `IConnector` | `src/modules/connector-platform/interface.ts` | Built |
| **Banking** | `IBankProvider` | `src/server/banking/providers/interface.ts` | Built |
| **ERP** | `ErpConnectorBase` (abstract) | `src/modules/connector-platform/adapters/erp-base.ts` | Scaffolded |
| **Identity** | `AuthenticationService` | `src/server/identity/authentication.ts` | Partially Built |
| **Notifications** | `NotificationService` | `src/modules/notifications/notifications.service.ts` | Partially Built |
| **Payments (AP)** | `PaymentApplicationService` | `src/server/procurement/application/payment-service.ts` | Built |
| **Payments (Bank)** | `BankingPaymentService` | `src/server/banking/payments/payment-service.ts` | Scaffolded |
| **AI** | `PromptExecutionService` | Referenced in AI platform | Built |

---

## Internal API

### Contract Registry

All contracts are registered at startup and discoverable at runtime:

```typescript
// Conceptual — to be built
class ContractRegistry {
  register(provider: string, contract: CapabilityContract): void;
  get(provider: string): CapabilityContract | undefined;
  list(): ContractDescriptor[];
  validate(provider: string): ValidationResult;
}
```

### Contract Testing

Consumer-driven contract tests verify that:
1. Every registered provider implements the full contract interface
2. No provider silently omits methods or changes return types
3. Error codes match the contract's error taxonomy
4. Event types match the contract's event catalog

---

## Events

Every Platform contract MUST define its event catalog:

| Event Pattern | Description | Example |
|---|---|---|
| `{entity}.created` | New entity persisted | `vendor.created`, `account.created` |
| `{entity}.updated` | Existing entity modified | `invoice.updated`, `connection.updated` |
| `{entity}.deleted` | Entity removed | `vendor.deleted`, `notification.deleted` |
| `{entity}.{action}` | Domain-specific action | `payment.submitted`, `sync.completed` |
| `health.changed` | Health status transition | `connector.health.changed` |
| `capability.{event}` | Capability lifecycle | `capability.discovered`, `capability.degraded` |

### Event Envelope

```typescript
interface ContractEvent {
  type: string;                    // e.g., "vendor.created"
  provider: string;                // e.g., "banking", "erp"
  companyId: string;               // tenant isolation
  correlationId?: string;          // distributed tracing
  timestamp: string;               // ISO 8601
  payload: Record<string, unknown>;
  metadata?: {
    userId?: string;
    sourceVersion?: string;
    providerEventId?: string;
  };
}
```

---

## Commands

Contracts may define commands (write operations) and queries (read operations):

| Pattern | Semantics | Idempotent | Example |
|---|---|---|---|
| `create{Entity}` | Create new entity | No (use idempotency key) | `createVendor` |
| `update{Entity}` | Update existing entity | Yes (optimistic locking) | `updateInvoice` |
| `delete{Entity}` | Soft-delete entity | Yes | `deleteConnection` |
| `execute{Action}` | Trigger domain action | Depends on action | `executePayment` |
| `sync{Entity}` | Sync from provider | Yes | `syncTransactions` |

---

## Queries

| Pattern | Semantics | Cacheable | Paginated |
|---|---|---|---|
| `get{Entity}` | Single entity by ID | Yes | No |
| `list{Entities}` | Collection with filters | Yes | Yes (cursor) |
| `search{Entities}` | Full-text search | No | Yes (cursor) |
| `get{Entity}Health` | Health status | No | No |
| `get{Entity}Capabilities` | Capability manifest | Yes | No |

---

## Errors

### Error Code Taxonomy

Every contract MUST use these canonical error codes:

| Code | HTTP | Retryable | Description |
|---|---|---|---|
| `VALIDATION_ERROR` | 400 | No | Input validation failed |
| `NOT_FOUND` | 404 | No | Entity does not exist |
| `CONFLICT` | 409 | No | State conflict (optimistic locking) |
| `FORBIDDEN` | 403 | No | Authorization failed |
| `AUTHENTICATION_FAILED` | 401 | No | Authentication failed |
| `RATE_LIMITED` | 429 | Yes | Provider rate limit hit |
| `PROVIDER_ERROR` | 502 | Yes | External provider error |
| `TIMEOUT` | 504 | Yes | Provider timeout |
| `CIRCUIT_OPEN` | 503 | Yes | Circuit breaker open |
| `INTERNAL_ERROR` | 500 | No | Unexpected error |

### Error Translation

Provider drivers translate provider-specific errors to canonical codes:

```
Plaid INVALID_LOGIN → AUTHENTICATION_FAILED
QuickBooks TOKEN_EXPIRED → AUTHENTICATION_FAILED
SAP HTTP_500 → PROVIDER_ERROR
NetSuite RATE_LIMIT_EXCEEDED → RATE_LIMITED
SAP HTTP_408 → TIMEOUT
```

---

## Security Model

### Contract-Level Security

1. **Tenant Isolation**: Every contract method requires `companyId` — enforced at the contract boundary
2. **Authentication**: All callers must be authenticated — contract does not trust the caller
3. **Authorization**: Contract methods declare required permissions (see Permission Model)
4. **Audit**: Every contract method invocation is logged with actor, action, resource, timestamp
5. **Encryption**: Sensitive data in transit and at rest — contracts do not handle this (infrastructure concern)

### Contract Security Rules

- Contracts never expose raw provider credentials
- Contracts never include tenant IDs in return values that could leak across tenants
- Contracts never trust client-supplied audit metadata
- Contracts validate all inputs at the boundary (Zod schemas)

---

## Permission Model

Every contract method declares its permission requirement:

```typescript
interface ContractMethodDescriptor {
  name: string;
  requiredPermission: GranularPermission;
  requiresMfa: boolean;
  description: string;
}
```

| Permission Pattern | Scope | MFA Required | Example |
|---|---|---|---|
| `{domain}.read` | View data | No | `banking.read` |
| `{domain}.write` | Modify data | No | `ap.write` |
| `{domain}.delete` | Remove data | Yes | `vendor.delete` |
| `{domain}.execute` | Trigger actions | Yes | `payment.execute` |
| `{domain}.admin` | Administer | Yes | `connector.admin` |

---

## Observability

### Metrics (per contract method)

| Metric | Type | Labels |
|---|---|---|
| `contract_method_duration_ms` | Histogram | provider, method, status |
| `contract_method_total` | Counter | provider, method, status, error_code |
| `contract_method_in_flight` | Gauge | provider, method |
| `contract_provider_latency_ms` | Histogram | provider, method |
| `contract_cache_hit_total` | Counter | provider, method |
| `contract_rate_limit_remaining` | Gauge | provider, method |

### Tracing

Every contract invocation creates a span:

```
Span: contract.{provider}.{method}
  Attributes:
    contract.provider = "banking"
    contract.method = "syncTransactions"
    contract.version = "1.0.0"
    tenant.id = "company_abc"
    user.id = "user_123"
  Events:
    contract.request.start
    contract.provider.call
    contract.provider.response
    contract.request.complete
```

### Logging

Structured log entry for every contract call:

```json
{
  "level": "info",
  "message": "contract.banking.syncTransactions",
  "provider": "banking",
  "method": "syncTransactions",
  "companyId": "company_abc",
  "userId": "user_123",
  "correlationId": "req_xyz",
  "durationMs": 342,
  "status": "success",
  "recordsProcessed": 150
}
```

---

## Metrics

### Dashboard Metrics

| Metric | Description | Alert Threshold |
|---|---|---|
| Contract success rate | % of successful contract calls | < 99.5% |
| Contract latency (p95) | 95th percentile latency | > 5000ms |
| Provider error rate | % of provider errors | > 1% |
| Circuit breaker trips | Circuit open events | > 0 |
| Rate limit hits | Rate limit rejections | > 10/min |

---

## Rate Limiting

Rate limiting is enforced at two levels:

1. **Platform level**: Per-tenant rate limiting on contract method calls
2. **Provider level**: Per-provider rate limiting (translates provider limits to contract limits)

```typescript
interface ContractRateLimit {
  maxRequests: number;
  windowMs: number;
  perTenant: boolean;
  perProvider: boolean;
}
```

---

## Retry Policy

| Error Code | Retryable | Max Retries | Backoff | Jitter |
|---|---|---|---|---|
| `RATE_LIMITED` | Yes | 3 | Exponential (1s, 2s, 4s) | ±500ms |
| `PROVIDER_ERROR` | Yes | 2 | Exponential (2s, 4s) | ±1s |
| `TIMEOUT` | Yes | 2 | Exponential (1s, 2s) | ±500ms |
| `CIRCUIT_OPEN` | No | 0 | N/A | N/A |
| `AUTHENTICATION_FAILED` | No | 0 | N/A | N/A |

---

## Circuit Breakers

Each provider gets a circuit breaker:

| State | Behavior | Transition |
|---|---|---|
| **Closed** | Normal operation | → Open after 5 consecutive failures |
| **Open** | Reject all calls, return `CIRCUIT_OPEN` | → Half-open after 30s |
| **Half-open** | Allow 1 probe call | → Closed on success, → Open on failure |

---

## Caching

| Data Type | TTL | Invalidation | Location |
|---|---|---|---|
| Capability manifests | 1 hour | Provider re-registration | Memory |
| Health status | 30 seconds | Health check complete | Memory |
| Rate limit state | Window duration | Window expiry | Memory |
| Contract descriptors | Forever (until restart) | App restart | Memory |

---

## Versioning

### Semver Rules

| Change Type | Version Bump | Example |
|---|---|---|
| New optional parameter | Minor | `1.0.0` → `1.1.0` |
| New method | Minor | `1.0.0` → `1.1.0` |
| New error code | Minor | `1.0.0` → `1.1.0` |
| New event type | Minor | `1.0.0` → `1.1.0` |
| Remove method | Major | `1.0.0` → `2.0.0` |
| Change return type | Major | `1.0.0` → `2.0.0` |
| Change required param | Major | `1.0.0` → `2.0.0` |
| Bug fix | Patch | `1.0.0` → `1.0.1` |

### Deprecation Policy

1. Mark method as `@deprecated` with replacement guidance
2. Log deprecation warnings for 2 minor versions (minimum 6 months)
3. Remove in next major version
4. Consumers receive compile-time warnings before removal

---

## Lifecycle

### Contract Lifecycle

```
Defined → Review → Ratified → Implemented → Tested → Published → Deprecated → Removed
```

1. **Defined**: Contract method added to interface definition
2. **Review**: Engineering review, permission audit, security review
3. **Ratified**: Added to Constitution as approved contract
4. **Implemented**: At least one provider driver implements the method
5. **Tested**: Consumer-driven contract tests pass
6. **Published**: Available for business domain consumption
7. **Deprecated**: Marked for removal, replacement guidance provided
8. **Removed**: Deleted from interface (major version bump)

---

## Extension Model

New capability methods can be added to existing contracts:

```typescript
// Extension pattern — additive, non-breaking
interface BankingContractV1_1 extends BankingContractV1_0 {
  getStatements?(params: GetStatementsParams): Promise<ContractResult<Statement[]>>;
}
```

Extension rules:
- New methods are optional (question-mark syntax)
- Existing methods are never removed within a major version
- Extensions are backward-compatible by definition
- Extensions are tested independently before ratification

---

## Provider Model

A provider driver implements a contract. The contract is provider-agnostic:

```
Business Domain → Contract Interface → Provider Driver → Provider SDK → External API
```

| Concern | Contract Level | Driver Level |
|---|---|---|
| Method signature | Defined | Implemented |
| Error types | Defined | Translated |
| Event types | Defined | Emitted |
| Rate limiting | Policy | Enforced |
| Retry policy | Policy | Enforced |
| Authentication | Required | Handled |
| Pagination | Defined | Handled |
| Caching | Policy | Optional |

---

## Testing Strategy

### Consumer-Driven Contract Testing

1. Business domains write consumer tests that express expectations of the contract
2. Provider drivers run against these consumer tests to verify compliance
3. Tests are run in CI on every PR that touches contract or driver code

### Contract Test Categories

| Category | Scope | Frequency |
|---|---|---|
| Interface compliance | All required methods exist | Every PR |
| Type compatibility | Return types match contract | Every PR |
| Error code coverage | All error codes are used correctly | Every PR |
| Event emission | Events match contract catalog | Every PR |
| Permission coverage | All methods have permission declarations | Every PR |
| Performance baseline | Latency within contract bounds | Nightly |

---

## Failure Modes

| Failure | Impact | Recovery |
|---|---|---|
| Contract method not implemented | Call fails with `INTERNAL_ERROR` | Driver must implement all required methods |
| Error code mismatch | Consumers misinterpret errors | Error translation tests catch mismatches |
| Event not emitted | Consumers miss state changes | Event emission tests in contract suite |
| Version mismatch | Consumers get unexpected types | Version negotiation at registration |
| Permission not declared | Authorization bypass risk | CI fails on missing permission |

---

## Recovery Strategy

1. **Contract Registry Corruption**: Restart application — registry rebuilds from registered drivers
2. **Provider Driver Failure**: Circuit breaker isolates — other providers unaffected
3. **Version Incompatibility**: Version negotiation rejects incompatible versions at registration
4. **Stale Contract Cache**: TTL-based expiry + explicit invalidation on provider update
5. **Missing Error Translation**: Fall back to `PROVIDER_ERROR` with raw error message logged
6. **Test Suite Drift**: CI enforces contract tests — PR merge blocked on failure
