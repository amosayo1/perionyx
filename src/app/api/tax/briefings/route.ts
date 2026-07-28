import { NextResponse } from "next/server";
import { TaxSpecialistService } from "@/modules/tax-specialist";
import { handleRouteError, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const url = new URL(req.url);
      const type = url.searchParams.get("type") as any ?? "weekly";
  
      const result = await TaxSpecialistService.getBriefing(ctx.tenant, type);
      return NextResponse.json(result, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const body = await parseJsonBody<unknown>(req);
      const data = body as { type?: string };
  
      const result = await TaxSpecialistService.getBriefing(ctx.tenant, data?.type as any ?? "weekly");
      return NextResponse.json(result, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
