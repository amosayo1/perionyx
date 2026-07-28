---
title: "Customer Intelligence Guide"
created: 2026-07-26
updated: 2026-07-26
tags:
  - type/guide
  - domain/customer-intelligence
  - status/active
owner: Product Team
authority: Strategy
---

# Customer Intelligence Guide

How the Brain captures, validates, and connects customer knowledge.

**Reference**: [[00-Constitution/KNOWLEDGE_CONSTITUTION|Knowledge Constitution]]

---

## Purpose

Customer Intelligence transforms scattered conversations into institutional knowledge. Every interview, pain point, feature request, and competitive signal becomes a connected node in the customer knowledge graph.

The goal: any team member can understand what customers need, why they need it, and how confident we are in that understanding — without asking anyone.

---

## Knowledge Model

### People (`03-Customer Intelligence/People/`)

Every person receives a profile:

```yaml
name: Full Name
role: Job Title
company: Company Name
industry: Industry
country: Country
erp_experience: Current ERP systems
relationship_strength: Cold | Warm | Hot | Advisor
brain_link: [[03-Customer Intelligence/People/kebab-name]]
crm_link: (link to CRM record)
```

**Profile sections**: Role, Industry, Country, Experience, Conversation History, Pain Points, Validated Evidence, Workflow Knowledge, Potential Follow-up, Related Domains, Related Lessons, Related Decisions, Related Product Areas.

### Companies (`03-Customer Intelligence/Companies/`)

Every company receives a profile:

```yaml
company: Company Name
industry: Industry
size: Employee range
country: Country
current_systems: ERP, Treasury, Banking
opportunity_score: 1-10
status: Prospect | Customer | Partner | Lost
```

### Validated Evidence (`03-Customer Intelligence/Validated Evidence/`)

Evidence records that have been validated through multiple sources:

```markdown
## Claim
Enterprise finance suffers from fragmented workflows.

## Supporting Sources
- Ahmed Shatla (2026-07-21): "vendor invoice reconciliations and approval workflows"
- Mohamed (2026-07-22): "approval delays between departments"
- Aman (2026-07-23): "reconciliation is manual and error-prone"
- Mostafa (2026-07-24): "no single view of cash position"

## Confidence
High (4+ independent sources, same pattern)

## Related Domains
- [[07-Domains/Treasury|Treasury]]
- [[07-Domains/Accounts-Receivable|Accounts Receivable]]
- [[07-Domains/Accounts-Payable|Accounts Payable]]
- [[07-Domains/Workflow|Workflow]]
```

### Product Hypotheses (`03-Customer Intelligence/Product Hypotheses/`)

Ideas separated from validated evidence:

```markdown
## Description
AI-powered cash forecasting will reduce forecast time by 80%.

## Evidence
- None yet — this is a hypothesis

## Supporting Interviews
- (none)

## Contradicting Interviews
- (none)

## Confidence
Low (no validation)

## Validation Plan
- Interview 3 treasurers about current forecasting process
- Benchmark against existing tools (Float, Pulse)

## Status
Hypothesis
```

### Pain Points (`03-Customer Intelligence/Pain Points/`)

Catalogued customer problems:

```markdown
## Pain Point
Manual approval workflows delay payments

## Severity
High

## Frequency
Reported by 4+ customers

## Current workaround
Email chains and spreadsheets

## Perionyx coverage
Partial — approval matrix exists but not wired to payment execution

## Related evidence
- [[03-Customer Intelligence/Validated Evidence/evidence-fragmented-workflows]]
```

---

## Evidence Confidence Levels

| Level | Criteria | Action |
|-------|----------|--------|
| High | 3+ independent sources, same pattern | Can inform product decisions |
| Medium | 2 sources, or 1 very detailed source | Needs more validation |
| Low | Single source, or hearsay | Hypothesis only |
| Contradicted | Sources disagree | Investigate discrepancy |

Evidence evolves over time. Do not treat hypotheses as facts.

---

## CRM Alignment

The CRM (in `src/modules/crm/`) is the operational system for contact management. Customer Intelligence in the Brain is the knowledge system.

**Every CRM contact must have a Brain link.**
**Every Brain person profile must have a CRM link.**

See `CRM_ALIGNMENT.md` for the complete mapping.

---

## Cross-Links

- **People** → Pain Points → Validated Evidence → Product Hypotheses → Features
- **Companies** → People → Interviews → Evidence → Decisions
- **Interviews** → Pain Points → Evidence → Architecture → Implementation
- **Competitive Signals** → Market Trends → Strategy → Product Roadmap

---

---

## Import Workflow

New interviews are imported via `IMPORT_INTERVIEWS.md`. The process:

1. Paste the LinkedIn conversation transcript
2. Create the interview record using the template in `IMPORT_INTERVIEWS`
3. Create or update the People profile
4. Extract pain points and validated evidence
5. Update cross-links in this guide and `CRM_INDEX.md`

**Every import must preserve traceability.** Quotes must be linked to their source interview. Evidence must cite the interview date and channel. No unattributed claims.

See [[IMPORT_INTERVIEWS]] for the complete import procedure and pending interview list.

---

## Knowledge Graph Structure

The Customer Intelligence knowledge graph connects:

```
People → Interviews → Pain Points → Validated Evidence → Product Principles
  ↓           ↓              ↓                ↓                    ↓
Companies  CRM Contacts  Market Themes  Evidence Matrix    Product Roadmap
```

Every node is a Brain page with frontmatter, cross-links, and evidence. Importing an interview creates or updates nodes across this graph.

---

*Last updated: 2026-07-27 (Phase 25.2A)*
