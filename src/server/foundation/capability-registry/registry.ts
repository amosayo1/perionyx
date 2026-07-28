/**
 * Enterprise Capability Registry — Registry
 *
 * Phase 24.0
 *
 * Central registry for platform capabilities and provider discovery.
 * Business modules query this registry instead of inspecting providers.
 */

import {
  CapabilityMetadata,
  CapabilityCategory,
  CapabilityStatus,
  CapabilityHealth,
  DeprecationInfo,
  ProviderRegistration,
  ProviderStatus,
  CapabilityQuery,
  ProviderQuery,
  RegistryEvent,
  RegistryEventType,
} from "./types";
import { BoundedRingBuffer } from "@/lib/bounded-ring-buffer";
import { logger } from "@/lib/logger";

const log = logger.child({ module: "capability-registry" });

// ── Capability Registry ──────────────────────────────────────────────────────

export class CapabilityRegistry {
  private static instance: CapabilityRegistry;
  private capabilities = new Map<string, CapabilityMetadata>();
  private providers = new Map<string, ProviderRegistration>();
  private eventLog = new BoundedRingBuffer<RegistryEvent>(10_000);

  static getInstance(): CapabilityRegistry {
    if (!CapabilityRegistry.instance) {
      CapabilityRegistry.instance = new CapabilityRegistry();
    }
    return CapabilityRegistry.instance;
  }

  // ── Capability Operations ────────────────────────────────────────────────

  /**
   * Register a capability.
   */
  registerCapability(capability: Omit<CapabilityMetadata, "health" | "registeredAt" | "lastHealthCheckAt" | "deprecation">): void {
    const entry: CapabilityMetadata = {
      ...capability,
      health: { healthy: true, latencyMs: null, lastCheckedAt: null, error: null, uptime: null },
      registeredAt: new Date(),
      lastHealthCheckAt: null,
      deprecation: null,
    };

    this.capabilities.set(entry.id, entry);
    this.emitEvent("capability.registered", { capabilityId: entry.id });
    log.debug({ capabilityId: entry.id, name: entry.name, platformId: entry.platformId }, "Capability registered");
  }

  /**
   * Update a capability's status.
   */
  updateCapability(id: string, updates: Partial<Pick<CapabilityMetadata, "status" | "version" | "features" | "configSchema" | "tags">>): void {
    const existing = this.capabilities.get(id);
    if (!existing) throw new Error(`Capability '${id}' not found.`);

    Object.assign(existing, updates);
    this.emitEvent("capability.updated", { capabilityId: id });
  }

  /**
   * Deprecate a capability.
   */
  deprecateCapability(id: string, info: Omit<DeprecationInfo, "deprecatedAt">): void {
    const existing = this.capabilities.get(id);
    if (!existing) throw new Error(`Capability '${id}' not found.`);

    existing.deprecation = { ...info, deprecatedAt: new Date() };
    existing.status = CapabilityStatus.DEPRECATED;
    this.emitEvent("capability.updated", { capabilityId: id, deprecated: true });
  }

  /**
   * Deregister a capability.
   */
  deregisterCapability(id: string): boolean {
    const existed = this.capabilities.delete(id);
    if (existed) this.emitEvent("capability.deregistered", { capabilityId: id });
    return existed;
  }

  /**
   * Get a capability by ID.
   */
  getCapability(id: string): CapabilityMetadata | undefined {
    return this.capabilities.get(id);
  }

  /**
   * Query capabilities.
   */
  queryCapabilities(query: CapabilityQuery = {}): CapabilityMetadata[] {
    let results = Array.from(this.capabilities.values());

    if (query.platformId) {
      results = results.filter((c) => c.platformId === query.platformId);
    }
    if (query.category) {
      results = results.filter((c) => c.category === query.category);
    }
    if (query.status) {
      results = results.filter((c) => c.status === query.status);
    }
    if (query.tags && query.tags.length > 0) {
      results = results.filter((c) => query.tags!.every((t) => c.tags.includes(t)));
    }
    if (query.search) {
      const search = query.search.toLowerCase();
      results = results.filter(
        (c) =>
          c.id.toLowerCase().includes(search) ||
          c.name.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search),
      );
    }

