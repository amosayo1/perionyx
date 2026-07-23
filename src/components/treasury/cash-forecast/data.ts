import type {
  CashForecast,
  ForecastScenario,
  StressTestResult,
  VarianceRecord,
  FundingProjection,
  LiquidityProjection,
  ForecastAssumption,
  ForecastAlert,
  ForecastRecommendation,
  ExecutiveInsight,
  ForecastMetrics,
  TrendPoint,
  AnalyticsSeries,
  ScenarioComparison,
  SensitivityResult,
  DashboardFilters,
} from "./types";

const rand = (min: number, max: number): number =>
  Math.round((Math.random() * (max - min) + min) * 100) / 100;

const pick = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const fmtDate = (d: Date): string => d.toISOString().slice(0, 7);

const ENTITIES = [
  "Perionyx Global Ltd",
  "Perionyx US Corp",
  "Perionyx Europe BV",
  "Perionyx UK plc",
  "Perionyx ME FZCO",
  "Perionyx Africa (Pty) Ltd",
  "Perionyx APAC Pte Ltd",
  "Perionyx LATAM SA",
  "Perionyx Oceania Pty Ltd",
  "Perionyx Canada Inc",
  "Perionyx India Pvt Ltd",
  "Perionyx China Ltd",
] as const;

const REGIONS = [
  "North America",
  "Europe",
  "Middle East",
  "Africa",
  "Asia-Pacific",
  "Latin America",
  "Oceania",
  "Canada",
] as const;

const CURRENCIES = [
  "USD", "EUR", "GBP", "AED", "ZAR", "SGD", "BRL", "CAD",
  "INR", "CNY", "AUD", "JPY", "CHF", "HKD", "NZD",
] as const;

const SCENARIO_TYPES = [
  "base", "optimistic", "pessimistic", "expansion", "recession",
  "acquisition", "capital_raise", "fx_shock", "interest_shock",
  "supply_chain", "customer_default", "pandemic", "custom",
] as const;

const STRESS_TYPES = [
  "revenue_decline", "expense_increase", "delayed_collections",
  "bank_failure", "currency_crash", "interest_increase",
  "credit_event", "supply_disruption", "payroll_shock", "black_swan",
] as const;

const STATUSES = ["draft", "approved", "locked", "superseded"] as const;

const OWNERS = [
  "Sarah Chen", "Mike Johnson", "Anna Kowalski", "Carlos Rivera", "Emily Watson",
] as const;

const CASH_CATEGORIES = ["operating", "investing", "financing", "fx", "tax"] as const;

const VARIANCE_STATUSES = ["open", "investigating", "explained", "resolved"] as const;

const VARIANCE_REASONS = [
  "Revenue shortfall",
  "FX movement",
  "Timing difference",
  "Expense overrun",
  "Unexpected tax liability",
  "Customer prepayment",
  "Vendor discount realized",
  "Intercompany settlement delay",
  "Dividend declaration",
  "M&A related costs",
  "Working capital improvement",
  "Regulatory fine",
  "Insurance recovery",
  "Asset sale proceeds",
  "Debt refinancing gain",
] as const;

const FUNDING_SOURCES = [
  "Revolving credit facility",
  "Term loan A",
  "Term loan B",
  "Commercial paper",
  "Corporate bonds",
  "Share issuance",
  "Asset-backed lending",
  "Export credit agency",
  "Development bank",
  "Intercompany loan",
] as const;

const FUNDING_PRIORITIES = ["critical", "high", "medium", "low"] as const;

const FUNDING_STATUSES = ["projected", "committed", "secured", "overdue"] as const;

const RECOMMENDATION_TITLES = [
  "Increase revolver commitment",
  "Extend debt maturity profile",
  "Implement notional pooling",
  "Reduce excess cash in low-yield accounts",
  "Hedge remaining EUR exposure",
  "Negotiate extended payment terms",
  "Optimize inventory levels",
  "Consolidate banking relationships",
  "Implement in-house bank structure",
  "Reduce intercompany settlement lag",
] as const;

