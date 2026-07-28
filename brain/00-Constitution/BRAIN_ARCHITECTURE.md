---
title: "Brain Architecture"
created: 2026-07-26
updated: 2026-07-26
tags:
  - type/architecture
  - domain/knowledge-management
  - status/active
owner: Product Team
authority: Constitution
---

# Brain Architecture

## 1. Overview

The Brain is Perionyx's institutional memory — a structured knowledge graph that captures everything we know about our product, customers, market, and engineering. It is not a documentation wiki. It is a living system that connects evidence to decisions to implementation.

Every phase, lesson, architectural decision, customer insight, and strategic choice lives here. The Brain ensures that knowledge accumulates across teams and time, rather than being lost between phases.

## 2. Design Principles

1. **Authority hierarchy**: Constitution > Strategy > Architecture > Platform > Domains > Implementation
2. **One home per concept**: No knowledge duplication
3. **Evidence before conclusions**: Every claim must trace to evidence
4. **Bidirectional linking**: Every page links to related pages, every related page links back
5. **Searchable by structure**: Folders + tags + graph traversal
6. **Human-readable**: Plain markdown, no special syntax beyond wikilinks and YAML frontmatter
7. **Maintenance is mandatory**: Stale content is worse than no content

## 3. Folder Architecture (20 Folders)

| Folder | Name | Purpose | Authority Level | Content Types | Entry Point |
|--------|------|---------|-----------------|---------------|-------------|
| 00-Constitution | Governing documents | Supreme | Laws, standards, guides, policies | `CONSTITUTION.md` |
| 01-Strategy | Vision/mission/positioning | Highest | Vision, mission, positioning, goals, OKRs | `VISION.md` |
| 02-Product | Product vision/features | High | Roadmaps, features, specs, personas, workflows | `PRODUCT_VISION.md` |
| 03-Customer Intelligence | People/companies/interviews/evidence | High | Interviews, pain points, hypotheses, evidence, signals | `CUSTOMER_MOC.md` |
| 04-Engineering | Engineering knowledge/patterns | Medium | Patterns, practices, tooling, standards | `ENGINEERING_MOC.md` |
| 05-Architecture | Architecture decisions/diagrams | High | Diagrams, ADRs, decision records | `ARCHITECTURE_MOC.md` |
| 06-Platform | Platform constitution/capabilities | High | Platform laws, capabilities, contracts | `PLATFORM_MOC.md` |
| 07-Domains | Domain-specific knowledge | Medium | Domain models, workflows, glossaries | `DOMAINS_MOC.md` |
| 08-Security | Security audit/compliance | High | Audit reports, compliance maps, threat models | `SECURITY_MOC.md` |
| 09-AI | AI platform/agents/automation | Medium | Provider configs, agent specs, automation patterns | `AI_MOC.md` |
| 10-Research | Market research/technology | Low | Research notes, technology evaluations, benchmarks | `RESEARCH_MOC.md` |
| 11-Decisions | ADRs/decision network | High | Decision records, decision network, rationale chains | `DECISION_NETWORK.md` |
| 12-Roadmaps | Evolution timeline/phases | Medium | Phase reports, timelines, milestones | `evolution-timeline.md` |
| 13-Operations | Deployment/monitoring/runbooks | Medium | Runbooks, deployment guides, monitoring configs | `OPERATIONS_MOC.md` |
| 14-Market Intelligence | Competitors/trends | Low | Competitor profiles, market trends, pricing analysis | `MARKET_MOC.md` |
| 15-People | Team/advisors/contacts | Low | Team profiles, advisors, contact records | `PEOPLE_MOC.md` |
| 16-Companies | Customers/partners/vendors | Low | Company profiles, partnership records, vendor evaluations | `COMPANIES_MOC.md` |
| 17-Lessons | Engineering/product lessons | Medium | Lessons learned, failure postmortems, success patterns | `LESSONS_MOC.md` |
| 18-Templates | Page templates | Standard | Page templates for all content types | `TEMPLATE_INDEX.md` |
| 19-Archive | Deprecated/historical | None | Superseded content, historical records | `ARCHIVE_MOC.md` |

## 4. Knowledge Graph Structure

### 4.1 Entry Points
Each folder has exactly one entry point (MOC — Map of Content) that links to all pages within the folder. The 20 entry points form the backbone of the knowledge graph.

