// ─────────────────────────────────────────────────────────────
// Enterprise Treasury Specialist — Main Facade
// ─────────────────────────────────────────────────────────────

import { Prisma, AuditSeverity } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { CashPositionService } from "./cash-position";
import { LiquidityService } from "./liquidity";
import { FXExposureService } from "./fx-exposure";
import { DebtService } from "./debt";
import { InvestmentService } from "./investments";
import { TreasuryRiskService } from "./treasury-risk";
import type {
  TreasuryDashboardData,
  BriefingRecord,
  RecommendationSummary,
  LiquidityHorizon,
  BriefingType,
  GetRecommendationsInput,
  GetAlertsInput,
  GenerateBriefingInput,
  CreateRecommendationInput,
  UpdateRecommendationInput,
  AlertType,
  AlertSeverity,
  AlertStatus,
} from "./types";

export class TreasurySpecialistService {
  // ─── Dashboard ─────────────────────────────────────────────

  /**
   * Aggregate dashboard data across all treasury domains.
   */
  static async getDashboard(
    ctx: TenantContext,
  ): Promise<TreasuryDashboardData> {
    const [
      cashPosition,
      liquidity,
      fxExposure,
      debtInstruments,
      debtCovenants,
      investmentSummary,
      riskSummary,
      alerts,
      recentBriefings,
      recommendationSummary,
      latestHealth,
    ] = await Promise.all([
      CashPositionService.getGlobalCashPosition(ctx),
      LiquidityService.getLiquidityPosition(ctx),
      FXExposureService.getFXExposure(ctx),
      DebtService.getDebtInstruments(ctx),
      DebtService.getDebtCovenants(ctx),
      InvestmentService.getPortfolioSummary(ctx),
      TreasuryRiskService.getRiskSummary(ctx),
      this.getActiveAlerts(ctx),
      this.getRecentBriefings(ctx, 5),
      this.getRecommendationSummary(ctx),
      prisma.treasuryHealthSnapshot.findFirst({
        where: { companyId: ctx.companyId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalOutstanding = debtInstruments.reduce(
      (sum, i) => sum.add(i.outstandingBalance),
      new Prisma.Decimal(0),
    );

    const totalUtilization = debtInstruments.reduce(
      (sum, i) => sum.add(i.utilization),
      new Prisma.Decimal(0),
    ).div(debtInstruments.length || 1);

    const averageDebtHealth =
      debtInstruments.length > 0
        ? debtInstruments
            .reduce((sum, i) => sum.add(i.healthScore), new Prisma.Decimal(0))
            .div(debtInstruments.length)
        : new Prisma.Decimal(0);

    const covenantsInWarning = debtCovenants.filter(
      (c) => c.status === "warning",
    ).length;

    const covenantsInBreach = debtCovenants.filter(
      (c) => c.status === "breach",
    ).length;

    const now = new Date();
    const upcomingMaturities = debtInstruments
      .filter((i) => i.maturityDate >= now)
      .slice(0, 10)
      .map((i) => ({
        id: i.id,
        instrumentType: i.instrumentType,
        lenderName: i.lenderName,
        outstandingBalance: i.outstandingBalance,
        maturityDate: i.maturityDate,
        daysToMaturity: Math.ceil(
          (i.maturityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        ),
      }));

    return {
      cashPosition,
      liquidity,
      fxExposure,
      debtOverview: {
        totalOutstanding,
        totalUtilization,
        averageHealthScore: averageDebtHealth,
        covenantsInWarning,
        covenantsInBreach,
        upcomingMaturities,
      },
      investmentOverview: investmentSummary,
      risks: riskSummary,
      alerts,
      recentBriefings,
      recommendations: recommendationSummary,
      healthScore: latestHealth?.overallScore ?? new Prisma.Decimal(0),
    };
  }

  // ─── Cash Command Center ───────────────────────────────────

  /**
   * Full cash visibility — positions, restricted, in-transit, concentrations.
   */
  static async getCashCommandCenter(ctx: TenantContext) {
    const [
      globalPosition,
      byCompany,
      byBank,
      byCurrency,
      byRegion,
      concentration,
      restrictedCash,
      inTransitFunds,
    ] = await Promise.all([
      CashPositionService.getGlobalCashPosition(ctx),
      CashPositionService.getCashByCompany(ctx),
      CashPositionService.getCashByBank(ctx),
      CashPositionService.getCashByCurrency(ctx),
      CashPositionService.getCashByRegion(ctx),
      CashPositionService.getCashConcentration(ctx),
      CashPositionService.getRestrictedCash(ctx),
      CashPositionService.getInTransitFunds(ctx),
    ]);

    return {
      globalPosition,
      byCompany,
      byBank,
      byCurrency,
      byRegion,
      concentrationScore: concentration,
      restrictedCash,
      inTransitFunds,
    };
  }

  // ─── Liquidity Center ──────────────────────────────────────

  /**
   * Liquidity overview — position, burn rate, score.
   */
  static async getLiquidityCenter(ctx: TenantContext) {
    const [position, burnRate, score] = await Promise.all([
      LiquidityService.getLiquidityPosition(ctx),
      LiquidityService.getBurnRate(ctx),
      LiquidityService.getLiquidityScore(ctx),
    ]);

    return {
      position,
      burnRate,
      score,
    };
  }

  // ─── Forecast Center ───────────────────────────────────────

  /**
   * Forecasting data — forecasts, scenarios, burn rate for a given horizon.
   */
  static async getForecastCenter(
    ctx: TenantContext,
    horizon: LiquidityHorizon = "daily",
  ) {
    const [forecasts, burnRate] = await Promise.all([
      LiquidityService.getLiquidityForecast(ctx, horizon),
      LiquidityService.getBurnRate(ctx),
    ]);

    const latestForecast = forecasts[0] ?? null;
    const scenarios = latestForecast
      ? await LiquidityService.getScenarios(ctx, latestForecast.id)
      : [];

    return {
      forecasts,
      latestForecast,
      scenarios,
      burnRate,
      horizon,
    };
  }

  // ─── FX Center ─────────────────────────────────────────────

  /**
   * FX overview — exposure, by currency, by region, recommendations.
   */
  static async getFXCenter(ctx: TenantContext) {
    const [exposure, byCurrency, byRegion, netPosition, hedgingOpps, recommendations] =
      await Promise.all([
        FXExposureService.getFXExposure(ctx),
        FXExposureService.getExposureByCurrency(ctx),
        FXExposureService.getExposureByRegion(ctx),
        FXExposureService.getNetOpenPosition(ctx),
        FXExposureService.getHedgingOpportunities(ctx),
        FXExposureService.getFXRecommendations(ctx),
      ]);

    return {
      exposure,
      byCurrency,
      byRegion,
      netOpenPosition: netPosition,
      hedgingOpportunities: hedgingOpps,
      recommendations,
    };
  }

  // ─── Bank Operations ───────────────────────────────────────

  /**
   * Bank relationships overview.
   */
  static async getBankOperations(ctx: TenantContext) {
    const relationships = await prisma.bankRelationship.findMany({
      where: { companyId: ctx.companyId },
      include: {
        healthChecks: {
          orderBy: { assessmentDate: "desc" },
          take: 1,
        },
      },
      orderBy: { healthScore: "desc" },
    });

    const totalBalance = relationships.reduce(
      (sum, r) => sum.add(r.totalBalance),
      new Prisma.Decimal(0),
    );

    const averageHealthScore =
      relationships.length > 0
        ? relationships
            .reduce((sum, r) => sum.add(r.healthScore), new Prisma.Decimal(0))
            .div(relationships.length)
            .toDecimalPlaces(4)
        : new Prisma.Decimal(0);

    const activeCount = relationships.filter(
      (r) => r.connectionStatus === "active",
    ).length;

    const errorCount = relationships.filter(
      (r) => r.connectionStatus === "error",
    ).length;

    return {
      relationships,
      totalBalance,
      averageHealthScore,
      activeCount,
      errorCount,
      totalCount: relationships.length,
    };
  }

  // ─── Debt Management ──────────────────────────────────────

  /**
   * Debt overview — instruments, covenants, alerts, health, maturity.
   */
  static async getDebtManagement(ctx: TenantContext) {
    const [instruments, covenants, alerts, healthScore, maturitySchedule, refinancingOpps] =
      await Promise.all([
        DebtService.getDebtInstruments(ctx),
        DebtService.getDebtCovenants(ctx),
        DebtService.getDebtAlerts(ctx),
        DebtService.getDebtHealthScore(ctx),
        DebtService.getMaturitySchedule(ctx),
        DebtService.getRefinancingOpportunities(ctx),
      ]);

    return {
      instruments,
      covenants,
      alerts,
      healthScore,
      maturitySchedule,
      refinancingOpportunities: refinancingOpps,
    };
  }

  // ─── Investment Portfolio ──────────────────────────────────

  /**
   * Investment overview — holdings, allocation, liquidity, counterparties.
   */
  static async getInvestmentPortfolio(ctx: TenantContext) {
    const [holdings, allocation, liquidityClassification, counterpartyExposure, maturitySchedule, recommendations, portfolioSummary] =
      await Promise.all([
        InvestmentService.getInvestmentHoldings(ctx),
        InvestmentService.getPortfolioAllocation(ctx),
        InvestmentService.getLiquidityClassification(ctx),
        InvestmentService.getCounterpartyExposure(ctx),
        InvestmentService.getMaturitySchedule(ctx),
        InvestmentService.getInvestmentRecommendations(ctx),
        InvestmentService.getPortfolioSummary(ctx),
      ]);

    return {
      holdings,
      allocation,
      liquidityClassification,
      counterpartyExposure,
      maturitySchedule,
      recommendations,
      portfolioSummary,
    };
  }

  // ─── Risk Center ──────────────────────────────────────────

  /**
   * Risk overview — risks by type, heatmap, trends, score.
   */
  static async getRiskCenter(ctx: TenantContext) {
    const [risks, byType, heatmap, trends, score, riskSummary] = await Promise.all([
      TreasuryRiskService.getTreasuryRisks(ctx),
      TreasuryRiskService.getRisksByType(ctx),
      TreasuryRiskService.getRiskHeatmap(ctx),
      TreasuryRiskService.getRiskTrends(ctx),
      TreasuryRiskService.getRiskScore(ctx),
      TreasuryRiskService.getRiskSummary(ctx),
    ]);

    return {
      risks,
      byType,
      heatmap,
      trends,
      score,
      summary: riskSummary,
    };
  }

  // ─── Recommendations ───────────────────────────────────────

  /**
   * Get treasury recommendations with optional filters.
   */
  static async getRecommendations(
    ctx: TenantContext,
    filters?: GetRecommendationsInput,
  ) {
    const where: Prisma.TreasuryRecommendationWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.riskLevel) {
      where.riskLevel = filters.riskLevel;
    }

    const [recommendations, total] = await Promise.all([
      prisma.treasuryRecommendation.findMany({
        where,
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.treasuryRecommendation.count({ where }),
    ]);

    return { recommendations, total };
  }

  // ─── Briefing ──────────────────────────────────────────────

  /**
   * Generate a treasury briefing (morning, daily, weekly, ad-hoc).
   */
  static async getBriefing(
    ctx: TenantContext,
    type: BriefingType = "daily",
  ) {
    const [cashPosition, liquidity, fxExposure, riskSummary, alerts, recommendations] =
      await Promise.all([
        CashPositionService.getGlobalCashPosition(ctx),
        LiquidityService.getLiquidityPosition(ctx),
        FXExposureService.getFXExposure(ctx),
        TreasuryRiskService.getRiskSummary(ctx),
        this.getActiveAlerts(ctx),
        this.getRecommendationSummary(ctx),
      ]);

    const highlights: string[] = [];
    const actionItems: string[] = [];

    // Cash highlights
    if (cashPosition.concentrationScore.gt(0.5)) {
      highlights.push(
        `Cash concentration is high (${cashPosition.concentrationScore.toFixed(2)}). Consider diversifying across regions.`,
      );
    }

    if (cashPosition.inTransitFunds.gt(0)) {
      highlights.push(
        `${cashPosition.inTransitFunds.toSignificantDigits(3)} in transit across accounts.`,
      );
    }

    // Liquidity highlights
    if (liquidity.daysOfRunway < 30) {
      highlights.push(
        `Liquidity runway is ${liquidity.daysOfRunway} days — below 30-day threshold.`,
      );
      actionItems.push("Review short-term funding options.");
    }

    // FX highlights
    if (fxExposure.unhedgedExposure.gt(0)) {
      highlights.push(
        `${fxExposure.unhedgedExposure.toSignificantDigits(3)} unhedged FX exposure.`,
      );
    }

    // Risk highlights
    if (riskSummary.riskTrend === "deteriorating") {
      highlights.push("Overall risk trend is deteriorating.");
      actionItems.push("Review active risk mitigations.");
    }

    // Alert highlights
    const criticalAlerts = alerts.criticalAlerts.slice(0, 3);
    for (const alert of criticalAlerts) {
      highlights.push(`[CRITICAL] ${alert.title}`);
      actionItems.push(alert.description);
    }

    const briefing = await prisma.treasuryBriefing.create({
      data: {
        companyId: ctx.companyId,
        briefingDate: new Date(),
        briefingType: type,
        cashPositionSummary: {
          totalGlobalCash: cashPosition.totalGlobalCash.toString(),
          availableCash: cashPosition.availableCash.toString(),
          concentrationScore: cashPosition.concentrationScore.toString(),
        } as unknown as Prisma.InputJsonValue,
        liquiditySummary: {
          currentLiquidity: liquidity.currentLiquidity.toString(),
          daysOfRunway: liquidity.daysOfRunway,
          burnRate: liquidity.burnRate.toString(),
        } as unknown as Prisma.InputJsonValue,
        fxSummary: {
          totalExposure: fxExposure.totalExposure.toString(),
          unhedgedExposure: fxExposure.unhedgedExposure.toString(),
          netOpenPosition: fxExposure.netOpenPosition.toString(),
        } as unknown as Prisma.InputJsonValue,
        debtSummary: {} as unknown as Prisma.InputJsonValue,
        investmentSummary: {} as unknown as Prisma.InputJsonValue,
        riskSummary: {
          totalRisks: riskSummary.totalRisks,
          riskTrend: riskSummary.riskTrend,
          overallRiskScore: riskSummary.overallRiskScore.toString(),
        } as unknown as Prisma.InputJsonValue,
        recommendations: [] as unknown as Prisma.InputJsonValue,
        alerts: alerts.criticalAlerts.map((a) => ({
          title: a.title,
          severity: a.severity,
          type: a.alertType,
        })) as unknown as Prisma.InputJsonValue,
        highlights: highlights as unknown as Prisma.InputJsonValue,
        actionItems: actionItems as unknown as Prisma.InputJsonValue,
        metadata: {} as unknown as Prisma.InputJsonValue,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "treasury.briefing.created",
      resourceType: "TreasuryBriefing",
      resourceId: briefing.id,
      severity: AuditSeverity.INFO,
      metadata: { type, highlights: highlights.length },
    });

    return briefing;
  }

  // ─── Analytics ─────────────────────────────────────────────

  /**
   * Get analytics data across treasury domains.
   */
  static async getAnalytics(ctx: TenantContext) {
    const [cashPosition, liquidityScore, riskTrends, riskScore, byType] =
      await Promise.all([
        CashPositionService.getGlobalCashPosition(ctx),
        LiquidityService.getLiquidityScore(ctx),
        TreasuryRiskService.getRiskTrends(ctx, 30),
        TreasuryRiskService.getRiskScore(ctx),
        TreasuryRiskService.getRisksByType(ctx),
      ]);

    return {
      cashConcentration: cashPosition.concentrationScore,
      liquidityScore,
      riskScore,
      riskTrends,
      risksByType: byType,
    };
  }

  // ─── Recommendation Management ─────────────────────────────

  /**
   * Create a new treasury recommendation.
   */
  static async createRecommendation(
    ctx: TenantContext,
    input: CreateRecommendationInput,
  ) {
    const recommendation = await prisma.treasuryRecommendation.create({
      data: {
        companyId: ctx.companyId,
        category: input.category,
        title: input.title,
        description: input.description,
        businessReason: input.businessReason,
        confidence: input.confidence,
        riskLevel: input.riskLevel,
        supportingEvidence: input.supportingEvidence as unknown as Prisma.InputJsonValue,
        affectedModules: input.affectedModules,
        requiredApprovals: input.requiredApprovals,
        priority: input.priority ?? "medium",
        financialImpact: {} as unknown as Prisma.InputJsonValue,
        metadata: {} as unknown as Prisma.InputJsonValue,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "treasury.recommendation.created",
      resourceType: "TreasuryRecommendation",
      resourceId: recommendation.id,
      severity: AuditSeverity.INFO,
      metadata: { category: input.category, priority: input.priority ?? "medium" },
    });

    return recommendation;
  }

  /**
   * Update an existing treasury recommendation.
   */
  static async updateRecommendation(
    ctx: TenantContext,
    recommendationId: string,
    input: UpdateRecommendationInput,
  ) {
    const existing = await prisma.treasuryRecommendation.findFirst({
      where: {
        id: recommendationId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Recommendation ${recommendationId} not found`);
    }

    const updateData: Prisma.TreasuryRecommendationUpdateInput = {};

    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    if (input.priority !== undefined) {
      updateData.priority = input.priority;
    }

    if (input.metadata !== undefined) {
      updateData.metadata = input.metadata as unknown as Prisma.InputJsonValue;
    }

    const updated = await prisma.treasuryRecommendation.update({
      where: { id: recommendationId },
      data: updateData,
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "treasury.recommendation.updated",
      resourceType: "TreasuryRecommendation",
      resourceId: recommendationId,
      severity: input.status !== undefined ? AuditSeverity.WARNING : AuditSeverity.INFO,
      metadata: { updatedFields: Object.keys(updateData) },
    });

    return updated;
  }

  // ─── Internal Helpers ──────────────────────────────────────

  private static async getActiveAlerts(ctx: TenantContext) {
    const alerts = await prisma.treasurySpecialistAlert.findMany({
      where: {
        companyId: ctx.companyId,
        status: { in: ["active", "escalated"] },
      },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    });

    const bySeverity: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const a of alerts) {
      bySeverity[a.severity] = (bySeverity[a.severity] ?? 0) + 1;
      byType[a.alertType] = (byType[a.alertType] ?? 0) + 1;
    }

    const criticalAlerts = alerts
      .filter((a) => a.severity === "critical")
      .map((a) => ({
        id: a.id,
        alertType: a.alertType as AlertType,
        severity: a.severity as AlertSeverity,
        title: a.title,
        description: a.description,
        status: a.status as AlertStatus,
      }));

    return {
      totalActive: alerts.length,
      bySeverity: bySeverity as Record<"info" | "warning" | "critical", number>,
      byType: byType as Record<string, number>,
      criticalAlerts,
    };
  }

  private static async getRecentBriefings(
    ctx: TenantContext,
    limit: number = 5,
  ): Promise<BriefingRecord[]> {
    const briefings = await prisma.treasuryBriefing.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { briefingDate: "desc" },
      take: limit,
    });

    return briefings.map((b) => ({
      id: b.id,
      briefingDate: b.briefingDate.toISOString(),
      briefingType: b.briefingType,
      highlights: (b.highlights as string[]) ?? [],
      actionItems: (b.actionItems as string[]) ?? [],
    }));
  }

  private static async getRecommendationSummary(
    ctx: TenantContext,
  ): Promise<RecommendationSummary> {
    const recommendations = await prisma.treasuryRecommendation.findMany({
      where: { companyId: ctx.companyId },
      select: { category: true, status: true, priority: true },
    });

    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    let totalPending = 0;
    let totalAccepted = 0;
    let totalImplementing = 0;
    let totalCompleted = 0;

    for (const r of recommendations) {
      byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
      byPriority[r.priority] = (byPriority[r.priority] ?? 0) + 1;

      if (r.status === "pending") totalPending++;
      else if (r.status === "accepted") totalAccepted++;
      else if (r.status === "implementing") totalImplementing++;
      else if (r.status === "completed") totalCompleted++;
    }

    return {
      totalPending,
      totalAccepted,
      totalImplementing,
      totalCompleted,
      byCategory: byCategory as Record<
        | "cash"
        | "liquidity"
        | "fx"
        | "debt"
        | "investment"
        | "risk"
        | "policy"
        | "operations",
        number
      >,
      byPriority,
    };
  }
}
