import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";
import type { WorkflowLogData } from "./types";

export class WorkflowAuditService {
  static async getAuditTrail(ctx: TenantContext, workflowId: string): Promise<WorkflowLogData[]> {
    const rows = await prisma.workflowLog.findMany({
      where: { companyId: ctx.companyId, workflowId },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
    return rows.map((l) => ({
      id: l.id, companyId: l.companyId, executionId: l.executionId,
      workflowId: l.workflowId, level: l.level as WorkflowLogData["level"],
      message: l.message, metadata: l.metadata as Record<string, unknown> | undefined,
      createdAt: l.createdAt.toISOString(),
    }));
  }

  static async recordAudit(ctx: TenantContext, data: {
    executionId: string; workflowId: string; level: string;
    message: string; metadata?: Record<string, unknown>;
  }): Promise<void> {
    await prisma.workflowLog.create({
      data: {
        companyId: ctx.companyId,
        executionId: data.executionId,
        workflowId: data.workflowId,
        level: data.level,
        message: data.message,
        metadata: data.metadata as never ?? undefined,
      },
    });
  }
}
