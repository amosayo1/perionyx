---
title: Brain Constitution
created: 2026-07-20
updated: 2026-07-21
tags:
  - type/constitution
  - domain/meta
  - status/active
aliases:
  - Constitution
  - Knowledge Constitution
---

# Brain Constitution

> The governing document for the Perionyx Knowledge Operating System.

---

## Purpose

This vault is the authoritative repository for the **thinking behind Perionyx**.

Git stores the code.
This vault stores the reasoning.

Every important decision, architectural trade-off, customer insight, security consideration, and engineering lesson lives here — connected, searchable, and alive.

---

## Authority

This constitution is the supreme governing document for the knowledge system. All notes, templates, and linking decisions must comply with it.

When this constitution conflicts with convenience, **this constitution wins**.

---

## Guiding Principles

### 1. One Concept, One Note

Every concept has exactly one canonical home. Other notes **link** to it — they do not duplicate it.

- There is one note for `Controller`
- There is one note for `Approval Engine`
- There is one note for `Month-End Close`
- Other notes reference these via `[[wikilinks]]`

### 2. Reasoning Over Implementation

This vault stores **why**, not **what**. The source code is the implementation. This vault is the thinking.

- ✅ "Why we chose hybrid fail-open for session validation"
- ✅ "Trade-offs between Prisma middleware and service-level filtering"
- ❌ The actual code for session validation
- ❌ A copy of the CRM service

### 3. Links Over Duplication

If information appears in two places, one must link to the other. Never maintain two copies of the same knowledge.

Duplication is the enemy of a knowledge system. Every duplicate is a place where information can diverge.

### 4. Knowledge Over Documentation

This is not documentation. Documentation describes what exists. Knowledge explains why it exists, what trade-offs were made, and what was learned.

### 5. Search First, Structure Second

The vault is optimized for **retrieval**, not hierarchy. Use links, tags, and search — not deep folder nesting.

Six months from now, searching "Approval" should surface everything related to approvals across all domains.

### 6. Bidirectional by Default

Every note should both **link to** and **be linked from** other notes. Isolated notes are dead notes.

When you create a note, ask: "What other notes should link to this?" and "What notes should this link to?"

### 7. Evolution, Not Revolution

Never rewrite history. Preserve the reasoning behind decisions, even when those decisions are later reversed. The journey matters more than the destination.

### 8. Implementation Evidence Is Authoritative

Implementation evidence always overrides architectural assumptions. An architectural report is a hypothesis until implementation confirms it. Never delete code, remove services, or change system behavior solely because an earlier report declared it safe. Search the repository again. Verify consumers. Validate imports. Confirm runtime usage. Only then proceed. This principle was earned when a "zero consumer" finding turned out to have nine active page consumers — discovered only because validation was repeated at implementation time.

### 9. Workflow Success Defines Product Success

Perionyx is evaluated by the success of complete enterprise workflows — not by the completeness of individual modules. Modules exist only to enable workflows. A module is successful only when it measurably improves the end-to-end work of finance professionals.

**Rationale**: Phase 20.0 demonstrated that the platform contains strong individual modules, but strong modules alone do not produce an excellent enterprise product. Customers do not purchase modules. They purchase outcomes — closing the month, approving payments, managing cash, preparing for audit, investigating exceptions, producing executive briefings. The quality of these workflows — not the number of completed modules — determines the value of Perionyx.

**Engineering implications**: Future roadmap decisions must answer: Which workflow improves? Which persona benefits? What friction is removed? How is trust increased? How is auditability improved? If a feature cannot clearly improve a workflow, its priority should be reconsidered.

**Product implications**: Feature prioritization becomes workflow-first, persona-first, evidence-first. Modules are implementation boundaries — not measures of customer value.

**Quality requirement**: Any proposed feature must explicitly identify: workflow(s) improved, persona(s) benefited, friction removed, trust gained, and evidence supporting the priority. If those cannot be identified, the feature should not receive high priority.

---

## Organization Rules

### Folder Structure

```
brain/
├── 00-Home/              # Dashboard, navigation
├── 01-Vision-Strategy/   # Product vision, strategy, positioning
├── 02-Product/           # Product decisions, features, roadmap
├── 03-Architecture/      # System design, patterns, trade-offs
├── 04-Security/          # Threat models, security decisions, compliance
├── 05-Engineering/       # Practices, tooling, performance, reliability
├── 06-Experience-UX/     # Design principles, user experience, accessibility
├── 07-Enterprise-Workflows/ # Finance workflows, approval chains, automation
├── 08-AI-Workforce/      # Agent framework, AI decisions, autonomous finance
├── 09-Customer-Discovery/ # Interviews, personas, pain points, insights
├── 10-Research/          # Market research, technology evaluation, benchmarks
├── 11-ADR/               # Architecture Decision Records
├── 12-Roadmaps/          # Phase plans, milestones, timelines
├── 13-Engineering-Journal/ # Daily entries, lessons, observations
├── 14-Competitive-Intelligence/ # Competitor analysis, market landscape
├── 15-Pilot-Readiness/   # Deployment, onboarding, pilot criteria
├── 16-References/        # External resources, book notes, links
├── Templates/            # Reusable note templates
├── Assets/               # Images, exports, non-Mermaid diagrams
├── Canvas/               # Obsidian Canvas boards
└── Diagrams/             # Mermaid source files
```

