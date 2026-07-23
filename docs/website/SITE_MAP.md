# Perionyx Public Website — Site Map

> **Phase**: 22.0A — Public Platform Architecture
> **Status**: Architecture (no code)
> **Last Updated**: 2026-07-22
> **Total Pages**: 97 (including utility/legal)

---

## 1. URL Inventory

Every public URL with metadata. Audience abbreviations: CFO (Chief Financial Officer), FD (Finance Director), CTRL (Controller), TRES (Treasury Manager), FP&A (Financial Planning & Analysis), ENG (Engineer), SEC (Security Professional), ALL (All audiences).

### 1.1 Home

| URL | Title | H1 | Meta Description | Audience | Content Type | Last Updated |
|---|---|---|---|---|---|---|
| `/` | Perionyx — Enterprise Finance Platform | The finance platform your team will actually use | Purpose-built for CFOs, Controllers, and Treasury teams. 392 API routes, 67 modules, 338 data models. Financial precision without compromise. | ALL | Landing page | 2026-07-22 |

### 1.2 Product (12 sub-pages)

| URL | Title | H1 | Meta Description | Audience | Content Type | Last Updated |
|---|---|---|---|---|---|---|
| `/product` | Product Overview | One platform. Every finance workflow. | See how 12 integrated modules — AP, AR, Treasury, Approvals, Risk, Compliance, Reconciliation, Audit, Executive Intelligence, GL, Cash Management, Reporting — replace your finance stack. | CFO, FD, CTRL | Hub page | 2026-07-22 |
| `/product/accounts-payable` | Accounts Payable Automation | Accounts payable without the manual | Automate invoice receipt, three-way matching, approval routing, and payment execution. Match PO, receipt, and invoice automatically — discrepancies caught before they reach your desk. | CFO, CTRL | Product page | 2026-07-22 |
| `/product/accounts-receivable` | Accounts Receivable Management | Collections that work while you sleep | Automate invoice generation, payment tracking, dunning workflows, and cash application. See exactly who owes what and when. | CFO, FD | Product page | 2026-07-22 |
| `/product/treasury` | Treasury Management | Real-time cash visibility across every bank | Multi-bank connectivity, cash positioning, forecasting, and payment orchestration. Know your exact cash position at any moment. | TRES, CFO | Product page | 2026-07-22 |
| `/product/approvals` | Enterprise Approval Workflows | Approvals that move at the speed of your business | Multi-level, role-based approval chains with delegation, escalation, and audit trails. From purchase orders to wire transfers. | CTRL, FD | Product page | 2026-07-22 |
| `/product/risk` | Financial Risk Management | See risk before it becomes loss | Real-time risk scoring, exposure monitoring, counterparty analysis, and policy-driven alerts. Risk visibility your board will trust. | CFO, CTRL | Product page | 2026-07-22 |
| `/product/compliance` | Compliance Automation | Compliance that runs itself | Policy enforcement, regulatory reporting, audit-ready documentation, and automated controls testing. Never scramble for an audit again. | CTRL, SEC | Product page | 2026-07-22 |
| `/product/reconciliation` | Enterprise Reconciliation | Reconciliation at scale, not at scale of effort | Auto-match transactions across banks, ERPs, and sub-ledgers. Tolerance rules, exception queues, and full audit trails. | CTRL, TRES | Product page | 2026-07-22 |
| `/product/audit` | Audit Trail & Governance | Every action logged. Every change traceable. | Tamper-evident audit records, change tracking, access logs, and compliance evidence. Built for the auditor who asks hard questions. | CTRL, SEC | Product page | 2026-07-22 |
| `/product/executive-intelligence` | Executive Intelligence | Financial intelligence your board will trust | Real-time KPIs, variance analysis, trend detection, and AI-powered insights. Morning briefings without the spreadsheet dance. | CFO, FP&A | Product page | 2026-07-22 |
| `/product/general-ledger` | Enterprise General Ledger | The ledger your auditors will thank you for | Double-entry GL with Decimal(38,12) precision, journal entries, allocations, and period close management. No phantom cents. | CTRL, CFO | Product page | 2026-07-22 |
| `/product/cash-management` | Cash Management | Cash flow you can see, forecast, and control | Real-time cash positions, multi-currency management, liquidity forecasting, and automated cash sweeps. | TRES, CFO | Product page | 2026-07-22 |

