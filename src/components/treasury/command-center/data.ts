"use client";

import type {
  TreasuryHealthScore,
  ExecutiveKPI,
  CashPositionSummary,
  LiquiditySummary,
  PaymentSummary,
  BankAccountSummary,
  ForecastSummary,
  WorkingCapitalSummary,
  RiskSummary,
  RegionSummary,
  EntitySummary,
  CurrencySummary,
  InstitutionSummary,
  PerformanceMetric,
  ActivityItem,
  CommandCenterAlert,
  Recommendation,
  Insight,
  NavigationCard,
  ComingSoonModule,
} from "./types";

export const MOCK_TREASURY_HEALTH: TreasuryHealthScore = {
  overall: 96,
  liquidity: 94,
  forecastAccuracy: 88,
  paymentSuccess: 97,
  bankHealth: 92,
  compliance: 85,
  cashAvailability: 90,
  label: "Excellent",
};

export const MOCK_EXECUTIVE_KPIS: ExecutiveKPI[] = [
  { id: "kpi-1", label: "Total Cash", value: "$842.75M", numericValue: 842750000, change: 12350000, changePercent: 1.49, direction: "up", status: "healthy", icon: "DollarSign" },
  { id: "kpi-2", label: "Available Liquidity", value: "$689.32M", numericValue: 689320000, change: 9870000, changePercent: 1.45, direction: "up", status: "healthy", icon: "Droplets" },
  { id: "kpi-3", label: "Net Liquidity", value: "$612.00M", numericValue: 612000000, change: 10500000, changePercent: 1.75, direction: "up", status: "healthy", icon: "Activity" },
  { id: "kpi-4", label: "Working Capital", value: "$523.00M", numericValue: 523000000, change: 8700000, changePercent: 1.69, direction: "up", status: "healthy", icon: "Briefcase" },
  { id: "kpi-5", label: "Coverage Ratio", value: "2.4x", numericValue: 2.4, change: 0.1, changePercent: 4.35, direction: "up", status: "healthy", icon: "Shield" },
  { id: "kpi-6", label: "Days Cash Remaining", value: "245d", numericValue: 245, change: 12, changePercent: 5.15, direction: "up", status: "healthy", icon: "Calendar" },
  { id: "kpi-7", label: "Forecast Accuracy", value: "88%", numericValue: 88, change: -4, changePercent: -4.35, direction: "down", status: "warning", icon: "TrendingUp" },
  { id: "kpi-8", label: "Payment Success Rate", value: "99.2%", numericValue: 99.2, change: 0.3, changePercent: 0.3, direction: "up", status: "healthy", icon: "CheckCircle" },
  { id: "kpi-9", label: "Pending Approvals", value: "23", numericValue: 23, change: -5, changePercent: -17.86, direction: "down", status: "warning", icon: "Clock" },
  { id: "kpi-10", label: "Open Alerts", value: "8", numericValue: 8, change: 2, changePercent: 33.33, direction: "up", status: "critical", icon: "AlertTriangle" },
  { id: "kpi-11", label: "Bank Health", value: "92", numericValue: 92, change: 3, changePercent: 3.37, direction: "up", status: "healthy", icon: "Landmark" },
  { id: "kpi-12", label: "Compliance Score", value: "85", numericValue: 85, change: 5, changePercent: 6.25, direction: "up", status: "healthy", icon: "ShieldCheck" },
  { id: "kpi-13", label: "FX Exposure", value: "$184.50M", numericValue: 184500000, change: 12000000, changePercent: 6.96, direction: "up", status: "warning", icon: "Globe" },
  { id: "kpi-14", label: "Idle Cash", value: "$145.80M", numericValue: 145800000, change: 3200000, changePercent: 2.24, direction: "up", status: "warning", icon: "CircleDollarSign" },
  { id: "kpi-15", label: "Net Cash Flow Today", value: "$8.50M", numericValue: 8500000, change: 1250000, changePercent: 17.24, direction: "up", status: "healthy", icon: "ArrowUpDown" },
];

