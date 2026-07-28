/**
 * Enterprise Configuration Platform — Configuration Registry
 *
 * Phase 24.0
 *
 * Hierarchical configuration with resolution: Global → Tenant → Environment → Feature Flags
 */

import {
  ConfigScope,
  ConfigEnvironment,
  ConfigValue,
  ConfigEntry,
  FeatureFlag,
  ConfigAuditEntry,
  GetConfigInput,
  SetConfigInput,
  ConfigResolutionResult,
  ConfigSchemaDefinition,
} from "./types";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "foundation-config" });

import { BoundedRingBuffer } from "@/lib/bounded-ring-buffer";

// ── Configuration Registry ───────────────────────────────────────────────────

export class ConfigurationRegistry {
  private static instance: ConfigurationRegistry;
  private configs = new Map<string, ConfigEntry>();
  private featureFlags = new Map<string, FeatureFlag>();
  private schemas = new Map<string, ConfigSchemaDefinition>();
  private auditLog = new BoundedRingBuffer<ConfigAuditEntry>(10_000);

  static getInstance(): ConfigurationRegistry {
    if (!ConfigurationRegistry.instance) {
      ConfigurationRegistry.instance = new ConfigurationRegistry();
    }
    return ConfigurationRegistry.instance;
  }

  // ── Configuration CRUD ───────────────────────────────────────────────────

  set(input: SetConfigInput): ConfigEntry {
    // Validate against schema if registered
    const schema = this.schemas.get(input.key);
    if (schema) {
      this.validateAgainstSchema(input.value, schema);
    }

    const key = this.buildKey(input);
    const existing = this.configs.get(key);

    const entry: ConfigEntry = {
      key: input.key,
      value: input.value,
      type: input.type,
      scope: input.scope,
      environment: input.environment,
      tenantId: input.tenantId,
      providerName: input.providerName,
      description: input.description,
      sensitive: input.sensitive ?? false,
      overridable: input.overridable ?? true,
      version: existing ? existing.version + 1 : 1,
      lastModifiedBy: input.performedBy,
      lastModifiedAt: new Date(),
      createdAt: existing?.createdAt ?? new Date(),
    };

    this.configs.set(key, entry);
    log.debug({ key: input.key, scope: input.scope, action: existing ? "UPDATE" : "CREATE" }, "Config entry set");

    this.recordAudit({
      key: input.key,
      action: existing ? "UPDATE" : "CREATE",
      previousValue: existing?.value ?? null,
      newValue: input.value,
      scope: input.scope,
      tenantId: input.tenantId,
      environment: input.environment,
      performedBy: input.performedBy,
      reason: input.reason,
    });

    return entry;
  }

  get(input: GetConfigInput): ConfigEntry | undefined {
    const { key, tenantId, environment, fallbackToGlobal = true } = input;

    // Resolution order: Environment → Tenant → Global
    if (environment && tenantId) {
      const envKey = this.buildKeyForScope(key, ConfigScope.ENVIRONMENT, tenantId, environment);
      const envConfig = this.configs.get(envKey);
      if (envConfig) return envConfig;
    }

    if (tenantId) {
      const tenantKey = this.buildKeyForScope(key, ConfigScope.TENANT, tenantId);
      const tenantConfig = this.configs.get(tenantKey);
      if (tenantConfig) return tenantConfig;
    }

    if (fallbackToGlobal) {
      const globalKey = this.buildKeyForScope(key, ConfigScope.GLOBAL);
      return this.configs.get(globalKey);
    }

    return undefined;
  }

  /**
   * Resolve a configuration value with full hierarchical fallback.
   */
  resolve(input: GetConfigInput): ConfigResolutionResult | undefined {
    const entry = this.get(input);
    if (!entry) return undefined;

    return {
      key: entry.key,
      value: entry.value,
      source: entry.scope,
      tenantId: entry.tenantId,
      environment: entry.environment,
      version: entry.version,
    };
  }

  /**
   * Get a typed configuration value with default fallback.
   */
  getValue<T>(key: string, defaultValue: T, tenantId?: string, environment?: ConfigEnvironment): T {
    const result = this.resolve({ key, tenantId, environment });
    if (!result) return defaultValue;
    return result.value as T;
  }

  /**
   * Check if a configuration key exists.
   */
  has(key: string, tenantId?: string, environment?: ConfigEnvironment): boolean {
    return this.resolve({ key, tenantId, environment }) !== undefined;
  }

  /**
   * Delete a configuration entry.
   */
  delete(key: string, scope: ConfigScope, tenantId?: string, environment?: ConfigEnvironment, performedBy?: string): boolean {
    const fullKey = this.buildKeyForScope(key, scope, tenantId, environment);
    const existing = this.configs.get(fullKey);
    if (!existing) return false;

    this.configs.delete(fullKey);

    this.recordAudit({
      key,
      action: "DELETE",
      previousValue: existing.value,
      newValue: null,
      scope,
      tenantId,
      environment,
      performedBy: performedBy ?? "system",
    });

    return true;
  }

  // ── Feature Flags ────────────────────────────────────────────────────────

  registerFlag(flag: Omit<FeatureFlag, "tenantOverrides" | "allowedTenants" | "excludedTenants">): void {
    this.featureFlags.set(flag.key, {
      ...flag,
      tenantOverrides: new Map(),
      allowedTenants: new Set(),
      excludedTenants: new Set(),
    });
    log.debug({ flag: flag.key, enabled: flag.enabled }, "Feature flag registered");
  }

