---
type: guide
title: "Knowledge Lifecycle Guide"
created: 2026-07-20
updated: 2026-07-20
tags:
  - domain/engineering
  - type/workflow
  - status/active
summary: "Repeatable workflow for keeping the Brain updated after every development phase. No step is optional, no phase is complete without it."
---

# Knowledge Lifecycle Guide

## Purpose

Every completed development phase should naturally produce Brain updates. The engineer should never need to remember what to update.

The Brain is only as valuable as its freshness. Stale architecture notes, missing ADRs, unrecorded lessons — these rot the knowledge graph and erode trust. This guide makes updates systematic: one checklist, one workflow, zero guesswork.

---

## The Lifecycle Workflow

### Phase Completion Trigger → 14 Automatic Outputs

When a development phase completes (all code merged, tests passing, build green), the following 14 outputs must be produced. They are not sequential — most can be done in parallel. None are optional.

#### 1. Phase Summary

What was built, what changed, what was removed. Write the phase note using `Templates/tpl-phase.md`. One file, one phase, no ambiguity.

#### 2. Architecture Changes

New patterns introduced, existing designs updated, trade-offs made. Create or update notes in `03-Architecture/`. If a new architectural decision was made, write an ADR in `03-Architecture/ADRs/`. Update Mermaid diagrams if topology changed.

#### 3. Security Changes

New findings, remediations applied, threat model updates. Create findings in `04-Security/` using `tpl-security-finding.md`. Update the `04-Security/` MOC. If a new attack surface was introduced, update the threat model using `tpl-threat-model.md`.

#### 4. Workflow Changes

New enterprise workflows, updated approval chains, changed business rules. Update notes in `07-Enterprise-Workflows/`. Document the before/after state. Note which user roles are affected.

#### 5. Experience Changes

New components, design system decisions, accessibility improvements. Update notes in `06-Experience-UX/`. Document accessibility impact. Note any new design tokens or patterns.

#### 6. Lessons Learned

What worked well, what didn't, what was surprising. Capture in the phase note (`tpl-phase.md`) and in `13-Engineering-Journal/` if the lesson is broadly applicable. Be honest — surprises and failures are the most valuable lessons.

#### 7. Open Questions

Unresolved issues, technical debt introduced, decisions deferred. Add to the phase note and to `01-Reference/open-questions.md`. Tag owners and target dates if known.

#### 8. Future Improvements

What should be done next, what this phase enables. Add to the phase note and to the product backlog in `02-Product/`. Link to the relevant feature or area.

#### 9. Related ADRs

New Architecture Decision Records created. Updated ADRs with outcomes or reversals. Ensure every ADR links back to its phase note and forward to affected architecture notes.

#### 10. Related Research

New technology evaluations, benchmark results, proof-of-concept findings. Create in `08-Research/` using `tpl-research.md`. Link to the phase that prompted the research.

#### 11. Related Customer Discovery

New interview insights, updated personas, validated or invalidated assumptions. Update notes in `09-Customer-Discovery/`. Link interview insights to product decisions they influenced.

#### 12. Timeline Update

Add a one-line entry to `02-Product/evolution-timeline.md`. Format: `**YYYY-MM-DD — Phase X.Y — Name** — One sentence describing the change.`

#### 13. Dashboard Update

Refresh the Home Dashboard (`00-Home/dashboard.md`). Update metrics (module count, test count, phase completion). Update the "What's New" section. Verify all navigation links work.

#### 14. Knowledge Graph Update

Link new notes to at least 3 existing notes. Update all relevant MOCs. Check for broken internal links. Ensure every new note has at least one incoming link from an existing note. Update the Brain Health Dashboard if it exists.

---

## Checklist Format

Use this checklist for every phase completion. Copy it, fill it in, check it off. Do not mark a phase as "knowledge-complete" until every box is checked.

