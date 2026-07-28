# Platform Capabilities Matrix

**Document**: 2 of 3 — Platform Constitution Architecture Series
**Authority**: Platform Constitution (highest engineering authority)
**Version**: 1.0
**Ratified**: July 2026

---

## Summary Table

| # | Platform | Contract | Domain Group | Status | Maturity | Key Files |
|---|---|---|---|---|---|---|
| 1 | IntegrationPlatform | `IntegrationContract` | Integration & Connectivity | Partially Built | 2 | `src/modules/integration-platform/` (16 files) |
| 2 | BankingPlatform | `BankingContract` | Integration & Connectivity | Built | 3 | `src/server/banking/` (126 files) |
| 3 | ERPPlatform | `ERPContract` | Integration & Connectivity | Scaffolded | 1 | `src/modules/integration-platform/erp-framework/` |
| 4 | PaymentsPlatform | `PaymentsContract` | Integration & Connectivity | Scaffolded | 1 | `src/server/banking/payments/` |
| 5 | IdentityPlatform | `IdentityContract` | Identity & Security | Partially Built | 2 | `src/server/identity/` (13 files) + `src/server/iam/` (9 files) |
| 6 | SecurityPlatform | `SecurityContract` | Identity & Security | Partially Built | 2 | `src/server/security/` (14 files) |
| 7 | AIPlatform | `AIContract` | Intelligence & Automation | Partially Built | 2 | `src/modules/ai-provider/` (18 files) |
| 8 | WorkflowPlatform | `WorkflowContract` | Intelligence & Automation | Partially Built | 2 | `src/modules/workflow/` (18 files) |
| 9 | AuditPlatform | `AuditContract` | Intelligence & Automation | Partially Built | 2 | `src/modules/audit/` + `src/modules/audit-specialist/` |
| 10 | NotificationPlatform | `NotificationContract` | Communication & Documents | Partially Built | 2 | `src/modules/notifications/` |
| 11 | DocumentPlatform | `DocumentContract` | Communication & Documents | Not Started | 0 | — |
| 12 | ObservabilityPlatform | `ObservabilityContract` | Infrastructure | Partially Built | 2 | `src/server/observability/` (13 files) |
| 13 | SearchPlatform | `SearchContract` | Infrastructure | Partially Built | 2 | `src/server/search/` (13 files) |
| 14 | StoragePlatform | `StorageContract` | Infrastructure | Not Started | 0 | — |
| 15 | DeveloperPlatform | `DeveloperContract` | Infrastructure | Not Started | 0 | — |

### Maturity Levels (PlatformMaturityModel)

| Level | Name | Description |
|---|---|---|
| **0** | Not Started | No implementation. Contract not defined. |
| **1** | Scaffolded | Directory structure exists. Types defined. No runtime behavior. |
| **2** | Partially Built | Core services exist. Some contracts implemented. Gaps in coverage. |
| **3** | Built | All contracts implemented. Tested. Observable. Production-capable. |
| **4** | Mature | Fully production-proven. Extensive test coverage. Self-healing. Performance-tuned. |

---

## 1. Integration & Connectivity

### 1.1 IntegrationPlatform

| Attribute | Value |
|---|---|
| **Contract Name** | `IntegrationContract` |
| **Mission** | Manage connections to external systems, synchronize data, resolve conflicts, and maintain data lineage across all integrations. |
| **Current Status** | Partially Built |
| **Maturity Level** | 2 |
| **Location** | `src/modules/integration-platform/` |

#### Key Files

| File | Purpose |
|---|---|
| `types.ts` | Integration instance, credential, sync, template types |
| `integration-registry.ts` | Registry of all available integrations |
| `sync-engine.service.ts` | Data synchronization orchestration |
| `credential-manager.service.ts` | Secure credential storage and rotation |
| `csv-mapping.service.ts` | CSV import mapping rules and execution |
| `excel-import.service.ts` | Excel file import and parsing |
| `sandbox.service.ts` | Sandbox data import for testing |
| `conflict-resolution.service.ts` | Data conflict detection and resolution |
| `data-lineage.service.ts` | Data origin and transformation tracking |
| `validation-engine.service.ts` | Import data validation |
| `integration-audit.service.ts` | Integration activity audit trail |
| `banking-framework/index.ts` | Banking integration base classes |
| `banking-framework/banking-base.ts` | Abstract banking connector |
| `erp-framework/index.ts` | ERP integration base classes |
| `erp-framework/erp-base.ts` | Abstract ERP connector |

