# Perionyx Public Website — Page Hierarchy

> **Phase**: 22.0A — Public Platform Architecture
> **Status**: Architecture (no code)
> **Last Updated**: 2026-07-22
> **Total Pages**: 71 static pages + dynamic blog

---

## 1. Home

### `/` — Perionyx Homepage

- **Purpose**: One sentence that makes CFOs stop scrolling: this is the finance platform built for precision, not features.
- **Primary Audience**: CFO, Finance Director
- **Page Goal**: Visitor understands what Perionyx is, who it's for, and why it's different within 10 seconds. Leave with intent to explore Product or request a demo.
- **Content Sections**:
  1. Hero — one sentence value prop, primary CTA (Book a Demo), secondary CTA (See the Product)
  2. Trust bar — logos of design partners or key metrics (392 APIs, 67 modules, 338 data models)
  3. Problem statement — "Your finance stack is a patchwork" narrative
  4. Solution overview — 6 capability tiles (AP, Treasury, Approvals, Intelligence, Compliance, AI)
  5. Architecture callout — "Built for precision" with Decimal(38,12) callout
  6. Social proof — customer quote or design partner logo
  7. Final CTA — "See it in your environment" with Book a Demo
- **SEO**: Title: `Perionyx — Enterprise Finance Platform | Precision Without Compromise` | Description: `Purpose-built for CFOs, Controllers, and Treasury teams. 392 API routes, 67 modules, 338 data models. Financial precision without compromise.` | Canonical: `https://perionyx.com/` | Keywords: `enterprise finance platform, CFO software, treasury management, financial precision`
- **CTA Primary**: Book a Demo | **CTA Secondary**: See the Product
- **Related Pages**: `/product`, `/platform`, `/security`, `/ai`

---

## 2. Product Section

### `/product` — Product Overview

- **Purpose**: Show the full scope of 12 integrated modules in one view — every finance workflow, one platform.
- **Primary Audience**: CFO, Finance Director, Controller
- **Page Goal**: Visitor sees all 12 modules, understands integration, and clicks into the module relevant to their pain point.
- **Content Sections**:
  1. Hero — "One platform. Every finance workflow."
  2. Module grid — 12 cards with icon, name, one-line value prop, link
  3. Integration diagram — how modules connect (AP→GL, Treasury→Payments, etc.)
  4. Persona path — "If you're a CFO..." / "If you're a Controller..." quick links
  5. Metrics strip — 392 APIs, 67 modules, 338 models
  6. CTA — Book a Demo
- **SEO**: Title: `Product Overview — 12 Integrated Finance Modules | Perionyx` | Description: `See how 12 integrated modules replace your finance stack. AP, AR, Treasury, Approvals, Risk, Compliance, Reconciliation, Audit, Executive Intelligence, GL, Cash Management, Reporting.` | Canonical: `https://perionyx.com/product` | Keywords: `finance platform modules, enterprise finance software, integrated finance`
- **CTA Primary**: Book a Demo | **CTA Secondary**: Explore a Module
- **Related Pages**: `/product/accounts-payable`, `/product/treasury`, `/platform/architecture`

### `/product/accounts-payable` — Accounts Payable

- **Purpose**: Explain the end-to-end AP workflow — from invoice receipt to payment — in terms of time saved and errors eliminated.
- **Primary Audience**: Controller, CFO
- **Page Goal**: Visitor understands the AP automation workflow and trusts it handles three-way matching, approvals, and payment execution.
- **Content Sections**:
  1. Hero — "Accounts payable without the manual"
  2. Workflow diagram — Invoice Receipt → Validation → Three-Way Match → Approval → Payment → GL Posting
  3. Key capabilities — 6-8 cards (auto-matching, tolerance rules, duplicate detection, approval routing, payment scheduling, multi-currency, OCR, audit trail)
  4. How it works — 30-second summary + 5-minute deep dive (expandable)
  5. Integration points — connects to Treasury, GL, Approval Matrix, Notifications
  6. Trust signals — Decimal(38,12) precision, tamper-evident audit
  7. CTA — Book a Demo
- **SEO**: Title: `Accounts Payable Automation Software | Perionyx` | Description: `Automate invoice receipt, three-way matching, approval routing, and payment execution. Match PO, receipt, and invoice automatically.` | Canonical: `https://perionyx.com/product/accounts-payable` | Keywords: `accounts payable automation, three-way matching, invoice processing software`
- **CTA Primary**: Book a Demo | **CTA Secondary**: See Three-Way Matching in Action
- **Related Pages**: `/product/treasury`, `/product/approvals`, `/product/general-ledger`

### `/product/accounts-receivable` — Accounts Receivable

- **Purpose**: Show how AR automation reduces DSO and eliminates manual collections follow-up.
- **Primary Audience**: CFO, Finance Director
- **Page Goal**: Visitor sees the AR workflow and understands automated dunning, payment tracking, and cash application.
- **Content Sections**:
  1. Hero — "Collections that work while you sleep"
  2. Workflow diagram — Invoice Generation → Delivery → Tracking → Dunning → Payment → Cash Application
  3. Key capabilities — 6-8 cards
  4. How it works — summary + deep dive
  5. Integration points — connects to GL, Treasury, Notifications
  6. Trust signals — audit trail, financial precision
  7. CTA — Book a Demo
- **SEO**: Title: `Accounts Receivable Management Software | Perionyx` | Description: `Automate invoice generation, payment tracking, dunning workflows, and cash application. See exactly who owes what and when.` | Canonical: `https://perionyx.com/product/accounts-receivable` | Keywords: `AR management software, accounts receivable automation, dunning workflow`
- **CTA Primary**: Book a Demo | **CTA Secondary**: See the AR Dashboard
- **Related Pages**: `/product/accounts-payable`, `/product/cash-management`, `/product/general-ledger`

### `/product/treasury` — Treasury Management

- **Purpose**: Demonstrate real-time cash visibility, multi-bank connectivity, and forecasting — the core of what treasurers need.
- **Primary Audience**: Treasury Manager, CFO
- **Page Goal**: Visitor trusts Perionyx can replace their treasury management system with real-time, multi-bank visibility.
- **Content Sections**:
  1. Hero — "Real-time cash visibility across every bank"
  2. Workflow diagram — Bank Feed → Position → Forecast → Decision → Action → Reconciliation
  3. Key capabilities — 6-8 cards (cash positioning, forecasting, multi-bank, FX, payments, sweeps, alerts, reporting)
  4. How it works — summary + deep dive
  5. Integration points — AP, AR, GL, Risk, Bank Connectors
  6. Trust signals — Decimal precision, real-time sync, audit trail
  7. CTA — Book a Demo
- **SEO**: Title: `Treasury Management Software | Perionyx` | Description: `Multi-bank connectivity, cash positioning, forecasting, and payment orchestration. Know your exact cash position at any moment.` | Canonical: `https://perionyx.com/product/treasury` | Keywords: `treasury management software, cash visibility, multi-bank connectivity`
- **CTA Primary**: Book a Demo | **CTA Secondary**: See Cash Positioning
- **Related Pages**: `/product/cash-management`, `/product/risk`, `/platform/connectors`

### `/product/approvals` — Enterprise Approval Workflows

- **Purpose**: Show how multi-level, role-based approvals replace email chains and spreadsheet sign-offs.
- **Primary Audience**: Controller, Finance Director
- **Page Goal**: Visitor sees the approval matrix builder and understands delegation, escalation, and audit trails.
- **Content Sections**:
  1. Hero — "Approvals that move at the speed of your business"
  2. Approval matrix visual — threshold-based, role-based, department-based routing
  3. Key capabilities — 6-8 cards (multi-level, delegation, escalation, audit, bulk, mobile, templates, SLA)
  4. How it works — summary + deep dive
  5. Integration points — AP, Treasury, Risk, Workflow Engine
  6. Trust signals — tamper-evident audit, RBAC enforcement
  7. CTA — Book a Demo
- **SEO**: Title: `Enterprise Approval Workflow Software | Perionyx` | Description: `Multi-level, role-based approval chains with delegation, escalation, and audit trails. From purchase orders to wire transfers.` | Canonical: `https://perionyx.com/product/approvals` | Keywords: `approval workflow software, enterprise approvals, purchase order approval`
- **CTA Primary**: Book a Demo | **CTA Secondary**: See the Approval Matrix
- **Related Pages**: `/product/accounts-payable`, `/product/risk`, `/security/authorization`

### `/product/risk` — Financial Risk Management

- **Purpose**: Show real-time risk visibility that boards and auditors trust.
- **Primary Audience**: CFO, Controller
- **Page Goal**: Visitor understands risk scoring, exposure monitoring, and policy-driven alerts.
- **Content Sections**:
  1. Hero — "See risk before it becomes loss"
  2. Risk dashboard mockup — exposure, counterparty, concentration
  3. Key capabilities — 6-8 cards (risk scoring, exposure monitoring, counterparty analysis, alerts, policies, reporting, trends, benchmarks)
  4. How it works — summary + deep dive
  5. Integration points — Treasury, Approvals, Compliance, Audit
  6. Trust signals — real-time, auditable, policy-driven
  7. CTA — Book a Demo
- **SEO**: Title: `Financial Risk Management Software | Perionyx` | Description: `Real-time risk scoring, exposure monitoring, counterparty analysis, and policy-driven alerts. Risk visibility your board will trust.` | Canonical: `https://perionyx.com/product/risk` | Keywords: `financial risk management, risk scoring, counterparty risk`
- **CTA Primary**: Book a Demo | **CTA Secondary**: See Risk Scoring
- **Related Pages**: `/product/treasury`, `/product/compliance`, `/product/approvals`

### `/product/compliance` — Compliance Automation

- **Purpose**: Show how compliance runs itself — policy enforcement, regulatory reporting, and audit-ready documentation.
- **Primary Audience**: Controller, Security Professional
- **Page Goal**: Visitor trusts Perionyx handles compliance obligations without manual effort.
- **Content Sections**:
  1. Hero — "Compliance that runs itself"
  2. Compliance framework overview — SOC 2, ISO 27001, PCI DSS, GDPR readiness
  3. Key capabilities — 6-8 cards (policy enforcement, regulatory reporting, controls testing, documentation, evidence collection, dashboards, alerts, audit trail)
  4. How it works — summary + deep dive
  5. Integration points — Audit, Risk, Workflow Engine, Notifications
  6. Trust signals — tamper-evident audit, automated controls
  7. CTA — Book a Demo
