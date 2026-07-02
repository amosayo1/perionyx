# Perionyx — Product Constitution

**Version 1.0**  
**Last Updated: July 2026**  
**Status: Ratified**

---

## Preamble

Perionyx is an enterprise financial operating system. It is not a banking application, not a budgeting tool, and not a cryptocurrency platform. It is the infrastructure layer upon which companies manage, move, control, and audit their financial operations. Every feature, every line of code, and every architectural decision must serve that mission.

This constitution defines the permanent principles governing the platform. All engineering decisions, product decisions, and architectural reviews must be consistent with this document.

---

## Section 1 — Mission

**To provide the world's most reliable, transparent, and intelligent operating system for enterprise financial operations.**

Perionyx exists to replace fragmented financial tooling with a single unified platform that treasury, finance, compliance, risk, and audit teams can trust with their company's money.

---

## Section 2 — Vision

A future where every enterprise runs its financial operations on Perionyx because:

- **Trust is baked in** — every action is recorded, every decision is explainable, every data point is auditable
- **Intelligence is ambient** — AI surfaces insights, risks, and recommendations without being asked
- **Control is granular** — policies, approvals, and RBAC work together to enforce financial governance
- **Integration is seamless** — Perionyx connects to banks, ERPs, and every tool in the finance stack

---

## Section 3 — Core Principles

### 3.1 Financial Integrity First
The ledger must always balance. Every transaction must be traceable from creation through approval, posting, settlement, reconciliation, and audit. If a feature conflicts with financial integrity, the feature yields.

### 3.2 Explainability Before Automation
Every AI-generated insight, recommendation, or action must include its sources, confidence level, and reasoning. The platform never acts as a black box.

### 3.3 Auditability by Default
Every state change that affects financial data must be recorded in an immutable audit trail. No operation that modifies financial state may execute without producing an auditable record.

### 3.4 Tenant Isolation
Every company's data is isolated at the database level via `companyId` on every entity. Cross-tenant data access is a security incident.

### 3.5 Offline First
The platform must function without external AI dependencies. When AI services are unavailable, the platform degrades gracefully and provides value through structured data and rule-based logic.

### 3.6 Progressive Disclosure
New users should see a simple, guided experience. Power users should be able to access every knob and dial. The platform accommodates both without compromising either.

### 3.7 Consistency Over Convenience
When choosing between a consistent experience across modules and a convenient shortcut in one module, consistency wins. Users should be able to predict how any module behaves based on their knowledge of any other module.

---

## Section 4 — Engineering Principles

### 4.1 Type Safety
TypeScript strict mode is enforced. `any` is prohibited except in well-documented adapter layers. The build must produce zero TypeScript errors.

### 4.2 Modularity
Every feature lives in three layers: a service module (`src/modules/<feature>/`), an API route (`src/app/api/v1/<feature>/`), and UI components (`src/components/<feature>/`). Cross-module dependencies must be explicit and justified.

### 4.3 Data Layer Authority
Prisma is the single source of truth for data access. Raw SQL is prohibited except for migrations and performance-critical query paths that are reviewed and documented.

### 4.4 Error Explicitness
Every error must be caught, logged, and returned in a structured format. Catch-all `500 Internal Server Error` responses are never acceptable in production code. Every catch block must include error logging.

### 4.5 Idempotency
All state-modifying API operations must be idempotent where the domain allows. The `IdempotencyRecord` model exists for this purpose.

### 4.6 Testing Philosophy
Unit tests cover business logic. Integration tests cover API contracts. The sandbox serves as the integration test environment for financial scenarios.

---

## Section 5 — Security Principles

Security follows defense in depth: authentication → authorization (RBAC) → tenant isolation (companyId) → rate limiting → input validation (Zod) → audit logging. See `SECURITY.md` for detailed implementation.

---

## Section 6 — AI Principles

### 6.1 Grounded Generation
All AI responses must be grounded in platform data. The AI may not fabricate transactions, balances, users, or other platform entities.

### 6.2 Source Citation
Every factual claim in an AI response must cite its source. Citations include the module name, record identifier, and relevant field.

### 6.3 Confidence Transparency
Every AI response must include a confidence rating. Low-confidence responses must clearly communicate uncertainty and suggest verification steps.

### 6.4 Persona Awareness
AI responses adapt to the user's role and context. A CEO sees executive summaries; a Treasury Analyst sees operational detail.

### 6.5 No Autonomous Action
AI may recommend actions but may never execute them autonomously. All financial actions require explicit human approval through the approval workflow engine.

---

## Section 7 — UX Principles

### 7.1 Data Density
Enterprise users need dense information displays. Tables, grids, and dashboards should maximize data per pixel while maintaining readability.

### 7.2 Keyboard Navigation
All functionality must be accessible via keyboard. Power users should never need to reach for a mouse.

### 7.3 Command Palette
The command palette (⌘K) is the primary navigation and search interface. Every page, action, and record should be accessible from the palette.

### 7.4 Dark Theme
The platform uses a dark theme by default. Light theme may be provided in the future but dark is the primary design target.

### 7.5 Loading States
Every data-fetching operation must show a loading state. Skeleton loaders are preferred over spinners.

### 7.6 Empty States
Every list and table must handle the empty state with a helpful message and suggested next action.

---

## Section 8 — Enterprise Standards

### 8.1 Audit Readiness
The platform must be capable of passing a financial audit. Every financial transaction must be traceable through its complete lifecycle. Audit logs must be immutable and exportable.

### 8.2 SLA Awareness
The platform health system must monitor service availability, response times, and error rates. Degraded services must be surfaced to administrators.

### 8.3 Multi-Currency
All financial operations support multiple currencies. Exchange rates are tracked with source and validity windows.

### 8.4 Multi-Entity
The platform supports multiple legal entities (companies) per installation with full data isolation.

---

## Section 9 — Quality Standards

### 9.1 Zero Error Build
The TypeScript build must produce zero errors before any deployment.

### 9.2 Lint Compliance
All code must pass the configured linter. Lint warnings are treated as errors.

### 9.3 Type Coverage
All functions must have explicit return types. All parameters must have explicit types. `any` and `as` casts require documented justification.

### 9.4 Documentation Currency
Documentation must be updated when the corresponding code changes. Outdated documentation is a bug.

---

## Section 10 — Architecture Review Checklist

Every architectural decision must satisfy:

- [ ] Is this consistent with financial integrity?
- [ ] Is this auditable?
- [ ] Does this respect tenant isolation?
- [ ] Is this consistent with the existing module structure?
- [ ] Does this add TypeScript bypasses?
- [ ] Does this add new database queries that need indexing?
- [ ] Is this documented in the appropriate ADR?
- [ ] Does this degrade gracefully when dependencies are unavailable?
- [ ] Is the error handling explicit?
- [ ] Is this keyboard-accessible?

---

## Section 11 — Long-Term Philosophy

### 11.1 Build for Ten Years
Every architectural decision should assume the platform will be running in production ten years from now. Shortcuts that create long-term maintenance burden are not shortcuts — they are liabilities.

### 11.2 Favor Composition Over Inheritance
Feature modules compose together through well-defined interfaces. No module should inherit behavior from another module.

### 11.3 Favor Boring Technology
Use well-established technologies with proven track records. Novelty for its own sake is discouraged. Every dependency must justify its existence.

### 11.4 Financial Software is Infrastructure
Perionyx handles company money. Bugs can cause financial loss. Security flaws can cause catastrophic damage. The engineering culture must reflect this responsibility in every commit.