#### Dependencies

- **IdentityPlatform** — for authentication and authorization
- **SecurityPlatform** — for credential encryption
- **ObservabilityPlatform** — for metrics and tracing
- **NotificationPlatform** — for sync failure alerts

#### Gaps

- ERP framework is scaffolded (no concrete adapters)
- Document import not implemented
- Real-time streaming sync not implemented
- Conflict resolution is basic (no ML-assisted resolution)

---

### 1.2 BankingPlatform

| Attribute | Value |
|---|---|
| **Contract Name** | `BankingContract` |
| **Mission** | Connect to banking providers, synchronize accounts and transactions, process payments, and maintain banking compliance across all connected institutions. |
| **Current Status** | Built |
| **Maturity Level** | 3 |
| **Location** | `src/server/banking/` (126 files) |

#### Key Files

| Subsystem | Files | Purpose |
|---|---|---|
| `orchestrator/` | `orchestrator.ts`, `commands/` (11), `pipeline/engine.ts`, `execution/engine.ts`, `queue/`, `retry/` (5), `failover/engine.ts`, `events/events.ts`, `audit/audit.ts` | Command routing, pipeline execution, failover, retry, dead-letter |
| `accounts/` | `account-service.ts`, `account-hierarchy.ts`, `types.ts`, `validation/engine.ts`, `relationships/engine.ts`, `ownership/engine.ts`, `classification/engine.ts`, `mapping/engine.ts`, `discovery/engine.ts`, `currencies/engine.ts`, `groups/engine.ts` | Account management, hierarchy, validation, relationships |
| `providers/` | `definitions/` (3), `routing/` (2), `ranking/` (2), `selection/` (2), `capabilities/` (2), `diagnostics/` (2), `config/`, `regions/`, `registry/engine.ts`, `interface.ts` | Provider registration, routing, ranking, selection, capabilities |
| `sync/` | `reconciliation/engine.ts`, `types.ts` | Transaction sync and reconciliation |
| `monitoring/` | `health-monitor.ts`, `diagnostics/` (2), `dashboard/engine.ts`, `metrics/engine.ts`, `alerts/engine.ts`, `connections/engine.ts`, `providers/engine.ts`, `history/engine.ts`, `types.ts` | Health monitoring, diagnostics, metrics, alerts |
| `security/` | `credential-vault.ts`, `audit-service.ts` | Credential encryption, audit trail |
| `connections/` | `connection-manager.ts`, `authentication-service.ts` | Connection lifecycle, authentication |
| `payments/` | `payment-service.ts` | Payment processing |
| `compliance/` | `compliance-service.ts` | Banking compliance checks |
| `domain/` | `types.ts` | Domain types |
| `health/` | `health-monitor.ts` | Health status tracking |
| `workspace/` | `types.ts`, `data.ts` | Workspace configuration |

#### Dependencies

- **IdentityPlatform** — for user authentication
- **SecurityPlatform** — for credential encryption
- **ObservabilityPlatform** — for health monitoring and metrics
- **NotificationPlatform** — for transaction alerts
- **IntegrationPlatform** — for base integration framework

---

### 1.3 ERPPlatform

| Attribute | Value |
|---|---|
| **Contract Name** | `ERPContract` |
| **Mission** | Connect to ERP systems (SAP, NetSuite, Dynamics 365), synchronize business partners, purchase orders, GL postings, and inventory data. |
| **Current Status** | Scaffolded |
| **Maturity Level** | 1 |
| **Location** | `src/modules/integration-platform/erp-framework/` |

#### Key Files

| File | Purpose |
|---|---|
| `erp-framework/index.ts` | ERP framework barrel export |
| `erp-framework/erp-base.ts` | Abstract ERP connector base class |

#### Connector Adapters (in ConnectorPlatform)

