// ─────────────────────────────────────────────────────────────
// Enterprise Board Governance — Board & Member Service
// ─────────────────────────────────────────────────────────────

import { prisma } from "@/server/db/prisma";
import { Prisma } from "@prisma/client";
import type { TenantContext } from "@/server/context/tenant-context";
import { NotFoundError, ConflictError } from "@/lib/errors/app-error";
import { recordAudit } from "@/modules/audit";
import type {
  Board,
  BoardMember,
  CreateBoardInput,
  UpdateBoardInput,
  CreateMemberInput,
  BoardListQuery,
} from "./types";

export class BoardGovernanceService {
  static async listBoards(
    ctx: TenantContext,
    query: BoardListQuery,
  ): Promise<{ boards: Board[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const where: Record<string, unknown> = { companyId: ctx.companyId };

    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { boardName: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [rows, total] = await Promise.all([
      prisma.board.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.board.count({ where }),
    ]);

    return { boards: rows as Board[], total, page, limit };
  }

  static async getBoard(ctx: TenantContext, id: string): Promise<Board> {
    const board = await prisma.board.findFirst({
      where: { id, companyId: ctx.companyId },
    });
    if (!board) throw new NotFoundError("Board not found");
    return board as Board;
  }

  static async createBoard(ctx: TenantContext, input: CreateBoardInput): Promise<Board> {
    const existing = await prisma.board.findFirst({
      where: { companyId: ctx.companyId, boardName: input.boardName },
      select: { id: true },
    });
    if (existing) throw new ConflictError(`Board "${input.boardName}" already exists`);

    const board = await prisma.board.create({
      data: {
        companyId: ctx.companyId,
        boardName: input.boardName,
        description: input.description,
        status: "active",
        formationDate: input.formationDate,
        chairmanId: input.chairmanId,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "board.created",
      resourceType: "Board",
      resourceId: board.id,
      metadata: { name: board.boardName } as Prisma.InputJsonValue,
    });

    return board as Board;
  }

  static async updateBoard(
    ctx: TenantContext,
    id: string,
    input: UpdateBoardInput,
  ): Promise<Board> {
    const existing = await prisma.board.findFirst({
      where: { id, companyId: ctx.companyId },
    });
    if (!existing) throw new NotFoundError("Board not found");

    const board = await prisma.board.update({
      where: { id },
      data: {
        ...(input.boardName !== undefined && { boardName: input.boardName }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.chairmanId !== undefined && { chairmanId: input.chairmanId }),
        ...(input.formationDate !== undefined && { formationDate: input.formationDate }),
        ...(input.metadata !== undefined && { metadata: input.metadata as Prisma.InputJsonValue }),
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "board.updated",
      resourceType: "Board",
      resourceId: board.id,
      metadata: { changes: Object.keys(input) } as Prisma.InputJsonValue,
    });

    return board as Board;
  }

  static async deleteBoard(ctx: TenantContext, id: string): Promise<void> {
    const existing = await prisma.board.findFirst({
      where: { id, companyId: ctx.companyId },
    });
    if (!existing) throw new NotFoundError("Board not found");

    await prisma.board.update({
      where: { id },
      data: { status: "dissolved" },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "board.deleted",
      resourceType: "Board",
      resourceId: id,
      metadata: { name: existing.boardName } as Prisma.InputJsonValue,
    });
  }

  // ─── Member CRUD ───────────────────────────────────────

  static async listMembers(
    ctx: TenantContext,
    boardId: string,
    query: { status?: string; search?: string; page?: number; limit?: number },
  ): Promise<{ members: BoardMember[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const where: Record<string, unknown> = { boardId, companyId: ctx.companyId };

    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { memberName: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [rows, total] = await Promise.all([
      prisma.boardMember.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.boardMember.count({ where }),
    ]);

    return { members: rows as BoardMember[], total, page, limit };
  }

  static async getMember(ctx: TenantContext, id: string): Promise<BoardMember> {
    const member = await prisma.boardMember.findFirst({
      where: { id, companyId: ctx.companyId },
    });
    if (!member) throw new NotFoundError("Board member not found");
    return member as BoardMember;
  }

  static async addMember(ctx: TenantContext, input: CreateMemberInput): Promise<BoardMember> {
    const existing = await prisma.boardMember.findFirst({
      where: { boardId: input.boardId, companyId: ctx.companyId, email: input.email ?? "" },
      select: { id: true },
    });
    if (existing) throw new ConflictError("Member already on this board");

    const member = await prisma.boardMember.create({
      data: {
        boardId: input.boardId,
        companyId: ctx.companyId,
        memberName: input.memberName,
        title: input.title,
        email: input.email,
        appointmentDate: input.appointmentDate,
        termEndDate: input.termEndDate,
        status: "active",
        votingRights: input.votingRights ?? true,
        committees: input.committees ?? [],
        attendanceRate: 0,
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "board.member_added",
      resourceType: "BoardMember",
      resourceId: member.id,
      metadata: { boardId: input.boardId, name: member.memberName } as Prisma.InputJsonValue,
    });

    return member as BoardMember;
  }

  static async updateMemberStatus(
    ctx: TenantContext,
    id: string,
    status: string,
  ): Promise<BoardMember> {
    const existing = await prisma.boardMember.findFirst({
      where: { id, companyId: ctx.companyId },
    });
    if (!existing) throw new NotFoundError("Board member not found");

    const member = await prisma.boardMember.update({
      where: { id },
      data: { status },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "board.member_status_changed",
      resourceType: "BoardMember",
      resourceId: id,
      metadata: { previousStatus: existing.status, newStatus: status } as Prisma.InputJsonValue,
    });

    return member as BoardMember;
  }
}
