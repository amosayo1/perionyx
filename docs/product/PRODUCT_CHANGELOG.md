---
title: "Product Changelog — EPS v2.0 → v2.1 Stabilisation"
created: 2026-07-28
updated: 2026-07-28
version: 1.0
phase: 27.1S
type: changelog
domain: ap, product
author: Product Architecture Board
classification: Internal — Engineering & Product
---

# Product Changelog — EPS v2.0 → v2.1 Stabilisation

## Change Log Format

Each entry records: ID, date, change type, affected documents, description, rationale, and change authority.

## Category 1: Workflow Simplification (10→7 Stages)

| # | Change | Type | Documents Affected | Rationale | Authority |
|---|--------|------|-------------------|-----------|-----------|
| C-01 | Merge Stage 2 (Invoice Validated) and Stage 3 (Three-Way Match) into "Validation & Match" | Structural | ENTERPRISE_PRODUCT_SPECIFICATION_AP, REFERENCE_WORKFLOW_AP, USER_JOURNEY_LIBRARY, INFORMATION_ARCHITECTURE, AI_BEHAVIOUR_GUIDE, BUSINESS_RULE_LIBRARY, SUCCESS_METRICS | Both stages are system-owned with no human interaction. Evidence collection feeds directly into matching. The handoff between them is a system-internal state transition with no decision point. | PRODUCT_REVIEW_REPORT Rec #1, COGNITIVE_LOAD_REVIEW Rec #1 |
| C-02 | Merge Stage 6 (Payment Readiness) and Stage 7 (Treasury Approval) into "Treasury Review & Approval" | Structural | Same as C-01 | Same owner (Treasury Manager), same information (cash position), same decision (should we pay?). Administrative separation adds 30% cognitive load without adding control. | PRODUCT_REVIEW_REPORT Rec #2, COGNITIVE_LOAD_REVIEW Rec #6 |
| C-03 | Merge Stage 9 (GL Posting) and Stage 10 (Audit & Reconciliation) into "Post-Payment Reconciliation" | Structural | Same as C-01 | GL posting is a system action. Controller reviews the complete post-payment picture in one session, not two. Audit is continuous, not terminal. | PRODUCT_REVIEW_REPORT Rec #3, COGNITIVE_LOAD_REVIEW Rec #8 |
| C-04 | Rename Stage 4 from "Exception Queue" to "Exception Resolution" | Naming | Same as C-01 | "Queue" is a UI term, not a workflow stage name. "Exception Resolution" is action-oriented and aligns with P2. | TERMINOLOGY_AUDIT T-02 |
| C-05 | Renumber all stages (1→7) | Structural | Same as C-01 | Consequence of merges. All internal references updated. | — |

## Category 2: Persona Reconciliation

| # | Change | Type | Documents Affected | Rationale |
|---|--------|------|-------------------|-----------|
| C-06 | Adopt canonical 10-persona set from EDP D-03 | Structural | All 13 EPS documents | Resolves T-04 inconsistency (3 conflicting persona sets across documents). |
| C-07 | Rename "AP Accountant" to "AP Clerk" across all documents | Naming | ENTERPRISE_PRODUCT_SPECIFICATION_AP, USER_JOURNEY_LIBRARY, BUSINESS_RULE_LIBRARY, AI_BEHAVIOUR_GUIDE, REFERENCE_WORKFLOW_AP | "AP Accountant" implies seniority not present in entry-level invoice processing role. "AP Clerk" is standard industry term. |
| C-08 | Rename "AP Supervisor" to "AP Manager" across all documents | Naming | USER_JOURNEY_LIBRARY, BUSINESS_RULE_LIBRARY | Standardise with Master Spec naming. |
| C-09 | Rename "Senior Accountant" to "Department Manager" | Naming | EDP_27_1 | Align with canoncial persona set. Department Manager remains [HYPOTHESIS]. |
| C-10 | Add Department Manager to all persona lists where absent | Structural | ENTERPRISE_PRODUCT_SPECIFICATION_AP, BUSINESS_RULE_LIBRARY, USER_JOURNEY_LIBRARY | Resolves persona count inconsistency (9→10). |

## Category 3: Business Rule Changes

