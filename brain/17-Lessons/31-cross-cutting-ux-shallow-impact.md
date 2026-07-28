---
title: "Cross-Cutting UX Fixes Have Broad But Shallow Impact"
created: 2026-07-21
lesson_number: 31
tags:
  - type/lesson
  - domain/product
  - priority/high
aliases:
  - Broad Fixes
  - Shallow Impact
  - UX Pattern
---

# Lesson 31: Cross-Cutting UX Fixes Have Broad But Shallow Impact

## Context

Phase 20.1 implemented 8 cross-cutting UX fixes (confidence badges, timestamps, undo, demo indicator, etc.) that benefited 8-10 personas each. Phase 20.2 measured the impact: average persona coverage improved 6.2→6.9 (+0.7), average trust score improved 6.4→6.8 (+0.4). Measurable but incremental.

## The Pattern

Cross-cutting improvements (standardized components, global UX patterns, shared infrastructure) have two properties:

1. **Broad reach** — A single fix benefits many personas and workflows simultaneously
2. **Shallow depth** — Each fix provides a 0.5-1 point improvement per persona/workflow

Domain-specific improvements (3-way matching for AP, cash application for AR, regulatory intelligence for Compliance) have the opposite property:

1. **Narrow reach** — A single fix benefits 1-2 personas
2. **Deep impact** — Each fix provides a 2-3 point improvement for the affected persona

## Evidence

| Fix | Personas Benefited | Avg Improvement Per Persona |
|---|---|---|
| ConfidenceBadge | 8 | +0.3 |
| Timestamps | 4 | +0.25 |
| Undo system | 8 | +0.2 |
| Demo indicator | 5 | +0.15 |
| GL deprecation | 1 | +0.5 |
| GL Integration | 3 | +0.3 |

**Total**: 8 fixes × avg 5 personas × avg 0.28 improvement = **11.2 persona-points**

Compare to: 1 fix (3-way matching) × 1 persona (AP) × 2.5 improvement = **2.5 persona-points**

The cross-cutting approach generated **4.5x more total persona-points** but required **8x more fixes**.

## The Lesson

**Cross-cutting UX improvements are necessary but insufficient for production readiness.** They raise the floor (minimum experience quality) but don't raise the ceiling (domain-specific capability). A platform needs both:

- **Cross-cutting fixes** for minimum viable experience (confidence, timestamps, undo, transparency)
- **Domain-specific fixes** for production viability (matching engines, workflow automation, intelligence)

## Application

When planning remediation phases:

1. **Start with cross-cutting fixes** if the platform has fundamental UX gaps (no confidence, no timestamps, no undo)
2. **Transition to domain-specific fixes** once the UX floor is adequate
3. **Measure both breadth and depth** — don't celebrate broad shallow improvements as if they were deep narrow ones
4. **Track persona-level scores** — aggregate metrics mask persona-specific gaps (AP at 5/10 while average is 6.9)

## Related

- Lesson 28 (Modules Are Not Workflows)
- Lesson 29 (Workflow Success Defines Product Success)
- Principle #6 in Decision Network

---

*Created: Phase 20.2 — Enterprise Workflow Revalidation*
