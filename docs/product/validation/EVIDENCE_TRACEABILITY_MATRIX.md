---
title: "Evidence Traceability Matrix — Phase 27.1V"
created: 2026-07-28
updated: 2026-07-28
version: 1.0
phase: 27.1V
tags:
  - type/reference
  - domain/product
  - domain/customer-intelligence
  - status/active
owner: Product Team
authority: Phase 27.1V
---
# Evidence Traceability Matrix — Phase 27.1V

> **Classification**: Restricted — Design Partner Program
> **Status**: Active — updated after every interview

---

## 1. Matrix Structure

Rows = Evidence claims. Columns = Contacts + sources. Cells = Evidence grade.

| Grade | Symbol | Meaning |
|-------|--------|---------|
| 4 — Validated | ✓✓ | 3+ independent sources at Moderate+ |
| 3 — Strong | ✓ | 1 source with specific, contextual, consequential evidence |
| 2 — Moderate | ~ | 1 source with specific statement and context |
| 1 — Weak | ◇ | Mentioned in passing, not explored |
| 0 — Pending | ? | No evidence collected |
| N/A | — | Not applicable to this source |

---

## 2. Market Themes (T1-T8)

### T1: Vendor Invoice Reconciliation Is Manual and Error-Prone

| Source | Grade | Evidence | Source Type |
|--------|-------|----------|-------------|
| Adeel Aslam | ✓ | "In real estate and construction finance, one area we still manage manually is vendor invoice reconciliations and approval workflows." | Formal interview |
| Muhammed Jamsheed | ~ | "Automated reconciliation is highly desired." "Inventory reconciliation still depends heavily on spreadsheets." | CRM data |
| Mohamed Gamal | ~ | "Manual bank reconciliation, manual account reconciliation, manual balance reviews." | CRM data |
| Ahmed Shatla | ◇ | Referenced in context of vendor invoice pain | CRM data (partial) |
| Phase 20.0 | ✓ | Validation: invoice reconciliation pain across 14 workflows | Product validation |
| **Status** | **Working (4 sources)** | **1 Strong + 2 Moderate + 1 Weak + 1 Strong** | **Needs: 3rd formal interview** |

### T2: Approval Workflow Delays

| Source | Grade | Evidence | Source Type |
|--------|-------|----------|-------------|
| Adeel Aslam | ✓ | "approval workflows... require manual oversight to ensure accuracy" | Formal interview |
| Mohamed Gamal | ~ | "Approval bottlenecks." | CRM data |
| Muhammed Jamsheed | ◇ | Implied by desire for automated reconciliation and alerts | CRM data (inferred) |
| Phase 20.0 | ✓ | Validation: approval delays as critical friction point | Product validation |
| **Status** | **Working (4 sources)** | **1 Strong + 1 Moderate + 1 Weak + 1 Strong** | **Needs: 3rd formal interview** |

### T3: Fragmented Workflows / Siloed ERP Modules

| Source | Grade | Evidence | Source Type |
|--------|-------|----------|-------------|
| Ayman Shawky | ~ | "Siloed systems create reconciliation overhead." "Single source of truth for financial data." | CRM data |
| Muhammed Jamsheed | ~ | "Weak integration between inventory and finance modules. Data must be exported and re-imported manually." | CRM data |
| Ahmed Abdelmoneim | ◇ | Odoo ERP, Power BI feedback — implies multi-system usage | CRM data |
| Phase 20.0 | ✓ | Validation: workflow fragmentation across modules | Product validation |
| **Status** | **Working (4 sources)** | **2 Moderate + 1 Weak + 1 Strong** | **Needs: 1 formal interview** |

### T4: Real-Time Cash Visibility

| Source | Grade | Evidence | Source Type |
|--------|-------|----------|-------------|
| Ayman Shawky | ~ | "Need for instant view of cash positions across all accounts; Desire for drill-down from summary to transaction detail." | CRM data |
| Adeel Aslam | ◇ | "Our systems cover reporting and cash flow planning fairly well" — implies existing visibility but not real-time | Formal interview |
| Phase 20.0 | ◇ | Validation: visibility gaps identified | Product validation |
| **Status** | **Hypothesis (3 sources)** | **1 Moderate + 1 Weak + 1 Weak** | **Needs: formal interview confirmation** |

