# Secrets Management

## How Secrets Are Validated

`SecretsValidator` (`src/server/security/secrets.ts`) validates environment variables at application startup:

```typescript
const result = secretsValidator.validate({ environment: "production" });
// result.valid, result.critical, result.missing, result.errors, result.warnings
```

Validation rules:

| Secret | Pattern | Why |
|--------|---------|-----|
| `JWT_SECRET` | `^.{32,}$` (min 32 chars) | Prevents brute-force token forgery |
| `ENCRYPTION_KEY` | `^[a-fA-F0-9]{64}$` (32 bytes hex) | Must match AES-256 key length |
| `DATABASE_URL` | `^postgresql://.+` | Only PostgreSQL accepted |
| `REDIS_URL` | `^redis(s)?://.+` | Optional, graceful fallback if missing |
| `AUTH_SECRET` | `^.{32,}$` (min 32 chars) | Prevents session forgery |

In production, the validator also rejects known default values (test keys) and requires `NODE_ENV=production`.

## Required Environment Variables

### Critical (all environments)
```
JWT_SECRET=<min 32 chars>
ENCRYPTION_KEY=<64 hex chars>
ENCRYPTION_KEY_ID=v1
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
AUTH_SECRET=<min 32 chars>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production Additional
```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=notifications@perionyx.com
SMTP_PASS=<smtp password>
SENTRY_DSN=https://key@sentry.io/project
```

## How to Generate Secrets

Use the static methods on `SecretsValidator`:

```bash
node -e "const { SecretsValidator } = require('./src/server/security/secrets'); console.log('ENCRYPTION_KEY:', SecretsValidator.generateEncryptionKey())"
node -e "const { SecretsValidator } = require('./src/server/security/secrets'); console.log('JWT_SECRET:', SecretsValidator.generateJwtSecret())"
node -e "const { SecretsValidator } = require('./src/server/security/secrets'); console.log('AUTH_SECRET:', SecretsValidator.generateAuthSecret())"
```

Or use the CLI diagnostics:

```bash
npx tsx src/server/security/diagnose.ts
```

## Secret Rotation Process

1. **Generate new secret** using the static generators.
2. **For encryption keys**: call `encryptionService.rotateKey(oldKeyHex, newKeyHex, "v2")`. This stores the old key in `ENCRYPTION_KEY_HISTORY` so existing encrypted data remains decryptable.
3. **For JWT/AUTH secrets**: update the env var and restart all pods. Existing sessions remain valid until their token expires. Set `JWT_SECRET` in deployment ConfigMap and trigger a rolling restart.
4. **Update `.env.production`** and the secret manager (Vault / AWS Secrets Manager / k8s Secrets).
5. **Verify**: run `secretsValidator.validate({ environment: "production" })` after deployment.

## Production Deployment Checklist

- [ ] `ENCRYPTION_KEY` is exactly 64 hex characters, not a default/test value
- [ ] `JWT_SECRET` is at least 32 characters, not `test-jwt-secret-for-testing-only`
- [ ] `AUTH_SECRET` is at least 32 characters
- [ ] `DATABASE_URL` uses SSL (`?sslmode=require`) in production
- [ ] `REDIS_URL` is set for distributed rate limiting
- [ ] `SENTRY_DSN` is set for error tracking
- [ ] `SMTP_*` variables are set for notification delivery
- [ ] `NODE_ENV=production` — validator rejects anything else in prod
- [ ] Secrets are not in source control, `.env` files are in `.gitignore`
- [ ] Secrets are stored in a secret manager (k8s Secrets / AWS Secrets Manager / HashiCorp Vault)

## Diagnostic Commands

```bash
# Diagnose current environment
node -e "
const { secretsValidator } = require('./src/server/security/secrets');
const diag = secretsValidator.diagnose();
console.log(JSON.stringify(diag, null, 2));
"

# Mask a secret for logging
node -e "
const { secretsValidator } = require('./src/server/security/secrets');
console.log(secretsValidator.mask('sk-live-abc123xyz'));
# Output: sk-l*****1xyz
"
```