### Naming Convention

- **Files**: `kebab-case.md` — `approval-engine.md`, `csrf-remediation.md`
- **Folders**: `kebab-case` with numeric prefix — `01-Vision-Strategy`
- **Templates**: Prefixed with `tpl-` — `tpl-adr.md`, `tpl-journal.md`
- **Canvas**: `.canvas` extension — `architecture-overview.canvas`
- **Diagrams**: `.md` extension in `Diagrams/` folder

---

## Linking Philosophy

### Wikilinks

Use Obsidian's `[[wikilink]]` syntax for all internal links:

```markdown
The [[Approval Engine]] connects to the [[Workflow Engine]] through the
[[ApprovalStepExecutor]]. This was a key decision in [[ADR-004]].
```

### Link Types

| Type | Syntax | When to Use |
|------|--------|-------------|
| **Direct** | `[[Note Name]]` | Standard linking |
| **Aliased** | `[[Note Name\|display text]]` | When the link text differs from the note title |
| **Heading** | `[[Note Name#Section]]` | Linking to a specific section |
| **Block** | `[[Note Name^block-id]]` | Linking to a specific block |

### Link Density

Every note should have **at least 3 outgoing links** and **at least 2 incoming links** (backlinks). If a note has fewer, it may need to be merged, expanded, or better connected.

---

## Tagging Philosophy

Tags are **search accelerators**, not categories. A note can have multiple tags.

### Tag Format

```
#domain/architecture
#domain/security
#domain/product
#type/decision
#type/lesson
#type/interview
#type/research
#status/active
#status/archived
#status/draft
#priority/critical
#priority/high
```

### When to Tag

- Tag the **domain** (architecture, security, product, etc.)
- Tag the **type** (decision, lesson, interview, research)
- Tag the **status** (active, archived, draft)
- Tag the **priority** if relevant (critical, high, medium, low)

### When NOT to Tag

- Don't tag with note names (use links instead)
- Don't over-tag (3-5 tags per note maximum)
- Don't create one-off tags (every tag must be reusable)

---

## Metadata Standards

Every note must have YAML frontmatter:

```yaml
---
title: Note Title
created: 2026-07-20
updated: 2026-07-20
tags:
  - domain/architecture
  - type/decision
  - status/active
aliases:
  - Alternative Name
related:
  - "[[Related Note 1]]"
  - "[[Related Note 2]]"
phase: Phase 17.1
status: active
---
```

### Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| `title` | Human-readable title | `CSRF Remediation` |
| `created` | ISO date created | `2026-07-20` |
| `updated` | ISO date last updated | `2026-07-20` |
| `tags` | Array of tags | `["domain/security", "type/decision"]` |

### Optional Fields

| Field | Description | Example |
|-------|-------------|---------|
| `aliases` | Alternative names | `["Cross-Site Request Forgery"]` |
| `related` | Related notes | `["[[Proxy]]", "[[CSRF]]"]` |
| `phase` | Phase when created | `Phase 17.1` |
| `status` | active/draft/archived | `active` |
| `decision` | ADR reference | `ADR-001` |
| `author` | Author | `Horus` |
| `date` | Date of event | `2026-07-20` |

---

## Knowledge Lifecycle

### The Lifecycle Workflow

Every completed development phase must produce Brain updates. The engineer follows a repeatable checklist:

1. **Phase Summary** — What was built, what changed
2. **Architecture Changes** — New patterns, trade-offs
3. **Security Changes** — Findings, remediations, threat models
4. **Workflow Changes** — New workflows, approval chains
5. **Experience Changes** — Components, design decisions
6. **Lessons Learned** — What worked, what didn't
7. **Open Questions** — Unresolved issues
8. **Future Improvements** — What comes next
9. **ADRs** — New and updated decisions
10. **Research** — New findings, evaluations
11. **Customer Discovery** — New interviews, insights
12. **Evolution Timeline** — New entry
13. **Home Dashboard** — Refresh status
14. **Knowledge Graph** — New links, new notes, MOC updates

See [[knowledge-lifecycle]] for the full guide.

### Phase Completion

A phase is "knowledge-complete" when:
- All new modules have architecture notes
- All new decisions have ADRs
- All new security findings are documented
- All lessons are captured
- Home Dashboard is updated
- Evolution Timeline has an entry
- No new broken links introduced

### Open Questions

