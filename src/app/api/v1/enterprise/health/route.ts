import { NextResponse } from "next/server";
import { healthManager } from "@/server/health/health-manager";
import { cacheHeaders } from "@/server/http/handle-route";
import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";

interface CheckResult {
  status: "ok" | "error" | "skipped";
  detail?: string;
}

export async function GET() {
  const checks: Record<string, CheckResult> = {};
  let healthy = true;

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: "ok" };
  } catch (err) {
    checks.database = { status: "error", detail: String(err) };
    healthy = false;
  }

  const cachePing = await (await import("@/server/cache/cache-manager")).cacheManager.ping();
  checks.cache = { status: cachePing ? "ok" : "error", detail: cachePing ? undefined : "Cache provider unreachable" };
  if (!cachePing) healthy = false;

  const { isQueueRunning } = await import("@/modules/queue/queue.service");
  try {
    const running = isQueueRunning();
    checks.queueWorker = { status: running ? "ok" : "error", detail: running ? undefined : "PgBoss worker not started" };
    if (!running) healthy = false;
  } catch (err) {
    checks.queueWorker = { status: "error", detail: String(err) };
    healthy = false;
  }

  const health = await healthManager.getFullHealthReport();

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      ready: healthy,
      live: true,
      checks,
      services: health.services,
      meta: {
        upSince: global.__perionyx_startedAt ? new Date(global.__perionyx_startedAt as number).toISOString() : null,
        uptime: Math.floor(process.uptime()),
        version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0",
        node: process.version,
      },
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503, headers: { ...cacheHeaders(30) } },
  );
}

declare global {
  var __perionyx_startedAt: number | undefined;
}
