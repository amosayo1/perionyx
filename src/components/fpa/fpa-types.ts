import type {
  BudgetPlan, PlanningKPI, PlanningAlert, PlanningRecommendation,
  ExecutivePlanningSummary, AggregatePlanningMetrics, Forecast,
  Scenario, ScenarioAssumption, ScenarioComparison, DriverDefinition, WorkforcePlan,
  RevenuePlan, ExpensePlan, CapitalPlan, CashPlan, VarianceAnalysisRecord,
  WhatIfAnalysis, StrategicPlan, DriverImpactReport,
} from "@/server/fpa/types";

export interface FPAExecutiveHeaderProps { summary: ExecutivePlanningSummary; }
export interface FPAKPIDashboardProps { metrics: PlanningKPI[]; }
export interface FPABudgetBoardProps { plans: BudgetPlan[]; }
export interface FPAForecastDashboardProps { forecasts: Forecast[]; }
export interface FPARollingForecastProps { forecasts: Forecast[]; }
export interface FPAScenarioBoardProps { scenarios: Scenario[]; comparisons: ScenarioComparison[]; }
export interface FPADriverPlanningProps { drivers: DriverDefinition[]; }
export interface FPARevenuePlanningProps { revenues: RevenuePlan[]; }
export interface FPAExpensePlanningProps { expenses: ExpensePlan[]; }
export interface FPACapitalPlanningProps { capitals: CapitalPlan[]; }
export interface FPAWorkforcePlanningProps { workforces: WorkforcePlan[]; }
export interface FPACashPlanningProps { cashPlans: CashPlan[]; }
export interface FPAVarianceAnalysisProps { variances: VarianceAnalysisRecord[]; }
export interface FPAWhatIfAnalysisProps { analyses: WhatIfAnalysis[]; }
export interface FPAStrategicPlanningProps { strategies: StrategicPlan[]; }
export interface FPAnalyticsDashboardProps { metrics: PlanningKPI[]; aggregates: AggregatePlanningMetrics; }
export interface FPARecommendationsPanelProps { recommendations: PlanningRecommendation[]; }
export interface FPAAlertsPanelProps { alerts: PlanningAlert[]; }
export interface FPAExecutiveInsightsProps { summary: ExecutivePlanningSummary; insights: { summary: string; highlights: string[]; risks: string[]; actions: string[] }; }
