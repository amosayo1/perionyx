import crypto from "crypto";
import type { WebhookSubscriptionConfig, WebhookDelivery, WebhookEvent, ApiVersion } from "../types";

// ──────────────────────────────────────────────────────────
// In-memory stores
// ──────────────────────────────────────────────────────────

const subscriptions = new Map<string, WebhookSubscriptionConfig>();
const deliveries = new Map<string, WebhookDelivery>();
const eventLog = new Map<string, WebhookEvent>();

// ──────────────────────────────────────────────────────────
// Subscription Management
// ──────────────────────────────────────────────────────────

export function createSubscription(config: WebhookSubscriptionConfig): WebhookSubscriptionConfig {
  subscriptions.set(config.id, config);
  return config;
}

export function getSubscription(id: string): WebhookSubscriptionConfig | undefined {
  return subscriptions.get(id);
}

export function getSubscriptionsByTenant(tenantId: string): WebhookSubscriptionConfig[] {
  return [...subscriptions.values()].filter((s) => s.tenantId === tenantId);
}

export function getSubscriptionsByEvent(event: string): WebhookSubscriptionConfig[] {
  return [...subscriptions.values()].filter(
    (s) => s.status === "active" && s.events.includes(event),
  );
}

export function updateSubscription(id: string, updates: Partial<WebhookSubscriptionConfig>): WebhookSubscriptionConfig | undefined {
  const sub = subscriptions.get(id);
  if (!sub) return undefined;
  Object.assign(sub, updates, { updatedAt: new Date() });
  return sub;
}

export function deleteSubscription(id: string): boolean {
  return subscriptions.delete(id);
}

export function pauseSubscription(id: string): boolean {
  const sub = subscriptions.get(id);
  if (!sub) return false;
  sub.status = "paused";
  sub.updatedAt = new Date();
  return true;
}

export function activateSubscription(id: string): boolean {
  const sub = subscriptions.get(id);
  if (!sub) return false;
  sub.status = "active";
  sub.updatedAt = new Date();
  return true;
}

export function getAllSubscriptions(): WebhookSubscriptionConfig[] {
  return [...subscriptions.values()];
}

export function getActiveSubscriptions(): WebhookSubscriptionConfig[] {
  return [...subscriptions.values()].filter((s) => s.status === "active");
}

// ──────────────────────────────────────────────────────────
// Event Matching & Filtering
// ──────────────────────────────────────────────────────────

export function matchSubscriptions(event: string, data?: unknown): WebhookSubscriptionConfig[] {
  return [...subscriptions.values()].filter((sub) => {
    if (sub.status !== "active") return false;
    if (!sub.events.includes(event) && !sub.events.includes("*")) return false;
    if (sub.filters && data && !evaluateFilters(sub.filters, data)) return false;
    return true;
  });
}

function evaluateFilters(filters: Record<string, unknown>, data: unknown): boolean {
  if (typeof data !== "object" || data === null) return true;

  for (const [key, value] of Object.entries(filters)) {
    const dataValue = (data as Record<string, unknown>)[key];
    if (dataValue !== value) return false;
  }
  return true;
}

// ──────────────────────────────────────────────────────────
// Delivery Management
// ──────────────────────────────────────────────────────────

export function createDelivery(delivery: WebhookDelivery): WebhookDelivery {
  deliveries.set(delivery.id, delivery);
  return delivery;
}

export function getDelivery(id: string): WebhookDelivery | undefined {
  return deliveries.get(id);
}

