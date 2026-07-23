import type {
  BudgetPlan, Forecast, VarianceAnalysisRecord, PlanningAlert,
  AggregatePlanningMetrics, ExecutivePlanningSummary, ScenarioComparison,
} from "../../types";

export class AnalyticsService {
  private metrics = new Map<string, any>();

  addMetric(id: string, metric: any): void { this.metrics.set(id, metric); }

  getMetric(id: string): any | undefined { return this.metrics.get(id); }

  getAllMetrics(): any[] { return Array.from(this.metrics.values()); }

  getByCategory(category: string): any[] { return this.getAllMetrics().filter((m) => m.category === category); }

  getByStatus(status: string): any[] { return this.getAllMetrics().filter((m) => m.status === status); }

  calculateAggregateMetrics(
    plans: BudgetPlan[], forecasts: Forecast[], scenarios: any[], capitals: any[],
    workforce: any[], whatIfs: any[], strategies: any[]
  ): AggregatePlanningMetrics {
    return {
      totalPlans: plans.length,
      activePlans: plans.filter((p) => p.status === "approved" || p.status === "review").length,
      approvedPlans: plans.filter((p) => p.status === "approved").length,
      totalRevenueBudget: plans.reduce((s, p) => s + p.totalRevenue, 0),
      totalExpenseBudget: plans.reduce((s, p) => s + p.totalExpenses, 0),
      totalCapitalBudget: plans.reduce((s, p) => s + p.totalCapital, 0),
      totalForecasts: forecasts.length,
      activeForecasts: forecasts.filter((f) => f.status === "approved" || f.status === "review").length,
      totalScenarios: scenarios.length,
      totalWhatIfAnalyses: whatIfs.length,
      totalWorkforcePlanned: workforce.reduce((s: number, w: any) => s + (w.headcountPlanned || 0), 0),
      totalCapitalProjects: capitals.length,
      totalStrategicPlans: strategies.length,
      budgetVariancePercent: 0,
      forecastAccuracyPercent: 0,
      planningCycleDays: 0,
      scenarioCoverage: 0,
    };
  }

  calculateExecutiveSummary(
    plans: BudgetPlan[], forecasts: Forecast[], scenarios: any[], capitals: any[],
    variances: VarianceAnalysisRecord[], alerts: PlanningAlert[]
  ): ExecutivePlanningSummary {
    const activePlan = plans.find((p) => p.status === "approved" || p.status === "review");
    const latestForecast = forecasts[forecasts.length - 1];
    return {
      activePlanLabel: activePlan?.label ?? "",
      totalRevenueBudget: plans.reduce((s, p) => s + p.totalRevenue, 0),
      totalExpenseBudget: plans.reduce((s, p) => s + p.totalExpenses, 0),
      budgetNetIncome: plans.reduce((s, p) => s + p.netIncome, 0),
      totalCapitalBudget: plans.reduce((s, p) => s + p.totalCapital, 0),
      totalCashForecast: forecasts.reduce((s, f) => s + f.totalCashFlow, 0),
      totalHeadcountPlanned: plans.reduce((s, p) => s + p.headcount, 0),
      revenueForecast: forecasts.reduce((s, f) => s + f.totalRevenue, 0),
      expenseForecast: forecasts.reduce((s, f) => s + f.totalExpenses, 0),
      forecastNetIncome: forecasts.reduce((s, f) => s + f.netIncome, 0),
      budgetVariance: variances.reduce((s, v) => s + v.variance, 0),
      budgetVariancePercent: 0,
      forecastConfidence: latestForecast?.confidenceLevel ?? 0,
      activeScenarios: 0,
      pendingApprovals: plans.filter((p) => p.status === "review").length,
      varianceSignificant: variances.filter((v) => v.isSignificant).length,
      openAlerts: alerts.filter((a) => !a.isResolved).length,
      capitalsProjectsActive: 0,
      strategicPlansActive: 0,
    };
  }

  calculateScenarioComparisons(scenarios: any[]): ScenarioComparison[] {
    const base = scenarios.find((s: any) => s.scenarioType === "base");
    return scenarios.map((s: any) => {
      return {
        scenarioId: s.id,
        scenarioName: s.name,
        scenarioType: s.scenarioType,
        revenue: s.totalRevenue,
        expenses: s.totalExpenses,
        netIncome: s.netIncome,
        capital: s.totalCapital,
        cashFlow: s.totalCashFlow,
        varianceFromBase: base ? s.netIncome - base.netIncome : 0,
        variancePercentFromBase: base && base.netIncome !== 0
          ? ((s.netIncome - base.netIncome) / Math.abs(base.netIncome)) * 100 : 0,
        riskLevel: s.riskLevel ?? "medium",
        probability: s.probability ?? 0,
      };
    });
  }

  private alerts = new Map<string, any>();
  private recommendations = new Map<string, any>();
  private trends = new Map<string, any>();
  private revisions = new Map<string, any>();

  addAlert(alert: any): void { this.alerts.set(alert.id, alert); }
  getAllAlerts(): any[] { return Array.from(this.alerts.values()); }
  addRecommendation(r: any): void { this.recommendations.set(r.id, r); }
  getAllRecommendations(): any[] { return Array.from(this.recommendations.values()); }
  addTrend(t: any): void { this.trends.set(t.id, t); }
  getAllTrends(): any[] { return Array.from(this.trends.values()); }
  addRevision(r: any): void { this.revisions.set(r.id, r); }

  count(): number { return this.metrics.size; }

  update(id: string, updates: any): any | undefined {
    const existing = this.metrics.get(id); if (!existing) return undefined;
    const updated = { ...existing, ...updates };
    this.metrics.set(id, updated); return updated;
  }

  delete(id: string): boolean { return this.metrics.delete(id); }
}
