# Security Platform

**Platform**: SecurityPlatform
**Contract**: `SecurityContract`
**Mission**: Enforce a zero-trust, defense-in-depth security posture across every Perionyx layer — authentication, authorization, encryption, secrets, tenant isolation, input validation, CSRF, rate limiting, audit logging, and compliance — ensuring financial data is protected against all threat vectors.
**Status**: Partially Built (14 security files, 9 IAM files, 13 identity files)
**Constitutional Authority**: PLATFORM_CONSTITUTION.md — Law 11 ("Tenant Isolation Is Absolute"), Law 12 ("Zero Trust Is the Default"), Law 13 ("Data Classification Governs Handling")

---

## Responsibilities

1. **Zero Trust** — Every request is authenticated, authorized, and logged. Trust is never assumed — it is verified at every layer.
2. **Defense in Depth** — Security controls are stacked: network, transport, application, data, and operational layers each provide independent protection.
3. **Authentication** — Verify user identity via password, MFA (TOTP, WebAuthn/passkeys), and SSO (SAML, OIDC).
4. **Authorization** — Enforce RBAC (64+ permissions), ABAC (attribute-based policies), and SoD (segregation of duties) across all operations.
5. **Encryption at Rest** — AES-256-GCM for all sensitive data. Envelope encryption with key rotation.
6. **Encryption in Transit** — TLS 1.3 for all client-server and service-to-service communication.
7. **Secrets Management** — Validate secrets at startup, rotate encryption keys, enforce no plaintext secrets in code or configuration.
8. **Tenant Isolation** — `requireTenantContext()` enforced at every data access point. Cross-tenant access is architecturally impossible.
9. **Input Validation** — Zod schemas on all API inputs. Body size limits (1MB default, 10MB hard cap).
10. **CSRF Protection** — Origin validation on all state-changing endpoints.
11. **Rate Limiting** — Token-bucket rate limiting with memory leak fix (60s cleanup, 100K max entries).
12. **Security Headers** — CSP, HSTS, X-Content-Type-Options, X-Frame-Options on all responses.
13. **Audit Logging** — Tamper-evident audit chain for every security-relevant action. Append-only `ProcurementAPAuditRecord`.
14. **Dependency Security** — `pnpm audit --json` in CI. Fail on `--audit-level=high`.
15. **Incident Response** — Structured detection, classification, containment, eradication, recovery, and post-mortem.
16. **Compliance** — SOC 2, ISO 27001, GDPR, PCI DSS readiness. Compliance controls mapped to code.
17. **Threat Modeling** — STRIDE-based threat analysis for every new feature. Pre-commit security checklist.
18. **Data Classification** — Every data element classified: Public, Internal, Confidential, Restricted, Regulated.
19. **PII Handling** — PII detection, encryption, access control, and right-to-erasure support.
20. **Disaster Recovery** — Backup, restore, snapshot, and recovery drill capabilities.
21. **Business Continuity** — Health/readiness/liveness probes, graceful shutdown, connection draining, circuit breakers.

---

## Public API (Capability Contract)

```typescript
interface SecurityContract {
  // ── Authentication ────────────────────────────────────────────
  authenticate(request: Request): Promise<AuthContext>;
  verifyMFA(userId: string, method: string, code: string): Promise<MFAVerificationResult>;
  validateSession(sessionId: string): Promise<SessionValidationResult>;

  // ── Authorization ─────────────────────────────────────────────
  checkPermission(userId: string, permission: string, companyId: string): Promise<boolean>;
  evaluateABACPolicy(subject: Subject, resource: Resource, action: string, context: Environment): Promise<PolicyDecision>;
  enforceSoD(userId: string, action: string, companyId: string): Promise<SoDCheckResult>;

  // ── Encryption ────────────────────────────────────────────────
  encrypt(plaintext: string, classification: DataClassification): Promise<EncryptedPayload>;
  decrypt(payload: EncryptedPayload): Promise<string>;
  rotateEncryptionKey(): Promise<KeyRotationResult>;

  // ── Secrets ───────────────────────────────────────────────────
  validateSecrets(): Promise<SecretsValidationResult>;
  getSecret(name: string): Promise<string>;
  rotateSecret(name: string): Promise<void>;

  // ── Input Validation ──────────────────────────────────────────
  validateBody(request: Request, schema: ZodSchema): Promise<ValidatedInput>;
  validateQuery(request: Request, schema: ZodSchema): Promise<ValidatedQuery>;

  // ── CSRF ──────────────────────────────────────────────────────
  validateOrigin(request: Request, hasToken: boolean): Promise<void>;

  // ── Rate Limiting ─────────────────────────────────────────────
  checkRateLimit(identifier: string, operation: string): Promise<RateLimitResult>;

  // ── Security Headers ──────────────────────────────────────────
  applySecurityHeaders(response: Response): Response;

  // ── Audit ─────────────────────────────────────────────────────
  recordSecurityAudit(event: SecurityAuditEvent): Promise<void>;
  getSecurityAuditLog(filters: AuditFilters): Promise<PaginatedResult<SecurityAuditRecord>>;

  // ── Compliance ────────────────────────────────────────────────
  getComplianceStatus(domain: ComplianceDomain): Promise<ComplianceStatus>;
  generateComplianceReport(domain: ComplianceDomain): Promise<ComplianceReport>;

  // ── Health ────────────────────────────────────────────────────
  getSecurityHealth(): Promise<SecurityHealth>;
}
```

