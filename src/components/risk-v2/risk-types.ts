import type {
  RiskRegister as ServerRiskRegister,
  RiskAssessment as ServerRiskAssessment,
  RiskResponse as ServerRiskResponse,
  RiskControl as ServerRiskControl,
  RiskEvent as ServerRiskEvent,
  RiskIndicator as ServerRiskIndicator,
  RiskReport as ServerRiskReport,
  RiskScenario as ServerRiskScenario,
  RiskHeatmap as ServerRiskHeatmap,
  RiskKPIItem as ServerRiskKPIItem,
  RiskAlert as ServerRiskAlert,
  RiskRecommendation as ServerRiskRecommendation,
  RiskCategory,
  RiskLevel,
  RiskStatus,
  RiskResponseStrategy,
  ControlType,
  ControlEffectiveness,
  KRIStatus,
} from "../../server/risk/types";

export type {
  RiskCategory,
  RiskLevel,
  RiskStatus,
  RiskResponseStrategy,
  ControlType,
  ControlEffectiveness,
  KRIStatus,
};

export type RiskRegister = ServerRiskRegister;
export type RiskAssessment = ServerRiskAssessment;
export type RiskResponse = ServerRiskResponse;
export type RiskControl = ServerRiskControl;
export type RiskEvent = ServerRiskEvent;
export type RiskIndicator = ServerRiskIndicator;
export type RiskReport = ServerRiskReport;
export type RiskScenario = ServerRiskScenario;
export type RiskHeatmap = ServerRiskHeatmap;
export type RiskKPIItem = ServerRiskKPIItem;
export type RiskAlert = ServerRiskAlert;
export type RiskRecommendation = ServerRiskRecommendation;

export interface RiskOverviewMetrics {
  totalRisks: number;
  openRisks: number;
  criticalRisks: number;
  highRisks: number;
  totalControls: number;
  ineffectiveControls: number;
  totalIncidents: number;
  openIncidents: number;
  totalAssessments: number;
  totalScenarios: number;
  kriBreaches: number;
}
