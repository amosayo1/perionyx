import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { IntelligenceEngine } from "../engine";
import type { IntelligenceCategory, IntelligenceEngineResult } from "../types";
import { makeInsight, makeRecommendation } from "../types";
import { GovernanceService } from "@/modules/governance/governance.service";

export class GovernanceIntelligenceEngine extends IntelligenceEngine {
  readonly category: IntelligenceCategory = "compliance";
  readonly label = "Governance Intelligence";

  async evaluate(ctx: TenantContext): Promise<IntelligenceEngineResult> {
    const startedAt = Date.now();
    const insights: any[] = [];
    const recommendations: any[] = [];

    const [metrics, violations, exceptions, frameworks] = await Promise.all([
      GovernanceService.getMetrics(ctx).catch(() => null),
      GovernanceService.listViolations(ctx, { status: "OPEN", limit: 20 }).catch(() => []),
      GovernanceService.listExceptions(ctx, { status: "ACTIVE" }).catch(() => []),
      prisma.governanceFramework.findMany({
        where: { companyId: ctx.companyId },
        take: 20,
      }).catch(() => []),
    ]);

    if (!metrics) {
      return { insights, recommendations, evaluatedAt: new Date().toISOString(), durationMs: Date.now() - startedAt };
    }

    const healthScore = metrics.healthScore;

    // ── Health Score Insights ────────────────────────────────────────────
    if (healthScore.level === "critical") {
      insights.push(makeInsight({
        id: `gov-health-critical-${ctx.companyId}`,
        category: "compliance",
        title: "Governance health critical",
        description: `Governance health score is ${healthScore.overall}/100 — critical level. Policy compliance: ${healthScore.categories.policyCompliance}%, violation trend: ${healthScore.categories.violationTrend}%.`,
        severity: "critical", confidence: 100,
        sourceData: ["governance_health_score", "policy_violations"],
        timestamp: new Date().toISOString(),
        metadata: { healthScore: healthScore.overall, level: healthScore.level },
        explainability: {
          why: `Health score ${healthScore.overall} is below the critical threshold of 50`,
          evidence: [`Policy compliance: ${healthScore.categories.policyCompliance}%`, `Violation trend: ${healthScore.categories.violationTrend}%`],
          confidenceCalculation: "100% — direct health score computation",
          whatToDo: "Immediate remediation of violations and policy gaps required",
        },
      }));
    } else if (healthScore.level === "attention") {
      insights.push(makeInsight({
        id: `gov-health-attention-${ctx.companyId}`,
        category: "compliance",
        title: "Governance health needs attention",
        description: `Governance health score is ${healthScore.overall}/100 — attention level (below 75). Open violations: ${metrics.violations.open}.`,
        severity: "high", confidence: 95,
        sourceData: ["governance_health_score"],
        timestamp: new Date().toISOString(),
        metadata: { healthScore: healthScore.overall, level: healthScore.level },
        explainability: {
          why: `Health score ${healthScore.overall} is below the healthy threshold of 75`,
          evidence: [`Open violations: ${metrics.violations.open}`, `Active exceptions: ${metrics.activeExceptions}`],
          confidenceCalculation: "95% — health score with violation correlation",
          whatToDo: "Review and address top contributors to governance score",
        },
      }));
    }

    // ── Violation Trend Insight ──────────────────────────────────────────
    const recentTrend = metrics.violations.trend.slice(-3);
    const latestCount = recentTrend[recentTrend.length - 1]?.count ?? 0;
    const priorCount = recentTrend[recentTrend.length - 2]?.count ?? 0;

    if (latestCount > priorCount && latestCount > 0) {
      insights.push(makeInsight({
        id: `gov-violation-trend-${ctx.companyId}`,
        category: "compliance",
        title: "Violation trend increasing",
        description: `Violations increased from ${priorCount} to ${latestCount} in the latest period. Total open: ${metrics.violations.open}.`,
        severity: latestCount > priorCount * 2 ? "critical" : "high",
        confidence: 85, sourceData: ["policy_violations", "violation_trend"],
        timestamp: new Date().toISOString(),
        metadata: { previousCount: priorCount, currentCount: latestCount },
        explainability: {
          why: `Violation count increased by ${latestCount - priorCount} compared to previous period`,
          evidence: [`Previous period: ${priorCount}`, `Current period: ${latestCount}`],
          confidenceCalculation: "85% — trend analysis with limited data points",
          whatToDo: "Investigate root cause of increased violations",
        },
      }));
    }

    // ── Critical Violations Summary ──────────────────────────────────────
    if (metrics.violations.critical > 0) {
      insights.push(makeInsight({
        id: `gov-critical-violations-${ctx.companyId}`,
        category: "compliance",
        title: `${metrics.violations.critical} critical violations open`,
        description: `${metrics.violations.critical} violations at CRITICAL severity require immediate attention. Total open: ${metrics.violations.open}.`,
        severity: "critical", confidence: 100,
        sourceData: ["policy_violations"],
        timestamp: new Date().toISOString(),
        metadata: { criticalCount: metrics.violations.critical },
        explainability: {
          why: `${metrics.violations.critical} violations classified as CRITICAL severity`,
          evidence: [`Critical count: ${metrics.violations.critical}`, `Total open: ${metrics.violations.open}`],
          confidenceCalculation: "100% — direct severity count",
          whatToDo: "Resolve critical violations immediately",
        },
      }));

      recommendations.push(makeRecommendation({
        id: `rec-gov-critical-${ctx.companyId}`,
        title: "Resolve critical governance violations",
        description: `${metrics.violations.critical} critical violations require immediate resolution`,
        severity: "critical", confidence: 100, category: "compliance",
        affectedEntities: ["compliance", "executive"],
        affectedAccounts: [],
        supportingEvidence: [`${metrics.violations.critical} critical violations`, ...violations.filter((v) => v.severity === "CRITICAL").map((v) => v.title)],
        suggestedActions: ["Assign critical violations to responsible parties", "Investigate root cause", "Implement remediation"],
        relatedInsightIds: [`gov-critical-violations-${ctx.companyId}`],
        relatedEventIds: [],
        timestamp: new Date().toISOString(),
      }));
    }

    // ── Policy Compliance Rate ───────────────────────────────────────────
    const complianceRate = healthScore.categories.policyCompliance;
    if (complianceRate < 70) {
      insights.push(makeInsight({
        id: `gov-compliance-rate-${ctx.companyId}`,
        category: "compliance",
        title: "Policy compliance rate below threshold",
        description: `Policy compliance score is ${complianceRate}%, below the 70% target`,
        severity: complianceRate < 50 ? "critical" : "high",
        confidence: 95, sourceData: ["policy_compliance", "policy_violations"],
        timestamp: new Date().toISOString(),
        metadata: { complianceRate },
        explainability: {
          why: `Policy compliance at ${complianceRate}% indicates significant policy gaps`,
          evidence: [`Compliance rate: ${complianceRate}%`, `Target: 70%`],
          confidenceCalculation: "95% — direct compliance score computation",
          whatToDo: "Review violated policies and adjust thresholds or improve compliance",
        },
      }));

      recommendations.push(makeRecommendation({
        id: `rec-gov-compliance-${ctx.companyId}`,
        title: "Improve policy compliance rate",
        description: `Policy compliance is at ${complianceRate}% — needs to reach 70%`,
        severity: complianceRate < 50 ? "critical" : "high",
        confidence: 95, category: "compliance",
        affectedEntities: ["compliance", "operations"],
        affectedAccounts: [],
        supportingEvidence: [`Current compliance rate: ${complianceRate}%`, `Target: 70%`],
        suggestedActions: ["Review top violated policies", "Identify false positive patterns", "Update policy thresholds", "Conduct compliance training"],
        relatedInsightIds: [`gov-compliance-rate-${ctx.companyId}`],
        relatedEventIds: [],
        timestamp: new Date().toISOString(),
      }));
    }

    // ── Exception Volume ─────────────────────────────────────────────────
    if (exceptions.length > 5) {
      insights.push(makeInsight({
        id: `gov-exception-volume-${ctx.companyId}`,
        category: "compliance",
        title: "High exception volume",
        description: `${exceptions.length} active policy exceptions — review for potential policy drift`,
        severity: "medium", confidence: 85,
        sourceData: ["policy_exceptions"],
        timestamp: new Date().toISOString(),
        metadata: { exceptionCount: exceptions.length },
        explainability: {
          why: `${exceptions.length} active exceptions may indicate systemic policy issues or excessive deviation`,
          evidence: [`Active exceptions: ${exceptions.length}`, `Healthy max: 5`],
          confidenceCalculation: "85% — exception volume analysis",
          whatToDo: "Review each exception for continued necessity and revoke where possible",
        },
      }));
    }

    // ── Framework Coverage ───────────────────────────────────────────────
    if (frameworks.length === 0) {
      insights.push(makeInsight({
        id: `gov-no-frameworks-${ctx.companyId}`,
        category: "compliance",
        title: "No governance frameworks defined",
        description: "No governance frameworks are configured. Consider defining frameworks to structure policy compliance and regulatory alignment.",
        severity: "medium", confidence: 100,
        sourceData: ["governance_frameworks"],
        timestamp: new Date().toISOString(),
        explainability: {
          why: "Zero governance frameworks detected — compliance structure may be incomplete",
          evidence: ["Framework count: 0"],
          confidenceCalculation: "100% — direct framework count",
          whatToDo: "Define at least one governance framework to organize policies",
        },
      }));

      recommendations.push(makeRecommendation({
        id: `rec-gov-frameworks-${ctx.companyId}`,
        title: "Define governance frameworks",
        description: "No governance frameworks configured — define frameworks to organize and track policy compliance",
        severity: "medium", confidence: 100, category: "compliance",
        affectedEntities: ["compliance"],
        affectedAccounts: [],
        supportingEvidence: ["Zero governance frameworks detected"],
        suggestedActions: ["Create a governance framework", "Link policies to the framework", "Set compliance targets per framework"],
        relatedInsightIds: [`gov-no-frameworks-${ctx.companyId}`],
        relatedEventIds: [],
        timestamp: new Date().toISOString(),
      }));
    }

    return { insights, recommendations, evaluatedAt: new Date().toISOString(), durationMs: Date.now() - startedAt };
  }
}
