import { executiveAIService } from "./services/executive-ai-service";
import type {
  ExecutiveInsight, AIRecommendation, AnomalyDetection, AIForecast,
  CrossDomainInsight, AIModelMetrics, AIKPI, AIAlert
} from "./types";

const COMPANY = "default";
const NOW = new Date("2026-07-10T12:00:00Z");

function daysAgo(n: number): Date {
  const d = new Date(NOW);
  d.setDate(d.getDate() - n);
  return d;
}

export function seedExecutiveAI(): void {
  const s = executiveAIService;
  seedInsights(s);
  seedRecommendations(s);
  seedAnomalies(s);
  seedForecasts(s);
  seedCrossDomainInsights(s);
  seedModelMetrics(s);
  seedKPIs(s);
  seedAlerts(s);
}

function seedInsights(s: typeof executiveAIService): void {
  const insights: ExecutiveInsight[] = [
    {
      id: "insight-001", title: "Revenue Growth Above Forecast", description: "Q2 revenue is tracking 12% above forecast driven by enterprise segment growth.",
      category: "revenue", severity: "low", confidence: "high", status: "new", sourceDomain: "order-to-cash",
      metrics: { revenueVariance: 12.3, growthRate: 8.7, forecastAccuracy: 87 },
      recommendations: ["Increase enterprise sales team allocation", "Review pricing strategy for sustainability"],
      tags: ["revenue", "growth", "enterprise"], detectedAt: daysAgo(1), companyId: COMPANY, createdAt: daysAgo(1), updatedAt: daysAgo(1),
    },
    {
      id: "insight-002", title: "Operating Cost Spike Detected", description: "Q2 operating costs increased 8.2% MoM driven by cloud infrastructure and contractor spend.",
      category: "cost", severity: "medium", confidence: "high", status: "new", sourceDomain: "general-ledger",
      sourceEntityType: "cost-center", sourceEntityId: "cc-ops",
      metrics: { costIncrease: 8.2, cloudSpend: 14.5, contractorSpend: 11.3 },
      recommendations: ["Audit cloud resource allocation", "Review contractor utilization"],
      tags: ["cost", "cloud", "contractors"], detectedAt: daysAgo(2), companyId: COMPANY, createdAt: daysAgo(2), updatedAt: daysAgo(2),
    },
    {
      id: "insight-003", title: "Cash Position Alert – Below Threshold", description: "Operating cash reserves dropped to $2.1M, below the $3M minimum policy threshold.",
      category: "treasury", severity: "high", confidence: "very-high", status: "acknowledged", sourceDomain: "treasury",
      sourceEntityType: "account", sourceEntityId: "acc-main-op",
      metrics: { currentCash: 2100000, threshold: 3000000, shortfall: 900000 },
      recommendations: ["Initiate intercompany cash pooling", "Draw down on credit facility", "Defer non-critical capex"],
      tags: ["cash", "liquidity", "threshold"], detectedAt: daysAgo(3), companyId: COMPANY, createdAt: daysAgo(3), updatedAt: daysAgo(2),
    },
    {
      id: "insight-004", title: "FX Exposure – EUR/USD Volatility", description: "EUR/USD moved 3.2% against forecast, impacting unhedged receivables by $450K.",
      category: "risk", severity: "high", confidence: "high", status: "new", sourceDomain: "treasury",
      metrics: { fxMove: 3.2, unhedgedExposure: 14000000, impact: 450000 },
      recommendations: ["Increase EUR hedge coverage to 80%", "Review FX hedging policy"],
      tags: ["fx", "hedging", "exposure"], detectedAt: daysAgo(1), companyId: COMPANY, createdAt: daysAgo(1), updatedAt: daysAgo(1),
    },
    {
      id: "insight-005", title: "Tax Compliance – Filing Deadline in 5 Days", description: "VAT filing deadline approaching for 12 jurisdictions with $1.8M total liability.",
      category: "compliance", severity: "medium", confidence: "very-high", status: "new", sourceDomain: "tax",
      metrics: { jurisdictionsDue: 12, totalLiability: 1800000, daysRemaining: 5 },
      recommendations: ["Prepare VAT returns for all jurisdictions", "Verify withholding tax credits", "Review transfer pricing documentation"],
      tags: ["tax", "vat", "deadline", "compliance"], detectedAt: daysAgo(5), companyId: COMPANY, createdAt: daysAgo(5), updatedAt: daysAgo(5),
    },
    {
      id: "insight-006", title: "Investment Portfolio Rebalancing Opportunity", description: "Fixed income allocation at 55% exceeds 45% target; equities underweight at 30% vs 40% target.",
      category: "investments", severity: "low", confidence: "medium", status: "new", sourceDomain: "investments",
      metrics: { fixedIncomeAllocation: 55, equityAllocation: 30, targetFixedIncome: 45, targetEquity: 40 },
      recommendations: ["Rebalance $3.2M from fixed income to equities", "Review investment policy targets"],
      tags: ["portfolio", "rebalancing", "allocation"], detectedAt: daysAgo(4), companyId: COMPANY, createdAt: daysAgo(4), updatedAt: daysAgo(4),
    },
    {
      id: "insight-007", title: "AR Aging Deterioration", description: "AR over 60 days increased to 22% of total AR, up from 15% last quarter.",
      category: "financial", severity: "medium", confidence: "high", status: "acknowledged", sourceDomain: "order-to-cash",
      sourceEntityType: "portfolio", sourceEntityId: "ar-portfolio",
      metrics: { agingPercent: 22, previousAgingPercent: 15, totalAR: 8500000, agingAR: 1870000 },
      recommendations: ["Escalate collections on accounts over 60 days", "Review credit terms for high-risk customers", "Implement automated dunning"],
      tags: ["ar", "aging", "collections", "credit"], detectedAt: daysAgo(2), companyId: COMPANY, createdAt: daysAgo(2), updatedAt: daysAgo(1),
    },
    {
      id: "insight-008", title: "Fraud Detection – Unusual Payment Pattern", description: "Multiple payments totaling $230K to new vendor with insufficient KYC documentation.",
      category: "fraud", severity: "critical", confidence: "high", status: "new", sourceDomain: "treasury",
      sourceEntityType: "vendor", sourceEntityId: "vnd-new-789",
      metrics: { suspiciousAmount: 230000, transactionCount: 7, kycScore: 35 },
      recommendations: ["Hold all payments to this vendor", "Initiate enhanced due diligence", "Review payment approval workflow"],
      tags: ["fraud", "kyc", "vendor", "payment"], detectedAt: daysAgo(0), companyId: COMPANY, createdAt: daysAgo(0), updatedAt: daysAgo(0),
    },
    {
      id: "insight-009", title: "Operational Efficiency – AP Automation Potential", description: "85% of invoices are processed manually; automation could save 120 hours/month.",
      category: "operational", severity: "low", confidence: "medium", status: "new", sourceDomain: "order-to-cash",
      metrics: { manualInvoicePercent: 85, monthlyHoursSaved: 120, estimatedSavings: 96000 },
      recommendations: ["Implement AP automation solution", "Integrate with ERP for PO matching"],
      tags: ["ap", "automation", "efficiency"], detectedAt: daysAgo(6), companyId: COMPANY, createdAt: daysAgo(6), updatedAt: daysAgo(6),
    },
    {
      id: "insight-010", title: "Anomaly Detection – Revenue Spike Non-Recurring", description: "One-time revenue spike of $3.2M in APAC region from a single large deal (non-recurring).",
      category: "anomaly", severity: "low", confidence: "very-high", status: "new", sourceDomain: "order-to-cash",
      sourceEntityType: "region", sourceEntityId: "apac",
      metrics: { spikeAmount: 3200000, recurringPercent: 5, dealSize: 3200000 },
      recommendations: ["Flag as non-recurring for forecasting", "Adjust revenue forecasts accordingly"],
      tags: ["anomaly", "revenue", "non-recurring", "apac"], detectedAt: daysAgo(1), companyId: COMPANY, createdAt: daysAgo(1), updatedAt: daysAgo(1),
    },
  ];
  for (const i of insights) s.intelligence.add(i);
}

