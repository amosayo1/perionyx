# Authentication — Perionyx Identity & Access Management

**Version**: 1.0 | **Last Updated**: 2026-07-12

## Supported Methods

The Perionyx identity system supports seven authentication methods, categorized by factor type:

| Method | Type | MFA Capable | SSO | Description |
|---|---|---|---|---|
| `password` | Knowledge | Yes | No | Email + password login with bcrypt hashing |
| `passkey` | Possession/Inherent | Yes (as MFA) | No | WebAuthn/FIDO2 passkey authentication |
| `mfa_totp` | Time-based OTP | Yes | No | TOTP via authenticator apps (RFC 6238) |
| `mfa_webauthn` | WebAuthn | Yes | No | Hardware security keys, platform authenticators |
| `mfa_email_otp` | Email OTP | Yes | No | One-time passcode sent to registered email |
| `sso_saml` | Federation | N/A (IdP handles) | Yes | SAML 2.0 via external Identity Provider |
| `sso_oidc` | Federation | N/A (IdP handles) | Yes | OpenID Connect via external Provider |
| `sso_oauth2` | Federation | N/A (IdP handles) | Yes | OAuth 2.0 via external Provider |

## Authentication Flow

### Password Authentication

```
Step 1: User submits email + password via POST /api/auth/login
Step 2: AuthenticationService.login(email, password, ip, userAgent)
Step 3:   - Lookup user by email
          - Verify password hash matches
          - Check account lockout status
          - Record login attempt via AuditService
Step 4: On success:
          - Create UserSession via SessionManager
          - Return AuthenticatedUser (mfaVerified = false if MFA required)
Step 5: On failure:
          - Increment failed attempt counter
          - Lock account after threshold exceeded
          - Return authentication error
```

### Passkey Authentication

```
Step 1: User initiates passkey login
Step 2: Browser/platform WebAuthn API generates assertion
Step 3: AuthenticationService.verifyPasskey(userId, credentialId, signature)
Step 4:   - Validate credential exists for user
          - Verify cryptographic signature
          - Create session (mfaVerified = true, passkeys are inherently MFA)
Step 5: Return AuthenticatedUser
```

### MFA Flow

```
Step 1: User completes primary authentication (password or passkey)
Step 2: If MFA is required for the user's role:
          - AuthenticatedUser.mfaVerified = false
          - Response indicates MFA challenge needed
Step 3: User submits MFA code/method via POST /api/auth/mfa
Step 4: AuthenticationService.verifyMFA(userId, method, code)
Step 5:   - Validate TOTP/WebAuthn/Email OTP
          - Mark user as mfaVerified = true
          - Record MFA event in audit log
Step 6: Return fully authenticated AuthenticatedUser
```

### SSO Authentication

See [SSO Documentation](./sso.md) for detailed flows for SAML 2.0, OpenID Connect, and OAuth 2.0.

## Password Policies

### Default Password Requirements

| Criteria | Default | Configurable |
|---|---|---|
| Minimum length | 8 characters | Yes (via policy) |
| Uppercase letter | Required | Yes |
| Lowercase letter | Required | Yes |
| Digit | Required | Yes |
| Special character | Recommended | Yes |
| Minimum complexity score | 70/100 | No |

### Password Validation

`AuthenticationService.validatePasswordStrength()` returns:
- `valid: boolean` — password meets minimum requirements
- `score: number` — 0-100 complexity score
- `feedback: string[]` — actionable improvement suggestions

Scoring breakdown:
- Length >= 8: 25 points
- Contains uppercase: 25 points
- Contains lowercase: 25 points
- Contains digit: 15 points
- Contains special character: 10 points
- **Pass**: score >= 70

### Custom Password Policies

Organizations can define custom password policies via `PolicyEngine`:

```typescript
policyEngine.createPolicy({
  name: "Strict Password Policy",
  category: "password",
  enabled: true,
  settings: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireDigit: true,
    requireSpecial: true,
    minComplexity: 3, // requires 3 of 4 character types
  },
  priority: 10,
  companyId: "company_123",
})
```

Policy evaluation uses `PolicyEngine.evaluatePasswordPolicy(password, companyId)`:
- If no custom policies exist, default 8-character minimum is enforced
- Custom policies are evaluated in priority order
- All active policies must pass for the password to be accepted

## Account Lockout

### Lockout Threshold

| Parameter | Default | Configurable |
|---|---|---|
| Failed attempts before lockout | 5 within 15 minutes | Yes |
| Lockout duration | 30 minutes | Yes |
| Lockout scope | Per-email, not per-IP | — |

### Lockout Behavior

1. `AuthenticationService.login()` increments failed attempt counter
2. `getRecentLoginAttempts(email, 15)` checks failed attempts in the last 15 minutes
3. If >= 5 failures, `isAccountLocked(email)` returns `true`
4. Locked accounts receive `"Invalid credentials or account locked"` error (no distinction)
5. Account auto-unlocks after lockout duration
6. Administrators can manually unlock via admin API

### Brute Force Protection

- Rate limiting on login endpoint (see [Security](./security.md))
- Progressive delay on repeated failures
- Audit logging for all failed attempts
- IP-based blocking for abusive patterns via `PolicyEngine.evaluateLoginPolicy()`

## Session Management

### Session Lifecycle

