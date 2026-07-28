import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { AccountingHealthService } from "@/modules/controller-specialist/accounting-health";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const period = searchParams.get("period") ?? undefined;
  
      const snapshot = await AccountingHealthService.getLatestSnapshot(ctx.tenant, period);
      return NextResponse.json(snapshot, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
