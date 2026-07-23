# AR Module Architecture

## Overview
The Accounts Receivable (AR) module is a production-grade enterprise capability covering the complete customer receivables lifecycle. Built as an in-memory domain service following the Perionyx Platform Core v1.0 Architecture Freeze.

## Architecture Principles
- **No breaking changes** to existing modules
- **No external APIs** — provider-agnostic
- **Domain-driven** — each sub-domain is an independent service
- **Facade pattern** — AccountsReceivableService composes all sub-services
- **Singleton** — `arService` exported for server-side consumption
- **In-memory first** — Map-based storage with repository pattern readiness

## Directory Structure
```
src/server/accounts-receivable/
  types/index.ts            — All AR types, enums, interfaces
  index.ts                  — Barrel exports
  ar-seed.ts                — Deterministic seed data
  services/
    accounts-receivable-service.ts  — Facade + singleton
  domain/
    customers/              — Customer management
    invoices/               — Invoice lifecycle
    receipts/               — Payment receipts
    cash-application/       — Receipt matching and allocation
    collections/            — Collection queue and activities
    customer-credit/        — Credit limits and reviews
    disputes/               — Dispute management
    adjustments/            — Credit/debit notes
    write-offs/             — Bad debt management
    statements/             — Customer statements
    analytics/              — KPIs and metrics
    forecasting/            — Cash inflow forecasts
    recommendations/        — AI-powered recommendations
    alerts/                 — System alerts
    reporting/              — Aging, DSO, CEI reports
    gl-integration/         — General Ledger journal entries
    treasury-integration/   — Cash position and liquidity
    tax-integration/        — VAT, GST, Withholding
```

## Integration Points
| Module | Integration |
|---|---|
| General Ledger | Invoice/receipt/write-off journal entries |
| Treasury | Cash position impact, liquidity forecasts |
| Tax | VAT/GST/Sales tax calculation, withholding |
| Executive AI | Recommendations, predictions, insights |
| Compliance | Audit trail, permission checks |
| Persistence Layer (7E) | Repository interface compatibility |
| Infrastructure Layer (7F) | Observability, health checks |
