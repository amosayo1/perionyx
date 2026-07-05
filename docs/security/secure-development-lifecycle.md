# Secure Software Development Lifecycle

**Version:** 1.0.0
**Status:** Ratified
**Scope:** All engineering work on the Perionyx platform

> Perionyx is an Enterprise Financial Operating System. Security is not a phase or a gate — it is embedded in every stage of development. This document defines the mandatory Secure Software Development Lifecycle (SSDLC) that governs all code changes, from threat modeling through incident response.

---

## 1. Threat Modeling

### 1.1 Mandate

Every new feature module, API endpoint group, external integration, or data flow that handles financial data must have a threat model documented before implementation begins.

### 1.2 Methodology

Perionyx uses STRIDE per element for threat modeling:

| Threat | Property Violated | Financial Example |
|--------|------------------|-------------------|
| **S**poofing | Authentication | Attacker impersonates a treasury admin |
| **T**ampering | Integrity | Attacker modifies a ledger entry amount |
| **R**epudiation | Non-repudiation | User denies authorizing a transfer |
| **I**nformation Disclosure | Confidentiality | Cross-tenant wallet balance leak |
| **D**enial of Service | Availability | Connection pool exhaustion via concurrent transfers |
| **E**levation of Privilege | Authorization | Regular user escalates to approve their own transfer |

### 1.3 When Threat Modeling Is Required

- New external API integration (Plaid, QBO, Stripe, etc.)
- New financial write operation
- Changes to authentication or authorization
- New tenant data flow
- New AI capability with financial data access
- Any feature flagged as high-risk by architecture review

### 1.4 Artifact

Each threat model must be documented as an ADR in `docs/adr/` containing:

```
## Threat Model: [Feature Name]

### Data Flow Diagram
[Description of data flow]

### Assets
[What needs protection]

### Trust Boundaries
[Where data crosses trust levels]

### Threats (STRIDE)
| Threat | Risk | Mitigation |
|--------|------|------------|
| ...    | H/M/L | ...       |

### Residual Risk
[What risk remains after mitigation]
```

---

## 2. Secure Design

### 2.1 Design Principles

| Principle | Application in Perionyx |
|-----------|------------------------|
| **Least Privilege** | Every API endpoint and service function checks authorization at the resource level. No default access. |
| **Defense in Depth** | Financial writes are protected by: authentication → authorization → row locking → version checking → audit logging. At least two layers must fail before data is compromised. |
| **Fail Closed** | When the system cannot determine the correct outcome, it rejects the operation. Deny by default, allow by exception. |
| **Secure by Default** | New features are secure in their default configuration. Encryption is on. Audit is on. Isolation is on. |
| **Least Common Mechanism** | Each tenant gets isolated data paths. Shared mechanisms (connection pool, cache) are designed to prevent cross-tenant leakage. |

### 2.2 Design Review Gates

Before implementation begins, every feature must pass:

- [ ] Threat model documented (if applicable)
- [ ] Data flow diagram reviewed for security boundaries
- [ ] Authentication requirements defined
- [ ] Authorization model defined (roles + permissions)
- [ ] Tenant isolation strategy confirmed
- [ ] Audit requirements defined
- [ ] Encryption requirements defined (at rest + in transit)
- [ ] Secrets management strategy defined

---

## 3. Authentication

### 3.1 Principles

- **Every request authenticates**: No unauthenticated access to financial data. Public endpoints return only non-sensitive, non-financial information.
- **Session-based auth**: Clerk handles session management. Sessions are short-lived (configurable, default 1 hour) and refreshable.
- **No hardcoded credentials**: API keys, service account tokens, and integration secrets are managed through environment variables or a secrets management service.
- **Multi-factor authentication**: Required for all financial admin operations (configurable per tenant).

### 3.2 Authentication Flow

```
Request → Clerk Middleware → Session Valid → Extract userId + sessionId
                              ↓
                           Session Invalid → 401 Unauthorized
```

### 3.3 API Authentication

| Endpoint Type | Auth Method | Notes |
|---------------|-------------|-------|
| User-facing API | Clerk session cookie | Browser-based requests |
| Server-to-server | API key (Bearer token) | Webhook callbacks, connector syncs |
| Public | None | Health checks, landing page only |

---

## 4. Authorization

### 4.1 Principles

- **Authentication verifies identity. Authorization verifies permission.** They are always separate checks.
- **Authorization at every layer**: API route → Service method → Resource access. Each layer re-verifies.
- **No implicit trust**: Internal service calls do not bypass authorization. A service called by another service must still verify the caller's authority.

