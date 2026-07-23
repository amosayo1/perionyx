# Security Remediation Plan

## Overview

| Field | Value |
|---|---|
| **Platform** | Perionyx Enterprise Treasury Operating System v1.0.0 |
| **Date** | July 20, 2026 |
| **Total Findings** | 295 (23 Critical, 58 High, 107 Medium, 62 Low, 45 Info) |
| **OWASP Score** | 6.0 / 10 |
| **Architecture Score** | 5.5 / 10 |

This plan is derived from a 23-agent comprehensive security audit of the Perionyx codebase. It prioritises findings by exploitability and blast radius, grouping remediation into four time-bounded phases. Every fix below includes the source file, a code-level description of the change, estimated effort, and an owner role.

---

## Phase P0 — Immediate (Week 1–2): Critical Security Fixes

These 10 items must land before any production traffic is accepted. Each addresses a directly exploitable vector or a fundamental control gap.

### P0-01 — CSRF Origin Bypass

| | |
|---|---|
| **Finding ID** | SEC-CRIT-001 |
| **File** | `src/server/security/csrf.ts:12` |
| **Description** | When the `Origin` header is absent the check is skipped entirely, allowing state-changing requests from untrusted origins. |
| **Fix** | When `Origin` is absent, fall through to the `Referer` header. If **both** are absent, **reject** the request with `403 Forbidden`. No state-changing request should ever reach the handler without a verifiable origin. |
| **Effort** | 1 hour |
| **Owner** | Security Engineer |

```typescript
// Before (broken)
const origin = request.headers.get('origin');
if (!origin) return; // ← allows everything

// After (fixed)
const origin = request.headers.get('origin');
const referer = request.headers.get('referer');
const source = origin || referer;
if (!source || !isAllowedOrigin(source, allowedOrigins)) {
  return new Response('Forbidden', { status: 403 });
}
```

### P0-02 — CSRF Token System Broken

| | |
|---|---|
| **Finding ID** | SEC-CRIT-002 |
| **File** | `src/server/security/csrf.ts:37–38` |
| **Description** | `x-csrf-stored` is read from the request header instead of from the httpOnly cookie where the server originally set it. An attacker can trivially supply any value. |
| **Fix** | Read `x-csrf-stored` from the `csrf_token` cookie (via `request.cookies.get`). Also wire `CSRFProtection.middleware()` into `src/proxy.ts` so every inbound request passes through the validation layer. |
| **Effort** | 4 hours |
| **Owner** | Security Engineer |

```typescript
// Before (broken)
const stored = request.headers.get('x-csrf-stored');

// After (fixed)
const stored = request.cookies.get('csrf_token');
if (!stored) {
  return new Response('CSRF token missing', { status: 403 });
}
```

### P0-03 — No Multi-Factor Authentication

| | |
|---|---|
| **Finding ID** | SEC-CRIT-003 |
| **File** | `src/server/auth/auth.ts` |
| **Description** | The platform relies solely on email + password. No MFA enrollment or verification exists, making credential-stuffing and phishing attacks trivially effective against financial accounts. |
| **Fix** | Implement TOTP-based MFA using `otplib`. Add three endpoints: `POST /api/auth/mfa/enroll` (generates secret + QR), `POST /api/auth/mfa/verify` (validates TOTP code, activates MFA), `POST /api/auth/mfa/validate` (checks TOTP at login). Enforce MFA for all users with `ADMIN`, `TREASURER`, or `CONTROLLER` roles. |
| **Effort** | 2 weeks |
| **Owner** | Security Engineer + Backend Engineer |

### P0-04 — SSRF on Webhook URLs

