import { NextResponse } from "next/server";
import { BoardGovernanceFacade } from "@/modules/board-governance";
import { rbacService } from "@/modules/rbac/rbac.service";
import { handleRouteError, zodErrorResponse, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import { createMemberSchema } from "@/lib/validations/board-governance";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const url = new URL(req.url);
      const boardId = url.searchParams.get("boardId");
      if (!boardId) {
        return NextResponse.json(
          { error: { code: "VALIDATION", message: "boardId query parameter is required" } },
          { status: 400 },
        );
      }
  
      const result = await BoardGovernanceFacade.listMembers(ctx.tenant, boardId, {
        status: url.searchParams.get("status") ?? undefined,
        search: url.searchParams.get("search") ?? undefined,
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
      const parsed = createMemberSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const result = await BoardGovernanceFacade.addMember(ctx.tenant, parsed.data);
      return NextResponse.json(result, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
