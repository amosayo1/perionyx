# Enterprise Architecture Report — Phase 18.0 / 18.1A

> **Status**: Assessment Complete
> **Date**: 2026-07-21
> **Scope**: Full platform — modules, API routes, singletons, infrastructure

---

## Executive Summary

The Perionyx platform comprises **67 business modules** (excluding infrastructure), **402 API route files**, and **33 global singletons** across 10 architectural domains. The platform functions end-to-end and passes typecheck and production build.

However, rapid feature development has accumulated architectural debt across six critical areas:

| Finding | Severity | Files Affected |
|---|---|---|
| Workflow engine duplication | HIGH | 2 engines, different Prisma tables (Phase 18.1A: orchestration engine renamed to OrchestrationExecutionEngine) |
| 2 independent event buses | HIGH | Reduced from 7 in Phase 18.1A — OrchestrationEventBus + connectorPlatform event-hooks remain |
| 116 `formatCurrency` definitions | HIGH | Canonical function in `src/lib/format.ts` duplicated across 116 component files |
| 2 competing currency exchange services | MEDIUM | `currency.service.ts` vs `fx.service.ts` with identical `FALLBACK_RATES` |
| 2 competing loggers | MEDIUM | Pino (60+ consumers) vs StructuredLogger (8 consumers) |
| 2 competing cache access patterns | ~~MEDIUM~~ RESOLVED | `getCached()` functional API only — Phase 18.1A |

This report documents every duplication, conflict, and dead-code path discovered during the Phase 18.0 architecture audit.

---

## Architecture Inventory

### Authentication

| Component | Path | Role |
|---|---|---|
| Primary auth adapter | `src/modules/identity/adapters/local.ts` | Fail-closed local authentication, MFA-aware credential verification |
| Edge proxy | `src/proxy.ts` | Token extraction, rate limiting, CSRF validation, correlation ID generation |
| Session management | `src/server/iam/session.ts` | JWT creation (24h TTL), `tokenVersion` revocation, session lifecycle |
| MFA | `src/server/iam/mfa.ts` | TOTP enrollment/verification, recovery codes, timing-safe comparison |
| Auth endpoints | `src/app/api/auth/` | NextAuth, register, sandbox-login, MFA endpoints |

**Assessment: CLEAN** — Single authentication flow. Edge proxy extracts tokens, session module manages JWT, identity adapter validates credentials. No duplication.

### Authorization

| Component | Path | Permissions |
|---|---|---|
| IAM permissions | `src/server/iam/permissions.ts` | **60 permissions** with `GranularPermission` type, scoped by category (workflow, treasury, approvals, wallets, connectors, reconciliation, audit, admin, security, risk, analytics, reporting, automation, onboarding) |
| RBAC service | `src/modules/rbac/rbac.service.ts` | Enforces permissions using `GranularPermission` from `iam/permissions.ts` |
| Legacy permission registry | `src/modules/rbac/permission-registry.ts` | **24 permissions** (`PermissionDefinition` type) — different type system, different permission names |

**Assessment: CONFLICT** — Two permission registries with incompatible type systems:

- `iam/permissions.ts` defines 60 permissions using `GranularPermission` union type with `requiresMfa` flags and scoped categories
- `rbac/permission-registry.ts` defines 24 permissions using `PermissionDefinition` type with different naming (e.g., `transaction.create` vs `treasury.transfer`)
- The `rbac/index.ts` barrel re-exports `PermissionRegistry` from the legacy file, creating a public API surface that conflicts with the IAM system
- Zero external consumers of `src/server/identity/` were found (see Dead Code section), but the permission-registry.ts is exported from `rbac/index.ts`

### Audit

| Component | Path | Mechanism |
|---|---|---|
| Security audit | `src/server/security/audit-logger.ts` | Tamper-evident SHA-256 chain, `AuditEventStore`, sequential hash linking |
| Business audit | `src/modules/audit/audit.service.ts` | `recordAudit()` function, Prisma `AuditLog` table, standard CRUD events |
| IAM audit | `src/server/iam/audit.ts` | `recordIAMAudit()` function, identity-specific events (login, MFA, session) |