| | |
|---|---|
| **Finding ID** | SEC-CRIT-004 |
| **File** | `src/modules/webhooks/webhooks.service.ts:27` |
| **Description** | Webhook target URLs are accepted without validation, allowing an attacker to point webhooks at internal services (`http://169.254.169.254`, `http://localhost`, RFC 1918 ranges). |
| **Fix** | Before persisting a webhook URL: (1) enforce `https://` scheme only; (2) resolve DNS; (3) check resolved IPs against RFC 1918 (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), RFC 6598 (`100.64.0.0/10`), loopback (`127.0.0.0/8`), and cloud metadata (`169.254.169.254`). Reject any match. |
| **Effort** | 1 day |
| **Owner** | Backend Engineer |

```typescript
import { isIPv4 } from 'net';

function isPrivateIP(ip: string): boolean {
  if (ip === '127.0.0.1' || ip === '::1' || ip === '169.254.169.254') return true;
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return false;
  // 10.0.0.0/8
  if (parts[0] === 10) return true;
  // 172.16.0.0/12
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  // 192.168.0.0/16
  if (parts[0] === 192 && parts[1] === 168) return true;
  // 100.64.0.0/10
  if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
  return false;
}
```

### P0-05 — No Body Size Limits

| | |
|---|---|
| **Finding ID** | SEC-CRIT-005 |
| **File** | `src/server/http/handle-route.ts:40–46` |
| **Description** | `parseJsonBody()` calls `request.json()` with no size guard. An attacker can send a multi-gigabyte JSON body to exhaust memory. |
| **Fix** | In `src/proxy.ts`, check `Content-Length` header before forwarding; reject anything above 10 MB. In `parseJsonBody()`, read only the first 10 MB of the body stream via `request.clone()` + `ReadableStream` with a byte counter. If the limit is exceeded before EOF, abort with `413 Payload Too Large`. |
| **Effort** | 2 hours |
| **Owner** | Backend Engineer |

### P0-06 — GET Endpoints Have No Rate Limiting

