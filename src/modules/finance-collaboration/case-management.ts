// ─────────────────────────────────────────────────────────────
// Enterprise Finance Collaboration — Case Management Service
// ─────────────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type {
  CaseType,
  CaseStatus,
  CasePriority,
  CaseRecord,
  GetCasesInput,
  CreateCaseInput,
  UpdateCaseInput,
} from "./types";

export class CaseManagementService {
  // ─── Cases ───────────────────────────────────────────────

  static async getCases(
    ctx: TenantContext,
    filters?: GetCasesInput,
  ) {
    const where: Prisma.FinanceCaseWhereInput = {
      companyId: ctx.companyId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.caseType) {
      where.caseType = filters.caseType;
    }
    if (filters?.priority) {
      where.priority = filters.priority;
    }
    if (filters?.specialist) {
      where.OR = [
        { ownerSpecialist: filters.specialist },
        { participants: { some: { participantId: filters.specialist } } },
      ];
    }

    const [cases, total] = await Promise.all([
      prisma.financeCase.findMany({
        where,
        include: {
          participants: {
            select: { id: true, participantId: true, role: true },
          },
          _count: {
            select: { assignments: true, comments: true, evidence: true },
          },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: filters?.limit ?? 50,
        skip: filters?.offset ?? 0,
      }),
      prisma.financeCase.count({ where }),
    ]);

    return {
      cases: cases.map((c) => ({
        id: c.id,
        caseNumber: c.caseNumber,
        title: c.title,
        caseType: c.caseType as CaseType,
        status: c.status as CaseStatus,
        priority: c.priority as CasePriority,
        createdAt: c.createdAt,
        participantCount: c.participants.length,
        assignmentCount: c._count.assignments,
        commentCount: c._count.comments,
        evidenceCount: c._count.evidence,
      })) as CaseRecord[],
      total,
    };
  }

  static async getCaseById(
    ctx: TenantContext,
    caseId: string,
  ) {
    const financeCase = await prisma.financeCase.findFirst({
      where: {
        id: caseId,
        companyId: ctx.companyId,
      },
      include: {
        participants: {
          orderBy: { joinedAt: "asc" },
        },
        assignments: {
          orderBy: { createdAt: "asc" },
        },
        comments: {
          orderBy: { createdAt: "asc" },
        },
        evidence: {
          orderBy: { createdAt: "asc" },
        },
        decisions: {
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { evidence: true },
        },
      },
    });

    if (!financeCase) {
      throw new Error(`Finance case ${caseId} not found`);
    }

    return financeCase;
  }

  static async createCase(
    ctx: TenantContext,
    input: CreateCaseInput,
  ) {
    const maxCase = await prisma.financeCase.findFirst({
      where: { companyId: ctx.companyId },
      orderBy: { caseNumber: "desc" },
      select: { caseNumber: true },
    });

    const nextCaseNumber = (maxCase?.caseNumber ?? 0) + 1;

    return prisma.$transaction(async (tx) => {
      const financeCase = await tx.financeCase.create({
        data: {
          companyId: ctx.companyId,
          caseNumber: nextCaseNumber,
          title: input.title,
          description: input.description,
          caseType: input.caseType,
          status: "open",
          priority: input.priority,
          ownerSpecialist: input.assignee ?? ctx.userId,
          metadata: (input.metadata ?? {}) as unknown as Prisma.InputJsonValue,
        },
      });

      if (input.assignee) {
        await tx.caseParticipant.create({
          data: {
            companyId: ctx.companyId,
            caseId: financeCase.id,
            participantType: "human",
            participantId: input.assignee,
            participantName: input.assignee,
            role: "owner",
          },
        });
      }

      await tx.collaborationTimeline.create({
        data: {
          companyId: ctx.companyId,
          financeCaseId: financeCase.id,
          eventType: "system_event",
          eventTitle: "Case created",
          eventDescription: `Case "${input.title}" created with priority ${input.priority}`,
          eventSource: "system",
          sourceType: "human",
          specialistName: input.assignee ?? ctx.userId,
        },
      });

      return financeCase;
    });
  }

  static async updateCase(
    ctx: TenantContext,
    caseId: string,
    updates: UpdateCaseInput,
  ) {
    const existing = await prisma.financeCase.findFirst({
      where: {
        id: caseId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Finance case ${caseId} not found`);
    }

    const updateData: Prisma.FinanceCaseUpdateInput = {};

    if (updates.title !== undefined) {
      updateData.title = updates.title;
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }
    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }
    if (updates.priority !== undefined) {
      updateData.priority = updates.priority;
    }
    if (updates.metadata !== undefined) {
      updateData.metadata = updates.metadata as unknown as Prisma.InputJsonValue;
    }

    return prisma.financeCase.update({
      where: { id: caseId },
      data: updateData,
    });
  }

  static async closeCase(
    ctx: TenantContext,
    caseId: string,
  ) {
    const existing = await prisma.financeCase.findFirst({
      where: {
        id: caseId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Finance case ${caseId} not found`);
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.financeCase.update({
        where: { id: caseId },
        data: {
          status: "closed",
        },
      });

      await tx.collaborationTimeline.create({
        data: {
          companyId: ctx.companyId,
          financeCaseId: caseId,
          eventType: "decision",
          eventTitle: "Case closed",
          eventDescription: `Case "${existing.title}" has been closed`,
          eventSource: "system",
          sourceType: "human",
          specialistName: ctx.userId,
        },
      });

      return updated;
    });
  }

  // ─── Participants ───────────────────────────────────────

  static async getCaseParticipants(
    ctx: TenantContext,
    caseId: string,
  ) {
    const participants = await prisma.caseParticipant.findMany({
      where: {
        caseId,
        companyId: ctx.companyId,
      },
      orderBy: { joinedAt: "asc" },
    });

    return participants;
  }

  static async addParticipant(
    ctx: TenantContext,
    caseId: string,
    input: {
      participantType: string;
      participantId: string;
      participantName: string;
      role: string;
    },
  ) {
    const existing = await prisma.financeCase.findFirst({
      where: {
        id: caseId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Finance case ${caseId} not found`);
    }

    const participant = await prisma.caseParticipant.create({
      data: {
        companyId: ctx.companyId,
        caseId,
        participantType: input.participantType,
        participantId: input.participantId,
        participantName: input.participantName,
        role: input.role,
      },
    });

    await prisma.collaborationTimeline.create({
      data: {
        companyId: ctx.companyId,
        financeCaseId: caseId,
        eventType: "assignment",
        eventTitle: "Participant added",
        eventDescription: `${input.participantName} added as ${input.role}`,
        eventSource: "system",
        sourceType: "human",
        specialistName: input.participantId,
      },
    });

    return participant;
  }

  // ─── Comments ──────────────────────────────────────────

  static async getCaseComments(
    ctx: TenantContext,
    caseId: string,
  ) {
    const comments = await prisma.caseComment.findMany({
      where: {
        caseId,
        companyId: ctx.companyId,
      },
      orderBy: { createdAt: "asc" },
    });

    return comments;
  }

  static async addComment(
    ctx: TenantContext,
    caseId: string,
    input: {
      authorId: string;
      authorName: string;
      commentType: string;
      content: string;
    },
  ) {
    const existing = await prisma.financeCase.findFirst({
      where: {
        id: caseId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Finance case ${caseId} not found`);
    }

    const comment = await prisma.caseComment.create({
      data: {
        companyId: ctx.companyId,
        caseId,
        authorType: "human",
        authorId: input.authorId,
        authorName: input.authorName,
        commentType: input.commentType,
        content: input.content,
      },
    });

    await prisma.collaborationTimeline.create({
      data: {
        companyId: ctx.companyId,
        financeCaseId: caseId,
        eventType: "comment",
        eventTitle: `${input.commentType} comment`,
        eventDescription: input.content.slice(0, 200),
        eventSource: "system",
        sourceType: "human",
        specialistName: input.authorId,
      },
    });

    return comment;
  }

  // ─── Evidence ──────────────────────────────────────────

  static async getCaseEvidence(
    ctx: TenantContext,
    caseId: string,
  ) {
    const evidence = await prisma.caseEvidence.findMany({
      where: {
        caseId,
        companyId: ctx.companyId,
      },
      orderBy: { createdAt: "asc" },
    });

    return evidence;
  }

  static async addEvidence(
    ctx: TenantContext,
    caseId: string,
    input: {
      title: string;
      description: string;
      evidenceType: string;
      referenceId: string;
      referenceType: string;
      source?: string;
      addedBy?: string;
    },
  ) {
    const existing = await prisma.financeCase.findFirst({
      where: {
        id: caseId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Finance case ${caseId} not found`);
    }

    const evidence = await prisma.caseEvidence.create({
      data: {
        companyId: ctx.companyId,
        caseId,
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

    await prisma.collaborationTimeline.create({
      data: {
        companyId: ctx.companyId,
        financeCaseId: caseId,
        eventType: "evidence",
        eventTitle: "Evidence added",
        eventDescription: `${input.evidenceType} evidence: ${input.title}`,
        eventSource: "system",
        sourceType: "human",
        specialistName: input.addedBy ?? ctx.userId,
      },
    });

    return evidence;
  }

  // ─── Decisions ─────────────────────────────────────────

  static async getCaseDecisions(
    ctx: TenantContext,
    caseId: string,
  ) {
    const decisions = await prisma.caseDecision.findMany({
      where: {
        caseId,
        companyId: ctx.companyId,
      },
      orderBy: { createdAt: "asc" },
    });

    return decisions;
  }

  static async addDecision(
    ctx: TenantContext,
    caseId: string,
    input: {
      decisionType: string;
      title: string;
      decidedBy: string;
      decisionResult: string;
    },
  ) {
    const existing = await prisma.financeCase.findFirst({
      where: {
        id: caseId,
        companyId: ctx.companyId,
      },
    });

    if (!existing) {
      throw new Error(`Finance case ${caseId} not found`);
    }

    const decision = await prisma.caseDecision.create({
      data: {
        companyId: ctx.companyId,
        caseId,
        decisionType: input.decisionType,
        title: input.title,
        decidedBy: input.decidedBy,
        decisionResult: input.decisionResult,
      },
    });

    await prisma.collaborationTimeline.create({
      data: {
        companyId: ctx.companyId,
        financeCaseId: caseId,
        eventType: "decision",
        eventTitle: `Decision: ${input.decisionResult}`,
        eventDescription: input.title.slice(0, 200),
        eventSource: "system",
        sourceType: "human",
        specialistName: input.decidedBy,
      },
    });

    return decision;
  }
}
