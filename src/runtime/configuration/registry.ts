/**
 * Configuration Runtime — Prisma-backed Configuration Registry
 *
 * Phase 24.0B
 *
 * Canonical configuration service. All modules read config here.
 * Prisma is source of truth. In-memory cache for performance.
 * Change events for reactive updates.
 */

import { EventEmitter } from 'node:events';
import { PrismaClient, RuntimeConfigScope, RuntimeConfigStatus } from '@prisma/client';
import type {
  ConfigScope,
  ConfigValue,
  ConfigEntry,
  ConfigAuditEntry,
  GetConfigInput,
  SetConfigInput,
  ConfigResolutionResult,
  ConfigSchemaDefinition,
} from '@/server/foundation/config/types';

// ── Types ──────────────────────────────────────────────────────────────────

export type ConfigChangedEvent = {
  type: 'created' | 'updated' | 'deleted';
  key: string;
  scope: string;
  companyId?: string;
  environment?: string;
  previousValue?: ConfigValue;
  newValue?: ConfigValue;
  performedBy?: string;
  timestamp: Date;
};

export interface ConfigurationRuntimeOptions {
  prisma: PrismaClient;
  cacheTtlMs?: number; // default 300_000 (5 min)
  maxCacheSize?: number; // default 1000
}

// ── Cache Entry ────────────────────────────────────────────────────────────

interface CacheEntry {
  entry: ConfigEntry;
  storedAt: number;
}

// ── Configuration Runtime ──────────────────────────────────────────────────

export class ConfigurationRuntime {
  private static instance: ConfigurationRuntime;

  private prisma: PrismaClient;
  private cache = new Map<string, CacheEntry>();
  private schemas = new Map<string, ConfigSchemaDefinition>();
  private events = new EventEmitter();
  private cacheTtlMs: number;
  private maxCacheSize: number;

  // In-memory only (not persisted to Prisma — used for schema registration)
  private schemaDefaults = new Map<string, ConfigSchemaDefinition>();

  constructor(options: ConfigurationRuntimeOptions) {
    this.prisma = options.prisma;
    this.cacheTtlMs = options.cacheTtlMs ?? 300_000;
    this.maxCacheSize = options.maxCacheSize ?? 1000;
    this.events.setMaxListeners(100);
  }

  static getInstance(): ConfigurationRuntime {
    if (!ConfigurationRuntime.instance) {
      throw new Error(
        'ConfigurationRuntime not initialized. Call ConfigurationRuntime.create() first.',
      );
    }
    return ConfigurationRuntime.instance;
  }

  static async create(options: ConfigurationRuntimeOptions): Promise<ConfigurationRuntime> {
    if (ConfigurationRuntime.instance) {
      await ConfigurationRuntime.instance.shutdown();
    }
    ConfigurationRuntime.instance = new ConfigurationRuntime(options);
    return ConfigurationRuntime.instance;
  }