- **SEO**: Title: `Compliance Automation Software | Perionyx` | Description: `Policy enforcement, regulatory reporting, audit-ready documentation, and automated controls testing. Never scramble for an audit again.` | Canonical: `https://perionyx.com/product/compliance` | Keywords: `compliance automation, regulatory reporting, audit-ready compliance`
- **CTA Primary**: Book a Demo | **CTA Secondary**: See Compliance Roadmap
- **Related Pages**: `/product/audit`, `/security/compliance`, `/product/risk`

### `/product/reconciliation` — Enterprise Reconciliation

- **Purpose**: Show auto-matching at scale — banks, ERPs, sub-ledgers — with exception queues.
- **Primary Audience**: Controller, Treasury Manager
- **Page Goal**: Visitor sees reconciliation as a solved problem, not a month-end headache.
- **Content Sections**:
  1. Hero — "Reconciliation at scale, not at scale of effort"
  2. Matching visual — auto-match, tolerance rules, exception queue
  3. Key capabilities — 6-8 cards (auto-matching, tolerance rules, exception queues, multi-source, audit trail, reporting, scheduling, dashboards)
  4. How it works — summary + deep dive
  5. Integration points — Treasury, GL, Bank Connectors, AP/AR
  6. Trust signals — Decimal precision, full audit trail
  7. CTA — Book a Demo
- **SEO**: Title: `Enterprise Reconciliation Software | Perionyx` | Description: `Auto-match transactions across banks, ERPs, and sub-ledgers. Tolerance rules, exception queues, and full audit trails.` | Canonical: `https://perionyx.com/product/reconciliation` | Keywords: `enterprise reconciliation, bank reconciliation software, auto-matching`
- **CTA Primary**: Book a Demo | **CTA Secondary**: See Auto-Matching
- **Related Pages**: `/product/treasury`, `/product/general-ledger`, `/product/accounts-payable`

### `/product/audit` — Audit Trail & Governance

- **Purpose**: Prove every action is logged, every change is traceable — built for auditors who ask hard questions.
- **Primary Audience**: Controller, Security Professional
- **Page Goal**: Visitor trusts the audit trail is tamper-evident and complete.
- **Content Sections**:
  1. Hero — "Every action logged. Every change traceable."
  2. Audit record visual — append-only, cryptographic verification
  3. Key capabilities — 6-8 cards (tamper-evident records, change tracking, access logs, compliance evidence, export, search, retention, dashboards)
  4. How it works — summary + deep dive
  5. Integration points — all modules, Security
  6. Trust signals — append-only, cryptographic, exportable
  7. CTA — Book a Demo
- **SEO**: Title: `Audit Trail Software | Perionyx` | Description: `Tamper-evident audit records, change tracking, access logs, and compliance evidence export. Built for the auditor who asks hard questions.` | Canonical: `https://perionyx.com/product/audit` | Keywords: `audit trail software, tamper-evident audit, compliance evidence`
- **CTA Primary**: Book a Demo | **CTA Secondary**: See the Audit Log
- **Related Pages**: `/product/compliance`, `/security/audit-trail`, `/product/approvals`

### `/product/executive-intelligence` — Executive Intelligence

- **Purpose**: Show real-time KPIs, variance analysis, and AI insights that replace spreadsheet-based board packs.
- **Primary Audience**: CFO, FP&A
- **Page Goal**: Visitor envisions their morning briefing powered by Perionyx instead of spreadsheets.
- **Content Sections**:
  1. Hero — "Financial intelligence your board will trust"
  2. Dashboard mockup — KPI strip, charts, alerts, insights
  3. Key capabilities — 6-8 cards (real-time KPIs, variance analysis, trend detection, AI insights, morning briefings, board packs, forecasting, drill-down)
  4. How it works — summary + deep dive
  5. Integration points — all modules feed intelligence
  6. Trust signals — real-time, auditable sources, AI explainability
  7. CTA — Book a Demo
- **SEO**: Title: `Executive Financial Dashboard | Perionyx` | Description: `Real-time KPIs, variance analysis, trend detection, and AI-powered insights. Morning briefings without the spreadsheet dance.` | Canonical: `https://perionyx.com/product/executive-intelligence` | Keywords: `executive financial dashboard, CFO dashboard, financial KPIs`
- **CTA Primary**: Book a Demo | **CTA Secondary**: See the Morning Briefing
- **Related Pages**: `/ai`, `/product/risk`, `/product/compliance`

### `/product/general-ledger` — Enterprise General Ledger

- **Purpose**: Show the GL built on Decimal(38,12) precision — the ledger auditors will thank you for.
- **Primary Audience**: Controller, CFO
- **Page Goal**: Visitor trusts the GL handles financial precision without phantom cents or accumulation drift.
- **Content Sections**:
  1. Hero — "The ledger your auditors will thank you for"
  2. Precision callout — Decimal(38,12), banker's rounding, `Intl.NumberFormat`
  3. Key capabilities — 6-8 cards (double-entry, journal entries, allocations, period close, multi-entity, reporting, precision, audit)
  4. How it works — summary + deep dive
  5. Integration points — AP, AR, Treasury, all modules
  6. Trust signals — Decimal precision, append-only, tamper-evident
  7. CTA — Book a Demo
- **SEO**: Title: `Enterprise General Ledger Software | Perionyx` | Description: `Double-entry GL with Decimal(38,12) precision, journal entries, allocations, and period close management. No phantom cents.` | Canonical: `https://perionyx.com/product/general-ledger` | Keywords: `enterprise general ledger, financial precision, double-entry accounting`
- **CTA Primary**: Book a Demo | **CTA Secondary**: See Decimal Precision
- **Related Pages**: `/product/accounts-payable`, `/product/reconciliation`, `/platform/architecture`

### `/product/cash-management` — Cash Management

- **Purpose**: Show real-time cash positions, multi-currency management, and liquidity forecasting.
- **Primary Audience**: Treasury Manager, CFO
- **Page Goal**: Visitor sees Perionyx as their cash management nerve center.
- **Content Sections**:
  1. Hero — "Cash flow you can see, forecast, and control"
  2. Cash position dashboard mockup
  3. Key capabilities — 6-8 cards (real-time positions, multi-currency, forecasting, sweeps, alerts, reporting, reconciliation, connectivity)
  4. How it works — summary + deep dive
  5. Integration points — Treasury, GL, Bank Connectors, AP/AR
  6. Trust signals — Decimal precision, real-time, auditable
  7. CTA — Book a Demo
- **SEO**: Title: `Cash Management Platform | Perionyx` | Description: `Real-time cash positions, multi-currency management, liquidity forecasting, and automated cash sweeps.` | Canonical: `https://perionyx.com/product/cash-management` | Keywords: `cash management software, liquidity forecasting, multi-currency management`
- **CTA Primary**: Book a Demo | **CTA Secondary**: See Cash Positioning
- **Related Pages**: `/product/treasury`, `/product/general-ledger`, `/product/accounts-receivable`

---

## 3. Platform Section

### `/platform` — Platform Overview

- **Purpose**: Technical overview for CTOs and architects — the stack, the numbers, the architecture.
- **Primary Audience**: Engineer, Security Professional
- **Page Goal**: Technical decision-maker trusts the platform is enterprise-grade and well-architected.
- **Content Sections**:
  1. Hero — "Built for finance. Engineered for trust."
  2. Architecture diagram — client → API → modules → data layer
  3. Key metrics — 392 API routes, 67 modules, 338 Prisma models, PostgreSQL, Redis
  4. Technology stack cards — Next.js 16, React 19, Prisma ORM, PostgreSQL 16, Redis
  5. Navigation to 12 sub-pages — architecture, performance, reliability, etc.
  6. CTA — Read the Docs
- **SEO**: Title: `Platform Architecture — Next.js, PostgreSQL, Redis | Perionyx` | Description: `Next.js 16, 392 API routes, 67 modules, 338 data models, PostgreSQL, Redis. See the architecture behind an enterprise finance platform.` | Canonical: `https://perionyx.com/platform` | Keywords: `finance platform architecture, Next.js finance, PostgreSQL enterprise`
- **CTA Primary**: Read the Docs | **CTA Secondary**: Book a Demo
- **Related Pages**: `/platform/architecture`, `/engineering`, `/security`

### `/platform/architecture` — Architecture Overview

- **Purpose**: Deep-dive into the modular, domain-driven architecture with CQRS and typed events.
- **Primary Audience**: Engineer, Enterprise Architect
- **Page Goal**: Architect understands the design decisions, module boundaries, and why this architecture works for finance.
- **Content Sections**:
  1. Hero — "Architecture built for financial precision"
  2. Architecture layers — client, API, business logic, data
  3. Domain-driven design — bounded contexts, aggregate roots, value objects
  4. CQRS pattern — commands vs queries, event bus
  5. Financial precision — Decimal(38,12), banker's rounding throughout
  6. Module responsibility matrix — 67 modules, their boundaries
  7. Architecture decision records — link to engineering blog
  8. CTA — Read the Engineering Blog
- **SEO**: Title: `Architecture Overview — Domain-Driven Design | Perionyx` | Description: `Modular domain-driven architecture with CQRS patterns, typed domain events, and Decimal(38,12) precision throughout.` | Canonical: `https://perionyx.com/platform/architecture` | Keywords: `enterprise architecture, domain-driven design, CQRS finance`
- **CTA Primary**: Read the Engineering Blog | **CTA Secondary**: See Performance Numbers
- **Related Pages**: `/engineering/architecture`, `/platform/performance`, `/platform/security`

### `/platform/performance` — Performance Engineering

- **Purpose**: Show measurable performance — 32ms median, cache strategy, and database optimization.
- **Primary Audience**: Engineer, CFO
- **Page Goal**: Technical evaluator trusts the platform is fast and knows how.
- **Content Sections**:
  1. Hero — "32ms median response time. Here's how."
  2. Performance metrics — response times, throughput, LCP targets
  3. Cache architecture — tiered TTL (5s–600s), Redis + in-memory
  4. Database optimization — 79+ indexes, 5 N+1 eliminations, parallelization
  5. CDN strategy — edge caching, stale-while-revalidate
  6. Monitoring — Prometheus metrics, real-time dashboards
  7. CTA — Read the Engineering Blog
