---
title: "Customer Traceability Audit — AP Reference Workflow v2.0"
created: 2026-07-28
phase: "27.1R"
version: "1.0"
authority: Independent Product Review
classification: Internal — Engineering & Product
tags: [product, ap, evidence, traceability, review]
---

# Customer Traceability Audit — AP Reference Workflow v2.0

## 1. Audit Methodology

Every major product decision in the EPS is traced to its evidence base. Each item is classified into one of five traceability levels:

| Level | Definition | Count in EPS |
|-------|-----------|-------------|
| **Validated** | 3+ independent sources confirming the same claim | 2 themes (T3, T5), 3 principles (VP4, VP5, VP6) |
| **Supported** | 1-2 sources, specifically mentioned in interview context | 8 rules, 1 AI action, 4 principles |
| **Emerging** | 1 source, low confidence, not explored in depth | 15 rules, 3 AI actions, 2 themes |
| **Hypothesis** | Inferred from patterns, no direct evidence | 28 rules, 2 AI actions, 2 themes, 5 principles |
| **Unsupported** | No evidence found, not marked as hypothesis | 0 — EPS is honest about evidence gaps |

**Methodology**: For each decision, the cited evidence source was reviewed. If the source was a CRM note (medium confidence) or an inference (hypothesis), the trace was downgraded. Only direct interview quotes (E1) and validated themes (T3, T5) were treated as Strong evidence.

---

## 2. Traceability Matrix

### 2.1 Workflow Stages (1-10) to Evidence

| Stage | Primary Evidence | Secondary Evidence | Confidence | Assessment |
|-------|-----------------|-------------------|------------|------------|
| 1. Invoice Received | E1 (T2): "manual reconciliation" | None | High | **Supported**. Stage is well-evidenced by the core pain point. |
| 2. Invoice Validated | E1 (Adeel): "manual oversight for accuracy" | E4: "automated reconciliation desired" | High | **Supported**. Evidence assembly is core to reducing manual oversight. |
| 3. Three-Way Match | E1/E2 (T2): manual matching is pain | E4: "automated reconciliation" | High | **Supported**. Matching is the central pain point T2. |
| 4. Exception Queue | E4: "intelligent discrepancy alerts" | E5: "approval bottlenecks" | Medium | **Supported**. E4 directly supports exception intelligence. |
| 5. Approval Routing | E1/E2 (T1): approval delays | E5: "approval bottlenecks" | High | **Supported**. T1 is the strongest theme (4 sources). |
| 6. Payment Readiness | E3: "instant view of cash positions" | H-02/H-06 (hypothesis) | Low | **Emerging**. Single source (E3) for cash visibility. Batch processing and discount capture are hypothetical. |
| 7. Treasury Approval | E3: "instant view of cash positions" | E9: treasury feedback | Low | **Emerging**. Cash availability verification is inferred from E3. Dual-signature is unvalidated. |
| 8. Payment Execution | VP5: Financial Precision | E9: treasury reliability | Medium | **Supported**. Payment execution is mandated by financial integrity constitutionally. |
| 9. GL Posting | E5: "manual account reconciliation" | None | Medium | **Supported**. E5 directly identifies manual reconciliation as a pain point. |
| 10. Audit & Reconciliation | E5: "manual bank reconciliation" | VP4: audit constitutional | Medium | **Supported**. E5 directly identifies manual bank reconciliation. |

**Assessment**: Stages 1-5 are well-evidenced (High to Medium confidence). Stages 6-7 are weakly evidenced (Low confidence). Stages 8-10 are constitutionally supported but have limited customer evidence.

**Gap**: The entire Payment Readiness → Treasury Approval segment (Stages 6-7) has the weakest customer evidence in the workflow. These are built on E3 (single source, CRM note) and hypotheses. If payments are wrong, adoption fails.

### 2.2 Top 20 Business Rules to Evidence