---

## Internal API

### Module Architecture

| Module | Location | Purpose | Files |
|---|---|---|---|
| **Security Core** | `src/server/security/` | Encryption, rate limiting, CSRF, headers, secrets, input validation, audit logging, dependency scanning | 14 files |
| **IAM** | `src/server/iam/` | Permissions, roles, ABAC, MFA, sessions, admin, audit events | 9 files |
| **Identity** | `src/server/identity/` | Authentication, session management, provisioning, SSO, RBAC, policy engine | 13 files |
| **HTTP Layer** | `src/server/http/handle-route.ts` | Unified error handling, body parsing, cache headers | 1 file |
| **Context** | `src/server/context/tenant-context.ts` | Tenant context enforcement | 1 file |
| **Recovery** | `src/server/recovery/` | Backup, restore, snapshot, recovery validation | 6 files |
| **HA** | `src/server/ha/` | Health probes, graceful shutdown, circuit breaker | 4 files |
| **Observability** | `src/server/observability/` | Metrics, tracing, structured logging | 8 files |

### Key Services

| Service | Location | Responsibility |
|---|---|---|
| `EncryptionService` | `src/server/security/encryption.ts` | AES-256-GCM encrypt/decrypt, key rotation, KMS provider |
| `RateLimiter` | `src/server/security/rate-limiter.ts` | Token-bucket rate limiting with periodic cleanup |
| `CSRFProtection` | `src/server/security/csrf.ts` | Origin validation for state-changing requests |
| `SecurityHeaders` | `src/server/security/headers.ts` | CSP, HSTS, X-Content-Type-Options, X-Frame-Options |
| `InputValidator` | `src/server/security/input-validator.ts` | Zod schema validation for API inputs |
| `SecretsValidator` | `src/server/security/secrets.ts` | Startup environment variable validation |
| `DependencyScanner` | `src/server/security/dependency-scanner.ts` | `pnpm audit --json` integration |
| `AuditLogger` | `src/server/security/audit-logger.ts` | Tamper-evident security audit records |
| `PermissionRegistry` | `src/server/iam/permissions.ts` | 64+ granular permission definitions |
| `ABACEngine` | `src/server/iam/abac.ts` | Attribute-based access control evaluation |
| `MFAService` | `src/server/iam/mfa.ts` | TOTP enrollment, verification, recovery codes |
| `AuthenticationService` | `src/server/identity/authentication.ts` | Login, MFA, passkey, password reset |
| `SessionManager` | `src/server/identity/session-manager.ts` | Session lifecycle, revocation, device tracking |
| `PolicyEngine` | `src/server/identity/policy-engine.ts` | Security policy evaluation |
| `IdentityAuditService` | `src/server/identity/audit-service.ts` | Auth/authz audit trail |
| `BackupManager` | `src/server/recovery/backup-manager.ts` | Database backup creation and management |
| `RestoreManager` | `src/server/recovery/restore-manager.ts` | Backup restoration and validation |
| `RecoveryValidator` | `src/server/recovery/recovery-validator.ts` | Recovery drill execution |
| `CircuitBreaker` | `src/server/ha/circuit-breaker.ts` | Failure detection and isolation |
| `GracefulShutdown` | `src/server/ha/graceful.ts` | Connection draining on shutdown |

---

## Capability Contract

### SecurityDomain

