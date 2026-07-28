# Banking Platform

**Platform**: BankingPlatform
**Contract**: BankingContract
**Mission**: Integrate Perionyx with banking systems — connecting accounts, syncing transactions and balances, managing payments, and providing real-time financial visibility across all banking relationships.
**Status**: Partially Built (Plaid adapter, account hierarchy, orchestrator, sync engine, payment service, monitoring — 126 files in `src/server/banking/`)
**Constitutional Authority**: PLATFORM_CONSTITUTION.md — Law 1 ("Business Domains Never Import Provider SDKs"), Law 5 ("Every External Dependency Is Observable"), Law 6 ("Financial Integrity Is Never Compromised")

---

## Responsibilities

1. **Connect** to bank accounts via Plaid and other banking providers
2. **Sync** transactions with full history, incremental updates, and real-time webhooks
3. **Sync** account balances (current, available) with change detection
4. **Manage** multi-account hierarchies (operating, savings, investment, escrow)
5. **Process** payment initiation across multiple payment rails (ACH, wire, SEPA, SWIFT)
6. **Monitor** connection health with continuous health checks and diagnostics
7. **Route** requests through provider selection engine for optimal provider choice
8. **Enforce** per-provider rate limits, retries, and circuit breakers
9. **Manage** credential vault with AES-256-GCM encryption
10. **Detect** anomalous transactions via compliance monitoring
11. **Provide** real-time treasury visibility via balance and transaction feeds
12. **Handle** webhook events (transaction updates, balance changes, connection status)
13. **Support** multi-region banking (US, EU, UK, APAC)
14. **Orchestrate** failover between providers when primary is unavailable

---

## Public API (Capability Contract)

### BankingContract

```typescript
interface BankingContract {
  // Account Management
  searchInstitutions(query: string, country?: string): Promise<BankInstitution[]>;
  createConnectionLink(params: ConnectionLinkParams): Promise<ConnectionLinkResult>;
  authenticateConnection(auth: AuthenticateConnectionParams): Promise<AuthenticationResult>;
  revokeConnection(connectionId: string): Promise<void>;
  
  // Account Sync
  listAccounts(connectionId: string): Promise<BankAccount[]>;
  getAccount(connectionId: string, accountId: string): Promise<BankAccount | null>;
  syncBalances(connectionId: string, accountIds: string[]): Promise<BalanceSyncResult>;
  
  // Transaction Sync
  syncTransactions(connectionId: string, accountIds: string[], options: SyncOptions): Promise<SyncResult>;
  getStatements(connectionId: string, accountId: string, from: string, to: string): Promise<StatementResult>;
  
  // Payments
  initiatePayment(connectionId: string, payment: PaymentInitiationRequest): Promise<PaymentInitiationResult>;
  getPaymentStatus(connectionId: string, paymentId: string): Promise<PaymentStatusResult>;
  
  // Health & Monitoring
  getConnectionHealth(connectionId: string): Promise<ConnectionHealth>;
  getProviderHealth(providerKind: string): Promise<ProviderHealth>;
  
  // Webhooks
  handleWebhook(providerKind: string, payload: unknown): Promise<WebhookEvent[]>;
  
  // Provider Selection
  selectProvider(query: ProviderSelectionQuery): Promise<BankProviderKind>;
  getProviderCapabilities(providerKind: string): Promise<ProviderCapabilityManifest>;
}
```

---

## Internal API

### Module Architecture (126 files in `src/server/banking/`)

| Module | Location | Purpose |
|---|---|---|
| **Domain** | `banking/domain/types.ts` | Core banking types, enums, interfaces |
| **Providers** | `banking/providers/` | Provider interface, registry, routing, selection, ranking, capabilities, config, diagnostics, regions |
| **Connections** | `banking/connections/` | Connection manager, authentication service |
| **Sync** | `banking/sync/` | Sync engine, orchestrator, incremental, historical, checkpoint, queue, state, reconciliation, scheduler, metrics, monitoring |
| **Payments** | `banking/payments/` | Payment service with order lifecycle |
| **Orchestrator** | `banking/orchestrator/` | Execution engine, routing, failover, retry, circuit breaker, dead letter, pipeline, queue, audit |
| **Security** | `banking/security/` | Credential vault, audit service |
| **Treasury** | `banking/treasury/` | Treasury banking service |
| **Monitoring** | `banking/monitoring/` | Dashboard, diagnostics, alerts, connections, providers, status, health, metrics, history |
| **Health** | `banking/health/` | Health monitor |
| **Compliance** | `banking/compliance/` | Compliance service |
| **Workspace** | `banking/workspace/` | Workspace data and types |
| **Accounts** | `banking/accounts/` | Account validation, relationships |

