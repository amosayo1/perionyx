# Integration Platform

**Platform**: IntegrationPlatform
**Contract**: IntegrationContract
**Mission**: Serve as the unified boundary between Perionyx and all external systems — managing connector lifecycle, credential security, sync orchestration, data validation, conflict resolution, and audit trails for every integration.
**Status**: Partially Built (ConnectorPlatform 21+ files, IntegrationPlatform 14 files, Integrations 6 files, server integrations 23 files)
**Constitutional Authority**: PLATFORM_CONSTITUTION.md — Law 1 ("Business Domains Never Import Provider SDKs"), Law 5 ("Every External Dependency Is Observable")

---

## Responsibilities

1. **Manage** connector lifecycle (install, configure, authenticate, connect, disconnect, retire)
2. **Orchestrate** data synchronization between Perionyx and external systems
3. **Secure** credentials with AES-256-GCM encryption at rest
4. **Validate** synced data against business rules and data quality standards
5. **Resolve** conflicts when local and remote data diverge
6. **Track** data lineage from source through transformations to destination
7. **Monitor** connector health with continuous health checks and diagnostics
8. **Audit** every integration action (install, sync, error, credential access)
9. **Discover** available providers and their capabilities
10. **Route** requests through the appropriate provider driver
11. **Handle** webhooks from external systems (signature verification, normalization)
12. **Enforce** rate limits, retries, and circuit breakers per provider
13. **Manage** OAuth token refresh and credential rotation
14. **Provide** sandbox environments for testing integrations

---

## Public API (Capability Contract)

### IntegrationContract

```typescript
interface IntegrationContract {
  // Connector Lifecycle
  installConnector(ctx: TenantContext, config: ConnectorConfig): Promise<InstallResult>;
  validateConnector(ctx: TenantContext, configId: string): Promise<ValidationResult>;
  authenticateConnector(ctx: TenantContext, configId: string, credentials: Record<string, string>): Promise<AuthResult>;
  connectConnector(ctx: TenantContext, configId: string): Promise<HealthStatus>;
  disconnectConnector(ctx: TenantContext, configId: string): Promise<void>;
  getConnectorHealth(ctx: TenantContext, configId: string): Promise<HealthStatus>;

  // Discovery
  discoverProviders(query: DiscoveryQuery): Promise<ConnectorMetadata[]>;
  getProviderInfo(kind: ConnectorKind): Promise<ConnectorMetadata | undefined>;
  
  // Sync
  syncData(ctx: TenantContext, configId: string, options?: SyncOptions): Promise<SyncResult>;
  getSyncHistory(ctx: TenantContext, configId: string): Promise<SyncHistory[]>;
  
  // Validation
  validateSyncedData(ctx: TenantContext, instanceId: string): Promise<ValidationIssue[]>;
  resolveConflict(ctx: TenantContext, conflictId: string, resolution: ConflictResolution): Promise<void>;
  
  // Lineage
  getLineage(ctx: TenantContext, sourceType: string, sourceId: string): Promise<LineageRecord[]>;
  
  // Credentials
  rotateCredential(ctx: TenantContext, instanceId: string, key: string): Promise<void>;
  
  // Webhooks
  handleWebhook(provider: string, payload: unknown, signature: string): Promise<WebhookResult>;
}
```

---

## Internal API

### Service Architecture

The Integration Platform spans four code locations:

| Layer | Location | Purpose |
|---|---|---|
| **Connector Platform** | `src/modules/connector-platform/` (21+ files) | Driver registry, lifecycle, events, webhooks, auth, sync, jobs |
| **Integration Platform** | `src/modules/integration-platform/` (14 files) | Validation, audit, lineage, conflict, CSV mapping, sandbox, ERP/banking framework |
| **Integrations** | `src/modules/integrations/` (6 files) | Domain-specific integration services |
| **Server Integrations** | `src/server/integrations/` (23 files) | Infrastructure-level integration services, event bus |

### Key Services

