# Direct Tax (Corporate Income Tax)

## Overview

The Direct Tax domain handles corporate income tax (CIT) provisioning, computation, and reporting. It supports current tax, deferred tax, and estimated tax payments across multiple jurisdictions, legal entities, and accounting standards (IFRS, US GAAP, local GAAP).

## Tax Provisioning

### Provisioning Components

| Component | Description | Timing |
|-----------|-------------|--------|
| Current tax | Tax payable on taxable profits for the period | Each period close |
| Deferred tax | Tax effects of temporary differences | Each period close |
| Estimated tax | Quarterly/monthly estimated payments | Throughout year |
| Prior year adjustments | Corrections to prior period provisions | When identified |
| Uncertain tax positions | Liabilities for tax positions that may be challenged | Each period close |

### Provisioning Flow

```
Period Close Trigger
  │
  ▼
1. Compute Accounting Profit
  ├── P&L net income before tax
  └── Adjust for permanent differences
  │
  ▼
2. Compute Taxable Profit
  ├── Start with accounting profit
  ├── Add back non-deductible expenses
  ├── Deduct non-taxable income
  ├── Apply timing differences (temporary)
  └── Apply tax losses carried forward/back
  │
  ▼
3. Calculate Current Tax
  ├── Apply jurisdiction-specific tax rates
  ├── Apply tax credits and incentives
  └── Compute tax payable per jurisdiction
  │
  ▼
4. Calculate Deferred Tax
  ├── Identify all temporary differences
  ├── Identify tax loss carryforwards
  ├── Apply substantiated future rates
  └── Compute DTA / DTL balances
  │
  ▼
5. Calculate Effective Tax Rate
  ├── Total tax expense / Accounting profit
  ├── Reconcile statutory to effective rate
  └── Generate rate reconciliation
  │
  ▼
6. Record Journal Entries
  ├── Current tax provision (Dr: Tax Expense, Cr: Current Tax Payable)
  ├── Deferred tax provision (Dr/Cr: Tax Expense, Cr/Dr: DTA/DTL)
  └── Estimated payments (Dr: Current Tax Payable, Cr: Cash)
```

## Tax Base Computation

```typescript
interface TaxBaseComputation {
  periodId: string;
  entityId: string;
  jurisdictionId: string;
  
  // Starting point
  accountingProfitBeforeTax: number;
  
  // Permanent differences
  permanentDifferences: {
    nonDeductibleExpenses: number;     // Fines, penalties, political donations
    nonTaxableIncome: number;          // Dividend income, capital gains exemptions
    disallowedEntertainment: number;
    disallowedDepreciation: number;    // Excess over tax depreciation
    otherPermanentItems: number;
  };
  
  // Temporary differences
  temporaryDifferences: {
    depreciationTiming: number;        // GAAP vs Tax depreciation
    revenueTiming: number;             // Accrual vs tax recognition
    provisionTiming: number;           // Warranty, bad debt provisions
    inventoryTiming: number;           // GAAP vs Tax valuation
    pensionTiming: number;
    fxTiming: number;
    otherTemporaryItems: number;
  };
  
  // Loss utilization
  taxLossesUtilized: number;
  taxLossesCarriedForward: number;
  
  // Result
  taxableProfit: number;
  taxRate: number;
  currentTaxExpense: number;
  taxCredits: number;
  currentTaxPayable: number;
}
```

### Permanent Differences

Permanent differences affect the current period's tax but reverse in the future:

| Difference | Treatment | Example |
|------------|-----------|---------|
| Non-deductible expenses | Add back to accounting profit | Fines, client entertainment |
| Non-taxable income | Deduct from accounting profit | Dividend income (participation exemption) |
| Tax-exempt gains | Deduct from accounting profit | Capital gains on certain assets |
| Disallowed provisions | Add back | General bad debt provisions |
| Tax incentives | Deduct from taxable profit | R&D super-deduction, patent box |

### Temporary Differences

Temporary differences reverse in future periods and give rise to deferred tax:

| Temporary Difference | Balance Sheet Impact | DTA / DTL |
|---------------------|---------------------|-----------|
| Accelerated tax depreciation | Tax base < Carrying amount | DTL |
| Accrued expenses (not yet deductible) | Tax base > Carrying amount | DTA |
| Revenue recognized for tax before GAAP | Tax base < Carrying amount | DTL |
| Provisions (warranty, bad debts) | Tax base > Carrying amount | DTA |
| Pension liabilities | Tax base > Carrying amount | DTA |
| Tax loss carryforwards | No asset in GAAP balance sheet | DTA |
| Unrealized FX gains (GAAP) | Carrying amount > Tax base | DTL |
| Intangible asset impairment | Tax base ≠ Carrying amount | DTA/DTL |

## Deferred Tax

### Deferred Tax Asset (DTA) Recognition

```typescript
interface DeferredTaxAsset {
  id: string;
  entityId: string;
  jurisdictionId: string;
  origin: "loss-carryforward" | "deductible-temporary-difference"
       | "tax-credit-carryforward" | "provision" | "pension" | "other";
  carryingAmount: number;           // DTA recognized
  grossTemporaryDifference: number;
  appliedTaxRate: number;
  expiryDate: string | null;        // For loss/credit carryforwards
  utilization: {
    utilizedToDate: number;
    remainingUtilization: number;
    expectedUtilizationPeriod: string;
  };
  valuationAllowance: number;       // If recovery is not probable
  netCarryingAmount: number;        // CarryingAmount - ValuationAllowance
  recoverabilityAssessment: "probable" | "possible" | "unlikely";
  reversalProfile: { year: string; amount: number }[];
}
```

