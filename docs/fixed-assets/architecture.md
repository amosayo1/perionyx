# Fixed Assets Module Architecture

## Overview
The Fixed Assets module manages the complete lifecycle of enterprise capital assets from acquisition through disposal. It matches SAP S/4HANA Asset Accounting and Oracle Fusion Fixed Assets capabilities while integrating natively with the Perionyx platform.

## Architecture Principles
- **Domain-driven** — Each asset sub-domain is an independent service
- **Facade pattern** — FixedAssetsService composes all sub-services
- **Singleton** — `faService` exported for server-side consumption
- **In-memory first** — Map-based storage with repository pattern readiness
- **No external APIs** — Provider-agnostic, zero external dependencies

## Directory Structure
```
src/server/fixed-assets/
  types/index.ts                — All FA types, enums, interfaces (50+)
  index.ts                      — Barrel exports
  fa-seed.ts                    — Deterministic seed data (15 assets)
  services/
    fixed-assets-service.ts     — Facade + singleton
  domain/
    asset-registry/             — Core asset CRUD, search, filter, sort, pagination
    acquisition/                — Asset acquisition records
    capitalization/             — Asset capitalization and in-service activation
    depreciation/               — Depreciation calculation and schedule generation
    impairment/                 — Impairment detection and recording
    transfers/                  — Asset transfers between departments/cost centers
    maintenance/                — Preventive and corrective maintenance management
    disposals/                  — Asset disposal, sale, scrap, retirement
    revaluation/                — Asset revaluation (upward/downward)
    lease-accounting-readiness/ — Lease vs owned tracking, ASC 842/IFRS 16 compliance
    analytics/                  — KPIs, aggregate metrics, reports (CapEx, aging, maintenance, disposal)
    recommendations/            — AI-powered asset recommendations
    alerts/                     — System alerts and notifications
    executive-insights/         — Executive summary and insights generation
    repositories/               — Repository interface compatibility for Phase 7E
```

## Integration Points
| Module | Integration |
|---|---|
| General Ledger | Acquisition posting, depreciation journal, impairment, disposal gain/loss |
| Financial Close | Depreciation run as close task, asset reconciliation |
| Treasury | CapEx planning, cash forecasting, investment visibility |
| Tax | Tax depreciation vs book depreciation, deferred tax, capital allowances |
| Executive AI | Replacement recommendations, useful life predictions, utilization analysis |
| Compliance | Audit trail, segregation of duties, impairment compliance |
| Persistence Layer (7E) | Repository interface compatibility |
| Infrastructure Layer (7F) | Cache, queue, observability compatibility |
