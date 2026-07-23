---
title: Perionyx Brain
created: 2026-07-20
updated: 2026-07-20
tags:
  - type/meta
  - status/active
---

# Perionyx Brain — The Thinking Behind the Code

> *Git stores the code. The Brain stores the thinking.*

---

## What Is This

A personal engineering and product knowledge system. Not documentation. Not a wiki. Not a copy of source code. The authoritative repository for the reasoning behind every important decision.

---

## Philosophy

- **Git stores the code. The Brain stores the thinking.**
- **One concept, one note.**
- **Links over duplication.**
- **Reasoning over implementation.**
- **Knowledge over documentation.**

---

## Structure

| Folder | Description |
|--------|-------------|
| `00-Home/` | Dashboard and navigation |
| `01-Vision-Strategy/` | Product vision, strategy, positioning |
| `02-Product/` | Product decisions, features, personas |
| `03-Architecture/` | System design, patterns, trade-offs |
| `04-Security/` | Threat models, security decisions, compliance |
| `05-Engineering/` | Practices, tooling, performance, reliability |
| `06-Experience-UX/` | Design principles, accessibility, motion |
| `07-Enterprise-Workflows/` | Finance workflows, approvals, automation |
| `08-AI-Workforce/` | Agent framework, AI decisions |
| `09-Customer-Discovery/` | Interviews, pain points, insights |
| `10-Research/` | Market research, technology evaluation |
| `11-ADR/` | Architecture Decision Records |
| `12-Roadmaps/` | Phase plans, milestones |
| `13-Engineering-Journal/` | Daily entries, lessons |
| `14-Competitive-Intelligence/` | Competitor analysis |
| `15-Pilot-Readiness/` | Deployment, onboarding |
| `16-References/` | External resources, learning |

Supporting folders: `Templates/`, `Assets/`, `Canvas/`, `Diagrams/`, `scripts/`

### Key Notes

| Note | Location | Purpose |
|------|----------|---------|
| [[open-questions]] | `00-Home/` | 32 unresolved questions across 6 domains |
| [[lessons-learned]] | `05-Engineering/` | 23 engineering lessons |
| [[evolution-timeline]] | `12-Roadmaps/` | Project history Phase 1-17 |
| [[decision-network]] | `11-ADR/` | 25+ decisions connected |
| [[founder-journal]] | `00-Home/` | Private reflection and strategy |
| [[brain-health]] | `00-Home/` | Knowledge system self-assessment |
| [[knowledge-lifecycle]] | `05-Engineering/` | How the Brain stays updated |
| [[engineering-checklists]] | `05-Engineering/` | Phase, architecture, security checklists |
| [[daily-workflow]] | `00-Home/` | Recommended daily workflow |

---

## Automation

The `scripts/brain.sh` CLI provides quick access to common tasks:

```bash
bash brain.sh new-phase 17.1 "Security Remediation"
bash brain.sh new-adr 25 "CSRF Conditional Enforcement"
bash brain.sh new-journal
bash brain.sh new-interview "Jane Doe"
bash brain.sh new-research "AI Provider Comparison"
bash brain.sh new-security-finding "CSRF Origin Bypass"
bash brain.sh new-meeting
bash brain.sh new-experiment "Redis vs In-Memory"
bash brain.sh validate-links
bash brain.sh health
```

See [[daily-workflow]] for the recommended daily routine.
See [[engineering-checklists]] for phase completion and change checklists.

---

## Conventions

- **Files**: `kebab-case.md` — e.g., `approval-engine.md`
- **Folders**: `kebab-case` with numeric prefix — e.g., `01-Vision-Strategy`
- **Templates**: Prefixed with `tpl-` — e.g., `tpl-adr.md`
- **Tags**: `#domain/architecture`, `#type/decision`, `#status/active`
- **Links**: `[[wikilinks]]` for all internal references
- **Metadata**: Every note requires YAML frontmatter (title, created, updated, tags)

See `BRAIN_CONSTITUTION.md` for the full governing document.

---

## What Belongs Here

**YES** — Core Knowledge:

- **WHY** decisions were made
- **HOW** systems are designed (reasoning, not code)
- **LESSONS** learned from failures and successes
- **RESEARCH** findings and evaluations
- **ARCHITECTURE** patterns and trade-offs
- **DECISIONS** and their rationale
- **WORKFLOWS** and their logic
- **THINKING** — drafts, hypotheses, evolving ideas

---

## What Never Belongs

**NEVER** — Source Code and Implementation:

- Source code files (`.ts`, `.tsx`, `.js`, `.jsx`)
- React components
- Prisma models or schemas
- API route implementations
- Generated files
- Copies of files that exist in the source repo
- Temporary notes or unstructured dumps

---

**Version**: 1.0
**Created**: 2026-07-20
