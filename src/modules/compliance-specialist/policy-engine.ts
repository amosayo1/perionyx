// ─────────────────────────────────────────────────────────────
// Enterprise Compliance Specialist — Policy Engine
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  GetPoliciesInput,
  CreatePolicyInput,
  UpdatePolicyInput,
  GetViolationsInput,
  CreateViolationInput,
  ViolationStatus,
  ViolationSeverity,
} from "./types";

export class PolicyEngineService {
  static async getPolicies(
    ctx: TenantContext,
    filters?: GetPoliciesInput,
  ) {
    const where: Prisma.CompliancePolicyWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.category) {
      where.policyCategory = filters.category;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { policyName: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [policies, total] = await Promise.all([
      prisma.compliancePolicy.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.compliancePolicy.count({ where }),
    ]);

    return { policies, total };
  }

  static async createPolicy(
    ctx: TenantContext,
    input: CreatePolicyInput,
  ) {
    const count = await prisma.compliancePolicy.count({
      where: { companyId: ctx.companyId },
    });

    return prisma.compliancePolicy.create({
      data: {
        companyId: ctx.companyId,
        policyCategory: input.category,
        policyName: input.title,
        policyCode: `POL-${String(count + 1).padStart(4, "0")}`,
        description: input.description,
        effectiveDate: input.effectiveDate ?? new Date(),
        reviewDate: input.reviewDate ?? null,
        owner: input.owner ?? ctx.userId,
        applicableFrameworks: input.frameworkIds ?? [],
        version: "1.0",
        status: "draft",
        metadata: (input.metadata ?? {}) as unknown as Prisma.InputJsonValue,
      },
    });
  }

  static async updatePolicy(
    ctx: TenantContext,
    id: string,
    input: UpdatePolicyInput,
  ) {
    const existing = await prisma.compliancePolicy.findFirst({
      where: { id, companyId: ctx.companyId },
    });

    if (!existing) {
      throw new Error(`Policy ${id} not found`);
    }

    return prisma.compliancePolicy.update({
      where: { id },
      data: {
        ...(input.category !== undefined && { policyCategory: input.category }),
        ...(input.title !== undefined && { policyName: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.effectiveDate !== undefined && { effectiveDate: input.effectiveDate }),
        ...(input.reviewDate !== undefined && { reviewDate: input.reviewDate }),
        ...(input.owner !== undefined && { owner: input.owner }),
        ...(input.frameworkIds !== undefined && { applicableFrameworks: input.frameworkIds }),
        ...(input.metadata !== undefined && {
          metadata: input.metadata as unknown as Prisma.InputJsonValue,
        }),
      },
    });
  }

  static async getPolicyVersions(
    ctx: TenantContext,
    policyId: string,
  ) {
    const policy = await prisma.compliancePolicy.findFirst({
      where: { id: policyId, companyId: ctx.companyId },
    });

    if (!policy) {
      throw new Error(`Policy ${policyId} not found`);
    }

    const versions = await prisma.policyVersion.findMany({
      where: { policyId, companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
    });

    return { policy, versions };
  }

  static async getViolations(
    ctx: TenantContext,
    filters?: GetViolationsInput,
  ) {
    const where: Prisma.ComplianceViolationWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.violationType) {
      where.violationType = filters.violationType;
    }

    if (filters?.severity) {
      where.severity = filters.severity;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.policyId) {
      where.policyId = filters.policyId;
    }

    if (filters?.search) {
      where.OR = [
        { violationTitle: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [violations, total] = await Promise.all([
      prisma.complianceViolation.findMany({
        where,
        orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.complianceViolation.count({ where }),
    ]);

    return { violations, total };
  }

  static async createViolation(
    ctx: TenantContext,
    input: CreateViolationInput,
  ) {
    return prisma.complianceViolation.create({
      data: {
        companyId: ctx.companyId,
        violationType: input.violationType,
        severity: input.severity,
        violationTitle: input.title,
        description: input.description,
        policyId: input.policyId ?? null,
        status: "open",
        businessImpact: {} as unknown as Prisma.InputJsonValue,
        regulatoryImpact: {} as unknown as Prisma.InputJsonValue,
        financialImpact: {} as unknown as Prisma.InputJsonValue,
        riskRating: 0.5,
        metadata: (input.metadata ?? {}) as unknown as Prisma.InputJsonValue,
      },
    });
  }

  static async updateViolationStatus(
    ctx: TenantContext,
    id: string,
    status: ViolationStatus,
  ) {
    const existing = await prisma.complianceViolation.findFirst({
      where: { id, companyId: ctx.companyId },
    });

    if (!existing) {
      throw new Error(`Violation ${id} not found`);
    }

    return prisma.complianceViolation.update({
      where: { id },
      data: { status },
    });
  }

  static async getViolationsBySeverity(
    ctx: TenantContext,
  ) {
    const results = await prisma.complianceViolation.groupBy({
      by: ["severity"],
      where: { companyId: ctx.companyId },
      _count: { id: true },
    });

    const bySeverity: Record<string, number> = {};
    for (const r of results) {
      bySeverity[r.severity] = r._count.id;
    }

    return bySeverity as Record<ViolationSeverity, number>;
  }

  static async getRepeatedViolations(
    ctx: TenantContext,
  ) {
    const violations = await prisma.complianceViolation.groupBy({
      by: ["violationType", "policyId"],
      where: { companyId: ctx.companyId },
      _count: { id: true },
      having: { id: { _count: { gt: 1 } } },
    });

    return violations.map((v: any) => ({
      violationType: v.violationType,
      policyId: v.policyId,
      count: v._count.id,
    }));
  }
}
