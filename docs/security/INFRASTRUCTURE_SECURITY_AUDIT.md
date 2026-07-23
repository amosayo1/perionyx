# Infrastructure Security Audit

**Audit Date:** 2026-07-20
**Scope:** HTTP headers, secrets management, caching, performance/DoS resilience, Kubernetes, Docker, proxy configuration
**Total Findings:** 108 (12 Critical, 18 High, 35 Medium, 43 Low)

## Executive Summary

Kubernetes secrets are committed as plaintext with placeholder credentials. Docker Compose exposes Postgres and Redis to the host network. The `cacheHeaders()` function uses `public` directive for financial data, enabling CDN-based cross-tenant leakage. No body size limits exist on API routes, GET endpoints lack rate limiting, and the in-memory rate limiter never evicts entries. Fail-open session validation on database failure permits unauthenticated access during outages.

## Findings

| Severity | ID | Title | File | Exploitability |
|----------|-----|-------|------|----------------|
| CRITICAL | INFRA-001 | K8s secrets committed as plaintext | K8s manifests | Placeholder credentials in version control |
| CRITICAL | INFRA-002 | Docker Compose exposes Postgres/Redis to host | `docker-compose.yml` | Database and cache accessible from host network |
| CRITICAL | INFRA-003 | cacheHeaders() uses `public` for financial data | Cache headers | CDN cross-tenant data leakage |
| CRITICAL | INFRA-004 | No body size limits on API routes | All API routes | OOM via large JSON payloads |
| CRITICAL | INFRA-005 | GET endpoints have zero rate limiting | All GET routes | Unbounded read-path DoS |
| CRITICAL | INFRA-006 | In-memory rate limiter never evicts | Rate limiter | Memory leak + multi-process bypass |
| CRITICAL | INFRA-007 | Fail-open session validation on DB failure | Session service | Auth bypass during database outage |
| CRITICAL | INFRA-008 | Live API keys/secrets in .env file on disk | `.env` | Plaintext secrets in filesystem |
| CRITICAL | INFRA-009 | No CSP reporting | CSP config | Zero visibility into CSP violations |
| CRITICAL | INFRA-010 | Missing `frame-ancestors` in CSP | CSP config | Clickjacking vulnerability |
| CRITICAL | INFRA-011 | Financial API responses missing `Cache-Control: no-store` | API config | Sensitive data cached in browser |
| CRITICAL | INFRA-012 | cacheHeaders() CDN-Cache-Control enables cross-tenant leakage | Cache headers | CDN serves cached data across tenants |
| HIGH | INFRA-013 | Default database password in docker-compose | `docker-compose.yml` | Weak default PostgreSQL password |
| HIGH | INFRA-014 | K8s deployment uses `image: latest` | K8s deploy | Unpredictable container versions in production |
| HIGH | INFRA-015 | K8s missing container SecurityContext | K8s manifests | Containers run as root without restrictions |
| HIGH | INFRA-016 | Network policy allows all ingress from all namespaces | K8s network policy | No network segmentation between services |
| HIGH | INFRA-017 | Redis exposed without authentication | Docker Compose | Cache accessible without credentials |
| HIGH | INFRA-018 | Sandbox default credentials hardcoded | Sandbox config | Well-known credentials in non-prod environments |
| HIGH | INFRA-019 | 10-minute permission cache TTL | Permission cache | Privilege escalation window after role revocation |
| HIGH | INFRA-020 | Financial data publicly cached | Cache policy | Sensitive data in shared caches |
| HIGH | INFRA-021 | No CORS headers configured | API config | Same-origin policy not enforced for browser clients |
| HIGH | INFRA-022 | HSTS discrepancy between systems | Security headers | Inconsistent HTTPS enforcement |
| HIGH | INFRA-023 | Dead code SecurityHeadersManager conflicts with active CSP | Headers manager | Conflicting security header application |
| HIGH | INFRA-024 | No start abort on missing production secrets | Startup | Application starts with missing critical secrets |
| HIGH | INFRA-025 | Backup stores unencrypted on local disk | Backup service | Plaintext backup files accessible on filesystem |
| HIGH | INFRA-026 | Proxy doesn't forward security headers to error responses | Proxy | Error pages lack security headers |
| HIGH | INFRA-027 | No cross-origin isolation headers | Security headers | Missing `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` |
| HIGH | INFRA-028 | Incomplete Permissions-Policy | Security headers | Missing camera, microphone, geolocation restrictions |
| HIGH | INFRA-029 | Dependency scanner is a no-op stub | Security scanning | No actual dependency vulnerability scanning |
| HIGH | INFRA-030 | No TLS termination at proxy level | Proxy config | Plaintext backend communication |

## Key Remediation Actions

1. **INFRA-001**: Move K8s secrets to external secret store (e.g., Vault, AWS Secrets Manager); remove placeholder manifests from version control
2. **INFRA-003**: Change `cacheHeaders()` to use `private` or `no-store` for all financial/transactional data; reserve `public` for static assets only
3. **INFRA-006**: Implement sliding-window rate limiter with Redis or bounded LRU cache; add TTL-based eviction on all rate counter entries
4. **INFRA-007**: Replace fail-open with fail-closed in session validation; on DB failure, reject all requests requiring session verification
5. **INFRA-029**: Replace no-op stub with actual dependency scanner (npm audit, Snyk, or Dependabot); add to CI pipeline as blocking check
