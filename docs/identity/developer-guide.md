# Developer Guide — Perionyx Identity & Access Management

**Version**: 1.0 | **Last Updated**: 2026-07-12

## Module Structure

The identity system is split across two modules:

```
src/server/identity/          # Runtime identity services (13 files)
  ├── types.ts                # All identity types
  ├── identity-provider.ts    # IdentityProviderManager
  ├── authentication.ts       # AuthenticationService
  ├── session-manager.ts      # SessionManager
  ├── user-provisioning.ts    # UserProvisioningService
  ├── group-manager.ts        # GroupManager
  ├── role-manager.ts         # RoleManager
  ├── permission-manager.ts   # PermissionManager
  ├── policy-engine.ts        # PolicyEngine
  ├── audit-service.ts        # AuditService
  ├── sso-handler.ts          # SSOHandler
  ├── identity-facade.ts      # IdentityFacade
  └── index.ts                # Barrel exports

src/server/iam/               # Type definitions and registries (8 files)
  ├── types.ts                # IAM types (roles, permissions, ABAC, MFA)
  ├── permissions.ts          # PermissionRegistry (100+ permissions)
  ├── roles.ts                # EnterpriseRoles (17 role definitions)
  ├── abac.ts                 # ABACEvaluator, ABACPolicyEngine
  ├── mfa.ts                  # MFA types
  ├── session.ts              # Session configuration types
  ├── audit-events.ts         # Audit event definitions
  ├── admin.ts                # Admin action types
  └── index.ts                # Barrel exports
```

### Architecture Pattern

Each service follows a consistent pattern:

1. **Class-based** with static factory for singleton instantiation
2. **In-memory storage** via `Map` (ephemeral per process)
3. **Direct constructor dependency** — all services instantiate their own dependencies
4. **Singleton export** at module level (e.g., `export const authenticationService = new AuthenticationService()`)
5. **Facade access** via `IdentityFacade` which exposes all services as properties

### Singleton Pattern

```typescript
// Each service exports a singleton
export const authenticationService = new AuthenticationService()
export const sessionManager = new SessionManager()
export const identityFacade = new IdentityFacade()

// Facade composes all services
class IdentityFacade {
  providers = identityProviderManager
  auth = authenticationService
  sessions = sessionManager
  // ...etc
}
```

## Using the Facade

### Importing

```typescript
import { identityFacade } from "~/server/identity"
// or specific services
import { authenticationService, sessionManager } from "~/server/identity"
```

### Authentication

```typescript
// Login
const user = identityFacade.auth.login("user@company.com", "password123", "192.168.1.1", "Mozilla/5.0...")
// Returns AuthenticatedUser with sessionId

// Create session
const session = identityFacade.sessions.createSession(
  user.id, user.email, user.companyId, "192.168.1.1", "Mozilla/5.0...", "password"
)

// Validate session on each request
const authUser = identityFacade.sessions.validateSession(sessionId)
if (!authUser) throw new Error("Unauthorized")

// Logout
identityFacade.sessions.revokeSession(sessionId, "user_logout")
identityFacade.audit.record({
  eventType: "logout",
  userId: userId,
  severity: "info",
  details: "User initiated logout",
  metadata: { sessionId },
})
```

### Authorization

```typescript
// Check role
const userRoles = identityFacade.roles.getUserRoles(userId, companyId)
const isAdmin = userRoles.includes("enterprise_administrator")

// Check permission
const hasTransferPerm = identityFacade.permissions.hasPermission(userId, "treasury.transfer", companyId)

// Get all permissions for a user
const perms = identityFacade.permissions.getUserPermissions(userId, companyId)

// Grant permission
identityFacade.permissions.grantPermission(userId, "treasury.reverse", "company", companyId, adminUserId)
identityFacade.audit.record({
  eventType: "permission.granted",
  userId: userId,
  severity: "info",
  details: `Granted treasury.reverse to user`,
  metadata: { grantedBy: adminUserId },
})
```

### SSO

```typescript
// Initiate SAML login
const { redirectUrl, requestId } = identityFacade.sso.initiateSAML(providerId)
// Redirect user to redirectUrl

// Handle SAML response
const user = identityFacade.sso.handleSAMLResponse(providerId, samlResponse, ip, ua)

// Generate SP metadata
const metadata = identityFacade.sso.generateSAMLMetadata(providerId)
```

### User Provisioning

```typescript
// Provision a user from external directory
const provisioned = identityFacade.provisioning.provisionUser({
  externalId: "ext_12345",
  email: "user@company.com",
  firstName: "John",
  lastName: "Doe",
  source: "azure_ad",
  status: "synced",
  groups: ["Treasury"],
  roles: ["treasury_analyst"],
  companyId: "company_456",
})

// Sync user attributes from IdP
const synced = identityFacade.provisioning.syncUser("ext_12345", {
  email: "john.doe@company.com",
  firstName: "John",
  department: "Finance",
})
```

### Audit Logging

