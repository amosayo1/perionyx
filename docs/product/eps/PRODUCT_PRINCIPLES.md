---
title: "Product Principles — AP Reference Workflow"
created: 2026-07-28
updated: 2026-07-28
version: 2.0
phase: 27.1
tags:
  - type/reference
  - domain/product
  - domain/ap
  - status/active
owner: Product Architecture Board
authority: Product Constitution
inherits_by: ["AR", "Treasury", "Financial Close", "Compliance", "Banking", "Financial Intelligence"]
---

# Product Principles — AP Reference Workflow v2.0

> **Classification**: Internal — Engineering & Product
> **Phase**: 27.1 — EPS Companion Documents
> **Supersedes**: PERIONYX_PRODUCT_PRINCIPLES.md (for AP workflow scope)

---

## 1. Purpose

These are the **canonical product principles** for every Perionyx financial workflow. Every design decision, feature priority, and interaction pattern is resolved by these principles before any other consideration.

The AP Reference Workflow is the first implementation. These principles are inherited unchanged by AR, Treasury, Financial Close, Compliance, Banking, and Financial Intelligence. A principle that does not hold for AP cannot hold for any workflow.

Every principle is traceable to customer evidence. When evidence is absent or weak, the principle is labelled Hypothesis — it informs design hypotheses but does not override validated principles.

---

## 2. Principle Format

| Field | Definition |
|-------|-----------|
| **Statement** | The principle — one sentence, unambiguous, actionable |
| **Evidence** | Customer quotes, CRM data, or constitutional authority. Source name + date. |
| **Application** | How this principle manifests in the AP workflow specifically |
| **Anti-Pattern** | What this principle prevents — the failure mode it guards against |
| **Validation Status** | Validated (3+ sources) / Working (1-2 sources) / Hypothesis (no direct evidence) |
| **Related Principles** | Which other principles this intersects with or depends on |

---

## 3. Validation Tiers

| Tier | Criteria | Roadmap Impact |
|------|----------|----------------|
| **Validated** | 3+ independent interview or CRM sources confirm | Full confidence — informs roadmap and architecture |
| **Working** | 1-2 interview sources, or 1 very detailed source | Track and validate further — informs design but not architecture |
| **Hypothesis** | No direct interview evidence; inferred from patterns | Do not act on without validation — informs research backlog |

---

## 4. The 10 Principles

---

### P1: Trusted Information Before Transactions

| Field | Value |
|-------|-------|
| **Statement** | Every number displayed must be accurate, sourced, and time-stamped before any action can be taken on it. |
| **Evidence** | Adeel Aslam (2026-07-21): "vendor invoice reconciliations... require manual oversight to ensure accuracy." P3 (Trust Requires Accuracy): Validated with 3 sources — accuracy is the prerequisite for trust, not a byproduct. |
| **Application** | The AP Dashboard shows invoice counts, pending amounts, exception counts, and DPO. Every one of these numbers carries a `last-updated` timestamp and a `source` label (Prisma, cache, computed). The invoice queue shows the PO match confidence and the data freshness for each row. An invoice cannot be approved if its match data is older than 24 hours. |
| **Anti-Pattern** | Displaying stale numbers as current. Showing "Pending Approval: $180K" without indicating whether that figure was computed 5 seconds ago or 5 hours ago. Approving an invoice against a PO that was updated since the match was last run. |
| **Validation Status** | **Validated** — 4 sources (Adeel Aslam, Muhammed Jamsheed, Ayman Shawky, P3) |
| **Related Principles** | P6 (Evidence Before Approval), P7 (One Financial Truth), P9 (Audit Trail Is Non-Negotiable) |

**Design Rules**:
- Every KPI card shows `Updated X ago` beneath the value
- Invoice queue rows show a data-freshness dot: green (<1h), yellow (1-24h), red (>24h)
- Approve button is disabled when data is stale — user must refresh first
- Stale data is explicitly labelled: "Match data from 3 days ago — refresh recommended"
- No financial number is rendered without a source attribution

