# Account Compliance

## Overview

The Account Compliance Panel monitors 9 categories of compliance issues across all bank accounts, providing real-time visibility into governance gaps and required actions.

## Compliance Categories

| Category | Description | Typical Severity |
|---|---|---|
| Missing Documentation | Required account documents not on file | Warning |
| Expired Mandates | Signatory mandates beyond expiry | Critical |
| Expired KYC | KYC documentation beyond renewal date | Critical |
| Unauthorized Signatory | Signatory without proper authorization | Emergency |
| Policy Violation | Account operating outside treasury policy | Warning |
| Dormant Risk | Account dormant beyond acceptable period | Warning |
| Country Risk | Account in high-risk jurisdiction | Critical |
| Sanctions Review | Counterparty/entity matched screening list | Emergency |
| Ownership Issue | Entity ownership structure outdated | Warning |

## Severity Levels

| Level | Response SLA | Action Required |
|---|---|---|
| Info | 30 days | Monitor |
| Warning | 14 days | Review and plan remediation |
| Critical | 7 days | Immediate remediation required |
| Emergency | 24 hours | Immediate action, escalate to GCCO |

## Remediation Workflow

1. **Issue detected** — Compliance monitoring identifies gap
2. **Alert generated** — Issue recorded with severity, entity, account
3. **Assigned** — Compliance officer assigned
4. **Investigation** — Root cause determined
5. **Remediation** — Corrective action taken
6. **Verification** — Fix verified and documented
7. **Closure** — Issue resolved, record archived

## Compliance Score

The overall compliance score is calculated as:
```
compliance_score = (resolved_issues / total_issues) × 100
```

Scores are tracked over time via the compliance score trend chart.

## Policy Enforcement

The compliance system enforces:
- Mandatory KYC renewal before expiry
- Mandate review within 30 days of expiry
- Signatory authorization verification
- Dormancy thresholds per account type
- Country risk limits per treasury policy
- Sanctions screening for all counterparties