| Adapter | File | Status |
|---|---|---|
| SAP | `src/modules/connector-platform/adapters/sap-connector.ts` | Scaffolded |
| NetSuite | `src/modules/connector-platform/adapters/netsuite-connector.ts` | Scaffolded |
| Dynamics 365 | `src/modules/connector-platform/adapters/dynamics-connector.ts` | Scaffolded |
| ERP Base | `src/modules/connector-platform/adapters/erp-base.ts` | Built |
| ERP Types | `src/modules/connector-platform/adapters/erp-types.ts` | Built |

#### Dependencies

- **IntegrationPlatform** — for base integration framework
- **IdentityPlatform** — for OAuth2 authentication
- **SecurityPlatform** — for credential encryption

---

### 1.4 PaymentsPlatform

| Attribute | Value |
|---|---|
| **Contract Name** | `PaymentsContract` |
| **Mission** | Process outgoing payments (AP), incoming payments (AR), multi-currency transfers, and payment reconciliation across banking providers. |
| **Current Status** | Scaffolded |
| **Maturity Level** | 1 |
| **Location** | `src/server/banking/payments/` |

#### Key Files

| File | Purpose |
|---|---|
| `payment-service.ts` | Basic payment processing |
| `index.ts` | Barrel export |

#### Dependencies

- **BankingPlatform** — for bank connection and account access
- **IntegrationPlatform** — for provider adapters
- **WorkflowPlatform** — for payment approval workflows
- **IdentityPlatform** — for payment authorization

---

## 2. Identity & Security

### 2.1 IdentityPlatform

| Attribute | Value |
|---|---|
| **Contract Name** | `IdentityContract` |
| **Mission** | Authenticate users, manage sessions, enforce multi-tenancy, provision identities across providers (local, Entra ID, SAML, OIDC), and support multi-factor authentication. |
| **Current Status** | Partially Built |
| **Maturity Level** | 2 |
| **Location** | `src/server/identity/` (13 files) + `src/server/iam/` (9 files) |

#### Key Files

**Identity Service** (`src/server/identity/`):

| File | Purpose |
|---|---|
| `identity-provider-manager.ts` | Multi-provider identity management |
| `authentication-service.ts` | Authentication flow orchestration |
| `session-manager.ts` | Session creation, validation, invalidation |
| `user-provisioning.ts` | User creation and role assignment |
| `group-manager.ts` | Group management |
| `role-manager.ts` | Role CRUD |
| `permission-manager.ts` | Permission assignment |
| `policy-engine.ts` | Authorization policy evaluation |
| `audit-service.ts` | Identity audit logging |
| `sso-handler.ts` | SSO flow handling |
| `types.ts` | Identity types |
| `facade.ts` | Unified identity facade |
| `index.ts` | Barrel export |

**IAM Service** (`src/server/iam/`):

| File | Purpose |
|---|---|
| `permissions.ts` | 64 granular permissions across 10 categories |
| `roles.ts` | Role definitions and assignment |
| `session.ts` | Session management |
| `mfa.ts` | TOTP-based multi-factor authentication |
| `abac.ts` | Attribute-based access control |
| `admin.ts` | Admin operations |
| `audit-events.ts` | IAM audit event definitions |
| `types.ts` | IAM types |
| `index.ts` | Barrel export |

**Prisma Auth Models**:

| Model | Purpose |
|---|---|
| `User` | Core user entity with MFA fields |
| `Account` | OAuth provider accounts |
| `Session` | Active sessions |
| `Authenticator` | WebAuthn/FIDO2 credentials |
| `CompanyMembership` | Multi-tenant user-company association |
| `Role` | Named roles per company |
| `UserRole` | User-role assignments |
| `IdentityProvider` | External identity provider configuration |

#### Permission Categories

| Category | Permissions | MFA Required |
|---|---|---|
| `workflow` | 8 (read, create, update, delete, execute, activate, import, export) | delete, execute, activate |
| `treasury` | 6 (read, transfer, credit, debit, reverse, manage) | transfer, credit, debit, reverse, manage |
| `approval` | 4 (read, request, approve, admin) | approve, admin |
| `admin` | 8 (users, roles, permissions, settings, audit, connectors, agents, approvals) | Most |
| `ap` | 6 (invoices, vendors, payments, matching, exceptions, reports) | payments |
| `ar` | 4 (invoices, customers, receipts, reports) | receipts |
| `gl` | 4 (accounts, journals, reports, close) | journals, close |
| `ai` | 4 (chat, models, agents, config) | agents |
| `connector` | 4 (install, configure, sync, disconnect) | install, disconnect |
| `system` | 4 (read, deploy, monitoring, secrets) | deploy, secrets |

