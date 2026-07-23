import { redirect } from "next/navigation";
import Link from "next/link";
import { Plug, ArrowRight, HeartPulse, Clock } from "lucide-react";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { StatusChip } from "@/components/enterprise/status-chip";

export default async function ConnectorsPage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const instances = await prisma.integrationInstance.findMany({
    where: { companyId: ctx.companyId },
    include: { connectorDef: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Connectors"
        description={`${instances.length} integration instances`}
        actions={
          <Link href="/integration-platform/setup">
            <button className="inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 border border-amber-500/20 transition-colors hover:bg-amber-500/20">
              <Plug className="h-4 w-4" />
              New Integration
            </button>
          </Link>
        }
      />

      {instances.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 py-20">
          <Plug className="mb-4 h-12 w-12 text-zinc-600" />
          <h3 className="text-lg font-semibold text-white">No connectors installed</h3>
          <p className="mt-1 text-sm text-zinc-500">Browse the marketplace to install your first connector.</p>
          <Link href="/integration-platform/marketplace">
            <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 border border-amber-500/20 transition-colors hover:bg-amber-500/20">
              Browse Marketplace
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {instances.map((instance) => {
            const healthMap: Record<string, "success" | "error" | "warning" | "neutral"> = {
              healthy: "success",
              degraded: "warning",
              unhealthy: "error",
              unknown: "neutral",
            };
            return (
              <Link
                key={instance.id}
                href={`/integration-platform/${instance.id}`}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-800/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                      <Plug className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{instance.name}</p>
                      <p className="text-xs text-zinc-500">{instance.connectorDef?.name ?? instance.connectorDefId}</p>
                    </div>
                  </div>
                  <StatusChip status={healthMap[instance.healthStatus] ?? "neutral"} dotOnly />
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
                  <div className="flex items-center gap-1">
                    <HeartPulse className="h-3 w-3" />
                    <span className="capitalize">{instance.healthStatus ?? "unknown"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{instance.lastSyncAt ? new Date(instance.lastSyncAt).toLocaleDateString() : "Never synced"}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
