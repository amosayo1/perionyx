---
title: "CRM Alignment"
created: 2026-07-26
updated: 2026-07-26
tags:
  - type/guide
  - domain/customer-intelligence
  - domain/crm
  - status/active
owner: Product Team
authority: Strategy
---

# CRM Alignment

How the operational CRM maps to the Brain's Customer Intelligence.

**Reference**: [[03-Customer Intelligence/CUSTOMER_INTELLIGENCE_GUIDE|Customer Intelligence Guide]]

---

## Purpose

The CRM (`src/modules/crm/`) is the operational system for managing contacts, tracking interactions, and scheduling follow-ups. Customer Intelligence in the Brain is the knowledge system for understanding customers deeply.

This document defines the mapping between them.

---

## CRM → Brain Mapping

| CRM Field | Brain Profile Field | Notes |
|-----------|-------------------|-------|
| name | name | Direct mapping |
| role | role | Direct mapping |
| company | company → Companies/ | Link to company profile |
| industry | industry | Direct mapping |
| country | country | Direct mapping |
| erpExperience | erp_experience | Direct mapping |
| painPoints | Pain Points/ | Each pain point gets its own page |
| businessChallenges | Related Pain Points | Cross-referenced |
| currentSystems | current_systems | Direct mapping |
| interests | Related Product Areas | Cross-referenced |
| relationshipStrength | relationship_strength | Direct mapping |
| interactions | Conversation History | Timeline of all conversations |
| isStrategicAdvisor | relationship_strength: Advisor | Flag in Brain profile |
| brainLink | brain_link | Bidirectional link |
| knowledgeLinks | Related pages | Wikilinks to Brain content |
| opportunityScore | opportunity_score | Direct mapping |
| tags | tags | Merged tag sets |

---

## Bidirectional Links

### CRM → Brain

Every CRM contact record should include:
```
brainLink: brain/03-Customer Intelligence/People/<kebab-name>.md
knowledgeLinks:
  - brain/03-Customer Intelligence/Pain Points/<pain-point>.md
  - brain/03-Customer Intelligence/Validated Evidence/<evidence>.md
```

### Brain → CRM

Every Brain person profile should include:
```yaml
crm_link: CRM contact record ID or path
```

---

## Profile Completeness

A contact is "complete" when:

- [ ] Name, role, company, industry, country filled in
- [ ] ERP experience documented
- [ ] Pain points linked to Brain pain point pages
- [ ] At least 1 interview or conversation documented
- [ ] Brain profile page created with relationships
- [ ] Opportunity score assessed
- [ ] Next follow-up scheduled

---

---

## Import Procedure

When importing a new interview:

1. Check if the contact exists in CRM (`src/modules/crm/crm-seed.ts`)
2. If yes, use the CRM data to pre-populate the Brain profile
3. If no, create a Brain-only profile and note "CRM record needed"
4. After import, update `CRM_INDEX.md` with the mapping

For the full list of contacts pending import, see `IMPORT_INTERVIEWS.md`.

---

*Last updated: 2026-07-27 (Phase 25.2A)*
