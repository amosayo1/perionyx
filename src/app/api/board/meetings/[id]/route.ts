import { NextResponse } from "next/server";
import { BoardGovernanceFacade } from "@/modules/board-governance";
import { rbacService } from "@/modules/rbac/rbac.service";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { updateMeetingStatusSchema } from "@/lib/validations/board-governance";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const meeting = await BoardGovernanceFacade.getMeeting(ctx.tenant, id);
      return NextResponse.json(meeting);
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
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "board.meetings");
  
      const body = await parseJsonBody<Record<string, unknown>>(req);
      const parsed = updateMeetingStatusSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const updated = await BoardGovernanceFacade.updateMeetingStatus(ctx.tenant, id, parsed.data);
      return NextResponse.json(updated);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
