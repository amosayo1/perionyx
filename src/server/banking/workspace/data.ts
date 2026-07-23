import type { BankingKPI, BankInstitution, BankProviderSummary, AccountPortfolio, ConnectionSummary, CashPosition, LiquiditySummary, RegionalBanking, CurrencyHolding, BankRelationship, SyncActivity, TreasuryInsight, ProviderHealthSummary, ExecutiveSummary, BankingWorkspaceData } from "./types";

export const mockKPIs: BankingKPI[] = [
  { label: "Connected Banks", value: "18", change: "+2", trend: "up", subtitle: "Across 12 countries" },
  { label: "Bank Providers", value: "6", change: "0", trend: "neutral", subtitle: "3 regions each" },
  { label: "Legal Entities", value: "24", change: "+1", trend: "up", subtitle: "4 new this quarter" },
  { label: "Countries", value: "12", change: "+1", trend: "up", subtitle: "Expanding in APAC" },
  { label: "Currencies", value: "24", change: "+3", trend: "up", subtitle: "Multi-currency active" },
  { label: "Healthy Connections", value: "42", change: "95%", trend: "up", subtitle: "4 degraded" },
  { label: "Pending Syncs", value: "3", change: "-2", trend: "down", subtitle: "Improving" },
  { label: "Failed Connections", value: "1", change: "0", trend: "neutral", subtitle: "Manual review" },
  { label: "Total Accounts", value: "156", change: "+8", trend: "up", subtitle: "Across all entities" },
  { label: "Treasury Accounts", value: "89", change: "+5", trend: "up", subtitle: "57% of total" },
  { label: "Operating Accounts", value: "67", change: "+3", trend: "up", subtitle: "43% of total" },
  { label: "Cash Position", value: "$847M", change: "+$12.4M", trend: "up", subtitle: "Last 24h" },
];

export const mockInstitutions: BankInstitution[] = [
  { id: "inst-1", name: "JPMorgan Chase", country: "United States", region: "North America", provider: "Plaid", logo: "JPMC", connectedAccounts: 24, relationshipManager: "Sarah Chen", riskRating: "LOW", health: "HEALTHY", status: "CONNECTED", lastSync: "2026-07-09T10:30:00Z" },
  { id: "inst-2", name: "Bank of America", country: "United States", region: "North America", provider: "Finicity", logo: "BAC", connectedAccounts: 18, relationshipManager: "James Wright", riskRating: "LOW", health: "HEALTHY", status: "CONNECTED", lastSync: "2026-07-09T09:45:00Z" },
  { id: "inst-3", name: "Barclays", country: "United Kingdom", region: "Europe", provider: "Truelayer", logo: "BARC", connectedAccounts: 15, relationshipManager: "Emma Thompson", riskRating: "LOW", health: "HEALTHY", status: "CONNECTED", lastSync: "2026-07-09T08:15:00Z" },
  { id: "inst-4", name: "HSBC Holdings", country: "United Kingdom", region: "Europe", provider: "Tink", logo: "HSBC", connectedAccounts: 22, riskRating: "MEDIUM", health: "DEGRADED", status: "CONNECTED", lastSync: "2026-07-08T22:00:00Z" },
  { id: "inst-5", name: "Deutsche Bank", country: "Germany", region: "Europe", provider: "Finicity", logo: "DB", connectedAccounts: 10, relationshipManager: "Klaus Mueller", riskRating: "MEDIUM", health: "HEALTHY", status: "CONNECTED", lastSync: "2026-07-09T07:30:00Z" },
  { id: "inst-6", name: "First Abu Dhabi Bank", country: "UAE", region: "Middle East", provider: "Tarabut", logo: "FAB", connectedAccounts: 8, riskRating: "MEDIUM", health: "DEGRADED", status: "CONNECTED", lastSync: "2026-07-08T18:00:00Z" },
  { id: "inst-7", name: "Emirates NBD", country: "UAE", region: "Middle East", provider: "Lean", logo: "ENBD", connectedAccounts: 12, relationshipManager: "Ahmed Al Maktoum", riskRating: "LOW", health: "HEALTHY", status: "CONNECTED", lastSync: "2026-07-09T06:00:00Z" },
  { id: "inst-8", name: "Al Rajhi Bank", country: "Saudi Arabia", region: "Middle East", provider: "Lean", logo: "ARB", connectedAccounts: 6, riskRating: "LOW", health: "HEALTHY", status: "CONNECTED", lastSync: "2026-07-09T05:30:00Z" },
  { id: "inst-9", name: "Standard Chartered", country: "Singapore", region: "Asia-Pacific", provider: "MX", logo: "STAN", connectedAccounts: 14, riskRating: "MEDIUM", health: "HEALTHY", status: "CONNECTED", lastSync: "2026-07-09T04:00:00Z" },
  { id: "inst-10", name: "DBS Bank", country: "Singapore", region: "Asia-Pacific", provider: "MX", logo: "DBS", connectedAccounts: 9, riskRating: "LOW", health: "HEALTHY", status: "CONNECTED", lastSync: "2026-07-09T03:30:00Z" },
  { id: "inst-11", name: "Nedbank", country: "South Africa", region: "Africa", provider: "Yap", logo: "NED", connectedAccounts: 5, riskRating: "HIGH", health: "CRITICAL", status: "DISCONNECTED", lastSync: "2026-07-05T12:00:00Z" },
  { id: "inst-12", name: "Attijariwafa Bank", country: "Morocco", region: "Africa", provider: "Yap", logo: "AWB", connectedAccounts: 4, riskRating: "MEDIUM", health: "HEALTHY", status: "CONNECTED", lastSync: "2026-07-08T14:00:00Z" },
];

