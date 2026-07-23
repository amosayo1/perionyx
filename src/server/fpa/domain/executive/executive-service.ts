import type { FPAAlert, AlertSeverity, RecommendationType } from "../../types";

interface FPAExecutiveSummary {
  netRevenue: number; grossProfit: number; grossMargin: number;
  operatingIncome: number; ebitda: number; netIncome: number;
  cashFlow: number; workingCapital: number; totalBudget: number;
  totalForecast: number; budgetUtilization: number; forecastAccuracy: number;
  revenueGrowth: number; kpiCount: number; alertCount: number;
  scorecardScore: number; period: string; generatedAt: Date;
}

interface FPARecommendation {
  id: string; type: string; title: string; description: string;
  impact: string; status: string; effort: string;
  estimatedSavings?: number; companyId: string; createdAt: Date;
}

export class ExecutiveService {
  computeRevenueGrowth(currentRevenue: number, previousRevenue: number): number {
    return previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  }

  computeBudgetUtilization(totalBudget: number, totalActual: number): number {
    return totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;
  }

  computeForecastAccuracy(forecastValue: number, actualValue: number): number {
    return forecastValue > 0 ? 100 - Math.abs((actualValue - forecastValue) / forecastValue) * 100 : 0;
  }

  computeExpenseRatio(totalExpenses: number, totalRevenue: number): number {
    return totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;
  }

  generateScorecardScore(kpis: Array<{ status: "good" | "warning" | "critical" }>): { score: number; maxScore: number; percentage: number } {
    const maxScore = kpis.length * 100;
    const score = kpis.reduce((acc, kpi) => {
      if (kpi.status === "good") return acc + 100;
      if (kpi.status === "warning") return acc + 50;
      return acc + 0;
    }, 0);
    return {
      score,
      maxScore,
      percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
    };
  }

  generateExecutiveSummary(params: {
    netRevenue: number;
    grossProfit: number;
    operatingIncome: number;
    ebitda: number;
    netIncome: number;
    cashFlow: number;
    workingCapital: number;
    totalBudget: number;
    totalForecast: number;
    kpiCount: number;
    alertCount: number;
    scorecardScore: number;
    period: string;
  }): FPAExecutiveSummary {
    const grossMargin = params.netRevenue > 0 ? ((params.grossProfit / params.netRevenue) * 100) : 0;
    const budgetUtilization = params.totalBudget > 0 ? (params.totalForecast / params.totalBudget) * 100 : 0;
    return {
      netRevenue: params.netRevenue,
      grossProfit: params.grossProfit,
      grossMargin: Math.round(grossMargin * 100) / 100,
      operatingIncome: params.operatingIncome,
      ebitda: params.ebitda,
      netIncome: params.netIncome,
      cashFlow: params.cashFlow,
      workingCapital: params.workingCapital,
      totalBudget: params.totalBudget,
      totalForecast: params.totalForecast,
      budgetUtilization: Math.round(budgetUtilization * 100) / 100,
      forecastAccuracy: 0,
      revenueGrowth: 0,
      kpiCount: params.kpiCount,
      alertCount: params.alertCount,
      scorecardScore: params.scorecardScore,
      period: params.period,
      generatedAt: new Date(),
    };
  }

  generateAlerts(
    variances: Array<{ severity: "low" | "medium" | "high" | "critical"; accountName?: string; period: string; absoluteVariance: number }>,
    companyId: string,
  ): FPAAlert[] {
    return variances
      .filter((v) => v.severity === "high" || v.severity === "critical")
      .map((v, i) => ({
        id: `alert_exec_${Date.now()}_${i}`,
        severity: v.severity === "critical" ? "critical" as AlertSeverity : "warning" as AlertSeverity,
        type: "variance" as const,
        title: `${v.severity === "critical" ? "Critical" : "High"} Variance Detected`,
        message: `${v.accountName ?? "Account"} has a variance of ${Math.abs(v.absoluteVariance).toLocaleString()} in period ${v.period}`,
        dismissed: false,
        isRead: false,
        isResolved: false,
        companyId,
        createdAt: new Date(),
      }));
  }

  generateRecommendations(
    variances: Array<{ severity: string; accountName?: string; absoluteVariance: number; direction: string }>,
    companyId: string,
    period: string,
  ): FPARecommendation[] {
    return variances
      .filter((v) => v.severity === "high" || v.severity === "critical")
      .map((v, i) => ({
        id: `rec_exec_${Date.now()}_${i}`,
        type: "expense" as RecommendationType,
        title: `Review ${v.accountName ?? "Account"} Variance`,
        description: `Investigate ${v.direction} variance of ${Math.abs(v.absoluteVariance).toLocaleString()} in ${v.accountName ?? "unknown account"}`,
        impact: v.direction === "unfavorable" ? "Margin erosion risk" : "Potential savings opportunity",
        status: "active" as const,
        effort: "medium" as const,
        estimatedSavings: undefined,
        companyId,
        createdAt: new Date(),
      }));
  }
}
