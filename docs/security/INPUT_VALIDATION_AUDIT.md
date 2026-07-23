# Input Validation Security Audit

**Audit Date:** 2026-07-20
**Scope:** Zod schemas, route-level validation, command execution, type safety, content-type handling
**Total Findings:** 20 (0 Critical, 3 High, 9 Medium, 6 Low)

## Executive Summary

No critical findings, but two approval creation endpoints lack any Zod validation, and the migration runner executes shell commands with interpolated user input. Over 10 financial amount fields lack maximum limit constraints. 100+ statement builder calculations risk floating-point precision loss. Positively, no SQL injection vectors exist (Prisma is parameterized), and 12 Zod files define 200+ validation schemas.

## Findings

| Severity | ID | Title | File | Exploitability |
|----------|-----|-------|------|----------------|
| HIGH | VAL-001 | Missing Zod validation on approval authority creation | `approval-authorities/route.ts:30-41` | Unvalidated input persisted to database |
| HIGH | VAL-002 | Missing Zod validation on approval rule creation | `approval-rules/route.ts:26-46` | Unvalidated approval rules bypass schema |
| HIGH | VAL-003 | Command injection risk in migration-runner | `migration-runner.ts:199,215` | `execSync` with string interpolation — arbitrary command execution |
| MEDIUM | VAL-004 | Unconstrained financial amount fields in 10+ Zod schemas | Multiple schema files | No maximum limits on financial amounts |
| MEDIUM | VAL-005 | Floating-point precision loss in 100+ statement builder calculations | Statement builder | Cumulative rounding errors in financial math |
| MEDIUM | VAL-006 | Path traversal in credential-manager file secret | Credential manager | Arbitrary file read via `../` in secret path |
| MEDIUM | VAL-007 | `as any` casts bypass type safety in 3 locations | Multiple files | Runtime type errors silently ignored |
| MEDIUM | VAL-008 | No Zod validation on webhook URL format | Webhook schemas | Invalid or malicious webhook URLs accepted |
| MEDIUM | VAL-009 | Missing enum validation on status fields | Multiple schemas | Invalid status transitions accepted |
| MEDIUM | VAL-010 | No string length limits on description/name fields | Schema files | Unbounded string fields |
| MEDIUM | VAL-011 | No array item count limits on batch operations | Batch schemas | Gigantic arrays accepted without validation |
| MEDIUM | VAL-012 | Missing Zod on template import endpoint | Template routes | Unvalidated template data imported |
| LOW | VAL-013 | No Content-Type validation on API routes | API routes | Accepts form-data, XML, binary on JSON endpoints |
| LOW | VAL-014 | No input sanitization on search queries | Search endpoints | Special characters not escaped in search |
| LOW | VAL-015 | No input size limits on file upload fields | Upload endpoints | Gigantic file names accepted |
| LOW | VAL-016 | Missing UUID format validation on ID params | Route params | Non-UUID ID strings accepted |
| LOW | VAL-017 | No date range validation on analytics queries | Analytics endpoints | Start > end dates accepted |
| LOW | VAL-018 | `any` type in event handler payloads | Event system | Unvalidated event data processed |
| LOW | VAL-019 | No Zod schema for agent configuration update | Agent routes | Unvalidated agent config mutations |
| LOW | VAL-020 | Missing email format validation on some user endpoints | User routes | Invalid email formats accepted |

## Key Remediation Actions

1. **VAL-003**: Replace `execSync` with `execFileSync` (no shell) in `migration-runner.ts:199,215`; validate migration path against allowed list
2. **VAL-001/002**: Add Zod validation schemas to `approval-authorities/route.ts:30-41` and `approval-rules/route.ts:26-46` matching existing schema patterns
3. **VAL-004**: Add `.max()` constraints to all financial amount fields (e.g., `z.number().positive().max(999999999999)`); align with column precision
4. **VAL-006**: Normalize and validate file secret paths against an allowed base directory; reject paths with `../` or absolute paths
5. **VAL-007**: Remove `as any` casts in 3 identified locations; replace with proper type guards or Zod parsing
