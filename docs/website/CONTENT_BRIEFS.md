# Perionyx Public Website — Content Briefs

> **Phase**: 22.0A — Public Platform Architecture
> **Status**: Architecture (no code)
> **Last Updated**: 2026-07-22
> **Purpose**: Production-ready instruction sets for the 10 highest-priority pages

---

## 1. Home Page (`/`)

### Page Title and URL
- **URL**: `/`
- **Page Title**: Perionyx — Enterprise Finance Platform

### Target Audience
- **Primary**: CFO, Finance Director
- **Secondary**: Controller, Treasury Manager, Engineer (CTO evaluating)

### Page Goal
Visitor understands what Perionyx is, who it's for, and why it's different within 10 seconds. Leave with intent to explore Product or request a demo.

### Key Message
Perionyx is the finance platform built for precision — 392 API routes, 67 modules, 338 data models, purpose-built for CFOs, Controllers, and Treasury teams.

### Content Sections

1. **Hero** — One sentence value prop, primary CTA (Book a Demo), secondary CTA (See the Product)
2. **Trust bar** — Key metrics: 392 API routes, 67 modules, 338 data models, Decimal(38,12) precision
3. **Problem statement** — "Your finance stack is a patchwork" narrative: 3+ tools, manual handoffs, no single source of truth
4. **Solution overview** — 6 capability tiles: AP, Treasury, Approvals, Executive Intelligence, Compliance, AI
5. **Architecture callout** — "Built for precision" with Decimal(38,12) code snippet, banker's rounding example
6. **Social proof** — Design partner quote or metric: "47 finance leaders informed our product"
7. **Security strip** — 4 trust signals: AES-256-GCM, MFA, Tamper-Evident Audit, SOC 2 Ready
8. **Final CTA** — "See it in your environment" with Book a Demo

### Hero Copy
- **Headline**: The finance platform your team will actually use
- **Subheadline**: Purpose-built for CFOs, Controllers, and Treasury teams. 392 API routes. 67 modules. Financial precision without compromise.
- **Primary CTA**: Book a Demo
- **Secondary CTA**: See the Product →
- **Metric strip**: 392 API routes · 67 modules · 338 data models · Decimal(38,12) precision

### Key Metrics to Display
- 392 API routes (from AGENTS.md)
- 67 modules (from AGENTS.md)
- 338 Prisma models (from AGENTS.md)
- 443 tests, 15 categories (from AGENTS.md)
- 32ms median response time (from platform/performance)
- Decimal(38,12) precision (from financial-precision.ts)

### Social Proof Needed
- "Trusted by finance teams building for precision" + design partner logos (or "In development with finance leaders")
- If no logos yet: use metrics as social proof — "47 finance leaders shaped our product roadmap"

### SEO Target
- **Primary Keyword**: enterprise financial operating system
- **Title Tag**: `Perionyx — Enterprise Finance Platform | Precision Without Compromise`
- **Meta Description**: `Purpose-built for CFOs, Controllers, and Treasury teams. 392 API routes, 67 modules, 338 data models. Financial precision without compromise.`

### Internal Links
- `/product` (primary secondary CTA)
- `/platform/architecture` (architecture callout)
- `/security` (security strip)
- `/ai` (AI capability tile)
- `/engineering` (engineering credibility)

### Tone Notes
- Confident, minimal, one powerful sentence per section
- No buzzwords ("revolutionary," "best-in-class," "game-changing")
- Specific numbers, not adjectives
- Dual-audience: speaks to CFO AND engineer

---

## 2. Product Overview (`/product`)

### Page Title and URL
- **URL**: `/product`
- **Page Title**: Product Overview — 12 Integrated Finance Modules

### Target Audience
- **Primary**: CFO, Finance Director, Controller
- **Secondary**: Treasury Manager, Security Professional

### Page Goal
Visitor sees all 12 modules, understands integration, and clicks into the module relevant to their pain point.

