import type {
  LiquiditySummary,
  LiquidityPool,
  ForecastPeriod,
  FundingRequestItem,
  IntercompanyFundingRow,
  RegionLiquidity,
  LiquidityAlert,
  LiquidityInsight,
  ScenarioResult,
  TreasuryRecommendation,
  EntityLiquidity,
  TrendPoint,
  AnalyticsSeries,
  CoverageMetrics,
  CashBurnMetrics,
  LiquidityCompositionItem,
} from "./types";

export const MOCK_LIQUIDITY_SUMMARY: LiquiditySummary = {
  currentLiquidity: 842750000,
  availableLiquidity: 689320000,
  restrictedLiquidity: 98200000,
  idleCash: 145800000,
  netLiquidity: 612000000,
  workingCapital: 523000000,
  coverageRatio: 2.4,
  liquidityBuffer: 27.5,
  daysCashRemaining: 245,
  forecastConfidence: 82,
  entities: 12,
  regions: 8,
  currencies: 14,
  fundingRequests: 25,
  treasuryAlerts: 15,
  lastUpdated: "2026-07-09T16:30:00Z",
  dailyDelta: 12350000,
  dailyDeltaPercent: 1.49,
  trend: "up",
  status: "healthy",
};

export const MOCK_LIQUIDITY_POOLS: LiquidityPool[] = [
  { id: "pool-op", name: "Operating Pool", type: "Physical", currentBalance: 385000000, targetBalance: 400000000, utilization: 96.3, availablePercent: 82, policyCompliance: "compliant", healthScore: 94, recommendedTransfer: 0, trend: "up", currency: "USD", region: "Global", members: 8 },
  { id: "pool-reserve", name: "Reserve Pool", type: "Notional", currentBalance: 142000000, targetBalance: 150000000, utilization: 94.7, availablePercent: 68, policyCompliance: "compliant", healthScore: 88, recommendedTransfer: 8000000, trend: "stable", currency: "USD", region: "Global", members: 5 },
  { id: "pool-strat", name: "Strategic Pool", type: "Notional", currentBalance: 82000000, targetBalance: 100000000, utilization: 82.0, availablePercent: 55, policyCompliance: "compliant", healthScore: 82, recommendedTransfer: 18000000, trend: "up", currency: "USD", region: "Global", members: 4 },
  { id: "pool-inv", name: "Investment Pool", type: "Physical", currentBalance: 65000000, targetBalance: 80000000, utilization: 81.3, availablePercent: 45, policyCompliance: "warning", healthScore: 72, recommendedTransfer: 15000000, trend: "down", currency: "USD", region: "Global", members: 3 },
  { id: "pool-restricted", name: "Restricted Pool", type: "Virtual", currentBalance: 52000000, targetBalance: 55000000, utilization: 94.5, availablePercent: 12, policyCompliance: "compliant", healthScore: 78, recommendedTransfer: 0, trend: "stable", currency: "USD", region: "Global", members: 6 },
  { id: "pool-emergency", name: "Emergency Pool", type: "Virtual", currentBalance: 75000000, targetBalance: 100000000, utilization: 75.0, availablePercent: 100, policyCompliance: "compliant", healthScore: 90, recommendedTransfer: 25000000, trend: "up", currency: "USD", region: "Global", members: 2 },
];