```typescript
type SecurityDomain =
  | "authentication"    // Login, MFA, passkeys, SSO
  | "authorization"     // RBAC, ABAC, SoD
  | "encryption"        // At rest, in transit, envelope
  | "secrets"           // Management, rotation, validation
  | "tenant-isolation"  // requireTenantContext, row-level
  | "input-validation"  // Zod schemas, body limits
  | "csrf"              // Origin validation
  | "rate-limiting"     // Token-bucket, per-IP, per-user
  | "security-headers"  // CSP, HSTS, X-Frame-Options
  | "audit-logging"     // Tamper-evident, append-only
  | "dependency-security" // pnpm audit, vulnerability scanning
  | "incident-response" // Detection, classification, response
  | "compliance"        // SOC 2, ISO 27001, GDPR, PCI DSS
  | "threat-modeling"   // STRIDE, pre-commit checklist
  | "data-classification" // Public, Internal, Confidential, Restricted, Regulated
  | "pii-handling"      // Detection, encryption, erasure
  | "disaster-recovery" // Backup, restore, drills
  | "business-continuity"; // Health, graceful shutdown, circuit breakers
```

---

## Events

### Security Events

| Event | Type | Severity | Description |
|---|---|---|---|
| `security.auth.success` | Domain | info | Successful authentication |
| `security.auth.failure` | Domain | warning | Failed authentication attempt |
| `security.auth.lockout` | Domain | warning | Account locked due to failed attempts |
| `security.auth.mfa.enrolled` | Domain | info | MFA enrollment completed |
| `security.auth.mfa.challenge` | Domain | info | MFA challenge issued |
| `security.auth.mfa.success` | Domain | info | MFA verification succeeded |
| `security.auth.mfa.failure` | Domain | warning | MFA verification failed |
| `security.auth.mfa.recovery_used` | Domain | warning | Recovery code used |
| `security.authz.denied` | Domain | warning | Authorization check failed |
| `security.authz.sod_violation` | Domain | warning | Segregation of duties violation |
| `security.csrf.rejected` | Domain | warning | CSRF origin validation failed |
| `security.rate_limit.exceeded` | Domain | warning | Rate limit threshold exceeded |
| `security.encryption.rotated` | Domain | info | Encryption key rotated |
| `security.encryption.failed` | Domain | error | Encryption/decryption failure |
| `security.audit.record` | System | info | Audit record created |
| `security.dependency.vulnerability` | Domain | warning | Dependency vulnerability detected |
| `security.incident.detected` | Domain | critical | Security incident detected |
| `security.compliance.violation` | Domain | warning | Compliance control violation |

### Audit Event Structure

```typescript
interface SecurityAuditEvent {
  eventType: string;
  companyId: string;
  userId: string;
  timestamp: Date;
  action: string;
  resource: string;
  resourceId?: string;
  outcome: "success" | "failure" | "denied";
  details: Record<string, unknown>;
  correlationId: string;
  ipAddress?: string;
  userAgent?: string;
}
```

---

## Commands

| Command | Description | Permission | Audit |
|---|---|---|---|
| `authenticate` | Verify user identity | Public | Yes |
| `verifyMFA` | Complete MFA challenge | Public | Yes |
| `validateSession` | Check session validity | System | No |
| `checkPermission` | Check user authorization | System | Yes |
| `evaluateABACPolicy` | Evaluate attribute-based policy | System | Yes |
| `enforceSoD` | Check segregation of duties | System | Yes |
| `encrypt` | Encrypt data at rest | System | No |
| `decrypt` | Decrypt data at rest | System | No |
| `rotateEncryptionKey` | Rotate encryption key | `admin.security` | Yes |
| `validateSecrets` | Validate all secrets at startup | System | No |
| `validateBody` | Validate request body | System | No |
| `validateOrigin` | Validate CSRF origin | System | Yes |
| `checkRateLimit` | Check rate limit threshold | System | Yes |
| `recordSecurityAudit` | Create audit record | System | No |
| `generateComplianceReport` | Generate compliance report | `admin.compliance` | Yes |

---

## Queries

| Query | Description | Cacheable |
|---|---|---|
| `getSecurityHealth` | Security subsystem health | No (30s TTL) |
| `getSecurityAuditLog` | Query audit records | No |
| `getComplianceStatus` | Compliance control status | Yes (5min) |
| `getSecret` | Retrieve secret value | No |

---

## Errors

