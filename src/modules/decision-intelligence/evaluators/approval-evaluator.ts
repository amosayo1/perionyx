import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { DecisionEvaluator } from "../engine";
import type { DecisionCategory, DecisionEvaluatorResult, Decision } from "../types";
import { makeDecision } from "../types";

export class ApprovalDecisionEvaluator extends DecisionEvaluator {
  readonly category: DecisionCategory = "approval";
  readonly label = "Approval Decisions";

  async evaluate(ctx: TenantContext): Promise<DecisionEvaluatorResult> {
    const startedAt = Date.now();
    const decisions: Decision[] = [];

    const [pendingApprovals, approvalRules, pendingTx] = await Promise.all([
      prisma.transactionApproval.findMany({
        where: { companyId: ctx.companyId, status: "PENDING" },
        orderBy: { createdAt: "asc" }, take: 50,
      }),
      prisma.approvalRule.findMany({
        where: { companyId: ctx.companyId, enabled: true },
        orderBy: { priority: "asc" },
      }),
      prisma.transaction.findMany({
        where: { companyId: ctx.companyId, status: "PENDING_APPROVAL" },
        orderBy: { primaryAmount: "desc" }, take: 50,
        select: { id: true, primaryAmount: true, currency: true, createdAt: true },
      }),
    ]);

    // ── Prioritize Approvals ────────────────────────────────────────────
    if (pendingTx.length > 5) {
      const totalPending = pendingTx.reduce((s, t) => s + Number(t.primaryAmount), 0);
      const highValue = pendingTx.filter((t) => Number(t.primaryAmount) >= 50000);
      decisions.push(makeDecision({
        type: "approval",
        title: "Prioritize approval queue",
        description: `${pendingTx.length} transactions (${totalPending.toFixed(2)}) pending — ${highValue.length} exceed $50,000`,
        affectedAccounts: [],
        affectedEntities: ["operations", "finance"],
        suggestedActions: [
          "Process high-value approvals first ($50k+)",
          "Assign approvers by workload",
          "Set up automatic approval routing",
        ],
        supportingEvidence: [
          `${pendingTx.length} total pending`,
          `${highValue.length} high-value ($50k+)`,
          `Total pending value: ${totalPending.toFixed(2)}`,
        ],
        score: {
          businessValue: 4, urgency: 3, financialImpact: 4,
          operationalImpact: 3, confidence: 4, effort: 3, riskReduction: 2,
        },
        sourceService: "decision-intelligence:approval-evaluator",
        explainability: {
          why: `${pendingTx.length} pending transactions totalling ${totalPending.toFixed(2)} require prioritized processing`,
          evidenceUsed: ["transactions", "transaction_approvals"],
          forecastsConsidered: [],
          policiesInvolved: approvalRules.slice(0, 3).map((r) => r.name),
          assumptions: ["High-value transactions should be processed first"],
          confidenceCalculation: "Confidence 4/5 — direct queue size and value analysis",
          expectedOutcome: "Approval queue processed efficiently, high-value items prioritized",
          alternativesConsidered: ["FIFO processing", "Random assignment"],
        },
      }));
    }

    // ── Identify Bottlenecks ────────────────────────────────────────────
    const approverCounts = new Map<string, number>();
    for (const a of pendingApprovals) {
      if (a.approvingUserId) {
        approverCounts.set(a.approvingUserId, (approverCounts.get(a.approvingUserId) ?? 0) + 1);
      }
    }
    const bottlenecks = Array.from(approverCounts.entries()).filter(([, count]) => count > 5);
    if (bottlenecks.length > 0) {
      decisions.push(makeDecision({
        type: "approval",
        title: "Approval bottlenecks detected",
        description: `${bottlenecks.length} approver(s) have more than 5 pending approvals each`,
        affectedAccounts: [],
        affectedEntities: ["operations", "finance"],
        suggestedActions: [
          "Redistribute approvals among available approvers",
          "Add additional approvers for high-volume categories",
          "Set up automatic delegation rules",
        ],
        supportingEvidence: bottlenecks.map(([userId, count]) => `User ${userId}: ${count} pending`),
        score: {
          businessValue: 3, urgency: 3, financialImpact: 2,
          operationalImpact: 4, confidence: 4, effort: 3, riskReduction: 2,
        },
        sourceService: "decision-intelligence:approval-evaluator",
        explainability: {
          why: `${bottlenecks.length} approver(s) have accumulated >5 pending approvals each, creating process bottlenecks`,
          evidenceUsed: ["transaction_approvals"],
          forecastsConsidered: [],
          policiesInvolved: approvalRules.filter((r) => r.autoEscalateAfterHours).map((r) => r.name),
          assumptions: ["No single approver should hold >5 pending items"],
          confidenceCalculation: "Confidence 4/5 — direct workload distribution analysis",
          expectedOutcome: "Approval workload balanced, reducing overall processing time",
          alternativesConsidered: ["Escalate to managers", "Auto-approve below thresholds"],
        },
      }));
    }

    // ── Recommend Escalation ────────────────────────────────────────────
    const overdueTx = pendingTx.filter((t) => {
      const age = Date.now() - new Date(t.createdAt).getTime();
      return age > 24 * 3600000;
    });
    if (overdueTx.length > 0) {
      decisions.push(makeDecision({
        type: "approval",
        title: "Escalate overdue approvals",
        description: `${overdueTx.length} approvals have been pending for more than 24 hours`,
        affectedAccounts: [],
        affectedEntities: ["operations", "finance"],
        suggestedActions: [
          "Escalate to secondary approvers",
          "Notify requesters of delay",
          "Review escalation rules for applicability",
        ],
        supportingEvidence: [
          `${overdueTx.length} overdue (>24h)`,
          ...overdueTx.slice(0, 5).map((t) => `${t.id}: ${Number(t.primaryAmount).toFixed(2)} ${t.currency}`),
        ],
        score: {
          businessValue: 3, urgency: 4, financialImpact: 3,
          operationalImpact: 3, confidence: 4, effort: 2, riskReduction: 3,
        },
        sourceService: "decision-intelligence:approval-evaluator",
        explainability: {
          why: `${overdueTx.length} transactions have exceeded the 24-hour SLA for approval`,
          evidenceUsed: ["transactions", "transaction_approvals"],
          forecastsConsidered: [],
          policiesInvolved: approvalRules.filter((r) => r.escalationPath.length > 0).map((r) => r.name),
          assumptions: ["Approvals >24h old require escalation per policy"],
          confidenceCalculation: "Confidence 4/5 — SLA breach analysis",
          expectedOutcome: "Overdue approvals escalated and resolved promptly",
          alternativesConsidered: ["Extend SLA to 48h", "Auto-approve after 24h"],
        },
      }));
    }

    return { decisions, evaluatedAt: new Date().toISOString(), durationMs: Date.now() - startedAt };
  }
}