---

### P2: Automate Preparation, Not Decisions

| Field | Value |
|-------|-------|
| **Statement** | The system should prepare, organise, and present information so that the human decision-maker can decide faster — but the system never makes the decision. |
| **Evidence** | T2 (Invoice Reconciliation): 4 independent sources identify manual reconciliation as a primary pain point. Muhammed Jamsheed (CRM): "Automated reconciliation is highly desired; Intelligent discrepancy alerts would reduce manual work." Adeel Aslam (2026-07-21): "vendor invoice reconciliations... still manage manually." |
| **Application** | Three-way matching runs automatically: invoice lines are matched against PO lines and GRN lines. Discrepancies are flagged with variance amounts and root-cause hypotheses. But the final "match confirmed" or "exception raised" is a system action, not a human decision. Approval routing prepares the evidence package — the approver decides. Payment batch proposals are generated automatically — the Treasury Manager approves. |
| **Anti-Pattern** | Building a system where every step requires human initiation. Requiring the AP Clerk to manually run a matching report. Forcing the approver to open three separate screens to gather evidence. Automating the approval itself (removing the human). |
| **Validation Status** | **Validated** — 5 sources (T2×4, Muhammed Jamsheed) |
| **Related Principles** | P4 (Context Before Action), P5 (Exceptions First), P6 (Evidence Before Approval) |

**Design Rules**:
- Invoice receipt triggers automatic three-way match — no human initiation required
- Match results are presented with evidence (PO line, GRN line, variance) — not just pass/fail
- Approval routing is automatic based on amount thresholds — no manual routing
- Payment batches are generated by rules — humans review and approve
- "What do I do next?" is always answered by the system, never by the user guessing

---

### P3: Preserve Human Judgement

| Field | Value |
|-------|-------|
| **Statement** | The system supports, informs, and accelerates human judgement — it never replaces it. Every financial decision has a named human author. |
| **Evidence** | Khaleel Ur Rehman (CRM): "What can I do to support you in building that operating system?" — framing Perionyx as a support system, not a replacement. P3 (Trust Requires Accuracy): Validated with 3 sources — trust depends on human accountability. Platform Constitution: "Every action is auditable" — implies a human actor. |
| **Application** | AI generates match confidence scores and exception resolution suggestions, but the AP Clerk decides. Approval routing presents evidence and recommends, but the approver decides. Payment batch proposals include cash-impact analysis, but the Treasury Manager decides. The system never auto-approves, auto-rejects, or auto-pays. |
| **Anti-Pattern** | Auto-approving invoices below a threshold. Auto-paying vendors based on AI confidence. Routing exceptions to "AI resolution" without human review. Removing the approve/reject step because "the system already knows." |
| **Validation Status** | **Validated** — 4 sources (Khaleel Ur Rehman, P3×3) |
| **Related Principles** | P6 (Evidence Before Approval), P2 (Automate Preparation, Not Decisions), P9 (Audit Trail Is Non-Negotiable) |

**Design Rules**:
- Every payment has a named human approver in the audit trail
- AI recommendations are displayed as recommendations — never as system decisions
- The approve/reject button is always present on financial actions — never replaced by auto-execution
- Override actions (approver overrides system recommendation) require a written reason
- "The system did it" is never a valid response to an audit query

---

### P4: Context Before Action

