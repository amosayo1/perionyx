import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError, zodErrorResponse } from "@/server/http/handle-route";
import { getAuditAnalyticsSchema } from "@/lib/validations/audit-specialist";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const params = Object.fromEntries(searchParams.entries());
  
      const parsed = getAuditAnalyticsSchema.safeParse(params);
      if (!parsed.success) {
        return zodErrorResponse(parsed.error, req);
      }
  
      const data = { analytics: {}, filters: parsed.data };
      return NextResponse.json(data, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
