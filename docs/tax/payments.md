# Tax Payments

## Overview

The Tax Payments domain manages all tax-related payment activities including estimated payments, filing payments, penalties, interest, refunds, and multi-currency payment processing. It tracks payment obligations across all tax types and jurisdictions.

## Payment Types

| Type | Description | Examples |
|------|-------------|----------|
| Estimated payment | Periodic prepayment of expected tax liability | Quarterly estimated CIT, monthly VAT |
| Filing payment | Payment due with return filing | Balance due upon filing |
| Penalty | Late filing, late payment, or accuracy penalty | 5%/month late filing penalty |
| Interest | Interest on underpayment or late payment | Statutory interest rate |
| Refund | Amount returned by tax authority | Overpayment refund, input VAT reclaim |
| Offset | Credit applied to another tax obligation | Overpayment credited to next period |
| Deposit | Voluntary deposit with tax authority | Customs duty deposit, VAT deposit |

## Payment Lifecycle

```
Scheduled ──► Pending ──► Paid ──► Confirmed ──► Reconciled
  │             │          │
  │             │          ├──► Overpaid
  │             │          │        │
  │             │          │        └──► Refunded / Offset
  │             │          │
  │             │          └──► Underpaid
  │             │                   │
  │             │                   └──► Additional Payment
  │             │
  │             └──► Cancelled
  │
  └──► Skipped (no tax due)
```

### State Model

```typescript
type PaymentStatus =
  | "scheduled"       // Planned payment, not yet initiated
  | "pending"         // Initiated, awaiting processing
  | "paid"            // Successfully completed
  | "confirmed"       // Bank/authority confirmation received
  | "overpaid"        // Excess amount paid
  | "underpaid"       // Insufficient amount paid
  | "refunded"        // Overpayment returned
  | "offset"          // Applied to other obligation
  | "cancelled"       // Payment cancelled before processing
  | "failed"          // Payment processing failed
  | "reconciled";     // Matched to GL and return
```

### Payment Model

```typescript
interface TaxPayment {
  id: string;
  entityId: string;
  jurisdictionId: string;
  taxType: TaxType;
  paymentType: PaymentType;
  returnId: string | null;             // Associated return (if filing payment)
  periodId: string | null;             // Tax period (if estimated)
  
  // Amounts
  amount: Money;
  currency: string;
  fxRate: number | null;               // If paid in different currency
  fxAmount: Money | null;              // Amount in payment currency
  fxFee: Money | null;                 // FX conversion fee
  
  // Timing
  dueDate: string;
  paymentDate: string | null;
  confirmationDate: string | null;
  
  // Payment details
  paymentMethod: PaymentMethod;
  paymentReference: string;            // Bank reference, check number
  authorityReference: string | null;   // Tax authority confirmation code
  bankAccountId: string;               // Source bank account
  institutionId: string | null;        // Financial institution
  
  // Status
  status: PaymentStatus;
  
  // Penalties and interest
  latePaymentPenalty: Money | null;
  latePaymentInterest: Money | null;
  underpaymentPenalty: Money | null;
  underpaymentInterest: Money | null;
  
  // Reconciliation
  glPosted: boolean;
  glAccountCode: string;
  reconciledDate: string | null;
  reconciledBy: string | null;
  
  // Audit
  createdBy: string;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type PaymentMethod =
  | "wire"           // International wire transfer
  | "ach"            // ACH debit/credit
  | "check"          // Physical check
  | "card"           // Credit/debit card
  | "direct-debit"   // Authority pulls from bank
  | "portal"         // Tax authority portal payment
  | "crypto"         // Cryptocurrency (selected jurisdictions)
  | "other";
```

## Estimated Payments

### Calculation Methods

| Method | Description | Used By |
|--------|-------------|---------|
| Prior year | 100%/110% of prior year liability | US federal, most states |
| Annualized income | Current year income annualized | US (large taxpayers) |
| Actual income | Based on actual YTD income | Selected jurisdictions |
| Fixed installment | Fixed amount per period | Some countries |
| Turnover-based | Percentage of turnover | VAT/GST |

```typescript
interface EstimatedPaymentSchedule {
  id: string;
  entityId: string;
  jurisdictionId: string;
  taxType: TaxType;
  taxYear: string;
  calculationMethod: EstimatedPaymentMethod;
  installments: EstimatedInstallment[];
  totalEstimatedLiability: Money;
  totalRequiredPayments: Money;
  safeHarborMet: boolean;
  underpaymentPenalty: Money | null;
}

interface EstimatedInstallment {
  installmentNumber: number;
  totalInstallments: number;
  dueDate: string;
  requiredAmount: Money;
  actualAmount: Money | null;
  paymentId: string | null;
  status: "due" | "paid" | "late" | "skipped";
  penaltyExempt: boolean;
}
```

## Payment Methods by Jurisdiction

| Jurisdiction | Preferred Methods | Payment Timing |
|-------------|-------------------|----------------|
| US (federal) | EFTPS (ACH), wire, card | Same-day for EFTPS |
| US (states) | State portal, ACH | Varies by state |
| UK (HMRC) | Direct debit, debit card, BACS, CHAPS | 3-5 business days |
| Germany | SEPA direct debit, bank transfer | 2-3 business days |
| France | SEPA, card, cheque | Varies |
| India | NSDL portal, net banking, NEFT/RTGS | Same-day (portal) |
| UAE | FTA portal, wire, direct debit | 1-3 business days |
| Singapore | IRAS portal, GIRO, PayNow | Same-day (PayNow) |
| Australia | BPAY, credit card, direct debit | 1-2 business days |
| Brazil | DARF (all banks), PIX | Same-day (PIX) |

