---
title: "Perionyx Product Principles"
created: 2026-07-28
updated: 2026-07-28
version: 1.0
tags:
  - type/reference
  - domain/product
  - status/active
owner: Product Team
authority: Product Constitution
---

# Perionyx Product Principles

## 1. Purpose

Product principles are the decision rules for every feature, workflow, and interaction in Perionyx. When a product team faces a trade-off — speed vs. trust, simplicity vs. completeness, automation vs. control — these principles resolve the conflict.

Each principle has a validation status. Only Validated principles inform roadmap decisions with full confidence. Working principles are actively being validated. Hypothesis principles are tracked but not acted upon without further evidence.

This document expands the 7 original principles from customer discovery into 15 principles that govern the complete Perionyx product.

---

## 2. Principle Format

Every principle follows a standard structure:

| Field | Definition |
|-------|-----------|
| **Statement** | The principle itself — one sentence |
| **Evidence** | Customer quotes, CRM data, or constitutional authority supporting this principle |
| **Implication** | What this principle means for product design |
| **Validation Status** | Validated / Working / Hypothesis |

### Validation Tiers

| Tier | Criteria | Roadmap Impact |
|------|----------|----------------|
| **Validated** | 3+ independent interview sources confirm | Full confidence — informs roadmap |
| **Working** | 1-2 sources, or 1 very detailed source | Track and validate further |
| **Hypothesis** | No direct interview evidence; inferred from patterns | Do not act on without validation |

---

## 3. Validated Principles

These principles have evidence from multiple independent sources and inform product decisions with full confidence.

---

### VP1: Reporting Is Table Stakes, Not a Differentiator

| Field | Value |
|-------|-------|
| Statement | Existing systems handle reporting adequately. Perionyx differentiation comes from transactional automation, not analytics. |
| Evidence | Adeel Aslam (2026-07-21): "While our systems cover reporting and cash flow planning fairly well..." |
| Implication | Do not build dashboards to differentiate. Build workflows that reduce manual overhead. Reporting exists to support decisions, not to replace them. |
| Validation Status | **Working** (2 sources) — needs 3+ for full validation |

**Design Rules**:
- Every screen answers one question; dashboards are secondary to workflows
- Reports are generated from workflow data, not entered manually
- Analytics exist to explain workflow performance, not as standalone products

---

### VP2: Operational Automation Is the Real Gap

| Field | Value |
|-------|-------|
| Statement | The gap is in invoice matching, approval routing, and payment execution — not in dashboards or reports. |
| Evidence | Adeel Aslam (2026-07-21): "These operational tasks often require manual oversight to ensure accuracy." |
| Implication | Prioritise workflow automation over analytics features. The workflow IS the product. |
| Validation Status | **Working** (2 sources) — needs 3+ for full validation |

**Design Rules**:
- Every feature reduces a manual step in a financial workflow
- "Manual oversight" is a bug, not a feature — automate the oversight where possible
- Workflow completion is the primary success metric, not feature usage

---

### VP3: Trust Requires Provable Accuracy

| Field | Value |
|-------|-------|
| Statement | Automated actions must show their work. Confidence scores must be drillable to source documents. Every recommendation must explain its reasoning. |
| Evidence | Adeel Aslam (2026-07-21): "manual oversight to ensure accuracy" — he does not trust automated matching. |
| Implication | Trust-building features (show-your-work, drill-down, confidence scores) are not nice-to-haves — they are prerequisites for automation adoption. |
| Validation Status | **Working** (2 sources) — needs 3+ for full validation |

**Design Rules**:
- Every automated match shows the PO line, receipt, and tolerance applied
- Every AI recommendation includes reasoning chain and confidence level
- Every number can be traced to its source within 3 clicks
- "Trust me" is never acceptable — "here's why" is always required

---

### VP4: Every Action Is Auditable

| Field | Value |
|-------|-------|
| Statement | Every state transition, approval, exception resolution, and payment execution is recorded with timestamp, actor, decision, evidence, and authority. |
| Evidence | Platform Constitution Law 12: "Every request is authenticated. Every action is authorized. Every access is logged." Controller persona requirement: reconstruct invoice lifecycle for audit queries. |
| Implication | Audit is not a module — it is a property of every action. No action exists without a trace. |
| Validation Status | **Constitutional** — established by engineering authority |

**Design Rules**:
- Every state transition creates an audit record
- Audit records are immutable (append-only)
- Audit trail reconstruction is a single query, not a manual investigation
- No action can be deleted — only reversed with a compensating entry

---

### VP5: Financial Precision Is Non-Negotiable

