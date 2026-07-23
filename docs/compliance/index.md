# Compliance Overview

## Frameworks

| Framework | Status | Priority |
|---|---|---|
| SOC 2 Type II | Planned | High |
| ISO 27001 | Planned | High |
| PCI DSS | N/A (tokenization-only) | Medium |
| GDPR | In Progress | High |

## Documentation

- `soc2-readiness.md` — SOC 2 trust service criteria checklist
- `iso27001-readiness.md` — ISO 27001 Annex A control mapping
- `pci-dss-considerations.md` — PCI DSS requirements when integrating payments
- `gdpr-readiness.md` — GDPR compliance and data subject rights

## Audit Logging

All security-relevant events are logged via `SecurityAuditLogger`:
- Authentication events (login, logout, MFA)
- Authorization changes (role assignment, permission grants)
- Data access (read, write, delete of sensitive data)
- Configuration changes (system settings, feature flags)
- Security events (rate limiting, CSRF failures, invalid tokens)

## Retention Policies

| Log Type | Retention | Format |
|---|---|---|
| Application logs | 30 days | JSON structured |
| Audit logs | 3 years | Append-only |
| Error logs | 90 days | JSON structured |
| Access logs | 1 year | Structured |

## Operational Governance

- Change management requires approval chain
- Deployment requires CI/CD pipeline passing
- Access reviews conducted quarterly
- Incident response drills run monthly
- Security training completed annually