function seedRecommendations(s: typeof executiveAIService): void {
  const recs: AIRecommendation[] = [
    {
      id: "rec-001", type: "cash-management", title: "Initiate Cash Pooling", description: "Consolidate $2.5M from 3 subsidiary accounts to meet minimum operating cash threshold.",
      category: "treasury", impact: "High – resolves cash shortfall immediately", effort: "low", roi: 250000, confidence: "high", sourceDomain: "treasury",
      actions: ["Identify accounts with surplus balances", "Execute intercompany transfers", "Update cash forecast"],
      status: "pending", companyId: COMPANY, createdAt: daysAgo(2), updatedAt: daysAgo(2),
    },
    {
      id: "rec-002", type: "hedging", title: "Increase EUR Hedge Coverage", description: "Raise EUR forward hedge from 50% to 80% of projected 90-day exposure ($14M).",
      category: "risk", impact: "Medium – reduces FX volatility impact", effort: "medium", roi: 320000, confidence: "high", sourceDomain: "treasury",
      actions: ["Execute EUR/USD forward contracts", "Document hedge rationale for audit"],
      status: "pending", companyId: COMPANY, createdAt: daysAgo(1), updatedAt: daysAgo(1),
    },
    {
      id: "rec-003", type: "process-automation", title: "Implement AP Automation", description: "Deploy invoice processing automation to reduce manual workload by 85%.",
      category: "operational", impact: "Medium – 120 hrs/month savings", effort: "medium", roi: 96000, confidence: "medium", sourceDomain: "order-to-cash",
      actions: ["Select AP automation vendor", "Integrate with ERP", "Migrate existing vendor master"],
      status: "pending", companyId: COMPANY, createdAt: daysAgo(6), updatedAt: daysAgo(6),
    },
    {
      id: "rec-004", type: "collections", title: "Escalate AR Collections", description: "Initiate escalated collections for $1.87M in AR over 60 days past due.",
      category: "financial", impact: "High – improves cash flow and reduces DSO", effort: "medium", roi: 1870000, confidence: "high", sourceDomain: "order-to-cash",
      actions: ["Send final demand letters", "Call top 10 overdue accounts", "Place accounts on hold"],
      status: "pending", companyId: COMPANY, createdAt: daysAgo(2), updatedAt: daysAgo(2),
    },
    {
      id: "rec-005", type: "portfolio-rebalance", title: "Rebalance Investment Portfolio", description: "Shift $3.2M from fixed income to equities to align with 40/40/20 target allocation.",
      category: "investments", impact: "Medium – improves long-term returns", effort: "low", roi: 480000, confidence: "medium", sourceDomain: "investments",
      actions: ["Execute equity index purchases", "Sell fixed income positions", "Update compliance monitoring"],
      status: "pending", companyId: COMPANY, createdAt: daysAgo(4), updatedAt: daysAgo(4),
    },
    {
      id: "rec-006", type: "tax-compliance", title: "Prepare VAT Returns for 12 Jurisdictions", description: "VAT filing deadline in 5 days across 12 jurisdictions with $1.8M total liability.",
      category: "compliance", impact: "High – avoids penalties and interest", effort: "high", roi: 90000, confidence: "very-high", sourceDomain: "tax",
      actions: ["Draft VAT returns per jurisdiction", "Review input VAT credits", "Submit before deadline"],
      status: "pending", companyId: COMPANY, createdAt: daysAgo(5), updatedAt: daysAgo(5),
    },
    {
      id: "rec-007", type: "risk-mitigation", title: "Perform KYC Enhanced Due Diligence", description: "Complete enhanced due diligence on new vendor with insufficient KYC before releasing payments.",
      category: "fraud", impact: "Critical – prevents potential fraud loss", effort: "medium", roi: 230000, confidence: "high", sourceDomain: "treasury",
      actions: ["Request business registration documents", "Verify beneficial owners", "Check sanctions lists"],
      status: "pending", companyId: COMPANY, createdAt: daysAgo(0), updatedAt: daysAgo(0),
    },
    {
      id: "rec-008", type: "cost-optimization", title: "Audit Cloud Infrastructure Costs", description: "Cloud spend increased 14.5% MoM. Audit resource allocation and rightsizing opportunities.",
      category: "cost", impact: "Medium – potential $12K/month savings", effort: "low", roi: 144000, confidence: "medium", sourceDomain: "general-ledger",
      actions: ["Review cloud resource utilization", "Identify idle resources", "Implement auto-scaling policies"],
      status: "pending", companyId: COMPANY, createdAt: daysAgo(2), updatedAt: daysAgo(2),
    },
  ];
  for (const r of recs) s.recommendations.add(r);
}

