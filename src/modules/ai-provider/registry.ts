import type { IAiProvider } from "./interface";
import type { AiProviderKind, ActiveProvider, ProviderHealth } from "./types";

class AiProviderRegistry {
  private providers = new Map<AiProviderKind, IAiProvider>();
  private activeProvider: AiProviderKind | null = null;

  register(kind: AiProviderKind, provider: IAiProvider): void {
    this.providers.set(kind, provider);
  }

  get(kind: AiProviderKind): IAiProvider | undefined {
    return this.providers.get(kind);
  }

  has(kind: AiProviderKind): boolean {
    return this.providers.has(kind);
  }

  getAll(): IAiProvider[] {
    return Array.from(this.providers.values());
  }

  setActive(kind: AiProviderKind): void {
    if (!this.providers.has(kind)) {
      throw new Error(`Provider ${kind} is not registered`);
    }
    this.activeProvider = kind;
  }

  getActive(): IAiProvider {
    if (!this.activeProvider) {
      const first = this.providers.values().next();
      if (!first.value) throw new Error("No AI providers registered");
      return first.value;
    }
    const provider = this.providers.get(this.activeProvider);
    if (!provider) throw new Error(`Active provider ${this.activeProvider} not found`);
    return provider;
  }

  getActiveKind(): AiProviderKind | null {
    return this.activeProvider;
  }

  async getActiveProviders(): Promise<ActiveProvider[]> {
    const results: ActiveProvider[] = [];
    for (const [kind, provider] of this.providers) {
      const health = await provider.healthCheck();
      results.push({
        kind,
        label: provider.label,
        defaultModel: provider.getModels()[0]?.id ?? "",
        enabled: provider.isAvailable(),
        health,
        usage: { totalTokens: 0, estimatedCost: 0 },
      });
    }
    return results;
  }

  unregister(kind: AiProviderKind): void {
    this.providers.delete(kind);
    if (this.activeProvider === kind) {
      this.activeProvider = null;
    }
  }
}

export const aiProviderRegistry = new AiProviderRegistry();
