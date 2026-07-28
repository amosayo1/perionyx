import { NextResponse } from "next/server";
import { CFOAdvisorService } from "@/modules/cfo-advisor/cfo-advisor.service";
import { decideActionSchema } from "@/lib/validations/cfo-advisor";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "cfo_advisor.manage");
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = decideActionSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      if (parsed.data.action === "approve") {
        const decision = await CFOAdvisorService.approveDecision(ctx.tenant, id, ctx.tenant.userId);
        return NextResponse.json(decision);
      }
  
      return NextResponse.json(
        { error: { code: "NOT_IMPLEMENTED", message: `Action '${parsed.data.action}' is not yet supported` } },
        { status: 501 },
      );
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
