# Perionyx — Session Architecture

**Phase 15.1A Deliverable**
**Version 1.0 — July 2026**

---

## 1. Session Model Overview

Perionyx uses **stateless JWT sessions** as the primary authentication mechanism. The session is a signed JWT stored in an HTTP-only cookie, validated on every request by the proxy.

There are **three** session-related systems in the codebase, each with a distinct role:

| System | Location | Storage | Used By | Purpose |
|--------|----------|---------|---------|---------|
| **NextAuth JWT** | `src/server/auth/auth.ts` | Cookie (client) | `proxy.ts` (all routes) | Production auth |
| **Identity SessionManager** | `src/server/identity/session-manager.ts` | In-memory Map | `IdentityFacade` | Design prototype / API layer |
| **IAM SessionManager** | `src/server/iam/session.ts` | In-memory Map | Standalone | Design prototype / API layer |

---

## 2. Production Session (NextAuth JWT)

### 2.1 How It Works

The JWT is a self-contained, signed token. The server never stores it — it's validated by cryptographic signature on each request.

```
Sign-In → JWT created with claims → Set as HTTP-only cookie
Request → Proxy reads cookie → Verify signature → Check tokenVersion → Accept/reject
Sign-Out → Cookie deleted → No server-side action needed
```

### 2.2 Session Lifecycle

| Event | Action | Duration |
|-------|--------|----------|
| Sign-in | JWT created, cookie set | Instant |
| Request | JWT verified, tokenVersion checked | ~1ms (crypto) + ~5ms (DB for tokenVersion) |
| Sign-out | Cookie deleted | Instant |
| Password change | `tokenVersion` incremented → all JWTs rejected | Immediate |
| Password reset | `tokenVersion` incremented → all JWTs rejected | Immediate |
| Account disable | `tokenVersion` incremented → all JWTs rejected | Immediate |
| Account lockout | `lockedUntil` set → new logins blocked; existing JWTs continue | 15 minutes |
| JWT expiry | Cookie natural expiry | 24 hours |

### 2.3 TokenVersion Mechanism

**Problem:** Stateless JWTs cannot be revoked server-side. If a password is changed, the old JWT remains valid until expiry.

**Solution:** `User.tokenVersion` (integer, default 1) is embedded in the JWT. On every request, the proxy compares the JWT's `tokenVersion` with the database value. If they differ, the session is rejected.

**Trade-off:** This adds one indexed DB query per request (Prisma `findUnique` on `User.id`, selecting `tokenVersion` + `lockedUntil`). For an enterprise finance platform, this is an acceptable cost for immediate session invalidation.

**Fail-open:** If the DB query fails, the request proceeds. The 24h JWT expiry provides a natural ceiling. This prioritizes availability over security.

### 2.4 Performance Impact

| Metric | Before (stateless) | After (tokenVersion) | Delta |
|--------|-------------------|---------------------|-------|
| DB queries per request | 0 (JWT-only) | 1 (indexed PK lookup) | +1 |
| Query cost | N/A | ~1-5ms (PostgreSQL index scan) | +1-5ms |
| Cache potential | N/A | Short-lived (30s TTL) could reduce | Optional |

---

## 3. Identity SessionManager (Design Prototype)

**File:** `src/server/identity/session-manager.ts`

### 3.1 Purpose

This is a **design-prototype** session manager that was built as part of the Identity module (Phase 11C). It provides:
- Session creation with metadata (IP, user agent, auth method)
- Session revocation (single, all-user, all-company)
- Active session counting
- Device fingerprinting
- Expiry tracking

### 3.2 Why It Exists

The Identity module was designed to support enterprise identity management features (SSO, SCIM, MFA) that require server-side session tracking. This manager provides the **data model** and **API interface** for those features.

### 3.3 Why It's Not Wired Into Production

The production auth flow uses NextAuth JWT, which doesn't use this session manager. The JWT is self-contained — the server never stores session state.

This manager is used by `IdentityFacade` for:
- `getUserIdentitySummary()` — counts active sessions
- `getCompanyIdentityStatus()` — counts company sessions
- `health()` — reports session count

These are **read-only** operations on in-memory data. They don't affect the actual auth flow.

### 3.4 Scaling Limitations

- In-memory `Map` — not shared across processes
- Lost on server restart
- Not suitable for horizontal scaling

---

## 4. IAM SessionManager (Design Prototype)

**File:** `src/server/iam/session.ts`

### 4.1 Purpose

This session manager provides **role-based session policies**:
- Idle timeout (30 minutes default)
- Absolute timeout (12 hours default, varies by role)
- Concurrent session limit (5 default)
- Device fingerprinting
- Automatic revocation of oldest session when limit exceeded

### 4.2 Role-Based Session Lifetimes

| Role | Max Session Lifetime |
|------|---------------------|
| system_administrator | 8 hours |
| security_officer | 8 hours |
| enterprise_administrator | 12 hours |
| compliance_officer | 12 hours |
| treasury_manager | 12 hours |
| approval_authority | 12 hours |
| financial_controller | 12 hours |
| connector_manager | 12 hours |
| risk_manager | 12 hours |
| treasury_analyst | 24 hours |
| auditor | 24 hours |
| operations_manager | 24 hours |
| workflow_developer | 24 hours |
| read_only_executive | 48 hours |
| support_agent | 24 hours |
| department_manager | 24 hours |
| api_access | 720 hours (30 days) |

