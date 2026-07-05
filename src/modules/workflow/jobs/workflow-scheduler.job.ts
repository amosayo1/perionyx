import { prisma } from "@/server/db/prisma";
import { enqueue } from "@/modules/queue/queue.service";
import { logger } from "@/lib/logger";

export async function handleWorkflowScheduler() {
  const now = new Date();

  const pending = await prisma.workflowInstance.findMany({
    where: {
      status: "PENDING",
      scheduledFor: { lte: now },
    },
    take: 50,
  });

  for (const instance of pending) {
    try {
      await enqueue("workflow-execute", {
        instanceId: instance.id,
        companyId: instance.companyId,
        userId: instance.initiatedById ?? "system",
      });
    } catch (err) {
      logger.error(err, `[WorkflowScheduler] Failed to enqueue instance ${instance.id}`);
    }
  }

  const timedOut = await prisma.workflowInstance.findMany({
    where: {
      status: "WAITING",
      updatedAt: { lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    take: 50,
  });

  for (const instance of timedOut) {
    try {
      await prisma.workflowInstance.update({
        where: { id: instance.id },
        data: { status: "FAILED", failedAt: new Date(), lastError: "Timed out waiting for approval/input (7 days)" },
      });
      await prisma.workflowEvent.create({
        data: {
          instanceId: instance.id,
          companyId: instance.companyId,
          eventType: "TIMEOUT",
          label: "Workflow timed out",
          description: "Waited more than 7 days for approval or input",
          timestamp: new Date(),
        },
      });
    } catch (err) {
      logger.error(err, `[WorkflowScheduler] Failed to timeout instance ${instance.id}`);
    }
  }

  return { processed: pending.length, timedOut: timedOut.length };
}

export async function handleWorkflowTimeoutCheck() {
  return handleWorkflowScheduler();
}

export async function registerWorkflowCronJobs() {
  const { scheduleCron, registerHandler } = await import("@/modules/queue/queue.service");

  registerHandler("workflow-scheduler", async (job) => {
    await handleWorkflowScheduler();
  });

  registerHandler("workflow-timeout-check", async (job) => {
    await handleWorkflowTimeoutCheck();
  });

  await scheduleCron("workflow-scheduler", "*/5 * * * *");
  await scheduleCron("workflow-timeout-check", "0 */6 * * *");
}
