# Credit Management

## Overview

The Credit Management module provides tools for assessing, assigning, and monitoring customer credit. It integrates with the customer lifecycle and sales order workflow to prevent orders that would exceed credit limits.

## Credit Profiles

Each customer has a `CreditProfile` managed by `CreditService`:

| Field | Type | Description |
|-------|------|-------------|
| `creditLimit` | number | Maximum outstanding balance |
| `creditUtilization` | number | Current outstanding balance |
| `creditAvailable` | number | `creditLimit - creditUtilization` |
| `utilizationPercent` | number | `(creditUtilization / creditLimit) * 100` |
| `onHold` | boolean | If true, new orders and shipments are blocked |
| `holdReason` | string | Reason for credit hold |
| `riskScore` | number | Computed risk score (0-100) |
| `riskRating` | `low` / `medium` / `high` / `critical` | Risk rating derived from risk score |
| `decision` | `approved` / `denied` / `pending-review` / `reduced` | Credit decision status |
| `lastReviewDate` | Date | Date of last credit review |

## Credit Approval Workflow

```
Application → Review → [Decision]
                          ├→ Approved (credit limit assigned)
                          ├→ Reduced (lower limit than requested)
                          ├→ Denied (no credit extended)
                          └→ Pending Review (additional information needed)
```

## Risk Scoring

Risk scores are computed using:
- Payment history (avg payment days, late payment frequency)
- Current exposure (credit utilization, outstanding AR)
- Customer age and relationship duration
- Industry and geographic factors
- External credit bureau data (planned)

Risk ratings by score:
| Score Range | Rating | Action |
|-------------|--------|--------|
| 0–20 | low | Standard terms, auto-approval |
| 21–40 | medium | Regular monitoring, occasional manual review |
| 41–70 | high | Manual approval required, reduced limits |
| 71–100 | critical | Credit hold, prepayment required |

## Credit Holds

When a customer's credit profile is placed on hold:
1. New sales orders are blocked
2. Order fulfillment is paused
3. Shipments are prevented
4. An alert is generated for the credit team

Holds can be placed automatically (utilization > 90%) or manually by credit analysts.

## Utilization Tracking

Credit utilization is monitored in real-time:
- Each invoice increases utilization
- Each payment (cash application) decreases utilization
- Utilization percentage = `(total outstanding / credit limit) * 100`

Thresholds:
- < 70%: Healthy
- 70–90%: Warning — approaching limit
- > 90%: Critical — potential hold

## Integration with Sales Orders

When a sales order is submitted:
1. System checks customer's credit profile
2. Verifies sufficient credit available for the order amount
3. If on hold or insufficient credit: order is flagged, approval workflow triggered
4. If credit OK: order proceeds to fulfillment

## Key Metrics

| Metric | Calculation |
|--------|-------------|
| Credit Profiles | `count()` |
| Total Credit Extended | Sum of all `creditLimit` |
| Total Utilization | Sum of all `creditUtilization` |
| On Hold Count | `getOnHold().length` |
| High Risk Count | `getByRiskRating("high" \| "critical").length` |
| Average Utilization | `totalUtilization / totalCreditLimit * 100` |
