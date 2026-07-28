---
title: "Interview Import Guide"
created: 2026-07-27
updated: 2026-07-27
tags:
  - type/guide
  - domain/customer-intelligence
  - status/active
owner: Product Team
authority: Strategy
---

# Interview Import Guide

## Purpose

This document lists every interview that needs to be imported into the Brain from LinkedIn conversations. It defines the expected metadata for each interview and the procedure for importing.

## Summary

11 finance professionals have been contacted via LinkedIn. Their interview transcripts exist in external LinkedIn conversations (analyzed with ChatGPT) but have not yet been stored in the repository. This guide makes importing them a structured, repeatable operation.

## Import Procedure

### Step 1: Prepare the Transcript

Copy the LinkedIn conversation content. Include:
- The full question-and-answer exchange
- Any follow-up messages
- Timestamps if available

### Step 2: Create the Interview Record

Copy the template below into `Interviews/interview-{kebab-name}.md`:

```markdown
---
title: "Interview: {Full Name}"
created: {YYYY-MM-DD}
updated: {YYYY-MM-DD}
tags:
  - type/interview
  - domain/customer-intelligence
  - status/completed
  - person/{kebab-name}
person: "{Full Name}"
date: {YYYY-MM-DD}
channel: LinkedIn
interview_type: discovery
status: completed
---

# Interview: {Full Name}

## Person

- **Name**: {Full Name}
- **Role**: {Job Title}
- **Company**: {Company Name}
- **Country**: {Country}
- **ERP Experience**: {Current ERP systems}

## Key Quotes

> {Direct quote 1}

> {Direct quote 2}

## Pain Points

| Pain Point | Severity | Current State | Perionyx Coverage |
|-----------|----------|---------------|-------------------|
| {pain point} | {High/Medium/Low} | {manual/spreadsheet/ERP} | {Full/Partial/None} |

## Insights

1. {Insight derived from interview}

## Validated Evidence

- {Evidence claim supported by this interview}

## Product Implications

- {What this interview means for product direction}

## Follow-Up

- {Follow-up questions or next steps}

## Relationships

| Type | Page | Description |
|------|------|-------------|
| Person | [[People/{kebab-name}\|{Full Name}]] | Interviewee profile |
| Evidence | [[Validated Evidence/{evidence-page}]] | Related evidence |
| Pain Point | [[Pain Points/{pain-point-page}]] | Related pain point |
```

### Step 3: Create or Update the People Profile

Update `People/{kebab-name}.md` from `pending-import` to `active`. Fill in all sections from the interview data.

### Step 4: Extract Evidence

For each insight from the interview:
1. Check if a relevant `Validated Evidence/` page exists
2. If yes, add the interview as a supporting source
3. If no, create a new evidence page with this interview as the first source

### Step 5: Update Cross-Links

1. Update `CRM_INDEX.md` with the new contact
2. Add any new pain points to `Pain Points/`
3. Update `VALIDATED_MARKET_THEMES.md` if the interview confirms or challenges a theme
4. Update `PRODUCT_PRINCIPLES.md` if the interview validates or contradicts a principle

### Step 6: Verify

- [ ] Interview record created with all required frontmatter
- [ ] People profile updated from pending-import to active
- [ ] At least 1 pain point extracted
- [ ] At least 1 evidence claim linked
- [ ] Cross-links updated in INDEX.md

---

## Pending Interviews

### 1. Rajasekar Ramakrishnan

| Field | Value |
|-------|-------|
| Status | **Pending Import** |
| Role | _TBD_ |
| Company | _TBD_ |
| Country | _TBD_ |
| ERP Experience | _TBD_ |
| Financial Domain | _TBD_ |
| Workflow Expertise | _TBD_ |
| Key Operational Insights | _TBD_ |
| Validated Evidence | _TBD_ |
| Product Implications | _TBD_ |
| Design Partner Score | _TBD_ |
| CRM Link | _TBD_ |
| Follow-up Status | _TBD_ |

**People Profile**: [[People/raji-ramakrishnan]]
**Interview Record**: [[Interviews/interview-ramasekar-ramakrishnan]]

---

### 2. Mohamed Abdelbaset

| Field | Value |
|-------|-------|
| Status | **Pending Import** |
| Role | _TBD_ |
| Company | _TBD_ |
| Country | _TBD_ |
| ERP Experience | _TBD_ |
| Financial Domain | _TBD_ |
| Workflow Expertise | _TBD_ |
| Key Operational Insights | _TBD_ |
| Validated Evidence | _TBD_ |
| Product Implications | _TBD_ |
| Design Partner Score | _TBD_ |
| CRM Link | _TBD_ |
| Follow-up Status | _TBD_ |

