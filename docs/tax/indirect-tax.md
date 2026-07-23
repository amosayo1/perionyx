# Indirect Tax (VAT / GST / Sales Tax)

## Overview

The Indirect Tax domain handles value-added tax (VAT), goods and services tax (GST), and sales tax processing across all jurisdictions. It manages transaction-level tax computation, input/output tax tracking, reverse charge processing, exemptions, partial exemption, and periodic return filing.

## Transaction Processing

### Supported Transaction Types

| Type | Description | Tax Treatment |
|------|-------------|---------------|
| Sales (B2B) | Business-to-business supply | Output tax charged, customer input recovery |
| Sales (B2C) | Business-to-consumer supply | Output tax charged, no input recovery for consumer |
| Purchases | Business-to-business acquisition | Input tax recovery (if eligible) |
| Imports | Goods imported from outside jurisdiction | Import VAT at customs, input recovery |
| Exports | Goods exported outside jurisdiction | Zero-rated, input recovery maintained |
| Intra-community supply | Goods to another EU member state | Zero-rated, valid VAT number required |
| Intra-community acquisition | Goods from another EU member state | Reverse charge: output + input |
| Credit notes | Sales returns or adjustments | Negative output tax |
| Debit notes | Additional charges | Additional output tax |

### Transaction Processing Flow

```
Transaction Input
  │
  ▼
1. Classify Transaction
  ├── Determine transaction type (sale, purchase, import, export, etc.)
  ├── Identify parties (supplier, customer, intermediate)
  ├── Determine supply jurisdiction
  └── Determine customer jurisdiction
  │
  ▼
2. Resolve Place of Supply
  ├── Goods: location of goods at time of supply
  ├── Services: B2B = customer location; B2C = supplier location
  ├── Special rules (digital services, transport, real estate)
  └── Determine taxing jurisdiction
  │
  ▼
3. Calculate Tax
  ├── For each line item, resolve rate (standard/reduced/zero/exempt)
  ├── Apply reverse charge if applicable
  ├── Handle mixed supply apportionment
  └── Compute total tax amount
  │
  ▼
4. Record Tax Lines
  ├── Output tax (for sales)
  ├── Input tax (for purchases, if recoverable)
  ├── Reverse charge memo entries
  └── Adjustments (credit/debit notes)
  │
  ▼
5. Update Period Register
  ├── Add to periodic indirect tax return register
  ├── Update output tax control account
  ├── Update input tax control account
  └── Flag for filing
```

## Input Tax / Output Tax Tracking

```typescript
interface IndirectTaxRecord {
  id: string;
  transactionId: string;
  entityId: string;
  jurisdictionId: string;
  periodId: string;
  transactionType: TransactionType;
  direction: "output" | "input" | "reverse-charge-output" | "reverse-charge-input";
  taxType: "vat" | "gst" | "sales-tax";
  taxBase: Money;
  taxAmount: Money;
  rate: number;
  rateType: RateType;
  recoverable: boolean;
  recoverablePercentage: number;  // For partial exemption
  category: string;               // Product/service category
  customerId: string | null;
  supplierId: string | null;
  invoiceReference: string;
  entryDate: string;
  reportingBox: string;           // Box assignment for return
  glAccountCode: string;
  createdAt: string;
}
```

### Output Tax (Sales)

Output tax is tracked at transaction level and aggregated by period:

| Field | Source |
|-------|--------|
| Tax base | Invoice line net amount |
| Rate | Rate resolution engine |
| Amount | TaxBase × Rate |
| Box assignment | Jurisdiction-specific return box mapping |
| GL posting | Output tax control account |

### Input Tax (Purchases)

Input tax recovery is subject to eligibility checks:

| Condition | Recovery Allowed |
|-----------|-----------------|
| Valid tax invoice held | Yes |
| Goods/services used for taxable supplies | Yes (full) |
| Goods/services used for exempt supplies | No |
| Goods/services used for mixed purposes | Partial (pro-rata) |
| Entertainment expenses | No |
| Cars (personal use component) | Partial |
| Blocked items per jurisdiction | No |

### Partial Exemption Calculation

```
Partial Exemption Pro-Rata = (Taxable Turnover / Total Turnover) × 100

Recoverable Input Tax = Total Input Tax × (Pro-Rata / 100)

Irrecoverable Input Tax = Total Input Tax - Recoverable Input Tax
```

