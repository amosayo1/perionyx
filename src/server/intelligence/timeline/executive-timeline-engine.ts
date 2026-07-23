import type { TimelineEvent, TimelineNarrativeGroup, TimelineQuery, TimelineResponse, TimelineFilter, TimelineView, TimelineSource, TimelineSeverity, TimelineEventType, TimelineEntity, TimelineQuickAction, TimelineEvidence } from "./types";
import { timelineAggregator } from "./timeline-aggregator";
import { timelineCache } from "./timeline-cache";
import { timelineFilterService } from "./timeline-filter-service";
import { timelineNarrativeBuilder } from "./timeline-narrative-builder";
import { timelineSearchService } from "./timeline-search-service";
import { timelineAuditBridge } from "./timeline-audit-bridge";
import { timelineSubscriptionManager, type TimelineSubscription } from "./timeline-subscription-manager";

export class ExecutiveTimelineEngine {
  async getTimeline(query: TimelineQuery): Promise<TimelineResponse> {
    const startTime = Date.now();

    const cached = timelineCache.getEvents(query.companyId, query.view, query.offset);
    const cachedNarratives = query.includeNarratives
      ? timelineCache.getNarratives(query.companyId, query.view)
      : null;
    const cachedSummary = timelineCache.getSummary(query.companyId, query.view);

    if (cached) {
      const filtered = query.filter
        ? timelineFilterService.filter(cached, query)
        : cached;
      const paginated = filtered.slice(query.offset, query.offset + query.limit);

      return {
        events: paginated,
        narrativeGroups: cachedNarratives ?? [],
        totalCount: filtered.length,
        hasMore: filtered.length > query.offset + query.limit,
        view: query.view,
        generatedAt: new Date().toISOString(),
        summary: cachedSummary ?? undefined,
      };
    }

    const dateRange = timelineFilterService.getDateRange(query);

    const rawEvents = await timelineAggregator.aggregate(
      query.companyId,
      dateRange,
      query.filter,
    );

    timelineCache.setEvents(query.companyId, query.view, 0, rawEvents);

    let narratives: TimelineNarrativeGroup[] = [];
    if (query.includeNarratives) {
      narratives = timelineNarrativeBuilder.build(rawEvents);
      timelineCache.setNarratives(query.companyId, query.view, narratives);

      const summary = timelineNarrativeBuilder.generateSummary(narratives, rawEvents);
      timelineCache.setSummary(query.companyId, query.view, summary);
    }

    const filtered = query.filter
      ? timelineFilterService.filter(rawEvents, query)
      : rawEvents;
    const paginated = filtered.slice(query.offset, query.offset + query.limit);

    timelineAuditBridge.recordTimelineAccess(
      "",
      query.companyId,
      query,
      filtered.length,
      Date.now() - startTime,
    );

    return {
      events: paginated,
      narrativeGroups: narratives,
      totalCount: filtered.length,
      hasMore: filtered.length > query.offset + query.limit,
      view: query.view,
      generatedAt: new Date().toISOString(),
      summary: cachedSummary ?? (query.includeNarratives ? timelineNarrativeBuilder.generateSummary(narratives, rawEvents) : undefined),
    };
  }

  async refresh(companyId: string): Promise<void> {
    timelineCache.invalidate(companyId);
  }

  invalidateCache(companyId: string): void {
    timelineCache.invalidate(companyId);
  }

  async searchEvents(
    companyId: string,
    query: string,
    view: TimelineView = "last_30_days",
    limit = 50,
  ): Promise<TimelineEvent[]> {
    const dateRange = timelineFilterService.getDateRange({ companyId, view, limit, offset: 0 });
    const events = await timelineAggregator.aggregate(companyId, dateRange);
    return timelineSearchService.search(events, query);
  }

  getSearchSuggestions(
    events: TimelineEvent[],
    prefix: string,
  ): string[] {
    return timelineSearchService.getSearchSuggestions(events, prefix);
  }

  markEventRead(companyId: string, eventId: string): boolean {
    const events = timelineCache.getEvents(companyId, "today", 0);
    if (!events) return false;
    const event = events.find((e) => e.id === eventId);
    if (!event) return false;
    event.isRead = true;
    return true;
  }

  dismissEvent(companyId: string, eventId: string): boolean {
    const views: TimelineView[] = ["today", "yesterday", "last_7_days", "last_30_days"];
    for (const view of views) {
      const events = timelineCache.getEvents(companyId, view, 0);
      if (events) {
        const event = events.find((e) => e.id === eventId);
        if (event) {
          event.isDismissed = true;
          return true;
        }
      }
    }
    return false;
  }

  getNarratives(events: TimelineEvent[]): TimelineNarrativeGroup[] {
    return timelineNarrativeBuilder.build(events);
  }

  subscribe(subscription: TimelineSubscription): void {
    timelineSubscriptionManager.subscribe(subscription);
  }

  unsubscribe(userId: string, companyId: string, subscriptionId: string): boolean {
    return timelineSubscriptionManager.unsubscribe(userId, companyId, subscriptionId);
  }

  getSubscriptions(userId: string, companyId: string): TimelineSubscription[] {
    return timelineSubscriptionManager.getSubscriptions(userId, companyId);
  }

  getCacheStats(): { entries: number } {
    return timelineCache.getStats();
  }
}

export const executiveTimelineEngine = new ExecutiveTimelineEngine();
