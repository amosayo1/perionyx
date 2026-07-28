import { notFound } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { connectorDiscovery } from "@/modules/connector-platform/discovery";
import { ConnectorRunService } from "@/modules/connectors";
import { ConnectorDetailClient } from "./client";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

export default async function ConnectorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(await headers(), async (ctx) => {
    const { id } = await params;
  
    const config = await prisma.connectorConfig.findFirst({
      where: { id, companyId: ctx.tenant.companyId },
    });
    if (!config) notFound();
  
    const meta = connectorDiscovery.getProvider(config.type as any);
    const kind = config.type as any;
  
    const runsResult = await ConnectorRunService.listRuns(ctx.tenant, { connectorId: id, limit: 20 });
    const health = await ConnectorRunService.getConnectorHealth(ctx.tenant);
  
    const events = await ConnectorRunService.listEvents(ctx.tenant, { connectorId: id, limit: 50 });
  
    return (
      <ConnectorDetailClient
        config={{
          id: config.id,
          companyId: config.companyId,
          name: config.name,
          kind: config.type as any,
          status: (config.config as any)?.status ?? "configuring",
          authMethod: (config.config as any)?.authMethod ?? "none",
          capabilities: meta?.capabilities ?? [],
          config: config.config as Record<string, unknown>,
          active: config.active,
          healthStatus: (config.config as any)?.healthStatus,
          lastHealthCheckAt: (config.config as any)?.lastHealthCheckAt,
          lastSyncAt: (config.config as any)?.lastSyncAt,
          errorMessage: (config.config as any)?.errorMessage,
          createdAt: config.createdAt.toISOString(),
          updatedAt: config.updatedAt.toISOString(),
        }}
        provider={meta ?? undefined}
        runs={runsResult.items}
        events={events}
        health={health}
      />
    );
  });
}
