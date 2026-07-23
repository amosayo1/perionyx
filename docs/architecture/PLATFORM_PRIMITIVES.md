# Platform Primitives — Authoritative Implementations

> **Purpose**: Single source of truth for every platform primitive. When adding new code, import from the canonical path listed here. Do not create local duplicates.
>
> **Last audited**: Phase 18.1A (2026-07-21)

---

## Authentication

| Primitive | Canonical Path | Notes |
|---|---|---|
| Credential verification | `src/modules/identity/adapters/local.ts` | Fail-closed, MFA-aware. Throws on invalid credentials. |
| JWT session management | `src/server/iam/session.ts` | 24h TTL, `tokenVersion` revocation, session lifecycle |
| MFA (TOTP) | `src/server/iam/mfa.ts` | Enrollment, confirmation, verification, disable. Recovery codes (10, SHA-256 hashed). Timing-safe comparison. |
| Edge proxy auth | `src/proxy.ts` | Token extraction from `Authorization` header, rate limiting, CSRF validation, correlation ID |
| Auth endpoints | `src/app/api/auth/` | NextAuth, register, sandbox-login, MFA endpoints |

**No duplicates.** Single authentication flow. Edge proxy extracts tokens → session module validates JWT → identity adapter verifies credentials.

---

## Authorization

| Primitive | Canonical Path | Notes |
|---|---|---|
| Permission definitions | `src/server/iam/permissions.ts` | **60 permissions** using `GranularPermission` type. 14 categories. Each with `requiresMfa` flag and scopes. |
| RBAC enforcement | `src/modules/rbac/rbac.service.ts` | Enforces permissions using `GranularPermission` from `iam/permissions.ts` |
| ABAC policies | `src/server/iam/abac.ts` | Attribute-based access control for fine-grained scoping |
| Role management | `src/server/iam/roles.ts` | Role CRUD, assignment, hierarchy |
| Permission management | `src/server/iam/permissions.ts` | Permission registry class with `getAll()`, `get()`, `getByCategory()`, `requiresMfa()`, `validate()` |

### CONFLICT: `src/modules/rbac/permission-registry.ts` — DEPRECATE AND DELETE

This file defines 24 permissions using a different type system (`PermissionDefinition` vs `GranularPermission`). It is exported from `src/modules/rbac/index.ts` but should not be used by new code.

| Action | Detail |
|---|---|
| **Delete** | `src/modules/rbac/permission-registry.ts` |
| **Update** | `src/modules/rbac/index.ts` — remove re-export of `PermissionRegistry` and `PermissionDefinition` |
| **Verify** | Search for any imports of `PermissionRegistry` from `rbac/permission-registry` and migrate to `iam/permissions.ts` |

---

## Audit

| Primitive | Canonical Path | Purpose | Events |
|---|---|---|---|
| Security audit (tamper-evident) | `src/server/security/audit-logger.ts` | Append-only SHA-256 hash chain. Each event links to previous hash. For SOC 2 / ISO 27001 compliance. | Security events: auth failures, permission denials, config changes, key rotations |
| Business audit | `src/modules/audit/audit.service.ts` | `recordAudit()` — standard CRUD events written to Prisma `AuditLog` | Transaction create/approve/reject, wallet changes, connector operations |
| IAM audit | `src/server/iam/audit.ts` | `recordIAMAudit()` — identity-specific events written to Prisma `AuditLog` | Login attempts, MFA enrollment, session creation, password changes |

### Assessment: THREE WRITERS — Recommend Consolidation

Keep security audit separate (tamper-evident chain is a compliance requirement). Merge business + IAM audit into a single `recordAudit` with a `source` field:

```
recordAudit(ctx, {
  action: "user.login",
  source: "iam",          // or "business", "security"
  targetType: "User",
  targetId: userId,
  metadata: { ... }
})
```

---

## Approval

