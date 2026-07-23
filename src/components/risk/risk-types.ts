import type {
  EnterpriseRisk, RiskCategory, RiskStatus, RiskKPI, Alert,
  Recommendation, PolicyViolation, Control, Limit, Escalation,
  StressTest, Scenario, HistoricalLossEvent, RiskForecast, RiskInsight,
  Counterparty, BusinessUnit, Entity, RiskScore, HeatLevel, Priority,
  Likelihood, Impact, RiskLevel,
  MarketRiskData, FXRiskData, InterestRateRiskData,
  CreditRiskData, CounterpartyRiskData, CountryRiskData, ConcentrationRiskData,
  LiquidityRiskData, OperationalRiskData,
} from "../../server/risk/types";

export interface RiskFilterState {
  category: RiskCategory | "all";
  status: RiskStatus | "all";
  priority: Priority | "all";
  heatLevel: HeatLevel | "all";
  search: string;
  owner: string;
  businessUnit: string;
  region: string;
}

export const defaultRiskFilter: RiskFilterState = {
  category: "all",
  status: "all",
  priority: "all",
  heatLevel: "all",
  search: "",
  owner: "",
  businessUnit: "",
  region: "",
};

export interface RiskOverviewMetrics {
  totalRisks: number;
  openRisks: number;
  criticalRisks: number;
  enterpriseRiskScore: number;
  residualRisk: number;
  riskTrend: "improving" | "deteriorating" | "stable";
  openAlerts: number;
  activeViolations: number;
  breachedLimits: number;
  overdueReviews: number;
}

export type {
  EnterpriseRisk, RiskCategory, RiskStatus, RiskKPI, Alert,
  Recommendation, PolicyViolation, Control, Limit, Escalation,
  StressTest, Scenario, HistoricalLossEvent, RiskForecast, RiskInsight,
  Counterparty, BusinessUnit, Entity, RiskScore, HeatLevel, Priority,
  Likelihood, Impact, RiskLevel,
  MarketRiskData, FXRiskData, InterestRateRiskData,
  CreditRiskData, CounterpartyRiskData, CountryRiskData, ConcentrationRiskData,
  LiquidityRiskData, OperationalRiskData,
};