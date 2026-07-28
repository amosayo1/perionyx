# Configuration Platform

**Phase**: 24.0
**Status**: Complete
**Law Compliance**: Law 7 (Architecture Governed Through Automation)

## Purpose

Centralized configuration management with hierarchical resolution, feature flags, schema validation, and audit trail.

## Architecture

```
src/server/foundation/config/
├── types.ts          — ConfigScope, FeatureFlag, ConfigSchemaDefinition
├── registry.ts       — ConfigurationRegistry singleton
├── feature-flags.ts  — FeatureFlagManager
└── index.ts          — Barrel export
```

## Configuration Hierarchy

Resolution order (highest to lowest priority):

1. **Tenant** — Per-tenant overrides
2. **Environment** — Per-environment (dev/staging/prod)
3. **Global** — Platform-wide defaults

## Key Capabilities

1. **Hierarchical resolution** — Tenant > Environment > Global
2. **Typed config** — TypeScript generics for type-safe config
3. **Schema validation** — Zod-based validation on set
4. **Feature flags** — Boolean flags with percentage rollout
5. **Audit trail** — Every config change logged with who/when/what

## Feature Flags

6 built-in flags:

| Flag | Default | Description |
|------|---------|-------------|
| `ap.enableDuplicateDetection` | false | AI-powered duplicate invoice detection |
| `ap.enableAutoApproval` | false | Auto-approve invoices under threshold |
| `ap.enablePaymentScheduling` | false | Smart payment scheduling |
| `treasury.enableCashForecasting` | false | ML-based cash flow forecasting |
| `workflow.enableAIAssist` | false | AI-assisted workflow design |
| `platform.enableBetaFeatures` | false | Show beta features in UI |

## Usage

```typescript
import { ConfigurationRegistry, FeatureFlagManager } from "@/server/foundation/config";

const config = ConfigurationRegistry.getInstance();
const flags = FeatureFlagManager.getInstance();

// Set config
config.set("email.smtp.host", "smtp.example.com", {
  scope: ConfigScope.GLOBAL,
  updatedBy: "admin@company.com",
});

// Get config
const host = config.get<string>("email.smtp.host", { tenantId: "tenant-1" });

// Feature flag
if (flags.isEnabled("ap.enableDuplicateDetection", { tenantId: "tenant-1" })) {
  // Run duplicate detection
}
```
