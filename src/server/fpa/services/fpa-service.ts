import { BudgetsService } from "../domain/budgets/budgets-service";
import { BudgetingService } from "../domain/budgeting/budgeting-service";
import { PlanningService } from "../domain/planning/planning-service";
import { ForecastService } from "../domain/forecast/forecast-service";
import { RollingForecastService } from "../domain/rolling-forecast/rolling-forecast-service";
import { VarianceService } from "../domain/variance/variance-service";
import { ScenarioService } from "../domain/scenario/scenario-service";
import { RevenuePlanningService as RevenueService } from "../domain/revenue/revenue-service";
import { ExpensePlanningService as ExpenseService } from "../domain/expense/expense-service";
import { WorkforceService } from "../domain/workforce/workforce-service";
import { CapitalPlanningService as CapitalService } from "../domain/capital/capital-service";
import { CostCenterService } from "../domain/cost-centers/cost-centers-service";
import { ProfitCenterService } from "../domain/profit-centers/profit-centers-service";
import { FPAAllocationService } from "../domain/allocation/allocation-service";
import { FPAScorecardService } from "../domain/kpis/kpis-service";
import { AnalyticsService } from "../domain/analytics/analytics-service";
import { AlertsService } from "../domain/alerts/alerts-service";
import { RecommendationsService } from "../domain/recommendations/recommendations-service";
import { ExecutiveService } from "../domain/executive/executive-service";
import { DriverBasedPlanningService } from "../domain/driver-based-planning/driver-based-planning-service";
import { ScenarioPlanningService } from "../domain/scenario-planning/scenario-planning-service";
import { CashPlanningService } from "../domain/cash-planning/cash-planning-service";
import { VarianceAnalysisService } from "../domain/variance-analysis/variance-analysis-service";
import { CapitalPlanningService as CapitalPlanningDomainService } from "../domain/capital-planning/capital-planning-service";
import { WorkforcePlanningService } from "../domain/workforce-planning/workforce-planning-service";
import { RevenuePlanningService as RevenuePlanningDomainService } from "../domain/revenue-planning/revenue-planning-service";
import { ExpensePlanningService as ExpensePlanningDomainService } from "../domain/expense-planning/expense-planning-service";
import { WhatIfAnalysisService } from "../domain/what-if-analysis/what-if-analysis-service";
import type { ExecutivePlanningSummary, AggregatePlanningMetrics, PlanningKPI } from "../types";

export class FPAService {
  budgets: BudgetsService
  budgeting: BudgetingService
  planning: PlanningService
  forecast: ForecastService
  rollingForecast: RollingForecastService
  variance: VarianceService
  scenario: ScenarioService
  revenue: RevenueService
  expense: ExpenseService
  workforce: WorkforceService
  capital: CapitalService
  costCenters: CostCenterService
  profitCenters: ProfitCenterService
  allocation: FPAAllocationService
  scorecards: FPAScorecardService
  analytics: AnalyticsService
  alerts: AlertsService
  recommendations: RecommendationsService
  executive: ExecutiveService
  driverBasedPlanning: DriverBasedPlanningService
  scenarioPlanning: ScenarioPlanningService
  cashPlanning: CashPlanningService
  varianceAnalysis: VarianceAnalysisService
  capitalPlanning: CapitalPlanningDomainService
  workforcePlanning: WorkforcePlanningService
  revenuePlanning: RevenuePlanningDomainService
  expensePlanning: ExpensePlanningDomainService
  whatIfAnalysis: WhatIfAnalysisService