- **SEO**: Title: `Performance Engineering — 32ms Response Time | Perionyx` | Description: `CDN strategy, cache tiers (5s–600s TTL), database indexing (79+ indexes), query optimization, and parallelization.` | Canonical: `https://perionyx.com/platform/performance` | Keywords: `platform performance, API response time, database optimization`
- **CTA Primary**: Read the Engineering Blog | **CTA Secondary**: See the Architecture
- **Related Pages**: `/engineering/performance`, `/platform/architecture`, `/platform/infrastructure`

### `/platform/reliability` — Reliability & High Availability

- **Purpose**: Show 99.9% uptime with circuit breakers, health probes, and graceful degradation.
- **Primary Audience**: Engineer, Security Professional
- **Page Goal**: Operations team trusts the platform handles failures gracefully.
- **Content Sections**:
  1. Hero — "99.9% uptime with graceful degradation"
  2. HA architecture — circuit breakers, auto-reconnect, connection draining
  3. Health probes — readiness, liveness, startup
  4. Graceful shutdown — in-flight request completion, resource cleanup
  5. Disaster recovery — backup, restore, snapshot, drills
  6. Monitoring — alerting, incident response, status page
  7. CTA — View System Status
- **SEO**: Title: `Reliability & High Availability — 99.9% Uptime | Perionyx` | Description: `Circuit breakers, auto-reconnect, connection draining, health/readiness/liveness probes, and graceful shutdown.` | Canonical: `https://perionyx.com/platform/reliability` | Keywords: `platform reliability, high availability, disaster recovery`
- **CTA Primary**: View System Status | **CTA Secondary**: Read the Architecture
- **Related Pages**: `/status`, `/platform/observability`, `/platform/deployment`

### `/platform/integrations` — Integration Layer

- **Purpose**: Show the 10 integration points and how modules connect to external systems.
- **Primary Audience**: Engineer, CFO
- **Page Goal**: Technical evaluator understands integration patterns and breadth.
- **Content Sections**:
  1. Hero — "Connect everything your finance team uses"
  2. Integration map — 10 points: GL, Treasury, Approvals, Notifications, Budget, AI, Audit, ERP, Banking, Reporting
  3. API patterns — REST, webhooks, idempotency, correlation IDs
  4. Authentication — API keys, OAuth, session tokens
  5. Error handling — consistent error contract across 392 endpoints
  6. Rate limiting — per-endpoint, per-tenant
  7. CTA — Read the API Docs
- **SEO**: Title: `Integration Layer — 10 Enterprise Integration Points | Perionyx` | Description: `10 integration points: GL, Treasury, Approvals, Notifications, Budget, AI, Audit, ERP, Banking, Reporting. REST APIs with idempotency and webhook support.` | Canonical: `https://perionyx.com/platform/integrations` | Keywords: `enterprise integrations, finance API, ERP integration`
- **CTA Primary**: Read the API Docs | **CTA Secondary**: Book a Demo
- **Related Pages**: `/platform/api`, `/platform/connectors`, `/product`

### `/platform/connectors` — Connector Platform

- **Purpose**: Show plug-and-play connectors for banks, ERPs, and accounting software.
- **Primary Audience**: Engineer, Treasury Manager
- **Page Goal**: Technical evaluator sees the connector ecosystem and health monitoring.
- **Content Sections**:
  1. Hero — "Plug into 50+ financial systems"
  2. Connector categories — Banking, ERP, Accounting, CSV
  3. Connector lifecycle — validate, health check, sync, retry
  4. Health monitoring — real-time connector status, sync metrics
  5. Custom connectors — how to build your own
  6. Security — credential encryption, OAuth flows
  7. CTA — Read the Docs
- **SEO**: Title: `Financial System Connectors | Perionyx` | Description: `Bank connectors, ERP integrations (SAP, Oracle, NetSuite), accounting software, CSV import. Health checks, sync metrics, and retry logic.` | Canonical: `https://perionyx.com/platform/connectors` | Keywords: `bank connector, ERP integration, financial system connectors`
- **CTA Primary**: Read the Docs | **CTA Secondary**: Book a Demo
- **Related Pages**: `/platform/integrations`, `/product/treasury`, `/product/accounts-payable`

### `/platform/api` — API Documentation

- **Purpose**: Document the 392 REST endpoints with error contracts, validation, and auth.
- **Primary Audience**: Engineer
- **Page Goal**: Developer can find an endpoint, understand its contract, and make a test call.
- **Content Sections**:
  1. Hero — "392 REST endpoints. Fully documented."
  2. API overview — REST conventions, versioning, pagination
  3. Authentication — API keys, bearer tokens, session cookies
  4. Request/response format — JSON, Zod validation, error contract
  5. Rate limiting — headers, limits, retry-after
  6. Idempotency — x-idempotency-key header, 24h TTL
  7. Endpoint catalog — browsable list by domain
  8. CTA — Try the API
- **SEO**: Title: `API Documentation — 392 REST Endpoints | Perionyx` | Description: `RESTful API with consistent error contracts, Zod validation, idempotency keys, correlation IDs, and pagination.` | Canonical: `https://perionyx.com/platform/api` | Keywords: `finance API, REST API documentation, enterprise API`
- **CTA Primary**: Try the API | **CTA Secondary**: Read the Architecture
- **Related Pages**: `/platform/developer`, `/platform/integrations`, `/engineering`

### `/platform/developer` — Developer Experience

- **Purpose**: Everything a developer needs to build on Perionyx — SDK, guides, and tooling.
- **Primary Audience**: Engineer
- **Page Goal**: Developer can set up a dev environment and make their first API call.
- **Content Sections**:
  1. Hero — "Everything you need to build on Perionyx"
  2. Quick start — 5-minute setup guide
  3. SDK overview — TypeScript SDK, code examples
  4. Webhook guide — event types, payload format, verification
  5. Testing utilities — mock data, sandbox mode
  6. Community — GitHub, Discord, Stack Overflow
  7. CTA — Get Started
- **SEO**: Title: `Developer Experience — SDK, Webhooks, Testing | Perionyx` | Description: `TypeScript SDK, API reference, webhook guides, testing utilities, and development environment setup.` | Canonical: `https://perionyx.com/platform/developer` | Keywords: `developer experience, TypeScript SDK, finance API SDK`
- **CTA Primary**: Get Started | **CTA Secondary**: Read the API Docs
- **Related Pages**: `/platform/api`, `/engineering/open-source`, `/engineering/contribute`

### `/platform/deployment` — Deployment & Infrastructure

- **Purpose**: Show production-grade deployment — Docker, Kubernetes, CI/CD, rollback.
- **Primary Audience**: Engineer, Security Professional
- **Page Goal**: DevOps engineer trusts the deployment pipeline and infrastructure.
- **Content Sections**:
  1. Hero — "Ship with confidence"
  2. Deployment options — Docker, Kubernetes, cloud-native
  3. CI/CD pipeline — typecheck, lint, test, build, security scan, deploy
  4. Blue-green deployments — zero-downtime deploys
  5. Rollback — automated rollback on health check failure
  6. Infrastructure — Kubernetes manifests, HPA, PDB, network policies
  7. CTA — Read the Docs
- **SEO**: Title: `Deployment & Infrastructure — Docker, Kubernetes, CI/CD | Perionyx` | Description: `Docker multi-stage builds, Kubernetes manifests, CI/CD pipelines, blue-green deployments, and rollback procedures.` | Canonical: `https://perionyx.com/platform/deployment` | Keywords: `enterprise deployment, Kubernetes finance, Docker CI/CD`
- **CTA Primary**: Read the Docs | **CTA Secondary**: View the Architecture
- **Related Pages**: `/platform/infrastructure`, `/platform/reliability`, `/engineering/infrastructure`

### `/platform/infrastructure` — Infrastructure Architecture

- **Purpose**: Deep-dive into cache, locks, queues, and observability layers.
- **Primary Audience**: Engineer
- **Page Goal**: Architect understands the infrastructure primitives and their design.
- **Content Sections**:
  1. Hero — "From cache to queues, built for scale"
  2. Cache layer — Redis + in-memory, tiered TTL, namespace keys
  3. Distributed locks — hierarchical, exponential backoff, lease renewal
  4. Queue system — PgBoss, FIFO/priority/delayed, dead-letter routing
  5. Observability — Prometheus, OpenTelemetry, structured logging
  6. Configuration — typed config, env variables, programmatic API
  7. CTA — Read the Engineering Blog
- **SEO**: Title: `Infrastructure Architecture — Cache, Locks, Queues | Perionyx` | Description: `Redis cache with tiered TTL, distributed locks, PgBoss queues, Prometheus metrics, and OpenTelemetry tracing.` | Canonical: `https://perionyx.com/platform/infrastructure` | Keywords: `infrastructure architecture, Redis cache, distributed locks, PgBoss`
- **CTA Primary**: Read the Engineering Blog | **CTA Secondary**: See Performance
- **Related Pages**: `/engineering/infrastructure`, `/platform/performance`, `/platform/observability`

### `/platform/observability` — Observability & Monitoring

- **Purpose**: Show 8 metric domains, tracing, and health checks — see everything, miss nothing.
- **Primary Audience**: Engineer, Security Professional
- **Page Goal**: Operations engineer trusts monitoring covers all critical paths.
- **Content Sections**:
  1. Hero — "See everything. Miss nothing."
  2. Metric domains — 8 categories of metrics
  3. Distributed tracing — span-based with ring buffer
  4. Structured logging — Pino, JSON, correlation IDs
  5. Health checks — standard checks (cache, memory, uptime, queues, persistence)
  6. Alerting — threshold-based, escalation
  7. Dashboard — real-time observability UI
  8. CTA — View the Metrics
