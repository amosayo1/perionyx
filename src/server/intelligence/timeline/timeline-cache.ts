import type { TimelineEvent, TimelineNarrativeGroup, TimelineView } from "./types";

interface CacheEntry<T> {
  data: T;
  storedAt: number;
  ttlMs: number;
}

export class TimelineCache {
  private events = new Map<string, CacheEntry<TimelineEvent[]>>();
  private narrativeGroups = new Map<string, CacheEntry<TimelineNarrativeGroup[]>>();
  private summaries = new Map<string, CacheEntry<string>>();

  private key(companyId: string, view: TimelineView, offset: number): string {
    return `${companyId}:${view}:${offset}`;
  }

  getEvents(companyId: string, view: TimelineView, offset: number): TimelineEvent[] | null {
    const entry = this.events.get(this.key(companyId, view, offset));
    if (!entry) return null;
    if (Date.now() - entry.storedAt > entry.ttlMs) {
      this.events.delete(this.key(companyId, view, offset));
      return null;
    }
    return entry.data;
  }

  setEvents(companyId: string, view: TimelineView, offset: number, events: TimelineEvent[]): void {
    this.events.set(this.key(companyId, view, offset), {
      data: events,
      storedAt: Date.now(),
      ttlMs: this.getTtlForView(view),
    });
  }

  getNarratives(companyId: string, view: TimelineView): TimelineNarrativeGroup[] | null {
    const entry = this.narrativeGroups.get(`narratives:${companyId}:${view}`);
    if (!entry) return null;
    if (Date.now() - entry.storedAt > entry.ttlMs) {
      this.narrativeGroups.delete(`narratives:${companyId}:${view}`);
      return null;
    }
    return entry.data;
  }

  setNarratives(companyId: string, view: TimelineView, narratives: TimelineNarrativeGroup[]): void {
    this.narrativeGroups.set(`narratives:${companyId}:${view}`, {
      data: narratives,
      storedAt: Date.now(),
      ttlMs: this.getTtlForView(view),
    });
  }

  getSummary(companyId: string, view: TimelineView): string | null {
    const entry = this.summaries.get(`summary:${companyId}:${view}`);
    if (!entry) return null;
    if (Date.now() - entry.storedAt > entry.ttlMs) {
      this.summaries.delete(`summary:${companyId}:${view}`);
      return null;
    }
    return entry.data;
  }

  setSummary(companyId: string, view: TimelineView, summary: string): void {
    this.summaries.set(`summary:${companyId}:${view}`, {
      data: summary,
      storedAt: Date.now(),
      ttlMs: this.getTtlForView(view),
    });
  }

  invalidate(companyId: string): void {
    for (const [k] of this.events) { if (k.startsWith(companyId)) this.events.delete(k); }
    for (const [k] of this.narrativeGroups) { if (k.includes(companyId)) this.narrativeGroups.delete(k); }
    for (const [k] of this.summaries) { if (k.includes(companyId)) this.summaries.delete(k); }
  }

  clear(): void {
    this.events.clear();
    this.narrativeGroups.clear();
    this.summaries.clear();
  }

  getStats(): { entries: number } {
    return {
      entries: this.events.size + this.narrativeGroups.size + this.summaries.size,
    };
  }

  private getTtlForView(view: TimelineView): number {
    switch (view) {
      case "today": return 60_000;
      case "yesterday": return 300_000;
      case "last_7_days": return 600_000;
      case "last_30_days": return 1_800_000;
      case "month_end": return 1_800_000;
      case "quarter": return 3_600_000;
      case "custom": return 60_000;
    }
  }
}

export const timelineCache = new TimelineCache();
