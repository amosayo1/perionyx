---
id: audit-logging
title: Audit Logging
sidebar_label: Audit Logging
description: Tamper-evident audit logging with SHA-256 hash chaining, severity levels, filtering, and IAM audit events.
---

# Audit Logging

`src/server/security/audit-logger.ts` provides tamper-evident audit logging:

- `SecurityAuditLogger.record()` stores events in `AuditLog` Prisma model
- SHA-256 hash chaining: each entry includes `previousHash` linking to the prior entry
- Severity levels: `info`, `warning`, `critical`
- Standard fields: userId, companyId, action, resource type/ID, IP, user agent, correlationId
- Filtering by company, user, type, action, severity, date range
- Pagination via cursor-based navigation
- `recordIAMAudit()` for IAM-specific events (login, logout, permission change, role change, MFA events)

## IAM Audit Event Types

`src/server/iam/audit-events.ts` defines structured audit events for IAM operations: login, logout, login failed, permission granted/revoked, role assigned/unassigned, MFA enabled/disabled, session revoked, API key created/revoked, SSO configured, encryption key rotated.
