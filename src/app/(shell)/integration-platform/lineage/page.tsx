import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { DataLineageViewer } from "@/components/integration-platform/data-lineage-viewer";

export default async function LineagePage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const records = await prisma.lineageRecord.findMany({
    where: { companyId: ctx.companyId },
    include: {
      instance: { select: { name: true } },
    },
    orderBy: [{ lineageDepth: "asc" }, { createdAt: "desc" }],
    take: 200,
  });

  const serialized = records.map((r) => ({
    id: r.id,
    companyId: r.companyId,
    instanceId: r.instanceId,
    sourceType: r.sourceType,
    sourceId: r.sourceId,
    targetType: r.targetType,
    targetId: r.targetId,
    parentId: r.parentId,
    lineageDepth: r.lineageDepth,
    transformation: r.transformation,
    checksum: r.checksum,
    metadata: r.metadata,
    createdAt: r.createdAt.toISOString(),
    instanceName: r.instance?.name,
  }));

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Data Lineage"
        description="Trace the origin and transformation of your financial data"
      />
      <DataLineageViewer records={serialized} onDrillDown={() => {}} />
    </PageContainer>
  );
}
