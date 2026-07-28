# Identity Platform

**Platform**: IdentityPlatform
**Contract**: IdentityContract
**Mission**: Provide authentication, authorization, session management, and identity governance for all Perionyx users — supporting local credentials, SSO (SAML/OIDC), MFA, RBAC+ABAC, and multi-tenant identity isolation.
**Status**: Partially Built (identity 13 files, IAM 9 files, security 14 files, modules/identity 12 files, modules/rbac 7 files)
**Constitutional Authority**: PLATFORM_CONSTITUTION.md — Law 1 ("Business Domains Never Import Provider SDKs"), Law 5 ("Every External Dependency Is Observable")

---

## Responsibilities

1. **Authenticate** users via password, passkey, MFA (TOTP/WebAuthn), and SSO (SAML/OIDC)
2. **Authorize** access via RBAC (roles + permissions) and ABAC (attribute-based policies)
3. **Manage** user sessions (creation, expiry, revocation, device tracking)
4. **Provision** users from external identity providers (Entra ID, Google Workspace, Okta)
5. **Enforce** multi-factor authentication with TOTP and recovery codes
6. **Manage** groups, roles, and permissions with hierarchical inheritance
7. **Audit** every authentication and authorization event
8. **Protect** against brute force (rate limiting, account lockout)
9. **Rotate** credentials and enforce password policies
10. **Integrate** with external IdPs via SAML 2.0, OAuth 2.0, and OIDC
11. **Manage** OAuth 2.0 clients and API keys
12. **Enforce** SCIM-based user provisioning and deprovisioning
13. **Apply** ABAC policies for fine-grained access control
14. **Handle** password reset flows with secure token generation

---

## Public API (Capability Contract)

### IdentityContract

```typescript
interface IdentityContract {
  // Authentication
  login(ctx: LoginContext, credentials: LoginCredentials): Promise<AuthResult>;
  loginWithSSO(ctx: LoginContext, provider: string, token: string): Promise<AuthResult>;
  verifyMFA(userId: string, method: string, code: string): Promise<AuthResult>;
  verifyPasskey(userId: string, credentialId: string, signature: string): Promise<AuthResult>;
  logout(sessionId: string): Promise<void>;
  
  // Password Management
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  changePassword(userId: string, current: string, newPassword: string): Promise<void>;
  validatePasswordStrength(password: string): PasswordStrengthResult;
  
  // Session Management
  getSession(sessionId: string): Promise<UserSession | null>;
  listSessions(userId: string): Promise<UserSession[]>;
  revokeSession(sessionId: string): Promise<void>;
  revokeAllSessions(userId: string): Promise<void>;
  
  // User Management
  provisionUser(data: ProvisionUserData): Promise<ProvisionedUser>;
  deprovisionUser(externalId: string, provider: string): Promise<void>;
  
  // Role & Permission Management
  assignRole(userId: string, roleId: string, companyId: string): Promise<void>;
  revokeRole(userId: string, roleId: string, companyId: string): Promise<void>;
  grantPermission(userId: string, permission: string, companyId: string): Promise<void>;
  revokePermission(userId: string, permission: string, companyId: string): Promise<void>;
  checkPermission(userId: string, permission: string, companyId: string): Promise<boolean>;
  
  // Group Management
  createGroup(data: GroupData): Promise<IdentityGroup>;
  updateGroup(groupId: string, data: Partial<GroupData>): Promise<void>;
  deleteGroup(groupId: string): Promise<void>;
  addGroupMember(groupId: string, userId: string): Promise<void>;
  removeGroupMember(groupId: string, userId: string): Promise<void>;
  
  // Identity Provider Management
  registerIdP(config: IdentityProviderConfig): Promise<void>;
  updateIdP(id: string, config: Partial<IdentityProviderConfig>): Promise<void>;
  deleteIdP(id: string): Promise<void>;
  
  // Policy Management
  createPolicy(data: SecurityPolicyData): Promise<SecurityPolicy>;
  updatePolicy(policyId: string, data: Partial<SecurityPolicyData>): Promise<void>;
  deletePolicy(policyId: string): Promise<void>;
  
  // ABAC
  evaluatePolicy(subject: Subject, resource: Resource, action: string, context: Environment): Promise<PolicyDecision>;
  
  // Audit
  getAuditLog(filters: AuditFilters): Promise<PaginatedResult<AuditRecord>>;
  
  // Health
  getIdentityHealth(): Promise<IdentityHealth>;
}
```