| | |
|---|---|
| **Finding ID** | SEC-CRIT-006 |
| **File** | `src/proxy.ts:80–102` |
| **Description** | The rate limiter gate is `MUTATION_METHODS.includes(method)`, meaning all `GET`, `HEAD`, `OPTIONS` requests bypass rate limiting entirely. Attackers can enumerate resources, brute-force tokens, and exhaust server resources without any throttle. |
| **Fix** | Remove the `MUTATION_METHODS` gate. Apply rate limiting to **all** HTTP methods. Use separate rate limit buckets: read (GET/HEAD) at 200 req/min, write (POST/PUT/PATCH/DELETE) at 50 req/min, auth (POST /api/auth/*) at 10 req/min. |
| **Effort** | 1 hour |
| **Owner** | Security Engineer |

### P0-07 — Demo Bootstrap Endpoint Unauthenticated

| | |
|---|---|
| **Finding ID** | SEC-CRIT-007 |
| **File** | `src/app/api/demo/bootstrap/route.ts:15–16` |
| **Description** | The `/api/demo/bootstrap` endpoint creates an admin user with a hardcoded password and requires zero authentication. An attacker can create an admin account on any running instance. |
| **Fix** | (1) Require `CRON_SECRET` bearer token or a bootstrap-specific API key in the `Authorization` header. (2) Remove the hardcoded password; generate a random 32-character password and return it once. (3) Return `410 Gone` after the first successful bootstrap (check `COMPANY_BOOTSTRAPPED=true` env or DB record). |
| **Effort** | 2 hours |
| **Owner** | Security Engineer |

### P0-08 — Broken Webhook Signature Verification

| | |
|---|---|
| **Finding ID** | SEC-CRIT-008 |
| **File** | `src/server/providers/sdk/webhook.ts:29–47` |
| **Description** | The signature comparison uses a flawed comparison that does not use constant-time comparison and computes HMAC incorrectly, allowing forgery of webhook payloads. |
| **Fix** | Implement proper HMAC-SHA256 using `crypto.createHmac`. Use `crypto.timingSafeEqual` for the comparison to prevent timing side-channels. |
| **Effort** | 2 hours |
| **Owner** | Backend Engineer |

```typescript
import { createHmac, timingSafeEqual } from 'crypto';

function verifyWebhookSignature(
  payload: Buffer,
  signature: string,
  secret: string,
): boolean {
  const expected = `sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`;
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
```

### P0-09 — Plaid Webhook Handler Is a No-Op

| | |
|---|---|
| **Finding ID** | SEC-CRIT-009 |
| **File** | `src/modules/connector-platform/webhooks/plaid-webhook-handler.ts:20–52` |
| **Description** | The Plaid webhook handler accepts any request without verifying Plaid's JWS signature. An attacker can inject fake balance updates, transaction data, or account status changes. |
| **Fix** | Use Plaid's `/webhook_verification_key/get` API to fetch the public verification key. Verify the JWS `Verification-Header` against the key. Reject any webhook that fails verification. Cache the verification key with a short TTL (5 minutes). |
| **Effort** | 4 hours |
| **Owner** | Backend Engineer |

### P0-10 — Kubernetes Secrets Stored in Plaintext in Git

| | |
|---|---|
| **Finding ID** | SEC-CRIT-010 |
| **File** | `k8s/secrets/app-secrets.yaml` |
| **Description** | Database passwords, API keys, and signing secrets are committed to the repository in plaintext YAML. Anyone with repo read access has production credentials. |
| **Fix** | (1) Remove `app-secrets.yaml` from the repository and add it to `.gitignore`. (2) Rotate **all** exposed credentials immediately. (3) Adopt External Secrets Operator or Sealed Secrets to inject secrets from a vault (AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager) at deploy time. |
| **Effort** | 2 hours (+ credential rotation) |
| **Owner** | DevOps Engineer + Security Engineer |

---

## Phase P1 — Short-term (Month 1–2): High-Severity Fixes

These 15 items close the highest-impact high-severity gaps. They require architectural decisions (e.g., persistence strategy, RBAC model) but do not block initial deployment behind a staging gate.

### P1-01 — Identity Module Uses In-Memory Audit Only

| | |
|---|---|
| **Finding ID** | SEC-HIGH-001 |
| **File** | `src/server/identity/` |
| **Description** | All identity audit events (login, password change, role assignment) are stored in process memory and lost on restart. No external audit trail exists. |
| **Fix** | Persist all identity events to `AuditLog` via `recordAudit()` or `recordIAMAudit()`. Ensure every method in `IdentityProviderManager`, `AuthenticationService`, `RoleManager`, `PermissionManager` calls the audit service before returning. |
| **Effort** | 3 days |
| **Owner** | Backend Engineer |

### P1-02 — Login Attempts Not Persisted

| | |
|---|---|
| **Finding ID** | SEC-HIGH-002 |
| **File** | `src/server/identity/authentication.service.ts` |
| **Description** | Failed and successful login attempts are not written to any durable store. Brute-force detection is impossible without this data. |
| **Fix** | Add `recordIAMAudit()` calls for every login attempt (success and failure) with IP, user-agent, timestamp, and outcome. |
| **Effort** | 2 hours |
| **Owner** | Backend Engineer |

### P1-03 — Password Changes Not Audited

| | |
|---|---|
| **Finding ID** | SEC-HIGH-003 |
| **File** | `src/server/identity/authentication.service.ts` |
| **Description** | Password change operations do not emit `PASSWORD_CHANGED` events. There is no audit trail for credential rotation. |
| **Fix** | Emit a `PASSWORD_CHANGED` audit event (with actor, target user, timestamp, and IP) after every successful password change. |
| **Effort** | 1 hour |
| **Owner** | Backend Engineer |

### P1-04 — Account Lock/Unlock Not Audited

| | |
|---|---|
| **Finding ID** | SEC-HIGH-004 |
| **File** | `src/server/identity/` |
| **Description** | Account deactivation and reactivation events are not persisted. An insider could silently unlock a compromised account. |
| **Fix** | Emit `USER_DEACTIVATED` on lock and `USER_ACTIVATED` on unlock via `recordIAMAudit()`, including the admin who performed the action. |
| **Effort** | 1 hour |
| **Owner** | Backend Engineer |

### P1-05 — Permission Cache 10-Minute TTL

| | |
|---|---|
| **Finding ID** | SEC-HIGH-005 |
| **File** | `src/server/identity/permission-manager.ts` |
| **Description** | Permission lookups are cached for 10 minutes. A revoked permission remains effective for up to 10 minutes, a critical window for privilege escalation. |
| **Fix** | (1) Reduce the TTL to 60 seconds. (2) Add explicit cache invalidation when a permission is granted, revoked, or a role changes (`invalidatePermissionCache(userId)`). (3) Log cache hits/misses for observability. |
| **Effort** | 2 hours |
| **Owner** | Backend Engineer |

### P1-06 — API Keys Hardcoded to ADMIN Role

| | |
|---|---|
| **Finding ID** | SEC-HIGH-006 |
| **File** | `src/server/identity/` |
| **Description** | All API keys are assigned `ADMIN` permissions regardless of the key's intended scope. A compromised integration key grants full platform access. |
| **Fix** | Bind every API key to a `companyId` and an explicit permission set at creation time. Validate the key's permission set on every request using `ensurePermission()`. |
| **Effort** | 2 days |
| **Owner** | Backend Engineer + Security Engineer |

### P1-07 — CRM Module Has No Tenant Isolation

| | |
|---|---|
| **Finding ID** | SEC-HIGH-007 |
| **File** | `src/modules/crm/` |
| **Description** | CRM queries do not filter by `companyId`. Any authenticated user can read contacts belonging to other tenants. |
| **Fix** | Add `companyId` to every Prisma query in the CRM module. Use `requireTenantContext()` to obtain the caller's `companyId` and inject it into all list, get, create, update, and delete operations. |
| **Effort** | 1 day |
| **Owner** | Backend Engineer |

### P1-08 — Workflow Admin Role Hardcoded in Background Jobs

| | |
|---|---|
| **Finding ID** | SEC-HIGH-008 |
| **File** | `src/modules/queue/jobs/workflow-job.ts` |
| **Description** | Background workflow jobs execute with `ADMIN` role regardless of who triggered them. A user who triggers a workflow gains elevated privileges for the job's duration. |
| **Fix** | Store the original user's `userId` and `role` in the job payload. When the worker picks up the job, impersonate the original caller's permissions, not a hardcoded admin. |
| **Effort** | 2 hours |
| **Owner** | Backend Engineer |

### P1-09 — Workflow Approval Has No Authorization Check

| | |
|---|---|
| **Finding ID** | SEC-HIGH-009 |
| **File** | `src/modules/workflow-engine/` |
| **Description** | The approval recording endpoint does not verify that the caller is in `requiredApprovers`. Any authenticated user can approve any workflow step. |
| **Fix** | Before recording an approval, query the step's `requiredApprovers` list and verify the caller's `userId` is present. Reject with `403 Forbidden` if not. |
| **Effort** | 2 hours |
| **Owner** | Backend Engineer |

### P1-10 — Outbound Webhook Delivery Has No SSRF Protection

| | |
|---|---|
| **Finding ID** | SEC-HIGH-010 |
| **File** | `src/modules/webhooks/webhooks.service.ts` |
| **Description** | When delivering webhooks, the service resolves and connects to the target URL without re-validating for private IPs (DNS rebinding can bypass creation-time checks). |
| **Fix** | Re-validate the resolved IP at delivery time against the same private IP blocklist. If the IP is private, log the attempt, mark the webhook as failed, and do not deliver. |
| **Effort** | 2 hours |
| **Owner** | Backend Engineer |

### P1-11 — In-Memory Rate Limiter Has No Eviction

| | |
|---|---|
| **Finding ID** | SEC-HIGH-011 |
| **File** | `src/server/security/rate-limiter.ts` |
| **Description** | The in-memory rate limiter stores counters indefinitely. Under sustained attack, this leaks memory until the process OOMs. When Redis is unavailable, there is no fallback awareness. |
| **Fix** | (1) Add TTL-based eviction to each counter entry (e.g., 5-minute window). (2) When Redis is unavailable, log a `WARN` level event and continue with the in-memory fallback. (3) Expose a `/health` indicator for rate limiter state. |
| **Effort** | 2 hours |
| **Owner** | Backend Engineer |

### P1-12 — Webhook Create Has No RBAC

| | |
|---|---|
| **Finding ID** | SEC-HIGH-012 |
| **File** | `src/app/api/webhooks/route.ts` |
| **Description** | Any authenticated user can create webhooks. There is no permission gate. |
| **Fix** | Add `ensurePermission('admin.webhooks')` at the top of the POST handler. |
| **Effort** | 1 hour |
| **Owner** | Backend Engineer |

### P1-13 — Queue Cancel Has No RBAC or Tenant Check

| | |
|---|---|
| **Finding ID** | SEC-HIGH-013 |
| **File** | `src/app/api/v1/queue/jobs/route.ts` |
| **Description** | Job cancellation requires no permission and does not verify the job belongs to the caller's tenant. Any user can cancel any job. |
| **Fix** | Add `ensurePermission('admin.settings')` and verify `job.companyId === tenantContext.companyId` before allowing cancellation. |
| **Effort** | 2 hours |
| **Owner** | Backend Engineer |

### P1-14 — Docker Compose Exposes Postgres and Redis Ports

| | |
|---|---|
| **Finding ID** | SEC-HIGH-014 |
| **File** | `docker-compose.yml` |
| **Description** | Postgres (5432) and Redis (6379) port mappings are exposed to the host, making database credentials accessible from the local network. |
| **Fix** | Remove `ports:` mappings for Postgres and Redis. Use Docker internal networking (`links` or named networks) for service-to-service communication. |
| **Effort** | 1 hour |
| **Owner** | DevOps Engineer |

### P1-15 — Default Database Password Fallback

| | |
|---|---|
| **Finding ID** | SEC-HIGH-015 |
| **File** | `src/server/persistence/config.ts` |
| **Description** | The database config falls back to a default password (`postgres`) when `DATABASE_URL` is not set. Production deployments silently use weak credentials. |
| **Fix** | Remove the default password fallback. Fail hard with a descriptive error if `DATABASE_URL` is not set in production (`NODE_ENV === 'production'`). |
| **Effort** | 1 hour |
| **Owner** | Backend Engineer |

---

## Phase P2 — Medium-term (Month 2–4): Infrastructure Hardening

These 20 items harden the deployment infrastructure, CI/CD pipeline, and runtime security posture. They are lower urgency than P0/P1 but required before any compliance programme can begin.

### P2-01 — Deploy WAF / CDN

Deploy Cloudflare or AWS Shield Advanced in front of the application. Configure OWASP Core Rule Set, rate limiting at the edge, and bot management. This provides a first line of defence for L7 attacks before they reach the application.

**Effort:** 1 week

### P2-02 — Replace Empty Dependency Scanner

The CI pipeline includes a dependency scanner placeholder that runs `pnpm audit` but does not fail the build. Configure `pnpm audit --audit-level=critical` to block merges on critical CVEs. Add `pnpm.overrides` for known-vulnerable transitive dependencies.

**Effort:** 2 hours

### P2-03 — Add Trivy Container Image Scanning

Add a CI step using Trivy to scan built container images for OS and library CVEs. Fail the pipeline on `CRITICAL` or `HIGH` findings. Publish results as a GitHub Actions artifact for audit.

**Effort:** 4 hours

### P2-04 — Centralised Logging

Deploy a structured logging pipeline (Datadog, Grafana Cloud, or self-hosted Loki). Ship application logs, audit logs, and infrastructure logs to a central store with 90-day retention. Ensure no PII appears in logs.

**Effort:** 1 week

### P2-05 — Security Event Alerting

Configure alerts for: brute-force detection (≥5 failed logins per minute per IP), permission escalation (admin role assignment), SSRF block events, rate limit triggers, and failed MFA attempts. Route to PagerDuty or Slack.

**Effort:** 3 days

### P2-06 — Fail-Closed Session Validation

The session validation currently succeeds when the session store is unavailable (fail-open). Change to fail-closed: if the session store is unreachable, reject the request with `401 Unauthorized` and log the failure. As a mitigation for latency, implement a short (30-second) in-memory LRU cache of recently-seen revocation signals.

**Effort:** 1 day

### P2-07 — Fix `cacheHeaders()` to Use `private`

`cacheHeaders()` currently emits `Cache-Control: public`. Financial data must never be cached by shared proxies or CDNs. Change to `private, no-store` for all authenticated endpoints.

**Effort:** 1 hour

### P2-08 — Add `frame-ancestors 'none'` to CSP

The Content-Security-Policy header does not include `frame-ancestors 'none'`. Add it to prevent clickjacking via iframe embedding.

**Effort:** 30 minutes

### P2-09 — Add CSP Reporting Endpoint

Create a `/api/security/csp-report` endpoint that receives `Content-Security-Policy-Report-Only` violation reports. Log and alert on repeated violations.

**Effort:** 2 hours

### P2-10 — Upgrade Vitest to v3.x

The current vitest version has a critical CVE. Upgrade to the latest v3.x release. Verify all 443 tests pass.

**Effort:** 2 hours

### P2-11 — Add pnpm.overrides for nodemailer and postcss

Both `nodemailer` and `postcss` have known transitive vulnerabilities. Add `pnpm.overrides` in `package.json` to force safe versions.

**Effort:** 30 minutes

### P2-12 — API Key Scoping with RBAC Validation

API keys currently bypass RBAC checks. Implement scoped API keys that carry a `companyId` and a permission set. Validate the permission set against `PermissionRegistry` on every request.

**Effort:** 3 days

### P2-13 — Add mTLS via Service Mesh

Deploy Linkerd or Istio to enforce mutual TLS between all services. This ensures service-to-service traffic is encrypted and authenticated without application-level changes.

**Effort:** 1 week

### P2-14 — K8s Service Account Hardening

Create a dedicated service account for the application with `automountServiceAccountToken: false`. This prevents the Kubernetes API token from being mounted into the pod by default.

**Effort:** 1 hour

### P2-15 — K8s Container readOnlyRootFilesystem

Add `securityContext.readOnlyRootFilesystem: true` to the Kubernetes deployment spec. The application should write only to mounted `emptyDir` volumes for temp data.

**Effort:** 1 hour

### P2-16 — K8s Network Policy Namespace Isolation

Deploy a default-deny `NetworkPolicy` in the application namespace. Allow only required ingress (ingress controller → app) and egress (app → Postgres, Redis, external APIs) paths.

**Effort:** 2 hours

### P2-17 — CSRF Token Double-Submit from Cookie

Implement the double-submit cookie pattern: generate a random CSRF token, set it as an httpOnly cookie **and** require it in a custom header (`X-CSRF-Token`). Validate they match on every state-changing request.

**Effort:** 4 hours

### P2-18 — Refresh Token Mechanism

Implement short-lived access tokens (15 minutes) with long-lived refresh tokens (7 days). Store refresh tokens server-side with rotation on use. Revoke all refresh tokens on password change.

**Effort:** 3 days

### P2-19 — Fix Float Financial Fields to Decimal

Audit all Prisma models for `Float` fields used in financial calculations. Replace with `Decimal` (mapped to `NUMERIC` in Postgres) to prevent floating-point rounding errors in treasury amounts.

**Effort:** 2 days

### P2-20 — Wire EnterpriseSessionManager for Idle/Absolute Timeouts

The session system does not enforce idle or absolute timeouts. Wire `EnterpriseSessionManager` to enforce: 30-minute idle timeout, 8-hour absolute timeout. Redirect to login on expiry.

**Effort:** 1 day

---

## Phase P3 — Long-term (Month 4–8): Compliance Programmes

These items establish formal compliance programmes and long-term security posture improvements. They require sustained organisational commitment beyond engineering.

### P3-01 — GDPR Compliance

- Appoint a Data Protection Officer (DPO)
- Implement data subject access requests (DSAR): export, rectification, erasure
- Add cookie consent banner with granular opt-in/opt-out
- Enforce data retention policies (configurable per entity type)
- Create a Record of Processing Activities (ROPA)

**Effort:** 3 months + legal review

### P3-02 — SOC 2 Type II

- Formalise information security policies (acceptable use, access control, incident response, change management)
- Integrate SIEM for continuous monitoring
- Establish a penetration testing programme (annual third-party + quarterly internal)
- Implement quarterly access reviews for all production systems
- Prepare for audit with a readiness assessment

**Effort:** 6 months + audit costs (~$30K–$80K)

### P3-03 — ISO 27001

- Establish an Information Security Management System (ISMS)
- Conduct a formal risk assessment and risk treatment plan
- Create a Statement of Applicability (SoA)
- Implement an internal audit programme
- Prepare for Stage 1 and Stage 2 certification audits

**Effort:** 8–12 months + certification costs (~$20K–$50K)

### P3-04 — PCI DSS

- Define Cardholder Data Environment (CDE) scope (likely SAQ-A if using payment processor)
- Implement tokenisation for any card data (Stripe/Braintree recommended)
- Quarterly ASV (Approved Scanning Vendor) scans
- Annual penetration test
- Network segmentation for CDE

**Effort:** 4 months + ASV costs (~$5K/year)

### P3-05 — Cross-Region Disaster Recovery

- Configure PostgreSQL streaming replication to a secondary region
- Automate failover with Patroni or cloud-native solutions (AWS RDS Multi-AZ, GCP Cloud SQL)
- Test failover quarterly with documented runbooks
- Target RPO < 1 minute, RTO < 15 minutes

**Effort:** 2 months + ongoing infrastructure costs

### P3-06 — Data Classification

- Tag all Prisma models with a classification level (Public, Internal, Confidential, Restricted)
- Implement field-level encryption for PII (names, emails, SSNs) using AES-256-GCM
- Enforce access controls based on classification level
- Add classification labels to API responses

**Effort:** 1 month

### P3-07 — Incident Response Plan

- Document IR procedures with clear roles (Incident Commander, Communications Lead, Technical Lead)
- Define severity levels and escalation paths
- Create a communication template for affected users
- Conduct tabletop exercises quarterly
- Establish a bug bounty programme

**Effort:** 2 weeks + quarterly maintenance

### P3-08 — Supply Chain Security

- Generate SBOMs (Software Bill of Materials) for every release using `syft` or `cyclonedx`
- Sign container images with Cosign (Sigstore)
- Target SLSA Level 2+ for build provenance
- Implement dependency review in CI (GitHub Dependabot + manual review for new deps)

**Effort:** 1 month

---

## Effort Summary

| Phase | Duration | Items | Estimated Effort | Dependencies |
|---|---|---|---|---|
| **P0** | Week 1–2 | 10 | ~40 hours | None — begin immediately |
| **P1** | Month 1–2 | 15 | ~160 hours | P0 complete; architectural decisions on persistence model |
| **P2** | Month 2–4 | 20 | ~400 hours | P1 complete; infrastructure access (Cloud, K8s, CI/CD) |
| **P3** | Month 4–8 | 8 | ~600 hours + compliance costs | P2 complete; organisational commitment + budget |

---

## Success Metrics

### After P0 (Week 2)

| Metric | Before | Target |
|---|---|---|
| OWASP Score | 6.0 / 10 | **7.5 / 10** |
| Critical Findings | 23 | **13** |
| State-changing endpoints with CSRF | ~0% | **100%** |
| MFA availability | None | **All users** |
| SSRF vectors | 2 | **0** |
| Rate-limited endpoints | Write-only | **All HTTP methods** |

### After P1 (Month 2)

| Metric | Before | Target |
|---|---|---|
| OWASP Score | 7.5 / 10 | **8.5 / 10** |
| Critical Findings | 13 | **3** |
| Auth events persisted to audit log | ~10% | **100%** |
| Financial endpoints with RBAC | ~40% | **100%** |
| API keys scoped to company + permissions | 0% | **100%** |
| Secrets in code or manifests | Yes | **0** |

### After P2 (Month 4)

| Metric | Before | Target |
|---|---|---|
| Architecture Score | 5.5 / 10 | **7.5 / 10** |
| High Findings | 58 | **0** |
| CI/CD with security scanning | Placeholder | **Operational** |
| Centralised logging | None | **All services** |
| Container/K8s hardening | Default | **Hardened** |

### After P3 (Month 8)

| Metric | Before | Target |
|---|---|---|
| SOC 2 Type II readiness | 0% | **85%+** |
| GDPR compliant | No | **Yes** |
| ISO 27001 implementation | None | **ISMS established** |
| Cross-region DR | None | **Operational (RPO <1m, RTO <15m)** |

---

## Appendix A — Finding Distribution by Category

| Category | Critical | High | Medium | Low | Info | Total |
|---|---|---|---|---|---|---|
| Authentication & Session | 5 | 8 | 12 | 6 | 3 | 34 |
| Authorization & RBAC | 3 | 10 | 15 | 8 | 2 | 38 |
| Input Validation & Injection | 4 | 6 | 14 | 5 | 4 | 33 |
| Cryptography | 2 | 4 | 8 | 4 | 2 | 20 |
| CSRF & CORS | 2 | 3 | 5 | 2 | 1 | 13 |
| SSRF & Network | 2 | 4 | 6 | 3 | 2 | 17 |
| Secrets Management | 2 | 3 | 5 | 4 | 1 | 15 |
| Logging & Monitoring | 0 | 4 | 10 | 8 | 5 | 27 |
| Infrastructure & Deployment | 1 | 6 | 12 | 8 | 6 | 33 |
| Dependencies & Supply Chain | 0 | 3 | 8 | 6 | 8 | 25 |
| Data Protection & Privacy | 1 | 4 | 6 | 4 | 3 | 18 |
| Workflow & Business Logic | 1 | 3 | 6 | 4 | 3 | 17 |
| **Total** | **23** | **58** | **107** | **62** | **45** | **295** |

---

## Appendix B — OWASP Top 10 Mapping

| OWASP Category | Findings | Highest Severity |
|---|---|---|
| A01: Broken Access Control | 42 | Critical |
| A02: Cryptographic Failures | 18 | Critical |
| A03: Injection | 28 | Critical |
| A04: Insecure Design | 35 | High |
| A05: Security Misconfiguration | 52 | Critical |
| A06: Vulnerable & Outdated Components | 22 | High |
| A07: Identification & Authentication Failures | 30 | Critical |
| A08: Software & Data Integrity Failures | 18 | High |
| A09: Security Logging & Monitoring Failures | 25 | Medium |
| A10: Server-Side Request Forgery | 12 | Critical |
| Infrastructure / Design / Process | 13 | High |
| **Total** | **295** | — |