| Field | Value |
|-------|-------|
| **Statement** | Before any financial decision, the decision-maker must have all relevant context visible on a single screen — no tab-switching, no "let me check the PO." |
| **Evidence** | T1 (Manual Approvals): 4 independent sources identify approval delays caused by context-gathering, not decision-making. Mohamed Gamal (CRM): "approval bottlenecks" — bottlenecks exist because approvers lack context. Adeel Aslam (2026-07-21): approval workflows "require manual oversight to ensure accuracy" — oversight requires context. |
| **Application** | The Invoice Detail screen presents the invoice document, line items, PO match, GRN match, vendor history, AI risk score, and approval path on a single screen with tabbed evidence. The Approval View shows the evidence panel (left) and decision panel (right) simultaneously — no navigation required to make the decision. The Exception Queue shows the root cause, suggested resolution, and financial impact inline. |
| **Anti-Pattern** | Requiring the approver to open the PO in a separate tab. Forcing the AP Clerk to navigate to the vendor profile to check payment history. Showing "3 exceptions" without showing what they are. Requiring the Treasury Manager to open a separate cash-position screen before approving a payment batch. |
| **Validation Status** | **Validated** — 4 sources (T1×4, Mohamed Gamal) |
| **Related Principles** | P1 (Trusted Information Before Transactions), P6 (Evidence Before Approval), P8 (Decision Readiness) |

**Design Rules**:
- Invoice Detail is a single-screen workspace — no external navigation required for approval
- Approval View always shows evidence panel + decision panel side-by-side
- "Let me check" is a workflow design failure — if the user says it, the screen is missing context
- Vendor history (last 12 months) is a tab within Invoice Detail — not a separate page
- Payment batch detail shows cash impact inline — no separate treasury lookup

---

### P5: Exceptions First

| Field | Value |
|-------|-------|
| **Statement** | The attention queue is ordered by exception severity and financial impact, not chronology. What needs attention now is always at the top. |
| **Evidence** | Muhammed Jamsheed (CRM): "Intelligent discrepancy alerts would reduce manual work." Adeel Aslam (2026-07-21): "manual oversight to ensure accuracy" — oversight is directed at exceptions, not routine matches. T2 (Invoice Reconciliation): manual reconciliation is the pain — exceptions are where manual work concentrates. |
| **Application** | The AP Dashboard shows the exception queue above the aging snapshot. The Work Queue defaults to sorting by SLA deadline (most urgent first), then by amount (highest financial impact). Exception types are grouped by root cause (price mismatch, quantity mismatch, duplicate) — not by date received. SLA countdowns are visible on every invoice row. |
| **Anti-Pattern** | Sorting the queue alphabetically. Showing exceptions in chronological order (oldest first regardless of impact). Burying exceptions in a sub-tab. Requiring the user to click into each invoice to discover it has an exception. |
| **Validation Status** | **Validated** — 5 sources (Muhammed Jamsheed, Adeel Aslam, T2×4) |
| **Related Principles** | P2 (Automate Preparation, Not Decisions), P8 (Decision Readiness) |

**Design Rules**:
- Dashboard attention queue is sorted by: SLA deadline (ascending) → financial impact (descending) → exception count (descending)
- Exception queue groups by type first, then by age within type
- SLA countdowns use traffic-light indicators: green (>2d), yellow (1-2d), red (<1d), critical (overdue)
- Invoices with no exceptions are shown below exceptions — routine work is never prioritised over problems
- Bulk actions default to selecting all critical/overdue items first

---

### P6: Evidence Before Approval

| Field | Value |
|-------|-------|
| **Statement** | Approval decisions are based on provable evidence — not trust in the preparer. The approval screen presents the evidence and requires acknowledgment before the decision is recorded. |
| **Evidence** | P3 (Trust Requires Accuracy): Validated with 3 sources — accuracy is a prerequisite for trust. Adeel Aslam (2026-07-21): "manual oversight to ensure accuracy" — oversight IS evidence-gathering. Platform Constitution Law 6: "Financial integrity is never compromised." |
| **Application** | The Approval View shows the evidence panel (match result, supporting documents, policy compliance, AI risk score) on the left and the decision panel on the right. The approve button is disabled until the approver has scrolled through or acknowledged the evidence section. The approval record captures a snapshot of the evidence at decision time. |
| **Anti-Pattern** | Showing a one-line summary ("INV-2026-0042: $12,400 — Approve?") without evidence. Approving from an email notification without seeing the match result. Allowing approval before the approver has viewed the PO comparison. |
| **Validation Status** | **Validated** — 4 sources (P3×3, Adeel Aslam) |
| **Related Principles** | P1 (Trusted Information Before Transactions), P4 (Context Before Action), P9 (Audit Trail Is Non-Negotiable) |

