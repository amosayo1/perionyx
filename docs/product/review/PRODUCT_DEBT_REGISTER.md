# Product Debt Register — AP Reference Workflow v2.0

> **Classification**: Restricted — Internal Use Only
> **Review Date**: 2026-07-28
> **Reviewer**: Independent Product Review (Phase 27.1R)
> **Version Reviewed**: 2.0 (13 EPS documents)
> **Debt Items**: 27 (3 P0, 10 P1, 8 P2, 6 P3)

---

## 1. Debt Categories

| Category | Scope | Items |
|----------|-------|-------|
| **Workflow Debt** | Stage boundaries, state machine design, process decomposition | 7 |
| **UX Debt** | Interaction patterns, screen design, cognitive load | 4 |
| **Terminology Debt** | Inconsistent names across documents, concepts | 5 |
| **Evidence Debt** | Missing customer evidence for design decisions | 5 |
| **Complexity Debt** | Over-specified v1.0, premature optimisation | 4 |
| **Assumption Debt** | Untested high-risk assumptions | 6 |

### Priority Definitions

| Priority | Definition | Action |
|----------|-----------|--------|
| **P0** | Blocks Phase 21B implementation or invalidates a core design decision | Resolve before engineering starts |
| **P1** | Material risk to product quality or customer adoption | Resolve during Phase 21B |
| **P2** | Important but not blocking; improves quality | Schedule post-v1.0 or during slack |
| **P3** | Nice to have; long-term architectural betterment | Defer to v2.0 |

---

## 2. Workflow Debt

### W-01: Stage 2 (Invoice Validated) and Stage 3 (Three-Way Match) Separation Is Artificial

| Field | Value |
|-------|-------|
| **ID** | W-01 |
| **Type** | Workflow Debt |
| **Priority** | **P1** |
| **Description** | Stage 2 (evidence assembly) and Stage 3 (three-way match) are both fully automated system processes with no human intervention. Evidence collection IS the prerequisite for matching. The handoff between them is a system-internal state transition with no decision point, no control point, and no human action. This is not a "stage" — it is two steps within the same stage. |
| **Evidence** | EPS Reference Workflow: Stage 2 states "100% of invoices have evidence package" and Stage 3 states "for MATCHED: auto-promote to MATCHED state, proceed to Stage 5." The boundary is invisible to users. EDP D-01 consequence note acknowledges: "Stage 2+3 combined validation and matching may require splitting if system performance requires parallel evidence collection." |
| **Impact** | If users do not distinguish between validation and matching (because both are invisible automated steps), the 10-stage model feels like 9 stages. Workflow diagrams show two boxes that behave as one. |
| **Remediation** | Merge Stage 2 and 3 into a single "Evidence & Match" stage. Keep the internal state machine distinction (VALIDATED → MATCHED) but present them as a single workflow stage to users. Alternative: Rename Stage 2 to "Evidence Collection" and Stage 3 to "Match Execution" to clarify the distinction. |

---

### W-02: Stage 9 (GL Posting) and Stage 10 (Audit & Reconciliation) Conceptual Overlap

| Field | Value |
|-------|-------|
| **ID** | W-02 |
| **Type** | Workflow Debt |
| **Priority** | **P1** |
| **Description** | GL Posting (Stage 9) creates journal entries. Audit & Reconciliation (Stage 10) reconciles bank statements and verifies the audit trail. But: audit is not a stage — it is a continuous property that spans all stages. The checksum chain is built incrementally from Stage 1. Reconciliation can happen at any point (real-time bank matching is a continuous process, not a terminal stage). Calling it Stage 10 creates the incorrect mental model that audit begins when the invoice is paid. |
| **Evidence** | EPS Reference Workflow: Stage 10 includes "bank reconciliation, audit trail verification, checksum chain validation, close preparation." Bank reconciliation can occur as soon as payment is confirmed (Stage 8 completes), not only after GL posting. The audit trail is built incrementally across all 9 previous stages. |
| **Impact** | New users may assume they must wait until Stage 10 to audit, when in fact audit is continuous. The 10-stage model implies a sequential pipeline where each stage completes before the next begins — but audit is not sequential. |
| **Remediation** | Rename Stage 10 to "Period Close & Certification" — this clarifies that the terminal stage is about closing the period, not beginning the audit. Distribute "Audit" as a cross-cutting concern documented in a separate section rather than a stage. Alternative: Keep 10 stages but move audit events to each stage and rename Stage 10 to "Reconciliation & Close." |

---

### W-03: Exception Queue as Stage 4 vs. Exception as Invoice State Machine State

| Field | Value |
|-------|-------|
| **ID** | W-03 |
| **Type** | Terminology Debt / Workflow Debt |
| **Priority** | **P2** |
| **Description** | The EPS uses "Exception Queue" as Stage 4 (a workflow stage) and "EXCEPTION" / "EXCEPTION_RAISED" as a state in the Invoice State Machine. These are the same concept described at two different levels of abstraction. When an invoice enters the EXCEPTION state, it simultaneously enters Stage 4. The dual representation adds confusion without adding precision. |
| **Evidence** | Invoice State Machine (6 states): EXCEPTION state defined. Stage 4: Exception Queue defined separately. A user reading the EPS must cross-reference the stage model and the state machine to understand that they describe the same workflow position. |
| **Impact** | The EPS requires readers to maintain two mental models (flowchart + state machine) that partially overlap. This cognitive overhead is acceptable for engineers but unnecessary for a product specification. |
| **Remediation** | In the EPS, remove the Exception Queue as a separate "Stage 4" from the workflow overview. Replace with: "Exception: Invoice enters EXCEPTION state. See Section 6.4 (Exception State Machine) for lifecycle details." Keep Stage 4 in the implementation model (state machine) but not in the product model (workflow flow). |

