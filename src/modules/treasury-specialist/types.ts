// ─────────────────────────────────────────────────────────────
// Enterprise Treasury Specialist — Type Definitions
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";

// ─── Cash Types ──────────────────────────────────────────────

export type CashClassification =
  | "operating"
  | "restricted"
  | "in_transit"
  | "sweep"
  | "reserve";

export type CashRegion =
  | "north_america"
  | "europe"
  | "asia_pacific"
  | "latin_america"
  | "middle_east"
  | "africa";

// ─── Liquidity Types ─────────────────────────────────────────

export type LiquidityHorizon =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "annual";

export type ScenarioType = "best" | "expected" | "worst" | "custom";

// ─── FX Types ────────────────────────────────────────────────

export type HedgeInstrument =
  | "forward"
  | "option"
  | "swap"
  | "cross_currency_swap"
  | "natural";

export type FXRecommendationType =
  | "hedge"
  | "increase_hedge"
  | "reduce_hedge"
  | "hold"
  | "no_action";

// ─── Bank Types ──────────────────────────────────────────────

export type BankRelationshipType =
  | "primary"
  | "secondary"
  | "cash_management"
  | "payroll"
  | "trade_finance";

export type BankConnectionStatus = "active" | "inactive" | "error" | "pending";

// ─── Debt Types ──────────────────────────────────────────────

export type DebtInstrumentType =
  | "term_loan"
  | "revolver"
  | "credit_facility"
  | "bond"
  | "commercial_paper"
  | "supplier_credit";

export type RateType = "fixed" | "variable" | "hybrid";

export type CovenantStatus = "compliant" | "warning" | "breach";

// ─── Investment Types ────────────────────────────────────────

export type InvestmentType =
  | "treasury_bill"
  | "certificate_of_deposit"
  | "commercial_paper"
  | "money_market"
  | "bond"
  | "repo";

export type LiquidityClassification =
  | "immediate"
  | "1_7_days"
  | "8_30_days"
  | "31_90_days"
  | "90_plus_days";

// ─── Risk Types ──────────────────────────────────────────────

export type TreasuryRiskType =
  | "liquidity"
  | "fx"
  | "counterparty"
  | "interest_rate"
  | "settlement"
  | "operational"
  | "concentration";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type RiskTrend = "improving" | "stable" | "deteriorating";

// ─── Recommendation Types ────────────────────────────────────

export type RecommendationCategory =
  | "cash"
  | "liquidity"
  | "fx"
  | "debt"
  | "investment"
  | "risk"
  | "policy"
  | "operations";

export type RecommendationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "implementing"
  | "completed";

export type RecommendationPriority = "low" | "medium" | "high" | "urgent";

// ─── Briefing Types ──────────────────────────────────────────

export type BriefingType = "morning" | "daily" | "weekly" | "ad-hoc";

// ─── Alert Types ─────────────────────────────────────────────

export type AlertType =
  | "cash"
  | "liquidity"
  | "fx"
  | "debt"
  | "investment"
  | "risk"
  | "bank"
  | "policy";

export type AlertSeverity = "info" | "warning" | "critical";

export type AlertStatus = "active" | "acknowledged" | "resolved" | "escalated";

// ─── Dashboard Interfaces ────────────────────────────────────

export interface TreasuryDashboardData {
  cashPosition: CashPositionSummary;
  liquidity: LiquiditySummary;
  fxExposure: FXExposureSummary;
  debtOverview: DebtOverviewSummary;
  investmentOverview: InvestmentOverviewSummary;
  risks: RiskSummary;
  alerts: AlertSummary;
  recentBriefings: BriefingRecord[];
  recommendations: RecommendationSummary;
  healthScore: Prisma.Decimal;
}

export interface CashPositionSummary {
  totalGlobalCash: Prisma.Decimal;
  availableCash: Prisma.Decimal;
  restrictedCash: Prisma.Decimal;
  inTransitFunds: Prisma.Decimal;
  cashByCompany: Record<string, Prisma.Decimal>;
  cashByBank: Record<string, Prisma.Decimal>;
  cashByCurrency: Record<string, Prisma.Decimal>;
  cashByRegion: Record<string, Prisma.Decimal>;
  concentrationScore: Prisma.Decimal;
  healthScore: Prisma.Decimal;
}

export interface LiquiditySummary {
  currentLiquidity: Prisma.Decimal;
  forecastLiquidity: Prisma.Decimal;
  burnRate: Prisma.Decimal;
  daysOfRunway: number;
  workingCapital: Prisma.Decimal;
  liquidityScore: Prisma.Decimal;
  riskScore: Prisma.Decimal;
}

