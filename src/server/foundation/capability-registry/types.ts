/**
 * Enterprise Capability Registry — Types
 *
 * Phase 24.0
 *
 * Platforms advertise capabilities.
 * Business modules never inspect providers.
 */

// ── Capability Types ─────────────────────────────────────────────────────────

export interface CapabilityMetadata {
  /** Unique capability identifier (e.g., "banking.sync", "ai.chat", "erp.sync-vendors") */
  id: string;
  /** Platform that provides this capability. */
  platformId: string;
  /** Human-readable name. */
  name: string;
  /** Description. */
  description: string;
  /** Capability version (semver). */
  version: string;
  /** Capability category. */
  category: CapabilityCategory;
  /** Status of this capability. */
  status: CapabilityStatus;
  /** Provider-specific features supported by this capability. */
  features: string[];
  /** Required permissions to use this capability. */
  requiredPermissions: string[];
  /** Health status of the provider serving this capability. */
  health: CapabilityHealth;
  /** When this capability was registered. */
  registeredAt: Date;
  /** When this capability was last health-checked. */
  lastHealthCheckAt: Date | null;
  /** Deprecation info (if deprecated). */
  deprecation: DeprecationInfo | null;
  /** Tags for filtering and grouping. */
  tags: string[];
  /** Configuration schema for this capability. */
  configSchema: Record<string, unknown> | null;
}

export enum CapabilityCategory {
  INTEGRATION = "INTEGRATION",
  FINANCIAL = "FINANCIAL",
  ANALYTICS = "ANALYTICS",
  WORKFLOW = "WORKFLOW",
  SECURITY = "SECURITY",
  AI = "AI",
  NOTIFICATION = "NOTIFICATION",
  STORAGE = "STORAGE",
  SEARCH = "SEARCH",
  IDENTITY = "IDENTITY",
}

export enum CapabilityStatus {
  /** Capability is available and healthy. */
  AVAILABLE = "AVAILABLE",
  /** Capability is registered but not yet started. */
  REGISTERED = "REGISTERED",
  /** Capability is currently starting up. */
  STARTING = "STARTING",
  /** Capability is temporarily unavailable. */
  UNAVAILABLE = "UNAVAILABLE",
  /** Capability is deprecated. Use replacement. */
  DEPRECATED = "DEPRECATED",
  /** Capability is disabled by configuration. */
  DISABLED = "DISABLED",
}

export interface CapabilityHealth {
  healthy: boolean;
  latencyMs: number | null;
  lastCheckedAt: Date | null;
  error: string | null;
  /** Uptime percentage (0-100) over last 24h. */
  uptime: number | null;
}

export interface DeprecationInfo {
  /** When was this capability deprecated. */
  deprecatedAt: Date;
  /** When will this capability be removed. */
  removalAt: Date | null;
  /** Replacement capability ID. */
  replacementId: string | null;
  /** Migration guide URL or text. */
  migrationGuide: string | null;
  /** Reason for deprecation. */
  reason: string;
}

// ── Provider Types ───────────────────────────────────────────────────────────

export interface ProviderRegistration {
  /** Unique provider identifier (e.g., "plaid", "quickbooks", "openai") */
  id: string;
  /** Platform this provider belongs to. */
  platformId: string;
  /** Human-readable name. */
  name: string;
  /** Provider version. */
  version: string;
  /** Capabilities this provider implements. */
  capabilities: string[];
  /** Provider status. */
  status: ProviderStatus;
  /** When registered. */
  registeredAt: Date;
  /** Provider configuration. */
  config: Record<string, unknown>;
  /** Tags. */
  tags: string[];
}

export enum ProviderStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ERROR = "ERROR",
  MAINTENANCE = "MAINTENANCE",
}

// ── Registry Query Types ─────────────────────────────────────────────────────

export interface CapabilityQuery {
  platformId?: string;
  category?: CapabilityCategory;
  status?: CapabilityStatus;
  tags?: string[];
  search?: string;
}

export interface ProviderQuery {
  platformId?: string;
  status?: ProviderStatus;
  capabilityId?: string;
}

// ── Registry Events ──────────────────────────────────────────────────────────

export type RegistryEventType =
  | "capability.registered"
  | "capability.updated"
  | "capability.deregistered"
  | "capability.health-checked"
  | "provider.registered"
  | "provider.deregistered"
  | "provider.status-changed";

export interface RegistryEvent {
  type: RegistryEventType;
  timestamp: Date;
  capabilityId?: string;
  providerId?: string;
  metadata: Record<string, unknown>;
}