| Rule | Stated Evidence | Actual Confidence | Assessment |
|------|----------------|-------------------|------------|
| BR-001 Required Fields | E1 (T2): completeness prerequisite | High — structural invariant | **Supported**. No customer needs to validate this. |
| BR-006 Duplicate Block | E1 (T2): "error-prone" | Medium — T2 supports pain, not the specific rule | **Supported**. Reasonable inference. |
| BR-013 Three-Way Match | E1 (T2): manual matching is pain | Medium — supports matching need, not the 2%/3-way specifics | **Supported**. Matching is the pain. The specific rule is structural. |
| BR-026 SoD Creator | Constitution + SOX | High — compliance requirement | **Supported**. Customer evidence not needed for regulatory compliance. |
| BR-030 Threshold Approval | E1 (T1): "approval delays" | Medium — supports approval pain, not threshold levels | **Supported**. Approval is the pain. Threshold structure is configurable. |
| BR-043 Treasury Approval | Constitution: financial integrity | High — constitutional | **Supported**. Constitutional requirement. |
| BR-046 Idempotent Payment | VP5: Financial Precision | High — engineering requirement | **Supported**. Architectural invariant elevated to business rule. |
| BR-056 Exception SLA | WP1: "Exceptions Deserve Attention" | Low — no customer evidence for SLA thresholds | **Emerging**. The concept is supported, the thresholds are not. |
| BR-014 2-Way Match for Services | [HYPOTHESIS] | None | **Hypothesis**. No evidence. |
| BR-002 90-Day Past Date | [HYPOTHESIS] | None | **Hypothesis**. Industry standard, not customer-validated. |
| BR-033 Delegation Chain | HP2 [HYPOTHESIS] | None | **Hypothesis**. |
| BR-035 Escalation on SLA Breach | E1 (T1): approval delays | Medium — supports escalation concept, not SLA thresholds | **Supported**. |
| BR-048 Dual-Signature $50K+ | [HYPOTHESIS] | None | **Hypothesis**. Industry pattern, not customer-validated. |
| BR-050 Payment Retry | E9: treasury reliability | Low — single CRM source | **Emerging**. |
| BR-007 Currency Must Be Supported | T7 [HYPOTHESIS] | None | **Hypothesis**. |
| BR-017 Price Tolerance per Vendor | [HYPOTHESIS] | None | **Hypothesis**. Industry standard, not customer-validated. |
| BR-059 Resolution Reason | VP4: Every Action Is Auditable | High — constitutional | **Supported**. |
| BR-003 Invoice Amount Positive | VP5: Financial Precision | High — mathematical invariant | **Supported**. |
| BR-062 Checksum Chain | VP4: Every Action Is Auditable | High — constitutional | **Supported**. |
| BR-010 OCR Confidence Threshold | VP3: Trust Requires Accuracy | Medium — principle supports the concept, threshold is arbitrary | **Supported**. |

**Assessment**: 12/20 rules are Supported or better. 5/20 are Hypothesis. 3/20 are Emerging. The top 20 rules are reasonably traced but heavily weight constitutional authorities (VP4, VP5) which are internal, not customer-derived.

### 2.3 Product Principles (P1-P10) to Evidence

| Principle | Tracer | Confidence | Assessment |
|----------|--------|------------|------------|
| P1 Trusted Information Before Transactions | Adeel Aslam (E1) + T2 (4 sources) | High | **Validated**. 4 sources confirm. |
| P2 Automate Preparation, Not Decisions | T2 (4 sources) + Muhammed Jamsheed (E4) | High | **Validated**. 5 sources. |
| P3 Preserve Human Judgement | Khaleel Ur Rehman (CRM) + P3 principle | Medium | **Supported**. Khaleel's "support you" is one source. |
| P4 Context Before Action | T1 (4 sources) + Mohamed Gamal (E5) | High | **Validated**. 4 sources support approval bottlenecks. |
| P5 Exceptions First | Muhammed Jamsheed (E4) + T2 (4 sources) | High | **Validated**. 5 sources. |
| P6 Evidence Before Approval | P3 (3 sources) + Adeel Aslam (E1) | High | **Validated**. 4 sources. |
| P7 One Financial Truth | T3 (3 sources) + Ayman Shawky (E3) | High | **Validated**. 4 sources. |
| P8 Decision Readiness | Phase 27.0A + Mohamed Gamal (E5) | Medium | **Supported**. |
| P9 Audit Trail Is Non-Negotiable | Constitutional | High | **Supported**. Constitutional authority. |
| P10 Multi-Currency Is First-Class | Ayman Shawky (E3) + T7 [HYPOTHESIS] | Low | **Emerging**. Only 1 source plus a hypothesis theme. |

**Assessment**: 8/10 principles are Supported or better. P8 is medium (design process, not customer). P10 is the weakest (1 source + hypothesis). The principles are the strongest part of the spec's evidence base.

