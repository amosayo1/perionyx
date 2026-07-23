import { NextResponse } from "next/server";
import { getAlertStats } from "@/server/alerting/alert-manager";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { requireAuth } from "@/server/security/require-permission";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAuth(request);
    const stats = await getAlertStats();
    return NextResponse.json(stats, { headers: { ...cacheHeaders(15) } });
  } catch (err) {
    return handleRouteError(err, request);
  }
}
