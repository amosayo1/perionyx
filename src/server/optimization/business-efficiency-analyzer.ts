import { BaseOptimizationAnalyzer } from "./optimization-analyzer";
import type { AnalyzerResult } from "./types";

export class BusinessEfficiencyAnalyzer extends BaseOptimizationAnalyzer {
  source = "efficiency_analyzer" as const;
  category = "automation" as const;

  async analyze(companyId: string, tenantId: string): Promise<AnalyzerResult> {
    const evidence = this.collectEfficiencyEvidence();
    const recommendations: AnalyzerResult["recommendations"] = [];

    const manualReconCount = evidence.find((e) => e.type === "manual-reconciliation")?.value as number ?? 0;
    const repetitiveActions = evidence.find((e) => e.type === "repetitive-actions")?.value as number ?? 0;
    const underusedFeatures = evidence.find((e) => e.type === "underused-features")?.value as number ?? 0;
    const monthEndHours = evidence.find((e) => e.type === "month-end-hours")?.value as number ?? 0;
    const adoptionRate = evidence.find((e) => e.type === "platform-adoption-rate")?.value as number ?? 0;

    if (manualReconCount > 0) {
      recommendations.push(this.createRecommendation(
        "Automate reconciliation processes",
        `${manualReconCount} reconciliation processes are still manual. Configure auto-matching and exception handling.`,
        "Manual reconciliation consumes significant finance team time and is prone to human error.",
        `Automating ${manualReconCount} processes could save ${manualReconCount * 20} hours per month and reduce errors by 95%.`,
        evidence.filter((e) => e.type === "manual-reconciliation"),
        ["Map manual reconciliation steps", "Configure auto-matching rules", "Set up exception workflows"],
        ["treasury", "reconciliation", "automation_studio"],
        0.75, 100, 40, 15000, 25, 20, 0, 15, 5, 5, 35, "high", companyId, tenantId,
      ));
    }

    if (repetitiveActions > 10) {
      recommendations.push(this.createRecommendation(
        "Eliminate repetitive manual work",
        `${repetitiveActions} repetitive actions detected per week. Create automation rules or batch operations.`,
        "Repetitive manual work reduces job satisfaction, increases error rates, and wastes talent on low-value tasks.",
        `Automating ${repetitiveActions} weekly actions could save ${Math.round(repetitiveActions * 0.5)} hours per week and improve accuracy.`,
        evidence.filter((e) => e.type === "repetitive-actions"),
        ["Analyze user behavior patterns", "Identify automation candidates", "Configure batch operations"],
        ["automation_studio", "workflow_engine"],
        0.7, 80, 20, 6000, 20, 10, 0, 0, 0, 0, 25, "medium", companyId, tenantId,
      ));
    }

    if (underusedFeatures > 0) {
      recommendations.push(this.createRecommendation(
        "Increase platform feature adoption",
        `${underusedFeatures} platform features are available but underused. Consider targeted training or onboarding.`,
        "Underused features represent unrealized ROI on the platform investment.",
        `Increasing adoption of ${underusedFeatures} features could improve operational efficiency by ${Math.round(underusedFeatures * 8)}%.`,
        evidence.filter((e) => e.type === "underused-features"),
        ["Identify low-adoption features", "Create training materials", "Schedule demos"],
        ["automation_studio", "analytics"],
        0.55, 30, 10, 5000, 10, 0, 0, 0, 0, 0, 15, "low", companyId, tenantId,
      ));
    }

    if (monthEndHours > 40) {
      recommendations.push(this.createRecommendation(
        "Optimize month-end close process",
        `Month-end close takes approximately ${monthEndHours} hours. Identify automation and parallelization opportunities.`,
        "Long month-end closes delay financial reporting, increase overtime costs, and delay business decisions.",
        `Reducing month-end close from ${monthEndHours}h to ${Math.round(monthEndHours * 0.6)}h could save ${Math.round(monthEndHours * 0.4)} hours monthly and accelerate reporting.`,
        evidence.filter((e) => e.type === "month-end-hours"),
        ["Map month-end workflow", "Identify sequential bottlenecks", "Implement parallel processing"],
        ["treasury", "reconciliation", "reports", "workflow_engine"],
        0.7, 200, 30, 25000, 30, 100, 10, 0, 5, 10, 40, "critical", companyId, tenantId,
      ));
    }

    if (adoptionRate < 0.5) {
      recommendations.push(this.createRecommendation(
        "Boost platform adoption through targeted enablement",
        `Platform adoption rate is ${(adoptionRate * 100).toFixed(0)}%. Identify non-adopters and provide enablement.`,
        "Low adoption means the platform is not delivering its full potential value to the organization.",
        `Increasing adoption to 80% could improve overall operational efficiency by ${Math.round((0.8 - adoptionRate) * 30)}%.`,
        evidence.filter((e) => e.type === "platform-adoption-rate"),
        ["Segment users by adoption level", "Create targeted onboarding", "Measure adoption trends"],
        ["analytics"],
        0.6, 40, 10, 10000, 15, 0, 0, 0, 0, 0, 20, "medium", companyId, tenantId,
      ));
    }

    return { source: this.source, category: this.category, recommendations, evidence };
  }

  private collectEfficiencyEvidence() {
    return [
      this.createEvidence("manual-reconciliation", "Reconciliation processes still performed manually", 3, "count", "reconciliation"),
      this.createEvidence("repetitive-actions", "Average repetitive actions per user per week", 15, "count", "analytics"),
      this.createEvidence("underused-features", "Platform features available but adoption <20%", 4, "count", "analytics"),
      this.createEvidence("month-end-hours", "Total hours spent on month-end close process", 60, "hours", "treasury"),
      this.createEvidence("platform-adoption-rate", "Percentage of users actively using the platform", 0.45, "percentage", "analytics"),
    ];
  }
}

export const businessEfficiencyAnalyzer = new BusinessEfficiencyAnalyzer();
