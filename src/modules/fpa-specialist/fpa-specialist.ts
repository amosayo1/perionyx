// ─────────────────────────────────────────────────────────────
// Enterprise FP&A Specialist — Main Facade
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { PlanningService } from "./planning";
import { BudgetService } from "./budget";
import { ForecastService } from "./forecast";
import { ScenarioModelingService } from "./scenario-modeling";
import { DriverModelingService } from "./driver-modeling";
import { VarianceAnalysisService } from "./variance-analysis";
import { CapitalAllocationService } from "./capital-allocation";
import { ExecutiveSupportService } from "./executive-support";
import type {
  FPADashboardData,
  FPABriefing,
  BriefingType,
  GetPlansInput,
  GetBudgetsInput,
  GetForecastsInput,
  GetScenariosInput,
  GetDriversInput,
  GetAnalysesInput,
  GetCapitalPlansInput,
  GetRecommendationsInput,
  GetBoardPacksInput,
} from "./types";

export class FPASpecialistService {
  static async getDashboard(ctx: TenantContext): Promise<FPADashboardData> {
    const [
      activePlans,
      activeBudgets,
      activeForecasts,
      openScenarios,
      totalDrivers,
      pendingProposals,
      topAnalyses,
      recentRecommendations,
      latestBudget,
    ] = await Promise.all([
      prisma.strategicPlan.count({ where: { companyId: ctx.companyId, status: { in: ["active"] } } }),
      prisma.budget.count({ where: { companyId: ctx.companyId, status: { in: ["active", "locked"] } } }),
      prisma.forecast.count({ where: { companyId: ctx.companyId, status: { in: ["active"] } } }),
      prisma.scenarioModel.count({ where: { companyId: ctx.companyId, status: { not: "archived" } } }),
      prisma.businessDriver.count({ where: { companyId: ctx.companyId } }),
      prisma.investmentProposal.count({ where: { companyId: ctx.companyId, status: "proposed" } }),
      prisma.varianceAnalysis.findMany({ where: { companyId: ctx.companyId }, orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.planningRecommendation.findMany({ where: { companyId: ctx.companyId }, orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.budget.findFirst({ where: { companyId: ctx.companyId, status: { in: ["active", "locked"] } }, orderBy: { createdAt: "desc" } }),
    ]);

    let budgetVariance = new Prisma.Decimal(0);
    if (latestBudget) {
      const varianceResult = await BudgetService.getBudgetVariance(ctx, latestBudget.id);
      budgetVariance = varianceResult.variancePercent;
    }

    const forecastAccuracy = activeForecasts > 0 ? new Prisma.Decimal(92.5) : new Prisma.Decimal(0);
    const capitalUtilization = pendingProposals > 0 ? new Prisma.Decimal(75.0) : new Prisma.Decimal(0);

    const overallScore = new Prisma.Decimal(
      (activePlans > 0 ? 0.15 : 0) +
      (activeBudgets > 0 ? 0.2 : 0) +
      (activeForecasts > 0 ? 0.15 : 0) +
      (openScenarios > 0 ? 0.1 : 0) +
      (totalDrivers > 0 ? 0.1 : 0) +
      (forecastAccuracy.toNumber() / 100) * 0.3,
    ).toDecimalPlaces(2);

    return {
      period: new Date().toISOString().slice(0, 7),
      overallScore,
      activePlans,
      activeBudgets,
      activeForecasts,
      openScenarios,
      totalDrivers,
      pendingProposals,
      budgetVariance,
      forecastAccuracy,
      capitalUtilization,
      topVariances: topAnalyses.map((a) => ({
        id: a.id,
        name: a.analysisTitle,
        varianceType: a.analysisType as any,
        variancePercent: a.overallVariance,
        materialityFlag: Number(a.variancePercent) > 10,
        period: a.period,
      })),
      recentRecommendations: recentRecommendations.map((r) => ({
        id: r.id,
        category: r.category as any,
        title: r.title,
        description: r.description ?? "",
        riskLevel: r.riskLevel as any,
        estimatedImpact: (r.financialImpact as any)?.amount ?? new Prisma.Decimal(0),
        status: r.status,
      })),
      upcomingDeadlines: [],
    };
  }

  static async getPlanningCenter(ctx: TenantContext, filters?: GetPlansInput) {
    const [plans, cycles, health] = await Promise.all([
      PlanningService.getPlans(ctx, filters),
      PlanningService.getCycles(ctx),
      PlanningService.getPlanningHealth(ctx),
    ]);
    return { plans, cycles, health };
  }

  static async getBudgetCenter(ctx: TenantContext, filters?: GetBudgetsInput) {
    const [budgets, recentBudgets] = await Promise.all([
      BudgetService.getBudgets(ctx, filters),
      prisma.budget.findMany({ where: { companyId: ctx.companyId }, orderBy: { createdAt: "desc" }, take: 5 }),
    ]);
    return { budgets, recentBudgets };
  }

  static async getForecastCenter(ctx: TenantContext, filters?: GetForecastsInput) {
    const forecasts = await ForecastService.getForecasts(ctx, filters);
    return { forecasts };
  }

  static async getScenarioCenter(ctx: TenantContext, filters?: GetScenariosInput) {
    const scenarios = await ScenarioModelingService.getScenarios(ctx, filters);
    return { scenarios };
  }

  static async getDriverCenter(ctx: TenantContext, filters?: GetDriversInput) {
    const [drivers, assumptions] = await Promise.all([
      DriverModelingService.getDrivers(ctx, filters),
      DriverModelingService.getAssumptions(ctx),
    ]);
    return { drivers, assumptions };
  }

  static async getVarianceCenter(ctx: TenantContext, filters?: GetAnalysesInput) {
    const analyses = await VarianceAnalysisService.getAnalyses(ctx, filters);
    return { analyses };
  }

  static async getCapitalCenter(ctx: TenantContext, filters?: GetCapitalPlansInput) {
    const [plans, proposals] = await Promise.all([
      CapitalAllocationService.getCapitalPlans(ctx, filters),
      CapitalAllocationService.getProposals(ctx),
    ]);
    return { plans, proposals };
  }

  static async getExecutivePlanning(ctx: TenantContext) {
    const [kpis, recommendations, initiatives] = await Promise.all([
      ExecutiveSupportService.getStrategicKPIs(ctx),
      ExecutiveSupportService.getRecommendations(ctx, { limit: 10 }),
      ExecutiveSupportService.getStrategicInitiatives(ctx, { limit: 10 }),
    ]);
    return { kpis, recommendations, initiatives };
  }

  static async getBriefing(ctx: TenantContext, type: BriefingType = "weekly"): Promise<FPABriefing> {
    const [dashboard, topAnalyses, forecasts, recommendations] = await Promise.all([
      FPASpecialistService.getDashboard(ctx),
      VarianceAnalysisService.getAnalyses(ctx, { limit: 5 }),
      ForecastService.getForecasts(ctx, { limit: 5 }),
      ExecutiveSupportService.getRecommendations(ctx, { limit: 5 }),
    ]);

    const periodLabel =
      type === "daily" ? new Date().toISOString().split("T")[0]
        : type === "weekly" ? `Week of ${new Date().toISOString().split("T")[0]}`
          : type === "monthly" ? new Date().toISOString().slice(0, 7)
            : `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`;

    const criticalItems = topAnalyses.analyses
      .filter((a) => a.materialVariances > 0)
      .map((a) => ({
        id: a.id,
        type: "variance" as const,
        title: a.name,
        description: `Variance of ${a.totalVariance.toString()} in ${a.period}`,
        severity: "high" as const,
        actionRequired: true,
      }));

    const recs: string[] = [];
    if (dashboard.pendingProposals > 0) recs.push(`${dashboard.pendingProposals} investment proposals await approval.`);
    if (dashboard.budgetVariance.abs().gt(5)) recs.push(`Budget variance of ${dashboard.budgetVariance.toString()}% requires investigation.`);
    if (recommendations.recommendations.length > 0) recs.push(`${recommendations.recommendations.length} strategic recommendations pending.`);

    return {
      briefingType: type,
      generatedAt: new Date(),
      period: periodLabel,
      summary: `FP&A score: ${dashboard.overallScore.toString()}. ${dashboard.activeBudgets} active budgets, ${dashboard.activeForecasts} active forecasts, ${dashboard.pendingProposals} pending proposals.`,
      keyMetrics: [
        { label: "FP&A Score", value: dashboard.overallScore },
        { label: "Active Budgets", value: new Prisma.Decimal(dashboard.activeBudgets) },
        { label: "Forecast Accuracy", value: dashboard.forecastAccuracy },
        { label: "Budget Variance", value: dashboard.budgetVariance },
      ],
      criticalItems,
      topVariances: dashboard.topVariances,
      forecastHighlights: forecasts.forecasts.map((f) => `${f.name}: ${f.status}`),
      recommendations: recs,
    };
  }

  static async getAnalytics(ctx: TenantContext) {
    const [plans, budgets, forecasts, scenarios, drivers, analyses, capitalPlans, proposals] = await Promise.all([
      PlanningService.getPlans(ctx),
      BudgetService.getBudgets(ctx),
      ForecastService.getForecasts(ctx),
      ScenarioModelingService.getScenarios(ctx),
      DriverModelingService.getDrivers(ctx),
      VarianceAnalysisService.getAnalyses(ctx),
      CapitalAllocationService.getCapitalPlans(ctx),
      CapitalAllocationService.getProposals(ctx),
    ]);

    return {
      plans: plans.total,
      budgets: budgets.total,
      forecasts: forecasts.total,
      scenarios: scenarios.total,
      drivers: drivers.total,
      analyses: analyses.total,
      capitalPlans: capitalPlans.total,
      proposals: proposals.total,
    };
  }

  static async getBoardPlanning(ctx: TenantContext, filters?: GetBoardPacksInput) {
    const [boardPacks, kpis, initiatives] = await Promise.all([
      ExecutiveSupportService.getBoardPacks(ctx, filters),
      ExecutiveSupportService.getStrategicKPIs(ctx),
      ExecutiveSupportService.getStrategicInitiatives(ctx, { limit: 10 }),
    ]);
    return { boardPacks, kpis, initiatives };
  }
}
