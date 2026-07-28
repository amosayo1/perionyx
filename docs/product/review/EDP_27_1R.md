---
title: "Engineering Decision Packet — Phase 27.1R — Enterprise Product Review & Readiness"
created: 2026-07-28
updated: 2026-07-28
version: 1.0
phase: 27.1R
tags:
  - type/decision-packet
  - domain/product
  - domain/ap
  - status/recommendation
owner: Product Architecture Board
authority: Phase 27.1R
supersedes: null
---

# Engineering Decision Packet — Phase 27.1R — Enterprise Product Review & Readiness

> **Classification**: Restricted — Product Architecture Board
> **Phase**: 27.1R — Independent Product Review
> **Status**: Recommendations for Product Architecture Board approval
> **Authorised By**: Product Architecture Board approval required for any deviation

---

## 1. Overview

### Phase Purpose

Phase 27.1R conducted an **independent product review** of the Enterprise Product Specification (EPS) for Perionyx's AP Reference Workflow. This is a **review-only phase**. No production code was written. No EPS documents were modified. The review produced 9 independent assessment documents and this decision packet summarising 8 key architectural decisions for the Product Architecture Board (PAB).

### First Principle

> **A specification that has not survived independent review is a hypothesis, not a plan.**

The EPS v2.0 is the most comprehensive product specification Perionyx has produced. Its quality is evident in the honesty of its hypothesis tagging, the depth of its evidence traceability, and the clarity of its design decisions. But un-reviewed quality is untested quality. Phase 27.0 (Phase 20.0) demonstrated that "A-grade building blocks assembled into a B-minus product" — the review pattern prevents this outcome at the specification stage, before engineering begins.

### Scope

This packet documents **8 key decisions** that the Product Architecture Board must resolve before Phase 21B implementation can proceed. Each decision includes alternatives considered, evidence, consequences, and a recommendation.

### Companion Review Documents

| # | Document | Key Findings |
|---|----------|--------------|
| 1 | `PRODUCT_REVIEW_REPORT.md` | 10→7 stage merge recommendation, 5 structural issues |
| 2 | `PRODUCT_READINESS_SCORECARD.md` | 6.75/10 — dimensions, gaps, scores per category |
| 3 | `PRODUCT_RISK_REGISTER.md` | 20 risks ranked — 2 Critical, 9 High |
| 4 | `PRODUCT_DEBT_REGISTER.md` | 27 items — 3 P0, 10 P1, 8 P2, 6 P3 |
| 5 | `COGNITIVE_LOAD_REVIEW.md` | 10 recommendations, density reduction targets |
| 6 | `BUSINESS_RULE_AUDIT.md` | 43% hypothesis, 6 missing rules, 8 misclassified |
| 7 | `AI_TRUST_REVIEW.md` | 6/8 PASS, 2 CONDITIONAL, threshold calibration |
| 8 | `CUSTOMER_TRACEABILITY_AUDIT.md` | 1 formal interview, evidence expansion required |
| 9 | `PRODUCT_SIMPLIFICATION_REPORT.md` | MVP reduction targets across all dimensions |

---

## 2. Key Decisions

### D-01: Independent Review Before Implementation

| Field | Detail |
|-------|--------|
| **Decision** | All future EPS documents must survive an independent product review phase before any UX wireframing or engineering implementation begins. |
| **Rationale** | Phase 20.0 demonstrated that "A-grade building blocks assembled into a B-minus product" is a real risk. The review caught 27 debt items and 20 risks that would have manifested as 4-8 weeks of rework during Phase 21B. Without this gate, the cost of discovering structural issues shifts from the specification phase (2-day fix) to the implementation phase (2-week rework). |
| **Alternatives** | (a) Self-review by spec authors — rejected because blind spots are inherent. (b) Peer review within the same team — rejected because team-wide assumptions go unchallenged. (c) No review — rejected because the EPS enters implementation with known unresolved issues. |
| **Evidence** | 27 debt items found. 20 risks cataloged. 6 missing rules identified. 2 CONDITIONAL review verdicts that would have been APPROVE with evidence expansion. The review produced actionable findings that improve the specification without changing its core architecture. |
| **Impact** | Adds 1 sprint to each workflow specification phase. Saves 4-8 weeks of implementation rework per workflow. Institutionalises quality assurance at the specification layer. |
| **Decision** | **[RECOMMEND: ADOPT]** — Institutionalise as mandatory phase for every workflow specification. |

