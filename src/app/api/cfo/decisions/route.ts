import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { CFOAdvisorService } from "@/modules/cfo-advisor/cfo-advisor.service";
import { createDecisionSchema } from "@/lib/validations/cfo-advisor";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "cfo_advisor.read");

    const url = new URL(req.url);
    const decisionType = url.searchParams.get("decisionType") as string | undefined;
    const status = url.searchParams.get("status") as string | undefined;
    const riskLevel = url.searchParams.get("riskLevel") as string | undefined;
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "20");

    const result = await CFOAdvisorService.getDecisions(ctx, {
      decisionType: decisionType as any,
      status: status as any,
      riskLevel: riskLevel as any,
      page,
      limit,
    });
    return NextResponse.json(result);
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "cfo_advisor.manage");

    const body = await parseJsonBody<unknown>(req);
    const parsed = createDecisionSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    const decision = await CFOAdvisorService.createDecision(ctx, parsed.data);
    return NextResponse.json(decision, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