- **SEO**: Title: `Observability & Monitoring — 8 Metric Domains | Perionyx` | Description: `8 metric domains, Prometheus exporter, structured JSON logging, health checks, alerting, and audit trails.` | Canonical: `https://perionyx.com/platform/observability` | Keywords: `observability, monitoring, Prometheus, application metrics`
- **CTA Primary**: View the Metrics | **CTA Secondary**: Read the Architecture
- **Related Pages**: `/platform/reliability`, `/platform/infrastructure`, `/platform/security`

### `/platform/security` — Security Architecture

- **Purpose**: Technical security overview — how security is woven into every layer.
- **Primary Audience**: Security Professional, Engineer
- **Page Goal**: Security architect trusts the platform's security posture at the architecture level.
- **Content Sections**:
  1. Hero — "Security is not a feature. It's the foundation."
  2. Security layers — auth, authz, encryption, audit, isolation
  3. RBAC + ABAC — 64 permissions, 8 roles, 12 SoD rules
  4. Encryption — AES-256-GCM, key rotation
  5. Audit — append-only, tamper-evident, exportable
  6. Network — Kubernetes policies, CSP, HSTS
  7. CTA — Read the Full Security Docs
- **SEO**: Title: `Security Architecture — RBAC, AES-256, Audit | Perionyx` | Description: `RBAC + ABAC, AES-256-GCM encryption, MFA (TOTP), CSRF protection, rate limiting, dependency scanning, and tamper-evident audit.` | Canonical: `https://perionyx.com/platform/security` | Keywords: `enterprise security architecture, RBAC, AES-256, financial security`
- **CTA Primary**: Read the Full Security Docs | **CTA Secondary**: View Compliance Status
- **Related Pages**: `/security`, `/security/encryption`, `/security/authentication`

---

## 4. Security Section

### `/security` — Security Overview

- **Purpose**: One-page trust builder — every security layer explained clearly for CISOs and procurement.
- **Primary Audience**: Security Professional, CFO
- **Page Goal**: Security decision-maker trusts Perionyx handles security comprehensively.
- **Content Sections**:
  1. Hero — "Your data is protected at every layer"
  2. Security layer diagram — authentication, authorization, encryption, audit, isolation
  3. Key capabilities — 6 cards (MFA, RBAC, encryption, audit, tenant isolation, compliance)
  4. Trust signals — SOC 2 readiness, zero Critical findings, MFA
  5. Compliance roadmap — current status, timeline
  6. Link to deep-dive sub-pages
  7. CTA — Read the Full Security Docs
- **SEO**: Title: `Security Overview — Enterprise Security | Perionyx` | Description: `Authentication, authorization, encryption, audit trails, tenant isolation, and compliance. Security built into the architecture.` | Canonical: `https://perionyx.com/security` | Keywords: `enterprise security, platform security, financial data security`
- **CTA Primary**: Read the Full Security Docs | **CTA Secondary**: View Compliance Roadmap
- **Related Pages**: `/security/authentication`, `/security/encryption`, `/platform/security`

### `/security/authentication` — Authentication & MFA

- **Purpose**: Detail TOTP-based MFA, session management, and zero-trust authentication.
- **Primary Audience**: Security Professional
- **Page Goal**: Security evaluator confirms authentication meets enterprise standards.
- **Content Sections**:
  1. Hero — "Multi-factor authentication, zero trust"
  2. MFA flow — TOTP enrollment, confirm, verify, disable
  3. Recovery codes — 10 SHA-256-hashed codes
  4. Session management — token rotation, 30s revocation cache
  5. Timing-safe comparison — prevent timing attacks
  6. Rate limiting — login attempts, MFA verification
  7. CTA — Read the Architecture
- **SEO**: Title: `Authentication & MFA — TOTP, Zero Trust | Perionyx` | Description: `TOTP-based MFA with 10 recovery codes, timing-safe comparison, session management with 30s revocation cache.` | Canonical: `https://perionyx.com/security/authentication` | Keywords: `MFA authentication, TOTP, zero trust authentication`
- **CTA Primary**: Read the Architecture | **CTA Secondary**: View Access Control
- **Related Pages**: `/security/authorization`, `/security/encryption`, `/platform/security`

### `/security/authorization` — Access Control (RBAC + ABAC)

- **Purpose**: Detail 64 permissions, 8 roles, 12 SoD rules, and endpoint-level enforcement.
- **Primary Audience**: Security Professional, Controller
- **Page Goal**: Security evaluator confirms authorization model is fine-grained and enforced correctly.
- **Content Sections**:
  1. Hero — "Role-based access with fine-grained control"
  2. Permission model — 64 permissions across 8 roles
  3. Separation of duties — 12 SoD rules
  4. Endpoint enforcement — authorization at the endpoint, not the handler
  5. MFA-flagged operations — sensitive actions require MFA
  6. API key scoping — least-privilege API keys
  7. CTA — Read the Permission Matrix
- **SEO**: Title: `Access Control — RBAC, ABAC, 64 Permissions | Perionyx` | Description: `64 permissions, 8 roles, 12 separation-of-duty rules, MFA-flagged sensitive operations.` | Canonical: `https://perionyx.com/security/authorization` | Keywords: `RBAC, ABAC, role-based access control, permission management`
- **CTA Primary**: Read the Permission Matrix | **CTA Secondary**: View Authentication
- **Related Pages**: `/security/authentication`, `/product/approvals`, `/platform/security`

### `/security/encryption` — Data Encryption

- **Purpose**: Detail AES-256-GCM encryption, key rotation, and cryptographic practices.
- **Primary Audience**: Security Professional
- **Page Goal**: Security evaluator confirms encryption meets enterprise requirements.
- **Content Sections**:
  1. Hero — "AES-256-GCM. Key rotation. No shortcuts."
  2. Encryption at rest — AES-256-GCM for sensitive fields
  3. Encryption in transit — TLS 1.3, HSTS
  4. Key management — rotation, derivation, storage
  5. Credential handling — demo passwords, HMAC-derived sandbox passwords
  6. Backup encryption — encrypted backups with key separation
  7. CTA — Read the Architecture
- **SEO**: Title: `Data Encryption — AES-256-GCM, Key Rotation | Perionyx` | Description: `All sensitive data encrypted at rest and in transit. Automatic key rotation, cryptographic key management, and encrypted backup.` | Canonical: `https://perionyx.com/security/encryption` | Keywords: `AES-256 encryption, data encryption, key rotation`
- **CTA Primary**: Read the Architecture | **CTA Secondary**: View Audit Trail
- **Related Pages**: `/security/authentication`, `/security/audit-trail`, `/platform/security`

### `/security/audit-trail` — Tamper-Evident Audit

- **Purpose**: Prove the audit trail is append-only, cryptographically verified, and complete.
- **Primary Audience**: Security Professional, Controller
- **Page Goal**: Auditor trusts every action is logged and nothing can be altered.
- **Content Sections**:
  1. Hero — "Every action logged. Nothing deleted."
  2. Append-only design — no UPDATE or DELETE on audit records
  3. Cryptographic verification — tamper detection
  4. Change tracking — before/after snapshots
  5. Access logs — who accessed what, when
  6. Compliance export — auditor-ready formats
  7. CTA — Read the Architecture
- **SEO**: Title: `Tamper-Evident Audit Trail | Perionyx` | Description: `Append-only audit records with cryptographic verification. Change tracking, access logs, and compliance evidence export.` | Canonical: `https://perionyx.com/security/audit-trail` | Keywords: `tamper-evident audit, audit trail, compliance evidence`
- **CTA Primary**: Read the Architecture | **CTA Secondary**: View Compliance
- **Related Pages**: `/product/audit`, `/security/compliance`, `/product/compliance`

### `/security/multi-tenancy` — Tenant Isolation

- **Purpose**: Prove data never crosses tenant boundaries — row-level isolation at every layer.
- **Primary Audience**: Security Professional, CFO
- **Page Goal**: Enterprise buyer trusts their data is isolated from other tenants.
- **Content Sections**:
  1. Hero — "Your data never touches another tenant's"
  2. Row-level isolation — query scoping, mandatory companyId
  3. Cache namespacing — tenant-prefixed cache keys
  4. Cross-tenant blocking — `requireTenantContext()` enforcement
  5. Audit trail — tenant-scoped audit records
  6. Testing — integration tests verifying isolation
  7. CTA — Read the Architecture
- **SEO**: Title: `Tenant Isolation — Row-Level Security | Perionyx` | Description: `Row-level tenant isolation, query scoping, cache namespacing, and cross-tenant access blocked at every layer.` | Canonical: `https://perionyx.com/security/multi-tenancy` | Keywords: `tenant isolation, multi-tenancy, row-level security`
- **CTA Primary**: Read the Architecture | **CTA Secondary**: View Access Control
- **Related Pages**: `/security/authorization`, `/security/encryption`, `/platform/architecture`

### `/security/api-security` — API Security

- **Purpose**: Detail rate limiting, CSRF, input validation, and webhook protections.
- **Primary Audience**: Security Professional, Engineer
- **Page Goal**: Security evaluator confirms API attack surface is minimized.
- **Content Sections**:
  1. Hero — "Every endpoint authenticated, authorized, audited"
  2. Rate limiting — per-endpoint, per-tenant, memory-safe
  3. CSRF protection — origin validation, token-based
  4. Input validation — Zod schemas on all endpoints
  5. Webhook SSRF protection — URL validation, private IP blocking
  6. Body size limits — 1MB default, 10MB hard cap
  7. Dependency scanning — pnpm audit, CI-blocking on high severity
  8. CTA — Read the Architecture
- **SEO**: Title: `API Security — Rate Limiting, CSRF, Validation | Perionyx` | Description: `Rate limiting, CSRF protection, input validation (Zod), dependency scanning, webhook SSRF protection, and request body size limits.` | Canonical: `https://perionyx.com/security/api-security` | Keywords: `API security, rate limiting, CSRF protection, input validation`
- **CTA Primary**: Read the Architecture | **CTA Secondary**: View Infrastructure
- **Related Pages**: `/platform/api`, `/security/infrastructure`, `/security/dependency-scanning`

### `/security/infrastructure` — Infrastructure Security

