// ─────────────────────────────────────────────────────────────
// Enterprise Finance Collaboration — Evidence Center
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  EvidenceType,
  VerificationStatus,
  SharedEvidenceItem,
} from "./types";

export class EvidenceCenter {
  // ─── Shared Evidence ────────────────────────────────────

  static async getSharedEvidence(
    ctx: TenantContext,
    filters?: {
      evidenceType?: EvidenceType;
      caseId?: string;
      verificationStatus?: VerificationStatus;
      specialist?: string;
      limit?: number;
      offset?: number;
    },
  ) {
    const where: Prisma.CaseEvidenceWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.evidenceType) {
      where.evidenceType = filters.evidenceType;
    }
    if (filters?.caseId) {
      where.caseId = filters.caseId;
    }
    if (filters?.verificationStatus) {
      where.verificationStatus = filters.verificationStatus;
    }
    if (filters?.specialist) {
      where.addedBy = filters.specialist;
    }

    const [evidence, total] = await Promise.all([
      prisma.caseEvidence.findMany({
        where,
        include: {
          case: {
            select: { id: true, caseNumber: true, title: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.caseEvidence.count({ where }),
    ]);

    return {
      evidence: evidence.map((e) => ({
        id: e.id,
        caseId: e.caseId,
        caseNumber: e.case?.caseNumber,
        caseTitle: e.case?.title,
        title: e.title,
        description: e.description,
        evidenceType: e.evidenceType as EvidenceType,
        referenceId: e.referenceId,
        referenceType: e.referenceType,
        sourceSpecialist: e.addedBy,
        verificationStatus: e.verificationStatus as VerificationStatus,
        verifiedBy: e.addedBy,
        verifiedAt: e.updatedAt,
        createdAt: e.createdAt,
      })),
      total,
    };
  }

  static async addEvidence(
    ctx: TenantContext,
    input: {
      caseId?: string;
      title: string;
      description: string;
      evidenceType: EvidenceType;
      referenceId: string;
      referenceType: string;
      source?: string;
      addedBy?: string;
    },
  ) {
    const evidence = await prisma.caseEvidence.create({
      data: {
        companyId: ctx.companyId,
        caseId: input.caseId ?? "",
        title: input.title,
        description: input.description,
        evidenceType: input.evidenceType,
        referenceId: input.referenceId,
        referenceType: input.referenceType,
        source: input.source ?? "manual",
        addedBy: input.addedBy ?? ctx.userId,
        verificationStatus: "unverified",
      },
    });

    if (input.caseId) {
      await prisma.collaborationTimeline.create({
        data: {
          companyId: ctx.companyId,
          financeCaseId: input.caseId,
          eventType: "evidence",
          eventTitle: "Evidence added",
          eventDescription: `${input.evidenceType} evidence: ${input.title}`,
          eventSource: "system",
          sourceType: "human",
          specialistName: input.addedBy ?? ctx.userId,
        },
      });
    }

    return evidence;
  }

  static async verifyEvidence(
    ctx: TenantContext,
    evidenceId: string,
  ) {
    const existing = await prisma.caseEvidence.findFirst({
      where: {
        id: evidenceId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Evidence ${evidenceId} not found`);
    }

    return prisma.caseEvidence.update({
      where: { id: evidenceId },
      data: {
        verificationStatus: "verified",
      },
    });
  }

  static async disputeEvidence(
    ctx: TenantContext,
    evidenceId: string,
  ) {
    const existing = await prisma.caseEvidence.findFirst({
      where: {
        id: evidenceId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Evidence ${evidenceId} not found`);
    }

    return prisma.caseEvidence.update({
      where: { id: evidenceId },
      data: {
        verificationStatus: "disputed",
      },
    });
  }

  static async getEvidenceByType(
    ctx: TenantContext,
    type: EvidenceType,
  ) {
    const evidence = await prisma.caseEvidence.findMany({
      where: {
        companyId: ctx.companyId,
        evidenceType: type,
      },
      orderBy: { createdAt: "desc" },
    });

    return evidence;
  }

  static async getEvidenceByReference(
    ctx: TenantContext,
    referenceId: string,
    referenceType: string,
  ) {
    const evidence = await prisma.caseEvidence.findMany({
      where: {
        companyId: ctx.companyId,
        referenceId,
        referenceType,
      },
      orderBy: { createdAt: "desc" },
    });

    return evidence;
  }

  static async getDuplicateEvidence(ctx: TenantContext) {
    const evidence = await prisma.caseEvidence.findMany({
      where: {
        companyId: ctx.companyId,
      },
      select: {
        id: true,
        title: true,
        evidenceType: true,
        referenceId: true,
        referenceType: true,
        caseId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const grouped = new Map<string, typeof evidence>();

    for (const e of evidence) {
      const key = `${e.evidenceType}:${e.referenceId}:${e.referenceType}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(e);
    }

    const duplicates: Array<{
      key: string;
      evidenceType: EvidenceType;
      referenceId: string;
      referenceType: string;
      count: number;
      items: typeof evidence;
    }> = [];

    for (const [key, items] of grouped) {
      if (items.length > 1) {
        const [evidenceType, referenceId, referenceType] = key.split(":");
        duplicates.push({
          key,
          evidenceType: evidenceType as EvidenceType,
          referenceId,
          referenceType,
          count: items.length,
          items,
        });
      }
    }

    return duplicates;
  }
}
