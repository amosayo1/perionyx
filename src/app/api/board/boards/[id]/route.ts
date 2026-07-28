import { NextResponse } from "next/server";
import { BoardGovernanceFacade } from "@/modules/board-governance";
import { rbacService } from "@/modules/rbac/rbac.service";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { updateBoardSchema } from "@/lib/validations/board-governance";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const board = await BoardGovernanceFacade.getBoard(ctx.tenant, id);
      return NextResponse.json(board);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "board.manage");
  
      const body = await parseJsonBody<Record<string, unknown>>(req);
      const parsed = updateBoardSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const updated = await BoardGovernanceFacade.updateBoard(ctx.tenant, id, parsed.data);
      return NextResponse.json(updated);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "board.manage");
  
      await BoardGovernanceFacade.deleteBoard(ctx.tenant, id);
      return NextResponse.json({ success: true });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
