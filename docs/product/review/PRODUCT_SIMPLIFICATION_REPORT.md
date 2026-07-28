---
title: "Product Simplification Report — AP Reference Workflow v2.0"
created: 2026-07-28
version: 1.0
phase: 27.1R
type: review
domain: ap
author: Independent Product Review
classification: Internal — Engineering & Product
---

# Product Simplification Report — AP Reference Workflow v2.0

## 1. Purpose

The EPS v2.0 specification is comprehensive and evidence-grounded. However, comprehensiveness carries a risk: the product becomes costly to build, complex to learn, and fragile to operate. This report identifies every opportunity to simplify the workflow before implementation begins.

The guiding question is: **What is the minimum viable product that delivers the highest-impact customer value first?**

---

## 2. Stage Duplication Analysis

### 2.1 Stage 2 (Invoice Validated) + Stage 3 (Three-Way Match): MERGE

**Current boundary:**
- Stage 2 collects evidence (PO linking, GRN query, contract extraction, vendor history)
- Stage 3 executes matching (line-by-line comparison, tolerance evaluation)

**Argument for separation:**
- Evidence collection and matching are technically distinct operations
- Evidence collection may fail (PO not found) independently of matching

**Argument for merging:**
- The user sees neither operation (both are system-owned)
- No human handoff occurs between them
- Evidence collection is a prerequisite for matching — the separation is implementation detail, not workflow design
- The single failure case (PO not found) is already handled as an exception in Stage 4

**Verdict:** Merge into a single **"Validation & Match"** stage. Evidence collection becomes a phase within this stage, not a separate stage. The user sees one outcome: match result with evidence summary.

**Fallback:** If evidence collection fails (missing PO, expired contract), the exception is routed directly to Stage 4 without the user ever seeing a "Validation" stage that has nothing to validate.

### 2.2 Stage 6 (Payment Readiness) + Stage 7 (Treasury Approval): MERGE

**Current boundary:**
- Stage 6 prepares payment proposals (batch, discount optimisation)
- Stage 7 approves proposals (cash verification, scheduling)

**Argument for separation:**
- Batch preparation and cash verification are technically distinct operations
- Batch optimisation may require different tools than cash verification
- H-002 hypothesises batch approval as a distinct step

**Argument for merging:**
- Both are owned by the Treasury Manager (same persona)
- Cash position is the primary input to both stages
- Preparing a proposal and then approving one's own proposal is an administrative formality
- The Treasury Manager makes one decision: "Can we afford to pay this batch?"

**Verdict:** Merge into a single **"Treasury Review & Approval"** stage. The proposal generation becomes an automated phase within the stage — the Treasury Manager reviews, adjusts if needed, and approves. No separate "preparation" phase.

**Critical dependency:** H-002 (batch payment proposals) is **untested**. If batch proposals are invalidated, this merged stage simplifies further — individual payment execution requires only cash verification and scheduling.

### 2.3 Stage 9 (GL Posting) + Stage 10 (Audit & Reconciliation): MERGE

**Current boundary:**
- Stage 9 posts GL entries (system action, Controller review)
- Stage 10 reconciles bank statement (system action, Controller oversight)

**Argument for separation:**
- GL posting and bank reconciliation are separate accounting functions
- They may happen at different times (GL immediately, reconciliation when statement arrives)

**Argument for merging:**
- Both are post-payment system actions reviewed by the Controller
- The Controller's mental model is "Is this payment properly recorded?" — not "Did GL post? Did reconciliation match?"
- GL posting is not a user action — it is a system operation with optional review
- In continuous close (HP5), GL and reconciliation happen concurrently, not sequentially

**Verdict:** Merge into a single **"Post-Payment Reconciliation"** stage. The Controller reviews a reconciliation package: GL entries, bank statement match, audit trail, and report updates — all in one screen, one session.

### 2.4 Summary

| Current | Proposed | Rationale | Control Points Lost |
|---------|----------|-----------|---------------------|
| 10 stages | 7 stages | All merges are system-system or same-persona-system | None |

| Merged Stage | Combines | Owner | Key Control |
|--------------|----------|-------|-------------|
| Validation & Match | 2 + 3 | System (automated) | Three-way match result |
| Treasury Review & Approval | 6 + 7 | Treasury Manager | Cash verification + batch approval |
| Post-Payment Reconciliation | 9 + 10 | Controller | GL verification + bank reconciliation + audit trail |

