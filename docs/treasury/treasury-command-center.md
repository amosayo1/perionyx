# Treasury Executive Command Center

## Overview

The Treasury Executive Command Center is the primary landing page for the Treasury module, serving as the mission control dashboard for CFOs, Group Treasurers, Controllers, and Treasury Analysts. It provides a unified enterprise-wide view of all treasury operations with drill-down access to each completed module.

## Architecture

```
Enterprise Navigation → Treasury
                              │
                              ▼
                  Treasury Executive Command Center
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
    Module Pages        Module Pages         Module Pages
    (Cash, Liquidity,   (eBAM, Payments,     (Forecast, Risk,
     Investments)        Bank Accounts)       Reports, Admin)
```

## Section Layout

| Section | Purpose |
|---|---|
| Executive Header | Treasury Health Score + 15 Executive KPIs |
| Health Overview | 6-category health breakdown with scores |
| Scorecards | Summary metrics across all modules |
| Navigation Cards | Quick-access module links |
| Module Summaries | Deep-dive per-module metrics |
| Regional Overview | Cash/liquidity by region |
| Entity Overview | Entity-level performance |
| Currency Overview | Exposure and cash by currency |
| Institution Overview | Banking relationship health |
| Performance Metrics | Key metric targets and progress |
| Activity Timeline | Recent treasury activity |
| Alerts | Priority-based alert summary |
| Insights | Executive observations |
| Recommendations | AI-powered suggestions |
| Roadmap | Coming Soon modules |

## Route

`/treasury` — This is the Treasury home page, not a replacement for the Enterprise Dashboard.

## Design

- Dark theme, ~95% charcoal, gold (#c9a84c) accents
- Framer Motion animations throughout
- Responsive grid layouts
- Skeleton-ready component structure
- WCAG 2.1 AA compliant