| Service | Location | Responsibility |
|---|---|---|
| `ConnectorPlatformRegistry` | `connector-platform/registry.ts` | Driver factory + instance management |
| `ConnectorLifecycle` | `connector-platform/lifecycle.ts` | Install, validate, authenticate, connect, disconnect |
| `ConnectorDiscovery` | `connector-platform/discovery.ts` | Provider search and capability discovery |
| `ConnectorOrchestrator` | `connector-platform/orchestrator/orchestrator.ts` | Multi-connector operation coordination |
| `SyncEngine` | `integration-platform/sync-engine.service.ts` | Sync orchestration with checkpointing |
| `ValidationEngine` | `integration-platform/validation-engine.service.ts` | Data quality validation |
| `ConflictResolution` | `integration-platform/conflict-resolution.service.ts` | Local/remote conflict resolution |
| `DataLineage` | `integration-platform/data-lineage.service.ts` | Source-to-destination tracking |
| `IntegrationAudit` | `integration-platform/integration-audit.service.ts` | Integration action audit trail |
| `CredentialManager` | `integration-platform/credential-manager.service.ts` | Encrypted credential storage |
| `CSVMapping` | `integration-platform/csv-mapping.service.ts` | CSV/Excel import mapping |
| `ExcelImport` | `integration-platform/excel-import.service.ts` | Excel file parsing and import |
| `SandboxService` | `integration-platform/sandbox.service.ts` | Test environment management |
| `IntegrationRegistry` | `integration-platform/integration-registry.ts` | Integration instance management |

### Event Bus

```typescript
// Located at: src/server/integrations/event-bus.ts (no-op after Phase 18.1A)
// Located at: src/modules/connector-platform/event-hooks.ts (active)
interface ConnectorEventBus {
  publish(event: ConnectorEvent): Promise<void>;
  subscribe(eventType: ConnectorEventType, handler: EventHandler): void;
  unsubscribe(eventType: ConnectorEventType, handler: EventHandler): void;
}
```

---

## Events

### Connector Lifecycle Events

| Event | Description | Consumers |
|---|---|---|
| `connector:installed` | Connector installed | Audit, UI |
| `connector:configured` | Config updated | Audit, UI |
| `connector:authenticated` | Auth succeeded | Audit, UI, Workflow |
| `connector:connected` | Connection established | Audit, UI, Sync |
| `connector:disconnected` | Connection severed | Audit, UI, Sync |
| `connector:validated` | Config validated | Audit, UI |
| `connector:health-check` | Health check completed | Monitoring, UI |
| `connector:error` | Error occurred | Alerting, Audit |
| `connector:deleted` | Connector removed | Audit, UI |

### Sync Events

| Event | Description | Payload |
|---|---|---|
| `connector:sync-started` | Sync begun | configId, syncType |
| `connector:sync-completed` | Sync succeeded | configId, recordsProcessed |
| `connector:sync-failed` | Sync failed | configId, error |

### Event Location

```typescript
// Located at: src/modules/connector-platform/event-hooks.ts
const connectorEventBus = {
  publish(event: ConnectorEvent): Promise<void>;
  subscribe(type: string, handler: Function): void;
};
```

---

## Commands

| Command | Description | Permission |
|---|---|---|
| `installConnector` | Install new connector | `connector.install` |
| `configureConnector` | Update connector config | `connector.configure` |
| `authenticateConnector` | Authenticate with provider | `connector.authenticate` |
| `connectConnector` | Establish connection | `connector.connect` |
| `disconnectConnector` | Sever connection | `connector.connect` |
| `deleteConnector` | Remove connector | `connector.delete` |
| `triggerSync` | Manual sync | `connector.sync` |
| `resolveConflict` | Resolve data conflict | `connector.write` |
| `rotateCredential` | Rotate provider credential | `connector.admin` |

---

## Queries

| Query | Description | Cacheable |
|---|---|---|
| `listConnectors` | List company connectors | Yes (30s) |
| `getConnector` | Get connector by ID | Yes (30s) |
| `getConnectorHealth` | Health status | No (30s TTL) |
| `getSyncHistory` | Sync history for connector | Yes (60s) |
| `getValidationIssues` | Unresolved issues | No |
| `getLineage` | Data lineage chain | Yes (60s) |
| `discoverProviders` | Available providers | Yes (1hr) |

---

## Errors

| Code | Description | Recovery |
|---|---|---|
| `CONNECTOR_NOT_FOUND` | Config ID does not exist | Check config |
| `CONNECTOR_NOT_INITIALIZED` | Driver not loaded | Re-initialize |
| `AUTHENTICATION_FAILED` | Provider auth failed | Re-authenticate |
| `CONFIGURATION_ERROR` | Invalid config | Fix config |
| `SYNC_FAILED` | Sync error | Retry or check provider |
| `VALIDATION_FAILED` | Data quality issue | Review and resolve |
| `CONFLICT_DETECTED` | Local/remote divergence | Manual resolution |
| `CREDENTIAL_EXPIRED` | Token expired | Refresh or re-auth |
| `WEBHOOK_SIGNATURE_INVALID` | Webhook tampered | Security investigation |

---

## Security Model

### Credential Security

1. **Encryption**: AES-256-GCM for all stored credentials
   - Source: `src/server/security/encryption.ts`
   - Also: `src/modules/connector-platform/secrets.ts`
