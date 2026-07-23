import type { SearchAnalyticsEvent, SearchMode, SearchSourceType } from "./types";

export class SearchAnalytics {
  private events: SearchAnalyticsEvent[] = [];
  private readonly maxEvents = 50_000;

  recordEvent(event: SearchAnalyticsEvent): void {
    this.events.push(event);
    this.trim();
  }

  getTotalSearches(companyId?: string, sinceMs?: number): number {
    return this.filtered(sinceMs, companyId).length;
  }

  getPopularQueries(limit = 20, companyId?: string): { query: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const event of this.filtered(undefined, companyId)) {
      const key = event.query.toLowerCase().trim();
      if (key.length === 0) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getZeroResultQueries(companyId?: string): { query: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const event of this.filtered(undefined, companyId)) {
      if (event.resultCount === 0) {
        const key = event.query.toLowerCase().trim();
        if (key.length === 0) continue;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  getAverageLatency(companyId?: string): number {
    const filtered = this.filtered(undefined, companyId);
    if (filtered.length === 0) return 0;
    const total = filtered.reduce((sum, e) => sum + e.latencyMs, 0);
    return Math.round(total / filtered.length);
  }

  getModeBreakdown(companyId?: string): Record<SearchMode, number> {
    const breakdown: Record<string, number> = {};
    for (const event of this.filtered(undefined, companyId)) {
      breakdown[event.mode] = (breakdown[event.mode] ?? 0) + 1;
    }
    return breakdown as Record<SearchMode, number>;
  }

  getClickThroughRate(): number {
    const withClicks = this.events.filter((e) => e.clickedResultId).length;
    return this.events.length > 0 ? Math.round((withClicks / this.events.length) * 100) : 0;
  }

  getStats(): {
    totalSearches: number;
    popularQueries: { query: string; count: number }[];
    zeroResultQueries: { query: string; count: number }[];
    avgLatencyMs: number;
    modeBreakdown: Record<string, number>;
    clickThroughRate: number;
  } {
    return {
      totalSearches: this.events.length,
      popularQueries: this.getPopularQueries(),
      zeroResultQueries: this.getZeroResultQueries(),
      avgLatencyMs: this.getAverageLatency(),
      modeBreakdown: this.getModeBreakdown(),
      clickThroughRate: this.getClickThroughRate(),
    };
  }

  getRecentEvents(count = 50): SearchAnalyticsEvent[] {
    return this.events.slice(-count).reverse();
  }

  private filtered(sinceMs?: number, companyId?: string): SearchAnalyticsEvent[] {
    let result = this.events;
    if (sinceMs) {
      const since = Date.now() - sinceMs;
      result = result.filter((e) => new Date(e.timestamp).getTime() >= since);
    }
    if (companyId) {
      result = result.filter((e) => e.companyId === companyId);
    }
    return result;
  }

  private trim(): void {
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }
}

export const searchAnalytics = new SearchAnalytics();
