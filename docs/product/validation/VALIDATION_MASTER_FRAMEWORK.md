---
title: "Validation Master Framework — Phase 27.1V"
created: 2026-07-28
updated: 2026-07-28
version: 1.0
phase: 27.1V
tags:
  - type/framework
  - domain/product
  - domain/ap
  - domain/customer-intelligence
  - status/active
owner: Product Team
authority: Phase 27.1R — D-03 (Evidence Threshold for Prototyping)
supersedes: "[[CUSTOMER_VALIDATION_PLAN]] (for interview execution)"
---
# Validation Master Framework — Phase 27.1V

> **Classification**: Restricted — Design Partner Program
> **Phase**: 27.1V — Design Partner Validation & Product Evidence Expansion
> **Status**: Active — governing document for all design partner interactions
> **Authority**: Phase 27.1R D-03 (Evidence Threshold for Prototyping) — Phase 21B UI implementation gated on 3 completed formal interviews

---

## 1. Purpose

This framework governs **every design partner interaction** in the Perionyx Design Partner Program. It ensures that every interview produces structured, gradable evidence that can be traced to specific EPS claims, business rules, and architectural decisions.

### Why This Matters

| Reason | Evidence |
|--------|----------|
| Phase 21B UI is gated on 3 completed interviews (D-03) | Phase 27.1R — without interviews, implementation cannot begin |
| 43% of business rules are untested hypotheses | Business Rule Audit — every interview must close specific gaps |
| Only 1 formal interview (Adeel Aslam) supports the entire EPS | Customer Traceability Audit — 17 claims need 3+ sources each |
| Design partners are offering help (Khaleel: "What can I do to support you?") | CRM record — we must convert enthusiasm into structured evidence |

### First Principle

> **Every interaction with a design partner produces structured, gradable evidence that reduces product risk.**

An unstructured conversation is a relationship-building expense. A structured interview is a risk-reduction investment. This framework converts every hour of partner time into measurable evidence progress.

---

## 2. Evidence Architecture

### 2.1 Evidence Hierarchy

```
EPS Claims (17) → Business Rules (65) → Design Decisions → Architecture → Code
     │                    │
     └── Validated by ────┘
         3+ independent sources
```

Every EPS claim must be validated by 3+ independent sources before it can inform Phase 21B architecture decisions.

### 2.2 Current State

| Metric | Value | Target |
|--------|-------|--------|
| Formal interviews completed | 1 | 3 (gate) / 11 (full) |
| CRM-sourced evidence records | 18 | All imported |
| Validated claims (3+ sources) | 0 | 3 (Phase 1) |
| Working claims (2 sources) | 3 (T1, T2, T3) | 17 (full) |
| Hypothesis claims (1 source) | 14 | 0 (full) |
| Total evidence sources needed | 51 | 51 |

### 2.3 Evidence Grading (from CUSTOMER_VALIDATION_PLAN §6.1)

| Level | Name | Definition | Action |
|-------|------|------------|--------|
| 0 | Pending | No evidence collected | Design with caution |
| 1 | Weak | Single mention, not validated | Treat as signal |
| 2 | Moderate | Specific statement with context, one source | Design with this evidence |
| 3 | Strong | Specific, contextual, consequential, one source | High confidence |
| 4 | Validated | 3+ independent sources at Moderate+ | Full confidence |

### 2.4 Evidence Decay (from CUSTOMER_VALIDATION_PLAN §6.2)

| Type | Half-Life | Refresh |
|------|-----------|---------|
| Workflow pain point | 12 months | Annual |
| Feature preference | 6 months | At prototype stage |
| Quantitative claim | 3 months | Every interaction |
| Stated priority | 1 month | Before acting |

---

## 3. Design Partner Pipeline — Current State

### 3.1 Pipeline Summary

