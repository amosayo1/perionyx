import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { isQueueRunning } from "@/modules/queue/queue.service";
import { noCacheHeaders } from "@/server/http/handle-route";

if (!global.__perionyx_startedAt) {
  global.__perionyx_startedAt = Date.now();
}

export const dynamic = "force-dynamic";

export async function GET() {
  let healthy = true;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    healthy = false;
  }

  try {
    const running = isQueueRunning();
    if (!running) healthy = false;
  } catch {
    healthy = false;
  }

  return NextResponse.json(
    { status: healthy ? "healthy" : "degraded", ready: healthy, live: true },
    {
      status: healthy ? 200 : 503,
      headers: { ...noCacheHeaders() },
    },
  );
}