### Key Message
One platform. Every finance workflow. 12 integrated modules replace your patchwork of tools.

### Content Sections

1. **Hero** — "One platform. Every finance workflow."
2. **Module grid** — 12 cards with icon, name, one-line value prop, link
3. **Integration diagram** — how modules connect (AP→GL, Treasury→Payments, Approvals→AP, AI→Everything)
4. **Persona paths** — "If you're a CFO..." / "If you're a Controller..." / "If you're a Treasurer..." quick links
5. **Metrics strip** — 392 APIs, 67 modules, 338 models
6. **Trust signals** — Decimal(38,12), tamper-evident audit, RBAC
7. **CTA** — Book a Demo

### Hero Copy
- **Headline**: One platform. Every finance workflow.
- **Subheadline**: 12 integrated modules — AP, AR, Treasury, Approvals, Risk, Compliance, Reconciliation, Audit, Executive Intelligence, GL, Cash Management, Reporting — replace your finance stack.
- **Primary CTA**: Book a Demo
- **Secondary CTA**: Explore a Module →

### Key Metrics to Display
- 12 integrated modules
- 392 API routes
- 67 modules
- 338 data models

### Social Proof Needed
- Module integration diagram showing real connections
- "Every module shares one ledger, one audit trail, one permission model"

### SEO Target
- **Primary Keyword**: enterprise finance platform modules
- **Title Tag**: `Product Overview — 12 Integrated Finance Modules | Perionyx`
- **Meta Description**: `See how 12 integrated modules replace your finance stack. AP, AR, Treasury, Approvals, Risk, Compliance, Reconciliation, Audit, Executive Intelligence, GL, Cash Management, Reporting.`

### Internal Links
- All 12 product sub-pages from the module grid
- `/platform/architecture` (how modules connect)
- `/security` (trust signals)

### Tone Notes
- Outcome-oriented, not feature-oriented
- Each module card answers: "What does this do for my team?"
- Persona paths help visitors self-select their journey

---

## 3. Accounts Payable (`/product/accounts-payable`)

### Page Title and URL
- **URL**: `/product/accounts-payable`
- **Page Title**: Accounts Payable Automation Software

### Target Audience
- **Primary**: Controller, CFO
- **Secondary**: Finance Manager, AP team lead

### Page Goal
Visitor understands the AP automation workflow and trusts it handles three-way matching, approvals, and payment execution.

### Key Message
Match PO, receipt, and invoice automatically — discrepancies caught before they reach your desk.

### Content Sections

1. **Hero** — "Accounts payable without the manual"
2. **Workflow diagram** — Invoice Receipt → Validation → Three-Way Match → Approval → Payment → GL Posting
3. **Key capabilities** — 8 cards: auto-matching, tolerance rules, duplicate detection, approval routing, payment scheduling, multi-currency, OCR, audit trail
4. **How it works** — 30-second summary + 5-minute deep dive (expandable)
5. **Integration points** — connects to Treasury, GL, Approval Matrix, Notifications
6. **Trust signals** — Decimal(38,12) precision, tamper-evident audit
7. **CTA** — Book a Demo

### Hero Copy
- **Headline**: Accounts payable without the manual
- **Subheadline**: Automate invoice receipt, three-way matching, approval routing, and payment execution. Match PO, receipt, and invoice automatically.
- **Primary CTA**: Book a Demo
- **Secondary CTA**: See Three-Way Matching in Action →

### Key Metrics to Display
- 3-way matching: PO + receipt + invoice
- Tolerance rules catch discrepancies automatically
- Duplicate detection prevents double payment
- Decimal(38,12) precision on every amount
- 5,716 seeded AP records (from Phase 21.0 inventory)

### Social Proof Needed
- "Built on 137 domain invariants across 8 categories" (from AP Domain Architecture)
- Workflow diagram showing the 14-stage procure-to-pay flow