| Status | Count | Contacts |
|--------|-------|----------|
| Interview Completed | 1 | Adeel Aslam |
| CRM Data Imported | 18 | Eslam Sobhi, Ayman Shawky, Muhammed Jamsheed, Khaleel Ur Rehman, Ahmed Orabi, Mohamed Gamal, Ahmed Abdelmoneim, +11 others |
| Connected (no data yet) | 5 | Ali Abdelhai Elemam, Hasan Mohammad, Ahmed Taha, Ahmed Magdi, Seif Samy |
| New (to be created) | 2 | Zuhair Hamza, Amr Elkhuly |
| Pending Interview | 20 | LinkedIn-only contacts |
| **Total** | **46** | |

### 3.2 Active Design Partner Candidates (7)

| Rank | Name | Role | Stage | Score | Interview Priority |
|------|------|------|-------|-------|-------------------|
| 1 | Khaleel Ur Rehman | Finance Manager | Connected | 4.55/5 | P0 — Week 1 |
| 2 | Ahmed Orabi | AP/P2P, Hikma Pharma | Connected | 4.20/5 | P0 — Week 2 |
| 3 | Muhammed Jamsheed | AP Manager | Connected | 3.55/5 | P1 — Week 3 |
| 4 | Ayman Shawky | Chief Accountant | Connected | 3.00/5 | P1 — Week 4 |
| 5 | Ali Abdelhai Elemam | _TBD_ | Connected | _TBD_ | P2 — Week 5 |
| 6 | Ahmed Taha | _TBD_ | Connected | _TBD_ | P2 — Week 6 |
| 7 | Ahmed Magdi | _TBD_ | Connected | _TBD_ | P2 — Week 6 |

### 3.3 Extended Design Partner Candidates (5)

| Rank | Name | Role | Stage | Score | Interview Priority |
|------|------|------|-------|-------|-------------------|
| 1 | Hasan Mohammad | _TBD_ | Connected | _TBD_ | P3 — Week 8 |
| 2 | Seif Samy | _TBD_ | Connected | _TBD_ | P3 — Week 8 |
| 3 | Zuhair Hamza | _TBD_ | New | _TBD_ | P3 — Week 10 |
| 4 | Amr Elkhuly | _TBD_ | New | _TBD_ | P3 — Week 10 |
| 5 | Mohamed Gamal | Junior GL Accountant | CRM Data | 2.80/5 | P2 — Week 7 |

### 3.4 CRM-Sourced Evidence Contacts (18)

These contacts have CRM interaction records but no formal interviews. Their existing data is mapped in the Evidence Traceability Matrix. Priority for formal interview:

| Tier | Contacts | Count |
|------|----------|-------|
| High (AP-relevant, evidence-rich) | Eslam Sobhi, Ayman Shawky, Muhammed Jamsheed, Khaleel Ur Rehman, Ahmed Orabi, Mohamed Gamal, Ahmed Abdelmoneim | 7 |
| Medium (finance-adjacent) | Ahmed Esmail, Ammar Mahmoud, Mahmoud Shaker, Ahmed Alazazy, Islam Moubark, Mohamed Ezzat, Mohamed Abdelkarim, Karim Ahmed | 8 |
| Low (peripheral) | Sergey Saraev, Mohamed Elbermawy, Abdelhamed Saied | 3 |

---

## 4. Interview Protocol

### 4.1 Interview Types

| Type | Purpose | Duration | Best For |
|------|---------|----------|----------|
| Context | Role, organisation, current workflow, pain points | 45-60 min | First contact with any partner |
| Workflow Discovery | Deep-dive into specific AP stage | 45-60 min | Validating specific workflow assumptions |
| Prototype Review | Validate feature against real work patterns | 30-45 min | Testing specific design decisions |
| Prioritisation | Rank features by business value | 30 min | Validating H-003, H-013, H-014 |

### 4.2 Mandatory Sections for Every Interview

Every interview **must** cover these minimum sections to produce gradable evidence:

#### Opening (5 min)
- Confirm consent to record/note-take
- "There are no right or wrong answers — I'm here to learn from your experience"
- "Remember: this is a rough draft. You can't hurt my feelings."

#### Hypothesis-Focused Exploration (15 min)
Each interview targets specific hypotheses from the register. The interviewer selects the relevant hypotheses before the session.

#### Closing (5 min)
- "Is there anything I haven't asked that you think I should know?"
- "On a scale of 1-10, how well does [our approach] match your reality?"
- "Would you be open to a follow-up conversation?"

