---
id: authentication
title: Authentication
sidebar_label: Authentication
description: NextAuth v5 authentication, JWT sessions, API key auth, account lockout, and proxy-level auth flow.
---

# Authentication

| Layer | Implementation |
|---|---|
| Framework | NextAuth v5 (`@auth/prisma-adapter`) |
| Provider | Credentials provider with email/password |
| Password Hashing | bcrypt via Prisma `password_hash` field |
| JWT Sessions | `getToken()` from `next-auth/jwt`, 30-day `maxAge` |
| Cookies | `httpOnly`, `secure` in production |
| API Key Auth | `va_[0-9a-f]{64}` format, validated via `ApiKeyService.validate()` |
| Account Lockout | `failedLoginAttempts` counter + `lockedUntil` timestamp on User model |

## Authentication Flow

Authentication flow in the proxy (`src/proxy.ts`):
1. Extract JWT token from request cookies using `sessionTokenName`
2. If no session and `Bearer` header present, validate API key
3. Attach `userId`, `activeCompanyId`, `companyRole` to request headers
4. Return 401 if neither session nor valid API key is found

## Endpoint Protection

Every API V1 endpoint follows this pattern:

```typescript
export async function GET(request: Request) {
  try {
    const ctx = await requirePermission(request, "permission.name");
    // handler logic
    return NextResponse.json(data, { headers: { ...cacheHeaders(ttl), ...noCacheHeaders() } });
  } catch (error) {
    return handleRouteError(error, request);
  }
}
```

`requirePermission()` (from `require-permission.ts`):
1. Calls `auth()` to verify session
2. Falls back to API key validation for Bearer tokens
3. Calls `requireTenantContext()` for tenant isolation
4. Calls `rbacService.ensurePermission()` for permission check
5. Returns `AuthContext` with userId, companyId, role

## Session Management

`src/server/iam/session.ts` (`EnterpriseSessionManager`):
- Configurable idle timeout (default 30 min) and absolute timeout (default 12 hours)
- Max concurrent sessions per user (default 5) — evicts oldest on overflow
- Per-role max session lifetime (e.g., System Administrator: 8 hours)
- Revocation support with `revokeSession()`
- In-memory session store with user-to-session mapping

## MFA

`src/server/iam/mfa.ts` supports:
- Methods: TOTP, WebAuthn, email OTP
- Per-role MFA enforcement
- Recovery codes (one-time use)
- TOTP secret generation with provisioning URI
- WebAuthn credential management
