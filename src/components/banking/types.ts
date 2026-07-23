export type RegionId = "north_america" | "europe" | "united_kingdom" | "middle_east" | "africa" | "asia_pacific";

export interface Region {
  id: RegionId;
  name: string;
  flag: string;
  countryCount: number;
  description: string;
}

export interface Country {
  code: string;
  name: string;
  flag: string;
  region: RegionId;
}

export interface BankProvider {
  id: string;
  name: string;
  logo: string;
  description: string;
  coverage: string;
  capabilities: string[];
  supportedBankCount: number;
  authTypes: string[];
  enterpriseRating: number;
  latencyRating: "low" | "medium" | "high";
  recommended: boolean;
  website: string;
}

export interface BankInstitution {
  id: string;
  name: string;
  logo: string;
  category: "commercial" | "investment" | "islamic" | "digital";
  country: string;
  supported: boolean;
}

export interface DiscoveredAccount {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: string;
  accountNumber: string;
  selected: boolean;
}

export type AccountType =
  | "operating"
  | "payroll"
  | "treasury"
  | "investment"
  | "credit"
  | "savings"
  | "escrow";

export interface LegalEntity {
  id: string;
  name: string;
  type: "enterprise" | "legal_entity" | "business_unit" | "department";
  parentId: string | null;
  children: LegalEntity[];
}

export interface CurrencyMappingItem {
  accountId: string;
  accountName: string;
  currency: string;
  mapped: boolean;
}

export interface SyncConfig {
  mode: "manual" | "hourly" | "daily" | "realtime";
  historicalImport: "30days" | "90days" | "1year" | "all";
}

export interface ConnectionState {
  step: number;
  region: Region | null;
  country: Country | null;
  provider: BankProvider | null;
  institution: BankInstitution | null;
  verified: boolean;
  accounts: DiscoveredAccount[];
  legalEntityMappings: Record<string, string>;
  currencyMappings: CurrencyMappingItem[];
  syncConfig: SyncConfig;
}

export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  mode: "daily",
  historicalImport: "90days",
};

export interface ConnectionHealthData {
  id: string;
  providerName: string;
  institutionName: string;
  healthScore: number;
  lastSync: string;
  nextSync: string;
  credentialExpiry: string;
  permissionStatus: "active" | "expired" | "revoked";
  accountsCount: number;
  currencies: string[];
  status: "connected" | "disconnected" | "degraded" | "error";
}

export interface ConnectionHistoryEntry {
  id: string;
  action: string;
  timestamp: string;
  details: string;
  status: "success" | "warning" | "error";
}
