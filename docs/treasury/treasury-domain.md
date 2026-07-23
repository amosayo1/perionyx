# Treasury Domain Architecture

## Overview

The Treasury Domain is the financial intelligence layer that sits above Banking. While Banking answers "what bank accounts exist?", Treasury answers "where is the organization's cash and how should it be managed?".

## Layer Architecture

```
Enterprise Application Layer
        │
        ▼
┌─────────────────────────────────────┐
│        Treasury Domain              │
│  Cash │ Liquidity │ Risk │ Forecast │
│  Funding │ Policies │ Analytics     │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│        Banking Platform (9A)        │
│  Accounts │ Sync │ Connections      │
│  Providers │ Health │ Monitoring    │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│        Provider Abstraction         │
│  Plaid │ Lean │ Tarabut │ ...       │
└─────────────────────────────────────┘
```

## Domain Model

### Core Entities

```
TreasuryAccount ──── has ──── CashPosition (by classification)
     │                            │
     │                            ├── Operating │ Treasury │ Payroll
     │                            ├── Tax │ Investment │ Reserve
     │                            ├── Restricted │ Escrow
     │                            └── Collateral │ Petty Cash
     │
     ├── member of ──── CashPool (Physical │ Notional │ Regional │ Currency │ Virtual)
     │
     ├── has ──── LiquidityPosition (Immediate │ Same Day │ T+1 │ Short │ Medium │ Long)
     │
     └── subject to ──── CashPolicy (Minimum │ Target │ Buffer │ Concentration)
```

### Cross-cutting

```
Company ── has ── LegalEntity ── has ── TreasuryAccount
  │                    │
  │                    ├── CashForecast (Day │ Week │ Month │ Quarter │ Year)
  │                    ├── FundingRequest ──► FundingDecision
  │                    ├── IntercompanyLoan (borrower / lender)
  │                    ├── FXExposure (per currency pair)
  │                    ├── InvestmentBucket ── holds ── InvestmentHolding
  │                    ├── WorkingCapital (current ratio, quick ratio)
  │                    └── CounterpartyRisk (per institution)
  │
  └── TreasuryPolicy ── contains ── CashPolicy[]
       │
       └── TreasuryAlert (policy violations, funding required, etc.)
```

## File Layout

```
src/server/treasury/
  domain/
    types.ts          All enums + interfaces (450+ lines)
    index.ts          Barrel export
  cash/
    cash-engine.ts    Cash classification, working capital, policy checks
    index.ts
  liquidity/
    liquidity-engine.ts   Liquidity categorization, ratios, pool utilization
    pool-manager.ts       Cash pool CRUD (physical/notional/regional/currency/virtual)
    index.ts
  forecast/
    forecast-engine.ts    Cash forecasting with horizon, confidence, risks
    index.ts
  risk/
    fx-exposure.ts        FX exposure computation, net exposure, policy limits
    counterparty-risk.ts  Counterparty risk registration, exposure tracking
    index.ts
  analytics/
    analytics-engine.ts   Treasury KPIs, regional breakdown, anomaly detection
    index.ts
  policies/
    policy-engine.ts      Policy evaluation engine with rule-based violations
    index.ts
  services/
    cash-position-service.ts   Position recording, snapshot builder
    funding-service.ts         Funding request lifecycle (create/approve/execute)
    intercompany-service.ts    Intercompany loan origination, payments, interest
    treasury-service.ts        Main facade orchestrating all sub-services
    index.ts
  repositories/
    treasury-repository.ts     In-memory repository interface + implementation
    index.ts
  types/
    index.ts                   Re-export all domain types as type-only
  index.ts                     Barrel export for all modules
```

## Constraints

- **No UI** — pure domain layer
- **No Database** — in-memory stores (DB persistence planned for production)
- **No External APIs** — no network calls
- **No Banking SDKs** — purely domain abstractions
- **No Provider Logic** — fully provider-agnostic

## Multi-tenant Support

All entities carry `companyId` and `legalEntityId` for tenant isolation. Queries filter by these identifiers.

- Multi-company: `companyId`
- Multi-entity: `legalEntityId`
- Multi-region: `region`
- Multi-bank: `institutionName`
- Multi-currency: `currency`
- Multi-provider: `providerKind`
