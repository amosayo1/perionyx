---
id: intro
title: Introduction
sidebar_label: Introduction
slug: /
description: Perionyx Enterprise Financial Operating System — Architecture Handbook
---

# Perionyx Architecture Handbook

Welcome to the **Perionyx Architecture Handbook** — the single source of truth for the Perionyx Enterprise Financial Operating System.

## What This Handbook Contains

This handbook documents the complete architecture, design decisions, and engineering standards for the Perionyx platform. It is organized into 14 primary domains:

| Domain | Description |
|--------|-------------|
| [Executive Overview](./executive-overview/) | Platform vision, philosophy, and key metrics |
| [Architecture](./architecture/system-overview/) | Seven-layer system design and technology stack |
| [Financial Platform](./financial-platform/) | Double-entry accounting, ledger, and transactions |
| [Treasury](./treasury/) | Cash management, liquidity, FX, and forecasting |
| [Reporting](./reporting/) | Financial statements, analytics, and exports |
| [Integrations](./integrations/) | Connectors, Plaid, webhooks, and data lineage |
| [Intelligence](./intelligence/) | 6 deterministic engines, KPIs, and scorecards |
| [Workflow Engine](./workflow-engine/) | Orchestration, automation, and scheduling |
| [Security](./security/) | Authentication, authorization, encryption, and audit |
| [Multi-tenancy](./multi-tenancy/) | Tenant isolation and data boundaries |
| [AI Governance](./ai-governance/) | Trust model, evidence requirements, and principles |
| [Engineering Standards](./engineering-standards/) | Coding standards, testing, and constitutions |
| [ADRs](./adrs/) | 30 Architecture Decision Records |
| [Roadmap](./roadmap/) | Completed phases and future timeline |

## Platform at a Glance

| Metric | Value |
|--------|-------|
| Platform Version | **v1.0.0** |
| Business Modules | 56 |
| API Endpoints | 272+ |
| Pages | 96+ |
| Prisma Models | 100+ |
| Permissions | 46+ |
| Intelligence Engines | 6 |
| Tests | 443+ (all passing) |
| TypeScript Errors | Zero (enforced at build) |

## Quick Start

- **New to Perionyx?** Start with the [Executive Overview](./executive-overview/)
- **Engineering onboarding?** See [Architecture](./architecture/system-overview/) and [Engineering Standards](./engineering-standards/)
- **Security review?** Go to [Security](./security/) and [Multi-tenancy](./multi-tenancy/)
- **Technical due diligence?** Read [Architecture](./architecture/system-overview/), [Financial Platform](./financial-platform/), and [AI Governance](./ai-governance/)

## Version Information

| Property | Value |
|----------|-------|
| Platform Version | v1.0.0 |
| Architecture Version | v1.0 |
| Release Date | 2026-07-09 |
| Status | **Ratified** |
| Classification | Confidential |

---

*This handbook is the master reference for the Perionyx platform architecture. All documentation is in `docs/` unless otherwise noted.*
