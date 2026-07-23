import { type NextRequest, NextResponse } from "next/server";
import { getCacheStats, resetCacheStats } from "@/server/cache/cache-service";
import { pingRedis } from "@/server/cache/redis";
import { handleRouteError } from "@/server/http/handle-route";
import { requirePermission } from "@/server/security/require-permission";

export async function GET(_req: NextRequest) {
  try {
    await requirePermission(_req, "admin.settings");

    const stats = getCacheStats();
    const healthy = await pingRedis();

    return NextResponse.json({
      healthy,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return handleRouteError(err, _req);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission(req, "admin.settings");

    const body = await req.json().catch(() => ({}));
    if (body.action === "reset") {
      resetCacheStats();
    }
    return NextResponse.json({ ok: true, message: "Cache stats reset" });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
