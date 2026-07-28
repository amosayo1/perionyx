---
id: "052"
title: "Prevention Outlasts Remediation"
date: 2026-07-27
phase: "26.3"
category: "engineering"
tags: [foundation, prevention, hardening, lint, ci, regression]
severity: "critical"
principle: 29
decision: "ADR-029"
---

# Lesson 52: Prevention Outlasts Remediation

## Context

Phase 26.2 certified the foundation with 6 conditions (2 Critical, 3 High, 1 Medium). Each condition was a specific instance of a broader defect class. Phase 26.3 fixed all 6 conditions, but the critical insight was that **fixing the instance without eliminating the class guarantees recurrence**.

## The Pattern

Every certification condition belonged to one of 5 defect classes:

| Class | Instance | Root Cause | Prevention |
|-------|----------|------------|------------|
| Singleton lifecycle | C-01: `create()` overwrites without shutdown | No ownership protocol | Async `create()` + mandatory `shutdown()` |
| Tenant isolation | C-02: audit log leaks across tenants | Optional tenantId parameter | Required `tenantId` parameter |
| Memory bounds | C-03: unbounded arrays in 5 locations | No max-size enforcement | `BoundedRingBuffer<T>` utility class |
| Silent failure | C-04: 25+ empty catch blocks | No enforcement mechanism | ESLint rule `no-empty-catch` + CI check |
| Insecure defaults | C-06: sandbox fallback secret | Convenience over security | Throw on missing secret, no fallback |

## Key Insight

**Fixing the instance is necessary but insufficient.** The ESLint rule `no-empty-catch` will prevent the next developer from introducing an empty catch block. The CI validation script will catch it before merge. The `BoundedRingBuffer` class makes it impossible to forget max-size. The async `create()` pattern makes shutdown-before-overwrite the default, not an afterthought.

## Metrics

- 6 conditions remediated
- 25+ empty catch blocks fixed
- 5 unbounded arrays replaced
- 19 API routes validated
- 1 ESLint rule created
- 1 CI validation script (7 checks)
- 1 utility class created (`BoundedRingBuffer`)
- 0 TypeScript errors, 112/112 tests passing

## Engineering Principle

**#29 — Prevention Outlasts Remediation**: Every recurring defect class must be addressed at the tooling or architectural level, not only at the instance level. If a defect can reappear after remediation, the remediation is incomplete.

## Related

- [[Lesson-50-audits-correct-more-than-they-discover]] — Audits discover instances
- [[Lesson-51-strong-platforms-earn-trust-through-independent-verification]] — Verification proves instances are fixed
- [[Lesson-52-prevention-outlasts-remediation]] — Prevention eliminates the class
- [[ADR-029-foundation-hardening]] — Architecture decision
- [[Principle-29-prevention-outlasts-remediation]] — Engineering principle
