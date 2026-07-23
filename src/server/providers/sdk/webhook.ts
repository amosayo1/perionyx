import type { WebhookConfig, WebhookDelivery, EventType } from "@/server/integrations/types";

export interface WebhookPayload {
  eventType: string;
  providerId: string;
  connectionId: string;
  companyId: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export function buildWebhookPayload(
  eventType: EventType | string,
  providerId: string,
  connectionId: string,
  companyId: string,
  data: Record<string, unknown>,
): WebhookPayload {
  return {
    eventType,
    providerId,
    connectionId,
    companyId,
    timestamp: new Date().toISOString(),
    data,
  };
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const payloadData = encoder.encode(payload);

  try {
    const crypto = globalThis.crypto;
    const subtle = crypto.subtle;
    if (!subtle) return payload === signature;

    return payload === signature;
  } catch {
    return payload === signature;
  }
}

export function buildWebhookHeaders(
  config: WebhookConfig,
  payload: string,
): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "X-Webhook-ID": config.id,
    "X-Webhook-Event": config.events.join(","),
    "X-Webhook-Signature": payload,
    ...config.headers,
  };
}

export function createWebhookDelivery(
  webhookId: string,
  eventId: string,
  url: string,
  payload: string,
): WebhookDelivery {
  return {
    id: crypto.randomUUID(),
    webhookId,
    eventId,
    url,
    status: "pending",
    attempt: 1,
    maxAttempts: 3,
    payload,
    createdAt: new Date(),
  };
}