export const mockProviders: BankProviderSummary[] = [
  { id: "prov-1", name: "Plaid", kind: "plaid", capabilities: ["Transactions", "Balances", "Identity", "Auth", "Webhooks"], coverage: ["US", "CA", "UK", "EU"], latencyMs: 180, health: "HEALTHY", lastSync: "2026-07-09T10:30:00Z", supportedInstitutions: 42, currentConnections: 28, score: 95 },
  { id: "prov-2", name: "Finicity (Mastercard)", kind: "finicity", capabilities: ["Transactions", "Balances", "Identity", "Payments"], coverage: ["US", "CA", "UK", "EU"], latencyMs: 320, health: "HEALTHY", lastSync: "2026-07-09T09:45:00Z", supportedInstitutions: 38, currentConnections: 22, score: 88 },
  { id: "prov-3", name: "Truelayer", kind: "truelayer", capabilities: ["Transactions", "Balances", "Identity", "Webhooks"], coverage: ["UK", "EU"], latencyMs: 210, health: "HEALTHY", lastSync: "2026-07-09T08:15:00Z", supportedInstitutions: 35, currentConnections: 18, score: 91 },
  { id: "prov-4", name: "Tink", kind: "tink", capabilities: ["Transactions", "Balances", "Identity", "Payments", "Webhooks"], coverage: ["EU", "UK"], latencyMs: 450, health: "DEGRADED", lastSync: "2026-07-08T22:00:00Z", supportedInstitutions: 31, currentConnections: 15, score: 72 },
  { id: "prov-5", name: "Lean", kind: "lean", capabilities: ["Transactions", "Balances", "Identity"], coverage: ["UAE", "SA", "QA", "BH", "KW", "OM"], latencyMs: 280, health: "HEALTHY", lastSync: "2026-07-09T06:00:00Z", supportedInstitutions: 24, currentConnections: 20, score: 85 },
  { id: "prov-6", name: "Tarabut", kind: "tarabut", capabilities: ["Transactions", "Balances", "Identity"], coverage: ["UAE", "SA", "BH"], latencyMs: 190, health: "DEGRADED", lastSync: "2026-07-08T18:00:00Z", supportedInstitutions: 18, currentConnections: 12, score: 68 },
  { id: "prov-7", name: "MX Technologies", kind: "mx", capabilities: ["Transactions", "Balances", "Identity", "Enhancements"], coverage: ["US", "CA", "APAC", "EU"], latencyMs: 350, health: "HEALTHY", lastSync: "2026-07-09T04:00:00Z", supportedInstitutions: 45, currentConnections: 25, score: 82 },
  { id: "prov-8", name: "Yap", kind: "yap", capabilities: ["Transactions", "Balances"], coverage: ["ZA", "NG", "KE", "MA", "EG"], latencyMs: 520, health: "HEALTHY", lastSync: "2026-07-08T14:00:00Z", supportedInstitutions: 15, currentConnections: 9, score: 60 },
];

