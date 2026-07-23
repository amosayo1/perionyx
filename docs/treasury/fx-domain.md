# FX Domain

## Currency Types

Each legal entity operates with up to 4 currency types:

| Currency Type | Purpose |
|---|---|
| **Base** | Primary currency for cash management decisions |
| **Functional** | Primary economic environment currency (IAS 21) |
| **Reporting** | Consolidation and reporting currency |
| **Settlement** | Currency used for specific transaction settlement |

## FX Exposure

```
FXExposure {
  sourceCurrency, targetCurrency
  exposureAmount, exposureDirection (LONG | SHORT | FLAT)
  currentRate, previousRate, rateChange
  unrealizedPnl, realizedPnl
  hedgeStatus (NONE | PARTIALLY_HEDGED | FULLY_HEDGED | EXPIRED)
  policyLimit, breachLimit
}
```

**Exposure Direction:**

- **LONG**: Benefiting from FX appreciation (assets > liabilities in currency)
- **SHORT**: Benefiting from FX depreciation (liabilities > assets in currency)
- **FLAT**: No net exposure

**Unrealized P&L:** `exposureAmount × ((currentRate - previousRate) / previousRate)`

## Net Exposure Calculation

```
NetExposure {
  totalExposure  = sum of all absolute exposures
  longExposure   = sum of LONG exposures
  shortExposure  = sum of SHORT exposures
  netExposure    = longExposure - shortExposure
}
```

## Hedge Status

| Status | Meaning |
|---|---|
| **NONE** | No hedging instruments in place |
| **PARTIALLY_HEDGED** | Portion of exposure hedged (forwards, options) |
| **FULLY_HEDGED** | Full coverage through hedging instruments |
| **EXPIRED** | Hedge instrument has matured |

## Policy Enforcement

`FXExposureEngine.checkPolicyLimit()` compares exposure against configured limits and marks `breachLimit` if exceeded. Breaches generate `FX_EXPOSURE_LIMIT` alerts.

## Counterparty Risk

```
CounterpartyRisk {
  counterpartyId, counterpartyName
  counterpartyType (BANK | FINANCIAL_INSTITUTION | CORPORATE | GOVERNMENT | CLEARING_HOUSE)
  creditRating
  exposureAmount, exposureLimit, utilizationPercent
  collateralHeld, daysOverLimit
  status (ACTIVE | WATCH | RESTRICTED | SUSPENDED)
  riskScore (0-100)
}
```

Auto-escalation:
- **>80% utilization**: Watch status
- **>100% utilization**: Restricted → Suspended (after 30 days over limit)

## AI Readiness

The FX domain is designed for future AI integration:

- **FX Prediction**: `historicalRate` trends enable rate forecasting
- **Hedge Recommendation**: Exposure + market data → optimal hedge ratio
- **Currency Risk Detection**: Anomaly detection on rate changes
- **Optimal Settlement**: Route payments through lowest-cost currency path

## Multi-currency Data Flow

```
Bank Account (any currency)
        │
        ▼
FXExposureEngine.computeExposure()
        │
        ├── Per currency pair
        ├── Uses current & historical rates
        └── Flags policy breaches
        │
        ▼
TreasuryService aggregates into CurrencyPosition[]
        │
        ▼
TreasurySnapshot includes positionsByCurrency
        │
        ▼
AnalyticsEngine.computeConcentrationRisk()
```
