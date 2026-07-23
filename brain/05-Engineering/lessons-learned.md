---
title: "Lessons Learned"
created: 2026-07-20
updated: 2026-07-22
tags:
  - type/moc
  - domain/engineering
  - status/active
aliases:
  - Lessons
  - Engineering Lessons
  - Postmortem Insights
---

# Lessons Learned

A living library of engineering lessons, organized by category. Every lesson is earned through real experience building Perionyx — surprises, failures, and successes alike. Lessons without context are trivia; each entry captures the lesson, when it applies, and what it connects to.

> [!tip] How to Add Lessons
> When you learn something surprising — especially from a failure — create a new note in `05-Engineering/Lessons/` using the lesson template. Format: lesson title, category, one-paragraph explanation, when it applies, and related notes. Be honest. Surprises and failures are the most valuable lessons.

---

## Architecture Lessons

| # | Lesson | Source |
|---|--------|--------|
| 1 | [[05-Engineering/Lessons/01-in-memory-stores-fine-for-v1\|In-Memory Stores Are Fine for v1]] | Phase 7 |
| 2 | [[05-Engineering/Lessons/02-extract-shared-utilities-early\|Extract Shared Utilities Early]] | Phase 7 |
| 3 | [[05-Engineering/Lessons/03-proxy-over-middleware\|Proxy Over Middleware]] | Phase 7 |
| 4 | [[05-Engineering/Lessons/04-parallelization-free-performance\|Parallelization Is Free Performance]] | Phase 8A |
| 5 | [[05-Engineering/Lessons/05-one-screen-one-question\|One Screen, One Question]] | AGENTS.md |

## Security Lessons

| # | Lesson | Source |
|---|--------|--------|
| 6 | [[05-Engineering/Lessons/06-csrf-conditional-enforcement\|CSRF Needs Conditional Enforcement]] | Phase 17 P0-1 |
| 7 | [[05-Engineering/Lessons/07-fail-open-has-a-ceiling\|Fail-Open Has a Ceiling]] | Phase 17 P0-5 |
| 8 | [[05-Engineering/Lessons/08-error-messages-attack-surface\|Error Messages Are Attack Surface]] | Phase 16 |
| 9 | [[05-Engineering/Lessons/09-never-trust-client-authorization\|Never Trust Client-Side Authorization]] | Phase 17 P0-3 |
| 10 | [[05-Engineering/Lessons/10-security-audits-before-launch\|Security Audits Before Launch Are Non-Negotiable]] | Phase 16 |

## UX Lessons

| # | Lesson | Source |
|---|--------|--------|
| 11 | [[05-Engineering/Lessons/11-progressive-disclosure-over-everything\|Progressive Disclosure Over Everything]] | Phase 8B.6 |
| 12 | [[05-Engineering/Lessons/12-validation-must-explain-how-to-fix\|Validation Must Explain HOW to Fix]] | Phase 8B.6 |
| 13 | [[05-Engineering/Lessons/13-motion-serves-function\|Motion Serves Function]] | Phase 8B.7 |
| 14 | [[05-Engineering/Lessons/14-enterprise-tables-density-control\|Enterprise Tables Need Density Control]] | Phase 8B.4 |

## Product Lessons