### 4.3 Evidence Capture Template

Every interview produces a structured evidence record:

```yaml
evidence_id: EVID-27.1V-XXX
interview_date: YYYY-MM-DD
design_partner: [Name]
interview_type: [Context|Workflow Discovery|Prototype Review|Prioritisation]
hypotheses_targeted: [H-001, H-002, ...]
claims_affected: [T1, T2, ..., P1, P2, ...]
workflow_stages_affected: [1, 2, ..., 7]

evidence_graded:
  - claim: "[specific claim]"
    level: [0-4]
    quote: "[verbatim or paraphrased]"
    context: "Said while discussing [workflow stage]"
    implications: "Affects [specific design decision]"

action_items:
  - "[specific action from this evidence]"

decision_gate_triggered: [H-XXX-GATE or null]
```

### 4.4 Evidence Processing Pipeline

```
Interview → Raw Notes → Evidence Extraction → Grading → Matrix Update → Decision Gate Check → Action Items
    1            2               3              4           5                 6                  7
```

1. Within 24 hours of interview
2. Raw notes captured in interview template
3. Extract specific claims with quotes
4. Grade each claim Pending/Weak/Moderate/Strong
5. Update Evidence Traceability Matrix
6. Check if any decision gate is triggered
7. Generate action items for product/engineering

---

## 5. Validation Sequencing

### 5.1 Phase 1 — Context Interviews (Weeks 1-4)

Target: First formal interview for each of the 7 primary candidates.

| Week | Partner | Interview Type | Primary Hypotheses | Expected Outcome |
|------|---------|---------------|-------------------|------------------|
| 1 | Khaleel Ur Rehman | Context | H-001, H-014, H-008 | First interview complete. Evidence on multi-currency, ERP sync, WHT |
| 2 | Ahmed Orabi | Context | H-001, H-004, H-014 | Second interview. Evidence on multi-currency, OCR, ERP sync |
| 3 | Muhammed Jamsheed | Context | H-004, H-009, H-002 | Third interview. Evidence on OCR, partial payments, batch |
| 4 | Ayman Shawky | Context | H-005, H-006, H-012 | Fourth interview. Evidence on AI coding, cash prediction, compliance |

**Gate Check**: After Week 3, if 3 interviews completed → Phase 21B UI implementation may begin (per D-03).

### 5.2 Phase 2 — Workflow Discovery (Weeks 5-10)

Target: Deep-dive into specific workflow stages.

| Week | Partner | Interview Type | Stage Focus | Hypotheses |
|------|---------|---------------|-------------|------------|
| 5 | Khaleel Ur Rehman | Workflow Discovery | Stages 4-5 (Exception, Approval) | H-002, H-007 |
| 6 | Ahmed Orabi | Workflow Discovery | Stages 1-3 (Receipt, Match, Exception) | H-003, H-009 |
| 7 | Muhammed Jamsheed | Workflow Discovery | Stages 2-5 (Validation through Approval) | H-005, H-014 |
| 8 | Ali Abdelhai Elemam | Context | All stages | Gap-filling |
| 9 | Ahmed Taha | Context | All stages | Gap-filling |
| 10 | Ahmed Magdi | Context | All stages | Gap-filling |

### 5.3 Phase 3 — Prototype Reviews (Weeks 11-16)

Target: Validate specific UI/UX decisions with interactive prototypes.

| Week | Partner | Feature | Success Criterion |
|------|---------|---------|-------------------|
| 11 | Khaleel Ur Rehman | Approval View | Evidence panel + decision panel validated |
| 12 | Ahmed Orabi | Exception Queue | 5 exception types validated as correct |
| 13 | Muhammed Jamsheed | Three-Way Match | Match confidence display validated |
| 14 | Ayman Shawky | GL Posting | Auto-coding accuracy threshold validated |
| 15 | Ali Abdelhai Elemam | Dashboard | KPI relevance validated |
| 16 | Ahmed Taha | Payment View | Payment flow validated |

---

## 6. Validation Success Criteria

### 6.1 Gate Criteria (from D-03)

