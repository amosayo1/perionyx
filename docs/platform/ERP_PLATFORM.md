# ERP Platform

**Platform**: ERPPlatform
**Contract**: ERPContract
**Mission**: Integrate Perionyx with enterprise resource planning systems (SAP, NetSuite, Dynamics 365, QuickBooks) — syncing vendors, invoices, payments, and GL entries while keeping business logic ERP-agnostic.
**Status**: Scaffolded (adapters exist in connector-platform; business integration not wired)
**Constitutional Authority**: PLATFORM_CONSTITUTION.md — Law 1 ("Business Domains Never Import Provider SDKs"), Law 2 ("Vendor Terminology Never Enters the Domain Model")

---

## Responsibilities

1. **Sync** vendor master data from ERP systems into Perionyx canonical vendor model
2. **Sync** invoices (AP) from ERP into Perionyx canonical invoice model
3. **Sync** payments (AP) from ERP and propagate payment status
4. **Export** journal entries from Perionyx GL to ERP GL module
5. **Sync** chart of accounts from ERP to Perionyx GL account structure
6. **Sync** purchase orders from ERP for three-way matching
7. **Validate** ERP data against Perionyx data quality standards
8. **Resolve** conflicts when ERP and Perionyx data diverge
9. **Track** data lineage from ERP source through transformations
10. **Translate** ERP-specific terminology to Perionyx canonical models
11. **Handle** ERP-specific authentication (OAuth2, mTLS, API keys)
12. **Manage** ERP connection health and sync scheduling
13. **Audit** every ERP data mutation in the Perionyx audit trail
14. **Support** multiple ERP systems simultaneously per tenant

---

## Public API (Capability Contract)

### ERPContract

```typescript
interface ERPContract {
  // Vendor Sync
  syncVendors(ctx: TenantContext, erpId: string, options?: SyncOptions): Promise<SyncResult>;
  getVendorMapping(ctx: TenantContext, erpId: string, vendorId: string): Promise<VendorMapping | null>;
  
  // Invoice Sync
  syncInvoices(ctx: TenantContext, erpId: string, options?: SyncOptions): Promise<SyncResult>;
  getInvoiceMapping(ctx: TenantContext, erpId: string, invoiceId: string): Promise<InvoiceMapping | null>;
  
  // Payment Sync
  syncPayments(ctx: TenantContext, erpId: string, options?: SyncOptions): Promise<SyncResult>;
  exportPayment(ctx: TenantContext, erpId: string, paymentId: string): Promise<ExportResult>;
  
  // GL Integration
  exportJournalEntries(ctx: TenantContext, erpId: string, entries: JournalEntry[]): Promise<ExportResult>;
  syncChartOfAccounts(ctx: TenantContext, erpId: string): Promise<SyncResult>;
  
  // PO Sync (for three-way matching)
  syncPurchaseOrders(ctx: TenantContext, erpId: string, options?: SyncOptions): Promise<SyncResult>;
  
  // Validation & Conflict
  validateErpData(ctx: TenantContext, erpId: string): Promise<ValidationIssue[]>;
  resolveConflict(ctx: TenantContext, conflictId: string, resolution: ConflictResolution): Promise<void>;
  
  // Health & Capabilities
  getErpHealth(ctx: TenantContext, erpId: string): Promise<ERPHealth>;
  getErpCapabilities(erpKind: string): Promise<ERPCapability[]>;
}
```

---

## Internal API

### Adapter Architecture

```
┌─────────────────────────────────────────────────────┐
│                   ERP Platform                      │
├─────────────────────────────────────────────────────┤
│  ERPContract (provider-agnostic interface)          │
├─────────────────────────────────────────────────────┤
│  ErpPlatformService (orchestration layer)           │
│  - Vendor sync orchestration                        │
│  - Invoice sync orchestration                       │
│  - GL export orchestration                          │
│  - Conflict resolution                              │
│  - Data lineage tracking                            │
├─────────────────────────────────────────────────────┤
│  Adapter Layer (provider-specific)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │   SAP    │ │ NetSuite │ │ Dynamics │ │  QBO   │ │
│  │ Connector│ │ Connector│ │ Connector│ │Connect │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
├─────────────────────────────────────────────────────┤
│  ErpConnectorBase (abstract base class)             │
│  - initialize, validateConfig, authenticate         │
│  - connect, disconnect, healthCheck                 │
│  - syncData, performHealthCheck, performSync        │
└─────────────────────────────────────────────────────┘
```

