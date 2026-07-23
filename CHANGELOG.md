# Changelog

All notable changes to the Perionyx Enterprise Financial Operating System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned

- Phase 9C — Investments module
- Phase 9D — Risk module
- Phase 9E — Compliance module
- Phase 9F — Executive AI
- Redis distributed rate limiting + caching
- Postgres read replicas for GET endpoints
- ETag support for entity endpoints
- Response compression (Accept-Encoding: gzip)
- Response streaming for AI and analytics endpoints
- EnterpriseButton, EnterpriseInput, EnterpriseCard, EnterpriseBadge primitives on design tokens
- Arabic RTL Phase 1-4
- i18n integration into enterprise table/analytics/forms components
- Native push notifications with deep linking for mobile
- Offline action queue — persist approvals when offline, sync on reconnect
- iOS/Android home screen widgets for cash position
- Version diff/comparison for workflow detail page
- Analytics drill-down: click charts → per-instance details
- Wire onboarding wizard step execution to actual module APIs
- Unit tests for all onboarding module classes and readiness service
- Move sync background jobs to PgBoss queue

---

## [1.0.0] - 2026-07-09

**Codename:** Perionyx Platform Core
**Architecture Version:** 1.0
**Build:** 443/443 tests passing (vitest) · TypeScript strict · Production build clean

---

### Added

#### Agent Framework

- Agent Framework (14 Prisma models, 11 services, 8 APIs, 9 pages, 12 components)
- Agent Runtime (lifecycle: start/stop/pause/resume, sessions, tasks, executions)
- Agent Registry (registration, discovery, listing, enable/disable, stats)
- Agent Capability Framework (inputs, outputs, permissions, evidence, risk levels)
- Agent Context Engine (trusted context from 9 sources: financial, treasury, reports, integrations, workflows, users, policies, health, agent state)
- Agent Memory (short-term, long-term, user preference, conversation, recommendation)
- Evidence Engine (source tracking, verification, validation, search, summary)
- Decision Engine (structured decisions, alternatives, approvals, history, stats)
- Approval Integration (connects with existing approval framework, escalation, delegation)
- Collaboration Framework (agent delegation with traceability, chain tracking, stats)
- Human Interaction Layer (questions, clarification, evidence presentation, reasoning, feedback)
- Agent Governance (permissions, rate limits, safety policies, governance dashboard)
- Agent APIs (8 REST endpoint groups, 18 HTTP handlers, Zod validation, RBAC, tenant isolation)
- Agent Dashboard (9 enterprise pages: dashboard, registry, health, decisions, sessions, tasks, memory, governance, configuration)
- Agent Framework Documentation (architecture + extension guide)
- 14 Prisma models with 37 indexes and 23 foreign keys
- Migration `20260717040000_agent_framework` (383 lines SQL)

#### Financial Platform

- Double-entry ledger system with DEBIT/CREDIT per transaction across wallets
- Journal entries with 7-state lifecycle: `PENDING` → `SETTLED`
- Chart of accounts with multi-currency support
- Reconciliation engine — run reconciliations, track exceptions, generate reports
- Period closing workflows with approval chains
- Treasury accounts with deposits, internal transfers, and controls
- Multi-currency account management with real-time balances
- 16 Prisma models for treasury domain persistence (cash positions, liquidity, pools, movements, forecasts, funding requests, investment buckets, restricted cash, working capital, FX exposure, counterparty risk, policies, alerts, snapshots)

#### Treasury

- Cash position tracking and management
- Liquidity forecasting with configurable horizons
- FX exposure monitoring and rate management
- Counterparty risk assessment
- Cash policy engine with configurable rules
- Treasury snapshot generation
- Treasury funding request workflows
- Restricted cash and working capital tracking

#### Reporting

- Financial statement generation
- Executive dashboard with 6 widgets: accounts, approvals, risk, health, treasury, workflow
- Audit report generation with immutable event trails
- Analytics engine with workflow performance metrics
- Custom SVG chart components (zero external chart libraries): CashFlowTimeline, ForecastChart, VarianceCard, ApprovalAnalytics, WorkflowAnalytics
- AI insights panel with anomaly detection summaries
- Budget variance visualization with bar charts
- Approval path donut charts
- Workflow performance stacked bar charts
- Executive KPI cards with trend indicators

#### Integrations

