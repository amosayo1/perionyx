export type EnterpriseEventType =
  | "payment:approved"
  | "payment:failed"
  | "reconciliation:completed"
  | "reconciliation:exception"
  | "connector:disconnected"
  | "connector:sync-failed"
  | "connector:health-critical"
  | "approval:overdue"
  | "policy:violation"
  | "anomaly:detected"
  | "alert:triggered"
  | "intelligence:insight-generated"
  | "intelligence:recommendation-generated"
  | "audit:high-severity"
  | "incident:created";

export interface EnterpriseEventPayload {
  eventType: EnterpriseEventType;
  companyId: string;
  source: string;
  timestamp: string;
  actorUserId?: string;
  metadata?: Record<string, unknown>;
}

type EnterpriseEventHandler = (payload: EnterpriseEventPayload) => Promise<void>;

class EnterpriseEventBus {
  private handlers = new Map<EnterpriseEventType, Set<EnterpriseEventHandler>>();

  subscribe(eventType: EnterpriseEventType, handler: EnterpriseEventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  unsubscribe(eventType: EnterpriseEventType, handler: EnterpriseEventHandler): void {
    this.handlers.get(eventType)?.delete(handler);
  }

  async publish(payload: EnterpriseEventPayload): Promise<void> {
    const handlers = this.handlers.get(payload.eventType);
    if (!handlers || handlers.size === 0) return;

    await Promise.all(
      Array.from(handlers).map((handler) =>
        handler(payload).catch((err) => {
          console.error(`[EnterpriseEventBus] Handler failed for ${payload.eventType}:`, err);
        }),
      ),
    );
  }

  clearSubscriptions(): void {
    this.handlers.clear();
  }
}

export const enterpriseEventBus = new EnterpriseEventBus();
