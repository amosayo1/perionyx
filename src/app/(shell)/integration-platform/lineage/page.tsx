import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { DataLineageViewer } from "@/components/integration-platform/data-lineage-viewer";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

export default async function LineagePage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const records = await prisma.lineageRecord.findMany({
      where: { companyId: ctx.tenant.companyId },
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
  });
}