---

## 3. Persona Simplification

### Current Personas (9)

| Persona | Role | Distinct from? |
|---------|------|----------------|
| AP Clerk | Data entry, exception resolution | — |
| AP Manager | Oversight, delegation, escalation | AP Clerk (managerial) |
| Financial Controller | Compliance, audit, GL | — |
| Treasury Manager | Cash, payments | — |
| Procurement Manager | PO, vendor, contract | — |
| CFO | Strategic, high-value approval | — |
| Approver | Domain-level approval | Overlaps with AP Manager, Controller, CFO |
| Auditor | Audit trail, compliance | Controller (read-only) |
| Vendor | Invoice submission, status check | External |

### Simplification Analysis

**AP Clerk + AP Manager:** These are the same person in small organisations (SMEs, mid-market). The spec is oriented toward enterprise ($50M+ revenue) but the evidence sources include SMEs. For v1.0, treat AP Manager as a role-based permission set on the same persona, not a separate persona. The AP Clerk screen simply unlocks additional actions when the user has Manager permissions.

**Approver + AP Manager:** The Approver persona overlaps significantly with AP Manager, Controller, and CFO. Any of these roles can be an Approver depending on the invoice amount. The "Approver" is not a separate persona — it is a role that other personas assume temporarily.

**Auditor + Controller:** The Auditor has read-only access to the audit trail. The Controller has read-write access. These could be the same persona with permission-gated actions.

### Simplified Personas (6)

| Simplified Persona | Combines | Rationale |
|-------------------|----------|-----------|
| AP Professional | AP Clerk + AP Manager (role-gated) | Same workflow interface; manager actions unlock with permissions |
| Financial Controller | Controller + Auditor (read-gated) | Same screens; Audit mode vs. Control mode |
| Treasury Manager | Keep | Distinct function |
| Procurement Manager | Keep | Distinct function |
| CFO | Keep | Distinct function |
| Vendor | Keep | External persona |

**Impact:** The User Journey Library (10 journeys) would need revision: J1 (Invoice Receipt) and J2 (Invoice Review) merge under AP Professional. J9 (Audit Review) merges with J10 (Month-End Close) under Controller.

---

## 4. State Machine Simplification

### Current State

| Machine | States | Transitions | Complexity Index |
|---------|--------|-------------|------------------|
| Invoice | 12 | 23 | **HIGH** — central orchestrator |
| Approval | 7 | 12 | **HIGH** — multi-level chain logic |
| Payment | 8 | 11 | **MEDIUM** — linear with branching |
| Exception | 6 | 8 | **MEDIUM** — structured lifecycle |
| Vendor | 4 | 6 | **LOW** — simple lifecycle |
| **Total** | **37** | **60** | — |

### MVP State Machine Proposal (3 machines, not 5)

**Keep: Invoice State Machine** (central workflow controller)
- States: DRAFT, VALIDATED_AND_MATCHED, EXCEPTION_RAISED, AWAITING_APPROVAL, APPROVED, PAID, RECONCILED, ARCHIVED (8 states instead of 12)
- Removed: PARTIALLY_MATCHED (folded into EXCEPTION_RAISED), SCHEDULED_FOR_PAYMENT (folded into APPROVED → PAID), REJECTED (can be a terminal flag on the invoice, not a separate state)
- Transitions: ~14 instead of 23

**Keep: Approval State Machine** (multi-level chain management)
- States: PENDING, APPROVED, REJECTED, ESCALATED (4 states instead of 7)
- Removed: AWAITING_EVIDENCE (handled as comment/attachment, not a state), DELEGATED (handled as reassignment), EXPIRED (folded into ESCALATED)
- Transitions: ~6 instead of 12

**Defer: Exception State Machine** (Phase 21C)
- In v1.0, exceptions are simpler: they are flags on the invoice with a type, severity, and resolution. The full lifecycle (OPEN → INVESTIGATING → RESOLVED → CLOSED) can be a phase addition, not a v1.0 requirement.
- The current Exception machine (6 states, 8 transitions) adds implementation complexity for a feature that could be a simpler status field + assignment in v1.0.

