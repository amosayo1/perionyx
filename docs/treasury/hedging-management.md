# Hedging Management

## Overview

The Hedging Portfolio module manages all hedging instruments including forwards, options, swaps, and natural hedges, tracking coverage ratios, effectiveness, and counterparty exposure.

## Hedge Types

| Type | Description | Use Case |
|---|---|---|
| Forward | OTC contract to exchange currency at future date | Core FX hedging |
| Option | Right but not obligation to exchange | Risk management |
| Swap | Exchange of cash flows over time | Interest rate/long-dated |
| Natural | Operational offset (revenues/expenses in same currency) | Cost-effective |

## Hedge Effectiveness

Effectiveness measures how well hedges offset underlying exposure:
```
effectiveness = 1 - (abs(hedge_pnl - exposure_pnl) / max(abs(hedge_pnl), abs(exposure_pnl)))
```

| Effectiveness | Rating | Action |
|---|---|---|
| >90% | Highly effective | Continue strategy |
| 75-90% | Effective | Review periodically |
| <75% | Ineffective | Restructure hedge |

## Coverage Ratio

Coverage percentage represents the proportion of gross exposure that is hedged:
```
coverage = hedged_amount / gross_exposure × 100
```

| Coverage | Status | Action |
|---|---|---|
| >80% | Well hedged | Standard monitoring |
| 60-80% | Partially hedged | Consider additional hedges |
| <60% | Under-hedged | Urgent review required |

## Derivative Instruments

| Instrument | Count | Total Notional |
|---|---|---|
| Forward Contracts | 20 | $450M |
| Options | 15 | $180M |
| Swaps | 12 | $320M |
| Futures | 5 | $95M |
| NDFs | 8 | $120M |
