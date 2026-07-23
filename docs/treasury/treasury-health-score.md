# Treasury Health Score

## Overview

The Treasury Health Score is a composite index measuring the overall health of the enterprise treasury function. It is prominently displayed in the executive header of the Command Center.

## Score Components

| Component | Weight | Current Score | Description |
|---|---|---|---|
| Liquidity | 20% | 94/100 | Available liquidity relative to requirements |
| Forecast Accuracy | 20% | 96/100 | Variance between forecast and actual |
| Payment Success | 15% | 98/100 | Successful payment rate |
| Bank Health | 15% | 92/100 | Banking relationship health scores |
| Compliance | 15% | 95/100 | Policy compliance and KYC status |
| Cash Availability | 15% | 97/100 | Available cash as % of total |

## Calculation

```
overall = round(
  liquidity × 0.20 +
  forecast_accuracy × 0.20 +
  payment_success × 0.15 +
  bank_health × 0.15 +
  compliance × 0.15 +
  cash_availability × 0.15
)
```

Current overall: **96/100** — **Excellent**

## Rating Scale

| Range | Label | Color | Action |
|---|---|---|---|
| 90-100 | Excellent | Gold | Standard monitoring |
| 75-89 | Good | Emerald | Periodic review |
| 50-74 | Fair | Amber | Identify improvements |
| <50 | Needs Attention | Red | Immediate action required |

## Trend Tracking

The health score is updated in real-time (mock) and can be tracked over time. Each component score shows direction (up/down/stable) to indicate recent changes.