export const MOCK_FORECAST_PERIODS: ForecastPeriod[] = [
  { horizon: "Today", horizonDays: 0, openingBalance: 842750000, expectedInflows: 8500000, expectedOutflows: -6200000, closingBalance: 845050000, minimumBuffer: 85000000, surplus: 760050000, deficit: 0, confidence: 95, risk: "low" },
  { horizon: "7 Days", horizonDays: 7, openingBalance: 842750000, expectedInflows: 58000000, expectedOutflows: -42000000, closingBalance: 858750000, minimumBuffer: 85000000, surplus: 773750000, deficit: 0, confidence: 88, risk: "low" },
  { horizon: "30 Days", horizonDays: 30, openingBalance: 842750000, expectedInflows: 245000000, expectedOutflows: -198000000, closingBalance: 889750000, minimumBuffer: 85000000, surplus: 804750000, deficit: 0, confidence: 76, risk: "low" },
  { horizon: "90 Days", horizonDays: 90, openingBalance: 842750000, expectedInflows: 720000000, expectedOutflows: -685000000, closingBalance: 877750000, minimumBuffer: 85000000, surplus: 792750000, deficit: 0, confidence: 62, risk: "medium" },
  { horizon: "180 Days", horizonDays: 180, openingBalance: 842750000, expectedInflows: 1450000000, expectedOutflows: -1380000000, closingBalance: 912750000, minimumBuffer: 85000000, surplus: 827750000, deficit: 0, confidence: 48, risk: "medium" },
  { horizon: "365 Days", horizonDays: 365, openingBalance: 842750000, expectedInflows: 2950000000, expectedOutflows: -2820000000, closingBalance: 972750000, minimumBuffer: 85000000, surplus: 887750000, deficit: 0, confidence: 35, risk: "high" },
];

export const MOCK_FUNDING_REQUESTS: FundingRequestItem[] = [
  { id: "fr-001", entity: "Perionyx Africa Pty Ltd.", businessUnit: "Operations", priority: "critical", amountRequired: 25000000, needDate: "2026-07-25", fundingSource: "Perionyx Inc.", approvalStatus: "pending", fundingMethod: "Intercompany Loan", risk: "high", recommendedAction: "Approve urgently — ZAR reserve depleting" },
  { id: "fr-002", entity: "Perionyx APAC Pte Ltd.", businessUnit: "Treasury", priority: "high", amountRequired: 15000000, needDate: "2026-08-01", fundingSource: "Regional Pool", approvalStatus: "approved", fundingMethod: "Pool Transfer", risk: "medium", recommendedAction: "Execute pool transfer" },
  { id: "fr-003", entity: "Perionyx UK Ltd.", businessUnit: "Corporate", priority: "medium", amountRequired: 8000000, needDate: "2026-08-15", fundingSource: "Europe Reserve", approvalStatus: "approved", fundingMethod: "Treasury Transfer", risk: "low", recommendedAction: "Schedule for Aug 12" },
  { id: "fr-004", entity: "Perionyx EU B.V.", businessUnit: "Corporate", priority: "low", amountRequired: 5000000, needDate: "2026-09-01", fundingSource: "Internal Cash", approvalStatus: "pending", fundingMethod: "Intercompany Loan", risk: "low", recommendedAction: "Route to VP Treasury" },
  { id: "fr-005", entity: "Perionyx Middle East LLC", businessUnit: "Treasury", priority: "high", amountRequired: 18000000, needDate: "2026-07-20", fundingSource: "Europe Reserve", approvalStatus: "executing", fundingMethod: "Pool Transfer", risk: "medium", recommendedAction: "Monitor execution — wire initiated" },
];

export const MOCK_INTERCOMPANY_FUNDING: IntercompanyFundingRow[] = [
  { fromEntity: "Perionyx Inc.", toEntity: "Perionyx Africa Pty Ltd.", amount: 25000000, interestRate: 4.5, settlementDate: "2026-07-25", status: "pending", approval: "CFO Review", expectedCompletion: "2026-07-28" },
  { fromEntity: "Perionyx EU B.V.", toEntity: "Perionyx UK Ltd.", amount: 8000000, interestRate: 3.8, settlementDate: "2026-08-15", status: "approved", approval: "VP Treasury", expectedCompletion: "2026-08-12" },
  { fromEntity: "Perionyx Inc.", toEntity: "Perionyx Middle East LLC", amount: 18000000, interestRate: 4.2, settlementDate: "2026-07-20", status: "executing", approval: "VP Treasury", expectedCompletion: "2026-07-22" },
  { fromEntity: "Perionyx LLC", toEntity: "Perionyx EU B.V.", amount: 5000000, interestRate: 3.5, settlementDate: "2026-09-01", status: "pending", approval: "Treasury Manager", expectedCompletion: "2026-08-28" },
  { fromEntity: "Perionyx UK Ltd.", toEntity: "Perionyx APAC Pte Ltd.", amount: 3000000, interestRate: 4.0, settlementDate: "2026-08-10", status: "completed", approval: "Treasury Manager", expectedCompletion: "2026-08-10" },
];

