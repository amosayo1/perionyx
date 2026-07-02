# ADR-003: Authentication & RBAC

**Status**: Ratified  
**Date**: January 2024  
**Author**: Architecture Team  

## Context

Enterprise financial software requires robust authentication and fine-grained authorization. Different users within the same company need different levels of access based on their role.

## Decision

### Authentication
- **NextAuth v5** with JWT strategy for session management
- **Credentials provider** for email/password login (bcrypt hashing)
- **Account lockout** after 5 failed attempts (configurable)
- **Session tokens** in HTTP-only cookies with SameSite=Lax

### Authorization (RBAC)
- **Company-scoped roles**: OWNER, ADMIN, TREASURER, MEMBER, VIEWER
- **Global permission catalog**: All named capabilities defined in Permission model
- **Scoped role-permission assignments**: Permissions can be restricted to specific wallets or transaction types
- **User-role assignments**: Users are assigned roles within companies

## Consequences

- **Positive**: Fine-grained access control suitable for enterprise requirements
- **Positive**: Separation of duties is enforceable (create vs. approve)
- **Positive**: Session management is handled by a mature library (NextAuth)
- **Negative**: RBAC adds complexity to every API route
- **Negative**: No OAuth/SAML support yet (planned)

## Alternatives Considered

1. **Clerk / Auth0**: Rejected — external dependency, cost, data residency concerns
2. **Custom JWT without NextAuth**: Rejected — reinventing the wheel, security risk
3. **ABAC (Attribute-Based Access Control)**: Considered but deferred — overengineering for current requirements
