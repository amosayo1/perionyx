---
id: adr-list
title: Architecture Decision Records
sidebar_label: ADR List
---

# Architecture Decision Records

This page lists all Architecture Decision Records (ADRs) for the Perionyx platform. Each ADR documents a significant architectural decision, including the context, decision, consequences, and alternatives considered.

ADRs are stored in `docs/adr/` and follow a sequential numbering convention.

---

## ADR Index

| # | Title | File |
|---|-------|------|
| ADR-001 | Platform Vision & Scope | [001-platform-vision.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/001-platform-vision.md) |
| ADR-002 | Multi-Tenant Architecture | [002-multi-tenant-architecture.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/002-multi-tenant-architecture.md) |
| ADR-003 | Authentication & RBAC | [003-authentication-and-rbac.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/003-authentication-and-rbac.md) |
| ADR-004 | Double-Entry Ledger | [004-double-entry-ledger.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/004-double-entry-ledger.md) |
| ADR-005 | Policy Engine | [005-policy-engine.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/005-policy-engine.md) |
| ADR-006 | Approval Engine | [006-approval-engine.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/006-approval-engine.md) |
| ADR-007 | Risk Engine | [007-risk-engine.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/007-risk-engine.md) |
| ADR-008 | Treasury Architecture | [008-treasury-architecture.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/008-treasury-architecture.md) |
| ADR-009 | Audit Architecture | [009-audit-architecture.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/009-audit-architecture.md) |
| ADR-010 | AI Copilot | [010-ai-copilot.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/010-ai-copilot.md) |
| ADR-011 | Sandbox Architecture | [011-sandbox-architecture.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/011-sandbox-architecture.md) |
| ADR-012 | Simulation Engine | [012-simulation-engine.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/012-simulation-engine.md) |
| ADR-013 | Enterprise Time Machine | [013-enterprise-time-machine.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/013-enterprise-time-machine.md) |
| ADR-014 | Integration Framework | [014-integration-framework.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/014-integration-framework.md) |
| ADR-015 | Reporting Engine | [015-reporting-engine.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/015-reporting-engine.md) |
| ADR-016 | Command Center (Persona System) | [016-command-center.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/016-command-center.md) |
| ADR-017 | Design System | [017-design-system.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/017-design-system.md) |
| ADR-018 | Security Principles | [018-security-principles.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/018-security-principles.md) |
| ADR-019 | Performance Strategy | [019-performance-strategy.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/019-performance-strategy.md) |
| ADR-020 | Future Expansion | [020-future-expansion.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/020-future-expansion.md) |
| ADR-021 | PostgreSQL as Primary Database | [021-postgresql.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/021-postgresql.md) |
| ADR-022 | Prisma ORM | [022-prisma.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/022-prisma.md) |
| ADR-023 | Next.js 16 with React 19 | [023-nextjs.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/023-nextjs.md) |
| ADR-024 | Application-Level Multi-Tenancy | [024-multi-tenancy.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/024-multi-tenancy.md) |
| ADR-025 | Domain-Driven Modular Architecture | [025-domain-architecture.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/025-domain-architecture.md) |
| ADR-026 | Enterprise Integration Plugin Framework | [026-integration-framework.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/026-integration-framework.md) |
| ADR-027 | Workflow Orchestration Engine | [027-workflow-orchestration.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/027-workflow-orchestration.md) |
| ADR-028 | Financial Intelligence Platform | [028-intelligence-platform.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/028-intelligence-platform.md) |
| ADR-029 | AI Governance — Deterministic Financial Facts, AI Only Explains | [029-ai-governance.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/029-ai-governance.md) |
| ADR-030 | Event-Driven Architecture via Internal Event Bus | [030-event-driven-architecture.md](https://github.com/perionyx/vaultareloaded/blob/main/docs/adr/030-event-driven-architecture.md) |

---

## Categories

### Platform Foundation
- ADR-001: Platform Vision & Scope
- ADR-021: PostgreSQL as Primary Database
- ADR-022: Prisma ORM
- ADR-023: Next.js 16 with React 19
- ADR-025: Domain-Driven Modular Architecture

### Multi-Tenancy & Security
- ADR-002: Multi-Tenant Architecture
- ADR-003: Authentication & RBAC
- ADR-011: Sandbox Architecture
- ADR-018: Security Principles
- ADR-024: Application-Level Multi-Tenancy

### Financial Core
- ADR-004: Double-Entry Ledger
- ADR-008: Treasury Architecture
- ADR-009: Audit Architecture

### Governance & Compliance
- ADR-005: Policy Engine
- ADR-006: Approval Engine
- ADR-007: Risk Engine
- ADR-029: AI Governance

### AI & Intelligence
- ADR-010: AI Copilot
- ADR-012: Simulation Engine
- ADR-013: Enterprise Time Machine
- ADR-028: Financial Intelligence Platform

### Integration & Connectivity
- ADR-014: Integration Framework
- ADR-026: Enterprise Integration Plugin Framework

### User Experience
- ADR-015: Reporting Engine
- ADR-016: Command Center (Persona System)
- ADR-017: Design System

### Infrastructure & Operations
- ADR-019: Performance Strategy
- ADR-027: Workflow Orchestration Engine
- ADR-030: Event-Driven Architecture via Internal Event Bus

### Future Planning
- ADR-020: Future Expansion
