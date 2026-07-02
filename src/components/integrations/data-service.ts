import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { connectorDiscovery } from "@/modules/connector-platform/discovery";
import { connectorPlatformRegistry } from "@/modules/connector-platform/registry";
import type { ConnectorCategory } from "@/modules/connector-platform/types";
import type {
  IntegrationKpi,
  IntegrationCategory,
  ConnectedIntegration,
  ConnectionHealthGroup,
  SyncEvent,
} from "./types";

export async function getIntegrationKpis(ctx: TenantContext): Promise<IntegrationKpi[]> {
  const totalConnectors = await prisma.connectorConfig.count({
    where: { companyId: ctx.companyId },
  });

  const activeConnectors = await prisma.connectorConfig.count({
    where: { companyId: ctx.companyId, active: true },
  });

  const last24h = new Date(Date.now() - 86400000);

  const failedRuns = await prisma.connectorRun.count({
    where: {
      companyId: ctx.companyId,
      status: "FAILED",
      createdAt: { gte: last24h },
    },
  });

  const totalRuns = await prisma.connectorRun.count({
    where: {
      companyId: ctx.companyId,
      createdAt: { gte: last24h },
    },
  });

  const recentRun = await prisma.connectorRun.findFirst({
    where: { companyId: ctx.companyId },
    orderBy: { createdAt: "desc" },
    include: { connector: { select: { name: true } } },
  });

  return [
    {
      id: "connected",
      title: "Connected Systems",
      value: activeConnectors,
      trend: totalConnectors > 0 ? `${Math.round((activeConnectors / totalConnectors) * 100)}%↑` : "0%",
      status: activeConnectors > 0 ? "healthy" : "inactive",
      insight: `${totalConnectors - activeConnectors} disconnected`,
    },
    {
      id: "healthy",
      title: "Healthy Connections",
      value: activeConnectors,
      trend: "Real-time",
      status: "healthy",
    },
    {
      id: "failures",
      title: "Failed Operations",
      value: failedRuns,
      trend: totalRuns > 0 ? `${Math.round((failedRuns / totalRuns) * 100)}%↓` : "0%",
      status: failedRuns > 0 ? "warning" : "healthy",
    },
    {
      id: "sync-rate",
      title: "Sync Success Rate",
      value: totalRuns > 0 ? `${Math.round(((totalRuns - failedRuns) / totalRuns) * 100)}%` : "N/A",
      trend: "Last 24h",
      status: failedRuns === 0 ? "healthy" : failedRuns > 5 ? "critical" : "warning",
    },
    {
      id: "last-sync",
      title: "Last Sync Activity",
      value: recentRun ? new Date(recentRun.createdAt).toLocaleTimeString() : "Never",
      trend: recentRun?.connector?.name ?? "",
      status: recentRun ? "healthy" : "inactive",
    },
    {
      id: "providers",
      title: "Available Providers",
      value: connectorPlatformRegistry.getRegisteredKinds().length,
      trend: "Ready to connect",
      status: "healthy",
    },
  ];
}

export async function getIntegrationCategories(ctx: TenantContext): Promise<IntegrationCategory[]> {
  const discoveryCategories = connectorDiscovery.listCategories();
  const connectorConfigs = await prisma.connectorConfig.findMany({
    where: { companyId: ctx.companyId },
  });

  return discoveryCategories.map(({ category, count }) => {
    const connectedCount = connectorConfigs.filter(
      (c) => connectorDiscovery.getProvider(c.type as any)?.category === category,
    ).length;

    const categoryLabels: Record<ConnectorCategory, { label: string; description: string }> = {
      banking: { label: "Banking", description: "Bank accounts, transactions, statements" },
      erp: { label: "ERP", description: "Enterprise resource planning" },
      accounting: { label: "Accounting", description: "General ledger, invoices, reconciliation" },
      identity: { label: "Identity", description: "SSO, directory sync, user provisioning" },
      communication: { label: "Communication", description: "Email, Slack, Teams notifications" },
      ai: { label: "AI & Intelligence", description: "AI providers and analytics" },
      storage: { label: "Storage", description: "File storage and object storage" },
      analytics: { label: "Analytics", description: "Reporting and business intelligence" },
      payments: { label: "Payments", description: "Payment processing and settlement" },
      compliance: { label: "Compliance", description: "Regulatory compliance and screening" },
      developer: { label: "Developer", description: "Custom connectors and APIs" },
      other: { label: "Other", description: "Miscellaneous integrations" },
    };

    const info = categoryLabels[category] ?? { label: category, description: "" };

    return {
      id: category,
      label: info.label,
      description: info.description,
      providerCount: count,
      connectedCount,
      health: connectedCount > 0 ? "connected" : "available",
    };
  });
}

