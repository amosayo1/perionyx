import type { OptimizationRecommendation, OptimizationEvidence, AnalyzerResult, OptimizationCategory, OptimizationSource } from "./types";

export abstract class BaseOptimizationAnalyzer {
  abstract source: OptimizationSource;
  abstract category: OptimizationCategory;

  abstract analyze(companyId: string, tenantId: string): Promise<AnalyzerResult>;

  protected createEvidence(
    type: string,
    description: string,
    value: number | string | boolean,
    metric: string,
    module: string,
  ): OptimizationEvidence {
    return {
      id: `${this.source}-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      source: this.source,
      description,
      value,
      metric,
      module,
      timestamp: new Date().toISOString(),
    };
  }

  protected createRecommendation(
    title: string,
    description: string,
    businessProblem: string,
    businessImpact: string,
    evidence: OptimizationEvidence[],
    suggestedActions: string[],
    affectedModules: string[],
    confidenceScore: number,
    estimatedHoursSaved: number,
    estimatedRiskReduction: number,
    estimatedCostReduction: number,
    estimatedProductivityGain: number,
    approvalTimeReduction = 0,
    monthEndTimeReduction = 0,
    complianceImprovement = 0,
    treasuryVisibilityImprovement = 0,
    forecastAccuracyImprovement = 0,
    operationalComplexityReduction = 0,
    priority: string = "medium",
    companyId: string,
    tenantId: string,
  ): OptimizationRecommendation {
    return {
      id: `opt-${this.source}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      description,
      businessProblem,
      businessImpact,
      category: this.category,
      priority: priority as any,
      confidenceScore,
      estimatedHoursSaved,
      estimatedRiskReduction,
      estimatedCostReduction,
      estimatedProductivityGain,
      approvalTimeReduction,
      monthEndTimeReduction,
      complianceImprovement,
      treasuryVisibilityImprovement,
      forecastAccuracyImprovement,
      operationalComplexityReduction,
      evidence,
      affectedModules,
      relatedUsers: [],
      supportingAnalytics: {},
      suggestedActions,
      lifecycle: "detected",
      source: this.source,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      companyId,
      tenantId,
    };
  }
}
