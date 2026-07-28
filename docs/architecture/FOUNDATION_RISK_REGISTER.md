# Foundation Risk Register

**Phase**: 26.2 — Enterprise Foundation Certification  
**Date**: 2026-07-27

---

## Risk Categories

| Category | Count | Critical | High | Medium | Low |
|---|---|---|---|---|---|
| Memory | 3 | 1 | 2 | 0 | 0 |
| Security | 4 | 1 | 2 | 1 | 0 |
| Data Integrity | 2 | 1 | 1 | 0 | 0 |
| Reliability | 3 | 0 | 2 | 1 | 0 |
| Operational | 2 | 0 | 1 | 1 | 0 |
| **Total** | **14** | **3** | **8** | **3** | **0** |

---

## Critical Risks

### RISK-001: Singleton Overwrite — Orphaned Timers

| Field | Value |
|---|---|
| **ID** | RISK-001 |
| **Severity** | CRITICAL |
| **Likelihood** | HIGH |
| **Impact** | Service degradation, resource leak |
| **Files** | `runtime/capabilities/registry.ts:126-138`, `runtime/secrets/secret-runtime.ts:65-73`, `runtime/configuration/registry.ts:54-69` |
| **Evidence** | `static create(options) { CapabilityRuntime.instance = new CapabilityRuntime(options); }` — unconditionally overwrites. Previous instance's `healthPollingTimer` (line 366) continues running. Previous instance's `cache` Map is orphaned. |
| **Attack Vector** | Hot module reload, test isolation, or any code path calling `create()` twice |
| **Remediation** | Add `if (this.instance) await this.instance.shutdown()` before overwrite |
| **Owner** | Platform Team |
| **Phase** | 26.2A |

### RISK-002: Cross-Tenant Audit Data Leak

| Field | Value |
|---|---|
| **ID** | RISK-002 |
| **Severity** | CRITICAL |
| **Likelihood** | MEDIUM |
| **Impact** | Tenant data isolation violation |
| **Files** | `foundation/config/registry.ts:290-296`, `foundation/secrets/manager.ts:230-234` |
| **Evidence** | `getAuditLog(key?: string, tenantId?: string)` — tenantId is optional. Omitting it returns all tenants' audit data. `listSecrets(tenantId?)` same pattern. |
| **Attack Vector** | Any caller omitting tenantId (including internal services during error recovery) |
| **Remediation** | Make `tenantId` required. Add TypeScript compile error for omission. |
| **Owner** | Security Team |
| **Phase** | 26.2A |

### RISK-003: Unbounded Memory Growth

| Field | Value |
|---|---|
| **ID** | RISK-003 |
| **Severity** | HIGH |
| **Likelihood** | HIGH (inevitable in long-running process) |
| **Impact** | OOM crash, service restart, data loss |
| **Files** | `foundation/secrets/manager.ts:33-34`, `foundation/config/registry.ts:32`, `foundation/capability-registry/registry.ts:33`, `foundation/classification/registry.ts:167` |
| **Evidence** | 5 arrays (`rotationHistory[]`, `auditLog[]` ×3, `eventLog[]`) grow without bounds. In a 24h production run with 100 config changes/day, auditLog grows ~100 entries/day indefinitely. No max-size, no TTL eviction. |
| **Attack Vector** | Normal production operation over days/weeks |
| **Remediation** | Add max-size (10K) + ring buffer eviction to all 5 arrays |
| **Owner** | Platform Team |
| **Phase** | 26.2B |

---

## High Risks

### RISK-004: Silent Error Swallowing in Financial Paths

| Field | Value |
|---|---|
| **ID** | RISK-004 |
| **Severity** | HIGH |
| **Likelihood** | HIGH |
| **Impact** | Invisible failures, data inconsistency |
| **Files** | `runtime/secrets/secret-runtime.ts:287`, `runtime/capabilities/registry.ts:374`, `modules/cfo-advisor/cfo-advisor.service.ts` (5 instances), `modules/onboarding/enterprise-readiness.service.ts` (10 instances) |
| **Evidence** | 83 empty catch blocks. Secret rotation failure at `secret-runtime.ts:287`: `.catch(() => {})` — rotation silently skipped. CFO data fetches return empty data without logging. |
| **Remediation** | Replace all critical-path empty catches with `logger.error()` |
| **Owner** | Platform Team |
| **Phase** | 26.2B |

### RISK-005: Missing Input Validation on Admin Routes

| Field | Value |
|---|---|
| **ID** | RISK-005 |
| **Severity** | HIGH |
| **Likelihood** | MEDIUM |
| **Impact** | Privilege escalation, injection |
| **Files** | `app/api/v1/admin/users/[userId]/assign-role/route.ts`, `app/api/auth/mfa/route.ts`, 17 others |
| **Evidence** | `assign-role` accepts `body.roleId` without Zod validation. MFA uses `request.json().catch(() => ({}))` — malformed JSON returns empty object. |
| **Remediation** | Add Zod schemas to all 19 routes |
| **Owner** | Security Team |
| **Phase** | 26.2C |

### RISK-006: MFA Enrollment Secret Exposure

