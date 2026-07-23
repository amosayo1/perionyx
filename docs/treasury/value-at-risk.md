# Value at Risk (VaR)

## Overview

Value at Risk measures the potential loss in portfolio value over a specified time period at a given confidence level. The VaR module provides 1-day, 10-day, and 30-day VaR at 95% and 99% confidence levels using three methodologies.

## VaR Metrics

| Horizon | 95% Confidence | 99% Confidence |
|---|---|---|
| 1-day | $12.5M | $18.2M |
| 10-day | $39.5M | $57.6M |
| 30-day | $68.4M | $99.8M |

## Methodologies

| Methodology | 1d95 Value | Description |
|---|---|---|
| Historical | $12.5M | Uses 252-day historical window |
| Parametric | $11.8M | Assumes normal distribution |
| Monte Carlo | $13.2M | 10,000 simulations |

## Portfolio Value

Total portfolio value for VaR calculation: $2.45B

## Daily VaR Trend

The VaRTrendChart tracks 1-day 95% VaR over 12 monthly periods, showing how risk exposure evolves over time.

## Limitations

- **Historical**: Assumes past patterns repeat — may miss new risks
- **Parametric**: Assumes normal distribution — underestimates tail risk
- **Monte Carlo**: Most comprehensive but model-dependent

## VaR Policy Limits

| Limit | Threshold | Current | Status |
|---|---|---|---|
| 1d95 Max | $20M | $12.5M | Compliant |
| 10d95 Max | $60M | $39.5M | Compliant |
| 30d95 Max | $100M | $68.4M | Compliant |
