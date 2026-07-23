# Role-Based Access Control — Perionyx Identity & Access Management

**Version**: 1.0 | **Last Updated**: 2026-07-12

## Overview

The Perionyx RBAC system provides 17 predefined enterprise roles across 6 categories, with support for custom roles, role inheritance, and tenant-scoped assignment. All role definitions are declared in `src/server/iam/roles.ts` and managed through `RoleManager` in `src/server/identity/role-manager.ts`.

## Global Roles

Global roles are available across all companies and managed by system administrators. These roles have the broadest scope.

### System Administrator

```typescript
{
  id: "system_administrator",
  name: "System Administrator",
  description: "Full system access across all companies. Manages infrastructure, security, and global settings.",
  category: "administration",
  permissions: PermissionRegistry.getAllNames(),  // All 100+ permissions
  inherits: [],
  mfaRequired: true,
  maxSessionLifetimeHours: 8,
  sandboxRestricted: false,
}
```

- **Permissions**: All permissions in the system
- **MFA**: Required (highest sensitivity)
- **Session limit**: 8 hours (forces re-authentication)
- **Sandbox**: Not restricted — full production access
- **Inherits**: Nothing (already has everything)

## Tenant Roles

Tenant roles are scoped to a specific company. They can be predefined or custom.

### Enterprise Administrator

```typescript
{
  id: "enterprise_administrator",
  name: "Enterprise Administrator",
  description: "Company-level administration with full access to settings, users, roles, billing, and integrations.",
  category: "administration",
  permissions: [
    ...PermissionRegistry.getAllNames().filter(
      (p) => !p.startsWith("security.encryption") && !p.startsWith("admin.delete_company"),
    ),
  ],
  inherits: [],
  mfaRequired: true,
  maxSessionLifetimeHours: 12,
  sandboxRestricted: true,
}
```

- **Excluded**: `security.encryption`, `admin.delete_company` (sensitive operations reserved for system admin)
- **MFA**: Required
- **Sandbox**: Restricted (cannot access production without additional checks)

## Department Roles

### Department Manager

```typescript
{
  id: "department_manager",
  name: "Department Manager",
  description: "Department-level oversight with scoped read and reporting access.",
  category: "administration",
  permissions: [
    "treasury.read", "approvals.view", "analytics.read", "analytics.export",
    "reporting.read", "reporting.create", "reporting.schedule",
    "audit.read", "risk.read", "onboarding.read", "workflow.read", "automation.read",
  ],
  inherits: ["read_only_executive"],
  mfaRequired: false,
  maxSessionLifetimeHours: 24,
  sandboxRestricted: false,
}
```

- **Inherits from**: `read_only_executive` — gets all executive read permissions plus department-specific write capabilities
- **MFA**: Optional (lower sensitivity, oversight role)

## Custom Roles

Custom roles can be created by cloning existing roles or building from scratch.

### Creating Custom Roles

```typescript
// Clone from existing role
const clonedRole = roleManager.cloneRole(
  "treasury_manager",   // source role ID
  "custom_treasury_vp", // new role ID
  "VP of Treasury"      // new display name
)

// Create entirely new role
roleManager.createRole({
  id: "custom_regional_treasury",
  name: "Regional Treasury Manager - EU",
  description: "Treasury management restricted to EU region",
  category: "treasury",
  permissions: [
    "treasury.read", "treasury.transfer",
    "wallets.read", "approvals.view",
    "reconciliation.view",
  ],
  inherits: [],
  isCustom: true,
  companyId: "company_456",
})
```

### Custom Role Rules

1. Custom roles are scoped to a specific `companyId`
2. Custom roles cannot have more permissions than `enterprise_administrator`
3. Custom roles cannot inherit from `system_administrator`
4. Custom role names must be unique within a company
5. Custom roles are flagged with `isCustom: true`

## Role Inheritance

### Inheritance Resolution

`EnterpriseRoles.getPermissions(roleId)` computes the effective permission set:

```typescript
static getPermissions(roleId: EnterpriseRoleId): GranularPermission[] {
  const role = ROLE_MAP.get(roleId);
  if (!role) return [];
  const inherited = role.inherits.flatMap((parentId) =>
    EnterpriseRoles.getPermissions(parentId),
  );
  return [...new Set([...role.permissions, ...inherited])];
}
```

### Inheritance Chain Example