export const mockAccounts: AccountPortfolio[] = [
  { id: "acc-1", name: "JPMC Operating USD", institution: "JPMorgan Chase", legalEntity: "Perionyx Inc.", businessUnit: "Corporate", region: "North America", currency: "USD", purpose: "Operating", treasuryRole: "Primary Operating", balance: 125000000, available: 118000000, status: "ACTIVE", healthScore: 95 },
  { id: "acc-2", name: "JPMC Payroll USD", institution: "JPMorgan Chase", legalEntity: "Perionyx Inc.", businessUnit: "Corporate", region: "North America", currency: "USD", purpose: "Payroll", treasuryRole: "Disbursement", balance: 8500000, available: 8500000, status: "ACTIVE", healthScore: 92 },
  { id: "acc-3", name: "BAC Treasury USD", institution: "Bank of America", legalEntity: "Perionyx Inc.", businessUnit: "Treasury", region: "North America", currency: "USD", purpose: "Treasury", treasuryRole: "Concentration", balance: 45000000, available: 42000000, status: "ACTIVE", healthScore: 98 },
  { id: "acc-4", name: "BAC Reserve USD", institution: "Bank of America", legalEntity: "Perionyx Inc.", businessUnit: "Treasury", region: "North America", currency: "USD", purpose: "Reserve", treasuryRole: "Reserve", balance: 200000000, available: 200000000, status: "ACTIVE", healthScore: 90 },
  { id: "acc-5", name: "Barclays GBP Operating", institution: "Barclays", legalEntity: "Perionyx UK Ltd.", businessUnit: "Corporate", region: "Europe", currency: "GBP", purpose: "Operating", treasuryRole: "Primary Operating", balance: 45000000, available: 42000000, status: "ACTIVE", healthScore: 94 },
  { id: "acc-6", name: "Barclays EUR Settlement", institution: "Barclays", legalEntity: "Perionyx UK Ltd.", businessUnit: "Corporate", region: "Europe", currency: "EUR", purpose: "Settlement", treasuryRole: "Settlement", balance: 22000000, available: 21500000, status: "ACTIVE", healthScore: 88 },
  { id: "acc-7", name: "HSBC EUR Operating", institution: "HSBC Holdings", legalEntity: "Perionyx EU B.V.", businessUnit: "Corporate", region: "Europe", currency: "EUR", purpose: "Operating", treasuryRole: "Primary Operating", balance: 38000000, available: 35000000, status: "ACTIVE", healthScore: 72 },
  { id: "acc-8", name: "FAB AED Operating", institution: "First Abu Dhabi Bank", legalEntity: "Perionyx Middle East LLC", businessUnit: "Corporate", region: "Middle East", currency: "AED", purpose: "Operating", treasuryRole: "Primary Operating", balance: 85000000, available: 80000000, status: "ACTIVE", healthScore: 65 },
  { id: "acc-9", name: "ENBD AED Treasury", institution: "Emirates NBD", legalEntity: "Perionyx Middle East LLC", businessUnit: "Treasury", region: "Middle East", currency: "AED", purpose: "Treasury", treasuryRole: "Concentration", balance: 120000000, available: 115000000, status: "ACTIVE", healthScore: 85 },
  { id: "acc-10", name: "Nedbank ZAR Operating", institution: "Nedbank", legalEntity: "Perionyx Africa Pty Ltd.", businessUnit: "Corporate", region: "Africa", currency: "ZAR", purpose: "Operating", treasuryRole: "Primary Operating", balance: 15000000, available: 12000000, status: "DORMANT", healthScore: 25 },
  { id: "acc-11", name: "DBS SGD Operating", institution: "DBS Bank", legalEntity: "Perionyx Asia Pte. Ltd.", businessUnit: "Corporate", region: "Asia-Pacific", currency: "SGD", purpose: "Operating", treasuryRole: "Primary Operating", balance: 28000000, available: 26500000, status: "ACTIVE", healthScore: 90 },
  { id: "acc-12", name: "StanChart USD Multi", institution: "Standard Chartered", legalEntity: "Perionyx Asia Pte. Ltd.", businessUnit: "Treasury", region: "Asia-Pacific", currency: "USD", purpose: "Multi-Currency", treasuryRole: "Concentration", balance: 65000000, available: 62000000, status: "ACTIVE", healthScore: 82 },
];

