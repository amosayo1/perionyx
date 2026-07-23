# Platform Ownership Matrix

> **Purpose**: Every platform primitive has a single owner, documented consumers, and a clear public API.
> **Established**: Phase 18.1B (2026-07-21)

---

## Logger

| Attribute | Value |
|---|---|
| **Mission** | Structured logging with automatic redaction of sensitive fields |
| **Owner** | Infrastructure |
| **Location** | `src/lib/logger.ts` |
| **Implementation** | Pino v10.3.1 |
| **Consumers** | 72 files (35 API routes, 20+ services, 10+ infrastructure, 5+ modules) |
| **Public API** | `logger.info()`, `logger.warn()`, `logger.error()`, `logger.debug()`, `logger.child()` |
| **Internal API** | Pino transport config, redaction paths, log level management |
| **Dependencies** | `pino` npm package |
| **Extension points** | Custom transports, custom redaction paths, child logger context |
| **Future evolution** | Request-scoped logging via AsyncLocalStorage, structured log shipping, log-based alerting |

---

## Permission Registry

| Attribute | Value |
|---|---|
| **Mission** | Centralized permission definitions with MFA flags and scope-based access |
| **Owner** | Security / IAM |
| **Location** | `src/server/iam/permissions.ts` |
| **Implementation** | Static registry class with 69 permissions across 16 categories |
| **Consumers** | 100+ API routes (via RBAC service), admin endpoint, onboarding wizard |
| **Public API** | `PermissionRegistry.getAll()`, `.get()`, `.getByCategory()`, `.getRequiringMfa()`, `.validate()`, `.can()`, `.requirePermissions()` |
| **Internal API** | `PERMISSION_DEFINITIONS` array, `PermissionMeta` interface, `GranularPermission` type |
| **Dependencies** | None (pure data) |
| **Extension points** | Add new permissions to `PERMISSION_DEFINITIONS`, add new categories, add new scopes |
| **Future evolution** | Dynamic permissions from database, permission versioning, delegated grants |

---

## AI Provider

| Attribute | Value |
|---|---|
| **Mission** | Unified AI execution with retry, rate limiting, health monitoring, and usage tracking |
| **Owner** | AI Platform |
| **Location** | `src/modules/ai-provider/prompt-execution.ts` |
| **Implementation** | PromptExecutionService facade over 7 providers |
| **Consumers** | Copilot chat (streaming), Automation Studio AI (non-streaming) |
| **Public API** | `promptExecutionService.execute()`, `.executeStream()` |
| **Internal API** | Provider selection, rate limiting, health monitoring, usage recording, cost estimation |
| **Dependencies** | Prisma (usage tracking), provider SDKs (OpenAI, Anthropic, etc.) |
| **Extension points** | Add new providers, add new models, customize selection strategy |
| **Future evolution** | Request caching, response quality scoring, multi-model comparison, fine-tuning |

---

## Cache

| Attribute | Value |
|---|---|
| **Mission** | In-memory caching with tiered TTL and tenant isolation |
| **Owner** | Infrastructure |
| **Location** | `src/server/cache/cache-service.ts` (API), `src/server/cache/keys.ts` (keys) |
| **Implementation** | `getCached()` facade over LRU in-memory cache |
| **Consumers** | 20+ business services (currency, treasury, connectors, analytics) |
| **Public API** | `getCached(key, fetchFn, ttl)`, `invalidateKey()`, `invalidatePattern()`, `cacheHeaders()` |
| **Internal API** | `CacheTier` enum, `tenantKey()`, `globalKey()`, `CacheDomains` |
| **Dependencies** | None (in-memory) |
| **Extension points** | Add new cache tiers, add new `CacheDomains`, add Redis backend |
| **Future evolution** | Redis distributed cache, stale-while-revalidate, cache warming |

---

## Queue

| Attribute | Value |
|---|---|
| **Mission** | Background job processing with persistence and scheduling |
| **Owner** | Infrastructure |
| **Location** | `src/modules/queue/queue.service.ts` |
| **Implementation** | PgBoss-backed job queue |
| **Consumers** | 15+ services (notifications, alerts, sync, reports, webhooks, AI) |
| **Public API** | `enqueue()`, `enqueueBatch()`, `scheduleCron()`, `unscheduleCron()`, `registerHandler()`, `cancelJob()`, `getJobStatus()` |
| **Internal API** | Job type definitions, handler registration, dead-letter routing |
| **Dependencies** | PgBoss, PostgreSQL |
| **Extension points** | Add new job types, add new handlers, add new queue configurations |
| **Future evolution** | Priority queues, job dependencies, distributed workers, job replay |

---

## Workflow Engine

