import type {
  Region,
  Country,
  BankProvider,
  BankInstitution,
  LegalEntity,
  AccountType,
  ConnectionHealthData,
  ConnectionHistoryEntry,
  DiscoveredAccount,
} from "./types";

export const REGIONS: Region[] = [
  { id: "north_america", name: "North America", flag: "🌎", countryCount: 3, description: "US, Canada, Mexico" },
  { id: "europe", name: "Europe", flag: "🌍", countryCount: 20, description: "EU, UK, Switzerland, Norway" },
  { id: "united_kingdom", name: "United Kingdom", flag: "🇬🇧", countryCount: 1, description: "England, Scotland, Wales, NI" },
  { id: "middle_east", name: "Middle East", flag: "🌏", countryCount: 9, description: "UAE, Saudi, Qatar, Bahrain, Kuwait, Oman, Egypt" },
  { id: "africa", name: "Africa", flag: "🌍", countryCount: 10, description: "Nigeria, South Africa, Kenya, Ghana" },
  { id: "asia_pacific", name: "Asia Pacific", flag: "🌏", countryCount: 14, description: "Australia, Singapore, Japan, India, China" },
];

export function getCountriesByRegion(regionId: string): Country[] {
  return COUNTRIES.filter((c) => c.region === regionId);
}

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", flag: "🇺🇸", region: "north_america" },
  { code: "CA", name: "Canada", flag: "🇨🇦", region: "north_america" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", region: "north_america" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", region: "united_kingdom" },
  { code: "DE", name: "Germany", flag: "🇩🇪", region: "europe" },
  { code: "FR", name: "France", flag: "🇫🇷", region: "europe" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", region: "europe" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", region: "europe" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", region: "europe" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", region: "middle_east" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", region: "middle_east" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", region: "middle_east" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭", region: "middle_east" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", region: "middle_east" },
  { code: "OM", name: "Oman", flag: "🇴🇲", region: "middle_east" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", region: "middle_east" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", region: "africa" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", region: "africa" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", region: "africa" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", region: "africa" },
  { code: "AU", name: "Australia", flag: "🇦🇺", region: "asia_pacific" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", region: "asia_pacific" },
  { code: "JP", name: "Japan", flag: "🇯🇵", region: "asia_pacific" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰", region: "asia_pacific" },
  { code: "IN", name: "India", flag: "🇮🇳", region: "asia_pacific" },
];

export function getProvidersByCountry(countryCode: string): BankProvider[] {
  const region = COUNTRIES.find((c) => c.code === countryCode)?.region;
  return PROMOTOS.filter((p) => p.regions.includes(region ?? ""));
}

export const PROMOTOS: (BankProvider & { regions: string[] })[] = [
  {
    id: "plaid",
    name: "Plaid",
    logo: "",
    description: "Open banking platform with broad US, Canada, and Australia institution coverage, rich transaction data, and real-time balances",
    coverage: "US, CA, AU, NZ — 12,000+ institutions",
    capabilities: ["Balances", "Transactions", "Payments", "Identity", "Webhooks", "Historical Sync", "Real-time", "Account Discovery", "Statements"],
    supportedBankCount: 12000,
    authTypes: ["OAuth 2.0"],
    enterpriseRating: 4.8,
    latencyRating: "low",
    recommended: true,
    website: "https://plaid.com",
    regions: ["north_america", "asia_pacific"],
  },
  {
    id: "mx",
    name: "MX Technologies",
    logo: "",
    description: "US-based open finance platform with data enrichment, categorization, and account verification",
    coverage: "US, CA — 14,000+ institutions",
    capabilities: ["Balances", "Transactions", "Identity", "Webhooks", "Historical Sync", "Account Discovery", "Account Verification", "Reporting"],
    supportedBankCount: 14000,
    authTypes: ["OAuth 2.0", "API Key"],
    enterpriseRating: 4.5,
    latencyRating: "low",
    recommended: false,
    website: "https://mx.com",
    regions: ["north_america"],
  },
  {
    id: "finicity",
    name: "Finicity (Mastercard)",
    logo: "",
    description: "US-based open banking platform with income verification, asset reporting, and lending-focused data",
    coverage: "US — 10,000+ institutions",
    capabilities: ["Balances", "Transactions", "Identity", "Account Verification", "Historical Sync", "Reporting", "Statements"],
    supportedBankCount: 10000,
    authTypes: ["OAuth 2.0", "API Key"],
    enterpriseRating: 4.3,
    latencyRating: "low",
    recommended: false,
    website: "https://finicity.com",
    regions: ["north_america"],
  },
  {
    id: "akoya",
    name: "Akoya",
    logo: "",
    description: "Tokenized data access and multi-institution aggregation with security-first architecture",
    coverage: "US — 3,000+ institutions",
    capabilities: ["Balances", "Transactions", "Identity", "Webhooks", "Historical Sync", "Real-time", "Account Discovery"],
    supportedBankCount: 3000,
    authTypes: ["OAuth 2.0", "FAPI"],
    enterpriseRating: 4.6,
    latencyRating: "low",
    recommended: false,
    website: "https://akoya.com",
    regions: ["north_america"],
  },
  {
    id: "truelayer",
    name: "TrueLayer",
    logo: "",
    description: "European open banking platform with PSD2-compliant connections, instant payments, and broad UK/EU coverage",
    coverage: "UK, EU 20 countries — 5,000+ institutions",
    capabilities: ["Balances", "Transactions", "Payments", "Identity", "Webhooks", "Historical Sync", "Real-time", "Direct Debit", "Account Discovery"],
    supportedBankCount: 5000,
    authTypes: ["OAuth 2.0", "Open Banking"],
    enterpriseRating: 4.7,
    latencyRating: "low",
    recommended: true,
    website: "https://truelayer.com",
    regions: ["europe", "united_kingdom"],
  },
  {
    id: "tink",
    name: "Tink",
    logo: "",
    description: "European open banking platform across 18 markets with data enrichment and PFM features",
    coverage: "EU 18 countries — 3,500+ institutions",
    capabilities: ["Balances", "Transactions", "Payments", "Identity", "Webhooks", "Historical Sync", "Real-time", "Account Verification", "Statements"],
    supportedBankCount: 3500,
    authTypes: ["OAuth 2.0", "Open Banking"],
    enterpriseRating: 4.4,
    latencyRating: "low",
    recommended: false,
    website: "https://tink.com",
    regions: ["europe", "united_kingdom"],
  },
  {
    id: "lean",
    name: "Lean Technologies",
    logo: "",
    description: "Middle Eastern open banking platform with SAMA & CBUAE compliance, covering Saudi, UAE, Kuwait, Oman, Bahrain",
    coverage: "SA, AE, KW, OM, BH, QA — 60+ institutions",
    capabilities: ["Balances", "Transactions", "Identity", "Webhooks", "Historical Sync", "Account Discovery", "Account Verification", "Statements"],
    supportedBankCount: 60,
    authTypes: ["OAuth 2.0", "API Key"],
    enterpriseRating: 4.6,
    latencyRating: "low",
    recommended: true,
    website: "https://lean.tech",
    regions: ["middle_east"],
  },
  {
    id: "tarabut",
    name: "Tarabut Gateway",
    logo: "",
    description: "Open banking platform for Bahrain, Qatar, UAE, and Saudi Arabia with regulatory-compliant connections",
    coverage: "BH, QA, AE, SA — 40+ institutions",
    capabilities: ["Balances", "Transactions", "Payments", "Identity", "Webhooks", "Historical Sync", "Account Discovery"],
    supportedBankCount: 40,
    authTypes: ["Open Banking", "OAuth 2.0"],
    enterpriseRating: 4.3,
    latencyRating: "medium",
    recommended: false,
    website: "https://tarabut.com",
    regions: ["middle_east"],
  },
  {
    id: "gocardless",
    name: "GoCardless (Nordigen)",
    logo: "",
    description: "Free open banking data access via PSD2 with direct debit and payment capabilities",
    coverage: "EU, UK — 3,000+ institutions",
    capabilities: ["Balances", "Transactions", "Direct Debit", "Scheduled Payments", "Webhooks", "Historical Sync", "Account Discovery"],
    supportedBankCount: 3000,
    authTypes: ["OAuth 2.0", "API Key"],
    enterpriseRating: 4.1,
    latencyRating: "medium",
    recommended: false,
    website: "https://gocardless.com",
    regions: ["europe", "united_kingdom"],
  },
  {
    id: "salted",
    name: "Salt Edge",
    logo: "",
    description: "Global data aggregator covering 90+ countries with broad institution support across all regions",
    coverage: "90+ countries — 6,000+ institutions",
    capabilities: ["Balances", "Transactions", "Identity", "Webhooks", "Historical Sync", "Account Discovery", "Statements"],
    supportedBankCount: 6000,
    authTypes: ["OAuth 2.0", "API Key"],
    enterpriseRating: 4.0,
    latencyRating: "medium",
    recommended: false,
    website: "https://saltedge.com",
    regions: ["north_america", "europe", "asia_pacific", "africa", "middle_east"],
  },
  {
    id: "yodlee",
    name: "Yodlee (Envestnet)",
    logo: "",
    description: "Global financial data platform covering banking, investment, and wealth accounts",
    coverage: "20+ countries — 12,000+ institutions",
    capabilities: ["Balances", "Transactions", "Identity", "Statements", "Historical Sync", "Reporting", "Account Discovery"],
    supportedBankCount: 12000,
    authTypes: ["API Key", "OAuth 2.0"],
    enterpriseRating: 4.2,
    latencyRating: "medium",
    recommended: false,
    website: "https://yodlee.com",
    regions: ["north_america", "asia_pacific"],
  },
];

export function getInstitutionsByCountry(countryCode: string): BankInstitution[] {
  return INSTITUTIONS.filter((i) => i.country === countryCode);
}

export function getInstitutionsByProvider(providerId: string): BankInstitution[] {
  const providerRegion = PROMOTOS.find((p) => p.id === providerId)?.regions[0];
  const countryCodes = providerRegion
    ? COUNTRIES.filter((c) => c.region === providerRegion).map((c) => c.code)
    : [];
  return INSTITUTIONS.filter((i) => countryCodes.includes(i.country));
}

export const INSTITUTIONS: BankInstitution[] = [
  { id: "chase", name: "Chase Bank", logo: "", category: "commercial", country: "US", supported: true },
  { id: "bofa", name: "Bank of America", logo: "", category: "commercial", country: "US", supported: true },
  { id: "wells", name: "Wells Fargo", logo: "", category: "commercial", country: "US", supported: true },
  { id: "citi", name: "Citibank", logo: "", category: "commercial", country: "US", supported: true },
  { id: "goldman", name: "Goldman Sachs", logo: "", category: "investment", country: "US", supported: true },
  { id: "morgan", name: "Morgan Stanley", logo: "", category: "investment", country: "US", supported: true },
  { id: "silicon", name: "Silicon Valley Bank", logo: "", category: "digital", country: "US", supported: true },
  { id: "mercury", name: "Mercury", logo: "", category: "digital", country: "US", supported: true },
  { id: "barclays", name: "Barclays", logo: "", category: "commercial", country: "GB", supported: true },
  { id: "hsbc-uk", name: "HSBC UK", logo: "", category: "commercial", country: "GB", supported: true },
  { id: "lloyds", name: "Lloyds Bank", logo: "", category: "commercial", country: "GB", supported: true },
  { id: "natwest", name: "NatWest", logo: "", category: "commercial", country: "GB", supported: true },
  { id: "monzo", name: "Monzo", logo: "", category: "digital", country: "GB", supported: true },
  { id: "starling", name: "Starling Bank", logo: "", category: "digital", country: "GB", supported: true },
  { id: "deutsche", name: "Deutsche Bank", logo: "", category: "commercial", country: "DE", supported: true },
  { id: "commerzbank", name: "Commerzbank", logo: "", category: "commercial", country: "DE", supported: true },
  { id: "n26", name: "N26", logo: "", category: "digital", country: "DE", supported: true },
  { id: "bny", name: "BNP Paribas", logo: "", category: "commercial", country: "FR", supported: true },
  { id: "socgen", name: "Société Générale", logo: "", category: "commercial", country: "FR", supported: true },
  { id: "ing", name: "ING Bank", logo: "", category: "commercial", country: "NL", supported: true },
  { id: "ubs", name: "UBS Group", logo: "", category: "investment", country: "CH", supported: true },
  { id: "credit-suisse", name: "Credit Suisse", logo: "", category: "investment", country: "CH", supported: true },
  { id: "enbd", name: "Emirates NBD", logo: "", category: "commercial", country: "AE", supported: true },
  { id: "adcb", name: "Abu Dhabi Commercial Bank", logo: "", category: "commercial", country: "AE", supported: true },
  { id: "fab", name: "First Abu Dhabi Bank", logo: "", category: "commercial", country: "AE", supported: true },
  { id: "dib", name: "Dubai Islamic Bank", logo: "", category: "islamic", country: "AE", supported: true },
  { id: "adib", name: "Abu Dhabi Islamic Bank", logo: "", category: "islamic", country: "AE", supported: true },
  { id: "rnc", name: "Riyad Bank", logo: "", category: "commercial", country: "SA", supported: true },
  { id: "snb", name: "Saudi National Bank", logo: "", category: "commercial", country: "SA", supported: true },
  { id: "alrajhi", name: "Al Rajhi Bank", logo: "", category: "islamic", country: "SA", supported: true },
  { id: "qnb", name: "Qatar National Bank", logo: "", category: "commercial", country: "QA", supported: true },
  { id: "nbb", name: "National Bank of Bahrain", logo: "", category: "commercial", country: "BH", supported: true },
  { id: "nbk", name: "National Bank of Kuwait", logo: "", category: "commercial", country: "KW", supported: true },
  { id: "boa-ng", name: "Bank of Africa Nigeria", logo: "", category: "commercial", country: "NG", supported: true },
  { id: "access", name: "Access Bank", logo: "", category: "commercial", country: "NG", supported: true },
  { id: "standard", name: "Standard Bank", logo: "", category: "commercial", country: "ZA", supported: true },
  { id: "absa", name: "Absa Group", logo: "", category: "commercial", country: "ZA", supported: true },
  { id: "commonwealth", name: "Commonwealth Bank", logo: "", category: "commercial", country: "AU", supported: true },
  { id: "westpac", name: "Westpac", logo: "", category: "commercial", country: "AU", supported: true },
  { id: "dbs", name: "DBS Bank", logo: "", category: "commercial", country: "SG", supported: true },
  { id: "ocbc", name: "OCBC Bank", logo: "", category: "commercial", country: "SG", supported: true },
  { id: "mufg", name: "MUFG Bank", logo: "", category: "commercial", country: "JP", supported: true },
  { id: "smbc", name: "SMBC Group", logo: "", category: "commercial", country: "JP", supported: true },
  { id: "hkhk", name: "HSBC Hong Kong", logo: "", category: "commercial", country: "HK", supported: true },
  { id: "hdfc", name: "HDFC Bank", logo: "", category: "commercial", country: "IN", supported: true },
  { id: "icici", name: "ICICI Bank", logo: "", category: "commercial", country: "IN", supported: true },
];

export function getMockAccounts(): DiscoveredAccount[] {
  return [
    { id: "acc-1", name: "Operating Account - USD", type: "operating", currency: "USD", balance: "$2,450,000.00", accountNumber: "****4521", selected: false },
    { id: "acc-2", name: "Payroll Account - USD", type: "payroll", currency: "USD", balance: "$850,000.00", accountNumber: "****7832", selected: false },
    { id: "acc-3", name: "Treasury Reserve - USD", type: "treasury", currency: "USD", balance: "$12,300,000.00", accountNumber: "****1145", selected: false },
    { id: "acc-4", name: "Investment Portfolio", type: "investment", currency: "USD", balance: "$8,750,000.00", accountNumber: "****9903", selected: false },
    { id: "acc-5", name: "Corporate Credit Line", type: "credit", currency: "USD", balance: "$5,000,000.00", accountNumber: "****3321", selected: false },
    { id: "acc-6", name: "Savings - EUR", type: "savings", currency: "EUR", balance: "€1,200,000.00", accountNumber: "****6678", selected: false },
    { id: "acc-7", name: "Escrow Account", type: "escrow", currency: "USD", balance: "$3,200,000.00", accountNumber: "****4456", selected: false },
    { id: "acc-8", name: "Operating Account - GBP", type: "operating", currency: "GBP", balance: "£950,000.00", accountNumber: "****2290", selected: false },
    { id: "acc-9", name: "Operating Account - AED", type: "operating", currency: "AED", balance: "د.إ 8,400,000.00", accountNumber: "****7783", selected: false },
    { id: "acc-10", name: "Operating Account - SAR", type: "operating", currency: "SAR", balance: "﷼ 7,200,000.00", accountNumber: "****3344", selected: false },
  ];
}

export function getMockLegalEntities(): LegalEntity[] {
  return [
    {
      id: "ent-1",
      name: "Perionyx Global Holdings",
      type: "enterprise",
      parentId: null,
      children: [
        {
          id: "ent-2",
          name: "Perionyx North America",
          type: "legal_entity",
          parentId: "ent-1",
          children: [
            { id: "ent-3", name: "US Operations", type: "business_unit", parentId: "ent-2", children: [] },
            { id: "ent-4", name: "Canada Operations", type: "business_unit", parentId: "ent-2", children: [] },
          ],
        },
        {
          id: "ent-5",
          name: "Perionyx EMEA",
          type: "legal_entity",
          parentId: "ent-1",
          children: [
            { id: "ent-6", name: "UK Operations", type: "business_unit", parentId: "ent-5", children: [] },
            { id: "ent-7", name: "EU Operations", type: "business_unit", parentId: "ent-5", children: [] },
            { id: "ent-8", name: "UAE Operations", type: "business_unit", parentId: "ent-5", children: [] },
          ],
        },
        {
          id: "ent-9",
          name: "Perionyx Asia Pacific",
          type: "legal_entity",
          parentId: "ent-1",
          children: [
            { id: "ent-10", name: "Australia Operations", type: "business_unit", parentId: "ent-9", children: [] },
            { id: "ent-11", name: "Singapore Operations", type: "business_unit", parentId: "ent-9", children: [] },
          ],
        },
      ],
    },
  ];
}

export function getMockConnectionHealth(): ConnectionHealthData {
  return {
    id: "conn-1",
    providerName: "Plaid",
    institutionName: "Chase Bank",
    healthScore: 97,
    lastSync: "2 minutes ago",
    nextSync: "In 22 hours",
    credentialExpiry: "Expires in 45 days",
    permissionStatus: "active",
    accountsCount: 7,
    currencies: ["USD", "EUR", "GBP"],
    status: "connected",
  };
}

export function getMockConnectionHistory(): ConnectionHistoryEntry[] {
  return [
    { id: "hist-1", action: "Connection Established", timestamp: "2026-07-01 09:30:00", details: "Connected to Chase Bank via Plaid", status: "success" },
    { id: "hist-2", action: "Account Discovery", timestamp: "2026-07-01 09:30:15", details: "7 accounts discovered and linked", status: "success" },
    { id: "hist-3", action: "First Sync", timestamp: "2026-07-01 09:32:00", details: "Historical sync completed — 12,450 transactions imported", status: "success" },
    { id: "hist-4", action: "Balance Refresh", timestamp: "2026-07-02 04:00:00", details: "Daily balance sync completed", status: "success" },
    { id: "hist-5", action: "Transaction Sync", timestamp: "2026-07-02 04:05:00", details: "347 new transactions synced", status: "success" },
    { id: "hist-6", action: "Rate Limit Warning", timestamp: "2026-07-03 14:22:00", details: "Plaid rate limit at 85% — 4,200/5,000 daily", status: "warning" },
    { id: "hist-7", action: "Credential Rotation", timestamp: "2026-07-05 10:00:00", details: "Access token rotated successfully", status: "success" },
  ];
}
