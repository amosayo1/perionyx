import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { ImportWizard } from "@/components/integration-platform/import-wizard";

export default async function ImportPage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const templates = await prisma.importTemplate.findMany({
    where: { companyId: ctx.companyId, isActive: true },
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
}
