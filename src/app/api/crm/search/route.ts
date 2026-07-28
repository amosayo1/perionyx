import { NextResponse } from "next/server";
import { relationshipIntelligenceService } from "@/modules/crm";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const url = new URL(req.url);
      const q = url.searchParams.get("q");
  
      if (!q || q.trim().length === 0) {
        return NextResponse.json({ error: "q query parameter is required" }, { status: 400 });
      }
  
      const region = url.searchParams.get("region") ?? undefined;
      const relationshipStage = url.searchParams.get("relationshipStage") ?? undefined;
      const industry = url.searchParams.get("industry") ?? undefined;
  
      const results = await relationshipIntelligenceService.searchContacts(ctx.tenant.companyId, q.trim(), {
        region: region || undefined,
        relationshipStage: relationshipStage || undefined,
        industry: industry || undefined,
      });
  
      return NextResponse.json(results, { headers: cacheHeaders(10) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
