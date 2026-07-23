# OWASP Top 10 Compliance Report

**Audit Date:** 2026-07-20
**Standard:** OWASP Top 10 — 2021
**Overall Score:** 6.0 / 10

## Executive Summary

The platform achieves a 6.0/10 overall OWASP compliance score. Strongest areas are Cryptographic Failures (A02) and Security Misconfiguration (A05), both fully compliant. Weakest areas are Authentication Failures (A07) and SSRF (A10), which are partially or non-compliant. The platform has adequate controls for most categories but requires significant hardening in access control, authentication, and server-side request forgery prevention.

## OWASP Assessment

| Category | Risk | Maturity | Compliance | Key Issues |
|----------|------|----------|------------|------------|
| A01: Broken Access Control | Medium | Adequate | Partially Compliant | CRM tenant isolation missing, wallet/policy routes lack RBAC, Owner bypasses all checks, API keys hardcoded ADMIN |
| A02: Cryptographic Failures | Low | Strong | Compliant | AES-256-GCM for encryption, bcrypt for passwords, proper TLS. No weak ciphers identified |
| A03: Injection | Medium | Adequate | Partially Compliant | No SQL injection (Prisma parameterized), but command injection in migration-runner execSync, path traversal in credential manager |
| A04: Insecure Design | Medium | Adequate | Partially Compliant | 7 in-memory-only audit services, no MFA enforcement, transaction state machine race conditions |
| A05: Security Misconfiguration | Low | Strong | Compliant | CSP headers present (incomplete), CORS configurable, security headers framework in place. Gaps in frame-ancestors and Permissions-Policy |
| A06: Vulnerable Components | Medium | Weak | Partially Compliant | Dependency scanner is no-op stub, no SBOM, no regular vulnerability scanning, no CVE tracking |
| A07: Authentication Failures | High | Weak | Partially Compliant | Token revalidation skipped on refresh, bcrypt fail-open, no MFA, registration rate limit bypass, 24h JWT without refresh tokens |
| A08: Data Integrity Failures | Medium | Adequate | Partially Compliant | No CSRF protection (broken token validation), webhook signature verification broken, Plaid webhook verification is no-op |
| A09: Logging & Monitoring | Medium | Adequate | Partially Compliant | 7 in-memory audit services, no SIEM, no centralized logging, password changes not logged, no failed-login audit |
| A10: SSRF | High | Weak | Non-Compliant | No SSRF protection on outbound webhooks, no URL allowlist, no internal network restriction on webhook deliveries |

## Scoring Methodology

Each category is scored on a 0-10 scale based on:
- **Risk**: Severity of exploitation impact for the platform
- **Maturity**: Current state of controls (Strong/Adequate/Weak)
- **Compliance**: Degree of conformance to OWASP guidance

Overall score is the unweighted average of category compliance assessments (Partially Compliant = 6, Compliant = 10, Non-Compliant = 2).

| Category | Score |
|----------|-------|
| A01: Broken Access Control | 6 |
| A02: Cryptographic Failures | 10 |
| A03: Injection | 6 |
| A04: Insecure Design | 6 |
| A05: Security Misconfiguration | 10 |
| A06: Vulnerable Components | 4 |
| A07: Authentication Failures | 4 |
| A08: Data Integrity Failures | 6 |
| A09: Logging & Monitoring | 6 |
| A10: SSRF | 2 |
| **Overall** | **6.0** |

## Key Remediation Actions

1. **A07**: Fix token revalidation on refresh, replace bcrypt fail-open with strict comparison, implement MFA enforcement, add refresh token rotation
2. **A10**: Implement URL allowlisting for outbound webhooks, add internal network IP range blocking, validate all webhook destination URLs against allowlist
3. **A01**: Add tenant isolation to CRM module, apply RBAC to wallet/policy routes, remove Owner bypass, implement scoped API keys
4. **A08**: Fix CSRF token validation, implement proper webhook signature verification (HMAC-SHA256), fix Plaid webhook verification
5. **A09**: Persist all 7 in-memory audit services to database, implement SIEM integration, add audit events for password changes and failed logins
