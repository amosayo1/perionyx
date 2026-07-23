// ─────────────────────────────────────────────────────────────
// Enterprise Board Governance — Meeting Management Service
// ─────────────────────────────────────────────────────────────

import { prisma } from "@/server/db/prisma";
import { Prisma } from "@prisma/client";
import type { TenantContext } from "@/server/context/tenant-context";
import { NotFoundError } from "@/lib/errors/app-error";
import { recordAudit } from "@/modules/audit";
import type {
  BoardMeeting,
  MeetingAgenda,
  AgendaItem,
  MeetingMinute,
  CreateMeetingInput,
  AddAgendaItemInput,
  UpdateMeetingStatusInput,
  SubmitMinutesInput,
  MeetingListQuery,
} from "./types";

export class MeetingManagementService {
  static async listMeetings(
    ctx: TenantContext,
    query: MeetingListQuery,
  ): Promise<{ meetings: BoardMeeting[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const where: Record<string, unknown> = { companyId: ctx.companyId };

    if (query.boardId) where.boardId = query.boardId;
    if (query.meetingType) where.meetingType = query.meetingType;
    if (query.status) where.status = query.status;
    if (query.fromDate || query.toDate) {
      where.scheduledDate = {
        ...(query.fromDate ? { gte: new Date(query.fromDate) } : {}),
        ...(query.toDate ? { lte: new Date(query.toDate) } : {}),
      };
    }
    if (query.search) {
      where.OR = [{ title: { contains: query.search, mode: "insensitive" } }];
    }

    const [rows, total] = await Promise.all([
      prisma.boardMeeting.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { scheduledDate: "desc" } }),
      prisma.boardMeeting.count({ where }),
    ]);

    return { meetings: rows as BoardMeeting[], total, page, limit };
  }

  static async getMeeting(ctx: TenantContext, id: string): Promise<BoardMeeting> {
    const meeting = await prisma.boardMeeting.findFirst({ where: { id, companyId: ctx.companyId } });
    if (!meeting) throw new NotFoundError("Meeting not found");
    return meeting as BoardMeeting;
  }

  static async createMeeting(ctx: TenantContext, input: CreateMeetingInput): Promise<BoardMeeting> {
    const meeting = await prisma.boardMeeting.create({
      data: {
        boardId: input.boardId,
        companyId: ctx.companyId,
        committeeId: input.committeeId,
        meetingNumber: input.meetingNumber,
        title: input.title,
        meetingType: input.meetingType,
        scheduledDate: input.scheduledDate,
        duration: input.duration,
        location: input.location,
        status: "scheduled",
        attendees: [],
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "meeting.created",
      resourceType: "BoardMeeting",
      resourceId: meeting.id,
      metadata: { title: meeting.title, type: meeting.meetingType } as Prisma.InputJsonValue,
    });

    return meeting as BoardMeeting;
  }

  static async updateStatus(
    ctx: TenantContext,
    meetingId: string,
    input: UpdateMeetingStatusInput,
  ): Promise<BoardMeeting> {
    const meeting = await prisma.boardMeeting.findFirst({ where: { id: meetingId, companyId: ctx.companyId } });
    if (!meeting) throw new NotFoundError("Meeting not found");

    const updated = await prisma.boardMeeting.update({
      where: { id: meetingId },
      data: {
        status: input.status,
        quorumMet: input.quorumMet,
        attendees: input.attendees as Prisma.InputJsonValue,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "meeting.status_changed",
      resourceType: "BoardMeeting",
      resourceId: meetingId,
      metadata: { previousStatus: meeting.status, newStatus: input.status } as Prisma.InputJsonValue,
    });

    return updated as BoardMeeting;
  }

  // ─── Agenda ────────────────────────────────────────────

  static async listAgendaItems(
    ctx: TenantContext,
    meetingId: string,
  ): Promise<{ agenda: MeetingAgenda | null; items: AgendaItem[] }> {
    const agenda = await prisma.meetingAgenda.findFirst({
      where: { meetingId },
      orderBy: { createdAt: "desc" },
    });

    if (!agenda) return { agenda: null, items: [] };

    const items = await prisma.agendaItem.findMany({
      where: { agendaId: agenda.id },
      orderBy: { lineNumber: "asc" },
    });

    return { agenda: agenda as MeetingAgenda, items: items as AgendaItem[] };
  }

  static async addAgendaItem(
    ctx: TenantContext,
    input: AddAgendaItemInput,
  ): Promise<AgendaItem> {
    const agenda = await prisma.meetingAgenda.findFirst({ where: { id: input.agendaId } });
    if (!agenda) throw new NotFoundError("Meeting agenda not found");

    const maxLine = await prisma.agendaItem.aggregate({
      where: { agendaId: input.agendaId },
      _max: { lineNumber: true },
    });

    const item = await prisma.agendaItem.create({
      data: {
        companyId: agenda.companyId,
        agendaId: input.agendaId,
        lineNumber: (maxLine._max.lineNumber ?? 0) + 1,
        title: input.title,
        description: input.description,
        category: input.category ?? "other",
        presenter: input.presenter,
        durationMinutes: input.durationMinutes,
        requiresVote: input.requiresVote ?? false,
        requiresApproval: input.requiresApproval ?? false,
        status: "pending",
        metadata: {},
      },
    });

    await recordAudit(prisma, {
      companyId: agenda.companyId,
      actorUserId: ctx.userId,
      action: "meeting.agenda_item_added",
      resourceType: "AgendaItem",
      resourceId: item.id,
      metadata: { meetingId: agenda.meetingId, title: item.title, line: item.lineNumber } as Prisma.InputJsonValue,
    });

    return item as AgendaItem;
  }

  // ─── Minutes ───────────────────────────────────────────

  static async getMinutes(ctx: TenantContext, meetingId: string): Promise<MeetingMinute | null> {
    const minutes = await prisma.meetingMinute.findFirst({
      where: { meetingId },
      orderBy: { createdAt: "desc" },
    });
    return (minutes as MeetingMinute) ?? null;
  }

  static async submitMinutes(
    ctx: TenantContext,
    meetingId: string,
    input: SubmitMinutesInput,
  ): Promise<MeetingMinute> {
    const meeting = await prisma.boardMeeting.findFirst({ where: { id: meetingId, companyId: ctx.companyId } });
    if (!meeting) throw new NotFoundError("Meeting not found");

    const minutes = await prisma.meetingMinute.create({
      data: {
        companyId: ctx.companyId,
        meetingId,
        minuteType: "draft",
        content: input.content as Prisma.InputJsonValue,
        actionItemCount: 0,
        resolutionCount: 0,
        metadata: {},
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "meeting.minutes_submitted",
      resourceType: "MeetingMinute",
      resourceId: minutes.id,
      metadata: { meetingId } as Prisma.InputJsonValue,
    });

    return minutes as MeetingMinute;
  }

  static async approveMinutes(ctx: TenantContext, meetingId: string): Promise<MeetingMinute> {
    const minutes = await prisma.meetingMinute.findFirst({
      where: { meetingId },
      orderBy: { createdAt: "desc" },
    });
    if (!minutes) throw new NotFoundError("Minutes not found");

    const updated = await prisma.meetingMinute.update({
      where: { id: minutes.id },
      data: { minuteType: "approved", approvedBy: ctx.userId, approvedAt: new Date() },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "meeting.minutes_approved",
      resourceType: "MeetingMinute",
      resourceId: minutes.id,
      metadata: { meetingId } as Prisma.InputJsonValue,
    });

    return updated as MeetingMinute;
  }
}