**People Profile**: [[People/mohamed-abdelbaset]]
**Interview Record**: [[Interviews/interview-mohamed-abdelbaset]]

---

### 3. Aman Raza

| Field | Value |
|-------|-------|
| Status | **Pending Import** |
| Role | _TBD_ |
| Company | AR Business Hub |
| Country | _TBD_ |
| ERP Experience | _TBD_ |
| Financial Domain | _TBD_ |
| Workflow Expertise | _TBD_ |
| Key Operational Insights | _TBD_ |
| Validated Evidence | _TBD_ |
| Product Implications | _TBD_ |
| Design Partner Score | _TBD_ |
| CRM Link | _TBD_ |
| Follow-up Status | _TBD_ |

**People Profile**: [[People/aman-raza]]
**Interview Record**: [[Interviews/interview-aman-raza]]

---

### 4. Ahmed Shatla

| Field | Value |
|-------|-------|
| Status | **Pending Import** |
| Role | _TBD_ |
| Company | _TBD_ |
| Country | _TBD_ |
| ERP Experience | _TBD_ |
| Financial Domain | _TBD_ |
| Workflow Expertise | _TBD_ |
| Key Operational Insights | _TBD_ |
| Validated Evidence | _TBD_ |
| Product Implications | _TBD_ |
| Design Partner Score | _TBD_ |
| CRM Link | _TBD_ |
| Follow-up Status | _TBD_ |

**People Profile**: [[People/ahmed-shatla]]
**Interview Record**: [[Interviews/interview-ahmed-shatla]]

---

### 5. Hasan Mohammad

| Field | Value |
|-------|-------|
| Status | **Pending Import** |
| Role | _TBD_ |
| Company | _TBD_ |
| Country | _TBD_ |
| ERP Experience | _TBD_ |
| Financial Domain | _TBD_ |
| Workflow Expertise | _TBD_ |
| Key Operational Insights | _TBD_ |
| Validated Evidence | _TBD_ |
| Product Implications | _TBD_ |
| Design Partner Score | _TBD_ |
| CRM Link | _TBD_ |
| Follow-up Status | _TBD_ |

**People Profile**: [[People/hasan-mohammad]]
**Interview Record**: [[Interviews/interview-hasan-mohammad]]

---

### 6. Rawan Abdullah

| Field | Value |
|-------|-------|
| Status | **Pending Import** |
| Role | _TBD_ |
| Company | _TBD_ |
| Country | _TBD_ |
| ERP Experience | _TBD_ |
| Financial Domain | _TBD_ |
| Workflow Expertise | _TBD_ |
| Key Operational Insights | _TBD_ |
| Validated Evidence | _TBD_ |
| Product Implications | _TBD_ |
| Design Partner Score | _TBD_ |
| CRM Link | _TBD_ |
| Follow-up Status | _TBD_ |

**People Profile**: [[People/rawan-abdullah]]
**Interview Record**: [[Interviews/interview-rawan-abdullah]]

---

### 7. Ahmed AlShehy

| Field | Value |
|-------|-------|
| Status | **Pending Import** |
| Role | _TBD_ |
| Company | _TBD_ |
| Country | _TBD_ |
| ERP Experience | _TBD_ |
| Financial Domain | _TBD_ |
| Workflow Expertise | _TBD_ |
| Key Operational Insights | _TBD_ |
| Validated Evidence | _TBD_ |
| Product Implications | _TBD_ |
| Design Partner Score | _TBD_ |
| CRM Link | _TBD_ |
| Follow-up Status | _TBD_ |

**People Profile**: [[People/ahmed-alshehy]]
**Interview Record**: [[Interviews/interview-ahmed-alshehy]]

---

### 8. Ali Abdelhai Elemam

| Field | Value |
|-------|-------|
| Status | **Pending Import** |
| Role | _TBD_ |
| Company | _TBD_ |
| Country | _TBD_ |
| ERP Experience | _TBD_ |
| Financial Domain | _TBD_ |
| Workflow Expertise | _TBD_ |
| Key Operational Insights | _TBD_ |
| Validated Evidence | _TBD_ |
| Product Implications | _TBD_ |
| Design Partner Score | _TBD_ |
| CRM Link | _TBD_ |
| Follow-up Status | _TBD_ |

