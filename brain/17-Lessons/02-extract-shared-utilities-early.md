---
title: "Extract Shared Utilities Early"
created: 2026-07-20
tags:
  - type/lesson
  - domain/architecture
  - status/active
aliases:
  - DRY Extraction
  - Second Use Pattern
---

# Extract Shared Utilities Early

**Category**: Architecture

**Lesson**: The [[ConditionEvaluator]] was extracted from `ConditionalBranchStepExecutor` and became shared across business rules, approval matrix, and conditional workflow logic. Extract when you see the second use case — not the third, not the fourth. The second use case proves the pattern; the third proves it's a real abstraction. Waiting until the third means you've duplicated logic twice already.

**When it applies**: When you find yourself writing the same logic in two different modules, or when a step executor's logic would be useful outside its immediate context. The moment you copy-paste is the moment you should extract.

**Related**: [[03-Architecture/condition-evaluator|ConditionEvaluator]], [[11-ADR/adr-005-condition-evaluator-extraction|ADR-005]]

**Source**: Phase 7 — ConditionEvaluator extracted from ConditionalBranchStepExecutor