### SEO Target
- **Primary Keyword**: accounts payable automation software
- **Title Tag**: `Accounts Payable Automation Software | Perionyx`
- **Meta Description**: `Automate invoice receipt, three-way matching, approval routing, and payment execution. Match PO, receipt, and invoice automatically.`

### Internal Links
- `/product/treasury` (payment execution)
- `/product/approvals` (approval routing)
- `/product/general-ledger` (GL posting)
- `/product/reconciliation` (vendor reconciliation)

### Tone Notes
- Workflow-focused: show the end-to-end process, not individual features
- Specific: "three-way matching" not "intelligent matching"
- Trust: show the domain invariants and precision guarantees

---

## 4. Platform Architecture (`/platform/architecture`)

### Page Title and URL
- **URL**: `/platform/architecture`
- **Page Title**: Architecture Overview — Domain-Driven Design

### Target Audience
- **Primary**: Engineer, Enterprise Architect
- **Secondary**: CTO, Security Professional

### Page Goal
Architect understands the design decisions, module boundaries, and why this architecture works for finance.

### Key Message
Modular domain-driven architecture with CQRS patterns, typed domain events, and Decimal(38,12) precision throughout. Every design decision has a reason.

### Content Sections

1. **Hero** — "Architecture built for financial precision"
2. **Architecture layers** — client → API (392 routes) → business logic (67 modules) → data layer (338 models)
3. **Domain-driven design** — bounded contexts, aggregate roots, value objects
4. **CQRS pattern** — commands vs queries, event bus (63 typed events in AP alone)
5. **Financial precision** — Decimal(38,12), banker's rounding via `Intl.NumberFormat` throughout
6. **Module responsibility matrix** — 67 modules with boundaries and ownership
7. **Architecture decision records** — link to engineering blog
8. **CTA** — Read the Engineering Blog

### Hero Copy
- **Headline**: Architecture built for financial precision
- **Subheadline**: Modular domain-driven architecture with CQRS patterns, typed domain events, and Decimal(33,12) precision throughout. Every design decision has a reason.
- **Primary CTA**: Read the Engineering Blog
- **Secondary CTA**: See Performance Numbers →

### Key Metrics to Display
- 392 API routes
- 67 modules
- 338 Prisma models
- 15 frozen architecture components (from Architecture Freeze v1.0)
- 63 typed domain events (AP alone)
- Decimal(38,12) precision

### Social Proof Needed
- Architecture diagram showing real component names
- "15 frozen components with change management policy" (from Architecture Freeze document)

### SEO Target
- **Primary Keyword**: enterprise architecture domain-driven design
- **Title Tag**: `Architecture Overview — Domain-Driven Design | Perionyx`
- **Meta Description**: `Modular domain-driven architecture with CQRS patterns, typed domain events, and Decimal(38,12) precision throughout.`

### Internal Links
- `/engineering/architecture` (ADR index)
- `/platform/performance` (how architecture enables speed)
- `/platform/security` (security architecture)
- `/platform/infrastructure` (cache, locks, queues)

### Tone Notes
- Technical depth with clear narrative
- Show real component names, not abstract bubbles
- Every architecture decision traces to a finance requirement

---

## 5. Security Overview (`/security`)

### Page Title and URL
- **URL**: `/security`
- **Page Title**: Security Overview — Enterprise Security

### Target Audience
- **Primary**: Security Professional, CFO
- **Secondary**: Controller, procurement team

### Page Goal
Security decision-maker trusts Perionyx handles security comprehensively — every layer, every control, verifiable.

### Key Message
Security built into the architecture, not bolted on. Authentication, authorization, encryption, audit trails, tenant isolation, and compliance — every layer documented.

### Content Sections