export function getDeliveriesBySubscription(subscriptionId: string): WebhookDelivery[] {
  return [...deliveries.values()]
    .filter((d) => d.subscriptionId === subscriptionId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getRecentDeliveries(limit = 50): WebhookDelivery[] {
  return [...deliveries.values()]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);
}

export function updateDeliveryStatus(
  id: string,
  status: WebhookDelivery["status"],
  updates?: Partial<WebhookDelivery>,
): WebhookDelivery | undefined {
  const delivery = deliveries.get(id);
  if (!delivery) return undefined;
  delivery.status = status;
  if (updates) Object.assign(delivery, updates);
  return delivery;
}

// ──────────────────────────────────────────────────────────
// Event Logging
// ──────────────────────────────────────────────────────────

export function logEvent(event: WebhookEvent): void {
  eventLog.set(event.id, event);
  if (eventLog.size > 10000) {
    const oldest = [...eventLog.keys()].slice(0, 1000);
    for (const key of oldest) eventLog.delete(key);
  }
}

export function getRecentEvents(limit = 100): WebhookEvent[] {
  return [...eventLog.values()]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

// ──────────────────────────────────────────────────────────
// Webhook Delivery Execution
// ──────────────────────────────────────────────────────────

export async function deliverWebhook(
  subscription: WebhookSubscriptionConfig,
  event: WebhookEvent,
): Promise<WebhookDelivery> {
  const deliveryId = `whd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const payload = JSON.stringify(event);

  const delivery: WebhookDelivery = {
    id: deliveryId,
    subscriptionId: subscription.id,
    event: event.type,
    payload: event,
    status: "pending",
    attempt: 0,
    maxRetries: subscription.retryConfig.maxRetries,
    scheduledAt: new Date(),
    createdAt: new Date(),
  };

  createDelivery(delivery);
  return executeDelivery(subscription, delivery, payload);
}

async function executeDelivery(
  subscription: WebhookSubscriptionConfig,
  delivery: WebhookDelivery,
  payload: string,
): Promise<WebhookDelivery> {
  const signature = generateSignature(payload, subscription.secret);
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-webhook-id": delivery.id,
    "x-webhook-event": delivery.event,
    "x-webhook-signature": signature,
    "x-webhook-timestamp": String(Math.floor(Date.now() / 1000)),
    "x-webhook-version": subscription.version,
    ...subscription.headers,
  };

  delivery.status = "delivering";
  delivery.attempt++;

  try {
    const startTime = Date.now();
    const response = await fetch(subscription.url, {
      method: "POST",
      headers,
      body: payload,
      signal: AbortSignal.timeout(10000),
    });
    delivery.durationMs = Date.now() - startTime;
    delivery.responseStatusCode = response.status;
    delivery.responseBody = await response.text().catch(() => undefined);

    if (response.status >= 200 && response.status < 300) {
      delivery.status = "delivered";
      delivery.deliveredAt = new Date();
    } else {
      delivery.status = "failed";
      delivery.error = `HTTP ${response.status}`;
      await scheduleRetry(subscription, delivery, payload);
    }
  } catch (error) {
    delivery.durationMs = 0;
    delivery.status = "failed";
    delivery.error = error instanceof Error ? error.message : "Unknown error";
    await scheduleRetry(subscription, delivery, payload);
  }

  return delivery;
}

async function scheduleRetry(
  subscription: WebhookSubscriptionConfig,
  delivery: WebhookDelivery,
  payload: string,
): Promise<void> {
  if (delivery.attempt >= subscription.retryConfig.maxRetries) {
    delivery.status = "dead-letter";
    return;
  }

  const delay = Math.min(
    subscription.retryConfig.initialDelayMs * Math.pow(subscription.retryConfig.backoffMultiplier, delivery.attempt - 1),
    subscription.retryConfig.maxDelayMs,
  );

  delivery.scheduledAt = new Date(Date.now() + delay);

  setTimeout(() => {
    executeDelivery(subscription, delivery, payload);
  }, delay);
}

// ──────────────────────────────────────────────────────────
// Webhook Health
// ──────────────────────────────────────────────────────────

export function getWebhookHealth(subscriptionId: string): {
  subscriptionId: string;
  status: string;
  totalDeliveries: number;
  successRate: number;
  lastDelivery?: WebhookDelivery;
  averageLatencyMs: number;
} {
  const sub = subscriptions.get(subscriptionId);
  if (!sub) return { subscriptionId, status: "unknown", totalDeliveries: 0, successRate: 0, averageLatencyMs: 0 };

  const subDeliveries = getDeliveriesBySubscription(subscriptionId);
  const total = subDeliveries.length;
  const successful = subDeliveries.filter((d) => d.status === "delivered").length;
  const latencies = subDeliveries.filter((d) => d.durationMs).map((d) => d.durationMs!);
  const avgLatency = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;

  return {
    subscriptionId,
    status: sub.status,
    totalDeliveries: total,
    successRate: total ? Math.round((successful / total) * 100) : 100,
    lastDelivery: subDeliveries[0],
    averageLatencyMs: avgLatency,
  };
}

// ──────────────────────────────────────────────────────────
// Signing & Verification
// ──────────────────────────────────────────────────────────

export function generateSignature(payload: string, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret).update(payload, "utf8").digest("hex");
  return `sha256=${hmac}`;
}

export function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = generateSignature(payload, secret);
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature, "utf8"), Buffer.from(expected, "utf8"));
}

// ──────────────────────────────────────────────────────────
// Dead-letter Management
// ──────────────────────────────────────────────────────────

export function getDeadLetterDeliveries(): WebhookDelivery[] {
  return [...deliveries.values()].filter((d) => d.status === "dead-letter");
}

export function retryDeadLetter(deliveryId: string): WebhookDelivery | undefined {
  const delivery = deliveries.get(deliveryId);
  if (!delivery || delivery.status !== "dead-letter") return undefined;
  const sub = subscriptions.get(delivery.subscriptionId);
  if (!sub || sub.status !== "active") return undefined;

  delivery.attempt = 0;
  delivery.status = "pending";
  delivery.error = undefined;
  delivery.scheduledAt = new Date();

  const payload = JSON.stringify(delivery.payload);
  executeDelivery(sub, delivery, payload);
  return delivery;
}

export function getWebhookStats(): {
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  deadLetterCount: number;
  averageLatencyMs: number;
} {
  const all = [...deliveries.values()];
  const successful = all.filter((d) => d.status === "delivered").length;
  const failed = all.filter((d) => d.status === "failed").length;
  const deadLetter = all.filter((d) => d.status === "dead-letter").length;
  const latencies = all.filter((d) => d.durationMs).map((d) => d.durationMs!);
  const avgLatency = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;

  return {
    totalSubscriptions: subscriptions.size,
    activeSubscriptions: getActiveSubscriptions().length,
    totalDeliveries: all.length,
    successfulDeliveries: successful,
    failedDeliveries: failed,
    deadLetterCount: deadLetter,
    averageLatencyMs: avgLatency,
  };
}

export function generateWebhookSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return `whsec_${Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")}`;
}
