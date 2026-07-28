import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { StatementReadinessService } from "@/modules/controller-specialist/statement-readiness";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const period = searchParams.get("period");
  
      if (!period) {
        return NextResponse.json(
          { error: { code: "VALIDATION", message: "period query parameter is required" } },
          { status: 400 },
        );
      }
  
      const summary = await StatementReadinessService.getReadinessSummary(ctx.tenant, period);
      return NextResponse.json(summary, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