**Assessment: THREE WRITERS** — All three write to the `AuditLog` Prisma model but serve distinct purposes:

1. **Security audit** — Cryptographic integrity chain for compliance. Each event includes `previousHash` creating an append-only ledger. Used for SOC 2 / ISO 27001 evidence.
2. **Business audit** — Operational events: transaction creation, approval, wallet changes. ~30 consumers across business modules.
3. **IAM audit** — Identity events: login attempts, MFA enrollment, session creation. ~5 consumers.

**Risk**: No single query interface spans all three writers. An auditor requesting "all security-relevant events" must query three separate code paths.

### Approval

| Component | Path | Purpose |
|---|---|---|
| Transaction approval | `src/modules/ledger/approval-workflow.ts` | `ApprovalWorkflowEngine` — transaction-specific approval with wallet-level thresholds, delegation, escalation, timeout |
| Workflow approval | `src/modules/workflow/steps/approval-step.ts` | Generic workflow step executor — role-based approval within workflow instances |
| Approval matrix | `src/modules/automation-studio/approval-matrix-evaluator.ts` | `ApprovalMatrixEvaluator` — role/dept/threshold rules engine, evaluates conditions via `conditionEvaluator` |

**Assessment: INTENTIONAL SEPARATION** — Three distinct purposes with no code overlap:

1. `ApprovalWorkflowEngine` — financial transaction governance (wallet approvers, amount thresholds, compliance checks)
2. `ApprovalStepExecutor` — generic workflow step (any approval within a workflow graph)
3. `ApprovalMatrixEvaluator` — rule-matching engine (which approver role applies based on conditions)

The evaluator feeds data to both the ledger and workflow approval systems. Recommend documenting the integration contracts explicitly.

### Workflow Engine

| Component | Path | Execution Model | Prisma Tables |
|---|---|---|---|
| Primary engine | `src/modules/workflow/engine.ts` | Singleton, dependency graph, 9 step executors (approval, decision, policy-evaluation, notification, delay, connector, AI-recommendation, conditional-branch, human-task), version snapshots, state machine | `WorkflowInstance`, `WorkflowStepExecution` |
| Orchestration engine | `src/modules/orchestration/workflow-engine.ts` | Static methods, sequential step execution (index-sorted), 5 step types, no dependency graph | `WorkflowExecution`, `WorkflowStepExecutionData` (different model) |

**Phase 18.1A: Renamed to OrchestrationExecutionEngine** — renamed from `WorkflowEngine` to eliminate naming collision with the primary engine at `src/modules/workflow/engine.ts`.

**Assessment: DUPLICATE** — Two workflow engines with different:

- **Execution models**: Primary uses dependency graph resolution; orchestration uses sequential index sort
- **Type systems**: Primary imports from `src/modules/workflow/types.ts`; orchestration imports from `src/modules/orchestration/types.ts`
- **Prisma models**: Primary uses `WorkflowInstance`; orchestration uses `WorkflowExecution`
- **Step executors**: Primary has 9 specialized executors; orchestration has a monolithic `executeStep` method
- **Event systems**: Primary uses `realtime/event-bus.ts`; orchestration uses `internal-event-bus.ts`
- **Consumers**: Zero cross-imports found — the two engines are used by different route handlers

**Impact**: Two independent workflow execution paths means workflow state can diverge depending on which engine processes the request.

### Notifications

| Component | Path |
|---|---|
| Service | `src/modules/notifications/notifications.service.ts` |
| Channels | `src/modules/notifications/channels/` (in-app, email/nodemailer, Slack/webhook) |
| Delivery | PgBoss background jobs via `notification-delivery.job.ts` |
| Policies | `src/modules/notifications/policies.ts` |
| Real-time | SSE via `realtime/event-bus.ts` |

**Assessment: CLEAN** — Single notification system with three channels, background delivery, and SSE push. No duplication.

### Policies

