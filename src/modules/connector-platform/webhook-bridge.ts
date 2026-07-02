import type { ConnectorEventPayload } from "./event-hooks";
import { connectorEventBus } from "./event-hooks";
import { WebhookService } from "@/modules/webhooks";

const eventToWebhookEventMap: Record<string, string> = {
  "connector:installed": "connector.installed",
  "connector:configured": "connector.configured",
  "connector:authenticated": "connector.authenticated",
  "connector:connected": "connector.connected",
  "connector:disconnected": "connector.disconnected",
  "connector:validated": "connector.validated",
  "connector:health-check": "connector.health_check",
  "connector:sync-started": "connector.sync_started",
  "connector:sync-completed": "connector.sync_completed",
  "connector:sync-failed": "connector.sync_failed",
  "connector:error": "connector.error",
  "connector:deleted": "connector.deleted",
};

function eventToWebhookEvent(eventType: string): string | undefined {
  return eventToWebhookEventMap[eventType];
}

async function onConnectorEvent(payload: ConnectorEventPayload): Promise<void> {
  const webhookEvent = eventToWebhookEvent(payload.eventType);
  if (!webhookEvent) return;

  try {
    await WebhookService.deliver(payload.companyId, webhookEvent, {
      connectorId: payload.connectorId,
      eventType: payload.eventType,
      timestamp: payload.timestamp,
      metadata: payload.metadata,
    });
  } catch {
    console.error(`[ConnectorWebhookBridge] Failed to deliver webhook for ${payload.eventType}`);
  }
}

export function enableConnectorWebhookBridge(): void {
  const eventTypes = Object.keys(eventToWebhookEventMap);
  for (const eventType of eventTypes) {
    connectorEventBus.subscribe(eventType as any, onConnectorEvent);
  }
}

export function disableConnectorWebhookBridge(): void {
  const eventTypes = Object.keys(eventToWebhookEventMap);
  for (const eventType of eventTypes) {
    connectorEventBus.unsubscribe(eventType as any, onConnectorEvent);
  }
}