1. **Hero** — "Your data is protected at every layer"
2. **Security layer diagram** — visual: authentication → authorization → encryption → audit → isolation
3. **Key capabilities** — 6 cards: MFA (TOTP), RBAC (64 permissions), AES-256-GCM, Tamper-Evident Audit, Tenant Isolation, Compliance Roadmap
4. **Trust signals** — Zero Critical findings (Phase 17.2), SOC 2 ready, MFA with 10 recovery codes
5. **Compliance roadmap** — SOC 2 (52%), ISO 27001 (45%), PCI DSS (25%), GDPR (62%) — current status with timeline
6. **Deep-dive links** — 10 sub-pages for each security domain
7. **CTA** — Read the Full Security Docs

### Hero Copy
- **Headline**: Your data is protected at every layer
- **Subheadline**: Authentication, authorization, encryption, audit trails, tenant isolation, and compliance. Security built into the architecture, not bolted on.
- **Primary CTA**: Read the Full Security Docs
- **Secondary CTA**: View Compliance Roadmap →

### Key Metrics to Display
- Zero Critical findings (from Phase 17.2)
- AES-256-GCM encryption
- TOTP-based MFA with 10 recovery codes
- 64 permissions, 8 roles, 12 SoD rules
- Append-only audit records
- Row-level tenant isolation

### Social Proof Needed
- Compliance badge grid: SOC 2, ISO 27001, PCI DSS, GDPR (with current %)
- "Every API request is authenticated, authorized, and audited"

### SEO Target
- **Primary Keyword**: enterprise financial security
- **Title Tag**: `Security Overview — Enterprise Security | Perionyx`
- **Meta Description**: `Authentication, authorization, encryption, audit trails, tenant isolation, and compliance. Security built into the architecture, not bolted on.`

### Internal Links
- `/security/authentication` (MFA deep dive)
- `/security/authorization` (RBAC deep dive)
- `/security/encryption` (AES-256-GCM deep dive)
- `/security/audit-trail` (tamper-evident audit)
- `/security/compliance` (compliance roadmap)
- `/platform/security` (architecture-level security)

### Tone Notes
- Precise, specific, evidence-backed
- Every claim verifiable: "AES-256-GCM" not "industry-standard encryption"
- Dual-audience: technical summary for engineers, compliance summary for procurement

---

## 6. Compliance Roadmap (`/security/compliance`)

### Page Title and URL
- **URL**: `/security/compliance`
- **Page Title**: Compliance Roadmap — SOC 2, ISO 27001, PCI DSS, GDPR

### Target Audience
- **Primary**: Security Professional, CFO, Controller
- **Secondary**: Procurement team, auditor

### Page Goal
Compliance officer sees current status, gaps, and timeline. Trusts Perionyx is serious about compliance.

### Key Message
Current compliance posture with honest gap analysis and remediation timeline. SOC 2, ISO 27001, PCI DSS, GDPR — all documented publicly.

### Content Sections

1. **Hero** — "SOC 2, ISO 27001, PCI DSS, GDPR readiness"
2. **Compliance matrix** — 4 frameworks with current %, gap, timeline
3. **SOC 2 readiness** — controls implemented, controls remaining, timeline
4. **ISO 27001 readiness** — ISMS scope, controls, certification timeline
5. **PCI DSS readiness** — payment data handling, SAQ status
6. **GDPR readiness** — data subject rights, processing activities, DPO status
7. **Remediation timeline** — phases and milestones
8. **CTA** — Download Compliance Report

### Hero Copy
- **Headline**: SOC 2, ISO 27001, PCI DSS, GDPR readiness
- **Subheadline**: Current compliance posture, gap analysis, remediation timeline, and auditor-ready documentation. Transparency builds trust.
- **Primary CTA**: Download Compliance Report
- **Secondary CTA**: View Security Overview →

### Key Metrics to Display
- SOC 2: 52% ready (from compliance readiness assessment)
- ISO 27001: 45% ready
- PCI DSS: 25% ready
- GDPR: 62% ready
- Zero Critical security findings
- 23 audit findings resolved (Phase 17.2)

