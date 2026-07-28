---
title: "In-Memory Stores Are Fine for v1"
created: 2026-07-20
tags:
  - type/lesson
  - domain/architecture
  - status/active
aliases:
  - In-Memory Stores
  - Premature Persistence
---
Sorry I was I will send you now
# In-Memory Stores Are Fine for v1

**Category**: Architecture

**Lesson**: Don't over-engineer persistence before you know the access patterns. Business rules, schedules, and approval matrix work fine in memory for single-instance deployment. Premature persistence adds schema complexity, migration burden, and transaction management before you even know if anyone will use the feature. Start in-memory, observe real access patterns, then persist what needs persisting — not what you think might need persisting.

**When it applies**: When building new domain models that are currently single-instance and have no cross-instance coordination requirements. Especially true for configuration-like data (rules, templates, matrices) that is written infrequently and read on every request.

**Related**: [[03-Architecture/in-memory-stores|In-Memory Stores]], [[11-ADR/adr-003-in-memory-stores|ADR-003]]

**Source**: Phase 7 — Business rules, schedules, approval matrix all stored in-memory Maps
