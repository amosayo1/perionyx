# Administrator Guide — Perionyx Identity & Access Management

**Version**: 1.0 | **Last Updated**: 2026-07-12

## Overview

This guide covers day-to-day administration of the Perionyx identity system. It is intended for enterprise administrators, security officers, and system administrators responsible for user management, access control, and security policy configuration.

## User Management

### Creating Users

Users can be created through:
1. **Manual creation** via admin API
2. **SSO auto-provisioning** (first login via IdP)
3. **SCIM provisioning** (from external directory)
4. **CSV import** (bulk user import)

### Manual User Creation

```typescript
// Create user account
const userId = authenticationService.registerUser(
  "john.doe@company.com", // email
  "TempPassword123!",     // initial password
  "John Doe",            // display name
  "company_456",         // company
)

// Assign role
roleManager.assignRole(userId, "treasury_analyst", "company_456", adminUserId)

// Assign group membership
groupManager.createGroup({
  name: "Treasury Team",
  description: "Treasury department team",
  memberCount: 0,
  roles: [],
  permissions: [],
  companyId: "company_456",
})
groupManager.addMember("grp_treasury", userId)
```

### User Provisioning States

| Status | Description |
|---|---|
| `pending` | Created but not yet synced with IdP |
| `synced` | Active and synchronized with IdP |
| `failed` | Provisioning failed (check audit logs) |
| `orphaned` | User exists but source IdP connection broken |

### Bulk User Import

```typescript
const result = userProvisioningService.importUsers({
  name: "users.csv",
  data: `externalId,email,firstName,lastName
emp001,jane@company.com,Jane,Smith
emp002,bob@company.com,Bob,Johnson`,
})
// Returns: { imported: 2, failed: 0, errors: [] }
```

CSV format: `externalId,email,firstName,lastName`

### User Lifecycle Operations

| Operation | Method | Description |
|---|---|---|
| Create | `registerUser()` | New user account |
| Suspend | `policyEngine.evaluateLoginPolicy()` | Block login access |
| Activate | — | Re-enable suspended account |
| Delete | — | Permanently remove user (audit-logged) |
| Deprovision | `deprovisionUser()` | Remove provisioned identity |

## Group Management

### Group Types

| Type | Source | Management |
|---|---|---|
| Local groups | Created in Perionyx | Manual member management |
| Synced groups | Imported from IdP | Auto-synced via SCIM/SAML |
| Dynamic groups | (Future) Rule-based membership | Automated |

### Creating Groups

```typescript
// Create a group
const group = groupManager.createGroup({
  name: "EU Treasury Approvers",
  description: "Treasury approvers in EU region",
  externalId: "eu_treasury_approvers",       // Mapping to IdP group
  source: "azure_ad",                          // Source provider
  memberCount: 0,
  roles: ["approval_authority"],
  permissions: ["treasury.read"],
  companyId: "company_456",
})

// Add members
groupManager.addMember(group.id, "user_123")
groupManager.addMember(group.id, "user_456")

// Remove members
groupManager.removeMember(group.id, "user_456")

// Get group members
const members = groupManager.getMembers(group.id)
```

### Group Sync from IdP

Groups can be synchronized from external identity providers:

```typescript
// Sync group membership from IdP
groupManager.syncGroupFromProvider("eu_treasury_approvers", [
  "user_123",
  "user_456",
  "user_789",  // New member — will be added
  // "user_456" removed — will be removed
])
```

## Role Management

### Predefined Roles

The system includes 17 predefined roles across 6 categories:

| Role | Category | MFA | Session Limit |
|---|---|---|---|
| `system_administrator` | Administration | Required | 8 hours |
| `enterprise_administrator` | Administration | Required | 12 hours |
| `department_manager` | Administration | Optional | 24 hours |
| `security_officer` | Security | Required | 8 hours |
| `risk_manager` | Security | Required | 12 hours |
| `treasury_manager` | Treasury | Required | 12 hours |
| `treasury_analyst` | Treasury | Optional | 24 hours |
| `financial_controller` | Treasury | Required | 12 hours |
| `compliance_officer` | Compliance | Required | 12 hours |
| `approval_authority` | Compliance | Required | 12 hours |
| `auditor` | Compliance | Required | 24 hours |
| `operations_manager` | Operations | Optional | 24 hours |
| `connector_manager` | Operations | Required | 12 hours |
| `workflow_developer` | Operations | Optional | 24 hours |
| `api_access` | Operations | Required | 720 hours |
| `support_agent` | Operations | Optional | 24 hours |
| `read_only_executive` | Read-only | Optional | 48 hours |

### Assigning Roles

```typescript
// Assign role to user
roleManager.assignRole(
  "user_123",               // User ID
  "treasury_manager",       // Role ID
  "company_456",            // Company/tenant
  "admin_789",              // Admin who performed action
)

// Verify assignment
const userRoles = roleManager.getUserRoles("user_123", "company_456")
console.log(userRoles) // ["treasury_manager"]

// Revoke role
roleManager.revokeRole("user_123", "treasury_manager", "company_456")
```