| Code | Description | HTTP Status | Recovery |
|---|---|---|---|
| `SEC_UNAUTHORIZED` | Authentication required | 401 | Re-authenticate |
| `SEC_FORBIDDEN` | Insufficient permissions | 403 | Grant permission |
| `SEC_SESSION_EXPIRED` | Session has expired | 401 | Re-authenticate |
| `SEC_MFA_REQUIRED` | MFA verification needed | 401 | Complete MFA |
| `SEC_MFA_INVALID` | Invalid MFA code | 401 | Retry code |
| `SEC_CSRF_REJECTED` | CSRF origin validation failed | 403 | Retry with valid origin |
| `SEC_RATE_LIMITED` | Rate limit exceeded | 429 | Wait and retry |
| `SEC_ENCRYPTION_FAILED` | Encryption/decryption error | 500 | Check key configuration |
| `SEC_KEY_ROTATION_FAILED` | Key rotation error | 500 | Manual intervention |
| `SEC_SECRETS_INVALID` | Missing/invalid secrets | 500 | Configure secrets |
| `SEC_PAYLOAD_TOO_LARGE` | Request body exceeds limit | 413 | Reduce payload size |
| `SEC_INVALID_JSON` | Malformed JSON body | 400 | Fix JSON format |
| `SEC_SOD_VIOLATION` | Segregation of duties conflict | 403 | Admin review |
| `SEC_TENANT_ISOLATION` | Cross-tenant access attempted | 403 | Use correct tenant context |
| `SEC_VULNERABILITY_DETECTED` | Dependency vulnerability found | — | Update dependency |

---

## Security Model

### Zero Trust Architecture

Every request flows through:

```
Client → Proxy (rate limit, CSRF, correlation ID, locale)
  → Auth (session validation, MFA check)
    → Authorization (RBAC + ABAC + SoD)
      → Tenant Isolation (requireTenantContext)
        → Input Validation (Zod schemas)
          → Business Logic
            → Audit Logging
              → Response (security headers applied)
```

No layer trusts the layer below it. Each independently verifies.

### Defense in Depth

| Layer | Controls | Source |
|---|---|---|
| **Network** | TLS 1.3, HSTS, CSP | `src/server/security/headers.ts` |
| **Transport** | CORS, CSRF origin validation | `src/server/security/csrf.ts` |
| **Application** | Rate limiting, input validation, body limits | `src/server/security/rate-limiter.ts`, `input-validator.ts` |
| **Authentication** | Password + MFA + passkeys + SSO | `src/server/identity/authentication.ts` |
| **Authorization** | RBAC (64 permissions) + ABAC + SoD | `src/server/iam/permissions.ts`, `abac.ts` |
| **Tenant** | `requireTenantContext()` at every data access | `src/server/context/tenant-context.ts` |
| **Data** | AES-256-GCM at rest, Decimal precision | `src/server/security/encryption.ts` |
| **Audit** | Tamper-evident append-only chain | `src/server/security/audit-logger.ts` |
| **Dependency** | `pnpm audit --json` in CI | `src/server/security/dependency-scanner.ts` |
| **Recovery** | Backup, restore, snapshot, drills | `src/server/recovery/` |

### Authentication Security

1. **Password Hashing**: bcrypt with salt (cost factor 12+)
2. **Brute Force Protection**: Rate limiting + account lockout after 5 failures
3. **Session Management**: Secure, HTTP-only cookies; 30s in-memory revocation cache on DB failure
4. **MFA**: TOTP with 10 SHA-256-hashed recovery codes; ±1 clock skew window
5. **Passkeys**: WebAuthn for passwordless authentication
6. **Password Comparison**: Fail-closed — throws on mismatch, never returns false silently
7. **Demo Password**: Generated per bootstrap (24-char random)
8. **Sandbox Password**: Derived from HMAC — deterministic but not guessable

### Authorization Security

1. **RBAC**: 64+ granular permissions with scopes (global, company, resource)
2. **ABAC**: Attribute-based policies for fine-grained control
3. **MFA Required**: 25+ permissions require MFA verification
4. **SoD**: 12 segregation of duties rules enforced
5. **Admin Bypass Prevention**: Owner role does not bypass authorization checks

### Encryption Architecture

```
Plaintext
  → EncryptionService.encrypt()
    → AES-256-GCM (authenticated encryption)
    → Random 12-byte IV per operation
    → Authentication tag for integrity
    → Key ID + version for rotation tracking
    → EncryptedPayload { ciphertext, iv, authTag, keyId, version, algorithm }
```

- **Key Rotation**: Supports multiple historical keys via `ENCRYPTION_KEY_HISTORY`
- **KMS Provider**: Pluggable `KMSProvider` interface for external KMS integration
- **Validation**: Rejects known insecure keys at startup
- **Key Format**: 64 hex characters (32 bytes)