export interface FXExposureSummary {
  totalExposure: Prisma.Decimal;
  netOpenPosition: Prisma.Decimal;
  hedgedExposure: Prisma.Decimal;
  unhedgedExposure: Prisma.Decimal;
  exposureByCurrency: Record<string, Prisma.Decimal>;
  exposureByRegion: Record<string, Prisma.Decimal>;
  concentrationScore: Prisma.Decimal;
  riskScore: Prisma.Decimal;
}

export interface DebtOverviewSummary {
  totalOutstanding: Prisma.Decimal;
  totalUtilization: Prisma.Decimal;
  averageHealthScore: Prisma.Decimal;
  covenantsInWarning: number;
  covenantsInBreach: number;
  upcomingMaturities: MaturityEntry[];
}

export interface InvestmentOverviewSummary {
  totalCurrentValue: Prisma.Decimal;
  totalAllocated: Prisma.Decimal;
  availableForInvestment: Prisma.Decimal;
  portfolioAllocation: Record<string, Prisma.Decimal>;
  liquidityClassification: Record<string, Prisma.Decimal>;
  averageHealthScore: Prisma.Decimal;
}

export interface RiskSummary {
  totalRisks: number;
  risksByType: Record<TreasuryRiskType, number>;
  risksByLevel: Record<string, number>;
  overallRiskScore: Prisma.Decimal;
  riskTrend: RiskTrend;
}

export interface AlertRecord {
  id: string;
  alertType: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  status: AlertStatus;
}

export interface AlertSummary {
  totalActive: number;
  bySeverity: Record<AlertSeverity, number>;
  byType: Record<AlertType, number>;
  criticalAlerts: AlertRecord[];
}

export interface BriefingRecord {
  id: string;
  briefingDate: string;
  briefingType: string;
  highlights: string[];
  actionItems: string[];
}

export interface RecommendationSummary {
  totalPending: number;
  totalAccepted: number;
  totalImplementing: number;
  totalCompleted: number;
  byCategory: Record<RecommendationCategory, number>;
  byPriority: Record<string, number>;
}

export interface MaturityEntry {
  id: string;
  instrumentType: string;
  lenderName?: string;
  issuer?: string;
  outstandingBalance: Prisma.Decimal;
  maturityDate: Date;
  daysToMaturity: number;
}

// ─── Input Types ─────────────────────────────────────────────

export interface GetCashPositionInput {
  legalEntityId?: string;
  region?: CashRegion;
  currency?: string;
  classification?: CashClassification;
}

export interface GetLiquidityForecastInput {
  horizon?: LiquidityHorizon;
  scenario?: ScenarioType;
  legalEntityId?: string;
}

export interface GetFXExposureInput {
  sourceCurrency?: string;
  targetCurrency?: string;
  hedgeStatus?: string;
  legalEntityId?: string;
}

export interface GetBankRelationshipsInput {
  relationshipType?: BankRelationshipType;
  connectionStatus?: BankConnectionStatus;
  minHealthScore?: number;
}

export interface GetDebtInstrumentsInput {
  instrumentType?: DebtInstrumentType;
  rateType?: RateType;
  maturingBefore?: Date;
  healthScoreBelow?: number;
}

export interface GetInvestmentHoldingsInput {
  instrumentType?: InvestmentType;
  liquidityClassification?: LiquidityClassification;
  counterparty?: string;
  maturingBefore?: Date;
}

export interface GetTreasuryRisksInput {
  riskType?: TreasuryRiskType;
  riskLevel?: RiskLevel;
  status?: string;
  trend?: RiskTrend;
}

export interface GetRecommendationsInput {
  category?: RecommendationCategory;
  status?: RecommendationStatus;
  priority?: RecommendationPriority;
  riskLevel?: RiskLevel;
  limit?: number;
  offset?: number;
}

export interface GetBriefingsInput {
  briefingType?: BriefingType;
  from?: Date;
  to?: Date;
  limit?: number;
}

export interface GetAlertsInput {
  alertType?: AlertType;
  severity?: AlertSeverity;
  status?: AlertStatus;
  limit?: number;
  offset?: number;
}

export interface GetAnalyticsInput {
  riskType?: TreasuryRiskType;
  from?: Date;
  to?: Date;
  horizon?: LiquidityHorizon;
}

export interface GenerateBriefingInput {
  briefingType: BriefingType;
  title?: string;
  includeSections?: string[];
  metadata?: Record<string, unknown>;
}

export interface CreateRecommendationInput {
  category: RecommendationCategory;
  title: string;
  description: string;
  businessReason: string;
  confidence: Prisma.Decimal;
  riskLevel: RiskLevel;
  supportingEvidence: string[];
  affectedModules: string[];
  requiredApprovals: string[];
  priority?: RecommendationPriority;
}

export interface UpdateRecommendationInput {
  status?: RecommendationStatus;
  priority?: RecommendationPriority;
  metadata?: Record<string, unknown>;
}