---

## Internal API

### Module Architecture

| Module | Location | Purpose | Files |
|---|---|---|---|
| **Identity Core** | `src/server/identity/` | Authentication, session, provisioning, RBAC, policy, SSO, audit | 13 files |
| **IAM** | `src/server/iam/` | Permissions, roles, ABAC, MFA, sessions, admin, audit events | 9 files |
| **Security** | `src/server/security/` | Encryption, rate limiting, CSRF, input sanitization, secrets | 14 files |
| **Identity Modules** | `src/modules/identity/` | Identity provider adapters | 8+4 files |
| **RBAC** | `src/modules/rbac/` | Role-based access control | 7 files |

### Key Services

| Service | Location | Responsibility |
|---|---|---|
| `AuthenticationService` | `src/server/identity/authentication.ts` | Login, MFA, passkey, password reset |
| `SessionManager` | `src/server/identity/session-manager.ts` | Session lifecycle |
| `UserProvisioning` | `src/server/identity/user-provisioning.ts` | SCIM provisioning |
| `RoleManager` | `src/server/identity/role-manager.ts` | Role CRUD |
| `PermissionManager` | `src/server/identity/permission-manager.ts` | Permission CRUD |
| `GroupManager` | `src/server/identity/group-manager.ts` | Group CRUD |
| `PolicyEngine` | `src/server/identity/policy-engine.ts` | Security policy evaluation |
| `IdentityProviderManager` | `src/server/identity/identity-provider.ts` | IdP registration |
| `SSOHandler` | `src/server/identity/sso-handler.ts` | SAML/OIDC handling |
| `IdentityAuditService` | `src/server/identity/audit-service.ts` | Auth/authz audit |
| `IdentityFacade` | `src/server/identity/identity-facade.ts` | Unified entry point |
| `PermissionRegistry` | `src/server/iam/permissions.ts` | 64+ permission definitions |
| `ABACEngine` | `src/server/iam/abac.ts` | Attribute-based policies |
| `MFAService` | `src/server/iam/mfa.ts` | TOTP enrollment/verify |
| `AdminService` | `src/server/iam/admin.ts` | Admin operations |

### Identity Provider Adapters

| Adapter | Location | Protocol | Status |
|---|---|---|---|
| Local | `src/modules/identity/adapters/local.ts` | Password | Built |
| Entra ID | `src/modules/identity/adapters/entra-id.ts` | OIDC | Built |
| Google Workspace | `src/modules/identity/adapters/google-workspace.ts` | OIDC | Built |
| Stub (for testing) | `src/modules/identity/adapters/stub.ts` | Mock | Built |

---

## Events

### Authentication Events

| Event | Description | Severity |
|---|---|---|
| `login.success` | Successful login | info |
| `login.failed` | Failed login attempt | warning |
| `logout` | Normal logout | info |
| `logout.forced` | Admin-forced logout | warning |
| `mfa.enrolled` | MFA enrollment completed | info |
| `mfa.verified` | MFA verification succeeded | info |
| `mfa.failed` | MFA verification failed | warning |
| `mfa.recovery_used` | Recovery code used | warning |
| `password.changed` | Password changed | info |
| `password.reset` | Password reset completed | info |
| `password.reset_requested` | Password reset requested | info |

### Session Events

| Event | Description |
|---|---|
| `session.created` | Session created |
| `session.expired` | Session expired |
| `session.revoked` | Session revoked |

### User Management Events

| Event | Description |
|---|---|
| `user.created` | User provisioned |
| `user.updated` | User profile updated |
| `user.deleted` | User removed |
| `user.suspended` | User suspended |
| `user.activated` | User reactivated |

### Authorization Events

| Event | Description |
|---|---|
| `role.assigned` | Role assigned to user |
| `role.revoked` | Role revoked from user |
| `permission.granted` | Permission granted |
| `permission.revoked` | Permission revoked |

### Audit Event Types

```typescript
// Located at: src/server/identity/types.ts
type AuditEventType = 
  | "login.success" | "login.failed" | "logout" | "logout.forced"
  | "mfa.enrolled" | "mfa.verified" | "mfa.failed" | "mfa.recovery_used"
  | "password.changed" | "password.reset" | "password.reset_requested"
  | "session.created" | "session.expired" | "session.revoked"
  | "user.created" | "user.updated" | "user.deleted" | "user.suspended" | "user.activated"
  | "role.assigned" | "role.revoked" | "permission.granted" | "permission.revoked"
  | "group.created" | "group.updated" | "group.deleted" | "group.member_added" | "group.member_removed"
  | "identity_provider.created" | "identity_provider.updated" | "identity_provider.deleted"
  | "policy.created" | "policy.updated" | "policy.deleted"
  | "admin.action";
```

