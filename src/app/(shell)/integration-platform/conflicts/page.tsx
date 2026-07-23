import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { ConflictResolutionCenter } from "@/components/integration-platform/conflict-resolution-center";

export default async function ConflictsPage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const conflicts = await prisma.conflictRecord.findMany({
    where: { companyId: ctx.companyId },
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
}