#### Dependencies

- **SecurityPlatform** — for encryption and rate limiting
- **ObservabilityPlatform** — for audit logging

---

### 2.2 SecurityPlatform

| Attribute | Value |
|---|---|
| **Contract Name** | `SecurityContract` |
| **Mission** | Protect the platform through encryption, rate limiting, CSRF protection, input validation, dependency scanning, and security audit logging. |
| **Current Status** | Partially Built |
| **Maturity Level** | 2 |
| **Location** | `src/server/security/` (14 files) |

#### Key Files

| File | Purpose |
|---|---|
| `encryption.ts` | AES-256-GCM encryption with key rotation |
| `rate-limiter.ts` | Token-bucket rate limiting with periodic cleanup |
| `rate-limit.ts` | Rate limit configuration and helpers |
| `csrf.ts` | CSRF origin validation |
| `input-validator.ts` | Zod-based input sanitization |
| `authenticate-request.ts` | Request authentication extraction |
| `require-permission.ts` | Permission check enforcement |
| `audit-logger.ts` | Security audit event logging |
| `secrets.ts` | Environment variable validation |
| `environment.ts` | Environment configuration |
| `headers.ts` | Security headers (HSTS, CSP, etc.) |
| `dependency-scanner.ts` | pnpm audit integration |
| `session-validation-store.ts` | Session revocation cache |
| `index.ts` | Barrel export |

#### Security Capabilities

| Capability | Implementation |
|---|---|
| **Encryption at Rest** | AES-256-GCM with automatic key rotation |
| **Encryption in Transit** | TLS 1.3 enforced via ingress |
| **Rate Limiting** | Token-bucket (auth: 5/min, mutations: 30/min, reads: 100/min) |
| **CSRF Protection** | Origin validation for session-authenticated requests |
| **Input Validation** | Zod schemas on all API routes |
| **Body Size Limits** | 1MB default, 10MB hard cap |
| **Security Headers** | HSTS, X-Content-Type-Options, X-Frame-Options |
| **Dependency Scanning** | pnpm audit --audit-level=high |
| **Audit Logging** | Immutable security event trail |

#### Dependencies

- **ObservabilityPlatform** — for security metrics and alerting

---

## 3. Intelligence & Automation

### 3.1 AIPlatform

| Attribute | Value |
|---|---|
| **Contract Name** | `AIContract` |
| **Mission** | Provide multi-provider AI capabilities (chat, streaming, tool-calling, embeddings) with health monitoring, rate limiting, cost tracking, and prompt execution. |
| **Current Status** | Partially Built |
| **Maturity Level** | 2 |
| **Location** | `src/modules/ai-provider/` (18 files) |

#### Key Files

| File | Purpose |
|---|---|
| `types.ts` | `AiProviderKind`, `ModelConfig`, `CompletionRequest/Response`, `StreamChunk`, `ToolCall`, `EmbeddingRequest/Response` |
| `interface.ts` | `AiProvider` interface (chat, embed, health, listModels) |
| `registry.ts` | `AIProviderRegistry` — provider registration and discovery |
| `model-registry.ts` | `ModelRegistry` — model metadata and capability lookup |
| `prompt-execution.ts` | `PromptExecutionService` — unified prompt execution |
| `health.ts` | `ProviderHealthMonitor` — provider health tracking |
| `rate-limiter.ts` | Token-bucket rate limiting per provider |
| `retry.ts` | Exponential backoff retry (3x) |
| `usage.ts` | Token usage and cost tracking |
| `bootstrap.ts` | Provider initialization and registration |
| `providers/openai.ts` | OpenAI adapter |
| `providers/anthropic.ts` | Anthropic adapter |
| `providers/gemini.ts` | Gemini adapter |
| `providers/azure-openai.ts` | Azure OpenAI adapter |
| `providers/mistral.ts` | Mistral adapter |
| `providers/grok.ts` | Grok adapter |
| `providers/cohere.ts` | Cohere adapter |
| `jobs/provider-health.job.ts` | Background health check job |

