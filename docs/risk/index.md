# Enterprise Risk Management (ERM) Module

## Overview

The Enterprise Risk Management (ERM) module provides a comprehensive, Fortune 500-grade risk management platform integrated with Perionyx Platform Core v1.0. It supports 14 risk domains, 11 register types, scenario planning, stress testing, and executive analytics.

## Architecture

```
src/server/risk/
  types/index.ts              — All risk domain type definitions
  index.ts                    — Barrel exports
  risk-seed.ts                — Deterministic seed data (500+ risks)
  services/
    risk-service.ts           — Facade composing all sub-services
  domain/
    risk-register-service.ts  — Risk register, recommendations, alerts, BUs, entities
    market-risk-service.ts    — Market, FX, and interest rate risk
    credit-risk-service.ts    — Credit, counterparty, country, concentration risk
    liquidity-risk-service.ts — Liquidity risk metrics
    operational-risk-service.ts — Operational risk, controls, limits, compliance
    stress-testing-service.ts — Stress tests, scenarios, historical losses
    analytics-service.ts      — KPIs, forecasts, insights, computations
```

## Risk Domains

| Domain | Description | Key Metrics |
|--------|-------------|-------------|
| Market | Equity, fixed income, commodity, derivative exposure | VaR, ES, volatility, duration, convexity |
| Credit | Counterparty default, credit quality, loan portfolio | PD, LGD, EAD, ECL, credit limits |
| Liquidity | Funding gap, cash reserve, emergency liquidity | LCR, NSFR, funding gap, liquidity buffer |
| FX | Foreign exchange position, hedging, translation | Net exposure, natural/synthetic hedge, sensitivity |
| Interest Rate | Yield curve, repricing gap, rate shock | Duration, modified duration, rate shock scenarios |
| Operational | People, process, system, external event risk | Loss events, near misses, control effectiveness |
| Counterparty | Derivative, repo, securities lending exposure | PFE, collateral, netting benefit |
| Country | Sovereign, political, legal, transfer risk | Sovereign rating, political/economic/legal risk |
| Concentration | Sector, name, geographic concentration | HHI, top exposures, counterparty count |
| Settlement | Trade settlement, clearing, custody risk | Settlement failure rate, reconciliation gap |
| Funding | Wholesale funding, deposit, committed facility | Rollover risk, funding concentration |
| Investment | Portfolio, alternative, valuation, liquidity | Valuation uncertainty, liquidity premium |
| Treasury | Cash management, hedging, bank relationship | Cash position, pooling, policy compliance |
| Bank | Correspondent banking, concentration, service | Bank rating, deposit concentration, service levels |

## Risk Register

The register supports 11 register types:

- **Enterprise** — Organization-wide strategic risks
- **Business Unit** — Division/department-level risks
- **Regional** — Geographic region-specific risks
- **Entity** — Legal entity risks
- **Bank** — Banking relationship risks
- **Investment** — Investment portfolio risks
- **Treasury** — Treasury operations risks
- **Operational** — Operational process risks
- **Closed** — Resolved/closed risks
- **Historical** — Past risk events
- **Emerging** — Newly identified risks

## Scoring

| Dimension | Values |
|-----------|--------|
| Likelihood | Rare, Unlikely, Possible, Likely, Almost Certain |
| Impact | Negligible, Minor, Moderate, Major, Severe |
| Velocity | Slow, Moderate, Fast, Immediate |
| Detectability | High, Medium, Low |
| Control Effectiveness | Strong, Satisfactory, Weak, Ineffective, Not Tested |
| Heat Level | Extreme, High, Elevated, Moderate, Low |
| Priority | Critical, High, Medium, Low |

## Stress Testing

11 scenario types:
- Base, Optimistic, Pessimistic
- Financial Crisis, Liquidity Crisis
- Currency Crash, Interest Shock
- Bank Failure, Counterparty Default
- Black Swan, Custom

## Scenario Planning

8 categories:
- Revenue Drop, Inflation
- FX Shock, Interest Increase
- Acquisition, Rapid Growth
- Recession, Supply Chain Failure

