import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { VoiceOfCustomerService } from "@/modules/crm";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { MessageSquare, CheckCircle2, Clock, TrendingUp, ArrowRight } from "lucide-react";

const vocService = new VoiceOfCustomerService();

export default async function VoiceOfCustomerPage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const [insights, topFeatures] = await Promise.all([
    vocService.getAllInsights({}).catch(() => []),
    vocService.getTopFeatureRequests(10).catch(() => []),
  ]);

  const completed = insights.filter((i) => i.interviewStatus === "completed").length;
  const featureRequests = insights.filter((i) => i.featureRequest).length;

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Voice of Customer"
        description="Customer insights, interview findings, and feature request intelligence"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-[#c9a84c]">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Total Insights</p>
              <p className="text-2xl font-bold text-white">{insights.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Completed</p>
              <p className="text-2xl font-bold text-white">{completed}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-amber-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Feature Requests</p>
              <p className="text-2xl font-bold text-white">{featureRequests}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-cyan-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Scheduled</p>
              <p className="text-2xl font-bold text-white">{insights.filter((i) => i.interviewStatus === "scheduled").length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Top Feature Requests</h3>
          {topFeatures.length > 0 ? (
            <div className="space-y-3">
              {topFeatures.map((feat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-300">{feat.feature}</span>
                  <span className="rounded bg-white/[0.04] px-2 py-0.5 text-xs text-zinc-400">{feat.count}x</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No feature requests recorded yet</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Recent Insights</h3>
          {insights.length > 0 ? (
            <div className="space-y-3">
              {insights.slice(0, 5).map((insight) => (
                <div key={insight.id} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs text-zinc-400 line-clamp-2">{insight.painPoint || insight.quote || insight.featureRequest || "No details"}</p>
                    <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-zinc-600" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {insight.interviewType && (
                      <span className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-zinc-500 capitalize">
                        {insight.interviewType.replace(/-/g, " ")}
                      </span>
                    )}
                    {insight.interviewStatus && (
                      <span className={`rounded px-1.5 py-0.5 text-[10px] capitalize ${
                        insight.interviewStatus === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                        insight.interviewStatus === "scheduled" ? "bg-amber-500/10 text-amber-400" :
                        "bg-zinc-500/10 text-zinc-400"
                      }`}>
                        {insight.interviewStatus}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No insights recorded yet</p>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
