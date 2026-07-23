# API Security Audit

**Audit Date:** 2026-07-20
**Scope:** All API routes, error handling, data exposure, health endpoints, authentication/authorization on endpoints
**Total Findings:** 30 (2 Critical, 7 High, 14 Medium, 7 Low)

## Executive Summary

Health endpoints expose stack traces and database error details to unauthenticated callers. The `/api/agents/run` endpoint is unauthenticated and exposes financial data. Error handling across 12 endpoints has edge cases that leak internal state. The agent framework has multiple data exposure patterns through verbose error messages.

## Findings

| Severity | ID | Title | File | Exploitability |
|----------|-----|-------|------|----------------|
| CRITICAL | API-001 | Health endpoints expose stack traces/DB errors | `health/route.ts:25`, `enterprise/health/route.ts:21`, `recovery-validation/route.ts:27,42,58,74` | Full disclosure of internal state, DB schema, and paths |
| CRITICAL | API-002 | Unauthenticated /api/agents/run | Agent route | Public access to financial data via agent execution |
| HIGH | API-003 | Error handling edge cases across 12 endpoints | Multiple routes | Internal error details leaked in production responses |
| HIGH | API-004 | Data exposure in agent framework | Agent routes | Verbose error messages contain internal data |
| HIGH | API-005 | No request body size limits | All API routes | OOM via large JSON payloads |
| HIGH | API-006 | GET endpoints have zero rate limiting | All GET routes | Unbounded read-path abuse |
| HIGH | API-007 | Missing Content-Type validation | Multiple routes | Accepts arbitrary content types |
| HIGH | API-008 | No CSRF protection on mutation endpoints | All POST/PUT/DELETE | Cross-site request forgery on financial operations |
| HIGH | API-009 | Incomplete input validation on financial endpoints | Treasury/wallet routes | Zero-amount and negative-amount transactions accepted |
| MEDIUM | API-010 | Silent JSON parse error in 4 routes | Multiple routes | Malformed JSON silently ignored |
| MEDIUM | API-011 | GET export returns sensitive data without CSRF | Export endpoint | URL-based export token leakage |
| MEDIUM | API-012 | No audit on failed authentication attempts | Auth routes | Failed logins leave no audit trail |
| MEDIUM | API-013 | Webhook endpoints return full payload in errors | Webhook routes | Replay of sensitive webhook data through errors |
| MEDIUM | API-014 | Batch endpoints lack size limits | Batch API | Unbounded batch processing |
| MEDIUM | API-015 | No request timeout on long-running endpoints | Analytics/AI routes | Resource exhaustion via slow responses |
| MEDIUM | API-016 | CORS headers missing on API routes | API config | Cross-origin restrictions not enforced |
| MEDIUM | API-017 | No HTTP method override protection | All routes | Method confusion attacks possible |
| MEDIUM | API-018 | No API versioning enforcement | API routes | Breaking changes served without negotiation |
| MEDIUM | API-019 | Deprecated endpoints not removed | API routes | Legacy insecure endpoints still active |
| MEDIUM | API-020 | No request ID tracking in error responses | Error handler | Cannot correlate errors to requests |
| MEDIUM | API-021 | Pagination parameters not bounded | List endpoints | Extremely large page sizes cause performance issues |
| MEDIUM | API-022 | No validation on sort/filter parameters | List endpoints | Injection via sort column names |
| MEDIUM | API-023 | Missing cache headers on sensitive endpoints | Financial endpoints | Financial data cached in browser/proxies |
| LOW | API-024 | Exposed internal route names in responses | Error handler | Internal path information leaked |
| LOW | API-025 | No User-Agent validation | All routes | No client identification required |
| LOW | API-026 | Verbose 404 messages distinguish resource types | Error handler | Enumeration of valid resource types |
| LOW | API-027 | No response compression configuration | API config | No gzip/brotli on responses |
| LOW | API-028 | Missing security headers on error pages | Error pages | CORS/cache headers not applied to errors |
| LOW | API-029 | No OpenAPI/Swagger validation | Documentation | Spec-to-implementation drift |
| LOW | API-030 | Graceful shutdown returns incomplete responses | Server lifecycle | Half-processed requests on shutdown |

## Key Remediation Actions

1. **API-001**: Sanitize health endpoint responses — strip stack traces, DB errors, and internal paths; return generic status codes only
2. **API-002**: Add authentication and tenant isolation to `/api/agents/run`; require user session or API key with explicit scope
3. **API-005**: Implement body size limits via proxy or middleware (e.g., 1MB for standard requests, 10MB for batch)
4. **API-006**: Apply rate limiting to all GET endpoints with tiered limits (public: 100/5m, authenticated: 1000/5m)
5. **API-007**: Add Content-Type verification middleware rejecting non-`application/json` requests on mutation endpoints
