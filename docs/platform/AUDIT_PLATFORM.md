# Audit Platform

**Platform**: AuditPlatform
**Contract**: `AuditContract`
**Mission**: Provide an immutable, tamper-evident audit trail and comprehensive audit management capabilities — control monitoring, findings, evidence, remediation, readiness, and regulatory reporting — for enterprise compliance and governance.
**Status**: Partially Built
**Constitutional Authority**: PLATFORM_CONSTITUTION.md

---

## Responsibilities

1. **Audit Trail Recording** — Append-only, tamper-evident logging of every security-relevant, financial, and administrative action across the platform. Every `recordAudit()` call produces an immutable entry.
2. **Control Management** — Define, monitor, and test internal controls (preventive, detective, corrective, compensating, directive) with effectiveness scoring.
3. **Finding Management** — Track audit findings (control deficiency, significant deficiency, material weakness, observation, best practice) with severity, status, and owner.
4. **Evidence Management** — Collect, organize, verify, and package audit evidence in typed packages (workpapers, regulatory filings, board presentations).
5. **Remediation Tracking** — Plan and track remediation actions with target dates, ownership, cost estimation, and velocity metrics.
6. **Continuous Audit** — Automated scanning for control failures, missing approvals, late reconciliations, high-risk events, and unusual behavior.
7. **Audit Readiness Assessment** — Score organizational readiness for annual audits, regulatory exams, SOX compliance, ISO certification.
8. **Risk Assessment** — Enterprise risk scoring by category with trend analysis and high-risk area identification.
9. **Audit Planning** — Calendar management for audit engagements, fieldwork, deadlines, and regulatory filings.
10. **Executive Reporting** — Board-level audit summaries with overall scores, finding trends, and readiness status.
11. **IAM Audit Events** — Specialized audit event recording for identity and access management operations.
12. **Security Audit** — Security event recording for the security infrastructure (encryption, rate limiting, dependency scanning).

---

## Public API (Capability Contract)

```typescript
interface AuditContract {
  // ── Core Audit Trail ────────────────────────────────────────
  record(params: RecordAuditParams): Promise<AuditLog>;
  list(ctx: TenantContext, opts: ListAuditLogsOptions): Promise<{ rows: AuditLog[]; nextCursor?: string }>;

  // ── Control Management ──────────────────────────────────────
  getControls(ctx: TenantContext, filters?: ControlFilters): Promise<AuditControl[]>;
  createControl(ctx: TenantContext, input: CreateControlInput): Promise<AuditControl>;
  updateControl(ctx: TenantContext, controlId: string, input: UpdateControlInput): Promise<AuditControl>;
  getControlEffectiveness(ctx: TenantContext): Promise<ControlEffectivenessSummary>;
  getControlFailureHeatmap(ctx: TenantContext): Promise<FailureHeatmap>;
  getSegregationOfDutiesConflicts(ctx: TenantContext): Promise<SoDConflict[]>;

  // ── Finding Management ──────────────────────────────────────
  getFindings(ctx: TenantContext, filters?: FindingFilters): Promise<FindingRecord[]>;
  createFinding(ctx: TenantContext, input: CreateFindingInput): Promise<Finding>;
  updateFinding(ctx: TenantContext, findingId: string, input: UpdateFindingInput): Promise<Finding>;
  getFindingsBySeverity(ctx: TenantContext): Promise<Record<FindingSeverity, number>>;
  getFindingsByStatus(ctx: TenantContext): Promise<Record<FindingStatus, number>>;
  getRepeatFindings(ctx: TenantContext): Promise<RepeatFinding[]>;

  // ── Evidence Management ─────────────────────────────────────
  getEvidencePackages(ctx: TenantContext, filters?: EvidenceFilters): Promise<EvidencePackage[]>;
  createEvidencePackage(ctx: TenantContext, input: CreateEvidencePackageInput): Promise<EvidencePackage>;
  addEvidence(ctx: TenantContext, packageId: string, evidence: AddFindingEvidenceInput): Promise<EvidenceItem>;
  verifyEvidence(ctx: TenantContext, evidenceId: string, status: EvidenceVerificationStatus): Promise<void>;

  // ── Remediation ─────────────────────────────────────────────
  getRemediationPlans(ctx: TenantContext, filters?: RemediationFilters): Promise<RemediationPlan[]>;
  createRemediationPlan(ctx: TenantContext, input: CreateRemediationPlanInput): Promise<RemediationPlan>;
  getRemediationVelocity(ctx: TenantContext): Promise<RemediationVelocitySummary>;

  // ── Readiness & Risk ────────────────────────────────────────
  getReadinessSummary(ctx: TenantContext): Promise<AuditReadinessSummary>;
  identifyReadinessGaps(ctx: TenantContext): Promise<ReadinessGap[]>;
  getRiskSummary(ctx: TenantContext): Promise<AuditRiskSummary>;
  getRiskByCategory(ctx: TenantContext): Promise<Record<string, number>>;
  getHighRiskAreas(ctx: TenantContext): Promise<HighRiskArea[]>;

  // ── Continuous Audit ────────────────────────────────────────
  runContinuousAudit(ctx: TenantContext): Promise<ContinuousAuditResult>;

  // ── Executive Reporting ─────────────────────────────────────
  getDashboard(ctx: TenantContext): Promise<AuditDashboardData>;
  getExecutiveSummary(ctx: TenantContext): Promise<AuditExecutiveSummary>;
  getReports(ctx: TenantContext, filters?: ReportFilters): Promise<{ reports: AuditReport[]; total: number }>;
  createReport(ctx: TenantContext, input: CreateAuditReportInput): Promise<AuditReport>;
}
```

