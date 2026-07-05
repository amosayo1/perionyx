import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { AutomationStudioService } from "@/modules/automation-studio/automation-studio.service";
import { updateScheduleSchema, validationError, notFoundError, serverError } from "@/lib/validations/automation-studio";

const service = new AutomationStudioService();

async function getContext() {
  const session = await auth();
  return requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateScheduleSchema.safeParse({ ...body, id });
    if (!parsed.success) return validationError(parsed.error);

    const schedule = await service.updateSchedule(ctx, id, parsed.data);
    if (!schedule) return notFoundError("Schedule");
    return NextResponse.json(schedule);
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const deleted = await service.deleteSchedule(ctx, id);
    if (!deleted) return notFoundError("Schedule");
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err);
  }
}
