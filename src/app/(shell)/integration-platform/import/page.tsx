import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { ImportWizard } from "@/components/integration-platform/import-wizard";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

export default async function ImportPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const templates = await prisma.importTemplate.findMany({
      where: { companyId: ctx.tenant.companyId, isActive: true },
      orderBy: { name: "asc" },
    });
  
    const serialized = templates.map((t) => ({
      id: t.id,
      name: t.name,
      sourceType: t.sourceType,
      mapping: t.mapping,
      isActive: t.isActive,
      isShared: t.isShared,
      createdBy: t.createdBy,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));
  
    return (
      <PageContainer size="narrow">
        <EnterprisePageHeader
          title="Import Data"
          description="Upload and map financial data from external sources"
        />
        <ImportWizard onImport={async () => ({ imported: 0, errors: [] })} onCancel={() => {}} templates={serialized} />
      </PageContainer>
    );
  });
}
