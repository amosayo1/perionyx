/**
 * Phase 22.5 — Decision Intelligence: Registry
 *
 * Registry-based extensibility (Law 3 — capability contracts): a module
 * registers a DecisionTypeConfig keyed by its entityType; the engine stays
 * generic. Adding a new decision domain requires registering a config — never
 * modifying the engine.
 */

import type { DecisionTypeConfig } from "./types";

export class DecisionTypeRegistry {
  private readonly configs = new Map<string, DecisionTypeConfig>();

  register(config: DecisionTypeConfig): void {
    if (this.configs.has(config.entityType)) {
      throw new Error(`Decision type already registered: ${config.entityType}`);
    }
    this.configs.set(config.entityType, config);
  }

  get(entityType: string): DecisionTypeConfig | undefined {
    return this.configs.get(entityType);
  }

  require(entityType: string): DecisionTypeConfig {
    const config = this.configs.get(entityType);
    if (!config) {
      throw new Error(`No decision type registered for entity type: ${entityType}`);
    }
    return config;
  }

  has(entityType: string): boolean {
    return this.configs.has(entityType);
  }

  list(): DecisionTypeConfig[] {
    return Array.from(this.configs.values());
  }

  clear(): void {
    this.configs.clear();
  }
}

let instance: DecisionTypeRegistry | null = null;

export function getDecisionTypeRegistry(): DecisionTypeRegistry {
  if (!instance) {
    instance = new DecisionTypeRegistry();
  }
  return instance;
}

export function resetDecisionTypeRegistry(): void {
  instance = null;
}
