# Tax Returns

## Overview

The Tax Returns domain manages the complete lifecycle of tax return preparation, review, approval, submission, and amendment across all tax types and jurisdictions. It supports multi-jurisdiction filing, extension management, historical return tracking, and amendment workflows.

## Return Lifecycle

```
Draft ──► Under Review ──► Approved ──► Submitted ──► Acknowledged
  │                          │              │
  │                          │              ├──► Amended
  │                          │              │       │
  │                          │              │       └──► Resubmitted
  │                          │              │
  │                          │              └──► Rejected
  │                          │                      │
  │                          │                      └──► Corrected
  │                          │
  │                          └──► Rejected
  │                                  │
  │                                  └──► Revised Draft
  │
  └──► Cancelled
```

### State Model

```typescript
type ReturnStatus =
  | "draft"             // Initial state, editable
  | "under-review"      // Submitted for review, locked for edits
  | "approved"          // Ready for submission
  | "submitted"         // Filed with tax authority
  | "acknowledged"      // Authority acceptance received
  | "rejected"          // Authority rejected (processing error, not tax dispute)
  | "amended"           // Amended return filed
  | "cancelled";        // Discarded before submission
```

### State Transition Rules

| Current State | Allowed Transitions | Conditions |
|---------------|-------------------|------------|
| Draft | Under Review, Cancelled | All data must be complete |
| Under Review | Approved, Rejected, Draft | Reviewer assigned |
| Approved | Submitted, Draft | Approver must be authorized |
| Submitted | Acknowledged, Amended | Submission confirmation received |
| Acknowledged | Amended | Within amendment window |
| Amended | Submitted | Amendment prepared |
| Rejected | Draft (revision) | Rejection reason documented |
| Cancelled | — | Terminal state |

## Return Types

```typescript
interface TaxReturn {
  id: string;
  entityId: string;
  jurisdictionId: string;
  taxType: TaxType;
  returnType: "original" | "amended" | "superseding" | "supplemental";
  taxPeriod: {
    year: string;
    periodStart: string;       // ISO date
    periodEnd: string;         // ISO date
    frequency: FilingFrequency;
  };
  status: ReturnStatus;
  dueDate: string;
  extensionDate: string | null;
  submittedDate: string | null;
  acknowledgedDate: string | null;
  
  // Financial data
  totalRevenue: Money;
  totalDeductions: Money;
  taxableIncome: Money;
  taxLiability: Money;
  taxCredits: Money;
  taxPayable: Money;
  taxPaid: Money;
  balanceDue: Money;
  refundAmount: Money;
  
  // Line data
  lines: TaxReturnLine[];
  supportingDocuments: SupportingDocument[];
  adjustments: ReturnAdjustment[];
  
  // Audit trail
  createdBy: string;
  reviewedBy: string | null;
  approvedBy: string | null;
  submittedBy: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Extension
  extension: ReturnExtension | null;
  
  // Amendment
  amendmentOf: string | null;        // Original return ID
  amendmentReason: string | null;
  subsequentAmendments: string[];    // Child amendment IDs
}

interface TaxReturnLine {
  lineNumber: number;
  lineCode: string;                  // Jurisdiction-specific line code
  lineDescription: string;
  amount: number;
  currency: string;
  boxNumber: string;                 // Return box/reference
  notes: string;
}
```

## Multi-Jurisdiction Filing

### Filing Strategy

| Strategy | Description | Use Case |
|----------|-------------|----------|
| Separate returns | Each jurisdiction files independently | Standard approach |
| Consolidated | Single group return | Tax groups with permission |
| Combined | Combined filing, separate calculations | US state combined reporting |
| Unitary | Single tax base, apportioned | US state unitary filing |
| VAT group | Single VAT return for related entities | UK, Germany, Netherlands |

### Apportionment for Multi-Jurisdiction Filing

For income tax in multi-jurisdiction regimes (e.g., US states):

```
Apportionment Factors:
  │
  ├── Sales Factor: Sales in jurisdiction / Total Sales
  ├── Property Factor: Property in jurisdiction / Total Property
  └── Payroll Factor: Payroll in jurisdiction / Total Payroll
       │
       ▼
Apportionment Percentage = (Sales% + Property% + Payroll%) / 3
  │
  ▼
Taxable Income in Jurisdiction = Total Income × Apportionment%
```

## Extension Management

### Extension Types

| Extension Type | Description | Common Duration |
|---------------|-------------|-----------------|
| Filing extension | Additional time to file return | 3–6 months |
| Payment extension | Additional time to pay tax due | Varies by jurisdiction |
| Combined extension | Extension for both filing and payment | Varies |

