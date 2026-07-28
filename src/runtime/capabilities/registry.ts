/**
 * Capability Runtime — Prisma-backed Capability Registry
 *
 * Canonical runtime for platform capability registration, health tracking,
 * and discovery. Prisma is source of truth. In-memory cache for performance.
 * Change events for reactive updates across the platform.
 */

import { EventEmitter } from 'node:events';
import {
  PrismaClient,
  Prisma,
  RuntimeCapabilityStatus,
  type RuntimeCapability,
  type RuntimeCapabilityHealthHistory,
} from '@prisma/client';

// ── Types ──────────────────────────────────────────────────────────────────

export type CapabilityCategory =
  | 'INTEGRATION'
  | 'BANKING'
  | 'ERP'
  | 'PAYMENTS'
  | 'IDENTITY'
  | 'NOTIFICATION'
  | 'DOCUMENT'
  | 'AI'
  | 'WORKFLOW'
  | 'AUDIT'
  | 'OBSERVABILITY'
  | 'SEARCH'
  | 'STORAGE'
  | 'SECURITY'
  | 'ANALYTICS';

export type CapabilityRuntimeStatus =
  | 'HEALTHY'
  | 'DEGRADED'
  | 'UNHEALTHY'
  | 'DISABLED'
  | 'UNKNOWN';

export type CapabilityEventType =
  | 'capability.registered'
  | 'capability.updated'
  | 'capability.deregistered'
  | 'capability.health-checked';

