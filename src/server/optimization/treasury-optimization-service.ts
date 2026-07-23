import { BaseOptimizationAnalyzer } from "./optimization-analyzer";
import type { AnalyzerResult } from "./types";

export class TreasuryOptimizationService extends BaseOptimizationAnalyzer {
  source = "treasury_analyzer" as const;
  category = "treasury" as const;

  async analyze(companyId: string, tenantId: string): Promise<AnalyzerResult> {
    const evidence = this.collectTreasuryEvidence();
    const recommendations: AnalyzerResult["recommendations"] = [];

    const idleCash = evidence.find((e) => e.type === "idle-cash-balance")?.value as number ?? 0;
    const forecastDeviation = evidence.find((e) => e.type === "forecast-deviation")?.value as number ?? 0;
    const reconDiscrepancies = evidence.find((e) => e.type === "reconciliation-discrepancies")?.value as number ?? 0;
    const fxExposureCount = evidence.find((e) => e.type === "fx-exposure-count")?.value as number ?? 0;

    if (idleCash > 100000) {
      recommendations.push(this.createRecommendation(
        "Optimize idle cash allocation",
        `$${(idleCash / 1000).toFixed(0)}K in idle cash detected across accounts. Consider short-term investments or sweeps.`,
        "Idle cash earns no return and represents an opportunity cost to the organization.",
        `Investing idle cash at 4% APR could yield $${Math.round(idleCash * 0.04).toLocaleString()} annually.`,
        evidence.filter((e) => e.type === "idle-cash-balance"),
        ["Review cash position report", "Configure cash sweep rules", "Set up short-term investment strategy"],
        ["treasury"],
        0.65, 20, 35, Math.round(idleCash * 0.04), 10, 0, 0, 0, 30, 15, 20, "high", companyId, tenantId,
      ));
    }

    if (forecastDeviation > 0.15) {
      recommendations.push(this.createRecommendation(
        "Improve cash flow forecast accuracy",
        `Forecast deviation is ${(forecastDeviation * 100).toFixed(0)}%. Review forecasting methodology and data sources.`,
        "Inaccurate forecasts lead to poor investment decisions, unnecessary borrowing, or missed opportunities.",
        `Improving accuracy from ${(forecastDeviation * 100).toFixed(0)}% to 10% could reduce borrowing costs by 20%.`,
        evidence.filter((e) => e.type === "forecast-deviation"),
        ["Audit forecast vs actual data", "Review data source quality", "Consider ML-enhanced forecasting"],
        ["treasury", "analytics"],
        0.6, 40, 25, 15000, 15, 0, 0, 0, 0, 25, 15, "medium", companyId, tenantId,
      ));
    }

    if (reconDiscrepancies > 5) {
      recommendations.push(this.createRecommendation(
        "Streamline reconciliation process",
        `${reconDiscrepancies} recurring reconciliation discrepancies detected. Automate matching rules.`,
        "Manual reconciliation is time-consuming and error-prone, especially with recurring discrepancies.",
        `Automating reconciliation could save ${reconDiscrepancies * 5} hours per month and reduce errors by 90%.`,
        evidence.filter((e) => e.type === "reconciliation-discrepancies"),
        ["Configure auto-matching rules", "Set up exception workflows", "Review discrepancy patterns"],
        ["treasury", "reconciliation"],
        0.75, 100, 40, 12000, 20, 15, 0, 10, 0, 0, 30, "high", companyId, tenantId,
      ));
    }

    if (fxExposureCount > 3) {
      recommendations.push(this.createRecommendation(
        "Consolidate FX exposure management",
        `${fxExposureCount} active FX exposures across currencies. Consider netting or hedging strategy.`,
        "Multiple FX exposures increase transaction costs and risk without centralized management.",
        `Consolidating FX management could reduce transaction costs by ${Math.round(fxExposureCount * 3)}% and improve visibility.`,
        evidence.filter((e) => e.type === "fx-exposure-count"),
        ["Map all FX exposures", "Evaluate netting opportunities", "Set up hedging program"],
        ["treasury"],
        0.6, 30, 30, 20000, 10, 0, 0, 10, 20, 10, 20, "medium", companyId, tenantId,
      ));
    }

    return { source: this.source, category: this.category, recommendations, evidence };
  }

  private collectTreasuryEvidence() {
    return [
      this.createEvidence("idle-cash-balance", "Total idle cash across all accounts", 250000, "usd", "treasury"),
      this.createEvidence("forecast-deviation", "Average deviation between forecast and actual", 0.18, "percentage", "treasury"),
      this.createEvidence("reconciliation-discrepancies", "Number of recurring reconciliation discrepancies", 7, "count", "reconciliation"),
      this.createEvidence("fx-exposure-count", "Number of active FX exposures", 4, "count", "treasury"),
      this.createEvidence("days-outstanding-receivables", "Average days receivables outstanding", 45, "days", "treasury"),
    ];
  }
}

export const treasuryOptimizationService = new TreasuryOptimizationService();