export const MOCK_CASH_POSITION: CashPositionSummary = {
  totalCash: 842750000,
  availableCash: 689320000,
  restrictedCash: 98200000,
  idleCash: 145800000,
  workingCapital: 523000000,
  changePercent: 1.49,
};

export const MOCK_LIQUIDITY_SUMMARY: LiquiditySummary = {
  liquidityScore: 94,
  fundingNeeds: 48000000,
  coverageRatio: 2.4,
  poolUtilization: 87.5,
  daysCashRemaining: 245,
};

export const MOCK_PAYMENT_SUMMARY: PaymentSummary = {
  paymentsToday: 187,
  paymentsTodayValue: 42500000,
  collectionsToday: 142,
  collectionsTodayValue: 38500000,
  pendingApprovals: 23,
  pendingApprovalsValue: 12800000,
  netCashFlow: 8500000,
};

export const MOCK_BANK_ACCOUNT_SUMMARY: BankAccountSummary = {
  activeAccounts: 48,
  totalBanks: 18,
  dormantAccounts: 12,
  complianceIssues: 3,
  totalSignatories: 95,
  mandatesExpiring: 8,
};

export const MOCK_FORECAST_SUMMARY: ForecastSummary = {
  forecastAccuracy: 88,
  forecast30Day: 889750000,
  variance: -4200000,
  variancePercent: -0.47,
  confidenceScore: 76,
  cashRunway: 245,
};

export const MOCK_WORKING_CAPITAL: WorkingCapitalSummary = {
  netWorkingCapital: 523000000,
  currentRatio: 2.4,
  dso: 42,
  dpo: 35,
  inventoryDays: 58,
};

export const MOCK_RISK_SUMMARY: RiskSummary = {
  overallScore: 78,
  fxExposure: 184500000,
  counterpartyRisk: 68,
  policyBreaches: 2,
  var1d95: 12500000,
};

export const MOCK_REGION_SUMMARIES: RegionSummary[] = [
  { name: "North America", totalCash: 380000000, availableLiquidity: 325000000, forecastHealth: "positive", healthScore: 94, entityCount: 2, currencyCount: 3, topEntity: "Perionyx Inc." },
  { name: "Europe", totalCash: 195000000, availableLiquidity: 158000000, forecastHealth: "stable", healthScore: 87, entityCount: 2, currencyCount: 4, topEntity: "Perionyx EU B.V." },
  { name: "Middle East", totalCash: 165000000, availableLiquidity: 132000000, forecastHealth: "positive", healthScore: 91, entityCount: 1, currencyCount: 2, topEntity: "Perionyx Middle East LLC" },
  { name: "Africa", totalCash: 52750000, availableLiquidity: 38320000, forecastHealth: "negative", healthScore: 62, entityCount: 1, currencyCount: 2, topEntity: "Perionyx Africa Pty Ltd." },
  { name: "Asia-Pacific", totalCash: 50000000, availableLiquidity: 36000000, forecastHealth: "stable", healthScore: 78, entityCount: 1, currencyCount: 3, topEntity: "Perionyx APAC Pte Ltd." },
  { name: "Latin America", totalCash: 25000000, availableLiquidity: 18000000, forecastHealth: "negative", healthScore: 68, entityCount: 1, currencyCount: 2, topEntity: "Perionyx LatAm S.A." },
  { name: "Oceania", totalCash: 15000000, availableLiquidity: 12000000, forecastHealth: "stable", healthScore: 72, entityCount: 1, currencyCount: 2, topEntity: "Perionyx Oceania Ltd." },
];

