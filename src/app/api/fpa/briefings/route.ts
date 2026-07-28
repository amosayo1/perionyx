import { NextResponse } from "next/server";
import { FPASpecialistService } from "@/modules/fpa-specialist";
import { handleRouteError, zodErrorResponse, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import { getBriefingsQuerySchema, createBriefingSchema } from "@/lib/validations/fpa-specialist";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const url = new URL(req.url);
      const queryResult = getBriefingsQuerySchema.safeParse(
        Object.fromEntries(url.searchParams),
      );
      if (!queryResult.success) return zodErrorResponse(queryResult.error, req);
  
      const briefingType = queryResult.data.briefingType ?? "weekly";
      const result = await FPASpecialistService.getBriefing(ctx.tenant, briefingType);
      return NextResponse.json(result, { headers: cacheHeaders(60) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = createBriefingSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const result = await FPASpecialistService.getBriefing(ctx.tenant, parsed.data.briefingType);
      return NextResponse.json(result, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