**Design Rules**:
- Approve button is disabled until evidence panel is scrolled/acknowledged (minimum 3 seconds visible)
- Approval record includes: timestamp, actor, evidence hash, decision, reason (if override)
- Supporting documents (PO, GRN, invoice image) are viewable inline — no download required
- Policy violations are flagged before approval with clear violation description
- "I trust the preparer" is not a valid approval reason — evidence must be reviewed

---

### P7: One Financial Truth

| Field | Value |
|-------|-------|
| **Statement** | A single source of truth for all financial data. No export-reimport cycles. No "let me check the ERP." Every financial figure is computed from one canonical data set. |
| **Evidence** | T3 (ERP Silos): Validated — siloed systems create reconciliation overhead. Ayman Shawky (CRM): "Siloed systems create reconciliation overhead; Single source of truth for financial data; Need for instant view of cash positions." Muhammed Jamsheed (CRM): "Weak integration between inventory and finance modules; Data must be exported and re-imported manually." |
| **Application** | The AP workflow reads from and writes to a single Prisma data store. Invoice data, PO references, GRN confirmations, approval records, payment executions, and GL journal entries all live in the same database. The vendor profile aggregates data from all AP interactions — no separate vendor master. Cash position is computed from payment history — no separate treasury screen. |
| **Anti-Pattern** | Requiring the AP Clerk to export invoice data to Excel for reconciliation. Showing different invoice totals on the Dashboard vs. the Work Queue. Having a "vendor master" in one system and "vendor invoices" in another. Requiring a nightly sync to keep AP data current. |
| **Validation Status** | **Validated** — 4 sources (T3×3, Ayman Shawky) |
| **Related Principles** | P1 (Trusted Information Before Transactions), P9 (Audit Trail Is Non-Negotiable), P10 (Multi-Currency Is First-Class) |

**Design Rules**:
- Every financial figure on screen is computed from the same Prisma query — no caching that could go stale independently
- Cross-module traces (invoice → PO → GRN → payment → GL) are single queries — no manual joining
- "Export to Excel" is never a reconciliation step — reconciliation is a first-class workflow
- Vendor data is computed from invoice history — no separate vendor master that could drift
- Currency, amounts, and balances are consistent across all views at all times

---

### P8: Decision Readiness

| Field | Value |
|-------|-------|
| **Statement** | Every screen is designed so that the decision-maker can make their decision immediately upon arrival — no setup, no navigation, no "let me find the right view." |
| **Evidence** | Phase 27.0A UX Architecture: 25 screens designed with the "5 questions" framework. Every screen answers: What needs attention? Why? What evidence exists? What decision is required? What happens next? Mohamed Gamal (CRM): "approval bottlenecks" — bottlenecks exist when screens do not support instant decisions. |
| **Application** | The Dashboard answers "what do I do today?" on arrival. The Work Queue answers "which invoice do I process first?" on arrival. The Approval View answers "should I approve this?" on arrival. The Exception Resolution screen answers "which exception should I resolve first?" on arrival. No screen requires the user to perform setup actions before the primary decision is supported. |
| **Anti-Pattern** | A Dashboard that shows charts but no action queue. An Approval View that requires clicking through 3 tabs before the approve button becomes relevant. An Exception Resolution screen that lists exceptions but does not show resolution options until the user clicks into each one. |
| **Validation Status** | **Working** — 2 sources (Phase 27.0A, Mohamed Gamal) |
| **Related Principles** | P4 (Context Before Action), P5 (Exceptions First), P6 (Evidence Before Approval) |

**Design Rules**:
- Every screen has a primary action visible within 2 seconds of arrival
- Every screen answers the 5 questions (attention, why, evidence, decision, next) without scrolling past the fold
- Loading states show skeleton placeholders for the primary content — not blank screens
- Empty states show the expected content structure with a call-to-action — not just "No data"
- Error states preserve the navigation context — the user can retry without losing their place