| # | Change | Type | Documents Affected | Rationale |
|---|--------|------|-------------------|-----------|
| C-11 | Add BR-066: Vendor Bank Change Dual Approval | New rule | BUSINESS_RULE_LIBRARY | #1 BEC attack vector. Critical gap identified by Product Review. |
| C-12 | Add BR-067: Invoice Cancellation Requires Reason | New rule | BUSINESS_RULE_LIBRARY | Audit gap. Void without reason is untraceable. |
| C-13 | Add BR-068: Vendor Notification on Invoice Rejection | New rule | BUSINESS_RULE_LIBRARY | Communication loop gap. Vendor must know invoice is rejected. |
| C-14 | Add BR-069: Partial Payment Allocation Rules | New rule | BUSINESS_RULE_LIBRARY | Not defined in v2.0. Default oldest-first. |
| C-15 | Add BR-070: Invoice Edit Constraints After Submission | New rule | BUSINESS_RULE_LIBRARY | Missing control. Edit permissions differ by state. |
| C-16 | Add BR-071: AP Data Retention Policy | New rule | BUSINESS_RULE_LIBRARY | Compliance requirement. 7/5-year retention. |
| C-17 | Add BR-072: AP Subledger-to-GL Reconciliation Frequency | New rule | BUSINESS_RULE_LIBRARY | Missing operational control. Weekly minimum. |
| C-18 | Add BR-073: Credit Memo Application Sequencing | New rule | BUSINESS_RULE_LIBRARY | Oldest-first by default. |
| C-19 | Add BR-074: Purchase Order Budget Check | New rule | BUSINESS_RULE_LIBRARY | Budget control gap. |
| C-20 | Add BR-075: User Session Timeout for Approval | New rule | BUSINESS_RULE_LIBRARY | Security control. 15-minute timeout. |
| C-21 | Upgrade 8 industry-standard rules from [HYPOTHESIS] to Working | Evidence | BUSINESS_RULE_LIBRARY | BR-013 (price tolerance), BR-014 (quantity tolerance), BR-016 (GRN window), BR-017 (service match), BR-026 (self-approve), BR-045 (Net 30), BR-055 (cut-off), BR-046 (discount). These are well-established industry practices with configurable defaults. |
| C-22 | Separate rule structure from threshold values for 12 rules | Structural | BUSINESS_RULE_LIBRARY | Rules where the core rule is valid but the threshold default is unvalidated. Structure marked as Working, thresholds marked as configurable with [HYPOTHESIS] defaults. |
| C-23 | Move 8 non-business-rules to infrastructure specifications | Structural | BUSINESS_RULE_LIBRARY, new infrastructure spec | BR-025 (timeout), BR-040 (bulk cap), BR-041 (timeout void), BR-055 (cut-off), BR-059 (re-open), BR-061 (bulk exception), BR-062 (audit checksum), BR-064 (vendor flag). These are engineering SLAs, UI config, state machine guards, or infrastructure invariants — not business rules. |
| C-24 | Reduce MVP rule set from 65 to 20 | Structural | BUSINESS_RULE_LIBRARY | P0: 20 non-negotiable rules for functional AP workflow. P1: 15 rules (Phase 21B+). P2: 20 rules (deferred). P3: 10 rules (deferred indefinitely). |

## Category 4: AI Confidence Model

| # | Change | Type | Documents Affected | Rationale |
|---|--------|------|-------------------|-----------|
| C-25 | Replace universal 70% threshold with per-capability thresholds | Structural | AI_BEHAVIOUR_GUIDE, AI_CONFIDENCE_MODEL (new) | Each AI capability has inherently different confidence distributions. Universal threshold forces inappropriate calibration trade-offs. |
| C-26 | Simplify confidence from 5 levels to 3 | Structural | AI_BEHAVIOUR_GUIDE | Users learn 3 thresholds instead of 5 — 40% reduction in confidence literacy effort. 5-level model deferred to v2.0. |
| C-27 | Defer AP-AI-06 (Cash Flow) and AP-AI-07 (Risk Score) to v2.0 | Scope | AI_BEHAVIOUR_GUIDE | Both are [HYPOTHESIS]. 8 AI actions are too many for v1.0. Reduces AI scope from 8 to 5 capabilities. |
| C-28 | Add confidence calibration monitoring framework | New | AI_CONFIDENCE_MODEL | Detects overconfidence, underconfidence, and slow degradation. Rollback trigger defined. |
| C-29 | Add trust-building program (adoption ramp, transparency reports, training) | New | AI_BEHAVIOUR_GUIDE, AI_CONFIDENCE_MODEL | Critical gap identified by Product Review. Trust must be explicitly designed, not expected to emerge. |
| C-30 | Add downstream validation feedback loop | New | AI_BEHAVIOUR_GUIDE | Connects payment failures, GL corrections, and disputes back to AI audit. Enables detection of "high confidence but wrong." |
| C-31 | Add over-trust prevention mechanisms (variable friction, spot-checks) | New | AI_BEHAVIOUR_GUIDE | Structural controls are necessary but not sufficient for preventing automation bias. |

