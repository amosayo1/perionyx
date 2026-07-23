export type OrchestrationEventType =
  | "CommandStarted"
  | "CommandValidated"
  | "CapabilityMismatch"
  | "CapabilityMatched"
  | "ProviderSelected"
  | "ProviderQueried"
  | "ProviderFailed"
  | "ProviderRestored"
  | "RetryStarted"
  | "RetrySucceeded"
  | "RetryExhausted"
  | "FallbackActivated"
  | "FallbackExhausted"
  | "CircuitBreakerOpened"
  | "CircuitBreakerHalfOpen"
  | "CircuitBreakerClosed"
  | "ExecutionCompleted"
  | "ExecutionFailed"
  | "DeadLettered"
  | "AllFallbacksFailed";

export interface OrchestrationEvent {
  type: OrchestrationEventType;
  timestamp: string;
  data: Record<string, unknown>;
}

export type OrchestrationEventHandler = (event: OrchestrationEvent) => void;

export class OrchestrationEventBus {
  private subscribers = new Map<OrchestrationEventType, OrchestrationEventHandler[]>();
  private history: OrchestrationEvent[] = [];
  private readonly maxHistory = 5_000;

  subscribe(type: OrchestrationEventType, handler: OrchestrationEventHandler): () => void {
    const handlers = this.subscribers.get(type) ?? [];
    handlers.push(handler);
    this.subscribers.set(type, handlers);
    return () => this.unsubscribe(type, handler);
  }

  unsubscribe(type: OrchestrationEventType, handler: OrchestrationEventHandler): void {
    const handlers = this.subscribers.get(type);
    if (!handlers) return;
    this.subscribers.set(
      type,
      handlers.filter((h) => h !== handler),
    );
  }

  publish(type: OrchestrationEventType, data: Record<string, unknown>): void {
    const event: OrchestrationEvent = {
      type,
      timestamp: new Date().toISOString(),
      data,
    };

    this.history.push(event);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    const handlers = this.subscribers.get(type) ?? [];
    for (const handler of handlers) {
      try {
        handler(event);
      } catch {
      }
    }
  }

  getHistory(type?: OrchestrationEventType, limit = 100): OrchestrationEvent[] {
    let result = this.history;
    if (type) {
      result = result.filter((e) => e.type === type);
    }
    return result.slice(-limit);
  }

  clearHistory(): void {
    this.history = [];
  }

  clearSubscriptions(): void {
    this.subscribers.clear();
  }
}

export const orchestrationEventBus = new OrchestrationEventBus();