- Connector platform with lifecycle management (validate, health check, sync)
- Plaid integration for real bank account linking, balance sync, transaction import
- Webhook system with event logging and failure tracking
- Data lineage tracking across sync operations
- ERP integration framework with adoption friction reduction strategy
- SMTP email delivery with configurable server settings
- Slack webhook notifications
- Per-event-type notification preferences (in-app bell, email, Slack)
- Connector categorization: banking, ERP, accounting, CSV

#### Intelligence

- 6 intelligence engines: anomaly detection, forecasting, KPIs, scorecards, recommendations, trends
- KPI calculation engine with configurable metrics
- Anomaly detection with severity classification and alerting
- Forecasting engine with configurable horizons and confidence intervals
- Scorecard generation with trend tracking
- Recommendation engine with actionable insights
- AI provider registry supporting OpenAI, Anthropic, Gemini, Azure OpenAI, Mistral, Grok, Cohere
- Model registry with per-provider model catalog
- Provider health monitoring with cached health status

#### Workflow Engine

- Workflow orchestration engine with step-based execution
- 10+ step executors (conditional branches, approvals, data transforms, integrations, notifications, etc.)
- Approval workflows with sequential and parallel modes
- 12 trigger types for automation scheduling
- Business rules builder with `ConditionGroup` + `RuleAction[]` definitions
- Approval matrix evaluator with role/dept/threshold matching, escalation, delegation
- Condition evaluator with shared `OPERATOR_MAP` (extracted from ConditionalBranchStepExecutor)
- Template library with reusable workflow templates
- Automation registry for workflow discovery and management
- Automation Studio: 11 routes across dashboard, analytics, approval matrix, business rules, scheduler, templates, designer, monitoring, setup
- Workflow analytics service with step-level durations, bottleneck detection, failure rates, queue metrics
- Automation scheduler wrapping PgBoss via queue service
- 11 automation-studio module files + 20+ onboarding module files
- 5 API routes: business-rules, approval-matrix, schedules, setup, AI assistant proxy

#### Security

- Authentication via Auth.js / NextAuth with bcrypt credentials + OAuth-ready
- Role-based access control (RBAC): OWNER, ADMIN, TREASURER, MEMBER, VIEWER roles
- Granular permissions per resource with `GranularPermission` registry
- AES-256-GCM encryption with key rotation for PII, financial data, credentials
- Tenant isolation — all resources scoped to `companyId` via `requireTenantContext()`
- CSRF protection via `validateOrigin`
- Rate limiting at edge proxy level for auth, mutation, financial, and public endpoints
- CSP/HSTS/security headers enforcement
- Input sanitization across all API endpoints
- Secrets management with env validation — never commit secrets, keys, tokens
- Security audit logging for all sensitive operations
- Dependency vulnerability scanner
- 10-point mandatory security review checklist for all changes
- Immutable audit log trail for compliance and operational review

#### Multi-Tenancy

- Complete tenant isolation via `companyId` scoping
- `CompanyMembership` model for user-company association
- Default role and permission seeding per new company
- Cross-tenant access blocked at proxy and service layer
- 15 frozen architecture components with change management policy

#### AI Governance

- Trust model for AI-assisted decisions
- Evidence requirements framework
- AI governance principles registry
- Provider health monitoring with automatic fallback

#### Enterprise UI

- **Enterprise Forms System** (15 components): EnterpriseForm with auto-save (debounced 2s), EnterpriseSection (collapsible, error badges), EnterpriseField (standardized label/input/error/help), SmartSelect (searchable, grouped, keyboard navigation), ConditionEditor (AND/OR logic), ApprovalPreview (sequential/parallel simulation), EnterpriseWizard (multi-step), ReviewStep (pre-submit validation), FieldHelp, FieldHint, ValidationSummary, AutoSaveIndicator, UnsavedChangesGuard
- **Enterprise Tables 2.0**: Ultra-compact density, multi-column sort, 6 cell formatters (Currency, Number, Date, Status, Trend, Tags), inline editing (text/number/currency/date/select), CSV + XLS export (zero dependencies), highlighted search results, ellipsis pagination, relative date presets
- **Enterprise Motion System** (13 components): AnimatedCard, AnimatedButton, AnimatedDialog, AnimatedToast, AnimatedMetric, AnimatedSidebar, AnimatedTable/AnimatedTableRow, PageTransition, SectionTransition/SectionItem, LoadingSkeleton/SkeletonGroup/SkeletonCard/SkeletonTable, MotionProvider with reduced-motion awareness. 12+ animation variants, standardized durations (100-600ms), 6 easing curves
- **Executive Mobile Experience** (9 components): MobileMetricCard, ExecutiveSummaryCard, ApprovalQuickView, MobileNotificationCenter, QuickActionBar, AdaptiveNavigation, TouchToolbar, OfflineIndicator, ConnectionStatus. 2 mobile pages (`/mobile-dashboard`, `/mobile/treasury`). Route classification across 96 routes: 26 DesktopOnly, 41 Responsive, 15 ExecutiveMobile, 7 TabletOptimized
- **Accessibility (WCAG 2.1 AA)**: Skip navigation link, 33 orphaned form labels fixed, 25+ aria-labels added, 4 backdrop overlays with keyboard support, 6 native confirms replaced with ConfirmDialog, keyboard shortcuts (Cmd+N/F/S, ? for help), landmark labels on sidebar/topbar/nav
- **Analytics Components** (13): ExecutiveKpiCard, ChartToolbar, ChartLegend, VarianceCard, CashFlowTimeline, ForecastChart, ApprovalAnalytics, WorkflowAnalytics, DrillDownPanel, InsightPanel, ExecutiveSummary, types, index
- **Responsive hooks**: `useBreakpoint()`, `useIsMobile()`, `useIsTablet()`, `useOnlineStatus()`
- 3 migrated forms: business-rules-form, approval-matrix-form, scheduler-form

