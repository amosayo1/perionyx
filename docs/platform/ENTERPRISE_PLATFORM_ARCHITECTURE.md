# Enterprise Platform Architecture

**Document**: 1 of 3 — Platform Constitution Architecture Series
**Authority**: Platform Constitution (highest engineering authority)
**Version**: 1.0
**Ratified**: July 2026

---

## 1. Overview

Perionyx is an **Enterprise Financial Operating System** — a multi-tenant platform that serves CFOs, Treasurers, Controllers, Finance Managers, and Auditors across every financial operation. It is not a financial application. It is the substrate on which financial applications are built, integrated, orchestrated, and measured.

The platform is composed of **15 Platform Capabilities**, each with a stable contract that business domains consume. External providers connect through Provider Drivers that translate vendor-specific protocols into Perionyx's canonical financial language (see `CANONICAL_FINANCIAL_MODEL.md`).

**Technology foundation**: Next.js 16, Prisma 7.8, PostgreSQL, React 19, Tailwind CSS, framer-motion, Lucide icons, PgBoss, Redis, Pino, Prometheus, OpenTelemetry.

**Scale indicators** (as of Phase 22.0B.5):
- 374 Prisma models / ~11,400 lines
- 67 module directories
- 43 server directories
- 23 API route groups + 41 v1 API groups
- 7 AI providers, 22 registered models
- 10 connector adapters (Plaid, QuickBooks, SAP, NetSuite, Dynamics 365, Slack, Teams, Stripe, Wise, Xero)
- 15 test categories
- ~400+ TypeScript files in server layer alone

---

## 2. Architecture Principles

Derived from the 15 Constitutional Laws (see `PLATFORM_CONSTITUTION.md`):

| Principle | Law | Implementation |
|---|---|---|
| **Provider Isolation** | Law 1 | Business domains never import provider SDKs. All external communication flows through Platform contracts. |
| **Canonical Vocabulary** | Law 2 | Perionyx owns its financial terminology. Provider terms are translated at the Driver boundary. |
| **Contract-First** | Law 3 | Every Platform publishes a stable, versioned capability contract. Business domains depend only on contracts. |
| **Replaceable Drivers** | Law 4 | Provider drivers are thin adapters. They contain auth, retries, pagination, rate limiting, error translation, telemetry. Zero business logic. |
| **Full Observability** | Law 5 | Every external call, database query, queue operation, and cache access is instrumented. |
| **Financial Integrity** | Law 6 | `Decimal(38,12)` precision. Idempotent operations. Auditable state transitions. Non-repudiable approvals. |
| **Automated Governance** | Law 7 | Design rules enforced through ESLint, CI pipelines, and automated audits — not documentation alone. |
| **Measurable Platforms** | Law 8 | Every Platform emits health, performance, usage, security, and cost metrics. |
| **Tested Platforms** | Law 9 | Unit, integration, contract, and failure mode tests. Coverage thresholds enforced. |
| **Replaceable Platforms** | Law 10 | No Platform is permanent. Every contract can be fulfilled by a different implementation. |
| **Absolute Tenant Isolation** | Law 11 | Every data access, API call, and background job is scoped to a tenant. Cross-tenant access is never permitted. |
| **Zero Trust Default** | Law 12 | Every request authenticated. Every action authorized. Every access logged. |
| **Classification-Governed Data** | Law 13 | Data handling (encryption, access, retention, deletion) determined by classification level. |
| **Vendor-Neutral Events** | Law 14 | External events normalized into canonical Perionyx events before propagating. |
| **Constitutional Evolution** | Law 15 | Amendments require documented rationale, impact analysis, migration plan, unanimous review. |

---

## 3. System Context

### Actors

| Actor | Role | Primary Interactions |
|---|---|---|
| **CFO** | Strategic financial leadership | Executive briefings, scenario analysis, KPI dashboards, board packs, treasury oversight |
| **Treasurer** | Cash management and liquidity | Cash positions, forecasts, FX exposure, bank connections, payment processing |
| **Controller** | Accounting accuracy and close | GL management, period close, journal review, financial statements, reconciliation |
| **Finance Manager** | Operational financial workflows | AP/AR processing, approval routing, vendor management, budget tracking |
| **Auditor** | Compliance and assurance | Audit trails, control testing, compliance assessments, evidence collection |
| **AI Agent** | Automated financial analysis | Copilot conversations, anomaly detection, recommendations, scenario modeling |
| **External Provider** | Banking, ERP, accounting systems | Plaid (banking), QuickBooks (accounting), SAP/NetSuite (ERP), email/Slack (communication) |

