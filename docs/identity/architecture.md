# Identity Architecture — Perionyx Enterprise Finance Platform

**Version**: 1.0 | **Last Updated**: 2026-07-12

## System Overview

The Perionyx Identity & Access Management system provides a unified, multi-tenant identity layer for authentication, authorization, SSO, user provisioning, and security policy enforcement. The architecture is modular, with nine specialized services coordinated through a single `IdentityFacade` entry point.

The system is designed for enterprise finance environments where security, auditability, and tenant isolation are paramount. Every identity action is logged, every session is tracked, and every permission is validated against both RBAC roles and ABAC policies.

## Component Architecture

### Core Components

| Component | File | Responsibility |
|---|---|---|
| `IdentityFacade` | `identity-facade.ts` | Unified API, health check, user/company identity summaries |
| `IdentityProviderManager` | `identity-provider.ts` | CRUD for SAML/OIDC/OAuth2/LDAP/Entra ID/Google/Okta providers |
| `AuthenticationService` | `authentication.ts` | Password/passkey/MFA login, password reset, account lockout |
| `SessionManager` | `session-manager.ts` | Session lifecycle, device tracking, concurrent session limits |
| `UserProvisioningService` | `user-provisioning.ts` | SCIM provisioning, bulk import, sync from external directories |
| `GroupManager` | `group-manager.ts` | Group CRUD, membership, provider-synced groups |
| `RoleManager` | `role-manager.ts` | Role CRUD, assignment, clone, inheritance |
| `PermissionManager` | `permission-manager.ts` | Granular permission grant/revoke, templates |
| `PolicyEngine` | `policy-engine.ts` | Password/session/login/MFA policy evaluation |
| `AuditService` | `audit-service.ts` | Event recording, query, CSV export, summary |
| `SSOHandler` | `sso-handler.ts` | SAML/OIDC/OAuth2 flow initiation and callback handling |

### Supporting IAM Module

| Component | File | Responsibility |
|---|---|---|
| `EnterpriseRoles` | `iam/roles.ts` | 17 predefined role definitions with permissions, inheritance, MFA requirements |
| `PermissionRegistry` | `iam/permissions.ts` | 100+ granular permission definitions with category, scope, MFA flag |
| `ABACEvaluator` | `iam/abac.ts` | Basic ABAC evaluation stub |
| `ABACPolicyEngine` | `iam/abac.ts` | Policy-based ABAC evaluation with condition matching |
| `SessionConfig` | `iam/types.ts` | Session timeout, concurrent limit, device fingerprint config |

## Data Flow Diagrams

### Authentication Flow

```
User                    Proxy/API                IdentityFacade          AuthService          SessionManager
  │                        │                         │                     │                     │
  │──POST /auth/login─────►│──authenticate()────────►│──login()───────────►│                     │
  │                        │                         │                     │──verify password───►│
  │                        │                         │                     │◄────user data───────│
  │                        │                         │◄──AuthenticatedUser─│                     │
  │                        │                         │──createSession()────│────────────────────►│
  │                        │                         │◄──UserSession───────│─────────────────────│
  │◄─────200 + token──────│◄──AuthenticatedUser─────│                     │                     │
  │                        │                         │                     │                     │
  │──POST /auth/mfa───────►│──verifyMFA()──────────►│──verifyMFA()───────►│                     │
  │                        │                         │◄──verified user────│                     │
  │◄─────200 (MFA done)───│◄────────────────────────│                     │                     │
```

### SSO Flow (SAML)

```
User             Perionyx                IdentityProvider(IdP)         SSOHandler          AuthService
  │                  │                          │                         │                     │
  │──Login with SSO─►│──initiateSAML()─────────►│                         │                     │
  │                  │◄──redirect URL───────────│                         │                     │
  │◄──302 Redirect───│                          │                         │                     │
  │─────────────────►│──POST SAML Response─────►│──handleSAMLResponse()──►│                     │
  │                  │                          │                         │──loginWithSSO()────►│
  │                  │                          │                         │◄──AuthUser─────────│
  │◄────200 + token──│◄─────────────────────────│                         │                     │
```

### Authorization Flow

```
API Route               IdentityFacade              PermissionManager      RoleManager
    │                         │                          │                     │
    │──authorize()───────────►│                          │                     │
    │                         │──getUserPermissions()───►│                     │
    │                         │                          │──check RBAC────────►│
    │                         │                          │◄──role perms───────│
    │                         │◄──permissions[]─────────│                     │
    │                         │──hasPermission()────────►│                     │
    │                         │◄──boolean───────────────│                     │
    │                         │──evaluate ABAC──────────│                     │
    │◄────allow/deny─────────│                          │                     │
```

