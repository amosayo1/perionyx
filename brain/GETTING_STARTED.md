---
title: Getting Started
created: 2026-07-20
updated: 2026-07-20
tags:
  - type/guide
  - status/active
---

# Getting Started with Perionyx Brain

> Your second brain for Perionyx.

---

## Welcome

This vault is the authoritative repository for the reasoning behind every important decision in Perionyx. It's not documentation — it's the thinking. Open it in Obsidian and start exploring.

---

## Quick Start

1. Open the vault in Obsidian
2. Start at `00-Home/index.md` — the dashboard
3. Use Quick Navigation to jump to any area
4. Use Obsidian's search (Cmd/Ctrl+O) for quick lookup

---

## Navigation

| Method | How |
|--------|-----|
| **Home Dashboard** | Entry point — `00-Home/index.md` |
| **MOCs** | Index pages for each knowledge area |
| **Wikilinks** | `[[Note Name]]` to connect notes |
| **Tags** | `#domain/architecture` for categorization |
| **Search** | Cmd/Ctrl+O for quick search, Cmd/Ctrl+Shift+F for full-text |

---

## Creating Notes

1. Use a template from `Templates/`
2. Fill in YAML frontmatter
3. Write the content (reasoning, not code)
4. Add wikilinks to related notes
5. Add tags for categorization
6. Update the relevant MOC

---

## Linking

- Every note should link to at least 3 other notes
- Every note should be linked from at least 2 other notes
- Use `[[wikilinks]]` for all internal links
- Use `[[Note|alias]]` when link text differs from note title

---

## Templates

| Template | Purpose |
|----------|---------|
| `tpl-adr.md` | Architecture Decision Record |
| `tpl-book-notes.md` | Book notes and learning summaries |
| `tpl-competitive.md` | Competitor analysis |
| `tpl-experiment.md` | Experiment results and observations |
| `tpl-idea.md` | Draft ideas and hypotheses |
| `tpl-interview.md` | Customer interview notes |
| `tpl-journal.md` | Daily engineering journal entry |
| `tpl-meeting.md` | Meeting notes and takeaways |
| `tpl-postmortem.md` | Incident postmortem |
| `tpl-product-discovery.md` | Product discovery and validation |
| `tpl-research.md` | Research findings and evaluations |
| `tpl-security-finding.md` | Security finding or vulnerability |
| `tpl-threat-model.md` | Threat model analysis |
| `tpl-workflow.md` | Workflow design and logic |

---

## Canvas Boards

| Board | Visualizes |
|-------|------------|
| `architecture-overview.canvas` | System architecture relationships |
| `product-evolution.canvas` | Product feature evolution over time |

Additional boards can be created for AI workforce relationships, security landscapes, roadmap visualization, and customer discovery mapping.

---

## Mermaid Diagrams

Diagrams are stored in `Diagrams/` and can be embedded in any note using Obsidian's standard embed syntax. Diagram types include architecture diagrams, workflow diagrams, relationship diagrams, decision trees, state diagrams, sequence diagrams, and mind maps.

---

## Best Practices

1. **Write reasoning, not implementation** — explain the *why*, not the *what*
2. **One concept, one note** — no duplicates, link instead
3. **Link liberally** — every note connects to at least 3 others
4. **Tag consistently** — use `#domain/`, `#type/`, `#status/` prefixes
5. **Update the Home Dashboard regularly** — keep it current
6. **Never rewrite history** — preserve original reasoning even if decisions change
7. **Archive, don't delete** — move to `_archive/` with `status: archived`

---

## Maintenance

| Cadence | Action |
|---------|--------|
| **Weekly** | Fix broken links, review unlinked mentions |
| **Monthly** | Update MOCs, archive stale notes |
| **Quarterly** | Review constitution, update dashboard |

---

**Version**: 1.0
**Created**: 2026-07-20
