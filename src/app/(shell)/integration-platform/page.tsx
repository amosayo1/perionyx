import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag, Plug, Upload, FileSpreadsheet, Activity, HeartPulse,
  GitBranch, GitMerge, ShieldCheck, Settings, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { IntegrationDashboard } from "@/components/integration-platform/integration-dashboard";

const QUICK_ACTIONS = [
  { href: "/integration-platform/marketplace", icon: ShoppingBag, label: "Marketplace", desc: "Browse and install connectors", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { href: "/integration-platform/connectors", icon: Plug, label: "Connectors", desc: "Manage installed instances", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { href: "/integration-platform/import", icon: Upload, label: "Import", desc: "Import financial data", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { href: "/integration-platform/csv-mapping", icon: FileSpreadsheet, label: "CSV Mapping", desc: "Design import templates", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { href: "/integration-platform/sync-history", icon: Activity, label: "Sync History", desc: "View sync operations", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  { href: "/integration-platform/health", icon: HeartPulse, label: "Health", desc: "Monitor integration health", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  { href: "/integration-platform/lineage", icon: GitBranch, label: "Data Lineage", desc: "Trace data origins", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  { href: "/integration-platform/conflicts", icon: GitMerge, label: "Conflicts", desc: "Resolve data conflicts", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  { href: "/integration-platform/validation", icon: ShieldCheck, label: "Validation", desc: "Review validation issues", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  { href: "/integration-platform/settings", icon: Settings, label: "Settings", desc: "Configure integrations", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" },
];

export default async function IntegrationPlatformPage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const [instances, syncHistory, healthRecords] = await Promise.all([
    (await prisma.integrationInstance.findMany({
      where: { companyId: ctx.companyId },
      include: { connectorDef: true },
      orderBy: { updatedAt: "desc" },
    })) as any,
    (await prisma.syncHistory.findMany({
      where: { companyId: ctx.companyId },
      include: { instance: { select: { name: true } } },
      orderBy: { startedAt: "desc" },
      take: 10,
    })) as any,
    prisma.integrationHealth.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { checkedAt: "desc" },
    }),
  ]);

  const health = {
    total: instances.length,
    healthy: instances.filter((i: any) => i.healthStatus === "healthy").length,
    degraded: instances.filter((i: any) => i.healthStatus === "degraded").length,
    unhealthy: instances.filter((i: any) => i.healthStatus === "unhealthy" || i.healthStatus === "error").length,
    unknown: instances.filter((i: any) => i.healthStatus === "unknown" || !i.healthStatus).length,
    byCategory: {},
  };

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Integration Platform"
        description="Connect, sync, and manage your enterprise integrations"
        actions={
          <div className="flex items-center gap-3">
            <Link href="/integration-platform/marketplace">
              <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800">
                <ShoppingBag className="h-4 w-4" />
                Marketplace
              </button>
            </Link>
            <Link href="/integration-platform/setup">
              <button className="inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 border border-amber-500/20 transition-colors hover:bg-amber-500/20">
                <Plug className="h-4 w-4" />
                New Integration
              </button>
            </Link>
          </div>
        }
      />

      <IntegrationDashboard instances={instances} health={health} syncHistory={syncHistory} />

      <div>
        <h2 className="mb-4 text-sm font-semibold text-white">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <div className="flex flex-col items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-center transition-all hover:border-zinc-700 hover:bg-zinc-800/50">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", action.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-white">{action.label}</p>
                  <p className="text-xs text-zinc-500 leading-tight">{action.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
