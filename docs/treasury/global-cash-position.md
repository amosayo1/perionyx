# Global Cash Position

## Overview

The Global Cash Position platform is the primary treasury dashboard for CFOs and Treasury teams.

It answers: how much cash do we have, where is it, who owns it, which currency, which banks, which entities, how much is available, how much is restricted, and what changed today.

## Architecture

```
Treasury Domain (Phase 9B.1)
        │
        ▼
┌───────────────────────────────────────┐
│     Global Cash Position Dashboard    │
│                                       │
│  ├─ Executive Treasury Header         │
│  ├─ Treasury Filters                  │
│  ├─ Cash Position Overview (KPIs)     │
│  ├─ Global Cash Map                   │
│  ├─ Regional Cash Cards               │
│  ├─ Legal Entity Cash Grid            │
│  ├─ Currency Position Table           │
│  ├─ Institution Cash Grid             │
│  ├─ Cash Composition Card             │
│  ├─ Available / Restricted / Idle     │
│  ├─ Working Capital Widget            │
│  ├─ Cash Movement Timeline            │
│  ├─ Daily Cash Variance               │
│  ├─ Trend Charts                      │
│  ├─ Liquidity / Currency / Exposure   │
│  └─ Cash Alerts Panel                 │
└───────────────────────────────────────┘
        │
        ▼
  Enterprise Shell (auth, nav, layout)
```

## Page Structure

- **Route**: `/(shell)/treasury/cash-position/`
- **Page**: Server component with metadata
- **Dashboard**: `GlobalCashDashboard` client component with section tabs
- **Data layer**: Mock enterprise datasets consuming Treasury Domain types

## Section Tabs

| Section | Components | Purpose |
|---|---|---|
| **Overview** | KPIs, Composition, Widgets, Timeline, Insights | At-a-glance treasury status |
| **Regions** | Cash Map, Regional Cards | Geographic cash distribution |
| **Entities** | Entity Cash Grid | Per-legal-entity breakdown |
| **Currencies** | Currency Position Table | Per-currency with FX exposure |
| **Institutions** | Institution Cash Grid | Per-bank relationship view |
| **Analytics** | Trend Charts, Distribution | Historical and comparative |
| **Alerts** | Alerts Panel | Active treasury notifications |

## KPIs

| KPI | Description | Source |
|---|---|---|
| Total Cash | Sum of all cash positions | CashEngine.summarizePositions() |
| Available Cash | Total - restricted - minimum balances | CashPosition.availableBalance |
| Restricted Cash | Legally/contractually restricted | RestrictedCash entity |
| Idle Cash | Total - restricted - operating | CashEngine summary |
| Working Capital | Current Assets - Current Liabilities | CashEngine.computeWorkingCapital() |
| Net Liquidity | Immediately accessible cash | LiquidityEngine summary |

## Regions

| Region | Primary Currencies | Entities | Institutions |
|---|---|---|---|
| North America | USD, CAD | Perionyx Inc., Perionyx LLC | JPMorgan, BofA, Citi |
| Europe | EUR, GBP, CHF | Perionyx UK Ltd., Perionyx EU B.V. | Barclays, HSBC, UBS |
| Middle East | AED | Perionyx Middle East LLC | FAB, Emirates NBD |
| Africa | ZAR | Perionyx Africa Pty Ltd. | Nedbank, Standard Bank |
| Asia-Pacific | JPY, SGD, AUD | Perionyx APAC Pte Ltd. | MUFJ, DBS |

## Mock Data

The mock dataset represents a global enterprise with:
- 7 legal entities across 5 regions
- 12 banking institutions
- 24 bank accounts
- 10 currencies
- $842.75M total cash
- $689.32M available cash