---

### W-04: Vendor Onboarding Is a Prerequisite but Excluded from Scope

| Field | Value |
|-------|-------|
| **ID** | W-04 |
| **Type** | Workflow Debt |
| **Priority** | **P1** |
| **Description** | The EPS explicitly excludes vendor onboarding from scope ("covered in future Phase 28"). However, Stage 1 (Invoice Received) requires the vendor to exist (BR-012: Vendor status must be ACTIVE). If the vendor does not exist, the invoice is blocked. The workflow has a hard dependency on a process that does not exist. |
| **Evidence** | Stage 1 Dependencies: "Vendor must exist in system (or flagged as new for approval)." The "or flagged as new" path is an exception path ("New vendor → flag for AP Manager approval"). This means every first invoice from a new vendor goes through an exception path — which is the standard path for organisations that onboard new vendors regularly. |
| **Impact** | Every new vendor invoice follows the non-standard exception path until Phase 28 is implemented. The "happy path" assumes existing vendors, but the happy path is not the common case for growing organisations. |
| **Remediation** | Either (a) include minimum-viable vendor onboarding in Phase 21B scope (name, tax ID, bank account, status = ACTIVE) — estimated 1-2 weeks, or (b) explicitly document the exception path for first-invoice vendors as the standard path, not an exception. This is a debt item, not a design flaw — but it must be recognised in the product narrative. |

---

### W-05: Credit Notes Forced into Invoice State Machine

| Field | Value |
|-------|-------|
| **ID** | W-05 |
| **Type** | Workflow Debt |
| **Priority** | **P2** |
| **Description** | Credit notes are handled through the Invoice state machine (negative amounts trigger credit note entity type). The EPS states: "Negative amounts indicate credit notes and are handled by a separate entity type." The separate entity type exists but does not have its own state machine or workflow. Credit notes follow the same 10-stage model as invoices, but the semantics are different: a credit note reduces liability, increases accounts receivable, and may require different approval routing. |
| **Evidence** | BR-003: "Invoice amount must be positive. Zero-amount invoices are rejected. Negative amounts indicate credit notes and are handled by a separate entity type." The EPS acknowledges separation at the entity level but does not define credit note-specific workflow behaviour. |
| **Impact** | A credit note that follows the same approval routing as an invoice could be incorrectly routed (e.g., $500 credit note requires CFO approval because the corresponding invoice was $250K). The decision routing logic needs credit-note-aware rules. |
| **Remediation** | Add a credit note section to the EPS that documents: (a) which stages from the 10-stage model apply, (b) which business rules differ (threshold approval, matching direction), (c) how credit notes interact with original invoices. If credit note complexity is low across design partners, defer to v2.0 and document the known gap. |

---

### W-06: Notification Map Missing Some Stakeholders

| Field | Value |
|-------|-------|
| **ID** | W-06 |
| **Type** | Workflow Debt |
| **Priority** | **P3** |
| **Description** | The notification map (Section 8 of Reference Workflow) covers all 10 stages comprehensively. However, several notification gaps exist: (a) Vendor is not notified when invoice is rejected — the vendor portal shows "under review" indefinitely. (b) Controller is not notified when GL coding is auto-confirmed (only notified on exception). (c) CFO is not notified when a high-value exception is resolved (only when approval SLA breaches). (d) Procurement is not notified when a PO-linked invoice is paid (useful for budget tracking). |
| **Evidence** | Reference Workflow notification map: 16 notification events. Missing: rejection notification to vendor, high-value exception resolution to CFO, PO payment notification to procurement. |
| **Impact** | Low — notifications are additive, not architectural. But missing notifications create manual follow-up ("did my invoice get paid?") that the workflow aims to eliminate. |
| **Remediation** | Audit notification completeness against each user journey. For each journey, identify: what does the persona need to know, when, and through which channel? Add missing notifications to the map. |

---

### W-07: Recovery Paths Documented but Some Have No SLA or Owner

| Field | Value |
|-------|-------|
| **ID** | W-07 |
| **Type** | Workflow Debt |
| **Priority** | **P3** |
| **Description** | The Error Recovery Matrix (Section 9 of Reference Workflow) defines 25 failure modes with SLA, owner, and recovery action. Comprehensive and well-structured. But several recovery paths lack SLA or owner: (a) "Contract expired" — no SLA for contract renewal. (b) "Wrong exception resolver" — no SLA for reassignment. (c) "Discount window missed" — no specific recovery action beyond "flag for next cycle." (d) "GL adjustment entry" — recovery depends on Controller finding and correcting manually. |
| **Evidence** | Error Recovery Matrix: 25 rows. 22 of 25 have SLA. 3 have SLA = "N/A" or "Depends." All have owner. |
| **Impact** | Low — recovery paths are well-defined for the most critical failures. Minor gaps in low-severity recovery paths. |
| **Remediation** | Assign SLAs and owners to all recovery paths. Where SLA depends on external factors (e.g., contract renewal depends on procurement), document the dependency. |

---

## 3. UX Debt

### UX-01: 5-Question Framework Unvalidated with Users

