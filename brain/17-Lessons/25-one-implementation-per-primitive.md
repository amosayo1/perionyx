---
title: "Platform Primitives Must Have One Authoritative Implementation"
created: 2026-07-21
updated: 2026-07-21
tags:
  - type/lesson
  - domain/engineering
  - domain/architecture
  - status/active
aliases:
  - Single Source of Truth
  - Platform Primitive Consolidation
  - One Implementation Rule
related:
  - "[[05-Engineering/lessons-learned|Lessons Learned]]"
  - "[[BRAIN_CONSTITUTION|Brain Constitution]]"
  - "[[12-Roadmaps/evolution-timeline|Evolution Timeline]]"
phase: Phase 18.1B
status: active
---

# Platform Primitives Must Have One Authoritative Implementation

**Category**: Engineering

**Lesson**: When a platform has two implementations of the same primitive (two loggers, two permission registries, two AI execution paths), every consumer must choose which one to use. That choice creates inconsistency — some files use one, some use the other. The "wrong" implementation typically lacks security features (redaction), observability (health tracking), or governance (rate limiting). Consolidating to one authoritative implementation eliminates the choice, ensures every consumer gets the full feature set, and reduces maintenance burden. The key insight: the "better" implementation is the one already used by the majority. Migrate the minority to the majority, not the other way around.

**When it applies**: When you discover two implementations of the same concept in a codebase. Before creating a third, consolidate to one. Every platform primitive — logger, cache, queue, permission check, AI call — should have exactly one path through the codebase.

**Decision framework**: For each primitive, ask: How many consumers use each implementation? Which has more security features? Which has more observability? Which is actively maintained? Migrate the smaller set to the larger set. Delete the smaller implementation.

**Related**: [[03-Architecture/index|Architecture]], [[05-Engineering/index|Engineering]], [[13-Engineering-Journal/index|Engineering Journal]], [[12-Roadmaps/evolution-timeline|Evolution Timeline]]

**Source**: Phase 18.1B — Enterprise Platform Primitive Consolidation
