import type {
  FXExposure,
  InterestRateExposure,
  CounterpartyRisk,
  CountryRisk,
  LiquidityRisk,
  ConcentrationRisk,
  RiskPolicy,
  RiskLimit,
  RiskBreach,
  VaRCalculation,
  StressScenario,
  HedgePosition,
  DerivativePosition,
  ForwardContract,
  SwapPosition,
  OptionPosition,
  TreasuryRiskAlert,
  RiskRecommendation,
  ExecutiveInsight,
  RiskMetrics,
  TrendPoint,
  AnalyticsSeries,
} from "./types";

const pick = <T,>(arr: readonly T[], index: number): T => arr[index % arr.length];

export const MOCK_ENTITIES: string[] = [
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
];

export const MOCK_CURRENCIES: string[] = [
  "USD", "EUR", "GBP", "JPY", "CHF", "AED", "ZAR", "BRL", "SGD", "INR", "CNY", "AUD",
];

export const MOCK_COUNTRIES: string[] = [
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Switzerland",
  "Netherlands",
  "UAE",
  "South Africa",
  "Brazil",
  "Singapore",
  "India",
  "China",
  "Australia",
  "Japan",
  "Canada",
  "Mexico",
  "Saudi Arabia",
  "Nigeria",
];

export const MOCK_COUNTERPARTIES: string[] = [
  "JP Morgan Chase",
  "Citibank",
  "HSBC",
  "Bank of America",
  "Deutsche Bank",
  "Barclays",
  "Standard Chartered",
  "BNP Paribas",
  "UBS",
  "Credit Suisse",
  "Morgan Stanley",
  "Goldman Sachs",
  "Santander",
  "First Abu Dhabi Bank",
  "Standard Bank South Africa",
  "DBS Bank",
  "Mitsubishi UFJ",
  "ICBC",
  "Royal Bank of Canada",
  "Commonwealth Bank",
];

export const MOCK_REGIONS: string[] = [
  "North America",
  "Europe",
  "Middle East",
  "Africa",
  "APAC",
  "LATAM",
  "Oceania",
];

const MOCK_FX_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 1.0842,
  GBP: 1.2715,
  JPY: 0.00665,
  CHF: 1.1278,
  AED: 0.2723,
  ZAR: 0.0538,
  BRL: 0.2005,
  SGD: 0.7456,
  INR: 0.0120,
  CNY: 0.1389,
  AUD: 0.6710,
};

const entityRegions: Record<string, string> = {
  "Perionyx Global Ltd": "North America",
  "Perionyx US Corp": "North America",
  "Perionyx Europe BV": "Europe",
  "Perionyx UK plc": "Europe",
  "Perionyx ME FZCO": "Middle East",
  "Perionyx Africa (Pty) Ltd": "Africa",
  "Perionyx APAC Pte Ltd": "APAC",
  "Perionyx LATAM SA": "LATAM",
  "Perionyx Oceania Pty Ltd": "Oceania",
  "Perionyx Canada Inc": "North America",
  "Perionyx India Pvt Ltd": "APAC",
  "Perionyx China Ltd": "APAC",
};

const countryRegion: Record<string, string> = {
  "United States": "North America",
  "United Kingdom": "Europe",
  "Germany": "Europe",
  "France": "Europe",
  "Switzerland": "Europe",
  "Netherlands": "Europe",
  "UAE": "Middle East",
  "South Africa": "Africa",
  "Brazil": "LATAM",
  "Singapore": "APAC",
  "India": "APAC",
  "China": "APAC",
  "Australia": "Oceania",
  "Japan": "APAC",
  "Canada": "North America",
  "Mexico": "LATAM",
  "Saudi Arabia": "Middle East",
  "Nigeria": "Africa",
};

const creditRatings = ["AA+", "AA", "AA-", "A+", "A", "BBB+"] as const;

type Trend = "up" | "down" | "stable";
type PolicyStatus = "compliant" | "breached" | "pending_review";
type DirTrend = "improving" | "stable" | "deteriorating";
type BreachSeverity = "info" | "warning" | "critical" | "emergency";
type RiskSeverity = "low" | "medium" | "high" | "critical";
type StressCategory =
  | "fx_shock"
  | "interest_shock"
  | "liquidity_crisis"
  | "bank_failure"
  | "country_sanctions"
  | "commodity_spike"
  | "revenue_decline"
  | "customer_default"
  | "supply_disruption"
  | "pandemic";
type HedgeType = "forward" | "option" | "swap" | "natural";
type DerivativeType = "forward" | "futures" | "option" | "swap" | "ndf";
type OptionType = "call" | "put";
type HealthStatus = "healthy" | "watch" | "critical";
type RiskDirection = "long" | "short" | "flat";

// ---------------------------------------------------------------------------
// FX EXPOSURES (40)
// ---------------------------------------------------------------------------
const fxExposureData: [string, number, number, number, number, number, PolicyStatus, Trend, string][] = [
  ["USD", 150_000_000, 40_000_000, 1.0, 2_100_000, 55, "compliant", "stable", "Perionyx Global Ltd"],
  ["EUR", 100_000_000, 35_000_000, 1.0842, 1_400_000, 60, "compliant", "stable", "Perionyx Global Ltd"],
  ["GBP", 60_000_000, 20_000_000, 1.2715, 900_000, 45, "compliant", "up", "Perionyx Global Ltd"],
  ["JPY", 40_000_000, 15_000_000, 0.00665, 520_000, 30, "pending_review", "down", "Perionyx Global Ltd"],
  ["CHF", 25_000_000, 10_000_000, 1.1278, 340_000, 50, "compliant", "stable", "Perionyx Global Ltd"],
  ["USD", 200_000_000, 50_000_000, 1.0, 3_800_000, 70, "compliant", "up", "Perionyx US Corp"],
  ["EUR", 50_000_000, 15_000_000, 1.0842, 850_000, 65, "compliant", "stable", "Perionyx US Corp"],
  ["GBP", 30_000_000, 10_000_000, 1.2715, 475_000, 40, "compliant", "stable", "Perionyx US Corp"],
  ["CAD", 45_000_000, 12_000_000, 0.7420, 625_000, 55, "compliant", "up", "Perionyx US Corp"],
  ["MXN", 20_000_000, 8_000_000, 0.0580, 260_000, 25, "breached", "down", "Perionyx US Corp"],
  ["EUR", 180_000_000, 60_000_000, 1.0842, 2_900_000, 75, "compliant", "up", "Perionyx Europe BV"],
  ["GBP", 40_000_000, 15_000_000, 1.2715, 620_000, 60, "compliant", "stable", "Perionyx Europe BV"],
  ["CHF", 65_000_000, 20_000_000, 1.1278, 1_100_000, 70, "compliant", "stable", "Perionyx Europe BV"],
  ["SEK", 15_000_000, 5_000_000, 0.0960, 195_000, 35, "pending_review", "down", "Perionyx Europe BV"],
  ["NOK", 12_000_000, 4_000_000, 0.0940, 155_000, 30, "compliant", "stable", "Perionyx Europe BV"],
  ["GBP", 180_000_000, 60_000_000, 1.2715, 3_200_000, 80, "compliant", "up", "Perionyx UK plc"],
  ["EUR", 30_000_000, 10_000_000, 1.0842, 480_000, 50, "compliant", "stable", "Perionyx UK plc"],
  ["USD", 50_000_000, 15_000_000, 1.0, 780_000, 45, "compliant", "stable", "Perionyx UK plc"],
  ["AED", 60_000_000, 20_000_000, 0.2723, 850_000, 65, "compliant", "stable", "Perionyx ME FZCO"],
  ["SAR", 35_000_000, 12_000_000, 0.2665, 475_000, 55, "compliant", "up", "Perionyx ME FZCO"],
  ["USD", 30_000_000, 10_000_000, 1.0, 410_000, 40, "pending_review", "stable", "Perionyx ME FZCO"],
  ["ZAR", 45_000_000, 25_000_000, 0.0538, 720_000, 30, "breached", "down", "Perionyx Africa (Pty) Ltd"],
  ["NGN", 15_000_000, 8_000_000, 0.0022, 195_000, 15, "breached", "down", "Perionyx Africa (Pty) Ltd"],
  ["USD", 20_000_000, 5_000_000, 1.0, 380_000, 50, "compliant", "stable", "Perionyx Africa (Pty) Ltd"],
  ["SGD", 40_000_000, 15_000_000, 0.7456, 620_000, 60, "compliant", "up", "Perionyx APAC Pte Ltd"],
  ["JPY", 80_000_000, 25_000_000, 0.00665, 1_250_000, 55, "compliant", "stable", "Perionyx APAC Pte Ltd"],
  ["AUD", 30_000_000, 10_000_000, 0.6710, 450_000, 45, "compliant", "stable", "Perionyx APAC Pte Ltd"],
  ["CNY", 25_000_000, 10_000_000, 0.1389, 340_000, 35, "pending_review", "down", "Perionyx APAC Pte Ltd"],
  ["BRL", 55_000_000, 35_000_000, 0.2005, 720_000, 25, "breached", "down", "Perionyx LATAM SA"],
  ["MXN", 25_000_000, 10_000_000, 0.0580, 340_000, 30, "pending_review", "stable", "Perionyx LATAM SA"],
  ["USD", 15_000_000, 5_000_000, 1.0, 240_000, 40, "compliant", "stable", "Perionyx LATAM SA"],
  ["AUD", 65_000_000, 20_000_000, 0.6710, 1_050_000, 70, "compliant", "up", "Perionyx Oceania Pty Ltd"],
  ["NZD", 20_000_000, 6_000_000, 0.6180, 310_000, 50, "compliant", "stable", "Perionyx Oceania Pty Ltd"],
  ["USD", 100_000_000, 30_000_000, 1.0, 1_600_000, 60, "compliant", "stable", "Perionyx Canada Inc"],
  ["CAD", 50_000_000, 15_000_000, 0.7420, 780_000, 65, "compliant", "up", "Perionyx Canada Inc"],
  ["INR", 70_000_000, 25_000_000, 0.0120, 910_000, 35, "pending_review", "down", "Perionyx India Pvt Ltd"],
  ["USD", 25_000_000, 10_000_000, 1.0, 360_000, 45, "compliant", "stable", "Perionyx India Pvt Ltd"],
  ["CNY", 80_000_000, 30_000_000, 0.1389, 1_200_000, 40, "pending_review", "stable", "Perionyx China Ltd"],
  ["USD", 35_000_000, 10_000_000, 1.0, 520_000, 50, "compliant", "stable", "Perionyx China Ltd"],
  ["HKD", 20_000_000, 5_000_000, 0.1285, 300_000, 30, "compliant", "stable", "Perionyx China Ltd"],
];

export const MOCK_FX_EXPOSURES: FXExposure[] = fxExposureData.map((row, i) => {
  const [currency, long, short, fxRate, gainLoss, hedgePct, policyStatus, trend, entity] = row;
  const net = long - short;
  return {
    id: `fx-${String(i + 1).padStart(3, "0")}`,
    currency,
    longAmount: long,
    shortAmount: short,
    netExposure: net,
    functionalCurrency: "USD",
    reportingCurrency: "USD",
    fxRate: fxRate as number,
    gainLoss,
    hedgePercentage: hedgePct,
    policyStatus,
    trend: trend as Trend,
    entity,
    region: entityRegions[entity],
  };
});

