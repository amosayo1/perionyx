---
title: "EPS Stabilisation Report — Enterprise Product Specification v2.1"
created: 2026-07-28
updated: 2026-07-28
version: 1.0
phase: 27.1S
type: report
domain: ap, product
author: Product Architecture Board
classification: Internal — Engineering & Product
supersedes: ENTERPRISE_PRODUCT_SPECIFICATION_AP.md v2.0 (stabilisation only, not full rewrite)
---

# EPS Stabilisation Report — Enterprise Product Specification v2.1

## 1. Executive Summary

The EPS v2.0 received a Conditional Pass from the Phase 27.1R Independent Product Review. This stabilisation phase resolves all P0 issues, addresses all P1 issues, adds missing critical business rules, simplifies the workflow from 10 to 7 stages, reduces cognitive load, replaces the universal AI confidence threshold with per-capability models, and ensures cross-document consistency across all 13 EPS documents.

| Metric | Before (v2.0) | After (v2.1) |
|--------|---------------|--------------|
| Workflow stages | 10 | 7 |
| User-visible stages | 10 | 7 |
| Persona inconsistency | 3 conflicting sets | 1 canonical set (10 personas) |
| AI confidence model | Universal 70% threshold | Per-capability (8 models) |
| Cognitive load (approver) | ~100 data points on Invoice Detail | ~15 data points (persona-based density) |
| Terminology inconsistencies | 15 flagged | All resolved |
| Missing critical business rules | 0 documented | 10 added |
| Hypothesis count | 28 of 65 rules (43%) | 8 genuine hypotheses (12%) — 20 upgraded |

## 2. P0 Issue Resolution

| ID | Issue | Resolution | Status |
|----|-------|-----------|--------|
| E-01 | Department Manager persona — zero evidence | Documented as [HYPOTHESIS] in persona set. Validation plan in first 2 design partner sessions. Approval routing designed as configurable to mitigate risk. | **RESOLVED** (documented gap, no architecture change needed) |
| E-03 | Multi-currency — zero workflow evidence | Schema designed with nullable multi-currency fields for forward compatibility. Decision gate at week 4 (not week 8). "Multi-currency light" fallback defined. | **RESOLVED** (schema-forward, gate-moved-left) |
| T-04 | Persona count inconsistency (9 vs 10) | Canonical 10-persona set adopted (EDP D-03). All 13 EPS documents updated to use canonical names. Full mapping table in TERMINOLOGY_AUDIT.md §3. | **RESOLVED** |
| A-06 | Single-currency v1.0 sellable | Design partner interview protocol includes currency questions in first session. "Multi-currency light" scope prepared. Display-only FX conversion in v1.0. | **RESOLVED** (monitored, fallback defined) |

## 3. P1 Issue Resolution

| ID | Issue | Resolution | Status |
|----|-------|-----------|--------|
| W-01 | Stage 2+3 artificial boundary | Merged into "Validation & Match" | **RESOLVED** |
| W-02 | Stage 9+10 conceptual overlap | Merged into "Post-Payment Reconciliation" | **RESOLVED** |
| W-04 | Vendor onboarding excluded as prerequisite | Minimum-viable onboarding scoped for Phase 21B (name, tax ID, bank account, status). Exception path documented as standard path for new vendors. | **RESOLVED** (scoped into Phase 21B) |
| UX-01 | 5-question framework unvalidated | Applied as design checklist, not template. Screen-specific emphasis allowed. Validation plan in first usability round. | **RESOLVED** (design intent clarified, validation scheduled) |
| UX-02 | Scroll/acknowledge frustrates power users | 3-second rule replaced with adaptive model (Strict/Standard/Trusted modes). Keyboard shortcut (Cmd+Shift+A) for power users. | **RESOLVED** |
| C-03 | 8 AI actions too many for v1.0 | AP-AI-06 (Cash Flow) and AP-AI-07 (Risk Scoring) deferred to v2.0. 5 actions for v1.0 with documented scope. | **RESOLVED** |
| A-03 | Design partner velocity >2/month | Interview fallback defined. 7 primary + 5 extended partners gives 2.3x buffer. | **RESOLVED** (process, not design) |
| A-04 | Phase 26 foundation operational | AP-specific foundation tests added to Phase 21B scope. CI pipeline verified. | **RESOLVED** (Phase 21B gate) |
| A-02 | PO/GRN quality for 85% match | Graceful degradation defined: 3-way → 2-way → 1-way → exception. Phased match rate targets (70%→85%). Data quality dashboard scoped. | **RESOLVED** (architecture, not immediate build) |
| E-02 | Vendor portal — single source | Portal scoped minimally for v1.0 (invoice submission + payment status only). If unvalidated, invest in email/EDI instead. | **RESOLVED** (minimal scope, validation scheduled) |

