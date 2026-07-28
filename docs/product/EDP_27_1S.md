---
title: "Engineering Decision Packet — Phase 27.1S EPS Stabilisation"
created: 2026-07-28
updated: 2026-07-28
version: 1.0
phase: 27.1S
type: decision
domain: product, workflow, ai
author: Product Architecture Board
classification: Internal — Engineering & Product
supersedes: EDP_27_1.md (stabilisation scope)
---

# Engineering Decision Packet — Phase 27.1S EPS Stabilisation

## 1. Decision Overview

### 1.1 Context

The EPS v2.0 received Conditional Pass from Phase 27.1R Independent Product Review. The Product Architecture Board convened Phase 27.1S to resolve all P0/P1 issues, add missing controls, reduce cognitive load, and ensure cross-document consistency before external design partner review.

### 1.2 Decisions Made

| Decision | Description | Authority | Status |
|----------|-------------|-----------|--------|
| D-01 | Merge stages 2+3 into "Validation & Match"; merge stages 6+7 into "Treasury Review & Approval"; merge stages 9+10 into "Post-Payment Reconciliation" | PRODUCT_REVIEW_REPORT Rec #1-3, WORKFLOW_SIMPLIFICATION_REPORT | **ACCEPTED** |
| D-02 | Rename Stage 4 from "Exception Queue" to "Exception Resolution" | TERMINOLOGY_AUDIT T-02 | **ACCEPTED** |
| D-03 | Adopt EDP D-03 10-persona set as canonical across all 13 EPS documents | TERMINOLOGY_AUDIT §3 | **ACCEPTED** |
| D-04 | Replace universal 70% AI confidence threshold with per-capability calibrated thresholds | AI_TRUST_REVIEW §3.1, AI_CONFIDENCE_MODEL | **ACCEPTED** |
| D-05 | Simplify AI confidence from 5 levels to 3 for v1.0 | COGNITIVE_LOAD_REVIEW Rec #2 | **ACCEPTED** |
| D-06 | Defer AP-AI-06 (Cash Flow) and AP-AI-07 (Risk Score) to v2.0 | PRODUCT_DEBT_REGISTER C-03 | **ACCEPTED** |
| D-07 | Add 10 new business rules (BR-066 through BR-075), upgrade 8 from hypothesis to Working, move 8 non-rules to infrastructure | BUSINESS_RULE_AUDIT §8.4 | **ACCEPTED** |
| D-08 | Reduce MVP business rule set from 65 to 20 for Phase 21B | PRODUCT_DEBT_REGISTER C-01 | **ACCEPTED** |
| D-09 | Persona-based density for Invoice Detail (progressive disclosure by role) | COGNITIVE_LOAD_REDUCTION_REPORT §2 | **ACCEPTED** |
| D-10 | Adaptive evidence-before-approval (Strict/Standard/Trusted modes) instead of universal 3s rule | COGNITIVE_LOAD_REDUCTION_REPORT §5 | **ACCEPTED** |
| D-11 | AI explanations collapsible by default with 1-line summary | COGNITIVE_LOAD_REDUCTION_REPORT §4 | **ACCEPTED** |
| D-12 | Reduce exception types from 13 to 5 for v1.0 (PRICE_MISMATCH, QUANTITY_MISMATCH, DUPLICATE_DETECTED, MISSING_PO, APPROVAL_STALLED) | PRODUCT_REVIEW_REPORT Rec #5 | **ACCEPTED** |
| D-13 | Remove PARTIALLY_MATCHED as separate state; treat as EXCEPTION_RAISED with expected resolution date | COGNITIVE_LOAD_REVIEW Rec #9 | **ACCEPTED** |
| D-14 | 15 terminology inconsistencies resolved to 1 canonical definition each | TERMINOLOGY_AUDIT | **ACCEPTED** |

### 1.3 Excluded Decisions

| Decision | Rationale | Deferral |
|----------|-----------|----------|
| 5-question framework validation | Requires design partner interaction. Applied as checklist, not template. | Phase 27.1V (validation) |
| Department Manager persona validation | Requires design partner interaction. Configurable routing mitigates risk. | Phase 27.1V (validation) |
| Multi-currency v1.0 validation | Requires design partner interaction. Schema-forward, gate moved left to week 4. | Phase 27.1V (validation) |
| Minimum-viable vendor onboarding scope | Requires Phase 21B engineering. Exception path documented as standard path. | Phase 21B.0 |

## 2. Decision Details

### D-01: Workflow Simplification (Merges)

**Decision**: Merge 3 stage pairs → 7 stages.

