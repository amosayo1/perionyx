import { redirect } from "next/navigation";
import { KnowledgeGraphService } from "@/modules/crm";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { Share2, Users, Building2, BarChart3, Link2 } from "lucide-react";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

const knowledgeGraphService = new KnowledgeGraphService();

export default async function KnowledgeGraphPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const [graphData, allLinks] = await Promise.all([
      knowledgeGraphService.getGraphData().catch(() => ({ nodes: [], links: [] })),
      knowledgeGraphService.list({}).catch(() => []),
    ]);
  
    const contactNodes = graphData.nodes.filter((n) => n.type === "contact");
    const companyNodes = graphData.nodes.filter((n) => n.type === "company");
    const industryNodes = graphData.nodes.filter((n) => n.type === "industry");
    const linkTypes = [...new Set(graphData.links.map((l) => l.type))];
  
    return (
      <PageContainer>
        <EnterprisePageHeader
          title="Knowledge Graph"
          description="Entity relationship network — contacts, companies, industries, and connections"
        />
  
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-cyan-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Contact Nodes</p>
                <p className="text-2xl font-bold text-white">{contactNodes.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-amber-400">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Company Nodes</p>
                <p className="text-2xl font-bold text-white">{companyNodes.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-emerald-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Industry Nodes</p>
                <p className="text-2xl font-bold text-white">{industryNodes.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-purple-400">
                <Link2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500">Connections</p>
                <p className="text-2xl font-bold text-white">{graphData.links.length}</p>
              </div>
            </div>
          </div>
        </div>
  
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">Graph Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Total Nodes</span>
                <span className="font-medium text-white">{graphData.nodes.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Total Edges</span>
                <span className="font-medium text-white">{graphData.links.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Link Types</span>
                <span className="font-medium text-white">{linkTypes.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">Total Links in DB</span>
                <span className="font-medium text-white">{allLinks.length}</span>
              </div>
            </div>
          </div>
  
          <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
            <h3 className="mb-4 text-sm font-semibold text-white">Connection Types</h3>
            {linkTypes.length > 0 ? (
              <div className="space-y-3">
                {linkTypes.map((type, i) => {
                  const count = graphData.links.filter((l) => l.type === type).length;
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm capitalize text-zinc-300">{type.replace(/-/g, " ")}</span>
                      <span className="rounded bg-white/[0.04] px-2 py-0.5 text-xs text-zinc-400">{count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No connections in the graph yet</p>
            )}
          </div>
        </div>
  
        <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Contact Network</h3>
          {contactNodes.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {contactNodes.map((node) => (
                <div key={node.id} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
                    <Users className="h-3.5 w-3.5" />
                  </div>
                  <span className="truncate text-xs text-zinc-300">{node.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No contact nodes in the knowledge graph</p>
          )}
        </div>
      </PageContainer>
    );
  });
}
