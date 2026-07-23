import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { SyncHistoryView } from "@/components/integration-platform/sync-history-view";

export default async function SyncHistoryPage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const history = await prisma.syncHistory.findMany({
    where: { companyId: ctx.companyId },
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
}
