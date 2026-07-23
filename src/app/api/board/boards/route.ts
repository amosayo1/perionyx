import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { BoardGovernanceFacade } from "@/modules/board-governance";
import { rbacService } from "@/modules/rbac/rbac.service";
import { handleRouteError, zodErrorResponse, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import { createBoardSchema, boardListQuerySchema } from "@/lib/validations/board-governance";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const url = new URL(req.url);
    const queryResult = boardListQuerySchema.safeParse(
      Object.fromEntries(url.searchParams),
    );
    if (!queryResult.success) return zodErrorResponse(queryResult.error, req);

    const result = await BoardGovernanceFacade.listBoards(ctx, queryResult.data);
    return NextResponse.json(result, { headers: cacheHeaders(30) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "board.manage");

    const body = await parseJsonBody<unknown>(req);
    const parsed = createBoardSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    const result = await BoardGovernanceFacade.createBoard(ctx, parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
