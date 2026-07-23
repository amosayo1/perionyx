import type { BankProviderKind } from "../../domain/types";
import { PROVIDER_DEFINITION_MAP } from "../definitions/provider-definitions";
import type { RankingScore, RankingRequest, RankingResult } from "./types";

export class ProviderRankingEngine {
  rank(request: RankingRequest): RankingResult {
    const scores: RankingScore[] = request.providerKinds.map((kind) => {
      const def = PROVIDER_DEFINITION_MAP.get(kind);
      const baseRank = def?.globalPriority ?? 50;
      const failoverPriority = def?.failoverPriority ?? 50;

      let reasonParts: string[] = [];

      let capabilityMatchScore = 0;
      if (request.requiredCapabilities && request.requiredCapabilities.length > 0 && def) {
        const matched = request.requiredCapabilities.filter((cap) =>
          def.capabilities.includes(cap as any),
        ).length;
        capabilityMatchScore = (matched / request.requiredCapabilities.length) * 100;
        if (capabilityMatchScore > 0) {
          reasonParts.push(`capability match ${Math.round(capabilityMatchScore)}%`);
        }
      }

      let protocolMatchScore = 0;
      if (request.preferredProtocol && def) {
        protocolMatchScore = def.protocols.includes(request.preferredProtocol as any) ? 100 : 0;
        if (protocolMatchScore > 0) {
          reasonParts.push("protocol match");
        }
      }

      let currencyMatchScore = 0;
      if (request.currency && def) {
        currencyMatchScore =
          def.currencies.length === 0 || def.currencies.includes(request.currency) ? 100 : 0;
        if (currencyMatchScore > 0 && def.currencies.length > 0) {
          reasonParts.push(`supports ${request.currency}`);
        }
      }

      const healthAdjustment = 0;
      const failoverPriorityScore = failoverPriority <= 10 ? 20 : failoverPriority <= 20 ? 10 : 0;

      const totalScore =
        (100 - baseRank) * 0.3 +
        capabilityMatchScore * 0.3 +
        protocolMatchScore * 0.1 +
        currencyMatchScore * 0.1 +
        failoverPriorityScore * 0.1 +
        (def ? 10 : 0) * ((def?.sandboxAvailable ?? false) ? 0.1 : 0);

      if (def) {
        reasonParts.push(`priority rank ${baseRank}`);
      }

      return {
        providerKind: kind,
        baseRank,
        healthAdjustment,
        capabilityMatchScore,
        protocolMatchScore,
        currencyMatchScore,
        failoverPriorityScore,
        totalScore: Math.round(totalScore * 100) / 100,
        reason: reasonParts.join(", ") || "default ranking",
      };
    });

    scores.sort((a, b) => b.totalScore - a.totalScore);

    return {
      scores,
      ranked: scores.map((s) => s.providerKind),
      best: scores[0]?.providerKind ?? null,
    };
  }

  getTopN(request: RankingRequest, n: number): BankProviderKind[] {
    const result = this.rank(request);
    return result.ranked.slice(0, n);
  }
}

export const providerRankingEngine = new ProviderRankingEngine();
