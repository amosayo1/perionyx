import type {
  RegionalCashData,
  EntityCashData,
  CurrencyPositionData,
  InstitutionCashData,
  CashCompositionItem,
  CashMovementEvent,
  DailyVariance,
  TreasuryAlertData,
  ExecutiveInsight,
  TreasuryKPIs,
  KPIChange,
  TrendDataPoint,
} from "./types";

const USD = 1;
const EUR = 1.08;
const GBP = 1.26;
const AED = 0.27;
const ZAR = 0.054;
const JPY = 0.0067;
const CHF = 1.12;
const SGD = 0.75;
const CAD = 0.74;
const AUD = 0.66;

export const MOCK_TREASURY_KPIS: TreasuryKPIs = {
  totalCash: { value: 842750000, change: 12350000, changePercent: 1.49, direction: "up" },
  availableCash: { value: 689320000, change: 9870000, changePercent: 1.45, direction: "up" },
  restrictedCash: { value: 98200000, change: -2450000, changePercent: -2.44, direction: "down" },
  idleCash: { value: 145800000, change: 3200000, changePercent: 2.24, direction: "up" },
  workingCapital: { value: 523000000, change: 8700000, changePercent: 1.69, direction: "up" },
  netLiquidity: { value: 612000000, change: 10500000, changePercent: 1.75, direction: "up" },
};

export const MOCK_REGIONAL_CASH: RegionalCashData[] = [
  { region: "North America", totalCash: 380000000, availableCash: 325000000, restrictedCash: 35000000, idleCash: 65000000, currencyCount: 3, entityCount: 2, institutionCount: 3, dailyChange: 2100000, weeklyChange: 8500000, monthlyChange: 32000000, liquidityScore: 94, trend: "up" },
  { region: "Europe", totalCash: 195000000, availableCash: 158000000, restrictedCash: 22000000, idleCash: 38000000, currencyCount: 4, entityCount: 2, institutionCount: 3, dailyChange: 850000, weeklyChange: 3200000, monthlyChange: -4500000, liquidityScore: 87, trend: "down" },
  { region: "Middle East", totalCash: 165000000, availableCash: 132000000, restrictedCash: 18000000, idleCash: 28000000, currencyCount: 2, entityCount: 1, institutionCount: 2, dailyChange: 1200000, weeklyChange: 5100000, monthlyChange: 18500000, liquidityScore: 91, trend: "up" },
  { region: "Africa", totalCash: 52750000, availableCash: 38320000, restrictedCash: 8500000, idleCash: 8000000, currencyCount: 2, entityCount: 1, institutionCount: 2, dailyChange: -350000, weeklyChange: -1200000, monthlyChange: -5200000, liquidityScore: 62, trend: "down" },
  { region: "Asia-Pacific", totalCash: 50000000, availableCash: 36000000, restrictedCash: 14700000, idleCash: 6000000, currencyCount: 3, entityCount: 1, institutionCount: 2, dailyChange: 400000, weeklyChange: 1800000, monthlyChange: 2500000, liquidityScore: 78, trend: "up" },
];

export const MOCK_ENTITY_CASH: EntityCashData[] = [
  { entityId: "ent-perionyx-inc", entityName: "Perionyx Inc.", region: "North America", currency: "USD", available: 185000000, restricted: 18000000, idle: 32000000, workingCapital: 245000000, liquidityScore: 95, dailyChange: 1500000 },
  { entityId: "ent-perionyx-llc", entityName: "Perionyx LLC", region: "North America", currency: "USD", available: 140000000, restricted: 17000000, idle: 33000000, workingCapital: 185000000, liquidityScore: 92, dailyChange: 600000 },
  { entityId: "ent-perionyx-uk", entityName: "Perionyx UK Ltd.", region: "Europe", currency: "GBP", available: 78000000, restricted: 10000000, idle: 18000000, workingCapital: 95000000, liquidityScore: 88, dailyChange: 400000 },
  { entityId: "ent-perionyx-eu", entityName: "Perionyx EU B.V.", region: "Europe", currency: "EUR", available: 80000000, restricted: 12000000, idle: 20000000, workingCapital: 88000000, liquidityScore: 85, dailyChange: 450000 },
  { entityId: "ent-perionyx-me", entityName: "Perionyx Middle East LLC", region: "Middle East", currency: "AED", available: 132000000, restricted: 18000000, idle: 28000000, workingCapital: 95000000, liquidityScore: 91, dailyChange: 1200000 },
  { entityId: "ent-perionyx-africa", entityName: "Perionyx Africa Pty Ltd.", region: "Africa", currency: "ZAR", available: 38320000, restricted: 8500000, idle: 8000000, workingCapital: 15000000, liquidityScore: 62, dailyChange: -350000 },
  { entityId: "ent-perionyx-apac", entityName: "Perionyx APAC Pte Ltd.", region: "Asia-Pacific", currency: "SGD", available: 36000000, restricted: 14700000, idle: 6000000, workingCapital: 42000000, liquidityScore: 78, dailyChange: 400000 },
];

