---
id: technology-stack
title: Technology Stack
sidebar_label: Technology Stack
description: Core framework, data layer, authentication, infrastructure, UI, validation, and observability technologies powering Perionyx.
---

# Technology Stack

## Overview

Perionyx v1.0.0 is built on a modern JavaScript/TypeScript stack with PostgreSQL as the primary data store. Every dependency was selected for enterprise-grade requirements: strict typing, predictable performance, audit-ready logging, and zero-compromise security.

## Core Framework

### Next.js 16.2.6

**Why:** React Server Components by default, App Router, edge runtime support. The `src/proxy.ts` replaces the deprecated middleware pattern and handles auth extraction, rate limiting, CSRF, correlation ID generation, request timing, and locale detection at the edge.

**Alternatives considered:** None — the platform requires React Server Components for financial data rendering performance and App Router for the 96+ page route structure.

### React 19.2.4

**Why:** Server Components by default minimizes client-side JavaScript for financial dashboards. Client components are used only where interactivity is required (forms, wizards, charts, drag-and-drop workflow design).

### TypeScript 5.9.3 (strict mode)

**Why:** Strict mode catches entire classes of bugs at compile time. The codebase enforces zero TypeScript errors at build. All 56 modules, 272+ API endpoints, and 15+ enterprise component libraries are fully typed.

## Data Layer

### Prisma 7.8

**Why:** Type-safe database access, auto-generated TypeScript types from schema, migration system with rollback support. Prisma Client provides compile-time query validation.

**Alternatives considered:** Drizzle ORM (schema-first approach chosen for established migration tooling), TypeORM (abandoned due to maintenance concerns).

### PostgreSQL

**Why:** Mature relational database with JSONB support for flexible config/metadata columns. Transactional integrity is non-negotiable for double-entry accounting. PG-stored procedures handle critical financial validations.

**Features used:** JSONB columns for flexible config, foreign key enforcement with `companyId` scoping, indexed columns for 18+ performance-critical queries.

### PgBoss 12.24

**Why:** PostgreSQL-backed queue system eliminates the need for a separate queue infrastructure. Jobs are durable by default (stored in PostgreSQL). Supports scheduled, delayed, and priority queues.

**Job types:** notification-delivery, workflow-execution, AI-scoring, report-generation, connector-sync, and 5 more (9 total job types across `src/modules/queue/`, 13 files).

## Authentication & Authorization

### next-auth 5.0.0-beta.31

**Why:** Native integration with Next.js App Router, Prisma adapter for user persistence, JWT session strategy for stateless auth, Credentials provider for enterprise SSO integration.

**Session strategy:** JWT (no database lookups on every request). Tenant context extracted from JWT in the edge proxy.

### IAM (Custom, `src/server/iam/`)

Custom-built RBAC/ABAC engine with 46+ permissions in `PermissionRegistry`. Supports MFA, SSO (SAML/OIDC), session management, and audit logging. Permission checks are enforced at the API route level and in service facades.

## Infrastructure

| Technology | Version | Purpose |
|---|---|---|
| ioredis | 5.11.1 | Distributed caching, lock management, rate limiting counters |
| CacheManager | Custom | LRU in-memory + Redis tiered cache with namespaced keys |
| LockManager | Custom | In-memory + Redis distributed locks with lease renewal |
| QueueManager | Custom | Facade over PgBoss with dead-letter routing, worker pools |
| MetricsRegistry | Custom | Counter/Gauge/Histogram types, Prometheus exposition |
| Pino | 10.3.1 | Structured JSON logging with configurable levels, OpenTelemetry bridge |

## UI & Presentation

| Technology | Version | Purpose |
|---|---|---|
| Tailwind CSS | 4.3 | Utility-first styling, design token system |
| framer-motion | 12.42.1 | Declarative animations, gesture handling, layout animations |
| Motion tokens | Custom | 6 easing curves, 12 animation variants (fade, scale, slide, stagger, shimmer) |

**Why framer-motion over alternatives:** AnimatePresence for mount/unmount animations, layout animations for list reordering, gesture support for drag-and-drop workflow designer. No other React animation library offers the same combination of features with comparable bundle size.

## Validation

### zod 4.4.3

**Why:** TypeScript-first schema validation with inferred types. Used for API request validation, form validation, configuration validation, and domain object validation. Combined with `zodErrorResponse()` for consistent API error formatting across all endpoints.

## Observability

| Tool | Purpose |
|---|---|
| prom-client 14.2 | Prometheus metrics exposition |
| Pino 10.3.1 | Structured JSON logging with correlation IDs |
| OpenTelemetry | Vendor-neutral observability bridge |
| HealthRegistry | 5 standard checks (cache, memory, uptime, queues, persistence) |
| MetricsRegistry | 8 metric domains (API, cache, queue, finance, auth, integration, workflow, ai) |

## Development & Build

| Tool | Version | Purpose |
|---|---|---|
| pnpm | latest | Package manager (workspace support, deterministic installs) |
| vitest | latest | Unit/integration testing (443 tests, all passing) |
| TypeScript | 5.9.3 | Compilation, type checking |
| bundle-analyzer | @next/bundle-analyzer | Bundle size analysis via `pnpm analyze` |

## Why Not...

| Technology | Reason Not Chosen |
|---|---|
| GraphQL | REST with Cache-Control headers is simpler for financial data queries; no need for GraphQL's flexible querying |
| MongoDB | Transactional integrity required for double-entry accounting — PostgreSQL's ACID compliance is mandatory |
| Redis-only queues | PgBoss leverages PostgreSQL durability; no separate Redis persistence needed |
| NextAuth v4 | v5 beta provides better App Router integration and edge compatibility |
| SCSS / CSS Modules | Tailwind's utility approach reduces CSS bundle size and enforces design consistency |