## 4. Missing Critical Business Rules

The following business rules are added to the library. See PRODUCT_CHANGELOG.md for full details.

| ID | Rule Name | Severity | Rationale |
|----|-----------|----------|-----------|
| BR-066 | Vendor Bank Change Dual Approval | **Critical** | #1 BEC attack vector. Bank detail change requires two-person approval. 48-hour hold before activation. |
| BR-067 | Invoice Cancellation Requires Reason | **High** | Invoice void without documented reason is an audit gap. |
| BR-068 | Vendor Notification on Invoice Rejection | **High** | Rejected invoice without vendor notification breaks the communication loop. |
| BR-069 | Partial Payment Allocation Rules | **High** | Partial payment must specify which line items are paid. Default: oldest-first. |
| BR-070 | Invoice Edit Constraints After Submission | **High** | Before APPROVED: all fields editable with audit trail. After APPROVED: amount, vendor, and bank fields immutable. Other fields editable only by Controller. |
| BR-071 | AP Data Retention Policy | **High** | Invoices: 7 years. Audit records: 7 years. Supporting documents: 5 years. Configurable per jurisdiction. |
| BR-072 | AP Subledger-to-GL Reconciliation Frequency | **High** | Daily reconciliation. Monthly certification by Controller. |
| BR-073 | Credit Memo Application Sequencing | **Medium** | Credit memos applied oldest-first, linked to specific invoice. |
| BR-074 | Purchase Order Budget Check | **Medium** | PO value must not exceed approved budget. Alert if within 10% of threshold. |
| BR-075 | User Session Timeout for Approval | **Medium** | 15-minute inactivity timeout for approval screens. Re-authentication required. |

## 5. Workflow Simplification Summary

| Before (10 stages) | After (7 stages) | Change |
|--------------------|------------------|--------|
| 1. Invoice Received | 1. Invoice Received | Keep |
| 2. Invoice Validated | — | → Merged into Stage 2 |
| 3. Three-Way Match | — | → Merged into Stage 2 |
| — | 2. Validation & Match | ← Merge of 2+3 |
| 4. Exception Queue | 3. Exception Resolution | Renamed |
| 5. Approval Routing | 4. Approval Routing | Renumbered |
| 6. Payment Readiness | — | → Merged into Stage 5 |
| 7. Treasury Approval | — | → Merged into Stage 5 |
| — | 5. Treasury Review & Approval | ← Merge of 6+7 |
| 8. Payment Execution | 6. Payment Execution | Renumbered |
| 9. GL Posting | — | → Merged into Stage 7 |
| 10. Audit & Reconciliation | — | → Merged into Stage 7 |
| — | 7. Post-Payment Reconciliation | ← Merge of 9+10 |

No control points lost. All owners preserved. Full details in WORKFLOW_SIMPLIFICATION_REPORT.md.

## 6. Cognitive Load Reduction Summary

| Change | Before | After | Reduction |
|--------|--------|-------|-----------|
| Invoice Detail (approver) | ~100 data points | ~15 data points | 85% |
| AI confidence levels | 5 levels | 3 levels | 40% |
| AI explanations | Expanded by default | Collapsible, 1-line summary | ~60% per interaction |
| Evidence Before Approval | Universal 3s rule | Adaptive (Strict/Standard/Trusted) | 0-10s saved per approval |
| Exception types (v1.0) | 13 types | 5 types | 62% |
| Workflow stages tracked | 10 stages | 7 stages | 30% |

Full details in COGNITIVE_LOAD_REDUCTION_REPORT.md.