### T5: Multi-Currency Complexity

| Source | Grade | Evidence | Source Type |
|--------|-------|----------|-------------|
| Ayman Shawky | ~ | "Desire for multi-currency balance aggregation." | CRM data |
| Phase 20.0 | ◇ | Validation: multi-currency friction identified | Product validation |
| **Status** | **Hypothesis (2 sources)** | **1 Moderate + 1 Weak** | **Needs: 2 formal interviews** |

### T6: AI Trust & Forecasting

| Source | Grade | Evidence | Source Type |
|--------|-------|----------|-------------|
| Ayman Shawky | ~ | "Interest in ML-based cash flow predictions; Need for confidence scoring on forecasts." | CRM data |
| Mahmoud Shaker | ◇ | Financial analyst — AI/forecasting interest likely | CRM data (inferred) |
| Phase 20.0 | ◇ | Validation: AI trust gaps identified | Product validation |
| **Status** | **Hypothesis (3 sources)** | **1 Moderate + 1 Weak + 1 Weak** | **Needs: 2 formal interviews** |

### T7: Compliance Automation

| Source | Grade | Evidence | Source Type |
|--------|-------|----------|-------------|
| Ahmed Esmail | ◇ | Tax & regulatory compliance specialist — implies need | CRM data (profile) |
| Mohamed Gamal | ◇ | "faster month-end close" — implies compliance reporting burden | CRM data |
| Phase 20.0 | ◇ | Validation: compliance automation gaps | Product validation |
| **Status** | **Hypothesis (3 sources)** | **3 Weak** | **Needs: 3 formal interviews** |

### T8: Audit Trail Integrity

| Source | Grade | Evidence | Source Type |
|--------|-------|----------|-------------|
| Phase 20.0 | ◇ | Validation: audit trail gaps identified | Product validation |
| **Status** | **Hypothesis (1 source)** | **1 Weak** | **Needs: 3 formal interviews** |

---

## 3. EPS Claims × Evidence Map

### 3.1 Business Rules (65 total)

| Category | Total Rules | Validated | Working | Hypothesis | Evidence Sources |
|----------|-------------|-----------|---------|------------|-----------------|
| Vendor Qualification | 6 | 0 | 3 | 3 | Adeel, Phase 20.0 |
| Invoice Validation | 8 | 0 | 4 | 4 | Adeel, Muhammed, Phase 20.0 |
| Three-Way Match | 5 | 0 | 2 | 3 | Adeel, Muhammed |
| Exception Handling | 7 | 0 | 3 | 4 | Muhammed, Mohamed G. |
| Approval Routing | 12 | 0 | 5 | 7 | Adeel, Mohamed G., Phase 20.0 |
| Payment Safety | 9 | 0 | 3 | 6 | Adeel, Phase 20.0 |
| Audit Invariants | 6 | 0 | 2 | 4 | Phase 20.0, Constitution |
| Compliance | 5 | 0 | 1 | 4 | Ahmed Esmail (profile) |
| Multi-Currency | 4 | 0 | 1 | 3 | Ayman Shawky |
| ERP Integration | 3 | 0 | 1 | 2 | Ayman, Muhammed |
| **Total** | **65** | **0** | **25** | **40** | |

### 3.2 Product Principles (10 total)

