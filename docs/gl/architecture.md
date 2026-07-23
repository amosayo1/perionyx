# General Ledger Architecture

## Overview

The General Ledger (GL) module is Perionyx's enterprise accounting engine, comparable to SAP S/4HANA Finance, Oracle Fusion Financials, Microsoft Dynamics 365 Finance, and Workday Financials.

## Architecture

The GL module follows the same architecture as other Perionyx enterprise modules:

- **Domain Model**: Pure TypeScript types with string literal unions
- **In-Memory Services**: Map-based CRUD with query methods
- **Facade Pattern**: `GeneralLedgerService` composes 11 domain services
- **Repository Layer**: Interface + InMemory implementation
- **Seed Data**: Comprehensive deterministic seed

## Components

### Server (`src/server/gl/`)
- `types/index.ts` — 40+ interfaces, 20+ type aliases
- `domain/chart-of-accounts/` — ChartOfAccountsService
- `domain/journals/` — JournalService
- `domain/posting/` — PostingService
- `domain/periods/` — PeriodsService
- `domain/ledger/` — LedgerService
- `domain/subledger/` — SubLedgerService
- `domain/allocations/` — AllocationService
- `domain/revaluation/` — RevaluationService
- `domain/consolidation/` — ConsolidationService
- `domain/financial-statements/` — FinancialStatementService
- `domain/analytics/` — AnalyticsService
- `services/gl-service.ts` — Facade + singleton
- `repositories/gl-repository.ts` — Interface + InMemory
- `gl-seed.ts` — Deterministic seed data

### UI (`src/components/gl/`)
- 20+ dashboard/board components
- 10 inline SVG chart components
- Dark theme, RTL compatible, accessible

## Integration Points

| Module | GL Integration |
|---|---|
| Treasury | Posts treasury journals |
| Tax | Posts tax journals |
| Investments | Posts investment journals |
| Order-to-Cash | Posts revenue journals |
| Procurement | Posts AP journals |
