# Tax Module Architecture

## Directory Structure

```
src/server/tax/
  index.ts                              — Barrel exports
  tax-seed.ts                           — Deterministic seed data
  services/
    tax-service.ts                      — Singleton facade composing all 15 domain services
  domain/
    rules/tax-rules-service.ts          — TaxRuleService (CRUD, rate resolution, exemptions)
    jurisdictions/jurisdictions-service.ts — JurisdictionService (hierarchy, authorities, numbers)
    indirect-tax/indirect-tax-service.ts — IndirectTaxService (VAT/GST/Sales Tax processing)
    direct-tax/direct-tax-service.ts    — DirectTaxService (CIT, deferred, estimated)
    withholding/withholding-service.ts  — WithholdingTaxService (certificates, recoverable)
    transfer-pricing/tp-service.ts      — TransferPricingService (intercompany, methods)
    calendar/calendar-service.ts        — TaxCalendarService (deadlines, reminders)
    returns/returns-service.ts          — TaxReturnService (lifecycle, amendments)
    payments/payments-service.ts        — TaxPaymentService (schedules, payments, refunds)
    reconciliation/reconciliation-service.ts — TaxReconciliationService (GL vs Tax, returns)
    compliance/compliance-service.ts    — TaxComplianceService (scoring, violations)
    audit/audit-service.ts              — TaxAuditService (event logging, trail)
    analytics/analytics-service.ts      — TaxAnalyticsService (KPIs, alerts, recommendations)
    forecasting/forecast-service.ts     — TaxForecastService (liability forecasts)
  types/index.ts                        — All Tax domain types (20+ interfaces)

src/components/tax/
  tax-types.ts                          — Re-exports server types
  tax-dashboard.tsx                     — Consolidated executive dashboard
  tax-liability-overview.tsx            — Global tax liability KPI cards
  jurisdiction-map.tsx                  — Jurisdiction hierarchy visualization
  tax-rate-manager.tsx                  — Tax rate CRUD and history table
  tax-return-tracker.tsx                — Return lifecycle status table
  tax-payment-tracker.tsx               — Payment schedule and status table
  tax-compliance-dashboard.tsx          — Compliance score cards and violations
  tax-audit-log-viewer.tsx              — Filterable audit trail table
  tax-analytics-panel.tsx               — KPI charts, alerts, recommendations
  tax-forecast-view.tsx                 — Forecast chart with confidence bounds
  tax-executive-summary.tsx             — Computed insight cards
  tax-insight-panel.tsx                 — AI-driven insight cards
  tax-reconciliation-view.tsx           — GL vs Tax comparison table
  tax-transfer-pricing-view.tsx         — Intercompany transaction table
  tax-withholding-view.tsx              — Certificate and recoverable table
  tax-deferred-tax-view.tsx             — Deferred tax asset/liability table
  tax-compliance-heatmap.tsx            — Jurisdiction-by-dimension compliance matrix
  tax-filing-calendar.tsx               — Calendar view of upcoming deadlines
  tax-alert-center.tsx                  — Alert severity list with actions
  tax-recommendation-panel.tsx          — Recommendation cards with impact

src/app/(shell)/tax/                    — 14 page routes
```

## Layer Architecture

```
┌─────────────────────────────────────┐
│  Page Routes (server components)    │
│  src/app/(shell)/tax/*              │
├─────────────────────────────────────┤
│  Client Components                  │
│  src/components/tax/*                │
├─────────────────────────────────────┤
│  Domain Services (stateless)        │
│  src/server/tax/domain/*             │
├─────────────────────────────────────┤
│  Repositories (in-memory → Prisma)  │
│  src/server/tax/*/repo              │
└─────────────────────────────────────┘
```

**Page routes** are server components that call `taxService` methods and pass data as props to client components. Data fetching remains server-side with zero client-side data loading.

**Client components** are pure presentational — they receive typed data via props and render tables, charts, and cards. All are `"use client"` with no server-side dependencies.

**Domain services** hold business logic and in-memory data stores. Each service is independently instantiated and testable. The `TaxService` facade composes all 15 domain services.

## Data Flow

```
External Modules ──► Tax Domain Services ──► TaxService Facade ──► Page Routes ──► Components
     ▲                                         │
     │                                         ▼
Accounting, Treasury,                    TaxAnalyticsService
Banking, FP&A, Procurement,              TaxForecastService
O2C, Risk, CRM                              │
                                           ▼
                                    KPIs, Alerts,
                                    Recommendations,
                                    Forecasts
```

## Key Design Decisions

1. **Singleton facade**: `taxService` is a singleton that composes all 15 domain services. Pages call `taxService.jurisdictions.getAll()` etc. without instantiating anything.

2. **In-memory stores**: All domain services use in-memory `Map<string, T>` stores populated by deterministic seed data. This enables zero-configuration development and testing. Database persistence (Prisma) is planned, following the patterns in `src/server/persistence/`.

3. **Components import from tax-types**: All Tax components import types from `./tax-types.ts` which re-exports server types. This creates a clean dependency boundary — components never import directly from server modules.

4. **Server-side data fetching**: All `page.tsx` files call service methods synchronously and pass data as props. No `useEffect`, no SWR, no client-side data fetching.

5. **Custom SVG charts**: No external chart libraries. All charts render inline SVG with Tailwind styling, consistent with the platform's zero-external-dependency approach.

