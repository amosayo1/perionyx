---
title: "Product Principles"
created: 2026-07-27
updated: 2026-07-28
tags:
  - type/reference
  - domain/customer-intelligence
  - status/active
owner: Product Team
authority: Strategy
---

# Product Principles

## Purpose

Product principles derived from customer discovery. Each principle is categorized by validation status: Validated (evidence-backed), Working (some evidence), or Hypothesis (no evidence yet).

## Summary

Principles are promoted from Hypothesis → Working → Validated as interview evidence accumulates. Only Validated principles should inform product roadmap decisions.

## Validation Tiers

| Tier | Criteria | Action |
|------|----------|--------|
| **Validated** | 3+ independent interviews support this principle | Can inform product decisions |
| **Working** | 1-2 interviews support, or 1 very detailed interview | Track and validate further |
| **Hypothesis** | No direct interview evidence; inferred from industry patterns | Do not act on without validation |

---

## Validated Principles

### P3: Trust Requires Provable Accuracy

| Field | Value |
|-------|-------|
| Tier | Validated |
| Sources | Adeel Aslam (2026-07-21), Muhammed Jamsheed (CRM), Ayman Shawky (CRM) |
| Evidence | Adeel: "manual oversight to ensure accuracy"; Muhammed: "Automated reconciliation is highly desired; Intelligent discrepancy alerts would reduce manual work"; Ayman: "Need for confidence scoring on forecasts" |

**Implication**: Automated matching must show its work. Confidence scores, drill-down to source documents, and undo capability are trust-building features.

---

## Working Principles

### P1: Reporting Is Table Stakes, Not a Differentiator

| Field | Value |
|-------|-------|
| Tier | Working |
| Sources | Adeel Aslam (2026-07-21), Eslam Sobhi (CRM), Ayman Shawky (CRM) |
| Evidence | Adeel: "While our systems cover reporting and cash flow planning fairly well..."; Eslam: "Cost Accounting, Financial Reporting"; Ayman: "Budgeting, Financial Reporting, Performance Analysis" |

**Implication**: Existing systems handle reporting adequately. Perionyx differentiation must come from transactional automation, not analytics.

**Validation Plan**: Confirm with 2+ additional interviews that reporting is "good enough" in existing systems.

---

### P2: Operational Automation Is the Real Gap

| Field | Value |
|-------|-------|
| Tier | Working |
| Sources | Adeel Aslam (2026-07-21), Muhammed Jamsheed (CRM), Mohamed Gamal (CRM), Ahmed Orabi (CRM) |
| Evidence | Adeel: "These operational tasks often require manual oversight to ensure accuracy"; Muhammed: "Inventory reconciliation still depends heavily on spreadsheets"; Mohamed: "manual bank reconciliation, manual account reconciliation"; Ahmed Orabi: AP/P2P specialist at Hikma Pharmaceuticals |

**Implication**: The gap is in invoice matching, approval routing, and payment execution — not in dashboards or reports.

**Validation Plan**: Confirm with 2+ additional interviews that operational pain exceeds analytical pain.

---

### P4: Unified Platform Beats Best-of-Breed

| Field | Value |
|-------|-------|
| Tier | Working |
| Sources | Ayman Shawky (CRM), Muhammed Jamsheed (CRM), Ahmed Abdelmoneim (CRM) |
| Evidence | Ayman: "Siloed systems create reconciliation overhead; Single source of truth for financial data"; Muhammed: "Weak integration between inventory and finance modules"; Ahmed Abdelmoneim: Odoo ERP + treasury integration challenges |

**Implication**: Perionyx positioning as unified operating system is correct direction.

**Validation Plan**: Interview 3+ finance managers about their current system landscape and integration pain.

---

### P5: AI Must Explain Itself

| Field | Value |
|-------|-------|
| Tier | Working |
| Sources | Ayman Shawky (CRM), Mahmoud Shaker (CRM) |
| Evidence | Ayman: "Interest in ML-based cash flow predictions; Need for confidence scoring on forecasts"; Mahmoud: FMVA certification — financial modelling expertise suggests analytical rigour |

**Implication**: AI features need explainability and confidence scoring, not just predictions.

**Validation Plan**: Interview 3+ treasurers about their trust requirements for AI-generated forecasts.

---

## Hypothesis Principles

### P6: MENA Market Needs Arabic-First Design

| Field | Value |
|-------|-------|
| Tier | Hypothesis |
| Sources | Mohamed Ezzat (CRM — Arabic-speaking), multiple Saudi Arabia contacts |
| Evidence | Mohamed Ezzat: prefers communication in Arabic; 8+ contacts in Saudi Arabia |

**Implication**: Arabic RTL support is not just translation — it's layout, number formatting, date formatting, and cultural alignment.

**Validation Plan**: Interview 3+ MENA finance professionals about language requirements.

---

### P7: Approval Workflows Must Support Delegation

| Field | Value |
|-------|-------|
| Tier | Hypothesis |
| Sources | Mohamed Gamal (CRM) |
| Evidence | Mohamed Gamal: "approval bottlenecks" as a pain point; "automated approvals" as desired outcome |

**Implication**: Approval matrix must support delegation, escalation, and absence handling.

**Validation Plan**: Interview 3+ finance managers about their approval workflow requirements.

---

### P8: ERP Integration Must Be Bidirectional

| Field | Value |
|-------|-------|
| Tier | Hypothesis |
| Sources | Abdelhamed Saied (CRM), Ayman Shawky (CRM) |
| Evidence | Abdelhamed: ERP Functional Consultant — dual role accountant AND ERP consultant; Ayman: SAP/Odoo/Dynamics experience — integration across multiple ERP systems |

**Implication**: Perionyx must not only read from ERPs but write back journal entries, reconciliation results, and approval decisions.

**Validation Plan**: Interview 3+ ERP consultants about bidirectional integration requirements.

---

### P9: Industry-Specific Workflows Matter

| Field | Value |
|-------|-------|
| Tier | Hypothesis |
| Sources | Muhammed Jamsheed (CRM — agriculture), Mohamed Gamal (CRM — construction), Adeel Aslam (interview — real estate/construction) |
| Evidence | Muhammed: inventory reconciliation in agricultural context; Mohamed: GL reconciliation in construction; Adeel: vendor invoices in real estate/construction |

**Implication**: Generic ERP workflows don't fit industry-specific needs. Perionyx should support industry-specific configurations.

**Validation Plan**: Interview 3+ finance professionals across different industries about industry-specific requirements.

---

## Relationships

| Type | Page | Description |
|------|------|-------------|
| Parent | [[INDEX\|Customer Intelligence Index]] | Folder index |
| Source | [[VALIDATED_MARKET_THEMES]] | Market themes that generated principles |
| Source | [[VOICE_OF_CUSTOMER]] | VoC synthesis |
| Related | [[PRODUCT_EVIDENCE_MATRIX]] | Evidence matrix |
| Related | [[ERP_OBSERVATIONS]] | ERP observations |
| Lesson | [[17-Lessons/47-interview-structure-before-content\|Lesson 47]] | Structure before content |
| Lesson | [[17-Lessons/54-customer-knowledge-compounds\|Lesson 54]] | Customer knowledge compounds |

## Open Questions

1. Should P3 be officially promoted to Validated?
2. How should contradicting evidence be handled?
3. Should Validated principles be frozen (no changes)?

## Next Actions

1. Schedule formal interviews to validate P1, P2, P4, P5
2. Re-score principle tiers after each interview
3. Promote Working principles to Validated when 3+ sources reached
4. Demote Hypothesis principles if contradicted by interview evidence
