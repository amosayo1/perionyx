import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { SyncHistoryView } from "@/components/integration-platform/sync-history-view";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

export default async function SyncHistoryPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const history = await prisma.syncHistory.findMany({
      where: { companyId: ctx.tenant.companyId },
      include: { instance: { select: { name: true } } },
      orderBy: { startedAt: "desc" },
      take: 100,
    });
  
    const serialized = history.map((h) => ({
      id: h.id,
      instanceId: h.instanceId,
      instance: h.instance,
      syncType: h.syncType,
      status: h.status,
      startedAt: h.startedAt.toISOString(),
      completedAt: h.completedAt?.toISOString() ?? null,
      durationMs: h.durationMs,
      totalRecords: h.totalRecords,
      inserted: h.inserted,
      updated: h.updated,
      skipped: h.skipped,
      failed: h.failed,
      error: h.error,
      details: h.details,
    }));
  
    return (
      <PageContainer>
        <EnterprisePageHeader
          title="Sync History"
          description={`${history.length} total sync operations`}
        />
        <SyncHistoryView history={serialized} onRefresh={() => {}} />
      </PageContainer>
    );
  });
}
