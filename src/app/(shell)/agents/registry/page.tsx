import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { AgentRegistry } from "@/modules/agent-framework";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { AgentListTable } from "@/components/agent-framework/agent-list-table";
import { Plus, Filter } from "lucide-react";

interface RegistryPageProps {
  searchParams: Promise<{
    status?: string;
    role?: string;
    search?: string;
    page?: string;
    limit?: string;
  }>;
}

export default async function AgentRegistryPage({ searchParams }: RegistryPageProps) {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const params = await searchParams;

  const query = {
    status: params.status ? (params.status as "ACTIVE" | "PAUSED" | "DRAFT" | "DISABLED" | "ERROR") : undefined,
    role: params.role ? (params.role as "cfo_advisor" | "treasury_specialist" | "controller" | "audit" | "compliance" | "fp_and_a" | "custom") : undefined,
    search: params.search,
    page: params.page ? parseInt(params.page, 10) : 1,
    limit: params.limit ? parseInt(params.limit, 10) : 20,
  };

  const { agents, total, page, limit } = await AgentRegistry.list(ctx, query);

  const totalPages = Math.ceil(total / limit);

  const tableAgents = agents.map((a) => ({
    id: a.id,
    name: a.name,
    role: a.role,
    status: a.status,
    lastActiveAt: a.updatedAt,
  }));

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Agent Registry"
        description={`${total} agent${total !== 1 ? "s" : ""} registered`}
        actions={
          <Link
            href="/agents/registry?new=true"
            className="inline-flex items-center gap-2 rounded-xl bg-[#d4af37] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#d4af37]/90"
          >
            <Plus className="h-4 w-4" />
            New Agent
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Filter className="h-3.5 w-3.5" />
          Filter:
        </div>
        {["", "ACTIVE", "PAUSED", "DRAFT", "DISABLED", "ERROR"].map((s) => {
          const isActive = s === (params.status ?? "");
          return (
            <Link
              key={s}
              href={s ? `/agents/registry?status=${s}` : "/agents/registry"}
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
        <span className="text-xs text-zinc-500">Role:</span>
        {["", "cfo_advisor", "treasury_specialist", "controller", "audit", "compliance", "fp_and_a", "custom"].map((r) => {
          const isActive = r === (params.role ?? "");
          return (
            <Link
              key={r}
              href={r ? `/agents/registry?role=${r}` : "/agents/registry"}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-white/[0.08] text-white ring-1 ring-white/[0.12]"
                  : "bg-white/[0.04] text-zinc-500 hover:bg-white/[0.08] hover:text-zinc-300"
              }`}
            >
              {r || "All"}
            </Link>
          );
        })}
      </div>

      <AgentListTable agents={tableAgents} />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const isActive = p === page;
            const href = new URLSearchParams(params as Record<string, string>);
            href.set("page", String(p));
            return (
              <Link
                key={p}
                href={`/agents/registry?${href.toString()}`}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[#d4af37]/10 text-[#d4af37]"
                    : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
