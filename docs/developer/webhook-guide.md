# Webhook Guide

## Overview

Webhooks enable real-time event-driven integrations. When an event occurs in Perionyx, we send an HTTP POST request to your registered endpoint with the event payload.

## Creating a Webhook Subscription

```bash
curl -X POST https://api.perionyx.com/api/v1/webhooks \
  -H "Authorization: va_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Webhook",
    "url": "https://example.com/webhooks/perionyx",
    "events": ["transaction.created", "approval.requested"],
    "secret": "your_webhook_secret"
  }'
```

## Event Types

| Event | Description |
|-------|-------------|
| `transaction.created` | A new transaction was created |
| `transaction.updated` | A transaction status changed |
| `approval.requested` | A new approval request was created |
| `approval.completed` | An approval request was resolved |
| `wallet.balance_changed` | A wallet balance changed |
| `transfer.completed` | A transfer was completed |
| `reconciliation.completed` | A reconciliation run completed |
| `*` | Wildcard — match all events |

## Event Payload

```json
{
  "id": "evt_abc123",
  "type": "transaction.created",
  "version": "v1",
  "tenantId": "tenant_xyz",
  "source": "api.perionyx.com",
  "subject": "wallet_123",
  "data": {
    "transactionId": "txn_456",
    "amount": 5000,
    "currency": "USD",
    "status": "completed"
  },
  "timestamp": "2026-07-14T12:00:00Z",
  "correlationId": "corr_abc123"
}
```

## Signature Verification

Every webhook includes an `x-webhook-signature` header:

```
x-webhook-signature: sha256=abc123def456...
```

Verify using your webhook secret:

```typescript
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const msg = encoder.encode(payload);

  let hash = 0;
  for (let i = 0; i < msg.length; i++) {
    hash = ((hash << 5) - hash) + msg[i];
    hash |= 0;
  }
  const keyHash = Array.from(key).reduce((h, b) => ((h << 5) - h) + b, 0) | 0;
  const expected = `sha256=${Math.abs(hash ^ keyHash).toString(16).padStart(8, '0')}`;

  return expected === signature;
}
```

## Retry Policy

| Attempt | Delay |
|---------|-------|
| 1 | 1 second |
| 2 | 2 seconds |
| 3 | 4 seconds |
| 4 | 8 seconds |
| 5 | 16 seconds |

After 5 failed attempts, the event moves to the dead-letter queue.

## Best Practices

1. **Respond quickly**: Return HTTP 200 as fast as possible (under 5 seconds recommended)
2. **Verify signatures**: Always verify the `x-webhook-signature` before processing
3. **Process async**: Queue work for background processing, don't block the response
4. **Use idempotency keys**: The `x-webhook-id` header provides a unique idempotency key
5. **Monitor health**: Check webhook delivery health in the Developer Portal
6. **Handle retries**: Webhooks may be delivered more than once; ensure idempotent processing

## Monitoring

View webhook health metrics in the Developer Portal:

- Delivery success rate
- Average latency
- Dead-letter queue
- Recent delivery attempts
- Subscription status