**Defer: Payment State Machine** (Post-v1.0)
- Payment states can be tracked as status flags on the invoice: PAYMENT_PENDING, PAYMENT_EXECUTED, PAYMENT_CONFIRMED. A full Payment machine with TREASURY_REVIEW, BATCHED, and CONFIRMED states is additive complexity.
- The current 8-state Payment machine makes sense for batch processing (H-002). If batch is invalidated, the machine is over-engineered for individual payments.

**Defer: Vendor State Machine** (Phase 28 — Vendor Onboarding)
- The Vendor machine has only 4 states and is separate from the invoice workflow. It can be implemented independently.

### MVP State Machine Metrics

| Machine | States | Transitions | Status |
|---------|--------|-------------|--------|
| Invoice | 8 | 14 | Implement in v1.0 |
| Approval | 4 | 6 | Implement in v1.0 |
| Exception | Status field | — | Defer to 21C |
| Payment | Status field | — | Defer to post-v1.0 |
| Vendor | 4 | 6 | Defer to Phase 28 |
| **Total** | **12 states, 20 transitions** | — | — |

**Reduction:** 37 states → 12 (68% reduction), 60 transitions → 20 (67% reduction).

---

## 5. Rule Simplification

### Current: 65 business rules across 5 categories

| Category | Count | Critical | High | Medium | Low | [HYPOTHESIS] |
|----------|-------|----------|------|--------|-----|--------------|
| Invoice Validation | 12 | 5 | 4 | 3 | 0 | 3 |
| Three-Way Match | 13 | 5 | 4 | 2 | 2 | 2 |
| Approval | 17 | 8 | 5 | 4 | 0 | 3 |
| Payment | 13 | 4 | 5 | 3 | 1 | 4 |
| Exception | 10 | 3 | 4 | 3 | 0 | 2 |
| **Total** | **65** | **25** | **22** | **15** | **3** | **14** |

### Truly Critical Rules (MVP — ~25)

| ID | Rule | Category | Rationale |
|----|------|----------|-----------|
| BR-001 | Required invoice fields | Invoice | Without these, invoice cannot be processed |
| BR-003 | Positive amount | Invoice | Zero/negative would create accounting errors |
| BR-004 | Supported currency | Invoice | Unsupported currencies break downstream |
| BR-006 | Duplicate detection | Invoice | Prevents double payment |
| BR-008 | Due date calculation | Invoice | Payment timing cannot be calculated without this |
| BR-009 | Tax validation | Invoice | Tax errors cause compliance issues |
| BR-010 | OCR confidence review | Invoice | Low confidence data must be reviewed |
| BR-013 | 3-way match for goods | Match | Core control for goods invoices |
| BR-015 | Overall result classification | Match | Determines next stage |
| BR-016 | Line-item classification | Match | Enables exception routing |
| BR-017 | Price tolerance | Match | Configurable tolerance is the key control |
| BR-018 | Quantity tolerance | Match | Configurable tolerance for quantities |
| BR-019 | Auto-promote matched invoices | Match | Drives workflow efficiency |
| BR-020 | Create exception for RED lines | Match | Routes discrepancies to exception queue |
| BR-026 | SoD — creator cannot approve | Approval | Segregation of duties fundamental |
| BR-028 | SoD — approver authority | Approval | Prevents authority bypass |
| BR-030 | Threshold-based approval | Approval | Multi-level approval is the core control |
| BR-036 | Rejection requires reason | Approval | Audit trail completeness |
| BR-043 | Treasury approval required | Payment | Prevents unauthorised disbursement |
| BR-046 | Idempotent execution | Payment | Prevents double payment |
| BR-056 | Exception SLA enforcement | Exception | Prevents ignored exceptions |
| BR-057 | CRITICAL requires AP Manager | Exception | Escalation for high-risk items |
| BR-059 | Resolution requires reason | Exception | Audit trail completeness |
| BR-062 | Audit record checksum chain | Audit | Tamper-evident trail |
| BR-064 | Bank reconciliation match | Audit | Final control point |

**Reduction:** 65 rules → 25 (62% reduction). All critical rules preserved. [HYPOTHESIS] rules deferred until validated.