### 4.2 Authorization Model

```
┌──────────────────────────────────────────────────────┐
│                    RBAC MODEL                         │
│                                                      │
│  User ───→ Role(s) ───→ Permission(s) ───→ Resource │
│                                                      │
│  Examples:                                           │
│  ├─ User: alice@corp.com                             │
│  ├─ Role: TreasuryAdmin                              │
│  ├─ Permission: treasury:transfer:execute            │
│  └─ Resource: TreasuryAccount (company-scoped)       │
└──────────────────────────────────────────────────────┘
```

### 4.3 Permission Checks

All permission checks follow this pattern:

```typescript
export async function requirePermission(
  companyId: string,
  userId: string,
  permission: string,
): Promise<void> {
  const hasPermission = await checkPermission(companyId, userId, permission);
  if (!hasPermission) {
    throw new ForbiddenError(`Missing permission: ${permission}`);
  }
}
```

Permission checks are performed:
1. At the API route level (endpoint authorization)
2. At the service method level (operation authorization)
3. At the resource level (data authorization — does the user own this resource?)

---

## 5. Role-Based Access Control (RBAC)

### 5.1 Role Hierarchy

| Role | Scope | Capabilities |
|------|-------|-------------|
| **SuperAdmin** | Global | All operations, tenant management, system configuration |
| **Admin** | Tenant | All operations within tenant |
| **TreasuryAdmin** | Tenant | Financial operations: transfers, deposits, syncs, reconciliation |
| **Approver** | Tenant | Approve pending transactions, review alerts |
| **Viewer** | Tenant | Read all data within tenant, no writes |
| **Auditor** | Tenant | Read audit logs, no writes |
| **Analyst** | Tenant | Read financial data, generate reports, no writes |
| **Connector** | Tenant | API key-based: sync data from external integrations only |

### 5.2 Permission Definitions

Permissions follow the format `domain:action:resource`:

```
treasury:transfer:execute
treasury:deposit:execute
ledger:entry:read
approval:transaction:approve
audit:log:read
admin:users:manage
```

### 5.3 Enforcement

- RBAC is enforced at the **service layer**, not the database layer. The database layer enforces RLS as defense in depth.
- Every service method that performs a financial operation calls `requirePermission()` before any work begins.
- Role assignments are stored in the database and cached with short TTL.

---

## 6. Secrets Management

### 6.1 Principles

- **Never in source code**: Secrets must never appear in source files, configuration files committed to git, or Docker images.
- **Never in logs**: Secrets must be redacted from all log output. Logging a secret is a security incident.
- **Never in error messages**: Error responses must not contain secrets, API keys, or connection strings.
- **Environment variables for local dev**: `.env` files are in `.gitignore`. Production secrets use a secrets manager.

### 6.2 Secret Types

| Secret Type | Storage | Rotation |
|-------------|---------|----------|
| Database URL | Environment variable | On credential compromise, quarterly minimum |
| Clerk secret key | Environment variable | On compromise, or per Clerk policy |
| Plaid client ID + secret | Environment variable | On compromise, quarterly minimum |
| QBO client ID + secret | Environment variable | On compromise, quarterly minimum |
| Encryption keys | Environment variable / KMS | Annual minimum |
| API keys (internal) | Database (hashed) | On compromise, per-tenant basis |
| JWT signing secret | Environment variable | On compromise, quarterly minimum |

### 6.3 Prohibited Patterns

```typescript
// ❌ FORBIDDEN: Secret in source code
const API_KEY = 'sk_live_abc123';

// ❌ FORBIDDEN: Secret in log
console.log(`Connecting with key: ${process.env.API_KEY}`);

// ❌ FORBIDDEN: Secret in error message
throw new Error(`Failed to connect: invalid key ${key}`);

// ✅ CORRECT: Secret from environment
const API_KEY = process.env.PLAID_SECRET;
```

---

## 7. Key Rotation

### 7.1 Rotation Schedule

| Secret | Rotation Period | Grace Period | Automation |
|--------|----------------|--------------|------------|
| Database credentials | 90 days | 24 hours | Manual with staged rollout |
| API keys (external) | Per vendor policy | 7 days | Manual |
| Internal API keys | 90 days | 7 days | Supported by key rotation endpoint |
| Encryption keys | 365 days | 30 days (re-encrypt) | Manual with re-encryption script |
| JWT signing secret | 90 days | 0 (previous key valid until expiry) | Manual |

