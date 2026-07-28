import { NextResponse } from "next/server";
import { BoardGovernanceFacade } from "@/modules/board-governance";
import { rbacService } from "@/modules/rbac/rbac.service";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { castVoteSchema } from "@/lib/validations/board-governance";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "board.resolutions");
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = castVoteSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const vote = await BoardGovernanceFacade.castVote(ctx.tenant, parsed.data);
      return NextResponse.json(vote, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