| Primitive | Canonical Path | Purpose |
|---|---|---|
| Transaction approval | `src/modules/ledger/approval-workflow.ts` | `ApprovalWorkflowEngine` — wallet-level thresholds, delegation, escalation, timeout, compliance checks |
| Workflow approval step | `src/modules/workflow/steps/approval-step.ts` | Generic step executor — role-based approval within workflow instances |
| Approval matrix evaluator | `src/modules/automation-studio/approval-matrix-evaluator.ts` | `ApprovalMatrixEvaluator` — role/dept/threshold condition matching engine |

### Assessment: INTENTIONAL SEPARATION — Three Distinct Purposes

These three systems serve different purposes and share no code. Document as intentional:

1. **Ledger approval** = financial governance (who can approve a $50K wire transfer?)
2. **Workflow approval** = process step (who approves the "review contract" step in a workflow?)
3. **Approval matrix** = rule engine (which approver role applies based on transaction amount, department, and entity?)

The matrix evaluator feeds data to both the ledger and workflow approval systems via `evaluateApproval()`.

---

## Workflow Engine

| Primitive | Canonical Path | Notes |
|---|---|---|
| **Authoritative engine** | `src/modules/workflow/engine.ts` | Singleton (`getInstance()`), dependency graph resolution, 9 step executors, version snapshots, state machine, `WorkflowInstance` Prisma table |
| Step registry | `src/modules/workflow/step-registry.ts` | Registers all step executors |
| State machine | `src/modules/workflow/state-machine.ts` | Valid state transitions for workflow instances |
| Version snapshots | `src/modules/workflow/version-snapshot.service.ts` | Immutable version history |
| Types | `src/modules/workflow/types.ts` | `WorkflowStatus`, `StepStatus`, `StepDefinition`, `WorkflowExecutionContext` |

### DEPRECATE: `src/modules/orchestration/workflow-engine.ts` → OrchestrationExecutionEngine

**Phase 18.1A: Renamed to `OrchestrationExecutionEngine`** to eliminate naming collision with the primary engine.

| Attribute | Primary Engine | OrchestrationExecutionEngine |
|---|---|---|
| Pattern | Singleton instance | Static methods |
| Execution | Dependency graph | Sequential (index-sorted) |
| Step executors | 9 specialized | 1 monolithic `executeStep` |
| Prisma tables | `WorkflowInstance` | `WorkflowExecution` |
| Events | `realtime/event-bus.ts` | `internal-event-bus.ts` |
| Cross-imports | None | None |

**Action**: Migrate any consumers of the orchestration engine to the primary engine. Delete `src/modules/orchestration/workflow-engine.ts` after migration.

**Consumers to migrate**:
- `src/modules/orchestration/orchestration.service.ts` — imports `WorkflowEngine` from `./workflow-engine`
- Verify no API routes import from `src/modules/orchestration/workflow-engine.ts`

---

## Notification Service

| Primitive | Canonical Path | Notes |
|---|---|---|
| Service | `src/modules/notifications/notifications.service.ts` | Single notification service |
| In-app channel | `src/modules/notifications/channels/in-app.ts` | Database-persisted notifications |
| Email channel | `src/modules/notifications/channels/email.ts` | Nodemailer transport |
| Slack channel | `src/modules/notifications/channels/slack.ts` | Webhook integration |
| Delivery | `src/modules/queue/jobs/notification-delivery.job.ts` | PgBoss background job |
| Policies | `src/modules/notifications/policies.ts` | Delivery preferences, quiet hours |
| Real-time push | `src/server/realtime/event-bus.ts` | SSE via Redis Pub/Sub |

**CLEAN — No duplication.** Single notification system with three channels, background delivery, and SSE push.

---

## Policy Engine

| Primitive | Canonical Path | Prisma Model | Purpose |
|---|---|---|---|
| Transaction policies | `src/modules/policies/policies.service.ts` | `Policy` | Financial transaction rules: spending limits, transfer velocity, wallet restrictions |
| Compliance policies | `src/modules/compliance-specialist/policy-engine.ts` | `CompliancePolicy` | Regulatory compliance: AML thresholds, KYC status, SOX controls |
| Governance mapping | `src/modules/governance/policy-registry.ts` | — | Maps policies to frameworks (ISO 27001, SOC 2, PCI DSS). No evaluation logic. |

