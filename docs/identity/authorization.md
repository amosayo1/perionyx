# Authorization — Perionyx Identity & Access Management

**Version**: 1.0 | **Last Updated**: 2026-07-12

## Overview

The Perionyx authorization system combines Role-Based Access Control (RBAC) with Attribute-Based Access Control (ABAC) for fine-grained, context-aware permission management. RBAC handles "who can do what" while ABAC handles "under what conditions." Both must pass for an action to be authorized.

## Permission Hierarchy

```
GranularPermission (100+ permissions)
  ├── Domain prefix (e.g., "workflow", "treasury", "approvals")
  └── Action suffix (e.g., "read", "create", "update", "delete")
      └── Examples: workflow.read, treasury.transfer, approvals.approve

Permission evaluation order:
  1. RBAC role-based permissions (from role assignments)
  2. Direct user-granted permissions (overrides)
  3. Group-inherited permissions (from group membership)
  4. ABAC policy conditions (attribute-based restrictions)
```

## RBAC (Role-Based Access Control)

### Role Structure

Roles are defined in `src/server/iam/roles.ts` with the following structure:

```typescript
interface EnterpriseRoleDefinition {
  id: EnterpriseRoleId;           // Unique role identifier
  name: string;                   // Human-readable name
  description: string;            // Purpose and responsibilities
  category: EnterpriseRoleCategory; // Grouping (administration, security, treasury, etc.)
  permissions: GranularPermission[]; // Associated permissions
  inherits: EnterpriseRoleId[];   // Parent roles to inherit from
  mfaRequired: boolean;           // MFA enforced for this role
  maxSessionLifetimeHours: number; // Maximum session duration
  sandboxRestricted: boolean;     // Sandbox-only access
  approverThreshold?: number;     // Approval threshold amount
  approvalLimit?: number;         // Maximum approval authority
}
```

### Role Categories

| Category | Roles | Description |
|---|---|---|
| Administration | `system_administrator`, `enterprise_administrator`, `department_manager` | System and company-level administration |
| Security | `security_officer`, `risk_manager` | Security policies, MFA, SSO, risk management |
| Treasury | `treasury_manager`, `treasury_analyst`, `financial_controller` | Treasury operations and management |
| Compliance | `compliance_officer`, `approval_authority`, `auditor` | Audit, compliance, approval authority |
| Operations | `operations_manager`, `connector_manager`, `workflow_developer`, `api_access`, `support_agent` | Day-to-day operations |
| Read-only | `read_only_executive` | Executive oversight, no mutations |

### Role Inheritance

Roles can inherit permissions from parent roles. For example, `department_manager` inherits from `read_only_executive`:

```typescript
{
  id: "department_manager",
  inherits: ["read_only_executive"],
  permissions: [
    "treasury.read", "approvals.view", "analytics.read",
    "analytics.export", "reporting.read", "reporting.create",
    "reporting.schedule", "audit.read", "risk.read",
    "onboarding.read", "workflow.read", "automation.read",
  ],
}
```

Inheritance is resolved by `EnterpriseRoles.getPermissions()` which computes the union of the role's own permissions and all inherited permissions recursively.

## ABAC (Attribute-Based Access Control)

### Attribute Definitions

ABAC policies evaluate user and resource attributes:

| Attribute | Type | Values | Description |
|---|---|---|---|
| `department` | enum | `finance`, `engineering`, `operations`, `compliance`, `executive`, `hr`, `legal` | User's department |
| `region` | enum | `us`, `eu`, `apac`, `latam`, `mea` | Geographic region |
| `legalEntity` | string | Free-form | Legal entity identifier |
| `costCenter` | string | Free-form | Cost center code |
| `approvalLimit` | number | Numeric | Maximum approval amount |
| `riskLevel` | enum | `low`, `medium`, `high`, `critical` | Transaction risk tier |
| `walletId` | string | Free-form | Restricted wallet access |
| `workflowId` | string | Free-form | Scoped workflow access |
| `connectorType` | string | Free-form | Connector type restriction |

### ABAC Policy Structure

```typescript
interface ABACPolicy {
  id: string;
  name: string;
  effect: "allow" | "deny";
  permissions: GranularPermission[];
  conditions: ABACCondition[];
  priority: number;
  description: string;
}
```

### Condition Operators

