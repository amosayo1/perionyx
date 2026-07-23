import type { AuditEvent, AuditEventType } from "../../types";

export class AuditService {
  private events = new Map<string, AuditEvent>();

  addEvent(event: AuditEvent): AuditEvent {
    this.events.set(event.id, event);
    return event;
  }

  getEvent(id: string): AuditEvent | undefined {
    return this.events.get(id);
  }

  getAllEvents(): AuditEvent[] {
    return Array.from(this.events.values());
  }

  getByEntity(entityId: string): AuditEvent[] {
    return this.getAllEvents().filter(e => e.entityId === entityId);
  }

  getByEventType(eventType: AuditEventType): AuditEvent[] {
    return this.getAllEvents().filter(e => e.eventType === eventType);
  }

  getBySeverity(severity: string): AuditEvent[] {
    return this.getAllEvents().filter(e => e.severity === severity);
  }

  getByDateRange(from: Date, to: Date): AuditEvent[] {
    return this.getAllEvents().filter(e => e.timestamp >= from && e.timestamp <= to);
  }

  getByUser(userId: string): AuditEvent[] {
    return this.getAllEvents().filter(e => e.userId === userId);
  }

  getByEntityType(entityType: string): AuditEvent[] {
    return this.getAllEvents().filter(e => e.entityType === entityType);
  }

  count(): number {
    return this.events.size;
  }
}