### Assessment: TWO POLICY MODELS — Document as Intentional

Same class name (`PolicyEngine`), different Prisma models, different evaluation semantics:

- `policies.service.ts` → `evaluateTransaction(ctx, transaction)` → returns pass/fail with policy violations
- `compliance-specialist/policy-engine.ts` → `evaluateCompliance(ctx, entity)` → returns compliance score with violations

**Recommendation**: Create a unified `PolicyEngine` interface with domain-specific rule evaluators:

```typescript
interface PolicyEngine {
  evaluate(ctx: TenantContext, target: PolicyTarget): Promise<PolicyResult>
}

class TransactionPolicyEngine implements PolicyEngine { ... }
class CompliancePolicyEngine implements PolicyEngine { ... }
```

---

## Money Value Object

| Primitive | Canonical Path | Notes |
|---|---|---|
| `formatMoney(amountStr, currencyCode)` | `src/lib/format.ts:2` | Full currency formatting with `Intl.NumberFormat`. Accepts string amount + ISO 4217 code. |
| `formatCurrency(amount)` | `src/lib/format.ts:20` | Abbreviated number formatting (B/M/K). Dollar-denominated. |
| `formatDateTime(iso)` | `src/lib/format.ts:27` | Date/time formatting with `Intl.DateTimeFormat`. |

### CONFLICT: 116 Local `formatCurrency` Definitions

The canonical `formatCurrency` at `src/lib/format.ts:20` is duplicated across **116 component files**. Most local copies:

- Use `$` prefix with `.toFixed(2)` instead of `Intl.NumberFormat`
- Some accept a `currency` parameter, others hardcode USD
- None use B/M/K abbreviation

**Action**: Delete all local `formatCurrency` definitions. Import from `@/lib/format`:

```typescript
import { formatCurrency } from "@/lib/format";
```

For components that need currency-aware formatting (not abbreviated), use `formatMoney`:

```typescript
import { formatMoney } from "@/lib/format";
formatMoney(amount.toString(), "EUR"); // €1,234.56
```

### Additional: Design System Variant

`src/components/design-system/micro/micro-components.tsx:86` exports a `formatCurrency` with `compact` parameter. This is a design system primitive and may be kept as a separate utility, but should be documented as distinct from the canonical `formatCurrency`.

---

## Currency Service

| Primitive | Canonical Path | Methods |
|---|---|---|
| Currency service | `src/modules/currency/currency.service.ts` | `getRate()`, `convert()`, `listRates()` — 173 lines |
| FX service | `src/modules/fx/fx.service.ts` | `syncRates()`, `getRate()`, `convert()`, `listRates()` — 273 lines |
| FX provider | `src/modules/fx/fx.provider.ts` | `createFxProvider()` — external rate source abstraction |
| FX types | `src/modules/fx/fx.types.ts` | `FxSyncResult`, `FxSyncStatus` |

### CONFLICT: Two Near-Identical Services

Both services:
- Query the same `ExchangeRate` Prisma model
- Define identical `FALLBACK_RATES` objects
- Provide `getRate`, `convert`, `listRates` with same signatures
- Use same `getCached` + `tenantKey` + `CacheDomains` caching pattern
- Call `recordAudit` on operations

The FX service additionally provides `syncRates` (bulk sync from external provider) and `FxProvider` abstraction.

**Action**: Merge into `src/modules/currency/currency.service.ts`:

1. Add `syncRates()` method from `fx.service.ts`
2. Add `FxProvider` abstraction from `fx/fx.provider.ts`
3. Add `FxSyncResult`/`FxSyncStatus` types from `fx/fx.types.ts`
4. Update all `fx.service.ts` consumers to import from `currency.service.ts`
5. Delete `src/modules/fx/` (4 files)

---

## Supported Currencies Constants

| Location | Set | Count | Scope |
|---|---|---|---|
| `src/domain/constants/currencies.ts:2` | `["USD", "EUR", "GBP"]` | 3 | Ledger wallet fields |
| `src/modules/fx/fx.service.ts:11` | 12 currencies | 12 | FX exchange rates |
| `src/modules/fx/fx.provider.ts:4` | 12 currencies (same as above) | 12 | FX provider sync |
| `src/server/banking/accounts/currencies/engine.ts:3` | 35 currencies | 35 | Banking account currencies |

