---
title: "Interview Scoring Protocol — Phase 27.1V"
created: 2026-07-28
updated: 2026-07-28
version: 1.0
phase: 27.1V
tags:
  - type/protocol
  - domain/product
  - domain/customer-intelligence
  - status/active
owner: Product Team
authority: Phase 27.1V
---
# Interview Scoring Protocol — Phase 27.1V

> **Classification**: Restricted — Design Partner Program
> **Status**: Active

---

## 1. Purpose

This protocol ensures that every interview produces **gradable, comparable, actionable evidence**. It defines how evidence is extracted, graded, and applied to product decisions.

---

## 2. Evidence Extraction

### 2.1 Within 24 Hours of Interview

1. Review raw notes and identify all distinct evidence claims
2. For each claim, extract: verbatim quote (or close paraphrase), context (what were they discussing?), implications (what product decision does this affect?)
3. Assign an initial grade using the Evidence Grading Scale
4. Map the claim to: EPS claim ID, hypothesis ID, workflow stage, product principle

### 2.2 Evidence Template

```yaml
evidence_id: EVID-27.1V-{NNN}
interview_id: INT-{NAME}-{DATE}
design_partner: {Full Name}
date: YYYY-MM-DD
interview_type: Context | Workflow Discovery | Prototype Review | Prioritisation
hypotheses_targeted: [H-001, H-002, ...]
duration_minutes: {NN}

claims:
  - id: "T1" | "H-001" | "P1" | "BR-012"
    grade: 0-4
    quote: "Verbatim or close paraphrase"
    context: "Said while discussing [workflow stage / topic]"
    implications: "This affects [specific design decision / architecture choice]"
    confidence_factors:
      - "Spoke with certainty about this pain point"
      - "Described specific process, not hypothetical"
    concerns:
      - "Single industry — may not generalise"

action_items:
  - priority: high
    action: "Update BUSINESS_RULE_LIBRARY.md BR-012 with new evidence"
  - priority: medium
    action: "Flag for PAB review — evidence contradicts Stage 5 design assumption"

decision_gates_triggered:
  - gate: H-001-GATE
    status: VALIDATED | PARTIALLY_VALIDATED | INVALIDATED | NOT_TRIGGERED
    evidence_summary: "Khaleel confirmed multi-currency processing with 5 supplier currencies"
```

---

## 3. Evidence Grading Scale

### 3.1 Grading Criteria

| Grade | Name | Definition | Must Have |
|-------|------|------------|-----------|
| 4 | Validated | 3+ independent sources at Moderate+ | 3 different people said it independently |
| 3 | Strong | 1 source with quantified impact | Specific claim + consequence + context |
| 2 | Moderate | 1 source with specific statement | Claim + context, not hypothetical |
| 1 | Weak | Mentioned in passing | Mentioned but not explored |
| 0 | Pending | No evidence | No data |

### 3.2 Grading Examples

| Grade | Example | Why |
|-------|---------|-----|
| 3 — Strong | "Multi-currency reconciliation costs us 8 hours per month. If automated, I could redeploy to analysis." | Quantified impact, specific pain, clear consequence |
| 2 — Moderate | "We have suppliers in USD and EUR, and reconciling is painful." | Specific statement with context, no quantification |
| 1 — Weak | "I guess multi-currency would be helpful." | Mentioned, not explored, no context |
| 0 — Pending | — | No data |

### 3.3 Confidence Factors (Increase Grade)

| Factor | Adjustment |
|--------|------------|
| Participant described a specific recent event, not general pattern | +1 level |
| Participant quantified time, volume, or cost | +1 level |
| Participant contradicted their own assumption with a real example | +1 level |
| Two interviewers independently recorded the same claim | +1 level |
| Participant used industry-specific terminology accurately | Confirms expertise |
| Participant described workarounds (indicates real friction) | +1 level |

### 3.4 Confidence Detractors (Decrease Grade)

| Factor | Adjustment |
|--------|------------|
| Participant spoke hypothetically ("I would imagine...") | -1 level |
| Participant deferred to "my team would know better" | -1 level |
| Claim contradicts known evidence from other sources | Flag for review |
| Participant is clearly biased toward a particular solution | -1 level |
| Industry is not representative of target market | -1 level |

---

## 4. Decision Gate Logic

### 4.1 Gate Activation Rules

A decision gate is triggered when:

| Rule | Description |
|------|-------------|
| H-XXX-GATE: VALIDATED | 2/2 or 2/3 design partners confirm at Moderate+ level |
| H-XXX-GATE: PARTIALLY_VALIDATED | 1/2 confirms at Moderate+, 1 has not yet been interviewed |
| H-XXX-GATE: INVALIDATED | 2/2 or 2/3 provide contradictory evidence at Moderate+ |
| H-XXX-GATE: NOT_TRIGGERED | Insufficient evidence to make a decision |

