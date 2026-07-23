# Security — Perionyx Identity & Access Management

**Version**: 1.0 | **Last Updated**: 2026-07-12

## Overview

The Perionyx identity security model enforces defense-in-depth through layered policies, audit logging, rate limiting, and session controls. All security policies are managed through the `PolicyEngine` and enforced at the `AuthenticationService` and `SessionManager` levels.

## Password Policies

### Default Password Policy

| Setting | Value | Configurable |
|---|---|---|
| Minimum length | 8 characters | Yes |
| Uppercase required | Yes | Yes |
| Lowercase required | Yes | Yes |
| Digit required | Yes | Yes |
| Special character | Recommended | Yes |
| Password history | 5 passwords | Yes |
| Maximum age | 90 days | Yes |
| Minimum age | 1 day | Yes |

### Custom Password Policies

Password policies are created via `PolicyEngine` with `category: "password"`:

```typescript
policyEngine.createPolicy({
  name: "Finance Department Password Policy",
  category: "password",
  enabled: true,
  settings: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireDigit: true,
    requireSpecial: true,
    minComplexity: 4,              // All 4 character types required
    passwordHistory: 10,           // Cannot reuse last 10 passwords
    maxAgeDays: 60,                // Rotate every 60 days
    minAgeDays: 1,                 // Cannot change more than once per day
  },
  priority: 10,
  companyId: "company_456",
})
```

### Password Validation

`PolicyEngine.evaluatePasswordPolicy()` checks the following in order:

1. Length check: `settings.minLength`
2. Uppercase check: `settings.requireUppercase`
3. Lowercase check: `settings.requireLowercase`
4. Digit check: `settings.requireDigit`
5. Special character check: `settings.requireSpecial`
6. Complexity score: `settings.minComplexity` (1-4 character types required)
7. History check: No reuse of previous passwords

If no custom policies exist, the default 8-character minimum is enforced.

## MFA Policies

### MFA Configuration

```typescript
interface MFAConfig {
  methods: MFAMethod[];                    // Available MFA methods
  required: boolean;                       // Global MFA requirement
  enforcementRoles: EnterpriseRoleId[];    // Roles that must use MFA
  gracePeriodDays: number;                 // Days to enroll after first login
  rememberDeviceDays: number;              // Days to trust device (skip MFA)
}
```

### MFA Policy Enforcement

MFA is enforced at multiple levels:

1. **Role-level enforcement**: Roles with `mfaRequired: true` in `EnterpriseRoleDefinition`
   ```
   Roles requiring MFA:
   - system_administrator, enterprise_administrator
   - compliance_officer, security_officer
   - treasury_manager, financial_controller
   - approval_authority, auditor, risk_manager
   - connector_manager, api_access
   ```

2. **Company-level enforcement**: Configured via `PolicyEngine` with `category: "mfa"`
   ```typescript
   policyEngine.createPolicy({
     name: "Company-Wide MFA",
     category: "mfa",
     enabled: true,
     settings: {
       requireMfa: true,
       gracePeriodDays: 7,
       allowedMethods: ["totp", "webauthn"],
       rememberDeviceDays: 30,
     },
     priority: 100,
     companyId: "company_456",
   })
   ```

3. **Permission-level enforcement**: Some permissions have `requiresMfa: true` in `PermissionRegistry`

### MFA Method Security

| Method | Security Level | Recommended For |
|---|---|---|
| TOTP (Authenticator App) | High | All users |
| WebAuthn (Hardware Key) | Very High | Administrators, financial roles |
| WebAuthn (Platform/Biometric) | High | Mobile users |
| Email OTP | Medium | Fallback only, low-risk roles |

## Session Policies

### Session Configuration

```typescript
interface SessionConfig {
  idleTimeoutMinutes: number;          // Default: 30 minutes
  absoluteTimeoutHours: number;        // Default: 24 hours
  maxConcurrentSessions: number;       // Default: 5
  requireDeviceFingerprint: boolean;   // Default: true for admin roles
}
```

