import { BaseOptimizationAnalyzer } from "./optimization-analyzer";
import type { AnalyzerResult } from "./types";

export class ApprovalOptimizationService extends BaseOptimizationAnalyzer {
  source = "approval_analyzer" as const;
  category = "approvals" as const;

  async analyze(companyId: string, tenantId: string): Promise<AnalyzerResult> {
    const evidence = this.collectApprovalEvidence();
    const recommendations: AnalyzerResult["recommendations"] = [];

    const approvalTime = evidence.find((e) => e.type === "avg-approval-time")?.value as number ?? 0;
    const rejectedRate = evidence.find((e) => e.type === "rejected-rate")?.value as number ?? 0;
    const escalationRate = evidence.find((e) => e.type === "escalation-rate")?.value as number ?? 0;
    const delegationRate = evidence.find((e) => e.type === "delegation-rate")?.value as number ?? 0;

    if (approvalTime > 24) {
      recommendations.push(this.createRecommendation(
        "Reduce approval cycle times",
        `Average approval time is ${approvalTime} hours. Set up escalation policies and reminders.`,
        "Slow approvals delay payments, frustrate requesters, and can result in missed deadlines or late fees.",
        `Reducing approval time from ${approvalTime}h to 4h could improve payment timeliness by ${Math.round((approvalTime - 4) / approvalTime * 100)}%.`,
        evidence.filter((e) => e.type === "avg-approval-time"),
        ["Configure approval escalation rules", "Set up automated reminders", "Review approver availability"],
        ["approvals", "workflow_engine"],
        0.75, 40, 25, 5000, 20, 10, 0, 0, 0, 0, 30, "high", companyId, tenantId,
      ));
    }

    if (rejectedRate > 0.2) {
      recommendations.push(this.createRecommendation(
        "Investigate high approval rejection rate",
        `${(rejectedRate * 100).toFixed(0)}% of approvals are rejected or returned. Review approval criteria clarity.`,
        "High rejection rates indicate unclear criteria, inadequate training, or misaligned thresholds.",
        `Reducing rejections from ${(rejectedRate * 100).toFixed(0)}% to 10% could save ${Math.round(rejectedRate * 80)} hours of rework monthly.`,
        evidence.filter((e) => e.type === "rejected-rate"),
        ["Review rejection reasons", "Clarify approval criteria", "Provide request training"],
        ["approvals"],
        0.7, 25, 20, 3000, 10, 5, 0, 0, 0, 0, 20, "medium", companyId, tenantId,
      ));
    }

    if (escalationRate > 0.1) {
      recommendations.push(this.createRecommendation(
        "Reduce approval escalation frequency",
        `${(escalationRate * 100).toFixed(0)}% of approvals are escalated. Review delegation rules and approval limits.`,
        "Frequent escalations indicate misconfigured approval thresholds or insufficient approver authority.",
        `Reducing escalations to 5% could save ${Math.round(escalationRate * 60)} hours of senior management time monthly.`,
        evidence.filter((e) => e.type === "escalation-rate"),
        ["Review approval thresholds", "Adjust delegation rules", "Empower lower-level approvers"],
        ["approvals", "automation_studio"],
        0.65, 25, 10, 2000, 15, 5, 0, 0, 0, 0, 15, "medium", companyId, tenantId,
      ));
    }

    return { source: this.source, category: this.category, recommendations, evidence };
  }

  private collectApprovalEvidence() {
    return [
      this.createEvidence("avg-approval-time", "Average time to complete an approval", 36, "hours", "approvals"),
      this.createEvidence("rejected-rate", "Percentage of approvals rejected or returned", 0.15, "percentage", "approvals"),
      this.createEvidence("escalation-rate", "Percentage of approvals escalated to higher authority", 0.12, "percentage", "approvals"),
      this.createEvidence("delegation-rate", "Percentage of approvals delegated to alternate approvers", 0.08, "percentage", "approvals"),
      this.createEvidence("pending-approvals", "Currently pending approvals count", 15, "count", "approvals"),
    ];
  }
}

export const approvalOptimizationService = new ApprovalOptimizationService();
