# Enterprise Procurement (P2P) Module

## Overview

The Enterprise Procurement module delivers a comprehensive procure-to-pay (P2P) platform purpose-built for CFOs, Controllers, and Procurement Managers. It spans the full vendor-to-payment lifecycle with deep support for vendor management, purchase requisitions, purchase orders, goods receipt, invoice matching (2-way and 3-way), approval workflows, contracts, payments, and spend analytics.

Zero external APIs. Zero procurement SDKs. Zero ERP SDKs. Provider-agnostic. AI-ready.

## Architecture

```
src/server/procurement/
  types/index.ts                    — All procurement domain types (166 lines, 16+ interfaces)
  index.ts                          — Barrel exports
  procurement-seed.ts               — Deterministic seed data (888 lines)
  services/
    procurement-service.ts          — Facade composing all 12 sub-services
  domain/
    vendors-service.ts              — Vendor lifecycle, risk scoring, performance tracking
    purchase-requests-service.ts    — PR lifecycle, budget validation, conversion to PO
    purchase-orders-service.ts      — PO types, amendments, fulfillment tracking
    receiving-service.ts            — Goods/service receipt matching
    invoice-matching-service.ts     — 2-way/3-way matching with tolerance rules
    approvals-service.ts            — Multi-level approval routing, delegation, escalation
    payments-service.ts             — Payment scheduling and execution tracking
    contracts-service.ts            — Contract lifecycle, renewal management
    catalog-service.ts              — Item catalog for procurement
    expenses-service.ts             — Spend analytics, KPIs, forecasts
    analytics-service.ts            — Alerts and recommendations engine
    forecast-service.ts             — Procurement spend forecasting
  repositories/                     — Repository interfaces (Prisma-ready)
```

## Module List

| Module | Service | Data |
|--------|---------|------|
| Vendors | `VendorService` | 800 vendors |
| Purchase Requests | `PurchaseRequestService` | 1,500 requests |
| Purchase Orders | `PurchaseOrderService` | 1,200 orders |
| Receiving | `ReceivingService` | 700 receipts |
| Invoice Matching | `InvoiceMatchingService` | 900 invoices |
| Approvals | `ApprovalsService` | 200 approvals |
| Payments | `PaymentService` | 500 payments |
| Contracts | `ContractService` | 350 contracts |
| Catalog | `CatalogService` | 400 catalog items |
| Spend Analytics | `ExpenseService` | 300 analytics, 16 KPIs, 300 forecasts |
| Alerts & Recommendations | `ProcurementAnalyticsService` | 200 alerts, 300 recommendations |

## Mock Data

| Entity | Count |
|--------|-------|
| Vendors | 800 |
| Purchase Requests | 1,500 |
| Purchase Orders | 1,200 |
| Receipts | 700 |
| Invoices | 900 |
| Approval Requests | 200 |
| Payments | 500 |
| Contracts | 350 |
| Catalog Items | 400 |
| Spend Analytics | 300 |
| KPIs | 16 |
| Forecasts | 300 |
| Alerts | 200 |
| Recommendations | 300 |

## Pages

| Route | Section | Components |
|-------|---------|------------|
| `/procurement` | Procurement Center | ExecutiveProcurementHeader, ProcurementOverview, AlertsPanel, RecommendationsPanel |
| `/procurement/overview` | Dashboard overview | ExecutiveProcurementHeader, ProcurementOverview, AlertsPanel |
| `/procurement/vendors` | Vendor Registry | FPAKPICard, VendorRegistry, ProcurementFilters |
| `/procurement/purchase-requests` | Purchase Requests | FPAKPICard, PurchaseRequestBoard |
| `/procurement/purchase-orders` | Purchase Orders | FPAKPICard, PurchaseOrderGrid |
| `/procurement/receiving` | Receiving Dashboard | FPAKPICard, ReceivingDashboard |
| `/procurement/invoices` | Invoice Matching | FPAKPICard, InvoiceMatchingCenter |
| `/procurement/approvals` | Approval Queue | FPAKPICard, ApprovalQueue |
| `/procurement/contracts` | Contract Center | FPAKPICard, ContractCenter |
| `/procurement/spend-analytics` | Spend Analytics | SpendAnalyticsDashboard, SpendTrendChart, VendorSpendChart, DepartmentSpendChart, BudgetConsumptionChart |
| `/procurement/executive` | Executive View | ExecutiveProcurementHeader, ExecutiveInsights, AlertsPanel, RecommendationsPanel |

## UI Components

| Component | Description |
|-----------|-------------|
| ExecutiveProcurementHeader | Executive summary metrics bar |
| ProcurementOverview | KPI metrics grid for procurement |
| FPAKPICard | Reusable single metric display card |
| VendorRegistry | Vendor list with status and risk badges |
| ProcurementFilters | Multi-select filter bar for procurement data |
| PurchaseRequestBoard | PR list with status workflow display |
| PurchaseOrderGrid | PO table with type, status, and fulfillment tracking |
| ReceivingDashboard | Receipt list with acceptance tracking |
| InvoiceMatchingCenter | Invoice matching with exception display |
| ApprovalQueue | Approval request list with action buttons |
| ContractCenter | Contract list with expiry tracking |
| SpendAnalyticsDashboard | Spend KPI summary |
| SpendTrendChart | Time-series spend chart |
| VendorSpendChart | Vendor spend breakdown |
| DepartmentSpendChart | Department spend breakdown |
| BudgetConsumptionChart | Budget vs actual consumption |
| AlertsPanel | Severity-coded alert list |
| RecommendationsPanel | Savings recommendations list |
| ExecutiveInsights | AI-powered narrative insights |

## AI Roadmap

Refer to [AI Roadmap](ai-roadmap.md) for full details on planned AI features:
- Vendor Recommendation
- Spend Prediction
- Invoice Exception Detection
- Approval Recommendation
- Procurement Risk Detection
- Contract Renewal Prediction
- Budget Consumption Forecast
- Executive Summaries

## Integration Points

| Module | Integration |
|--------|-------------|
| Accounting (7A) | Invoice posting, accrual entries, budget GL integration |
| Treasury (9B) | Payment scheduling, cash position impact |
| Risk (9D) | Vendor risk scoring, procurement fraud detection |
| FP&A (Planning) | Budget consumption, spend forecasting |
| Automation Studio | Approval workflow automation, PO auto-generation |
| Platform Core | Navigation, infrastructure, auth |
