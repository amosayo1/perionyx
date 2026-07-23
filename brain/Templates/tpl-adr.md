---
type: adr
title: "{{title}}"
date: {{date}}
status: draft
tags: []
related_notes: []
summary: ""
open_questions: []
lessons_learned: []
future_work: []
---

<!-- Use this template when recording an architecture decision. Capture the context,
     alternatives, and trade-offs so future engineers understand *why* the system
     was designed this way. Copy this file into the appropriate numbered folder
     under 11-ADR/ and rename it (e.g., 001-use-prisma-for-orm.md). -->

# ADR-{{adr_number}}: {{title}}

## Status

> **{{status}}** — proposed | accepted | deprecated | superseded by [ADR-XXX](link)

## Context

<!-- What is the situation that necessitates a decision? What forces are at play
     (technical, organizational, regulatory)? -->

{{context}}

## Decision

<!-- What did we decide? State the decision clearly and unambiguously. -->

{{decision}}

## Alternatives Considered

<!-- List every alternative evaluated, including "do nothing." -->

| # | Alternative | Why It Was Rejected |
|---|---|---|
| 1 | {{alternative_1}} | {{reason_1}} |
| 2 | {{alternative_2}} | {{reason_2}} |
| 3 | No change (status quo) | {{reason_3}} |

## Trade-offs

<!-- What do we gain and what do we give up with this decision? -->

**Gains:**
- {{gain_1}}

**Costs:**
- {{cost_1}}

## Consequences

<!-- What follows from this decision? Include positive, negative, and neutral
     consequences. Who is affected? -->

{{consequences}}

## Related ADRs

- [ADR-XXX]({{related_adr_1}})
- [ADR-XXX]({{related_adr_2}})

## Links

- [Design Doc]({{design_doc_url}})
- [PR / Commit]({{pr_url}})
- [Discussion Thread]({{discussion_url}})
