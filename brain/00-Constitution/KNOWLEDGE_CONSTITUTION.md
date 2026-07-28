---
title: "Knowledge Constitution"
created: 2026-07-26
updated: 2026-07-26
tags:
  - type/constitution
  - domain/meta
  - status/active
aliases:
  - Brain Constitution
  - Knowledge Operating System Constitution
authority: Supreme
owner: Platform Team
status: active
---

# Knowledge Constitution

The supreme governing document for the Perionyx Brain — the institutional memory of the company.

**Version**: 2.0
**Status**: Active
**Supersedes**: Brain Constitution v1.2 (2026-07-20)

---

## Purpose

The Brain is the permanent knowledge system that captures strategy, architecture, engineering, product, customer discovery, research, operations, decisions, lessons learned, and institutional intelligence.

It is the single source of truth for **WHY** Perionyx exists, **WHY** decisions were made, **WHAT** has been learned, and **HOW** future engineering should evolve.

A new engineer — or a future AI agent — should be able to understand Perionyx by navigating the Brain without needing prior context.

---

## First Principle

> Knowledge compounds only when it is structured.
> Documentation explains. Knowledge connects.
> The Brain is the institutional memory of Perionyx.
> Treat it as a first-class platform.

---

## Authority Hierarchy

Knowledge flows downward. Never upward.

```
Constitution (this document)
    ↓
Strategy (01-Strategy/)
    ↓
Architecture (05-Architecture/)
    ↓
Platform (06-Platform/)
    ↓
Domains (07-Domains/)
    ↓
Implementation (code)
    ↓
Research (10-Research/)
    ↓
Archive (19-Archive/)
```

When a page in a lower tier contradicts a page in a higher tier, the higher tier wins. The contradiction must be resolved by updating the lower page, not by overriding the higher one.

---

## Core Laws

### Law 1 — One Authoritative Home Per Concept

Every concept has exactly one page that defines it. Other pages may reference, extend, or apply it — but never redefine it.

**Enforcement**: If two pages define the same concept, one must be merged into the other or converted to a reference.

### Law 2 — No Knowledge Duplication

Never maintain two copies of the same information. Use links to connect related content.

**Enforcement**: Duplicate content is deleted. The surviving page receives all incoming links.

### Law 3 — Evidence Before Conclusions

Every conclusion must be supported by evidence. Lessons require implementation evidence. Architecture requires ADRs. Customer insights require interviews. Product positioning requires repeated validation.

**Enforcement**: Pages without evidence are flagged as "Hypothesis" status until evidence is provided.

### Law 4 — Research Never Becomes Architecture Automatically

Research informs architecture. But research findings must be explicitly adopted through an ADR before they influence implementation.

**Enforcement**: Research pages link to ADRs. ADRs link to implementation. No direct research-to-code path.

### Law 5 — Architecture Never Becomes Implementation Automatically

Architecture decisions must be validated, reviewed, and approved before code is written. The ADR must exist before the implementation commit.

**Enforcement**: Implementation pages reference ADRs. ADRs reference constitutional authority.

### Law 6 — Every Page Has an Owner

Every page must declare an owner. Owners are responsible for accuracy, currency, and cross-linking.

**Enforcement**: Pages without owners are flagged in health reports.

### Law 7 — Every Page Has Relationships

Every page must declare its relationships: parent, children, related pages, referenced-by. No orphan pages.

**Enforcement**: Pages with zero incoming links are flagged as orphans.

### Law 8 — Every Page Has Status

Every page must have a status: Draft, Active, Deprecated, Archived. No ambiguous state.

**Enforcement**: Pages without status are flagged in quality audits.

### Law 9 — Lessons Require Evidence

A lesson is not a lesson without implementation evidence. Opinions are hypotheses. Only proven patterns become lessons.

**Enforcement**: Lesson pages without evidence sections are downgraded to hypotheses.

### Law 10 — The Brain Is Never Complete

The Brain evolves continuously. New phases produce new knowledge. Old knowledge is archived, never deleted.

**Enforcement**: Archived content remains searchable. Active content is curated quarterly.

---

## Folder Architecture