export const MOCK_REGION_LIQUIDITY: RegionLiquidity[] = [
  { region: "North America", totalCash: 380000000, available: 325000000, restricted: 35000000, netLiquidity: 290000000, liquidityScore: 94, fundingNeed: 0, cashBurn: 12500000, coverageDays: 312, forecast: "positive", trend: "up" },
  { region: "Europe", totalCash: 195000000, available: 158000000, restricted: 22000000, netLiquidity: 136000000, liquidityScore: 87, fundingNeed: 5000000, cashBurn: 9800000, coverageDays: 196, forecast: "stable", trend: "down" },
  { region: "Middle East", totalCash: 165000000, available: 132000000, restricted: 18000000, netLiquidity: 114000000, liquidityScore: 91, fundingNeed: 18000000, cashBurn: 8500000, coverageDays: 265, forecast: "positive", trend: "up" },
  { region: "Africa", totalCash: 52750000, available: 38320000, restricted: 8500000, netLiquidity: 29820000, liquidityScore: 62, fundingNeed: 25000000, cashBurn: 5200000, coverageDays: 70, forecast: "negative", trend: "down" },
  { region: "Asia-Pacific", totalCash: 50000000, available: 36000000, restricted: 14700000, netLiquidity: 21300000, liquidityScore: 78, fundingNeed: 15000000, cashBurn: 3800000, coverageDays: 128, forecast: "stable", trend: "up" },
  { region: "Latin America", totalCash: 25000000, available: 18000000, restricted: 5000000, netLiquidity: 13000000, liquidityScore: 68, fundingNeed: 8000000, cashBurn: 2100000, coverageDays: 85, forecast: "negative", trend: "down" },
  { region: "Oceania", totalCash: 15000000, available: 12000000, restricted: 2000000, netLiquidity: 10000000, liquidityScore: 72, fundingNeed: 3000000, cashBurn: 1500000, coverageDays: 96, forecast: "stable", trend: "stable" },
  { region: "Africa (North)", totalCash: 8500000, available: 5800000, restricted: 1500000, netLiquidity: 4300000, liquidityScore: 45, fundingNeed: 5000000, cashBurn: 1200000, coverageDays: 45, forecast: "negative", trend: "down" },
];