```typescript
// Record an event
identityFacade.audit.record({
  eventType: "admin.action",
  userId: "admin_123",
  userEmail: "admin@company.com",
  targetId: "user_456",
  targetType: "user",
  details: "Suspended user due to security policy violation",
  ipAddress: "10.0.0.1",
  userAgent: "Admin Dashboard",
  severity: "critical",
  companyId: "company_456",
  sessionId: "sess_789",
  metadata: {
    reason: "policy_violation",
    policyId: "pol_123",
  },
})

// Query audit
const criticalEvents = identityFacade.audit.getAuditLogsBySeverity("critical")
const recent = identityFacade.audit.getRecentLogs(50)

// Export CSV
const csv = identityFacade.audit.exportCsv("company_456")
```

### Identity Summary

```typescript
// User-level summary
const userSummary = identityFacade.getUserIdentitySummary(userId, companyId)
// Returns: { userId, email, roles, permissions, groups, mfaEnabled, activeSessions, ...securityScore }

// Company-level summary
const companyStatus = identityFacade.getCompanyIdentityStatus(companyId)
// Returns: { totalUsers, activeSessions, ssoEnabled, mfaCompliance, overallSecurityScore, ... }

// Health check
const health = identityFacade.health()
// Returns: { status, providerCount, userCount, sessionCount, auditCount }
```

## Adding New Providers

### Step 1: Register Provider Type

Add the new provider type to `IdentityProviderType` union in `types.ts`:

```typescript
export type IdentityProviderType = "saml" | "oidc" | "oauth2" | "ldap" | "azure_ad" | "google_workspace" | "okta" | "your_new_provider"
```

### Step 2: Implement SSO Flow

In `sso-handler.ts`, add initiation and callback methods:

```typescript
initiateNewProvider(providerId: string): { redirectUrl: string; state: string } {
  // Generate state, build redirect URL
  return { redirectUrl, state }
}

handleNewProviderCallback(providerId: string, code: string, state: string, ip: string, ua: string): AuthenticatedUser {
  // Exchange code for tokens
  // Validate tokens
  // Map attributes
  return authenticationService.loginWithSSO(providerId, token, ip, ua)
}
```

### Step 3: Add Provider Configuration

Register the provider via `IdentityProviderManager`:

```typescript
identityProviderManager.registerProvider({
  id: "custom_provider",
  type: "your_new_provider",
  name: "Custom SSO Provider",
  status: "active",
  // ...provider-specific configuration
  attributeMapping: { /* ... */ },
  allowedDomains: ["company.com"],
  autoProvision: true,
  enabled: true,
  companyId: "company_456",
})
```

### Step 4: Wire Routes

Add API routes for the new provider's callback:

```typescript
// POST /auth/{providerId}/callback
export async function POST(req: Request, { params }: { params: { providerId: string } }) {
  const formData = await req.formData()
  const user = ssoHandler.handleNewProviderCallback(
    params.providerId,
    formData.get("code") as string,
    formData.get("state") as string,
    req.headers.get("x-forwarded-for") ?? "unknown",
    req.headers.get("user-agent") ?? "unknown",
  )
  return Response.json({ user })
}
```

## Extending Authentication

### Adding a New Authentication Method

1. Add method to `AuthenticationMethod` union in `types.ts`
2. Add method handler in `AuthenticationService` (e.g., `loginWithMagicLink()`)
3. Add session creation with the new method in `SessionManager`
4. Add audit event type if not already covered
5. Wire the route handler

### Custom Password Validation

Extend `PolicyEngine.evaluatePasswordPolicy()`:

```typescript
// Add a new policy setting
if (settings.requirePattern && !new RegExp(settings.requirePattern).test(password)) {
  errors.push(`Password must match pattern: ${settings.patternDescription}`)
}
```

### Custom Session Validation

Extend `SessionManager.validateSession()`:

```typescript
// Add custom checks before returning session
if (session.authenticationMethod === "password" && !session.mfaVerified) {
  // Force MFA verification for password-based sessions
  return null
}
```

## Testing Patterns

### Unit Test Structure

```typescript
import { authenticationService } from "~/server/identity"
import { sessionManager } from "~/server/identity"
import { auditService } from "~/server/identity"
import { permissionManager } from "~/server/identity"

describe("AuthenticationService", () => {
  beforeEach(() => {
    // Reset state between tests (services use in-memory storage)
    // Note: In-memory maps persist — tests should be isolated
  })

  it("should register and authenticate a user", () => {
    const userId = authenticationService.registerUser(
      "test@perionyx.com", "Password123!", "Test User", "company_456",
    )
    const user = authenticationService.login(
      "test@perionyx.com", "Password123!", "127.0.0.1", "test-agent",
    )
    expect(user.email).toBe("test@perionyx.com")
    expect(user.id).toBe(userId)
  })

  it("should reject invalid credentials", () => {
    authenticationService.registerUser(
      "test@perionyx.com", "Password123!", "Test User", "company_456",
    )
    expect(() => {
      authenticationService.login(
        "test@perionyx.com", "wrong_password", "127.0.0.1", "test-agent",
      )
    }).toThrow("Invalid credentials or account locked")
  })

  it("should validate password strength", () => {
    const weak = authenticationService.validatePasswordStrength("short")
    expect(weak.valid).toBe(false)
    expect(weak.feedback.length).toBeGreaterThan(0)

    const strong = authenticationService.validatePasswordStrength("Str0ng!Pass")
    expect(strong.valid).toBe(true)
    expect(strong.score).toBeGreaterThanOrEqual(70)
  })
})
```

