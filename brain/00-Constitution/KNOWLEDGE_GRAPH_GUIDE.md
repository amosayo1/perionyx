---
title: "Knowledge Graph Guide"
created: 2026-07-26
updated: 2026-07-26
tags:
  - type/guide
  - domain/meta
  - status/active
owner: Platform Team
authority: Constitution
---

# Knowledge Graph Guide

How every page in the Brain declares and maintains its relationships.

**Reference**: [[00-Constitution/KNOWLEDGE_CONSTITUTION|Knowledge Constitution]]

---

## Purpose

The Knowledge Graph is the connective tissue of the Brain. It makes knowledge discoverable from multiple paths and reveals how concepts relate to each other.

Every page is a node. Every link is an edge. The graph is the Brain's nervous system.

---

## Relationship Types

Every page declares relationships in its frontmatter and Relationships section:

### Structural Relationships

| Type | Description | Example |
|------|-------------|---------|
| Parent | The section this page belongs to | `[[04-Engineering/index]]` |
| Child | Sub-topics within this page | `[[04-Engineering/Lessons/45-lesson]]` |

### Knowledge Relationships

| Type | Description | Example |
|------|-------------|---------|
| Related | Parallel or adjacent concepts | `[[05-Architecture/platform-design]]` |
| Decision | ADR that decided something about this | `[[11-Decisions/adr-021-runtime]]` |
| Lesson | Lesson learned from this area | `[[17-Lessons/44-context-propagation]]` |
| Evidence | Customer/market evidence supporting this | `[[03-Customer Intelligence/Validated Evidence/...]]` |
| Architecture | Architecture page this connects to | `[[05-Architecture/runtime-architecture]]` |
| Implementation | Code files that implement this | `src/runtime/context/runtime-context.ts` |

### Cross-Domain Relationships

| Type | Description | Example |
|------|-------------|---------|
| Customer | People/companies related to this | `[[03-Customer Intelligence/People/ahmed-shatla]]` |
| Product | Product areas affected by this | `[[02-Product/features]]` |
| Research | Research that informed this | `[[10-Research/research-name]]` |
| Strategy | Strategic goals this serves | `[[01-Strategy/strategy-name]]` |

---

## Graph Structure

### Entry Points

The graph has 20 entry points — one per top-level folder. Each entry point is the `index.md` file.

### Clusters

Knowledge naturally clusters around:

1. **Customer Intelligence** — people, companies, interviews, evidence, pain points
2. **Engineering Intelligence** — lessons, knowledge patterns, journal entries
3. **Architecture Intelligence** — decisions, diagrams, platform design
4. **Product Intelligence** — features, hypotheses, validated evidence
5. **Strategic Intelligence** — vision, positioning, market thesis

### Cross-Cluster Links

The most valuable links are cross-cluster:
- Customer pain point → Engineering lesson → Architecture decision → Implementation
- Market research → Product hypothesis → Validated evidence → Feature decision
- Security finding → Architecture decision → Implementation → Lesson

---

## Generating the Graph

### Manual Graph Declaration

Every page declares its relationships in the Relationships section:

```markdown
## Relationships

| Type | Page | Description |
|------|------|-------------|
| Parent | [[04-Engineering/index]] | Engineering knowledge |
| Decision | [[11-Decisions/adr-021]] | Runtime platform decision |
| Lesson | [[17-Lessons/44]] | Context propagation lesson |
| Implementation | src/runtime/context/ | AsyncLocalStorage implementation |
```

### Graph-Friendly Frontmatter

```yaml
related:
  - "[[04-Engineering/index|Engineering]]"
  - "[[11-Decisions/adr-021|ADR-021]]"
  - "[[17-Lessons/44|Lesson 44]]"
graph:
  parent: 04-Engineering
  cluster: engineering
  priority: high
```

---

## Graph Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| Connectivity | >80% of pages have 3+ links | Pages are well-connected |
| Cross-cluster links | >30% of links cross clusters | Knowledge is interdisciplinary |
| Orphan rate | <5% of pages have 0 incoming links | No isolated knowledge |
| Hub score | Top 10 pages have 20+ incoming links | Clear knowledge centers |
| Path length | Average <4 hops between any two pages | Knowledge is reachable |

---

## Visualizations

### Obsidian Graph View

The Brain is designed for Obsidian's graph view. Configure:
- Show orphan pages (red)
- Show unresolved links (yellow)
- Collapse unlinked nodes
- Color by folder (top-level group)

### Mermaid Diagrams

Key relationships are also documented as Mermaid diagrams in `05-Architecture/Diagrams/`:
- `knowledge-graph.md` — full Brain relationship map
- `customer-intelligence-graph.md` — customer knowledge graph
- `engineering-intelligence-graph.md` — engineering knowledge graph

---

## Maintenance

### Weekly
- Check for orphan pages (0 incoming links)
- Check for broken wikilinks
- Verify new pages have Relationships section

### Monthly
- Review cross-cluster link density
- Identify knowledge clusters that need more connections
- Update graph visualizations

### Quarterly
- Full graph health report
- Identify hub pages and ensure they're current
- Prune dead links from archived content

---

*Last updated: 2026-07-26 (Phase 25.0)*