| # | Lesson | Source |
|---|--------|--------|
| 15 | [[05-Engineering/Lessons/15-build-constitution-first\|Build the Constitution First]] | Phase 1 |
| 16 | [[05-Engineering/Lessons/16-cfos-dont-wait\|CFOs Don't Wait]] | AGENTS.md |
| 17 | [[05-Engineering/Lessons/17-one-screen-one-question-product\|One Screen, One Question (Product Edition)]] | AGENTS.md |
| 18 | [[05-Engineering/Lessons/18-pilot-criteria-before-building\|Pilot Criteria Must Be Defined Before Building]] | Open Questions |
| 28 | [[05-Engineering/Lessons/28-modules-are-not-workflows\|Modules Are Not Workflows]] | Phase 20.0 |
| 29 | [[05-Engineering/Lessons/29-workflow-success-defines-product-success\|Workflow Success Defines Product Success]] | Phase 20.0 |

## Engineering Lessons

| # | Lesson | Source |
|---|--------|--------|
| 19 | [[05-Engineering/Lessons/19-unified-error-handling\|Unified Error Handling Saves Hundreds of Hours]] | Phase 8A |
| 20 | [[05-Engineering/Lessons/20-cache-headers-free-performance\|Cache Headers Are Free Performance]] | Phase 8A |
| 21 | [[05-Engineering/Lessons/21-testing-at-85-percent\|Testing at 85% Catches Real Bugs]] | Phase 7F |
| 22 | [[05-Engineering/Lessons/22-prisma-parameterized-queries\|Prisma Parameterized Queries Prevent SQL Injection by Default]] | Phase 16 |
| 23 | [[05-Engineering/Lessons/23-proxy-correlation-ids\|Proxy Correlation IDs Are Debugging Gold]] | Phase 8A |
| 24 | [[05-Engineering/Lessons/24-evidence-over-assumptions\|Evidence Can Overturn Architectural Assumptions]] | Phase 18.1A |
| 25 | [[05-Engineering/Lessons/25-one-implementation-per-primitive\|Platform Primitives Must Have One Authoritative Implementation]] | Phase 18.1B |
| 26 | [[05-Engineering/Lessons/26-financial-precision-is-non-negotiable\|Financial Precision Is Non-Negotiable]] | Phase 19.0 |
| 27 | [[05-Engineering/Lessons/27-residual-handling-prevents-allocation-drift\|Residual Handling Prevents Allocation Drift]] | Phase 19.1 |

## Content & Communication Lessons

| # | Lesson | Source |
|---|--------|--------|
| 30 | [[05-Engineering/Lessons/30-quick-wins-compound\|Quick Wins Compound]] | Phase 20.1 |
| 31 | [[05-Engineering/Lessons/31-cross-cutting-ux-shallow-impact\|Cross-Cutting UX Fixes Have Broad But Shallow Impact]] | Phase 20.2 |
| 32 | [[05-Engineering/Lessons/32-domain-scaffolding-is-not-domain\|Domain Scaffolding Is Not Domain Functionality]] | Phase 21.0 |
| 33 | [[05-Engineering/Lessons/33-domain-architecture-precedes-implementation\|Domain Architecture Design Precedes Implementation]] | Phase 21A.0 |
| 34 | [[05-Engineering/Lessons/34-entity-classification-prevents-over-schema\|Entity Classification Prevents Over-Schema]] | Phase 21A.1 |
| 35 | [[05-Engineering/Lessons/35-command-handlers-encode-business-rules\|Command Handlers Encode Business Rules, Not Infrastructure]] | Phase 21A.2 |
| 36 | [[05-Engineering/Lessons/36-api-contracts-encode-domain-boundaries\|API Contracts Encode Domain Boundaries]] | Phase 21A.3 |
| 37 | [[05-Engineering/Lessons/37-integration-tests-catch-interaction-bugs\|Integration Tests Catch Interaction Bugs That Unit Tests Miss]] | Phase 21A.4 |
| 38 | [[05-Engineering/Lessons/38-brain-to-public-content-pipeline\|The Brain→Public Content Pipeline]] | Phase 22.0A |

---

## Related

- [[BRAIN_CONSTITUTION|Brain Constitution]] — Governing principles for this vault
- [[11-ADR/index|Architecture Decision Records]] — Formal decisions that codified these lessons
- [[13-Engineering-Journal/index|Engineering Journal]] — Daily observations and emerging lessons
- [[04-Security/index|Security]] — Security-specific findings and lessons
- [[06-Experience-UX/index|Experience & UX]] — UX design lessons
- [[02-Product/index|Product]] — Product strategy lessons

---

*Last updated: 2026-07-21*
