# Tax Audit Trail

## Overview

The Tax Audit domain provides a comprehensive, tamper-evident audit trail of all tax-related events across the module. It captures rule changes, return amendments, payment modifications, approval chains, user activity, and compliance events. Every audit record is immutable and carries a cryptographic chain hash for integrity verification.

## Audit Event Types

### Domain Events

| Event Category | Event Type | Description |
|----------------|------------|-------------|
| Tax Rules | `tax-rule.created` | New tax rule defined |
| Tax Rules | `tax-rule.updated` | Tax rule rate or condition changed |
| Tax Rules | `tax-rule.deactivated` | Tax rule deactivated |
| Tax Rules | `tax-rule.exemption-added` | Exemption certificate registered |
| Jurisdictions | `jurisdiction.created` | New jurisdiction added |
| Jurisdictions | `jurisdiction.updated` | Jurisdiction details changed |
| Jurisdictions | `jurisdiction.tax-number-added` | Tax number registered |
| Jurisdictions | `jurisdiction.tax-number-removed` | Tax number deactivated |
| Indirect Tax | `indirect-tax.transaction-processed` | Transaction tax calculated |
| Indirect Tax | `indirect-tax.return-data-generated` | Return data prepared |
| Direct Tax | `direct-tax.provision-calculated` | Tax provision computed |
| Direct Tax | `direct-tax.deferred-calculated` | Deferred tax computed |
| Direct Tax | `direct-tax.estimated-payment-set` | Estimated payment schedule set |
| Withholding | `withholding.transaction-recorded` | WHT transaction recorded |
| Withholding | `withholding.certificate-issued` | WHT certificate issued |
| Transfer Pricing | `transfer-pricing.transaction-recorded` | Intercompany transaction recorded |
| Transfer Pricing | `transfer-pricing.adjustment-made` | TP adjustment applied |
| Returns | `return.created` | Tax return created |
| Returns | `return.submitted` | Tax return submitted |
| Returns | `return.approved` | Tax return approved |
| Returns | `return.amended` | Tax return amended |
| Returns | `return.rejected` | Tax return rejected |
| Payments | `payment.scheduled` | Payment scheduled |
| Payments | `payment.initiated` | Payment initiated |
| Payments | `payment.confirmed` | Payment confirmed |
| Payments | `payment.failed` | Payment failed |
| Payments | `payment.reconciled` | Payment reconciled |
| Compliance | `compliance.score-calculated` | Compliance score updated |
| Compliance | `compliance.violation-detected` | Violation recorded |
| Compliance | `compliance.violation-resolved` | Violation resolved |
| Reconciliation | `reconciliation.performed` | Reconciliation completed |
| Reconciliation | `reconciliation.exception-raised` | Reconciliation exception |
| User | `user.login` | User authenticated |
| User | `user.action` | User action on tax entity |

### Event Model

```typescript
interface AuditEvent {
  id: string;
  eventType: string;
  timestamp: string;                    // ISO 8601 with timezone
  entityType: string;                   // e.g., "TaxRule", "TaxReturn", "TaxPayment"
  entityId: string;                     // ID of the affected entity
  action: "create" | "update" | "delete" | "submit" | "approve"
       | "reject" | "amend" | "process" | "calculate" | "reconcile"
       | "issue" | "record" | "schedule" | "initiate" | "confirm"
       | "fail" | "detect" | "resolve" | "login";
  
  // User context
  userId: string;
  userRole: string;
  userIp: string;                       // Source IP address
  
  // Session context
  sessionId: string;
  correlationId: string;                // Links related events in a transaction
  
  // Change details
  changes: AuditChange[];               // Before/after values
  metadata: Record<string, unknown>;    // Additional context
  
  // Integrity
  previousHash: string;                 // SHA-256 of previous event
  hash: string;                         // SHA-256 of this event
  signature: string;                    // Digital signature (if configured)
  
  // Source
  source: "api" | "ui" | "system" | "integration";
  sourceModule: string;                 // e.g., "tax-service", "tax-returns"
}

interface AuditChange {
  field: string;
  previousValue: unknown;
  newValue: unknown;
  changeType: "added" | "removed" | "modified";
}
```