---

## Internal API

```typescript
interface AuditInternalApi {
  // Called by every module to record audit events
  recordAudit(params: RecordAuditParams): Promise<void>;

  // Called by IAM module for identity audit events
  recordIAMAudit(event: IAMAuditEvent): Promise<void>;

  // Called by security module for security audit events
  recordSecurityAudit(event: SecurityAuditEvent): Promise<void>;

  // Called by workflow for approval audit
  recordApprovalAudit(instanceId: string, stepId: string, action: string, details: Record<string, unknown>): Promise<void>;

  // Called by finance modules for financial integrity audit
  recordFinancialAudit(action: string, resourceType: string, resourceId: string, amount: string, currency: string): Promise<void>;

  // Audit log for search indexing
  getAuditLogsForIndexing(companyId: string, since: Date): Promise<AuditLog[]>;

  // Tamper detection
  verifyIntegrity(companyId: string, from: Date, to: Date): Promise<IntegrityReport>;
}
```

---

## Events

```typescript
interface AuditPlatformEvents {
  "audit.record.created": {
    companyId: string; action: string; resourceType: string;
    resourceId?: string; severity: string; actorUserId?: string;
  };
  "audit.finding.created": {
    companyId: string; findingId: string; findingType: string;
    severity: string; controlId?: string;
  };
  "audit.finding.escalated": {
    companyId: string; findingId: string; fromSeverity: string;
    toSeverity: string;
  };
  "audit.control.tested": {
    companyId: string; controlId: string; result: string;
    testType: string;
  };
  "audit.control.failed": {
    companyId: string; controlId: string; failureCount: number;
    severity: string;
  };
  "audit.evidence.added": {
    companyId: string; packageId: string; evidenceType: string;
  };
  "audit.remediation.overdue": {
    companyId: string; planId: string; findingId: string;
    daysOverdue: number;
  };
  "audit.readiness.assessed": {
    companyId: string; score: string; assessmentType: string;
    gapCount: number;
  };
  "audit.continuous.run.completed": {
    companyId: string; overallScore: string; controlFailures: number;
    missingApprovals: number; highRiskEvents: number;
  };
  "audit.report.generated": {
    companyId: string; reportId: string; reportType: string;
  };
}
```

---

## Commands

| Command | Description | Auth | Audit |
|---|---|---|---|
| `RecordAuditEntry` | Append audit log entry | System (no auth) | Self-referential |
| `CreateControl` | Define a new control | `audit.controls.create` | Yes |
| `UpdateControl` | Modify control | `audit.controls.update` | Yes |
| `CreateFinding` | Record an audit finding | `audit.findings.create` | Yes |
| `UpdateFinding` | Modify finding status/severity | `audit.findings.update` | Yes |
| `CreateEvidencePackage` | Create evidence package | `audit.evidence.create` | Yes |
| `AddEvidenceItem` | Add evidence to package | `audit.evidence.create` | Yes |
| `CreateRemediationPlan` | Plan remediation action | `audit.remediation.create` | Yes |
| `CreateAuditReport` | Generate audit report | `audit.reports.create` | Yes |
| `RunContinuousAudit` | Trigger continuous scan | `audit.admin` | Yes |

---

## Queries

| Query | Description | Auth |
|---|---|---|
| `ListAuditLogs` | Paginated audit log with search | `audit.logs.read` |
| `GetDashboard` | Aggregate dashboard data | `audit.read` |
| `GetExecutiveSummary` | Board-level summary | `audit.read` |
| `GetControlEffectiveness` | Control scoring | `audit.read` |
| `GetFindingsBySeverity` | Findings distribution | `audit.read` |
| `GetRemediationVelocity` | Remediation speed | `audit.read` |
| `GetReadinessSummary` | Audit readiness score | `audit.read` |
| `GetRiskSummary` | Risk assessment | `audit.read` |
| `GetContinuousAuditResults` | Latest scan results | `audit.read` |
| `VerifyAuditIntegrity` | Tamper detection check | `audit.admin` |

