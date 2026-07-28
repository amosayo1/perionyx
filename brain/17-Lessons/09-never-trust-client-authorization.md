---
title: "Never Trust Client-Side Authorization"
created: 2026-07-20
tags:
  - type/lesson
  - domain/security
  - status/active
aliases:
  - IDOR Prevention
  - Server-Side Authz
---

# Never Trust Client-Side Authorization

**Category**: Security

**Lesson**: The CRM module had an IDOR vulnerability where the tenant ID came from the request body instead of the session. A user could change the tenant ID and access another tenant's contacts. Authorization must always be derived from the server-side session, never from client-supplied data. The fix: `requireTenantContext()` extracts the tenant from the validated session token, ignoring any client-supplied tenant parameter.

**When it applies**: When any endpoint receives data that includes tenant, user, or permission identifiers. Always extract authorization context from the session, never from the request body or query parameters.

**Related**: [[04-Security/multi-tenancy|Multi-Tenancy]], [[11-ADR/adr-003-crm-tenant-isolation|ADR-003]]

**Source**: Phase 17 P0-3 — CRM IDOR vulnerability, tenant isolation fix
