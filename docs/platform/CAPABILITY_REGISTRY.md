# Capability Registry

**Phase**: 24.0
**Status**: Complete
**Law Compliance**: Law 3 (Every Platform Exposes Capability Contracts), Law 14 (Events Are Vendor-Neutral)

## Purpose

Central registry where every provider declares what it can do, its health, and its capabilities. Enables dynamic discovery, load balancing, and failover.

## Architecture

```
src/server/foundation/capability-registry/
├── types.ts      — CapabilityMetadata, ProviderRegistration, RegistryEvent
├── registry.ts   — CapabilityRegistry singleton
└── index.ts      — Barrel export
```

## Capability Categories

| Category | Description | Example |
|----------|-------------|---------|
| BANKING | Bank account access, balance, transactions | PlaidIntegrationProvider |
| ERP | ERP data sync (QuickBooks, SAP, NetSuite) | QuickBooksProvider |
| PAYMENTS | Payment execution | StripePaymentsProvider |
| DOCUMENT | Document storage/retrieval | S3DocumentProvider |
| NOTIFICATION | Email, SMS, push notifications | SendGridNotificationProvider |
| IDENTITY | Authentication, SSO | AzureADIdentityProvider |
| ANALYTICS | Data analysis, reporting | BigQueryAnalyticsProvider |
| AI | LLM inference, embeddings | OpenAIProvider |
| WORKFLOW | Workflow execution | TemporalWorkflowProvider |
| AUDIT | Audit trail | PrismaAuditProvider |
| CUSTOM | User-defined capabilities | CustomProvider |

## Key Capabilities

1. **Provider registration** — Providers declare capabilities with metadata
2. **Health tracking** — Automatic health checks per provider
3. **Capability discovery** — Find providers for a specific capability
4. **Event log** — Track registration, health changes, failovers
5. **Load balancing** — Round-robin across healthy providers

## Usage

```typescript
import { CapabilityRegistry } from "@/server/foundation/capability-registry";

const registry = CapabilityRegistry.getInstance();

// Register a provider
registry.registerProvider({
  providerId: "plaid",
  name: "Plaid Banking",
  capabilities: [
    { category: CapabilityCategory.BANKING, subcategory: "account-access" },
    { category: CapabilityCategory.BANKING, subcategory: "transactions" },
  ],
  healthCheckUrl: "/health/plaid",
});

// Find providers for a capability
const providers = registry.findProviders(CapabilityCategory.BANKING);

// Get healthy providers only
const healthy = registry.findHealthyProviders(CapabilityCategory.BANKING);
```

## Event Log

The registry maintains a rolling event log (last 1000 events):

- `PROVIDER_REGISTERED` — New provider added
- `PROVIDER_DEREGISTERED` — Provider removed
- `CAPABILITY_ADDED` — New capability added to provider
- `CAPABILITY_REMOVED` — Capability removed
- `HEALTH_CHANGED` — Provider health status changed
- `FAILOVER` — Traffic rerouted to backup provider