#### Onboarding

- 10-step onboarding wizard with prerequisite tracking and estimated completion times
- Onboarding state machine with pure session + step state transition validation
- Setup registry with step definitions, prerequisites, categories, estimated minutes
- Per-step, prerequisite, and session validators
- Company setup service with save draft, get draft, complete, validate
- Organization structure service with CRUD, tree hierarchy, bulk create, cycle detection
- 10-step verification: company setup, org structure, users, treasury, integrations, governance, AI, workflows, operations, intelligence
- Enterprise readiness service with 12-domain verification, scoring, suggestions, report generation
- 4 onboarding UI components: wizard, stepper, readiness display, dashboard preview
- Post-completion dashboard preview with feature grid and navigation

#### Infrastructure

- **Persistence Layer** (`src/server/persistence/` — 42 files): Domain types, errors, repository interfaces, transaction manager, pagination/filters/sorting abstractions, base/generic repositories, memory/postgres/mysql/sqlite adapters, registry, factory, unit-of-work, migration framework (engine, history, runner), schema versioning, health monitor, diagnostics. Zero ORM dependencies at abstraction layer
- **Cache Layer** (`src/server/cache/`): CacheManager facade over LRU in-memory + Redis (ioredis); tiered TTL config (critical 5s → stale 600s); namespaced key builder; hit/miss/set/eviction tracking; typed event bus; graceful degradation on Redis failure
- **Distributed Locks** (`src/server/locks/`): ILockManager facade; in-memory + Redis-backed; hierarchical locking; exponential backoff retry; automatic lease renewal; `withLock` helper
- **Queue Persistence** (`src/server/queues/`): FIFO/priority/delayed/scheduled queue types; worker pool with concurrency control; 8 default queues; dead-letter routing; `QueueManager` facade with enqueueBatch/registerWorker/start/stop
- **Observability** (`src/server/observability/`): MetricsRegistry with Counter/Gauge/Histogram; span-based tracing with ring buffer; HealthRegistry with 5 standard checks; 8 metric domains; Prometheus exporter; structured JSON logger; OpenTelemetry bridge
- **Background Jobs**: Typed job payload schemas (Notification, Workflow, AI, Report, ConnectorSync); async notification delivery via PgBoss; job monitoring API with status lookup, queue stats, cancellation
- **Installation & Deployment** (`src/server/installer/` — 16 files): Installation engine, validator, env validator, prerequisite checker, migration runner, seed manager, rollback manager, company bootstrap, admin bootstrap, health validator, backup manager, upgrade manager
- **CLI** (`src/cli/` — 8 files): 11 commands (install, validate, migrate, seed, backup, restore, upgrade, doctor, health, version)
- **Identity & Access Management** (`src/server/identity/` — 13 files): Identity provider manager, authentication service, session manager, user provisioning, group manager, role manager, permission manager, policy engine, audit service, SSO handler
- **High Availability**: Health/readiness/liveness endpoints, graceful shutdown/startup, connection draining, circuit breaker, auto-reconnect
- **Recovery**: Backup manager, restore manager, snapshot manager, recovery validator/drills, recovery metrics
- **Configuration**: Typed `InfrastructureConfig` for all layers; env variable loading; deep merge; programmatic API
- **Infrastructure Facade**: `initializeInfrastructure()` / `shutdownInfrastructure()` / `checkInfrastructureHealth()`
- Docker: Multi-stage Dockerfile with healthcheck, docker-entrypoint.sh, docker-compose (dev + prod)
- Kubernetes: Deployment, ingress, secrets, ConfigMap, HPA, PDB, network policies, PVC, migration Job
- CI/CD: `.github/workflows/ci.yml` (typecheck, lint, test, build, security scan, dependency audit, migration verify) + `deploy.yml` (deploy, rollback)
- Edge proxy (`src/proxy.ts`): Auth, rate limiting, CSRF, correlation ID generation, request timing, locale detection
- Shared route helpers (`src/server/http/handle-route.ts`): `handleRouteError()` / `zodErrorResponse()` pattern across 272 API endpoints
- Cache-Control headers on 18 read endpoints with tiered TTLs (15-120s) and stale-while-revalidate
- 9 parallelized DB queries across 2 services (read-only, cross-table)
- `next-intl` v4.13.1 — full i18n framework with en/ar locale routing
- `@next/bundle-analyzer` with `pnpm analyze` script