// ---------------------------------------------------------------------------
// INTEREST RATE EXPOSURES (20)
// ---------------------------------------------------------------------------
const interestData: [string, string, number, number, number, number, number, PolicyStatus, string][] = [
  ["Perionyx Global Ltd", "USD", 180_000_000, 120_000_000, 4.2, 2_100_000, 250_000_000, "compliant", "SOFR"],
  ["Perionyx Global Ltd", "EUR", 90_000_000, 60_000_000, 3.8, 1_400_000, 180_000_000, "compliant", "EURIBOR 3M"],
  ["Perionyx US Corp", "USD", 200_000_000, 150_000_000, 5.1, 3_500_000, 400_000_000, "compliant", "SOFR"],
  ["Perionyx US Corp", "GBP", 40_000_000, 20_000_000, 2.5, 480_000, 75_000_000, "pending_review", "SONIA"],
  ["Perionyx Europe BV", "EUR", 150_000_000, 100_000_000, 4.5, 2_500_000, 300_000_000, "compliant", "EURIBOR 3M"],
  ["Perionyx Europe BV", "CHF", 55_000_000, 25_000_000, 2.8, 650_000, 100_000_000, "compliant", "SARON"],
  ["Perionyx UK plc", "GBP", 120_000_000, 80_000_000, 4.0, 1_800_000, 250_000_000, "compliant", "SONIA"],
  ["Perionyx UK plc", "EUR", 35_000_000, 15_000_000, 2.2, 380_000, 60_000_000, "pending_review", "EURIBOR 3M"],
  ["Perionyx ME FZCO", "USD", 60_000_000, 30_000_000, 3.5, 780_000, 120_000_000, "compliant", "SOFR"],
  ["Perionyx ME FZCO", "AED", 25_000_000, 10_000_000, 1.8, 260_000, 45_000_000, "compliant", "EIBOR"],
  ["Perionyx Africa (Pty) Ltd", "USD", 30_000_000, 20_000_000, 3.0, 380_000, 60_000_000, "breached", "SOFR"],
  ["Perionyx Africa (Pty) Ltd", "ZAR", 20_000_000, 15_000_000, 2.0, 260_000, 40_000_000, "breached", "JIBAR"],
  ["Perionyx APAC Pte Ltd", "SGD", 45_000_000, 25_000_000, 3.2, 560_000, 90_000_000, "compliant", "SORA"],
  ["Perionyx APAC Pte Ltd", "JPY", 50_000_000, 30_000_000, 2.5, 600_000, 100_000_000, "compliant", "TONA"],
  ["Perionyx LATAM SA", "BRL", 25_000_000, 20_000_000, 2.8, 340_000, 55_000_000, "breached", "CDI"],
  ["Perionyx LATAM SA", "USD", 20_000_000, 10_000_000, 1.5, 220_000, 40_000_000, "pending_review", "SOFR"],
  ["Perionyx Oceania Pty Ltd", "AUD", 50_000_000, 25_000_000, 3.6, 680_000, 100_000_000, "compliant", "BBSW"],
  ["Perionyx India Pvt Ltd", "INR", 40_000_000, 30_000_000, 2.0, 480_000, 85_000_000, "pending_review", "MIBOR"],
  ["Perionyx China Ltd", "CNY", 55_000_000, 35_000_000, 2.5, 680_000, 110_000_000, "pending_review", "SHIBOR"],
  ["Perionyx Canada Inc", "USD", 75_000_000, 40_000_000, 3.8, 1_050_000, 150_000_000, "compliant", "SOFR"],
];

export const MOCK_INTEREST_EXPOSURES: InterestRateExposure[] = interestData.map((row, i) => {
  const [entity, currency, fixed, floating, duration, sensBps, limit, status, benchmark] = row;
  const total = fixed + floating;
  const fixedPct = Math.round((fixed / total) * 100);
  const floatPct = 100 - fixedPct;
  return {
    id: `ir-${String(i + 1).padStart(3, "0")}`,
    entity,
    currency,
    fixedAmount: fixed,
    floatingAmount: floating,
    totalExposure: total,
    fixedPercentage: fixedPct,
    floatingPercentage: floatPct,
    durationYears: duration,
    sensitivityBps: sensBps,
    annualImpact: Math.round(sensBps * 0.01 * total),
    policyLimit: limit,
    status: status as PolicyStatus,
    benchmark,
  };
});

// ---------------------------------------------------------------------------
// COUNTERPARTY RISK (20)
// ---------------------------------------------------------------------------
const counterpartyData: [string, string, number, number, number, number, HealthStatus, number, boolean, string][] = [
  ["JP Morgan Chase", "United States", 350_000_000, 500_000_000, 70, 15, "healthy", 120_000_000, true, "2026-03-15"],
  ["Citibank", "United States", 280_000_000, 450_000_000, 62, 18, "healthy", 100_000_000, true, "2026-02-20"],
  ["HSBC", "United Kingdom", 220_000_000, 400_000_000, 55, 22, "healthy", 80_000_000, true, "2026-01-10"],
  ["Bank of America", "United States", 190_000_000, 350_000_000, 54, 25, "healthy", 75_000_000, true, "2026-03-01"],
  ["Deutsche Bank", "Germany", 160_000_000, 300_000_000, 53, 30, "watch", 60_000_000, true, "2025-11-15"],
  ["Barclays", "United Kingdom", 140_000_000, 250_000_000, 56, 28, "healthy", 55_000_000, true, "2026-02-01"],
  ["Standard Chartered", "United Kingdom", 120_000_000, 220_000_000, 55, 32, "healthy", 45_000_000, true, "2025-12-20"],
  ["BNP Paribas", "France", 110_000_000, 200_000_000, 55, 35, "watch", 40_000_000, true, "2025-10-05"],
  ["UBS", "Switzerland", 100_000_000, 180_000_000, 56, 20, "healthy", 50_000_000, true, "2026-03-10"],
  ["Credit Suisse", "Switzerland", 85_000_000, 150_000_000, 57, 45, "critical", 25_000_000, false, "2025-09-01"],
  ["Morgan Stanley", "United States", 95_000_000, 175_000_000, 54, 28, "healthy", 35_000_000, true, "2026-01-25"],
  ["Goldman Sachs", "United States", 90_000_000, 160_000_000, 56, 24, "healthy", 40_000_000, true, "2026-02-28"],
  ["Santander", "Spain", 70_000_000, 130_000_000, 54, 40, "watch", 20_000_000, true, "2025-11-01"],
  ["First Abu Dhabi Bank", "UAE", 55_000_000, 100_000_000, 55, 18, "healthy", 25_000_000, true, "2026-03-05"],
  ["Standard Bank South Africa", "South Africa", 45_000_000, 80_000_000, 56, 50, "watch", 12_000_000, true, "2025-12-01"],
  ["DBS Bank", "Singapore", 60_000_000, 120_000_000, 50, 22, "healthy", 22_000_000, true, "2026-02-15"],
  ["Mitsubishi UFJ", "Japan", 75_000_000, 140_000_000, 54, 25, "healthy", 28_000_000, true, "2026-01-20"],
  ["ICBC", "China", 80_000_000, 150_000_000, 53, 35, "watch", 30_000_000, true, "2025-10-15"],
  ["Royal Bank of Canada", "Canada", 65_000_000, 125_000_000, 52, 20, "healthy", 25_000_000, true, "2026-03-12"],
  ["Commonwealth Bank", "Australia", 50_000_000, 100_000_000, 50, 28, "healthy", 18_000_000, true, "2026-01-05"],
];

export const MOCK_COUNTERPARTY_RISK: CounterpartyRisk[] = counterpartyData.map((row, i) => {
  const [cp, country, exposure, limit, ratingIdx, score, health, collateral, netting, review] = row;
  return {
    id: `cp-${String(i + 1).padStart(3, "0")}`,
    counterparty: cp,
    country,
    creditRating: creditRatings[i % creditRatings.length],
    exposure,
    limit,
    utilization: Math.round((exposure / limit) * 100),
    riskScore: score,
    health: health as HealthStatus,
    collateralHeld: collateral,
    nettingEligible: netting,
    lastReview: review,
  };
});

// ---------------------------------------------------------------------------
// COUNTRY RISK (18)
// ---------------------------------------------------------------------------
const countryData: [string, number, number, number, number, RiskSeverity, DirTrend, number][] = [
  ["United States", 850_000_000, 22, 18, 15, "low", "stable", 1_200_000_000],
  ["United Kingdom", 420_000_000, 28, 25, 22, "low", "stable", 600_000_000],
  ["Germany", 350_000_000, 25, 20, 18, "low", "stable", 500_000_000],
  ["France", 220_000_000, 35, 30, 28, "medium", "stable", 350_000_000],
  ["Switzerland", 180_000_000, 15, 12, 10, "low", "stable", 300_000_000],
  ["Netherlands", 160_000_000, 20, 18, 15, "low", "stable", 250_000_000],
  ["UAE", 140_000_000, 30, 25, 28, "medium", "improving", 200_000_000],
  ["South Africa", 95_000_000, 55, 50, 60, "high", "deteriorating", 150_000_000],
  ["Brazil", 110_000_000, 50, 55, 58, "high", "deteriorating", 180_000_000],
  ["Singapore", 120_000_000, 12, 10, 8, "low", "stable", 200_000_000],
  ["India", 130_000_000, 40, 38, 42, "medium", "improving", 200_000_000],
  ["China", 160_000_000, 48, 42, 45, "medium", "stable", 250_000_000],
  ["Australia", 100_000_000, 18, 15, 12, "low", "stable", 180_000_000],
  ["Japan", 110_000_000, 20, 22, 18, "low", "stable", 200_000_000],
  ["Canada", 150_000_000, 18, 15, 14, "low", "stable", 250_000_000],
  ["Mexico", 80_000_000, 45, 42, 48, "medium", "stable", 130_000_000],
  ["Saudi Arabia", 90_000_000, 35, 28, 30, "medium", "improving", 150_000_000],
  ["Nigeria", 40_000_000, 70, 65, 75, "critical", "deteriorating", 70_000_000],
];

export const MOCK_COUNTRY_RISK: CountryRisk[] = countryData.map((row, i) => {
  const [country, exposure, pol, econ, cur, level, trend, limits] = row;
  const composite = Math.round(pol * 0.35 + econ * 0.35 + cur * 0.3);
  return {
    id: `cr-${String(i + 1).padStart(3, "0")}`,
    country,
    region: countryRegion[country],
    exposure,
    politicalRisk: pol,
    economicRisk: econ,
    currencyRisk: cur,
    compositeScore: composite,
    riskLevel: level,
    trend: trend as DirTrend,
    limits,
  };
});

// ---------------------------------------------------------------------------
// LIQUIDITY RISK (12)
// ---------------------------------------------------------------------------
const liquidityData: [string, string, number, number, string, number, RiskSeverity][] = [
  ["Perionyx Global Ltd", "USD", 180_000_000, 540_000_000, "market_disruption", 210, "low"],
  ["Perionyx Global Ltd", "EUR", 95_000_000, 280_000_000, "market_disruption", 195, "low"],
  ["Perionyx US Corp", "USD", 250_000_000, 600_000_000, "liquidity_crisis", 165, "low"],
  ["Perionyx Europe BV", "EUR", 140_000_000, 320_000_000, "liquidity_crisis", 155, "low"],
  ["Perionyx UK plc", "GBP", 110_000_000, 240_000_000, "market_disruption", 150, "medium"],
  ["Perionyx ME FZCO", "USD", 65_000_000, 130_000_000, "liquidity_crisis", 135, "medium"],
  ["Perionyx Africa (Pty) Ltd", "ZAR", 35_000_000, 50_000_000, "bank_failure", 45, "critical"],
  ["Perionyx APAC Pte Ltd", "SGD", 50_000_000, 140_000_000, "market_disruption", 185, "low"],
  ["Perionyx LATAM SA", "BRL", 40_000_000, 65_000_000, "currency_crisis", 55, "high"],
  ["Perionyx Oceania Pty Ltd", "AUD", 45_000_000, 120_000_000, "market_disruption", 175, "low"],
  ["Perionyx India Pvt Ltd", "INR", 38_000_000, 55_000_000, "liquidity_crisis", 48, "high"],
  ["Perionyx China Ltd", "CNY", 42_000_000, 70_000_000, "liquidity_crisis", 58, "medium"],
];

