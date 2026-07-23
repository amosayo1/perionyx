import type { BankProviderKind, BankingRegion, ProviderCapability, ConnectionProtocol } from "../../domain/types";

export interface ProviderSelectionCriteria {
  region: BankingRegion;
  countryCode?: string;
  requiredCapabilities?: ProviderCapability[];
  preferredProtocol?: ConnectionProtocol;
  currency?: string;
  tenantId?: string;
  requireHealthy?: boolean;
  maxFallbacks?: number;
}

export interface ProviderSelectionResult {
  primary: BankProviderKind;
  fallbacks: BankProviderKind[];
  score: number;
  reason: string;
  allConsidered: Array<{ kind: BankProviderKind; score: number; reason: string }>;
}