---

### P9: Audit Trail Is Non-Negotiable

| Field | Value |
|-------|-------|
| **Statement** | Every state transition, approval, exception resolution, and payment execution is recorded with timestamp, actor, decision, evidence, and authority. The audit trail is immutable and tamper-evident. |
| **Evidence** | Platform Constitution Law 6: "Financial integrity is never compromised." Platform Constitution Law 7: "Architecture governed through automation." Phase 19.1: append-only audit records implemented. Phase 21A.0: 137 domain invariants enforced with audit entries. |
| **Application** | Every invoice state transition (Received → Validated → Matched → Exception → Approved → Paid) creates an audit record. Every approval captures: actor, timestamp, evidence snapshot hash, decision, authority level. Every exception resolution captures: actor, root cause, resolution action, supporting evidence. Every payment execution captures: actor, bank reference, amount, timestamp, GL entry reference. Audit records are append-only — no update or delete. |
| **Anti-Pattern** | Logging "invoice updated" without capturing what changed and who changed it. Allowing audit records to be deleted or modified. Requiring a manual audit investigation that spans multiple systems. Having audit logs that expire or rotate. |
| **Validation Status** | **Validated** — Constitutional authority (Platform Constitution Law 6) + 3 implementation phases (19.1, 21A.0, 21A.2) |
| **Related Principles** | P1 (Trusted Information Before Transactions), P6 (Evidence Before Approval), P7 (One Financial Truth) |

**Design Rules**:
- Audit trail is a tab within every detail view (Invoice, Payment, Exception, Vendor)
- Audit records are rendered as a chronological timeline with actor, action, timestamp, and evidence
- Audit trail integrity check is visible: "X records, last verified Y ago, hash chain valid"
- Audit export is available on every detail view (CSV, JSON)
- No user can delete or modify an audit record — the system prevents it at the API level

---

### P10: Multi-Currency Is First-Class

| Field | Value |
|-------|-------|
| **Statement** | Multi-currency is not a feature bolted on later — it is a foundational capability. Every monetary display, calculation, and report handles currency conversion, exchange rates, and gain/loss from inception. |
| **Evidence** | Ayman Shawky (CRM): "multi-currency balance aggregation." T7 (Multi-Currency FX): Hypothesis — no direct interview evidence yet, but Ayman Shawky's requirement for instant cash positions across currencies validates the need. Phase 19.1: Decimal(38,12) precision implemented for all monetary fields. Platform Constitution: Financial integrity never compromised. |
| **Application** | Every invoice displays its original currency and the functional currency equivalent. The AP Dashboard shows total pending approvals in functional currency with original currency breakdown. Payment batches support multi-currency execution. Exchange rates are sourced at invoice receipt time and locked for the invoice lifecycle. Realized and unrealized FX gains/losses are tracked per invoice. |
| **Anti-Pattern** | Building AP as USD-only and adding multi-currency later. Showing "Total: $180K" without specifying the currency. Converting all amounts to a single currency at display time without tracking the original. Ignoring FX gain/loss on invoice-to-payment timing. |
| **Validation Status** | **Hypothesis** — 2 sources (Ayman Shawky, T7) — needs 3+ for validation |
| **Related Principles** | P1 (Trusted Information Before Transactions), P7 (One Financial Truth), P9 (Audit Trail Is Non-Negotiable) |

**Design Rules**:
- Every monetary field shows: `[$12,400.00 USD]` with currency code always visible
- Functional currency equivalent shown inline: `≈ [$12,650.00 SAR] @ 3.7500`
- Exchange rate source and timestamp shown: "Rate from Saudi Central Bank, 2026-07-21 09:00 UTC"
- FX gain/loss is computed and displayed on payment completion: "Realized gain: $12.40"
- Reports support currency-level filtering and multi-currency aggregation

---

## 5. Principle Relationships

