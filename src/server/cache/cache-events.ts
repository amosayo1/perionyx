export type CacheEventType =
  | "hit" | "miss" | "set" | "eviction"
  | "invalidation" | "invalidate_pattern"
  | "invalidate_tag" | "clear"
  | "error" | "refresh";

export interface CacheEvent {
  type: CacheEventType;
  key?: string;
  pattern?: string;
  tag?: string;
  latencyMs?: number;
  size?: number;
  timestamp: Date;
  namespace: string;
}

export type CacheEventHandler = (event: CacheEvent) => void;

export class CacheEventBus {
  private handlers = new Map<CacheEventType, Set<CacheEventHandler>>();
  private globalHandlers = new Set<CacheEventHandler>();

  on(eventType: CacheEventType, handler: CacheEventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  onAny(handler: CacheEventHandler): void {
    this.globalHandlers.add(handler);
  }

  off(eventType: CacheEventType, handler: CacheEventHandler): void {
    this.handlers.get(eventType)?.delete(handler);
  }

  emit(event: CacheEvent): void {
    this.handlers.get(event.type)?.forEach((h) => h(event));
    this.globalHandlers.forEach((h) => h(event));
  }

  clear(): void {
    this.handlers.clear();
    this.globalHandlers.clear();
  }
}

export const cacheEventBus = new CacheEventBus();
