export interface CacheMetricsData {
  hits: number;
  misses: number;
  sets: number;
  evictions: number;
  invalidations: number;
  errors: number;
  totalGetLatencyMs: number;
  totalSetLatencyMs: number;
  hitRate: number;
  size: number;
}

export class CacheMetrics {
  private metrics = new Map<string, CacheMetricsData>();

  recordHit(key: string, latencyMs: number): void {
    const m = this.getOrCreate(key);
    m.hits++;
    m.totalGetLatencyMs += latencyMs;
    m.hitRate = m.hits / (m.hits + m.misses || 1);
  }

  recordMiss(key: string, latencyMs: number): void {
    const m = this.getOrCreate(key);
    m.misses++;
    m.totalGetLatencyMs += latencyMs;
    m.hitRate = m.hits / (m.hits + m.misses || 1);
  }

  recordSet(key: string, latencyMs: number): void {
    const m = this.getOrCreate(key);
    m.sets++;
    m.totalSetLatencyMs += latencyMs;
  }

  recordEviction(key: string): void {
    this.getOrCreate(key).evictions++;
  }

  recordInvalidation(key: string): void {
    this.getOrCreate(key).invalidations++;
  }

  recordError(key: string): void {
    this.getOrCreate(key).errors++;
  }

  setSize(key: string, size: number): void {
    this.getOrCreate(key).size = size;
  }

  getMetrics(key: string): CacheMetricsData | undefined {
    return this.metrics.get(key);
  }

  getAllMetrics(): Map<string, CacheMetricsData> {
    return new Map(this.metrics);
  }

  getAggregate(): CacheMetricsData {
    const aggregate: CacheMetricsData = {
      hits: 0, misses: 0, sets: 0, evictions: 0,
      invalidations: 0, errors: 0,
      totalGetLatencyMs: 0, totalSetLatencyMs: 0,
      hitRate: 0, size: 0,
    };
    for (const m of this.metrics.values()) {
      aggregate.hits += m.hits;
      aggregate.misses += m.misses;
      aggregate.sets += m.sets;
      aggregate.evictions += m.evictions;
      aggregate.invalidations += m.invalidations;
      aggregate.errors += m.errors;
      aggregate.totalGetLatencyMs += m.totalGetLatencyMs;
      aggregate.totalSetLatencyMs += m.totalSetLatencyMs;
      aggregate.size += m.size;
    }
    aggregate.hitRate = aggregate.hits / (aggregate.hits + aggregate.misses || 1);
    return aggregate;
  }

  reset(key?: string): void {
    if (key) {
      this.metrics.delete(key);
    } else {
      this.metrics.clear();
    }
  }

  private getOrCreate(key: string): CacheMetricsData {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        hits: 0, misses: 0, sets: 0, evictions: 0,
        invalidations: 0, errors: 0,
        totalGetLatencyMs: 0, totalSetLatencyMs: 0,
        hitRate: 0, size: 0,
      });
    }
    return this.metrics.get(key)!;
  }
}

export const cacheMetrics = new CacheMetrics();