### Social Proof Needed
- Compliance badge grid with current percentages
- "Public compliance roadmap — updated quarterly"

### SEO Target
- **Primary Keyword**: SOC 2 PCI DSS GDPR compliance financial software
- **Title Tag**: `Compliance Roadmap — SOC 2, ISO 27001, PCI DSS, GDPR | Perionyx`
- **Meta Description**: `Current compliance posture, gap analysis, remediation timeline, and auditor-ready documentation.`

### Internal Links
- `/security` (security overview)
- `/product/compliance` (compliance automation product page)
- `/product/audit` (audit trail product page)

### Tone Notes
- Honest and specific: show real percentages, not "we're working on it"
- Timeline-driven: show phases and milestones
- Auditor-friendly: structured, verifiable, no marketing language

---

## 7. AI Capabilities (`/ai/capabilities`)

### Page Title and URL
- **URL**: `/ai/capabilities`
- **Page Title**: AI Capabilities — Decision Intelligence, Anomaly Detection

### Target Audience
- **Primary**: CFO, Treasury Manager
- **Secondary**: Controller, Engineer (evaluating AI architecture)

### Page Goal
Finance leader sees specific AI capabilities that solve their problems — with real examples and measurable outcomes.

### Key Message
What Perionyx AI can do today — decision intelligence, anomaly detection, cash forecasting, invoice coding, approval routing, and executive briefings. Each capability with real examples.

### Content Sections

1. **Hero** — "What Perionyx AI can do today"
2. **Capability cards** — 6 detailed use cases with before/after
3. **Decision intelligence** — approval routing suggestions with evidence: "The AI suggested this route because 87% of similar invoices followed the same path, confidence: high"
4. **Anomaly detection** — payment pattern flagging: "This payment is 3.2x the vendor's average, routed for review"
5. **Cash forecasting** — 13-week forecast with confidence intervals: "Based on 6 months of historical data, 95% confidence range: $2.1M–$2.4M"
6. **Invoice coding** — GL account suggestions with precedent: "Based on 23 similar invoices from this vendor, recommended: Account 5100 (Software Licenses)"
7. **Executive briefings** — morning briefing generation: "Today's briefing: 3 approvals pending, cash position $4.2M, 1 anomaly flagged"
8. **CTA** — Book a Demo

### Hero Copy
- **Headline**: What Perionyx AI can do today
- **Subheadline**: Decision intelligence, anomaly detection, cash forecasting, invoice coding, approval routing, and executive briefings. Each capability with real examples.
- **Primary CTA**: Book a Demo
- **Secondary CTA**: See Explainability →

### Key Metrics to Display
- 7 AI providers (OpenAI, Anthropic, Gemini, Azure OpenAI, Mistral, Grok, Cohere)
- 22 models across 7 providers
- Evidence-first: every recommendation shows reasoning
- Human-in-the-loop: approval required for high-impact decisions

### Social Proof Needed
- Real example of an AI recommendation with evidence panel
- "AI recommends, humans approve, audit logs record"

### SEO Target
- **Primary Keyword**: AI capabilities decision intelligence anomaly detection
- **Title Tag**: `AI Capabilities — Decision Intelligence, Anomaly Detection | Perionyx`
- **Meta Description**: `Decision intelligence, anomaly detection, cash forecasting, invoice coding, approval routing, and executive briefings.`

### Internal Links
- `/ai/explainability` (why AI suggested what it suggested)
- `/ai/governance` (AI guardrails)
- `/ai/providers` (multi-provider architecture)
- `/product/executive-intelligence` (executive dashboards)

### Tone Notes
- Transparent: show real examples, not marketing claims
- Specific: "87% confidence" not "high confidence"
- Honest about limitations: "AI recommends, humans approve"

---

## 8. AI Governance (`/ai/governance`)

### Page Title and URL
- **URL**: `/ai/governance`
- **Page Title**: AI Governance — Permission-Scoped, Human-Approved