| Field | Value |
|-------|-------|
| **ID** | UX-01 |
| **Type** | UX Debt |
| **Priority** | **P1** |
| **Description** | The 5-question design framework (What needs attention? Why? Evidence? Decision? Next?) is a strong design hypothesis. It is applied to every screen in the Information Architecture. It has never been tested with a finance professional. The framework sounds correct but may impose a rigid structure on screens that do not need all 5 questions, or may omit questions that users actually need. |
| **Evidence** | Information Architecture document applies the 5-question framework to all 25 screens. No user study validates the framework. This is a design principle (P8: Decision Readiness) that has been operationalised into a screen template without empirical support. |
| **Impact** | If the 5-question framework does not match user mental models, every screen must be redesigned. 25 screens × redesign effort = 4-6 weeks rework. |
| **Remediation** | Apply the 5-question framework as a design _checklist_ (does this screen answer these questions?), not a _template_ (every screen must have 5 labelled zones). Test with design partners in the first usability round. Be prepared to relax the framework for specific screens where it adds friction. |

---

### UX-02: "Evidence Before Approval" Scroll/Acknowledge May Frustrate Power Users

| Field | Value |
|-------|-------|
| **ID** | UX-02 |
| **Type** | UX Debt |
| **Priority** | **P1** |
| **Description** | The Evidence Before Approval principle (P6) requires the approve button to be disabled until the approver has scrolled through or acknowledged the evidence section (minimum 3 seconds visible). The intent is sound (prevent blind approvals) but the mechanism is untested with high-volume approvers. A Controller approving 50 invoices at month-end faces 25 minutes of forced wait time. |
| **Evidence** | P6 design rules: "Approve button is disabled until evidence panel is scrolled/acknowledged (minimum 3 seconds visible)." No exception for trusted approvers, no configurable threshold, no power-user bypass. |
| **Impact** | Medium — power users will seek workarounds (open 10 tabs, scroll each, approve all, ignore evidence). If workarounds proliferate, the mechanism fails its purpose. |
| **Remediation** | (1) Test with power users in first usability round. (2) Implement configurable evidence review modes: Strict (mandatory scroll + 3s), Standard (evidence visible, no forced delay), Trusted (evidence shown but skippable for trusted approvers). Default to Standard. (3) Ensure power users have keyboard shortcut to acknowledge evidence (e.g., Ctrl+Shift+A to acknowledge and approve in one action after evidence review). |

---

### UX-03: Data Freshness Dot Not Defined for Multi-Source Data

| Field | Value |
|-------|-------|
| **ID** | UX-03 |
| **Type** | UX Debt |
| **Priority** | **P2** |
| **Description** | P1 design rules specify a data freshness dot (green <1h, yellow 1-24h, red >24h) on every KPI card. But KPIs in the AP workflow aggregate data from multiple sources: invoice database (real-time), bank balances (API polling, potentially 15-min delay), exchange rates (daily feed), vendor credit scores (weekly update). What colour is a KPI whose invoice data is fresh (green) but bank data is 2 hours old (yellow)? The freshness dot cannot represent one source when the KPI depends on many. |
| **Evidence** | P1 design rules define freshness dot with single-source semantics. No multi-source freshness model is specified. |
| **Impact** | Low-Medium — the freshness dot is a UX enhancement, not a critical feature. But shipping a misleading indicator is worse than shipping no indicator. |
| **Remediation** | Define multi-source freshness: (a) KPI-level freshness = most important source freshness (for "Total Pending Payments," bank balance freshness is most important). (b) Show per-source freshness on hover: "Invoice data: 30s ago. Bank data: 2h ago. Exchange rate: 12h ago." (c) If any source is red (>24h), show the KPI as yellow with a tooltip indicating which source is stale. |

---

### UX-04: Empty States and First-Run Experience Not Specified

| Field | Value |
|-------|-------|
| **ID** | UX-04 |
| **Type** | UX Debt |
| **Priority** | **P2** |
| **Description** | The EPS defines 25 screens with full specification for active states. It does not define empty states (no invoices, no exceptions, no vendors) or the first-run experience (first login, first invoice upload, first approval). A user who logs into an empty AP module sees nothing — no guidance, no call to action, no "upload your first invoice." |
| **Evidence** | P8 design rule: "Empty states show the expected content structure with a call-to-action — not just 'No data'." The rule is stated but no screen-specific empty states are designed in the EPS. |
| **Impact** | Low-Medium — first-run experience can be designed during Phase 21B. But the EPS should provide guidance on the empty-state strategy, especially for the first user who has no invoice data. |
| **Remediation** | Define an empty-state strategy: (a) initial state (no data at all) shows onboarding wizard or "Upload your first invoice" call-to-action. (b) per-screen empty states show what the screen will look like with data (skeleton + "No pending approvals"). (c) "Congratulations" state after first invoice is processed: "Your first invoice has been captured. Here's what happens next." (d) Provide mock data toggle for evaluation/demo mode (already exists in platform — DataFreshnessIndicator shows "Demo Data · Seeded · not persisted"). |

---

## 4. Terminology Debt

### T-01: "Stage 2: Invoice Validated" vs. "VALIDATED" State in Invoice State Machine

| Field | Value |
|-------|-------|
| **ID** | T-01 |
| **Type** | Terminology Debt |
| **Priority** | **P2** |
| **Description** | The EPS uses "Invoice Validated" as the name of Stage 2. The Invoice State Machine uses "VALIDATED" as a state reached after Stage 2 completes. Both refer to the same concept but are documented in separate places with slightly different names. A reader cross-referencing the workflow flow vs. state machine must infer they are the same. |
| **Impact** | Low — experienced readers will connect the dots. New team members may be confused. |
| **Remediation** | In the workflow flow diagram (Section 5 of Master Spec), label each stage with the corresponding state machine state in parentheses: e.g., "Invoice Validated (→ VALIDATED state)". Add a cross-reference table mapping stages to state machine states. |

---

### T-02: "Exception Queue" (Stage 4) vs. "EXCEPTION" (Invoice State)