| Field | Value |
|-------|-------|
| Statement | All monetary calculations use Decimal(38,12) precision. All financial operations are idempotent. All state transitions are auditable. All approvals are non-repudiable. |
| Evidence | Platform Constitution Law 6: "Financial integrity is never compromised." Phase 19.1: migrated Float fields to Decimal, implemented banker's rounding. |
| Implication | A system that rounds incorrectly has failed its fundamental purpose. Precision is not optional — it is the foundation of trust. |
| Validation Status | **Constitutional** — established by engineering authority |

**Design Rules**:
- All monetary fields: Decimal(38,12)
- Rounding: banker's rounding via `financialRound()` — never `Math.round()`
- Aggregation: `sumDecimals()` — never native `reduce()`
- Comparison: `decimalEquals()` — never `===` on floats
- Display: `formatDecimalCurrency()` — never inline formatting

---

### VP6: One Financial Truth

| Field | Value |
|-------|-------|
| Statement | Finance professionals must not export data from one system and re-import it into another. A single source of truth eliminates reconciliation overhead. |
| Evidence | Ayman Shawky (CRM): "Siloed systems create reconciliation overhead; Single source of truth for financial data." Muhammed Jamsheed (CRM): "Weak integration between inventory and finance modules; Data must be exported and re-imported manually." |
| Implication | Perionyx must prove that a unified approach eliminates the reconciliation overhead that fragmentation creates. Never claim "unified" unless a finance professional can trace a payment from vendor invoice through GL posting without switching contexts. |
| Validation Status | **Working** (2 sources) — needs 3+ for full validation |

**Design Rules**:
- Every financial figure is computed from a single data source
- Cross-module traces (invoice → GL → payment) are single queries
- No "export to Excel" for reconciliation — reconciliation is a first-class workflow
- Currency, amounts, and balances are consistent across all views

---

## 4. Working Principles

These principles have some evidence but need further validation before fully informing roadmap decisions.

---

### WP1: Exceptions Deserve Attention, Not Automation

| Field | Value |
|-------|-------|
| Statement | When automation encounters ambiguity, it should surface the exception for human review — not guess. Exceptions are signals that the process needs human judgement. |
| Evidence | Adeel Aslam (2026-07-21): "manual oversight to ensure accuracy" — manual oversight is needed precisely when automation encounters ambiguity. Market themes T1, T2: manual approval and reconciliation are the pain points. |
| Implication | Exception queues are not failure — they are the system working correctly. The product should make exceptions easy to resolve, not hidden or overwhelming. |
| Validation Status | **Working** (2 sources) |

**Design Rules**:
- Every exception has a clear explanation, source documents, and resolution options
- Exception queue is sorted by financial impact, not chronology
- AI can suggest resolutions but humans approve them
- Exception resolution is tracked for process improvement

---

### WP2: Context Before Action

| Field | Value |
|-------|-------|
| Statement | Before any financial decision, the decision-maker must have all relevant context visible in one screen — no tab-switching, no "let me check the PO." |
| Evidence | Adeel Aslam (2026-07-21): approval workflows "require manual oversight to ensure accuracy" — oversight requires context. Market theme T1: approval delays come from context-gathering, not decision-making. |
| Implication | Every approval screen must show the invoice, PO, receipt, match result, vendor history, and budget impact in one view. |
| Validation Status | **Working** (2 sources) |

**Design Rules**:
- Approval screens are context-complete (invoice, PO, receipt, vendor, budget)
- Every action button is preceded by the information needed to make the decision
- Navigation within a workflow never requires leaving the workflow
- "Let me check" is a workflow design failure

---

### WP3: Evidence Before Approval

| Field | Value |
|-------|-------|
| Statement | Approval decisions must be based on provable evidence — not trust in the person who prepared the payment. |
| Evidence | Platform Constitution Law 12: "Zero trust is the default." Adeel Aslam (2026-07-21): "manual oversight to ensure accuracy" — oversight is evidence-gathering. |
| Implication | Every approval screen presents the evidence (match result, supporting documents, policy compliance) alongside the approval action. The approver never approves blind. |
| Validation Status | **Working** — constitutional authority + 1 interview source |

**Design Rules**:
- Approval actions are disabled until evidence is displayed
- Supporting documents are viewable inline (no download-then-review)
- Policy violations are flagged before approval, not after
- Approval records include the evidence snapshot at decision time

---

### WP4: Human Accountability Is Inviolable

| Field | Value |
|-------|-------|
| Statement | A human must always be accountable for financial decisions. Automation can prepare, recommend, and execute — but a human must authorise. |
| Evidence | Platform Constitution: "Every action is auditable." Controller persona requirement: segregation of duties. Industry regulatory requirements: SOX, IFRS. |
| Implication | No financial transaction executes without a named human authorisation. AI recommends; humans decide. Automation executes; humans approve. |
| Validation Status | **Constitutional** — established by engineering authority |