### 7.2 Rotation Procedure

1. Generate new secret in secrets manager or environment
2. Deploy new secret alongside old secret (dual-key period)
3. Verify new secret works in staging
4. Promote to production (staged rollout)
5. Revoke old secret after grace period
6. Verify all systems using new secret

### 7.3 Emergency Rotation

On compromise: immediate rotation with no grace period.
1. Revoke compromised secret immediately
2. Generate new secret
3. Deploy emergency patch
4. Notify affected tenants
5. Post-incident review

---

## 8. Dependency Scanning

### 8.1 Automated Scanning

| Scan Type | Tool | Frequency | Action on Finding |
|-----------|------|-----------|-------------------|
| SCA (Software Composition Analysis) | pnpm audit / npm audit | Every install, CI | Critical/high: block merge. Medium: flag for review. |
| Known vulnerability database | pnpm audit | Weekly scheduled | Patch or mitigate within SLA |
| Supply chain integrity | Lockfile verification (pnpm lockfile) | Every install | Reject if lockfile mismatch |

### 8.2 Vulnerability SLA

| Severity | Patch Window | Mitigation |
|----------|-------------|------------|
| Critical | 24 hours | Emergency patch or temporary mitigation (WAF rule, feature flag off) |
| High | 7 days | Scheduled patch in next release |
| Medium | 30 days | Added to backlog, tracked |
| Low | 90 days | Reviewed at quarterly cadence |

### 8.3 Prohibited Dependencies

- Deprecated or unmaintained packages
- Packages with known critical vulnerabilities without a patch
- Packages with a history of supply chain attacks
- Telemetry-only packages without business justification

---

## 9. Container Security

### 9.1 Image Principles

- **Minimal base images**: Use `node:22-alpine` or distroless images. No build tooling in production images.
- **No root**: Containers run as non-root user. No `USER root` in production Dockerfiles.
- **Read-only filesystem**: Production containers use read-only root filesystem where possible.
- **Single process**: Each container runs a single process (Next.js server, background worker, etc.).
- **Immutable tags**: Production images use SHA256 digest references, not mutable tags like `latest`.

### 9.2 Image Scanning

| Scan | Tool | Frequency |
|------|------|-----------|
| Base image vulnerability scan | Docker Scout / Trivy | Every build |
| Dependency scan (in-container) | Trivy | Every build |
| Secrets scan (in-image) | Trivy | Every build |

### 9.3 Dockerfile Standards

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Stage 2: Production
FROM node:22-alpine AS runner
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
WORKDIR /app
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 10. Database Security

### 10.1 Network Security

- PostgreSQL listens on private network only (never public internet).
- Connections use TLS 1.3 minimum.
- IP allowlisting for application server IPs only.
- No direct database access from developer workstations (use Prisma Studio via bastion or port-forwarding).

### 10.2 Authentication

- Database users use strong passwords or certificate-based auth.
- Application uses a dedicated database user with least privilege:
  - Full schema access for migrations (migration user)
  - DML only for application (application user)
  - Read-only for reporting (readonly user)

### 10.3 Row-Level Security

RLS is enabled on all tenant-scoped tables as defense-in-depth:

```sql
ALTER TABLE "Wallet" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "Wallet"
  USING ("companyId" = current_setting('app.current_tenant_id')::text);
```

RLS policies are configured for all tables with a `companyId` column. The application sets `app.current_tenant_id` at the start of each request.

### 10.4 Encryption at Rest

- PostgreSQL Transparent Data Encryption (TDE) or filesystem-level encryption (LUKS).
- Database backups are encrypted.
- Encryption keys are managed separately from database credentials.

### 10.5 Audit Logging

- `pgaudit` extension logs all DDL and DML on financial tables.
- Database audit logs are retained for a minimum of 1 year.

---

## 11. API Security

### 11.1 OWASP API Security Top 10

| # | Risk | Perionyx Mitigation |
|---|------|---------------------|
| API1 | Broken Object Level Authorization | Resource-level authorization checks (ownership verification) |
| API2 | Broken Authentication | Clerk session management, API key validation |
| API3 | Broken Object Property Level | Input validation against schema, no mass assignment |
| API4 | Unrestricted Resource Consumption | Rate limiting on all endpoints, pagination enforced |
| API5 | Broken Function Level Authorization | RBAC at service layer, not just route layer |
| API6 | Unrestricted Access to Sensitive Business Flows | Approval workflows for high-risk operations |
| API7 | Server Side Request Forgery | No user-controlled URLs in server-side requests |
| API8 | Security Misconfiguration | Automated security scanning in CI |
| API9 | Improper Inventory Management | API versioning, deprecation notices |
| API10 | Unsafe Consumption of APIs | Response validation, schema enforcement |

