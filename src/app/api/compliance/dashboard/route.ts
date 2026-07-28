import { NextResponse } from "next/server";
import { ComplianceSpecialistService } from "@/modules/compliance-specialist";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const result = await ComplianceSpecialistService.getDashboard(ctx.tenant);
      return NextResponse.json(result, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
