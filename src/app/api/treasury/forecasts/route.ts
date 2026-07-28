import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { TreasurySpecialistService } from "@/modules/treasury-specialist/treasury-specialist";
import { LiquidityService } from "@/modules/treasury-specialist/liquidity";
import type { LiquidityHorizon, ScenarioType, GenerateBriefingInput } from "@/modules/treasury-specialist/types";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const horizon = (searchParams.get("horizon") as LiquidityHorizon) ?? "daily";
      const scenario = searchParams.get("scenario") as ScenarioType | null;
  
      const result = await TreasurySpecialistService.getForecastCenter(ctx.tenant, horizon);
      return NextResponse.json(result, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const body = await parseJsonBody<{
        briefingType?: string;
        horizon?: string;
        scenario?: string;
        title?: string;
        includeSections?: string[];
        metadata?: Record<string, unknown>;
      }>(req);
  
      const horizon = (body.horizon as LiquidityHorizon) ?? "daily";
      const scenario = (body.scenario as ScenarioType) ?? "expected";
  
      const forecast = await LiquidityService.createForecast(ctx.tenant, horizon, scenario);
      return NextResponse.json(forecast, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
