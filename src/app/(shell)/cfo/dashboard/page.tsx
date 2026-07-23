import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { CFOAdvisorService } from "@/modules/cfo-advisor/cfo-advisor.service";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { MetricCard } from "@/components/enterprise/metric-card";
import { BriefingCard } from "@/components/cfo-advisor/briefing-card";
import { PriorityList } from "@/components/cfo-advisor/priority-list";
import { RecommendationCard } from "@/components/cfo-advisor/recommendation-card";
import { InsightFeed } from "@/components/cfo-advisor/insight-feed";
import { ScenarioCard } from "@/components/cfo-advisor/scenario-card";
import {
  LayoutDashboard,
  Briefcase,
  Target,
  Lightbulb,
  Shield,
  TrendingUp,
  Wallet,
  AlertTriangle,
  GitBranch,
  BarChart3,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

export default async function CFODashboardPage() {
  const session = await auth();
  const ctx = requireTenantContext(
    session?.user?.id,
    session?.user?.activeCompanyId,
    session?.user?.companyRole,
  );
  if (!ctx) redirect("/sign-in");

  const dashboard = await CFOAdvisorService.getDashboardData(ctx).catch(
    () => null,
  );

  const briefing = dashboard?.briefing;
  const cashTotal =
    (briefing?.cashPosition as Record<string, unknown>)?.totalCash as
      | number
      | undefined;
  const healthScore =
    (briefing?.complianceHealth as Record<string, unknown>)
      ?.healthScore as number | undefined;
  const pendingApprovals = briefing?.openApprovals?.length ?? 0;
  const anomalies = briefing?.significantAnomalies?.length ?? 0;
  const criticalAlerts = briefing?.criticalAlerts?.length ?? 0;

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="CFO Dashboard"
        description="Executive workspace — briefings, priorities, recommendations, and scenario planning"
        actions={
          <Link
            href="/cfo/briefing"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
          >
            <Briefcase className="h-4 w-4" />
            Morning Briefing
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <MetricCard
          label="Cash Position"
          value={cashTotal != null ? `$${cashTotal.toLocaleString()}` : "—"}
          icon={<Wallet className="h-5 w-5" />}
          color="gold"
        />
        <MetricCard
          label="Compliance Score"
          value={healthScore != null ? `${healthScore}/100` : "—"}
          icon={<Shield className="h-5 w-5" />}
          color={healthScore != null && healthScore >= 70 ? "emerald" : "red"}
        />
        <MetricCard
          label="Open Approvals"
          value={pendingApprovals}
          icon={<Target className="h-5 w-5" />}
          color={pendingApprovals > 0 ? "amber" : "emerald"}
        />
        <MetricCard
          label="Active Recommendations"
          value={dashboard?.recommendations?.length ?? 0}
          icon={<Lightbulb className="h-5 w-5" />}
          color="blue"
        />
        <MetricCard
          label="Pending Decisions"
          value={dashboard?.decisions?.length ?? 0}
          icon={<GitBranch className="h-5 w-5" />}
          color="purple"
        />
        <MetricCard
          label="Anomalies Detected"
          value={anomalies}
          icon={<AlertTriangle className="h-5 w-5" />}
          color={anomalies > 0 ? "red" : "emerald"}
        />
      </div>

      {briefing?.executiveSummary && (
        <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/10 text-[#d4af37]">
              <Briefcase className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-semibold text-white">
              Morning Briefing
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-zinc-400">
            {briefing.executiveSummary}
          </p>
          <Link
            href="/cfo/briefing"
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#d4af37] hover:underline"
          >
            View full briefing
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Top Priorities
              </h2>
              <span className="text-xs text-zinc-500">
                {dashboard?.priorities?.length ?? 0} open
              </span>
            </div>
            <div className="mt-3">
              <PriorityList
                priorities={(dashboard?.priorities ?? []).map((p) => ({
                  id: p.id,
                  title: p.title,
                  description: p.description,
                  urgency: p.urgency.toLowerCase() as
                    | "critical"
                    | "high"
                    | "medium"
                    | "low",
                  dueDate: p.dueDate ?? undefined,
                  status: p.status.toLowerCase().replace("_", "-") as
                    | "pending"
                    | "in_progress"
                    | "completed"
                    | "deferred",
                }))}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Recommendations
              </h2>
              <span className="text-xs text-zinc-500">
                {dashboard?.recommendations?.length ?? 0} pending
              </span>
            </div>
            <div className="mt-3 space-y-4">
              {(dashboard?.recommendations ?? []).slice(0, 4).map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={{
                    id: rec.id,
                    title: rec.title,
                    category: rec.category,
                    summary: rec.executiveSummary,
                    businessReason: rec.businessReason,
                    confidence: Math.round(rec.confidence * 100),
                    riskLevel: rec.riskLevel.toLowerCase() as
                      | "low"
                      | "medium"
                      | "high"
                      | "critical",
                    requiredApprovals: rec.requiredApprovals,
                  }}
                />
              ))}
              {(dashboard?.recommendations ?? []).length === 0 && (
                <div className="rounded-xl border border-white/[0.06] bg-[#101010] p-8 text-center">
                  <Lightbulb className="mx-auto mb-2 h-5 w-5 text-zinc-500" />
                  <p className="text-xs text-zinc-500">
                    No pending recommendations
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-sm font-semibold text-white">
              Financial Health
            </h2>
            <div className="space-y-4">
              <BriefingCard
                title="Cash Position"
                icon={<Wallet className="h-5 w-5" />}
                data={
                  (briefing?.cashPosition as Record<string, unknown>) ?? {}
                }
              />
              {briefing?.liquidity && Object.keys(briefing.liquidity).length > 0 && (
                <BriefingCard
                  title="Liquidity"
                  icon={<TrendingUp className="h-5 w-5" />}
                  data={briefing.liquidity}
                />
              )}
            </div>
          </div>

          {briefing?.significantAnomalies &&
            briefing.significantAnomalies.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-semibold text-white">
                  Strategic Risks
                </h2>
                <div className="rounded-2xl border border-red-400/20 bg-[#101010] p-4">
                  <div className="space-y-2">
                    {briefing.significantAnomalies
                      .slice(0, 5)
                      .map((anomaly, i) => {
                        const a = anomaly as Record<string, unknown>;
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between"
                          >
                            <span className="text-xs text-zinc-400">
                              {(a.metric as string) ?? "Unknown"}
                            </span>
                            <span
                              className={`text-xs font-medium ${
                                a.direction === "spike"
                                  ? "text-red-400"
                                  : "text-amber-400"
                              }`}
                            >
                              {(a.direction as string) ?? "deviation"} (
                              {typeof a.deviation === "number"
                                ? a.deviation.toFixed(1)
                                : "—"}
                              σ)
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

          <div>
            <h2 className="mb-3 text-sm font-semibold text-white">
              Pending Decisions
            </h2>
            <div className="space-y-2">
              {(dashboard?.decisions ?? []).slice(0, 5).map((decision) => (
                <div
                  key={decision.id}
                  className="rounded-xl border border-white/[0.06] bg-[#101010] p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate text-xs font-medium text-white">
                      {decision.title}
                    </span>
                    <span
                      className={`ml-2 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        decision.riskLevel === "CRITICAL"
                          ? "bg-red-400/10 text-red-400"
                          : decision.riskLevel === "HIGH"
                            ? "bg-orange-400/10 text-orange-400"
                            : "bg-zinc-400/10 text-zinc-400"
                      }`}
                    >
                      {decision.riskLevel}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-zinc-500">
                    {decision.description}
                  </p>
                </div>
              ))}
              {(dashboard?.decisions ?? []).length === 0 && (
                <div className="rounded-xl border border-white/[0.06] bg-[#101010] p-6 text-center">
                  <GitBranch className="mx-auto mb-2 h-5 w-5 text-zinc-500" />
                  <p className="text-xs text-zinc-500">No pending decisions</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h2 className="mb-3 text-sm font-semibold text-white">
                Insights
              </h2>
              <span className="text-xs text-zinc-500">
                {dashboard?.insights?.length ?? 0} unread
              </span>
            </div>
            <InsightFeed
              insights={(dashboard?.insights ?? []).map((insight) => ({
                id: insight.id,
                type: insight.severity.toLowerCase() as
                  | "info"
                  | "warning"
                  | "critical"
                  | "success",
                title: insight.title,
                message: insight.description,
                timestamp: insight.createdAt,
                acknowledged: insight.acknowledged,
              }))}
            />
          </div>

          {dashboard?.scenarios && dashboard.scenarios.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-white">
                Recent Scenarios
              </h2>
              <div className="space-y-3">
                {dashboard.scenarios.slice(0, 3).map((scenario) => (
                  <ScenarioCard
                    key={scenario.id}
                    scenario={{
                      name: scenario.name,
                      type: scenario.scenarioType,
                      status: scenario.status.toLowerCase() as
                        | "idle"
                        | "running"
                        | "completed"
                        | "failed",
                      results: scenario.results.summary
                        ? { summary: scenario.results.summary as string }
                        : undefined,
                    }}
                  />
                ))}
              </div>
              <Link
                href="/cfo/scenarios"
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#d4af37] hover:underline"
              >
                View all scenarios
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Quick Links</h3>
            <div className="space-y-2">
              {[
                { href: "/cfo/briefing", label: "Morning Briefing", icon: Briefcase },
                { href: "/cfo/chat", label: "Executive Chat", icon: MessageSquare },
                { href: "/cfo/scenarios", label: "Scenario Planner", icon: BarChart3 },
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

          {dashboard?.conversationCount != null &&
            dashboard.conversationCount > 0 && (
              <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-4">
                <h3 className="mb-2 text-sm font-semibold text-white">
                  Conversation History
                </h3>
                <p className="text-xs text-zinc-500">
                  {dashboard.conversationCount} active conversation
                  {dashboard.conversationCount !== 1 ? "s" : ""}
                </p>
                <Link
                  href="/cfo/chat"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs text-[#d4af37] hover:underline"
                >
                  Open chat
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
        </div>
      </div>
    </PageContainer>
  );
}