  /**
   * Check if a feature flag is enabled for a specific tenant and environment.
   */
  isFeatureEnabled(key: string, tenantId?: string, environment?: ConfigEnvironment): boolean {
    const flag = this.featureFlags.get(key);
    if (!flag) return false;

    // Check exclusions
    if (tenantId && flag.excludedTenants.has(tenantId)) return false;

    // Check tenant-specific override
    if (tenantId && flag.tenantOverrides.has(tenantId)) {
      return flag.tenantOverrides.get(tenantId)!;
    }

    // Check allowed tenants (if set, only these tenants see the feature)
    if (tenantId && flag.allowedTenants.size > 0 && !flag.allowedTenants.has(tenantId)) {
      return false;
    }

    // Check percentage rollout
    if (flag.percentageRollout >= 0 && flag.percentageRollout < 100 && tenantId) {
      const hash = this.hashString(tenantId + key);
      return (hash % 100) < flag.percentageRollout;
    }

    return flag.enabled;
  }

  setFlagOverride(key: string, tenantId: string, enabled: boolean, performedBy: string): void {
    const flag = this.featureFlags.get(key);
    if (!flag) throw new Error(`Feature flag '${key}' not found`);

    flag.tenantOverrides.set(tenantId, enabled);
    flag.lastModifiedAt = new Date();

    this.recordAudit({
      key: `flag:${key}`,
      action: enabled ? "FLAG_ENABLE" : "FLAG_DISABLE",
      previousValue: !enabled,
      newValue: enabled,
      scope: ConfigScope.FEATURE_FLAG,
      tenantId,
      performedBy,
    });
  }

  setFlagEnabled(key: string, enabled: boolean, performedBy: string): void {
    const flag = this.featureFlags.get(key);
    if (!flag) throw new Error(`Feature flag '${key}' not found`);

    flag.enabled = enabled;
    flag.lastModifiedAt = new Date();

    this.recordAudit({
      key: `flag:${key}`,
      action: enabled ? "FLAG_ENABLE" : "FLAG_DISABLE",
      previousValue: !enabled,
      newValue: enabled,
      scope: ConfigScope.FEATURE_FLAG,
      performedBy,
    });
  }

  getFlag(key: string): FeatureFlag | undefined {
    return this.featureFlags.get(key);
  }

  getAllFlags(): FeatureFlag[] {
    return Array.from(this.featureFlags.values());
  }

  // ── Schema Registration ──────────────────────────────────────────────────

  registerSchema(schema: ConfigSchemaDefinition): void {
    this.schemas.set(schema.key, schema);

    // Set default value if not already configured
    if (!this.has(schema.key)) {
      this.set({
        key: schema.key,
        value: schema.defaultValue,
        type: schema.type,
        scope: schema.scope,
        sensitive: schema.sensitive,
        performedBy: "system",
        reason: "Default value from schema registration",
      });
    }
  }

  getSchema(key: string): ConfigSchemaDefinition | undefined {
    return this.schemas.get(key);
  }

  validateAll(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [key, schema] of this.schemas) {
      if (schema.required && !this.has(key)) {
        errors.push(`Required configuration '${key}' is not set.`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  // ── Audit ────────────────────────────────────────────────────────────────

  getAuditLog(key: string | undefined, tenantId: string): ConfigAuditEntry[] {
    return this.auditLog.filter((e) => {
      if (key && e.key !== key) return false;
      if (e.tenantId !== tenantId) return false;
      return true;
    });
  }

  // ── Lookup ───────────────────────────────────────────────────────────────

  getAllKeys(): string[] {
    const keys = new Set<string>();
    for (const entry of this.configs.values()) {
      keys.add(entry.key);
    }
    return Array.from(keys);
  }

  getTenantConfigs(tenantId: string): ConfigEntry[] {
    return Array.from(this.configs.values()).filter((e) => e.tenantId === tenantId);
  }

  // ── Private Helpers ──────────────────────────────────────────────────────

  private buildKey(input: SetConfigInput): string {
    return this.buildKeyForScope(input.key, input.scope, input.tenantId, input.environment);
  }

  private buildKeyForScope(
    key: string,
    scope: ConfigScope,
    tenantId?: string,
    environment?: ConfigEnvironment,
  ): string {
    switch (scope) {
      case ConfigScope.GLOBAL:
        return `global:${key}`;
      case ConfigScope.TENANT:
        return `tenant:${tenantId}:${key}`;
      case ConfigScope.ENVIRONMENT:
        return `env:${tenantId ?? "_"}:${environment}:${key}`;
      case ConfigScope.FEATURE_FLAG:
        return `flag:${tenantId ?? "_"}:${key}`;
      case ConfigScope.PROVIDER:
        return `provider:${key}`;
      default:
        return key;
    }
  }

  private validateAgainstSchema(value: ConfigValue, schema: ConfigSchemaDefinition): void {
    if (schema.type === "number" && typeof value === "number") {
      if (schema.min !== undefined && value < schema.min) {
        throw new Error(`Config '${schema.key}' value ${value} is below minimum ${schema.min}.`);
      }
      if (schema.max !== undefined && value > schema.max) {
        throw new Error(`Config '${schema.key}' value ${value} is above maximum ${schema.max}.`);
      }
    }

    if (schema.type === "string" && typeof value === "string") {
      if (schema.allowedValues && !schema.allowedValues.includes(value)) {
        throw new Error(`Config '${schema.key}' value '${value}' is not in allowed values: ${schema.allowedValues.join(", ")}.`);
      }
      if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
        throw new Error(`Config '${schema.key}' value '${value}' does not match pattern '${schema.pattern}'.`);
      }
    }
  }

  private recordAudit(entry: Omit<ConfigAuditEntry, "id" | "timestamp">): void {
    this.auditLog.push({
      ...entry,
      id: `cfg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date(),
    });
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }
}

export const configurationRegistry = ConfigurationRegistry.getInstance();
