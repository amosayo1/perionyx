import type { TimelineEvent, TimelineSeverity } from "./types";
import { TIMELINE_SEVERITY_ORDER } from "./types";
import { timelineEventRegistry } from "./timeline-event-registry";

export class TimelinePriorityScorer {
  score(event: TimelineEvent): number {
    let score = 0;

    score += this.severityScore(event.severity);

    const def = timelineEventRegistry.get(event.type);
    if (def) {
      score += def.defaultSeverity === "critical" ? 30 : def.defaultSeverity === "high" ? 20 : def.defaultSeverity === "medium" ? 10 : 5;
    }

    const ageHours = (Date.now() - new Date(event.timestamp).getTime()) / 3_600_000;
    score += Math.max(0, 10 - ageHours);

    if (event.entities.length > 0) score += 5;

    if (event.quickActions.length > 0) score += 3;

    if (!event.isRead) score += 10;

    if (event.narrativeGroupId) score += 2;

    const trendSources = ["treasury", "risk", "compliance", "approvals"];
    if (trendSources.includes(event.source)) score += 5;

    return Math.round(score);
  }

  private severityScore(severity: TimelineSeverity): number {
    const order = TIMELINE_SEVERITY_ORDER;
    const idx = order.indexOf(severity);
    return Math.max(0, (order.length - idx) * 10);
  }
}

export const timelinePriorityScorer = new TimelinePriorityScorer();
