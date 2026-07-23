# Perionyx — Authentication Architecture

**Phase 15.1A Deliverable**
**Version 1.0 — July 2026**

---

## 1. Authentication Overview

Perionyx uses **NextAuth v5** (Auth.js) with **JWT strategy** for browser-based authentication and **API keys** for programmatic access.

### Authentication Methods

| Method | Flow | Token Type | Storage |
|--------|------|------------|---------|
| Credentials | Email + password → NextAuth `authorize()` | JWT (`__Secure-next-auth.session-token`) | HTTP-only cookie |
| API Key | `Authorization: Bearer va_...` header | Opaque key | N/A (validated against DB) |
| Sandbox | Auto-login with seeded credentials | JWT (same as credentials) | HTTP-only cookie |

### Core Files

| File | Responsibility |
|------|---------------|
| `src/server/auth/auth.ts` | NextAuth v5 config, JWT callbacks, cookie settings |
| `src/proxy.ts` | Edge middleware: auth, rate limiting, CSRF, locale, tokenVersion |
| `src/modules/users/users.service.ts` | Credential verification, password operations, account lifecycle |
| `src/types/next-auth.d.ts` | JWT and Session type extensions |

---

## 2. Authentication Flow

### 2.1 Sign-In (Credentials)

```
Browser → POST /api/auth/callback/credentials
  → NextAuth authorize() callback
    → verifyCredentials(email, password) [users.service.ts]
      → prisma.user.findUnique (by email)
      → bcrypt.compare(password, user.passwordHash)
      → Check lockedUntil (return locked error if active)
      → Clear failedLoginAttempts on success
    → Return { id, email, name } to NextAuth
  → JWT callback (auth.ts:67)
    → Set token.sub = userId
    → Query CompanyMembership → set token.activeCompanyId, token.companyRole
    → Query Company → set token.isSandbox
    → Query User.tokenVersion → set token.tokenVersion
  → Sign JWT with AUTH_SECRET
  → Set __Secure-next-auth.session-token cookie (httpOnly, sameSite lax, secure in prod)
```

### 2.2 Request Authentication (Proxy)

```
Request → src/proxy.ts
  → Generate x-request-id
  → Rate limit (4 tiers: auth, demo, financial, API)
  → CSRF check (Origin header validation for mutations)
  → getToken() — verify JWT signature + expiry
  → TokenVersion check (NEW):
      → prisma.user.findUnique(id, select: tokenVersion, lockedUntil)
      → If tokenVersion mismatch → 401 SESSION_REVOKED
      → If lockedUntil > now → 403 ACCOUNT_LOCKED
      → On DB error → fail-open (24h JWT expiry provides ceiling)
  → Set x-user-id, x-company-id, x-company-role headers
  → Pass to route handler
```

### 2.3 Sign-Out

```
Browser → signOut() from next-auth/react
  → Clears __Secure-next-auth.session-token cookie
  → Redirects to /sign-in
```

---

## 3. JWT Lifecycle

### 3.1 Token Structure

| Claim | Source | Purpose |
|-------|--------|---------|
| `sub` | User.id | User identifier |
| `email` | User.email | User email |
| `name` | User.name | Display name |
| `activeCompanyId` | CompanyMembership | Current tenant context |
| `companyRole` | CompanyMembership.role | Tenant role |
| `isSandbox` | Company.sandbox | Sandbox mode flag |
| `tokenVersion` | User.tokenVersion | Session invalidation mechanism |
| `iat` | NextAuth | Issued-at timestamp |
| `exp` | NextAuth | Expiration (24h from iat) |

### 3.2 Token Lifetime

| Config | Value | Source |
|--------|-------|--------|
| `session.maxAge` | 86400s (24h) | `auth.ts:34` |
| Register route `maxAge` | 86400s (24h) | `register/route.ts:88` (fixed from 30d) |
| Cookie `Max-Age` | 86400s | Set by NextAuth |

### 3.3 Token Refresh

NextAuth JWT strategy automatically refreshes the token on each request when >50% of the lifetime has elapsed. No explicit refresh endpoint exists.

### 3.4 Token Invalidation

JWTs are invalidated by:
1. **TokenVersion mismatch** — `User.tokenVersion` incremented on password change, reset, or account disable
2. **Cookie expiry** — 24h natural expiry
3. **Cookie deletion** — sign-out clears the cookie
4. **Account lockout** — `User.lockedUntil` checked on every request

