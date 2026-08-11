import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { handleRouteError } from "@/server/http/handle-route";
import { TickService } from "@/modules/tick";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * GET /api/v1/tick
 *
 * Global cross-tenant job trigger. Phase 28.1 C-02: the endpoint now fails
 * closed — CRON_SECRET must be configured and presented as a Bearer token,
 * compared in constant time. When CRON_SECRET is unset the endpoint refuses
 * to run rather than exposing a cross-tenant side-effect trigger.
 */
export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || cronSecret.length < 16) {
      return NextResponse.json(
        { error: { code: "NOT_CONFIGURED", message: "Tick endpoint is not configured. Set CRON_SECRET (min 16 chars)." } },
        { status: 503 },
      );
    }

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "") ?? "";

    const tokenBuf = Buffer.from(token);
    const secretBuf = Buffer.from(cronSecret);
    const valid =
      tokenBuf.length === secretBuf.length &&
      crypto.timingSafeEqual(tokenBuf, secretBuf);

    if (!valid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await TickService.run();
    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