### 4.3 Why It's Not Wired Into Production

Same reason as the Identity SessionManager — the JWT flow is self-contained and doesn't consult this manager. The role-based session lifetimes defined here are **not enforced** in the production JWT flow (which uses a uniform 24h maxAge).

### 4.4 Scaling Limitations

Same as Identity SessionManager — in-memory, single-process, lost on restart.

---

## 5. Consolidation Analysis

### 5.1 Should They Be Merged?

**No.** The two in-memory session managers serve different purposes:
- `identity/session-manager.ts` — rich session metadata (IP, user agent, auth method, device)
- `iam/session.ts` — role-based policies (idle timeout, concurrent limits)

Neither is wired into production. Merging them would combine two incomplete prototypes into one slightly-less-incomplete prototype.

### 5.2 Should They Be Removed?

**No.** They provide:
1. **Data models** — `UserSession` and `SessionInfo` types define the schema for future server-side session features
2. **API interfaces** — `IdentityFacade` uses them for identity management summaries
3. **Design reference** — they document the intended session management features for when server-side sessions are needed (e.g., admin session revocation, session list UI)

### 5.3 Recommended Path

1. Keep both as design prototypes
2. Do NOT wire them into the JWT flow (would require a session store — Redis/DB)
3. When server-side session features are needed (admin revocation, session list), create a unified `SessionService` that:
   - Uses Redis/PostgreSQL for persistence
   - Implements the `SessionInfo` type from IAM
   - Provides the metadata from Identity
   - Is consulted by the proxy for tokenVersion checks (replacing the current direct DB query)

---

## 6. Horizontal Scalability

### 6.1 Current State

| Component | Scalable? | Reason |
|-----------|-----------|--------|
| JWT verification | ✅ Yes | Stateless — each instance verifies independently |
| TokenVersion check | ✅ Yes | PostgreSQL is the source of truth; each instance queries it |
| Rate limiting | ✅ Yes | Redis-backed with in-memory fallback |
| CSRF | ✅ Yes | Stateless — Origin header validation |
| Identity SessionManager | ❌ No | In-memory Map, single-process |
| IAM SessionManager | ❌ No | In-memory Map, single-process |

### 6.2 Scaling Architecture

```
Instance 1 ─┐
Instance 2 ──┼── PostgreSQL (User.tokenVersion, User.lockedUntil)
Instance 3 ──┤
Instance N ──┘── Redis (rate limiting, caching)
```

Each application instance independently:
1. Verifies JWT signature (no shared state)
2. Queries PostgreSQL for tokenVersion (shared source of truth)
3. Queries Redis for rate limiting (shared state)

### 6.3 Limitations

- TokenVersion check adds one DB query per request per instance
- Under extreme load, this could become a bottleneck
- **Mitigation:** Short-lived cache (30s TTL) for tokenVersion values could reduce DB load by ~95%

---

## 7. Refresh Tokens

### 7.1 Analysis

| Question | Answer |
|----------|--------|
| Does Perionyx need refresh tokens? | **No.** The 24h JWT lifetime is sufficient for enterprise finance. |
| Would refresh tokens improve security? | **Marginally.** They'd enable shorter access token lifetimes (e.g., 15 min) but add rotation complexity. |
| Would they increase complexity? | **Yes.** Refresh token storage, rotation, revocation list, client-side refresh logic. |
| Is another architecture preferable? | **Yes.** TokenVersion provides immediate invalidation without refresh token complexity. |

### 7.2 Recommendation

**Do not implement refresh tokens.** The TokenVersion mechanism provides the same security benefit (immediate session invalidation) without the operational complexity of refresh token rotation.

If shorter access token lifetimes are desired in the future, implement them by reducing `session.maxAge` in `auth.ts:34` (e.g., from 24h to 1h). This can be done with a one-line config change.

---

## 8. Administrative Session Management

### 8.1 Current State

| Capability | Available | Implementation |
|------------|-----------|----------------|
| Terminate all sessions | ✅ | `disableUser()` → increments tokenVersion |
| Terminate selected sessions | ❌ | No mechanism to target individual JWTs |
| View active sessions | ❌ | No API endpoint (prototype managers have this in-memory) |
| Session history | ❌ | No audit trail of session events |
| Concurrent session policy | ❌ | Not enforced (IAM prototype has this) |
| Maximum session count | ❌ | Not enforced |
| Idle timeout | ❌ | Not enforced (24h absolute is the only limit) |
| Absolute timeout | ✅ | 24h JWT expiry |
| Device information | ❌ | Not tracked in production |
| Location tracking | ❌ | Not tracked |

### 8.2 Recommended Additions (Phase 15.2+)

1. **Session list API** — Query Prisma Session model (NextAuth database sessions) to show active sessions
2. **Admin session revoke** — Increment a user's tokenVersion via API
3. **Session audit logging** — Record login/logout/revocation events via `recordIAMAudit()`

---

*Phase 15.1A — Enterprise Authentication & Session Architecture Hardening*
