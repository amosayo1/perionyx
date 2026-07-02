import { WebhookService } from "@/modules/webhooks/webhooks.service";

export async function handleWebhookSend(job: { id: string; data: { companyId: string; eventType: string; payload: Record<string, unknown> } }) {
  const { companyId, eventType, payload } = job.data;
  await WebhookService.deliver(companyId, eventType, payload);
}
