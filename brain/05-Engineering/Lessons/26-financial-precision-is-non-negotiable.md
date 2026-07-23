---
title: "Financial Precision Is Non-Negotiable"
created: 2026-07-21
updated: 2026-07-21
tags:
  - type/lesson
  - domain/engineering
  - domain/finance
  - status/active
related:
  - "[[05-Engineering/lessons-learned|Lessons Learned]]"
  - "[[BRAIN_CONSTITUTION|Brain Constitution]]"
phase: Phase 19.0
status: active
---

# Financial Precision Is Non-Negotiable

**Category**: Engineering

**Lesson**: When representing monetary values, the choice of data type is a correctness decision, not a performance decision. JavaScript `number` (IEEE 754 double) introduces rounding errors that compound across calculations (0.1 + 0.2 !== 0.3). For financial systems, Prisma.Decimal (arbitrary-precision decimal) must be used for ALL monetary calculations — storage, computation, and comparison. The `Number()` conversion pattern (converting Decimal to number for arithmetic) is a precision loss vector that must be eliminated from all financial paths. Display formatting is the ONLY acceptable use of `Number()` conversion.

**When it applies**: Any time a monetary value is stored, computed, compared, aggregated, allocated, or reported. If it involves money, use Prisma.Decimal. If it's a display-only format string, Number() is acceptable.

**Decision framework**: Ask: (1) Is this value monetary? (2) Will it be compared to another monetary value? (3) Will it be summed/aggregated? If any answer is yes, use Prisma.Decimal. Never use Math.round() for financial rounding — use banker's rounding via Intl.NumberFormat.

**Related**: [[03-Architecture/index|Architecture]], [[05-Engineering/index|Engineering]], [[13-Engineering-Journal/index|Engineering Journal]]

**Source**: Phase 19.0 — Financial Core Consolidation
