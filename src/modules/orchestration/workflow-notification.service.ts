import { prisma } from "@/server/db/prisma";
import type { TenantContext } from "@/server/context/tenant-context";

export class WorkflowNotificationService {
  static async notify(ctx: TenantContext, workflowId: string, triggerOn: string): Promise<void> {
    const configs = await prisma.workflowNotification.findMany({
      where: { companyId: ctx.companyId, workflowId, triggerOn, isActive: true },
    });

    for (const _config of configs) {
      // Notification delivery deferred to notification service
    }
  }
}
