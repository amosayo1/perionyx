import { prisma } from "@/server/db/prisma";
import { WebhookService } from "@/modules/webhooks/webhooks.service";

const MAX_RETRIES = 5;
const BATCH_SIZE = 20;

export async function handleWebhookRetry(): Promise<void> {
  const now = new Date();
  const due = await prisma.webhookDelivery.findMany({
    where: {
      status: "FAILED",
      nextAttemptAt: { lte: now },
      attempts: { lt: MAX_RETRIES },
    },
    take: BATCH_SIZE,
    orderBy: { nextAttemptAt: "asc" },
  });

  for (const delivery of due) {
    try {
      const webhook = await prisma.webhook.findUnique({
        where: { id: delivery.webhookId },
      });
      if (!webhook || !webhook.active) continue;

      await WebhookService.deliver(webhook.companyId, delivery.event, delivery.payload as Record<string, unknown>);
    } catch {
      // deliver() already updates the delivery row on failure
    }
  }
}
