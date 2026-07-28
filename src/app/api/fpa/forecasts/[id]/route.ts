import { NextResponse } from "next/server";
import { ForecastService } from "@/modules/fpa-specialist";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const [versions, accuracy] = await Promise.all([
        ForecastService.getVersions(ctx.tenant, id),
        ForecastService.getForecastAccuracy(ctx.tenant, id),
      ]);
  
      return NextResponse.json({ forecastId: id, versions, accuracy }, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
