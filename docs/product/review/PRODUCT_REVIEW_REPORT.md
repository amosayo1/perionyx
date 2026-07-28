---
title: "Product Review Report — AP Reference Workflow v2.0"
created: 2026-07-28
version: 1.0
phase: 27.1R
type: review
domain: ap
author: Independent Product Review
classification: Internal — Engineering & Product
---

# Product Review Report — AP Reference Workflow v2.0

## 1. Executive Summary

**Overall Finding:** The EPS v2.0 is structurally sound, evidence-grounded, and represents a meaningful simplification from v1.0. However, it retains significant complexity in its stage decomposition that will manifest as unnecessary UI surfaces, redundant state transitions, and cognitive friction during implementation.

The workflow scores **7.0/10 for completeness and evidence grounding**, but **5.5/10 for implementation readiness** — the stage boundaries are drawn too finely for a v1.0 product, and several stages describe system internals rather than user-facing workflow steps.

**Top Issues:**

| # | Issue | Severity | Affects |
|---|-------|----------|---------|
| 1 | Stages 2 (Invoice Validated) and 3 (Three-Way Match) describe a single cognitive operation split across two stages | High | Architecture, UX, Implementation |
| 2 | Stages 6 (Payment Readiness) and 7 (Treasury Approval) are administrative separation, not user-meaningful workflow steps | High | Architecture, Persona Coverage |
| 3 | Stages 9 (GL Posting) and 10 (Audit & Reconciliation) are system operations, not user stages | Medium | User Model, Documentation |
| 4 | 5 state machines with 37 states/60 transitions exceeds the minimum viable for v1.0 | High | Implementation, Testing |
| 5 | 65 business rules is too many for MVP; ~20 are truly critical | Medium | Scope, Time-to-Value |

**Recommendation:** Conditionally approve for prototyping, with the condition that stages 2+3 are merged, stages 6+7 are merged, and stages 9+10 are merged into a single post-payment phase. This reduces the workflow from 10 stages to 7 stages without losing a single control point.

---

## 2. Workflow Architecture Review

### Stage 1: Invoice Received

| Question | Assessment |
|----------|------------|
| Is it necessary? | Yes — every payment begins here |
| Can it merge with adjacent? | No — it is the natural system boundary |
| Is the owner right? | Yes — AP Clerk is correct |
| Is the boundary clear? | Yes — receipt vs. validation is a clear line |
| Evidence | E1, T2 — well-supported |

**Verdict:** Keep. Clean boundary, correct owner, well-evidenced.

**Concern:** The word "zero manual re-keying" is aspirational. OCR accuracy for complex invoices (multi-page, handwritten fields, non-standard layouts) will require manual correction. The spec acknowledges this (85% confidence threshold) but the success criteria ("100% captured, 0% silently dropped, OCR accuracy >95%") should be caveated as 180-day target, not v1.0 requirement.

### Stage 2: Invoice Validated

| Question | Assessment |
|----------|------------|
| Is it necessary? | Necessary as an operation, not as a user-visible stage |
| Can it merge with adjacent? | **Yes — should merge with Stage 3** |
| Is the owner right? | System is correct, but if system-owned, does it need to be a stage? |
| Is the boundary clear? | Blurred with Stage 3 — evidence collection feeds directly into matching |

**Verdict:** **Merge with Stage 3.** The evidence collection in Stage 2 (PO linking, GRN query, contract extraction, history load) is preparation for the three-way match in Stage 3. These are sequential phases of a single automated operation. Presenting them as separate stages creates an artificial handoff that adds no user value — the user never interacts between them (both are system-owned). A unified "Validation & Match" stage with a progress indicator (evidence gathering → matching → result) is simpler and more honest.

**Specific evidence from spec:** Stage 2 has "Human Responsibilities: None in normal flow." Stage 3 has "Human Responsibilities: Override match result." If no human action occurs between Stage 2 and Stage 3 outputs, they are not separate stages — they are phases of one operation.

### Stage 3: Three-Way Match

| Question | Assessment |
|----------|------------|
| Is it necessary? | Yes — matching is the core control |
| Can it merge with adjacent? | Yes — with Stage 2 (see above) |
| Is the owner right? | System is correct |
| Is the boundary clear? | Clear operationally, but not user-facing |

