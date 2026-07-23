import type {
  RiskKPI,
  RiskForecast,
  RiskInsight,
  EnterpriseRisk,
  RiskCategory,
} from "../types";

export class AnalyticsService {
  private kpis = new Map<string, RiskKPI>();
  private forecasts = new Map<string, RiskForecast>();
  private insights: RiskInsight[] = [];

  addKPI(kpi: RiskKPI): void {
    this.kpis.set(kpi.id, kpi);
  }

  getKPI(id: string): RiskKPI | undefined {
    return this.kpis.get(id);
  }

  getAllKPIs(): RiskKPI[] {
    return [...this.kpis.values()];
  }

  getKPIsByCategory(category: RiskCategory): RiskKPI[] {
    return this.getAllKPIs().filter((k) => k.category === category);
  }

  addForecast(forecast: RiskForecast): void {
    this.forecasts.set(forecast.id, forecast);
  }

  getForecast(id: string): RiskForecast | undefined {
    return this.forecasts.get(id);
  }

  getAllForecasts(): RiskForecast[] {
    return [...this.forecasts.values()];
  }

  getForecastsByCategory(category: RiskCategory): RiskForecast[] {
    return this.getAllForecasts().filter((f) => f.category === category);
  }

  addInsight(insight: RiskInsight): void {
    this.insights.push(insight);
  }

  getAllInsights(): RiskInsight[] {
    return this.insights;
  }

  getEarlyWarningInsights(): RiskInsight[] {
    return this.insights.filter((i) => i.type === "early-warning");
  }

  computeEnterpriseRiskScore(risks: EnterpriseRisk[]): number {
    if (risks.length === 0) return 0;
    const totalScore = risks.reduce((sum, r) => sum + r.score.weightedScore, 0);
    return totalScore / risks.length;
  }

  computeOpenRiskCount(risks: EnterpriseRisk[]): number {
    return risks.filter(
      (r) => r.status !== "closed" && r.status !== "historical",
    ).length;
  }

  computeCriticalRiskCount(risks: EnterpriseRisk[]): number {
    return risks.filter((r) => r.priority === "critical").length;
  }

  computeAverageRating(risks: EnterpriseRisk[]): number {
    if (risks.length === 0) return 0;
    return (
      risks.reduce((sum, r) => sum + r.score.weightedScore, 0) / risks.length
    );
  }

  computeRiskAppetiteUtilization(risks: EnterpriseRisk[]): number {
    const count = risks.filter(
      (r) => r.score.riskAppetitePercent > 100,
    ).length;
    return risks.length > 0 ? (count / risks.length) * 100 : 0;
  }

  computeExposureByCategory(
    risks: EnterpriseRisk[],
  ): Record<RiskCategory, number> {
    const result = {} as Record<RiskCategory, number>;
    for (const r of risks) {
      const cat = r.category;
      result[cat] = (result[cat] ?? 0) + r.score.weightedScore;
    }
    return result;
  }

  computeResidualRisk(risks: EnterpriseRisk[]): number {
    const open = risks.filter((r) => r.status !== "closed");
    if (open.length === 0) return 0;
    return (
      open.reduce((sum, r) => sum + r.score.residualRisk, 0) / open.length
    );
  }

  computeTrend(
    current: number,
    previous: number,
  ): "improving" | "deteriorating" | "stable" {
    if (current < previous) return "improving";
    if (current > previous) return "deteriorating";
    return "stable";
  }
}