### 11.2 API Security Standards

- **Rate limiting**: 100 requests/minute per API key, 1000 requests/minute per authenticated session.
- **Request validation**: All inputs validated against Zod/JSON Schema before reaching business logic.
- **Response headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security: max-age=31536000`.
- **CORS**: Restricted to known origins. No wildcard CORS for authenticated endpoints.
- **Content-Type enforcement**: `Content-Type: application/json` required for POST/PUT/PATCH.

---

## 12. OWASP Top 10

| # | Risk | Perionyx Mitigation |
|---|------|---------------------|
| A01 | Broken Access Control | RBAC + resource-level authorization + RLS |
| A02 | Cryptographic Failures | TLS 1.3, encryption at rest, no custom crypto |
| A03 | Injection | Parameterized queries (Prisma), no raw SQL in app code |
| A04 | Insecure Design | Threat modeling, secure design review, defense in depth |
| A05 | Security Misconfiguration | Automated scanning, hardened Docker images |
| A06 | Vulnerable Components | Dependency scanning, vulnerability SLA |
| A07 | Authentication Failures | Clerk, MFA for admin ops, session management |
| A08 | Software and Data Integrity Failures | Lockfile verification, signed commits, CI pipeline security |
| A09 | Security Logging and Monitoring | Structured logging, audit trail, monitoring dashboards |
| A10 | Server-Side Request Forgery | No user-controlled URLs, allowlisted outbound destinations |

---

## 13. Penetration Testing

### 13.1 Cadence

| Test Type | Frequency | Scope |
|-----------|-----------|-------|
| Automated DAST | Every release | API endpoints, authentication, authorization |
| Internal pen test | Quarterly | Full application scope |
| External pen test | Annually | Full application + infrastructure scope |

### 13.2 Remediation SLA

| Finding Severity | Remediation Window |
|------------------|-------------------|
| Critical | 24 hours |
| High | 7 days |
| Medium | 30 days |
| Low | 90 days |

### 13.3 Scope

Penetration tests cover:
- All API endpoints
- Authentication and session management
- Authorization and privilege escalation
- Tenant isolation
- Financial integrity bypass
- Injection vulnerabilities
- Business logic flaws in financial operations

---

## 14. Release Reviews

### 14.1 Security Review Gate

Every release must pass a security review before deployment:

- [ ] All dependency vulnerabilities are patched or mitigated within SLA
- [ ] No secrets exposed in code or configuration
- [ ] Authentication and authorization are verified for all new endpoints
- [ ] Tenant isolation is verified (negative tests pass)
- [ ] Audit logging is verified for all new financial operations
- [ ] Rate limiting is configured for all new endpoints
- [ ] Input validation is implemented for all new endpoints
- [ ] CORS is correctly configured
- [ ] Container images have no critical vulnerabilities

### 14.2 Release Sign-Off

| Role | Sign-Off Required For |
|------|----------------------|
| Engineering Lead | All releases |
| Security Lead | Releases with security-relevant changes |
| Compliance Lead | Releases with regulatory impact |

---

## 15. Incident Response

### 15.1 Incident Classification

| Severity | Definition | Response Time |
|----------|------------|---------------|
| **SEV1** | Financial data breach, active data loss, extended service outage | 15 minutes |
| **SEV2** | Tenant isolation failure, authentication bypass, partial data exposure | 1 hour |
| **SEV3** | Non-critical security finding, scanning vulnerability | 24 hours |
| **SEV4** | Low-risk finding, documentation gap | 7 days |

### 15.2 Response Process

```
┌──────────────────────────────────────────────────────────────┐
│                  INCIDENT RESPONSE PROCESS                    │
│                                                               │
│  DETECT → TRIAGE → CONTAIN → ERADICATE → RECOVER → REVIEW    │
│                                                               │
│  DETECT:                                                     │
│  ├─ Automated alert (monitoring, WAF, IDS)                   │
│  ├─ User report                                               │
│  └─ Penetration test finding                                  │
│                                                               │
│  TRIAGE:                                                     │
│  ├─ Assess severity and impact                                │
│  ├─ Engage incident response team                             │
│  └─ Notify stakeholders                                       │
│                                                               │
│  CONTAIN:                                                    │
│  ├─ Feature flag off / disable compromised credentials        │
│  ├─ Isolate affected systems                                  │
│  └─ Block malicious traffic                                   │
│                                                               │
│  ERADICATE:                                                   │
│  ├─ Patch vulnerability                                       │
│  ├─ Rotate credentials                                        │
│  └─ Remove attacker access                                    │
│                                                               │
│  RECOVER:                                                     │
│  ├─ Restore from clean backup (if needed)                     │
│  ├─ Verify fix                                                │
│  └─ Return to normal operation                                │
│                                                               │
│  REVIEW:                                                      │
│  ├─ Root cause analysis                                       │
│  ├─ Post-mortem documentation                                 │
│  └─ Preventive measures                                       │
└──────────────────────────────────────────────────────────────┘
```

### 15.3 Communication

- SEV1: Notify on-call engineer immediately (PagerDuty/OpsGenie). Notify engineering lead within 15 minutes. Notify executive team within 1 hour.
- SEV2: Notify on-call engineer within 30 minutes. Notify engineering lead within 2 hours.
- SEV3: Notify security team during business hours.
- SEV4: Log in issue tracker, no immediate notification.

---

## 16. Disaster Recovery

### 16.1 Recovery Objectives

| Metric | Target |
|--------|--------|
| Recovery Point Objective (RPO) | 5 minutes |
| Recovery Time Objective (RTO) | 1 hour |
| Maximum Tolerable Downtime | 4 hours |

### 16.2 Recovery Scenarios

| Scenario | Strategy | RTO | RPO |
|----------|----------|-----|-----|
| Single instance failure | Load balancer routes to healthy instance | <1 minute | 0 |
| Availability zone failure | Failover to secondary AZ | 15 minutes | 5 minutes |
| Region failure | Failover to DR region | 1 hour | 5 minutes |
| Data corruption | Point-in-time recovery from WAL archive | 1 hour | 5 minutes |
| Ransomware / crypto attack | Restore from clean backup | 4 hours | 24 hours |

### 16.3 DR Plan

1. **Automated failover**: Multi-AZ PostgreSQL handles AZ failures automatically.
2. **Cross-region replica**: Streaming replica in DR region. Promoted on region failure.
3. **Application failover**: DNS update to DR region. Stateless app servers start accepting traffic.
4. **Validation**: Smoke tests verify financial integrity after failover.
5. **Fallback**: Once primary region is restored, replicate changes back and fail over.

---

## 17. Backups

### 17.1 Backup Schedule

| Data | Frequency | Retention | Type |
|------|-----------|-----------|------|
| PostgreSQL database | Continuous WAL archiving + daily full backup | 30 days daily, 12 months monthly | Physical + WAL |
| Encrypted backups | Same as source | Same as source | AES-256-GCM |
| Configuration | On change | 12 months | Git history |

### 17.2 Backup Verification

- Automated restore test: Weekly, restore backup to staging environment and verify data integrity.
- Financial integrity check: After restore, verify ledger balance invariants: `sum(LedgerEntry) = Wallet.balance`.
- Backup encryption keys: Stored separately from backups. Tested quarterly.

---

## 18. Encryption

### 18.1 Encryption in Transit

- All HTTP traffic uses TLS 1.3 minimum.
- Database connections use TLS 1.3.
- Internal service-to-service communication uses mTLS in production.
- API responses include `Strict-Transport-Security` header.

### 18.2 Encryption at Rest

- Database: PostgreSQL TDE or filesystem-level encryption (LUKS).
- Backups: AES-256-GCM encryption.
- Application-level encryption: Sensitive fields (PII, API tokens) encrypted at the application layer before storage.
- Encryption keys: Managed through KMS or environment variables, stored separately from encrypted data.

### 18.3 Key Management

| Key | Purpose | Storage | Rotation |
|-----|---------|---------|----------|
| Database encryption key | TDE / LUKS | KMS | Annual |
| Application encryption key | Field-level encryption | Environment variable / KMS | Annual |
| TLS certificate | HTTPS / mTLS | Certificate manager | 90 days (auto-renew) |

---

## 19. Audit

### 19.1 Audit Events

Every audit event must capture:

- `companyId` — tenant scope
- `userId` or `"system"` — actor
- `action` — operation type (standardized enum)
- `resourceType` — affected entity type
- `resourceId` — affected entity ID
- `metadata` — JSON payload for reconstruction
- `createdAt` — timestamp with timezone
- `ipAddress` — source IP (for user-initiated actions)
- `userAgent` — client identifier (for user-initiated actions)

### 19.2 Audit Categories

| Category | Events | Retention |
|----------|--------|-----------|
| Financial | Transfers, deposits, withdrawals, ledger entries | Indefinite |
| Authentication | Login, logout, MFA, API key usage | 3 years |
| Authorization | Permission changes, role assignments | 3 years |
| Configuration | Policy changes, rate changes, rule changes | 3 years |
| Data Access | Exports, report generation, bulk reads | 1 year |
| Administrative | User management, tenant configuration | 3 years |
| Security | Failed authentication, blocked requests, permission denied | 1 year |

### 19.3 Audit Integrity

- Audit logs are append-only. No UPDATE or DELETE on AuditLog records.
- Audit logs are immutable by convention (application layer) and may be hardened with database triggers.
- Failed operations are audited alongside successful ones (with error reason).

---

## 20. Compliance Roadmap

### 20.1 Target Frameworks

| Framework | Scope | Target Date |
|-----------|-------|-------------|
| **SOC 2 Type II** | Security, availability, confidentiality | Q4 2026 |
| **ISO 27001** | Information security management | Q2 2027 |
| **PCI DSS** | Payment card data handling (if applicable) | TBD |
| **GDPR** | EU personal data protection | Compliant by design |
| **SOX** | Financial reporting controls (if applicable) | TBD |

### 20.2 Current State

| Control | Status | Notes |
|---------|--------|-------|
| Access control | Implemented | RBAC + RLS |
| Audit logging | Implemented | Append-only, all financial actions |
| Encryption at rest | Implemented | Database + backup encryption |
| Encryption in transit | Implemented | TLS 1.3, mTLS |
| Vulnerability management | Implemented | Dependency scanning, pen testing |
| Incident response | Defined | Process documented, on-call rotation |
| Disaster recovery | Defined | RPO 5 min, RTO 1 hour |
| Vendor management | Partial | Connector platform security review pending |
| Data retention | Defined | Per audit category |
| Training | Not implemented | Planned for Q4 2026 |

---

## 21. Security Review Checklist

Every feature, PR, and release must pass this security review checklist:

### Design Phase

- [ ] Threat model completed and reviewed
- [ ] Data flow diagram reviewed for security boundaries
- [ ] Authentication requirements defined
- [ ] Authorization model defined
- [ ] Tenant isolation strategy confirmed
- [ ] Encryption requirements defined
- [ ] Secrets management strategy defined

### Implementation Phase

- [ ] All inputs validated against schema
- [ ] No raw SQL in financial logic
- [ ] No secrets in source code, logs, or error messages
- [ ] Rate limiting configured for new endpoints
- [ ] CORS correctly configured
- [ ] RBAC enforced at service layer
- [ ] Row-level security policies verified
- [ ] Audit logging implemented for all financial operations
- [ ] Idempotency implemented for all mutating operations
- [ ] version check implemented for all balance updates

### Verification Phase

- [ ] Dependency scan passes (no critical/high vulnerabilities)
- [ ] Container image scan passes (no critical vulnerabilities)
- [ ] OWASP Top 10 review completed
- [ ] Tenant isolation tests pass (positive + negative)
- [ ] Concurrency tests pass for financial operations
- [ ] Authentication bypass tests pass
- [ ] Authorization bypass tests pass
- [ ] Input validation tests pass (malformed input, boundary values)

### Release Phase

- [ ] Security review sign-off obtained
- [ ] Secrets verified absent from commit history
- [ ] Monitoring dashboards configured for new feature
- [ ] Incident response runbook updated (if applicable)
- [ ] Rollback plan documented with security considerations

---

## References

- **Constitution**: `docs/architecture/perionyx-engineering-constitution.md`
- **Transaction Strategy**: `docs/architecture/transaction-strategy.md`
- **AI Engineering Playbook**: `docs/architecture/ai-engineering-playbook.md`
- **Self-Review Framework**: `docs/architecture/self-review-framework.md`
- **Enterprise Readiness Checklist**: `docs/architecture/enterprise-readiness-checklist.md`

---

*This document is part of the Perionyx Engineering Governance Framework. Amendments require review by the security team and architecture review board.*
