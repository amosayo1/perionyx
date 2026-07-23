# Country Risk

## Overview

The Country Risk module assesses geopolitical and economic risk across 18 countries where Perionyx operates, measuring political, economic, and currency risk components.

## Risk Dimensions

### Political Risk (0-100)
- Government stability
- Regulatory environment
- Corruption perception
- Rule of law
- Trade policy

### Economic Risk (0-100)
- GDP growth trajectory
- Inflation rate
- Unemployment
- Fiscal balance
- External debt

### Currency Risk (0-100)
- Exchange rate volatility
- Capital controls
- Reserve adequacy
- Current account balance

## Composite Score

```
composite_score = (political × 0.35) + (economic × 0.35) + (currency × 0.30)
```

## Risk Classification

| Score | Level | Color | Action |
|---|---|---|---|
| <30 | Low | Green | Standard operations |
| 30-50 | Medium | Blue | Enhanced monitoring |
| 50-70 | High | Amber | Exposure review, hedging required |
| >70 | Critical | Red | Immediate risk committee |

## Trend Tracking

| Trend | Meaning | Color |
|---|---|---|
| Improving | Score decreasing | Green |
| Stable | Score unchanged | Blue |
| Deteriorating | Score increasing | Red |

## Country Exposure Policy

| Risk Level | Limit | Current Max |
|---|---|---|
| Low | $500M | $380M (US) |
| Medium | $250M | $195M (Germany) |
| High | $100M | $85M (Brazil) |
| Critical | $25M | $18M (Nigeria) |