#### Provider Matrix

| Provider | Chat | Streaming | Tool-Calling | Vision | Embeddings | JSON Output | Structured Output | Long Context | Reasoning |
|---|---|---|---|---|---|---|---|---|---|
| OpenAI | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (o1) |
| Anthropic | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Gemini | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| Azure OpenAI | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (o1) |
| Mistral | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Grok | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Cohere | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ |

#### Dependencies

- **ObservabilityPlatform** — for metrics and health monitoring
- **SecurityPlatform** — for API key management

---

### 3.2 WorkflowPlatform

| Attribute | Value |
|---|---|
| **Contract Name** | `WorkflowContract` |
| **Mission** | Define, execute, and monitor business workflows with conditional branching, approval steps, AI recommendations, and connector integration. |
| **Current Status** | Partially Built |
| **Maturity Level** | 2 |
| **Location** | `src/modules/workflow/` (18 files) + `src/modules/automation-studio/` |

#### Key Files

| File | Purpose |
|---|---|
| `engine.ts` | `WorkflowEngine` — singleton workflow execution engine |
| `state-machine.ts` | Workflow state transitions |
| `types.ts` | Workflow definition, instance, step types |
| `condition-evaluator.ts` | `OPERATOR_MAP` — shared condition evaluation |
| `step-registry.ts` | Step type registration |
| `version-snapshot.service.ts` | Workflow version snapshots |
| `steps/approval-step.ts` | Approval step executor |
| `steps/conditional-step.ts` | Conditional branching |
| `steps/connector-step.ts` | External system integration |
| `steps/decision-step.ts` | Decision point executor |
| `steps/ai-recommendation-step.ts` | AI-powered recommendations |
| `steps/notification-step.ts` | Notification dispatch |
| `steps/human-task-step.ts` | Human task assignment |
| `steps/delay-step.ts` | Time-based delays |
| `steps/policy-evaluation-step.ts` | Policy compliance check |
| `jobs/workflow-execution.job.ts` | Background workflow execution |
| `jobs/workflow-scheduler.job.ts` | Scheduled workflow triggers |

**Automation Studio** (`src/modules/automation-studio/`):

| File | Purpose |
|---|---|
| `automation-studio.service.ts` | Facade over all automation capabilities |
| `business-rules-builder.ts` | Rule definition and evaluation |
| `approval-matrix-evaluator.ts` | Approval routing and escalation |
| `automation-scheduler.ts` | Cron-based and event-based scheduling |
| `workflow-analytics.service.ts` | Workflow performance analytics |
| `template-library.ts` | Pre-built workflow templates |
| `automation-registry.ts` | Automation registration |

#### Dependencies

- **IdentityPlatform** — for workflow authorization
- **AIPlatform** — for AI recommendation steps
- **NotificationPlatform** — for notification steps
- **IntegrationPlatform** — for connector steps
- **ObservabilityPlatform** — for workflow metrics

---

### 3.3 AuditPlatform

| Attribute | Value |
|---|---|
| **Contract Name** | `AuditContract` |
| **Mission** | Record immutable audit trails, manage audit engagements, test controls, track findings and remediation, and generate audit reports. |
| **Current Status** | Partially Built |
| **Maturity Level** | 2 |
| **Location** | `src/modules/audit/` + `src/modules/audit-specialist/` |

#### Key Files

| File | Purpose |
|---|---|
| `audit/index.ts` | Core audit service |
| `audit-specialist/index.ts` | Audit specialist persona (Phase 13.6) |
| `src/server/security/audit-logger.ts` | Security audit event logging |

#### Prisma Audit Models (Phase 13.6)