| # | Folder | Purpose | Authority Level |
|---|--------|---------|----------------|
| 00 | Constitution | Governing documents, laws, standards | Supreme |
| 01 | Strategy | Vision, mission, positioning, business model | Highest |
| 02 | Product | Product vision, roadmap, features, UX principles | High |
| 03 | Customer Intelligence | People, companies, interviews, evidence, pain points | High |
| 04 | Engineering | Lessons, knowledge, journal, checklists | Medium |
| 05 | Architecture | Architecture decisions, diagrams, platform design | High |
| 06 | Platform | Platform constitution, capabilities, provider model | High |
| 07 | Domains | Domain-specific knowledge (AP, AR, Treasury, etc.) | Medium |
| 08 | Security | Security architecture, audit findings, compliance | High |
| 09 | AI | AI platform, agents, intelligence, automation | Medium |
| 10 | Research | Market research, technology evaluation, experiments | Low |
| 11 | Decisions | Architecture Decision Records, decision network | High |
| 12 | Roadmaps | Evolution timeline, phase plans, milestones | Medium |
| 13 | Operations | Deployment, monitoring, incident response, runbooks | Medium |
| 14 | Market Intelligence | Competitors, market trends, industry analysis | Low |
| 15 | People | Team members, advisors, contacts | Low |
| 16 | Companies | Target customers, partners, vendors | Low |
| 17 | Lessons | Engineering and product lessons with evidence | Medium |
| 18 | Templates | Page templates for every content type | Standard |
| 19 | Archive | Deprecated, superseded, historical content | None |

---

## Page Requirements

Every page must contain:

1. **Frontmatter** — title, created, updated, tags, status, owner, authority
2. **Purpose** — why this page exists
3. **Summary** — 2-3 sentence overview
4. **Body** — the actual knowledge
5. **Evidence** — supporting data, interviews, implementation proof
6. **Relationships** — parent, children, related, referenced-by
7. **Cross-links** — links to decisions, lessons, architecture, customers, implementation
8. **Open Questions** — what remains unresolved
9. **Next Actions** — what should happen next
10. **Status** — Draft, Active, Deprecated, Archived

See `PAGE_STANDARDS.md` for the complete template.

---

## Linking Standards

- Every page links to at least 3 other pages
- Every page is linked to by at least 2 other pages
- Use wikilink syntax: `[[folder/file|Display Name]]`
- Link to the authoritative page, not to intermediate summaries
- Backlinks are as important as forward links

---

## Tag Taxonomy

Tags are search accelerators, not categories. Use 3-5 per page.

| Prefix | Domain | Examples |
|--------|--------|----------|
| type/ | Content type | lesson, decision, interview, evidence, architecture, roadmap |
| domain/ | Knowledge domain | engineering, product, security, finance, customer |
| status/ | Lifecycle state | active, draft, deprecated, archived |
| phase/ | Development phase | phase-24, phase-25 |
| persona/ | Target persona | cfo, treasurer, controller, auditor |

---

## Maintenance Cadence

| Frequency | Action |
|-----------|--------|
| Weekly | Check for orphan pages, broken links, new empty pages |
| Monthly | Review MOC completeness, archive stale content, update indexes |
| Quarterly | Constitution review, prune dead links, knowledge health report |
| Per Phase | New lessons, new decisions, new evidence, timeline update |

---

## Migration Rules

When restructuring:
1. Never lose history — rename, don't recreate
2. Maintain backlinks — update all references
3. Merge duplicates — surviving page gets all links
4. Preserve institutional memory — archived content stays searchable
5. Redirect obsolete pages — add redirect notice at top

---

## Enforcement

This constitution is enforced through:
1. **Quality audits** — automated checks for missing frontmatter, empty pages, broken links
2. **Health reports** — quarterly Brain health score
3. **Review process** — new pages reviewed against standards before merge
4. **AI assistance** — agents flag violations during content creation

---

## Amendment Process

Amendments to this constitution require:
1. Proposed change documented as an ADR
2. Evidence supporting the change
3. Impact assessment on existing content
4. Approval from the Platform team
5. Version bump and changelog entry

---

*Last updated: 2026-07-26 (Phase 25.0)*