---

## Permission Model

### Permission Registry

```typescript
// Located at: src/server/iam/permissions.ts
interface GranularPermission {
  name: string;        // e.g., "security.rotate_keys"
  category: string;    // e.g., "security"
  description: string;
  scopes: string[];    // ["global", "company", "resource"]
  requiresMfa: boolean;
}
```

### Security Permissions

| Permission | Scope | MFA | Description |
|---|---|---|---|
| `security.read` | Company | No | View security configuration |
| `security.rotate_keys` | Global | Yes | Rotate encryption keys |
| `security.audit_read` | Company | No | View security audit logs |
| `security.compliance` | Global | Yes | View/generate compliance reports |
| `security.incident_manage` | Global | Yes | Manage security incidents |
| `security.policies` | Global | Yes | Manage security policies |
| `admin.security` | Global | Yes | Full security administration |

### SoD Rules

| Rule | Description |
|---|---|
| Creator ≠ Approver | Record creator cannot approve the same record |
| Proposer ≠ Executor | Payment proposer cannot execute payment |
| Config ≠ Sole Admin | Connector configurator cannot be sole admin |
| Requester ≠ Approver | Approval requestor cannot approve own request |
| Config ≠ Auditor | Security configurator cannot audit own config |

---

## Observability

### Metrics

| Metric | Type | Labels | Description |
|---|---|---|---|
| `security_auth_attempts_total` | Counter | method, status, provider | Authentication attempts |
| `security_auth_duration_ms` | Histogram | method, provider | Authentication latency |
| `security_mfa_enrolled_total` | Counter | method | MFA enrollments |
| `security_mfa_verify_total` | Counter | method, status | MFA verifications |
| `security_authz_checks_total` | Counter | permission, status | Authorization checks |
| `security_authz_denied_total` | Counter | permission, reason | Authorization denials |
| `security_sod_violations_total` | Counter | rule | SoD violations |
| `security_csrf_rejected_total` | Counter | — | CSRF rejections |
| `security_rate_limit_hits_total` | Counter | operation, scope | Rate limit triggers |
| `security_encryption_ops_total` | Counter | operation, status | Encrypt/decrypt operations |
| `security_encryption_duration_ms` | Histogram | operation | Encryption latency |
| `security_audit_records_total` | Counter | event_type | Audit records created |
| `security_dependency_vulns_total` | Gauge | severity | Open dependency vulnerabilities |
| `security_incidents_total` | Counter | severity, status | Security incidents |
| `security_compliance_score` | Gauge | domain | Compliance score (0-100) |

### Tracing

```
Span: security.authenticate
  Attributes:
    security.method = "password"
    security.mfa_required = true
    security.mfa_verified = true
    security.company_id = "company_abc"
    security.session_id = "session_123"
  Events:
    security.credential.verify
    security.mfa.challenge
    security.mfa.verify
    security.session.create
    security.audit.record

Span: security.authorize
  Attributes:
    security.permission = "treasury.transfer"
    security.rbac_decision = "allow"
    security.abac_decision = "allow"
    security.sod_check = "pass"
    security.company_id = "company_abc"
```

### Logging

All security events are logged as structured JSON with: `eventType`, `companyId`, `userId`, `action`, `resource`, `outcome`, `correlationId`, `timestamp`. Sensitive fields (passwords, tokens, MFA secrets) are redacted via Pino redaction rules.

---

## Metrics

| Metric | Description | Alert Threshold |
|---|---|---|
| Login success rate | % successful logins | < 95% |
| MFA adoption rate | % users with MFA enabled | < 80% |
| Authz denial rate | % of authz checks denied | > 5% |
| Rate limit trigger rate | Rate limits per 1000 requests | > 10 |
| CSRF rejection rate | CSRF failures per 1000 requests | > 1 |
| Encryption failure rate | Encryption errors per 1000 ops | > 0.1 |
| Dependency vulnerability count | Open vulnerabilities | > 0 (high/critical) |
| Audit record integrity | Audit chain validation | Any break |
| Session expiry rate | Sessions expiring vs revoked | Investigation |
| Account lockout rate | Lockouts per 1000 logins | > 5 |

---

## Rate Limiting