| Field | Value |
|-------|-------|
| **ID** | T-02 |
| **Type** | Terminology Debt |
| **Priority** | **P2** |
| **Description** | Same concept described at two levels. Stage 4 is called "Exception Queue" (a queue of invoices that need attention). The Invoice State Machine has an "EXCEPTION" state (an invoice that has a matching exception). These are the same thing — an invoice in the EXCEPTION state is in the Exception Queue. But the EPS treats them as separate concepts with separate documentation. |
| **Impact** | Medium — the EPS has two models (stage flow + state machine) that overlap at this point without explicit mapping. Readers must double-check whether "Exception Queue" and "EXCEPTION" are the same or different. |
| **Remediation** | Remove "Exception Queue" as a named stage from the workflow flow. Replace with "Exception Resolution (EXCEPTION state)" throughout. Keep the Exception Queue as a UI screen concept (list view of invoices in EXCEPTION state) — this is a UX term, not a workflow term. |

---

### T-03: "Payment Readiness" (Stage 6) vs. "PROPOSED" (Payment State)

| Field | Value |
|-------|-------|
| **ID** | T-03 |
| **Type** | Terminology Debt |
| **Priority** | **P3** |
| **Description** | Stage 6 is called "Payment Readiness." The Payment State Machine's first state is "PROPOSED." These describe the same workflow position (invoices awaiting payment, batched into a proposal). One is a product term (Payment Readiness), the other is a technical term (PROPOSED). The EPS does not map them. |
| **Impact** | Low — product and technical teams use different terminology naturally. But the gap increases cognitive overhead during implementation handoffs. |
| **Remediation** | Add a cross-reference in the EPS: "Stage 6 — Payment Readiness (maps to Payment state 'PROPOSED')." Standardise on "Payment Readiness" in product documentation and "PROPOSED" in technical documentation, with explicit mapping. |

---

### T-04: "10 Personas" (EDP D-03) vs. "9 Personas" (Master Spec Section 11)

| Field | Value |
|-------|-------|
| **ID** | T-04 |
| **Type** | Terminology Debt |
| **Priority** | **P4** (P0 for consistency) |
| **Description** | The Master Spec (Section 11) lists 9 personas. EDP D-03 lists 10 personas (adding "Senior Accountant" as distinct from "AP Accountant"). The User Journey Library uses "AP Accountant" and "AP Supervisor" — a third naming scheme. The EPS has three different persona sets across three documents. |
| **Evidence** | Master Spec: 9 personas (AP Clerk, AP Manager, Controller, Treasury Manager, Procurement Manager, CFO, Approver, Auditor, Vendor). EDP D-03: 10 personas (AP Accountant, Senior Accountant, Financial Controller, Finance Manager, Treasury, Approver, Procurement, Department Manager, Auditor, CFO). User Journey: AP Accountant, AP Supervisor, AP Manager, etc. **This is a consistency error that must be resolved before any persona-dependent work begins.** |
| **Impact** | High — if navigation model, permission model, notification preferences, and dashboard layouts are persona-driven, the persona sets must be consistent across all EPS documents. An approver's notification preferences depend on which persona document the engineering team references. |
| **Remediation** | (1) Adopt one canonical persona set across all EPS documents. Recommended: the EDP D-03 set (10 personas) as it is the most recently validated. (2) Update Master Spec Section 11 to match. (3) Provide a persona mapping table: "product persona → technical persona → permission role" to prevent future drift. (4) Update all 13 EPS documents to use the same persona set before Phase 21B. |

---

### T-05: "AI Explains But Never Decides" Has Three Phrasings

| Field | Value |
|-------|-------|
| **ID** | T-05 |
| **Type** | Terminology Debt |
| **Priority** | **P3** |
| **Description** | The core AI principle appears in three forms across documents: (a) "AI Explains But Never Decides" (AI Behaviour Guide title). (b) "Automate Preparation, Not Decisions" (P2). (c) "Preserve Human Judgement" (P3). These are not synonyms — P2 is about automation vs. decisions, P3 is about human vs. system accountability. They are frequently used interchangeably, creating the impression that the AI boundary has multiple definitions. |
| **Impact** | Low — the meanings are close enough that most readers infer correctly. But a precise AI boundary requires a single, canonical statement of what AI can and cannot do. |
| **Remediation** | Adopt "AI Explains But Never Decides" as the canonical phrasing (it is the most specific). Reference P2 and P3 as supporting principles, not alternative phrasings. Update the AI Behaviour Guide to include a "Canonical Statement" box at the top of every section. |

---

## 5. Evidence Debt

### E-01: Department Manager Persona — Zero Direct Evidence

| Field | Value |
|-------|-------|
| **ID** | E-01 |
| **Type** | Evidence Debt |
| **Priority** | **P0** |
| **Description** | The Department Manager persona drives the cross-department approval routing that is central to Stage 5. This persona has zero direct customer evidence. It is inferred from industry pattern and Phase 21.0 gap analysis. If this persona does not exist in target organisations, the entire multi-level routing model is over-engineered. |
| **Evidence** | EDP D-03: "Department Manager persona is [HYPOTHESIS] pending design partner validation." Master Spec Section 11: Department Manager is not listed (only 9 personas). EDP lists 10 personas and Department Manager is the only one not traceable to an evidence source. |
| **Impact** | High — the approval routing design (multi-level chains, delegation, escalation) assumes a user who may not exist. If AP Managers handle cross-department routing instead, the approval model simplifies significantly. |
| **Remediation** | Validate H-002 (Department Manager persona) in first 2 design partner sessions. Ask: "Who in your organisation is responsible for approving department-level invoices? Does the AP Manager route to you, or do you see invoices directly?" If Department Manager persona invalidates, simplify the approval chain model. |

---

### E-02: Vendor Portal — Single Source at Medium Confidence

