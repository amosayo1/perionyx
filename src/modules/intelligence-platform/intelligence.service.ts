import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  FinancialScoreData,
  KPIValueData,
  IntelligenceRecommendationData,
  IntelligenceTrendData,
  HealthAlertData,
  HealthDashboardData,
  ScoreType,
  Severity,
  InsightEventData,
} from "./types";
import { FinancialIntegrityEngine } from "./engines/financial-integrity.engine";
import { CloseReadinessEngine } from "./engines/close-readiness.engine";
import { TreasuryIntelligenceEngine } from "./engines/treasury-intelligence.engine";
import { WorkingCapitalEngine } from "./engines/working-capital.engine";
import { OperationalIntelligenceEngine } from "./engines/operational-intelligence.engine";
import { ComplianceIntelligenceEngine } from "./engines/compliance-intelligence.engine";
import { KPIFramework } from "./kpi-framework";
import { RecommendationEngine } from "./recommendation.engine";
import { TrendEngine } from "./trend.engine";
import { IntelligenceNotificationService } from "./notification.service";

export class IntelligencePlatformService {
  static async runFullAssessment(ctx: TenantContext): Promise<{
    scores: FinancialScoreData[];
    kpis: KPIValueData[];
    recommendations: IntelligenceRecommendationData[];
    trends: IntelligenceTrendData[];
    alerts: HealthAlertData[];
  }> {
    const companyId = ctx.companyId;

    // 1. Run all 6 engines
    const [integrityResult, closeResult, treasuryResult, workingCapitalResult, operationalResult, complianceResult] =
      await Promise.all([
        FinancialIntegrityEngine.calculate(ctx),
        CloseReadinessEngine.calculate(ctx),
        TreasuryIntelligenceEngine.calculate(ctx),
        WorkingCapitalEngine.calculate(ctx),
        OperationalIntelligenceEngine.calculate(ctx),
        ComplianceIntelligenceEngine.calculate(ctx),
      ]);

    const engineResults = [
      { scoreType: "integrity" as ScoreType, result: integrityResult },
      { scoreType: "close-readiness" as ScoreType, result: closeResult },
      { scoreType: "treasury-health" as ScoreType, result: treasuryResult },
      { scoreType: "working-capital" as ScoreType, result: workingCapitalResult },
      { scoreType: "operational" as ScoreType, result: operationalResult },
      { scoreType: "compliance" as ScoreType, result: complianceResult },
    ];

    // 2. Store all scores
    const scores: FinancialScoreData[] = [];
    for (const { scoreType, result } of engineResults) {
      const record = await prisma.financialScore.create({
        data: {
          companyId,
          scoreType,
          score: result.score,
          previousScore: result.previousScore,
          change: result.previousScore !== undefined ? result.score - result.previousScore : undefined,
          changePercent:
            result.previousScore && result.previousScore !== 0
              ? ((result.score - result.previousScore) / result.previousScore) * 100
              : undefined,
          severity: result.severity,
          summary: result.summary,
          components: result.components as any,
          evidence: result.evidence as any,
          calculatedAt: new Date(),
        } as any,
      });

      scores.push({
        id: record.id,
        companyId: record.companyId,
        scoreType: record.scoreType as ScoreType,
        score: record.score,
        previousScore: record.previousScore ?? undefined,
        change: record.change ?? undefined,
        changePercent: record.changePercent ?? undefined,
        severity: record.severity as Severity,
        summary: record.summary ?? undefined,
        components: (record.components as any) ?? undefined,
        evidence: (record.evidence as Record<string, unknown>) ?? undefined,
        calculatedAt: record.calculatedAt.toISOString(),
        createdAt: record.createdAt.toISOString(),
      });
    }

    // 3. Compute and store KPIs
    const kpis = await KPIFramework.computeAndStore(ctx);

    // 4. Generate and store recommendations
    const recommendations = await RecommendationEngine.generate(ctx);

    // 5. Compute trends
    const trends = await TrendEngine.compute(ctx, "monthly");

    // 6. Evaluate and create notifications
    await IntelligenceNotificationService.evaluateAndNotify(ctx);

    // 7. Get alerts
    const alerts = await IntelligenceNotificationService.getAlerts(ctx, { isResolved: false });

    return { scores, kpis, recommendations, trends, alerts };
  }

