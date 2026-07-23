"use client";

// ---------------------------------------------------------------------------
// React Hook — Real-Time SSE Subscriptions
// ---------------------------------------------------------------------------
// Usage:
//   const { connected, lastEvent } = useRealtime({
//     channels: ["dashboard", "notification"],
//     onEvent: (event, data) => { ... },
//   });

import { useEffect, useRef, useState, useCallback } from "react";

export interface UseRealtimeOptions {
  channels?: string[];
  onEvent?: (event: string, data: unknown) => void;
  enabled?: boolean;
}

export interface DashboardMetrics {
  runningWorkflows: number;
  pendingApprovals: number;
  unreadNotifications: number;
  activeJobs: number;
  failedJobs: number;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const { channels = ["dashboard", "notification"], onEvent, enabled = true } = options;
  const sourceRef = useRef<EventSource | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<{ event: string; data: unknown } | null>(null);
  const reconnectAttempt = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const connect = useCallback(() => {
    if (!enabled) return;

    // Close existing
    if (sourceRef.current) {
      sourceRef.current.close();
    }

    const params = new URLSearchParams();
    params.set("channels", channels.join(","));
    const url = `/api/v1/realtime/subscribe?${params.toString()}`;

    const source = new EventSource(url);
    sourceRef.current = source;

    source.onopen = () => {
      setConnected(true);
      reconnectAttempt.current = 0;
    };

    source.onerror = () => {
      setConnected(false);
      source.close();

      // Exponential backoff reconnect
      const delay = Math.min(1000 * 2 ** reconnectAttempt.current, 30000);
      reconnectAttempt.current++;
      reconnectTimer.current = setTimeout(connect, delay);
    };

    // Generic event handler
    source.addEventListener("message", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setLastEvent({ event: "message", data });
        onEvent?.("message", data);
      } catch {
        // ignore malformed
      }
    });

    // Specific event handler delegate
    const handler = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        setLastEvent({ event: e.type, data });
        onEvent?.(e.type, data);
      } catch {
        // ignore
      }
    };

    // Register for all known event types
    source.addEventListener("connected", handler);
    source.addEventListener("workflow:created", handler);
    source.addEventListener("workflow:started", handler);
    source.addEventListener("workflow:completed", handler);
    source.addEventListener("workflow:failed", handler);
    source.addEventListener("workflow:cancelled", handler);
    source.addEventListener("workflow:paused", handler);
    source.addEventListener("workflow:resumed", handler);
    source.addEventListener("workflow:progress", handler);
    source.addEventListener("workflow:step:started", handler);
    source.addEventListener("workflow:step:completed", handler);
    source.addEventListener("workflow:step:failed", handler);
    source.addEventListener("approval:requested", handler);
    source.addEventListener("approval:granted", handler);
    source.addEventListener("approval:rejected", handler);
    source.addEventListener("approval:escalated", handler);
    source.addEventListener("notification:new", handler);
    source.addEventListener("notification:count", handler);
    source.addEventListener("queue:job:started", handler);
    source.addEventListener("queue:job:completed", handler);
    source.addEventListener("queue:job:failed", handler);
    source.addEventListener("queue:job:progress", handler);
    source.addEventListener("treasury:balance:updated", handler);
    source.addEventListener("treasury:transfer:completed", handler);
    source.addEventListener("connector:sync:started", handler);
    source.addEventListener("connector:sync:completed", handler);
    source.addEventListener("connector:sync:failed", handler);
    source.addEventListener("connector:health:changed", handler);
    source.addEventListener("system:health", handler);
    source.addEventListener("system:heartbeat", handler);
    source.addEventListener("dashboard:metrics", handler);
    source.addEventListener("audit:high-severity", handler);
  }, [channels.join(","), enabled, onEvent]);

  useEffect(() => {
    connect();
    return () => {
      if (sourceRef.current) {
        sourceRef.current.close();
      }
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, [connect]);

  return { connected, lastEvent };
}

// ---------------------------------------------------------------------------
// Specialized hooks for common use cases
// ---------------------------------------------------------------------------

export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useRealtime({
    channels: ["dashboard"],
    onEvent(event, data) {
      if (event === "dashboard:metrics") {
        setMetrics(data as DashboardMetrics);
      }
    },
  });

  return metrics;
}

export function useUnreadCount() {
  const [count, setCount] = useState<number | null>(null);

  useRealtime({
    channels: ["notification"],
    onEvent(event, data) {
      if (event === "notification:count") {
        setCount((data as { unreadCount: number }).unreadCount);
      }
    },
  });

  return count;
}

export function useWorkflowStatus() {
  const [lastUpdate, setLastUpdate] = useState<{
    event: string;
    data: unknown;
  } | null>(null);

  useRealtime({
    channels: ["workflow"],
    onEvent(event, data) {
      setLastUpdate({ event, data });
    },
  });

  return lastUpdate;
}

export function useApprovalUpdates() {
  const [approvalEvent, setApprovalEvent] = useState<{
    event: string;
    data: unknown;
  } | null>(null);

  useRealtime({
    channels: ["approval"],
    onEvent(event, data) {
      setApprovalEvent({ event, data });
    },
  });

  return approvalEvent;
}
