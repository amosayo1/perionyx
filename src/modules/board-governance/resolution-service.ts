// ─────────────────────────────────────────────────────────────
// Enterprise Board Governance — Resolution Service
// ─────────────────────────────────────────────────────────────

import { prisma } from "@/server/db/prisma";
import { Prisma } from "@prisma/client";
import type { TenantContext } from "@/server/context/tenant-context";
import { NotFoundError, ConflictError } from "@/lib/errors/app-error";
import { recordAudit } from "@/modules/audit";
import type { BoardResolution, BoardVote, CreateResolutionInput, CastVoteInput, ResolutionListQuery } from "./types";

export class ResolutionService {
  static async listResolutions(
    ctx: TenantContext,
    query: ResolutionListQuery,
  ): Promise<{ resolutions: BoardResolution[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const where: Record<string, unknown> = { companyId: ctx.companyId };

    if (query.meetingId) where.meetingId = query.meetingId;
    if (query.resolutionType) where.resolutionType = query.resolutionType;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        { resolutionNumber: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [rows, total] = await Promise.all([
      prisma.boardResolution.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.boardResolution.count({ where }),
    ]);

    return { resolutions: rows as BoardResolution[], total, page, limit };
  }

  static async getResolution(ctx: TenantContext, id: string): Promise<BoardResolution> {
    const resolution = await prisma.boardResolution.findFirst({ where: { id, companyId: ctx.companyId } });
    if (!resolution) throw new NotFoundError("Resolution not found");
    return resolution as BoardResolution;
  }

  static async createResolution(ctx: TenantContext, input: CreateResolutionInput): Promise<BoardResolution> {
    const count = await prisma.boardResolution.count({ where: { companyId: ctx.companyId } });
    const resolutionNumber = `RES-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    const resolution = await prisma.boardResolution.create({
      data: {
        companyId: ctx.companyId,
        meetingId: input.meetingId,
        resolutionNumber,
        title: input.title,
        description: input.description,
        resolutionType: input.resolutionType,
        status: "proposed",
        requiredVotes: input.requiredVotes,
        votesFor: 0,
        votesAgainst: 0,
        abstentions: 0,
        passed: false,
        effectiveDate: input.effectiveDate,
        expiryDate: input.expiryDate,
        owner: input.owner ?? ctx.userId,
        dependencies: [],
        evidenceIds: [],
        metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "resolution.created",
      resourceType: "BoardResolution",
      resourceId: resolution.id,
      metadata: { number: resolution.resolutionNumber, title: resolution.title, type: resolution.resolutionType } as Prisma.InputJsonValue,
    });

    return resolution as BoardResolution;
  }

  static async castVote(ctx: TenantContext, input: CastVoteInput): Promise<BoardVote> {
    const resolution = await prisma.boardResolution.findFirst({ where: { id: input.boardMemberId ? undefined : "", companyId: ctx.companyId } });
    const url = new URL("http://localhost");

    // Find resolution by meeting context or pass resolutionId in the input
    const existingVote = await prisma.boardVote.findFirst({
      where: { resolutionId: "", boardMemberId: input.boardMemberId },
      select: { id: true },
    });

    const vote = await prisma.boardVote.create({
      data: {
        companyId: ctx.companyId,
        resolutionId: "",
        meetingId: input.meetingId,
        boardMemberId: input.boardMemberId,
        vote: input.vote,
        rationale: input.rationale,
        votedAt: new Date(),
        metadata: {},
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "resolution.vote_cast",
      resourceType: "BoardVote",
      resourceId: vote.id,
      metadata: { boardMemberId: input.boardMemberId, vote: input.vote } as Prisma.InputJsonValue,
    });

    return vote as BoardVote;
  }

  static async closeVoting(ctx: TenantContext, resolutionId: string): Promise<BoardResolution> {
    const resolution = await prisma.boardResolution.findFirst({ where: { id: resolutionId, companyId: ctx.companyId } });
    if (!resolution) throw new NotFoundError("Resolution not found");

    const votes = await prisma.boardVote.groupBy({
      by: ["vote"],
      where: { resolutionId },
      _count: { vote: true },
    });

    const counts = Object.fromEntries(votes.map((v) => [v.vote, v._count.vote]));
    const votesFor = counts["for"] ?? 0;
    const votesAgainst = counts["against"] ?? 0;
    const abstentions = counts["abstain"] ?? 0;
    const passed = votesFor > resolution.requiredVotes;

    const updated = await prisma.boardResolution.update({
      where: { id: resolutionId },
      data: {
        votesFor,
        votesAgainst,
        abstentions,
        passed,
        status: passed ? "approved" : "rejected",
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "resolution.voting_closed",
      resourceType: "BoardResolution",
      resourceId: resolutionId,
      metadata: { result: passed ? "approved" : "rejected", votesFor, votesAgainst } as Prisma.InputJsonValue,
    });

    return updated as BoardResolution;
  }

  static async listVotes(ctx: TenantContext, resolutionId: string): Promise<BoardVote[]> {
    const rows = await prisma.boardVote.findMany({
      where: { resolutionId },
      orderBy: { votedAt: "asc" },
    });
    return rows as BoardVote[];
  }
}