### System Boundary

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PERIONYX PLATFORM                            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    User Interface Layer                      │    │
│  │  Next.js 16 Server/Client Components · React 19 · Tailwind │    │
│  └─────────────────────────────┬───────────────────────────────┘    │
│                                │                                    │
│  ┌─────────────────────────────▼───────────────────────────────┐    │
│  │                     API Gateway Layer                        │    │
│  │  Proxy (auth, rate limiting, CSRF) · 23 route groups       │    │
│  │  41 v1 API groups · Correlation IDs · Request timing        │    │
│  └─────────────────────────────┬───────────────────────────────┘    │
│                                │                                    │
│  ┌─────────────────────────────▼───────────────────────────────┐    │
│  │                  Business Domain Layer                       │    │
│  │  GL · AP · AR · Treasury · Risk · Compliance · Tax · FP&A  │    │
│  │  CRM · Workflow · Agent Framework · Orchestrator · Cron     │    │
│  └─────────────────────────────┬───────────────────────────────┘    │
│                                │                                    │
│  ┌─────────────────────────────▼───────────────────────────────┐    │
│  │               Platform Capability Layer                      │    │
│  │  15 Platforms with stable capability contracts               │    │
│  └─────────────────────────────┬───────────────────────────────┘    │
│                                │                                    │
│  ┌─────────────────────────────▼───────────────────────────────┐    │
│  │                Provider Driver Layer                         │    │
│  │  Plaid · QuickBooks · SAP · NetSuite · OpenAI · Anthropic   │    │
│  │  Gemini · Email · Slack · Teams · Stripe · Wise · Xero      │    │
│  └─────────────────────────────┬───────────────────────────────┘    │
│                                │                                    │
│  ┌─────────────────────────────▼───────────────────────────────┐    │
│  │                  Infrastructure Layer                        │    │
│  │  PostgreSQL · Redis · PgBoss · Encryption · Secrets · Locks │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
         │                                    │
    ┌────▼────┐                          ┌────▼────┐
    │ Plaid   │  QuickBooks  SAP         │ OpenAI  │  Anthropic  Gemini
    │ Stripe  │  NetSuite    Dynamics    │ Slack   │  Email      Teams
    └─────────┘                          └─────────┘
         External Banking/ERP/Accounting    External AI/Communication