| Model | Purpose |
|---|---|
| `AuditPlan` | Audit planning and scheduling |
| `AuditEngagement` | Individual audit engagement |
| `AuditControl` | Control definitions |
| `ControlTest` | Control test execution |
| `ControlResult` | Control test results |
| `AuditFinding` | Audit findings |
| `FindingEvidence` | Supporting evidence for findings |
| `RemediationPlan` | Remediation planning |
| `RemediationTask` | Remediation task tracking |
| `AuditEvidencePackage` | Evidence packages |
| `AuditReadinessSnapshot` | Readiness assessments |
| `AuditRiskAssessment` | Risk assessments |
| `AuditCalendar` | Audit calendar |
| `AuditReport` | Audit report generation |

#### Dependencies

- **IdentityPlatform** — for audit actor identification
- **ObservabilityPlatform** — for audit metrics
- **NotificationPlatform** — for finding alerts

---

## 4. Communication & Documents

### 4.1 NotificationPlatform

| Attribute | Value |
|---|---|
| **Contract Name** | `NotificationContract` |
| **Mission** | Deliver notifications across channels (email, Slack, Teams, in-app) with preference management, batching, and delivery tracking. |
| **Current Status** | Partially Built |
| **Maturity Level** | 2 |
| **Location** | `src/modules/notifications/` |

#### Key Files

| File | Purpose |
|---|---|
| `index.ts` | Notification service |
| `src/modules/queue/jobs/notification-delivery.job.ts` | Background notification delivery |
| `src/modules/connector-platform/jobs/notification-connector-delivery.job.ts` | Connector-based delivery |

#### Prisma Notification Models

| Model | Purpose |
|---|---|
| `NotificationChannel` | Channel configuration (email, Slack, Teams) |
| `NotificationPreference` | User notification preferences |
| `Notification` | Notification records |

#### Gaps

- Email delivery implementation incomplete
- Slack/Teams delivery via connector (not native)
- No push notification support
- No notification batching or digest

#### Dependencies

- **IdentityPlatform** — for user preferences
- **ConnectorPlatform** — for Slack/Teams delivery
- **Queue** — for background delivery

---

### 4.2 DocumentPlatform

| Attribute | Value |
|---|---|
| **Contract Name** | `DocumentContract` |
| **Mission** | Store, retrieve, version, and manage financial documents (invoices, receipts, contracts, reports) with classification-based retention. |
| **Current Status** | Not Started |
| **Maturity Level** | 0 |
| **Location** | — |

#### Dependencies

- **StoragePlatform** — for file storage
- **SecurityPlatform** — for document encryption
- **IdentityPlatform** — for access control

---

## 5. Infrastructure

### 5.1 ObservabilityPlatform

| Attribute | Value |
|---|---|
| **Contract Name** | `ObservabilityContract` |
| **Mission** | Collect, aggregate, and export metrics, logs, and traces across all platforms and services with correlation, health checking, and alerting. |
| **Current Status** | Partially Built |
| **Maturity Level** | 2 |
| **Location** | `src/server/observability/` (13 files) |

#### Key Files

| File | Purpose |
|---|---|
| `metrics.ts` | Core metrics collection |
| `metrics-registry.ts` | `MetricsRegistry` — Counter, Gauge, Histogram |
| `metrics-exporter.ts` | Prometheus-format export |
| `tracing.ts` | Span-based distributed tracing |
| `open-telemetry.ts` | OTLP bridge |
| `otel.ts` | OpenTelemetry configuration |
| `health.ts` | Health endpoint handlers |
| `health-checks.ts` | 5 standard health checks |
| `logger.ts` | Pino structured JSON logger |
| `correlation.ts` | Request correlation ID generation |
| `database-tracing.ts` | Prisma query instrumentation |
| `extended.ts` | Extended observability utilities |
| `index.ts` | Barrel export |

#### Metric Types

| Type | Purpose | Example |
|---|---|---|
| `Counter` | Monotonically increasing values | `http_requests_total`, `ai_tokens_used` |
| `Gauge` | Current point-in-time values | `cache_entries`, `queue_depth` |
| `Histogram` | Distribution of values | `http_request_duration_seconds`, `db_query_duration` |

#### Health Check Endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Basic health (returns `{ status, ready, live }`) |
| `GET /api/health/ready` | Readiness probe (all dependencies) |
| `GET /api/health/live` | Liveness probe (process alive) |

#### Dependencies

None (foundational platform).

