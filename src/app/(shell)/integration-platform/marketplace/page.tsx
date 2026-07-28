import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { ConnectorMarketplace } from "@/components/integration-platform/connector-marketplace";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

export default async function MarketplacePage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const [connectors, instances] = await Promise.all([
      prisma.integrationConnectorDef.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
      prisma.integrationInstance.findMany({
        where: { companyId: ctx.tenant.companyId },
        select: { connectorDefId: true },
      }),
    ]);
  
    const installedIds = instances.map((i) => i.connectorDefId);
  
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
  
    return (
      <PageContainer>
        <EnterprisePageHeader
          title="Connector Marketplace"
          description="Browse and install integrations for your enterprise"
        />
        <ConnectorMarketplace
          connectors={serialized}
          onSelect={() => {}}
          installedIds={installedIds}
        />
      </PageContainer>
    );
  });
}