```

---

## 4. Platform Layer Architecture

### 4.1 Business Domain Layer

The Business Domain Layer contains the financial logic that serves CFOs, Treasurers, Controllers, Finance Managers, and Auditors. Each domain has its own service, repository, types, and event definitions.

| Domain | Location | Key Files | Status |
|---|---|---|---|
| **General Ledger** | `src/server/gl/` | `gl-service.ts`, `domain/journals/`, `domain/ledger/`, `domain/chart-of-accounts/`, `domain/periods/`, `domain/allocations/`, `domain/financial-statements/`, `domain/consolidation/`, `domain/posting/`, `domain/revaluation/`, `domain/subledger/` | Built |
| **Accounts Payable** | `src/server/procurement/` | `application/invoice-service.ts`, `application/vendor-service.ts`, `application/payment-service.ts`, `application/approval-service.ts`, `application/exception-service.ts`, `application/credit-service.ts`, `application/reconciliation-service.ts`, `application/unit-of-work.ts`, `ap-repositories/` (22 files) | Built |
| **Accounts Receivable** | `src/server/accounts-receivable/` | `index.ts` | Scaffolded |
| **Treasury** | `src/server/treasury/` | `index.ts` + 11 subdirectories | Built |
| **Risk** | `src/server/risk/` | `index.ts` | Built |
| **Compliance** | `src/server/compliance/` | `index.ts` | Built |
| **Tax** | `src/server/tax/` | `index.ts` | Scaffolded |
| **FP&A** | `src/server/fpa/` | `index.ts` | Scaffolded |
| **CRM** | `src/modules/crm/` | `index.ts` (types, service, seed data) | Partially Built |
| **Order-to-Cash** | `src/server/order-to-cash/` | `index.ts` | Scaffolded |
| **Fixed Assets** | `src/server/fixed-assets/` | `index.ts` | Scaffolded |
| **Investments** | `src/server/investments/` | `index.ts` | Scaffolded |
| **Financial Close** | `src/server/financial-close/` | `index.ts` | Scaffolded |
| **Consolidation** | `src/server/consolidation/` | `index.ts` | Scaffolded |
| **Banking** | `src/server/banking/` | 126 files across `orchestrator/`, `accounts/`, `providers/`, `sync/`, `monitoring/`, `security/`, `connections/`, `payments/`, `compliance/`, `domain/`, `health/`, `workspace/`, `transactions/`, `architecture/` | Built |

### 4.2 Platform Capability Layer

Each Platform exposes a stable capability contract that the Business Domain Layer consumes.

| Platform | Contract | Location | Status |
|---|---|---|---|
| **IntegrationPlatform** | `IntegrationContract` | `src/modules/integration-platform/` (16 files) | Partially Built |
| **BankingPlatform** | `BankingContract` | `src/server/banking/` (126 files) | Built |
| **ERPPlatform** | `ERPContract` | `src/modules/integration-platform/erp-framework/` | Scaffolded |
| **PaymentsPlatform** | `PaymentsContract` | `src/server/banking/payments/` | Scaffolded |
| **IdentityPlatform** | `IdentityContract` | `src/server/identity/` (13 files) + `src/server/iam/` (9 files) | Partially Built |
| **SecurityPlatform** | `SecurityContract` | `src/server/security/` (14 files) | Partially Built |
| **AIPlatform** | `AIContract` | `src/modules/ai-provider/` (18 files) | Partially Built |
| **WorkflowPlatform** | `WorkflowContract` | `src/modules/workflow/` (18 files) + `src/modules/automation-studio/` | Partially Built |
| **AuditPlatform** | `AuditContract` | `src/modules/audit/` + `src/modules/audit-specialist/` | Partially Built |
| **NotificationPlatform** | `NotificationContract` | `src/modules/notifications/` | Partially Built |
| **DocumentPlatform** | `DocumentContract` | — | Not Started |
| **ObservabilityPlatform** | `ObservabilityContract` | `src/server/observability/` (13 files) | Partially Built |
| **SearchPlatform** | `SearchContract` | `src/server/search/` (13 files) | Partially Built |
| **StoragePlatform** | `StorageContract` | — | Not Started |
| **DeveloperPlatform** | `DeveloperContract` | — | Not Started |

### 4.3 Infrastructure Layer

| Concern | Location | Key Files | Status |
|---|---|---|---|
| **Cache** | `src/server/cache/` | `CacheManager` (LRU + Redis), tiered TTL, namespaced keys | Built (14 files) |
| **Distributed Locks** | `src/server/locks/` | `ILockManager`, in-memory + Redis, hierarchical locking, exponential backoff | Built |
| **Queue** | `src/modules/queue/` + PgBoss | `queue.service.ts`, `job-types.ts`, `jobs/notification-delivery.job.ts` | Built |
| **Persistence** | `src/server/persistence/` | Base/generic repositories, memory/postgres/mysql/sqlite adapters, migration framework, schema versioning | Built (42+ files) |
| **Encryption** | `src/server/security/encryption.ts` | AES-256-GCM, key rotation | Built |
| **Secrets** | `src/server/security/secrets.ts` + `src/modules/secrets/` | Env validation, secret manager | Built |
| **Recovery** | `src/server/recovery/` | Backup, restore, snapshot, drills, metrics | Built |
| **High Availability** | `src/server/ha/` | Health/readiness/liveness endpoints, graceful shutdown, circuit breaker | Built |

### 4.4 Provider Driver Layer

Provider Drivers are thin adapters that translate between external provider SDKs and Platform capability contracts. They contain authentication, retries, pagination, rate limiting, error translation, and telemetry. Zero business logic.

| Provider | Domain | Driver Location | Capabilities |
|---|---|---|---|
| **Plaid** | Banking | `src/modules/connector-platform/adapters/plaid-adapter.ts` | Account sync, transaction import, balance checks |
| **QuickBooks** | Accounting | `src/modules/connector-platform/adapters/quickbooks-connector.ts` | Vendor, invoice, bill, payment sync |
| **SAP** | ERP | `src/modules/connector-platform/adapters/sap-connector.ts` | Business partner, purchase order, GL posting |
| **NetSuite** | ERP | `src/modules/connector-platform/adapters/netsuite-connector.ts` | Vendor, bill, payment, journal entry |
| **Dynamics 365** | ERP | `src/modules/connector-platform/adapters/dynamics-connector.ts` | Vendor, purchase order, GL |
| **OpenAI** | AI | `src/modules/ai-provider/providers/openai.ts` | Chat, streaming, tool-calling, embeddings |
| **Anthropic** | AI | `src/modules/ai-provider/providers/anthropic.ts` | Chat, streaming, vision, long-context |
| **Gemini** | AI | `src/modules/ai-provider/providers/gemini.ts` | Chat, streaming, multi-modal |
| **Azure OpenAI** | AI | `src/modules/ai-provider/providers/azure-openai.ts` | Enterprise AI with data residency |
| **Mistral** | AI | `src/modules/ai-provider/providers/mistral.ts` | Chat, streaming, JSON output |
| **Grok** | AI | `src/modules/ai-provider/providers/grok.ts` | Chat, real-time reasoning |
| **Cohere** | AI | `src/modules/ai-provider/providers/cohere.ts` | Embeddings, classification, chat |
| **Slack** | Communication | `src/modules/connector-platform/adapters/slack-connector.ts` | Channel messaging, notifications |
| **Teams** | Communication | `src/modules/connector-platform/adapters/teams-connector.ts` | Channel messaging, notifications |
| **Email** | Communication | Via notification service | SMTP-based email delivery |
| **Stripe** | Payments | `src/modules/connector-platform/adapters/legacy.ts` | Payment processing |
| **Wise** | Payments | Connector registry | Cross-border payments |

---

## 5. Data Flow

### 5.1 Request Lifecycle (UI → External System)

```
1. User Action (React 19 Client Component)
   │