export const MOCK_ENTITY_SUMMARIES: EntitySummary[] = [
  { name: "Perionyx Inc.", region: "North America", totalCash: 380000000, availableLiquidity: 325000000, paymentVolume: 185000000, healthScore: 95, status: "healthy" },
  { name: "Perionyx LLC", region: "North America", totalCash: 125000000, availableLiquidity: 105000000, paymentVolume: 92000000, healthScore: 92, status: "healthy" },
  { name: "Perionyx EU B.V.", region: "Europe", totalCash: 105000000, availableLiquidity: 88000000, paymentVolume: 78000000, healthScore: 85, status: "watch" },
  { name: "Perionyx UK Ltd.", region: "Europe", totalCash: 90000000, availableLiquidity: 72000000, paymentVolume: 65000000, healthScore: 88, status: "healthy" },
  { name: "Perionyx Middle East LLC", region: "Middle East", totalCash: 165000000, availableLiquidity: 132000000, paymentVolume: 52000000, healthScore: 91, status: "healthy" },
  { name: "Perionyx Africa Pty Ltd.", region: "Africa", totalCash: 52750000, availableLiquidity: 38320000, paymentVolume: 18000000, healthScore: 62, status: "critical" },
  { name: "Perionyx APAC Pte Ltd.", region: "Asia-Pacific", totalCash: 50000000, availableLiquidity: 36000000, paymentVolume: 42000000, healthScore: 78, status: "watch" },
  { name: "Perionyx LatAm S.A.", region: "Latin America", totalCash: 25000000, availableLiquidity: 18000000, paymentVolume: 15000000, healthScore: 68, status: "critical" },
  { name: "Perionyx Oceania Ltd.", region: "Oceania", totalCash: 15000000, availableLiquidity: 12000000, paymentVolume: 8000000, healthScore: 72, status: "watch" },
];

export const MOCK_CURRENCY_SUMMARIES: CurrencySummary[] = [
  { code: "USD", exposure: 0, totalCash: 380000000, riskScore: 15, hedgePercent: 100, trend: "up" },
  { code: "AED", exposure: 120450000, totalCash: 165000000, riskScore: 72, hedgePercent: 15, trend: "up" },
  { code: "EUR", exposure: 7600000, totalCash: 95000000, riskScore: 35, hedgePercent: 45, trend: "stable" },
  { code: "GBP", exposure: 16120000, totalCash: 62000000, riskScore: 42, hedgePercent: 30, trend: "down" },
  { code: "ZAR", exposure: 49901500, totalCash: 52750000, riskScore: 85, hedgePercent: 5, trend: "down" },
  { code: "SGD", exposure: 2500000, totalCash: 18000000, riskScore: 28, hedgePercent: 60, trend: "stable" },
  { code: "BRL", exposure: 8500000, totalCash: 12000000, riskScore: 55, hedgePercent: 20, trend: "down" },
  { code: "AUD", exposure: 3200000, totalCash: 15000000, riskScore: 30, hedgePercent: 50, trend: "stable" },
];

export const MOCK_INSTITUTION_SUMMARIES: InstitutionSummary[] = [
  { name: "JP Morgan Chase", relationshipScore: 94, accountCount: 8, totalBalance: 185000000, health: "healthy", serviceLevel: "premium" },
  { name: "Citibank", relationshipScore: 91, accountCount: 6, totalBalance: 142000000, health: "healthy", serviceLevel: "premium" },
  { name: "HSBC", relationshipScore: 88, accountCount: 7, totalBalance: 128000000, health: "healthy", serviceLevel: "premium" },
  { name: "Deutsche Bank", relationshipScore: 82, accountCount: 5, totalBalance: 85000000, health: "watch", serviceLevel: "standard" },
  { name: "BNP Paribas", relationshipScore: 85, accountCount: 4, totalBalance: 72000000, health: "healthy", serviceLevel: "standard" },
  { name: "Standard Chartered", relationshipScore: 78, accountCount: 5, totalBalance: 58000000, health: "watch", serviceLevel: "standard" },
  { name: "Emirates NBD", relationshipScore: 90, accountCount: 3, totalBalance: 95000000, health: "healthy", serviceLevel: "premium" },
  { name: "FirstRand Bank", relationshipScore: 65, accountCount: 2, totalBalance: 28500000, health: "watch", serviceLevel: "basic" },
];

