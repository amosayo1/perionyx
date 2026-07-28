import { redirect } from "next/navigation";
import Link from "next/link";
import { RelationshipIntelligenceService } from "@/modules/crm";
import { PainPointService } from "@/modules/crm";
import { VoiceOfCustomerService } from "@/modules/crm";
import { ProductDiscoveryService } from "@/modules/crm";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { AgentMetricCard } from "@/components/agent-framework/agent-metric-card";
import { Users, MessageSquare, AlertTriangle, Search, Share2, BarChart3, Activity, Bot } from "lucide-react";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

const riService = new RelationshipIntelligenceService();
const painPointService = new PainPointService();
const vocService = new VoiceOfCustomerService();
const discoveryService = new ProductDiscoveryService();

const FEATURE_TILES = [
  { href: "/crm/contacts", icon: Users, label: "Contacts", desc: "Relationship intelligence and contact profiles", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { href: "/crm/voice-of-customer", icon: MessageSquare, label: "Voice of Customer", desc: "Insights, interviews, and feature requests", color: "text-[#c9a84c] bg-gold-500/10 border-gold-500/20" },
  { href: "/crm/pain-points", icon: AlertTriangle, label: "Pain Points", desc: "Tracked challenges across industries and roles", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  { href: "/crm/discovery", icon: Search, label: "Product Discovery", desc: "Discovery sessions, learnings, and automation opportunities", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { href: "/crm/knowledge-graph", icon: Share2, label: "Knowledge Graph", desc: "Entity relationships and network visualization", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  { href: "/crm/analytics", icon: BarChart3, label: "Analytics", desc: "Relationship metrics, trends, and funnel analysis", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
];

export default async function CrmDashboardPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const [analytics, painPoints, vocInsights, discoverySessions] = await Promise.all([
      riService.getRelationshipAnalytics(ctx.tenant.companyId).catch(() => null),
      painPointService.list({}).catch(() => []),
      vocService.getAllInsights({}).catch(() => []),
      discoveryService.list({}).catch(() => []),
    ]);
  
    const totalPainPoints = painPoints.length;
    const totalVocInsights = vocInsights.length;
    const totalDiscoverySessions = discoverySessions.length;
    const pendingFollowUp = discoverySessions.filter((s) => s.followUpRequired).length;
  
    return (
      <PageContainer>
        <EnterprisePageHeader
          title="Enterprise Relationship Intelligence"
          description="CRM dashboard — contacts, insights, pain points, and discovery activity"
          actions={
            <Link
              href="/crm/contacts"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
            >
              <Users className="h-4 w-4" />
              View Contacts
            </Link>
          }
        />
  
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AgentMetricCard label="Total Contacts" value={analytics?.totalContacts ?? 0} icon={<Users className="h-5 w-5" />} />
          <AgentMetricCard label="Active Discovery Sessions" value={totalDiscoverySessions} icon={<Activity className="h-5 w-5" />} active />
          <AgentMetricCard label="VoC Insights" value={totalVocInsights} icon={<MessageSquare className="h-5 w-5" />} />
          <AgentMetricCard label="Pain Points Tracked" value={totalPainPoints} icon={<AlertTriangle className="h-5 w-5" />} />
        </div>
  
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <h2 className="mb-3 text-sm font-semibold text-white">Feature Areas</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {FEATURE_TILES.map((tile) => (
                <Link key={tile.href} href={tile.href}>
                  <div
                    className={`group rounded-2xl border border-white/[0.09] bg-[#101010] p-5 transition-all hover:border-white/[0.15] hover:bg-white/[0.03] ${tile.color.split(" ").slice(0, 1).join(" ")}`}
                  >
                    <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg border ${tile.color}`}>
                      <tile.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-white/90">{tile.label}</h3>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-400">{tile.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
  
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-4">
              <h3 className="mb-3 text-sm font-semibold text-white">Quick Links</h3>
              <div className="space-y-2">
                {[
                  { href: "/crm/contacts", label: "Contacts", icon: Users },
                  { href: "/crm/voice-of-customer", label: "Voice of Customer", icon: MessageSquare },
                  { href: "/crm/pain-points", label: "Pain Points", icon: AlertTriangle },
                  { href: "/crm/discovery", label: "Product Discovery", icon: Search },
                  { href: "/crm/knowledge-graph", label: "Knowledge Graph", icon: Share2 },
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
  
            {analytics && (
              <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-4">
                <h3 className="mb-3 text-sm font-semibold text-white">Relationship Funnel</h3>
                <div className="space-y-2">
                  {Object.entries(analytics.byStage).slice(0, 5).map(([stage, count]) => (
                    <div key={stage} className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 capitalize">{stage.replace(/-/g, " ")}</span>
                      <span className="text-white">{count}</span>
                    </div>
                  ))}
                  {analytics.byHealth && (
                    <>
                      <div className="my-2 border-t border-white/[0.06]" />
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          Healthy
                        </span>
                        <span className="text-white">{analytics.byHealth.healthy ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-amber-400">
                          <span className="h-2 w-2 rounded-full bg-amber-400" />
                          Needs Attention
                        </span>
                        <span className="text-white">{analytics.byHealth["needs-attention"] ?? 0}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
  
            <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-4">
              <h3 className="mb-3 text-sm font-semibold text-white">Discovery Status</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Total Sessions</span>
                  <span className="text-white">{totalDiscoverySessions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Pending Follow-up</span>
                  <span className={pendingFollowUp > 0 ? "text-amber-400" : "text-white"}>
                    {pendingFollowUp}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">VoC Insights</span>
                  <span className="text-white">{totalVocInsights}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Pain Points</span>
                  <span className="text-white">{totalPainPoints}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  });
}