2. Next.js 16 Route Handler / Server Component
   │  src/app/(shell)/.../page.tsx
   │
3. Proxy (Edge Layer)
   │  src/proxy.ts — Auth extraction, rate limiting, CSRF, correlation ID, timing
   │
4. API Route Handler
   │  src/app/api/.../route.ts — Input validation (Zod), error handling (handleRouteError)
   │
5. Application Service
   │  src/server/procurement/application/invoice-service.ts — Business rules, state transitions
   │  src/server/gl/domain/journals/journal-service.ts — Double-entry accounting rules
   │
6. Domain Events
   │  src/server/procurement/domain/events/event-bus.ts — In-process typed event bus
   │
7. Repository (via Unit of Work)
   │  src/server/procurement/ap-repositories/prisma-invoice-repository.ts — Prisma queries
   │  src/server/persistence/ — Base repository, pagination, sorting
   │
8. Infrastructure
   │  src/server/cache/ — CacheManager (LRU + Redis)
   │  src/modules/queue/ — PgBoss job enqueue
   │  src/server/locks/ — Distributed lock for concurrent operations
   │
9. PostgreSQL (Prisma 7.8)
   │  374 models, Decimal(38,12) precision, interactive transactions
   │
10. Provider Driver (if external communication needed)
    │  src/modules/connector-platform/adapters/quickbooks-connector.ts
    │  Auth → Retry → Rate Limit → Error Translation → Telemetry
    │
11. External System
    │  QuickBooks API, Plaid API, SAP RFC, etc.
    │
12. Webhook Callback (async)
    │  src/modules/connector-platform/webhooks/quickbooks-webhook-handler.ts
    │  Normalize → Canonical Event → Domain Event Bus
```

### 5.2 Event-Driven Flow (External → Domain)

```
1. External Webhook Received
   │  src/app/api/v1/webhooks/.../route.ts
   │
2. Webhook Signature Verification
   │  src/server/security/csrf.ts — Origin + signature validation
   │
3. Provider-Specific Normalization
   │  src/modules/connector-platform/webhooks/quickbooks-webhook-handler.ts
   │  Converts QuickBooks payload → Canonical Perionyx event
   │
4. Canonical Event Emission
   │  src/server/procurement/domain/events/event-bus.ts
   │  Business domains consume ONLY canonical events
   │
5. Domain Event Handlers
   │  State transitions, side effects, downstream workflows
   │
6. Audit Logging
   │  src/server/security/audit-logger.ts — Immutable audit trail