#### Testing

- 443+ tests passing via vitest
- 18 test suites across 15 categories: unit, integration, repository, service, API, component, infrastructure, smoke, regression, golden snapshot, contract, E2E, benchmark, load, stress, chaos
- Mock factories, seed factories, fixtures, data builders, repo comparator
- 85% coverage threshold enforced
- Treasury domain seed data (deterministic mock data)

---

### Changed

- Error handling unified across all 272 API endpoints to use shared `handleRouteError()` / `zodErrorResponse()` pattern (auto-studio-specific helpers deprecated)
- Notification delivery moved from inline `await` to async background jobs via PgBoss queue
- 3 forms migrated to EnterpriseForm system: business-rules-form, approval-matrix-form, scheduler-form (backward-compatible)
- Onboarding wizard upgraded to EnterpriseWizard with `hideStepBar` prop for sidebar layouts
- Workflow designer upgraded to WorkflowCanvas (zoom/pan/grid/minimap) + WorkflowToolbar (undo/redo/save)
- 4 consumer pages migrated from base DataTable to EnterpriseTable: ledger, transactions, audit-logs, incidents
- 13 existing components wired to motion system: MetricCard, PageContainer, EnterprisePageHeader, EnterpriseForm, EnterpriseSection, EnterpriseField, ValidationSummary, Breadcrumbs, ChartCard, DataTable, NotificationCenter, WorkflowCanvas, WorkflowDesigner
- MetricCard uses AnimatedCard with hover elevation + selection glow
- 9 independent DB queries parallelized with `Promise.all` (read-only, cross-table operations)
- All integrations gracefully fall back to mock/dev mode when credentials are absent
- README updated with platform status badge and v1.0 completion marks

---

### Architecture

- **Proxy replaces Middleware**: Next.js 16 uses `src/proxy.ts` instead of `src/middleware.ts` for edge-level processing
- **ConditionEvaluator extracted**: Shared evaluation logic used by business rules, approval matrix, and conditional branches
- **ApprovalMatrixEvaluator is pure resolver**: Determines WHAT to do; execution stays in ApprovalStepExecutor (HOW)
- **In-memory stores** for rules/schedules/matrix: Ephemeral per process; DB persistence planned
- **EnterpriseReadinessService is stateless**: Evaluates via Prisma queries and existing service composition — no duplicated evaluation logic
- **Onboarding steps are validation-only**: Check config metadata and existing Prisma records without calling module execution methods
- **15 frozen architecture components** with formal change management policy
- **Module composition**: AutomationStudioService acts as facade over all automation-studio sub-modules
- **Readiness verification**: 12-domain check across identity, organization, users, treasury, banks, ERP, accounting, governance, workflow, automation, AI, connectors

---

### Security

- 10-point mandatory pre-commit security checklist covering data exposure, permissions, tenant isolation, audit logging, encryption, reversibility, privilege escalation, secrets, rate limiting, and compliance
- AES-256-GCM encryption at rest with automated key rotation
- CSRF protection via origin validation at edge proxy
- Edge rate limiting on all auth, mutation, financial, and public endpoints
- CSP and HSTS security headers enforced globally
- Input sanitization across all 272 API endpoints
- Dependency vulnerability scanning integrated into CI pipeline
- Security audit logging for all state-changing operations
- RBAC with 5 roles and granular per-resource permissions
- Complete tenant isolation validated at proxy and service layer

