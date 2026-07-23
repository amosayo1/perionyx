import type { BankingRegion, ProviderCapability, ConnectionProtocol, RegionalProviderConfig } from "../../domain/types";
import { BANKING_REGION_REGISTRY } from "../regions/registry";
import { PROVIDER_DEFINITION_MAP } from "../definitions/provider-definitions";
import type { RoutingRequest, RoutingResult } from "./types";

export class BankingRoutingEngine {
  private regionRegistry = BANKING_REGION_REGISTRY;

  route(request: RoutingRequest): RoutingResult {
    const regionConfig = this.regionRegistry.find(
      (r) => r.region === request.region,
    );

    if (!regionConfig) {
      throw new Error(`No routing configuration for region: ${request.region}`);
    }

    let providers = [...regionConfig.providers];

    if (request.countryCode) {
      const countryMatches = this.regionRegistry.filter((r) =>
        r.countryCodes.includes(request.countryCode!),
      );
      if (countryMatches.length > 0) {
        const countryRegion = countryMatches.find((r) => r.region === request.region) ?? countryMatches[0];
        providers = [...countryRegion.providers];
      }
    }

    if (request.requiredCapabilities && request.requiredCapabilities.length > 0) {
      providers = providers.filter((p) =>
        request.requiredCapabilities!.every((cap) =>
          p.capabilities.includes(cap),
        ),
      );
    }

    if (request.preferredProtocol) {
      const protocolProviders = providers.filter((p) =>
        p.supportedProtocols.includes(request.preferredProtocol!),
      );
      if (protocolProviders.length > 0) {
        providers = protocolProviders;
      }
    }

    if (request.currency) {
      providers = providers.filter((p) => {
        const def = PROVIDER_DEFINITION_MAP.get(p.kind);
        return !def || def.currencies.length === 0 || def.currencies.includes(request.currency!);
      });
    }

    providers.sort((a, b) => a.rank - b.rank);

    const recommended = providers.find((p) => p.isRecommended) ?? providers[0];
    const fallbacks = providers.filter((p) => p.isFallback).length > 0
      ? providers.filter((p) => p.isFallback && p.kind !== recommended.kind)
      : providers.slice(1).map((p) => ({ ...p, isFallback: true }));
    const allProviders = providers.map((p) => p.kind);

    return {
      region: request.region,
      countryCode: request.countryCode,
      providers,
      recommended,
      fallbacks,
      allAvailable: allProviders,
    };
  }

  getProvidersForRegion(region: BankingRegion): RegionalProviderConfig[] {
    const config = this.regionRegistry.find((r) => r.region === region);
    return config?.providers ?? [];
  }

  getRecommendedProvider(region: BankingRegion): RegionalProviderConfig | null {
    const config = this.regionRegistry.find((r) => r.region === region);
    return config?.providers.find((p) => p.isRecommended) ?? null;
  }

  getFallbackProviders(region: BankingRegion): RegionalProviderConfig[] {
    const config = this.regionRegistry.find((r) => r.region === region);
    return config?.providers.filter((p) => p.isFallback) ?? [];
  }

  supportsCapability(region: BankingRegion, capability: ProviderCapability): boolean {
    const config = this.regionRegistry.find((r) => r.region === region);
    if (!config) return false;
    return config.providers.some((p) => p.capabilities.includes(capability));
  }

  getHighestRankedWithCapability(
    region: BankingRegion,
    capability: ProviderCapability,
  ): RegionalProviderConfig | null {
    const config = this.regionRegistry.find((r) => r.region === region);
    if (!config) return null;
    const candidates = config.providers
      .filter((p) => p.capabilities.includes(capability))
      .sort((a, b) => a.rank - b.rank);
    return candidates[0] ?? null;
  }
}

export const bankingRoutingEngine = new BankingRoutingEngine();
