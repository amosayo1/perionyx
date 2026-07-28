import { redirect } from "next/navigation";
import Link from "next/link";
import { DecisionEngine } from "@/modules/agent-framework";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { DecisionListClient } from "@/components/agent-framework/decision-list-client";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

interface DecisionsPageProps {
  searchParams: Promise<{
    status?: string;
    impact?: string;
    risk?: string;
    agentId?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function AgentDecisionsPage({ searchParams }: DecisionsPageProps) {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const params = await searchParams;
  
    const query = {
      status: params.status as "PENDING" | "APPROVED" | "REJECTED" | "EXECUTED" | "EXPIRED" | "CANCELLED" | undefined,
      impact: params.impact as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | undefined,
      risk: params.risk as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | undefined,
      agentId: params.agentId,
      search: params.search,
      page: params.page ? parseInt(params.page, 10) : 1,
    };
  
    const result = await DecisionEngine.list(ctx.tenant, query);
    const { decisions, total, page } = result;
  
    const serializedDecisions = decisions.map((d: Record<string, unknown>) => ({
      id: d.id as string,
      agentId: d.agentId as string,
      agentName: ((d.agent as Record<string, unknown>)?.name as string) ?? "Unknown",
      agentRole: ((d.agent as Record<string, unknown>)?.role as string) ?? "unknown",
      title: d.title as string,
      recommendation: d.recommendation as string,
      confidence: typeof d.confidence === "number" ? d.confidence : Number(d.confidence ?? 0),
      impact: d.impact as string,
      risk: d.risk as string,
      status: d.status as string,
      approvedBy: (d.approvedBy as string) ?? null,
      approvedAt: (d.approvedAt as string) ?? null,
      executedAt: (d.executedAt as string) ?? null,
      createdAt: d.createdAt as string,
    }));
  
    return (
      <PageContainer>
        <EnterprisePageHeader
          title="Agent Decisions"
          description={`${total} decision${total !== 1 ? "s" : ""} — track, approve, and review AI-generated decisions`}
        />
  
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-zinc-500">Status:</span>
          {["", "PENDING", "APPROVED", "REJECTED", "EXECUTED", "EXPIRED", "CANCELLED"].map((s) => {
            const isActive = s === (params.status ?? "");
            const href = new URLSearchParams(params as Record<string, string>);
            if (s) { href.set("status", s); } else { href.delete("status"); }
            return (
              <Link
                key={s}
                href={`/agents/decisions?${href.toString()}`}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#d4af37]/10 text-[#d4af37] ring-1 ring-[#d4af37]/20"
                    : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                {s || "All"}
              </Link>
            );
          })}
        </div>
  
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-zinc-500">Impact:</span>
          {["", "LOW", "MEDIUM", "HIGH", "CRITICAL"].map((i) => {
            const isActive = i === (params.impact ?? "");
            const href = new URLSearchParams(params as Record<string, string>);
            if (i) { href.set("impact", i); } else { href.delete("impact"); }
            return (
              <Link
                key={i}
                href={`/agents/decisions?${href.toString()}`}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-white/[0.08] text-white ring-1 ring-white/[0.12]"
                    : "bg-white/[0.04] text-zinc-500 hover:bg-white/[0.08] hover:text-zinc-300"
                }`}
              >
                {i || "All"}
              </Link>
            );
          })}
        </div>
  
        <DecisionListClient decisions={serializedDecisions} page={page} total={total} />
      </PageContainer>
    );
  });
}
