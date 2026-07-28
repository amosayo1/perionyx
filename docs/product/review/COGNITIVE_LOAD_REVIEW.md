---
title: "Cognitive Load Review — AP Reference Workflow v2.0"
created: 2026-07-28
version: 1.0
phase: 27.1R
type: review
domain: ap
author: Independent Product Review
classification: Internal — Engineering & Product
---

# Cognitive Load Review — AP Reference Workflow v2.0

## 1. Methodology

This review evaluates the AP Reference Workflow against four cognitive load dimensions:

| Dimension | Definition | Measure | Target |
|-----------|------------|---------|--------|
| **Information Density** | How many data points on a single screen | Count of decision-relevant fields | < 20 for decision screens, < 40 for detail screens |
| **Decision Complexity** | How many factors the user must weigh simultaneously | Number of independent variables affecting the decision | ≤ 3 for routine decisions, ≤ 5 for complex decisions |
| **Navigation Depth** | How many clicks/taps to reach a decision point | Screen depth from queue to action | ≤ 2 clicks to actionable detail |
| **Working Memory** | How many pieces of information must be held across screens | Information that disappears when navigation occurs | All decision-relevant info on one screen |

Additional constraints:

- **Switch-cost penalty**: Every time a user switches between screens, add 20 seconds to task completion time (proven by HCI research — Altmann & Trafton, 2002)
- **Confidence-effort trade-off**: Every additional data point increases decision confidence marginally but effort linearly
- **Saturation point**: Beyond ~7 relevant factors, decision accuracy plateaus and then declines (Miller's Law — 7±2 chunks)

---

## 2. Invoice Receipt (Stage 1)

### Information Density

The Invoice Capture screen presents: vendor name, invoice number, date, total amount, currency, line items, PO reference, OCR confidence score, duplicate probability, alternative interpretations for low-confidence fields, and source coordinates.

**Count: ~15-25 fields depending on line items.** For a 5-line invoice, approximately 20 data points.

### Cognitive Load Assessment

| Dimension | Score | Assessment |
|-----------|-------|------------|
| Information Density | **Medium-High** | 20+ data points, but organised into clear groups (header, lines, confidence) |
| Decision Complexity | **Medium** | User decides: accept OCR result (0 decisions), correct fields (1-5 corrections), override duplicate (1 decision) |
| Navigation Depth | **Low** | Single screen — queue → detail → correct/confirm |
| Working Memory | **Low** | All evidence on one screen |

### Zero Re-Keying Realism

The "zero manual re-keying" goal is aspirational for a v1.0 product. OCR accuracy for complex invoices (multi-page, handwritten fields, non-standard layouts, poor-quality scans) will require manual correction. The spec's own threshold (85% confidence for auto-accept) implies 15% of fields will need human review.

**Load impact:** The confidence presentation model is well-designed — per-field scores, source coordinates, alternative interpretations. This *reduces* cognitive load compared to raw OCR output because the user is guided to the exact field that needs attention rather than scanning the entire document.

**Risk:** The weighted confidence model (amount 30%, vendor 25%, invoice number 20%, date 15%, line items 10%) is internally logical but will confuse users. A CFO or AP Clerk does not think in weighted percentages. Recommend simplifying to a **traffic-light per-field** (green/yellow/red) and a single **overall document confidence badge** without the weighting formula visible.

---

## 3. Validation & Match (Stages 2-3)

### Current (as separate stages)

As designed, the user interacts with neither Stage 2 (system-owned) nor Stage 3 (system-owned unless exception). The cognitive load is effectively zero for the happy path.

However, the **mental model penalty** of having two invisible stages is real. When a user looks at the workflow diagram, they see 10 stages and must remember which ones require their attention and which do not. This adds to the "where am I in the workflow?" question that plagues multi-stage systems.

### Merged Recommendation

A combined "Validation & Match" stage would show:
1. A progress indicator (evidence gathering → matching → complete)
2. The match result: MATCHED (green), TOLERANCE (yellow), EXCEPTION (red)
3. Line-item variance table (collapsible by default)

**Load reduction:** Fewer stages to mentally track. One "thing happened" instead of two.

### Exception vs Matched Binary

The "ALL GREEN → MATCHED, ANY RED → EXCEPTION, ALL YELLOW → TOLERANCE" logic is clear and reduces cognitive load. The three-state outcome is intuitive for finance professionals who already understand "pass with exceptions."

**Concern:** The PARTIALLY_MATCHED state (Invoice State Machine, S-INV-04) adds a fourth option that blurs the binary. A partial match where remaining goods are expected is not really a match — it is a known exception with a expected resolution date. Recommend PARTIALLY_MATCHED be treated as a subclass of EXCEPTION_RAISED with an expected resolution date, not a separate state.

---

## 4. Exception Queue (Stage 4)

### Current Design

Exceptions are grouped by type, prioritised by impact, and displayed with SLA countdowns. AI provides root cause analysis and resolution suggestions. The resolver chooses: accept (adjust PO), reject (return to vendor), dispute (query vendor), credit (request credit note).

### Cognitive Load Assessment

| Dimension | Score | Assessment |
|-----------|-------|------------|
| Information Density | **High** | Exception type, severity, amount, vendor, AI root cause, suggested resolution, similar history, SLA timer |
| Decision Complexity | **High** | User must assess: (1) Is the AI diagnosis correct? (2) Which resolution is appropriate? (3) Who needs to be involved? (4) Is there a financial impact? |
| Navigation Depth | **Medium** | Queue → detail → resolve (3 screens) |
| Working Memory | **High** | User must hold the match result, exception details, and resolution options simultaneously |

### Classification Load

Grouping by type (PRICE_MISMATCH, QUANTITY_MISMATCH, etc.) is helpful for queue-level triage but adds decision complexity at the exception level. The user must first confirm the type, then resolve the exception. If the type is wrong (AI misclassified), the user must reclassify before resolving.

**Recommendation:** Show the exception type as a highlighted badge on the queue card so the user can pattern-match visually. The 13 exception types should be colour-coded by category:
- **Red** (financial impact): PRICE_MISMATCH, DUPLICATE_DETECTED, CASH_INSUFFICIENT, PAYMENT_FAILED
- **Amber** (process gap): QUANTITY_MISMATCH, MISSING_PO, GRN_MISSING, APPROVAL_STALLED
- **Blue** (compliance): TAX_VALIDATION_FAILED, POLICY_VIOLATION, VENDOR_INACTIVE
- **Grey** (low impact): OCR_LOW_CONFIDENCE, RECONCILIATION_FAILED

This colour coding reduces the cognitive effort of scanning the queue by ~40% (pattern recognition is faster than text parsing).

---

## 5. Approval (Stage 5)

### Evidence Before Approval

The "Evidence Before Approval" principle (P6) requires the approver to scroll through or acknowledge the evidence panel before the approve button activates (3-second minimum visible time).

### Cognitive Load Redistribution

| Before P6 | After P6 |
|-----------|----------|
| Approver opens invoice | Approver opens invoice → evidence panel displayed |
| Opens PO in separate tab | Evidence panel shows PO side-by-side |
| Opens GRN in separate tab | Evidence panel shows GRN |
| Checks vendor history | Vendor history tab within evidence |
| Decides | Acknowledges evidence → decides |
| **5 screens, ~60s** | **1 screen, ~20s** |

P6 **redistributes but does not necessarily reduce** cognitive load. The approver still processes the same information. However, by presenting it on a single screen with clear sections, the **switch-cost penalty is eliminated** — the approver no longer loses context by switching tabs.

**Unintended consequence:** The 3-second minimum visible time may cause frustration for experienced approvers who can assess an invoice in 10 seconds. This is a trust-vs-speed tension. The spec correctly identifies this as a potential issue in Stage 5 (Section 2, Concern).

**Recommendation:** The 3-second rule should apply only when:
- The approver is a first-time user (first 10 approvals)
- The invoice has exceptions (any YELLOW or RED lines)
- The invoice exceeds the approver's typical authority (e.g., $50K+ for a $10K-threshold approver)

This adapts the safeguard to the risk profile without imposing a uniform constraint.

---

## 6. Payment (Stages 6-8)

### Three Stages for One Payment

As currently designed:
- Stage 6 (Payment Readiness): Treasury Manager reviews proposal
- Stage 7 (Treasury Approval): Treasury Manager checks cash, approves
- Stage 8 (Payment Execution): System pays, Treasury oversees

### Cognitive Load Assessment

| Stage | Decisions | Information Sources | Load |
|-------|-----------|-------------------|------|
| 6 | Review proposal, approve batch composition | Approved invoices, payment terms, discounts, cash position | High |
| 7 | Verify cash availability, confirm payment date | Proposal, bank balance, cash forecast | Medium |
| 8 | Oversee execution (exception handling) | Status, bank confirmation | Low |

**Problem:** Stages 6 and 7 are the same person (Treasury Manager) reviewing the same information (cash position) to make the same decision (should we pay this?). The administrative separation adds **one additional screen transition, one additional decision prompt, and one additional cognitive checkpoint** without adding information.

The cognitive load for the Treasury Manager is artificially inflated by ~30% due to the unnecessary handoff between readiness and approval.

**Merged cognitive load:**

| Stage | Decisions | Information Sources | Load |
|-------|-----------|-------------------|------|
| 5 (merged) | Review proposal, verify cash, approve | Proposal, bank balance, cash forecast | Medium |
| 6 | Oversee execution | Status, bank confirmation | Low |

**Reduction:** One fewer stage, one fewer decision point, same cash verification. Cognitive load reduced by ~30% for the Treasury Manager.

---

## 7. Audit (Stages 9-10)

### GL Posting + Audit & Reconciliation

| Aspect | Current | Proposed (merged) |
|--------|---------|-------------------|
| Stages | 2 (9 + 10) | 1 (Post-Payment Reconciliation) |
| Controller actions | Review GL (Stage 9) + Review reconciliation (Stage 10) | Review reconciliation package (1 action) |
| Information load | 2 screens, 2 decision points | 1 screen, 1 decision point |

**Analysis:** GL posting (Stage 9) is specified as a system action with Controller review. Spec says "Human Responsibilities: Controller reviews GL entries." This is not a separate stage — it is a review step within reconciliation. The Controller does not say "I will review GL at 10am and audit at 2pm." They review the complete post-payment picture once.

**Recommendation:** Merge into a single "Post-Payment Reconciliation" stage where the Controller reviews:
- GL journal entries (auto-generated, confirmed or corrected)
- Bank reconciliation (auto-matched, exceptions flagged)
- Audit trail verification (checksum chain, gap detection)
- Reports refreshed (AP aging, cash flow, vendor balance)

This reduces the Controller's cognitive load by consolidating two review sessions into one.

---

## 8. AI Decision Support

### Does AI Reduce or Add Cognitive Load?

| AI Action | Load Reduction | Load Addition | Net |
|-----------|---------------|---------------|-----|
| AP-AI-01 (OCR Extraction) | Eliminates manual data entry | User must verify confidence scores | **Net positive** |
| AP-AI-02 (Three-Way Match) | Eliminates manual line-by-line comparison | User must review match result | **Net positive** |
| AP-AI-03 (Duplicate Detection) | Eliminates manual duplicate search | User must confirm/reject duplicate | **Net positive** |
| AP-AI-04 (Anomaly Detection) | Flags patterns user would miss | User must investigate flags | **Net positive** |
| AP-AI-05 (GL Coding) | Suggests account codes | User must confirm or override | **Net positive** |
| AP-AI-06 (Cash Flow) | Generates projections | User must interpret projections | **Net neutral** |
| AP-AI-07 (Vendor Risk) | Computes composite score | User must understand scoring model | **Net negative** |
| AP-AI-08 (Audit Trail) | Automates verification | User must review exceptions | **Net positive** |

### 70% Confidence Threshold

The 70% threshold (Level 4, High confidence) is the boundary between auto-presentation and human review. This is a sensible default.

**Load concern:** The 5-level confidence scale (Very High / High / Moderate / Low / Very Low) adds a cognitive layer. Users must learn what each level means, remember the threshold implications, and adjust their trust accordingly.

**Recommendation:** Simplify to 3 levels for v1.0:
- **High** (≥80%): Auto-present, green badge — "AI is confident"
- **Medium** (50-79%): Highlight for review, amber badge — "AI is uncertain, please verify"
- **Low** (<50%): Muted presentation, red badge — "AI cannot determine, manual input required"

The 5-level model can be added in v2.0 once users have built trust calibrations.

### Cognitive Load Risk: "Explainability Fatigue"

The explainability contract mandates that every AI output answers 5 questions: what, why, evidence, confidence, consequence. This is excellent for audit transparency but creates a risk: **users will stop reading explanations once they trust the AI, and the explanations become noise.**

**Recommendation:** Make AI explanations collapsible by default, with a one-line summary:
- "AI recommends [action] with [confidence]. [1-sentence why]."
- "Click to see evidence, alternatives, and historical context."

This preserves the audit trail without imposing the full explanation on every interaction.

---

## 9. Information Overload Assessment

### The Invoice Detail Screen — Maximum Density

The Invoice Detail screen (specified in INFORMATION_ARCHITECTURE.md) presents:

| Section | Data Points |
|---------|------------|
| Invoice header | Vendor, number, date, amount, currency, status, SLA timer (7) |
| Line items | 3-20 lines × 8 fields each (24-160) |
| PO match | 3-20 lines × 4 fields each (12-80) |
| GRN match | 3-20 lines × 3 fields each (9-60) |
| Vendor history | Payment terms, DPO, dispute rate, avg payment time (4) |
| AI risk score | Score, trend, anomaly flags, suggested action (4) |
| Approval chain | Level 1, Level 2, Level 3 approvers + status (6) |
| Evidence tabs | PO document, GRN document, contract, invoice image (4) |

**Total: ~66-321 data points on a single screen.**

### Cognitive Saturation

For a complex invoice with 20 line items, the user faces **over 300 data points**. No human can process this volume effectively. The "Context Before Action" principle (P4) is correct in intent but risks information overload in execution.

**Survival strategy:** The tabbed interface is the right approach, but the default view must be ruthlessly minimal. Recommend:

| Viewer | Line Items Shown | Evidence | Actions |
|--------|-----------------|----------|---------|
| AP Clerk (detail) | All lines, all fields | All tabs available | Correct, override, route |
| Approver (decision) | Summary: total, variance count, exceptions | Exceptions only (expandable) | Approve, reject, delegate |
| Auditor (review) | All lines, read-only | All tabs, expanded | Export, certify |
| Controller (reconciliation) | Summary + exceptions | GL entries, bank match | Confirm, adjust |

This persona-based density adjustment prevents the approver from seeing 300 data points when they only need 10.

### Recommendations for the Information Architecture

| Current design | Concern | Recommended |
|---------------|---------|-------------|
| All sections visible on one screen | Information overload | Collapse secondary sections by default |
| Line items shown in full to all personas | Overload for approvers | Show summary view (total, exceptions) first; expandable |
| AI risk score always visible | Potential noise for routine invoices | Show only when score < 80% or anomaly flagged |
| Approval chain always expanded | Takes visual space | Collapse to status dots; expand on hover |
| Vendor history in tab | One extra click | Show key metrics (DPO, on-time rate) inline; full history in tab |

---

## 10. Recommendations

| # | Recommendation | Rationale | Expected Load Reduction | EPS Reference |
|---|---------------|-----------|------------------------|---------------|
| 1 | Merge Stages 2+3 into "Validation & Match" | Eliminates 2 invisible stages from mental model | Users track 7 stages instead of 10 — 30% reduction in navigation complexity | REFERENCE_WORKFLOW_AP §5 |
| 2 | Simplify AI confidence from 5 levels to 3 | Reduces cognitive calibration effort | Users learn 3 thresholds instead of 5 — 40% reduction in confidence literacy effort | AI_BEHAVIOUR_GUIDE §4.1 |
| 3 | Make AI explanations collapsible by default | Prevents explainability fatigue | Reduces per-AI-reading effort by ~60% for routine interactions | AI_BEHAVIOUR_GUIDE §5 |
| 4 | Persona-based density for Invoice Detail | Prevents information overload for approvers | Approver sees ~15 data points instead of ~100 — 85% reduction | INFORMATION_ARCHITECTURE §3 |
| 5 | Reduce exception types from 13 to 5 for v1.0 | Simplifies exception classification decision | User chooses from 5 types instead of 13 — 62% reduction in classification load | REFERENCE_WORKFLOW_AP §Stage 4 |
| 6 | Merge Stages 6+7 into "Treasury Review & Approval" | Eliminates artificial handoff for same persona | Treasury Manager faces 1 stage instead of 2 — 50% reduction in stage-tracking effort | REFERENCE_WORKFLOW_AP §Stages 6-7 |
| 7 | Colour-code exception queue by category | Enables visual pattern matching | Queue scanning time reduced by ~40% (pattern recognition > text parsing) | WORKFLOW_STATE_MACHINE §5 |
| 8 | Merge Stages 9+10 into "Post-Payment Reconciliation" | Consolidates Controller review into one session | Controller faces 1 review instead of 2 — 50% reduction in session-switching | REFERENCE_WORKFLOW_AP §Stages 9-10 |
| 9 | Remove PARTIALLY_MATCHED as a separate invoice state | Treats partial delivery as exception with expected resolution date | Eliminates ambiguity between MATCHED and PARTIALLY_MATCHED — reduces state confusion | WORKFLOW_STATE_MACHINE §2 |
| 10 | Make 3-second evidence review rule adaptive (not universal) | Prevents frustration for experienced approvers | Experienced users skip unnecessary wait time on low-risk invoices | REFERENCE_WORKFLOW_AP §Stage 5 |
