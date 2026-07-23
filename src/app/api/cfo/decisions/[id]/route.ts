import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { CFOAdvisorService } from "@/modules/cfo-advisor/cfo-advisor.service";
import { decideActionSchema } from "@/lib/validations/cfo-advisor";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "cfo_advisor.manage");

    const body = await parseJsonBody<unknown>(req);
    const parsed = decideActionSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    if (parsed.data.action === "approve") {
      const decision = await CFOAdvisorService.approveDecision(ctx, id, ctx.userId);
      return NextResponse.json(decision);
    }

    return NextResponse.json(
      { error: { code: "NOT_IMPLEMENTED", message: `Action '${parsed.data.action}' is not yet supported` } },
      { status: 501 },
    );
  } catch (err) {
    return handleRouteError(err, req);
  }
}
