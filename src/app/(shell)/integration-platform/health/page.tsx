import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { HealthDashboard } from "@/components/integration-platform/health-dashboard";

export default async function HealthPage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const [instances, healthRecords] = await Promise.all([
    prisma.integrationInstance.findMany({
      where: { companyId: ctx.companyId },
      include: { connectorDef: true },
      orderBy: { name: "asc" },
    }),
    prisma.integrationHealth.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { checkedAt: "desc" },
      take: 500,
    }),
  ]);

  const serializedInstances = instances.map((i) => ({
    id: i.id,
    name: i.name,
    connectorDefId: i.connectorDefId,
    connectorDef: i.connectorDef ? { name: i.connectorDef.name } : undefined,
    healthStatus: i.healthStatus,
    lastSyncAt: i.lastSyncAt?.toISOString() ?? null,
    lastHealthCheckAt: i.lastHealthCheckAt?.toISOString() ?? null,
    error: i.error,
    status: i.status,
  }));

  const serializedHealth = healthRecords.map((h) => ({
    id: h.id,
    instanceId: h.instanceId,
    status: h.status,
    responseTimeMs: h.responseTimeMs,
    error: h.error,
    diagnostics: h.diagnostics,
    checkedAt: h.checkedAt.toISOString(),
  }));

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Health Dashboard"
        description="Monitor the health and status of all integration instances"
      />
      <HealthDashboard instances={serializedInstances} healthRecords={serializedHealth} />
    </PageContainer>
  );
}