### 1.3 Platform (12 sub-pages)

| URL | Title | H1 | Meta Description | Audience | Content Type | Last Updated |
|---|---|---|---|---|---|---|
| `/platform` | Platform Overview | Built for finance. Engineered for trust. | Next.js 16, 392 API routes, 67 modules, 338 data models, PostgreSQL, Redis. See the architecture behind an enterprise finance platform. | ENG, SEC | Hub page | 2026-07-22 |
| `/platform/architecture` | Architecture Overview | Architecture built for financial precision | Modular domain-driven architecture with CQRS patterns, typed domain events, and Decimal(38,12) precision throughout. Every design decision has a reason. | ENG, SEC | Platform page | 2026-07-22 |
| `/platform/performance` | Performance Engineering | 32ms median response time. Here's how. | CDN strategy, cache tiers (5s–600s TTL), database indexing (79+ indexes), query optimization, and parallelization across 9 independent DB queries. | ENG, CFO | Platform page | 2026-07-22 |
| `/platform/reliability` | Reliability & HA | 99.9% uptime with graceful degradation | Circuit breakers, auto-reconnect, connection draining, health/readiness/liveness probes, and graceful shutdown. PostgreSQL + Redis with automatic failover. | ENG, SEC | Platform page | 2026-07-22 |
| `/platform/integrations` | Integration Layer | Connect everything your finance team uses | 10 integration points: GL, Treasury, Approvals, Notifications, Budget, AI, Audit, ERP, Banking, Reporting. REST APIs with idempotency and webhook support. | ENG, CFO | Platform page | 2026-07-22 |
| `/platform/connectors` | Connector Platform | Plug into 50+ financial systems | Bank connectors, ERP integrations (SAP, Oracle, NetSuite), accounting software, CSV import. Health checks, sync metrics, and retry logic built in. | ENG, TRES | Platform page | 2026-07-22 |
| `/platform/api` | API Documentation | 392 REST endpoints. Fully documented. | RESTful API with consistent error contracts, Zod validation, idempotency keys, correlation IDs, and pagination. Every endpoint authenticated and audited. | ENG | Platform page | 2026-07-22 |
| `/platform/developer` | Developer Experience | Everything you need to build on Perionyx | TypeScript SDK, API reference, webhook guides, testing utilities, and development environment setup. | ENG | Platform page | 2026-07-22 |
| `/platform/deployment` | Deployment & Infrastructure | Ship with confidence | Docker multi-stage builds, Kubernetes manifests, CI/CD pipelines, blue-green deployments, and rollback procedures. | ENG, SEC | Platform page | 2026-07-22 |
| `/platform/infrastructure` | Infrastructure Architecture | From cache to queues, built for scale | Redis cache (tiered TTL), distributed locks, PgBoss queues, Prometheus metrics, OpenTelemetry tracing, structured logging. | ENG | Platform page | 2026-07-22 |
| `/platform/observability` | Observability & Monitoring | See everything. Miss nothing. | 8 metric domains, Prometheus exporter, structured JSON logging, health checks, alerting, and audit trails. Every request traced. | ENG, SEC | Platform page | 2026-07-22 |
| `/platform/security` | Security Architecture | Security is not a feature. It's the foundation. | RBAC + ABAC, AES-256-GCM encryption, MFA (TOTP), CSRF protection, rate limiting, dependency scanning, and tamper-evident audit. | SEC, ENG | Platform page | 2026-07-22 |

### 1.4 Security (11 sub-pages)

