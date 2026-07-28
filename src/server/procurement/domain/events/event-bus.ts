/**
 * Phase 21A.2 — AP Domain Event Bus
 *
 * In-process typed event bus for AP domain events. Synchronous dispatch within
 * a transaction, async notification delivery after commit.
 *
 * Pattern: Modular monolith — typed function calls, no message queue.
 *
 * Phase 26.1 — Added structured Pino logging, error isolation per handler,
 * event metrics, and bounded history with eviction.
 */

import type { DomainEvent } from "../../application/types";
import { logger } from "@/lib/logger";

type EventHandler = (event: DomainEvent) => void | Promise<void>;

const MAX_HISTORY = 1_000;
const eventLog = logger.child({ module: "ap-event-bus" });

class APDomainEventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private history: DomainEvent[] = [];
  private published = 0;
  private handlerErrors = 0;

  subscribe(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
    eventLog.debug({ eventType, handlerCount: this.handlers.get(eventType)!.size }, "Handler subscribed");
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
    this.published++;

    // Evict oldest events if history exceeds bound
    if (this.history.length > MAX_HISTORY) {
      this.history.splice(0, this.history.length - MAX_HISTORY);
    }

    const handlers = this.handlers.get(event.eventType);
    if (handlers) {
      for (const handler of handlers) {
        try {
          await handler(event);
        } catch (err) {
          this.handlerErrors++;
          eventLog.error(
            { err, eventType: event.eventType, aggregateId: event.aggregateId },
            "Event handler failed",
          );
        }
      }
    }

    const allHandlers = this.handlers.get("*");
    if (allHandlers) {
      for (const handler of allHandlers) {
        try {
          await handler(event);
        } catch (err) {
          this.handlerErrors++;
          eventLog.error(
            { err, eventType: event.eventType, aggregateId: event.aggregateId },
            "Wildcard event handler failed",
          );
        }
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

  getMetrics(): { published: number; handlerErrors: number; historySize: number; handlerCount: number } {
    let handlerCount = 0;
    for (const set of this.handlers.values()) {
      handlerCount += set.size;
    }
    return { published: this.published, handlerErrors: this.handlerErrors, historySize: this.history.length, handlerCount };
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