### Custom Roles

Administrators can create custom roles by cloning existing roles:

```typescript
// Clone treasury_manager with custom name
const customRole = roleManager.cloneRole(
  "treasury_manager",
  "vp_treasury_emea",
  "VP Treasury - EMEA",
)

// Or create from scratch
roleManager.createRole({
  id: "regional_treasury_eu",
  name: "EU Regional Treasury",
  description: "Treasury operations restricted to EU region",
  category: "treasury",
  permissions: [
    "treasury.read",
    "treasury.transfer",
    "wallets.read",
    "approvals.view",
  ],
  inherits: [],
  isCustom: true,
  companyId: "company_456",
})
```

## Policy Configuration

### Password Policies

Password policies control password complexity, length, and rotation:

```typescript
policyEngine.createPolicy({
  name: "Finance Password Policy",
  category: "password",
  enabled: true,
  settings: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireDigit: true,
    requireSpecial: true,
    minComplexity: 3,
    maxAgeDays: 90,
    passwordHistory: 5,
  },
  priority: 10,
  companyId: "company_456",
})
```

Recommended settings by role category:

| Category | Min Length | Complexity | Rotation |
|---|---|---|---|
| Administration | 16 | 4/4 types | 60 days |
| Security | 16 | 4/4 types | 60 days |
| Treasury | 12 | 3/4 types | 90 days |
| Compliance | 12 | 3/4 types | 90 days |
| Operations | 10 | 3/4 types | 90 days |
| Read-only | 8 | 2/4 types | 180 days |

### Session Policies

```typescript
policyEngine.createPolicy({
  name: "Standard Session Policy",
  category: "session",
  enabled: true,
  settings: {
    idleTimeoutMinutes: 30,
    absoluteTimeoutHours: 24,
    maxConcurrentSessions: 5,
    requireDeviceFingerprint: false,
  },
  priority: 10,
  companyId: "company_456",
})
```

Recommended settings by risk level:

| Risk Level | Idle Timeout | Absolute Timeout | Max Sessions |
|---|---|---|---|
| Low (read-only) | 60 min | 48 hours | 10 |
| Medium (operations) | 30 min | 24 hours | 5 |
| High (treasury) | 15 min | 12 hours | 3 |
| Critical (admin) | 10 min | 8 hours | 2 |

### MFA Policies

```typescript
policyEngine.createPolicy({
  name: "Treasury MFA Enforcement",
  category: "mfa",
  enabled: true,
  settings: {
    requireMfa: true,
    gracePeriodDays: 7,
    allowedMethods: ["totp", "webauthn"],
    rememberDeviceDays: 30,
  },
  priority: 50,
  companyId: "company_456",
})
```

### Login Policies

```typescript
policyEngine.createPolicy({
  name: "Login Restrictions",
  category: "login",
  enabled: true,
  settings: {
    maxFailedAttempts: 5,
    lockoutDurationMinutes: 30,
    lockoutWindowMinutes: 15,
    allowedHours: [],                          // Empty = 24/7
    allowedIpRanges: ["10.0.0.0/8", "172.16.0.0/12"],
    blockedCountries: [],
  },
  priority: 100,
  companyId: "company_456",
})
```

## Provider Setup

### Configuring an Identity Provider

1. **Register the provider** in the identity provider registry
2. **Configure endpoints** based on the IdP type
3. **Set up attribute mapping** to map IdP attributes to Perionyx fields
4. **Configure domain allowlist** for email domain restrictions
5. **Enable auto-provisioning** to create users automatically
6. **Assign default roles** for auto-provisioned users
7. **Test the flow** end-to-end

### Provider Configuration Checklist

```typescript
identityProviderManager.registerProvider({
  // Required fields
  id: "azure_ad_perionyx",
  type: "azure_ad",
  name: "Perionyx Azure AD",
  status: "active",
  clientId: process.env.AZURE_CLIENT_ID,
  clientSecret: process.env.AZURE_CLIENT_SECRET,

  // Endpoints (varies by type)
  issuerUrl: "https://login.microsoftonline.com/{tenant}/v2.0",
  authorizationUrl: "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize",
  tokenUrl: "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token",
  userInfoUrl: "https://graph.microsoft.com/oidc/userinfo",

  // Attribute mapping
  attributeMapping: {
    email: "email",
    firstName: "given_name",
    lastName: "family_name",
  },

  // Access control
  allowedDomains: ["perionyx.com"],
  autoProvision: true,
  defaultRoles: ["read_only_executive"],
  enabled: true,
  companyId: "company_456",
})
```

### Provider Status Monitoring

| Status | Meaning | Action Required |
|---|---|---|
| `active` | Provider operational | None |
| `inactive` | Provider disabled | Enable to activate |
| `error` | Provider configuration error | Check endpoints, credentials |
| `configuring` | Setup in progress | Complete configuration |

## Audit Review

### Audit Dashboard

Key metrics to monitor:

