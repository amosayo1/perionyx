import { prisma } from '@/server/db/prisma';
import { WebhookService } from './webhook.service';
import { incWebhookDelivery, incWebhookDeliveryAttempt } from '@/modules/metrics/metrics';

export const MAX_ATTEMPTS = 5;

export async function processPendingDeliveries(limit = 20) {
  const now = new Date();
  const deliveries = await prisma.webhookDelivery.findMany({
    where: {
      status: 'PENDING',
      OR: [
        { nextAttemptAt: null },
        { nextAttemptAt: { lte: now } },
      ],
    },
    include: { webhook: true },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });

  for (const d of deliveries) {
    try {
      await prisma.webhookDelivery.update({ where: { id: d.id }, data: { attempts: { increment: 1 } } });
      incWebhookDeliveryAttempt();
      await WebhookService.send(d.webhook.url, d.event, d.payload, d.id);
      await prisma.webhookDelivery.update({ where: { id: d.id }, data: { status: 'DELIVERED', updatedAt: new Date() } });
      incWebhookDelivery('DELIVERED');
    } catch (err: any) {
      const attempts = d.attempts + 1;
      if (attempts >= MAX_ATTEMPTS) {
        await prisma.webhookDelivery.update({ where: { id: d.id }, data: { status: 'FAILED', lastError: String(err?.message ?? err), attempts } });
        incWebhookDelivery('FAILED');
      } else {
        const backoffMs = Math.min(60 * 60 * 1000, Math.pow(2, attempts) * 1000);
        const nextAttempt = new Date(Date.now() + backoffMs);
        await prisma.webhookDelivery.update({ where: { id: d.id }, data: { status: 'PENDING', lastError: String(err?.message ?? err), nextAttemptAt: nextAttempt, attempts } });
        incWebhookDelivery('RETRY');
      }
    }
  }

  return deliveries.length;
}

export default processPendingDeliveries;
