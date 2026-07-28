/**
 * Enterprise Configuration Platform — Types
 *
 * Phase 24.0
 *
 * Hierarchical configuration: Global → Tenant → Environment → Feature Flags → Provider
 */

// ── Configuration Scope ──────────────────────────────────────────────────────

export enum ConfigScope {
  /** System-wide configuration. Applies to all tenants. */
  GLOBAL = "GLOBAL",
  /** Tenant-specific configuration. Overrides global. */
  TENANT = "TENANT",
  /** Environment-specific (dev, staging, prod). Overrides tenant. */
  ENVIRONMENT = "ENVIRONMENT",
  /** Feature flag toggle. Can be scoped to tenant or environment. */
  FEATURE_FLAG = "FEATURE_FLAG",
  /** Provider-specific configuration (API keys, endpoints, timeouts). */
  PROVIDER = "PROVIDER",
}

export enum ConfigEnvironment {
  DEVELOPMENT = "development",
  STAGING = "staging",
  PRODUCTION = "production",
  TEST = "test",
}

// ── Configuration Value Types ────────────────────────────────────────────────

export type ConfigValue = string | number | boolean | null | Record<string, unknown> | unknown[];

export interface ConfigEntry {
  /** Unique key (e.g., "auth.session.timeout", "feature.ap-dashboard") */
  key: string;
  /** The configuration value. */
  value: ConfigValue;
  /** Type descriptor for runtime validation. */
  type: "string" | "number" | "boolean" | "json" | "array";
  /** Scope this configuration applies to. */
  scope: ConfigScope;
  /** Environment (if scope is ENVIRONMENT). */
  environment?: ConfigEnvironment;
  /** Tenant ID (if scope is TENANT or FEATURE_FLAG). */
  tenantId?: string;
  /** Feature flag key (if scope is FEATURE_FLAG). */
  featureKey?: string;
  /** Provider name (if scope is PROVIDER). */
  providerName?: string;
  /** Description for developers. */
  description?: string;
  /** Whether this config is sensitive (should not be logged/exported). */
  sensitive: boolean;
  /** Whether this config can be overridden at a lower scope. */
  overridable: boolean;
  /** Version for optimistic concurrency. */
  version: number;
  /** Who last modified this config. */
  lastModifiedBy: string;
  /** When last modified. */
  lastModifiedAt: Date;
  /** When this config was created. */
  createdAt: Date;
}

// ── Feature Flags ────────────────────────────────────────────────────────────

export interface FeatureFlag {
  /** Feature flag key (e.g., "ap.duplicate-detection", "ai.cfo-assistant") */
  key: string;
  /** Human-readable name. */
  name: string;
  /** Description. */
  description: string;
  /** Whether this flag is enabled globally. */
  enabled: boolean;
  /** Tenant-specific overrides. */
  tenantOverrides: Map<string, boolean>;
  /** Percentage rollout (0-100). -1 = not using percentage rollout. */
  percentageRollout: number;
  /** Allowed tenant IDs for gradual rollout. */
  allowedTenants: Set<string>;
  /** Excluded tenant IDs. */
  excludedTenants: Set<string>;
  /** When the flag was created. */
  createdAt: Date;
  /** When the flag was last modified. */
  lastModifiedAt: Date;
  /** Who created the flag. */
  createdBy: string;
  /** Tags for grouping. */
  tags: string[];
}

// ── Configuration Change History ─────────────────────────────────────────────

export interface ConfigAuditEntry {
  id: string;
  key: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "FLAG_ENABLE" | "FLAG_DISABLE";
  previousValue: ConfigValue | null;
  newValue: ConfigValue | null;
  scope: ConfigScope;
  tenantId?: string;
  environment?: ConfigEnvironment;
  performedBy: string;
  timestamp: Date;
  reason?: string;
}

// ── Configuration Schema (for typed config) ──────────────────────────────────

export interface ConfigSchemaDefinition {
  /** Dot-notation key. */
  key: string;
  /** Expected type. */
  type: "string" | "number" | "boolean" | "json" | "array";
  /** Default value if not set. */
  defaultValue: ConfigValue;
  /** Whether this config is required. */
  required: boolean;
  /** Minimum value (for numbers). */
  min?: number;
  /** Maximum value (for numbers). */
  max?: number;
  /** Allowed values (for strings). */
  allowedValues?: string[];
  /** Regex pattern (for strings). */
  pattern?: string;
  /** Description. */
  description: string;
  /** Sensitivity level. */
  sensitive: boolean;
  /** Scope. */
  scope: ConfigScope;
}

// ── Request/Response Types ───────────────────────────────────────────────────

export interface GetConfigInput {
  key: string;
  tenantId?: string;
  environment?: ConfigEnvironment;
  /** Whether to fall back to global if tenant-specific not found. */
  fallbackToGlobal?: boolean;
}

export interface SetConfigInput {
  key: string;
  value: ConfigValue;
  type: ConfigEntry["type"];
  scope: ConfigScope;
  tenantId?: string;
  environment?: ConfigEnvironment;
  providerName?: string;
  description?: string;
  sensitive?: boolean;
  overridable?: boolean;
  performedBy: string;
  reason?: string;
}

export interface ConfigResolutionResult {
  key: string;
  value: ConfigValue;
  source: ConfigScope;
  tenantId?: string;
  environment?: ConfigEnvironment;
  version: number;
}