export const MOCK_PERFORMANCE_METRICS: PerformanceMetric[] = [
  { label: "Liquidity Coverage", current: 2.4, previous: 2.3, target: 2.5, unit: "x", direction: "up" },
  { label: "Forecast Accuracy", current: 88, previous: 92, target: 95, unit: "%", direction: "down" },
  { label: "Payment Success", current: 99.2, previous: 98.9, target: 99.5, unit: "%", direction: "up" },
  { label: "Bank Health", current: 92, previous: 89, target: 95, unit: "", direction: "up" },
  { label: "Compliance", current: 85, previous: 80, target: 90, unit: "", direction: "up" },
  { label: "Cash Availability", current: 90, previous: 88, target: 92, unit: "%", direction: "up" },
  { label: "FX Execution Cost", current: 0.18, previous: 0.22, target: 0.15, unit: "bps", direction: "down" },
  { label: "Working Capital Days", current: 38, previous: 41, target: 35, unit: "days", direction: "up" },
];

export const MOCK_ACTIVITY_ITEMS: ActivityItem[] = [
  { id: "act-1", action: "Payment batch #2847 approved", module: "Payments", entity: "Perionyx Inc.", timestamp: "2026-07-09T14:23:00Z", type: "approval" },
  { id: "act-2", action: "Intercompany transfer $18M to UAE", module: "Liquidity", entity: "Perionyx Middle East LLC", timestamp: "2026-07-09T13:45:00Z", type: "transfer" },
  { id: "act-3", action: "EUR 5M forward contract settled", module: "Risk", entity: "Perionyx EU B.V.", timestamp: "2026-07-09T12:30:00Z", type: "payment" },
  { id: "act-4", action: "Compliance report Q2 2026 filed", module: "Compliance", entity: "Perionyx Inc.", timestamp: "2026-07-09T11:15:00Z", type: "compliance" },
  { id: "act-5", action: "Credit facility drawdown $25M", module: "Treasury", entity: "Perionyx Africa Pty Ltd.", timestamp: "2026-07-09T10:00:00Z", type: "update" },
  { id: "act-6", action: "Collection of $12.5M from major client", module: "Collections", entity: "Perionyx UK Ltd.", timestamp: "2026-07-09T09:30:00Z", type: "collection" },
  { id: "act-7", action: "Africa liquidity alert triggered", module: "Liquidity", entity: "Perionyx Africa Pty Ltd.", timestamp: "2026-07-09T08:30:00Z", type: "alert" },
  { id: "act-8", action: "Bank mandate renewal required", module: "Banks", entity: "FirstRand Bank", timestamp: "2026-07-09T07:45:00Z", type: "compliance" },
  { id: "act-9", action: "FX hedge position rebalanced", module: "Risk", entity: "Perionyx Inc.", timestamp: "2026-07-09T07:00:00Z", type: "update" },
  { id: "act-10", action: "Daily cash position reconciled", module: "Treasury", entity: "Enterprise", timestamp: "2026-07-09T06:30:00Z", type: "update" },
  { id: "act-11", action: "SWIFT MT103 payment sent", module: "Payments", entity: "Supplier GmbH INV-2024", timestamp: "2026-07-08T16:30:00Z", type: "payment" },
  { id: "act-12", action: "Dividend distribution approved", module: "Treasury", entity: "Q2 Dividend Pool", timestamp: "2026-07-08T15:00:00Z", type: "approval" },
  { id: "act-13", action: "Liquidity pool rebalanced", module: "Treasury", entity: "USD Liquidity Pool", timestamp: "2026-07-08T14:00:00Z", type: "update" },
  { id: "act-14", action: "Mass payment executed", module: "Payments", entity: "AP Batch — 1,247 invoices", timestamp: "2026-07-08T12:00:00Z", type: "payment" },
  { id: "act-15", action: "Regulatory report filed", module: "Compliance", entity: "FinCEN SAR Q2", timestamp: "2026-07-08T10:30:00Z", type: "compliance" },
];