### Provider Interface

```typescript
// Located at: src/server/banking/providers/interface.ts
interface IBankProvider {
  readonly kind: BankProviderKind;
  
  initialize(config: ProviderInitConfig): Promise<void>;
  getManifest(): ProviderCapabilityManifest;
  
  searchInstitutions(query: string, country?: string): Promise<BankInstitution[]>;
  getInstitution(institutionId: string): Promise<BankInstitution | null>;
  
  createConnectionLink(params: ConnectionLinkParams): Promise<ConnectionLinkResult>;
  authenticateConnection(auth: AuthenticateConnectionParams): Promise<AuthenticationResult>;
  getConnectionStatus(connection: BankConnection): Promise<ConnectionHealth>;
  refreshConnection?(connection: BankConnection): Promise<void>;
  revokeConnection(connection: BankConnection): Promise<void>;
  
  listAccounts(connection: BankConnection): Promise<BankAccount[]>;
  getAccount(connection: BankConnection, accountId: string): Promise<BankAccount | null>;
  
  syncTransactions(connection, accounts, options, onProgress): Promise<SyncResult>;
  syncBalances(connection, accounts): Promise<BalanceSyncResult>;
  getStatement(connection, account, fromDate, toDate): Promise<StatementResult>;
  
  initiatePayment(connection, payment): Promise<PaymentInitiationResult>;
  getPaymentStatus(connection, paymentId): Promise<PaymentStatusResult>;
  
  subscribeToWebhooks?(webhookUrl: string, events: BankingEventType[]): Promise<WebhookSubscriptionResult>;
  unsubscribeFromWebhooks?(subscriptionId: string): Promise<void>;
  handleWebhook?(payload: unknown): Promise<WebhookEvent[]>;
  
  getRateLimits(): RateLimitConfig;
  isHealthy(): Promise<boolean>;
}
```

### Provider Selection Engine

```typescript
// Located at: src/server/banking/providers/selection/engine.ts
interface ProviderSelectionEngine {
  selectOptimalProvider(query: ProviderSelectionQuery): BankProviderKind;
  rankProviders(candidates: BankProviderKind[]): RankedProvider[];
}
```

### Connection Manager

```typescript
// Located at: src/server/banking/connections/connection-manager.ts
interface ConnectionManager {
  createConnection(params: CreateConnectionParams): Promise<BankConnection>;
  getConnection(connectionId: string): Promise<BankConnection | null>;
  listConnections(companyId: string): Promise<BankConnection[]>;
  updateConnection(connectionId: string, updates: Partial<BankConnection>): Promise<void>;
  deleteConnection(connectionId: string): Promise<void>;
}
```

### Sync Engine

```typescript
// Located at: src/server/banking/sync/sync-engine.ts
interface SyncEngine {
  syncTransactions(connectionId: string, options: SyncOptions): Promise<SyncResult>;
  syncBalances(connectionId: string): Promise<BalanceSyncResult>;
  getSyncState(connectionId: string): Promise<SyncState>;
  resumeSync(connectionId: string): Promise<SyncResult>;
}
```

---

## Events

### Banking Lifecycle Events

| Event | Description | Payload |
|---|---|---|
| `banking:connection-created` | Bank connection established | connectionId, providerKind, institutionId |
| `banking:connection-authenticated` | Connection authenticated | connectionId |
| `banking:connection-revoked` | Connection severed | connectionId |
| `banking:connection-health-changed` | Health status changed | connectionId, oldStatus, newStatus |
| `banking:transaction-sync-started` | Transaction sync begun | connectionId, accountIds |
| `banking:transaction-sync-completed` | Transaction sync succeeded | connectionId, recordsProcessed |
| `banking:transaction-sync-failed` | Transaction sync failed | connectionId, error |
| `banking:balance-sync-completed` | Balance sync succeeded | connectionId, accountsUpdated |
| `banking:payment-initiated` | Payment started | connectionId, paymentId, amount |
| `banking:payment-settled` | Payment completed | connectionId, paymentId |
| `banking:payment-failed` | Payment failed | connectionId, paymentId, reason |
| `banking:webhook-received` | Webhook from provider | providerKind, eventType |
| `banking:provider-degraded` | Provider health degraded | providerKind, reason |
| `banking:provider-recovered` | Provider health recovered | providerKind |

