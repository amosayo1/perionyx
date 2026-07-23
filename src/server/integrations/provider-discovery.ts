import { integrationRegistry } from "./integration-registry";
import { getOrCreateProvider } from "./integration-factory";
import type { DiscoveryResult, ProviderCategory, ProviderConfig } from "./types";

const discoveryCache = new Map<string, DiscoveryResult>();
let cacheTimestamp = 0;
const cacheTTL = 60000;

export async function discoverAll(): Promise<DiscoveryResult[]> {
  const providers = integrationRegistry.getAllProviders();
  const results: DiscoveryResult[] = [];

  for (const provider of providers) {
    const result = await discoverProvider(provider);
    results.push(result);
  }

  cacheTimestamp = Date.now();
  return results;
}

export async function discoverByCategory(category: ProviderCategory): Promise<DiscoveryResult[]> {
  const providers = integrationRegistry.getProvidersByCategory(category);
  const results: DiscoveryResult[] = [];

  for (const provider of providers) {
    const result = await discoverProvider(provider);
    results.push(result);
  }

  return results;
}

export function getDiscoveredProviders(): DiscoveryResult[] {
  if (Date.now() - cacheTimestamp > cacheTTL) {
    return [];
  }
  return Array.from(discoveryCache.values());
}

export function invalidateCache(): void {
  discoveryCache.clear();
  cacheTimestamp = 0;
}

async function discoverProvider(config: ProviderConfig): Promise<DiscoveryResult> {
  const cached = discoveryCache.get(config.id);
  if (cached && Date.now() - cacheTimestamp < cacheTTL) {
    return cached;
  }

  try {
    const provider = await getOrCreateProvider(config);
    const testResult = await provider.test(config.configSchema);

    const result: DiscoveryResult = {
      providerId: config.id,
      available: testResult.success,
      version: config.version,
      capabilities: testResult.success ? await provider.getCapabilities() : undefined,
      error: testResult.error,
    };

    discoveryCache.set(config.id, result);
    return result;
  } catch (error) {
    const result: DiscoveryResult = {
      providerId: config.id,
      available: false,
      version: config.version,
      error: error instanceof Error ? error.message : "Discovery failed",
    };

    discoveryCache.set(config.id, result);
    return result;
  }
}