**Rationale**: 3 of 10 stages describe system processes with no human interaction. 2 stages share the same owner (Treasury Manager) performing the same cognitive operation. Merges reduce user-visible stages by 30%, handoffs by 33%, without losing any control point.

**Risk**: State machine design is unaffected (state machines model entity lifecycles, not stages). Screen count reduces from 25 to ~21.

**Alternatives rejected**: Keep 10 stages (adds complexity without benefit). Keep 14 stages (too many for v1.0, already rejected in v2.0).

### D-04: Per-Capability AI Confidence

**Decision**: Replace universal 70% threshold with per-capability thresholds.

**Rationale**: Different AI capabilities have inherently different confidence distributions. OCR expects 95%+ on clean documents; matching is deterministic for available data; cash flow is inherently 55-80%. A universal threshold forces inappropriate calibration for all capabilities.

**Thresholds established**:

| Capability | High | Medium |
|------------|------|--------|
| OCR | ≥85% | 50-84% |
| Match | ≥95% | 70-94% |
| Duplicate | ≥90% | 70-89% |
| Anomaly | ≥80% | 50-79% |
| GL Coding | ≥85% | 60-84% |
| Cash Flow | ≥75% | 50-74% |
| Risk Score | No threshold | Display only |
| Audit Trail | Deterministic | N/A |

**Alternatives rejected**: Keep universal 70% (too blunt). Use 80% universal (moves threshold but same problem). Drop confidence scoring entirely (eliminates trust calibration).

### D-08: MVP Business Rule Reduction

**Decision**: Reduce Phase 21B MVP rule set from 65 to 20 non-negotiable rules.

**Rationale**: 65 rules cannot be built in a single phase. 17 of 65 are [HYPOTHESIS] — building configuration UIs for unvalidated rules is premature. 8 rules are not business rules at all (engineering SLAs, UI config, infrastructure invariants).

**MVP rule categories**:
- Structural: 4 rules (required fields, positive amount, currency, total match)
- Duplicate Prevention: 3 rules (detection, invoice number, payment prevention)
- Matching: 3 rules (3-way match, PO mapping, audit trail)
- Approval: 5 rules (3 SoD, evidence, digital signature)
- Payment: 3 rules (treasury approval, bank verification, batch total)
- Exception: 2 rules (categorisation, audit trail)

**Remaining rule tiers**: P1 (15 rules, Phase 21B+), P2 (20 rules, deferred), P3 (10 rules, deferred indefinitely).

**Alternatives rejected**: Build all 65 rules (unrealistic for single phase). Build 10 rules (too few for functional workflow).

## 3. Risk Assessment

| Risk | Likelihood | Impact | Score | Response |
|------|------------|--------|-------|----------|
| Design partner does not recognise 7-stage model | Medium | Medium | 9/25 | Show 7-stage diagram in first session. If mental model is 4-5 stages, prepare further simplification. |
| AI trust-building program insufficient for first users | Medium | Medium | 9/25 | Ship transparency mode (explanations expanded) for first 30 days. Monitor override rate weekly. |
| 20 MVP rules insufficient for functional workflow | Low | High | 6/25 | 20 rules cover invoice→approve→pay→reconcile. Remaining rules are quality/optimisation, not blocking. |
| Terminology inconsistencies reintroduced during Phase 21B | Low | Low | 2/25 | TERMINOLOGY_AUDIT as living document. Design reviews must check terminology. |
| 7-stage model conflicts with implementable state machine | Low | Low | 2/25 | State machines model entities, not stages. No impact. |

## 4. Document Registry

| Document | Purpose | Location |
|----------|---------|----------|
| EPS_STABILISATION_REPORT.md | Master stabilisation report | `docs/product/` |
| PRODUCT_CHANGELOG.md | Formal change log (57 changes) | `docs/product/` |
| TERMINOLOGY_AUDIT.md | Terminology consistency audit | `docs/product/` |
| WORKFLOW_SIMPLIFICATION_REPORT.md | 10→7 stage merge analysis | `docs/product/` |
| COGNITIVE_LOAD_REDUCTION_REPORT.md | Cognitive load reduction design | `docs/product/` |
| AI_CONFIDENCE_MODEL.md | Per-capability confidence architecture | `docs/product/` |
| EDP_27_1S.md | This decision packet | `docs/product/` |

## 5. Sign-Off

| Role | Sign-Off |
|------|----------|
| Product Director | — (pending) |
| Engineering Lead | — (pending) |
| Design Lead | — (pending) |
| AI/ML Lead | — (pending) |

Sign-off confirms that the EPS v2.1 stabilisation meets all exit criteria from Phase 27.1R and is ready for external design partner review.

---

*End of Engineering Decision Packet — Phase 27.1S*