**People Profile**: [[People/ali-elemam]]
**Interview Record**: [[Interviews/interview-ali-elemam]]

---

### 9. Nawaf Alshammari

| Field | Value |
|-------|-------|
| Status | **Pending Import** |
| Role | _TBD_ |
| Company | _TBD_ |
| Country | _TBD_ |
| ERP Experience | _TBD_ |
| Financial Domain | _TBD_ |
| Workflow Expertise | _TBD_ |
| Key Operational Insights | _TBD_ |
| Validated Evidence | _TBD_ |
| Product Implications | _TBD_ |
| Design Partner Score | _TBD_ |
| CRM Link | _TBD_ |
| Follow-up Status | _TBD_ |

**People Profile**: [[People/nawaf-alshammari]]
**Interview Record**: [[Interviews/interview-nawaf-alshammari]]

---

### 10. Khaled Ashraf

| Field | Value |
|-------|-------|
| Status | **Pending Import** |
| Role | _TBD_ |
| Company | _TBD_ |
| Country | _TBD_ |
| ERP Experience | _TBD_ |
| Financial Domain | _TBD_ |
| Workflow Expertise | _TBD_ |
| Key Operational Insights | _TBD_ |
| Validated Evidence | _TBD_ |
| Product Implications | _TBD_ |
| Design Partner Score | _TBD_ |
| CRM Link | _TBD_ |
| Follow-up Status | _TBD_ |

**People Profile**: [[People/khaled-ashraf]]
**Interview Record**: [[Interviews/interview-khaled-ashraf]]

---

### 11. Adeel Aslam (Already Imported)

| Field | Value |
|-------|-------|
| Status | **Imported** |
| Role | Finance Professional |
| Company | _TBD_ (Real Estate & Construction) |
| Country | _TBD_ |
| ERP Experience | _TBD_ |
| Financial Domain | Real Estate & Construction Finance |
| Workflow Expertise | Vendor invoice reconciliation, approval workflows |
| Key Operational Insights | Reporting and cash flow planning covered; operational tasks are the gap |
| Validated Evidence | Vendor invoice reconciliation is manual; approval workflows require manual oversight |
| Product Implications | Reporting is table stakes; differentiation is in transactional automation |
| Design Partner Score | _TBD_ |
| CRM Link | _TBD_ |
| Follow-up Status | _TBD_ |

**People Profile**: [[People/adeel-aslam]]
**Interview Record**: [[Interviews/interview-adeel-aslam]] ✓

---

## Import Checklist

Before importing any interview, ensure:

- [ ] Transcript is available in full (not partial)
- [ ] At least 3 pain points can be extracted
- [ ] At least 1 validated evidence claim can be identified
- [ ] Role and company information is confirmed
- [ ] ERP experience is documented
- [ ] Design partner potential can be assessed

After importing:

- [ ] People profile created/updated
- [ ] Interview record created
- [ ] Pain points extracted and linked
- [ ] Validated evidence linked
- [ ] CRM_INDEX.md updated
- [ ] Cross-links verified

## Evidence Confidence Rules

| Level | Criteria | Action |
|-------|----------|--------|
| High | 3+ independent interviews, same pattern | Can inform product decisions |
| Medium | 2 interviews, or 1 very detailed interview | Needs more validation |
| Low | Single interview, or hearsay | Hypothesis only |
| Contradicted | Interviews disagree | Investigate discrepancy |

## Relationships

| Type | Page | Description |
|------|------|-------------|
| Parent | [[INDEX\|Customer Intelligence Index]] | Folder index |
| Related | [[CUSTOMER_INTELLIGENCE_GUIDE\|Knowledge Model]] | Template definitions |
| Related | [[CRM_ALIGNMENT\|CRM Mapping]] | CRM ↔ Brain field mapping |
| Related | [[CRM_INDEX\|CRM Cross-Reference]] | Contact mapping |
| Lesson | [[17-Lessons/47-interview-structure-before-content\|Lesson 47]] | Structure before content |

## Open Questions

1. Should we import transcripts verbatim or summarize them?
2. How do we handle interviews conducted in Arabic?
3. Should design partner scores be updated after each interview or only after 2+?

## Next Actions

1. Begin importing transcripts one by one
2. After each import, update this document to mark status as "Imported"
3. After 3+ imports, begin populating VALIDATED_MARKET_THEMES.md
