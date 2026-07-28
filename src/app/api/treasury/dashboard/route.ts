import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { TreasurySpecialistService } from "@/modules/treasury-specialist/treasury-specialist";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const dashboard = await TreasurySpecialistService.getDashboard(ctx.tenant);
      return NextResponse.json(dashboard, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