## Category 5: Cognitive Load Reduction

| # | Change | Type | Documents Affected | Rationale |
|---|--------|------|-------------------|-----------|
| C-32 | Persona-based density for Invoice Detail | Structural | INFORMATION_ARCHITECTURE | Each persona sees a different default view optimised for their primary decision. Approver sees ~15 data points instead of ~100. |
| C-33 | AI explanations collapsible by default with 1-line summary | UX | AI_BEHAVIOUR_GUIDE, INFORMATION_ARCHITECTURE | Prevents explainability fatigue. Full 5-question format preserved on demand. |
| C-34 | Adaptive evidence-before-approval rule (Strict/Standard/Trusted) | UX | REFERENCE_WORKFLOW_AP, INFORMATION_ARCHITECTURE | Replaces universal 3-second rule. Experienced users skip wait time on routine invoices. |
| C-35 | Reduce exception types from 13 to 5 for v1.0 | Scope | REFERENCE_WORKFLOW_AP, BUSINESS_RULE_LIBRARY, INFORMATION_ARCHITECTURE | 13 exception types is too many for v1.0 UI. Remaining 8 deferred to post-launch. |
| C-36 | Remove PARTIALLY_MATCHED as separate invoice state | Structural | WORKFLOW_STATE_MACHINE | Treat partial delivery as EXCEPTION_RAISED with expected resolution date. Eliminates ambiguity between MATCHED and PARTIALLY_MATCHED. |
| C-37 | Colour-code exception queue by category | UX | INFORMATION_ARCHITECTURE | Red (financial), Amber (process), Blue (compliance), Grey (low impact). Enables visual pattern matching. |

## Category 6: Terminology Standardisation

| # | Change | Type | Documents Affected |
|---|--------|------|-------------------|
| C-38 | Standardise "Exception Queue" → "Exception Resolution" (stage name) | Naming | REFERENCE_WORKFLOW_AP, INFORMATION_ARCHITECTURE, ENTERPRISE_PRODUCT_SPECIFICATION_AP |
| C-39 | Standardise "Stage/Phase/Step" → "Stage" only for workflow decomposition | Naming | All 13 EPS documents |
| C-40 | Standardise "Exception/Discrepancy/Variance" → Exception (item), Variance (line-level) | Naming | REFERENCE_WORKFLOW_AP, AI_BEHAVIOUR_GUIDE, BUSINESS_RULE_LIBRARY |
| C-41 | Standardise "Three-Way Match / 3-Way Match / 3WM" → "Three-Way Match" | Naming | All 13 EPS documents |
| C-42 | Standardise "AP Accountant / AP Specialist / AP Clerk" → "AP Clerk" | Naming | ENTERPRISE_PRODUCT_SPECIFICATION_AP, USER_JOURNEY_LIBRARY, BUSINESS_RULE_LIBRARY, AI_BEHAVIOUR_GUIDE |
| C-43 | Standardise "Approval Chain / Routing / Path" → "Approval Routing" (process), "Approval Chain" (list) | Naming | REFERENCE_WORKFLOW_AP, USER_JOURNEY_LIBRARY, WORKFLOW_STATE_MACHINE |
| C-44 | Standardise "Evidence Panel / Section / Tab" → "Evidence Panel" | Naming | INFORMATION_ARCHITECTURE |
| C-45 | Standardise "Functional Currency / Base Currency / Company Currency" → "Functional Currency" | Naming | REFERENCE_WORKFLOW_AP, BUSINESS_RULE_LIBRARY |
| C-46 | Standardise "GL Posting / Journal Entry Creation / General Ledger Posting" → "GL Posting" | Naming | All documents |
| C-47 | Standardise "Audit Trail / Log / Record" → "Audit Trail" (view), "Audit Record" (data), "Audit Log" (table) | Naming | REFERENCE_WORKFLOW_AP, WORKFLOW_STATE_MACHINE, AI_BEHAVIOUR_GUIDE |
| C-48 | Standardise "Strict / Mandatory / Required" for field validation → "Required" (schema), "Mandatory" (workflow) | Naming | INFORMATION_ARCHITECTURE, BUSINESS_RULE_LIBRARY |