---

## Commands

| Command | Description | Permission |
|---|---|---|
| `createBankConnection` | Connect to bank | `banking.connect` |
| `revokeBankConnection` | Disconnect bank | `banking.connect` |
| `triggerTransactionSync` | Manual sync | `banking.sync` |
| `triggerBalanceSync` | Manual balance sync | `banking.sync` |
| `initiateBankPayment` | Start payment | `banking.pay` |
| `cancelBankPayment` | Cancel payment | `banking.pay` |
| `refreshConnectionToken` | Refresh OAuth | `banking.connect` |

---

## Queries

| Query | Description | Cacheable |
|---|---|---|
| `listBankConnections` | List connections | Yes (30s) |
| `getBankConnection` | Get connection by ID | Yes (30s) |
| `listBankAccounts` | List accounts | Yes (30s) |
| `getBankAccount` | Get account by ID | Yes (30s) |
| `getTransactionHistory` | Transaction history | Yes (60s) |
| `getConnectionHealth` | Health status | No (30s TTL) |
| `getPaymentStatus` | Payment status | No |
| `searchInstitutions` | Search banks | Yes (1hr) |
| `getProviderManifest` | Provider capabilities | Yes (1hr) |

---

## Errors

| Code | Description | Recovery |
|---|---|---|
| `BANK_CONNECTION_NOT_FOUND` | Connection does not exist | Check connection ID |
| `BANK_AUTH_FAILED` | Plaid/provider auth failed | Re-authenticate |
| `BANK_SYNC_FAILED` | Transaction sync error | Retry with backoff |
| `BANK_RATE_LIMITED` | Provider rate limit | Wait + retry |
| `BANK_PAYMENT_FAILED` | Payment rejected | Check details |
| `BANK_PAYMENT_SETTLEMENT_FAILED` | Payment not settled | Check with bank |
| `BANK_CONNECTION_EXPIRED` | Token expired | Refresh token |
| `BANK_PROVIDER_UNAVAILABLE` | Provider down | Failover to alt provider |
| `BANK_WEBHOOK_INVALID` | Signature invalid | Security investigation |
| `BANK_DATA_INTEGRITY_ERROR` | Balance mismatch | Reconcile |

---

## Security Model

### Credential Vault

```typescript
// Located at: src/server/banking/security/credential-vault.ts
interface CredentialVault {
  store(connectionId: string, credentials: EncryptedCredentials): Promise<void>;
  retrieve(connectionId: string): Promise<EncryptedCredentials>;
  rotate(connectionId: string): Promise<void>;
  revoke(connectionId: string): Promise<void>;
}
```

### Security Controls

1. **Encryption at rest**: AES-256-GCM for all banking credentials
2. **Encryption in transit**: TLS 1.3 for all provider API calls
3. **Token isolation**: Each connection has its own encrypted token store
4. **Audit logging**: Every credential access, payment, and sync logged
   - Source: `src/server/banking/security/audit-service.ts`
5. **Webhook verification**: HMAC-SHA256 signature validation
   - Source: `src/modules/connector-platform/webhooks/plaid-webhook-handler.ts`
6. **PCI considerations**: No card data stored — payments initiated via provider tokens

### Banking Audit

```typescript
// Located at: src/server/banking/security/audit-service.ts
interface BankingAuditService {
  logConnection(params: AuditParams): Promise<void>;
  logSync(params: AuditParams): Promise<void>;
  logPayment(params: AuditParams): Promise<void>;
  logCredentialAccess(params: AuditParams): Promise<void>;
}
```

---

## Permission Model

