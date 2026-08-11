import { NextResponse } from "next/server";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { DashboardV2CompositionService } from "@/modules/dashboard/composition.service";
import { cacheHeaders } from "@/server/http/handle-route";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    const service = new DashboardV2CompositionService();
    const result = await service.getDashboardData(ctx.tenant);
    return NextResponse.json(result, { headers: cacheHeaders(15) });
  });
}
