---
title: "ERP Observations"
created: 2026-07-27
updated: 2026-07-27
tags:
  - type/reference
  - domain/customer-intelligence
  - status/active
owner: Product Team
authority: Strategy
---

# ERP Observations

## Purpose

Observations about ERP systems gathered from customer discovery interviews. Documents what finance professionals use, what they like, what frustrates them, and where Perionyx can differentiate.

## Summary

CRM contacts mention SAP, Odoo, Microsoft Dynamics 365, and SMACC as current ERP systems. Observations are structured by ERP system with evidence from interviews and CRM contacts.

## ERP Systems Mentioned

### SAP

| Field | Value |
|-------|-------|
| Mentions | Ayman Shawky (CRM) |
| Context | Enterprise ERP — siloed between inventory and finance |
| Pain Points | Integration overhead, reconciliation between modules |
| Opportunity | Perionyx as unified layer on top of SAP |

**Evidence**:
- Ayman Shawky (CRM): SAP listed as one of three ERP systems he works with

**Product Implication**: SAP integration is critical for enterprise adoption. SAP connector should be a priority.

---

### Odoo

| Field | Value |
|-------|-------|
| Mentions | Ayman Shawky (CRM), Ahmed Abdelmoneim (CRM) |
| Context | Open-source ERP — used in MENA market |
| Pain Points | Limited treasury features, weak real-time reporting |
| Opportunity | Perionyx as treasury/analytics layer on top of Odoo |

**Evidence**:
- Ayman Shawky (CRM): Odoo listed as one of three ERP systems he works with
- Ahmed Abdelmoneim (CRM): "Expertise in treasury, Odoo ERP, and Power BI reporting"

**Product Implication**: Odoo connector should be prioritized for MENA market. Odoo's treasury gaps are Perionyx's opportunity.

---

### Microsoft Dynamics 365

| Field | Value |
|-------|-------|
| Mentions | Eslam Sobhi (CRM), Ayman Shawky (CRM) |
| Context | Enterprise ERP — cost accounting focus |
| Pain Points | Cost accounting workflows require manual oversight |
| Opportunity | Perionyx as automation layer for Dynamics users |

**Evidence**:
- Eslam Sobhi (CRM): "Microsoft Dynamics 365, Financial Reporting, Cost Accounting"
- Ayman Shawky (CRM): Dynamics listed as one of three ERP systems

**Product Implication**: Dynamics 365 connector for cost accounting workflows.

---

### SMACC

| Field | Value |
|-------|-------|
| Mentions | _Expected from interviews_ |
| Context | Cloud accounting for MENA market |
| Pain Points | _TBD_ |
| Opportunity | Perionyx as advanced analytics layer |

**Evidence**:
- _No direct mentions yet — expected from MENA interviews_

**Product Implication**: SMACC integration may be valuable for Saudi Arabia market entry.

---

### QuickBooks

| Field | Value |
|-------|-------|
| Mentions | Competitive signal (Phase 25.0) |
| Context | SMB accounting — widely used |
| Pain Points | Limited enterprise features, no treasury, no AP automation |
| Opportunity | Perionyx as enterprise upgrade path |

**Evidence**:
- Phase 25.0 competitive analysis identified QuickBooks as primary competitor for SMB segment

**Product Implication**: QuickBooks migration path is a marketing opportunity.

---

## ERP Pain Patterns

| Pattern | Evidence | Confidence |
|---------|----------|------------|
| Siloed modules require manual reconciliation | Ayman Shawky (CRM) | Working |
| Weak integration between inventory and finance | Muhammed Jamsheed (CRM) | Working |
| Limited real-time reporting | Ayman Shawky (CRM) | Working |
| No treasury features in accounting ERPs | Multiple CRM contacts | Hypothesis |
| Manual cost accounting workflows | Eslam Sobhi (CRM) | Hypothesis |

## Relationships

| Type | Page | Description |
|------|------|-------------|
| Parent | [[INDEX\|Customer Intelligence Index]] | Folder index |
| Source | [[CRM_INDEX]] | CRM contacts with ERP experience |
| Related | [[WORKFLOW_RESEARCH_INDEX]] | Workflows by ERP system |
| Related | [[VALIDATED_MARKET_THEMES]] | Market themes |

## Open Questions

1. Which ERP systems do the 10 pending interviewees use?
2. Should we build connectors for all mentioned ERPs or focus on top 3?
3. How do ERP observations feed into integration platform priorities?

## Next Actions

1. Import interviews and document ERP experience for each
2. After 3+ interviews, create ERP-specific evidence pages
3. Feed ERP findings into integration platform roadmap
