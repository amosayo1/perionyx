import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";

export type VersionChangeType = "CREATE" | "UPDATE" | "DELETE";

export type EntityType =
  | "Transaction"
  | "LedgerEntry"
  | "TransactionApproval"
  | "Policy"
  | "RiskIncident"
  | "TreasuryAccount";

export interface VersionRecord {
  id: string;
  companyId: string;
  entityType: string;
  entityId: string;
  version: number;
  data: Record<string, unknown>;
  changedByUserId: string | null;
  changedByName: string | null;
  changeType: VersionChangeType;
  changedFields: string[];
  previousVersionId: string | null;
  createdAt: Date;
}

export interface VersionDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changed: boolean;
}

export async function recordVersion(
  ctx: TenantContext,
  entityType: EntityType,
  entityId: string,
  data: Record<string, unknown>,
  changeType: VersionChangeType = "UPDATE",
  changedFields: string[] = [],
  changedByUserId?: string | null,
): Promise<VersionRecord> {
  const latest = await prisma.objectVersion.findFirst({
    where: { companyId: ctx.companyId, entityType, entityId },
    orderBy: { version: "desc" },
    select: { id: true, version: true },
  });

  const nextVersion = (latest?.version ?? 0) + 1;

  const record = await prisma.objectVersion.create({
    data: {
      companyId: ctx.companyId,
      entityType,
      entityId,
      version: nextVersion,
      data: data as object,
      changedByUserId: changedByUserId ?? ctx.userId,
      changeType,
      changedFields,
      previousVersionId: latest?.id ?? null,
    },
    include: { changedBy: { select: { name: true } } },
  });

  return toVersionRecord(record);
}

export async function getVersions(
  ctx: TenantContext,
  entityType: string,
  entityId: string,
): Promise<VersionRecord[]> {
  const records = await prisma.objectVersion.findMany({
    where: { companyId: ctx.companyId, entityType, entityId },
    orderBy: { version: "asc" },
    include: { changedBy: { select: { name: true } } },
  });

  return records.map(toVersionRecord);
}

export async function getVersionById(
  ctx: TenantContext,
  versionId: string,
): Promise<VersionRecord | null> {
  const record = await prisma.objectVersion.findFirst({
    where: { id: versionId, companyId: ctx.companyId },
    include: { changedBy: { select: { name: true } } },
  });

  return record ? toVersionRecord(record) : null;
}

export async function diffVersions(
  ctx: TenantContext,
  versionId1: string,
  versionId2: string,
): Promise<VersionDiff[]> {
  const [v1, v2] = await Promise.all([
    getVersionById(ctx, versionId1),
    getVersionById(ctx, versionId2),
  ]);

  if (!v1 || !v2) {
    throw new Error("One or both versions not found");
  }

  const oldData = v1.data;
  const newData = v2.data;
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
  const diffs: VersionDiff[] = [];

  for (const key of allKeys) {
    if (key === "updatedAt" || key === "createdAt") continue;
    const oldVal = oldData[key];
    const newVal = newData[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diffs.push({ field: key, oldValue: oldVal ?? null, newValue: newVal ?? null, changed: true });
    }
  }

  return diffs;
}

export const SUPPORTED_ENTITY_TYPES: { type: EntityType; label: string; description: string }[] = [
  { type: "Transaction", label: "Transactions", description: "Payment and transfer lifecycle" },
  { type: "LedgerEntry", label: "Ledger Entries", description: "Double-entry ledger postings" },
  { type: "TransactionApproval", label: "Approvals", description: "Approval workflow status changes" },
  { type: "Policy", label: "Policies", description: "Transaction policy rule changes" },
  { type: "RiskIncident", label: "Risk Incidents", description: "Security incident lifecycle" },
  { type: "TreasuryAccount", label: "Treasury Accounts", description: "Bank account configuration changes" },
];

function toVersionRecord(record: {
  id: string;
  companyId: string;
  entityType: string;
  entityId: string;
  version: number;
  data: unknown;
  changedByUserId: string | null;
  changedBy: { name: string | null } | null;
  changeType: string;
  changedFields: string[];
  previousVersionId: string | null;
  createdAt: Date;
}): VersionRecord {
  return {
    id: record.id,
    companyId: record.companyId,
    entityType: record.entityType,
    entityId: record.entityId,
    version: record.version,
    data: record.data as Record<string, unknown>,
    changedByUserId: record.changedByUserId,
    changedByName: record.changedBy?.name ?? null,
    changeType: record.changeType as VersionChangeType,
    changedFields: record.changedFields,
    previousVersionId: record.previousVersionId,
    createdAt: record.createdAt,
  };
}
