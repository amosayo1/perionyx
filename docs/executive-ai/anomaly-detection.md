# Anomaly Detection

## Overview

The anomaly detection system identifies statistical outliers and unusual patterns across enterprise metrics. Each anomaly records expected vs actual values, variance, and severity.

## Detection Model

The `AnomalyService` stores anomalies detected by the `anomaly-detector-v2` model (94.2% accuracy). Detection criteria:

- **Cash anomalies**: Balance drops >20% below forecast
- **Revenue anomalies**: Revenue spikes >30% above/below forecast
- **Expense anomalies**: Operating costs >5% above budget
- **Compliance anomalies**: Score drops >15 points
- **Risk anomalies**: Hedge effectiveness drops >25%

## Anomaly Structure

```typescript
interface AnomalyDetection {
  id: string;
  entityType: string;      // account, region, cost-center, etc.
  entityId: string;        // specific entity identifier
  metric: string;          // measured metric name
  expectedValue: number;   // predicted or budgeted value
  actualValue: number;     // observed value
  variance: number;        // actual - expected
  variancePercent: number; // variance / expected * 100
  severity: AnomalySeverity;
  category: InsightCategory;
  description: string;
  detectedAt: Date;
  acknowledged: boolean;   // reviewed by human
}
```

## Visualization

The `AnomalyChart` component renders inline SVG bars comparing expected vs actual values for the top 5 anomalies, with color-coded variance percentages.