### 4.2 Primary Clusters
Knowledge clusters group related folders into coherent knowledge domains:

| Cluster | Folders | Purpose |
|---------|---------|---------|
| Strategy-Product-Customer | 01-Strategy, 02-Product, 03-Customer Intelligence | Why we build what we build |
| Architecture-Platform-Security | 05-Architecture, 06-Platform, 08-Security | How we build it |
| Engineering-AI-Domains | 04-Engineering, 07-Domains, 09-AI | What we know and build |
| Decisions-Lessons-Roadmaps | 11-Decisions, 12-Roadmaps, 17-Lessons | What we decided and learned |
| Market-People-Companies | 14-Market Intelligence, 15-People, 16-Companies | Who we serve and compete with |

### 4.3 Cross-Cluster Links
Every page must link to at least 2 pages in different clusters. This ensures the knowledge graph is navigable across all domains.

### 4.4 Path Length Target
Average path length between any two pages: **< 4 hops**. Achieved through MOC entry points and strategic cross-cluster links.

## 5. Page Requirements

### 5.1 Frontmatter
Every page must include YAML frontmatter with:

```yaml
---
title: "Page Title"
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags:
  - type/* (architecture, decision, lesson, research, person, company, etc.)
  - domain/* (engineering, product, security, etc.)
  - status/* (active, draft, archived, superseded)
owner: Team or Individual
authority: Constitution | Strategy | Architecture | Platform | Domain | Implementation
---
```

### 5.2 Minimum Content
- **5 sections minimum** (including Overview)
- **3 outgoing links minimum** (wikilinks to other Brain pages)
- **Evidence section** for lessons and decisions
- **Open questions + next actions** section

### 5.3 Linking Rules
- Use wikilinks: `[[04-Engineering/page-name|Display Name]]`
- Bidirectional: if page A links to page B, page B must link back
- Cross-cluster: at least 2 links to pages in different clusters
- MOC pages link to all pages in their folder

## 6. Content Lifecycle

### 6.1 Creation
Use the appropriate template from `18-Templates/`. Every new page starts from a template to ensure consistency.

### 6.2 Validation
Before merging, every page must pass:
- Link check: all wikilinks resolve to existing pages
- Frontmatter check: all required fields present
- Tag check: at least one tag per hierarchy (type, domain, status)

### 6.3 Review
- **Quarterly review** per folder, managed by folder owner
- Stale pages (> 6 months without update) flagged with `status/stale` tag
- Stale pages reviewed and either refreshed or archived

### 6.4 Archival
- Move superseded content to `19-Archive/`
- Preserve all links and history
- Add `status/archived` tag
- Update any pages linking to archived content

### 6.5 Deletion
**Never delete.** Always archive. Knowledge is preserved even if it is no longer current.

## 7. Technology

- **Format**: Markdown (`.md`) with YAML frontmatter
- **Links**: Obsidian wikilinks `[[path/name|Display Name]]`
- **Tags**: YAML array with hierarchical naming (`type/*`, `domain/*`, `status/*`)
- **Graph**: Obsidian graph view for visualization
- **Search**: Full-text search across all `.md` files
- **Version Control**: Git (entire Brain is committed)
- **No external dependencies** — pure markdown

## 8. Migration from v1

The Brain was restructured from 16 folders (v1) to 20 folders (v2). Key changes:

| Change Type | Details |
|-------------|---------|
| Added | `00-Constitution`, `03-Customer Intelligence`, `06-Platform`, `09-AI`, `18-Templates`, `19-Archive` |
| Renamed | `11-ADR` → `11-Decisions`, `14-Competitive-Intelligence` → `14-Market Intelligence` |
| Merged | `13-Engineering-Journal` + `13-Knowledge` → `04-Engineering` |
| Archived | Old numbered folders, empty stubs, canvas files |
| Content Preserved | All 44 lessons, 22+ ADRs, evolution timeline, customer interviews |

### Migration Statistics
- **Before**: 129 files across 16 folders
- **After**: 193 files across 20 folders
- **Archived**: 9 empty stubs + 4 canvas/base files + 10 old folder indexes
- **Content loss**: Zero

---

*This document is the architectural blueprint for the Brain knowledge platform. All governance documents in `00-Constitution/` derive their authority from this architecture.*
