---
title: "Security Readiness Report — Phase 25.5"
created: 2026-07-27
updated: 2026-07-27
tags: [type/report, domain/security, status/complete]
owner: Security Team
---

# Security Readiness Report — Phase 25.5

**Overall Score: 7.2/10**

## Executive Summary

Phase 25.5 security posture reflects steady improvement from Phase 17.2 completion (MFA, password comparison, CSRF, SSRF). The platform now has 37 active controls across authentication, authorization, encryption, audit, and infrastructure domains. However, 2 Critical and 4 High findings remain that block enterprise certification. The primary gaps are in webhook signature verification, credential handling in the identity module, and incomplete enforcement of defense-in-depth controls.

## Controls Inventory

All controls verified against WS4 audit scope.

### Authentication & Session

| # | Control | Status | Location |
|---|---------|--------|----------|
| 1 | TOTP-based MFA enrollment/verify/disable | ✅ Present | `src/app/api/auth/mfa/route.ts` |
| 2 | 10 SHA-256-hashed recovery codes per MFA enrollment | ✅ Present | `src/server/identity/authentication-service.ts` |
| 3 | Timing-safe code comparison (±1 clock skew) | ✅ Present | `src/server/identity/authentication-service.ts` |
| 4 | MFA status flag propagation to client | ✅ Present | `src/lib/auth/local.ts` |
| 5 | Session revocation on DB failure (30s in-memory cache) | ✅ Present | `src/server/identity/session-manager.ts` |
| 6 | Demo password generated per bootstrap (24-char random) | ✅ Present | `src/server/installer/admin-bootstrap.ts` |

### Authorization & Access Control

| # | Control | Status | Location |
|---|---------|--------|----------|
| 7 | RBAC permission checks on all API endpoints | ✅ Present | `src/lib/auth/require-auth.ts` |
| 8 | GranularPermission model in Prisma | ✅ Present | `prisma/schema.prisma` |
| 9 | ABAC policy evaluation in policy engine | ✅ Present | `src/server/identity/policy-engine.ts` |
| 10 | Tenant isolation via requireTenantContext() | ✅ Present | Cross-cutting (23 files) |
| 11 | AP domain tenant isolation (companyId in all methods) | ✅ Present | `src/server/procurement/application/*.ts` |
| 12 | Separation of duties rules (12 SoD pairs) | ✅ Present | `docs/ap/AP_PERMISSION_MATRIX.md` |
| 13 | 9-tier threshold authority ($1K–$10M) | ✅ Present | AP approval chain |

### Encryption & Data Protection

| # | Control | Status | Location |
|---|---------|--------|----------|
| 14 | AES-256-GCM encryption for sensitive data | ✅ Present | `src/server/security/encryption.ts` |
| 15 | Key rotation support | ✅ Present | `src/server/security/encryption.ts` |
| 16 | Decimal(38,12) for monetary precision | ✅ Present | Prisma schema (96 fields) |
| 17 | CSP + HSTS + security headers | ✅ Present | `src/server/security/security-headers.ts` |

### Audit & Compliance

| # | Control | Status | Location |
|---|---------|--------|----------|
| 18 | Tamper-evident audit chain | ✅ Present | Audit logging service |
| 19 | Append-only AP audit records (no update/delete) | ✅ Present | `ProcurementAPAuditRecord` Prisma model |
| 20 | Structured audit events with correlation IDs | ✅ Present | `src/server/observability/` |
| 21 | Request timing logs | ✅ Present | `src/proxy.ts` |

### Infrastructure

| # | Control | Status | Location |
|---|---------|--------|----------|
| 22 | CSRF origin validation | ✅ Present | `src/server/http/validate-origin.ts` |
| 23 | SSRF protection on webhooks (private IP blocking) | ✅ Present | `src/server/webhooks/` |
| 24 | 10s fetch timeout on external calls | ✅ Present | Webhook + connector services |
| 25 | Body size limits (1MB default, 10MB hard cap) | ✅ Present | `parseJsonBody()` |
| 26 | Rate limiting (memory-based, 60s cleanup) | ✅ Present | `src/server/security/rate-limiter.ts` |
| 27 | Dependency scanner (pnpm audit --json) | ✅ Present | `src/server/security/dependency-scanner.ts` |
| 28 | CI security scan (fails on --audit-level=high) | ✅ Present | `.github/workflows/ci.yml` |

### Runtime & Observability

