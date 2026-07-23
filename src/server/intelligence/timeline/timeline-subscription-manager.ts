import type { TimelineEventType, TimelineSource, TimelineSeverity } from "./types";

export interface TimelineSubscription {
  id: string;
  userId: string;
  companyId: string;
  name: string;
  eventTypes?: TimelineEventType[];
  sources?: TimelineSource[];
  minSeverity?: TimelineSeverity;
  webhookUrl?: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  createdAt: string;
}

export class TimelineSubscriptionManager {
  private subscriptions = new Map<string, TimelineSubscription[]>();

  subscribe(sub: TimelineSubscription): void {
    const key = this.subKey(sub.userId, sub.companyId);
    const subs = this.subscriptions.get(key) ?? [];
    subs.push(sub);
    this.subscriptions.set(key, subs);
  }

  unsubscribe(userId: string, companyId: string, subscriptionId: string): boolean {
    const key = this.subKey(userId, companyId);
    const subs = this.subscriptions.get(key);
    if (!subs) return false;
    const idx = subs.findIndex((s) => s.id === subscriptionId);
    if (idx < 0) return false;
    subs.splice(idx, 1);
    if (subs.length === 0) this.subscriptions.delete(key);
    else this.subscriptions.set(key, subs);
    return true;
  }

  getSubscriptions(userId: string, companyId: string): TimelineSubscription[] {
    return this.subscriptions.get(this.subKey(userId, companyId)) ?? [];
  }

  getCompanySubscriptions(companyId: string): TimelineSubscription[] {
    const result: TimelineSubscription[] = [];
    for (const [, subs] of this.subscriptions) {
      for (const sub of subs) {
        if (sub.companyId === companyId) result.push(sub);
      }
    }
    return result;
  }

  matchesSubscription(
    sub: TimelineSubscription,
    eventType: TimelineEventType,
    source: TimelineSource,
    severity: TimelineSeverity,
  ): boolean {
    if (sub.eventTypes && !sub.eventTypes.includes(eventType)) return false;
    if (sub.sources && !sub.sources.includes(source)) return false;
    if (sub.minSeverity) {
      const severityOrder: TimelineSeverity[] = ["critical", "high", "medium", "low", "informational"];
      const subIdx = severityOrder.indexOf(sub.minSeverity);
      const eventIdx = severityOrder.indexOf(severity);
      if (subIdx > eventIdx) return false;
    }
    return true;
  }

  private subKey(userId: string, companyId: string): string {
    return `${userId}:${companyId}`;
  }
}

export const timelineSubscriptionManager = new TimelineSubscriptionManager();
