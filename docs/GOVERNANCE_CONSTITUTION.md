# Governance Constitution

**Version 1.0**
**Last Updated: July 2026**
**Status: Ratified**

---

## Purpose

This document is the highest authority in the Perionyx project. It defines the permanent engineering and product philosophy that governs every decision, contribution, and review.

All detailed implementation guidance, principles, and standards live in their respective dedicated documents. This document references them without duplication.

Every contributor, engineer, AI assistant, and reviewer must consult this document before making architectural or product decisions.

---

## Core Mission

Perionyx exists to replace fragmented financial tooling with a single unified platform that treasury, finance, compliance, risk, and audit teams can trust with their company's money.

See `PRODUCT_CONSTITUTION.md §1` for the full mission statement.

---

## Product Philosophy

- **Enterprise-first** — Every feature must serve enterprise financial operations. Consumer fintech patterns are explicitly out of scope.
- **One platform, not many tools** — Treasury, payments, governance, risk, audit, reporting, and AI coexist in a single cohesive product with consistent patterns across modules.
- **Financial correctness over feature quantity** — A bug in a financial calculation is never acceptable. Feature velocity yields to correctness.
- **Security before convenience** — No shortcut is worth a data breach. Authentication, authorization, tenant isolation, and audit logging are non-negotiable.
- **Trust before automation** — The platform must earn trust through transparency before automating sensitive operations.
- **AI augments decisions, never replaces accountability** — AI recommends; humans decide. Every financial action requires explicit human approval through governed workflows.

See `PRODUCT_CONSTITUTION.md §3` for detailed core principles.

---

## Architecture Principles

The architecture follows eight principles, fully defined in `ARCHITECTURE.md §7`:

1. **Modular Monolith** — Single deployment with explicit module boundaries. No distributed system complexity until justified.
2. **Tenant Isolation** — Every entity carries `companyId`. Cross-tenant access is a security incident.
3. **Secure by Default** — Authentication required, authorization denies by default, rate limiting protects, input validation rejects, audit logging records.
4. **Immutable Financial History** — Ledger entries never modify or delete. Corrections are reversal transactions.
5. **Explicit Domain Boundaries** — Modules communicate through typed function calls. Circular dependencies prohibited.
6. **Offline-First AI** — Platform functions fully without AI dependencies. AI never acts autonomously.
7. **Enterprise-First UX** — Dark theme, data-dense layouts, keyboard navigation, command palette.
8. **Consistency Over Convenience** — Naming, errors, pagination, and response structures are uniform across modules.

See `ARCHITECTURE.md §8` for intentional constraints (no CQRS, no event sourcing, state-based persistence).

---

## Engineering Principles

Engineering standards are defined in three tiers:

| Tier | Document | Scope |
|------|----------|-------|
| Principles | `PRODUCT_CONSTITUTION.md §4` | Type safety, modularity, data layer authority, error explicitness, idempotency, testing philosophy |
| Standards | `CODING_STANDARDS.md` | TypeScript strict mode, prohibited patterns, naming conventions, file organization |
| Process | `CONTRIBUTING.md` | Architecture review process, code review cadence, PR requirements |

Key cross-cutting principles:

- **Prefer extending existing modules** over creating new ones.
- **Avoid duplicate logic** — if the same pattern exists in two places, extract it.
- **Keep dependencies minimal** — every dependency must justify its existence.
- **Refactor before rewriting** — incremental improvement over big-bang changes.
- **Maintain type safety** — `any` is prohibited except in documented adapter layers.

---

## Product Language

The official terminology glossary is `GLOSSARY.md`. Every page heading, navigation label, description, tooltip, error message, and marketing copy must use the standardized terms defined there.

Key rules:
- Product category: **Enterprise Treasury Operating System** (not "Financial Platform" or "Financial Operating System")
- AI interface: **Copilot** (heading), **PERIONYX Copilot** (branded reference)
- AI system: **PERIONYX Intelligence** (internal system identity)
- Dashboard: **Executive Overview** (not "Dashboard" in navigation)
- Insights: **Executive Insights** (not "Insights" standalone)