**Action**: Create a single source of truth at `src/domain/constants/currencies.ts`:

```typescript
export const LEDGER_CURRENCIES = ["USD", "EUR", "GBP"] as const;
export const FX_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "CHF", "AUD", "MXN", "BRL", "NGN", "AED", "ZAR"] as const;
export const BANKING_CURRENCIES = [...FX_CURRENCIES, "CNY", "HKD", "SGD", "INR", "KRW", "SEK", "NOK", "DKK", "PLN", "ZAR", "NGN", "KES", "EGP", "BHD", "QAR", "KWD", "OMR", "MXN", "BRL", "TRY", "MYR", "THB", "VND", "PHP", "TWD", "NZD", "SAR"] as const;
```

---

## Date & Time

| Primitive | Canonical Path | Purpose |
|---|---|---|
| `formatDateTime(iso)` | `src/lib/format.ts:27` | Standard date/time formatting via `Intl.DateTimeFormat` |
| `DateLocalizationService` | `src/localization/formatting-services.ts` | Arabic-aware date formatting, RTL support |
| `DateCell` | `src/components/enterprise/table/cell-formatters.tsx` | Relative dates ("3m ago") for table display |

**CLEAN — No critical duplication.** Each serves a distinct purpose: standard, locale-aware, and relative-time display.

---

## Tenant Resolver

| Primitive | Canonical Path | Notes |
|---|---|---|
| `requireTenantContext(userId, companyId, role)` | `src/server/context/tenant-context.ts` | Returns `TenantContext` with `userId`, `companyId`, `companyRole`. Used by 100+ API routes. |

**CLEAN — Single implementation.** All API routes call `requireTenantContext()` to establish tenant scope.

---

## Validation

| Primitive | Canonical Path | Notes |
|---|---|---|
| Zod schemas | `src/lib/validations/` (12 files) | API request/response validation |
| `handleRouteError(err, req)` | `src/server/http/handle-route.ts` | Unified error-to-HTTP-response mapping |
| `zodErrorResponse(err)` | `src/server/http/handle-route.ts` | Zod error formatting |

### DEPRECATED: `src/lib/validations/automation-studio.ts` helpers

The `validationError()`, `notFoundError()`, `serverError()` functions in this file duplicate `handleRouteError()`. They construct HTTP responses manually, bypassing standardized error logging.

**Action**: Delete these helpers. Migrate all consumers to `handleRouteError()` from `src/server/http/handle-route.ts`.

---

## Logging

| Primitive | Canonical Path | Notes |
|---|---|---|
| **Authoritative logger** | `src/lib/logger.ts` | Pino. JSON structured output. Redacts `authorization`, `cookie`, `password`, `secret`. Configurable level via `LOG_LEVEL`. |

### DEPRECATE: `src/server/observability/logger.ts` (StructuredLogger)

| Attribute | Pino (`lib/logger.ts`) | StructuredLogger (`observability/logger.ts`) |
|---|---|---|
| Implementation | Pino library | Manual `console.log` |
| Serialization | Automatic JSON | Manual spread |
| Redaction | Yes (4 fields) | No |
| Child loggers | `logger.child({...})` | `.withContext({...})` |
| Transports | Configurable | `console.log` only |
| Consumers | 60+ files | 8 files |

**Action**: Migrate 8 StructuredLogger consumers to Pino:
1. Find all imports of `StructuredLogger` or `observability/logger`
2. Replace with `import { logger } from "@/lib/logger"`
3. Replace `new StructuredLogger().withContext({...}).info(msg, data)` with `logger.info({...data}, msg)`
4. Delete `src/server/observability/logger.ts`

---

## Configuration

| Primitive | Canonical Path | Notes |
|---|---|---|
| **Authoritative env validation** | `src/server/env/validate.ts` | `validateEnv()` — runtime env variable validation |
| Infrastructure config | `src/server/persistence/config.ts` | Typed `InfrastructureConfig` for cache, locks, queues |