| Operation | Permission | MFA | Description |
|---|---|---|---|
| View connections | `banking.read` | No | View bank connections |
| Connect to bank | `banking.connect` | No | Create new connection |
| Sync transactions | `banking.sync` | No | Trigger sync |
| View balances | `banking.read` | No | View account balances |
| Initiate payment | `banking.pay` | Yes | Start payment |
| Cancel payment | `banking.pay` | Yes | Cancel pending payment |
| Revoke connection | `banking.connect` | Yes | Sever bank connection |
| Manage banking | `banking.admin` | Yes | Administer platform |

---

## Observability

### Metrics

| Metric | Type | Labels |
|---|---|---|
| `banking_sync_duration_ms` | Histogram | provider, sync_type, status |
| `banking_sync_records_total` | Counter | provider, entity_type, operation |
| `banking_balance_accuracy` | Gauge | provider, account_type |
| `banking_payment_initiated_total` | Counter | provider, payment_rail, status |
| `banking_payment_settled_total` | Counter | provider, payment_rail |
| `banking_webhook_received_total` | Counter | provider, event_type |
| `banking_webhook_processing_ms` | Histogram | provider, event_type |
| `banking_connection_health` | Gauge | provider, connection_id |
| `banking_provider_latency_ms` | Histogram | provider, operation |
| `banking_rate_limit_hits_total` | Counter | provider |
| `banking_circuit_breaker_trips_total` | Counter | provider |

### Tracing

```
Span: banking.sync.transactions.{connectionId}
  Parent: contract.banking.syncTransactions
  Attributes:
    banking.provider = "plaid"
    banking.connection_id = "conn_123"
    banking.account_count = 3
    banking.start_date = "2024-01-01"
    banking.end_date = "2024-01-31"
    banking.records_created = 150
    banking.records_updated = 3
  Events:
    banking.sync.start
    banking.provider.fetch
    banking.transform
    banking.validate
    banking.persist
    banking.reconcile
    banking.sync.complete
```

---

## Metrics

### Dashboard Metrics

| Metric | Description | Alert |
|---|---|---|
| Sync success rate | % successful syncs | < 99% |
| Sync latency p95 | 95th percentile | > 30s |
| Balance accuracy | % accounts balanced | < 100% |
| Payment success rate | % successful payments | < 99.5% |
| Payment settlement time | Hours to settle | > 48h |
| Connection health score | Provider health | < 80 |
| Webhook processing latency | Receipt to processing | > 5s |

---

## Rate Limiting

| Provider | Global Limit | Transaction Sync | Balance Sync |
|---|---|---|---|
| Plaid | 1000/min | 500/min | 200/min |
| Open Banking | Provider-specific | Provider-specific | Provider-specific |
| SWIFT | 100/min | N/A | N/A |

---

## Retry Policy

| Operation | Max Retries | Backoff | Jitter |
|---|---|---|---|
| Transaction sync | 3 | Exponential 2s-8s | ±1s |
| Balance sync | 3 | Exponential 1s-4s | ±500ms |
| Payment initiation | 2 | Exponential 5s-20s | ±2s |
| Webhook processing | 3 | Exponential 1s-8s | ±1s |
| Token refresh | 2 | Fixed 5s | ±1s |

---

## Circuit Breakers

```typescript
// Located at: src/server/banking/orchestrator/retry/circuit-breaker.ts
interface CircuitBreakerConfig {
  failureThreshold: number;     // 5 failures
  recoveryTimeoutMs: number;    // 30s
  halfOpenMaxCalls: number;     // 1
  successThreshold: number;     // 2
}
```

---

## Caching

| Data | TTL | Location | Invalidation |
|---|---|---|---|
| Institution search results | 1 hour | Memory | Stale-while-revalidate |
| Account data | 30 seconds | Memory + DB | Sync complete |
| Transaction data | 60 seconds | Memory + DB | Sync complete |
| Balance data | 30 seconds | Memory + DB | Sync complete |
| Provider capabilities | 1 hour | Memory | Provider update |
| Connection health | 30 seconds | Memory | Health check |

---

## Versioning

| Component | Versioning | Policy |
|---|---|---|
| BankingContract | semver | Major for breaking changes |
| Provider interface | semver | Major for breaking changes |
| Sync checkpoints | Append-only | Resume from checkpoint |
| Webhook schemas | Provider-controlled | Driver adapts |

---

## Lifecycle