export const MOCK_LIQUIDITY_RISK: LiquidityRisk[] = liquidityData.map((row, i) => {
  const [entity, currency, outflow, liquidity, scenario, days, level] = row;
  return {
    id: `lr-${String(i + 1).padStart(3, "0")}`,
    entity,
    currency,
    projectedOutflow: outflow,
    availableLiquidity: liquidity,
    coverageRatio: Math.round((liquidity / outflow) * 100),
    stressScenario: scenario,
    survivalDays: days,
    riskLevel: level,
  };
});

// ---------------------------------------------------------------------------
// CONCENTRATION RISK (15)
// ---------------------------------------------------------------------------
export const MOCK_CONCENTRATION_RISK: ConcentrationRisk[] = [
  { id: "conc-001", category: "counterparty", counterparty: "JP Morgan Chase", exposure: 350_000_000, totalPortfolio: 2_450_000_000, concentration: 14.29, limit: 20, status: "compliant" },
  { id: "conc-002", category: "counterparty", counterparty: "Citibank", exposure: 280_000_000, totalPortfolio: 2_450_000_000, concentration: 11.43, limit: 15, status: "compliant" },
  { id: "conc-003", category: "counterparty", counterparty: "HSBC", exposure: 220_000_000, totalPortfolio: 2_450_000_000, concentration: 8.98, limit: 15, status: "compliant" },
  { id: "conc-004", category: "counterparty", counterparty: "Deutsche Bank", exposure: 160_000_000, totalPortfolio: 2_450_000_000, concentration: 6.53, limit: 12, status: "compliant" },
  { id: "conc-005", category: "currency", counterparty: "USD", exposure: 950_000_000, totalPortfolio: 2_450_000_000, concentration: 38.78, limit: 45, status: "compliant" },
  { id: "conc-006", category: "currency", counterparty: "EUR", exposure: 520_000_000, totalPortfolio: 2_450_000_000, concentration: 21.22, limit: 30, status: "compliant" },
  { id: "conc-007", category: "currency", counterparty: "GBP", exposure: 310_000_000, totalPortfolio: 2_450_000_000, concentration: 12.65, limit: 25, status: "compliant" },
  { id: "conc-008", category: "country", counterparty: "United States", exposure: 850_000_000, totalPortfolio: 2_450_000_000, concentration: 34.69, limit: 40, status: "compliant" },
  { id: "conc-009", category: "country", counterparty: "United Kingdom", exposure: 420_000_000, totalPortfolio: 2_450_000_000, concentration: 17.14, limit: 25, status: "compliant" },
  { id: "conc-010", category: "country", counterparty: "Germany", exposure: 350_000_000, totalPortfolio: 2_450_000_000, concentration: 14.29, limit: 20, status: "compliant" },
  { id: "conc-011", category: "industry", counterparty: "Banking", exposure: 1_850_000_000, totalPortfolio: 2_450_000_000, concentration: 75.51, limit: 80, status: "compliant" },
  { id: "conc-012", category: "industry", counterparty: "Financial Services", exposure: 280_000_000, totalPortfolio: 2_450_000_000, concentration: 11.43, limit: 20, status: "compliant" },
  { id: "conc-013", category: "product", counterparty: "FX Forwards", exposure: 520_000_000, totalPortfolio: 2_450_000_000, concentration: 21.22, limit: 35, status: "compliant" },
  { id: "conc-014", category: "product", counterparty: "Interest Rate Swaps", exposure: 380_000_000, totalPortfolio: 2_450_000_000, concentration: 15.51, limit: 30, status: "compliant" },
  { id: "conc-015", category: "product", counterparty: "Options", exposure: 145_000_000, totalPortfolio: 2_450_000_000, concentration: 5.92, limit: 15, status: "compliant" },
];

// ---------------------------------------------------------------------------
// RISK POLICIES (20)
// ---------------------------------------------------------------------------
export const MOCK_POLICIES: RiskPolicy[] = [
  { id: "pol-001", name: "FX Net Open Position Limit", category: "FX", threshold: 500_000_000, operator: "lt", currentValue: 450_000_000, status: "compliant", owner: "Sarah Chen", approvalRequired: "CFO", lastReview: "2026-01-15", nextReview: "2026-07-15" },
  { id: "pol-002", name: "Single Counterparty Exposure Limit", category: "counterparty", threshold: 500_000_000, operator: "lt", currentValue: 350_000_000, status: "compliant", owner: "Michael Torres", approvalRequired: "Treasurer", lastReview: "2026-02-01", nextReview: "2026-08-01" },
  { id: "pol-003", name: "EUR Net Exposure Limit", category: "FX", threshold: 250_000_000, operator: "lt", currentValue: 185_000_000, status: "compliant", owner: "Sarah Chen", approvalRequired: "CFO", lastReview: "2026-01-20", nextReview: "2026-07-20" },
  { id: "pol-004", name: "ZAR Exposure Limit", category: "FX", threshold: 50_000_000, operator: "lt", currentValue: 45_000_000, status: "pending_review", owner: "James Mwangi", approvalRequired: "Treasurer", lastReview: "2025-11-10", nextReview: "2026-05-10" },
  { id: "pol-005", name: "Minimum Hedge Coverage Ratio", category: "hedging", threshold: 50, operator: "gte", currentValue: 52, status: "compliant", owner: "Sarah Chen", approvalRequired: "CFO", lastReview: "2026-03-01", nextReview: "2026-09-01" },
  { id: "pol-006", name: "Liquidity Coverage Ratio", category: "liquidity", threshold: 150, operator: "gte", currentValue: 185, status: "compliant", owner: "David Kim", approvalRequired: "Treasurer", lastReview: "2026-02-15", nextReview: "2026-08-15" },
  { id: "pol-007", name: "Maximum VaR (95% 1d)", category: "VaR", threshold: 25_000_000, operator: "lt", currentValue: 18_500_000, status: "compliant", owner: "Michael Torres", approvalRequired: "CFO", lastReview: "2026-03-10", nextReview: "2026-09-10" },
  { id: "pol-008", name: "Interest Rate Duration Limit", category: "interest_rate", threshold: 5.0, operator: "lt", currentValue: 4.2, status: "compliant", owner: "David Kim", approvalRequired: "Treasurer", lastReview: "2026-01-25", nextReview: "2026-07-25" },
  { id: "pol-009", name: "Counterparty Credit Rating Minimum", category: "counterparty", threshold: 3, operator: "gte", currentValue: 4, status: "compliant", owner: "Michael Torres", approvalRequired: "CFO", lastReview: "2026-03-05", nextReview: "2026-09-05" },
  { id: "pol-010", name: "BRL Net Exposure Limit", category: "FX", threshold: 30_000_000, operator: "lt", currentValue: 35_000_000, status: "breached", owner: "Luis Fernandez", approvalRequired: "Treasurer", lastReview: "2025-12-01", nextReview: "2026-06-01" },
  { id: "pol-011", name: "Country Risk Composite Threshold", category: "country", threshold: 50, operator: "lt", currentValue: 48, status: "compliant", owner: "Michael Torres", approvalRequired: "CFO", lastReview: "2026-02-20", nextReview: "2026-08-20" },
  { id: "pol-012", name: "Total Counterparty Concentration", category: "concentration", threshold: 25, operator: "lt", currentValue: 14.29, status: "compliant", owner: "Sarah Chen", approvalRequired: "CFO", lastReview: "2026-01-10", nextReview: "2026-07-10" },
  { id: "pol-013", name: "Survival Days Minimum", category: "liquidity", threshold: 90, operator: "gte", currentValue: 45, status: "breached", owner: "James Mwangi", approvalRequired: "Treasurer", lastReview: "2025-10-15", nextReview: "2026-04-15" },
  { id: "pol-014", name: "Maximum Single Currency Exposure", category: "concentration", threshold: 40, operator: "lt", currentValue: 38.78, status: "compliant", owner: "Sarah Chen", approvalRequired: "CFO", lastReview: "2026-03-15", nextReview: "2026-09-15" },
  { id: "pol-015", name: "Derivative Counterparty Limit", category: "derivatives", threshold: 200_000_000, operator: "lt", currentValue: 180_000_000, status: "compliant", owner: "Michael Torres", approvalRequired: "Treasurer", lastReview: "2026-02-28", nextReview: "2026-08-28" },
  { id: "pol-016", name: "Stress Testing Frequency", category: "governance", threshold: 90, operator: "gte", currentValue: 90, status: "compliant", owner: "David Kim", approvalRequired: "CFO", lastReview: "2026-01-30", nextReview: "2026-07-30" },
  { id: "pol-017", name: "INR Exposure Limit", category: "FX", threshold: 60_000_000, operator: "lt", currentValue: 45_000_000, status: "pending_review", owner: "Priya Sharma", approvalRequired: "Treasurer", lastReview: "2025-12-20", nextReview: "2026-06-20" },
  { id: "pol-018", name: "Hedge Effectiveness Minimum", category: "hedging", threshold: 80, operator: "gte", currentValue: 87, status: "compliant", owner: "Sarah Chen", approvalRequired: "CFO", lastReview: "2026-03-08", nextReview: "2026-09-08" },
  { id: "pol-019", name: "Maximum Tenor for FX Forwards", category: "derivatives", threshold: 365, operator: "lt", currentValue: 270, status: "compliant", owner: "Michael Torres", approvalRequired: "Treasurer", lastReview: "2026-02-10", nextReview: "2026-08-10" },
  { id: "pol-020", name: "Collateralization Ratio", category: "counterparty", threshold: 30, operator: "gte", currentValue: 28, status: "breached", owner: "David Kim", approvalRequired: "CFO", lastReview: "2025-11-20", nextReview: "2026-05-20" },
];

