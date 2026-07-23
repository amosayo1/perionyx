# Withholding Tax

## Overview

The Withholding Tax domain manages tax deducted at source from payments to suppliers, customers, and other counterparties. It supports multiple withholding types, certificate management, treaty rate application, recoverable tracking, and multi-jurisdiction compliance.

## Withholding Tax Types

| Type | Description | Typical Rate Range |
|------|-------------|-------------------|
| Supplier WHT | Withholding on payments to vendors for goods/services | 5% – 30% |
| Customer WHT | Withholding on receipts from customers | 5% – 30% |
| Interest WHT | Withholding on interest payments | 5% – 35% |
| Dividend WHT | Withholding on dividend payments | 0% – 30% |
| Royalty WHT | Withholding on intellectual property payments | 5% – 30% |
| Service WHT | Withholding on specific service payments | 10% – 20% |
| Technical Fees | Withholding on technical/consulting services | 10% – 25% |
| Management Fees | Withholding on management service fees | 10% – 20% |
| Branch Profits | Withholding on branch profit remittances | 5% – 15% |

## Transaction Processing

### Withholding Flow

```
Payment Instruction
  │
  ▼
1. Determine Withholding Obligation
  ├── Recipient type (vendor, customer, shareholder, licensor)
  ├── Payment type (goods, services, interest, dividend, royalty)
  ├── Jurisdiction (payer location, recipient location)
  └── Treaty eligibility
  │
  ▼
2. Resolve Withholding Rate
  ├── Domestic rate (jurisdiction default)
  ├── Treaty rate (if applicable and certified)
  ├── Reduced rate (if WHT certificate held)
  └── Exemption (if recipient qualifies)
  │
  ▼
3. Calculate Withholding Amount
  ├── Gross payment amount
  ├── Applicable rate
  └── Withheld amount = Gross × Rate
  │
  ▼
4. Record Withholding Transaction
  ├── Debit: Payment to recipient (net amount)
  ├── Credit: Cash (net amount)
  ├── Debit: Withholding tax receivable (gross - net)
  └── Credit: Withholding tax payable
  │
  ▼
5. Issue Certificate
  ├── Generate WHT certificate for recipient
  ├── Include jurisdiction-specific details
  └── Send to recipient for their input tax recovery
```

```typescript
interface WithholdingTransaction {
  id: string;
  entityId: string;                    // Paying entity
  recipientId: string;                 // Recipient (vendor, customer, etc.)
  recipientType: "vendor" | "customer" | "shareholder" | "licensor" | "other";
  paymentType: WithholdingPaymentType;
  jurisdictionId: string;              // Withholding jurisdiction
  jurisdictionType: "source" | "residence"; // Source-based or residence-based
  grossAmount: Money;
  withholdingRate: number;
  withholdingAmount: Money;
  netAmount: Money;
  rateType: "domestic" | "treaty" | "reduced" | "exempt";
  treatyReference: string | null;
  certificateReference: string | null;
  recoverable: boolean;
  recoverableAmount: Money;
  status: "withheld" | "remitted" | "recovered" | "written-off";
  dueDate: string;                     // Remittance due date
  remittedDate: string | null;
  certificateIssued: boolean;
  certificateNumber: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
```

## Certificate Management

### Certificate Types

| Certificate | Purpose | Issued To |
|-------------|---------|-----------|
| WHT Certificate | Proof of tax deducted | Vendor/Customer/Recipient |
| Tax Residency Certificate | Proof of tax residence | Foreign recipients |
| Treaty Relief Certificate | Confirms treaty eligibility | Payer for reduced rate |
| Exemption Certificate | Confirms exemption eligibility | Payer for zero rate |
| Composite Certificate | Annual aggregated certificate | Vendors with multiple transactions |

```typescript
interface WithholdingCertificate {
  id: string;
  certificateType: "withholding" | "residency" | "treaty" | "exemption" | "composite";
  certificateNumber: string;
  issuingJurisdiction: string;
  recipientJurisdiction: string;
  recipientId: string;
  recipientName: string;
  payerId: string;
  coveragePeriod: { from: string; to: string };
  transactionIds: string[];
  totalWithheld: Money;
  currency: string;
  issuedDate: string;
  status: "draft" | "issued" | "cancelled";
  notes: string;
}
```

### Certificate Issuance Requirements

| Jurisdiction | Timeline | Format | Language |
|-------------|----------|--------|----------|
| US (IRS Form 1042-S) | March 15 | Electronic (FIRE system) | English |
| UK (HMRC) | Within 30 days | Authorized format | English |
| Germany | Within 30 days | Standard form | German |
| India | Within 15 days | Form 16A | English/Hindi |
| UAE | Within 30 days | Standard form | Arabic/English |
| Singapore | Within 30 days | IRAS format | English |

## Tax Treaty Application

### Treaty Rate Resolution

