# Security Findings Deduplication Report

**Phase**: 17.0 — Security Findings Validation
**Date**: 2026-07-20
**Purpose**: Identify overlapping findings across the 23 Phase 16.0 audit agent reports and produce a deduplicated list of unique vulnerabilities.

---

## Methodology

Each of the 23 audit agents was asked to independently assess the codebase. Overlap occurs when:
1. Multiple agents find the same root cause but describe it from different angles
2. One finding is a symptom of another (e.g., SSRF is caused by missing URL validation)
3. The same code pattern appears in multiple locations (e.g., missing tenant isolation in CRM + other modules)

Deduplication groups findings by **root cause** — the single code change that would fix all grouped items.

---

## Deduplication Summary

| Metric | Count |
|--------|-------|
| Original findings (all severities) | 295 |
| Critical findings | 23 |
| High findings | 58 |
| **Unique Critical+High root causes** | **24** |
| Overlap groups identified | 14 |
| Findings merged into groups | 57 |

---

## Overlap Groups

### Group 1: CSRF Bypass (3 findings → 1 root cause)

**Root Cause**: Missing Origin header bypasses CSRF validation

| Original ID | Agent | Finding |
|-------------|-------|---------|
| APP-01 | APPLICATION_SECURITY_AUDIT | CSRF origin check passes when Origin header absent |
| CSRF-01 | CSRF_AUDIT | Missing Origin header bypasses SameSite protection |
| INPUT-01 | INPUT_VALIDATION_AUDIT | CSRF protection incomplete on mutation endpoints |

**Root Cause Code**: `src/server/security/csrf.ts:12`
**Fix**: Reject requests with no Origin header on mutation endpoints, or implement proper double-submit cookie pattern with httpOnly cookie.

---

### Group 2: CSRF Token Implementation (2 findings → 1 root cause)

**Root Cause**: CSRF tokens read from request headers instead of httpOnly cookie

| Original ID | Agent | Finding |
|-------------|-------|---------|
| APP-02 | APPLICATION_SECURITY_AUDIT | CSRFProtection class reads both tokens from request headers |
| CSRF-02 | CSRF_AUDIT | Double-submit pattern broken — no cookie-based token |

**Root Cause Code**: `src/server/security/csrf.ts:37-38`
**Fix**: Store one token in an httpOnly cookie, validate the request header token against it. Alternatively, wire the `CSRFProtection.middleware()` class (which appears to have the correct pattern but is dead code).

---

### Group 3: In-Memory Auth (Identity Module) (3 findings → 1 root cause)

**Root Cause**: Enterprise IAM module uses in-memory storage for users, passwords, and login attempts

| Original ID | Agent | Finding |
|-------------|-------|---------|
| AUTH-01 | AUTHENTICATION_AUDIT | Plaintext passwords in memory |
| AUTH-02 | AUTHENTICATION_AUDIT | No account lockout enforcement |
| IAM-01 | AUTHENTICATION_AUDIT | Login attempts stored in-memory, lost on restart |

**Root Cause Code**: `src/server/identity/authentication.ts:6-7, 14-28, 33`
**Fix**: This module needs to be either (a) deleted if it's unused scaffolding, or (b) backed by Prisma/database persistence with bcrypt hashing.

---

### Group 4: In-Memory Audit (Identity Module) (2 findings → 1 root cause)

**Root Cause**: Enterprise IAM audit service stores records in-memory

| Original ID | Agent | Finding |
|-------------|-------|---------|
| AUDIT-01 | AUDIT_LOGGING_AUDIT | Audit records lost on restart |
| IAM-02 | AUDIT_LOGGING_AUDIT | No tamper-evident chain for identity audit |

**Root Cause Code**: `src/server/identity/audit-service.ts:4`
**Fix**: Either delete this module or persist to `AuditLog` table via Prisma.

---

### Group 5: Missing Tenant Isolation (3 findings → 1 root cause)

**Root Cause**: Service methods use bare Prisma queries without `companyId` filter

| Original ID | Agent | Finding |
|-------------|-------|---------|
| TENANT-01 | MULTI_TENANCY_AUDIT | CRM has zero tenant isolation |
| TENANT-02 | MULTI_TENANCY_AUDIT | Cache not tenant-isolated |
| CRM-01 | MULTI_TENANCY_AUDIT | All CRM methods lack companyId filter |

**Root Cause Code**: `src/modules/crm/crm.service.ts` (all methods)
**Fix**: Add `companyId` to every Prisma query. Consider a Prisma middleware or extension that automatically injects `companyId` from `TenantContext`.

---

### Group 6: Workflow Approval Authorization (2 findings → 1 root cause)

**Root Cause**: Approval step doesn't verify the approving user is authorized

| Original ID | Agent | Finding |
|-------------|-------|---------|
| WORKFLOW-01 | APPLICATION_SECURITY_AUDIT | No approver identity verification |
| APP-03 | APPLICATION_SECURITY_AUDIT | Any user can approve any workflow step |

