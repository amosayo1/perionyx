import type { TimelineEvent, TimelineQuery } from "./types";
import { searchAuditService } from "@/server/search";

export class TimelineAuditBridge {
  recordTimelineAccess(
    userId: string,
    companyId: string,
    query: TimelineQuery,
    resultCount: number,
    latencyMs: number,
  ): void {
    const viewLabel = query.view;
    const filterDesc = query.filter
      ? Object.entries(query.filter)
          .filter(([, v]) => v !== undefined && (Array.isArray(v) ? v.length > 0 : true))
          .map(([k]) => k)
          .join(",")
      : "none";

    searchAuditService.record(
      "VIEW_RESULT",
      `timeline:${viewLabel}[${filterDesc}]`,
      "GLOBAL",
      userId,
      companyId,
      resultCount,
      latencyMs,
    );
  }

  recordEventAction(
    userId: string,
    companyId: string,
    eventId: string,
    action: "dismiss" | "read" | "mark_unread" | "investigate" | "act",
  ): void {
    searchAuditService.record(
      action === "act" ? "VIEW_RESULT" : "SAVE_SEARCH",
      `timeline-event:${eventId}:${action}`,
      "GLOBAL",
      userId,
      companyId,
      1,
      0,
    );
  }
}

export const timelineAuditBridge = new TimelineAuditBridge();
