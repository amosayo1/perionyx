import { notFound } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { prisma } from "@/server/db/prisma";
import { connectorDiscovery } from "@/modules/connector-platform/discovery";
import { ConnectorRunService } from "@/modules/connectors";
import { ConnectorDetailClient } from "./client";

export default async function ConnectorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

  const config = await prisma.connectorConfig.findFirst({
    where: { id, companyId: ctx.companyId },
  });
  if (!config) notFound();

  const meta = connectorDiscovery.getProvider(config.type as any);
  const kind = config.type as any;

  const runsResult = await ConnectorRunService.listRuns(ctx, { connectorId: id, limit: 20 });
  const health = await ConnectorRunService.getConnectorHealth(ctx);

  const events = await ConnectorRunService.listEvents(ctx, { connectorId: id, limit: 50 });

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
}