// ---------------------------------------------------------------------------
// RISK LIMITS (25)
// ---------------------------------------------------------------------------
export const MOCK_LIMITS: RiskLimit[] = [
  { id: "lim-001", name: "JP Morgan Credit Line", counterparty: "JP Morgan Chase", limitType: "credit", limitAmount: 500_000_000, utilized: 350_000_000, available: 150_000_000, utilizationPercent: 70, expiryDate: "2026-12-31", status: "active" },
  { id: "lim-002", name: "JP Morgan FX Line", counterparty: "JP Morgan Chase", limitType: "fx", limitAmount: 200_000_000, utilized: 140_000_000, available: 60_000_000, utilizationPercent: 70, expiryDate: "2026-12-31", status: "active" },
  { id: "lim-003", name: "Citibank Credit Line", counterparty: "Citibank", limitType: "credit", limitAmount: 450_000_000, utilized: 280_000_000, available: 170_000_000, utilizationPercent: 62, expiryDate: "2026-12-31", status: "active" },
  { id: "lim-004", name: "HSBC Credit Line", counterparty: "HSBC", limitType: "credit", limitAmount: 400_000_000, utilized: 220_000_000, available: 180_000_000, utilizationPercent: 55, expiryDate: "2026-12-31", status: "active" },
  { id: "lim-005", name: "HSBC Derivative Line", counterparty: "HSBC", limitType: "derivative", limitAmount: 100_000_000, utilized: 65_000_000, available: 35_000_000, utilizationPercent: 65, expiryDate: "2026-09-30", status: "active" },
  { id: "lim-006", name: "Bank of America Credit Line", counterparty: "Bank of America", limitType: "credit", limitAmount: 350_000_000, utilized: 190_000_000, available: 160_000_000, utilizationPercent: 54, expiryDate: "2026-12-31", status: "active" },
  { id: "lim-007", name: "Deutsche Bank Credit Line", counterparty: "Deutsche Bank", limitType: "credit", limitAmount: 300_000_000, utilized: 160_000_000, available: 140_000_000, utilizationPercent: 53, expiryDate: "2026-06-30", status: "active" },
  { id: "lim-008", name: "Deutsche Bank FX Line", counterparty: "Deutsche Bank", limitType: "fx", limitAmount: 80_000_000, utilized: 75_000_000, available: 5_000_000, utilizationPercent: 94, expiryDate: "2026-06-30", status: "expiring" },
  { id: "lim-009", name: "Barclays Credit Line", counterparty: "Barclays", limitType: "credit", limitAmount: 250_000_000, utilized: 140_000_000, available: 110_000_000, utilizationPercent: 56, expiryDate: "2026-12-31", status: "active" },
  { id: "lim-010", name: "Standard Chartered Credit Line", counterparty: "Standard Chartered", limitType: "credit", limitAmount: 220_000_000, utilized: 120_000_000, available: 100_000_000, utilizationPercent: 55, expiryDate: "2026-09-30", status: "active" },
  { id: "lim-011", name: "BNP Paribas Credit Line", counterparty: "BNP Paribas", limitType: "credit", limitAmount: 200_000_000, utilized: 110_000_000, available: 90_000_000, utilizationPercent: 55, expiryDate: "2026-12-31", status: "active" },
  { id: "lim-012", name: "UBS Credit Line", counterparty: "UBS", limitType: "credit", limitAmount: 180_000_000, utilized: 100_000_000, available: 80_000_000, utilizationPercent: 56, expiryDate: "2026-12-31", status: "active" },
  { id: "lim-013", name: "Credit Suisse Credit Line", counterparty: "Credit Suisse", limitType: "credit", limitAmount: 150_000_000, utilized: 85_000_000, available: 65_000_000, utilizationPercent: 57, expiryDate: "2026-03-31", status: "expiring" },
  { id: "lim-014", name: "Morgan Stanley Credit Line", counterparty: "Morgan Stanley", limitType: "credit", limitAmount: 175_000_000, utilized: 95_000_000, available: 80_000_000, utilizationPercent: 54, expiryDate: "2026-12-31", status: "active" },
  { id: "lim-015", name: "Goldman Sachs Credit Line", counterparty: "Goldman Sachs", limitType: "credit", limitAmount: 160_000_000, utilized: 90_000_000, available: 70_000_000, utilizationPercent: 56, expiryDate: "2026-11-30", status: "active" },
  { id: "lim-016", name: "Goldman Sachs Derivative Line", counterparty: "Goldman Sachs", limitType: "derivative", limitAmount: 60_000_000, utilized: 38_000_000, available: 22_000_000, utilizationPercent: 63, expiryDate: "2026-11-30", status: "active" },
  { id: "lim-017", name: "Santander Credit Line", counterparty: "Santander", limitType: "credit", limitAmount: 130_000_000, utilized: 70_000_000, available: 60_000_000, utilizationPercent: 54, expiryDate: "2026-08-31", status: "active" },
  { id: "lim-018", name: "First Abu Dhabi Bank Credit Line", counterparty: "First Abu Dhabi Bank", limitType: "credit", limitAmount: 100_000_000, utilized: 55_000_000, available: 45_000_000, utilizationPercent: 55, expiryDate: "2026-12-31", status: "active" },
  { id: "lim-019", name: "Standard Bank Credit Line", counterparty: "Standard Bank South Africa", limitType: "credit", limitAmount: 80_000_000, utilized: 45_000_000, available: 35_000_000, utilizationPercent: 56, expiryDate: "2026-06-30", status: "active" },
  { id: "lim-020", name: "DBS Bank Credit Line", counterparty: "DBS Bank", limitType: "credit", limitAmount: 120_000_000, utilized: 60_000_000, available: 60_000_000, utilizationPercent: 50, expiryDate: "2026-12-31", status: "active" },
  { id: "lim-021", name: "Mitsubishi UFJ Credit Line", counterparty: "Mitsubishi UFJ", limitType: "credit", limitAmount: 140_000_000, utilized: 75_000_000, available: 65_000_000, utilizationPercent: 54, expiryDate: "2026-10-31", status: "active" },
  { id: "lim-022", name: "ICBC Credit Line", counterparty: "ICBC", limitType: "credit", limitAmount: 150_000_000, utilized: 80_000_000, available: 70_000_000, utilizationPercent: 53, expiryDate: "2026-09-30", status: "active" },
  { id: "lim-023", name: "RBC Credit Line", counterparty: "Royal Bank of Canada", limitType: "credit", limitAmount: 125_000_000, utilized: 65_000_000, available: 60_000_000, utilizationPercent: 52, expiryDate: "2026-12-31", status: "active" },
  { id: "lim-024", name: "Commonwealth Bank Credit Line", counterparty: "Commonwealth Bank", limitType: "credit", limitAmount: 100_000_000, utilized: 50_000_000, available: 50_000_000, utilizationPercent: 50, expiryDate: "2026-11-30", status: "active" },
  { id: "lim-025", name: "Citi FX Settlement Line", counterparty: "Citibank", limitType: "settlement", limitAmount: 150_000_000, utilized: 150_000_000, available: 0, utilizationPercent: 100, expiryDate: "2026-12-31", status: "exhausted" },
];

// ---------------------------------------------------------------------------
// RISK BREACHES (30)
// ---------------------------------------------------------------------------
export const MOCK_BREACHES: RiskBreach[] = [
  { id: "br-001", policy: "BRL Net Exposure Limit", description: "BRL net exposure exceeded 30M threshold", severity: "warning", entity: "Perionyx LATAM SA", value: 35_000_000, threshold: 30_000_000, breachedAt: "2026-03-28T14:30:00Z", acknowledged: true, resolved: false, owner: "Luis Fernandez", remediation: "Hedge 5M BRL via NDF" },
  { id: "br-002", policy: "Survival Days Minimum", description: "Africa entity survival days below 90 threshold", severity: "critical", entity: "Perionyx Africa (Pty) Ltd", value: 45, threshold: 90, breachedAt: "2026-03-25T09:15:00Z", acknowledged: true, resolved: false, owner: "James Mwangi", remediation: "Arrange 25M emergency credit facility" },
  { id: "br-003", policy: "Collateralization Ratio", description: "Weighted collateral ratio below 30% minimum", severity: "warning", entity: "Perionyx Global Ltd", value: 28, threshold: 30, breachedAt: "2026-03-20T11:00:00Z", acknowledged: true, resolved: false, owner: "David Kim", remediation: "Post additional 15M collateral to counterparties" },
  { id: "br-004", policy: "ZAR Exposure Limit", description: "ZAR net exposure approaching 50M limit", severity: "info", entity: "Perionyx Africa (Pty) Ltd", value: 45_000_000, threshold: 50_000_000, breachedAt: "2026-03-15T16:45:00Z", acknowledged: true, resolved: true, owner: "James Mwangi", remediation: "Reduce ZAR position via forward contracts" },
  { id: "br-005", policy: "MXN Exposure Limit", description: "MXN exposure exceeded internal warning threshold", severity: "warning", entity: "Perionyx LATAM SA", value: 12_000_000, threshold: 10_000_000, breachedAt: "2026-03-10T08:30:00Z", acknowledged: false, resolved: false, owner: "Luis Fernandez", remediation: "Execute 3M MXN/USD swap" },
  { id: "br-006", policy: "Maximum Tenor for FX Forwards", description: "Forward contract maturity exceeds 365 day limit", severity: "info", entity: "Perionyx Global Ltd", value: 400, threshold: 365, breachedAt: "2026-03-05T13:20:00Z", acknowledged: true, resolved: true, owner: "Sarah Chen", remediation: "Roll forward to shorter tenor" },
  { id: "br-007", policy: "INR Exposure Limit", description: "INR net exposure near 60M limit", severity: "info", entity: "Perionyx India Pvt Ltd", value: 55_000_000, threshold: 60_000_000, breachedAt: "2026-03-01T10:00:00Z", acknowledged: true, resolved: true, owner: "Priya Sharma", remediation: "Maintain current hedge levels" },
  { id: "br-008", policy: "NGN Exposure Limit", description: "NGN exposure breached internal threshold", severity: "critical", entity: "Perionyx Africa (Pty) Ltd", value: 7_000_000, threshold: 5_000_000, breachedAt: "2026-02-25T15:30:00Z", acknowledged: true, resolved: false, owner: "James Mwangi", remediation: "Close NGN position immediately" },
  { id: "br-009", policy: "Counterparty Credit Rating Minimum", description: "Credit Suisse downgrade triggered review", severity: "warning", entity: "Perionyx Global Ltd", value: 2, threshold: 3, breachedAt: "2026-02-20T09:00:00Z", acknowledged: true, resolved: true, owner: "Michael Torres", remediation: "Reduce exposure to Credit Suisse" },
  { id: "br-010", policy: "Single Counterparty Exposure Limit", description: "JP Morgan exposure approaching 500M limit", severity: "info", entity: "Perionyx Global Ltd", value: 470_000_000, threshold: 500_000_000, breachedAt: "2026-02-15T11:45:00Z", acknowledged: true, resolved: true, owner: "Sarah Chen", remediation: "Diversify to other counterparties" },
  { id: "br-011", policy: "Liquidity Coverage Ratio", description: "LATAM liquidity ratio below 150%", severity: "warning", entity: "Perionyx LATAM SA", value: 135, threshold: 150, breachedAt: "2026-02-10T14:00:00Z", acknowledged: false, resolved: false, owner: "Luis Fernandez", remediation: "Draw down 15M from committed credit line" },
  { id: "br-012", policy: "Interest Rate Duration Limit", description: "Portfolio duration exceeded 5 year limit", severity: "warning", entity: "Perionyx US Corp", value: 5.1, threshold: 5.0, breachedAt: "2026-02-05T16:30:00Z", acknowledged: true, resolved: true, owner: "David Kim", remediation: "Reduce duration via interest rate swaps" },
  { id: "br-013", policy: "Minimum Hedge Coverage Ratio", description: "GBP hedge ratio below 50% minimum", severity: "warning", entity: "Perionyx US Corp", value: 40, threshold: 50, breachedAt: "2026-02-01T08:15:00Z", acknowledged: false, resolved: false, owner: "Sarah Chen", remediation: "Execute additional GBP forward contracts" },
  { id: "br-014", policy: "Stress Testing Frequency", description: "Q1 stress test not completed on schedule", severity: "info", entity: "Perionyx Global Ltd", value: 85, threshold: 90, breachedAt: "2026-01-28T10:30:00Z", acknowledged: true, resolved: true, owner: "David Kim", remediation: "Complete stress test by Feb 15" },
  { id: "br-015", policy: "Maximum VaR (95% 1d)", description: "VaR spike during EUR sell-off", severity: "warning", entity: "Perionyx Europe BV", value: 22_000_000, threshold: 25_000_000, breachedAt: "2026-01-25T13:00:00Z", acknowledged: true, resolved: true, owner: "Michael Torres", remediation: "Reduce EUR position by 20M" },
  { id: "br-016", policy: "BRL Net Exposure Limit", description: "BRL exposure exceeded limit again", severity: "emergency", entity: "Perionyx LATAM SA", value: 38_000_000, threshold: 30_000_000, breachedAt: "2026-03-30T07:00:00Z", acknowledged: false, resolved: false, owner: "Luis Fernandez", remediation: "Immediate hedge of 10M BRL" },
  { id: "br-017", policy: "Survival Days Minimum", description: "China entity liquidity deteriorating", severity: "warning", entity: "Perionyx China Ltd", value: 58, threshold: 90, breachedAt: "2026-03-22T12:00:00Z", acknowledged: false, resolved: false, owner: "Wei Zhang", remediation: "Secure 15M additional liquidity facility" },
  { id: "br-018", policy: "Collateralization Ratio", description: "Africa entity collateral ratio critical", severity: "critical", entity: "Perionyx Africa (Pty) Ltd", value: 18, threshold: 30, breachedAt: "2026-03-18T09:45:00Z", acknowledged: true, resolved: false, owner: "James Mwangi", remediation: "Post additional 8M collateral" },
  { id: "br-019", policy: "JPY Exposure Limit", description: "JPY position approaching policy threshold", severity: "info", entity: "Perionyx APAC Pte Ltd", value: 55_000_000, threshold: 60_000_000, breachedAt: "2026-03-12T11:15:00Z", acknowledged: true, resolved: true, owner: "Wei Zhang", remediation: "Partial hedge of 5M JPY" },
  { id: "br-020", policy: "MXN Exposure Limit", description: "MXN spot position exceeded limit", severity: "critical", entity: "Perionyx LATAM SA", value: 15_000_000, threshold: 10_000_000, breachedAt: "2026-03-08T16:00:00Z", acknowledged: false, resolved: false, owner: "Luis Fernandez", remediation: "Immediate MXN sell order" },
  { id: "br-021", policy: "Hedge Effectiveness Minimum", description: "CHF hedge effectiveness below 80%", severity: "warning", entity: "Perionyx Europe BV", value: 72, threshold: 80, breachedAt: "2026-03-05T14:30:00Z", acknowledged: true, resolved: false, owner: "Sarah Chen", remediation: "Restructure CHF hedge portfolio" },
  { id: "br-022", policy: "Liquidity Coverage Ratio", description: "India entity liquidity below threshold", severity: "warning", entity: "Perionyx India Pvt Ltd", value: 55, threshold: 150, breachedAt: "2026-03-02T10:00:00Z", acknowledged: false, resolved: false, owner: "Priya Sharma", remediation: "Arrange 10M emergency funding" },
  { id: "br-023", policy: "Country Risk Composite Threshold", description: "Nigeria composite score exceeded 50", severity: "warning", entity: "Perionyx Africa (Pty) Ltd", value: 70, threshold: 50, breachedAt: "2026-02-28T08:00:00Z", acknowledged: true, resolved: false, owner: "James Mwangi", remediation: "Reduce Nigeria exposure by 50%" },
  { id: "br-024", policy: "Derivative Counterparty Limit", description: "DBS derivative utilization high", severity: "info", entity: "Perionyx APAC Pte Ltd", value: 85_000_000, threshold: 100_000_000, breachedAt: "2026-02-20T15:00:00Z", acknowledged: true, resolved: true, owner: "Wei Zhang", remediation: "Monitor utilization" },
  { id: "br-025", policy: "FX Net Open Position Limit", description: "Net open position approaching threshold", severity: "info", entity: "Perionyx Global Ltd", value: 480_000_000, threshold: 500_000_000, breachedAt: "2026-02-15T11:00:00Z", acknowledged: true, resolved: true, owner: "Sarah Chen", remediation: "Reduce net position" },
  { id: "br-026", policy: "ZAR Exposure Limit", description: "ZAR exposure exceeded 50M limit", severity: "warning", entity: "Perionyx Africa (Pty) Ltd", value: 52_000_000, threshold: 50_000_000, breachedAt: "2026-03-28T13:00:00Z", acknowledged: false, resolved: false, owner: "James Mwangi", remediation: "Hedge 5M ZAR immediately" },
  { id: "br-027", policy: "CNY Exposure Limit", description: "CNY position volatile, near limit", severity: "info", entity: "Perionyx China Ltd", value: 58_000_000, threshold: 60_000_000, breachedAt: "2026-03-20T09:30:00Z", acknowledged: true, resolved: true, owner: "Wei Zhang", remediation: "Maintain current coverage" },
  { id: "br-028", policy: "Total Counterparty Concentration", description: "Banking sector concentration high", severity: "warning", entity: "Perionyx Global Ltd", value: 76, threshold: 80, breachedAt: "2026-03-15T10:45:00Z", acknowledged: true, resolved: true, owner: "Michael Torres", remediation: "Diversify to non-bank counterparties" },
  { id: "br-029", policy: "Single Counterparty Exposure Limit", description: "JP Morgan settlement line exhausted", severity: "critical", entity: "Perionyx US Corp", value: 150_000_000, threshold: 150_000_000, breachedAt: "2026-03-30T18:00:00Z", acknowledged: false, resolved: false, owner: "Sarah Chen", remediation: "Increase settlement limit or reduce volume" },
  { id: "br-030", policy: "Collateralization Ratio", description: "Deutsche Bank collateral call risk", severity: "critical", entity: "Perionyx Europe BV", value: 22, threshold: 30, breachedAt: "2026-03-28T15:30:00Z", acknowledged: true, resolved: false, owner: "David Kim", remediation: "Post 10M additional collateral to Deutsche" },
];

