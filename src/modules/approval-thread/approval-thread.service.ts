import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { notificationService, NotificationService } from "@/modules/notifications";

const ROLE_MENTIONS = new Set(["@OWNER", "@ADMIN", "@TREASURER", "@MEMBER", "@VIEWER"]);

function parseMentions(body: string): string[] {
  const found: string[] = [];
  const words = body.split(/\s+/);
  for (const w of words) {
    const trimmed = w.trim();
    if (trimmed.startsWith("@")) {
      const upper = trimmed.toUpperCase();
      if (ROLE_MENTIONS.has(upper)) {
        found.push(upper);
      }
    }
  }
  return found;
}

async function notifyMentionedRoles(
  companyId: string,
  threadId: string,
  transactionId: string,
  mentions: string[],
  actorUserId: string,
  commentBody: string,
) {
  for (const mention of mentions) {
    const roleName = mention.replace("@", "");
    const members = await prisma.companyMembership.findMany({
      where: { companyId, role: roleName as any },
      select: { userId: true },
    });
    for (const m of members) {
      if (m.userId === actorUserId) continue;
      await notificationService.send({
        companyId,
        userId: m.userId,
        eventType: "APPROVAL_REQUIRED",
        title: `You were mentioned in an approval discussion`,
        message: commentBody.slice(0, 200),
        link: `/transactions/${transactionId}`,
        metadata: { threadId, transactionId, mention },
      });
    }
  }
}

async function notifyParticipants(
  companyId: string,
  threadId: string,
  transactionId: string,
  actorUserId: string,
) {
  const participants = await prisma.approvalParticipant.findMany({
    where: { threadId, companyId },
    select: { userId: true },
  });
  for (const p of participants) {
    if (p.userId === actorUserId) continue;
    await notificationService.send({
      companyId,
      userId: p.userId,
      eventType: "APPROVAL_REQUIRED",
      title: "New comment in approval discussion",
      link: `/transactions/${transactionId}`,
      metadata: { threadId, transactionId },
    });
  }
}

export class ApprovalThreadService {
  static async getOrCreate(ctx: TenantContext, transactionId: string) {
    const existing = await prisma.approvalThread.findUnique({
      where: { transactionId },
    });
    if (existing) return existing;

    const thread = await prisma.approvalThread.create({
      data: {
        transactionId,
        companyId: ctx.companyId,
      },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "APPROVAL_THREAD_CREATED",
      resourceType: "ApprovalThread",
      resourceId: thread.id,
      metadata: { transactionId },
    });

    return thread;
  }

  static async addComment(
    ctx: TenantContext,
    transactionId: string,
    body: string,
  ) {
    const thread = await this.getOrCreate(ctx, transactionId);
    const mentions = parseMentions(body);

    const [comment] = await prisma.$transaction(async (tx) => {
      const c = await tx.approvalComment.create({
        data: {
          threadId: thread.id,
          companyId: ctx.companyId,
          authorUserId: ctx.userId,
          body,
          mentions,
        },
        include: {
          author: { select: { id: true, name: true, email: true } },
        },
      });

      await tx.approvalParticipant.upsert({
        where: { threadId_userId: { threadId: thread.id, userId: ctx.userId } },
        create: { threadId: thread.id, companyId: ctx.companyId, userId: ctx.userId },
        update: {},
      });

      await recordAudit(tx, {
        companyId: ctx.companyId,
        actorUserId: ctx.userId,
        action: "APPROVAL_COMMENT_ADDED",
        resourceType: "ApprovalComment",
        resourceId: c.id,
        metadata: { threadId: thread.id, transactionId, mentions, bodyLength: body.length },
      });

      return [c];
    });

    if (mentions.length > 0) {
      await notifyMentionedRoles(ctx.companyId, thread.id, transactionId, mentions, ctx.userId, body);
    }
    await notifyParticipants(ctx.companyId, thread.id, transactionId, ctx.userId);

    return comment;
  }

  static async getThread(ctx: TenantContext, transactionId: string) {
    const thread = await prisma.approvalThread.findUnique({
      where: { transactionId },
      include: {
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
        },
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
    return thread;
  }

  static async getParticipants(ctx: TenantContext, threadId: string) {
    return prisma.approvalParticipant.findMany({
      where: { threadId, companyId: ctx.companyId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
