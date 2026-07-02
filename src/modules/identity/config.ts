import { prisma } from "@/server/db/prisma";
import type { Prisma } from "@prisma/client";
import type {
  IdentityProviderConfig,
  IdentityProviderKind,
  IdentityProviderStatus,
} from "./types";
import { identityProviderRegistry } from "./registry";
import type { IIdentityProvider } from "./provider";

export async function createProviderConfig(
  companyId: string,
  kind: IdentityProviderKind,
  label: string,
  metadata: Record<string, string> = {},
  domain?: string,
): Promise<IdentityProviderConfig> {
  const count = await prisma.identityProvider.count({ where: { companyId } });

  const record = await prisma.identityProvider.create({
    data: {
      companyId,
      kind,
      label,
      domain,
      metadata,
      priority: count,
      status: "configuring",
    },
  });

  return recordToConfig(record);
}

export async function getProviderConfigs(companyId: string): Promise<IdentityProviderConfig[]> {
  const records = await prisma.identityProvider.findMany({
    where: { companyId },
    orderBy: { priority: "asc" },
  });
  return records.map(recordToConfig);
}

export async function getProviderConfig(id: string): Promise<IdentityProviderConfig | null> {
  const record = await prisma.identityProvider.findUnique({ where: { id } });
  return record ? recordToConfig(record) : null;
}

export async function updateProviderStatus(
  id: string,
  status: IdentityProviderStatus,
): Promise<void> {
  await prisma.identityProvider.update({ where: { id }, data: { status } });
}

export async function deleteProviderConfig(id: string): Promise<void> {
  await prisma.identityProvider.delete({ where: { id } });
  identityProviderRegistry.unregisterInstance(id);
}

export async function initializeProvider(
  config: IdentityProviderConfig,
): Promise<IIdentityProvider> {
  const provider = identityProviderRegistry.createInstance(config.kind);
  await provider.initialize(config);
  identityProviderRegistry.registerInstance(config.id, provider);
  return provider;
}

function recordToConfig(record: {
  id: string;
  companyId: string;
  kind: string;
  status: string;
  label: string;
  domain: string | null;
  metadata: Prisma.JsonValue;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}): IdentityProviderConfig {
  return {
    id: record.id,
    companyId: record.companyId,
    kind: record.kind as IdentityProviderKind,
    status: record.status as IdentityProviderStatus,
    label: record.label,
    domain: record.domain ?? undefined,
    metadata: (record.metadata as Record<string, string>) ?? {},
    priority: record.priority,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
