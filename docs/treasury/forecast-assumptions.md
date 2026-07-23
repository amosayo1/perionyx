# Forecast Assumptions

## Overview

The Forecast Assumptions Panel manages the underlying assumptions that drive all cash forecasts. Each assumption has a current value, trend, confidence level, and sensitivity rating.

## Assumption Categories

| Category | Examples | Sensitivity |
|---|---|---|
| Revenue Growth | Growth rate, new business pipeline | High |
| Expense Growth | Operating expense inflation | Medium |
| FX Rates | Major currency pair forecasts | High |
| Inflation | CPI, PPI indices | Medium |
| Interest Rates | Central bank rates, LIBOR/SOFR | High |
| Tax Rates | Effective tax rate by jurisdiction | Low |
| Working Capital | DSO, DPO, inventory turns | Medium |
| Collection Days | Customer payment timing | Medium |
| Payment Days | Vendor payment timing | Low |
| CapEx | Capital expenditure budget | High |
| Hiring | Headcount growth plan | Medium |
| Seasonality | Monthly/quarterly patterns | Medium |

## Assumption Components

Each assumption tracks:
- **Current Value**: The value used in current forecast
- **Previous Value**: The value from previous forecast
- **Change**: Absolute and percentage change
- **Trend**: Direction of change (up/down/stable)
- **Confidence**: How certain we are about the assumption (0-100%)
- **Source**: Where the assumption comes from
- **Last Updated**: When the assumption was last revised
- **Sensitivity**: How sensitive the forecast is to this assumption

## Confidence Scoring

| Confidence | Meaning | Update Frequency |
|---|---|---|
| 90-100% | Highly certain | Annually |
| 75-89% | Reasonably certain | Quarterly |
| 60-74% | Moderately certain | Monthly |
| <60% | Uncertain | Weekly review |

## Sensitivity Analysis

The ForecastSensitivityAnalysis evaluates 12 variables to determine which assumptions have the greatest impact on forecast outcomes. Variables are ranked by absolute impact and color-coded by direction (positive/negative).
