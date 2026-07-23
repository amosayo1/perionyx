import { NextResponse } from "next/server";
import { getQueryStats } from "@/server/observability/database-tracing";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { requireAuth } from "@/server/security/require-permission";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAuth(request);
    const stats = getQueryStats();
    return NextResponse.json(stats, { headers: { ...cacheHeaders(15) } });
  } catch (err) {
    return handleRouteError(err, request);
  }
}
