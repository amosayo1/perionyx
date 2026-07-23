# Financial Close Module Architecture

## Overview
The Financial Close & Reconciliation module orchestrates month-end, quarter-end, and year-end financial close across the enterprise. It matches SAP S/4HANA Financial Close and BlackLine capabilities while integrating natively with the Perionyx platform.

## Architecture Principles
- **Domain-driven** — Each close sub-domain is an independent service
- **Facade pattern** — FinancialCloseService composes all sub-services
- **Singleton** — `fcService` exported for server-side consumption
- **In-memory first** — Map-based storage with repository pattern readiness
- **No external APIs** — Provider-agnostic, zero external dependencies

## Directory Structure
```
src/server/financial-close/
  types/index.ts                — All FC types, enums, interfaces
  index.ts                      — Barrel exports
  fc-seed.ts                    — Deterministic seed data
  services/
    financial-close-service.ts  — Facade + singleton
  domain/
    close-management/           — Period lifecycle (start, complete, reopen, lock)
    close-calendar/             — Deadlines, meetings, reviews
    task-engine/                — Close task orchestration, dependencies
    checklist-engine/           — Pre/post close checklists
    reconciliation/             — Bank, GL, subledger, AR/AP reconciliations
    account-reconciliation/     — Account-level balance comparisons
    intercompany-reconciliation/ — Cross-entity balance matching
    journal-review/             — Journal entry review and flagging
    approvals/                  — Approval workflow and queue
    variance-analysis/          — Period-over-period variance calculation
    close-dashboard/            — Progress and readiness scoring
    close-analytics/            — KPIs and aggregate metrics
    recommendations/            — AI-powered task/exception recommendations
    alerts/                     — System alerts and notifications
    executive-insights/         — Executive summary and insights generation
```

## Integration Points
| Module | Integration |
|---|---|
| General Ledger | Period close, trial balance, journal review |
| Treasury | Cash position, liquidity, investments |
| Tax | Tax journals, accruals, deferred tax |
| Accounts Receivable | AR reconciliation, aging |
| Accounts Payable | AP reconciliation |
| Compliance | Audit trail, segregation of duties |
| Executive AI | Close readiness, risk predictions |
| Persistence Layer (7E) | Repository interface compatibility |
