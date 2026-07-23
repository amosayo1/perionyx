# Prisma Models

## Overview

Phase 7E.2 adds 16 new Prisma models to support the treasury domain persistence layer. These models map directly to the domain types defined in `src/server/treasury/domain/types.ts`.

## New Models

| Model | Table Name | Domain Type | Key Fields |
|---|---|---|---|
| TreasuryCashPosition | `treasury_cash_positions` | CashPosition | companyId, currency, classification, totalBalance |
| TreasuryLiquidityPosition | `treasury_liquidity_positions` | LiquidityPosition | companyId, category, amount, instruments (JSON) |
| TreasuryCashPool | `treasury_cash_pools` | CashPool | companyId, name, poolType, memberAccounts (JSON) |
| TreasuryCashMovement | `treasury_cash_movements` | CashMovement | companyId, amount, status, fundingType |
| TreasuryCashForecast | `treasury_cash_forecasts` | CashForecast | companyId, horizon, predictedInflows (JSON) |
| TreasuryFundingRequest | `treasury_funding_requests` | FundingRequest | companyId, status, amount, fundingType |
| TreasuryInvestmentBucket | `treasury_investment_buckets` | InvestmentBucket | companyId, strategy, holdings (JSON) |
| TreasuryRestrictedCash | `treasury_restricted_cash` | RestrictedCash | companyId, restrictionType, isReleased |
| TreasuryWorkingCapital | `treasury_working_capitals` | WorkingCapital | companyId, netWorkingCapital, currentRatio |
| TreasuryFXExposure | `treasury_fx_exposures` | FXExposure | companyId, sourceCurrency, targetCurrency |
| TreasuryCounterpartyRisk | `treasury_counterparty_risks` | CounterpartyRisk | counterpartyId (PK), creditRating, riskScore |
| TreasuryCashPolicy | `treasury_cash_policies` | CashPolicy | companyId, policyType, rules (JSON) |
| TreasuryPolicy | `treasury_policies` | TreasuryPolicy | companyId, approvalMatrix (JSON) |
| TreasuryAlert | `treasury_alerts` | TreasuryAlert | companyId, severity, category, metadata (JSON) |
| TreasurySnapshot | `treasury_snapshots` | TreasurySnapshot | companyId, positionsByCurrency (JSON) |

## Model Conventions

| Convention | Rule |
|---|---|
| ID | CUID auto-generated, String @id @default(cuid()) |
| Timestamps | createdAt, updatedAt on every model |
| Soft Delete | Supported via isActive/isReleased/enabled booleans |
| JSON Fields | Used for complex nested objects (instruments, holdings, rules, etc.) |
| Decimal | `@db.Decimal(38, 12)` for all monetary amounts |
| Foreign Keys | companyId → Company.id with onDelete: Cascade |
| Indexes | companyId + filter fields for query performance |

## Enum Mapping

Domain enums are stored as String fields in Prisma models. This avoids Prisma enum generation complexity and allows flexible evolution.

| Domain Enum | Stored As |
|---|---|
| CashClassification | String |
| LiquidityCategory | String |
| PoolType | String |
| FundingType | String |
| FundingStatus | String |
| ForecastHorizon | String |
| ForecastConfidence | String |
| FXExposureDirection | String |
| HedgeStatus | String |
| CounterpartyType | String |
| CounterpartyStatus | String |
| CashPolicyType | String |
| TreasuryAlertSeverity | String |
| TreasuryAlertCategory | String |
| RestrictionType | String |
| InvestmentStrategy | String |

## Existing Models Consumed

The following existing Prisma models are also consumed by treasury domain services:

| Model | Purpose |
|---|---|
| TreasuryAccount | Bank account registry with Plaid integration |
| AccountControl | Account-level spending/velocity limits |
| InternalTransfer | Inter-account transfers |
| ExchangeRate | FX rate storage |
| RiskAlert | Risk alert management |
| Policy | Policy engine rules |
| AuditLog | Audit trail |
| SyncLog | Synchronization history |
