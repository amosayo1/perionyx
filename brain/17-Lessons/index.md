---
title: Lessons
created: 2026-07-26
updated: 2026-07-28
tags: [index, lessons, engineering, architecture, security, product, ux]
owner: platform-team
status: active
---

# Lessons

## Purpose

Engineering and product lessons with evidence — numbered, categorized, and linked to decisions. Each lesson captures what we learned, why it matters, and the evidence that supports it.

**Authority:** Medium — lessons are validated against production experience but may be context-specific.

## Summary

The Lessons folder contains 58 numbered lessons (01–58) organized by domain. Each lesson follows a standard structure: observation, evidence, principle, and application. Lessons feed into the Decision Network (Principles) and inform future engineering choices.

## Content Map

| File | Domain | Key Lessons |
|------|--------|-------------|
| [[17-Lessons/01-10-foundation\|01–10: Foundation]] | Engineering, Architecture | Early platform patterns |
| [[17-Lessons/11-20-engineering\|11–20: Engineering]] | Engineering, Security | Core engineering practices |
| [[17-Lessons/21-30-platform\|21–30: Platform]] | Architecture, Security, Product | Platform architecture lessons |
| [[17-Lessons/31-37-domain\|31–37: Domain]] | Engineering, Product, UX | Domain-specific lessons |
| [[17-Lessons/38-44-recent\|38–44: Recent]] | Product, UX, Customer Discovery | Latest learnings |

### Lesson Index (All 44)

| # | Title | Domain |
|---|-------|--------|
| 01 | In-Memory Stores Are Fine for v1 | Architecture |
| 02 | Extract Shared Utilities Early | Engineering |
| 03 | Proxy Over Middleware | Architecture |
| 04 | Parallelization Is Free Performance | Engineering |
| 05 | One Screen, One Question | UX |
| 06 | CSRF Needs Conditional Enforcement | Security |
| 07 | Fail-Open Has a Ceiling | Security |
| 08 | Error Messages Are Attack Surface | Security |
| 09 | Never Trust Client-Side Authorization | Security |
| 10 | Security Audits Before Launch Are Non-Negotiable | Security |
| 11 | Progressive Disclosure Over Everything | UX |
| 12 | Validation Must Explain HOW to Fix | UX |
| 13 | Motion Serves Function | UX |
| 14 | Enterprise Tables Need Density Control | UX |
| 15 | Build the Constitution First | Architecture |
| 16 | CFOs Don't Wait | UX |
| 17 | One Screen, One Question (Product Edition) | Product |
| 18 | Pilot Criteria Must Be Defined Before Building | Product |
| 19 | Unified Error Handling Saves Hundreds of Hours | Engineering |
| 20 | Cache Headers Are Free Performance | Engineering |
| 21 | Testing at 85% Catches Real Bugs | Testing |
| 22 | Prisma Parameterized Queries Prevent SQL Injection | Security |
| 23 | Proxy Correlation IDs Are Debugging Gold | Engineering |
| 24 | Evidence Can Overturn Architectural Assumptions | Architecture |
| 25 | Platform Primitives Must Have One Authoritative Implementation | Architecture |
| 26 | Financial Precision Is Non-Negotiable | Finance |
| 27 | Residual Handling Prevents Allocation Drift | Finance |
| 28 | Modules Are Not Workflows | Product |
| 29 | Workflow Success Defines Product Success | Product |
| 30 | Quick Wins Compound | Product |
| 31 | Cross-Cutting UX Fixes Have Broad But Shallow Impact | UX |
| 32 | Domain Scaffolding Is Not Domain Functionality | Product |
| 33 | Domain Architecture Design Precedes Implementation | Architecture |
| 34 | Prisma Model Classification Prevents Over-Schema | Architecture |
| 35 | Command Handlers Encode Business Rules, Not Infrastructure | Architecture |
| 36 | API Contracts Encode Domain Boundaries | Architecture |
| 37 | Integration Tests Catch Interaction Bugs That Unit Tests Miss | Testing |
| 38 | *(reserved — see 11-Decisions/decision-network)* | — |
| 39 | Deterministic Seed Data Reveals Integration Gaps | Data |
| 40 | Design Language Is Infrastructure | Design |
| 41 | Constitutions Outlive Architectures | Governance |
| 42 | A Constitution Gains Authority Through Successful Validation | Governance |
| 43 | Shared Capabilities Before Integrations | Architecture |
| 44 | Context Propagation Is the Invisible Architecture | Architecture |
| 45 | Knowledge Structure Enables Knowledge Growth | Knowledge |
| 46 | Architecture Earns Trust Through Continuous Validation | Architecture |
| 47 | Interview Structure Before Content | Customer Intelligence |
| 48 | Security Fixes Are Production Code | Security |
| 49 | Mass Migration Requires Codemods, Not Manual Edits | Engineering |
| 50 | Audits Correct More Than They Discover | Engineering |
| 51 | Strong Platforms Earn Trust Through Independent Verification | Architecture |
| 52 | Prevention Outlasts Remediation | Architecture |
| 53 | Workflow Quality Determines Software Quality | Product |
| 54 | Customer Knowledge Compounds | Product |
| 55 | The Best Enterprise Software Is Designed Around Decisions, Not Transactions | Product |
| 56 | Enterprise Products Earn Trust Through Independent Review Before Implementation | Product |
| 57 | Demo Readiness Is Earned Through Live-DB Verification | Data |
| 58 | Remediation Is Verification | Quality |

## Navigation

| Folder | Relationship |
|--------|-------------|
| [[04-Engineering/index\|04-Engineering]] | Engineering standards derived from lessons |
| [[11-Decisions/index\|11-Decisions]] | Principles in Decision Network encode lessons |
| [[12-Roadmaps/index\|12-Roadmaps]] | Phases where lessons were learned |

## Related

- [[11-Decisions/index\|11-Decisions]] — Decision Network principles evolved from lessons
- [[04-Engineering/index\|04-Engineering]] — Engineering standards codified from lessons
- [[12-Roadmaps/index\|12-Roadmaps]] — Phase reports reference specific lessons
- [[00-Constitution/index\|00-Constitution]] — Platform Constitution reflects accumulated wisdom
