import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { DecisionEvaluator } from "../engine";
import type { DecisionCategory, DecisionEvaluatorResult, Decision } from "../types";
import { makeDecision } from "../types";
import { GovernanceService } from "@/modules/governance/governance.service";

export class GovernanceDecisionEvaluator extends DecisionEvaluator {
  readonly category: DecisionCategory = "approval";
  readonly label = "Governance Decisions";

  async evaluate(ctx: TenantContext): Promise<DecisionEvaluatorResult> {
    const startedAt = Date.now();
    const decisions: Decision[] = [];

    const [metrics, violations, exceptions] = await Promise.all([
      GovernanceService.getMetrics(ctx).catch(() => null),
      GovernanceService.listViolations(ctx, { status: "OPEN", limit: 20 }).catch(() => []),
      GovernanceService.listExceptions(ctx, { status: "ACTIVE" }).catch(() => []),
    ]);

    if (!metrics) {
      return { decisions, evaluatedAt: new Date().toISOString(), durationMs: Date.now() - startedAt };
    }

    const healthScore = metrics.healthScore;

    if (healthScore.level === "critical") {
      decisions.push(makeDecision({
        type: "approval",
        title: "Governance health critical — escalate",
        description: `Governance health score is ${healthScore.overall}/100 (critical). Policy compliance: ${healthScore.categories.policyCompliance}%, violation trend: ${healthScore.categories.violationTrend}%.`,
        affectedAccounts: [],
        affectedEntities: ["compliance", "risk", "executive"],
        suggestedActions: [
          "Review critical violations immediately",
          "Schedule emergency compliance review",
          "Notify executive team of governance status",
          "Audit all recent policy exceptions",
        ],
        supportingEvidence: [
          `Health score: ${healthScore.overall}/100`,
          `Policy compliance: ${healthScore.categories.policyCompliance}%`,
          `Violation trend: ${healthScore.categories.violationTrend}%`,
          `${metrics.violations.critical} critical violations`,
          `${metrics.violations.open} open violations`,
        ],
        score: {
          businessValue: 5, urgency: 5, financialImpact: 4,
          operationalImpact: 5, confidence: 5, effort: 4, riskReduction: 5,
        },
        sourceService: "decision-intelligence:governance-evaluator",
        explainability: {
          why: `Governance health score ${healthScore.overall}/100 is in critical territory (below 50)`,
          evidenceUsed: ["governance_health_score", "policy_violations", "policy_exceptions"],
          forecastsConsidered: [],
          policiesInvolved: [],
          assumptions: ["Critical governance health requires immediate executive attention"],
          confidenceCalculation: "Confidence 5/5 — direct health score measurement",
          expectedOutcome: "Governance health stabilized through remediation actions",
          alternativesConsidered: ["Automated policy adjustments", "Temporary exception expansion"],
        },
      }));
    }

    if (healthScore.level === "attention") {
      decisions.push(makeDecision({
        type: "approval",
        title: "Governance health requires attention",
        description: `Governance health score is ${healthScore.overall}/100 (attention). Violations: ${metrics.violations.open} open, ${metrics.violations.critical} critical.`,
        affectedAccounts: [],
        affectedEntities: ["compliance", "risk"],
        suggestedActions: [
          `Resolve ${metrics.violations.open} open violations`,
          "Review policy compliance gaps",
          "Audit active exceptions",
          "Schedule governance review meeting",
        ],
        supportingEvidence: [
          `Health score: ${healthScore.overall}/100`,
          `${metrics.violations.open} open violations`,
          `${metrics.activeExceptions} active exceptions`,
          `${metrics.activeFrameworks} active frameworks`,
        ],
        score: {
          businessValue: 4, urgency: 3, financialImpact: 3,
          operationalImpact: 3, confidence: 4, effort: 3, riskReduction: 4,
        },
        sourceService: "decision-intelligence:governance-evaluator",
        explainability: {
          why: `Governance health score ${healthScore.overall}/100 is in attention territory — below the 75 threshold`,
          evidenceUsed: ["governance_health_score", "violations_summary"],
          forecastsConsidered: [],
          policiesInvolved: [],
          assumptions: ["Attention-level governance health can be improved with targeted actions"],
          confidenceCalculation: "Confidence 4/5 — health score trend analysis",
          expectedOutcome: "Governance health restored to healthy level",
          alternativesConsidered: ["Auto-resolve low-severity violations", "Increase exception scope"],
        },
      }));
    }

    if (violations.length > 5) {
      const criticalViolations = violations.filter((v) => v.severity === "CRITICAL");
      decisions.push(makeDecision({
        type: "approval",
        title: `Review ${violations.length} open policy violations`,
        description: `${violations.length} open violations require review. ${criticalViolations.length} critical. Resolve or acknowledge to improve governance posture.`,
        affectedAccounts: [],
        affectedEntities: ["compliance"],
        suggestedActions: [
          "Review and resolve critical violations first",
          "Acknowledge known issues",
          "Update policy thresholds if false positives",
          `Target: reduce violations to <5 (currently ${violations.length})`,
        ],
        supportingEvidence: [
          `${violations.length} open violations`,
          `${criticalViolations.length} critical severity`,
          ...violations.slice(0, 5).map((v) => `${v.title} [${v.severity}]`),
        ],
        score: {
          businessValue: 3, urgency: violations.length > 10 ? 4 : 3, financialImpact: 3,
          operationalImpact: 3, confidence: 4, effort: 4, riskReduction: 4,
        },
        sourceService: "decision-intelligence:governance-evaluator",
        explainability: {
          why: `${violations.length} open violations exceeds the recommended threshold of 5`,
          evidenceUsed: ["policy_violations"],
          forecastsConsidered: [],
          policiesInvolved: [],
          assumptions: ["Open violations increase regulatory and operational risk"],
          confidenceCalculation: "Confidence 4/5 — direct violation count",
          expectedOutcome: "Reduced violation backlog and improved compliance posture",
          alternativesConsidered: ["Bulk-resolve low severity", "Auto-acknowledge known patterns"],
        },
      }));
    }

    if (exceptions.length > 3) {
      decisions.push(makeDecision({
        type: "approval",
        title: `${exceptions.length} active policy exceptions to review`,
        description: `${exceptions.length} active exceptions — review for potential revocation or renewal`,
        affectedAccounts: [],
        affectedEntities: ["compliance"],
        suggestedActions: [
          "Review each exception for continued necessity",
          "Check expiration dates",
          "Revoke exceptions that no longer apply",
        ],
        supportingEvidence: [
          `${exceptions.length} active exceptions`,
          "Each exception represents a deviation from standard policy",
        ],
        score: {
          businessValue: 3, urgency: 2, financialImpact: 2,
          operationalImpact: 2, confidence: 3, effort: 3, riskReduction: 3,
        },
        sourceService: "decision-intelligence:governance-evaluator",
        explainability: {
          why: `${exceptions.length} active exceptions may indicate policy drift or excessive deviation`,
          evidenceUsed: ["policy_exceptions"],
          forecastsConsidered: [],
          policiesInvolved: [],
          assumptions: ["Exceptions should be temporary and regularly reviewed"],
          confidenceCalculation: "Confidence 3/5 — exception count review recommended",
          expectedOutcome: "Reduced exception footprint through review and revocation",
          alternativesConsidered: ["Auto-expire old exceptions", "Extend all exceptions"],
        },
      }));
    }

    if (metrics.violations.critical > 0) {
      decisions.push(makeDecision({
        type: "approval",
        title: `Resolve ${metrics.violations.critical} critical violations`,
        description: `${metrics.violations.critical} critical violations require immediate resolution to minimize regulatory and operational risk`,
        affectedAccounts: [],
        affectedEntities: ["compliance", "executive"],
        suggestedActions: [
          "Assign each critical violation to a responsible party",
          "Investigate root cause for each violation",
          "Implement remediation plan",
          "Document resolution for audit trail",
        ],
        supportingEvidence: [
          `${metrics.violations.critical} critical violations`,
          "Critical violations represent the highest governance risk",
        ],
        score: {
          businessValue: 5, urgency: 5, financialImpact: 5,
          operationalImpact: 4, confidence: 5, effort: 5, riskReduction: 5,
        },
        sourceService: "decision-intelligence:governance-evaluator",
        explainability: {
          why: `${metrics.violations.critical} critical violations pose the highest risk to governance compliance`,
          evidenceUsed: ["policy_violations"],
          forecastsConsidered: [],
          policiesInvolved: [],
          assumptions: ["Critical violations must be resolved for regulatory compliance"],
          confidenceCalculation: "Confidence 5/5 — direct severity classification",
          expectedOutcome: "Critical violations resolved, regulatory risk minimized",
          alternativesConsidered: ["Auto-escalate to regulators", "Accept risk with documentation"],
        },
      }));
    }

    return { decisions, evaluatedAt: new Date().toISOString(), durationMs: Date.now() - startedAt };
  }
}
