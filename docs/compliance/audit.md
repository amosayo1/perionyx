# Audit & Remediation

## Audit Types
internal, external, regulatory, third-party

## Audit Statuses
planned, in-progress, completed, remediated

## Remediation Priorities
critical, high, medium, low

## Remediation Statuses
open, in-progress, resolved, verified

## Services
- `AuditService` — CRUD for audits, query by status/type/framework/auditor
- `RemediationService` — CRUD for remediations, overdue detection, priority filtering

## Workflow
1. Audit identifies findings
2. Remediation items created (linked to audit or control test)
3. Owner assigned with target date
4. Resolution documented and verified
