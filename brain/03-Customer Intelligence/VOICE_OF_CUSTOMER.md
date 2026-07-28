---
title: "Voice of Customer"
created: 2026-07-27
updated: 2026-07-28
tags:
  - type/reference
  - domain/customer-intelligence
  - status/active
owner: Product Team
authority: Strategy
---

# Voice of Customer

## Purpose

Synthesis of all customer feedback, organized by theme. Quotes are organized by category for easy reference when making product decisions.

## Summary

VoC data flows from interviews → quote banks → themes → product decisions. Every quote must be traceable to its source interview. Currently limited to 1 formal interview (Adeel Aslam) and 18 CRM-sourced interaction records.

## Quote Banks

### On Manual Work

| Quote | Source | Date | Context |
|-------|--------|------|---------|
| "In real estate and construction finance, one area we still manage manually is vendor invoice reconciliations and approval workflows." | Adeel Aslam | 2026-07-21 | Discovery conversation |
| "While our systems cover reporting and cash flow planning fairly well, these operational tasks often require manual oversight to ensure accuracy." | Adeel Aslam | 2026-07-21 | Discovery conversation |
| "Inventory reconciliation still depends heavily on spreadsheets." | Muhammed Jamsheed | TBD | CRM feedback session |
| "Stock corrections require manual work in current ERP." | Muhammed Jamsheed | TBD | CRM feedback session |
| "Automated reconciliation is highly desired." | Muhammed Jamsheed | TBD | CRM feedback session |
| "Intelligent discrepancy alerts would reduce manual work significantly." | Muhammed Jamsheed | TBD | CRM feedback session |
| "Manual bank reconciliation, manual account reconciliation, manual balance reviews." | Mohamed Gamal | TBD | CRM interaction |
| "Approval bottlenecks." | Mohamed Gamal | TBD | CRM interaction |

### On ERP Limitations

| Quote | Source | Date | Context |
|-------|--------|------|---------|
| "Siloed systems create reconciliation overhead; Single source of truth for financial data." | Ayman Shawky | TBD | CRM feedback session |
| "Weak integration between inventory and finance modules; Data must be exported and re-imported manually." | Muhammed Jamsheed | TBD | CRM feedback session |
| "Need for instant view of cash positions across all accounts; Desire for drill-down from summary to transaction detail." | Ayman Shawky | TBD | CRM feedback session |
| "Desire for multi-currency balance aggregation." | Ayman Shawky | TBD | CRM feedback session |

### On AI & Forecasting

| Quote | Source | Date | Context |
|-------|--------|------|---------|
| "Interest in ML-based cash flow predictions; Need for confidence scoring on forecasts." | Ayman Shawky | TBD | CRM feedback session |

### On Unified Platform

| Quote | Source | Date | Context |
|-------|--------|------|---------|
| "What can I do to support you in building that operating system?" | Khaleel Ur Rehman | TBD | CRM interaction |
| "Automated reconciliations, automated approvals, better cross-department collaboration, faster month-end close, recurring journal automation." | Mohamed Gamal | TBD | CRM interaction |

### On Treasury & ERP Integration

| Quote | Source | Date | Context |
|-------|--------|------|---------|
| "Provided detailed feedback on treasury operations and expressed openness to exchanging ideas." | Eslam Sobhi | TBD | CRM interaction |
| "Expertise in treasury, Odoo ERP, and Power BI reporting." | Ahmed Abdelmoneim | TBD | CRM interaction |

## Themes by Frequency

| Theme | Quote Count | Sources | Confidence |
|-------|-------------|---------|------------|
| Manual approval workflows | 3 | Adeel Aslam, Muhammed Jamsheed, Mohamed Gamal | Working (4 sources) |
| Vendor invoice reconciliation | 4 | Adeel Aslam, Ahmed Shatla, Muhammed Jamsheed, Mohamed Gamal | Working (4 sources) |
| Siloed ERP modules | 3 | Ayman Shawky, Muhammed Jamsheed, Ahmed Abdelmoneim | Validated (3 sources) |
| Real-time cash visibility | 2 | Ayman Shawky, Ahmed Abdelmoneim | Working (2 sources) |
| Month-end close pain | 3 | Muhammed Jamsheed, Ahmed Alazazy, Mohamed Gamal | Validated (3 sources) |
| AI forecasting needs trust | 2 | Ayman Shawky, Mahmoud Shaker | Working (2 sources) |
| Multi-currency complexity | 1 | Ayman Shawky | Hypothesis |
| Regulatory compliance (VAT/ZATCA) | 1 | Ahmed Esmail | Hypothesis |

## Quotes Pending Import

| Interviewee | Expected Themes | Status |
|-------------|-----------------|--------|
| Rajasekar Ramakrishnan | _TBD_ | Pending Import |
| Mohamed Abdelbaset | _TBD_ | Pending Import |
| Aman Raza | AR workflows, collections | Pending Import |
| Ahmed Shatla | Vendor invoice reconciliation (partial) | Pending Import |
| Hasan Mohammad | _TBD_ | Pending Import |
| Rawan Abdullah | _TBD_ | Pending Import |
| Ahmed AlShehy | _TBD_ | Pending Import |
| Ali Abdelhai Elemam | _TBD_ | Pending Import |
| Nawaf Alshammari | _TBD_ | Pending Import |
| Khaled Ashraf | _TBD_ | Pending Import |
| + 20 LinkedIn-only contacts | _TBD_ | Pending Interview |

## Relationships

| Type | Page | Description |
|------|------|-------------|
| Parent | [[INDEX\|Customer Intelligence Index]] | Folder index |
| Source | [[People/adeel-aslam]] | Adeel Aslam interview |
| Source | [[People/muhammed-jamsheed]] | Muhammed Jamsheed CRM data |
| Source | [[People/ayman-shawky]] | Ayman Shawky CRM data |
| Source | [[People/mohamed-gamal]] | Mohamed Gamal CRM data |
| Source | [[People/khaleel-ur-rehman]] | Khaleel Ur Rehman CRM data |
| Source | [[People/eslam-sobhi]] | Eslam Sobhi CRM data |
| Source | [[People/ahmed-abdelmoneim]] | Ahmed Abdelmoneim CRM data |
| Related | [[VALIDATED_MARKET_THEMES]] | Themes derived from quotes |
| Related | [[PRODUCT_PRINCIPLES]] | Principles derived from quotes |
| Related | [[PRODUCT_EVIDENCE_MATRIX]] | Evidence matrix |

## Open Questions

1. Should quotes be stored in original language (Arabic) alongside English?
2. How do we handle paraphrased vs. verbatim quotes?
3. Should we weight recent quotes higher than older ones?

## Next Actions

1. Schedule formal interviews for top design partner candidates
2. After 3+ interviews, create theme-specific evidence pages
3. Feed quote banks into product decision documentation