---

### D-02: Stage Count Reduction (10 → ~7)

| Field | Detail |
|-------|--------|
| **Decision** | Merge Stages 2+3 (Invoice Validated + Three-Way Match), Stages 6+7 (Payment Readiness + Treasury Approval), and Stages 9+10 (GL Posting + Audit & Reconciliation) to produce a ~7-stage workflow for v1.0. |
| **Rationale** | Stage 2 and Stage 3 are both fully automated system processes with no human handoff between them. Presenting them as separate stages creates artificial workflow complexity. Stage 6 prepares proposals; Stage 7 approves them — these are phases of a single payment decision. Stage 9 posts entries; Stage 10 reconciles — system operations, not user-facing stages. Merging reduces state machines from 37 states to ~12 and transitions from 60 to ~20. |
| **Alternatives** | (a) Keep 10 stages — rejected because cognitive load is unnecessarily high for v1.0. (b) Merge all system-owned stages (2, 3, 9, 10) into a single "System Processing" stage — rejected because Exception Queue (Stage 4) and Audit properties span the entire workflow. (c) Keep internal state distinction but present as 7 stages to users — accepted fallback if PAB prefers architectural purity. |
| **Evidence** | PRODUCT_REVIEW_REPORT.md section 2 analysis of each stage boundary. Stage 2 "Human Responsibilities: None in normal flow" — no human action between 2 and 3 means no stage boundary. Stage 10 audit is a continuous property across all stages, not a terminal stage. Simplification cuts state count by 68% and transition count by 67%. |
| **Impact** | Simpler workflow model, fewer UI surfaces, reduced implementation scope. Internal state machines retain the control points — no financial control lost. Requires coordinated update across all 13 EPS documents (C-02). |
| **Decision** | **[RECOMMEND: ADOPT]** — Merge to 7 stages for v1.0. Retain 10-stage internal model as implementation reference. |

---

### D-03: Evidence Threshold for Prototyping

| Field | Detail |
|-------|--------|
| **Decision** | Phase 21B UI implementation must not begin until a minimum of 3 formal AP practitioner interviews have been conducted and incorporated into the EPS business rules. |
| **Rationale** | The EPS rests on 1 formal interview and 8 retrofitted CRM notes. 43% of business rules are untested hypotheses. Starting implementation with this evidence base risks building features that AP practitioners do not need while missing features they do. The design partner programme (D-10) addresses this, but the programme must produce results — not just commence — before implementation. |
| **Alternatives** | (a) Begin implementation in parallel with design partner programme — rejected because findings may invalidate architectural decisions mid-sprint. (b) Conduct 5 interviews — target is ambitious but may delay programme by 4-6 weeks. (c) No threshold — rejected because Finding 1 is the single largest risk to the EPS. |
| **Evidence** | Customer Traceability Audit: only 1 formal interview. Business Rule Audit: 43% hypothesis rate. Risk Register R-02: design partner decline is Score 15. The evidence gap is the highest-risk finding in the review. |
| **Impact** | Delays Phase 21B UI implementation by 4-6 weeks. Phase 21B can begin with design partner onboarding (infrastructure, interview framework) — only UI implementation is gated. |
| **Decision** | **[RECOMMEND: ADOPT]** — Gate UI implementation on 3 completed formal interviews. Phase 21B infrastructure work may proceed. |

---

### D-04: AI Confidence Calibration

