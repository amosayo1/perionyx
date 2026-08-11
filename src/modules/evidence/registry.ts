import type { IEvidenceProvider } from "./types";

/**
 * Phase 22.4 — Evidence Engine: provider registry.
 *
 * Registration is idempotent (a provider id registers once) and preserves
 * registration order, which the assembler uses for deterministic merging
 * (cross-provider item order within a section = provider registration order).
 */
export class EvidenceRegistry {
  private readonly providers = new Map<string, IEvidenceProvider>();

  register(provider: IEvidenceProvider): this {
    if (!this.providers.has(provider.id)) {
      this.providers.set(provider.id, provider);
    }
    return this;
  }

  registerAll(providers: IEvidenceProvider[]): this {
    for (const provider of providers) this.register(provider);
    return this;
  }

  has(id: string): boolean {
    return this.providers.has(id);
  }

  get(id: string): IEvidenceProvider | undefined {
    return this.providers.get(id);
  }

  /** Providers in registration order. */
  all(): IEvidenceProvider[] {
    return [...this.providers.values()];
  }

  /** Providers serving an entity type, in registration order. */
  providersFor(entityType: string): IEvidenceProvider[] {
    return this.all().filter(
      (p) => p.entityTypes.includes(entityType) || p.entityTypes.includes("*"),
    );
  }

  clear(): this {
    this.providers.clear();
    return this;
  }

  get size(): number {
    return this.providers.size;
  }
}

let defaultRegistry: EvidenceRegistry | null = null;

/** Process-wide registry. Providers register once at module init. */
export function getEvidenceRegistry(): EvidenceRegistry {
  if (!defaultRegistry) defaultRegistry = new EvidenceRegistry();
  return defaultRegistry;
}

/** Register providers into the process-wide registry (idempotent). */
export function registerEvidenceProviders(providers: IEvidenceProvider[]): EvidenceRegistry {
  return getEvidenceRegistry().registerAll(providers);
}

/** Test isolation — clears the process-wide registry. */
export function resetEvidenceRegistry(): void {
  defaultRegistry = null;
}