**Verdict:** Keep as a phase, not a stage. See above.

### Stage 4: Exception Queue

| Question | Assessment |
|----------|------------|
| Is it necessary? | Yes — critical control point |
| Can it merge with adjacent? | No — exception handling is a distinct mode |
| Is the owner right? | AP Clerk/AP Manager is correct |
| Is the boundary clear? | Yes — exception is a clear workflow fork |

**Verdict:** Keep. This is the most important stage from a user perspective. The "Exceptions First" principle (P5) is well-supported by evidence (Muhammed Jamsheed, E4). The exception queue is where Perionyx differentiates.

**Concern:** The spec defines 13 exception types with 6 SLA tiers. This is too many for v1.0. Recommend v1.0 handles 5 types: PRICE_MISMATCH, QUANTITY_MISMATCH, DUPLICATE_DETECTED, MISSING_PO, APPROVAL_STALLED. The remaining 8 can be added post-launch.

### Stage 5: Approval Routing

| Question | Assessment |
|----------|------------|
| Is it necessary? | Yes — this is the central human decision point |
| Can it merge with adjacent? | No — approval is distinct from matching and payment |
| Is the owner right? | Yes — role-based approver |
| Is the boundary clear? | Yes — approval is a well-understood business function |

**Verdict:** Keep. Well-specified. The 5-tier approval chain ($1K/$10K/$50K/$250K/$250K+) is correctly derived from evidence (E1, T1).

**Concern:** The "Evidence Before Approval" principle (P6) mandates scroll/acknowledge before approval (3-second minimum). This will be polarising in user testing — some finance professionals will see it as patronising. Recommend making the 3-second rule a configurable policy (default on), not a hard-coded UX constraint. The auditor persona may prefer it; the CFO persona may resent it.

### Stage 6: Payment Readiness

| Question | Assessment |
|----------|------------|
| Is it necessary? | Depends on batch payment hypothesis (H-002 — **untested**) |
| Can it merge with adjacent? | **Yes — should merge with Stage 7** |
| Is the owner right? | Treasury Manager — but this conflicts with Stage 7 having the same owner |
| Is the boundary clear? | Blurred with Stage 7 — both owned by Treasury Manager, both about cash |

**Verdict:** **Merge with Stage 7.** Stage 6 prepares the batch; Stage 7 verifies cash and approves. Both are owned by the Treasury Manager. The distinction between "readiness" and "approval" is administrative — the Treasury Manager performs a single cognitive operation: "Is cash available to pay this batch?" Splitting this into preparation and approval creates an artificial handoff where the Treasury Manager approves their own preparation.

**Evidence concern:** H-002 (batch payment proposals) is marked **Untested** with no customer validation. If batch proposals are invalidated, Stage 6 becomes an empty shell — individual payment execution eliminates the need for batch-level readiness. This is a P1 risk that must be validated before implementation.

### Stage 7: Treasury Approval

| Question | Assessment |
|----------|------------|
| Is it necessary? | Yes — cash verification before payment is essential |
| Can it merge with adjacent? | Yes — with Stage 6 (see above) |
| Is the owner right? | Yes — Treasury Manager |
| Is the boundary clear? | Blurred — same owner, same goal |

**Verdict:** Merge with Stage 6 into a unified "Treasury Review & Approval" stage.

### Stage 8: Payment Execution

| Question | Assessment |
|----------|------------|
| Is it necessary? | Yes — money leaving the organisation needs its own stage |
| Can it merge with adjacent? | No — execution is distinct from approval |
| Is the owner right? | System + Treasury is correct |
| Is the boundary clear? | Yes |

**Verdict:** Keep.

### Stage 9: GL Posting

| Question | Assessment |
|----------|------------|
| Is it necessary? | Necessary as a system operation, not as a user-visible stage |
| Can it merge with adjacent? | **Yes — should merge with Stage 10** |
| Is the owner right? | System + Controller — but the system does the work, the Controller reviews |
| Is the boundary clear? | Blurred with Stage 10 — both are post-payment financial close activities |