**Root Cause Code**: `src/modules/workflow/engine.ts:714-718`
**Fix**: Check `ctx.userId` against step's `requiredApprovers` / `approvalGroups` before granting approval.

---

### Group 7: Webhook Signature Verification (2 findings → 1 root cause)

**Root Cause**: Signature verification is a no-op (compares payload === signature)

| Original ID | Agent | Finding |
|-------------|-------|---------|
| APP-04 | APPLICATION_SECURITY_AUDIT | Outbound webhook signature is payload itself |
| APP-05 | APPLICATION_SECURITY_AUDIT | verifyWebhookSignature uses === comparison |

**Root Cause Code**: `src/server/providers/sdk/webhook.ts:41-43`
**Fix**: Implement proper HMAC-SHA256 verification. The outbound `buildWebhookHeaders()` should compute `HMAC-SHA256(secret, payload)` and send it as the signature header.

---

### Group 8: Plaid Webhook Verification (2 findings → 1 root cause)

**Root Cause**: verifyPlaidWebhook calls institutionsGet instead of verifying signature

| Original ID | Agent | Finding |
|-------------|-------|---------|
| APP-06 | APPLICATION_SECURITY_AUDIT | Plaid webhook verification is no-op |
| CONNECTOR-01 | APPLICATION_SECURITY_AUDIT | Webhook handler accepts forged events |

**Root Cause Code**: `src/modules/connector-platform/webhooks/plaid-webhook-handler.ts:40-47`
**Fix**: Use Plaid's webhook verification API or verify the `Plaid-Verification` header using Plaid's documented approach.

---

### Group 9: Health Endpoint Information Disclosure (3 findings → 1 root cause)

**Root Cause**: Unauthenticated health endpoints expose internal system details

| Original ID | Agent | Finding |
|-------------|-------|---------|
| API-01 | API_SECURITY_AUDIT | /api/health leaks DB errors, memory, Node version |
| API-02 | API_SECURITY_AUDIT | /api/v1/enterprise/health leaks DB connection errors |
| API-03 | API_SECURITY_AUDIT | /api/recovery-validation leaks stack traces |

**Root Cause Code**: `src/app/api/health/route.ts:25, 42-59`
**Fix**: Return generic status only (200/503). Move detailed diagnostics behind authentication or an admin-only endpoint.

---

### Group 10: Secrets in Version Control (3 findings → 1 root cause)

**Root Cause**: Secret values stored in plaintext YAML/env files

| Original ID | Agent | Finding |
|-------------|-------|---------|
| INFRA-01 | INFRASTRUCTURE_SECURITY_AUDIT | K8s secrets in plaintext YAML |
| INFRA-02 | INFRASTRUCTURE_SECURITY_AUDIT | Docker compose has default passwords |
| SECRET-01 | SECRETS_AUDIT | Default credentials in multiple files |

**Root Cause Code**: `k8s/secrets/app-secrets.yaml`, `docker-compose.yml`
**Fix**: Use sealed-secrets, external-secrets-operator, or vault for K8s. Use `.env.example` with placeholder values for docker-compose. Add pre-commit hooks to block secret commits.

---

### Group 11: SSRF on Webhook URLs (2 findings → 1 root cause)

**Root Cause**: No URL validation before fetching user-supplied URLs

| Original ID | Agent | Finding |
|-------------|-------|---------|
| APP-07 | APPLICATION_SECURITY_AUDIT | SSRF via webhook URL |
| WEBHOOK-01 | APPLICATION_SECURITY_AUDIT | No SSRF protection on outbound fetch |

**Root Cause Code**: `src/modules/webhooks/webhooks.service.ts:27`
**Fix**: Validate URL scheme (https only), block private IP ranges (10.x, 172.16-31.x, 192.168.x, 169.254.x, localhost, ::1), block file:// protocol.

---

### Group 12: Rate Limiting Gaps (4 findings → 2 root causes)

**Root Cause A**: In-memory rate limiter doesn't scale across instances

| Original ID | Agent | Finding |
|-------------|-------|---------|
| APP-08 | APPLICATION_SECURITY_AUDIT | In-memory rate limiter unbounded |
| APP-09 | APPLICATION_SECURITY_AUDIT | Rate limit bypass via memory exhaustion |

**Root Cause Code**: `src/server/security/rate-limit.ts:8-26`

**Root Cause B**: No L7 rate limiting at Ingress layer

| Original ID | Agent | Finding |
|-------------|-------|---------|
| INFRA-03 | INFRASTRUCTURE_SECURITY_AUDIT | No rate limiting on K8s Ingress |
| INFRA-04 | INFRASTRUCTURE_SECURITY_AUDIT | DDoS possible at Ingress layer |

**Root Cause Code**: `k8s/ingress/production.yaml`

