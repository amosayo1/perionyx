import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { BoardGovernanceFacade } from "@/modules/board-governance";
import { rbacService } from "@/modules/rbac/rbac.service";
import { handleRouteError, zodErrorResponse, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import {
  createActionItemSchema,
  updateActionItemSchema,
  actionListQuerySchema,
} from "@/lib/validations/board-governance";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const url = new URL(req.url);
    const queryResult = actionListQuerySchema.safeParse(
      Object.fromEntries(url.searchParams),
    );
    if (!queryResult.success) return zodErrorResponse(queryResult.error, req);

    const result = await BoardGovernanceFacade.listActions(ctx, queryResult.data);
    return NextResponse.json(result, { headers: cacheHeaders(30) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "board.actions");

    const body = await parseJsonBody<unknown>(req);
    const parsed = createActionItemSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    const result = await BoardGovernanceFacade.createAction(ctx, parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "board.actions");

    const body = await parseJsonBody<Record<string, unknown>>(req);
    const id = body.id as string;
    if (!id) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "id is required in body" } },
        { status: 400 },
      );
    }

    const parsed = updateActionItemSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    const updated = await BoardGovernanceFacade.updateAction(ctx, id, parsed.data);
    return NextResponse.json(updated);
  } catch (err) {
    return handleRouteError(err, req);
  }
}
