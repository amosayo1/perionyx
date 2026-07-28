---
title: "Testing at 85% Catches Real Bugs"
created: 2026-07-20
tags:
  - type/lesson
  - domain/engineering
  - status/active
aliases:
  - Coverage Threshold
  - Test Strategy
---

# Testing at 85% Catches Real Bugs

**Category**: Engineering

**Lesson**: The 85% coverage threshold in the testing strategy forced coverage of edge cases that would have been skipped otherwise. The 18 test suites across 15 categories found 3 real bugs during implementation that would have been caught in production. The threshold isn't arbitrary — it's the point where the marginal cost of additional tests exceeds the marginal value. Below 80%, you miss real bugs. Above 90%, you're testing getters and setters.

**When it applies**: When setting up a testing strategy. Start with 85% as the threshold, track per-domain coverage, and adjust thresholds for critical domains (security, finance) upward to 90%+.

**Related**: [[05-Engineering/testing-strategy|Testing Strategy]], [[11-ADR/adr-014-testing-strategy|ADR-014]]

**Source**: Phase 7F — 18 test suites, 85% coverage threshold