| Field | Value |
|-------|-------|
| **ID** | E-02 |
| **Type** | Evidence Debt |
| **Priority** | **P1** |
| **Description** | The vendor portal (self-service invoice submission, payment status, communication) is a significant feature scope. It is supported by a single evidence source (E7 — Ahmed Orabi, CRM notes, Medium confidence). No customer has explicitly validated that they would use a vendor portal or that their vendors would use one. |
| **Evidence** | H-003 (Vendor Self-Service Portal): "No direct customer evidence. Industry pattern observed in Bill.com, Tipalti, Coupa." |
| **Impact** | Medium — the vendor portal represents significant engineering investment (API gateway, authentication, portal UI, notification routing). If adoption is <20% as projected (R-15), this investment does not deliver value. |
| **Remediation** | (1) Validate vendor portal need with design partners. Ask: "How do your vendors submit invoices today? Would they use a web portal? What would make them use it?" (2) Scope the portal minimally for v1.0: invoice submission + payment status only. Defer communication, profile management, and document upload to v2.0. (3) If portal is not validated, invest in email/EDI/API channels instead. |

---

### E-03: Multi-Currency — Zero Direct Evidence for Workflow-Level Need

| Field | Value |
|-------|-------|
| **ID** | E-03 |
| **Type** | Evidence Debt |
| **Priority** | **P0** |
| **Description** | The EPS assumes multi-currency is a workflow-level requirement (H-001). The only evidence is Ayman Shawky's "multi-currency balance aggregation" — which is a reporting need, not a workflow need. No customer has said "I need to process invoices in a different currency from my functional currency." The entire multi-currency schema (15+ fields, FX tracking, rate locking) may be premature. |
| **Evidence** | H-001: "No customer has confirmed original-currency invoice processing is a pain point." P10: "[HYPOTHESIS]." T7: "[HYPOTHESIS]." |
| **Impact** | Critical — if multi-currency is not validated as a v1.0 requirement, the Prisma schema should be simplified to single-currency (no FX tracking, no rate locking, no per-invoice currency fields). This is a P0 decision gate (EDP D-01). |
| **Remediation** | Validate H-001 in first 4 weeks with Khaleel (Saudi Arabia — cross-currency procurement likely) and Ahmed Orabi (Hikma Pharmaceuticals — multi-entity, multi-currency likely). Until validated, design schema as single-currency with nullable multi-currency extension fields. |

---

### E-04: Auditor Persona — Constitutional, Not Customer-Derived

| Field | Value |
|-------|-------|
| **ID** | E-04 |
| **Type** | Evidence Debt |
| **Priority** | **P2** |
| **Description** | The Auditor persona is supported by "Constitutional" evidence (VP4: Every Action Is Auditable) — not customer evidence. No finance professional identified auditor needs as a pain point. The Auditor persona's requirements (complete audit trail, tamper-evident chain, exportable packages) are architecturally correct but unvalidated with actual auditors. |
| **Evidence** | Master Spec Section 11 Evidence Basis: Auditor evidence source = "VP4: Every Action Is Auditable — constitutional requirement." Confidence = "Constitutional." |
| **Impact** | Low-Medium — constitutional requirements are valid design inputs. But the Auditor's specific workflow (how they verify, what they export, how they report) remains unvalidated. The EPS assumes auditors want a "complete timeline with visual indicators" — this may or may not match actual audit practice. |
| **Remediation** | Interview one auditor (via design partners or professional network) to validate: (a) how they verify AP transactions today, (b) what format they need audit packages in, (c) whether the checksum chain provides detectable value over standard audit logs. |

---

### E-05: Controller Persona — Single Source at Medium Confidence

| Field | Value |
|-------|-------|
| **ID** | E-05 |
| **Type** | Evidence Debt |
| **Priority** | **P2** |
| **Description** | The Controller persona (Financial Controller) is the primary owner of Stages 9 (GL Posting) and 10 (Audit & Reconciliation). The Controller's needs are primarily supported by E5 (Mohamed Gamal — Junior GL Accountant, CRM notes, Medium confidence). A Junior GL Accountant is not a Controller. The evidence may reflect different needs and authority levels. |
| **Evidence** | Mohamed Gamal is described as "Junior GL Accountant, Construction" in the evidence index. His pain points include "manual bank reconciliation, manual account reconciliation" — relevant to Controller tasks but at a different organisational level. |
| **Impact** | Medium — Stage 9 and 10 design decisions rest on a single source whose role is not the target persona. A Controller's workflow (review, approve, certify) differs from a Junior GL Accountant's workflow (execute, reconcile, post). |
| **Remediation** | Before Phase 21B implementation of Stages 9-10, interview or validate with a qualified Controller (not a GL Accountant). If none is available in the design partner pipeline, document the evidence gap and design Stages 9-10 to be configurable for different authority levels. |

---

## 6. Complexity Debt

### C-01: 65 Business Rules for v1.0 — Over-Specified