export const MOCK_CURRENCY_POSITIONS: CurrencyPositionData[] = [
  { currency: "USD", balance: 380000000, functionalAmount: 380000000, reportingAmount: 380000000, exposure: 0, fxRisk: "low", trend: "up", percentageOfTotal: 45.1 },
  { currency: "EUR", balance: 95000000, functionalAmount: 102600000, reportingAmount: 102600000, exposure: 7600000, fxRisk: "medium", trend: "stable", percentageOfTotal: 11.3 },
  { currency: "GBP", balance: 62000000, functionalAmount: 78120000, reportingAmount: 78120000, exposure: 16120000, fxRisk: "medium", trend: "down", percentageOfTotal: 7.4 },
  { currency: "AED", balance: 165000000, functionalAmount: 44550000, reportingAmount: 44550000, exposure: 120450000, fxRisk: "high", trend: "up", percentageOfTotal: 19.6 },
  { currency: "ZAR", balance: 52750000, functionalAmount: 2848500, reportingAmount: 2848500, exposure: 49901500, fxRisk: "high", trend: "down", percentageOfTotal: 6.3 },
  { currency: "JPY", balance: 1800000000, functionalAmount: 12060000, reportingAmount: 12060000, exposure: 0, fxRisk: "medium", trend: "stable", percentageOfTotal: 2.1 },
  { currency: "CHF", balance: 15000000, functionalAmount: 16800000, reportingAmount: 16800000, exposure: 1800000, fxRisk: "low", trend: "up", percentageOfTotal: 1.8 },
  { currency: "SGD", balance: 50000000, functionalAmount: 37500000, reportingAmount: 37500000, exposure: 12500000, fxRisk: "medium", trend: "up", percentageOfTotal: 5.9 },
  { currency: "CAD", balance: 12000000, functionalAmount: 8880000, reportingAmount: 8880000, exposure: 3120000, fxRisk: "low", trend: "stable", percentageOfTotal: 1.4 },
  { currency: "AUD", balance: 8000000, functionalAmount: 5280000, reportingAmount: 5280000, exposure: 2720000, fxRisk: "low", trend: "down", percentageOfTotal: 0.8 },
];

export const MOCK_INSTITUTION_CASH: InstitutionCashData[] = [
  { institution: "JPMorgan Chase", accountCount: 4, totalCash: 185000000, availableCash: 158000000, restrictedCash: 15000000, liquidityScore: 95, relationshipHealth: "healthy", providerKind: "Plaid" },
  { institution: "Bank of America", accountCount: 3, totalCash: 145000000, availableCash: 122000000, restrictedCash: 12000000, liquidityScore: 92, relationshipHealth: "healthy", providerKind: "Finicity" },
  { institution: "Barclays", accountCount: 3, totalCash: 95000000, availableCash: 72000000, restrictedCash: 12000000, liquidityScore: 85, relationshipHealth: "healthy", providerKind: "TrueLayer" },
  { institution: "HSBC Holdings", accountCount: 2, totalCash: 62000000, availableCash: 48000000, restrictedCash: 8000000, liquidityScore: 72, relationshipHealth: "degraded", providerKind: "Tink" },
  { institution: "First Abu Dhabi Bank", accountCount: 2, totalCash: 85000000, availableCash: 68000000, restrictedCash: 10000000, liquidityScore: 78, relationshipHealth: "degraded", providerKind: "Lean" },
  { institution: "Emirates NBD", accountCount: 2, totalCash: 80000000, availableCash: 64000000, restrictedCash: 8000000, liquidityScore: 88, relationshipHealth: "healthy", providerKind: "Lean" },
  { institution: "Nedbank", accountCount: 2, totalCash: 27500000, availableCash: 18320000, restrictedCash: 4500000, liquidityScore: 55, relationshipHealth: "critical", providerKind: "Yap" },
  { institution: "Standard Bank", accountCount: 1, totalCash: 25250000, availableCash: 20000000, restrictedCash: 4000000, liquidityScore: 65, relationshipHealth: "degraded", providerKind: "Yap" },
  { institution: "Mitsubishi UFJ", accountCount: 2, totalCash: 18000000, availableCash: 12000000, restrictedCash: 4700000, liquidityScore: 75, relationshipHealth: "healthy", providerKind: "Plaid" },
  { institution: "DBS Bank", accountCount: 1, totalCash: 25000000, availableCash: 20000000, restrictedCash: 5000000, liquidityScore: 80, relationshipHealth: "healthy", providerKind: "Tink" },
  { institution: "UBS", accountCount: 1, totalCash: 38000000, availableCash: 32000000, restrictedCash: 4000000, liquidityScore: 90, relationshipHealth: "healthy", providerKind: "Truelayer" },
  { institution: "Citi", accountCount: 1, totalCash: 50000000, availableCash: 45000000, restrictedCash: 3000000, liquidityScore: 93, relationshipHealth: "healthy", providerKind: "Plaid" },
];

