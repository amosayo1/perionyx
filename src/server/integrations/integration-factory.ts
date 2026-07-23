import type { ProviderConfig } from "./types";
import type { IntegrationProvider } from "./integration-provider";
import { integrationRegistry } from "./integration-registry";

const instanceCache = new Map<string, IntegrationProvider>();

export interface DIContainer {
  get<T>(token: string): T | undefined;
  register<T>(token: string, value: T): void;
}

let diContainer: DIContainer | null = null;

export function setDIContainer(container: DIContainer): void {
  diContainer = container;
}

export function getDIContainer(): DIContainer | null {
  return diContainer;
}

export async function createProvider(
  providerConfig: ProviderConfig,
  deps?: Record<string, unknown>,
): Promise<IntegrationProvider> {
  await validateProviderConfig(providerConfig);
  const provider = await instantiateProvider(providerConfig, deps);
  await provider.initialize();
  return provider;
}

export async function getOrCreateProvider(
  providerConfig: ProviderConfig,
  deps?: Record<string, unknown>,
): Promise<IntegrationProvider> {
  const existing = instanceCache.get(providerConfig.id);
  if (existing) return existing;

  const existingResolved = integrationRegistry.resolve(providerConfig.id);
  if (existingResolved) {
    instanceCache.set(providerConfig.id, existingResolved);
    return existingResolved;
  }

  const provider = await createProvider(providerConfig, deps);
  instanceCache.set(providerConfig.id, provider);
  integrationRegistry.registerProviderInstance(providerConfig.id, provider);
  return provider;
}

export async function destroyProvider(providerId: string): Promise<void> {
  const provider = instanceCache.get(providerId);
  if (provider) {
    await provider.destroy();
    instanceCache.delete(providerId);
  }
}

export function getCachedProvider(providerId: string): IntegrationProvider | undefined {
  return instanceCache.get(providerId);
}

export function clearCache(): void {
  for (const [id, provider] of instanceCache) {
    provider.destroy().catch(() => {});
  }
  instanceCache.clear();
}

export async function validateProviderConfig(config: ProviderConfig): Promise<boolean> {
  if (!config.id) throw new Error("Provider config must have an id");
  if (!config.name) throw new Error("Provider config must have a name");
  if (!config.version) throw new Error("Provider config must have a version");
  if (!config.category) throw new Error("Provider config must have a category");
  if (!config.vendor) throw new Error("Provider config must have a vendor");
  if (!config.capabilities) throw new Error("Provider config must have capabilities");
  return true;
}

async function instantiateProvider(
  config: ProviderConfig,
  deps?: Record<string, unknown>,
): Promise<IntegrationProvider> {
  const factory = integrationRegistry.getProviderFactory(config.id);
  if (factory) {
    const mod = await factory();
    const instance = mod.default;
    setConfig(instance, config);
    injectDependencies(instance, deps);
    return instance;
  }

  const modulePath = `./providers/${config.category}/${config.id}`;
  try {
    const mod = await import(/* @vite-ignore */ modulePath);
    const ProviderClass: new () => IntegrationProvider = mod.default ?? mod;
    const instance = new ProviderClass();
    setConfig(instance, config);
    injectDependencies(instance, deps);
    return instance;
  } catch {
    throw new Error(
      `Provider "${config.id}" not found. No factory registered and no module at ${modulePath}`,
    );
  }
}

function setConfig(instance: IntegrationProvider, config: ProviderConfig): void {
  Object.defineProperty(instance, "config", {
    value: config,
    writable: false,
    configurable: false,
  });
}

function injectDependencies(instance: IntegrationProvider, deps?: Record<string, unknown>): void {
  if (!deps && !diContainer) return;
  const resolvedDeps = deps ?? {};
  for (const [key, value] of Object.entries(resolvedDeps)) {
    (instance as unknown as Record<string, unknown>)[key] = value;
  }
}