### Session Policy Enforcement

Session policies are created via `PolicyEngine` with `category: "session"`:

```typescript
policyEngine.createPolicy({
  name: "Admin Session Policy",
  category: "session",
  enabled: true,
  settings: {
    idleTimeoutMinutes: 15,           // Auto-logout after 15 min idle
    absoluteTimeoutHours: 8,          // Force re-auth after 8 hours
    maxConcurrentSessions: 2,         // Only 2 active sessions allowed
    requireDeviceFingerprint: true,   // Track sessions by device
  },
  priority: 100,
  companyId: "company_456",
})
```

### Session Expiration

| Session Type | Default TTL | Configuration |
|---|---|---|
| Password login | 24 hours | Session policy |
| SSO login | 24 hours | Session policy |
| API access | 720 hours (30 days) | `api_access` role definition |
| Admin roles | 8-12 hours | Role maxSessionLifetimeHours |

## Rate Limiting

### Login Rate Limiting

| Endpoint | Rate Limit | Window | Scope |
|---|---|---|---|
| `POST /auth/login` | 10 attempts | 60 seconds | Per IP address |
| `POST /auth/mfa` | 5 attempts | 60 seconds | Per user |
| `POST /auth/reset-password` | 3 attempts | 300 seconds | Per email |
| `POST /auth/register` | 3 attempts | 3600 seconds | Per IP address |

### Rate Limiting Implementation

Rate limiting is applied at the proxy level (`src/proxy.ts`) for:
- Auth endpoints (login, MFA, password reset)
- Admin operations (user creation, role assignment)
- Sensitive financial endpoints (transfers, approvals)

The proxy uses:
- Token bucket algorithm for burst handling
- IP-based and user-based rate limit keys
- Redis-backed distributed counters (when configured)
- Exponential backoff headers in responses

### Rate Limit Response

When rate limit is exceeded:
```
HTTP 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1617000000
```

## Audit Logging

### Audit Event Types

All identity events are recorded via `AuditService`:

#### Authentication Events
| Event | Severity | Description |
|---|---|---|
| `login.success` | Info | Successful login |
| `login.failed` | Warning | Failed login attempt |
| `logout` | Info | User-initiated logout |
| `logout.forced` | Warning | Admin-forced logout |

#### MFA Events
| Event | Severity | Description |
|---|---|---|
| `mfa.enrolled` | Info | User enrolled MFA method |
| `mfa.verified` | Info | MFA verification successful |
| `mfa.failed` | Warning | MFA verification failed |
| `mfa.recovery_used` | Warning | Recovery code used |

#### Password Events
| Event | Severity | Description |
|---|---|---|
| `password.changed` | Info | User changed password |
| `password.reset` | Info | Admin-initiated password reset |
| `password.reset_requested` | Info | Password reset requested |

#### Session Events
| Event | Severity | Description |
|---|---|---|
| `session.created` | Info | Session created |
| `session.expired` | Info | Session expired naturally |
| `session.revoked` | Warning | Session actively revoked |

#### User Management Events
| Event | Severity | Description |
|---|---|---|
| `user.created` | Info | User account created |
| `user.updated` | Info | User details modified |
| `user.deleted` | Critical | User account deleted |
| `user.suspended` | Warning | User suspended |
| `user.activated` | Info | User activated/restored |

#### Access Control Events
| Event | Severity | Description |
|---|---|---|
| `role.assigned` | Info | Role assigned to user |
| `role.revoked` | Info | Role revoked from user |
| `permission.granted` | Info | Direct permission granted |
| `permission.revoked` | Info | Direct permission revoked |

#### Administrative Events
| Event | Severity | Description |
|---|---|---|
| `admin.action` | Critical | Administrative action performed |

### Audit Record Structure

```typescript
interface AuditRecord {
  id: string;
  eventType: AuditEventType;
  userId?: string;
  userEmail?: string;
  targetId?: string;
  targetType?: string;
  details: string;                              // Human-readable description
  ipAddress?: string;
  userAgent?: string;
  severity: "info" | "warning" | "error" | "critical";
  companyId?: string;
  sessionId?: string;
  metadata: Record<string, unknown>;            // Extensible context
  timestamp: Date;
}
```

