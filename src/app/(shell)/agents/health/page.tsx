import { redirect } from "next/navigation";
import Link from "next/link";
import { AgentRegistry } from "@/modules/agent-framework";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { HealthPulseCard } from "@/components/agent-framework/health-pulse-card";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

export default async function AgentHealthPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const { agents } = await AgentRegistry.list(ctx.tenant, { enabled: true });
  
    const agentsWithHealth = await Promise.all(
      agents.map(async (agent) => {
        const full = await AgentRegistry.get(ctx.tenant, agent.id).catch(() => null);
        const latestCheck = full?.healthChecks?.[0] ?? null;
        const healthStatus = latestCheck?.status?.toLowerCase() ?? "unknown";
        return {
          id: agent.id,
          name: agent.name,
          role: agent.role,
          status: agent.status,
          healthStatus: healthStatus as "healthy" | "degraded" | "unhealthy" | "unknown",
          message: latestCheck?.message ?? null,
          checkedAt: latestCheck?.checkedAt ?? null,
          metrics: latestCheck?.metrics as Record<string, unknown> | null,
          checkType: latestCheck?.checkType ?? null,
          recentChecks: (full?.healthChecks ?? []).slice(0, 5).map((h) => ({
            status: h.status.toLowerCase() as "healthy" | "degraded" | "unhealthy" | "unknown",
            message: h.message,
            checkType: h.checkType,
            checkedAt: h.checkedAt,
          })),
        };
      }),
    );
  
    const healthy = agentsWithHealth.filter((a) => a.healthStatus === "healthy").length;
    const degraded = agentsWithHealth.filter((a) => a.healthStatus === "degraded").length;
    const unhealthy = agentsWithHealth.filter((a) => a.healthStatus === "unhealthy").length;
  
    return (
      <PageContainer>
        <EnterprisePageHeader
          title="Agent Health"
          description={`${agentsWithHealth.length} active agents — ${healthy} healthy, ${degraded} degraded, ${unhealthy} unhealthy`}
        />
  
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-xs text-emerald-400">Healthy</p>
            <p className="mt-1 text-2xl font-bold text-emerald-400">{healthy}</p>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="text-xs text-amber-400">Degraded</p>
            <p className="mt-1 text-2xl font-bold text-amber-400">{degraded}</p>
          </div>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-xs text-red-400">Unhealthy</p>
            <p className="mt-1 text-2xl font-bold text-red-400">{unhealthy}</p>
          </div>
        </div>
  
        <div className="space-y-3">
          {agentsWithHealth.map((agent) => (
            <HealthPulseCard key={agent.id} agent={agent} />
          ))}
          {agentsWithHealth.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.09] bg-[#101010] py-16 text-center">
              <p className="text-sm text-zinc-400">No active agents to monitor</p>
              <Link href="/agents/registry" className="mt-3 text-xs text-[#d4af37] hover:underline">
                Register an agent
              </Link>
            </div>
          )}
        </div>
      </PageContainer>
    );
  });
}
