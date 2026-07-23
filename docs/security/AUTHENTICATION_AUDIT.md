# Authentication Security Audit

**Audit Date:** 2026-07-20
**Scope:** Authentication flows across auth service, users service, session management, and rate limiting
**Total Findings:** 16 (2 Critical, 5 High, 5 Medium, 4 Low)

## Executive Summary

The authentication layer has two critical vulnerabilities — token revalidation is skipped on refresh (allowing session persistence after password change) and bcrypt comparison fails open on error. Combined with missing MFA enforcement and in-memory-only rate limiting, the platform is exposed to session hijacking, brute-force attacks, and credential compromise persistence.

## Findings

| Severity | ID | Title | File | Exploitability |
|----------|-----|-------|------|----------------|
| CRITICAL | AUTH-001 | tokenVersion not revalidated on refresh | `auth.ts:67-117` | Session persists after password change; compromised tokens remain valid |
| CRITICAL | AUTH-002 | Password comparison fail-open | `users.service.ts:105` | bcrypt error returns null — auth bypass possible |
| HIGH | AUTH-003 | No MFA enforcement | Auth service | Password-only auth for financial platform |
| HIGH | AUTH-004 | No admin session invalidation endpoint | Auth routes | Cannot force-logout compromised admin sessions |
| HIGH | AUTH-005 | Auth rate limit fail-open on Redis failure | Auth middleware | Rate limiting disabled when Redis is down |
| HIGH | AUTH-006 | Registration rate limit bypass | Registration handler | Registration endpoint lacks per-IP rate limiting |
| HIGH | AUTH-007 | No login attempt tracking in persistent store | Auth service | Brute-force detection lost on restart |
| MEDIUM | AUTH-008 | JWT maxAge 24h without refresh tokens | `auth.ts` | Stolen tokens valid for 24 hours |
| MEDIUM | AUTH-009 | SameSite=Lax instead of Strict | Session config | CSRF exposure on cross-origin requests |
| MEDIUM | AUTH-010 | No anti-automation on registration | Registration handler | Automated user creation possible |
| MEDIUM | AUTH-011 | No password strength requirements | Auth validation | Weak passwords accepted |
| MEDIUM | AUTH-012 | Refresh token rotation not implemented | Refresh handler | Replay of stolen refresh tokens |
| LOW | AUTH-013 | Account unlock doesn't invalidate tokens | Account recovery | Previously stolen tokens remain valid after unlock |
| LOW | AUTH-014 | No idle session warning | Session service | Users not warned before session expiry |
| LOW | AUTH-015 | No login geography alerting | Auth events | No anomalous-location detection |
| LOW | AUTH-016 | No brute-force detection on API keys | API key auth | Infinite API key guesses |

## Key Remediation Actions

1. **AUTH-001**: Revalidate `tokenVersion` in `auth.ts` refresh handler against database before issuing new tokens; return 401 on mismatch
2. **AUTH-002**: Replace `try/catch` fail-open in `users.service.ts` with strict error propagation; ensure bcrypt comparison always returns boolean
3. **AUTH-003**: Implement mandatory TOTP/WebAuthn MFA enrollment for all financial operations; gate sensitive endpoints behind MFA check
4. **AUTH-005**: Implement circuit-breaker pattern for Redis-dependent rate limiting; fall back to local in-memory counters instead of disabling
5. **AUTH-007**: Persist login attempts (success and failure) to database with IP, user agent, and timestamp; enable query-based brute-force detection