**Verdict:** **Merge with Stage 10.** GL posting is a system action that happens immediately after payment confirmation. It does not require a separate user stage. The Controller's review of GL entries is part of the broader reconciliation process, not a distinct workflow step. A combined "Financial Close" stage (or "Post-Payment Reconciliation") is more honest about what the user actually experiences.

### Stage 10: Audit & Reconciliation

| Question | Assessment |
|----------|------------|
| Is it necessary? | Yes — reconciliation closes the loop |
| Can it merge with adjacent? | Yes — with Stage 9 (see above) |
| Is the owner right? | System + Controller |
| Is the boundary clear? | Blurred — bank reconciliation and GL review are the same session |

**Verdict:** Merge with Stage 9.

### Summary of Recommended Merges

| Current | Proposed | Rationale |
|---------|----------|-----------|
| Stage 1 | Stage 1: Invoice Received | Keep |
| Stage 2 + Stage 3 | Stage 2: Validation & Match | Merge — same system operation, no human handoff |
| Stage 4 | Stage 3: Exception Queue | Keep |
| Stage 5 | Stage 4: Approval Routing | Keep |
| Stage 6 + Stage 7 | Stage 5: Treasury Review & Approval | Merge — same owner, same goal |
| Stage 8 | Stage 6: Payment Execution | Keep |
| Stage 9 + Stage 10 | Stage 7: Post-Payment Reconciliation | Merge — both system operations, Controller reviews once |

**Result:** 10 stages → **7 stages**. Zero control points lost. All owners preserved. All evidence traceable.

---

## 3. Cognitive Load Analysis

### Handoff Count

| Model | Stages | Handoffs | User-Visible Stages | Avg Decisions per Stage |
|-------|--------|----------|---------------------|------------------------|
| v1.0 (14 stages) | 14 | 13 | 14 | ~3 |
| v2.0 (10 stages) | 10 | 9 | 10 | ~3 |
| Proposed (7 stages) | 7 | 6 | 7 | ~4 |

The reduction from 14 to 10 stages is a genuine improvement. The proposed 7-stage model further reduces handoff count by 33% from v2.0 while adding only 1 decision per stage on average.

### Information Source Count per Stage

A stage that requires information from 3+ sources increases cognitive load significantly:

| Stage (current) | Information Sources | Load |
|-----------------|-------------------|------|
| 1. Invoice Received | 3 (email, OCR, vendor DB) | Medium |
| 2. Invoice Validated | 4 (PO DB, GRN DB, contracts, vendor history) | High* |
| 3. Three-Way Match | 3 (invoice, PO, GRN) | Medium |
| 4. Exception Queue | 3 (match result, AI diagnosis, vendor history) | Medium |
| 5. Approval Routing | 5 (invoice, PO, GRN, vendor, budget) | High |
| 6. Payment Readiness | 4 (approved invoices, cash, forecast, discounts) | High** |
| 7. Treasury Approval | 3 (proposal, bank balance, cash forecast) | Medium |
| 8. Payment Execution | 3 (approval, bank API, idempotency) | Low |
| 9. GL Posting | 2 (payment, GL mapping) | Low |
| 10. Audit & Reconciliation | 3 (payment, bank statement, GL) | Medium |

\* Stage 2 loads 4 sources but the human never sees them (system-owned). This confirms the merge rationale — if no human sees it, it is not a stage.
\*\* Stage 6 would drop to 2 sources if merged with Stage 7 (proposal + cash forecast), reducing cognitive load.

### Key Finding

Stages where the owner is "System" should not be user-visible stages. They are phases. The current spec lists Stage 2 and Stage 3 as system-owned, meaning 20% of the workflow is invisible to the user. This is information architecture noise — the mental model should match the operational model.

---

## 4. Stage-Gate Analysis

### Current Gates

| Control Point | Stage | Severity | Gap |
|---------------|-------|----------|-----|
| Duplicate Detection | 1 | Critical | None |
| Evidence Assembly | 2 | High | Unnecessary gate — system operation, no human check |
| Three-Way Match | 3 | Critical | None |
| Exception Classification | 4 | High | None |
| SoD Enforcement | 5 | Critical | None |
| Threshold Approval | 5 | Critical | None |
| Cash Availability | 7 | Critical | None |
| Idempotency | 8 | Critical | None |
| GL Reconciliation | 9 | Medium | Should be in merged stage |
| Checksum Chain | 10 | Critical | Should be in merged stage |

