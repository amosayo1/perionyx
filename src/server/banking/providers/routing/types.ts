import type {
  BankingRegion,
  ProviderCapability,
  ConnectionProtocol,
  BankProviderKind,
  RegionalProviderConfig,
} from "../../domain/types";

export interface RoutingRequest {
  region: BankingRegion;
  countryCode?: string;
  requiredCapabilities?: ProviderCapability[];
  preferredProtocol?: ConnectionProtocol;
  companyId?: string;
  currency?: string;
}

export interface RoutingResult {
  region: BankingRegion;
  countryCode?: string;
  providers: RegionalProviderConfig[];
  recommended: RegionalProviderConfig;
  fallbacks: RegionalProviderConfig[];
  allAvailable: BankProviderKind[];
}
