# ADR-026: Enterprise Integration Plugin Framework

**Status**: Ratified
**Date**: July 2026
**Author**: Architecture Team

## Context

The platform must integrate with external financial systems: banking APIs (Plaid, ACH), ERP systems (SAP, Oracle), accounting platforms, CSV file uploads, and custom enterprise systems. Each connector has different authentication, data format, synchronization cadence, and error handling requirements. New connectors must be addable without modifying platform core.

## Decision

Build an **enterprise integration plugin framework** with a standardized connector interface, canonical data model, and lifecycle management.

### Connector Interface

```typescript
interface IConnector {
  id: string;
  name: string;
  type: ConnectorType; // "banking" | "erp" | "accounting" | "csv"
  
  // Lifecycle
  initialize(config: ConnectorConfig): Promise<void>;
  validate(): Promise<ValidationResult>;
  healthCheck(): Promise<HealthStatus>;
  
  // Data operations
  sync(): Promise<SyncResult>;
  transform(data: ExternalData): Promise<CanonicalData>;
  
  // Configuration
  getConfig(): ConnectorConfig;
  updateConfig(config: Partial<ConnectorConfig>): Promise<void>;
}
```

### Canonical Data Model

All connectors normalize external data into a shared canonical format:

```typescript
interface CanonicalTransaction {
  externalId: string;
  type: "payment" | "transfer" | "fee" | "interest" | "unknown";
  amount: number;
  currency: string;
  counterparty: string;
  description: string;
  timestamp: string;
  status: "pending" | "settled" | "failed" | "reversed";
  metadata: Record<string, unknown>;
}
```

### Connector Registry

```typescript
// src/server/integrations/connector-platform.ts
const connectorPlatformRegistry = new Map<string, IConnector>();

function registerConnector(id: string, connector: IConnector): void;
function getConnector(id: string): IConnector | undefined;
function listConnectors(type?: ConnectorType): IConnector[];
```

### Supported Connectors

| Connector | Type | Auth | Sync Mode | Implementation |
|-----------|------|------|-----------|----------------|
| Plaid | Banking | OAuth + API key | Webhook + Poll | `src/server/integrations/connectors/plaid/` |
| ACH | Banking | API key | Batch | `src/server/integrations/connectors/ach/` |
| HTTP Generic | Custom | API key / OAuth | Poll | `src/server/integrations/connectors/http/` |
| CSV Upload | File | Session auth | On-demand | `src/server/integrations/connectors/csv/` |
| Mock | Testing | None | On-demand | `src/server/integrations/connectors/mock/` |

### Lifecycle Management

```
Register → Validate → HealthCheck → [Sync Loop] → Decommission
                ↓                        ↓
           Invalid Config            Error Handler
```

- **Validate**: Checks credential format, endpoint reachability, schema compatibility
- **Health Check**: Periodic connectivity and data freshness check
- **Sync**: Delta sync (since last cursor) or full sync (configurable)
- **Error Handler**: Exponential backoff retry (1s, 4s, 15s, 60s, 300s), dead-letter after 5 failures

### Error Handling

```typescript
interface ConnectorError {
  type: "auth" | "timeout" | "rate_limit" | "data_invalid" | "unavailable";
  message: string;
  retryable: boolean;
  retryAfter?: number; // seconds
}
```

- Auth errors → Alert admin immediately
- Rate limit errors → Backoff and retry
- Data validation errors → Log to sync error queue
- Unavailable errors → Retry with exponential backoff

## Alternatives Considered

1. **Hard-coded per-provider logic**: Rejected — every new connector requires core platform changes
2. **Generic webhook-only integration**: Rejected — many enterprise systems don't support webhooks
3. **Third-party integration platform (e.g., Zapier)**: Rejected — cannot meet financial data security and audit requirements

## Consequences

- **Positive**: New connectors follow a documented contract — no core changes needed
- **Positive**: Canonical data model ensures downstream modules (Treasury, Ledger) never see raw external formats
- **Positive**: Health checks provide per-connector status — stale data is labeled
- **Positive**: Mock connector enables integration testing without real credentials
- **Negative**: Connector framework adds abstraction overhead for simple integrations
- **Negative**: Canonical data model may lose provider-specific details (stored in `metadata`)
- **Negative**: Each connector needs its own auth flow implementation

## Future Considerations

- Connector marketplace for third-party connector developers
- Connection pooling for high-volume sync operations
- Webhook signature verification as a shared connector utility
- Rate limit coordination across connectors sharing the same external API