  constructor() {
    this.budgets = new BudgetsService()
    this.budgeting = new BudgetingService()
    this.planning = new PlanningService()
    this.forecast = new ForecastService()
    this.rollingForecast = new RollingForecastService()
    this.variance = new VarianceService()
    this.scenario = new ScenarioService()
    this.revenue = new RevenueService()
    this.expense = new ExpenseService()
    this.workforce = new WorkforceService()
    this.capital = new CapitalService()
    this.costCenters = new CostCenterService()
    this.profitCenters = new ProfitCenterService()
    this.allocation = new FPAAllocationService()
    this.scorecards = new FPAScorecardService()
    this.analytics = new AnalyticsService()
    this.alerts = new AlertsService()
    this.recommendations = new RecommendationsService()
    this.executive = new ExecutiveService()
    this.driverBasedPlanning = new DriverBasedPlanningService()
    this.scenarioPlanning = new ScenarioPlanningService()
    this.cashPlanning = new CashPlanningService()
    this.varianceAnalysis = new VarianceAnalysisService()
    this.capitalPlanning = new CapitalPlanningDomainService()
    this.workforcePlanning = new WorkforcePlanningService()
    this.revenuePlanning = new RevenuePlanningDomainService()
    this.expensePlanning = new ExpensePlanningDomainService()
    this.whatIfAnalysis = new WhatIfAnalysisService()
  }

  getExecutiveSummary(): ExecutivePlanningSummary {
    const budgets = this.budgets.getAllBudgets()
    const forecasts = this.forecast.getAllForecasts()
    const scenarios = this.scenario.getAllScenarios()
    const profitCenters = this.profitCenters.getAllProfitCenters()
    const alerts = this.alerts.getAll()
    const scorecards = this.scorecards.getAllScorecards()
    const variances = this.variance.getAllVariances()
    const capitalPlans = this.capital.getAllPlans()
    const allPlans = this.planning.getAllPlans()

    const netRevenue = profitCenters.reduce((s, pc) => s + pc.revenue, 0)
    const totalCost = profitCenters.reduce((s, pc) => s + pc.cost, 0)
    const netIncome = netRevenue - totalCost
    const cashFlow = netRevenue - totalCost - totalCost * 0.15
    const totalBudget = budgets.reduce((s, b) => s + b.totalAmount, 0)
    const totalForecast = forecasts.reduce((s, f) => s + f.totalAmount, 0)
    const budgetVariance = totalBudget - totalForecast
    const budgetVariancePercent = totalBudget > 0 ? (budgetVariance / totalBudget) * 100 : 0
    const forecastConfidence = forecasts.length > 0
      ? forecasts.reduce((s, f) => s + f.confidence, 0) / forecasts.length
      : 0
    const significantVariances = variances.filter(v => v.severity === "high" || v.severity === "critical").length
    const avgScorecardScore = scorecards.length > 0
      ? scorecards.reduce((s, sc) => s + sc.percentage, 0) / scorecards.length
      : 0

    return {
      activePlanLabel: `FY${new Date().getFullYear()} Plan`,
      totalRevenueBudget: totalBudget,
      totalExpenseBudget: totalCost,
      budgetNetIncome: netIncome,
      totalCapitalBudget: totalBudget,
      totalCashForecast: cashFlow,
      totalHeadcountPlanned: 0,
      revenueForecast: netRevenue,
      expenseForecast: totalCost,
      forecastNetIncome: netIncome,
      budgetVariance,
      budgetVariancePercent: Math.round(budgetVariancePercent * 100) / 100,
      forecastConfidence: Math.round(forecastConfidence * 100) / 100,
      activeScenarios: scenarios.filter(s => s.status === "active").length,
      pendingApprovals: 0,
      varianceSignificant: significantVariances,
      openAlerts: alerts.length,
      capitalsProjectsActive: capitalPlans.filter(p => p.status === "inProgress").length,
      strategicPlansActive: allPlans.filter(p => p.status === "active" || p.status === "locked").length,
    }
  }

  getAggregateMetrics(): AggregatePlanningMetrics {
    const budgets = this.budgets.getAllBudgets()
    const forecasts = this.forecast.getAllForecasts()
    const scenarios = this.scenario.getAllScenarios()
    const capitalPlans = this.capital.getAllPlans()
    const workforcePlans = this.workforce.getAllPlans()

    return {
      totalPlans: budgets.length + forecasts.length,
      activePlans: budgets.filter(b => b.status === "active").length + forecasts.filter(f => f.status !== "archived").length,
      approvedPlans: budgets.filter(b => b.status === "locked").length,
      totalRevenueBudget: budgets.reduce((s, b) => s + b.totalAmount, 0),
      totalExpenseBudget: budgets.reduce((s, b) => s + b.totalAmount, 0),
      totalCapitalBudget: capitalPlans.reduce((s, c) => s + c.totalBudget, 0),
      totalForecasts: forecasts.length,
      activeForecasts: forecasts.filter(f => f.status !== "archived").length,
      totalScenarios: scenarios.length,
      totalWhatIfAnalyses: 0,
      totalWorkforcePlanned: workforcePlans.reduce((s, w) => s + w.totalCompensation, 0),
      totalCapitalProjects: capitalPlans.length,
      totalStrategicPlans: 0,
      budgetVariancePercent: 0,
      forecastAccuracyPercent: 0,
      planningCycleDays: 0,
      scenarioCoverage: 0,
    }
  }

