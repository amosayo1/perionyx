# Runtime Architecture

**Phase**: 24.0B
**Status**: Active
**Last Updated**: 2026-07-26

---

## Overview

The Runtime is the canonical execution environment for every Platform, Provider Driver, AI Agent, Workflow, and Financial Domain in Perionyx. It provides five core capabilities: context propagation, configuration management, secret management, capability registry, and error handling.

## Architecture

```
src/runtime/
├── index.ts                    # Barrel export
├── context/                    # AsyncLocalStorage-based context propagation
│   ├── types.ts               # RuntimeContext, TenantContext, RequestContext, etc.
│   ├── runtime-context.ts     # withRuntimeContext, getRuntimeContext, getters
│   └── index.ts
├── core/                       # Runtime singleton + lifecycle
│   ├── types.ts               # RuntimeState, ServiceRegistration, LifecycleHooks
│   ├── runtime.ts             # Runtime class (singleton, service registry, health)
│   └── index.ts
├── configuration/              # Prisma-backed configuration registry
│   ├── registry.ts            # ConfigurationRuntime (CRUD, feature flags, schemas)
│   └── index.ts
├── secrets/                    # Prisma-backed secret management
│   ├── secret-runtime.ts      # SecretRuntime (CRUD, rotation, audit)
│   ├── providers/
│   │   ├── types.ts           # ISecretProvider interface
│   │   ├── environment.ts     # EnvironmentSecretProvider (default)
│   │   ├── aws-secrets.ts     # AWSSecretsProvider (stub)
│   │   ├── azure-keyvault.ts  # AzureKeyVaultProvider (stub)
│   │   ├── gcp-secret-manager.ts # GCPSecretProvider (stub)
│   │   └── vault.ts           # VaultSecretProvider (stub)
│   └── index.ts
├── capabilities/               # Prisma-backed capability registry
│   ├── registry.ts            # CapabilityRuntime (CRUD, health, polling)
│   └── index.ts
└── errors/                     # Typed error hierarchy
    └── index.ts               # 15 error classes
```

## Context Propagation

The Runtime uses Node.js `AsyncLocalStorage` to propagate context through async call chains without manual parameter threading.

```typescript
import { withRuntimeContext, getTenantId } from '@/runtime/context';

await withRuntimeContext({ tenant: { userId, companyId, role } }, async () => {
  // Any async call within this scope can read context
  const tenantId = getTenantId(); // returns companyId
});
```

### Context Layers

| Layer | Type | Purpose |
|-------|------|---------|
| `tenant` | `TenantContext` | userId, companyId, role |
| `request` | `RequestContext` | requestId, correlationId, clientIp |
| `trace` | `TraceContext` | traceId, spanId, baggage |
| `permission` | `PermissionContext` | permissions[], mfaVerified |
| `financial` | `FinancialContext` | currency, fiscal year, accounting method |
| `locale` | `LocaleContext` | locale, timezone, number format |

### Key Design Decisions

1. **Merge semantics**: Inner contexts inherit parent values; only provided fields are overridden
2. **Concurrency-safe**: Each async operation gets its own context snapshot via AsyncLocalStorage
3. **Backward-compatible**: `fromTenantContext()` and `withTenantContext()` bridge existing patterns

## Runtime Core

The `Runtime` singleton manages the application lifecycle and service registry.

### Lifecycle States

```
UNINITIALIZED → INITIALIZING → READY → RUNNING → DRAINING → STOPPED
                                      ↓
                                     ERROR
```

### Service Registration

```typescript
runtime.registerService({
  name: 'banking',
  service: bankingService,
  version: '1.0.0',
  health: async () => ({ status: 'healthy' }),
  shutdown: async () => { /* cleanup */ },
});
```

## Configuration Runtime

Prisma-backed hierarchical configuration with in-memory caching.

### Resolution Priority

1. Environment + Tenant (highest)
2. Tenant-specific
3. Global (lowest, fallback)

### Feature Flags

- Rollout strategies: ALL, PERCENTAGE, TENANT, ENVIRONMENT
- Per-tenant overrides
- Scheduled activation / expiration
- Percentage-based rollout (deterministic hash)

## Secret Runtime

Metadata in Prisma, values resolved from pluggable providers.

### Provider Hierarchy

| Provider | Status | Env Check |
|----------|--------|-----------|
| Environment | Active | Always available |
| AWS Secrets Manager | Stub | `AWS_REGION` |
| Azure Key Vault | Stub | `AZURE_KEY_VAULT_URL` |
| GCP Secret Manager | Stub | `GCP_PROJECT_ID` |
| HashiCorp Vault | Stub | `VAULT_ADDR` + `VAULT_TOKEN` |

### Auto-Rotation

- Configurable rotation interval per secret
- Background scheduler checks every 60s
- Version history maintained in `RuntimeSecretVersion`

## Capability Registry

Prisma-backed registry for platform capabilities with health tracking.

### Categories (15)

INTEGRATION, BANKING, ERP, PAYMENTS, IDENTITY, NOTIFICATION, DOCUMENT, AI, WORKFLOW, AUDIT, OBSERVABILITY, SEARCH, STORAGE, SECURITY, ANALYTICS

### Health Tracking

- Per-capability health status (HEALTHY, DEGRADED, UNHEALTHY, DISABLED, UNKNOWN)
- Latency tracking
- Health history (append-only)
- Aggregated health summary

## Error Hierarchy

```
RuntimeError (base)
├── ConfigurationError
│   ├── ConfigNotFoundError
│   └── ConfigValidationError
├── SecretError
│   ├── SecretNotFoundError
│   └── SecretAccessDeniedError
├── CapabilityError
│   └── CapabilityNotFoundError
├── PolicyError
│   └── PolicyDeniedError
├── EventError
├── LifecycleError
│   ├── BootstrapError
│   └── ShutdownError
└── HealthError
```

## Integration Points

| System | Integration |
|--------|------------|
| `infrastructure.ts` | Initializes all 3 Prisma-backed runtimes during startup |
| Health Endpoint | Registers configuration, secrets, capabilities health checks |
| Shutdown | Graceful shutdown of secret rotation timer, capability polling |
| Classification | Auto-registers Prisma model classifications on startup |

## Prisma Models

15 models, 13 enums across 6 domains:

| Domain | Models | Enums |
|--------|--------|-------|
| Configuration | RuntimeConfiguration, RuntimeConfigurationVersion | RuntimeConfigScope, RuntimeConfigStatus |
| Feature Flags | RuntimeFeatureFlag, RuntimeFeatureFlagOverride | RuntimeFeatureFlagStatus, RuntimeFeatureFlagRollout |
| Secrets | RuntimeSecretMetadata, RuntimeSecretVersion | RuntimeSecretProvider, RuntimeSecretCategory, RuntimeSecretStatus |
| Capabilities | RuntimeCapability, RuntimeCapabilityHealthHistory | RuntimeCapabilityCategory, RuntimeCapabilityStatus |
| Classification | RuntimeClassificationEntry, RuntimeClassificationEntity, RuntimeClassificationAudit | RuntimeClassificationLevel |
| Policy Engine | RuntimePolicy, RuntimePolicyEvaluation | RuntimePolicyType, RuntimePolicyStatus |
| Event Outbox | RuntimeEventEnvelope, RuntimeEventDeadLetter | RuntimeEventStatus |