| Component | Path | Model |
|---|---|---|
| Transaction policies | `src/modules/policies/policies.service.ts` | `Policy` Prisma model — evaluates financial transactions against spending limits, transfer rules |
| Compliance policies | `src/modules/compliance-specialist/policy-engine.ts` | `CompliancePolicy` Prisma model — evaluates regulatory compliance (AML, KYC, SOX) |
| Governance mapping | `src/modules/governance/policy-registry.ts` | Maps policies to governance frameworks (ISO, SOC 2, PCI DSS) — no evaluation logic |

**Assessment: TWO POLICY ENGINES** — Same class name (`PolicyEngine`), different Prisma models, different evaluation semantics:

- `policies.service.ts`: Transaction-level rules (amount limits, velocity checks, wallet restrictions)
- `compliance-specialist/policy-engine.ts`: Regulatory compliance rules (AML thresholds, KYC status, SOX controls)

Governance `policy-registry.ts` is a mapping layer, not a duplicate. Recommend: merge the two policy engines under a unified interface with domain-specific rule evaluators.

### Money & Currency

#### Currency Formatting

| Component | Path | Count |
|---|---|---|
| Canonical `formatCurrency` | `src/lib/format.ts:20` | 1 canonical definition |
| Design system `formatCurrency` | `src/components/design-system/micro/micro-components.tsx:86` | 1 variant (compact formatting) |
| Enterprise intelligence `formatCurrency` | `src/modules/enterprise-intelligence/types.ts:154` | 1 variant |
| Local `formatCurrency` definitions | 113 component files across `investments/`, `fpa/`, `consolidation/`, `treasury/`, `tax/`, `gl/`, `fixed-assets/`, `executive-*/` | **113 duplicates** |

**Assessment: SIGNIFICANT DUPLICATION** — 116 total `formatCurrency` definitions. The canonical version in `src/lib/format.ts` uses `Intl.NumberFormat` with abbreviated output (B/M/K). Most local copies use `$` prefix with `.toFixed(2)`, some accept a currency parameter, some don't. This creates inconsistent currency display across the UI.

#### Currency Exchange Services

| Component | Path | Key Methods |
|---|---|---|
| Currency service | `src/modules/currency/currency.service.ts` | `getRate()`, `convert()`, `listRates()` — 173 lines |
| FX service | `src/modules/fx/fx.service.ts` | `syncRates()`, `getRate()`, `convert()`, `listRates()` — 273 lines |

**Assessment: DUPLICATE** — Both services:

- Query the same `ExchangeRate` Prisma model
- Define identical `FALLBACK_RATES` objects (lines 9-16 in currency, lines 15-22 in fx)
- Provide the same `getRate`, `convert`, `listRates` methods
- Use the same `getCached` + `tenantKey` + `CacheDomains` caching pattern
- Both call `recordAudit` on successful operations

The FX service adds `syncRates()` (bulk sync from external provider) and an `FxProvider` abstraction. Recommend: merge into a single `CurrencyService` with `syncRates` added.

#### Supported Currencies Constants

| Location | Set | Count |
|---|---|---|
| `src/domain/constants/currencies.ts:2` | `["USD", "EUR", "GBP"]` | 3 currencies |
| `src/modules/fx/fx.service.ts:11` | `["USD", "EUR", "GBP", "JPY", "CAD", "CHF", "AUD", "MXN", "BRL", "NGN", "AED", "ZAR"]` | 12 currencies |
| `src/modules/fx/fx.provider.ts:4` | Same 12 as fx.service | 12 currencies (duplicate of above) |
| `src/server/banking/accounts/currencies/engine.ts:3` | 35 currencies including all above | 35 currencies |

**Assessment: THREE SETS** — The domain constants define 3 currencies (ledger wallet scope), the FX module defines 12 (exchange scope), and the banking engine defines 35 (account scope). Each serves a different domain but there's no shared source of truth or cross-referencing.

### Dates & Time

| Component | Path | Purpose |
|---|---|---|
| Canonical formatter | `src/lib/format.ts:27` | `formatDateTime()` — `Intl.DateTimeFormat` with medium date + short time |
| Locale-aware formatter | `src/localization/formatting-services.ts` | `DateLocalizationService` — Arabic-aware, RTL date formatting |
| Relative date | `src/components/enterprise/table/cell-formatters.tsx` | `DateCell` — relative dates ("3m ago") for table display |

