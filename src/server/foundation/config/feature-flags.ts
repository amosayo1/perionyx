/**
 * Enterprise Configuration Platform — Feature Flags
 *
 * Phase 24.0
 *
 * Feature flag management with percentage rollout, tenant overrides, and audit.
 */

import { configurationRegistry, ConfigurationRegistry } from "./registry";
import { FeatureFlag, ConfigEnvironment } from "./types";

// ── Built-in Feature Flags ───────────────────────────────────────────────────

export const BUILTIN_FLAGS: Array<Omit<FeatureFlag, "tenantOverrides" | "allowedTenants" | "excludedTenants">> = [
  {
    key: "ap.duplicate-detection",
    name: "AP Duplicate Detection",
    description: "AI-powered duplicate invoice detection",
    enabled: false,
    percentageRollout: 0,
    createdAt: new Date(),
    lastModifiedAt: new Date(),
    createdBy: "system",
    tags: ["ap", "intelligence"],
  },
  {
    key: "ap.three-way-matching",
    name: "AP Three-Way Matching",
    description: "Automatic three-way matching of PO, GRN, and Invoice",
    enabled: false,
    percentageRollout: 0,
    createdAt: new Date(),
    lastModifiedAt: new Date(),
    createdBy: "system",
    tags: ["ap", "automation"],
  },
  {
    key: "ai.cfo-assistant",
    name: "AI CFO Assistant",
    description: "AI-powered CFO decision support",
    enabled: true,
    percentageRollout: 100,
    createdAt: new Date(),
    lastModifiedAt: new Date(),
    createdBy: "system",
    tags: ["ai", "executive"],
  },
  {
    key: "workflow.parallel-execution",
    name: "Parallel Workflow Execution",
    description: "Execute independent workflow steps in parallel",
    enabled: true,
    percentageRollout: 100,
    createdAt: new Date(),
    lastModifiedAt: new Date(),
    createdBy: "system",
    tags: ["workflow", "performance"],
  },
  {
    key: "feature.enterprise-tables",
    name: "Enterprise Tables 2.0",
    description: "Enhanced data tables with inline editing, multi-sort, Excel export",
    enabled: true,
    percentageRollout: 100,
    createdAt: new Date(),
    lastModifiedAt: new Date(),
    createdBy: "system",
    tags: ["ux", "tables"],
  },
  {
    key: "feature.dark-mode",
    name: "Dark Mode",
    description: "Dark luxury theme for executive interfaces",
    enabled: true,
    percentageRollout: 100,
    createdAt: new Date(),
    lastModifiedAt: new Date(),
    createdBy: "system",
    tags: ["ux", "theme"],
  },
];

// ── Feature Flag Manager ─────────────────────────────────────────────────────

export class FeatureFlagManager {
  private static instance: FeatureFlagManager;
  private registry: ConfigurationRegistry;

  static getInstance(): FeatureFlagManager {
    if (!FeatureFlagManager.instance) {
      FeatureFlagManager.instance = new FeatureFlagManager();
    }
    return FeatureFlagManager.instance;
  }

  constructor() {
    this.registry = ConfigurationRegistry.getInstance();
    this.registerBuiltInFlags();
  }

  private registerBuiltInFlags(): void {
    for (const flag of BUILTIN_FLAGS) {
      this.registry.registerFlag(flag);
    }
  }

  /**
   * Check if a feature is enabled.
   */
  isEnabled(key: string, tenantId?: string, environment?: ConfigEnvironment): boolean {
    return this.registry.isFeatureEnabled(key, tenantId, environment);
  }

  /**
   * Enable a feature globally.
   */
  enable(key: string, performedBy: string): void {
    this.registry.setFlagEnabled(key, true, performedBy);
  }

  /**
   * Disable a feature globally.
   */
  disable(key: string, performedBy: string): void {
    this.registry.setFlagEnabled(key, false, performedBy);
  }

  /**
   * Override a feature flag for a specific tenant.
   */
  overrideForTenant(key: string, tenantId: string, enabled: boolean, performedBy: string): void {
    this.registry.setFlagOverride(key, tenantId, enabled, performedBy);
  }

  /**
   * Get all feature flags.
   */
  getAll(): FeatureFlag[] {
    return this.registry.getAllFlags();
  }

  /**
   * Get a specific flag.
   */
  get(key: string): FeatureFlag | undefined {
    return this.registry.getFlag(key);
  }

  /**
   * Get flags by tag.
   */
  getByTag(tag: string): FeatureFlag[] {
    return this.registry.getAllFlags().filter((f) => f.tags.includes(tag));
  }
}

export const featureFlagManager = FeatureFlagManager.getInstance();