### 4.2 Gate Action Matrix

| Gate Status | Action |
|-------------|--------|
| VALIDATED | Proceed with implementation. Update EPS business rules. Document evidence. |
| PARTIALLY_VALIDATED | Continue validation with remaining targets. Design with this evidence but prepare for reversal. |
| INVALIDATED | Stop investment in this area. Revert to fallback design. Document learning in Brain. |
| NOT_TRIGGERED | Continue scheduled interviews. Do not proceed with architecture decisions. |

### 4.3 Critical Gate: 3-Interview Threshold (from D-03)

| Criterion | Verification | Owner |
|-----------|-------------|-------|
| 3 formal AP practitioner interviews completed | Count of interview records in CRM and Brain | Product Director |
| All interview evidence graded and recorded | Evidence records in Evidence Traceability Matrix | Product Team |
| Evidence incorporated into EPS business rules | Updated BUSINESS_RULE_LIBRARY.md | Product Team |
| PAB sign-off on evidence sufficiency | Sign-off document in docs/product/ | Product Architecture Board |

---

## 5. Interview Quality Scoring

### 5.1 Interview Scorecard (1-10)

After each interview, score the quality:

| Dimension | Score (1-10) | Criteria |
|-----------|--------------|----------|
| Evidence density | | Number of gradable claims extracted (target: 5+) |
| Evidence quality | | Average grade of extracted claims (target: 2.5+) |
| Hypothesis coverage | | % of targeted hypotheses addressed (target: 80%+) |
| Engagement depth | | Participant's willingness to discuss details |
| Actionability | | % of claims with clear product implications |
| **Interview Quality Score** | | Average of above (target: 7+) |

### 5.2 Minimum Acceptable Quality

An interview that scores below 5/10 does not count toward the 3-interview gate. Conduct a follow-up or replace with another candidate.

---

## 6. Evidence Processing Workflow

```
Interview Conducted
        │
        ▼
Raw Notes Captured (within 2 hours)
        │
        ▼
Evidence Extraction (within 24 hours)
        │
        ├──→ Grade each claim (0-4)
        ├──→ Map to EPS claims, hypotheses, stages
        └──→ Generate action items
        │
        ▼
Matrix Update (within 48 hours)
        │
        ├──→ Update EVIDENCE_TRACEABILITY_MATRIX.md
        ├──→ Update KNOWLEDGE_GAP_ANALYSIS.md
        └──→ Update design partner profile in Brain
        │
        ▼
Decision Gate Check
        │
        ├──→ Check if H-XXX-GATE triggered
        ├──→ If VALIDATED → notify PAB, update EPS
        └──→ If INVALIDATED → document, update fallback plan
        │
        ▼
Action Items (within 1 week)
        │
        ├──→ Update BUSINESS_RULE_LIBRARY.md
        ├──→ Update AI_BEHAVIOUR_GUIDE.md
        ├──→ Update INFORMATION_ARCHITECTURE.md
        └──→ Flag cross-document dependencies
```

---

## 7. Contradictory Evidence Protocol

When a design partner provides evidence that contradicts existing EPS assumptions:

1. **Document immediately** — do not dismiss or rationalise
2. **Grade normally** — contradictory evidence is still evidence
3. **Flag to Product Team** — within 24 hours
4. **Assess impact** — does this affect architecture, feature scope, or priority?
5. **Seek triangulation** — ask 2+ other partners the same question
6. **Decision** — if 2+ sources contradict, the EPS assumption is invalidated. If 1 source contradicts, flag as risk.

---

## 8. Evidence Registry

All evidence records are maintained in:
- `docs/product/validation/EVIDENCE_TRACEABILITY_MATRIX.md` — Living matrix
- `brain/03-Customer Intelligence/People/{name}.md` — Per-person profiles
- `brain/03-Customer Intelligence/VOICE_OF_CUSTOMER.md` — Quote banks
- `brain/03-Customer Intelligence/PRODUCT_EVIDENCE_MATRIX.md` — Cross-reference

---

## Relationships

| Type | Document | Description |
|------|----------|-------------|
| Source | [[VALIDATION_MASTER_FRAMEWORK]] | Governing methodology |
| Source | [[CUSTOMER_VALIDATION_PLAN]] | Evidence grading inherited from §6.1 |
| Target | [[EVIDENCE_TRACEABILITY_MATRIX]] | Matrix updated by this protocol |
| Target | [[KNOWLEDGE_GAP_ANALYSIS]] | Gaps updated by this protocol |