```
read_only_executive (base read permissions)
        │
        ▼
department_manager (adds: analytics.export, reporting.create,
                    reporting.schedule, onboarding.read, etc.)
        │
        ▼
custom_director (future — adds: approvals.view escalation)
```

### Inheritance Rules

1. Inheritance is recursive — grandparent permissions are included
2. Duplicate permissions are de-duplicated via `Set`
3. Circular inheritance is prevented by explicit definition validation
4. System administrator roles typically do not inherit (they are roots)

## Permission Templates

### Template Structure

```typescript
interface PermissionTemplate {
  id: string;
  name: string;
  description?: string;
  permissions: GranularPermission[];
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Built-in Templates

| Template Name | Permissions | Intended For |
|---|---|---|
| `read_only` | All `.read` permissions, `approvals.view`, `audit.read` | Read-only access |
| `approver_basic` | `approvals.approve`, `approvals.view`, `treasury.read` | Basic approval authority |
| `connector_admin` | All `connectors.*` permissions | Connector management |
| `audit_exporter` | `audit.read`, `audit.export`, `reporting.read` | Audit data export |

### Creating Templates

```typescript
const template = permissionManager.createPermissionTemplate({
  name: "Quarter-End Temporary Approver",
  description: "Elevated approval limits for quarter-end close",
  permissions: [
    "approvals.approve",
    "approvals.escalate",
    "approvals.configure",
    "treasury.read",
  ],
  companyId: "company_456",
})

// Apply to user
permissionManager.applyTemplate(template.id, "user_123", "company_456")
```

## Role Assignment Operations

| Operation | Method | Description |
|---|---|---|
| Assign role | `roleManager.assignRole(userId, roleId, companyId, assignedBy)` | Grant role to user |
| Revoke role | `roleManager.revokeRole(userId, roleId, companyId)` | Remove role from user |
| List user roles | `roleManager.getUserRoles(userId, companyId)` | Get all roles for user in company |
| List role users | `roleManager.getUsersWithRole(roleId, companyId)` | Get all users with role |
| Get role | `roleManager.getRole(id)` | Get role definition |
| Get all roles | `roleManager.getAllRoles()` | List every role |
| Update role | `roleManager.updateRole(id, updates)` | Modify role definition |
| Delete role | `roleManager.deleteRole(id)` | Remove role (fails if users assigned) |
| Clone role | `roleManager.cloneRole(sourceId, newId, name)` | Duplicate as custom |

## Role Validation

```typescript
// Validate role exists
EnterpriseRoles.validate("treasury_manager")  // true
EnterpriseRoles.validate("nonexistent_role")  // false

// Check MFA requirements
EnterpriseRoles.requiresMfa("system_administrator")  // true
EnterpriseRoles.requiresMfa("treasury_analyst")      // false

// Get session limits
EnterpriseRoles.getMaxSessionLifetime("api_access")  // 720
EnterpriseRoles.getMaxSessionLifetime("auditor")     // 24
```

## Security Considerations

1. **Least privilege**: Start with read-only roles and add permissions deliberately
2. **MFA enforcement**: Roles with financial impact (`treasury_manager`, `financial_controller`, `approval_authority`) require MFA
3. **Session limits**: Administrative roles have shorter session lifetimes (8-12h vs 24h for read-only)
4. **Custom role auditing**: All custom role creation/assignment is audit-logged
5. **Inheritance awareness**: Changes to parent roles propagate to children — audit before modification

## Source Code Reference

| File | Description |
|---|---|
| `src/server/iam/roles.ts` | 17 role definitions, `EnterpriseRoles` class |
| `src/server/iam/roles.ts:391` | `ROLE_MAP` — role lookup by ID |
| `src/server/iam/roles.ts:396` | `EnterpriseRoles.getAll()` — list all roles |
| `src/server/iam/roles.ts:408` | `EnterpriseRoles.getPermissions()` — resolve inheritance |
| `src/server/iam/types.ts:1` | `EnterpriseRoleId` — role identifier union |
| `src/server/iam/types.ts:20` | `EnterpriseRoleCategory` — role category union |
| `src/server/iam/types.ts:180` | `EnterpriseRoleDefinition` — role type |
| `src/server/identity/role-manager.ts` | `RoleManager` — runtime role management |
| `src/server/identity/permission-manager.ts` | `PermissionManager` — permission templates |