**Assessment: MOSTLY CLEAN** — The locale-aware service provides Arabic support for the localization initiative. The `DateCell` provides relative-time display for tables, which is a distinct use case. No critical duplication.

### Validation

| Component | Path | Count |
|---|---|---|
| Zod schemas | `src/lib/validations/` | 12 schema files (reconciliation, compliance-specialist, tax-specialist, finance-collaboration, fpa-specialist, agent-framework, audit-specialist, cfo-advisor, treasury-specialist, automation-studio, controller-specialist, board-governance) |
| Canonical helpers | `src/server/http/handle-route.ts` | `handleRouteError()`, `zodErrorResponse()` |
| Deprecated helpers | `src/lib/validations/automation-studio.ts` | `validationError()`, `notFoundError()`, `serverError()` — duplicates `handleRouteError` |

**Assessment: MOSTLY CLEAN** — Zod is the canonical validation library. The deprecated helpers in `automation-studio.ts` need migration to `handleRouteError`. Domain-specific manual validators in ledger and workflow are legitimate (e.g., `TransactionValidator` checks business invariants that Zod schemas don't cover).

### Logging

| Component | Path | Consumers | Format |
|---|---|---|---|
| Pino logger | `src/lib/logger.ts` | 60+ files | JSON structured, redaction, level from `LOG_LEVEL` env |
| StructuredLogger | `src/server/observability/logger.ts` | 8 files | Plain `console.log` with manual JSON, context injection |

**Assessment: DUPLICATE** — Two logging systems with different capabilities:

- **Pino**: Production-grade, automatic JSON serialization, redaction of sensitive fields (`authorization`, `cookie`, `password`), configurable level, child loggers
- **StructuredLogger**: Manual implementation using `console.log`, context injection via `withContext()`, no redaction, no transport configuration

The `StructuredLogger` should be deprecated and its 8 consumers migrated to Pino.

### Error Handling

| Component | Path | Purpose |
|---|---|---|
| Canonical handlers | `src/server/http/handle-route.ts` | `handleRouteError()` — unified error-to-HTTP-response mapping, `zodErrorResponse()` |
| Error types | `src/lib/errors/app-error.ts` | `AppError` hierarchy (`ConflictError`, `ForbiddenError`, `ValidationError`, etc.) |
| Deprecated helpers | `src/lib/validations/automation-studio.ts` | `validationError()`, `notFoundError()`, `serverError()` — manual response construction |

**Assessment: CLEAN CORE** — The canonical error handling pattern is well-designed. The deprecated helpers in `automation-studio.ts` bypass `handleRouteError` and construct responses manually, losing standardized error logging and format consistency.

### Caching

| Component | Path | API Style |
|---|---|---|
| Cache service | `src/server/cache/cache-service.ts` | Functional: `getCached(key, fetchFn, ttl)`, `invalidateKey()`, `invalidatePattern()` — 251 lines, Redis-backed, tiered TTL |
| Key builder (functional) | `src/server/cache/keys.ts` | `tenantKey()` and `globalKey()` functions with `CacheDomains` constants |

**Phase 18.1A: Removed CacheManager scaffolding** — `CacheManager` class and `CacheKeyBuilder` class deleted. `getCached()` is the sole cache access pattern, `keys.ts` is the sole key builder.

**Assessment: MOSTLY CLEAN** — Single cache access pattern (`getCached()`) and single key builder (`keys.ts`). The two key builders produced incompatible formats; now standardized on the functional `keys.ts` pattern used by business services.

### Queues

| Component | Path | Type | Status |
|---|---|---|---|
| PgBoss queue service | `src/modules/queue/queue.service.ts` | Production queue with 18+ registered handlers | Active — sole queue system |
| Banking queues | `src/server/banking/` | 2 in-memory queue engines | Domain-specific, separate from PgBoss |

**Phase 18.1A: Removed MemoryQueue scaffolding** — `src/server/queues/` (MemoryQueue, QueueManager, default-queues) deleted. PgBoss is the sole queue system. Banking retains its own domain-specific in-memory queues for sync orchestration.

### Events

| Bus | Path | Event Types | Architecture |
|---|---|---|---|
| OrchestrationEventBus | `src/server/banking/orchestrator/events/events.ts:31` | 20 types (command, provider, retry, circuit breaker, execution) | `Map<EventType, Handler[]>`, sync fan-out with event history (5K ring buffer) |
| ConnectorEventBus | `src/modules/connector-platform/event-hooks.ts:14` | `ConnectorEventType` union | `Map<EventType, Set<Handler>>`, async `Promise.all` fan-out |
| ~~EnterpriseEventBus~~ | ~~`src/modules/enterprise-intelligence/event-bus.ts`~~ | ~~15 types~~ | **Phase 18.1A: Removed — zero subscribers** |
| ~~BankingEventBus~~ | ~~`src/server/banking/events/event-bus.ts`~~ | ~~Banking-specific~~ | **Phase 18.1A: Removed — zero subscribers** |
| ~~internal-event-bus~~ | ~~`src/modules/orchestration/internal-event-bus.ts`~~ | ~~Generic string-typed~~ | **Phase 18.1A: Removed — zero subscribers** |
| ~~CacheEventBus~~ | ~~`src/server/cache/cache-events.ts`~~ | ~~10 types~~ | **Phase 18.1A: Removed — zero subscribers** |
| Realtime EventBus | `src/server/realtime/event-bus.ts` | `RealtimeEventName` union | Redis Pub/Sub for cross-instance + in-memory fan-out |

**Assessment: 2 IN-PROCESS BUSES** — Phase 18.1A removed 5 dead event buses with zero subscribers. Only OrchestrationEventBus (banking orchestrator events) and ConnectorEventBus (connector lifecycle events) remain. Realtime EventBus (Redis Pub/Sub) is a separate cross-instance system and was not part of the consolidation.

| Bus | subscribe | publish | unsubscribe | clearSubscriptions | history |
|---|---|---|---|---|---|
| OrchestrationEventBus | `subscribe(type, handler)` returns `() => void` | `publish(type, data)` | `unsubscribe(type, handler)` | `clearSubscriptions()` | 5K ring buffer |
| ConnectorEventBus | `subscribe(event, handler)` | `async publish(payload)` | `unsubscribe(event, handler)` | `clearSubscriptions()` | No |

### Search

| Component | Path | Files |
|---|---|---|
| Enterprise search | `src/server/search/` | 13 files: enterprise-search-engine, search-ranking-engine, semantic-search-service, search-index-manager, search-suggestion-engine, entity-resolver, search-analytics, knowledge-indexer, search-permission-filter, recent-search-service, search-audit-service, types, index |
| Client search | `src/components/enterprise/table/table-search.tsx` | Client-side table filtering |

**Assessment: CLEAN** — Enterprise search is well-structured with 13 files covering indexing, ranking, permissions, and audit. Client-side table search is a distinct use case (no server round-trip needed for small datasets).

### Configuration

| Component | Path | Purpose |
|---|---|---|
| Env validation | `src/server/env/validate.ts` | `validateEnv()` — runtime env variable validation |
| Security env | `src/server/security/environment.ts` | `EnvironmentValidator` — overlaps with env validation |
| Infrastructure config | `src/server/persistence/config.ts` | Typed `InfrastructureConfig` for cache, locks, queues, observability |

**Assessment: MODERATE DUPLICATION** — Two environment validators that may validate overlapping sets of variables. Recommend: consolidate into a single typed env module.

### AI Architecture

| Component | Path | Files | Purpose |
|---|---|---|---|
| AI Provider | `src/modules/ai-provider/` | 19 files | Multi-provider abstraction: OpenAI, Anthropic, Gemini, Azure OpenAI, Mistral, Grok, Cohere. 22 models, health monitoring, rate limiting, retry logic |
| Copilot | `src/modules/copilot/` | 9 files | Persona-based executive chat: conversation service, AI service, context builder, knowledge index, timeline engine, command center, intelligence pipeline, briefing generation |
| Agent Framework | `src/modules/agent-framework/` | 13 files | Autonomous agent system: registry, runtime, context engine, memory, evidence, decisions, approval integration, collaboration, human interaction, governance |
| Intelligence modules | 4 modules | intelligence, decision-intelligence, enterprise-intelligence, intelligence-platform | Domain-specific intelligence services |
| Rogue AI route | `src/app/api/automation-studio/ai/route.ts` | 1 file | Raw `fetch()` to Gemini API, bypasses `ai-provider` entirely |

**Assessment: MOSTLY CLEAN** — The AI provider layer is well-designed with provider abstraction, health monitoring, and model registry. The rogue route at `src/app/api/automation-studio/ai/route.ts:35` makes a direct `fetch()` call to Google's Gemini API using `AI_API_KEY` env var, completely bypassing the `ai-provider` module's rate limiting, retry, health checks, and audit logging.

---

## Dead Code

### `src/server/identity/` — 13 Files, Zero Consumers

| File | Path |
|---|---|
| types.ts | `src/server/identity/types.ts` |
| identity-provider.ts | `src/server/identity/identity-provider.ts` |
| authentication.ts | `src/server/identity/authentication.ts` |
| session-manager.ts | `src/server/identity/session-manager.ts` |
| user-provisioning.ts | `src/server/identity/user-provisioning.ts` |
| group-manager.ts | `src/server/identity/group-manager.ts` |
| role-manager.ts | `src/server/identity/role-manager.ts` |
| permission-manager.ts | `src/server/identity/permission-manager.ts` |
| policy-engine.ts | `src/server/identity/policy-engine.ts` |
| audit-service.ts | `src/server/identity/audit-service.ts` |
| sso-handler.ts | `src/server/identity/sso-handler.ts` |
| identity-facade.ts | `src/server/identity/identity-facade.ts` |
| index.ts | `src/server/identity/index.ts` |

**Assessment**: Zero imports from `src/app/` or `src/modules/` found. This module appears to be an alternative IAM implementation that was never integrated. Should be deleted or clearly marked as a future extension point.

**Phase 18.1A: BLOCKED** — 9 page consumers in `src/app/(shell)/system/identity/` (dashboard, users, groups, roles, permissions, providers, sessions, audit, policies). Cannot delete until pages are migrated or removed.

---

## Critical Findings (Ranked by Impact)

### 1. Workflow Engine Duplication — HIGH

Two workflow engines with different execution models, type systems, and Prisma tables. The primary engine (`src/modules/workflow/engine.ts:45`) uses a singleton pattern with dependency graph resolution and 9 specialized step executors. The orchestration engine (`src/modules/orchestration/workflow-engine.ts:6`) uses static methods with sequential execution. Zero cross-imports between them.

**Impact**: Workflow state can diverge. Bugs fixed in one engine won't be fixed in the other. Two sets of Prisma tables must be maintained.

### 2. Event Bus Proliferation — ~~HIGH~~ RESOLVED

~~Six~~ **Two** independent in-process event buses. Phase 18.1A removed 5 dead event buses with zero subscribers (EnterpriseEventBus, BankingEventBus, internal-event-bus, CacheEventBus, and EnterpriseIntelligence event bus). Only OrchestrationEventBus (banking orchestrator) and ConnectorEventBus (connector lifecycle) remain.

**Impact**: Cross-domain event propagation requires manual wiring in each consumer. Adding a new event type requires identifying which bus it belongs to and whether other domains need it.

### 3. Currency Formatting — HIGH

116 definitions of `formatCurrency` across the codebase. The canonical version in `src/lib/format.ts:20` uses `Intl.NumberFormat` with B/M/K abbreviation. Most local copies use `$` with `.toFixed(2)`. Some accept a currency parameter, others hardcode USD.

**Impact**: Inconsistent currency display across the UI. A CFO viewing the same amount on different pages will see different formats.

### 4. Permission Registry Conflict — HIGH

Two permission registries with incompatible types. `iam/permissions.ts` defines 60 permissions using `GranularPermission` union type. `rbac/permission-registry.ts` defines 24 permissions using `PermissionDefinition` type with different naming conventions. The `rbac/index.ts` barrel exports the legacy 24-permission registry.

**Impact**: New features may use the wrong permission set. The 24-permission legacy set lacks categories like `risk`, `analytics`, `reporting`, `automation`, `onboarding`.

### 5. Logger Duplication — MEDIUM

Pino (`src/lib/logger.ts`) with 60+ consumers and StructuredLogger (`src/server/observability/logger.ts`) with 8 consumers. Pino provides automatic JSON serialization, field redaction, and transport configuration. StructuredLogger uses manual `console.log` with no redaction.

**Impact**: Sensitive data may leak through StructuredLogger (no redaction). Two different log formats in production make log aggregation harder.

### 6. Currency Exchange Service Duplication — MEDIUM

`CurrencyService` and `FxService` both query `ExchangeRate`, define identical `FALLBACK_RATES`, and provide `getRate`/`convert`/`listRates`. The FX service adds `syncRates` and provider abstraction.

**Impact**: Two code paths for the same operation. Bugs fixed in one service won't be fixed in the other.

### 7. Cache Access Pattern Duplication — ~~MEDIUM~~ RESOLVED

~~`getCached()` (functional) and `CacheManager` (class) provide overlapping Redis caching. Two key builders produce incompatible key formats: `tenant:{id}:{domain}:{subdomain}:{qualifier}` vs `{namespace}:v{version}:{key}`.~~

**Phase 18.1A: Resolved** — `CacheManager` and `CacheKeyBuilder` removed. `getCached()` is the sole cache access pattern, `keys.ts` is the sole key builder.

**Impact**: Business services and infrastructure layer use different key formats, preventing cache invalidation across layers.

### 8. Queue System Duplication — ~~LOW~~ RESOLVED

~~PgBoss is the production queue. `MemoryQueue`/`QueueManager` in `src/server/queues/` is unused infrastructure scaffolding.~~

**Phase 18.1A: Resolved** — `MemoryQueue`/`QueueManager` scaffolding removed. PgBoss is the sole queue system.

### 9. Rogue AI Route — LOW

`src/app/api/automation-studio/ai/route.ts:35` makes a raw `fetch()` to Gemini API, bypassing `ai-provider`'s rate limiting, retry, health checks, and audit logging.

**Impact**: Unmonitored AI usage, no rate limiting, no provider failover.

### 10. Dead Identity Module — LOW

13 files in `src/server/identity/` with zero consumers. Alternative IAM implementation never integrated.

**Impact**: 13 files of dead code. Maintainability concern.

---

## Recommendations

See [ARCHITECTURE_CONSOLIDATION_PLAN.md](./ARCHITECTURE_CONSOLIDATION_PLAN.md) for prioritized remediation steps.

### Quick Wins (1-2 days)

1. **Delete** `src/server/identity/` (13 dead files)
2. **Delete** `src/server/queues/` (6 unused scaffolding files)
3. **Delete** `src/lib/validations/automation-studio.ts` deprecated helpers
4. **Re-route** rogue AI route through `ai-provider` module
5. **Delete** `src/server/cache/cache-keys.ts` (class-based key builder)

### Medium-Term (1-2 weeks)

6. **Merge** `CurrencyService` and `FxService` into single service
7. **Delete** `src/modules/rbac/permission-registry.ts`, update `rbac/index.ts` exports
8. **Migrate** 8 StructuredLogger consumers to Pino
9. **Replace** 116 local `formatCurrency` definitions with import from `@/lib/format`
10. **Consolidate** event buses into 2 (domain-specific + system-wide)

### Long-Term (1-2 months)

11. **Deprecate** orchestration `WorkflowEngine`, migrate consumers to primary engine — **Phase 18.1A: Renamed to OrchestrationExecutionEngine to eliminate naming collision**
12. **Unify** cache access patterns (single `getCached` API + single key builder)
13. **Merge** business + IAM audit writers into single `recordAudit` with source field
14. **Merge** two policy engines under unified interface
