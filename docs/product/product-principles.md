# Product Principles

**Phase:** 8E.4
**Last Updated:** July 8, 2026

---

## Purpose

These 10 product principles govern every product decision at Perionyx. They are the lens through which every feature, trade-off, and priority is evaluated. Principles are ordered by priority — when two principles conflict, the higher-ranked principle prevails.

*Reference: `docs/PRODUCT_CONSTITUTION.md`, `docs/product/product-strategy.md`*

---

## Principle 1: Enterprise First

Every product decision serves the needs of CFOs, Treasurers, Controllers, Finance Managers, and Auditors — not consumer SaaS aesthetics or consumer trends.

### What This Means

- Clarity, confidence, and speed always trump visual flourish
- Data density is a feature, not a bug
- Every screen answers exactly one question
- Keyboard navigation is a requirement, not a nice-to-have
- Enterprise procurement requirements (SOC 2, audit trails, RBAC) are never optional

### Trade-Offs

- Consumer-grade onboarding simplicity may be sacrificed for enterprise-grade control
- Visual animations are restrained to avoid distracting from data
- Feature count may be lower than consumer tools, but depth is greater

*Reference: `AGENTS.md` — Engineering Constitution, UI Decision Mandate*

---

## Principle 2: AI Native

AI is not a feature — it is the fabric of the platform. Every workflow, every screen, every data point should be AI-accessible and AI-enhanced.

### What This Means

- Every data view should have an "Ask AI" entry point
- AI responses are persona-aware, grounded in platform data, and source-cited
- Confidence scores accompany every AI output
- AI may recommend but never autonomously execute financial actions
- Multi-provider AI ensures no vendor lock-in

### Trade-Offs

- AI-first features may ship before traditional manual equivalents
- Infrastructure cost is higher due to multi-provider support
- AI latency adds to page load budgets

*Reference: `docs/PRODUCT_CONSTITUTION.md §6`, `docs/ai/context-aware-enterprise-assistant.md`*

---

## Principle 3: Workflow Before Features

Build for the workflow, not the feature. A feature that fits into a natural workflow is worth more than a feature that requires workflow adaptation.

### What This Means

- Every feature must map to at least one documented enterprise workflow
- Workflow efficiency (clicks, time, cognitive load) is a primary success metric
- Cross-domain workflows (e.g., month-end close) take priority over single-domain features
- Features that reduce workflow steps are prioritized over features that add capabilities

### Trade-Offs

- May ship fewer standalone features in favor of integrated workflow improvements
- Workflow mapping adds upfront research time
- Some customers may request features that don't fit workflows — these are deprioritized

*Reference: `docs/workflows/README.md`, `docs/product/workflow-validation.md`*

---

## Principle 4: Executive Simplicity

The CFO should understand the platform in 30 seconds. Complexity is layered — never exposed at the top level.

### What This Means

- Default views show the most important information with zero configuration
- Progressive disclosure: core fields always visible, optional fields labeled, advanced settings hidden
- Dashboard answers one question: "Where is my money and is it safe?"
- Every interaction has a single primary action; secondary actions are accessible but hidden
- Error messages explain how to fix, not just what's wrong

### Trade-Offs

- Power users may need extra clicks to access advanced features
- Configuration options are fewer by default
- Some edge-case functionality may be omitted for clarity

*Reference: `AGENTS.md` — Engineering Constitution, Design Principles*

---

## Principle 5: Evidence Driven

No feature is built without documented evidence. Every roadmap decision must reference customer interviews, pain point analysis, or workflow intelligence.

### What This Means

- Every feature proposal must cite specific customer evidence
- Features backed by T1 (direct) evidence are prioritized over T3 (strategic)
- Evidence gaps are explicitly tracked and addressed in quarterly reviews
- Post-ship validation is required — did the feature resolve the documented pain point?
- Decisions without evidence are flagged and deprioritized

### Trade-Offs

- Fast-moving competitive threats may require strategic bets without full evidence
- Internal platform improvements may have no direct customer evidence
- Evidence collection takes time — this slows the proposal process

*Reference: `docs/product/roadmap-governance.md`, `docs/customer-discovery/validation-framework.md`*

---

## Principle 6: Security by Design

Security is not a layer — it is a property of every component, every API, every data flow.

### What This Means