The pro-rata percentage is computed:
- Annually (with provisional monthly/quarterly calculations)
- At entity level (or VAT group level)
- With de minimis rules per jurisdiction (e.g., UK: ≤£7,500 and ≤50% of total input tax)

## Reverse Charge

### Sales-Side (Supplier)

```
Supplier issues invoice:
  └── Net amount: £10,000
  └── VAT: £0 (Reverse Charge - customer to account)
  └── Notation: "Reverse charge: Customer to account for VAT"
  └── No output VAT remitted to tax authority
```

### Purchase-Side (Customer)

```
Customer receives invoice:
  └── Self-assess output VAT: £2,000 (20% × £10,000)
  └── Record input VAT (if recoverable): £2,000
  └── Net VAT impact to authority: £0
  └── Both entries recorded in periodic return
```

### Reverse Charge Return Impact

| Entry | Box | Amount |
|-------|-----|--------|
| Output VAT (reverse charge) | Box 1 (sales) | £2,000 |
| Input VAT (reverse charge) | Box 4 (purchases) | £2,000 |
| Net VAT payable | Box 5 | £0 |

## Exemptions

### Zero-Rated Supplies

- Charged at 0% (no output tax)
- Full input tax recovery maintained
- Typical: exports, food, children's clothing, books, public transport

### Exempt Supplies

- No output tax charged
- Input tax recovery blocked
- Typical: financial services, insurance, education, healthcare, real estate

### Reduced Rate Supplies

- Rate between 0% and standard rate
- Input tax recovery at standard level
- Typical: hospitality, energy, domestic fuel, children's car seats

### Exemption Certificates

```typescript
interface ExemptionCertificate {
  id: string;
  customerId: string;
  jurisdictionId: string;
  exemptionType: "zero-rated" | "exempt" | "reduced" | "export" | "resale";
  certificateNumber: string;
  issuingAuthority: string;
  validFrom: string;
  validTo: string | null;
  productCategories: string[];      // Product categories covered
  entityId: string;                 // Legal entity the certificate is for
  status: "active" | "expired" | "revoked";
  reviewDate: string | null;        // Next review date
  notes: string;
}
```

## Mixed / Composite Supply

| Scenario | Treatment |
|----------|-----------|
| Single supply | One rate applies to whole supply |
| Multiple distinct supplies | Each supply independently rated |
| Composite supply | Principal element determines rate |
| Mixed supply | Separate components apportioned |
| VAT packages | Apportionment based on fair value |

## Periodic Filing

### Period Types

- **Monthly**: High-volume filers, large taxpayers
- **Quarterly**: Standard filing frequency
- **Semi-annual**: Small businesses (selected jurisdictions)
- **Annual**: Very small businesses

### Return Aggregation

```
Periodic Return Data
  │
  ├── Output Tax Summary
  │   ├── Total sales (standard rate)
  │   ├── Total sales (reduced rate)
  │   ├── Total sales (zero-rated)
  │   ├── Total sales (exempt)
  │   └── Total output tax
  │
  ├── Input Tax Summary
  │   ├── Total purchases (standard rate)
  │   ├── Total purchases (reduced rate)
  │   ├── Total purchases (zero-rated)
  │   ├── Total purchases (exempt)
  │   ├── Recoverable input tax
  │   ├── Irrecoverable input tax
  │   └── Partial exemption adjustments
  │
  ├── Reverse Charge Summary
  │   ├── Reverse charge output
  │   ├── Reverse charge input
  │   └── Net reverse charge
  │
  └── Adjustments
      ├── Prior period corrections
      ├── Bad debt relief
      ├── Cash accounting adjustments
      └── Annual adjustments
```

### Submission Channels

| Channel | Jurisdictions |
|---------|---------------|
| Direct portal API | UK (MTD), EU (VIES), India (GSTN) |
| Portal upload | All jurisdictions (PDF/CSV/XML) |
| Manual entry | All jurisdictions |
| Batch EDI | Selected large-jurisdiction filers |

The Indirect Tax domain generates return data in the format required by each jurisdiction's filing system. Actual submission is handled through the Returns domain, which manages the submission lifecycle.