| Attribute | Value |
|---|---|
| **Mission** | Workflow execution with dependency resolution, version snapshots, and state machine |
| **Owner** | Orchestration |
| **Location** | `src/modules/workflow/engine.ts` |
| **Implementation** | Singleton `WorkflowEngine` with 9 step executors |
| **Consumers** | Automation Studio, workflow designer, monitoring dashboard |
| **Public API** | `WorkflowEngine.getInstance()`, `.execute()`, `.getMetrics()` |
| **Internal API** | Step registry, state machine, version snapshots, dependency graph |
| **Dependencies** | Prisma (`WorkflowInstance`), step executors |
| **Extension points** | Register new step executors, add new workflow states, add new trigger types |
| **Future evolution** | Parallel execution, conditional branching improvements, workflow templates |

---

## Tenant Context

| Attribute | Value |
|---|---|
| **Mission** | Establish tenant scope for all API operations |
| **Owner** | Infrastructure / Security |
| **Location** | `src/server/context/tenant-context.ts` |
| **Implementation** | `requireTenantContext()` function returning `TenantContext` |
| **Consumers** | 100+ API routes |
| **Public API** | `requireTenantContext(userId, companyId, role): TenantContext` |
| **Internal API** | `TenantContext` type with `userId`, `companyId`, `companyRole` |
| **Dependencies** | None (pure function) |
| **Extension points** | Add new context fields (e.g., `departmentId`, `sessionId`) |
| **Future evolution** | Request-scoped context via AsyncLocalStorage, context propagation to background jobs |

---

## Audit

| Attribute | Value |
|---|---|
| **Mission** | Tamper-evident security audit trail + business event logging |
| **Owner** | Security |
| **Locations** | `src/server/security/audit-logger.ts` (security), `src/modules/audit/audit.service.ts` (business), `src/server/iam/audit.ts` (identity) |
| **Implementation** | SHA-256 hash chain (security), Prisma `AuditLog` (business + IAM) |
| **Consumers** | All mutation endpoints, auth flows, approval workflows |
| **Public API** | `recordAudit()`, `recordIAMAudit()`, `SecurityAuditLogger.log()` |
| **Internal API** | Hash chain verification, log rotation, compliance exports |
| **Dependencies** | Prisma, crypto (SHA-256) |
| **Extension points** | Add new event types, add new audit destinations |
| **Future evolution** | Merge business + IAM audit into single `recordAudit` with `source` field |

---

## Error Handling

| Attribute | Value |
|---|---|
| **Mission** | Unified error-to-HTTP-response mapping with structured validation errors |
| **Owner** | Infrastructure |
| **Location** | `src/server/http/handle-route.ts` |
| **Implementation** | `handleRouteError()`, `zodErrorResponse()`, `parseJsonBody()` |
| **Consumers** | 272+ API routes |
| **Public API** | `handleRouteError(err, req)`, `zodErrorResponse(err)`, `parseJsonBody<T>(req)` |
| **Internal API** | `AppError` hierarchy, error logging, status code mapping |
| **Dependencies** | `logger` (error logging) |
| **Extension points** | Add new error types to `AppError` hierarchy |
| **Future evolution** | Structured error codes, error correlation across services |

---

## Validation

| Attribute | Value |
|---|---|
| **Mission** | API request/response validation with structured error messages |
| **Owner** | Infrastructure |
| **Location** | `src/lib/validations/` (12 files) |
| **Implementation** | Zod schemas for all API endpoints |
| **Consumers** | All API routes, form components |
| **Public API** | Zod schemas, `zodErrorResponse()` |
| **Internal API** | Schema composition, type inference |
| **Dependencies** | `zod` npm package |
| **Extension points** | Add new schemas, compose schemas |
| **Future evolution** | Auto-generated schemas from Prisma, client-side validation sharing |

---

## Summary

| Primitive | Owner | Consumers | Authoritative Location |
|---|---|---|---|
| Logger | Infrastructure | 72 | `src/lib/logger.ts` |
| Permission Registry | Security/IAM | 100+ | `src/server/iam/permissions.ts` |
| AI Provider | AI Platform | 2 | `src/modules/ai-provider/prompt-execution.ts` |
| Cache | Infrastructure | 20+ | `src/server/cache/cache-service.ts` |
| Queue | Infrastructure | 15+ | `src/modules/queue/queue.service.ts` |
| Workflow Engine | Orchestration | Automation Studio | `src/modules/workflow/engine.ts` |
| Tenant Context | Infrastructure | 100+ | `src/server/context/tenant-context.ts` |
| Audit | Security | All mutations | 3 files (security, business, IAM) |
| Error Handling | Infrastructure | 272+ | `src/server/http/handle-route.ts` |
| Validation | Infrastructure | All endpoints | `src/lib/validations/` |