| Phase | Description |
|---|---|
| **Created** | New session after successful authentication |
| **Active** | Session is valid, user can make requests |
| **Idle** | Session exists but no activity (triggers timeout countdown) |
| **Expired** | Session TTL exceeded |
| **Revoked** | Manually terminated (logout, admin action, password change) |

### Session Properties

```typescript
interface UserSession {
  id: string                    // Unique session identifier
  userId: string                // Associated user
  email: string                 // User email (denormalized)
  companyId: string             // Tenant isolation
  ipAddress: string             // Originating IP
  userAgent: string             // Client identifier
  deviceFingerprint?: string    // Optional device tracking
  deviceName?: string           // Human-readable device name
  status: SessionStatus         // active | idle | expired | revoked
  authenticationMethod: string  // How the session was created
  identityProvider?: string     // SSO provider ID if applicable
  mfaVerified: boolean          // MFA status for this session
  lastActivityAt: Date          // Last request timestamp
  expiresAt: Date               // Session expiration (default: 24h)
  createdAt: Date               // Session creation time
  revokedAt?: Date              // When session was revoked
  revocationReason?: string     // Why session was revoked
}
```

### Session Configuration

Default session parameters:
- **Absolute timeout**: 24 hours (configurable via `SecurityPolicy.category: "session"`)
- **Idle timeout**: Configurable via `SessionConfig.idleTimeoutMinutes`
- **Max concurrent sessions**: Configurable via `SessionConfig.maxConcurrentSessions`
- **Device fingerprint requirement**: Configurable via `SessionConfig.requireDeviceFingerprint`

### Session Operations

| Operation | Method | Description |
|---|---|---|
| Create | `createSession()` | New session after auth |
| Validate | `validateSession()` | Check session on each request |
| Update activity | `updateActivity()` | Refresh lastActivityAt |
| Revoke | `revokeSession()` | Terminate a specific session |
| Revoke all user | `revokeAllUserSessions()` | Force logout everywhere |
| Revoke all company | `revokeAllCompanySessions()` | Tenant-wide session invalidation |
| Cleanup expired | `cleanupExpiredSessions()` | Periodic maintenance |
| Get by device | `getSessionByDevice()` | Device-based session lookup |

## MFA Configuration

### Supported MFA Methods

| Method | Type | User Experience | Security Level |
|---|---|---|---|
| TOTP | Time-based OTP | Authenticator app (Google Auth, Authy, 1Password) | High |
| WebAuthn | Public-key crypto | Platform biometrics, security keys (YubiKey) | Very High |
| Email OTP | Email delivery | One-time code via email | Medium |

### MFA Enforcement

MFA can be enforced at multiple levels:

1. **Role-level**: Certain roles have `mfaRequired: true` in their definition
   - `system_administrator`, `enterprise_administrator`, `security_officer`
   - `treasury_manager`, `financial_controller`, `compliance_officer`
   - `approval_authority`, `auditor`, `risk_manager`, `connector_manager`
   - `api_access`
2. **Policy-level**: Custom MFA policies via `PolicyEngine` with `category: "mfa"`
3. **Organization-wide**: Enforce MFA for all users via `MFAConfig.required`

### MFA Enrollment Flow

```
Step 1: Administrator or user initiates MFA enrollment
Step 2: User selects method (TOTP, WebAuthn, Email OTP)
Step 3: For TOTP:
          - System generates shared secret
          - QR code displayed for authenticator app
          - User scans and submits verification code
Step 4: For WebAuthn:
          - Browser/platform creates credential
          - Public key stored, private key on device
Step 5: Audit record created: "mfa.enrolled"
Step 6: User added to MFA-enabled users
```

### Recovery Codes

When MFA is enrolled, users receive 8 one-time recovery codes:
- Each code can be used exactly once
- Stored as SHA-256 hashes in the database
- Can be regenerated (invalidates previous set)
- Used when authenticator device is unavailable

### Remember Device

`MFAConfig.rememberDeviceDays` allows trusted devices to skip MFA for a configurable period (default: 30 days). Trust is established via device fingerprint stored with the session.

## Source Code Reference

| File | Class/Method | Description |
|---|---|---|
| `src/server/identity/authentication.ts` | `AuthenticationService` | Core authentication logic |
| `src/server/identity/authentication.ts:31` | `login()` | Password-based login |
| `src/server/identity/authentication.ts:50` | `loginWithSSO()` | SSO federated login |
| `src/server/identity/authentication.ts:70` | `verifyMFA()` | MFA code verification |
| `src/server/identity/authentication.ts:88` | `verifyPasskey()` | WebAuthn passkey verification |
| `src/server/identity/authentication.ts:105` | `requestPasswordReset()` | Initiate password reset |
| `src/server/identity/authentication.ts:113` | `resetPassword()` | Token-based password reset |
| `src/server/identity/authentication.ts:132` | `validatePasswordStrength()` | Password policy validation |
| `src/server/identity/session-manager.ts` | `SessionManager` | Session lifecycle management |
| `src/server/identity/session-manager.ts:104` | `validateSession()` | Per-request session validation |
| `src/server/identity/policy-engine.ts` | `PolicyEngine` | Password/session policy evaluation |
| `src/server/iam/types.ts` | `MFAConfig`, `SessionConfig` | Configuration types |
| `src/server/iam/roles.ts` | `EnterpriseRoles` | MFA requirements per role |
