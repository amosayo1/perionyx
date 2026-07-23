import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { BoardGovernanceFacade } from "@/modules/board-governance";
import { rbacService } from "@/modules/rbac/rbac.service";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { addAgendaItemSchema } from "@/lib/validations/board-governance";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const result = await BoardGovernanceFacade.listAgendaItems(ctx, id);
    return NextResponse.json(result);
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "board.meetings");

    const body = await parseJsonBody<unknown>(req);
    const parsed = addAgendaItemSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    const item = await BoardGovernanceFacade.addAgendaItem(ctx, parsed.data);
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
