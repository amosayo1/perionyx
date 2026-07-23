import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { BoardGovernanceFacade } from "@/modules/board-governance";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const url = new URL(req.url);
    const boardId = url.searchParams.get("boardId") ?? undefined;

    const [dashboard, healthScore, meetingEffectiveness] = await Promise.all([
      BoardGovernanceFacade.getDashboard(ctx, boardId),
      BoardGovernanceFacade.getHealthScore(ctx),
      BoardGovernanceFacade.getMeetingEffectiveness(ctx),
    ]);

    return NextResponse.json(
      { dashboard, healthScore, meetingEffectiveness },
      { headers: cacheHeaders(30) },
    );
  } catch (err) {
    return handleRouteError(err, req);
  }
}
