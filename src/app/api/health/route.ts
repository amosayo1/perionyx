import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { isQueueRunning } from "@/modules/queue/queue.service";

if (!global.__perionyx_startedAt) {
  global.__perionyx_startedAt = Date.now();
}

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

  try {
    const running = isQueueRunning();
    checks.queueWorker = { status: running ? "ok" : "error", detail: running ? undefined : "PgBoss worker not started" };
    if (!running) healthy = false;
  } catch (err) {
    checks.queueWorker = { status: "error", detail: String(err) };
    healthy = false;
  }

  const upSince = global.__perionyx_startedAt
    ? new Date(global.__perionyx_startedAt).toISOString()
    : null;

  const memory = process.memoryUsage();

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      ready: healthy,
      live: true,
      checks,
      meta: {
        upSince,
        uptime: process.uptime(),
        memory: {
          heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
          heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
          rss: Math.round(memory.rss / 1024 / 1024),
        },
        node: process.version,
      },
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