## Limits

8 limit types with active monitoring and escalation:
- Exposure, Credit, Bank, Issuer
- Country, Liquidity, FX, Investment

Status: Within Limit → Approaching → At Limit → Exceeded → Breached → Escalated

## AI Readiness

Every model includes AI metadata fields for future capabilities:
- Risk Prediction
- Loss Prediction
- Scenario Generation
- Control Optimization
- Mitigation Recommendation
- Exposure Forecasting
- Executive Summaries
- Early Warning Detection

## Mock Data

| Entity | Count |
|--------|-------|
| Enterprise Risks | 500 |
| Policy Violations | 150 |
| Recommendations | 100 |
| Alerts | 100 |
| Counterparties | 80 |
| Business Units | 20 |
| Entities | 15 |
| Controls | 300 |
| Stress Tests | 120 |
| Scenarios | 60 |
| Historical Loss Events | 200 |
| Limits | 50 |
| Escalations | 30 |
| KPIs | 20 |
| Forecasts | 40 |
| Insights | 10 |

## UI Components

| Component | Purpose |
|-----------|---------|
| ExecutiveRiskHeader | Quick stats bar for executive dashboard |
| RiskOverview | Summary metrics cards |
| RiskHeatMap | Category × heat level grid |
| RiskMatrix | 5×5 likelihood × impact matrix |
| RiskRegisterGrid | Data table of enterprise risks |
| RiskKPICard | Individual KPI display card |
| RiskBadge | Heat/Priority/Status badges |
| RiskTimeline | Chronological risk activity feed |
| RiskTrendChart | SVG line chart with confidence bands |
| RiskDistributionChart | Horizontal bar chart by category |
| RiskAlertsPanel | Active alerts with severity |
| RiskRecommendationsPanel | Open recommendations |
| RiskExecutiveInsights | Grouped AI insights |
| MarketRiskDashboard | Market/FX/IR stats |
| CreditRiskDashboard | Credit/counterparty/country stats |
| LiquidityRiskDashboard | LCR/gap/buffer stats |
| OperationalRiskDashboard | Loss/control/violation stats |
| StressTestViewer | Completed stress test cards |
| ScenarioSimulator | Active scenario cards |
| LimitMonitoringPanel | Limit breaches and escalations |
| CompliancePanel | Policy violations list |

## Pages

| Route | Section |
|-------|---------|
| `/risk` | Risk Center (existing — alert-based) |
| `/risk/overview` | Enterprise risk dashboard |
| `/risk/register` | Full risk register grid |
| `/risk/market` | Market risk metrics |
| `/risk/credit` | Credit risk metrics |
| `/risk/liquidity` | Liquidity risk metrics |
| `/risk/fx` | FX risk metrics |
| `/risk/interest` | Interest rate risk |
| `/risk/operational` | Operational risk |
| `/risk/stress` | Stress testing results |
| `/risk/scenario` | Scenario planning |
| `/risk/limits` | Limits and escalations |
| `/risk/compliance` | Policy violations |
| `/risk/forecast` | Risk forecasting |
| `/risk/analytics` | KPIs and analytics |
| `/risk/executive` | Board-level summary |

## Integration Points

| Module | Integration |
|--------|-------------|
| Platform Core | Infrastructure facade, navigation registration |
| Banking (9A) | Bank risk, counterparty risk, settlement risk |
| Treasury (9B) | Treasury risk, liquidity risk, funding risk |
| Investments (9C) | Investment risk, market risk, credit risk |
| CRM | Risk owner assignment, stakeholder tracking |

## Developer Guide

### Adding a new risk domain

1. Add type to `RiskCategory` union in `types/index.ts`
2. Create domain service file in `domain/`
3. Add service to `RiskService` facade
4. Add domain data type interface
5. Add seed data generation in `risk-seed.ts`
6. Create UI component in `components/risk/`
7. Create page in `app/(shell)/risk/`
8. Add navigation entry in `nav-config.ts`

### Running seed data

```typescript
import { riskService, seedRiskData } from "@/server/risk";
seedRiskData(riskService);
```
