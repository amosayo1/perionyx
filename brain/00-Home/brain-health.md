---
title: "Brain Health Dashboard"
created: 2026-07-20
updated: 2026-07-20
tags:
  - type/dashboard
  - status/active
---

# Brain Health Dashboard

## Current Status

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Total Notes | 73 | Growing | On Track |
| MOCs | 17 | 17 | Complete |
| Templates | 14 | 14 | Complete |
| Canvas Boards | 6 | 6 | Complete |
| Mermaid Diagrams | 10 | 10 | Complete |
| Lesson Notes | 23 | 23 | Complete |
| Content Notes | 23 | 100+ | Growing |
| Orphan Notes | ~46 | <10 | Needs Attention |
| Forward References | ~900 | Decreasing | Expected |
| Actual Broken Links | 14 | 0 | Cross-references to docs/ |
| Frontmatter Compliance | 90% | 100% | Close |

## Health Indicators

### Strong

- **Directory structure**: 17 well-organized folders covering every knowledge domain
- **MOC coverage**: Every knowledge area has a dedicated Map of Content index
- **Templates**: 14 reusable templates for all note types (ADR, concept, guide, reference, etc.)
- **Canvas boards**: 6 visual maps of key domains (architecture, security, AI, operations, compliance, platform)
- **Mermaid diagrams**: 10 architecture and workflow diagrams embedded across notes
- **Naming consistency**: 100% kebab-case filenames, no spaces, no special characters
- **Brain Constitution**: Comprehensive governing document defining purpose, principles, and maintenance

### Needs Attention

- **Forward references**: ~332 links to leaf notes that don't yet exist — expected in a growing vault, not a defect
- **Orphan notes**: Most notes have zero incoming links; the knowledge graph is a collection of isolated nodes
- **Frontmatter**: Some root files missing frontmatter; templates use `date` instead of `created` field
- **Diagram integration**: Standalone diagram files not yet embedded in the notes that reference them

### Critical

- **14 actual broken links** in `founder-journal.md` — cross-references to `docs/` paths outside the brain vault. Fix by converting to relative paths or removing. All other unresolved wikilinks (~900) are intentional forward references to notes that will be created as knowledge is captured.

## Knowledge Growth Plan

Phase KB-2 creates the lifecycle infrastructure: templates, workflows, naming conventions, and the maintenance schedule. After KB-2, the vault enters its growth phase:

### Growth Sources

1. **Each completed phase** produces 5-10 new notes (decisions, learnings, architecture records)
2. **Each customer interview** produces 1-2 notes (insights, pain points, requirements)
3. **Each security finding** produces 1 note (analysis, remediation, lesson learned)
4. **Each architectural decision** produces 1 ADR (context, decision, consequences)
5. **Each sprint retrospective** produces 1 note (what worked, what didn't, what to change)

### Projected Growth

| Timeframe | Projected Notes | Milestone |
|-----------|----------------|-----------|
| Month 1 (now) | 50 | Scaffolding complete, lifecycle defined |
| Month 3 | 150 | First 100 leaf notes, broken links dropping |
| Month 6 | 400 | Knowledge graph connected, orphans eliminated |
| Year 1 | 1000+ | Self-sustaining knowledge system |

### Growth Rules

- **No orphan notes**: Every new note must link to at least 2 existing notes
- **No broken links**: If a note references another note, that target must exist or be created in the same session
- **MOC updates**: When 5+ notes accumulate in a category, update the MOC
- **ADR mandatory**: Every significant technical decision gets an ADR before implementation begins
- **Templates always**: Every new note starts from the appropriate template

## Maintenance Schedule

| Task | Frequency | Last Done | Next Due |
|------|-----------|-----------|----------|
| Fix broken links | Weekly | — | 2026-07-27 |
| Review unlinked mentions | Weekly | — | 2026-07-27 |
| Update MOCs | Monthly | — | 2026-08-01 |
| Archive stale notes | Monthly | — | 2026-08-01 |
| Review Brain Constitution | Quarterly | 2026-07-20 | 2026-10-20 |
| Update Home Dashboard | After each phase | — | — |
| Review Canvas boards | Quarterly | — | 2026-10-20 |
| Frontmatter compliance sweep | Weekly | — | 2026-07-27 |
| Orphan note review | Weekly | — | 2026-07-27 |

## Quality Checklist

Every note must pass this checklist before being considered "complete":

- [ ] Has YAML frontmatter with all required fields
- [ ] Has at least 3 outgoing wikilinks to other notes
- [ ] Has at least 2 incoming wikilinks from other notes
- [ ] Contains reasoning and analysis, not just raw facts
- [ ] Is written in clear, searchable language
- [ ] Is connected to the knowledge graph (reachable from at least one MOC)
- [ ] Uses the correct template for its type
- [ ] Has no broken wikilinks

## Quick Actions

### If you're about to create a note:

1. Check if a note on this topic already exists
2. Use `grep -r "topic"` across the vault
3. Pick the right template from `brain/08-Templates/`
4. Follow the naming convention: `kebab-case.md`
5. Place it in the correct directory based on the [[brain/00-Home/index|MOC index]]

### If you notice a broken link:

1. Either create the missing target note, or
2. Update the link to point to an existing note
3. Never leave broken links unaddressed

### If a MOC is stale:

1. List all notes in the category
2. Update the MOC table with new entries
3. Mark removed entries as archived
4. Update the `Last Updated` field in the MOC frontmatter

## Status Summary

The vault is structurally complete and operationally ready. The scaffolding phase (KB-1) built the skeleton. The lifecycle phase (KB-2) built the processes. Now the vault needs content — real knowledge from real work.

The broken links and orphan notes are not failures. They are placeholders — promises of knowledge to come. Every broken link is a note that will be written. Every orphan note is a connection that will be made.

**Next step**: Begin KB-3 — Knowledge Capture. Start converting completed phases, security findings, and architectural decisions into structured notes.
