import type { TimelineEvent, TimelineNarrativeGroup, TimelineSource, TimelineSeverity } from "./types";

export class TimelineNarrativeBuilder {
  build(events: TimelineEvent[]): TimelineNarrativeGroup[] {
    const groups: TimelineNarrativeGroup[] = [];

    const sourceGroups = this.groupBySource(events);
    for (const [source, sourceEvents] of sourceGroups) {
      if (sourceEvents.length >= 2) {
        const group = this.buildGroup(source, sourceEvents);
        groups.push(group);

        for (const event of sourceEvents) {
          event.narrativeGroupId = group.id;
        }
      }
    }

    const severityGroups = this.groupBySeverity(events.filter((e) => !e.narrativeGroupId));
    for (const [severity, sevEvents] of severityGroups) {
      if (sevEvents.length >= 3) {
        const group = this.buildGroup(severity as TimelineSource, sevEvents);
        groups.push(group);

        for (const event of sevEvents) {
          event.narrativeGroupId = group.id;
        }
      }
    }

    return groups;
  }

  generateSummary(groups: TimelineNarrativeGroup[], events: TimelineEvent[]): string {
    const parts: string[] = [];

    const criticalCount = events.filter((e) => e.severity === "critical").length;
    const highCount = events.filter((e) => e.severity === "high").length;
    const totalCount = events.length;

    if (totalCount === 0) return "No significant events during this period.";

    if (criticalCount > 0) {
      parts.push(`${criticalCount} critical ${criticalCount === 1 ? "event requires" : "events require"} immediate attention.`);
    }

    if (highCount > 0) {
      parts.push(`${highCount} high-severity ${highCount === 1 ? "event needs" : "events need"} review.`);
    }

    if (groups.length > 0) {
      for (const group of groups.slice(0, 3)) {
        parts.push(`• ${group.summary}`);
      }
    }

    if (parts.length === 0) {
      parts.push(`No significant activity detected.`);
    } else {
      parts.unshift(`During this period, ${totalCount} ${totalCount === 1 ? "event occurred" : "events occurred"}:`);
    }

    return parts.join("\n");
  }

  private groupBySource(events: TimelineEvent[]): Map<TimelineSource, TimelineEvent[]> {
    const groups = new Map<TimelineSource, TimelineEvent[]>();
    for (const event of events) {
      const existing = groups.get(event.source) ?? [];
      existing.push(event);
      groups.set(event.source, existing);
    }
    return groups;
  }

  private groupBySeverity(events: TimelineEvent[]): Map<string, TimelineEvent[]> {
    const groups = new Map<string, TimelineEvent[]>();
    for (const event of events) {
      const existing = groups.get(event.severity) ?? [];
      existing.push(event);
      groups.set(event.severity, existing);
    }
    return groups;
  }

  private buildGroup(source: TimelineSource, events: TimelineEvent[]): TimelineNarrativeGroup {
    const timestamps = events.map((e) => new Date(e.timestamp).getTime()).sort((a, b) => a - b);
    const severity = this.compositeSeverity(events.map((e) => e.severity));

    return {
      id: `narrative-${source}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: `${events.length} ${this.sourceLabel(source)} ${events.length === 1 ? "event" : "events"}`,
      summary: this.buildNarrativeSummary(source, events),
      eventIds: events.map((e) => e.id),
      period: { start: new Date(timestamps[0]).toISOString(), end: new Date(timestamps[timestamps.length - 1]).toISOString() },
      eventCount: events.length,
      severity,
      source,
    };
  }

  private buildNarrativeSummary(source: TimelineSource, events: TimelineEvent[]): string {
    const labels = events.map((e) => e.type).join(", ");
    const severityCounts = {
      critical: events.filter((e) => e.severity === "critical").length,
      high: events.filter((e) => e.severity === "high").length,
    };

    const parts: string[] = [];

    if (severityCounts.critical > 0) {
      parts.push(`${severityCounts.critical} critical`);
    }
    if (severityCounts.high > 0) {
      parts.push(`${severityCounts.high} high-severity`);
    }

    const prefix = parts.length > 0 ? `${parts.join(" and ")} ` : "";
    return `${prefix}${this.sourceLabel(source)} ${events.length === 1 ? "event" : "events"}: ${labels}`;
  }

  private compositeSeverity(severities: TimelineSeverity[]): TimelineSeverity {
    if (severities.includes("critical")) return "critical";
    if (severities.includes("high")) return "high";
    if (severities.includes("medium")) return "medium";
    if (severities.includes("low")) return "low";
    return "informational";
  }

  private sourceLabel(source: TimelineSource): string {
    const labels: Record<string, string> = {
      treasury: "Treasury",
      payments: "Payment",
      invoices: "Invoice",
      approvals: "Approval",
      workflow_engine: "Workflow",
      automation_studio: "Automation",
      compliance: "Compliance",
      risk: "Risk",
      policies: "Policy",
      audit: "Audit",
      analytics: "Analytics",
      executive_intelligence: "Executive Intelligence",
      ai_recommendations: "AI Recommendation",
    };
    return labels[source] ?? source;
  }
}

export const timelineNarrativeBuilder = new TimelineNarrativeBuilder();