---

## Commands

| Command | Description | Permission |
|---|---|---|
| `login` | Authenticate user | Public |
| `loginWithSSO` | SSO authentication | Public |
| `verifyMFA` | Complete MFA challenge | Public |
| `logout` | End session | Authenticated |
| `resetPassword` | Reset forgotten password | Public (with token) |
| `changePassword` | Change own password | Authenticated |
| `provisionUser` | Create/update user from IdP | `admin.users` |
| `deprovisionUser` | Remove user from IdP | `admin.users` |
| `assignRole` | Assign role to user | `admin.roles` |
| `revokeRole` | Revoke role from user | `admin.roles` |
| `createGroup` | Create group | `admin.groups` |
| `deleteGroup` | Delete group | `admin.groups` |
| `registerIdP` | Register identity provider | `admin.providers` |
| `createPolicy` | Create security policy | `admin.policies` |

---

## Queries

| Query | Description | Cacheable |
|---|---|---|
| `getSession` | Get session by ID | Yes (30s) |
| `listSessions` | List user sessions | No |
| `checkPermission` | Check user permission | Yes (60s) |
| `getAuditLog` | Query audit records | No |
| `getIdentityHealth` | Identity health status | No (30s TTL) |
| `getPasswordStrength` | Evaluate password | No |

---

## Errors

| Code | Description | Recovery |
|---|---|---|
| `AUTH_INVALID_CREDENTIALS` | Wrong email/password | User retry |
| `AUTH_ACCOUNT_LOCKED` | Too many failed attempts | Wait or admin unlock |
| `AUTH_MFA_REQUIRED` | MFA verification needed | Complete MFA |
| `AUTH_MFA_INVALID` | Wrong MFA code | Retry code |
| `AUTH_SSO_FAILED` | SSO authentication failed | Check IdP config |
| `AUTH_TOKEN_EXPIRED` | Session/reset token expired | Re-authenticate |
| `AUTH_PASSWORD_TOO_WEAK` | Password below threshold | Use stronger password |
| `AUTHZ_INSUFFICIENT_PERMISSIONS` | Missing required permission | Grant permission |
| `AUTHZ_ROLE_CONFLICT` | Conflicting role assignment | Admin review |
| `IDENTITY_PROVIDER_UNAVAILABLE` | IdP unreachable | Check connectivity |
| `IDENTITY_USER_NOT_FOUND` | User does not exist | Check email |
| `IDENTITY_DUPLICATE_USER` | User already exists | Update existing |

---

## Security Model

### Authentication Security

1. **Password Hashing**: bcrypt with salt (cost factor 12+)
2. **Brute Force Protection**: Rate limiting + account lockout after 5 failures
   - Source: `src/server/security/rate-limiter.ts`
3. **Session Management**: Secure, HTTP-only cookies; 30s revocation cache on DB failure
   - Source: `src/server/identity/session-manager.ts`
4. **MFA**: TOTP with 10 recovery codes (SHA-256 hashed)
   - Source: `src/server/iam/mfa.ts`
5. **Passkey Support**: WebAuthn for passwordless auth
   - Source: `src/server/identity/authentication.ts:88`
6. **CSRF Protection**: Origin validation on state-changing endpoints
   - Source: `src/server/security/csrf.ts`
7. **Password Comparison**: Fail-closed (throws on mismatch, never returns false silently)

### Authorization Security

1. **RBAC**: 64+ granular permissions with scopes (global, company, resource)
   - Source: `src/server/iam/permissions.ts`
2. **ABAC**: Attribute-based policies for fine-grained control
   - Source: `src/server/iam/abac.ts`
3. **MFA Required Permissions**: 25+ permissions require MFA verification
4. **Tenant Isolation**: All queries scoped by `companyId`
5. **Admin Bypass Prevention**: Owner role does not bypass authorization checks

### Credential Security

1. **Encryption at rest**: AES-256-GCM for all secrets
   - Source: `src/server/security/encryption.ts`
2. **Secrets validation**: Environment variable validation at startup
   - Source: `src/server/security/secrets.ts`