### 2.4 AI Actions to Evidence

| AI Action | Evidence | Confidence | Assessment |
|-----------|----------|------------|------------|
| AP-AI-01 OCR Extraction | T2 (4 sources): manual reconciliation | Medium | **Supported**. OCR is the automation of manual data entry. |
| AP-AI-02 Three-Way Match | T2 (4 sources) + E1 + E4 | High | **Validated**. Matching is the primary pain point. |
| AP-AI-03 Duplicate Detection | T2 (4 sources) + E1 | Medium | **Supported**. Duplicates slip through in manual processes. |
| AP-AI-04 Anomaly Detection | E3: "confidence scoring" + T6 (2 sources) | Low | **Emerging**. Anomaly detection is an extrapolation from confidence scoring need. |
| AP-AI-05 GL Coding | E5: "manual account reconciliation" + T5 (3 sources) | Medium | **Supported**. GL coding is a contributor to month-end close pain. |
| AP-AI-06 Cash Flow Prediction | [HYPOTHESIS] — E3 interest, not validated | None | **Hypothesis**. The weakest AI action in evidence terms. |
| AP-AI-07 Vendor Risk Scoring | [HYPOTHESIS] — industry pattern | None | **Hypothesis**. No direct customer evidence. |
| AP-AI-08 Audit Trail Analysis | VP4 + T5 (3 sources) | High | **Supported**. Audit is constitutionally required and month-end close pain is validated. |

**Assessment**: 3/8 AI actions are Supported. 2/8 are Hypothesis. The AI evidence base is weaker than the workflow or rule evidence bases. Two of the most complex AI actions (Cash Flow Prediction, Vendor Risk Scoring) have zero customer evidence.

### 2.5 Personas to Evidence

| Persona | Evidence | Confidence | Assessment |
|---------|----------|------------|------------|
| AP Clerk | E1 (Adeel): "manual oversight" | High | **Supported**. Direct relevance from discovery interview. |
| AP Manager | E1, E2 (T1): approval delays | High | **Supported**. |
| Controller | E5 (Mohamed Gamal): manual reconciliation | Medium | **Supported**. Single source but detailed. |
| Treasury Manager | E3 (Ayman Shawky): cash visibility + E9 | Medium | **Supported**. Two CRM sources. |
| Procurement Manager | E4 (Muhammed Jamsheed): ERP integration | Medium | **Supported**. Single CRM source with specific pain points. |
| CFO | E3 (Ayman Shawky): "single source of truth" | Low | **Emerging**. Inferred from E3. Not a direct CFO interview. |
| Approver (Dept Head) | E1 (T1): "approval delays" | Medium | **Supported**. Approval pain is validated. Persona is inferred. |
| Auditor | VP4: constitutional | Low | **Emerging**. No customer evidence — the auditor persona is extracted from the constitution, not from user research. |
| Vendor (External) | E7 (Ahmed Orabi): AP/P2P needs | Low | **Emerging**. Single CRM source. |

**Assessment**: 7/9 personas have at least Medium confidence. CFO and Auditor personas are weak — no direct interview with either role has been conducted. The Auditor persona is constitutionally derived, not customer-derived.

---

## 3. Evidence Gaps

### 3.1 Gap A: Exception Queue Prioritised by Financial Impact

| Claim | "Exception queue prioritised by financial impact reduces resolution time" (H-07) |
|-------|--------------------------------------------------------------------------------|
| **Evidence** | None. Marked as hypothesis in the hypothesis register. WP1 says "Exceptions Deserve Attention" but does not specify prioritisation method. |
| **Risk** | Medium. If users prefer chronological or SLA-based ordering, impact-based ordering may create confusion. |
| **Validation Needed** | Prototype review: show two versions of exception queue (chronological vs impact-sorted). Measure task completion time and error rate. |
| **Target** | 2+ design partners. |

### 3.2 Gap B: Three-Way Match Tolerance Configurable per Vendor

| Claim | Price tolerance should be configurable per vendor/category (BR-013, BR-014, BR-017) |
|-------|-------------------------------------------------------------------------------------|
| **Evidence** | [HYPOTHESIS]. No customer has said "I need different tolerances for different vendors." Inferred from standard AP practice. |
| **Risk** | Medium-High. If configurable tolerance is built but users only use a single global tolerance, the configuration UI is wasted complexity. |
| **Validation Needed** | Workflow discovery: "Do you apply different price tolerance to different vendors? Can you give me an example?" |
| **Target** | 3+ AP Managers. |

