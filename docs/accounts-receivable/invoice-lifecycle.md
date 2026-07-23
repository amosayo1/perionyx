# Invoice Lifecycle

## States
```
draft → pending → approved → sent → partial → paid
                                     ↓
                                overdue → disputed → creditMemos → writeOff
                                     ↓
                                cancelled / void
```

## Key Events
| Event | Description | GL Impact |
|---|---|---|
| Invoice Created | New invoice generated | Dr AR / Cr Revenue |
| Payment Received | Full or partial payment | Dr Cash / Cr AR |
| Dispute Filed | Customer disputes invoice | Status changes, freezes collection |
| Credit Note | Amount reduced | Dr Sales Returns / Cr AR |
| Write-off | Deemed uncollectible | Dr Bad Debt / Cr AR |
| Adjustment | Correction applied | Dr/Cr appropriate accounts |

## Aging Buckets
- Current: Due date not yet passed
- 1-30 days: Light follow-up
- 31-60 days: Active collection
- 61-90 days: Escalated collection
- 91+ days: Legal/recovery