export const MOCK_ENTITY_LIQUIDITY: EntityLiquidity[] = [
  { entity: "Perionyx Inc.", region: "North America", currency: "USD", available: 185000000, restricted: 18000000, netLiquidity: 167000000, liquidityScore: 95, cashBurn: 5200000, coverageDays: 355, status: "healthy" },
  { entity: "Perionyx LLC", region: "North America", currency: "USD", available: 140000000, restricted: 17000000, netLiquidity: 123000000, liquidityScore: 92, cashBurn: 4800000, coverageDays: 291, status: "healthy" },
  { entity: "Perionyx UK Ltd.", region: "Europe", currency: "GBP", available: 78000000, restricted: 10000000, netLiquidity: 68000000, liquidityScore: 88, cashBurn: 4200000, coverageDays: 185, status: "healthy" },
  { entity: "Perionyx EU B.V.", region: "Europe", currency: "EUR", available: 80000000, restricted: 12000000, netLiquidity: 68000000, liquidityScore: 85, cashBurn: 5600000, coverageDays: 142, status: "watch" },
  { entity: "Perionyx Middle East LLC", region: "Middle East", currency: "AED", available: 132000000, restricted: 18000000, netLiquidity: 114000000, liquidityScore: 91, cashBurn: 8500000, coverageDays: 155, status: "healthy" },
  { entity: "Perionyx Africa Pty Ltd.", region: "Africa", currency: "ZAR", available: 38320000, restricted: 8500000, netLiquidity: 29820000, liquidityScore: 62, cashBurn: 5200000, coverageDays: 70, status: "critical" },
  { entity: "Perionyx APAC Pte Ltd.", region: "Asia-Pacific", currency: "SGD", available: 36000000, restricted: 14700000, netLiquidity: 21300000, liquidityScore: 78, cashBurn: 3800000, coverageDays: 128, status: "watch" },
  { entity: "Perionyx LatAm S.A.", region: "Latin America", currency: "BRL", available: 18000000, restricted: 5000000, netLiquidity: 13000000, liquidityScore: 68, cashBurn: 2100000, coverageDays: 85, status: "critical" },
  { entity: "Perionyx Oceania Ltd.", region: "Oceania", currency: "AUD", available: 12000000, restricted: 2000000, netLiquidity: 10000000, liquidityScore: 72, cashBurn: 1500000, coverageDays: 96, status: "watch" },
  { entity: "Perionyx North Africa SARL", region: "Africa (North)", currency: "MAD", available: 5800000, restricted: 1500000, netLiquidity: 4300000, liquidityScore: 45, cashBurn: 1200000, coverageDays: 45, status: "critical" },
  { entity: "Perionyx Asia Ltd.", region: "Asia-Pacific", currency: "CNY", available: 15000000, restricted: 3000000, netLiquidity: 12000000, liquidityScore: 70, cashBurn: 2200000, coverageDays: 81, status: "watch" },
  { entity: "Perionyx Gulf LLC", region: "Middle East", currency: "AED", available: 28000000, restricted: 5000000, netLiquidity: 23000000, liquidityScore: 82, cashBurn: 2800000, coverageDays: 110, status: "healthy" },
];

export const MOCK_LIQUIDITY_ALERTS: LiquidityAlert[] = [
  { id: "la-1", category: "Minimum Buffer Breach", severity: "critical", title: "Africa Liquidity Buffer Critical", message: "Perionyx Africa Pty Ltd. has 18% liquidity buffer — below 25% policy minimum", entity: "Perionyx Africa Pty Ltd.", suggestedAction: "Initiate intercompany funding of ZAR 25M from Perionyx Inc.", timestamp: "2026-07-09T08:30:00Z", acknowledged: false },
  { id: "la-2", category: "Funding Required", severity: "critical", title: "Africa Entity Funding Required", message: "Perionyx Africa Pty Ltd. has 70 days cash remaining — funding required within 14 days", entity: "Perionyx Africa Pty Ltd.", suggestedAction: "Expedite ZAR 25M funding request approval", timestamp: "2026-07-09T06:15:00Z", acknowledged: false },
  { id: "la-3", category: "Coverage Ratio Warning", severity: "warning", title: "LatAm Coverage Ratio Declining", message: "Perionyx LatAm coverage ratio dropped to 1.8x — below 2.0x target", entity: "Perionyx LatAm S.A.", suggestedAction: "Review cash burn and consider regional funding", timestamp: "2026-07-09T07:00:00Z", acknowledged: false },
  { id: "la-4", category: "Pool Imbalance", severity: "warning", title: "Investment Pool Underfunded", message: "Investment pool at 81% of target — 15M below strategic allocation", entity: "Perionyx Inc.", suggestedAction: "Transfer 15M from idle cash to investment pool", timestamp: "2026-07-09T09:00:00Z", acknowledged: true },
  { id: "la-5", category: "Cash Burn Spike", severity: "warning", title: "Europe Cash Burn Increased", message: "Perionyx EU B.V. cash burn increased 22% month-over-month", entity: "Perionyx EU B.V.", suggestedAction: "Review operational expenses and delay non-critical payments", timestamp: "2026-07-09T10:00:00Z", acknowledged: false },
  { id: "la-6", category: "Currency Concentration", severity: "warning", title: "AED Currency Concentration High", message: "AED represents 19.6% of total cash with 72% FX exposure to policy limit", entity: "Perionyx Middle East LLC", suggestedAction: "Consider AED hedging strategy", timestamp: "2026-07-09T04:30:00Z", acknowledged: true },
  { id: "la-7", category: "Forecast Deviation", severity: "info", title: "APAC Forecast Variance", message: "APAC 30-day forecast deviated 8% from actual — review assumptions", entity: "Perionyx APAC Pte Ltd.", suggestedAction: "Update forecast model with latest AR data", timestamp: "2026-07-09T11:00:00Z", acknowledged: false },
  { id: "la-8", category: "Large Upcoming Payment", severity: "info", title: "Quarterly Tax Payment Due", message: "USD 18.5M quarterly tax payment due July 25 across 3 entities", entity: "Perionyx Inc.", suggestedAction: "Ensure sufficient liquidity in operating accounts by Jul 24", timestamp: "2026-07-09T12:00:00Z", acknowledged: false },
];