**Design Rules**:
- Every payment requires a named human approver
- AI recommendations are labelled as recommendations, never as decisions
- Automated execution requires pre-authorised rules (set by humans)
- "The system did it" is never an acceptable answer to an audit query

---

### WP5: Separation of Concerns Prevents Errors

| Field | Value |
|-------|-------|
| Statement | The person who creates a purchase order must not be the same person who approves the invoice against it. Segregation of duties is a control, not a burden. |
| Evidence | Platform Constitution Law 12. Controller persona: SoD enforcement. SOX compliance requirements. |
| Implication | The approval matrix enforces role-based separation. The system prevents, not merely logs, SoD violations. |
| Validation Status | **Constitutional** — established by engineering authority |

**Design Rules**:
- SoD rules are enforced at the API level, not just the UI level
- SoD violations are blocked, not warned
- Delegation must preserve SoD (delegated approver must also satisfy SoD)
- SoD exceptions require elevated authority and audit trail

---

## 5. Hypothesis Principles

These principles have no direct interview evidence yet. They are inferred from industry patterns and CRM data. They must be validated before informing product decisions.

---

### HP1: AI Must Explain Itself

| Field | Value |
|-------|-------|
| Statement | AI-generated recommendations must include the reasoning chain, confidence level, source data, and the option to override. |
| Evidence | Ayman Shawky (CRM): "Interest in ML-based cash flow predictions; Need for confidence scoring on forecasts." Market theme T6: "AI Forecasting Is Interesting but Untrusted." |
| Implication | AI features need explainability and confidence scoring, not just predictions. Black-box recommendations will not be adopted by finance professionals. |
| Validation Status | **Hypothesis** — needs 3+ interview sources |

**Validation Plan**:
- Interview 3+ treasurers about trust requirements for AI forecasts
- Test confidence scoring adoption in beta
- Measure override rate (high override = low trust)

---

### HP2: Approval Workflows Must Support Delegation

| Field | Value |
|-------|-------|
| Statement | Approval matrix must support delegation, escalation, and absence handling. Approvals cannot be blocked by a single unavailable person. |
| Evidence | Industry patterns (Phase 20.0 findings). No direct interview evidence. |
| Implication | Approval workflows must handle: temporary delegation (approver on leave), escalation (deadline approaching), proxy approval (pre-authorised substitute). |
| Validation Status | **Hypothesis** — needs 3+ interview sources |

**Validation Plan**:
- Interview 3+ finance managers about approval delegation requirements
- Measure approval delay caused by unavailable approvers
- Test delegation workflow in beta

---

### HP3: MENA Market Needs Arabic-First Design

| Field | Value |
|-------|-------|
| Statement | Arabic RTL support is not just translation — it is layout, number formatting, date formatting, and cultural alignment. |
| Evidence | CRM contact profiles (multiple Saudi Arabia contacts). No direct interview evidence. |
| Implication | Arabic support requires: RTL layout, Arabic-Indic numerals, Hijri date support, Arabic financial terminology. |
| Validation Status | **Hypothesis** — needs 3+ interview sources |

**Validation Plan**:
- Interview 3+ MENA finance professionals about language requirements
- Test Arabic prototype with native speakers
- Measure task completion time in Arabic vs. English

---

### HP4: Real-Time Visibility Is a Baseline Expectation

| Field | Value |
|-------|-------|
| Statement | Finance professionals expect instant visibility into cash positions, AP aging, and workflow status. Nightly batch reports are unacceptable. |
| Evidence | Ayman Shawky (CRM): "Need for instant view of cash positions across all accounts." Market theme T4. |
| Implication | Treasury and AP dashboards must update in real-time, not nightly. Stale data must be labelled. |
| Validation Status | **Hypothesis** — needs 3+ interview sources |

**Validation Plan**:
- Interview 3+ treasurers about real-time requirements
- Measure "data freshness" complaints in beta
- Test real-time vs. cached dashboard adoption

---

### HP5: Month-End Close Pain Is Universal

| Field | Value |
|-------|-------|
| Statement | Month-end close is universally painful because AP, AR, GL, and Treasury operate in disconnected systems that must be manually reconciled. |
| Evidence | Market theme T5: "Month-End Close Is Universally Painful." No direct interview evidence. |
| Implication | Perionyx should offer continuous close — not month-end batch reconciliation. |
| Validation Status | **Hypothesis** — needs 3+ interview sources |

**Validation Plan**:
- Interview 3+ controllers about month-end close pain
- Measure close duration before/after Perionyx adoption
- Test continuous close vs. batch close preference

