import type { BankProviderKind } from "../../domain/types";

export interface RankingScore {
  providerKind: BankProviderKind;
  baseRank: number;
  healthAdjustment: number;
  capabilityMatchScore: number;
  protocolMatchScore: number;
  currencyMatchScore: number;
  failoverPriorityScore: number;
  totalScore: number;
  reason: string;
}

export interface RankingRequest {
  providerKinds: BankProviderKind[];
  requiredCapabilities?: string[];
  preferredProtocol?: string;
  currency?: string;
  preferHealthy?: boolean;
  tenantId?: string;
}

export interface RankingResult {
  scores: RankingScore[];
  ranked: BankProviderKind[];
  best: BankProviderKind | null;
}
