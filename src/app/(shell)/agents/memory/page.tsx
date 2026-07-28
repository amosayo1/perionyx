import { redirect } from "next/navigation";
import Link from "next/link";
import { AgentMemory, AgentRegistry } from "@/modules/agent-framework";
import type { AgentMemoryEntry } from "@/modules/agent-framework";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { MemoryExplorer } from "@/components/agent-framework/memory-explorer";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

interface MemoryPageProps {
  searchParams: Promise<{
    agentId?: string;
    memoryType?: string;
    category?: string;
  }>;
}

export default async function AgentMemoryPage({ searchParams }: MemoryPageProps) {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const params = await searchParams;
    const targetAgentId = params.agentId;
  
    const { agents } = await AgentRegistry.list(ctx.tenant, {});
    const agentOptions = agents.map((a) => ({ id: a.id, name: a.name, role: a.role }));
  
    let entries: Array<{
      id: string;
      agentId: string;
      memoryType: string;
      category: string;
      key: string;
      value: unknown;
      importance: number;
      accessCount: number;
      lastAccessedAt: string | null;
      expiresAt: string | null;
      createdAt: string;
    }> = [];
    let byType: Record<string, number> = {};
  
    if (targetAgentId) {
      const agentExists = agents.some((a) => a.id === targetAgentId);
      if (agentExists) {
        const memories = await AgentMemory.search(ctx.tenant, targetAgentId, {
          memoryType: params.memoryType as "short_term" | "long_term" | "user_preference" | "conversation" | "recommendation" | undefined,
          category: params.category,
        });
        entries = memories.map((m: AgentMemoryEntry) => ({
          id: m.id,
          agentId: m.agentId,
          memoryType: m.memoryType,
          category: m.category,
          key: m.key,
          value: m.value,
          importance: m.importance,
          accessCount: m.accessCount,
          lastAccessedAt: m.lastAccessedAt,
          expiresAt: m.expiresAt,
          createdAt: m.createdAt,
        }));
  
        const counts: Record<string, number> = {};
        for (const m of memories) {
          const type = m.memoryType;
          counts[type] = (counts[type] ?? 0) + 1;
        }
        byType = counts;
      }
    }
  
    return (
      <PageContainer>
        <EnterprisePageHeader
          title="Agent Memory"
          description="Browse and explore agent memory by type, agent, and category"
        />
  
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-zinc-500">Agent:</span>
          <Link
            href="/agents/memory"
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !targetAgentId
                ? "bg-[#d4af37]/10 text-[#d4af37] ring-1 ring-[#d4af37]/20"
                : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
            }`}
          >
            All
          </Link>
          {agentOptions.map((a) => (
            <Link
              key={a.id}
              href={`/agents/memory?agentId=${a.id}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                targetAgentId === a.id
                  ? "bg-[#d4af37]/10 text-[#d4af37] ring-1 ring-[#d4af37]/20"
                  : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {a.name}
            </Link>
          ))}
        </div>
  
        {targetAgentId && Object.keys(byType).length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {Object.entries(byType).map(([type, count]) => (
              <div
                key={type}
                className="rounded-xl border border-white/[0.09] bg-[#101010] p-3 text-center"
              >
                <p className="text-xs text-zinc-500">{type.replace("_", " ")}</p>
                <p className="mt-1 text-lg font-bold text-white">{count}</p>
              </div>
            ))}
          </div>
        )}
  
        {targetAgentId ? (
          <MemoryExplorer
            entries={entries}
            agentId={targetAgentId}
            memoryType={params.memoryType ?? null}
            category={params.category ?? null}
          />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.09] bg-[#101010] py-16 text-center">
            <p className="text-sm text-zinc-400">Select an agent to browse its memory</p>
            <p className="mt-1 text-xs text-zinc-500">
              Memory entries include short-term, long-term, user preferences, conversations, and recommendations
            </p>
          </div>
        )}
      </PageContainer>
    );
  });
}