| Operation | Limit | Window | Scope | Source |
|---|---|---|---|---|
| Login (per email) | 5 attempts | 15 min | Per email | `rate-limiter.ts` |
| Login (per IP) | 20 attempts | 15 min | Per IP | `rate-limiter.ts` |
| Password reset | 3 requests | 1 hour | Per email | `rate-limiter.ts` |
| MFA verify | 5 attempts | 15 min | Per user | `rate-limiter.ts` |
| API requests | 1000/hr | Sliding | Per API key | `rate-limit.ts` |
| Admin operations | 50/hr | Rolling | Per admin user | `rate-limiter.ts` |
| Session creation | 10/hour | Rolling | Per user | `rate-limiter.ts` |

### Rate Limiter Implementation

- **Algorithm**: Token-bucket with sliding window
- **Memory Management**: 60s periodic cleanup, 100K max entries, 10% evictions on capacity
- **Storage**: In-memory (single instance); Redis-backed for distributed (planned)
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Retry Policy

Security operations are NOT retried automatically:

| Operation | Retries | Rationale |
|---|---|---|
| Login | User must retry | Security — no automated retries |
| MFA verify | User must retry | Security — no automated retries |
| Password reset | New token required | Security — token is single-use |
| SSO | One attempt | Returns to login page on failure |
| Authorization check | None | Fail-closed — deny by default |
| Encryption/Decryption | 1 | Infrastructure failure retry only |

---

## Circuit Breakers

| Circuit | Threshold | Recovery | Fallback |
|---|---|---|---|
| Database | 5 failures / 60s | 30s | 30s in-memory revocation cache |
| IdP (SSO) | 3 failures / 60s | 60s | Local auth fallback (if configured) |
| MFA service | 3 failures / 60s | 30s | No bypass — user retries |
| External KMS | 3 failures / 60s | 60s | Local key cache (if available) |

**Design Principle**: Security circuits fail-closed. When in doubt, deny access.

---

## Caching

| Data | TTL | Scope | Invalidation |
|---|---|---|---|
| Session data | Session lifetime | Per session | On logout/revocation |
| Permission checks | 60 seconds | Per user+company | On role/permission change |
| Security policies | 5 minutes | Per company | On policy change |
| Password strength rules | 1 hour | Global | On rule change |
| Revocation cache | 30 seconds | Per user | Auto-expiry |

---

## Versioning

| Aspect | Strategy | Notes |
|---|---|---|
| SecurityContract | semver | Major for breaking changes |
| Permission definitions | Append-only | Never removed, only added |
| Audit event types | Append-only | New events added |
| Encryption algorithm | Versioned | `EncryptionMetadata.version` field |
| Key versions | Tracked | `keyId` + `ENCRYPTION_KEY_HISTORY` |
| API security headers | Additive | New headers never replace existing |
| Compliance controls | Versioned | Control IDs with revision tracking |

---

## Lifecycle

### Security Event Lifecycle

```
Detection → Classification → Containment → Eradication → Recovery → Post-Mortem
```

### Encryption Key Lifecycle

```
Generation → Distribution → Active Use → Rotation →
  → Historical (decrypt only) → Retirement → Secure Deletion
```

### Session Lifecycle

```
Login → Created → Active → Idle → Expired
                   ↘ Revoked (manual or admin)
                   ↘ Forced Logout (admin)
```

### Incident Lifecycle

```
Detection → Triage → Classification (P0-P3) → Containment →
  → Investigation → Eradication → Recovery →
  → Post-Mortem → Remediation → Prevention
```

---

## Extension Model

### Adding a New Security Control

1. **Define** the security domain and threat it addresses
2. **Implement** the control as a module in `src/server/security/` or `src/server/iam/`
3. **Integrate** into the request pipeline (proxy or route handler)
4. **Instrument** with metrics, tracing, and audit logging
5. **Test** with adversarial test cases (penetration-style)
6. **Document** the threat model and control rationale
7. **Add** to the pre-commit security checklist

### Adding a New Permission

1. **Define** in `src/server/iam/permissions.ts`
2. **Assign** category, scopes, MFA requirement
3. **Add** to relevant role defaults
4. **Enforce** in route handlers via `requirePermission()`
5. **Audit** all permission checks

### Adding a New Compliance Control

1. **Map** the control to the compliance framework (SOC 2, ISO 27001, etc.)
2. **Implement** the control or verify existing controls satisfy it
3. **Test** the control with automated checks
4. **Document** the control in `docs/compliance/`
5. **Monitor** the control via compliance metrics

---

## Provider Model

### External Security Providers