export const MOCK_CASH_COMPOSITION: CashCompositionItem[] = [
  { classification: "Operating", amount: 385000000, percentage: 45.7, color: "text-emerald-400" },
  { classification: "Treasury", amount: 142000000, percentage: 16.8, color: "text-blue-400" },
  { classification: "Payroll", amount: 45000000, percentage: 5.3, color: "text-violet-400" },
  { classification: "Tax", amount: 38500000, percentage: 4.6, color: "text-amber-400" },
  { classification: "Investment", amount: 82000000, percentage: 9.7, color: "text-cyan-400" },
  { classification: "Reserve", amount: 52000000, percentage: 6.2, color: "text-indigo-400" },
  { classification: "Restricted", amount: 52000000, percentage: 6.2, color: "text-red-400" },
  { classification: "Escrow", amount: 18500000, percentage: 2.2, color: "text-orange-400" },
  { classification: "Collateral", amount: 15000000, percentage: 1.8, color: "text-pink-400" },
  { classification: "Petty Cash", amount: 12750000, percentage: 1.5, color: "text-zinc-400" },
];

export const MOCK_CASH_MOVEMENTS: CashMovementEvent[] = [
  { id: "cm-1", type: "opening", label: "Opening Balance", amount: 830400000, timestamp: "2026-07-09T00:00:00Z", description: "Opening cash balance for 2026-07-09" },
  { id: "cm-2", type: "collections", label: "Collections", amount: 18500000, timestamp: "2026-07-09T10:30:00Z", description: "Customer payments received across all entities" },
  { id: "cm-3", type: "payments", label: "Payments", amount: -8200000, timestamp: "2026-07-09T14:00:00Z", description: "Supplier payments, payroll, and operational expenses" },
  { id: "cm-4", type: "funding", label: "Funding", amount: 5000000, timestamp: "2026-07-09T11:00:00Z", description: "Intercompany funding from Perionyx Inc. to Perionyx UK Ltd." },
  { id: "cm-5", type: "transfers", label: "Transfers", amount: -1500000, timestamp: "2026-07-09T09:00:00Z", description: "Cash concentration sweep from regional accounts" },
  { id: "cm-6", type: "fx", label: "FX Impact", amount: -1250000, timestamp: "2026-07-09T16:00:00Z", description: "FX revaluation on EUR, GBP, and AED positions" },
  { id: "cm-7", type: "closing", label: "Closing Balance", amount: 842750000, timestamp: "2026-07-09T23:59:59Z", description: "Closing cash balance for 2026-07-09" },
];

export const MOCK_DAILY_VARIANCE: DailyVariance[] = [
  { date: "Jul 03", opening: 825000000, closing: 828500000, netChange: 3500000, collections: 18500000, payments: -15000000 },
  { date: "Jul 04", opening: 828500000, closing: 825000000, netChange: -3500000, collections: 12000000, payments: -15500000 },
  { date: "Jul 05", opening: 825000000, closing: 830200000, netChange: 5200000, collections: 22000000, payments: -16800000 },
  { date: "Jul 06", opening: 830200000, closing: 835500000, netChange: 5300000, collections: 19500000, payments: -14200000 },
  { date: "Jul 07", opening: 835500000, closing: 832000000, netChange: -3500000, collections: 14000000, payments: -17500000 },
  { date: "Jul 08", opening: 832000000, closing: 836600000, netChange: 4600000, collections: 21000000, payments: -16400000 },
  { date: "Jul 09", opening: 836600000, closing: 842750000, netChange: 6150000, collections: 23500000, payments: -17350000 },
];

