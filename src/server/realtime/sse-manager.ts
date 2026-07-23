// ---------------------------------------------------------------------------
// SSE Connection Manager
// ---------------------------------------------------------------------------
// Manages SSE connections per tenant, handles heartbeat, reconnect,
// automatic cleanup, and observability.

import { logger } from "@/lib/logger";
import type { RealtimeEvent, RealtimeEventName } from "./types";
import { RealtimeChannels, RealtimeEvents } from "./types";
import { subscribe, publish } from "./event-bus";

// ---------------------------------------------------------------------------
// Connection tracking
// ---------------------------------------------------------------------------
interface SseConnection {
  id: string;
  tenantId: string;
  userId: string;
  controller: ReadableStreamDefaultController;
  encoder: TextEncoder;
  connectedAt: number;
  lastHeartbeatAt: number;
  subscribedChannels: Set<string>;
  closed: boolean;
}

const connections = new Map<string, SseConnection>();

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------
let totalConnections = 0;
let totalReconnects = 0;
let totalDropped = 0;

export function getSseStats() {
  return {
    activeConnections: connections.size,
    totalConnections,
    totalReconnects,
    totalDropped,
  };
}

// ---------------------------------------------------------------------------
// Connection lifecycle
// ---------------------------------------------------------------------------

export function createSseConnection(
  tenantId: string,
  userId: string,
  controller: ReadableStreamDefaultController,
): string {
  const id = crypto.randomUUID();
  const conn: SseConnection = {
    id,
    tenantId,
    userId,
    controller,
    encoder: new TextEncoder(),
    connectedAt: Date.now(),
    lastHeartbeatAt: Date.now(),
    subscribedChannels: new Set(),
    closed: false,
  };

  connections.set(id, conn);
  totalConnections++;

  // Auto-subscribe to tenant-scoped channels
  subscribeToChannel(conn, RealtimeChannels.NOTIFICATION);
  subscribeToChannel(conn, RealtimeChannels.DASHBOARD);

  // Start heartbeat
  startHeartbeat(conn);

  return id;
}

export function closeSseConnection(connectionId: string): void {
  const conn = connections.get(connectionId);
  if (!conn) return;
  conn.closed = true;
  try {
    conn.controller.close();
  } catch {
    // already closed
  }
  connections.delete(connectionId);
  totalDropped++;
}

export function subscribeToChannel(
  connectionIdOrConn: string | SseConnection,
  channel: string,
): void {
  const conn =
    typeof connectionIdOrConn === "string"
      ? connections.get(connectionIdOrConn)
      : connectionIdOrConn;
  if (!conn || conn.closed) return;

  conn.subscribedChannels.add(channel);

  // Listen for events on this channel
  const unsub = subscribe(
    `*` as RealtimeEventName, // we filter by channel in the handler
    (event: RealtimeEvent) => {
      if (
        event.tenantId === conn.tenantId &&
        event.channel === channel &&
        !conn.closed
      ) {
        sendSseEvent(conn, event);
      }
    },
  );

  // Store cleanup
  conn.subscribedChannels.add(channel);

  return;
}

export function unsubscribeFromChannel(
  connectionId: string,
  channel: string,
): void {
  const conn = connections.get(connectionId);
  if (!conn) return;
  conn.subscribedChannels.delete(channel);
}

// ---------------------------------------------------------------------------
// Send helpers
// ---------------------------------------------------------------------------

function sendSseEvent(conn: SseConnection, event: RealtimeEvent): void {
  if (conn.closed) return;
  try {
    const data = formatSse(event.event, event.data);
    conn.controller.enqueue(conn.encoder.encode(data));
  } catch {
    closeSseConnection(conn.id);
  }
}

function formatSse(event: string, data: unknown): string {
  const json = typeof data === "string" ? data : JSON.stringify(data);
  return `event: ${event}\ndata: ${json}\n\n`;
}

export function sendSse(
  connectionId: string,
  event: string,
  data: unknown,
): void {
  const conn = connections.get(connectionId);
  if (!conn || conn.closed) return;
  try {
    conn.controller.enqueue(conn.encoder.encode(formatSse(event, data)));
  } catch {
    closeSseConnection(connectionId);
  }
}

export function broadcastToTenant(
  tenantId: string,
  channel: string,
  event: string,
  data: unknown,
): void {
  for (const conn of connections.values()) {
    if (conn.tenantId === tenantId && conn.subscribedChannels.has(channel)) {
      sendSse(conn.id, event, data);
    }
  }
}

// ---------------------------------------------------------------------------
// Heartbeat
// ---------------------------------------------------------------------------
const HEARTBEAT_INTERVAL_MS = 15_000; // 15s
const HEARTBEAT_TIMEOUT_MS = 60_000; // 60s without heartbeat = disconnect

function startHeartbeat(conn: SseConnection): void {
  const interval = setInterval(() => {
    if (conn.closed) {
      clearInterval(interval);
      return;
    }

    // Check timeout
    if (Date.now() - conn.lastHeartbeatAt > HEARTBEAT_TIMEOUT_MS) {
      closeSseConnection(conn.id);
      clearInterval(interval);
      return;
    }

    // Send heartbeat event (client responds to confirm)
    sendSse(conn.id, RealtimeEvents.SYSTEM_HEARTBEAT, {
      timestamp: new Date().toISOString(),
    });
  }, HEARTBEAT_INTERVAL_MS);
}

export function acknowledgeHeartbeat(connectionId: string): void {
  const conn = connections.get(connectionId);
  if (!conn) return;
  conn.lastHeartbeatAt = Date.now();
}

// ---------------------------------------------------------------------------
// Cleanup stale connections (run periodically)
// ---------------------------------------------------------------------------
export function cleanupStaleConnections(): number {
  const now = Date.now();
  let cleaned = 0;
  for (const [id, conn] of connections) {
    if (now - conn.lastHeartbeatAt > HEARTBEAT_TIMEOUT_MS * 2) {
      closeSseConnection(id);
      cleaned++;
    }
  }
  return cleaned;
}

// ---------------------------------------------------------------------------
// Publish a real-time event from any service
// ---------------------------------------------------------------------------
export function emitRealtimeEvent(
  tenantId: string,
  channel: string,
  event: string,
  data: unknown,
): void {
  const realtimeEvent: RealtimeEvent = {
    channel,
    event,
    data,
    tenantId,
    timestamp: new Date().toISOString(),
  };

  // Publish via event bus (in-process + Redis fan-out)
  publish(realtimeEvent);

  // Also broadcast to connected SSE clients directly
  broadcastToTenant(tenantId, channel, event, data);

  // Log first event per channel for observability
  if (!emitCounts.has(`${channel}:${event}`)) {
    logger.info(
      { event: realtimeEvent, activeConnections: connections.size },
      "[Realtime] First emit",
    );
  }
  const key = `${channel}:${event}`;
  emitCounts.set(key, (emitCounts.get(key) ?? 0) + 1);
}

const emitCounts = new Map<string, number>();

export function getEmitCounts(): Record<string, number> {
  return Object.fromEntries(emitCounts);
}