```

---

## 6. Technology Stack

### 6.1 Core Framework

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16 | Full-stack React framework (App Router, Server Components, API Routes) |
| **React** | 19 | UI rendering (Server Components, Client Components, Suspense) |
| **TypeScript** | 5.x | Strict mode type safety |
| **Prisma** | 7.8 | ORM with interactive transactions, Decimal support |
| **PostgreSQL** | 15+ | Primary database (374 models, 9,764+ lines of schema) |

### 6.2 Frontend

| Technology | Purpose |
|---|---|
| **Tailwind CSS** | Utility-first styling with EDL design tokens |
| **framer-motion** | Enterprise motion system (13 animated components) |
| **Lucide** | Icon library with custom product icons |
| **next-intl v4.13.1** | Internationalization (English + Arabic) |
| **@next/bundle-analyzer** | Bundle size analysis |

### 6.3 Backend Infrastructure

| Technology | Purpose |
|---|---|
| **PgBoss** | Background job queue (8 default queues, 10+ job types) |
| **Redis** (ioredis) | Distributed cache, session store, rate limiting |
| **Pino** | Structured JSON logging (60+ consumers) |
| **Prometheus** | Metrics export (8 metric domains) |
| **OpenTelemetry** | Distributed tracing, span-based |
| **AES-256-GCM** | Encryption at rest with key rotation |

### 6.4 Testing

| Category | Tool |
|---|---|
| Unit Testing | Vitest (443/443 tests passing) |
| Integration Testing | Vitest + Prisma interactive transactions |
| API Testing | Vitest endpoint tests (52 AP API tests) |
| Workflow Testing | Vitest (87 workflow tests) |
| E2E Testing | Playwright (planned) |
| Load/Stress/Chaos Testing | Benchmark suites (planned) |

---

## 7. Deployment Topology

### 7.1 Deployment Models

| Model | Description | Target Customer |
|---|---|---|
| **Shared SaaS** | Multi-tenant on Perionyx infrastructure | SMBs, startups |
| **Dedicated SaaS** | Single-tenant on Perionyx infrastructure | Mid-market, regulated industries |
| **Private Cloud** | Perionyx-managed in customer's cloud account | Enterprise, compliance-heavy |
| **Customer Managed** | Fully self-hosted by customer | Government, defense, air-gapped |

### 7.2 Infrastructure Components

| Component | Technology | Configuration |
|---|---|---|
| **Container** | Docker (multi-stage) | `Dockerfile` with healthcheck |
| **Orchestration** | Kubernetes | `k8s/deployment.yaml`, `k8s/ingress.yaml`, `k8s/hpa.yaml` |
| **Database** | PostgreSQL 15+ | Prisma migrations, `20260721000000` latest |
| **Cache** | Redis 7+ | LRU in-memory fallback |
| **Queue** | PgBoss (PostgreSQL-based) | 8 default queues |
| **Secrets** | Kubernetes Secrets / env vars | `.gitignore` protection |
| **CI/CD** | GitHub Actions | `ci.yml` (typecheck, lint, test, build, security) + `deploy.yml` |

### 7.3 Kubernetes Resources

- **Deployment**: Single-replica with rolling updates
- **Ingress**: Nginx ingress controller with rate limiting (50 rps, 20 connections)
- **HPA**: Horizontal Pod Autoscaler based on CPU/memory
- **PDB**: Pod Disruption Budget for availability
- **Network Policy**: Restricted to `ingress-nginx` namespace
- **ConfigMap**: Feature flags, environment configuration
- **Secrets**: Database URL, Redis URL, API keys (REPLACE_ME placeholders)
- **PVC**: Persistent volume for PostgreSQL data

---

## 8. Security Architecture

### 8.1 Zero Trust Model

Every request is authenticated, every action authorized, every access logged. Trust is never assumed — it is verified.

```
┌─────────────────────────────────────────────────────────────────┐
│                    Security Layers (Defense in Depth)            │
│                                                                 │
│  Layer 1: Network Security                                      │
│  ├── Kubernetes Network Policy (ingress-nginx only)             │
│  ├── Ingress Rate Limiting (50 rps, 20 connections)             │
│  └── DNS Egress Restriction                                     │
│                                                                 │
│  Layer 2: Transport Security                                    │
│  ├── TLS 1.3 (enforced)                                        │
│  ├── HSTS (Strict-Transport-Security)                           │
│  └── X-Content-Type-Options: nosniff                           │
│                                                                 │
│  Layer 3: Authentication                                        │
│  ├── NextAuth (credentials + OAuth)                             │
│  ├── MFA (TOTP, 10 recovery codes, timing-safe)                │
│  ├── Session versioning (JWT invalidation)                      │
│  └── Account lockout (failed attempts + timeout)                │
│                                                                 │
│  Layer 4: Authorization                                         │
│  ├── RBAC (64 permissions, 10 categories)                       │
│  ├── ABAC (attribute-based policies)                            │
│  ├── Tenant isolation (requireTenantContext)                     │
│  └── Permission checks at endpoint level                        │
│                                                                 │
│  Layer 5: Data Security                                         │
│  ├── AES-256-GCM encryption at rest                             │
│  ├── Key rotation (automatic)                                   │
│  ├── Data classification (Public → Regulated)                   │
│  └── Decimal(38,12) financial precision                         │
│                                                                 │
│  Layer 6: Application Security                                  │
│  ├── CSRF protection (origin validation)                        │
│  ├── Input sanitization (Zod validation)                        │
│  ├── Rate limiting (token bucket + sliding window)              │
│  ├── Body size limits (1MB default, 10MB hard cap)              │
│  └── Dependency scanning (pnpm audit)                           │
│                                                                 │
│  Layer 7: Audit & Compliance                                    │
│  ├── Immutable audit logs (append-only)                         │
│  ├── Security event logging                                     │
│  ├── Webhook signature verification                             │
│  └── Session revocation (30s in-memory cache on DB failure)     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Tenant Isolation