---

### Documentation

- `docs/releases/v1.0-platform-core.md` — Platform metadata, completion phases, statistics
- `docs/releases/release-notes-v1.0.md` — Major capabilities, infrastructure, roadmap
- `docs/architecture/architecture-freeze-v1.md` — 15 frozen components, change management policy
- `docs/design/enterprise-forms.md` — Form philosophy, architecture, validation, accessibility
- `docs/design/enterprise-table-system.md` — Table philosophy, density, filtering, performance
- `docs/design/motion-system.md` — Motion philosophy, durations, easings, per-component specs
- `docs/design/executive-mobile-experience.md` — Mobile philosophy, breakpoints, workflows, performance targets
- `docs/design/ux-accessibility-audit.md` — Findings, remediation, business value, future recommendations
- `docs/design/form-audit.md` — Full audit of 11 form domains with migration roadmap
- `docs/research/customer-discovery.md` — Validated customer pain points
- `docs/strategy/erp-adoption-friction.md` — ERP integration friction reduction
- `docs/i18n/localization-strategy.md` — Arabic RTL readiness plan with phased component audit
- `docs/performance/enterprise-performance-audit.md` — 43 findings across 7 domains
- `docs/performance/database-optimization-report.md` — 18 indexes, 5 N+1 eliminations, pagination, transactions
- `docs/performance/api-optimization-report.md` — 31 files changed, unified error format, Cache-Control, parallelization
- `docs/persistence/` — 14 documentation files covering persistence architecture
- `docs/infrastructure/` — 8 documentation files (cache, locks, queues, observability, configuration, benchmarking, integration, index)
- `docs/operations/` — 8 runbooks (deploy, rollback, recovery, monitoring, scaling, maintenance, oncall, checklist)
- `docs/compliance/` — SOC 2, ISO 27001, PCI DSS, GDPR readiness documentation
- `docs/deployment/` — 11 documents (installation, production, Docker, K8s, upgrade, rollback, DR, troubleshooting, ops manual, admin guide, index)
- `docs/identity/` — 12 documents (architecture, authentication, authorization, RBAC, ABAC, SSO, SAML, OIDC, security, developer guide, admin guide, index)
- `docs/testing/`, `docs/security/`, `docs/recovery/`, `docs/monitoring/`, `docs/release/` — Supporting documentation

---

### Developer Experience

- `pnpm typecheck` — TypeScript strict mode, must pass before commit
- `pnpm build` — Production build, must pass before commit
- `pnpm test` — 443/443 tests passing via vitest with 85% coverage threshold
- `pnpm analyze` — Bundle analysis via `@next/bundle-analyzer`
- Unified error handling pattern (`handleRouteError` / `zodErrorResponse`) eliminates per-route boilerplate
- Shared route helpers in `src/server/http/handle-route.ts`
- CLI with 11 commands for installation, validation, migration, backup, restore, upgrades, health checks
- Deterministic seed data for consistent development and testing environments
- Demo mode with pre-seeded realistic data — no account required to explore

---

## [0.x] - Pre-release

Pre-1.0 development focused on building the core financial infrastructure, treasury operations, and enterprise platform foundations. Key phases included:

- **Phase 7A-7C** — Core treasury, banking integration, ledger system, wallet management, notifications, risk monitoring, policy engine, calendar, reconciliation
- **Phase 7D** — Onboarding module and enterprise readiness verification
- **Phase 7E** — Enterprise persistence infrastructure (42-file persistence layer, Prisma repositories, cache, locks, queues, observability)
- **Phase 7F** — Enterprise production readiness (18 test suites, security framework, recovery systems, high availability, Docker/K8s, CI/CD, observability, compliance documentation)
- **Phase 8A.1-8A.5** — Performance audit, database optimization, API optimization, background jobs & async processing
- **Phase 8B.4-8B.9** — Enterprise tables, executive analytics, forms & workflow UX, motion system, mobile experience, accessibility audit
- **Phase 11B** — Enterprise installation & deployment platform (installer, CLI, Docker improvements, K8s enhancements)
- **Phase 11C** — Enterprise identity & access management (13-file IAM system, 9 admin pages, 12 docs)
- **Version 1.0 Milestone** — Platform metadata, architecture freeze, CRM module, release documentation

---

[Unreleased]: https://github.com/anomalyco/vaultareloaded/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/anomalyco/vaultareloaded/releases/tag/v1.0.0
