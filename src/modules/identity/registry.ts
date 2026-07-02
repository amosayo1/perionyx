import type { IIdentityProvider } from "./provider";
import type { IdentityProviderKind } from "./types";

export class IdentityProviderRegistry {
  private providers = new Map<string, IIdentityProvider>();
  private factory = new Map<IdentityProviderKind, () => IIdentityProvider>();

  registerKind(kind: IdentityProviderKind, factoryFn: () => IIdentityProvider): void {
    if (this.factory.has(kind)) {
      return;
    }
    this.factory.set(kind, factoryFn);
  }

  registerInstance(id: string, provider: IIdentityProvider): void {
    this.providers.set(id, provider);
  }

  unregisterInstance(id: string): void {
    this.providers.delete(id);
  }

  getInstance(id: string): IIdentityProvider | undefined {
    return this.providers.get(id);
  }

  createInstance(kind: IdentityProviderKind): IIdentityProvider {
    const factoryFn = this.factory.get(kind);
    if (!factoryFn) {
      throw new Error(`No provider registered for kind: ${kind}`);
    }
    return factoryFn();
  }

  getAllInstances(): IIdentityProvider[] {
    return Array.from(this.providers.values());
  }

  hasKind(kind: IdentityProviderKind): boolean {
    return this.factory.has(kind);
  }

  getRegisteredKinds(): IdentityProviderKind[] {
    return Array.from(this.factory.keys());
  }
}

export const identityProviderRegistry = new IdentityProviderRegistry();