const RECOMMENDATION_CATEGORIES = [
  "liquidity_optimization",
  "funding_strategy",
  "fx_hedging",
  "debt_management",
  "working_capital",
  "investment",
  "risk_mitigation",
  "process_improvement",
] as const;

const ALERT_CATEGORIES = [
  "liquidity", "funding", "fx", "compliance", "treasury", "forecast", "variance", "scenario",
] as const;

const ALERT_SEVERITIES = ["info", "warning", "critical", "emergency"] as const;

const ASSUMPTION_CATEGORIES = [
  "revenue_growth", "expense_growth", "fx_rates", "inflation", "interest_rates",
  "tax", "working_capital", "collection_days", "payment_days", "capex", "hiring", "seasonality",
] as const;

const ASSUMPTION_NAMES = [
  "Revenue Growth Rate", "OPEX Growth", "EUR/USD Rate", "CPI Inflation",
  "SOFR Rate", "Effective Tax Rate", "DSO Target", "DPO Target",
  "CapEx Budget", "FTE Growth", "Seasonal Multiplier", "VAT Recovery Rate",
  "Wage Inflation", "Energy Costs", "Raw Material Index",
  "Freight Cost Index", "Cloud Infrastructure", "R&D Capitalization",
  "Bad Debt Provision", "Inventory Turns",
] as const;

const SENSITIVITY_VARS = [
  "Revenue Growth", "COGS %", "EUR/USD", "GBP/USD", "Interest Rate",
  "DSO", "DPO", "Inventory Days", "Tax Rate", "CapEx", "Wage Growth", "Raw Material Cost",
] as const;

const INSIGHT_LABELS = [
  "Cash Position", "Liquidity Coverage", "Funding Status", "FX Exposure",
  "Forecast Accuracy", "Working Capital", "Debt Headroom", "Investment Yield",
  "Concentration Risk", "Covenant Compliance", "Cross-Border Flow",
  "Payment Discipline", "Collections Velocity", "Capital Efficiency",
  "Risk Appetite Utilization", "Scenario Coverage", "Stress Resilience",
  "Counterparty Health", "Regulatory Compliance", "Operational Efficiency",
] as const;

const ALERT_TITLES = [
  "Liquidity ratio breaching threshold",
  "Funding gap widening",
  "FX volatility spike detected",
  "Covenant headroom narrowing",
  "Cash runway below policy",
  "Forecast confidence dropping",
  "Variance exceeding tolerance",
  "Concentration risk increasing",
  "Counterparty limit approaching",
  "Intercompany imbalance growing",
] as const;

const ENTITY_REGION_MAP: Record<string, string> = {
  "Perionyx Global Ltd": "North America",
  "Perionyx US Corp": "North America",
  "Perionyx Europe BV": "Europe",
  "Perionyx UK plc": "Europe",
  "Perionyx ME FZCO": "Middle East",
  "Perionyx Africa (Pty) Ltd": "Africa",
  "Perionyx APAC Pte Ltd": "Asia-Pacific",
  "Perionyx LATAM SA": "Latin America",
  "Perionyx Oceania Pty Ltd": "Oceania",
  "Perionyx Canada Inc": "Canada",
  "Perionyx India Pvt Ltd": "Asia-Pacific",
  "Perionyx China Ltd": "Asia-Pacific",
};

const generateMonthlyPeriods = (): string[] => {
  const periods: string[] = [];
  for (let y = 2023; y <= 2026; y++)
    for (let m = 1; m <= 12; m++)
      periods.push(`${y}-${String(m).padStart(2, "0")}`);
  return periods;
};

const generateWeeklyPeriods = (): string[] => {
  const periods: string[] = [];
  const start = new Date("2025-06-01");
  for (let w = 0; w < 52; w++) {
    const d = new Date(start);
    d.setDate(d.getDate() + w * 7);
    periods.push(d.toISOString().slice(0, 10));
  }
  return periods;
};

