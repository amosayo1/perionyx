---
title: "Knowledge Gap Analysis — Phase 27.1V"
created: 2026-07-28
updated: 2026-07-28
version: 1.0
phase: 27.1V
tags:
  - type/analysis
  - domain/product
  - domain/customer-intelligence
  - status/active
owner: Product Team
authority: Phase 27.1V
---
# Knowledge Gap Analysis — Phase 27.1V

> **Classification**: Restricted — Design Partner Program
> **Status**: Active — updated after every interview

---

## 1. Executive Summary

The EPS rests on **1 formal interview** and **18 CRM-sourced records**. 43% of business rules and 82% of evidence claims are hypothesis or weaker. This document maps every gap to a specific interview, hypothesis, and closure target.

### Gap Score

| Metric | Value |
|--------|-------|
| Total evidence claims | 17 |
| Claims at Hypothesis (0-1 sources) | 14 (82%) |
| Claims at Working (2 sources) | 3 (18%) |
| Claims at Validated (3+) | 0 (0%) |
| Formal interviews conducted | 1 |
| Formal interviews needed | 11 |
| Total evidence sources needed | 51 |
| Current sources | 24 |
| **Evidence gap** | **27 sources** |

---

## 2. Knowledge Gap Categories

### 2.1 Architecture-Level Gaps (P0 — Block Phase 21B if unresolved)

| # | Gap | Risk | Affects | Closes When |
|---|-----|------|---------|-------------|
| G-01 | **Multi-currency invoice workflow**: No customer has confirmed they process invoices in currencies different from functional currency. The entire P10 principle and H-001 depend on this being true. | Critical | Prisma schema, 6+ tables, all monetary fields | 2/2 interviews (Khaleel + Ahmed O.) confirm |
| G-02 | **ERP bidirectional sync preference**: No customer has confirmed they need bidirectional sync. T3 confirms ERP silos exist but does not confirm sync direction preference. If invalidated, architecture is dramatically simpler. | Critical | Integration platform, provider drivers, entire Platform Constitution integration strategy | 3/4 interviews confirm bidirectional over standalone |
| G-03 | **OCR invoice capture volume**: No customer has quantified paper/scanned invoice volume. If volume <20%, OCR is P2 not P0. | High | Stage 1 feature priority, AI provider investment | 2/2 interviews (Ahmed O. + Muhammed) quantify volume |
| G-04 | **Batch payment preference**: No customer has explicitly confirmed batch payments. The PaymentProposal aggregate and batch commands depend on this. | High | Stage 5 feature scope, PaymentService batch commands | 2/2 interviews (Khaleel + Ahmed A.) confirm |

### 2.2 Feature-Level Gaps (P1 — Validate before Phase 21C)

| # | Gap | Risk | Affects | Closes When |
|---|-----|------|---------|-------------|
| G-05 | **AI GL coding trust threshold**: No customer has validated they would trust AI-suggested GL codes at various confidence levels. | Medium | Stage 9 AI integration, confidence threshold design | 2/3 interviews (Ayman + Ahmed O. + Eslam) |
| G-06 | **Cash flow prediction value**: No customer has quantified manual forecasting time or confirmed trust in ML predictions. | Medium | Stage 5 feature scope, ML model investment | 2/2 interviews (Ahmed A. + Khaleel) |
| G-07 | **Compliance reporting burden**: No customer has quantified time spent on compliance reporting from AP data. | Medium | Stage 7 compliance module, H-012 | 2/3 interviews (Khaleel + Ahmed O. + Ayman) |
| G-08 | **Withholding tax automation value**: No customer has confirmed WHT is manual or that automation would save time. | Medium | H-008, WHT engine investment | 2/2 interviews (Khaleel + Ahmed O.) |
| G-09 | **Partial payment prevalence**: No customer has confirmed they process partial payments routinely. | Medium | Invoice state machine, open balance tracking | 2/2 interviews (Ahmed O. + Khaleel) |
| G-10 | **Arabic language importance**: No customer has been asked about language preference. Infrastructure exists but content investment is unvalidated. | Medium | H-013, translation investment | 2/2 interviews (Khaleel + Ahmed O.) |