// ---------------------------------------------------------------------------
// VAR CALCULATIONS (20)
// ---------------------------------------------------------------------------
const varDates = [
  "2026-03-31", "2026-03-28", "2026-03-21", "2026-03-14", "2026-03-07",
  "2026-02-28", "2026-02-21", "2026-02-14", "2026-02-07", "2026-01-31",
  "2026-01-24", "2026-01-17", "2026-01-10", "2026-01-03", "2025-12-27",
  "2025-12-20", "2025-12-13", "2025-12-06", "2025-11-29", "2025-11-22",
];

export const MOCK_VAR: VaRCalculation[] = varDates.map((date, i) => {
  const base = 18_500_000 - i * 320_000;
  const portfolio = 2_450_000_000 - i * 45_000_000;
  return {
    id: `var-${String(i + 1).padStart(3, "0")}`,
    date,
    var1d95: base,
    var1d99: Math.round(base * 1.45),
    var10d95: Math.round(base * 3.15),
    var10d99: Math.round(base * 4.55),
    var30d95: Math.round(base * 5.45),
    var30d99: Math.round(base * 7.85),
    historicalVar: Math.round(base * 0.95),
    parametricVar: Math.round(base * 1.05),
    monteCarloVar: Math.round(base * 1.12),
    portfolioValue: portfolio,
    methodology: i % 3 === 0 ? "Historical" : i % 3 === 1 ? "Parametric" : "Monte Carlo",
    confidence: i % 2 === 0 ? "95% / 99%" : "95% / 99%",
  };
});

// ---------------------------------------------------------------------------
// STRESS SCENARIOS (15)
// ---------------------------------------------------------------------------
export const MOCK_STRESS_SCENARIOS: StressScenario[] = [
  {
    id: "st-001", name: "USD 20% Strengthening", type: "fx_shock", description: "USD appreciates 20% against all currencies", severity: "high", probability: 0.08,
    impact: 185_000_000, impactPercent: 7.6, cashImpact: 42_000_000, ebitdaImpact: 28_000_000, liquidityImpact: 65_000_000, debtImpact: 95_000_000,
    covenantBreach: false, survivalMonths: 8, recoveryTime: "6 months",
    affectedEntities: [...MOCK_ENTITIES], affectedCurrencies: ["EUR", "GBP", "JPY", "CHF", "AED", "ZAR", "BRL", "SGD", "INR", "CNY", "AUD"],
  },
  {
    id: "st-002", name: "EUR Sovereign Debt Crisis", type: "fx_shock", description: "EUR depreciates 15% amid sovereign debt concerns", severity: "high", probability: 0.12,
    impact: 140_000_000, impactPercent: 5.7, cashImpact: 35_000_000, ebitdaImpact: 22_000_000, liquidityImpact: 48_000_000, debtImpact: 72_000_000,
    covenantBreach: false, survivalMonths: 9, recoveryTime: "8 months",
    affectedEntities: ["Perionyx Europe BV", "Perionyx Global Ltd", "Perionyx UK plc"], affectedCurrencies: ["EUR"],
  },
  {
    id: "st-003", name: "Global Interest Rate Spike", type: "interest_shock", description: "Global rates increase 200bps across all benchmarks", severity: "high", probability: 0.15,
    impact: 120_000_000, impactPercent: 4.9, cashImpact: 28_000_000, ebitdaImpact: 18_000_000, liquidityImpact: 55_000_000, debtImpact: 85_000_000,
    covenantBreach: false, survivalMonths: 10, recoveryTime: "4 months",
    affectedEntities: [...MOCK_ENTITIES], affectedCurrencies: [...MOCK_CURRENCIES],
  },
  {
    id: "st-004", name: "Liquidity Freeze", type: "liquidity_crisis", description: "Interbank lending freezes for 30 days", severity: "critical", probability: 0.05,
    impact: 280_000_000, impactPercent: 11.4, cashImpact: 85_000_000, ebitdaImpact: 45_000_000, liquidityImpact: 120_000_000, debtImpact: 150_000_000,
    covenantBreach: true, survivalMonths: 3, recoveryTime: "12 months",
    affectedEntities: [...MOCK_ENTITIES], affectedCurrencies: [...MOCK_CURRENCIES],
  },
  {
    id: "st-005", name: "Major Bank Failure", type: "bank_failure", description: "Top 5 counterparty defaults on obligations", severity: "critical", probability: 0.03,
    impact: 350_000_000, impactPercent: 14.3, cashImpact: 95_000_000, ebitdaImpact: 55_000_000, liquidityImpact: 110_000_000, debtImpact: 180_000_000,
    covenantBreach: true, survivalMonths: 2, recoveryTime: "18 months",
    affectedEntities: ["Perionyx Global Ltd", "Perionyx US Corp", "Perionyx Europe BV"], affectedCurrencies: ["USD", "EUR", "GBP"],
  },
  {
    id: "st-006", name: "Iran Sanctions Escalation", type: "country_sanctions", description: "Sanctions extend to UAE and ME operations", severity: "high", probability: 0.10,
    impact: 65_000_000, impactPercent: 2.7, cashImpact: 18_000_000, ebitdaImpact: 12_000_000, liquidityImpact: 25_000_000, debtImpact: 35_000_000,
    covenantBreach: false, survivalMonths: 6, recoveryTime: "9 months",
    affectedEntities: ["Perionyx ME FZCO"], affectedCurrencies: ["AED", "SAR"],
  },
  {
    id: "st-007", name: "Oil Price Spike", type: "commodity_spike", description: "Oil spikes to $150/bbl impacting emerging markets", severity: "medium", probability: 0.18,
    impact: 85_000_000, impactPercent: 3.5, cashImpact: 22_000_000, ebitdaImpact: 15_000_000, liquidityImpact: 30_000_000, debtImpact: 45_000_000,
    covenantBreach: false, survivalMonths: 7, recoveryTime: "6 months",
    affectedEntities: ["Perionyx Africa (Pty) Ltd", "Perionyx LATAM SA", "Perionyx India Pvt Ltd"], affectedCurrencies: ["ZAR", "BRL", "INR"],
  },
  {
    id: "st-008", name: "Global Recession", type: "revenue_decline", description: "Global GDP contracts 3%, revenue declines 20%", severity: "high", probability: 0.20,
    impact: 220_000_000, impactPercent: 9.0, cashImpact: 55_000_000, ebitdaImpact: 40_000_000, liquidityImpact: 80_000_000, debtImpact: 120_000_000,
    covenantBreach: false, survivalMonths: 5, recoveryTime: "12 months",
    affectedEntities: [...MOCK_ENTITIES], affectedCurrencies: [...MOCK_CURRENCIES],
  },
  {
    id: "st-009", name: "Major Customer Default", type: "customer_default", description: "Top 3 customers default on 200M receivables", severity: "high", probability: 0.07,
    impact: 200_000_000, impactPercent: 8.2, cashImpact: 65_000_000, ebitdaImpact: 50_000_000, liquidityImpact: 70_000_000, debtImpact: 90_000_000,
    covenantBreach: true, survivalMonths: 4, recoveryTime: "15 months",
    affectedEntities: ["Perionyx US Corp", "Perionyx Europe BV", "Perionyx Global Ltd"], affectedCurrencies: ["USD", "EUR"],
  },
  {
    id: "st-010", name: "Supply Chain Disruption", type: "supply_disruption", description: "APAC supply chain disruption lasting 90 days", severity: "medium", probability: 0.15,
    impact: 75_000_000, impactPercent: 3.1, cashImpact: 20_000_000, ebitdaImpact: 14_000_000, liquidityImpact: 28_000_000, debtImpact: 38_000_000,
    covenantBreach: false, survivalMonths: 6, recoveryTime: "4 months",
    affectedEntities: ["Perionyx APAC Pte Ltd", "Perionyx China Ltd", "Perionyx India Pvt Ltd"], affectedCurrencies: ["SGD", "CNY", "INR", "JPY"],
  },
  {
    id: "st-011", name: "Pandemic Resurgence", type: "pandemic", description: "New variant causes 6-month global lockdowns", severity: "critical", probability: 0.06,
    impact: 350_000_000, impactPercent: 14.3, cashImpact: 90_000_000, ebitdaImpact: 65_000_000, liquidityImpact: 130_000_000, debtImpact: 170_000_000,
    covenantBreach: true, survivalMonths: 3, recoveryTime: "24 months",
    affectedEntities: [...MOCK_ENTITIES], affectedCurrencies: [...MOCK_CURRENCIES],
  },
  {
    id: "st-012", name: "Emerging Market Currency Crisis", type: "fx_shock", description: "EM currencies depreciate 30% against USD", severity: "high", probability: 0.10,
    impact: 160_000_000, impactPercent: 6.5, cashImpact: 40_000_000, ebitdaImpact: 25_000_000, liquidityImpact: 55_000_000, debtImpact: 80_000_000,
    covenantBreach: false, survivalMonths: 5, recoveryTime: "10 months",
    affectedEntities: ["Perionyx Africa (Pty) Ltd", "Perionyx LATAM SA", "Perionyx India Pvt Ltd", "Perionyx China Ltd"], affectedCurrencies: ["ZAR", "BRL", "INR", "CNY"],
  },
  {
    id: "st-013", name: "Brexit Trade Disruption", type: "country_sanctions", description: "UK-EU trade deal collapses, GBP crashes 10%", severity: "medium", probability: 0.08,
    impact: 55_000_000, impactPercent: 2.2, cashImpact: 15_000_000, ebitdaImpact: 10_000_000, liquidityImpact: 20_000_000, debtImpact: 28_000_000,
    covenantBreach: false, survivalMonths: 9, recoveryTime: "6 months",
    affectedEntities: ["Perionyx UK plc", "Perionyx Europe BV"], affectedCurrencies: ["GBP", "EUR"],
  },
  {
    id: "st-014", name: "Japan Earthquake Crisis", type: "supply_disruption", description: "Major earthquake disrupts Japan operations", severity: "medium", probability: 0.04,
    impact: 45_000_000, impactPercent: 1.8, cashImpact: 12_000_000, ebitdaImpact: 8_000_000, liquidityImpact: 18_000_000, debtImpact: 22_000_000,
    covenantBreach: false, survivalMonths: 7, recoveryTime: "8 months",
    affectedEntities: ["Perionyx APAC Pte Ltd"], affectedCurrencies: ["JPY"],
  },
  {
    id: "st-015", name: "China Real Estate Collapse", type: "revenue_decline", description: "China property market crash impacts counterparties", severity: "high", probability: 0.12,
    impact: 110_000_000, impactPercent: 4.5, cashImpact: 30_000_000, ebitdaImpact: 20_000_000, liquidityImpact: 40_000_000, debtImpact: 55_000_000,
    covenantBreach: false, survivalMonths: 5, recoveryTime: "12 months",
    affectedEntities: ["Perionyx China Ltd", "Perionyx APAC Pte Ltd", "Perionyx Global Ltd"], affectedCurrencies: ["CNY", "USD"],
  },
];

