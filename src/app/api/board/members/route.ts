import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { BoardGovernanceFacade } from "@/modules/board-governance";
import { rbacService } from "@/modules/rbac/rbac.service";
import { handleRouteError, zodErrorResponse, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import { createMemberSchema } from "@/lib/validations/board-governance";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const url = new URL(req.url);
    const boardId = url.searchParams.get("boardId");
    if (!boardId) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "boardId query parameter is required" } },
        { status: 400 },
      );
    }

    const result = await BoardGovernanceFacade.listMembers(ctx, boardId, {
      status: url.searchParams.get("status") ?? undefined,
      search: url.searchParams.get("search") ?? undefined,
      page: url.searchParams.get("page") ? parseInt(url.searchParams.get("page")!, 10) : undefined,
      limit: url.searchParams.get("limit") ? parseInt(url.searchParams.get("limit")!, 10) : undefined,
    });
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
    const parsed = createMemberSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    const result = await BoardGovernanceFacade.addMember(ctx, parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
