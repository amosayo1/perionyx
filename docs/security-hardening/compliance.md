# Compliance Readiness

This document maps the Phase 11X.1 security hardening work to regulatory compliance frameworks. Detailed framework-specific docs live in `docs/compliance/`.

## SOC 2 Readiness

### Security (Common Criteria 1)

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| Logical access controls | `authenticate-request.ts` — Bearer token + session auth | ✅ |
| Two-factor authentication | NextAuth MFA integration (planned) | 🔄 Planned |
| Encryption at rest | `encryption.ts` — AES-256-GCM, key versioning | ✅ |
| Encryption in transit | HTTPS enforced via proxy.ts + HSTS headers | ✅ |
| Intrusion detection | DependencyScanner + rate limiting | ✅ |
| Security incident response | `SecurityAuditLogger` for incident recording | ✅ |

### Availability (Common Criteria 2)

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| Redundant infrastructure | Docker + k8s deployment (`deploy.yml`, PDB) | ✅ |
| Disaster recovery plan | `recovery-validator.ts` — drills, `RecoveryMetrics` | ✅ |
| Backup and restore | `backup-manager.ts` + `restore-manager.ts` | ✅ |
| Monitoring and alerting | Recovery metrics, health endpoints | ✅ |

### Processing Integrity (Common Criteria 3)

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| Input validation | `input-validator.ts` — sanitization, format validation | ✅ |
| Error handling | `handleRouteError()` in `handle-route.ts` | ✅ |
| Data verification | Migration checksums, backup SHA-256 integrity | ✅ |

### Confidentiality (Common Criteria 4)

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| Access restrictions | Tenant isolation via `requireTenantContext()` | ✅ |
| Encryption controls | AES-256-GCM with key rotation | ✅ |
| Data retention policies | `AuditEventStore.applyRetention()`, backup retention | ✅ |

Detailed: `docs/compliance/soc2-readiness.md`

## ISO 27001 Readiness

### Annex A — Relevant Controls

| Control | Implementation | Status |
|---------|---------------|--------|
| A.9 Access Control | API key scopes, session auth, tenant isolation | ✅ |
| A.10 Cryptography | AES-256-GCM, key rotation, KMS interface | ✅ |
| A.12 Operations Security | Migration checksums, backup procedures, audit logging | ✅ |
| A.12.4 Logging & Monitoring | `AuditEventStore` with hash chaining | ✅ |
| A.12.6 Technical Vulnerability Mgmt | `DependencyScanner` for known vulns | ✅ |
| A.17 Business Continuity | `RecoveryValidator.runDrill()`, backup/restore pipeline | ✅ |
| A.18 Compliance | Report generation in `docs/compliance/` | ✅ |

Detailed: `docs/compliance/iso27001-readiness.md`

## PCI DSS Considerations

Perionyx does not directly process, store, or transmit credit card data. However, for integrations with payment processors:

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| 3.4 Encrypt cardholder data at rest | `encryption.ts` — AES-256-GCM | ✅ |
| 4.1 Encrypt cardholder data in transit | TLS via proxy.ts, HSTS headers | ✅ |
| 3.2 Do not store sensitive auth data | InputValidator strips sensitive patterns | ✅ |
| 10.2 Audit logging | Hash-chained `AuditEventStore` | ✅ |
| 10.5 File integrity monitoring | Migration checksums, backup verification | ✅ |
| 11.1 Regular security testing | `DependencyScanner`, penetration tests (planned) | 🔄 Planned |

Detailed: `docs/compliance/pci-dss-considerations.md`

## GDPR Compliance

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| Art. 5 Data minimization | Audit logs use IDs not PII; config backups exclude secrets | ✅ |
| Art. 15 Right of access | `exportCSV()` supports per-user/company data export | ✅ |
| Art. 17 Right to erasure | Account deletion workflow with data removal | ✅ |
| Art. 30 Records of processing | `AuditEventStore` records all security events | ✅ |
| Art. 32 Security of processing | Encryption, audit chains, tenant isolation | ✅ |
| Art. 33 Breach notification | Incident recording in audit log (72h notification procedure defined) | ✅ |
| Data retention | `applyRetention()` for audit logs; backup retention policies | ✅ |

Detailed: `docs/compliance/gdpr-readiness.md`

## What's Implemented vs Planned

### Implemented (Phase 11X.1)

- ✅ AES-256-GCM encryption with key versioning and history
- ✅ Environment secret validation with pattern enforcement
- ✅ Hash-chained append-only audit logging
- ✅ API key authentication with scope-based permissions
- ✅ CSRF protection with origin validation
- ✅ Rate limiting (Redis + in-memory fallback)
- ✅ Security headers (CSP, HSTS, COOP, CORP, etc.)
- ✅ XSS input sanitization
- ✅ Database backup and restore (pg_dump/pg_restore)
- ✅ Backup integrity verification (SHA-256 + archive validation)
- ✅ Disaster recovery drills
- ✅ Migration checksum verification
- ✅ Dependency vulnerability scanning
- ✅ Tenant context isolation

### Planned

- 🔄 KMS provider implementations (AWS KMS, GCP Cloud KMS)
- 🔄 Hardware Security Module (HSM) integration
- 🔄 FIPS 140-2 compliance mode
- 🔄 Penetration testing automation
- 🔄 SIEM integration (Splunk, Datadog, etc.)
- 🔄 Automated compliance report generation
- 🔄 Dynamic CSP nonce generation
- 🔄 Database encryption at rest (TDE / column-level encryption)
