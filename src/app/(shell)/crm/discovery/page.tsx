import { redirect } from "next/navigation";
import { ProductDiscoveryService } from "@/modules/crm";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { Search, CheckCircle2, Clock, Lightbulb, ArrowRight } from "lucide-react";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

const discoveryService = new ProductDiscoveryService();

export default async function DiscoveryPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const [sessions, workflowInsights, automationOpps] = await Promise.all([
      discoveryService.list({}).catch(() => []),
      discoveryService.getWorkflowInsights().catch(() => []),
      discoveryService.getAutomationOpportunities().catch(() => []),
    ]);
  
    const pendingFollowUp = sessions.filter((s) => s.followUpRequired).length;
  
    return (
      <PageContainer>
        <EnterprisePageHeader
          title="Product Discovery"
          description="Discovery sessions, workflow insights, and automation opportunities"
        />
  
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-purple-400">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Sessions</p>
                <p className="text-2xl font-bold text-white">{sessions.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Pending Follow-up</p>
                <p className="text-2xl font-bold text-white">{pendingFollowUp}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-emerald-400">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Workflow Insights</p>
                <p className="text-2xl font-bold text-white">{workflowInsights.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-cyan-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Auto. Opportunities</p>
                <p className="text-2xl font-bold text-white">{automationOpps.length}</p>
              </div>
            </div>
          </div>
        </div>
  
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">Workflow Insights</h3>
            {workflowInsights.length > 0 ? (
              <div className="space-y-3">
                {workflowInsights.slice(0, 10).map((wi, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">{wi.insight}</span>
                    <span className="rounded bg-white/[0.04] px-2 py-0.5 text-xs text-zinc-400">{wi.count}x</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No workflow insights captured yet</p>
            )}
          </div>
  
          <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">Automation Opportunities</h3>
            {automationOpps.length > 0 ? (
              <div className="space-y-3">
                {automationOpps.slice(0, 10).map((ao, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">{ao.opportunity}</span>
                    <span className="rounded bg-white/[0.04] px-2 py-0.5 text-xs text-zinc-400">{ao.count}x</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No automation opportunities identified yet</p>
            )}
          </div>
        </div>
  
        {sessions.length > 0 && (
          <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">Recent Sessions</h3>
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {session.discoveryStage && (
                          <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] text-purple-400 capitalize">
                            {session.discoveryStage.replace(/-/g, " ")}
                          </span>
                        )}
                        {session.followUpRequired && (
                          <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-400">
                            Follow-up needed
                          </span>
                        )}
                      </div>
                      {session.keyLearnings.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {session.keyLearnings.slice(0, 3).map((kl, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-zinc-400">
                              <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-zinc-600" />
                              {kl}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    );
  });
}
