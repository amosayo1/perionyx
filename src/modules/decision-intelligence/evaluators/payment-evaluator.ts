import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { DecisionEvaluator } from "../engine";
import type { DecisionCategory, DecisionEvaluatorResult, Decision } from "../types";
import { makeDecision } from "../types";

export class PaymentDecisionEvaluator extends DecisionEvaluator {
  readonly category: DecisionCategory = "payment";
  readonly label = "Payment Decisions";

  async evaluate(ctx: TenantContext): Promise<DecisionEvaluatorResult> {
    const startedAt = Date.now();
    const decisions: Decision[] = [];

    const transactions = await prisma.transaction.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" }, take: 200,
    });

    const pending = transactions.filter((t) => t.status === "PENDING_APPROVAL");
    const failed = transactions.filter((t) => t.status === "FAILED");
    const largePending = pending.filter((t) => Number(t.primaryAmount) >= 100000);

    // ── Prioritize Large Pending Payments ───────────────────────────────
    if (largePending.length > 0) {
      const totalLarge = largePending.reduce((s, t) => s + Number(t.primaryAmount), 0);
      decisions.push(makeDecision({
        type: "payment",
        title: "Prioritize large pending payments",
        description: `${largePending.length} payments totalling ${totalLarge.toFixed(2)} exceed $100,000 and require priority approval`,
        affectedAccounts: [],
        affectedEntities: ["operations", "treasury"],
        suggestedActions: [
          "Expedite approval for largest payments first",
          "Verify counterparty details for each",
          "Check liquidity coverage before approval",
        ],
        supportingEvidence: [
          `${largePending.length} payments >= $100,000`,
          `Total at risk: ${totalLarge.toFixed(2)}`,
          ...largePending.slice(0, 5).map((t) => `${t.id}: ${Number(t.primaryAmount).toFixed(2)} ${t.currency}`),
        ],
        score: {
          businessValue: 4, urgency: 4, financialImpact: 5,
          operationalImpact: 3, confidence: 4, effort: 3, riskReduction: 3,
        },
        sourceService: "decision-intelligence:payment-evaluator",
        explainability: {
          why: `${largePending.length} payments of ${totalLarge.toFixed(2)} exceed the $100,000 threshold and represent significant cash outflow`,
          evidenceUsed: ["transactions"],
          forecastsConsidered: [],
          policiesInvolved: [],
          assumptions: ["Large payments have higher business impact and urgency"],
          confidenceCalculation: "Confidence 4/5 — direct payment amount analysis",
          expectedOutcome: "Large payments approved in a timely manner, avoiding delays",
          alternativesConsidered: ["Process in FIFO order", "Process smallest first"],
        },
      }));
    }

    // ── Escalate Urgent Payments ───────────────────────────────────────
    const agingPending = pending.filter((t) => {
      const age = Date.now() - new Date(t.createdAt).getTime();
      return age > 48 * 3600000;
    });
    if (agingPending.length > 0) {
      decisions.push(makeDecision({
        type: "payment",
        title: "Escalate aging pending payments",
        description: `${agingPending.length} payments have been pending for more than 48 hours`,
        affectedAccounts: [],
        affectedEntities: ["operations", "finance"],
        suggestedActions: [
          "Escalate to senior approvers",
          "Contact original requesters for status",
          "Review approval bottlenecks",
        ],
        supportingEvidence: [
          `${agingPending.length} payments > 48h old`,
          ...agingPending.slice(0, 5).map((t) => `${t.id}: ${Number(t.primaryAmount).toFixed(2)} (${Math.round((Date.now() - new Date(t.createdAt).getTime()) / 3600000)}h old)`),
        ],
        score: {
          businessValue: 3, urgency: 4, financialImpact: 3,
          operationalImpact: 3, confidence: 4, effort: 2, riskReduction: 3,
        },
        sourceService: "decision-intelligence:payment-evaluator",
        explainability: {
          why: `${agingPending.length} payments have exceeded the 48-hour SLA for pending approvals`,
          evidenceUsed: ["transactions"],
          forecastsConsidered: [],
          policiesInvolved: [],
          assumptions: ["Payments >48h old indicate process bottlenecks"],
          confidenceCalculation: "Confidence 4/5 — age-based analysis",
          expectedOutcome: "Aging payments resolved, reducing counterparty friction",
          alternativesConsidered: ["Auto-cancel aging payments", "Extend SLA threshold"],
        },
      }));
    }

    // ── Batch Small Payments ───────────────────────────────────────────
    const smallPending = pending.filter((t) => Number(t.primaryAmount) < 1000);
    if (smallPending.length >= 5) {
      decisions.push(makeDecision({
        type: "payment",
        title: "Batch small payments for efficiency",
        description: `${smallPending.length} payments under $1,000 pending — consider batching`,
        affectedAccounts: [],
        affectedEntities: ["operations"],
        suggestedActions: [
          "Group by currency and counterparty",
          "Process as batch payment",
          "Review minimum payment thresholds",
        ],
        supportingEvidence: [
          `${smallPending.length} payments under $1,000`,
          `Total small payment value: ${smallPending.reduce((s, t) => s + Number(t.primaryAmount), 0).toFixed(2)}`,
        ],
        score: {
          businessValue: 2, urgency: 2, financialImpact: 1,
          operationalImpact: 4, confidence: 4, effort: 4, riskReduction: 1,
        },
        sourceService: "decision-intelligence:payment-evaluator",
        explainability: {
          why: `${smallPending.length} small payments (<$1,000) individually consume disproportionate processing effort`,
          evidenceUsed: ["transactions"],
          forecastsConsidered: [],
          policiesInvolved: [],
          assumptions: ["Batching reduces per-payment processing cost"],
          confidenceCalculation: "Confidence 4/5 — operational efficiency analysis",
          expectedOutcome: "Reduced processing overhead for small-value payments",
          alternativesConsidered: ["Set minimum payment threshold", "Require consolidation"],
        },
      }));
    }

    return { decisions, evaluatedAt: new Date().toISOString(), durationMs: Date.now() - startedAt };
  }
}
