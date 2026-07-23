# Perionyx — Security Architecture

**Version 1.0**  
**Last Updated: July 2026**

---

## 1. Security Philosophy

Perionyx handles enterprise financial data — company money, bank accounts, transaction records, and sensitive financial intelligence. Security is not a feature; it is a fundamental property of the system. Every architectural decision must consider security implications.

---

## 2. Authentication

### 2.1 Authentication Methods

| Method | Use Case | Implementation |
|--------|----------|----------------|
| **Session (JWT)** | Browser-based users | NextAuth v5 with JWT strategy |
| **API Keys** | Programmatic access | Scoped keys with permissions |
| **Credentials** | Direct login | Email + password with bcrypt |

### 2.2 Session Management

- JWT tokens signed with `AUTH_SECRET`
- Token expiration: 24 hours (configurable via `session.maxAge` in `auth.ts`)
- Session tokens stored in HTTP-only cookies
- Secure cookies in production (`__Secure-` prefix)
- SameSite=Lax for CSRF protection
- **Session versioning** via `User.tokenVersion` — password changes, resets, and account disables immediately invalidate all active JWTs

### 2.3 Session Invalidation (Phase 15.1A)

When a security event occurs, `User.tokenVersion` is incremented. The proxy compares the JWT's `tokenVersion` claim against the database value on every request. A mismatch results in immediate session revocation.

| Event | TokenVersion Incremented | Sessions Revoked |
|-------|------------------------|------------------|
| Password change | Yes | All |
| Password reset | Yes | All |
| Account disable | Yes | All |
| Account lockout (5 failed attempts) | No | No (existing sessions continue for up to 24h) |

This provides **immediate invalidation** of stateless JWT sessions without requiring refresh tokens or server-side session storage.

### 2.3 Password Security

- Bcrypt hashing with configurable rounds (default: 12)
- Minimum password length: 8 characters
- Account lockout after 5 failed attempts
- Lockout duration: 15 minutes (configurable)
- No password storage in logs, error messages, or API responses

### 2.4 API Key Security

- Keys generated with cryptographic randomness
- Only the prefix and last 4 characters are stored (for identification)
- Full hash stored for validation
- Keys can be scoped to specific permissions
- Keys can have expiration dates
- Usage tracking for audit

---

## 3. Authorization (RBAC)

### 3.1 Role Model

```
Company
  └── Roles (company-scoped)
        └── Permissions (global catalog)
              └── RolePermissions (scoped: GLOBAL/COMPANY/WALLET/TRANSACTION_TYPE)
                    └── Users (via UserRole)
```

### 3.2 Built-in Roles

| Role | Level | Description |
|------|-------|-------------|
| OWNER | Company | Full access, including billing and settings |
| ADMIN | Company | Administrative access |
| TREASURER | Company | Treasury operations |
| MEMBER | Company | Standard user |
| VIEWER | Company | Read-only access |

### 3.3 Permission Scope Types

| Scope | Description | Example |
|-------|-------------|---------|
| GLOBAL | Applies across the entire company | `admin:users` |
| COMPANY | Applies to a specific company | `company:settings` |
| WALLET | Applies to a specific wallet | `wallet:transfer` |
| TRANSACTION_TYPE | Applies to specific transaction types | `transaction:approve` |

### 3.4 Authorization Flow

```
Request
  → requireTenantContext() → extracts userId, companyId, role
  → Service checks permission (if applicable)
    → prisma.userRole.findFirst({ where: { userId, companyId, role: { permissions: { ... } } } })
  → Authorized → proceed
  → Not authorized → 403 Forbidden
```

---

## 4. Tenant Isolation

### 4.1 Database-Level Isolation

Every database model includes a `companyId` field. All queries must include `companyId` in WHERE clauses:

```typescript
// Always filter by companyId
const wallet = await prisma.wallet.findFirst({
  where: { id: walletId, companyId: ctx.companyId }
});
```

### 4.2 Cross-Tenant Prevention

- All Prisma queries are scoped to `ctx.companyId`
- The `requireTenantContext()` function rejects requests without a valid company context
- API routes cannot accidentally query across tenants because `companyId` is always required
- License enforcement (`LICENSE_COMPANY_ID` env var) additionally restricts which company can access the system

### 4.3 Tenant Context

```typescript
export type TenantContext = {
  userId: string;
  companyId: string;
  role: CompanyRole;
};
```

This context is the foundation of all authorization decisions.

---

## 5. Audit

### 5.1 Audit Log Coverage

The audit log records:

- Authentication events (login, logout, failed login)
- Authorization decisions (permission grants/revocations)
- Financial state changes (transaction creation, approval, posting)
- Configuration changes (policy updates, rule changes)
- User management (creation, role changes, invitations)
- Data export (what was exported, by whom)
- API key operations (creation, revocation)

