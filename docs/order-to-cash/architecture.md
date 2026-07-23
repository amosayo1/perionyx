# O2C Module Architecture

## Directory Structure

```
src/server/order-to-cash/
  index.ts                              — Barrel exports
  order-to-cash-seed.ts                 — Deterministic seed data (1,500+ records)
  services/
    order-to-cash-service.ts            — Singleton facade composing all 15 domain services
  domain/
    customers/customers-service.ts      — CustomerService (CRUD, search, contacts)
    sales-orders/sales-orders-service.ts — SalesOrderService (CRUD, status, fulfillment)
    billing/billing-service.ts          — BillingService (invoices, status, AR tracking)
    pricing/pricing-service.ts          — PricingService (price records, product pricing)
    quotations/quotations-service.ts    — QuotationService (quotes, lifecycle)
    contracts/contracts-service.ts      — O2CContractService (contracts, renewal)
    fulfillment/fulfillment-service.ts  — FulfillmentService (order fulfillment)
    shipping/shipping-service.ts        — ShippingService (shipments, tracking)
    accounts-receivable/ar-service.ts   — ARService (aging, disputes, write-offs)
    collections/collections-service.ts  — CollectionsService (cases, escalation)
    credit/credit-service.ts            — CreditService (profiles, risk, holds)
    revenue-recognition/revrec-service.ts — RevenueRecognitionService (schedules, methods)
    cash-application/cash-app-service.ts — CashApplicationService (receipts, matching)
    analytics/analytics-service.ts      — O2CAnalyticsService (KPIs, alerts, recommendations)
    forecast/forecast-service.ts        — O2CForecastService (forecast records)
  types/index.ts                        — All O2C domain types (20+ interfaces)

src/components/order-to-cash/
  o2c-types.ts                          — Re-exports server types + O2COverviewMetrics
  executive-revenue-header.tsx          — 5-metric executive KPI row
  revenue-overview.tsx                  — 8-card detailed metrics grid
  revenue-filters.tsx                   — Search/filter bar component
  customer-registry.tsx                 — Customer table with status, risk, credit
  customer-hierarchy.tsx                — Group hierarchy tree view
  sales-order-board.tsx                 — Sales order table with fulfillment progress
  billing-center.tsx                    — Invoice table with AR status
  accounts-receivable-grid.tsx          — AR record table with aging
  aging-analysis-chart.tsx              — Aging bucket visualization
  collections-dashboard.tsx             — Collection case table
  revenue-recognition-board.tsx         — Revenue schedule table with progress
  cash-application-center.tsx           — Cash receipt table with application status
  credit-management-panel.tsx           — Credit profile table
  revenue-trend-chart.tsx               — Revenue trend bar chart
  collections-trend-chart.tsx           — Collections vs target chart
  cash-collection-chart.tsx             — Invoiced/collected/outstanding chart
  customer-profitability-chart.tsx      — Customer profitability ranking
  executive-insights.tsx                — Computed insight cards
  alerts-panel.tsx                      — Alert severity list
  recommendations-panel.tsx             — Recommendation cards with impact

src/app/(shell)/order-to-cash/          — 12 page routes
```

## Layer Architecture

```
┌─────────────────────────────────────┐
│  Page Routes (server components)    │
│  src/app/(shell)/order-to-cash/*    │
├─────────────────────────────────────┤
│  Client Components                  │
│  src/components/order-to-cash/*     │
├─────────────────────────────────────┤
│  Domain Services (stateless)        │
│  src/server/order-to-cash/domain/*  │
├─────────────────────────────────────┤
│  Repositories (in-memory → Prisma)  │
│  src/server/order-to-cash/*/repo    │
└─────────────────────────────────────┘
```

**Page routes** are server components that call `orderToCashService` methods and pass data as props to client components. This keeps data fetching server-side with zero client-side data loading.

**Client components** are pure presentational — they receive data via props and render tables, charts, and cards. They are `"use client"` components with no server-side dependencies.

**Domain services** hold business logic and in-memory data stores. Each service is independently instantiated and tested. The `OrderToCashService` facade composes all 15 domain services.

## Key Design Decisions

1. **Singleton facade**: `orderToCashService` is a singleton that composes all 15 domain services. Pages call `orderToCashService.customers.getAll()` etc. without instantiating anything.

2. **In-memory stores**: All domain services use in-memory `Map<string, T>` stores populated by deterministic seed data. This enables zero-configuration development and testing. Database persistence (Prisma) is planned.

3. **Components import from o2c-types**: All O2C components import types from `./o2c-types.ts` which re-exports server types. This creates a clean dependency boundary — components never import directly from server modules.

4. **Server-side data fetching**: All page.tsx files call service methods synchronously and pass data as props. No useEffect, no SWR, no client-side data fetching.

5. **Chart components are custom SVG**: No external chart libraries. All charts render inline SVG with Tailwind styling, consistent with the platform's zero-external-dependency approach.

## Integration Points

| Integration | Mechanism |
|-------------|-----------|
| Accounting GL | Invoice items carry `accountCode` for GL posting. Revenue schedules post to deferred/recognized accounts. |
| Treasury | Cash receipts and AR data inform treasury cash position and liquidity forecasts. |
| FP&A | `O2CAnalyticsService.getKPIs()` feeds revenue and collection KPIs to planning models. |
| Procurement | Customer credit profiles can inform vendor risk scoring in procurement. |
| AI Platform | Analytics alerts and recommendations can be consumed by AI copilot features. |
| Audit | All domain entities have `createdAt`/`updatedAt` timestamps for audit trail integrity. |

## Service Reference

| Service | Key Methods |
|---------|-------------|
| `CustomerService` | `getAllCustomers()`, `getByStatus()`, `getByGroup()`, `getByRisk()`, `search()`, `count()` |
| `SalesOrderService` | `getAllOrders()`, `getByStatus()`, `getByFulfillmentStatus()`, `count()` |
| `BillingService` | `getAllInvoices()`, `getOverdue()`, `getByARStatus()`, `getByBillingType()`, `count()` |
| `ARService` | `getAllARRecords()`, `getByAgingBucket()`, `getOverdue()`, `getDisputed()`, `count()` |
| `CollectionsService` | `getAllCases()`, `getActive()`, `getByStatus()`, `count()` |
| `RevenueRecognitionService` | `getAllSchedules()`, `getByStatus()`, `getByMethod()`, `count()` |
| `CashApplicationService` | `getAllReceipts()`, `getUnapplied()`, `getByStatus()`, `count()` |
| `CreditService` | `getAllProfiles()`, `getOnHold()`, `getByRiskRating()`, `count()` |
| `O2CAnalyticsService` | `getAllKPIs()`, `getActiveAlerts()`, `getAllRecommendations()`, `count()` |
| `OrderToCashService` | `getAggregateMetrics()` — computes cross-domain metrics in one call |

See [docs/persistence/](/Users/horus/Desktop/vaultareloaded/docs/persistence/) for repository abstraction patterns used across the platform.
