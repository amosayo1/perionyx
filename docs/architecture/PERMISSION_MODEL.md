# Permission Model — Unified Authorization Registry

> **Purpose**: Single source of truth for permission definitions across the platform.
> **Established**: Phase 18.1B (2026-07-21)

---

## Single Source of Truth

**IAM PermissionRegistry** at `src/server/iam/permissions.ts`.

**69 permissions** across **16 categories**. Each permission has:
- `name` — dot-notation identifier (e.g., `workflow.create`)
- `category` — grouping (e.g., `workflow`, `treasury`)
- `description` — human-readable explanation
- `scopes` — array of access scopes (e.g., `["global", "company", "workflow"]`)
- `requiresMfa` — whether MFA verification is required

### Import Path

```typescript
import { PermissionRegistry } from "@/server/iam/permissions";
```

---

## Permission Categories (16)

| Category | Permissions | Description |
|---|---|---|
| `workflow` | 8 | Workflow definitions, execution, import/export |
| `treasury` | 6 | Balance viewing, fund transfers, treasury management |
| `approvals` | 3 | Approve, reject, escalate pending requests |
| `wallets` | 2 | Wallet management and viewing |
| `connectors` | 5 | Connector CRUD, sync, credentials |
| `reconciliation` | 1 | Reconciliation execution |
| `audit` | 1 | Audit log viewing |
| `administration` | 4 | Roles, approvers, authorities, users |
| `security` | 3 | MFA, secrets, encryption management |
| `risk` | 2 | Risk assessment and mitigation |
| `analytics` | 2 | Analytics viewing and export |
| `reporting` | 2 | Report generation and scheduling |
| `automation` | 3 | Business rules, approval matrix, scheduler |
| `onboarding` | 2 | Onboarding session management |
| `agents` | 2 | Agent management and viewing |
| `crm` | 3 | CRM contacts, insights, relationships |

---

## Permission Features

### MFA Requirements

Permissions with `requiresMfa: true` require TOTP verification before execution:

| Permission | Requires MFA |
|---|---|
| `workflow.delete` | Yes |
| `workflow.execute` | Yes |
| `workflow.activate` | Yes |
| `treasury.transfer` | Yes |
| `treasury.credit` | Yes |
| `treasury.debit` | Yes |
| `treasury.reverse` | Yes |
| `treasury.manage` | Yes |
| `approvals.approve` | Yes |
| `approvals.reject` | Yes |
| `approvals.escalate` | Yes |

### Scope-Based Access

Each permission declares valid scopes:

| Scope | Meaning |
|---|---|
| `global` | Cross-company access (admin) |
| `company` | Company-scoped access (default) |
| `workflow` | Workflow-specific access |
| `wallet` | Wallet-specific access |
| `connector` | Connector-specific access |
| `agent` | Agent-specific access |

### Category Filtering

```typescript
const treasuryPerms = PermissionRegistry.getByCategory("treasury");
const mfaPerms = PermissionRegistry.getRequiringMfa();
const allPerms = PermissionRegistry.getAll();
```

---

## API Surface

```typescript
PermissionRegistry.getAll(): PermissionMeta[]
PermissionRegistry.get(name: GranularPermission): PermissionMeta | undefined
PermissionRegistry.getByCategory(category: PermissionCategory): PermissionMeta[]
PermissionRegistry.getRequiringMfa(): PermissionMeta[]
PermissionRegistry.validate(name: string): boolean
PermissionRegistry.can(userPermissions: string[], required: GranularPermission): boolean
PermissionRegistry.requirePermissions(userPermissions: string[], required: GranularPermission[]): void
```

---

## Dual Registry Status

### IAM Registry (Authoritative)

| Attribute | Value |
|---|---|
| Location | `src/server/iam/permissions.ts` |
| Permissions | 69 |
| Categories | 16 |
| Type | `GranularPermission` (union type) |
| MFA | Yes (per-permission flag) |
| Scopes | Yes (per-permission array) |
| Admin endpoint | Returns IAM data |

### Legacy Registry (Prisma RBAC Compatibility)

| Attribute | Value |
|---|---|
| Location | `src/modules/rbac/permission-registry.ts` |
| Permissions | 24 |
| Categories | 9 (Transactions, Approvals, Wallets, Reconciliation, Audit, Connectors, Administration, Agents, CRM) |
| Type | `PermissionDefinition` (string-based) |
| MFA | No |
| Scopes | No |
| Consumers | RBAC service (Prisma DB lookups) |

### Why Legacy Still Exists

The RBAC service (`src/modules/rbac/rbac.service.ts`) checks permissions against Prisma database records using legacy permission names. Deleting the legacy registry would break all `rbacService.ensurePermission()` calls until the Prisma schema is migrated to use IAM permission names.

### Migration Path

1. Update Prisma `Role` seed data to use IAM permission names
2. Migrate all `ensurePermission()` calls to use IAM names
3. Delete `src/modules/rbac/permission-registry.ts`
4. Update `src/modules/rbac/index.ts` to remove legacy exports

---

## Admin Endpoint

`GET /api/admin/permissions` returns IAM permission data:

```json
{
  "permissions": [
    {
      "name": "workflow.create",
      "category": "workflow",
      "description": "Create new workflow definitions",
      "scopes": ["global", "company"],
      "requiresMfa": false
    }
  ],
  "categories": ["workflow", "treasury", "approvals", "..."],
  "total": 69
}
```

---

## Future Evolution

| Enhancement | Priority | Notes |
|---|---|---|
| Prisma schema migration to IAM names | P1 | Delete legacy registry after migration |
| Dynamic permission definitions | P2 | Load from database instead of hardcoded array |
| Permission versioning | P3 | Track permission changes over time |
| Delegated permission grants | P3 | Time-bound permission delegation |