### Integration Test Example

```typescript
describe("IdentityFacade", () => {
  it("should provide user identity summary", () => {
    const userId = authenticationService.registerUser(
      "exec@perionyx.com", "Password123!", "Executive User", "company_456",
    )
    roleManager.assignRole(userId, "read_only_executive", "company_456", "system")
    sessionManager.createSession(userId, "exec@perionyx.com", "company_456", "10.0.0.1", "test", "password")

    const summary = identityFacade.getUserIdentitySummary(userId, "company_456")
    expect(summary.roles).toContain("read_only_executive")
    expect(summary.activeSessions).toBe(1)
    expect(summary.securityScore).toBeGreaterThanOrEqual(50)
  })

  it("should report company identity status", () => {
    // Setup users, sessions, providers, policies
    const status = identityFacade.getCompanyIdentityStatus("company_456")
    expect(status.totalUsers).toBeDefined()
    expect(status.overallSecurityScore).toBeGreaterThanOrEqual(0)
  })
})
```

### Mocking

For tests that shouldn't hit identity services:

```typescript
// Mock the facade
jest.mock("~/server/identity", () => ({
  identityFacade: {
    auth: {
      login: jest.fn(),
      validatePasswordStrength: jest.fn(),
    },
    sessions: {
      validateSession: jest.fn(),
      createSession: jest.fn(),
    },
    permissions: {
      hasPermission: jest.fn().mockReturnValue(true),
    },
    audit: {
      record: jest.fn(),
    },
  },
}))
```

### Testing ABAC Policies

```typescript
describe("ABACPolicyEngine", () => {
  it("should evaluate policy conditions", () => {
    abacPolicyEngine.addPolicy({
      id: "test_policy",
      name: "Test Deny High Risk",
      effect: "deny",
      permissions: ["treasury.transfer"],
      conditions: [
        { attribute: "riskLevel", operator: "eq", value: "critical" },
      ],
      priority: 100,
      description: "Deny transfers at critical risk level",
    })

    const result = abacPolicyEngine.evaluate(
      "treasury.transfer",
      { riskLevel: "critical" },
      {},
    )
    expect(result.allowed).toBe(false)
    expect(result.matchedPolicy).toBe("Test Deny High Risk")
  })
})
```

## Common Development Tasks

### Adding a New Granular Permission

```typescript
// 1. Add to GranularPermission union in src/server/iam/types.ts
export type GranularPermission =
  | "workflow.read"
  // ... existing
  | "treasury.forecast"    // ← New permission

// 2. Add to PermissionRegistry in src/server/iam/permissions.ts
const PERMISSION_DEFINITIONS: PermissionMeta[] = [
  // ... existing
  {
    name: "treasury.forecast",
    category: "treasury",
    description: "View and generate cash flow forecasts",
    scopes: ["global", "company"],
    requiresMfa: false,
  },
]

// 3. Add to relevant role definitions in src/server/iam/roles.ts
{
  id: "treasury_manager",
  permissions: [
    "treasury.read",
    "treasury.forecast",  // ← Added to role
    // ...
  ],
}
```

### Adding a New Enterprise Role

```typescript
// 1. Add to EnterpriseRoleId union in src/server/iam/types.ts
export type EnterpriseRoleId =
  | "system_administrator"
  // ... existing
  | "treasury_forecast_analyst"  // ← New role

// 2. Add to ROLE_DEFINITIONS in src/server/iam/roles.ts
{
  id: "treasury_forecast_analyst",
  name: "Treasury Forecast Analyst",
  description: "Creates and manages cash flow forecasts",
  category: "treasury",
  permissions: [
    "treasury.read",
    "treasury.forecast",
    "analytics.read",
    "reporting.read",
    "reporting.create",
  ],
  inherits: [],
  mfaRequired: false,
  maxSessionLifetimeHours: 24,
  sandboxRestricted: false,
},
```

## Source Code Reference

| File | Purpose |
|---|---|
| `src/server/identity/index.ts` | Barrel exports — import entry point |
| `src/server/identity/identity-facade.ts` | Facade — recommended entry point |
| `src/server/identity/types.ts` | Identity type definitions |
| `src/server/iam/types.ts` | IAM type definitions |
| `src/server/iam/permissions.ts` | Permission registry |
| `src/server/iam/roles.ts` | Role definitions |
| `src/server/iam/abac.ts` | ABAC policy engine |
