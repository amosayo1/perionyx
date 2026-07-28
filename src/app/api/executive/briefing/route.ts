import { NextResponse } from "next/server";
import { ExecutiveCommandCenter } from "@/modules/executive-command-center";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const url = new URL(req.url);
      const type = url.searchParams.get("type") as "morning" | "evening" | "weekly" | "adhoc" | null;
  
      const result = await ExecutiveCommandCenter.getExecutiveBriefing(ctx.tenant, type ?? "morning");
      return NextResponse.json(result, { headers: cacheHeaders(120) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
