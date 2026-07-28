---
title: "AI Confidence Model — Per-Capability Confidence Architecture"
created: 2026-07-28
updated: 2026-07-28
version: 1.0
phase: 27.1S
type: specification
domain: ap, ai
author: Product Architecture Board
classification: Internal — Engineering & Product
---

# AI Confidence Model — Per-Capability Confidence Architecture

## 1. Executive Summary

The Phase 27.1R AI Trust Review identified that the universal 70% confidence threshold for mandatory human review is too blunt an instrument. Different AI capabilities have inherently different confidence distributions — a 70% threshold on OCR field extraction (where 95%+ is expected on clean documents) is very different from 70% on risk scoring (where 50-70% may be the norm).

**Decision**: Replace the universal 70% threshold with per-capability confidence models. Each capability has its own calibrated thresholds, escalation behaviours, and override rules.

## 2. The Universal 70% Problem

| Issue | Assessment | Resolution |
|-------|-----------|------------|
| **Single source** | The 70% threshold is supported by E3 (Ayman Shawky: "need for confidence scoring"). No evidence that 70% is the right universal value. | Replace with per-capability thresholds, each with documented rationale. |
| **Uncalibrated** | Not tested against real model performance for any capability. | Define thresholds based on capability characteristics. Calibrate with production data post-launch. |
| **One-size-fits-none** | OCR (expected 95%+ on clean docs), matching (deterministic for available data), and cash flow (inherently 55-80%) have fundamentally different confidence ranges. | Each capability gets its own confidence model. |

## 3. Per-Capability Confidence Models

### 3.1 AP-AI-01: OCR Field Extraction

| Property | Value |
|----------|-------|
| **Confidence nature** | Per-field weighted (amount 30%, vendor 25%, invoice number 20%, date 15%, line items 10%) |
| **Expected range** | 85-99% on standard invoices |
| **High threshold** | ≥85% |
| **Medium threshold** | 50-84% |
| **Low threshold** | <50% |
| **Auto-accept behaviour** | Fields ≥85% auto-accepted. Fields 50-84% highlighted for review. Fields <50% blanked for manual entry. |
| **Explainability** | Per-field confidence shown as green/yellow/red badge. Overall document badge shown in header. Weighting formula not displayed (use traffic-light instead). |
| **Fallback** | <50% fields: manual entry. <50% on 3+ critical fields (amount, vendor, date): full manual entry mode. |
| **Calibration target** | Precision ≥98% in High band. Recall ≥99% for field presence. |

### 3.2 AP-AI-02: Three-Way Match

| Property | Value |
|----------|-------|
| **Confidence nature** | Deterministic for data-present (95-100%). Drops based on data completeness. Missing PO = 0% for match, not applicable for 2-way. |
| **High threshold** | ≥95% (all data present, all lines within tolerance) |
| **Medium threshold** | 70-94% (data complete but some lines exceed tolerance) |
| **Low threshold** | <70% (missing data, or multiple lines exceed tolerance) |
| **Auto-accept behaviour** | High: auto-MATCHED with summary notification. Medium: auto-MATCHED with exception lines highlighted. Low: EXCEPTION_RAISED, human resolution required. |
| **Explainability** | Line-level comparison grid with per-line MATCH/VARIANCE/MISSING flags. Tolerance values shown inline. PO selection rationale shown when multiple POs match. |
| **Fallback** | Missing PO → 2-way match (invoice vs GRN). Missing GRN → 2-way match (invoice vs PO). Both missing → EXCEPTION_RAISED. |
| **Calibration target** | Auto-match rate ≥70% at 30 days, ≥85% at 180 days. Note: initial rate may be lower due to data quality. Communicate conservative initial target. |

### 3.3 AP-AI-03: Duplicate Detection

| Property | Value |
|----------|-------|
| **Confidence nature** | Five match types with different ranges: Exact (99%), Near-duplicate (70-95%), Fuzzy (50-70%), Partial (30-50%), Cross-entity (<30%). |
| **High threshold** | ≥90% |
| **Medium threshold** | 70-89% |
| **Low threshold** | <70% |
| **Auto-accept behaviour** | High: auto-flag as duplicate, pending Clerk confirmation. Medium: flag for review. Low: show as potential duplicate in background, no alert. |
| **Explainability** | Per-field similarity breakdown with percentages. Matched invoice linked for side-by-side comparison. |
| **Fallback** | False positive feedback loop: "Not a Duplicate" sends input data to model improvement pipeline. |
| **Calibration target** | Precision ≥95% in High band. Recall >99% at any confidence. Accept false positives over false negatives. |