| Field | Value |
|-------|-------|
| **ID** | C-01 |
| **Type** | Complexity Debt |
| **Priority** | **P2** |
| **Description** | 65 business rules may be too many for v1.0. Many rules are configurable (tolerance rules, approval thresholds, SLA durations) which adds UI complexity (configuration screens, rule editors, audit logging for rule changes). The EPS does not distinguish between rules that must ship in v1.0 and rules that can ship with sensible defaults and deferred configuration. |
| **Evidence** | Business Rule Library: 65 rules across 6 categories. EDP D-05: "65 rules provides sufficient configurability without overwhelming administrators" — this is itself a hypothesis (H-003). 17 of 65 rules are [HYPOTHESIS]. |
| **Impact** | Medium — rule configuration screens may consume significant Phase 21B UX/engineering budget. If 17 rules are hypothesis (may be removed or changed), building configuration UIs for them is premature. |
| **Remediation** | Classify 65 rules into three tiers for v1.0: (a) **Hardcoded** (not configurable): BR-001 (required fields), BR-006 (duplicate block), BR-026 (SoD) — no UI needed. (b) **Default-configurable** (configurable via admin screen): BR-017 (tolerance), BR-030 (thresholds), BR-035 (SLA) — build configuration UIs. (c) **Deferred** (ship with good defaults, configuration UI in v2.0): BR-014 (2-way match), BR-033 (delegation chain), BR-048 (dual-signature) — all [HYPOTHESIS] rules should be in this tier. This reduces v1.0 configuration UI scope by ~30%. |

---

### C-02: 60 State Transitions — How Many Are Needed for Initial Release?

| Field | Value |
|-------|-------|
| **ID** | C-02 |
| **Type** | Complexity Debt |
| **Priority** | **P2** |
| **Description** | The EPS defines 60 state transitions across 5 state machines. This is comprehensive but may include transitions that are not needed for v1.0. For example, the Invoice state machine includes DISPUTED (vendor disputes invoice), ESCALATED (cross-machine), PARTIALLY_MATCHED (partial delivery). These add implementation complexity (UI states, recovery paths, audit events, tests) for scenarios that may be rare at launch. |
| **Evidence** | Workflow State Machine document: 37 states, 60 transitions across 5 machines. Not all transitions are equally likely — DISPUTED may represent <1% of invoices at v1.0. |
| **Impact** | Medium — every transition requires: state machine logic, UI representation, audit event, recovery path, test. Reducing transition count by 20% reduces implementation effort by approximately the same proportion (if transitions are independent). |
| **Remediation** | Identify transitions that can be deferred to v2.0: (a) DISPUTED → any: requires vendor communication workflow. Defer. (b) PARTIALLY_MATCHED → MATCHED: requires GRN tracking. Defer if GRN quality is low. (c) APPROVED → VOIDED: requires admin-level void authority. Defer if rare. (d) DELEGATED → any: requires delegation configuration UI. Defer to post-launch. Target: reduce to 45-50 transitions for v1.0. |

---

### C-03: 8 AI Actions — Too Many for v1.0

| Field | Value |
|-------|-------|
| **ID** | C-03 |
| **Type** | Complexity Debt |
| **Priority** | **P1** |
| **Description** | The EPS defines 8 AI actions (AP-AI-01 through AP-AI-08). Two (AP-AI-06 Cash Flow Prediction, AP-AI-07 Vendor Risk Scoring) are explicitly [HYPOTHESIS]. Building 8 AI capabilities simultaneously spreads ML engineering, training data preparation, model deployment, confidence calibration, and explainability UI across too many targets. |
| **Evidence** | AI Behaviour Guide: 8 actions specified. AP-AI-06 and AP-AI-07 marked [HYPOTHESIS]. AP-AI-05 (GL Coding) depends on order-of-magnitude more training data than other actions. |
| **Impact** | High — if all 8 AI actions are built for v1.0, AI engineering is the critical path. Quality suffers. Explainability UX for 8 different capabilities is a significant UI surface. |
| **Remediation** | Tier AI actions for v1.0: **Must ship**: AP-AI-01 (OCR), AP-AI-02 (Match), AP-AI-03 (Duplicate), AP-AI-08 (Audit). **Ship with minimal scope**: AP-AI-04 (Anomaly) — basic statistical outlier detection only, no ML. AP-AI-05 (GL Coding) — rule-based suggestions only (vendor history lookup), no ML. **Defer to v2.0**: AP-AI-06 (Cash Flow), AP-AI-07 (Risk Scoring). This reduces AI scope from 8 to 5 capabilities for v1.0. |

---

### C-04: 12 Success Metrics — Which Are Actually Measurable at Launch?

| Field | Value |
|-------|-------|
| **ID** | C-04 |
| **Type** | Complexity Debt |
| **Priority** | **P3** |
| **Description** | The EPS defines 12 success metrics. Some are measurable from day one (M-01 Invoice Processing Time — requires only timestamps). Others require infrastructure that does not exist (M-10 User Confidence Score — requires in-app survey, M-12 Audit Readiness Score — requires audit trail completeness verification job). The EPS does not distinguish between metrics that can be measured at launch vs. metrics that require post-launch instrumentation. |
| **Evidence** | Success Metrics document: 12 metrics. Measurement methods include workflow timestamps (M-01), Prisma queries (M-02, M-03), audit log analysis (M-07), in-app survey (M-10), UI telemetry (M-11). The in-app survey and UI telemetry require build work not scoped in Phase 21B. |
| **Impact** | Low — metrics infrastructure is well-specified. The gap is in phasing: which metrics are available at launch vs. which require post-launch instrumentation. Without phasing, the product team may report 0/12 metrics at launch because the last metric's infrastructure is incomplete. |
| **Remediation** | Phase metric availability: **v1.0 launch** (timestamps only): M-01, M-02, M-03, M-04, M-07, M-08, M-09. **30-day** (add audit analysis): M-05, M-06. **90-day** (add surveys/telemetry): M-10, M-11, M-12. This ensures at least 7/12 metrics are reportable at launch. |

---

## 7. High-Risk Assumptions (Accepted Debt)

These assumptions are accepted as design constraints for v1.0. They are not resolved but are explicitly acknowledged.

### A-01: OCR Accuracy at >95% for Standard Invoice Formats

