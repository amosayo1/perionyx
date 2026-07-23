# Treasury Risk & FX Management Architecture

## Overview

The Enterprise Treasury Risk & FX Management Center is the global treasury command center for managing foreign exchange exposure, interest rate risk, counterparty risk, country risk, liquidity risk, concentration risk, hedging portfolios, treasury limits, risk policies, VaR, stress testing, and scenario analysis. It consumes only Treasury Domain modules (Phase 9B.1) and remains fully provider-agnostic.

## System Context

```
Treasury Domain (Phase 9B.1)
  └── Treasury Risk & FX Management (Phase 9B.7)
        ├── FX Exposure Management (40 exposures, 12 currencies)
        ├── Interest Rate Risk (20 exposures, fixed/floating)
        ├── Counterparty Risk (20 counterparties, credit ratings)
        ├── Country Risk (18 countries, composite scoring)
        ├── Liquidity Risk (12 entities, coverage ratios)
        ├── Concentration Risk (15 concentration categories)
        ├── Hedging Portfolio (40 hedges, derivatives)
        ├── Stress Testing (15 scenarios, 10 types)
        ├── Value at Risk (20 snapshots, 3 methodologies)
        ├── Policy Management (20 policies, 30 breaches)
        └── Risk Analytics & Intelligence
```

## Component Hierarchy

```
GlobalRiskDashboard
├── ExecutiveRiskHeader (9 metrics)
├── TreasuryRiskFilters (10 dimensions)
├── RiskOverview (12 KPI cards)
├── FXExposureTable (40 exposures)
├── InterestRateExposure (20 exposures)
├── CounterpartyRiskGrid (20 counterparties)
├── CountryRiskMap (18 countries)
├── HedgingPortfolio (40 positions)
├── StressTestingPanel (15 scenarios)
├── ValueAtRiskPanel (20 snapshots)
├── RiskPolicyCenter (20 policies)
├── 8 Chart Components
├── RiskAlertsPanel (20 alerts)
├── RiskRecommendationsPanel (25 recommendations)
└── ExecutiveRiskInsights (10 insights)
```

## Risk Taxonomy

| Risk Type | Count | Measurement |
|---|---|---|
| FX | 40 exposures | Long/short/net, hedge ratio |
| Interest Rate | 20 exposures | Fixed/floating, duration, sensitivity |
| Counterparty | 20 ratings | Exposure, limit, utilization, score |
| Country | 18 countries | Political, economic, currency risk |
| Liquidity | 12 entities | Coverage ratio, survival days |
| Concentration | 15 categories | Concentration %, limit comparison |

## Key Design Decisions

- **Provider-agnostic**: No banking SDKs, no FX feeds, no real market data
- **Deterministic data**: All values hard-coded — no randomness
- **Mock intelligence**: All recommendations and insights use mock data
- **Executive focus**: Every component serves CFOs, Risk Officers, Treasurers
- **Perionyx design**: Dark-only, ~95% charcoal, ~4% white, ~1% gold (#c9a84c)
