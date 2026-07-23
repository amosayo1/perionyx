# Treasury KPI Matrix

## Primary KPIs

| KPI | Formula | Purpose | Target |
|---|---|---|---|
| **Total Cash** | Σ all cash positions | Overall liquidity available to the enterprise | Track trend |
| **Available Cash** | Σ availableBalance | Cash immediately accessible for operations | Maximize |
| **Restricted Cash** | Σ restrictedBalance | Cash not available due to legal/regulatory constraints | Minimize |
| **Idle Cash** | Total - Restricted - Operating | Cash not earning returns | Minimize |
| **Working Capital** | Current Assets - Current Liabilities | Short-term financial health | Positive & growing |
| **Net Liquidity** | Σ immediate liquidity | Emergency coverage capacity | > 25% of total |

## Secondary KPIs

| KPI | Formula | Purpose |
|---|---|---|
| **Liquidity Ratio** | Immediate Liquidity / Total Cash | Liquidity buffer adequacy |
| **Current Ratio** | Current Assets / Current Liabilities | Short-term solvency |
| **Quick Ratio** | (Current Assets - Inventory) / Current Liabilities | Immediate solvency |
| **Cash Velocity** | Immediate / Total Cash | Cash efficiency |
| **Funding Efficiency** | 1 - (violations / funding requests) | Operational effectiveness |
| **Concentration Risk** | Max currency position / Total | Diversification measure |
| **Forecast Accuracy** | 1 - \|forecasted - actual\| / \|forecasted\| | Prediction reliability |

## Regional KPIs

| KPI | Calculation |
|---|---|
| Regional Cash % | Regional total / Enterprise total |
| Regional Availability | Available / Total per region |
| Regional Liquidity Score | Composite: availability, health, trend |

## Entity KPIs

| KPI | Calculation |
|---|---|
| Entity Working Capital | Current Assets - Current Liabilities per entity |
| Entity Liquidity Score | Weighted: availability(40%), health(30%), trend(30%) |
| Entity Daily Change | Day-over-day cash position delta |

## Currency KPIs

| KPI | Calculation |
|---|---|
| FX Exposure | Functional amount - Reporting amount |
| FX Risk | Low (<$5M), Medium ($5-50M), High (>$50M) |
| % of Total | Currency balance / Total cash |

## Institution KPIs

| KPI | Calculation |
|---|---|
| Relationship Health | Composite: liquidity score, sync health, credential status |
| Cash Concentration | Institution cash / Total cash (per counterparty limit) |
| Account Utilization | Available / Total per institution |

## Alert Thresholds

| Alert | Threshold | Severity |
|---|---|---|
| Minimum Cash Breach | balance < policy minimum | CRITICAL |
| Liquidity Buffer | available < 25% of total | WARNING |
| FX Exposure | exposure > policy limit | WARNING |
| Credential Expiring | < 7 days to expiry | WARNING |
| Forecast Deviation | actual vs forecast > 10% | INFO |

## Trend Analysis

- **Daily Change**: current total cash - previous closing
- **Weekly Change**: current - 7 days ago
- **Monthly Change**: current - 30 days ago
- **Direction**: up (>0.5%), down (<-0.5%), stable (between)