### 3.3 Gap C: Batch Payment Preference

| Claim | "AP teams prefer batch payment proposals over individual processing" (H-02) |
|-------|-----------------------------------------------------------------------------|
| **Evidence** | [HYPOTHESIS]. Adeel Aslam mentions approval workflows but never says "we batch payments." |
| **Risk** | High. If the entire Payment Readiness stage (6) is built around batch processing but users prefer individual payment execution, the stage must be re-architected. |
| **Validation Needed** | Workflow discovery: "Do you batch your payments? How often? Do you ever pay individual invoices outside the batch cycle?" |
| **Target** | Khaleel Ur Rehman + Ahmed Abdelmoneim (Treasury). |

### 3.4 Gap D: Multi-Level Approval Chain Optimal Depth

| Claim | 5-level approval is the right structure (BR-026 through BR-030) |
|-------|----------------------------------------------------------------|
| **Evidence** | [HYPOTHESIS]. The 5-level structure ($1K/$10K/$50K/$250K/$250K+) is a best-guess threshold ladder. |
| **Risk** | Medium. 5 levels may be too many for small organisations (creating delay) or too few for large enterprises (insufficient granularity). |
| **Validation Needed** | Context interview: "Walk me through your approval process. How many approvers touch a $100K invoice? A $1M invoice?" |
| **Target** | 3+ Controllers or AP Managers. |

### 3.5 Gap E: Department Manager as Separate Persona

| Claim | Department Manager is a distinct persona in the AP workflow |
|-------|------------------------------------------------------------|
| **Evidence** | None. The Approver persona (Persona 7 in Section 11) is described as "Dept Head" but no interview with a Department Manager has been conducted. The persona is inferred from the approval matrix design. |
| **Risk** | Medium. If Department Managers don't see invoice approval as a significant part of their role, they will ignore notifications and breach SLAs. |
| **Validation Needed** | Context interview: "Do you approve invoices for your department? How much time do you spend on it? How do you decide?" |
| **Target** | 2+ Department Managers from design partner organisations. |

### 3.6 Gap F: Auditor Persona

| Claim | Auditor needs automated audit trail and checksum verification |
|-------|--------------------------------------------------------------|
| **Evidence** | VP4 (Constitutional). No customer evidence from an actual auditor. |
| **Risk** | High. If real auditors need different data formats, different sampling methodologies, or different integrity proofs, the audit system will need rework. |
| **Validation Needed** | Context interview with external auditor: "What does a complete audit trail look like for you? How do you verify payment integrity today?" |
| **Target** | 1-2 external auditors from design partner organisations or referral. |

---

## 4. Weak Evidence

### 4.1 AI Confidence at 70% Threshold

| Source | Type | What Was Said |
|--------|------|---------------|
| Ayman Shawky (E3) | CRM note | "Need for confidence scoring on forecasts" |
| Mohamed Gamal (E5) | CRM note | "Automated reconciliation with trust" |

**Analysis**: Two CRM notes mention confidence/trust in different contexts. Neither specifies "70%." The 70% threshold is a product design decision extrapolated from vague references to "confidence scoring." This is not customer evidence — it is product intuition attributed to customers.

**Recommendation**: Recategorise the 70% threshold from Medium (supported by E3, E5) to Hypothesis. Do not build the universal 70% guardrail until it is validated.

### 4.2 AI-Powered GL Coding

| Source | Type | What Was Said |
|--------|------|---------------|
| Mohamed Gamal (E5) | CRM note | "Manual account reconciliation" — automated reconciliations desired |
| T5 | Validated theme | Month-end close is painful |

**Analysis**: GL coding is inferred from month-end close pain and the desire for automated reconciliation. No customer has said "I want AI to suggest GL codes." The connection is reasonable but not direct.

**Recommendation**: Keep at Working (not downgraded) but add a customer validation goal: "Show prototype of AI GL coding suggestions to 3 design partners. Measure: would you use this? At what confidence would you trust it?"

### 4.3 Real-Time AP Aging

| Source | Type | What Was Said |
|--------|------|---------------|
| Ayman Shawky (E3) | CRM note | "Need for instant view of cash positions across all accounts" |