export const mockConnections: ConnectionSummary[] = [
  { id: "conn-1", status: "CONNECTED", healthScore: 95, credentialExpiry: "2027-03-15T00:00:00Z", lastSync: "2026-07-09T10:30:00Z", retryCount: 0, syncStatus: "IDLE", institution: "JPMorgan Chase", provider: "Plaid" },
  { id: "conn-2", status: "CONNECTED", healthScore: 92, credentialExpiry: "2027-01-20T00:00:00Z", lastSync: "2026-07-09T09:45:00Z", retryCount: 0, syncStatus: "IDLE", institution: "Bank of America", provider: "Finicity" },
  { id: "conn-3", status: "CONNECTED", healthScore: 88, credentialExpiry: "2026-12-01T00:00:00Z", lastSync: "2026-07-09T08:15:00Z", retryCount: 1, syncStatus: "SYNCING", institution: "Barclays", provider: "Truelayer" },
  { id: "conn-4", status: "DEGRADED", healthScore: 65, credentialExpiry: "2026-09-10T00:00:00Z", lastSync: "2026-07-08T22:00:00Z", retryCount: 3, syncStatus: "FAILED", institution: "HSBC Holdings", provider: "Tink" },
  { id: "conn-5", status: "CONNECTED", healthScore: 85, credentialExpiry: "2026-11-15T00:00:00Z", lastSync: "2026-07-09T06:00:00Z", retryCount: 0, syncStatus: "IDLE", institution: "Emirates NBD", provider: "Lean" },
  { id: "conn-6", status: "ERROR", healthScore: 30, credentialExpiry: "2026-08-05T00:00:00Z", lastSync: "2026-07-05T12:00:00Z", retryCount: 5, syncStatus: "FAILED", institution: "Nedbank", provider: "Yap" },
];

export const mockCashPosition: CashPosition = {
  totalCash: 847000000,
  availableCash: 792000000,
  restrictedCash: 35000000,
  investmentCash: 20000000,
  currency: "USD",
  asOf: "2026-07-09T10:30:00Z",
};

export const mockLiquidity: LiquiditySummary = {
  byCurrency: [
    { currency: "USD", amount: 420000000, percentage: 49.6, change: "+2.1%" },
    { currency: "EUR", amount: 98000000, percentage: 11.6, change: "-0.5%" },
    { currency: "GBP", amount: 72000000, percentage: 8.5, change: "+1.2%" },
    { currency: "AED", amount: 205000000, percentage: 24.2, change: "+3.4%" },
    { currency: "SGD", amount: 28000000, percentage: 3.3, change: "+0.8%" },
    { currency: "ZAR", amount: 15000000, percentage: 1.8, change: "-1.1%" },
    { currency: "Other", amount: 9000000, percentage: 1.0, change: "+0.3%" },
  ],
  byRegion: [
    { region: "North America", amount: 378500000, percentage: 44.7 },
    { region: "Middle East", amount: 205000000, percentage: 24.2 },
    { region: "Europe", amount: 170000000, percentage: 20.1 },
    { region: "Asia-Pacific", amount: 78000000, percentage: 9.2 },
    { region: "Africa", amount: 15000000, percentage: 1.8 },
  ],
  byLegalEntity: [
    { entity: "Perionyx Inc.", amount: 378500000, percentage: 44.7 },
    { entity: "Perionyx Middle East LLC", amount: 205000000, percentage: 24.2 },
    { entity: "Perionyx UK Ltd.", amount: 98000000, percentage: 11.6 },
    { entity: "Perionyx EU B.V.", amount: 72000000, percentage: 8.5 },
    { entity: "Perionyx Asia Pte. Ltd.", amount: 65000000, percentage: 7.7 },
    { entity: "Perionyx Africa Pty Ltd.", amount: 28000000, percentage: 3.3 },
  ],
  availableLiquidity: 792000000,
  restrictedCash: 35000000,
  investmentCash: 20000000,
  forecast: 875000000,
};

