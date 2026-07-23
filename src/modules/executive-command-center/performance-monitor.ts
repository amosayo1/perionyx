// ─────────────────────────────────────────────────────────────
// Executive Command Center — Performance Monitor
// Dashboard performance instrumentation and tracking
// ─────────────────────────────────────────────────────────────

import type { PerformanceMetric, DashboardPerformance } from "./types";

const metrics: PerformanceMetric[] = [];
const loadTimes: Record<string, number[]> = {};
let totalApiCalls = 0;
let totalCacheHits = 0;
let totalCacheMisses = 0;

export class PerformanceMonitor {
  static async trackLoadTime<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric({
        name,
        value: duration,
        unit: "ms",
        target: 2000,
        status: duration <= 2000 ? "met" : duration <= 3000 ? "approaching" : "missed",
        measuredAt: new Date(),
      });
      if (!loadTimes[name]) loadTimes[name] = [];
      loadTimes[name].push(duration);
      return result;
    } catch (err) {
      const duration = performance.now() - start;
      this.recordMetric({
        name,
        value: duration,
        unit: "ms",
        target: 2000,
        status: "missed",
        measuredAt: new Date(),
      });
      throw err;
    }
  }

  static recordMetric(metric: PerformanceMetric): void {
    metrics.push(metric);
    if (metrics.length > 500) {
      metrics.splice(0, metrics.length - 500);
    }
  }

  static incrementApiCalls(count: number = 1): void {
    totalApiCalls += count;
  }

  static incrementCacheHits(count: number = 1): void {
    totalCacheHits += count;
  }

  static incrementCacheMisses(count: number = 1): void {
    totalCacheMisses += count;
  }

  static getPerformanceReport(): {
    metrics: PerformanceMetric[];
    summary: Record<string, { avg: number; min: number; max: number; count: number }>;
    totalApiCalls: number;
    cacheHitRate: number;
  } {
    const summary: Record<string, { avg: number; min: number; max: number; count: number }> = {};

    for (const [name, times] of Object.entries(loadTimes)) {
      const sorted = [...times].sort((a, b) => a - b);
      summary[name] = {
        avg: sorted.reduce((a, b) => a + b, 0) / sorted.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        count: sorted.length,
      };
    }

    const cacheTotal = totalCacheHits + totalCacheMisses;
    const cacheHitRate = cacheTotal > 0 ? (totalCacheHits / cacheTotal) * 100 : 0;

    return {
      metrics: [...metrics],
      summary,
      totalApiCalls,
      cacheHitRate,
    };
  }

  static getDashboardPerformance(): DashboardPerformance {
    const recentMetrics = metrics.slice(-50);
    const avgLoadTime =
      recentMetrics.length > 0
        ? recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length
        : 0;

    return {
      loadTime: avgLoadTime,
      apiCalls: totalApiCalls,
      parallelQueries: recentMetrics.filter((m) => m.name.includes("parallel")).length,
      cacheHits: totalCacheHits,
      cacheMisses: totalCacheMisses,
      renderTime: avgLoadTime * 0.3,
      dataSize: recentMetrics.length,
      timestamp: new Date(),
    };
  }

  static reset(): void {
    metrics.length = 0;
    for (const key of Object.keys(loadTimes)) {
      delete loadTimes[key];
    }
    totalApiCalls = 0;
    totalCacheHits = 0;
    totalCacheMisses = 0;
  }
}
