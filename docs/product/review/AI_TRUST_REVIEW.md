---
title: "AI Trust Review — AP Reference Workflow v2.0"
created: 2026-07-28
phase: "27.1R"
version: "1.0"
authority: Independent Product Review
classification: Restricted — Internal Use Only
tags: [product, ap, ai, trust, review]
---

# AI Trust Review — AP Reference Workflow v2.0

## 1. Review Methodology

Every AI interaction defined in the AI Behaviour Guide was assessed against five trust dimensions:

| Dimension | Question | Standard |
|-----------|----------|----------|
| **Transparency** | Can the user see *why* the AI produced this output? | Input data, processing logic, and output must be visible |
| **Explainability** | Does the user *understand* why the AI produced this output? | Reasoning chain, evidence sources, confidence factors |
| **Confidence** | Is confidence shown, calibrated, and actionable? | Numeric score + semantic label + factor breakdown + clear action |
| **Overridability** | Can the user reject or modify the AI output? | Clear override path with mandatory reason for override |
| **Audit** | Is the recommendation logged with human decision? | Full AI audit record schema defined and linked to human action |

Each AI action receives: **PASS** (all 5 dimensions met), **CONDITIONAL** (1-2 dimensions weak), **FAIL** (3+ dimensions missing or flawed).

---

## 2. AI Action-by-Action Review

### 2.1 AP-AI-01: OCR Field Extraction

| Dimension | Assessment | Rating |
|-----------|-----------|--------|
| **Transparency** | Per-field confidence shown. Source coordinates displayed. Top 3 alternatives shown. | ✅ Strong |
| **Explainability** | Explainability example is excellent: "Field 'amount' extracted as $12,450.00 with 94% confidence. Source: page 1, line 3, bold text..." | ✅ Strong |
| **Confidence** | Per-field (0-100%) + document-level weighted average. Weighted by field importance (amount 30%, vendor 25%, etc.). Three confidence bands with different routing. | ✅ Strong |
| **Overridability** | Manual correction always available. Override reason required if AI was above threshold. | ✅ Strong |
| **Audit** | Every field + every correction logged. Input hash for reproducibility. | ✅ Strong |

**Verdict**: **PASS** — This is the strongest AI action in the spec. The confidence model (per-field, weighted, three-band) is well-designed.

**Concern**: Pre-processing reliability. What happens when OCR cannot determine the document type (invoice vs credit note vs proforma)? The spec says "auto-detect layout type" but doesn't define the fallback for misclassification. A credit note processed as an invoice could lead to incorrect GL entries. This should be addressed in failure mode documentation.

### 2.2 AP-AI-02: Three-Way Match

| Dimension | Assessment | Rating |
|-----------|-----------|--------|
| **Transparency** | Line-level comparison grid with invoice vs PO vs GRN values. Per-line MATCH/VARIANCE/MISSING/EXTRA flags. | ✅ Strong |
| **Explainability** | Per-line discrepancy details with tolerance values. "Line 2: Widget B — Variance: +$50.00 (+1.28%). Tolerance: ±2%. Within tolerance — auto-accepted." | ✅ Strong |
| **Confidence** | Deterministic for data-present (95-100%). Overall based on data completeness. Missing PO = 0% confidence. Correct approach. | ✅ Strong |
| **Overridability** | Override match with documented reason. Exception raised for human resolution. | ✅ Strong |
| **Audit** | Per-line match result logged. Human override logged with before/after verdict. | ✅ Strong |

**Verdict**: **PASS** — Well-designed, deterministic for available data, clear fallback for missing data.

**Concern**: The spec says "auto-match rate > 70% (target > 90% at 180 days)" with no baseline. If actual match rate starts at 30% because of data quality issues, the trust equation changes. Users who expect 90% and get 30% will lose trust. Recommendation: Set a conservative initial target (50%) and communicate clearly that match rate increases as data quality improves.

### 2.3 AP-AI-03: Duplicate Detection

| Dimension | Assessment | Rating |
|-----------|-----------|--------|
| **Transparency** | Per-field similarity breakdown with percentages. Matched invoice linked for comparison. | ✅ Strong |
| **Explainability** | "Potential duplicate detected (probability: 92%). Matched with INV-2026-0321 from Acme Corp. Invoice number: 37% similarity. Amount: difference $10.00 (0.08%)." | ✅ Strong |
| **Confidence** | Five match types with different confidence ranges. Exact match 99%, near-duplicate 70-95%, fuzzy 50-70%. | ✅ Strong |
| **Overridability** | "Confirm Duplicate" and "Not a Duplicate" with reason field. False positive feedback to improve model. | ✅ Strong |
| **Audit** | Every detection + human decision logged. False positives/negatives used for retraining. | ✅ Strong |

