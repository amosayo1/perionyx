import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { FinanceCollaborationService } from "@/modules/finance-collaboration";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const data = await FinanceCollaborationService.getCommandCenter(ctx.tenant);
      return NextResponse.json(data, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