| Principle | Status | Supporting Sources |
|-----------|--------|-------------------|
| P1: Trusted Information Before Transactions | Validated (4) | Adeel, Muhammed, Ayman, P3 |
| P2: Automate Preparation, Not Decisions | Validated (5) | T2×4, Muhammed |
| P3: Preserve Human Judgement | Validated (4) | Khaleel, P3×3 |
| P4: Context Before Action | Validated (4) | T1×4, Mohamed G. |
| P5: Exceptions First | Validated (5) | Muhammed, Adeel, T2×4 |
| P6: Evidence Before Approval | Validated (4) | P3×3, Adeel |
| P7: One Financial Truth | Validated (4) | T3×3, Ayman |
| P8: Decision Readiness | Working (2) | Phase 27.0A, Mohamed G. |
| P9: Audit Trail Is Non-Negotiable | Validated | Constitutional + 3 implementation phases |
| P10: Multi-Currency Is First-Class | Hypothesis (2) | Ayman, T7 |

### 3.3 AP Workflow Stages × Evidence Coverage

| Stage | Evidence Sources | Confidence | Key Gaps |
|-------|-----------------|------------|----------|
| 1: Invoice Received | Adeel, Muhammed, Phase 20.0 | Working | OCR accuracy, email ingestion, vendor portal |
| 2: Validation & Match | Adeel, Muhammed, Phase 20.0 | Working | Tolerance levels, two-way vs three-way preference |
| 3: Exception Queue | Muhammed, Adeel, Phase 20.0 | Working | Exception classification, SLA enforcement, AI resolution |
| 4: Approval Routing | Adeel, Mohamed G., Phase 20.0 | Working | Delegation, mobile approval, simultaneous vs sequential |
| 5: Treasury Review | Ayman, Phase 20.0 | Hypothesis | Batch vs individual, discount capture, cash alignment |
| 6: Payment Execution | Phase 20.0 | Hypothesis | Method preferences, confirmation expectations, failure handling |
| 7: Post-Payment Recon | Ayman, Mohamed G., Phase 20.0 | Hypothesis | Auto-coding, review-vs-auto, subledger recon |

---

## 4. CRM-Sourced Evidence (18 Contacts × EPS Mapping)

### 4.1 Active CRM Contacts With Evidence

| Contact | Role | Evidence Claims | Confidence | EPS Stage Coverage |
|---------|------|----------------|------------|-------------------|
| Khaleel Ur Rehman | Finance Manager | Expressed desire to support Perionyx | Strong | All stages (general) |
| Ahmed Orabi | AP/P2P, Hikma | Requested Perionyx info, AP role | Strong | Stages 1-4 |
| Muhammed Jamsheed | Senior Accountant | T1, T3, P2, P5 — 4 evidence quotes | Moderate | Stages 1-4 |
| Ayman Shawky | Chief Accountant | T3, T4, T5, T6 — 7 evidence quotes | Moderate | Stages 5-7 |
| Eslam Sobhi | Cost Accountant | Treasury ops feedback, Dynamics 365 | Weak | Stage 5 |
| Mohamed Gamal | Jr GL Accountant | T1, T2, T5 — 4 evidence quotes | Moderate | Stages 4, 7 |
| Ahmed Abdelmoneim | Treasury | Odoo, Power BI, treasury ops feedback | Weak | Stage 5 |
| Ahmed Esmail | Tax/Compliance | Regulatory compliance interest | Weak | Stage 7 |
| Mahmoud Shaker | Financial Analyst | AI forecasting interest | Weak | Stage 5 |
| Ahmed Alazazy | Sr GL & Tax | Month-end close pain (implied) | Weak | Stage 7 |
| Ammar Mahmoud | Senior Accountant | No specific evidence extracted | Pending | None |
| Islam Moubark | Senior Accountant | No specific evidence extracted | Pending | None |
| Mohamed Ezzat | General Accountant | No specific evidence extracted | Pending | None |
| Mohamed Abdelkarim | Accounting & Finance | No specific evidence extracted | Pending | None |
| Karim Ahmed | Finance & Accounting | No specific evidence extracted | Pending | None |
| Sergey Saraev | Emerging Tech Advisor | Strategic network, no AP evidence | Pending | None |
| Mohamed Elbermawy | Senior Accountant | No specific evidence extracted | Pending | None |
| Abdelhamed Saied | Accountant/ERP | No specific evidence extracted | Pending | None |

### 4.2 Pipeline Contacts (No Evidence Yet)

