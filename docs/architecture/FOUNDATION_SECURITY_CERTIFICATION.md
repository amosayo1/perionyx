# Foundation Security Certification

**Phase**: 26.2 — Enterprise Foundation Certification  
**Date**: 2026-07-27

---

## Executive Summary

The foundation security posture is **production-grade** with **3 gaps** that must be remediated. All P0 findings from Phase 16.0/17.0 have been resolved. The remaining gaps are in input validation and cross-tenant isolation.

---

## Security Assessment

### Authentication

| Check | Status | Evidence |
|---|---|---|
| Password hashing | ✅ bcrypt(12) | `identity/authentication.ts` — all passwords hashed with bcrypt cost 12 |
| Admin bootstrap | ✅ bcrypt(12) | `administrator-bootstrap.ts` — Phase 26.0 fix |
| MFA support | ✅ TOTP + recovery | `server/iam/mfa.ts` — 10 recovery codes, timing-safe comparison |
| Session management | ✅ JWT + DB validation | `proxy.ts` — tokenVersion check, lockedUntil check |
| API key auth | ✅ Bearer token | `authenticate-request.ts` — scope-based access |
| Fail-closed auth | ✅ Throws on failure | All auth methods throw `UnauthorizedError` or `ForbiddenError` |

### Authorization

| Check | Status | Evidence |
|---|---|---|
| RBAC | ✅ | `rbacService.ensurePermission()` on admin routes |
| ABAC | ✅ | Permission context in RuntimeContext |
| Tenant isolation | ⚠️ | RuntimeContext carries companyId, but foundation audit logs leak |
| SoD (Separation of Duties) | ✅ | AP approval matrix with 8 roles × 51 commands |
| Permission escalation | ⚠️ | `assign-role` route has RBAC but no Zod validation |

### Cryptography

| Check | Status | Evidence |
|---|---|---|
| Encryption at rest | ✅ AES-256-GCM | `security/encryption.ts` — production-grade with key rotation |
| Webhook verification | ✅ HMAC-SHA256 | `webhook-platform.ts` — `crypto.timingSafeEqual` |
| CSRF protection | ✅ Origin/Referer | `security/csrf.ts` — `rejectMissingOrigin` for session-auth |
| TLS enforcement | ✅ HSTS | `security/headers.ts` — `Strict-Transport-Security` |

### Rate Limiting

| Check | Status | Evidence |
|---|---|---|
| Auth endpoints | ✅ 5/min | `proxy.ts` — auth-specific rate limit |
| MFA endpoints | ✅ 5/min | `app/api/auth/mfa/route.ts` |
| General API | ✅ Tiered | `proxy.ts` — demo/auth/financial/general tiers |
| Redis-backed | ⚠️ | Falls back to in-memory when Redis unavailable |
| Periodic cleanup | ✅ 60s | `security/rate-limit.ts` — prevents memory leak |

### Input Validation

| Check | Status | Evidence |
|---|---|---|
| Zod on AP routes | ✅ 52 tests | Phase 21A.3 — all 65 endpoints validated |
| Zod on admin routes | ❌ | 19 routes without validation |
| Body size limits | ✅ 1MB/10MB | `parseJsonBody()` checks Content-Length |
| SQL injection | ✅ Prisma | Parameterized queries throughout |
| XSS | ✅ React | No `dangerouslySetInnerHTML` in codebase |

### Secret Management

| Check | Status | Evidence |
|---|---|---|
| No hardcoded production secrets | ✅ | All secrets via env vars |
| Sandbox fallback | ⚠️ | `"sandbox-fallback"` when env vars unset |
| Secret rotation | ✅ | `SecretRuntime` with configurable rotation interval |
| Key encryption | ✅ | `foundation/secrets/providers/environment.ts` — env var adapter |

---

## Security Scorecard

| Domain | Score | Verdict |
|---|---|---|
| Authentication | 9.0/10 | CERTIFIED |
| Authorization | 7.5/10 | CONDITIONAL |
| Cryptography | 9.0/10 | CERTIFIED |
| Rate Limiting | 7.0/10 | CONDITIONAL |
| Input Validation | 6.0/10 | CONDITIONAL |
| Secret Management | 7.5/10 | CONDITIONAL |
| **Overall** | **7.7/10** | **CONDITIONAL** |

---

## Certificate-Blocking Security Issues

### SEC-01: Cross-Tenant Audit Log Leak

| Field | Value |
|---|---|
| **Severity** | CRITICAL |
| **File** | `foundation/config/registry.ts:290-296` |
| **Issue** | `tenantId` filter is optional — omitting it returns all tenants' audit data |
| **Impact** | SOC 2 CC6.1 violation, GDPR Art. 5(1)(f) violation |
| **Fix** | Make `tenantId` required |

### SEC-02: Missing Input Validation

| Field | Value |
|---|---|
| **Severity** | HIGH |
| **Files** | 19 API routes without Zod |
| **Issue** | No schema validation on request bodies |
| **Impact** | Injection, type confusion, privilege escalation |
| **Fix** | Add Zod schemas to all 19 routes |

### SEC-03: Sandbox Fallback Secret

| Field | Value |
|---|---|
| **Severity** | MEDIUM |
| **File** | `modules/sandbox/sandbox-context.ts:31` |
| **Issue** | Falls back to `"sandbox-fallback"` when env vars unset |
| **Impact** | Predictable HMAC input for sandbox passwords |
| **Fix** | Throw on missing env vars in production |

---

## Compliance Status

| Standard | Status | Gaps |
|---|---|---|
| SOC 2 Type II | 75% | Tenant isolation, input validation, audit logging |
| ISO 27001 | 70% | Same gaps as SOC 2 |
| PCI DSS | 40% | No tokenization, no card data handling |
| GDPR | 80% | Audit log leak, no data classification adoption |

---

## Recommendations

### Immediate (Week 1)
1. Make `tenantId` required in all foundation audit log queries
2. Add Zod validation to 19 unvalidated API routes
3. Remove sandbox fallback secret in production

### Short-Term (Weeks 2-4)
4. Add rate limiting to `assign-role` endpoint
5. Add audit logging to foundation operations (persist to Prisma)
6. Wire ClassificationRegistry into production data flows

### Medium-Term (Months 2-3)
7. Add MFA enforcement for admin operations
8. Add session timeout configuration
9. Add API key rotation mechanism
