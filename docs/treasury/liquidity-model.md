# Liquidity Model

## Liquidity Categories

Cash and cash-equivalents are categorized by settlement time:

| Category | Days to Liquidate | Examples |
|---|---|---|
| **Immediate** | 0 | Demand deposits, checking accounts |
| **Same Day** | ≤1 | Wire transfers, same-day ACH |
| **T+1** | ≤2 | Standard ACH, SEPA, Faster Payments |
| **Short Term** | ≤30 | Money market funds, T-bills (<30d) |
| **Medium Term** | ≤180 | Commercial paper, CDs, T-bills (30-180d) |
| **Long Term** | >180 | Corporate bonds, structured deposits |

## Liquidity Position

```
LiquidityPosition {
  id, companyId, legalEntityId, region, currency
  category: LiquidityCategory
  amount, percentageOfTotal
  daysToLiquidate
  instruments: LiquidityInstrument[]
  lastCalculatedAt
}
```

## Liquidity Instruments

Each instrument includes a **haircut** (discount to market value for liquidation cost):

```
LiquidityInstrument {
  type, description, amount, currency
  maturityDate, daysToLiquidate
  haircut           // e.g., 0.02 = 2% discount
}
```

The liquid value = amount × (1 - haircut).

## Liquidity Ratios

- **Immediate Liquidity** = all cash in IMMEDIATE category
- **Short-term Liquidity** = IMMEDIATE + SAME_DAY + T_PLUS_1 + SHORT_TERM
- **Liquidity Ratio** = Immediate Liquidity / Short-term Obligations
- **Cash Velocity** = Immediate Liquidity / Total Cash

## Cash Pools

Five pool types supported:

| Pool Type | Mechanism | Interest Calculation |
|---|---|---|
| **Physical** | Actual cash sweeps | At pool rate |
| **Notional** | Virtual aggregation | At member rates |
| **Regional** | Regional consolidation | Regional pool rate |
| **Currency** | Per-currency pooling | Currency-specific |
| **Virtual** | Accounting only | None |

Pool utilization = total member balance / target utilization.

Pool imbalance detection: alerts when member balances deviate > threshold% from targets.

## Key Metrics

- **Net Liquidity** = Total Available Cash (immediately accessible)
- **Liquidity Buffer** = % of total cash held in immediate/same-day categories
- **Pool Efficiency** = actual vs target utilization ratio
