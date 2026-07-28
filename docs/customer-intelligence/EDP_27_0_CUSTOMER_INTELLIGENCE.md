---
title: "Engineering Decision Packet — Phase 27.0 Customer Intelligence Platform Completion"
phase: 27.0
status: accepted
date: 2026-07-28
author: Perionyx Engineering
tags: [customer-intelligence, brain, crm, edp, decisions]
version: "1.0"
---

# Engineering Decision Packet — Phase 27.0 Customer Intelligence Platform Completion

## 1. Decision

**Complete the Customer Intelligence Platform as the canonical knowledge base for all customer-facing intelligence in the Perionyx Brain.**

This decision unifies 39 contact profiles across CRM and Brain, formalizes 9 relationship lifecycle stages, maps knowledge graph connections, establishes evidence traceability from customer conversations to product decisions, and builds a pre-scored design partner pipeline.

## 2. Context

### Background

The Perionyx CRM has evolved beyond simple contact management. It now tracks 39 contacts across LinkedIn and internal sources, with varying levels of data richness. The Brain has 20 formally-governed folders with constitutional authority (Phase 25.0), but customer intelligence was scattered across:

- `brain/03-Customer Intelligence/` — 11 people profiles (1 populated)
- CRM module — 19 contacts with interaction data
- LinkedIn-sourced contacts — 8 additional contacts
- Phase 20.0 validation — 8 market themes with evidence
- Phase 27.0A EPS — 9 product principles with evidence traceability

### Problem

Without a unified Customer Intelligence Platform:
1. **No relationship lifecycle** — Contacts had ad hoc stages, no canonical progression
2. **No evidence traceability** — Product decisions couldn't be linked to customer evidence
3. **No design partner pipeline** — No scored candidates, no formalization process
4. **No CRM health visibility** — Duplicates, missing data, and broken links unknown
5. **No knowledge graph** — Connections between people, pain points, and evidence unmapped

### Constraints

- Brain is the knowledge layer, CRM is the operational layer — cannot merge
- Manual maintenance required (no automated CRM↔Brain sync)
- Must work with existing 39 contacts (no new data fabrication)
- Must align with Brain Constitution (Phase 25.0) and Platform Constitution (Phase 23.0)

## 3. Options Considered

### Option A: Keep CRM and Brain Separate

Maintain two independent systems with manual cross-referencing.

**Pros**: Zero migration effort, no architectural changes, CRM continues as operational system.

**Cons**: No unified view of customer intelligence, evidence traceability impossible, knowledge graph remains fragmented, design partner pipeline invisible, duplicate maintenance burden.

**Verdict**: Rejected — fragments intelligence across systems.

### Option B: Complete the Customer Intelligence Platform (Chosen)

Unify all customer intelligence in Brain's `03-Customer Intelligence/` folder with canonical stages, evidence traceability, and design partner pipeline.

**Pros**: Single source of truth for all customer intelligence, evidence traceable to product decisions, knowledge graph connections mapped, design partner pipeline visible and scored, CRM health fully audited.

**Cons**: Manual maintenance required, no automated sync between CRM and Brain, requires ongoing discipline to keep updated.

**Verdict**: Accepted — Brain is the knowledge layer, CRM is the operational layer.

### Option C: Build a Separate Intelligence Tool

Build a dedicated SaaS tool for customer intelligence management.

**Pros**: Purpose-built for intelligence, could automate CRM↔Brain sync, could provide analytics dashboards.

**Cons**: Massive engineering investment (months), duplicates existing Brain capabilities, introduces new infrastructure dependency, requires ongoing maintenance, violates "no new tools until core product is production-ready."

**Verdict**: Rejected — over-engineering for current scale, Brain already has the infrastructure.

## 4. Decision Rationale

### Why Option B

1. **Brain is the knowledge layer** — The Platform Constitution (Phase 23.0) establishes Brain as the canonical knowledge store. Customer intelligence belongs here.
2. **CRM is the operational layer** — CRM handles day-to-day contact management, interaction logging, and pipeline tracking. It remains the operational system.
3. **Bridge, not merge** — The Customer Intelligence Platform bridges Brain and CRM without merging them. Brain stores the intelligence, CRM stores the operations.
4. **Evidence traceability** — Only Brain's knowledge graph structure can link customer evidence to product principles and decisions.
5. **Design partner pipeline** — Brain's structured profiles enable scoring and pipeline management without a separate tool.

### Why Not Option A

Option A perpetuates the fragmentation that Phase 25.0 was designed to eliminate. Without a unified intelligence layer, product decisions remain disconnected from customer evidence, and the design partner pipeline remains invisible.

### Why Not Option C

Option C violates the "no new tools until core product is production-ready" principle. The AP reference workflow (Phase 27.0B) must ship before building new infrastructure. Brain already has the knowledge graph, profiles, and evidence structure needed.

## 5. Consequences

### Positive

- Every contact has a Brain profile with relationship stage, strength, and strategic importance
- Every product principle is traceable to interview evidence
- Design partner pipeline is visible with 7 pre-scored candidates
- CRM health is fully audited with 72/100 score and prioritized recommendations
- Knowledge graph maps 200+ nodes and 230+ edges across people, pain points, and evidence
- 9 canonical relationship stages provide consistent lifecycle management
- Evidence confidence levels (Validated/Working/Hypothesis) guide product decisions

