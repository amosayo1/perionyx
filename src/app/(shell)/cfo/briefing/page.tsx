import { redirect } from "next/navigation";
import { CFOAdvisorService } from "@/modules/cfo-advisor/cfo-advisor.service";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { BriefingCard } from "@/components/cfo-advisor/briefing-card";
import {
  Briefcase,
  Wallet,
  TrendingUp,
  ShoppingCart,
  TrendingDown,
  HeartPulse,
  Shield,
  ClipboardCheck,
  Scale,
  AlertTriangle,
  Activity,
  AlertOctagon,
  Target,
  Lightbulb,
} from "lucide-react";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

export default async function CFOBriefingPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const briefing = await CFOAdvisorService.getLatestBriefing(ctx.tenant).catch(
      () => null,
    );
  
    return (
      <PageContainer>
        <EnterprisePageHeader
          title="Morning Briefing"
          description={
            briefing
              ? `${briefing.period.charAt(0).toUpperCase() + briefing.period.slice(1)} briefing — ${new Date(briefing.briefingDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`
              : "No briefing available"
          }
        />
  
        {briefing?.executiveSummary && (
          <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/10 text-[#d4af37]">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Executive Summary
                </h2>
                <p className="text-xs text-zinc-500">
                  Generated {new Date(briefing.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-zinc-300">
              {briefing.executiveSummary}
            </p>
          </div>
        )}
  
        {!briefing && (
          <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-12 text-center">
            <Briefcase className="mx-auto mb-3 h-8 w-8 text-zinc-500" />
            <p className="text-sm text-zinc-400">
              No briefing available for this period
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              Briefings are generated automatically or on demand
            </p>
          </div>
        )}
  
        {briefing && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <BriefingCard
                title="Cash Position"
                icon={<Wallet className="h-5 w-5" />}
                data={briefing.cashPosition}
              />
              <BriefingCard
                title="Liquidity"
                icon={<TrendingUp className="h-5 w-5" />}
                data={briefing.liquidity}
              />
              <BriefingCard
                title="Working Capital"
                icon={<ShoppingCart className="h-5 w-5" />}
                data={briefing.workingCapital}
              />
              <BriefingCard
                title="Revenue Trends"
                icon={<TrendingUp className="h-5 w-5" />}
                data={briefing.revenueTrends}
              />
              <BriefingCard
                title="Expense Trends"
                icon={<TrendingDown className="h-5 w-5" />}
                data={briefing.expenseTrends}
              />
              <BriefingCard
                title="Treasury Health"
                icon={<HeartPulse className="h-5 w-5" />}
                data={briefing.treasuryHealth}
              />
              <BriefingCard
                title="Financial Integrity"
                icon={<Shield className="h-5 w-5" />}
                data={briefing.financialIntegrity}
              />
              <BriefingCard
                title="Close Readiness"
                icon={<ClipboardCheck className="h-5 w-5" />}
                data={briefing.closeReadiness}
              />
              <BriefingCard
                title="Compliance Health"
                icon={<Scale className="h-5 w-5" />}
                data={briefing.complianceHealth}
              />
            </div>
  
            {briefing.operationalRisks &&
              briefing.operationalRisks.length > 0 && (
                <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-amber-400/20 bg-amber-400/10 text-amber-400">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <h2 className="text-sm font-semibold text-white">
                      Operational Risks
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {briefing.operationalRisks.map((risk, i) => {
                      const r = risk as Record<string, unknown>;
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2.5"
                        >
                          <span className="text-xs text-zinc-300">
                            {String(
                              (r.description as string) ??
                                (r.title as string) ??
                                JSON.stringify(r),
                            )}
                          </span>
                          {Boolean(r.severity) && (
                            <span
                              className={`ml-3 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                String(r.severity).toUpperCase() === "CRITICAL"
                                  ? "bg-red-400/10 text-red-400"
                                  : String(r.severity).toUpperCase() === "HIGH"
                                    ? "bg-orange-400/10 text-orange-400"
                                    : "bg-zinc-400/10 text-zinc-400"
                              }`}
                            >
                              {String(r.severity)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
  
            {briefing.significantAnomalies &&
              briefing.significantAnomalies.length > 0 && (
                <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-400/20 bg-red-400/10 text-red-400">
                      <Activity className="h-5 w-5" />
                    </div>
                    <h2 className="text-sm font-semibold text-white">
                      Significant Anomalies
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {briefing.significantAnomalies.map((anomaly, i) => {
                      const a = anomaly as Record<string, unknown>;
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2.5"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-medium text-white">
                              {String(
                              (a.metric as string) ?? "Unknown metric",
                            )}
                            </span>
                            <span className="ml-2 text-xs text-zinc-500">
                              {`Current: ${String(a.currentValue)} (mean: ${
                                typeof a.mean === "number"
                                  ? a.mean.toFixed(2)
                                  : String(a.mean)
                              })`}
                            </span>
                          </div>
                          <span
                            className={`ml-3 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                              a.direction === "spike"
                                ? "bg-red-400/10 text-red-400"
                                : "bg-amber-400/10 text-amber-400"
                            }`}
                          >
                            {a.direction === "spike" ? "↑ Spike" : "↓ Drop"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
  
            {briefing.criticalAlerts && briefing.criticalAlerts.length > 0 && (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-400/20 bg-red-400/10 text-red-400">
                    <AlertOctagon className="h-5 w-5" />
                  </div>
                  <h2 className="text-sm font-semibold text-white">
                    Critical Alerts
                  </h2>
                </div>
                <div className="space-y-2">
                  {briefing.criticalAlerts.map((alert, i) => {
                    const a = alert as Record<string, unknown>;
                    return (
                      <div
                        key={i}
                        className="rounded-lg border border-red-400/10 bg-red-400/5 px-4 py-2.5"
                      >
                        <span className="text-xs text-red-300">
                          {String(
                            (a.message as string) ??
                              (a.title as string) ??
                              JSON.stringify(a),
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
  
            {briefing.openApprovals && briefing.openApprovals.length > 0 && (
              <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/10 text-[#d4af37]">
                    <Target className="h-5 w-5" />
                  </div>
                  <h2 className="text-sm font-semibold text-white">
                    Open Approvals
                  </h2>
                </div>
                <div className="space-y-2">
                  {briefing.openApprovals.map((approval, i) => {
                    const a = approval as Record<string, unknown>;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2.5"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-medium text-white">
                            Approval
                          </span>
                          {Boolean(a.transactionId) && (
                            <span className="ml-2 text-xs text-zinc-500">
                              {String(a.transactionId)}
                            </span>
                          )}
                        </div>
                        {Boolean(a.createdAt) && (
                          <span className="ml-3 shrink-0 text-[10px] text-zinc-600">
                            {new Date(String(a.createdAt)).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
  
            {briefing.recommendedActions &&
              briefing.recommendedActions.length > 0 && (
                <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#d4af37]/20 bg-[#d4af37]/10 text-[#d4af37]">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <h2 className="text-sm font-semibold text-white">
                      Recommended Actions
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {briefing.recommendedActions.map((action, i) => {
                      const a = action as Record<string, unknown>;
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg border border-[#d4af37]/10 bg-[#d4af37]/5 px-4 py-2.5"
                        >
                          <span className="text-xs text-zinc-300">
                            {String(
                              (a.action as string) ?? JSON.stringify(a),
                            )}
                          </span>
                          {Boolean(a.priority) && (
                            <span
                              className={`ml-3 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                String(a.priority) === "CRITICAL"
                                  ? "bg-red-400/10 text-red-400"
                                  : String(a.priority) === "HIGH"
                                    ? "bg-orange-400/10 text-orange-400"
                                    : String(a.priority) === "MEDIUM"
                                      ? "bg-amber-400/10 text-amber-400"
                                      : "bg-zinc-400/10 text-zinc-400"
                              }`}
                            >
                              {String(a.priority)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
          </>
        )}
      </PageContainer>
    );
  });
}