2. **No plaintext**: Credentials never returned in API responses
3. **Access audit**: Every credential access logged to audit trail
4. **Rotation support**: `rotateCredential` command for proactive rotation
5. **Tenant isolation**: Credentials scoped to company — cross-tenant access blocked

### Webhook Security

1. **Signature verification**: HMAC-SHA256 per provider
   - Source: `src/modules/connector-platform/webhook-bridge.ts`
   - Handlers: `plaid-webhook-handler.ts`, `quickbooks-webhook-handler.ts`
2. **Replay protection**: Nonce + timestamp (5-minute window)
3. **IP allowlisting**: Where provider supports it

### API Security

1. **Rate limiting**: Per-tenant, per-provider limits
2. **Input validation**: Zod schemas on all config inputs
3. **Audit logging**: Every mutation logged
4. **CSRF protection**: Origin validation on state-changing endpoints

---

## Permission Model

| Domain | Read | Write | Admin |
|---|---|---|---|
| Connectors | `connector.read` | `connector.write` | `connector.admin` |
| Sync | `connector.read` | `connector.sync` | `connector.admin` |
| Credentials | `connector.read` | `connector.authenticate` | `connector.admin` |
| Webhooks | `connector.read` | N/A (system) | `connector.admin` |
| Validation | `connector.read` | `connector.write` | `connector.admin` |

---

## Observability

### Metrics

| Metric | Type | Labels |
|---|---|---|
| `integration_sync_duration_ms` | Histogram | connector, sync_type, status |
| `integration_sync_records_total` | Counter | connector, status, direction |
| `integration_validation_issues_total` | Counter | connector, category, severity |
| `integration_conflict_total` | Counter | connector, resolution |
| `integration_webhook_received_total` | Counter | connector, event_type |
| `integration_credential_access_total` | Counter | connector, operation |
| `integration_lineage_depth` | Histogram | connector, entity_type |

### Tracing

```
Span: integration.sync.{connector}
  Parent: contract.integration.syncData
  Attributes:
    integration.connector = "plaid"
    integration.sync_type = "incremental"
    integration.records_processed = 150
    integration.records_created = 12
    integration.records_updated = 3
  Events:
    integration.sync.start
    integration.sync.fetch
    integration.sync.transform
    integration.sync.validate
    integration.sync.persist
    integration.sync.complete
```

### Structured Logging

```json
{
  "level": "info",
  "message": "integration.sync.completed",
  "connector": "plaid",
  "companyId": "company_abc",
  "syncType": "incremental",
  "recordsProcessed": 150,
  "recordsCreated": 12,
  "recordsUpdated": 3,
  "durationMs": 3420,
  "correlationId": "req_xyz"
}
```

---

## Metrics

| Metric | Description | Alert |
|---|---|---|
| Sync success rate | % successful syncs | < 99% |
| Sync latency p95 | 95th percentile sync time | > 30s |
| Validation issue rate | Issues per 1000 records | > 10 |
| Conflict rate | Conflicts per sync | > 5% |
| Webhook processing latency | Receipt to processing time | > 5s |
| Credential expiry approaching | Tokens expiring in < 24h | > 0 |

---

## Rate Limiting

Per-tenant, per-connector rate limits:

| Operation | Limit | Window | Burst |
|---|---|---|---|
| Sync trigger | 10/hour | Rolling | 3 |
| Install | 5/day | Rolling | 1 |
| Authenticate | 10/hour | Rolling | 3 |
| Health check | 30/hour | Rolling | 10 |
| Webhook receipt | 1000/hour | Rolling | 50 |

---

## Retry Policy

| Operation | Max Retries | Backoff | Jitter |
|---|---|---|---|
| Sync (transient error) | 3 | Exponential 1s-4s | ±500ms |
| Sync (rate limited) | 3 | Respect retry-after | N/A |
| OAuth token refresh | 2 | Fixed 5s | ±1s |
| Webhook processing | 3 | Exponential 1s-8s | ±1s |

---

## Circuit Breakers

Per-connector circuit breakers (inherited from Provider Driver Model):

| Threshold | Value | Purpose |
|---|---|---|
| Failure count to trip | 5 | Isolate failing providers |
| Recovery timeout | 30s | Periodic probe |
| Half-open max calls | 1 | Validate recovery |

---

## Caching

| Data | TTL | Location | Notes |
|---|---|---|---|
| Connector configs | 30s | Memory + DB | Refresh on mutation |
| Provider capabilities | 1hr | Memory | Refresh on discovery |
| Sync checkpoints | Persisted | DB | Resume after restart |
| Health status | 30s | Memory | Health check TTL |
| Import templates | 5min | Memory | Refresh on mutation |

