# ADR-018: Security Principles

**Status**: Ratified  
**Date**: January 2024  
**Author**: Security Team  

## Context

Financial software handles sensitive data — company balances, transactions, bank accounts, user credentials. Security failures can cause direct financial loss and regulatory penalties.

## Decision

Adopt **defense in depth** with overlapping security layers:

1. **Authentication**: NextAuth v5 with JWT, bcrypt password hashing, account lockout
2. **Authorization**: RBAC with company-scoped roles, permission catalog, scoped assignments
3. **Tenant isolation**: `companyId` on every entity, enforced by `requireTenantContext()`
4. **Rate limiting**: Per-endpoint rate limits with graduated responses
5. **Input validation**: Zod schemas on all API inputs
6. **Audit logging**: Complete audit trail for all state changes
7. **HTTPS enforcement**: TLS in production, HSTS headers
8. **Security headers**: CSP, X-Frame-Options, X-Content-Type-Options

### What We Don't Do
- No `eval()` or dynamic code execution
- No secrets in source code or logs
- No raw SQL (SQL injection prevented by Prisma)
- No XML parsing (XXE prevention)

## Consequences

- **Positive**: Multiple independent security layers — no single point of failure
- **Positive**: Clear security patterns for developers to follow
- **Positive**: Audit provides detective control if preventive controls fail
- **Negative**: Security adds complexity to every feature
- **Negative**: Performance overhead from validation and logging
- **Negative**: No penetration testing or bug bounty program yet

## Alternatives Considered

1. **Security through obscurity**: Rejected — not a valid security strategy
2. **Third-party security platform (Auth0, Okta)**: Partially adopted (auth is NextAuth, not custom)
3. **Minimal security (trust-based)**: Rejected — inappropriate for financial software
