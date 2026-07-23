import { BaseOptimizationAnalyzer } from "./optimization-analyzer";
import type { AnalyzerResult } from "./types";

export class PolicyOptimizationService extends BaseOptimizationAnalyzer {
  source = "policy_analyzer" as const;
  category = "compliance" as const;

  async analyze(companyId: string, tenantId: string): Promise<AnalyzerResult> {
    const evidence = this.collectPolicyEvidence();
    const recommendations: AnalyzerResult["recommendations"] = [];

    const totalPolicies = evidence.find((e) => e.type === "total-policies")?.value as number ?? 0;
    const overlappingPolicies = evidence.find((e) => e.type === "overlapping-policies")?.value as number ?? 0;
    const violationRate = evidence.find((e) => e.type === "violation-rate")?.value as number ?? 0;
    const complianceGaps = evidence.find((e) => e.type === "compliance-gaps")?.value as number ?? 0;

    if (overlappingPolicies > 2) {
      recommendations.push(this.createRecommendation(
        "Consolidate overlapping policies",
        `${overlappingPolicies} policies have overlapping or conflicting rules. Consolidate into unified policies.`,
        "Overlapping policies create confusion, increase compliance risk, and complicate audits.",
        `Consolidating ${overlappingPolicies} policies could reduce audit scope by ${Math.round(overlappingPolicies * 5)} hours and improve clarity.`,
        evidence.filter((e) => e.type === "overlapping-policies"),
        ["Audit policy rules", "Identify overlapping areas", "Create consolidated policies"],
        ["governance", "compliance"],
        0.7, 30, 20, 2000, 10, 5, 15, 0, 0, 0, 20, "medium", companyId, tenantId,
      ));
    }

    if (totalPolicies > 50) {
      recommendations.push(this.createRecommendation(
        "Simplify policy framework",
        `${totalPolicies} active policies. Consider grouping related policies into broader frameworks.`,
        "Too many policies make it difficult for employees to understand and comply with all requirements.",
        `Simplifying to ${Math.round(totalPolicies * 0.6)} policies could improve compliance by 20% and reduce review time by 30%.`,
        evidence.filter((e) => e.type === "total-policies"),
        ["Review all active policies", "Group by domain", "Create policy framework hierarchy"],
        ["governance", "compliance"],
        0.7, 30, 20, 3000, 8, 0, 20, 0, 0, 0, 25, "medium", companyId, tenantId,
      ));
    }

    if (violationRate > 0.05) {
      recommendations.push(this.createRecommendation(
        "Address compliance violation patterns",
        `Violation rate is ${(violationRate * 100).toFixed(1)}%. Analyze root causes and implement preventive controls.`,
        "Recurring violations indicate either unclear policies, inadequate training, or enforcement gaps.",
        `Reducing violations from ${(violationRate * 100).toFixed(1)}% to 2% could reduce risk exposure by ${Math.round(violationRate * 200)}%.`,
        evidence.filter((e) => e.type === "violation-rate"),
        ["Analyze violation root causes", "Improve policy communication", "Implement preventive controls"],
        ["compliance", "governance"],
        0.75, 40, 60, 10000, 12, 0, 30, 0, 0, 0, 25, "high", companyId, tenantId,
      ));
    }

    if (complianceGaps > 0) {
      recommendations.push(this.createRecommendation(
        "Close compliance framework gaps",
        `${complianceGaps} compliance gaps identified. Review regulatory requirements and update policies.`,
        "Compliance gaps expose the organization to regulatory penalties, audit findings, and reputational damage.",
        `Closing ${complianceGaps} gaps could reduce audit findings by ${Math.round(complianceGaps * 30)}% and improve regulatory posture.`,
        evidence.filter((e) => e.type === "compliance-gaps"),
        ["Map regulatory requirements", "Create remediation plan", "Implement gap closure"],
        ["compliance", "governance"],
        0.6, 40, 60, 20000, 10, 0, 35, 0, 0, 0, 30, "critical", companyId, tenantId,
      ));
    }

    return { source: this.source, category: this.category, recommendations, evidence };
  }

  private collectPolicyEvidence() {
    return [
      this.createEvidence("total-policies", "Total number of active policies", 45, "count", "governance"),
      this.createEvidence("overlapping-policies", "Policies with overlapping scope", 4, "count", "governance"),
      this.createEvidence("violation-rate", "Percentage of operations resulting in policy violations", 0.06, "percentage", "compliance"),
      this.createEvidence("compliance-gaps", "Identified compliance framework gaps", 2, "count", "compliance"),
      this.createEvidence("policy-review-frequency", "Average days since last policy review", 180, "days", "governance"),
    ];
  }
}

export const policyOptimizationService = new PolicyOptimizationService();