| Field | Value |
|---|---|
| **ID** | RISK-006 |
| **Severity** | HIGH |
| **Likelihood** | LOW (by design for TOTP) |
| **Impact** | Secret in HTTP response body |
| **Files** | `app/api/auth/mfa/route.ts:42` |
| **Evidence** | `return NextResponse.json({ secret: enrollment.secret, uri: enrollment.uri, recoveryCodes: enrollment.recoveryCodes })` — TOTP secret transmitted in response. This is standard TOTP behavior but should be flagged for audit. |
| **Remediation** | Document as accepted risk. Ensure HTTPS-only transport. |
| **Owner** | Security Team |
| **Phase** | 26.2C |

### RISK-007: Rate Limiter In-Memory Fallback

| Field | Value |
|---|---|
| **ID** | RISK-007 |
| **Severity** | HIGH |
| **Likelihood** | MEDIUM |
| **Impact** | Rate limiting ineffective in multi-instance deployment |
| **Files** | `server/security/rate-limit.ts:117-118` |
| **Evidence** | Falls back to in-memory Map when Redis unavailable. In multi-instance deployment, each instance has independent rate limits — attacker can distribute requests across instances. |
| **Remediation** | Document limitation. Plan Redis-backed rate limiter for Phase 26.2D. |
| **Owner** | Platform Team |
| **Phase** | 26.2D |

### RISK-008: ConfigurationRuntime 13 `as any` Casts

| Field | Value |
|---|---|
| **ID** | RISK-008 |
| **Severity** | HIGH |
| **Likelihood** | LOW |
| **Impact** | Type safety bypass, runtime errors |
| **Files** | `runtime/configuration/registry.ts:126,131,143,155,217,253,259,454,509-514` |
| **Evidence** | 13 `as any` casts bypass TypeScript's type checking. Lines 509-514: entire `ConfigScope` enum bypassed with `as any`. |
| **Remediation** | Refactor to proper typed interfaces |
| **Owner** | Platform Team |
| **Phase** | 26.2B |

---

## Medium Risks

### RISK-009: Sandbox Fallback Secret

| Field | Value |
|---|---|
| **ID** | RISK-009 |
| **Severity** | MEDIUM |
| **Likelihood** | LOW |
| **Impact** | Predictable HMAC input for sandbox passwords |
| **Files** | `modules/sandbox/sandbox-context.ts:31` |
| **Evidence** | `process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "sandbox-fallback"` — if both env vars unset, HMAC uses known string. |
| **Remediation** | Throw on missing env vars in production |
| **Owner** | Security Team |
| **Phase** | 26.2C |

### RISK-010: Session Validation Fail-Open Window

| Field | Value |
|---|---|
| **ID** | RISK-010 |
| **Severity** | MEDIUM |
| **Likelihood** | LOW |
| **Impact** | Revoked session usable for up to 24h during DB failure |
| **Files** | `proxy.ts:184-192` |
| **Evidence** | DB failure → check in-memory cache → if not revoked, allow. Documented. JWT 24h expiry provides ceiling. |
| **Remediation** | Accept as designed. Document in security runbook. |
| **Owner** | Security Team |
| **Phase** | Deferred |

### RISK-011: No Distributed Cache Invalidation

| Field | Value |
|---|---|
| **ID** | RISK-011 |
| **Severity** | MEDIUM |
| **Likelihood** | MEDIUM |
| **Impact** | Stale config/capability data across instances |
| **Files** | `runtime/configuration/registry.ts:51-56`, `runtime/capabilities/registry.ts:98-102` |
| **Evidence** | 5-min cache TTL per instance. No cross-instance invalidation. Config change in one instance not reflected in others for up to 5 min. |
| **Remediation** | Plan Redis pub/sub cache invalidation for Phase 26.2D |
| **Owner** | Platform Team |
| **Phase** | 26.2D |

---

## Risk Heat Map

```
Impact →    Low      Medium     High
Likelihood
HIGH        RISK-003  RISK-004  RISK-001
MEDIUM      RISK-007  RISK-005  RISK-002
            RISK-011  RISK-006
LOW         RISK-009  RISK-010  RISK-008
```

---

## Residual Risk After Remediation

| Risk | Before | After | Reduction |
|---|---|---|---|
| RISK-001 | CRITICAL | LOW | Singleton safety + shutdown |
| RISK-002 | CRITICAL | NONE | Required tenantId |
| RISK-003 | HIGH | LOW | Ring buffer eviction |
| RISK-004 | HIGH | LOW | Error logging |
| RISK-005 | HIGH | LOW | Zod validation |
| RISK-006 | HIGH | MEDIUM | Accept as designed |
| RISK-007 | HIGH | MEDIUM | Document limitation |
| RISK-008 | HIGH | LOW | Type refactoring |
| RISK-009 | MEDIUM | NONE | Throw on missing |
| RISK-010 | MEDIUM | LOW | Accept as designed |
| RISK-011 | MEDIUM | LOW | Redis pub/sub |

**Post-Remediation**: 0 Critical, 0 High, 3 Medium, 8 Low → Acceptable for production.
