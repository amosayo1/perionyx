import { NextResponse } from "next/server";
import { BoardGovernanceFacade } from "@/modules/board-governance";
import { rbacService } from "@/modules/rbac/rbac.service";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { addAgendaItemSchema } from "@/lib/validations/board-governance";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const result = await BoardGovernanceFacade.listAgendaItems(ctx.tenant, id);
      return NextResponse.json(result);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "board.meetings");
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = addAgendaItemSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const item = await BoardGovernanceFacade.addAgendaItem(ctx.tenant, parsed.data);
      return NextResponse.json(item, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