export const MOCK_TREND_DATA: TrendDataPoint[] = [
  { date: "Jan", value: 782000000, label: "Jan" },
  { date: "Feb", value: 798000000, label: "Feb" },
  { date: "Mar", value: 815000000, label: "Mar" },
  { date: "Apr", value: 808000000, label: "Apr" },
  { date: "May", value: 825000000, label: "May" },
  { date: "Jun", value: 836600000, label: "Jun" },
  { date: "Jul", value: 842750000, label: "Jul" },
];

export const MOCK_ALERTS: TreasuryAlertData[] = [
  { id: "alert-1", severity: "critical", category: "MINIMUM_CASH_BREACH", title: "Nedbank Minimum Cash Breach", message: "Nedbank ZAR account has fallen below minimum cash threshold by ZAR 2,500,000", timestamp: "2026-07-09T08:30:00Z", acknowledged: false },
  { id: "alert-2", severity: "warning", category: "CREDENTIAL_EXPIRING", title: "HSBC Credentials Expiring", message: "HSBC Holdings connection credentials expire in 5 days", timestamp: "2026-07-09T06:00:00Z", acknowledged: false },
  { id: "alert-3", severity: "warning", category: "FX_EXPOSURE_LIMIT", title: "AED FX Exposure Warning", message: "AED exposure is 72% of policy limit (USD 120M / USD 165M limit)", timestamp: "2026-07-09T07:15:00Z", acknowledged: true },
  { id: "alert-4", severity: "info", category: "FORECAST_DEVIATION", title: "APAC Forecast Variance", message: "APAC cash forecast deviated 8% from actual — review assumptions", timestamp: "2026-07-09T09:00:00Z", acknowledged: false },
  { id: "alert-5", severity: "critical", category: "LIQUIDITY_BUFFER_BREACH", title: "Africa Liquidity Buffer Breach", message: "Africa region liquidity buffer is 18% — below the 25% policy minimum", timestamp: "2026-07-09T05:45:00Z", acknowledged: false },
];

export const MOCK_INSIGHTS: ExecutiveInsight[] = [
  { type: "concentration", title: "Largest Cash Concentration", description: "USD represents 45.1% of total cash. North America holds the largest regional share at 45.1%.", severity: "positive", value: "USD 380M" },
  { type: "fx_risk", title: "Highest FX Exposure", description: "AED exposure is USD 120M — 72% of the policy limit. Consider hedging strategies.", severity: "warning", value: "USD 120M" },
  { type: "idle_cash", title: "Most Idle Cash", description: "USD 145.8M idle across all entities. Potential investment yield opportunity at 4.5% = ~$6.5M annually.", severity: "warning", value: "USD 145.8M" },
  { type: "restricted", title: "Most Restricted Cash", description: "Asia-Pacific has USD 14.7M restricted (29.4% of regional cash) — highest ratio globally.", severity: "warning", value: "USD 14.7M" },
  { type: "liquidity", title: "Liquidity Warning", description: "Africa liquidity score is 62 — the lowest region. Nedbank and Standard Bank connections are degraded/critical.", severity: "critical", value: "Score: 62" },
  { type: "funding", title: "Funding Recommendation", description: "AFRICA entity may require intercompany funding within 14 days based on current burn rate of ZAR 3.2M/week.", severity: "warning", value: "ZAR 3.2M/week" },
];

export const MOCK_CASH_TREND_DATA = MOCK_TREND_DATA;
export const MOCK_LIQUIDITY_TREND_DATA: TrendDataPoint[] = [
  { date: "Week 1", value: 585000000, label: "W1" },
  { date: "Week 2", value: 592000000, label: "W2" },
  { date: "Week 3", value: 598000000, label: "W3" },
  { date: "Week 4", value: 605000000, label: "W4" },
  { date: "Week 5", value: 612000000, label: "W5" },
];

export const MOCK_EXECUTIVE_SUMMARY = {
  totalEntities: 7,
  totalInstitutions: 12,
  totalAccounts: 24,
  totalRegions: 5,
  totalCurrencies: 10,
  totalPools: 3,
  openAlerts: 4,
  pendingFundingRequests: 2,
  lastUpdated: "2026-07-09T16:30:00Z",
};
