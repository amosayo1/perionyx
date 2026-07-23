import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { AutomationStudioService } from "@/modules/automation-studio/automation-studio.service";
import { updateScheduleSchema } from "@/lib/validations/automation-studio";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";

const service = new AutomationStudioService();

async function getContext() {
  const session = await auth();
  return requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getContext();
    const { id } = await params;
    const body = await parseJsonBody<Record<string, unknown>>(req);
    const parsed = updateScheduleSchema.safeParse({ ...body, id });
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    const schedule = await service.updateSchedule(ctx, id, parsed.data);
    if (!schedule) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Schedule not found" } }, { status: 404 });
    return NextResponse.json(schedule);
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ctx = await getContext();
    const { id } = await params;
    const deleted = await service.deleteSchedule(ctx, id);
    if (!deleted) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Schedule not found" } }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
