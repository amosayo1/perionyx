import type {
  BankProviderKind,
  BankingRegion,
  ProviderCapability,
  ConnectionProtocol,
  PaymentRail,
} from "../../domain/types";

export interface RegionCoverage {
  region: BankingRegion;
  countries: string[];
  recommended: boolean;
  fallback: boolean;
}

export interface ProviderDefinition {
  kind: BankProviderKind;
  name: string;
  description: string;
  website: string;
  documentationUrl: string;
  regions: RegionCoverage[];
  capabilities: ProviderCapability[];
  protocols: ConnectionProtocol[];
  paymentRails: PaymentRail[];
  currencies: string[];
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  maxConcurrentConnections: number;
  maxHistoryDays: number;
  sandboxAvailable: boolean;
  globalPriority: number;
  failoverPriority: number;
  requiresClientSecret: boolean;
  requiresCertificate: boolean;
  healthEndpoint: string | null;
  logoUrl?: string;
}
