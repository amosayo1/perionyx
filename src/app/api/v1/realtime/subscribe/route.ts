// ---------------------------------------------------------------------------
// SSE Subscription Endpoint — Enterprise Real-Time Updates
// ---------------------------------------------------------------------------
// Establishes a long-lived SSE connection.
// Authenticates via session, validates tenant isolation.
// Sends heartbeat every 15s for connection health.
//
// Channels:
//   dashboard — KPIs, counts, health
//   notification — new notifications, unread count
//   approval — approval status changes
//   workflow — workflow lifecycle events
//   queue — background job events
//   treasury — balance updates (display only)
//   connector — sync events
//   audit — high-severity audit events
//
// Usage from client:
//   const source = new EventSource("/api/v1/realtime/subscribe");
//   source.addEventListener("workflow:completed", (e) => { ... });
//   source.addEventListener("notification:count", (e) => { ... });

import { NextRequest } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { createSseConnection, closeSseConnection } from "@/server/realtime";
import { logger } from "@/lib/logger";
import { rbacService } from "@/modules/rbac/rbac.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(
      session?.user?.id,
      session?.user?.activeCompanyId,
      session?.user?.companyRole,
    );
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'admin.settings');

    // Parse requested channels from query
    const { searchParams } = new URL(request.url);
    const requestedChannels = searchParams.get("channels")?.split(",") ?? [];

    // Validate requested channels
    const validChannels = new Set([
      "dashboard",
      "notification",
      "approval",
      "workflow",
      "queue",
      "treasury",
      "connector",
      "audit",
      "system",
    ]);

    const channels = requestedChannels.filter((c) => validChannels.has(c));
    // Always include system for heartbeat
    if (!channels.includes("system")) channels.push("system");

    // Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        const connectionId = createSseConnection(
          ctx.companyId,
          ctx.userId,
          controller,
        );

        logger.info(
          {
            connectionId,
            tenantId: ctx.companyId,
            userId: ctx.userId,
            channels,
          },
          "[SSE] Connection established",
        );

        // Send initial connection event
        const encoder = new TextEncoder();
        const initData = JSON.stringify({
          connectionId,
          channels,
          connectedAt: new Date().toISOString(),
        });
        controller.enqueue(encoder.encode(`event: connected\ndata: ${initData}\n\n`));

        // Store connection for cleanup on request abort
        request.signal.addEventListener("abort", () => {
          closeSseConnection(connectionId);
          logger.info(
            { connectionId, tenantId: ctx.companyId },
            "[SSE] Connection closed",
          );
        });
      },
      cancel() {
        // Cleanup handled by abort listener
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    logger.error(err, "[SSE] Subscription error");
    return new Response(
      `event: error\ndata: ${JSON.stringify({ error: "Unauthorized" })}\n\n`,
      {
        status: 401,
        headers: { "Content-Type": "text/event-stream" },
      },
    );
  }
}
