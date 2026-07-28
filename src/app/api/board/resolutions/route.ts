import { NextResponse } from "next/server";
import { BoardGovernanceFacade } from "@/modules/board-governance";
import { rbacService } from "@/modules/rbac/rbac.service";
import { handleRouteError, zodErrorResponse, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import {
  createResolutionSchema,
  resolutionListQuerySchema,
} from "@/lib/validations/board-governance";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const url = new URL(req.url);
      const queryResult = resolutionListQuerySchema.safeParse(
        Object.fromEntries(url.searchParams),
      );
      if (!queryResult.success) return zodErrorResponse(queryResult.error, req);
  
      const result = await BoardGovernanceFacade.listResolutions(ctx.tenant, queryResult.data);
      return NextResponse.json(result, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "board.resolutions");
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = createResolutionSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const result = await BoardGovernanceFacade.createResolution(ctx.tenant, parsed.data);
      return NextResponse.json(result, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