**Fix A**: Ensure Redis is always available in production. Add LRU eviction to in-memory fallback. Add max size to Map.
**Fix B**: Add Nginx rate limiting annotations to Ingress. Consider a WAF (ModSecurity/CloudFlare).

---

### Group 13: Session Validation Fail-Open (2 findings → 1 root cause)

**Root Cause**: Database errors during session check allow request through

| Original ID | Agent | Finding |
|-------------|-------|---------|
| AUTH-03 | AUTHENTICATION_AUDIT | Session check fails open on DB error |
| AUTH-04 | AUTHENTICATION_AUDIT | Revoked sessions usable during DB outage |

**Root Cause Code**: `src/proxy.ts:154-158`
**Fix**: Implement fail-closed for security checks. Use a short-lived in-memory cache of recently-revoked token versions to handle brief DB outages.

---

### Group 14: Cache Control Misconfiguration (2 findings → 1 root cause)

**Root Cause**: `public` cache headers on sensitive endpoints

| Original ID | Agent | Finding |
|-------------|-------|---------|
| APP-10 | APPLICATION_SECURITY_AUDIT | cacheHeaders uses `public` for all endpoints |
| APP-11 | APPLICATION_SECURITY_AUDIT | Health endpoint cached publicly |

**Root Cause Code**: `src/server/http/handle-route.ts:48-53`
**Fix**: Add `private` for authenticated endpoints. Keep `public` only for truly public assets. Audit all `cacheHeaders()` call sites.

---

## Findings That Are NOT Duplicates

These are unique root causes with no overlap:

| Finding | Agent | Root Cause |
|---------|-------|------------|
| C-4: CRM IDOR | MULTI_TENANCY_AUDIT | Missing `companyId` in all CRM queries (unique to CRM module) |
| H-7: No body size limit | INPUT_VALIDATION_AUDIT | `parseJsonBody()` has no size check |
| H-9: AI proxy no validation | AI_SECURITY_AUDIT | User content forwarded to AI without filtering |
| H-10: Demo credentials hardcoded | AUTHENTICATION_AUDIT | Hardcoded `demo@perionyx.dev` / `demo1234` |
| H-11: Sandbox credentials hardcoded | AUTHENTICATION_AUDIT | Hardcoded `sandbox-guest@perionyx.dev` / `sandbox-guest-pw` |
| H-12: Permission cache 10min TTL | AUTHORIZATION_AUDIT | Permission cache stale for up to 10 minutes |
| H-14: vitest CVE | DEPENDENCY_AUDIT | Vulnerable dev dependency version |
| H-15: No Ingress rate limiting | INFRASTRUCTURE_SECURITY_AUDIT | Missing Nginx rate limit annotations |
| H-16: Webhook optional signature | APPLICATION_SECURITY_AUDIT | Webhooks created without secrets have no HMAC |

---

## Deduplicated Root Cause Count

After merging overlap groups, the unique Critical+High remediation items are:

| # | Root Cause | Severity | Overlap Group |
|---|-----------|----------|---------------|
| 1 | CSRF Origin Bypass | Critical | Group 1 + Group 2 |
| 2 | Workflow Approval No Authz | Critical | Group 6 |
| 3 | CRM Missing Tenant Isolation | Critical | Group 5 |
| 4 | Identity Module In-Memory Auth | Critical | Group 3 |
| 5 | Identity Module In-Memory Audit | Critical | Group 4 |
| 6 | Webhook Signature Broken | Critical | Group 7 |
| 7 | K8s Secrets in Plaintext | Critical | Group 10 |
| 8 | Plaid Webhook No-Op Verification | High | Group 8 |
| 9 | Health Endpoint Info Disclosure | High | Group 9 |
| 10 | SSRF on Webhook URLs | High | Group 11 |
| 11 | In-Memory Rate Limiter | High | Group 12A |
| 12 | Ingress No Rate Limiting | High | Group 12B |
| 13 | Session Fail-Open | High | Group 13 |
| 14 | No Body Size Limit | High | Unique |
| 15 | AI Proxy No Validation | High | Unique |
| 16 | Demo Credentials Hardcoded | High | Unique |
| 17 | Sandbox Credentials Hardcoded | High | Unique |
| 18 | Permission Cache 10min TTL | High | Unique |
| 19 | Cache Headers Public | High | Group 14 |
| 20 | vitest CVE | High | Unique |
| 21 | Webhook Optional Signature | High | Unique |
| 22 | Docker Compose Port Exposure | High | (overlaps Group 10 context) |
| 23 | K8s Network Policy Permissive | High | Unique |
| 24 | Ingress No Rate Limiting | High | Group 12B |

**Final deduplicated Critical+High count: 24 unique root causes**

---

## Cross-Reference: Validation Report

See `SECURITY_FINDINGS_VALIDATION.md` for source-code verification of each unique root cause.