### DEPRECATE: `src/server/security/environment.ts` (EnvironmentValidator)

Overlaps with `src/server/env/validate.ts`. Two env validators may validate different variable sets, creating confusion about which is authoritative.

**Action**: Consolidate into a single typed env module at `src/server/env/validate.ts`. Move any security-specific validation rules into the canonical validator.

---

## Secrets

| Primitive | Canonical Path | Notes |
|---|---|---|
| Env-based | All services read `process.env` directly | No centralized env registry |
| Encryption | `src/server/security/encryption.ts` | AES-256-GCM with key rotation |

**No centralized typed env module.** Recommend creating `src/server/env/env.ts` with typed env access:

```typescript
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  REDIS_URL: process.env.REDIS_URL ?? "",
  AI_API_KEY: process.env.AI_API_KEY ?? "",
  // ...
} as const;
```

---

## Caching

| Primitive | Canonical Path | API | Consumers |
|---|---|---|---|
| **Primary cache API** | `src/server/cache/cache-service.ts` | `getCached(key, fetchFn, ttl)`, `invalidateKey()`, `invalidatePattern()` | Business services |
| **Canonical key builder** | `src/server/cache/keys.ts` | `tenantKey(tenantId, ...parts)`, `globalKey(...parts)`, `CacheDomains` | Business services |
| Cache tiers | `src/server/cache/cache-service.ts` | `CacheTier.SHORT` (30s), `MEDIUM` (300s), `LONG` (3600s), `PERMANENT`, `NEVER` | All |

**Phase 18.1A: Removed CacheManager scaffolding** — `CacheManager` class (`cache-manager.ts`) and `CacheKeyBuilder` class (`cache-keys.ts`) deleted. `getCached()` is the sole cache access pattern, `keys.ts` is the sole key builder.

---

## Queues

| Primitive | Canonical Path | Notes |
|---|---|---|
| **Authoritative queue** | `src/modules/queue/queue.service.ts` | PgBoss-backed. 18+ registered handlers. `enqueue()`, `scheduleCron()`, `unscheduleCron()`, `registerHandler()` |
| Job types | `src/modules/queue/job-types.ts` | Typed payload schemas for all job types |
| Job handlers | `src/modules/queue/jobs/` | 10 job files: notification-delivery, alert-engine, fx-sync, report-generate, briefing-generate, webhook-send, webhook-retry, anomaly-detection, intelligence-snapshot |

**Phase 18.1A: Removed MemoryQueue scaffolding** — `src/server/queues/` (MemoryQueue, QueueManager, queue-errors, default-queues, types, index) deleted. PgBoss is the sole queue system.

### Banking Queues — KEEP SEPARATE

Banking has its own in-memory queue engines in `src/server/banking/` for sync orchestration. These are domain-specific and serve a different purpose (high-throughput bank sync processing vs. business job scheduling).

---

## Event Buses

| Primitive | Canonical Path | Purpose | Status |
|---|---|---|---|
| OrchestrationEventBus | `src/server/banking/orchestrator/events/events.ts` | Banking orchestrator events (command, provider, retry, circuit breaker, execution) | **ACTIVE** |
| ConnectorEventBus | `src/modules/connector-platform/event-hooks.ts` | Connector lifecycle events | **ACTIVE** |
| Realtime EventBus | `src/server/realtime/event-bus.ts` | Cross-instance via Redis Pub/Sub + in-memory fan-out | **ACTIVE** — unique: Redis bridge |
| ~~EnterpriseEventBus~~ | ~~`src/modules/enterprise-intelligence/event-bus.ts`~~ | ~~Cross-domain enterprise events~~ | **Phase 18.1A: Removed — zero subscribers** |
| ~~BankingEventBus~~ | ~~`src/server/banking/events/event-bus.ts`~~ | ~~Banking domain events~~ | **Phase 18.1A: Removed — zero subscribers** |
| ~~internal-event-bus~~ | ~~`src/modules/orchestration/internal-event-bus.ts`~~ | ~~Orchestration module events~~ | **Phase 18.1A: Removed — zero subscribers** |
| ~~CacheEventBus~~ | ~~`src/server/cache/cache-events.ts`~~ | ~~Cache observability~~ | **Phase 18.1A: Removed — zero subscribers** |

