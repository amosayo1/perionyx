# Risk Indicators (KRIs)

## Overview

Key Risk Indicators (KRIs) provide early warning signals by measuring risk levels against predetermined thresholds. KRIs are monitored continuously and trigger alerts when thresholds are breached.

## RiskIndicator Entity

| Field | Type | Description |
|---|---|---|
| id | string | Unique identifier |
| name | string | KRI name (e.g., "Value at Risk 95%") |
| description | string | Measurement definition |
| category | RiskCategory | Related risk category |
| value | number | Current measurement value |
| threshold | number | Breach threshold (red line) |
| warningThreshold | number | Warning threshold (yellow line) |
| status | KRIStatus | Normal, warning, breach |
| frequency | string | Monitoring frequency (Daily, Weekly, etc.) |
| owner | string | Responsible person |
| companyId | string | Tenant ID |

## Threshold Logic

```
Status = breach      if value >= threshold
Status = warning     if value >= warningThreshold && value < threshold
Status = normal      if value < warningThreshold
```

## Service API

```typescript
class RiskIndicatorService {
  add(item: RiskIndicator): RiskIndicator
  get(id: string): RiskIndicator | undefined
  getAll(): RiskIndicator[]
  update(id: string, update: Partial<RiskIndicator>): RiskIndicator | undefined
  delete(id: string): boolean
  getByCategory(category: RiskCategory): RiskIndicator[]
  getByStatus(status: KRIStatus): RiskIndicator[]
  getBreaches(): RiskIndicator[]
  getWarnings(): RiskIndicator[]
  count(): number
}
```
