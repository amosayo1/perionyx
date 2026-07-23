import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { AutomationStudioService } from "@/modules/automation-studio/automation-studio.service";
import { createScheduleSchema } from "@/lib/validations/automation-studio";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";

const service = new AutomationStudioService();

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'automation.schedule');

    const body = await parseJsonBody<unknown>(req);
    const parsed = createScheduleSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    const schedule = await service.createSchedule(ctx, parsed.data);
    return NextResponse.json(schedule, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