---

## Search

| Primitive | Canonical Path | Notes |
|---|---|---|
| Enterprise search engine | `src/server/search/enterprise-search-engine.ts` | Full-text search with TF-IDF ranking |
| Search ranking | `src/server/search/search-ranking-engine.ts` | Relevance scoring |
| Semantic search | `src/server/search/semantic-search-service.ts` | Semantic similarity |
| Index management | `src/server/search/search-index-manager.ts` | In-memory inverted index |
| Suggestions | `src/server/search/search-suggestion-engine.ts` | Auto-complete |
| Entity resolution | `src/server/search/entity-resolver.ts` | Cross-entity linking |
| Permission filter | `src/server/search/search-permission-filter.ts` | Tenant-scoped results |
| Analytics | `src/server/search/search-analytics.ts` | Search usage metrics |
| Knowledge index | `src/server/search/knowledge-indexer.ts` | Document indexing |
| Recent searches | `src/server/search/recent-search-service.ts` | User search history |
| Audit | `src/server/search/search-audit-service.ts` | Search event logging |
| Types | `src/server/search/types.ts` | Search interfaces |

**CLEAN — Single implementation.** 13 files covering the full search pipeline. Client-side table search (`table-search.tsx`) is a distinct use case.

---

## Error Handling

| Primitive | Canonical Path | Notes |
|---|---|---|
| Route error handler | `src/server/http/handle-route.ts` | `handleRouteError(err, req)` — unified error-to-HTTP-response mapping |
| Zod error formatter | `src/server/http/handle-route.ts` | `zodErrorResponse(err)` — structured validation error responses |
| Error types | `src/lib/errors/app-error.ts` | `AppError` hierarchy: `ConflictError`, `ForbiddenError`, `ValidationError`, `NotFoundError`, `UnauthorizedError` |
| Body parser | `src/server/http/handle-route.ts` | `parseJsonBody<T>(req)` — with 1MB size limit, 10MB hard cap |

**CLEAN** — Single error handling pattern. Deprecated helpers in `automation-studio.ts` should be migrated.

---

## Summary: Action Items

| Priority | Action | Files Affected | Status |
|---|---|---|---|
| P0 | ~~Delete `src/server/identity/` (dead code)~~ | ~~13 files~~ | **BLOCKED** — 9 page consumers in `src/app/(shell)/system/identity/` |
| P0 | ~~Delete `src/server/queues/` (unused scaffolding)~~ | ~~6 files~~ | **COMPLETE** — Phase 18.1A |
| P0 | ~~Delete `src/modules/rbac/permission-registry.ts`~~ | ~~1 file + rbac/index.ts~~ | ⬜ Pending |
| P1 | Delete 116 local `formatCurrency` definitions | 116 files | ⬜ Pending |
| P1 | Merge CurrencyService + FxService | 4 files (fx/*) | ⬜ Pending |
| P1 | Delete rogue AI route, route through ai-provider | 1 file | ⬜ Pending |
| P1 | Migrate StructuredLogger → Pino | 8 files | ⬜ Pending |
| P2 | ~~Consolidate event buses (5 → 2)~~ | ~~5 bus files + consumers~~ | **COMPLETE** — Phase 18.1A |
| P2 | ~~Deprecate orchestration WorkflowEngine~~ | ~~1 file + consumers~~ | **RENAMED** — Phase 18.1A: OrchestrationExecutionEngine |
| P2 | ~~Unify cache key builders~~ | ~~1 file (cache-keys.ts)~~ | **COMPLETE** — Phase 18.1A |
| P2 | Consolidate env validators | 1 file (security/environment.ts) | ⬜ Pending |
| P3 | Merge business + IAM audit writers | 2 files | ⬜ Pending |
| P3 | Unify policy engines under single interface | 2 files | ⬜ Pending |
| P3 | Create typed env module | New file | ⬜ Pending |
