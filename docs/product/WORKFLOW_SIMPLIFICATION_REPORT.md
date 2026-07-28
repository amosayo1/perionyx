---
title: "Workflow Simplification Report — 10 to 7 Stages"
created: 2026-07-28
updated: 2026-07-28
version: 1.0
phase: 27.1S
type: specification
domain: ap, workflow
author: Product Architecture Board
classification: Internal — Engineering & Product
---

# Workflow Simplification Report — 10 to 7 Stages

## 1. Executive Summary

The EPS v2.0 defined a 10-stage procure-to-pay workflow. The Phase 27.1R Independent Product Review identified that 3 of 10 stages describe system processes with no human interaction — they are internal phases masquerading as user-visible workflow steps. Additionally, 2 stages describe the same cognitive operation for the same persona (Treasury Manager), creating an artificial administrative handoff.

**Decision**: Merge 3 pairs of stages → reduce from 10 to 7 stages. Zero control points lost. All owners preserved. All evidence traceable.

| Before | After | Rationale |
|--------|-------|-----------|
| 10 stages | 7 stages | 30% reduction in user-visible complexity |
| 9 handoffs | 6 handoffs | 33% reduction in cognitive switch-cost |
| 3 system-owned "stages" | 2 system-owned phases (absorbed) | Mental model now matches operational model |

## 2. Merge Analysis

### 2.1 Merge 1: Stages 2+3 → "Validation & Match"

| Aspect | Before | After |
|--------|--------|-------|
| Stage 2 | Invoice Validated (System) | — |
| Stage 3 | Three-Way Match (System) | — |
| Merged | — | Stage 2: Validation & Match (System) |

**Rationale**:
- Both stages are fully system-owned with no human interaction in the normal flow
- Stage 2 (evidence collection) is the prerequisite for Stage 3 (matching) — they are sequential phases of one automated operation
- The handoff between them is a system-internal state transition with no decision point and no human action
- Users cannot distinguish between them — the mental model of "2 invisible stages" adds cognitive overhead

**Control points preserved**:
- PO/GRN linking (was Stage 2) — now internal phase "Evidence Collection"
- Three-way match computation (was Stage 3) — now internal phase "Match Execution"
- Match result (MATCHED / TOLERANCE / EXCEPTION) — remains as stage output
- Override match result — exception routing absorbs this (was Stage 3 human override)

**Evidence**: COGNITIVE_LOAD_REVIEW §3 confirms: "The mental model penalty of having two invisible stages is real." Merge recommended by PRODUCT_REVIEW_REPORT Recommendation #1.

### 2.2 Merge 2: Stages 6+7 → "Treasury Review & Approval"

| Aspect | Before | After |
|--------|--------|-------|
| Stage 6 | Payment Readiness (Treasury Manager) | — |
| Stage 7 | Treasury Approval (Treasury Manager) | — |
| Merged | — | Stage 5: Treasury Review & Approval (Treasury Manager) |

**Rationale**:
- Both stages are owned by the same persona (Treasury Manager)
- Both stages require the same information (cash position, approved invoices, payment terms)
- The administrative separation (readiness vs approval) adds one screen transition, one decision prompt, and one cognitive checkpoint without adding information
- H-002 (batch payment proposals) is a hypothesis — if invalidated, the split becomes completely artificial
- COGNITIVE_LOAD_REVIEW §6 confirms: "Cognitive load for the Treasury Manager is artificially inflated by ~30% due to the unnecessary handoff"

**Control points preserved**:
- Payment batch preparation (was Stage 6) — internal phase "Proposal Generation"
- Cash availability verification (was Stage 7) — consolidated into a single review action
- Discount optimisation — internal, not a separate stage
- Payment scheduling — single decision within the merged stage

**Evidence**: COGNITIVE_LOAD_REVIEW §6 findings. PRODUCT_REVIEW_REPORT Recommendation #2. Risk R-13 (Department Manager persona) is separate — this merge is valid regardless of H-002 outcome.

