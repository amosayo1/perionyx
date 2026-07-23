// ---------------------------------------------------------------------------
// Real-Time System Health — Connection pool, heartbeats, Redis Pub/Sub
// ---------------------------------------------------------------------------
import { NextResponse } from "next/server";
import { getSseStats, cleanupStaleConnections } from "@/server/realtime";
import { pingRedis } from "@/server/cache/redis";
import { auth } from "@/server/auth/auth";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cleaned = cleanupStaleConnections();

  return NextResponse.json({
    healthy: true,
    activeConnections: getSseStats().activeConnections,
    staleConnectionsCleaned: cleaned,
    redisAvailable: await pingRedis(),
    timestamp: new Date().toISOString(),
  });
}
