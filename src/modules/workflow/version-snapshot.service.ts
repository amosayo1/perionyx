import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { NotFoundError } from "@/lib/errors/app-error";

export interface VersionEntry {
  version: number;
  snapshot: Record<string, unknown>;
  createdAt: Date;
}

export interface VersionDiff {
  added: Array<{ path: string; value: unknown }>;
  removed: Array<{ path: string; value: unknown }>;
  changed: Array<{ path: string; from: unknown; to: unknown }>;
}

export class WorkflowVersionSnapshotService {
  private static entityType = "WorkflowDefinition";

  static async captureSnapshot(ctx: TenantContext, definitionId: string): Promise<void> {
    const def = await prisma.workflowDefinition.findFirst({
      where: { id: definitionId, companyId: ctx.companyId },
    });
    if (!def) throw new NotFoundError("WorkflowDefinition");

    const previousVersion = await prisma.objectVersion.findFirst({
      where: {
        companyId: ctx.companyId,
        entityType: this.entityType,
        entityId: definitionId,
      },
      orderBy: { version: "desc" },
      select: { id: true, version: true },
    });

    const snapshot: Record<string, unknown> = {
      name: def.name,
      description: def.description,
      category: def.category,
      steps: def.steps,
      inputSchema: def.inputSchema,
      outputSchema: def.outputSchema,
      status: def.status,
      isSystem: def.isSystem,
    };

    const changedFields: string[] = [];
    if (previousVersion) {
      const prev = await prisma.objectVersion.findUnique({ where: { id: previousVersion.id } });
      if (prev) {
        const prevData = prev.data as Record<string, unknown>;
        for (const key of Object.keys(snapshot)) {
          if (JSON.stringify(prevData[key]) !== JSON.stringify(snapshot[key])) {
            changedFields.push(key);
          }
        }
      }
    }

    await prisma.objectVersion.create({
      data: {
        companyId: ctx.companyId,
        entityType: this.entityType,
        entityId: definitionId,
        version: (previousVersion?.version ?? 0) + 1,
        data: snapshot as any,
        changedByUserId: ctx.userId,
        changeType: "UPDATE",
        changedFields,
        previousVersionId: previousVersion?.id ?? null,
      },
    });
  }

  static async getVersionHistory(ctx: TenantContext, definitionId: string): Promise<VersionEntry[]> {
    const versions = await prisma.objectVersion.findMany({
      where: {
        companyId: ctx.companyId,
        entityType: this.entityType,
        entityId: definitionId,
      },
      orderBy: { version: "asc" },
      select: {
        version: true,
        data: true,
        createdAt: true,
      },
    });

    return versions.map((v) => ({
      version: v.version,
      snapshot: v.data as Record<string, unknown>,
      createdAt: v.createdAt,
    }));
  }

  static async getDiff(
    ctx: TenantContext,
    definitionId: string,
    fromVersion: number,
    toVersion: number,
  ): Promise<VersionDiff> {
    const versions = await prisma.objectVersion.findMany({
      where: {
        companyId: ctx.companyId,
        entityType: this.entityType,
        entityId: definitionId,
        version: { in: [fromVersion, toVersion] },
      },
      orderBy: { version: "asc" },
      select: { version: true, data: true },
    });

    if (versions.length < 2) {
      throw new Error(`Could not find both version ${fromVersion} and version ${toVersion}`);
    }

    const from = versions[0].data as Record<string, unknown>;
    const to = versions[1].data as Record<string, unknown>;
    const allKeys = new Set([...Object.keys(from), ...Object.keys(to)]);

    const added: VersionDiff["added"] = [];
    const removed: VersionDiff["removed"] = [];
    const changed: VersionDiff["changed"] = [];

    for (const key of allKeys) {
      const inFrom = key in from;
      const inTo = key in to;

      if (!inFrom && inTo) {
        added.push({ path: key, value: to[key] });
      } else if (inFrom && !inTo) {
        removed.push({ path: key, value: from[key] });
      } else if (
        inFrom && inTo &&
        JSON.stringify(from[key]) !== JSON.stringify(to[key])
      ) {
        changed.push({ path: key, from: from[key], to: to[key] });
      }
    }

    return { added, removed, changed };
  }
}
