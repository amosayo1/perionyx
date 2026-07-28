---
title: Templates
created: 2026-07-26
updated: 2026-07-26
tags: [index, templates, page-templates, content-types, standards]
owner: platform-team
status: active
---

# Templates

## Purpose

Page templates for every content type in the Brain. Provides standardized structures for lessons, decisions, interviews, evidence, profiles, and all other content categories.

**Authority:** Standard — templates define structure, not substance. Content authors follow templates but adapt to context.

## Summary

The Templates folder contains reusable page structures for the Brain's content types. Each template specifies required sections, frontmatter fields, and formatting conventions. Ensures consistency across the knowledge base while allowing content to evolve.

## Content Map

| File | Template For | Used In |
|------|-------------|---------|
| [[18-Templates/lesson-template\|Lesson Template]] | Engineering/product lessons with evidence | [[17-Lessons/index\|17-Lessons]] |
| [[18-Templates/decision-template\|Decision Template]] | Architecture Decision Records | [[11-Decisions/index\|11-Decisions]] |
| [[18-Templates/interview-template\|Interview Template]] | Customer and stakeholder interviews | [[03-Customer Intelligence/index\|03-Customer Intelligence]] |
| [[18-Templates/evidence-template\|Evidence Template]] | Supporting evidence for claims | [[17-Lessons/index\|17-Lessons]], [[11-Decisions/index\|11-Decisions]] |
| [[18-Templates/profile-template\|Profile Template]] | People, company, and partner profiles | [[15-People/index\|15-People]], [[16-Companies/index\|16-Companies]] |
| [[18-Templates/phase-template\|Phase Template]] | Phase plans and reports | [[12-Roadmaps/index\|12-Roadmaps]] |
| [[18-Templates/experiment-template\|Experiment Template]] | A/B tests and experiments | [[02-Product/index\|02-Product]] |
| [[18-Templates/meeting-notes-template\|Meeting Notes Template]] | Meeting notes and action items | [[15-People/index\|15-People]] |
| [[18-Templates/book-notes-template\|Book Notes Template]] | Book and article summaries | [[10-Research/index\|10-Research]] |
| [[18-Templates/research-template\|Research Template]] | Research findings and analysis | [[10-Research/index\|10-Research]] |
| [[18-Templates/security-finding-template\|Security Finding Template]] | Security audit findings | [[08-Security/index\|08-Security]] |
| [[18-Templates/threat-model-template\|Threat Model Template]] | Threat modeling documents | [[08-Security/index\|08-Security]] |
| [[18-Templates/postmortem-template\|Postmortem Template]] | Incident postmortems | [[13-Operations/index\|13-Operations]] |
| [[18-Templates/workflow-knowledge-template\|Workflow Knowledge Template]] | Workflow domain knowledge | [[06-Platform/index\|06-Platform]] |
| [[18-Templates/journal-entry-template\|Journal Entry Template]] | Daily/weekly journal entries | [[09-Journal/index\|09-Journal]] |

### Template Conventions

Every template must include:
1. **YAML frontmatter** — title, created, updated, tags, owner, status
2. **Purpose** — one-sentence description with authority level
3. **Summary** — 2-3 sentence overview
4. **Content** — structured sections specific to the type
5. **Related** — wikilinks to connected content

## Navigation

| Folder | Relationship |
|--------|-------------|
| [[00-Constitution/index\|00-Constitution]] | Constitution defines content standards templates implement |
| [[04-Engineering/index\|04-Engineering]] | Engineering standards for technical content |

## Related

- [[00-Constitution/index\|00-Constitution]] — Content governance and quality standards
- [[04-Engineering/index\|04-Engineering]] — Technical documentation standards
- [[17-Lessons/index\|17-Lessons]] — Primary consumer of lesson and decision templates
- [[11-Decisions/index\|11-Decisions]] — Decision Network uses ADR templates