## Integration Points

| Integration | Direction | Mechanism |
|---|---|---|
| Identity Facade → Auth Service | Internal | Direct method calls on singleton |
| Identity Facade → Session Manager | Internal | Direct method calls on singleton |
| SSO Handler → Auth Service | Internal | `loginWithSSO()` method call |
| IAM PermissionRegistry | Import | Static registry consumed by PermissionManager |
| IAM EnterpriseRoles | Import | Static definitions consumed by RoleManager |
| IAM ABACPolicyEngine | Import | Policy evaluation consumed by routes |
| External Identity Providers | Outbound | HTTP redirects, POST bindings (SAML), OAuth2 flows |
| PgBoss Queue | Future | Async provisioning, deprovisioning events |
| Prisma | Future | Persistent storage for sessions, audit logs, policies |

## Authentication Flow (Detailed)

1. **User submits credentials** via `/api/auth/login` with email and password
2. **AuthenticationService.login()** validates credentials against stored hash
3. **On success**: returns `AuthenticatedUser` with user identity, roles, permissions
4. **SessionManager.createSession()** creates a `UserSession` with 24h default TTL
5. **If MFA required**: `AuthenticatedUser.mfaVerified` is `false`; user redirected to MFA
6. **MFA verification**: `verifyMFA()` or `verifyPasskey()` validates the second factor
7. **On MFA success**: session updated to `mfaVerified: true`
8. **AuditService.record()** logs every login attempt (success/failure) with IP, user agent

## Authorization Flow (Detailed)

1. **Incoming request** hits an API route with session token
2. **SessionManager.validateSession()** resolves the session and returns `AuthenticatedUser`
3. **Route handler** calls `IdentityFacade` authorization methods or checks permissions directly
4. **PermissionManager.hasPermission()** checks if the user has the required `GranularPermission`
5. **RoleManager.getUserRoles()** resolves role assignments, including inherited permissions
6. **ABACPolicyEngine.evaluate()** applies attribute-based conditions if configured
7. **Access granted** only if both RBAC and ABAC checks pass

## Session Flow

1. **Session created** with unique ID, device fingerprint, IP, user agent, auth method
2. **Session validated** on each request — checks `status === "active"` and `expiresAt > now`
3. **Activity updated** on each request via `updateActivity()`
4. **Session revoked** on logout, forced logout, password change, or admin action
5. **Expired sessions** cleaned up via `cleanupExpiredSessions()`
6. **Concurrent session limits** enforced by `getActiveSessions()` count

## Tenant Isolation

All identity operations are scoped to a `companyId`. Every component that stores state respects company-level filtering:
- `RoleManager.getRolesByCompany(companyId)` — roles scoped to tenant
- `GroupManager.getGroupsByCompany(companyId)` — groups scoped to tenant
- `IdentityProviderManager.getProvidersByCompany(companyId)` — IdPs scoped to tenant
- `AuditService.getAuditLogsByCompany(companyId)` — audit logs scoped to tenant
- `UserProvisioningService.getProvisionedUsersByCompany(companyId)` — users scoped to tenant
- `PolicyEngine.getPoliciesByCompany(companyId)` — policies scoped to tenant

## Source Code Map

```
src/server/identity/
  ├── types.ts                  — All identity types (providers, sessions, audit, etc.)
  ├── identity-provider.ts      — IdentityProviderManager
  ├── authentication.ts         — AuthenticationService
  ├── session-manager.ts        — SessionManager
  ├── user-provisioning.ts      — UserProvisioningService
  ├── group-manager.ts          — GroupManager
  ├── role-manager.ts           — RoleManager
  ├── permission-manager.ts     — PermissionManager
  ├── policy-engine.ts          — PolicyEngine
  ├── audit-service.ts          — AuditService
  ├── sso-handler.ts            — SSOHandler
  ├── identity-facade.ts        — IdentityFacade
  └── index.ts                  — Barrel exports

src/server/iam/
  ├── types.ts                  — IAM types (roles, permissions, ABAC, MFA, session config)
  ├── permissions.ts            — PermissionRegistry with 100+ permission definitions
  ├── roles.ts                  — EnterpriseRoles with 17 role definitions
  ├── abac.ts                   — ABACEvaluator, ABACPolicyEngine
  ├── mfa.ts                    — MFA types and configurations
  ├── session.ts                — Session configuration types
  ├── audit-events.ts           — Audit event definitions
  ├── admin.ts                  — Admin action types
  └── index.ts                  — Barrel exports
```