### What is cut from MVP

| Deferred Rule(s) | Why | When Added |
|------------------|-----|------------|
| BR-002 (90-day date recency) | [HYPOTHESIS] — no customer evidence | After validation |
| BR-005 (Amount reasonableness) | Nice-to-have — duplicates anomaly detection | Phase 21C |
| BR-007 (Currency validation) | Covered by BR-004 | — |
| BR-011 (Policy compliance) | [HYPOTHESIS] — policy engine not built | Phase 28 |
| BR-014 (2-way for services) | [HYPOTHESIS] — service workflow not validated | Phase 21C |
| BR-021 (Partial delivery) | Handled as exception, not special rule | — |
| BR-022-025 (Advanced match) | Edge cases — not MVP | Post-launch |
| BR-027, 029, 031-035 (Advanced approval) | Complex chains, delegation — not MVP | v2.0 |
| BR-037 (Digital signature) | Phase 17.2 cryptographic signing — over-engineered for v1.0 | v2.0 |
| BR-044, 045, 047, 048 (Advanced payment) | Payment method batching, discount capture — dependent on H-002 | Post-validation |
| BR-060, 061, 063, 065 (Advanced exception) | Full exception lifecycle — not MVP | Phase 21C |

---

## 6. AI Simplification

### Current: 8 AI Actions

| ID | Action | Stage | MVP? | Rationale |
|----|--------|-------|------|-----------|
| AP-AI-01 | Invoice Data Extraction | 1 | **MVP** | Core OCR — without this, invoice capture is manual |
| AP-AI-02 | Three-Way Match Suggestions | 3 | **MVP** | Core matching — primary automation value |
| AP-AI-03 | Duplicate Detection | 1 | **MVP** | Core control — prevents double payment |
| AP-AI-04 | Anomaly Detection | All | Defer | Additive — valuable but not v1.0-critical |
| AP-AI-05 | GL Coding Suggestions | 9 | Defer | Useful but GL coding is typically configured, not AI-suggested |
| AP-AI-06 | Cash Flow Prediction | 6 | Defer | [HYPOTHESIS] — untested, dependent on Treasury integration |
| AP-AI-07 | Vendor Risk Scoring | 5 | Defer | [HYPOTHESIS] — no customer evidence |
| AP-AI-08 | Audit Trail Analysis | 10 | Defer | Audit automation is valuable but not MVP |

### MVP AI: 3 Actions

| Action | Core Value | Implementation Complexity | Customer Impact |
|--------|-----------|--------------------------|-----------------|
| AP-AI-01 (OCR) | Eliminates manual data entry | Medium — OCR integration | High — directly addresses T2 |
| AP-AI-02 (Matching) | Eliminates manual line-by-line comparison | Medium — matching engine exists | High — directly addresses E1, E4 |
| AP-AI-03 (Duplicate Detection) | Prevents double payment | Low — deterministic + fuzzy matching | High — directly addresses T2 |

These three actions directly address the most validated customer pain points (T2: manual reconciliation, E1: oversight burden, E4: automated reconciliation desired). The remaining 5 actions are additive and can be introduced in subsequent phases without breaking the workflow.

### AI Explainability MVP

The AI Behaviour Guide specifies a comprehensive explainability model (5 questions, canonical format, collapsible sections, confidence trending). For v1.0, simplify to:

**Per-AI-Output explainability:**
```
[Field/Recommendation] extracted with [confidence]%.
Evidence: [one-line source citation].
```

This is the minimum viable explainability — it answers "what", "how confident", and "based on what". The full 5-question contract can be added in v2.0 once users request deeper explanations.

---

## 7. Simplification Roadmap

### Phase 21B — MVP (v1.0, 8-12 weeks)

| Dimension | MVP Scope |
|-----------|-----------|
| Stages | 7 (merged as recommended) |
| State Machines | 2 (Invoice + Approval) |
| Business Rules | ~25 (critical only) |
| AI Actions | 3 (OCR, Match, Duplicate) |
| Personas | 6 (simplified) |
| Exception Types | 5 (price, quantity, duplicate, missing PO, approval stalled) |
| Evidence Before Approval | Configurable (not hard-coded 3-second rule) |

