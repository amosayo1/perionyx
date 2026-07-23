// ─────────────────────────────────────────────────────────────
// Enterprise Audit Specialist — Evidence Management Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  EvidencePackageSummary,
  GetEvidencePackagesInput,
  CreateEvidencePackageInput,
  AddFindingEvidenceInput,
} from "./types";

export class EvidenceManagementService {
  /**
   * Get all evidence packages, optionally filtered.
   */
  static async getEvidencePackages(
    ctx: TenantContext,
    filters?: GetEvidencePackagesInput,
  ) {
    const where: Prisma.AuditEvidencePackageWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.packageType) {
      where.packageType = filters.packageType;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.engagementId) {
      where.engagementId = filters.engagementId;
    }

    const [packages, total] = await Promise.all([
      prisma.auditEvidencePackage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.auditEvidencePackage.count({ where }),
    ]);

    return { packages, total };
  }

  /**
   * Create a new evidence package.
   */
  static async createPackage(
    ctx: TenantContext,
    input: CreateEvidencePackageInput,
  ) {
    const pkgCount = await prisma.auditEvidencePackage.count({
      where: { companyId: ctx.companyId },
    });

    return prisma.auditEvidencePackage.create({
      data: {
        companyId: ctx.companyId,
        packageNumber: `PKG-${String(pkgCount + 1).padStart(4, "0")}`,
        title: input.title,
        description: input.description ?? "",
        packageType: input.packageType,
        engagementId: input.engagementId ?? null,
        assembledBy: input.preparedBy ?? ctx.userId,
        status: "assembling",
        metadata: {} as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Add an evidence item to a package by updating the evidenceItems JSON array.
   */
  static async addEvidenceToPackage(
    ctx: TenantContext,
    packageId: string,
    evidenceId: string,
  ) {
    const pkg = await prisma.auditEvidencePackage.findFirst({
      where: {
        id: packageId,
        companyId: ctx.companyId,
      },
    });

    if (!pkg) {
      throw new Error(`Evidence package ${packageId} not found`);
    }

    const currentItems = (pkg.evidenceItems as string[]) ?? [];
    const updatedItems = [...currentItems, evidenceId];

    return prisma.auditEvidencePackage.update({
      where: { id: packageId },
      data: {
        evidenceItems: updatedItems as unknown as Prisma.InputJsonValue,
        evidenceCount: updatedItems.length,
      },
    });
  }

  /**
   * Get a specific evidence package by ID.
   */
  static async getPackageById(
    ctx: TenantContext,
    packageId: string,
  ) {
    const pkg = await prisma.auditEvidencePackage.findFirst({
      where: {
        id: packageId,
        companyId: ctx.companyId,
      },
    });

    if (!pkg) {
      throw new Error(`Evidence package ${packageId} not found`);
    }

    return pkg;
  }

  /**
   * Assemble a package — validate completeness and mark as complete.
   */
  static async assemblePackage(
    ctx: TenantContext,
    packageId: string,
  ) {
    const pkg = await prisma.auditEvidencePackage.findFirst({
      where: {
        id: packageId,
        companyId: ctx.companyId,
      },
    });

    if (!pkg) {
      throw new Error(`Evidence package ${packageId} not found`);
    }

    if (pkg.evidenceCount === 0) {
      throw new Error("Cannot assemble an empty evidence package");
    }

    return prisma.auditEvidencePackage.update({
      where: { id: packageId },
      data: {
        status: "complete",
        assembledBy: ctx.userId,
      },
    });
  }

  /**
   * Approve an evidence package — mark as approved.
   */
  static async approvePackage(
    ctx: TenantContext,
    packageId: string,
  ) {
    const pkg = await prisma.auditEvidencePackage.findFirst({
      where: {
        id: packageId,
        companyId: ctx.companyId,
      },
    });

    if (!pkg) {
      throw new Error(`Evidence package ${packageId} not found`);
    }

    return prisma.auditEvidencePackage.update({
      where: { id: packageId },
      data: {
        status: "approved",
        approvedBy: ctx.userId,
        approvedAt: new Date(),
      },
    });
  }

  /**
   * Get all evidence items associated with a finding.
   */
  static async getFindingEvidence(
    ctx: TenantContext,
    findingId: string,
  ) {
    const finding = await prisma.auditFinding.findFirst({
      where: {
        id: findingId,
        companyId: ctx.companyId,
      },
    });

    if (!finding) {
      throw new Error(`Finding ${findingId} not found`);
    }

    return prisma.findingEvidence.findMany({
      where: {
        companyId: ctx.companyId,
        findingId,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Add evidence to a finding.
   */
  static async addFindingEvidence(
    ctx: TenantContext,
    findingId: string,
    input: AddFindingEvidenceInput,
  ) {
    const finding = await prisma.auditFinding.findFirst({
      where: {
        id: findingId,
        companyId: ctx.companyId,
      },
    });

    if (!finding) {
      throw new Error(`Finding ${findingId} not found`);
    }

    return prisma.findingEvidence.create({
      data: {
        companyId: ctx.companyId,
        findingId,
        evidenceType: input.evidenceType,
        referenceId: findingId,
        referenceType: "audit_finding",
        title: input.title,
        description: input.description ?? "",
        source: "manual",
        collectedBy: ctx.userId,
        collectedAt: new Date(),
        confidence: new Prisma.Decimal(1),
        verificationStatus: "unverified",
        immutable: true,
        metadata: {} as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /**
   * Get evidence package summary for dashboard display.
   */
  static async getEvidencePackageSummary(
    ctx: TenantContext,
  ): Promise<EvidencePackageSummary> {
    const [packages, evidenceItems, pendingVerification] = await Promise.all([
      prisma.auditEvidencePackage.findMany({
        where: { companyId: ctx.companyId },
        select: { status: true },
      }),
      prisma.findingEvidence.count({
        where: { companyId: ctx.companyId },
      }),
      prisma.findingEvidence.count({
        where: {
          companyId: ctx.companyId,
          verificationStatus: "unverified",
        },
      }),
    ]);

    const byStatus: Record<string, number> = {};

    for (const p of packages) {
      byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
    }

    return {
      totalPackages: packages.length,
      byStatus: byStatus as Record<EvidencePackageStatus, number>,
      totalEvidenceItems: evidenceItems,
      pendingVerification,
    };
  }
}

type EvidencePackageStatus = "assembling" | "complete" | "approved" | "submitted" | "draft" | "archived" | "review";
