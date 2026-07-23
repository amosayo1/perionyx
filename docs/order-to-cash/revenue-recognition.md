# Revenue Recognition

## ASC 606 Compliance

The Revenue Recognition module is designed to support ASC 606 (Revenue from Contracts with Customers) compliance. It provides flexible scheduling and recognition methods to handle diverse revenue arrangements.

## Recognition Methods

| Method | Description | Use Case |
|--------|-------------|----------|
| `immediate` | Revenue recognized in full at point of delivery | Standard product sales, one-time services |
| `deferred` | Revenue deferred and recognized over time | Prepaid services, maintenance contracts |
| `accrued` | Revenue accrued before invoicing | Long-term services, ongoing subscriptions |
| `milestone` | Revenue recognized at project milestones | Construction, consulting engagements |
| `subscription` | Revenue recognized ratably over subscription period | SaaS, membership programs |
| `project` | Revenue recognized based on percentage of completion | Multi-period projects, custom development |

## Revenue Schedule Lifecycle

Each revenue schedule tracks progress through its lifecycle:

```
Scheduled → [Partial Recognition] → Recognized
                                     ↓
                                Deferred / Cancelled
```

| Status | Description |
|--------|-------------|
| `scheduled` | Revenue is scheduled for future recognition |
| `recognized` | Revenue has been fully recognized |
| `deferred` | Revenue is being deferred to future periods |
| `cancelled` | Revenue schedule has been cancelled |

## Schedule Structure

Each `RevenueSchedule` tracks:
- Total amount to be recognized
- Amount already recognized
- Amount deferred to future periods
- Number of periods for recognition
- Current period in the schedule
- Scheduled date and actual recognition date
- Links to originating invoice and/or sales order

## GL Integration

Revenue schedules interact with the accounting GL:
- `recognizedAmount` → Debit AR, Credit Revenue (via `accountCode`)
- `deferredAmount` → Debit AR, Credit Deferred Revenue (liability account)
- Each schedule carries the originating invoice's account codes for proper GL posting

## Key Metrics

| Metric | Calculation |
|--------|-------------|
| Total Schedules | `count()` |
| Schedule Value | Sum of `totalAmount` |
| Recognized Revenue | Sum of `recognizedAmount` for `recognized` schedules |
| Deferred Revenue | Sum of `deferredAmount` for `deferred` schedules |
| Pending Recognition | Sum of `totalAmount - recognizedAmount` for active schedules |
