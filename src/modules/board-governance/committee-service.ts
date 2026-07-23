// ─────────────────────────────────────────────────────────────
// Enterprise Board Governance — Committee Service
// ─────────────────────────────────────────────────────────────

import { prisma } from "@/server/db/prisma";
import { Prisma } from "@prisma/client";
import type { TenantContext } from "@/server/context/tenant-context";
import { NotFoundError, ConflictError } from "@/lib/errors/app-error";
import { recordAudit } from "@/modules/audit";
import type { Committee, CommitteeMember, CreateCommitteeInput, AddCommitteeMemberInput } from "./types";

export class CommitteeService {
  static async listCommittees(
    ctx: TenantContext,
    query: { boardId?: string; committeeType?: string; status?: string; search?: string; page?: number; limit?: number },
  ): Promise<{ committees: Committee[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const where: Record<string, unknown> = { companyId: ctx.companyId };

    if (query.boardId) where.boardId = query.boardId;
    if (query.committeeType) where.committeeType = query.committeeType;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { committeeName: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [rows, total] = await Promise.all([
      prisma.committee.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.committee.count({ where }),
    ]);

    return { committees: rows as Committee[], total, page, limit };
  }

  static async getCommittee(ctx: TenantContext, id: string): Promise<Committee> {
    const committee = await prisma.committee.findFirst({ where: { id, companyId: ctx.companyId } });
    if (!committee) throw new NotFoundError("Committee not found");
    return committee as Committee;
  }

  static async createCommittee(ctx: TenantContext, input: CreateCommitteeInput): Promise<Committee> {
    const existing = await prisma.committee.findFirst({
      where: { companyId: ctx.companyId, boardId: input.boardId, committeeName: input.committeeName },
      select: { id: true },
    });
    if (existing) throw new ConflictError(`Committee "${input.committeeName}" already exists on this board`);

    const committee = await prisma.committee.create({
      data: {
        boardId: input.boardId,
        companyId: ctx.companyId,
        committeeType: input.committeeType,
        committeeName: input.committeeName,
        description: input.description,
        charter: input.charter as Prisma.InputJsonValue,
        chairId: input.chairId,
        meetingFrequency: input.meetingFrequency ?? "monthly",
        status: "active",
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "committee.created",
      resourceType: "Committee",
      resourceId: committee.id,
      metadata: { name: committee.committeeName, type: committee.committeeType } as Prisma.InputJsonValue,
    });

    return committee as Committee;
  }

  static async addMember(ctx: TenantContext, input: AddCommitteeMemberInput): Promise<CommitteeMember> {
    const existing = await prisma.committeeMember.findFirst({
      where: { committeeId: input.committeeId, boardMemberId: input.boardMemberId, status: "active" },
      select: { id: true },
    });
    if (existing) throw new ConflictError("Member is already on this committee");

    const membership = await prisma.committeeMember.create({
      data: {
        committeeId: input.committeeId,
        companyId: ctx.companyId,
        boardMemberId: input.boardMemberId,
        role: input.role ?? "member",
        appointedDate: input.appointedDate ?? new Date(),
        status: "active",
        metadata: {},
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "committee.member_added",
      resourceType: "CommitteeMember",
      resourceId: membership.id,
      metadata: { committeeId: input.committeeId, memberId: input.boardMemberId, role: membership.role } as Prisma.InputJsonValue,
    });

    return membership as CommitteeMember;
  }

  static async removeMember(ctx: TenantContext, id: string): Promise<void> {
    const membership = await prisma.committeeMember.findFirst({ where: { id, status: "active" } });
    if (!membership) throw new NotFoundError("Committee membership not found");

    await prisma.committeeMember.update({ where: { id }, data: { status: "inactive", leftDate: new Date() } });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "committee.member_removed",
      resourceType: "CommitteeMember",
      resourceId: id,
      metadata: { committeeId: membership.committeeId, memberId: membership.boardMemberId } as Prisma.InputJsonValue,
    });
  }

  static async listMembers(ctx: TenantContext, committeeId: string): Promise<CommitteeMember[]> {
    const rows = await prisma.committeeMember.findMany({
      where: { committeeId, status: "active" },
      orderBy: { createdAt: "desc" },
    });
    return rows as CommitteeMember[];
  }
}