```typescript
interface ReturnExtension {
  id: string;
  returnId: string;
  entityId: string;
  jurisdictionId: string;
  extensionType: "filing" | "payment" | "combined";
  originalDueDate: string;
  extensionDueDate: string;
  extensionApprovedDate: string;
  approvalReference: string;
  reason: string;
  estimatedTaxPaid: Money;       // Must be paid by original due date
  actualTaxPaid: Money;
  balanceAtExtension: Money;
  status: "pending" | "approved" | "expired" | "cancelled";
}
```

### Extension Requirements

| Jurisdiction | Max Extension | Estimated Payment Required | Form |
|-------------|---------------|---------------------------|------|
| US (federal) | 6 months | Yes (≥90% of final liability) | Form 7004 |
| UK | None | N/A | N/A |
| Germany | None | N/A | N/A |
| Australia | 4 months | Yes | Lodgment deferral |
| Singapore | None (penalty applies) | N/A | N/A |
| UAE | 30 days | No | Extension request |

## Historical Returns

### Return Archive

```typescript
interface HistoricalReturn {
  id: string;
  entityId: string;
  jurisdictionId: string;
  taxType: TaxType;
  taxYear: string;
  originalReturnId: string;
  returnType: "original" | "amended";
  status: "submitted" | "acknowledged";
  submittedDate: string;
  taxLiability: Money;
  taxPaid: Money;
  filingMethod: "electronic" | "paper" | "portal";
  confirmationCode: string;
  documentUrls: string[];
  notes: string;
}
```

Historical returns provide:
- Tax authority confirmation codes
- Full line-by-line data for each period
- Supporting document references
- Audit trail of all changes
- Comparison view between original and amended

## Amendment Tracking

### Amendment Reasons

| Reason | Description | Statute of Limitations |
|--------|-------------|----------------------|
| Mathematical error | Correction of arithmetic error | 3 years (varies) |
| Change in tax position | Updated interpretation of law | 3 years |
| Carryback adjustment | Loss/credit carryback | 3 years |
| Audit adjustment | Changes required by tax authority | Per audit |
| Change in accounting method | Permitted method change | Per IRS consent |
| Prior period error | Correction of material error | 3 years |

### Amendment Lifecycle

```
Original Return (Submitted)
  │
  ▼
Amendment Trigger (error, audit, law change, etc.)
  │
  ▼
1. Create Amendment Return
  ├── Copy original return data
  ├── Mark as "amended" type
  ├── Link to original return
  └── Set amendment reason
  │
  ▼
2. Calculate Difference
  ├── Original tax liability
  ├── Amended tax liability
  ├── Difference (additional due or refund)
  └── Interest calculation on difference
  │
  ▼
3. Review and Approve
  ├── Tax manager review
  ├── Supporting documents attached
  └── Approval workflow
  │
  ▼
4. Submit Amendment
  ├── File with tax authority
  ├── Pay additional tax (if due)
  └── Record confirmation
  │
  ▼
5. Update Original Return Status
  ├── Original marked as "amended"
  ├── Link to amendment record
  └── Forward amendment chain
```

### Amendment Comparison

```typescript
interface AmendmentComparison {
  originalReturnId: string;
  amendedReturnId: string;
  differences: {
    lineCode: string;
    lineDescription: string;
    originalAmount: number;
    amendedAmount: number;
    difference: number;
    explanation: string;
  }[];
  financialImpact: {
    originalTaxLiability: Money;
    amendedTaxLiability: Money;
    difference: Money;
    additionalTaxDue: Money;       // Positive = payment due
    refundDue: Money;              // Positive = refund due
    interestAmount: Money;
    penaltyAmount: Money;
    netImpact: Money;
  };
}
```

## Return Analytics

```typescript
interface ReturnAnalytics {
  totalReturns: number;
  byStatus: Record<ReturnStatus, number>;
  byJurisdiction: Record<string, number>;
  filingRate: number;                    // % filed on time
  amendmentRate: number;                 // % of returns amended
  averageProcessingDays: number;
  pendingApprovals: number;
  upcomingDeadlines: number;
  overdueReturns: number;
  averageTaxPerReturn: Money;
  totalTaxFiled: Money;
  totalTaxPaid: Money;
  totalRefundsClaimed: Money;
  totalPenaltiesIncurred: Money;
}
```

## Filing Calendar Integration

The Returns domain integrates with the Tax Calendar to provide:

- Deadline tracking for each return
- Automatic escalation for approaching deadlines
- Extension request triggers
- Reminder generation for review/approval/submission steps
- Penalty tracking for late filing
