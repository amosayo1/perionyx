import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { BoardGovernanceFacade } from "@/modules/board-governance";
import { rbacService } from "@/modules/rbac/rbac.service";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { updateMeetingStatusSchema } from "@/lib/validations/board-governance";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const meeting = await BoardGovernanceFacade.getMeeting(ctx, id);
    return NextResponse.json(meeting);
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "board.meetings");

    const body = await parseJsonBody<Record<string, unknown>>(req);
    const parsed = updateMeetingStatusSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    const updated = await BoardGovernanceFacade.updateMeetingStatus(ctx, id, parsed.data);
    return NextResponse.json(updated);
  } catch (err) {
    return handleRouteError(err, req);
  }
}