### Missing Gates

| Missing Gate | Why Needed | Where |
|-------------|------------|-------|
| **Vendor Bank Verification Gate** | Payment execution uses vendor bank details. No gate verifies these are current before payment. Currently assumed from Stage 1 capture. | Between Stage 5 (Approval) and Stage 6 (Payment) |
| **Fraud Pattern Gate** | Anomaly detection (AP-AI-04) runs continuously but no explicit fraud review gate exists in the stage model. The "FRAA" (Franking) concept is implicitly in Stage 8 failure modes but not a formal gate. | Between Stage 7 (Treasury Approval) and Stage 8 (Execution) |
| **Month-End Cutoff Gate** | No explicit mechanism prevents invoices from being processed across month-end boundaries. The spec mentions "month-end close deadline" for Stage 10 but not as an active gate. | Between Stage 1 and any processing during close period |

### Duplicate Gates

| Duplicate | Problem |
|-----------|---------|
| Stage 6 + Stage 7 both gate on cash availability | Redundant — Treasury Manager verifies cash at readiness AND at approval. Once is sufficient if real-time. |

---

## 5. Recommendation

**Verdict: Conditionally approve for prototyping.**

The EPS v2.0 is a thorough, evidence-grounded specification. The simplification from 14 to 10 stages is the right direction. However, the review identifies structural issues that will compound during implementation.

### Conditions

1. **Merge Stages 2+3** into a single "Validation & Match" stage before prototyping begins.
2. **Merge Stages 6+7** into a single "Treasury Review & Approval" stage.
3. **Merge Stages 9+10** into a single "Post-Payment Reconciliation" stage.
4. **Validate H-002 (batch payment proposals)** before implementing any Stage 6-7 functionality. If invalidated, the merged Treasury stage simplifies further.
5. **Reduce exception types from 13 to 5 for v1.0**, with the remaining 8 as documented post-launch additions.

### Specific Improvements (≥5)

| # | Improvement | Source Section | Expected Benefit |
|---|-------------|----------------|------------------|
| 1 | Merge stages 2+3 → "Validation & Match" | 2. Workflow Architecture Review | Reduces user-visible stages by 1, eliminates artificial handoff, aligns mental model with operational model |
| 2 | Add vendor bank verification gate before payment | 4. Stage-Gate Analysis | Prevents payments to outdated/disputed bank accounts — currently the #1 BEC attack vector |
| 3 | Make "Evidence Before Approval" 3-second rule a configurable policy, not hard-coded UX | 2. Stage 5 Analysis | Allows CFO persona to operate at their preferred speed while maintaining audit defence |
| 4 | Replace GL Posting (Stage 9) as a user stage with an inline system notification within the merged reconciliation stage | 2. Stage 9 Analysis | Removes a stage that has no user interaction — reduces perceived complexity |
| 5 | Cap v1.0 business rules at ~25 (the truly critical ones) rather than implementing all 65 | 4. Rule Simplification | Reduces implementation time by ~60% for the workflow engine, enables faster time-to-value |
| 6 | Add explicit month-end cutoff gate between invoice receipt and processing during close periods | 4. Stage-Gate Analysis | Prevents the "mid-close invoice surprise" that causes reconciliation failures |
| 7 | Rename "Exception Queue" (Stage 4) to "Resolve Exception" — active voice, action-oriented | 2. Stage 4 Analysis | Aligns with P2 (Automate Preparation, Not Decisions) — the stage resolves, not just queues |

### Implementation Priority

```
P0 (Pre-prototype):
  - Merge stages 2+3
  - Merge stages 6+7
  - Merge stages 9+10
  - Validate H-002 (batch payments)

P1 (Prototype):
  - 7-stage workflow as documented above
  - 5 exception types (MVP)
  - 25 business rules (critical + high)
  - 3 state machines (Invoice, Approval, Exception)

P2 (v1.0):
  - Remaining exception types
  - Remaining business rules
  - Payment + Vendor state machines
  - Vendor bank verification gate

P3 (v2.0):
  - Remaining AI actions (cash flow prediction, vendor risk scoring)
  - Full 65 rule set
  - Multi-currency (if H-001 validated)
```
