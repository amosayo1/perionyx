import { NextResponse } from "next/server";
import { healthManager } from "@/server/health/health-manager";
import { cacheHeaders } from "@/server/http/handle-route";

export const dynamic = "force-dynamic";

export async function GET() {
  const readiness = await healthManager.getReadinessStatus();
  return NextResponse.json(
    readiness,
    { status: readiness.ready ? 200 : 503, headers: { ...cacheHeaders(0) } },
  );
}