**Analysis**: Ayman wants "instant view of cash positions" — this is about bank balances, not AP aging. AP aging is a different metric (amount owed to vendors, timing of payments). The connection between "instant cash positions" and "real-time AP aging" is speculative.

**Recommendation**: Downgrade real-time AP aging from Working to Emerging. Validate with design partners: "Do you need real-time AP aging? Or is daily batch sufficient for your reconciliation process?"

### 4.4 Early-Pay Discount Capture (H-06)

| Source | Type | What Was Said |
|--------|------|---------------|
| H-13 (Hypothesis) | Industry pattern | No customer evidence |

**Analysis**: Zero customer evidence. The discount capture logic (NPV calculation, optimal payment timing within discount window) represents significant engineering investment with no validation that users (a) receive early-pay discounts, (b) care about capturing them, or (c) would trust an AI to optimise timing.

**Recommendation**: Reclassify from Hypothesis → Track (lower priority). Do not build discount capture in Phase 21B v1.0. Validate with design partners before committing engineering.

---

## 5. Unsupportable Claims

After reviewing all EPS documents, **no claims were found that are entirely unsupported and not marked [HYPOTHESIS].** The EPS is honest about its evidence gaps. Every significant assumption is tagged.

However, several claims are **stretched** — they use evidence that supports a narrower claim than the one being made:

| Stretched Claim | Evidence Used | Actual Support | Recommendation |
|----------------|---------------|----------------|----------------|
| "AP workflow is grounded in 10 customer sources" (EPS Section 2) | 10 sources listed | Only E1 (Adeel) is a direct discovery interview. E3-E10 are CRM notes — medium confidence. Only 1 of 10 sources is a formal interview. | Update claim: "1 formal interview + 8 CRM contacts + 4 validated themes." |
| "Every design decision traces to customer evidence" (EPS Section 1) | Evidence tags throughout | 28 of 65 rules are [HYPOTHESIS] (43%). 2 of 8 AI actions are [HYPOTHESIS]. 2 of 10 product principles are [HYPOTHESIS]. | Add: "...where direct evidence exists. Where evidence is insufficient, assumptions are explicitly tagged [HYPOTHESIS]." |
| "Designed for CFOs who need confidence in every payment" (REFERENCE_WORKFLOW_AP Section 1) | No CFO interview conducted | CFO persona is derived from Ayman Shawky (Chief Accountant) — not a CFO. | Replace "CFO" with "Finance Leaders" or validate with actual CFOs. |
| "AI confidence below 70% triggers mandatory human review" (AI Behaviour Guide Section 1.3) | E3 + E5 | Neither source specified 70%. Both mentioned confidence scoring. | Tag as [HYPOTHESIS]. |

---

## 6. Evidence Quality Assessment

### 6.1 Source Ratings

| Source | Type | Date | Quality | Confidence | Assessment |
|--------|------|------|---------|------------|------------|
| **E1 — Adeel Aslam** | Discovery interview | 2026-07-21 | High — direct quotes, transcript, role context | **High** | The strongest evidence source. Direct interview with specific quotes. |
| **E2 — Ahmed Shatla** | Discovery call | 2026-07-21 | Medium — referral, limited detail | **Medium** | Supports T1 and T2 themes but lacks specificity. |
| **E3 — Ayman Shawky** | CRM notes | unknown | Medium — several specific quotes | **Medium** | Multiple insights (cash visibility, confidence scoring, siloed systems). But CRM notes lack interview context. |
| **E4 — Muhammed Jamsheed** | CRM notes | unknown | Medium — specific pain points | **Medium** | "Automated reconciliation desired," "intelligent discrepancy alerts." Good specificity. |
| **E5 — Mohamed Gamal** | CRM notes | unknown | Medium — specific pain points | **Medium** | Manual bank reconciliation, approval bottlenecks, month-end close. Detailed. |
| **E6 — Khaleel Ur Rehman** | CRM interaction | unknown | Medium — strong engagement signal | **Medium** | "What can I do to support you?" — strongest engagement but not yet interview evidence. |
| **E7 — Ahmed Orabi** | CRM interaction | unknown | Medium — AP/P2P role | **Medium** | Requested Perionyx info. High design partner potential. |
| **E8 — Eslam Sobhi** | CRM notes | unknown | Low — treasury operations feedback | **Low** | General treasury feedback. Limited specific quotes. |
| **E9 — Ahmed Abdelmoneim** | CRM notes | unknown | Low — treasury, Odoo, Power BI | **Low** | Treasury integration feedback. Limited AP-specific evidence. |
| **E10 — Mahmoud Shaker** | CRM notes | unknown | Low — FP&A interest | **Low** | Financial planning interest. Limited AP relevance. |
| **T1 — Manual Approvals Delay** | Theme synthesis | 2026-07-21 | 4 sources converging | **High** | Strong theme across multiple sources. |
| **T2 — Manual Reconciliation** | Theme synthesis | 2026-07-21 | 4 sources converging | **High** | The strongest theme in the spec. |
| **T3 — ERP Silos** | Theme synthesis | 2026-07-21 | 3 sources converging | **High** | Validated by Ayman, Muhammed, and industry pattern. |
| **T4 — Real-Time Cash** | Theme synthesis | 2026-07-21 | 2 sources | **Working** | Supported but limited to Ayman and inferred. |
| **T5 — Month-End Close** | Theme synthesis | 2026-07-21 | 3 sources converging | **High** | Validated pain point. |
| **T6 — AI Forecasting** | Theme synthesis | 2026-07-21 | 2 sources | **Working** | Interest exists but trust is cautious. |
| **T7 — Multi-Currency** | Theme synthesis | 2026-07-21 | 0 direct sources | **Hypothesis** | No customer evidence. |
| **T8 — Regulatory Compliance** | Theme synthesis | 2026-07-21 | 0 direct sources | **Hypothesis** | No customer evidence. |

