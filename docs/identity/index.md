# Perionyx Identity & Access Management — Documentation

**Version**: 1.0 | **Last Updated**: 2026-07-12

## Overview

This documentation set covers the Perionyx Identity & Access Management (IAM) system — a comprehensive platform for authentication, authorization, SSO, RBAC, ABAC, and security policy management. It is intended for developers, system administrators, security officers, and DevOps engineers responsible for configuring and maintaining identity infrastructure.

## Documentation Map

| # | Document | Audience | Description |
|---|---|---|---|
| 1 | [Architecture](./architecture.md) | Developers, Architects | System overview, component architecture, data flow diagrams, integration points |
| 2 | [Authentication](./authentication.md) | Developers, Administrators | Supported methods, password policies, account lockout, session management, MFA |
| 3 | [Authorization](./authorization.md) | Developers, Security Officers | RBAC, ABAC, permission hierarchy, role assignment, permission evaluation |
| 4 | [RBAC](./rbac.md) | Administrators, Developers | Global/tenant/department/custom roles, role inheritance, permission templates |
| 5 | [ABAC](./abac.md) | Security Officers, Developers | Attribute definitions, policy evaluation, condition operators, policy priority, examples |
| 6 | [SSO](./sso.md) | Administrators | SAML 2.0, OpenID Connect, OAuth 2.0, Microsoft Entra ID, Google Workspace, Okta |
| 7 | [SAML](./saml.md) | Administrators | Metadata exchange, assertion consumption, attribute mapping, certificate management |
| 8 | [OIDC](./oidc.md) | Administrators | Discovery URL, authorization flow, token validation, user info endpoint |
| 9 | [Security](./security.md) | Security Officers, Administrators | Password/MFA/session policies, rate limiting, audit logging, best practices |
| 10 | [Developer Guide](./developer-guide.md) | Developers | Module structure, adding providers, extending auth, facade usage, testing |
| 11 | [Administrator Guide](./administrator-guide.md) | Administrators | User/group/role management, policy configuration, provider setup, audit review |

## Architecture Overview

```
                          ┌──────────────────────────────────────┐
                          │          Identity Facade             │
                          │   Central API for all IAM ops        │
                          └──────┬──────┬──────┬──────┬─────────┘
                                 │      │      │      │
              ┌──────────────────┼──────┼──────┼──────┼──────────────────┐
              │                  │      │      │      │                  │
     ┌────────▼───────┐  ┌──────▼──┐ ┌─▼──────▼──┐ ┌─▼────────┐  ┌────▼────────┐
     │  Identity      │  │ Auth    │ │ Session   │ │ User     │  │  Group      │
     │  Provider Mgr  │  │ Service │ │ Manager   │ │Provision │  │  Manager    │
     │  - SAML/OIDC   │  │- Login  │ │- Create   │ │- SCIM    │  │  - CRUD     │
     │  - Azure AD    │  │- Passkey│ │- Validate │ │- Sync    │  │  - Members  │
     │  - Okta        │  │- MFA    │ │- Revoke   │ │- Import  │  │  - Provider │
     │  - Google      │  │- Reset  │ │- Expire   │ │- Bulk    │  │    Sync     │
     └────────────────┘  └─────────┘ └───────────┘ └──────────┘  └─────────────┘
                                 │      │      │      │
     ┌───────────────────────────┼──────┼──────┼──────┼─────────────────────────┐
     │                    ┌──────▼──┐ ┌─▼──────▼──┐ ┌─▼───────────┐             │
     │                    │ Role    │ │ Permission│ │ Policy      │             │
     │                    │ Manager │ │ Manager   │ │ Engine      │             │
     │                    │ - CRUD  │ │ - Grant   │ │ - Password  │             │
     │                    │ - Assign│ │ - Revoke  │ │ - Session   │             │
     │                    │ - Inherit│ │ - Template│ │ - Login     │             │
     │                    └─────────┘ └───────────┘ └─────────────┘             │
     │                                                                          │
     │                    ┌──────────────────┐  ┌──────────────────┐            │
     │                    │   Audit Service  │  │   SSO Handler    │            │
     │                    │  - Recording     │  │  - SAML init     │            │
     │                    │  - Query/Export  │  │  - OIDC callback │            │
     │                    │  - Summary       │  │  - OAuth2 flow   │            │
     │                    └──────────────────┘  └──────────────────┘            │
     └──────────────────────────────────────────────────────────────────────────┘
```

## Quick Links

- **Identity Module**: `src/server/identity/` — 13 files
- **IAM Module**: `src/server/iam/` — 8 files
- **Identity Facade**: `src/server/identity/identity-facade.ts`
- **Types**: `src/server/identity/types.ts`, `src/server/iam/types.ts`
- **ABAC Engine**: `src/server/iam/abac.ts`
- **Role Definitions**: `src/server/iam/roles.ts`
- **Permission Definitions**: `src/server/iam/permissions.ts`
