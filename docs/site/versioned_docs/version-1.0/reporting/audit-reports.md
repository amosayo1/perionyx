---
id: audit-reports
title: Audit Reports
sidebar_label: Audit Reports
---

# Audit Reports

Audit reports provide the traceability, compliance, and tamper-evident documentation required by auditors, controllers, and regulators.

## Report Generation Pipeline

Audit reports follow the same pipeline as all Reporting Platform outputs:

1. **Data retrieval** — Queries ledger entries, approval chains, user actions, and system events
2. **Computation** — Applies audit-specific analysis (chronological integrity, approval completeness)
3. **Formatting** — Structures data for audit review with tamper-evident design
4. **Presentation** — Renders via analytics components or exports

## Audit Report Types

| Report | Source Data | Purpose |
|---|---|---|
| Transaction audit trail | Ledger entries + user actions | Chronological record of all financial transactions |
| Approval audit trail | Approval chain data | Verification of authorization and approval workflows |
| System change log | Audit log entries | Record of configuration and system changes |
| Compliance report | Policy compliance data | Evidence of adherence to internal policies |
| Access audit | Session and permission data | Record of who accessed what and when |

## Tamper-Evident Design

Audit reports are designed to maintain integrity:

- **Chronological ordering** — Events are presented in strict temporal sequence
- **Immutability markers** — Clearly indicate that records cannot be modified after creation
- **Source attribution** — Every data point traces to its originating system or user
- **Hash verification** — Critical records include integrity checksums

## Accessibility

Audit reports follow accessibility standards for auditor review:

- **Screen reader support** — All data is accessible via assistive technology
- **Export formats** — CSV and Excel exports for offline analysis
- **Structured data** — Machine-readable formats for automated compliance checking

## Interaction with Other Domains

| Domain | Interaction |
|---|---|
| Ledger | Primary source for transaction audit trails |
| Workflow Engine | Approval chain data for authorization audits |
| Identity | User actions and session data for access audits |
| Governance | Policy compliance data for regulatory reports |
| Security | Security event data for compliance audits |
