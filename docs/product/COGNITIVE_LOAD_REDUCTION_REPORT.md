---
title: "Cognitive Load Reduction Report — Invoice Detail & AI Interaction"
created: 2026-07-28
updated: 2026-07-28
version: 1.0
phase: 27.1S
type: specification
domain: ap, ux
author: Product Architecture Board
classification: Internal — Engineering & Product
---

# Cognitive Load Reduction Report — Invoice Detail & AI Interaction

## 1. Executive Summary

The Phase 27.1R Cognitive Load Review identified that the Invoice Detail screen presents 66-321 data points depending on line items — far exceeding the 7±2 chunk cognitive saturation limit. The 5-level AI confidence scale adds unnecessary calibration effort. The universal 3-second evidence review rule creates frustration for power users without proportional safety benefit.

**Three structural changes** are mandated:

| # | Change | Affected Users | Load Reduction |
|---|--------|----------------|----------------|
| 1 | Persona-based density for Invoice Detail | Approvers: ~100→~15 data points | 85% |
| 2 | AI confidence simplified from 5 to 3 levels | All users: 5 thresholds→3 | 40% |
| 3 | Adaptive 3-second rule (not universal) | Experienced approvers: wait time eliminated for routine invoices | Variable |

## 2. Invoice Detail — Persona-Based Density

### 2.1 The Problem

The Invoice Detail screen currently presents every available data point to every user regardless of role. Per COGNITIVE_LOAD_REVIEW §9:

| Section | Data Points |
|---------|------------|
| Invoice header | 7 |
| Line items (3-20 lines × 8 fields) | 24-160 |
| PO match (3-20 lines × 4 fields) | 12-80 |
| GRN match (3-20 lines × 3 fields) | 9-60 |
| Vendor history | 4 |
| AI risk score | 4 |
| Approval chain (3 levels) | 6 |
| Evidence tabs | 4 |
| **Total** | **66-321** |

No human can process this volume effectively. The "Context Before Action" principle (P4) is correct in intent but causes information overload in execution.

### 2.2 Progressive Disclosure Architecture

Every screen must serve the user's **primary decision question** first. Secondary information is progressively disclosed. Each persona sees a different default density.

#### 2.2.1 AP Clerk (Detail View)

The AP Clerk's primary decision: "Is this invoice data correct?"

| Section | Default | Expandable | Notes |
|---------|---------|------------|-------|
| Invoice header | ✅ Visible | — | All fields |
| Line items | ✅ Visible, all fields | — | Needs full view for corrections |
| OCR confidence | ✅ Per-field badges | ⬇️ Alternative interpretations | Green/yellow/red per field |
| Duplicate indicator | ✅ Badge if flagged | ⬇️ Match details | — |
| PO/GRN match toggle | 🔄 Tab | ✅ Full comparison | Tab between invoice/PO/GRN views |
| Vendor history | 🔄 Summary strip | ⬇️ Full history | Show DPO, on-time rate inline |
| AI recommendations | 🔄 Collapsed | ⬇️ Full evidence | "AI suggests GL code 6120 — click for details" |
| Actions | ✅ Save, Submit, Flag | — | Always visible |

**Default data points**: ~20-30 (header + active lines). All data is accessible within 1 click.

#### 2.2.2 Approver (Decision View)

The Approver's primary decision: "Should I approve this payment?"

| Section | Default | Expandable | Notes |
|---------|---------|------------|-------|
| Invoice summary | ✅ Invoice total, vendor, date, PO ref | — | 4 key fields |
| Exception indicators | ✅ Red/yellow/green badge | ⬇️ Exception details | "2 line items exceed tolerance" |
| Line items summary | ✅ Total + variance count + exception lines | ⬇️ All lines, collapsed | Grouped: ✅ Matched, ⚠️ Tolerant, ❌ Exception |
| Evidence Before Approval | ✅ Evidence Panel (mandatory review) | — | See §5 for rules |
| AI recommendation | ✅ 1-line verdict | ⬇️ Full reasoning | "AI recommends approve. 1 exception reviewed." |
| Approval chain | 🔄 Status dots | ⬅️ Hover for detail | Collapsed to 3 dots (completed/active/pending) |
| History strip | ✅ Last 3 events | ⬇️ Full audit trail | — |
| Actions | ✅ Approve, Reject, Delegate | — | Always visible |

**Default data points**: ~15. The Approver sees exceptions and totals only. Full detail requires deliberate expansion.

#### 2.2.3 Auditor (Review View)

The Auditor's primary decision: "Is this transaction compliant?"

| Section | Default | Expandable | Notes |
|---------|---------|------------|-------|
| Complete timeline | ✅ Chronological event list | — | All events, all states |
| Checksum validation | ✅ Valid/Invalid badge | ⬇️ Chain verification | — |
| All line items | ✅ Read-only, all fields | — | Full data preservation |
| All PO/GRN data | ✅ Read-only, all fields | — | Full data preservation |
| All AI audit records | ✅ Read-only | — | Model version, confidence, human action |
| Export | ✅ Export button | ⬇️ Format selection | PDF, CSV, audit package |
| Certification | ✅ Certify button | — | Requires reason |