- **Purpose**: Show Kubernetes hardening, Docker security, and network policies.
- **Primary Audience**: Security Professional
- **Page Goal**: Infrastructure security evaluator confirms hardening is production-grade.
- **Content Sections**:
  1. Hero — "Hardened from the network up"
  2. Kubernetes — network policies, secrets management, Pod Security Policies
  3. Docker — image scanning, non-root containers, minimal base images
  4. Network — DNS egress restrictions, ingress rate limiting
  5. Headers — HSTS, CSP, X-Content-Type-Options, X-Frame-Options
  6. Secrets — no plaintext in manifests, env var injection
  7. CTA — Read the Architecture
- **SEO**: Title: `Infrastructure Security — Kubernetes, Docker, Network | Perionyx` | Description: `Kubernetes network policies, encrypted secrets, Docker image scanning, HSTS, CSP headers, and DNS egress restrictions.` | Canonical: `https://perionyx.com/security/infrastructure` | Keywords: `infrastructure security, Kubernetes security, Docker security`
- **CTA Primary**: Read the Architecture | **CTA Secondary**: View Compliance
- **Related Pages**: `/platform/deployment`, `/security/api-security`, `/security/compliance`

### `/security/compliance` — Compliance Roadmap

- **Purpose**: Current compliance posture and remediation timeline — SOC 2, ISO 27001, PCI DSS, GDPR.
- **Primary Audience**: Security Professional, CFO, Controller
- **Page Goal**: Compliance officer sees current status, gaps, and timeline.
- **Content Sections**:
  1. Hero — "SOC 2, ISO 27001, PCI DSS, GDPR readiness"
  2. Compliance matrix — 4 frameworks with current %, gap, timeline
  3. SOC 2 readiness — controls, evidence, timeline
  4. ISO 27001 readiness — ISMS scope, controls
  5. PCI DSS readiness — payment data handling
  6. GDPR readiness — data subject rights, processing
  7. Remediation timeline — phases and milestones
  8. CTA — Download Compliance Report
- **SEO**: Title: `Compliance Roadmap — SOC 2, ISO 27001, PCI DSS, GDPR | Perionyx` | Description: `Current compliance posture, gap analysis, remediation timeline, and auditor-ready documentation.` | Canonical: `https://perionyx.com/security/compliance` | Keywords: `SOC 2 compliance, ISO 27001, PCI DSS, GDPR compliance`
- **CTA Primary**: Download Compliance Report | **CTA Secondary**: View Security Overview
- **Related Pages**: `/security`, `/product/compliance`, `/product/audit`

### `/security/dependency-scanning` — Dependency Security

- **Purpose**: Show automated vulnerability detection and blocking in CI.
- **Primary Audience**: Security Professional, Engineer
- **Page Goal**: Security evaluator confirms supply chain is monitored.
- **Content Sections**:
  1. Hero — "Automated vulnerability detection"
  2. Scanning pipeline — pnpm audit in CI
  3. Severity thresholds — high blocks deploy
  4. Automated alerts — notifications on new vulnerabilities
  5. Patch management — update process, testing
  6. License compliance — prohibited licenses, audit
  7. CTA — Read the Architecture
- **SEO**: Title: `Dependency Security — Automated Vulnerability Scanning | Perionyx` | Description: `pnpm audit, CI-integrated dependency scanning, automated alerts, and patch management.` | Canonical: `https://perionyx.com/security/dependency-scanning` | Keywords: `dependency security, vulnerability scanning, supply chain security`
- **CTA Primary**: Read the Architecture | **CTA Secondary**: View API Security
- **Related Pages**: `/security/api-security`, `/platform/deployment`, `/engineering`

### `/security/incident-response` — Incident Response

- **Purpose**: Show preparedness — response procedures, communication, and forensics.
- **Primary Audience**: Security Professional, CFO
- **Page Goal**: Enterprise buyer trusts Perionyx can handle security incidents professionally.
- **Content Sections**:
  1. Hero — "When something goes wrong, here's our plan"
  2. Response procedures — detection, triage, containment, eradication, recovery
  3. Communication — notification templates, timelines, channels
  4. Forensic capabilities — log retention, audit trail, trace analysis
  5. Post-incident review — blameless, documented, action items
  6. SLA — response time commitments
  7. CTA — Read the Full Plan
- **SEO**: Title: `Incident Response Plan | Perionyx` | Description: `Response procedures, communication templates, forensic capabilities, and post-incident review process.` | Canonical: `https://perionyx.com/security/incident-response` | Keywords: `incident response, security incident, breach response`
- **CTA Primary**: Read the Full Plan | **CTA Secondary**: View Compliance
- **Related Pages**: `/security/compliance`, `/security`, `/platform/reliability`

---

## 5. AI Section

### `/ai` — AI for Finance

- **Purpose**: Establish the AI philosophy — evidence-first, human-in-control, explainable.
- **Primary Audience**: CFO, Controller
- **Page Goal**: Finance leader trusts AI recommendations because they can see the reasoning.
- **Content Sections**:
  1. Hero — "AI that explains itself. Humans that stay in control."
  2. Philosophy cards — evidence-first, explainable, human-approved, privacy-respecting
  3. Capability overview — 6 use cases (decision intelligence, anomaly detection, forecasting, coding, approvals, briefings)
  4. Trust signals — confidence scores, source tracking, audit trail
  5. "What AI will NOT do" — honest limitations
  6. CTA — See AI in Action
- **SEO**: Title: `AI for Finance — Evidence-First, Explainable, Human-Controlled | Perionyx` | Description: `Evidence-first AI with confidence scores, source tracking, and human approval for every recommendation.` | Canonical: `https://perionyx.com/ai` | Keywords: `AI finance, explainable AI, enterprise AI, CFO AI`
- **CTA Primary**: See AI in Action | **CTA Secondary**: Read the Governance Docs
- **Related Pages**: `/ai/explainability`, `/ai/governance`, `/product/executive-intelligence`

### `/ai/capabilities` — AI Capabilities

- **Purpose**: Show what AI can do today with real examples and measurable outcomes.
- **Primary Audience**: CFO, Treasury Manager
- **Page Goal**: Finance leader sees specific AI capabilities that solve their problems.
- **Content Sections**:
  1. Hero — "What Perionyx AI can do today"
  2. Capability cards — 6 detailed use cases with before/after
  3. Decision intelligence — approval routing suggestions with evidence
  4. Anomaly detection — payment pattern flagging
  5. Cash forecasting — 13-week forecast with confidence intervals
  6. Invoice coding — GL account suggestions with precedent
  7. Executive briefings — morning briefing generation
  8. CTA — Book a Demo
- **SEO**: Title: `AI Capabilities — Decision Intelligence, Anomaly Detection | Perionyx` | Description: `Decision intelligence, anomaly detection, cash forecasting, invoice coding, approval routing, and executive briefings.` | Canonical: `https://perionyx.com/ai/capabilities` | Keywords: `AI capabilities, decision intelligence, anomaly detection AI`
- **CTA Primary**: Book a Demo | **CTA Secondary**: See Explainability
- **Related Pages**: `/ai/explainability`, `/ai/providers`, `/product/executive-intelligence`

### `/ai/providers` — AI Provider Architecture

- **Purpose**: Show multi-provider architecture with health monitoring and automatic failover.
- **Primary Audience**: Engineer, CFO
- **Page Goal**: Technical evaluator sees provider diversity and reliability.
- **Content Sections**:
  1. Hero — "Multiple providers. Zero lock-in."
  2. Provider grid — OpenAI, Anthropic, Gemini, Azure OpenAI, Mistral, Grok, Cohere
  3. Model registry — 22 models, selection criteria
  4. Health monitoring — real-time provider health, automatic failover
  5. Cost optimization — model selection by task, cost per query
  6. Privacy — no training on customer data, data residency
  7. CTA — Read the Architecture
- **SEO**: Title: `AI Provider Architecture — 7 Providers, 22 Models | Perionyx` | Description: `OpenAI, Anthropic, Gemini, Azure OpenAI, Mistral, Grok, Cohere. Provider health monitoring, automatic failover, and cost optimization.` | Canonical: `https://perionyx.com/ai/providers` | Keywords: `AI providers, multi-model AI, LLM architecture`
- **CTA Primary**: Read the Architecture | **CTA Secondary**: See Models
- **Related Pages**: `/ai/models`, `/ai/governance`, `/platform/architecture`

### `/ai/models` — AI Models & Selection

- **Purpose**: Document 22 models, selection criteria, and task-model mapping.
- **Primary Audience**: Engineer
- **Page Goal**: Developer understands which model to use for which task.
- **Content Sections**:
  1. Hero — "The right model for the right task"
  2. Model registry — 22 models with provider, capability, cost
  3. Selection criteria — accuracy, latency, cost, task suitability
  4. Task mapping — which model for which use case
  5. Versioning — model version tracking and migration
  6. Benchmarking — performance comparison
  7. CTA — Read the Benchmarks
- **SEO**: Title: `AI Models — 22 Models Across 7 Providers | Perionyx` | Description: `22 models across 7 providers. Selection criteria: accuracy, latency, cost, and task suitability.` | Canonical: `https://perionyx.com/ai/models` | Keywords: `AI models, LLM selection, model registry`
- **CTA Primary**: Read the Benchmarks | **CTA Secondary**: See Providers
- **Related Pages**: `/ai/providers`, `/ai/benchmarks`, `/ai/capabilities`

### `/ai/governance` — AI Governance

- **Purpose**: Show permission-scoped AI actions, rate limiting, and safety validation.
- **Primary Audience**: Security Professional, CFO
- **Page Goal**: Enterprise buyer trusts AI has guardrails, not just features.
- **Content Sections**:
  1. Hero — "AI with guardrails, not just guardrails for AI"
  2. Permission model — AI actions scoped to user permissions
  3. Rate limiting — per-user, per-tenant AI quotas
  4. Safety validation — pre-execution checks, policy enforcement
  5. Audit logging — every AI action logged with reasoning
  6. Human-in-the-loop — approval required for high-impact decisions
  7. CTA — Read the Architecture
- **SEO**: Title: `AI Governance — Permission-Scoped, Human-Approved | Perionyx` | Description: `Permission-scoped AI actions, rate limiting, safety validation, audit logging, and human-in-the-loop.` | Canonical: `https://perionyx.com/ai/governance` | Keywords: `AI governance, AI safety, enterprise AI governance`
- **CTA Primary**: Read the Architecture | **CTA Secondary**: View Privacy
- **Related Pages**: `/ai/privacy`, `/security/authorization`, `/ai/explainability`