function seedAnomalies(s: typeof executiveAIService): void {
  const anomalies: AnomalyDetection[] = [
    {
      id: "anom-001", entityType: "account", entityId: "acc-main-op", metric: "cash-balance",
      expectedValue: 3500000, actualValue: 2100000, variance: -1400000, variancePercent: -40,
      severity: "critical", category: "treasury", description: "Operating cash balance dropped 40% below expected level of $3.5M.",
      detectedAt: daysAgo(3), acknowledged: false, companyId: COMPANY, createdAt: daysAgo(3), updatedAt: daysAgo(3),
    },
    {
      id: "anom-002", entityType: "region", entityId: "apac", metric: "revenue",
      expectedValue: 5500000, actualValue: 8700000, variance: 3200000, variancePercent: 58.2,
      severity: "medium", category: "anomaly", description: "APAC revenue 58% above forecast due to one-time large deal.",
      detectedAt: daysAgo(1), acknowledged: true, companyId: COMPANY, createdAt: daysAgo(1), updatedAt: daysAgo(1),
    },
    {
      id: "anom-003", entityType: "cost-center", entityId: "cc-ops", metric: "operating-expense",
      expectedValue: 1100000, actualValue: 1190000, variance: 90000, variancePercent: 8.2,
      severity: "medium", category: "cost", description: "Operating expenses 8.2% above budget driven by cloud infrastructure.",
      detectedAt: daysAgo(2), acknowledged: false, companyId: COMPANY, createdAt: daysAgo(2), updatedAt: daysAgo(2),
    },
    {
      id: "anom-004", entityType: "jurisdiction", entityId: "eur-vat", metric: "compliance-score",
      expectedValue: 95, actualValue: 72, variance: -23, variancePercent: -24.2,
      severity: "high", category: "compliance", description: "EU VAT compliance score dropped 23 points to 72% – filing gaps detected.",
      detectedAt: daysAgo(4), acknowledged: false, companyId: COMPANY, createdAt: daysAgo(4), updatedAt: daysAgo(4),
    },
    {
      id: "anom-005", entityType: "portfolio", entityId: "fx-hedge", metric: "hedge-effectiveness",
      expectedValue: 95, actualValue: 60, variance: -35, variancePercent: -36.8,
      severity: "critical", category: "risk", description: "FX hedge effectiveness dropped to 60% due to EUR/USD volatility and unhedged positions.",
      detectedAt: daysAgo(1), acknowledged: false, companyId: COMPANY, createdAt: daysAgo(1), updatedAt: daysAgo(1),
    },
  ];
  for (const a of anomalies) s.anomalies.add(a);
}