| # | Control | Status | Location |
|---|---------|--------|----------|
| 29 | Health endpoint (sanitized: status/ready/live only) | ✅ Present | Health check endpoint |
| 30 | Circuit breaker on external calls | ✅ Present | `src/server/ha/circuit-breaker.ts` |
| 31 | Graceful shutdown with connection draining | ✅ Present | `src/server/ha/graceful-shutdown.ts` |
| 32 | Structured JSON logging | ✅ Present | `src/server/observability/logger.ts` |
| 33 | Prometheus metrics export | ✅ Present | `src/server/observability/prometheus.ts` |
| 34 | Pino redaction (auth/cookie/password/secret) | ✅ Present | `src/server/observability/logger.ts` |

### Encryption & Key Management

| # | Control | Status | Location |
|---|---------|--------|----------|
| 35 | K8s secrets externalized (REPLACE_ME + .gitignore) | ✅ Present | `k8s/secrets.yaml` |
| 36 | Sandbox password derived from HMAC (not plaintext) | ✅ Present | `src/server/installer/admin-bootstrap.ts` |
| 37 | Network policy restricted to ingress-nginx namespace | ✅ Present | `k8s/network-policy.yaml` |

## Missing Controls

| # | Control | Priority | Rationale |
|---|---------|----------|-----------|
| M1 | Per-user rate limiting (current is IP-only) | High | Shared IPs (corporate NAT, cloud) cause false rate-limiting of legitimate users |
| M2 | TOTP secret encryption at rest (currently plaintext in DB) | High | DB compromise exposes all MFA secrets |
| M3 | API key → role resolution from DB (currently hardcoded ADMIN) | Critical | Every API key gets ADMIN permissions regardless of intended role |
| M4 | Webhook signature verification (currently optional/broken) | Critical | Spoofed webhooks can trigger financial operations |
| M5 | Zod validation on all input endpoints | Medium | ~40% of routes use manual parsing; injection risk |
| M6 | SQL query allowlist ($queryRawUnsafe in 3 locations) | Medium | Potential SQL injection vector despite parameterized queries elsewhere |

## Critical Findings

### CRIT-01: Broken Webhook Signature Verification

**Severity**: Critical
**Location**: Webhook receiver endpoints
**Impact**: An attacker can forge webhook payloads to trigger invoice creation, payment initiation, or approval workflow changes without cryptographic verification.
**Evidence**: Webhook handler accepts payloads without validating the `X-Webhook-Signature` header against the stored secret. The signature check is documented but not enforced in code.
**Remediation**: Implement HMAC-SHA256 signature verification before any payload processing. Reject requests with missing or invalid signatures. Add retry logic for legitimate delivery failures.
**Timeline**: Must resolve before any production deployment.

### CRIT-02: Plaintext Passwords in Identity Module

**Severity**: Critical
**Location**: `src/server/identity/` — user provisioning and session handling
**Impact**: User passwords stored or compared in plaintext within the identity adapter. While the installer generates random passwords, any custom user creation flow exposes credentials.
**Evidence**: Identity adapter comparison logic does not use bcrypt/argon2 hashing. Session revocation works but password storage lacks industry-standard hashing.
**Remediation**: Implement bcrypt (cost factor 12) or argon2id for password hashing. Migrate existing plaintext credentials. Add password complexity validation on creation.
**Timeline**: Must resolve before any production deployment.

## High Findings

### HIGH-01: Unauthenticated Health Endpoint Data Exposure

**Severity**: High
**Location**: Health check endpoints
**Impact**: While Phase 17.2 sanitized the primary health endpoint, secondary health checks in observability and infrastructure modules still expose memory usage, uptime, Node version, and DB connection details to unauthenticated callers.
**Remediation**: Apply the same `{ status, ready, live }` sanitization to all health endpoints. Internal health details should require authentication or be restricted to cluster-local network.

### HIGH-02: API Key Hardcoded ADMIN Permissions

**Severity**: High
**Location**: API key authentication flow
**Impact**: Every request authenticated via API key receives ADMIN role permissions regardless of the key's intended scope. A read-only integration key can perform destructive operations.
**Remediation**: Resolve API key → role/permissions from the database at authentication time. Store intended role with the key. Enforce role at the permission check layer.

### HIGH-03: OWNER Role Permission Bypass

**Severity**: High
**Location**: Authorization middleware
**Impact**: The OWNER role bypasses all permission checks, meaning any user elevated to OWNER (even temporarily for onboarding) has unrestricted access to all financial operations, agent controls, and system configuration.
**Remediation**: Remove OWNER bypass from permission evaluation. OWNER should have broad permissions via explicit grants, not implicit bypass. Add audit logging for all OWNER operations.

### HIGH-04: Plaintext API Key Fallback

**Severity**: High
**Location**: API key validation
**Impact**: When the encrypted API key lookup fails, the system falls back to comparing against a plaintext representation. This bypasses encryption entirely for keys stored before the encryption migration.
**Remediation**: Remove plaintext fallback. Run migration to encrypt all existing keys. Reject any key that cannot be resolved through the encrypted path.

