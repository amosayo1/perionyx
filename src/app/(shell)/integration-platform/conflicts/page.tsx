import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { ConflictResolutionCenter } from "@/components/integration-platform/conflict-resolution-center";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

export default async function ConflictsPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const conflicts = await prisma.conflictRecord.findMany({
      where: { companyId: ctx.tenant.companyId },
      include: { instance: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  
    const serialized = conflicts.map((c) => ({
      id: c.id,
      companyId: c.companyId,
      instanceId: c.instanceId,
      entityType: c.entityType,
      entityId: c.entityId,
      localValue: c.localValue,
      remoteValue: c.remoteValue,
      resolution: c.resolution,
      resolvedBy: c.resolvedBy,
      resolvedAt: c.resolvedAt?.toISOString() ?? null,
      status: c.status,
      instanceName: c.instance?.name,
    }));
  
    return (
      <PageContainer>
        <EnterprisePageHeader
          title="Conflict Resolution"
          description={`${conflicts.filter((c) => c.status === "open").length} unresolved conflicts`}
        />
        <ConflictResolutionCenter conflicts={serialized} onResolve={() => {}} onBulkResolve={() => {}} />
      </PageContainer>
    );
  });
}
