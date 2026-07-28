# Dependency Analysis

**Phase**: 23.1 — Constitutional Validation
**Date**: 2026-07-24

---

## Dependency Purity Score: 6.0 / 10

The Platform Constitution requires that business domains never import provider SDKs (Law 1) and depend only on capability contracts (Law 3). This analysis traces all cross-boundary imports.

---

## Business Domain → Provider SDK Imports

### Violations Found: 1

| File | Line | Import | Violation |
|---|---|---|---|
| `src/modules/tick/tick.service.ts` | 3 | `import { PlaidService } from "@/modules/integrations/plaid"` | Business domain imports provider-specific service |

**Impact**: `tick.service.ts` is a scheduling/batch processing service. It directly calls `PlaidService.syncBalance()` at line 153, coupling the tick scheduler to Plaid's API. If Plaid changes or is replaced, the tick service breaks.

**Fix**: Delegate to ConnectorPlatform orchestrator (`src/modules/connector-platform/orchestrator/orchestrator.ts`) which already provides a provider-neutral `syncData()` method.

### Clean Domains (Zero Provider Imports)

| Domain | Location | Provider Imports |
|---|---|---|
| **Ledger** | `src/modules/ledger/` (10 files) | 0 |
| **AP/Procurement** | `src/server/procurement/` (30+ files) | 0 |
| **Treasury** | `src/server/banking/treasury/` | 0 |
| **Compliance** | `src/server/compliance/` | 0 |
| **CRM** | `src/modules/crm/` | 0 |
| **Workflow** | `src/modules/workflow/` (18 files) | 0 |
| **Audit** | `src/modules/audit/` + `src/modules/audit-specialist/` | 0 |

### Provider Drivers (Allowed to Import SDKs)

| Driver | Location | SDK Import |
|---|---|---|
| PlaidService | `src/modules/integrations/plaid/plaid.service.ts:33` | `await import("plaid")` (dynamic) |
| PlaidConnector | `src/modules/connector-platform/adapters/plaid-adapter.ts:21` | `await import("plaid")` (dynamic) |
| PlaidWebhookHandler | `src/modules/connector-platform/webhooks/plaid-webhook-handler.ts:25` | `await import("plaid")` (dynamic) |
| QuickBooksConnector | `src/modules/connector-platform/adapters/quickbooks-connector.ts` | Via connector adapter |
| SAPConnector | `src/modules/connector-platform/adapters/sap-connector.ts` | Via connector adapter |
| NetSuiteConnector | `src/modules/connector-platform/adapters/netsuite-connector.ts` | Via connector adapter |
| DynamicsConnector | `src/modules/connector-platform/adapters/dynamics365-connector.ts` | Via connector adapter |

All provider SDK imports use dynamic `import()` inside the driver boundary — acceptable per Law 1.

---

## Cross-Domain Dependencies

### AP Domain Dependencies

```
src/server/procurement/application/
  ├── ../ap-repositories/        (repository interfaces — OK)
  ├── ../domain/events/          (domain events — OK)
  ├── ./types                     (command types — OK)
  ├── @/lib/financial-precision   (shared utility — OK)
  ├── @/lib/errors/app-error      (shared utility — OK)
  └── @prisma/client              (Prisma types — OK)
```

No cross-domain imports (no ledger, no treasury, no workflow, no CRM).

### Workflow Domain Dependencies

```
src/modules/workflow/
  ├── @/server/db/prisma          (database access — OK)
  ├── @/modules/audit             (audit recording — OK)
  └── @/modules/queue/            (job scheduling — OK)
```

No provider imports. Clean.

### Ledger Domain Dependencies

```
src/modules/ledger/
  ├── @/server/db/prisma          (database access — OK)
  ├── @/lib/financial-transaction (shared utility — OK)
  └── @/lib/db/types              (shared types — OK)
```

No cross-domain imports. Clean.

---

## Contract-Based Dependencies

### Platforms with Contract Interfaces

| Platform | Interface | Location | Used By |
|---|---|---|---|
| IntegrationPlatform | `IConnector` | `src/modules/connector-platform/interface.ts:21` | Registry, lifecycle, 7 adapters |
| BankingPlatform | `IBankProvider` | `src/server/banking/providers/interface.ts:67` | Provider registry, routing engine |
| AIPlatform | `IAiProvider` | `src/modules/ai-provider/interface.ts:12` | Provider registry, prompt execution |

### Platforms without Contract Interfaces (Concrete Dependencies)

| Platform | What Others Import | Coupling Risk |
|---|---|---|
| **WorkflowPlatform** | `WorkflowEngine.getInstance()` singleton | High — all consumers coupled to singleton |
| **IdentityPlatform** | `authenticateRequest()`, `requireTenantContext()` | Medium — functions, not classes |
| **AuditPlatform** | `recordAudit()` function | Low — stateless function |
| **NotificationPlatform** | `notificationService` singleton | Medium — singleton coupling |
| **ObservabilityPlatform** | `MetricsRegistry`, `HealthRegistry` | Low — stateless utilities |
| **SearchPlatform** | `EnterpriseSearchEngine` singleton | Medium — singleton coupling |

---

## Dependency Graph Summary

```
Business Domains (Ledger, AP, Treasury, CRM, Compliance)
  └── Depends on: Prisma client, shared utilities (@/lib/*)
  └── Does NOT depend on: provider SDKs, other business domains

Platform Implementations (Workflow, Identity, Audit, Notification)
  └── Depends on: Prisma client, shared infrastructure
  └── Does NOT depend on: provider SDKs
  └── BUT: concrete class imports, not contract-based

Provider Drivers (Plaid, QuickBooks, SAP, NetSuite, Dynamics)
  └── Depends on: provider SDKs (dynamic import), IConnector contract
  └── Does NOT depend on: business domains
  └── Clean boundary via factory pattern
```

---

## Findings

| # | Finding | Severity | Score Impact |
|---|---|---|---|
| 1 | `tick.service.ts` imports `PlaidService` directly | High | -3 on Law 1 |
| 2 | `plaidAccessToken` DB field is vendor name leakage | Low | -1 on Law 14 |
| 3 | 12/15 platforms lack contract interfaces | High | -5 on Law 3 |
| 4 | WorkflowEngine is a singleton, not contract-based | Medium | -3 on Law 10 |
| 5 | DuplicateDetection bypasses repository abstraction | Low | Code quality |

---

*Validated: 2026-07-24 | Phase 23.1 | Dependency Analysis*
