# Treasury Home Architecture

## Overview

The Treasury Home (`/treasury`) serves as the landing page for the Treasury module within the Perionyx Enterprise platform. It is additive — it does not replace or modify any existing page, route, or component.

## Route Structure

```
/treasury                              → Command Center (THIS PAGE)
/treasury/cash-position                → Phase 9B.2 Global Cash Position
/treasury/liquidity                    → Phase 9B.3 Liquidity Center
/treasury/payments                     → Phase 9B.4 Payments
/treasury/bank-accounts                → Phase 9B.5 eBAM
/treasury/cash-forecast                → Phase 9B.6 Forecasting
/treasury/risk                         → Phase 9B.7 Treasury Risk
```

## Component Architecture

```
src/app/(shell)/treasury/
  page.tsx                              → Server Component (metadata + layout)
  layout.tsx                            → (inherited from shell)

src/components/treasury/command-center/
  global-treasury-command-center.tsx    → Main client component (orchestrator)
  executive-header.tsx                  → Health score + 15 KPIs
  treasury-health-overview.tsx          → 6 health categories
  treasury-scorecards.tsx               → Module summary metrics
  treasury-navigation-cards.tsx         → Quick navigation links
  module-summaries.tsx                  → Deep-dive per-module cards
  regional-overview.tsx                 → Region breakdown
  entity-overview.tsx                   → Entity breakdown
  currency-overview.tsx                 → Currency breakdown
  institution-overview.tsx              → Bank relationship cards
  performance-metrics.tsx               → Target vs actual metrics
  activity-timeline.tsx                 → Recent activity feed
  active-alerts.tsx                     → Alert summary
  executive-insights.tsx               → Key observations
  recommendations-panel.tsx             → AI suggestions
  coming-soon-roadmap.tsx               → Future modules
  types.ts                             → TypeScript interfaces
  data.ts                              → Mock summary data
  index.ts                             → Barrel exports
```

## Data Flow

The Command Center consumes only summary-level mock data. It does not import or query the raw datasets from individual modules. Each section displays aggregated enterprise-wide metrics with links to the appropriate module for detail.

## Design Principles

- Additive only — no existing files modified
- Summary views — no duplicate functionality
- Mock data — no real API calls
- Provider-agnostic — no banking SDKs