// ---------------------------------------------------------------------------
// HEDGE POSITIONS (40)
// ---------------------------------------------------------------------------
const hedgeTypes: HedgeType[] = ["forward", "forward", "swap", "option", "forward", "option", "swap", "natural", "forward", "swap"];
const hedgeInstruments = [
  "EUR/USD Forward", "GBP/USD Forward", "JPY/USD Forward", "CHF/USD Forward", "AED/USD Forward",
  "ZAR/USD Forward", "BRL/USD Forward", "SGD/USD Forward", "INR/USD Forward", "CNY/USD Forward",
  "AUD/USD Forward", "EUR/USD Swap", "GBP/USD Option", "JPY/USD NDF", "CHF/USD Swap",
  "Natural Hedge - EUR", "Natural Hedge - GBP", "Natural Hedge - JPY", "AUD/USD Swap", "CAD/USD Forward",
];

export const MOCK_HEDGES: HedgePosition[] = Array.from({ length: 40 }, (_, i) => {
  const entity = pick(MOCK_ENTITIES, i);
  const currency = pick(MOCK_CURRENCIES, i * 3);
  const cp = pick(MOCK_COUNTERPARTIES, i * 2 + 1);
  const type = hedgeTypes[i % hedgeTypes.length] as HedgeType;
  const notional = 12_500_000 + i * 1_200_000;
  const hedgeAmt = Math.round(notional * (0.70 + (i % 3) * 0.1));
  const coverage = Math.round((hedgeAmt / notional) * 100);
  const eff = 82 + (i % 7);
  const fv = Math.round(notional * (i % 2 === 0 ? 0.02 : -0.015));
  const mtm = Math.round(fv * (0.8 + (i % 5) * 0.05));
  const months = 3 + (i % 12);
  const monthsStr = months < 10 ? `0${months}` : `${months}`;
  return {
    id: `hedge-${String(i + 1).padStart(3, "0")}`,
    type,
    instrument: pick(hedgeInstruments, i),
    entity,
    currency,
    notionalAmount: notional,
    hedgeAmount: hedgeAmt,
    coveragePercent: coverage,
    effectiveness: eff,
    maturityDate: `2026-${monthsStr}-15`,
    counterparty: cp,
    status: i % 7 === 0 ? "matured" : i % 11 === 0 ? "cancelled" : i % 5 === 0 ? "maturing" : "active",
    fairValue: fv,
    mtmGainLoss: mtm,
  };
});

// ---------------------------------------------------------------------------
// DERIVATIVE POSITIONS (25)
// ---------------------------------------------------------------------------
const derivTypes: DerivativeType[] = ["forward", "futures", "option", "swap", "ndf"];

export const MOCK_DERIVATIVES: DerivativePosition[] = Array.from({ length: 25 }, (_, i) => {
  const entity = pick(MOCK_ENTITIES, i * 2);
  const currency = pick(MOCK_CURRENCIES, i * 3 + 1);
  const cp = pick(MOCK_COUNTERPARTIES, i * 2);
  const type = derivTypes[i % derivTypes.length];
  const notional = 8_000_000 + i * 950_000;
  const strike = 1.05 + (i % 9) * 0.04;
  const premium = Math.round(notional * 0.015);
  const fv = Math.round(notional * (i % 3 === 0 ? 0.025 : -0.012));
  const mtm = Math.round(fv * 1.1);
  return {
    id: `deriv-${String(i + 1).padStart(3, "0")}`,
    type,
    instrument: `${currency}/USD ${type === "option" ? "Option" : type === "swap" ? "Swap" : type === "futures" ? "Futures" : type === "ndf" ? "NDF" : "Forward"}`,
    entity,
    currency,
    counterparty: cp,
    notional,
    strike: Math.round(strike * 10000) / 10000,
    maturityDate: `2026-${String(6 + (i % 6)).padStart(2, "0")}-15`,
    premium,
    fairValue: fv,
    mtmPnl: mtm,
    purpose: i % 5 === 0 ? "trading" : "hedging",
    status: i % 8 === 0 ? "expired" : i % 12 === 0 ? "exercised" : i % 6 === 0 ? "cancelled" : "active",
  };
});

// ---------------------------------------------------------------------------
// FORWARD CONTRACTS (20)
// ---------------------------------------------------------------------------
const directions: RiskDirection[] = ["long", "short", "flat"];

export const MOCK_FORWARDS: ForwardContract[] = Array.from({ length: 20 }, (_, i) => {
  const cp = pick(MOCK_COUNTERPARTIES, i * 3);
  const currency = pick(MOCK_CURRENCIES, i * 2 + 2);
  const notional = 5_000_000 + i * 750_000;
  const spot = MOCK_FX_RATES[currency] ?? 1.0;
  const forwardPct = 0.98 + (i % 5) * 0.01;
  const forward = Math.round(spot * forwardPct * 10000) / 10000;
  const pnl = Math.round(notional * (i % 2 === 0 ? 0.01 : -0.008));
  return {
    id: `fwd-${String(i + 1).padStart(3, "0")}`,
    counterparty: cp,
    currency,
    direction: pick(directions, i) as RiskDirection,
    notional,
    forwardRate: forward,
    spotRate: Math.round(spot * 10000) / 10000,
    valuationDate: "2026-03-31",
    maturityDate: `2026-${String(4 + (i % 9)).padStart(2, "0")}-15`,
    pnl,
    hedgeRelation: `Hedge-${pick(MOCK_ENTITIES, i).split(" ")[1]}`,
    status: i % 6 === 0 ? "matured" : "active",
  };
});

// ---------------------------------------------------------------------------
// SWAP POSITIONS (12)
// ---------------------------------------------------------------------------
const swapTypes: ("irs" | "ccs" | "cirs")[] = ["irs", "irs", "ccs", "cirs", "ccs", "irs"];
const floatingRates = ["SOFR", "EURIBOR 3M", "SONIA", "SARON", "SORA", "BBSW", "MIBOR", "CDI"];

export const MOCK_SWAPS: SwapPosition[] = Array.from({ length: 12 }, (_, i) => {
  const entity = pick(MOCK_ENTITIES, i * 2);
  const cp = pick(MOCK_COUNTERPARTIES, i * 2 + 1);
  const currency = pick(MOCK_CURRENCIES, i * 3);
  const notional = 15_000_000 + i * 2_500_000;
  const fixedRate = 3.25 + (i % 8) * 0.35;
  return {
    id: `swap-${String(i + 1).padStart(3, "0")}`,
    type: swapTypes[i % swapTypes.length],
    entity,
    counterparty: cp,
    currency,
    notional,
    fixedRate: Math.round(fixedRate * 100) / 100,
    floatingRate: pick(floatingRates, i),
    maturityDate: `2027-${String(3 + (i % 10)).padStart(2, "0")}-15`,
    fairValue: Math.round(notional * (i % 2 === 0 ? 0.018 : -0.012)),
    status: "active",
  };
});

