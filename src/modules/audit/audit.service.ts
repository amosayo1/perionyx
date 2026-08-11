import type { Prisma, PrismaClient } from "@prisma/client";
import { AuditSeverity } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import { SYSTEM_ACTOR_ID } from "@/modules/queue/jobs/job-utils";

export type DbClient = PrismaClient | Prisma.TransactionClient;

export type RecordAuditParams = {
  companyId?: string | null;
  actorUserId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  severity?: AuditSeverity;
  metadata?: Prisma.InputJsonValue | null;
  requestId?: string | null;
  payloadHash?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function recordAudit(db: DbClient, params: RecordAuditParams) {
  return db.auditLog.create({
    data: {
      companyId: params.companyId ?? undefined,
      actorUserId: params.actorUserId === SYSTEM_ACTOR_ID ? undefined : (params.actorUserId ?? undefined),
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId ?? undefined,
      severity: params.severity ?? AuditSeverity.INFO,
      metadata: params.metadata ?? undefined,
      requestId: params.requestId ?? undefined,
      payloadHash: params.payloadHash ?? undefined,
      ipAddress: params.ipAddress ?? undefined,
      userAgent: params.userAgent ?? undefined,
    },
  });
}

export type ListAuditLogsOptions = {
  take: number;
  cursor?: string;
  search?: string;
};

export async function listAuditLogsForTenant(ctx: TenantContext, opts: ListAuditLogsOptions) {
  const search = opts.search?.trim();
  const rows = await prisma.auditLog.findMany({
    where: {
      companyId: ctx.companyId,
      ...(search
        ? {
            OR: [
              { action: { contains: search, mode: "insensitive" } },
              { resourceType: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: opts.take + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
  });

  let nextCursor: string | undefined;
  if (rows.length > opts.take) {
    rows.pop();
    nextCursor = rows[rows.length - 1]?.id;
  }

  return { rows, nextCursor };
}
