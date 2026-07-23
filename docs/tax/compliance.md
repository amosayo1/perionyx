# Tax Compliance

## Overview

The Tax Compliance domain provides automated compliance scoring, risk level assessment, violation tracking, filing and payment deadline monitoring, audit readiness evaluation, and remediation workflow management. It gives Tax Directors and Controllers a single-pane view of compliance health across all jurisdictions and tax types.

## Compliance Scoring

### Score Model

```typescript
interface ComplianceScore {
  entityId: string;
  jurisdictionId: string | null;       // null = across all jurisdictions
  taxType: TaxType | null;             // null = across all tax types
  period: string;
  overallScore: number;                // 0–100
  scoreDate: string;
  
  dimensionScores: {
    filingTimeliness: number;          // 0–100
    paymentTimeliness: number;         // 0–100
    returnAccuracy: number;            // 0–100
    documentationCompleteness: number; // 0–100
    auditHistory: number;              // 0–100
    notificationResponsiveness: number; // 0–100
    internalControlStrength: number;   // 0–100
  };
  
  riskLevel: "low" | "medium" | "high" | "critical";
  previousScore: number | null;
  scoreChange: number;                 // Positive = improving
  scoreTrend: "improving" | "declining" | "stable";
}
```

### Scoring Weights

| Dimension | Weight | Data Source |
|-----------|--------|-------------|
| Filing timeliness | 25% | Calendar + Returns |
| Payment timeliness | 20% | Payments |
| Return accuracy | 15% | Returns + Amendments |
| Documentation completeness | 15% | All domains |
| Audit history | 10% | Audit |
| Notification responsiveness | 10% | Compliance |
| Internal control strength | 5% | Audit + Governance |

### Score Calculation

```
Compliance Score = Σ(Dimension Score × Dimension Weight)

Scoring Rules:
  Filing Timeliness:
    - On-time filing rate over last 12 months
    - 100 = 100% on-time; −10 per percentage point below 100%
    - Floor: 0
  
  Payment Timeliness:
    - On-time payment rate over last 12 months
    - 100 = 100% on-time; −5 per percentage point below 100%
    - Floor: 0
  
  Return Accuracy:
    - Based on amendment rate
    - 100 = no amendments; −5 per amendment; −15 per audit-adjusted return
    - Floor: 0
  
  Documentation Completeness:
    - Based on % of required documents filed
    - 100 = all filed; −2 per missing document category
    - Floor: 0
  
  Audit History:
    - Based on audit results
    - 100 = no audits/no adjustments; 80 = audit with no adjustments
    - 50 = audit with minor adjustments; 0 = audit with major adjustments
    - Floor: 0
  
  Notification Responsiveness:
    - Days to respond to tax authority inquiries
    - 100 = ≤5 days; −10 per 5-day delay; floor: 0
  
  Internal Control Strength:
    - Based on control testing results
    - 100 = all controls pass; −20 per failed control
    - Floor: 0
```

## Risk Levels

| Score Range | Risk Level | Color | Action Required |
|-------------|-----------|-------|-----------------|
| 90–100 | Low | Green | Routine monitoring |
| 70–89 | Medium | Amber | Quarterly review |
| 50–69 | High | Orange | Monthly review + remediation plan |
| 0–49 | Critical | Red | Immediate remediation required |

## Violations

### Violation Types

```typescript
type ViolationType =
  | "late-filing"          // Return filed after deadline
  | "late-payment"         // Tax paid after deadline
  | "underpayment"         // Insufficient tax paid
  | "non-filing"           // Required return not filed
  | "inaccurate-return"    // Material error in return
  | "missing-documentation" // Required documentation not maintained
  | "audit-finding"        // Adverse audit finding
  | "notification-lapse"   // Failure to respond to authority
  | "penalty-incurred"     // Penalty assessed
  | "control-failure"      // Internal control breakdown
  | "compliance-requirement-change"; // Unaddressed regulatory change
```

### Violation Model

```typescript
interface ComplianceViolation {
  id: string;
  entityId: string;
  jurisdictionId: string;
  taxType: TaxType;
  violationType: ViolationType;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  referenceId: string;              // Linked return/payment/audit ID
  referenceType: "return" | "payment" | "audit" | "notification" | "control";
  penaltyAmount: Money | null;
  actualDate: string;               // When violation occurred
  detectedDate: string;             // When violation was detected
  resolutionDueDate: string | null;
  resolvedDate: string | null;
  status: "open" | "in-progress" | "resolved" | "accepted";
  resolutionNotes: string | null;
  assignedTo: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

## Deadline Monitoring

### Filing Deadline Monitoring

```typescript
interface FilingDeadlineStatus {
  returnId: string;
  jurisdictionId: string;
  taxType: TaxType;
  period: string;
  dueDate: string;
  extensionDate: string | null;
  effectiveDeadline: string;         // Due date or extension date
  status: "upcoming" | "due-soon" | "overdue" | "filed" | "extended";
  daysRemaining: number;             // Negative if overdue
  assignee: string | null;
  completionPercentage: number;      // 0–100
  blockingIssues: string[];
}
```

### Payment Deadline Monitoring

```typescript
interface PaymentDeadlineStatus {
  paymentId: string;
  jurisdictionId: string;
  taxType: TaxType;
  estimatedAmount: Money;
  dueDate: string;
  status: "upcoming" | "due-soon" | "overdue" | "paid" | "waived";
  daysRemaining: number;
  amountPaid: Money | null;
  shortfallAmount: Money | null;
  paymentMethod: string | null;
}
```

### Alert Triggers

| Event | Trigger | Alert Type | Recipient |
|-------|---------|------------|-----------|
| Filing deadline approaching | ≤14 days | Warning | Tax manager |
| Filing deadline imminent | ≤3 days | Critical | Tax Director |
| Filing overdue | Past due | Violation | Tax Director, Controller |
| Payment deadline approaching | ≤7 days | Warning | Treasury, Tax manager |
| Payment overdue | Past due | Violation | Treasury, Tax Director |
| Compliance score drop | >10 point drop | Warning | Tax Director |
| New violation detected | Any | Notification | Assigned person |
| Audit risk increasing | Score < 50 | Critical | Tax Director, CFO |

## Audit Readiness

```typescript
interface AuditReadiness {
  entityId: string;
  jurisdictionId: string | null;
  overallReadiness: "ready" | "partially-ready" | "not-ready";
  readinessScore: number;              // 0–100
  dimensions: {
    documentationCompleteness: AuditReadinessDimension;
    returnAccuracy: AuditReadinessDimension;
    paymentCompliance: AuditReadinessDimension;
    responsePreparedness: AuditReadinessDimension;
    controlEnvironment: AuditReadinessDimension;
  };
  gaps: {
    dimension: string;
    description: string;
    severity: "low" | "medium" | "high";
    remediation: string;
  }[];
  lastReviewDate: string;
  nextReviewDate: string;
}