### 2.3 Merge 3: Stages 9+10 → "Post-Payment Reconciliation"

| Aspect | Before | After |
|--------|--------|-------|
| Stage 9 | GL Posting (System) | — |
| Stage 10 | Audit & Reconciliation (System + Controller) | — |
| Merged | — | Stage 7: Post-Payment Reconciliation (System + Controller) |

**Rationale**:
- GL Posting (Stage 9) is a system action with zero human interaction in the normal flow
- The Controller's review of GL entries is part of the broader reconciliation process, not a distinct workflow step
- Audit is a continuous property spanning all stages, not a terminal stage that begins when the invoice is paid
- The Controller performs one review session for the complete post-payment picture, not two

**Control points preserved**:
- Journal entry generation (was Stage 9) — internal phase, auto-executed on payment confirmation
- Bank reconciliation (was Stage 10) — remains in merged stage
- Audit trail verification (was Stage 10) — remains, with continuous audit preservation
- Checksum chain validation (was Stage 10) — remains, with continuous audit preservation
- Close preparation (was Stage 10) — remains

**Evidence**: COGNITIVE_LOAD_REVIEW §7 confirms merge reduces Controller cognitive load by consolidating two review sessions into one. PRODUCT_REVIEW_REPORT Recommendation #3.

## 3. Before/After Comparison

### 3.1 Stage Map

```
BEFORE (10 stages):
  Invoice Received → Invoice Validated → Three-Way Match → Exception Queue → Approval Routing → Payment Readiness → Treasury Approval → Payment Execution → GL Posting → Audit & Reconciliation

AFTER (7 stages):
  Invoice Received → Validation & Match → Exception Resolution → Approval Routing → Treasury Review & Approval → Payment Execution → Post-Payment Reconciliation
```

### 3.2 Handoff Reduction

| Metric | Before (10) | After (7) | Reduction |
|--------|-------------|-----------|-----------|
| User-visible stages | 10 | 7 | 30% |
| Handoffs | 9 | 6 | 33% |
| System-owned "stages" | 3 | 0 (absorbed) | 100% |
| Owner transitions | 5 | 5 | 0% (same) |
| Decision points | 18 | 14 | 22% |
| UI screens | 25 | 21 | 16% |

### 3.3 State Machine Impact

The state machine design is **not affected** by this simplification. State machines model entity lifecycles (Invoice, Payment, Approval, Exception, Vendor), not workflow stages. Internal transitions (CAPTURED → VALIDATED → MATCHED) remain unchanged. Only the user-facing workflow presentation changes.

| State Machine | States Affected | Change |
|--------------|----------------|--------|
| Invoice | VALIDATED, MATCHED, PARTIALLY_MATCHED | No change — internal states are preserved |
| Payment | PROPOSED, APPROVED | No change |
| Approval | All | No change |
| Exception | All | No change |
| Vendor | All | No change |

## 4. Owner Mapping Verification

| Stage (After) | Owner (Before) | Owner (After) | Verified |
|---------------|----------------|---------------|----------|
| 1. Invoice Received | AP Clerk | AP Clerk | ✅ Same |
| 2. Validation & Match | System (was Stage 2+3) | System | ✅ Same |
| 3. Exception Resolution | AP Clerk / AP Manager (was Stage 4) | AP Clerk / AP Manager | ✅ Same |
| 4. Approval Routing | Approver (was Stage 5) | Approver | ✅ Same |
| 5. Treasury Review & Approval | Treasury Manager (was Stage 6+7) | Treasury Manager | ✅ Same |
| 6. Payment Execution | System + Treasury (was Stage 8) | System + Treasury | ✅ Same |
| 7. Post-Payment Reconciliation | System + Controller (was Stage 9+10) | System + Controller | ✅ Same |

**Conclusion**: All 7 owners map 1:1 to their pre-merge owners. No owner lost. No persona scope change needed.

## 5. Cognitive Load Impact

Per COGNITIVE_LOAD_REVIEW analysis:

