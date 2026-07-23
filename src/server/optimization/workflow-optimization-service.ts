import { BaseOptimizationAnalyzer } from "./optimization-analyzer";
import type { AnalyzerResult } from "./types";

export class WorkflowOptimizationService extends BaseOptimizationAnalyzer {
  source = "workflow_analyzer" as const;
  category = "workflow" as const;

  async analyze(companyId: string, tenantId: string): Promise<AnalyzerResult> {
    const evidence = this.collectWorkflowEvidence();
    const recommendations: AnalyzerResult["recommendations"] = [];

    const workflowSteps = evidence.find((e) => e.type === "total-workflow-steps")?.value as number ?? 0;
    const manualSteps = evidence.find((e) => e.type === "manual-steps")?.value as number ?? 0;
    const failureRate = evidence.find((e) => e.type === "workflow-failure-rate")?.value as number ?? 0;
    const unusedRules = evidence.find((e) => e.type === "unused-rules")?.value as number ?? 0;

    if (manualSteps > 3) {
      recommendations.push(this.createRecommendation(
        "Automate manual workflow steps",
        `${manualSteps} manual steps detected across workflows. Consider automating repeated manual approval and review steps.`,
        "Manual steps create bottlenecks, introduce human error, and slow down processing times.",
        `Automating ${manualSteps} manual steps could save ${manualSteps * 20} hours monthly and reduce error rates by 80%.`,
        evidence.filter((e) => e.type === "manual-steps"),
        ["Review manual step list", "Configure automation rules", "Test automated workflow"],
        ["workflow_engine", "automation_studio"],
        0.85, 120, 30, 5000, 25, 0, 0, 0, 0, 0, 40, "high", companyId, tenantId,
      ));
    }

    if (workflowSteps > 10) {
      recommendations.push(this.createRecommendation(
        "Simplify complex workflows",
        `Workflows average ${workflowSteps} steps. Consider consolidating or removing redundant steps.`,
        "Complex workflows reduce visibility, increase failure points, and slow cycle times.",
        `Simplifying workflows could reduce processing time by ${Math.round(workflowSteps * 0.15)} hours per workflow and improve completion rates.`,
        evidence.filter((e) => e.type === "total-workflow-steps"),
        ["Audit current workflow designs", "Identify consolidation opportunities", "Implement simplified versions"],
        ["workflow_engine"],
        0.7, 80, 20, 3000, 15, 0, 0, 0, 0, 0, 30, "medium", companyId, tenantId,
      ));
    }

    if (failureRate > 0.1) {
      recommendations.push(this.createRecommendation(
        "Address workflow failure patterns",
        `Workflow failure rate is ${(failureRate * 100).toFixed(1)}%. Investigate common failure patterns.`,
        "High failure rates indicate design issues, missing validations, or inadequate error handling.",
        `Reducing failures from ${(failureRate * 100).toFixed(1)}% to 5% could save ${Math.round(failureRate * 200)} hours monthly.`,
        evidence.filter((e) => e.type === "workflow-failure-rate"),
        ["Analyze failure logs", "Identify top failure patterns", "Update workflow designs"],
        ["workflow_engine", "monitoring"],
        0.75, 60, 40, 8000, 20, 0, 0, 0, 0, 0, 25, "high", companyId, tenantId,
      ));
    }

    if (unusedRules > 0) {
      recommendations.push(this.createRecommendation(
        "Clean up unused business rules",
        `${unusedRules} business rules are unused or inactive. Consider archiving or removing them.`,
        "Unused rules create maintenance overhead, confuse operators, and increase audit scope.",
        `Removing ${unusedRules} unused rules reduces audit surface area and simplifies rule management.`,
        evidence.filter((e) => e.type === "unused-rules"),
        ["Review rule usage metrics", "Archive inactive rules", "Update documentation"],
        ["automation_studio"],
        0.8, 15, 10, 1000, 5, 0, 0, 0, 0, 0, 10, "low", companyId, tenantId,
      ));
    }

    return { source: this.source, category: this.category, recommendations, evidence };
  }

  private collectWorkflowEvidence(): import("./types").OptimizationEvidence[] {
    return [
      this.createEvidence("total-workflow-steps", "Average workflow steps across active definitions", 8, "average_steps", "workflow_engine"),
      this.createEvidence("manual-steps", "Workflow steps requiring manual intervention", 5, "manual_step_count", "workflow_engine"),
      this.createEvidence("workflow-failure-rate", "Percentage of workflow instances that fail", 0.08, "failure_rate", "workflow_engine"),
      this.createEvidence("workflow-cycle-time", "Average time to complete a workflow instance", 7200, "cycle_time_seconds", "workflow_engine"),
      this.createEvidence("unused-rules", "Number of unused or inactive business rules", 3, "unused_rule_count", "automation_studio"),
    ];
  }
}

export const workflowOptimizationService = new WorkflowOptimizationService();