| Field | Value |
|-------|-------|
| **ID** | A-01 |
| **Priority** | P1 — monitors during Phase 21B |
| **Description** | The EPS assumes OCR accuracy >95% for standard invoice formats (PDF, scanned image). This is achievable for English-language, standard-format invoices (Amazon, Stripe, common templates). It is unproven for non-English scripts, non-standard layouts, handwritten entries, or low-quality scans. |
| **Acceptance Rationale** | OCR technology is mature. 95% accuracy for English standard invoices is achievable by all major OCR vendors. The fallback (manual review for <85% confidence) is robust. The remaining risk is non-English scripts (H-009), which is separately validated. |

### A-02: PO/GRN Data Quality Sufficient for 85% Match Rate

| Field | Value |
|-------|-------|
| **ID** | A-02 |
| **Priority** | P1 — validates during Phase 21B |
| **Description** | The phased match rate target (70% at 30 days → 85% at 180 days) assumes that ERP integration returns sufficient PO/GRN data for automated matching. This depends on customer organisations maintaining accurate PO/GRN records. |
| **Acceptance Rationale** | Mid-market organisations with formal procurement processes maintain PO/GRN records. The phased target allows 180 days for data quality improvement. Graceful degradation (2-way, 1-way matching) prevents blocking. The EPS is honest about this risk (H-010). |

### A-03: Design Partner Feedback Velocity >2 Sessions/Month

| Field | Value |
|-------|-------|
| **ID** | A-03 |
| **Priority** | P1 — validates immediately |
| **Description** | The design partner programme assumes >2 structured sessions per month per partner. This is ambitious for busy finance professionals. |
| **Acceptance Rationale** | Khaleel actively requested participation. If velocity is lower, the validation timeline extends. The EPS has a fallback: "if all design partners decline, conduct structured interviews instead." The same fallback applies if engagement is slower than projected. |

### A-04: Phase 26 Foundation Is Operational

| Field | Value |
|-------|-------|
| **ID** | A-04 |
| **Priority** | P1 — validates before Phase 21B start |
| **Description** | The EPS assumes the Phase 26 foundation (RuntimeContext, graceful shutdown, metric collection, authentication) is fully operational for AP implementation. Phase 26.3 certification cleared 6 conditions but the foundation has zero production traffic. |
| **Acceptance Rationale** | 60/60 runtime tests pass. Phase 26.3 remediation is comprehensive (C-01 through C-06 resolved). The foundation is the strongest infrastructure layer Perionyx has. AP will be the first production consumer — this is acceptable if monitored. |

### A-05: Performance Acceptable at 500K Invoices per Tenant

| Field | Value |
|-------|-------|
| **ID** | A-05 |
| **Priority** | P2 — validates during Phase 21B |
| **Description** | The EPS targets 500K invoices per tenant with sub-second query performance. No benchmark validates this assumption for the modular monolith with Decimal(38,12) fields. |
| **Acceptance Rationale** | The assumption is aggressive but testable. Load testing with 500K seeded invoices (Phase 21B.2 seed system) will validate or invalidate during Phase 21B. If performance is insufficient, materialised views or read replicas can be added without architecture change. |

### A-06: Single-Currency v1.0 Is Sellable

| Field | Value |
|-------|-------|
| **ID** | A-06 |
| **Priority** | P0 — validates in first 8 weeks |
| **Description** | The EPS assumes that a single-currency v1.0 (functional currency only, no FX tracking, no multi-currency invoices) is sufficient for initial market entry. The top design partner candidates are in Saudi Arabia and UAE — regions where multi-currency operations may be the norm, not the exception. |
| **Acceptance Rationale** | This is the highest-risk assumption in the EPS. It is explicitly tested (H-001, P0 priority). If it validates, the single-currency decision is correct. If it invalidates, 12-week schedule impact. The EPS accepts this risk and has a decision gate at week 8. |

---

## 8. Prioritised Debt Items

