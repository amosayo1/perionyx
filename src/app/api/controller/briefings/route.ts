import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { ControllerSpecialistService } from "@/modules/controller-specialist/controller-specialist";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const briefingType = searchParams.get("briefingType");
      const status = searchParams.get("status");
      const period = searchParams.get("period");
      const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
      const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : undefined;
  
      const result = await ControllerSpecialistService.listBriefings(ctx.tenant, {
        briefingType: briefingType ?? undefined,
        status: status ?? undefined,
        period: period ?? undefined,
        limit,
        offset,
      });
  
      return NextResponse.json(result, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const body = await parseJsonBody<{ date?: string }>(req);
      const date = body.date ? new Date(body.date) : undefined;
  
      const briefing = await ControllerSpecialistService.generateDailyBriefing(ctx.tenant, date);
      return NextResponse.json(briefing, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
