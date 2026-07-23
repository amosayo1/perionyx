# Rolling Forecast Model

## Overview

The rolling forecast provides continuous forward-looking cash visibility by updating forecasts on a rolling basis. The model supports three horizons: 13-week, 26-week, and 52-week.

## Forecast Structure

Each forecast period contains:
- **Opening Cash**: Starting cash balance
- **Inflows**: Expected cash receipts
- **Outflows**: Expected cash payments
- **Net Cash Flow**: Inflows minus outflows
- **Operating Cash**: Cash from operations
- **Investing Cash**: Cash from investments
- **Financing Cash**: Cash from financing activities
- **FX Impact**: Foreign exchange effects
- **Taxes**: Tax payments
- **Ending Cash**: Closing cash balance
- **Confidence**: Forecast confidence percentage

## Horizons

### 13-Week Rolling
- Granular weekly detail
- Used for tactical cash management
- Updated weekly with actuals
- Confidence: 85-95%

### 26-Week Rolling
- Bi-weekly or monthly detail
- Used for operational planning
- Updated bi-weekly
- Confidence: 75-85%

### 52-Week Rolling
- Monthly detail
- Used for strategic planning
- Updated monthly
- Confidence: 60-75%

## Update Cycle

1. Week closes → actual cash flows recorded
2. Remaining forecast periods adjusted
3. New week added to maintain horizon
4. Confidence recalculated based on variance
5. Variance analysis generated

## Confidence Calculation

```
confidence = 100% - (weighted_variance * 100)
weighted_variance = sum(variance_i * recency_weight_i)
```

More recent periods have higher weight in confidence calculation.