## Refunds

### Refund Lifecycle

```
Overpayment Identified
  │
  ▼
1. Refund Claim Prepared
  ├── Calculate refund amount
  ├── Identify source (overpayment, input VAT, carryback)
  └── Attach supporting documentation
  │
  ▼
2. Internal Approval
  ├── Tax manager review
  ├── Finance approval
  └── Treasury coordination
  │
  ▼
3. Submit Claim to Authority
  ├── File refund claim form
  ├── Provide supporting evidence
  └── Track claim status
  │
  ▼
4. Authority Processing
  ├── Acknowledged
  ├── Under review
  ├── Additional information requested
  └── Approved / Rejected
  │
  ▼
5. Refund Received
  ├── Payment received
  ├── Reconcile to claim
  └── Record in GL
```

```typescript
interface TaxRefund {
  id: string;
  entityId: string;
  jurisdictionId: string;
  taxType: TaxType;
  sourceType: "overpayment" | "input-vat" | "carryback"
             | "estimated-overpayment" | "penalty-refund" | "other";
  sourcePaymentId: string | null;
  sourceReturnId: string | null;
  claimAmount: Money;
  approvedAmount: Money | null;
  receivedAmount: Money | null;
  claimDate: string;
  expectedDate: string | null;
  receivedDate: string | null;
  authorityReference: string;
  status: RefundStatus;
  interest: Money | null;               // Interest on late refund
  glPosted: boolean;
  notes: string;
}
```

### Refund Timelines by Jurisdiction

| Jurisdiction | Standard Processing | Interest on Late Refund |
|-------------|-------------------|------------------------|
| US | 45 days | Yes (after 45 days) |
| UK | 30 days | Yes (after 30 days) |
| Germany | 3-6 months | Yes (after deadline) |
| India | 6-12 months | Yes (6% p.a.) |
| UAE | 60 days | No |
| Singapore | 30 days | Yes (5% p.a.) |

## Penalties and Interest

### Penalty Types

| Penalty Type | Rate | Trigger |
|-------------|------|---------|
| Late filing | 5% per month (max 25%) | Return not filed by due date |
| Late payment | 0.5% per month (max 25%) | Tax not paid by due date |
| Failure to deposit | 2-10% | Estimated payments not made |
| Accuracy | 20% of understatement | Negligence or disregard of rules |
| Fraud | 75% of understatement | Fraudulent underpayment |
| Information return | $50-$500 per form | Late/inaccurate information returns |

### Interest Calculation

```
Interest on Underpayment:
  Days Late × Underpayment Amount × (Annual Rate / 365)

Interest on Overpayment (Refund):
  Days from Overpayment × Overpayment Amount × (Annual Rate / 365)
```

Interest rates are typically set quarterly based on the federal short-term rate + 3% (US) or similar benchmark.

```typescript
interface PenaltyInterestCalculation {
  paymentId: string;
  penaltyType: PenaltyType;
  baseAmount: Money;
  penaltyRate: number;
  penaltyAmount: Money;
  interestRate: number;
  interestDays: number;
  interestAmount: Money;
  totalPenaltyAndInterest: Money;
  waiverEligible: boolean;
  waiverReason: string | null;
}
```

## Payment Reconciliation

### Three-Way Reconciliation

```
Bank Statement ──► Tax Payment Record ──► Tax Return
  │                     │                     │
  └───────────── Match ─┴──────── Match ──────┘
                        │
                   Three-way match:
                   ├── Date (within tolerance)
                   ├── Amount (exact match)
                   ├── Authority reference
                   └── Entity and period
```

### Reconciliation Status

```typescript
type ReconciliationStatus =
  | "unreconciled"       // Not yet matched to any source
  | "partially-matched"  // Matched to bank but not return (or vice versa)
  | "fully-matched"      // Three-way match complete
  | "exception";         // Mismatch detected
```

### Unreconciled Items

| Item Type | Resolution Action |
|-----------|------------------|
| Payment in bank, not in system | Create payment record |
| Payment in system, not in bank | Investigate processing delay or failure |
| Amount mismatch | Verify FX rate, fees, or partial payment |
| Date mismatch | Check processing time, weekend/holiday adjustment |
| No return match | Determine if estimated payment or unallocated |

## Multi-Currency Payments

For organizations making tax payments in currencies different from their functional currency:

```typescript
interface MultiCurrencyPayment {
  paymentId: string;
  functionalCurrency: string;
  paymentCurrency: string;
  functionalAmount: Money;
  paymentAmount: Money;
  fxRate: number;
  fxRateSource: "central-bank" | "commercial-bank" | "internal";
  fxRateDate: string;
  fxFee: Money;
  fxGainLoss: Money;              // Realized FX gain/loss
  hedgingReference: string | null; // If hedged
}
```

## Payment Analytics

```typescript
interface PaymentAnalytics {
  totalPaymentsMade: number;
  totalAmountPaid: Money;
  byPaymentType: Record<PaymentType, {
    count: number;
    total: Money;
  }>;
  byMethod: Record<PaymentMethod, {
    count: number;
    total: Money;
  }>;
  onTimeRate: number;                  // % of payments made by due date
  averageLateDays: number;
  totalPenaltiesIncurred: Money;
  totalInterestIncurred: Money;
  totalRefundsClaimed: Money;
  totalRefundsReceived: Money;
  averageRefundCycleDays: number;
  reconciliationRate: number;          // % of payments reconciled
  pendingReconciliation: number;
}
```