**Default data points**: Full view (~66-321). The Auditor needs everything visible by default.

#### 2.2.4 Controller (Reconciliation View)

The Controller's primary decision: "Does the post-payment picture reconcile?"

| Section | Default | Expandable | Notes |
|---------|---------|------------|-------|
| Payment summary | ✅ Amount, date, bank account, status | — | 4 key fields |
| GL journal entries | ✅ Auto-generated entries | ⬇️ Source detail | Debit/credit lines |
| Bank reconciliation | ✅ Statement line match | ⬇️ Exception details | Green/yellow/red |
| Exception summary | ✅ If any exceptions | ⬇️ Exception detail | — |
| Audit trail verification | ✅ Checksum valid/invalid | ⬇️ Chain detail | — |
| Actions | ✅ Confirm, Adjust, Escalate | — | — |

**Default data points**: ~20-30. Focused on reconciliation.

### 2.3 UI Rules for Density Control

1. **Primary action is always visible**: Approve/Reject/Confirm buttons are never behind an expand
2. **Exceptions are always visible**: Any line item with EXCEPTION or TOLERANCE status is expanded by default
3. **1-click to full detail**: From any persona view, one click shows the full invoice detail view
4. **Persona indicator**: A subtle badge shows which persona view is active ("You are viewing as Approver")
5. **View switching**: User can switch persona views from a dropdown (e.g., AP Clerk viewing as Approver to check approval status)
6. **State preservation**: Persona view preference persists across sessions (localStorage)
7. **Keyboard shortcut**: `V` cycles through persona views

## 3. AI Confidence — 3-Level Scale

### 3.1 The Problem

The current 5-level confidence scale (Very High / High / Moderate / Low / Very Low) requires users to learn 5 thresholds, remember the routing implications of each, and calibrate trust across 5 bands. Per COGNITIVE_LOAD_REVIEW §8: "Users must learn what each level means, remember the threshold implications, and adjust their trust accordingly."

### 3.2 Simplified 3-Level Scale

| Level | Label | Score Range | Visual | Behaviour |
|-------|-------|-------------|--------|-----------|
| **High** | High Confidence | ≥80% | Green badge | Auto-present. AI suggestion shown as default. Human can override. |
| **Medium** | Needs Review | 50-79% | Amber badge | Highlighted for review. AI suggestion shown with alternatives. Human must confirm or override. |
| **Low** | Cannot Determine | <50% | Red badge | AI output not shown by default. Manual input required. AI evidence available on request. |

### 3.3 Per-Capability Confidence Thresholds

Replaces the universal 70% threshold with calibrated per-capability thresholds:

| AI Action | High Threshold | Medium Threshold | Rationale |
|-----------|---------------|------------------|-----------|
| AP-AI-01 OCR | ≥85% | 50-84% | OCR is mature for standard formats. 85% is the documented threshold for auto-accept. |
| AP-AI-02 Match | ≥95% (data present) | 70-94% | Matching is deterministic for available data. Missing data drops confidence. |
| AP-AI-03 Duplicate | ≥90% | 70-89% | False negatives are costly (double payment). Higher threshold for auto-flag. |
| AP-AI-04 Anomaly | ≥80% | 50-79% | Anomaly detection is statistical. 80% is appropriate for flagging. |
| AP-AI-05 GL Coding | ≥85% | 60-84% | GL coding has high cost of error. Conservative threshold. |
| AP-AI-06 Cash Flow | ≥75% | 50-74% | Inherently uncertain. Lower threshold acceptable. [HYPOTHESIS] |
| AP-AI-07 Risk Score | No fixed threshold | N/A | Display score with recommended action band. No binary threshold. [HYPOTHESIS] |
| AP-AI-08 Audit Trail | Deterministic (100%) | N/A | Deterministic. No confidence scoring needed. |

### 3.4 Escalation Behaviour for Low-Confidence Outputs

When any AI action produces a Medium or Low confidence result:

1. **Immediate**: Result is highlighted with the appropriate badge colour
2. **Evidence shown**: The AI explains which data elements caused the low confidence (e.g., "OCR confidence 62% — scanned image quality below threshold")
3. **Human action required**: The user must make the decision. AI does not recommend at Low confidence.
4. **Fallback offered**: For OCR: manual entry form pre-populated with best-guess fields. For matching: manual comparison grid. For coding: account picker with category filter.
5. **Logging**: The low-confidence event is logged with input features, model version, and human resolution for model improvement.

### 3.5 Confidence Display in UI

| Element | High | Medium | Low |
|---------|------|--------|-----|
| Badge | Green "High" | Amber "Review" | Red "Manual" |
| Suggestion | Shown as default | Shown with warning | Not shown |
| Explanation | Collapsible | Expanded by default | N/A |
| Override | Optional | Recommended | Required |
| Auto-action | Allowed | Blocked | Blocked |

## 4. AI Explanations — Collapsible by Default

### 4.1 The Problem

The 5-question explainability contract (What, Why, Evidence, Confidence, Consequence) is excellent for audit transparency but imposes a fixed format on every AI output. Per COGNITIVE_LOAD_REVIEW §8: "Users will stop reading explanations once they trust the AI, and the explanations become noise."

