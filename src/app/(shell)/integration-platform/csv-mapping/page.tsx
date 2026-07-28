import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { CsvMappingDesigner } from "@/components/integration-platform/csv-mapping-designer";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

export default async function CsvMappingPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const templates = await prisma.importTemplate.findMany({
      where: { companyId: ctx.tenant.companyId, isActive: true, sourceType: "csv" },
      orderBy: { updatedAt: "desc" },
      take: 1,
    });
  
    const template = templates[0]
      ? {
          id: templates[0].id,
          name: templates[0].name,
          sourceType: templates[0].sourceType,
          mapping: templates[0].mapping,
          isActive: templates[0].isActive,
          isShared: templates[0].isShared,
          createdBy: templates[0].createdBy,
          createdAt: templates[0].createdAt.toISOString(),
          updatedAt: templates[0].updatedAt.toISOString(),
        }
      : null;
  
    return (
      <PageContainer>
        <EnterprisePageHeader
          title="CSV Mapping Designer"
          description="Design and manage CSV import templates"
          actions={
            <button className="inline-flex items-center gap-2 rounded-lg bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 border border-amber-500/20 transition-colors hover:bg-amber-500/20">
              Create Template
            </button>
          }
        />
        <CsvMappingDesigner template={template} onSave={() => {}} onPreview={() => {}} />
      </PageContainer>
    );
  });
}
