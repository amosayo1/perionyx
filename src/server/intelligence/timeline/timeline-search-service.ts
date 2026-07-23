import type { TimelineEvent, TimelineFilter } from "./types";

export class TimelineSearchService {
  search(events: TimelineEvent[], query: string): TimelineEvent[] {
    const q = query.toLowerCase().trim();
    if (!q) return events;

    return events.filter((event) => {
      const searchable = [
        event.title,
        event.summary,
        event.businessImpact,
        event.recommendedAction ?? "",
        event.type,
        event.source,
        event.module,
        ...event.tags,
        ...event.entities.map((e) => e.label),
        ...event.entities.map((e) => e.type),
        ...event.entities.map((e) => e.id),
      ].join(" ").toLowerCase();

      const tokens = q.split(/\s+/);

      return tokens.every((token) => searchable.includes(token));
    });
  }

  getSearchSuggestions(events: TimelineEvent[], prefix: string): string[] {
    const q = prefix.toLowerCase().trim();
    if (!q || q.length < 2) return [];

    const suggestions = new Set<string>();

    for (const event of events) {
      if (event.title.toLowerCase().includes(q)) {
        suggestions.add(event.title.slice(0, 80));
      }
      if (event.type.toLowerCase().replace(/_/g, " ").includes(q)) {
        suggestions.add(event.type.replace(/_/g, " "));
      }
      for (const tag of event.tags) {
        if (tag.toLowerCase().includes(q)) {
          suggestions.add(tag);
        }
      }
    }

    return Array.from(suggestions).slice(0, 10).sort();
  }
}

export const timelineSearchService = new TimelineSearchService();