### 3.4 AP-AI-04: Anomaly Detection

| Property | Value |
|----------|-------|
| **Confidence nature** | Statistical percentile-based (3σ for routine, 2σ for HIGH severity). Behavioural pattern-break detection. |
| **High threshold** | ≥80% |
| **Medium threshold** | 50-79% |
| **Low threshold** | <50% |
| **Auto-accept behaviour** | High: flag as anomaly with priority. Medium: flag for review. Low: log only, no alert. |
| **Explainability** | Historical baseline shown (12-month trend). "Amount $245K is 58σ above mean — 245× vendor's typical invoice." Similar anomaly outcomes linked. |
| **Fallback** | 2σ threshold for AMOUNT only applies to new vendors or first invoice >$50K. 3σ used for routine flagging. Prevents alert fatigue at scale. |
| **Calibration target** | False positive rate <1% for HIGH severity flags. Alert fatigue mitigation designed. |

### 3.5 AP-AI-05: GL Coding Suggestions

| Property | Value |
|----------|-------|
| **Confidence nature** | Four match types: Exact vendor-historical (90-95%), Category-based (75-85%), Semantic (60-75%), No match (<60%). |
| **High threshold** | ≥85% |
| **Medium threshold** | 60-84% |
| **Low threshold** | <60% |
| **Auto-accept behaviour** | High: pre-select code with Controller confirmation. Medium: show top 3 suggestions. Low: show account picker with category filter. |
| **Explainability** | "This vendor (Acme Corp) has submitted 23 invoices. All 23 coded to account 6120. 0 corrections by Controller." |
| **Fallback** | No match → account picker with category filter. Department-default GL code used as pre-selection. |
| **Calibration target** | Top-1 accuracy ≥85% at 180 days. Workload impact: at 5,000 invoices/month, ~750 corrections/month = ~30-40 per business day. |

### 3.6 AP-AI-06: Cash Flow Prediction [HYPOTHESIS]

| Property | Value |
|----------|-------|
| **Confidence nature** | Tiered by projection horizon: 30-day (75-80%), 60-day (65-70%), 90-day (55-60%). Deterministic components at 90-95%. |
| **High threshold** | ≥75% |
| **Medium threshold** | 50-74% |
| **Low threshold** | <50% |
| **Auto-accept behaviour** | High: show projection as default recommendation. Medium: show with confidence band. Low: show with warning. |
| **Note** | [HYPOTHESIS]. Per-review recommendation: defer to v2.0. If built, use these thresholds. |

### 3.7 AP-AI-07: Vendor Risk Scoring [HYPOTHESIS]

| Property | Value |
|----------|-------|
| **Confidence nature** | Composite of deterministic factors + model-based prediction. Overall range 85-90% (estimated). |
| **Threshold** | No fixed threshold. Display score with recommended action band: Green (0-30) / Amber (31-60) / Red (61-100). |
| **Auto-accept behaviour** | Score shown with factor breakdown. No auto-action. Human interprets and decides. |
| **Note** | [HYPOTHESIS]. Per-review recommendation: defer to v2.0. No confidence threshold needed — display only. |

### 3.8 AP-AI-08: Audit Trail Analysis

| Property | Value |
|----------|-------|
| **Confidence nature** | Deterministic (SHA-256 verification, event enumeration). 100% for data present. Missing data = gap detected, not confidence. |
| **Threshold** | No confidence threshold. Binary: checksum valid / invalid. Gap detected / no gap. |
| **Auto-accept behaviour** | Deterministic results. All results shown. No confidence scoring needed. |
| **Note** | This is the safest AI action. Deterministic, verifiable, no confidence ambiguity. |

## 4. Confidence Calibration Monitoring

### 4.1 Per-Capability Monitoring

Every AI capability must track:

