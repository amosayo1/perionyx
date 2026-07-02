import { prisma } from "@/server/db/prisma";
import { WebhookService } from "./webhook.service";
import type { Prisma } from "@prisma/client";

export class WebhookRegistry {
  static async enqueueForCompany(companyId: string, event: string, payload: unknown) {
    // Find active webhooks subscribed to this event
    const hooks = await prisma.webhook.findMany({ where: { companyId, active: true, events: { has: event } } });
    if (!hooks || hooks.length === 0) return 0;

    const creations: Prisma.WebhookDeliveryCreateManyInput[] = hooks.map((h) => ({
      webhookId: h.id,
      companyId,
      event,
      payload: payload as Prisma.InputJsonValue,
      status: "PENDING",
    }));

    const res = await prisma.webhookDelivery.createMany({ data: creations });
    return res.count ?? creations.length;
  }

  static async notifyTransaction(companyId: string, txn: unknown) {
    // enqueue deliveries and return count
    return this.enqueueForCompany(companyId, "transaction.created", txn);
  }
}

export default WebhookRegistry;