### 4.2 One-Line Summary Rule

Every AI output displays a **one-line summary** by default:

Format: "AI recommends **[action]** with **[confidence label]**. **[1-sentence why]**."

Examples:
- "AI extracted 12 fields with High confidence. 3 fields reviewed (all confirmed)."
- "AI recommends approve with Medium confidence. 1 line item exceeds tolerance."
- "AI suggests GL code 6120 (Cloud Hosting) with High confidence. Vendor has 23 invoices coded to 6120."

The full 5-question explanation is available with one click ("Show evidence").

### 4.3 When Explanations Expand Automatically

| Condition | Explanation Behaviour |
|-----------|----------------------|
| First-time user (first 10 AI interactions) | Expanded by default with tooltip tour |
| Medium or Low confidence output | Expanded by default |
| User has overridden same AI action 3+ times in a row | Expanded by default (trust recalibration) |
| High confidence, routine action | Collapsed by default |
| User has accepted 10+ consecutive recommendations | Collapsed by default, with random 1-in-20 forced expansion |

### 4.4 User Preference

Users can set their default explanation behaviour in Settings:
- "Always show full explanation" (for new users or auditors)
- "Show on Medium/Low confidence only" (recommended default)
- "Show only on demand" (for power users)

## 5. Adaptive Evidence Before Approval

### 5.1 The Problem

The universal 3-second evidence review rule applies to every approval regardless of risk profile. Per COGNITIVE_LOAD_REVIEW §5: "The 3-second rule may cause frustration for experienced approvers who can assess an invoice in 10 seconds."

### 5.2 Adaptive Rule

The evidence review requirement adapts based on four factors:

| Factor | Safe Condition | Review Required Condition |
|--------|---------------|--------------------------|
| **User experience** | 50+ approvals completed | First 10 approvals |
| **Invoice risk** | No exceptions, amount < $50K | Any exception, amount ≥ $50K |
| **AI confidence** | High for all AI actions | Medium or Low for any AI action |
| **Vendor trust** | Vendor with 12+ months history | New vendor (< 6 months) |

### 5.3 Evidence Review Modes

| Mode | Trigger | Behaviour |
|------|---------|-----------|
| **Strict** | First 10 approvals, OR any "Review Required" condition met | Evidence Panel must be visible for 3s before Approve enables. Scroll indicator must reach bottom. |
| **Standard** | Default mode for experienced users on routine invoices | Evidence Panel is shown but no forced delay. Approver acknowledges by clicking "Review Complete" checkbox. |
| **Trusted** | Power users (>500 approvals) with consistent accuracy | Evidence shown but skippable. Approver can approve immediately after viewing summary. Trust mode is automatically enabled after 500 consecutive approvals with <1% override rate. |

All modes are audited. The mode is recorded in the audit record as part of the approval metadata.

### 5.4 Keyboard Shortcut

Power users can acknowledge evidence and approve in one action:
- `Cmd+Shift+A`: Acknowledge evidence and approve (in Standard mode)
- `Cmd+Shift+R`: Acknowledge evidence and reject (with reason prompt)

These shortcuts only function when the Evidence Panel has been displayed (verified by Intersection Observer tracking actual visibility, not just render).

## 6. Exception Queue — Colour-Coded by Category

Per COGNITIVE_LOAD_REVIEW §4 recommendation:

| Category | Colour | Exception Types |
|----------|--------|-----------------|
| Financial Impact | Red | PRICE_MISMATCH, DUPLICATE_DETECTED, CASH_INSUFFICIENT, PAYMENT_FAILED |
| Process Gap | Amber | QUANTITY_MISMATCH, MISSING_PO, GRN_MISSING, APPROVAL_STALLED |
| Compliance | Blue | TAX_VALIDATION_FAILED, POLICY_VIOLATION, VENDOR_INACTIVE |
| Low Impact | Grey | OCR_LOW_CONFIDENCE, RECONCILIATION_FAILED |

For v1.0, only 5 exception types are implemented (per PRODUCT_REVIEW_REPORT Recommendation #5):
- PRICE_MISMATCH (Red)
- QUANTITY_MISMATCH (Amber)
- DUPLICATE_DETECTED (Red)
- MISSING_PO (Amber)
- APPROVAL_STALLED (Amber)

## 7. Implementation Priority

| Priority | Change | Effort | Depends On |
|----------|--------|--------|------------|
| P0 | Persona-based density for Invoice Detail | IA update | INFORMATION_ARCHITECTURE redesign |
| P0 | AI confidence simplified to 3 levels | AI_BEHAVIOUR_GUIDE update | — |
| P1 | AI explanations collapsible by default | IA + AI_BEHAVIOUR_GUIDE update | — |
| P1 | Adaptive evidence review | REFERENCE_WORKFLOW_AP update | — |
| P2 | Exception queue colour-coding | REFERENCE_WORKFLOW_AP + IA update | — |
| P2 | Keyboard shortcuts for power users | IA update | — |

---

*End of Cognitive Load Reduction Report — Phase 27.1S*
