---
title: "Page Standards"
created: 2026-07-26
updated: 2026-07-26
tags:
  - type/standard
  - domain/meta
  - status/active
owner: Platform Team
authority: Constitution
---

# Page Standards

The mandatory template and requirements for every page in the Perionyx Brain.

**Reference**: [[00-Constitution/KNOWLEDGE_CONSTITUTION|Knowledge Constitution]]

---

## Required Frontmatter

Every page MUST begin with YAML frontmatter:

```yaml
---
title: "Page Title"
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags:
  - type/<type>
  - domain/<domain>
  - status/<status>
owner: <Team or Person>
authority: <Constitution | Strategy | Architecture | Platform | Domain>
status: <Draft | Active | Deprecated | Archived>
aliases:
  - Alternative Name
related:
  - "[[folder/file|Display Name]]"
---
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| title | Yes | Clear, descriptive title |
| created | Yes | ISO date of creation |
| updated | Yes | ISO date of last significant update |
| tags | Yes | 3-5 tags from the taxonomy |
| owner | Yes | Team or person responsible |
| authority | Yes | Authority tier this page operates at |
| status | Yes | Draft, Active, Deprecated, or Archived |
| aliases | No | Alternative names for search |
| related | No | Direct relationship links |

---

## Required Sections

Every page MUST contain these sections (in order):

### 1. Title & Metadata

```markdown
# Page Title

**Status**: Active
**Owner**: Platform Team
**Created**: 2026-07-26
**Updated**: 2026-07-26
**Authority**: [[00-Constitution/KNOWLEDGE_CONSTITUTION|Knowledge Constitution]]
```

### 2. Purpose

One paragraph answering: "Why does this page exist?"

```markdown
## Purpose

This page exists because...
```

### 3. Summary

2-3 sentence overview of the key knowledge on this page.

```markdown
## Summary

[Key knowledge in 2-3 sentences]
```

### 4. Body

The actual knowledge. Structure with clear headers. Use evidence, data, and examples.

### 5. Evidence

Supporting data that validates the claims on this page.

```markdown
## Evidence

- [Interview]: Person, Date, Quote
- [Implementation]: Phase X, File Y, Commit Z
- [Research]: Source, Date, Finding
- [Data]: Metric, Value, Period
```

### 6. Relationships

Explicit connections to other Brain pages.

```markdown
## Relationships

| Type | Page | Description |
|------|------|-------------|
| Parent | [[folder/index]] | Section this belongs to |
| Child | [[folder/child]] | Sub-topic |
| Related | [[folder/related]] | Parallel concept |
| Decision | [[11-Decisions/adr-xxx]] | ADR that decided this |
| Lesson | [[17-Lessons/xx-lesson]] | Lesson learned from this |
| Evidence | [[03-Customer Intelligence/Validated Evidence/evidence-xxx]] | Supporting evidence |
```

### 7. Cross-Links

Links organized by knowledge type.

```markdown
## Cross-Links

- **Decisions**: [[11-Decisions/decision-network|Decision Network]]
- **Lessons**: [[17-Lessons/lesson-xx|Lesson XX]]
- **Architecture**: [[05-Architecture/architecture-name]]
- **Customers**: [[03-Customer Intelligence/People/person-name]]
- **Implementation**: `src/path/to/file.ts:line`
```

### 8. Open Questions

What remains unresolved or needs further investigation.

```markdown
## Open Questions

- [ ] Question 1
- [ ] Question 2
```

### 9. Next Actions

What should happen next based on this knowledge.

```markdown
## Next Actions

- [ ] Action 1
- [ ] Action 2
```

---

## Page Types

Different page types have additional required sections:

### Lesson (`type/lesson`)

Additional required sections:
- **Lesson**: The single sentence that captures the learning
- **Context**: When and why this was discovered
- **When It Applies**: Specific situations where this lesson is relevant
- **Source**: Phase, commit, or event that produced this lesson

### Decision (`type/decision`)

Additional required sections:
- **Decision**: What was decided
- **Context**: The situation that required a decision
- **Alternatives Considered**: What options were evaluated
- **Consequences**: What this decision enables and forecloses
- **Status**: Proposed, Accepted, Deprecated, Superseded

### Interview (`type/interview`)

Additional required sections:
- **Person**: Name, role, company, industry
- **Date**: When the interview occurred
- **Key Quotes**: Direct quotes from the conversation
- **Pain Points**: Problems identified
- **Insights**: What we learned
- **Follow-Up**: Questions for next conversation

### Evidence (`type/evidence`)

Additional required sections:
- **Claim**: What we believe to be true
- **Supporting Sources**: Who/what supports this
- **Contradicting Sources**: Who/what challenges this
- **Confidence**: High, Medium, Low
- **Frequency**: How often this has been observed

### Architecture (`type/architecture`)

Additional required sections:
- **Context**: The architectural context
- **Decision**: What was decided
- **Consequences**: Positive and negative outcomes
- **Compliance**: Which constitutional laws this satisfies

---

## Quality Requirements

### Minimum Content

| Page Type | Minimum Lines | Minimum Outgoing Links |
|-----------|---------------|----------------------|
| Index/MOC | 50 | 5 |
| Lesson | 20 | 3 |
| Decision/ADR | 40 | 4 |
| Interview | 30 | 3 |
| Evidence | 15 | 3 |
| Profile (Person/Company) | 25 | 3 |
| Reference | 20 | 2 |

### Forbidden Patterns

1. **Empty pages** — Every page must have >10 lines of content
2. **Orphan pages** — Every page must be linked to by at least 1 other page
3. **Duplicate content** — No two pages define the same concept
4. **Broken links** — All wikilinks must resolve to existing pages
5. **Missing frontmatter** — Every page must have complete YAML frontmatter
6. **Missing owner** — Every page must declare an owner
7. **Missing status** — Every page must have a status field

### Naming Conventions

| Content Type | Naming Pattern | Example |
|-------------|---------------|---------|
| Index | `index.md` | `00-Constitution/index.md` |
| Lesson | `NN-kebab-case.md` | `17-Lessons/45-lesson-name.md` |
| Decision | `adr-NNN-kebab-case.md` | `11-Decisions/adr-021-runtime-platform.md` |
| Interview | `interview-kebab-name.md` | `03-Customer Intelligence/Interviews/interview-ahmed-shatla.md` |
| Evidence | `evidence-kebab-description.md` | `03-Customer Intelligence/Validated Evidence/evidence-fragmented-workflows.md` |
| Profile | `kebab-name.md` | `15-People/ahmed-shatla.md` |
| Diagram | `kebab-name.md` | `05-Architecture/Diagrams/platform-overview.md` |

---

## Review Checklist

Before merging any new page:

- [ ] Frontmatter complete (title, created, updated, tags, owner, status, authority)
- [ ] Purpose section present
- [ ] Summary section present
- [ ] Body has >10 lines of content
- [ ] Evidence section present (even if "None yet — Hypothesis status")
- [ ] Relationships section with at least 1 link
- [ ] At least 3 outgoing links
- [ ] No duplicate content with existing pages
- [ ] Tags follow taxonomy (3-5 tags)
- [ ] Owner declared
- [ ] Status declared
- [ ] Naming convention followed

---

*Last updated: 2026-07-26 (Phase 25.0)*
