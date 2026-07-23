// ─────────────────────────────────────────────────────────────
// Enterprise Tax Specialist — Tax Planning Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  PlanningScenario,
  TaxRecommendation,
  TaxOptimizationOpportunity,
  GetPlanningScenariosInput,
  CreatePlanningScenarioInput,
  ScenarioStatus,
  GetRecommendationsInput,
  CreateRecommendationInput,
  RecommendationStatus,
  ScenarioType,
  RecommendationCategory,
  RiskLevel,
  Priority,
} from "./types";

function mapScenario(r: any): PlanningScenario {
  return {
    id: r.id,
    companyId: r.companyId,
    scenarioType: r.scenarioType as ScenarioType,
    name: r.scenarioName,
    description: (r.businessCase as any)?.description ?? "",
    status: r.status as ScenarioStatus,
    taxSavings: r.projectedSavings,
    implementationCost: new Prisma.Decimal(0),
    netBenefit: r.projectedSavings,
    riskLevel: r.riskRating as RiskLevel,
    timeline: r.timeline ?? "",
    assumptions: (r.assumptions as Record<string, unknown>) ?? {},
    metadata: (r.metadata as any) ?? undefined,
  };
}

function mapRecommendation(r: any): TaxRecommendation {
  return {
    id: r.id,
    companyId: r.companyId,
    category: r.category as RecommendationCategory,
    title: r.title,
    description: r.description,
    rationale: r.businessReason,
    riskLevel: r.riskLevel as RiskLevel,
    priority: r.priority as Priority,
    estimatedSavings: (r.financialImpact as any)?.amount ?? new Prisma.Decimal(0),
    status: r.status as RecommendationStatus,
    assignedTo: undefined,
    dueDate: undefined,
    metadata: (r.metadata as any) ?? undefined,
  };
}

export class TaxPlanningService {
  static async getPlanningScenarios(
    ctx: TenantContext,
    filters?: GetPlanningScenariosInput,
  ): Promise<{ scenarios: PlanningScenario[]; total: number }> {
    const where: any = { companyId: ctx.companyId };
    if (filters?.scenarioType) where.scenarioType = filters.scenarioType;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [{ scenarioName: { contains: filters.search, mode: "insensitive" } }];
    }

    const [rows, total] = await Promise.all([
      prisma.taxPlanningScenario.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.taxPlanningScenario.count({ where }),
    ]);

    return { scenarios: rows.map(mapScenario), total };
  }

  static async createScenario(
    ctx: TenantContext,
    input: CreatePlanningScenarioInput,
  ): Promise<PlanningScenario> {
    const row = await prisma.taxPlanningScenario.create({
      data: {
        companyId: ctx.companyId,
        scenarioName: input.name,
        scenarioType: input.scenarioType,
        status: "draft",
        assumptions: input.assumptions as any,
        projectedTaxImpact: new Prisma.Decimal(input.taxSavings),
        projectedSavings: new Prisma.Decimal(input.taxSavings),
        riskRating: input.riskLevel,
        implementationComplexity: "medium",
        timeline: input.timeline,
        businessCase: { description: input.description, cost: input.implementationCost },
        metadata: (input.metadata as any) ?? {},
      },
    });
    return mapScenario(row);
  }

  static async updateScenarioStatus(
    ctx: TenantContext,
    id: string,
    status: ScenarioStatus,
  ): Promise<PlanningScenario> {
    const row = await prisma.taxPlanningScenario.update({
      where: { id },
      data: { status },
    });
    return mapScenario(row);
  }

  static async getRecommendations(
    ctx: TenantContext,
    filters?: GetRecommendationsInput,
  ): Promise<{ recommendations: TaxRecommendation[]; total: number }> {
    const where: any = { companyId: ctx.companyId };
    if (filters?.category) where.category = filters.category;
    if (filters?.riskLevel) where.riskLevel = filters.riskLevel;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [{ title: { contains: filters.search, mode: "insensitive" } }];
    }

    const [rows, total] = await Promise.all([
      prisma.taxRecommendation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.taxRecommendation.count({ where }),
    ]);

    return { recommendations: rows.map(mapRecommendation), total };
  }

  static async createRecommendation(
    ctx: TenantContext,
    input: CreateRecommendationInput,
  ): Promise<TaxRecommendation> {
    const row = await prisma.taxRecommendation.create({
      data: {
        companyId: ctx.companyId,
        category: input.category,
        title: input.title,
        description: input.description,
        businessReason: input.rationale,
        financialImpact: { amount: input.estimatedSavings },
        confidence: new Prisma.Decimal(0.8),
        riskLevel: input.riskLevel,
        status: "proposed",
        priority: input.priority,
        requiredApprovals: [],
        metadata: (input.metadata as any) ?? {},
      },
    });
    return mapRecommendation(row);
  }

  static async updateRecommendationStatus(
    ctx: TenantContext,
    id: string,
    status: RecommendationStatus,
  ): Promise<TaxRecommendation> {
    const row = await prisma.taxRecommendation.update({
      where: { id },
      data: { status },
    });
    return mapRecommendation(row);
  }

  static async getTaxOptimizationOpportunities(
    ctx: TenantContext,
  ): Promise<TaxOptimizationOpportunity[]> {
    const [scenarios, recommendations] = await Promise.all([
      prisma.taxPlanningScenario.findMany({
        where: { companyId: ctx.companyId, status: { in: ["draft", "active"] } },
      }),
      prisma.taxRecommendation.findMany({
        where: { companyId: ctx.companyId, status: "proposed" },
      }),
    ]);

    const opportunities: TaxOptimizationOpportunity[] = [];

    for (const s of scenarios) {
      opportunities.push({
        category: "tax_credit_optimization" as RecommendationCategory,
        name: s.scenarioName,
        description: (s.businessCase as any)?.description ?? "",
        estimatedAnnualSavings: s.projectedSavings,
        implementationComplexity: s.implementationComplexity as "low" | "medium" | "high",
        timelineMonths: 6,
        prerequisites: [],
      });
    }

    for (const r of recommendations) {
      opportunities.push({
        category: r.category as RecommendationCategory,
        name: r.title,
        description: r.description,
        estimatedAnnualSavings: (r.financialImpact as any)?.amount ?? new Prisma.Decimal(0),
        implementationComplexity: "medium",
        timelineMonths: 3,
        prerequisites: [],
      });
    }

    return opportunities;
  }
}