| ID | Item | Priority | Category | Effort | Remediation |
|----|------|----------|----------|--------|-------------|
| **E-01** | Department Manager — zero evidence | **P0** | Evidence | 2 weeks (validate) | Validate H-002 in first 2 design partner sessions |
| **E-03** | Multi-currency — zero workflow evidence | **P0** | Evidence | 4 weeks (validate) | Validate H-001 before Phase 21B schema freeze |
| **T-04** | Persona count inconsistency (9 vs 10) | **P0** | Terminology | 1 week (reconcile) | Adopt EDP D-03 set, update all 13 EPS docs |
| **W-02** | Stage 9+10 conceptual overlap | **P1** | Workflow | 2 weeks (redesign) | Rename Stage 10 to "Period Close," distribute audit |
| **W-01** | Stage 2+3 artificial boundary | **P1** | Workflow | 2 weeks (merge) | Merge into "Evidence & Match," keep internal states |
| **W-04** | Vendor onboarding excluded by prerequisite | **P1** | Workflow | 1-2 weeks (add MVP) | Add minimum-viable vendor onboarding to Phase 21B |
| **UX-01** | 5-question framework unvalidated | **P1** | UX | 2 weeks (test) | Apply as checklist, not template. Test with partners |
| **UX-02** | Scroll/acknowledge may frustrate power users | **P1** | UX | 2 weeks (design) | Implement configurable review modes |
| **E-02** | Vendor portal — single source | **P1** | Evidence | 2 weeks (validate) | Validate portal need, defer if unconfirmed |
| **C-03** | 8 AI actions too many for v1.0 | **P1** | Complexity | 4 weeks (defer) | Defer AP-AI-06 and AP-AI-07 to v2.0 |
| **A-06** | Single-currency v1.0 sellable | **P0** | Assumption | 4 weeks (validate) | Validate H-001 with Khaleel + Ahmed Orabi |
| **A-03** | Design partner velocity >2/month | **P1** | Assumption | 8 weeks (monitor) | Track velocity, prepare interview fallback |
| **W-03** | Exception Queue as stage + state | **P2** | Terminology | 1 week (clarify) | Remove from workflow flow, keep in state machine |
| **W-05** | Credit notes in invoice state machine | **P2** | Workflow | 2 weeks (document) | Add credit note section to EPS |
| **UX-03** | Multi-source freshness undefined | **P2** | UX | 1 week (design) | Define multi-source freshness model |
| **UX-04** | Empty states not specified | **P2** | UX | 2 weeks (design) | Define empty-state strategy per screen |
| **T-01** | Stage 2 vs VALIDATED state naming | **P2** | Terminology | <1 week (map) | Add stage→state mapping table |
| **T-02** | Exception Queue vs EXCEPTION confusion | **P2** | Terminology | <1 week (clarify) | Remove "Exception Queue" as stage name |
| **E-04** | Auditor — constitutional, not customer | **P2** | Evidence | 2 weeks (interview) | Interview one auditor to validate needs |
| **E-05** | Controller evidence is Junior GL Accountant | **P2** | Evidence | 2 weeks (validate) | Interview a qualified Controller |
| **C-01** | 65 rules over-specified for v1.0 | **P2** | Complexity | 2 weeks (triage) | Tier rules into hardcoded/configurable/deferred |
| **C-02** | 60 transitions — trim for v1.0 | **P2** | Complexity | 2 weeks (triage) | Defer DISPUTED, PARTIAL_MATCH, DELEGATED |
| **A-02** | PO/GRN quality for 85% match | **P1** | Assumption | Throughout Phase 21B | Monitor data quality, document graceful degradation |
| **A-04** | Phase 26 foundation operational | **P1** | Assumption | Verify before Phase 21B | Run AP-specific foundation tests |
| **A-05** | 500K invoice performance | **P2** | Assumption | Phase 21B.2 | Load test with seed data, prepare MV/read replicas |
| **T-03** | Payment Readiness vs PROPOSED | **P3** | Terminology | <1 week (map) | Add cross-reference mapping |
| **T-05** | AI principle has three phrasings | **P3** | Terminology | <1 week (standardise) | Adopt "AI Explains But Never Decides" as canonical |
| **C-04** | Metrics phasing undefined | **P3** | Complexity | 1 week (plan) | Define phased metric availability (7 at launch) |
| **W-06** | Notification gaps | **P3** | Workflow | 1 week (audit) | Add missing notifications per journey audit |
| **W-07** | Recovery path SLA gaps | **P3** | Workflow | 1 week (complete) | Assign SLAs to all recovery paths |

---

## 9. Debt Acceptance

The following debt items are consciously deferred. Each has a rationale, a trigger for re-evaluation, and a target resolution phase.

| ID | Item | Deferral Rationale | Re-evaluation Trigger | Target Phase |
|----|------|-------------------|----------------------|--------------|
| W-03 | Exception Queue as separate concept | Resolved by clarifying terminology, not changing architecture | Design partner confusion about queue vs. state | v2.1 (EPS refresh) |
| W-05 | Credit notes in invoice state machine | Credit note complexity is low at launch. If >5% of transactions are credit notes, re-evaluate | Credit note volume exceeds 5% of invoice volume | v2.0 |
| W-06 | Notification gaps | Notifications are additive. Can be added without architecture change | Any design partner reports "I didn't know X happened" | Phase 21B.3 |
| W-07 | Recovery path SLA gaps | SLAs can be assigned during implementation without redesign | A recovery path without SLA is exercised in production and has no response time | Phase 21B.4 |
| UX-03 | Multi-source freshness undefined | MVP freshness indicator can be single-source (most important source) | Any user reports confusion about what "fresh" means for an aggregated metric | Phase 21B.2 |
| UX-04 | Empty states not specified | Can be designed during Phase 21B without EPS guidance | First usability test shows user confusion at empty state | Phase 21B.1 |
| T-01 | Stage→state mapping | Low impact — team will learn the mapping during implementation | Two team members disagree about which state maps to which stage | Phase 21B.0 |
| T-03 | Payment Readiness vs PROPOSED | Technical vs product terminology — teams can maintain their own mapping | Implementation handoff causes confusion about "is PROPOSED the same as Payment Readiness?" | v2.1 (EPS refresh) |
| T-05 | AI principle phrasing | All three phrasings agree on "AI does not decide." The nuance is acceptable for a product document | Any stakeholder asks "well which one is it?" | v2.1 (EPS refresh) |
| C-02 | 60 transitions — trim | Can triage transitions during implementation. Not all need v1.0 UI | Transition count threatens delivery timeline | Phase 21B.0 |
| C-04 | Metrics phasing | Phasing can be defined during metrics infrastructure build | Metrics dashboard ships with 0/12 metrics reported | Phase 21B.0 |
| A-05 | 500K invoice performance | Load test will reveal if it's a real problem. Premature optimisation is wasted effort | Load test at 100K invoices shows >3s query time | Phase 21B.2 |

---

**Total Debt: 27 items (3 P0, 10 P1, 8 P2, 6 P3)**

**Estimated remediation effort**: ~8-10 weeks total across all items. P0 items require 7 weeks (H-001 validation, H-002 validation, persona reconciliation) — all three can run in parallel with design partner programme. P1 items require ~15 weeks, P2 items ~12 weeks, P3 items ~3 weeks. Most P1-P3 items are scheduled during Phase 21B implementation and do not block the start.

**Gate**: All 3 P0 items must be resolved before Phase 21B engineering begins.

---

*End of Product Debt Register — Phase 27.1R*