### Negative

- **Manual maintenance** — No automated sync between CRM and Brain; requires discipline
- **No automated CRM↔Brain sync** — Changes in one system must be manually reflected in the other
- **Scale limitations** — At 39 contacts, manual maintenance is feasible; at 390, it will not be
- **Evidence gap** — Only 1 formal interview; 38 contacts still need interviews to validate claims

### Mitigations

- Establish weekly CRM health check cadence
- Schedule 11 interviews in Q3-Q4 2026 to fill evidence gaps
- Formalize 5 design partners by Q4 2026 to deepen relationships
- Plan automated sync as a future Phase 28+ initiative when contact volume demands it

## 6. Evidence

### What We Know

| Evidence | Source | Confidence |
|---|---|---|
| 39 contacts tracked across CRM and Brain | CRM + Brain profiles | High |
| 1 formal interview completed (Adeel Aslam) | Interview transcript | High |
| 18 CRM-sourced data points | CRM interaction logs | Medium |
| 8 market themes documented | Phase 20.0 validation | Medium |
| 9 product principles defined | Phase 27.0A EPS | Medium |
| 3 evidence claims at Working level | 2 sources each | High |
| 14 evidence claims at Hypothesis level | 1 source each | Low |
| 7 design partner candidates pre-scored | Scoring framework | Medium |
| CRM health score 72/100 | Health audit | High |
| 0 duplicate contacts found | Duplicate detection | High |
| 0 broken wikilinks | Link integrity check | High |

### What We Don't Know

- Whether hypotheses T4-T8 are valid (need interviews)
- Whether design partner candidates will engage (need outreach)
- Whether 5 design partners can be formalized by Q4 2026 (need execution)
- Whether automated sync is needed (need scale data)

## 7. Related Decisions

### ADR-025: Knowledge Structure Enables Knowledge Growth

Phase 25.0 restructured Brain into 20 formally-governed folders. Phase 27.0 completes the `03-Customer Intelligence/` folder with 39 people profiles, evidence traceability, and knowledge graph connections. This decision builds directly on ADR-025's structure.

### ADR-030: Enterprise Product Specification

Phase 27.0A defined the AP Reference Workflow as the enterprise product specification. Phase 27.0B will implement that workflow. Phase 27.0 (this phase) ensures that customer intelligence informs and validates the product specification through evidence traceability.

### ADR-014: Brain→Public Content Pipeline

Phase 22.0A established Brain as the source of truth for public content. Phase 27.0 extends this by ensuring that customer intelligence in Brain can inform public-facing content (case studies, testimonials, design partner stories) when relationships mature.

### ADR-016: Design Language Is Infrastructure

The Customer Intelligence Platform uses EDL tokens and follows Brain page standards (Phase 25.0), ensuring visual consistency with the rest of the platform.

## 8. Related Lessons

### Lesson 47: Interview Structure Before Content

Phase 25.2A established that knowledge graphs must be architecturally ready before evidence arrives. Phase 27.0 validates this by structuring 39 interview placeholders before conducting the actual interviews. The structure enables consistent evidence extraction.

### Lesson 54: Customer Knowledge Compounds

Every interview adds not just evidence for the current claim, but also strengthens the entire knowledge graph. Adeel Aslam's interview strengthened 6 evidence claims, 3 pain points, and 3 product principles simultaneously. As more interviews are conducted, the graph density and evidence confidence will compound.

### Lesson 45: Knowledge Structure Enables Knowledge Growth

The 20-folder Brain structure (Phase 25.0) enabled Phase 27.0 to systematically populate customer intelligence. Without the structure, the 39 contacts would be scattered across ad hoc files. Structure enabled growth.

### Lesson 28: Modules Are Not Workflows

Phase 20.0 established that modules (AP, Treasury, GL) are not the same as workflows (Invoice Processing, Approval Routing). Phase 27.0 maps contacts to both modules and workflows, ensuring that customer intelligence covers both dimensions.

## 9. Amendments

None. This is the initial decision.

## 10. Status

**Accepted** — 2026-07-28

### Acceptance Criteria

| Criterion | Status |
|---|---|
| 39 people profiles created | Complete |
| 9 relationship stages defined | Complete |
| Knowledge graph connections mapped | Complete |
| Evidence traceability established | Complete |
| Design partner pipeline built | Complete |
| CRM health audited | Complete |
| 8 deliverable documents produced | Complete |

### Follow-Up

| Action | Owner | Deadline |
|---|---|---|
| Schedule interviews 7-11 | Customer Intelligence | August 2026 |
| Conduct interviews | Customer Intelligence | Q3-Q4 2026 |
| Score design partners post-interview | Customer Intelligence | Q4 2026 |
| Formalize 5 design partners | Customer Intelligence | Q4 2026 |
| Re-run CRM health assessment | Customer Intelligence | Q4 2026 |
| Plan automated CRM↔Brain sync | Engineering | 2027 |

---

*This EDP is governed by the Brain Constitution (Phase 25.0) and the Platform Constitution (Phase 23.0). Changes require a new EDP with explicit rationale.*
