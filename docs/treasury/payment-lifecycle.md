# Payment Lifecycle

## Stages

The payment lifecycle spans eight stages from creation to settlement:

```
Draft → Pending Approval → Approved → Queued → Processing → Settled
  ↓         ↓                  ↓          ↓         ↓
Cancelled  Rejected        Cancelled  Cancelled  Failed
```

### 1. Draft
- Payment initialized but not submitted
- Editable, no approval required
- Can be deleted

### 2. Pending Approval
- Submitted for authorization
- Approval chain evaluated based on amount, risk, policy
- SLA timer active
- Can be rejected, approved, or changes requested

### 3. Approved
- All required approvals obtained
- Queued for execution
- Editable only by authorized treasury staff

### 4. Queued
- Awaiting execution window
- Batched with other payments for efficiency
- Can be cancelled before execution

### 5. Processing
- Sent to bank/rail for execution
- No modifications possible
- Settlement confirmation pending

### 6. Settled
- Funds transferred successfully
- Confirmation code received
- Reconciliation ready

### 7. Failed
- Execution unsuccessful
- Error message captured
- Retry or cancel options available

### 8. Cancelled
- Terminated before settlement
- Full audit trail preserved

## SLA Tracking

| Priority | SLA Target | Auto-Escalation |
|---|---|---|
| Urgent | 30 minutes | 15 min |
| High | 2 hours | 1 hr |
| Normal | 8 hours | 4 hr |
| Low | 24 hours | 12 hr |

## Settlement Process

1. Payment approved and queued
2. Payment sent via selected rail
3. Rail processes transaction (varies by type: instant, same-day, multi-day)
4. Settlement confirmation received
5. Payment marked as settled
6. Reconciliation triggered