**Verdict**: **PASS** — The five match types cover the major scenarios. False positive feedback loop is well-designed.

**Concern**: Precision target > 90% with recall > 99%. This is ambitious. For context, best-in-class enterprise AP systems achieve 95-98% precision at 95% recall. The "> 99% recall" target will inevitably produce false positives. The teams should model the expected false positive volume: at 99% recall with 98% precision, if 1% of 50K invoices/year are duplicates (500), the system generates ~10 false positive flags per year. Acceptable. But if duplicate rate is 5% (2,500), false positives jump to ~50 flags. The spec should address this volume expectation.

### 2.4 AP-AI-04: Anomaly Detection

| Dimension | Assessment | Rating |
|-----------|-----------|--------|
| **Transparency** | Historical baseline shown. 12-month trend graph. Similar anomaly outcomes. | ✅ Strong |
| **Explainability** | "Amount $245,000.00 is 58σ above the mean — 245× the vendor's typical invoice." Clear, quantified, actionable. | ✅ Strong |
| **Confidence** | Statistical percentile-based + behavioural pattern-break detection + binary flags. Appropriate for each anomaly type. | ✅ Strong |
| **Overridability** | Investigate / confirm safe / escalate. Resolution reason required. | ✅ Strong |
| **Audit** | Every anomaly logged with factors and human action. | ✅ Strong |

**Verdict**: **PASS** — Well-designed anomaly detection with appropriate severity classification.

**Concern**: The 2σ threshold for amount outlier detection will flag ~5% of all invoices as anomalous purely by statistical definition (assuming normal distribution). If a vendor submits 100 invoices per year, 5 are flagged. For a vendor with stable pricing, this is noise. Recommendation: Use 3σ for routine flagging (0.3% false positive rate) and 2σ only for HIGH severity context (new vendor, first invoice > $50K). The spec's current approach of "2σ from vendor historical mean" will cause alert fatigue at scale.

### 2.5 AP-AI-05: GL Coding Suggestions

| Dimension | Assessment | Rating |
|-----------|-----------|--------|
| **Transparency** | Suggested code + account name + confidence per line. Top 3 alternatives. Historical coding frequency. | ✅ Strong |
| **Explainability** | "This vendor (Acme Corp) has submitted 23 invoices. All 23 coded 'cloud hosting' to account 6120. 0 corrections by Controller." | ✅ Strong |
| **Confidence** | Four match types with different ranges (exact 90-95%, category 75-85%, semantic 60-75%, no match < 60%). | ✅ Strong |
| **Overridability** | Confirm or change. Override reason required when overriding > 90% confidence suggestion. | ✅ Strong |
| **Audit** | Every suggestion + human decision logged. | ✅ Strong |

**Verdict**: **PASS** — The four-tier confidence model and top-3 alternatives are well-designed.

**Concern**: Top-1 accuracy target of 85% at 180 days means 15% of invoices will need manual correction. At 5,000 invoices/month, that's 750 corrections per month — approximately 30-40 per business day. This may overwhelm a single Controller. The spec should include a workload projection and either raise the accuracy target or plan for dedicated coding staff.

### 2.6 AP-AI-06: Cash Flow Prediction [HYPOTHESIS]

| Dimension | Assessment | Rating |
|-----------|-----------|--------|
| **Transparency** | Daily outflow bar chart, current cash line, minimum balance threshold, confidence band. | ✅ Strong |
| **Explainability** | "Cash constraint projected on day 47 (outflows $189K vs minimum balance $150K). Recommendation: Defer 3 non-urgent invoices." | ✅ Strong |
| **Confidence** | Tiered by projection horizon (30-day 75-80%, 60-day 65-70%, 90-day 55-60%). Deterministic components at 90-95%. | ✅ Strong |
| **Overridability** | Accept, modify, override. What-if scenarios supported. | ✅ Strong |
| **Audit** | Full audit of projection + Treasury decision. | ✅ Strong |

**Verdict**: **CONDITIONAL** — The design is excellent but the capability is marked [HYPOTHESIS] with no customer validation. The trust architecture is well-defined for a feature that doesn't exist yet.