const MONTHLY = generateMonthlyPeriods();
const WEEKLY = generateWeeklyPeriods();

export const MOCK_ENTITIES = [...ENTITIES];
export const MOCK_REGIONS = [...REGIONS];
export const MOCK_CURRENCIES = [...CURRENCIES];

export const MOCK_FORECASTS: CashForecast[] = (() => {
  const results: CashForecast[] = [];
  let idCounter = 1;
  const pushMonthly = () => {
    for (const period of MONTHLY) {
      for (const entity of ENTITIES) {
        const openingCash = rand(100_000_000, 900_000_000);
        const inflows = rand(50_000_000, 250_000_000);
        const outflows = rand(40_000_000, 200_000_000);
        const operatingCash = rand(-30_000_000, 80_000_000);
        const investingCash = rand(-50_000_000, 20_000_000);
        const financingCash = rand(-25_000_000, 60_000_000);
        const fxImpact = rand(-8_000_000, 8_000_000);
        const taxes = rand(5_000_000, 35_000_000);
        const endingCash =
          openingCash + inflows - outflows +
          operatingCash + investingCash + financingCash +
          fxImpact - taxes;
        const varPct = rand(-5, 5);
        results.push({
          id: `fc-monthly-${idCounter++}`,
          entity,
          region: ENTITY_REGION_MAP[entity],
          currency: pick(CURRENCIES),
          period,
          horizon: "monthly",
          openingCash: Math.round(openingCash * 100) / 100,
          inflows: Math.round(inflows * 100) / 100,
          outflows: Math.round(outflows * 100) / 100,
          operatingCash: Math.round(operatingCash * 100) / 100,
          investingCash: Math.round(investingCash * 100) / 100,
          financingCash: Math.round(financingCash * 100) / 100,
          fxImpact: Math.round(fxImpact * 100) / 100,
          taxes: Math.round(taxes * 100) / 100,
          endingCash: Math.round(endingCash * 100) / 100,
          variance: Math.round((endingCash * varPct) / 100),
          variancePercent: varPct,
          confidence: Math.round(rand(60, 98)),
          status: pick(STATUSES),
          owner: pick(OWNERS),
          approvals: [pick(OWNERS), pick(OWNERS)],
          notes: "",
        });
      }
    }
  };
  const pushWeekly = () => {
    for (const period of WEEKLY) {
      for (let e = 0; e < 6; e++) {
        const entity = ENTITIES[e];
        const openingCash = rand(100_000_000, 900_000_000);
        const inflows = rand(10_000_000, 60_000_000);
        const outflows = rand(8_000_000, 50_000_000);
        const operatingCash = rand(-5_000_000, 20_000_000);
        const investingCash = rand(-10_000_000, 5_000_000);
        const financingCash = rand(-6_000_000, 15_000_000);
        const fxImpact = rand(-2_000_000, 2_000_000);
        const taxes = rand(1_000_000, 8_000_000);
        const endingCash =
          openingCash + inflows - outflows +
          operatingCash + investingCash + financingCash +
          fxImpact - taxes;
        const varPct = rand(-5, 5);
        results.push({
          id: `fc-weekly-${idCounter++}`,
          entity,
          region: ENTITY_REGION_MAP[entity],
          currency: pick(CURRENCIES),
          period,
          horizon: "weekly",
          openingCash: Math.round(openingCash * 100) / 100,
          inflows: Math.round(inflows * 100) / 100,
          outflows: Math.round(outflows * 100) / 100,
          operatingCash: Math.round(operatingCash * 100) / 100,
          investingCash: Math.round(investingCash * 100) / 100,
          financingCash: Math.round(financingCash * 100) / 100,
          fxImpact: Math.round(fxImpact * 100) / 100,
          taxes: Math.round(taxes * 100) / 100,
          endingCash: Math.round(endingCash * 100) / 100,
          variance: Math.round((endingCash * varPct) / 100),
          variancePercent: varPct,
          confidence: Math.round(rand(60, 98)),
          status: pick(STATUSES),
          owner: pick(OWNERS),
          approvals: [pick(OWNERS), pick(OWNERS)],
          notes: "",
        });
      }
    }
  };
  pushMonthly();
  pushWeekly();
  return results;
})();