### `/ai/privacy` — AI & Privacy

- **Purpose**: Prove customer data is never used for training and privacy controls are enforced.
- **Primary Audience**: Security Professional, CFO
- **Page Goal**: Enterprise buyer confirms AI doesn't compromise data privacy.
- **Content Sections**:
  1. Hero — "Your data stays yours"
  2. No training policy — customer data never used for model training
  3. Data residency — where data is processed, storage location
  4. PII detection — automatic detection and redaction
  5. Provider guarantees — privacy commitments from each provider
  6. Opt-out controls — per-feature AI opt-out
  7. CTA — Read the Privacy Policy
- **SEO**: Title: `AI & Privacy — No Training on Customer Data | Perionyx` | Description: `No training on customer data, data residency controls, PII detection and redaction, and provider privacy guarantees.` | Canonical: `https://perionyx.com/ai/privacy` | Keywords: `AI privacy, data privacy, no training on customer data`
- **CTA Primary**: Read the Privacy Policy | **CTA Secondary**: View Governance
- **Related Pages**: `/ai/governance`, `/privacy`, `/security`

### `/ai/explainability` — AI Explainability

- **Purpose**: Show how every AI recommendation shows reasoning, confidence, and source.
- **Primary Audience**: CFO, Controller
- **Page Goal**: Finance leader trusts AI because they can see why it suggested what it suggested.
- **Content Sections**:
  1. Hero — "Why the AI suggested what it suggested"
  2. Evidence panel — precedent decisions, confidence level, policy applied
  3. Source tracking — which data informed the recommendation
  4. Confidence scoring — 5-level confidence with visual indicators
  5. Disagreement path — "who to ask if you disagree"
  6. Audit trail — AI reasoning logged for compliance
  7. CTA — See It in Action
- **SEO**: Title: `AI Explainability — See the Reasoning Behind Every Recommendation | Perionyx` | Description: `Every recommendation shows: precedent decisions, confidence level, policy applied, and who to ask if you disagree.` | Canonical: `https://perionyx.com/ai/explainability` | Keywords: `explainable AI, AI transparency, AI reasoning`
- **CTA Primary**: See It in Action | **CTA Secondary**: Read the Governance
- **Related Pages**: `/ai`, `/ai/governance`, `/ai/capabilities`

### `/ai/benchmarks` — AI Benchmarks

- **Purpose**: Show measured performance — accuracy, latency, cost — not marketing claims.
- **Primary Audience**: CFO, Engineer
- **Page Goal**: Decision-maker sees verifiable performance metrics.
- **Content Sections**:
  1. Hero — "Measured performance, not marketing claims"
  2. Accuracy metrics — per-task accuracy, comparison with manual
  3. Response times — p50, p95, p99 latency per model
  4. Cost analysis — cost per query, cost per decision
  5. Comparison — AI vs. manual process benchmarks
  6. Methodology — how we measure, what we don't claim
  7. CTA — Book a Demo
- **SEO**: Title: `AI Benchmarks — Accuracy, Latency, Cost | Perionyx` | Description: `Accuracy metrics, response times, cost per query, and comparison with manual processes. All numbers verifiable.` | Canonical: `https://perionyx.com/ai/benchmarks` | Keywords: `AI benchmarks, AI performance, LLM accuracy`
- **CTA Primary**: Book a Demo | **CTA Secondary**: See Capabilities
- **Related Pages**: `/ai/capabilities`, `/ai/models`, `/ai`

### `/ai/roadmap` — AI Roadmap

- **Purpose**: Show upcoming AI capabilities and research directions — public and honest.
- **Primary Audience**: CFO, Engineer
- **Page Goal**: Potential buyer sees future capabilities and feels the platform is actively developed.
- **Content Sections**:
  1. Hero — "What's next in AI for finance"
  2. In progress — features actively being built
  3. Coming soon — features planned for next quarter
  4. Under consideration — community-requested features
  5. Research directions — what we're exploring
  6. Community input — how to request features
  7. CTA — Request a Feature
- **SEO**: Title: `AI Roadmap — Upcoming Capabilities | Perionyx` | Description: `Upcoming capabilities, research directions, and community requests. Public and updated monthly.` | Canonical: `https://perionyx.com/ai/roadmap` | Keywords: `AI roadmap, AI future, finance AI capabilities`
- **CTA Primary**: Request a Feature | **CTA Secondary**: Book a Demo
- **Related Pages**: `/roadmap`, `/ai/capabilities`, `/ai`

---

## 6. Engineering Section

### `/engineering` — Engineering Blog Index

- **Purpose**: Hub for engineering essays — principles, culture, and deep dives.
- **Primary Audience**: Engineer
- **Page Goal**: Engineer explores the engineering culture and reads a deep dive.
- **Content Sections**:
  1. Hero — "How we build Perionyx"
  2. Featured post — latest or most popular
  3. Post grid — title, date, category, excerpt
  4. Category filters — Architecture, Performance, Security, AI, Culture
  5. Newsletter signup — engineering blog updates
  6. CTA — Read the Latest Post
- **SEO**: Title: `Engineering Blog — How We Build Perionyx | Perionyx` | Description: `Deep dives into financial precision, workflow architecture, security engineering, and AI integration.` | Canonical: `https://perionyx.com/engineering` | Keywords: `engineering blog, finance engineering, technical blog`
- **CTA Primary**: Read the Latest Post | **CTA Secondary**: Contribute
- **Related Pages**: `/engineering/architecture`, `/engineering/contribute`, `/engineering/blog`

### `/engineering/architecture` — Architecture Decisions

- **Purpose**: ADR index — every major technical decision documented with rationale.
- **Primary Audience**: Engineer
- **Page Goal**: Developer understands the why behind every architectural choice.
- **Content Sections**:
  1. Hero — "Every decision has a record"
  2. ADR index — 15 frozen components, change management policy
  3. Key decisions — Decimal precision, CQRS, in-memory stores, event bus
  4. Decision template — context, decision, consequences, status
  5. Architecture freeze — v1.0 components, change process
  6. CTA — Read the Full Architecture
- **SEO**: Title: `Architecture Decision Records — The Why Behind Every Choice | Perionyx` | Description: `Architecture decision records documenting the why behind every major technical choice.` | Canonical: `https://perionyx.com/engineering/architecture` | Keywords: `architecture decisions, ADR, technical decisions`
- **CTA Primary**: Read the Full Architecture | **CTA Secondary**: See Performance
- **Related Pages**: `/platform/architecture`, `/engineering/performance`, `/engineering`

### `/engineering/performance` — Performance Engineering

- **Purpose**: Show how we went from 900ms to 32ms — database optimization, API tuning, caching.
- **Primary Audience**: Engineer
- **Page Goal**: Developer learns concrete optimization techniques applied to finance.
- **Content Sections**:
  1. Hero — "From 900ms to 32ms"
  2. Database optimization — 18 indexes, 5 N+1 eliminations
  3. API optimization — 31 files changed, unified error format
  4. Cache strategy — tiered TTL, stale-while-revalidate
  5. Parallelization — 9 independent DB queries parallelized
  6. Monitoring — how we measure and alert
  7. CTA — Read the Full Report
- **SEO**: Title: `Performance Engineering — From 900ms to 32ms | Perionyx` | Description: `Database optimization (18 indexes, 5 N+1 eliminations), API optimization (31 files changed), cache strategy, and parallelization.` | Canonical: `https://perionyx.com/engineering/performance` | Keywords: `performance engineering, API optimization, database optimization`
- **CTA Primary**: Read the Full Report | **CTA Secondary**: See the Architecture
- **Related Pages**: `/platform/performance`, `/engineering/architecture`, `/engineering/infrastructure`

### `/engineering/testing` — Testing Strategy

- **Purpose**: Document 443 tests across 15 categories — the testing philosophy and results.
- **Primary Audience**: Engineer
- **Page Goal**: Developer trusts the testing rigor and understands the approach.
- **Content Sections**:
  1. Hero — "443 tests. 15 categories. Zero flakiness."
  2. Test categories — unit, integration, repository, service, API, component, infrastructure, smoke, regression, golden snapshot, contract, E2E, benchmark, load, stress, chaos
  3. Coverage targets — 85% threshold
  4. Mock factories — seed data, fixtures, data builders
  5. CI integration — how tests run in the pipeline
  6. Test philosophy — what we test and why
  7. CTA — Read the Test Suite
- **SEO**: Title: `Testing Strategy — 443 Tests Across 15 Categories | Perionyx` | Description: `Unit, integration, API, E2E, load, stress, chaos testing. 85% coverage threshold. Zero flaky tests.` | Canonical: `https://perionyx.com/engineering/testing` | Keywords: `testing strategy, test coverage, enterprise testing`
- **CTA Primary**: Read the Test Suite | **CTA Secondary**: See the Architecture
- **Related Pages**: `/engineering/architecture`, `/engineering/performance`, `/engineering`

### `/engineering/infrastructure` — Infrastructure Engineering

- **Purpose**: Deep-dive into cache, locks, queues, and observability primitives.
- **Primary Audience**: Engineer
- **Page Goal**: Infrastructure engineer understands the primitives and their design.
- **Content Sections**:
  1. Hero — "Cache, locks, queues, observability"
  2. Cache architecture — Redis + LRU, tiered TTL, namespace keys
  3. Distributed locks — hierarchical, backoff, lease renewal
  4. Queue system — PgBoss, FIFO/priority/delayed, dead-letter
  5. Observability — metrics, tracing, logging, health
  6. Infrastructure facade — initialize, shutdown, health check
  7. CTA — Read the Full Docs
- **SEO**: Title: `Infrastructure Engineering — Cache, Locks, Queues | Perionyx` | Description: `Redis cache with tiered TTL, distributed locks, PgBoss queues, Prometheus metrics, and OpenTelemetry tracing.` | Canonical: `https://perionyx.com/engineering/infrastructure` | Keywords: `infrastructure engineering, distributed systems, cache architecture`
- **CTA Primary**: Read the Full Docs | **CTA Secondary**: See Performance
- **Related Pages**: `/platform/infrastructure`, `/engineering/performance`, `/engineering/architecture`