### 2.3 Enhancement-Level Gaps (P2 — Deferred to v2.0 unless validated early)

| # | Gap | Risk | Affects | Closes When |
|---|-----|------|---------|-------------|
| G-11 | **Vendor portal value**: No customer has requested or validated vendor-facing functionality. | Medium | H-003, portal feature scope | 2/3 prioritisation interviews |
| G-12 | **Budget check integration**: No customer has validated invoice-stage budget control. | Medium | H-007, budget service integration | 2/2 interviews (Khaleel + Ahmed O.) |
| G-13 | **Recurring invoice automation**: Low risk (standard practice). Inline validation only. | Low | H-011 | Cover in existing sessions |
| G-14 | **Vendor credit note workflow**: Low risk (standard practice). Inline validation only. | Low | H-010 | Cover in existing sessions |
| G-15 | **Three-way vs two-way matching**: Services vs goods match preference unconfirmed. | Low | H-014 sub-hypothesis | Cover in Muhammed interview |

### 2.4 Persona Gaps (Identified in Phase 27.1R D-06)

| # | Gap | Resolution |
|---|-----|------------|
| G-16 | **Department Manager persona**: Zero customer evidence. Absorbed into AP Manager for v1.0. | Document for v2.0 persona expansion |
| G-17 | **CFO persona (AP-specific)**: AP concerns are subsets of Controller + Treasurer personas. | Document for v2.0 persona expansion |
| G-18 | **Auditor persona**: No direct interview evidence. Constitutional authority covers audit requirements. | Validate if auditor contact becomes available |

### 2.5 Evidence Quality Gaps

| # | Gap | Current State | Target State |
|---|-----|---------------|--------------|
| G-19 | **CRM data quality**: 11/18 CRM contacts have no extractable evidence. 5 have only weak evidence. | 6/18 contacts with evidence | 18/18 contacts with evidence grades |
| G-20 | **Quantitative evidence**: No customer has quantified time, volume, or cost. All evidence is qualitative. | 0 quantitative claims | 5+ quantitative claims |
| G-21 | **Geographic diversity**: All contacts are MENA-region. No Europe, Asia, or Americas validation. | 1 region | 3+ regions |

---

## 3. Gap Closure Plan

### Week 1-2: Close Architecture-Level Gaps

| Gap | Interview | Expected Date | Validation Method | Success Criterion |
|-----|-----------|---------------|-------------------|-------------------|
| G-01 (Multi-currency) | Khaleel + Ahmed O. | Week 1-2 | Context interview | 2/2 confirm multi-currency processing |
| G-02 (ERP sync) | Khaleel + Ayman | Week 1-4 | Context + prioritisation | 3/4 confirm bidirectional preference |
| G-03 (OCR volume) | Ahmed O. + Muhammed | Week 2-3 | Context interview | 2/2 quantify invoice volume breakdown |
| G-04 (Batch payments) | Khaleel | Week 1 | Context interview | Confirm batch cycle preference |

### Week 3-6: Close Feature-Level Gaps

| Gap | Interview | Expected Date | Validation Method |
|-----|-----------|---------------|-------------------|
| G-05 (AI coding) | Ayman + Muhammed | Week 4 | Workflow discovery |
| G-06 (Cash prediction) | Ayman | Week 4 | Workflow discovery |
| G-07 (Compliance) | Ahmed O. + Khaleel | Week 2 | Context interview |
| G-08 (WHT) | Khaleel + Ahmed O. | Week 1-2 | Context interview |
| G-09 (Partial payment) | Ahmed O. + Muhammed | Week 3 | Workflow discovery |
| G-10 (Arabic) | Khaleel + Ahmed O. | Week 1-2 | Context interview |

### Week 6-10: Close Enhancement-Level Gaps

| Gap | Interview | Expected Date | Validation Method |
|-----|-----------|---------------|-------------------|
| G-11 (Vendor portal) | Khaleel + Ahmed O. + Muhammed | Week 6-10 | Prioritisation interview |
| G-12 (Budget check) | Khaleel + Ahmed O. | Week 5 | Workflow discovery |
| G-13 (Recurring invoices) | Mohamed Gamal | Week 7 | In-session |
| G-14 (Credit notes) | Ahmed O. | Week 6 | In-session |
| G-15 (2-way vs 3-way) | Muhammed | Week 3 | In-session |