export const MOCK_SCENARIOS: ForecastScenario[] = (() => {
  const results: ForecastScenario[] = [];
  for (let i = 0; i < 200; i++) {
    const sType = pick(SCENARIO_TYPES);
    const entity = pick(ENTITIES);
    const impact = rand(-500_000_000, 800_000_000);
    const upside = impact > 0 ? impact : rand(0, 200_000_000);
    const downside = impact < 0 ? Math.abs(impact) : rand(0, 300_000_000);
    const projectedCash = rand(200_000_000, 1_500_000_000);
    results.push({
      id: `scenario-${i + 1}`,
      name: `${sType.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())} ${fmtDate(new Date(2025, i % 12, 1))}`,
      type: sType,
      description: `Scenario modeling ${sType.replace(/_/g, " ")} conditions for ${entity}`,
      entity,
      currency: pick(CURRENCIES),
      probability: Math.round(rand(5, 95)) / 100,
      impact: Math.round(impact),
      upside: Math.round(upside),
      downside: Math.round(downside),
      projectedCash: Math.round(projectedCash),
      liquidityScore: Math.round(rand(30, 100)),
      fundingGap: Math.round(rand(0, 150_000_000)),
      cashRunway: Math.round(rand(90, 720)),
      risk: pick(["low", "medium", "high", "critical"]) as ForecastScenario["risk"],
      assumptions: [
        `${pick(ASSUMPTION_NAMES)}: ${rand(-20, 20).toFixed(1)}%`,
        `${pick(ASSUMPTION_NAMES)}: ${rand(-10, 10).toFixed(1)}%`,
        `${pick(ASSUMPTION_NAMES)}: ${rand(-15, 15).toFixed(1)}%`,
      ],
      factors: [
        `Market ${pick(["expansion", "contraction", "stability"])}`,
        `Regulatory ${pick(["tightening", "easing", "unchanged"])}`,
        `Competitive ${pick(["pressure", "advantage", "neutral"])}`,
      ],
      createdBy: pick(OWNERS),
      createdAt: fmtDate(new Date(2025, i % 12, 1)),
    });
  }
  return results;
})();

export const MOCK_STRESS_TESTS: StressTestResult[] = (() => {
  const results: StressTestResult[] = [];
  for (let i = 0; i < 120; i++) {
    const stType = pick(STRESS_TYPES);
    const severity = pick(["low", "medium", "high", "critical"]) as StressTestResult["severity"];
    const impact = -rand(5_000_000, 500_000_000);
    const liquidityAfter = rand(50_000_000, 800_000_000);
    const survival = Math.round(rand(1, 24));
    results.push({
      id: `stress-${i + 1}`,
      name: `${stType.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())} Shock`,
      type: stType,
      severity,
      impact: Math.round(impact),
      impactPercent: -rand(1, 40),
      liquidityAfter: Math.round(liquidityAfter),
      survivalMonths: survival,
      fundingGap: Math.round(rand(0, 250_000_000)),
      recoveryTime: `${Math.round(rand(1, 18))} months`,
      affectedEntities: [pick(ENTITIES), pick(ENTITIES), pick(ENTITIES)],
      affectedCurrencies: [pick(CURRENCIES), pick(CURRENCIES)],
      triggeredBy: pick(OWNERS),
      probability: Math.round(rand(1, 60)) / 100,
    });
  }
  return results;
})();

