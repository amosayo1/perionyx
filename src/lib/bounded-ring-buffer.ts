/**
 * Bounded Ring Buffer
 *
 * Phase 26.3 — Memory Hardening
 *
 * A fixed-capacity array that evicts the oldest entries when full.
 * Prevents unbounded memory growth in production.
 *
 * Usage:
 *   const buf = new BoundedRingBuffer<AuditEntry>(10_000);
 *   buf.push(entry);           // adds entry, evicts oldest if at capacity
 *   buf.getAll();               // returns all entries (newest last)
 *   buf.getLatest(n);          // returns last n entries
 *   buf.size;                   // current count
 *   buf.clear();                // empties the buffer
 */

export class BoundedRingBuffer<T> {
  private items: T[] = [];
  private readonly maxSize: number;

  constructor(maxSize: number = 10_000) {
    if (maxSize <= 0) {
      throw new Error(`BoundedRingBuffer maxSize must be positive, got ${maxSize}`);
    }
    this.maxSize = maxSize;
  }

  push(item: T): void {
    this.items.push(item);
    if (this.items.length > this.maxSize) {
      this.items = this.items.slice(-this.maxSize);
    }
  }

  getAll(): readonly T[] {
    return this.items;
  }

  getLatest(n: number): T[] {
    return this.items.slice(-n);
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.items.filter(predicate);
  }

  get size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }
}
