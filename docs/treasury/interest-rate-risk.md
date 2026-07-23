# Interest Rate Risk

## Overview

The Interest Rate Risk module monitors enterprise exposure to interest rate fluctuations across all debt and investment portfolios.

## Exposure Types

- **Fixed Rate**: Interest rate locked for term — no immediate exposure
- **Floating Rate**: Rate resets periodically — direct exposure to rate changes
- **Duration**: Weighted average time to repricing

## Key Metrics

| Metric | Value | Interpretation |
|---|---|---|
| Total Exposure | $1.2B | Total interest-bearing position |
| Fixed % | 55% | $660M fixed |
| Floating % | 45% | $540M floating |
| Avg Duration | 3.8 years | Medium-term profile |
| Sensitivity (100bps) | $8.2M | Annual impact per 100bps move |

## Sensitivity Analysis

Interest rate sensitivity measures the annual impact of a 100 basis point parallel shift in yield curves:
```
annual_impact = floating_exposure × rate_change × (1 - tax_rate)
```

## Duration Risk

| Duration | Risk Level | Action |
|---|---|---|
| <2 years | Low | Standard monitoring |
| 2-5 years | Medium | Review periodically |
| 5-7 years | High | Consider hedging |
| >7 years | Critical | Immediate review |

## Policy Limits

| Limit | Threshold | Current | Status |
|---|---|---|---|
| Floating % Max | 50% | 45% | Compliant |
| Duration Max | 5 years | 3.8 years | Compliant |
| Sensitivity Max | $10M | $8.2M | Compliant |
