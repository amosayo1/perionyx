# Secret Management Platform

**Phase**: 24.0
**Status**: Complete
**Law Compliance**: Law 6 (Financial Integrity), Law 8 (Every Platform is Testable)

## Purpose

Secure secret storage, rotation, and lifecycle management. No secrets in code, config files, or version control.

## Architecture

```
src/server/foundation/secrets/
├── types.ts              — ISecretProvider, SecretReference, SecretCategory
├── providers/
│   └── environment.ts    — EnvironmentSecretProvider (env var adapter)
├── manager.ts            — SecretManager
└── index.ts              — Barrel export
```

## Provider Model

Secrets are stored in pluggable providers:

| Provider | Use Case | Status |
|----------|----------|--------|
| Environment | Dev/testing (env vars) | Complete |
| Vault | Production (HashiCorp Vault) | Planned |
| AWS Secrets Manager | AWS production | Planned |
| Azure Key Vault | Azure production | Planned |

## Secret Categories

| Category | Rotation | Example |
|----------|----------|---------|
| DATABASE | Quarterly | DB connection strings |
| API_KEY | Monthly | Third-party API keys |
| OAUTH_CLIENT | Quarterly | OAuth client secrets |
| WEBHOOK_SECRET | Monthly | Webhook signing secrets |
| ENCRYPTION_KEY | Annually | Data encryption keys |
| AUTH_TOKEN | Daily | Session signing keys |
| TLS_CERTIFICATE | Annually | TLS certs |
| SERVICE_ACCOUNT | Quarterly | Service-to-service auth |
| CUSTOM | Configurable | User-defined secrets |

## Key Capabilities

1. **Pluggable providers** — Swap backends without changing consumers
2. **Automatic rotation** — Rotation policies with configurable intervals
3. **Reference resolution** — Resolve secret references in config values
4. **Expiration checks** — Warn on expired secrets
5. **Audit trail** — Every secret access/rotation logged

## Usage

```typescript
import { SecretManager } from "@/server/foundation/secrets";

const secrets = SecretManager.getInstance();

// Store a secret
await secrets.create({
  key: "stripe.apiKey",
  value: "sk_live_...",
  category: SecretCategory.API_KEY,
  companyId: "cmqvfocev0001koor7ragb8bq",
});

// Resolve a reference
const ref: SecretReference = { key: "stripe.apiKey", companyId: "cmqvfocev0001koor7ragb8bq" };
const value = await secrets.resolve(ref);

// Check rotation needed
const needsRotation = secrets.needsRotation("stripe.apiKey");
```

## Security Rules

1. **No plaintext export** — Secrets are never returned in full via API
2. **Audit every access** — Who accessed what, when
3. **Automatic expiration** — Secrets past rotation date are flagged
4. **Tenant isolation** — Secrets scoped to company
5. **Reference pattern** — Config stores `{ "$secret": "key" }`, resolved at runtime
