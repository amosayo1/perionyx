import type { TimelineEvent } from "./types";

export class TimelineTracker {
  private events: TimelineEvent[] = [];
  private stepCounter = 0;

  record(
    label: string,
    description: string,
    module: string,
    status: TimelineEvent["status"] = "success",
    data?: Record<string, unknown>,
  ): void {
    this.stepCounter++;
    this.events.push({
      step: this.stepCounter,
      timestamp: new Date().toISOString(),
      label,
      description,
      module,
      status,
      data,
    });
  }

  getEvents(): TimelineEvent[] {
    return [...this.events];
  }
}
