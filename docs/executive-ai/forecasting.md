# AI Forecasting

## Overview

The forecasting engine generates multi-horizon predictions with confidence intervals across enterprise domains. Forecasts include historical values, projected values, lower/upper bounds, trend direction, and key drivers.

## Forecast Horizons

| Horizon | Range | Use Case |
|---|---|---|
| 7-days | 1 week | Short-term cash/liquidity |
| 30-days | 1 month | Monthly planning |
| 90-days | 1 quarter | Quarterly review |
| quarter | 3 months | Strategic planning |
| year | 12 months | Annual budget |

## Forecast Structure

```typescript
interface AIForecast {
  domain: string;              // treasury, order-to-cash, etc.
  metric: string;              // cash-balance, revenue, etc.
  horizon: ForecastHorizon;
  historicalValues: number[];  // past observations
  forecastValues: number[];    // predicted values
  lowerBound: number[];        // lower confidence interval
  upperBound: number[];        // upper confidence interval
  confidence: ConfidenceLevel;
  trend: "increasing" | "decreasing" | "stable";
  keyDrivers: string[];        // factors influencing forecast
}
```

## Seed Forecasts

| Domain | Metric | Horizon | Trend |
|---|---|---|---|
| Treasury | cash-balance | 30-days | Increasing |
| Order-to-Cash | revenue | Quarter | Increasing |
| General Ledger | operating-expense | 30-days | Increasing |
| Risk | risk-score | 90-days | Decreasing |

## Visualization

The `ForecastChart` component renders inline SVG line charts with:
- Historical data (solid blue line)
- Forecast data (dashed gold line)
- Confidence band (gold gradient fill)
- Data points with hover-ready circles
- Key drivers as tag chips