6. **Consuming-only integration**: Tax reads from Accounting (GL accounts, journal entries), Treasury (cash positions, FX rates), Banking (payment confirmations), FP&A (forecast assumptions), Procurement (vendor data), O2C (invoices, credit notes), Risk (counterparty risk scores), CRM (customer data). Tax does not modify data in other modules.

## Integration Points

| Integration | Mechanism |
|-------------|-----------|
| Accounting (GL) | Reads `accountCode` from invoice items for indirect tax; reads GL balances for deferred tax computation; posts tax journal entries via GL account codes |
| Treasury | Reads cash position and FX rates for cross-currency tax payments and forecasts |
| Banking | Reads payment confirmations for tax payment reconciliation |
| FP&A | Reads forecast assumptions for tax forecasting models |
| Procurement | Reads vendor tax registration data for withholding tax setup |
| O2C | Reads sales invoices and credit notes for output VAT/GST computation |
| Risk | Reads counterparty risk scores for withholding tax risk assessment |
| CRM | Reads customer tax registration and exemption data |
| AI Platform | TaxAnalyticsService provides KPI/alert/recommendation data for AI insights; TaxForecastService provides forecast data for AI narrative generation |
| Audit | All tax domain entities carry `createdAt`/`updatedAt/`createdBy`/`updatedBy` for audit trail integrity |

## AI Readiness Annotations

Every domain service is annotated with AI-ready metadata:

```typescript
interface AIReadiness {
  /** Whether this domain supports forecasting */
  forecastable: boolean;
  /** Whether this domain supports anomaly detection */
  anomalyDetection: boolean;
  /** Whether this domain supports executive narrative generation */
  narrativeReady: boolean;
  /** Data sources this domain consumes for AI features */
  dataSources: string[];
}
```

| Domain | Forecastable | Anomaly Detection | Narrative Ready |
|--------|-------------|-------------------|-----------------|
| Tax Rules | No | Yes | No |
| Jurisdictions | No | Yes | No |
| Indirect Tax | Yes | Yes | Yes |
| Direct Tax | Yes | Yes | Yes |
| Withholding | Yes | Yes | Yes |
| Transfer Pricing | Yes | Yes | Yes |
| Calendar | No | No | No |
| Returns | Yes | Yes | Yes |
| Payments | Yes | Yes | Yes |
| Reconciliation | No | Yes | Yes |
| Compliance | Yes | Yes | Yes |
| Audit | No | Yes | No |
| Analytics | Yes | Yes | Yes |
| Forecasting | Yes | Yes | Yes |

## Testing Strategy

- **Unit tests**: Each domain service tested independently with mock stores. Focus on rate resolution, calculation logic, and state transitions.
- **Integration tests**: TaxService facade tests with all 15 services composed. Cross-domain scenarios (e.g., rate resolution → indirect tax calculation → return generation).
- **Component tests**: Vitest + testing-library for each tax component with mock data.
- **Seed data**: Deterministic seed data with known tax rates, jurisdictions, transactions, and expected outcomes for reproducible testing.

See [docs/testing/](/Users/horus/Desktop/vaultareloaded/docs/testing/) for the platform testing framework.

## Service Reference

| Service | Key Methods |
|---------|-------------|
| `TaxRuleService` | `getAll()`, `getByJurisdiction()`, `getByTaxType()`, `getEffectiveRate()`, `getExemptions()`, `add()`, `update()`, `count()` |
| `JurisdictionService` | `getAll()`, `getHierarchy()`, `getChildJurisdictions()`, `getByAuthority()`, `getTaxNumbers()`, `count()` |
| `IndirectTaxService` | `processTransaction()`, `calculateTax()`, `getOutputTax()`, `getInputTax()`, `getReturns()`, `count()` |
| `DirectTaxService` | `calculateProvision()`, `getDeferredTax()`, `getCurrentTax()`, `getEstimatedPayments()`, `count()` |
| `WithholdingTaxService` | `processWithholding()`, `getCertificates()`, `getRecoverable()`, `getByVendor()`, `count()` |
| `TransferPricingService` | `getTransactions()`, `getByMethod()`, `getArmLengthRange()`, `getDocumentation()`, `count()` |
| `TaxCalendarService` | `getDeadlines()`, `getByJurisdiction()`, `getUpcoming()`, `getReminders()`, `count()` |
| `TaxReturnService` | `getAll()`, `getByStatus()`, `getByJurisdiction()`, `getAmendments()`, `submit()`, `amend()`, `count()` |
| `TaxPaymentService` | `getAll()`, `getByStatus()`, `getByReturn()`, `getEstimatedPayments()`, `schedule()`, `record()`, `count()` |
| `TaxReconciliationService` | `getReconciliation()`, `getGLvsTax()`, `getReturnReconciliation()`, `getDeferredReconciliation()`, `count()` |
| `TaxComplianceService` | `getScore()`, `getViolations()`, `getByJurisdiction()`, `getAuditReadiness()`, `count()` |
| `TaxAuditService` | `getEvents()`, `getByEntity()`, `getByUser()`, `getByDateRange()`, `count()` |
| `TaxAnalyticsService` | `getAllKPIs()`, `getActiveAlerts()`, `getAllRecommendations()`, `getTrends()`, `count()` |
| `TaxForecastService` | `getForecasts()`, `getByJurisdiction()`, `getByTaxType()`, `getConfidenceBounds()`, `count()` |
| `TaxService` | `getAggregateMetrics()` — cross-domain metrics; `getExecutiveSummary()` — executive narrative data |

See [docs/persistence/](/Users/horus/Desktop/vaultareloaded/docs/persistence/) for repository abstraction patterns used across the platform.