---

### 5.2 SearchPlatform

| Attribute | Value |
|---|---|
| **Contract Name** | `SearchContract` |
| **Mission** | Provide full-text search, faceted filtering, and autocomplete across all financial entities with tenant-scoped indexing. |
| **Current Status** | Partially Built |
| **Maturity Level** | 2 |
| **Location** | `src/server/search/` (13 files) + `src/modules/search/` |

#### Key Files

| File | Purpose |
|---|---|
| `src/server/search/index.ts` | Search service |
| `src/modules/search/index.ts` | Search module |

#### Gaps

- No full-text search engine integration (Elasticsearch/Meilisearch)
- Search indexing not implemented
- Faceted search not implemented

#### Dependencies

- **IdentityPlatform** — for tenant-scoped search
- **ObservabilityPlatform** — for search metrics

---

### 5.3 StoragePlatform

| Attribute | Value |
|---|---|
| **Contract Name** | `StorageContract` |
| **Mission** | Provide scalable, encrypted file storage for documents, attachments, exports, and backups with lifecycle management. |
| **Current Status** | Not Started |
| **Maturity Level** | 0 |
| **Location** | — |

#### Dependencies

- **SecurityPlatform** — for encryption
- **IdentityPlatform** — for access control
- **ObservabilityPlatform** — for storage metrics

---

### 5.4 DeveloperPlatform

| Attribute | Value |
|---|---|
| **Contract Name** | `DeveloperContract` |
| **Mission** | Provide developer tools including API documentation, SDK generation, sandbox environments, webhook management, and integration testing. |
| **Current Status** | Not Started |
| **Maturity Level** | 0 |
| **Location** | — |

#### Dependencies

- **IntegrationPlatform** — for integration testing
- **SecurityPlatform** — for API key management
- **ObservabilityPlatform** — for developer analytics

---

## Cross-Cutting Concerns

### Queue Service

| Attribute | Value |
|---|---|
| **Location** | `src/modules/queue/` |
| **Implementation** | PgBoss (PostgreSQL-based) |
| **Status** | Built |

**8 Default Queues**:

| Queue | Purpose |
|---|---|
| `sync` | Data synchronization jobs |
| `forecast` | Cash forecast computation |
| `payment` | Payment processing |
| `notification` | Notification delivery |
| `alert` | Alert evaluation |
| `metrics` | Metrics aggregation |
| `audit` | Audit log processing |
| `recommendation` | AI recommendation generation |

**10+ Job Types** (from `src/modules/queue/job-types.ts`):
- `notification-delivery`
- `connector-sync`
- `connector-health`
- `connector-oauth-refresh`
- `plaid-sync`
- `qbo-sync`
- `workflow-execution`
- `workflow-scheduler`
- `provider-health`
- `notification-connector-delivery`

### Persistence Layer

| Attribute | Value |
|---|---|
| **Location** | `src/server/persistence/` (42+ files) |
| **Status** | Built |

**Components**:
- Base/generic repository patterns
- In-memory, PostgreSQL, MySQL, SQLite adapters
- Migration framework with history tracking
- Schema versioning with compatibility checks
- Health monitoring and diagnostics
- Repository registry and factory
- Unit of Work for transaction management

### Cache Layer

| Attribute | Value |
|---|---|
| **Location** | `src/server/cache/` (14 files) |
| **Status** | Built |

**Components**:
- `CacheManager` facade over LRU in-memory + Redis
- Tiered TTL configuration (critical 5s → stale 600s)
- Namespaced key builder (entity/query/aggregation/dashboard/metrics/forecast/permission/config/session)
- Hit/miss/set/eviction tracking
- Typed event bus for cache invalidation
- Graceful degradation on Redis failure

### Infrastructure Facade

| Attribute | Value |
|---|---|
| **Location** | `src/server/infrastructure.ts` |
| **Status** | Built |

**Functions**:
- `initializeInfrastructure()` — Start all infrastructure services
- `shutdownInfrastructure()` — Graceful shutdown
- `checkInfrastructureHealth()` — Health status of all layers

---

*This document is part of the Perionyx Platform Constitution architecture series.*
*Authority: Platform Constitution v1.0*
