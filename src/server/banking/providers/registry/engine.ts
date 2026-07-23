import type { IBankProvider } from "../interface";
import type { BankProviderKind, BankingRegion, ProviderCapability } from "../../domain/types";
import { PROVIDER_DEFINITIONS } from "../definitions/provider-definitions";

export class BankProviderRegistry {
  private factories = new Map<BankProviderKind, () => IBankProvider>();
  private instances = new Map<BankProviderKind, IBankProvider>();

  registerKind(kind: BankProviderKind, factory: () => IBankProvider): void {
    if (this.factories.has(kind)) {
      throw new Error(`Bank provider kind "${kind}" is already registered`);
    }
    this.factories.set(kind, factory);
  }

  get(kind: BankProviderKind): IBankProvider | undefined {
    return this.instances.get(kind);
  }

  getAll(): IBankProvider[] {
    return Array.from(this.instances.values());
  }

  getAvailableKinds(): BankProviderKind[] {
    return Array.from(this.instances.keys());
  }

  createInstance(kind: BankProviderKind): IBankProvider {
    const factory = this.factories.get(kind);
    if (!factory) {
      throw new Error(`No factory registered for BankProvider kind "${kind}"`);
    }
    const instance = factory();
    this.instances.set(kind, instance);
    return instance;
  }

  has(kind: BankProviderKind): boolean {
    return this.factories.has(kind);
  }

  remove(kind: BankProviderKind): void {
    this.factories.delete(kind);
    this.instances.delete(kind);
  }

  clear(): void {
    this.factories.clear();
    this.instances.clear();
  }

  getByCapability(capability: ProviderCapability): IBankProvider[] {
    return this.getAll().filter((provider) => {
      const def = PROVIDER_DEFINITIONS.find((d) => d.kind === provider.kind);
      return def?.capabilities.includes(capability);
    });
  }

  getByRegion(region: BankingRegion): IBankProvider[] {
    return this.getAll().filter((provider) => {
      const def = PROVIDER_DEFINITIONS.find((d) => d.kind === provider.kind);
      return def?.regions.some((r) => r.region === region);
    });
  }

  getSupportedKinds(): BankProviderKind[] {
    return Array.from(this.factories.keys());
  }

  get count(): number {
    return this.factories.size;
  }

  get availableCount(): number {
    return this.instances.size;
  }
}

export const bankProviderRegistry = new BankProviderRegistry();
