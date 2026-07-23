import type { ExecutivePlanningSummary, BudgetPlan, Forecast, VarianceAnalysisRecord, PlanningKPI } from "../../types";

export class ExecutiveInsightsService {
  generateInsights(
    summary: ExecutivePlanningSummary, plans: BudgetPlan[], forecasts: Forecast[],
    variances: VarianceAnalysisRecord[], kpis: PlanningKPI[]
  ): { summary: ExecutivePlanningSummary; highlights: string[]; risks: string[]; actions: string[] } {
    const highlights: string[] = [];
    const risks: string[] = [];
    const actions: string[] = [];

    if (summary.budgetNetIncome > 0) {
      highlights.push(`Budget projects net income of ${summary.budgetNetIncome}.`);
    } else {
      risks.push("Budget projects a net loss. Review expense structure.");
      actions.push("Identify cost reduction opportunities to close the budget gap.");
    }

    if (summary.forecastConfidence >= 70) {
      highlights.push(`Forecast confidence is strong at ${summary.forecastConfidence}%.`);
    } else if (summary.forecastConfidence >= 50) {
      risks.push(`Forecast confidence is moderate (${summary.forecastConfidence}%). Consider refining assumptions.`);
    } else {
      risks.push(`Forecast confidence is low (${summary.forecastConfidence}%). Major assumption review needed.`);
      actions.push("Schedule a forecast review session to improve confidence levels.");
    }

    if (summary.budgetVariancePercent !== 0) {
      const absVar = Math.abs(summary.budgetVariancePercent);
      if (absVar > 10) {
        risks.push(`Budget variance is significant at ${summary.budgetVariancePercent.toFixed(1)}%. Investigate major drivers.`);
        actions.push("Conduct variance analysis review for accounts exceeding threshold.");
      } else if (absVar > 5) {
        highlights.push(`Budget variance is within acceptable range (${summary.budgetVariancePercent.toFixed(1)}%).`);
      }
    }

    if (summary.openAlerts > 0) {
      risks.push(`${summary.openAlerts} unresolved alerts require attention.`);
      actions.push("Review and resolve open planning alerts.");
    }

    if (summary.pendingApprovals > 0) {
      actions.push(`Process ${summary.pendingApprovals} pending plan approvals.`);
    }

    return { summary, highlights, risks, actions };
  }
}