**Concern**: The 75-80% confidence for 30-day projections means 20-25% of projections are materially wrong. Treasury Managers who rely on 95% accuracy will lose trust. Recommendation: Before deployment, validate (a) what accuracy level Treasury Managers expect, and (b) how they handle incorrect projections. The current confidence tiers are internally consistent but may not match user expectations.

### 2.7 AP-AI-07: Vendor Risk Scoring

| Dimension | Assessment | Rating |
|-----------|-----------|--------|
| **Transparency** | Score breakdown by 5 factors with contribution percentage. 12-month trend. Peer comparison. | ✅ Strong |
| **Explainability** | "Payment reliability (30%): 5/30 (98% on-time). Dispute history (20%): 2/20 (1 dispute in 24 months)." Clear, quantified. | ✅ Strong |
| **Confidence** | Deterministic factors at 95%. Overall composite 85-90%. Correct for a rule-based scoring system. | ✅ Strong |
| **Overridability** | Score overridable with business context. Flag for review if score crosses threshold. | ✅ Strong |
| **Audit** | Every score + override logged. | ✅ Strong |

**Verdict**: **CONDITIONAL** — The scoring model is well-structured but marked [HYPOTHESIS] with no customer validation. The weighting (payment reliability 30%, dispute history 20%, ageing 20%, credit score 15%, volume stability 10%, tenure 5%) is internally logical but may not match how finance teams actually assess risk.

**Concern**: The spec states "Score correlation with actual payment issues (R-squared > 0.7)" as a performance target. Without real data, this is aspirational. The 85-90% confidence claim is theoretical. The 6 factors and their weights are reasonable hypotheses but need empirical validation.

### 2.8 AP-AI-08: Audit Trail Analysis

| Dimension | Assessment | Rating |
|-----------|-----------|--------|
| **Transparency** | Complete chronological timeline. Per-stage SLA compliance. Checksum verification. | ✅ Strong |
| **Explainability** | "23 events across 10 stages. Checksum: VALID. SLA compliance: 100%. Total: 14.6 hours." | ✅ Strong |
| **Confidence** | Deterministic (SHA-256 verification, event enumeration). 100% for data present. | ✅ Strong |
| **Overridability** | Review-only. Export for auditor. Close with certification. | ✅ Strong |
| **Audit** | Meta-audit — every audit report generation logged. External quarterly audit. | ✅ Strong |

**Verdict**: **PASS** — Deterministic, verifiable, no confidence ambiguity. This is the safest AI action in the spec.

---

## 3. Cross-Cutting AI Concerns

### 3.1 Confidence Calibration — 70% Threshold

The spec uses **70% as the universal threshold** for mandatory human review across all AI capabilities. This is a significant design decision with weak evidence.

| Issue | Assessment |
|-------|-----------|
| **Evidenced?** | Single source: Ayman Shawky "need for confidence scoring on forecasts" (E3). No evidence that 70% is the right threshold. |
| **Validated?** | No. Not tested with users. Not calibrated against real model performance. |
| **Universal?** | The same 70% threshold applies to OCR (per-field), matching (line-level), duplicate detection (document-level), risk scoring (composite). These have inherently different confidence distributions. A 70% threshold on OCR field extraction (where we expect 95%+ on clean documents) is very different from 70% on risk scoring (where 50-70% may be the norm). |

**Recommendation**: Do not use a universal 70% threshold. Calibrate per-capability:
- OCR: 85% threshold (per the confidences model already defined)
- Matching: 80% threshold (matching is deterministic for available data)
- Duplicate detection: 85% threshold (false negatives are costly)
- Risk scoring: No fixed threshold — display score with recommended action band
- GL coding: 80% threshold (Controller review below this)
- Cash flow: 70% threshold (inherently uncertain)

The AI Behaviour Guide's own confidence scale (Level 1-5, per-capability) is superior to a universal 70% threshold. Use the per-capability model, not the universal shortcut.

### 3.2 AI Recommendation Format — 5-Question Contract

Every AI output must answer: (1) What was found? (2) Why relevant? (3) What evidence? (4) What confidence? (5) What happens if ignored?

| Assessment | Details |
|-----------|---------|
| **Coverage** | 8/8 AI actions include all 5 questions in their explainability example. ✅ |
| **Format** | Canonical format (Section 5.2) is well-designed. Collapsible, never hidden. "Copy as text" button. ✅ |
| **Historical context** | "This pattern has occurred N times" and "N% similar cases resulted in outcome" — excellent addition. ✅ |
| **Counter-evidence** | Spec requires surfacing contradictory evidence. This is rare in AI systems and correctly included. ✅ |

