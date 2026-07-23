import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { AgentService } from "@/modules/agent-framework";
import { AgentRegistry } from "@/modules/agent-framework";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { AgentMetricCard } from "@/components/agent-framework/agent-metric-card";
import { AgentCard } from "@/components/agent-framework/agent-card";
import { Bot, Activity, CheckCircle, AlertCircle, Clock, Users, Shield, BarChart3, HeartPulse, GitBranch } from "lucide-react";

export default async function AgentDashboardPage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const [dashboard, agents] = await Promise.all([
    AgentService.getCompanyAgentDashboard(ctx).catch(() => null),
    AgentRegistry.list(ctx, {}).catch(() => ({ agents: [] })),
  ]);

  const stats = dashboard?.stats;

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Agent Dashboard"
        description="AI agent fleet overview — performance, health, and activity at a glance"
        actions={
          <Link
            href="/agents/registry"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
          >
            <Bot className="h-4 w-4" />
            Manage Agents
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <AgentMetricCard label="Total Agents" value={stats?.totalAgents ?? 0} icon={<Bot className="h-5 w-5" />} />
        <AgentMetricCard label="Active" value={stats?.activeAgents ?? 0} icon={<Activity className="h-5 w-5" />} active />
        <AgentMetricCard label="Tasks Pending" value={stats?.tasksPending ?? 0} icon={<Clock className="h-5 w-5" />} />
        <AgentMetricCard label="Tasks Completed" value={stats?.tasksCompleted ?? 0} icon={<CheckCircle className="h-5 w-5" />} />
        <AgentMetricCard label="Tasks Failed" value={stats?.tasksFailed ?? 0} icon={<AlertCircle className="h-5 w-5" />} />
        <AgentMetricCard label="Decisions Pending" value={stats?.decisionsPending ?? 0} icon={<GitBranch className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Active Agents</h2>
            <Link href="/agents/registry" className="text-xs text-[#d4af37] hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {agents.agents.slice(0, 9).map((agent) => (
              <AgentCard key={agent.id} agent={{ id: agent.id, name: agent.name, role: agent.role, status: agent.status, version: agent.version }} />
            ))}
            {agents.agents.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-white/[0.09] bg-[#101010] py-12 text-center">
                <Bot className="mb-3 h-8 w-8 text-zinc-500" />
                <p className="text-sm text-zinc-400">No agents registered yet</p>
                <Link href="/agents/registry" className="mt-3 text-xs text-[#d4af37] hover:underline">
                  Register your first agent
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Quick Links</h3>
            <div className="space-y-2">
              {[
                { href: "/agents/registry", label: "Agent Registry", icon: Bot },
                { href: "/agents/health", label: "Agent Health", icon: HeartPulse },
                { href: "/agents/decisions", label: "Decisions", icon: GitBranch },
                { href: "/agents/memory", label: "Memory Store", icon: BarChart3 },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-white"
                >
                  <link.icon className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {stats?.healthSummary && (
            <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-4">
              <h3 className="mb-3 text-sm font-semibold text-white">Health Summary</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Healthy
                  </span>
                  <span className="text-white">{stats.healthSummary.healthy}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Degraded
                  </span>
                  <span className="text-white">{stats.healthSummary.degraded}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-red-400">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    Unhealthy
                  </span>
                  <span className="text-white">{stats.healthSummary.unhealthy}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-zinc-500">
                    <span className="h-2 w-2 rounded-full bg-zinc-500" />
                    Unknown
                  </span>
                  <span className="text-white">{stats.healthSummary.unknown}</span>
                </div>
              </div>
            </div>
          )}

          {dashboard?.governance && (
            <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-4">
              <h3 className="mb-3 text-sm font-semibold text-white">Governance</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Permissions</span>
                  <span className="text-white">{dashboard.governance.totalPermissions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Configurations</span>
                  <span className="text-white">{dashboard.governance.totalConfigurations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Recent Violations</span>
                  <span className={dashboard.governance.recentViolations > 0 ? "text-red-400" : "text-white"}>
                    {dashboard.governance.recentViolations}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
