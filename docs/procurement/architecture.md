# Procurement Architecture

## Overview

The Enterprise Procurement module follows the same bounded-context, repository-pattern, service-layer architecture as all Perionyx enterprise domains. It is a fully self-contained module with zero external dependencies on procurement SDKs, ERP platforms, or third-party APIs.

## Layer Architecture

```
Presentation (Pages)
    ↓
Components (React Client Components)
    ↓
Services (Facade + Domain Services)
    ↓
Repositories (In-Memory → Prisma)
    ↓
PostgreSQL (via Prisma)
```

## Directory Structure

```
src/app/(shell)/procurement/       — 11 page routes
src/components/procurement/        — UI components
src/server/procurement/            — Server-side domain logic
  types/index.ts                   — All domain types
  index.ts                         — Barrel exports
  procurement-seed.ts              — Deterministic seed data
  services/
    procurement-service.ts         — Facade composing all 12 sub-services
  domain/
    vendors-service.ts             — Vendor lifecycle, risk scoring, performance tracking
    purchase-requests-service.ts   — PR lifecycle, budget validation, conversion to PO
    purchase-orders-service.ts     — PO types, amendments, fulfillment tracking
    receiving-service.ts           — Goods/service receipt matching
    invoice-matching-service.ts    — 2-way/3-way matching with tolerance rules
    approvals-service.ts           — Multi-level approval routing, delegation, escalation
    payments-service.ts            — Payment scheduling and execution tracking
    contracts-service.ts           — Contract lifecycle, renewal management
    catalog-service.ts             — Item catalog for procurement
    expenses-service.ts            — Spend analytics, KPIs, forecasts
    analytics-service.ts           — Alerts and recommendations engine
    forecast-service.ts            — Procurement spend forecasting
docs/procurement/                  — Documentation
```

## Key Architecture Decisions

### In-Memory Store (Ephemeral)
All domain services currently use in-memory `Map<string, Entity>` stores. This provides fast development iteration with zero database coupling. The repository layer interfaces are defined and ready for Prisma migration when persistence is required.

### Facade Pattern
`ProcurementService` is a singleton facade that composes all 12 domain services as public properties (`vendors`, `purchaseRequests`, `purchaseOrders`, `contracts`, `catalog`, `receiving`, `invoiceMatching`, `approvals`, `payments`, `expenses`, `analytics`, `forecast`). This provides a single entry point for the entire procurement domain.

### String Literal Unions
All enumeration types use TypeScript string literal unions (e.g., `type PRStatus = "draft" | "submitted" | "approved" | ...`) rather than TypeScript enums. This matches the CRM and accounting module convention and provides better type safety with simpler serialization.

### Provider-Agnostic
No procurement SDKs, ERP SDKs, or external APIs are used. The module is fully self-contained and provider-agnostic.

### Status-Driven Workflow
Each domain entity (vendor, PR, PO, receipt, invoice, contract) has a clear status lifecycle with documented state transitions. Status changes are explicit and auditable.

## Integration Points

| Module | Integration |
|--------|-------------|
| Accounting (7A) | Invoice posting, accrual entries, budget GL integration |
| Treasury (9B) | Payment scheduling, cash position impact |
| Risk (9D) | Vendor risk scoring, procurement fraud detection |
| FP&A (Planning) | Budget consumption, spend forecasting |
| Automation Studio | Approval workflow automation, PO auto-generation |
| Platform Core | Navigation, infrastructure, auth |
