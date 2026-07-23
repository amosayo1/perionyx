import type { BankProviderKind, BankingRegion, ProviderCapability } from "../../domain/types";

export interface CapabilityMatrixEntry {
  provider: BankProviderKind;
  capability: ProviderCapability;
  supported: boolean;
  regionRestricted: boolean;
  regions?: BankingRegion[];
}

export interface CapabilityMatch {
  provider: BankProviderKind;
  matchedCapabilities: ProviderCapability[];
  missingCapabilities: ProviderCapability[];
  matchRatio: number;
}

export interface CapabilityQuery {
  requiredCapabilities: ProviderCapability[];
  optionalCapabilities?: ProviderCapability[];
  region?: BankingRegion;
}