  static async getDashboard(ctx: TenantContext): Promise<HealthDashboardData> {
    const companyId = ctx.companyId;

    const [scores, kpis, recommendations, alerts, treasuryPositions, insights] = await Promise.all([
      // Latest scores per type
      Promise.all(
        (["integrity", "close-readiness", "treasury-health", "working-capital", "operational", "compliance"] as const).map(
          async (scoreType) => {
            const r = await prisma.financialScore.findFirst({
              where: { companyId, scoreType },
              orderBy: { calculatedAt: "desc" },
            });
            return r;
          },
        ),
      ),
      // Latest KPIs
      prisma.kPIValue.findMany({
        where: { companyId },
        orderBy: { recordedAt: "desc" },
        distinct: ["kpiKey"],
        take: 50,
      }),
      // Active recommendations
      prisma.intelligenceRecommendation.findMany({
        where: { companyId, status: "active" },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      // Unresolved alerts
      prisma.healthAlert.findMany({
        where: { companyId, isResolved: false },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      // Cash position
      prisma.treasuryCashPosition.aggregate({
        where: { companyId },
        _sum: { availableBalance: true },
      }),
      // Recent insights
      prisma.insightEvent.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

    const mappedScores: FinancialScoreData[] = scores.filter(Boolean).map((r) => r!)!.map((r) => ({
      id: r.id,
      companyId: r.companyId,
      scoreType: r.scoreType as ScoreType,
      score: r.score,
      previousScore: r.previousScore ?? undefined,
      change: r.change ?? undefined,
      changePercent: r.changePercent ?? undefined,
      severity: r.severity as Severity,
      summary: r.summary ?? undefined,
      calculatedAt: r.calculatedAt.toISOString(),
      createdAt: r.createdAt.toISOString(),
    }));

    const mappedKpis: KPIValueData[] = kpis.map((r) => ({
      id: r.id,
      companyId: r.companyId,
      kpiKey: r.kpiKey,
      label: r.label,
      category: r.category as any,
      currentValue: r.currentValue,
      previousValue: r.previousValue ?? undefined,
      targetValue: r.targetValue ?? undefined,
      thresholdLow: r.thresholdLow ?? undefined,
      thresholdHigh: r.thresholdHigh ?? undefined,
      unit: r.unit ?? undefined,
      trend: (r.trend ?? undefined) as any,
      variance: r.variance ?? undefined,
      variancePercent: r.variancePercent ?? undefined,
      status: r.status as any,
      metadata: (r.metadata ?? undefined) as Record<string, unknown> | undefined,
      recordedAt: r.recordedAt.toISOString(),
    }));

    const mappedRecommendations: IntelligenceRecommendationData[] = recommendations.map((r) => ({
      id: r.id,
      companyId: r.companyId,
      category: r.category as any,
      title: r.title,
      description: r.description ?? undefined,
      reason: r.reason,
      evidence: (r.evidence ?? undefined) as Record<string, unknown> | undefined,
      confidence: r.confidence as any,
      priority: r.priority as any,
      affectedModules: (r.affectedModules as string[]) ?? undefined,
      expectedImpact: r.expectedImpact ?? undefined,
      status: r.status as any,
      sourceScoreType: r.sourceScoreType ?? undefined,
      actionUrl: r.actionUrl ?? undefined,
      createdAt: r.createdAt.toISOString(),
      resolvedAt: r.resolvedAt?.toISOString(),
    }));

    const mappedAlerts: HealthAlertData[] = alerts.map((r) => ({
      id: r.id,
      companyId: r.companyId,
      alertType: r.alertType as any,
      title: r.title,
      message: r.message ?? undefined,
      severity: r.severity as Severity,
      scoreType: r.scoreType ?? undefined,
      threshold: r.threshold ?? undefined,
      currentValue: r.currentValue ?? undefined,
      isResolved: r.isResolved,
      resolvedAt: r.resolvedAt?.toISOString(),
      createdAt: r.createdAt.toISOString(),
    }));

    const mappedInsights: InsightEventData[] = insights.map((r) => ({
      id: r.id,
      companyId: r.companyId,
      eventType: r.eventType as any,
      title: r.title,
      description: r.description ?? undefined,
      severity: r.severity as Severity,
      impact: r.impact ?? undefined,
      evidence: (r.evidence ?? undefined) as Record<string, unknown> | undefined,
      metadata: (r.metadata ?? undefined) as Record<string, unknown> | undefined,
      isRead: r.isRead,
      createdAt: r.createdAt.toISOString(),
    }));

    // Trend summaries
    const trends = await prisma.intelligenceTrend.findMany({
      where: { companyId },
      orderBy: { calculatedAt: "desc" },
      distinct: ["trendKey"],
      take: 20,
    });

    const trendSummaries = trends.map((t) => ({
      key: t.trendKey,
      label: t.label,
      direction: t.direction,
      changePercent: t.changePercent ?? undefined,
    }));

    return {
      scores: mappedScores,
      kpis: mappedKpis,
      recommendations: mappedRecommendations,
      alerts: mappedAlerts,
      cashPosition: Number(treasuryPositions._sum.availableBalance ?? 0),
      insights: mappedInsights,
      trendSummaries,
    };
  }

  static async getScores(ctx: TenantContext): Promise<FinancialScoreData[]> {
    const records = await prisma.financialScore.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { calculatedAt: "desc" },
      distinct: ["scoreType"],
    });

    return records.map((r) => ({
      id: r.id,
      companyId: r.companyId,
      scoreType: r.scoreType as ScoreType,
      score: r.score,
      previousScore: r.previousScore ?? undefined,
      change: r.change ?? undefined,
      changePercent: r.changePercent ?? undefined,
      severity: r.severity as Severity,
      summary: r.summary ?? undefined,
      components: (r.components as any) ?? undefined,
      evidence: (r.evidence as Record<string, unknown>) ?? undefined,
      calculatedAt: r.calculatedAt.toISOString(),
      createdAt: r.createdAt.toISOString(),
    }));
  }

  static async getScore(ctx: TenantContext, scoreType: ScoreType): Promise<FinancialScoreData | null> {
    const record = await prisma.financialScore.findFirst({
      where: { companyId: ctx.companyId, scoreType },
      orderBy: { calculatedAt: "desc" },
    });

    if (!record) return null;

    return {
      id: record.id,
      companyId: record.companyId,
      scoreType: record.scoreType as ScoreType,
      score: record.score,
      previousScore: record.previousScore ?? undefined,
      change: record.change ?? undefined,
      changePercent: record.changePercent ?? undefined,
      severity: record.severity as Severity,
      summary: record.summary ?? undefined,
      components: (record.components as any) ?? undefined,
      evidence: (record.evidence as Record<string, unknown>) ?? undefined,
      calculatedAt: record.calculatedAt.toISOString(),
      createdAt: record.createdAt.toISOString(),
    };
  }
}
