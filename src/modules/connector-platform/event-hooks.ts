import type { ConnectorEventType } from "./types";

export interface ConnectorEventPayload {
  eventType: ConnectorEventType;
  connectorId: string;
  companyId: string;
  timestamp: string;
  actorUserId?: string;
  metadata?: Record<string, unknown>;
}

type ConnectorEventHandler = (payload: ConnectorEventPayload) => Promise<void>;

class ConnectorEventBus {
  private handlers = new Map<ConnectorEventType, Set<ConnectorEventHandler>>();

  subscribe(eventType: ConnectorEventType, handler: ConnectorEventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  unsubscribe(eventType: ConnectorEventType, handler: ConnectorEventHandler): void {
    this.handlers.get(eventType)?.delete(handler);
  }

  async publish(payload: ConnectorEventPayload): Promise<void> {
    const handlers = this.handlers.get(payload.eventType);
    if (!handlers || handlers.size === 0) return;

    const results = Array.from(handlers).map((handler) =>
      handler(payload).catch((err) => {
        console.error(`[ConnectorEventBus] Handler failed for ${payload.eventType}:`, err);
      }),
    );
    await Promise.all(results);
  }

  clearSubscriptions(): void {
    this.handlers.clear();
  }
}

export const connectorEventBus = new ConnectorEventBus();