| URL | Title | H1 | Meta Description | Audience | Content Type | Last Updated |
|---|---|---|---|---|---|---|
| `/security` | Security Overview | Your data is protected at every layer | Authentication, authorization, encryption, audit trails, tenant isolation, and compliance. Security built into the architecture, not bolted on. | SEC, CFO | Hub page | 2026-07-22 |
| `/security/authentication` | Authentication & MFA | Multi-factor authentication, zero trust | TOTP-based MFA with 10 recovery codes, timing-safe comparison, session management with 30s revocation cache. Every login audited. | SEC | Security page | 2026-07-22 |
| `/security/authorization` | Access Control (RBAC + ABAC) | Role-based access with fine-grained control | 64 permissions, 8 roles, 12 separation-of-duty rules, MFA-flagged sensitive operations. Authorization at the endpoint, not the handler. | SEC, CTRL | Security page | 2026-07-22 |
| `/security/encryption` | Data Encryption | AES-256-GCM. Key rotation. No shortcuts. | All sensitive data encrypted at rest and in transit. Automatic key rotation, cryptographic key management, and encrypted backup. | SEC | Security page | 2026-07-22 |
| `/security/audit-trail` | Tamper-Evident Audit | Every action logged. Nothing deleted. | Append-only audit records with cryptographic verification. Change tracking, access logs, and compliance evidence export. | SEC, CTRL | Security page | 2026-07-22 |
| `/security/multi-tenancy` | Tenant Isolation | Your data never touches another tenant's | Row-level tenant isolation, query scoping, cache namespacing, and cross-tenant access blocked at every layer. | SEC, CFO | Security page | 2026-07-22 |
| `/security/api-security` | API Security | Every endpoint authenticated, authorized, audited | Rate limiting, CSRF protection, input validation (Zod), dependency scanning, webhook SSRF protection, and request body size limits. | SEC, ENG | Security page | 2026-07-22 |
| `/security/infrastructure` | Infrastructure Security | Hardened from the network up | Kubernetes network policies, encrypted secrets, Docker image scanning, HSTS, CSP headers, and DNS egress restrictions. | SEC | Security page | 2026-07-22 |
| `/security/compliance` | Compliance Roadmap | SOC 2, ISO 27001, PCI DSS, GDPR readiness | Current compliance posture, gap analysis, remediation timeline, and auditor-ready documentation. | SEC, CFO, CTRL | Security page | 2026-07-22 |
| `/security/dependency-scanning` | Dependency Security | Automated vulnerability detection | pnpm audit, CI-integrated dependency scanning, automated alerts, and patch management. High-severity findings block deploys. | SEC, ENG | Security page | 2026-07-22 |
| `/security/incident-response` | Incident Response | When something goes wrong, here's our plan | Response procedures, communication templates, forensic capabilities, and post-incident review process. | SEC, CFO | Security page | 2026-07-22 |

### 1.5 AI (9 sub-pages)

| URL | Title | H1 | Meta Description | Audience | Content Type | Last Updated |
|---|---|---|---|---|---|---|
| `/ai` | AI for Finance | AI that explains itself. Humans that stay in control. | Evidence-first AI with confidence scores, source tracking, and human approval for every recommendation. Built for finance, not gimmicks. | CFO, CTRL | Hub page | 2026-07-22 |
| `/ai/capabilities` | AI Capabilities | What Perionyx AI can do today | Decision intelligence, anomaly detection, cash forecasting, invoice coding, approval routing, and executive briefings. Each capability with real examples. | CFO, TRES | AI page | 2026-07-22 |
| `/ai/providers` | AI Provider Architecture | Multiple providers. Zero lock-in. | OpenAI, Anthropic, Gemini, Azure OpenAI, Mistral, Grok, Cohere. Provider health monitoring, automatic failover, and cost optimization. | ENG, CFO | AI page | 2026-07-22 |
| `/ai/models` | AI Models & Selection | The right model for the right task | 22 models across 7 providers. Selection criteria: accuracy, latency, cost, and task suitability. Model registry with versioning. | ENG | AI page | 2026-07-22 |
| `/ai/governance` | AI Governance | AI with guardrails, not just guardrails for AI | Permission-scoped AI actions, rate limiting, safety validation, audit logging, and human-in-the-loop for high-impact decisions. | SEC, CFO | AI page | 2026-07-22 |
| `/ai/privacy` | AI & Privacy | Your data stays yours | No training on customer data, data residency controls, PII detection and redaction, and provider privacy guarantees. | SEC, CFO | AI page | 2026-07-22 |
| `/ai/explainability` | AI Explainability | Why the AI suggested what it suggested | Every recommendation shows: precedent decisions, confidence level, policy applied, and who to ask if you disagree. | CFO, CTRL | AI page | 2026-07-22 |
| `/ai/benchmarks` | AI Benchmarks | Measured performance, not marketing claims | Accuracy metrics, response times, cost per query, and comparison with manual processes. All numbers verifiable. | CFO, ENG | AI page | 2026-07-22 |
| `/ai/roadmap` | AI Roadmap | What's next in AI for finance | Upcoming capabilities, research directions, and community requests. Public and updated monthly. | CFO, ENG | AI page | 2026-07-22 |