---

## Versioning

| Component | Versioning | Policy |
|---|---|---|
| IntegrationContract | semver | Major for breaking changes |
| Connector configs | Optimistic locking | Version field on updates |
| Sync checkpoints | Append-only | Checkpoint IDs for resume |
| Webhook schemas | Provider-controlled | Driver adapts |

---

## Lifecycle

### Integration Lifecycle

```
Discover → Install → Configure → Authenticate → Connect → Sync → Monitor → Retire
            ↓                     ↓              ↓
         Validation           Token Refresh  Health Check
```

### Connector State Machine

```
configuring → authenticated → connected → active → disabled
     ↓              ↓             ↓           ↓
   error          error         error      expired
```

---

## Extension Model

### Adding a New Integration Category

1. **Define** the integration category in `ConnectorCategory` type
2. **Implement** `IConnector` interface for the new provider
3. **Register** factory in `ConnectorPlatformRegistry`
4. **Add** to `ConnectorDiscovery` metadata
5. **Implement** webhook handler (if applicable)
6. **Add** sync engine for the new data type
7. **Write** validation rules for new data
8. **Document** provider-specific quirks

### Framework Pattern

```typescript
// ERP Framework — base class for ERP integrations
// Located at: src/modules/integration-platform/erp-framework/erp-base.ts
abstract class ErpIntegrationBase {
  abstract syncVendors(): Promise<SyncResult>;
  abstract syncInvoices(): Promise<SyncResult>;
  abstract syncPayments(): Promise<SyncResult>;
  abstract exportJournalEntries(entries: JournalEntry[]): Promise<ExportResult>;
}

// Banking Framework — base class for banking integrations
// Located at: src/modules/integration-platform/banking-framework/banking-base.ts
abstract class BankingIntegrationBase {
  abstract syncAccounts(): Promise<SyncResult>;
  abstract syncTransactions(): Promise<SyncResult>;
  abstract syncBalances(): Promise<SyncResult>;
}
```

---

## Provider Model

### Provider Registry

```typescript
// Located at: src/modules/integration-platform/integration-registry.ts
interface IntegrationRegistry {
  register(def: ConnectorDefinition): void;
  get(id: string): ConnectorDefinition | undefined;
  list(): ConnectorDefinition[];
  listByCategory(category: ConnectorCategory): ConnectorDefinition[];
}
```

### Supported Providers

| Provider | Category | Status | Sync Types |
|---|---|---|---|
| Plaid | Banking | Built | Accounts, Transactions, Balances |
| QuickBooks | ERP/Accounting | Built | Vendors, Invoices, Payments, GL |
| SAP S/4HANA | ERP | Scaffolded | Business Partners, Invoices |
| NetSuite | ERP | Scaffolded | Vendors, Bills, Payments |
| Dynamics 365 | ERP | Scaffolded | Vendors, Invoices |
| Slack | Communication | Built | Channel messages |
| Teams | Communication | Scaffolded | Channel messages |
| Custom REST | Custom | Built | Any endpoint |
| CSV/Excel | File Import | Built | Tabular data |
| SFTP | File | Scaffolded | File transfer |

---

## Testing Strategy

| Test Type | Scope | Frequency |
|---|---|---|
| Unit | Driver error translation, validation rules | Every PR |
| Integration | Provider sandbox sync | Every PR (Plaid), Nightly (others) |
| E2E | Install → Auth → Connect → Sync flow | Nightly |
| Contract | Driver interface compliance | Every PR |
| Performance | Sync throughput, latency | Weekly |

---

## Failure Modes

| Failure | Impact | Recovery |
|---|---|---|
| Provider outage | Sync fails for that connector | Circuit breaker isolates; cached data served |
| Credential leak | Potential unauthorized access | Immediate rotation; audit log reviewed |
| Webhook replay | Duplicate event processing | Nonce validation rejects; idempotency handling |
| Sync corruption | Bad data in database | Validation catches; conflict resolution |
| OAuth expiry | Auth failures | Automatic token refresh |
| Rate limit | Sync delays | Exponential backoff; queued retries |

---

## Recovery Strategy

1. **Provider Outage**: Circuit breaker opens; cached sync data served; sync retried after recovery
2. **Credential Compromise**: Rotate via `rotateCredential`; revoke old token; audit trail reviewed
3. **Data Corruption**: Validation issues logged; conflict resolution workflow triggered
4. **Sync Failure**: Checkpoint saved; resume from last checkpoint on retry
5. **Webhook Loss**: Idempotent processing; periodic full sync as fallback
6. **Registry Corruption**: Restart rebuilds from Prisma config records
