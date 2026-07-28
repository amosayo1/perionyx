import { NextResponse } from "next/server";
import { ExecutiveCommandCenter } from "@/modules/executive-command-center";
import { handleRouteError } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const url = new URL(req.url);
      const domain = url.searchParams.get("domain");
      if (!domain) {
        return NextResponse.json({ error: "domain query parameter is required" }, { status: 400 });
      }
      const entityId = url.searchParams.get("entityId") ?? undefined;
  
      const result = await ExecutiveCommandCenter.getDrillDown(ctx.tenant, domain, entityId);
      return NextResponse.json(result);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