### 6.2 Overall Evidence Quality

| Metric | Value | Assessment |
|--------|-------|------------|
| Total customer sources | 10 | 1 formal interview + 8 CRM contacts + 1 discovery call |
| Formal interviews | 1 (E1 — Adeel Aslam) | **Insufficient** for an enterprise product spec |
| CRM notes | 8 (E3-E10) | Medium confidence — CRM notes lack interview depth |
| Validated themes | 3 (T3 ERP Silos, T5 Month-End, T1 Approvals) | 3 themes validated. T2 has 4 sources but is Working not Validated. |
| Hypothesis themes | 2 (T7 Multi-Currency, T8 Compliance) | Unable to validate — no sources |
| Rules with evidence | 37 of 65 (57%) | 28 rules hypothesis (43%) |
| AI actions with evidence | 6 of 8 (75%) | 2 hypothesis |
| Principles with evidence | 8 of 10 (80%) | 2 hypothesis (P10 Multi-Currency) |

**Key Finding**: The EPS has **1 formal customer interview** (Adeel Aslam) supporting the entire AP workflow specification. The remaining evidence is 8 CRM notes (medium confidence, no interview transcripts) and 4 synthesised themes. For an enterprise product specification that claims "every design decision is traceable to customer evidence," this is thin.

**Context**: This is a reasonable starting point for a pre-product-market-fit startup in discovery phase. The evidence base is honestly documented with [HYPOTHESIS] tags. The quality concern is not the evidence itself but the **gap between the evidence claim** ("Every design decision grounded in customer evidence") and the **reality** ("1 interview + 8 CRM notes + 4 themes").

---

## 7. Recommendations

### 7.1 Immediate (Before Phase 21B Implementation)

| Priority | Recommendation | Rationale |
|----------|---------------|-----------|
| **P0** | Conduct formal interviews with 3 design partner candidates | The EPS relies on 1 formal interview. 3 more interviews would validate or challenge the core workflow assumptions. |
| **P0** | Upgrade the evidence claim to match reality | "Grounded in 1 formal interview, 8 CRM sources, and 3 validated themes. 43% of rules remain hypothetical." Honesty builds trust with reviewers. |
| **P1** | Interview a real CFO or Controller | CFO and Auditor personas are inferred. One CFO interview would validate or reshape Stages 5-8 (Approval → Payment). |
| **P1** | Validate Stages 6-7 (Payment Readiness, Treasury Approval) with a Treasury Manager | These stages have the weakest evidence in the workflow. Ahmed Abdelmoneim is available. |
| **P1** | Recategorise the 70% confidence threshold from Working to Hypothesis | No customer specified "70%." This is a product design decision being misrepresented as customer-backed. |

### 7.2 Short-Term (Phase 21B Implementation)