### `/engineering/open-source` — Open Source

- **Purpose**: Explain our approach to open source — what we publish and why.
- **Primary Audience**: Engineer
- **Page Goal**: Developer understands how to use and contribute to open-source components.
- **Content Sections**:
  1. Hero — "Building in public"
  2. What we publish — SDK, utilities, connector framework
  3. Licensing — MIT/Apache for tools, proprietary for platform
  4. Governance — decision process, roadmapping
  5. Community — GitHub, Discord, issues
  6. CTA — Star on GitHub
- **SEO**: Title: `Open Source — Building in Public | Perionyx` | Description: `Our approach to open source: what we publish, why we publish it, and how to use it.` | Canonical: `https://perionyx.com/engineering/open-source` | Keywords: `open source, building in public, finance open source`
- **CTA Primary**: Star on GitHub | **CTA Secondary**: Contribute
- **Related Pages**: `/engineering/contribute`, `/platform/developer`, `/engineering`

### `/engineering/contribute` — Contribute

- **Purpose**: Everything a contributor needs — setup, standards, PR process.
- **Primary Audience**: Engineer
- **Page Goal**: Contributor can set up the project and submit their first PR.
- **Content Sections**:
  1. Hero — "Help us build the finance platform"
  2. Development setup — prerequisites, clone, install, run
  3. Coding standards — TypeScript, ESLint, Prettier
  4. PR process — branch, commit, test, review, merge
  5. Testing requirements — what to test, coverage targets
  6. Architecture guidelines — module structure, patterns
  7. CTA — Get Started
- **SEO**: Title: `Contribute to Perionyx — Development Setup & Guidelines | Perionyx` | Description: `Development setup, coding standards, PR process, testing requirements, and architectural guidelines.` | Canonical: `https://perionyx.com/engineering/contribute` | Keywords: `contribute, open source contribution, development setup`
- **CTA Primary**: Get Started | **CTA Secondary**: Read the Architecture
- **Related Pages**: `/engineering/open-source`, `/engineering/architecture`, `/engineering`

### `/engineering/blog` — Blog Listing

- **Purpose**: Chronological listing of all engineering blog posts with filtering.
- **Primary Audience**: Engineer
- **Page Goal**: Reader finds a post relevant to their interests and reads it.
- **Content Sections**:
  1. Hero — "Latest from the engineering team"
  2. Filter bar — category, date, search
  3. Post list — title, date, category, excerpt, read time
  4. Pagination — infinite scroll or paginated
  5. Newsletter signup — get new posts via email
  6. CTA — Read a Post
- **SEO**: Title: `Engineering Blog — Technical Deep Dives | Perionyx` | Description: `Technical deep dives, product announcements, and industry commentary.` | Canonical: `https://perionyx.com/engineering/blog` | Keywords: `engineering blog, technical articles, finance engineering`
- **CTA Primary**: Read a Post | **CTA Secondary**: Subscribe
- **Related Pages**: `/engineering`, `/engineering/architecture`, `/engineering/performance`

---

## 7. Research Section

### `/research` — Research Hub

- **Purpose**: Central hub for customer discovery insights and market research.
- **Primary Audience**: CFO, Finance Director, Engineer
- **Page Goal**: Reader finds research relevant to their domain and engages with findings.
- **Content Sections**:
  1. Hero — "What we've learned from finance teams"
  2. Featured research — latest or most cited
  3. Research grid — title, date, category, summary
  4. Methodology note — how we conduct research
  5. CTA — Read the Latest Research
- **SEO**: Title: `Research — Customer Discovery & Market Insights | Perionyx` | Description: `Customer discovery insights, market analysis, and enterprise finance research.` | Canonical: `https://perionyx.com/research` | Keywords: `finance research, customer discovery, enterprise finance insights`
- **CTA Primary**: Read the Latest Research | **CTA Secondary**: Book a Demo
- **Related Pages**: `/research/insights`, `/research/customer-stories`, `/research/market`

### `/research/insights` — Research Insights

- **Purpose**: Data-driven insights from 47+ finance leader conversations.
- **Primary Audience**: CFO, FP&A
- **Page Goal**: Finance leader sees their pain points reflected in real data.
- **Content Sections**:
  1. Hero — "Data-driven insights from the field"
  2. Methodology — how many leaders, roles, company sizes
  3. Key findings — 5-7 data points with context
  4. Pain point analysis — top challenges ranked
  5. Adoption patterns — what's working, what's not
  6. Implications — what this means for finance teams
  7. CTA — Book a Demo
- **SEO**: Title: `Research Insights — Enterprise Finance Pain Points | Perionyx` | Description: `Analysis of enterprise finance workflows, pain points, and adoption patterns. Based on 47+ finance leader conversations.` | Canonical: `https://perionyx.com/research/insights` | Keywords: `finance pain points, enterprise finance research, CFO insights`
- **CTA Primary**: Book a Demo | **CTA Secondary**: Read Customer Stories
- **Related Pages**: `/research/customer-stories`, `/product`, `/research`

### `/research/customer-stories` — Customer Stories

- **Purpose**: Case studies from design partners showing real workflows and outcomes.
- **Primary Audience**: CFO, Finance Director
- **Page Goal**: Prospect sees a peer who solved the same problem.
- **Content Sections**:
  1. Hero — "How finance teams use Perionyx"
  2. Case study cards — company, role, problem, solution, outcome
  3. Workflow highlight — specific feature used
  4. Metrics — time saved, errors reduced, process speed
  5. Quote — direct customer quote
  6. CTA — Become a Design Partner
- **SEO**: Title: `Customer Stories — Real Finance Teams, Real Results | Perionyx` | Description: `Case studies and testimonials from design partners and early customers. Real workflows, real outcomes.` | Canonical: `https://perionyx.com/research/customer-stories` | Keywords: `customer stories, case studies, finance platform results`
- **CTA Primary**: Become a Design Partner | **CTA Secondary**: Book a Demo
- **Related Pages**: `/company/partners`, `/research/insights`, `/product`

### `/research/market` — Market Analysis

- **Purpose**: Enterprise finance software landscape — sizing, competition, trends.
- **Primary Audience**: CFO, Engineer
- **Page Goal**: Reader understands where Perionyx fits in the market.
- **Content Sections**:
  1. Hero — "The enterprise finance software landscape"
  2. Market sizing — TAM, SAM, SOM
  3. Competitive landscape — how Perionyx compares
  4. Technology trends — AI, automation, real-time finance
  5. Buyer behavior — how CFOs evaluate software
  6. Our position — differentiation and thesis
  7. CTA — See Our Position
- **SEO**: Title: `Market Analysis — Enterprise Finance Software Landscape | Perionyx` | Description: `Market sizing, competitive landscape, and technology trends in enterprise financial management.` | Canonical: `https://perionyx.com/research/market` | Keywords: `finance software market, enterprise finance landscape, CFO software comparison`
- **CTA Primary**: See Our Position | **CTA Secondary**: Book a Demo
- **Related Pages**: `/research`, `/company`, `/product`

---

## 8. Company Section

### `/company` — About Perionyx

- **Purpose**: Introduce the company — who we are, why we're building this, and where we're headed.
- **Primary Audience**: All
- **Page Goal**: Visitor feels connected to the mission and trusts the team.
- **Content Sections**:
  1. Hero — "We're building the finance platform we'd want to use"
  2. Mission statement — one paragraph
  3. founding story — why this, why now
  4. Team preview — 3-4 key people with photos
  5. Values — 3-4 core values
  6. Metrics — team size, funding stage, design partners
  7. CTA — Meet the Team
- **SEO**: Title: `About Perionyx — The Finance Platform Built by Finance People | Perionyx` | Description: `Founded by finance people and engineers. Building for CFOs, Controllers, and Treasury teams who demand precision.` | Canonical: `https://perionyx.com/company` | Keywords: `about Perionyx, finance platform company, enterprise fintech`
- **CTA Primary**: Meet the Team | **CTA Secondary**: See Our Mission
- **Related Pages**: `/company/mission`, `/company/team`, `/company/careers`

### `/company/mission` — Our Mission

- **Purpose**: Articulate the mission — finance platforms should earn trust, not demand it.
- **Primary Audience**: All
- **Page Goal**: Visitor understands the founding philosophy and feels aligned.
- **Content Sections**:
  1. Hero — "Finance platforms should earn trust, not demand it"
  2. Mission statement — full articulation
  3. Beliefs — what we believe about finance software
  4. Anti-patterns — what we refuse to build
  5. Commitments — specific promises to customers
  6. CTA — See What We're Building
- **SEO**: Title: `Our Mission — Finance Platforms That Earn Trust | Perionyx` | Description: `We believe enterprise finance software should be precise, transparent, and auditable by default.` | Canonical: `https://perionyx.com/company/mission` | Keywords: `company mission, finance platform mission, enterprise software values`
- **CTA Primary**: See What We're Building | **CTA Secondary**: Meet the Team
- **Related Pages**: `/company`, `/company/team`, `/product`

### `/company/team` — Team

- **Purpose**: Introduce the people — engineering, product, design, and finance domain experts.
- **Primary Audience**: All
- **Page Goal**: Visitor sees the team's credibility and connects with the humans.
- **Content Sections**:
  1. Hero — "The people building Perionyx"
  2. Team grid — photo, name, role, bio, LinkedIn
  3. Leadership — founding team with deeper bios
  4. Culture — how we work, our values in practice
  5. Join us — link to careers
  6. CTA — Open Positions
- **SEO**: Title: `Team — The People Building Perionyx | Perionyx` | Description: `Engineering, product, design, and finance domain experts. Our backgrounds, our values.` | Canonical: `https://perionyx.com/company/team` | Keywords: `team, about us, finance platform team`
- **CTA Primary**: Open Positions | **CTA Secondary**: See Our Mission
- **Related Pages**: `/company/careers`, `/company/mission`, `/company`

### `/company/careers` — Careers

