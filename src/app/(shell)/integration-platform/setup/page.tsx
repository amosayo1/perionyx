import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { ConnectorMarketplace } from "@/components/integration-platform/connector-marketplace";

export default async function SetupPage({
  searchParams,
}: {
  searchParams: { connector?: string };
}) {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const [connectors, instances] = await Promise.all([
    prisma.integrationConnectorDef.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.integrationInstance.findMany({
      where: { companyId: ctx.companyId },
      select: { connectorDefId: true },
    }),
  ]);

  const serialized = connectors.map((c) => ({
    id: c.id,
    provider: c.provider,
    name: c.name,
    description: c.description,
    category: c.category,
    authTypes: c.authTypes as string[],
    capabilities: c.capabilities as string[],
    modules: c.supportedModules as string[],
    status: "available" as const,
    iconUrl: c.iconUrl,
    docsUrl: c.docsUrl,
    version: c.version,
  }));

  const installedIds = instances.map((i) => i.connectorDefId);
  const preselected = searchParams.connector
    ? serialized.find((c) => c.id === searchParams.connector || c.provider === searchParams.connector)
    : null;

  return (
    <PageContainer>
      <EnterprisePageHeader
        title={preselected ? `Setup ${preselected.name}` : "New Integration"}
        description="Select a connector to set up a new integration instance"
      />
      <ConnectorMarketplace
        connectors={serialized}
        onSelect={() => {}}
        installedIds={installedIds}
      />
    </PageContainer>
  );
}
