export interface BankingKPI {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  subtitle?: string;
}

export interface BankingWorkspaceData {
  kpis: BankingKPI[];
  institutions: BankInstitution[];
  providers: BankProviderSummary[];
  accounts: AccountPortfolio[];
  connections: ConnectionSummary[];
  cashPosition: CashPosition;
  liquidity: LiquiditySummary;
  regional: RegionalBanking[];
  currencies: CurrencyHolding[];
  relationships: BankRelationship[];
  syncActivity: SyncActivity[];
  insights: TreasuryInsight[];
  providerHealth: ProviderHealthSummary[];
  executiveSummary: ExecutiveSummary;
}

export interface BankInstitution {
  id: string;
  name: string;
  country: string;
  region: string;
  provider: string;
  logo: string;
  connectedAccounts: number;
  relationshipManager?: string;
  riskRating: "LOW" | "MEDIUM" | "HIGH";
  health: "HEALTHY" | "DEGRADED" | "CRITICAL";
  status: "CONNECTED" | "DISCONNECTED" | "PENDING";
  lastSync: string;
}

export interface BankProviderSummary {
  id: string;
  name: string;
  kind: string;
  capabilities: string[];
  coverage: string[];
  latencyMs: number;
  health: "HEALTHY" | "DEGRADED" | "DOWN";
  lastSync: string;
  supportedInstitutions: number;
  currentConnections: number;
  score: number;
}

export interface AccountPortfolio {
  id: string;
  name: string;
  institution: string;
  legalEntity: string;
  businessUnit: string;
  region: string;
  currency: string;
  purpose: string;
  treasuryRole: string;
  balance: number;
  available: number;
  status: "ACTIVE" | "DORMANT" | "CLOSED";
  healthScore: number;
}

export interface ConnectionSummary {
  id: string;
  institution: string;
  provider: string;
  status: "CONNECTED" | "DEGRADED" | "DISCONNECTED" | "ERROR";
  healthScore: number;
  credentialExpiry: string;
  lastSync: string;
  retryCount: number;
  syncStatus: "IDLE" | "SYNCING" | "FAILED";
}

export interface CashPosition {
  totalCash: number;
  availableCash: number;
  restrictedCash: number;
  investmentCash: number;
  currency: string;
  asOf: string;
}

export interface LiquiditySummary {
  byCurrency: CurrencyHolding[];
  byRegion: { region: string; amount: number; percentage: number }[];
  byLegalEntity: { entity: string; amount: number; percentage: number }[];
  availableLiquidity: number;
  restrictedCash: number;
  investmentCash: number;
  forecast?: number;
}

export interface CurrencyHolding {
  currency: string;
  amount: number;
  percentage: number;
  change: string;
}

export interface RegionalBanking {
  region: string;
  banks: number;
  currencies: string[];
  providers: string[];
  health: "HEALTHY" | "DEGRADED" | "CRITICAL";
  cashPosition: number;
  connectionStatus: "ALL_CONNECTED" | "PARTIAL" | "DEGRADED";
  score: number;
}

export interface BankRelationship {
  id: string;
  institution: string;
  relationshipManager: string;
  relationshipAge: string;
  accountCount: number;
  monthlyVolume: string;
  riskRating: "LOW" | "MEDIUM" | "HIGH";
  healthScore: number;
  lastReview: string;
}

export interface SyncActivity {
  id: string;
  type: "SYNC" | "RECONCILE" | "AUTH" | "ERROR" | "HEALTH_CHECK";
  institution: string;
  status: "SUCCESS" | "FAILED" | "IN_PROGRESS" | "WARNING";
  message: string;
  timestamp: string;
  duration?: string;
}

export interface TreasuryInsight {
  id: string;
  type: "RISK" | "OPPORTUNITY" | "ALERT" | "RECOMMENDATION";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description: string;
  timestamp: string;
}

export interface ProviderHealthSummary {
  provider: string;
  kind: string;
  availability: number;
  latencyMs: number;
  successRate: number;
  connectionCount: number;
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  score: number;
}

export interface ExecutiveSummary {
  globalHealth: "HEALTHY" | "DEGRADED" | "CRITICAL";
  globalHealthScore: number;
  totalBanks: number;
  totalProviders: number;
  totalAccounts: number;
  totalLegalEntities: number;
  totalCountries: number;
  totalCurrencies: number;
  totalLiquidity: number;
  healthyConnections: number;
  pendingSyncs: number;
  failedConnections: number;
  topRisks: string[];
  criticalAlerts: number;
  upcomingCredentialExpiry: number;
  providerIssues: number;
}