### 5.2 Audit Record Structure

```typescript
{
  id: string;
  companyId: string;
  actorUserId: string | null;
  action: string;           // e.g., "transaction.create", "policy.update"
  resourceType: string;     // e.g., "Transaction", "Policy"
  resourceId: string | null;
  severity: "INFO" | "WARNING" | "CRITICAL";
  metadata: object | null;  // Action-specific details
  payloadHash: string | null; // Tamper-evident hash
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: DateTime;
}
```

### 5.3 Tamper Evidence

The `payloadHash` field stores a hash of the action's metadata. Combined with the sequential nature of audit records, this provides tamper-evident properties. Future implementations will chain audit records for full blockchain-style immutability.

---

## 6. Encryption

### 6.1 Data in Transit

- All traffic encrypted via TLS/HTTPS
- HSTS enabled in production
- API endpoints enforce HTTPS

### 6.2 Data at Rest

- Database encryption at rest (PostgreSQL TDE or disk encryption)
- Password hashes use bcrypt (not reversible)
- API key secrets hashed with SHA-256
- Session tokens are JWT (signed, not encrypted by default; encryption planned)

### 6.3 Secrets Management

- Secrets loaded from environment variables only
- Never hardcoded in source code
- Never logged
- Never exposed in error messages
- Production secrets managed through secure vault (planned)

---

## 7. API Security

### 7.1 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Sandbox login | 10 requests | 60 seconds |
| Authentication | 20 requests | 60 seconds |
| General API (session) | 100 requests | 60 seconds |
| General API (key) | 1000 requests | 60 seconds |

### 7.2 Input Validation

- All request bodies validated with Zod schemas
- SQL injection prevented by Prisma's parameterized queries
- XSS prevented by React's automatic escaping
- Noeval() or similar dynamic execution

### 7.3 CSRF Protection

- NextAuth's SameSite cookie configuration
- CSRF tokens available for non-GET requests (if needed in future)

### 7.4 Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: <configured per environment>
```

---

## 8. OWASP Considerations

### 8.1 Addressed

- **Injection**: Prisma parameterization, Zod validation
- **Broken Authentication**: bcrypt, lockout, JWT best practices
- **Sensitive Data Exposure**: No secrets in logs, HTTPS enforced
- **XML External Entities (XXE)**: JSON-only API, no XML parsing
- **Broken Access Control**: RBAC with tenant isolation
- **Security Misconfiguration**: Structured configuration, env-based
- **Cross-Site Scripting (XSS)**: React escaping, CSP headers
- **Insecure Deserialization**: JSON parsing only
- **Insufficient Logging & Monitoring**: Comprehensive audit logging

### 8.2 Under Review

- **API rate limiting at edge**: Cloudflare or similar CDN-level rate limiting (planned)
- **DDoS protection**: Edge-level protection (planned)
- **Vulnerability scanning**: Automated scanning in CI/CD (planned)
- **Penetration testing**: Regular third-party testing (planned)

---

## 9. Financial Software Best Practices

### 9.1 Separation of Duties

- Transaction creation and approval must be performed by different users
- Approval rules enforce minimum approver counts
- Dual approval required for high-value transactions
- Audit trail records who did what, when

### 9.2 Idempotency

- State-modifying operations are idempotent
- Idempotency keys prevent duplicate financial transactions
- Replayed requests return cached responses (not new operations)

### 9.3 Balance Integrity

- Wallet balances use optimistic locking (version field)
- Double-entry ledger ensures accounting equation balances
- Reconciliation engine detects and reports discrepancies
- Wallet balances cannot go negative (STANDARD wallets)

### 9.4 Data Retention

- Audit logs: Retained for minimum 7 years (financial compliance)
- Transaction records: Retained indefinitely
- Session data: Expires per configuration
- API key usage logs: Retained for 1 year

---

## 10. Incident Response

### 10.1 Detection

- System health monitoring detects service degradation
- Risk alerts detect suspicious patterns
- Audit log anomalies flagged for review
- Failed authentication attempts trigger alerts

### 10.2 Response Plan

1. **Identify**: Determine scope and impact of the incident
2. **Contain**: Isolate affected systems if necessary
3. **Investigate**: Review audit logs and system traces
4. **Remediate**: Apply fixes and configuration changes
5. **Recover**: Restore services and verify integrity
6. **Post-Mortem**: Document findings and update procedures

---

## 11. Compliance Roadmap

| Standard | Status | Target |
|----------|--------|--------|
| SOC 2 Type I | Planned | Q4 2026 |
| SOC 2 Type II | Planned | Q2 2027 |
| GDPR | Implemented (data isolation, export, delete) | Current |
| SOX | Planned (financial controls) | Q1 2027 |
| ISO 27001 | Planned | Q3 2027 |
| PCI DSS | Not applicable (no card processing) | N/A |
