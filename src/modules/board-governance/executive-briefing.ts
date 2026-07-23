// ─────────────────────────────────────────────────────────────
// Enterprise Board Governance — Executive Briefing Service
// ─────────────────────────────────────────────────────────────

import { prisma } from "@/server/db/prisma";
import { Prisma } from "@prisma/client";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import type { BoardBriefing, GenerateBriefingInput, BriefingListQuery } from "./types";

export class ExecutiveBriefingService {
  static async listBriefings(
    ctx: TenantContext,
    query: BriefingListQuery,
  ): Promise<{ briefings: BoardBriefing[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const where: Record<string, unknown> = { companyId: ctx.companyId };

    if (query.briefingType) where.briefingType = query.briefingType;

    const [rows, total] = await Promise.all([
      prisma.boardBriefing.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { briefingDate: "desc" } }),
      prisma.boardBriefing.count({ where }),
    ]);

    return { briefings: rows as BoardBriefing[], total, page, limit };
  }

  static async getBriefing(ctx: TenantContext, id: string): Promise<BoardBriefing> {
    const briefing = await prisma.boardBriefing.findFirst({ where: { id, companyId: ctx.companyId } });
    if (!briefing) throw new Error("Briefing not found");
    return briefing as BoardBriefing;
  }

  static async generateBriefing(
    ctx: TenantContext,
    input: GenerateBriefingInput,
  ): Promise<BoardBriefing> {
    const now = new Date();

    const [boards, meetings, resolutions, actions, overdueActions] = await Promise.all([
      prisma.board.findMany({ where: { companyId: ctx.companyId, status: "active" } }),
      prisma.boardMeeting.findMany({
        where: { companyId: ctx.companyId, status: "scheduled", scheduledDate: { gte: now } },
        take: 10,
        orderBy: { scheduledDate: "asc" },
      }),
      prisma.boardResolution.findMany({
        where: { companyId: ctx.companyId, status: { in: ["proposed", "voting"] } },
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
      prisma.boardAction.findMany({
        where: { companyId: ctx.companyId, status: { in: ["pending", "in_progress"] } },
        take: 10,
        orderBy: { dueDate: "asc" },
      }),
      prisma.boardAction.findMany({
        where: {
          companyId: ctx.companyId,
          status: { in: ["pending", "in_progress"] },
          dueDate: { lt: now },
        },
      }),
    ]);

    const completedResolutions = await prisma.boardResolution.findMany({
      where: { companyId: ctx.companyId, status: { in: ["approved", "rejected", "defeated"] } },
    });
    const passedCount = completedResolutions.filter((r) => r.passed).length;

    const briefing = await prisma.boardBriefing.create({
      data: {
        companyId: ctx.companyId,
        briefingDate: now,
        briefingType: input.briefingType,
        summary: {
          activeBoards: boards.length,
          upcomingMeetings: meetings.length,
          pendingResolutions: resolutions.length,
          overdueActions: overdueActions.length,
          resolutionPassRate:
            completedResolutions.length > 0
              ? Math.round((passedCount / completedResolutions.length) * 100)
              : 100,
        } as Prisma.InputJsonValue,
        meetingHighlights: {
          upcoming: meetings.map((m) => ({ id: m.id, title: m.title, date: m.scheduledDate, type: m.meetingType })),
        } as Prisma.InputJsonValue,
        actionStatus: {
          pending: actions.length,
          overdue: overdueActions.length,
          items: actions.map((a) => ({
            id: a.id,
            title: a.actionTitle,
            assignedTo: a.assignedTo,
            status: a.status,
            priority: a.priority,
            dueDate: a.dueDate,
          })),
        } as Prisma.InputJsonValue,
        riskHighlights: {} as Prisma.InputJsonValue,
        financialHighlights: {} as Prisma.InputJsonValue,
        auditHighlights: {} as Prisma.InputJsonValue,
        complianceHighlights: {
          overdueActions: overdueActions.map((a) => ({
            id: a.id,
            title: a.actionTitle,
            assignedTo: a.assignedTo,
            dueDate: a.dueDate,
          })),
        } as Prisma.InputJsonValue,
        taxHighlights: {} as Prisma.InputJsonValue,
        strategicHighlights: {} as Prisma.InputJsonValue,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "briefing.generated",
      resourceType: "BoardBriefing",
      resourceId: briefing.id,
      metadata: { type: input.briefingType } as Prisma.InputJsonValue,
    });

    return briefing as BoardBriefing;
  }
}