## Category 7: Document Metadata Updates

| # | Change | Documents Affected |
|---|--------|-------------------|
| C-49 | AI_BEHAVIOUR_GUIDE: v1.0 → v2.0, status → active | AI_BEHAVIOUR_GUIDE |
| C-50 | INFORMATION_ARCHITECTURE: v1.0 → v2.0, status draft → active | INFORMATION_ARCHITECTURE |
| C-51 | DESIGN_SYSTEM_GUIDE: v1.0 → v2.0 | DESIGN_SYSTEM_GUIDE |
| C-52 | CUSTOMER_VALIDATION_PLAN: v1.0 → v2.0 | CUSTOMER_VALIDATION_PLAN |
| C-53 | OPEN_PRODUCT_HYPOTHESES: v1.0 → v2.0 | OPEN_PRODUCT_HYPOTHESES |
| C-54 | SUCCESS_METRICS: v1.0 → v2.0 | SUCCESS_METRICS |
| C-55 | WORKFLOW_STATE_MACHINE: v1.0 → v2.0, status draft → active | WORKFLOW_STATE_MACHINE |
| C-56 | EDP_27_1: v1.0 → v2.0 (stabilisation supersedes) | EDP_27_1 |
| C-57 | Fix E7 evidence label inconsistency ("Phase 20.0 Validation" vs "Ahmed Orabi") | BUSINESS_RULE_LIBRARY, ENTERPRISE_PRODUCT_SPECIFICATION_AP |

## Category 8: Exit Criteria Verification

| Criterion | Met? | Evidence |
|-----------|------|----------|
| All P0 issues resolved | ✅ | EPS_STABILISATION_REPORT §2 |
| All P1 issues resolved or explicitly deferred | ✅ | EPS_STABILISATION_REPORT §3 |
| No terminology inconsistencies remain | ✅ | TERMINOLOGY_AUDIT — 15 resolved |
| Cross-document consistency verified | ✅ | TERMINOLOGY_AUDIT §3.3 — 13 documents checked |
| EPS ready for external design partner review | ✅ | No further internal corrections needed |
| Workflow simplified (10→7 stages) | ✅ | WORKFLOW_SIMPLIFICATION_REPORT |
| Cognitive load reduced | ✅ | COGNITIVE_LOAD_REDUCTION_REPORT |
| AI confidence per-capability | ✅ | AI_CONFIDENCE_MODEL |
| Missing critical rules added | ✅ | 10 new rules (BR-066 through BR-075) |
| Hypothesis rate reduced | ✅ | 43% → 11% (28 → 8 genuine hypotheses) |
| Version metadata consistent | ✅ | All 13 documents updated to v2.0/v2.1 |

## Change Inventory

| Category | Changes | Documents Modified | Net Changes |
|----------|---------|-------------------|-------------|
| Workflow simplification | 5 | 14 | -3 stages |
| Persona reconciliation | 5 | 13 | 1 canonical set |
| Business rule changes | 14 | 3 | +10 rules, -8 moved |
| AI confidence model | 7 | 3 | 8 per-capability models |
| Cognitive load reduction | 6 | 5 | 6 UX/IA changes |
| Terminology standardisation | 11 | 13 | 15 terms standardised |
| Document metadata updates | 9 | 9 | Version/status updates |
| **Total** | **57** | **—** | **—** |

---

*End of Product Changelog — Phase 27.1S*