```
Standard domestic rate: 30%
  │
  ▼
1. Check treaty existence between jurisdictions
  ├── Yes → Proceed to step 2
  └── No → Apply domestic rate
  │
  ▼
2. Check payment type in treaty
  ├── Covered → Proceed to step 3
  └── Not covered → Apply domestic rate
  │
  ▼
3. Check treaty conditions
  ├── Beneficial ownership requirement
  ├── Limitation on benefits (LOB) clause
  ├── Minimum holding period (dividends)
  └── Active business test
  │
  ▼
4. Validate recipient documentation
  ├── Valid Tax Residency Certificate held
  ├── Treaty relief form completed (e.g., IRS Form W-8BEN)
  └── Conditions met
  │
  ▼
Apply treaty rate: 10%
```

```typescript
interface TaxTreatyRate {
  id: string;
  sourceJurisdiction: string;
  recipientJurisdiction: string;
  paymentType: WithholdingPaymentType;
  treatyRate: number;
  domesticRate: number;
  conditions: TreatyCondition[];
  effectiveFrom: string;
  effectiveTo: string | null;
  treatyArticle: string;
  treatyName: string;
}

interface TreatyCondition {
  type: "beneficial-ownership" | "limitation-on-benefits"
      | "minimum-holding" | "active-business" | "subject-to-tax"
      | "other";
  description: string;
  satisfied: boolean;        // Evaluated per transaction
}
```

## Recoverable Withholding

Some jurisdictions allow the withholding recipient to recover or credit withheld tax:

| Recovery Method | Description |
|----------------|-------------|
| Tax credit | Recipient claims credit against their own tax liability |
| Refund claim | Recipient files refund claim with tax authority |
| Reduced rate application | Recipient applies for reduced rate in advance |
| Set-off | Withholding tax set off against other tax liabilities |

```typescript
interface RecoverableWithholding {
  id: string;
  withholdingTransactionId: string;
  recoveryMethod: "credit" | "refund" | "reduced-rate" | "set-off";
  amount: Money;
  jurisdictionId: string;
  status: "pending" | "claimed" | "approved" | "received" | "rejected";
  claimDate: string | null;
  expectedResolutionDate: string | null;
  actualResolutionDate: string | null;
  notes: string;
}
```

## Multi-Jurisdiction Withholding

### Cross-Border Withholding

| Scenario | Source Jurisdiction WHT | Residence Jurisdiction Tax |
|----------|------------------------|----------------------------|
| US company pays UK vendor | US WHT (30% or treaty rate) | UK taxes worldwide income |
| Germany pays India vendor | Germany WHT (15-30%) | India taxes worldwide income |
| Singapore pays royalty to US | Singapore WHT (10%) | US taxes worldwide income |
| UAE pays management fees to UK | UAE WHT (0% in free zones) | UK taxes worldwide income |

### Withholding Across Supply Chain

```
Entity A (US) ──pays dividend──► Entity B (UK)
  │                                    │
  10% WHT (US treaty rate)              │
  │                                    ▼
  │                             Entity B receives net dividend
  │                             Claims foreign tax credit in UK
  ▼
IRS receives WHT
```

## Compliance Monitoring

| Metric | Description | Alert Trigger |
|--------|-------------|---------------|
| Certificate issuance rate | % of WHT transactions with certificates issued | < 95% |
| Remittance timeliness | % of WHT remitted by due date | < 98% |
| Treaty utilization | % of eligible transactions using treaty rates | < 80% |
| Recovery rate | % of recoverable WHT successfully recovered | < 70% |
| Documentation completeness | % of foreign recipients with valid TRC | < 90% |

## Reporting

### Periodic Withholding Returns

| Jurisdiction | Return | Frequency | Deadline |
|-------------|--------|-----------|----------|
| US | Form 945 (federal) | Annual | January 31 |
| US | Form 1042 | Annual | March 15 |
| US | Form 1042-S | Annual | March 15 |
| UK | CT61 | Quarterly | 14 days after quarter |
| Germany | Quarterly WHT return | Quarterly | 10th of following month |
| India | Quarterly TDS return (Form 24Q, 26Q) | Quarterly | 15th of month following quarter |
| UAE | Withholding return | Monthly | 28th of following month |
| Singapore | IRAS WHT return | Monthly/Variable | Varies by payment |

### Annual Withholding Summary

```typescript
interface WithholdingAnnualSummary {
  taxYear: string;
  entityId: string;
  totals: {
    totalWithheld: Money;
    totalRemitted: Money;
    totalRecoverable: Money;
    totalRecovered: Money;
    pendingRecovery: Money;
  };
  byPaymentType: Record<WithholdingPaymentType, {
    grossAmount: Money;
    withheldAmount: Money;
    count: number;
  }>;
  byJurisdiction: Record<string, {
    withheld: Money;
    remitted: Money;
    dueDate: string;
  }>;
  byRecipient: {
    recipientId: string;
    recipientName: string;
    totalWithheld: Money;
    certificatesIssued: number;
  }[];
}
```