Inconsistent terminology is a documentation bug. See `GLOSSARY.md` for the full navigation terminology table.

---

## Documentation Philosophy

- **Document WHY before HOW.** Principles belong in the constitution and architecture guide. Implementation details belong in code comments and API guidelines.
- **One source of truth.** Every fact exists in exactly one document. All other documents reference it. No duplicated content across documents.
- **Documentation is code.** Outdated documentation is a bug. Updates must accompany code changes.
- **Concision over completeness.** A short document that people read is better than a comprehensive document that nobody does.
- **Architecture decisions are recorded.** Every significant decision is an ADR in `DECISIONS.md`. The tradeoffs, alternatives considered, and consequences are permanent.

---

## Decision Framework

Before implementing any feature, ask:

- Does this improve enterprise value for treasury, finance, compliance, risk, or audit teams?
- Can an existing module be extended to deliver this functionality?
- Does this add unnecessary complexity to the codebase, deployment, or data model?
- Will this remain maintainable and understandable in five years?
- Would a Fortune 500 customer trust this implementation with their money?
- Is this consistent with every document higher in the authority hierarchy?

If the answer to any of the first two is "no" or any of the remaining is "no", the decision requires escalation through the architecture review process defined in `CONTRIBUTING.md §2`.

---

## AI Rules

AI in Perionyx is governed by `AI_GUIDELINES.md` and `PRODUCT_CONSTITUTION.md §6`.

**AI never:**
- Approves payments, transactions, or financial operations
- Bypasses RBAC, tenant isolation, or authorization checks
- Performs irreversible actions (deletions, balance modifications)
- Fabricates platform data — all responses must be grounded in database records

**AI always:**
- Explains reasoning with source citations
- Cites platform knowledge (module, record ID, field)
- Respects the authenticated user's permission scope
- Includes a confidence rating with every response
- Degrades gracefully when AI services are unavailable

---

## Future Development Rules

Every new feature must:

- Align with the core mission (enterprise financial operations platform)
- Follow the architecture principles (modular monolith, tenant isolation, secure by default, etc.)
- Preserve tenant isolation — no cross-company data leakage
- Maintain auditability — every financial state change produces an audit record
- Respect security — defense in depth (auth → RBAC → tenant isolation → rate limiting → validation → audit)
- Improve consistency — match patterns established by existing modules
- Document architectural decisions as ADRs in `DECISIONS.md`
- Pass all quality gates: zero TypeScript errors, no lint warnings, explicit error handling

---

## Authority Hierarchy

When documents conflict, the higher authority prevails:

| Priority | Document | Purpose |
|----------|----------|---------|
| 1 | **GOVERNANCE_CONSTITUTION.md** | Permanent engineering and product philosophy |
| 2 | **PRODUCT_CONSTITUTION.md** | Product principles, mission, vision, quality standards |
| 3 | **ARCHITECTURE.md** | System architecture, principles, domain modules |
| 4 | **DECISIONS.md** (ADRs) | Recorded architectural decisions with rationale |
| 5 | **SECURITY.md** | Security architecture and implementation |
| 6 | **AI_GUIDELINES.md** | AI behavior, response structure, persona system |
| 7 | **API_GUIDELINES.md** | API design, versioning, response formats |
| 8 | **CODING_STANDARDS.md** | TypeScript patterns, naming, file organization |
| 9 | **CONTRIBUTING.md** | Review process, PR requirements |
| 10 | **GLOSSARY.md** and all other docs | Terminology, guides, operational references |

A lower-priority document may diverge from a higher-priority document only when explicitly noted and approved via an ADR. Unapproved divergence is a governance violation.

---

## Final Principle

The best architecture is not the one with the most documentation, but the one that remains understandable, maintainable, and trusted over time.