---

## Errors

| Error Code | Description | HTTP Status | Retryable |
|---|---|---|---|
| `AUDIT_LOG_WRITE_FAILED` | Failed to append audit entry | 500 | Yes |
| `AUDIT_CONTROL_NOT_FOUND` | Control does not exist | 404 | No |
| `AUDIT_FINDING_NOT_FOUND` | Finding does not exist | 404 | No |
| `AUDIT_EVIDENCE_NOT_FOUND` | Evidence item/package not found | 404 | No |
| `AUDIT_PACKAGE_FULL` | Evidence package limit reached | 400 | No |
| `AUDIT_INTEGRITY_VIOLATION` | Audit trail tamper detected | 500 | No |
| `AUDIT_DUPLICATE_ENTRY` | Duplicate audit event (idempotent) | 409 | No |

---

## Security Model

- **Append-Only Audit Trail** (Constitution Law 6): Audit log entries are never updated or deleted. `ProcurementAPAuditRecord` enforces no-update/no-delete at the Prisma level.
- **Tamper Evidence**: Every audit entry includes `payloadHash` for integrity verification. Sequential ID ordering provides chain-of-custody.
- **Tenant Isolation**: All queries scoped to `companyId`. No cross-tenant audit data access.
- **Privileged Operations**: `RecordAuditEntry` is called system-wide by the platform itself. External APIs cannot forge audit entries.
- **Regulatory Compliance**: SOC 2, ISO 27001, PCI DSS, GDPR audit requirements mapped to platform capabilities.
- **Separation of Duties**: Finding creation and remediation assignment require different roles.

---

## Permission Model

| Permission | Scope | Description |
|---|---|---|
| `audit.logs.read` | Company | View audit log entries |
| `audit.read` | Company | View dashboard, summaries, reports |
| `audit.controls.create` | Company | Define new controls |
| `audit.controls.update` | Company | Modify controls |
| `audit.controls.test` | Company | Execute control tests |
| `audit.findings.create` | Company | Record findings |
| `audit.findings.update` | Company | Update finding status |
| `audit.evidence.create` | Company | Create evidence packages |
| `audit.evidence.verify` | Company | Verify evidence items |
| `audit.remediation.create` | Company | Create remediation plans |
| `audit.reports.create` | Company | Generate reports |
| `audit.admin` | Platform | Continuous audit, integrity checks |

---

## Observability

### Metrics

| Metric | Type | Labels | Description |
|---|---|---|---|
| `audit.records.total` | Counter | `action`, `severity`, `resource_type` | Total audit entries |
| `audit.records.rate` | Gauge | — | Entries per minute |
| `audit.controls.total` | Gauge | `status`, `type` | Control count |
| `audit.controls.effectiveness` | Gauge | — | Overall effectiveness rate |
| `audit.findings.total` | Gauge | `severity`, `status` | Finding count by severity/status |
| `audit.findings.created` | Counter | `severity` | New findings created |
| `audit.findings.open` | Gauge | — | Total open findings |
| `audit.findings.critical` | Gauge | — | Critical open findings |
| `audit.remediation.velocity` | Gauge | — | Average days to remediate |
| `audit.remediation.overdue` | Gauge | — | Overdue remediations |
| `audit.readiness.score` | Gauge | `assessment_type` | Readiness score |
| `audit.continuous.score` | Gauge | — | Continuous audit score |
| `audit.evidence.packages` | Gauge | `status` | Evidence package count |
| `audit.reports.generated` | Counter | `report_type` | Reports generated |
| `audit.integrity.violations` | Counter | — | Tamper detection violations |

### Tracing

Audit operations emit spans: `audit.record`, `audit.control.test`, `audit.finding.create`, `audit.continuous.run`, `audit.integrity.verify`. Span attributes: `audit.action`, `audit.resource_type`, `audit.severity`, `company_id`.

### Logging

- All `recordAudit()` calls produce structured Pino log entries at `info` level.
- Critical findings logged at `error` level with full context.
- Continuous audit results logged with scan summary.
- No audit data is ever logged at `debug` level (audit data is sensitive).

---

## Rate Limiting

| Operation | Limit | Window | Scope |
|---|---|---|---|
| RecordAuditEntry | 10,000/hr | Sliding | Per company |
| Continuous Audit | 1/hr | Fixed | Per company |
| Report Generation | 10/hr | Sliding | Per company |
| Evidence Upload | 100/hr | Sliding | Per company |

---

## Retry Policy

| Operation | Max Retries | Retryable Errors |
|---|---|---|
| RecordAuditEntry | 3 | DB transient errors |
| Continuous Audit scan | 2 | Timeout, partial failure |
| Report generation | 2 | Generation timeout |