export const MOCK_VARIANCES: VarianceRecord[] = (() => {
  const results: VarianceRecord[] = [];
  for (let i = 0; i < 260; i++) {
    const entity = pick(ENTITIES);
    const forecasted = rand(10_000_000, 200_000_000);
    const varPct = rand(-15, 15);
    const actual = forecasted * (1 + varPct / 100);
    results.push({
      id: `var-${i + 1}`,
      period: pick(MONTHLY),
      entity,
      currency: pick(CURRENCIES),
      forecastType: pick(["revenue", "expense", "cash_flow", "balance_sheet"]),
      category: pick(CASH_CATEGORIES),
      forecasted: Math.round(forecasted),
      actual: Math.round(actual),
      variance: Math.round(actual - forecasted),
      variancePercent: Math.round(varPct * 100) / 100,
      reason: pick(VARIANCE_REASONS),
      owner: pick(OWNERS),
      status: pick(VARIANCE_STATUSES),
    });
  }
  return results;
})();

export const MOCK_FUNDING: FundingProjection[] = (() => {
  const results: FundingProjection[] = [];
  for (let i = 0; i < 140; i++) {
    const fundingRequired = rand(10_000_000, 500_000_000);
    const fundingAvailable = rand(0, fundingRequired * 1.2);
    const gap = fundingRequired - fundingAvailable;
    const gapPercent = (gap / fundingRequired) * 100;
    const maturityMonth = 40 + (i % 24);
    const maturityYear = 2026 + Math.floor(maturityMonth / 12);
    const maturityM = (maturityMonth % 12) + 1;
    results.push({
      id: `funding-${i + 1}`,
      period: fmtDate(new Date(2026, i % 12, 1)),
      entity: pick(ENTITIES),
      currency: pick(CURRENCIES),
      fundingRequired: Math.round(fundingRequired),
      fundingAvailable: Math.round(fundingAvailable),
      fundingGap: Math.round(Math.max(0, gap)),
      gapPercent: Math.round(gapPercent * 100) / 100,
      source: pick(FUNDING_SOURCES),
      priority: pick(FUNDING_PRIORITIES),
      maturityDate: `${maturityYear}-${String(maturityM).padStart(2, "0")}-15`,
      status: pick(FUNDING_STATUSES),
    });
  }
  return results;
})();

export const MOCK_LIQUIDITY: LiquidityProjection[] = (() => {
  const results: LiquidityProjection[] = [];
  for (let i = 0; i < 100; i++) {
    const projectedLiquidity = rand(50_000_000, 1_200_000_000);
    const minimumLiquidity = rand(30_000_000, 200_000_000);
    const buffer = projectedLiquidity - minimumLiquidity;
    const ratio = projectedLiquidity / minimumLiquidity;
    const coverageDays = Math.round(ratio * 30);
    results.push({
      id: `liq-${i + 1}`,
      period: fmtDate(new Date(2025, i % 12, 1)),
      entity: pick(ENTITIES),
      currency: pick(CURRENCIES),
      projectedLiquidity: Math.round(projectedLiquidity),
      minimumLiquidity: Math.round(minimumLiquidity),
      liquidityBuffer: Math.round(buffer),
      availableCash: Math.round(rand(20_000_000, 500_000_000)),
      restrictedCash: Math.round(rand(5_000_000, 100_000_000)),
      liquidityRatio: Math.round(ratio * 100) / 100,
      coverageDays,
      status: ratio >= 2 ? "healthy" : ratio >= 1 ? "warning" : "critical",
    });
  }
  return results;
})();

export const MOCK_ASSUMPTIONS: ForecastAssumption[] = (() => {
  const results: ForecastAssumption[] = [];
  for (let i = 0; i < 80; i++) {
    const cat = pick(ASSUMPTION_CATEGORIES);
    const currentValue = rand(0.5, 25);
    const previousValue = rand(0.5, 25);
    const chg = currentValue - previousValue;
    results.push({
      id: `assumption-${i + 1}`,
      category: cat,
      name: pick(ASSUMPTION_NAMES),
      currentValue: Math.round(currentValue * 100) / 100,
      previousValue: Math.round(previousValue * 100) / 100,
      change: Math.round(chg * 100) / 100,
      changePercent:
        previousValue !== 0
          ? Math.round((chg / previousValue) * 10000) / 100
          : 0,
      trend: chg > 0.5 ? "up" : chg < -0.5 ? "down" : "stable",
      confidence: Math.round(rand(50, 95)),
      source: pick(["Bloomberg", "Reuters", "Internal", "Central Bank", "Treasury Desk"]),
      lastUpdated: fmtDate(new Date(2025, i % 12, 1)),
      sensitivity: pick(["low", "medium", "high"]) as ForecastAssumption["sensitivity"],
    });
  }
  return results;
})();

