# 12 — Security Architecture

**Location**: `src/server/security/` (13 files), `src/server/iam/` (9 files), `src/modules/rbac/` (7 files)

---

## Authentication

| Layer | Implementation |
|---|---|
| Framework | NextAuth v5 (`@auth/prisma-adapter`) |
| Provider | Credentials provider with email/password |
| Password Hashing | bcrypt via Prisma `password_hash` field |
| JWT Sessions | `getToken()` from `next-auth/jwt`, 30-day `maxAge` |
| Cookies | `httpOnly`, `secure` in production |
| API Key Auth | `va_[0-9a-f]{64}` format, validated via `ApiKeyService.validate()` |
| Account Lockout | `failedLoginAttempts` counter + `lockedUntil` timestamp on User model |

Authentication flow in the proxy (`src/proxy.ts`):
1. Extract JWT token from request cookies using `sessionTokenName`
2. If no session and `Bearer` header present, validate API key
3. Attach `userId`, `activeCompanyId`, `companyRole` to request headers
4. Return 401 if neither session nor valid API key is found

## Authorization

### RBAC

`src/modules/rbac/rbac.service.ts` manages role-based access control:
- **Roles**: Custom roles per company with assigned permissions via Prisma `Role` + `RolePermission` models
- **Permissions**: 46+ `GranularPermission` types covering workflow, treasury, approvals, wallets, connectors, reconciliation, audit, administration, security, risk, analytics, reporting, automation, and onboarding
- **Permission Registry**: `PermissionRegistry` in `src/modules/rbac/permission-registry.ts` defines 24 permission definitions with names, categories, and descriptions
- **Sandbox Restrictions**: 10 permissions are blocked in sandbox mode (manage users, roles, API keys, webhooks, integrations, billing, auth, security, export data, delete company)
- **Enforcement**: `rbacService.ensurePermission(userId, companyId, permission)` called at every API handler

### ABAC

`src/server/iam/abac.ts` provides attribute-based access control:
- `ABACEvaluator` — evaluates permission against user and resource attributes
- `ABACPolicyEngine` — manages and evaluates ABAC policies with conditions
- Conditions support operators: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `contains`, `startsWith`, `endsWith`
- Policies have priority ordering, effect (`allow`/`deny`), and permission lists

### IAM Permission System

`src/server/iam/permissions.ts` defines 70+ `GranularPermission` values across 14 categories with scopes (`global`, `company`, `workflow`, `wallet`) and MFA requirements. `PermissionRegistry` class provides lookup, listing, and validation.

`src/server/iam/roles.ts` defines 17 enterprise role definitions:

| Role | Category | Key Trait |
|---|---|---|
| `system_administrator` | Administration | All permissions, sandbox unrestricted |
| `enterprise_administrator` | Administration | All except encryption and delete-company |
| `compliance_officer` | Compliance | Treasury read, audit, risk, reporting |
| `security_officer` | Security | Encryption key, MFA, SSO, session policies |
| `treasury_manager` | Treasury | Full treasury access |
| `treasury_analyst` | Treasury | Read-only treasury |
| `approval_authority` | Operations | Approval approve/reject/delegate |
| `financial_controller` | Compliance | Ledger, reconciliation, journal entries |
| `auditor` | Compliance | Audit trail, read-only access |
| `read_only_executive` | Read-only | View-only dashboards and reports |
| `api_access` | Administration | Programmatic API access |
| And 6 more | | |

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

## Encryption

`src/server/security/encryption.ts` implements AES-256-GCM:

- Algorithm: `aes-256-gcm` (256-bit key, 16-byte IV, 16-byte auth tag)
- Key from `ENCRYPTION_KEY` env var (64 hex characters = 32 bytes)
- Key rotation via `ENCRYPTION_KEY_HISTORY` env var (comma-separated `keyId=hex` pairs)
- Payload format: `base64(metadata):hex(ciphertext)`
- Metadata includes: keyId, algorithm, IV, authTag, version, timestamp
- Methods: `encrypt()`, `decrypt()`, `reEncrypt()`, `rotateKey()`
- KMS provider interface for cloud HSM integration
- Singleton via `getEncryptionService()`
- Hard-coded default and test keys are rejected at construction

## Audit Logging

`src/server/security/audit-logger.ts` provides tamper-evident audit logging:

- `SecurityAuditLogger.record()` stores events in `AuditLog` Prisma model
- SHA-256 hash chaining: each entry includes `previousHash` linking to the prior entry
- Severity levels: `info`, `warning`, `critical`
- Standard fields: userId, companyId, action, resource type/ID, IP, user agent, correlationId
- Filtering by company, user, type, action, severity, date range
- Pagination via cursor-based navigation
- `recordIAMAudit()` for IAM-specific events (login, logout, permission change, role change, MFA events)

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

## CSRF Protection

`src/server/security/csrf.ts`:
- `validateOrigin(request)` — validates Origin/Referer headers against allowed origins
- Applied in `src/proxy.ts` for all mutation requests

## Rate Limiting

`src/server/security/rate-limit.ts`:
- Uses `rate-limiter-flexible` with Redis when available
- Falls back to in-memory store when `REDIS_URL` is not set
- Tiered limits per endpoint type (mutation vs. read)
- Returns remaining count and reset timestamp in response headers
- Keyed by IP address for mutation endpoints in proxy

## Security Headers

`src/server/security/headers.ts` (`SecurityHeadersManager`):
- Content-Security-Policy: strict self-origin with script/style/connect restrictions
- Strict-Transport-Security: max-age based on environment
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- Cross-Origin-Opener-Policy: same-origin
- Cross-Origin-Resource-Policy: same-origin
- Cross-Origin-Embedder-Policy: require-corp

## Additional Security Services

| Service | File | Purpose |
|---|---|---|
| Secrets Validator | `secrets.ts` | Validates required env vars are set and properly formatted |
| Environment Validator | `environment.ts` | Validates NODE_ENV and environment-specific config |
| Input Validator | `input-validator.ts` | Sanitization and validation of user input |
| Dependency Scanner | `dependency-scanner.ts` | Scans for known vulnerable dependencies |
| Authenticate Request | `authenticate-request.ts` | Request-level authentication helper |

## IAM Audit Event Types

`src/server/iam/audit-events.ts` defines structured audit events for IAM operations: login, logout, login failed, permission granted/revoked, role assigned/unassigned, MFA enabled/disabled, session revoked, API key created/revoked, SSO configured, encryption key rotated.
