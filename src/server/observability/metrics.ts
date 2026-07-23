type MetricLabel = Record<string, string>;

interface Counter {
  inc(labels?: MetricLabel): void;
  add(value: number, labels?: MetricLabel): void;
  get(): number;
  reset(): void;
}

interface Gauge {
  set(value: number, labels?: MetricLabel): void;
  inc(labels?: MetricLabel): void;
  dec(labels?: MetricLabel): void;
  get(): number;
  reset(): void;
}

interface Histogram {
  observe(value: number, labels?: MetricLabel): void;
  get(): HistogramSnapshot;
  reset(): void;
}

interface HistogramSnapshot {
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  p50: number;
  p95: number;
  p99: number;
}

class CounterImpl implements Counter {
  private store = new Map<string, number>();

  inc(labels?: MetricLabel): void { this.add(1, labels); }
  add(value: number, labels?: MetricLabel): void {
    const key = this.key(labels);
    this.store.set(key, (this.store.get(key) ?? 0) + value);
  }
  get(): number {
    return [...this.store.values()].reduce((a, b) => a + b, 0);
  }
  reset(): void { this.store.clear(); }
  private key(labels?: MetricLabel): string {
    if (!labels || Object.keys(labels).length === 0) return "__default";
    return Object.entries(labels).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join(",");
  }
}

class GaugeImpl implements Gauge {
  private store = new Map<string, number>();

  set(value: number, labels?: MetricLabel): void {
    this.store.set(this.key(labels), value);
  }
  inc(labels?: MetricLabel): void {
    const key = this.key(labels);
    this.store.set(key, (this.store.get(key) ?? 0) + 1);
  }
  dec(labels?: MetricLabel): void {
    const key = this.key(labels);
    this.store.set(key, (this.store.get(key) ?? 0) - 1);
  }
  get(): number {
    return [...this.store.values()].reduce((a, b) => a + b, 0);
  }
  reset(): void { this.store.clear(); }
  private key(labels?: MetricLabel): string {
    if (!labels || Object.keys(labels).length === 0) return "__default";
    return Object.entries(labels).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join(",");
  }
}

class HistogramImpl implements Histogram {
  private values: number[] = [];

  observe(value: number, _labels?: MetricLabel): void {
    this.values.push(value);
  }

  get(): HistogramSnapshot {
    const sorted = [...this.values].sort((a, b) => a - b);
    const count = sorted.length;
    if (count === 0) return { count: 0, sum: 0, min: 0, max: 0, avg: 0, p50: 0, p95: 0, p99: 0 };
    const sum = sorted.reduce((a, b) => a + b, 0);
    return {
      count,
      sum,
      min: sorted[0],
      max: sorted[count - 1],
      avg: Math.round((sum / count) * 100) / 100,
      p50: sorted[Math.floor(count * 0.5)],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)],
    };
  }

  reset(): void { this.values = []; }
}

export class MetricsRegistry {
  private counters = new Map<string, CounterImpl>();
  private gauges = new Map<string, GaugeImpl>();
  private histograms = new Map<string, HistogramImpl>();

  counter(name: string): Counter {
    if (!this.counters.has(name)) this.counters.set(name, new CounterImpl());
    return this.counters.get(name)!;
  }

  gauge(name: string): Gauge {
    if (!this.gauges.has(name)) this.gauges.set(name, new GaugeImpl());
    return this.gauges.get(name)!;
  }

  histogram(name: string): Histogram {
    if (!this.histograms.has(name)) this.histograms.set(name, new HistogramImpl());
    return this.histograms.get(name)!;
  }

  snapshot(): MetricsSnapshot {
    const counters: Record<string, number> = {};
    const gauges: Record<string, number> = {};
    const histograms: Record<string, HistogramSnapshot> = {};
    for (const [name, c] of this.counters) counters[name] = c.get();
    for (const [name, g] of this.gauges) gauges[name] = g.get();
    for (const [name, h] of this.histograms) histograms[name] = h.get();
    return { counters, gauges, histograms, timestamp: new Date() };
  }

  resetAll(): void {
    this.counters.forEach((c) => c.reset());
    this.gauges.forEach((g) => g.reset());
    this.histograms.forEach((h) => h.reset());
  }
}

interface MetricsSnapshot {
  counters: Record<string, number>;
  gauges: Record<string, number>;
  histograms: Record<string, HistogramSnapshot>;
  timestamp: Date;
}

export const metrics = new MetricsRegistry();
