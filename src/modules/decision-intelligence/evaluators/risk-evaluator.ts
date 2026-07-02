import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { DecisionEvaluator } from "../engine";
import type { DecisionCategory, DecisionEvaluatorResult, Decision } from "../types";
import { makeDecision } from "../types";

export class RiskDecisionEvaluator extends DecisionEvaluator {
  readonly category: DecisionCategory = "risk";
  readonly label = "Risk Decisions";

  async evaluate(ctx: TenantContext): Promise<DecisionEvaluatorResult> {
    const startedAt = Date.now();
    const decisions: Decision[] = [];

    const [openAlerts, openIncidents, policyViolations, pendingApprovals] = await Promise.all([
      prisma.riskAlert.findMany({
        where: { companyId: ctx.companyId, status: "OPEN" },
        orderBy: { severity: "desc" }, take: 50,
      }),
      prisma.riskIncident.findMany({
        where: { companyId: ctx.companyId, status: { not: "RESOLVED" } },
        orderBy: { severity: "desc" }, take: 50,
      }),
      prisma.policyTestResult.count({
        where: { companyId: ctx.companyId, matched: false },
      }),
      prisma.transaction.count({
        where: { companyId: ctx.companyId, status: "PENDING_APPROVAL" },
      }),
    ]);

    const criticalAlerts = openAlerts.filter((a) => a.severity === "CRITICAL");
    const highAlerts = openAlerts.filter((a) => a.severity === "HIGH");

    // ── Investigate Critical Anomalies ──────────────────────────────────
    if (criticalAlerts.length > 0) {
      decisions.push(makeDecision({
        type: "risk",
        title: "Investigate critical anomalies",
        description: `${criticalAlerts.length} critical risk alerts require immediate investigation`,
        affectedAccounts: [],
        affectedEntities: ["risk", "compliance"],
        suggestedActions: [
          "Assign each alert to a risk analyst",
          "Open incidents for confirmed issues",
          "Begin root cause analysis",
        ],
        supportingEvidence: criticalAlerts.map((a) => `[${a.category}] ${a.title}`),
        score: {
          businessValue: 5, urgency: 5, financialImpact: 5,
          operationalImpact: 4, confidence: 5, effort: 4, riskReduction: 5,
        },
        sourceService: "decision-intelligence:risk-evaluator",
        explainability: {
          why: `${criticalAlerts.length} alerts at CRITICAL severity represent the highest risk to the organization`,
          evidenceUsed: ["risk_alerts"],
          forecastsConsidered: [],
          policiesInvolved: [],
          assumptions: ["CRITICAL alerts require immediate action"],
          confidenceCalculation: "Confidence 5/5 — direct severity classification",
          expectedOutcome: "Critical risks investigated and mitigated",
          alternativesConsidered: ["Batch process all alerts", "Automated response per category"],
        },
      }));
    }

    // ── Review Policy Violations ────────────────────────────────────────
    if (policyViolations > 5) {
      decisions.push(makeDecision({
        type: "risk",
        title: "Review policy violations",
        description: `${policyViolations} policy evaluation failures detected — review and address`,
        affectedAccounts: [],
        affectedEntities: ["compliance", "risk"],
        suggestedActions: [
          "Review violation patterns by policy",
          "Update policy thresholds if false positives",
          "Investigate systemic violation causes",
        ],
        supportingEvidence: [
          `${policyViolations} total violations`,
          "Violations may indicate compliance gaps or false positive configurations",
        ],
        score: {
          businessValue: 4, urgency: 3, financialImpact: 3,
          operationalImpact: 3, confidence: 4, effort: 3, riskReduction: 5,
        },
        sourceService: "decision-intelligence:risk-evaluator",
        explainability: {
          why: `${policyViolations} policy violations suggest either compliance gaps or misconfigured policy thresholds`,
          evidenceUsed: ["policy_test_results"],
          forecastsConsidered: [],
          policiesInvolved: ["All active policies"],
          assumptions: ["Violations require investigation, not automatic action"],
          confidenceCalculation: "Confidence 4/5 — direct violation count analysis",
          expectedOutcome: "Policy violations reduced through threshold tuning or behavior correction",
          alternativesConsidered: ["Auto-escalate violations", "Disable highly-flagged policies"],
        },
      }));
    }

    // ── Require Additional Approvals ────────────────────────────────────
    if (highAlerts.length > 3) {
      decisions.push(makeDecision({
        type: "risk",
        title: "Require additional approvals due to risk",
        description: `${highAlerts.length} HIGH alerts active — consider additional approval requirements`,
        affectedAccounts: [],
        affectedEntities: ["risk", "compliance", "operations"],
        suggestedActions: [
          "Enable dual approval for all transactions",
          "Increase approval thresholds temporarily",
          "Notify compliance team of elevated risk state",
        ],
        supportingEvidence: [
          `${highAlerts.length} HIGH severity alerts active`,
          "Elevated risk environment warrants stricter controls",
        ],
        score: {
          businessValue: 3, urgency: 4, financialImpact: 3,
          operationalImpact: 4, confidence: 3, effort: 2, riskReduction: 4,
        },
        sourceService: "decision-intelligence:risk-evaluator",
        explainability: {
          why: `${highAlerts.length} HIGH alerts create an elevated risk environment requiring stricter controls`,
          evidenceUsed: ["risk_alerts"],
          forecastsConsidered: [],
          policiesInvolved: ["Approval rules with escalation paths"],
          assumptions: ["Additional approvals reduce transaction risk in high-alert periods"],
          confidenceCalculation: "Confidence 3/5 — risk-response correlation is probabilistic",
          expectedOutcome: "Reduced risk exposure through enhanced approval controls",
          alternativesConsidered: ["Pause all transactions", "Increase monitoring only"],
        },
      }));
    }

    // ── Flag Suspicious Activity ────────────────────────────────────────
    const suspiciousAlerts = openAlerts.filter((a) => a.category === "SUSPICIOUS_ACTIVITY");
    if (suspiciousAlerts.length > 0) {
      decisions.push(makeDecision({
        type: "risk",
        title: "Flag suspicious activity",
        description: `${suspiciousAlerts.length} suspicious activity alerts require investigation`,
        affectedAccounts: [],
        affectedEntities: ["risk", "compliance", "legal"],
        suggestedActions: [
          "Review each suspicious activity alert",
          "Check related transactions and user actions",
          "Engage compliance for regulatory reporting",
        ],
        supportingEvidence: suspiciousAlerts.map((a) => `${a.title} [${a.severity}]`),
        score: {
          businessValue: 5, urgency: 5, financialImpact: 4,
          operationalImpact: 3, confidence: 4, effort: 4, riskReduction: 5,
        },
        sourceService: "decision-intelligence:risk-evaluator",
        explainability: {
          why: `${suspiciousAlerts.length} alerts flagged as suspicious activity require immediate compliance review`,
          evidenceUsed: ["risk_alerts"],
          forecastsConsidered: [],
          policiesInvolved: ["AML policies", "Compliance policies"],
          assumptions: ["Suspicious activity requires human investigation"],
          confidenceCalculation: "Confidence 4/5 — category classification from alert engine",
          expectedOutcome: "Suspicious activity investigated and reported as required by regulation",
          alternativesConsidered: ["Auto-report to authorities", "Hold related transactions"],
        },
      }));
    }

    return { decisions, evaluatedAt: new Date().toISOString(), durationMs: Date.now() - startedAt };
  }
}