---

## 4. Risk Assessment

| Gap | If Not Closed | Fallback |
|-----|---------------|----------|
| G-01 | Multi-currency fields not in schema. Defer to post-v1. | Single-currency v1, multi-currency v2 |
| G-02 | One-way export sufficient. No provider driver investment. | Dramatically simpler architecture |
| G-03 | OCR deferred. Manual capture with smart defaults. | Lower engineering cost, higher manual burden |
| G-04 | Individual payment execution primary path. No PaymentProposal. | Simpler state machine, no batch commands |
| G-05 | Manual GL coding with search/autocomplete. No AI integration. | Lower implementation cost, higher user effort |
| G-06 | No ML prediction in v1. Manual forecasting continues. | Deferred to post-v2 |
| G-07 | Standard AP reporting only. No compliance module. | Deferred to Phase 21D |
| G-08 | Manual WHT via GL coding. No automation. | Deferred to Phase 21D |
| G-09 | Full-payment-only v1. Manual partial payment handling. | Deferred to Phase 21D |
| G-10 | English-only v1. i18n infrastructure maintained. | Translation content deferred |

---

## 5. Gap Closure Tracker

| Gap | Status | Assigned To | Target Close | Actual Close | Evidence Grade |
|-----|--------|-------------|--------------|--------------|----------------|
| G-01 | Open | Product Team | Week 2 | — | Pending |
| G-02 | Open | Product Team | Week 4 | — | Pending |
| G-03 | Open | Product Team | Week 3 | — | Pending |
| G-04 | Open | Product Team | Week 1 | — | Pending |
| G-05 | Open | Product Team | Week 4 | — | Pending |
| G-06 | Open | Product Team | Week 4 | — | Pending |
| G-07 | Open | Product Team | Week 2 | — | Pending |
| G-08 | Open | Product Team | Week 2 | — | Pending |
| G-09 | Open | Product Team | Week 3 | — | Pending |
| G-10 | Open | Product Team | Week 2 | — | Pending |
| G-11 | Open | Product Team | Week 8 | — | Pending |
| G-12 | Open | Product Team | Week 5 | — | Pending |
| G-13 | Open | Product Team | Week 7 | — | Pending |
| G-14 | Open | Product Team | Week 6 | — | Pending |
| G-15 | Open | Product Team | Week 3 | — | Pending |
| G-16 | Resolved | Phase 27.1R | Phase 27.1R | Complete | Resolved (D-06 adopted) |
| G-17 | Resolved | Phase 27.1R | Phase 27.1R | Complete | Resolved (D-06 adopted) |
| G-18 | Open | Product Team | Ongoing | — | Monitor |
| G-19 | Open | Product Team | Week 8 | — | 6/18 complete |
| G-20 | Open | Product Team | Week 4 | — | 0 claims |
| G-21 | Open | Product Team | Q4 2026 | — | 1/3 regions |

---

## 6. Evidence Strength Targets

| Level | Current Count | Target (End of Phase 27.1V) | Interviews Needed |
|-------|---------------|------------------------------|-------------------|
| Validated (3+ sources) | 0 | 3 (T1, T2, T3) | 1 (Muhammed confirms all 3) |
| Strong (1 source, quantified) | 1 (Adeel) | 5 | 4 (Khaleel, Ahmed O., Muhammed, Ayman) |
| Moderate (1 source, specific) | 6 (various CRM) | 12 | Remaining interviews |
| Weak (1 source, minimal) | 7 | 5 | As interviews clarify weak claims |
| Pending (no evidence) | 3 (T7, T8, P10) | 0 | All resolved |

---

## 7. Update Triggers

Update this document when:
1. An interview produces evidence that closes a gap → mark gap as Closed, update grade
2. An interview produces contradictory evidence → add to "Contradictions" section
3. A decision gate is triggered → update the relevant hypothesis status
4. A new contact is added → create new gap entry if applicable
5. Weekly — review all open gaps and adjust target dates