### Adapter Locations

| Adapter | Location | Auth | Status |
|---|---|---|---|
| Base (abstract) | `src/modules/connector-platform/adapters/erp-base.ts` | Abstract | Built |
| SAP S/4HANA | `src/modules/connector-platform/adapters/sap-connector.ts` | OAuth2/mTLS | Scaffolded |
| NetSuite | `src/modules/connector-platform/adapters/netsuite-connector.ts` | OAuth2 | Scaffolded |
| Dynamics 365 | `src/modules/connector-platform/adapters/dynamics-connector.ts` | OAuth2 | Scaffolded |
| QuickBooks | `src/modules/connector-platform/adapters/quickbooks-connector.ts` | OAuth2 | Built |
| ERP Types | `src/modules/connector-platform/adapters/erp-types.ts` | N/A | Built |

### ERP Framework (Integration Platform)

| Service | Location | Purpose |
|---|---|---|
| ErpBase | `src/modules/integration-platform/erp-framework/erp-base.ts` | Abstract ERP integration base |
| ERP Base (Integration) | `src/modules/integration-platform/erp-framework/index.ts` | Barrel export |

### ERP Service (Connector Platform)

| Service | Location | Purpose |
|---|---|---|
| ErpService | `src/modules/connector-platform/services/erp.service.ts` | ERP connector service |
| QBO Accounting | `src/modules/connector-platform/services/quickbooks-accounting.service.ts` | QBO-specific accounting sync |

---

## Events

### ERP Sync Events

| Event | Description | Payload |
|---|---|---|
| `erp:vendor-sync-completed` | Vendor sync succeeded | erpId, recordsProcessed, created, updated |
| `erp:vendor-sync-failed` | Vendor sync failed | erpId, error |
| `erp:invoice-sync-completed` | Invoice sync succeeded | erpId, recordsProcessed |
| `erp:invoice-sync-failed` | Invoice sync failed | erpId, error |
| `erp:payment-export-completed` | Payment exported | erpId, paymentId, externalId |
| `erp:payment-export-failed` | Payment export failed | erpId, paymentId, error |
| `erp:gl-export-completed` | GL entries exported | erpId, entryCount |
| `erp:gl-export-failed` | GL export failed | erpId, error |
| `erp:conflict-detected` | Data conflict found | erpId, entityType, localId, remoteId |
| `erp:conflict-resolved` | Conflict resolved | erpId, conflictId, resolution |
| `erp:validation-completed` | Validation run | erpId, issueCount |

---

## Commands

| Command | Description | Permission |
|---|---|---|
| `syncErpVendors` | Pull vendors from ERP | `connector.sync` |
| `syncErpInvoices` | Pull invoices from ERP | `connector.sync` |
| `syncErpPayments` | Pull payments from ERP | `connector.sync` |
| `exportErpJournalEntry` | Push journal to ERP | `connector.write` |
| `exportErpPayment` | Push payment to ERP | `connector.write` |
| `syncErpChartOfAccounts` | Pull COA from ERP | `connector.sync` |
| `syncErpPurchaseOrders` | Pull POs from ERP | `connector.sync` |
| `resolveErpConflict` | Resolve data conflict | `connector.write` |

---

## Queries

| Query | Description | Cacheable |
|---|---|---|
| `listErpConnections` | List ERP integrations | Yes (30s) |
| `getErpConnection` | Get ERP by ID | Yes (30s) |
| `getErpHealth` | Health status | No (30s TTL) |
| `getErpCapabilities` | What this ERP supports | Yes (1hr) |
| `getVendorMapping` | ERP↔Perionyx vendor map | Yes (60s) |
| `getInvoiceMapping` | ERP↔Perionyx invoice map | Yes (60s) |
| `getErpSyncHistory` | Sync history | Yes (60s) |
| `getErpValidationIssues` | Data quality issues | No |
| `getErpConflicts` | Open conflicts | No |

---

## Errors