interface AuditReadinessDimension {
  score: number;
  status: "satisfactory" | "needs-improvement" | "unsatisfactory";
  checklist: {
    item: string;
    satisfied: boolean;
    notes: string;
  }[];
}
```

### Audit Readiness Checklist

| Domain | Checklist Items |
|--------|----------------|
| Tax Rules | All applicable rates defined? Effective dates correct? Exemptions documented? |
| Jurisdictions | All active jurisdictions registered? Tax numbers current? Authorities mapped? |
| Indirect Tax | Output tax correctly computed? Input tax recovery supported? Reverse charge documented? |
| Direct Tax | Provision calculations documented? DTA/DTL supported? ETR reconciliation current? |
| Withholding | Certificates issued for all transactions? Treaty rates applied correctly? |
| Transfer Pricing | Documentation current? Benchmarking in date? Master/local files maintained? |
| Returns | All returns filed? Amendments documented? Supporting evidence retained? |
| Payments | All payments made on time? Penalties/interest documented? Reconciliations current? |
| Calendar | All deadlines tracked? Extensions documented? Reminder process working? |

## Remediation Workflows

### Violation Remediation Flow

```
Violation Detected
  │
  ▼
1. Create Remediation Ticket
  ├── Assign responsible person
  ├── Set priority (based on severity)
  └── Set target resolution date
  │
  ▼
2. Root Cause Analysis
  ├── Identify underlying cause
  ├── Document findings
  └── Propose corrective action
  │
  ▼
3. Implement Corrective Action
  ├── Fix immediate issue (file return, pay tax, update documentation)
  ├── Address root cause (process change, training, system update)
  └── Verify fix
  │
  ▼
4. Review and Close
  ├── Manager review
  ├── Update compliance score
  └── Close remediation ticket
```

```typescript
interface RemediationWorkflow {
  id: string;
  violationId: string;
  assignedTo: string;
  priority: "low" | "medium" | "high" | "critical";
  targetDate: string;
  status: "open" | "investigating" | "implementing" | "reviewing" | "closed";
  rootCause: string | null;
  correctiveAction: string | null;
  preventiveAction: string | null;
  steps: RemediationStep[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface RemediationStep {
  stepNumber: number;
  description: string;
  assignee: string;
  dueDate: string;
  completedDate: string | null;
  status: "pending" | "in-progress" | "completed";
  notes: string;
}
```

## Compliance Reports

### Standard Compliance Reports

| Report | Frequency | Audience |
|--------|-----------|----------|
| Compliance Scorecard | Monthly | Tax Director, Controller |
| Violation Summary | Weekly | Tax Manager |
| Deadline Calendar | Weekly | Tax Team |
| Audit Readiness Report | Quarterly | Tax Director, Internal Audit |
| Risk Heat Map | Monthly | Tax Director, CFO |
| Remediation Status | Weekly | Tax Manager |
| Compliance Trend Analysis | Quarterly | Tax Director, CFO |

### Compliance Heat Map

The compliance heat map provides a visual matrix of compliance health across jurisdictions and dimensions:

```
Jurisdiction    Filing   Payment  Accuracy  Documentation  Overall
─────────────  ───────  ───────  ────────  ─────────────  ───────
US (Federal)     ● high   ● high   ● high     ● high        ● 95
US (CA)          ◐ med    ◐ med    ● high     ◐ med         ◐ 78
UK               ● high   ● high   ● high     ● high        ● 92
Germany          ◐ med    ◐ med    ◐ med      ○ low         ◐ 71
India            ○ low    ◐ med    ○ low      ○ low         ○ 45
UAE              ● high   ● high   ● high     ● high        ● 96

● = Good (80-100)   ◐ = Fair (60-79)   ○ = Poor (0-59)
```

### Compliance Trend Analysis

```typescript
interface ComplianceTrend {
  period: string;
  overallScore: number;
  dimensionScores: Record<string, number>;
  violationCount: number;
  resolvedCount: number;
  openCount: number;
  averageResolutionDays: number;
}
```

Trend analysis enables Tax Directors to identify:
- Improving or declining compliance postures by jurisdiction
- Effectiveness of remediation actions
- Seasonal patterns in compliance metrics
- Impact of regulatory changes on compliance scores
