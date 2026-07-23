// ─────────────────────────────────────────────────────────────
// Enterprise Tax Specialist — Tax Risk Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  TaxRiskAssessment,
  TaxRiskByJurisdiction,
  TaxHealthScore,
  TaxHealthComponent,
  TaxExposure,
  ExposureByJurisdiction,
  ExposureByCategory,
  ExposureTrend,
  GetRiskAssessmentsInput,
  CreateRiskAssessmentInput,
  AssessmentType,
  AssessmentStatus,
  RiskLevel,
} from "./types";

export class TaxRiskService {
  static async getRiskAssessments(
    ctx: TenantContext,
    filters?: GetRiskAssessmentsInput,
  ): Promise<{ assessments: any[]; total: number }> {
    const where: any = { companyId: ctx.companyId };
    if (filters?.assessmentType) where.assessmentType = filters.assessmentType;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [];
    }

    const [rows, total] = await Promise.all([
      prisma.taxRiskAssessment.findMany({
        where,
        orderBy: { assessmentDate: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.taxRiskAssessment.count({ where }),
    ]);

    return {
      assessments: rows.map((r) => ({
        id: r.id,
        companyId: r.companyId,
        assessmentDate: r.assessmentDate,
        overallRiskScore: r.overallRiskScore,
        jurisdictionRisks: r.jurisdictionRisks,
        filingRisks: r.filingRisks,
        provisionRisks: r.provisionRisks,
        transferPricingRisks: r.transferPricingRisks,
        documentationRisks: r.documentationRisks,
        exposureRisks: r.exposureRisks,
        highRiskAreas: r.highRiskAreas,
        recommendations: r.recommendations,
        assessedBy: r.assessedBy,
        metadata: r.metadata,
      })),
      total,
    };
  }

  static async createRiskAssessment(
    ctx: TenantContext,
    input: CreateRiskAssessmentInput,
  ): Promise<any> {
    const row = await prisma.taxRiskAssessment.create({
      data: {
        companyId: ctx.companyId,
        assessmentDate: new Date(),
        overallRiskScore: new Prisma.Decimal(input.probability),
        jurisdictionRisks: input.jurisdictionId ? [{ jurisdictionId: input.jurisdictionId, riskLevel: input.riskLevel }] : [],
        filingRisks: [],
        provisionRisks: [],
        transferPricingRisks: [],
        documentationRisks: [],
        exposureRisks: [{ amount: input.estimatedExposure, category: input.assessmentType }],
        highRiskAreas: input.riskLevel === "critical" || input.riskLevel === "high" ? [input.name] : [],
        recommendations: input.mitigationPlan ? [input.mitigationPlan] : [],
        assessedBy: input.assignedTo ?? "system",
        metadata: (input.metadata as any) ?? {},
      },
    });
    return row;
  }

  static async getRiskByJurisdiction(
    ctx: TenantContext,
  ): Promise<TaxRiskByJurisdiction[]> {
    const assessments = await prisma.taxRiskAssessment.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { assessmentDate: "desc" },
    });

    const jurisdictionMap = new Map<string, any[]>();
    for (const a of assessments) {
      const risks = a.jurisdictionRisks as any[];
      for (const jr of risks) {
        const jId = jr.jurisdictionId ?? "unknown";
        if (!jurisdictionMap.has(jId)) jurisdictionMap.set(jId, []);
        jurisdictionMap.get(jId)!.push(a);
      }
    }

    return Array.from(jurisdictionMap.entries()).map(([jurisdiction, items]) => ({
      jurisdiction,
      riskCount: items.length,
      totalExposure: items.reduce(
        (s, a) => s.add((a.exposureRisks as any[])[0]?.amount ?? 0),
        new Prisma.Decimal(0),
      ),
      highRiskCount: items.filter((a) => Number(a.overallRiskScore) > 0.7).length,
      topRisk: items[0],
    }));
  }