### Valuation Allowance

A valuation allowance is required when it is more likely than not (≥50%) that some portion of a DTA will not be realized. Assessment factors:

| Factor | Positive Evidence | Negative Evidence |
|--------|-------------------|-------------------|
| Cumulative losses | No recent losses | History of recent losses |
| Projected income | Forecast shows taxable income | Forecast shows continued losses |
| Loss carryforward expiry | Losses expire far in future | Losses expiring soon |
| Tax planning strategies | Feasible strategies available | No strategies available |
| Reversing DTLs | Sufficient DTLs to absorb DTAs | Insufficient DTLs |

### Deferred Tax Liability (DTL)

```typescript
interface DeferredTaxLiability {
  id: string;
  entityId: string;
  jurisdictionId: string;
  origin: "accelerated-depreciation" | "revenue-timing"
        | "unrealized-gain" | "intangible-amortization" | "other";
  carryingAmount: number;
  grossTemporaryDifference: number;
  appliedTaxRate: number;
  reversalProfile: { year: string; amount: number }[];
}
```

### Deferred Tax Reconciliation

```
Opening DTA/DTL Balance
  │
  ├── + Current period movement (temporary differences)
  ├── + Rate change adjustment
  ├── + Acquisitions / Disposals
  ├── + Currency translation (for foreign entities)
  ├── + Valuation allowance movement
  └── − / + Other movements
  │
  ▼
Closing DTA/DTL Balance
```

## Estimated Tax Payments

| Payment Type | Jurisdictions | Frequency |
|-------------|---------------|-----------|
| Quarterly estimated | US, many states | Quarterly (4, 6, or 8 installments) |
| Monthly estimated | Selected jurisdictions | Monthly |
| Self-assessment | UK, Australia | Two installments (based on prior year) |
| Annual prepayment | Selected countries | Annual (based on prior year liability) |

### Estimated Payment Calculation

```typescript
interface EstimatedTaxPayment {
  id: string;
  entityId: string;
  jurisdictionId: string;
  taxYear: string;
  installmentNumber: number;
  totalInstallments: number;
  dueDate: string;
  calculationMethod: "prior-year" | "annualized-income" | "actual-income";
  priorYearLiability: number | null;
  currentYearEstimate: number | null;
  installmentAmount: number;
  amountPaid: number;
  status: "due" | "paid" | "overpaid" | "underpaid";
  penaltyExempt: boolean;        // If safe harbor rules met
}
```

### Safe Harbor Rules (US)

| Method | Payment Required | Threshold |
|--------|-----------------|-----------|
| Prior year | 100% of prior year tax (110% if AGI > $150k) | No penalty |
| Annualized income | 90% of current year tax | No penalty |
| Actual income | 90% of current year tax | No penalty |

## Tax Rate Reconciliation

```
Statutory Tax Rate: 25.0%
  │
  ├── Permanent differences:
  │   ├── Non-deductible expenses: +2.3%
  │   ├── Tax-exempt income: −1.5%
  │   └── R&D credits: −0.8%
  │
  ├── Rate differentials:
  │   ├── Foreign rate differences: +1.2%
  │   ├── State/local taxes (net of federal): +3.1%
  │   └── Change in tax rate: −0.4%
  │
  ├── Deferred tax items:
  │   ├── Valuation allowance change: +0.6%
  │   └── Prior year adjustment: −0.2%
  │
  └── Other: +0.1%
      │
      ▼
Effective Tax Rate: 29.4%
```

### Rate Reconciliation Report

```typescript
interface ETRReconciliation {
  periodId: string;
  entityId: string;
  totalJurisdictions: number;
  weightedStatutoryRate: number;
  effectiveTaxRate: number;
  reconciliationLines: {
    category: "permanent" | "temporary" | "rate-differential"
            | "deferred" | "credits" | "other";
    description: string;
    impact: number;            // Percentage points
  }[];
  jurisdictionBreakdown: {
    jurisdictionId: string;
    profitBeforeTax: number;
    taxExpense: number;
    statutoryRate: number;
    effectiveRate: number;
  }[];
}
```

## Period Close Checklist

| Step | Activity | Service Method |
|------|----------|----------------|
| 1 | Compute accounting profit before tax | External (GL) |
| 2 | Identify permanent differences | `DirectTaxService` |
| 3 | Identify temporary differences | `DirectTaxService` |
| 4 | Compute current tax per jurisdiction | `DirectTaxService.calculateProvision()` |
| 5 | Compute deferred tax movement | `DirectTaxService.getDeferredTax()` |
| 6 | Apply tax credits and incentives | `DirectTaxService` |
| 7 | Compute uncertain tax positions | `DirectTaxService` |
| 8 | Generate ETR reconciliation | `DirectTaxService` |
| 9 | Review and approve provision | Workflow |
| 10 | Post journal entries | External (GL) |
| 11 | Update tax return data | `TaxReturnService` |
| 12 | Update estimated payment calculations | `TaxPaymentService` |