| Provider | Purpose | Protocol | Status |
|---|---|---|---|
| Local (bcrypt) | Password hashing | N/A | Built |
| TOTP (RFC 6238) | MFA | RFC 6238 | Built |
| WebAuthn | Passkeys | FIDO2 | Built |
| SAML 2.0 | SSO | SAML | Built |
| OIDC | SSO | OAuth 2.0 | Built |
| AWS KMS | Key management | AWS SDK | Scaffolded |
| Azure Key Vault | Key management | Azure SDK | Scaffolded |
| HashiCorp Vault | Secrets | HTTP API | Scaffolded |

---

## Testing Strategy

| Test Type | Scope | Frequency |
|---|---|---|
| Unit | Password hashing, MFA, encryption, CSRF, rate limiting | Every PR |
| Integration | Auth flow, SSO, MFA enrollment, permission checks | Every PR |
| Security | Brute force protection, session fixation, CSRF bypass | Every PR |
| Penetration | Auth bypass, privilege escalation, injection | Monthly |
| Compliance | SOC 2, ISO 27001 control validation | Quarterly |
| Chaos | DB failure, IdP outage, KMS unavailability | Monthly |
| Recovery | Backup restore, disaster recovery drills | Quarterly |

---

## Failure Modes

| Failure | Impact | Mitigation |
|---|---|---|
| DB failure | Session check fails | 30s in-memory revocation cache (fail-closed) |
| IdP unreachable | SSO login fails | Local auth fallback (if configured) |
| MFA service down | MFA challenge fails | No bypass — user retries |
| Rate limit hit | Login blocked | User waits; exponential backoff |
| Account lockout | User cannot login | Admin unlock or 30-min wait |
| Encryption key lost | Cannot decrypt data | Key history recovery; backup key |
| CSRF attack | Cross-origin state change | Origin validation rejects request |
| Dependency vulnerability | Potential exploit | CI fails; remediation required |
| Audit chain break | Compliance violation | Investigation; integrity check |
| Secret leaked | Credential compromise | Immediate rotation; session revocation |
| DB corruption | Data loss | Restore from backup; replay events |
| Concurrent modification | Optimistic locking conflict | Retry with latest version |

---

## Recovery Strategy

| Scenario | Recovery |
|---|---|
| DB failure | 30s in-memory cache; fail-closed on cache miss |
| IdP outage | Local authentication fallback |
| Encryption key compromise | Rotate key; re-encrypt affected data; audit trail |
| Session fixation attack | Regenerate session ID; invalidate old session |
| Credential leak | Forced password reset; session revocation; audit alert |
| CSRF attack | Origin validation blocks; alert on pattern |
| Brute force attack | Account lockout; IP rate limiting; alert |
| Compliance violation | Investigation; remediation; post-mortem |
| Data breach | Incident response; containment; notification; post-mortem |
| Disaster recovery | Restore from backup; validate integrity; resume operations |

---

## Data Classification

| Level | Description | Encryption | Access Control | Retention |
|---|---|---|---|---|
| **Public** | Marketing, docs, public API | None required | Unauthenticated | No limit |
| **Internal** | Config, metadata, non-sensitive | TLS in transit | Authenticated | 7 years |
| **Confidential** | Business data, user profiles | AES-256-GCM + TLS | RBAC + tenant | 7 years |
| **Restricted** | Financial records, audit trails | AES-256-GCM + TLS | RBAC + SoD + tenant | 10 years |
| **Regulated** | PII, PCI data, tax records | AES-256-GCM + TLS + KMS | RBAC + SoD + MFA + tenant | Per regulation |

### PII Handling Rules

1. **Detection**: PII fields tagged in Prisma schema via `@classification("restricted")`
2. **Encryption**: PII encrypted at rest via `EncryptionService`
3. **Access Control**: PII access requires explicit permission + audit log
4. **Retention**: PII deleted per retention policy or on right-to-erasure request
5. **Masking**: PII masked in logs and non-production environments
6. **Export**: PII export requires approval + audit trail

---

## Compliance Framework

### SOC 2 Controls

| Control | Domain | Status |
|---|---|---|
| CC6.1 | Logical access controls | Partially built |
| CC6.2 | Authentication mechanisms | Partially built |
| CC6.3 | Access revocation | Partially built |
| CC6.6 | System boundaries | Partially built |
| CC6.7 | Data transmission encryption | Built |
| CC7.1 | Vulnerability management | Partially built |
| CC7.2 | Security monitoring | Partially built |
| CC8.1 | Change management | Partially built |