  async shutdown(): Promise<void> {
    this.events.removeAllListeners();
    this.cache.clear();
    this.schemas.clear();
    this.schemaDefaults.clear();
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  async loadAll(): Promise<void> {
    // Warm cache from Prisma
    const configs = await this.prisma.runtimeConfiguration.findMany({
      where: { status: RuntimeConfigStatus.ACTIVE },
    });

    for (const row of configs) {
      const entry = this.rowToEntry(row);
      const cacheKey = this.buildCacheKey(entry);
      this.cache.set(cacheKey, { entry, storedAt: Date.now() });
    }
  }

  // ── Configuration CRUD ─────────────────────────────────────────────────

  async set(input: SetConfigInput): Promise<ConfigEntry> {
    // Validate against schema if registered
    const schema = this.schemas.get(input.key);
    if (schema) {
      this.validateAgainstSchema(input.value, schema);
    }

    const scope = this.mapScope(input.scope);
    const cacheKey = this.buildCacheKeyFromInput(input);

    // Check existing for version increment
    const existing = this.cache.get(cacheKey)?.entry;

    // Upsert to Prisma
    const row = await this.prisma.runtimeConfiguration.upsert({
      where: {
        key_scope_companyId_environment_provider: {
          key: input.key,
          scope,
          companyId: input.tenantId ?? null,
          environment: (input.environment ?? null) as string | null,
          provider: input.providerName ?? null,
        } as any,
      },
      create: {
        key: input.key,
        scope,
        value: input.value as any,
        companyId: input.tenantId ?? null,
        environment: input.environment ?? null,
        provider: input.providerName ?? null,
        sensitive: input.sensitive ?? false,
        description: input.description,
        schemaKey: schema?.key,
        createdBy: input.performedBy,
        updatedBy: input.performedBy,
        version: 1,
      },
      update: {
        value: input.value as any,
        updatedBy: input.performedBy,
        version: { increment: 1 },
        status: RuntimeConfigStatus.ACTIVE,
      },
    });

    // Create version history
    await this.prisma.runtimeConfigurationVersion.create({
      data: {
        configId: row.id,
        companyId: input.tenantId ?? null,
        value: input.value as any,
        version: row.version,
        changedBy: input.performedBy,
        changeNote: input.reason,
      },
    });

    const entry = this.rowToEntry(row);

    // Update cache
    this.setCache(cacheKey, entry);

    // Publish change event
    this.events.emit('config.changed', {
      type: existing ? 'updated' : 'created',
      key: input.key,
      scope: input.scope,
      companyId: input.tenantId,
      environment: input.environment,
      previousValue: existing?.value,
      newValue: input.value,
      performedBy: input.performedBy,
      timestamp: new Date(),
    } satisfies ConfigChangedEvent);

    return entry;
  }

  async get(input: GetConfigInput): Promise<ConfigEntry | undefined> {
    const { key, tenantId, environment, fallbackToGlobal = true } = input;

    // Try cache first (with hierarchical resolution)
    const cacheKey = this.buildResolutionCacheKey(key, tenantId, environment, fallbackToGlobal);
    const cached = this.cache.get(cacheKey);
    if (cached && !this.isCacheExpired(cached)) {
      return cached.entry;
    }

    // Query Prisma with hierarchical resolution
    // Priority: Environment+Tenant > Tenant > Global
    const entries = await this.prisma.runtimeConfiguration.findMany({
      where: {
        key,
        status: RuntimeConfigStatus.ACTIVE,
        OR: [
          // Environment-specific (highest priority)
          ...(environment ? [{
            scope: RuntimeConfigScope.ENVIRONMENT,
            companyId: tenantId ?? null,
            environment,
          }] : []),
          // Tenant-specific
          ...(tenantId ? [{
            scope: RuntimeConfigScope.TENANT,
            companyId: tenantId,
          }] : []),
          // Global (fallback)
          ...(fallbackToGlobal ? [{
            scope: RuntimeConfigScope.GLOBAL,
            companyId: null,
          }] : []),
        ],
      } as any,
      orderBy: [
        { scope: 'asc' }, // ENVIRONMENT < TENANT < GLOBAL alphabetically
      ],
    });

    // Sort by scope priority (ENVIRONMENT=0 < TENANT=1 < GLOBAL=2)
    const scopePriority: Record<string, number> = {
      ENVIRONMENT: 0,
      TENANT: 1,
      PROVIDER: 2,
      GLOBAL: 3,
    };
    entries.sort((a, b) => (scopePriority[a.scope] ?? 99) - (scopePriority[b.scope] ?? 99));

    if (entries.length === 0) return undefined;

    const entry = this.rowToEntry(entries[0]);
    this.setCache(cacheKey, entry);
    return entry;
  }

  async resolve(input: GetConfigInput): Promise<ConfigResolutionResult | undefined> {
    const entry = await this.get(input);
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

  async getValue<T>(key: string, defaultValue: T, tenantId?: string, environment?: string): Promise<T> {
    const result = await this.resolve({ key, tenantId, environment: environment as any });
    if (!result) return defaultValue;
    return result.value as T;
  }

  async has(key: string, tenantId?: string, environment?: string): Promise<boolean> {
    return (await this.resolve({ key, tenantId, environment: environment as any })) !== undefined;
  }

  async delete(key: string, scope: ConfigScope, tenantId?: string, environment?: string, performedBy?: string): Promise<boolean> {
    const prismaScope = this.mapScope(scope);
    const result = await this.prisma.runtimeConfiguration.updateMany({
      where: {
        key,
        scope: prismaScope,
        companyId: tenantId ?? null,
        environment: environment ?? null,
      },
      data: {
        status: RuntimeConfigStatus.DELETED,
        updatedBy: performedBy,
      },
    });

    if (result.count > 0) {
      // Invalidate cache
      this.invalidateCache(key, tenantId, environment);

      this.events.emit('config.changed', {
        type: 'deleted',
        key,
        scope,
        companyId: tenantId,
        environment,
        performedBy,
        timestamp: new Date(),
      } satisfies ConfigChangedEvent);
    }

    return result.count > 0;
  }

  // ── Feature Flags ──────────────────────────────────────────────────────

  async isFeatureEnabled(key: string, tenantId?: string, environment?: string): Promise<boolean> {
    const flag = await this.prisma.runtimeFeatureFlag.findUnique({
      where: { key },
    });
    if (!flag || flag.status !== 'ACTIVE') return false;
    if (!flag.enabled) return false;

    // Check expiration
    if (flag.expiresAt && flag.expiresAt < new Date()) return false;
    // Check scheduled activation
    if (flag.activatesAt && flag.activatesAt > new Date()) return false;

    // Check tenant override
    if (tenantId) {
      const override = await this.prisma.runtimeFeatureFlagOverride.findUnique({
        where: { flagId_companyId: { flagId: flag.id, companyId: tenantId } },
      });
      if (override) return override.enabled;
    }

    // Check allowed tenants
    if (tenantId && flag.allowedTenants) {
      const allowed = flag.allowedTenants.split(',').map(s => s.trim());
      if (allowed.length > 0 && !allowed.includes(tenantId)) return false;
    }

    // Check percentage rollout
    if (flag.rolloutStrategy === 'PERCENTAGE' && flag.percentage != null && tenantId) {
      const hash = this.hashString(tenantId + key);
      return (hash % 100) < flag.percentage;
    }

    // Check environment
    if (flag.rolloutStrategy === 'ENVIRONMENT' && environment && flag.allowedEnvs) {
      const envs = flag.allowedEnvs.split(',').map(s => s.trim());
      return envs.includes(environment);
    }

    return flag.enabled;
  }

  async setFeatureFlag(key: string, enabled: boolean, performedBy: string): Promise<void> {
    await this.prisma.runtimeFeatureFlag.update({
      where: { key },
      data: { enabled, updatedBy: performedBy },
    });
    this.events.emit('flag.changed', { key, enabled, performedBy, timestamp: new Date() });
  }

  async setFeatureFlagOverride(key: string, companyId: string, enabled: boolean, performedBy: string): Promise<void> {
    const flag = await this.prisma.runtimeFeatureFlag.findUnique({ where: { key } });
    if (!flag) throw new Error(`Feature flag '${key}' not found`);

    await this.prisma.runtimeFeatureFlagOverride.upsert({
      where: { flagId_companyId: { flagId: flag.id, companyId } },
      create: { flagId: flag.id, companyId, enabled, enabledBy: performedBy },
      update: { enabled, enabledBy: performedBy },
    });
    this.events.emit('flag.changed', { key, companyId, enabled, performedBy, timestamp: new Date() });
  }

  async getAllFeatureFlags(): Promise<Array<{
    key: string;
    enabled: boolean;
    description: string | null;
    tags: string | null;
    ownerTeam: string | null;
    rolloutStrategy: string;
    percentage: number | null;
    status: string;
  }>> {
    return this.prisma.runtimeFeatureFlag.findMany({
      select: {
        key: true,
        enabled: true,
        description: true,
        tags: true,
        ownerTeam: true,
        rolloutStrategy: true,
        percentage: true,
        status: true,
      },
      orderBy: { key: 'asc' },
    });
  }

  // ── Schema Registration ────────────────────────────────────────────────

  registerSchema(schema: ConfigSchemaDefinition): void {
    this.schemas.set(schema.key, schema);
    this.schemaDefaults.set(schema.key, schema);
  }

  getSchema(key: string): ConfigSchemaDefinition | undefined {
    return this.schemas.get(key);
  }

  async validateAll(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    for (const [key, schema] of this.schemas) {
      if (schema.required && !(await this.has(key))) {
        errors.push(`Required configuration '${key}' is not set.`);
      }
    }
    return { valid: errors.length === 0, errors };
  }

  // ── Events ─────────────────────────────────────────────────────────────

  onChange(handler: (event: ConfigChangedEvent) => void): () => void {
    this.events.on('config.changed', handler);
    return () => this.events.off('config.changed', handler);
  }

  onFlagChange(handler: (event: any) => void): () => void {
    this.events.on('flag.changed', handler);
    return () => this.events.off('flag.changed', handler);
  }

  // ── Audit ──────────────────────────────────────────────────────────────

  async getAuditLog(key?: string, companyId?: string, limit = 100): Promise<ConfigAuditEntry[]> {
    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (key) {
      // Find config IDs matching the key
      const configs = await this.prisma.runtimeConfiguration.findMany({
        where: { key },
        select: { id: true },
      });
      where.configId = { in: configs.map((c: any) => c.id) };
    }

    const versions = await this.prisma.runtimeConfigurationVersion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Fetch config keys in batch
    const configIds = [...new Set(versions.map((v: any) => v.configId))];
    const configs = await this.prisma.runtimeConfiguration.findMany({
      where: { id: { in: configIds } },
      select: { id: true, key: true, scope: true, environment: true },
    });
    const configMap = new Map(configs.map((c: any) => [c.id, c]));

    return versions.map((v: any) => {
      const config = configMap.get(v.configId);
      return {
        id: v.id,
        key: config?.key ?? 'unknown',
        action: v.version === 1 ? 'CREATE' : 'UPDATE',
        previousValue: null,
        newValue: v.value as ConfigValue,
        scope: this.unmapScope(config?.scope ?? 'GLOBAL'),
        tenantId: v.companyId ?? undefined,
        environment: config?.environment as any,
        performedBy: v.changedBy ?? 'system',
        timestamp: v.createdAt,
        reason: v.changeNote ?? undefined,
      };
    });
  }

  // ── Health ─────────────────────────────────────────────────────────────

  async healthCheck(): Promise<{ healthy: boolean; configCount: number; cacheSize: number }> {
    const configCount = await this.prisma.runtimeConfiguration.count({
      where: { status: RuntimeConfigStatus.ACTIVE },
    });
    return {
      healthy: true,
      configCount,
      cacheSize: this.cache.size,
    };
  }

  // ── Private Helpers ────────────────────────────────────────────────────

  private rowToEntry(row: any): ConfigEntry {
    return {
      key: row.key,
      value: row.value as ConfigValue,
      type: 'json',
      scope: this.unmapScope(row.scope),
      environment: row.environment,
      tenantId: row.companyId,
      providerName: row.provider,
      description: row.description,
      sensitive: row.sensitive,
      overridable: true,
      version: row.version,
      lastModifiedBy: row.updatedBy ?? row.createdBy ?? 'system',
      lastModifiedAt: row.updatedAt,
      createdAt: row.createdAt,
    };
  }

  private mapScope(scope: ConfigScope): RuntimeConfigScope {
    const map: Record<string, RuntimeConfigScope> = {
      GLOBAL: RuntimeConfigScope.GLOBAL,
      TENANT: RuntimeConfigScope.TENANT,
      ENVIRONMENT: RuntimeConfigScope.ENVIRONMENT,
      PROVIDER: RuntimeConfigScope.PROVIDER,
      FEATURE_FLAG: RuntimeConfigScope.GLOBAL, // flags stored separately
    };
    return map[scope] ?? RuntimeConfigScope.GLOBAL;
  }

  private unmapScope(scope: string): ConfigScope {
    const map: Record<string, ConfigScope> = {
      GLOBAL: 'GLOBAL' as any,
      TENANT: 'TENANT' as any,
      ENVIRONMENT: 'ENVIRONMENT' as any,
      PROVIDER: 'PROVIDER' as any,
    };
    return map[scope] ?? 'GLOBAL' as any;
  }

  private buildCacheKey(entry: ConfigEntry): string {
    return `${entry.scope}:${entry.key}:${entry.tenantId ?? '_'}:${entry.environment ?? '_'}:${entry.providerName ?? '_'}`;
  }

  private buildCacheKeyFromInput(input: SetConfigInput): string {
    return `${input.scope}:${input.key}:${input.tenantId ?? '_'}:${input.environment ?? '_'}:${input.providerName ?? '_'}`;
  }

  private buildResolutionCacheKey(key: string, tenantId?: string, environment?: string, fallbackToGlobal = true): string {
    return `resolve:${key}:${tenantId ?? '_'}:${environment ?? '_'}:${fallbackToGlobal}`;
  }

  private setCache(key: string, entry: ConfigEntry): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxCacheSize) {
      const oldest = this.cache.keys().next().value;
      if (oldest) this.cache.delete(oldest);
    }
    this.cache.set(key, { entry, storedAt: Date.now() });
  }

