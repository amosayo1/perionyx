---
id: authorization
title: Authorization
sidebar_label: Authorization
description: RBAC roles and permissions, ABAC attribute-based policies, IAM permission system, and enterprise role definitions.
---

# Authorization

## RBAC

`src/modules/rbac/rbac.service.ts` manages role-based access control:
- **Roles**: Custom roles per company with assigned permissions via Prisma `Role` + `RolePermission` models
- **Permissions**: 46+ `GranularPermission` types covering workflow, treasury, approvals, wallets, connectors, reconciliation, audit, administration, security, risk, analytics, reporting, automation, and onboarding
- **Permission Registry**: `PermissionRegistry` in `src/modules/rbac/permission-registry.ts` defines 24 permission definitions with names, categories, and descriptions
- **Sandbox Restrictions**: 10 permissions are blocked in sandbox mode (manage users, roles, API keys, webhooks, integrations, billing, auth, security, export data, delete company)
- **Enforcement**: `rbacService.ensurePermission(userId, companyId, permission)` called at every API handler

## ABAC

`src/server/iam/abac.ts` provides attribute-based access control:
- `ABACEvaluator` — evaluates permission against user and resource attributes
- `ABACPolicyEngine` — manages and evaluates ABAC policies with conditions
- Conditions support operators: `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `in`, `contains`, `startsWith`, `endsWith`
- Policies have priority ordering, effect (`allow`/`deny`), and permission lists

## IAM Permission System

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