### Target Audience
- **Primary**: Security Professional, CFO
- **Secondary**: Controller, compliance officer

### Page Goal
Enterprise buyer trusts AI has guardrails — permission-scoped actions, rate limiting, safety validation, and human approval for high-impact decisions.

### Key Message
AI with guardrails, not just guardrails for AI. Permission-scoped actions, rate limiting, safety validation, audit logging, and human-in-the-loop for every high-impact decision.

### Content Sections

1. **Hero** — "AI with guardrails, not just guardrails for AI"
2. **Permission model** — AI actions scoped to user permissions (64 permissions, 8 roles)
3. **Rate limiting** — per-user, per-tenant AI quotas
4. **Safety validation** — pre-execution checks, policy enforcement
5. **Audit logging** — every AI action logged with reasoning, confidence, and source
6. **Human-in-the-loop** — approval required for high-impact decisions (payments over threshold, policy changes)
7. **CTA** — Read the Architecture

### Hero Copy
- **Headline**: AI with guardrails, not just guardrails for AI
- **Subheadline**: Permission-scoped AI actions, rate limiting, safety validation, audit logging, and human-in-the-loop for high-impact decisions.
- **Primary CTA**: Read the Architecture
- **Secondary CTA**: View Privacy →

### Key Metrics to Display
- 64 permissions scoping AI actions
- 12 separation-of-duty rules enforced
- 100% of AI actions logged with reasoning
- Human approval required for payments above threshold

### Social Proof Needed
- Architecture diagram: User → Permission Check → AI Action → Audit Log → Human Approval
- "Every AI action is permission-scoped, rate-limited, and audit-logged"

### SEO Target
- **Primary Keyword**: enterprise AI governance
- **Title Tag**: `AI Governance — Permission-Scoped, Human-Approved | Perionyx`
- **Meta Description**: `Permission-scoped AI actions, rate limiting, safety validation, audit logging, and human-in-the-loop.`

### Internal Links
- `/ai` (AI overview)
- `/ai/privacy` (data privacy)
- `/ai/explainability` (reasoning transparency)
- `/security/authorization` (RBAC model)

### Tone Notes
- Precise and specific: every guardrail described with its mechanism
- Trust-building: "human-in-the-loop" is the key message
- Enterprise: "permission-scoped" not "role-aware"

---

## 9. Engineering Architecture (`/engineering/architecture`)

### Page Title and URL
- **URL**: `/engineering/architecture`
- **Page Title**: Architecture Decision Records — The Why Behind Every Choice

### Target Audience
- **Primary**: Engineer
- **Secondary**: CTO, technical lead evaluating the platform

### Page Goal
Developer understands the why behind every architectural choice. Trusts the engineering rigor.

### Key Message
Every decision has a record. 15 frozen components, change management policy, and architecture decision records documenting the rationale behind every major technical choice.

### Content Sections

1. **Hero** — "Every decision has a record"
2. **ADR index** — 15 frozen components (from Architecture Freeze v1.0)
3. **Key decisions** — Decimal precision, CQRS, event bus, in-memory stores, condition evaluator
4. **Decision template** — context, decision, consequences, status
5. **Architecture freeze** — v1.0 components, change process
6. **Consolidation history** — Phase 18.0: 64 modules inventoried, duplicates resolved
7. **CTA** — Read the Full Architecture

### Hero Copy
- **Headline**: Every decision has a record
- **Subheadline**: Architecture decision records documenting the why behind every major technical choice. 15 frozen components, change management policy.
- **Primary CTA**: Read the Full Architecture
- **Secondary CTA**: See Performance →

### Key Metrics to Display
- 15 frozen architecture components
- 64 modules inventoried (Phase 18.0)
- 16 consolidation actions (Phase 18.1A)
- 7 event buses consolidated to 2
- 2 queue systems consolidated to 1

### Social Proof Needed
- Real ADR examples with context/decision/consequences
- "Architecture Freeze v1.0 — change management policy enforced"