  private isCacheExpired(cached: CacheEntry): boolean {
    return Date.now() - cached.storedAt > this.cacheTtlMs;
  }

  private invalidateCache(key: string, tenantId?: string, environment?: string): void {
    // Invalidate all variants of this key
    const keysToDelete: string[] = [];
    for (const k of this.cache.keys()) {
      if (k.includes(key)) keysToDelete.push(k);
    }
    for (const k of keysToDelete) this.cache.delete(k);
  }

  private validateAgainstSchema(value: ConfigValue, schema: ConfigSchemaDefinition): void {
    if (schema.type === 'number' && typeof value === 'number') {
      if (schema.min !== undefined && value < schema.min) {
        throw new Error(`Config '${schema.key}' value ${value} is below minimum ${schema.min}.`);
      }
      if (schema.max !== undefined && value > schema.max) {
        throw new Error(`Config '${schema.key}' value ${value} is above maximum ${schema.max}.`);
      }
    }
    if (schema.type === 'string' && typeof value === 'string') {
      if (schema.allowedValues && !schema.allowedValues.includes(value)) {
        throw new Error(`Config '${schema.key}' value '${value}' not in allowed: ${schema.allowedValues.join(', ')}.`);
      }
      if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
        throw new Error(`Config '${schema.key}' value '${value}' does not match pattern '${schema.pattern}'.`);
      }
    }
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
