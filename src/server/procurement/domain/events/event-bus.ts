/**
 * Phase 21A.2 — AP Domain Event Bus
 *
 * In-process typed event bus for AP domain events. Synchronous dispatch within
 * a transaction, async notification delivery after commit.
 *
 * Pattern: Modular monolith — typed function calls, no message queue.
 */

import type { DomainEvent } from "../../application/types";

type EventHandler = (event: DomainEvent) => void | Promise<void>;

class APDomainEventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private history: DomainEvent[] = [];

  subscribe(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  subscribeAll(handler: EventHandler): () => void {
    const unsubscribers: Array<() => void> = [];
    for (const eventType of this.handlers.keys()) {
      unsubscribers.push(this.subscribe(eventType, handler));
    }
    return () => unsubscribers.forEach((u) => u());
  }

  async publish(event: DomainEvent): Promise<void> {
    this.history.push(event);
    const handlers = this.handlers.get(event.eventType);
    if (handlers) {
      for (const handler of handlers) {
        await handler(event);
      }
    }
    const allHandlers = this.handlers.get("*");
    if (allHandlers) {
      for (const handler of allHandlers) {
        await handler(event);
      }
    }
  }

  async publishAll(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      await this.publish(event);
    }
  }

  getHistory(aggregateId?: string): DomainEvent[] {
    if (aggregateId) return this.history.filter((e) => e.aggregateId === aggregateId);
    return [...this.history];
  }

  clear(): void {
    this.history = [];
  }

  dispose(): void {
    this.handlers.clear();
    this.history = [];
  }
}

export const apEventBus = new APDomainEventBus();