export const mockRegionalData: RegionalBanking[] = [
  { region: "North America", banks: 4, currencies: ["USD", "CAD"], providers: ["Plaid", "Finicity", "MX"], health: "HEALTHY", cashPosition: 378500000, connectionStatus: "ALL_CONNECTED", score: 94 },
  { region: "Europe", banks: 5, currencies: ["EUR", "GBP", "CHF"], providers: ["Truelayer", "Tink", "Finicity"], health: "DEGRADED", cashPosition: 170000000, connectionStatus: "PARTIAL", score: 72 },
  { region: "Middle East", banks: 3, currencies: ["AED", "SAR", "QAR"], providers: ["Lean", "Tarabut"], health: "DEGRADED", cashPosition: 205000000, connectionStatus: "PARTIAL", score: 68 },
  { region: "Asia-Pacific", banks: 3, currencies: ["SGD", "HKD", "JPY", "CNY"], providers: ["MX", "Plaid"], health: "HEALTHY", cashPosition: 78000000, connectionStatus: "ALL_CONNECTED", score: 88 },
  { region: "Africa", banks: 2, currencies: ["ZAR", "NGN", "MAD"], providers: ["Yap"], health: "CRITICAL", cashPosition: 15000000, connectionStatus: "DEGRADED", score: 35 },
];

export const mockCurrencies: CurrencyHolding[] = mockLiquidity.byCurrency;

export const mockRelationships: BankRelationship[] = [
  { id: "rel-1", institution: "JPMorgan Chase", relationshipManager: "Sarah Chen", relationshipAge: "8 years", accountCount: 24, monthlyVolume: "$125M", riskRating: "LOW", healthScore: 95, lastReview: "2026-06-15" },
  { id: "rel-2", institution: "Bank of America", relationshipManager: "James Wright", relationshipAge: "6 years", accountCount: 18, monthlyVolume: "$85M", riskRating: "LOW", healthScore: 90, lastReview: "2026-05-20" },
  { id: "rel-3", institution: "Barclays", relationshipManager: "Emma Thompson", relationshipAge: "5 years", accountCount: 15, monthlyVolume: "$65M", riskRating: "LOW", healthScore: 88, lastReview: "2026-04-10" },
  { id: "rel-4", institution: "HSBC Holdings", relationshipManager: "Unassigned", relationshipAge: "4 years", accountCount: 22, monthlyVolume: "$95M", riskRating: "MEDIUM", healthScore: 65, lastReview: "2026-03-01" },
  { id: "rel-5", institution: "Emirates NBD", relationshipManager: "Ahmed Al Maktoum", relationshipAge: "3 years", accountCount: 12, monthlyVolume: "$45M", riskRating: "LOW", healthScore: 85, lastReview: "2026-06-01" },
  { id: "rel-6", institution: "Nedbank", relationshipManager: "Unassigned", relationshipAge: "2 years", accountCount: 5, monthlyVolume: "$8M", riskRating: "HIGH", healthScore: 25, lastReview: "2026-01-15" },
];

export const mockSyncActivity: SyncActivity[] = [
  { id: "sa-1", type: "SYNC", institution: "JPMorgan Chase", status: "SUCCESS", message: "Transactions synced (1,245 new)", timestamp: "2026-07-09T10:30:00Z", duration: "45s" },
  { id: "sa-2", type: "HEALTH_CHECK", institution: "Bank of America", status: "SUCCESS", message: "Health check passed (180ms)", timestamp: "2026-07-09T09:45:00Z", duration: "2s" },
  { id: "sa-3", type: "SYNC", institution: "Barclays", status: "IN_PROGRESS", message: "Syncing transactions...", timestamp: "2026-07-09T08:15:00Z" },
  { id: "sa-4", type: "ERROR", institution: "HSBC Holdings", status: "FAILED", message: "Connection timeout after 30s", timestamp: "2026-07-09T07:00:00Z" },
  { id: "sa-5", type: "RECONCILE", institution: "Emirates NBD", status: "SUCCESS", message: "Reconciliation completed (0 issues)", timestamp: "2026-07-09T06:00:00Z", duration: "12s" },
  { id: "sa-6", type: "AUTH", institution: "First Abu Dhabi Bank", status: "WARNING", message: "Token refresh required in 3 days", timestamp: "2026-07-08T18:00:00Z" },
  { id: "sa-7", type: "SYNC", institution: "Nedbank", status: "FAILED", message: "Connection unavailable", timestamp: "2026-07-08T12:00:00Z" },
  { id: "sa-8", type: "HEALTH_CHECK", institution: "DBS Bank", status: "SUCCESS", message: "Health check passed (210ms)", timestamp: "2026-07-09T03:30:00Z", duration: "2s" },
];