**Verdict**: The 5-question contract is the strongest part of the AI trust architecture. Implementation must be strict.

### 3.3 Failure Mode Analysis

| Failure Mode | Covered? | Assessment |
|-------------|----------|-----------|
| Model unavailable | ✅ Section 8.2 — Provider failover, circuit breaker, rule-based fallback | Strong |
| Low confidence | ✅ Section 8.1 — 4-level fallback with specific UX treatment | Strong |
| Data quality insufficient | ✅ Section 8.3 — Per-deficiency fallback defined | Strong |
| Model returns garbage | ✅ Section 8.2 — Confidence filter catches < 10% | Strong |
| **Silent data degradation** | ❌ NOT COVERED | What happens when data quality degrades slowly (e.g., OCR accuracy drifts from 94% to 87% over 3 months)? No monitoring or alerting defined. |
| **Confidence drift** | ❌ NOT COVERED | What happens when AI confidence systematically drifts (e.g., matching confidence drops from 88% to 72% after a model update)? No rollback trigger. |
| **Human-in-the-loop failure** | ❌ NOT COVERED | What happens when the assigned human does not respond? SLA escalation covers this for individual items, but not for systemic unavailability. |

**Verdict**: Strong for acute failures. Weak for chronic/slow degradation.

### 3.4 Explainability Contract — Validated with Users?

The 5-question explainability contract is well-designed but **it has not been validated with any user**. The spec assumes:
- Finance professionals want to see a reasoning chain
- They understand confidence distributions
- They will read collapsible explainability sections

These are reasonable hypotheses but:
- No user has been shown the canonical format (Section 5.2) and asked: "Does this help you decide?"
- No user has been asked: "How much explainability is too much?"
- No user has been asked: "Do you prefer a confidence score or a traffic light?"

**Risk**: The design may be too detailed for routine users (AP Clerks processing 50 invoices/day) and not detailed enough for exception users (Auditors investigating a specific transaction).

**Recommendation**: Conduct prototype reviews with 3+ users from different personas showing the explainability format side-by-side with a simpler alternative. Validate the right level of detail per persona.

### 3.5 AI Action Logging

| Requirement | Assessment |
|-------------|-----------|
| **Schema defined?** | ✅ Section 7.1 — Complete `AIAuditRecord` interface with 17 fields |
| **Immutable?** | ✅ Append-only at database trigger level |
| **Searchable?** | ✅ By capability, entity, date, confidence band, human action, user |
| **Retention?** | ✅ 7 years — regulatory compliance |
| **Input hash?** | ✅ SHA-256 for reproducibility |
| **Model version?** | ✅ Every action records model version |
| **Override chain?** | ✅ Fully traceable — overrides link to original recommendation |

**Verdict**: The AI audit architecture is comprehensive and industry-leading. The checksum chain for AI audit records (Section 7.3) goes beyond typical ML logging.

---

## 4. Trust-Building Mechanisms

### 4.1 Adoption Ramp

The spec does not define how trust grows over time. This is a gap.

| Phase | Current Spec | Recommendation |
|-------|-------------|----------------|
| **Day 1** | All AI outputs visible with confidence scores | Add: "AI transparency tour" — first-time user sees tooltip explainers for every AI output |
| **First 30 days** | Override rate monitored | Add: Weekly digest showing "Your AI acceptance rate: 72% — here's what you overrode most often" |
| **Day 90** | Accuracy targets at 90-day threshold | Add: "AI trust score" dashboard — per-capability accuracy, trend, comparison to team average |
| **Day 180** | Full targets | Add: "You have saved approximately X hours using AI" — personal time-saved metric |

**Issue**: The spec measures trust (T1 User Confidence Score) but does not build trust proactively. Trust is expected to emerge from accurate AI outputs. For an enterprise financial system, trust must be explicitly designed.

### 4.2 Transparency Reports

The spec requires quarterly AI audit (Section 7.2, item 9) but does not define a **user-facing** transparency report.

| What's Missing | Why It Matters |
|----------------|----------------|
| **Monthly AI performance dashboard** for AP Managers | Shows acceptance rate, override reasons, accuracy trends at a glance |
| **Per-user AI impact report** | "Your AI accepted 847 recommendations this month, saving approximately 28 hours of review time" |
| **AI model version changelog** communicated to users | "Version 2.3 improves GL coding accuracy from 82% to 86% — learn what changed" |

**Recommendation**: Add a monthly AI transparency report accessible from the AP dashboard. Include: accuracy by capability, override rate and top override reasons, time saved estimate, model version and change summary, known limitations.

