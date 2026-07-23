# Consolidation Module Architecture

## Overview
The Consolidation module manages multi-entity financial consolidation across the enterprise. It handles group structure management, ownership tracking, currency translation, intercompany eliminations, minority interest, equity accounting, and consolidated financial statement generation. Designed for CFOs and Controllers managing complex group structures with multiple subsidiaries, joint ventures, and associates.

## Architecture Principles
- **Domain-driven** — Each consolidation sub-domain is an independent service
- **Facade pattern** — ConsolidationService composes all 16 sub-services
- **Singleton** — `consService` exported for server-side consumption
- **In-memory first** — Map-based storage with repository pattern readiness
- **No external APIs** — Provider-agnostic, zero external dependencies

## Directory Structure
```
src/server/consolidation/
  types/index.ts                    — All consolidation types, enums, interfaces (40+)
  index.ts                          — Barrel exports
  cons-seed.ts                      — Deterministic seed data
  services/
    consolidation-service.ts       — Facade + singleton
  domain/
    entity-management/              — Legal entity CRUD, search, filter
    group-structure/                — Tree hierarchy, ancestry, depth, rebuild
    ownership-management/           — Ownership records, effective ownership, scope
    consolidation-engine/           — Run lifecycle, step advancement, readiness scoring
    currency-translation/           — FX translation runs, CTA calculation, rate management
    intercompany-eliminations/      — IC matching, elimination, unmatched tracking
    minority-interest/              — Minority interest calculation and tracking
    equity-accounting/              — Equity method investment tracking
    consolidation-adjustments/      — Fair value, goodwill, PPA, restructuring adjustments
    financial-statements/           — BS, IS, CF, equity changes, trial balance generation
    board-reporting/                — Board report generation with sections and metrics
    management-reporting/           — Entity-level management report entries
    analytics/                      — KPIs, aggregate metrics, executive summary, reports
    recommendations/                — AI-powered elimination, translation, ownership recommendations
    alerts/                         — Consolidation alerts and notifications
    executive-insights/             — Executive summary and insights generation
    repositories/                   — Repository interface compatibility for Phase 7E
```

## Integration Points
| Module | Integration |
|---|---|
| General Ledger | Trial balance, consolidation adjustments, elimination journals |
| Financial Close | Consolidation run as close task, period synchronization |
| Treasury | FX exposure, cash position, intercompany loans |
| Tax | Tax basis adjustments, deferred tax on consolidation |
| Fixed Assets | Fair value adjustments, depreciation alignment |
| Accounts Payable | Intercompany payables matching |
| Accounts Receivable | Intercompany receivables matching |
| Executive AI | Consolidation readiness, risk predictions, variance explanations |
| Compliance | Audit trail, segregation of duties, consolidation compliance |
| Persistence Layer (7E) | Repository interface compatibility |
| Infrastructure Layer (7F) | Cache, queue, observability compatibility |