function seedForecasts(s: typeof executiveAIService): void {
  const forecasts: AIForecast[] = [
    {
      id: "forecast-001", domain: "treasury", metric: "cash-balance", horizon: "30-days",
      historicalValues: [3500000, 3200000, 2800000, 2500000, 2100000, 2300000, 2450000, 2600000],
      forecastValues: [2750000, 2900000, 3100000, 3300000, 3500000, 3700000, 3850000, 4000000],
      lowerBound: [2450000, 2550000, 2700000, 2850000, 3000000, 3150000, 3300000, 3450000],
      upperBound: [3050000, 3250000, 3500000, 3750000, 4000000, 4250000, 4400000, 4550000],
      confidence: "high", trend: "increasing", keyDrivers: ["AR collections improvement", "Cost reduction initiatives", "Cash pooling"],
      companyId: COMPANY, createdAt: daysAgo(1), updatedAt: daysAgo(1),
    },
    {
      id: "forecast-002", domain: "order-to-cash", metric: "revenue", horizon: "quarter",
      historicalValues: [11200000, 11800000, 12400000, 13100000, 13800000, 14200000, 14800000, 15500000],
      forecastValues: [16000000, 16500000, 17000000, 17500000, 18000000, 18200000, 18500000, 18800000],
      lowerBound: [14800000, 15200000, 15600000, 16000000, 16400000, 16600000, 16800000, 17000000],
      upperBound: [17200000, 17800000, 18400000, 19000000, 19600000, 19800000, 20200000, 20600000],
      confidence: "medium", seasonality: "quarterly", trend: "increasing", seasonalityDescription: "Q4 seasonal uplift driven by year-end enterprise deals",
      keyDrivers: ["Enterprise pipeline growth", "New product launches", "Expansion in APAC"],
      companyId: COMPANY, createdAt: daysAgo(1), updatedAt: daysAgo(1),
    },
    {
      id: "forecast-003", domain: "general-ledger", metric: "operating-expense", horizon: "30-days",
      historicalValues: [1050000, 1080000, 1100000, 1120000, 1150000, 1170000, 1190000, 1200000],
      forecastValues: [1210000, 1220000, 1230000, 1235000, 1240000, 1245000, 1250000, 1255000],
      lowerBound: [1170000, 1175000, 1180000, 1185000, 1190000, 1195000, 1200000, 1205000],
      upperBound: [1250000, 1265000, 1280000, 1285000, 1290000, 1295000, 1300000, 1305000],
      confidence: "high", trend: "increasing", keyDrivers: ["Cloud infrastructure growth", "Headcount increase", "Inflation adjustment"],
      companyId: COMPANY, createdAt: daysAgo(1), updatedAt: daysAgo(1),
    },
    {
      id: "forecast-004", domain: "risk", metric: "risk-score", horizon: "90-days",
      historicalValues: [35, 38, 42, 40, 45, 48, 50, 52],
      forecastValues: [53, 54, 55, 53, 52, 50, 48, 45],
      lowerBound: [48, 48, 49, 47, 46, 44, 42, 39],
      upperBound: [58, 60, 61, 59, 58, 56, 54, 51],
      confidence: "medium", trend: "decreasing", keyDrivers: ["Hedging program improvement", "Compliance remediation", "Credit risk mitigation"],
      companyId: COMPANY, createdAt: daysAgo(1), updatedAt: daysAgo(1),
    },
  ];
  for (const f of forecasts) s.forecasts.add(f);
}