export const MOCK_INSIGHTS: LiquidityInsight[] = [
  { type: "funding_gap", title: "Largest Funding Gap", description: "Africa region has a USD 25M funding gap with only 70 days cash remaining", severity: "critical", value: "USD 25M", action: "Expedite intercompany loan from Perionyx Inc." },
  { type: "overfunded", title: "Most Overfunded Region", description: "North America holds USD 120M above minimum requirements across 2 entities", severity: "positive", value: "USD 120M", action: "Consider regional rebalancing to Africa" },
  { type: "cash_burn", title: "Highest Cash Burn", description: "Perionyx Middle East LLC has the highest monthly cash burn at USD 8.5M", severity: "warning", value: "USD 8.5M/mo", action: "Review operational efficiency" },
  { type: "restricted", title: "Largest Restricted Cash", description: "Asia-Pacific has 29.4% of regional cash restricted — highest ratio globally", severity: "warning", value: "29.4%", action: "Review restriction agreements for potential release" },
  { type: "coverage", title: "Lowest Coverage Ratio", description: "North Africa SARL has only 45 days of coverage — critical risk threshold", severity: "critical", value: "45 days", action: "Emergency funding review required" },
  { type: "forecast_risk", title: "Highest Forecast Risk", description: "365-day forecast confidence is 35% — long-term projections are unreliable", severity: "warning", value: "35% confidence", action: "Improve data quality for long-term planning" },
  { type: "idle_opportunity", title: "Idle Cash Opportunity", description: "USD 145.8M idle across enterprise — 4.5% yield = $6.5M annual opportunity", severity: "positive", value: "USD 6.5M/yr", action: "Deploy idle cash to investment pool" },
  { type: "fx_concentration", title: "FX Concentration Risk", description: "AED exposure is USD 120M — 72% of policy limit without hedge coverage", severity: "warning", value: "72% of limit", action: "Implement AED hedging program" },
];