3. **Demo password**: Generated per bootstrap (24-char random)
4. **Sandbox password**: Derived from HMAC — deterministic but not guessable

---

## Permission Model

### Permission Registry

```typescript
// Located at: src/server/iam/permissions.ts — 64+ permissions
interface GranularPermission {
  name: string;        // e.g., "workflow.read"
  category: string;    // e.g., "workflow"
  description: string;
  scopes: string[];    // ["global", "company", "resource"]
  requiresMfa: boolean;
}
```

### Permission Categories

| Category | Count | Examples |
|---|---|---|
| workflow | 8 | workflow.read, workflow.create, workflow.delete |
| treasury | 6 | treasury.read, treasury.transfer |
| ap | 8 | ap.invoices.read, ap.payments.execute |
| ar | 6 | ar.invoices.read, ar.collections.write |
| connector | 6 | connector.read, connector.sync, connector.admin |
| banking | 5 | banking.read, banking.sync, banking.pay |
| admin | 10 | admin.users, admin.roles, admin.groups, admin.providers |
| agents | 2 | agents.manage, agents.view |
| crm | 3 | crm.view, crm.manage, crm.delete |
| approvals | 2 | approvals.request, admin.approvals |
| governance | 4 | governance.read, governance.write, governance.violations |
| intelligence | 3 | intelligence.read, intelligence.execute |

### SoD (Segregation of Duties) Rules

12 SoD rules enforced (from `src/server/iam/permissions.ts`):
- User who creates a record cannot approve it
- User who proposes a payment cannot execute it
- User who configures a connector cannot be the sole admin

---

## Observability

### Metrics

| Metric | Type | Labels |
|---|---|---|
| `auth_login_total` | Counter | method, status, provider |
| `auth_login_duration_ms` | Histogram | method, provider |
| `auth_mfa_enrolled_total` | Counter | method |
| `auth_mfa_verify_total` | Counter | method, status |
| `auth_password_reset_total` | Counter | status |
| `auth_session_created_total` | Counter | method |
| `auth_session_expired_total` | Counter | reason |
| `authz_permission_check_total` | Counter | permission, status |
| `authz_policy_eval_total` | Counter | policy, decision |
| `identity_rate_limit_hits_total` | Counter | endpoint, reason |
| `identity_account_lockout_total` | Counter | reason |

### Tracing

```
Span: identity.login
  Attributes:
    identity.method = "password"
    identity.provider = "local"
    identity.company_id = "company_abc"
    identity.mfa_required = true
    identity.mfa_verified = true
    identity.session_id = "session_123"
  Events:
    identity.credential.verify
    identity.mfa.challenge
    identity.mfa.verify
    identity.session.create
    identity.audit.record
```

---

## Metrics

| Metric | Description | Alert |
|---|---|---|
| Login success rate | % successful logins | < 95% (investigate) |
| MFA adoption rate | % users with MFA | < 80% (nudge) |
| Session duration | Average session length | < 5min (investigate) |
| Password reset rate | Resets per 100 users/month | > 10 (policy review) |
| Account lockout rate | Lockouts per 1000 logins | > 5 (brute force?) |
| SSO failure rate | SSO auth failures | > 2% (IdP issue) |
| Permission check latency | p95 permission check time | > 100ms |

---

## Rate Limiting

| Operation | Limit | Window | Notes |
|---|---|---|---|
| Login (per email) | 5 attempts | 15 min | Account lockout after 5 |
| Login (per IP) | 20 attempts | 15 min | IP-level protection |
| Password reset | 3 requests | 1 hour | Token-based |
| MFA verify | 5 attempts | 15 min | Lockout after 5 |
| Session create | 10/hour | Rolling | Prevent session flooding |
| Admin operations | 50/hour | Rolling | Per admin user |

---

## Retry Policy

Identity operations are NOT retried automatically:

1. **Login**: User must retry manually (security)
2. **MFA**: User must retry manually (security)
3. **Password reset**: User must request new token
4. **SSO**: One attempt; failure returns to login page

The only retries are for infrastructure failures (DB timeout):
- Max retries: 2
- Backoff: Exponential 1s-4s

---

## Circuit Breakers

Identity operations do NOT use circuit breakers:

1. **Auth is synchronous**: Users cannot wait for circuit recovery
2. **Fail-closed**: Any infrastructure failure denies access (security-first)
3. **DB fallback**: 30s in-memory revocation cache on DB failure (from Phase 17.2)

