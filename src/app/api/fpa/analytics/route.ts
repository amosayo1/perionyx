import { NextResponse } from "next/server";
import { FPASpecialistService } from "@/modules/fpa-specialist";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const result = await FPASpecialistService.getAnalytics(ctx.tenant);
      return NextResponse.json(result, { headers: cacheHeaders(60) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
