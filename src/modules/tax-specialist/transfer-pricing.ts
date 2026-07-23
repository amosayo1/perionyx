// ─────────────────────────────────────────────────────────────
// Enterprise Tax Specialist — Transfer Pricing Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  TransferPricingPolicy,
  IntercompanyRule,
  ArmLengthAnalysis,
  TransferPricingRisk,
  JurisdictionTPRisk,
  GetTransferPricingInput,
  CreateTransferPricingInput,
  UpdateTransferPricingInput,
  CreateIntercompanyRuleInput,
  IntercompanyType,
  ArmLengthMethod,
  RiskLevel,
} from "./types";

function mapPolicy(r: any): TransferPricingPolicy {
  return {
    id: r.id,
    companyId: r.companyId,
    name: r.policyName,
    description: r.description,
    intercompanyType: r.intercompanyType as IntercompanyType,
    armLengthMethod: r.armLengthMethod as ArmLengthMethod,
    documentationStatus: r.documentationStatus,
    lastReviewDate: r.lastReviewDate ?? undefined,
    nextReviewDate: r.nextReviewDate ?? undefined,
    isActive: r.status === "active",
    riskScore: new Prisma.Decimal(0),
    metadata: (r.metadata as any) ?? undefined,
  };
}

function mapRule(r: any): IntercompanyRule {
  return {
    id: r.id,
    policyId: r.policyId ?? "",
    name: r.ruleName,
    description: "",
    fromEntity: r.fromJurisdictionId,
    toEntity: r.toJurisdictionId,
    transactionType: r.transactionType as IntercompanyType,
    pricingMethod: "comparable_uncontrolled_price" as ArmLengthMethod,
    isActive: r.status === "active",
    metadata: (r.metadata as any) ?? undefined,
  };
}

export class TransferPricingService {
  static async getPolicies(
    ctx: TenantContext,
    filters?: GetTransferPricingInput,
  ): Promise<{ policies: TransferPricingPolicy[]; total: number }> {
    const where: any = { companyId: ctx.companyId };
    if (filters?.intercompanyType) where.intercompanyType = filters.intercompanyType;
    if (filters?.armLengthMethod) where.armLengthMethod = filters.armLengthMethod;
    if (filters?.search) {
      where.OR = [{ policyName: { contains: filters.search, mode: "insensitive" } }];
    }

    const [rows, total] = await Promise.all([
      prisma.transferPricingPolicy.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.transferPricingPolicy.count({ where }),
    ]);

    return { policies: rows.map(mapPolicy), total };
  }

  static async createPolicy(
    ctx: TenantContext,
    input: CreateTransferPricingInput,
  ): Promise<TransferPricingPolicy> {
    const row = await prisma.transferPricingPolicy.create({
      data: {
        companyId: ctx.companyId,
        policyName: input.name,
        description: input.description,
        intercompanyType: input.intercompanyType,
        armLengthMethod: input.armLengthMethod,
        documentationStatus: "draft",
        status: "active",
        riskLevel: "medium",
        metadata: (input.metadata as any) ?? {},
      },
    });
    return mapPolicy(row);
  }

  static async updatePolicy(
    ctx: TenantContext,
    id: string,
    input: UpdateTransferPricingInput,
  ): Promise<TransferPricingPolicy> {
    const data: any = {};
    if (input.name) data.policyName = input.name;
    if (input.description) data.description = input.description;
    if (input.armLengthMethod) data.armLengthMethod = input.armLengthMethod;
    if (input.documentationStatus) data.documentationStatus = input.documentationStatus;
    if (input.nextReviewDate) data.nextReviewDate = input.nextReviewDate;
    if (input.metadata) data.metadata = input.metadata;

    const row = await prisma.transferPricingPolicy.update({ where: { id }, data });
    return mapPolicy(row);
  }

  static async getIntercompanyRules(
    ctx: TenantContext,
    filters?: GetTransferPricingInput,
  ): Promise<{ rules: IntercompanyRule[]; total: number }> {
    const where: any = { companyId: ctx.companyId };
    if (filters?.search) {
      where.OR = [{ ruleName: { contains: filters.search, mode: "insensitive" } }];
    }

    const [rows, total] = await Promise.all([
      prisma.intercompanyTaxRule.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.intercompanyTaxRule.count({ where }),
    ]);

    return { rules: rows.map(mapRule), total };
  }

  static async createRule(
    ctx: TenantContext,
    input: CreateIntercompanyRuleInput,
  ): Promise<IntercompanyRule> {
    const row = await prisma.intercompanyTaxRule.create({
      data: {
        companyId: ctx.companyId,
        policyId: input.policyId,
        ruleName: input.name,
        fromJurisdictionId: input.fromEntity,
        toJurisdictionId: input.toEntity,
        transactionType: input.transactionType,
        withholdingRate: new Prisma.Decimal(0),
        vatRate: new Prisma.Decimal(0),
        status: "active",
        metadata: (input.metadata as any) ?? {},
      },
    });
    return mapRule(row);
  }

  static async getArmLengthAnalysis(
    ctx: TenantContext,
    policyId: string,
  ): Promise<ArmLengthAnalysis> {
    const policy = await prisma.transferPricingPolicy.findUnique({ where: { id: policyId } });
    if (!policy) throw new Error("Transfer pricing policy not found");

    const rules = await prisma.intercompanyTaxRule.findMany({
      where: { companyId: ctx.companyId, policyId },
    });

    return {
      policyId,
      policyName: policy.policyName,
      method: policy.armLengthMethod as ArmLengthMethod,
      intercompanyTransactions: rules.length,
      totalValue: rules.reduce((s, r) => s.add(r.withholdingRate), new Prisma.Decimal(0)),
      benchmarkRange: {
        low: new Prisma.Decimal(0),
        median: new Prisma.Decimal(0),
        high: new Prisma.Decimal(0),
      },
      actualResults: { median: new Prisma.Decimal(0), margin: new Prisma.Decimal(0) },
      complianceStatus: policy.documentationStatus,
      adjustmentRequired: policy.riskLevel === "high" || policy.riskLevel === "critical",
      riskScore: new Prisma.Decimal(policy.riskLevel === "critical" ? 0.9 : policy.riskLevel === "high" ? 0.7 : 0.3),
    };
  }

  static async getTransferPricingRisk(
    ctx: TenantContext,
  ): Promise<TransferPricingRisk> {
    const policies = await prisma.transferPricingPolicy.findMany({
      where: { companyId: ctx.companyId },
    });

    const highRiskPolicies = policies.filter((p) => p.riskLevel === "high" || p.riskLevel === "critical").length;
    const documentationGap = policies.filter((p) => p.documentationStatus === "outdated" || p.documentationStatus === "draft").length;
    const overdueReviews = policies.filter((p) => p.nextReviewDate && p.nextReviewDate < new Date()).length;

    return {
      overallRiskScore: new Prisma.Decimal(
        policies.length > 0 ? highRiskPolicies / policies.length : 0,
      ),
      totalPolicies: policies.length,
      highRiskPolicies,
      documentationGap,
      overdueReviews,
      pendingAdjustments: 0,
      jurisdictionRisks: [],
    };
  }
}