export const MOCK_ALERTS: CommandCenterAlert[] = [
  { id: "alert-1", severity: "critical", title: "Africa Liquidity Critical", message: "Perionyx Africa Pty Ltd. has 70 days cash remaining — below 90-day policy minimum", module: "Liquidity", timestamp: "2026-07-09T08:30:00Z", acknowledged: false },
  { id: "alert-2", severity: "high", title: "Compliance Breach Detected", message: "3 bank mandates expiring within 30 days — renewal required to maintain active status", module: "Banks", timestamp: "2026-07-09T07:45:00Z", acknowledged: false },
  { id: "alert-3", severity: "high", title: "Large Payment Approval Pending", message: "$12.8M in vendor payments awaiting approval — 23 items in queue", module: "Payments", timestamp: "2026-07-09T07:30:00Z", acknowledged: false },
  { id: "alert-4", severity: "medium", title: "FX Exposure Threshold Approaching", message: "AED exposure at 72% of policy limit — hedging recommended", module: "Risk", timestamp: "2026-07-09T06:15:00Z", acknowledged: true },
  { id: "alert-5", severity: "medium", title: "Forecast Accuracy Declining", message: "30-day forecast variance increased to -0.47% — review underlying assumptions", module: "Forecast", timestamp: "2026-07-09T05:00:00Z", acknowledged: false },
  { id: "alert-6", severity: "low", title: "Idle Cash Opportunity", message: "$145.8M idle across enterprise — potential $6.5M annual yield at 4.5%", module: "Treasury", timestamp: "2026-07-09T04:00:00Z", acknowledged: true },
];

export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  { id: "rec-1", title: "Expedite Africa Funding", description: "Initiate $25M intercompany loan from Perionyx Inc. to Perionyx Africa Pty Ltd. to address critical liquidity gap", priority: "critical", category: "Funding", impact: "$25M" },
  { id: "rec-2", title: "Rebalance Regional Liquidity", description: "Transfer $18M from Europe Reserve to Middle East operating pool to meet upcoming vendor obligations", priority: "high", category: "Pool Rebalance", impact: "$18M" },
  { id: "rec-3", title: "Increase Liquidity Buffer", description: "Raise enterprise liquidity buffer from 25% to 30% — coverage ratio declining in 2 regions", priority: "high", category: "Policy", impact: "$42M" },
  { id: "rec-4", title: "Deploy Idle Cash", description: "Invest $50M of idle cash in money market instruments at 4.5% yield — $2.25M annual return", priority: "medium", category: "Investment", impact: "$50M" },
  { id: "rec-5", title: "Hedge AED Exposure", description: "Implement AED hedging program — current exposure at 72% of policy limit without coverage", priority: "medium", category: "FX Risk", impact: "$120M" },
  { id: "rec-6", title: "Accelerate AR Collection", description: "Reduce DSO from 42 to 38 days in Europe — accelerate $8M in outstanding receivables", priority: "medium", category: "Working Capital", impact: "$8M" },
  { id: "rec-7", title: "Renew Bank Mandates", description: "Process 8 expiring bank mandates across 3 institutions to avoid service disruption", priority: "high", category: "Compliance", impact: "8 Mandates" },
  { id: "rec-8", title: "Review Forecast Model", description: "Update 30-day forecast assumptions after -0.47% variance — data quality review recommended", priority: "low", category: "Forecast", impact: "Accuracy" },
];

