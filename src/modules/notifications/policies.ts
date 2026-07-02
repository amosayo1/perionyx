import type { NotificationEventType } from "./notifications.service";
import type { NotificationPolicy } from "@/modules/connector-platform/communication-types";

export interface PolicyEvaluationContext {
  eventType: NotificationEventType;
  severity?: string;
  department?: string;
  userId: string;
  companyId: string;
  createdAt: Date;
}

export function evaluatePolicy(
  policy: NotificationPolicy,
  context: PolicyEvaluationContext,
): { passed: boolean; reason?: string } {
  if (policy.severityThreshold && context.severity) {
    const passed = compareSeverity(context.severity, policy.severityThreshold);
    if (!passed) {
      return { passed: false, reason: `Severity ${context.severity} below threshold ${policy.severityThreshold}` };
    }
  }

  if (policy.categories && policy.categories.length > 0) {
    const matchesCategory = policy.categories.some(
      (cat) => context.eventType.toLowerCase().includes(cat.toLowerCase()),
    );
    if (!matchesCategory) {
      return { passed: false, reason: `Event type ${context.eventType} not in allowed categories` };
    }
  }

  if (policy.departments && policy.departments.length > 0) {
    if (!context.department || !policy.departments.includes(context.department)) {
      return { passed: false, reason: `Department ${context.department ?? "none"} not in allowed departments` };
    }
  }

  if (policy.executiveOnly && context.department !== "executive") {
    return { passed: false, reason: "Notification is restricted to executive department" };
  }

  if (policy.quietHours) {
    const now = new Date();
    const userTime = new Date(now.toLocaleString("en-US", { timeZone: policy.quietHours.timezone }));
    const hours = userTime.getHours();
    const minutes = userTime.getMinutes();
    const [startH, startM] = policy.quietHours.start.split(":").map(Number);
    const [endH, endM] = policy.quietHours.end.split(":").map(Number);

    const startMinutes = startH * 60 + (startM ?? 0);
    const endMinutes = endH * 60 + (endM ?? 0);
    const currentMinutes = hours * 60 + minutes;

    const isQuiet = startMinutes <= endMinutes
      ? currentMinutes >= startMinutes && currentMinutes <= endMinutes
      : currentMinutes >= startMinutes || currentMinutes <= endMinutes;

    if (isQuiet && !policy.immediate) {
      return { passed: false, reason: `Current time falls within quiet hours (${policy.quietHours.start}-${policy.quietHours.end})` };
    }
  }

  return { passed: true };
}

function compareSeverity(actual: string, threshold: string): boolean {
  const order: Record<string, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
  const a = order[actual.toUpperCase()] ?? 0;
  const t = order[threshold.toUpperCase()] ?? 0;
  return a >= t;
}

export function getDefaultPolicy(): NotificationPolicy {
  return {
    immediate: true,
    channelPriority: 0,
  };
}
