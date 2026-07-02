import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";

export type ConversationSummary = {
  id: string;
  title: string;
  messageCount: number;
  updatedAt: string;
};

export type MessageRow = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations: string[];
  followUps: string[];
  createdAt: string;
};

export type ConversationDetail = {
  id: string;
  title: string;
  messages: MessageRow[];
  createdAt: string;
  updatedAt: string;
};

export async function listConversations(ctx: TenantContext): Promise<ConversationSummary[]> {
  const conversations = await prisma.copilotConversation.findMany({
    where: { companyId: ctx.companyId, userId: ctx.userId },
    orderBy: { updatedAt: "desc" },
    take: 50,
    include: { _count: { select: { messages: true } } },
  });

  return conversations.map((c) => ({
    id: c.id,
    title: c.title,
    messageCount: c._count.messages,
    updatedAt: c.updatedAt.toISOString(),
  }));
}

export async function getConversation(ctx: TenantContext, conversationId: string): Promise<ConversationDetail | null> {
  const conversation = await prisma.copilotConversation.findFirst({
    where: { id: conversationId, companyId: ctx.companyId, userId: ctx.userId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, content: true, citations: true, followUps: true, createdAt: true },
      },
    },
  });

  if (!conversation) return null;

  return {
    id: conversation.id,
    title: conversation.title,
    messages: conversation.messages.map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
      citations: m.citations,
      followUps: m.followUps,
      createdAt: m.createdAt.toISOString(),
    })),
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
  };
}

export async function createConversation(ctx: TenantContext, title?: string): Promise<ConversationSummary> {
  const conversation = await prisma.copilotConversation.create({
    data: {
      companyId: ctx.companyId,
      userId: ctx.userId,
      title: title ?? "New conversation",
    },
  });

  return {
    id: conversation.id,
    title: conversation.title,
    messageCount: 0,
    updatedAt: conversation.updatedAt.toISOString(),
  };
}

export async function deleteConversation(ctx: TenantContext, conversationId: string): Promise<boolean> {
  const result = await prisma.copilotConversation.deleteMany({
    where: { id: conversationId, companyId: ctx.companyId, userId: ctx.userId },
  });
  return result.count > 0;
}

export async function addUserMessage(
  ctx: TenantContext,
  conversationId: string,
  content: string,
): Promise<MessageRow> {
  const msg = await prisma.copilotMessage.create({
    data: {
      conversationId,
      role: "user",
      content,
    },
  });

  return {
    id: msg.id,
    role: msg.role as "user" | "assistant",
    content: msg.content,
    citations: msg.citations,
    followUps: msg.followUps,
    createdAt: msg.createdAt.toISOString(),
  };
}

export async function addAssistantMessage(
  conversationId: string,
  content: string,
  citations: string[],
  followUps: string[],
): Promise<MessageRow> {
  const msg = await prisma.copilotMessage.create({
    data: {
      conversationId,
      role: "assistant",
      content,
      citations,
      followUps,
    },
  });

  return {
    id: msg.id,
    role: "assistant",
    content: msg.content,
    citations: msg.citations,
    followUps: msg.followUps,
    createdAt: msg.createdAt.toISOString(),
  };
}

export async function updateConversationTitle(ctx: TenantContext, conversationId: string, title: string): Promise<void> {
  await prisma.copilotConversation.updateMany({
    where: { id: conversationId, companyId: ctx.companyId, userId: ctx.userId },
    data: { title },
  });
}