- Every Prisma query scoped to `companyId`
- Every API route calls `requireTenantContext()` or equivalent
- Every background job includes tenant context
- Cross-tenant access blocked at repository level
- `CompanyMembership` model enforces multi-tenant boundaries

### 8.3 Authentication Flow

```
1. User submits credentials → NextAuth handler
2. Password comparison (fail-closed — throws on invalid)
3. MFA check (if enabled) → TOTP verification (±1 clock skew)
4. Session creation → JWT with token version
5. Subsequent requests → Proxy extracts token → validates → sets context
6. Permission check → RBAC + ABAC evaluation
7. Audit log → Immutable record of access
```

---

## 9. Integration Architecture

### 9.1 Integration Platform

The Integration Platform (`src/modules/integration-platform/`) manages connections to external systems:

| Service | File | Purpose |
|---|---|---|
| `IntegrationRegistry` | `integration-registry.ts` | Registry of all available integrations |
| `SyncEngine` | `sync-engine.service.ts` | Data synchronization orchestration |
| `CredentialManager` | `credential-manager.service.ts` | Secure credential storage and rotation |
| `CSVMapping` | `csv-mapping.service.ts` | CSV import mapping rules |
| `ExcelImport` | `excel-import.service.ts` | Excel file import |
| `Sandbox` | `sandbox.service.ts` | Sandbox data import for testing |
| `ConflictResolution` | `conflict-resolution.service.ts` | Data conflict detection and resolution |
| `DataLineage` | `data-lineage.service.ts` | Data origin tracking |
| `ValidationEngine` | `validation-engine.service.ts` | Import data validation |
| `IntegrationAudit` | `integration-audit.service.ts` | Integration activity audit trail |

### 9.2 Connector Platform

The Connector Platform (`src/modules/connector-platform/`) manages provider-specific adapters:

| Component | File | Purpose |
|---|---|---|
| `ConnectorRegistry` | `registry.ts` | Registry of all connector adapters |
| `ConnectorLifecycle` | `lifecycle.ts` | Install, configure, connect, disconnect, health check |
| `ConnectorDiscovery` | `discovery.ts` | Auto-discovery of available connectors |
| `Orchestrator` | `orchestrator/orchestrator.ts` | Multi-connector orchestration |
| `SyncExecutor` | `sync/executor.ts` | Data sync execution |
| `WebhookBridge` | `webhook-bridge.ts` | Inbound webhook routing |
| `OAuth2Handler` | `auth/oauth2-handler.ts` | OAuth 2.0 flow management |
| `SecretsManager` | `secrets.ts` | Connector credential encryption |

### 9.3 Banking Platform

The Banking Platform (`src/server/banking/`) is the most mature integration domain:

