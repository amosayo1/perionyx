import { NextResponse } from "next/server";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { TodaysWorkService } from "@/modules/todays-work/todays-work-service";
import { cacheHeaders } from "@/server/http/handle-route";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    const service = new TodaysWorkService();
    const result = await service.getTodaysWork(ctx.tenant.companyId);
    return NextResponse.json(result, { headers: cacheHeaders(15) });
  });
}
