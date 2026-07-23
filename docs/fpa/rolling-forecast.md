# Rolling Forecast

## Overview

Rolling forecasts provide continuously updated forward-looking projections with configurable time windows, periodic updates, and confidence tracking.

## Rolling Windows

| Window | Description |
|--------|-------------|
| 3-month | Short-term tactical forecast |
| 6-month | Near-term operational forecast |
| 12-month | Annual forward-looking forecast |
| 18-month | Extended planning horizon |
| 24-month | Strategic planning horizon |

## Forecast Status

| Status | Description |
|--------|-------------|
| active | Currently being updated and used |
| paused | Temporarily suspended |
| completed | Forecast period ended |
| archived | Historical record |

## Frequency

Rolling forecasts update on a schedule:
- **Monthly** — Updated every month with the latest actuals
- **Quarterly** — Updated every quarter

## Confidence Intervals

Each rolling forecast item includes a confidence score (0.0–1.0) that reflects the reliability of the projection. Items closer to the current period typically have higher confidence, while items further in the future have lower confidence.

## RollingForecastService Methods

| Method | Description |
|--------|-------------|
| `addForecast(forecast)` | Add a new rolling forecast |
| `getForecast(id)` | Get forecast by ID |
| `getAllForecasts()` | Get all rolling forecasts |
| `getByWindow(window)` | Filter by rolling window |
| `getActive()` | Get all active forecasts |
| `addItem(item)` | Add item to existing forecast |
| `getItems(forecastId)` | Get items for a forecast |
| `count()` | Total forecast count |

## Usage

```typescript
import { fpaService } from "@/server/fpa";

// Get all rolling forecasts
const forecasts = fpaService.rollingForecast.getAllForecasts();

// Get only active forecasts
const active = fpaService.rollingForecast.getActive();

// Get 12-month rolling forecasts
const annual = fpaService.rollingForecast.getByWindow("12-month");
```
