import { NextResponse } from "next/server";
import { healthManager } from "@/server/health/health-manager";
import { cacheHeaders } from "@/server/http/handle-route";

export const dynamic = "force-dynamic";

export async function GET() {
  const liveness = await healthManager.getLivenessStatus();
  return NextResponse.json(liveness, { headers: { ...cacheHeaders(0) } });
}