---

## Caching

| Data | TTL | Location | Notes |
|---|---|---|---|
| Session data | Session lifetime | Memory + DB | DB is source of truth |
| Permission checks | 60 seconds | Memory | Revalidated on role change |
| Password strength rules | 1 hour | Memory | Rarely changes |
| Security policies | 5 minutes | Memory | Revalidated on policy change |
| Revocation cache | 30 seconds | Memory | DB failure fallback |

---

## Versioning

| Component | Versioning | Notes |
|---|---|---|
| IdentityContract | semver | Major for breaking changes |
| SAML/OIDC protocol | Provider-controlled | Adapter adapts |
| Permission definitions | Append-only | New permissions added, never removed |
| Audit event types | Append-only | New events added |

---

## Lifecycle

### User Lifecycle

```
Provision (from IdP or manual) → Active → MFA Enrolled → 
  → Session Created → Authenticated → Active Session →
  → Session Expired/Revoked →
  → Suspended (optional) → Deleted/Deactivated
```

### Session Lifecycle

```
Login → Session Created → Active → Idle → Expired
                       ↘ Revoked (manual or admin)
                       ↘ Forced Logout (admin)
```

### Identity Provider Lifecycle

```
Register → Configuring → Active → 
  → User Provisioning → Sync → 
  → Error (if IdP unreachable) → Active (auto-recover)
  → Retired
```

---

## Extension Model

### Adding a New Identity Provider

1. **Implement** IdP adapter (SAML/OIDC/OAuth2 handler)
2. **Register** in `IdentityProviderManager`
3. **Configure** attribute mapping (external → Perionyx canonical)
4. **Enable** auto-provisioning rules
5. **Write** integration tests against IdP sandbox
6. **Document** IdP-specific quirks

### Adding a New Permission

1. **Define** in `src/server/iam/permissions.ts`
2. **Assign** category, scopes, MFA requirement
3. **Add** to relevant role defaults
4. **Update** RBAC role definitions
5. **Write** permission check tests

---

## Provider Model

### Identity Provider Support

| Provider | Protocol | Provisioning | MFA | Status |
|---|---|---|---|---|
| Local (email/password) | N/A | Manual | TOTP | Built |
| Entra ID | OIDC | SCIM | TOTP/WebAuthn | Built |
| Google Workspace | OIDC | Manual | TOTP | Built |
| Okta | OIDC/SAML | SCIM | TOTP | Scaffolded |
| SAML 2.0 (generic) | SAML | Manual | N/A | Scaffolded |

### MFA Methods

| Method | Status | Recovery |
|---|---|---|
| TOTP (authenticator app) | Built | 10 recovery codes |
| WebAuthn (passkey) | Built | N/A |
| Email OTP | Scaffolded | N/A |

---

## Testing Strategy

| Test | Scope | Frequency |
|---|---|---|
| Unit | Password hashing, MFA, session management | Every PR |
| Integration | Login flow, SSO, MFA enrollment | Every PR |
| Security | Brute force protection, CSRF, session fixation | Every PR |
| RBAC | Permission checks, SoD enforcement | Every PR |
| ABAC | Policy evaluation | Every PR |
| E2E | Full login → MFA → session → permission flow | Nightly |
| Penetration | Auth bypass attempts | Monthly |

---

## Failure Modes

| Failure | Impact | Recovery |
|---|---|---|
| IdP unreachable | SSO login fails | Local auth fallback |
| DB failure | Session check fails | 30s in-memory revocation cache |
| MFA service down | MFA challenge fails | User retries; no bypass |
| Rate limit hit | Login blocked | User waits |
| Account lockout | User cannot login | Admin unlock or wait period |
| Token expiry | Session expires | Re-authenticate |
| Password leak detected | Security incident | Forced password reset |

---

## Recovery Strategy

1. **IdP Outage**: Local authentication available as fallback (where configured)
2. **DB Failure**: 30s in-memory revocation cache; sessions denied on cache miss
3. **MFA Failure**: No bypass — user must retry; admin can disable MFA for user in emergency
4. **Account Lockout**: Automatic unlock after 30 minutes; admin can unlock immediately
5. **Credential Leak**: Forced password reset; session revocation; audit alert
6. **Session Fixation**: Session ID regenerated on login; old session invalidated
7. **CSRF Attack**: Origin validation rejects cross-origin state-changing requests
