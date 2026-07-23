# Integration Core Architecture (Phase 12A.1)

## Overview

The Integration Core provides the provider-agnostic foundation for every external connector in the platform. It enforces a single contract (`IntegrationProvider`) that all providers must implement, and composes them through a registry, factory, connection manager, credential manager, health system, event bus, capability discovery, and observability layer.

## Architecture Layers

```
┌─────────────────────────────────────────────┐
│         IntegrationFacade                   │  → Top-level entry point
├─────────────────────────────────────────────┤
│  CapabilityDiscovery  │  Observability      │  → Discovery + metrics/tracing
├─────────────────────────────────────────────┤
│  EventBus             │  HealthMonitor      │  → Events + health scoring
├─────────────────────────────────────────────┤
│  CredentialManager    │  ConnectionManager  │  → Secrets + lifecycle
├─────────────────────────────────────────────┤
│  IntegrationFactory   │  IntegrationRegistry│  → DI creation + lookup
├─────────────────────────────────────────────┤
│  IntegrationProvider (interface)            │  → Provider contract
├─────────────────────────────────────────────┤
│  ERPProvider  BankProvider  ... (13 specs)  │  → Category-specific contracts
└─────────────────────────────────────────────┘
```

## File Map

| File | Responsibility |
|---|---|
| `types.ts` | All domain types: ProviderCategory, Capability, ConnectionConfig, CredentialStore, IntegrationHealthReport, SyncJob, WebhookConfig, etc. |
| `integration-provider.ts` | Base `IntegrationProvider` interface + 13 specialized interfaces (ERP, Bank, Accounting, CRM, Payroll, HR, Email, Storage, AI, Payment, Tax, Identity) |
| `integration-registry.ts` | Register/discover/resolve providers. Stores `ProviderConfig` and `IntegrationProvider` instances. |
| `integration-factory.ts` | Create providers with DI container support, config validation, dependency injection |
| `connection-manager.ts` | Full connection lifecycle: create, update, delete, enable, validate, authenticate, audit |
| `credential-manager.ts` | Encrypted credential storage, KMS integration, rotation, expiration warnings, secret references |
| `health-monitor.ts` | Health checks, diagnostics, health scoring (0-100), trend tracking, aggregated reporting |
| `capability-discovery.ts` | Formal capability declarations, provider matching by capability/flag, cacheable |
| `event-bus.ts` | Typed event system with per-type and global handlers, event history (500 per connection) |
| `observability.ts` | Metrics, tracing spans, structured logging — graceful degradation if infra unavailable |

## Key Design Decisions

1. **No provider-specific code** — All 13 provider interfaces are TypeScript contracts only. SAP, Oracle, QuickBooks, bank implementations belong in separate packages.
2. **Encryption-first credentials** — Secrets are encrypted at rest (AES-256-GCM or KMS). Plaintext never stored. Credentials expire and can be rotated.
3. **Health scoring (0-100)** — Weighted calculation: status (-75 unhealthy, -25 degraded), latency (-15 if >5s), consecutive failures (-5 each), availability multiplier.
4. **Capability discovery with cache** — `getCapabilityDeclaration()` lazily builds and caches declarations per provider. Cache invalidated on provider update.
5. **Event bus with history** — Two event types: `EventType` (business events like `payment.created`) and `IntegrationEventType` (infrastructure events like `integration.credential.rotated`). Each retained up to 500 entries per connection.
6. **Graceful degradation** — Observability captures metrics/tracing/logger availability in try-catch. If infra isn't initialized, calls are safe no-ops.

## Provider Contract

Every provider must implement the `IntegrationProvider` interface:

```typescript
interface IntegrationProvider {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly category: ProviderCategory;

  initialize(config: ProviderConfig): Promise<void>;
  connect(config: ConnectionConfig): Promise<void>;
  disconnect(config: ConnectionConfig): Promise<void>;
  authenticate(config: ConnectionConfig): Promise<boolean>;
  checkHealth(config: ConnectionConfig): Promise<HealthResult>;
  diagnose(config: ConnectionConfig): Promise<HealthDiagnostics>;
  getCapabilities(): Promise<ProviderCapabilities>;
  getRateLimit(): { limit: number; windowMs: number };
}
```

Then extend with category-specific interfaces (e.g. `ERPProvider` adds `syncEntity(entityType, cursor)`).

## Authentication Methods

Supported: oauth2, oidc, api_key, bearer_token, basic_auth, client_credentials, jwt, mutual_tls

Credentials are stored encrypted with expiration support. Rotation increments version. KMS integration available via `setKMSProvider()`.

## Health System

- `checkConnectionHealth()` — executes provider.checkHealth() and stores report
- `diagnoseConnection()` — checks reachability, auth, latency, API version
- `getHealthReport()` — latest report for a connection
- `getHealthTrend()` — last N reports
- `getAggregatedHealth()` — per-company summary with avg health score
- `getUnhealthyConnections()` — returns connections with degraded/unhealthy status

Health score formula: `max(0, min(100, baseScore - latencyPenalty - failPenalty) * (availability/100))`

## Credential Manager

- `storeCredentials()` — encrypts + stores with optional expiry
- `getCredentials()` — decrypts on first access, caches in-memory
- `rotateCredentials()` — re-encrypts with new key, increments version
- `validateCredentials()` — calls provider.authenticate()
- `resolveSecretRef()` — resolves env/file/KMS secret references
- Expiration warning emitted 7 days before expiry via event bus
- KMS provider interface supports encrypt/decrypt/generateKey/rotateKey

## Event Model

| Domain | Example Events |
|---|---|
| Connection lifecycle | created, updated, deleted, failed, reconnected |
| Sync lifecycle | started, completed, failed |
| Webhook lifecycle | received, delivered, failed |
| Provider status | unavailable, healthy |
| Credential lifecycle | expiring, expired, rotated |
| Retry lifecycle | scheduled, exhausted |
| Health lifecycle | degraded, restored |

## Observability Integration

- `emitIntegrationDomainEvent()` — fires typed events through event bus
- `recordIntegrationMetric()` — increment counters on `integration.*` metrics
- `recordIntegrationHistogram()` — record latency histograms on `integration.*`
- `logIntegrationEvent()` — structured logging at info/warn/error
- `createIntegrationSpan()` — distributed tracing spans for operations

All methods gracefully degrade if the observability infrastructure is not initialized.

## Testing Strategy

Tests for the integration core should be provider-agnostic:
- Mock `IntegrationProvider` for registry/factory/connection tests
- Use deterministic UUIDs for credential store tests
- Health monitor tests can inject controlled `checkHealth()` responses
- Event bus tests verify handler invocation and history limits