export const MOCK_RECOMMENDATIONS: ForecastRecommendation[] = (() => {
  const results: ForecastRecommendation[] = [];
  for (let i = 0; i < 50; i++) {
    const impact = rand(500_000, 50_000_000);
    results.push({
      id: `rec-${i + 1}`,
      title: pick(RECOMMENDATION_TITLES),
      description: `Recommendation to optimize ${pick(RECOMMENDATION_CATEGORIES).replace(/_/g, " ")} across ${pick(ENTITIES)}`,
      impact: Math.round(impact),
      impactLabel: `$${(impact / 1_000_000).toFixed(1)}M`,
      priority: pick(FUNDING_PRIORITIES),
      category: pick(RECOMMENDATION_CATEGORIES),
      entity: pick(ENTITIES),
      roi: `${rand(5, 200).toFixed(0)}%`,
    });
  }
  return results;
})();

export const MOCK_ALERTS: ForecastAlert[] = (() => {
  const results: ForecastAlert[] = [];
  for (let i = 0; i < 60; i++) {
    results.push({
      id: `alert-${i + 1}`,
      category: pick(ALERT_CATEGORIES),
      severity: pick(ALERT_SEVERITIES),
      title: pick(ALERT_TITLES),
      message: `Alert: ${pick(ALERT_TITLES)} detected for ${pick(ENTITIES)}`,
      entity: pick(ENTITIES),
      forecastPeriod: fmtDate(new Date(2025, i % 12, 1)),
      suggestedAction: `Review and ${pick(["escalate", "approve", "mitigate", "monitor"])} in Treasury Console`,
      timestamp: new Date(2025, i % 12, (i % 28) + 1).toISOString(),
      acknowledged: Math.random() > 0.4,
    });
  }
  return results;
})();

export const MOCK_INSIGHTS: ExecutiveInsight[] = (() => {
  return Array.from({ length: 20 }, (_, i) => ({
    label: pick(INSIGHT_LABELS),
    value: i % 2 === 0 ? `$${rand(50, 950).toFixed(0)}M` : `${rand(60, 120).toFixed(0)}%`,
    description: `${pick(INSIGHT_LABELS)} trending ${pick(["higher", "lower", "stable"])} vs prior period for ${pick(ENTITIES)}`,
    entity: pick(ENTITIES),
    severity: pick(["positive", "warning", "critical"]) as ExecutiveInsight["severity"],
  }));
})();

export const MOCK_METRICS: ForecastMetrics = {
  forecastHorizon: "18 months rolling",
  forecastConfidence: 82,
  cashRunway: 245,
  projectedEndingCash: 725_000_000,
  fundingRequirement: 340_000_000,
  expectedLiquidity: 890_000_000,
  scenarioCount: 200,
  stressTestCount: 120,
  forecastAccuracy: 87.3,
  cashBurn: 42_500_000,
  largestRisk: "Recession impact on revenue growth across NA and EU markets",
  largestOpportunity: "Working capital optimization through AP extension",
  entities: 12,
  regions: 8,
  currencies: 15,
  alerts: 24,
  trend: "up",
  lastUpdated: new Date().toISOString(),
};

export const MOCK_SCENARIO_COMPARISONS: ScenarioComparison[] = (() => {
  const labels = [
    "Base Case", "Optimistic", "Pessimistic", "Expansion",
    "Recession", "Acquisition", "Capital Raise", "FX Shock",
    "Interest Shock", "Supply Chain Crisis",
  ];
  return labels.map((lbl) => ({
    scenario: lbl,
    projectedCash: Math.round(rand(300_000_000, 1_800_000_000)),
    liquidity: Math.round(rand(200_000_000, 1_200_000_000)),
    fundingGap: Math.round(rand(0, 200_000_000)),
    cashRunway: Math.round(rand(90, 540)),
    confidence: Math.round(rand(40, 95)),
    risk: pick(["low", "medium", "high", "critical"]) as ScenarioComparison["risk"],
  }));
})();