| Operator | Description | Example |
|---|---|---|
| `eq` | Equals | `region eq "eu"` |
| `neq` | Not equals | `department neq "engineering"` |
| `in` | In array | `riskLevel in ["high", "critical"]` |
| `nin` | Not in array | `department nin ["engineering", "legal"]` |
| `lt` | Less than | `approvalLimit lt 100000` |
| `lte` | Less than or equal | `amount lte 50000` |
| `gt` | Greater than | `amount gt 10000` |
| `gte` | Greater than or equal | `priority gte 5` |
| `contains` | String contains | `connectorType contains "bank"` |

## Permission Evaluation

### Evaluation Pipeline

```
Request for action "treasury.transfer"
                  │
                  ▼
    ┌─────────────────────────────┐
    │ 1. RBAC Check (role-based)  │
    │ Does user's role include    │
    │ "treasury.transfer"?        │
    └──────────┬──────────────────┘
               │
        ┌──────┴──────┐
        │   No         │ Yes
        │              │
        ▼              ▼
    ┌──────────┐  ┌──────────────────────┐
    │  DENY    │  │ 2. Direct Permission  │
    └──────────┘  │ Check (user override) │
                  │ Does user have direct  │
                  │ "treasury.transfer"?   │
                  └──────────┬─────────────┘
                             │
                      ┌──────┴──────┐
                      │   No         │ Yes
                      │              │
                      ▼              ▼
                  ┌──────────┐  ┌──────────────────────┐
                  │ continue │  │ 3. ABAC Policy Check │
                  └──────────┘  │ Evaluate conditions   │
                                │ for this action & user│
                                └──────────┬─────────────┘
                                           │
                                    ┌──────┴──────┐
                                    │   Allow      │ Deny
                                    │              │
                                    ▼              ▼
                                ┌──────────┐  ┌──────────┐
                                │  ALLOW   │  │  DENY    │
                                └──────────┘  └──────────┘
```

### Permission Checking Methods

| Method | Description | Returns |
|---|---|---|
| `PermissionManager.hasPermission(userId, permission, companyId)` | Direct permission check | `boolean` |
| `PermissionManager.getUserPermissions(userId, companyId)` | All permissions for user | `string[]` |
| `EnterpriseRoles.getPermissions(roleId)` | Effective permissions (with inheritance) | `GranularPermission[]` |
| `ABACPolicyEngine.evaluate(permission, userAttrs, resourceAttrs)` | ABAC condition evaluation | `{ allowed, matchedPolicy }` |

### Role Assignment

Roles are assigned via `RoleManager.assignRole(userId, roleId, companyId, assignedBy)`:

```typescript
// Assign treasury_manager role to user
roleManager.assignRole(
  "user_123",
  "treasury_manager",
  "company_456",
  "admin_789"  // assigned by
)
```

Operations:
- `assignRole()` — Grant role to user
- `revokeRole()` — Remove role from user
- `getUserRoles()` — List user's roles in a company
- `getUsersWithRole()` — List users with a specific role
- `cloneRole()` — Duplicate role as custom role

### Direct Permission Grants

In addition to role-based permissions, individual permissions can be granted directly:

```typescript
// Grant specific permission directly
permissionManager.grantPermission(
  "user_123",
  "treasury.reverse",
  "company",  // permission scope
  "company_456",
  "admin_789"
)

// Revoke specific permission
permissionManager.revokePermission(
  "user_123",
  "treasury.reverse",
  "company_456"
)
```

### Permission Templates

Reusable permission sets can be created and applied:

```typescript
const template = permissionManager.createPermissionTemplate({
  name: "Quarter-End Approver",
  description: "Temporary approval authority for quarter-end",
  permissions: ["approvals.approve", "approvals.escalate"],
  companyId: "company_456",
})

// Apply template to user
permissionManager.applyTemplate(template.id, "user_123", "company_456")
```

## Source Code Reference

| File | Class/Method | Description |
|---|---|---|
| `src/server/identity/permission-manager.ts` | `PermissionManager` | Permission grant/revoke/check |
| `src/server/identity/role-manager.ts` | `RoleManager` | Role CRUD, assignment, inheritance |
| `src/server/iam/roles.ts` | `EnterpriseRoles` | Role definitions and queries |
| `src/server/iam/permissions.ts` | `PermissionRegistry` | Permission definitions |
| `src/server/iam/abac.ts` | `ABACPolicyEngine` | ABAC policy evaluation |
| `src/server/iam/abac.ts` | `ABACEvaluator` | Basic ABAC evaluation |
| `src/server/iam/types.ts` | `ABACPolicy`, `ABACCondition` | ABAC type definitions |
| `src/server/iam/types.ts` | `EnterpriseRoleDefinition` | Role type definition |
| `src/server/iam/types.ts` | `GranularPermission` | Permission type union |
