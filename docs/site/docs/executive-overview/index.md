---
id: index
title: Executive Overview
sidebar_label: Overview
slug: /executive-overview/
description: Platform vision, philosophy, positioning, and key metrics
---

# Executive Overview: Perionyx Enterprise Financial Platform

## What Perionyx Is

Perionyx is an enterprise financial operations platform purpose-built for **CFOs, treasurers, controllers, finance managers, and auditors**. It unifies treasury management, double-entry ledger, financial reporting, risk management, compliance monitoring, intelligence, and workflow automation into a single multi-tenant platform.

**Positioning:** *Bloomberg Terminal meets Stripe Dashboard for enterprise finance.*

## Product Philosophy

Five ordered principles drive every architectural and design decision:

| Principle | Definition |
|-----------|------------|
| **Clarity** | Every screen answers one question; no visual noise. Metrics render first, explanations second. |
| **Confidence** | Stale data is labeled. Destructive actions require confirmation. Cached balances are marked. |
| **Speed** | CFOs don't wait. Metric values render before charts. Page transitions complete in under 400ms. |
| **Beauty** | Achieved through restraint — generous whitespace, consistent rhythm, purposeful color. |
| **Trust** | Every number has a source. Every state has an explanation. Audit trails are unbroken. |

## Enterprise Positioning

The platform occupies the intersection of three design influences:

- **Bloomberg Terminal** — density of financial information, keyboard-driven workflows, real-time status awareness
- **Stripe Dashboard** — clarity of UX, progressive disclosure, developer-friendly API patterns
- **Mercedes S-Class interior** — restraint, material quality, every element serves a purpose

## Platform Objectives

| Objective | Status |
|-----------|--------|
| Unify treasury, ledger, reporting, risk, compliance, intelligence, and workflow automation | v1.0 complete |
| Eliminate spreadsheet-based financial workflows | Core workflows automated |
| Provide audit-ready transparency at every step | Full audit trail, tamper-evident design |
| Enable AI-assisted financial analysis without compromising audit integrity | AI commentary layer, no AI in system of record |
| Support multi-tenant deployments with tenant isolation | Company model, every table scoped |

## Core Principles

### Multi-tenant by Design

Every database table carries a `companyId` column. The `requireTenantContext()` guard enforces tenant isolation at the application layer. No cross-tenant data access is possible without explicit architectural override.

### Financial Facts Are Deterministic

Journal entries, ledger balances, and audit logs are immutable once committed. Reversals create new entries with cross-references — they never mutate historical records. The system of record is append-only for financial transactions.

### AI Explains But Never Becomes the System of Record

The Intelligence Platform (6 scoring engines, 14 files in `src/modules/intelligence-platform/`) provides commentary, anomaly detection, and forecast suggestions. All AI output is labeled as generated. AI never posts journals, approves transactions, or mutates financial state without human confirmation.

### Audit Trails Are Unbreakable

Every mutation that affects financial data, security configuration, approvals, or permissions calls `recordAudit()` or `recordIAMAudit()`. The audit log is append-only and includes actor identity, timestamp, before/after state, IP address, correlation ID, and tenant context.

## Version & Release

| Property | Value |
|----------|-------|
| Platform version | v1.0.0 |
| Release date | 2026-07-09 |
| Next.js | 16.2.6 |
| React | 19.2.4 |
| TypeScript | 5.9.3 (strict mode) |
| Prisma | 7.8 |
| Database | PostgreSQL |
| Business modules | 56 (`src/modules/`) |
| Permissions | 46+ in `PermissionRegistry` |
| Zero TypeScript errors | Enforced at build |

## Architecture Documentation Index

| Document | Location |
|----------|----------|
| Executive Overview | `docs/architecture/01-executive-overview.md` |
| System Architecture | `docs/architecture/02-system-architecture.md` |
| Technology Stack | `docs/architecture/03-technology-stack.md` |
| Domain Architecture | `docs/architecture/04-domain-architecture.md` |
| Architecture Freeze v1 | `docs/architecture/architecture-freeze-v1.md` |
| Engineering Constitution | `docs/architecture/perionyx-engineering-constitution.md` |
| Performance Constitution | `docs/architecture/performance-constitution.md` |
| AI Engineering Playbook | `docs/architecture/ai-engineering-playbook.md` |
| Enterprise Readiness Checklist | `docs/architecture/enterprise-readiness-checklist.md` |
| Self-Review Framework | `docs/architecture/self-review-framework.md` |
