# Perionyx — Session Hardening Report

**Phase 15.1A Deliverable**
**Version 1.0 — July 2026**

---

## Executive Summary

Phase 15.1A reviewed and hardened Perionyx's authentication and session architecture. Four verified findings from the previous review were confirmed and resolved. One additional finding (register route maxAge mismatch) was discovered and fixed.

| Finding | Status | Resolution |
|---------|--------|------------|
| Two independent session managers | **Confirmed — Not a bug** | Both are design prototypes, not production infrastructure. Documented. |
| Password changes don't revoke sessions | **Confirmed — Fixed** | `changePassword()` now increments `User.tokenVersion`. |
| Password resets don't revoke sessions | **Confirmed — Fixed** | `resetPassword()` now increments `User.tokenVersion`. |
| Stateless JWT can't be immediately invalidated | **Confirmed — Fixed** | `tokenVersion` claim added to JWT; proxy validates against DB on every request. |
| Account disable doesn't revoke sessions | **Confirmed — Fixed** | `disableUser()` now increments `User.tokenVersion` + sets permanent lock. |
| Register route maxAge mismatch (30d vs 24h) | **New — Fixed** | Changed from `30 * 24 * 60 * 60` to `24 * 60 * 60`. |

---

## Changes Made

### 1. Prisma Schema — `tokenVersion` field

**File:** `prisma/schema.prisma`
**Migration:** `20260718010000_session_versioning`

```prisma
model User {
  /// Session versioning — increment to invalidate all active JWT sessions
  tokenVersion  Int  @default(1)
}
```

**Impact:** One new indexed integer column on the User table. Default value of 1 ensures existing users' JWTs remain valid until their next password change.

### 2. JWT Claims — `tokenVersion`

**File:** `src/server/auth/auth.ts`

The `jwt` callback now fetches `User.tokenVersion` on initial sign-in and embeds it in the JWT:

```typescript
const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { tokenVersion: true } });
token.tokenVersion = dbUser?.tokenVersion ?? 1;
```

The `session` callback now includes `tokenVersion` in the session object:

```typescript
session.user.tokenVersion = (token.tokenVersion as number | undefined) ?? 1;
```

### 3. Proxy — TokenVersion Validation

**File:** `src/proxy.ts`

Every request with a valid JWT now triggers a lightweight DB check:

```typescript
const dbUser = await prisma.user.findUnique({
  where: { id: token.sub },
  select: { tokenVersion: true, lockedUntil: true },
});
```

Three rejection scenarios:
- `dbUser` not found → 401 `SESSION_INVALID`
- `dbUser.tokenVersion !== token.tokenVersion` → 401 `SESSION_REVOKED`
- `dbUser.lockedUntil > now` → 403 `ACCOUNT_LOCKED`

**Fail-open:** If the DB query throws, the request proceeds. The 24h JWT expiry provides a natural ceiling.

### 4. User Service — Session Invalidation Functions

**File:** `src/modules/users/users.service.ts`

New functions added:

| Function | Behavior | Session Impact |
|----------|----------|----------------|
| `changePassword(userId, current, new)` | Verifies current password, hashes new, increments tokenVersion | All sessions revoked |
| `resetPassword(userId, new)` | Hashes new password, increments tokenVersion | All sessions revoked |
| `disableUser(userId)` | Sets permanent lock, increments tokenVersion | All sessions revoked |
| `enableUser(userId)` | Clears lock, resets failed attempts | None (new logins allowed) |
| `lockAccount(userId, duration?)` | Sets temporary lock, increments tokenVersion | All sessions revoked |
| `unlockAccount(userId)` | Clears lock, resets failed attempts | None |
| `getUserById(userId)` | Returns user info including tokenVersion | None |

**Barrel export updated:** `src/modules/users/index.ts`

### 5. Register Route — maxAge Fix

**File:** `src/app/api/auth/register/route.ts`

```diff
- const maxAge = 30 * 24 * 60 * 60; // 30 days, matches NextAuth session.maxAge
+ const maxAge = 24 * 60 * 60; // 24 hours, matches auth.ts session.maxAge
```

**Impact:** New registrations now get a 24h session cookie instead of 30d. Any sessions created before this fix may remain valid for up to 30 days (natural cookie expiry).

### 6. Type Declarations

**File:** `src/types/next-auth.d.ts`

Added `tokenVersion` to both JWT and Session interfaces.

---

## Security Analysis

### Session Invalidation Matrix

| Event | JWT Revoked? | New Logins Blocked? | Mechanism |
|-------|-------------|---------------------|-----------|
| Password change | ✅ Immediate | No | `tokenVersion++` |
| Password reset | ✅ Immediate | No | `tokenVersion++` |
| Account disable | ✅ Immediate | ✅ Yes | `tokenVersion++` + `lockedUntil = max` |
| Account lockout (5 failed) | ❌ No | ✅ 15min | `lockedUntil = now + 15min` |
| Admin unlock | N/A | ✅ Cleared | `lockedUntil = null` |
| Sign-out | ✅ (cookie deleted) | N/A | Client-side cookie deletion |
| JWT expiry | ✅ 24h | N/A | Natural cookie expiry |

### Threat Model

| Threat | Mitigation | Status |
|--------|-----------|--------|
| Stolen JWT (password compromised) | Password change → tokenVersion++ → immediate revocation | ✅ Resolved |
| Stolen JWT (account disabled) | disableUser → tokenVersion++ → immediate revocation | ✅ Resolved |
| Brute force login | 5 attempts → 15min lockout | ✅ Active |
| CSRF | Origin validation + SameSite=Lax | ✅ Active |
| Session fixation | JWT is stateless — no server-side session to fixate | ✅ N/A |
| JWT replay | 24h expiry + tokenVersion check | ✅ Active |
| Horizontal scaling | PostgreSQL as source of truth for tokenVersion | ✅ Supported |

---

## Documentation Deliverables

| Document | Location | Content |
|----------|----------|---------|
| Authentication Architecture | `docs/AUTHENTICATION_ARCHITECTURE.md` | Complete auth flow, JWT lifecycle, cookie config, password ops, authorization, security controls |
| Session Architecture | `docs/SESSION_ARCHITECTURE.md` | Three session systems, consolidation analysis, scalability, refresh tokens, admin capabilities |
| Session Hardening Report | `docs/SESSION_HARDENING_REPORT.md` | This document |

---

## Recommendations for Phase 15.2

1. **Admin session revocation API** — Endpoint to increment a user's `tokenVersion` by admin
2. **Session list endpoint** — Query active sessions for a user (requires Prisma Session model or new SessionEvent table)
3. **Auth event audit logging** — Wire `recordIAMAudit()` into login, logout, password change, lockout flows
4. **tokenVersion cache** — Short-lived Redis/Memory cache (30s TTL) to reduce DB load from tokenVersion checks
5. **Idle timeout enforcement** — Currently not enforced in JWT flow; would require Redis-backed session state

---

*Phase 15.1A — Enterprise Authentication & Session Architecture Hardening*
