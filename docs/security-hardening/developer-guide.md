# Developer Guide

## Setting Up Local Development

### 1. Clone and install
```bash
git clone https://github.com/perionyx/vaultareloaded.git
cd vaultareloaded
pnpm install
```

### 2. Create `.env` file
```bash
cp .env.example .env
```

Required minimal variables:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vaultareloaded
ENCRYPTION_KEY=<generated 64 hex chars>
ENCRYPTION_KEY_ID=v1
JWT_SECRET=<generated min 32 chars>
AUTH_SECRET=<generated min 32 chars>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start database
```bash
docker compose up -d db
pnpm prisma migrate dev
pnpm prisma db seed
```

### 4. Start development server
```bash
pnpm dev
```

### 5. Verify security setup
```bash
node -e "
const { secretsValidator } = require('./src/server/security/secrets');
const result = secretsValidator.validate({ environment: 'development' });
console.log('Valid:', result.valid);
if (!result.valid) console.log('Issues:', result.missing, result.warnings);
"
```

## Generating Development Secrets

```bash
# Generate ENCRYPTION_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('base64url'))"

# Generate AUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

## Running Tests

```bash
# Full test suite
pnpm test

# Security-specific tests (if available)
pnpm test -- src/server/security/
pnpm test -- src/server/recovery/
pnpm test -- src/server/installer/

# Type checking
pnpm typecheck

# Production build
pnpm build
```

## Common Development Workflows

### Adding a new API route
```typescript
import { authenticateRequest } from "@/server/security/authenticate-request";

export async function GET(request: Request) {
  const ctx = await authenticateRequest(request);
  // ctx.userId, ctx.companyId available
  return Response.json({ /* ... */ });
}

export async function POST(request: Request) {
  const ctx = await authenticateRequest(request, "write:resource");
  // Scope enforced
  return Response.json({ /* ... */ });
}
```

### Recording an audit event
```typescript
import { securityAuditLogger } from "@/server/security/audit-logger";

await securityAuditLogger.log({
  type: "payment",
  severity: "info",
  userId: "usr_xxx",
  companyId: "cmp_xxx",
  action: "payment.processed",
  resource: "pay_xxx",
  details: JSON.stringify({ amount: 1500, currency: "USD" }),
  ip: request.headers.get("x-forwarded-for") ?? undefined,
  correlationId: request.headers.get("x-correlation-id") ?? undefined,
});
```

### Encrypting sensitive data
```typescript
import { encrypt, decrypt } from "@/server/security/encryption";

// Store
const encrypted = encrypt(sensitiveValue);
await prisma.sensitiveField.create({ data: { value: encrypted } });

// Retrieve
const record = await prisma.sensitiveField.findUnique({ where: { id } });
const plaintext = decrypt(record.value);
```

### Creating a backup
```typescript
import { backupManager } from "@/server/recovery/backup-manager";

// Manual backup
const point = await backupManager.createBackup("database", "manual-snapshot");

// Pre-upgrade backup
const preUp = await backupManager.preUpgradeBackup("2.1.0");

// Verify integrity
const verification = await backupManager.verifyBackup(point.id);
```

### Running a recovery drill
```typescript
import { recoveryValidator } from "@/server/recovery/recovery-validator";

const drill = await recoveryValidator.runDrill();
console.log(`Drill ${drill.allPassed ? "PASSED" : "FAILED"}`);
drill.steps.forEach(s => console.log(`  ${s.name}: ${s.passed ? "✓" : "✗"} (${s.duration}ms)`));
```

### Verifying migrations
```typescript
import { migrationRunner } from "@/server/installer/migration-runner";

const result = await migrationRunner.verifyMigrations();
if (!result.verified) {
  console.error("Migration integrity issues:", result.inconsistencies);
}
```

## Development Tips

- **Never commit `.env` files** — they are in `.gitignore`. Use `.env.example` for reference.
- **Use `secretsValidator.diagnose()`** in your startup script to verify environment setup.
- **Test with `environment: "test"`** — the validator is less strict and won't reject test defaults.
- **For local encryption testing**, generate a fresh key — NEVER use production keys locally.
- **Backup files** go to `.backups/` (also gitignored). Clear this directory with `rm -rf .backups/*` when testing.
- **Audit logs** are stored in the database. In dev, you can truncate with `prisma.auditLog.deleteMany()`.
