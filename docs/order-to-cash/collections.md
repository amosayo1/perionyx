# Collections

## Collections Workflow

The collections module manages the process of collecting overdue payments from customers. `CollectionsService` tracks individual collection cases through their lifecycle:

```
Active → Promise to Pay → [Follow-up] → Resolved
   ↓                                        ↓
Escalated → [Level 1, 2, 3] → [Resolution] → Resolved / Written Off
```

## Collection Case Status

| Status | Description |
|--------|-------------|
| `active` | Case is open and being worked |
| `resolved` | Payment received or case closed |
| `escalated` | Case escalated to higher authority |
| `promise-to-pay` | Customer has committed to a payment date |

## Escalation Levels

Cases can be escalated through multiple levels as urgency increases:

| Level | Description | Typical Action |
|-------|-------------|----------------|
| Level 1 | Standard follow-up | Email reminder, phone call |
| Level 2 | Supervisor involvement | Formal letter, supervisor call |
| Level 3 | Management escalation | Legal notice, payment plan negotiation |

## Collection Actions

Each case records the recommended action type:

| Action | Description |
|--------|-------------|
| `call` | Phone call to customer |
| `email` | Email reminder/notification |
| `letter` | Formal collection letter |
| `visit` | In-person visit |
| `escalate` | Escalate to next level |
| `write-off` | Recommend write-off as uncollectible |

## Promises to Pay

Customers may commit to a payment plan:
- `promiseDate`: Date customer promises to pay
- `promiseAmount`: Amount customer promises to pay
- If promise is kept → case resolves
- If promise is broken → case escalates

## Dispute Tracking

Collection cases linked to disputed invoices track the dispute resolution process:
- Dispute reason from AR record
- Customer contact information for resolution
- Escalation triggers if dispute remains unresolved

## Reminder Schedule

Collection reminders follow an automated schedule:
1. **Day 0**: Invoice sent notification
2. **Day 1 past due**: First reminder (email)
3. **Day 15 past due**: Second reminder (email + call)
4. **Day 30 past due**: Third reminder (formal letter)
5. **Day 45 past due**: Supervisor escalation
6. **Day 60 past due**: Management escalation
7. **Day 90+ past due**: Final notice / write-off consideration

## Key Metrics

| Metric | Calculation |
|--------|-------------|
| Total Cases | `count()` |
| Active Cases | `getActive().length` |
| Resolution Rate | `resolved / total * 100` |
| Average Resolution Time | Average days from case creation to resolution |
| Escalation Rate | `escalated / active * 100` |