| Code | Description | Recovery |
|---|---|---|
| `ERP_NOT_CONFIGURED` | Missing env vars | Admin configures |
| `ERP_AUTH_FAILED` | OAuth/token expired | Re-authenticate |
| `ERP_API_ERROR` | ERP API returned error | Retry with backoff |
| `ERP_RATE_LIMITED` | ERP rate limit hit | Wait + retry |
| `ERP_DATA_INVALID` | ERP data fails validation | Review data |
| `ERP_MAPPING_CONFLICT` | Local/remote mismatch | Manual resolution |
| `ERP_EXPORT_FAILED` | GL export failed | Check ERP logs |
| `ERP_CONNECTION_TIMEOUT` | ERP unreachable | Check connectivity |

---

## Security Model

1. **Credential Encryption**: AES-256-GCM at rest for all ERP credentials
2. **No Credential Export**: API responses never include raw credentials
3. **Tenant Isolation**: ERP connections scoped to company
4. **Audit Trail**: Every sync, export, and credential access logged
5. **Least Privilege**: ERP API keys use minimum required scopes
6. **Token Rotation**: OAuth tokens refreshed before expiry

---

## Permission Model

| Operation | Permission | MFA | Scope |
|---|---|---|---|
| View ERP connections | `connector.read` | No | Company |
| Sync ERP data | `connector.sync` | No | Company |
| Export to ERP | `connector.write` | No | Company |
| Configure ERP | `connector.configure` | No | Company |
| Delete ERP connection | `connector.delete` | Yes | Company |
| Manage ERP platform | `connector.admin` | Yes | Company |

---

## Observability

### Metrics

| Metric | Type | Labels |
|---|---|---|
| `erp_sync_duration_ms` | Histogram | erp_kind, entity_type, status |
| `erp_sync_records_total` | Counter | erp_kind, entity_type, operation |
| `erp_export_duration_ms` | Histogram | erp_kind, entity_type, status |
| `erp_conflict_total` | Counter | erp_kind, entity_type, resolution |
| `erp_validation_issues_total` | Counter | erp_kind, category, severity |
| `erp_health_status` | Gauge | erp_kind |
| `erp_auth_refresh_total` | Counter | erp_kind, status |

### Tracing

```
Span: erp.sync.{erp_kind}.{entity_type}
  Parent: contract.erp.syncVendors
  Attributes:
    erp.kind = "sap-s4hana"
    erp.entity_type = "vendor"
    erp.records_fetched = 150
    erp.records_created = 12
    erp.records_updated = 3
```

---

## Metrics

| Metric | Description | Alert |
|---|---|---|
| ERP sync success rate | % successful syncs | < 99% |
| ERP sync latency p95 | 95th percentile sync time | > 30s |
| ERP export success rate | % successful exports | < 99.5% |
| Conflict rate | Conflicts per 1000 records | > 1% |
| Validation issue rate | Issues per 1000 records | > 5 |
| Auth refresh failure rate | Token refresh failures | > 0 |

---

## Rate Limiting

| ERP System | Global Limit | Per-Endpoint | Notes |
|---|---|---|---|
| SAP S/4HANA | Configurable | Configurable | Admin sets in config |
| NetSuite | 100/min | RESTlets: 50/min | Provider default |
| Dynamics 365 | 60K/5min | Varies by API | Provider default |
| QuickBooks | 500/min | Query: 200/min | Provider default |

---

## Retry Policy

| Operation | Max Retries | Backoff | Jitter |
|---|---|---|---|
| Vendor sync | 3 | Exponential 2s-8s | ±1s |
| Invoice sync | 3 | Exponential 2s-8s | ±1s |
| GL export | 2 | Exponential 5s-20s | ±2s |
| Auth refresh | 2 | Fixed 5s | ±1s |

---

## Circuit Breakers

Per-ERP-system circuit breakers:

| Threshold | Value |
|---|---|
| Failure count to trip | 5 |
| Recovery timeout | 60s (longer than other drivers — ERP APIs are slower) |
| Half-open max calls | 1 |

---

## Caching

| Data | TTL | Location |
|---|---|---|
| ERP capabilities | 1 hour | Memory |
| Vendor mappings | 5 minutes | Memory + DB |
| Invoice mappings | 5 minutes | Memory + DB |
| Health status | 30 seconds | Memory |
| COA structure | 1 hour | Memory + DB |

---

## Versioning

| Component | Versioning | Notes |
|---|---|---|
| ERPContract | semver | Major for breaking changes |
| ERP adapter code | semver | Driver version |
| ERP API version | Provider-controlled | Negotiated at init |
| Connector config schema | Optimistic locking | Version field |