### 4.3 Training

The spec does not address user onboarding for AI interaction.

| What's Missing | Risk |
|----------------|------|
| **No training module for AI interaction** | Users may not understand confidence scores, leading to over-trust or under-trust |
| **No "AI explainer" in-product** | First-time users see "Confidence: 87%" with no context for what that means |
| **No escalation path for AI issues** | User who suspects an AI error must know how to report it for investigation |

**Recommendation**: Add an AI interaction guide as part of the AP workflow onboarding. 5-minute interactive tutorial covering: reading confidence scores, overriding AI recommendations, reporting suspected errors, understanding the audit trail.

---

## 5. Critical AI Trust Risks

### 5.1 AI Confidence Wrong (High Confidence on Wrong Recommendation)

**Risk**: AI reports 94% confidence but the recommendation is incorrect.

**Detection mechanisms in spec**:
- Override rate monitoring (Section 9.4) — if override rate > 15% for a capability, alert AI Governance Board
- No automated detection of "high confidence but wrong"

**Gap**: High confidence + no override = user accepted a wrong recommendation. The system never knows it was wrong unless the downstream outcome surfaces it (payment rejected, GL mismatch, vendor complaint). These downstream signals are not connected back to AI audit in the current spec.

**Recommendation**: Add downstream validation feedback loop. When a payment fails or a GL posting is corrected, trace back to the AI recommendation that influenced it. "GL coding was wrong → was it an AI suggestion that was accepted? → log this as a false positive for the AI model."

### 5.2 AI Hallucination on Match Results

**Risk**: AI matches invoice to the wrong PO. Both PO numbers are valid. The match appears correct.

**Spec coverage**: The matching engine is deterministic for available data. If the AI selects the wrong PO from multiple candidates (fuzzy match), the spec requires AP Clerk review if confidence < 95%. However, if there are 10 candidate POs and the AI selects one with 82% confidence, the AP Clerk must review — but will they catch the error?

**Mitigation**: The spec's line-level comparison grid (invoice line vs PO line vs GRN line) is a strong mitigation. If the wrong PO is selected, many lines will show mismatches, triggering exception routing. This is a good architectural defense.

**Recommendation**: Add "PO selection evidence" to match results. Show: "Selected PO-4521 over PO-3891 and PO-5123 because: (1) PO-4521 has matching line items (4/4), (2) PO-3891 has no 'Cloud Services' category, (3) PO-5123 was closed 30 days ago."

### 5.3 AI Fails Silent

**Risk**: AI continues processing but produces degraded results without anyone noticing (e.g., OCR accuracy drifts from 95% to 80% over weeks).

**Spec coverage**:
- Override rate monitoring (Section 9.4) — but this requires users to override
- No automated data quality monitoring for AI inputs/outputs
- No "AI health dashboard" for operations teams

**Recommendation**: Add automated data quality monitoring for every AI capability: tracking confidence mean/std-dev by hour, alerting when confidence drops > 1σ from baseline. This is already partially covered by the ProviderDriver circuit breaker (Section 8.2) but systematic degradation is not addressed.

### 5.4 User Over-Trust

**Risk**: Users accept AI recommendations without review because "the AI is usually right." This is the single biggest trust risk for any AI system.

**Spec coverage**:
- Evidence Before Approval (P6) — approval disabled until evidence viewed
- AI recommendations labelled as recommendations
- Confidence score always visible

**These are necessary but not sufficient.** An AP Clerk processing 100 invoices/day will develop "AI blindness" within 2 weeks. The evidence view requirement becomes a ritual scroll rather than genuine review.

**Recommendation**:
1. **Variable friction**: Randomly require confirmation for 5% of high-confidence recommendations. Like airport security — unpredictable checks keep everyone honest.
2. **Time-based forced review**: If user accepts 10 AI recommendations in under 30 seconds total, force a single detailed review.
3. **Spot-check requirement**: Random 1% of AI-accepted recommendations require a detailed reason from the user: "Why did you accept this recommendation?"

### 5.5 User Under-Trust

**Risk**: Users ignore AI completely, defeating the purpose of automation.

**Spec coverage**: Override rate monitoring (Section 9.4) triggers AI Governance Board review if override rate > 25%.

**This is covered architecturally.** The question is whether the Governance Board will identify *why* users are overriding (lack of trust vs system error vs preference) and address the root cause. The spec should define:
- Override reasons are categorised (TRUST, ACCURACY, POLICY, PREFERENCE)
- If TRUST-related overrides exceed 50%, trigger user education intervention
- If ACCURACY-related overrides exceed 50%, trigger model retraining

