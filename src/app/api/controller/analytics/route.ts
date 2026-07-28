import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { ControllerSpecialistService } from "@/modules/controller-specialist/controller-specialist";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const analytics = await ControllerSpecialistService.getAnalytics(ctx.tenant);
      return NextResponse.json(analytics, { headers: cacheHeaders(60) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
