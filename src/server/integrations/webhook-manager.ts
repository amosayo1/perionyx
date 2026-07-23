import crypto from "crypto";
import { withRetry } from "./retry-manager";
import { recordWebhookDelivery } from "./metrics";
import type {
  WebhookConfig,
  WebhookDelivery,
  IntegrationEvent,
  EventType,
} from "./types";

const webhooks = new Map<string, WebhookConfig>();
const companyWebhooks = new Map<string, Set<string>>();
const deliveries = new Map<string, WebhookDelivery>();
const webhookDeliveries = new Map<string, Set<string>>();

export function registerWebhook(
  companyId: string,
  url: string,
  events: EventType[],
  secret: string,
): WebhookConfig {
  const webhook: WebhookConfig = {
    id: crypto.randomUUID(),
    companyId,
    url,
    secret,
    events,
    active: true,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  webhooks.set(webhook.id, webhook);

  if (!companyWebhooks.has(companyId)) {
    companyWebhooks.set(companyId, new Set());
  }
  companyWebhooks.get(companyId)!.add(webhook.id);

  return webhook;
}

export function updateWebhook(
  webhookId: string,
  updates: Partial<Omit<WebhookConfig, "id" | "companyId" | "createdAt">>,
): WebhookConfig {
  const webhook = webhooks.get(webhookId);
  if (!webhook) {
    throw new Error(`Webhook ${webhookId} not found`);
  }

  Object.assign(webhook, updates, {
    updatedAt: new Date(),
    version: webhook.version + 1,
  });
  webhooks.set(webhookId, webhook);

  return webhook;
}

export function deleteWebhook(webhookId: string): void {
  const webhook = webhooks.get(webhookId);
  if (webhook) {
    webhooks.delete(webhookId);
    companyWebhooks.get(webhook.companyId)?.delete(webhookId);
    webhookDeliveries.delete(webhookId);
  }
}

export async function deliverEvent(event: IntegrationEvent): Promise<WebhookDelivery[]> {
  const matchingWebhooks = Array.from(webhooks.values()).filter(
    (w) =>
      w.active &&
      w.companyId === event.companyId &&
      w.events.includes(event.type),
  );

  if (matchingWebhooks.length === 0) return [];

  const results: WebhookDelivery[] = [];

  for (const webhook of matchingWebhooks) {
    const delivery = await executeDelivery(webhook, event);
    results.push(delivery);
  }

  return results;
}

export function getDeliveryHistory(webhookId: string, limit = 50): WebhookDelivery[] {
  const ids = webhookDeliveries.get(webhookId) ?? new Set();
  return Array.from(ids)
    .map((id) => deliveries.get(id))
    .filter((d): d is WebhookDelivery => d !== undefined)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

export function getWebhookStatus(
  webhookId: string,
): { webhook: WebhookConfig; totalDeliveries: number; successRate: number; lastDeliveryAt: Date | null } {
  const webhook = webhooks.get(webhookId);
  if (!webhook) {
    throw new Error(`Webhook ${webhookId} not found`);
  }

  const allDeliveries = getDeliveryHistory(webhookId, 1000);
  const total = allDeliveries.length;
  const successCount = allDeliveries.filter((d) => d.status === "delivered").length;
  const lastDelivery = allDeliveries.length > 0 ? allDeliveries[0].deliveredAt ?? null : null;

  return {
    webhook,
    totalDeliveries: total,
    successRate: total > 0 ? successCount / total : 1,
    lastDeliveryAt: lastDelivery,
  };
}

export function verifySignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  if (signature.length !== expected.length) return false;

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function replayEvent(deliveryId: string): Promise<WebhookDelivery | null> {
  const delivery = deliveries.get(deliveryId);
  if (!delivery) return null;

  const webhook = webhooks.get(delivery.webhookId);
  if (!webhook) return null;

  const event = JSON.parse(delivery.payload) as IntegrationEvent;
  const result = await executeDelivery(webhook, event);
  return result;
}

async function executeDelivery(
  webhook: WebhookConfig,
  event: IntegrationEvent,
): Promise<WebhookDelivery> {
  const payload = JSON.stringify(event);
  const signature = crypto
    .createHmac("sha256", webhook.secret)
    .update(payload)
    .digest("hex");

  const startTime = Date.now();
  const delivery: WebhookDelivery = {
    id: crypto.randomUUID(),
    webhookId: webhook.id,
    eventId: event.id,
    url: webhook.url,
    status: "pending",
    attempt: 1,
    maxAttempts: 3,
    payload,
    createdAt: new Date(),
  };

  trackDelivery(delivery);

  try {
    await withRetry(
      async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        try {
          const response = await fetch(webhook.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Webhook-Signature": signature,
              "X-Webhook-Event": event.type,
              "X-Webhook-Delivery": delivery.id,
            },
            body: payload,
            signal: controller.signal,
          });

          delivery.statusCode = response.status;
          if (response.ok) {
            delivery.status = "delivered";
            delivery.deliveredAt = new Date();
            delivery.response = await response.text();
          } else {
            delivery.status = "failed";
            delivery.error = `HTTP ${response.status}`;
            delivery.response = await response.text();
            throw new Error(`HTTP ${response.status}`);
          }
        } finally {
          clearTimeout(timeout);
        }
      },
      { maxAttempts: delivery.maxAttempts, baseDelay: 1000, maxDelay: 10000 },
    );
  } catch (error) {
    if (delivery.status !== "delivered") {
      delivery.status = "failed";
      delivery.error = error instanceof Error ? error.message : "Delivery failed";
      delivery.attempt = delivery.maxAttempts;
    }
  }

  const duration = Date.now() - startTime;
  deliveries.set(delivery.id, delivery);
  recordWebhookDelivery(webhook.id, delivery.status === "delivered" ? "delivered" : "failed", duration);

  return delivery;
}

function trackDelivery(delivery: WebhookDelivery): void {
  deliveries.set(delivery.id, delivery);
  if (!webhookDeliveries.has(delivery.webhookId)) {
    webhookDeliveries.set(delivery.webhookId, new Set());
  }
  webhookDeliveries.get(delivery.webhookId)!.add(delivery.id);
}

export function getWebhook(webhookId: string): WebhookConfig | undefined {
  return webhooks.get(webhookId);
}

export function getWebhooksByCompany(companyId: string): WebhookConfig[] {
  const ids = companyWebhooks.get(companyId) ?? new Set();
  return Array.from(ids)
    .map((id) => webhooks.get(id))
    .filter((w): w is WebhookConfig => w !== undefined);
}

export function getAllWebhooks(): WebhookConfig[] {
  return Array.from(webhooks.values());
}
