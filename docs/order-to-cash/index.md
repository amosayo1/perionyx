# Order-to-Cash Module

## Overview

The Order-to-Cash (O2C) module provides a comprehensive revenue lifecycle management platform purpose-built for CFOs, Controllers, and Finance Managers. It covers the entire O2C cycle from customer onboarding and sales orders through billing, accounts receivable, collections, revenue recognition, cash application, and credit management.

Zero external APIs. Zero ERP SDKs. Zero accounting SDKs. Provider-agnostic. AI-ready.

## Architecture

The module follows the same layered architecture as the rest of the platform: server-side domain services with typed repositories, client components, and page routes. All business logic lives in `src/server/order-to-cash/` and all UI components live in `src/components/order-to-cash/`.

```
src/server/order-to-cash/
  index.ts                          — Barrel exports, factory
  services/
    order-to-cash-service.ts        — Singleton facade composing all domain services
  domain/
    customers/                      — CustomerService
    sales-orders/                   — SalesOrderService
    billing/                        — BillingService
    pricing/                        — PricingService
    quotations/                     — QuotationService
    contracts/                      — O2CContractService
    fulfillment/                    — FulfillmentService
    shipping/                       — ShippingService
    accounts-receivable/            — ARService
    collections/                    — CollectionsService
    credit/                         — CreditService
    revenue-recognition/            — RevenueRecognitionService
    cash-application/               — CashApplicationService
    analytics/                      — O2CAnalyticsService
    forecast/                       — O2CForecastService
  types/index.ts                    — 183 lines, 20+ interfaces
```

## Module List & Mock Data Counts

| Domain | Service | Records |
|--------|---------|---------|
| Customers | `CustomerService` | 1,500 customers |
| Sales Orders | `SalesOrderService` | 2,500 orders |
| Billing | `BillingService` | 2,000 invoices |
| Accounts Receivable | `ARService` | 2,000 AR records |
| Collections | `CollectionsService` | 500 collection cases |
| Revenue Recognition | `RevenueRecognitionService` | 1,000 schedules |
| Cash Application | `CashApplicationService` | 1,500 receipts |
| Credit | `CreditService` | 1,500 credit profiles |
| Analytics | `O2CAnalyticsService` | 20 KPIs, 50 alerts, 30 recommendations |
| Forecast | `O2CForecastService` | Forecast records |
| Quotations | `QuotationService` | Quotations |
| Contracts | `O2CContractService` | Contracts |
| Fulfillment | `FulfillmentService` | Fulfillment records |
| Shipping | `ShippingService` | Shipment records |
| Pricing | `PricingService` | Price records |

## Page Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/order-to-cash` | Main dashboard | Metrics, alerts, recommendations |
| `/order-to-cash/overview` | ExecutiveRevenueHeader, RevenueOverview, AlertsPanel | Performance at a glance |
| `/order-to-cash/customers` | CustomerRegistry, CustomerHierarchy, KPIs | Customer lifecycle management |
| `/order-to-cash/sales-orders` | SalesOrderBoard, KPIs | Order lifecycle and fulfillment tracking |
| `/order-to-cash/billing` | BillingCenter, KPIs | Invoice management |
| `/order-to-cash/accounts-receivable` | AccountsReceivableGrid, AgingAnalysisChart, KPIs | AR aging and disputes |
| `/order-to-cash/collections` | CollectionsDashboard, KPIs | Collection case management |
| `/order-to-cash/revenue-recognition` | RevenueRecognitionBoard, KPIs | ASC 606 revenue scheduling |
| `/order-to-cash/cash-application` | CashApplicationCenter, KPIs | Receipt matching and application |
| `/order-to-cash/credit` | CreditManagementPanel, KPIs | Credit limits and risk scoring |
| `/order-to-cash/analytics` | 4 chart components, KPIs | Revenue trends, collections, profitability |
| `/order-to-cash/executive` | ExecutiveRevenueHeader, ExecutiveInsights, AlertsPanel, RecommendationsPanel | C-suite intelligence |

## Key Events & State Machine

The O2C lifecycle flows through discrete states:

```
Customer → Sales Order (draft → submitted → approved → confirmed → fulfilled → completed)
  ↓
Billing (draft → submitted → approved → paid/disputed/cancelled)
  ↓
Accounts Receivable (open → overdue → partially-paid → paid/written-off)
  ↓
Collections (active → promise-to-pay → escalated → resolved)
  ↓
Cash Application (unapplied → partially-applied → applied)
  ↓
Revenue Recognition (scheduled → recognized/deferred)
```

## Integration Points

| Integration | How |
|-------------|-----|
| Accounting (GL) | Revenue schedules post to GL accounts via `accountCode` on invoice items |
| Treasury | Cash receipts and collections feed cash position calculations |
| FP&A | Revenue forecasts and KPI data used in planning models |
| Procurement | Customer credit data informs vendor risk scoring |
| AI Platform | Analytics service provides KPI/alert/recommendation data for AI insights |
| Audit | All domain entities carry `createdAt`/`updatedAt` for audit trail |
| Queue | Async cash application and collection notifications |

## AI Roadmap

See [AI Roadmap](./ai-roadmap.md) for details on revenue forecasting, collection prediction, customer churn detection, payment delay prediction, credit risk recommendation, revenue leakage detection, customer profitability insights, and executive narratives.

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | Module architecture and design decisions |
| [Customer Management](./customer-management.md) | Customer lifecycle, groups, credit, hierarchies |
| [Sales Orders](./sales-orders.md) | Order lifecycle, types, fulfillment |
| [Billing](./billing.md) | Invoice lifecycle, billing types, credit/debit notes |
| [Accounts Receivable](./accounts-receivable.md) | AR management, aging, disputes, write-offs |
| [Collections](./collections.md) | Collection workflow, escalation, promises |
| [Revenue Recognition](./revenue-recognition.md) | ASC 606 methods: immediate, deferred, milestone, subscription |
| [Cash Application](./cash-application.md) | Receipt matching, partial payments, unapplied cash |
| [Credit Management](./credit-management.md) | Credit limits, utilization, risk scoring |
| [KPIs](./kpis.md) | Complete KPI reference |
| [AI Roadmap](./ai-roadmap.md) | AI/ML integration opportunities |
| [Developer Guide](./developer-guide.md) | How to extend the module |