---

## 4. Cookie Configuration

| Property | Value |
|----------|-------|
| Name | `__Secure-next-auth.session-token` (prod) / `next-auth.session-token` (dev) |
| HttpOnly | `true` |
| SameSite | `lax` |
| Secure | `true` in production |
| Path | `/` |
| Max-Age | 86400 (24h) |

---

## 5. Password Operations

### 5.1 Password Change (Authenticated User)

**Flow:** User provides current + new password
**File:** `users.service.ts → changePassword()`
**Behavior:**
1. Verify current password with `bcrypt.compare()`
2. Hash new password with `bcrypt.hash(password, 12)`
3. Increment `User.tokenVersion` (invalidates all JWTs)
4. **Effect:** All existing sessions immediately revoked

### 5.2 Password Reset (Forgot Password / Admin)

**Flow:** Admin or forgot-password flow sets new password
**File:** `users.service.ts → resetPassword()`
**Behavior:**
1. Hash new password with `bcrypt.hash(password, 12)`
2. Increment `User.tokenVersion` (invalidates all JWTs)
3. **Effect:** All existing sessions immediately revoked

### 5.3 Account Disable (Admin)

**Flow:** Admin disables a user account
**File:** `users.service.ts → disableUser()`
**Behavior:**
1. Set `User.lockedUntil` to far future (permanent lock)
2. Increment `User.tokenVersion` (invalidates all JWTs)
3. **Effect:** All existing sessions immediately revoked; new logins blocked

### 5.4 Account Lockout (Failed Attempts)

**Flow:** 5+ consecutive failed login attempts
**File:** `users.service.ts → verifyCredentials()`
**Behavior:**
1. Set `User.lockedUntil` = now + 15 minutes
2. **No tokenVersion increment** — existing sessions continue
3. **Rationale:** Lockout is a *temporary* measure (15 min). The attacker already has a valid JWT if the account is compromised. Revoking sessions on lockout would lock out legitimate users who simply mistyped their password 5 times.

---

## 6. Authorization Flow

### 6.1 RBAC (Role-Based)

```
Route handler → requireTenantContext(userId, companyId, companyRole)
  → rbacService.ensurePermission(userId, companyId, permission)
    → Query UserRoles + Role.permissions
    → Check GranularPermission
    → Throw ForbiddenError if denied
```

### 6.2 Permission Registry

- 28 permissions across 8 categories (transactions, wallets, reconciliation, audit, connectors, administration, agents, security)
- `src/modules/rbac/permission-registry.ts` — canonical list
- `src/modules/rbac/rbac.service.ts` — evaluation logic

### 6.3 IAM Roles

- 17 enterprise roles in `src/server/iam/roles.ts`
- Role-based session lifetimes (8h for sysadmin, 24h for read-only)
- MFA requirements per role
- Sandbox restrictions per role

---

## 7. Security Controls

| Control | Implementation | Status |
|---------|---------------|--------|
| CSRF | Origin header validation (`csrf.ts`) + SameSite=Lax cookies | Active |
| Rate Limiting | Redis-backed + in-memory fallback (`rate-limit.ts`), 4 tiers | Active |
| CSP | `script-src 'self'` (no unsafe-inline/eval) | Active |
| HSTS | 63072000s + includeSubDomains + preload | Active |
| TokenVersion | DB-backed session invalidation | **NEW — Phase 15.1A** |
| Account Lockout | 5 attempts → 15min lock | Active |
| Password Hashing | bcrypt(12) | Active |
| API Key Format | `va_` + 64 hex chars, validated at proxy | Active |
| Request ID | UUID per request for tracing | Active |

---

## 8. Known Limitations

1. **No admin session invalidation endpoint** — Admins cannot view/revoke specific user sessions via API. The `tokenVersion` mechanism provides implicit revocation on password change/disable.
2. **No session list UI** — Active sessions are not displayed to users. The IAM session managers exist as design prototypes but are not wired into the JWT flow.
3. **Fail-open on DB errors** — If the `tokenVersion` check fails due to DB unavailability, the request proceeds. This prioritizes availability over security, with the 24h JWT expiry as a natural ceiling.
4. **Register route was 30d** — Fixed to 24h in Phase 15.1A. Any sessions created before the fix may have been valid for up to 30 days.

---

*Phase 15.1A — Enterprise Authentication & Session Architecture Hardening*
