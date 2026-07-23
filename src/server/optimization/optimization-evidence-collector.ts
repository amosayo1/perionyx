import type { OptimizationEvidence, AnalyzerResult, OptimizationSource, OptimizationCategory } from "./types";
import { workflowOptimizationService } from "./workflow-optimization-service";
import { treasuryOptimizationService } from "./treasury-optimization-service";
import { reportingOptimizationService } from "./reporting-optimization-service";
import { approvalOptimizationService } from "./approval-optimization-service";
import { policyOptimizationService } from "./policy-optimization-service";
import { businessEfficiencyAnalyzer } from "./business-efficiency-analyzer";
import type { OptimizationConfig } from "./types";

type AnalyzerEntry = {
  service: { analyze(companyId: string, tenantId: string): Promise<AnalyzerResult> };
  source: OptimizationSource;
  category: OptimizationCategory;
  key: keyof OptimizationConfig["analyzers"];
};

export class OptimizationEvidenceCollector {
  private analyzers: AnalyzerEntry[] = [
    { service: workflowOptimizationService, source: "workflow_analyzer", category: "workflow", key: "workflow" },
    { service: treasuryOptimizationService, source: "treasury_analyzer", category: "treasury", key: "treasury" },
    { service: reportingOptimizationService, source: "reporting_analyzer", category: "reporting", key: "reporting" },
    { service: approvalOptimizationService, source: "approval_analyzer", category: "approvals", key: "approval" },
    { service: policyOptimizationService, source: "policy_analyzer", category: "compliance", key: "policy" },
    { service: businessEfficiencyAnalyzer, source: "efficiency_analyzer", category: "automation", key: "efficiency" },
  ];

  async collect(companyId: string, tenantId: string, config: OptimizationConfig): Promise<{
    allEvidence: OptimizationEvidence[];
    allRecommendations: AnalyzerResult[];
  }> {
    const allEvidence: OptimizationEvidence[] = [];
    const allResults: AnalyzerResult[] = [];

    const enabledAnalyzers = this.analyzers.filter((a) => config.analyzers[a.key]);

    const results = await Promise.allSettled(
      enabledAnalyzers.map((a) => a.service.analyze(companyId, tenantId)),
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        allEvidence.push(...result.value.evidence);
        allResults.push(result.value);
      }
    }

    return { allEvidence, allRecommendations: allResults };
  }

  async collectEvidence(companyId: string, tenantId: string): Promise<OptimizationEvidence[]> {
    const { allEvidence } = await this.collect(companyId, tenantId, {
      enabled: true,
      runIntervalMs: 0,
      maxRecommendationsPerRun: 100,
      analyzers: { workflow: true, treasury: true, reporting: true, approval: true, policy: true, efficiency: true, system: true },
      minimumConfidenceScore: 0,
    });
    return allEvidence;
  }
}

export const optimizationEvidenceCollector = new OptimizationEvidenceCollector();