---

## Lifecycle

### ERP Integration Lifecycle

```
Install ERP Adapter → Configure Credentials → Authenticate → Connect → 
  → Sync Vendors → Sync Invoices → Sync POs → Sync Payments →
  → Export GL Entries → Monitor Health → Handle Conflicts →
  → Retire
```

### Per-Sync Lifecycle

```
Trigger → Fetch (from ERP) → Transform (to canonical) → Validate → 
  → Resolve Conflicts → Persist → Emit Events → Audit Log
```

---

## Extension Model

### Adding a New ERP System

1. **Extend** `ErpConnectorBase` from `src/modules/connector-platform/adapters/erp-base.ts`
2. **Implement** `performHealthCheck()` and `performSync()`
3. **Define** required env vars in `getRequiredEnvVars()`
4. **Register** in `ConnectorPlatformRegistry`
5. **Add** to `ConnectorDiscovery` metadata
6. **Implement** ERP-specific data mapping
7. **Write** contract compliance tests
8. **Document** ERP-specific quirks

```typescript
class OracleErpConnector extends ErpConnectorBase {
  readonly kind = "oracle-erp" as ConnectorKind;
  readonly label = "Oracle ERP Cloud";
  readonly description = "Oracle ERP Cloud integration";
  
  getRequiredEnvVars(): string[] {
    return ["ORACLE_CLIENT_ID", "ORACLE_CLIENT_SECRET", "ORACLE_BASE_URL"];
  }
  
  protected async performHealthCheck(): Promise<ConnectorHealth> { /* ... */ }
  protected async performSync(options?: ConnectorSyncOptions): Promise<ConnectorSyncResult> { /* ... */ }
}
```

---

## Provider Model

### ERP Capability Matrix

| Capability | SAP | NetSuite | Dynamics | QuickBooks |
|---|---|---|---|---|
| Vendor sync | Planned | Planned | Planned | Built |
| Invoice sync | Planned | Planned | Planned | Built |
| Payment sync | Planned | Planned | Planned | Built |
| GL export | Planned | Planned | Planned | Built |
| COA sync | Planned | Planned | Planned | Built |
| PO sync | Planned | Planned | Planned | Planned |
| Multi-currency | Planned | Planned | Planned | Limited |
| Webhooks | Planned | Planned | Planned | Built |

### Vendor-to-Canonical Translation

ERP vendor terminology is never propagated into the Perionyx domain model:

| ERP System | ERP Term | Perionyx Canonical |
|---|---|---|
| SAP | Business Partner | Vendor |
| NetSuite | Vendor | Vendor |
| Dynamics | Vendor | Vendor |
| QuickBooks | Vendor | Vendor |
| SAP | Purchase Order | PurchaseOrder |
| NetSuite | Purchase Order | PurchaseOrder |
| SAP | Invoice (AP) | VendorInvoice |
| QuickBooks | Bill | VendorInvoice |

---

## Testing Strategy

| Test | Scope | Frequency |
|---|---|---|
| Unit (adapter) | Error translation, data mapping | Every PR |
| Integration (sandbox) | Full sync flow in ERP sandbox | Nightly |
| Contract | ERP interface compliance | Every PR |
| E2E | Install → Sync → Export flow | Weekly |
| Performance | Sync throughput (10K+ records) | Weekly |
| Conflict | Simultaneous edits | Nightly |

---

## Failure Modes

| Failure | Impact | Recovery |
|---|---|---|
| ERP API downtime | Sync fails | Circuit breaker; cached data served |
| OAuth token expired | Auth failures | Automatic refresh |
| Data mapping error | Bad data imported | Validation catches; manual fix |
| ERP schema change | Mapping breaks | Adapter update required |
| Concurrent edits | Conflict | Conflict resolution workflow |
| Large dataset timeout | Partial sync | Checkpoint resume |

---

## Recovery Strategy

1. **ERP API Outage**: Circuit breaker isolates; cached sync data served; retry after recovery
2. **Auth Token Expiry**: Automatic refresh; failure triggers re-auth flow
3. **Data Mapping Failure**: Validation issues logged; data quarantined until fix
4. **Partial Sync**: Checkpoint saved; resume from last successful entity
5. **Conflict**: Flagged for manual resolution; no automatic overwrites
6. **Schema Change**: Adapter fails gracefully; alert for adapter update