| Field | Detail |
|-------|--------|
| **Decision** | Replace the universal 70% AI confidence threshold with per-capability thresholds. Match/Validation actions: ≥85%. Prediction/Scoring actions: ≥60%. Every AI action must document its confidence calibration methodology. |
| **Rationale** | A single threshold treats deterministic operations (tolerance-based matching, field validation) identically to probabilistic predictions (cash flow forecasting, risk scoring). This produces two failure modes: over-trust in unreliable predictions and under-trust in reliable matches. Per-capability calibration matches financial domain expectations — auditors expect near-certainty on matching and tolerate uncertainty on forecasts. |
| **Alternatives** | (a) Keep universal 70% — rejected because it is wrong for both deterministic and probabilistic actions. (b) Use 80% universal — better but still conflates distinct risk profiles. (c) Use calibrated ranges per action — matches financial domain practice (GAAP/IFRS distinguishes levels of certainty for different estimate types). |
| **Evidence** | AI_TRUST_REVIEW.md per-action analysis. Match confidence: deterministic with defined tolerance ranges (95%+ achievable). Cash flow prediction: inherently probabilistic (60-70% realistic). Risk scoring: depends on data quality (hypothesis H-008). ISO 31000 risk management standards distinguish certainty levels by estimate type. |
| **Impact** | Requires AI Behaviour Guide v3.0 update. Adds confidence calibration documentation for all 8 AI actions. No architectural change — implementation parameter only. |
| **Decision** | **[RECOMMEND: ADOPT]** — Per-capability thresholds with documented calibration methodology. |

---

### D-05: Business Rule MVP — 65 → 25

| Field | Detail |
|-------|--------|
| **Decision** | Implement only 25 critical business rules in v1.0, deferring the remaining 40 to v2.0. The 25 critical rules are identified in the BUSINESS_RULE_AUDIT.md Section 3 prioritisation. |
| **Rationale** | 65 rules is too many for a v1.0 implementation. The review identified that 8 rules are not business rules at all (infrastructure or UI behaviour checks), 17 are [HYPOTHESIS], and many are enhancements (credit note netting, multi-currency allocation). The 25 critical rules cover: vendor qualification (3), invoice validation (4), matching (3), exception handling (3), approval routing (4), payment safety (4), and audit invariants (4). |
| **Alternatives** | (a) All 65 rules — rejected: 8-12 weeks implementation, high complexity, 43% unvalidated. (b) 35 rules (adding auto-approval and payment optimisation) — acceptable but pushes schedule by 3-4 weeks. (c) 25 critical rules — implementation in 4-6 weeks, covers all safety-critical controls. |
| **Evidence** | BUSINESS_RULE_AUDIT.md prioritisation matrix. 8 rules classified as infrastructure/UI (not business rules). 17 rules tagged [HYPOTHESIS] (not validated). Risk Register R-08: "65 rules is scope creep" at Score 12. |
| **Impact** | Reduces Phase 21B business rule scope by ~60%. Deferred rules are documented with trigger conditions for v2.0. All safety-critical and compliance rules are retained in the 25. |
| **Decision** | **[RECOMMEND: ADOPT]** — 25 critical rules for v1.0 with documented deferral register. |

---

### D-06: Persona Consistency

| Field | Detail |
|-------|--------|
| **Decision** | Resolve the 9 vs 10 persona discrepancy. The review recommends 6 personas for v1.0: AP Clerk, AP Manager, Controller, Treasurer, Auditor, Vendor. Department Manager is absorbed into AP Manager. CFO is covered by Controller for AP-specific concerns. |
| **Rationale** | The Department Manager persona has zero customer evidence. The CFO persona's AP-specific responsibilities (approval oversight, cash positioning) are subsets of the Controller and Treasurer personas respectively. Reducing from 9/10 to 6 eliminates the discrepancy, reduces UX design surface area, and concentrates evidence spend on personas with the strongest customer backing. |
| **Alternatives** | (a) Keep 10 — requires finding evidence for Department Manager and justifying CFO as distinct from Controller for AP context. (b) Keep 9 (exclude Vendor) — rejected: Vendor portal is a design partner priority (E7 Ahmed Orabi). (c) Go to 6 (recommended) — eliminates discrepancy, strongest evidence alignment. |
| **Evidence** | PRODUCT_DEBT_REGISTER.md P-01: Department Manager persona has zero direct evidence. READINESS_SCORECARD: persona coverage scores 6/10 — weakest dimensions are Department Manager and CFO. USER_JOURNEY_LIBRARY lists 10 but 2 personas (Department Manager, CFO) share all stages with existing personas. |
| **Impact** | Reduces persona-driven UX design scope by 30-40%. Simplifies user journey library. Resolves a P0 debt item. Department Manager and CFO concerns are documented for v2.0 persona expansion. |
| **Decision** | **[RECOMMEND: ADOPT]** — 6 personas for v1.0 (AP Clerk, AP Manager, Controller, Treasurer, Auditor, Vendor). Retain Department Manager and CFO in the persona register for v2.0. |

---