Unresolved questions are tracked in [[open-questions]]. Every question must have:
- Context
- Current thinking
- Possible options
- Priority
- Status

### Lessons Library

Engineering lessons are captured in [[lessons-learned]]. Each lesson must have:
- The lesson (one paragraph)
- When it applies
- Related notes

### Evolution Timeline

The chronological history of the project is in [[evolution-timeline]]. Never rewrite history. Preserve the reasoning behind decisions.

### Decision Network

Architecture decisions and their relationships are mapped in [[decision-network]]. Every ADR must connect to:
- Parent decisions
- Child decisions
- Related constitutions
- Related modules

---

## What Belongs

### YES — Core Knowledge

- **WHY** decisions were made
- **HOW** systems are designed (reasoning, not code)
- **LESSONS** learned from failures and successes
- **RESEARCH** findings and evaluations
- **ARCHITECTURE** patterns and trade-offs
- **DECISIONS** and their rationale
- **WORKFLOWS** and their logic
- **THINKING** — drafts, hypotheses, evolving ideas
- **SECURITY** reasoning and threat models
- **PRODUCT** vision, strategy, positioning
- **CUSTOMER** insights, pain points, quotes
- **ENGINEERING** practices, performance, reliability
- **EXPERIENCE** design principles and user research
- **COMPETITIVE** landscape and analysis
- **ROADMAPS** and phase plans
- **LIFECYCLE** — Phase completion checklists, knowledge updates

### YES — Reference Material

- **Architecture Decision Records** (ADRs)
- **Meeting notes** and key takeaways
- **Book notes** and learning summaries
- **Research papers** and evaluations
- **Threat models** and security analyses
- **Postmortems** and incident reports
- **Experiment** results and observations

---

## What Never Belongs

### NEVER — Source Code and Implementation

- ❌ Source code files (.ts, .tsx, .js, .jsx)
- ❌ React components
- ❌ Prisma models or schemas
- ❌ API route implementations
- ❌ Generated files
- ❌ Package lock files
- ❌ Compiled assets
- ❌ Node modules

### NEVER — Duplicate Content

- ❌ Copies of files that exist in the source repo
- ❌ Paste of TypeScript interfaces
- ❌ Screenshots of code
- ❌ Auto-generated documentation from code comments

### NEVER — Ephemeral Content

- ❌ Temporary notes
- ❌ Scratchpad content
- ❌ Unstructured dumps

---

## Evolution Rules

### Adding Knowledge

1. Check if a canonical note already exists for the concept
2. If yes, add to that note or link to it
3. If no, create a new note with proper metadata and tags
4. Link the new note to at least 3 existing notes
5. Update the relevant MOC

### Archiving Knowledge

1. Never delete notes — archive them
2. Move to a `_archive/` subfolder if needed
3. Add `status: archived` to frontmatter
4. Keep all links intact

### Updating Knowledge

1. Update the `updated` field in frontmatter
2. Preserve the original reasoning
3. Add a "Changed" section explaining what was updated and why
4. Link to any ADRs that drove the change

---

## Maintenance Rules

### Weekly

- Review unlinked notes (use Obsidian's "Unlinked Mentions")
- Fix broken links
- Update frontmatter dates

### Monthly

- Review MOCs for completeness
- Archive stale notes
- Update the Home Dashboard
- Review tag consistency

### Quarterly

- Review the Brain Constitution
- Update the Getting Started guide
- Review Canvas boards for relevance
- Prune dead links and orphaned notes

---

## Quality Standards

### Every Note Must

1. Have complete YAML frontmatter
2. Have at least 3 outgoing links
3. Have at least 2 incoming links (backlinks)
4. Contain reasoning, not just facts
5. Be searchable (use clear, descriptive language)
6. Be connected to the knowledge graph

### Every Link Must

1. Point to a real, existing note
2. Be bidirectional where possible
3. Use the correct wikilink syntax

### Every Diagram Must

1. Improve understanding (not decorative)
2. Use Mermaid syntax
3. Be linked from relevant notes
4. Have a clear title and caption

---

## Templates

Templates ensure consistency. Every new note of a given type starts with the correct structure.

See `Templates/` for the full set of templates.

---

## Canvas Boards

Canvas boards provide visual, spatial organization of knowledge. They are used for:

- Architecture overviews
- Product evolution timelines
- AI workforce relationships
- Security landscapes
- Roadmap visualization
- Customer discovery mapping

Canvas boards are in `Canvas/`.

---

## Mermaid Diagrams

Every major concept should have a diagram. Diagrams are stored in `Diagrams/` and embedded in notes.

Diagram types:
- Architecture diagrams
- Workflow diagrams
- Relationship diagrams
- Decision trees
- State diagrams
- Sequence diagrams
- Mind maps

---

**Version**: 1.2
**Created**: 2026-07-20
**Status**: Active
