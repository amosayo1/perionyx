import { notFound, redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { IntegrationSettings } from "@/components/integration-platform/integration-settings";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  if (!searchParams.id) {
    const instances = await prisma.integrationInstance.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { name: "asc" },
    });

    return (
      <PageContainer size="narrow">
        <EnterprisePageHeader
          title="Integration Settings"
          description="Select an instance to configure"
        />
        {instances.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 py-20">
            <p className="text-sm text-zinc-500">No integration instances found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {instances.map((inst) => (
              <a
                key={inst.id}
                href={`/integration-platform/settings?id=${inst.id}`}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700"
              >
                <div>
                  <p className="text-sm font-medium text-white">{inst.name}</p>
                  <p className="text-xs text-zinc-500">{inst.connectorDefId}</p>
                </div>
                <span className="text-xs text-zinc-400">{inst.status}</span>
              </a>
            ))}
          </div>
        )}
      </PageContainer>
    );
  }

  const instance = await prisma.integrationInstance.findFirst({
    where: { id: searchParams.id, companyId: ctx.companyId },
    include: {
      connectorDef: true,
      credentials: {
        select: { id: true, key: true, expiresAt: true, rotatedAt: true, version: true },
      },
    },
  });

  if (!instance) return notFound();

  const serialized = {
    id: instance.id,
    name: instance.name,
    status: instance.status,
    healthStatus: instance.healthStatus,
    authMethod: instance.authMethod,
    isActive: instance.isActive,
    lastSyncAt: instance.lastSyncAt?.toISOString() ?? null,
    error: instance.error,
    version: String(instance.version),
    connectorDef: instance.connectorDef ? { name: instance.connectorDef.name } : undefined,
    credentials: instance.credentials.map((c) => ({
      id: c.id,
      key: c.key,
      expiresAt: c.expiresAt?.toISOString() ?? null,
      rotatedAt: c.rotatedAt?.toISOString() ?? null,
      version: c.version,
    })),
    createdAt: instance.createdAt.toISOString(),
    updatedAt: instance.updatedAt.toISOString(),
  };

  return (
    <PageContainer size="narrow">
      <EnterprisePageHeader
        title="Integration Settings"
        description={`Configure ${instance.name}`}
        actions={
          <a
            href={`/integration-platform/${instance.id}`}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            View Details
          </a>
        }
      />
      <IntegrationSettings instance={serialized} onUpdate={() => {}} onDelete={() => {}} />
    </PageContainer>
  );
}