```
P1 (Trusted Info) ──→ P6 (Evidence Before Approval)
  │                      │
  ├──→ P7 (One Truth) ──→ P9 (Audit Trail)
  │      │
  └──→ P10 (Multi-Currency)
P2 (Automate Prep) ──→ P3 (Human Judgement)
  │                      │
  ├──→ P5 (Exceptions)   ├──→ P6 (Evidence)
  │      │               │
  └──→ P4 (Context) ────→ P8 (Decision Readiness)
```

**Dependency chain**: P7 → P1 → P6 → P3 (trust depends on truth, truth depends on evidence, evidence depends on human judgement)

**Independence**: P9 (Audit Trail) and P10 (Multi-Currency) are orthogonal — they apply regardless of other principles.

**Tension points**:
- P2 (Automate Preparation) vs P3 (Human Judgement): Automation speeds up preparation; judgement ensures accuracy. The boundary is: automate everything before the decision, nothing after.
- P5 (Exceptions First) vs P1 (Trusted Info): Prioritising exceptions requires accurate severity assessment. If severity is computed from stale data, exceptions are misprioritised.
- P7 (One Truth) vs P10 (Multi-Currency): A single source of truth must handle multiple currencies without losing the original transaction currency.

---

## 6. Application to Future Workflows

Every future Perionyx workflow inherits these 10 principles unchanged. A workflow that violates any principle must be redesigned, not granted an exception.

| Workflow | Primary Inherited Principles | Notes |
|----------|------------------------------|-------|
| Accounts Receivable | P1, P2, P7, P9 | Collections automation follows P2; credit decisions follow P3 |
| Treasury | P1, P7, P10, P5 | Cash position requires P1; multi-currency is core to Treasury |
| Financial Close | P7, P9, P1, P6 | Close is an evidence-gathering workflow; P6 governs reconciliation approval |
| Compliance | P9, P6, P3, P1 | Compliance is audit-first; P3 ensures human accountability |
| Banking | P1, P7, P10, P9 | Bank feeds require P1; reconciliation requires P7 |
| Financial Intelligence | P2, P5, P8, P3 | AI insights follow P2 (prepare, don't decide); P5 (surface exceptions) |

---

## 7. Evidence Index

| # | Source | Date | Type | Principles Supported |
|---|--------|------|------|---------------------|
| E1 | Adeel Aslam | 2026-07-21 | Discovery interview | P1, P2, P3, P6 |
| E3 | Ayman Shawky | TBD | CRM feedback | P7, P10 |
| E4 | Muhammed Jamsheed | TBD | CRM feedback | P2, P5 |
| E5 | Khaleel Ur Rehman | TBD | CRM interaction | P3 |
| T1 | Manual Approvals | Validated | Market theme (4 sources) | P4 |
| T2 | Invoice Reconciliation | Validated | Market theme (4 sources) | P2, P5 |
| T3 | ERP Silos | Validated | Market theme (3 sources) | P7 |
| T5 | Month-End Close | Validated | Market theme | P9 |
| T7 | Multi-Currency FX | Hypothesis | Market theme | P10 |
| P3 | Trust Requires Accuracy | Validated (3 sources) | Product principle | P1, P3, P6 |
| C6 | Mohamed Gamal | TBD | CRM feedback | P4, P8 |
| Constitution | Platform Constitution | 2026-07-28 | Engineering authority | P9, P3 |

---

## 8. Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PP_AP_v2.0 |
| Phase | 27.1 |
| Authority | Product Architecture Board |
| Supersedes | PERIONYX_PRODUCT_PRINCIPLES.md (AP scope) |
| Inherits By | AR, Treasury, Financial Close, Compliance, Banking, Financial Intelligence |
| Validation Coverage | 8/10 Validated or Working, 2/10 Hypothesis (P10) |
| Total Evidence Sources | 12 (4 interviews, 5 market themes, 1 product principle, 1 constitutional, 1 CRM) |
| Status | Draft |
| Next Review | Phase 27.0B (AP Workflow Implementation) |