---

## Circuit Breakers

| Circuit | Threshold | Recovery | Fallback |
|---|---|---|---|
| Audit DB writes | 5 failures / 60s | 30s | Log-only mode (non-critical) |
| Continuous audit engine | 3 failures / 300s | 120s | Skip scan, alert ops |

---

## Caching

| Cache | TTL | Scope | Invalidation |
|---|---|---|---|
| Dashboard data | 60s | Per company | On new finding/control |
| Control effectiveness | 5min | Per company | On control test |
| Readiness summary | 5min | Per company | On readiness assessment |
| Risk summary | 5min | Per company | On risk assessment |

---

## Versioning

| Aspect | Strategy |
|---|---|
| API versioning | URL path prefix |
| Audit schema | Never backward-incompatible; additive only |
| Finding severity escalation | Creates new entry, never updates old |
| Report versions | Draft → Review → Final → Distributed → Archived |

---

## Lifecycle

### Audit Finding Lifecycle
```
Open → In Remediation → Resolved
Open → Accepted
Open → Overridden
```

### Evidence Package Lifecycle
```
Draft → Assembling → Review → Approved → Submitted → Archived
```

### Remediation Plan Lifecycle
```
Not Started → In Progress → On Track → Completed → Verified
                   ↓
             Behind Schedule
```

---

## Extension Model

- **Custom Control Types**: Register new control categories via `ControlTypeRegistry`.
- **Custom Finding Types**: Extend `FindingType` union for domain-specific findings.
- **Custom Report Templates**: Register report generation templates via `AuditReportRegistry`.
- **Continuous Audit Scanners**: Register custom scanner functions to extend the continuous audit engine.
- **Integration Hooks**: Post-finding and post-remediation hooks for external notification systems.

---

## Testing Strategy

| Test Type | Scope | Coverage Target |
|---|---|---|
| Unit tests | Audit trail recording, finding lifecycle, control effectiveness calc | 90% |
| Integration tests | Full audit lifecycle (record → finding → remediation → verify) | 85% |
| Contract tests | `AuditContract` API compliance | 100% |
| Integrity tests | Tamper detection, append-only enforcement | 100% |
| Performance tests | High-volume audit recording (10K entries/min) | Baseline |
| Compliance tests | SOC 2, ISO 27001 requirement coverage | 90% |

---

## Failure Modes

| Failure | Impact | Mitigation |
|---|---|---|
| Audit write failure | Missing audit entry | Retry + alert; no mutation proceeds without audit |
| Continuous audit timeout | Stale scan results | Previous results retained; alert ops |
| Evidence package corruption | Compliance risk | Checksum verification, backup |
| Integrity violation detected | Audit trail compromised | Immediate alert, lock-down, incident response |
| DB full | Audit trail stops | Archive old entries, alert ops |
| Finding misclassification | Reporting inaccuracy | Manual override queue |

---

## Recovery Strategy

| Scenario | Recovery |
|---|---|
| Missing audit entry | Reconstruct from related events (workflow events, DB changes) |
| Integrity violation | Incident response: isolate affected period, investigate, report |
| Audit DB corruption | Restore from encrypted backup; replay from event log |
| Continuous audit failure | Manual audit trigger; previous results retained |
| Report data inconsistency | Re-generate from audit log; verify against Prisma data |

---

## Key Source Files

| File | Purpose |
|---|---|
| `src/modules/audit/audit.service.ts` | Core `recordAudit()` and `listAuditLogsForTenant()` |
| `src/modules/audit/index.ts` | Barrel export |
| `src/modules/audit-specialist/audit-specialist.ts` | Facade — dashboard, continuous audit, executive summary |
| `src/modules/audit-specialist/control-monitoring.ts` | Control effectiveness, heatmap, SoD |
| `src/modules/audit-specialist/findings.ts` | Finding CRUD, severity/status aggregation |
| `src/modules/audit-specialist/evidence-management.ts` | Evidence packages and items |
| `src/modules/audit-specialist/remediation.ts` | Remediation plans and velocity |
| `src/modules/audit-specialist/audit-readiness.ts` | Readiness scoring and gap identification |
| `src/modules/audit-specialist/audit-risk.ts` | Risk assessment and trends |
| `src/modules/audit-specialist/continuous-audit.ts` | Automated scan engine |
| `src/modules/audit-specialist/audit-planning.ts` | Calendar and engagement management |
| `src/modules/audit-specialist/types.ts` | 724 lines of type definitions |
| `src/server/security/audit-logger.ts` | Security audit event logging |
| `src/server/iam/audit-events.ts` | IAM audit event recording |

---

*The Audit Platform provides the immutable foundation of trust for the Perionyx Enterprise Financial Operating System.*