export const MOCK_SCENARIOS: ScenarioResult[] = [
  { name: "Revenue Down 20%", description: "Across-the-board revenue decline sustained for 2 quarters", liquidityImpact: -125000000, fundingImpact: 85000000, coverageRatio: 1.6, workingCapital: 398000000, liquidityScore: 62, recommendedActions: ["Draw emergency pool", "Delay investment allocation", "Freeze non-essential spend"], riskRating: "high" },
  { name: "Large Vendor Payment", description: "USD 50M unexpected vendor payment within 30 days", liquidityImpact: -50000000, fundingImpact: 30000000, coverageRatio: 2.1, workingCapital: 473000000, liquidityScore: 78, recommendedActions: ["Use reserve pool", "Defer discretionary spending"], riskRating: "medium" },
  { name: "FX Shock", description: "15% adverse FX movement across EUR, GBP, and AED", liquidityImpact: -28500000, fundingImpact: 15000000, coverageRatio: 2.2, workingCapital: 494500000, liquidityScore: 82, recommendedActions: ["Activate FX hedges", "Review currency exposure limits"], riskRating: "medium" },
  { name: "Acquisition", description: "USD 200M cash acquisition with 90-day closing", liquidityImpact: -200000000, fundingImpact: 150000000, coverageRatio: 1.1, workingCapital: 323000000, liquidityScore: 45, recommendedActions: ["Arrange bridge financing", "Draw strategic pool", "Suspend investment activity"], riskRating: "critical" },
  { name: "Interest Rate Increase", description: "200bps rate hike impacting floating rate debt", liquidityImpact: -8500000, fundingImpact: 5000000, coverageRatio: 2.3, workingCapital: 514500000, liquidityScore: 88, recommendedActions: ["Fix floating rate exposure", "Review debt structure"], riskRating: "low" },
  { name: "Supply Chain Delay", description: "60-day receivables delay from major customers", liquidityImpact: -45000000, fundingImpact: 35000000, coverageRatio: 1.9, workingCapital: 478000000, liquidityScore: 72, recommendedActions: ["Extend payables", "Draw on credit facilities"], riskRating: "medium" },
];

export const MOCK_RECOMMENDATIONS: TreasuryRecommendation[] = [
  { id: "rec-1", action: "Transfer $18M from Europe Reserve Pool to UAE Operating Pool", rationale: "Perionyx Middle East requires funding for upcoming vendor payments", impact: 18000000, impactLabel: "USD 18M", priority: "critical", category: "Pool Rebalance", entity: "Perionyx Middle East LLC" },
  { id: "rec-2", action: "Delay Investment Allocation of $15M to Q4", rationale: "Strategic liquidity preservation given Africa funding gap", impact: 15000000, impactLabel: "USD 15M", priority: "high", category: "Investment", entity: "Perionyx Inc." },
  { id: "rec-3", action: "Increase Liquidity Buffer from 25% to 30%", rationale: "Coverage ratio declining in 2 regions — buffer strengthening recommended", impact: 42000000, impactLabel: "USD 42M", priority: "high", category: "Policy", entity: "Enterprise" },
  { id: "rec-4", action: "Fund Perionyx Africa Pty Ltd. USD 25M Intercompany Loan", rationale: "Africa entity has 70 days cash remaining — funding required within 14 days", impact: 25000000, impactLabel: "USD 25M", priority: "critical", category: "Funding", entity: "Perionyx Africa Pty Ltd." },
  { id: "rec-5", action: "Convert EUR 10M Exposure to USD via Forward Contract", rationale: "EUR/USD volatility expected — lock in current favorable rate", impact: 10000000, impactLabel: "EUR 10M", priority: "medium", category: "FX", entity: "Perionyx EU B.V." },
  { id: "rec-6", action: "Reduce Idle Cash by Investing USD 50M in Money Market", rationale: "USD 145.8M idle — deploy 35% to short-term instruments at 4.5% yield", impact: 50000000, impactLabel: "USD 50M", priority: "medium", category: "Investment", entity: "Enterprise" },
  { id: "rec-7", action: "Accelerate Receivables Collection in Europe", rationale: "EU B.V. has 22% cash burn increase — accelerate AR to improve liquidity", impact: 8000000, impactLabel: "USD 8M", priority: "medium", category: "Working Capital", entity: "Perionyx EU B.V." },
  { id: "rec-8", action: "Delay Capital Spending by USD 12M to Q1 2027", rationale: "Preserve cash across uncertain regions — re-evaluate CapEx priorities", impact: 12000000, impactLabel: "USD 12M", priority: "low", category: "Capital", entity: "Enterprise" },
];