// ---------------------------------------------------------------------------
// OPTION POSITIONS (15)
// ---------------------------------------------------------------------------
export const MOCK_OPTIONS: OptionPosition[] = Array.from({ length: 15 }, (_, i) => {
  const entity = pick(MOCK_ENTITIES, i * 3 + 1);
  const currency = pick(MOCK_CURRENCIES, i * 2);
  const cp = pick(MOCK_COUNTERPARTIES, i * 2 + 2);
  const optionType: OptionType = i % 2 === 0 ? "call" : "put";
  const style = i % 3 === 0 ? "american" : "european";
  const spot = MOCK_FX_RATES[currency] ?? 1.0;
  const notional = 4_000_000 + i * 800_000;
  const strikeAdj = optionType === "call" ? 1.02 + (i % 5) * 0.02 : 0.95 - (i % 5) * 0.02;
  const strike = Math.round(spot * strikeAdj * 10000) / 10000;
  const premium = Math.round(notional * 0.025);
  const delta = optionType === "call" ? 0.45 + (i % 4) * 0.05 : -0.35 - (i % 4) * 0.05;
  const gamma = 0.03 + (i % 5) * 0.005;
  const vega = 0.12 + (i % 4) * 0.02;
  const theta = -(0.02 + (i % 4) * 0.005);
  return {
    id: `opt-${String(i + 1).padStart(3, "0")}`,
    optionType,
    style,
    entity,
    currency,
    counterparty: cp,
    notional,
    strike,
    spot: Math.round(spot * 10000) / 10000,
    premium,
    maturityDate: `2026-${String(5 + (i % 8)).padStart(2, "0")}-${String(10 + (i % 19)).padStart(2, "0")}`,
    delta: Math.round(delta * 1000) / 1000,
    gamma: Math.round(gamma * 1000) / 1000,
    vega: Math.round(vega * 1000) / 1000,
    theta: Math.round(theta * 1000) / 1000,
    mtmValue: Math.round(premium * (0.8 + (i % 4) * 0.1)),
    status: "active",
  };
});

// ---------------------------------------------------------------------------
// TREASURY RISK ALERTS (20)
// ---------------------------------------------------------------------------
const alertCategories = [
  "FX", "FX", "interest_rate", "liquidity", "counterparty", "country", "VaR", "policy",
  "concentration", "hedge", "derivative", "compliance",
];

export const MOCK_ALERTS: TreasuryRiskAlert[] = [
  { id: "alert-001", category: "FX", severity: "warning", title: "ZAR Exposure Approaching Limit", message: "ZAR net exposure at 45M against 50M policy limit", entity: "Perionyx Africa (Pty) Ltd", source: "Policy Engine", owner: "James Mwangi", suggestedAction: "Hedge 5M ZAR via forward contract", timestamp: "2026-03-30T08:15:00Z", acknowledged: false },
  { id: "alert-002", category: "FX", severity: "critical", title: "BRL Exposure Limit Breached", message: "BRL net exposure at 35M, exceeding 30M policy limit by 16.7%", entity: "Perionyx LATAM SA", source: "Policy Engine", owner: "Luis Fernandez", suggestedAction: "Immediate BRL hedge of 10M via NDF", timestamp: "2026-03-29T14:30:00Z", acknowledged: false },
  { id: "alert-003", category: "liquidity", severity: "critical", title: "Critical Liquidity Position - Africa", message: "Africa entity survival days at 45, well below 90-day minimum", entity: "Perionyx Africa (Pty) Ltd", source: "Liquidity Monitor", owner: "James Mwangi", suggestedAction: "Secure 25M emergency credit facility", timestamp: "2026-03-28T09:00:00Z", acknowledged: true },
  { id: "alert-004", category: "counterparty", severity: "warning", title: "Credit Suisse Downgrade Risk", message: "Credit Suisse risk score at 45, health status critical", entity: "Perionyx Global Ltd", source: "Credit Monitor", owner: "Michael Torres", suggestedAction: "Reduce exposure and request additional collateral", timestamp: "2026-03-27T11:45:00Z", acknowledged: true },
  { id: "alert-005", category: "FX", severity: "info", title: "GBP Position Unfavorable Move", message: "GBP weakened 2.3% this week impacting EUR/GBP cross", entity: "Perionyx UK plc", source: "Market Data", owner: "Sarah Chen", suggestedAction: "Review GBP hedge coverage ratio", timestamp: "2026-03-26T16:00:00Z", acknowledged: true },
  { id: "alert-006", category: "interest_rate", severity: "warning", title: "SOFR Rate Spike Detected", message: "SOFR increased 15bps in 24 hours", entity: "Perionyx US Corp", source: "Rate Monitor", owner: "David Kim", suggestedAction: "Evaluate floating rate exposure impact", timestamp: "2026-03-25T07:30:00Z", acknowledged: false },
  { id: "alert-007", category: "liquidity", severity: "warning", title: "LATAM Liquidity Deteriorating", message: "BRL liquidity coverage ratio at 135%, below 150% threshold", entity: "Perionyx LATAM SA", source: "Liquidity Monitor", owner: "Luis Fernandez", suggestedAction: "Draw down 15M from committed credit line", timestamp: "2026-03-24T10:15:00Z", acknowledged: false },
  { id: "alert-008", category: "counterparty", severity: "warning", title: "Deutsche Bank Limit Utilization High", message: "FX line utilization at 94%, nearing exhaustion", entity: "Perionyx Europe BV", source: "Limit Monitor", owner: "Michael Torres", suggestedAction: "Reduce FX volume or negotiate limit increase", timestamp: "2026-03-23T14:00:00Z", acknowledged: false },
  { id: "alert-009", category: "VaR", severity: "info", title: "VaR Increase Detected", message: "1d95 VaR increased 8% week-over-week to 19.8M", entity: "Perionyx Global Ltd", source: "Risk Engine", owner: "Michael Torres", suggestedAction: "Review portfolio risk composition", timestamp: "2026-03-22T09:30:00Z", acknowledged: true },
  { id: "alert-010", category: "FX", severity: "warning", title: "INR Volatility Alert", message: "INR implied volatility increased 12% this week", entity: "Perionyx India Pvt Ltd", source: "Market Data", owner: "Priya Sharma", suggestedAction: "Consider hedging additional INR exposure", timestamp: "2026-03-21T11:00:00Z", acknowledged: false },
  { id: "alert-011", category: "policy", severity: "critical", title: "Multiple Policy Breaches - Africa", message: "3 active policy breaches across Africa entity", entity: "Perionyx Africa (Pty) Ltd", source: "Policy Engine", owner: "James Mwangi", suggestedAction: "Escalate to regional treasurer", timestamp: "2026-03-20T08:00:00Z", acknowledged: true },
  { id: "alert-012", category: "concentration", severity: "warning", title: "Banking Sector Concentration", message: "Banking counterparty concentration at 76% of total exposure", entity: "Perionyx Global Ltd", source: "Risk Engine", owner: "Michael Torres", suggestedAction: "Diversify to non-bank financial institutions", timestamp: "2026-03-19T15:30:00Z", acknowledged: true },
  { id: "alert-013", category: "hedge", severity: "info", title: "CHF Hedge Effectiveness Below Target", message: "CHF hedge effectiveness at 72%, below 80% minimum", entity: "Perionyx Europe BV", source: "Hedge Monitor", owner: "Sarah Chen", suggestedAction: "Restructure CHF hedge portfolio", timestamp: "2026-03-18T10:45:00Z", acknowledged: false },
  { id: "alert-014", category: "FX", severity: "warning", title: "CNY Depreciation Pressure", message: "CNY depreciated 1.5% following trade data release", entity: "Perionyx China Ltd", source: "Market Data", owner: "Wei Zhang", suggestedAction: "Increase CNY hedge ratio", timestamp: "2026-03-17T13:00:00Z", acknowledged: false },
  { id: "alert-015", category: "liquidity", severity: "warning", title: "India Entity Liquidity Alert", message: "Survival days at 48, approaching critical threshold", entity: "Perionyx India Pvt Ltd", source: "Liquidity Monitor", owner: "Priya Sharma", suggestedAction: "Arrange 10M emergency funding facility", timestamp: "2026-03-16T09:15:00Z", acknowledged: false },
  { id: "alert-016", category: "counterparty", severity: "info", title: "Citi Settlement Line Exhausted", message: "Citibank FX settlement line at 100% utilization", entity: "Perionyx US Corp", source: "Limit Monitor", owner: "Sarah Chen", suggestedAction: "Request settlement line increase or reduce volume", timestamp: "2026-03-15T14:30:00Z", acknowledged: false },
  { id: "alert-017", category: "FX", severity: "warning", title: "MXN Position Exceeded Limit", message: "MXN spot position at 15M, exceeded 10M limit", entity: "Perionyx LATAM SA", source: "Policy Engine", owner: "Luis Fernandez", suggestedAction: "Immediate MXN sell order of 6M", timestamp: "2026-03-14T11:00:00Z", acknowledged: false },
  { id: "alert-018", category: "country", severity: "warning", title: "Nigeria Risk Score Deteriorating", message: "Nigeria composite risk score at 70, trend deteriorating", entity: "Perionyx Africa (Pty) Ltd", source: "Country Risk Monitor", owner: "James Mwangi", suggestedAction: "Review Nigeria exposure and reduce by 50%", timestamp: "2026-03-13T08:30:00Z", acknowledged: true },
  { id: "alert-019", category: "policy", severity: "info", title: "Policy Review Required - Collateral Ratio", message: "Collateralization ratio at 28%, approaching 30% minimum", entity: "Perionyx Global Ltd", source: "Policy Engine", owner: "David Kim", suggestedAction: "Post additional 15M collateral to counterparties", timestamp: "2026-03-12T16:00:00Z", acknowledged: true },
  { id: "alert-020", category: "FX", severity: "info", title: "EUR/USD Year-end Forecast Updated", message: "Year-end EUR/USD forecast revised to 1.12 from 1.08", entity: "Perionyx Global Ltd", source: "Research", owner: "Sarah Chen", suggestedAction: "Update FX budget rates for Q3-Q4", timestamp: "2026-03-11T10:00:00Z", acknowledged: true },
];