---

## 6. Principle Conflicts

When principles conflict, the following resolution hierarchy applies:

### Hierarchy (Highest to Lowest)

| Priority | Principle | Rationale |
|----------|-----------|-----------|
| 1 | VP5: Financial Precision | Without correct numbers, nothing else matters |
| 2 | VP4: Every Action Is Auditable | Without audit trails, trust collapses |
| 3 | VP3: Trust Requires Provable Accuracy | Without trust, adoption fails |
| 4 | WP4: Human Accountability | Without accountability, compliance fails |
| 5 | VP2: Operational Automation | Without automation, the product doesn't differentiate |
| 6 | WP2: Context Before Action | Without context, decisions are guesses |
| 7 | VP1: Reporting Is Table Stakes | Without reporting, decisions lack data |

### Common Conflicts

| Conflict | Resolution |
|----------|-----------|
| Speed vs. Trust | Trust wins. A 3-second delay to show evidence is acceptable. A 3-minute delay is not. |
| Automation vs. Accountability | Accountability wins. Automate preparation, not authorisation. |
| Simplicity vs. Auditability | Auditability wins. An audit trail that takes 1 extra click is acceptable. |
| Completeness vs. Speed | Context wins. An approval screen without evidence is incomplete, not fast. |
| AI Recommendation vs. Human Override | Human override always wins. AI recommends; humans decide. |

---

## 7. Evidence Map

Every principle mapped to its supporting evidence.

| Principle | Evidence Source | Evidence Type | Confidence |
|-----------|----------------|---------------|------------|
| VP1: Reporting Is Table Stakes | Adeel Aslam (2026-07-21) | Interview quote | Working |
| VP2: Operational Automation Is the Gap | Adeel Aslam (2026-07-21) | Interview quote | Working |
| VP3: Trust Requires Provable Accuracy | Adeel Aslam (2026-07-21) | Interview quote | Working |
| VP4: Every Action Is Auditable | Platform Constitution Law 12 | Constitutional authority | Established |
| VP5: Financial Precision Is Non-Negotiable | Platform Constitution Law 6 | Constitutional authority | Established |
| VP6: One Financial Truth | Ayman Shawky, Muhammed Jamsheed | CRM contacts | Working |
| WP1: Exceptions Deserve Attention | Adeel Aslam (2026-07-21) | Interview quote | Working |
| WP2: Context Before Action | Adeel Aslam (2026-07-21) | Interview quote | Working |
| WP3: Evidence Before Approval | Constitution + Adeel Aslam | Mixed | Working |
| WP4: Human Accountability | Platform Constitution | Constitutional authority | Established |
| WP5: Separation of Concerns | Platform Constitution + SOX | Constitutional + regulatory | Established |
| HP1: AI Must Explain Itself | Ayman Shawky (CRM) | CRM contact | Hypothesis |
| HP2: Approval Delegation | Industry patterns | Inference | Hypothesis |
| HP3: Arabic-First Design | CRM contact profiles | Inference | Hypothesis |
| HP4: Real-Time Visibility | Ayman Shawky (CRM) | CRM contact | Hypothesis |
| HP5: Month-End Close Pain | Market theme T5 | Inference | Hypothesis |

---

## 8. How Principles Guide Development

### Feature Proposals

Every feature proposal must cite at least one principle. If no principle supports a feature, it does not ship.

### Design Reviews

Every design review evaluates against the principle hierarchy. If a design conflicts with a higher-priority principle, it must be revised.

### Roadmap Prioritisation

Validated principles (VP1-VP6) inform roadmap priorities. Working principles (WP1-WP5) inform design direction. Hypothesis principles (HP1-HP5) inform research priorities.

### Principle Refresh

Principles are reviewed quarterly. Working principles with 3+ sources are promoted to Validated. Hypothesis principles with 1+ sources are promoted to Working. Principles contradicted by evidence are flagged for review.

---

## Relationships

| Type | Document | Description |
|------|----------|-------------|
| Foundation | [[PRODUCT_PHILOSOPHY]] | The beliefs these principles implement |
| Implementation | [[ENTERPRISE_PRODUCT_SPECIFICATION_AP]] | AP workflow governed by these principles |
| Authority | [[PLATFORM_CONSTITUTION]] | Engineering laws these principles inherit from |
| Evidence | [[03-Customer Intelligence/PRODUCT_PRINCIPLES]] | Original 7 principles from customer discovery |
| Evidence | [[03-Customer Intelligence/VALIDATED_MARKET_THEMES]] | Market themes T1-T6 supporting principles |

---

**Version History**

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0 | 2026-07-28 | Initial product principles (15 principles) | Product Team |
