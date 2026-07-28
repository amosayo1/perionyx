import { NextResponse } from "next/server";
import { BoardGovernanceFacade } from "@/modules/board-governance";
import { rbacService } from "@/modules/rbac/rbac.service";
import { handleRouteError, zodErrorResponse, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import { createBoardPackSchema } from "@/lib/validations/board-governance";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const url = new URL(req.url);
      const result = await BoardGovernanceFacade.listPacks(ctx.tenant, {
        boardId: url.searchParams.get("boardId") ?? undefined,
        status: url.searchParams.get("status") ?? undefined,
        page: url.searchParams.get("page") ? parseInt(url.searchParams.get("page")!, 10) : undefined,
        limit: url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!, 10) : undefined,
      });
      return NextResponse.json(result, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "board.manage");
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = createBoardPackSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const result = await BoardGovernanceFacade.createPack(ctx.tenant, parsed.data);
      return NextResponse.json(result, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