export async function getConnectedIntegrations(ctx: TenantContext): Promise<ConnectedIntegration[]> {
  const configs = await prisma.connectorConfig.findMany({
    where: { companyId: ctx.companyId },
    include: {
      runs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true, createdAt: true },
      },
    },
  });

  return configs.map((c) => {
    const meta = connectorDiscovery.getProvider(c.type as any);
    const lastRun = c.runs[0];

    return {
      id: c.id,
      name: c.name,
      category: meta?.category ?? "other",
      kind: c.type,
      description: meta?.description ?? "",
      status: c.active ? "connected" : "disconnected",
      version: meta?.version ?? "1.0.0",
      lastSync: lastRun?.createdAt.toISOString() ?? null,
      lastRunStatus: lastRun?.status ?? null,
      latency: null,
      config: c.config as Record<string, unknown>,
    };
  });
}

export async function getConnectionHealth(ctx: TenantContext): Promise<ConnectionHealthGroup[]> {
  const activeCount = await prisma.connectorConfig.count({
    where: { companyId: ctx.companyId, active: true },
  });

  const failed24h = await prisma.connectorRun.count({
    where: {
      companyId: ctx.companyId,
      status: "FAILED",
      createdAt: { gte: new Date(Date.now() - 86400000) },
    },
  });

  const errorConfigs = await prisma.connectorConfig.count({
    where: {
      companyId: ctx.companyId,
      active: true,
      config: { path: ["healthStatus"], equals: "CRITICAL" } as any,
    },
  });

  return [
    {
      id: "connected",
      label: "Connected",
      count: activeCount,
      color: "emerald",
      recentChange: activeCount > 0 ? `${activeCount} active` : "No connections",
    },
    {
      id: "warning",
      label: "Warning",
      count: failed24h,
      color: "amber",
      recentChange: failed24h > 0 ? `${failed24h} failures today` : "All clear",
    },
    {
      id: "error",
      label: "Critical",
      count: errorConfigs,
      color: "red",
      recentChange: errorConfigs > 0 ? `${errorConfigs} needs attention` : "None",
    },
    {
      id: "disabled",
      label: "Disconnected",
      count: Math.max(0, await prisma.connectorConfig.count({
        where: { companyId: ctx.companyId, active: false },
      })),
      color: "zinc",
      recentChange: "Inactive",
    },
  ];
}

export async function getRecentSyncActivity(ctx: TenantContext): Promise<SyncEvent[]> {
  const runs = await prisma.connectorRun.findMany({
    where: { companyId: ctx.companyId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { connector: { select: { name: true, type: true } } },
  });

  return runs.map((r) => ({
    id: r.id,
    eventType: r.status === "COMPLETED" ? "sync" : r.status === "FAILED" ? "error" : "sync",
    integrationName: r.connector.name,
    category: r.connector.type,
    description: r.event,
    status: r.status === "COMPLETED" ? "success" as const : r.status === "FAILED" ? "failed" as const : "in-progress" as const,
    timestamp: r.createdAt.toISOString(),
  }));
}
