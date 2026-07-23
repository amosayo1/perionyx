import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { recordAudit } from "@/modules/audit";
import { NotFoundError, ValidationError, ConflictError } from "@/lib/errors/app-error";
import type {
  AgentConversation,
  ConversationRole,
  ConversationContentType,
  AuditAction,
} from "./types";

export class HumanInteraction {
  static async askQuestion(
    ctx: TenantContext,
    agentId: string,
    sessionId: string,
    question: string,
    options?: {
      contentType?: ConversationContentType;
      decisionId?: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<AgentConversation> {
    await this.findAgentOrThrow(ctx, agentId);
    await this.findSessionOrThrow(ctx, sessionId);

    const conversation = await prisma.agentConversation.create({
      data: {
        companyId: ctx.companyId,
        sessionId,
        agentId,
        decisionId: options?.decisionId ?? null,
        role: "agent",
        content: question,
        contentType: options?.contentType ?? "question",
        metadata: (options?.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    await this.recordAgentAudit(ctx, agentId, "memory.stored", conversation.id, {
      sessionId,
      role: "agent",
      contentType: options?.contentType ?? "question",
      contentPreview: question.slice(0, 200),
    });

    return this.toConversation(conversation);
  }

  static async clarifyRequest(
    ctx: TenantContext,
    agentId: string,
    sessionId: string,
    clarification: string,
    options?: {
      decisionId?: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<AgentConversation> {
    await this.findAgentOrThrow(ctx, agentId);
    await this.findSessionOrThrow(ctx, sessionId);

    const conversation = await prisma.agentConversation.create({
      data: {
        companyId: ctx.companyId,
        sessionId,
        agentId,
        decisionId: options?.decisionId ?? null,
        role: "agent",
        content: clarification,
        contentType: "clarification",
        metadata: (options?.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    await this.recordAgentAudit(ctx, agentId, "memory.stored", conversation.id, {
      sessionId,
      role: "agent",
      contentType: "clarification",
      contentPreview: clarification.slice(0, 200),
    });

    return this.toConversation(conversation);
  }

  static async presentEvidence(
    ctx: TenantContext,
    agentId: string,
    sessionId: string,
    evidenceDescription: string,
    options?: {
      evidenceRefs?: string[];
      decisionId?: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<AgentConversation> {
    await this.findAgentOrThrow(ctx, agentId);
    await this.findSessionOrThrow(ctx, sessionId);

    const metadata: Record<string, unknown> = {
      ...(options?.metadata ?? {}),
    };
    if (options?.evidenceRefs && options.evidenceRefs.length > 0) {
      metadata.evidenceRefs = options.evidenceRefs;
    }

    const conversation = await prisma.agentConversation.create({
      data: {
        companyId: ctx.companyId,
        sessionId,
        agentId,
        decisionId: options?.decisionId ?? null,
        role: "agent",
        content: evidenceDescription,
        contentType: "evidence",
        metadata: metadata as Prisma.InputJsonValue,
      },
    });

    await this.recordAgentAudit(ctx, agentId, "evidence.collected", conversation.id, {
      sessionId,
      role: "agent",
      contentType: "evidence",
      evidenceRefCount: options?.evidenceRefs?.length ?? 0,
    });

    return this.toConversation(conversation);
  }

  static async explainReasoning(
    ctx: TenantContext,
    agentId: string,
    sessionId: string,
    explanation: string,
    options?: {
      decisionId?: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<AgentConversation> {
    await this.findAgentOrThrow(ctx, agentId);
    await this.findSessionOrThrow(ctx, sessionId);

    const conversation = await prisma.agentConversation.create({
      data: {
        companyId: ctx.companyId,
        sessionId,
        agentId,
        decisionId: options?.decisionId ?? null,
        role: "agent",
        content: explanation,
        contentType: "text",
        metadata: (options?.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    await this.recordAgentAudit(ctx, agentId, "memory.stored", conversation.id, {
      sessionId,
      role: "agent",
      contentType: "text",
      contentPreview: explanation.slice(0, 200),
    });

    return this.toConversation(conversation);
  }

  static async acceptFeedback(
    ctx: TenantContext,
    agentId: string,
    sessionId: string,
    feedback: string,
    options?: {
      rating?: number;
      decisionId?: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<AgentConversation> {
    await this.findAgentOrThrow(ctx, agentId);
    await this.findSessionOrThrow(ctx, sessionId);

    if (options?.rating !== undefined) {
      if (options.rating < 1 || options.rating > 5) {
        throw new ValidationError("Rating must be between 1 and 5");
      }
    }

    const metadata: Record<string, unknown> = {
      ...(options?.metadata ?? {}),
    };
    if (options?.rating !== undefined) {
      metadata.rating = options.rating;
    }

    const conversation = await prisma.agentConversation.create({
      data: {
        companyId: ctx.companyId,
        sessionId,
        agentId,
        decisionId: options?.decisionId ?? null,
        role: "user",
        content: feedback,
        contentType: "text",
        metadata: metadata as Prisma.InputJsonValue,
      },
    });

    await this.recordAgentAudit(ctx, agentId, "memory.stored", conversation.id, {
      sessionId,
      role: "user",
      contentType: "text",
      rating: options?.rating ?? null,
      contentPreview: feedback.slice(0, 200),
    });

    return this.toConversation(conversation);
  }

  static async getConversation(
    ctx: TenantContext,
    sessionId: string,
    limit = 50,
  ): Promise<AgentConversation[]> {
    await this.findSessionOrThrow(ctx, sessionId);

    const rows = await prisma.agentConversation.findMany({
      where: { companyId: ctx.companyId, sessionId },
      orderBy: { createdAt: "asc" },
      take: Math.min(limit, 200),
    });

    return rows.map(this.toConversation);
  }

  static async getConversationThread(
    ctx: TenantContext,
    sessionId: string,
    decisionId?: string,
  ): Promise<AgentConversation[]> {
    await this.findSessionOrThrow(ctx, sessionId);

    const where: Prisma.AgentConversationWhereInput = {
      companyId: ctx.companyId,
      sessionId,
      ...(decisionId ? { decisionId } : {}),
    };

    const rows = await prisma.agentConversation.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    return rows.map(this.toConversation);
  }

  static async getRecentInteractions(
    ctx: TenantContext,
    agentId: string,
    limit = 20,
  ): Promise<AgentConversation[]> {
    await this.findAgentOrThrow(ctx, agentId);

    const rows = await prisma.agentConversation.findMany({
      where: { companyId: ctx.companyId, agentId },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
    });

    return rows.map(this.toConversation);
  }

  static async getInteractionStats(
    ctx: TenantContext,
    agentId: string,
  ): Promise<{
    totalConversations: number;
    questionsAsked: number;
    feedbackReceived: number;
    avgRating: number | null;
  }> {
    await this.findAgentOrThrow(ctx, agentId);

    const allConversations = await prisma.agentConversation.findMany({
      where: { companyId: ctx.companyId, agentId },
      select: {
        role: true,
        contentType: true,
        metadata: true,
      },
    });

    const totalConversations = allConversations.length;

    const questionsAsked = allConversations.filter(
      (c) => c.role === "agent" && c.contentType === "question",
    ).length;

    const feedbackConversations = allConversations.filter(
      (c) => c.role === "user",
    );

    const feedbackReceived = feedbackConversations.length;

    const ratings = feedbackConversations
      .map((c) => {
        const meta = (c.metadata as Record<string, unknown>) ?? {};
        return meta.rating as number | undefined;
      })
      .filter((r): r is number => typeof r === "number" && r >= 1 && r <= 5);

    const avgRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 100) / 100
        : null;

    return {
      totalConversations,
      questionsAsked,
      feedbackReceived,
      avgRating,
    };
  }

  static async markResolved(
    ctx: TenantContext,
    sessionId: string,
  ): Promise<void> {
    const session = await prisma.agentSession.findFirst({
      where: { id: sessionId, companyId: ctx.companyId },
    });

    if (!session) {
      throw new NotFoundError("AgentSession");
    }

    if (session.status === "COMPLETED" || session.status === "TERMINATED") {
      throw new ConflictError("Session is already ended");
    }

    const now = new Date();
    const duration = now.getTime() - session.startedAt.getTime();

    await prisma.agentSession.update({
      where: { id: sessionId },
      data: { status: "COMPLETED", endedAt: now, duration },
    });

    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action: "agent.stopped",
      resourceType: "AgentSession",
      resourceId: sessionId,
      metadata: {
        agentId: session.agentId,
        action: "marked_resolved",
        duration,
      } as Prisma.InputJsonValue,
    });
  }

  private static async findAgentOrThrow(
    ctx: TenantContext,
    agentId: string,
  ) {
    const agent = await prisma.agentDefinition.findFirst({
      where: { id: agentId, companyId: ctx.companyId },
      select: { id: true },
    });

    if (!agent) {
      throw new NotFoundError("Agent");
    }

    return agent;
  }

  private static async findSessionOrThrow(
    ctx: TenantContext,
    sessionId: string,
  ) {
    const session = await prisma.agentSession.findFirst({
      where: { id: sessionId, companyId: ctx.companyId },
      select: { id: true },
    });

    if (!session) {
      throw new NotFoundError("AgentSession");
    }

    return session;
  }

  private static async recordAgentAudit(
    ctx: TenantContext,
    agentId: string,
    action: AuditAction,
    resourceId: string | null,
    metadata?: Record<string, unknown>,
  ) {
    await recordAudit(prisma, {
      companyId: ctx.companyId,
      actorUserId: ctx.userId,
      action,
      resourceType: "AgentConversation",
      resourceId,
      metadata: {
        agentId,
        ...(metadata ?? {}),
      } as Prisma.InputJsonValue,
    });
  }

  private static toConversation(row: {
    id: string;
    companyId: string;
    sessionId: string;
    agentId: string;
    decisionId: string | null;
    role: string;
    content: string;
    contentType: string;
    metadata: unknown;
    createdAt: Date;
  }): AgentConversation {
    return {
      id: row.id,
      companyId: row.companyId,
      sessionId: row.sessionId,
      agentId: row.agentId,
      decisionId: row.decisionId,
      role: row.role as ConversationRole,
      content: row.content,
      contentType: row.contentType as ConversationContentType,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
      createdAt: row.createdAt.toISOString(),
    };
  }
}