### Audit Querying

```typescript
// Get all logs for a user
auditService.getAuditLogsByUser(userId)

// Get logs by company
auditService.getAuditLogsByCompany(companyId)

// Filter by event type
auditService.getAuditLogsByEventType("login.failed")

// Filter by severity
auditService.getAuditLogsBySeverity("critical")

// Date range
auditService.getAuditLogsByDateRange(startDate, endDate)

// Recent activity
auditService.getRecentLogs(100)

// Summary statistics
auditService.getAuditSummary()

// CSV export
auditService.exportCsv(companyId)
```

### Audit Retention

| Severity | Retention Period | Storage |
|---|---|---|
| Info | 90 days | Database |
| Warning | 180 days | Database |
| Error | 365 days | Database + Cold storage |
| Critical | 7 years | Database + Cold storage + Backup |

## Security Best Practices

### For Administrators

1. **Enforce MFA** for all administrative and financial roles
2. **Use SSO** with a centralized IdP for unified access control
3. **Apply least privilege** — start users with `read_only_executive` and add roles incrementally
4. **Review audit logs** daily for failed authentication patterns
5. **Rotate certificates** before expiry (monitor via health checks)
6. **Set session timeouts** aggressively for admin accounts (15 min idle, 8 hour absolute)
7. **Use rate limiting** defaults; tighten for high-sensitivity endpoints

### For Developers

1. **Never store secrets** in code or configuration; use environment variables
2. **Always validate sessions** on every request via `SessionManager.validateSession()`
3. **Check permissions** via `PermissionManager.hasPermission()` before executing actions
4. **Log all security events** via `AuditService.record()`
5. **Use ABAC** for fine-grained restrictions; RBAC for broad category access
6. **Sanitize inputs** to prevent injection in SAML/OIDC attribute processing
7. **Validate redirect URLs** to prevent open redirect attacks in SSO flows

### Password Security

- Passwords are never stored in plaintext
- Password validation happens client-side AND server-side
- Reset tokens expire after 1 hour and are single-use
- Account lockout messages do not distinguish between "user not found" and "wrong password"
- Password change requires current password verification

### Network Security

- All identity endpoints require HTTPS
- SAML/OIDC callbacks validate origin and state
- Session tokens transmitted via secure, HTTP-only cookies
- API tokens validated on every request
- Rate limiting at the proxy layer for auth endpoints

## Source Code Reference

| File | Class/Method | Description |
|---|---|---|
| `src/server/identity/policy-engine.ts` | `PolicyEngine` | Policy creation and evaluation |
| `src/server/identity/policy-engine.ts:50` | `evaluatePasswordPolicy()` | Password policy check |
| `src/server/identity/policy-engine.ts:90` | `evaluateSessionPolicy()` | Session policy check |
| `src/server/identity/policy-engine.ts:103` | `evaluateLoginPolicy()` | Login policy and IP blocking |
| `src/server/identity/audit-service.ts` | `AuditService` | Audit event recording and querying |
| `src/server/identity/authentication.ts:132` | `validatePasswordStrength()` | Password strength scoring |
| `src/server/identity/authentication.ts:148` | `getLoginHistory()` | Login history query |
| `src/server/identity/authentication.ts:154` | `getRecentLoginAttempts()` | Recent attempts check |
| `src/server/identity/authentication.ts:161` | `isAccountLocked()` | Lockout status check |
| `src/server/identity/session-manager.ts` | `SessionManager` | Session lifecycle management |
| `src/server/iam/types.ts:143` | `MFAConfig` | MFA configuration type |
| `src/server/iam/types.ts:161` | `SessionConfig` | Session configuration type |
| `src/server/iam/permissions.ts` | `PermissionRegistry` | Permission metadata with MFA flags |
| `src/proxy.ts` | Proxy | Rate limiting at edge |