| Metric | Definition | Alert Threshold |
|--------|------------|-----------------|
| **Mean confidence** | Mean score across all predictions | 1σ drop from 7-day rolling baseline |
| **Precision by band** | % correct predictions per confidence band | <95% precision in High band triggers investigation |
| **Override rate** | % of recommendations overridden by humans | >15% for any capability triggers AI Governance Board review |
| **Confidence distribution** | Histogram of scores across all predictions | Skew >0.5 indicates calibration drift |

### 4.2 Degradation Detection

Slow degradation is detected through:

1. **Confidence drift**: Moving average tracked hourly. Alert on >1σ drop from 7-day baseline.
2. **Data quality monitoring**: Per-capability input feature completeness tracked.
3. **Override rate trend**: Rising override rate without confidence change indicates trust erosion.
4. **Calibration audit**: Monthly comparison of confidence band vs actual accuracy. Platt scaling applied if calibration error >5%.

### 4.3 Rollback Trigger

Any of the following triggers automatic rollback to previous model version:

- Precision in High confidence band drops below 90% for any capability
- Override rate exceeds 25% for 3 consecutive days
- Mean confidence drops >2σ from baseline
- Calibration audit reveals >10% error in any confidence band

## 5. Trust-Building Program

### 5.1 Adoption Ramp

| Phase | What Happens | Duration |
|-------|-------------|----------|
| **Day 1** | AI transparency tour — first-time user sees tooltip explainers for every AI output. 5-minute interactive tutorial. | First login |
| **First 30 days** | Weekly digest: "Your AI acceptance rate: 72%. Here's what you overrode most often." | Weeks 1-4 |
| **Day 90** | AI trust score dashboard: per-capability accuracy, trend, team comparison. | Week 12 |
| **Day 180** | Personal time-saved metric: "You have saved approximately X hours using AI." | Week 24 |

### 5.2 Transparency Reports

Monthly AI transparency report accessible from the AP dashboard:

| Section | Content |
|---------|---------|
| Accuracy by capability | Per-capability acceptance rate, override rate, trend arrows |
| Top override reasons | Categorised by TRUST, ACCURACY, POLICY, PREFERENCE |
| Time saved estimate | Estimated hours saved based on manual processing benchmarks |
| Model version | Current version, change summary, what improved |
| Known limitations | Documented gaps per capability |

### 5.3 Over-Trust Prevention

| Mechanism | Implementation | Frequency |
|-----------|---------------|-----------|
| Variable friction | Randomly require confirmation for 5% of High-confidence recommendations | Per interaction |
| Time-based review | If user accepts 10 AI recommendations in <30s total, force one detailed review | Per burst |
| Spot-check requirement | Random 1% of AI-accepted recommendations require user reason: "Why did you accept this?" | Per 100 acceptances |

### 5.4 Under-Trust Response

| Override Reason Category | Threshold | Action |
|--------------------------|-----------|--------|
| TRUST | >50% of overrides | User education intervention (guided tour, accuracy stats) |
| ACCURACY | >50% of overrides | Model retraining triggered, AI Governance Board notified |
| POLICY | >50% of overrides | Review if policy is misaligned with AI recommendations |
| PREFERENCE | >50% of overrides | UI customisation offered |

## 6. Downstream Validation Feedback Loop

### 6.1 The Gap

When AI recommends with High confidence and the human accepts, the system never knows if the recommendation was actually correct — unless a downstream failure surfaces it (payment rejected, GL mismatch, vendor complaint). These downstream signals are not connected back to AI audit.

### 6.2 Implementation

Event | Traced To | Action
------|-----------|-------
Payment failure | Last AI recommendation that influenced it | Log as false positive candidate
GL posting correction | AI coding suggestion that was accepted | Log as false positive candidate
Vendor dispute | AI match recommendation that was accepted | Log as false positive candidate
Bank reconciliation exception | AI reconciliation match that was accepted | Log as false positive candidate

Logging a "false positive candidate" does not automatically mark the AI as wrong — it triggers a review of the AI's input features, output, and confidence estimate. If confirmed wrong, the override is retroactively categorised as ACCURACY and the model retraining pipeline is notified.

---

*End of AI Confidence Model — Phase 27.1S*