| Subsystem | Files | Purpose |
|---|---|---|
| `Orchestrator` | `orchestrator/` (20+ files) | Command routing, failover, pipeline execution |
| `Accounts` | `accounts/` | Account hierarchy, validation, relationships, ownership, classification, mapping, discovery, currencies |
| `Providers` | `providers/` | Provider registry, routing, ranking, selection, capabilities, diagnostics, enterprise config, regions |
| `Sync` | `sync/` | Transaction sync, reconciliation |
| `Monitoring` | `monitoring/` | Health monitoring, diagnostics, metrics, alerts, dashboard |
| `Security` | `security/` | Credential vault, audit service |
| `Connections` | `connections/` | Connection manager, authentication |
| `Payments` | `payments/` | Payment processing |
| `Compliance` | `compliance/` | Banking compliance checks |

---

## 10. AI Architecture

### 10.1 AI Platform

The AI Platform (`src/modules/ai-provider/`) provides multi-provider AI capabilities:

| Component | File | Purpose |
|---|---|---|
| `AIProviderRegistry` | `registry.ts` | Provider registration and discovery |
| `ModelRegistry` | `model-registry.ts` | Model metadata and capability lookup |
| `PromptExecution` | `prompt-execution.ts` | Unified prompt execution across providers |
| `HealthMonitor` | `health.ts` | Provider health tracking |
| `RateLimiter` | `rate-limiter.ts` | Token-bucket rate limiting per provider |
| `RetryManager` | `retry.ts` | Exponential backoff retry logic |
| `UsageTracker` | `usage.ts` | Token usage and cost tracking |
| `Bootstrap` | `bootstrap.ts` | Provider initialization |

### 10.2 Provider Capabilities

| Provider | Models | Capabilities |
|---|---|---|
| **OpenAI** | GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo, o1 | Chat, streaming, tool-calling, vision, embeddings, JSON output |
| **Anthropic** | Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku | Chat, streaming, vision, long-context, tool-calling |
| **Gemini** | Gemini 1.5 Pro, Gemini 1.5 Flash | Chat, streaming, multi-modal, JSON output |
| **Azure OpenAI** | GPT-4o, GPT-4 Turbo | Enterprise AI with data residency |
| **Mistral** | Mistral Large, Mistral Medium | Chat, streaming, JSON output |
| **Grok** | Grok-2, Grok-1.5 | Chat, real-time reasoning |
| **Cohere** | Command R+, Command R | Chat, embeddings, classification |

### 10.3 Agent Framework

The Agent Framework (`src/modules/agent-framework/`) provides autonomous financial analysis:

| Component | File | Purpose |
|---|---|---|
| `AgentRegistry` | `agent-registry.ts` | Agent registration, discovery, listing |
| `AgentRuntime` | `agent-runtime.ts` | Lifecycle, sessions, tasks, executions |
| `AgentContextEngine` | `agent-context.ts` | Trusted context from 9 sources |
| `AgentMemory` | `agent-memory.ts` | 5 memory types (episodic, semantic, procedural, working, long-term) |
| `EvidenceEngine` | `evidence-engine.ts` | Source tracking, verification |
| `DecisionEngine` | `decision-engine.ts` | Structured decisions, approvals |
| `ApprovalIntegration` | `approval-integration.ts` | Existing approval framework bridge |
| `CollaborationFramework` | `collaboration-framework.ts` | Agent delegation with traceability |
| `HumanInteraction` | `human-interaction.ts` | Questions, clarification, feedback |
| `AgentGovernance` | `agent-governance.ts` | Permissions, rate limits, safety |
| `AgentService` | `agent-service.ts` | Facade over all services |

**Prisma Models**: 14 agent models (`AgentDefinition`, `AgentCapability`, `AgentSession`, `AgentTask`, `AgentExecution`, `AgentDecision`, `AgentEvidence`, `AgentMemory`, `AgentHealth`, `AgentPermission`, `AgentConfiguration`, `AgentConversation`, `AgentDelegation`, `AgentAudit`)

---

## 11. Observability Architecture

### 11.1 Metrics

The Observability Platform (`src/server/observability/`) provides:

| Component | File | Purpose |
|---|---|---|
| `MetricsRegistry` | `metrics-registry.ts` | Counter, Gauge, Histogram metric types |
| `MetricsExporter` | `metrics-exporter.ts` | Prometheus-format export |
| `Tracing` | `tracing.ts` | Span-based distributed tracing |
| `OpenTelemetry` | `open-telemetry.ts` | OTLP bridge |
| `HealthChecks` | `health-checks.ts` | 5 standard checks (cache, memory, uptime, queues, persistence) |
| `Logger` | `logger.ts` | Pino structured JSON logging |
| `Correlation` | `correlation.ts` | Request correlation IDs |
| `DatabaseTracing` | `database-tracing.ts` | Prisma query tracing |