## Tamper-Evident Chain

The audit log uses a blockchain-style hash chain to ensure tamper evidence:

```
Genesis Event                    Event #2                         Event #3
┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
│ id: "evt-001"    │           │ id: "evt-002"    │           │ id: "evt-003"    │
│ timestamp: T1    │           │ timestamp: T2    │           │ timestamp: T3    │
│ eventType: "..." │───────►   │ eventType: "..." │───────►   │ eventType: "..." │
│ data: {...}      │           │ data: {...}      │           │ data: {...}      │
│ previousHash: "" │           │ previousHash: H1 │           │ previousHash: H2 │
│ hash: H1         │           │ hash: H2         │           │ hash: H3         │
└──────────────────┘           └──────────────────┘           └──────────────────┘
```

### Hash Calculation

```
Hash = SHA-256(
  previousHash +
  timestamp +
  eventType +
  entityId +
  action +
  userId +
  JSON.stringify(changes) +
  JSON.stringify(metadata)
)
```

### Chain Integrity Verification

```typescript
interface ChainIntegrityResult {
  totalEvents: number;
  verifiedEvents: number;
  failedEvents: number;
  failedEventIds: string[];
  startTimestamp: string;
  endTimestamp: string;
  chainIntact: boolean;
  firstCorruptionIndex: number | null;
  integrityPercentage: number;         // 100 = fully intact
}
```

The verification process:

1. Start from genesis event (previousHash = "")
2. For each subsequent event:
   - Compute expected hash from previous event's data
   - Compare computed hash with stored `previousHash`
   - If mismatch → chain corruption detected
3. Report results with failed event IDs for investigation

## Audit Queries

### Standard Queries

```typescript
interface AuditQuery {
  eventTypes?: string[];
  entityTypes?: string[];
  entityIds?: string[];
  userIds?: string[];
  actions?: string[];
  dateRange?: { from: string; to: string };
  ipAddress?: string;
  correlationId?: string;
  source?: string;
  includeChanges?: boolean;             // Include before/after values
  sortOrder?: "asc" | "desc";
  page: number;
  pageSize: number;
}
```

### Query Examples

| Use Case | Query | Purpose |
|----------|-------|---------|
| Return approval trail | eventType=return.approved, entityId=X, sorted asc | Full approval chain |
| User activity | userId=U123, dateRange=last-30-days | User activity audit |
| Entity changes | entityType=TaxRule, entityId=R456 | Full change history |
| Compliance events | eventType=compliance.*, dateRange=Q1-2026 | Compliance event log |
| Suspicious activity | same-user, multiple-entities, short-timeframe | Anomaly detection |
| Correlation search | correlationId=C789 | End-to-end transaction trail |

### Query Performance

| Query Pattern | Index Strategy | Expected Performance |
|---------------|----------------|---------------------|
| By event type | B-tree on eventType | O(log n) |
| By entity | B-tree on entityType + entityId | O(log n) |
| By user | B-tree on userId + timestamp | O(log n) |
| By date range | B-tree on timestamp | O(log n) |
| By correlation | B-tree on correlationId | O(log n) |
| Full chain | Sequential scan + hash verify | O(n) |

## Approval Chain Audit

### Multi-Level Approval Tracking

```typescript
interface ApprovalAudit {
  approvalChainId: string;
  entityType: string;                   // e.g., "TaxReturn"
  entityId: string;                     // e.g., "return-789"
  requiredApprovals: number;
  obtainedApprovals: number;
  status: "pending" | "approved" | "rejected" | "escalated";
  steps: ApprovalStep[];
}

interface ApprovalStep {
  stepNumber: number;
  approverId: string;
  approverRole: string;
  action: "approved" | "rejected" | "escalated" | "delegated";
  comment: string;
  timestamp: string;
  previousStepStatus: string;
  escalatedTo: string | null;
  delegatedTo: string | null;
}
```

