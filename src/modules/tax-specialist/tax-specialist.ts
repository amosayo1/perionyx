// ─────────────────────────────────────────────────────────────
// Enterprise Tax Specialist — Main Facade
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { CorporateTaxService } from "./corporate-tax";
import { IndirectTaxService } from "./indirect-tax";
import { TaxProvisionService } from "./tax-provision";
import { TransferPricingService } from "./transfer-pricing";
import { TaxCalendarService } from "./tax-calendar";
import { TaxRiskService } from "./tax-risk";
import { TaxPlanningService } from "./tax-planning";
import type {
  TaxDashboardData,
  TaxBriefing,
  ExecutiveTaxSummary,
  BriefingType,
  GetJurisdictionsInput,
  GetTaxReturnsInput,
  GetPaymentsInput,
  GetProvisionsInput,
  GetTransferPricingInput,
  GetDeadlinesInput,
  GetFilingsInput,
  GetRiskAssessmentsInput,
  GetPlanningScenariosInput,
  GetRecommendationsInput,
  GetBriefingsInput,
} from "./types";

export class TaxSpecialistService {
  static async getDashboard(ctx: TenantContext): Promise<TaxDashboardData> {
    const [
      jurisdictions,
      returns,
      payments,
      deadlines,
      overdueDeadlines,
      provisions,
      riskAssessments,
      recommendations,
      policies,
    ] = await Promise.all([
      prisma.taxJurisdiction.count({ where: { companyId: ctx.companyId } }),
      prisma.taxReturn.findMany({ where: { companyId: ctx.companyId } }),
      prisma.taxPayment.findMany({ where: { companyId: ctx.companyId } }),
      prisma.taxDeadline.findMany({ where: { companyId: ctx.companyId } }),
      prisma.taxDeadline.findMany({ where: { companyId: ctx.companyId, status: "overdue" } }),
      prisma.taxProvision.findMany({ where: { companyId: ctx.companyId } }),
      prisma.taxRiskAssessment.findMany({ where: { companyId: ctx.companyId }, orderBy: { assessmentDate: "desc" }, take: 1 }),
      prisma.taxRecommendation.findMany({ where: { companyId: ctx.companyId }, orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.transferPricingPolicy.findMany({ where: { companyId: ctx.companyId } }),
    ]);

    const totalTaxPaid = payments.reduce((s, p) => s.add(p.amount), new Prisma.Decimal(0));
    const totalTaxLiability = returns.reduce((s, r) => s.add(r.taxDue), new Prisma.Decimal(0));
    const activeReturns = returns.filter((r) => r.status !== "accepted" && r.status !== "amended").length;
    const openDeadlines = deadlines.filter((d) => d.status !== "completed").length;

    const effectiveTaxRate = provisions.length > 0
      ? provisions.reduce((s, p) => s.add(p.effectiveTaxRate), new Prisma.Decimal(0)).div(provisions.length)
      : new Prisma.Decimal(0);

    const tpHighRisk = policies.filter((p) => p.riskLevel === "high" || p.riskLevel === "critical").length;
    const transferPricingScore = policies.length > 0
      ? new Prisma.Decimal(100 - (tpHighRisk / policies.length) * 100)
      : new Prisma.Decimal(100);

    const latestAssessment = riskAssessments[0];
    const riskScore = latestAssessment
      ? new Prisma.Decimal(100).sub(latestAssessment.overallRiskScore.mul(100))
      : new Prisma.Decimal(80);

    const overallTaxHealth = riskScore.add(transferPricingScore).div(2).toDecimalPlaces(2);

    return {
      period: new Date().toISOString().slice(0, 7),
      overallTaxHealth,
      totalJurisdictions: jurisdictions,
      activeReturns,
      pendingPayments: payments.filter((p) => p.status === "pending").length,
      openDeadlines,
      overdueDeadlines: overdueDeadlines.length,
      effectiveTaxRate,
      totalTaxLiability,
      totalTaxPaid,
      transferPricingScore,
      topRisks: (latestAssessment?.highRiskAreas as any[] ?? []).map((r: any, i: number) => ({
        id: `risk-${i}`,
        name: r.name ?? r.area ?? `Risk ${i + 1}`,
        riskLevel: r.riskLevel ?? "medium",
        jurisdictionName: r.jurisdiction ?? "General",
        estimatedExposure: new Prisma.Decimal(r.amount ?? 0),
        status: "identified",
      })),
      upcomingDeadlines: deadlines
        .filter((d) => d.status !== "completed")
        .slice(0, 5)
        .map((d) => ({
          id: d.id,
          deadlineType: d.deadlineType,
          title: d.deadlineTitle,
          dueDate: d.dueDate,
          status: d.status,
          daysUntilDue: Math.ceil((d.dueDate.getTime() - Date.now()) / 86400000),
        })),
      recentRecommendations: recommendations.map((r) => ({
        id: r.id,
        category: r.category as any,
        title: r.title,
        description: r.description,
        riskLevel: r.riskLevel as any,
        estimatedSavings: (r.financialImpact as any)?.amount ?? new Prisma.Decimal(0),
        status: r.status,
      })),
    };
  }

  static async getProvisionCenter(
    ctx: TenantContext,
    filters?: GetProvisionsInput,
  ) {
    const [provisions, deferredTaxes] = await Promise.all([
      TaxProvisionService.getProvisions(ctx, filters),
      TaxProvisionService.getDeferredTaxes(ctx),
    ]);
    return { provisions, deferredTaxes };
  }

  static async getIndirectTaxCenter(
    ctx: TenantContext,
    filters?: GetTaxReturnsInput,
  ) {
    const [returns, vatSummary, gstSummary, whtSummary, liability, recoverable] = await Promise.all([
      IndirectTaxService.getIndirectTaxReturns(ctx, filters),
      IndirectTaxService.getVATSummary(ctx),
      IndirectTaxService.getGSTSummary(ctx),
      IndirectTaxService.getWithholdingTaxSummary(ctx),
      IndirectTaxService.getIndirectTaxLiability(ctx),
      IndirectTaxService.getRecoverableTax(ctx),
    ]);
    return { returns, vatSummary, gstSummary, withholdingTaxSummary: whtSummary, liability, recoverable };
  }

  static async getTransferPricingCenter(
    ctx: TenantContext,
    filters?: GetTransferPricingInput,
  ) {
    const [policies, rules, risk] = await Promise.all([
      TransferPricingService.getPolicies(ctx, filters),
      TransferPricingService.getIntercompanyRules(ctx),
      TransferPricingService.getTransferPricingRisk(ctx),
    ]);
    return { policies, rules, risk };
  }

  static async getTaxCalendar(
    ctx: TenantContext,
    filters?: GetDeadlinesInput,
  ) {
    const [deadlines, filings, upcoming, overdue] = await Promise.all([
      TaxCalendarService.getDeadlines(ctx, filters),
      TaxCalendarService.getFilings(ctx),
      TaxCalendarService.getUpcomingDeadlines(ctx),
      TaxCalendarService.getOverdueDeadlines(ctx),
    ]);
    return { deadlines, filings, upcoming, overdue };
  }

  static async getTaxPlanning(
    ctx: TenantContext,
    filters?: GetPlanningScenariosInput,
  ) {
    const [scenarios, recommendations, opportunities] = await Promise.all([
      TaxPlanningService.getPlanningScenarios(ctx, filters),
      TaxPlanningService.getRecommendations(ctx),
      TaxPlanningService.getTaxOptimizationOpportunities(ctx),
    ]);
    return { scenarios, recommendations, opportunities };
  }

  static async getRiskDashboard(ctx: TenantContext) {
    const [healthScore, outstandingIssues, exposure, assessments] = await Promise.all([
      TaxRiskService.getTaxHealthScore(ctx),
      TaxRiskService.getOutstandingIssues(ctx),
      TaxRiskService.getTaxExposure(ctx),
      TaxRiskService.getRiskAssessments(ctx, { limit: 10 }),
    ]);
    return { healthScore, outstandingIssues, exposure, assessments };
  }

  static async getExecutiveTaxSummary(ctx: TenantContext): Promise<ExecutiveTaxSummary> {
    const [returns, payments, provisions, deadlines, policies, jurisdictions] = await Promise.all([
      prisma.taxReturn.findMany({ where: { companyId: ctx.companyId } }),
      prisma.taxPayment.findMany({ where: { companyId: ctx.companyId } }),
      prisma.taxProvision.findMany({ where: { companyId: ctx.companyId } }),
      prisma.taxDeadline.findMany({ where: { companyId: ctx.companyId } }),
      prisma.transferPricingPolicy.findMany({ where: { companyId: ctx.companyId } }),
      prisma.taxJurisdiction.count({ where: { companyId: ctx.companyId } }),
    ]);

    const totalTaxPaid = payments.reduce((s, p) => s.add(p.amount), new Prisma.Decimal(0));
    const totalLiability = returns.reduce((s, r) => s.add(r.taxDue), new Prisma.Decimal(0));
    const effectiveRate = provisions.length > 0
      ? provisions.reduce((s, p) => s.add(p.effectiveTaxRate), new Prisma.Decimal(0)).div(provisions.length)
      : new Prisma.Decimal(0);

    const tpHighRisk = policies.filter((p) => p.riskLevel === "high" || p.riskLevel === "critical").length;
    const tpScore = policies.length > 0
      ? new Prisma.Decimal(100 - (tpHighRisk / policies.length) * 100)
      : new Prisma.Decimal(100);

    return {
      totalTaxLiability: totalLiability,
      totalTaxPaid,
      effectiveTaxRate: effectiveRate,
      complianceScore: new Prisma.Decimal(85),
      riskExposure: totalLiability.sub(totalTaxPaid).gt(0) ? totalLiability.sub(totalTaxPaid) : new Prisma.Decimal(0),
      pendingPayments: payments.filter((p) => p.status === "pending").length,
      openDeadlines: deadlines.filter((d) => d.status !== "completed").length,
      activeReturns: returns.filter((r) => r.status !== "accepted" && r.status !== "amended").length,
      transferPricingScore: tpScore,
      yearOverYearChange: new Prisma.Decimal(0),
      jurisdictionCount: jurisdictions,
      taxSavingsYTD: new Prisma.Decimal(0),
    };
  }

  static async getBriefing(
    ctx: TenantContext,
    type: BriefingType = "weekly",
  ): Promise<TaxBriefing> {
    const [dashboard, healthScore, deadlines, recommendations] = await Promise.all([
      TaxSpecialistService.getDashboard(ctx),
      TaxRiskService.getTaxHealthScore(ctx),
      TaxCalendarService.getUpcomingDeadlines(ctx, 30),
      TaxPlanningService.getRecommendations(ctx, { limit: 5 }),
    ]);

    const periodLabel =
      type === "daily" ? new Date().toISOString().split("T")[0]
        : type === "weekly" ? `Week of ${new Date().toISOString().split("T")[0]}`
          : type === "monthly" ? new Date().toISOString().slice(0, 7)
            : `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`;

    return {
      briefingType: type,
      generatedAt: new Date(),
      period: periodLabel,
      summary: `Tax health: ${dashboard.overallTaxHealth.toString()}. ${dashboard.activeReturns} active returns, ${dashboard.pendingPayments} pending payments, ${dashboard.overdueDeadlines} overdue deadlines.`,
      keyMetrics: [
        { label: "Tax Health", value: dashboard.overallTaxHealth },
        { label: "Effective Tax Rate", value: dashboard.effectiveTaxRate },
        { label: "Transfer Pricing Score", value: dashboard.transferPricingScore },
        { label: "Total Liability", value: dashboard.totalTaxLiability },
      ],
      criticalItems: [
        ...dashboard.upcomingDeadlines.map((d) => ({
          id: d.id,
          type: "deadline" as const,
          title: d.title,
          description: `Due in ${d.daysUntilDue} days`,
          severity: d.daysUntilDue <= 7 ? "high" as const : "medium" as const,
          actionRequired: true,
        })),
      ],
      upcomingDeadlines: deadlines.map((d) => ({
        id: d.id,
        deadlineType: d.deadlineType,
        title: d.name,
        dueDate: d.dueDate,
        status: d.status,
        daysUntilDue: Math.ceil((d.dueDate.getTime() - Date.now()) / 86400000),
      })),
      recommendations: recommendations.recommendations.map((r) => ({
        id: r.id,
        category: r.category,
        title: r.title,
        description: r.description,
        riskLevel: r.riskLevel,
        estimatedSavings: r.estimatedSavings,
        status: r.status,
      })),
    };
  }

  static async getAnalytics(ctx: TenantContext) {
    const [jurisdictions, returns, provisions, payments, filings, deadlines, policies, scenarios, recommendations] = await Promise.all([
      prisma.taxJurisdiction.count({ where: { companyId: ctx.companyId } }),
      prisma.taxReturn.count({ where: { companyId: ctx.companyId } }),
      prisma.taxProvision.count({ where: { companyId: ctx.companyId } }),
      prisma.taxPayment.count({ where: { companyId: ctx.companyId } }),
      prisma.taxFiling.count({ where: { companyId: ctx.companyId } }),
      prisma.taxDeadline.count({ where: { companyId: ctx.companyId } }),
      prisma.transferPricingPolicy.count({ where: { companyId: ctx.companyId } }),
      prisma.taxPlanningScenario.count({ where: { companyId: ctx.companyId } }),
      prisma.taxRecommendation.count({ where: { companyId: ctx.companyId } }),
    ]);

    return {
      jurisdictions,
      returns,
      provisions,
      payments,
      filings,
      deadlines,
      transferPricingPolicies: policies,
      planningScenarios: scenarios,
      recommendations,
    };
  }
}