### D-07: Vendor Bank Details Change Requires Dual Approval

| Field | Detail |
|-------|--------|
| **Decision** | Add a new Critical business rule: any change to a vendor's bank account details must require dual approval (two authorised parties) before the change takes effect. Payment to a newly-added bank account must be held for a minimum 48-hour cooling period. |
| **Rationale** | Vendor bank detail fraud is one of the most common and costly financial crimes in AP. A single compromised AP Clerk account can redirect payments to fraudulent accounts. Dual approval for bank changes is a standard control in every major ERP (SAP, Oracle, NetSuite) and is required for SOC 2 Type II compliance. The EPS omitted this rule entirely. |
| **Alternatives** | (a) Single approval — standard for non-financial vendor data changes (address, contact). (b) Dual approval + cooling period — recommended: adds a time-based control after the approval. (c) Manager-only approval — less secure than dual approval because a compromised manager account bypasses all controls. |
| **Evidence** | SOC 2 Common Criteria CC6.1 (logical and physical access controls), CC7.1 (detection of security events). 2023 AFP Payments Fraud and Control Survey: 71% of organisations experienced payments fraud — vendor email/bank change compromise is the primary vector. Industry standard: SAP Fiori App "Manage Bank Details" requires dual approval. |
| **Impact** | Adds one business rule and one approval step to vendor maintenance workflow. Dual approval and 48-hour cooling period are implementation straightforward (at most 3 days engineering). Prevents a known fraud vector. |
| **Decision** | **[RECOMMEND: ADOPT]** — Add to critical business rule set for v1.0. |

---

### D-08: Review Cadence for Future Workflow Specifications

| Field | Detail |
|-------|--------|
| **Decision** | Every future workflow specification (AR, Treasury, Payroll, Fixed Assets, etc.) must undergo an independent product review phase — structurally identical to Phase 27.1R — before any implementation begins. The review phase is a mandatory gate in the workflow specification lifecycle. |
| **Rationale** | Phase 27.1R demonstrated that independent review catches issues that self-review misses: structural blind spots (stage merger opportunities), evidence gaps (43% hypothesis rate), cognitive load problems (320 data points), and security/compliance gaps (missing vendor bank change rule). The cost of this phase was 1 sprint (~2 weeks). The cost of finding these issues during implementation would have been 4-8 weeks. |
| **Alternatives** | (a) Ad-hoc reviews per workflow — inconsistent quality, skipped under schedule pressure. (b) No independent reviews — repeats Phase 20.0 pattern of "A-grade building blocks, B-minus product." (c) Mandatory independent review phase — consistent quality, predictable timeline, institutional knowledge accumulates. |
| **Evidence** | Phase 27.1R produced 9 review documents, 27 debt items, 20 risks, and 3 critical conditions — all from 1 sprint of independent analysis. PRODUCT_REVIEW_REPORT.md: the stage merge recommendation alone prevents 2-3 weeks of unnecessary implementation work per workflow. |
| **Impact** | Adds 1 sprint (2 weeks) to each workflow specification phase. Saves an estimated 4-8 weeks of implementation rework per workflow. Creates an accumulating repository of review findings across all product domains. Institutionalises Lesson 56 ("Specifications that have not survived independent review are hypotheses, not plans"). |
| **Decision** | **[RECOMMEND: ADOPT]** — Establish independent product review as a mandatory gate in the Perionyx workflow specification lifecycle. The review phase template, methodology, and rubric are documented in the Phase 27.1R deliverables. |

---

## 3. Alternatives Considered

The following architectural alternatives were evaluated and rejected during the review:

| Alternative | Rejected Because | Referenced By |
|-------------|------------------|---------------|
| Begin Phase 21B implementation without resolving evidence gaps | Risk of building wrong features is unacceptably high (Risk R-02: Score 15) | D-03 |
| Keep 10 stages with cosmetic renaming | Does not address the root cause: artificial boundaries increase cognitive load without adding financial control | D-02 |
| Universal AI threshold at 80% instead of 70% | Better but still conflates deterministic and probabilistic actions — same failure mode | D-04 |
| All 65 business rules with hypothesis removal | 17 hypothesis rules cannot be validated without evidence expansion — gates are sequential | D-05 |
| Keep 9 personas (exclude Vendor) | Vendor portal is a design partner priority (E7) — removing it contradicts customer evidence | D-06 |
| Single approval for vendor bank changes | Insufficient for SOC 2 compliance and fraud prevention — industry standard requires dual | D-07 |
| No review cadence (ad-hoc per workflow) | Predictably skipped under schedule pressure — Phase 20.0 pattern repeats | D-08 |