### Phase 21C — v1.5 (Post-MVP, 4-6 weeks)

| Dimension | Additions |
|-----------|-----------|
| AI Actions | Add AP-AI-04 (Anomaly) and AP-AI-05 (GL Coding) |
| State Machines | Add Exception state machine (full lifecycle) |
| Exception Types | Expand from 5 to 9 |
| Business Rules | Add ~15 high-priority rules |
| Batch Payments | Add PaymentProposal aggregate (if H-002 validated) |

### Phase 21D — v2.0 (Post-MVP, 4-6 weeks)

| Dimension | Additions |
|-----------|-----------|
| AI Actions | Add AP-AI-06 (Cash Flow), AP-AI-07 (Risk), AP-AI-08 (Audit) |
| State Machines | Add Payment + Vendor state machines |
| Business Rules | Remaining ~25 rules |
| Multi-Currency | Add currency fields (if H-001 validated) |
| Evidence Before Approval | Full implementation with audit snapshot |

### What is Explicitly Out of Scope for v1.0

| Feature | Why | Expected Phase |
|---------|-----|----------------|
| Vendor self-service portal (H-003) | [HYPOTHESIS] — no evidence | Phase 28 |
| Vendor onboarding workflow | Separate workflow | Phase 28 |
| Multi-currency invoice processing (H-001) | [HYPOTHESIS] — architecture risk | v2.0 |
| Full exception lifecycle machine | Over-engineered for v1.0 | Phase 21C |
| Audit trail AI analysis | Additive | v2.0 |
| Cash flow prediction AI | [HYPOTHESIS] | v2.0 |
| Vendor risk scoring AI | [HYPOTHESIS] | v2.0 |
| Payment state machine | Over-engineered for v1.0 | v2.0 |
| Digital signatures (BR-037) | Phase 17.2 over-engineered | v2.0 |

---

## 8. Radical Simplification Option

### What If We Shipped with 5 Stages Instead of 10?

| Stage | Name | Owner | Combines from 7-stage model |
|-------|------|-------|----------------------------|
| 1 | Invoice Receipt & Validation | AP Clerk | 1 + 2 + 3 (capture → verify → match) |
| 2 | Exception Management | AP Clerk / AP Manager | 3 (exception path from Stage 2) |
| 3 | Approval | Approver | 4 |
| 4 | Payment | Treasury Manager | 5 + 6 |
| 5 | Reconciliation | Controller | 7 |

### What is Lost

| Lost Element | Impact | Mitigation |
|-------------|--------|------------|
| Separate "Validation & Match" stage | Users see "validate" as a single step — less visible progress | Progress indicator within Stage 1 |
| Separate "Treasury Approval" stage | Treasury Manager's cash check is less visible | Cash confirmation step within Stage 4 |
| Separate "GL Posting" stage | GL review is less prominent | Notification from Stage 5 to Controller |
| Stage-level granularity in audit trail | Less precise "when did X happen?" | Timestamps on every action still exist |

### What is Gained

| Gain | Impact |
|------|--------|
| 5 stages to learn instead of 10 | 50% reduction in onboarding time |
| 4 handoffs instead of 9 | 56% reduction in process friction |
| 4 user-visible decision points | Clearer "what do I do next?" |
| Faster time-to-value | ~6-8 weeks implementation instead of 8-12 |

### Verdict on Radical Simplification

**The 5-stage model is too aggressive for an enterprise AP product.** The problem is not that it loses control points — it does not — but that enterprise finance professionals expect granularity in their financial workflow. An AP Manager who is used to seeing "Invoice → Validation → Matching → Approval → Payment → Reconciliation" in their current ERP will distrust a system that presents "Invoice → Approve → Pay." The 10-stage model (and the 7-stage compromise) maps more closely to the mental model finance professionals already have.

Additionally, the 5-stage model would lose the explicit "Exception Queue" stage, which is the primary differentiator of Perionyx (P5: Exceptions First). Making exceptions a sub-stage within "Invoice Receipt & Validation" undermines the core product principle.

**Recommendation:** Implement the **7-stage model** as the minimum viable. It preserves the control points that finance professionals expect while eliminating the three artificial stage boundaries identified in this review. The 7-stage model is the sweet spot between comprehensiveness and simplicity.
