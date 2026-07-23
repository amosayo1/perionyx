# FX Management

## Overview

The FX Management module tracks foreign exchange exposure across all 12 currencies, measuring long and short positions, net exposure, hedge coverage, and policy compliance.

## Exposure Calculation

```
net_exposure = long_amount - short_amount
hedge_ratio = hedged_amount / gross_exposure
gain_loss = net_exposure * (current_rate - average_rate)
```

## Currency Coverage

| Currency | Net Exposure | Hedge % | Policy Status |
|---|---|---|---|
| USD | +$330M | 82% | Compliant |
| EUR | +$185M | 75% | Compliant |
| GBP | +$95M | 70% | Compliant |
| JPY | +$45M | 65% | Compliant |
| CHF | +$32M | 60% | Pending Review |
| AED | +$28M | 85% | Compliant |
| ZAR | +$15M | 55% | Breached |
| BRL | -$12M | 45% | Breached |
| SGD | +$18M | 72% | Compliant |
| INR | +$22M | 68% | Compliant |
| CNY | +$25M | 62% | Pending Review |
| AUD | +$20M | 78% | Compliant |

## FX Policy Limits

| Limit Type | Threshold | Current | Status |
|---|---|---|---|
| Single Currency Net | $500M | $330M (USD) | Compliant |
| Total Net Exposure | $1.5B | $985M | Compliant |
| Hedge Ratio Minimum | 60% | 68% | Compliant |
| Unhedged Limit | $500M | $312M | Compliant |

## FX Exposure Table

The FXExposureTable displays all 40 exposures grouped by currency with:
- Long, short, net amounts
- Functional and reporting currency
- Realized/unrealized gain/loss
- Hedge percentage with progress bar
- Policy compliance status badge
- Trend direction indicator
