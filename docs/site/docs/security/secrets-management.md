---
id: secrets-management
title: Secrets Management
sidebar_label: Secrets
description: Environment variable validation, secrets management, input sanitization, and dependency scanning.
---

# Secrets Management

## Additional Security Services

| Service | File | Purpose |
|---|---|---|
| Secrets Validator | `secrets.ts` | Validates required env vars are set and properly formatted |
| Environment Validator | `environment.ts` | Validates NODE_ENV and environment-specific config |
| Input Validator | `input-validator.ts` | Sanitization and validation of user input |
| Dependency Scanner | `dependency-scanner.ts` | Scans for known vulnerable dependencies |
| Authenticate Request | `authenticate-request.ts` | Request-level authentication helper |

## CSRF Protection

`src/server/security/csrf.ts`:
- `validateOrigin(request)` — validates Origin/Referer headers against allowed origins
- Applied in `src/proxy.ts` for all mutation requests

## Security Headers

`src/server/security/headers.ts` (`SecurityHeadersManager`):
- Content-Security-Policy: strict self-origin with script/style/connect restrictions
- Strict-Transport-Security: max-age based on environment
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- Cross-Origin-Opener-Policy: same-origin
- Cross-Origin-Resource-Policy: same-origin
- Cross-Origin-Embedder-Policy: require-corp