| Metric | What to Watch | Action |
|---|---|---|
| Failed logins | Spike indicates brute force | Review IPs, enable rate limiting |
| MFA failures | Multiple failures per user | Contact user, verify device |
| Permission changes | Unexpected grants | Investigate, revert if unauthorized |
| Role assignments | New admin roles | Verify with change management |
| User deletion | Unauthorized removal | Restore from backup, investigate |
| Session revocations | Forced logouts | Check revocation reason |

### Common Audit Queries

```typescript
// All failed logins in last 24 hours
const failedLogins = auditService.getAuditLogsByEventType("login.failed")
  .filter(r => r.timestamp > new Date(Date.now() - 86400000))

// Critical events this week
const criticalEvents = auditService.getAuditLogsBySeverity("critical")
  .filter(r => r.timestamp > new Date(Date.now() - 604800000))

// All actions by a specific admin
const adminActions = auditService.getAuditLogsByUser("admin_789")

// Permission changes
const permChanges = auditService.getAuditLogs().filter(r =>
  ["permission.granted", "permission.revoked"].includes(r.eventType)
)

// Export for compliance
const csvExport = auditService.exportCsv("company_456")
```

### Audit Summary Report

```typescript
const summary = auditService.getAuditSummary()
// {
//   total: 15234,
//   byEventType: {
//     "login.success": 12000,
//     "login.failed": 234,
//     "session.created": 11500,
//     // ...
//   },
//   bySeverity: {
//     info: 14500,
//     warning: 600,
//     error: 100,
//     critical: 34,
//   },
//   criticalCount: 34,
// }
```

## Security Administration

### Password Reset

```typescript
// User requests reset
authenticationService.requestPasswordReset("john.doe@company.com")

// Admin forces reset (no token required)
authenticationService.changePassword(userId, currentPassword, newPassword)
```

### Session Management

```typescript
// View active sessions
const activeSessions = sessionManager.getActiveSessions(userId)

// Force logout a specific session
sessionManager.revokeSession(sessionId, "admin_forced")

// Force logout all user sessions
sessionManager.revokeAllUserSessions(userId, "password_change")

// Force logout entire company (security incident)
sessionManager.revokeAllCompanySessions("company_456", "security_incident")

// Cleanup expired sessions
const expired = sessionManager.cleanupExpiredSessions()
```

### Account Suspension

```typescript
// Suspend user (prevent login)
// Mark user as locked in authentication service
// The login method will reject with "Invalid credentials or account locked"
```

### Security Incident Response

1. **Identify affected accounts** via audit logs
2. **Revoke all sessions** for compromised users (`revokeAllUserSessions()`)
3. **Force password reset** for affected users
4. **Review recent permission changes** and role assignments
5. **Check SSO provider logs** for unauthorized access attempts
6. **Enable enhanced audit logging** for affected accounts
7. **Document incident** and required remediation steps

## Maintenance Tasks

### Daily

- Review failed login attempts
- Check provider health status
- Verify session counts within normal range

### Weekly

- Review audit logs for suspicious patterns
- Verify MFA enrollment compliance
- Check certificate expiry dates

### Monthly

- Review role assignments for unused roles
- Audit custom role permissions
- Revoke orphaned sessions
- Generate compliance audit report

### Quarterly

- Rotate provider certificates if near expiry
- Review and update security policies
- Conduct user access review
- Update default role permissions if needed
- Test disaster recovery procedures

## Common Administrative Tasks

| Task | Method | Notes |
|---|---|---|
| View user identity summary | `identityFacade.getUserIdentitySummary()` | Roles, permissions, sessions, MFA |
| View company identity status | `identityFacade.getCompanyIdentityStatus()` | SSO, MFA compliance, security score |
| List all providers | `identityProviderManager.getAllProviders()` | Filter by company, type |
| List all roles | `roleManager.getAllRoles()` | Filter by company |
| List all groups | `groupManager.getAllGroups()` | Filter by company |
| List all policies | `policyEngine.getAllPolicies()` | Filter by company, category |
| Export audit logs | `auditService.exportCsv()` | Filter by company |
| Health check | `identityFacade.health()` | Provider, user, session, audit counts |

## Source Code Reference

| File | Class/Method | Description |
|---|---|---|
| `src/server/identity/authentication.ts` | `AuthenticationService` | User registration, login, password management |
| `src/server/identity/role-manager.ts` | `RoleManager` | Role assignment, CRUD |
| `src/server/identity/group-manager.ts` | `GroupManager` | Group management, membership |
| `src/server/identity/permission-manager.ts` | `PermissionManager` | Permission grant/revoke, templates |
| `src/server/identity/policy-engine.ts` | `PolicyEngine` | Security policy management |
| `src/server/identity/audit-service.ts` | `AuditService` | Audit logging and export |
| `src/server/identity/session-manager.ts` | `SessionManager` | Session lifecycle management |
| `src/server/identity/user-provisioning.ts` | `UserProvisioningService` | User provisioning and import |
| `src/server/identity/identity-provider.ts` | `IdentityProviderManager` | Provider configuration |
| `src/server/identity/identity-facade.ts` | `IdentityFacade` | Unified API for identity operations |