- Every API endpoint has authentication, authorization, and tenant isolation
- All financial state changes are recorded in an immutable audit trail
- Input validation (Zod) is mandatory on every API route
- Rate limiting is applied to all auth, mutation, and public endpoints
- Secrets never appear in code, logs, or client bundles
- Granular permissions exist for every action that mutates or exposes data

### Trade-Offs

- Development velocity is slower due to mandatory security review
- API responses include more overhead (audit records, permission checks)
- Some features require more engineering effort to implement securely

*Reference: `docs/PRODUCT_CONSTITUTION.md §5`, `AGENTS.md` — Security Review*

---

## Principle 7: Localization First

The platform is built for global enterprise from day one — not retrofitted for international markets.

### What This Means

- All user-facing strings pass through the i18n system (no hardcoded English)
- RTL layout support is built into the design system, not patched on
- Multi-currency, multi-locale, and multi-fiscal-period are core platform capabilities
- Arabic market support is a design requirement, not a future initiative
- Date, number, and currency formatting are locale-aware at the component level

### Trade-Offs

- Localization adoption (0.4%) is currently a major gap requiring dedicated sprints
- RTL utilities exist but are not yet consumed by production components
- Every UI component incurs the overhead of translation key management

*Reference: `docs/i18n/localization-strategy.md`, `docs/certification/final-enterprise-certification.md`*

---

## Principle 8: Multi-Tenant by Default

Every feature, every data model, every query assumes multi-tenant isolation. There is no single-tenant mode — the platform is born multi-tenant.

### What This Means

- Every database model includes a `companyId` foreign key
- All queries filter by tenant context
- Cross-tenant access is a security incident
- Entity consolidation (group-level views) is an explicit feature, not an accidental byproduct
- Tenant isolation is enforced at the database, API, and UI layers

### Trade-Offs

- Simple single-tenant deployments are not supported
- Multi-tenant joins add query complexity
- Consolidation features require explicit design for cross-tenant data access

*Reference: `docs/PRODUCT_CONSTITUTION.md §3.4`, `docs/architecture/multi-tenant-architecture.md`*

---

## Principle 9: Automation Over Manual Work

If a task can be automated or intelligently suggested, the platform should do it — reducing manual effort while keeping humans in control of decisions.

### What This Means

- Reconciliation should match and suggest, not just display
- Approvals should route automatically based on policies
- Reports should generate on schedule, not on request
- Anomalies should be flagged automatically, not discovered in audits
- The platform should remember user preferences and reduce repetitive configuration

### Trade-Offs

- Automation confidence varies — low-confidence suggestions may be ignored
- Over-automation can erode trust if suggestions are wrong
- Building automation requires upfront investment before manual workflows are complete

*Reference: `docs/workflows/workflow-intelligence-overview.md`*

---

## Principle 10: Build for Ten Years

Every architectural and product decision assumes the platform will be running in production ten years from now. Shortcuts are liabilities.

### What This Means

- Favor boring, proven technology over novelty
- Favor composition over inheritance in both code and product architecture
- Every dependency must justify its existence
- Documentation is updated when code changes
- TypeScript strict mode with zero errors is enforced
- Scalability is designed in, not bolted on

### Trade-Offs

- May not ship as fast as less-disciplined competitors
- Some novel solutions may be rejected in favor of proven approaches
- Refactoring old patterns is prioritized over building new features

*Reference: `docs/PRODUCT_CONSTITUTION.md §11`, `docs/CODING_STANDARDS.md`*

---

## Principle Conflict Resolution

| Conflict | Resolution |
|---|---|
| Enterprise First vs Executive Simplicity | Simplicity serves the executive persona — both align |
| Evidence Driven vs Build for Ten Years | Long-term architecture decisions may be strategic (T3); feature decisions require evidence |
| AI Native vs Security by Design | AI never acts autonomously on financial data — security wins |
| Automation vs Evidence Driven | Automate documented, validated workflows first |
| Localization First vs Enterprise First | Localization IS an enterprise requirement for global companies |
| Workflow Before Features vs Build for Ten Years | Platform infrastructure may precede workflow completeness |

---

## References

- `docs/PRODUCT_CONSTITUTION.md` — Permanent constitutional principles
- `docs/product/product-strategy.md` — Strategic vision
- `docs/product/product-governance-overview.md` — Governance system
- `docs/product/roadmap-governance.md` — Feature governance process
- `docs/architecture/enterprise-readiness-checklist.md` — Enterprise readiness
- `docs/architecture/perionyx-engineering-constitution.md` — Engineering constitution