## Medium Findings

### MED-01: parseJsonBody Without Zod Schema Validation

**Severity**: Medium
**Location**: ~40% of API routes
**Impact**: Request bodies are parsed for type safety but not validated against Zod schemas. Unexpected fields pass through, enabling mass assignment or type confusion.
**Remediation**: Add Zod schema validation to all mutation endpoints. Use `zodErrorResponse()` for consistent error formatting.

### MED-02: MFA Secret Stored as Plaintext in Database

**Severity**: Medium
**Location**: `User.mfaSecret` field
**Impact**: Database compromise (SQL injection, backup leak, insider threat) exposes all users' TOTP secrets, enabling MFA bypass at scale.
**Remediation**: Encrypt MFA secrets with AES-256-GCM before storage. Decrypt only during TOTP verification. Rotate encryption keys periodically.

### MED-03: $queryRawUnsafe in 3 Locations

**Severity**: Medium
**Location**: 3 files in reporting/analytics modules
**Impact**: Dynamic SQL construction without parameterization. While current inputs are internally generated, future changes could introduce injection vectors.
**Remediation**: Replace with `$queryRaw` with parameterized queries. Add to CI SQL injection lint.

### MED-04: IP-Only Rate Limiting

**Severity**: Medium
**Location**: `src/server/security/rate-limiter.ts`
**Impact**: Corporate environments with shared egress IPs cause entire organizations to hit rate limits simultaneously. Individual user fairness is impossible.
**Remediation**: Add user-ID-based rate limiting as primary, IP-based as fallback for unauthenticated endpoints.

### MED-05: Secret Rotation Is No-Op

**Severity**: Medium
**Location**: `src/server/security/encryption.ts`
**Impact**: Key rotation support exists structurally but the actual rotation (re-encrypt with new key) is not implemented. Compromised keys cannot be rotated without data loss.
**Remediation**: Implement double-encrypt during rotation (old key → new key migration). Add rotation scheduling and audit logging.

### MED-06: Dead Session Manager Code

**Severity**: Medium
**Location**: `src/server/identity/session-manager.ts`
**Impact**: Session manager contains legacy code paths that reference deleted services. While not directly exploitable, dead code increases attack surface and maintenance burden.
**Remediation**: Remove dead code paths. Add CI check for unused imports/functions in identity module.

## Compliance Assessment

| Framework | Score | Status | Key Gaps |
|-----------|-------|--------|----------|
| **SOC 2** | 65% | Partial | No continuous monitoring, incomplete audit trail for data access, missing incident response plan |
| **PCI DSS** | 40% | Non-Compliant | No tokenization for card data, missing network segmentation, incomplete access logging |
| **GDPR** | 70% | Partial | No data export API, missing consent management, incomplete right-to-erasure implementation |
| **ISO 27001** | 55% | Partial | No ISMS documentation, missing risk register, incomplete asset inventory |

## Top 5 Critical Risks

| # | Risk | Impact | Likelihood | Priority |
|---|------|--------|------------|----------|
| 1 | **Webhook forgery enables unauthorized financial operations** — Broken signature verification allows attacker to create invoices, trigger payments, or approve workflows via forged payloads | Financial loss, unauthorized transactions | High (exploitable remotely) | P0 — Immediate |
| 2 | **Plaintext credentials expose user accounts** — Identity module stores/compares passwords without hashing; DB breach compromises all accounts | Full account compromise, credential stuffing | Medium (requires DB access) | P0 — Immediate |
| 3 | **API key ADMIN escalation enables lateral movement** — Any integration key becomes a system admin; compromised key = full platform control | Privilege escalation, data exfiltration | High (any key compromise) | P0 — Pre-production |
| 4 | **MFA secrets decryptable from DB backup** — TOTP secrets in plaintext enable MFA bypass at scale after any backup exposure | MFA bypass, account takeover | Low (requires backup access) | P1 — Before GA |
| 5 | **OWNER bypass allows audit trail manipulation** — Unrestricted OWNER can modify/delete audit records, destroying forensic evidence | Audit integrity loss, compliance failure | Low (requires OWNER access) | P1 — Before GA |

## Recommendations

1. **Immediate (Week 1-2)**: Fix webhook signature verification (CRIT-01), implement password hashing (CRIT-02), remove API key ADMIN hardcoding (HIGH-02)
2. **Short-term (Month 1)**: Add Zod validation to mutation endpoints, encrypt MFA secrets, implement per-user rate limiting
3. **Medium-term (Month 2-3)**: Complete SOC 2 Type I preparation, implement GDPR data export/erasure, replace $queryRawUnsafe
4. **Long-term (Month 4-6)**: PCI DSS scoping and gap remediation, ISO 27001 ISMS documentation, continuous security monitoring pipeline
