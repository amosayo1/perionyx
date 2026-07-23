# Session Security Review

## P0-5 Fix: Fail-Closed Revocation on DB Failure

**Before**: When the database was unreachable, session validation failed open — any session (including recently revoked ones) was accepted. A user who changed their password had their old session continue to work during a DB outage.

**After**: Session validation checks an in-memory revocation cache *before* querying the database. If the cache contains the session token (meaning it was recently revoked), the session is rejected regardless of DB availability.

```
Request → JWT decode → Revocation cache check
  ├── Cache HIT (recently revoked) → Reject immediately (fail-closed)
  └── Cache MISS → Query DB
        ├── DB success → Check tokenVersion → Accept/reject
        └── DB failure → Accept (fail-open, bounded by JWT expiry)
```

The fail-open path still exists for unknown sessions, but it is bounded:
- JWT tokens have a **24-hour maximum expiry** — even if the DB is down, stale sessions expire naturally
- The revocation cache covers the most critical window: password changes, account disables, and admin resets

## SessionValidationStore

An in-memory `Map<string, number>` (token → revocation timestamp) with a **30-second TTL**.

**Populated by** `src/modules/users/users.service.ts` on:
- Password change (`changePassword`)
- Account disable (`disableUser`)
- Password reset (`resetPassword`)
- Account lock (`lockAccount`)

**Eviction**: Entries are removed after 30 seconds via `setTimeout`. The store is bounded — no unbounded growth.

**Why 30 seconds?**: Long enough to cover a DB replication lag or brief outage window. Short enough to avoid memory accumulation. The JWT itself expires at 24 hours — the revocation cache is a fast-path for recently revoked sessions only.

**Not persisted**: The store is per-process. In a multi-process deployment, revocation is eventual (via DB tokenVersion). The cache covers the gap.

## JWT Properties

| Property | Value |
|---|---|
| Expiry | 24 hours |
| Revocation mechanism | `tokenVersion` increment on User record |
| Legacy token handling | Treated as version 1 (backward-compatible) |
| Signing | HS256 with env `JWT_SECRET` |
| Claims | `userId`, `companyId`, `tokenVersion`, `iat`, `exp` |

Legacy tokens (issued before `tokenVersion` was introduced) are treated as version 1. They're rejected once the user's `tokenVersion` exceeds 1 — which happens on the first password change or admin reset.

## MFA Integration

The `mfaRequired` flag is checked during authentication:

1. User authenticates with email/password
2. If `user.mfaRequired === true` and `user.mfaEnabled === false` → return `MFA_REQUIRED` challenge
3. If `user.mfaRequired === true` and `user.mfaEnabled === true` → require TOTP verification
4. JWT is issued only after MFA verification succeeds (if required)

The `mfaRequired` flag is set based on:
- Organization-level policy (admin configures MFA requirement)
- Admin manual override per user
- Future: compliance-driven enforcement (SOX, PCI DSS)

## Fail-Open Bounded

The remaining fail-open behavior is deliberately bounded:

| Risk | Mitigation |
|---|---|
| DB outage allows stale sessions | JWT expiry (24h max) terminates all sessions |
| Revocation during DB outage | In-memory cache catches recently revoked tokens |
| Multi-process revocation lag | DB tokenVersion is source of truth; cache covers 30s gap |
| Token theft | Short JWT expiry limits exposure window |

The trade-off is intentional: availability during brief DB outages is more valuable than perfect revocation enforcement. The 24-hour ceiling ensures no session lives indefinitely.

## Future Enhancements

1. **Redis-backed session store**: Replace in-memory Map with Redis for distributed revocation. TTL can be extended since Redis is shared across processes.
2. **ISessionValidationStore interface**: Extract the current in-memory implementation behind an interface to enable Redis, Postgres, or other backends.
3. **Session binding**: Bind sessions to IP + User-Agent fingerprint to limit token theft impact.
4. **Concurrent session limits**: Enforce maximum active sessions per user with automatic oldest-session revocation.
5. **Session audit trail**: Log all session creation, validation, and revocation events with IP and device info.