function seedCrossDomainInsights(s: typeof executiveAIService): void {
  const insights: CrossDomainInsight[] = [
    {
      id: "xdi-001", title: "Cash Decline Linked to AR Deterioration", description: "Cash position decline correlates with AR aging increase (r=0.87). Collections improvement could restore liquidity.",
      domains: ["treasury", "order-to-cash"], correlation: "Strong positive correlation (r=0.87)",
      significance: "High – $900K cash shortfall linked to $1.87M overdue AR",
      affectedMetrics: { cashBalance: 2100000, agingAR: 1870000, dso: 52 },
      companyId: COMPANY, createdAt: daysAgo(1), updatedAt: daysAgo(1),
    },
    {
      id: "xdi-002", title: "FX Losses Impacting Investment Returns", description: "Unhedged EUR exposure eroded 2.3% of investment portfolio returns this quarter.",
      domains: ["treasury", "investments"], correlation: "Direct causation – FX loss matches unhedged exposure",
      significance: "Medium – $320K FX loss vs $480K portfolio rebalancing opportunity",
      affectedMetrics: { fxLoss: 320000, portfolioReturn: -2.3, unhedgedExposure: 14000000 },
      companyId: COMPANY, createdAt: daysAgo(1), updatedAt: daysAgo(1),
    },
    {
      id: "xdi-003", title: "Cost Increase Correlated with Revenue Growth", description: "Operating cost increase of 8.2% coincides with revenue growth of 12% – partially justified but efficiency ratio declining.",
      domains: ["general-ledger", "order-to-cash"], correlation: "Moderate positive correlation (r=0.65)",
      significance: "Medium – efficiency ratio declining from 0.72 to 0.78 warrants monitoring",
      affectedMetrics: { costIncrease: 8.2, revenueGrowth: 12.3, efficiencyRatio: 0.78 },
      companyId: COMPANY, createdAt: daysAgo(1), updatedAt: daysAgo(1),
    },
  ];
  for (const i of insights) s.reasoning.addCrossDomainInsight(i);
}

