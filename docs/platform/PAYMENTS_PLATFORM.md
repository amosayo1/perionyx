# Payments Platform

**Platform**: PaymentsPlatform
**Contract**: PaymentsContract
**Mission**: Orchestrate the complete payment lifecycle — from proposal generation through approval, execution, settlement, and reconciliation — ensuring financial precision, audit trails, and segregation of duties for every monetary movement.
**Status**: Not Started (no dedicated Payments Platform — AP payment service and Banking payment service exist as isolated implementations)
**Constitutional Authority**: PLATFORM_CONSTITUTION.md — Law 6 ("Financial Integrity Is Never Compromised"), Law 7 ("Audit Trails Are Immutable"), Law 8 ("Financial Precision Is Non-Negotiable")

---

## Responsibilities

1. **Generate** payment proposals from approved invoices (AP) or treasury directives
2. **Route** proposals through approval workflows (role-based, amount-threshold)
3. **Enforce** segregation of duties (creator ≠ approver)
4. **Batch** approved payments into bank-ready payment files
5. **Execute** payments across multiple rails (ACH, wire, SEPA, SWIFT, check)
6. **Track** payment status through the full lifecycle (draft → submitted → settled → confirmed)
7. **Reconcile** payments against bank statements
8. **Reverse** or **cancel** payments with proper authorization and audit trail
9. **Maintain** idempotency for all payment operations (no double-pay)
10. **Apply** financial precision (banker's rounding, Decimal arithmetic) to all monetary values
11. **Record** immutable audit entries for every payment action
12. **Integrate** with GL for journal entry generation on payment events
13. **Support** multi-currency payments with exchange rate handling
14. **Enforce** dual-signature for high-value payments (>$100K)

---

## Public API (Capability Contract)

### PaymentsContract

```typescript
interface PaymentsContract {
  // Proposal Lifecycle
  generatePaymentProposal(ctx: TenantContext, cmd: GenerateProposalCommand): Promise<PaymentProposal>;
  reviewPaymentProposal(ctx: TenantContext, cmd: ReviewProposalCommand): Promise<PaymentProposal>;
  approvePaymentProposal(ctx: TenantContext, cmd: ApproveProposalCommand): Promise<PaymentProposal>;
  rejectPaymentProposal(ctx: TenantContext, cmd: RejectProposalCommand): Promise<PaymentProposal>;
  
  // Batch & Execution
  createPaymentBatch(ctx: TenantContext, cmd: CreateBatchCommand): Promise<PaymentBatch>;
  executePayment(ctx: TenantContext, cmd: ExecutePaymentCommand): Promise<PaymentRecord>;
  confirmPayment(ctx: TenantContext, cmd: ConfirmPaymentCommand): Promise<PaymentRecord>;
  
  // Safety Valves
  reversePayment(ctx: TenantContext, cmd: ReversePaymentCommand): Promise<PaymentRecord>;
  cancelPayment(ctx: TenantContext, cmd: CancelPaymentCommand): Promise<PaymentRecord>;
  
  // Queries
  getPaymentProposal(ctx: TenantContext, id: string): Promise<PaymentProposal | null>;
  listPaymentProposals(ctx: TenantContext, filters: ProposalFilters): Promise<PaginatedResult<PaymentProposal>>;
  getPaymentBatch(ctx: TenantContext, id: string): Promise<PaymentBatch | null>;
  listPaymentBatches(ctx: TenantContext, filters: BatchFilters): Promise<PaginatedResult<PaymentBatch>>;
  getPaymentRecord(ctx: TenantContext, id: string): Promise<PaymentRecord | null>;
  
  // Reconciliation
  reconcilePayment(ctx: TenantContext, paymentId: string, bankRef: string): Promise<void>;
  
  // Reporting
  getPaymentSummary(ctx: TenantContext, period: DateRange): Promise<PaymentSummary>;
  getPaymentAuditTrail(ctx: TenantContext, paymentId: string): Promise<AuditEntry[]>;
}
```

---

## Internal API

### Payment Service Architecture

| Layer | Location | Purpose |
|---|---|---|
| **AP Payment Service** | `src/server/procurement/application/payment-service.ts` | 9 AP payment commands (proposal → batch → execute → confirm → reverse → cancel) |
| **Banking Payment Service** | `src/server/banking/payments/payment-service.ts` | Banking-level payment order lifecycle |
| **Contract Interface** | (to be built) | Unified payment contract |
| **Payment Router** | (to be built) | Routes to AP or Banking service based on context |

### AP Payment Commands (Existing)

| Command | Method | Status |
|---|---|---|
| GeneratePaymentProposal | `generatePaymentProposal()` | Built |
| ReviewPaymentProposal | `reviewPaymentProposal()` | Built |
| ApprovePaymentProposal | `approvePaymentProposal()` | Built |
| RejectPaymentProposal | `rejectPaymentProposal()` | Built |
| CreatePaymentBatch | `createPaymentBatch()` | Built |
| ExecutePayment | `executePayment()` | Built |
| ConfirmPayment | `confirmPayment()` | Built |
| ReversePayment | `reversePayment()` | Built |
| CancelPayment | `cancelPayment()` | Built |

### Banking Payment Statuses (Existing)

```typescript
// Located at: src/server/banking/payments/payment-service.ts
enum PaymentStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  APPROVED = "APPROVED",
  SUBMITTED = "SUBMITTED",
  PROCESSING = "PROCESSING",
  SETTLED = "SETTLED",
  FAILED = "FAILED",
  REJECTED = "REJECTED",
  RETURNED = "RETURNED",
  REVERSED = "REVERSED",
  CANCELLED = "CANCELLED",
}
```

---

## Events

### Payment Lifecycle Events

| Event | Description | Payload |
|---|---|---|
| `payment.proposal.generated` | Proposal created | proposalId, invoiceCount, totalAmount |
| `payment.proposal.reviewed` | Proposal reviewed | proposalId, reviewedBy |
| `payment.proposal.approved` | Proposal approved | proposalId, approvedBy, totalAmount |
| `payment.proposal.rejected` | Proposal rejected | proposalId, rejectedBy, reason |
| `payment.batch.created` | Batch created | batchId, paymentCount, totalAmount |
| `payment.submitted` | Payment submitted to bank | batchId, paymentId, amount, method |
| `payment.confirmed` | Bank confirmed payment | batchId, paymentId, bankReference |
| `payment.reversed` | Payment reversed | batchId, paymentId, reason, amount |
| `payment.cancelled` | Payment cancelled | batchId, paymentId, reason |
| `payment.settled` | Payment settled | paymentId, settlementDate |
| `payment.failed` | Payment failed | paymentId, failureReason |
| `payment.returned` | Payment returned by bank | paymentId, returnReason |
| `payment.reconciliation.completed` | Reconciliation done | paymentId, bankRef |

### Event Producers

AP events produced by: `src/server/procurement/domain/events/event-types.ts`
Banking events produced by: Banking payment service

---

## Commands

| Command | Description | Permission | SoD |
|---|---|---|---|
| `generatePaymentProposal` | Create proposal from approved invoices | `ap.payments.propose` | No |
| `reviewPaymentProposal` | Review proposal before approval | `ap.payments.review` | No |
| `approvePaymentProposal` | Approve proposal for execution | `ap.payments.approve` | Yes (≠ creator) |
| `rejectPaymentProposal` | Reject proposal with reason | `ap.payments.approve` | No |
| `createPaymentBatch` | Batch approved proposals | `ap.payments.execute` | No |
| `executePayment` | Submit payment to bank | `ap.payments.execute` | Yes (≠ approver) |
| `confirmPayment` | Confirm bank settlement | `ap.payments.confirm` | No |
| `reversePayment` | Reverse settled payment | `ap.payments.reverse` | Yes (CFO only >$500K) |
| `cancelPayment` | Cancel pending payment | `ap.payments.cancel` | No |

### Amount Authority Thresholds

| Amount | Required Role | Source |
|---|---|---|
| < $100,000 | AP Manager | `src/server/procurement/application/payment-service.ts:337` |
| $100,000 — $500,000 | Controller | `src/server/procurement/application/payment-service.ts:339` |
| > $500,000 | CFO | `src/server/procurement/application/payment-service.ts:341` |

---

## Queries

| Query | Description | Cacheable |
|---|---|---|
| `getPaymentProposal` | Get proposal by ID | Yes (30s) |
| `listPaymentProposals` | List with filters | Yes (30s) |
| `getPaymentBatch` | Get batch by ID | Yes (30s) |
| `listPaymentBatches` | List with filters | Yes (30s) |
| `getPaymentRecord` | Get payment by ID | No |
| `listPaymentRecords` | List with filters | Yes (30s) |
| `getPaymentSummary` | Aggregated stats | Yes (60s) |
| `getPaymentAuditTrail` | Audit entries for payment | No |

---

## Errors

| Code | Description | Recovery |
|---|---|---|
| `PAYMENT_PROPOSAL_NOT_FOUND` | Proposal does not exist | Check ID |
| `PAYMENT_INVALID_STATUS` | Wrong status for operation | Check current status |
| `PAYMENT_SOD_VIOLATION` | Segregation of duties | Different actor needed |
| `PAYMENT_AMOUNT_EXCEEDS_AUTHORITY` | Amount exceeds role authority | Higher authority needed |
| `PAYMENT_IDEMPOTENCY_CONFLICT` | Duplicate payment detected | Return existing payment |
| `PAYMENT_DOUBLE_PAY` | Invoice already has pending payment | Check existing payments |
| `PAYMENT_BATCH_EMPTY` | No payments to batch | Check proposal items |
| `PAYMENT_REVERSAL_NOT_ALLOWED` | Payment not in reversible status | Check status |
| `PAYMENT_CANCEL_NOT_ALLOWED` | Payment not in cancellable status | Check status |
| `PAYMENT_FINANCIAL_PRECISION_ERROR` | Arithmetic precision error | System error — investigate |

---

## Security Model

1. **Segregation of Duties**: Creator ≠ Approver, Approver ≠ Executor
2. **Amount Authority**: Role-based thresholds ($100K, $500K)
3. **Dual Signature**: Required for payments > $500K
4. **Idempotency**: All payment operations use idempotency keys
5. **Double-Pay Prevention**: System checks for existing pending payments per invoice
6. **Audit Trail**: Immutable audit entries for every payment action
   - Source: `src/server/procurement/domain/events/event-types.ts`
7. **Optimistic Locking**: Version field prevents concurrent modifications
8. **Financial Precision**: All monetary arithmetic via `financial-precision.ts`
   - Source: `src/lib/financial-precision.ts`

---

## Permission Model

| Operation | Permission | MFA | Authority |
|---|---|---|---|
| Propose payments | `ap.payments.propose` | No | Any AP role |
| Review proposals | `ap.payments.review` | No | AP Manager+ |
| Approve proposals | `ap.payments.approve` | Yes | Role-based threshold |
| Execute payments | `ap.payments.execute` | Yes | AP Manager+ |
| Confirm payments | `ap.payments.confirm` | No | AP Staff |
| Reverse payments | `ap.payments.reverse` | Yes | Controller+ (>$500K: CFO) |
| Cancel payments | `ap.payments.cancel` | Yes | AP Manager+ |
| View payments | `ap.payments.read` | No | Any role |

---

## Observability

### Metrics

| Metric | Type | Labels |
|---|---|---|
| `payment_proposal_generated_total` | Counter | status |
| `payment_proposal_approved_total` | Counter | approval_path |
| `payment_batch_created_total` | Counter | payment_method |
| `payment_executed_total` | Counter | rail, status |
| `payment_confirmed_total` | Counter | rail |
| `payment_reversed_total` | Counter | reason |
| `payment_settlement_time_ms` | Histogram | rail |
| `payment_amount_total` | Counter | currency, rail |
| `payment_sod_violations_total` | Counter | violation_type |
| `payment_idempotency_hits_total` | Counter | operation |

### Tracing

```
Span: payment.proposal.generate
  Parent: contract.payments.generatePaymentProposal
  Attributes:
    payment.invoice_count = 15
    payment.total_amount = 250000.00
    payment.vendor_count = 8
    payment.discount_eligible = 3
  Events:
    payment.eligibility.check
    payment.discount.evaluation
    payment.proposal.persist
    payment.event.emit
```

---

## Metrics

| Metric | Description | Alert |
|---|---|---|
| Payment execution success rate | % successful executions | < 99.5% |
| Payment settlement time | Hours from submission to settlement | > 48h |
| Proposal approval rate | % proposals approved | < 50% (investigate) |
| SoD violation attempts | Segregation of duties blocks | > 0 |
| Double-pay prevention blocks | Duplicate payment attempts | > 0 |
| Reversal rate | % payments reversed | > 1% |
| Financial precision errors | Arithmetic errors | > 0 |

---

## Rate Limiting

| Operation | Limit | Window | Notes |
|---|---|---|---|
| Payment execution | 100/hour | Rolling | Per tenant |
| Proposal generation | 10/hour | Rolling | Prevents runaway proposals |
| Payment confirmation | 200/hour | Rolling | Per tenant |

---

## Retry Policy

| Operation | Max Retries | Backoff | Notes |
|---|---|---|---|
| Payment execution (transient) | 2 | Exponential 5s-20s | Financial ops need careful retry |
| Payment confirmation | 3 | Exponential 2s-8s | Bank confirmation may lag |
| Reversal processing | 1 | Fixed 10s | Single retry for safety |

**Note**: Payment operations use conservative retry policies. Financial operations should never be retried aggressively.

---

## Circuit Breakers

Payment operations do NOT use circuit breakers in the traditional sense. Instead:

1. **Banking Provider Circuit Breakers** handle provider-level failures
2. **Payment Queue** handles submission failures (dead-letter queue)
3. **Manual Intervention** required for payment failures that are not transient

---

## Caching

| Data | TTL | Notes |
|---|---|---|
| Payment proposals | 30s | Read-through cache |
| Payment batches | 30s | Read-through cache |
| Payment records | No cache | Always fresh (financial data) |
| Payment summaries | 60s | Aggregation cache |
| Authority thresholds | 1 hour | Rarely changes |

**Rule**: Financial data in the Payments Platform is NEVER cached for writes. Read caching is conservative (30s max).

---

## Versioning

| Component | Versioning | Notes |
|---|---|---|
| PaymentsContract | semver | Major for breaking changes |
| Payment records | Append-only | Never modified, only appended |
| Audit entries | Append-only | Immutable by design |
| Event types | semver | New events are additive |

---

## Lifecycle

### Payment Proposal Lifecycle

```
Generate → Draft → Review → Reviewed → Approve → Approved →
  → Create Batch → Batch Created → Execute → Submitted →
  → Confirm → Settled → Completed

At any point after Review: Reject → Rejected
```

### Payment Record Lifecycle

```
Draft → Processed → Cleared → Settled → Confirmed
  ↓         ↓          ↓
  Cancel   Reverse   Return
```

---

## Extension Model

### Adding a New Payment Rail

1. **Define** payment rail type in `PaymentRail` enum
2. **Implement** banking provider payment initiation
3. **Add** settlement detection (webhook or polling)
4. **Configure** rail-specific rate limits
5. **Write** contract compliance tests
6. **Document** rail-specific settlement times

### Multi-Rail Support

```typescript
type PaymentRail = "ach" | "wire" | "sepa" | "swift" | "check" | "rtp" | "fednow";
```

---

## Provider Model

### Payment Execution Providers

| Provider | Rails | Status | Settlement |
|---|---|---|---|
| Banking Platform | ACH, Wire | Scaffolded | 1-3 business days |
| Plaid | ACH | Built | 1-3 business days |
| SWIFT (via Banking) | SWIFT | Planned | 2-5 business days |
| SEPA (via Banking) | SEPA | Planned | 1-2 business days |

---

## Testing Strategy

| Test | Scope | Frequency |
|---|---|---|
| Unit | Proposal generation, approval routing | Every PR |
| Integration | Full proposal → execute → confirm flow | Every PR |
| Financial precision | All monetary arithmetic | Every PR |
| SoD enforcement | Segregation of duties | Every PR |
| Idempotency | No double-pay | Every PR |
| Reversal safety | Reversal/authorization checks | Every PR |
| E2E | Invoice → proposal → batch → payment → confirm | Nightly |

---

## Failure Modes

| Failure | Impact | Recovery |
|---|---|---|
| Bank API down | Payment cannot submit | Queue for retry; manual intervention |
| Double-pay attempt | Duplicate payment | Idempotency check prevents |
| SoD violation | Unauthorized approval | Permission check blocks |
| Financial precision error | Incorrect amounts | Arithmetic helpers prevent |
| Audit trail gap | Compliance risk | System design prevents (append-only) |
| Concurrent modification | Optimistic lock conflict | Version check detects; user retries |

---

## Recovery Strategy

1. **Payment Submission Failure**: Queue retry; alert for manual intervention if persistent
2. **Settlement Delay**: Poll bank for status; no action needed (settlement is asynchronous)
3. **Payment Reversal**: Reversal logged; invoice restored to APPROVED; GL reversal entry created
4. **Double-Pay Prevention**: Idempotency key lookup; return existing payment if found
5. **Concurrent Modification**: Optimistic lock conflict detected; user must refresh and retry
6. **Financial Precision Error**: Log and alert; monetary values never silently truncated
7. **Audit Trail Corruption**: System design prevents (append-only, no updates allowed)
