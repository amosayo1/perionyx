# Security Documentation

## Overview

Enterprise security hardening implementation covering all OWASP Top 10 and common enterprise security requirements.

## Components

| Component | File | Description |
|---|---|---|
| SecretsValidator | `src/server/security/secrets.ts` | Validates required secrets and key strength |
| EnvironmentValidator | `src/server/security/environment.ts` | Validates environment configuration |
| SecurityHeadersManager | `src/server/security/headers.ts` | CSP, HSTS, security headers |
| RateLimiter | `src/server/security/rate-limiter.ts` | Rate limiting with configurable windows |
| CSRFProtection | `src/server/security/csrf.ts` | CSRF token generation and validation |
| InputValidator | `src/server/security/input-validator.ts` | Sanitization and validation |
| EncryptionVerifier | `src/server/security/encryption.ts` | AES-256-GCM encryption, key rotation |
| SecurityAuditLogger | `src/server/security/audit-logger.ts` | Event-based security audit logging |
| DependencyScanner | `src/server/security/dependency-scanner.ts` | Dependency vulnerability scanning |

## Headers Applied

| Header | Value |
|---|---|
| Content-Security-Policy | Restrictive, inline scripts allowed |
| Strict-Transport-Security | 1 year, includeSubDomains, preload |
| X-Content-Type-Options | nosniff |
| X-Frame-Options | DENY |
| X-XSS-Protection | 1; mode=block |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | Camera, microphone, geolocation disabled |
| Cross-Origin-Opener-Policy | same-origin |

## Rate Limiting

| Endpoint Type | Limit | Window |
|---|---|---|
| API (default) | 100 requests | 1 minute |
| Auth endpoints | 10 requests | 1 minute |
| Financial endpoints | 50 requests | 1 minute |
| Public endpoints | 200 requests | 1 minute |

## Encryption Standards

- **Algorithm**: AES-256-GCM
- **Key length**: 32 bytes (256 bits)
- **IV**: Random 16 bytes per encryption
- **Authentication**: GCM auth tag included
- **Key rotation**: Supported via `encryptionVerifier.rotateKey()`
