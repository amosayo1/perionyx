# Transfer Pricing

## Overview

The Transfer Pricing domain manages intercompany pricing for transactions between related entities within the same multinational enterprise. It supports multiple arm's length methods, transaction recording, documentation generation, adjustment tracking, and compliance risk assessment.

## Intercompany Transaction Types

| Type | Description | Examples |
|------|-------------|----------|
| Tangible goods | Physical goods sold between related entities | Raw materials, finished goods, components |
| Services | Intercompany service transactions | Management fees, IT services, shared services |
| Intangibles | Intellectual property transactions | Royalties, license fees, technology transfers |
| Financial | Intercompany financing | Loans, guarantees, cash pooling |
| Cost sharing | Shared cost arrangements | R&D cost sharing, marketing cost sharing |
| Recharge | Cost recharges between entities | Insurance, employee benefits, overhead |

### Transaction Model

```typescript
interface IntercompanyTransaction {
  id: string;
  transactionType: TransactionType;
  supplyingEntityId: string;
  receivingEntityId: string;
  jurisdictionSupply: string;
  jurisdictionReceipt: string;
  productServiceCode: string;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: Money;
  totalAmount: Money;
  currency: string;
  transactionDate: string;
  armLengthMethod: ArmLengthMethod;
  armLengthRange: {
    lowerQuartile: number;
    median: number;
    upperQuartile: number;
    interquartileRange: number;
  };
  adjustmentAmount: Money | null;
  adjustmentReason: string | null;
  documentationId: string | null;
  riskRating: "low" | "medium" | "high";
  status: "booked" | "adjusted" | "documented" | "audited";
  createdAt: string;
  updatedAt: string;
}
```

## Arm's Length Methods

| Method | Best For | Description |
|--------|----------|-------------|
| CUP | Standardized goods/services | Uses comparable uncontrolled prices from similar transactions |
| Resale Price | Distribution companies | Resale price to third party less an appropriate margin |
| Cost Plus | Manufacturers/service providers | Costs plus an appropriate markup |
| TNMM | Broad range of functions | Net profit indicator relative to an appropriate base |
| Profit Split | Highly integrated operations | Allocates combined profits based on relative contributions |

### Comparable Uncontrolled Price (CUP)

```
CUP Method
  │
  ├── Internal CUP: Price charged between related party vs unrelated party
  ├── External CUP: Comparable transaction between two unrelated parties
  │
  └── Adjustments for comparability:
      ├── Product characteristics
      ├── Volume differences
      ├── Contract terms
      ├── Market conditions
      ├── Currency differences
      └── Functional differences
```

**Best for**: Commodities, standardized products, financial transactions (loans, guarantees)

### Resale Price Method (RPM)

```
RPM Calculation:
  Resale Price to Third Party:    $100
  Less: Appropriate Gross Margin: −$25 (25%)
  └── Arm's Length Purchase Price: $75

Gross margin determined by:
  ├── Functions performed
  ├── Risks assumed
  ├── Assets employed
  └── Comparable distributor margins
```

**Best for**: Distributors, resellers, marketing operations

### Cost Plus Method (CPM)

```
CPM Calculation:
  Cost of Goods/Services:       $60
  Plus: Appropriate Markup:     +$15 (25%)
  └── Arm's Length Sale Price:  $75

Markup determined by:
  ├── Functions performed (manufacturing, assembly, R&D)
  ├── Complexity and value-add
  ├── Risks assumed
  └── Comparable contract manufacturer markups
```

**Best for**: Contract manufacturers, service providers, toll manufacturers

### Transactional Net Margin Method (TNMM)

```
TNMM Calculation:
  Net Profit Indicator:
  ├── PLI (Profit Level Indicator)
  ├── Return on Sales (ROS): Net Profit / Revenue
  ├── Return on Assets (ROA): Net Profit / Operating Assets
  ├── Return on Operating Costs (ROOC): Net Profit / Operating Costs
  └── Berry Ratio: Gross Profit / Operating Expenses
  │
  ▼
  Test: Entity's PLI vs. Comparable PLI Range
```

**Best for**: Broad range of functions, when product-level data is unavailable

### Profit Split Method

```
Profit Split
  │
  ├── Combined Profit: $100 (from integrated operations)
  │
  ├── Contribution Analysis:
  │   ├── Entity A contribution: R&D, marketing, intangibles → 60%
  │   ├── Entity B contribution: Manufacturing, distribution → 40%
  │   └── Split: A = $60, B = $40
  │
  └── Residual Analysis:
      ├── Routine returns (based on CUP/CPM/TNMM):
      │   ├── Entity A routine: $20
      │   └── Entity B routine: $15
      ├── Residual profit: $65
      └── Split residual based on intangible contributions
```

**Best for**: Highly integrated operations, unique intangibles, shared IP

## Arm's Length Range

```typescript
interface ArmLengthRange {
  transactionType: TransactionType;
  method: ArmLengthMethod;
  comparableSet: {
    count: number;
    source: string;
    description: string;
  };
  quartiles: {
    lowerQuartile: number;    // 25th percentile
    median: number;           // 50th percentile
    upperQuartile: number;    // 75th percentile
    minimum: number;
    maximum: number;
  };
  interquartileRange: number; // Upper - Lower quartile
  testedParty: {
    entityId: string;
    result: number;           // Actual result
    position: "within-range" | "below-range" | "above-range";
    adjustmentRecommended: number | null;
  };
}
```