### SEO Target
- **Primary Keyword**: architecture decisions ADR technical decisions
- **Title Tag**: `Architecture Decision Records — The Why Behind Every Choice | Perionyx`
- **Meta Description**: `Architecture decision records documenting the why behind every major technical choice. 15 frozen components, change management policy.`

### Internal Links
- `/platform/architecture` (architecture overview)
- `/engineering/performance` (performance engineering)
- `/engineering/testing` (testing strategy)

### Tone Notes
- Thoughtful, technical, narrative-driven
- Show real decisions with real trade-offs
- Every ADR connects to a finance requirement

---

## 10. Company About (`/company`)

### Page Title and URL
- **URL**: `/company`
- **Page Title**: About Perionyx — The Finance Platform Built by Finance People

### Target Audience
- **Primary**: All (CFOs, engineers, candidates, partners, press)
- **Secondary**: Investors, analysts

### Page Goal
Visitor feels connected to the mission and trusts the team. Understands why Perionyx exists.

### Key Message
We're building the finance platform we'd want to use. Founded by finance people and engineers. Building for CFOs, Controllers, and Treasury teams who demand precision without compromise.

### Content Sections

1. **Hero** — "We're building the finance platform we'd want to use"
2. **Mission statement** — one paragraph: finance platforms should earn trust, not demand it
3. **Founding story** — why this, why now: patchwork of tools, manual handoffs, no single source of truth
4. **Team preview** — 3-4 key people with photos, roles, backgrounds
5. **Values** — 3-4 core values: precision, transparency, enterprise-first, human-centered
6. **Metrics** — team size, Brain lessons (79), principles (13), rules (10), phases completed (20+)
7. **CTA** — Meet the Team

### Hero Copy
- **Headline**: We're building the finance platform we'd want to use
- **Subheadline**: Founded by finance people and engineers. Building for CFOs, Controllers, and Treasury teams who demand precision without compromise.
- **Primary CTA**: Meet the Team
- **Secondary CTA**: See Our Mission →

### Key Metrics to Display
- 79 Brain lessons
- 13 principles
- 10 rules
- 20+ engineering phases completed
- 392 API routes, 67 modules, 338 data models
- 443 tests, 15 categories

### Social Proof Needed
- Team photos with roles and backgrounds
- "Built by people who've sat in the seats we're building for"

### SEO Target
- **Primary Keyword**: about Perionyx finance platform company
- **Title Tag**: `About Perionyx — The Finance Platform Built by Finance People | Perionyx`
- **Meta Description**: `Founded by finance people and engineers. Building for CFOs, Controllers, and Treasury teams who demand precision without compromise.`

### Internal Links
- `/company/mission` (mission deep dive)
- `/company/team` (full team)
- `/company/careers` (join us)
- `/product` (what we're building)

### Tone Notes
- Human and authentic: "we'd want to use" not "we're disrupting"
- Specific: 79 lessons, 13 principles — real numbers
- Enterprise but not stiff: confident without arrogance
- Founding story should explain the WHY, not just the WHAT

---

## Appendix: Brief Usage Guide

### For Writers
1. Read the brief completely before writing
2. Follow the content sections in order
3. Use the hero copy as a starting point — iterate, don't copy verbatim
4. Every claim must be verifiable or labeled as representative
5. Follow the tone notes for page-specific voice
6. Reference the Brain source document for accuracy

### For Designers
1. Use the key metrics to design metric cards
2. Follow the internal links to design navigation flow
3. Use the content sections to plan page layout
4. The hero copy informs the hero section design
5. Social proof section informs trust signal placement

### For Reviewers
1. Check all metrics against Brain source documents
2. Verify all internal links resolve
3. Confirm SEO metadata matches target keywords
4. Validate accessibility (contrast, labels, keyboard)
5. Test on mobile (all pages must be responsive)

---

*Last updated: 2026-07-22*
