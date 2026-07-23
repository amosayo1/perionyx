import type { TimelineEvent, TimelineFilter, TimelineQuery } from "./types";

export class TimelineFilterService {
  filter(events: TimelineEvent[], query: TimelineQuery): TimelineEvent[] {
    const filter = query.filter;
    if (!filter) return events;

    let result = [...events];

    if (filter.modules && filter.modules.length > 0) {
      result = result.filter((e) => filter.modules!.includes(e.source));
    }

    if (filter.severities && filter.severities.length > 0) {
      result = result.filter((e) => filter.severities!.includes(e.severity));
    }

    if (filter.types && filter.types.length > 0) {
      result = result.filter((e) => filter.types!.includes(e.type));
    }

    if (filter.dateRange) {
      const start = new Date(filter.dateRange.start).getTime();
      const end = new Date(filter.dateRange.end).getTime();
      result = result.filter((e) => {
        const t = new Date(e.timestamp).getTime();
        return t >= start && t <= end;
      });
    }

    if (filter.tags && filter.tags.length > 0) {
      result = result.filter((e) => filter.tags!.some((t) => e.tags.includes(t)));
    }

    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.summary.toLowerCase().includes(q) ||
          e.businessImpact.toLowerCase().includes(q),
      );
    }

    if (filter.isDismissed !== undefined) {
      result = result.filter((e) => e.isDismissed === filter.isDismissed);
    }

    if (filter.minPriority !== undefined) {
      result = result.filter((e) => e.priorityScore >= filter.minPriority!);
    }

    return result;
  }

  getDateRange(query: TimelineQuery): { start: Date; end: Date } {
    const now = new Date();
    const end = now;

    switch (query.view) {
      case "today":
        return { start: new Date(now.getFullYear(), now.getMonth(), now.getDate()), end };
      case "yesterday": {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return { start: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()), end: new Date(now.getFullYear(), now.getMonth(), now.getDate()) };
      }
      case "last_7_days": {
        const sevenDays = new Date(now);
        sevenDays.setDate(sevenDays.getDate() - 7);
        return { start: sevenDays, end };
      }
      case "last_30_days": {
        const thirtyDays = new Date(now);
        thirtyDays.setDate(thirtyDays.getDate() - 30);
        return { start: thirtyDays, end };
      }
      case "month_end": {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: monthStart, end };
      }
      case "quarter": {
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        return { start: quarterStart, end };
      }
      case "custom":
        return { start: new Date(0), end };
    }
  }
}

export const timelineFilterService = new TimelineFilterService();
