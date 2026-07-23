# Authorization

## Permission Model

Perionyx uses a hierarchical permission model built on the existing enterprise IAM system.

```
Role → Permissions → Scopes → Resources
```

### Roles
17 predefined enterprise roles (see IAM documentation).

### Permissions
56+ granular permissions across 14 categories.

### Scopes
API-level scopes mapped from IAM permissions:
- `permission:action` → `scope:action`
- Example: `workflow.read` → `workflow:read`

## Tenant Isolation

Every API request is tenant-scoped. Users can only access data within their tenant context.

**Enforcement points:**
1. Edge proxy extracts tenant context from session/API key
2. API Platform verifies tenant matches requested resource
3. Business logic enforces tenant filtering in queries

## Resource Ownership

Resources may be owned by specific users. Access is determined by:
1. **Owner**: Full access
2. **Admin**: Access within scope
3. **Role-based**: Access determined by enterprise role
4. **Public**: Accessible to authenticated users in the same tenant

## Least Privilege

Follow the principle of least privilege:

1. Request only the scopes you need
2. Use scoped tokens for limited operations
3. Regularly audit granted permissions
4. Rotate keys and tokens periodically
5. Use service accounts with minimal required permissions

## Audit Logging

All authorization decisions are audited:

| Event | Audited |
|-------|---------|
| Authentication success/failure | Yes |
| Authorization grant/deny | Yes |
| API key creation/revocation | Yes |
| Scope changes | Yes |
| Tenant access violations | Yes |
