import { NextResponse } from "next/server";
import { AutomationStudioService } from "@/modules/automation-studio/automation-studio.service";
import { createScheduleSchema } from "@/lib/validations/automation-studio";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const service = new AutomationStudioService();

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'automation.schedule');
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = createScheduleSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const schedule = await service.createSchedule(ctx.tenant, parsed.data);
      return NextResponse.json(schedule, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