| Gate | Criterion | Measurement | Owner |
|------|-----------|-------------|-------|
| G-01 | 3 formal AP practitioner interviews completed | Count of interview records in CRM | Product Director |
| G-02 | All interview evidence graded and recorded | Evidence records in traceability matrix | Product Team |
| G-03 | Evidence incorporated into EPS business rules | Updated BUSINESS_RULE_LIBRARY.md | Product Team |
| G-04 | PAB sign-off on evidence sufficiency | Sign-off document | Product Architecture Board |

### 6.2 Phase Completion Criteria

| Metric | Current | Target (End of Phase 27.1V) |
|--------|---------|----------------------------|
| Formal interviews completed | 1 | 7 |
| CRM evidence records imported | 18 | 18 (all imported) |
| Validated claims (3+ sources) | 0 | 3 |
| Working claims (2 sources) | 3 | 8 |
| Hypothesis claims | 14 | 6 |
| 3-interview gate met | No | Yes |
| Design partners formalized | 0 | 3 |

---

## 7. Ethics & Privacy

### 7.1 Consent Requirements

Every interview requires:
1. **Informed consent**: Participant understands purpose, how data will be used, and their rights
2. **Recording consent**: Explicit permission for audio recording or note-taking
3. **Anonymity option**: Participant may choose to have their identity anonymized in all public references
4. **Opt-out**: Participant may withdraw consent at any time, with all data deleted

### 7.2 Data Handling

| Data Type | Storage | Retention | Access |
|-----------|---------|-----------|--------|
| Interview notes | Brain knowledge base | Indefinite (anonymized) | Product Team + PAB |
| Raw recordings | Secure storage | 90 days then deleted | Interviewer only |
| CRM records | CRM system | Indefinite | Sales + Product |
| Evidence records | Brain + docs/ | Indefinite | All engineering |
| Personal contact info | CRM system | Indefinite | Sales only |

### 7.3 Compensation

| Activity | Compensation | Notes |
|----------|-------------|-------|
| Context interview (45-60 min) | $100 | One-time |
| Workflow discovery (45-60 min) | $100 | Per session |
| Prototype review (30-45 min) | $200 | Per session |
| Design partner retainer | $200/month | Ongoing |
| Prioritisation interview (30 min) | $100 | Per session |

---

## 8. Document Relationships

| Document | Relationship |
|----------|--------------|
| [[ENTERPRISE_PRODUCT_SPECIFICATION_AP]] | The specification this framework validates |
| [[BUSINESS_RULE_LIBRARY]] | The 65 business rules validated through this program |
| [[CUSTOMER_VALIDATION_PLAN]] | Superseded by this framework for interview execution |
| [[OPEN_PRODUCT_HYPOTHESES]] | The 14 hypotheses this framework targets |
| [[PRODUCT_PRINCIPLES]] | The 10 principles validated through evidence |
| [[EVIDENCE_TRACEABILITY_MATRIX]] | The matrix updated after every interview |
| [[KNOWLEDGE_GAP_ANALYSIS]] | The document tracking what we don't know |
| [[DESIGN_PARTNER_BRIEFS]] | Individual briefs per partner |
| [[INTERVIEW_SCORING_PROTOCOL]] | How evidence is graded |
| [[VALIDATION_ROADMAP]] | Timeline and milestones |
| `brain/03-Customer Intelligence/` | Source data for all evidence |
| [[EDP_27_1V]] | This phase's engineering decision packet |

---

## 9. Glossary

| Term | Definition |
|------|------------|
| **Design Partner** | A customer or prospect who provides structured feedback on product decisions |
| **EPS** | Enterprise Product Specification — the product design document for a workflow |
| **Evidence Claim** | A specific statement about customer needs, validated by 1+ sources |
| **Hypothesis** | An unvalidated product assumption that requires evidence before implementation |
| **Decision Gate** | A specific decision that is blocked until a hypothesis is validated |
| **PAB** | Product Architecture Board — governing body for product decisions |
| **Formal Interview** | A structured, scheduled conversation with documented notes and gradable evidence |
| **CRM Data** | Customer interaction records from the CRM system (notes, emails, call summaries) |