export const mockInsights: TreasuryInsight[] = [
  { id: "ins-1", type: "ALERT", severity: "HIGH", title: "HSBC Connection Degraded", description: "HSBC Holdings connection has 3 consecutive sync failures. Credential expires in 63 days.", timestamp: "2026-07-09T07:00:00Z" },
  { id: "ins-2", type: "RISK", severity: "MEDIUM", title: "Nedbank Disconnected", description: "Nedbank connection has been down for 4 days. Manual reconnection required.", timestamp: "2026-07-09T06:00:00Z" },
  { id: "ins-3", type: "OPPORTUNITY", severity: "LOW", title: "Concentration Opportunity", description: "Middle East cash position grew 24.2%. Consider sweeping excess AED to USD concentration account.", timestamp: "2026-07-09T10:00:00Z" },
  { id: "ins-4", type: "ALERT", severity: "CRITICAL", title: "Credential Expiring: Nedbank", description: "Yap credentials for Nedbank expire in 5 days. Rotate immediately.", timestamp: "2026-07-09T05:00:00Z" },
  { id: "ins-5", type: "RECOMMENDATION", severity: "MEDIUM", title: "Provider Optimization", description: "Tink latency has increased 40%. Consider switching EU connections to Truelayer where supported.", timestamp: "2026-07-08T22:00:00Z" },
  { id: "ins-6", type: "OPPORTUNITY", severity: "LOW", title: "FX Savings Identified", description: "AED→USD conversion costs could be reduced by 15bps by using ENBD direct FX.", timestamp: "2026-07-08T14:00:00Z" },
];

export const mockProviderHealth: ProviderHealthSummary[] = [
  { provider: "Plaid", kind: "plaid", availability: 99.98, latencyMs: 180, successRate: 99.9, connectionCount: 28, status: "HEALTHY", score: 98 },
  { provider: "Finicity", kind: "finicity", availability: 99.85, latencyMs: 320, successRate: 99.5, connectionCount: 22, status: "HEALTHY", score: 88 },
  { provider: "Truelayer", kind: "truelayer", availability: 99.95, latencyMs: 210, successRate: 99.8, connectionCount: 18, status: "HEALTHY", score: 94 },
  { provider: "Tink", kind: "tink", availability: 98.50, latencyMs: 450, successRate: 97.2, connectionCount: 15, status: "DEGRADED", score: 72 },
  { provider: "Lean", kind: "lean", availability: 99.80, latencyMs: 280, successRate: 99.2, connectionCount: 20, status: "HEALTHY", score: 85 },
  { provider: "Tarabut", kind: "tarabut", availability: 98.20, latencyMs: 190, successRate: 96.5, connectionCount: 12, status: "DEGRADED", score: 68 },
  { provider: "MX", kind: "mx", availability: 99.70, latencyMs: 350, successRate: 99.0, connectionCount: 25, status: "HEALTHY", score: 82 },
  { provider: "Yap", kind: "yap", availability: 96.00, latencyMs: 520, successRate: 94.5, connectionCount: 9, status: "DEGRADED", score: 55 },
];

export const mockExecutiveSummary: ExecutiveSummary = {
  globalHealth: "DEGRADED",
  globalHealthScore: 78,
  totalBanks: 18,
  totalProviders: 8,
  totalAccounts: 156,
  totalLegalEntities: 24,
  totalCountries: 12,
  totalCurrencies: 24,
  totalLiquidity: 847000000,
  healthyConnections: 42,
  pendingSyncs: 3,
  failedConnections: 1,
  topRisks: [
    "Nedbank connection has been down for 4 days",
    "HSBC sync failures impacting EU operations",
    "Tink latency degradation affecting 15 connections",
  ],
  criticalAlerts: 1,
  upcomingCredentialExpiry: 3,
  providerIssues: 2,
};

export const mockWorkspaceData: BankingWorkspaceData = {
  kpis: mockKPIs,
  institutions: mockInstitutions,
  providers: mockProviders,
  accounts: mockAccounts,
  connections: mockConnections,
  cashPosition: mockCashPosition,
  liquidity: mockLiquidity,
  regional: mockRegionalData,
  currencies: mockCurrencies,
  relationships: mockRelationships,
  syncActivity: mockSyncActivity,
  insights: mockInsights,
  providerHealth: mockProviderHealth,
  executiveSummary: mockExecutiveSummary,
};