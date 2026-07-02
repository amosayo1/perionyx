# Perionyx — Architectural Decision Records

**Last Updated: July 2026**

This document catalogs every significant architectural decision made during the development of Perionyx. Each decision includes the context, alternatives considered, and consequences.

---

## Decision Index

| # | Title | Date | Status |
|----|-------|------|--------|
| 001 | Platform Vision & Scope | 2024-01 | Ratified |
| 002 | Multi-Tenant Architecture | 2024-01 | Ratified |
| 003 | Authentication & RBAC | 2024-01 | Ratified |
| 004 | Double-Entry Ledger | 2024-02 | Ratified |
| 005 | Policy Engine | 2024-03 | Ratified |
| 006 | Approval Engine | 2024-03 | Ratified |
| 007 | Risk Engine | 2024-04 | Ratified |
| 008 | Treasury Architecture | 2024-04 | Ratified |
| 009 | Audit Architecture | 2024-05 | Ratified |
| 010 | AI Copilot | 2025-06 | Ratified |
| 011 | Sandbox Architecture | 2025-06 | Ratified |
| 012 | Simulation Engine | 2025-06 | Ratified |
| 013 | Enterprise Time Machine | 2026-07 | Ratified |
| 014 | Integration Framework | 2025-03 | Draft |
| 015 | Reporting Engine | 2025-03 | Draft |
| 016 | Command Center | 2025-06 | Ratified |
| 017 | Design System & Theme | 2024-01 | Ratified |
| 018 | Security Principles | 2024-01 | Ratified |
| 019 | Performance Strategy | 2025-01 | Draft |
| 020 | Future Expansion | 2025-01 | Draft |

---

## Key Decisions Summary

### ADR-001: Platform Vision & Scope
**Decision**: Build an enterprise financial operating system, not a fintech app or banking platform. Focus on treasury, payments, approvals, governance, risk, and audit.

### ADR-002: Multi-Tenant Architecture
**Decision**: Tenant isolation via `companyId` on every database entity. No shared schemas, no row-level security — application-level filtering with Prisma.

### ADR-003: Authentication & RBAC
**Decision**: NextAuth v5 with JWT strategy. RBAC with company-scoped roles, global permission catalog, and scope-typed role-permission assignments.

### ADR-004: Double-Entry Ledger
**Decision**: Traditional DEBIT/CREDIT double-entry with wallet-level balance tracking. Optimistic locking on wallet updates. No event sourcing — current state is the source of truth.

### ADR-005: Policy Engine
**Decision**: Declarative rule engine evaluated at transaction time. First-match-wins with priority ordering. Support for 5 policy types and 4 action types.

### ADR-006: Approval Engine
**Decision**: Configurable approval rules with priority, scope, amount thresholds, and escalation paths. Support for sequential, parallel, and dual approval modes.

### ADR-007: Risk Engine
**Decision**: Rule-based risk alert generation with 9 categories. Alert-to-incident grouping. Severity classification with status lifecycle.

### ADR-008: Treasury Architecture
**Decision**: Treasury accounts separate from wallets. Wallets are internal accounting constructs; treasury accounts represent external bank accounts. Plaid integration for account linking.

### ADR-009: Audit Architecture
**Decision**: Comprehensive audit logging for all financial state changes. Payload hashing for tamper evidence. No immutable storage yet — plan to add blockchain-style chaining.

### ADR-010: AI Copilot
**Decision**: Offline-first AI architecture. When API key is unset, the system provides structured data responses from the Knowledge Index. When API key is set, responses are generated with full context. Never autonomous — AI recommends, humans decide.

### ADR-011: Sandbox Architecture
**Decision**: Single pre-seeded enterprise tenant (Atlas Manufacturing Group) with one-click login. No multi-tenant sandbox yet. Seed data is generated programmatically, not stored as SQL dumps.

### ADR-012: Simulation Engine
**Decision**: Scenario-based simulation with orchestrated actions. 5 pre-built scenarios modify sandbox data. Actions are domain-specific (create transaction, generate alert, etc.).

### ADR-013: Enterprise Time Machine
**Decision**: Object versioning via dedicated `ObjectVersion` model. Full snapshots stored as JSON on each change. Field-level diff computed at query time. Applies to 6 entity types initially.

### ADR-014: Integration Framework
**Decision**: Connector abstraction with typed config, execution lifecycle, and event logging. Plaid as reference integration. Webhook delivery for event notifications.

### ADR-015: Reporting Engine
**Decision**: (Draft) Template-based report generation with scheduled delivery. Export targets: PDF, CSV, Excel, PowerPoint, JSON.

### ADR-016: Command Center (Persona System)
**Decision**: 8 persona profiles with custom priorities, focus modules, and system prompts. Persona selection affects AI response style, content, and recommendations. Persona is passed through API and stored in conversation.

### ADR-017: Design System & Theme
**Decision**: Dark theme with gold accent (#d4af37). Data-dense layout optimized for financial professionals. No light theme in initial release.

### ADR-018: Security Principles
**Decision**: Defense in depth with authentication, authorization (RBAC), tenant isolation (companyId), rate limiting, input validation (Zod), and audit logging as overlapping layers.

### ADR-019: Performance Strategy
**Decision**: (Draft) Server Components for data-heavy pages, cursor-based pagination for large datasets, background jobs for async operations, connection pooling for database.

### ADR-020: Future Expansion
**Decision**: (Draft) CQRS for complex queries, event sourcing for audit, read replicas for analytics, sharding for multi-region deployment, sub-millisecond P99 targets.