### Approval Chain Integrity

Each approval step generates an audit event. The complete approval chain can be reconstructed from audit events:

```
Query: eventType IN ("return.submitted", "return.approved", "return.rejected")
       AND entityId = "return-789"
       ORDER BY timestamp ASC

Result:
  1. 2026-01-15 09:00: User create → return.created
  2. 2026-01-15 09:30: User submit → return.submitted
  3. 2026-01-15 10:15: Manager approve → return.approved (Level 1)
  4. 2026-01-15 11:00: Director approve → return.approved (Level 2)
  5. 2026-01-15 11:00: System submit → return.submitted (to authority)
```

## User Activity Audit

```typescript
interface UserActivitySummary {
  userId: string;
  userName: string;
  userRole: string;
  period: { from: string; to: string };
  totalActions: number;
  actionsByType: Record<string, number>;
  actionsByEntityType: Record<string, number>;
  peakActivityHours: number[];          // Hours with most activity
  lastActivity: string;                 // ISO timestamp
  averageSessionDuration: number;       // Minutes
  uniqueEntitiesAccessed: number;
  failedAttempts: number;               // Failed login or unauthorized actions
}
```

## Data Retention

### Retention Policy

| Event Category | Retention Period | Archive After | Deletion After |
|----------------|-----------------|---------------|----------------|
| Tax rule changes | Indefinite | — | — |
| Return events | Indefinite | — | — |
| Payment events | 10 years | 7 years | 10 years |
| Transaction processing | 10 years | 7 years | 10 years |
| Compliance events | 7 years | 5 years | 7 years |
| User activity | 3 years | 2 years | 3 years |
| Failed actions | 1 year | — | 1 year |

### Archive Strategy

```
Active Store (Recent 12 months)
  ├── In-memory cache (LRU, 10,000 events)
  └── Primary index (eventType, entityType, timestamp)
       │
       ▼
Warm Storage (12 months – Retention Period)
  ├── Compressed JSON files
  ├── Partitioned by month + event category
  └── Restore on query
       │
       ▼
Cold Archive (Beyond Retention Period)
  ├── Encrypted backup
  ├── Offline storage
  └── Manual restore only
```

## Audit Reporting

### Standard Audit Reports

| Report | Description | Audience |
|--------|-------------|----------|
| Full Event Log | All events in date range, filterable | Auditors, Compliance |
| Approval Summary | All approvals with chain details | Controllers |
| User Activity Report | Per-user action summary | Security, Managers |
| Change History | Full change history for an entity | Tax Managers |
| Integrity Report | Chain integrity verification | Auditors, Compliance |
| Failed Actions | Login failures, unauthorized attempts | Security |
| Compliance Events | Violation-related audit events | Tax Director |

### Audit Report Generation

```typescript
interface AuditReport {
  reportType: string;
  reportPeriod: { from: string; to: string };
  generatedAt: string;
  generatedBy: string;
  totalEvents: number;
  events: AuditEvent[];
  summary: {
    byEventType: Record<string, number>;
    byUser: Record<string, number>;
    peakActivityDay: string;
    integrityVerified: boolean;
    firstEventTimestamp: string;
    lastEventTimestamp: string;
  };
  format: "json" | "csv" | "pdf";
  signature: string;                    // Digital signature of report
}
```

## Integration with Platform Audit

The Tax Audit domain integrates with the platform's `recordAudit()` and `recordIAMAudit()` functions for cross-module consistency:

| Platform Function | When Called | Tax Audit Supplement |
|-------------------|-------------|----------------------|
| `recordAudit()` | Any data mutation | TaxAuditService captures domain-specific details |
| `recordIAMAudit()` | Permission changes, login | Tax compliance events link to IAM events via correlationId |

See [docs/architecture/](/Users/horus/Desktop/vaultareloaded/docs/architecture/) for the platform-wide audit framework.
