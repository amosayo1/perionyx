# Accounting Architecture

## Overview

The Enterprise Accounting module follows the same bounded-context, repository-pattern, service-layer architecture as all Perionyx enterprise domains. It is a fully self-contained module with zero external dependencies on accounting SDKs, ERP platforms, or third-party APIs.

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

## Module Structure

```
src/server/accounting/
  types/index.ts                    — All domain types (521 lines, 30+ interfaces)
  index.ts                          — Barrel exports
  accounting-seed.ts                — Deterministic seed data (5,000 journals, 2,000 accounts)
  services/
    accounting-service.ts           — Facade composing all 13 sub-services
  domain/
    chart-of-accounts-service.ts    — Account tree, search, CRUD
    journal-service.ts              — Journal entries, recurring journals
    posting-service.ts              — Posting batches, validation, duplicate detection
    ledger-service.ts               — Account balances, trial balance generation
    periods-service.ts              — Fiscal years, periods, close processes
    reconciliation-service.ts       — Bank/ledger/account reconciliation
    allocations-service.ts          — Allocation rules and runs
    intercompany-service.ts         — Due to/due from, intercompany settlements
    consolidation-service.ts        — Multi-entity consolidation with eliminations
    statements-service.ts           — Financial statement generation
    budgets-service.ts              — Budget management and variance analysis
    audit-service.ts                — Complete audit trail with field-level tracking
    analytics-service.ts            — KPI computation, forecasts, financial intelligence
  repositories/                     — Repository interfaces (Prisma-ready)
```

## Key Architecture Decisions

### In-Memory Store (Ephemeral)
All domain services currently use in-memory `Map<string, Entity>` stores, consistent with the treasury, investments, and risk modules. This provides fast development iteration with zero database coupling. The repository layer interfaces are defined and ready for Prisma migration when persistence is required.

### Facade Pattern
`AccountingService` is a singleton facade that composes all 13 domain services as public properties (`coa`, `journal`, `posting`, `ledger`, `periods`, `reconciliation`, `allocations`, `intercompany`, `consolidation`, `statements`, `budgets`, `audit`, `analytics`). This provides a single entry point for the entire accounting domain.

### String Literal Unions
All enumeration types use TypeScript string literal unions (e.g., `type AccountType = "asset" | "liability" | "equity" | ...`) rather than TypeScript enums. This matches the CRM module convention and provides better type safety with simpler serialization.

### Provider-Agnostic
No accounting SDKs, ERP SDKs, or external APIs are used. The module is fully self-contained and provider-agnostic.

## Integration Points

| Module | Integration |
|--------|-------------|
| Banking (9A) | Bank reconciliation, transaction import |
| Treasury (9B) | Cash position, liquidity, funding |
| Investments (9C) | Investment accounting, P&L recognition |
| Risk (9D) | Risk-adjusted financial reporting |
| CRM | Customer/vendor account mapping |
| Platform Core | Navigation, infrastructure, auth |

## AI Readiness

Every model includes metadata fields for:
- Journal Suggestions
- Auto Classification
- Posting Validation
- Variance Detection
- Close Recommendations
- Financial Narrative Generation
- Forecast Assistance
- Executive Insights
