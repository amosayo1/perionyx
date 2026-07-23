# Credit Management

## Components
- **Credit Limits** — Maximum credit extended per customer
- **Risk Ratings** — Low, Medium, High, Critical
- **Credit Reviews** — Periodic review of creditworthiness
- **Risk Scoring** — Algorithmic score based on utilization and payment history

## Risk Calculation
```
Risk Score = (Utilization × 0.5) + ((1 - Payment History) × 0.5)
```
Where:
- Utilization = Credit Used / Credit Limit
- Payment History = On-time payment ratio (0-1)

## Credit Review Process
1. **Trigger** — Based on schedule, utilization threshold, or manual request
2. **Assessment** — Review payment history, financial data, risk indicators
3. **Decision** — Approve, reject, or modify limit
4. **Implementation** — New limit applied, notification sent