| Persona | Before | After | Improvement |
|---------|--------|-------|-------------|
| AP Clerk | 3 stages to track | 2 stages to track | 33% fewer stages |
| AP Manager | 2 stages to track | 2 stages to track | Same (Exception + Approval) |
| Controller | 2 stages to track | 1 stage to track | 50% fewer stages |
| Treasury Manager | 2 stages to track | 1 stage to track | 50% fewer stages |
| Approver | 1 stage to track | 1 stage to track | Same |
| CFO | Oversight of 10 | Oversight of 7 | 30% simpler mental model |

## 6. Screen Impact

The 25 screens defined in INFORMATION_ARCHITECTURE.md reduce to approximately 21 screens:

| Screen | Status | Notes |
|--------|--------|-------|
| Invoice Capture | ✅ Keep (Stage 1) | — |
| Invoice Detail | ✅ Keep | Reduce cognitive load per COGNITIVE_LOAD_REDUCTION_REPORT |
| Validation Progress | 🗑️ Remove (was Stage 2) | Absorbed into Validation & Match progress indicator |
| Match Result | 🗑️ Remove (was Stage 3) | Absorbed into Validation & Match result view |
| Exception Queue | 🔄 Rename to "Exception Resolution" | — |
| Exception Detail | ✅ Keep | — |
| Approval Queue | ✅ Keep | — |
| Approval Detail | ✅ Keep | Adapted for 7-stage numbering |
| Payment Proposal | 🗑️ Remove (was Stage 6) | Absorbed into Treasury Review & Approval |
| Treasury Approval | 🗑️ Remove (was Stage 7) | Absorbed into Treasury Review & Approval |
| Treasury Review | ➕ New | Replaces both Proposal + Approval screens |
| Payment Execution | ✅ Keep | — |
| GL Posting | 🗑️ Remove (was Stage 9) | Absorbed into Post-Payment Reconciliation |
| Reconciliation Detail | 🔄 Rename | Was Audit & Reconciliation — merge into single screen |
| All others | ✅ Keep | Navigation, Vendors, Reports, Settings, Audit Trail unchanged |

## 7. H-002 (Batch Payment Hypothesis) Impact Assessment

The merge of Stages 6+7 is valid **regardless** of H-002 validation outcome:

| H-002 Outcome | Treasury Review & Approval Stage | Impact |
|---------------|----------------------------------|--------|
| **Validated** (batch proposals needed) | Stage contains: proposal review + cash verification + batch approval | No change to merge structure |
| **Invalidated** (individual payments only) | Stage simplifies to: cash verification + single payment approval | Stage 5 becomes simpler but still needed. Merge is still correct — the administrative split was the problem, not batching. |

The merge is robust to both outcomes. The Stage 5 screen design will differ (batch view vs individual payment list) but the stage boundary is correct either way.

## 8. Documents Requiring Update

| Document | Change Required |
|----------|----------------|
| ENTERPRISE_PRODUCT_SPECIFICATION_AP | Update §3 Stage Table (10→7), update all cross-references |
| REFERENCE_WORKFLOW_AP | Rewrite §5 to 7 stages, update notification map, recovery matrix |
| BUSINESS_RULE_LIBRARY | Update "Implementation" column stage references (BR-XXX mappings) |
| USER_JOURNEY_LIBRARY | Update all journey flows from 10 to 7 stages |
| INFORMATION_ARCHITECTURE | Update screen map, navigation model, reduce from 25 to ~21 screens |
| AI_BEHAVIOUR_GUIDE | Update stage references in §2 permissions matrix |
| WORKFLOW_STATE_MACHINE | No change needed (state machines model entities, not stages) |
| SUCCESS_METRICS | Verify stage-related metrics reference new stage numbering |
| OPEN_PRODUCT_HYPOTHESES | Update any stage-specific hypotheses |
| PRODUCT_CHANGELOG | Log all changes |

---

*End of Workflow Simplification Report — Phase 27.1S*