### 1.6 Engineering (8 sub-pages)

| URL | Title | H1 | Meta Description | Audience | Content Type | Last Updated |
|---|---|---|---|---|---|---|
| `/engineering` | Engineering Blog | How we build Perionyx | Deep dives into financial precision, workflow architecture, security engineering, and AI integration. Technical essays from the engineering team. | ENG | Blog index | 2026-07-22 |
| `/engineering/architecture` | Architecture Decisions | Every decision has a record | Architecture decision records (ADRs) documenting the why behind every major technical choice. 15 frozen components, change management policy. | ENG | Engineering page | 2026-07-22 |
| `/engineering/performance` | Performance Engineering | From 900ms to 32ms | Database optimization (18 indexes, 5 N+1 eliminations), API optimization (31 files changed), cache strategy, and parallelization. | ENG | Engineering page | 2026-07-22 |
| `/engineering/testing` | Testing Strategy | 443 tests. 15 categories. Zero flakiness. | Unit, integration, repository, service, API, component, infrastructure, smoke, regression, golden snapshot, contract, E2E, benchmark, load, stress, chaos. | ENG | Engineering page | 2026-07-22 |
| `/engineering/infrastructure` | Infrastructure Engineering | Cache, locks, queues, observability | Redis cache with tiered TTL, distributed locks with hierarchical locking, PgBoss queues, Prometheus metrics, and OpenTelemetry tracing. | ENG | Engineering page | 2026-07-22 |
| `/engineering/open-source` | Open Source | Building in public | Our approach to open source: what we publish, why we publish it, and how to use it. Licensing, contribution, and governance. | ENG | Engineering page | 2026-07-22 |
| `/engineering/contribute` | Contribute | Help us build the finance platform | Development setup, coding standards, PR process, testing requirements, and architectural guidelines for contributors. | ENG | Engineering page | 2026-07-22 |
| `/engineering/blog` | Blog | Latest from the engineering team | Technical deep dives, product announcements, and industry commentary. Essay-style, 800–2,500 words. | ENG, ALL | Blog listing | 2026-07-22 |

### 1.7 Research (4 sub-pages)

| URL | Title | H1 | Meta Description | Audience | Content Type | Last Updated |
|---|---|---|---|---|---|---|
| `/research` | Research | What we've learned from finance teams | Customer discovery insights, market analysis, and enterprise finance research. Findings from real conversations, not thought leadership. | CFO, FD, ENG | Hub page | 2026-07-22 |
| `/research/insights` | Research Insights | Data-driven insights from the field | Analysis of enterprise finance workflows, pain points, and adoption patterns. Based on 47+ finance leader conversations. | CFO, FP&A | Research page | 2026-07-22 |
| `/research/customer-stories` | Customer Stories | How finance teams use Perionyx | Case studies and testimonials from design partners and early customers. Real workflows, real outcomes. | CFO, FD | Research page | 2026-07-22 |
| `/research/market` | Market Analysis | The enterprise finance software landscape | Market sizing, competitive landscape, and technology trends in enterprise financial management. | CFO, ENG | Research page | 2026-07-22 |

### 1.8 Company (8 sub-pages)

