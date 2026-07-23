# Security Hardening — Architecture

## Overview

Phase 11X.1 hardens the Perionyx platform across five security domains: secrets management, encryption, authentication/authorization, audit logging, and recovery. Every component is designed for enterprise compliance (SOC 2, ISO 27001, PCI DSS) with zero new runtime dependencies.

## Component Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Application Layer                      │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Next.js API  │  │  Installer   │  │  Recovery System     │ │
│  │ Routes       │  │  CLI         │  │  (backup/restore)    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘ │
│         │                 │                      │             │
└─────────┼─────────────────┼──────────────────────┼─────────────┘
          │                 │                      │
┌─────────┼─────────────────┼──────────────────────┼─────────────┐
│         │    Security Layer (src/server/security/)             │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────────┴───────────┐│
│  │ authenticate- │  │  CSRF        │  │  Rate Limiter        ││
│  │ request.ts    │  │  protection  │  │  (Redis + mem)       ││
│  └──────┬───────┘  └──────────────┘  └──────────────────────┘│
│         │                                                     │
│  ┌──────┴───────┐  ┌──────────────┐  ┌──────────────────────┐│
│  │ Secrets       │  │ Encryption   │  │ SecurityHeaders      ││
│  │ Validator     │  │ Service      │  │ Manager (CSP/HSTS)   ││
│  └───────────────┘  └──────┬───────┘  └──────────────────────┘│
│                            │                                  │
│  ┌────────────────────┐    │    ┌───────────────────────────┐ │
│  │ InputValidator     │    │    │ DependencyScanner          │ │
│  │ (XSS sanitization) │    │    │ (vuln detection)           │ │
│  └────────────────────┘    │    └───────────────────────────┘ │
│                            │                                  │
│  ┌─────────────────────────┴───────────────────────────────┐  │
│  │                Audit Event Store                        │  │
│  │  (hash-chained, append-only, Prisma-backed)             │  │
│  └─────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────────┐
│              Infrastructure Layer                              │
│  ┌────────────┐  ┌─────────┴────────┐  ┌──────────────────┐  │
│  │ PostgreSQL  │  │ Redis (optional)│  │ File System       │  │
│  │ (Prisma)    │  │ (rate limiting) │  │ (.backups/)       │  │
│  └────────────┘  └──────────────────┘  └──────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Component Interactions

| Flow | Path |
|------|------|
| API Request | `proxy.ts` → `authenticateRequest()` → `CSRFProtection` → `rateLimit()` → handler |
| Startup | `SecretsValidator.validate()` → `EncryptionService` init → `SecurityHeadersManager` |
| Audit Event | Service calls `securityAuditLogger.log()` → `AuditEventStore.record()` → Prisma |
| Backup | `BackupManager.createBackup()` → `pg_dump` → SHA-256 checksum → `.backups/` |
| Restore | `RestoreManager.restore()` → `pg_restore` → integrity verification |
| Encryption | `encrypt()` → AES-256-GCM → base64 metadata + hex ciphertext |
| Decryption | `decrypt()` → parse metadata → lookup key by keyId → AES-256-GCM |
| Key Rotation | `EncryptionService.rotateKey()` → old key added to history → new key becomes active |

## Key Design Decisions

1. **AES-256-GCM** — chosen for authenticated encryption (detects tampering). Nonce (IV) is random 16 bytes per encryption. Auth tag stored alongside ciphertext.

2. **Hash-chained audit log** — each entry stores the previous entry's SHA-256 hash. `verifyChain()` replays the chain to detect tampering or deletion. Breaks in the hash chain indicate audit integrity failure.

3. **Graceful Redis degradation** — rate limiting falls back to in-memory `Map` when `REDIS_URL` is not set. No hard dependency on Redis for production start.

4. **Encryption key history** — `ENCRYPTION_KEY_HISTORY` env var stores old keys as comma-separated `keyId=hex` pairs. Decryption tries current key first, then falls back to history keys by matching the `keyId` stored in the payload metadata.

5. **KMS provider interface** — `KMSProvider` interface (encrypt/decrypt/generateKey) defined for future AWS KMS / GCP Cloud KMS integration. Currently uses local key material; swap-in requires implementing the interface and calling `encryptionService.setKMSProvider()`.

6. **Secrets validation fails fast** — `SecretsValidator` runs on application startup. Missing critical secrets throw `SecretsError` before the HTTP server starts. Known default values are explicitly rejected in production.

7. **Backup isolation** — backups are stored as `.dump` (pg_dump custom format, compressed level 9) and `.json` (config). SHA-256 checksums are computed for integrity verification. Restore uses `--clean --if-exists` to safely replace the target database.

8. **Migration checksum verification** — `MigrationRunner.verifyMigrations()` compares stored checksums against registered migration file checksums to detect drift or tampering.

## File Map

| File | Purpose |
|------|---------|
| `src/server/security/secrets.ts` | Env var validation, generation, masking |
| `src/server/security/encryption.ts` | AES-256-GCM encrypt/decrypt, key rotation, KMS interface |
| `src/server/security/audit-logger.ts` | Append-only hash-chained audit store |
| `src/server/security/authenticate-request.ts` | Bearer token + session auth |
| `src/server/security/csrf.ts` | Origin validation + token-based CSRF |
| `src/server/security/rate-limiter.ts` | In-memory sliding window rate limiter |
| `src/server/security/rate-limit.ts` | Redis-backed + in-memory fallback rate limiter |
| `src/server/security/headers.ts` | CSP, HSTS, CORS, and security headers |
| `src/server/security/environment.ts` | NODE_ENV validation |
| `src/server/security/input-validator.ts` | XSS sanitization, email/UUID/currency validation |
| `src/server/security/dependency-scanner.ts` | Known vulnerability scanning |
| `src/server/recovery/backup-manager.ts` | Database + config backup via pg_dump |
| `src/server/recovery/restore-manager.ts` | Restore via pg_restore |
| `src/server/recovery/recovery-validator.ts` | Backup integrity + disaster recovery drills |
| `src/server/installer/migration-runner.ts` | Prisma migration orchestration + checksums |
