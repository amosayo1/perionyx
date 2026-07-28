import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { TreasurySpecialistService } from "@/modules/treasury-specialist/treasury-specialist";
import type { LiquidityHorizon } from "@/modules/treasury-specialist/types";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const horizon = (searchParams.get("horizon") as LiquidityHorizon) ?? "daily";
      const scenario = searchParams.get("scenario") as import("@/modules/treasury-specialist/types").ScenarioType | null;
  
      const result = await TreasurySpecialistService.getLiquidityCenter(ctx.tenant);
      return NextResponse.json(result, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