| URL | Title | H1 | Meta Description | Audience | Content Type | Last Updated |
|---|---|---|---|---|---|---|
| `/company` | About Perionyx | We're building the finance platform we'd want to use | Founded by finance people and engineers. Building for CFOs, Controllers, and Treasury teams who demand precision without compromise. | ALL | Company page | 2026-07-22 |
| `/company/mission` | Our Mission | Finance platforms should earn trust, not demand it | We believe enterprise finance software should be precise, transparent, and auditable by default. Not configurable to be safe — safe from the first line of code. | ALL | Company page | 2026-07-22 |
| `/company/team` | Team | The people building Perionyx | Engineering, product, design, and finance domain experts. Our backgrounds, our values, and why we're building this. | ALL | Company page | 2026-07-22 |
| `/company/careers` | Careers | Build the finance platform of the future | Open roles across engineering, product, design, and finance. What we value, how we work, and what you'll build. | ALL | Careers page | 2026-07-22 |
| `/company/press` | Press & Media | Perionyx in the news | Press releases, media coverage, and brand assets. Logos, screenshots, and press contacts. | ALL | Company page | 2026-07-22 |
| `/company/contact` | Contact | Let's talk | Sales inquiries, support questions, partnership opportunities, and general contact. Form with routing. | ALL | Contact page | 2026-07-22 |
| `/company/partners` | Partners | Better together | Integration partners, technology partners, and consulting partners. How to become a partner. | ALL | Company page | 2026-07-22 |
| `/company/legal` | Legal | Legal information | Terms of service, privacy policy, responsible disclosure, and cookie policy. | ALL | Legal page | 2026-07-22 |

### 1.9 Utility Pages

| URL | Title | H1 | Meta Description | Audience | Content Type | Last Updated |
|---|---|---|---|---|---|---|
| `/changelog` | Changelog | Every release documented | What's new, what's changed, and what's fixed. Updated with every release. Transparency builds trust. | ALL | Changelog | 2026-07-22 |
| `/roadmap` | Roadmap | Where we're headed | Public product roadmap. Features in progress, coming soon, and under consideration. Request features and vote. | ALL | Roadmap | 2026-07-22 |
| `/status` | System Status | All systems operational | Real-time system health, uptime metrics, incident history, and maintenance windows. Powered by automated monitoring. | ALL | Status page | 2026-07-22 |
| `/privacy` | Privacy Policy | How we protect your data | Data collection, usage, storage, and sharing practices. GDPR compliance and data subject rights. | ALL | Legal | 2026-07-22 |
| `/terms` | Terms of Service | The agreement that governs use | Platform usage terms, liability, data ownership, SLA commitments, and dispute resolution. | ALL | Legal | 2026-07-22 |
| `/responsible-disclosure` | Responsible Disclosure | Help us stay secure | How to report vulnerabilities, scope, rewards, and timeline. Our commitment to security researchers. | SEC | Legal | 2026-07-22 |

---

## 2. URL Architecture

### 2.1 Patterns

| Pattern | Example | Depth | Crawlable |
|---|---|---|---|
| `/` | Home | 0 | Yes |
| `/{section}` | `/product` | 1 | Yes |
| `/{section}/{topic}` | `/product/treasury` | 2 | Yes |
| `/{section}/{topic}/{slug}` | `/engineering/blog/{slug}` | 3 | Yes |

### 2.2 Canonical URLs

All canonical URLs use trailing-slash-free format. `robots.txt` allows all public paths. Sitemap generated at build time from this document.

### 2.3 Redirects

| From | To | Type |
|---|---|---|
| `/accounts-payable` | `/product/accounts-payable` | 301 |
| `/treasury` | `/product/treasury` | 301 |
| `/docs` | `/platform/api` | 301 |
| `/blog` | `/engineering/blog` | 301 |
| `/about` | `/company` | 301 |
| `/careers` | `/company/careers` | 301 |
| `/contact` | `/company/contact` | 301 |
| `/legal` | `/company/legal` | 301 |

---

## 3. Page Count Summary

| Section | Sub-pages | Total |
|---|---|---|
| Home | 0 | 1 |
| Product | 12 | 12 |
| Platform | 12 | 12 |
| Security | 11 | 11 |
| AI | 9 | 9 |
| Engineering | 8 | 8 |
| Research | 4 | 4 |
| Company | 8 | 8 |
| Utility | 6 | 6 |
| Blog (dynamic) | 0+ | 0+ |
| **Total (static)** | | **71** |
| **Total (with utility)** | | **77** |
| **Total (with blog slugs)** | | **77+** |