- **Purpose**: Show open roles and engineering culture to attract talent.
- **Primary Audience**: All (especially engineers)
- **Page Goal**: Qualified candidate applies or shares the role with a friend.
- **Content Sections**:
  1. Hero — "Build the finance platform of the future"
  2. Open roles — grouped by department (Engineering, Product, Design, Finance)
  3. Role cards — title, location, type, brief description
  4. Culture — how we work, values, remote-friendly
  5. Benefits — compensation, equity, learning, flexibility
  6. Hiring process — transparent steps and timeline
  7. CTA — Apply Now
- **SEO**: Title: `Careers at Perionyx — Build the Finance Platform of the Future | Perionyx` | Description: `Open roles across engineering, product, design, and finance. What we value, how we work.` | Canonical: `https://perionyx.com/company/careers` | Keywords: `careers, finance platform jobs, engineering jobs, fintech careers`
- **CTA Primary**: Apply Now | **CTA Secondary**: See Our Culture
- **Related Pages**: `/engineering`, `/engineering/contribute`, `/company/team`

### `/company/press` — Press & Media

- **Purpose**: Press resources — releases, coverage, brand assets.
- **Primary Audience**: All (press, analysts)
- **Page Goal**: Journalist finds everything needed to write about Perionyx.
- **Content Sections**:
  1. Hero — "Perionyx in the news"
  2. Press releases — chronological list
  3. Media coverage — links to articles
  4. Brand assets — logos, screenshots, executive headshots
  5. Press contact — email, phone
  6. Boilerplate — standard company description
  7. CTA — Contact Press
- **SEO**: Title: `Press & Media — Perionyx in the News | Perionyx` | Description: `Press releases, media coverage, and brand assets.` | Canonical: `https://perionyx.com/company/press` | Keywords: `press, media, news, Perionyx`
- **CTA Primary**: Contact Press | **CTA Secondary**: Download Brand Kit
- **Related Pages**: `/company`, `/company/mission`, `/company/team`

### `/company/contact` — Contact

- **Purpose**: Route inquiries — sales, support, partnerships, general.
- **Primary Audience**: All
- **Page Goal**: Visitor sends the right inquiry to the right team.
- **Content Sections**:
  1. Hero — "Let's talk"
  2. Contact form — name, email, company, inquiry type, message
  3. Routing — Sales, Support, Partnerships, General
  4. Office info — location, timezone
  5. Response SLA — 24h for sales, 4h for support
  6. Alternative channels — email, phone
  7. CTA — Send Message
- **SEO**: Title: `Contact Perionyx — Sales, Support, Partnerships | Perionyx` | Description: `Sales inquiries, support questions, partnership opportunities, and general contact.` | Canonical: `https://perionyx.com/company/contact` | Keywords: `contact, sales inquiry, support, partnership`
- **CTA Primary**: Send Message | **CTA Secondary**: Book a Demo
- **Related Pages**: `/company`, `/company/partners`, `/company/legal`

### `/company/partners` — Partners

- **Purpose**: Show the partner ecosystem — integration, technology, and consulting partners.
- **Primary Audience**: All
- **Page Goal**: Potential partner understands the program and applies.
- **Content Sections**:
  1. Hero — "Better together"
  2. Partner types — integration, technology, consulting
  3. Partner benefits — co-marketing, technical support, revenue share
  4. Current partners — logo grid
  5. How to apply — process and requirements
  6. Case study — partner success story
  7. CTA — Become a Partner
- **SEO**: Title: `Partners — Integration, Technology, Consulting | Perionyx` | Description: `Integration partners, technology partners, and consulting partners. How to become a partner.` | Canonical: `https://perionyx.com/company/partners` | Keywords: `partners, integration partners, consulting partners`
- **CTA Primary**: Become a Partner | **CTA Secondary**: Contact Us
- **Related Pages**: `/company/contact`, `/platform/integrations`, `/research/customer-stories`

### `/company/legal` — Legal

- **Purpose**: Legal hub — terms, privacy, disclosure, and cookie policies.
- **Primary Audience**: All
- **Page Goal**: Visitor finds the legal document they need.
- **Content Sections**:
  1. Hero — "Legal information"
  2. Document links — Terms, Privacy, Responsible Disclosure, Cookies
  3. Last updated — per document
  4. Contact legal — for questions
  5. CTA — Read Documents
- **SEO**: Title: `Legal — Terms, Privacy, Responsible Disclosure | Perionyx` | Description: `Terms of service, privacy policy, responsible disclosure, and cookie policy.` | Canonical: `https://perionyx.com/company/legal` | Keywords: `legal, terms of service, privacy policy`
- **CTA Primary**: Read Documents | **CTA Secondary**: Contact Legal
- **Related Pages**: `/privacy`, `/terms`, `/responsible-disclosure`

---

## 9. Utility Pages

### `/changelog` — Changelog

- **Purpose**: Every release documented — what's new, changed, fixed, removed.
- **Primary Audience**: All
- **Page Goal**: User sees development velocity and finds recent changes.
- **Content Sections**:
  1. Hero — "Every release documented"
  2. Version entries — date, version, domain, changes (Added/Changed/Fixed/Removed)
  3. Filter — by domain (AP, Treasury, AI, etc.)
  4. Subscribe — release notifications
  5. CTA — View Roadmap
- **SEO**: Title: `Changelog — Every Release Documented | Perionyx` | Description: `What's new, what's changed, and what's fixed. Updated with every release.` | Canonical: `https://perionyx.com/changelog` | Keywords: `changelog, release notes, product updates`
- **CTA Primary**: View Roadmap | **CTA Secondary**: Book a Demo
- **Related Pages**: `/roadmap`, `/status`, `/product`

### `/roadmap` — Roadmap

- **Purpose**: Public roadmap — features in progress, coming soon, under consideration.
- **Primary Audience**: All
- **Page Goal**: Potential buyer sees active development and upcoming features.
- **Content Sections**:
  1. Hero — "Where we're headed"
  2. Kanban columns — In Progress, Coming Soon, Under Consideration
  3. Feature cards — title, description, domain, status
  4. Vote mechanism — upvote features
  5. Timeline — quarterly milestones
  6. CTA — Request a Feature
- **SEO**: Title: `Product Roadmap — What's Coming Next | Perionyx` | Description: `Public product roadmap. Features in progress, coming soon, and under consideration.` | Canonical: `https://perionyx.com/roadmap` | Keywords: `product roadmap, upcoming features, product timeline`
- **CTA Primary**: Request a Feature | **CTA Secondary**: Book a Demo
- **Related Pages**: `/changelog`, `/product`, `/ai/roadmap`

### `/status` — System Status

- **Purpose**: Real-time system health — uptime, incidents, maintenance.
- **Primary Audience**: All
- **Page Goal**: Existing customer confirms system is operational.
- **Content Sections**:
  1. Hero — "All systems operational" (or status)
  2. Service status — per-service health (API, Database, Queue, Cache)
  3. Uptime — 30/90/365 day uptime percentage
  4. Incident history — recent incidents with resolution
  5. Maintenance windows — scheduled maintenance
  6. Subscribe — status notifications
  7. CTA — Subscribe to Updates
- **SEO**: Title: `System Status — All Systems Operational | Perionyx` | Description: `Real-time system health, uptime metrics, incident history, and maintenance windows.` | Canonical: `https://perionyx.com/status` | Keywords: `system status, uptime, system health`
- **CTA Primary**: Subscribe to Updates | **CTA Secondary**: View Architecture
- **Related Pages**: `/platform/reliability`, `/platform/observability`, `/security`

### `/privacy` — Privacy Policy

- **Purpose**: Data collection, usage, storage, and sharing practices.
- **Primary Audience**: All
- **Page Goal**: Visitor confirms their data is handled responsibly.
- **Content Sections**:
  1. Hero — "How we protect your data"
  2. Data collection — what we collect and why
  3. Data usage — how we use it
  4. Data storage — where and how long
  5. Data sharing — with whom and why
  6. GDPR rights — data subject rights
  7. Contact — privacy questions
- **SEO**: Title: `Privacy Policy — How We Protect Your Data | Perionyx` | Description: `Data collection, usage, storage, and sharing practices. GDPR compliance and data subject rights.` | Canonical: `https://perionyx.com/privacy` | Keywords: `privacy policy, GDPR, data protection`
- **CTA Primary**: Contact Privacy Team | **CTA Secondary**: View Security
- **Related Pages**: `/security`, `/terms`, `/ai/privacy`

### `/terms` — Terms of Service

- **Purpose**: Platform usage terms, liability, data ownership, SLA.
- **Primary Audience**: All
- **Page Goal**: Prospective customer reviews legal terms before signing.
- **Content Sections**:
  1. Hero — "The agreement that governs use"
  2. Acceptance — terms agreement
  3. Usage terms — platform usage rules
  4. Data ownership — customer owns their data
  5. SLA — uptime commitments
  6. Liability — limitation and indemnification
  7. Termination — data export and deletion
- **SEO**: Title: `Terms of Service — Platform Usage Agreement | Perionyx` | Description: `Platform usage terms, liability, data ownership, SLA commitments, and dispute resolution.` | Canonical: `https://perionyx.com/terms` | Keywords: `terms of service, platform agreement, SLA`
- **CTA Primary**: Read Terms | **CTA Secondary**: View Privacy
- **Related Pages**: `/privacy`, `/company/legal`, `/security`

### `/responsible-disclosure` — Responsible Disclosure

- **Purpose**: How to report vulnerabilities — scope, rewards, and timeline.
- **Primary Audience**: Security Professional
- **Page Goal**: Security researcher knows how to report and what to expect.
- **Content Sections**:
  1. Hero — "Help us stay secure"
  2. Scope — what's in and out
  3. Reporting — how to submit a report
  4. Rewards — bounty program details
  5. Timeline — response and fix commitments
  6. Safe harbor — legal protection for researchers
  7. CTA — Report a Vulnerability
- **SEO**: Title: `Responsible Disclosure — Report a Vulnerability | Perionyx` | Description: `How to report vulnerabilities, scope, rewards, and timeline.` | Canonical: `https://perionyx.com/responsible-disclosure` | Keywords: `responsible disclosure, vulnerability reporting, bug bounty`
- **CTA Primary**: Report a Vulnerability | **CTA Secondary**: View Security
- **Related Pages**: `/security`, `/security/incident-response`, `/company/legal`