### 11.2 Metric Domains

| Domain | Metrics |
|---|---|
| **HTTP** | Request count, latency (p50/p95/p99), error rate |
| **Database** | Query count, query latency, connection pool usage |
| **Cache** | Hit rate, miss rate, eviction count |
| **Queue** | Job count, processing time, dead-letter count |
| **AI** | Token usage, cost, latency, error rate per provider |
| **Connector** | Sync count, sync latency, health status |
| **Business** | Approval count, payment volume, reconciliation rate |
| **Infrastructure** | Memory usage, CPU usage, disk usage |

### 11.3 Health Checks

Every Platform must answer:
1. **Is it healthy?** — Connectivity, dependencies, resource usage
2. **Is it fast?** — Latency percentiles, throughput
3. **Is it used?** — Request volume, active users
4. **Is it secure?** — Failed auth attempts, permission violations
5. **Is it cost-effective?** — API calls, storage, compute

---

## 12. Current State Assessment

### 12.1 Built (Production-Ready)

| Domain | Evidence |
|---|---|
| **General Ledger** | 25 Prisma models, 16 service files, full chart of accounts, journals, posting, periods, allocations, financial statements |
| **Accounts Payable** | 25 Prisma models, 7 application services, 51 commands, 63 domain events, 137 invariants, 22 repositories |
| **Banking** | 126 files, orchestrator with failover, 10 provider adapters, account hierarchy, monitoring, compliance |
| **Identity & Access** | 13 identity files, 9 IAM files, MFA (TOTP + recovery codes), 64 permissions, RBAC + ABAC |
| **Security** | 14 files: encryption (AES-256-GCM), rate limiting, CSRF, input validation, audit logging, dependency scanning |
| **Observability** | 13 files: metrics, tracing, OpenTelemetry, health checks, correlation, structured logging |
| **Agent Framework** | 13 service files, 14 Prisma models, 8 API endpoint groups, 12 client components |
| **Workflow** | 18 files: engine, state machine, 9 step executors, condition evaluator, version snapshots |
| **Connector Platform** | 42+ files: 10 adapters, orchestrator, sync, webhooks, OAuth, secrets, lifecycle |
| **Persistence** | 42+ files: base/generic repositories, 4 database adapters, migration framework, schema versioning |

### 12.2 Partially Built

| Domain | Status |
|---|---|
| **Integration Platform** | 16 service files, but ERP and document frameworks scaffolded only |
| **Notification Platform** | Basic notification service, but no multi-channel delivery (email/Slack/Teams) |
| **Search Platform** | 13 server files, but search indexing incomplete |
| **AI Platform** | 7 providers registered, but prompt execution wired only for core chat |
| **Audit Platform** | Audit service exists, but audit-specialist (13.6) is scaffolded |
| **CRM** | Types, service, seed data for 3 contacts — not production-ready |

### 12.3 Scaffolded (Structure Only)

| Domain | Status |
|---|---|
| **Accounts Receivable** | `src/server/accounts-receivable/index.ts` only |
| **Tax** | `src/server/tax/index.ts` only |
| **FP&A** | `src/server/fpa/index.ts` only |
| **Fixed Assets** | `src/server/fixed-assets/index.ts` only |
| **Investments** | `src/server/investments/index.ts` only |
| **Financial Close** | `src/server/financial-close/index.ts` only |
| **Consolidation** | `src/server/consolidation/index.ts` only |
| **Order-to-Cash** | `src/server/order-to-cash/index.ts` only |

### 12.4 Not Started

| Domain | Status |
|---|---|
| **Document Platform** | No files |
| **Storage Platform** | No files |
| **Developer Platform** | No files |
| **Payments Platform** | Banking payments exist, but standalone PaymentsPlatform contract not defined |

### 12.5 Key Metrics

| Metric | Value |
|---|---|
| Prisma Models | 374 |
| Schema Lines | ~11,400 |
| Module Directories | 67 |
| Server Directories | 43 |
| API Route Groups | 23 + 41 v1 |
| AI Providers | 7 (22 models) |
| Connector Adapters | 10+ |
| Test Categories | 15 |
| Tests Passing | 443/443 (vitest) |
| TypeScript Strict | ✅ |
| Production Build | ✅ |

---

*This document is part of the Perionyx Platform Constitution architecture series.*
*Authority: Platform Constitution v1.0*