export const MOCK_INSIGHTS: Insight[] = [
  { id: "insight-1", label: "Liquidity Strength", value: "94", description: "North America maintains strongest liquidity score with 312 days coverage", severity: "positive", module: "Liquidity" },
  { id: "insight-2", label: "Funding Gap", value: "$25M", description: "Africa region has critical funding gap with only 70 days cash remaining", severity: "critical", module: "Liquidity" },
  { id: "insight-3", label: "Idle Cash", value: "$145.8M", description: "Enterprise-wide idle cash represents 17.3% of total — deployment opportunity", severity: "warning", module: "Treasury" },
  { id: "insight-4", label: "Payment Efficiency", value: "99.2%", description: "Payment success rate at 99.2% — above 99% target for third consecutive month", severity: "positive", module: "Payments" },
  { id: "insight-5", label: "FX Concentration", value: "AED 72%", description: "AED exposure at 72% of policy limit without hedge coverage — risk increasing", severity: "warning", module: "Risk" },
  { id: "insight-6", label: "Compliance Improvement", value: "+5pts", description: "Compliance score improved 5 points quarter-over-quarter — mandate renewal driving gains", severity: "positive", module: "Compliance" },
];

export const MOCK_NAVIGATION_CARDS: NavigationCard[] = [
  { id: "nav-cash", title: "Cash Position", description: "Real-time global cash visibility across entities, currencies, and institutions", route: "/treasury/cash-position", icon: "DollarSign", status: "active", metrics: [{ label: "Total Cash", value: "$842.75M" }, { label: "Available", value: "$689.32M" }] },
  { id: "nav-liquidity", title: "Liquidity Center", description: "Pool management, funding requests, intercompany, and scenario analysis", route: "/treasury/liquidity", icon: "Droplets", status: "active", metrics: [{ label: "Score", value: "94" }, { label: "Coverage", value: "2.4x" }] },
  { id: "nav-payments", title: "Payments Hub", description: "Payment lifecycle, approvals, rail optimization, and settlement tracking", route: "/treasury/payments", icon: "ArrowUpDown", status: "active", metrics: [{ label: "Today", value: "187" }, { label: "Volume", value: "$42.5M" }] },
  { id: "nav-risk", title: "Risk Management", description: "FX, counterparty, interest rate risk with hedging and policy enforcement", route: "/treasury/risk", icon: "Shield", status: "active", metrics: [{ label: "Score", value: "78" }, { label: "VaR", value: "$12.5M" }] },
  { id: "nav-ebam", title: "EBAM", description: "Electronic Bank Account Management with mandate lifecycle and compliance", route: "/treasury/bank-accounts", icon: "Landmark", status: "active", metrics: [{ label: "Accounts", value: "48" }, { label: "Banks", value: "18" }] },
  { id: "nav-forecast", title: "Cash Forecasting", description: "AI-powered cash flow forecasting with scenario modeling and variance analysis", route: "/treasury/cash-forecast", icon: "TrendingUp", status: "active", metrics: [{ label: "Accuracy", value: "88%" }, { label: "Confidence", value: "76%" }] },
];

export const MOCK_COMING_SOON_MODULES: ComingSoonModule[] = [
  { id: "cs-1", title: "AI Treasury Assistant", description: "Conversational AI for treasury operations, anomaly detection, and predictive insights", icon: "BrainCircuit", eta: "Q3 2026" },
  { id: "cs-2", title: "Real-Time Payments", description: "Instant payment rails with real-time tracking, confirmation, and reconciliation", icon: "Zap", eta: "Q3 2026" },
  { id: "cs-3", title: "Treasury Data Lake", description: "Unified analytics platform with custom dashboards, reporting, and data export", icon: "Database", eta: "Q4 2026" },
  { id: "cs-4", title: "Regulatory Reporting", description: "Automated regulatory filings, compliance monitoring, and audit trail generation", icon: "FileCheck", eta: "Q1 2027" },
  { id: "cs-5", title: "Multi-Entity Consolidation", description: "Automated consolidation of multi-entity cash positions with eliminations", icon: "Layers", eta: "Q1 2027" },
  { id: "cs-6", title: "Blockchain Settlement", description: "Distributed ledger payment settlement with smart contract enforcement", icon: "Link", eta: "Q2 2027" },
];