```markdown
## Phase [X.Y] — [Name] — Brain Update Checklist

### Phase Note
- [ ] Create phase note using `Templates/tpl-phase.md`
- [ ] Fill in all sections (overview, changes, decisions, lessons, risks, metrics, future work)
- [ ] Link to related ADRs, security findings, and research

### Architecture
- [ ] Create/update architecture notes in `03-Architecture/`
- [ ] Create ADR if new decision was made
- [ ] Update MOC if new concept introduced
- [ ] Add/update Mermaid diagrams
- [ ] Document trade-offs and rationale

### Security
- [ ] Create security finding note if applicable
- [ ] Update `04-Security/` MOC
- [ ] Update threat model if new attack surface introduced
- [ ] Verify no new secrets or keys committed
- [ ] Run security pre-commit checklist (10 questions from AGENTS.md)

### Product
- [ ] Update product decisions in `02-Product/`
- [ ] Update persona notes if new insights
- [ ] Update feature backlog
- [ ] Update evolution timeline

### Engineering
- [ ] Create engineering journal entry
- [ ] Update `13-Engineering-Journal/` MOC
- [ ] Document lessons learned (worked / didn't / surprised)
- [ ] Document open questions and technical debt
- [ ] Document future improvements enabled by this phase

### Experience
- [ ] Update UX notes in `06-Experience-UX/`
- [ ] Document design decisions
- [ ] Document accessibility impact

### Workflows
- [ ] Update workflow notes in `07-Enterprise-Workflows/`
- [ ] Document new or changed approval chains
- [ ] Document affected user roles

### Research
- [ ] Create research note if new evaluation performed
- [ ] Link research to the phase that prompted it

### Customer Discovery
- [ ] Update persona notes if new insights from this phase
- [ ] Link interview insights to product decisions

### Knowledge Graph
- [ ] Link new notes to at least 3 existing notes
- [ ] Update relevant MOCs (Architecture, Security, Engineering Journal, Workflows, UX)
- [ ] Check for broken links
- [ ] Update Home Dashboard
- [ ] Update Evolution Timeline
- [ ] Update Open Questions
- [ ] Verify every new note has at least one incoming link
```

---

## Automation Opportunities

The following tasks can be scripted to reduce manual effort and catch omissions:

### Git Log Extraction

Script that pulls `git log --oneline` for the phase's commit range and generates a raw list of changes. Feed this into the phase note as a starting point for "What Changed."

```bash
# Example: extract commits for a phase
git log --oneline --since="2026-07-01" --until="2026-07-20" --grep="Phase 8B"
```

### New File Detection and Auto-Tagging

Script that compares the file tree before and after a phase. For every new `.ts`/`.tsx` file, suggest a tag based on directory path. For every new `src/modules/*` entry, flag that architecture notes are needed.

```bash
# Example: find new files in a phase
git diff --name-only --diff-filter=A main..phase-branch | grep -E '\.(ts|tsx)$'
```

### Broken Link Checker

Script that scans all markdown files for internal links (`[text](../path)` or `[[wikilinks]]`) and reports any that point to nonexistent files. Run as part of the quality gate.

```bash
# Example: find broken links (conceptual — requires a tool like markdown-link-check)
npx markdown-link-check brain/**/*.md
```

### Brain Health Dashboard Update

Script that counts notes per folder, notes per tag, links per note, and last-modified dates. Writes a summary to `00-Home/brain-health.md`. Run weekly or after every phase.

### MOC Freshness Check

Script that compares files in each MOC's domain against files that exist on disk. Reports any files that exist but aren't listed in any MOC.

### Open Question Staleness

Script that finds all open questions older than 30 days and flags them for review. Stale questions are worse than no questions — they create false confidence that someone is tracking them.

---

## Quality Gates

A phase is not "knowledge-complete" until all of the following are true. Check these before merging the phase or marking it done in project tracking.

| Gate | Verification | Owner |
|------|-------------|-------|
| All new modules have architecture notes | Every `src/modules/*` entry has a matching note in `03-Architecture/` | Engineer |
| All new decisions have ADRs | Every architectural choice that affects more than one module has an ADR | Engineer |
| All new security findings are documented | Every finding from the audit checklist is in `04-Security/` with severity and status | Security Lead |
| All lessons are captured | Phase note has non-empty "Lessons Learned" section | Engineer |
| Home Dashboard is updated | `00-Home/dashboard.md` reflects current phase count, module count, test count | Engineer |
| Evolution Timeline has an entry | `02-Product/evolution-timeline.md` has a dated entry for this phase | Engineer |
| No new broken links introduced | Broken link checker passes on full Brain | Automation / Engineer |
| Every new note has incoming links | No orphan notes — every new file is referenced by at least one existing file | Engineer |
| Open questions are current | No open question is older than 30 days without a status update | Tech Lead |
| Templates are followed | New notes use the correct template from `Templates/` | Engineer |

### Gate Enforcement

In practice, these gates are enforced through:

1. **PR Review** — The Brain update checklist is included in the PR description for every phase-completing PR
2. **Definition of Done** — "Brain updated" is a line item in the sprint definition of done
3. **Weekly Audit** — A 10-minute weekly review of the Brain Health Dashboard catches drift before it accumulates

---

## Related

- [[03-Architecture/ADRs/]] — Architecture Decision Records
- [[04-Security/]] — Security findings and threat models
- [[05-Engineering/index]] — Engineering knowledge home
- [[13-Engineering-Journal/]] — Engineering journal entries
- [[00-Home/dashboard]] — Brain home dashboard
- [[Templates/tpl-phase]] — Phase note template
