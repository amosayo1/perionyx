# Cash Runway Model

## Overview

Cash runway measures how many days the enterprise can continue operating at current cash burn rates before exhausting available cash. It is the single most important metric for treasury risk management.

## Formula

```
cash_runway = total_available_cash / daily_cash_burn
```

Where:
- **Total Available Cash**: Cash + cash equivalents + available credit lines
- **Daily Cash Burn**: Average daily net cash outflow (operating + investing)

## Runway Tiers

| Tier | Days | Classification | Response |
|---|---|---|---|
| 1 | >365 | Excellent | Strategic flexibility |
| 2 | 180-365 | Strong | Standard operations |
| 3 | 90-180 | Adequate | Monitor burn rate |
| 4 | 30-89 | Warning | Reduce discretionary spend |
| 5 | <30 | Critical | Emergency funding required |

## Runway by Scenario

The chart visualizes runway under different scenarios:
- **Base Case**: Expected runway (245 days)
- **Optimistic**: Extended runway (320+ days)
- **Pessimistic**: Reduced runway (120-180 days)
- **Stress Cases**: Severely reduced (30-90 days)

## Factors Affecting Runway

| Factor | Impact | Mitigation |
|---|---|---|
| Revenue decline | Reduces inflows, shortens runway | Diversify revenue |
| Expense increase | Increases burn, shortens runway | Cost reduction |
| Collection delay | Delays inflows, shortens runway | Accelerate collections |
| CapEx increase | Increases burn, shortens runway | Defer non-critical CapEx |
| FX movement | Variable impact | Hedging program |
| Interest rates | Affects debt service | Refinance strategy |

## Runway Trend

The CashRunwayChart tracks runway over 12 monthly periods, color-coded:
- **Green** (>180 days): Healthy
- **Amber** (90-180 days): Watch
- **Red** (<90 days): Warning
- **Dark red** (<30 days): Critical

## Monitoring

Cash runway is monitored daily with automated alerts when:
- Runway drops below 180 days → Weekly review triggered
- Runway drops below 90 days → Daily monitoring initiated
- Runway drops below 30 days → Emergency treasury meeting