---

## 6. Trust Verdict

### 6.1 Per-Action Verdicts

| AI Action | Verdict | Key Strength | Key Concern |
|-----------|---------|--------------|-------------|
| AP-AI-01 OCR Extraction | **PASS** | Per-field confidence with alternatives | Document type misclassification not covered |
| AP-AI-02 Three-Way Match | **PASS** | Deterministic with line-level detail | Initial auto-match rate may underperform expectations |
| AP-AI-03 Duplicate Detection | **PASS** | Five match types + false positive feedback | Ambitious recall target (>99%) will cause false positives |
| AP-AI-04 Anomaly Detection | **PASS** | Statistical + behavioural detection | 2σ threshold will cause alert fatigue |
| AP-AI-05 GL Coding | **PASS** | Four-tier confidence + top-3 alternatives | Workload impact of 15% correction rate unaddressed |
| AP-AI-06 Cash Flow | **CONDITIONAL** | Tiered horizon confidence | [HYPOTHESIS] — no user validation |
| AP-AI-07 Risk Scoring | **CONDITIONAL** | Factor breakdown + trend | Weighting not validated with users |
| AP-AI-08 Audit Trail | **PASS** | Deterministic, verifiable | Strongest action in spec |

### 6.2 Cross-Cutting Verdicts

| Topic | Verdict | Key Issue |
|-------|---------|-----------|
| Confidence Calibration | **CONDITIONAL** | Universal 70% threshold is not per-capability calibrated |
| Explainability Contract | **PASS** | Strong 5-question model. Not validated with users. |
| Failure Mode Coverage | **CONDITIONAL** | Acute failures covered. Chronic degradation not covered. |
| AI Audit Logging | **PASS** | Industry-leading. Checksum chain on AI records. |
| Trust-Building Mechanisms | **FAIL** | No adoption ramp, no transparency reports, no training defined |
| Over-Trust Prevention | **CONDITIONAL** | Structural controls exist. Behavioural controls missing. |
| Under-Trust Response | **CONDITIONAL** | Monitored but root cause analysis not defined |

### 6.3 Overall Verdict

**CONDITIONAL PASS — Significant trust-building mechanisms must be added before production deployment.**

Strengths:
- The AI philosophy ("AI explains but never decides") is correct and constitutionally grounded
- The 5-question explainability contract is best-in-class for enterprise financial AI
- Confidence models are well-designed with appropriate per-capability granularity
- AI audit logging with checksum chain exceeds typical ML governance requirements
- 8/8 AI actions meet the 5 trust dimensions structurally

Critical Gaps:
1. **No trust-building program** — The spec defines how AI behaves but not how trust is built over time. New users are expected to trust AI from day 1. Trust is not a feature; it is an emergent property of repeated correct interactions. The spec must define how this emergence is accelerated.
2. **Over-trust prevention is insufficient** — "Label as recommendation" + "show confidence" will not prevent automation bias at scale. Behavioural friction is required.
3. **Confidence calibration is universal not per-capability** — The 70% mandatory-review threshold is a blunt instrument. Per-capability thresholds exist in the confidence model but are overridden by the universal guardrail.
4. **Chronic degradation undetected** — The spec handles acute failures (model unavailable, timeout) but not slow degradation (accuracy drift, confidence drift). No automated data quality monitoring for AI outputs.
5. **Zero user validation** — No explainability format, confidence model, or threshold has been tested with actual finance professionals. The trust architecture is internally consistent but externally unvalidated.

### 6.4 Required Actions Before Phase 21B Production

| Priority | Action | Addresses |
|----------|--------|-----------|
| **P0** | Validate explainability format with 3+ design partners | Gap #5 — Zero user validation |
| **P0** | Calibrate confidence thresholds per-capability (not universal 70%) | Gap #3 — Universal threshold |
| **P1** | Define trust-building program: adoption ramp, transparency reports, training | Gap #1 — No trust building |
| **P1** | Add behavioural over-trust prevention: variable friction, spot-checks | Gap #2 — Over-trust insufficient |
| **P1** | Add chronic degradation monitoring: confidence drift, data quality trends | Gap #4 — Silent failure |
| **P1** | Implement downstream validation feedback loop for AI recommendations | CR-01, CR-02 — Wrong high-confidence |
| **P2** | Add per-user AI impact reporting | Gap #1 — Trust building |
| **P2** | Define AI Governance Board operating procedures | Section 9.4 override alert |
