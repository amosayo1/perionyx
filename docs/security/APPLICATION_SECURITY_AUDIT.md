# Application Security Audit

**Audit Date:** 2026-07-20
**Scope:** XSS, CSRF, file uploads, queue security, workflow security, audit logging
**Total Findings:** 110 (6 Critical, 22 High, 40 Medium, 42 Low)

## Executive Summary

The CSRF protection is fundamentally broken — it bypasses when the origin header is absent and validates both CSRF values from the same request. Workflow approval steps have no authorization (any user can approve), and workflow job handlers hardcode the ADMIN role. Plaid webhook signature verification is a no-op. Seven audit services are entirely in-memory with no persistence, and password changes generate no audit events.

## Findings

| Severity | ID | Title | File | Exploitability |
|----------|-----|-------|------|----------------|
| CRITICAL | APP-001 | CSRF origin bypass when header absent | `csrf.ts:12` | CSRF protection disabled for non-browser clients |
| CRITICAL | APP-002 | CSRF token reads both values from same request | `csrf.ts:37-38` | Token comparison compares token to itself — always passes |
| CRITICAL | APP-003 | Workflow approval steps have no authorization | Workflow engine | Any user can approve any workflow step |
| CRITICAL | APP-004 | Workflow job handlers hardcode ADMIN role | Job handlers | All workflow jobs execute as ADMIN — privilege escalation |
| CRITICAL | APP-005 | Broken outbound webhook signature verification | Webhook service | Webhook signatures not validated on delivery |
| CRITICAL | APP-006 | Plaid webhook verification is a no-op | Plaid webhook | Financial institution webhooks accepted without verification |
| HIGH | APP-007 | Token-based CSRF system is dead code | CSRF tokens | Unused token system creates false sense of security |
| HIGH | APP-008 | Hardcoded demo credentials on unauthenticated endpoint | Demo config | Public access to demo account credentials |
| HIGH | APP-009 | Fail-open token version check on DB failure | Token validation | Token validity not checked during DB outage |
| HIGH | APP-010 | EnterpriseSessionManager not integrated | Session management | No idle/absolute timeout enforcement |
| HIGH | APP-011 | CSRF validation reads both values from request | CSRF check | Token validation is always self-referential |
| HIGH | APP-012 | Queue job payloads not validated | Queue | No schema enforcement on job payloads |
| HIGH | APP-013 | Queue job cancel endpoint missing RBAC | Queue API | Unauthorized job cancellation |
| HIGH | APP-014 | Cross-tenant job cancellation | Queue cancel | Cancel jobs from other tenants |
| HIGH | APP-015 | No SSRF protection on outbound webhook URLs | Webhook service | Arbitrary internal network requests via webhooks |
| HIGH | APP-016 | Workflow respondToTask injects variables into context | Workflow engine | Arbitrary variable injection into workflow context |
| HIGH | APP-017 | Unbounded recursive sub-workflow execution | Workflow engine | Infinite recursion via sub-workflows |
| HIGH | APP-018 | No step definition schema validation | Workflow steps | Invalid step configurations accepted |
| HIGH | APP-019 | Human task step leaks all workflow variables | Human task | Sensitive context data exposed to task assignees |
| HIGH | APP-020 | Step output not validated before propagation | Workflow engine | Invalid step output passed to downstream steps |
| HIGH | APP-021 | No step execution timeout enforcement | Workflow engine | Steps can run indefinitely |
| HIGH | APP-022 | Approval step auto-approves on empty configuration | Approval step | Misconfigured approvals auto-pass |
| HIGH | APP-023 | Identity audit service entirely in-memory | Identity audit | No persistence of identity events |
| HIGH | APP-024 | Login attempts in-memory only | Login tracking | Brute-force detection lost on restart |
| HIGH | APP-025 | verifyCredentials does NOT record audit events | Credential check | Authentication events not logged |
| HIGH | APP-026 | Password changes don't generate audit events | Password change | No audit trail for credential changes |
| HIGH | APP-027 | 7 in-memory audit services not persisted | Audit services | Complete audit trail loss on restart |
| HIGH | APP-028 | No file upload type validation | File upload | Arbitrary file upload accepted |

## Key Remediation Actions

1. **APP-002**: Fix CSRF token validation in `csrf.ts:37-38` — compare request value against session-stored token, not against itself
2. **APP-003**: Add role/permission checks to all workflow approval steps; enforce `requirePermission('workflow:approve')` before processing approvals
3. **APP-004**: Replace hardcoded ADMIN role in job handlers with the authenticated user's actual role; enforce least privilege per job execution
4. **APP-005**: Implement proper HMAC-SHA256 signature verification for outbound webhooks; verify against shared secret stored per integration
5. **APP-006**: Implement Plaid webhook verification using Plaid's `webhookVerificationKey` endpoint and JWK-based signature validation
