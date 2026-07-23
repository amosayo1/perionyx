import { integrationRegistry } from "./integration-registry";
import { getOrCreateProvider } from "./integration-factory";
import type {
  Capability,
  CapabilityFlag,
  BusinessCapability,
  ProviderCategory,
  ProviderCapabilities,
  CapabilityDeclaration,
  ProviderConfig,
} from "./types";
import type { IntegrationProvider } from "./integration-provider";

const declarationCache = new Map<string, CapabilityDeclaration>();

export async function getCapabilityDeclaration(providerId: string): Promise<CapabilityDeclaration | null> {
  const cached = declarationCache.get(providerId);
  if (cached) return cached;

  const config = integrationRegistry.getProvider(providerId);
  if (!config) return null;

  const provider = integrationRegistry.resolve(providerId) ?? await getOrCreateProvider(config);
  const capabilities = await provider.getCapabilities();

  const declaration: CapabilityDeclaration = {
    providerId: config.id,
    providerName: config.name,
    category: config.category,
    version: config.version,
    capabilities: capabilities.capabilities,
    capabilityFlags: capabilities.capabilityFlags ?? extractFlags(capabilities),
    businessCapabilities: capabilities.businessCapabilities ?? extractBusiness(capabilities),
    supportedAuthMethods: capabilities.authMethods,
    supportedSyncTypes: capabilities.syncTypes,
    supportedSyncDirections: capabilities.syncDirections,
    rateLimit: capabilities.rateLimit ?? 100,
    rateLimitWindow: capabilities.rateLimitWindow ?? 60000,
    maxBatchSize: capabilities.maxBatchSize ?? 100,
  };

  declarationCache.set(providerId, declaration);
  return declaration;
}

export async function listAllDeclarations(): Promise<CapabilityDeclaration[]> {
  const providers = integrationRegistry.getAllProviders();
  const results: CapabilityDeclaration[] = [];

  for (const p of providers) {
    const decl = await getCapabilityDeclaration(p.id);
    if (decl) results.push(decl);
  }

  return results;
}

export async function listDeclarationsByCategory(category: ProviderCategory): Promise<CapabilityDeclaration[]> {
  const providers = integrationRegistry.getProvidersByCategory(category);
  const results: CapabilityDeclaration[] = [];

  for (const p of providers) {
    const decl = await getCapabilityDeclaration(p.id);
    if (decl) results.push(decl);
  }

  return results;
}

export function findProvidersByCapability(capability: Capability): ProviderConfig[] {
  return integrationRegistry.getAllProviders().filter((p) =>
    p.capabilities.capabilities.includes(capability),
  );
}

export function findProvidersByFlag(flag: CapabilityFlag): ProviderConfig[] {
  return integrationRegistry.getAllProviders().filter((p) =>
    (p.capabilities as ProviderCapabilities).capabilityFlags?.includes(flag),
  );
}

export function getSupportedCapabilities(): Capability[] {
  const all = new Set<Capability>();
  for (const p of integrationRegistry.getAllProviders()) {
    for (const c of p.capabilities.capabilities) {
      all.add(c);
    }
  }
  return Array.from(all);
}

export function invalidateDeclarationCache(providerId?: string): void {
  if (providerId) {
    declarationCache.delete(providerId);
  } else {
    declarationCache.clear();
  }
}

function extractFlags(capabilities: ProviderCapabilities): CapabilityFlag[] {
  const flags: CapabilityFlag[] = [];
  if (capabilities.authMethods.includes("oauth2")) flags.push("supports_oauth");
  if (capabilities.syncTypes.includes("incremental")) flags.push("supports_incremental_sync");
  if (capabilities.capabilities.includes("read_invoices") || capabilities.methods.length > 0) flags.push("supports_events");
  if (capabilities.maxBatchSize && capabilities.maxBatchSize > 1) flags.push("supports_batch");
  return flags;
}

function extractBusiness(capabilities: ProviderCapabilities): BusinessCapability[] {
  return capabilities.capabilities.filter((c): c is BusinessCapability =>
    !c.startsWith("supports_"),
  );
}