### Banking Connection Lifecycle

```
Search Institution → Create Link → Authenticate → Connect →
  → Sync Transactions → Sync Balances → Monitor Health →
  → Initiate Payments → Revoke
```

### Sync Lifecycle

```
Trigger → Load Checkpoint → Fetch (from provider) → Transform → 
  → Validate → Deduplicate → Persist → Update Checkpoint → 
  → Reconcile → Emit Events → Audit Log
```

### Payment Lifecycle

```
Draft → Pending Approval → Approved → Submitted → Processing → 
  → Settled → Confirmed
  ↓ (at any point) → Failed / Rejected / Returned / Reversed / Cancelled
```

---

## Extension Model

### Adding a New Banking Provider

1. **Implement** `IBankProvider` from `src/server/banking/providers/interface.ts`
2. **Register** in provider registry: `src/server/banking/providers/registry/engine.ts`
3. **Add** to provider definitions: `src/server/banking/providers/definitions/`
4. **Configure** rate limits and retry policy
5. **Implement** webhook handler
6. **Add** to provider selection engine
7. **Write** contract compliance tests
8. **Document** provider-specific quirks

### Provider Selection

```typescript
// Located at: src/server/banking/providers/selection/engine.ts
// Factors: capability match, region, latency, cost, reliability score
interface ProviderSelectionQuery {
  requiredCapabilities: ProviderCapability[];
  region?: BankingRegion;
  paymentRail?: PaymentRail;
  institutionId?: string;
  preferredProvider?: BankProviderKind;
}
```

---

## Provider Model

### Current Providers

| Provider | Kind | Capabilities | Regions | Status |
|---|---|---|---|---|
| Plaid | `plaid` | Accounts, Transactions, Balances, Webhooks | US, EU, UK | Built |
| JP Morgan | `jpmorgan` | Accounts, Transactions, Payments | US | Defined |
| Citi | `citi` | Accounts, Transactions, Payments | Global | Defined |
| BofA | `bofa` | Accounts, Transactions, Payments | US | Defined |
| HSBC | `hsbc` | Accounts, Transactions, Payments | Global | Defined |

### Provider Capability Matrix

| Capability | Plaid | JP Morgan | Citi | BofA | HSBC |
|---|---|---|---|---|---|
| Account listing | Y | Planned | Planned | Planned | Planned |
| Transaction sync | Y | Planned | Planned | Planned | Planned |
| Balance sync | Y | Planned | Planned | Planned | Planned |
| Payment initiation | Y | Planned | Planned | Planned | Planned |
| Webhooks | Y | Planned | Planned | Planned | Planned |
| Historical sync | Y | Planned | Planned | Planned | Planned |
| Multi-currency | Limited | Planned | Planned | Planned | Planned |

---

## Testing Strategy

| Test | Scope | Frequency |
|---|---|---|
| Unit | Provider interface, sync logic | Every PR |
| Integration | Plaid sandbox | Every PR |
| E2E | Full connection → sync → payment flow | Nightly |
| Contract | Provider interface compliance | Every PR |
| Performance | 10K+ transaction sync | Weekly |
| Chaos | Provider outage, network failure | Weekly |

---

## Failure Modes

| Failure | Impact | Recovery |
|---|---|---|
| Provider outage | Sync fails | Circuit breaker; failover |
| Token expired | Auth failure | Automatic refresh |
| Rate limit hit | Sync delays | Exponential backoff |
| Balance mismatch | Reconciliation error | Reconcile + alert |
| Payment rejection | Payment fails | Retry or manual |
| Webhook loss | Missing updates | Periodic full sync |
| Data corruption | Bad transactions | Validation catches |

---

## Recovery Strategy

1. **Provider Outage**: Circuit breaker opens; cached data served; failover to alt provider
2. **Token Expiry**: Automatic refresh with 5-minute buffer; re-auth on failure
3. **Rate Limit**: Exponential backoff; rate limit state persisted
4. **Balance Mismatch**: Reconciliation engine detects; alerts for investigation
5. **Payment Failure**: Payment status updated; invoice status preserved; retry if transient
6. **Sync Corruption**: Checkpoint preserved; resume from last valid state
7. **Credential Leak**: Immediate rotation via vault; audit trail reviewed