export const MOCK_TREND_DATA: Record<string, TrendPoint[]> = {
  liquidity: [
    { date: "Jan", value: 782000000, label: "Jan" },
    { date: "Feb", value: 798000000, label: "Feb" },
    { date: "Mar", value: 815000000, label: "Mar" },
    { date: "Apr", value: 808000000, label: "Apr" },
    { date: "May", value: 825000000, label: "May" },
    { date: "Jun", value: 836600000, label: "Jun" },
    { date: "Jul", value: 842750000, label: "Jul" },
  ],
  coverage: [
    { date: "Jan", value: 2.6, label: "Jan" },
    { date: "Feb", value: 2.5, label: "Feb" },
    { date: "Mar", value: 2.5, label: "Mar" },
    { date: "Apr", value: 2.4, label: "Apr" },
    { date: "May", value: 2.4, label: "May" },
    { date: "Jun", value: 2.3, label: "Jun" },
    { date: "Jul", value: 2.4, label: "Jul" },
  ],
  workingCapital: [
    { date: "Jan", value: 485000000, label: "Jan" },
    { date: "Feb", value: 492000000, label: "Feb" },
    { date: "Mar", value: 498000000, label: "Mar" },
    { date: "Apr", value: 505000000, label: "Apr" },
    { date: "May", value: 512000000, label: "May" },
    { date: "Jun", value: 518000000, label: "Jun" },
    { date: "Jul", value: 523000000, label: "Jul" },
  ],
  cashBurn: [
    { date: "Week 1", value: 28500000, label: "W1" },
    { date: "Week 2", value: 29200000, label: "W2" },
    { date: "Week 3", value: 27800000, label: "W3" },
    { date: "Week 4", value: 30500000, label: "W4" },
    { date: "Week 5", value: 31200000, label: "W5" },
  ],
  forecastAccuracy: [
    { date: "Jan", value: 88, label: "Jan" },
    { date: "Feb", value: 92, label: "Feb" },
    { date: "Mar", value: 85, label: "Mar" },
    { date: "Apr", value: 90, label: "Apr" },
    { date: "May", value: 87, label: "May" },
    { date: "Jun", value: 92, label: "Jun" },
    { date: "Jul", value: 82, label: "Jul" },
  ],
};

export const MOCK_COVERAGE_METRICS: CoverageMetrics = {
  currentRatio: 2.4,
  quickRatio: 1.8,
  cashRatio: 1.2,
  coverageDays: 245,
  liquidityCoverage: 27.5,
};

export const MOCK_CASH_BURN_METRICS: CashBurnMetrics = {
  dailyBurn: 28500000,
  weeklyBurn: 142000000,
  monthlyBurn: 585000000,
  quarterlyBurn: 1720000000,
  runwayDays: 245,
};

export const MOCK_LIQUIDITY_COMPOSITION: LiquidityCompositionItem[] = [
  { category: "Operating", amount: 385000000, percentage: 45.7, trend: "up", color: "text-emerald-400" },
  { category: "Reserve", amount: 142000000, percentage: 16.8, trend: "stable", color: "text-blue-400" },
  { category: "Strategic", amount: 82000000, percentage: 9.7, trend: "up", color: "text-violet-400" },
  { category: "Investment", amount: 65000000, percentage: 7.7, trend: "down", color: "text-cyan-400" },
  { category: "Restricted", amount: 52000000, percentage: 6.2, trend: "stable", color: "text-red-400" },
  { category: "Emergency", amount: 75000000, percentage: 8.9, trend: "up", color: "text-amber-400" },
  { category: "Idle", amount: 145800000, percentage: 17.3, trend: "up", color: "text-zinc-400" },
  { category: "Committed", amount: 28500000, percentage: 3.4, trend: "down", color: "text-orange-400" },
  { category: "Pending", amount: 12500000, percentage: 1.5, trend: "down", color: "text-pink-400" },
  { category: "Forecasted", amount: 75000000, percentage: 8.9, trend: "up", color: "text-indigo-400" },
];
