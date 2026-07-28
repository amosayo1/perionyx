import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { CloseManagementService } from "@/modules/controller-specialist/close-management";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const period = await CloseManagementService.getClosePeriod(ctx.tenant, id);
      return NextResponse.json(period, { headers: cacheHeaders(15) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
