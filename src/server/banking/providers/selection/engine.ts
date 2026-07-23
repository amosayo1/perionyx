import type { ProviderSelectionCriteria, ProviderSelectionResult } from "./types";
import { bankingRoutingEngine } from "../routing/engine";
import { providerRankingEngine } from "../ranking/engine";
import { enterpriseProviderConfig } from "../config/enterprise-config";
import type { ProviderCapability } from "../../domain/types";

export class ProviderSelector {
  select(criteria: ProviderSelectionCriteria): ProviderSelectionResult {
    const tenantConfig = criteria.tenantId
      ? enterpriseProviderConfig.getConfig(criteria.tenantId)
      : null;

    if (tenantConfig?.forceProvider) {
      return {
        primary: tenantConfig.forceProvider,
        fallbacks: [],
        score: 100,
        reason: `Forced by tenant configuration: ${tenantConfig.forceProvider}`,
        allConsidered: [{ kind: tenantConfig.forceProvider, score: 100, reason: "Tenant force override" }],
      };
    }

    const routeResult = bankingRoutingEngine.route({
      region: criteria.region,
      countryCode: criteria.countryCode,
      requiredCapabilities: criteria.requiredCapabilities,
      preferredProtocol: criteria.preferredProtocol,
      currency: criteria.currency,
    });

    let candidates = routeResult.providers.map((p) => p.kind);

    if (tenantConfig?.disabledProviders && tenantConfig.disabledProviders.length > 0) {
      candidates = candidates.filter((k) => !tenantConfig!.disabledProviders!.includes(k));
    }

    if (tenantConfig?.blacklistedProviders && tenantConfig.blacklistedProviders.length > 0) {
      candidates = candidates.filter((k) => !tenantConfig!.blacklistedProviders!.includes(k));
    }

    if (tenantConfig?.preferredOrder && tenantConfig.preferredOrder.length > 0) {
      const preferred = tenantConfig.preferredOrder.filter((k) => candidates.includes(k));
      const remaining = candidates.filter((k) => !tenantConfig!.preferredOrder!.includes(k));
      candidates = [...preferred, ...remaining];
    }

    if (criteria.region && tenantConfig?.regionalOverrides) {
      const override = tenantConfig.regionalOverrides.find(
        (o) => o.region === criteria.region &&
          (!o.countryCode || o.countryCode === criteria.countryCode),
      );
      if (override) {
        if (override.forceProvider) {
          return {
            primary: override.forceProvider,
            fallbacks: candidates.filter((k) => k !== override.forceProvider),
            score: 100,
            reason: `Forced by regional override for ${criteria.region}: ${override.forceProvider}`,
            allConsidered: candidates.map((k) => ({ kind: k, score: k === override.forceProvider ? 100 : 50, reason: k === override.forceProvider ? "Regional force override" : "Fallback" })),
          };
        }
        if (override.disabledProviders) {
          candidates = candidates.filter((k) => !override.disabledProviders!.includes(k));
        }
        if (override.preferredOrder) {
          const preferred = override.preferredOrder.filter((k) => candidates.includes(k));
          const remaining = candidates.filter((k) => !override.preferredOrder!.includes(k));
          candidates = [...preferred, ...remaining];
        }
      }
    }

    const rankingResult = providerRankingEngine.rank({
      providerKinds: candidates,
      requiredCapabilities: criteria.requiredCapabilities,
      preferredProtocol: criteria.preferredProtocol,
      currency: criteria.currency,
      preferHealthy: criteria.requireHealthy,
      tenantId: criteria.tenantId,
    });

    const primary = rankingResult.best ?? candidates[0];
    const fallbacks = rankingResult.ranked.filter((k) => k !== primary);
    const maxFallback = criteria.maxFallbacks ?? fallbacks.length;
    const truncatedFallbacks = fallbacks.slice(0, maxFallback);

    const primaryScore = rankingResult.scores.find(
      (s) => s.providerKind === primary,
    );

    return {
      primary,
      fallbacks: truncatedFallbacks,
      score: primaryScore?.totalScore ?? 0,
      reason: primaryScore?.reason ?? "Default selection",
      allConsidered: rankingResult.scores.map((s) => ({
        kind: s.providerKind,
        score: s.totalScore,
        reason: s.reason,
      })),
    };
  }
}

export const providerSelector = new ProviderSelector();
