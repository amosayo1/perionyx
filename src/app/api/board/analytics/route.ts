import { NextResponse } from "next/server";
import { BoardGovernanceFacade } from "@/modules/board-governance";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const url = new URL(req.url);
      const boardId = url.searchParams.get("boardId") ?? undefined;
  
      const [dashboard, healthScore, meetingEffectiveness] = await Promise.all([
        BoardGovernanceFacade.getDashboard(ctx.tenant, boardId),
        BoardGovernanceFacade.getHealthScore(ctx.tenant),
        BoardGovernanceFacade.getMeetingEffectiveness(ctx.tenant),
      ]);
  
      return NextResponse.json(
        { dashboard, healthScore, meetingEffectiveness },
        { headers: cacheHeaders(30) },
      );
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