export interface CapabilityEvent {
  type: CapabilityEventType;
  capabilityId: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface RegisterCapabilityInput {
  capabilityId: string;
  name: string;
  category: CapabilityCategory;
  companyId?: string;
  platformId?: string;
  status?: CapabilityRuntimeStatus;
  version?: string;
  dependencies?: string;
  createdBy?: string;
  ownerTeam?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateCapabilityInput {
  name?: string;
  category?: CapabilityCategory;
  platformId?: string;
  status?: CapabilityRuntimeStatus;
  version?: string;
  dependencies?: string;
  ownerTeam?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  deprecatedAt?: Date;
  deprecationNote?: string;
}

export interface HealthSummary {
  total: number;
  healthy: number;
  degraded: number;
  unhealthy: number;
  unknown: number;
}

export interface CapabilityRuntimeOptions {
  prisma: PrismaClient;
  cacheTtlMs?: number;
  healthPollingIntervalMs?: number;
}

// ── Cache Entry ────────────────────────────────────────────────────────────

interface CacheEntry {
  cap: RuntimeCapability;
  storedAt: number;
}

// ── Capability Runtime ─────────────────────────────────────────────────────

export class CapabilityRuntime {
  private static instance: CapabilityRuntime;

  private prisma: PrismaClient;
  private cache = new Map<string, CacheEntry>();
  private events = new EventEmitter();
  private cacheTtlMs: number;
  private healthPollingTimer: ReturnType<typeof setInterval> | null = null;

  constructor(options: CapabilityRuntimeOptions) {
    this.prisma = options.prisma;
    this.cacheTtlMs = options.cacheTtlMs ?? 300_000;
    this.events.setMaxListeners(100);
  }

  // ── Singleton ──────────────────────────────────────────────────────────

  static async create(options: CapabilityRuntimeOptions): Promise<CapabilityRuntime> {
    if (CapabilityRuntime.instance) {
      await CapabilityRuntime.instance.shutdown();
    }
    CapabilityRuntime.instance = new CapabilityRuntime(options);
    return CapabilityRuntime.instance;
  }

  async shutdown(): Promise<void> {
    this.stopHealthPolling();
    this.events.removeAllListeners();
    this.cache.clear();
  }

  static getInstance(): CapabilityRuntime {
    if (!CapabilityRuntime.instance) {
      throw new Error(
        'CapabilityRuntime not initialized. Call CapabilityRuntime.create() first.',
      );
    }
    return CapabilityRuntime.instance;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  async loadAll(): Promise<void> {
    const rows = await this.prisma.runtimeCapability.findMany({
      orderBy: { capabilityId: 'asc' },
    });
    for (const row of rows) {
      this.setCache(row.capabilityId, row);
    }
  }

  // ── CRUD ───────────────────────────────────────────────────────────────

  async register(input: RegisterCapabilityInput): Promise<RuntimeCapability> {
    const existing = await this.prisma.runtimeCapability.findUnique({
      where: { capabilityId: input.capabilityId },
    });

    const row = await this.prisma.runtimeCapability.upsert({
      where: { capabilityId: input.capabilityId },
      create: {
        capabilityId: input.capabilityId,
        name: input.name,
        category: input.category,
        companyId: input.companyId ?? null,
        platformId: input.platformId ?? null,
        status: (input.status as RuntimeCapabilityStatus) ?? RuntimeCapabilityStatus.UNKNOWN,
        version: input.version ?? null,
        dependencies: input.dependencies ?? null,
        createdBy: input.createdBy ?? null,
        ownerTeam: input.ownerTeam ?? null,
        description: input.description ?? null,
        ...(input.metadata !== undefined && { metadata: input.metadata as Prisma.InputJsonValue }),
      },
      update: {
        name: input.name,
        category: input.category,
        companyId: input.companyId ?? null,
        platformId: input.platformId ?? null,
        status: (input.status as RuntimeCapabilityStatus) ?? RuntimeCapabilityStatus.UNKNOWN,
        version: input.version ?? null,
        dependencies: input.dependencies ?? null,
        createdBy: input.createdBy ?? null,
        ownerTeam: input.ownerTeam ?? null,
        description: input.description ?? null,
        ...(input.metadata !== undefined && { metadata: input.metadata as Prisma.InputJsonValue }),
      },
    });

    this.setCache(input.capabilityId, row);
    this.emitEvent('capability.registered', input.capabilityId, {
      upserted: !!existing,
    });

    return row;
  }

  async update(
    capabilityId: string,
    updates: UpdateCapabilityInput,
  ): Promise<RuntimeCapability> {
    const existing = await this.requireCapability(capabilityId);

    const row = await this.prisma.runtimeCapability.update({
      where: { id: existing.id },
      data: {
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.category !== undefined && { category: updates.category }),
        ...(updates.platformId !== undefined && { platformId: updates.platformId }),
        ...(updates.status !== undefined && {
          status: updates.status as RuntimeCapabilityStatus,
        }),
        ...(updates.version !== undefined && { version: updates.version }),
        ...(updates.dependencies !== undefined && { dependencies: updates.dependencies }),
        ...(updates.ownerTeam !== undefined && { ownerTeam: updates.ownerTeam }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.metadata !== undefined && { metadata: updates.metadata as Prisma.InputJsonValue }),
        ...(updates.deprecatedAt !== undefined && { deprecatedAt: updates.deprecatedAt }),
        ...(updates.deprecationNote !== undefined && {
          deprecationNote: updates.deprecationNote,
        }),
      },
    });

    this.setCache(capabilityId, row);
    this.emitEvent('capability.updated', capabilityId, { fields: Object.keys(updates) });

    return row;
  }

  async deregister(capabilityId: string): Promise<void> {
    const existing = await this.requireCapability(capabilityId);

    await this.prisma.runtimeCapability.update({
      where: { id: existing.id },
      data: {
        status: RuntimeCapabilityStatus.DISABLED,
        deprecatedAt: existing.deprecatedAt ?? new Date(),
        deprecationNote: existing.deprecationNote ?? 'Deregistered via CapabilityRuntime',
      },
    });

    this.cache.delete(capabilityId);
    this.emitEvent('capability.deregistered', capabilityId);
  }

  // ── Read ───────────────────────────────────────────────────────────────

  async get(capabilityId: string): Promise<RuntimeCapability | undefined> {
    const cached = this.cache.get(capabilityId);
    if (cached && !this.isCacheExpired(cached)) {
      return cached.cap;
    }

    const row = await this.prisma.runtimeCapability.findUnique({
      where: { capabilityId },
    });

    if (row) {
      this.setCache(capabilityId, row);
    }

    return row ?? undefined;
  }

  async query(
    category?: CapabilityCategory,
    platformId?: string,
    status?: CapabilityRuntimeStatus,
  ): Promise<RuntimeCapability[]> {
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (platformId) where.platformId = platformId;
    if (status) where.status = status;

    return this.prisma.runtimeCapability.findMany({
      where,
      orderBy: { capabilityId: 'asc' },
    });
  }

  // ── Health ─────────────────────────────────────────────────────────────

  async updateHealth(
    capabilityId: string,
    status: CapabilityRuntimeStatus,
    latencyMs?: number,
    error?: string,
  ): Promise<RuntimeCapabilityHealthHistory> {
    const existing = await this.requireCapability(capabilityId);

    const [history] = await this.prisma.$transaction([
      this.prisma.runtimeCapabilityHealthHistory.create({
        data: {
          capabilityId,
          companyId: existing.companyId,
          status,
          latencyMs: latencyMs ?? null,
          error: error ?? null,
        },
      }),
      this.prisma.runtimeCapability.update({
        where: { id: existing.id },
        data: {
          status,
          lastHealthCheckAt: new Date(),
          healthLatencyMs: latencyMs ?? null,
          healthError: error ?? null,
        },
      }),
    ]);

    const updated = await this.prisma.runtimeCapability.findUnique({
      where: { id: existing.id },
    });
    if (updated) this.setCache(capabilityId, updated);

    this.emitEvent('capability.health-checked', capabilityId, {
      status,
      latencyMs,
      error,
    });

    return history;
  }

  async getHealthSummary(): Promise<HealthSummary> {
    const grouped = await this.prisma.runtimeCapability.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const summary: HealthSummary = {
      total: 0,
      healthy: 0,
      degraded: 0,
      unhealthy: 0,
      unknown: 0,
    };

    for (const row of grouped) {
      const count = row._count.status;
      summary.total += count;
      switch (row.status) {
        case RuntimeCapabilityStatus.HEALTHY:
          summary.healthy += count;
          break;
        case RuntimeCapabilityStatus.DEGRADED:
          summary.degraded += count;
          break;
        case RuntimeCapabilityStatus.UNHEALTHY:
          summary.unhealthy += count;
          break;
        case RuntimeCapabilityStatus.UNKNOWN:
          summary.unknown += count;
          break;
        case RuntimeCapabilityStatus.DISABLED:
          break;
      }
    }

    return summary;
  }

  startHealthPolling(intervalMs: number = 60_000): void {
    this.stopHealthPolling();
    this.healthPollingTimer = setInterval(async () => {
      const caps = await this.query();
      for (const cap of caps) {
        if (cap.status === RuntimeCapabilityStatus.DISABLED) continue;
        try {
          const start = Date.now();
          const latMs = Date.now() - start;
          await this.updateHealth(cap.capabilityId, cap.status, latMs);
        } catch {
          await this.updateHealth(
            cap.capabilityId,
            RuntimeCapabilityStatus.UNHEALTHY,
            undefined,
            'Health polling failed',
          );
        }
      }
    }, intervalMs);
  }

  stopHealthPolling(): void {
    if (this.healthPollingTimer) {
      clearInterval(this.healthPollingTimer);
      this.healthPollingTimer = null;
    }
  }

  // ── Events ─────────────────────────────────────────────────────────────

  onEvent(handler: (event: CapabilityEvent) => void): () => void {
    this.events.on('registry.event', handler);
    return () => this.events.off('registry.event', handler);
  }

  // ── Health ─────────────────────────────────────────────────────────────

  async healthCheck(): Promise<{
    healthy: boolean;
    capabilityCount: number;
    cacheSize: number;
    summary: HealthSummary;
  }> {
    const capabilityCount = await this.prisma.runtimeCapability.count();
    const summary = await this.getHealthSummary();
    return {
      healthy: summary.unhealthy === 0,
      capabilityCount,
      cacheSize: this.cache.size,
      summary,
    };
  }

  // ── Private ────────────────────────────────────────────────────────────

  private async requireCapability(capabilityId: string): Promise<RuntimeCapability> {
    const cap = await this.get(capabilityId);
    if (!cap) {
      throw new Error(`Capability '${capabilityId}' not found.`);
    }
    return cap;
  }

  private emitEvent(
    type: CapabilityEventType,
    capabilityId: string,
    metadata?: Record<string, unknown>,
  ): void {
    const event: CapabilityEvent = {
      type,
      capabilityId,
      timestamp: new Date(),
      metadata,
    };
    this.events.emit('registry.event', event);
  }

  private setCache(capabilityId: string, cap: RuntimeCapability): void {
    if (this.cache.size >= 2_000) {
      const oldest = this.cache.keys().next().value;
      if (oldest) this.cache.delete(oldest);
    }
    this.cache.set(capabilityId, { cap, storedAt: Date.now() });
  }

  private isCacheExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.storedAt > this.cacheTtlMs;
  }
}