### ISO 27001 Controls

| Control | Description | Status |
|---|---|---|
| A.9.1 | Access control policy | Partially built |
| A.9.2 | User access management | Partially built |
| A.9.4 | System access restriction | Partially built |
| A.10.1 | Cryptographic controls | Partially built |
| A.12.6 | Technical vulnerability management | Partially built |
| A.14.2 | Secure development | Partially built |

### GDPR Controls

| Control | Description | Status |
|---|---|---|
| Art. 5 | Data processing principles | Partially built |
| Art. 17 | Right to erasure | Not started |
| Art. 20 | Data portability | Not started |
| Art. 25 | Data protection by design | Partially built |
| Art. 32 | Security of processing | Partially built |
| Art. 33 | Breach notification | Not started |

### PCI DSS Controls

| Control | Description | Status |
|---|---|---|
| Req 1 | Network security controls | Partially built |
| Req 3 | Protect stored account data | Partially built |
| Req 4 | Encrypt transmission | Built |
| Req 6 | Secure systems and software | Partially built |
| Req 7 | Restrict access by business need | Partially built |
| Req 8 | Identify users and authenticate | Partially built |
| Req 10 | Log and monitor all access | Partially built |
| Req 11 | Test security regularly | Partially built |

---

## Threat Model (STRIDE)

| Threat | Mitigation |
|---|---|
| **S**poofing | MFA, passkeys, session validation, CSRF protection |
| **T**ampering | AES-256-GCM, audit chain integrity, optimistic locking |
| **R**epudiation | Tamper-evident audit logging, non-repudiable approvals |
| **I**nformation Disclosure | Encryption at rest/transit, tenant isolation, RBAC |
| **D**enial of Service | Rate limiting, circuit breakers, graceful degradation |
| **E**levation of Privilege | RBAC + ABAC + SoD, admin bypass prevention |

---

## Key Source Files

| File | Purpose |
|---|---|
| `src/server/security/encryption.ts` | AES-256-GCM encryption with key rotation |
| `src/server/security/rate-limiter.ts` | Token-bucket rate limiting |
| `src/server/security/rate-limit.ts` | Rate limit types and configuration |
| `src/server/security/csrf.ts` | CSRF origin validation |
| `src/server/security/headers.ts` | CSP, HSTS, security headers |
| `src/server/security/input-validator.ts` | Zod schema validation |
| `src/server/security/secrets.ts` | Startup secrets validation |
| `src/server/security/audit-logger.ts` | Tamper-evident audit records |
| `src/server/security/dependency-scanner.ts` | pnpm audit integration |
| `src/server/security/authenticate-request.ts` | Request authentication |
| `src/server/security/session-validation-store.ts` | Session validation cache |
| `src/server/security/require-permission.ts` | Permission enforcement |
| `src/server/security/environment.ts` | Environment validation |
| `src/server/security/index.ts` | Barrel export |
| `src/server/iam/permissions.ts` | 64+ permission definitions |
| `src/server/iam/abac.ts` | Attribute-based access control |
| `src/server/iam/mfa.ts` | TOTP MFA service |
| `src/server/iam/roles.ts` | Role management |
| `src/server/iam/admin.ts` | Admin operations |
| `src/server/iam/session.ts` | Session management |
| `src/server/iam/types.ts` | IAM type definitions |
| `src/server/iam/audit-events.ts` | Audit event types |
| `src/server/iam/index.ts` | Barrel export |
| `src/server/identity/authentication.ts` | Login, MFA, passkey, password reset |
| `src/server/identity/session-manager.ts` | Session lifecycle |
| `src/server/identity/identity-facade.ts` | Unified identity entry point |
| `src/server/identity/policy-engine.ts` | Security policy evaluation |
| `src/server/identity/audit-service.ts` | Auth/authz audit trail |
| `src/server/context/tenant-context.ts` | Tenant context enforcement |
| `src/server/http/handle-route.ts` | Unified error handling, body parsing |
| `src/server/recovery/backup-manager.ts` | Database backup |
| `src/server/recovery/restore-manager.ts` | Backup restoration |
| `src/server/recovery/recovery-validator.ts` | Recovery drills |
| `src/server/ha/circuit-breaker.ts` | Failure isolation |
| `src/server/ha/graceful.ts` | Graceful shutdown |
| `src/server/ha/health.ts` | Health probes |

---

*The Security Platform is the immune system of Perionyx. It never sleeps, never trusts, and never forgives.*