| Contact | Status | Priority for Formal Interview |
|---------|--------|------------------------------|
| Ali Abdelhai Elemam | Connected | P2 — Week 5 |
| Hasan Mohammad | Connected (pending import) | P3 — Week 8 |
| Ahmed Taha | Connected | P2 — Week 6 |
| Ahmed Magdi | Connected | P2 — Week 6 |
| Seif Samy | Connected | P3 — Week 8 |
| Zuhair Hamza | New | P3 — Week 10 |
| Amr Elkhuly | New | P3 — Week 10 |
| Muhammad Abdul Rehman | CRM data | P4 — monitor |
| 20+ LinkedIn-only contacts | Pending outreach | P4 — monitor |

---

## 5. Validation Progress Tracker

### Interview Evidence Contribution

| Interview | Date | T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | H-001 | H-002 | H-004 | H-005 | H-014 |
|-----------|------|----|----|----|----|----|----|----|----|-------|-------|-------|-------|-------|
| Adeel Aslam | 2026-07-21 | ✓ | ✓ | ✓ | ◇ | — | — | — | — | — | — | — | — | — |
| Khaleel Ur Rehman | TBD | | | | | | | | | TBD | TBD | — | — | TBD |
| Ahmed Orabi | TBD | | | | | | | | | TBD | — | TBD | — | TBD |
| Muhammed Jamsheed | TBD | TBD | TBD | TBD | — | — | — | — | — | — | TBD | TBD | — | — |
| Ayman Shawky | TBD | — | — | ✓ | TBD | TBD | TBD | — | — | — | — | — | TBD | TBD |

**Legend**: ✓ = Evidence collected. ◇ = Weak evidence. TBD = To be determined in interview. — = Not applicable.

### Evidence Gap Closure Tracker

| Hypothesis | Current Grade | Needed | Target Source | Expected Date |
|------------|---------------|--------|---------------|---------------|
| T1 → Validated | Working (4) | 1 formal interview | Muhammed Jamsheed | Week 3 |
| T2 → Validated | Working (4) | 1 formal interview | Muhammed Jamsheed | Week 3 |
| T3 → Validated | Working (4) | 1 formal interview | Muhammed Jamsheed | Week 3 |
| T4 → Working | Hypothesis (3) | 1 formal interview | Ayman Shawky | Week 4 |
| T5 → Working | Hypothesis (2) | 1 formal interview | Khaleel Ur Rehman | Week 1 |
| T6 → Working | Hypothesis (3) | 1 formal interview | Ayman Shawky | Week 4 |
| T7 → Working | Hypothesis (3) | 1 formal interview | Ahmed Orabi | Week 2 |
| T8 → Working | Hypothesis (1) | 2 formal interviews | Multiple | Week 6+ |
| H-001 → Moderate | Hypothesis (0) | 2 interviews | Khaleel + Ahmed O. | Week 2 |
| H-004 → Moderate | Hypothesis (0) | 2 interviews | Ahmed O. + Muhammed | Week 3 |
| H-014 → Moderate | Hypothesis (0) | 2 interviews | Khaleel + Ayman | Week 4 |

---

## 6. Update Procedure

After every interview:
1. Update interview evidence in the Evidence column
2. Bubble up confidence changes to Business Rules and Principles
3. Check if any decision gate is triggered (H-XXX-GATE)
4. Update Knowledge Gap Analysis
5. Update Validation Roadmap progress markers
6. Flag any contradictory evidence to Product Team

---

## Relationships

| Type | Document | Description |
|------|----------|-------------|
| Source | [[VALIDATION_MASTER_FRAMEWORK]] | Governing methodology |
| Source | [[DESIGN_PARTNER_BRIEFS]] | Individual interview plans |
| Target | [[KNOWLEDGE_GAP_ANALYSIS]] | Gaps this matrix feeds |
| Target | [[OPEN_PRODUCT_HYPOTHESES]] | Hypotheses this matrix validates |
| Source | `brain/03-Customer Intelligence/` | Raw CRM and interview data |
