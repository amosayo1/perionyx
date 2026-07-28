import { NextResponse } from "next/server";
import { ExecutiveCommandCenter } from "@/modules/executive-command-center";
import { handleRouteError } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const result = await ExecutiveCommandCenter.getPerformanceMetrics(ctx.tenant);
      return NextResponse.json(result);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