### Interquartile Range Rule

- If the tested party's result falls **within** the interquartile range → no adjustment
- If the result falls **outside** the interquartile range → adjustment to the median is recommended
- Some jurisdictions adjust to the nearest boundary of the range (not necessarily the median)

## Documentation Requirements

| Document Type | Content | Required By |
|--------------|---------|-------------|
| Master file | Global business overview, value chain, intangibles, financial activities | OECD, EU, most jurisdictions |
| Local file | Local entity details, related-party transactions, functional analysis | OECD, EU, most jurisdictions |
| Country-by-Country (CbC) | Revenue, profit, tax paid, employees by jurisdiction | OECD (≥EUR 750M revenue) |
| Benchmarking study | Comparable search, selection rationale, adjustments | All jurisdictions |
| Functional analysis | Functions, risks, assets of each entity | All jurisdictions |
| TP policy documentation | Pricing policies, methodologies, review process | Best practice |

```typescript
interface TransferPricingDocumentation {
  id: string;
  documentType: "master-file" | "local-file" | "cbc-report"
              | "benchmarking" | "functional-analysis" | "tp-policy";
  entityId: string;
  jurisdictionId: string;
  taxYear: string;
  status: "draft" | "final" | "filed" | "updated";
  preparedBy: string;
  reviewedBy: string;
  preparationDate: string;
  filingDeadline: string;
  filedDate: string | null;
  content: {
    sections: DocumentSection[];
    appendices: DocumentAppendix[];
  };
  riskRating: "low" | "medium" | "high";
}
```

### Documentation Deadlines

| Jurisdiction | Deadline | Threshold |
|-------------|----------|-----------|
| US | By filing date of return | $10M+ related-party transactions |
| UK | By filing date of return | No threshold |
| Germany | Within 60 days of request | All transactions |
| India | By filing date of return | INR 10M+ transactions |
| UAE | Within 30 days of request | All transactions |
| Singapore | By filing date of return | SGD 15M+ transactions |
| OECD compliant | By filing date of return | Varies |

## Adjustments

### Primary Adjustment

When intercompany pricing is found to be outside the arm's length range:

| Adjustment Type | Description | Accounting Impact |
|----------------|-------------|-------------------|
| Pricing adjustment | Adjust price to arm's length value | Changes revenue/cost, tax liability |
| Compensation adjustment | Compensating entries for balance | No P&L impact, balance sheet only |
| Secondary adjustment | Tax consequences of fund transfers | Deemed dividend, loan, or equity |

### Corresponding Adjustment

To avoid double taxation, the counterparty entity adjusts its tax position:

```
Entity A (US) overcharged Entity B (Germany) by $100
  ├── US: Primary adjustment → Reduce income by $100
  └── Germany: Corresponding adjustment → Reduce deduction by $100
      (Maintains tax symmetry)
```

### Year-End Adjustments

```typescript
interface TPAdjustment {
  id: string;
  taxYear: string;
  transactionId: string;
  adjustmentType: "primary" | "compensating" | "secondary" | "corresponding";
  direction: "increase" | "decrease";
  amount: Money;
  entityImpacted: string;
  counterpartyEntity: string;
  reason: string;
  approvalStatus: "pending" | "approved" | "implemented";
  implementedDate: string | null;
  notes: string;
}
```

## Risk Assessment

| Risk Factor | Low | Medium | High |
|-------------|-----|--------|------|
| Transaction volume | < $1M | $1M – $10M | > $10M |
| Complexity | Standard goods | Services | Intangibles / financing |
| Method | CUP | RPM / CPM | Profit split |
| Documentation | Complete | Partial | None |
| Audit history | No audits | Audited, no adjustments | Audited, adjustments made |
| Loss position | Profitable | Variable | Consistent losses |
| IP transactions | No IP | License of routine IP | Unique/high-value IP |
| Jurisdiction risk | Low-tax treaty | Medium | Tax haven / blacklist |

### Transfer Pricing Risk Score

```typescript
interface TPRiskAssessment {
  entityId: string;
  taxYear: string;
  overallScore: number;                 // 0-100 (higher = riskier)
  overallRating: "low" | "medium" | "high" | "critical";
  dimensionScores: {
    transactionVolumes: number;
    methodAppropriateness: number;
    documentationCompleteness: number;
    historicalAuditResults: number;
    profitabilityDeviation: number;
    complexityLevel: number;
    jurisdictionRisk: number;
    ipTransactionExposure: number;
  };
  recommendations: {
    priority: "high" | "medium" | "low";
    action: string;
    impact: string;
  }[];
  comparableAnalysis: {
    testedPartyMargin: number;
    comparablesRange: { min: number; max: number; median: number };
    position: "within" | "below" | "above";
    adjustmentAmount: number | null;
  };
}
```

## Compliance Calendar

| Activity | Frequency | Deadline |
|----------|-----------|----------|
| Transaction recording | Ongoing | Per transaction date |
| Benchmarking update | Every 3 years | Before filing deadline |
| Master file preparation | Annual | By filing deadline |
| Local file preparation | Annual | By filing deadline |
| CbC report filing | Annual (≥EUR 750M) | 12 months after year-end |
| Risk assessment | Annual | Before year-end |
| Documentation review | Annual | Before filing deadline |
| Adjustment implementation | Annual | By year-end |
