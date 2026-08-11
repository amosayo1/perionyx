import type { IEvidenceProvider } from "./types";
import { EvidenceRegistry } from "./registry";

/**
 * Related-entity expansion table (lazy expansion hook). When an item is
 * `expandable`, consumers ask the resolver which entity types can be
 * assembled from the current one and re-request a package for that entity.
 * Extensible per domain; unknown entity types simply return [].
 */
const RELATED_ENTITY_TYPES: Record<string, string[]> = {
  "ap.invoice": ["ap.vendor", "ap.purchase-order", "ap.payment", "ap.approval"],
};

/**
 * Phase 22.4 — Evidence Engine: resolver.
 *
 * Maps an `entityType` to its registered providers (exact match or "*").
 * Assembly never touches a provider that is not registered for the request.
 */
export class EvidenceResolver {
  constructor(private readonly registry: EvidenceRegistry) {}

  providersFor(entityType: string): IEvidenceProvider[] {
    return this.registry.providersFor(entityType);
  }

  canAssemble(entityType: string): boolean {
    return this.providersFor(entityType).length > 0;
  }

  supportedEntityTypes(): string[] {
    const set = new Set<string>();
    for (const provider of this.registry.all()) {
      for (const type of provider.entityTypes) set.add(type);
    }
    return [...set];
  }

  /** Related entity types that can be expanded from `entityType`. */
  relatedEntityTypes(entityType: string): string[] {
    return RELATED_ENTITY_TYPES[entityType] ?? [];
  }
}
