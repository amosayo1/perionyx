# Tax Management — Enterprise Tax Engine

## Overview

Enterprise tax management platform supporting global organizations operating across multiple legal entities, jurisdictions, currencies, and tax regimes. Purpose-built for CFOs, Tax Directors, Controllers, and Auditors who require precision, audit readiness, and cross-jurisdictional compliance.

Zero external APIs. Zero tax SDKs. Zero ERP tax modules. Provider-agnostic. AI-ready.

## Architecture

```
src/server/tax/
  index.ts                              — Barrel exports, factory
  tax-seed.ts                           — Deterministic seed data
  services/
    tax-service.ts                      — Singleton facade composing all 15 domain services
  domain/
    rules/                              — TaxRuleService
    jurisdictions/                      — JurisdictionService
    indirect-tax/                       — IndirectTaxService
    direct-tax/                         — DirectTaxService
    withholding/                        — WithholdingTaxService
    transfer-pricing/                   — TransferPricingService
    calendar/                           — TaxCalendarService
    returns/                            — TaxReturnService
    payments/                           — TaxPaymentService
    reconciliation/                     — TaxReconciliationService
    compliance/                         — TaxComplianceService
    audit/                              — TaxAuditService
    analytics/                          — TaxAnalyticsService
    forecasting/                        — TaxForecastService
  types/index.ts                        — 20+ interfaces, 20+ type aliases

src/components/tax/
  tax-types.ts                          — Re-exports server types
  tax-dashboard.tsx                     — Consolidated dashboard
  tax-liability-overview.tsx            — Global tax liability card grid
  jurisdiction-map.tsx                  — Jurisdiction exposure visualization
  tax-rate-manager.tsx                  — Rate definition and management
  tax-return-tracker.tsx                — Return lifecycle table
  tax-payment-tracker.tsx               — Payment status table
  tax-compliance-dashboard.tsx          — Compliance score cards
  tax-audit-log-viewer.tsx              — Audit trail browser
  tax-analytics-panel.tsx               — KPI charts and alerts
  tax-forecast-view.tsx                 — Forecast visualization
  tax-executive-summary.tsx             — Executive narrative panel
  tax-insight-panel.tsx                 — AI-driven insights
  tax-reconciliation-view.tsx           — GL vs Tax reconciliation
  tax-transfer-pricing-view.tsx         — Intercompany pricing overview
  tax-withholding-view.tsx              — Withholding certificate management
  tax-deferred-tax-view.tsx             — Deferred tax analysis
  tax-compliance-heatmap.tsx            — Compliance heat map
  tax-filing-calendar.tsx               — Filing and payment calendar
  tax-alert-center.tsx                  — Alert management
  tax-recommendation-panel.tsx          — AI recommendation cards

src/app/(shell)/tax/                    — 14 page routes
```

## Core Domains

| # | Domain | Service | Purpose |
|---|--------|---------|---------|
| 1 | Tax Rules | `TaxRuleService` | Rates, conditions, effective dates, exemptions |
| 2 | Jurisdictions | `JurisdictionService` | Countries, states, regions, cities, authorities |
| 3 | Indirect Tax | `IndirectTaxService` | VAT, GST, Sales Tax, Reverse Charge, Exemptions |
| 4 | Direct Tax | `DirectTaxService` | CIT, Estimated, Deferred, Current provisioning |
| 5 | Withholding Tax | `WithholdingTaxService` | Supplier, Customer, Interest, Dividends, Royalties |
| 6 | Transfer Pricing | `TransferPricingService` | Intercompany pricing, Arm's Length Analysis |
| 7 | Calendar | `TaxCalendarService` | Filing deadlines, Payment deadlines, Reminders |
| 8 | Returns | `TaxReturnService` | Draft, Reviewed, Approved, Submitted, Amended |
| 9 | Payments | `TaxPaymentService` | Scheduled, Pending, Paid, Overpaid, Refunded |
| 10 | Reconciliation | `TaxReconciliationService` | GL vs Tax, Returns, Payments, Deferred |
| 11 | Compliance | `TaxComplianceService` | Scoring, risk levels, violations |
| 12 | Audit | `TaxAuditService` | Rule changes, Return changes, Approvals |
| 13 | Analytics | `TaxAnalyticsService` | KPIs, forecasts, alerts, recommendations |
| 14 | Forecasting | `TaxForecastService` | Liability forecasting with confidence bounds |

## Key Design Decisions

1. **In-memory stores** — all 15 domain services use `Map<string, T>` populated by deterministic seed data. Zero-config development. DB persistence (Prisma) planned.
2. **Singleton facade** — `taxService` composes all 15 domain services. Pages call `taxService.rules.getAll()` without instantiation.
3. **Provider-agnostic** — zero external tax APIs, zero tax SDKs. Tax rates and rules are defined in-system.
4. **AI-ready** — every domain model is structured for forecasting, anomaly detection, and executive narrative generation.
5. **Integration consuming only** — Tax consumes from Accounting, Treasury, Banking, FP&A, Procurement, O2C, Risk, and CRM. No modifications to existing modules.

## Page Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/tax` | TaxDashboard | Consolidated executive view |
| `/tax/rules` | TaxRateManager | Tax rule and rate management |
| `/tax/jurisdictions` | JurisdictionMap | Jurisdiction hierarchy and exposure |
| `/tax/indirect` | IndirectTaxView | VAT/GST/Sales Tax management |
| `/tax/direct` | DirectTaxView | Corporate income tax provisioning |
| `/tax/withholding` | WithholdingView | Withholding certificate and tracking |
| `/tax/transfer-pricing` | TransferPricingView | Intercompany pricing and analysis |
| `/tax/returns` | TaxReturnTracker | Return lifecycle management |
| `/tax/payments` | TaxPaymentTracker | Payment status and tracking |
| `/tax/reconciliation` | ReconciliationView | GL vs Tax reconciliation |
| `/tax/compliance` | ComplianceDashboard | Compliance scoring and violations |
| `/tax/audit` | AuditLogViewer | Audit trail browser |
| `/tax/analytics` | AnalyticsPanel | KPIs, charts, alerts |
| `/tax/forecast` | ForecastView | Tax liability forecasting |

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | Module architecture, data flow, integration points |
| [Tax Engine](./tax-engine.md) | Rate resolution, calculation pipeline, mixed rates |
| [Jurisdictions](./jurisdictions.md) | Jurisdiction hierarchy, authorities, tax numbers |
| [Indirect Tax](./indirect-tax.md) | VAT/GST/Sales Tax — transaction processing, returns |
| [Direct Tax](./direct-tax.md) | CIT provisioning, deferred tax, reconciliation |
| [Withholding Tax](./withholding.md) | Withholding types, certificates, treaties |
| [Transfer Pricing](./transfer-pricing.md) | Intercompany pricing, arm's length methods |
| [Returns](./returns.md) | Return lifecycle, multi-jurisdiction filing |
| [Payments](./payments.md) | Payment methods, estimated payments, refunds |
| [Compliance](./compliance.md) | Compliance scoring, risk, violations |
| [Audit](./audit.md) | Audit trail, tamper-evident logging |
| [KPIs](./kpis.md) | Complete KPI reference |
| [Executive Dashboard](./executive-dashboard.md) | Executive consolidated view |
| [AI Roadmap](./ai-roadmap.md) | AI/ML integration opportunities |
| [Developer Guide](./developer-guide.md) | How to extend the module |