// ---------------------------------------------------------------------------
// RISK RECOMMENDATIONS (25)
// ---------------------------------------------------------------------------
export const MOCK_RECOMMENDATIONS: RiskRecommendation[] = [
  { id: "rec-001", title: "Hedge 10M BRL Exposure", description: "Execute 10M BRL/USD NDF to bring BRL within policy limits", impact: 1_200_000, impactLabel: "Loss avoidance", priority: "critical", category: "FX", entity: "Perionyx LATAM SA", roi: "8:1" },
  { id: "rec-002", title: "Secure Africa Credit Facility", description: "Arrange 25M emergency credit facility for Africa entity", impact: 3_500_000, impactLabel: "Liquidity preservation", priority: "critical", category: "liquidity", entity: "Perionyx Africa (Pty) Ltd", roi: "12:1" },
  { id: "rec-003", title: "Reduce Credit Suisse Exposure", description: "Reduce Credit Suisse counterparty exposure from 85M to 50M", impact: 2_800_000, impactLabel: "Risk reduction", priority: "high", category: "counterparty", entity: "Perionyx Global Ltd", roi: "5:1" },
  { id: "rec-004", title: "Increase ZAR Hedge Ratio", description: "Execute 5M ZAR/USD forward to bring hedge ratio to 50%", impact: 850_000, impactLabel: "Loss avoidance", priority: "high", category: "FX", entity: "Perionyx Africa (Pty) Ltd", roi: "6:1" },
  { id: "rec-005", title: "Diversify Counterparty Concentration", description: "Add 2 new non-bank counterparties to reduce banking concentration", impact: 1_500_000, impactLabel: "Risk diversification", priority: "high", category: "concentration", entity: "Perionyx Global Ltd", roi: "3:1" },
  { id: "rec-006", title: "Restructure CHF Hedge Portfolio", description: "Replace maturing CHF forwards with options for better effectiveness", impact: 950_000, impactLabel: "Improved hedge effectiveness", priority: "medium", category: "hedge", entity: "Perionyx Europe BV", roi: "7:1" },
  { id: "rec-007", title: "Post Additional Collateral", description: "Post 15M additional collateral to JP Morgan and Deutsche Bank", impact: 1_100_000, impactLabel: "Avoid margin call", priority: "high", category: "counterparty", entity: "Perionyx Global Ltd", roi: "4:1" },
  { id: "rec-008", title: "Extend India Liquidity Facility", description: "Secure 10M committed credit line for India entity", impact: 2_000_000, impactLabel: "Liquidity preservation", priority: "high", category: "liquidity", entity: "Perionyx India Pvt Ltd", roi: "9:1" },
  { id: "rec-009", title: "Optimize EUR/USD Hedge Roll", description: "Roll maturing EUR forwards at favorable rates, lock in 2.1M gain", impact: 2_100_000, impactLabel: "Realized gain", priority: "medium", category: "FX", entity: "Perionyx Europe BV", roi: "15:1" },
  { id: "rec-010", title: "Reduce Nigeria Country Exposure", description: "Wind down 50% of Nigeria-related positions over 60 days", impact: 1_800_000, impactLabel: "Risk reduction", priority: "high", category: "country", entity: "Perionyx Africa (Pty) Ltd", roi: "10:1" },
  { id: "rec-011", title: "Implement MXN Hedge Program", description: "Establish regular MXN hedging program to prevent limit breaches", impact: 650_000, impactLabel: "Loss avoidance", priority: "medium", category: "FX", entity: "Perionyx LATAM SA", roi: "5:1" },
  { id: "rec-012", title: "Negotiate Citi Settlement Line Increase", description: "Increase Citibank settlement line from 150M to 200M", impact: 750_000, impactLabel: "Operational flexibility", priority: "medium", category: "counterparty", entity: "Perionyx US Corp", roi: "2:1" },
  { id: "rec-013", title: "Review Global Duration Positioning", description: "Reduce portfolio duration from 4.2 to 3.5 years using IRS", impact: 3_200_000, impactLabel: "Rate shock protection", priority: "high", category: "interest_rate", entity: "Perionyx Global Ltd", roi: "8:1" },
  { id: "rec-014", title: "Add CNY Hedge Coverage", description: "Increase CNY hedge ratio from 40% to 60% given depreciation risk", impact: 1_400_000, impactLabel: "Loss avoidance", priority: "medium", category: "FX", entity: "Perionyx China Ltd", roi: "6:1" },
  { id: "rec-015", title: "Conduct Q2 Stress Tests Early", description: "Complete Q2 stress scenarios by Apr 15, ahead of schedule", impact: 400_000, impactLabel: "Regulatory compliance", priority: "low", category: "compliance", entity: "Perionyx Global Ltd", roi: "1:1" },
  { id: "rec-016", title: "Hedge INR Receivables", description: "Cover 8M INR receivables with 3-month forward contracts", impact: 520_000, impactLabel: "Cash flow protection", priority: "medium", category: "FX", entity: "Perionyx India Pvt Ltd", roi: "4:1" },
  { id: "rec-017", title: "Establish APAC Regional Treasury", description: "Centralize APAC FX risk management in Singapore hub", impact: 4_500_000, impactLabel: "Operational efficiency", priority: "low", category: "FX", entity: "Perionyx APAC Pte Ltd", roi: "20:1" },
  { id: "rec-018", title: "Renew Deutsche Bank Credit Line", description: "Renew expiring 300M credit line with Deutsche Bank before Jun 30", impact: 1_000_000, impactLabel: "Credit availability", priority: "high", category: "counterparty", entity: "Perionyx Europe BV", roi: "3:1" },
  { id: "rec-019", title: "Monitor Japan Earthquake Risk", description: "Purchase earthquake contingency FX options for JPY exposure", impact: 350_000, impactLabel: "Event protection", priority: "low", category: "FX", entity: "Perionyx APAC Pte Ltd", roi: "2:1" },
  { id: "rec-020", title: "Implement Automated Policy Monitoring", description: "Deploy real-time policy breach detection across all entities", impact: 2_500_000, impactLabel: "Breach prevention", priority: "medium", category: "policy", entity: "Perionyx Global Ltd", roi: "10:1" },
  { id: "rec-021", title: "Close NGN Position", description: "Close remaining 7M NGN position due to liquidity constraints", impact: 420_000, impactLabel: "Loss avoidance", priority: "critical", category: "FX", entity: "Perionyx Africa (Pty) Ltd", roi: "7:1" },
  { id: "rec-022", title: "Review Counterparty Netting Agreements", description: "Extend netting agreements to 3 additional counterparties", impact: 1_800_000, impactLabel: "Credit line optimization", priority: "medium", category: "counterparty", entity: "Perionyx Global Ltd", roi: "6:1" },
  { id: "rec-023", title: "Increase AUD Hedge Ratio", description: "Boost AUD hedge coverage from 70% to 85% given commodity exposure", impact: 680_000, impactLabel: "Loss avoidance", priority: "low", category: "FX", entity: "Perionyx Oceania Pty Ltd", roi: "5:1" },
  { id: "rec-024", title: "Q3 FX Budget Rate Setting", description: "Set Q3 budget rates based on updated forward curves", impact: 950_000, impactLabel: "Budget certainty", priority: "low", category: "FX", entity: "Perionyx Global Ltd", roi: "3:1" },
  { id: "rec-025", title: "Standard Bank Limit Review", description: "Review and potentially increase Standard Bank credit line from 80M to 100M", impact: 550_000, impactLabel: "Operational flexibility", priority: "low", category: "counterparty", entity: "Perionyx Africa (Pty) Ltd", roi: "2:1" },
];

// ---------------------------------------------------------------------------
// EXECUTIVE INSIGHTS (10)
// ---------------------------------------------------------------------------
export const MOCK_INSIGHTS: ExecutiveInsight[] = [
  { label: "Net FX Exposure", value: "$985M", description: "Net FX exposure decreased 3.2% this month driven by EUR/USD hedge roll", entity: "Perionyx Global Ltd", severity: "positive" },
  { label: "VaR (95% 1d)", value: "$18.5M", description: "VaR within policy limit of $25M but increased 8% WoW due to EM volatility", entity: "Perionyx Global Ltd", severity: "warning" },
  { label: "Policy Breaches", value: "7 Active", description: "3 critical breaches requiring immediate attention across Africa and LATAM", entity: "Perionyx Global Ltd", severity: "critical" },
  { label: "Hedge Coverage Ratio", value: "52%", description: "Overall hedge ratio stable, but ZAR and BRL coverage below 30% policy minimum", entity: "Perionyx Global Ltd", severity: "warning" },
  { label: "Liquidity Position", value: "45 Days", description: "Africa entity survival days at critical level, 25M emergency facility being arranged", entity: "Perionyx Africa (Pty) Ltd", severity: "critical" },
  { label: "Counterparty Health", value: "16/20 Healthy", description: "Credit Suisse on critical watch, Deutsche Bank and BNP on watch list", entity: "Perionyx Global Ltd", severity: "warning" },
  { label: "Country Risk Composite", value: "48/100", description: "Nigeria and South Africa deteriorating; UAE and India improving", entity: "Perionyx Global Ltd", severity: "warning" },
  { label: "Interest Rate Exposure", value: "$1.8B", description: "58% floating rate exposure subject to SOFR/EURIBOR increases", entity: "Perionyx Global Ltd", severity: "warning" },
  { label: "Stress Test Results", value: "3 Failures", description: "Bank failure, liquidity freeze, and pandemic scenarios show covenant breaches", entity: "Perionyx Global Ltd", severity: "critical" },
  { label: "Open Hedge Positions", value: "32 Active", description: "85% hedge effectiveness average, 3 positions below 80% minimum threshold", entity: "Perionyx Global Ltd", severity: "positive" },
];

// ---------------------------------------------------------------------------
// RISK METRICS
// ---------------------------------------------------------------------------
export const MOCK_METRICS: RiskMetrics = {
  totalExposure: 2_450_000_000,
  netFXExposure: 985_000_000,
  grossFXExposure: 1_620_000_000,
  interestExposure: 1_810_000_000,
  liquidityRisk: 340_000_000,
  counterpartyRisk: 2_450_000_000,
  countryRisk: 3_360_000_000,
  concentrationRisk: 1_850_000_000,
  var1d95: 18_500_000,
  var1d99: 26_800_000,
  policyBreaches: 7,
  hedgeRatio: 52,
  overallRiskScore: 42,
  openHedges: 32,
  counterparties: 20,
  countries: 18,
  policies: 20,
  stressScenarios: 15,
  alerts: 12,
  trend: "up",
  lastUpdated: "2026-03-31T23:59:59Z",
};

// ---------------------------------------------------------------------------
// TREND DATA — 8 keys × 12 months
// ---------------------------------------------------------------------------
const monthLabels = [
  "Apr 2025", "May 2025", "Jun 2025", "Jul 2025", "Aug 2025", "Sep 2025",
  "Oct 2025", "Nov 2025", "Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026",
];

const monthDates = [
  "2025-04-01", "2025-05-01", "2025-06-01", "2025-07-01", "2025-08-01", "2025-09-01",
  "2025-10-01", "2025-11-01", "2025-12-01", "2026-01-01", "2026-02-01", "2026-03-01",
];

function trendPoints(values: number[]): TrendPoint[] {
  return values.map((v, i) => ({ date: monthDates[i], value: v, label: monthLabels[i] }));
}

export const MOCK_TREND_DATA: Record<string, TrendPoint[]> = {
  riskTrend: trendPoints([38, 39, 37, 36, 38, 40, 42, 41, 39, 40, 41, 42]),
  fxDistribution: trendPoints([920, 940, 910, 890, 915, 950, 970, 955, 940, 960, 975, 985]),
  countryExposure: trendPoints([3100, 3150, 3080, 3050, 3120, 3200, 3260, 3220, 3180, 3250, 3320, 3360]),
  counterpartyExposure: trendPoints([2250, 2280, 2220, 2190, 2240, 2300, 2350, 2320, 2290, 2340, 2400, 2450]),
  hedgeCoverage: trendPoints([48, 49, 48, 47, 49, 50, 51, 50, 49, 51, 52, 52]),
  riskScore: trendPoints([36, 37, 35, 34, 36, 38, 40, 39, 37, 39, 40, 42]),
  policyBreach: trendPoints([3, 4, 3, 2, 3, 5, 6, 5, 4, 5, 6, 7]),
  varTrend: trendPoints([15.2, 15.8, 15.1, 14.6, 15.4, 16.2, 17.0, 16.5, 15.8, 16.8, 17.6, 18.5]),
};

// ---------------------------------------------------------------------------
// ANALYTICS SERIES (5)
// ---------------------------------------------------------------------------
export const MOCK_ANALYTICS_SERIES: AnalyticsSeries[] = [
  {
    name: "Risk Trend",
    data: trendPoints([38, 39, 37, 36, 38, 40, 42, 41, 39, 40, 41, 42]),
    color: "#D4AF37",
  },
  {
    name: "FX Exposure (USD M)",
    data: trendPoints([920, 940, 910, 890, 915, 950, 970, 955, 940, 960, 975, 985]),
    color: "#4A90D9",
  },
  {
    name: "Country Exposure (USD M)",
    data: trendPoints([3100, 3150, 3080, 3050, 3120, 3200, 3260, 3220, 3180, 3250, 3320, 3360]),
    color: "#7B61FF",
  },
  {
    name: "Hedge Coverage %",
    data: trendPoints([48, 49, 48, 47, 49, 50, 51, 50, 49, 51, 52, 52]),
    color: "#50C878",
  },
  {
    name: "VaR 95% 1d (USD M)",
    data: trendPoints([15.2, 15.8, 15.1, 14.6, 15.4, 16.2, 17.0, 16.5, 15.8, 16.8, 17.6, 18.5]),
    color: "#FF6B6B",
  },
];