  static async getTaxHealthScore(
    ctx: TenantContext,
  ): Promise<TaxHealthScore> {
    const [provisions, returns, deadlines, payments, policies, assessments] = await Promise.all([
      prisma.taxProvision.findMany({ where: { companyId: ctx.companyId } }),
      prisma.taxReturn.findMany({ where: { companyId: ctx.companyId } }),
      prisma.taxDeadline.findMany({ where: { companyId: ctx.companyId } }),
      prisma.taxPayment.findMany({ where: { companyId: ctx.companyId } }),
      prisma.transferPricingPolicy.findMany({ where: { companyId: ctx.companyId } }),
      prisma.taxRiskAssessment.findMany({ where: { companyId: ctx.companyId }, orderBy: { assessmentDate: "desc" }, take: 1 }),
    ]);

    const filedReturns = returns.filter((r) => r.status === "accepted" || r.status === "submitted").length;
    const filingScore = returns.length > 0 ? new Prisma.Decimal(filedReturns / returns.length * 100) : new Prisma.Decimal(100);

    const completedDeadlines = deadlines.filter((d) => d.status === "completed").length;
    const overdueDeadlines = deadlines.filter((d) => d.status === "overdue").length;
    const complianceScore = deadlines.length > 0
      ? new Prisma.Decimal(completedDeadlines / deadlines.length * 100)
      : new Prisma.Decimal(100);

    const latestAssessment = assessments[0];
    const riskScore = latestAssessment
      ? new Prisma.Decimal(100).sub(latestAssessment.overallRiskScore.mul(100))
      : new Prisma.Decimal(80);

    const tpHighRisk = policies.filter((p) => p.riskLevel === "high" || p.riskLevel === "critical").length;
    const transferPricingScore = policies.length > 0
      ? new Prisma.Decimal(100 - (tpHighRisk / policies.length) * 100)
      : new Prisma.Decimal(100);

    const approvedProvisions = provisions.filter((p) => p.status === "approved" || p.status === "filed").length;
    const planningScore = provisions.length > 0
      ? new Prisma.Decimal(approvedProvisions / provisions.length * 100)
      : new Prisma.Decimal(100);

    const confirmedPayments = payments.filter((p) => p.status === "confirmed" || p.status === "reconciled").length;
    const paymentScore = payments.length > 0
      ? new Prisma.Decimal(confirmedPayments / payments.length * 100)
      : new Prisma.Decimal(100);

    const weights = [
      { score: complianceScore, weight: 0.2 },
      { score: riskScore, weight: 0.2 },
      { score: filingScore, weight: 0.2 },
      { score: transferPricingScore, weight: 0.15 },
      { score: planningScore, weight: 0.15 },
      { score: paymentScore, weight: 0.1 },
    ];

    const overallScore = weights.reduce(
      (s, w) => s.add(w.score.mul(w.weight)),
      new Prisma.Decimal(0),
    );

    const components: TaxHealthComponent[] = [
      { name: "Compliance", score: complianceScore, weight: new Prisma.Decimal(0.2), status: complianceScore.gte(80) ? "pass" : complianceScore.gte(60) ? "warn" : "fail", details: `${completedDeadlines}/${deadlines.length} deadlines completed` },
      { name: "Risk", score: riskScore, weight: new Prisma.Decimal(0.2), status: riskScore.gte(70) ? "pass" : riskScore.gte(50) ? "warn" : "fail", details: `Risk score: ${latestAssessment?.overallRiskScore ?? "N/A"}` },
      { name: "Filing", score: filingScore, weight: new Prisma.Decimal(0.2), status: filingScore.gte(80) ? "pass" : filingScore.gte(60) ? "warn" : "fail", details: `${filedReturns}/${returns.length} returns filed` },
      { name: "Transfer Pricing", score: transferPricingScore, weight: new Prisma.Decimal(0.15), status: transferPricingScore.gte(80) ? "pass" : transferPricingScore.gte(60) ? "warn" : "fail", details: `${tpHighRisk}/${policies.length} high-risk policies` },
      { name: "Planning", score: planningScore, weight: new Prisma.Decimal(0.15), status: planningScore.gte(80) ? "pass" : planningScore.gte(60) ? "warn" : "fail", details: `${approvedProvisions}/${provisions.length} provisions approved` },
      { name: "Payments", score: paymentScore, weight: new Prisma.Decimal(0.1), status: paymentScore.gte(80) ? "pass" : paymentScore.gte(60) ? "warn" : "fail", details: `${confirmedPayments}/${payments.length} payments confirmed` },
    ];

    return {
      overallScore,
      complianceScore,
      riskScore,
      planningScore,
      transferPricingScore,
      filingScore,
      paymentScore,
      components,
    };
  }

  static async getOutstandingIssues(
    ctx: TenantContext,
  ): Promise<{ type: string; description: string; severity: string; dueDate?: Date }[]> {
    const [overdueDeadlines, disputedReturns, highRiskPolicies] = await Promise.all([
      prisma.taxDeadline.findMany({
        where: { companyId: ctx.companyId, status: "overdue" },
      }),
      prisma.taxReturn.findMany({
        where: { companyId: ctx.companyId, status: "amended" },
      }),
      prisma.transferPricingPolicy.findMany({
        where: { companyId: ctx.companyId, riskLevel: { in: ["high", "critical"] } },
      }),
    ]);

    const issues: { type: string; description: string; severity: string; dueDate?: Date }[] = [];

    for (const d of overdueDeadlines) {
      issues.push({ type: "deadline", description: `Overdue: ${d.deadlineTitle}`, severity: "high", dueDate: d.dueDate });
    }
    for (const r of disputedReturns) {
      issues.push({ type: "return", description: `Amended return: ${r.returnType} (${r.fiscalYear})`, severity: "medium" });
    }
    for (const p of highRiskPolicies) {
      issues.push({ type: "transfer_pricing", description: `High-risk TP policy: ${p.policyName}`, severity: p.riskLevel === "critical" ? "critical" : "high" });
    }

    return issues;
  }

  static async getTaxExposure(
    ctx: TenantContext,
  ): Promise<TaxExposure> {
    const [returns, payments, assessments] = await Promise.all([
      prisma.taxReturn.findMany({ where: { companyId: ctx.companyId } }),
      prisma.taxPayment.findMany({ where: { companyId: ctx.companyId } }),
      prisma.taxRiskAssessment.findMany({ where: { companyId: ctx.companyId }, orderBy: { assessmentDate: "desc" }, take: 5 }),
    ]);

    const totalLiability = returns.reduce((s, r) => s.add(r.taxDue), new Prisma.Decimal(0));
    const totalPaid = payments.reduce((s, p) => s.add(p.amount), new Prisma.Decimal(0));
    const totalExposure = totalLiability.sub(totalPaid);

    const byJurisdiction: ExposureByJurisdiction[] = [];
    const byCategory: ExposureByCategory[] = [];
    const trend: ExposureTrend[] = assessments.map((a) => ({
      period: a.assessmentDate.toISOString().slice(0, 7),
      exposure: (a.exposureRisks as any[])[0]?.amount ?? new Prisma.Decimal(0),
      change: new Prisma.Decimal(0),
    }));

    return {
      totalExposure: totalExposure.gt(0) ? totalExposure : new Prisma.Decimal(0),
      byJurisdiction,
      byCategory,
      trend,
    };
  }
}