    return results;
  }

  /**
   * Get all available capabilities (status = AVAILABLE).
   */
  getAvailable(): CapabilityMetadata[] {
    return this.queryCapabilities({ status: CapabilityStatus.AVAILABLE });
  }

  /**
   * Check if a capability is available.
   */
  isAvailable(capabilityId: string): boolean {
    const cap = this.capabilities.get(capabilityId);
    return cap?.status === CapabilityStatus.AVAILABLE && cap.health.healthy;
  }

  // ── Provider Operations ──────────────────────────────────────────────────

  /**
   * Register a provider.
   */
  registerProvider(provider: ProviderRegistration): void {
    this.providers.set(provider.id, provider);
    this.emitEvent("provider.registered", { providerId: provider.id });
  }

  /**
   * Update provider status.
   */
  updateProviderStatus(id: string, status: ProviderStatus): void {
    const existing = this.providers.get(id);
    if (!existing) throw new Error(`Provider '${id}' not found.`);

    existing.status = status;
    this.emitEvent("provider.status-changed", { providerId: id, status });
  }

  /**
   * Deregister a provider.
   */
  deregisterProvider(id: string): boolean {
    const existed = this.providers.delete(id);
    if (existed) this.emitEvent("provider.deregistered", { providerId: id });
    return existed;
  }

  /**
   * Get a provider by ID.
   */
  getProvider(id: string): ProviderRegistration | undefined {
    return this.providers.get(id);
  }

  /**
   * Query providers.
   */
  queryProviders(query: ProviderQuery = {}): ProviderRegistration[] {
    let results = Array.from(this.providers.values());

    if (query.platformId) {
      results = results.filter((p) => p.platformId === query.platformId);
    }
    if (query.status) {
      results = results.filter((p) => p.status === query.status);
    }
    if (query.capabilityId) {
      results = results.filter((p) => p.capabilities.includes(query.capabilityId!));
    }

    return results;
  }

  // ── Health ───────────────────────────────────────────────────────────────

  /**
   * Update health status for a capability.
   */
  updateHealth(capabilityId: string, health: CapabilityHealth): void {
    const cap = this.capabilities.get(capabilityId);
    if (!cap) throw new Error(`Capability '${capabilityId}' not found.`);

    cap.health = health;
    cap.lastHealthCheckAt = new Date();
    this.emitEvent("capability.health-checked", { capabilityId, healthy: health.healthy });
  }

  /**
   * Get health summary for all capabilities.
   */
  getHealthSummary(): {
    total: number;
    healthy: number;
    unhealthy: number;
    unknown: number;
  } {
    let healthy = 0;
    let unhealthy = 0;
    let unknown = 0;

    for (const cap of this.capabilities.values()) {
      if (cap.health.lastCheckedAt === null) {
        unknown++;
      } else if (cap.health.healthy) {
        healthy++;
      } else {
        unhealthy++;
      }
    }

    return { total: this.capabilities.size, healthy, unhealthy, unknown };
  }

  // ── Discovery ────────────────────────────────────────────────────────────

  /**
   * Discover capabilities by category.
   */
  discoverByCategory(category: CapabilityCategory): CapabilityMetadata[] {
    return this.queryCapabilities({ category, status: CapabilityStatus.AVAILABLE });
  }

  /**
   * Discover capabilities by platform.
   */
  discoverByPlatform(platformId: string): CapabilityMetadata[] {
    return this.queryCapabilities({ platformId });
  }

  /**
   * Get all registered platform IDs.
   */
  getRegisteredPlatforms(): string[] {
    const platforms = new Set<string>();
    for (const cap of this.capabilities.values()) {
      platforms.add(cap.platformId);
    }
    return Array.from(platforms);
  }

  // ── Events ───────────────────────────────────────────────────────────────

  private emitEvent(type: RegistryEventType, metadata: Record<string, unknown>): void {
    this.eventLog.push({
      type,
      timestamp: new Date(),
      metadata,
    });
  }

  getEventLog(limit = 100): RegistryEvent[] {
    return this.eventLog.getLatest(limit);
  }
}

export const capabilityRegistry = CapabilityRegistry.getInstance();
