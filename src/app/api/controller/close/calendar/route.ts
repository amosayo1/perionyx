import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { CloseManagementService } from "@/modules/controller-specialist/close-management";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const year = searchParams.get("year") ? parseInt(searchParams.get("year")!, 10) : undefined;
  
      const calendar = await CloseManagementService.getCloseCalendar(ctx.tenant, year);
      return NextResponse.json(calendar, { headers: cacheHeaders(60) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