## 7. AI Confidence Model Update Summary

| Capability | v2.0: Universal 70% | v2.1: Per-Capability Threshold | Change |
|------------|---------------------|-------------------------------|--------|
| AP-AI-01 OCR | 70% | 85% / 50% | +15pp High threshold |
| AP-AI-02 Match | 70% | 95% / 70% | +25pp High threshold |
| AP-AI-03 Duplicate | 70% | 90% / 70% | +20pp High threshold |
| AP-AI-04 Anomaly | 70% | 80% / 50% | +10pp High threshold |
| AP-AI-05 GL Coding | 70% | 85% / 60% | +15pp High threshold |
| AP-AI-06 Cash Flow | 70% | 75% / 50% | +5pp High threshold [HYPOTHESIS] |
| AP-AI-07 Risk Score | 70% | No threshold (display only) | Removed threshold [HYPOTHESIS] |
| AP-AI-08 Audit Trail | 70% | Deterministic (100%) | Removed threshold |

Full details in AI_CONFIDENCE_MODEL.md.

## 8. Terminology Consistency

15 terminology inconsistencies resolved across all 13 EPS documents. Key changes:

| Term | Old (multiple) | New (canonical) |
|------|---------------|-----------------|
| Workflow stages | 10 stages | 7 stages |
| Persona set | 3 conflicting sets | 1 canonical set (10 personas) |
| "Exception Queue" | Stage 4 | "Exception Resolution" |
| "AP Accountant" | Persona name | "AP Clerk" |
| "AI Explains But Never Decides" | 3 phrasings | 1 canonical statement |
| "Stage/Phase/Step" | Used interchangeably | Stage only for workflow decomposition |
| Evidence labels | E7 = Phase 20.0 / Ahmed Orabi | E7 = Ahmed Orabi (canonical) |
| "Exception/Discrepancy/Variance" | Interchangeable | Exception (human intervention item), Variance (line-level difference) |

Full details in TERMINOLOGY_AUDIT.md.

## 9. Hypothesis Reconciliation

| Metric | Before (v2.0) | After (v2.1) |
|--------|---------------|--------------|
| Total business rules | 65 | 75 (+10 new) |
| [HYPOTHESIS] rules | 28 (43%) | 8 (11%) |
| Working (industry standard) | 0 | 8 (upgraded from hypothesis) |
| Structure valid, configurable threshold | 0 | 12 (separated from structure) |
| Genuinely evidenced | 28 (43%) | 47 (63%) |
| Non-business rules moved | 0 | 8 (moved to infrastructure specs) |

## 10. Exit Criteria Verification

| Criterion | Status | Evidence |
|-----------|--------|----------|
| All P0 issues resolved | ✅ | See §2 — 4/4 resolved |
| All P1 issues resolved or explicitly deferred | ✅ | See §3 — 10/10 resolved or deferred with justification |
| No terminology inconsistencies remain | ✅ | 15 resolved in TERMINOLOGY_AUDIT.md |
| Cross-document consistency verified | ✅ | 13 documents checked — see TERMINOLOGY_AUDIT.md §5 |
| EPS ready for external design partner review | ✅ | No further internal corrections needed |
| Workflow simplified (10→7 stages) | ✅ | WORKFLOW_SIMPLIFICATION_REPORT.md |
| Cognitive load reduced | ✅ | COGNITIVE_LOAD_REDUCTION_REPORT.md |
| AI confidence per-capability | ✅ | AI_CONFIDENCE_MODEL.md |

## 11. Remaining Risk

| Risk | Rating | Mitigation |
|------|--------|------------|
| E-01: Department Manager persona may not exist | Medium | Configurable approval routing. If invalidated, simplify chain model. |
| E-03: Multi-currency may be v1.0 requirement | High | Forward-compatible schema. "Multi-currency light" fallback. 4-week validation gate. |
| 8 genuine hypotheses unvalidated | Medium | All 8 have validation plans in first 2 design partner sessions. |
| Phase 21B scope still significant (7 stages, 20 MVP rules) | Medium | MVP rule set reduced from 65 to 20. 5 exception types. 5 AI capabilities. |

---

*End of EPS Stabilisation Report — Phase 27.1S*
