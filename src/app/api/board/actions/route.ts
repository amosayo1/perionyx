import { NextResponse } from "next/server";
import { BoardGovernanceFacade } from "@/modules/board-governance";
import { rbacService } from "@/modules/rbac/rbac.service";
import { handleRouteError, zodErrorResponse, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import {
  createActionItemSchema,
  updateActionItemSchema,
  actionListQuerySchema,
} from "@/lib/validations/board-governance";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const url = new URL(req.url);
      const queryResult = actionListQuerySchema.safeParse(
        Object.fromEntries(url.searchParams),
      );
      if (!queryResult.success) return zodErrorResponse(queryResult.error, req);
  
      const result = await BoardGovernanceFacade.listActions(ctx.tenant, queryResult.data);
      return NextResponse.json(result, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "board.actions");
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = createActionItemSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const result = await BoardGovernanceFacade.createAction(ctx.tenant, parsed.data);
      return NextResponse.json(result, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function PUT(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "board.actions");
  
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
  
      const updated = await BoardGovernanceFacade.updateAction(ctx.tenant, id, parsed.data);
      return NextResponse.json(updated);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
