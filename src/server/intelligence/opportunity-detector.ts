import type { Recommendation } from "./types";
import { prisma } from "@/server/db/prisma";

export class OpportunityDetector {
  async detectOpportunities(companyId: string): Promise<Recommendation[]> {
    const opportunities: Recommendation[] = [];

    const highPendingApprovals = await this.detectApprovalOptimization(companyId);
    if (highPendingApprovals) opportunities.push(highPendingApprovals);

    const connectorOptimization = await this.detectConnectorOptimization(companyId);
    if (connectorOptimization) opportunities.push(connectorOptimization);

    const workflowOptimization = await this.detectWorkflowOptimization(companyId);
    if (workflowOptimization) opportunities.push(workflowOptimization);

    return opportunities;
  }

  private async detectApprovalOptimization(companyId: string): Promise<Recommendation | null> {
    const pendingCount = await prisma.transactionApproval.count({
      where: { transaction: { companyId }, status: "PENDING" },
    });

    if (pendingCount < 5) return null;

    return {
      id: `opp-approval-${companyId}-${Date.now()}`,
      title: "Optimize Approval Workflow",
      description: `${pendingCount} transactions are pending approval. Consider adjusting approval thresholds or adding delegated approvers.`,
      priority: "medium",
      category: "approvals",
      actions: [
        "Review current approval thresholds for low-risk transactions",
        "Add delegated approvers for high-volume periods",
        "Consider auto-approval rules for transactions under defined thresholds",
      ],
      expectedImpact: "Reduce approval cycle time by 40-60% for routine transactions",
      effort: "low",
      evidenceRefs: [`pending-approvals-${pendingCount}`],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 604_800_000).toISOString(),
      companyId,
    };
  }

  private async detectConnectorOptimization(companyId: string): Promise<Recommendation | null> {
    const failedRuns = await prisma.connectorRun.findMany({
      where: { companyId, status: "FAILED" },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    if (failedRuns.length === 0) return null;

    const connectorIds = [...new Set(failedRuns.map((r) => r.connectorId))];
    const connectors = connectorIds.length > 0
      ? await prisma.connectorConfig.findMany({ where: { id: { in: connectorIds } }, select: { name: true } })
      : [];
    const failedNames = [...new Set(connectors.map((c) => c.name))];

    return {
      id: `opp-connector-${companyId}-${Date.now()}`,
      title: "Resolve Connector Sync Issues",
      description: `${failedRuns.length} failed syncs detected for: ${failedNames.join(", ")}. Data may be stale.`,
      priority: "high",
      category: "operational",
      actions: [
        `Verify credentials for ${failedNames.join(", ")}`,
        "Check network connectivity to external services",
        "Re-run failed sync jobs from connector dashboard",
      ],
      expectedImpact: "Restore real-time data synchronization for treasury operations",
      effort: "low",
      evidenceRefs: failedRuns.map((r) => r.id),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 604_800_000).toISOString(),
      companyId,
    };
  }

  private async detectWorkflowOptimization(companyId: string): Promise<Recommendation | null> {
    const failedCount = await prisma.workflowInstance.count({
      where: { companyId, status: "FAILED" },
    });

    if (failedCount < 3) return null;

    return {
      id: `opp-workflow-${companyId}-${Date.now()}`,
      title: "Review Workflow Failure Patterns",
      description: `${failedCount} workflow instances have failed. Review failure patterns to improve reliability.`,
      priority: "medium",
      category: "workflow",
      actions: [
        "Review failed workflow error logs for common patterns",
        "Update workflow definitions to handle error conditions",
        "Add retry logic for transient failures",
      ],
      expectedImpact: "Reduce workflow failure rate and improve automation reliability",
      effort: "medium",
      evidenceRefs: [`failed-workflows-${failedCount}`],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 604_800_000).toISOString(),
      companyId,
    };
  }
}

export const opportunityDetector = new OpportunityDetector();