---

## 4. Risks

| # | Risk | Likelihood | Impact | Score | Mitigation | Decision |
|---|------|------------|--------|-------|------------|----------|
| R-01 | PAB rejects stage merge (D-02) | Medium (3) | High (4) | 12 | Present evidence: 67% transition reduction, zero control points lost. Fallback: present as 7-user-visible-stages / 10-internal-states compromise | D-02 |
| R-02 | Design partners fail to deliver 3 interviews in 4 weeks | Medium (3) | Critical (5) | 15 | Engage 4 candidates simultaneously. Prepare fallback: structured discovery interviews with 5+ non-partner finance professionals (lower quality but acceptable) | D-03 |
| R-03 | Engineering resistance to 25-rule MVP | Medium (3) | Medium (3) | 9 | Document all 40 deferred rules with triggers. PAB sign-off on v1.0 scope. Clear deferral process for unblocking | D-05 |
| R-04 | AI calibration increases implementation complexity | Low (2) | Medium (3) | 6 | Per-capability thresholds are parameter changes, not architectural changes. Calibration methodology documented in AI Behaviour Guide v3.0 | D-04 |
| R-05 | Persona reduction misses CFO-specific AP needs | Low (2) | Medium (3) | 6 | CFO AP concerns documented in v2.0 persona register. Controller persona covers CFO concerns for v1.0 | D-06 |
| R-06 | Review cadence adds schedule pressure | Medium (3) | Medium (3) | 9 | Review phase is 1 sprint (fixed). Savings from avoided rework (4-8 weeks) far exceed the investment | D-08 |
| R-07 | Vendor bank change rule overlooked during implementation | Low (2) | Critical (5) | 10 | Add to critical rule set explicitly. Mark as compliance-required in implementation backlog. Include in security review checklist | D-07 |

---

## 5. Phase Dependencies

| Phase | Dependency | Type | Owner | Due |
|-------|-----------|------|-------|-----|
| Phase 21B — AP Implementation | All 8 decisions adopted by PAB | Gate | Product Architecture Board | Week 1 post-review |
| Phase 21B — Design Partner Onboarding Sprint | D-03 (evidence threshold framework) | Prerequisite | Product Director | Week 1 |
| Phase 21B — UX Sprint | D-02 (stage count) + D-06 (persona count) resolved | Gate | Product Director | Week 4 |
| Phase 21B — Business Rule Implementation | D-05 (25-rule MVP) + D-07 (vendor bank rule) adopted | Scope Definition | Engineering Lead | Week 5 |
| Phase 21B — AI Integration | D-04 (AI Behaviour Guide v3.0) approved | Gate | AI Platform Lead | Week 4 |
| Phase 22 (next workflow specification) | D-01 + D-08 (independent review cadence established) | Process | Product Director | Before Phase 22 kickoff |
| Phase 21C — AP Intelligence | D-05 deferred 40 rules become v2.0 scope | Downstream | Product Director | Post-v1.0 |

---

## 6. Sign-off

| Role | Name | Decision | Date | Conditions |
|------|------|----------|------|------------|
| **Product Architecture Board** | [Pending] | [Adopt / Defer / Reject] | [Date] | [As applicable] |
| **Product Director** | [Pending] | [Adopt / Defer / Reject] | [Date] | [As applicable] |
| **Engineering Lead** | [Pending] | [Adopt / Defer / Reject] | [Date] | [As applicable] |
| **AI Platform Lead** | [Pending] | [Adopt / Defer / Reject] | [Date] | [As applicable] |
| **Customer Research Lead** | [Pending] | [Adopt / Defer / Reject] | [Date] | [As applicable] |

**Sign-off required for:** D-01 through D-08. Each decision may be adopted, deferred, or rejected independently. Conditional adoption must specify the conditions and verification criteria.

---

*Phase 27.1R Engineering Decision Packet — Independent Product Review*
*Recommendations for Product Architecture Board deliberation*
*2026-07-28*