export const MOCK_SENSITIVITY: SensitivityResult[] = (() => {
  return SENSITIVITY_VARS.map((v) => ({
    variable: v,
    impact: Math.round(rand(-150_000_000, 200_000_000)),
    probability: Math.round(rand(10, 80)) / 100,
    sensitivity: pick(["low", "medium", "high"]) as SensitivityResult["sensitivity"],
    direction: pick(["positive", "negative"]) as SensitivityResult["direction"],
  }));
})();

const generateTrendData = (key: string): TrendPoint[] => {
  const baseValues: Record<string, number> = {
    cashRunway: 245,
    forecastConfidence: 82,
    cashBurn: 42_500_000,
    netCashFlow: 12_300_000,
    forecastAccuracy: 87.3,
    liquidityTrend: 2.1,
    workingCapital: 380_000_000,
    freeCashFlow: 28_000_000,
  };
  const base = baseValues[key] ?? 100;
  return Array.from({ length: 12 }, (_, i) => ({
    date: fmtDate(new Date(2025, i, 1)),
    value: Math.round(base * (1 + rand(-0.1, 0.1))),
    label: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  }));
};

export const MOCK_TREND_DATA: Record<string, TrendPoint[]> = {
  cashRunway: generateTrendData("cashRunway"),
  forecastConfidence: generateTrendData("forecastConfidence"),
  cashBurn: generateTrendData("cashBurn"),
  netCashFlow: generateTrendData("netCashFlow"),
  forecastAccuracy: generateTrendData("forecastAccuracy"),
  liquidityTrend: generateTrendData("liquidityTrend"),
  workingCapital: generateTrendData("workingCapital"),
  freeCashFlow: generateTrendData("freeCashFlow"),
};

export const MOCK_ANALYTICS_SERIES: AnalyticsSeries[] = [
  {
    name: "Projected Cash Position",
    data: Array.from({ length: 12 }, (_, i) => ({
      date: fmtDate(new Date(2025, i, 1)),
      value: Math.round(rand(600_000_000, 900_000_000)),
      label: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
    })),
    color: "#D4AF37",
  },
  {
    name: "Available Liquidity",
    data: Array.from({ length: 12 }, (_, i) => ({
      date: fmtDate(new Date(2025, i, 1)),
      value: Math.round(rand(400_000_000, 700_000_000)),
      label: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
    })),
    color: "#6366F1",
  },
  {
    name: "Funding Requirement",
    data: Array.from({ length: 12 }, (_, i) => ({
      date: fmtDate(new Date(2025, i, 1)),
      value: Math.round(rand(200_000_000, 450_000_000)),
      label: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
    })),
    color: "#EF4444",
  },
  {
    name: "Cash Inflows",
    data: Array.from({ length: 12 }, (_, i) => ({
      date: fmtDate(new Date(2025, i, 1)),
      value: Math.round(rand(120_000_000, 250_000_000)),
      label: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
    })),
    color: "#22C55E",
  },
  {
    name: "Cash Outflows",
    data: Array.from({ length: 12 }, (_, i) => ({
      date: fmtDate(new Date(2025, i, 1)),
      value: Math.round(rand(100_000_000, 200_000_000)),
      label: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
    })),
    color: "#F97316",
  },
];

export const MOCK_DASHBOARD_FILTERS: DashboardFilters = {
  entity: null,
  region: null,
  currency: null,
  forecastHorizon: null,
  scenario: null,
  businessUnit: null,
  forecastType: null,
  confidence: null,
  riskLevel: null,
  liquidityTier: null,
  cashCategory: null,
  department: null,
  dateRange: null,
  status: null,
  owner: null,
};