function seedModelMetrics(s: typeof executiveAIService): void {
  const models: AIModelMetrics[] = [
    {
      modelType: "anomaly-detection", name: "anomaly-detector-v2", version: "2.3.0",
      accuracy: 94.2, precision: 91.5, recall: 89.8, f1Score: 90.6, latency: 145,
      lastTrained: daysAgo(15), trainingDataSize: 250000, status: "active",
      companyId: COMPANY, createdAt: daysAgo(30), updatedAt: daysAgo(15),
    },
    {
      modelType: "forecasting", name: "forecast-engine-v3", version: "3.1.0",
      accuracy: 87.5, precision: 85.2, recall: 83.9, f1Score: 84.5, latency: 220,
      lastTrained: daysAgo(7), trainingDataSize: 500000, status: "active",
      companyId: COMPANY, createdAt: daysAgo(60), updatedAt: daysAgo(7),
    },
    {
      modelType: "recommendation", name: "rec-engine-v1", version: "1.0.0",
      accuracy: 82.1, precision: 79.8, recall: 76.5, f1Score: 78.1, latency: 180,
      lastTrained: daysAgo(30), trainingDataSize: 100000, status: "active",
      companyId: COMPANY, createdAt: daysAgo(30), updatedAt: daysAgo(30),
    },
  ];
  for (const m of models) s.modelMetrics.add(m);
}

function seedKPIs(s: typeof executiveAIService): void {
  const kpis: AIKPI[] = [
    { name: "Insight Detection Rate", value: 142, previousValue: 128, target: 150, unit: "insights/month", category: "performance", trend: "up", status: "good" },
    { name: "Anomaly Response Time", value: 4.2, previousValue: 6.8, target: 2.0, unit: "hours", category: "operational", trend: "down", status: "warning" },
    { name: "Model Accuracy (Avg)", value: 87.9, previousValue: 85.3, target: 92.0, unit: "%", category: "quality", trend: "up", status: "good" },
    { name: "Recommendation Adoption", value: 34, previousValue: 28, target: 60, unit: "%", category: "impact", trend: "up", status: "warning" },
    { name: "Forecast Accuracy", value: 83.5, previousValue: 81.2, target: 90.0, unit: "%", category: "quality", trend: "up", status: "warning" },
  ];
  for (const k of kpis) s.analytics.addKPI(k);
}

function seedAlerts(s: typeof executiveAIService): void {
  const alerts: AIAlert[] = [
    {
      id: "alert-001", severity: "critical", type: "cash-shortfall", title: "Cash Below Minimum Threshold",
      message: "Operating cash balance of $2.1M is 30% below the $3M minimum policy threshold. Immediate action required to avoid liquidity shortfall.",
      actionRequired: true, dismissed: false, companyId: COMPANY, createdAt: daysAgo(1),
    },
    {
      id: "alert-002", severity: "critical", type: "fraud-suspicion", title: "Suspicious Payment Pattern Detected",
      message: "7 payments totaling $230K to a new vendor with insufficient KYC documentation. Payments flagged for review.",
      actionRequired: true, dismissed: false, companyId: COMPANY, createdAt: daysAgo(0),
    },
    {
      id: "alert-003", severity: "warning", type: "compliance-deadline", title: "VAT Filing Deadline Approaching",
      message: "12 VAT filings due in 5 days across EU jurisdictions. Total liability estimated at $1.8M.",
      actionRequired: true, dismissed: false, companyId: COMPANY, createdAt: daysAgo(1),
    },
    {
      id: "alert-004", severity: "warning", type: "fx-risk", title: "EUR/USD Volatility Impact",
      message: "Unhedged EUR exposure of $14M at risk due to 3.2% FX movement. Estimated impact: $450K.",
      actionRequired: false, dismissed: false, companyId: COMPANY, createdAt: daysAgo(1),
    },
    {
      id: "alert-005", severity: "info", type: "model-update", title: "AI Model Retrained",
      message: "Anomaly detection model v2.3.0 retrained with 250K data points. Accuracy improved to 94.2%.",
      actionRequired: false, dismissed: false, companyId: COMPANY, createdAt: daysAgo(1),
    },
  ];
  for (const a of alerts) s.analytics.addAlert(a);
}
