import type { AuditEvent } from "../types";

export class AuditService {
  private events: AuditEvent[] = [];

  addEvent(event: AuditEvent): void {
    this.events.push(event);
  }

  getAllEvents(): AuditEvent[] {
    return [...this.events];
  }

  getByEntity(entityType: string, entityId: string): AuditEvent[] {
    return this.events.filter(
      (e) => e.entityType === entityType && e.entityId === entityId,
    );
  }

  getByEntityType(entityType: string): AuditEvent[] {
    return this.events.filter((e) => e.entityType === entityType);
  }

  getByUser(userId: string): AuditEvent[] {
    return this.events.filter((e) => e.userId === userId);
  }

  getByAction(action: string): AuditEvent[] {
    return this.events.filter((e) => e.action === action);
  }

  getRecent(limit = 100): AuditEvent[] {
    return this.events.slice(-limit).reverse();
  }

  count(): number {
    return this.events.length;
  }
}
