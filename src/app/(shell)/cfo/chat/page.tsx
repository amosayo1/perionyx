import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { CFOAdvisorService } from "@/modules/cfo-advisor/cfo-advisor.service";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { ExecutiveChat } from "@/components/cfo-advisor/executive-chat";
import { MessageSquare, Plus } from "lucide-react";
import Link from "next/link";

export default async function CFOChatPage({
  searchParams,
}: {
  searchParams: Promise<{ conversationId?: string }>;
}) {
  const session = await auth();
  const ctx = requireTenantContext(
    session?.user?.id,
    session?.user?.activeCompanyId,
    session?.user?.companyRole,
  );
  if (!ctx) redirect("/sign-in");

  const params = await searchParams;
  const conversations = await CFOAdvisorService.getConversations(
    ctx,
    ctx.userId,
  ).catch(() => []);

  const selectedId = params.conversationId;
  const selectedConversation = selectedId
    ? conversations.find((c) => c.id === selectedId) ?? null
    : null;

  let messages: Array<{
    id: string;
    role: "user" | "advisor" | "system";
    content: string;
    timestamp?: string;
  }> = [];

  if (selectedId) {
    const rawMessages = await CFOAdvisorService.getConversationMessages(
      ctx,
      selectedId,
    ).catch(() => []);
    messages = rawMessages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.createdAt,
    }));
  }

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Executive Chat"
        description="Conversational CFO advisor — ask about treasury, risk, approvals, and strategy"
        actions={
          <Link
            href="/cfo/chat"
            className="inline-flex items-center gap-2 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-2 text-sm font-medium text-[#d4af37] transition-colors hover:bg-[#d4af37]/20"
          >
            <Plus className="h-4 w-4" />
            New Conversation
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-2 lg:col-span-1">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Conversations
          </h3>
          {conversations.length === 0 && (
            <div className="rounded-xl border border-white/[0.06] bg-[#101010] p-6 text-center">
              <MessageSquare className="mx-auto mb-2 h-5 w-5 text-zinc-500" />
              <p className="text-xs text-zinc-500">No conversations yet</p>
              <p className="mt-1 text-[11px] text-zinc-600">
                Start a new conversation with your advisor
              </p>
            </div>
          )}
          {conversations.map((conv) => {
            const isSelected = conv.id === selectedId;
            return (
              <Link
                key={conv.id}
                href={`/cfo/chat?conversationId=${conv.id}`}
                className={`block rounded-xl border p-3 transition-colors ${
                  isSelected
                    ? "border-[#d4af37]/30 bg-[#d4af37]/10"
                    : "border-white/[0.06] bg-[#101010] hover:bg-white/[0.04]"
                }`}
              >
                <p
                  className={`truncate text-sm font-medium ${
                    isSelected ? "text-[#d4af37]" : "text-white"
                  }`}
                >
                  {conv.title}
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-600">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </span>
                  <span
                    className={`rounded px-1 py-0 text-[10px] font-medium ${
                      conv.status === "ACTIVE"
                        ? "bg-emerald-400/10 text-emerald-400"
                        : "bg-zinc-400/10 text-zinc-500"
                    }`}
                  >
                    {conv.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="lg:col-span-3">
          {selectedConversation ? (
            <ExecutiveChat
              messages={messages}
            />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.09] bg-[#101010] py-20 text-center">
              <MessageSquare className="mb-3 h-8 w-8 text-zinc-500" />
              <p className="text-sm text-zinc-400">
                Select a conversation or start a new one
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                Your advisor can help with cash management, risk assessment,
                approvals, and strategic planning
              </p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