  getAllKPIs(): PlanningKPI[] {
    const budgets = this.budgets.getAllBudgets()
    const forecasts = this.forecast.getAllForecasts()
    const variances = this.variance.getAllVariances()
    const scenarios = this.scenario.getAllScenarios()
    const allKpis = this.scorecards.getAllKPIs()
    const workforcePlans = this.workforce.getAllPlans()
    const totalBudget = budgets.reduce((s, b) => s + b.totalAmount, 0)
    const totalForecast = forecasts.reduce((s, f) => s + f.totalAmount, 0)
    const budgetUtilization = totalBudget > 0 ? (totalForecast / totalBudget) * 100 : 0
    const forecastItems = forecasts.flatMap(f => f.items)
    const actualsSum = forecastItems.reduce((s, i) => s + (i.actualAmount ?? 0), 0)
    const forecastSum = forecastItems.reduce((s, i) => s + (i.forecastAmount ?? 0), 0)
    const forecastAccuracy = forecastSum > 0 ? 100 - Math.abs((actualsSum - forecastSum) / forecastSum) * 100 : 0

    return [
      { id: "kpi-1", name: "Budget Utilization", value: Math.round(budgetUtilization * 10) / 10, target: 100, unit: "%", trend: budgetUtilization <= 100 ? "improving" : "worsening", category: "budget", status: budgetUtilization <= 100 ? "onTrack" : "atRisk", companyId: "" },
      { id: "kpi-2", name: "Forecast Accuracy", value: Math.round(forecastAccuracy * 10) / 10, target: 90, unit: "%", trend: forecastAccuracy >= 80 ? "improving" : "worsening", category: "forecast", status: forecastAccuracy >= 80 ? "onTrack" : forecastAccuracy >= 60 ? "atRisk" : "critical", companyId: "" },
      { id: "kpi-3", name: "Total Budgets", value: budgets.length, target: 0, unit: "", trend: "stable", category: "budget", status: budgets.length > 0 ? "onTrack" : "critical", companyId: "" },
      { id: "kpi-4", name: "Total Forecasts", value: forecasts.length, target: 0, unit: "", trend: "stable", category: "forecast", status: forecasts.length > 0 ? "onTrack" : "critical", companyId: "" },
      { id: "kpi-5", name: "Total Variances", value: variances.length, target: 0, unit: "", trend: variances.length > 10 ? "worsening" : "stable", category: "variance", status: variances.length > 10 ? "atRisk" : "onTrack", companyId: "" },
      { id: "kpi-6", name: "Total Scenarios", value: scenarios.length, target: 0, unit: "", trend: "stable", category: "budget", status: scenarios.length > 0 ? "onTrack" : "atRisk", companyId: "" },
      { id: "kpi-7", name: "Workforce Headcount", value: workforcePlans.length, target: 0, unit: "", trend: "stable", category: "workforce", status: "onTrack", companyId: "" },
      { id: "kpi-8", name: "Total KPIs Tracked", value: allKpis.length, target: 0, unit: "", trend: "stable", category: "budget", status: "onTrack", companyId: "" },
    ]
  }

  getTotalBudgets(): number { return this.budgets.count() }
  getTotalForecasts(): number { return this.forecast.count() }
  getTotalVariances(): number { return this.variance.count() }
  getTotalScenarios(): number { return this.scenario.count() }
  getTotalKPIs(): number { return this.scorecards.getAllKPIs().length }
  getTotalAlerts(): number { return this.alerts.getAll().length }
}

export const fpaService = new FPAService()