| Priority | Recommendation | Rationale |
|----------|---------------|-----------|
| **P1** | Validate batch payment preference before building batch architecture | Stage 6 (Payment Readiness) is built on H-02 [HYPOTHESIS]. If invalidated, significant rework. |
| **P0** | Validate approval threshold ladder before building 5-level routing | BR-026 through BR-030 are entirely hypothesis. A 3-level ladder (flat approval for all amounts) may be sufficient for v1. |
| **P1** | Conduct auditor interview before building audit trail export | The Auditor persona is constitutionally derived. Real auditors may need different data formats, sampling, or integrity proofs. |
| **P0** | Validate real-time AP aging vs batch reporting | E3 supports "instant view of cash positions" (bank balances), not AP aging. Perpetual batch (hourly refresh) may be sufficient. |
| **P1** | Prototype test the explainability format with AP Clerks | The canonical AI explainability format may be too detailed for routine use. Validate with the highest-volume users first. |

### 7.3 Medium-Term (Phase 21C-21D)

| Priority | Recommendation | Rationale |
|----------|---------------|-----------|
| **P1** | Validate multi-currency importance (H-001) before Prisma schema design | T7 is Hypothesis. Multi-currency fields add significant schema complexity. Validate before committing. |
| **P2** | Validate early-pay discount capture (H-06) before building discount optimisation | Significant engineering investment. Validate discount prevalence and user willingness to use AI optimisation. |
| **P2** | Validate vendor self-service portal (H-03) | Portal development is a major feature. Validate value before building. |
| **P1** | Conduct 3-month evidence refresh for E3-E10 sources | CRM notes decay (evidence half-life: 6 months for feature preferences). Re-interview or re-engage before Phase 21C. |

### 7.4 Long-Term (Evidence Infrastructure)

| Priority | Recommendation | Rationale |
|----------|---------------|-----------|
| **P1** | Implement Evidence Decay Tracking as specified in CUSTOMER_VALIDATION_PLAN Section 6.2 | The validation plan defines evidence half-lives but no system for tracking them. Implement quarterly evidence health checks. |
| **P2** | Build customer evidence dashboard | A dashboard showing evidence confidence levels across workflow stages, rules, and principles would guide product decisions. |
| **P2** | Standardise interview documentation format | E1 has a transcript. E3-E10 have CRM notes. Inconsistent formats make cross-source analysis difficult. Use the evidence record template (CUSTOMER_VALIDATION_PLAN Section 6.3) for all future interactions. |

---

## Appendix: Evidence Traceability Map

```
WORKFLOW STAGES
Stage 1  ← E1 (Adeel) ← E3 (Ayman) ← T2 (Validated)
Stage 2  ← E1 (Adeel) ← E4 (Muhammed)
Stage 3  ← E1/E2 ← T2 (4 sources) ← E4 (Muhammed)
Stage 4  ← E4 (Muhammed) ← E5 (Mohamed)
Stage 5  ← E1/E2 ← T1 (4 sources) ← E5 (Mohamed)
Stage 6  ← E3 (Ayman) ← [H-02] ← [H-06]
Stage 7  ← E3 (Ayman) ← E9 (Abdelmoneim)
Stage 8  ← VP5 ← E9
Stage 9  ← E5 (Mohamed) ← T5 (3 sources)
Stage 10 ← E5 (Mohamed) ← VP4

TOP 20 RULES
Constitutional (6): BR-026, BR-031, BR-032, BR-033, BR-037, BR-039
Evidenced (6): BR-001, BR-006, BR-013, BR-030, BR-043, BR-046, BR-050
Hypothesis (5): BR-014, BR-002, BR-033, BR-048, BR-007
Emerging (3): BR-056, BR-035, BR-017

PRODUCT PRINCIPLES
Validated (6): P1, P2, P4, P5, P6, P7  (4+ sources each)
Supported (2): P3, P8                   (1-2 sources)
Working (1): P9                         (constitutional)
Hypothesis (1): P10                     (multi-currency)

AI ACTIONS
Validated (1): AP-AI-02 (Matching)
Supported (3): AP-AI-01 (OCR), AP-AI-03 (Duplicate), AP-AI-05 (GL Coding), AP-AI-08 (Audit)
Hypothesis (2): AP-AI-06 (Cash Flow), AP-AI-07 (Risk Scoring)
```

**LEGEND**: ← = "traces to" | [H-X] = unvalidated hypothesis | VP = Validated Principle (constitutional)
